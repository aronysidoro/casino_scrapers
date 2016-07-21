import Ember from 'ember';
import PromiseMixin from 'ember-promise/mixins/promise';

const { run } = Ember;

var GridRepositoryMixin = Ember.Mixin.create({
  error: Ember.inject.service(),
  /* determines new_pk passed to route */
  findCount() {
    var count_array = this.get('simpleStore').find(this.get('type')).toArray();
    var count = count_array.filter(function(m) {
      return m.get('new') === true;
    }).get('length');
    return count+1;
  },
  mobileSearch(searchValue) {
    return PromiseMixin.xhr(`${this.get('url')}?search=${searchValue}`).then((response) => {
      return response.results;
    });
  },
  modifyEndpoint(page, search, find, id_in, page_size, sort, special_url) {
    let url = url || this.get('url');
    let endpoint = url + '?page=' + page;

    if(sort && sort !== 'id' && sort.indexOf('.') < 0){
      endpoint = endpoint + '&ordering=' + sort;
    }else if(sort && sort !== 'id'){
      endpoint = endpoint + '&ordering=' + sort.replace(/\./g, '__').replace(/translated_name/g, 'name');
    }
    if(search && search !== ''){
      endpoint = endpoint + '&search=' + encodeURIComponent(search);
    }
    if(page_size) { //&& page_size !== ''){
      endpoint = endpoint + '&page_size=' + page_size;
    }
    if(special_url) {
      endpoint = endpoint + `&${special_url}`;
    }
    if(find && find !== ''){
      let finds = find.split(',');
      finds.forEach((data) => {
        const params = data.split(':');
        const key = params[0] || '';
        const value = params[1];
        const field = key.replace('-', '_').replace('.', '__').replace('translated_name', 'name').replace('[', '__').replace(']', '');
        endpoint = endpoint + '&' + field + '__icontains=' + encodeURIComponent(value);
      });
    }
    /* id__in can contain multiple id's for one field; however, assigning multiple ids to a field is done @ component level */
    if(id_in) {
      const key_values = id_in.split('|');
      key_values.forEach((key_value) => {
        /* key='location' value='143ad-adie32,30843d-adc342,121ae-..., key='priority' value='123adbd-3' */
        const [key, value] = key_value.split(':');
        if(value) {
          endpoint = endpoint + '&' + key + '__id__in=' + value.replace(/,+$/g, '');
        }
      });
    }
    return endpoint;
  },
  /* Non Optimistic Rendering: Mobile */
  findWithQueryMobile(page, search, find, id_in, special_url=undefined) {
    const store = this.get('simpleStore');
    page = page || 1;
    let endpoint = this.modifyEndpoint(page, search, find, id_in, special_url);
    return PromiseMixin.xhr(endpoint).then((response) => {
      return this.deserializeResponse(response);
    }, (xhr) => {
      this.get('error').transToError();
    });
  },
  /* Non Optimistic Rendering: Desktop */
  findWithQuery(page, search, find, id_in, page_size, sort, special_url=undefined) {
    const store = this.get('simpleStore');
    page = page || 1;
    let endpoint = this.modifyEndpoint(page, search, find, id_in, page_size, sort, special_url);
    return PromiseMixin.xhr(endpoint).then((response) => {
      const garbage_collection = this.get('garbage_collection') || [];
      /* Remove all types of ex// ticket-list models before render of ticket-list grid */
      garbage_collection.forEach((type) => {
        run(() => {
          store.clear(type);
        });
      });
      return this.deserializeResponse(response);
    }, (xhr) => {
      this.get('error').transToError();
    });
  },
  deserializeResponse(response) {
    const { typeGrid: type, simpleStore: store, deserializer } = this.getProperties('typeGrid', 'simpleStore', 'deserializer');
    const all = store.find(type);
    deserializer.deserialize(response);
    all.set('isLoaded', true);
    const count = response.count;
    all.set('count', count);
    run(() => {
      store.push('grid-count', { id: 1, count: count });
    });
    return all;
  }
});

export default GridRepositoryMixin;
