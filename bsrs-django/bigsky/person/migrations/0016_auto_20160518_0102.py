# -*- coding: utf-8 -*-
# Generated by Django 1.9.6 on 2016-05-18 01:02
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('setting', '0002_auto_20160518_0020'),
        ('person', '0015_auto_20160518_0101'),
    ]

    operations = [
        migrations.AddField(
            model_name='person',
            name='settings',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='setting.Setting'),
        ),
        migrations.AddField(
            model_name='role',
            name='settings',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='setting.Setting'),
        ),
    ]
