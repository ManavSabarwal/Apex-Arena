public with sharing class ApexArenaTriggerHelper {
    public ApexArenaTriggerHelper() {

    }

    public void validateUserName(List<Apex_Arena_User__c> newList)
    {
        Set<String> usernames=new Set<String>();
        for(Apex_Arena_User__C user:newList)
        {
            if(usernames.contains(user.name))
            {
                throw new IllegalArgumentException('Duplicate username in the same batch');
            }
            else
            {
                usernames.add(user.name);
                system.debug(usernames);
            }
        }

        List<Apex_Arena_User__C> existingUsers=[Select name from Apex_Arena_User__C where name IN :usernames];
        system.debug(existingUsers);
        for(Apex_Arena_User__C existingUser:existingUsers)
        {
            for(Apex_Arena_User__C user:newList)
            {
                if(existingUser.name==user.name)
                {
                    system.debug(existingUser.name);
                    system.debug(user.name);
                    user.addError('Username already exists');
                }
            }
        }
    }
}