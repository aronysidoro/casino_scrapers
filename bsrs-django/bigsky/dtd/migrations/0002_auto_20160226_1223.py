# -*- coding: utf-8 -*-
# Generated by Django 1.9.2 on 2016-02-26 20:23
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('dtd', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='treedata',
            old_name='files',
            new_name='attachments',
        ),
    ]