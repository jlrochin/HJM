#!/bin/bash

echo "🔄 Reiniciando servicios Traefik y CAGPU..."

# Detener servicios
docker compose down traefik cagpu-frontend cagpu-backend

# Esperar un poco
sleep 3

# Levantar Traefik primero
docker compose up -d traefik

# Esperar que Traefik esté listo
sleep 5

# Levantar CAGPU backend y frontend
docker compose up -d cagpu-backend cagpu-frontend

# Esperar que estén listos
sleep 5

echo "✅ Servicios reiniciados"
echo "🧪 Probando endpoint API..."

# Probar el endpoint
curl -i http://172.18.14.118/cagpu/api/ping

echo ""
echo "🔍 Si aún no funciona, revisar logs:"
echo "docker compose logs traefik --tail 20"
echo "docker compose logs cagpu-backend --tail 20"
