import Ember from 'ember';
import config from 'bsrs-ember/config/environment';

var API_HOST = config.APP.API_HOST;
var NAMESPACE = config.APP.NAMESPACE;

export default Ember.Object.extend({
    find: function() {
        var store = this.get('store');
        return store.find("country");
    }
});
