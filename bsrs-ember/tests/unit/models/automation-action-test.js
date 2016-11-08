import Ember from 'ember';
const { run } = Ember;
import { moduleFor, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import AAD from 'bsrs-ember/vendor/defaults/automation-action';
import ATD from 'bsrs-ember/vendor/defaults/automation-action-type';
import PersonD from 'bsrs-ember/vendor/defaults/person';
import TPD from 'bsrs-ember/vendor/defaults/ticket-priority';
import TSD from 'bsrs-ember/vendor/defaults/ticket-status';
import SED from 'bsrs-ember/vendor/defaults/sendemail';
import SMSD from 'bsrs-ember/vendor/defaults/sendsms';
import SMSJRD from 'bsrs-ember/vendor/defaults/generic-join-recipients';
import SEDJRD from 'bsrs-ember/vendor/defaults/generic-join-recipients';
import PD from 'bsrs-ember/vendor/defaults/person';
import page from 'bsrs-ember/tests/pages/automation';

var store, action, actionType, type, assignee, priority, sendEmail, sendsms;

moduleFor('model:automation-action', 'Unit | Model | automation-action', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:automation-action', 'model:automation-action-type', 'model:generic-join-recipients', 'model:generic-join-recipients', 'model:person', 'model:ticket-priority', 'model:ticket-status', 'model:sendemail', 'model:sendsms', 'service:person-current', 'service:translations-fetcher', 'service:i18n', 'validator:presence','validator:unique-username', 'validator:length', 'validator:format', 'validator:has-many', 'validator:automation-action-type', 'validator:belongs-to', 'validator:action-ticket-request']);
  }
});

// Action - sendsms

test('action has a related ticket sendsms', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, sendsms_fk: SMSD.idOne});
    store.push('sendsms', {id: SMSD.idOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('sendsms').get('id'), SMSD.idOne);
});

test('change_sendsms and dirty tracking', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, sendsms_fk: SMSD.idOne});
    store.push('sendsms', {id: SMSD.idOne, name: SMSD.nameOne, actions: [AAD.idOne]});
  });
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(action.get('sendsmsIsNotDirty'));
  action.change_sendsms({id: SMSD.idTwo});
  assert.equal(action.get('sendsms').get('id'), SMSD.idTwo);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  assert.ok(action.get('sendsmsIsDirty'));
});

test('rollback sendsms will revert and reboot the dirty type to clean', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, sendsms_fk: SMSD.idOne});
    store.push('sendsms', {id: SMSD.idOne, name: SMSD.nameOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('sendsms').get('id'), SMSD.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  action.change_sendsms({id: SMSD.idTwo});
  assert.equal(action.get('sendsms').get('id'), SMSD.idTwo);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  action.rollback();
  assert.equal(action.get('sendsms').get('id'), SMSD.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
});

test('saveRelated action sendsms to save model and make it clean', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, sendsms_fk: SMSD.idOne});
    store.push('sendsms', {id: SMSD.idOne, name: SMSD.nameOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('sendsms').get('id'), SMSD.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  action.change_sendsms({id: SMSD.idTwo});
  assert.equal(action.get('sendsms').get('id'), SMSD.idTwo);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  action.saveRelated();
  assert.equal(action.get('sendsms').get('id'), SMSD.idTwo);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
});

test('action is dirty if recipients change on sendsms model', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, sendsms_fk: SMSD.idOne});
    sendsms = store.push('sendsms', {id: SMSD.idOne, name: SMSD.nameOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('sendsms').get('id'), SMSD.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  sendsms.add_recipient({id: PD.idOne});
  assert.equal(sendsms.get('recipient').objectAt(0).get('id'), PD.idOne);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  assert.ok(sendsms.get('isDirtyOrRelatedDirty'));
  // saveRelated from the point of the action should clean all
  action.saveRelated();
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
});

//TODO: add dirty if none exists before


// Action - sendemail

test('action has a related ticket sendemail', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, sendemail_fk: SED.idOne});
    store.push('sendemail', {id: SED.idOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('sendemail').get('id'), SED.idOne);
});

