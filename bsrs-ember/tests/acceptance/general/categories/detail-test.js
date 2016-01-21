import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import config from 'bsrs-ember/config/environment';
import CD from 'bsrs-ember/vendor/defaults/category';
import CF from 'bsrs-ember/vendor/category_fixtures';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import generalPage from 'bsrs-ember/tests/pages/general';
import page from 'bsrs-ember/tests/pages/category';

const PREFIX = config.APP.NAMESPACE;
const PAGE_SIZE = config.APP.PAGE_SIZE;
const BASE_URL = BASEURLS.base_categories_url;
const CATEGORIES_URL = BASE_URL + '/index';
const DETAIL_URL = BASE_URL + '/' + CD.idOne;
const GRID_DETAIL_URL = BASE_URL + '/' + CD.idGridOne;
const LETTER_A = {keyCode: 65};
const SPACEBAR = {keyCode: 32};
const CATEGORY = '.t-category-children-select > .ember-basic-dropdown-trigger';
const CATEGORY_DROPDOWN = '.t-category-children-select-dropdown > .ember-power-select-options';
const CATEGORY_SEARCH = '.ember-power-select-trigger-multiple-input';

let application, store, endpoint, detail_xhr, list_xhr, detail_data;

module('Acceptance | detail test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        endpoint = PREFIX + BASE_URL + '/';
        detail_data = CF.detail(CD.idOne);
        list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, CF.list());
        detail_xhr = xhr(endpoint + CD.idOne + '/', 'GET', null, {}, 200, detail_data);
    },
    afterEach() {
        Ember.run(application, 'destroy');
    }
});

test('clicking a categories name will redirect to the given detail view', (assert) => {
    clearxhr(detail_xhr);
    visit(CATEGORIES_URL);
    andThen(() => {
        assert.equal(currentURL(), CATEGORIES_URL);
    });
    const detail_data = CF.detail(CD.idGridOne);
    xhr(endpoint + CD.idGridOne + '/', 'GET', null, {}, 200, detail_data);
    click('.t-grid-data:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), GRID_DETAIL_URL);
    });
});

test('when you deep link to the category detail view you get bound attrs', (assert) => {
    clearxhr(list_xhr);
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let category = store.find('category', CD.idOne);
        assert.ok(category.get('isNotDirty'));
        assert.equal(page.nameInput(), CD.nameOne);
        assert.equal(page.descriptionInput(), CD.descriptionRepair);
        assert.equal(page.labelInput(), CD.labelOne);
        assert.equal(page.amountInput(), CD.costAmountOne);
        assert.equal(page.costCodeInput(), CD.costCodeOne);
    });
    let url = PREFIX + DETAIL_URL + '/';
    let response = CF.detail(CD.idOne);
    let payload = CF.put({id: CD.idOne, name: CD.nameTwo, description: CD.descriptionMaintenance,
    label: CD.labelTwo, cost_amount: CD.costAmountTwo, cost_code: CD.costCodeTwo});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    page.nameFill(CD.nameTwo);
    page.descriptionFill(CD.descriptionMaintenance);
    page.labelFill(CD.labelTwo);
    page.amountFill(CD.costAmountTwo);
    page.costCodeFill(CD.costCodeTwo);
    andThen(() => {
        let category = store.find('category', CD.idOne);
        assert.ok(category.get('isDirty'));
    });
    let list = CF.list();
    list.results[0].name = CD.nameTwo;
    list.results[0].description = CD.descriptionMaintenance;
    list.results[0].label = CD.labelTwo;
    list.results[0].cost_amount = CD.costAmountTwo;
    list.results[0].cost_code = CD.costCodeTwo;
    //just leaving here until I can figure out how to do destructuring w/o jshint blowing up on me.
    // let results = list.results[0];
    // ({nameTwo: results.name, descriptionMaintenance: results.description, labelTwo: results.label, costAmountTwo: results.cost_amount, costCodeTwo: results.cost_code} = CD);
    xhr(endpoint + '?page=1', 'GET', null, {}, 200, list);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), CATEGORIES_URL);
        let category = store.find('category', CD.idOne);
        assert.equal(category.get('name'), CD.nameTwo);
        assert.equal(category.get('description'), CD.descriptionMaintenance);
        assert.equal(category.get('label'), CD.labelTwo);
        assert.equal(category.get('cost_amount'), CD.costAmountTwo);
        assert.equal(category.get('cost_code'), CD.costCodeTwo);
        assert.ok(category.get('isNotDirty'));
    });
});

test('when you click cancel, you are redirected to the category list view', (assert) => {
    visit(DETAIL_URL);
    andThen(() => {
        const category = store.find('category', CD.idOne);
        assert.ok(category.get('isNotDirtyOrRelatedNotDirty'));
    });
    generalPage.cancel();
    andThen(() => {
        assert.equal(currentURL(), CATEGORIES_URL);
    });
});

