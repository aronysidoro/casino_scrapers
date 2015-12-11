var BSRS_LOCATION_FACTORY = (function() {
    var factory = function(location_defaults, location_status_defaults, location_level_defaults, location_level_fixtures, config) {
        this.location_defaults = location_defaults;
        this.location_level_defaults = location_level_defaults;
        this.location_status_defaults = location_status_defaults;
        this.location_level_fixtures = location_level_fixtures.default || location_level_fixtures;
        this.config = config;
    };
    factory.prototype.get = function(i, name) {
        var name = name || this.location_defaults.storeName;
        return {
            id: i || this.location_defaults.idOne,
            name: name,
            number: this.location_defaults.storeName,
            location_level: this.location_level_fixtures.detail()
        }
    },
    factory.prototype.generate = function(i) {
        var id = i || this.location_defaults.idOne;
        return {
            id: id,
            name : this.location_defaults.baseStoreName,
            number : this.location_defaults.storeNumber,
            status: this.location_defaults.status,
            location_level: this.location_level_fixtures.detail(),
            children: [],
            parents: []
        }
    };
    factory.prototype.list = function() {
        var response = [];
        var page_size = this.config.default ? this.config.default.APP.PAGE_SIZE : 10;
        for (var i=1; i <= page_size; i++) {
            var uuid = '232z46cf-9fbb-456z-4hc3-59728vu3099';
            if (i < page_size) {
                uuid = uuid + '0' + i;
            } else{
                uuid = uuid + i;
            }
            var location = this.generate(uuid);
            location.name = location.name + i;
            location.number = location.number + i;
            location.status = this.location_status_defaults.openId;
            response.push(location);
        }
        //we do a reverse order sort here to verify a real sort occurs in the component
        var sorted = response.sort(function(a,b) {
            return b.id - a.id;
        });
        return {'count':page_size*2-1,'next':null,'previous':null,'results': sorted};
    };
    factory.prototype.list_two = function() {
        var response = [];
        var page_size = this.config.default ? this.config.default.APP.PAGE_SIZE : 10;
        for (var i=page_size+1; i <= page_size*2-1; i++) {
            var uuid = '232z46cf-9fbb-456z-4hc3-59728vu3099';
            var location = this.generate(uuid + i);
            location.name = 'vzoname' + i;
            location.number = 'sconumber' + i;
            location.status = this.location_status_defaults.closedId;
            response.push(location);
        }
        return {'count':page_size*2-1,'next':null,'previous':null,'results': response};
    };
    factory.prototype.detail = function(i) {
        return this.generate(this.location_defaults.idOne);
    };
    factory.prototype.put = function(location) {
        var response = this.generate(location.id);
        response.location_level = this.location_level_fixtures.detail().id;
        for(var key in location) {
            response[key] = location[key];
        }
        return response;
    };
    factory.prototype.search = function() {
        var location_one = this.get(this.location_defaults.idFour, this.location_defaults.storeNameFour);
        var location_two = this.get(this.location_defaults.idTwo, this.location_defaults.storeNameTwo);
        var response = [location_one, location_two];
        //we do a reverse order sort here to verify a real sort occurs in the component
        var sorted = response.sort(function(a,b) {
            return b.id - a.id;
        });
        return {'count':2,'next':null,'previous':null,'results': sorted};
    };
    factory.prototype.search_idThree = function() {
        var location_one = this.get(this.location_defaults.idThree, this.location_defaults.storeNameThree);
        var response = [location_one];
        return {'count':1,'next':null,'previous':null,'results': response};
    };
    return factory;
})();

if (typeof window === 'undefined') {
    var objectAssign = require('object-assign');
    var mixin = require('../vendor/mixin');
    var location_defaults = require('../vendor/defaults/location');
    var location_status_defaults = require('../vendor/defaults/location-status');
    var location_level_fixtures = require('../vendor/location_level_fixtures');
    var location_level_defaults = require('../vendor/defaults/location-level');
    var config = require('../config/environment');
    objectAssign(BSRS_LOCATION_FACTORY.prototype, mixin.prototype);
    module.exports = new BSRS_LOCATION_FACTORY(location_defaults, location_status_defaults, location_level_defaults, location_level_fixtures, config);
} else {
    define('bsrs-ember/vendor/location_fixtures', ['exports', 'bsrs-ember/vendor/defaults/location', 'bsrs-ember/vendor/defaults/location-status', 'bsrs-ember/vendor/defaults/location-level', 'bsrs-ember/vendor/location_level_fixtures', 'bsrs-ember/vendor/mixin', 'bsrs-ember/config/environment'], function (exports, location_defaults, location_status_defaults, location_level_defaults, location_level_fixtures, mixin, config) {
        'use strict';
        Object.assign(BSRS_LOCATION_FACTORY.prototype, mixin.prototype);
        var Factory = new BSRS_LOCATION_FACTORY(location_defaults, location_status_defaults, location_level_defaults, location_level_fixtures, config);
        return {default: Factory};
    });
}

