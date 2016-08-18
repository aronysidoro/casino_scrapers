import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import { xhr, clearxhr } from 'bsrs-ember/tests/helpers/xhr';
import { waitFor } from 'bsrs-ember/tests/helpers/utilities';
import config from 'bsrs-ember/config/environment';
import random from 'bsrs-ember/models/random';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import AD from 'bsrs-ember/vendor/defaults/assignment';
import AF from 'bsrs-ember/vendor/assignment_fixtures';
import PersonF from 'bsrs-ember/vendor/people_fixtures';
import PD from 'bsrs-ember/vendor/defaults/person';
import PFD from 'bsrs-ember/vendor/defaults/pfilter';
import CF from 'bsrs-ember/vendor/category_fixtures';
import CountryF from 'bsrs-ember/vendor/country_fixtures';
import SF from 'bsrs-ember/vendor/state_fixtures';
import LF from 'bsrs-ember/vendor/location_fixtures';
import LD from 'bsrs-ember/vendor/defaults/location';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import page from 'bsrs-ember/tests/pages/assignment';
import generalPage from 'bsrs-ember/tests/pages/general';
import BASEURLS, { ASSIGNMENT_URL, ASSIGNMENT_LIST_URL, ASSIGNMENT_AVAILABLE_FILTERS_URL, PEOPLE_URL } from 'bsrs-ember/utilities/urls';

const { run } = Ember;
const BASE_URL = BASEURLS.BASE_ASSIGNMENT_URL;
const DETAIL_URL = `${BASE_URL}/${AD.idOne}`;
const API_DETAIL_URL = `${ASSIGNMENT_URL}${AD.idOne}/`;

var store, detailXhr, listXhr;

moduleForAcceptance('Acceptance | assignment detail test', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
    const listData = AF.list();
    listXhr = xhr(`${ASSIGNMENT_URL}?page=1`, 'GET', null, {}, 200, listData);
    const detailData = AF.detail();
    detailXhr = xhr(API_DETAIL_URL, 'GET', null, {}, 200, detailData);
    random.uuid = function() { return UUID.value; };
  },
});

test('by clicking record in list view, User is sent to detail view', assert => {
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), ASSIGNMENT_LIST_URL);
  });
  generalPage.gridItemZeroClick();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
});

test('visit detail and update all fields', assert => {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(page.descriptionValue, AD.descriptionOne);
    assert.equal(page.assigneeInput, AD.fullname);
    assert.equal(find('.t-assignment-pf-select .ember-power-select-selected-item').text().trim(), PFD.keyOne);
    assert.equal(page.prioritySelectedOne.split(/\s+/)[1], TD.priorityOneKey);
  });
  // criteria
  selectChoose('.t-priority-criteria', TD.priorityTwoKey);
  andThen(() => {
    assert.equal(page.prioritySelectedOne.split(/\s+/)[1], TD.priorityOneKey);
    assert.equal(page.prioritySelectedTwo.split(/\s+/)[1], TD.priorityTwoKey);
  });
  // description
  page.descriptionFill(AD.descriptionTwo);
  andThen(() => {
    assert.equal(page.descriptionValue, AD.descriptionTwo);
    const assignment = store.find('assignment', AD.idOne);
    assert.equal(assignment.get('description'), AD.descriptionTwo);
  });
  // assignee
  let keyword = 'Boy1';
  xhr(`${PEOPLE_URL}person__icontains=${keyword}/`, 'GET', null, {}, 200, PersonF.search_power_select());
  selectSearch('.t-assignment-assignee-select', keyword);
  selectChoose('.t-assignment-assignee-select', keyword);
  andThen(() => {
    assert.equal(page.assigneeInput, PD.fullnameBoy);
  });
  xhr(`${ASSIGNMENT_AVAILABLE_FILTERS_URL}`, 'GET', null, {}, 200, AF.list_pfilters());
  page.addFilter();
  selectChoose('.t-assignment-pf-select:eq(1)', PFD.keyTwo);
  keyword = 'a';
  xhr(`/api/admin/locations/location__icontains=${keyword}/?location_level=${PFD.lookupsDynamic.id}`, 'GET', null, {}, 200, LF.search_power_select());
  selectSearch('.t-ticket-location-select', keyword);
  selectChoose('.t-ticket-location-select', LD.storeNameFour);
  andThen(() => {
    assert.equal(page.locationSelectedOne.split(/\s+/)[1], LD.storeNameFour);
  });
  let payload = AF.put({
    description: AD.descriptionTwo,
    assignee: AD.assigneeSelectOne,
    filters: [{
      id: PFD.idOne,
      source: PFD.sourceIdOne,
      criteria: [TD.priorityOneId, TD.priorityTwoId],
      lookups: {}
    }, {
      id: UUID.value,
      source: PFD.sourceIdTwo,
      criteria: [LD.idFour],
      lookups: PFD.lookupsDynamic
    }]
  });
  xhr(API_DETAIL_URL, 'PUT', payload, {}, 200, AF.list());
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), ASSIGNMENT_LIST_URL);
  });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and they cancel', (assert) => {
  clearxhr(listXhr);
  page.visitDetail();
  page.descriptionFill(AD.descriptionTwo);
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(generalPage.modalIsVisible);
      assert.equal(find('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
    });
  });
  generalPage.clickModalCancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.equal(page.descriptionValue, AD.descriptionTwo);
      assert.ok(generalPage.modalIsHidden);
    });
  });
});