test('change_sendemail and dirty tracking', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, sendemail_fk: SED.idOne});
    store.push('sendemail', {id: SED.idOne, name: SED.nameOne, actions: [AAD.idOne]});
  });
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(action.get('sendemailIsNotDirty'));
  action.change_sendemail({id: SED.idTwo});
  assert.equal(action.get('sendemail').get('id'), SED.idTwo);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  assert.ok(action.get('sendemailIsDirty'));
});

test('rollback sendemail will revert and reboot the dirty type to clean', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, sendemail_fk: SED.idOne});
    store.push('sendemail', {id: SED.idOne, name: SED.nameOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('sendemail').get('id'), SED.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  action.change_sendemail({id: SED.idTwo});
  assert.equal(action.get('sendemail').get('id'), SED.idTwo);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  action.rollback();
  assert.equal(action.get('sendemail').get('id'), SED.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
});

test('saveRelated action sendemail to save model and make it clean', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, sendemail_fk: SED.idOne});
    store.push('sendemail', {id: SED.idOne, name: SED.nameOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('sendemail').get('id'), SED.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  action.change_sendemail({id: SED.idTwo});
  assert.equal(action.get('sendemail').get('id'), SED.idTwo);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  action.saveRelated();
  assert.equal(action.get('sendemail').get('id'), SED.idTwo);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
});

test('action is dirty if recipients change on sendemail model', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, sendemail_fk: SED.idOne});
    sendEmail = store.push('sendemail', {id: SED.idOne, name: SED.nameOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('sendemail').get('id'), SED.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  sendEmail.add_recipient({id: PD.idOne});
  assert.equal(sendEmail.get('recipient').objectAt(0).get('id'), PD.idOne);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  assert.ok(sendEmail.get('isDirtyOrRelatedDirty'));
  // saveRelated from the point of the action should clean all
  action.saveRelated();
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
});

// Action - Ticket status

test('action has a related ticket status', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, status_fk: TSD.idOne});
    store.push('ticket-status', {id: TSD.idOne, name: TSD.nameOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('status').get('id'), TSD.idOne);
  assert.equal(action.get('status.name'), TSD.nameOne);
});

test('change_status and dirty tracking', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, status_fk: TSD.idOne});
    store.push('ticket-status', {id: TSD.idOne, name: TSD.nameOne, actions: [AAD.idOne]});
  });
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(action.get('statusIsNotDirty'));
  action.change_status({id: TSD.idTwo});
  assert.equal(action.get('status').get('id'), TSD.idTwo);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  assert.ok(action.get('statusIsDirty'));
});

test('rollback status will revert and reboot the dirty type to clean', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, status_fk: TSD.idOne});
    store.push('ticket-status', {id: TSD.idOne, name: TSD.nameOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('status').get('id'), TSD.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  action.change_status({id: TSD.idTwo});
  assert.equal(action.get('status').get('id'), TSD.idTwo);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  action.rollback();
  assert.equal(action.get('status').get('id'), TSD.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
});

test('saveRelated action status to save model and make it clean', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, status_fk: TSD.idOne});
    store.push('ticket-status', {id: TSD.idOne, name: TSD.nameOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('status').get('id'), TSD.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  action.change_status({id: TSD.idTwo});
  assert.equal(action.get('status').get('id'), TSD.idTwo);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  action.saveRelated();
  assert.equal(action.get('status').get('id'), TSD.idTwo);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
});

// Action - ActionType

test('action has a related action type', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, type_fk: ATD.idOne});
    store.push('automation-action-type', {id: ATD.idOne, key: ATD.keyOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('type').get('id'), ATD.idOne);
  assert.equal(action.get('type.key'), ATD.keyOne);
});

test('change_type and dirty tracking', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, type_fk: ATD.idOne});
    store.push('automation-action-type', {id: ATD.idOne, actions: [AAD.idOne]});
  });
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(action.get('typeIsNotDirty'));
  action.change_type({id: ATD.idTwo});
  assert.equal(action.get('type').get('id'), ATD.idTwo);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  assert.ok(action.get('typeIsDirty'));
});

