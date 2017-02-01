from rest_framework import serializers

from accounting.serializers import CurrencyIdNameSerializer
from category.serializers import CategoryLeafWorkOrderSerializer
from location.serializers import LocationSerializer
from person.serializers import PersonTicketSerializer
from sc.etl import WorkOrderEtlDataAdapter
from provider.serializers import ProviderDetailSerializer
from utils.serializers import BaseCreateSerializer
from utils.validators import gte_today
from work_order.models import WorkOrder, WorkOrderPriority, WorkOrderStatus


class WorkOrderStatusSerializer(serializers.ModelSerializer):

    class Meta:
        model = WorkOrderStatus
        fields = ('id', 'name')


WO_FIELDS = ('id', 'approver', 'assignee', 'category', 'completed_date', 'gl_code',
    'cost_estimate', 'cost_estimate_currency', 'expiration_date', 'instructions',
    'location', 'priority', 'provider', 'requester', 'status', 'scheduled_date')


class WorkOrderListSerializer(serializers.ModelSerializer):

    location = LocationSerializer()
    assignee = PersonTicketSerializer(required=False)

    class Meta: 
        model = WorkOrder
        fields = WO_FIELDS


class WorkOrderSerializer(serializers.ModelSerializer):

    class Meta: 
        model = WorkOrder
        fields = WO_FIELDS


class WorkOrderUpdateSerializer(BaseCreateSerializer):

    class Meta: 
        model = WorkOrder
        fields = WO_FIELDS


class WorkOrderCreateSerializer(BaseCreateSerializer):

    scheduled_date = serializers.DateTimeField(validators=[gte_today])

    class Meta:
        model = WorkOrder
        fields = ('id', 'ticket', 'category', 'provider', 'location', 'scheduled_date',
                  'approved_amount', 'cost_estimate', 'requester')

    def create(self, validated_data):
        """
        Auto fill other fields based upon Person, Ticket, etc...
        """
        instance = super(WorkOrderCreateSerializer, self).create(validated_data)
        instance.expiration_date = instance.scheduled_date
        instance.approval_date = instance.scheduled_date
        instance.cost_estimate = instance.category.cost_amount
        instance.approver = instance.requester
        instance.location = instance.ticket.location
        instance.status = WorkOrderStatus.objects.get(name=WorkOrderStatus.NEW)
        instance.priority = WorkOrderPriority.objects.get(
            name__iendswith=instance.ticket.priority.simple_name)
        instance.save()
        return instance


class WorkOrderLeafSerializer(serializers.ModelSerializer):

    approver = PersonTicketSerializer()
    status = WorkOrderStatusSerializer()
    category = CategoryLeafWorkOrderSerializer()
    provider = ProviderDetailSerializer()

    class Meta:
        model = WorkOrder
        fields = ('id', 'cost_estimate_currency', 'cost_estimate', 'scheduled_date',
                  'approval_date', 'completed_date', 'expiration_date', 'tracking_number',
                  'approver', 'gl_code', 'status', 'category', 'provider')
