#!/usr/bin/env python3
"""
Comando de Django para cargar un catálogo extendido CIE-10 México
Incluye más códigos comunes y categorías adicionales
"""

from django.core.management.base import BaseCommand
from apps.patients.models import CIE10Mexico


class Command(BaseCommand):
    help = 'Carga un catálogo extendido de CIE-10 México con más códigos comunes'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Fuerza la recarga de datos, eliminando los existentes'
        )

    def handle(self, *args, **options):
        self.stdout.write('🏥 Iniciando carga del catálogo extendido CIE-10 México...')
        
        if options['force']:
            self.stdout.write('⚠️  Eliminando datos existentes...')
            CIE10Mexico.objects.all().delete()
        
        # Catálogo extendido con códigos más comunes
        cie10_extended_data = [
            # CAPÍTULO I: ENFERMEDADES INFECCIOSAS (A00-B99) - Más códigos
            {
                'codigo': 'A15.9',
                'descripcion': 'Tuberculosis respiratoria, sin confirmación histológica o bacteriológica',
                'descripcion_corta': 'Tuberculosis pulmonar',
                'capitulo': 'I',
                'categoria': 'A15',
                'tipo': 'ENFERMEDAD',
                'es_mortalidad': True,
                'es_morbilidad': True
            },
            {
                'codigo': 'B20',
                'descripcion': 'Enfermedad por virus de la inmunodeficiencia humana [VIH], resultando en enfermedades infecciosas y parasitarias',
                'descripcion_corta': 'VIH/SIDA',
                'capitulo': 'I',
                'categoria': 'B20',
                'tipo': 'ENFERMEDAD',
                'edad_minima': 15,
                'es_mortalidad': True,
                'es_morbilidad': True
            },
            
            # CAPÍTULO II: TUMORES (C00-D48) - Ampliado
            {
                'codigo': 'C16.9',
                'descripcion': 'Tumor maligno del estómago, parte no especificada',
                'descripcion_corta': 'Cáncer gástrico',
                'capitulo': 'II',
                'categoria': 'C16',
                'tipo': 'ENFERMEDAD',
                'edad_minima': 40,
                'es_mortalidad': True,
                'es_morbilidad': True
            },
            {
                'codigo': 'C25.9',
                'descripcion': 'Tumor maligno del páncreas, parte no especificada',
                'descripcion_corta': 'Cáncer de páncreas',
                'capitulo': 'II',
                'categoria': 'C25',
                'tipo': 'ENFERMEDAD',
                'edad_minima': 50,
                'es_mortalidad': True,
                'es_morbilidad': True
            },
            {
                'codigo': 'C34.1',
                'descripcion': 'Tumor maligno del lóbulo superior, bronquio o pulmón',
                'descripcion_corta': 'Cáncer pulmonar',
                'capitulo': 'II',
                'categoria': 'C34',
                'tipo': 'ENFERMEDAD',
                'edad_minima': 40,
                'es_mortalidad': True,
                'es_morbilidad': True
            },
            
            # CAPÍTULO IV: ENFERMEDADES ENDOCRINAS (E00-E90) - Ampliado
            {
                'codigo': 'E03.9',
                'descripcion': 'Hipotiroidismo, sin otra especificación',
                'descripcion_corta': 'Hipotiroidismo',
                'capitulo': 'IV',
                'categoria': 'E03',
                'tipo': 'ENFERMEDAD',
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            {
                'codigo': 'E05.9',
                'descripcion': 'Tirotoxicosis, sin otra especificación',
                'descripcion_corta': 'Hipertiroidismo',
                'capitulo': 'IV',
                'categoria': 'E05',
                'tipo': 'ENFERMEDAD',
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            {
                'codigo': 'E78.5',
                'descripcion': 'Hiperlipidemia, sin otra especificación',
                'descripcion_corta': 'Hiperlipidemia',
                'capitulo': 'IV',
                'categoria': 'E78',
                'tipo': 'ENFERMEDAD',
                'edad_minima': 20,
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            
            # CAPÍTULO VI: ENFERMEDADES DEL SISTEMA NERVIOSO (G00-G99)
            {
                'codigo': 'G40.9',
                'descripcion': 'Epilepsia, sin otra especificación',
                'descripcion_corta': 'Epilepsia',
                'capitulo': 'VI',
                'categoria': 'G40',
                'tipo': 'ENFERMEDAD',
                'es_mortalidad': True,
                'es_morbilidad': True
            },
            {
                'codigo': 'G43.9',
                'descripcion': 'Migraña, sin otra especificación',
                'descripcion_corta': 'Migraña',
                'capitulo': 'VI',
                'categoria': 'G43',
                'tipo': 'ENFERMEDAD',
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            {
                'codigo': 'G35',
                'descripcion': 'Esclerosis múltiple',
                'descripcion_corta': 'Esclerosis múltiple',
                'capitulo': 'VI',
                'categoria': 'G35',
                'tipo': 'ENFERMEDAD',
                'edad_minima': 20,
                'edad_maxima': 60,
                'es_mortalidad': True,
                'es_morbilidad': True
            },
            
            # CAPÍTULO VII: ENFERMEDADES DEL OJO (H00-H59)
            {
                'codigo': 'H25.9',
                'descripcion': 'Catarata senil, sin otra especificación',
                'descripcion_corta': 'Cataratas',
                'capitulo': 'VII',
                'categoria': 'H25',
                'tipo': 'ENFERMEDAD',
                'edad_minima': 50,
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            {
                'codigo': 'H40.9',
                'descripcion': 'Glaucoma, sin otra especificación',
                'descripcion_corta': 'Glaucoma',
                'capitulo': 'VII',
                'categoria': 'H40',
                'tipo': 'ENFERMEDAD',
                'edad_minima': 40,
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            
            # CAPÍTULO VIII: ENFERMEDADES DEL OÍDO (H60-H95)
            {
                'codigo': 'H90.5',
                'descripcion': 'Pérdida de la audición neurosensorial, sin otra especificación',
                'descripcion_corta': 'Hipoacusia neurosensorial',
                'capitulo': 'VIII',
                'categoria': 'H90',
                'tipo': 'ENFERMEDAD',
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            
            # CAPÍTULO IX: ENFERMEDADES CIRCULATORIAS (I00-I99) - Ampliado
            {
                'codigo': 'I25.9',
                'descripcion': 'Enfermedad isquémica crónica del corazón, sin otra especificación',
                'descripcion_corta': 'Cardiopatía isquémica',
                'capitulo': 'IX',
                'categoria': 'I25',
                'tipo': 'ENFERMEDAD',
                'edad_minima': 40,
                'es_mortalidad': True,
                'es_morbilidad': True
            },
            {
                'codigo': 'I64',
                'descripcion': 'Accidente vascular encefálico, no especificado como hemorrágico o isquémico',
                'descripcion_corta': 'Accidente cerebrovascular',
                'capitulo': 'IX',
                'categoria': 'I64',
                'tipo': 'ENFERMEDAD',
                'edad_minima': 50,
                'es_mortalidad': True,
                'es_morbilidad': True
            },
            {
                'codigo': 'I80.9',
                'descripcion': 'Flebitis y tromboflebitis de sitio no especificado',
                'descripcion_corta': 'Tromboflebitis',
                'capitulo': 'IX',
                'categoria': 'I80',
                'tipo': 'ENFERMEDAD',
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            
            # CAPÍTULO XII: ENFERMEDADES DE LA PIEL (L00-L99)
            {
                'codigo': 'L40.9',
                'descripcion': 'Psoriasis, sin otra especificación',
                'descripcion_corta': 'Psoriasis',
                'capitulo': 'XII',
                'categoria': 'L40',
                'tipo': 'ENFERMEDAD',
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            {
                'codigo': 'L20.9',
                'descripcion': 'Dermatitis atópica, sin otra especificación',
                'descripcion_corta': 'Dermatitis atópica',
                'capitulo': 'XII',
                'categoria': 'L20',
                'tipo': 'ENFERMEDAD',
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            
            # CAPÍTULO XIII: ENFERMEDADES OSTEOMUSICUALRES (M00-M99) - Ampliado
            {
                'codigo': 'M15.9',
                'descripcion': 'Poliartrosis, sin otra especificación',
                'descripcion_corta': 'Artrosis',
                'capitulo': 'XIII',
                'categoria': 'M15',
                'tipo': 'ENFERMEDAD',
                'edad_minima': 50,
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            {
                'codigo': 'M54.5',
                'descripcion': 'Lumbago',
                'descripcion_corta': 'Lumbalgia',
                'capitulo': 'XIII',
                'categoria': 'M54',
                'tipo': 'ENFERMEDAD',
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            {
                'codigo': 'M81.9',
                'descripcion': 'Osteoporosis, sin otra especificación',
                'descripcion_corta': 'Osteoporosis',
                'capitulo': 'XIII',
                'categoria': 'M81',
                'tipo': 'ENFERMEDAD',
                'edad_minima': 50,
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            
            # CAPÍTULO XIV: ENFERMEDADES GENITOURINARIAS (N00-N99) - Ampliado
            {
                'codigo': 'N20.0',
                'descripcion': 'Cálculo del riñón',
                'descripcion_corta': 'Litiasis renal',
                'capitulo': 'XIV',
                'categoria': 'N20',
                'tipo': 'ENFERMEDAD',
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            {
                'codigo': 'N39.0',
                'descripcion': 'Infección de vías urinarias, sitio no especificado',
                'descripcion_corta': 'Infección urinaria',
                'capitulo': 'XIV',
                'categoria': 'N39',
                'tipo': 'ENFERMEDAD',
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            {
                'codigo': 'N40',
                'descripcion': 'Hiperplasia de la próstata',
                'descripcion_corta': 'Hiperplasia prostática',
                'capitulo': 'XIV',
                'categoria': 'N40',
                'tipo': 'ENFERMEDAD',
                'genero_aplicable': 'MASCULINO',
                'edad_minima': 50,
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            
            # CAPÍTULO XVIII: SÍNTOMAS Y HALLAZGOS (R00-R99)
            {
                'codigo': 'R06.0',
                'descripcion': 'Disnea',
                'descripcion_corta': 'Dificultad respiratoria',
                'capitulo': 'XVIII',
                'categoria': 'R06',
                'tipo': 'ENFERMEDAD',
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            {
                'codigo': 'R10.4',
                'descripcion': 'Otros dolores abdominales y los no especificados',
                'descripcion_corta': 'Dolor abdominal',
                'capitulo': 'XVIII',
                'categoria': 'R10',
                'tipo': 'ENFERMEDAD',
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            {
                'codigo': 'R50.9',
                'descripcion': 'Fiebre, sin otra especificación',
                'descripcion_corta': 'Fiebre',
                'capitulo': 'XVIII',
                'categoria': 'R50',
                'tipo': 'ENFERMEDAD',
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            
            # CAPÍTULO XX: CAUSAS EXTERNAS (V01-Y98)
            {
                'codigo': 'V89.2',
                'descripcion': 'Persona lesionada en accidente de tránsito de vehículo de motor no especificado, tipo de accidente no especificado',
                'descripcion_corta': 'Accidente de tránsito',
                'capitulo': 'XX',
                'categoria': 'V89',
                'tipo': 'FACTOR_EXTERNO',
                'es_mortalidad': True,
                'es_morbilidad': True
            },
            {
                'codigo': 'W19',
                'descripcion': 'Caída no especificada',
                'descripcion_corta': 'Caída',
                'capitulo': 'XX',
                'categoria': 'W19',
                'tipo': 'FACTOR_EXTERNO',
                'es_mortalidad': True,
                'es_morbilidad': True
            },
        ]
        
        # Cargar datos en la base de datos
        created_count = 0
        updated_count = 0
        
        for data in cie10_extended_data:
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
                f'\n🎉 Carga del catálogo extendido completada:\n'
                f'   ✅ Creados: {created_count} códigos\n'
                f'   🔄 Actualizados: {updated_count} códigos\n'
                f'   📊 Total en BD: {CIE10Mexico.objects.count()} códigos'
            )
        )
        
        # Mostrar estadísticas por capítulo
        self.stdout.write('\n📊 Estadísticas por capítulo:')
        capitulos = CIE10Mexico.objects.values('capitulo').distinct().order_by('capitulo')
        for cap in capitulos:
            capitulo = cap['capitulo']
            count = CIE10Mexico.objects.filter(capitulo=capitulo).count()
            self.stdout.write(f'   Capítulo {capitulo}: {count} códigos')

