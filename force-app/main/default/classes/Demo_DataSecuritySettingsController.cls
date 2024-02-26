public with sharing class Demo_DataSecuritySettingsController {
    @AuraEnabled(cacheable=true)
    public static List<Parent__c> getParents(Boolean withUserContext)
    {
        try {
            if (withUserContext) {
                return [SELECT Id, Name, Sensitive_Data__c FROM Parent__c ORDER BY Name ASC];
            } else {
                SharingSettingByPassHelper helper = new SharingSettingByPassHelper();
                return helper.getParentsWithSystemContext();
            }
        } catch (Exception e)
        {
            throw new AuraHandledException(e.getMessage());
        }
        
    }

    @AuraEnabled(cacheable=true)
    public static List<Child__c> getChildLookup(String parentId, Boolean withUserContext)
    {
        try {
            if (withUserContext) {
                return [SELECT Id, Name, Sensitive_Data__c FROM Child__c WHERE Parent__c = :parentId ORDER BY Name ASC];
            } else {
                SharingSettingByPassHelper helper = new SharingSettingByPassHelper();
                return helper.getChildLookupWithSystemContext(parentId);
            }
        } catch (Exception e)
        {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<Child_MasterDetail__c> getChildMasterDetail(String parentId, Boolean withUserContext)
    {
        try {
            if (withUserContext) {
                return [SELECT Id, Name FROM Child_MasterDetail__c WHERE Parent__c = :parentId ORDER BY Name ASC];
            } else {
                SharingSettingByPassHelper helper = new SharingSettingByPassHelper();
                return helper.getChildMasterDetailWithSystemContext(parentId);
            }
        } catch (Exception e)
        {
            throw new AuraHandledException(e.getMessage());
        }
    }

    public without sharing class SharingSettingByPassHelper
    {
        public List<Parent__c> getParentsWithSystemContext()
        {
            return [SELECT Id, Name, Sensitive_Data__c FROM Parent__c ORDER BY Name ASC];
        }

        public List<Child__c> getChildLookupWithSystemContext(String parentId)
        {
            return [SELECT Id, Name, Sensitive_Data__c FROM Child__c WHERE Parent__c = :parentId ORDER BY Name ASC];
        }

        public List<Child_MasterDetail__c> getChildMasterDetailWithSystemContext(String parentId)
        {
            return [SELECT Id, Name FROM Child_MasterDetail__c WHERE Parent__c = :parentId ORDER BY Name ASC];
        }
    }
}