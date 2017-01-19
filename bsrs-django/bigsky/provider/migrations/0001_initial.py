# -*- coding: utf-8 -*-
# Generated by Django 1.10.4 on 2017-01-10 00:49
from __future__ import unicode_literals

import django.core.validators
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('category', '0003_auto_20161230_0008'),
    ]

    operations = [
        migrations.CreateModel(
            name='Provider',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True)),
                ('fbid', models.CharField(help_text='foreign key from FixxBook API preferred provider resource, depends on location and subscriber data', max_length=64)),
                ('name', models.CharField(help_text='name of perferred provider from FixxBook API', max_length=256)),
                ('address_1', models.CharField(max_length=128, null=True)),
                ('address_2', models.CharField(max_length=128, null=True)),
                ('country_code', models.CharField(max_length=8, null=True)),
                ('postal_code', models.CharField(max_length=32, null=True)),
                ('region_name', models.CharField(max_length=128, null=True)),
                ('city', models.CharField(max_length=128, null=True)),
                ('fax', models.CharField(max_length=128, null=True)),
                ('phone', models.CharField(max_length=64, null=True)),
                ('email', models.CharField(max_length=128, null=True)),
                ('logo', models.TextField(null=True, validators=[django.core.validators.URLValidator()])),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='providers', to='category.Category')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]