from setting.models import Setting
from setting.schemas import schema
from setting.validators import SettingsSchemaValidator
from utils.serializers import BaseCreateSerializer, SettingSerializerMixin
from utils.validators import SettingsValidator


class SettingListSerializer(BaseCreateSerializer):

    class Meta:
        model = Setting
        fields = ('id', 'name',)


class SettingCreateSerializer(BaseCreateSerializer):

    class Meta:
        model = Setting
        validators = [SettingsValidator(model)]
        fields = ('id', 'name',)


class SettingSerializer(SettingSerializerMixin, BaseCreateSerializer):

    class Meta:
        model = Setting
        validators = [SettingsSchemaValidator(model, schema)]
        fields = ('id', 'name', 'settings',)
