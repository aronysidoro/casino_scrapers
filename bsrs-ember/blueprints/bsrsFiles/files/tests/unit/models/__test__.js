import Ember from 'ember';
const { run } = Ember;
import { moduleFor, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import <%= camelizedModuleName %>D from 'bsrs-ember/vendor/defaults/<%= dasherizedModuleName %>';
import <%= camelizedModuleName %>F from 'bsrs-ember/vendor/<%= dasherizedModuleName %>_fixtures';
import <%= secondModelTitle %>D from 'bsrs-ember/vendor/defaults/<%= secondModel %>';
import <%= thirdAssociatedModelTitle %>D from 'bsrs-ember/vendor/defaults/<%= thirdAssociatedModel %>';
import <%= thirdJoinModelTitle %>D from 'bsrs-ember/vendor/defaults/<%= thirdJoinModel %>';

var store, <%= camelizedModuleName %>;

moduleFor('model:<%= camelizedModuleName %>', 'Unit | Model | <%= camelizedModuleName %>', {
  beforeEach() {
    needs: ['validator:presence', 'validator:length', 'validator:format', 'validator:unique-username'],
    store = module_registry(this.container, this.registry, ['model:<%= dasherizedModuleName %>', 'model:<%= thirdJoinModel %>', 'model:<%= thirdAssociatedModel %>', 'model:<%= secondModel %>', 'model:person-current', 'service:person-current', 'service:translations-fetcher', 'service:i18n']);
    run(() => {
      <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= camelizedModuleName %>D.idOne});
    });
  }
});

test('dirty test | <%= firstProperty %>', assert => {
  assert.equal(<%= camelizedModuleName %>.get('isDirty'), false);
  <%= camelizedModuleName %>.set('<%= firstProperty %>', 'wat');
  assert.equal(<%= camelizedModuleName %>.get('isDirty'), true);
  <%= camelizedModuleName %>.set('<%= firstProperty %>', '');
  assert.equal(<%= camelizedModuleName %>.get('isDirty'), false);
});

test('serialize', assert => {
  <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= camelizedModuleName %>D.idOne, <%= firstProperty %>: <%= camelizedModuleName %>D.descOne, <%= secondPropertySnake %>_fk: <%= secondModelTitle %>D.idOne});
  store.push('<%= secondModel %>', {id: <%= secondModelTitle %>D.idOne, <%= SnakeModuleName %>s: [<%= camelizedModuleName %>D.idOne]});
  store.push('<%= thirdJoinModel %>', {id: <%= thirdJoinModelTitle %>D.idOne, <%= SnakeModuleName %>_pk: <%= camelizedModuleName %>D.idOne, <%= thirdAssociatedModelSnake %>_pk: <%= thirdAssociatedModelTitle %>D.idOne});
  store.push('<%= thirdAssociatedModel %>', {id: <%= thirdAssociatedModelTitle %>D.idOne});
  let ret = <%= camelizedModuleName %>.serialize();
  assert.equal(ret.id, <%= camelizedModuleName %>D.idOne);
  assert.equal(ret.<%= firstProperty %>, <%= camelizedModuleName %>D.descOne);
  assert.equal(ret.<%= secondPropertySnake %>, <%= camelizedModuleName %>D.<%= secondPropertyCamel %>One);
  assert.equal(ret.filters.length, 1);
});

/* <%= secondProperty %> */
test('related <%= secondModel %> should return one <%= secondModel %> for a <%= SnakeModuleName %>', (assert) => {
  <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= camelizedModuleName %>D.idOne, <%= secondPropertySnake %>_fk: <%= secondModelTitle %>D.idOne});
  store.push('<%= secondModel %>', {id: <%= secondModelTitle %>D.idOne, <%= SnakeModuleName %>s: [<%= camelizedModuleName %>D.idOne]});
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>').get('id'), <%= secondModelTitle %>D.idOne);
});

