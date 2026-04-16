# Proyecto de documentacion

Se usa Astro + Starlight

## Configuracion previa

Antes de levantar el proyecto, crea un archivo `.env` en la raiz con la URL del repositorio de docs:

```env
URL_REPO_DOCS=https://github.com/organizacion/repositorio-docs.git
HOST_PORT=8080
SITE_TITLE=Documentacion
```

Si el repositorio es privado la URL se debera construir añadiendo un `Personal Access Token` con permiso de `repo` de esta forma:  

```text
https://ghp_TokenSecretoAqui@github.com/organizacion/repositorio-docs.git
```

## Personalizacion

Para personalizar la instancia se debe incluir en el repositorio de la documentación:

- `theme/logo.png`: para cambiar el logo
- `theme/style.css`: para personalizar los estilos. El ejemplo del archivo CSS con las variables a cambiar esta en `default/style.css`

Si no se incluye alguno de estos archivos se usaran los de por defecto, ubicados en: `default/`

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
3. `npm run docs:sync`
4. `npm run dev`