test('rollback type will revert and reboot the dirty type to clean', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, type_fk: ATD.idOne});
    store.push('automation-action-type', {id: ATD.idOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('type').get('id'), ATD.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  action.change_type({id: ATD.idTwo});
  assert.equal(action.get('type').get('id'), ATD.idTwo);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  action.rollback();
  assert.equal(action.get('type').get('id'), ATD.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
});

test('saveRelated action type to save model and make it clean', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, type_fk: ATD.idOne});
    store.push('automation-action-type', {id: ATD.idOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('type').get('id'), ATD.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  action.change_type({id: ATD.idTwo});
  assert.equal(action.get('type').get('id'), ATD.idTwo);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  action.saveRelated();
  assert.equal(action.get('type').get('id'), ATD.idTwo);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
});

test('remove_type - removes the action type from the action', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, type_fk: ATD.idOne});
    actionType = store.push('automation-action-type', {id: ATD.idOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('type').get('id'), ATD.idOne);
  action.remove_type(ATD.idOne);
  assert.deepEqual(actionType.get('actions'), []);
  assert.equal(action.get('type'), undefined);
});

// Action - Assignee

test('action has a related assignee', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, type_fk: ATD.idOne});
    store.push('person', {id: PersonD.idOne, fullname: PersonD.fullname, actions: [AAD.idOne]});
  });
  assert.equal(action.get('assignee').get('id'), PersonD.idOne);
  assert.equal(action.get('assignee.fullname'), PersonD.fullname);
});

test('change_assignee and dirty tracking', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne});
    assignee = store.push('person', {id: PersonD.idOne});
  });
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(action.get('assigneeIsNotDirty'));
  action.change_assignee({id: PersonD.idOne});
  assert.equal(action.get('assignee').get('id'), PersonD.idOne);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  assert.ok(action.get('assigneeIsDirty'));
  assert.ok(assignee.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollback assignee will revert and reboot the dirty assignee to clean', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, assignee_fk: PersonD.idOne});
    store.push('person', {id: PersonD.idOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('assignee').get('id'), PersonD.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  action.change_assignee({id: PersonD.idTwo});
  assert.equal(action.get('assignee').get('id'), PersonD.idTwo);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  action.rollback();
  assert.equal(action.get('assignee').get('id'), PersonD.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
});

test('saveRelated for assignee to save model and make it clean', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, assignee_fk: PersonD.idOne});
    store.push('person', {id: PersonD.idOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('assignee').get('id'), PersonD.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  action.change_assignee({id: PersonD.idTwo});
  assert.equal(action.get('assignee').get('id'), PersonD.idTwo);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  action.saveRelated();
  assert.equal(action.get('assignee').get('id'), PersonD.idTwo);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
});

// validations

test('type validation - action must have a type to be valid', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, foo: 'bar'});
  });
  assert.equal(action.get('validations.isValid'), false);
  action.change_type({id: ATD.idOne});
  assert.equal(action.get('validations.isValid'), true);
});

test('type validation - assignee - if the type is assignee, a related assignee is required', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne});
  });
  assert.equal(action.get('validations.isValid'), false);
  action.change_type({id: ATD.idOne, key: ATD.keyOne});
  action.change_assignee({id: PersonD.idOne});
  assert.equal(action.get('validations.isValid'), true);
});

test('type validation - priority - if the type is priority, a related priority is required', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne});
  });
  assert.equal(action.get('validations.isValid'), false);
  action.change_type({id: ATD.idTwo, key: ATD.keyTwo});
  action.change_priority({id: TPD.idOne});
  assert.equal(action.get('validations.isValid'), true);
});

test('type validation - sendemail - if the type is sendemail, a related sendemail is required', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne});
  });
  assert.equal(action.get('validations.isValid'), false);
  action.change_type({id: ATD.idTwo, key: ATD.keyFour});
  action.change_sendemail({id: SED.idOne});
  assert.equal(action.get('validations.isValid'), false);   
  const sendemail = store.find('sendemail', SED.idOne);
  sendemail.set('body', 'watter');
  assert.equal(action.get('validations.isValid'), false);   
  sendemail.set('subject', 'watter');
  assert.equal(action.get('validations.isValid'), false);   
  sendemail.add_recipient({id: PD.idOne});
  assert.equal(action.get('validations.isValid'), true);   
});

