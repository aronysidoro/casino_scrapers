# -*- coding: utf-8 -*-
# Generated by Django 1.9.2 on 2016-02-23 16:52
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('generic', '0005_auto_20160217_1642'),
    ]

    operations = [
        migrations.DeleteModel(
            name='Setting',
        ),
    ]