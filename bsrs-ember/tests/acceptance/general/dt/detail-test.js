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
import DT from 'bsrs-ember/vendor/defaults/dtd';
import TICKET from 'bsrs-ember/vendor/defaults/ticket';
import DTF from 'bsrs-ember/vendor/dtd_fixtures';
import FD from 'bsrs-ember/vendor/defaults/field';
import OD from 'bsrs-ember/vendor/defaults/option';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import random from 'bsrs-ember/models/random';
import page from 'bsrs-ember/tests/pages/dtd';
import generalPage from 'bsrs-ember/tests/pages/general';
import ticketPage from 'bsrs-ember/tests/pages/tickets';
import {isDisabledElement, isNotDisabledElement} from 'bsrs-ember/tests/helpers/disabled';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_dt_url;//Routing
const DTD_URL = BASEURLS.base_dtd_url;//Request
const TICKET_URL = BASEURLS.base_tickets_url;//Ticket
const DETAIL_URL = `${BASE_URL}/${DT.idOne}`;
const DEST_URL = `${BASE_URL}/${DT.idTwo}`;
const TICKET_POST_URL = `${PREFIX}${TICKET_URL}/${DT.idTwo}/dt/`;
const TICKET_PATCH_URL = `${PREFIX}${TICKET_URL}/${DT.idTwo}/dt/`;
// const DT_PUT_URL = `${PREFIX}${DETAIL_URL}/`;
// const BACKSPACE = {keyCode: 8};
// const DT_ERROR_URL = BASEURLS.dtd_error_url;
// const PAGE_SIZE = config.APP.PAGE_SIZE;

let application, store, endpoint, original_uuid;

module('scott Acceptance | dt detail', {
  beforeEach() {
    application = startApp();
    store = application.__container__.lookup('store:main');
    endpoint = `${PREFIX}${DTD_URL}/`;
    original_uuid = random.uuid;
    random.uuid = function() { return UUID.value; };
  },
  afterEach() {
    random.uuid = original_uuid;
    Ember.run(application, 'destroy');
  }
});

/* jshint ignore:start */

test('decision tree displays data and can click to next destination (post ticket)', async assert => {
  const detail_data = DTF.detail(DT.idOne);
  const detail_xhr = xhr(`${endpoint}${DT.idOne}/`, 'GET', null, {}, 200, detail_data);
  await visit(DETAIL_URL);
  assert.equal(currentURL(), DETAIL_URL);
  await page.fieldClickCheckboxOne();
  const ticket = store.find('ticket', UUID.value);
  assert.deepEqual(ticket.get('requestValues'), [`${FD.labelOne}: ${OD.textOne}`]);
  assert.equal(ticket.get('request'), `${FD.labelOne}: ${OD.textOne}`);
  //TODO: need to include location in here, requestor
  let dtd_payload = DTF.generate(DT.idTwo);
  dtd_payload = { ...dtd_payload, target_id: UUID.value };
  let ticket_payload = { id: UUID.value, request: `name: ${OD.textOne}`, cc: [], categories: [], attachments: [] };
  xhr(TICKET_POST_URL, 'POST', JSON.stringify(ticket_payload), {}, 201, Ember.$.extend(true, {}, dtd_payload));
  await page.clickNextBtn();
});

test('decision tree displays data and can click to next destination after updating option (patch ticket)', async assert => {
  run(() => {
    store.push('ticket', {id: UUID.value, new_pk: DT.idOne})
  });
  const detail_data = DTF.detail(DT.idOne);
  const detail_xhr = xhr(`${endpoint}${DT.idOne}/`, 'GET', null, {}, 200, detail_data);
  await visit(DETAIL_URL);
  assert.equal(currentURL(), DETAIL_URL);
  await page.fieldClickCheckboxOne();
  const ticket = store.find('ticket', UUID.value);
  const dtd = store.find('dtd', DT.idOne);
  assert.deepEqual(ticket.get('requestValues'), [`${FD.labelOne}: ${OD.textOne}`]);
  assert.equal(ticket.get('request'), `name: ${OD.textOne}`);
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), DT.idTwo);
  let dtd_payload = DTF.generate(DT.idTwo);
  dtd_payload = { ...dtd_payload, target_id: UUID.value };
  let ticket_payload = { id: UUID.value, request: `name: ${OD.textOne}` };
  xhr(TICKET_PATCH_URL, 'PATCH', JSON.stringify(ticket_payload), {}, 200, dtd_payload);
  await page.clickNextBtn();
  assert.equal(currentURL(), DEST_URL);
});

