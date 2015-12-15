import Ember from 'ember';
import GridViewComponent from 'bsrs-ember/components/grid-view/component';

export default GridViewComponent.extend({
    layoutName: 'components/grid-view',
    searchable: ['name', 'number', 'status.translated_name'],
    nonsearchable: ['location_level']
});
