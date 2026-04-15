# Proyecto de documentacion

Se usa Astro + Starlight

## Configuracion previa

### Una sola documentacion (local o una instancia)

Antes de levantar el proyecto, crea un archivo `.env` en la raiz con la URL del repositorio de docs:

```env
URL_REPO_DOCS=https://github.com/organizacion/repositorio-docs.git
HOST_PORT=8080
SITE_TITLE=Documentacion
LOGO_NAME=logo.png
STYLESHEET_NAME=style.css
```

Si el repositorio es privado la URL se debera construir añadiendo un `Personal Access Token` con permiso de `repo` de esta forma:  

```text
https://ghp_TokenSecretoAqui@github.com/organizacion/repositorio-docs.git
```

### Multiples documentaciones (varias instancias)

Para correr varias documentaciones en paralelo, usa el archivo `docker-compose.multi-docs.yaml` y configura cada servicio dentro de ese archivo (repo, logo, stylesheet, titulo y puerto).

## Estructura básica

```text
├── public/
├── src/
│   ├── assets/
│   ├── content/
│   │   └── docs/
│   └── content.config.ts
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## Comandos

Todos los comandos se ejecutan desde la raiz del proyecto:

| Comando                   | Accion                                                     |
| :------------------------ | :--------------------------------------------------------- |
| `npm install`             | Instala dependencias                                       |
| `npm run docs:sync`       | Sincroniza `src/content/docs` desde el repo configurado    |
| `npm run dev`             | Sincroniza docs + inicia en `4321`                         |
| `npm run build`           | Sincroniza docs + build en `./dist/`                       |
| `npm run preview`         | Previsualiza el build localmente                           |
| `npm run astro ...`       | Ejecuta comandos CLI de Astro (`astro add`, `astro check`) |
| `npm run astro -- --help` | Muestra ayuda de Astro CLI                                 |

## Desarrollo local

Para desarrollo local, el flujo recomendado es:

1. `npm install`
2. Configurar `.env`
3. `npm run dev`

`predev` ejecuta automaticamente la sincronizacion.
