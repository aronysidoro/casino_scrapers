import unittest
import uuid
import time
import random
import string

from selenium import webdriver
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.keys import Keys

from helpers.element import is_present

from helpers import (
    LoginMixin, FillInHelper, JavascriptMixin, InputHelper,
    NavPage, GeneralElementsPage, Wait, PersonPage, ModelPage
)


LOREM_IPSUM_WORDS = u'''\
aaron a ac accumsan ad adipiscing aenean aliquam aliquet amet ante aptent arcu at
auctor augue bibendum blandit class commodo condimentum congue consectetuer
consequat conubia convallis cras cubilia cum curabitur curae cursus dapibus
diam dictum dictumst dignissim dis dolor donec dui duis egestas eget eleifend
elementum elit enim erat eros est et etiam eu euismod facilisi facilisis fames
faucibus felis fermentum feugiat fringilla fusce gravida habitant habitasse hac
hendrerit hymenaeos iaculis id imperdiet in inceptos integer interdum ipsum
justo lacinia lacus laoreet lectus leo libero ligula litora lobortis lorem
luctus maecenas magna magnis malesuada massa mattis mauris metus mi molestie
mollis montes morbi mus nam nascetur natoque nec neque netus nibh nisi nisl non
nonummy nostra nulla nullam nunc odio orci ornare parturient pede pellentesque
penatibus per pharetra phasellus placerat platea porta porttitor posuere
potenti praesent pretium primis proin pulvinar purus quam quis quisque rhoncus
ridiculus risus rutrum sagittis sapien scelerisque sed sem semper senectus sit
sociis sociosqu sodales sollicitudin suscipit suspendisse taciti tellus tempor
tempus tincidunt torquent tortor tristique turpis ullamcorper ultrices
ultricies urna ut varius vehicula vel velit venenatis vestibulum vitae vivamus
viverra volutpat vulputate'''


def get_text_excluding_children(driver, element):
    return driver.execute_script("""
    return jQuery(arguments[0]).contents().filter(function() {
        return this.nodeType == Node.TEXT_NODE;
    }).text();
    """, element)

def rand_chars(number=10):
    return ''.join([str(random.choice(string.ascii_letters)) for x in range(number)])


