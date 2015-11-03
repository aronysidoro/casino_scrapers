import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';
import injectUUID from 'bsrs-ember/utilities/uuid';
import GridRepositoryMixin from 'bsrs-ember/mixins/components/grid/repository';

var PREFIX = config.APP.NAMESPACE;
var CATEGORY_URL = PREFIX + '/admin/categories/';

var CategoryRepo = Ember.Object.extend(GridRepositoryMixin, {
    type: Ember.computed(function() { return 'category'; }),
    url: Ember.computed(function() { return CATEGORY_URL; }),
    uuid: injectUUID('uuid'),
    CategoryDeserializer: inject('category'),
    deserializer: Ember.computed.alias('CategoryDeserializer'),
    create(role_type) {
        let pk = this.get('uuid').v4();
        return this.store.push('category', {id: pk, new: true});
    },
    insert(model) {
        return PromiseMixin.xhr(CATEGORY_URL, 'POST', {data: JSON.stringify(model.serialize())}).then(() => {
            model.save();
        });
    },
    update(model) {
        return PromiseMixin.xhr(CATEGORY_URL + model.get('id') + '/', 'PUT', {data: JSON.stringify(model.serialize())}).then(() => {
            model.save();
        });   
    },
    findCategoryChildren(search) {
        let url = CATEGORY_URL;
        url += `?name__icontains=${search}`;
        PromiseMixin.xhr(url, 'GET').then((response) => {
            this.get('CategoryDeserializer').deserialize(response);
        });
        let filterFunc = function(category) {
            let name = category.get('name');
            return name.toLowerCase().indexOf(search.toLowerCase()) > -1 && !category.get('new');
        };
        //TODO: test case for filter on id
        return this.get('store').find('category', filterFunc, []);
    },
    findTopLevelCategories() {
        let url = CATEGORY_URL + '?parent__isnull=True';
        PromiseMixin.xhr(url, 'GET').then((response) => {
            response.results.forEach(function(category) {
                delete category.parent;
                //TODO: parent is now ALWAYS in the list payload so ... maybe kill this @toranb
            });
            this.get('CategoryDeserializer').deserialize(response);
        });
        let filterFunc = function(category) {
            return category.get('parent') === undefined;
        };
        return this.get('store').find('category', filterFunc, ['id']);
    },
    find() {
        PromiseMixin.xhr(CATEGORY_URL, 'GET').then((response) => {
            this.get('CategoryDeserializer').deserialize(response);
        });
        return this.get('store').find('category');
    },
    findById(id) {
        let model = this.get('store').find('category', id);
        //return id right away to allow for tabs to be pushed into store with correct id 
        model.id = id;
        PromiseMixin.xhr(CATEGORY_URL + id + '/', 'GET').then((response) => {
            this.get('CategoryDeserializer').deserialize(response, id);
        });
        return model;
    },
    delete(id) {
       PromiseMixin.xhr(CATEGORY_URL + id + '/', 'DELETE');
       this.get('store').remove('category', id);
    },
});

export default CategoryRepo;
