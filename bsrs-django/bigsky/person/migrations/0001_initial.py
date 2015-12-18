# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.utils.timezone
import django.contrib.postgres.fields
import django.core.validators
import person.models
import uuid
import django.contrib.auth.models
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('category', '0001_initial'),
        ('location', '0001_initial'),
        ('auth', '0006_require_contenttypes_0002'),
        ('order', '0001_initial'),
        ('accounting', '0001_initial'),
        ('translation', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Person',
            fields=[
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, verbose_name='last login', null=True)),
                ('is_superuser', models.BooleanField(default=False, verbose_name='superuser status', help_text='Designates that this user has all permissions without explicitly assigning them.')),
                ('username', models.CharField(verbose_name='username', unique=True, validators=[django.core.validators.RegexValidator('^[\\w.@+-]+$', 'Enter a valid username. This value may contain only letters, numbers and @/./+/-/_ characters.', 'invalid')], error_messages={'unique': 'A user with that username already exists.'}, max_length=30, help_text='Required. 30 characters or fewer. Letters, digits and @/./+/-/_ only.')),
                ('first_name', models.CharField(max_length=30, verbose_name='first name', blank=True)),
                ('last_name', models.CharField(max_length=30, verbose_name='last name', blank=True)),
                ('email', models.EmailField(max_length=254, verbose_name='email address', blank=True)),
                ('is_staff', models.BooleanField(default=False, verbose_name='staff status', help_text='Designates whether the user can log into this admin site.')),
                ('is_active', models.BooleanField(default=True, verbose_name='active', help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.')),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined')),
                ('id', models.UUIDField(editable=False, default=uuid.uuid4, serialize=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True)),
                ('fullname', models.CharField(max_length=50, blank=True)),
                ('auth_amount', models.DecimalField(default=0, decimal_places=4, max_digits=15, blank=True)),
                ('accept_assign', models.BooleanField(default=True)),
                ('accept_notify', models.BooleanField(default=True)),
                ('employee_id', models.CharField(blank=True, max_length=100, null=True)),
                ('middle_initial', models.CharField(blank=True, max_length=1, null=True)),
                ('title', models.CharField(blank=True, max_length=100, null=True)),
                ('password_length', models.PositiveIntegerField(blank=True, help_text='Store the length of the current password.', null=True)),
                ('password_expire_date', models.DateField(blank=True, help_text="Date that the Person's password will expire next. Based upon the ``password_expire`` days set on the Role.", null=True)),
                ('password_one_time', models.CharField(blank=True, max_length=255, null=True)),
                ('password_change', models.DateTimeField(blank=True, help_text='DateTime of last password change', null=True)),
                ('password_history', django.contrib.postgres.fields.ArrayField(size=5, default=[], base_field=models.CharField(max_length=254), blank=True)),
                ('proxy_status', models.CharField(blank=True, max_length=100, verbose_name='Out of the Office Status', null=True)),
                ('proxy_start_date', models.DateField(blank=True, max_length=100, verbose_name='Out of the Office Status Start Date', null=True)),
                ('proxy_end_date', models.DateField(blank=True, max_length=100, verbose_name='Out of the Office Status End Date', null=True)),
                ('auth_currency', models.ForeignKey(to='accounting.Currency', blank=True, null=True)),
                ('groups', models.ManyToManyField(verbose_name='groups', related_query_name='user', blank=True, related_name='user_set', help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', to='auth.Group')),
                ('locale', models.ForeignKey(to='translation.Locale', blank=True, help_text="If the Person has not 'Locale', the Accept-Language header will be used or the Site's system setting.", null=True)),
                ('locations', models.ManyToManyField(related_name='people', to='location.Location', blank=True)),
                ('next_approver', models.ForeignKey(to=settings.AUTH_USER_MODEL, blank=True, related_name='nextapprover', null=True)),
                ('proxy_user', models.ForeignKey(to=settings.AUTH_USER_MODEL, blank=True, related_name='coveringuser', null=True)),
            ],
            options={
                'ordering': ('fullname',),
            },
            managers=[
                ('objects', person.models.PersonManager()),
                ('objects_all', django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.CreateModel(
            name='PersonStatus',
            fields=[
                ('id', models.UUIDField(editable=False, default=uuid.uuid4, serialize=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True)),
                ('name', models.CharField(unique=True, max_length=100)),
                ('default', models.BooleanField(default=False)),
            ],
            options={
                'abstract': False,
                'ordering': ('name',),
            },
        ),
        migrations.CreateModel(
            name='ProxyRole',
            fields=[
                ('id', models.UUIDField(editable=False, default=uuid.uuid4, serialize=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Role',
            fields=[
                ('id', models.UUIDField(editable=False, default=uuid.uuid4, serialize=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True)),
                ('role_type', models.CharField(default='Internal', blank=True, max_length=29, choices=[('Internal', 'Internal'), ('Third Party', 'Third Party')])),
                ('name', models.CharField(unique=True, max_length=75, help_text='Will be set to the Group Name')),
                ('dashboad_text', models.CharField(max_length=255, blank=True)),
                ('create_all', models.BooleanField(default=False, help_text='Allow document creation for all locations')),
                ('modules', models.TextField(blank=True)),
                ('dashboad_links', models.TextField(blank=True)),
                ('tabs', models.TextField(blank=True)),
                ('password_can_change', models.BooleanField(default=True)),
                ('password_min_length', models.PositiveIntegerField(default=6, blank=True)),
                ('password_history_length', django.contrib.postgres.fields.ArrayField(size=None, default=[], base_field=models.PositiveIntegerField(help_text='Will be NULL if password length has never been changed.'), blank=True)),
                ('password_digit_required', models.BooleanField(default=False)),
                ('password_lower_char_required', models.BooleanField(default=False)),
                ('password_upper_char_required', models.BooleanField(default=False)),
                ('password_special_char_required', models.BooleanField(default=False)),
                ('password_expire', models.IntegerField(default=90, help_text="Number of days after setting password that it will expire.If '0', password will never expire.", blank=True)),
                ('password_expire_alert', models.BooleanField(default=True, help_text="Does the Person want to be alerted 'pre pw expiring'. Alerts start 3 days before password expires.")),
                ('password_expired_login_count', models.IntegerField(blank=True, null=True)),
                ('proxy_set', models.BooleanField(default=False, help_text='Users in this Role can set their own proxy')),
                ('default_accept_assign', models.BooleanField(default=True)),
                ('accept_assign', models.BooleanField(default=False)),
                ('default_accept_notify', models.BooleanField(default=True)),
                ('accept_notify', models.BooleanField(default=False)),
                ('default_auth_amount', models.DecimalField(default=0, decimal_places=4, max_digits=15, blank=True)),
                ('allow_approval', models.BooleanField(default=False)),
                ('proxy_approval_bypass', models.BooleanField(default=False)),
                ('wo_notes', models.BooleanField(default=False)),
                ('wo_edit_closeout', models.BooleanField(default=False)),
                ('wo_show_inactive', models.BooleanField(default=False)),
                ('wo_show_tkt_attach', models.BooleanField(default=False)),
                ('wo_allow_backdate', models.BooleanField(default=False)),
                ('wo_days_backdate', models.PositiveIntegerField(blank=True, null=True)),
                ('inv_options', models.CharField(default='new', max_length=255, choices=[('new', 'new'), ('draft', 'draft')])),
                ('inv_wait', models.PositiveIntegerField(blank=True, null=True)),
                ('inv_select_assign', models.CharField(default='all', max_length=255, choices=[('all', 'all'), ('managers', 'managers')])),
                ('inv_autoapprove', models.BooleanField(default=False)),
                ('inv_max_approval_amount', models.PositiveIntegerField(default=0, blank=True)),
                ('inv_max_approval_currency', models.CharField(default='usd', max_length=25, blank=True)),
                ('inv_req_attach', models.BooleanField(default=True)),
                ('inv_close_wo', models.CharField(default='Do not display', max_length=255, choices=[('Do not display', 'Do not display'), ('unchecked', 'unchecked'), ('checked', 'checked')])),
                ('msg_address', models.BooleanField(default=False, help_text='whether users in this role are allowed to change the CC field on a ticket or work order')),
                ('msg_viewall', models.BooleanField(default=False)),
                ('msg_copy_email', models.BooleanField(default=False)),
                ('msg_copy_default', models.BooleanField(default=False)),
                ('msg_stored_link', models.BooleanField(default=False)),
                ('categories', models.ManyToManyField(to='category.Category', blank=True)),
                ('default_auth_currency', models.ForeignKey(to='accounting.Currency', blank=True, null=True)),
                ('group', models.OneToOneField(to='auth.Group', blank=True, null=True)),
                ('inv_wo_status', models.ForeignKey(to='order.WorkOrderStatus', blank=True, null=True)),
                ('location_level', models.ForeignKey(to='location.LocationLevel', blank=True, null=True)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.AddField(
            model_name='proxyrole',
            name='role',
            field=models.ForeignKey(to='person.Role'),
        ),
        migrations.AddField(
            model_name='person',
            name='role',
            field=models.ForeignKey(to='person.Role'),
        ),
        migrations.AddField(
            model_name='person',
            name='status',
            field=models.ForeignKey(to='person.PersonStatus', blank=True, null=True),
        ),
        migrations.AddField(
            model_name='person',
            name='user_permissions',
            field=models.ManyToManyField(verbose_name='user permissions', related_query_name='user', blank=True, related_name='user_set', help_text='Specific permissions for this user.', to='auth.Permission'),
        ),
    ]
