import { LightningElement, track, wire, api } from 'lwc';

export default class StartCard_ExistingContactTable extends LightningElement {

    @api contacts;
    @track __columns = [
        { label: '', fieldName: 'Action' },
        { label: 'Salutation', fieldName: 'Salutation' },
        { label: 'First Name', fieldName: 'FirstName' },
        { label: 'Last Name', fieldName: 'LastName' },
        { label: 'Email', fieldName: 'Email' },
        { label: 'Phone', fieldName: 'Phone' },
        { label: 'Title', fieldName: 'Title' }
    ];

    @api 
    refreshRecordView() {
        [...this.template.querySelectorAll('lightning-input')].forEach(field => {
            field.checked = false;
        });
    }

    handleCheckboxChange(event) {
        this.sendContactToParent(event.target.checked, event.target.dataset.itemId);
    }

    handleKeyCheck(event) {
        // handle for enter
        if (event.keyCode === 13) {
            const itemId = event.target.dataset.itemId;
            const inputElement = this.template.querySelector(`lightning-input[data-item-id="${itemId}"]`);
            this.sendContactToParent(!inputElement.checked, event.target.dataset.itemId);
        }
    }

    sendContactToParent(checked, itemId) {
        const selectedEvent = new CustomEvent("processcontact", {
            detail: {
                selectedKey: itemId,
                isSelected: checked
            }
        });
      
        this.dispatchEvent(selectedEvent);
    }

}