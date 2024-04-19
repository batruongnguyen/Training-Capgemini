import { LightningElement, track, api, wire } from 'lwc';
import { getPicklistValuesByRecordType, getObjectInfo } from 'lightning/uiObjectInfoApi';

export default class ContactInformation extends LightningElement {

    @api contact;
    @track salutationPicklist = [];

    @api checkValidity() {

        return this.getContact().reduce((validSoFar, inputCmp) => {

            this.__checkValidEmail(inputCmp);

            if (inputCmp.disabled) {
                inputCmp.disabled = false;
                inputCmp.reportValidity();
    
                setTimeout(() => {
                    inputCmp.disabled = true;
                }, 1);
            }
            inputCmp.reportValidity();

            return validSoFar && inputCmp.checkValidity();
        }, true);
    }

    @api getContact() {
        return [
            ...this.template.querySelectorAll('lightning-input'),
            ...this.template.querySelectorAll('lightning-combobox')
        ];
    }

    @api 
    refreshRecordView() {
        let allFields = this.getContact();

        allFields.forEach(field => {
            field.value = null;
            field.disabled = false;
        });

        this.contact = {};
    }

    @wire(getObjectInfo, { objectApiName: 'Contact' })
    objectInfo;
  
    @wire(getPicklistValuesByRecordType, {
      recordTypeId: "$objectInfo.data.defaultRecordTypeId",
      objectApiName: 'Contact'
    })
    wirePicklist(res){
        this.salutationPicklist = this.__convertPicklist(res?.data?.picklistFieldValues?.Salutation?.values);
    }

    __convertPicklist(picklistEntries){
        if (picklistEntries) {
            return picklistEntries.map(entry => {
                return {
                    label: entry.label,
                    value: entry.value
                };
            });
        }
    }

    handleEmailChange() {
        let emailCmp = this.template.querySelector('lightning-input[data-name="Email"]');
        this.__checkValidEmail(emailCmp);
    }

    __checkValidEmail(inputCmp) {
        !inputCmp && console.error('Can not validate Email' + JSON.stringify(inputCmp));

        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmail = inputCmp.value && !regexEmail.test(inputCmp.value) && inputCmp.type === 'email'
        if (invalidEmail) {
            inputCmp.setCustomValidity('You have entered an invalid format.')
        } else {
            inputCmp.setCustomValidity('')
        }
    }
}