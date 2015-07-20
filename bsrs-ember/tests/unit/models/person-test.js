import {test, module} from 'qunit';
import Person from 'bsrs-ember/models/person';
import Store from 'ember-cli-simple-store/store';
import PhoneNumber from 'bsrs-ember/models/phonenumber';
import Ember from 'ember';

var container, registry, store;

module('sco unit: person test', {
    beforeEach() {
        registry = new Ember.Registry();
        registry.register('model:person', Person);
        registry.register('model:phonenumber', PhoneNumber);
        registry.register('store:main', Store);
        container = registry.container();
        store = container.lookup('store:main');
    },
    afterEach() {
        container = null;
        registry = null;
        store = null;
    }
});

test('related phone numbers are not dirty when no phone numbers present', (assert) => {
    var person = store.push('person', {id: 1, phone_numbers: []});
    assert.ok(person.get('phoneNumbersIsNotDirty'));
});

test('related phone numbers are not dirty with original phone number model', (assert) => {
    var person = store.push('person', {id: 1, phone_numbers: [2]});
    var phone_number = store.push('phonenumber', {id: 2, type: 1, person_id: 1});
    assert.ok(person.get('phoneNumbersIsNotDirty'));
});

test('related phone number model is dirty when phone number is dirty', (assert) => {
    var person = store.push('person', {id: 1, phone_numbers: [2]});
    var phone_number = store.push('phonenumber', {id: 2, type: 1, person_id: 1});
    assert.ok(phone_number.get('isNotDirty'));
    assert.ok(person.get('phoneNumbersIsNotDirty'));
    phone_number.set('type', 2);
    assert.ok(phone_number.get('isDirty'));
    assert.ok(person.get('phoneNumbersIsDirty'));
});

test('when new phone number is added, the person model is dirty', (assert) => {
    var person = store.push('person', {id: 1, phone_numbers: [2]});
    var phone_number = store.push('phonenumber', {id: 2, person_id: 1});
    assert.ok(person.get('isNotDirty'));
    person.set('phone_numbers', [2,3]);
    assert.ok(person.get('isDirty'));
    //TODO: toran will look at simple-store
    // person.set('phone_numbers', [2]);
    // assert.ok(person.get('isNotDirty'));
});

test('related phone numbers is dirty when second phone number is added to phone_numbers array', (assert) => {
    var person = store.push('person', {id: 1, phone_numbers: [2]});
    var phone_number = store.push('phonenumber', {id: 2, type: 1, person_id: 1});
    assert.ok(phone_number.get('isNotDirty'));
    assert.ok(person.get('phoneNumbersIsNotDirty'));
    var phone_number_two = store.push('phonenumber', {id: 3, type: 1, person_id: 1});
    person.set('phone_numbers', [2,3]);
    assert.ok(person.get('phoneNumbersIsNotDirty'));
    phone_number_two.set('type', 2);
    assert.ok(phone_number_two.get('isDirty'));
    assert.ok(person.get('phoneNumbersIsDirty'));
    phone_number_two.set('type', 1);
    assert.ok(phone_number_two.get('isNotDirty'));
    assert.ok(person.get('phoneNumbersIsNotDirty'));
});

test('when no phone number and new phone number is added, expect phone number model is dirty', (assert) => {
    var person = store.push('person', {id: 1});
    assert.ok(person.get('isNotDirty'));
    person.set('phone_numbers', [2]);
    assert.ok(person.get('isDirty'));
    person.save();
    assert.ok(person.get('isNotDirty'));
});

test('person is dirty or related is dirty when model has been updated', (assert) => {
    var person = store.push('person', {id: 1, username: 'scott', phone_numbers: [2]});
    var phone_number = store.push('phonenumber', {id: 2, type: 1, person_id: 1});
    assert.ok(person.get('isNotDirty'));
    assert.ok(phone_number.get('isNotDirty'));
    assert.ok(person.get('phoneNumbersIsNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    person.set('username', 'abc');
    assert.ok(person.get('isDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    person.set('username', 'scott');
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    phone_number.set('type', 2);
    assert.ok(phone_number.get('isDirty'));
    assert.ok(person.get('phoneNumbersIsDirty'));
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    phone_number.set('type', 1);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('phoneNumbersIsNotDirty'));
    assert.ok(phone_number.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    phone_number.set('type', 2);
    assert.ok(!person.get('isNotDirtyOrRelatedNotDirty'));
    phone_number.set('type', 1);
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
});
