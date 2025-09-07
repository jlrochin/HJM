#!/usr/bin/env python3
"""
Comando de Django para cargar el catálogo oficial CIE-10 México
Basado en los datos oficiales de la Secretaría de Salud
"""

from django.core.management.base import BaseCommand
from apps.patients.models import CIE10Mexico
import json


class Command(BaseCommand):
    help = 'Carga el catálogo oficial CIE-10 México en la base de datos'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Fuerza la recarga de datos, eliminando los existentes'
        )

    def handle(self, *args, **options):
        self.stdout.write('🏥 Iniciando carga del catálogo CIE-10 México...')
        
        if options['force']:
            self.stdout.write('⚠️  Eliminando datos existentes...')
            CIE10Mexico.objects.all().delete()
        
        # Datos iniciales del CIE-10 México (muestra representativa)
        cie10_data = [
            # CAPÍTULO I: CIERTAS ENFERMEDADES INFECCIOSAS Y PARASITARIAS (A00-B99)
            {
                'codigo': 'A00.0',
                'descripcion': 'Cólera debido a Vibrio cholerae 01, biotipo cholerae',
                'descripcion_corta': 'Cólera clásico',
                'capitulo': 'I',
                'categoria': 'A00',
                'tipo': 'ENFERMEDAD',
                'es_mortalidad': True,
                'es_morbilidad': True
            },
            {
                'codigo': 'A01.0',
                'descripcion': 'Fiebre tifoidea',
                'descripcion_corta': 'Fiebre tifoidea',
                'capitulo': 'I',
                'categoria': 'A01',
                'tipo': 'ENFERMEDAD',
                'es_mortalidad': True,
                'es_morbilidad': True
            },
            {
                'codigo': 'A02.0',
                'descripcion': 'Enteritis debida a Salmonella',
                'descripcion_corta': 'Salmonelosis',
                'capitulo': 'I',
                'categoria': 'A02',
                'tipo': 'ENFERMEDAD',
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            {
                'codigo': 'A09.9',
                'descripcion': 'Gastroenteritis y colitis de origen infeccioso, sin otra especificación',
                'descripcion_corta': 'Gastroenteritis infecciosa',
                'capitulo': 'I',
                'categoria': 'A09',
                'tipo': 'ENFERMEDAD',
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            
            # CAPÍTULO II: TUMORES (C00-D48)
            {
                'codigo': 'C50.9',
                'descripcion': 'Tumor maligno del seno, sin otra especificación',
                'descripcion_corta': 'Cáncer de mama',
                'capitulo': 'II',
                'categoria': 'C50',
                'tipo': 'ENFERMEDAD',
                'genero_aplicable': 'FEMENINO',
                'es_mortalidad': True,
                'es_morbilidad': True
            },
            {
                'codigo': 'C61',
                'descripcion': 'Tumor maligno de la próstata',
                'descripcion_corta': 'Cáncer de próstata',
                'capitulo': 'II',
                'categoria': 'C61',
                'tipo': 'ENFERMEDAD',
                'genero_aplicable': 'MASCULINO',
                'edad_minima': 40,
                'es_mortalidad': True,
                'es_morbilidad': True
            },
            {
                'codigo': 'C78.0',
                'descripcion': 'Tumor maligno secundario del pulmón',
                'descripcion_corta': 'Metástasis pulmonar',
                'capitulo': 'II',
                'categoria': 'C78',
                'tipo': 'ENFERMEDAD',
                'es_mortalidad': True,
                'es_morbilidad': True
            },
            
            # CAPÍTULO III: ENFERMEDADES DE LA SANGRE Y DE LOS ÓRGANOS HEMATOPOYÉTICOS
            {
                'codigo': 'D50.9',
                'descripcion': 'Anemia por deficiencia de hierro, sin otra especificación',
                'descripcion_corta': 'Anemia ferropénica',
                'capitulo': 'III',
                'categoria': 'D50',
                'tipo': 'ENFERMEDAD',
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            
            # CAPÍTULO IV: ENFERMEDADES ENDOCRINAS, NUTRICIONALES Y METABÓLICAS (E00-E90)
            {
                'codigo': 'E10.9',
                'descripcion': 'Diabetes mellitus insulinodependiente sin mención de complicación',
                'descripcion_corta': 'Diabetes tipo 1',
                'capitulo': 'IV',
                'categoria': 'E10',
                'tipo': 'ENFERMEDAD',
                'es_mortalidad': True,
                'es_morbilidad': True
            },
            {
                'codigo': 'E11.9',
                'descripcion': 'Diabetes mellitus no insulinodependiente sin mención de complicación',
                'descripcion_corta': 'Diabetes tipo 2',
                'capitulo': 'IV',
                'categoria': 'E11',
                'tipo': 'ENFERMEDAD',
                'edad_minima': 30,
                'es_mortalidad': True,
                'es_morbilidad': True
            },
            {
                'codigo': 'E66.9',
                'descripcion': 'Obesidad, sin otra especificación',
                'descripcion_corta': 'Obesidad',
                'capitulo': 'IV',
                'categoria': 'E66',
                'tipo': 'ENFERMEDAD',
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            
            # CAPÍTULO V: TRASTORNOS MENTALES Y DEL COMPORTAMIENTO (F00-F99)
            {
                'codigo': 'F20.9',
                'descripcion': 'Esquizofrenia, sin otra especificación',
                'descripcion_corta': 'Esquizofrenia',
                'capitulo': 'V',
                'categoria': 'F20',
                'tipo': 'ENFERMEDAD',
                'edad_minima': 15,
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            {
                'codigo': 'F32.9',
                'descripcion': 'Episodio depresivo, sin otra especificación',
                'descripcion_corta': 'Depresión',
                'capitulo': 'V',
                'categoria': 'F32',
                'tipo': 'ENFERMEDAD',
                'es_mortalidad': True,
                'es_morbilidad': True
            },
            {
                'codigo': 'F41.9',
                'descripcion': 'Trastorno de ansiedad, sin otra especificación',
                'descripcion_corta': 'Ansiedad',
                'capitulo': 'V',
                'categoria': 'F41',
                'tipo': 'ENFERMEDAD',
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            
            # CAPÍTULO IX: ENFERMEDADES DEL SISTEMA CIRCULATORIO (I00-I99)
            {
                'codigo': 'I10',
                'descripcion': 'Hipertensión esencial (primaria)',
                'descripcion_corta': 'Hipertensión arterial',
                'capitulo': 'IX',
                'categoria': 'I10',
                'tipo': 'ENFERMEDAD',
                'edad_minima': 18,
                'es_mortalidad': True,
                'es_morbilidad': True
            },
            {
                'codigo': 'I21.9',
                'descripcion': 'Infarto agudo del miocardio, sin otra especificación',
                'descripcion_corta': 'Infarto al miocardio',
                'capitulo': 'IX',
                'categoria': 'I21',
                'tipo': 'ENFERMEDAD',
                'es_mortalidad': True,
                'es_morbilidad': True
            },
            {
                'codigo': 'I50.9',
                'descripcion': 'Insuficiencia cardíaca, sin otra especificación',
                'descripcion_corta': 'Insuficiencia cardíaca',
                'capitulo': 'IX',
                'categoria': 'I50',
                'tipo': 'ENFERMEDAD',
                'es_mortalidad': True,
                'es_morbilidad': True
            },
            
            # CAPÍTULO X: ENFERMEDADES DEL SISTEMA RESPIRATORIO (J00-J99)
            {
                'codigo': 'J44.1',
                'descripcion': 'Enfermedad pulmonar obstructiva crónica con exacerbación aguda',
                'descripcion_corta': 'EPOC exacerbado',
                'capitulo': 'X',
                'categoria': 'J44',
                'tipo': 'ENFERMEDAD',
                'edad_minima': 40,
                'es_mortalidad': True,
                'es_morbilidad': True
            },
            {
                'codigo': 'J45.9',
                'descripcion': 'Asma, sin otra especificación',
                'descripcion_corta': 'Asma bronquial',
                'capitulo': 'X',
                'categoria': 'J45',
                'tipo': 'ENFERMEDAD',
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            {
                'codigo': 'J18.9',
                'descripcion': 'Neumonía, sin otra especificación',
                'descripcion_corta': 'Neumonía',
                'capitulo': 'X',
                'categoria': 'J18',
                'tipo': 'ENFERMEDAD',
                'es_mortalidad': True,
                'es_morbilidad': True
            },
            
            # CAPÍTULO XI: ENFERMEDADES DEL SISTEMA DIGESTIVO (K00-K93)
            {
                'codigo': 'K29.9',
                'descripcion': 'Gastritis, sin otra especificación',
                'descripcion_corta': 'Gastritis',
                'capitulo': 'XI',
                'categoria': 'K29',
                'tipo': 'ENFERMEDAD',
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            {
                'codigo': 'K80.2',
                'descripcion': 'Cálculo de la vesícula biliar sin colecistitis',
                'descripcion_corta': 'Colelitiasis',
                'capitulo': 'XI',
                'categoria': 'K80',
                'tipo': 'ENFERMEDAD',
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            
            # CAPÍTULO XIII: ENFERMEDADES DEL SISTEMA OSTEOMUSCULAR (M00-M99)
            {
                'codigo': 'M79.3',
                'descripcion': 'Panniculitis, sin otra especificación',
                'descripcion_corta': 'Fibromialgia',
                'capitulo': 'XIII',
                'categoria': 'M79',
                'tipo': 'ENFERMEDAD',
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            {
                'codigo': 'M06.9',
                'descripcion': 'Artritis reumatoide, sin otra especificación',
                'descripcion_corta': 'Artritis reumatoide',
                'capitulo': 'XIII',
                'categoria': 'M06',
                'tipo': 'ENFERMEDAD',
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            
            # CAPÍTULO XIV: ENFERMEDADES DEL SISTEMA GENITOURINARIO (N00-N99)
            {
                'codigo': 'N18.6',
                'descripcion': 'Enfermedad renal crónica, estadio 5',
                'descripcion_corta': 'Insuficiencia renal crónica',
                'capitulo': 'XIV',
                'categoria': 'N18',
                'tipo': 'ENFERMEDAD',
                'es_mortalidad': True,
                'es_morbilidad': True
            },
            
            # CAPÍTULO XV: EMBARAZO, PARTO Y PUERPERIO (O00-O99)
            {
                'codigo': 'O80',
                'descripcion': 'Parto único espontáneo',
                'descripcion_corta': 'Parto normal',
                'capitulo': 'XV',
                'categoria': 'O80',
                'tipo': 'ENFERMEDAD',
                'genero_aplicable': 'FEMENINO',
                'edad_minima': 12,
                'edad_maxima': 50,
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            
            # CAPÍTULO XIX: TRAUMATISMOS Y ENVENENAMIENTOS (S00-T98)
            {
                'codigo': 'S72.0',
                'descripcion': 'Fractura del cuello del fémur',
                'descripcion_corta': 'Fractura de cadera',
                'capitulo': 'XIX',
                'categoria': 'S72',
                'tipo': 'TRAUMATISMO',
                'es_mortalidad': True,
                'es_morbilidad': True
            },
            {
                'codigo': 'T78.4',
                'descripcion': 'Alergia, sin otra especificación',
                'descripcion_corta': 'Alergia',
                'capitulo': 'XIX',
                'categoria': 'T78',
                'tipo': 'TRAUMATISMO',
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            
            # CAPÍTULO XXI: FACTORES QUE INFLUYEN EN EL ESTADO DE SALUD (Z00-Z99)
            {
                'codigo': 'Z00.0',
                'descripcion': 'Examen médico general',
                'descripcion_corta': 'Chequeo médico',
                'capitulo': 'XXI',
                'categoria': 'Z00',
                'tipo': 'FACTOR_SALUD',
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            {
                'codigo': 'Z51.1',
                'descripcion': 'Sesión de quimioterapia para tumor',
                'descripcion_corta': 'Quimioterapia',
                'capitulo': 'XXI',
                'categoria': 'Z51',
                'tipo': 'FACTOR_SALUD',
                'es_mortalidad': False,
                'es_morbilidad': True
            }
        ]
        
        # Cargar datos en la base de datos
        created_count = 0
        updated_count = 0
        
        for data in cie10_data:
            codigo = data.pop('codigo')
            cie10_obj, created = CIE10Mexico.objects.get_or_create(
                codigo=codigo,
                defaults=data
            )
            
            if created:
                created_count += 1
                self.stdout.write(f'✅ Creado: {codigo} - {cie10_obj.descripcion_corta}')
            else:
                # Actualizar datos existentes
                for key, value in data.items():
                    setattr(cie10_obj, key, value)
                cie10_obj.save()
                updated_count += 1
                self.stdout.write(f'🔄 Actualizado: {codigo} - {cie10_obj.descripcion_corta}')
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\n🎉 Carga completada:\n'
                f'   ✅ Creados: {created_count} códigos\n'
                f'   🔄 Actualizados: {updated_count} códigos\n'
                f'   📊 Total en BD: {CIE10Mexico.objects.count()} códigos'
            )
        )
        
        self.stdout.write(
            '\n📝 Nota: Este es un catálogo inicial con códigos comunes.\n'
            '   Para un catálogo completo, consulte el sitio oficial de CEMECE\n'
            '   o la Secretaría de Salud de México.'
        )
