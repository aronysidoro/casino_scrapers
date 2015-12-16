# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('category', '0006_category_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='category',
            name='level',
            field=models.IntegerField(default=0, blank=True),
        ),
    ]
