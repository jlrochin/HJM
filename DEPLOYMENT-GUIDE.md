# Guía de Despliegue en Servidor Ubuntu

## 1. Preparación del Servidor Ubuntu

### Instalar Docker y Docker Compose

```bash
# Actualizar el sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependencias necesarias
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Agregar la clave GPG oficial de Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Agregar el repositorio de Docker
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Agregar el usuario actual al grupo docker
sudo usermod -aG docker $USER

# Reiniciar la sesión para aplicar los cambios
newgrp docker

# Verificar la instalación
docker --version
docker compose version
```

### Configurar GitHub Container Registry (GHCR)

```bash
# Crear un token de acceso personal en GitHub:
# 1. Ve a GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
# 2. Genera un nuevo token con permisos: read:packages, write:packages, delete:packages
# 3. Copia el token generado

# Hacer login en GHCR
echo "TU_TOKEN_GITHUB" | docker login ghcr.io -u TU_USUARIO_GITHUB --password-stdin

# Verificar el login
docker pull ghcr.io/TU_USUARIO_GITHUB/cagpu-frontend:latest
```

### Preparar archivos de configuración

```bash
# Crear directorio del proyecto
mkdir -p /opt/hjm-deployment
cd /opt/hjm-deployment

# Copiar docker-compose.yml (desde tu máquina local)
# scp docker-compose.yml usuario@servidor:/opt/hjm-deployment/

# Crear archivos .env (copiar desde tu máquina local)
# scp cagpu.env usuario@servidor:/opt/hjm-deployment/
# scp cagpu-db.env usuario@servidor:/opt/hjm-deployment/
# scp mau.env usuario@servidor:/opt/hjm-deployment/
# scp mau-db.env usuario@servidor:/opt/hjm-deployment/

# Dar permisos correctos
chmod 600 *.env
```

## 2. Levantar el Stack

```bash
# Ir al directorio del proyecto
cd /opt/hjm-deployment

# Levantar todos los servicios
docker compose up -d

# Verificar que todos los contenedores estén corriendo
docker compose ps

# Ver logs en tiempo real
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs -f cagpu-frontend
```

## 3. Configuración de Watchtower para Automatización

### Agregar Watchtower al docker-compose.yml

```yaml
# Agregar este servicio al final de tu docker-compose.yml
services:
  # ... tus otros servicios ...

  watchtower:
    image: containrrr/watchtower:latest
    container_name: watchtower
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - WATCHTOWER_POLL_INTERVAL=60
      - WATCHTOWER_CLEANUP=true
      - WATCHTOWER_INCLUDE_STOPPED=true
      - WATCHTOWER_REVIVE_STOPPED=true
    command: --interval 60 --label-enable
    labels:
      - "com.centurylinklabs.watchtower.enable=true"
```

### Configurar labels en tus servicios

Asegúrate de que cada servicio en tu docker-compose.yml tenga esta label:

```yaml
services:
  cagpu-frontend:
    # ... configuración ...
    labels:
      - "com.centurylinklabs.watchtower.enable=true"

  cagpu-backend:
    # ... configuración ...
    labels:
      - "com.centurylinklabs.watchtower.enable=true"

  mau-frontend:
    # ... configuración ...
    labels:
      - "com.centurylinklabs.watchtower.enable=true"

  mau-backend:
    # ... configuración ...
    labels:
      - "com.centurylinklabs.watchtower.enable=true"
```

### Cómo funciona Watchtower

- **Detección automática**: Cada 60 segundos, Watchtower verifica si hay nuevas imágenes en GHCR
- **Actualización selectiva**: Solo actualiza contenedores con la label `com.centurylinklabs.watchtower.enable=true`
- **Reinicio automático**: Detiene el contenedor antiguo, descarga la nueva imagen y levanta el nuevo contenedor
- **Limpieza**: Elimina imágenes antiguas para ahorrar espacio

## 4. Script Manual de Despliegue

El script `deploy.sh` permite forzar una actualización manual:

```bash
#!/bin/bash

# Script de despliegue manual
# Uso: ./deploy.sh

set -e  # Salir si hay algún error

echo "🚀 Iniciando despliegue manual..."

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: docker-compose.yml no encontrado"
    echo "   Asegúrate de ejecutar este script desde /opt/hjm-deployment"
    exit 1
fi

# Mostrar estado actual
echo "📊 Estado actual de los contenedores:"
docker compose ps

echo ""
echo "🔄 Descargando últimas imágenes..."
docker compose pull

echo ""
echo "🔄 Reiniciando servicios..."
docker compose up -d

echo ""
echo "✅ Despliegue completado!"
echo ""
echo "📊 Estado final de los contenedores:"
docker compose ps

echo ""
echo "📝 Para ver logs en tiempo real:"
echo "   docker compose logs -f"
echo ""
echo "📝 Para ver logs de un servicio específico:"
echo "   docker compose logs -f [nombre-del-servicio]"
```

### Dar permisos de ejecución

```bash
chmod +x deploy.sh
```

## 5. Flujo Final de CI/CD

### Flujo Automático (Recomendado)

1. **Desarrollo**: Haces cambios en tu código local
2. **Commit y Push**: `git add . && git commit -m "feat: nueva funcionalidad" && git push`
3. **GitHub Actions**: Automáticamente:
   - Construye las imágenes Docker
   - Publica en GHCR con tags `latest` y `v1.0.0`
   - Ejecuta tests si están configurados
4. **Watchtower**: En el servidor:
   - Detecta nuevas imágenes cada 60 segundos
   - Actualiza automáticamente los contenedores con la label habilitada
   - Reinicia los servicios sin intervención manual

### Flujo Manual (Opcional)

Si necesitas forzar una actualización inmediata:

```bash
# En el servidor
cd /opt/hjm-deployment
./deploy.sh
```

### Comandos Útiles para Monitoreo

```bash
# Ver estado de todos los servicios
docker compose ps

# Ver logs en tiempo real
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs -f cagpu-frontend

# Ver uso de recursos
docker stats

# Verificar imágenes disponibles
docker images | grep ghcr.io

# Limpiar imágenes no utilizadas
docker image prune -f

# Reiniciar un servicio específico
docker compose restart cagpu-frontend

# Ver logs de Watchtower
docker logs watchtower
```

## 6. Troubleshooting

### Problemas Comunes

**Error de permisos Docker:**

```bash
sudo usermod -aG docker $USER
newgrp docker
```

**Error de login en GHCR:**

```bash
docker logout ghcr.io
echo "TU_TOKEN_GITHUB" | docker login ghcr.io -u TU_USUARIO_GITHUB --password-stdin
```

**Servicios no se levantan:**

```bash
# Ver logs detallados
docker compose logs

# Verificar configuración
docker compose config

# Reiniciar todo
docker compose down && docker compose up -d
```

**Watchtower no actualiza:**

```bash
# Verificar logs de Watchtower
docker logs watchtower

# Verificar labels en servicios
docker inspect [nombre-contenedor] | grep -A 5 Labels
```

### Backup y Recuperación

```bash
# Backup de volúmenes
docker run --rm -v hjm_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .

# Restaurar volúmenes
docker run --rm -v hjm_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /data
```

## 7. Seguridad Adicional

### Configurar Firewall

```bash
# Instalar UFW
sudo apt install ufw

# Configurar reglas básicas
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Habilitar firewall
sudo ufw enable
```

### Actualizaciones del Sistema

```bash
# Configurar actualizaciones automáticas
sudo apt install unattended-upgrades
sudo dpkg-reconfigure unattended-upgrades
```

¡Con esta configuración tendrás un sistema de despliegue completamente automatizado y robusto! 🚀
