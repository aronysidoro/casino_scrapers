import copy

from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import Permission, User
from django.shortcuts import get_object_or_404

from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import detail_route

from accounting.models import Currency
from accounting.serializers import CurrencySerializer
from util.views import BaseModelViewSet


class CurrencyViewSet(BaseModelViewSet):

    queryset = Currency.objects.all()
    serializer_class = CurrencySerializer
    permission_classes = (permissions.IsAuthenticated,)