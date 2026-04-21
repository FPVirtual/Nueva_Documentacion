import "dotenv/config";
import cp from "node:child_process";
import fs from "node:fs";
import path from "node:path";

// Env
const repoUrl = process.env.URL_REPO_DOCS;
const repoBranch = process.env.BRANCH_REPO_DOCS || "main";
const repoPath = process.env.PATH_REPO_DOCS || "";
const gitDir = path.resolve("src/content/.docs_git");
const docsDir = path.resolve("src/content/docs");

// Argumentos
const force = process.argv.includes("--force") || process.argv.includes("-f");

// Main
main();

function main() {
  if (!repoUrl) {
    console.error("Variable de entorno URL_REPO_DOCS no definida");
    process.exit(1);
  }

  try {
    if (isGitRepository(gitDir) && !force) {
      const currentOriginUrl = getCurrentOriginUrl();

      if (!currentOriginUrl) {
        console.log("No se detectó remoto origin, se volverá a clonar.");
        resetGitDirectory();
        cloneDocs();
      } else if (currentOriginUrl === repoUrl) {
        console.log(
          "El directorio de documentación ya existe y apunta al mismo repositorio, intentando sincronizar...",
        );
        pullDocs();
      } else {
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
    fs.writeFileSync("src/content/docs/.gitkeep", "");
  }
}

// Funciones
function isGitRepository(directory) {
  return fs.existsSync(path.join(directory, ".git"));
}

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

function resetGitDirectory() {
  fs.rmSync(gitDir, { recursive: true, force: true });
}

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

function cloneDocs() {
  console.log(`Clonando repositorio de documentación (rama: ${repoBranch})...`);

  const cloneArgs = ["clone", "-b", repoBranch, "--single-branch"];
  if (repoPath) {
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
    console.log(`Configurando directorio específico: ${repoPath}...`);
    cp.spawnSync("git", ["sparse-checkout", "set", repoPath], { cwd: gitDir });
    cp.spawnSync("git", ["checkout", repoBranch], { cwd: gitDir });
  }
}

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
