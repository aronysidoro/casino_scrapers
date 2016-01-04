import Ember from 'ember';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/store';
import windowProxy from 'bsrs-ember/utilities/window-proxy';
import config from 'bsrs-ember/config/environment';

export default Ember.Component.extend({
    store: inject('main'),
    tagName: 'li',
    classNames: ['current-user t-current-user'],
    personCurrent: Ember.inject.service(),
    instance: Ember.computed(function(){
        var service = this.get('personCurrent');
        return service.get('model');
    }),
    actions: {
        logout() {
            Ember.$.get('/api-auth/logout/', function(data){
                windowProxy.changeLocation('/login');
            });
            /*
            TODO:

            The ember promise mixin expects JSON back
            Django is currently returning html

            PromiseMixin.xhr('/api-auth/logout/', 'GET').then(() => {
                windowProxy.changeLocation('/login');
            });
            */

        }
    }
});
