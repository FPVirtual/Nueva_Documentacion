/**
 * Sincroniza el contenido Markdown desde el repositorio de documentación remoto
 * hacia `src/content/docs`, donde Astro/Starlight lo compila.
 *
 * Estrategia: clona el repo remoto en `.docs_git` (clon incremental si ya existe)
 * y copia los archivos a `docs`. Tolera fallos de red en el `pull` reutilizando
 * la última copia local para no romper el build.
 *
 * Configurable por variables de entorno:
 *   - URL_REPO_DOCS    (obligatoria) URL del repositorio de documentación.
 *   - BRANCH_REPO_DOCS (opcional)    Rama a sincronizar. Por defecto "main".
 *   - PATH_REPO_DOCS   (opcional)    Subcarpeta del repo a usar como raíz de docs.
 *
 * Flags: `--force` / `-f` fuerza un clonado limpio ignorando la copia existente.
 */
import "dotenv/config";
import cp from "node:child_process";
import fs from "node:fs";
import path from "node:path";

// Configuración leída del entorno
const repoUrl = process.env.URL_REPO_DOCS;
const repoBranch = process.env.BRANCH_REPO_DOCS || "main";
const repoPath = process.env.PATH_REPO_DOCS || "";
const gitDir = path.resolve("src/content/.docs_git"); // clon crudo del repo remoto
const docsDir = path.resolve("src/content/docs"); // destino que compila Astro

// Argumentos de línea de comandos
const force = process.argv.includes("--force") || process.argv.includes("-f");

// Punto de entrada
main();

/**
 * Orquesta la sincronización: decide entre pull incremental o clonado limpio,
 * copia el resultado a `docsDir` y termina el proceso con código distinto de 0
 * ante cualquier error irrecuperable.
 */
function main() {
  if (!repoUrl) {
    console.error("Variable de entorno URL_REPO_DOCS no definida");
    process.exit(1);
  }

  try {
    // Reutiliza el clon existente salvo que se fuerce un clonado limpio
    if (isGitRepository(gitDir) && !force) {
      const currentOriginUrl = getCurrentOriginUrl();

      if (!currentOriginUrl) {
        // Clon corrupto o sin remoto: se descarta y se vuelve a clonar
        console.log("No se detectó remoto origin, se volverá a clonar.");
        resetGitDirectory();
        cloneDocs();
      } else if (currentOriginUrl === repoUrl) {
        // Mismo repositorio: basta con actualizar de forma incremental
        console.log(
          "El directorio de documentación ya existe y apunta al mismo repositorio, intentando sincronizar...",
        );
        pullDocs();
      } else {
        // Cambió URL_REPO_DOCS: el clon previo ya no sirve
        console.log(
          "La URL del repositorio cambió. Se eliminará y clonará nuevamente.",
        );
        resetGitDirectory();
        cloneDocs();
      }
    } else {
      console.log("Sincronizando repositorio de documentación...");
      resetGitDirectory();
      cloneDocs();
    }

    copyToDocsDir();
    console.log("Documentación sincronizada correctamente");
  } catch (error) {
    const mensaje = error.message;
    console.error(`❌ Error al sincronizar la documentación:\n${mensaje}`);
    process.exit(1);
  } finally {
    // Garantiza que docsDir exista aunque el repo venga vacío, para que Astro no falle
    fs.writeFileSync("src/content/docs/.gitkeep", "");
  }
}

// Funciones

/**
 * Comprueba si un directorio contiene un repositorio Git.
 * @param {string} directory Ruta a inspeccionar.
 * @returns {boolean} `true` si existe una subcarpeta `.git`.
 */
function isGitRepository(directory) {
  return fs.existsSync(path.join(directory, ".git"));
}

/**
 * Obtiene la URL del remoto `origin` del clon actual.
 * @returns {string|null} La URL, o `null` si no hay remoto o el comando falla.
 */
function getCurrentOriginUrl() {
  const resultado = cp.spawnSync(
    "git",
    ["config", "--get", "remote.origin.url"],
    {
      encoding: "utf-8",
      cwd: gitDir,
    },
  );

  if (resultado.error || resultado.status !== 0) {
    return null;
  }

  return resultado.stdout.trim();
}

/**
 * Deja `gitDir` vacío y listo para un nuevo clonado.
 *
 * Vacía su contenido en lugar de eliminar el propio directorio: cuando `gitDir`
 * es el punto de montaje de un volumen, borrar el directorio falla con EBUSY.
 */
