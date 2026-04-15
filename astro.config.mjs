// @ts-check
import "dotenv/config";
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// Variables env:
const repoUrl = process.env.URL_REPO_DOCS ?? "";
const logoName = process.env.LOGO_NAME ?? "logo.png";
const stylesheetName = process.env.STYLESHEET_NAME ?? "style.css";
const siteTitle = process.env.SITE_TITLE ?? "Documentacion";

// Configuracion Starlight:
/** @type {import("@astrojs/starlight/types").StarlightUserConfig} */
const starlightConfig = {
  title: siteTitle,
  social: [{ icon: "github", label: "GitHub", href: repoUrl }],
};

// Si hay logo definido, añdimos la propiedad
if (logoName) {
  starlightConfig.logo = {
    src: `./src/theme/logos/${logoName}`,
  };
}

// Si hay estilos definidos, añdimos la propiedad
if(stylesheetName) {
	starlightConfig.customCss = [
		`./src/theme/styles/${stylesheetName}`,
	]
}

// Configuracion:
// https://astro.build/config
export default defineConfig({
  integrations: [starlight(starlightConfig)],
});
