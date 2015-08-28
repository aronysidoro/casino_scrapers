import Ember from 'ember';
import { test } from 'qunit';
import module from "bsrs-ember/tests/helpers/module";
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import LOCATION_LEVEL_FIXTURES from 'bsrs-ember/vendor/location_level_fixtures';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';

const PREFIX = config.APP.NAMESPACE;
const LOCATION_LEVEL_URL = BASEURLS.base_location_levels_url + '/index';
const DJANGO_LOCATION_LEVEL_URL = "/admin/location_levels/";

let application;

module('Acceptance | location-level-list', {
  beforeEach() {
    application = startApp();
    let endpoint = PREFIX + DJANGO_LOCATION_LEVEL_URL;
    xhr(endpoint ,"GET",null,{}, 200, LOCATION_LEVEL_FIXTURES.list() );
  },
  afterEach() {
    Ember.run(application, 'destroy');
  }
});

test('visiting /location-levels', function(assert) {
  visit(LOCATION_LEVEL_URL);

  andThen(() => {
    assert.equal(currentURL(), LOCATION_LEVEL_URL);
    assert.equal(find('h1.t-location-level').text(), 'Location Levels');
    assert.equal(find('tr.t-location-level-data').length, 8);
  });
});

