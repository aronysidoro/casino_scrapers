import Ember from 'ember';

var commentActivity = Ember.Component.extend({
    person: Ember.computed(function() {
        const i18n_string = this.get('i18nString');
        if (i18n_string) {
            const str = i18n_string.string;
            const [beg_string, timestamp, comment] = str.split('$');
            this.set('begString', beg_string.trim());
            this.set('timestamp', timestamp.trim());
            this.set('comment', Ember.String.htmlSafe(comment.trim()));
            return this.get('activity').get('person').get('fullname');
        }
    }),
    classNames: ['activity-wrap']
});

export default commentActivity;
