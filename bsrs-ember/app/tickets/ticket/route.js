import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/route';
import FindById from 'bsrs-ember/mixins/route/findById';

var TicketSingleRoute = TabRoute.extend(FindById, {
  activityRepository: inject('activity'),
  repository: inject('ticket'),
  attachmentRepository: inject('attachment'),
  i18n: Ember.inject.service(),
  transitionCB() {
    return {
      //should be an array
      otherFuncs: this.get('attachmentRepository').removeAllUnrelated()
    };
  },
  redirectRoute: 'tickets.index',
  module: 'ticket',
  templateModelField: 'categories',
  model(params) {
    const pk = params.ticket_id;
    const repository = this.get('repository');
    let ticket = repository.fetch(pk);
    const otherXhrs = [this.get('activityRepository').find('ticket', 'tickets', pk, ticket)];
    /* MOBILE SPECIFIC */
    const hashComponents = [
      {'title': this.get('i18n').t('ticket.section.activity'), 'component': 'mobile/ticket/activity-section', active: 'active'},
      {'title': this.get('i18n').t('ticket.section.details'), 'component': 'mobile/ticket/detail-section', active: ''},
      {'title': this.get('i18n').t('ticket.section.location'), 'component': 'mobile/ticket/location-section', active: ''},
    ];
    return this.findByIdScenario(ticket, pk, {repository:repository, hashComponents:hashComponents }, false, otherXhrs);
  },
  setupController: function(controller, hash) {
    controller.setProperties(hash);
    if (hash.otherXhrs) {
      controller.set('activities', hash.otherXhrs[0]);
    }
  },
});

export default TicketSingleRoute;
