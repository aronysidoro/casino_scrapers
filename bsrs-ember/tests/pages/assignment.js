import Ember from 'ember';
import { create, visitable, fillable, text, value, clickable } from 'ember-cli-page-object';
import { options } from 'bsrs-ember/tests/helpers/power-select-terms';
import BASEURLS, { ASSIGNMENT_URL, ASSIGNMENT_LIST_URL } from 'bsrs-ember/utilities/urls';
import AD from 'bsrs-ember/vendor/defaults/assignment';
import PFD from 'bsrs-ember/vendor/defaults/pfilter';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import CD from 'bsrs-ember/vendor/defaults/criteria';

const BASE_URL = BASEURLS.BASE_ASSIGNMENT_URL;
const DETAIL_URL = `${BASE_URL}/${AD.idOne}`;
const ASSIGNEE = '.t-assignment-assignee-select';
const DROPDOWN = options;
const AF_SELECT_ONE = '.t-assignment-pf-select:eq(0) .ember-basic-dropdown-trigger';
const PRIORITY = '.t-priority-criteria .ember-basic-dropdown-trigger > .ember-power-select-multiple-options';
const PRIORITIES = '.t-priority-criteria .ember-power-select-multiple-option';

const LOCATIONS = '.t-ticket-location-select .ember-power-select-multiple-option';
const CATEGORIES = '.t-ticket-category-select .ember-power-select-multiple-option';
const STATES = '.t-ticket-state-select .ember-power-select-multiple-option';
const COUNTRIES = '.t-ticket-country-select .ember-power-select-multiple-option';

export default create({
  visit: visitable(ASSIGNMENT_LIST_URL),
  visitDetail: visitable(DETAIL_URL),
  descriptionValue: value('.t-assignment-description'),
  descriptionFill: fillable('.t-assignment-description'),
  descriptionGridOne: text('.t-assignment-description:eq(0)'),
  descriptionSortText: text('.t-sort-description'),

  assigneeInput: text(ASSIGNEE),
  assigneeSortText: text('.t-sort-assignee-fullname'),
  assigneeGridOne: text('.t-assignment-assignee-fullname:eq(0)'),

  addFilter: clickable('.t-add-pf-btn'),
  deleteFilter: clickable('.t-del-pf-btn:eq(0)'),
  deleteFilterTwo: clickable('.t-del-pf-btn:eq(1)'),
  filterOneClickDropdown: clickable('.t-assignment-pf-select:eq(0) .ember-basic-dropdown-trigger'),
  filterOneClickOptionTwo: clickable(`.ember-power-select-option:contains(${PFD.keyTwo})`, { scope: DROPDOWN }),
  filterOneClickOptionAutoAssign: clickable(`.ember-power-select-option:contains(${PFD.autoAssignKey})`, { scope: DROPDOWN }),
  filterOnePriorityOneRemove: clickable('.ember-power-select-multiple-remove-btn', { scope: `${PRIORITIES}:eq(0)` }),

  assignmentFilterOneText: text('.t-assignment-pf-select:eq(0)'),
  assignmentFilterTwoText: text('.t-assignment-pf-select:eq(1)'),
  assignmentFilterThreeText: text('.t-assignment-pf-select:eq(2)'),
  assignmentFilterFourText: text('.t-assignment-pf-select:eq(3)'),

  assignmentFilterOneInput: text(AF_SELECT_ONE),
  assignmentFilterOneClickDropdown: clickable(AF_SELECT_ONE),
  assignmentFilterOneOptionOneText: text('li:eq(0)', { scope: DROPDOWN }),
  assignmentFilterOneOptionTwoText: text('li:eq(1)', { scope: DROPDOWN }),
  assignmentFilterOneOptionThreeText: text('li:eq(2)', { scope: DROPDOWN }),

  prioritySelectedOne: text(`${PRIORITIES}:eq(0)`),
  prioritySelectedTwo: text(`${PRIORITIES}:eq(1)`),
  priorityClickDropdown: clickable(PRIORITY),

  locationSelectedOne: text(`${LOCATIONS}:eq(0)`),
  categorySelectedOne: text(`${CATEGORIES}:eq(0)`),
  stateSelectedOne: text(`${STATES}:eq(0)`),
  countrySelectedOne: text(`${COUNTRIES}:eq(0)`),
});
