from django.db import models
from django.core.validators import RegexValidator

class PacienteCIE10(models.Model):
    """Modelo intermedio para múltiples códigos CIE-10 por paciente"""
    
    paciente = models.ForeignKey(
        'Paciente',
        on_delete=models.CASCADE,
        verbose_name='Paciente'
    )
    
    cie10 = models.ForeignKey(
        'CIE10Mexico',
        on_delete=models.CASCADE,
        verbose_name='Código CIE-10'
    )
    
    fecha_diagnostico = models.DateField(
        verbose_name='Fecha de Diagnóstico',
        help_text='Fecha cuando se diagnosticó este código específico'
    )
    
    es_principal = models.BooleanField(
        default=False,
        verbose_name='Diagnóstico Principal',
        help_text='Indica si este es el diagnóstico principal'
    )
    
    observaciones = models.TextField(
        blank=True,
        null=True,
        verbose_name='Observaciones',
        help_text='Notas adicionales sobre este diagnóstico'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha de Creación'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Fecha de Actualización'
    )
    
    class Meta:
        verbose_name = 'CIE-10 del Paciente'
        verbose_name_plural = 'CIE-10 de los Pacientes'
        unique_together = ['paciente', 'cie10']
        ordering = ['-es_principal', '-fecha_diagnostico']
    
    def __str__(self):
        return f"{self.paciente.expediente} - {self.cie10.codigo} ({self.cie10.descripcion_corta})"


