#!/usr/bin/env python
"""
Script para importar el catálogo completo de medicamentos del IMSS
desde los archivos CSV del COMPENDIO_VERSION_2025V220725F/
"""
import os
import sys
import django
import csv
import re
from pathlib import Path

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mau_hospital.settings')
django.setup()

from apps.prescriptions.models import CatalogoMedicamentos

def extraer_principio_activo(insumo):
    """Extrae el principio activo del campo Insumo"""
    # El principio activo generalmente es la primera parte antes de comas o paréntesis
    if not insumo:
        return ""
    
    # Limpiar y extraer la primera parte significativa
    principio = insumo.strip()
    principio = re.split(r'[,\(]', principio)[0].strip()
    return principio[:150]  # Limitar a 150 caracteres

def extraer_concentracion(descripcion):
    """Extrae la concentración de la descripción"""
    if not descripcion:
        return ""
    
    # Buscar patrones como "500 mg", "10 mL", "0.5%", etc.
    patrones_concentracion = [
        r'(\d+(?:\.\d+)?\s*(?:mg|g|mL|L|µg|ng|UI|%|mg/mL))',
        r'equivalente\s+a\s+(\d+(?:\.\d+)?\s*(?:mg|g|mL|L|µg|ng|UI|%))',
        r'contiene[:\s]+([^.]+(?:mg|g|mL|L|µg|ng|UI|%))',
    ]
    
    for patron in patrones_concentracion:
        match = re.search(patron, descripcion, re.IGNORECASE)
        if match:
            return match.group(1)[:50]  # Limitar a 50 caracteres
    
    return ""

def extraer_forma_farmaceutica(descripcion):
    """Extrae la forma farmacéutica de la descripción"""
    if not descripcion:
        return ""
    
    # Formas farmacéuticas comunes
    formas = [
        'TABLETA', 'GRAGEA', 'CÁPSULA', 'COMPRIMIDO', 'PERLA',
        'SOLUCIÓN INYECTABLE', 'SOLUCIÓN', 'SUSPENSIÓN', 'JARABE',
        'CREMA', 'GEL', 'POMADA', 'UNGÜENTO', 'ÓVULO', 
        'SUPOSITORIO', 'AMPOLLETA', 'FRASCO ÁMPULA', 'SPRAY',
        'GOTAS', 'EMULSIÓN', 'PARCHE', 'AEROSOL'
    ]
    
    descripcion_upper = descripcion.upper()
    for forma in formas:
        if forma in descripcion_upper:
            return forma
    
    # Si no encuentra una forma específica, extraer de las primeras líneas
    lineas = descripcion.split('\n')
    if len(lineas) > 1:
        segunda_linea = lineas[1].strip()
        if segunda_linea and len(segunda_linea) < 50:
            return segunda_linea
    
    return "NO ESPECIFICADA"

def mapear_categoria(grupo):
    """Mapea el grupo del CSV a una categoría válida"""
    if not grupo:
        return 'OTROS'
    
    grupo_upper = grupo.upper()
    
    # Mapeo de grupos a categorías
    mapeo = {
        'ANALGESIA': 'ANALGESICO',
        'ANESTESIA': 'ANESTESICO', 
        'CARDIOLOGÍA': 'CARDIOVASCULAR',
        'DERMATOLOGÍA': 'DERMATOLOGICO',
        'ENDOCRINOLOGÍA': 'ENDOCRINOLOGICO',
        'ENF INFECCIOSAS': 'ANTIINFECCIOSO',
        'ENF INMUNOALÉRGICAS': 'IMMUNOLOGICO',
        'GASTROENTEROLOGÍA': 'GASTROINTESTINAL',
        'GINECO-OBSTETRICIA': 'GINECOLOGICO',
        'HEMATOLOGÍA': 'HEMATOLOGICO',
        'INTOXICACIONES': 'ANTIDOTO',
        'NEFROLOGÍA': 'NEFROLOGICO',
        'NEUMOLOGÍA': 'RESPIRATORIO',
        'NEUROLOGÍA': 'NEUROLOGICO',
        'OFTALMOLOGÍA': 'OFTALMOLOGICO',
        'ONCOLOGÍA': 'ONCOLOGICO',
        'OTORRINOLARINGOLOGÍA': 'OTORRINOLARINGOLOGICO',
        'PLANIFICACIÓN FAMILIAR': 'ANTICONCEPTIVO',
        'PSIQUIATRÍA': 'PSIQUIATRICO',
        'REUMATOLOGÍA': 'ANTIINFLAMATORIO',
        'VACUNAS': 'VACUNAS',
        'CUIDADOS PALIATIVOS': 'ANALGESICO'
    }
    
    for clave, categoria in mapeo.items():
        if clave in grupo_upper:
            return categoria
    
    return 'OTROS'