test('can click to next destination after updating field text (patch ticket)', async assert => {
  run(() => {
    store.push('ticket', {id: UUID.value, new_pk: DT.idOne})
  });
  const detail_data = DTF.detail(DT.idOne);
  detail_data['fields'][0]['type'] = FD.typeOne;
  const detail_xhr = xhr(`${endpoint}${DT.idOne}/`, 'GET', null, {}, 200, detail_data);
  await visit(DETAIL_URL);
  assert.equal(currentURL(), DETAIL_URL);
  await fillIn('.t-dtd-field-text:eq(0)', 'wat');
  const LETTER_W = {keyCode: 87};
  await triggerEvent('.t-dtd-field-text:eq(0)', 'keyup', LETTER_W);
  const ticket = store.find('ticket', UUID.value);
  const dtd = store.find('dtd', DT.idOne);
  assert.deepEqual(ticket.get('requestValues'), [`${FD.labelOne}: wat`]);
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), DT.idTwo);
  assert.equal(dtd.get('fields').objectAt(0).get('type'), FD.typeOne);
  let dtd_payload = DTF.generate(DT.idTwo);
  dtd_payload = { ...dtd_payload, target_id: UUID.value };
  let ticket_payload = { id: UUID.value, request: `name: wat` };
  xhr(TICKET_PATCH_URL, 'PATCH', JSON.stringify(ticket_payload), {}, 200, dtd_payload);
  await page.clickNextBtn();
  assert.equal(currentURL(), DEST_URL);
});

test('can click to next destination after updating field number (patch ticket)', async assert => {
  run(() => {
    store.push('ticket', {id: UUID.value, new_pk: DT.idOne})
  });
  const detail_data = DTF.detail(DT.idOne);
  detail_data['fields'][0]['type'] = FD.typeTwo;
  detail_data['fields'][0]['label'] = FD.labelTwo;
  const detail_xhr = xhr(`${endpoint}${DT.idOne}/`, 'GET', null, {}, 200, detail_data);
  await visit(DETAIL_URL);
  assert.equal(currentURL(), DETAIL_URL);
  await fillIn('.t-dtd-field-number:eq(0)', 92);
  const NUMBER = {keyCode: 57};
  await triggerEvent('.t-dtd-field-number:eq(0)', 'keyup', NUMBER);
  const ticket = store.find('ticket', UUID.value);
  const dtd = store.find('dtd', DT.idOne);
  assert.deepEqual(ticket.get('requestValues'), [`${FD.labelTwo}: 92`]);
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), DT.idTwo);
  assert.equal(dtd.get('fields').objectAt(0).get('type'), FD.typeTwo);
  let dtd_payload = DTF.generate(DT.idTwo);
  dtd_payload = { ...dtd_payload, target_id: UUID.value };
  let ticket_payload = { id: UUID.value, request: `age: 92` };
  xhr(TICKET_PATCH_URL, 'PATCH', JSON.stringify(ticket_payload), {}, 200, dtd_payload);
  await page.clickNextBtn();
  assert.equal(currentURL(), DEST_URL);
});

test('can click to next destination after updating field textarea (patch ticket)', async assert => {
  run(() => {
    store.push('ticket', {id: UUID.value, new_pk: DT.idOne})
  });
  const detail_data = DTF.detail(DT.idOne);
  detail_data['fields'][0]['type'] = FD.typeThree;
  detail_data['fields'][0]['label'] = FD.labelThree;
  const detail_xhr = xhr(`${endpoint}${DT.idOne}/`, 'GET', null, {}, 200, detail_data);
  await visit(DETAIL_URL);
  assert.equal(currentURL(), DETAIL_URL);
  await fillIn('.t-dtd-field-textarea:eq(0)', 'wat');
  const LETTER_W = {keyCode: 87};
  await triggerEvent('.t-dtd-field-textarea:eq(0)', 'keyup', LETTER_W);
  const ticket = store.find('ticket', UUID.value);
  const dtd = store.find('dtd', DT.idOne);
  assert.deepEqual(ticket.get('requestValues'), [`${FD.labelThree}: wat`]);
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), DT.idTwo);
  assert.equal(dtd.get('fields').objectAt(0).get('type'), FD.typeThree);
  let dtd_payload = DTF.generate(DT.idTwo);
  dtd_payload = { ...dtd_payload, target_id: UUID.value };
  let ticket_payload = { id: UUID.value, request: `${FD.labelThree}: wat` };
  xhr(TICKET_PATCH_URL, 'PATCH', JSON.stringify(ticket_payload), {}, 200, dtd_payload);
  await page.clickNextBtn();
  assert.equal(currentURL(), DEST_URL);
});

