#!/bin/bash
# ============================================================================
# SCRIPT DE BACKUP DIRECTO - CAGPU
# ============================================================================

# Configuración
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="cagpu_backup_completo_${TIMESTAMP}.sql"

# Configuración de la base de datos (ajustar según tu configuración)
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="cagpu_production"
DB_USER="cagpu_user"
DB_PASSWORD="cagpu_password"

# Crear directorio de backup si no existe
mkdir -p $BACKUP_DIR

echo "=== BACKUP COMPLETO DE LA BASE DE DATOS CAGPU ==="
echo "Fecha: $(date)"
echo "Base de datos: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo "Usuario: $DB_USER"
echo ""

# Verificar si pg_dump está disponible
if ! command -v pg_dump &> /dev/null; then
    echo "ERROR: pg_dump no está instalado. Instala PostgreSQL client."
    echo "En macOS: brew install postgresql"
    echo "En Ubuntu: sudo apt-get install postgresql-client"
    exit 1
fi

# Realizar backup completo
echo "Iniciando backup de la base de datos..."
echo "Esto puede tomar varios minutos dependiendo del tamaño de la base de datos..."
echo ""

# Crear backup con formato personalizado (más eficiente)
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
    --verbose \
    --no-password \
    --format=custom \
    --compress=9 \
    --file="$BACKUP_DIR/${BACKUP_FILE}.dump"

# También crear backup en formato SQL (más portable)
echo "Creando backup en formato SQL..."
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
    --verbose \
    --no-password \
    --format=plain \
    --no-owner \
    --no-privileges \
    --clean \
    --create \
    --if-exists \
    > "$BACKUP_DIR/$BACKUP_FILE"

# Comprimir el archivo SQL
gzip "$BACKUP_DIR/$BACKUP_FILE"

echo ""
echo "=== BACKUP COMPLETADO ==="
echo "Archivos creados:"
echo "1. $BACKUP_DIR/${BACKUP_FILE}.dump (formato personalizado, comprimido)"
echo "2. $BACKUP_DIR/$BACKUP_FILE.gz (formato SQL, comprimido)"
echo ""
echo "Tamaños:"
if [ -f "$BACKUP_DIR/${BACKUP_FILE}.dump" ]; then
    echo "- Dump personalizado: $(du -h "$BACKUP_DIR/${BACKUP_FILE}.dump" | cut -f1)"
fi
if [ -f "$BACKUP_DIR/$BACKUP_FILE.gz" ]; then
    echo "- SQL comprimido: $(du -h "$BACKUP_DIR/$BACKUP_FILE.gz" | cut -f1)"
fi
echo ""
echo "Para restaurar el backup:"
echo "- Formato personalizado: pg_restore -d $DB_NAME $BACKUP_DIR/${BACKUP_FILE}.dump"
echo "- Formato SQL: gunzip -c $BACKUP_DIR/$BACKUP_FILE.gz | psql -d $DB_NAME"