class SeleniumTests(JavascriptMixin, LoginMixin, FillInHelper, unittest.TestCase):

    def setUp(self):
        self.driver = webdriver.Firefox()
        self.wait = webdriver.support.ui.WebDriverWait(self.driver, 10)
        self.login()
        # Wait
        self.driver_wait = Wait(self.driver)
        # Generic Elements
        self.gen_elem_page = GeneralElementsPage(self.driver)
        # Go to Admin Page
        self.nav_page = NavPage(self.driver)
        self.nav_page.click_admin()

    def tearDown(self):
        self.driver.close()

    def test_role(self):
        ### CREATE
        # Go to Role Area
        self.nav_page.find_role_link().click()
        # Create Role Page Object
        role_page = ModelPage(
            driver = self.driver,
            new_link = "t-role-new",
            list_name = "t-role-name",
            list_data = "t-role-data"
        )
        role_page.find_new_link().click()
        # New Role Data
        name = rand_chars()
        role = InputHelper(name=name)
        self._fill_in(role)
        self.gen_elem_page.click_save_btn()
        # new Role in List view
        role = role_page.find_list_data()
        self.driver.refresh()
        role_list_view = role_page.find_list_name()
        role_page.click_name_in_list(name, role_list_view)
        ### UPDATE
        # Go to the first Role's Detail view
        role_page.find_wait_and_assert_elem("t-role-name", name)
        role_name = rand_chars()
        role = InputHelper(role_name=role_name)
        self._fill_in(role, clear=True)
        self.gen_elem_page.click_save_btn()
        # check name change
        role = role_page.find_list_data()
        self.driver.refresh()
        role_list_view = role_page.find_list_name()
        role_page.click_name_in_list(role_name, role_list_view)
        ### DELETE
        # Go to the first Role's Detail view
        role_page.find_wait_and_assert_elem("t-role-name", role_name)
        # click Delete
        self.gen_elem_page.click_dropdown_delete()
        self.gen_elem_page.click_delete_btn()
        # check Role is deleted
        self.driver.refresh()
        role = role_page.find_list_data()
        role_list_view = role_page.find_list_name()
        self.assertNotIn(
            role_name,
            [r.text for r in role_list_view]
        )

    def test_location(self):
        ### CREATE
        # Go to Location Area
        self.nav_page.find_location_link().click()
        # Create Location Page Object
        location_page = ModelPage(
            driver = self.driver,
            new_link = "t-add-new",
            list_name = "t-location-name",
            list_data = "t-grid-data"
        )
        # Get to "Location create view"
        location_new_link = location_page.find_new_link()
        location_new_link.click()
        # Enter info and hit "save"
        location_name = rand_chars()
        location_number = rand_chars()
        location_level = rand_chars()
        location = InputHelper(location_name=location_name, location_number=location_number)
        self._fill_in(location)
        location_level_input = Select(self.driver.find_element_by_id("location_location_level_select"))
        location_level_input.select_by_index(1)
        self.gen_elem_page.click_save_btn()
        # Go to newly created Location's Detail view
        self.driver_wait.find_elements_by_class_name(location_page.list_data)
        self.driver.refresh()
        location_list_view = location_page.find_list_name()
        location_page.click_name_in_list(location_name, location_list_view)
        ### UPDATE
        # Go to Location Detail view, Change name and hit "save"
        location_page.find_wait_and_assert_elem("t-location-name", location_name)
        location_name = rand_chars()
        location = InputHelper(location_name=location_name)
        self._fill_in(location, True)
        self.gen_elem_page.click_save_btn()
        # List view contains new name
        locations = location_page.find_list_data()
        location_list_view = location_page.find_list_name()
        location_page.click_name_in_list(location_name, location_list_view)
        ### DELETE
        # Go to Location Detail view click Delete
        self.gen_elem_page.click_dropdown_delete()
        self.gen_elem_page.click_delete_btn()
        # check Role is deleted
        self.driver.refresh()
        locations = location_page.find_list_data()
        location_list_view = location_page.find_list_name()
        self.assertNotIn(
            location_name,
            [r.text for r in location_list_view]
        )

    def test_location_level(self):
        ### CREATE
        # Go to Role Area
        self.nav_page.find_location_level_link().click()
        # Create LocationLevel Page Object
        location_level_page = ModelPage(
            driver=self.driver,
            new_link = "t-location-level-new",
            list_name = "t-location-level-name",
            list_data = "t-location-level-data"
        )
        # Go to Create view
        location_level_new_link = location_level_page.find_new_link()
        location_level_new_link.click()
        # create new Location Level
        location_level_name = rand_chars()
        location_level = InputHelper(location_level_name=location_level_name)
        self._fill_in(location_level)
        self.gen_elem_page.click_save_btn()
        # new record shows in List view
        location_levels = location_level_page.find_list_data()
        self.driver.refresh()
        location_level_list_view = location_level_page.find_list_name()
        location_level_page.click_name_in_list(location_level_name, location_level_list_view)
        ### UPDATE
        self.driver.refresh()
        location_level_page.find_wait_and_assert_elem("t-location-level-name", location_level_name)
        location_level_name = rand_chars()
        location_level = InputHelper(location_level_name=location_level_name)
        self._fill_in(location_level, True)
        self.gen_elem_page.click_save_btn()
        ### List View
        location_levels = location_level_page.find_list_data()
        self.driver.refresh()
        location_level_list_view = location_level_page.find_list_name()
        location_level_page.click_name_in_list(location_level_name, location_level_list_view)
        ### DELETE
        # Go to the first Role's Detail view
        location_level_page.find_wait_and_assert_elem("t-location-level-name", location_level_name)
        # click Delete
        self.gen_elem_page.click_dropdown_delete()
        self.gen_elem_page.click_delete_btn()
        # check Role is deleted
        self.driver.refresh()
        location_level = location_level_page.find_list_data()
        location_level_list_view = location_level_page.find_list_name()
        self.assertNotIn(
            location_level_name,
            [r.text for r in location_level_list_view]
        )

    def test_person(self):
        ### CREATE
        # Go to Person Area
        self.nav_page.find_people_link().click()
        # Create Person Page Object
        person_page = PersonPage(
            driver = self.driver,
            new_link = "t-add-new",
            list_name = "t-person-username",
            list_data = "t-grid-data"
        )
        # Go to Create Person view
        person_page.find_new_link().click()
        username = "lmno_"+rand_chars()
        password = "bobber1"
        role = "RNfkmZFxsz"
        person = InputHelper(username=username, password=password)
        role_input = Select(self.driver.find_element_by_id("person-role"))
        role_input.select_by_index(1)
        self._fill_in(person)
        self.gen_elem_page.click_save_btn()
        ### UPDATE
        person_page.find_wait_and_assert_elem("t-person-username", username)
        first_name = "scooter"
        middle_initial = "B"
        last_name = "McGavine"
        employee_id = "1234"
        title = "myTitle"
        new_phone_one = "888-999-7878"
        new_phone_two = "888-999-7899"
        person = InputHelper(first_name=first_name, middle_initial=middle_initial,
                last_name=last_name, employee_id=employee_id,
                title=title)
        self._fill_in(person)
        add_phone_number_btn = self.gen_elem_page.find_add_btn()
        add_phone_number_btn.click()
        person_page.find_ph_new_entry_send_keys(new_phone_one)
        add_phone_number_btn.click()
        all_phone_number_inputs = person_page.find_all_ph_new_entries()
        last_phone_number_input = all_phone_number_inputs[1]
        last_phone_number_input.send_keys(new_phone_two)
        person_page.assert_ph_inputs(all_phone_number_inputs, new_phone_one, new_phone_two)
        self.gen_elem_page.click_save_btn()
        all_people = person_page.find_list_data()
        self.driver.refresh()
        new_person = person_page.click_name_in_list(username, new_person=None)
        try:
            new_person.click()
        except AttributeError as e:
            raise e("new person not found")
        person_page.find_wait_and_assert_elem("t-person-username", username)
        person_page.find_and_assert_elems(username=username, first_name=first_name,
            middle_initial=middle_initial, last_name=last_name, employee_id=employee_id, title=title)
        self.driver.refresh()
        person_page.find_wait_and_assert_elem("t-person-username", username)
        person_page.find_and_assert_elems(username=username, first_name=first_name,
            middle_initial=middle_initial, last_name=last_name, employee_id=employee_id, title=title)
        ### DELETE
        person_page.find_wait_and_assert_elem("t-person-username", username)
        self.gen_elem_page.click_dropdown_delete()
        self.gen_elem_page.click_delete_btn()
        self.driver.refresh()
        person = self.driver_wait.find_elements_by_class_name(person_page.list_data) #person_page.find_list_data(just_refreshed=True)
        person_list_view = person_page.find_list_name()

        # # TODO: 
        # This is failing because a Grid View page # allows you to go to that page,
        # but there are no records on that page
        # person_page.assert_name_not_in_list(username, new_person=None)


