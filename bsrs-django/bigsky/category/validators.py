from rest_framework.exceptions import ValidationError

from django.utils.translation import ugettext_lazy as _

from category.models import Category


class CategoryParentAndNameValidator(object):
    """Categories must be unique by Parent and Name."""

    message = _("Category with name: {name} and parent: {parent} already exists.")

    def __call__(self, kwargs):
        """
        :values: can either be the children or parents array
        :location_level: the location_level FK of the Location
        """
        id = kwargs.get('id', None)
        name = kwargs.get('name', None)
        parent = kwargs.get('parent', None)

        if (Category.objects.exclude(id=id)
                            .filter(name=name, parent=parent)
                            .exists()):
            raise ValidationError(self.message.format(name=name, parent=parent))