from rest_framework import serializers

from category.models import CategoryType, Category
from util.serializers import BaseCreateSerializer


### CATEGORY TYPE

class CategoryTypeSerializer(BaseCreateSerializer):

    class Meta:
        model = CategoryType
        fields = ('id', 'name', 'parent', 'child',)


### CATEGORY

CATEGORY_FIELDS = ('id', 'name', 'description', 'type',
    'cost_amount', 'cost_currency', 'cost_code',)


class CategoryIDNameSerializer(BaseCreateSerializer):
    '''
    Leaf Node Serializer, no public API Endpoint
    '''
    class Meta:
        model = Category
        fields = ('id', 'name',)


class CategoryListSerializer(BaseCreateSerializer):

    class Meta:
        model = Category
        fields = CATEGORY_FIELDS


class CategorySerializer(BaseCreateSerializer):

    subcategories = CategoryIDNameSerializer

    class Meta:
        model = Category
        fields = CATEGORY_FIELDS + ('parent', 'subcategories',)