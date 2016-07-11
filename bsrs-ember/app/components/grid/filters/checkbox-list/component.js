import Ember from 'ember';
import injectService from 'ember-service/inject';

export default Ember.Component.extend({
  simpleStore: injectService(),
  classNames: ['t-checkbox-list'],
  filterModels: Ember.computed(function() {
    const field = this.get('column.filterModelName');
    const store = this.get('simpleStore');
    return store.find(field);
  }),
  actions: {
    /*  @method updateCheckbox
    * closure action sent up to grid-header-column-mobile
    * @param {string} column_field - un translated value ex// ticket.priority.emergency
    */
    updateCheckbox(column_field) {
      this.attrs.updateGridFilterParams(column_field);
    },
  },
  /* test classes START */
  classNameBindings: ['className'],
  className: Ember.computed(function() {
    return `t-checkbox-options-${this.get('column.classNames')}`;
  }),
  /* test classes END */
});
