import Ember from 'ember';
import { create, clickable, isVisible } from 'ember-cli-page-object';

export default create({
  toggleFilter: clickable('.t-mobile-filter'),
  filterAndSort: isVisible('.t-mobile-filters'),
  clickFilterRequest: clickable('.t-filter-request'),
  clickFilterPriority: clickable('.t-filter-priority-translated-name'),
  priorityOneCheck: clickable('.t-checkbox-list input:eq(0)'),
  priorityOneIsChecked: () => Ember.$('.t-checkbox-list input:eq(0)').is(':checked'),
});
