import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import random from 'bsrs-ember/models/random';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import ROLE_FIXTURES from 'bsrs-ember/vendor/role_fixtures';
import ROLE_DEFAULTS from 'bsrs-ember/vendor/defaults/role';
import LOCATION_LEVEL_FIXTURES from 'bsrs-ember/vendor/location_level_fixtures';
import LOCATION_LEVEL_DEFAULTS from 'bsrs-ember/vendor/defaults/location-level';
import CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/category';
import CATEGORY_FIXTURES from 'bsrs-ember/vendor/category_fixtures';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_roles_url;
const ROLE_URL = BASE_URL + '/index';
const DETAIL_URL = BASE_URL + '/' + ROLE_DEFAULTS.idOne;
const SUBMIT_BTN = '.submit_btn';
const SAVE_BTN = '.t-save-btn';
const LETTER_A = {keyCode: 65};
const LETTER_S = {keyCode: 83};
const LETTER_R = {keyCode: 82};
const SPACEBAR = {keyCode: 32};

let application, store, list_xhr, endpoint, detail_data;

module('Acceptance | role-detail', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        endpoint = PREFIX + BASE_URL + '/';
        detail_data = ROLE_FIXTURES.detail(ROLE_DEFAULTS.idOne);
        list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, ROLE_FIXTURES.list());
        xhr(endpoint + ROLE_DEFAULTS.idOne + '/', 'GET', null, {}, 200, detail_data);
        random.uuid = function() { return Ember.uuid(); };
    },
    afterEach() {
        random.uuid = function() { return 'abc123'; };
        Ember.run(application, 'destroy');
    }
});

test('clicking a role name will redirect to the given detail view', (assert) => {
    visit(ROLE_URL);
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
    });
    click('.t-grid-data:eq(7)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
    });
});

test('when you deep link to the role detail view you get bound attrs', (assert) => {
    clearxhr(list_xhr);
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let role = store.find('role').objectAt(0);  
        assert.ok(role.get('isNotDirty'));
        assert.equal(role.get('location_level').get('id'), LOCATION_LEVEL_DEFAULTS.idOne);
        assert.equal(find('.t-role-name').val(), ROLE_DEFAULTS.nameOne);
        assert.equal(find('.t-role-role-type').val(), ROLE_DEFAULTS.roleTypeGeneral);
        // assert.equal(find('.t-role-category:eq(0)').val(), CATEGORY_DEFAULTS.name);
        assert.equal(find('.t-location-level').val(), LOCATION_LEVEL_DEFAULTS.idOne);
    });
    let url = PREFIX + DETAIL_URL + '/';
    let response = ROLE_FIXTURES.detail(ROLE_DEFAULTS.idOne);
    // let categories = CATEGORY_FIXTURES.put({id: CATEGORY_DEFAULTS.id, name: CATEGORY_DEFAULTS.name});
    let location_level = LOCATION_LEVEL_FIXTURES.put({id: LOCATION_LEVEL_DEFAULTS.idTwo, name: LOCATION_LEVEL_DEFAULTS.nameRegion});
    let payload = ROLE_FIXTURES.put({id: ROLE_DEFAULTS.idOne, name: ROLE_DEFAULTS.namePut, role_type: ROLE_DEFAULTS.roleTypeContractor, location_level: location_level.id, categories: [CATEGORY_DEFAULTS.idOne]});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    fillIn('.t-role-name', ROLE_DEFAULTS.namePut);
    fillIn('.t-role-role-type', ROLE_DEFAULTS.roleTypeContractor);
    fillIn('.t-location-level', ROLE_DEFAULTS.locationLevelTwo);
    andThen(() => {
        let role = store.find('role').objectAt(0);  
        assert.ok(role.get('isDirty'));
    });
    let list = ROLE_FIXTURES.list();
    list.results[0].name = ROLE_DEFAULTS.namePut;
    list.results[0].role_type = ROLE_DEFAULTS.roleTypeContractor;
    list.results[0].location_level = ROLE_DEFAULTS.locationLevelTwo;
    xhr(endpoint + '?page=1', 'GET', null, {}, 200, list);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
        let role = store.find('role').objectAt(0);  
        assert.ok(role.get('isNotDirty'));
    });
});

test('when you change a related location level it will be persisted correctly', (assert) => {
    visit(DETAIL_URL);
    let url = PREFIX + DETAIL_URL + "/";
    let location_level = LOCATION_LEVEL_FIXTURES.put({id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameRegion});
    let payload = ROLE_FIXTURES.put({id: ROLE_DEFAULTS.idOne, location_level: location_level.id});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
    });
});

