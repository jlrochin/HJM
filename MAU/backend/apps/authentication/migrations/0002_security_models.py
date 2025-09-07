from django.db import migrations


class Migration(migrations.Migration):

	# Esta migración intencionalmente no realiza cambios. Se mantiene para
	# resolver conflictos de numeración (0002) y permitir el merge 0003.
	dependencies = [
		("authentication", "0001_initial"),
	]

	operations = []

