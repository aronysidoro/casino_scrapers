import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/route';
import FindById from 'bsrs-ember/mixins/route/findById';

var LocationRoute = TabRoute.extend(FindById, {
  i18n: Ember.inject.service(),
  title() {
    return this.get('i18n').t('doctitle.location.single', { name: this.get('name') });
  },
  name: undefined,
  repository: inject('location'),
  redirectRoute: 'admin.locations.index',
  module: 'location',
  templateModelField: Ember.computed(function() { return 'name'; }),
  model(params) {
    const pk = params.location_id;
    const repository = this.get('repository');
    let location = repository.fetch(pk);
    /* MOBILE SPECIFIC */
    const hashComponents = [
      {'title': this.get('i18n').t('admin.location.section.details'), 'component': 'locations/location/detail-section', active: 'active'},
      {'title': this.get('i18n').t('admin.location.section.contact'), 'component': 'locations/location/contact-section', active: ''},
      {'title': this.get('i18n').t('admin.location.section.organization'), 'component': 'locations/location/organization-section', active: ''},
    ];
    return this.findByIdScenario(location, pk, {repository:repository, hashComponents:hashComponents});
  },
  setupController: function(controller, hash) {
    controller.setProperties(hash);

    // set doctitle
    this.set('name', hash.model.get('name'));
  }
});

export default LocationRoute;
