# Proyecto de Documentación

Generador de sitios de documentación construido con [Astro](https://astro.build/) y [Starlight](https://starlight.astro.build/).

## Configuración previa

Antes de levantar el proyecto, crea un archivo `.env` en la raíz con la configuración básica:

```env
URL_REPO_DOCS=https://github.com/organizacion/repositorio-docs.git
HOST_PORT=8080
SITE_TITLE=Documentacion
```

> **Nota:** Si el repositorio es privado, la URL se debe construir añadiendo un *Personal Access Token* (PAT) con permisos de lectura (`repo`) de la siguiente forma:
> `https://<TOKEN_AQUI>@github.com/organizacion/repositorio-docs.git`

## Personalización

Para personalizar la apariencia, se deben incluir los siguientes archivos directamente **en el repositorio de la documentación**:

- `theme/logo.png`: Para cambiar el logo del sitio.
- `theme/style.css`: Para sobreescribir los estilos base. El ejemplo de las variables CSS disponibles está en `default/style.css`.

Si no se incluyen estos archivos, se usarán los valores por defecto almacenados en `default/`.

## Comandos

Todos los comandos se ejecutan desde la raíz del proyecto:

| Comando                   | Acción                                                     |
| :------------------------ | :--------------------------------------------------------- |
| `npm install`             | Instala las dependencias                                   |
| `npm run docs:sync`       | Sincroniza `src/content/docs` desde el repo configurado    |
| `npm run dev`             | Sincroniza docs + inicia el servidor local                 |
| `npm run build`           | Sincroniza docs + compila el proyecto en `./dist/`         |
| `npm run preview`         | Previsualiza el build localmente                           |
| `npm run astro ...`       | Ejecuta comandos CLI de Astro (`astro add`, `astro check`) |
| `npm run astro -- --help` | Muestra ayuda de Astro CLI                                 |

## Desarrollo local

El flujo recomendado para trabajar localmente es:

1. `npm install`
2. Configurar `.env`
3. `npm run docs:sync`
4. `npm run dev`
