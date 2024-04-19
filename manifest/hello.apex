function FF_OnAfterRender() {
  fs('.hasDatepicker').each(function() {
    var fieldValue = fs(this).val();
    if (fieldValue && fieldValue !== "") {
      prefillDateWorkaround(fs(this));
    }
  });

  checkContainingInteger("#advpm__Matter__c\\.advpm__Primary_Account__c\\.Name", "Full Name");
  checkContainingInteger("#advpm__Matter__c\\.advpm__Primary_Account__c\\.Middle_Name__c", "Middle Name");
  checkContainingInteger("#advpm__Matter__c\\.advpm__Primary_Account__c\\.Aliases__c", "Other Names/Aliases");
  checkContainingInteger("#advpm__Matter__c\\.Onboarding_App_Data__c\\.Mother_s_Maiden_Name__c", "Mother's First & Maiden Last Name");
  checkContainingInteger("#advpm__Matter__c\\.Onboarding_App_Data__c\\.Father_s_Name__c", "Father's First & Last Name");

  return true;
}

function checkContainingInteger(selector, fieldName) {
  fs(selector).change(function() {
    var fieldValue = fs(this).val();
    console.log(fieldValue);

    if (/\d/.test(fieldValue)) {
      alert(fieldName + " should not contain any Integer");
    }
  });
}

function prefillDateWorkaround(field) {
  var textVal = field.val();
  console.log(textVal);
  var vDates = textVal.split('-');
  console.log(vDates);
  field.val(vDates[1] + "/" + vDates[2] + "/" + vDates[0]);
}