class CIE10Mexico(models.Model):
    """Catálogo oficial CIE-10 autorizado en México con todos los campos del archivo original"""
    
    # Campos principales (mantener compatibilidad)
    codigo = models.CharField(
        max_length=10,
        primary_key=True,
        verbose_name='Código CIE-10',
        help_text='Código oficial CIE-10 (ej: A00.0, B15.9, etc.)'
    )
    
    descripcion = models.TextField(
        verbose_name='Descripción',
        help_text='Descripción completa del diagnóstico'
    )
    
    descripcion_corta = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name='Descripción Corta',
        help_text='Versión abreviada de la descripción'
    )
    
    capitulo = models.CharField(
        max_length=5,
        verbose_name='Capítulo',
        help_text='Capítulo del CIE-10 (I-XXII)'
    )
    
    categoria = models.CharField(
        max_length=10,
        verbose_name='Categoría',
        help_text='Categoría del código (primeros 3 caracteres)'
    )
    
    tipo = models.CharField(
        max_length=20,
        choices=[
            ('ENFERMEDAD', 'Enfermedad'),
            ('TRAUMATISMO', 'Traumatismo y envenenamiento'),
            ('FACTOR_EXTERNO', 'Causas externas'),
            ('FACTOR_SALUD', 'Factores que influyen en el estado de salud'),
        ],
        verbose_name='Tipo de código'
    )
    
    genero_aplicable = models.CharField(
        max_length=10,
        choices=[
            ('AMBOS', 'Ambos géneros'),
            ('MASCULINO', 'Solo masculino'),
            ('FEMENINO', 'Solo femenino'),
        ],
        default='AMBOS',
        verbose_name='Género aplicable'
    )
    
    es_mortalidad = models.BooleanField(
        default=False,
        verbose_name='Es causa de mortalidad',
        help_text='Indica si este código puede ser causa básica de muerte'
    )
    
    es_morbilidad = models.BooleanField(
        default=True,
        verbose_name='Es causa de morbilidad',
        help_text='Indica si este código puede usarse para morbilidad'
    )
    
    activo = models.BooleanField(
        default=True,
        verbose_name='Activo'
    )
    
    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha de creación'
    )
    
    fecha_actualizacion = models.DateTimeField(
        auto_now=True,
        verbose_name='Fecha de actualización'
    )
    
    # Campos adicionales del archivo CSV original
    consecutivo = models.IntegerField(
        null=True,
        blank=True,
        verbose_name='Consecutivo'
    )
    
    letra = models.CharField(
        max_length=1,
        null=True,
        blank=True,
        verbose_name='Letra del código'
    )
    
    no_caracteres = models.IntegerField(
        null=True,
        blank=True,
        verbose_name='Número de caracteres'
    )
    
    codigox = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='Código X'
    )
    
    lsex = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='LSEX'
    )
    
    linf = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='LINF'
    )
    
    lsup = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='LSUP'
    )
    
    trivial = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='Trivial'
    )
    
    erradicado = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='Erradicado'
    )
    
    n_inter = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='N_INTER'
    )
    
    nin = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='NIN'
    )
    
    ninmtobs = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='NINMTOBS'
    )
    
    cod_sit_lesion = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='Código situación lesión'
    )
    
    no_cbd = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='NO_CBD'
    )
    
    cbd = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='CBD'
    )
    
    no_aph = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='NO_APH'
    )
    
    af_prin = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='AF_PRIN'
    )
    
    dia_sis = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='Día SIS'
    )
    
    clave_programa_sis = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='Clave programa SIS'
    )
    
    cod_complemen_morbi = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='Código complemento morbilidad'
    )
    
    dia_fetal = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='Día fetal'
    )
    
    def_fetal_cm = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='DEF_FETAL_CM'
    )
    
    def_fetal_cbd = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='DEF_FETAL_CBD'
    )
    
    clave_capitulo = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='Clave capítulo'
    )
    
    nombre_capitulo = models.TextField(
        null=True,
        blank=True,
        verbose_name='Nombre del capítulo'
    )
    
    lista1 = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='Lista 1'
    )
    
    grupo1 = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='Grupo 1'
    )
    
    lista5 = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='Lista 5'
    )
    
    rubrica_type = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='Tipo de rúbrica'
    )
    
    year_modifi = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='Año modificación'
    )
    
    year_aplicacion = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='Año aplicación'
    )
    
    valid = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='Válido'
    )
    
    prinmorta = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='PRINMORTA'
    )
    
    prinmorb = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='PRINMORB'
    )
    
    lm_morbi = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='LM_MORBI'
    )
    
    lm_morta = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='LM_MORTA'
    )
    
    lgbd165 = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='LGBD165'
    )
    
    lomsbeck = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='LOMSBECK'
    )
    
    lgbd190 = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='LGBD190'
    )
    
    notdiaria = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='Notificación diaria'
    )
    
    notsemanal = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='Notificación semanal'
    )
    
    sistema_especial = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='Sistema especial'
    )
    
    birmm = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='BIRMM'
    )
    
    cve_causa_type = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='Clave tipo causa'
    )
    
    causa_type = models.TextField(
        null=True,
        blank=True,
        verbose_name='Tipo de causa'
    )
    
    epi_morta = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='EPI_MORTA'
    )
    
    edas_e_iras_en_m5 = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='EDAS_E_IRAS_EN_M5'
    )
    
    cve_maternas_seed_epid = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='Clave maternas SEED EPID'
    )
    
    epi_morta_m5 = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='EPI_MORTA_M5'
    )
    
    epi_morb = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='EPI_MORB'
    )
    
    def_maternas = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='DEF_MATERNAS'
    )
    
    es_causes = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='ES_CAUSES'
    )
    
    num_causes = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='Número de causas'
    )
    
    es_suive_morta = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='ES_SUIVE_MORTA'
    )
    
    es_suive_morb = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='ES_SUIVE_MORB'
    )
    
    epi_clave = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='EPI_CLAVE'
    )
    
    epi_clave_desc = models.TextField(
        null=True,
        blank=True,
        verbose_name='Descripción EPI_CLAVE'
    )
    
    es_suive_notin = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='ES_SUIVE_NOTIN'
    )
    
    es_suive_est_epi = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='ES_SUIVE_EST_EPI'
    )
    
    es_suive_est_brote = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='ES_SUIVE_EST_BROTE'
    )
    
    sinac = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='SINAC'
    )
    
    prin_sinac = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='PRIN_SINAC'
    )
    
    prin_sinac_grupo = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='PRIN_SINAC_GRUPO'
    )
    
    descripcion_sinac_grupo = models.TextField(
        null=True,
        blank=True,
        verbose_name='Descripción grupo SINAC'
    )
    
    prin_sinac_subgrupo = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='PRIN_SINAC_SUBGRUPO'
    )
    
    descripcion_sinac_subgrupo = models.TextField(
        null=True,
        blank=True,
        verbose_name='Descripción subgrupo SINAC'
    )
    
    daga = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='DAGA'
    )
    
    asterisco = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='Asterisco'
    )
    
    prin_mm = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='PRIN_MM'
    )
    
    prin_mm_grupo = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='PRIN_MM_GRUPO'
    )
    
    descripcion_mm_grupo = models.TextField(
        max_length=500,
        null=True,
        blank=True,
        verbose_name='Descripción grupo MM'
    )
    
    prin_mm_subgrupo = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='PRIN_MM_SUBGRUPO'
    )
    
    descripcion_mm_subgrupo = models.TextField(
        max_length=500,
        null=True,
        blank=True,
        verbose_name='Descripción subgrupo MM'
    )
    
    cod_adi_mort = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        verbose_name='Código adicional mortalidad'
    )
    
    class Meta:
        verbose_name = 'CIE-10 México'
        verbose_name_plural = 'CIE-10 México'
        db_table = 'cie10_mexico'
        ordering = ['codigo']
        indexes = [
            models.Index(fields=['codigo']),
            models.Index(fields=['categoria']),
            models.Index(fields=['capitulo']),
            models.Index(fields=['tipo']),
            models.Index(fields=['descripcion']),
        ]
    
    def __str__(self):
        return f"{self.codigo} - {self.descripcion_corta or self.descripcion[:50]}"
    
    def get_descripcion_display(self):
        """Retorna la descripción más apropiada"""
        return self.descripcion_corta or self.descripcion
    
    def is_aplicable_for_patient(self, paciente):
        """Verifica si este código CIE-10 es aplicable para un paciente específico"""
        # Verificar género
        if self.genero_aplicable != 'AMBOS':
            if self.genero_aplicable == 'MASCULINO' and paciente.genero != 'M':
                return False
            if self.genero_aplicable == 'FEMENINO' and paciente.genero != 'F':
                return False
        
        # Nota: Los campos edad_minima y edad_maxima fueron removidos del modelo
        # La validación de edad se puede implementar en el futuro si es necesario
        
        return True


