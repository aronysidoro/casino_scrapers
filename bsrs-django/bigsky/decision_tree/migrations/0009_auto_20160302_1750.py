# -*- coding: utf-8 -*-
# Generated by Django 1.9.2 on 2016-03-03 01:50
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('decision_tree', '0008_auto_20160301_0957'),
    ]

    operations = [
        migrations.RenameField(
            model_name='treelink',
            old_name='parent',
            new_name='dtd',
        ),
    ]
