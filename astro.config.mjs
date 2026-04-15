// @ts-check
import "dotenv/config";
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// Variables env:
const repoUrl = process.env.URL_REPO_DOCS ?? "";
const siteTitle = process.env.SITE_TITLE ?? "Documentacion";

// Configuracion:
// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: siteTitle,
      social: [{ icon: "github", label: "GitHub", href: repoUrl }],
      logo: {
        src: `./src/theme/logos/logo.png`,
      },
      customCss: [`./src/theme/styles/custom.css`],
    }),
  ],
});
