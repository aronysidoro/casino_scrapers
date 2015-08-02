import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';

export default Ember.Component.extend(ValidationMixin, {
    repository: inject('person'),
    usernameValidation: validate('model.username'),
    passwordValidation: validate('model.password'),
    firstNameValidation: validate('model.first_name'),
    lastNameValidation: validate('model.last_name'),
    emailValidation: validate('model.email', /\S+@\S+\.\S+/),
    actions: {
        savePerson() {
            this.set('submitted', true);
            if (this.get('valid')) {
                var model = this.get('model');
                var repository = this.get('repository');
                repository.insert(model).then(() => {
                    this.sendAction('savePerson');
                });
            }
        },
        cancelPerson() {
            this.sendAction('redirectUser');
        }
    }
});
