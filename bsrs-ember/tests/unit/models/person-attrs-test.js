import {test, module} from 'qunit';
import Person from 'bsrs-ember/models/person';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';

module('unit: person attrs test');

test('default state for username on person model is undefined', (assert) => {
    var person = Person.create({id: PEOPLE_DEFAULTS.id, username: undefined});
    assert.ok(person.get('isNotDirty'));
    person.set('username', 'scott');
    assert.ok(person.get('isDirty'));
    person.set('username', '');
    assert.ok(person.get('isNotDirty'));
});

test('default state for locale on person model is undefined', (assert) => {
    var person = Person.create({id: PEOPLE_DEFAULTS.id, locale: undefined});
    assert.ok(person.get('isNotDirty'));
    person.set('locale', PEOPLE_DEFAULTS.locale);
    assert.ok(person.get('isDirty'));
    person.set('locale', '');
    assert.ok(person.get('isNotDirty'));
});

test('default state for locale on person model is set', (assert) => {
    var person = Person.create({id: PEOPLE_DEFAULTS.id, locale: PEOPLE_DEFAULTS.locale});
    assert.ok(person.get('isNotDirty'));
    assert.equal(person.get('locale'), PEOPLE_DEFAULTS.locale);
});


test('default state for first name, middle initial, and last name on person model is undefined', (assert) => {
    var person = Person.create({id: PEOPLE_DEFAULTS.id, first_name: undefined, middle_initial: undefined, last_name: undefined});
    assert.ok(person.get('isNotDirty'));
    person.set('first_name', 'Katy');
    assert.ok(person.get('isDirty'));
    person.set('first_name', '');
    assert.ok(person.get('isNotDirty'));
    person.set('last_name', 'Perry');
    assert.ok(person.get('isDirty'));
    person.set('last_name', '');
    assert.ok(person.get('isNotDirty'));
    person.set('middle_initial', 'A');
    assert.ok(person.get('isDirty'));
    person.set('middle_initial', '');
    assert.ok(person.get('isNotDirty'));
});

test('default state for employee number, and title on person model is undefined', (assert) => {
    var person = Person.create({id: PEOPLE_DEFAULTS.id, employee_id: undefined, title: undefined});
    assert.ok(person.get('isNotDirty'));
    person.set('employee_id', '1222');
    assert.ok(person.get('isDirty'));
    person.set('employee_id', '');
    assert.ok(person.get('isNotDirty'));
    person.set('title', 'mastermind');
    assert.ok(person.get('isDirty'));
    person.set('title', '');
    assert.ok(person.get('isNotDirty'));
});

test('default state for auth amount on person model is undefined', (assert) => {
    var person = Person.create({id: PEOPLE_DEFAULTS.id, auth_amount: undefined});
    assert.ok(person.get('isNotDirty'));
    person.set('auth_amount', '50,000');
    assert.ok(person.get('isDirty'));
    person.set('auth_amount', '');
    assert.ok(person.get('isNotDirty'));
});
