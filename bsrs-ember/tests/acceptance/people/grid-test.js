import Ember from 'ember';
import { test } from 'qunit';
import module from "bsrs-ember/tests/helpers/module";
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import PEOPLE_FIXTURES from 'bsrs-ember/vendor/people_fixtures';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import ROLE_DEFAULTS from 'bsrs-ember/vendor/defaults/role';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import {isFocused} from 'bsrs-ember/tests/helpers/input';
import {isDisabledElement, isNotDisabledElement} from 'bsrs-ember/tests/helpers/disabled';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_people_url;
const PEOPLE_URL = BASE_URL + '/index';
const LETTER_M = {keyCode: 77};
const SPACEBAR = {keyCode: 32};
const NUMBER_EIGHT = {keyCode: 56};
const BACKSPACE = {keyCode: 8};

var application, store, endpoint, list_xhr;

module('Acceptance | people-grid-list', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        endpoint = PREFIX + BASE_URL + '/?page=1';
        list_xhr = xhr(endpoint ,"GET",null,{},200,PEOPLE_FIXTURES.list());
    },
    afterEach() {
        Ember.run(application, 'destroy');
    }
});

test('initial load should only show first 10 records ordered by id with correct pagination and no additional xhr', function(assert) {
    visit(PEOPLE_URL);
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL);
        assert.equal(find('.t-person-data').length, 10);
        assert.equal(find('.t-person-data:eq(0) .t-person-username').text(), PEOPLE_DEFAULTS.username);
        assert.equal(find('.t-person-data:eq(0) .t-person-fullname').text(), PEOPLE_DEFAULTS.first_name + ' ' + PEOPLE_DEFAULTS.last_name);
        assert.equal(find('.t-person-data:eq(0) .t-person-title').text(), PEOPLE_DEFAULTS.title);
        assert.equal(find('.t-person-data:eq(0) .t-person-role-name').text(), t(ROLE_DEFAULTS.nameOne));
        assert.equal(find('.t-person-data:eq(0) .t-person-employee-id').text(), PEOPLE_DEFAULTS.employee_id);
        var pagination = find('.t-pages');
        assert.equal(pagination.find('.t-page').length, 2);
        assert.equal(pagination.find('.t-page:eq(0) a').text(), '1');
        assert.equal(pagination.find('.t-page:eq(1) a').text(), '2');
        assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
        assert.ok(!pagination.find('.t-page:eq(1) a').hasClass('active'));
    });
});

test('clicking page 2 will load in another set of data as well as clicking page 1 after that reloads the original set of data (both require an additional xhr)', function(assert) {
    var page_two = PREFIX + BASE_URL + '/?page=2';
    xhr(page_two ,"GET",null,{},200,PEOPLE_FIXTURES.list_two());
    visit(PEOPLE_URL);
    click('.t-page:eq(1) a');
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL + '?page=2');
        assert.equal(find('.t-person-data').length, 9);
        assert.equal(find('.t-person-data:eq(0) .t-person-username').text(), 'scott11');
        var pagination = find('.t-pages');
        assert.equal(pagination.find('.t-page').length, 2);
        assert.equal(pagination.find('.t-page:eq(0) a').text(), '1');
        assert.equal(pagination.find('.t-page:eq(1) a').text(), '2');
        assert.ok(!pagination.find('.t-page:eq(0) a').hasClass('active'));
        assert.ok(pagination.find('.t-page:eq(1) a').hasClass('active'));
    });
    click('.t-page:eq(0) a');
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL);
        assert.equal(find('.t-person-data').length, 10);
        assert.equal(find('.t-person-data:eq(0) .t-person-username').text(), PEOPLE_DEFAULTS.username);
        var pagination = find('.t-pages');
        assert.equal(pagination.find('.t-page').length, 2);
        assert.equal(pagination.find('.t-page:eq(0) a').text(), '1');
        assert.equal(pagination.find('.t-page:eq(1) a').text(), '2');
        assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
        assert.ok(!pagination.find('.t-page:eq(1) a').hasClass('active'));
    });
});

