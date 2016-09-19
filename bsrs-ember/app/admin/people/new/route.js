import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabNewRoute from 'bsrs-ember/route/tab/new-route';

var PersonNew = TabNewRoute.extend({
  repository: inject('person'),
  redirectRoute: 'admin.people.index',
  module: 'person',
  templateModelField: 'Person',
  model(params) {
    const new_pk = parseInt(params.new_id, 10);
    const roles = this.get('simpleStore').find('role');
    let model = this.get('simpleStore').find('person', {new_pk: new_pk}).objectAt(0);
    if(!model){
      model = this.get('repository').create(new_pk);
    }
    return Ember.RSVP.hash({
      model: model,
      roles: roles
    });
  },
  setupController(controller, hash) {
    controller.set('model', hash.model);
    controller.set('roles', hash.roles);
  },
  actions: {
    editPerson() {
      this.transitionTo('admin.people.person', this.currentModel.model.get('id'));
    },
  }
});

export default PersonNew;
