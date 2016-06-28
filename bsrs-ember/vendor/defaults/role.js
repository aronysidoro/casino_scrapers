var BSRS_ROLE_DEFAULTS_OBJECT = (function() {
  var factory = function(location_level, currency, tenant) {
    this.location_level = location_level;
    this.currency = currency;
    this.tenant = tenant;
  };
  factory.prototype.defaults = function() {
    return {
      idOne: 'af34ee9b-833c-4f3e-a584-b6851d1e04b1',
      idTwo: 'af34ee9b-833c-4f3e-a584-b6851d1e04b2',
      idGridOne: 'af34ee9b-833c-4f3e-a584-b6851d1e0404',
      idGridTen: 'af34ee9b-833c-4f3e-a584-b6851d1e04017',
      roleTypeContractor: 'Third Party',
      t_roleTypeContractor: 'admin.role.type.third_party',
      roleTypeGeneral: 'Internal',
      t_roleTypeGeneral: 'admin.role.type.internal',
      nameOne: 'System Administrator',
      nameTwo: 'District Manager',
      nameContractor: 'Contractor',
      nameCoordinator: 'Coordinator',
      nameThree: 'Manager',
      nameGrid: 'zap4',
      nameGridTen: 'zap10',
      nameGridXav: 'xav14',
      namePut: 'Broom Pusher',
      locationLevelNameOne: this.location_level.nameCompany,
      locationLevelNameTwo: this.location_level.nameRegion,
      locationLevelOne: this.location_level.idOne,
      locationLevelTwo: this.location_level.idTwo,
      categories: [],
      unusedId: 'af34ee9b-833c-4f3e-a584-b6851d1e04b3',
      dashboard_text: 'Hi',
      dashboard_textTwo: 'Bueno',
      auth_currency: this.currency.id,
      inherited: {
        dashboard_text: {
          value: null,
          inherited_value: 'Welcome',
          inherits_from: this.tenant.inherits_from_tenant,
          inherits_from_id: this.tenant.id
        },
        auth_currency: {
          value: null,
          inherited_value: this.currency.id,
          inherits_from: this.tenant.inherits_from_tenant,
          inherits_from_id: this.tenant.id
        }
      }
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  var location_level = require('./location-level');
  var currency = require('./currencies');
  var tenant = require('./tenant');
  module.exports = new BSRS_ROLE_DEFAULTS_OBJECT(location_level, currency, tenant).defaults();
} else {
  define('bsrs-ember/vendor/defaults/role',
    ['exports',
    'bsrs-ember/vendor/defaults/location-level',
    'bsrs-ember/vendor/defaults/currencies',
    'bsrs-ember/vendor/defaults/tenant'],
    function (exports, location_level, currency, tenant) {
    'use strict';
    return new BSRS_ROLE_DEFAULTS_OBJECT(location_level, currency, tenant).defaults();
  });
}
