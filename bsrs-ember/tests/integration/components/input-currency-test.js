import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import translation from "bsrs-ember/instance-initializers/ember-i18n";
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import CURRENCY_DEFAULTS from 'bsrs-ember/vendor/currencies';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

const LONG_AUTH_AMOUNT = '50000.0000';

var container, registry, store, service;

moduleForComponent('input-currency', 'integration: input-currency test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:person', 'model:currency', 'service:currency']);
        store.push('currency', CURRENCY_DEFAULTS);
        translation.initialize(this);
    }
});

test('renders a component with no value when bound attr is undefined', function(assert) {
    var model = store.push('person', {id: PEOPLE_DEFAULTS.id, auth_amount: undefined});
    this.set('model', model);
    this.render(hbs`{{input-currency model=model field="auth_amount"}}`);
    var $component = this.$('.t-input-currency');
    assert.equal($component.find('.t-person-auth_amount').val(), '');
});

test('renders a component with currency and label', function(assert) {
    var model = store.push('person', {id: PEOPLE_DEFAULTS.id, auth_amount: {amount: LONG_AUTH_AMOUNT, currency: '535543wf-80ea-426a-8cc3-09728cd74952'}});
    this.set('model', model);
    this.render(hbs`{{input-currency model=model field="auth_amount.amount"}}`);
    var $component = this.$('.t-input-currency');
    assert.equal($component.find('.t-currency-symbol').text().trim(), CURRENCY_DEFAULTS.symbol_native);
    assert.equal($component.find('.t-currency-code').text().trim(), CURRENCY_DEFAULTS.code);
    assert.equal($component.find('.t-person-auth_amount').val(), PEOPLE_DEFAULTS.auth_amount.amount);
});

test('the models bound field will update both the formatted input value and the model itself', function(assert) {
    var model = store.push('person', {id: PEOPLE_DEFAULTS.id, auth_amount: {amount: LONG_AUTH_AMOUNT, currency: '535543wf-80ea-426a-8cc3-09728cd74952'}});
    this.set('model', model);
    this.render(hbs`{{input-currency model=model field="auth_amount.amount"}}`);
    var $component = this.$('.t-input-currency');
    $component.find('.t-person-auth_amount').val('30').trigger('change');
    assert.equal($component.find('.t-currency-symbol').text().trim(), CURRENCY_DEFAULTS.symbol_native);
    assert.equal($component.find('.t-currency-code').text().trim(), CURRENCY_DEFAULTS.code);
    assert.equal($component.find('.t-person-auth_amount').val(), '30.00');
    assert.equal(model.get('auth_amount.amount'), '30');
});