test('clicking first,last,next and previous will request page 1 and 2 correctly', function(assert) {
    var page_two = PREFIX + BASE_URL + '/?page=2';
    xhr(page_two ,"GET",null,{},200,PEOPLE_FIXTURES.list_two());
    visit(PEOPLE_URL);
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL);
        assert.equal(find('.t-person-data').length, 10);
        isDisabledElement('.t-first');
        isDisabledElement('.t-previous');
        isNotDisabledElement('.t-next');
        isNotDisabledElement('.t-last');
    });
    click('.t-next a');
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL + '?page=2');
        assert.equal(find('.t-person-data').length, 9);
        isNotDisabledElement('.t-first');
        isNotDisabledElement('.t-previous');
        isDisabledElement('.t-next');
        isDisabledElement('.t-last');
    });
    click('.t-previous a');
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL);
        assert.equal(find('.t-person-data').length, 10);
        isDisabledElement('.t-first');
        isDisabledElement('.t-previous');
        isNotDisabledElement('.t-next');
        isNotDisabledElement('.t-last');
    });
    click('.t-last a');
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL + '?page=2');
        assert.equal(find('.t-person-data').length, 9);
        isNotDisabledElement('.t-first');
        isNotDisabledElement('.t-previous');
        isDisabledElement('.t-next');
        isDisabledElement('.t-last');
    });
    click('.t-first a');
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL);
        assert.equal(find('.t-person-data').length, 10);
        isDisabledElement('.t-first');
        isDisabledElement('.t-previous');
        isNotDisabledElement('.t-next');
        isNotDisabledElement('.t-last');
    });
});

test('clicking header will sort by given property and reset page to 1 (also requires an additional xhr)', function(assert) {
    var sort_two = PREFIX + BASE_URL + '/?page=1&ordering=title,username';
    xhr(sort_two ,"GET",null,{},200,PEOPLE_FIXTURES.sorted('title,username', 1));
    var page_two = PREFIX + BASE_URL + '/?page=2&ordering=username';
    xhr(page_two ,"GET",null,{},200,PEOPLE_FIXTURES.sorted('username', 2));
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=username';
    xhr(sort_one ,"GET",null,{},200,PEOPLE_FIXTURES.sorted('username', 1));
    visit(PEOPLE_URL);
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL);
        assert.equal(find('.t-person-data').length, 10);
        assert.equal(find('.t-person-data:eq(0) .t-person-username').text(), PEOPLE_DEFAULTS.username);
    });
    click('.t-sort-username-dir');
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL + '?sort=username');
        assert.equal(find('.t-person-data').length, 10);
        assert.equal(find('.t-person-data:eq(0) .t-person-username').text(), PEOPLE_DEFAULTS.username);
    });
    click('.t-page:eq(1) a');
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL + '?page=2&sort=username');
        assert.equal(find('.t-person-data').length, 9);
        assert.equal(find('.t-person-data:eq(0) .t-person-username').text(), 'scott11');
    });
    click('.t-sort-title-dir');
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL + '?sort=title%2Cusername');
        assert.equal(find('.t-person-data').length, 10);
        assert.equal(find('.t-person-data:eq(0) .t-person-username').text(), PEOPLE_DEFAULTS.username);
    });
});