def determinar_tipo_receta(categoria, descripcion):
    """Determina si el medicamento es para FARMACIA, CMI o AMBOS"""
    if not descripcion:
        return 'AMBOS'
    
    desc_upper = descripcion.upper()
    
    # Medicamentos que típicamente van a CMI
    indicadores_cmi = [
        'SOLUCIÓN INYECTABLE', 'AMPOLLETA', 'FRASCO ÁMPULA',
        'LIOFILIZADO', 'INTRAVENOSA', 'INTRAMUSCULAR',
        'SUBCUTÁNEA', 'INFUSIÓN', 'QUIMIOTERAPIA'
    ]
    
    for indicador in indicadores_cmi:
        if indicador in desc_upper:
            return 'CMI'
    
    # Por defecto, la mayoría van a farmacia
    return 'FARMACIA'

def extraer_via_administracion(descripcion, categoria):
    """Extrae la vía de administración"""
    if not descripcion:
        return ""
    
    desc_upper = descripcion.upper()
    
    vias = {
        'ORAL': ['TABLETA', 'GRAGEA', 'CÁPSULA', 'JARABE', 'SUSPENSIÓN ORAL'],
        'INTRAVENOSA': ['INTRAVENOSA', 'I.V.', 'INFUSIÓN'],
        'INTRAMUSCULAR': ['INTRAMUSCULAR', 'I.M.'],
        'SUBCUTÁNEA': ['SUBCUTÁNEA', 'S.C.'],
        'TÓPICA': ['CREMA', 'GEL', 'POMADA', 'UNGÜENTO'],
        'VAGINAL': ['ÓVULO', 'TABLETA VAGINAL'],
        'RECTAL': ['SUPOSITORIO'],
        'OFTÁLMICA': ['GOTAS OFTÁLMICAS', 'OFTÁLMICO'],
        'NASAL': ['SPRAY NASAL', 'GOTAS NASALES']
    }
    
    for via, indicadores in vias.items():
        for indicador in indicadores:
            if indicador in desc_upper:
                return via
    
    # Inferir de la categoría
    if categoria == 'OFTALMOLOGICO':
        return 'OFTÁLMICA'
    elif categoria == 'DERMATOLOGICO':
        return 'TÓPICA'
    elif categoria == 'GINECOLOGICO':
        return 'VAGINAL'
    
    return ""

