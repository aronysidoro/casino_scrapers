import { create, clickable, fillable } from 'ember-cli-page-object';

export const mobileSearch = '.t-mobile-search-slideUp .t-grid-search-input';

export default create({
  cancelFilterSort: clickable('.t-mobile-filter-first-btn'),
  submitFilterSort: clickable('.t-mobile-filter-second-btn'),
  nextPage: clickable('.t-next > a'),
  clickGridOne: clickable('.t-grid-data:eq(0)'),
  clickSearchGridOne: clickable('.t-grid-search-data:eq(0)'),
  mobileSearch: fillable(mobileSearch),
  filterInput: fillable('.t-filter-input'),
  clickSearchIcon: clickable('.t-mobile-search'),
  clickFilterOpen: clickable('.t-mobile-filter'),
  saveFilterset: clickable('.t-mobile-save-filterset'),
  closeFiltersetInput: clickable('.t-mobile-save-filterset-component span'),
  backButtonClick: clickable('.t-detail-back'),
  mobileActionDropdownClick: clickable('.t-mobile-action-dropdown'),
});
