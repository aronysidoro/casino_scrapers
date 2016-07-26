import Ember from 'ember';
const { run } = Ember;
import { belongs_to_extract, belongs_to } from 'bsrs-components/repository/belongs-to';
import { many_to_many_extract, many_to_many } from 'bsrs-components/repository/many-to-many';
import OptConf from 'bsrs-ember/mixins/optconfigure/ticket';


var extract_attachments = function(model, store) {
  model.attachments.forEach((attachment_id) => {
    store.push('attachment', {id: attachment_id});
  });
  return model.attachments;
};

var TicketDeserializer = Ember.Object.extend(OptConf, {
  init() {
    this._super(...arguments);
    belongs_to.bind(this)('status', 'ticket', 'general');
    belongs_to.bind(this)('priority', 'ticket', 'ticket');
    belongs_to.bind(this)('assignee', 'ticket', 'person');
    belongs_to.bind(this)('location', 'ticket', 'location');
    many_to_many.bind(this)('cc', 'ticket');
  },
  deserialize(response, options) {
    if (typeof options === 'undefined') {
      this._deserializeList(response);
    } else {
      return this._deserializeSingle(response, options);
    }
  },
  _deserializeSingle(response, id) {
    let store = this.get('simpleStore');
    let ticket = store.find('ticket', id);
    /* FindById mixin prevents xhr if dirty */
    let location_json = response.location;
    response.location_fk = location_json.id;
    delete response.location;
    let cc_json = response.cc;
    delete response.cc;
    let assignee_json = response.assignee;
    response.assignee_fk = response.assignee ? response.assignee.id : undefined;
    delete response.assignee;
    response.ticket_attachments_fks = extract_attachments(response, store);
    response.previous_attachments_fks = response.ticket_attachments_fks;
    delete response.attachments;
    const categories_json = response.categories;
    delete response.categories;
    response.detail = true;
    ticket = store.push('ticket', response);
    this.setup_status(response.status_fk, ticket);
    this.setup_priority(response.priority_fk, ticket);
    if (assignee_json) {
      this.setup_assignee(assignee_json, ticket);
    }
    if (location_json) {
      this.setup_location(location_json, ticket);
    }
    this.setup_cc(cc_json, ticket);
    let [m2m_categories, categories, server_sum] = many_to_many_extract(categories_json, store, ticket, 'model_categories', 'model_pk', 'category', 'category_pk');
    run(() => {
      categories.forEach((cat) => {
        const children_json = cat.children;
        delete cat.children;
        const category = store.push('category', cat);
        if(children_json){
          let [m2m_children, children, server_sum] = many_to_many_extract(children_json, store, category, 'category_children', 'category_pk', 'category', 'children_pk');
          children.forEach((cat) => {
            store.push('category', cat);
          });
          m2m_children.forEach((m2m) => {
            store.push('category-children', m2m);
          });
          store.push('category', {id: cat.id, category_children_fks: server_sum});
        }
      });
      m2m_categories.forEach((m2m) => {
        store.push('model-category', m2m);
      });
      ticket = store.push('ticket', {id: response.id, model_categories_fks: server_sum});
      ticket.save();
    });
    return ticket;
  },
  _deserializeList(response) {
    const store = this.get('simpleStore');
    response.results.forEach((model) => {
      const category_json = model.categories;
      model.category_ids = category_json.mapBy('id');
      category_json.forEach((category) => {
        //TODO: test this
        store.push('category-list', category);
      });
      delete model.categories;
      const status_json = model.status;
      delete model.status;
      const priority_json = model.priority;
      delete model.priority;
      const ticket = store.push('ticket-list', model);
      this.setup_status(status_json, ticket);
      this.setup_priority(priority_json, ticket);
    });
  }
});

export default TicketDeserializer;
