import Ember from 'ember';
const { run } = Ember;
import { belongs_to, change_belongs_to, change_belongs_to_simple, belongs_to_dirty, belongs_to_rollback, belongs_to_rollback_simple, belongs_to_save } from 'bsrs-components/attr/belongs-to';


var TicketLocationMixin = Ember.Mixin.create({
    location: Ember.computed.alias('belongs_to_location.firstObject'),
    belongs_to_location: belongs_to('tickets', 'location'),
    remove_location() {
        let ticket_id = this.get('id');
        let store = this.get('store');
        let old_location = this.get('location');
        if(old_location) {
            let old_location_tickets = old_location.get('tickets') || [];
            let updated_old_location_tickets = old_location_tickets.filter(function(id) {
                return id !== ticket_id;
            });
            run(function() {
                store.push('location', {id: old_location.get('id'), tickets: updated_old_location_tickets});
            });
        }
    },
    change_location: change_belongs_to_simple('tickets', 'location'),
    saveLocation: belongs_to_save('ticket', 'location', 'location_fk'),
    rollbackLocation: belongs_to_rollback_simple('location_fk', 'location', 'change_location'),
});

export default TicketLocationMixin;
