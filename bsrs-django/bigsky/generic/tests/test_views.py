import os
from os.path import dirname, join
import json
import uuid
from io import BytesIO
import shutil

from django.conf import settings
from django.test.client import MULTIPART_CONTENT, BOUNDARY, encode_multipart
from django.core.urlresolvers import reverse
from django.db.models.loading import get_model

from model_mommy import mommy
from rest_framework.test import APITestCase

from generic.models import SavedSearch, Attachment
from generic.serializers import SavedSearchSerializer
from person.tests.factory import PASSWORD, create_single_person, create_role, create_person
from utils.tests.helpers import remove_attachment_test_files


class SavedSearchTests(APITestCase):

    def setUp(self):
        # Role
        self.role = create_role()
        self.person = create_single_person(name='aaron', role=self.role)
        self.client.login(username=self.person.username, password=PASSWORD)
        self.saved_search = mommy.make(SavedSearch, person=self.person,
            endpoint_name='admin.people.index')

    def tearDown(self):
        self.client.logout()

    def test_create(self):
        data = {
            "id": str(uuid.uuid4()),
            "name": "my new search",
            "endpoint_name": self.saved_search.endpoint_name,
            "endpoint_uri": "/api/admin/phone-numbers/"
        }
        response = self.client.post('/api/admin/saved-searches/', data, format='json')
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.content.decode('utf8'))
        self.assertIsInstance(SavedSearch.objects.get(id=data['id']), SavedSearch)

    def test_list(self):
        response = self.client.get('/api/admin/saved-searches/')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['endpoint_name'], self.saved_search.endpoint_name)

    def test_detail(self):
        response = self.client.get('/api/admin/saved-searches/{}/'.format(self.saved_search.id))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.saved_search.id))

    def test_update(self):
        # Setup
        serializer = SavedSearchSerializer(self.saved_search)
        data = serializer.data
        data['endpoint_uri'] = "/api/admin/emails/?ordering=-email"
        # test
        response = self.client.put('/api/admin/saved-searches/{}/'.format(self.saved_search.id),
            data=data, format='json')
        self.assertEqual(response.status_code, 200)
        new_data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['endpoint_uri'], new_data['endpoint_uri'])

    def test_data(self):
        response = self.client.get('/api/admin/saved-searches/{}/'.format(self.saved_search.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.saved_search.id))
        self.assertEqual(data['name'], self.saved_search.name)
        self.assertEqual(data['endpoint_name'], self.saved_search.endpoint_name)
        self.assertEqual(data['endpoint_uri'], self.saved_search.endpoint_uri)

    ### util.UniqueForActiveValidator - two key tests

    def test_unique_for_active_two_keys(self):
        serializer = SavedSearchSerializer(self.saved_search)
        data = serializer.data
        data['id'] = str(uuid.uuid4())
        response = self.client.post('/api/admin/saved-searches/', data=data, format='json')
        self.assertEqual(response.status_code, 400)

    def test_unique_for_active_two_keys_deleted(self):
        # Ignore deleted models when checking for uniqueness
        self.saved_search.delete()
        serializer = SavedSearchSerializer(self.saved_search)
        data = serializer.data
        data['id'] = str(uuid.uuid4())
        response = self.client.post('/api/admin/saved-searches/', data=data, format='json')
        self.assertEqual(response.status_code, 201)


class ExportDataTests(APITestCase):

    def setUp(self):
        # Role
        self.role = create_role()
        self.person = create_single_person(name='aaron', role=self.role)
        create_person(_many=10)
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_get(self):
        response = self.client.get(reverse("export_data"))
        self.assertEqual(response.status_code, 403)

    def test_post_bad_data(self):
        data = {
            'app_name': 'person',
            'model_name': 'person'
        }
        response = self.client.post(reverse("export_data"), data, format='json')
        self.assertEqual(response.status_code, 400)

    def test_post_good(self):
        data = {
            'app_name': 'person',
            'model_name': 'person',
            'fields': ['id', 'username'],
            'query_params': {'username__icontains': 'aaron'}
        }
        model = get_model(data['app_name'], data['model_name'])
        response = self.client.post(reverse("export_data"), data, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEquals(
            response.get('Content-Disposition'),
            'attachment; filename="{name}.csv"'.format(
                name=model._meta.verbose_name_plural)
        )


class AttachmentTests(APITestCase):

    def setUp(self):
        self.person = create_single_person()

        self.base_dir = dirname(dirname(dirname(__file__)))
        # file
        self.file = join(self.base_dir, "source/test_in/es.csv")
        self.file_filename = os.path.split(self.file)[1]

        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

        # remove test attachements after running test
        remove_attachment_test_files()

    def test_create_file(self):
        id = str(uuid.uuid4())
        with open(self.file) as data:
            post_data = {
                'id': id,
                'filename': self.file_filename,
                'file': data
            }

            response = self.client.post("/api/admin/attachments/", post_data)

            self.assertEqual(response.status_code, 201)
            data = json.loads(response.content.decode('utf8'))
            self.assertEqual(data['id'], id)
            self.assertEqual(data['filename'], self.file_filename)
            # verify file save location
            attachment = Attachment.objects.get(id=id)
            self.assertIn(
                "/".join([settings.FILES_SUB_PATH, self.file_filename.split(".")[0]]),
                str(attachment.file)
            )

    def test_create_image(self):
        id = str(uuid.uuid4())

        # This is a 1x1 black png
        simple_png = BytesIO(b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\rIDATx\x9cc````\x00\x00\x00\x05\x00\x01\xa5\xf6E@\x00\x00\x00\x00IEND\xaeB`\x82')
        simple_png.name = 'test.png'

        post_data = {
            'id': id,
            'filename': simple_png.name,
            'file': simple_png
        }

        response = self.client.post("/api/admin/attachments/", post_data)

        self.assertEqual(response.status_code, 201)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], id)
        self.assertEqual(data['filename'], simple_png.name)
        # verify file save location
        attachment = Attachment.objects.get(id=id)
        self.assertEqual(
            "/".join([settings.IMAGE_FULL_SUB_PATH, simple_png.name]),
            str(attachment.file)
        )
        self.assertEqual(
            "/".join([settings.IMAGE_FULL_SUB_PATH, simple_png.name]),
            str(attachment.image_full)
        )

    def test_delete_file(self):
        # intial create
        id = str(uuid.uuid4())
        with open(self.file) as data:
            post_data = {
                'id': id,
                'filename': self.file_filename,
                'file': data
            }

            response = self.client.post("/api/admin/attachments/", post_data)

            file_object = Attachment.objects.get(id=id)
            self.assertEqual(response.status_code, 201)
            self.assertTrue(os.path.isfile(
                os.path.join(settings.MEDIA_ROOT, str(file_object.file))))

            # delete - record and file from 'file system'
            response = self.client.delete(
                "/api/admin/attachments/{}/".format(id),
                {'override': True}
            )
            self.assertEqual(response.status_code, 204)
            self.assertFalse(os.path.isfile(
                os.path.join(settings.MEDIA_ROOT, str(file_object.file))))