test('change_<%= secondPropertySnake %> - will update the <%= secondModel %>s <%= secondPropertySnake %> and dirty the model', (assert) => {
  <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= camelizedModuleName %>D.idOne, <%= secondPropertySnake %>_fk: undefined});
  store.push('<%= secondModel %>', {id: <%= secondModelTitle %>D.idOne, <%= SnakeModuleName %>s: []});
  let inactive_<%= secondPropertySnake %> = store.push('<%= secondModel %>', {id: <%= secondModelTitle %>D.idTwo, <%= SnakeModuleName %>s: []});
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>'), undefined);
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>IsNotDirty'));
  <%= camelizedModuleName %>.change_<%= secondPropertySnake %>({id: <%= secondModelTitle %>D.idOne});
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>_fk'), undefined);
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>.id'), <%= secondModelTitle %>D.idOne);
  <%= camelizedModuleName %>.change_<%= secondPropertySnake %>({id: inactive_<%= secondPropertySnake %>.get('id')});
  assert.ok(<%= camelizedModuleName %>.get('isDirtyOrRelatedDirty'));
  assert.ok(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>IsDirty'));
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>_fk'), undefined);
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>.id'), <%= secondModelTitle %>D.idTwo);
  assert.ok(<%= camelizedModuleName %>.get('isDirtyOrRelatedDirty'));
  assert.ok(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>IsDirty'));
});

test('save<%= secondPropertyTitle %> - <%= secondPropertySnake %> - <%= SnakeModuleName %>will set <%= secondPropertySnake %>_fk to current <%= secondPropertySnake %> id', (assert) => {
  <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= camelizedModuleName %>D.idOne, <%= secondPropertySnake %>_fk: <%= secondModelTitle %>D.idOne});
  store.push('<%= secondModel %>', {id: <%= secondModelTitle %>D.idOne, <%= SnakeModuleName %>s: [<%= camelizedModuleName %>D.idOne]});
  let inactive_<%= secondPropertySnake %> = store.push('<%= secondModel %>', {id: <%= secondModelTitle %>D.idTwo, <%= SnakeModuleName %>s: []});
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>_fk'), <%= secondModelTitle %>D.idOne);
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>.id'), <%= secondModelTitle %>D.idOne);
  <%= camelizedModuleName %>.change_<%= secondPropertySnake %>({id: inactive_<%= secondPropertySnake %>.get('id')});
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>_fk'), <%= secondModelTitle %>D.idOne);
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>.id'), <%= secondModelTitle %>D.idTwo);
  assert.ok(<%= camelizedModuleName %>.get('isDirtyOrRelatedDirty'));
  assert.ok(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>IsDirty'));
  <%= camelizedModuleName %>.save<%= secondPropertyTitle %>();
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(!<%= camelizedModuleName %>.get('<%= secondPropertySnake %>IsDirty'));
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>_fk'), <%= secondModelTitle %>D.idTwo);
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>.id'), <%= secondModelTitle %>D.idTwo);
});

test('rollback<%= secondPropertyTitle %> - <%= secondPropertySnake %> - <%= SnakeModuleName %>will set <%= secondPropertySnake %> to current <%= secondPropertySnake %>_fk', (assert) => {
  <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= camelizedModuleName %>D.idOne, <%= secondPropertySnake %>_fk: <%= secondModelTitle %>D.idOne});
  store.push('<%= secondModel %>', {id: <%= secondModelTitle %>D.idOne, <%= SnakeModuleName %>s: [<%= camelizedModuleName %>D.idOne]});
  let inactive_<%= secondPropertySnake %> = store.push('<%= secondModel %>', {id: <%= secondModelTitle %>D.idTwo, <%= SnakeModuleName %>s: []});
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>_fk'), <%= secondModelTitle %>D.idOne);
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>.id'), <%= secondModelTitle %>D.idOne);
  <%= camelizedModuleName %>.change_<%= secondPropertySnake %>({id: inactive_<%= secondPropertySnake %>.get('id')});
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>_fk'), <%= secondModelTitle %>D.idOne);
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>.id'), <%= secondModelTitle %>D.idTwo);
  assert.ok(<%= camelizedModuleName %>.get('isDirtyOrRelatedDirty'));
  assert.ok(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>IsDirty'));
  <%= camelizedModuleName %>.rollback<%= secondPropertyTitle %>();
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(!<%= camelizedModuleName %>.get('<%= secondPropertySnake %>IsDirty'));
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>.id'), <%= secondModelTitle %>D.idOne);
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>_fk'), <%= secondModelTitle %>D.idOne);
});

