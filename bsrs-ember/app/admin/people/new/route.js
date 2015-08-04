import Ember from 'ember';
import injectUUID from 'bsrs-ember/utilities/uuid';
import inject from 'bsrs-ember/utilities/inject';

export default Ember.Route.extend({
    uuid: injectUUID('uuid'),
    phone_number_type_repo: inject('phone-number-type'),
    model() {
        var pk = this.get('uuid').v4();
        var role_repo = this.get('role_repo');
        var roles = this.get('store').find('role-type');
        return Ember.RSVP.hash({
            model: this.get('store').push('person', {id: pk}),
            roles: roles
        });
    },
    setupController(controller, hash) {
        controller.set('model', hash.model);
        controller.set('roles', hash.roles);
    },
    actions: {
        willTransition(transition) {
            var model = this.currentModel.model;
            if (model.get('isDirtyOrRelatedDirty')) {
                $('.t-modal').modal('show');
                this.trx.attemptedTransition = transition;
                this.trx.attemptedTransitionModel = model;
                this.trx.newModel = true;
                this.trx.storeType = 'person';
                transition.abort();
            } else {
                $('.t-modal').modal('hide');
            }
        },
        redirectUser() {
            this.transitionTo('admin.people');
        }
    }
});
