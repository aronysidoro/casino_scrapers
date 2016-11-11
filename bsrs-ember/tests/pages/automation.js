import Ember from 'ember';
import { create, visitable, fillable, text, value, clickable } from 'ember-cli-page-object';
import BASEURLS, { AUTOMATION_URL, AUTOMATION_LIST_URL } from 'bsrs-ember/utilities/urls';
import AD from 'bsrs-ember/vendor/defaults/automation';
import PFD from 'bsrs-ember/vendor/defaults/pfilter';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import CD from 'bsrs-ember/vendor/defaults/criteria';

const BASE_URL = BASEURLS.BASE_AUTOMATION_URL;
const DETAIL_URL = `${BASE_URL}/${AD.idOne}`;
const AF_SELECT_ONE = '.t-automation-pf-select:eq(0) .ember-basic-dropdown-trigger';
const ACTION_ASSIGNEE_SELECT_ONE = '.t-automation-action-assignee-select:eq(0)';
const ACTION_PRIORITY_SELECT_ONE = '.t-ticket-priority-select:eq(0)';
const ACTION_STATUS_SELECT_ONE = '.t-ticket-status-select:eq(0)';

const ACTION_SEND_EMAIL_RECIPIENTS = '.t-action-recipient-select li.ember-power-select-multiple-option'; 
const ACTION_SEND_EMAIL_RECIPIENT_ONE = `${ACTION_SEND_EMAIL_RECIPIENTS}:eq(0)`;

const ACTION_SEND_SMS_RECIPIENTS = '.t-action-recipient-select li.ember-power-select-multiple-option'; 
const ACTION_SEND_SMS_RECIPIENT_ONE = `${ACTION_SEND_SMS_RECIPIENTS}:eq(0)`;

const ACTION_TICKETCC = '.t-action-ticketcc-select li.ember-power-select-multiple-option'; 
const ACTION_TICKETCC_ONE = `${ACTION_TICKETCC}:eq(0)`;

const EVENTS = '.t-automation-event-select .ember-power-select-multiple-option';

const PRIORITY = '.t-priority-criteria .ember-basic-dropdown-trigger > .ember-power-select-multiple-options';
const PRIORITIES = '.t-priority-criteria .ember-power-select-multiple-option';

const LOCATIONS = '.t-ticket-location-select .ember-power-select-multiple-option';
const CATEGORIES = '.t-ticket-category-select .ember-power-select-multiple-option';
const STATES = '.t-ticket-state-select .ember-power-select-multiple-option';
const COUNTRIES = '.t-ticket-country-select .ember-power-select-multiple-option';

export default create({
  visit: visitable(AUTOMATION_LIST_URL),
  visitDetail: visitable(DETAIL_URL),
  headerText: text('.t-automation-header'),
  descriptionValue: value('.t-automation-description'),
  descriptionFill: fillable('.t-automation-description'),
  descriptionGridOne: text('.t-automation-description:eq(0)'),
  descriptionSortText: text('.t-sort-description'),
  sendEmailBodyFillIn: fillable('.t-action-body0'),
  sendEmailSubjectFillIn: fillable('.t-action-subject0'),
  sendEmailBodyValue: value('.t-action-body0'),
  sendEmailSubjectValue: value('.t-action-subject0'),
  sendSmsBodyFillIn: fillable('.t-action-body0'),
  sendSmsBodyValue: value('.t-action-body0'),

  ticketRequestFillIn: fillable('.t-automation-ticket-request'),
  ticketRequestValue: value('.t-automation-ticket-request'),

  addFilter: clickable('.t-add-pf-btn'),
  deleteFilter: clickable('.t-del-pf-btn:eq(0)'),
  deleteFilterTwo: clickable('.t-del-pf-btn:eq(1)'),
  filterOnePriorityOneRemove: clickable('.ember-power-select-multiple-remove-btn', { scope: `${PRIORITIES}:eq(0)` }),

  automationFilterOneText: text('.t-automation-pf-select:eq(0)'),
  automationFilterTwoText: text('.t-automation-pf-select:eq(1)'),
  automationFilterThreeText: text('.t-automation-pf-select:eq(2)'),
  automationFilterFourText: text('.t-automation-pf-select:eq(3)'),

  eventSelectedOne: text(`${EVENTS}:eq(0)`),
  eventSelectedTwo: text(`${EVENTS}:eq(1)`),

  prioritySelectedOne: text(`${PRIORITIES}:eq(0)`),
  prioritySelectedTwo: text(`${PRIORITIES}:eq(1)`),
  priorityClickDropdown: clickable(PRIORITY),

  locationSelectedOne: text(`${LOCATIONS}:eq(0)`),
  categorySelectedOne: text(`${CATEGORIES}:eq(0)`),
  stateSelectedOne: text(`${STATES}:eq(0)`),
  countrySelectedOne: text(`${COUNTRIES}:eq(0)`),

  // actions
  clickAddActionBtn: clickable('.t-add-action-btn'),
  clickDeleteActionBtn: clickable('.t-del-action-btn:eq(0)'),
  clickDeleteActionBtnTwo: clickable('.t-del-action-btn:eq(1)'),

  actionTypeSelectedOne: text('.t-automation-action-type-select:eq(0)'),

  actionAssigneeSelectedOne: text(ACTION_ASSIGNEE_SELECT_ONE),
  actionPrioritySelectedOne: text(ACTION_PRIORITY_SELECT_ONE), 
  actionStatusSelectedOne: text(ACTION_STATUS_SELECT_ONE),
  actionSendEmailRecipientOne: text(`${ACTION_SEND_EMAIL_RECIPIENTS}:eq(0)`),
  actionSendEmailRecipientTwo: text(`${ACTION_SEND_EMAIL_RECIPIENTS}:eq(1)`),
  actionSendSmsRecipientOne: text(`${ACTION_SEND_SMS_RECIPIENTS}:eq(0)`),
  actionSendSmsRecipientTwo: text(`${ACTION_SEND_SMS_RECIPIENTS}:eq(1)`),
  actionTicketccOne: text(`${ACTION_TICKETCC}:eq(0)`),
});
