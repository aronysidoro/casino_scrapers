import Ember from 'ember';
const { run } = Ember;
import { test, module } from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import AD from 'bsrs-ember/vendor/defaults/assignment';
import AF from 'bsrs-ember/vendor/assignment_fixtures';
import assignmentDeserializer from 'bsrs-ember/deserializers/assignment';
import AFD from 'bsrs-ember/vendor/defaults/assignmentfilter';
import AJFD from 'bsrs-ember/vendor/defaults/assignment-join-filter';

var store, assignment, deserializer;

module('unit: assignment deserializer test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:assignment', 'model:assignment-list', 'model:person', 'model:assignment-join-filter', 'model:assignmentfilter', 'service:person-current', 'service:translations-fetcher', 'service:i18n']);
    deserializer = assignmentDeserializer.create({
      simpleStore: store
    });
    run(() => {
      assignment = store.push('assignment', { id: AD.idOne });
    });
  }
});

test('deserialize single', assert => {
  const json = AF.detail();
  run(() => {
    deserializer.deserialize(json, AD.idOne);
  });
  assert.equal(assignment.get('id'), AD.idOne);
  assert.equal(assignment.get('description'), AD.descriptionOne);
  assert.equal(assignment.get('assignee_fk'), AD.assigneeOne);
  assert.equal(assignment.get('assignee').get('id'), AD.assigneeOne);
  assert.equal(assignment.get('assignee').get('username'), AD.username);
});

// test('existing assignment w/ pf, and server returns no pf - want no pf b/c that is the most recent', assert => {
//   store.push('assignment-join-filter', {id: AJFD.idOne, assignment_pk: AD.idOne, assignmentfilter_pk: AFD.idOne});
//   assignment = store.push('assignment', {id: AD.idOne, joinModel_associatedModelFks: [AJFD.idOne]});
//   store.push('assignmentfilter', {id: AFD.idOne});
//   const pf = assignment.get('pf');
//   assert.equal(pf.get('length'), 1);
//   let json = AF.detail();
//   json.filters = [];
//   run(() => {
//     deserializer.deserialize(json, AD.idOne);
//   });
//   assignment = store.find('assignment', AD.idOne);
//   assert.equal(assignment.get('pf').get('length'), 0);
//   assert.ok(assignment.get('isNotDirty'));
//   assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
// });

test('existing assignment w/ pf, and server returns w/ 1 extra pf', assert => {
  store.push('assignment-join-filter', {id: AJFD.idOne, assignment_pk: AD.idOne, assignmentfilter_pk: AFD.idOne});
  store.push('assignment', {id: AD.idOne, joinModel_associatedModelFks: [AJFD.idOne]});
  store.push('assignmentfilter', {id: AFD.idOne});
  let json = AF.detail();
  json.filters.push({id: AFD.unusedId});
  run(() => {
    deserializer.deserialize(json, AD.idOne);
  });
  assignment = store.find('assignment', AD.idOne);
  assert.equal(assignment.get('pf').get('length'), 2);
  assert.ok(assignment.get('isNotDirty'));
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
});

test('existing assignment w/ pf and get same pf', assert => {
  store.push('assignment-join-filter', {id: AJFD.idOne, assignment_pk: AD.idOne, assignmentfilter_pk: AFD.idOne});
  store.push('assignment', {id: AD.idOne, joinModel_associatedModelFks: [AJFD.idOne]});
  store.push('assignmentfilter', {id: AFD.idOne});
  const json = AF.detail();
  run(() => {
    deserializer.deserialize(json, AD.idOne);
  });
  assignment = store.find('assignment', AD.idOne);
  assert.equal(assignment.get('pf').get('length'), 1);
  assert.ok(assignment.get('isNotDirty'));
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
});

test('deserialize list', assert => {
  let json = AF.list();
  run(() => {
    deserializer.deserialize(json);
  });
  assert.equal(store.find('assignment-list').get('length'), 20);
  const i = 0;
  assignment = store.find('assignment-list').objectAt(i);
  assert.equal(assignment.get('id'), `${AD.idOne.slice(0,-1)}${i}`);
  assert.equal(assignment.get('description'), `${AD.descriptionOne}${i}`);
  assert.equal(assignment.get('assignee').id, `${AD.assigneeOne.slice(0,-1)}${i}`);
  assert.equal(assignment.get('assignee').username, `${AD.username}${i}`);
});