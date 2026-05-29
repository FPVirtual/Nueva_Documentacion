# Proyecto de Documentación

Generador de sitios de documentación construido con [Astro](https://astro.build/) y [Starlight](https://starlight.astro.build/). Sincroniza contenido Markdown desde un repositorio remoto y lo sirve como una plataforma web unificada.

## Desarrollo

### Configuración previa

Antes de levantar el proyecto, crea un archivo `.env` en la raíz con la configuración básica definida `.env.example`

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

## Despliegue con Docker

La forma recomendada de desplegar en producción es usando la **imagen ya publicada**, sin
necesidad de clonar este repositorio. Basta con un `docker-compose.yaml` que la referencie:

```yaml
services:
  starlight-docs:
    image: rsvisu/fpvirtual-documentacion:latest
    restart: no
    ports:
      - "80:8080"
    environment:
      - URL_REPO_DOCS=https://github.com/organizacion/repositorio-docs.git
      - BRANCH_REPO_DOCS=main
      - PATH_REPO_DOCS=src/docs
      - SITE_TITLE=Documentacion
```

Todas las variables de entorno disponibles están definidas en `.env.example`

> **Nota sobre los dos `docker-compose`:** El `docker-compose.yaml` incluido en este
> repositorio es de **desarrollo**: usa `build: context: .` para construir la imagen
> localmente a partir del código fuente, por lo que requiere tener el repositorio clonado.
> Para **producción** se usa el ejemplo de arriba, que consume directamente la imagen
> publicada en el registro.

## Redespliegue automático al actualizar la documentación

> **Importante:** El contenedor sincroniza y compila la documentación desde `URL_REPO_DOCS`
> **únicamente al arrancar** (ver `entrypoint.sh`, que ejecuta `npm run build`). El resultado
> es un sitio estático servido por Nginx.

Esto implica que **un contenedor que ya está en ejecución no detecta los nuevos commits**
del repositorio de contenido. Para que los cambios se publiquen, el contenedor debe
**reiniciarse o recrearse**, de forma que vuelva a sincronizar el contenido y recompilar el
sitio.

> **Nota:** Cuando solo cambia el *contenido* de la documentación **no es necesario reconstruir
> la imagen**; basta con recrear el contenedor para que vuelva a sincronizar. Reconstruir la
> imagen solo hace falta cuando cambia este proyecto (el "motor"), lo cual ya se publica
> automáticamente con el workflow `.github/workflows/docker-publish.yml`.

### Cómo recrear el contenedor

Según el modo de despliegue, hay dos formas de hacerlo:

- **Producción (imagen publicada, sin clonar el repo):** se usa el `docker-compose.yaml` de
  producción (el del ejemplo anterior) y se recrea el contenedor. El proyecto incluye el script
  `redeploy.sh` para automatizarlo:

  ```bash
  docker compose pull                      # Descarga la última versión de la imagen
  docker compose up -d --force-recreate    # Recrea el contenedor (re-sincroniza el contenido)
  docker image prune -f                    # Limpia imágenes huérfanas
  ```

- **Desarrollo / build desde el código fuente (repo clonado):** se usa el `deploy.sh`
  incluido, que además actualiza el "motor" y reconstruye la imagen localmente:

  ```bash
  git pull origin main             # Actualiza el "motor" (este proyecto)
  docker compose up -d --build     # Reconstruye y recrea el contenedor
  docker image prune -f            # Limpia imágenes huérfanas
  ```

En ambos casos, al recrearse el contenedor el `entrypoint.sh` vuelve a sincronizar y compilar
el contenido, publicando así la última versión de la documentación.

### Automatización al hacer commit en la documentación

Para automatizar la publicación se debe añadir, **en el repositorio de la documentación**
(no en este), un mecanismo que dispare el redespliegue cada vez que se haga un commit. La
implementación concreta **depende de la plataforma donde esté desplegado el contenedor**:

- **Servidor propio (VPS / on-premise):** un workflow de GitHub Actions (o GitLab CI, etc.)
  que se conecte por SSH y recree el contenedor.
- **Plataformas tipo PaaS (Render, Railway, Coolify, Dokploy…):** suelen ofrecer un
  *Deploy Hook* (una URL) que basta con invocar mediante una petición HTTP desde la acción.
- **Watchtower u orquestadores:** pueden exponer un endpoint HTTP para forzar el reinicio del
  servicio.

#### Ejemplo: GitHub Action por SSH (servidor propio)

Crear el archivo `.github/workflows/redeploy-docs.yml` **en el repositorio de la
documentación**:

```yaml
name: Redesplegar documentación

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  redeploy:
    runs-on: ubuntu-latest
    steps:
      - name: Recrear contenedor en el servidor
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.DEPLOY_SSH_KEY }}
          script: |
            cd /ruta/al/despliegue
            ./redeploy.sh
```

**Funcionamiento:**

1. Cada `push` a la rama `main` del repositorio de documentación dispara el workflow.
2. La acción se conecta por SSH al servidor donde corre el contenedor.
3. Ejecuta `redeploy.sh` (o `deploy.sh` si se despliega desde el código fuente), que recrea el
   contenedor.
4. Al recrearse, el `entrypoint.sh` vuelve a sincronizar `URL_REPO_DOCS`, recompila el sitio y
   deja publicada la última versión de la documentación.

> Los secretos (`DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`) se configuran en
> *Settings → Secrets and variables → Actions* del repositorio de documentación.

#### Ejemplo: Deploy Hook por HTTP (PaaS)

Si la plataforma ofrece una URL de despliegue, el workflow se reduce a invocarla:

```yaml
name: Redesplegar documentación

on:
  push:
    branches:
      - main

jobs:
  redeploy:
    runs-on: ubuntu-latest
    steps:
      - name: Disparar deploy hook
        run: curl -fsSL -X POST "${{ secrets.DEPLOY_HOOK_URL }}"
```

## Personalización

Para personalizar la apariencia del proyecto, se deben incluir los siguientes archivos directamente **en el repositorio de la documentación**:

- `theme/logo.png`: Para cambiar el logo del sitio.
- `theme/style.css`: Para sobreescribir los estilos base. El ejemplo de las variables CSS disponibles está en `default/style.css`.

Si el repositorio de documentación no los provee, se usarán los valores por defecto almacenados en `default/`.
