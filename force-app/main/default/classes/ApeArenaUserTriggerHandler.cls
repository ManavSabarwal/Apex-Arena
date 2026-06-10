public without sharing class ApeArenaUserTriggerHandler extends TriggerHandler{
    public ApeArenaUserTriggerHandler() {

    }

    public static void beforeInsert(List<Apex_Arena_User__C> newList)
    {
        ApexArenaTriggerHelper helper=new ApexArenaTriggerHelper();
        helper.validateUserName(newList);
        helper.validatePassword(newList);
    }
}