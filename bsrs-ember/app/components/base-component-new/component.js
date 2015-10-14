import Ember from 'ember';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import EditMixin from 'bsrs-ember/mixins/components/tab/edit';

var BaseComponent = Ember.Component.extend({
    actions: {
        save() {
            this.sendAction('save');
        },
        cancel() {
            this.sendAction('cancel');
        }
    }
});

export default BaseComponent;

