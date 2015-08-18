from category.models import Category
from util.serializers import BaseCreateSerializer


### CATEGORY

CATEGORY_FIELDS = ('id', 'name', 'description', 'label',
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


class CategoryDetailSerializer(BaseCreateSerializer):

    parent = CategoryIDNameSerializer(read_only=True)
    children = CategoryIDNameSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = CATEGORY_FIELDS + ('subcategory_label', 'parent', 'children',)


# class CategoryCreateSerializer(BaseCreateSerializer):

#     class Meta:
#         model = Category
#         fields = CATEGORY_FIELDS + ('subcategory_label', 'parent',)


class CategorySerializer(BaseCreateSerializer):

    class Meta:
        model = Category
        fields = CATEGORY_FIELDS + ('subcategory_label', 'parent', 'children',)