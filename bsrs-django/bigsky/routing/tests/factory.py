from model_mommy import mommy

from category.models import Category
from location.tests.factory import create_top_level_location
from person.tests.factory import create_single_person
from routing.models import Assignment, ProfileFilter, AvailableFilter
from tenant.tests.factory import get_or_create_tenant
from ticket.models import TicketPriority
from utils.create import random_lorem
from utils.helpers import create_default


REPAIR = 'Repair'

# AvailableFilters

def create_available_filter_priority():
    try:
        return AvailableFilter.objects.get(key='admin.placeholder.ticket_priority')
    except AvailableFilter.DoesNotExist:
        return AvailableFilter.objects.create(key='admin.placeholder.ticket_priority',
                                              field='priority')


def create_available_filter_categories():
    try:
        return AvailableFilter.objects.get(key='admin.placeholder.category_filter')
    except AvailableFilter.DoesNotExist:
        return AvailableFilter.objects.create(key='admin.placeholder.category_filter',
                                              field='categories')


def create_available_filter_location():
    try:
        return AvailableFilter.objects.filter(lookups__filters='location_level')[0]
    except IndexError:
        return AvailableFilter.objects.create(key_is_i18n=False, field='location',
                                              lookups={'filters': 'location_level'})


def create_available_filters():
    create_available_filter_priority()
    create_available_filter_categories()
    create_available_filter_location()


# ProfileFilters

def create_ticket_priority_filter():
    priority = create_default(TicketPriority)
    source = create_available_filter_priority()
    return ProfileFilter.objects.create(source=source, criteria=[str(priority.id)])


def create_ticket_categories_filter():
    try:
        category = Category.objects.get(name=REPAIR)
    except Category.DoesNotExist:
        category = mommy.make(Category, name=REPAIR)

    source = create_available_filter_categories()
    return ProfileFilter.objects.create(source=source, criteria=[str(category.id)])


def create_ticket_location_filter():
    location = create_top_level_location()
    source = create_available_filter_location()
    return ProfileFilter.objects.create(source=source, criteria=[str(location.id)],
                                        lookups={'filters': 'location_level'})


# Assignments

def create_assignment(description=None, tenant=None):
    kwargs = {
        'description': description or random_lorem(1),
        'tenant': tenant or get_or_create_tenant()
    }

    try:
        assignment = Assignment.objects.get(**kwargs)
    except Assignment.DoesNotExist:
        kwargs['assignee'] = create_single_person()
        assignment = Assignment.objects.create(**kwargs)

        priority_filter = create_ticket_priority_filter()
        category_filter = create_ticket_categories_filter()
        assignment.filters.add(priority_filter, category_filter)

    return assignment


def create_assignments():
    for i in range(10):
        create_assignment()