test('clicking cancel button will take from detail view to list view', (assert) => {
    visit(ROLE_URL);
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
    });
    click('.t-grid-data:eq(7)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
    });
    click('.t-cancel-btn');
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
    });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and they cancel', (assert) => {
    clearxhr(list_xhr);
    visit(DETAIL_URL);
    fillIn('.t-role-name', ROLE_DEFAULTS.namePut);
    click('.t-cancel-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL);
            assert.equal(find('.t-modal').is(':visible'), true);
            assert.equal(find('.t-modal-body').text().trim(), 'You have unsaved changes. Are you sure?');
        });
    });
    click('.t-modal-footer .t-modal-cancel-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL);
            assert.equal(find('.t-role-name').val(), ROLE_DEFAULTS.namePut);
            assert.equal(find('.t-modal').is(':hidden'), true);
        });
    });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', (assert) => {
    visit(DETAIL_URL);
    fillIn('.t-role-name', ROLE_DEFAULTS.nameTwo);
    fillIn('.t-location-level', LOCATION_LEVEL_DEFAULTS.idDistrict);
    click('.t-cancel-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL);
            assert.equal(find('.t-modal').is(':visible'), true);
        });
    });
    click('.t-modal-footer .t-modal-rollback-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), ROLE_URL);
            let role = store.find('role', ROLE_DEFAULTS.idOne);
            assert.equal(role.get('name'), ROLE_DEFAULTS.nameOne);
        });
    });
});

test('when click delete, role is deleted and removed from store', (assert) => {
    visit(DETAIL_URL);
    xhr(PREFIX + BASE_URL + '/' + ROLE_DEFAULTS.idOne + '/', 'DELETE', null, {}, 204, {});
    click('.t-delete-btn');
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
        assert.equal(store.find('role', ROLE_DEFAULTS.idOne).get('length'), undefined);
    });
});

test('clicking and typing into selectize for categories will fire off xhr request for all categories', (assert) => {
    visit(DETAIL_URL);
    andThen(() => {
        let role = store.find('role', ROLE_DEFAULTS.idOne);
        assert.equal(role.get('role_category_fks').length, 1);
        assert.equal(find('div.item').length, 1);
        assert.equal(find('div.option').length, 0);
    });
    let category_children_endpoint = PREFIX + '/admin/categories/?name__icontains=a';
    xhr(category_children_endpoint, 'GET', null, {}, 200, CATEGORY_FIXTURES.list());
    fillIn('.selectize-input input', 'a');
    triggerEvent('.selectize-input input', 'keyup', LETTER_A);
    click('.t-role-category-select div.option:eq(0)');
    andThen(() => {
        let role = store.find('role', ROLE_DEFAULTS.idOne);
        assert.equal(role.get('role_category_fks').length, 1);
        assert.equal(role.get('categories').get('length'), 2);
        assert.ok(role.get('isDirtyOrRelatedDirty'));
        assert.equal(find('div.item').length, 2);
        assert.equal(find('div.option').length, 8);
    });
    let url = PREFIX + DETAIL_URL + "/";
    let category = CATEGORY_FIXTURES.put({id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameOne});
    let payload = ROLE_FIXTURES.put({id: ROLE_DEFAULTS.idOne, location_level: LOCATION_LEVEL_DEFAULTS.idOne, categories: [category.id, CATEGORY_DEFAULTS.idTwo]});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
    });
});

test('can remove and add back same category', (assert) => {
    visit(DETAIL_URL);
    click('div.item > a.remove:eq(0)');
    andThen(() => {
        let role = store.find('role', ROLE_DEFAULTS.idOne);
        assert.equal(role.get('role_category_fks').length, 1);
        assert.equal(role.get('categories').get('length'), 0);
        assert.equal(find('div.item').length, 0);
        assert.equal(find('div.option').length, 0);
    });
    let category_endpoint = PREFIX + '/admin/categories/?name__icontains=repair';
    xhr(category_endpoint, 'GET', null, {}, 200, CATEGORY_FIXTURES.list());
    fillIn('.selectize-input input', 'repair');
    triggerEvent('.selectize-input input', 'keyup', LETTER_R);
    click('.t-role-category-select div.option:eq(0)');
    andThen(() => {
        let role = store.find('role', ROLE_DEFAULTS.idOne);
        assert.equal(role.get('role_category_fks').length, 1);
        let join_model_id = role.get('role_category_fks')[0];
        let join_model = store.find('role-category', join_model_id);
        assert.equal(join_model.get('removed'), true);
        //TODO: figure out why categories is 2. Simple store has a duplicate. Digging into the push method in store.js doesn't reveal anything either
        // assert.equal(role.get('categories').get('length'), 1);
        assert.ok(role.get('isDirtyOrRelatedDirty'));
        assert.equal(find('div.item').length, 1);
        assert.equal(find('div.option').length, 9);
    });
    let url = PREFIX + DETAIL_URL + "/";
    let payload = ROLE_FIXTURES.put({id: ROLE_DEFAULTS.idOne, categories: [CATEGORY_DEFAULTS.idOne]});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
    });
});

