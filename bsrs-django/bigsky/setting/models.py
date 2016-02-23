import copy

from django.contrib.postgres.fields import JSONField

from setting.settings import DEFAULT_GENERAL_SETTINGS
from utils.models import BaseNameModel, SettingMixin


class Setting(SettingMixin, BaseNameModel):
    '''
    ``Setting`` records will be either Standard or Custom. and be set
    at levels. ex - Location, Role, User.
    '''
    settings = JSONField(blank=True, default={})

    def get_class_default_settings(self, name=None):
        try:
            setting = Setting.objects.get(name='general')
            return copy.copy(setting.settings)
        except Setting.DoesNotExist:
            return copy.copy(DEFAULT_GENERAL_SETTINGS)

    @classmethod
    def get_settings_name(cls):
        return 'general'

    def get_all_class_settings(self):
        return copy.copy(DEFAULT_GENERAL_SETTINGS)

    @classmethod
    def cls_get_all_class_settings(cls):
        return copy.copy(DEFAULT_GENERAL_SETTINGS)

    def get_all_instance_settings(self):
        return self.settings

    def get_all_instance_settings_full(self):
        return self.settings
