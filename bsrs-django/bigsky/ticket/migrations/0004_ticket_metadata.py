# -*- coding: utf-8 -*-
# Generated by Django 1.9.3 on 2016-04-16 00:01
from __future__ import unicode_literals

import django.contrib.postgres.fields.jsonb
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('ticket', '0003_auto_20160415_1204'),
    ]

    operations = [
        migrations.AddField(
            model_name='ticket',
            name='metadata',
            field=django.contrib.postgres.fields.jsonb.JSONField(blank=True, default={}),
        ),
    ]