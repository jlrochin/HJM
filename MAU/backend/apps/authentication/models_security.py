from django.conf import settings
from django.db import models


class PasswordPolicy(models.Model):
	role = models.CharField(max_length=20, unique=True)
	min_length = models.IntegerField(default=8)
	require_uppercase = models.BooleanField(default=True)
	require_lowercase = models.BooleanField(default=True)
	require_numbers = models.BooleanField(default=True)
	require_symbols = models.BooleanField(default=True)
	max_age_days = models.IntegerField(default=90)
	history_count = models.IntegerField(default=5)

	class Meta:
		verbose_name = "Política de Contraseñas"
		verbose_name_plural = "Políticas de Contraseñas"

	def __str__(self) -> str:
		return f"Política para rol {self.role}"


class SecuritySettings(models.Model):
	min_password_length = models.IntegerField(default=8)
	require_uppercase = models.BooleanField(default=True)
	require_lowercase = models.BooleanField(default=True)
	require_numbers = models.BooleanField(default=True)
	require_symbols = models.BooleanField(default=True)
	password_history_count = models.IntegerField(default=5)
	password_expiry_days = models.IntegerField(default=90)
	max_login_attempts = models.IntegerField(default=5)
	lockout_duration_minutes = models.IntegerField(default=30)
	max_concurrent_sessions = models.IntegerField(default=3)
	session_timeout_minutes = models.IntegerField(default=480)
	require_2fa_for_roles = models.JSONField(default=list)
	enable_ip_whitelist = models.BooleanField(default=False)
	allowed_ip_ranges = models.JSONField(default=list)
	blocked_ips = models.JSONField(default=list)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		verbose_name = "Configuración de Seguridad"
		verbose_name_plural = "Configuraciones de Seguridad"

	def __str__(self) -> str:
		return f"Configuración de Seguridad #{self.pk}"


class UserSecurityProfile(models.Model):
	user = models.OneToOneField(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name="security_profile",
	)
	two_factor_enabled = models.BooleanField(default=False)
	backup_tokens = models.JSONField(default=list)
	password_history = models.JSONField(default=list)
	password_changed_at = models.DateTimeField(null=True, blank=True)
	force_password_change = models.BooleanField(default=False)
	failed_login_attempts = models.IntegerField(default=0)
	locked_until = models.DateTimeField(null=True, blank=True)
	last_login_ip = models.GenericIPAddressField(null=True, blank=True)
	last_successful_login = models.DateTimeField(null=True, blank=True)
	security_questions = models.JSONField(default=dict)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		verbose_name = "Perfil de Seguridad"
		verbose_name_plural = "Perfiles de Seguridad"

	def __str__(self) -> str:
		return f"Perfil de Seguridad de {self.user_id}"


class TwoFactorSecret(models.Model):
	user = models.OneToOneField(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name="totp_secret",
	)
	secret_key = models.CharField(max_length=32)
	is_verified = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		verbose_name = "Secreto 2FA"
		verbose_name_plural = "Secretos 2FA"

	def __str__(self) -> str:
		return f"2FA {'verificado' if self.is_verified else 'pendiente'} para {self.user_id}"


class IPWhitelist(models.Model):
	ip_address = models.GenericIPAddressField()
	ip_range = models.CharField(max_length=50, blank=True)
	description = models.CharField(max_length=200)
	is_active = models.BooleanField(default=True)
	created_at = models.DateTimeField(auto_now_add=True)
	created_by = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		null=True,
		on_delete=models.SET_NULL,
	)

	class Meta:
		verbose_name = "IP Lista Blanca"
		verbose_name_plural = "IPs Lista Blanca"

	def __str__(self) -> str:
		return f"{self.ip_address or self.ip_range}"


class IPBlacklist(models.Model):
	ip_address = models.GenericIPAddressField()
	reason = models.CharField(max_length=200)
	blocked_until = models.DateTimeField(null=True, blank=True)
	is_permanent = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True)
	created_by = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		null=True,
		on_delete=models.SET_NULL,
	)

	class Meta:
		verbose_name = "IP Lista Negra"
		verbose_name_plural = "IPs Lista Negra"

	def __str__(self) -> str:
		return f"{self.ip_address}"


