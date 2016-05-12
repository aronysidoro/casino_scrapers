import Ember from 'ember';
const { run } = Ember;
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import config from 'bsrs-ember/config/environment';
import LD from 'bsrs-ember/vendor/defaults/location';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import DT from 'bsrs-ember/vendor/defaults/dtd';
import TICKET from 'bsrs-ember/vendor/defaults/ticket';
import TA_FIXTURES from 'bsrs-ember/vendor/ticket_activity_fixtures';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import DTF from 'bsrs-ember/vendor/dtd_fixtures';
import FD from 'bsrs-ember/vendor/defaults/field';
import LINK from 'bsrs-ember/vendor/defaults/link';
import OD from 'bsrs-ember/vendor/defaults/option';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import random from 'bsrs-ember/models/random';
import page from 'bsrs-ember/tests/pages/dtd';
import dtPage from 'bsrs-ember/tests/pages/dt';
import generalPage from 'bsrs-ember/tests/pages/general';
import ticketPage from 'bsrs-ember/tests/pages/tickets';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_dt_url;//Routing
const DTD_URL = BASEURLS.base_dtd_url;//Request
const TICKET_URL = BASEURLS.base_tickets_url;//Ticket
const DETAIL_URL = `${BASE_URL}/${DT.idOne}/ticket/${TD.idOne}`;
const TICKET_DETAIL_URL = `${TICKET_URL}/${TD.idOne}`;
const DEST_URL = `${BASE_URL}/${DT.idTwo}/ticket/${TD.idOne}`;
const DTD_THREE_URL = `${BASE_URL}/${DT.idThree}/ticket/${TD.idOne}`;
const TICKET_PATCH_URL = `${PREFIX}/dt/${DT.idTwo}/ticket/`;

let application, store, endpoint, original_uuid, link, dtd, dt_path, returned_ticket;

module('Acceptance | dt detail', {
  beforeEach() {
    application = startApp();
    store = application.__container__.lookup('service:simpleStore');
    endpoint = `${PREFIX}${BASE_URL}/${DT.idOne}/ticket/?ticket=${TD.idOne}`;
    dtd = store.find('dtd', DT.idOne);
    original_uuid = random.uuid;
    random.uuid = function() { return TD.idOne; };
    /*
     * ticket object is used for current ticket and dt_path object
     * dt_path is previous state of ticket && dtd state
     * returned_ticket is the ticket w/ the dt_path, which will be different and is returned on a get requests
     * current store state of ticket hasSaved: true in order to force patch requests and relationships setup b/c ticket one
     * all tests are assuming deep linking (i.e. clicking from ticket detail)
     * dt_path dtd has idThree by chance.  Just need to give it something
     */
    const ticket = {
      id: TD.idOne,
      requester: TD.requesterOne,
      location: LD.idOne,
      status: TD.statusZeroId,
      priority: TD.priorityZeroId,
      categories: [],
      cc: [],
      attachments: [],
    };
    dt_path = [{
      ticket,
      dtd: {
        id: DT.idThree
      }
    }];
    returned_ticket = TF.detail(TD.idOne, null, dt_path);
    run(() => {
      store.push('ticket', {id: ticket.id, hasSaved: true});
    });
  },
  afterEach() {
    random.uuid = original_uuid;
    Ember.run(application, 'destroy');
  }
});

/* jshint ignore:start */

