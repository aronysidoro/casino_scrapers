import Ember from 'ember';
import { test } from 'qunit';
import module from "bsrs-ember/tests/helpers/module";
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import config from 'bsrs-ember/config/environment';
import PEOPLE_FIXTURES from 'bsrs-ember/vendor/people_fixtures';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';

const PERSON_PK = 1;
const PREFIX = config.APP.NAMESPACE;
const PEOPLE_URL = "/admin/people";
const DETAIL_URL = PEOPLE_URL + "/" + PERSON_PK;
const SUBMIT_BTN = ".submit_btn";

var application, store;

module('Acceptance | detail test', {
  beforeEach() {
    application = startApp();
    store = application.__container__.lookup('store:main');
    var people_list_data = PEOPLE_FIXTURES.list();
    var people_detail_data = PEOPLE_FIXTURES.detail(PERSON_PK);
    var endpoint = PREFIX + PEOPLE_URL + "/";
    xhr(endpoint ,"GET",null,{},200,people_list_data);
    xhr(endpoint + PERSON_PK + "/","GET",null,{},200,people_detail_data);
  },
  afterEach() {
    Ember.run(application, 'destroy');
  }
});

test('clicking a persons name will redirect to the given detail view', function(assert) {
    visit(PEOPLE_URL);

    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL);
    });

    click('.t-person-data:eq(0)');

    andThen(() => {
        assert.equal(currentURL(),DETAIL_URL);
    });
});

test('when you deep link to the person detail view you get bound attrs', function(assert) {

    visit(DETAIL_URL);

    andThen(() => {
        //TODO: verify ALL the other dynamic bits
        assert.equal(currentURL(),DETAIL_URL);
        assert.equal(find('.t-person-username').val(), 'akrier');
        assert.equal(find('.t-person-first-name').val(), 'Andy');
        assert.equal(find('.t-person-last-name').val(), 'Krier');
        assert.equal(find('.t-person-title').val(), 'RVP');
        assert.equal(find('.t-person-emp_number').val(), '5063');
        assert.equal(find('.t-input-multi-phone').find('select:eq(0)').val(), '1');
        assert.equal(find('.t-input-multi-phone').find('select:eq(1)').val(), '2');
        assert.equal(find('.t-input-multi-phone').find('select:eq(0) option:selected').text(), 'Office');
        assert.equal(find('.t-input-multi-phone').find('select:eq(1) option:selected').text(), 'Mobile');
        assert.equal(find('.t-input-multi-phone').find('input').length, 2);
        assert.equal(find('.t-input-multi-phone').find('input:eq(0)').val(), '858-715-5026');
        assert.equal(find('.t-input-multi-phone').find('input:eq(1)').val(), '858-715-5056');

        assert.equal(find('.t-input-multi-address').find('.t-address-group').length, 2);
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-type').val(), '1');
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-type option:selected').text(), 'Office');
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address').val(), 'Sky Park');
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-city').val(), 'San Diego');
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-state').val(), 5);
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-postal-code').val(), '92123');
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(0) .t-address-country').val(), 1);

        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-type').val(), '2');
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-type option:selected').text(), 'Shipping');
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address').val(), '123 PB');
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-city').val(), 'San Diego');
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-state').val(), 5);
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-postal-code').val(), '92100');
        assert.equal(find('.t-input-multi-address').find('.t-address-group:eq(1) .t-address-country').val(), 1);

        assert.equal(find('.t-person-auth_amount').val(), '50000.0000');
    });

    var url = PREFIX + DETAIL_URL + "/";
    var response = PEOPLE_FIXTURES.detail(PERSON_PK);
    var phone_numbers = [{id: 3, number: '858-715-5026', type: 1}, {id: 4, number: '858-715-5056', type: 2}];
    var addresses = [{id: 1, type: 1, address: 'Sky Park', city: 'San Diego', state: 5, postal_code: '92123', country: 1},
        {id: 2, type: 2, address: '123 PB', city: 'San Diego', state: 5, postal_code: '92100', country: 1}];
    var payload = PEOPLE_FIXTURES.put(PERSON_PK, 'llcoolj', 'Ice', 'Cube', 'mastermind', '1122', '0.000', phone_numbers, addresses);
    xhr( url,'PUT',payload,{},200,response );

    fillIn('.t-person-username', 'llcoolj');
    fillIn('.t-person-first-name', 'Ice');
    fillIn('.t-person-last-name', 'Cube');
    fillIn('.t-person-title', 'mastermind');
    fillIn('.t-person-emp_number', '1122');
    fillIn('.t-person-auth_amount', '0.000');

    click('.t-save-btn');
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL);
    });
});

test('clicking cancel button will take from detail view to list view', function(assert) {
    visit(PEOPLE_URL);

    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL);
    });

    click('.t-person-data:eq(0)');

    andThen(() => {
        assert.equal(currentURL(),DETAIL_URL);
    });

    click('.t-cancel-btn');

    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL);
    });
});

test('when you change a related phone numbers type it will be persisted correctly', function(assert) {

    visit(DETAIL_URL);
    var url = PREFIX + DETAIL_URL + "/";
    //phone_number fixture type for id:3 is 1 in the fixture data
    var phone_numbers = [{id: 3, number: '858-715-5026', type: 2}, {id: 4, number: '858-715-5056', type: 2}];
    var payload = PEOPLE_FIXTURES.put(PERSON_PK, null, null, null, null, null, null, phone_numbers, null);
    fillIn('.t-multi-phone-type:eq(0)', 2);

    xhr(url,'PUT',payload,{},200);
    click('.t-save-btn');
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL);
    });
});

test('when you change a related address type it will be persisted correctly', function(assert) {
    visit(DETAIL_URL);
    var url = PREFIX + DETAIL_URL + "/";
    var addresses = [{id: 1, type: 1, address: 'Sky Park', city: 'San Diego', state: 5, postal_code: '92123', country: 1},
        {id: 2, type: 2, address: '123 PB', city: 'San Diego', state: 5, postal_code: '92100', country: 1}];
    var payload = PEOPLE_FIXTURES.put(PERSON_PK, null, null, null, null, null, null, null, addresses);
    xhr(url,'PUT',payload,{},200);
    fillIn('.t-multi-phone-type:eq(0)', 2);
    click('.t-save-btn');
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL);
    });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and they cancel', function(assert) {
    visit(DETAIL_URL);
    fillIn('.t-person-username', 'llcoolj');
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
            assert.equal(find('.t-person-username').val(), 'llcoolj');
            assert.equal(find('.t-modal').is(':hidden'), true);
        });
    });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', function(assert) {
    visit(DETAIL_URL);
    fillIn('.t-person-username', 'llcoolj');
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
            assert.equal(currentURL(), PEOPLE_URL);
            assert.equal(find('.t-modal').is(':hidden'), true);
            var person = store.find('person', PERSON_PK);
            assert.equal(person.get('username'), 'akrier');
        });
    });
});

test('when user changes an attribute on phonenumber and clicks cancel we prompt them with a modal and the related model gets rolled back', function(assert) {
    visit(DETAIL_URL);
    fillIn('.t-multi-phone-type:eq(0)', 2);
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
            assert.equal(currentURL(), PEOPLE_URL);
            assert.equal(find('.t-modal').is(':hidden'), true);
            var person = store.find('person', PERSON_PK);
            var phone_numbers = store.find('phonenumber', PERSON_PK);
            assert.equal(phone_numbers.source[0].get('type'), 1);
        });
    });
});
