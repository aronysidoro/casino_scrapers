import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import RollbackModalMixin from 'bsrs-ember/mixins/route/rollback/existing';

export default Ember.Route.extend(RollbackModalMixin, {
    repository: inject('location'),
    model(params) {
        var location_pk = params.location_id;
        var all_location_levels = this.get('store').find('location-level');
        var all_statuses = this.get('store').find('location-status');
        var repository = this.get('repository');
        var model = repository.findById(location_pk);
        return Ember.RSVP.hash({
            model: model,
            all_location_levels: all_location_levels,
            all_statuses: all_statuses
        });

    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('all_location_levels', hash.all_location_levels);
        controller.set('all_statuses', hash.all_statuses);
    },
    actions: {
        deleteLocation() {
            var model = this.modelFor('admin.locations.location');
            // model.destroyRecord().then(() => {
            //   this.transitionTo('admin.people');
            // });
            this.transitionTo('admin.locations');
        },
        redirectUser() {
            this.transitionTo('admin.locations');
        }
    }
});