test('type validation -sendsms - if the tyoe is sendsms, a related sendsms is required', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne});
  });
  assert.equal(action.get('validations.isValid'), false);
  action.change_type({id: ATD.idTwo, key: ATD.keyFive});
  action.change_sendsms({id: SMSD.idOne});
  assert.equal(action.get('validations.isValid'), false);   
  const sendsms = store.find('sendsms', SMSD.idOne);
  sendsms.set('message', 'message section');
  assert.equal(action.get('validations.isValid'), false);   
  sendsms.add_recipient({id: PD.idOne});
  assert.equal(action.get('validations.isValid'), true);   
});

// Action - sendemail

test('action has a related priority', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, priority_fk: ATD.idOne});
    store.push('ticket-priority', {id: TPD.idOne, key: TPD.keyOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('priority').get('id'), TPD.idOne);
  assert.equal(action.get('priority.key'), TPD.keyOne);
});

test('change_priority and dirty tracking', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne});
    priority = store.push('ticket-priority', {id: TPD.idOne});
  });
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(action.get('priorityIsNotDirty'));
  action.change_priority({id: TPD.idOne});
  assert.equal(action.get('priority').get('id'), TPD.idOne);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  assert.ok(action.get('priorityIsDirty'));
});

test('rollback priority will revert and reboot the dirty priority to clean', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, priority_fk: TPD.idOne});
    store.push('ticket-priority', {id: TPD.idOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('priority').get('id'), TPD.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  action.change_priority({id: TPD.idTwo});
  assert.equal(action.get('priority').get('id'), TPD.idTwo);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  action.rollback();
  assert.equal(action.get('priority').get('id'), TPD.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
});

test('saveRelated for priority to save model and make it clean', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, priority_fk: TPD.idOne});
    store.push('ticket-priority', {id: TPD.idOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('priority').get('id'), TPD.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  action.change_priority({id: TPD.idTwo});
  assert.equal(action.get('priority').get('id'), TPD.idTwo);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  action.saveRelated();
  assert.equal(action.get('priority').get('id'), TPD.idTwo);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
});

test('serialize - should only send the content fields that are relevant based on the type', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, request: AAD.requestOne});
    store.push('generic-join-recipients', {id: SEDJRD.idOne, generic_pk: SED.idOne, recipient_pk: PD.idOne});
    store.push('generic-join-recipients', {id: SMSJRD.idTwo, generic_pk: SMSD.idOne, recipient_pk: PD.idTwo});
    store.push('person', {id: PD.idOne});
    store.push('person', {id: PD.idTwo});
    store.push('sendemail', {id: SED.idOne, subject: SED.subjectTwo, body: SED.bodyTwo,  generic_recipient_fks: [SEDJRD.idOne], actions: [AAD.idOne]});
    store.push('sendsms', {id: SMSD.idOne, message: SMSD.messageTwo, generic_recipient_fks: [SMSJRD.idTwo], actions: [AAD.idOne]});
  });
  action.change_assignee({id: PersonD.idOne});
  action.change_priority({id: TPD.idOne});
  action.change_status({id: TSD.idOne});
  action.change_sendemail({id: SED.idOne});
  action.change_sendsms({id: SMSD.idOne});

  action.change_type({id: ATD.idOne, key: ATD.keyOne});
  assert.deepEqual(action.serialize().content, {assignee: PersonD.idOne});
  action.change_type({id: ATD.idTwo, key: ATD.keyTwo});
  assert.deepEqual(action.serialize().content, {priority: TPD.idOne});
  action.change_type({id: ATD.idThree, key: ATD.keyThree});
  assert.deepEqual(action.serialize().content, {status: TSD.idOne});
  action.change_type({id: ATD.idFour, key: ATD.keyFour});
  assert.deepEqual(action.serialize().content, {sendemail: {body: SED.bodyTwo, recipients: [PD.id], subject: SED.subjectTwo}});
  action.change_type({id: ATD.idFive, key: ATD.keyFive});
  assert.equal(action.get('sendsms').get('id'), SMSD.idOne);
  assert.deepEqual(action.get('sendsms').get('recipient').mapBy('id'), [PD.idTwo]);
  assert.deepEqual(action.serialize().content, {sendsms: {message: SMSD.messageTwo, recipients: [PD.idTwo]}});
  action.change_type({id: ATD.idSix, key: ATD.keySix});
  assert.equal(action.get('type').get('key'), ATD.keySix);
  assert.deepEqual(action.serialize().content, {request: AAD.requestOne});
});