test('decision tree displays data and can click to next destination after updating option (patch ticket)', async assert => {
  const detail_data = DTF.detail(DT.idOne);
  detail_data.fields[0].required = true;
  const detail_xhr = xhr(endpoint, 'GET', null, {}, 200, {dtd: detail_data, ticket: returned_ticket});
  await visit(DETAIL_URL);
  assert.equal(currentURL(), DETAIL_URL);
  assert.ok(find('.t-dtd-preview-btn').attr('disabled'));
  await page.fieldClickCheckboxOne();
  assert.notOk(find('.t-dtd-preview-btn').attr('disabled'));
  const ticket = store.find('ticket', TD.idOne);
  const checkbox_ticket_value = `${FD.labelOne}: ${OD.textOne}`
  const requestValue = `${TD.requestOne}, ${checkbox_ticket_value}`;
  assert.deepEqual(ticket.get('requestValues'), [TD.requestOne, checkbox_ticket_value]);
  assert.equal(ticket.get('request'), requestValue);
  assert.equal(ticket.get('dt_path')[0]['dtd']['id'], DT.idThree);
  assert.equal(ticket.get('dt_path')[0]['ticket']['request'], undefined);
  assert.equal(ticket.get('dt_path')[0]['ticket']['location'], LD.idOne);
  assert.equal(ticket.get('dt_path')[0]['ticket']['status'], TD.statusZeroId);
  assert.equal(ticket.get('dt_path')[0]['ticket']['priority'], TD.priorityZeroId);
  assert.equal(ticket.get('status.id'), TD.statusOneId);
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), DT.idTwo);
  let dtd_payload = DTF.generate(DT.idTwo);
  const link = dtd.get('links').objectAt(0);
  let ticket_payload = { id: TD.idOne, priority: LINK.priorityOne, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id'), request: requestValue };
  xhr(TICKET_PATCH_URL, 'PATCH', JSON.stringify(ticket_payload), {}, 200, dtd_payload);
  await page.clickNextBtn();
  assert.equal(currentURL(), DEST_URL);
  assert.equal(ticket.get('dt_path')[0]['dtd']['id'], DT.idThree);
  assert.equal(ticket.get('dt_path')[0]['ticket']['request'], undefined);
  assert.equal(ticket.get('dt_path')[0]['ticket']['location'], LD.idOne);
  assert.equal(ticket.get('dt_path')[1]['dtd']['id'], DT.idOne);
  assert.equal(ticket.get('dt_path')[1]['ticket']['request'], requestValue);
  assert.equal(ticket.get('dt_path')[1]['ticket']['location'], LD.idOne);
  assert.equal(ticket.get('status.id'), TD.statusOneId);
  assert.equal(ticket.get('dt_path')[1]['ticket']['status'], TD.statusOneId);
  assert.equal(ticket.get('dt_path')[1]['ticket']['priority'], TD.priorityOneId);
});

test('updating field text (patch ticket)', async assert => {
  const detail_data = DTF.detail(DT.idOne);
  detail_data['fields'][0]['type'] = FD.typeOne;
  const detail_xhr = xhr(endpoint, 'GET', null, {}, 200, {dtd: detail_data, ticket: returned_ticket});
  await visit(DETAIL_URL);
  assert.equal(currentURL(), DETAIL_URL);
  await fillIn('.t-dtd-field-text:eq(0)', 'wat');
  const LETTER_W = {keyCode: 87};
  await triggerEvent('.t-dtd-field-text:eq(0)', 'keyup', LETTER_W);
  const ticket = store.find('ticket', TD.idOne);
  const requestValue = `${TD.requestOne}, ${FD.labelOne}: wat`;
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), DT.idTwo);
  assert.equal(dtd.get('fields').objectAt(0).get('type'), FD.typeOne);
  let dtd_payload = DTF.generate(DT.idTwo);
  const link = dtd.get('links').objectAt(0);
  let ticket_payload = { id: TD.idOne, priority: LINK.priorityOne, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id'), request: requestValue };
  xhr(TICKET_PATCH_URL, 'PATCH', JSON.stringify(ticket_payload), {}, 200, dtd_payload);
  await page.clickNextBtn();
  assert.equal(currentURL(), DEST_URL);
});

test('updating field text no label (patch ticket)', async assert => {
  const detail_data = DTF.detail(DT.idOne);
  detail_data['fields'][0]['type'] = FD.typeOne;
  detail_data['fields'][0]['label'] = undefined;
  const detail_xhr = xhr(endpoint, 'GET', null, {}, 200, {dtd: detail_data, ticket: returned_ticket});
  await visit(DETAIL_URL);
  assert.equal(currentURL(), DETAIL_URL);
  await fillIn('.t-dtd-field-text:eq(0)', 'wat');
  const LETTER_W = {keyCode: 87};
  await triggerEvent('.t-dtd-field-text:eq(0)', 'keyup', LETTER_W);
  const ticket = store.find('ticket', TD.idOne);
  const requestValue = `${TD.requestOne}, wat`;
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), DT.idTwo);
  assert.equal(dtd.get('fields').objectAt(0).get('type'), FD.typeOne);
  let dtd_payload = DTF.generate(DT.idTwo);
  const link = dtd.get('links').objectAt(0);
  let ticket_payload = { id: TD.idOne, priority: LINK.priorityOne, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id'), request: requestValue };
  xhr(TICKET_PATCH_URL, 'PATCH', JSON.stringify(ticket_payload), {}, 200, dtd_payload);
  await page.clickNextBtn();
  assert.equal(currentURL(), DEST_URL);
});

