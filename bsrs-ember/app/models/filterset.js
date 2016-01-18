import Ember from 'ember';

var FilterSet = Ember.Object.extend({
    query: Ember.computed('endpoint_uri', function() {
        let query = {};
        let endpoint_uri = this.get('endpoint_uri').replace('?', '');
        endpoint_uri.split('&').forEach(function(item) {
            let param = item.split('=');
            let value = param[1];
            let options = value && decodeURIComponent(value);
            query[param[0]] = options;
        });
        return query;
    }),
    params: Ember.computed('query', function() {
        var reset = {find: undefined, sort: undefined, search: undefined, page: 1};
        var query = Ember.$.extend(true, {}, this.get('query'));
        var queryParams = Ember.$.extend(reset, query);
        return Ember.Object.create({
            isQueryParams: true,
            values: queryParams
        });
    }),
    filter_exists: function(path, incoming) {
        var query = this.get('query');
        var endpoint = this.get('endpoint_name');
        if(path !== endpoint) {
            return false;
        }
        for(var i in incoming){
            if(incoming.hasOwnProperty(i)){
                if(incoming[i] !== query[i]){
                    return false;
                }
            }
        }
        for(var q in query){
            if(query.hasOwnProperty(q)){
                if(incoming[q] !== query[q]){
                    return false;
                }
            }
        }
        return true;
    }
});

export default FilterSet;
