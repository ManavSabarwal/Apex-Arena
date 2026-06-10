public without sharing class ApexArenaTriggerHelper {
    public ApexArenaTriggerHelper() {

    }

    public void validateUserName(List<Apex_Arena_User__c> newList)
{
    Set<String> usernames = new Set<String>();

    // Check duplicates within same transaction
    for(Apex_Arena_User__c user : newList)
    {
        // Null checks
        if(user == null || String.isBlank(user.Name))
        {
            continue;
        }

        String username = user.Name.trim().toLowerCase();

        if(usernames.contains(username))
        {
            user.addError('Duplicate username in the same batch');
        }
        else
        {
            usernames.add(username);
        }
    }

    // Avoid unnecessary SOQL
    if(usernames.isEmpty())
    {
        return;
    }

    // Existing users check
    Map<String, Apex_Arena_User__c> existingUsersMap = new Map<String, Apex_Arena_User__c>();

    for(Apex_Arena_User__c existingUser : [
        SELECT Id, Name
        FROM Apex_Arena_User__c
        WHERE Name IN :usernames
    ])
    {
        if(!String.isBlank(existingUser.Name))
        {
            existingUsersMap.put(
                existingUser.Name.trim().toLowerCase(),
                existingUser
            );
        }
    }

    // Validate against database records
    for(Apex_Arena_User__c user : newList)
    {
        if(user == null || String.isBlank(user.Name))
        {
            continue;
        }

        String username = user.Name.trim().toLowerCase();

        if(existingUsersMap.containsKey(username))
        {
            user.addError('Username already exists');
        }
    }
}

public void validatePassword(List<Apex_Arena_User__c> newList)
{
    String passwordRegex =
        '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\\\d)(?=.*[@$!%*?&])[A-Za-z\\\\d@$!%*?&]{8,}$';

    for(Apex_Arena_User__c user : newList)
    {
        // Null object check
        if(user == null)
        {
            continue;
        }

        // Null/blank password check
        if(String.isBlank(user.Password__c))
        {
            user.addError('Password cannot be blank');
            continue;
        }

        String password = user.Password__c.trim();

        if(password.length() < 8)
        {
            user.addError('Password must be at least 8 characters long');
        }
        
    }
}
}