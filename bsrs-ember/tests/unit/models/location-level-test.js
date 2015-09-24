import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import LOCATION_LEVEL_DEFAULTS from 'bsrs-ember/vendor/defaults/location-level';
import ROLE_DEFAULTS from 'bsrs-ember/vendor/defaults/role';

var store;

module('unit: location level test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:location-level']);
    }
});

test('location level is dirty when model has been updated', (assert) => {
    var location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameRegion});
    assert.ok(location_level.get('isNotDirty'));
    location_level.set('name', LOCATION_LEVEL_DEFAULTS.nameCompany);
    assert.ok(location_level.get('isDirty'));
    location_level.set('name', LOCATION_LEVEL_DEFAULTS.nameRegion);
    assert.ok(location_level.get('isNotDirty'));
});

test('location level can have child location levels', (assert) => {
    var model = {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameRegion, children_fks: [LOCATION_LEVEL_DEFAULTS.idTwo]};
    var location_level = store.push('location-level', model);
    var location_level_child = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idTwo, name: LOCATION_LEVEL_DEFAULTS.nameDepartment });
    assert.equal(location_level.get('children').get('length'), 1);
    store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idThree, name: LOCATION_LEVEL_DEFAULTS.nameDepartment});
    location_level.set('children_fks', [LOCATION_LEVEL_DEFAULTS.idTwo, LOCATION_LEVEL_DEFAULTS.idThree]);
    assert.equal(location_level.get('children').get('length'), 2);
    var location_levels = location_level.get('children');
});

test('location level can be related to one or many roles', (assert) => {
    var location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameRegion, roles: []});
    assert.ok(location_level.get('isNotDirty'));
    assert.ok(location_level.get('isNotDirtyOrRelatedNotDirty'));
    var related = location_level.get('roles');
    location_level.set('roles', related.concat([ROLE_DEFAULTS.idOne]));
    assert.deepEqual(location_level.get('roles'), [ROLE_DEFAULTS.idOne]);
    assert.ok(location_level.get('isDirty'));
    assert.ok(location_level.get('isDirtyOrRelatedDirty'));
});
