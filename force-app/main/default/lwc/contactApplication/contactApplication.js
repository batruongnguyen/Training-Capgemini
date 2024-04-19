import { LightningElement, track, api, wire } from 'lwc';
import { getPicklistValuesByRecordType, getObjectInfo } from 'lightning/uiObjectInfoApi';

export default class ContactApplication extends LightningElement {

    @api application = {};
    @track stagePicklist;

    @api getApplication() {
        return [
            ...this.template.querySelectorAll('lightning-input'),
            ...this.template.querySelectorAll('lightning-combobox')
        ];
    }

    @api checkValidity() {
        return this.getApplication().reduce((validSoFar, inputCmp) => {
            inputCmp.reportValidity();
            return validSoFar && inputCmp.checkValidity();
        }, true);
    }

    @api 
    refreshRecordView() {

        [
            ...this.template.querySelectorAll('lightning-input'),
            ...this.template.querySelectorAll('lightning-combobox')
        ]
        .forEach(field => {
            field.value = null;
        });

        this.application = {};
    }

    @wire(getObjectInfo, { objectApiName: 'Opportunity' })
    objectInfo;
  
    @wire(getPicklistValuesByRecordType, {
      recordTypeId: "$objectInfo.data.defaultRecordTypeId",
      objectApiName: 'Opportunity'
    })
    wirePicklist(res){
        this.stagePicklist = this.__convertPicklist(res?.data?.picklistFieldValues?.StageName?.values);
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
}