from contact.models import (PhoneNumber, PhoneNumberType, Email, EmailType,
    Address, AddressType)
from location.models import Location

import logging
logger = logging.getLogger(__name__)


def create_phone_numbers(domino_location, related_instance):
    ph_types = PhoneNumberType.objects.all()
    
    if domino_location.telephone:
        ph_type = ph_types.get(name='admin.phonenumbertype.telephone')
        PhoneNumber.objects.create(content_object=related_instance, object_id=related_instance.id,
            number=domino_location.telephone, type=ph_type)

    if domino_location.carphone:
        ph_type = ph_types.get(name='admin.phonenumbertype.cell')
        PhoneNumber.objects.create(content_object=related_instance, object_id=related_instance.id,
            number=domino_location.carphone, type=ph_type)

    if domino_location.fax:
        ph_type = ph_types.get(name='admin.phonenumbertype.fax')
        PhoneNumber.objects.create(content_object=related_instance, object_id=related_instance.id,
            number=domino_location.fax, type=ph_type)


def create_email(domino_location, related_instance):
    email_type = EmailType.objects.get(name='admin.emailtype.location')

    return Email.objects.create(content_object=related_instance,
        object_id=related_instance.id, email=domino_location.email,
        type=email_type)


def create_address(domino_location, related_instance):
    address_type = AddressType.objects.get(name='admin.address_type.location')

    def _resolve_none_str(s):
        return s if s else ''

    address = {
        'address': _resolve_none_str(domino_location.address1)+' '+_resolve_none_str(domino_location.address2),
        'city': domino_location.city,
        'state': domino_location.state,
        'postal_code': domino_location.zip,
        'country': domino_location.country
    }
    if any(address.values()):
        return Address.objects.create(content_object=related_instance,
            object_id=related_instance.id, type=address_type, **address)


def join_company_to_region(company, related_instance):
    company.children.add(related_instance)


def join_region_to_district(domino_location, related_instance):
    regions = Location.objects.filter(location_level__name='region')

    try:
        region = regions.get(number=domino_location.regionnumber)
    except Location.DoesNotExist as e:
        logger.debug("Location.pk:{}, LocationRegion.regionnumber:{} Not Found."
            .format(related_instance.id, domino_location.regionnumber))
    else:
        region.children.add(related_instance)


def join_district_to_store(domino_location, related_instance):
    districts = Location.objects.filter(location_level__name='district')

    try:
        district = districts.get(number=domino_location.distnumber)
    except Location.DoesNotExist as e:
        logger.debug("Location.pk:{}, LocationDistrict.distnumber:{} Not Found."
            .format(related_instance.id, domino_location.distnumber))
    else:
        district.children.add(related_instance)
