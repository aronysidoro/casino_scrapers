# -*- coding: utf-8 -*-
# Generated by Django 1.10.4 on 2016-12-30 00:08
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('category', '0002_category_tenant'),
    ]

    operations = [
        migrations.AlterField(
            model_name='category',
            name='tenant',
            field=models.ForeignKey(default='037530c4-ce6c-4724-9cfd-37a16e787001', on_delete=django.db.models.deletion.CASCADE, related_name='categories', to='tenant.Tenant'),
            preserve_default=False,
        ),
    ]
