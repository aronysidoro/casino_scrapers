import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import NewMixin from 'bsrs-ember/mixins/model/new';
import inject from 'bsrs-ember/utilities/store';
import equal from 'bsrs-ember/utilities/equal';
import EmailMixin from 'bsrs-ember/mixins/model/email';
import PhoneNumberMixin from 'bsrs-ember/mixins/model/phone_number';
import AddressMixin from 'bsrs-ember/mixins/model/address';
import CopyMixin from 'bsrs-ember/mixins/model/copy';
import ChildrenMixin from 'bsrs-ember/mixins/model/location/children';
import ParentMixin from 'bsrs-ember/mixins/model/location/parent';
import StatusMixin from 'bsrs-ember/mixins/model/location/status';
import LocationLevelMixin from 'bsrs-ember/mixins/model/location/location-level';
import { belongs_to, change_belongs_to, belongs_to_dirty, belongs_to_rollback, belongs_to_save } from 'bsrs-components/attr/belongs-to';

const { run } = Ember;

var LocationModel = Model.extend(CopyMixin, NewMixin, StatusMixin, ParentMixin, ChildrenMixin, LocationLevelMixin, AddressMixin, PhoneNumberMixin, EmailMixin, {
    store: inject('main'),
    name: attr(''),
    number: attr(''),
    status_fk: undefined,
    tickets: [],
    email_fks: [],
    phone_number_fks: [],
    address_fks: [],
    location_level_fk: undefined,
    locationLevelIsDirty: belongs_to_dirty('location_level_fk', 'location_level'),
    locationLevelIsNotDirty: Ember.computed.not('locationLevelIsDirty'),
    statusIsDirty: belongs_to_dirty('status_fk', 'status'),
    statusIsNotDirty: Ember.computed.not('statusIsDirty'),
    childrenIsDirty: Ember.computed('children.[]', 'location_children_fks.[]', function() {
        const children = this.get('children');
        const location_children_ids = this.get('location_children_ids');
        const previous_m2m_fks = this.get('location_children_fks') || [];
        if(children.get('length') !== previous_m2m_fks.length) {
            return equal(location_children_ids, previous_m2m_fks) ? false : true;
        }
        return equal(location_children_ids, previous_m2m_fks) ? false : true;
    }),
    childrenIsNotDirty: Ember.computed.not('childrenIsDirty'),
    parentsIsDirty: Ember.computed('parents.[]', 'location_parents_fks.[]', function() {
        const parents = this.get('parents');
        const location_parents_ids = this.get('location_parents_ids');
        const previous_m2m_fks = this.get('location_parents_fks') || [];
        if(parents.get('length') !== previous_m2m_fks.length) {
            return equal(location_parents_ids, previous_m2m_fks) ? false : true;
        }
        return equal(location_parents_ids, previous_m2m_fks) ? false : true;
    }),
    parentsIsNotDirty: Ember.computed.not('parentsIsDirty'),
    isDirtyOrRelatedDirty: Ember.computed('isDirty', 'locationLevelIsDirty', 'statusIsDirty', 'phoneNumbersIsDirty', 'addressesIsDirty', 'emailsIsDirty', 'childrenIsDirty', 'parentsIsDirty', function() {
        return this.get('isDirty') || this.get('locationLevelIsDirty') || this.get('statusIsDirty') || this.get('phoneNumbersIsDirty') || this.get('addressesIsDirty') || this.get('emailsIsDirty') || this.get('childrenIsDirty') || this.get('parentsIsDirty');
    }),
    isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
    saveRelated() {
        this.saveLocationLevel();
        this.saveStatus();
        this.saveEmails();
        this.savePhoneNumbers();
        this.saveAddresses();
        this.saveChildren();
        this.saveParents();
    },
    rollbackRelated() {
        this.rollbackLocationLevel();
        this.rollbackStatus();
        this.rollbackEmails();
        this.rollbackPhoneNumbers();
        this.rollbackAddresses();
        this.rollbackChildren();
        this.rollbackParents();
    },
    serialize() {
        var emails = this.get('emails').filter(function(email) {
            if(email.get('invalid_email')) {
                return;
            }
            return email;
        }).map((email) => {
            return email.serialize();
        });
        var phone_numbers = this.get('phone_numbers').filter(function(num) {
            if(num.get('invalid_number')) {
                return;
            }
            return num;
        }).map((num) => {
            return num.serialize();
        });
        var addresses = this.get('addresses').filter(function(address) {
            if (address.get('invalid_address')) {
                return;
            }
            return address;
        }).map((address) => {
            return address.serialize();
        });
        return {
            id: this.get('id'),
            name: this.get('name'),
            number: this.get('number'),
            status: this.get('status.id'),
            location_level: this.get('location_level.id'),
            children: this.get('children_ids'),
            parents: this.get('parents_ids'),
            emails: emails,
            phone_numbers: phone_numbers,
            addresses: addresses,
        };
    },
    removeRecord() {
        run(() => {
            this.get('store').remove('location', this.get('id'));
        });
    },
});

export default LocationModel;
