#!/bin/bash

# Salir inmediatamente si un comando falla
set -e

echo "Redesplegando documentación (imagen publicada)..."

# Descargar la última versión de la imagen publicada
docker compose pull

# Recrear el contenedor para que vuelva a sincronizar y compilar el contenido
docker compose up -d --force-recreate

# Limpiar imágenes huérfanas antiguas para no llenar el disco
docker image prune -f

echo "¡Redespliegue completado con éxito!"