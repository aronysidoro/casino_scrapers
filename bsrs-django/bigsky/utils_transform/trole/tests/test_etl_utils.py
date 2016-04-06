import logging
logger = logging.getLogger(__name__)

from django.conf import settings
from django.contrib.auth.models import Group
from django.test import TestCase

from category.models import Category
from location.models import LocationLevel
from location.tests.factory import create_location_levels
from person.models import Role
from utils_transform.tlocation.models import (LOCATION_COMPANY, LOCATION_FMU,
    LOCATION_REGION, LOCATION_DISTRICT, LOCATION_STORE)
from utils_transform.trole.management.commands._etl_utils import (create_role, run_role_migrations,
get_location_level, ROLE_TYPE_INTERNAL, ROLE_TYPE_THIRD_PARTY, SELECTION_CONTRACTOR,
SELECTION_REGION, SELECTION_DISTRICT, SELECTION_STORE, SELECTION_FMU,)
from utils_transform.trole.tests.factory import create_domino_role, create_domino_role_and_related


class RunRoleMigrationsTests(TestCase):

    def test_run_role_migrations(self):
        domino_role = create_domino_role_and_related()

        run_role_migrations()

        role = Role.objects.get(name=domino_role.name)
        self.assertEqual(role.role_type, "admin.role.type.internal")
        self.assertEqual(role.location_level.name, LOCATION_REGION)
        self.assertEqual(role.categories.count(), 2)


class CreateRoleTests(TestCase):

    def setUp(self):
        create_location_levels()

    def test_create(self):
        # test general properties that don't change based on `selection`
        domino_role = create_domino_role_and_related()

        role = create_role(domino_role)

        self.assertIsInstance(role, Role)
        self.assertEqual(role.name, domino_role.name)
        self.assertEqual(role.role_type, "admin.role.type.internal")
        self.assertEqual(role.location_level.name, LOCATION_REGION)
        self.assertEqual(role.categories.count(), 2)
        # Group
        groups_ = Group.objects.filter(name=domino_role.name)
        self.assertEqual(groups_.count(), 1)

    def test_third_party(self):
        domino_role = create_domino_role_and_related(selection=SELECTION_CONTRACTOR)
        role = create_role(domino_role)
        self.assertEqual(role.role_type, ROLE_TYPE_THIRD_PARTY)
        self.assertEqual(role.location_level.name, LOCATION_COMPANY)

    def test_region(self):
        domino_role = create_domino_role_and_related(selection=SELECTION_REGION)
        role = create_role(domino_role)
        self.assertEqual(role.role_type, ROLE_TYPE_INTERNAL)
        self.assertEqual(role.location_level.name, LOCATION_REGION)

    def test_district(self):
        domino_role = create_domino_role_and_related(selection=SELECTION_DISTRICT)
        role = create_role(domino_role)
        self.assertEqual(role.role_type, ROLE_TYPE_INTERNAL)
        self.assertEqual(role.location_level.name, LOCATION_DISTRICT)

    def test_store(self):
        domino_role = create_domino_role_and_related(selection=SELECTION_STORE)
        role = create_role(domino_role)
        self.assertEqual(role.role_type, ROLE_TYPE_INTERNAL)
        self.assertEqual(role.location_level.name, LOCATION_STORE)

    def test_fmu(self):
        domino_role = create_domino_role_and_related(selection=SELECTION_FMU)
        role = create_role(domino_role)
        self.assertEqual(role.role_type, ROLE_TYPE_INTERNAL)
        self.assertEqual(role.location_level.name, LOCATION_FMU)

    def test_location_level_not_found_logged(self):
        LocationLevel.objects.all().delete()
        domino_role = create_domino_role()
        with open(settings.LOGGING_INFO_FILE, 'w'): pass

        create_role(domino_role)

        self.assertEqual(LocationLevel.objects.count(), 0)
        with open(settings.LOGGING_INFO_FILE, 'r') as f:
            content = f.read()
        self.assertIn("LocationLevel name:{} Not Found.".format(get_location_level(domino_role)), content)

    def test_categories_not_found_logged(self):
        Category.objects.all().delete()
        domino_role = create_domino_role()
        with open(settings.LOGGING_INFO_FILE, 'w'): pass

        create_role(domino_role)

        self.assertEqual(Category.objects.count(), 0)
        with open(settings.LOGGING_INFO_FILE, 'r') as f:
            content = f.read()
        cats = domino_role.categories.split(";")
        for cat in cats:
            self.assertIn("Category name:{} Not Found.".format(cat), content)


# NOTE: Not part of test suite, to run manually on Jenkins for logging checks.
def manual_log_check():
    logger.debug('debug')
    logger.info('info')
    logger.warning('warning')
    logger.error('error')
    logger.critical('critical')