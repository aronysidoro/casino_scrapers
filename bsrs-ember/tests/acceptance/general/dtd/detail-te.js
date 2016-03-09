import Ember from 'ember';
const { run } = Ember;
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import config from 'bsrs-ember/config/environment';
import { dtd_payload, dtd_payload_update_priority, dtd_payload_no_priority, dtd_payload_two } from 'bsrs-ember/tests/helpers/payloads/dtd';
import DTD from 'bsrs-ember/vendor/defaults/dtd';
import LINK from 'bsrs-ember/vendor/defaults/link';
import DTDF from 'bsrs-ember/vendor/dtd_fixtures';
import TP from 'bsrs-ember/vendor/defaults/ticket-priority';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import random from 'bsrs-ember/models/random';
import page from 'bsrs-ember/tests/pages/dtd';
import generalPage from 'bsrs-ember/tests/pages/general';
import ticketPage from 'bsrs-ember/tests/pages/tickets';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_dtd_url;
const DTD_URL = `${BASE_URL}`;
const DETAIL_URL = `${BASE_URL}/${DTD.idOne}`;
const DT_PUT_URL = `${PREFIX}${DETAIL_URL}/`;
const BACKSPACE = {keyCode: 8};

let application, store, endpoint, list_xhr, detail_xhr, detail_data;

module('Acceptance | dtd detail', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        endpoint = `${PREFIX}${BASE_URL}/`;
        list_xhr = xhr(`${endpoint}?page=1`, 'GET', null, {}, 200, DTDF.list());
        detail_data = DTDF.detail(DTD.idOne);
        detail_xhr = xhr(`${endpoint}${DTD.idOne}/`, 'GET', null, {}, 200, detail_data);
    },
    afterEach() {
        Ember.run(application, 'destroy');
    }
});

test('decision tree definition displays data and saves correctly', (assert) => {
    page.visitDetail();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find('.t-dtd-key').val(), DTD.keyOne);
        assert.equal(find('.t-dtd-description').val(), DTD.descriptionOne);
        assert.equal(find('.t-dtd-prompt').val(), DTD.promptOne);
        assert.equal(find('.t-dtd-note').val(), DTD.noteOne);
        assert.equal(find('.t-dtd-link-action_button').prop('checked'), LINK.action_buttonOne);
        assert.equal(find('.t-dtd-link-is_header').prop('checked'), LINK.is_headerOne);
        assert.equal(find('.t-dtd-link-request').val(), LINK.requestOne);
        assert.equal(ticketPage.priorityInput.split(' ')[0], TP.priorityOne);
        assert.equal(ticketPage.statusInput.split(' ')[0], TD.statusOne);
    });
    xhr(DT_PUT_URL, 'PUT', JSON.stringify(dtd_payload), {}, 200, {});
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), DTD_URL);
    });
});

test('dtd payload change priority only', (assert) => {
    page.visitDetail();
    andThen(() => {
        const dtd = store.find('dtd', DTD.idOne);
        assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
        assert.ok(dtd.get('linksIsNotDirty'));
        const link = dtd.get('links').objectAt(0);
        assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
        assert.ok(link.get('priorityIsNotDirty'));
    });
    ticketPage
        .priorityClickDropdown()
        .priorityClickOptionTwo();
    andThen(() => {
        assert.equal(ticketPage.priorityInput.split(' ')[0], TP.priorityTwo);
        const dtd = store.find('dtd', DTD.idOne);
        assert.ok(dtd.get('isDirtyOrRelatedDirty'));
        assert.ok(dtd.get('linksIsDirty'));
        const link = dtd.get('links').objectAt(0);
        assert.ok(link.get('isDirtyOrRelatedDirty'));
        assert.ok(link.get('priorityIsDirty'));
    });
    xhr(DT_PUT_URL, 'PUT', JSON.stringify(dtd_payload_update_priority), {}, 200, {});
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), DTD_URL);
    });
});

