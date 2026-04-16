import "dotenv/config";
import cp from "node:child_process";
import fs from "node:fs";

const repoUrl = process.env.URL_REPO_DOCS;

if (!repoUrl) {
  console.error("Variable de entorno URL_REPO_DOCS no definida");
  process.exit(1);
}

try {
  // Eliminar la carpeta de documentación anterior
  console.log("Eliminando carpeta de documentación anterior...");
  fs.rmSync("src/content/docs", { recursive: true, force: true });

  // Clonar el repositorio de documentación
  console.log("Clonando repositorio de documentación...");
  const resultado = cp.spawnSync(
    "git",
    ["clone", repoUrl, "src/content/docs"],
    {
      encoding: "utf-8",
    },
  );
  // Error al ejecutar el comando Git
  if (resultado.error) {
    const mensaje = resultado.error.message;
    throw new Error(`Fallo en el sistema al ejecutar Git -> ${mensaje}`);
  }
  // Error ejecutando Git
  if (resultado.status !== 0) {
    const mensaje = resultado.stderr || resultado.stdout || "Error desconocido";

    throw new Error(
      `El proceso de clonado falló con codigo ${resultado.status}\n---\n${mensaje}---`,
    );
  }

  // Proceso de sincronización exitoso
  console.log("Documentación sincronizada correctamente");
} catch (error) {
  console.error(`❌ Error al sincronizar la documentación:\n${error.message}`);
  process.exit(1);
}
