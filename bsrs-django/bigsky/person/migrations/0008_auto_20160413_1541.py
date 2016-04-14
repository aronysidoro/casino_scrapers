# -*- coding: utf-8 -*-
# Generated by Django 1.9.3 on 2016-04-13 22:41
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0007_auto_20160401_2043'),
    ]

    operations = [
        migrations.AlterField(
            model_name='role',
            name='inv_close_wo',
            field=models.CharField(choices=[('admin.work_order.close.do_not_display', 'admin.work_order.close.do_not_display'), ('admin.work_order.close.unchecked', 'admin.work_order.close.unchecked'), ('admin.work_order.close.checked', 'admin.work_order.close.checked')], default='admin.work_order.close.do_not_display', max_length=255),
        ),
        migrations.AlterField(
            model_name='role',
            name='inv_options',
            field=models.CharField(choices=[('admin.invoice.new', 'admin.invoice.new'), ('admin.invoice.draft', 'admin.invoice.draft')], default='admin.invoice.new', max_length=255),
        ),
        migrations.AlterField(
            model_name='role',
            name='inv_select_assign',
            field=models.CharField(choices=[('admin.invoice.select_assign.all', 'admin.invoice.select_assign.all'), ('admin.invoice.select_assign.managers', 'admin.invoice.select_assign.managers')], default='admin.invoice.select_assign.all', max_length=255),
        ),
        migrations.AlterField(
            model_name='role',
            name='role_type',
            field=models.CharField(blank=True, choices=[('admin.role.type.internal', 'admin.role.type.internal'), ('admin.role.type.third_party', 'admin.role.type.third_party')], default='admin.role.type.internal', max_length=29),
        ),
    ]