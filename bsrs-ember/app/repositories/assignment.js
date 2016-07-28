import Ember from 'ember';
const { run } = Ember;
import injectDeserializer from 'bsrs-ember/utilities/deserializer';
import injectUUID from 'bsrs-ember/utilities/uuid';
import FindByIdMixin from 'bsrs-ember/mixins/repositories/findById';
import CRUDMixin from 'bsrs-ember/mixins/repositories/crud';
import GridRepositoryMixin from 'bsrs-ember/mixins/repositories/grid';
import BASEURLS, { ASSIGNMENT_URL } from 'bsrs-ember/utilities/urls';

export default Ember.Object.extend(GridRepositoryMixin, FindByIdMixin, CRUDMixin, {
  type: 'assignment',
  typeGrid: 'assignment-list',
  garbage_collection: ['assignment-list'],
  uuid: injectUUID('uuid'),
  assignmentDeserializer: injectDeserializer('assignment'),
  url: ASSIGNMENT_URL,
  deserializer: Ember.computed.alias('assignmentDeserializer'),
});