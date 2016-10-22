# -*- coding: utf-8 -*-
# Generated by Django 1.10.1 on 2016-10-07 16:28
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tenant', '0006_auto_20161007_1626'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tenant',
            name='scid',
            field=models.IntegerField(help_text='id of SC primary key record of the subscriber. Will be null on initial BS create', null=True, unique=True),
        ),
    ]