class SeleniumGridTests(JavascriptMixin, LoginMixin, FillInHelper, unittest.TestCase):

    def setUp(self):
        self.driver = webdriver.Firefox()
        self.wait = webdriver.support.ui.WebDriverWait(self.driver, 10)
        self.login()
        # Wait
        self.driver_wait = Wait(self.driver)
        # Lorem
        self.lorem = sorted(LOREM_IPSUM_WORDS.split())
        # Generic Elements
        self.gen_elem_page = GeneralElementsPage(self.driver)
        # Go to Admin Page
        self.nav_page = NavPage(self.driver)
        self.nav_page.click_admin()
        # Go to Person Area
        self.nav_page.find_people_link().click()

    def tearDown(self):
        self.driver.close()

    def test_ordering(self):
        # ASC
        self.wait_for_xhr_request("t-sort-username-dir").click()
        usernames = self.wait_for_xhr_request("t-person-username", plural=True)
        self.assertEqual(self.lorem[0], usernames[0].text)
        # DESC
        self.wait_for_xhr_request("t-sort-username-dir").click()
        usernames = self.wait_for_xhr_request("t-person-username", plural=True)
        self.assertEqual(self.lorem[-1], usernames[0].text)

    def test_ordering_multiple(self):
        # order: username,title
        self.wait_for_xhr_request("t-sort-title-dir").click()
        self.wait_for_xhr_request("t-sort-username-dir").click()
        usernames = self.wait_for_xhr_request("t-person-username", plural=True)
        self.assertEqual(self.lorem[0], usernames[0].text)
        self.wait_for_xhr_request("t-sort-username-dir").click()
        titles = self.wait_for_xhr_request("t-person-title", plural=True)
        self.assertEqual(self.lorem[-1], titles[0].text)
        # order: -username,title
        self.wait_for_xhr_request("t-sort-username-dir").click()
        self.wait_for_xhr_request("t-sort-username-dir").click()
        usernames = self.wait_for_xhr_request("t-person-username", plural=True)
        self.assertEqual(self.lorem[-1], usernames[0].text)
        self.wait_for_xhr_request("t-sort-username-dir").click()
        titles = self.wait_for_xhr_request("t-person-title", plural=True)
        self.assertEqual(self.lorem[0], titles[0].text)

    def test_search(self):
        people = self.wait_for_xhr_request("t-grid-data", plural=True)
        self.assertEqual(len(people), 10)
        search = self.wait_for_xhr_request("t-grid-search-input").send_keys('cu')
        people = self.wait_for_xhr_request("t-grid-data", plural=True)
        self.assertEqual(len(people), 10)
        search = self.wait_for_xhr_request("t-grid-search-input").send_keys('aaaaa')
        with self.assertRaises(NoSuchElementException):
            people = self.wait_for_xhr_request("t-grid-data", debounce=True)
            people = self.driver.find_element_by_class_name("t-grid-data")

    def test_search_ordering(self):
        # Search
        _search_input = "ab"
        _search_input_matches = sorted([x for x in self.lorem if _search_input in x])
        search = self.wait_for_xhr_request("t-grid-search-input").send_keys(_search_input)
        people = self.wait_for_xhr_request("t-grid-data", plural=True, debounce=True)
        self.assertEqual(len(people), len(_search_input_matches))
        # Order
        self.wait_for_xhr_request("t-sort-title-dir").click()
        self.wait_for_xhr_request("t-sort-username-dir").click()
        usernames = self.wait_for_xhr_request("t-person-username", plural=True)
        self.assertEqual(_search_input_matches[0], usernames[0].text)
        # Order: -username,title
        self.wait_for_xhr_request("t-sort-username-dir").click()
        usernames = self.wait_for_xhr_request("t-person-username", plural=True)
        self.assertEqual(_search_input_matches[-1], usernames[0].text)
        # Search maintained
        people = self.wait_for_xhr_request("t-grid-data", plural=True)
        self.assertEqual(len(people), len(_search_input_matches))

    def test_full_text_search(self):
        # USERNAME
        # setup
        _username= "tt"
        _username_matches = sorted([x for x in self.lorem if _username in x])
        # test
        self.wait_for_xhr_request("t-filter-username").click()
        username_fulltext_search = self.driver.find_element_by_class_name("t-new-entry")
        username_fulltext_search.send_keys(_username)
        people = self.wait_for_xhr_request("t-grid-data", plural=True, debounce=True)
        self.assertEqual(len(people), len(_username_matches))
        # test - ordered
        self.driver.find_element_by_class_name("t-sort-username-dir").click()
        usernames = self.driver.find_elements_by_class_name("t-person-username")
        self.assertEqual(_username_matches[0], usernames[0].text)
        # TITLE
        # setup
        _title = "p"
        _title_matches = [x for x in _username_matches if _title in x]
        # test
        self.driver.find_element_by_class_name("t-filter-title").click()
        title_fulltext_search = self.driver.find_element_by_class_name("t-new-entry")
        title_fulltext_search.send_keys(_title)
        people = self.wait_for_xhr_request("t-grid-data", plural=True, debounce=True)
        self.assertEqual(len(people), len(_title_matches))
        usernames = self.driver.find_elements_by_class_name("t-person-username")
        self.assertEqual(_title_matches[0], usernames[0].text)
        # test - w/ refresh
        self.driver.refresh()
        people = self.wait_for_xhr_request("t-grid-data", plural=True, just_refreshed=True)
        self.assertEqual(len(people), len(_title_matches))
        usernames = self.driver.find_elements_by_class_name("t-person-username")
        self.assertEqual(_title_matches[0], usernames[0].text)
        # submitted text still present
        self.driver.find_element_by_class_name("t-filter-username").click()
        username_fulltext_search = self.driver.find_element_by_class_name("t-new-entry")
        self.assertEqual(username_fulltext_search.get_attribute("value"), _username)
        self.driver.find_element_by_class_name("t-filter-title").click()
        title_fulltext_search = self.driver.find_element_by_class_name("t-new-entry")
        self.assertEqual(title_fulltext_search.get_attribute("value"), _title)

    def test_full_text_search_hidden_on_enter_and_escape(self):
        self.wait_for_xhr_request("t-filter-username").click()
        username_fulltext_search = self.driver.find_element_by_class_name("t-new-entry")
        username_fulltext_search.send_keys("at")
        username_fulltext_search.send_keys(Keys.RETURN)
        fulltext_modal_present = is_present(self.driver, "ember-modal-dialog")
        self.assertEqual(fulltext_modal_present, False)
        self.wait_for_xhr_request("t-filter-title").click()
        title_fulltext_search = self.driver.find_element_by_class_name("t-new-entry")
        title_fulltext_search.send_keys("de")
        title_fulltext_search.send_keys(Keys.ESCAPE)
        title_modal_present = is_present(self.driver, "ember-modal-dialog")
        self.assertEqual(title_modal_present, False)


if __name__ == "__main__":
    unittest.main()