test('typing a search will reset page to 1 and require an additional xhr', function(assert) {
    var search_two = PREFIX + BASE_URL + '/?page=1&ordering=title&search=8%20m';
    xhr(search_two ,"GET",null,{},200,PEOPLE_FIXTURES.searched('8 m', 'title'));
    var page_two = PREFIX + BASE_URL + '/?page=2&ordering=title';
    xhr(page_two ,"GET",null,{},200,PEOPLE_FIXTURES.searched('', 'title', 2));
    var page_one = PREFIX + BASE_URL + '/?page=1&ordering=title';
    xhr(page_one ,"GET",null,{},200,PEOPLE_FIXTURES.searched('', 'title'));
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=title&search=8';
    xhr(sort_one ,"GET",null,{},200,PEOPLE_FIXTURES.searched('8', 'title'));
    var search_one = PREFIX + BASE_URL + '/?page=1&search=8';
    xhr(search_one ,"GET",null,{},200,PEOPLE_FIXTURES.searched('8', 'id'));
    visit(PEOPLE_URL);
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL);
        assert.equal(find('.t-person-data').length, 10);
        assert.equal(find('.t-person-data:eq(0) .t-person-username').text(), PEOPLE_DEFAULTS.username);
    });
    fillIn('.t-grid-search-input', '8');
    triggerEvent('.t-grid-search-input', 'keyup', NUMBER_EIGHT);
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL + '?search=8');
        assert.equal(find('.t-person-data').length, 2);
        assert.equal(find('.t-person-data:eq(0) .t-person-username').text(), 'mgibson8');
        assert.equal(find('.t-person-data:eq(1) .t-person-username').text(), 'scott18');
    });
    click('.t-sort-title-dir');
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL + '?search=8&sort=title');
        assert.equal(find('.t-person-data').length, 2);
        assert.equal(find('.t-person-data:eq(0) .t-person-username').text(), 'scott18');
        assert.equal(find('.t-person-data:eq(1) .t-person-username').text(), 'mgibson8');
    });
    fillIn('.t-grid-search-input', '');
    triggerEvent('.t-grid-search-input', 'keyup', BACKSPACE);
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL + '?search=&sort=title');
        assert.equal(find('.t-person-data').length, 10);
        assert.equal(find('.t-person-data:eq(0) .t-person-username').text(), PEOPLE_DEFAULTS.username);
    });
    click('.t-page:eq(1) a');
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL + '?page=2&search=&sort=title');
        assert.equal(find('.t-person-data').length, 9);
        assert.equal(find('.t-person-data:eq(0) .t-person-username').text(), 'mgibson2');
    });
    fillIn('.t-grid-search-input', '8 m');
    triggerEvent('.t-grid-search-input', 'keyup', NUMBER_EIGHT);
    triggerEvent('.t-grid-search-input', 'keyup', SPACEBAR);
    triggerEvent('.t-grid-search-input', 'keyup', LETTER_M);
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL + '?search=8%20m&sort=title');
        assert.equal(find('.t-person-data').length, 1);
        assert.equal(find('.t-person-data:eq(0) .t-person-username').text(), 'mgibson8');
    });
});

test('multiple sort options appear in the query string as expected', function(assert) {
    var sort_three = PREFIX + BASE_URL + '/?page=1&ordering=first_name,title,username';
    xhr(sort_three ,"GET",null,{},200,PEOPLE_FIXTURES.sorted('first_name,title,username', 1));
    var sort_two = PREFIX + BASE_URL + '/?page=1&ordering=title,username';
    xhr(sort_two ,"GET",null,{},200,PEOPLE_FIXTURES.sorted('title,username', 1));
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=username';
    xhr(sort_one ,"GET",null,{},200,PEOPLE_FIXTURES.sorted('username', 1));
    visit(PEOPLE_URL);
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL);
        assert.equal(find('.t-person-data').length, 10);
        assert.equal(find('.t-person-data:eq(0) .t-person-username').text(), PEOPLE_DEFAULTS.username);
    });
    click('.t-sort-username-dir');
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL + '?sort=username');
        assert.equal(find('.t-person-data').length, 10);
        assert.equal(find('.t-person-data:eq(0) .t-person-username').text(), PEOPLE_DEFAULTS.username);
    });
    click('.t-sort-title-dir');
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL + '?sort=title%2Cusername');
        assert.equal(find('.t-person-data').length, 10);
        assert.equal(find('.t-person-data:eq(0) .t-person-username').text(), PEOPLE_DEFAULTS.username);
    });
    click('.t-sort-first-name-dir');
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL + '?sort=first_name%2Ctitle%2Cusername');
        assert.equal(find('.t-person-data').length, 10);
        assert.equal(find('.t-person-data:eq(0) .t-person-username').text(), 'wanker');
    });
});

