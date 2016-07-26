import Ember from 'ember';
const { run } = Ember;
import pluralize from 'bsrs-components/utils/plural';

var many_to_many_extract = function(json, store, model, join_models_str, main_pk, related_str, related_pk) {
  //cc_json, store, ticket, ticket_cc, ticket_pk, person, person_pk
  const server_sum = [];
  const m2m_models = [];
  const relateds = [];
  const related_ids = json.mapBy('id'); //server side people
  const join_models = model.get(`${join_models_str}`) || [];
  const join_model_pks = join_models.mapBy(`${related_pk}`);//client side people
  const model_pk = model.get('id');
  store = store || this.get('simpleStore');
  for (let i = json.length-1; i >= 0; i--){
    const pk = Ember.uuid();
    const many_models = json[i];
    const existing = store.find(`${related_str}`, many_models.id);
    if(!existing.get('content')){
      relateds.push(many_models);
    }
    if(Ember.$.inArray(many_models.id, join_model_pks) < 0){
      server_sum.push(pk);
      let m2m_model = {id: pk};
      m2m_model[`${main_pk}`] = model_pk;
      m2m_model[`${related_pk}`] = many_models.id;
      m2m_models.push(m2m_model);
    }
  }
  join_models.forEach((m2m) => {
    if(Ember.$.inArray(m2m.get(`${related_pk}`), related_ids) > -1){
      server_sum.push(m2m.id);
      return;
      //TODO: just make else statement and see if all tests pass
    }else if(Ember.$.inArray(m2m.get(`${related_pk}`), related_ids) < 0){
      m2m_models.push({id: m2m.get('id'), removed: true});
    }
  });
  return [m2m_models, relateds, server_sum];
};

var many_to_many = function(_associatedModel, modelName, noSetup) {
  let { plural=false } = noSetup || {};
  const _singularAssociatedName = _associatedModel;
  if (plural) {
    _associatedModel = pluralize(_associatedModel);
  }
  const _joinModelName = `${modelName}_${_associatedModel}`;
  Ember.defineProperty(this, `setup_${_associatedModel}`, undefined, many_to_many_json(modelName, _associatedModel, _singularAssociatedName, _joinModelName));
};

/**
 * Creates many to many setup for deserializer
 *
 * @method many_to_many_generator
 * @return {array} [m2m_models, relateds, server_sum]
 */
var many_to_many_json = function(modelName, _associatedModel, _singularAssociatedName, _joinModelName) {
  return function(json, model) {
    const store = this.get('simpleStore');
    let [m2m_models, relateds, server_sum] = many_to_many_extract(json, store, model, _joinModelName, `${modelName}_pk`, _singularAssociatedName, `${this.OPT_CONF[_associatedModel]['associated_model']}_pk`);
    run(() => {
      relateds.forEach((related) => {
        const ass_model = this.OPT_CONF[_associatedModel]['associated_model'];
        const existing_ass_model = store.find(ass_model, related.id);
        if (!existing_ass_model.get('id') || existing_ass_model.get('isNotDirtyOrRelatedNotDirty')) {
          const model = store.push(this.OPT_CONF[_associatedModel]['associated_model'], related);
          model.save();
        }
      });
      m2m_models.forEach((m2m) => {
        store.push(this.OPT_CONF[_associatedModel]['join_model'], m2m);
      });
      store.push(modelName, {id: model.get('id'), [`${modelName}_${_associatedModel}_fks`]: server_sum});
    });
  };
};

export { many_to_many_extract, many_to_many };
