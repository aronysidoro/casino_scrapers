# -*- coding: utf-8 -*-
# Generated by Django 1.9.7 on 2016-07-26 19:03
from __future__ import unicode_literals

import django.contrib.postgres.fields.jsonb
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('automation', '0008_automationfiltertype'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='automationfiltertype',
            name='type',
        ),
        migrations.AddField(
            model_name='automationfilter',
            name='key_is_i18n',
            field=models.BooleanField(default=True, help_text="is the 'key' field i18n'able"),
        ),
        migrations.AddField(
            model_name='automationfilter',
            name='lookups',
            field=django.contrib.postgres.fields.jsonb.JSONField(default={}, help_text="if used, provide extra lookup information beyond the 'field'this should be a string array", null=True),
        ),
    ]
