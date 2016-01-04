import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import translation from "bsrs-ember/instance-initializers/ember-i18n";
import translations from "bsrs-ember/vendor/translation_fixtures";
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import repository from 'bsrs-ember/tests/helpers/repository';
import LOCATION_LEVEL_DEFAULTS from 'bsrs-ember/vendor/defaults/location-level';
import LOCATION_LEVEL_FIXTURES from 'bsrs-ember/vendor/location_level_fixtures';
import UUID from 'bsrs-ember/vendor/defaults/uuid';

let store, location_level, all_location_levels, location_levels, location_level_repo, run = Ember.run;

moduleForComponent('location-level', 'integration: location-level test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:location-level']);
        all_location_levels = LOCATION_LEVEL_FIXTURES.all_location_levels();
        run(function() {
            all_location_levels.forEach((location_level) => { 
                location_level.children_fks = location_level.children || [];
                delete location_level.children;
                store.push('location-level', location_level); 
            });
        });
        location_level = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idOne);
        location_levels = store.find('location-level');
        translation.initialize(this);
        var service = this.container.lookup('service:i18n');
        var json = translations.generate('en');
        loadTranslations(service, json);
        location_level_repo = repository.initialize(this.container, this.registry, 'location-level');
        location_level_repo.peek = (filter) => { return store.find('location-level', filter, ['id']); };
    }
});

test('validation should enforce basic location name property', function(assert) {
    this.set('model', location_level);
    this.set('location_level_options', location_levels);
    this.render(hbs`{{location-level-general model=model location_level_options=location_level_options}}`);
    var $component = this.$('.t-location-level-name');
    let $validation = this.$('.t-name-validation-error');
    assert.ok($validation.is(':hidden'));
    assert.equal($component.val(), LOCATION_LEVEL_DEFAULTS.nameCompany);
    $component.val('').trigger('input');
    $validation = this.$('.t-name-validation-error');
    assert.ok($validation.is(':visible'));
    $component.val(LOCATION_LEVEL_DEFAULTS.nameRegion).trigger('input');
    $validation = this.$('.t-name-validation-error');
    assert.ok($validation.is(':hidden'));
});
