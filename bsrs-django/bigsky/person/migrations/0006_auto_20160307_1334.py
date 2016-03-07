# -*- coding: utf-8 -*-
# Generated by Django 1.9.3 on 2016-03-07 21:34
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0005_auto_20160217_1642'),
    ]

    operations = [
        migrations.AlterField(
            model_name='role',
            name='inv_close_wo',
            field=models.CharField(choices=[('admin.work_order.close.do_not_display', 'Do not display'), ('admin.work_order.close.unchecked', 'Unchecked'), ('admin.work_order.close.checked', 'Checked')], default='admin.work_order.close.do_not_display', max_length=255),
        ),
        migrations.AlterField(
            model_name='role',
            name='inv_options',
            field=models.CharField(choices=[('admin.invoice.new', 'New'), ('admin.invoice.draft', 'Draft')], default='admin.invoice.new', max_length=255),
        ),
        migrations.AlterField(
            model_name='role',
            name='inv_select_assign',
            field=models.CharField(choices=[('admin.invoice.select_assign.all', 'All'), ('admin.invoice.select_assign.managers', 'Managers')], default='admin.invoice.select_assign.all', max_length=255),
        ),
        migrations.AlterField(
            model_name='role',
            name='role_type',
            field=models.CharField(blank=True, choices=[('admin.role.type.internal', 'Internal'), ('admin.role.type.third_party', 'Third Party')], default='admin.role.type.internal', max_length=29),
        ),
    ]