class Paciente(models.Model):
    """Modelo para gestionar pacientes del hospital"""
    
    GENERO_CHOICES = [
        ('M', 'Masculino'),
        ('F', 'Femenino'),
        ('O', 'Otro'),
    ]
    
    TIPO_SANGRE_CHOICES = [
        ('A+', 'A+'), ('A-', 'A-'),
        ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'),
        ('O+', 'O+'), ('O-', 'O-'),
        ('ND', 'No Determinado'),
    ]
    
    # Campo EXPEDIENTE como Primary Key
    expediente = models.CharField(
        max_length=20,
        primary_key=True,
        validators=[RegexValidator(
            regex=r'^[A-Z0-9-]+$',
            message='El expediente debe contener solo letras mayúsculas, números y guiones'
        )],
        verbose_name='Número de Expediente',
        help_text='Identificador único del paciente'
    )
    
    # Información personal
    nombre = models.CharField(
        max_length=100,
        verbose_name='Nombre(s)'
    )
    
    apellido_paterno = models.CharField(
        max_length=100,
        verbose_name='Apellido Paterno'
    )
    
    apellido_materno = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name='Apellido Materno'
    )
    
    curp = models.CharField(
        max_length=18,
        unique=True,
        validators=[RegexValidator(
            regex=r'^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9]{2}$',
            message='CURP inválida. Formato: 4 letras, 6 números, H/M, 5 letras, 2 números'
        )],
        verbose_name='CURP'
    )
    
    fecha_nacimiento = models.DateField(
        verbose_name='Fecha de Nacimiento'
    )
    
    genero = models.CharField(
        max_length=1,
        choices=GENERO_CHOICES,
        verbose_name='Género'
    )
    
    # Información médica
    patologia = models.CharField(
        max_length=200,
        verbose_name='Patología Principal'
    )
    
    cie10 = models.CharField(
        max_length=10,
        verbose_name='Código CIE-10',
        help_text='Clasificación Internacional de Enfermedades'
    )
    
    # Relación opcional con el catálogo oficial CIE-10
    cie10_oficial = models.ForeignKey(
        'CIE10Mexico',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='CIE-10 Oficial',
        help_text='Relación con el catálogo oficial CIE-10 México'
    )
    
    # Múltiples códigos CIE-10 (relación many-to-many)
    cie10_codes = models.ManyToManyField(
        'CIE10Mexico',
        through='PacienteCIE10',
        related_name='pacientes',
        verbose_name='Códigos CIE-10',
        help_text='Múltiples códigos CIE-10 para el paciente'
    )
    
    fecha_diagnostico = models.DateField(
        verbose_name='Fecha de Diagnóstico'
    )
    
    tipo_sangre = models.CharField(
        max_length=3,
        choices=TIPO_SANGRE_CHOICES,
        default='ND',
        verbose_name='Tipo de Sangre'
    )
    
    alergias = models.TextField(
        blank=True,
        null=True,
        verbose_name='Alergias Conocidas'
    )
    
    # Información de contacto
    telefono = models.CharField(
        max_length=15,
        blank=True,
        null=True,
        validators=[RegexValidator(
            regex=r'^\+?1?\d{9,15}$',
            message='Número de teléfono inválido'
        )],
        verbose_name='Teléfono'
    )
    
    direccion = models.TextField(
        blank=True,
        null=True,
        verbose_name='Dirección'
    )
    
    contacto_emergencia_nombre = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name='Nombre del Contacto de Emergencia'
    )
    
    contacto_emergencia_telefono = models.CharField(
        max_length=15,
        blank=True,
        null=True,
        validators=[RegexValidator(
            regex=r'^\+?1?\d{9,15}$',
            message='Número de teléfono inválido'
        )],
        verbose_name='Teléfono del Contacto de Emergencia'
    )
    
    # Información del seguro médico
    numero_seguro_social = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name='Número de Seguro Social'
    )
    
    institucion_seguro = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name='Institución de Seguro',
        help_text='IMSS, ISSSTE, Seguro Popular, etc.'
    )
    
    # Metadatos
    is_active = models.BooleanField(
        default=True,
        verbose_name='Activo'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha de Registro'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Última Actualización'
    )
    
    # Usuario que creó y actualizó el registro
    created_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='pacientes_creados',
        verbose_name='Creado por'
    )
    
    updated_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='pacientes_actualizados',
        verbose_name='Actualizado por'
    )
    
    class Meta:
        verbose_name = 'Paciente'
        verbose_name_plural = 'Pacientes'
        db_table = 'pacientes'
        ordering = ['apellido_paterno', 'apellido_materno', 'nombre']
        indexes = [
            models.Index(fields=['curp']),
            models.Index(fields=['nombre', 'apellido_paterno']),
            models.Index(fields=['fecha_nacimiento']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.expediente} - {self.get_nombre_completo()}"
    
    def get_nombre_completo(self):
        """Retorna el nombre completo del paciente"""
        nombres = [self.nombre, self.apellido_paterno]
        if self.apellido_materno:
            nombres.append(self.apellido_materno)
        return ' '.join(nombres)
    
    def get_edad(self):
        """Calcula la edad del paciente"""
        from datetime import date
        today = date.today()
        return today.year - self.fecha_nacimiento.year - (
            (today.month, today.day) < 
            (self.fecha_nacimiento.month, self.fecha_nacimiento.day)
        )
    
    def calcular_estado_automatico(self):
        """Calcula automáticamente si el paciente debe estar activo basado en su actividad"""
        from datetime import date, timedelta
        from django.utils import timezone
        
        # Fecha límite: 4 años atrás desde hoy
        fecha_limite = timezone.now() - timedelta(days=4*365)
        
        # Buscar la receta más reciente del paciente
        try:
            from apps.prescriptions.models import Receta
            ultima_receta = Receta.objects.filter(
                paciente=self
            ).order_by('-created_at').first()
            
            # Buscar la última actividad del paciente
            ultima_actividad = self.updated_at
            
            # Si hay recetas, usar la fecha de la más reciente
            if ultima_receta and ultima_receta.created_at > ultima_actividad:
                ultima_actividad = ultima_receta.created_at
            
            # Determinar si debe estar activo
            return ultima_actividad >= fecha_limite
        except:
            # Si hay algún error, mantener el estado actual
            return self.is_active
    
    def actualizar_estado_automatico(self):
        """Actualiza el estado del paciente basado en su actividad reciente"""
        nuevo_estado = self.calcular_estado_automatico()
        if self.is_active != nuevo_estado:
            self.is_active = nuevo_estado
            self.save(update_fields=['is_active'])
            return True
        return False
    
    def save(self, *args, **kwargs):
        """Override del método save para normalizar datos"""
        # Convertir CURP a mayúsculas
        if self.curp:
            self.curp = self.curp.upper()
        
        # Convertir expediente a mayúsculas
        if self.expediente:
            self.expediente = self.expediente.upper()
        
        # Capitalizar nombres
        if self.nombre:
            self.nombre = self.nombre.title()
        if self.apellido_paterno:
            self.apellido_paterno = self.apellido_paterno.title()
        if self.apellido_materno:
            self.apellido_materno = self.apellido_materno.title()
        
        super().save(*args, **kwargs)