def procesar_archivo_csv(ruta_archivo):
    """Procesa un archivo CSV individual"""
    medicamentos_creados = 0
    medicamentos_actualizados = 0
    errores = []
    
    try:
        with open(ruta_archivo, 'r', encoding='utf-8') as archivo:
            reader = csv.DictReader(archivo)
            
            for fila_num, fila in enumerate(reader, start=2):
                try:
                    # Extraer datos básicos
                    clave = fila.get('Clave', '').strip()
                    insumo = fila.get('Insumo', '').strip()
                    descripcion = fila.get('Descripción', '').strip()
                    indicaciones = fila.get('Indicaciones', '').strip()
                    grupo = fila.get('Grupo', '').strip()
                    
                    # Validaciones básicas
                    if not clave or not insumo:
                        continue
                    
                    # Procesar datos
                    principio_activo = extraer_principio_activo(insumo)
                    concentracion = extraer_concentracion(descripcion)
                    forma_farmaceutica = extraer_forma_farmaceutica(descripcion)
                    categoria = mapear_categoria(grupo)
                    tipo_receta = determinar_tipo_receta(categoria, descripcion)
                    via_administracion = extraer_via_administracion(descripcion, categoria)
                    
                    # Crear nombre completo del medicamento
                    nombre_completo = f"{insumo}"
                    if concentracion:
                        nombre_completo += f" {concentracion}"
                    
                    # Crear o actualizar medicamento
                    medicamento, creado = CatalogoMedicamentos.objects.update_or_create(
                        clave=clave,
                        defaults={
                            'nombre': nombre_completo[:200],
                            'principio_activo': principio_activo,
                            'concentracion': concentracion,
                            'forma_farmaceutica': forma_farmaceutica[:50],
                            'categoria': categoria,
                            'tipo_receta_permitido': tipo_receta,
                            'via_administracion': via_administracion[:100],
                            'dosis_sugerida': '',  # Se puede llenar manualmente después
                            'contraindicaciones': indicaciones[:1000] if indicaciones else '',
                            'requiere_refrigeracion': False,
                            'es_controlado': 'CONTROLADO' in descripcion.upper(),
                            'activo': True
                        }
                    )
                    
                    if creado:
                        medicamentos_creados += 1
                    else:
                        medicamentos_actualizados += 1
                        
                except Exception as e:
                    error_msg = f"Fila {fila_num}: {str(e)}"
                    errores.append(error_msg)
                    print(f"Error en {ruta_archivo}, {error_msg}")
                    
    except Exception as e:
        print(f"Error al abrir archivo {ruta_archivo}: {str(e)}")
        return 0, 0, [f"Error al abrir archivo: {str(e)}"]
    
    return medicamentos_creados, medicamentos_actualizados, errores

def main():
    """Función principal para importar todos los archivos CSV"""
    # Ruta base del catálogo
    base_path = Path(__file__).parent.parent / "COMPENDIO_VERSION_2025V220725F"
    
    if not base_path.exists():
        print(f"❌ No se encontró el directorio: {base_path}")
        return
    
    print("🚀 Iniciando importación del catálogo de medicamentos...")
    print(f"📁 Directorio base: {base_path}")
    
    # Buscar todos los archivos CSV
    archivos_csv = list(base_path.glob("GRUPO *.csv"))
    
    if not archivos_csv:
        print("❌ No se encontraron archivos CSV del catálogo")
        return
    
    print(f"📋 Encontrados {len(archivos_csv)} archivos CSV")
    
    total_creados = 0
    total_actualizados = 0
    todos_errores = []
    
    # Procesar cada archivo
    for archivo in sorted(archivos_csv):
        print(f"\n📄 Procesando: {archivo.name}")
        creados, actualizados, errores = procesar_archivo_csv(archivo)
        
        total_creados += creados
        total_actualizados += actualizados
        todos_errores.extend(errores)
        
        print(f"   ✅ Creados: {creados}")
        print(f"   🔄 Actualizados: {actualizados}")
        if errores:
            print(f"   ⚠️ Errores: {len(errores)}")
    
    # Resumen final
    print("\n" + "="*60)
    print("📊 RESUMEN DE IMPORTACIÓN")
    print("="*60)
    print(f"✅ Medicamentos creados: {total_creados}")
    print(f"🔄 Medicamentos actualizados: {total_actualizados}")
    print(f"📝 Total medicamentos en catálogo: {CatalogoMedicamentos.objects.count()}")
    
    if todos_errores:
        print(f"\n⚠️ Errores encontrados: {len(todos_errores)}")
        print("Primeros 10 errores:")
        for i, error in enumerate(todos_errores[:10], 1):
            print(f"  {i}. {error}")
    
    print(f"\n🎉 Importación completada!")

if __name__ == "__main__":
    main()
