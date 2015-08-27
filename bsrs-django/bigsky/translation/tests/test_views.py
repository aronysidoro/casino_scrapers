import json

from rest_framework.test import APITestCase

from person.tests.factory import create_person, PASSWORD
from translation.models import Locale, Translation
from translation.serializers import LocaleSerializer, TranslationSerializer
from translation.tests.factory import create_locales, create_translations


class LocaleTests(APITestCase):

    def setUp(self):
        create_locales()
        self.locale = Locale.objects.first()
        self.person = create_person()
        self.data = LocaleSerializer(self.locale).data
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_list(self):
        response = self.client.get('/api/admin/locales/')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data['count'], Locale.objects.count())

    def test_get(self):
        response = self.client.get('/api/admin/locales/{}/'.format(self.locale.id))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data['id'], str(self.locale.id))

    def test_update(self):
        # setup
        init_name = self.data['name']
        new_name = 'English New'
        self.assertNotEqual(init_name, new_name)
        self.data['name'] = new_name
        # test
        response = self.client.put('/api/admin/locales/{}/'.format(self.locale.id),
            self.data, format='json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data['name'], new_name)


class TranslationTests(APITestCase):

    def setUp(self):
        create_translations()
        self.translation = Translation.objects.first()
        self.person = create_person()
        self.data = TranslationSerializer(self.translation).data
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_list(self):
        response = self.client.get('/api/admin/translations/')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data['count'], Translation.objects.count())

    def test_get(self):
        response = self.client.get('/api/admin/translations/{}/'
            .format(self.translation.id))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data['locale'], str(self.translation.locale.id))

    def test_update(self):
        # setup
        init_locale = Locale.objects.first()
        new_locale = Locale.objects.last()
        self.assertNotEqual(init_locale, new_locale)
        self.data['locale'] = str(new_locale.id)
        # test
        response = self.client.put('/api/admin/translations/{}/'
            .format(self.translation.id), self.data, format='json')
        print response
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data['locale'], str(new_locale.id))