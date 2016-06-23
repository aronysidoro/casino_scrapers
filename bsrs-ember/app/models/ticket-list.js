import Ember from 'ember';
import { Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';

//TODO: does this need to be a model
export default Model.extend({
  simpleStore: Ember.inject.service(),
  ticket: Ember.computed(function() {
    const store = this.get('simpleStore');
    return store.find('ticket', this.get('id'));
  }),
  isDirtyOrRelatedDirty: Ember.computed('ticket.isDirtyOrRelatedDirty', function() {
    return this.get('ticket').get('isDirtyOrRelatedDirty');
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
  status: Ember.computed(function() {
    const store = this.get('simpleStore');
    const ticket_status_list = store.find('general-status-list');
    return ticket_status_list.filter((ts) => {
      return Ember.$.inArray(this.get('id'), ts.get('tickets')) > -1;
    }).objectAt(0);
  }),
  priority: Ember.computed(function() {
    const store = this.get('simpleStore');
    const ticket_priority_list = store.find('ticket-priority-list');
    return ticket_priority_list.filter((tp) => {
      return Ember.$.inArray(this.get('id'), tp.get('tickets')) > -1;
    }).objectAt(0);
  }),
  assignee: Ember.computed(function() {
    const store = this.get('simpleStore');
    const assignees = store.find('person-list');
    return assignees.filter((assignee) => {
      return Ember.$.inArray(this.get('id'), assignee.get('tickets')) > -1;
    }).objectAt(0);
  }),
  status_class: Ember.computed('status', function(){
    const name = this.get('status.name');
    return name ? name.replace(/\./g, '-') : '';
  }),
  priority_class: Ember.computed('priority', function(){
    const name = this.get('priority.name');
    return name ? name.replace(/\./g, '-') : '';
  }),
  location: Ember.computed(function() {
    const store = this.get('simpleStore');
    const locations = store.find('location-list');
    const location_pk = this.get('location_fk');
    return locations.filter((location) => {
      return location.get('id') === location_pk;
    }).objectAt(0);
  }),
  categories: Ember.computed(function() {
    const store = this.get('simpleStore');
    const categories = store.find('category-list');
    const category_ids = this.get('category_ids');
    const filtered_categories = categories.filter((cat) => {
      return Ember.$.inArray(cat.get('id'), category_ids) > -1;
    });
    const names = filtered_categories.sortBy('level').map((category) => {
      return category.get('name');
    }).join(' &#8226 ');
    return Ember.String.htmlSafe(names);
  }),
});