/* <%= SnakeModuleName %>& PROFILE_FILTER */
test('<%= thirdProperty %>s property should return all associated <%= thirdProperty %>s. also confirm related and join model attr values', (assert) => {
  store.push('<%= thirdJoinModel %>', {id: <%= thirdJoinModelTitle %>D.idOne, <%= SnakeModuleName %>_pk: <%= camelizedModuleName %>D.idOne, <%= thirdAssociatedModelSnake %>_pk: <%= thirdAssociatedModelTitle %>D.idOne});
  <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= camelizedModuleName %>D.idOne, <%= joinModel_associatedModelFks %>: [<%= thirdJoinModelTitle %>D.idOne]});
  store.push('<%= thirdAssociatedModel %>', {id: <%= thirdAssociatedModelTitle %>D.idOne});
  let <%= thirdProperty %>s = <%= camelizedModuleName %>.get('<%= thirdProperty %>s');
  assert.equal(<%= thirdProperty %>s.get('length'), 1);
  assert.deepEqual(<%= camelizedModuleName %>.get('<%= thirdProperty %>s_ids'), [<%= thirdAssociatedModelTitle %>D.idOne]);
  assert.deepEqual(<%= camelizedModuleName %>.get('<%= joinModel_associatedModelIds %>'), [<%= thirdJoinModelTitle %>D.idOne]);
  assert.equal(<%= thirdProperty %>s.objectAt(0).get('id'), <%= thirdAssociatedModelTitle %>D.idOne);
});

test('<%= thirdProperty %>s property is not dirty when no <%= thirdProperty %>s present (undefined)', (assert) => {
  <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= camelizedModuleName %>D.idOne, <%= joinModel_associatedModelFks %>: undefined});
  store.push('<%= thirdAssociatedModel %>', {id: <%= thirdAssociatedModelTitle %>D.id});
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdProperty %>s').get('length'), 0);
  assert.ok(<%= camelizedModuleName %>.get('<%= thirdProperty %>sIsNotDirty'));
});

test('<%= thirdProperty %>s property is not dirty when no <%= thirdProperty %>s present (empty array)', (assert) => {
  <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= camelizedModuleName %>D.idOne, <%= joinModel_associatedModelFks %>: []});
  store.push('<%= thirdAssociatedModel %>', {id: <%= thirdAssociatedModelTitle %>D.id});
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdProperty %>s').get('length'), 0);
  assert.ok(<%= camelizedModuleName %>.get('<%= thirdProperty %>sIsNotDirty'));
});

test('remove_<%= thirdProperty %> - will remove join model and mark model as dirty', (assert) => {
  store.push('<%= thirdJoinModel %>', {id: <%= thirdJoinModelTitle %>D.idOne, <%= SnakeModuleName %>_pk: <%= camelizedModuleName %>D.idOne, <%= thirdAssociatedModelSnake %>_pk: <%= thirdAssociatedModelTitle %>D.idOne});
  store.push('<%= thirdAssociatedModel %>', {id: <%= thirdAssociatedModelTitle %>D.idOne});
  <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= camelizedModuleName %>D.idOne, <%= joinModel_associatedModelFks %>: [<%= thirdJoinModelTitle %>D.idOne]});
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdProperty %>s').get('length'), 1);
  assert.equal(<%= camelizedModuleName %>.get('<%= joinModel_associatedModelIds %>').length, 1);
  assert.equal(<%= camelizedModuleName %>.get('<%= joinModel_associatedModelFks %>').length, 1);
  assert.ok(<%= camelizedModuleName %>.get('<%= thirdProperty %>sIsNotDirty'));
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  <%= camelizedModuleName %>.remove_<%= thirdProperty %>(<%= thirdAssociatedModelTitle %>D.idOne);
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdProperty %>s').get('length'), 0);
  assert.equal(<%= camelizedModuleName %>.get('<%= joinModel_associatedModelIds %>').length, 0);
  assert.equal(<%= camelizedModuleName %>.get('<%= joinModel_associatedModelFks %>').length, 1);
  assert.ok(<%= camelizedModuleName %>.get('<%= thirdProperty %>sIsDirty'));
  assert.ok(<%= camelizedModuleName %>.get('isDirtyOrRelatedDirty'));
});