test('when editing the category name to invalid, it checks for validation', (assert) => {
    visit(DETAIL_URL);
    page.nameFill('');
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find('.t-name-validation-error').text().trim(), 'Invalid Name');
        assert.ok(find('.t-name-validation-error').hasClass('validation'));
    });
    page.nameFill(CD.nameTwo);
    page.descriptionFill(CD.descriptionRepair);
    let url = PREFIX + DETAIL_URL + "/";
    let response = CF.detail(CD.idOne);
    let payload = CF.put({id: CD.idOne, name: CD.nameTwo});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), CATEGORIES_URL);
    });
});

test('when user changes an attribute and clicks cancel, we prompt them with a modal and they hit cancel', (assert) => {
    clearxhr(list_xhr);
    visit(DETAIL_URL);
    page.nameFill(CD.nameTwo);
    generalPage.cancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL);
            assert.ok(generalPage.modalIsVisible());
            assert.equal(find('.t-modal-body').text().trim(), GLOBALMSG.modal_unsaved_msg);
        });
    });
    generalPage.clickModalCancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL);
            assert.equal(find('.t-category-name').val(), CD.nameTwo);
            assert.ok(generalPage.modalIsHidden());
        });
    });
});

test('when click delete, category is deleted and removed from store', (assert) => {
    visit(DETAIL_URL);
    xhr(PREFIX + BASE_URL + '/' + CD.idOne + '/', 'DELETE', null, {}, 204, {});
    generalPage.delete();
    andThen(() => {
        assert.equal(currentURL(), CATEGORIES_URL);
        assert.equal(store.find('category', CD.idOne).get('length'), undefined);
    });
});

test('validation works and when hit save, we do same post', (assert) => {
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.ok(find('.t-name-validation-error').is(':hidden'));
    });
    page.nameFill('');
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.ok(find('.t-name-validation-error').is(':visible'));
    });
    page.descriptionFill('');
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.ok(find('.t-name-validation-error').is(':visible'));
    });
    page.costCodeFill('');
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.ok(find('.t-name-validation-error').is(':visible'));
    });
    page.labelFill('');
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.ok(find('.t-name-validation-error').is(':visible'));
    });
    page.subLabelFill('');
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.ok(find('.t-name-validation-error').is(':visible'));
    });
    page.nameFill(CD.nameOne);
    page.descriptionFill(CD.descriptionMaintenance);
    page.labelFill(CD.labelOne);
    page.costCodeFill(CD.costCodeOne);
    page.subLabelFill(CD.subCatLabelTwo);
    let url = PREFIX + DETAIL_URL + '/';
    let response = CF.detail(CD.idOne);
    let payload = CF.put({id: CD.idOne, name: CD.nameOne, description: CD.descriptionMaintenance,
    label: CD.labelOne, subcategory_label: CD.subCatLabelTwo, cost_amount: CD.costAmountOne, cost_code: CD.costCodeOne});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), CATEGORIES_URL);
    });
});

/* CATEGORY TO CHILDREN */
test('clicking and typing into power select for categories children will fire off xhr request for all categories', (assert) => {
    visit(DETAIL_URL);
    andThen(() => {
        let category = store.find('category', CD.idOne);
        assert.equal(category.get('children_fks').length, 1);
        assert.deepEqual(category.get('children_fks')[0], CD.idChild);
        assert.equal(category.get('has_many_children').get('length'), 1);
    });
    let category_children_endpoint = PREFIX + '/admin/categories/' + '?name__icontains=a&page_size=25';
    xhr(category_children_endpoint, 'GET', null, {}, 200, CF.list());
    page.categoryClickDropdown();
    fillIn(`${CATEGORY_SEARCH}`, 'a');
    andThen(() => {
        assert.equal(page.categoryOptionLength(), PAGE_SIZE+2);
    });
    page.categoryClickOptionThree();
    andThen(() => {
        let category = store.find('category', CD.idOne);
        assert.equal(category.get('children_fks').get('length'), 2);
        assert.equal(page.categoriesSelected(), 2);
    });
    page.categoryClickDropdown();
    fillIn(CATEGORY_SEARCH, '');
    andThen(() => {
        assert.equal(page.categoryOptionLength(), 1);
        assert.equal(find(`${CATEGORY_DROPDOWN} > li:eq(0)`).text().trim(), GLOBALMSG.power_search);
        let category = store.find('category', CD.idOne);
        assert.ok(category.get('isDirtyOrRelatedDirty'));
    });
    let url = PREFIX + DETAIL_URL + '/';
    let response = CF.detail(CD.idOne);
    let payload = CF.put({id: CD.idOne, children: [CD.idChild, CD.idSelected]});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), CATEGORIES_URL);
    });
});

test('when you deep link to the category detail can remove child from category and add same one back', (assert) => {
    visit(DETAIL_URL);
    andThen(() => {
        let category = store.find('category', CD.idOne);
        assert.equal(category.get('children_fks').length, 1);
        assert.equal(category.get('has_many_children').get('length'), 1);
        assert.equal(page.categoriesSelected(), 1);
    });
    page.categoryOneRemove();
    andThen(() => {
        let category = store.find('category', CD.idOne);
        assert.equal(category.get('children_fks').get('length'), 0);
        assert.equal(page.categoriesSelected(), 0);
    });
    let category_children_endpoint = PREFIX + '/admin/categories/' + '?name__icontains=a&page_size=25';
    xhr(category_children_endpoint, 'GET', null, {}, 200, CF.list());
    page.categoryClickDropdown();
    fillIn(`${CATEGORY_SEARCH}`, 'a');
    page.categoryClickOptionThree();
    let url = PREFIX + DETAIL_URL + '/';
    let response = CF.detail(CD.idOne);
    let payload = CF.put({id: CD.idOne, children: [CD.idSelected]});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), CATEGORIES_URL);
    });
});

