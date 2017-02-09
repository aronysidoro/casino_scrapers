# -*- coding: utf-8 -*-
# Generated by Django 1.10.4 on 2017-02-09 18:27
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('work_order', '0010_auto_20170207_1158'),
    ]

    operations = [
        migrations.AlterField(
            model_name='workorder',
            name='approved_amount',
            field=models.DecimalField(decimal_places=4, help_text='May be the same as cost_estimate', max_digits=15, null=True),
        ),
        migrations.AlterField(
            model_name='workorder',
            name='cost_estimate',
            field=models.DecimalField(decimal_places=4, help_text='SC field: Nte - will change based on the amount the Provider estimates for the work', max_digits=15, null=True),
        ),
    ]