test('clicking the same sort option over and over will flip the direction', function(assert) {
    var sort_four = PREFIX + BASE_URL + '/?page=1&ordering=username,title';
    xhr(sort_four ,"GET",null,{},200,PEOPLE_FIXTURES.sorted('username,title', 1));
    var sort_three = PREFIX + BASE_URL + '/?page=1&ordering=-username,title';
    xhr(sort_three ,"GET",null,{},200,PEOPLE_FIXTURES.sorted('-username,title', 1));
    var sort_two = PREFIX + BASE_URL + '/?page=1&ordering=title,username';
    xhr(sort_two ,"GET",null,{},200,PEOPLE_FIXTURES.sorted('title,username', 1));
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=username';
    xhr(sort_one ,"GET",null,{},200,PEOPLE_FIXTURES.sorted('username', 1));
    visit(PEOPLE_URL);
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL);
        assert.equal(find('.t-person-data').length, 10);
        assert.ok(find('.t-sort-username-dir').hasClass('fa-sort'));
        assert.ok(find('.t-sort-title-dir').hasClass('fa-sort'));
        assert.equal(find('.t-person-data:eq(0) .t-person-username').text(), PEOPLE_DEFAULTS.username);
    });
    click('.t-sort-username-dir');
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL + '?sort=username');
        assert.equal(find('.t-person-data').length, 10);
        assert.ok(find('.t-sort-username-dir').hasClass('fa-sort-asc'));
        assert.ok(find('.t-sort-title-dir').hasClass('fa-sort'));
        assert.equal(find('.t-person-data:eq(0) .t-person-username').text(), PEOPLE_DEFAULTS.username);
    });
    click('.t-sort-title-dir');
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL + '?sort=title%2Cusername');
        assert.equal(find('.t-person-data').length, 10);
        assert.ok(find('.t-sort-title-dir').hasClass('fa-sort-asc'));
        assert.ok(find('.t-sort-username-dir').hasClass('fa-sort-asc'));
        assert.equal(find('.t-person-data:eq(0) .t-person-username').text(), PEOPLE_DEFAULTS.username);
    });
    click('.t-sort-username-dir');
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL + '?sort=-username%2Ctitle');
        assert.equal(find('.t-person-data').length, 10);
        assert.ok(find('.t-sort-title-dir').hasClass('fa-sort-asc'));
        assert.ok(find('.t-sort-username-dir').hasClass('fa-sort-desc'));
        assert.equal(find('.t-person-data:eq(0) .t-person-username').text(), 'wanker');
    });
    click('.t-sort-username-dir');
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL + '?sort=username%2Ctitle');
        assert.equal(find('.t-person-data').length, 10);
        assert.ok(find('.t-sort-title-dir').hasClass('fa-sort-asc'));
        assert.ok(find('.t-sort-username-dir').hasClass('fa-sort-asc'));
        assert.equal(find('.t-person-data:eq(0) .t-person-username').text(), PEOPLE_DEFAULTS.username);
    });
});

test('full text search will filter down the result set and query django accordingly', function(assert) {
    let find_four = PREFIX + BASE_URL + '/?page=1&title__icontains=wat&username__icontains=lelevier&fullname__icontains=ewcomer';
    xhr(find_four ,"GET",null,{},200,PEOPLE_FIXTURES.sorted('title:wat,username:lelevier,fullname:ewcomer', 1));
    let find_three = PREFIX + BASE_URL + '/?page=1&title__icontains=wat&username__icontains=7&fullname__icontains=ewcomer';
    xhr(find_three ,"GET",null,{},200,PEOPLE_FIXTURES.sorted('title:wat,username:7,fullname:S', 1));
    let find_two = PREFIX + BASE_URL + '/?page=1&title__icontains=wat&username__icontains=7';
    xhr(find_two ,"GET",null,{},200,PEOPLE_FIXTURES.sorted('title:wat,username:7', 1));
    let find_one = PREFIX + BASE_URL + '/?page=1&title__icontains=wat';
    xhr(find_one ,"GET",null,{},200,PEOPLE_FIXTURES.fulltext('title:wat', 1));
    visit(PEOPLE_URL);
    andThen(() => {
        assert.equal(currentURL(), PEOPLE_URL);
        assert.equal(find('.t-person-data').length, 10);
        assert.equal(find('.t-person-data:eq(0) .t-person-username').text(), PEOPLE_DEFAULTS.username);
    });
    filterGrid('title', 'wat');
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL + '?find=title%3Awat');
        assert.equal(find('.t-person-data').length, 8);
        assert.equal(find('.t-person-data:eq(0) .t-person-username').text(), 'scott11');
    });
    filterGrid('username', '7');
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL + '?find=title%3Awat%2Cusername%3A7');
        assert.equal(find('.t-person-data').length, 1);
        assert.equal(find('.t-person-data:eq(0) .t-person-username').text(), 'scott17');
    });
    click('.t-filter-fullname');
    filterGrid('fullname', 'ewcomer');
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL + '?find=title%3Awat%2Cusername%3A7%2Cfullname%3Aewcomer');
        assert.equal(find('.t-person-data').length, 1);
        assert.equal(find('.t-person-data:eq(0) .t-person-username').text(), 'scott17');
    });
    click('.t-filter-fullname');
    filterGrid('username', 'lelevier');
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL + '?find=title%3Awat%2Cusername%3Alelevier%2Cfullname%3Aewcomer');
        assert.equal(find('.t-person-data').length, 0);
    });
});