test('when user adds a filter and hits cancel they are not prompted with a modal', (assert) => {
  page.visitDetail();
  // a filter is added here, but it's empty, so the Assignment is still considered
  // clean, and can cancel w/o getting the modal prompt.
  andThen(() => {
    assert.equal(store.find('assignment', AD.idOne).get('pf').get('length'), 1);
  });
  page.addFilter();
  andThen(() => {
    assert.equal(store.find('assignment', AD.idOne).get('pf').get('length'), 2);
  });
  generalPage.cancel();
  andThen(() => {
    assert.equal(store.find('assignment', AD.idOne).get('pf').get('length'), 1);
    assert.equal(currentURL(), ASSIGNMENT_LIST_URL);
  });
});

test('add an empty filter and do a PUT, and the empty filter isnt sent and is silently ignored', assert => {
  page.visitDetail();
  andThen(() => {
    assert.equal(store.find('assignment', AD.idOne).get('pf').get('length'), 1);
  });
  page.addFilter();
  andThen(() => {
    assert.equal(store.find('assignment', AD.idOne).get('pf').get('length'), 2);
  });
  let payload = AF.put({
    filters: [{
      id: PFD.idOne,
      source: PFD.sourceIdOne,
      criteria: [TD.priorityOneId],
      lookups: {}
    }]
  });
  xhr(API_DETAIL_URL, 'PUT', payload, {}, 200, AF.list());
  generalPage.save();
  andThen(() => {
    assert.equal(store.find('assignment', AD.idOne).get('pf').get('length'), 1);
    assert.equal(currentURL(), ASSIGNMENT_LIST_URL);
  });
});

test('when user adds a filter and selects an available filter they are prompted with a modal', (assert) => {
  clearxhr(listXhr);
  page.visitDetail();
  page.addFilter();
  xhr(`${ASSIGNMENT_AVAILABLE_FILTERS_URL}`, 'GET', null, {}, 200, AF.list_pfilters());
  selectChoose('.t-assignment-pf-select:eq(1)', PFD.keyTwo);
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(generalPage.modalIsVisible);
      assert.equal(find('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
    });
  });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', (assert) => {
  page.visitDetail();
  page.descriptionFill(AD.descriptionTwo);
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(generalPage.modalIsVisible);
    });
  });
  generalPage.clickModalRollback();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), ASSIGNMENT_LIST_URL);
      var assignment = store.find('assignment', AD.idOne);
      assert.equal(assignment.get('description'), AD.descriptionOne);
    });
  });
});

test('clicking cancel button with no edits will take from detail view to list view', (assert) => {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
  generalPage.cancel();
  andThen(() => {
    assert.equal(currentURL(), ASSIGNMENT_LIST_URL);
  });
});

test('when click delete, modal displays and when click ok, assignment is deleted and removed from store', assert => {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
  generalPage.delete();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(Ember.$('.ember-modal-dialog'));
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.delete.title'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.delete.confirm', {module: 'assignment'}));
      assert.equal(Ember.$('.t-modal-delete-btn').text().trim(), t('crud.delete.button'));
    });
  });
  xhr(`${ASSIGNMENT_URL}${AD.idOne}/`, 'DELETE', null, {}, 204, {});
  generalPage.clickModalDelete();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), ASSIGNMENT_LIST_URL);
      assert.equal(store.find('assignment', AD.idOne).get('length'), undefined);
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});

test('when click delete, and click no modal disappears', assert => {
  clearxhr(listXhr);
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
  generalPage.delete();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(Ember.$('.ember-modal-dialog'));
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.delete.title'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.delete.confirm', {module: 'assignment'}));
      assert.equal(Ember.$('.t-modal-delete-btn').text().trim(), t('crud.delete.button'));
    });
  });
  generalPage.clickModalCancelDelete();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});

