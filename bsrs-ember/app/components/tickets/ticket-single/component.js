import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import EditMixin from 'bsrs-ember/mixins/components/tab/edit';
import RelaxedMixin from 'bsrs-ember/mixins/validation/relaxed';
import { validate } from 'ember-cli-simple-validation/mixins/validate';
import ParentValidationComponent from 'bsrs-ember/mixins/validation/parent';

var TicketSingleComponent = ParentValidationComponent.extend(RelaxedMixin, TabMixin, EditMixin, {
  personRepo: inject('person'),
  locationRepo: inject('location'),
  child_components: ['parent-model-category-select', 'ticket-comments-and-file-upload'],
  repository: inject('ticket'),
  activityRepository: inject('activity'),
  requestValidation: validate('model.request'),
  numberValidation: validate('model.number'),
  assigneeValidation: validate('model.assignee'),
  locationValidation: validate('model.location'),
  actions: {
    save(update=false, updateActivities=false) {
      this.set('submitted', true);
      if (this.all_components_valid()) {
        this._super(update, updateActivities);
      }
    },
    deleteAttachment(tab, callback) {
      this.sendAction('deleteAttachment', tab, callback);
    }
  } 
});

export default TicketSingleComponent;

