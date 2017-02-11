import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import {xhr} from 'bsrs-ember/tests/helpers/xhr';
import CATEGORY_FIXTURES from 'bsrs-ember/vendor/category_fixtures';
import page from 'bsrs-ember/tests/pages/category';
import BASEURLS, { CATEGORIES_URL } from 'bsrs-ember/utilities/urls';

const BASE_URL = BASEURLS.base_categories_url;
const CATEGORIES_INDEX_URL = BASE_URL + '/index';

moduleForAcceptance('Acceptance | general category list test', {
  beforeEach() {
    xhr(`${CATEGORIES_URL}?page=1`, "GET", null, {}, 200, CATEGORY_FIXTURES.list());
  },
});

test('visiting /categories/index', (assert) => {
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), CATEGORIES_INDEX_URL);
    assert.equal(find('.t-sort-name').text(), t('admin.category.label.name'));
    assert.equal(find('.t-sort-description').text(), t('admin.category.label.description'));
    assert.equal(find('.t-sort-label').text(), t('admin.category.label.label'));
    // unsortable columns
    assert.equal(Ember.$('[data-test-id=cost_amount]').length, 1);
    assert.equal(Ember.$('[data-test-id=cost_code]').length, 1);
    assert.equal(Ember.$('[data-test-id=verbose_name]').length, 1);
  });
});
