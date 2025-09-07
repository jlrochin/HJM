#!/bin/bash

# ============================================================================
# SCRIPT DE DESPLIEGUE AUTOMATIZADO PARA RAILWAY
# ============================================================================

echo "🚀 Iniciando despliegue en Railway..."

# Verificar que Railway CLI esté instalado
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI no está instalado"
    echo "📥 Instalando Railway CLI..."
    npm install -g @railway/cli
fi

# Verificar que estés logueado en Railway
if ! railway whoami &> /dev/null; then
    echo "🔐 Iniciando sesión en Railway..."
    railway login
fi

# Desplegar la aplicación
echo "📤 Desplegando aplicación..."
railway up

echo "✅ Despliegue completado!"
echo "🌐 Tu aplicación está disponible en Railway"
echo "📊 Visita https://railway.app para monitorear el despliegue"