test('dtd payload to update all fields', (assert) => {
    page.visitDetail();
    andThen(() => {
        assert.ok(find('.t-dtd-link-action_button').prop('checked'));
        assert.ok(find('.t-dtd-link-is_header').prop('checked'));
    });
    page
        .keyFillIn(DTD.keyTwo)
        .descriptionFillIn(DTD.descriptionTwo)
        .promptFillIn(DTD.promptTwo)
        .noteFillIn(DTD.noteTwo)
        .requestFillIn(LINK.requestTwo)
        .textFillIn(LINK.textTwo)
        .action_buttonClick()
        .is_headerClick();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find('.t-dtd-key').val(), DTD.keyTwo);
        assert.equal(find('.t-dtd-description').val(), DTD.descriptionTwo);
        assert.equal(find('.t-dtd-prompt').val(), DTD.promptTwo);
        assert.equal(find('.t-dtd-note').val(), DTD.noteTwo);
        assert.notOk(find('.t-dtd-link-action_button').prop('checked'));
        assert.notOk(find('.t-dtd-link-is_header').prop('checked'));
        assert.equal(find('.t-dtd-link-request').val(), LINK.requestTwo);
        assert.equal(find('.t-dtd-link-text').val(), LINK.textTwo);
    });
    ticketPage.priorityClickDropdown();
    andThen(() => {
        assert.equal(ticketPage.priorityOne, TP.priorityOne);
        assert.equal(ticketPage.priorityTwo, TP.priorityTwo);
        assert.equal(ticketPage.priorityThree, TP.priorityThree);
        assert.equal(ticketPage.priorityFour, TP.priorityFour);
    });
    ticketPage.priorityClickOptionTwo();
    ticketPage.statusClickDropdown();
    ticketPage.statusClickOptionTwo();
    andThen(() => {
        assert.equal(ticketPage.priorityInput.split(' ')[0], TP.priorityTwo);
    });
    xhr(DT_PUT_URL, 'PUT', JSON.stringify(dtd_payload_two), {}, 200, {});
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), DTD_URL);
    });
});

test('dtd can clear out link priority', (assert) => {
    page.visitDetail();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(ticketPage.priorityInput.split(' ')[0], TP.priorityOne);
    });
    ticketPage.removePriority();
    andThen(() => {
        assert.equal(ticketPage.priorityInput.split(' ')[0], '');
    });
    xhr(DT_PUT_URL, 'PUT', JSON.stringify(dtd_payload_no_priority), {}, 200, {});
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), DTD_URL);
    });
});

test('click modal cancel (dtd)', (assert) => {
    clearxhr(list_xhr);
    page.visitDetail();
    andThen(() => {
        assert.ok(find('.t-dtd-link-action_button').prop('checked'));
        assert.ok(find('.t-dtd-link-is_header').prop('checked'));
    });
    page
        .keyFillIn(DTD.keyTwo)
        .descriptionFillIn(DTD.descriptionTwo)
        .promptFillIn(DTD.promptTwo)
        .noteFillIn(DTD.noteTwo)
        .requestFillIn(LINK.requestTwo)
        .action_buttonClick()
        .is_headerClick();
    generalPage.cancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL);
            assert.ok(generalPage.modalIsVisible);
            assert.equal(find('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
        });
    });
    generalPage.clickModalCancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL);
            assert.ok(generalPage.modalIsHidden);
        });
    });
});

test('click modal ok (dtd)', (assert) => {
    page.visitDetail();
    andThen(() => {
        assert.ok(find('.t-dtd-link-action_button').prop('checked'));
        assert.ok(find('.t-dtd-link-is_header').prop('checked'));
    });
    page
        .keyFillIn(DTD.keyTwo)
        .descriptionFillIn(DTD.descriptionTwo)
        .promptFillIn(DTD.promptTwo)
        .noteFillIn(DTD.noteTwo)
        .requestFillIn(LINK.requestTwo)
        .action_buttonClick()
        .is_headerClick();
    generalPage.cancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL);
            assert.ok(generalPage.modalIsVisible);
            assert.equal(find('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
        });
    });
    generalPage.clickModalRollback();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DTD_URL);
            assert.ok(generalPage.modalIsHidden);
        });
    });
});

test('clicking cancel button will take from detail view to list view', (assert) => {
    page.visitDetail();
    andThen(() => {
        assert.equal(currentURL(),DETAIL_URL);
    });
    generalPage.cancel();
    andThen(() => {
        assert.equal(currentURL(), DTD_URL);
    });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', (assert) => {
    page.visitDetail();
    ticketPage.priorityClickDropdown();
    ticketPage.priorityClickOptionTwo();
    generalPage.cancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL);
            assert.ok(generalPage.modalIsVisible);
        });
    });
    generalPage.clickModalRollback();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DTD_URL);
        });
    });
});

test('when click delete, dtd is deleted and removed from store', (assert) => {
    page.visitDetail();
    xhr(PREFIX + BASE_URL + '/' + DTD.idOne + '/', 'DELETE', null, {}, 204, {});
    generalPage.delete();
    andThen(() => {
        assert.equal(currentURL(), DTD_URL);
        assert.equal(store.find('dtd', DTD.idOne).get('length'), undefined);
    });
});