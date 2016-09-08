import Ember from 'ember';
const { computed, defineProperty } = Ember;
import { task, timeout } from 'ember-concurrency';
import { ValidationComponentInit, ValidationComponentPieces } from 'bsrs-ember/mixins/validation-component';

/* @class ValidatedInput
* didValidate - trigger showMessage and can show mwwage if
* API
* - 'model' 
* - 'count' if multiple so can have many ids
* - 'maxlength' for html5 validation
* - 'valuePath'
* - 'placeholder'
* - 'didValidate'
* - 'className'
*/
export default Ember.Component.extend(ValidationComponentPieces, ValidationComponentInit, {
  type: 'text',
  focusedOut: false,
  // attributeValidation: null,
  // classNameBindings: ['showMessage:invalid'],
  // init() {
  //   this._super(...arguments);
  //   const valuePath = this.get('valuePath');
  //   defineProperty(this, 'attributeValidation', computed.oneWay(`model.validations.attrs.${valuePath}`));
  //   defineProperty(this, 'value', computed.alias(`model.${valuePath}`));
  // },
  // showMessage: computed('localDidValidate', 'focusedOut', function() {
  //   return this.get('localDidValidate') || this.get('focusedOut');
  // }),
  // localDidValidate: Ember.computed('didValidate', function() {
  //   // Create local didValidate boolean so that can show err msg right away on save and 
  //   // set back when fill in input
  //   return this.get('didValidate') && this.get('isInvalid');
  // }),
  // isValid: computed.oneWay('attributeValidation.isValid'),
  // isInvalid: computed.oneWay('attributeValidation.isInvalid'),
  setFocusedOut: task(function * () {
    yield timeout(1500);
    if (this.get('isInvalid')) { 
      this.set('focusedOut', true); 
    }
  }).restartable(),
  actions: {
    focusedOut() {
      if (this.get('isInvalid')) { this.set('focusedOut', true); }
    },
    keyedUp() {
      if (this.get('isInvalid')) {
        this.get('setFocusedOut').perform();
      } else {
        this.set('localDidValidate', false);
        this.set('focusedOut', false);
      }
    }
  }
});
