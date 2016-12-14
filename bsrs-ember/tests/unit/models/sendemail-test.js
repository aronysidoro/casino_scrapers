import Ember from 'ember';
const { run } = Ember;
import { moduleFor, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import SED from 'bsrs-ember/vendor/defaults/sendemail';
import PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import SEJRD from 'bsrs-ember/vendor/defaults/generic-join-recipients';

const PD = PERSON_DEFAULTS.defaults();

let store, sendEmail;

moduleFor('model:sendemail', 'Unit | Model | sendEmail', {
  needs: ['validator:presence', 'validator:unique-username', 'validator:length', 'validator:format', 'validator:has-many'],
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:sendemail', 'model:generic-join-recipients', 'model:person', 'model:related-person',  'service:person-current', 'service:translations-fetcher', 'service:i18n']);
    run(() => {
      sendEmail = store.push('sendemail', {id: SED.idOne});
    });
  }
});

test('dirty test | subject', assert => {
  assert.equal(sendEmail.get('isDirty'), false);
  assert.equal(sendEmail.get('isDirtyOrRelatedDirty'), false);
  sendEmail.set('subject', 'wat');
  assert.equal(sendEmail.get('isDirty'), true);
  assert.equal(sendEmail.get('isDirtyOrRelatedDirty'), true);
  sendEmail.set('subject', '');
  assert.equal(sendEmail.get('isDirty'), false);
  assert.equal(sendEmail.get('isDirtyOrRelatedDirty'), false);
});

test('dirty test | body', assert => {
  assert.equal(sendEmail.get('isDirty'), false);
  assert.equal(sendEmail.get('isDirtyOrRelatedDirty'), false);
  sendEmail.set('body', 'wat');
  assert.equal(sendEmail.get('isDirty'), true);
  assert.equal(sendEmail.get('isDirtyOrRelatedDirty'), true);
  sendEmail.set('body', '');
  assert.equal(sendEmail.get('isDirty'), false);
  assert.equal(sendEmail.get('isDirtyOrRelatedDirty'), false);
});

/* sendEmail & recipients: Start */

test('recipient property should return all associated recipients, and also confirm related and join model attr values', (assert) => {
  run(() => {
    store.push('generic-join-recipients', {id: SEJRD.idOne, generic_pk: SED.idOne, recipient_pk: PD.idOne});
    sendEmail = store.push('sendemail', {id: SED.idOne, generic_recipient_fks: [SEJRD.idOne]});
    store.push('related-person', {id: PD.idOne});
  });
  let recipient = sendEmail.get('recipient');
  assert.equal(recipient.get('length'), 1);
  assert.deepEqual(sendEmail.get('recipient_ids'), [PD.idOne]);
  assert.deepEqual(sendEmail.get('generic_recipient_ids'), [SEJRD.idOne]);
  assert.equal(recipient.objectAt(0).get('id'), PD.idOne);
});

test('remove_recipient - will remove join model and mark model as dirty', (assert) => {
  run(() => {
    store.push('generic-join-recipients', {id: SEJRD.idOne, generic_pk: SED.idOne, recipient_pk: PD.idOne});
    store.push('related-person', {id: PD.idOne});
    sendEmail = store.push('sendemail', {id: SED.idOne, generic_recipient_fks: [SEJRD.idOne]});
  });
  assert.equal(sendEmail.get('recipient').get('length'), 1);
  assert.equal(sendEmail.get('generic_recipient_ids').length, 1);
  assert.equal(sendEmail.get('generic_recipient_fks').length, 1);
  assert.ok(sendEmail.get('recipientIsNotDirty'));
  assert.ok(sendEmail.get('isNotDirtyOrRelatedNotDirty'));
  sendEmail.remove_recipient(PD.idOne);
  assert.equal(sendEmail.get('recipient').get('length'), 0);
  assert.equal(sendEmail.get('generic_recipient_ids').length, 0);
  assert.equal(sendEmail.get('generic_recipient_fks').length, 1);
  assert.ok(sendEmail.get('recipientIsDirty'));
  assert.ok(sendEmail.get('isDirtyOrRelatedDirty'));
});

test('add_recipient - will create join model and mark model dirty', (assert) => {
  run(() => {
    store.push('generic-join-recipients', {id: SEJRD.idOne, generic_pk: SED.idOne, recipient_pk: PD.idOne});
    store.push('related-person', {id: PD.idOne});
    sendEmail = store.push('sendemail', {id: SED.idOne, generic_recipient_fks: [SEJRD.idOne]});
  });
  assert.equal(sendEmail.get('recipient').get('length'), 1);
  assert.equal(sendEmail.get('generic_recipient_ids').length, 1);
  assert.equal(sendEmail.get('generic_recipient_fks').length, 1);
  assert.deepEqual(sendEmail.get('recipient_ids'), [PD.idOne]);
  assert.ok(sendEmail.get('recipientIsNotDirty'));
  assert.ok(sendEmail.get('isNotDirtyOrRelatedNotDirty'));
  sendEmail.add_recipient({id: PD.idTwo});
  assert.equal(sendEmail.get('recipient').get('length'), 2);
  assert.equal(sendEmail.get('generic_recipient_ids').length, 2);
  assert.equal(sendEmail.get('generic_recipient_fks').length, 1);
  assert.deepEqual(sendEmail.get('recipient_ids'), [PD.idOne, PD.idTwo]);
  assert.equal(sendEmail.get('recipient').objectAt(0).get('id'), PD.idOne);
  assert.equal(sendEmail.get('recipient').objectAt(1).get('id'), PD.idTwo);
});

test('rollback - primitive', assert => {
  assert.equal(sendEmail.get('subject'), undefined);
  assert.equal(sendEmail.get('isDirty'), false);
  assert.equal(sendEmail.get('isDirtyOrRelatedDirty'), false);
  sendEmail.set('subject', 'wat');
  assert.equal(sendEmail.get('isDirty'), true);
  assert.equal(sendEmail.get('isDirtyOrRelatedDirty'), true);
  sendEmail.rollback();
  assert.equal(sendEmail.get('subject'), undefined);
  assert.equal(sendEmail.get('isDirty'), false);
  assert.equal(sendEmail.get('isDirtyOrRelatedDirty'), false);
});

test('rollback - recipient', assert => {
  assert.equal(sendEmail.get('recipient').get('length'), 0);
  assert.ok(sendEmail.get('isNotDirtyOrRelatedNotDirty'));
  sendEmail.add_recipient({id: PD.idOne});
  assert.equal(sendEmail.get('recipient').get('length'), 1);
  assert.ok(sendEmail.get('isDirtyOrRelatedDirty'));
  sendEmail.rollback();
  assert.equal(sendEmail.get('recipient').get('length'), 0);
  assert.ok(sendEmail.get('isNotDirtyOrRelatedNotDirty'));
});

test('saveRelated - saveRelated should persist the changed recipient and model should be clean', (assert) => {
  assert.equal(sendEmail.get('recipient').get('length'), 0);
  assert.ok(sendEmail.get('isNotDirtyOrRelatedNotDirty'));
  sendEmail.add_recipient({id: PD.idOne});
  assert.equal(sendEmail.get('recipient').get('length'), 1);
  assert.ok(sendEmail.get('recipientIsDirty'));
  assert.ok(sendEmail.get('isDirtyOrRelatedDirty'));
  sendEmail.saveRelated();
  assert.equal(sendEmail.get('recipient').get('length'), 1);
  assert.ok(sendEmail.get('recipientIsNotDirty'));
  assert.ok(sendEmail.get('isNotDirtyOrRelatedNotDirty'));
});

/* sendEmail & recipients: End */

