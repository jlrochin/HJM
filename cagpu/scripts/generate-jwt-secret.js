#!/usr/bin/env node

// ============================================================================
// GENERADOR DE CLAVE JWT SECRETA
// ============================================================================
// Este script genera una clave JWT segura de 64 caracteres
// Uso: node scripts/generate-jwt-secret.js
// ============================================================================

const crypto = require('crypto');

function generateJWTSecret() {
    // Generar 48 bytes (384 bits) y convertir a base64
    const randomBytes = crypto.randomBytes(48);
    const secret = randomBytes.toString('base64');

    console.log('='.repeat(60));
    console.log('🔐 CLAVE JWT SECRETA GENERADA');
    console.log('='.repeat(60));
    console.log('');
    console.log('📋 Copia esta clave en tu archivo .env.local:');
    console.log('');
    console.log(`JWT_SECRET="${secret}"`);
    console.log('');
    console.log('⚠️  IMPORTANTE:');
    console.log('   - Nunca compartas esta clave');
    console.log('   - Guárdala en un lugar seguro');
    console.log('   - Usa diferentes claves para desarrollo y producción');
    console.log('   - La clave tiene 64 caracteres de longitud');
    console.log('');
    console.log('='.repeat(60));

    return secret;
}

// Ejecutar si se llama directamente
if (require.main === module) {
    generateJWTSecret();
}

module.exports = { generateJWTSecret };
