from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.patients.models import CIE10Mexico
import os
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Importar catálogo CIE-10 real desde archivo'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Limpiar catálogo existente antes de importar',
        )
        parser.add_argument(
            '--file',
            type=str,
            default='cie10_catalog.txt',
            help='Archivo con códigos CIE-10 (default: cie10_catalog.txt)',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Limpiando catálogo CIE-10 existente...')
            CIE10Mexico.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Catálogo limpiado exitosamente'))

        file_path = options['file']
        
        # Buscar el archivo en diferentes ubicaciones
        possible_paths = [
            file_path,
            os.path.join(os.getcwd(), file_path),
            os.path.join(os.path.dirname(os.getcwd()), file_path),
            os.path.join(os.path.dirname(os.path.dirname(os.getcwd())), file_path),
        ]
        
        file_found = None
        for path in possible_paths:
            if os.path.exists(path):
                file_found = path
                break
        
        if not file_found:
            self.stdout.write(self.style.ERROR(f'Archivo no encontrado: {file_path}'))
            self.stdout.write('Buscando en directorios:')
            for path in possible_paths:
                self.stdout.write(f'  - {path}')
            return

        self.stdout.write(f'Importando desde: {file_found}')
        
        try:
            codes_imported = self.import_from_file(file_found)
            self.stdout.write(
                self.style.SUCCESS(f'Catálogo CIE-10 importado exitosamente: {codes_imported} códigos')
            )
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error al importar: {str(e)}'))
            logger.error(f'Error al importar CIE-10: {str(e)}')

    def import_from_file(self, file_path):
        codes_imported = 0
        
        with open(file_path, 'r', encoding='utf-8') as file:
            for line_num, line in enumerate(file, 1):
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                
                try:
                    # Procesar la línea según el formato del archivo
                    code_data = self.parse_line(line)
                    if code_data:
                        cie10, created = CIE10Mexico.objects.get_or_create(
                            codigo=code_data['codigo'],
                            defaults=code_data
                        )
                        if created:
                            codes_imported += 1
                            
                            if codes_imported % 1000 == 0:
                                self.stdout.write(f'  - {codes_imported} códigos importados...')
                                
                except Exception as e:
                    self.stdout.write(f'Error en línea {line_num}: {line[:50]}... - {str(e)}')
                    logger.warning(f'Error en línea {line_num}: {str(e)}')
                    continue
        
        return codes_imported

    def parse_line(self, line):
        """
        Parsear línea del archivo CIE-10 CSV.
        El archivo tiene columnas: CONSECUTIVO,LETRA,CATALOG_KEY,NO. CARACTERES,NOMBRE,...
        """
        # Dividir por comas, pero manejar comillas
        parts = []
        current_part = ""
        in_quotes = False
        
        for char in line:
            if char == '"':
                in_quotes = not in_quotes
            elif char == ',' and not in_quotes:
                parts.append(current_part.strip())
                current_part = ""
            else:
                current_part += char
        
        parts.append(current_part.strip())
        
        if len(parts) >= 5:  # Necesitamos al menos 5 columnas
            # Campos principales
            codigo = parts[2].strip()  # CATALOG_KEY
            descripcion = parts[4].strip()  # NOMBRE
            
            # Limpiar descripción de comillas
            if descripcion.startswith('"') and descripcion.endswith('"'):
                descripcion = descripcion[1:-1]
            
            if codigo and descripcion:
                # Mapear todos los campos del CSV
                data = {
                    'codigo': codigo,
                    'descripcion': descripcion,
                    'descripcion_corta': descripcion[:50] if len(descripcion) > 50 else descripcion,
                    'consecutivo': self.safe_int(parts[0]) if len(parts) > 0 else None,
                    'letra': parts[1].strip() if len(parts) > 1 else None,
                    'no_caracteres': self.safe_int(parts[3]) if len(parts) > 3 else None,
                    'codigox': parts[5].strip() if len(parts) > 5 else None,
                    'lsex': parts[6].strip() if len(parts) > 6 else None,
                    'linf': parts[7].strip() if len(parts) > 7 else None,
                    'lsup': parts[8].strip() if len(parts) > 8 else None,
                    'trivial': parts[9].strip() if len(parts) > 9 else None,
                    'erradicado': parts[10].strip() if len(parts) > 10 else None,
                    'n_inter': parts[11].strip() if len(parts) > 11 else None,
                    'nin': parts[12].strip() if len(parts) > 12 else None,
                    'ninmtobs': parts[13].strip() if len(parts) > 13 else None,
                    'cod_sit_lesion': parts[14].strip() if len(parts) > 14 else None,
                    'no_cbd': parts[15].strip() if len(parts) > 15 else None,
                    'cbd': parts[16].strip() if len(parts) > 16 else None,
                    'no_aph': parts[17].strip() if len(parts) > 17 else None,
                    'af_prin': parts[18].strip() if len(parts) > 18 else None,
                    'dia_sis': parts[19].strip() if len(parts) > 19 else None,
                    'clave_programa_sis': parts[20].strip() if len(parts) > 20 else None,
                    'cod_complemen_morbi': parts[21].strip() if len(parts) > 21 else None,
                    'dia_fetal': parts[22].strip() if len(parts) > 22 else None,
                    'def_fetal_cm': parts[23].strip() if len(parts) > 23 else None,
                    'def_fetal_cbd': parts[24].strip() if len(parts) > 24 else None,
                    'clave_capitulo': parts[25].strip() if len(parts) > 25 else None,
                    'nombre_capitulo': parts[26].strip() if len(parts) > 26 else None,
                    'lista1': parts[27].strip() if len(parts) > 27 else None,
                    'grupo1': parts[28].strip() if len(parts) > 28 else None,
                    'lista5': parts[29].strip() if len(parts) > 29 else None,
                    'rubrica_type': parts[30].strip() if len(parts) > 30 else None,
                    'year_modifi': parts[31].strip() if len(parts) > 31 else None,
                    'year_aplicacion': parts[32].strip() if len(parts) > 32 else None,
                    'valid': parts[33].strip() if len(parts) > 33 else None,
                    'prinmorta': parts[34].strip() if len(parts) > 34 else None,
                    'prinmorb': parts[35].strip() if len(parts) > 35 else None,
                    'lm_morbi': parts[36].strip() if len(parts) > 36 else None,
                    'lm_morta': parts[37].strip() if len(parts) > 37 else None,
                    'lgbd165': parts[38].strip() if len(parts) > 38 else None,
                    'lomsbeck': parts[39].strip() if len(parts) > 39 else None,
                    'lgbd190': parts[40].strip() if len(parts) > 40 else None,
                    'notdiaria': parts[41].strip() if len(parts) > 41 else None,
                    'notsemanal': parts[42].strip() if len(parts) > 42 else None,
                    'sistema_especial': parts[43].strip() if len(parts) > 43 else None,
                    'birmm': parts[44].strip() if len(parts) > 44 else None,
                    'cve_causa_type': parts[45].strip() if len(parts) > 45 else None,
                    'causa_type': parts[46].strip() if len(parts) > 46 else None,
                    'epi_morta': parts[47].strip() if len(parts) > 47 else None,
                    'edas_e_iras_en_m5': parts[48].strip() if len(parts) > 48 else None,
                    'cve_maternas_seed_epid': parts[49].strip() if len(parts) > 49 else None,
                    'epi_morta_m5': parts[50].strip() if len(parts) > 50 else None,
                    'epi_morb': parts[51].strip() if len(parts) > 51 else None,
                    'def_maternas': parts[52].strip() if len(parts) > 52 else None,
                    'es_causes': parts[53].strip() if len(parts) > 53 else None,
                    'num_causes': parts[54].strip() if len(parts) > 54 else None,
                    'es_suive_morta': parts[55].strip() if len(parts) > 55 else None,
                    'es_suive_morb': parts[56].strip() if len(parts) > 56 else None,
                    'epi_clave': parts[57].strip() if len(parts) > 57 else None,
                    'epi_clave_desc': parts[58].strip() if len(parts) > 58 else None,
                    'es_suive_notin': parts[59].strip() if len(parts) > 59 else None,
                    'es_suive_est_epi': parts[60].strip() if len(parts) > 60 else None,
                    'es_suive_est_brote': parts[61].strip() if len(parts) > 61 else None,
                    'sinac': parts[62].strip() if len(parts) > 62 else None,
                    'prin_sinac': parts[63].strip() if len(parts) > 63 else None,
                    'prin_sinac_grupo': parts[64].strip() if len(parts) > 64 else None,
                    'descripcion_sinac_grupo': parts[65].strip() if len(parts) > 65 else None,
                    'prin_sinac_subgrupo': parts[66].strip() if len(parts) > 66 else None,
                    'descripcion_sinac_subgrupo': parts[67].strip() if len(parts) > 67 else None,
                    'daga': parts[68].strip() if len(parts) > 68 else None,
                    'asterisco': parts[69].strip() if len(parts) > 69 else None,
                    'prin_mm': parts[70].strip() if len(parts) > 70 else None,
                    'prin_mm_grupo': parts[71].strip() if len(parts) > 71 else None,
                    'descripcion_mm_grupo': parts[72].strip() if len(parts) > 72 else None,
                    'prin_mm_subgrupo': parts[73].strip() if len(parts) > 73 else None,
                    'descripcion_mm_subgrupo': parts[74].strip() if len(parts) > 74 else None,
                    'cod_adi_mort': parts[75].strip() if len(parts) > 75 else None,
                    
                    # Campos derivados
                    'capitulo': parts[25].strip() if len(parts) > 25 else self.get_chapter_from_code(codigo),
                    'categoria': codigo,
                    'tipo': self.get_type_from_chapter(parts[25].strip() if len(parts) > 25 else self.get_chapter_from_code(codigo)),
                    'genero_aplicable': self.get_gender_from_code(codigo),
                    'es_mortalidad': self.is_mortality_code(codigo),
                    'es_morbilidad': True,
                    'activo': True,
                    'fecha_creacion': timezone.now(),
                    'fecha_actualizacion': timezone.now()
                }
                
                return data
        
        return None

    def safe_int(self, value):
        """Convertir valor a entero de forma segura"""
        try:
            if value and value.strip():
                return int(value.strip())
        except (ValueError, AttributeError):
            pass
        return None

    def get_chapter_from_code(self, codigo):
        """Determinar capítulo basado en el código CIE-10"""
        if not codigo:
            return 'I'
        
        first_char = codigo[0].upper()
        
        chapter_map = {
            'A': 'I', 'B': 'I',      # Enfermedades infecciosas
            'C': 'II', 'D': 'III',   # Neoplasias y enfermedades de la sangre
            'E': 'IV',               # Enfermedades endocrinas
            'F': 'V',                # Trastornos mentales
            'G': 'VI',               # Sistema nervioso
            'H': 'VII',              # Ojo y oído
            'I': 'IX',               # Sistema circulatorio
            'J': 'X',                # Sistema respiratorio
            'K': 'XI',               # Sistema digestivo
            'L': 'XII',              # Piel
            'M': 'XIII',             # Sistema osteomuscular
            'N': 'XIV',              # Sistema genitourinario
            'O': 'XV',               # Embarazo
            'P': 'XVI',              # Perinatales
            'Q': 'XVII',             # Malformaciones
            'R': 'XVIII',            # Síntomas
            'S': 'XIX', 'T': 'XIX',  # Traumatismos
            'V': 'XX', 'W': 'XX', 'X': 'XX', 'Y': 'XX',  # Causas externas
            'Z': 'XXI'               # Factores de salud
        }
        
        return chapter_map.get(first_char, 'I')

    def get_type_from_chapter(self, capitulo):
        """Determinar tipo basado en el capítulo"""
        if capitulo in ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII']:
            return 'ENFERMEDAD'
        elif capitulo == 'XIX':
            return 'TRAUMATISMO'
        elif capitulo == 'XX':
            return 'FACTOR_EXTERNO'
        else:
            return 'FACTOR_SALUD'

    def get_gender_from_code(self, codigo):
        """Determinar género aplicable"""
        if not codigo:
            return 'AMBOS'
        
        first_char = codigo[0].upper()
        
        if first_char == 'O':  # Embarazo
            return 'FEMENINO'
        elif first_char == 'C' and len(codigo) >= 3:  # Neoplasias específicas
            try:
                num = int(codigo[1:3])
                if 50 <= num <= 58:  # Neoplasias ginecológicas
                    return 'FEMENINO'
                elif 60 <= num <= 63:  # Neoplasias masculinas
                    return 'MASCULINO'
            except ValueError:
                pass
        
        return 'AMBOS'

    def is_mortality_code(self, codigo):
        """Determinar si es código de mortalidad"""
        if not codigo:
            return False
        
        first_char = codigo[0].upper()
        # Códigos que suelen ser de mortalidad
        mortality_chapters = ['A', 'B', 'C', 'I', 'J']
        return first_char in mortality_chapters
