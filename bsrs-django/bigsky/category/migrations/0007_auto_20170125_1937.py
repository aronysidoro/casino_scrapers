# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-01-25 19:37
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('category', '0006_sccategory'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='category',
            name='sc_category_name',
        ),
        migrations.AddField(
            model_name='category',
            name='sc_category',
            field=models.ForeignKey(help_text='Mapping to SC Category name. Can be null because this is an inherited field,but all root categories must have this.', null=True, on_delete=django.db.models.deletion.CASCADE, to='category.ScCategory'),
        ),
    ]
