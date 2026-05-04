#!/bin/bash

# Instalar dependencias del servidor
echo "Instalando dependencias del servidor..."
npm install

# Instalar dependencias del cliente
echo "Instalando dependencias del cliente..."
cd client && npm install

# Volver al directorio raíz
cd ..

# Crear directorio de partidas si no existe
mkdir -p saves

# Iniciar el servidor
echo "Iniciando servidor en http://localhost:3001..."
npm start
