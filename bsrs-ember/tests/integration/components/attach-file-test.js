import Ember from 'ember';
const { run } = Ember;
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import TD from 'bsrs-ember/vendor/defaults/ticket';

let store;

moduleForComponent('tickets/ticket-comments-and-file-upload', 'integration: upload file progress test', {
  integration: true,
  setup() {
    store = module_registry(this.container, this.registry, ['model:ticket',
      'model:attachment', 'service:person-current']);
  }
});

test('progress bar should transform from green to blue once upload is complete', function(assert) {
  let attachment, ticket;
  assert.expect(5);
  run(function() {
    attachment = store.push('attachment', {id: 7, percent: 25, new: true});
    ticket = store.push('ticket', {id: TD.idOne, generic_attachments_fks: [8]});
    store.push('generic-join-attachment', {id: 8, attachment_pk: 7, generic_pk: TD.idOne});
  });
  this.set('model', ticket);
  this.render(hbs`{{tickets/ticket-comments-and-file-upload model=model}}`);
  let $component = this.$('.progress-bar');
  assert.equal($component.length, 1);
  assert.ok($component.hasClass('progress-bar-success'));
  assert.ok($component.hasClass('progress-bar'));
  run(() => { attachment.set('percent', 100); });
  setTimeout(function() {
    assert.ok($component.hasClass('progress-bar'));
    assert.ok(!$component.hasClass('progress-bar-success'));
  });
});
