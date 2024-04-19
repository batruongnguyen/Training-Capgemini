public with sharing class StartCardFormController {
    public StartCardFormController() { }

    @AuraEnabled(cacheable=true)
    public static List<Contact> getContactsByAccountId(Id accountId){

        if (String.isBlank(accountId)) {
            return null;
        }

        try {
            return [
                SELECT Id, Name, Salutation, FirstName, LastName, Email, Phone, Title
                FROM Contact
                WHERE AccountId =: accountId
                ORDER BY CreatedDate DESC
            ];

        } catch(Exception e) {
            throw new AuraHandledException(e.getMessage());
        }

    }

    @AuraEnabled
    public static void insertAccountChildData(Opportunity iOpp, Contact iContact, String accountId){

        try {
            Boolean existingContact = String.isNotBlank(iContact.Id);
            Contact contact = new Contact();

            if (!existingContact) {
                contact.AccountId = accountId;
                contact.Salutation = iContact.Salutation;
                contact.FirstName = iContact.FirstName;
                contact.LastName = iContact.LastName;
                contact.Email = iContact.Email;
                contact.Phone = iContact.Phone;
                contact.Title = iContact.Title;
                insert contact;
            }

            Opportunity opp = new Opportunity();
            opp.Id = null;
            opp.AccountId = accountId;
            opp.StageName = iOpp.StageName;
            opp.Name = iOpp.Name;
            opp.CloseDate = iOpp.CloseDate;
            opp.ContactId = existingContact ? iContact.Id : contact.Id;

            insert opp;

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}