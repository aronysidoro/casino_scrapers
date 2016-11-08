# -*- coding: utf-8 -*-
# Generated by Django 1.9.7 on 2016-07-27 20:43
from __future__ import unicode_literals

import django.contrib.postgres.fields.jsonb
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('automation', '0010_auto_20160726_2026'),
    ]

    operations = [
        migrations.AlterField(
            model_name='automationfilter',
            name='criteria',
            field=django.contrib.postgres.fields.jsonb.JSONField(default=[], help_text='Must be a list. Criteria to match on.'),
        ),
    ]