# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-01-30 22:02
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('work_order', '0003_auto_20170120_0158'),
    ]

    operations = [
        migrations.AddField(
            model_name='workorder',
            name='scid',
            field=models.IntegerField(help_text='id of SC primary key record of the WorkOrder. Will be null on initial BS create', null=True, unique=True),
        ),
    ]