test('add_<%= thirdProperty %> - will create join model and mark model dirty', (assert) => {
  store.push('<%= thirdJoinModel %>', {id: <%= thirdJoinModelTitle %>D.idOne, <%= SnakeModuleName %>_pk: <%= camelizedModuleName %>D.idOne, <%= thirdAssociatedModelSnake %>_pk: <%= thirdAssociatedModelTitle %>D.idOne});
  store.push('<%= thirdAssociatedModel %>', {id: <%= thirdAssociatedModelTitle %>D.idOne});
  <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= camelizedModuleName %>D.idOne, <%= joinModel_associatedModelFks %>: [<%= thirdJoinModelTitle %>D.idOne]});
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdProperty %>s').get('length'), 1);
  assert.equal(<%= camelizedModuleName %>.get('<%= joinModel_associatedModelIds %>').length, 1);
  assert.equal(<%= camelizedModuleName %>.get('<%= joinModel_associatedModelFks %>').length, 1);
  assert.deepEqual(<%= camelizedModuleName %>.get('<%= thirdProperty %>s_ids'), [<%= thirdAssociatedModelTitle %>D.idOne]);
  assert.ok(<%= camelizedModuleName %>.get('<%= thirdProperty %>sIsNotDirty'));
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  <%= camelizedModuleName %>.add_<%= thirdProperty %>({id: <%= thirdAssociatedModelTitle %>D.idTwo});
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdProperty %>s').get('length'), 2);
  assert.equal(<%= camelizedModuleName %>.get('<%= joinModel_associatedModelIds %>').length, 2);
  assert.equal(<%= camelizedModuleName %>.get('<%= joinModel_associatedModelFks %>').length, 1);
  assert.deepEqual(<%= camelizedModuleName %>.get('<%= thirdProperty %>s_ids'), [<%= thirdAssociatedModelTitle %>D.idOne, <%= thirdAssociatedModelTitle %>D.idTwo]);
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdProperty %>s').objectAt(0).get('id'), <%= thirdAssociatedModelTitle %>D.idOne);
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdProperty %>s').objectAt(1).get('id'), <%= thirdAssociatedModelTitle %>D.idTwo);
  assert.ok(<%= camelizedModuleName %>.get('<%= thirdProperty %>sIsDirty'));
  assert.ok(<%= camelizedModuleName %>.get('isDirtyOrRelatedDirty'));
});

