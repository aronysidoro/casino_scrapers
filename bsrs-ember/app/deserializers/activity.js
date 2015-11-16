import Ember from 'ember';

var extract_to_and_from = function(store, model) {
    const content = model.content;
    if (content && content.to && content.to.id) {
        store.push(`activity/${model.type}`, model.content.to);
        store.push(`activity/${model.type}`, model.content.from);
        model.to_fk = model.content.to.id;
        model.from_fk = model.content.from.id;
    }else if (content && content.added) {
        const type = model.type.dasherize();
        content.added.forEach((cc) => {
            cc.activities = [model.id];
            store.push(`activity/${type}`, cc);
        });
    }else if (content && content.removed) {
        const type = model.type.dasherize();
        content.removed.forEach((cc) => {
            cc.activities = [model.id];
            store.push(`activity/${type}`, cc);
        });
    }else if(content) {
        model.to_fk = model.content.to;
        model.from_fk = model.content.from;
    }
    delete model.content;
};

var extract_person = function(store, model) {
    store.push('activity/person', model.person);
    model.person_fk = model.person.id;
    delete model.person;
};

var ActivityDeserializer = Ember.Object.extend({
    deserialize(response, type) {
        const store = this.get('store');
        response.results.forEach((model) => {
            extract_to_and_from(store, model);
            extract_person(store, model);
            store.push('activity', model);
        });
    },
});

export default ActivityDeserializer;



