import os

from django.db import models
from django.conf import settings
from django.utils.encoding import python_2_unicode_compatible
from django.core.exceptions import ValidationError as DjangoValidationError

from PIL import Image
from rest_framework.exceptions import ValidationError

from person.models import Person
from utils.models import BaseModel, BaseManager, BaseSettingModel


### SAVED SEARCHES

class SavedSearchManager(BaseManager):

    def person_saved_searches(self, person):
        """Used for bootsrapping the Person's SavedSearch's in the
        bootsrap config."""
        return [x.to_dict() for x in self.filter(person=person)]


@python_2_unicode_compatible
class SavedSearch(BaseModel):
    """
    So the Person can save their searches for any model.
    """
    name = models.CharField(max_length=254,
        help_text="name of the saved search that the Person designates.")
    person = models.ForeignKey(Person,
        help_text="The Person who saves the search.")
    endpoint_name = models.CharField(max_length=254,
        help_text="the Ember List API route name. i.e. 'admin.people.index'.")
    endpoint_uri = models.CharField(max_length=2048,
        help_text="API Endpoint that this search is saved for. With all keywords "
                  "ordering, and filters, etc...")

    objects = SavedSearchManager()

    class Meta:
        ordering = ('-modified',)
        verbose_name_plural = "Saved Searches"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        self.validate_endpoint_name()
        self.validate_person_name_unique()
        return super(SavedSearch, self).save(*args, **kwargs)

    def validate_endpoint_name(self):
        from bigsky.urls import router
        if self.endpoint_name not in [".".join(x[0].split('/'))+".index" for x in router.registry]:
            raise DjangoValidationError("{} is not a valid Ember List API endpoint name."
                .format(self.endpoint_name))

    def validate_person_name_unique(self):
        """Use ``self.created`` check, so this validator will only be triggered
        when creating new records."""
        if not self.created and SavedSearch.objects.filter(
            person=self.person, name=self.name).exists():

            raise ValidationError("Record for: {} with name: {} already exists.".format(
                self.person, self.name))

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "endpoint_name": self.endpoint_name,
            "endpoint_uri": self.endpoint_uri
        }


### SETTINGS

class MainSetting(BaseSettingModel):
    pass


class CustomSetting(BaseSettingModel):
    pass


###############
# ATTACHMENTS #
###############

### HELPERS

IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.gif', '.png']


### FILE PATHS

def upload_to(instance, filename):
    name, extension = os.path.splitext(filename)

    if extension in IMAGE_EXTENSIONS:
        dir_ = 'images/full'
    else:
        dir_ = 'files'

    return '/'.join(['attachments/{}'.format(dir_), filename])


def upload_to_images_medium(instance, filename):
    return '/'.join(['attachments/images/medium', filename])


def upload_to_images_thumbnail(instance, filename):
    return '/'.join(['attachments/images/thumbnails', filename])


### ATTACHMENT

@python_2_unicode_compatible
class Attachment(BaseModel):
    """
    Stores a File or Image w/ multiple sizes locations in a single model.

    Will reject uploads that exceed the ``settings.MAX_UPLOAD_SIZE``

    Populate ``filename`` and ``is_image`` upon upload.

    `MIME Types reference <http://www.sitepoint.com/web-foundations/mime-types-complete-list/>`_
    """
    model_id = models.UUIDField(help_text="UUID of the Model Instance that "
                                          "the Attachment is related to.")
    filename = models.CharField(max_length=100, blank=True)
    is_image = models.BooleanField(blank=True, default=False)
    file = models.FileField(upload_to=upload_to, null=True, blank=True)
    image_full = models.ImageField(upload_to=upload_to, null=True, blank=True)
    image_medium = models.ImageField(upload_to=upload_to_images_medium, null=True, blank=True)
    image_thumbnail = models.ImageField(upload_to=upload_to_images_thumbnail, null=True, blank=True)

    def __str__(self):
        return self.filename

    def save(self, *args, **kwargs):
        """
        Only the ``model_id`` and the ``file`` field will be available. After being sent,
        if it an Image, set the ``file=None``, and use the Image Fields.
        """
        self._validate_file_size()

        self.filename = self._filename

        name, extension = os.path.splitext(self.file.name)

        if extension in IMAGE_EXTENSIONS:
            # Mark as Image
            self.is_image = True
            # Save Image Sizes
            self.image_full = self.file

            self.image_medium.name = "/".join(['attachments/images/medium', self.filename])
            self.save_alt_image(location=self.image_medium.name, size=(100, 100))

            self.image_thumbnail.name = "/".join(['attachments/images/thumbnails', self.filename])
            self.save_alt_image(location=self.image_thumbnail.name, size=(50, 50))

        super(Attachment, self).save(*args, **kwargs)

    def save_alt_image(self, location, size):
        try:
            with Image.open(self.image_full) as im:
                im = im.resize(size, Image.ANTIALIAS)

                tail, head = os.path.split(os.path.join(settings.MEDIA_ROOT, location))
                if not os.path.exists(tail):
                    os.makedirs(tail)

                im.save(os.path.join(tail, head))
        except OSError:
            # ``SimpleUploadedFile`` in test will raise this error b/c ``self.file``
            # is not an actual file object.
            pass

    @property
    def _filename(self):
        try:
            return os.path.abspath(self.file.name).split("/")[-1]
        except AttributeError:
            return self.file.name

    @property
    def image_extensions(self):
        return ['jpg', 'jpeg', 'gif', 'png']

    def _validate_file_size(self):
        try:
            if self.file.size > settings.MAX_UPLOAD_SIZE:
                raise DjangoValidationError("File size: {} to big".format(
                    self.file._file._size))
        except AttributeError:
            pass