from django.test import TestCase

from accounting.models import Currency
from tenant.models import Tenant
from tenant.tests.factory import get_or_create_tenant


class TenantTests(TestCase):

    def test_sc_fields(self):
        self.assertEqual(
            Tenant.SC_FIELDS,
            ['company_code', 'company_name', 'billing_contact', 'billing_address',
             'billing_email', 'billing_phone_number', 'implementation_contact_initial',
             'implementation_email']
        )

    def test_defaults(self):
        tenant = get_or_create_tenant()
        usd = Currency.objects.default()

        self.assertTrue(tenant.company_code)
        self.assertTrue(tenant.company_name)
        self.assertEqual(tenant.dashboard_text, "Welcome")
        self.assertIsNone(tenant.dtd_start)
        self.assertEqual(tenant.default_currency, usd)
        self.assertFalse(tenant.test_mode)