test('updating field number (patch ticket)', async assert => {
  const detail_data = DTF.detail(DT.idOne);
  detail_data['fields'][0]['type'] = FD.typeTwo;
  detail_data['fields'][0]['label'] = FD.labelTwo;
  const detail_xhr = xhr(endpoint, 'GET', null, {}, 200, {dtd: detail_data, ticket: returned_ticket});
  await visit(DETAIL_URL);
  assert.equal(currentURL(), DETAIL_URL);
  await fillIn('.t-dtd-field-number:eq(0)', 92);
  const NUMBER = {keyCode: 57};
  await triggerEvent('.t-dtd-field-number:eq(0)', 'keyup', NUMBER);
  const ticket = store.find('ticket', TD.idOne);
  const requestValue = `${TD.requestOne}, ${FD.labelTwo}: 92`;
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), DT.idTwo);
  assert.equal(dtd.get('fields').objectAt(0).get('type'), FD.typeTwo);
  let dtd_payload = DTF.generate(DT.idTwo);
  const link = dtd.get('links').objectAt(0);
  let ticket_payload = { id: TD.idOne, priority: LINK.priorityOne, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id'), request: requestValue };
  xhr(TICKET_PATCH_URL, 'PATCH', JSON.stringify(ticket_payload), {}, 200, dtd_payload);
  await page.clickNextBtn();
  assert.equal(currentURL(), DEST_URL);
});

test('updating field textarea (patch ticket)', async assert => {
  const detail_data = DTF.detail(DT.idOne);
  detail_data['fields'][0]['type'] = FD.typeThree;
  detail_data['fields'][0]['label'] = FD.labelThree;
  const detail_xhr = xhr(endpoint, 'GET', null, {}, 200, {dtd: detail_data, ticket: returned_ticket});
  await visit(DETAIL_URL);
  assert.equal(currentURL(), DETAIL_URL);
  await fillIn('.t-dtd-field-textarea:eq(0)', 'wat');
  const LETTER_W = {keyCode: 87};
  await triggerEvent('.t-dtd-field-textarea:eq(0)', 'keyup', LETTER_W);
  const ticket = store.find('ticket', TD.idOne);
  const requestValue = `${TD.requestOne}, ${FD.labelThree}: wat`;
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), DT.idTwo);
  assert.equal(dtd.get('fields').objectAt(0).get('type'), FD.typeThree);
  let dtd_payload = DTF.generate(DT.idTwo);
  const link = dtd.get('links').objectAt(0);
  let ticket_payload = { id: TD.idOne, priority: LINK.priorityOne, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id'), request: requestValue };
  xhr(TICKET_PATCH_URL, 'PATCH', JSON.stringify(ticket_payload), {}, 200, dtd_payload);
  await page.clickNextBtn();
  assert.equal(currentURL(), DEST_URL);
});

test('updating field select (patch ticket)', async assert => {
  const detail_data = DTF.detail(DT.idOne);
  detail_data['fields'][0]['type'] = FD.typeFour;
  detail_data['fields'][0]['label'] = FD.labelFour;
  const detail_xhr = xhr(endpoint, 'GET', null, {}, 200, {dtd: detail_data, ticket: returned_ticket});
  await visit(DETAIL_URL);
  assert.equal(currentURL(), DETAIL_URL);
  await page.selectClickDropdown()
    .selectOneOption();
  const ticket = store.find('ticket', TD.idOne);
  const requestValue = `${TD.requestOne}, ${FD.labelFour}: ${OD.textOne}`;
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), DT.idTwo);
  assert.equal(dtd.get('fields').objectAt(0).get('type'), FD.typeFour);
  assert.equal(page.selectOneValue, OD.textOne);
  let dtd_payload = DTF.generate(DT.idTwo);
  const link = dtd.get('links').objectAt(0);
  let ticket_payload = { id: TD.idOne, priority: LINK.priorityOne, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id'), request: requestValue };
  xhr(TICKET_PATCH_URL, 'PATCH', JSON.stringify(ticket_payload), {}, 200, dtd_payload);
  await page.clickNextBtn();
  assert.equal(currentURL(), DEST_URL);
});

