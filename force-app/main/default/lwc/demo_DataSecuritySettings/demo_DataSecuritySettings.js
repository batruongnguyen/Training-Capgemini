import { LightningElement, track, api, wire } from 'lwc';
import getParents from '@salesforce/apex/Demo_DataSecuritySettingsController.getParents';
import getChildLookup from '@salesforce/apex/Demo_DataSecuritySettingsController.getChildLookup';
import getChildMasterDetail from '@salesforce/apex/Demo_DataSecuritySettingsController.getChildMasterDetail';
import { getListUi } from "lightning/uiListApi";

const actions = [
    { label: 'Get Child (Lookup) - Apex User Context', name: 'action_1' },
    { label: 'Get Child (Lookup) - System User Context', name: 'action_2' },
    { label: 'Get Child (MasterDetail) - Apex User Context', name: 'action_3' },
    { label: 'Get Child (MasterDetail) - System User Context', name: 'action_4' },
    // { label: 'Get Child (Lookup) - Lightning Data Service', name: 'action_5' },
    // { label: 'Get Child (MasterDetail) - Lightning Data Service', name: 'action_6' },
];

export default class Demo_DataSecuritySettings extends LightningElement
{
    @track spinner = true;

    @track parents = [];
    @track parentsFromLightningDataService = [];

    @track lookupChildren = [];
    @track masterDetailChildren = [];

    @track parentColumns = [
        {
            label: 'Name',
            fieldName: 'Name'
        },
        {
            label: 'Sensitive Data (only visible to System Admin)',
            fieldName: 'Sensitive_Data__c'
        },
        {
            type: 'action',
            typeAttributes: { rowActions: actions },
        },
    ];

    @track childColumns = [
        {
            label: 'Name',
            fieldName: 'Name'
        },
        {
            label: 'Sensitive Data (only visible to System Admin)',
            fieldName: 'Sensitive_Data__c'
        }
    ];

    @wire(getListUi, {
        objectApiName : 'Parent__c',
        listViewApiName: 'All_Parents',
    })
    listView({ error, data }) {

        if (data) {
            console.log('Data from LDS', data);

            this.parentsFromLightningDataService = data.records.records;
        } else if (error) {
            console.error(error);
        }

        this.spinner = false;
    }

    getParentsApexUserContext(e)
    {
        this.spinner = true;

        getParents({withUserContext: true})
        .then(result => {
            console.log('result', result);
            this.parents = result;
        })
        .catch((error) => {
            console.error(error);
        })
        .finally(() => {
            this.spinner = false;
        })
    }

    getParentsApexSystemContext(e)
    {
        this.spinner = true;

        getParents({withUserContext: false})
        .then(result => {
            console.log('result', result);
            this.parents = result;
        })
        .catch((error) => {
            console.error(error);
        })
        .finally(() => {
            this.spinner = false;
        })
    }

    getParentsLightningDataService()
    {
        let tmp = [];

        this.parentsFromLightningDataService.forEach(parent => {
            tmp.push({
                Id: parent.fields.Id?.value,
                Name: parent.fields.Name?.value,
                Sensitive_Data__c: parent.fields.Sensitive_Data__c?.value,
            })
        })
        this.parents = JSON.parse(JSON.stringify(tmp));
    }

    handleRowAction(event) {
        let actionName = event.detail.action.name;
        let row = event.detail.row;
        let parentId = row.Id;
        switch (actionName) {
            case 'action_1':
                this.getChildLookupUserContext(parentId);
                break;
            case 'action_2':
                this.getChildLookupSystemContext(parentId);
                break;
            case 'action_3':
                this.getChildMasterDetailUserContext(parentId);
                break;
            case 'action_4':
                this.getChildMasterDetailSystemContext(parentId);
                break;
            default:
        }
    }

    getChildLookupUserContext(parentId)
    {
        this.spinner = true;

        getChildLookup({parentId: parentId, withUserContext: true})
        .then(result => {
            console.log('result', result);
            this.lookupChildren = result;
        })
        .catch((error) => {
            console.error(error);
        })
        .finally(() => {
            this.spinner = false;
        })
    }

    getChildLookupSystemContext(parentId)
    {
        this.spinner = true;

        getChildLookup({parentId: parentId, withUserContext: false})
        .then(result => {
            console.log('result', result);
            this.lookupChildren = result;
        })
        .catch((error) => {
            console.error(error);
        })
        .finally(() => {
            this.spinner = false;
        })
    }

    getChildMasterDetailUserContext(parentId)
    {
        this.spinner = true;

        getChildMasterDetail({parentId: parentId, withUserContext: true})
        .then(result => {
            console.log('result', result);
            this.masterDetailChildren = result;
        })
        .catch((error) => {
            console.error(error);
        })
        .finally(() => {
            this.spinner = false;
        })
    }

    getChildMasterDetailSystemContext(parentId)
    {
        this.spinner = true;

        getChildMasterDetail({parentId: parentId, withUserContext: false})
        .then(result => {
            console.log('result', result);
            this.masterDetailChildren = result;
        })
        .catch((error) => {
            console.error(error);
        })
        .finally(() => {
            this.spinner = false;
        })
    }
}