import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';
import GridRepositoryMixin from 'bsrs-ember/mixins/components/grid/repository';

var PREFIX = config.APP.NAMESPACE;
var ROLE_URL = PREFIX + '/admin/roles/';

var RoleRepo = Ember.Object.extend(GridRepositoryMixin, {
    type: Ember.computed(function() { return 'role'; }),
    url: Ember.computed(function() { return ROLE_URL; }),
    RoleDeserializer: inject('role'),
    deserializer: Ember.computed.alias('RoleDeserializer'),
    insert(model) {
        return PromiseMixin.xhr(ROLE_URL, 'POST', { data: JSON.stringify(model.serialize()) }).then(() => {
           model.save(); 
           model.saveRelated();
        });
    },
    update(model) {
        return PromiseMixin.xhr(ROLE_URL + model.get('id') + '/', 'PUT', {data: JSON.stringify(model.serialize())} ).then(() => {
            model.save();
            model.saveRelated();
        });
    },
    find() {
        PromiseMixin.xhr(ROLE_URL, 'GET').then((response) => {
            this.get('RoleDeserializer').deserialize(response);
        });
        return this.get('store').find('role');
    },
    findById(id) {
        let role = this.get('store').find('role', id);
        role.id = id;
        PromiseMixin.xhr(ROLE_URL + id + '/', 'GET').then((response) => {
            this.get('RoleDeserializer').deserialize(response, id);
        });
        return role;
    },
    delete(id) {
       PromiseMixin.xhr(ROLE_URL + id + '/', 'DELETE');
       this.get('store').remove('role', id);
    },
    get_default() {
        return this.get('store').find('role');
    }
});

export default RoleRepo;
