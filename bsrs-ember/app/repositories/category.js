import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';
import GridRepositoryMixin from 'bsrs-ember/mixins/components/grid/repository';

var PREFIX = config.APP.NAMESPACE;
var CATEGORY_URL = PREFIX + '/admin/categories/';

var CategoryRepo = Ember.Object.extend(GridRepositoryMixin, {
    type: Ember.computed(function() { return 'category'; }),
    url: Ember.computed(function() { return CATEGORY_URL; }),
    CategoryDeserializer: inject('category'),
    deserializer: Ember.computed.alias('CategoryDeserializer'),
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
            return name.toLowerCase().indexOf(search.toLowerCase()) > -1;
        };
        return this.get('store').find('category', filterFunc, []);
    },
    findTopLevelCategories(search) {
        let url = CATEGORY_URL + '?parent__isnull=True';
        PromiseMixin.xhr(url, 'GET').then((response) => {
            response.results.forEach(function(category) {
                category.parent = null;
            });
            this.get('CategoryDeserializer').deserialize(response);
        });
        //TODO: filter categories based on top level
        // let filterFunc = function(category) {
        //     let name = category.get('name');
        //     return name.toLowerCase().indexOf(search.toLowerCase()) > -1;
        // };
        return this.get('store').find('category');
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
