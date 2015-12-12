from django.core.management.base import BaseCommand

from contact.models import Email, PhoneNumber, Address
from location.models import Location, LocationLevel
from utils_transform.tlocation.models import LocationStore

import logging
logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'LocationStore migrate script'

    def handle(self, *args, **options):
        location_level = LocationLevel.objects.get(name='store')
        districts = Location.objects.filter(location_level__name='district')

        for x in LocationStore.objects.all():
            instance = Location.objects.create(location_level=location_level, name=x.name,
                                               number=x.number)

            # PhoneNumbers
            ph_types = PhoneNumberType.objects.all()

            if x.telephone:
                ph_type = ph_types.get(name='telephone')
                PhoneNumber.objects.create(content_object=instance, object_id=instance.id,
                    number=x.telephone, type=ph_type)
            if x.carphone:
                ph_type = ph_types.get(name='carphone')
                PhoneNumber.objects.create(content_object=instance, object_id=instance.id,
                    number=x.carphone, type=ph_type)
            if x.fax:
                ph_type = ph_types.get(name='fax')
                PhoneNumber.objects.create(content_object=instance, object_id=instance.id,
                    number=x.fax, type=ph_type)

            # Email
            if x.email:
                Email.objects.create(content_object=instance,
                    object_id=instance.id, email=x.email)

            # Address
            address = {
                'address1': x.address1,
                'address2': x.address2,
                'city': x.city,
                'state': x.state,
                'zip': x.zip,
                'county': x.county
            }
            if any(address.values()):
                Address.objects.create(content_object=instance,
                    object_id=instance.id, **address)

            # JOIN Region to District
            try:
                district = districts.objects.get(number=x.distnumber)
            except Location.DoesNotExist as e:
                logger.debug(e)
            else:
                district.children.add(instance)
