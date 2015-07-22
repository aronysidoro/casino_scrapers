'''
Big Sky Retail Systems Framework
Location serializers

Created on Jan 21, 2015

@author: tkrier
'''
from rest_framework import serializers

from contact.serializers import (
    PhoneNumberShortSerializer, AddressShortSerializer, EmailShortSerializer,
    )
from location.models import (
    LocationLevel, LocationStatus, LocationType, Location, 
    )
from person.serializers import PersonListSerializer


class LocationLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = LocationLevel
        fields = ('id', 'name', 'children')
        

class LocationStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = LocationStatus
        fields = ('id', 'name')


class LocationTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LocationType
        fields = ('id', 'name')


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ('id', 'name', 'number', 'level', 'status', 'type',
                  'people', 'relations')
        
class LocationGridSerializer(LocationSerializer):
    
    level_name = serializers.CharField(source='level.name', read_only=True)
    status_name = serializers.CharField(source='status.name', read_only=True)
    type_name = serializers.CharField(source='type.name', read_only=True)
    
    class Meta:
        model = Location
        fields = ('id', 'name', 'number', 'level_name', 'status_name', 'type_name')

class LocationFullSerializer(LocationGridSerializer):
    
    people = PersonListSerializer(many=True, read_only=True)
    phone_numbers = PhoneNumberShortSerializer(many=True, read_only=True)
    addresses = AddressShortSerializer(many=True, read_only=True)
    emails = EmailShortSerializer(many=True, read_only=True)
    
    class Meta:
        model = Location
        fields = ('id', 'name', 'number', 'level', 'level_name', 'status',
                  'status_name', 'type', 'type_name', 'people', 'relations',
                  'phone_numbers', 'addresses', 'emails')
