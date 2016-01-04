import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';

var PREFIX = config.APP.NAMESPACE;

var AttachmentRepo = Ember.Object.extend({
    remove(id) {
        let store = this.get('store');
        store.remove('attachment', id);
        PromiseMixin.xhr(`${PREFIX}/admin/attachments/${id}/`, 'DELETE');
    },
    removeAllUnrelated() {
        let store = this.get('store');
        let ids_array = store.find('attachment').toArray();
        let ids = ids_array.filter(function(attachment) {
            return attachment.get('rollback');
        }).mapBy('id');
        ids.forEach((id) => {
            store.remove('attachment', id);
        });
        if(ids.length > 0) {
            let endpoint = `${PREFIX}/admin/attachments/batch-delete/`;
            let options = {method: 'DELETE', cache: false, data: {ids: ids}, url: endpoint};
            return new Ember.RSVP.Promise(function(resolve, reject) {
                options.success = function(json) {
                    return Ember.run(null, resolve, json);
                };
                Ember.$.ajax(options);
            });
        }
    },
    upload(id, file, model) {
        let store = this.get('store');
        store.push('attachment', {id: id, new: true, percent: 25});
        model.add_attachment(id);
        let data = new FormData();
        data.append('id', id);
        data.append('filename', file.name);
        data.append('file', file);
        let endpoint = `${PREFIX}/admin/attachments/`;
        let options = {method: 'POST', cache: false, processData: false, contentType: false, data: data, url: endpoint};
        return new Ember.RSVP.Promise(function(resolve, reject) {
            options.success = function(json) {
                return Ember.run(null, resolve, json);
            };
            Ember.$.ajax(options);
        });
    }
});

export default AttachmentRepo;
