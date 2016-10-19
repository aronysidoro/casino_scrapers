import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import repository from 'bsrs-ember/tests/helpers/repository';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import SED from 'bsrs-ember/vendor/defaults/sendemail';
import AAD from 'bsrs-ember/vendor/defaults/automation-action';
import SEJRD from 'bsrs-ember/vendor/defaults/generic-join-recipients';
import PD from 'bsrs-ember/vendor/defaults/person';
import page from 'bsrs-ember/tests/pages/automation';
import { clickTrigger, triggerKeydown, nativeMouseUp, nativeMouseDown, typeInSearch } from 'bsrs-ember/tests/helpers/ember-power-select';
import waitFor from 'ember-test-helpers/wait';

var store, trans, action, person_repo;

moduleForComponent('automations/sendemail-action', 'Integration | Component | automations/sendemail action', {
  integration: true,
  beforeEach() {
    page.setContext(this);
    store = module_registry(this.container, this.registry, ['model:automation']);
    trans = this.container.lookup('service:i18n');
    loadTranslations(trans, translations.generate('en'));
    translation.initialize(this);
    action = store.push('automation-action', {id: AAD.idOne, sendemail_fk: SED.idOne});
    store.push('sendemail', {id: SED.idOne, subject: SED.subjectOne, body: SED.bodyOne, generic_recipient_fks: [SEJRD.idOne], actions: [AAD.idOne]});
    store.push('person', {id: PD.idOne, fullname: PD.fullname});
    store.push('generic-join-recipients', {id: SEJRD.idOne, generic_pk: SED.idOne, recipient_pk: PD.idOne});
    person_repo = repository.initialize(this.container, this.registry, 'person');
    person_repo.findPeople = function() { return [{id: PD.idTwo, fullname: PD.fullname}]; };
  },
  afterEach() {
    page.removeContext(this);
  }
});

test('it renders', function(assert) {
  this.model = action;
  this.index = 0;
  this.render(hbs`{{automations/sendemail-action model=model index=index}}`);
  assert.equal(this.$('.t-sendemail-recipient-label').text().trim(), trans.t('admin.action.sendemail.recipients'));
  assert.equal(this.$('.t-sendemail-subject-label').text().trim(), trans.t('admin.action.subject'));
  assert.equal(this.$('.t-sendemail-body-label').text().trim(), trans.t('admin.action.body'));
  assert.equal(this.$('.t-action-subject0').val(), action.get('sendemail').get('subject'));
  assert.equal(this.$('.t-action-body0').val(), action.get('sendemail').get('body'));
  assert.equal(page.actionSendEmailRecipientOne.replace(/\W/, '').trim(), action.get('sendemail').get('recipient').objectAt(0).get('fullname'));
});

test('shows validation messages', function(assert) {
  this.model = action;
  this.didValidate = false;
  this.index = 0;
  this.personRepo = person_repo;
  this.render(hbs`{{automations/sendemail-action model=model index=index didValidate=didValidate personRepo=personRepo}}`);
  let $component = this.$('.t-action-subject-validator0');
  let $component2 = this.$('.t-action-body-validator0');
  let $component3 = this.$('.t-action-recipient-validator0');
  assert.equal($component.hasClass('invalid'), false);
  assert.equal($component2.hasClass('invalid'), false);
  assert.equal($component3.hasClass('invalid'), false);
  assert.equal(Ember.$('.validated-input-error-dialog:eq(0)').text().trim(), '');
  assert.equal(Ember.$('.validated-input-error-dialog:eq(1)').text().trim(), '');
  assert.equal(Ember.$('.validated-input-error-dialog:eq(2)').text().trim(), '');
  page.sendEmailBodyFillIn('');
  page.sendEmailSubjectFillIn('');
  nativeMouseDown('.ember-power-select-multiple-remove-btn');
  this.set('didValidate', true);
  assert.equal($component.hasClass('invalid'), true);
  assert.equal($component2.hasClass('invalid'), true);
  assert.equal($component3.hasClass('invalid'), true);
  assert.equal(Ember.$('.validated-input-error-dialog:eq(0)').text().trim(), trans.t('errors.sendemail.recipient'));
  assert.equal(Ember.$('.validated-input-error-dialog:eq(1)').text().trim(), trans.t('errors.sendemail.subject'));
  assert.equal(Ember.$('.validated-input-error-dialog:eq(2)').text().trim(), trans.t('errors.sendemail.body'));
  this.$('.t-action-subject0').val('this is the subject').trigger('keyup');
  this.$('.t-action-body0').val('this is the body').trigger('keyup');
  assert.equal($component.hasClass('invalid'), false);
  assert.equal($component2.hasClass('invalid'), false);
  // run(() => { typeInSearch('e'); });
  // return waitFor().
  //   then(() => {
  //     nativeMouseUp(`.ember-power-select-option:contains(${PD.fullname})`);
  //     assert.equal(this.$('.invalid').length, 0);
  //   });
  // assert.equal($component3.hasClass('invalid'), false);
});


