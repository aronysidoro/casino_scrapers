import Ember from 'ember';

var CCMixin = Ember.Mixin.create({
    cc_ids: Ember.computed('cc.[]', function() {
        return this.get('cc').mapBy('id');
    }),
    cc: Ember.computed('ticket_cc.[]', function() {
        let ticket_cc = this.get('ticket_cc');
        let filter = function(person) {
            let person_pks = this.mapBy('person_pk');
            return Ember.$.inArray(person.get('id'), person_pks) > -1;
        };
        return this.get('store').find('person', filter.bind(ticket_cc), []);
    }),
    ticket_cc_ids: Ember.computed('ticket_cc.[]', function() {
        return this.get('ticket_cc').mapBy('id'); 
    }),
    ticket_cc: Ember.computed(function() {
        let filter = function(join_model) {
            return join_model.get('ticket_pk') === this.get('id') && !join_model.get('removed');
        };
        let store = this.get('store');
        return store.find('ticket-person', filter.bind(this), ['removed']);
    }),
    add_person(person_pk) {
        let uuid = this.get('uuid');
        let store = this.get('store');
        store.push('ticket-person', {id: uuid.v4(), ticket_pk: this.get('id'), person_pk: person_pk});
    },
    remove_person(person_pk) {
        let store = this.get('store');
        let m2m_pk = this.get('ticket_cc').filter((m2m) => {
            return m2m.get('person_pk') === person_pk;
        }).objectAt(0).get('id');
        store.push('ticket-person', {id: m2m_pk, removed: true});
    },
    rollbackCC() {
        let store = this.get('store');
        let previous_m2m_fks = this.get('ticket_people_fks') || [];

        let m2m_to_throw_out = store.find('ticket-person', function(join_model) {
            return Ember.$.inArray(join_model.get('id'), previous_m2m_fks) < 0 && !join_model.get('removed');
        }, ['removed']);

        m2m_to_throw_out.forEach(function(join_model) {
            join_model.set('removed', true);
        });

        previous_m2m_fks.forEach(function(pk) {
            var m2m_to_keep = store.find('ticket-person', pk);
            if (m2m_to_keep.get('id')) {
                m2m_to_keep.set('removed', undefined);
            }
        });
    },
    saveCC() {
        let ticket_cc = this.get('ticket_cc');
        let ticket_cc_ids = this.get('ticket_cc_ids') || [];
        let previous_m2m_fks = this.get('ticket_people_fks') || [];
        //add
        ticket_cc.forEach((join_model) => {
            if (Ember.$.inArray(join_model.get('id'), previous_m2m_fks) === -1) {
                previous_m2m_fks.pushObject(join_model.get('id'));
            } 
        });
        //remove
        for (let i=previous_m2m_fks.length-1; i>=0; --i) {
            if (Ember.$.inArray(previous_m2m_fks[i], ticket_cc_ids) === -1) {
                previous_m2m_fks.removeObject(previous_m2m_fks[i]);
            } 
        }
    },
});

export default CCMixin;