test('can\'t click to next destination if field is required and don\'t fill in field value (patch ticket)', async assert => {
  run(() => {
    store.push('ticket', {id: UUID.value, new_pk: DT.idOne})
  });
  const detail_data = DTF.detail(DT.idOne);
  detail_data['fields'][0]['type'] = FD.typeThree;
  detail_data['fields'][0]['label'] = FD.labelThree;
  detail_data['fields'][0]['required'] = FD.requiredTwo;
  const detail_xhr = xhr(`${endpoint}${DT.idOne}/`, 'GET', null, {}, 200, detail_data);
  await visit(DETAIL_URL);
  assert.equal(currentURL(), DETAIL_URL);
  assert.equal(find('.t-dtd-preview-btn').attr('disabled'), 'disabled');
  assert.equal(currentURL(), DETAIL_URL);
  await fillIn('.t-dtd-field-textarea:eq(0)', 'wat');
  const LETTER_W = {keyCode: 87};
  await triggerEvent('.t-dtd-field-textarea:eq(0)', 'keyup', LETTER_W);
  assert.equal(find('.t-dtd-preview-btn').attr('disabled'), undefined);
  const ticket = store.find('ticket', UUID.value);
  const dtd = store.find('dtd', DT.idOne);
  assert.deepEqual(ticket.get('requestValues'), [`${FD.labelThree}: wat`]);
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), DT.idTwo);
  assert.equal(dtd.get('fields').objectAt(0).get('type'), FD.typeThree);
  let dtd_payload = DTF.generate(DT.idTwo);
  dtd_payload = { ...dtd_payload, target_id: UUID.value };
  let ticket_payload = { id: UUID.value, request: `${FD.labelThree}: wat` };
  xhr(TICKET_PATCH_URL, 'PATCH', JSON.stringify(ticket_payload), {}, 200, dtd_payload);
  await page.clickNextBtn();
  assert.equal(currentURL(), DEST_URL);
});

test('can click to next destination after updating field select (patch ticket)', async assert => {
  run(() => {
    store.push('ticket', {id: UUID.value, new_pk: DT.idOne})
  });
  const detail_data = DTF.detail(DT.idOne);
  detail_data['fields'][0]['type'] = FD.typeFour;
  detail_data['fields'][0]['label'] = FD.labelFour;
  const detail_xhr = xhr(`${endpoint}${DT.idOne}/`, 'GET', null, {}, 200, detail_data);
  await visit(DETAIL_URL);
  assert.equal(currentURL(), DETAIL_URL);
  await page.selectClickDropdown()
    .selectOneOption();
  const ticket = store.find('ticket', UUID.value);
  const dtd = store.find('dtd', DT.idOne);
  assert.deepEqual(ticket.get('requestValues'), [`${FD.labelFour}: ${OD.textOne}`]);
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), DT.idTwo);
  assert.equal(dtd.get('fields').objectAt(0).get('type'), FD.typeFour);
  assert.equal(page.selectOneValue, OD.textOne);
  let dtd_payload = DTF.generate(DT.idTwo);
  dtd_payload = { ...dtd_payload, target_id: UUID.value };
  let ticket_payload = { id: UUID.value, request: `${FD.labelFour}: ${OD.textOne}` };
  xhr(TICKET_PATCH_URL, 'PATCH', JSON.stringify(ticket_payload), {}, 200, dtd_payload);
  await page.clickNextBtn();
  assert.equal(currentURL(), DEST_URL);
});

test('can click to next destination after updating multiple fields select (patch ticket)', async assert => {
  run(() => {
    store.push('ticket', {id: UUID.value, new_pk: DT.idOne})
  });
  const detail_data = DTF.detail(DT.idOne);
  detail_data['fields'][0]['type'] = FD.typeOne;
  detail_data['fields'][0]['label'] = FD.labelFour;
  detail_data.fields.push({
          id: FD.idTwo,
          label: 'another',
          type: FD.typeOne,
          required: FD.requiredOne,
          order: FD.orderOne,
          options: [
            {
              id: OD.idOne,
              text: OD.textOne,
              order: OD.orderOne
            }
          ]
        });
  const detail_xhr = xhr(`${endpoint}${DT.idOne}/`, 'GET', null, {}, 200, detail_data);
  await visit(DETAIL_URL);
  const ticket = store.find('ticket', UUID.value);
  const dtd = store.find('dtd', DT.idOne);
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
  assert.deepEqual(ticket.get('requestValues'), [`${FD.labelFour}: wat`, 'another: sat']);
  let dtd_payload = DTF.generate(DT.idTwo);
  dtd_payload = { ...dtd_payload, target_id: UUID.value };
  let ticket_payload = { id: UUID.value, request: `${FD.labelFour}: wat, another: sat` };
  xhr(TICKET_PATCH_URL, 'PATCH', JSON.stringify(ticket_payload), {}, 200, dtd_payload);
  await page.clickNextBtn();
  assert.equal(currentURL(), DEST_URL);
});


//multiple pages
//if required can't continue

/* jshint ignore:end */
