# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-02-10 22:46
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('category', '0008_category_verbose_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='category',
            name='verbose_name',
            field=models.CharField(help_text='string name that holds i.e. parent - child - grand child', max_length=1000, null=True),
        ),
    ]