import Ember from 'ember';
import injectRepo from 'bsrs-ember/utilities/inject';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import { task } from 'ember-concurrency';

export default Ember.Component.extend(TabMixin, {
  // For db-fetch if applicable
  simpleStore: Ember.inject.service(),
  currencyRepo: injectRepo('currency'),
  countryRepo: injectRepo('country-db-fetch'),
  currencies: Ember.computed(function() {
    return this.get('simpleStore').find('currency');
  }),
  saveTask: task(function * () {
    if (this.get('model.validations.isValid')) {
      const tab = this.tab();
      yield this.get('save')(tab);
    }
    this.set('didValidate', true);
  }),
  actions: {
    save() {
      this.get('saveTask').perform();
    }
  }
});
