import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import { getLabelText } from 'bsrs-ember/tests/helpers/translations';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import CD from 'bsrs-ember/vendor/defaults/currencies';

var store, run = Ember.run, trans;

moduleForComponent('role-single', 'integration: role-single test', {
  integration: true,
  setup() {
    store = module_registry(this.container, this.registry, ['model:role', 'model:currency']);
    trans = this.container.lookup('service:i18n');
    run(function() {
      store.push('currency', {
        id: CD.id,
        symbol: CD.symbol,
        name: CD.name,
        decimal_digits: CD.decimal_digits,
        code: CD.code,
        name_plural: CD.name_plural,
        rounding: CD.rounding,
        symbol_native: CD.symbol_native,
        default: true,
      });
    });
  }
});

test('translation keys', function(assert) {
  run(() => {
    this.set('model', store.push('role', {}));
  });
  this.render(hbs `{{roles/role-single model=model}}`);
  assert.equal(getLabelText('name'), trans.t('admin.role.label.name'));
  assert.equal(getLabelText('role_type'), trans.t('admin.role.label.role_type'));
  assert.equal(getLabelText('role_location_level_select'), trans.t('admin.location.label.location_level'));
  assert.equal(getLabelText('category'), trans.t('admin.role.label.category'));
  assert.equal(getLabelText('auth_amount'), trans.t('admin.person.label.auth_amount'));
  assert.equal(getLabelText('dashboard_text'), trans.t('admin.setting.dashboard_text'));
});