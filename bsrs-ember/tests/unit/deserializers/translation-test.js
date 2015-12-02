import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import TRANSLATION_DEFAULTS from 'bsrs-ember/vendor/defaults/translation';
import TRANSLATION_FIXTURES from 'bsrs-ember/vendor/admin_translation_fixtures';
import TranslationDeserializer from 'bsrs-ember/deserializers/translation';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

let store, subject;

module('unit: translation deserializer test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:translation']);
        subject = TranslationDeserializer.create({store: store});
    }
});

test('deserialize_list', (assert) => {
    let json = [TRANSLATION_DEFAULTS.keyOne, TRANSLATION_DEFAULTS.keyTwo];
    let response = {'count':2,'next':null,'previous':null,'results': json};

    subject.deserialize(response);

    assert.ok(store.find('translation', TRANSLATION_DEFAULTS.keyOne));
});

test('deserialize_single', (assert) => {
    let response = TRANSLATION_FIXTURES.generate(TRANSLATION_DEFAULTS.keyOne);

    subject.deserialize(response, TRANSLATION_DEFAULTS.keyOne);

    assert.ok(store.find('translation', TRANSLATION_DEFAULTS.keyOne));
});
