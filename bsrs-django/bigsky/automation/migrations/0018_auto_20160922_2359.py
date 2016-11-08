# -*- coding: utf-8 -*-
# Generated by Django 1.10.1 on 2016-09-22 23:59
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('automation', '0017_auto_20160922_2351'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='automationfilter',
            name='content_type',
        ),
        migrations.RemoveField(
            model_name='automationfilter',
            name='object_id',
        ),
        migrations.AddField(
            model_name='automationfilter',
            name='automation',
            field=models.ForeignKey(default='147ff1ea-6f0f-423e-9b58-64aa1f93c6d8', on_delete=django.db.models.deletion.CASCADE, related_name='filters', to='automation.Automation'),
            preserve_default=False,
        ),
    ]