test('savePfs - <%= thirdProperty %>s - will reset the previous <%= thirdProperty %>s with multiple <%= SnakeModuleName %>s', (assert) => {
  store.push('<%= thirdAssociatedModel %>', {id: <%= thirdAssociatedModelTitle %>D.idOne});
  store.push('<%= thirdAssociatedModel %>', {id: <%= thirdAssociatedModelTitle %>D.idTwo});
  const <%= thirdAssociatedModelSnake %>_unused = {id: <%= thirdAssociatedModelTitle %>D.unusedId};
  store.push('<%= thirdJoinModel %>', {id: <%= thirdJoinModelTitle %>D.idOne, <%= SnakeModuleName %>_pk: <%= camelizedModuleName %>D.idOne, <%= thirdAssociatedModelSnake %>_pk: <%= thirdAssociatedModelTitle %>D.idOne});
  store.push('<%= thirdJoinModel %>', {id: <%= thirdJoinModelTitle %>D.idTwo, <%= SnakeModuleName %>_pk: <%= camelizedModuleName %>D.idOne, <%= thirdAssociatedModelSnake %>_pk: <%= thirdAssociatedModelTitle %>D.idTwo});
  <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= camelizedModuleName %>D.idOne, <%= joinModel_associatedModelFks %>: [<%= thirdJoinModelTitle %>D.idOne, <%= thirdJoinModelTitle %>D.idTwo]});
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdProperty %>s').get('length'), 2);
  <%= camelizedModuleName %>.remove_<%= thirdProperty %>(<%= thirdAssociatedModelTitle %>D.idOne);
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdProperty %>s').get('length'), 1);
  assert.ok(<%= camelizedModuleName %>.get('<%= thirdProperty %>sIsDirty'));
  assert.ok(<%= camelizedModuleName %>.get('isDirtyOrRelatedDirty'));
  <%= camelizedModuleName %>.savePfs();
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdProperty %>s').get('length'), 1);
  assert.ok(<%= camelizedModuleName %>.get('isNotDirty'));
  assert.ok(<%= camelizedModuleName %>.get('<%= thirdProperty %>sIsNotDirty'));
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  <%= camelizedModuleName %>.add_<%= thirdProperty %>(<%= thirdAssociatedModelSnake %>_unused);
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdProperty %>s').get('length'), 2);
  assert.ok(<%= camelizedModuleName %>.get('<%= thirdProperty %>sIsDirty'));
  assert.ok(<%= camelizedModuleName %>.get('isDirtyOrRelatedDirty'));
  <%= camelizedModuleName %>.savePfs();
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdProperty %>s').get('length'), 2);
  assert.ok(<%= camelizedModuleName %>.get('isNotDirty'));
  assert.ok(<%= camelizedModuleName %>.get('<%= thirdProperty %>sIsNotDirty'));
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollbackPfs - <%= thirdProperty %>s - multiple <%= SnakeModuleName %>s with the same <%= thirdProperty %>s will rollbackPfs correctly', (assert) => {
  store.push('<%= thirdJoinModel %>', {id: <%= thirdJoinModelTitle %>D.idOne, <%= SnakeModuleName %>_pk: <%= camelizedModuleName %>D.idOne, <%= thirdAssociatedModelSnake %>_pk: <%= thirdAssociatedModelTitle %>D.idOne});
  store.push('<%= thirdJoinModel %>', {id: <%= thirdJoinModelTitle %>D.idTwo, <%= SnakeModuleName %>_pk: <%= camelizedModuleName %>D.idTwo, <%= thirdAssociatedModelSnake %>_pk: <%= thirdAssociatedModelTitle %>D.idOne});
  store.push('<%= thirdAssociatedModel %>', {id: <%= thirdAssociatedModelTitle %>D.idOne});
  <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= camelizedModuleName %>D.idOne, <%= joinModel_associatedModelFks %>: [<%= thirdJoinModelTitle %>D.idOne]});
  let <%= SnakeModuleName %>_two = store.push('<%= dasherizedModuleName %>', {id: <%= camelizedModuleName %>D.idTwo, <%= joinModel_associatedModelFks %>: [<%= thirdJoinModelTitle %>D.idTwo]});
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdProperty %>s').get('length'), 1);
  assert.equal(<%= SnakeModuleName %>_two.get('<%= thirdProperty %>s').get('length'), 1);
  assert.ok(<%= camelizedModuleName %>.get('<%= thirdProperty %>sIsNotDirty'));
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(<%= SnakeModuleName %>_two.get('<%= thirdProperty %>sIsNotDirty'));
  assert.ok(<%= SnakeModuleName %>_two.get('isNotDirtyOrRelatedNotDirty'));
  <%= SnakeModuleName %>_two.remove_<%= thirdProperty %>(<%= thirdAssociatedModelTitle %>D.idOne);
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdProperty %>s').get('length'), 1);
  assert.equal(<%= SnakeModuleName %>_two.get('<%= thirdProperty %>s').get('length'), 0);
  assert.ok(<%= camelizedModuleName %>.get('<%= thirdProperty %>sIsNotDirty'));
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(<%= SnakeModuleName %>_two.get('<%= thirdProperty %>sIsDirty'));
  assert.ok(<%= SnakeModuleName %>_two.get('isDirtyOrRelatedDirty'));
  <%= SnakeModuleName %>_two.rollbackPfs();
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdProperty %>s').get('length'), 1);
  assert.equal(<%= SnakeModuleName %>_two.get('<%= thirdProperty %>s').get('length'), 1);
  assert.ok(<%= camelizedModuleName %>.get('<%= thirdProperty %>sIsNotDirty'));
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(<%= SnakeModuleName %>_two.get('<%= thirdProperty %>sIsNotDirty'));
  assert.ok(<%= SnakeModuleName %>_two.get('isNotDirtyOrRelatedNotDirty'));
  <%= camelizedModuleName %>.remove_<%= thirdProperty %>(<%= thirdAssociatedModelTitle %>D.idOne);
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdProperty %>s').get('length'), 0);
  assert.equal(<%= SnakeModuleName %>_two.get('<%= thirdProperty %>s').get('length'), 1);
  assert.ok(<%= camelizedModuleName %>.get('<%= thirdProperty %>sIsDirty'));
  assert.ok(<%= camelizedModuleName %>.get('isDirtyOrRelatedDirty'));
  assert.ok(<%= SnakeModuleName %>_two.get('<%= thirdProperty %>sIsNotDirty'));
  assert.ok(<%= SnakeModuleName %>_two.get('isNotDirtyOrRelatedNotDirty'));
  <%= camelizedModuleName %>.rollbackPfs();
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdProperty %>s').get('length'), 1);
  assert.equal(<%= SnakeModuleName %>_two.get('<%= thirdProperty %>s').get('length'), 1);
  assert.ok(<%= camelizedModuleName %>.get('<%= thirdProperty %>sIsNotDirty'));
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(<%= SnakeModuleName %>_two.get('<%= thirdProperty %>sIsNotDirty'));
  assert.ok(<%= SnakeModuleName %>_two.get('isNotDirtyOrRelatedNotDirty'));
});

