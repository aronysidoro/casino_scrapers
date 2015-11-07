import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabNewRoute from 'bsrs-ember/route/tab/new-route';

var TicketNewRoute = TabNewRoute.extend({
    repository: inject('ticket'),
    statusRepository: inject('ticket-status'),
    categoryRepository: inject('category'),
    locationRepo: inject('location'),
    peopleRepo: inject('person'),
    priorityRepository: inject('ticket-priority'),
    redirectRoute: Ember.computed(function() { return 'tickets.index'; }),
    modelName: Ember.computed(function() { return 'ticket'; }),
    //TODO: tab tests say 'New ticket', not 'New Ticket'
    templateModelField: Ember.computed(function() { return 'Ticket'; }),
    queryParams: {
        search_cc: {
            refreshModel: true
        },
        search_location: {
            refreshModel: true
        },
        search_assignee: {
            refreshModel: true
        },
    },
    priorities: Ember.computed(function() {
        return this.get('priorityRepository').fetch();
    }),
    statuses: Ember.computed(function() {
        return this.get('statusRepository').fetch();
    }),
    model_fetch: Ember.computed(function() {
        return this.get('repository').create();
    }),
    model() {
        let model = this.get('model_fetch');
        let statuses = this.get('statuses');
        let priorities = this.get('priorities');
        let categoryRepo = this.get('categoryRepository');
        let top_level_category_options = categoryRepo.findTopLevelCategories() || [];
        let transition = arguments[1];

        let search_location = transition.queryParams.search_location;
        let ticket_location_options = this.get('locationRepo').findTicket(search_location);

        let search_assignee = transition.queryParams.search_assignee;
        let peopleRepo = this.get('peopleRepo');
        let ticket_assignee_options = peopleRepo.findTicketAssignee(search_assignee);

        let search_cc = transition.queryParams.search_cc;
        let ticket_cc_options = peopleRepo.findTicketPeople(search_cc);

        return Ember.RSVP.hash({
            model: model,
            statuses: statuses,
            priorities: priorities,
            top_level_category_options: top_level_category_options,
            ticket_location_options: ticket_location_options,
            ticket_assignee_options: ticket_assignee_options,
            ticket_cc_options: ticket_cc_options,
            search_location: search_location,
            search_assignee: search_assignee,
        });
    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('statuses', hash.statuses);
        controller.set('priorities', hash.priorities);
        controller.set('top_level_category_options', hash.top_level_category_options);
        controller.set('ticket_location_options', hash.ticket_location_options);
        controller.set('ticket_assignee_options', hash.ticket_assignee_options);
        controller.set('ticket_cc_options', hash.ticket_cc_options);
        controller.set('search_location', hash.search_location);
        controller.set('search_assignee', hash.search_assignee);
        controller.set('search_cc', hash.search_cc);
    }
});

export default TicketNewRoute;
