import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import SortBy from 'bsrs-ember/mixins/sort-by';
import FilterBy from 'bsrs-ember/mixins/filter-by';
import regex_property from 'bsrs-ember/utilities/regex-property';

const PAGE_SIZE = config.APP.PAGE_SIZE;

var GridViewComponent = Ember.Component.extend(SortBy, FilterBy, {
  toggleFilter: false,
  searched_content: Ember.computed('find', 'sort', 'page', 'search', 'model.[]', function() {
    const search = this.get('search') ? this.get('search').trim().toLowerCase() : '';
    const regex = new RegExp(search);
    const columns = this.get('columns').filter(function(c) {
      return c.isSearchable;
    }).map(function(c) {
      return c.field;
    });
    let filter = columns.map((property) => {
      return this.get('model').filter((object) => {
        //TODO: n+1 problem?  debugger here on list view will show this
        return regex_property(object, property, regex);
      });
    }.bind(this));
    return filter.reduce((a, b) => { return a.concat(b); }).uniq();
  }),
  found_content: Ember.computed('searched_content.[]', function() {
    const find = this.get('find') || '';
    const searched_content = this.get('searched_content');
    const params = find.split(',');
    if(params[0].trim() !== '') {
      let filter = params.map((option) => {
        const property = option.split(':')[0];
        const propertyValue = option.split(':')[1];
        const regex = new RegExp(propertyValue, 'i');
        return this.get('model').filter((object) => {
          return regex_property(object, property, regex);
        });
      }.bind(this));
      return filter.reduce((a,b) => {
        const one_match = a.filter(item => Ember.$.inArray(item.get('id'), b.mapBy('id')) > -1);
        const two_match = b.filter(item => Ember.$.inArray(item.get('id'), a.mapBy('id')) > -1);
        return one_match.concat(two_match);
      }).uniq();
    }
    return searched_content;
  }),
  paginated_content: Ember.computed('found_content.[]', function() {
    const requested = this.get('requested');
    const page = parseInt(this.get('page')) || 1;
    const page_size = parseInt(this.get('page_size')) || PAGE_SIZE;
    const pages = requested.toArray().sort((a,b) => { return a-b; }).uniq();
    const max = (pages.indexOf(page) + 1) * page_size;
    const found_content = this.get('found_content');
    return found_content.slice(0, Math.max(page_size, 10));
  }),
  actions: {
    keyup(search) {
      Ember.run.scheduleOnce('actions', this, function() {
        this.set('page', 1);
        this.set('search', search);
      }.bind(this));
    },
    sortBy(column) {
      const current = this.get('sort');
      const sorted = this.reorder(current, column);
      this.setProperties({page: 1, sort: sorted});
    },
    toggleFilterModal(column) {
      this.toggle(column);
    },
    resetGrid() {
      this.setProperties({page: 1, sort: undefined, find: undefined, search: undefined});
    }
  }
});

export default GridViewComponent;
