from decimal import Decimal

from django.conf import settings
from django.test import TestCase

from model_mommy import mommy

from contact.models import PhoneNumber, Email
from contact.tests.factory import create_phone_number_type, create_email_type
from location.models import Location, LocationLevel, LOCATION_COMPANY, LOCATION_REGION
from location.tests.factory import create_location_level
from person.models import Role, Person, PersonStatus
from person.tests.factory import create_single_person, create_person_status, create_role
from utils.create import LOREM_IPSUM_WORDS, _generate_chars
from utils_transform.tperson.management.commands._etl_utils import (create_phone_numbers,
    create_email, create_person, run_person_migrations, top_level_with_locations,
    non_top_level_with_no_locations, get_person_status, shorten_strings,)
from utils_transform.tperson.models import DominoPerson
from utils_transform.tperson.tests.factory import create_domino_person


LOCATIONNUMBERS = "11;12;13"
PHONENUMBER = "987-654-3210"
EMAILADDRESS = "emailtest@testee.com"


class CreatePhoneNumbersTests(TestCase):

    def setUp(self):
        create_phone_number_type(name='admin.phonenumbertype.telephone')

    def test_phone_number(self):
        person = create_single_person()
        domino_person = create_domino_person()
        self.assertIsNotNone(domino_person.phone_number)
        self.assertEqual(person.phone_numbers.count(), 0)

        create_phone_numbers(domino_person, person)

        self.assertEqual(person.phone_numbers.count(), 1)
        self.assertEqual(person.phone_numbers.first().number, domino_person.phone_number)

    def test_phone_number__does_not_exist(self):
        person = create_single_person()
        domino_person = create_domino_person()
        domino_person.phone_number = None
        domino_person.save()
        self.assertIsNone(domino_person.phone_number)
        self.assertEqual(person.phone_numbers.count(), 0)

        create_phone_numbers(domino_person, person)

        self.assertEqual(person.phone_numbers.count(), 0)


class CreateEmailTests(TestCase):

    def setUp(self):
        # Emails
        self.email_type_person = 'admin.emailtype.personal'
        self.email_type_sms = 'admin.emailtype.sms'
        create_email_type(name=self.email_type_person)
        create_email_type(name=self.email_type_sms)
        # Person
        self.person = create_single_person()
        self.domino_person = create_domino_person()

    def test_create_email__personal(self):
        self.assertIsNotNone(self.domino_person.email_address)
        self.assertEqual(self.person.emails.count(), 0)

        create_email(self.domino_person, self.person)

        self.assertEqual(self.person.emails.filter(type__name=self.email_type_person).count(), 1)
        self.assertEqual(self.person.emails.filter(type__name=self.email_type_person).first().email, self.domino_person.email_address)

    def test_create_email__personal__none(self):
        self.domino_person.email_address = None
        self.domino_person.save()
        self.assertEqual(self.person.emails.count(), 0)

        create_email(self.domino_person, self.person)

        self.assertEqual(self.person.emails.filter(type__name=self.email_type_person).count(), 0)

    def test_create_email__sms(self):
        self.assertIsNotNone(self.domino_person.sms_address)
        self.assertEqual(self.person.emails.count(), 0)

        create_email(self.domino_person, self.person)

        self.assertEqual(self.person.emails.filter(type__name=self.email_type_sms).count(), 1)
        self.assertEqual(self.person.emails.filter(type__name=self.email_type_sms).first().email, self.domino_person.sms_address)

    def test_create_email__sms_none(self):
        self.domino_person.sms_address = None
        self.domino_person.save()
        self.assertEqual(self.person.emails.count(), 0)

        create_email(self.domino_person, self.person)

        self.assertEqual(self.person.emails.filter(type__name=self.email_type_sms).count(), 0)