test('removing a category in selectize for categories will save correctly and cleanup role_category_fks', (assert) => {
    visit(DETAIL_URL);
    andThen(() => {
        let role = store.find('role', ROLE_DEFAULTS.idOne);
        assert.equal(role.get('role_category_fks').length, 1);
        assert.equal(role.get('categories').get('length'), 1);
        assert.equal(find('div.item').length, 1);
        assert.equal(find('div.option').length, 0);
    });
    click('div.item > a.remove:eq(0)');
    andThen(() => {
        let role = store.find('role', ROLE_DEFAULTS.idOne);
        assert.equal(role.get('role_category_fks').length, 1);
        assert.equal(role.get('categories').get('length'), 0);
        assert.ok(role.get('isDirtyOrRelatedDirty'));
        assert.equal(find('div.item').length, 0);
        assert.equal(find('div.option').length, 0);
    });
    let url = PREFIX + DETAIL_URL + "/";
    let payload = ROLE_FIXTURES.put({id: ROLE_DEFAULTS.idOne, location_level: LOCATION_LEVEL_DEFAULTS.idOne, categories: []});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
    });
});

test('starting with multiple categories, can remove all categories (while not populating options) and add back', (assert) => {
    detail_data.categories = [...detail_data.categories, CATEGORY_FIXTURES.get(CATEGORY_DEFAULTS.idTwo)];
    detail_data.categories[1].name = CATEGORY_DEFAULTS.nameOne + 'i';
    visit(DETAIL_URL);
    andThen(() => {
        let role = store.find('role', ROLE_DEFAULTS.idOne);
        assert.equal(role.get('categories').get('length'), 2);
        assert.equal(find('div.item').length, 2);
        assert.equal(find('div.option').length, 0);
    });
    let category_endpoint = PREFIX + '/admin/categories/?name__icontains=a';
    xhr(category_endpoint, 'GET', null, {}, 200, CATEGORY_FIXTURES.list());
    click('div.item > a.remove:eq(0)');
    click('div.item > a.remove:eq(0)');
    andThen(() => {
        assert.equal(find('div.option').length, 0);
    });
    fillIn('.selectize-input input', 'a');
    triggerEvent('.selectize-input input', 'keyup', LETTER_A);
    click('.t-role-category-select div.option:eq(0)');
    andThen(() => {
        let role = store.find('role', ROLE_DEFAULTS.idOne);
        assert.equal(role.get('role_category_fks').length, 2);
        // assert.equal(role.get('categories').get('length'), 1);
        assert.ok(role.get('isDirtyOrRelatedDirty'));
        assert.equal(find('div.item').length, 1);
        assert.equal(find('div.option').length, 9);
    });
    let url = PREFIX + DETAIL_URL + "/";
    let payload = ROLE_FIXTURES.put({id: ROLE_DEFAULTS.idOne, categories: [CATEGORY_DEFAULTS.idOne]});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
    });
});

test('search will filter down on people in store correctly by removing and adding a categories back', (assert) => {
    detail_data.categories = [...detail_data.categories, CATEGORY_FIXTURES.get(CATEGORY_DEFAULTS.idTwo)];
    detail_data.categories[1].id =  'abc123';
    detail_data.categories[1].name =  CATEGORY_DEFAULTS.nameOne + ' scooter';
    visit(DETAIL_URL);
    andThen(() => {
        let role = store.find('role', ROLE_DEFAULTS.idOne);
        assert.equal(role.get('categories').get('length'), 2);
        assert.equal(find('div.item').length, 2);
        assert.equal(find('div.option').length, 0);
    });
    let category_endpoint = PREFIX + '/admin/categories/?name__icontains=scooter';
    xhr(category_endpoint, 'GET', null, {}, 200, CATEGORY_FIXTURES.list());
    click('div.item > a.remove:eq(1)');
    andThen(() => {
        assert.equal(find('div.option').length, 0);
    });
    fillIn('.selectize-input input', 'scooter');
    triggerEvent('.selectize-input input', 'keyup', LETTER_S);
    click('.t-role-category-select div.option:eq(0)');
    andThen(() => {
        let role = store.find('role', ROLE_DEFAULTS.idOne);
        assert.equal(role.get('role_category_fks').length, 2);
        assert.equal(role.get('categories').get('length'), 2);
        assert.ok(role.get('isDirtyOrRelatedDirty'));
        assert.equal(find('div.item').length, 2);
        assert.equal(find('div.option').length, 9);
    });
    let url = PREFIX + DETAIL_URL + "/";
    let payload = ROLE_FIXTURES.put({id: ROLE_DEFAULTS.idOne, categories: [CATEGORY_DEFAULTS.idOne, 'abc123']});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
    });
});
