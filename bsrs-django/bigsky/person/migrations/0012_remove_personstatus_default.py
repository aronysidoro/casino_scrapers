# -*- coding: utf-8 -*-
# Generated by Django 1.9.6 on 2016-05-12 23:22
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0011_auto_20160503_2042'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='personstatus',
            name='default',
        ),
    ]