test('deep linking with an xhr with a 404 status code will show up in the error component (person)', (assert) => {
  clearxhr(detailXhr);
  clearxhr(listXhr);
  const exception = `This record does not exist.`;
  xhr(`${ASSIGNMENT_URL}${AD.idOne}/`, 'GET', null, {}, 404, {'detail': exception});
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.t-error-message').text(), 'WAT');
  });
});

test('remove filter and save - should stay on page because an assignment must have at least one filter and criteria unless auto-assign', assert => {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
  // criteria is required (unless auto-assign)
  page.filterOnePriorityOneRemove();
  andThen(() => {
    let assignment = store.find('assignment', AD.idOne);
    assert.equal(assignment.get('pf').objectAt(0).get('criteria.length'), 0);
  });
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal($('.validated-input-error-dialog').length, 1);
    assert.equal($('.validated-input-error-dialog').text().trim(), 'errors.assignment.pf.criteria.length');
  });
  // have to have at lease 1 pfilter per assignment
  page.deleteFilter();
  andThen(() => {
    assert.equal(find('.t-del-pf-btn').length, 0);
    let assignment = store.find('assignment', AD.idOne);
    assert.equal(assignment.get('pf').get('length'), 0);
  });
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal($('.validated-input-error-dialog').length, 1);
    assert.equal($('.validated-input-error-dialog').text().trim(), 'errors.assignment.pf.length');
  });
  // add back pfilter w/ 1 criteria to make valid, and save
  xhr(`${ASSIGNMENT_AVAILABLE_FILTERS_URL}`, 'GET', null, {}, 200, AF.list_pfilters());
  page.addFilter();
  selectChoose('.t-assignment-pf-select:eq(0)', PFD.keyOne);
  selectChoose('.t-priority-criteria', TD.priorityOneKey);
  andThen(() => {
    assert.equal(page.prioritySelectedOne.split(/\s+/)[1], TD.priorityOneKey);
  });
  let payload = AF.put({
    description: AD.descriptionOne,
    assignee: AD.assigneeOne,
    filters: [{
      id: UUID.value,
      source: PFD.sourceIdOne,
      criteria: [TD.priorityOneId],
      lookups: {}
    }]
  });
  xhr(API_DETAIL_URL, 'PUT', payload, {}, 200, AF.list());
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), ASSIGNMENT_LIST_URL);
  });
});

test('add filter, add criteria, remove filter, cancel', assert => {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
  xhr(`${ASSIGNMENT_AVAILABLE_FILTERS_URL}`, 'GET', null, {}, 200, AF.list_pfilters());
  page.addFilter();
  selectChoose('.t-assignment-pf-select:eq(1)', PFD.keyTwo);
  const keyword = 'a';
  xhr(`/api/admin/locations/location__icontains=${keyword}/?location_level=${PFD.lookupsDynamic.id}`, 'GET', null, {}, 200, LF.search_power_select());
  selectSearch('.t-ticket-location-select', keyword);
  selectChoose('.t-ticket-location-select', LD.storeNameFour);
  andThen(() => {
    assert.equal(page.locationSelectedOne.split(/\s+/)[1], LD.storeNameFour);
    assert.equal(find('.t-del-pf-btn').length, 2);
  });
  page.deleteFilterTwo();
  andThen(() => {
    assert.equal(find('.t-del-pf-btn').length, 1);
    assert.equal(page.prioritySelectedOne.split(/\s+/)[1], TD.priorityOneKey);
  });
  generalPage.cancel();
  andThen(() => {
    assert.equal(currentURL(), ASSIGNMENT_LIST_URL);
  });
});

test('select auto_assign filter and update assignment', assert => {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.t-assignment-pf-select .ember-power-select-selected-item').text().trim(), PFD.keyOne);
    assert.equal(page.prioritySelectedOne.split(/\s+/)[1], TD.priorityOneKey);
  });
  // replace existing filter w/ 'auto_assign' filter
  // this also tests that if there's an existing, the existing is removed n replaced on the model.pf array
  xhr(`${ASSIGNMENT_AVAILABLE_FILTERS_URL}`, 'GET', null, {}, 200, AF.list_pfilters());
  selectChoose('.t-assignment-pf-select:eq(0)', PFD.autoAssignKey);
  let payload = AF.put({
    description: AD.descriptionOne,
    assignee: AD.assigneeOne,
    filters: [{
      id: PFD.idOne,
      source: PFD.sourceIdThree,
      criteria: [],
      lookups: {}
    }]
  });
  xhr(API_DETAIL_URL, 'PUT', payload, {}, 200, AF.list());
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), ASSIGNMENT_LIST_URL);
  });
});

