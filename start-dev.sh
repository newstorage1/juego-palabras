#!/bin/bash

# Instalar dependencias del servidor
echo "Instalando dependencias del servidor..."
npm install

# Instalar dependencias del cliente
echo "Instalando dependencias del cliente..."
cd client && npm install
cd ..

# Crear directorio de partidas si no existe
mkdir -p saves

# Iniciar el servidor y el cliente en paralelo
echo "Iniciando servidor en http://localhost:3001..."
echo "Iniciando cliente en http://localhost:3000..."
echo "Abre tu navegador en http://localhost:3000"

# Iniciar el servidor
node server/index.js
