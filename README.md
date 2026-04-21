# Proyecto de Documentación

Generador de sitios de documentación construido con [Astro](https://astro.build/) y [Starlight](https://starlight.astro.build/). Sincroniza contenido Markdown desde un repositorio remoto y lo sirve como una plataforma web unificada.

## Desarrollo

### Configuración previa

Antes de levantar el proyecto, crea un archivo `.env` en la raíz con la configuración básica:

```env
URL_REPO_DOCS=https://github.com/organizacion/repositorio-docs.git
HOST_PORT=8080
SITE_TITLE=Documentacion
```

> **Nota:** Si el repositorio es privado, la URL se debe construir añadiendo un *Personal Access Token* (PAT) con permisos de lectura de la siguiente forma:
> `https://<TOKEN_AQUI>@github.com/organizacion/repositorio-docs.git`

### Desarrollo local

El flujo recomendado para trabajar localmente es:

1. `npm install` - Instalar dependencias
2. Completar archivo `.env`
3. `npm run docs:sync` - Sincronizar repositorio de docs
4. `npm run dev` - Levantar servidor

### Comandos disponibles

Todos los comandos se ejecutan desde la raíz del proyecto:

| Comando                   | Acción                                                     |
| :------------------------ | :--------------------------------------------------------- |
| `npm install`             | Instala las dependencias                                   |
| `npm run docs:sync`       | Sincroniza `src/content/docs` desde el repo configurado    |
| `npm run dev`             | Sincroniza docs + inicia el servidor local                 |
| `npm run build`           | Sincroniza docs + compila el proyecto en `./dist/`         |
| `npm run preview`         | Previsualiza el build localmente                           |
| `npm run astro ...`       | Ejecuta comandos CLI de Astro (`astro add`, `astro check`) |

## Uso con Docker

```yaml
services:
  starlight-docs:
    image: rsvisu/fpvirtual-documentacion:static
    restart: unless-stopped
    ports:
      - "4321:4321"
    environment:
      - URL_REPO_DOCS=https://github.com/organizacion/repositorio-docs.git
      - SITE_TITLE=Documentacion
```

## Personalización

Para personalizar la apariencia del proyecto, se deben incluir los siguientes archivos directamente **en el repositorio de la documentación**:

- `theme/logo.png`: Para cambiar el logo del sitio.
- `theme/style.css`: Para sobreescribir los estilos base. El ejemplo de las variables CSS disponibles está en `default/style.css`.

Si el repositorio de documentación no los provee, se usarán los valores por defecto almacenados en `default/`.