from rest_framework import serializers

from category.models import Category
from utils.serializers import BaseCreateSerializer


### CATEGORY

CATEGORY_FIELDS = ('id', 'name', 'description', 'label',
    'cost_amount', 'cost_currency', 'cost_code',)


# Leaf Node

class CategoryIDNameSerializer(BaseCreateSerializer):

    class Meta:
        model = Category
        fields = ('id', 'name', 'parent', 'children', 'level',)

    def to_representation(self, obj):
        data = super(CategoryIDNameSerializer, self).to_representation(obj)
        data['children_fks'] = data.pop('children', [])
        return data


class CategoryFlatSerializer(BaseCreateSerializer):

    class Meta:
        model = Category
        fields = ('id', 'name', 'parent', 'children',)


class CategoryRoleSerializer(BaseCreateSerializer):

    class Meta:
        model = Category
        fields = ('id', 'name', 'status', 'parent',)


class CategoryParentSerializer(BaseCreateSerializer):

    parent = CategoryIDNameSerializer(read_only=True)
    children = CategoryIDNameSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = CATEGORY_FIELDS + ('parent', 'children',)


# Main

class CategoryListSerializer(BaseCreateSerializer):

    class Meta:
        model = Category
        fields = CATEGORY_FIELDS + ('level',)


class CategoryDetailSerializer(BaseCreateSerializer):

    parent = CategoryIDNameSerializer(read_only=True)
    children = CategoryIDNameSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = CATEGORY_FIELDS + ('level', 'subcategory_label', 'parent', 'children',)

    @staticmethod
    def eager_load(queryset):
        return (queryset.select_related('parent')
                        .prefetch_related('children__children'))


class CategorySerializer(BaseCreateSerializer):

    children = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), many=True, required=False)

    class Meta:
        model = Category
        fields = CATEGORY_FIELDS + ('subcategory_label', 'parent', 'children',)