test('can\'t click to next destination if field is required (patch ticket)', async assert => {
  const detail_data = DTF.detail(DT.idOne);
  detail_data['fields'][0]['type'] = FD.typeThree;
  detail_data['fields'][0]['label'] = FD.labelThree;
  detail_data['fields'][0]['required'] = FD.requiredTwo;
  const detail_xhr = xhr(endpoint, 'GET', null, {}, 200, {dtd: detail_data, ticket: returned_ticket});
  await visit(DETAIL_URL);
  assert.equal(currentURL(), DETAIL_URL);
  assert.ok(find('.t-dtd-preview-btn').attr('disabled'));
  await fillIn('.t-dtd-field-textarea:eq(0)', 'wat');
  const LETTER_W = {keyCode: 87};
  await triggerEvent('.t-dtd-field-textarea:eq(0)', 'keyup', LETTER_W);
  assert.equal(find('.t-dtd-preview-btn').attr('disabled'), undefined);
  await fillIn('.t-dtd-field-textarea:eq(0)', 'wats');
  const LETTER_S = {keyCode: 83};
  await triggerEvent('.t-dtd-field-textarea:eq(0)', 'keyup', LETTER_S);
  assert.equal(find('.t-dtd-preview-btn').attr('disabled'), undefined);
  const ticket = store.find('ticket', TD.idOne);
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), DT.idTwo);
  assert.equal(dtd.get('fields').objectAt(0).get('type'), FD.typeThree);
  let dtd_payload = DTF.generate(DT.idTwo);
  const link = dtd.get('links').objectAt(0);
  const requestValue = `${TD.requestOne}, ${FD.labelThree}: wats`;
  let ticket_payload = { id: TD.idOne, request: requestValue, priority: LINK.priorityOne, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id') };
  xhr(TICKET_PATCH_URL, 'PATCH', JSON.stringify(ticket_payload), {}, 200, dtd_payload);
  await page.clickNextBtn();
  assert.equal(currentURL(), DEST_URL);
});

test('can click to next destination if field is not required and don\'t fill in field value (patch ticket)', async assert => {
  const detail_data = DTF.detail(DT.idOne);
  detail_data['fields'][0]['type'] = FD.typeThree;
  detail_data['fields'][0]['label'] = FD.labelThree;
  detail_data['fields'][0]['required'] = FD.requiredOne;
  const detail_xhr = xhr(endpoint, 'GET', null, {}, 200, {dtd: detail_data, ticket: returned_ticket});
  await visit(DETAIL_URL);
  assert.equal(currentURL(), DETAIL_URL);
  assert.equal(find('.t-dtd-preview-btn').attr('disabled'), undefined);
  let dtd_payload = DTF.generate(DT.idTwo);
  const link = dtd.get('links').objectAt(0);
  let ticket_payload = { id: TD.idOne, priority: LINK.priorityOne, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id'), request: TD.requestOne };
  xhr(TICKET_PATCH_URL, 'PATCH', JSON.stringify(ticket_payload), {}, 200, dtd_payload);
  await page.clickNextBtn();
  assert.equal(currentURL(), DEST_URL);
});

test('can click to next destination after updating multiple fields select (patch ticket)', async assert => {
  const detail_data = DTF.detail(DT.idOne);
  detail_data['fields'][0]['type'] = FD.typeOne;
  detail_data['fields'][0]['label'] = FD.labelFour;
  detail_data.fields.push({
    id: FD.idTwo,
    label: 'another',
    type: FD.typeOne,
    required: FD.requiredOne,
    order: FD.orderOne,
    options: [{
      id: OD.idOne,
      text: OD.textOne,
      order: OD.orderOne
    }]
  });
  const detail_xhr = xhr(endpoint, 'GET', null, {}, 200, {dtd: detail_data, ticket: returned_ticket});
  await visit(DETAIL_URL);
  const ticket = store.find('ticket', TD.idOne);
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), DT.idTwo);
  assert.equal(dtd.get('fields').objectAt(0).get('type'), FD.typeOne);
  assert.equal(dtd.get('fields').objectAt(1).get('type'), FD.typeOne);
  assert.equal(currentURL(), DETAIL_URL);
  await fillIn('.t-dtd-field-text:eq(0)', 'wat');
  const LETTER_W = {keyCode: 87};
  await triggerEvent('.t-dtd-field-text:eq(0)', 'keyup', LETTER_W);
  await fillIn('.t-dtd-field-text:eq(1)', 'sat');
  const LETTER_S = {keyCode: 83};
  await triggerEvent('.t-dtd-field-text:eq(1)', 'keyup', LETTER_W);
  const requestValue = `${TD.requestOne}, ${FD.labelFour}: wat`, requestValueTwo = 'another: sat'; 
  let dtd_payload = DTF.generate(DT.idTwo);
  const joinedRequest = `${requestValue}, ${requestValueTwo}`;
  const link = dtd.get('links').objectAt(0);
  let ticket_payload = { id: TD.idOne, priority: LINK.priorityOne, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id'), request: joinedRequest };
  xhr(TICKET_PATCH_URL, 'PATCH', JSON.stringify(ticket_payload), {}, 200, dtd_payload);
  await page.clickNextBtn();
  assert.equal(currentURL(), DEST_URL);
});

