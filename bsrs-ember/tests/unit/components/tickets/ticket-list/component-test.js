import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('tickets/ticket-list', 'Unit | Component | tickets/ticket list', {
  // needs: ['component:foo', 'helper:bar'],
  unit: true
});

test('it has correct properties set for ticket-list', function(assert) {
  let component = this.subject();
  assert.equal(component.columns[0].field, 'priority.translated_name');
  assert.equal(component.columns[0].filterModelName, 'ticket-priority');
  assert.equal(component.columns[0].filterComponent, 'grid/filters/checkbox-list');
  assert.ok(component.columns[0].multiple);
  assert.ok(component.columns[0].isFilterable);
  assert.ok(component.columns[0].isSearchable);
  assert.ok(component.columns[0].headerIsTranslatable);
  assert.notOk(component.columns[1].isSortable);
  assert.equal(component.columns[1].field, 'status.translated_name');
  assert.equal(component.columns[1].filterModelName, 'ticket-status');
  assert.equal(component.columns[1].filterComponent, 'grid/filters/checkbox-list');
  assert.ok(component.columns[1].multiple);
  assert.ok(component.columns[1].isFilterable);
  assert.ok(component.columns[1].isSearchable);
  assert.ok(component.columns[1].headerIsTranslatable);
  assert.notOk(component.columns[1].isSortable);
  assert.equal(component.columns[2].field, 'number');
  assert.notOk(component.columns[2].multiple);
  assert.ok(component.columns[2].isSearchable);
  assert.ok(component.columns[2].isSortable);
});
