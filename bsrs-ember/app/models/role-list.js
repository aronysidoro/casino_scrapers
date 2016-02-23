import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';

export default Ember.Object.extend({
    store: inject('main'),
    role: Ember.computed(function() {
        const store = this.get('store'); 
        return store.find('role', this.get('id'));
    }),
    isDirtyOrRelatedDirty: Ember.computed('role.isDirtyOrRelatedDirty', function() {
        return this.get('role').get('isDirtyOrRelatedDirty');
    }),
    isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
    location_level: Ember.computed(function() {
        const store = this.get('store'); 
        const pk = this.get('location_level_fk');
        const location_levels = store.find('location-level');
        return location_levels.filter((llevel) => {
            return pk === llevel.get('id');
        }).objectAt(0);
    })
}); 

