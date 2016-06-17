# -*- coding: utf-8 -*-
# Generated by Django 1.9.6 on 2016-06-14 23:16
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('accounting', '0001_initial'),
        ('setting', '0004_setting_title'),
        ('dtd', '0014_auto_20160428_1453'),
        ('person', '0019_auto_20160613_1906'),
    ]

    operations = [
        migrations.CreateModel(
            name='Tenant',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True)),
                ('name', models.CharField(max_length=254)),
                ('auth_currency', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='accounting.Currency')),
                ('dt_start', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='dtd.TreeData')),
                ('settings', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='setting.Setting')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.AddField(
            model_name='role',
            name='tenant',
            field=models.ForeignKey(default='3611342c-e6e8-40bb-abfd-7b525c01d1d9', on_delete=django.db.models.deletion.CASCADE, related_name='roles', to='person.Tenant'),
            preserve_default=False,
        ),
    ]