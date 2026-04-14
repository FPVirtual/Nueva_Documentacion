import "dotenv/config";
import cp from "node:child_process";
import fs from "node:fs";

const repoUrl = process.env.URL_REPO_DOCS

if(!repoUrl) {
    console.error('Variable de entorno URL_REPO_DOCS no definida')
    process.exit(1);
}

try {
    console.log('Eliminando carpeta de documentación anterior...')
    fs.rmSync('src/content/docs', { recursive: true, force: true })

    console.log('Clonando repositorio de documentación...')
    cp.execSync(`git clone ${repoUrl} src/content/docs`, { stdio: 'inherit' });

    console.log('Documentación sincronizada correctamente')
} catch (error) {
    console.error('Error al sincronizar la documentación:', error);
    process.exit(1);
}