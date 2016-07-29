# -*- coding: utf-8 -*-
# Generated by Django 1.9.7 on 2016-07-29 22:33
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('contact', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='country',
            options={},
        ),
        migrations.RemoveField(
            model_name='country',
            name='name',
        ),
        migrations.RemoveField(
            model_name='state',
            name='abbr',
        ),
        migrations.AddField(
            model_name='country',
            name='capital',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='country',
            name='common_name',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='country',
            name='country_code_tld',
            field=models.CharField(blank=True, max_length=100, verbose_name='IANA Country Code TLD'),
        ),
        migrations.AddField(
            model_name='country',
            name='currency_code',
            field=models.CharField(blank=True, max_length=100, verbose_name='ISO 4217 Currency Code'),
        ),
        migrations.AddField(
            model_name='country',
            name='currency_name',
            field=models.CharField(blank=True, max_length=100, verbose_name='ISO 4217 Currency Name'),
        ),
        migrations.AddField(
            model_name='country',
            name='formal_name',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='country',
            name='number',
            field=models.CharField(blank=True, max_length=100, verbose_name='ISO 3166-1 Number'),
        ),
        migrations.AddField(
            model_name='country',
            name='sort_order',
            field=models.IntegerField(default=1),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='country',
            name='sovereignty',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='country',
            name='sub_type',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='country',
            name='telephone_code',
            field=models.CharField(blank=True, max_length=100, verbose_name='ITU-T Telephone Code'),
        ),
        migrations.AddField(
            model_name='country',
            name='three_letter_code',
            field=models.CharField(blank=True, max_length=100, verbose_name='ISO 3166-1 3 Letter Code'),
        ),
        migrations.AddField(
            model_name='country',
            name='two_letter_code',
            field=models.CharField(blank=True, max_length=100, verbose_name='ISO 3166-1 2 Letter Code'),
        ),
        migrations.AddField(
            model_name='country',
            name='type',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='state',
            name='classification',
            field=models.CharField(default=1, max_length=100),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='state',
            name='country',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='contact.Country'),
        ),
        migrations.AddField(
            model_name='state',
            name='country_code',
            field=models.CharField(default=1, max_length=10),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='state',
            name='state_code',
            field=models.CharField(default=1, max_length=10),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='state',
            name='name',
            field=models.CharField(max_length=100),
        ),
    ]
