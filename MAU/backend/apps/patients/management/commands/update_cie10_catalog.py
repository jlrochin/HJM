from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.patients.models import CIE10Mexico
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Actualizar el catálogo CIE-10 con códigos más completos y actualizados'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Limpiar catálogo existente antes de actualizar',
        )
        parser.add_argument(
            '--sample',
            action='store_true',
            help='Agregar solo una muestra de códigos para pruebas',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Limpiando catálogo CIE-10 existente...')
            CIE10Mexico.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Catálogo limpiado exitosamente'))

        if options['sample']:
            self.create_sample_codes()
        else:
            self.create_full_catalog()

    def create_sample_codes(self):
        """Crear una muestra de códigos CIE-10 para pruebas"""
        self.stdout.write('Creando muestra de códigos CIE-10...')
        
        sample_codes = [
            # Enfermedades infecciosas
            {
                'codigo': 'A00',
                'descripcion': 'Cólera',
                'descripcion_corta': 'Cólera',
                'capitulo': 'I',
                'categoria': 'A00',
                'tipo': 'ENFERMEDAD',
                'genero_aplicable': 'AMBOS',
                'es_mortalidad': True,
                'es_morbilidad': True
            },
            {
                'codigo': 'A15',
                'descripcion': 'Tuberculosis respiratoria',
                'descripcion_corta': 'TBC respiratoria',
                'capitulo': 'I',
                'categoria': 'A15',
                'tipo': 'ENFERMEDAD',
                'genero_aplicable': 'AMBOS',
                'es_mortalidad': True,
                'es_morbilidad': True
            },
            {
                'codigo': 'B20',
                'descripcion': 'Enfermedad por VIH',
                'descripcion_corta': 'VIH',
                'capitulo': 'I',
                'categoria': 'B20',
                'tipo': 'ENFERMEDAD',
                'genero_aplicable': 'AMBOS',
                'es_mortalidad': True,
                'es_morbilidad': True
            },
            
            # Neoplasias
            {
                'codigo': 'C50',
                'descripcion': 'Tumor maligno de mama',
                'descripcion_corta': 'Cáncer de mama',
                'capitulo': 'II',
                'categoria': 'C50',
                'tipo': 'ENFERMEDAD',
                'genero_aplicable': 'FEMENINO',
                'es_mortalidad': True,
                'es_morbilidad': True
            },
            {
                'codigo': 'C34',
                'descripcion': 'Tumor maligno de bronquios y pulmón',
                'descripcion_corta': 'Cáncer de pulmón',
                'capitulo': 'II',
                'categoria': 'C34',
                'tipo': 'ENFERMEDAD',
                'genero_aplicable': 'AMBOS',
                'es_mortalidad': True,
                'es_morbilidad': True
            },
            
            # Enfermedades de la sangre
            {
                'codigo': 'D50',
                'descripcion': 'Anemia por deficiencia de hierro',
                'descripcion_corta': 'Anemia ferropénica',
                'capitulo': 'III',
                'categoria': 'D50',
                'tipo': 'ENFERMEDAD',
                'genero_aplicable': 'AMBOS',
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            
            # Enfermedades endocrinas
            {
                'codigo': 'E11',
                'descripcion': 'Diabetes mellitus tipo 2',
                'descripcion_corta': 'DM tipo 2',
                'capitulo': 'IV',
                'categoria': 'E11',
                'tipo': 'ENFERMEDAD',
                'genero_aplicable': 'AMBOS',
                'es_mortalidad': True,
                'es_morbilidad': True
            },
            {
                'codigo': 'E04',
                'descripcion': 'Otros bocios no tóxicos',
                'descripcion_corta': 'Bocio no tóxico',
                'capitulo': 'IV',
                'categoria': 'E04',
                'tipo': 'ENFERMEDAD',
                'genero_aplicable': 'AMBOS',
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            
            # Enfermedades mentales
            {
                'codigo': 'F32',
                'descripcion': 'Episodio depresivo',
                'descripcion_corta': 'Depresión',
                'capitulo': 'V',
                'categoria': 'F32',
                'tipo': 'ENFERMEDAD',
                'genero_aplicable': 'AMBOS',
                'es_mortalidad': True,
                'es_morbilidad': True
            },
            {
                'codigo': 'F41',
                'descripcion': 'Otros trastornos de ansiedad',
                'descripcion_corta': 'Trastorno de ansiedad',
                'capitulo': 'V',
                'categoria': 'F41',
                'tipo': 'ENFERMEDAD',
                'genero_aplicable': 'AMBOS',
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            
            # Enfermedades del sistema nervioso
            {
                'codigo': 'G40',
                'descripcion': 'Epilepsia y síndromes epilépticos',
                'descripcion_corta': 'Epilepsia',
                'capitulo': 'VI',
                'categoria': 'G40',
                'tipo': 'ENFERMEDAD',
                'genero_aplicable': 'AMBOS',
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            
            # Enfermedades del ojo
            {
                'codigo': 'H25',
                'descripcion': 'Catarata senil',
                'descripcion_corta': 'Catarata senil',
                'capitulo': 'VII',
                'categoria': 'H25',
                'tipo': 'ENFERMEDAD',
                'genero_aplicable': 'AMBOS',
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            
            # Enfermedades del oído
            {
                'codigo': 'H65',
                'descripcion': 'Otitis media no supurativa',
                'descripcion_corta': 'Otitis media',
                'capitulo': 'VIII',
                'categoria': 'H65',
                'tipo': 'ENFERMEDAD',
                'genero_aplicable': 'AMBOS',
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            
            # Enfermedades del sistema circulatorio
            {
                'codigo': 'I10',
                'descripcion': 'Hipertensión esencial (primaria)',
                'descripcion_corta': 'Hipertensión',
                'capitulo': 'IX',
                'categoria': 'I10',
                'tipo': 'ENFERMEDAD',
                'genero_aplicable': 'AMBOS',
                'es_mortalidad': True,
                'es_morbilidad': True
            },
            {
                'codigo': 'I25',
                'descripcion': 'Enfermedad isquémica crónica del corazón',
                'descripcion_corta': 'Cardiopatía isquémica',
                'capitulo': 'IX',
                'categoria': 'I25',
                'tipo': 'ENFERMEDAD',
                'genero_aplicable': 'AMBOS',
                'es_mortalidad': True,
                'es_morbilidad': True
            },
            
            # Enfermedades del sistema respiratorio
            {
                'codigo': 'J44',
                'descripcion': 'Otra enfermedad pulmonar obstructiva crónica',
                'descripcion_corta': 'EPOC',
                'capitulo': 'X',
                'categoria': 'J44',
                'tipo': 'ENFERMEDAD',
                'genero_aplicable': 'AMBOS',
                'es_mortalidad': True,
                'es_morbilidad': True
            },
            {
                'codigo': 'J45',
                'descripcion': 'Asma',
                'descripcion_corta': 'Asma',
                'capitulo': 'X',
                'categoria': 'J45',
                'tipo': 'ENFERMEDAD',
                'genero_aplicable': 'AMBOS',
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            
            # Enfermedades del sistema digestivo
            {
                'codigo': 'K29',
                'descripcion': 'Gastritis y duodenitis',
                'descripcion_corta': 'Gastritis',
                'capitulo': 'XI',
                'categoria': 'K29',
                'tipo': 'ENFERMEDAD',
                'genero_aplicable': 'AMBOS',
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            {
                'codigo': 'K70',
                'descripcion': 'Enfermedad alcohólica del hígado',
                'descripcion_corta': 'Hepatitis alcohólica',
                'capitulo': 'XI',
                'categoria': 'K70',
                'tipo': 'ENFERMEDAD',
                'genero_aplicable': 'AMBOS',
                'es_mortalidad': True,
                'es_morbilidad': True
            },
            
            # Enfermedades de la piel
            {
                'codigo': 'L23',
                'descripcion': 'Dermatitis atópica',
                'descripcion_corta': 'Dermatitis atópica',
                'capitulo': 'XII',
                'categoria': 'L23',
                'tipo': 'ENFERMEDAD',
                'genero_aplicable': 'AMBOS',
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            
            # Enfermedades del sistema osteomuscular
            {
                'codigo': 'M15',
                'descripcion': 'Poliartrosis',
                'descripcion_corta': 'Poliartrosis',
                'capitulo': 'XIII',
                'categoria': 'M15',
                'tipo': 'ENFERMEDAD',
                'genero_aplicable': 'AMBOS',
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            {
                'codigo': 'M79',
                'descripcion': 'Otros trastornos de los tejidos blandos',
                'descripcion_corta': 'Trastornos tejidos blandos',
                'capitulo': 'XIII',
                'categoria': 'M79',
                'tipo': 'ENFERMEDAD',
                'genero_aplicable': 'AMBOS',
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            
            # Enfermedades del sistema genitourinario
            {
                'codigo': 'N18',
                'descripcion': 'Insuficiencia renal crónica',
                'descripcion_corta': 'Insuficiencia renal',
                'capitulo': 'XIV',
                'categoria': 'N18',
                'tipo': 'ENFERMEDAD',
                'genero_aplicable': 'AMBOS',
                'es_mortalidad': True,
                'es_morbilidad': True
            },
            
            # Embarazo y parto
            {
                'codigo': 'O80',
                'descripcion': 'Parto único espontáneo',
                'descripcion_corta': 'Parto espontáneo',
                'capitulo': 'XV',
                'categoria': 'O80',
                'tipo': 'ENFERMEDAD',
                'genero_aplicable': 'FEMENINO',
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            
            # Condiciones perinatales
            {
                'codigo': 'P05',
                'descripcion': 'Retraso del crecimiento fetal',
                'descripcion_corta': 'Retraso crecimiento fetal',
                'capitulo': 'XVI',
                'categoria': 'P05',
                'tipo': 'ENFERMEDAD',
                'genero_aplicable': 'AMBOS',
                'es_mortalidad': True,
                'es_morbilidad': True
            },
            
            # Malformaciones congénitas
            {
                'codigo': 'Q21',
                'descripcion': 'Defectos del tabique cardíaco',
                'descripcion_corta': 'Defecto tabique cardíaco',
                'capitulo': 'XVII',
                'categoria': 'Q21',
                'tipo': 'ENFERMEDAD',
                'genero_aplicable': 'AMBOS',
                'es_mortalidad': True,
                'es_morbilidad': True
            },
            
            # Síntomas y signos
            {
                'codigo': 'R50',
                'descripcion': 'Fiebre de origen desconocido',
                'descripcion_corta': 'Fiebre',
                'capitulo': 'XVIII',
                'categoria': 'R50',
                'tipo': 'ENFERMEDAD',
                'genero_aplicable': 'AMBOS',
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            {
                'codigo': 'R51',
                'descripcion': 'Cefalea',
                'descripcion_corta': 'Dolor de cabeza',
                'capitulo': 'XVIII',
                'categoria': 'R51',
                'tipo': 'ENFERMEDAD',
                'genero_aplicable': 'AMBOS',
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            
            # Lesiones y envenenamientos
            {
                'codigo': 'S72',
                'descripcion': 'Fractura del fémur',
                'descripcion_corta': 'Fractura fémur',
                'capitulo': 'XIX',
                'categoria': 'S72',
                'tipo': 'TRAUMATISMO',
                'genero_aplicable': 'AMBOS',
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            {
                'codigo': 'T78',
                'descripcion': 'Efectos adversos no especificados',
                'descripcion_corta': 'Efectos adversos',
                'capitulo': 'XIX',
                'categoria': 'T78',
                'tipo': 'TRAUMATISMO',
                'genero_aplicable': 'AMBOS',
                'es_mortalidad': False,
                'es_morbilidad': True
            },
            
            # Causas externas
            {
                'codigo': 'V43',
                'descripcion': 'Ocupante de automóvil lesionado',
                'descripcion_corta': 'Accidente automóvil',
                'capitulo': 'XX',
                'categoria': 'V43',
                'tipo': 'FACTOR_EXTERNO',
                'genero_aplicable': 'AMBOS',
                'es_mortalidad': True,
                'es_morbilidad': True
            },
            
            # Factores que influyen en el estado de salud
            {
                'codigo': 'Z23',
                'descripcion': 'Consulta para inmunización',
                'descripcion_corta': 'Consulta inmunización',
                'capitulo': 'XXI',
                'categoria': 'Z23',
                'tipo': 'FACTOR_SALUD',
                'genero_aplicable': 'AMBOS',
                'es_mortalidad': False,
                'es_morbilidad': False
            },
            {
                'codigo': 'Z51',
                'descripcion': 'Consulta para procedimientos médicos',
                'descripcion_corta': 'Consulta médica',
                'capitulo': 'XXI',
                'categoria': 'Z51',
                'tipo': 'FACTOR_SALUD',
                'genero_aplicable': 'AMBOS',
                'es_mortalidad': False,
                'es_morbilidad': False
            }
        ]
        
        created_count = 0
        for code_data in sample_codes:
            try:
                cie10, created = CIE10Mexico.objects.get_or_create(
                    codigo=code_data['codigo'],
                    defaults={
                        'descripcion': code_data['descripcion'],
                        'descripcion_corta': code_data['descripcion_corta'],
                        'capitulo': code_data['capitulo'],
                        'categoria': code_data['categoria'],
                        'tipo': code_data['tipo'],
                        'genero_aplicable': code_data['genero_aplicable'],
                        'es_mortalidad': code_data['es_mortalidad'],
                        'es_morbilidad': code_data['es_morbilidad'],
                        'activo': True
                    }
                )
                if created:
                    created_count += 1
            except Exception as e:
                logger.error(f'Error al crear código {code_data["codigo"]}: {e}')
        
        self.stdout.write(
            self.style.SUCCESS(f'Se crearon {created_count} códigos CIE-10 de muestra')
        )

    def create_full_catalog(self):
        """Crear catálogo completo de CIE-10"""
        self.stdout.write('Creando catálogo completo de CIE-10...')
        
        # Códigos principales por categorías
        categories = {
            'Enfermedades infecciosas (A00-B99)': [
                ('A00', 'Cólera', 'Cólera', 'I', 'A00', 'ENFERMEDAD', 'AMBOS', True, True),
                ('A01', 'Fiebres tifoidea y paratifoidea', 'Fiebre tifoidea', 'I', 'A01', 'ENFERMEDAD', 'AMBOS', True, True),
                ('A02', 'Otras infecciones por Salmonella', 'Salmonelosis', 'I', 'A02', 'ENFERMEDAD', 'AMBOS', False, True),
                ('A03', 'Shigelosis', 'Shigelosis', 'I', 'A03', 'ENFERMEDAD', 'AMBOS', False, True),
                ('A04', 'Otras infecciones bacterianas intestinales', 'Infección intestinal', 'I', 'A04', 'ENFERMEDAD', 'AMBOS', False, True),
                ('A05', 'Otras intoxicaciones bacterianas por alimentos', 'Intoxicación alimentaria', 'I', 'A05', 'ENFERMEDAD', 'AMBOS', False, True),
                ('A06', 'Amebiasis', 'Amebiasis', 'I', 'A06', 'ENFERMEDAD', 'AMBOS', False, True),
                ('A07', 'Otras enfermedades intestinales por protozoarios', 'Enfermedad protozoaria', 'I', 'A07', 'ENFERMEDAD', 'AMBOS', False, True),
                ('A08', 'Infecciones intestinales virales', 'Infección viral intestinal', 'I', 'A08', 'ENFERMEDAD', 'AMBOS', False, True),
                ('A09', 'Gastroenteritis y colitis de origen infeccioso', 'Gastroenteritis', 'I', 'A09', 'ENFERMEDAD', 'AMBOS', False, True),
                ('A15', 'Tuberculosis respiratoria', 'TBC respiratoria', 'I', 'A15', 'ENFERMEDAD', 'AMBOS', True, True),
                ('A16', 'Tuberculosis respiratoria no confirmada', 'TBC no confirmada', 'I', 'A16', 'ENFERMEDAD', 'AMBOS', True, True),
                ('A17', 'Tuberculosis del sistema nervioso', 'TBC sistema nervioso', 'I', 'A17', 'ENFERMEDAD', 'AMBOS', True, True),
                ('A18', 'Tuberculosis de otros órganos', 'TBC otros órganos', 'I', 'A18', 'ENFERMEDAD', 'AMBOS', True, True),
                ('A19', 'Tuberculosis miliar', 'TBC miliar', 'I', 'A19', 'ENFERMEDAD', 'AMBOS', True, True),
                ('B20', 'Enfermedad por VIH', 'VIH', 'I', 'B20', 'ENFERMEDAD', 'AMBOS', True, True),
                ('B21', 'Enfermedad por VIH que causa neoplasias malignas', 'VIH con cáncer', 'I', 'B21', 'ENFERMEDAD', 'AMBOS', True, True),
                ('B22', 'Enfermedad por VIH que causa otras enfermedades', 'VIH con otras enfermedades', 'I', 'B22', 'ENFERMEDAD', 'AMBOS', True, True),
                ('B23', 'Enfermedad por VIH que causa otras afecciones', 'VIH con otras afecciones', 'I', 'B23', 'ENFERMEDAD', 'AMBOS', True, True),
                ('B24', 'Enfermedad por VIH no especificada', 'VIH no especificado', 'I', 'B24', 'ENFERMEDAD', 'AMBOS', True, True),
            ],
            
            'Neoplasias (C00-D48)': [
                ('C00', 'Tumor maligno del labio', 'Cáncer de labio', 'II', 'C00', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C01', 'Tumor maligno de la base de la lengua', 'Cáncer base lengua', 'II', 'C01', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C02', 'Tumor maligno de otras partes de la lengua', 'Cáncer lengua', 'II', 'C02', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C03', 'Tumor maligno de la encía', 'Cáncer de encía', 'II', 'C03', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C04', 'Tumor maligno del suelo de la boca', 'Cáncer suelo boca', 'II', 'C04', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C05', 'Tumor maligno del paladar', 'Cáncer de paladar', 'II', 'C05', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C06', 'Tumor maligno de otras partes de la boca', 'Cáncer boca', 'II', 'C06', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C07', 'Tumor maligno de la glándula parótida', 'Cáncer parótida', 'II', 'C07', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C08', 'Tumor maligno de otras glándulas salivales', 'Cáncer glándulas salivales', 'II', 'C08', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C09', 'Tumor maligno de la amígdala', 'Cáncer de amígdala', 'II', 'C09', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C10', 'Tumor maligno de la orofaringe', 'Cáncer orofaringe', 'II', 'C10', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C11', 'Tumor maligno de la nasofaringe', 'Cáncer nasofaringe', 'II', 'C11', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C12', 'Tumor maligno del seno piriforme', 'Cáncer seno piriforme', 'II', 'C12', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C13', 'Tumor maligno de la hipofaringe', 'Cáncer hipofaringe', 'II', 'C13', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C14', 'Tumor maligno de otras localizaciones del labio', 'Cáncer labio', 'II', 'C14', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C15', 'Tumor maligno del esófago', 'Cáncer de esófago', 'II', 'C15', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C16', 'Tumor maligno del estómago', 'Cáncer de estómago', 'II', 'C16', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C17', 'Tumor maligno del intestino delgado', 'Cáncer intestino delgado', 'II', 'C17', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C18', 'Tumor maligno del colon', 'Cáncer de colon', 'II', 'C18', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C19', 'Tumor maligno de la unión rectosigmoidea', 'Cáncer rectosigmoideo', 'II', 'C19', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C20', 'Tumor maligno del recto', 'Cáncer de recto', 'II', 'C20', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C21', 'Tumor maligno del ano y del conducto anal', 'Cáncer anal', 'II', 'C21', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C22', 'Tumor maligno del hígado y de las vías biliares', 'Cáncer de hígado', 'II', 'C22', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C23', 'Tumor maligno de la vesícula biliar', 'Cáncer vesícula', 'II', 'C23', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C24', 'Tumor maligno de otras partes de las vías biliares', 'Cáncer vías biliares', 'II', 'C24', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C25', 'Tumor maligno del páncreas', 'Cáncer de páncreas', 'II', 'C25', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C26', 'Tumor maligno de otros órganos digestivos', 'Cáncer digestivo', 'II', 'C26', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C30', 'Tumor maligno de la cavidad nasal y del oído medio', 'Cáncer nasal', 'II', 'C30', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C31', 'Tumor maligno de los senos paranasales', 'Cáncer senos paranasales', 'II', 'C31', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C32', 'Tumor maligno de la laringe', 'Cáncer de laringe', 'II', 'C32', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C33', 'Tumor maligno de la tráquea', 'Cáncer de tráquea', 'II', 'C33', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C34', 'Tumor maligno de los bronquios y del pulmón', 'Cáncer de pulmón', 'II', 'C34', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C37', 'Tumor maligno del timo', 'Cáncer de timo', 'II', 'C37', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C38', 'Tumor maligno del corazón', 'Cáncer de corazón', 'II', 'C38', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C39', 'Tumor maligno de otros órganos intratorácicos', 'Cáncer intratorácico', 'II', 'C39', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C40', 'Tumor maligno de los huesos y cartílagos', 'Cáncer óseo', 'II', 'C40', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C41', 'Tumor maligno de otros huesos y cartílagos', 'Cáncer óseo', 'II', 'C41', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C43', 'Melanoma maligno de la piel', 'Melanoma', 'II', 'C43', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C44', 'Otros tumores malignos de la piel', 'Cáncer de piel', 'II', 'C44', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C45', 'Mesotelioma', 'Mesotelioma', 'II', 'C45', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C46', 'Sarcoma de Kaposi', 'Sarcoma de Kaposi', 'II', 'C46', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C47', 'Tumor maligno de los nervios periféricos', 'Cáncer nervios', 'II', 'C47', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C48', 'Tumor maligno del retroperitoneo', 'Cáncer retroperitoneo', 'II', 'C48', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C49', 'Tumor maligno de otros tejidos conectivos', 'Cáncer tejidos', 'II', 'C49', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C50', 'Tumor maligno de la mama', 'Cáncer de mama', 'II', 'C50', 'ENFERMEDAD', 'FEMENINO', True, True),
                ('C51', 'Tumor maligno de la vulva', 'Cáncer de vulva', 'II', 'C51', 'ENFERMEDAD', 'FEMENINO', True, True),
                ('C52', 'Tumor maligno de la vagina', 'Cáncer de vagina', 'II', 'C52', 'ENFERMEDAD', 'FEMENINO', True, True),
                ('C53', 'Tumor maligno del cuello del útero', 'Cáncer cervical', 'II', 'C53', 'ENFERMEDAD', 'FEMENINO', True, True),
                ('C54', 'Tumor maligno del cuerpo del útero', 'Cáncer uterino', 'II', 'C54', 'ENFERMEDAD', 'FEMENINO', True, True),
                ('C55', 'Tumor maligno del útero', 'Cáncer uterino', 'II', 'C55', 'ENFERMEDAD', 'FEMENINO', True, True),
                ('C56', 'Tumor maligno del ovario', 'Cáncer de ovario', 'II', 'C56', 'ENFERMEDAD', 'FEMENINO', True, True),
                ('C57', 'Tumor maligno de otros órganos genitales', 'Cáncer genital', 'II', 'C57', 'ENFERMEDAD', 'FEMENINO', True, True),
                ('C58', 'Tumor maligno de la placenta', 'Cáncer placentario', 'II', 'C58', 'ENFERMEDAD', 'FEMENINO', True, True),
                ('C60', 'Tumor maligno del pene', 'Cáncer de pene', 'II', 'C60', 'ENFERMEDAD', 'MASCULINO', True, True),
                ('C61', 'Tumor maligno de la próstata', 'Cáncer de próstata', 'II', 'C61', 'ENFERMEDAD', 'MASCULINO', True, True),
                ('C62', 'Tumor maligno del testículo', 'Cáncer testicular', 'II', 'C62', 'ENFERMEDAD', 'MASCULINO', True, True),
                ('C63', 'Tumor maligno de otros órganos genitales', 'Cáncer genital', 'II', 'C63', 'ENFERMEDAD', 'MASCULINO', True, True),
                ('C64', 'Tumor maligno del riñón', 'Cáncer de riñón', 'II', 'C64', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C65', 'Tumor maligno de la pelvis renal', 'Cáncer pelvis renal', 'II', 'C65', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C66', 'Tumor maligno del uréter', 'Cáncer de uréter', 'II', 'C66', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C67', 'Tumor maligno de la vejiga', 'Cáncer de vejiga', 'II', 'C67', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C68', 'Tumor maligno de otros órganos urinarios', 'Cáncer urinario', 'II', 'C68', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C69', 'Tumor maligno del ojo y sus anexos', 'Cáncer ocular', 'II', 'C69', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C70', 'Tumor maligno de las meninges', 'Cáncer meníngeo', 'II', 'C70', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C71', 'Tumor maligno del encéfalo', 'Cáncer cerebral', 'II', 'C71', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C72', 'Tumor maligno de la médula espinal', 'Cáncer medular', 'II', 'C72', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C73', 'Tumor maligno de la glándula tiroides', 'Cáncer tiroideo', 'II', 'C73', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C74', 'Tumor maligno de la glándula suprarrenal', 'Cáncer suprarrenal', 'II', 'C74', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C75', 'Tumor maligno de otras glándulas endocrinas', 'Cáncer endocrino', 'II', 'C75', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C76', 'Tumor maligno de otras localizaciones', 'Cáncer otras localizaciones', 'II', 'C76', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C77', 'Tumor maligno de ganglios linfáticos', 'Cáncer ganglionar', 'II', 'C77', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C78', 'Tumor maligno secundario de órganos digestivos', 'Metástasis digestiva', 'II', 'C78', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C79', 'Tumor maligno secundario de otras localizaciones', 'Metástasis otras', 'II', 'C79', 'ENFERMEDAD', 'AMBOS', True, True),
                ('C80', 'Tumor maligno de localización no especificada', 'Cáncer no especificado', 'II', 'C80', 'ENFERMEDAD', 'AMBOS', True, True),
            ]
        }
        
        total_created = 0
        for category_name, codes in categories.items():
            self.stdout.write(f'Procesando {category_name}...')
            category_created = 0
            
            for codigo, descripcion, descripcion_corta, capitulo, categoria, tipo, genero, mortalidad, morbilidad in codes:
                try:
                    cie10, created = CIE10Mexico.objects.get_or_create(
                        codigo=codigo,
                        defaults={
                            'descripcion': descripcion,
                            'descripcion_corta': descripcion_corta,
                            'capitulo': capitulo,
                            'categoria': categoria,
                            'tipo': tipo,
                            'genero_aplicable': genero,
                            'es_mortalidad': mortalidad,
                            'es_morbilidad': morbilidad,
                            'activo': True
                        }
                    )
                    if created:
                        category_created += 1
                        total_created += 1
                except Exception as e:
                    logger.error(f'Error al crear código {codigo}: {e}')
            
            self.stdout.write(f'  - {category_name}: {category_created} códigos creados')
        
        self.stdout.write(
            self.style.SUCCESS(f'Catálogo CIE-10 actualizado: {total_created} códigos creados')
        )
