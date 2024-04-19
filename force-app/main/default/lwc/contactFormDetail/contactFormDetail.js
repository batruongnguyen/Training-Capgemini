import { LightningElement, track, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getFieldValue, getRecord, notifyRecordUpdateAvailable } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import { getRelatedListRecords } from 'lightning/uiRelatedListApi';
import { RefreshEvent } from "lightning/refresh";

import getContactsByAccountId from '@salesforce/apex/StartCardFormController.getContactsByAccountId';
import insertAccountChildData from '@salesforce/apex/StartCardFormController.insertAccountChildData';

const CONTACT_FIELDS = ['Contact.Id','Contact.Salutation','Contact.FirstName','Contact.LastName','Contact.Email','Contact.Phone','Contact.Title'];
const ACCOUNT_FIELDS = ['Account.Id','Account.Name'];

export default class ContactFormDetail extends LightningElement {

    @api recordId;

    @track headerInfo = 'StarCard Form (Day 1) - Build UI without any interaction between elements and no data flow';
    @track accountName;
    @track existingContacts = [];
    @track isLoading = false;

    @track __pageNumber = 1;
    @track selectedContact = {};
    @track application = {};

    __wireContacts;

    get bDisableSubmit() {
        return this.__pageNumber == 1;
    }

    get navigateBtnVariant() {
        return this.__pageNumber == 1 ? 'brand' : 'neutral';
    }

    get __showFormDetail() {
        return this.__pageNumber == 1;
    }

    get __showApplication() {
        return this.__pageNumber == 2;
    }
    
    get __navigateBtnName() {
        return this.__pageNumber == 1 ? 'Next' : 'Back';
    }

    renderedCallback() {
        console.log('renderCallback');
    }

    connectedCallback() {
        console.log('connectedCallback');
    }

    disconnectedCallback() {
        console.log('disconnectedCallback');
    }

    met

    @wire(getRecord, { recordId: "$recordId", fields: ACCOUNT_FIELDS, })
    wireAccount(result) {
        let {data, error} = result;
        if (data) {
            this.accountName = data.fields.Name.value;
        } else if (error) {
            this.showToast('Error', 'Get record being error' + JSON.stringify(error), 'error');
        }
    };

    @wire(getContactsByAccountId, { accountId: "$recordId" })
    apexInfo(result) {
        // Hold on to the provisioned value so we can refresh it later.
        this.__wireContacts = result;
        const {data, error} = result;

        if (data) {
            this.existingContacts = this.__convertApexContacts(data);
            console.log('apex contacts: ' + JSON.stringify(this.existingContacts));
        } else if (error) {
            this.existingContacts = [];
            console.error('apex contacts: ' + JSON.stringify(error));
        }
    }

    @wire(getRelatedListRecords, {
        parentRecordId: "$recordId",
        relatedListId: 'Contacts',
        fields: CONTACT_FIELDS,
        sortBy: ['Contact.CreatedDate']
    })
    ldsInfo({ error, data }) {
        if (data) {
            console.log('lds sync');
            refreshApex(this.__wireContacts);

        } else if (error) {
            this.existingContacts = [];
            console.error('failed to get related contact via LDS: ' + JSON.stringify(error));
        }
    }


    async submitForm() {

        if (!this.validate()) { return; }

        this.isLoading = true;
        this.__fetchChildData();

        if (this.__pageNumber == 2) {

            try {
                const successfully = await this.insertRecords();
                if (successfully) {
                    this.showToast('Success', 'Update Successfully!', 'success');
                } else {
                    this.showToast('Error', 'Error when insert data', 'error');
                }
                await this.navigatePage();
                await this.delay(1000); // Add a delay of 1 seconds
                this.refreshPage();

            } catch (error) {
                console.error('error when submit form: ' + JSON.stringify(error));
                this.showToast('Error', 'Can not catch error when submit', 'error');
            } finally {
                this.isLoading = false;
            }

        } else {    
            this.showToast('Error', 'Can not submit on this page!', 'error');
            this.isLoading = false;
        }
    }

    handleProcessContact(event) {
        this.existingContacts.forEach(contact => {
            contact.IsSelected = false;
        });
        
        this.selectedContact = this.existingContacts.find(contact => contact.Id === event.detail.selectedKey);
        
        if (event.detail.isSelected) {
            this.selectedContact.IsSelected = true;
        } else {
            // reset contact on input contact information modal
            this.selectedContact = {};
        }

        // make sure render data
        this.existingContacts = [...this.existingContacts];
    }

    async insertRecords() {
        try {
            await insertAccountChildData({ iOpp: this.application, iContact: this.selectedContact, accountId: this.recordId });
            await refreshApex(this.__wireContacts);
            this.dispatchEvent(new RefreshEvent());
            await notifyRecordUpdateAvailable([{ recordId: this.recordId }]);
            return true;
        } catch (error) {
            console.error('Error when creating contact and opportunity: ' + JSON.stringify(error?.body));
            return false;
        }
    }

    navigatePage() {
        return new Promise((resolve, reject) => {
            if (!this.validate()) { return; }
            this.__fetchChildData();
    
            if (this.__pageNumber == 1) {
                this.__pageNumber += 1; // execute for next button
            } else if (this.__pageNumber == 2) {
                this.__pageNumber -= 1; // execute for back/submit button
            }
    
            // Resolve the promise to indicate that the navigation is complete
            resolve();
        });
    }

    validate() {
        if (this.__pageNumber == 1) {

            const contactInfoModal = this.template.querySelector("c-contact-information");
            return contactInfoModal.checkValidity();

        } else if (this.__pageNumber == 2) {

            const applicationModal = this.template.querySelector("c-contact-application");
            return applicationModal.checkValidity();
        }

        return false;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    __fetchChildData() {
        if (this.__pageNumber == 1) {
            const contactInfo = this.template.querySelector("c-contact-information")?.getContact();

            contactInfo?.forEach(item => {
                const { name, value } = item;
                this.selectedContact[name] = value;
            });

        } else if (this.__pageNumber == 2) {
            const applicationInfo = this.template.querySelector("c-contact-application")?.getApplication();

            applicationInfo?.forEach(item => {
                const { name, value } = item;
                this.application[name] = value;
            });

        }
    }

    __convertApexContacts(existingContacts){
        return existingContacts?.map(contact => {
            return {
                Id: contact.Id,
                Salutation: contact.Salutation || null,
                FirstName: contact.FirstName || null,
                LastName: contact.LastName || null,
                Email: contact.Email || null,
                Phone: contact.Phone || null,
                Title: contact.Title || null,
                IsSelected: false,
            };
        });
    }

    __convertLDSContacts(existingContacts){
        return existingContacts?.map(contact => {
            return {
                Id: contact.id,
                Salutation: getFieldValue(contact, 'Contact.Salutation'),
                FirstName: getFieldValue(contact, 'Contact.FirstName'),
                LastName: getFieldValue(contact, 'Contact.LastName'),
                Email: getFieldValue(contact, 'Contact.Email'),
                Phone: getFieldValue(contact, 'Contact.Phone'),
                Title: getFieldValue(contact, 'Contact.Title'),
                IsSelected: false,
            };
        });
    }

    refreshPage() {
        this.selectedContact = {};
        this.application = {};
        this.template.querySelector("c-contact-information")?.refreshRecordView();
        this.template.querySelector("c-existing-contact-table")?.refreshRecordView();
        this.template.querySelector("c-contact-application")?.refreshRecordView();
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant,
            }),
        );
    }
}