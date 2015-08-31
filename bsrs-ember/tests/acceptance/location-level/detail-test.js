import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import config from 'bsrs-ember/config/environment';
import LOCATION_LEVEL_FIXTURES from 'bsrs-ember/vendor/location_level_fixtures';
import LOCATION_LEVEL_DEFAULTS from 'bsrs-ember/vendor/defaults/location-level';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_location_levels_url;
const LOCATION_LEVEL_URL = BASE_URL + '/index';
const DJANGO_LOCATION_LEVEL_URL = '/admin/location_levels/';
const DETAIL_URL = BASE_URL + '/' + LOCATION_LEVEL_DEFAULTS.idOne;
const DJANGO_DETAIL_URL = PREFIX + DJANGO_LOCATION_LEVEL_URL + LOCATION_LEVEL_DEFAULTS.idOne + '/';
const SUBMIT_BTN = '.submit_btn';
const SAVE_BTN = '.t-save-btn';
const CANCEL_BTN = '.t-cancel-btn';

let application, store, endpoint, list_xhr;

module('amk Acceptance | detail-test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        let location_list_data = LOCATION_LEVEL_FIXTURES.list();
        let location_detail_data = LOCATION_LEVEL_FIXTURES.detail();
        endpoint = PREFIX + DJANGO_LOCATION_LEVEL_URL;
        list_xhr = xhr(endpoint, 'GET', null, {}, 200, location_list_data);
        xhr(DJANGO_DETAIL_URL, 'GET', null, {}, 200, location_detail_data);
    },
    afterEach() {
       Ember.run(application, 'destroy');
    }
});

test('clicking on a location levels name will redirect them to the detail view', (assert) => {
    visit(LOCATION_LEVEL_URL);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_LEVEL_URL);
    });
    click('.t-location-level-data:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
    });
});

test('visiting admin/location-level', (assert) => {
    clearxhr(list_xhr);
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let location = store.find('location-level').objectAt(0);
        assert.ok(location.get('isNotDirty'));
        assert.equal(find('.t-location-level-name').val(), LOCATION_LEVEL_DEFAULTS.nameCompany);
    });
    let response = LOCATION_LEVEL_FIXTURES.detail(LOCATION_LEVEL_DEFAULTS.idOne);
    let payload = LOCATION_LEVEL_FIXTURES.put({id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameRegion, children: LOCATION_LEVEL_DEFAULTS.companyChildren});
    xhr(DJANGO_DETAIL_URL, 'PUT', JSON.stringify(payload), {}, 200, response);
    fillIn('.t-location-level-name', LOCATION_LEVEL_DEFAULTS.nameRegion);
    andThen(() => {
        let location = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idOne);
        assert.ok(location.get('isDirty'));
    });
    let list = LOCATION_LEVEL_FIXTURES.list();
    list.results[0].name = LOCATION_LEVEL_DEFAULTS.nameRegion;
    xhr(endpoint, 'GET', null, {}, 200, list);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_LEVEL_URL);
        let location = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idOne);
        assert.ok(location.get('isNotDirty'));
    });
});

test('when editing name to invalid, it checks for validation', (assert) => {
    visit(DETAIL_URL);
    fillIn('.t-location-level-name', '');
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find('.t-name-validation-error').text().trim(), 'Invalid Name');
    });
    fillIn('.t-location-level-name', LOCATION_LEVEL_DEFAULTS.nameCompany);
    let response = LOCATION_LEVEL_FIXTURES.detail(LOCATION_LEVEL_DEFAULTS.idOne);
    let payload = LOCATION_LEVEL_FIXTURES.put({id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, children: LOCATION_LEVEL_DEFAULTS.companyChildren});
    xhr(DJANGO_DETAIL_URL, 'PUT', JSON.stringify(payload), {}, 200, response);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_LEVEL_URL);
    });
});

test('clicking cancel button will take from detail view to list view', (assert) => {
    visit(LOCATION_LEVEL_URL);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_LEVEL_URL);
    });
    click('.t-location-level-data:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
    });
    click(CANCEL_BTN);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_LEVEL_URL);
    });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and they cancel', (assert) => {
    clearxhr(list_xhr);
    visit(DETAIL_URL);
    fillIn('.t-location-level-name', LOCATION_LEVEL_DEFAULTS.nameRegion);
    click(CANCEL_BTN);
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
            assert.equal(find('.t-location-name').val(), LOCATION_LEVEL_DEFAULTS.storeNameTwo);
            assert.equal(find('.t-modal').is(':hidden'), true);
        });
    });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', (assert) => {
    visit(DETAIL_URL);
    fillIn('.t-location-level-name', LOCATION_LEVEL_DEFAULTS.nameRegion);
    click(CANCEL_BTN);
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL);
            assert.equal(find('.t-modal').is(':visible'), true);
        });
    });
    click('.t-modal-footer .t-modal-rollback-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), LOCATION_LEVEL_URL);
            assert.equal(find('.t-modal').is(':hidden'), true);
            let location_level = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idOne);
            assert.equal(location_level.get('name'), LOCATION_LEVEL_DEFAULTS.nameCompany);
        });
    });
});

test('when click delete, location level is deleted and removed from store', (assert) => {
    visit(DETAIL_URL);
    xhr(DJANGO_DETAIL_URL, 'DELETE', null, {}, 204, {});
    click('.t-delete-btn');
    andThen(() => {
        assert.equal(currentURL(), LOCATION_LEVEL_URL);
    });
});