test('fill out: number, text, textarea, and select (patch ticket)', async assert => {
  let detail_data = DTF.detailWithAllFields(DT.idOne);
  const detail_xhr = xhr(endpoint, 'GET', null, {}, 200, {dtd: detail_data, ticket: returned_ticket});
  await visit(DETAIL_URL);
  assert.equal(currentURL(), DETAIL_URL);
  // checkbox
  dtPage.fieldOneCheckboxCheck();
  // number
  await fillIn('.t-dtd-field-number:eq(0)', 92);
  const NUMBER = {keyCode: 57};
  await triggerEvent('.t-dtd-field-number:eq(0)', 'keyup', NUMBER);
  // text
  await fillIn('.t-dtd-field-text:eq(0)', 'wat');
  const LETTER_W = {keyCode: 87};
  await triggerEvent('.t-dtd-field-text:eq(0)', 'keyup', LETTER_W);
  // textarea
  assert.equal(currentURL(), DETAIL_URL);
  await fillIn('.t-dtd-field-textarea:eq(0)', '123 St.');
  await triggerEvent('.t-dtd-field-textarea:eq(0)', 'keyup', LETTER_W);
  const ticket = store.find('ticket', TD.idOne);
  const requestValue = `${TD.requestOne}, ${FD.labelOne}: yes, ${FD.labelFour}: wat, ${FD.labelTwo}: 92, ${FD.labelThree}: 123 St.`;
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), DT.idTwo);
  assert.equal(dtd.get('fields').objectAt(0).get('type'), FD.typeSix);
  let dtd_payload = DTF.generate(DT.idTwo);
  const link = dtd.get('links').objectAt(0);
  let ticket_payload = { id: TD.idOne, request: requestValue, priority: LINK.priorityOne, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id') };
  xhr(TICKET_PATCH_URL, 'PATCH', JSON.stringify(ticket_payload), {}, 200, dtd_payload);
  await page.clickNextBtn();
  assert.equal(currentURL(), DEST_URL);
});

