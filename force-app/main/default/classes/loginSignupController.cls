public without sharing class loginSignupController {
    public loginSignupController() {

    }

    @AuraEnabled
    public static String loginHelper(String Username,String Password)
    {
        string result=null;
        try{
            String lowerUsername=Username.toLowerCase();
            List<Apex_Arena_User__C> user=[Select id,name from Apex_Arena_User__C where name=:lowerUsername and Password__c=:Password limit 1];
            if(user.size()==1)
            {
                result=user[0].name;
            }
            return result;
        }
        catch(Exception e)
        {
            system.debug('Error in loginHelper: ' + e.getMessage());
            return null;
        }
    }
    @AuraEnabled
    public static string signupHelper(String Username,String Password)
    {
        string result='';
        try{
            Apex_Arena_User__C user=new Apex_Arena_User__C();
            user.name=Username.toLowerCase();
            user.password__c=Password;
            user.OwnerId='005gK00003wUk0F';

            insert user;
            return 'SignUp Successful';
        }
        catch(Exception e)
        {
            system.debug('Exception from SignupHelper: ' + e.getMessage());
            return e.getMessage();
        }
    }
}