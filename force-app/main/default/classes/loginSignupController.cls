public with sharing class loginSignupController {
    public loginSignupController() {

    }

    @AuraEnabled
    public static string loginHelper(String Username,String Password)
    {
        string result=null;
        try{
            List<Apex_Arena_User__C> user=[Select id,name from Apex_Arena_User__C where name=:Username and Password__c=:Password limit 1];
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
            user.name=Username;
            user.password__c=Password;

            Database.insert(user,false);
            return 'SignUp Successfull';
        }
        catch(Exception e)
        {
            system.debug('Exception from SignupHelper: ' + e.getMessage());
            return 'SignUp Failed';
        }
    }
}