import Ember from 'ember';
const { run } = Ember;
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import { test } from 'qunit';
import { xhr, clearxhr } from 'bsrs-ember/tests/helpers/xhr';
import AD from 'bsrs-ember/vendor/defaults/automation';
import AF from 'bsrs-ember/vendor/automation_fixtures';
import PersonF from 'bsrs-ember/vendor/people_fixtures';
import PD from 'bsrs-ember/vendor/defaults/person';
import config from 'bsrs-ember/config/environment';
import page from 'bsrs-ember/tests/pages/automation-mobile';
import automationPage from 'bsrs-ember/tests/pages/automation';
import generalMobilePage from 'bsrs-ember/tests/pages/general-mobile';
import generalPage from 'bsrs-ember/tests/pages/general';
import pageDrawer from 'bsrs-ember/tests/pages/nav-drawer';
import BASEURLS, { AUTOMATION_URL, automation_LIST_URL, PEOPLE_URL } from 'bsrs-ember/utilities/urls';

var store, listXhr;

const BASE_URL = BASEURLS.BASE_AUTOMATION_URL;
const DETAIL_URL = `${BASE_URL}/${AD.idOne}`;
const GRID_DETAIL_URL = `${BASE_URL}/${AD.idOne}`;
const automation_PUT_URL = `${AUTOMATION_URL}${AD.idOne}/`;
// const Assignee = '.t-automation-assignee-select';

moduleForAcceptance('Acceptance | mobile automation detail test', {
  beforeEach() {
    setWidth('mobile');
    store = this.application.__container__.lookup('service:simpleStore');
    listXhr = xhr(`${AUTOMATION_URL}?page=1`, 'GET', null, {}, 200, AF.list());
    xhr(`${AUTOMATION_URL}${AD.idOne}/`, 'GET', null, {}, 200, AF.detail(AD.idOne));
  },
});

/* jshint ignore:start */

test('can click from admin to automation grid to detail', async assert => {
  await generalPage.visitAdmin();
  assert.equal(currentURL(), BASEURLS.base_admin_url);
  await pageDrawer.clickDrawer();
  await pageDrawer.clickAdmin();
  await generalPage.clickautomations();
  assert.equal(currentURL(), automation_LIST_URL);
  await generalPage.gridItemZeroClick();
  assert.equal(currentURL(), GRID_DETAIL_URL);
});

test('can click through component sections and save to redirect to index', async assert => {
  await page.visitDetail();
  assert.equal(currentURL(), DETAIL_URL);
  await generalMobilePage.footerItemTwoClick();
  assert.ok(Ember.$('.t-mobile-footer-item:eq(1)').hasClass('active'));
  await generalMobilePage.footerItemOneClick();
  assert.ok(Ember.$('.t-mobile-footer-item:eq(0)').hasClass('active'));
  let payload = AF.put({id: AD.idOne});
  xhr(automation_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, {});
  await generalPage.save();
  assert.equal(currentURL(), automation_LIST_URL);
});

test('visit mobile detail and update all fields', async assert => {
  await page.visitDetail();
  assert.equal(currentURL(), DETAIL_URL);
  assert.equal(automationPage.descriptionValue, AD.descriptionOne);
  assert.equal(automationPage.assigneeInput, AD.fullname);
  // description
  await automationPage.descriptionFill(AD.descriptionTwo);
  assert.equal(automationPage.descriptionValue, AD.descriptionTwo);
  let keyword = 'Boy1';
  xhr(`${PEOPLE_URL}person__icontains=${keyword}/`, 'GET', null, {}, 200, PersonF.search_power_select());
  await selectSearch('.t-automation-assignee-select', keyword);
  await selectChoose('.t-automation-assignee-select', keyword);
  assert.equal(automationPage.assigneeInput, PD.fullnameBoy);
  xhr(automation_PUT_URL, 'PUT', AF.put({'description': AD.descriptionTwo, 'assignee': AD.assigneeSelectOne}), {}, 200, AF.list());
  await generalPage.save()
  assert.equal(currentURL(), automation_LIST_URL);
});

test('if the automation does not have at least one filter, it is invalid and cannot save', async assert => {
  clearxhr(listXhr)
  await page.visitDetail();
  assert.equal(currentURL(), DETAIL_URL);
  Ember.$('.t-mobile-footer-item:eq(1)').click();
  assert.equal(Ember.$('.t-automation-pf-select').length, 1);
  Ember.$('.t-del-pf-btn').click();
  assert.equal(Ember.$('.t-automation-pf-select').length, 0);
  await generalPage.save();
  assert.equal(currentURL(), DETAIL_URL);
});

test('show the filter count on the detail section', async assert => {
  clearxhr(listXhr);
  await page.visitDetail();
  assert.equal(currentURL(), DETAIL_URL);
  assert.equal(find('[data-test-id="applied-filters"]').text().trim(), 'There is 1 filter applied.');
});


// NOTE: Delete button not available
// test('visit detail and delete record', async assert => {
//   await page.visitDetail();
//   assert.equal(currentURL(), DETAIL_URL);
//   xhr(`${AUTOMATION_URL}${AD.idOne}/`, 'DELETE', null, {}, 204, {});
//   await generalPage.delete();
//   assert.equal(currentURL(), automation_LIST_URL);
// });

/* jshint ignore:end */