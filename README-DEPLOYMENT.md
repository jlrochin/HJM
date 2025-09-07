# 🚀 Guía de Despliegue - HJM

Esta guía explica cómo desplegar la infraestructura completa de HJM en producción usando Docker y Traefik.

## 📋 Arquitectura

La infraestructura está compuesta por:

- **🏠 Home**: Frontend Next.js en la raíz (`http://<IP>/`)
- **🏥 CAGPU**: Frontend y Backend Next.js bajo `/cagpu` (`http://<IP>/cagpu`)
- **🏥 MAU**: Frontend Vite y Backend Django bajo `/mau` (`http://<IP>/mau`)
- **🔄 Traefik**: Proxy inverso para enrutamiento
- **🗄️ PostgreSQL**: Bases de datos para CAGPU y MAU

## 🛠️ Requisitos Previos

1. **Docker** y **Docker Compose** instalados
2. Archivos de entorno configurados:
   - `cagpu.env`
   - `cagpu-db.env`
   - `mau.env`
   - `mau-db.env`

## 🚀 Despliegue Rápido

### Opción 1: Script Automático

```bash
./deploy.sh
```

### Opción 2: Comandos Manuales

```bash
# Detener contenedores existentes
docker-compose down --remove-orphans

# Construir y levantar servicios
docker-compose up --build -d

# Verificar estado
docker-compose ps
```

## 📁 Estructura de Rutas

| Ruta         | Servicio       | Descripción               |
| ------------ | -------------- | ------------------------- |
| `/`          | Home Frontend  | Página principal          |
| `/cagpu`     | CAGPU Frontend | Interfaz de usuario CAGPU |
| `/cagpu/api` | CAGPU Backend  | API REST de CAGPU         |
| `/mau`       | MAU Frontend   | Interfaz de usuario MAU   |
| `/mau/api`   | MAU Backend    | API REST de MAU           |

## 🔧 Configuración de Servicios

### Home

- **Tecnología**: Next.js + Tailwind CSS
- **Puerto interno**: 3000
- **Comando de producción**: `npm run build && npm run start`

### CAGPU

- **Frontend**: Next.js + Tailwind CSS
- **Backend**: Next.js API Routes + Prisma + PostgreSQL
- **Puerto interno**: 3000
- **Migraciones**: Se ejecutan automáticamente con `npx prisma migrate deploy`
- **Comando**: `npm run build && npm run start`
- **Nota**: No usa `basePath` en Next.js porque Traefik maneja el prefijo `/cagpu`

### MAU

- **Frontend**: Vite + Vue.js + Tailwind CSS
- **Backend**: Django + PostgreSQL
- **Puerto interno**: 3000 (backend), 80 (frontend)
- **Migraciones**: Se ejecutan automáticamente con `python manage.py migrate`
- **Comando**: `gunicorn mau_hospital.wsgi:application --bind 0.0.0.0:3000 --workers 3`
- **Nota**: No usa `base` en Vite porque Traefik maneja el prefijo `/mau`

## 🗄️ Bases de Datos

### PostgreSQL CAGPU

- **Contenedor**: `postgres-cagpu`
- **Variables**: Definidas en `cagpu-db.env`
- **Volumen**: `pgdata_cagpu`

### PostgreSQL MAU

- **Contenedor**: `postgres-mau`
- **Variables**: Definidas en `mau-db.env`
- **Volumen**: `pgdata_mau`

## 🔄 Proxy Inverso (Traefik)

Traefik maneja automáticamente el enrutamiento basado en las rutas:

- **Prioridades**:
  - Home: 1
  - Frontends: 10
  - Backends: 20
- **Strip Prefix**: Los prefijos `/cagpu` y `/mau` se eliminan antes de llegar a los servicios
- **Puerto**: 80 (accesible desde el exterior)

## 📊 Monitoreo y Logs

### Ver logs de todos los servicios:

```bash
docker-compose logs -f
```

### Ver logs de un servicio específico:

```bash
docker-compose logs -f [nombre-servicio]
```

### Ver estado de contenedores:

```bash
docker-compose ps
```

## 🛠️ Comandos Útiles

### Reiniciar un servicio:

```bash
docker-compose restart [nombre-servicio]
```

### Reconstruir un servicio:

```bash
docker-compose up --build -d [nombre-servicio]
```

### Detener todos los servicios:

```bash
docker-compose down
```

### Detener y eliminar volúmenes:

```bash
docker-compose down -v
```

## 🔍 Verificación del Despliegue

Después del despliegue, verifica que todos los servicios estén funcionando:

1. **Home**: `curl http://localhost/`
2. **CAGPU Frontend**: `curl http://localhost/cagpu`
3. **CAGPU API**: `curl http://localhost/cagpu/api/ping`
4. **MAU Frontend**: `curl http://localhost/mau`
5. **MAU API**: `curl http://localhost/mau/api/`

## 🚨 Solución de Problemas

### Servicio no responde:

1. Verificar logs: `docker-compose logs [servicio]`
2. Verificar estado: `docker-compose ps`
3. Reiniciar servicio: `docker-compose restart [servicio]`

### Error de migraciones:

1. Verificar conexión a base de datos
2. Verificar variables de entorno
3. Ejecutar migraciones manualmente si es necesario

### Error de Traefik:

1. Verificar que Traefik esté ejecutándose: `docker-compose ps traefik`
2. Verificar configuración de rutas en docker-compose.yml
3. Revisar logs: `docker-compose logs traefik`

### Rutas duplicadas (ej: /cagpu/cagpu/login):

1. Verificar que no haya `basePath` configurado en Next.js
2. Verificar que no haya `base` configurado en Vite
3. Verificar que las referencias en el código usen rutas relativas (`/api/` en lugar de `/cagpu/api/`)
4. Reconstruir contenedores: `docker-compose up --build -d`

## 📝 Notas Importantes

- **Puertos**: Solo el puerto 80 está expuesto al exterior
- **Migraciones**: Se ejecutan automáticamente al iniciar los servicios
- **Volúmenes**: Los datos de PostgreSQL se persisten en volúmenes Docker
- **Watchtower**: Configurado para actualizaciones automáticas cada 5 minutos
- **Redes**: Separación entre frontend y backend para seguridad
