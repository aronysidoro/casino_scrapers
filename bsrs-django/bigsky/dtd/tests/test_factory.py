from django.test import TestCase

from model_mommy import mommy

from category.models import Category
from category.tests.factory import create_single_category
from dtd.models import TreeField, TreeOption, TreeData, TreeLink
from dtd.tests import factory
from ticket.models import TicketStatus, TicketPriority


class FactoryTests(TestCase):

    def test_create_tree_link(self):
        tree_link = factory.create_tree_link()

        self.assertIsInstance(tree_link, TreeLink)
        self.assertIsInstance(tree_link.status, TicketStatus)
        self.assertIsInstance(tree_link.priority, TicketPriority)
        self.assertEqual(tree_link.categories.count(), 1)
        self.assertIsInstance(tree_link.categories.first(), Category)
        # TreeData relationships
        self.assertIsNone(tree_link.destination)
        self.assertIsInstance(tree_link.dtd, TreeData)

    def test_create_tree_link__with_destination(self):
        destination = mommy.make(TreeData)

        tree_link = factory.create_tree_link(destination)

        self.assertIsInstance(tree_link, TreeLink)
        self.assertEqual(tree_link.destination, destination)

    def test_create_tree_link__existing(self):
        create_single_category()
        init_count = Category.objects.count()

        tree_link = factory.create_tree_link()

        self.assertEqual(Category.objects.count(), init_count)
        self.assertEqual(tree_link.categories.count(), 1)

    def test_create_tree_field(self):
        tree_field = factory.create_tree_field(3)

        self.assertIsInstance(tree_field, TreeField)
        self.assertEqual(tree_field.options.count(), 3)
        self.assertIsInstance(tree_field.options.first(), TreeOption)

    def test_create_tree_data_key(self):
        key = "foo"
        tree_data = factory.create_tree_data(key=key)

        self.assertIsInstance(tree_data, TreeData)
        self.assertEqual(tree_data.key, key)
        # Fields
        self.assertEqual(tree_data.fields.count(), 1)
        self.assertIsInstance(tree_data.fields.first(), TreeField)
        # Links
        self.assertEqual(tree_data.links.count(), 1)
        self.assertIsInstance(tree_data.links.first(), TreeLink)

    def test_create_tree_data__links(self):
        links = 2
        key = 'foo'

        tree_data = factory.create_tree_data(links, key=key)

        self.assertEqual(tree_data.links.count(), links)
        self.assertEqual(tree_data.key, key)
        self.assertIsInstance(tree_data.links.first(), TreeLink)

    def test_create_tree_data__links_and_destination(self):
        destination = mommy.make(TreeData)

        tree_data = factory.create_tree_data(destination=destination)

        self.assertEqual(tree_data.links.count(), 1)
        self.assertEqual(tree_data.links.first().destination, destination)

    def test_create_multi_node_tree(self):
        factory.create_multi_node_tree()

        one = TreeData.objects.get(key="one")
        two = TreeData.objects.get(key="two")
        three = TreeData.objects.get(key="three")

        # one
        self.assertEqual(one.links.count(), 1)
        self.assertEqual(one.links.first().destination, two)
        # two
        self.assertEqual(two.links.count(), 1)
        self.assertEqual(two.links.first().destination, three)
        # three
        self.assertEqual(three.links.count(), 1)
        self.assertIsNone(three.links.first().destination)


class FixtureGenerationTests(TestCase):

    def test_dtd_clear_all(self):
        mommy.make(TreeData)
        mommy.make(TreeLink)
        mommy.make(TreeField)
        mommy.make(TreeOption)
        self.assertTrue(TreeData.objects_all.count() > 0)
        self.assertTrue(TreeLink.objects_all.count() > 0)
        self.assertTrue(TreeField.objects_all.count() > 0)
        self.assertTrue(TreeOption.objects_all.count() > 0)

        factory.dtd_clear_all()

        self.assertTrue(TreeData.objects_all.count() == 0)
        self.assertTrue(TreeLink.objects_all.count() == 0)
        self.assertTrue(TreeField.objects_all.count() == 0)
        self.assertTrue(TreeOption.objects_all.count() == 0)

    def test_create_dtd_fixtures_only(self):
        factory.create_dtd_fixtures_only()

        self.assertEqual(TreeData.objects.count(), 23)
        for x in TreeData.objects.all():
            self.assertEqual(TreeData.objects.filter(note=x.note).count(), 1)

    def test_create_link_fixtures_only(self):
        factory.create_link_fixtures_only()

        self.assertEqual(TreeLink.objects.count(), 23)
        for x in TreeLink.objects.all():
            self.assertEqual(TreeLink.objects.filter(order=x.order).count(), 1)

    # join_dtds_and_links

    def test_join_dtds_and_links__initial_counts(self):
        factory.create_dtd_fixtures_only()
        factory.create_link_fixtures_only()

        factory.join_dtds_and_links()

        self.assertEqual(TreeData.objects.count(), 23)
        self.assertEqual(TreeLink.objects.count(), 23)

    def test_join_dtds_and_links__tree_link_join_counts(self):
        factory.create_dtd_fixtures_only()
        factory.create_link_fixtures_only()

        factory.join_dtds_and_links()

        start = TreeData.objects.get(note=str(0))
        self.assertEqual(start.links.count(), 2)

        appliances = TreeData.objects.get(note=str(2))
        self.assertEqual(appliances.links.count(), 3)

        parking_lot = TreeData.objects.get(note=str(13))
        self.assertEqual(parking_lot.links.count(), 3)

        plumbing = TreeData.objects.get(note=str(17))
        self.assertEqual(plumbing.links.count(), 5)

    def test_join_dtds_and_links__destination(self):
        factory.create_dtd_fixtures_only()
        factory.create_link_fixtures_only()

        factory.join_dtds_and_links()

        for link in TreeLink.objects.all():
            self.assertIsInstance(link.destination, TreeData)
            if link.dtd:
                self.assertNotEqual(link.dtd.id, link.destination.id)

    # create_dtd_fixture_data

    def test_create_dtd_fixture_data(self):
        factory.create_dtd_fixture_data()

        self.assertEqual(TreeData.objects.count(), 23)
        self.assertEqual(TreeLink.objects.count(), 23)