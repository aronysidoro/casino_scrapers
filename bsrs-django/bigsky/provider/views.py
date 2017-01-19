from django.shortcuts import render
from rest_framework import permissions, viewsets, mixins, exceptions
from category.models import Category
from provider.models import Provider
from provider.serializers import ProviderSerializer
from utils.permissions import CrudPermissions
from utils.mixins import FilterRelatedMixin


class ProviderViewSet(FilterRelatedMixin, mixins.ListModelMixin, viewsets.GenericViewSet):

    model = Provider
    queryset = Provider.objects.all()
    serializer_class = ProviderSerializer
    permission_classes = (permissions.IsAuthenticated, CrudPermissions)
    filter_fields = [f.name for f in model._meta.get_fields()]

    def list(self, request, *args, **kwargs):
        """
        GET request to the /api/providers/ endpoint
        - param for: ?category=<id> (by trade^)
        - param to search by a provider's name, &name__icontains=<String>
        """
        if 'category' not in request.query_params:
            raise exceptions.ValidationError('errors.client.category_param_missing')

        try:
            Category.objects.get(id=request.query_params['category'])
        except Category.DoesNotExist:
            raise exceptions.ValidationError('errors.client.category_not_found')

        return super(ProviderViewSet, self).list(request, *args, **kwargs)