test('if dt_path length is 1 and deep link, wont push another dt_path object in (deep linking from old decision tree)', async assert => {
  let detail_data = DTF.detailWithAllFields(DT.idOne);
  returned_ticket.dt_path[0]['dtd'] = {id: DT.idOne, description: 'Start'};
  const detail_xhr = xhr(endpoint, 'GET', null, {}, 200, {dtd: detail_data, ticket: returned_ticket});
  await visit(DETAIL_URL);
  assert.equal(find('.t-dt-breadcrumb:eq(0)').text().trim(), substringBreadcrumb('Start'));
  assert.ok(find('.t-ticket-breadcrumb-back:eq(0)').hasClass('active'));
  let dtd_payload = DTF.generate(DT.idTwo);
  const link = dtd.get('links').objectAt(0);
  let ticket_payload = { id: TD.idOne, request: TD.requestOne, priority: LINK.priorityOne, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id') };
  xhr(TICKET_PATCH_URL, 'PATCH', JSON.stringify(ticket_payload), {}, 200, dtd_payload);
  await page.clickNextBtn();
  const ticket = store.find('ticket', TD.idOne);
  assert.equal(ticket.get('dt_path').length, 1);
});

test('will show breadcrumbs if description present', async assert => {
  let detail_data = DTF.detailWithAllFields(DT.idOne);
  returned_ticket.dt_path[0]['dtd'] = {id: DT.idThree, description: 'Start'};
  const detail_xhr = xhr(endpoint, 'GET', null, {}, 200, {dtd: detail_data, ticket: returned_ticket});
  await visit(DETAIL_URL);
  assert.equal(find('.t-dt-breadcrumb:eq(0)').text().trim(), substringBreadcrumb('Start'));
});

test('will show breadcrumbs if prompt present', async assert => {
  let detail_data = DTF.detailWithAllFields(DT.idOne);
  returned_ticket.dt_path[0]['dtd'] = {id: DT.idThree, prompt: DT.promptOne};
  const detail_xhr = xhr(endpoint, 'GET', null, {}, 200, {dtd: detail_data, ticket: returned_ticket});
  await visit(DETAIL_URL);
  assert.equal(find('.t-dt-breadcrumb:eq(0)').text().trim(), substringBreadcrumb(DT.promptOne));
});

test('will show breadcrumbs if note present', async assert => {
  let detail_data = DTF.detailWithAllFields(DT.idOne);
  returned_ticket.dt_path[0]['dtd'] = {id: DT.idThree, note: DT.noteOne};
  const detail_xhr = xhr(endpoint, 'GET', null, {}, 200, {dtd: detail_data, ticket: returned_ticket});
  await visit(DETAIL_URL);
  assert.equal(find('.t-dt-breadcrumb:eq(0)').text().trim(), substringBreadcrumb(DT.noteOne));
});

test('can click back on breadcrumb and ticket updates dtd_path', async assert => {
  let detail_data = DTF.detailWithAllFields(DT.idOne);
  returned_ticket.dt_path[0]['dtd'] = {id: DT.idThree, description: DT.descriptionOne};
  const detail_xhr = xhr(endpoint, 'GET', null, {}, 200, {dtd: detail_data, ticket: returned_ticket});
  await visit(DETAIL_URL);
  assert.equal(find('.t-dt-breadcrumb:eq(0)').text().trim(), substringBreadcrumb(DT.descriptionOne));
  const detail_data_3 = DTF.detailWithAllFields(DT.idThree);
  const endpoint_3 = `${PREFIX}${BASE_URL}/${DT.idThree}/ticket/?ticket=${TD.idOne}`;
  xhr(endpoint_3, 'GET', null, {}, 200, {dtd: detail_data_3, ticket: returned_ticket});
  await click('.t-ticket-breadcrumb-back');
  assert.equal(currentURL(), DTD_THREE_URL);
});

test('navigating away from start page will save data', async assert => {
  let detail_data = DTF.detailWithAllFields(DT.idOne);
  returned_ticket.dt_path[0]['dtd'] = {id: DT.idThree, description: 'Start'};
  const detail_xhr = xhr(endpoint, 'GET', null, {}, 200, {dtd: detail_data, ticket: returned_ticket});
  await visit(DETAIL_URL);
  // checkbox
  await dtPage.fieldOneCheckboxCheck();
  const updated_ticket = store.find('ticket', TD.idOne);
  assert.equal(updated_ticket.get('request'), `${TD.requestOne}, name: ${OD.textOne}`);
  assert.deepEqual(updated_ticket.get('requestValues'), [TD.requestOne, `name: ${OD.textOne}`]);
  assert.equal(find('.t-dt-breadcrumb:eq(0)').text().trim(), substringBreadcrumb('Start'));
  // const ticket_detail_data = TF.detail(TD.idOne);
  // xhr(`${PREFIX}${TICKET_URL}/${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.empty());
  // xhr(`${PREFIX}${TICKET_URL}/${TD.idOne}/`, 'GET', null, {}, 200, ticket_detail_data);
  // await visit(TICKET_DETAIL_URL);
  // assert.equal(currentURL(), `${TICKET_URL}/${TD.idOne}`);
});

//multiple pages

/* jshint ignore:end */
