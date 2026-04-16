// @ts-check
import "dotenv/config";
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import fs from "node:fs"

// Variables de entorno:
const repoUrl = process.env.URL_REPO_DOCS ?? "https://github.com/withastro/starlight";
const siteTitle = process.env.SITE_TITLE ?? "Docs";

// Rutas de archivos de personalizacion:
const docsLogoPath = "./src/content/docs/theme/logo.png";
const docsCustomCssPath = "./src/content/docs/theme/style.css";

// Verificar si existen los archivos en el repositorio, si no, usar los de por defecto:
const logoSrc = fs.existsSync(docsLogoPath) ? docsLogoPath : "./default/logo.png"
const customCss = fs.existsSync(docsCustomCssPath) ? docsCustomCssPath : "./default/style.css"

// Configuracion:
// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: siteTitle,
      social: [{ icon: "github", label: "GitHub", href: repoUrl }],
      logo: {
        src: logoSrc,
      },
      customCss: [customCss],
    }),
  ],
});
