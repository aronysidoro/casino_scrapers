'''
Big Sky Retail Systems Framework
Person serializers

Created on Jan 16, 2015

@author: tkrier
'''
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.models import Group

from rest_framework import serializers

from location.models import LocationLevel, Location
from person.models import PersonStatus, Person, Role
from contact.models import PhoneNumber, Address, Email
from contact.serializers import (
    PhoneNumberShortSerializer, AddressShortSerializer, EmailShortSerializer,
    AddressShortFKSerializer, PhoneNumberShortFKSerializer,
)


'''
Users consist of the standard Django User model plus the ``Person`` model
This serializer hides the relationship to ``Person`` from the client
Special care needed when updating passwords and creating new users.
    
:Todo: 
    We may want to create a separate action here to update password. 
    With this current implementation the password can be updated in the 
    update payload using a put, but password must be included for a put 
    update since it's required in the User model. patch can be used to 
    only update the password. Another option would be to add the password 
    change to the session api.

:Todo: 
    Provide additional controls over who can update a password... either
    their own or someone elses. For now if the user can update or create they
    update the password as well.
    
'''

### Base ###

class RoleSerializer(serializers.ModelSerializer):

    name = serializers.CharField(source='group.name')

    class Meta:
        model = Role
        fields = ('id', 'name',)


class PersonStatusSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = PersonStatus
        fields = ('id', 'name')


PERSON_FIELDS = (
    'deleted', 'id', 'username', 'first_name', 'middle_initial',
    'last_name', 'title', 'emp_number', 'auth_amount', 'role', 'status'
    )


class PersonCreateSerializer(serializers.ModelSerializer):

    # optional contact info
    phone_numbers = PhoneNumberShortFKSerializer(many=True)
    addresses = AddressShortFKSerializer(many=True)

    class Meta:
        model = Person
        write_only_fields = ('password',)
        fields = (
            'username', 'email', 'password', 'first_name', 'last_name', # user fields
            'role', 'status', # keys
            'location', 'phone_numbers', 'addresses',
        )

    def create(self, validated_data):
        # first pop off related models or else they will be sent to 
        # `Person` create()
        phone_numbers = validated_data.pop('phone_numbers')
        addresses = validated_data.pop('addresses')
        # PhoneNumbers
        person = Person.objects.create(**validated_data)
        for ph in phone_numbers:
            PhoneNumber.objects.create(person=person, **ph)
        # Addresses
        for ad in addresses:
            Address.objects.create(person=person, **ad)
        return person


class PersonListSerializer(serializers.ModelSerializer):

    role = RoleSerializer(read_only=True)
    status = PersonStatusSerializer(read_only=True)

    class Meta:
        model = Person
        fields = PERSON_FIELDS


class PersonDetailSerializer(PersonListSerializer):

    phone_numbers = PhoneNumberShortSerializer(many=True, read_only=True)
    addresses = AddressShortSerializer(many=True, read_only=True)

    class Meta:
        model = Person
        fields = PERSON_FIELDS + ('phone_numbers', 'addresses',)


class PersonUpdateSerializer(serializers.ModelSerializer):

    phone_numbers = PhoneNumberShortFKSerializer(many=True, read_only=True)
    addresses = AddressShortFKSerializer(many=True, read_only=True)

    class Meta:
        model = Person
        fields = PERSON_FIELDS + ('phone_numbers', 'addresses',)


class RoleDetailSerializer(serializers.ModelSerializer):

    group = serializers.PrimaryKeyRelatedField(
        queryset=Group.objects.all(),
        required=False
        )
    location_level = serializers.PrimaryKeyRelatedField(
        queryset=LocationLevel.objects.all(),
        required=False
        )
    name = serializers.CharField(source='group.name')

    class Meta:
        model = Role
        fields = ('id', 'group', 'name', 'location_level', 'role_type',)
    
