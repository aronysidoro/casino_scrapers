from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType

from collections import namedtuple
from itertools import product

from utils import classproperty


def update_group(person, group):
    "Will make sure the ``person`` is in one, and only one group."
    for g in person.groups.all():
        person.groups.remove(g)
    person.groups.add(group)
    return person


class PermissionInfo(object):

    # models that have permissions
    MODELS = ['ticket', 'person', 'role', 'location', 'locationlevel', 'category']
    # allowed permission types
    PERMS = ['view', 'add', 'change', 'delete']
    # models' content type fields
    CONTENT_TYPE_FIELDS = [
        ('ticket', 'ticket'),
        ('person', 'person'),
        ('person', 'role'),
        ('location', 'location'),
        ('location', 'locationlevel'),
        ('category', 'category')
    ]

    @classproperty
    def CODENAMES(cls):
        return list(cls.names())

    @classproperty
    def ALL_DEFAULTS(cls):
        return dict.fromkeys(cls.names(), False)

    @classmethod
    def names(cls):
        yield from ('_'.join(x) for x in product(cls.PERMS, cls.MODELS))

    def setUp(self):
        """
        Create "view_%" Permission records that don't exist by default
        """
        for x in self.__class__.CONTENT_TYPE_FIELDS:
            ModelFieldData = namedtuple('ModelFieldData', ['app_label', 'model'])
            data = ModelFieldData._make(x)._asdict()
            content_type = ContentType.objects.get(**data)
            verbose_name = content_type.model_class()._meta.verbose_name

            for perm in self.__class__.PERMS:
                try:
                    Permission.objects.get(
                        codename='{}_{}'.format(perm, data['model']))
                except Permission.MultipleObjectsReturned:
                    pass
                except Permission.DoesNotExist:
                    Permission.objects.create(
                        codename='{}_{}'.format(perm, data['model']),
                        name='Can {} {}'.format(perm, verbose_name),
                        content_type=content_type,
                    )

    def all(self):
        """
        :return QuerySet: all supported Permissions by the system
        """
        return Permission.objects.filter(
            codename__in=self.__class__.CODENAMES)
