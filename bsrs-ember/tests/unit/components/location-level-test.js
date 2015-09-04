import Ember from 'ember';
import { test, module } from 'qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import prevent_duplicate_name from 'bsrs-ember/validation/prevent_duplicate_name';
import LOCATION_LEVEL_DEFAULTS from 'bsrs-ember/vendor/defaults/location-level';
import LocationLevel from 'bsrs-ember/models/location-level';
import LocationLevelComponent from "bsrs-ember/components/location-level/component";
import repository from 'bsrs-ember/tests/helpers/repository';

var container, registry, store, location_level_repo;

module('sco prevent duplicate name tests', {
    beforeEach() {
        registry = new Ember.Registry();
        container = registry.container();
        store = module_registry(container, registry, ['model:location-level']);
        location_level_repo = repository.initialize(container, registry, 'location-level');
        location_level_repo.peek = function(filter) { return store.find('location-level', filter, ['id']); };//TODO: filter need to be defined??
    },
    afterEach() {
        container = null;
        registry = null;
        store = null;
        location_level_repo = null;
    }
});

test('should be a valid location level name with correct filtered out available location names and will prevent duplicate name entries', (assert) => {
    var person = LocationLevel.create({store: store, id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, children_fks: [LOCATION_LEVEL_DEFAULTS.idTwo] });
    var model = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany}); 
    var location_level_two = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idTwo, name: LOCATION_LEVEL_DEFAULTS.nameRegion}); 
    var location_level_three = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idThree, name: LOCATION_LEVEL_DEFAULTS.nameDepartment}); 
    var subject = LocationLevelComponent.create({model: model, repository: location_level_repo});
    subject.set('all_location_levels', store.find('location-level'));
    subject.set('model', model);
    assert.equal(subject.get('available_location_level_names').get('length'), 2);
    assert.equal(person.get('children').objectAt(0).get('id'), LOCATION_LEVEL_DEFAULTS.idTwo);
    let bool = prevent_duplicate_name.call(subject, '');
    assert.ok(bool);
    bool = prevent_duplicate_name.call(subject, LOCATION_LEVEL_DEFAULTS.nameCompany);
    assert.ok(bool);
    bool = prevent_duplicate_name.call(subject, LOCATION_LEVEL_DEFAULTS.nameRegion);
    assert.ok(!bool);
});