class CreatePersonTests(TestCase):

    def setUp(self):
        #status required
        create_person_status('admin.person.status.active')
        create_phone_number_type(name='admin.phonenumbertype.telephone')
        create_email_type(name='admin.emailtype.personal')
        create_email_type(name='admin.emailtype.sms')
        company_location = Location.objects.create_top_level()
        create_role(name='Internal Audit', location_level=company_location.location_level, category=None)

        self.domino_person = create_domino_person()

    def test_no_role(self):
        name = 'foo'
        self.domino_person.role = name
        self.domino_person.save()
        with self.assertRaises(Role.DoesNotExist):
            Role.objects.get(name=name)

        person = create_person(self.domino_person)

        self.assertIsNone(person)
        with self.assertRaises(Person.DoesNotExist):
            Person.objects.get(username=self.domino_person.username)

    def test_no_role__logged(self):
        Role.objects.all().delete()
        with open(settings.LOGGING_INFO_FILE, 'w'): pass

        person = create_person(self.domino_person)

        self.assertEqual(Role.objects.count(), 0)
        with open(settings.LOGGING_INFO_FILE, 'r') as f:
            content = f.read()
        self.assertIn("Role name:{} Not Found.".format(self.domino_person.role), content)

    def test_poorly_configured_location_level(self):
        # none top level Role, with no locations, so no Person record gets created
        non_top_level = mommy.make(LocationLevel)
        non_top_level_role = create_role(location_level=non_top_level)
        self.domino_person.role = non_top_level_role.name
        self.domino_person.save()

        person = create_person(self.domino_person)

        self.assertIsNone(person)
        with self.assertRaises(Person.DoesNotExist):
            Person.objects.get(username=self.domino_person.username)

    def test_poorly_configured_location_level__logged(self):
        location_level, _ = LocationLevel.objects.get_or_create(name=LOCATION_COMPANY)
        role = mommy.make(Role, location_level=location_level)
        self.domino_person.role = role.name
        self.domino_person.locations = "foo;bar"
        self.domino_person.save()
        with open(settings.LOGGING_INFO_FILE, 'w'): pass

        person = create_person(self.domino_person)

        with open(settings.LOGGING_INFO_FILE, 'r') as f:
            content = f.read()
        self.assertIn("LocationLevel and Location(s) not consistent. Username:{}, LocationLevel:{}, Locations:{}."
                      .format(self.domino_person.username, role.location_level, self.domino_person.locations),
            content
        )

    def test_create_person__shorten_names(self):
        domino_person = create_domino_person()
        name = _generate_chars(31)
        self.assertTrue(len(name) > 30)
        domino_person.first_name = name
        domino_person.middle_initial = name
        domino_person.last_name = name
        domino_person.username = name
        domino_person.save()

        person = create_person(domino_person)

        self.assertEqual(len(person.first_name), 30)
        self.assertEqual(len(person.middle_initial), 1)
        self.assertEqual(len(person.last_name), 30)
        self.assertEqual(len(person.username), 30)

    def test_password(self):
        person = create_person(self.domino_person)

        self.assertIsNotNone(person.password)
        self.client.login(username=self.domino_person.username,
            password=self.domino_person.username)
        self.assertIn('_auth_user_id', self.client.session)

    def test_create_person(self):
        domino_person = create_domino_person()
    
        person = create_person(domino_person)

        self.assertIsInstance(person, Person)
        self.assertEqual(person.username, domino_person.username)
        self.assertEqual(person.role.name, 'Internal Audit')
        self.assertEqual(person.status.name, 'admin.person.status.active')
        self.assertEqual(person.middle_initial, domino_person.middle_initial[:1])
        person_location = person.locations.first()
        self.assertEqual(person_location.name, settings.LOCATION_TOP_LEVEL_NAME)

    def test_run_person_migrations(self):
        domino_person = create_domino_person()

        run_person_migrations()

        person = Person.objects.get(username__exact=domino_person.username)
        self.assertEqual(person.role.name, 'Internal Audit')
        self.assertEqual(person.status.name, 'admin.person.status.active')
        self.assertEqual(person.auth_amount, Decimal('92826.33'))

    def test_blank_middle_initial(self):
        domino_person = create_domino_person()
        domino_person.middle_initial = None
        
        person_ = create_person(domino_person)

        self.assertEqual(person_.middle_initial, None)

    def test_person_location(self):
        # LOCATIONNUMBERS gets split by ";", and all 3 get cerated b/c "Store Manager"
        # Role matches with "Store" LocationLevel
        domino_person = create_domino_person()
        domino_person.locations = LOCATIONNUMBERS
        domino_person.role = "Store Manager"
        # Location(s)
        store_location_level = create_location_level(name='Store')
        Location.objects.create(location_level=store_location_level, name='loc1', number='11')
        Location.objects.create(location_level=store_location_level, name='loc1', number='12')
        Location.objects.create(location_level=store_location_level, name='loc1', number='13')
        # Role
        create_role(name='Store Manager', location_level=store_location_level, category=None)

        person_ = create_person(domino_person)

        person_location = person_.locations.all()[0]
        self.assertIsInstance(person_location, Location)
        self.assertEqual(person_.locations.count(), 3)
        
    def test_person_bad_location(self):
        domino_person = create_domino_person()
        domino_person.locations = '3534534'
        domino_person.role = "Store Manager"
        store_location_level = create_location_level(name='Store')
        create_role(name='Store Manager', location_level=store_location_level, category=None)

        create_person(domino_person)

        with self.assertRaises(Person.DoesNotExist):
            Person.objects.get(username=domino_person.username)
        
    def test_person_missing_location(self):
        domino_person = create_domino_person()
        domino_person.locations = None
        domino_person.role = "Store Manager"
        store_location_level = create_location_level(name='Store')
        create_role(name='Store Manager', location_level=store_location_level, category=None)

        create_person(domino_person)

        with self.assertRaises(Person.DoesNotExist):
            Person.objects.get(username=domino_person.username)
        
    def test_person_extra_location(self):
        domino_person = create_domino_person()
        domino_person.locations = "32344"
        domino_person.role = "Internal Audit"
        store_location_level = create_location_level(name='Store')
        create_role(name='Store Manager', location_level=store_location_level, category=None)

        create_person(domino_person)

        with self.assertRaises(Person.DoesNotExist):
            Person.objects.get(username=domino_person.username)

    def test_person_phonenumber(self):
        domino_person = create_domino_person()
        
        person_ = create_person(domino_person)

        person_phonenumber = person_.phone_numbers.all()[0]
        self.assertIsInstance(person_phonenumber, PhoneNumber)
        self.assertEqual(person_phonenumber.number, PHONENUMBER)
        
    def test_person_email(self):
        domino_person = create_domino_person()
        
        person_ = create_person(domino_person)

        person_email_address = person_.emails.all()[0]
        self.assertIsInstance(person_email_address, Email)
        self.assertEqual(person_email_address.email, EMAILADDRESS)

    def test_top_level_with_locations(self):
        top_level = LocationLevel.objects.create_top_level()
        top_level_role = create_role(location_level=top_level)
        self.domino_person.locations = "foo;bar"
        self.domino_person.save()
        self.assertTrue(self.domino_person.locations)

        ret = top_level_with_locations(top_level_role, self.domino_person)

        self.assertTrue(ret)

    def test_non_top_level_with_no_locations(self):
        non_top_level = mommy.make(LocationLevel)
        non_top_level_role = create_role(location_level=non_top_level)
        self.assertIsNone(self.domino_person.locations)

        ret = non_top_level_with_no_locations(non_top_level_role, self.domino_person)

        self.assertTrue(ret)

    def test_add_locations__logged(self):
        location_level, _ = LocationLevel.objects.get_or_create(name=LOCATION_REGION)
        role = mommy.make(Role, location_level=location_level)
        self.domino_person.role = role.name
        self.domino_person.locations = "foo;bar"
        self.domino_person.save()
        role = Role.objects.get(name=self.domino_person.role)
        with open(settings.LOGGING_INFO_FILE, 'w'): pass

        person = create_person(self.domino_person)

        with open(settings.LOGGING_INFO_FILE, 'r') as f:
            content = f.read()
        for location in self.domino_person.locations.split(";"):
            self.assertIn("Location number:{} with LocationLevel: {} Not Found."
                          .format(location, role.location_level),
                content
            )

    def test_get_person_status__active(self):
        self.domino_person.status == "Active"
        self.domino_person.save()

        ret = get_person_status(self.domino_person)

        self.assertIsInstance(ret, PersonStatus)
        self.assertEqual(ret.name, "admin.person.status.active")

    def test_get_person_status__inactive(self):
        domino_person = mommy.make(DominoPerson, status='foo')
        self.assertNotEqual(domino_person.status, "Active")

        ret = get_person_status(domino_person)

        self.assertIsInstance(ret, PersonStatus)
        self.assertEqual(ret.name, "admin.person.status.inactive")

    def test_shorten_strings(self):
        self.domino_person.first_name = LOREM_IPSUM_WORDS
        self.domino_person.save()
        self.assertTrue(len(self.domino_person.first_name) > 30)

        ret = shorten_strings(self.domino_person, ['first_name'])

        self.assertTrue(len(ret.first_name) == 30)

    def test_shorten_strings__length(self):
        self.domino_person.first_name = LOREM_IPSUM_WORDS
        self.domino_person.save()
        self.assertTrue(len(self.domino_person.first_name) > 30)
        new_length = 1

        ret = shorten_strings(self.domino_person, ['first_name'], length=new_length)

        self.assertTrue(len(ret.first_name) == new_length)