test('loading screen shown before any xhr and hidden after', function(assert) {
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=username';
    xhr(sort_one ,"GET",null,{},200,PEOPLE_FIXTURES.sorted('username', 1));
    visitSync(PEOPLE_URL);
    Ember.run.later(function() {
        assert.equal(find('.t-person-data').length, 1);
        assert.equal(find('.t-grid-loading-graphic').length, 1);
    }, 0);
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL);
        assert.equal(find('.t-person-data').length, 10);
        assert.equal(find('.t-grid-loading-graphic').length, 0);
    });
    click('.t-sort-username-dir');
    Ember.run.later(function() {
        assert.equal(find('.t-grid-loading-graphic').length, 1);
    }, 0);
    andThen(() => {
        assert.equal(find('.t-grid-loading-graphic').length, 0);
    });
});

test('when a full text filter is selected the input inside the modal is focused', function(assert) {
    visit(PEOPLE_URL);
    click('.t-filter-fullname');
    andThen(() => {
        isFocused('.ember-modal-dialog input:first');
    });
    click('.t-filter-title');
    andThen(() => {
        isFocused('.ember-modal-dialog input:first');
    });
});

test('full text searched columns will have a special on css class when active', function(assert) {
    let find_four = PREFIX + BASE_URL + '/?page=1&title__icontains=wat&username__icontains=&fullname__icontains=ewcomer';
    xhr(find_four ,"GET",null,{},200,PEOPLE_FIXTURES.sorted('title:wat,fullname:ewcomer', 1));
    let find_three = PREFIX + BASE_URL + '/?page=1&title__icontains=wat&username__icontains=7&fullname__icontains=ewcomer';
    xhr(find_three ,"GET",null,{},200,PEOPLE_FIXTURES.sorted('title:wat,username:7,fullname:S', 1));
    let find_two = PREFIX + BASE_URL + '/?page=1&title__icontains=wat&username__icontains=7';
    xhr(find_two ,"GET",null,{},200,PEOPLE_FIXTURES.sorted('title:wat,username:7', 1));
    let find_one = PREFIX + BASE_URL + '/?page=1&title__icontains=wat';
    xhr(find_one ,"GET",null,{},200,PEOPLE_FIXTURES.fulltext('title:wat', 1));
    visit(PEOPLE_URL);
    andThen(() => {
        assert.ok(!find('.t-filter-fullname').hasClass('on'));
        assert.ok(!find('.t-filter-username').hasClass('on'));
        assert.ok(!find('.t-filter-title').hasClass('on'));
    });
    filterGrid('title', 'wat');
    andThen(() => {
        assert.ok(!find('.t-filter-fullname').hasClass('on'));
        assert.ok(!find('.t-filter-username').hasClass('on'));
        assert.ok(find('.t-filter-title').hasClass('on'));
    });
    filterGrid('username', '7');
    andThen(() => {
        assert.ok(!find('.t-filter-fullname').hasClass('on'));
        assert.ok(find('.t-filter-username').hasClass('on'));
        assert.ok(find('.t-filter-title').hasClass('on'));
    });
    filterGrid('fullname', 'ewcomer');
    andThen(() => {
        assert.ok(find('.t-filter-fullname').hasClass('on'));
        assert.ok(find('.t-filter-username').hasClass('on'));
        assert.ok(find('.t-filter-title').hasClass('on'));
    });
    filterGrid('username', '');
    andThen(() => {
        assert.ok(find('.t-filter-fullname').hasClass('on'));
        assert.ok(!find('.t-filter-username').hasClass('on'));
        assert.ok(find('.t-filter-title').hasClass('on'));
    });
});