test('starting with multiple categories, can remove all categories (while not populating options) and add back', (assert) => {
    detail_data.children = [...detail_data.children, CF.get(CD.idThree)];
    detail_data.children[1].name = CD.nameThree;
    visit(DETAIL_URL);
    andThen(() => {
        let category = store.find('category', CD.idOne);
        assert.equal(category.get('has_many_children').get('length'), 2);
        assert.equal(page.categorySelected().indexOf(CD.nameTwo), 2);
        assert.equal(page.categoryTwoSelected().indexOf(CD.nameThree), 2);
    });
    page.categoryOneRemove();
    page.categoryOneRemove();
    andThen(() => {
        let category = store.find('category', CD.idOne);
        assert.equal(category.get('has_many_children').get('length'), 0);
        assert.ok(category.get('isDirtyOrRelatedDirty'));
    });
    let category_children_endpoint = PREFIX + '/admin/categories/' + '?name__icontains=a&page_size=25';
    xhr(category_children_endpoint, 'GET', null, {}, 200, CF.list());
    page.categoryClickDropdown();
    fillIn(CATEGORY_SEARCH, 'a');
    page.categoryClickOptionOneEq();
    andThen(() => {
        let category = store.find('category', CD.idOne);
        assert.equal(category.get('has_many_children').get('length'), 1);
        assert.equal(page.categorySelected().indexOf(`${CD.nameTwo}`), 2);
        assert.ok(category.get('isDirtyOrRelatedDirty'));
    });
    let url = PREFIX + DETAIL_URL + "/";
    let payload = CF.put({id: CD.idOne, children: [CD.idChild]});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), CATEGORIES_URL);
    });
});

test('clicking and typing into power select for categories children will not filter if spacebar pressed', (assert) => {
    visit(DETAIL_URL);
    andThen(() => {
        let category = store.find('category', CD.idOne);
        assert.equal(category.get('children_fks').length, 1);
        assert.equal(category.get('has_many_children').get('length'), 1);
    });
    page.categoryClickDropdown();
    fillIn(`${CATEGORY_SEARCH}`, ' ');
    andThen(() => {
        assert.equal(page.categoryOptionLength(), 1);
        assert.equal(find(CATEGORY_DROPDOWN).text().trim(), GLOBALMSG.no_results);
    });
    andThen(() => {
        let category = store.find('category', CD.idOne);
        assert.equal(category.get('children_fks').get('length'), 1);
        assert.equal(page.categoryOptionLength(), 1);
        assert.equal(find(CATEGORY_DROPDOWN).text().trim(), GLOBALMSG.no_results);
    });
    let url = PREFIX + DETAIL_URL + '/';
    let response = CF.detail(CD.idOne);
    let payload = CF.put({id: CD.idOne, children: [CD.idChild]});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), CATEGORIES_URL);
    });
});
/* END CATEGORY CHILDREN */

test('clicking cancel button will take from detail view to list view', (assert) => {
    clearxhr(detail_xhr);
    visit(CATEGORIES_URL);
    andThen(() => {
        assert.equal(currentURL(), CATEGORIES_URL);
    });
    const detail_data = CF.detail(CD.idGridOne);
    xhr(endpoint + CD.idGridOne + '/', 'GET', null, {}, 200, detail_data);
    click('.t-grid-data:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), GRID_DETAIL_URL);
    });
    generalPage.cancel();
    andThen(() => {
        assert.equal(currentURL(), CATEGORIES_URL);
    });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and they cancel', (assert) => {
    clearxhr(list_xhr);
    visit(DETAIL_URL);
    page.nameFill(CD.nameTwo);
    generalPage.cancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL);
            assert.ok(generalPage.modalIsVisible());
            assert.equal(find('.t-modal-body').text().trim(), 'You have unsaved changes. Are you sure?');
        });
    });
    generalPage.clickModalCancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL);
            assert.equal(find('.t-category-name').val(), CD.nameTwo);
            assert.ok(generalPage.modalIsHidden());
        });
    });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', (assert) => {
    visit(DETAIL_URL);
    page.nameFill(CD.nameTwo);
    page.subLabelFill(CD.subCatLabelOne);
    generalPage.cancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL);
            assert.ok(generalPage.modalIsVisible());
        });
    });
    generalPage.clickModalRollback();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), CATEGORIES_URL);
            let category = store.find('category', CD.idOne);
            assert.equal(category.get('name'), CD.nameOne);
            assert.equal(category.get('subcategory_label'), CD.subCatLabelOne);
        });
    });
});
