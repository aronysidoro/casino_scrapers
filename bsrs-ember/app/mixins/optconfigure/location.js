import Ember from 'ember';

export default Ember.Mixin.create({
  OPT_CONF: {
    status: {
      collection: 'locations',
      property: 'location-status',
      related_model: 'status'
    },
    location_level: {
      collection: 'locations',
      property: 'location-level',
    },
    children: {
      associated_model: 'location',
      associated_pointer: 'children',
      join_model: 'location-children'
    },
    parents: {
      associated_model: 'location',
      associated_pointer: 'parents',
      join_model: 'location-parents'
    }
  },
});



