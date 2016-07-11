import Ember from 'ember';

export default Ember.Mixin.create({
  actions: {
    save(update=false) {
      //TODO: refactor into util funcs
      const model = this.get('model');
      const pk = this.get('model').get('id');
      // const persisted = model.get('new');
      const repository = this.get('repository');
      // const action = persisted === true ? 'insert' : 'update';
      return repository['update'](model).then(() => {
        if (update) {
          const pk = this.get('model').get('id');
          return this.get('activityRepository').find('ticket', 'tickets', pk);
        } else {
          const redirectRoute = this.get('redirectRoute');
          this.sendAction('close', model, redirectRoute);
        }
      }, (xhr) => {
        if(xhr.status === 400) {
          var response = JSON.parse(xhr.responseText), errors = [];
          Object.keys(response).forEach(function(key) {
            errors.push({name: key, value: response[key].toString()});
          });
          this.set('ajaxError', errors);
        }
      });
    },
    cancel() {
      const model = this.get('model');
      const redirectRoute = this.get('redirectRoute');
      this.sendAction('close', model, redirectRoute);
    },
  }
});