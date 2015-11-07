var BSRS_GLOBAL_MESSAGE_DEFAULTS_OBJECT = (function() {
    var factory = function() {
    };
    factory.prototype.defaults = function() {
        return {
            modal_unsaved_msg: 'You have unsaved changes. Are you sure?',
            category_power_select: 'Please select a category',
            assignee_power_select: 'Please select an assignee',
            cc_power_select: 'Please select a cc',
            location_power_select: 'Please select a location',
            power_search: 'Type to search',
            no_results: 'No results found',
        };
    };
    return factory;
})();

if (typeof window === 'undefined') {
    module.exports = new BSRS_GLOBAL_MESSAGE_DEFAULTS_OBJECT().defaults();
} else {
    define('bsrs-ember/vendor/defaults/global-message', ['exports'], function (exports) {
        'use strict';
        return new BSRS_GLOBAL_MESSAGE_DEFAULTS_OBJECT().defaults();
    });
}