function resetGitDirectory() {
  // Vacía el contenido de gitDir sin eliminar el directorio en sí
  if (!fs.existsSync(gitDir)) {
    fs.mkdirSync(gitDir, { recursive: true });
    return;
  }

  for (const entry of fs.readdirSync(gitDir)) {
    fs.rmSync(path.join(gitDir, entry), { recursive: true, force: true });
  }
}

/**
 * Actualiza el clon existente con un `git pull --ff-only`.
 *
 * No lanza errores: si el pull falla (p. ej. sin red), solo emite una advertencia
 * y continúa con la copia local para no interrumpir el build.
 */
function pullDocs() {
  const resultado = cp.spawnSync(
    "git",
    ["pull", "origin", repoBranch, "--ff-only"],
    {
      encoding: "utf-8",
      cwd: gitDir,
    },
  );

  if (resultado.error) {
    console.warn(
      `⚠️ Advertencia: Fallo en el sistema al ejecutar Git -> ${resultado.error.message}. Se continuará usando la versión local.`,
    );
    return;
  }

  if (resultado.status !== 0) {
    const mensaje = resultado.stderr || resultado.stdout || "Error desconocido";
    console.warn(
      `⚠️ Advertencia: El proceso de sincronización falló (código ${resultado.status}). Es posible que no haya conexión a internet. Se continuará usando la versión local.\n---\n${mensaje.trim()}\n---`,
    );
    return;
  }
}

/**
 * Clona el repositorio remoto en `gitDir`.
 *
 * Cuando se define `PATH_REPO_DOCS`, usa un clon parcial (`--filter=blob:none`)
 * con `sparse-checkout` para descargar únicamente la subcarpeta indicada.
 *
 * @throws {Error} Si el clonado falla (a diferencia del pull, aquí no hay copia
 *   local de la que tirar, por lo que el error es irrecuperable).
 */
function cloneDocs() {
  console.log(`Clonando repositorio de documentación (rama: ${repoBranch})...`);

  const cloneArgs = ["clone", "-b", repoBranch, "--single-branch"];
  if (repoPath) {
    // Clon parcial: difiere la descarga de blobs hasta el sparse-checkout
    cloneArgs.push("--no-checkout", "--filter=blob:none");
  }
  cloneArgs.push(repoUrl, gitDir);

  const resultado = cp.spawnSync("git", cloneArgs, {
    encoding: "utf-8",
  });

  if (resultado.error) {
    throw new Error(
      `Fallo en el sistema al ejecutar Git -> ${resultado.error.message}`,
    );
  }

  if (resultado.status !== 0) {
    const mensaje = resultado.stderr || resultado.stdout || "Error desconocido";
    throw new Error(
      `El proceso de clonado falló con codigo ${resultado.status}\n---\n${mensaje}---`,
    );
  }

  if (repoPath) {
    // Materializa solo la subcarpeta solicitada tras el clon parcial
    console.log(`Configurando directorio específico: ${repoPath}...`);
    cp.spawnSync("git", ["sparse-checkout", "set", repoPath], { cwd: gitDir });
    cp.spawnSync("git", ["checkout", repoBranch], { cwd: gitDir });
  }
}

/**
 * Copia el contenido sincronizado desde `gitDir` (o su subcarpeta `PATH_REPO_DOCS`)
 * hacia `docsDir`, dejándolo listo para Astro. Excluye la carpeta `.git`.
 *
 * @throws {Error} Si la ruta de origen no existe en el repositorio.
 */
function copyToDocsDir() {
  console.log("Copiando archivos a la carpeta de documentación...");

  // Limpiar docsDir primero para evitar mezclar archivos viejos
  fs.rmSync(docsDir, { recursive: true, force: true });
  fs.mkdirSync(docsDir, { recursive: true });

  const sourcePath = repoPath ? path.join(gitDir, repoPath) : gitDir;

  if (!fs.existsSync(sourcePath)) {
    throw new Error(
      `La ruta especificada (${repoPath}) no existe en el repositorio.`,
    );
  }

  fs.cpSync(sourcePath, docsDir, {
    recursive: true,
    filter: (src) => {
      // Ignorar la carpeta .git del repositorio original si se copia todo
      return path.basename(src) !== ".git";
    },
  });
}
