# Despliegue en Ubuntu (Producción)

Guía para desplegar con Docker + Traefik sirviendo por HTTP en el puerto 80 y rutas:

- Home: `http://172.18.14.118/`
- CAGPU: `http://172.18.14.118/cagpu` (redirige a `/cagpu/login` si no hay sesión)
- MAU: `http://172.18.14.118/mau`
- APIs: `http://172.18.14.118/cagpu/api/...` y `http://172.18.14.118/mau/api/...`

## Requisitos

- Ubuntu 22.04+ con salida a Internet
- Puerto 80 abierto
- Docker y Docker Compose plugin
- Acceso a `ghcr.io` si las imágenes son privadas
- Archivos de entorno en el servidor:
  - `cagpu.env`, `cagpu-db.env`, `mau.env`, `mau-db.env`

## 1) Instalar Docker y Compose

```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER
newgrp docker
```

Comprobar:

```bash
docker --version
docker compose version
```

## 2) Obtener el proyecto

```bash
cd /opt || cd ~
git clone https://github.com/jlrochin/HJM.git
cd HJM
```

## 3) Preparar variables de entorno

Crea/edita:

```bash
nano cagpu.env
nano cagpu-db.env
nano mau.env
nano mau-db.env
```

Puntos clave:

- CAGPU requiere `JWT_SECRET` en `cagpu.env`.
- Los `*-db.env` deben incluir `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`.
- Django ya tiene `USE_X_FORWARDED_HOST = True` y `CSRF_TRUSTED_ORIGINS` con la IP.

## 4) (Opcional) Login a GHCR si es privado

```bash
echo '<TOKEN_GHCR>' | docker login ghcr.io -u <USUARIO_GITHUB> --password-stdin
```

## 5) Arrancar el stack

```bash
docker compose pull
docker compose up -d
```

Ver estado:

```bash
docker compose ps
```

## 6) Abrir puerto 80 (si usas UFW)

```bash
sudo ufw allow 80/tcp
```

## 7) Verificaciones rápidas

```bash
curl -I http://172.18.14.118/
curl -I http://172.18.14.118/cagpu
curl    http://172.18.14.118/cagpu/api/ping
curl -I http://172.18.14.118/mau
curl -I http://172.18.14.118/mau/api/
```

## Monitoreo y logs

- Todo:

```bash
docker compose logs -f
```

- Un servicio:

```bash
docker compose logs -f traefik
```

- Estado:

```bash
docker compose ps
```

## Operación

- Reiniciar servicio:

```bash
docker compose restart <servicio>
```

- Reconstruir servicio:

```bash
docker compose up --build -d <servicio>
```

- Detener todo:

```bash
docker compose down
```

- Detener y borrar volúmenes:

```bash
docker compose down -v
```

## Actualizaciones (Watchtower)

Incluido en `docker-compose.yml`. Si publicas nuevas imágenes `latest`, se actualizarán automáticamente.

## Notas

- Traefik enruta por `PathPrefix` y usa `StripPrefix` para backends.
- CAGPU y MAU operan bajo `/cagpu` y `/mau`.
- No se usan puertos en URLs públicas; todo por 80.

## Troubleshooting

- Servicio no responde:
  1. `docker compose logs <servicio>`
  2. `docker compose ps`
  3. `docker compose restart <servicio>`
- Traefik:
  1. `docker compose ps traefik`
  2. `docker compose logs traefik`
- DB:
  1. Revisar `*-db.env`
  2. Volúmenes `pgdata_cagpu` y `pgdata_mau`
- CAGPU `/cagpu` muestra dashboard sin login:
  - El middleware redirige a `/cagpu/login`. Limpia cookies y revisa `cagpu-frontend`.
