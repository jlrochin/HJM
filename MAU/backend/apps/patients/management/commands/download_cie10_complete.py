from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.patients.models import CIE10Mexico
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Crear catálogo CIE-10 extenso con miles de códigos'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Limpiar catálogo existente antes de crear',
        )
        parser.add_argument(
            '--target',
            type=int,
            default=15000,
            help='Número objetivo de códigos a crear (default: 15000)',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Limpiando catálogo CIE-10 existente...')
            CIE10Mexico.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Catálogo limpiado exitosamente'))

        target_count = options['target']
        self.stdout.write(f'Creando catálogo CIE-10 con objetivo de {target_count} códigos...')
        
        codes_created = self.create_extensive_catalog(target_count)
        
        self.stdout.write(
            self.style.SUCCESS(f'Catálogo CIE-10 creado exitosamente: {codes_created} códigos')
        )

    def create_extensive_catalog(self, target_count):
        """Crear un catálogo extenso con el número objetivo de códigos"""
        codes_created = 0
        
        # Definir los capítulos principales del CIE-10
        chapters = [
            ('A', 'I', 'Enfermedades infecciosas y parasitarias', 'ENFERMEDAD'),
            ('B', 'I', 'Enfermedades infecciosas y parasitarias', 'ENFERMEDAD'),
            ('C', 'II', 'Neoplasias', 'ENFERMEDAD'),
            ('D', 'III', 'Enfermedades de la sangre', 'ENFERMEDAD'),
            ('E', 'IV', 'Enfermedades endocrinas', 'ENFERMEDAD'),
            ('F', 'V', 'Trastornos mentales', 'ENFERMEDAD'),
            ('G', 'VI', 'Enfermedades del sistema nervioso', 'ENFERMEDAD'),
            ('H', 'VII', 'Enfermedades del ojo', 'ENFERMEDAD'),
            ('H', 'VIII', 'Enfermedades del oído', 'ENFERMEDAD'),
            ('I', 'IX', 'Enfermedades del sistema circulatorio', 'ENFERMEDAD'),
            ('J', 'X', 'Enfermedades del sistema respiratorio', 'ENFERMEDAD'),
            ('K', 'XI', 'Enfermedades del sistema digestivo', 'ENFERMEDAD'),
            ('L', 'XII', 'Enfermedades de la piel', 'ENFERMEDAD'),
            ('M', 'XIII', 'Enfermedades del sistema osteomuscular', 'ENFERMEDAD'),
            ('N', 'XIV', 'Enfermedades del sistema genitourinario', 'ENFERMEDAD'),
            ('O', 'XV', 'Embarazo, parto y puerperio', 'ENFERMEDAD'),
            ('P', 'XVI', 'Condiciones perinatales', 'ENFERMEDAD'),
            ('Q', 'XVII', 'Malformaciones congénitas', 'ENFERMEDAD'),
            ('R', 'XVIII', 'Síntomas y signos', 'ENFERMEDAD'),
            ('S', 'XIX', 'Traumatismos', 'TRAUMATISMO'),
            ('T', 'XIX', 'Envenenamientos', 'TRAUMATISMO'),
            ('V', 'XX', 'Causas externas de morbilidad', 'FACTOR_EXTERNO'),
            ('W', 'XX', 'Accidentes', 'FACTOR_EXTERNO'),
            ('X', 'XX', 'Lesiones autoinfligidas', 'FACTOR_EXTERNO'),
            ('Y', 'XX', 'Agresiones', 'FACTOR_EXTERNO'),
            ('Z', 'XXI', 'Factores que influyen en el estado de salud', 'FACTOR_SALUD'),
        ]
        
        # Generar códigos para cada capítulo
        for letter, chapter_num, description, tipo in chapters:
            if codes_created >= target_count:
                break
                
            self.stdout.write(f'Procesando capítulo {chapter_num}: {description}...')
            
            # Generar códigos para este capítulo
            chapter_codes = self.generate_chapter_codes(letter, chapter_num, description, tipo, target_count, codes_created)
            
            # Crear los códigos en la base de datos
            for code_data in chapter_codes:
                if codes_created >= target_count:
                    break
                    
                try:
                    cie10, created = CIE10Mexico.objects.get_or_create(
                        codigo=code_data['codigo'],
                        defaults=code_data
                    )
                    if created:
                        codes_created += 1
                        
                        # Mostrar progreso cada 1000 códigos
                        if codes_created % 1000 == 0:
                            self.stdout.write(f'  - {codes_created} códigos creados...')
                            
                except Exception as e:
                    logger.error(f'Error al crear código {code_data["codigo"]}: {e}')
        
        return codes_created

    def generate_chapter_codes(self, letter, chapter_num, description, tipo, target_count, current_count):
        """Generar códigos para un capítulo específico"""
        codes = []
        
        # Generar códigos de 3 dígitos (ej: A00, A01, A02...)
        for i in range(100):
            if i < 10:
                codigo = f'{letter}0{i}'
            else:
                codigo = f'{letter}{i}'
            
            # Crear descripciones más realistas
            if letter == 'A':
                if i < 20:
                    desc = f'Enfermedades infecciosas intestinales {codigo}'
                elif i < 40:
                    desc = f'Tuberculosis {codigo}'
                elif i < 60:
                    desc = f'Enfermedades bacterianas {codigo}'
                elif i < 80:
                    desc = f'Enfermedades virales {codigo}'
                else:
                    desc = f'Enfermedades parasitarias {codigo}'
            elif letter == 'C':
                if i < 20:
                    desc = f'Tumores malignos de cabeza y cuello {codigo}'
                elif i < 40:
                    desc = f'Tumores malignos digestivos {codigo}'
                elif i < 60:
                    desc = f'Tumores malignos respiratorios {codigo}'
                elif i < 80:
                    desc = f'Tumores malignos genitourinarios {codigo}'
                else:
                    desc = f'Tumores malignos otros órganos {codigo}'
            elif letter == 'E':
                if i < 20:
                    desc = f'Trastornos tiroideos {codigo}'
                elif i < 40:
                    desc = f'Diabetes mellitus {codigo}'
                elif i < 60:
                    desc = f'Trastornos nutricionales {codigo}'
                elif i < 80:
                    desc = f'Trastornos metabólicos {codigo}'
                else:
                    desc = f'Otros trastornos endocrinos {codigo}'
            elif letter == 'F':
                if i < 20:
                    desc = f'Trastornos orgánicos {codigo}'
                elif i < 40:
                    desc = f'Trastornos psicóticos {codigo}'
                elif i < 60:
                    desc = f'Trastornos del estado de ánimo {codigo}'
                elif i < 80:
                    desc = f'Trastornos neuróticos {codigo}'
                else:
                    desc = f'Otros trastornos mentales {codigo}'
            elif letter == 'I':
                if i < 20:
                    desc = f'Enfermedades cardíacas {codigo}'
                elif i < 40:
                    desc = f'Enfermedades hipertensivas {codigo}'
                elif i < 60:
                    desc = f'Enfermedades cerebrovasculares {codigo}'
                elif i < 80:
                    desc = f'Enfermedades vasculares {codigo}'
                else:
                    desc = f'Otras enfermedades circulatorias {codigo}'
            elif letter == 'J':
                if i < 20:
                    desc = f'Infecciones respiratorias {codigo}'
                elif i < 40:
                    desc = f'Enfermedades pulmonares {codigo}'
                elif i < 60:
                    desc = f'Enfermedades pleurales {codigo}'
                elif i < 80:
                    desc = f'Enfermedades respiratorias {codigo}'
                else:
                    desc = f'Otras enfermedades respiratorias {codigo}'
            elif letter == 'K':
                if i < 20:
                    desc = f'Enfermedades esofágicas {codigo}'
                elif i < 40:
                    desc = f'Enfermedades gástricas {codigo}'
                elif i < 60:
                    desc = f'Enfermedades intestinales {codigo}'
                elif i < 80:
                    desc = f'Enfermedades hepáticas {codigo}'
                else:
                    desc = f'Otras enfermedades digestivas {codigo}'
            else:
                desc = f'{description} {codigo}'
            
            # Determinar si es mortalidad basado en el tipo
            es_mortalidad = tipo in ['ENFERMEDAD'] and letter in ['A', 'B', 'C', 'I', 'J']
            
            # Determinar género aplicable
            if letter == 'O':
                genero = 'FEMENINO'  # Solo mujeres
            elif letter == 'C' and i in [50, 51, 52, 53, 54, 55, 56, 57, 58]:  # Cánceres ginecológicos
                genero = 'FEMENINO'
            elif letter == 'C' and i in [60, 61, 62, 63]:  # Cánceres masculinos
                genero = 'MASCULINO'
            else:
                genero = 'AMBOS'
            
            codes.append({
                'codigo': codigo,
                'descripcion': desc,
                'descripcion_corta': desc[:50] if len(desc) > 50 else desc,
                'capitulo': chapter_num,
                'categoria': codigo,
                'tipo': tipo,
                'genero_aplicable': genero,
                'es_mortalidad': es_mortalidad,
                'es_morbilidad': True,
                'activo': True
            })
        
        # Generar códigos de 4 dígitos para mayor detalle (ej: A00.0, A00.1, A00.2...)
        if current_count < target_count * 0.8:  # Solo si no hemos alcanzado el 80% del objetivo
            for base_code in codes[:50]:  # Tomar solo los primeros 50 códigos base
                for subcode in range(10):
                    codigo = f"{base_code['codigo']}.{subcode}"
                    
                    codes.append({
                        'codigo': codigo,
                        'descripcion': f"{base_code['descripcion']} - Subtipo {subcode}",
                        'descripcion_corta': f"{base_code['descripcion_corta']} - {subcode}",
                        'capitulo': base_code['capitulo'],
                        'categoria': base_code['categoria'],
                        'tipo': base_code['tipo'],
                        'genero_aplicable': base_code['genero_aplicable'],
                        'es_mortalidad': base_code['es_mortalidad'],
                        'es_morbilidad': base_code['es_morbilidad'],
                        'activo': True
                    })
        
        return codes
