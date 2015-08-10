import unittest
import uuid 

from selenium import webdriver
from selenium.webdriver.support.ui import Select

from login import LoginMixin
from javascript import JavascriptMixin


def get_text_excluding_children(driver, element):
    return driver.execute_script("""
    return jQuery(arguments[0]).contents().filter(function() {
        return this.nodeType == Node.TEXT_NODE;
    }).text();
    """, element)


class LoginTests(unittest.TestCase, LoginMixin, JavascriptMixin):

    def setUp(self):
        self.driver = webdriver.Firefox()
        self.wait = webdriver.support.ui.WebDriverWait(self.driver, 10)

    def tearDown(self):
        self.driver.close()

    def test_login_page_rendered_with_inputs(self):
        self.login()

        current_user = self.driver.find_element_by_class_name("current-user")
        assert current_user.is_displayed()

    def test_navigate_to_location_list_and_create_new_location_record(self):
        self.login()
        self.driver.find_element_by_class_name("t-nav-admin").click()
        nav_admin_location = self.wait_for_xhr_request("t-nav-admin-location")
        nav_admin_location.click()
        new_location = self.wait_for_xhr_request("t-location-new")
        new_location.click()
        new_location_name = "ABC STORE" 
        new_location_number = "1234" 
        new_location_level = str(uuid.uuid4())[0:29]
        location_name_input = self.driver.find_element_by_id("location_name")
        location_number_input = self.driver.find_element_by_id("location_number")
        location_level_input = Select(self.driver.find_element_by_id("location_location_level_select"))
        location_name_input.send_keys(new_location_name) 
        location_number_input.send_keys(new_location_number) 
        location_level_input.select_by_index(0)
        self.driver.find_element_by_class_name("t-save-btn").click()
        all_locations = self.wait_for_xhr_request("t-location-data", plural=True)
        new_location = all_locations[len(all_locations) - 1]
        new_location.click()
        location_name_input = self.wait_for_xhr_request("t-location-name")
        location_number_input = self.wait_for_xhr_request("t-location-number")
        location_level_input = self.wait_for_xhr_request("t-location-level")
        assert location_name_input.get_attribute("value") == new_location_name
        assert location_number_input.get_attribute("value") == new_location_number
        # updated_location_name = "DEF STORE"
        # updated_location_number = "5678" 
        # self.driver.find_element_by_id("location_name").clear()
        # self.driver.find_element_by_id("location_number").clear()
        # location_name_input = self.driver.find_element_by_id("location_name")
        # location_name_input.send_keys(updated_location_name) 
        # location_number_input = self.driver.find_element_by_id("location_number")
        # location_number_input.send_keys(updated_location_number) 
        # self.driver.find_element_by_class_name("t-save-btn").click()
        # all_locations = self.wait_for_xhr_request("t-location-data", plural=True)
        # new_location = all_locations[len(all_locations) - 1]
        # new_location.click()
        # updated_name_input = self.wait_for_xhr_request("t-location-name")
        # updated_number_input = self.wait_for_xhr_request("t-location-number")
        # assert updated_name_input.get_attribute("value") == updated_location_name
        # assert updated_number_input.get_attribute("value") == updated_location_number

    def test_navigate_to_role_list_and_create_new_role_record(self):
        self.login()
        self.driver.find_element_by_class_name("t-nav-admin").click()
        nav_admin_role = self.wait_for_xhr_request("t-nav-admin-role")
        nav_admin_role.click()
        new_role = self.wait_for_xhr_request("t-role-new")
        new_role.click()
        new_name = str(uuid.uuid4())[0:29]
        name_input = self.driver.find_element_by_id("name")
        role_type_input = Select(self.driver.find_element_by_id("role_type_select"))
        location_level_input = Select(self.driver.find_element_by_id("location_level_select"))
        name_input.send_keys(new_name) 
        role_type_input.select_by_index(0)
        location_level_input.select_by_index(0)
        self.driver.find_element_by_class_name("t-save-btn").click()
        all_roles = self.wait_for_xhr_request("t-role-data", plural=True)
        new_role = all_roles[len(all_roles) - 1]
        new_role.click()
        name_input = self.wait_for_xhr_request("t-role-name")
        assert name_input.get_attribute("value") == new_name
        updated_name = str(uuid.uuid4())[0:29]
        self.driver.find_element_by_id("name").clear()
        name_input = self.driver.find_element_by_id("name")
        name_input.send_keys(updated_name) 
        self.driver.find_element_by_class_name("t-save-btn").click()
        all_roles = self.wait_for_xhr_request("t-role-data", plural=True)
        updated_role = all_roles[len(all_roles) - 1]
        updated_role.click()
        updated_name_input = self.wait_for_xhr_request("t-role-name")
        assert updated_name_input.get_attribute("value") == updated_name

    def test_navigate_to_location_list_and_create_new_location_level_record(self):
        self.login()
        self.driver.find_element_by_class_name("t-nav-admin").click()
        nav_admin_locationOrg = self.wait_for_xhr_request("t-nav-admin-locationOrg")
        nav_admin_locationOrg.click()
        new_location = self.wait_for_xhr_request("t-location-level-new")
        new_location.click()
        new_name = str(uuid.uuid4())[0:29]
        name_input = self.driver.find_element_by_id("location_level_name")
        name_input.send_keys(new_name) 
        self.driver.find_element_by_class_name("t-save-btn").click()
        all_locations = self.wait_for_xhr_request("t-location-level-data", plural=True)
        new_location = all_locations[len(all_locations) - 1]
        new_location.click()
        name_input = self.wait_for_xhr_request("t-location-level-name")
        assert name_input.get_attribute("value") == new_name
        updated_name = str(uuid.uuid4())[0:29]
        self.driver.find_element_by_id("location_level_name").clear()
        name_input = self.driver.find_element_by_id("location_level_name")
        name_input.send_keys(updated_name) 
        self.driver.find_element_by_class_name("t-save-btn").click()
        all_locations = self.wait_for_xhr_request("t-location-level-data", plural=True)
        new_location = all_locations[len(all_locations) - 1]
        new_location.click()
        name_input = self.wait_for_xhr_request("t-location-level-name")
        assert name_input.get_attribute("value") == updated_name

    def test_navigate_to_people_list_and_create_new_person_record(self):
        self.login()
        self.driver.find_element_by_class_name("t-nav-admin").click()
        nav_admin_people = self.wait_for_xhr_request("t-nav-admin-people")
        nav_admin_people.click()
        first_person = self.wait_for_xhr_request("t-person-new")
        first_person.click()
        username_input = self.driver.find_element_by_id("username")
        password_input = self.driver.find_element_by_id("password")
        new_username = str(uuid.uuid4())[0:29]
        new_first_name = "scooter"
        new_middle_initial = "B"
        new_last_name = "McGavine"
        new_emp_number = "1234"
        new_title = "myTitle"
        new_phone_one = "888-999-7878"
        new_phone_two = "888-999-7899"
        username_input.send_keys(new_username)
        password_input.send_keys("bobber1")
        self.driver.find_element_by_class_name("t-save-btn").click()
        username_input = self.wait_for_xhr_request("t-person-username")
        assert username_input.get_attribute("value") == new_username
        first_name_input = self.driver.find_element_by_id("first_name")
        middle_initial_input = self.driver.find_element_by_id("middle_initial")
        last_name_input = self.driver.find_element_by_id("last_name")
        emp_number_input = self.driver.find_element_by_id("employee_id")
        title_input = self.driver.find_element_by_id("title")
        first_name_input.send_keys(new_first_name)
        middle_initial_input.send_keys(new_middle_initial)
        last_name_input.send_keys(new_last_name)
        emp_number_input.send_keys(new_emp_number)
        title_input.send_keys(new_title)
        add_phone_number_btn = self.driver.find_element_by_class_name("t-add-btn")
        add_phone_number_btn.click()
        first_phone_number_input = self.driver.find_element_by_class_name("t-new-entry")
        first_phone_number_input.send_keys(new_phone_one)
        add_phone_number_btn.click()
        all_phone_number_inputs = self.driver.find_elements_by_class_name("t-new-entry")
        last_phone_number_input = all_phone_number_inputs[1]
        last_phone_number_input.send_keys(new_phone_two)
        assert len(all_phone_number_inputs) == 2
        assert all_phone_number_inputs[0].get_attribute("value") == new_phone_one 
        assert all_phone_number_inputs[1].get_attribute("value") == new_phone_two 
        self.driver.find_element_by_class_name("t-save-btn").click()
        all_people = self.wait_for_xhr_request("t-person-data", plural=True)
        new_person = all_people[len(all_people) - 1]
        new_person.click()
        username_input = self.wait_for_xhr_request("t-person-username")
        first_name_input = self.driver.find_element_by_id("first_name")
        middle_initial_input = self.driver.find_element_by_id("middle_initial")
        last_name_input = self.driver.find_element_by_id("last_name")
        emp_number_input = self.driver.find_element_by_id("employee_id")
        title_input = self.driver.find_element_by_id("title")
        assert username_input.get_attribute("value") == new_username
        assert first_name_input.get_attribute("value") == new_first_name
        assert middle_initial_input.get_attribute("value") == new_middle_initial
        assert last_name_input.get_attribute("value") == new_last_name
        assert emp_number_input.get_attribute("value") == new_emp_number
        assert title_input.get_attribute("value") == new_title

if __name__ == "__main__":
    unittest.main()
