const BSRS_PERSON_ID = '139543cf-8fea-426a-8bc3-09778cd79951';
const BSRS_PERSON_USERNAME = 'mgibson';
const BSRS_PERSON_PASSWORD = '1!';
const BSRS_PERSON_EMAIL = 'abc@gmail.com';
const BSRS_PERSON_FIRST_NAME = 'Mel';
const BSRS_PERSON_MIDDLE_INITIAL = 'B';
const BSRS_PERSON_LAST_NAME = 'Gibson';
const BSRS_PERSON_ROLE = 1;
const BSRS_PERSON_EMP_NUMBER = '5063';
const BSRS_PERSON_AUTH_AMOUNT = '50000.00';
const BSRS_PERSON_TITLE = 'RVP';
const BSRS_PERSON_STATUS = 1;
const BSRS_PERSON_LOCATION = '';
const BSRS_PERSON_PHONE_NUMBERS = [];
const BSRS_PERSON_ADDRESSES = [];
const BSRS_PERSON_UNUSED_ID = 'cadba3ba-a533-44e0-ab1f-57cc1b052138';

var BSRS_PERSON_DEFAULT_VALUES = {id: BSRS_PERSON_ID, username: BSRS_PERSON_USERNAME, password: BSRS_PERSON_PASSWORD, email: BSRS_PERSON_EMAIL,  first_name: BSRS_PERSON_FIRST_NAME, middle_initial: BSRS_PERSON_MIDDLE_INITIAL, last_name: BSRS_PERSON_LAST_NAME, role: BSRS_PERSON_ROLE, status: BSRS_PERSON_STATUS, phone_numbers: BSRS_PERSON_PHONE_NUMBERS, addresses: BSRS_PERSON_ADDRESSES, location: BSRS_PERSON_LOCATION, emp_number: BSRS_PERSON_EMP_NUMBER, title: BSRS_PERSON_TITLE, auth_amount: BSRS_PERSON_AUTH_AMOUNT, unusedId: BSRS_PERSON_UNUSED_ID };

if (typeof window === 'undefined') {
    module.exports = BSRS_PERSON_DEFAULT_VALUES;
} else {
    define('bsrs-ember/vendor/defaults/person', ['exports'], function (exports) {
        'use strict';
        return BSRS_PERSON_DEFAULT_VALUES;
    });
}
