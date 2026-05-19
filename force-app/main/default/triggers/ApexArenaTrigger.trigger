trigger ApexArenaTrigger on Apex_Arena_User__c (before insert) {

    ApeArenaUserTriggerHandler.beforeInsert(Trigger.new);

}