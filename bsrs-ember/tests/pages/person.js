import Ember from 'ember';
import PageObject from 'bsrs-ember/tests/page-object';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import PD from 'bsrs-ember/vendor/defaults/person';
import RD from 'bsrs-ember/vendor/defaults/role';
import LD from 'bsrs-ember/vendor/defaults/location';
import SD from 'bsrs-ember/vendor/defaults/status';
import { options } from 'bsrs-ember/tests/helpers/power-select-terms';

let { visitable, text, clickable, count, fillable, value } = PageObject;

const PREFIX = config.APP.NAMESPACE;
const BASE_PEOPLE_URL = BASEURLS.base_people_url;
const PEOPLE_URL = `${BASE_PEOPLE_URL}/index`;
const DETAIL_URL = `${BASE_PEOPLE_URL}/${PD.idOne}`;
const STATUS = '.t-status-select > .ember-basic-dropdown-trigger';
const DROPDOWN = options;
const LOCATION = '.t-person-locations-select > .ember-basic-dropdown-trigger > .ember-power-select-multiple-options';
const LOCATIONS = `${LOCATION} > .ember-power-select-multiple-option`;
const LOCATION_ONE = `${LOCATIONS}:eq(0)`;
const LOCATION_TWO = `${LOCATIONS}:eq(1)`;
const ROLE = '.t-person-role-select > .ember-basic-dropdown-trigger';
const LOCALE = '.t-locale-select > .ember-basic-dropdown-trigger';


export default PageObject.create({
  visit: visitable('/'),
  visitPeople: visitable(PEOPLE_URL),
  visitDetail: visitable(DETAIL_URL),
  statusInput: text(STATUS),
  statusClickDropdown: clickable(STATUS),
  statusClickOptionOne: clickable(`${DROPDOWN} > .ember-power-select-option:contains(${SD.activeNameTranslated})`),
  statusClickOptionTwo: clickable(`${DROPDOWN} > .ember-power-select-option:contains(${SD.inactiveNameTranslated})`),
  statusOptionLength: count(`${DROPDOWN} > li`),
  statusOne: text(`${DROPDOWN} > li:eq(0)`),
  statusTwo: text(`${DROPDOWN} > li:eq(1)`),
  statusThree: text(`${DROPDOWN} > li:eq(2)`),

  locationClickDropdown: clickable(LOCATION),
  locationClickOptionOne: clickable(`${DROPDOWN} > .ember-power-select-option:contains(${LD.storeName})`),
  locationClickOptionOneEq: clickable(`${DROPDOWN} > .ember-power-select-option:eq(0)`),
  locationClickOptionTwo: clickable(`${DROPDOWN} > .ember-power-select-option:contains(${LD.baseStoreName}4)`),
  locationOptionLength: count(`${DROPDOWN} > li`),
  locationOneRemove: clickable(`${LOCATION_ONE} > .ember-power-select-multiple-remove-btn`),
  locationOneSelected: text(LOCATION_ONE),
  locationTwoSelected: text(LOCATION_TWO),

  roleInput: text(ROLE),
  roleClickDropdown: clickable(ROLE),
  roleClickOptionOne: clickable(`${DROPDOWN} > .ember-power-select-option:contains(${RD.nameOne})`),
  roleClickOptionTwo: clickable(`${DROPDOWN} > .ember-power-select-option:contains(${RD.nameTwo})`),

  localeInput: text(LOCALE),
  localeClickDropdown: clickable(LOCALE),
  // localeClickOptionOne: clickable(`${DROPDOWN} > .ember-power-select-option:contains(${PD.localeOne})`),
  localeClickOptionTwo: clickable(`${DROPDOWN} > .ember-power-select-option:contains(${PD.localeTwo})`),
  localeOne: text(`${DROPDOWN} > li:eq(0)`),
  localeTwo: text(`${DROPDOWN} > li:eq(1)`),
  // localeThree: text(`${DROPDOWN} > li:eq(2)`),
  // localeFour: text(`${DROPDOWN} > li:eq(3)`),
  localeOptionLength: count(`${DROPDOWN} > li`),

  middleInitial: fillable('.t-person-middle-initial'),
  usernameFillIn: fillable('.t-person-username'),
  username: value('.t-person-username'),

  //settings
  acceptAssignChecked: () => Ember.$('.t-person-accept_assign').is(':checked'),
  acceptAssignClick: clickable('.t-person-accept_assign-label'),
  acceptAssignInheritedFromLabelText: text('.t-person-accept_assign-label-inherits_from'),
  acceptAssignLabelText: text('.t-person-accept_assign-label'),
  acceptAssignInheritedFromClick: clickable('.t-inherited-msg-accept_assign-link'),

  acceptNotifyChecked: () => Ember.$('.t-person-accept_notify').is(':checked'),
  acceptNotifyClick: clickable('.t-person-accept_notify-label'),
  acceptNotifyInheritedFromLabelText: text('.t-person-accept_notify-label-inherits_from'),
  acceptNotifyLabelText: text('.t-person-accept_notify-label'),
  acceptNotifyInheritedFromClick: clickable('.t-inherited-msg-accept_notify-link'),

  passwordOneTimeChecked: () => Ember.$('.t-person-password_one_time').is(':checked'),
  passwordOneTimeClick: clickable('.t-person-password_one_time-label'),
  passwordOneTimeLabelText: text('.t-person-password_one_time-label'),
});
