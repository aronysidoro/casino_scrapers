import Ember from 'ember';
import injectRepo from 'bsrs-ember/utilities/inject';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';

export default Ember.Component.extend(TabMixin, {
  repository: injectRepo('<%= dasherizedModuleName %>'),
  // For db-fetch if applicable
  <%= secondModelCamel %>Repo: injectRepo('<%= secondModel %>'),
  actions: {
    save() {
      if (this.get('model.validations.isValid')) {
        const tab = this.tab();
        return this.get('save')(tab);
      }
      this.set('didValidate', true);
    }
  }
});