class SecurityLog(models.Model):
	class EventType(models.TextChoices):
		LOGIN_SUCCESS = "LOGIN_SUCCESS", "Login Exitoso"
		LOGIN_FAILED = "LOGIN_FAILED", "Login Fallido"
		LOGIN_BLOCKED = "LOGIN_BLOCKED", "Login Bloqueado"
		LOGOUT = "LOGOUT", "Logout"
		PASSWORD_CHANGED = "PASSWORD_CHANGED", "Contraseña Cambiada"
		TWOFA_ENABLED = "2FA_ENABLED", "2FA Habilitado"
		TWOFA_DISABLED = "2FA_DISABLED", "2FA Deshabilitado"
		TWOFA_SUCCESS = "2FA_SUCCESS", "2FA Exitoso"
		TWOFA_FAILED = "2FA_FAILED", "2FA Fallido"
		ACCOUNT_LOCKED = "ACCOUNT_LOCKED", "Cuenta Bloqueada"
		ACCOUNT_UNLOCKED = "ACCOUNT_UNLOCKED", "Cuenta Desbloqueada"
		PERMISSION_DENIED = "PERMISSION_DENIED", "Permiso Denegado"
		SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY", "Actividad Sospechosa"
		IP_BLOCKED = "IP_BLOCKED", "IP Bloqueada"
		MULTIPLE_SESSIONS = "MULTIPLE_SESSIONS", "Múltiples Sesiones"

	class Severity(models.TextChoices):
		LOW = "LOW", "Bajo"
		MEDIUM = "MEDIUM", "Medio"
		HIGH = "HIGH", "Alto"
		CRITICAL = "CRITICAL", "Crítico"

	user = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		null=True,
		blank=True,
		on_delete=models.SET_NULL,
	)
	event_type = models.CharField(max_length=20, choices=EventType.choices)
	severity = models.CharField(
		max_length=10, choices=Severity.choices, default=Severity.LOW
	)
	ip_address = models.GenericIPAddressField(null=True, blank=True)
	user_agent = models.TextField(blank=True)
	description = models.TextField()
	metadata = models.JSONField(default=dict)
	timestamp = models.DateTimeField(auto_now_add=True)

	class Meta:
		verbose_name = "Log de Seguridad"
		verbose_name_plural = "Logs de Seguridad"
		indexes = [
			models.Index(fields=["-timestamp"], name="authenticat_timesta_8818b3_idx"),
			models.Index(
				fields=["event_type", "-timestamp"],
				name="authenticat_event_t_0c7d52_idx",
			),
			models.Index(
				fields=["user", "-timestamp"], name="authenticat_user_id_51b981_idx"
			),
			models.Index(
				fields=["severity", "-timestamp"],
				name="authenticat_severit_03def6_idx",
			),
		]

	def __str__(self) -> str:
		return f"[{self.severity}] {self.event_type} ({self.timestamp:%Y-%m-%d %H:%M:%S})"


class ActiveSession(models.Model):
	user = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name="active_sessions",
	)
	session_key = models.CharField(max_length=40, unique=True)
	ip_address = models.GenericIPAddressField()
	user_agent = models.TextField()
	device_info = models.JSONField(default=dict)
	created_at = models.DateTimeField(auto_now_add=True)
	last_activity = models.DateTimeField(auto_now=True)
	expires_at = models.DateTimeField()

	class Meta:
		verbose_name = "Sesión Activa"
		verbose_name_plural = "Sesiones Activas"
		indexes = [
			models.Index(
				fields=["user", "-last_activity"],
				name="authenticat_user_id_636580_idx",
			),
			models.Index(fields=["expires_at"], name="authenticat_expires_fb7ad4_idx"),
		]

	def __str__(self) -> str:
		return f"{self.user_id}@{self.ip_address} ({self.session_key})"

