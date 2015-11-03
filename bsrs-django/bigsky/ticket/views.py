from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets

from ticket.models import Ticket, TicketActivity
from ticket.serializers import (TicketSerializer, TicketCreateSerializer,
    TicketListSerializer, TicketActivitySerializer)
from utils.views import BaseModelViewSet
from ticket import serializers as ts


class TicketsViewSet(BaseModelViewSet):

    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    permission_classes = (IsAuthenticated,)
    model = Ticket
    filter_fields = [f.name for f in model._meta.get_fields()]

    def get_serializer_class(self):
        """
        set the serializer based on the method
        """
        if self.action == 'list':
            return ts.TicketListSerializer
        elif self.action in ('create', 'update', 'partial_update'):
            return ts.TicketCreateSerializer
        else:
            return ts.TicketSerializer


class TicketActivityViewSet(viewsets.ModelViewSet):

    queryset = TicketActivity.objects.all()
    serializer_class = TicketActivitySerializer
    permission_classes = (IsAuthenticated,)
    model = TicketActivity
    filter_fields = [f.name for f in model._meta.get_fields()]
