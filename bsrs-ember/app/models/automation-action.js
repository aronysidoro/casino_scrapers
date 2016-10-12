import Ember from 'ember';
const { run } = Ember;
import { attr, Model } from 'ember-cli-simple-store/model';
import { belongs_to } from 'bsrs-components/attr/belongs-to';
import { validator, buildValidations } from 'ember-cp-validations';
import OptConf from 'bsrs-ember/mixins/optconfigure/automation-action';
import SaveAndRollbackRelatedMixin from 'bsrs-ember/mixins/model/save-and-rollback-related';

const Validations = buildValidations({
  type: [
    validator('presence', {
      presence: true,
      message: 'errors.automation.type'
    }),
    validator('automation-action-type')
  ]
});

export default Model.extend(OptConf, Validations, SaveAndRollbackRelatedMixin, {
  init() {
    this._super(...arguments);
    belongs_to.bind(this)('type', 'automation-action');
    // optional related models based upon the "type"
    belongs_to.bind(this)('assignee', 'automation-action');
    belongs_to.bind(this)('priority', 'automation-action');
    belongs_to.bind(this)('status', 'automation-action');
    belongs_to.bind(this)('sendemail', 'automation-action');
  },
  simpleStore: Ember.inject.service(),
  sendemailIsDirtyContainer: Ember.computed('sendemailIsDirty', 'sendemail.isDirtyOrRelatedDirty', function() {
    return this.get('sendemailIsDirty') || this.get('sendemail.isDirtyOrRelatedDirty');
  }),
  isDirtyOrRelatedDirty: Ember.computed('isDirty', 'assigneeIsDirty', 'typeIsDirty', 'priorityIsDirty', 'statusIsDirty', 'sendemailIsDirtyContainer', function() {
    return this.get('isDirty') || this.get('assigneeIsDirty') || this.get('typeIsDirty') || this.get('priorityIsDirty') || this.get('statusIsDirty') || this.get('sendemailIsDirtyContainer');
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
  rollback() {
    this.rollbackType();
    this.rollbackAssignee();
    this.rollbackPriority();
    this.rollbackStatus();
    this.rollbackSendemail();
    this._super(...arguments);
  },
  saveRelated() {
    this.saveType();
    this.saveAssignee();
    this.savePriority();
    this.saveStatus();
    this.saveRelatedBelongsTo('sendemail');
    this.saveSendemail();
  },
  serialize() {
    let content;
    switch (this.get('type.key')) {
      case 'automation.actions.ticket_assignee':
        content = {assignee: this.get('assignee.id')};
        break;
      case 'automation.actions.ticket_priority':
        content = {priority: this.get('priority.id')};
        break;
      case 'automation.actions.ticket_status':
        content = {status: this.get('status.id')};
        break;
    }
    return {
      id: this.get('id'),
      type: this.get('type.id'),
      content: content
    };
  },
  remove_type(id) {
    const store = this.get('simpleStore');
    let actionsArr = store.find('automation-action-type', id).get('actions');
    actionsArr.splice(actionsArr.indexOf(this.get('id')), 1);
    run(() => {
      store.push('automation-action-type', {id:this.get('id'), actions: actionsArr});
    });
  }
});
