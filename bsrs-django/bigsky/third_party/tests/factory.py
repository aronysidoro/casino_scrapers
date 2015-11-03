from model_mommy import mommy

from category.models import Category
from category.tests.factory import create_categories
from contact.models import PhoneNumber, Email, Address
from contact.tests.factory import create_contact
from third_party.models import ThirdParty
from utils import create


def create_third_party(number=1):
    # related objects
    create_categories()
    categories = Category.objects.all()[:2]

    # third party
    for i in range(number):
        name = create._generate_chars()
        number = create._generate_ph()

        third_party = mommy.make(ThirdParty, name=name, number=number,
            categories=categories)

        for contact in [PhoneNumber, Email, Address]:
            create_contact(contact, third_party)

    return third_party
