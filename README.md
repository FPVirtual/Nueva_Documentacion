# Proyecto de documentacion

Se usa Astro + Starlight

## Configuracion previa

### Local

Antes de levantar el proyecto, crea un archivo `.env` en la raiz con la URL del repositorio de docs:

```env
URL_REPO_DOCS=https://github.com/organizacion/repositorio-docs.git
```

### Produccion

Crea un secreto en el repositorio con clave `URL_REPO_DOCS` y con valor la URL del repositorio de docs.

Si el repositorio es privado la URL se debera construir añadiendo un `Personal Access Token` con permiso de `repo` de esta forma:  
```
https://ghp_TokenSecretoAqui@github.com/organizacion/repositorio-docs.git
```

## Estructura básica

```
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
| `npm run dev`             | Inicia servidor local en `localhost:4321`                  |
| `npm run build`           | Genera build de produccion en `./dist/`                    |
| `npm run preview`         | Previsualiza el build localmente                           |
| `npm run astro ...`       | Ejecuta comandos CLI de Astro (`astro add`, `astro check`) |
| `npm run astro -- --help` | Muestra ayuda de Astro CLI                                 |

## Desarrollo local

Para desarrollo local, el flujo recomendado es:

1. `npm install`
2. Configurar `.env`
3. `npm run docs:sync` para descargar automaticamente el repositorio de documentación especificado en `src/content/docs`
4. `npm run dev`
