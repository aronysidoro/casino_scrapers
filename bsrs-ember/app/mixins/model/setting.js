import Ember from 'ember';

var Mixin = Ember.Mixin.create({
  // the POJO from Django where inherited info is stored
  settings_object: undefined,
  // dynamically generate related `settings` to be used in `serialize()` method
  settings: Ember.computed(function() {
    const fields = this.get('settingFields');
    let obj = {
      settings: {}
    };
    for (let f in fields) {
      let field = fields[f];
      if (typeof(field) === 'string') {
        obj.settings[field] = this.get(field);
      }
    }
    return obj;
  }),
});

export
default Mixin;