/* Over Arching Test of saveRelated / rollBack */

test('saveRelated - change <%= secondPropertySnake %> and <%= thirdProperty %>s', assert => {
  // <%= secondPropertySnake %>
  let inactive_<%= secondPropertySnake %> = store.push('<%= secondModel %>', {id: <%= secondModelTitle %>D.idTwo, <%= SnakeModuleName %>s: []});
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  <%= camelizedModuleName %>.change_<%= secondPropertySnake %>({id: inactive_<%= secondPropertySnake %>.get('id')});
  assert.ok(<%= camelizedModuleName %>.get('isDirtyOrRelatedDirty'));
  <%= camelizedModuleName %>.saveRelated();
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  // <%= thirdProperty %>s
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdProperty %>s').get('length'), 0);
  store.push('<%= thirdAssociatedModel %>', {id: <%= thirdAssociatedModelTitle %>D.idOne});
  <%= camelizedModuleName %>.add_<%= thirdProperty %>({id: <%= thirdAssociatedModelTitle %>D.idOne});
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdProperty %>s').get('length'), 1);
  assert.ok(<%= camelizedModuleName %>.get('isDirtyOrRelatedDirty'));
  <%= camelizedModuleName %>.saveRelated();
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollback - <%= secondPropertySnake %> and <%= thirdProperty %>s', assert => {
  // <%= secondPropertySnake %>
  <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= camelizedModuleName %>D.idOne, <%= secondPropertySnake %>_fk: <%= secondModelTitle %>D.idOne});
  <%= secondPropertySnake %> = store.push('<%= secondModel %>', {id: <%= secondModelTitle %>D.idOne, <%= SnakeModuleName %>s: [<%= camelizedModuleName %>D.idOne]});
  let inactive_<%= secondPropertySnake %> = store.push('<%= secondModel %>', {id: <%= secondModelTitle %>D.idTwo, <%= SnakeModuleName %>s: []});
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  <%= camelizedModuleName %>.change_<%= secondPropertySnake %>({id: inactive_<%= secondPropertySnake %>.get('id')});
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>').get('id'), inactive_<%= secondPropertySnake %>.get('id'));
  assert.ok(<%= camelizedModuleName %>.get('isDirtyOrRelatedDirty'));
  <%= camelizedModuleName %>.rollback();
  assert.equal(<%= camelizedModuleName %>.get('<%= secondPropertySnake %>').get('id'), <%= secondPropertySnake %>.get('id'));
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
  // <%= thirdProperty %>s
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdProperty %>s').get('length'), 0);
  store.push('<%= thirdAssociatedModel %>', {id: <%= thirdAssociatedModelTitle %>D.idOne});
  <%= camelizedModuleName %>.add_<%= thirdProperty %>({id: <%= thirdAssociatedModelTitle %>D.idOne});
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdProperty %>s').get('length'), 1);
  assert.ok(<%= camelizedModuleName %>.get('isDirtyOrRelatedDirty'));
  <%= camelizedModuleName %>.rollback();
  assert.equal(<%= camelizedModuleName %>.get('<%= thirdProperty %>s').get('length'), 0);
  assert.ok(<%= camelizedModuleName %>.get('isNotDirtyOrRelatedNotDirty'));
});

test('<%= dasherizedModuleName%> validations', assert => {
  run(() => {
    <%= camelizedModuleName %> = store.push('<%= dasherizedModuleName %>', {id: <%= camelizedModuleName %>D.idOne, <%= secondPropertySnake %>_fk: <%= secondModelTitle %>D.idOne});
  });
  const attrs = <%= camelizedModuleName %>.get('validations').get('attrs');
  assert.ok(attrs.get('<%= firstPropertySnake %>'));
  assert.equal(<%= camelizedModuleName %>.get('validations').get('_validators').<%= firstPropertySnake %>[0].get('_type'), 'presence');
  assert.equal(<%= camelizedModuleName %>.get('validations').get('_validators').<%= firstPropertySnake %>[1].get('_type'), 'length');
  assert.deepEqual(attrs.get('<%= firstPropertySnake %>').get('messages'), ['errors.<%= camelizedModuleName %>.<%= firstPropertySnake %>']);
  assert.ok(attrs.get('<%= secondPropertySnake %>'));
  assert.deepEqual(attrs.get('<%= secondPropertySnake %>').get('messages'), ['errors.<%= camelizedModuleName %>.<%= secondPropertySnake %>']);
});