test('select category filter and update assignment', assert => {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.t-assignment-pf-select .ember-power-select-selected-item').text().trim(), PFD.keyOne);
    assert.equal(page.prioritySelectedOne.split(/\s+/)[1], TD.priorityOneKey);
  });
  xhr(`${ASSIGNMENT_AVAILABLE_FILTERS_URL}`, 'GET', null, {}, 200, AF.list_pfilters());
  selectChoose('.t-assignment-pf-select:eq(0)', PFD.categoryKey);
  andThen(() => {
    assert.equal(find('.ember-power-select-trigger-multiple-input:eq(0)').get(0)['placeholder'], 'admin.placeholder.available_filter.category');
  });
  const keyword = 'a';
  const response = CF.list_power_select_id_name();
  const firstItemId = response.results[0]['id'];
  const firstItemName = response.results[0]['name'];
  xhr(`/api/admin/categories/assignment-criteria/${keyword}/`, 'GET', null, {}, 200, response);
  selectSearch('.t-ticket-category-select', keyword);
  selectChoose('.t-ticket-category-select', firstItemName);
  andThen(() => {
    assert.equal(page.categorySelectedOne.split(/\s+/)[1], firstItemName);
  });
  let payload = AF.put({
    description: AD.descriptionOne,
    assignee: AD.assigneeOne,
    filters: [{
      id: PFD.idOne,
      source: PFD.sourceIdFour,
      criteria: [firstItemId],
      lookups: {}
    }]
  });
  xhr(API_DETAIL_URL, 'PUT', payload, {}, 200, AF.list());
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), ASSIGNMENT_LIST_URL);
  });
});

test('select state filter and update assignment', assert => {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.t-assignment-pf-select .ember-power-select-selected-item').text().trim(), PFD.keyOne);
    assert.equal(page.prioritySelectedOne.split(/\s+/)[1], TD.priorityOneKey);
  });
  xhr(`${ASSIGNMENT_AVAILABLE_FILTERS_URL}`, 'GET', null, {}, 200, AF.list_pfilters());
  selectChoose('.t-assignment-pf-select:eq(0)', PFD.stateKey);
  andThen(() => {
    assert.equal(find('.ember-power-select-trigger-multiple-input:eq(0)').get(0)['placeholder'], 'admin.placeholder.available_filter.state');
  });
  const keyword = 'a';
  const response = SF.list_power_select();
  const firstItemId = response.results[0]['id'];
  const firstItemName = response.results[0]['name'];
  xhr(`/api/states/tenant/?search=${keyword}`, 'GET', null, {}, 200, response);
  selectSearch('.t-ticket-state-select', keyword);
  selectChoose('.t-ticket-state-select', firstItemName);
  andThen(() => {
    assert.equal(page.stateSelectedOne.split(/\s+/)[1], firstItemName);
  });
  let payload = AF.put({
    description: AD.descriptionOne,
    assignee: AD.assigneeOne,
    filters: [{
      id: PFD.idOne,
      source: PFD.sourceIdFive,
      criteria: [firstItemId],
      lookups: {}
    }]
  });
  xhr(API_DETAIL_URL, 'PUT', payload, {}, 200, AF.list());
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), ASSIGNMENT_LIST_URL);
  });
});

test('select country filter and update assignment', assert => {
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.t-assignment-pf-select .ember-power-select-selected-item').text().trim(), PFD.keyOne);
    assert.equal(page.prioritySelectedOne.split(/\s+/)[1], TD.priorityOneKey);
  });
  xhr(`${ASSIGNMENT_AVAILABLE_FILTERS_URL}`, 'GET', null, {}, 200, AF.list_pfilters());
  selectChoose('.t-assignment-pf-select:eq(0)', PFD.countryKey);
  andThen(() => {
    assert.equal(find('.ember-power-select-trigger-multiple-input:eq(0)').get(0)['placeholder'], 'admin.placeholder.available_filter.country');
  });
  const keyword = 'a';
  const response = CountryF.list_power_select();
  const firstItemId = response.results[0]['id'];
  const firstItemName = response.results[0]['name'];
  xhr(`/api/countries/tenant/?search=${keyword}`, 'GET', null, {}, 200, response);
  selectSearch('.t-ticket-country-select', keyword);
  selectChoose('.t-ticket-country-select', firstItemName);
  andThen(() => {
    assert.equal(page.countrySelectedOne.split(/\s+/)[1], firstItemName);
  });
  let payload = AF.put({
    description: AD.descriptionOne,
    assignee: AD.assigneeOne,
    filters: [{
      id: PFD.idOne,
      source: PFD.sourceIdSix,
      criteria: [firstItemId],
      lookups: {}
    }]
  });
  xhr(API_DETAIL_URL, 'PUT', payload, {}, 200, AF.list());
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), ASSIGNMENT_LIST_URL);
  });
});
