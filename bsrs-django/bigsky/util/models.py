from django.db import models
from django.utils.encoding import python_2_unicode_compatible
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey


########
# BASE #
########
'''
Base Model, Manager, and QuerySet for which all Models will inherit 
from. This will enforce not deleting, but just hiding records.
'''
class BaseQuerySet(models.query.QuerySet):
    pass


class BaseManager(models.Manager):
    '''
    Auto exclude deleted records
    '''
    def get_queryset(self):
        return BaseQuerySet(self.model, using=self._db).filter(deleted=False)

    def delete(self, override=False):
        return self.get_queryset().delete(override=override)


@python_2_unicode_compatible
class BaseModel(models.Model):
    '''
    All Model inheritance will start with this model.  It uses 
    time stamps, and defaults for `deleted=False` for querysets
    '''
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
    deleted = models.BooleanField(blank=True, default=False)

    objects = BaseManager()
    objects_all = models.Manager()

    class Meta:
        abstract = True

    def __str__(self):
        return "id: {self.id}; class: {self.__class__.__name__}; deleted: \
{self.deleted}".format(self=self)

    def delete(self, override=False, *args, **kwargs):
        '''
        Enforce only hiding objects and not deleting them unless explicitly 
        overriden.
        '''
        if not override:
            self.deleted=True
            self.save()
        else:
            super(BaseModel, self).delete(*args, **kwargs)


class Tester(BaseModel):
    
    class Meta:
        permissions = (
            ('GET', ['%(app_label)s.view_%(model_name)s']),
            )
    #     'OPTIONS': ['%(app_label)s.view_%(model_name)s'],
    #     'HEAD': ['%(app_label)s.view_%(model_name)s'],
    #     'POST': ['%(app_label)s.add_%(model_name)s'],
    #     'PUT': ['%(app_label)s.change_%(model_name)s'],
    #     'PATCH': ['%(app_label)s.change_%(model_name)s'],
    #     'DELETE': ['%(app_label)s.delete_%(model_name)s'],
    # }


@python_2_unicode_compatible
class AbstractName(BaseModel):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        abstract = True

    def __str__(self):
        return self.name


@python_2_unicode_compatible
class AbstractNameOrder(BaseModel):
    order = models.IntegerField()
    name = models.CharField(max_length=100, unique=True)
    
    class Meta:
        abstract = True
        ordering = ('order', 'name',)

    def __str__(self):
        return self.name


@python_2_unicode_compatible
class BaseSetting(BaseModel):
    '''
    ``Setting`` records will be either Standard or Custom. and be set 
    at levels. ex - Location, Role, User.
    '''
    settings = models.TextField(blank=True, help_text="JSON Dict saved as a string in DB")

    # Generic ForeignKey Settings, so ``Setting`` can be set 
    # for any Django Model
    content_type = models.ForeignKey(ContentType)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    class Meta:
        abstract = True

    def __str__(self):
        return self.settings


class MainSetting(BaseSetting):
    pass


class CustomSetting(BaseSetting):
    pass