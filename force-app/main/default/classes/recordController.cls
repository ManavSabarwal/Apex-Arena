public with sharing class recordController {
    public recordController() {

    }

    public string getPreviousScenarios(String username)
    {
        try{
            string challenge='';
            if(username!=null)
            {
                string lowerUsername=username.toLowerCase();
                
                List<Attempted_Challenge__c> prevChallenges=[SELECT Id,Challenge__r.Scenario__c FROM Attempted_Challenge__c WHERE Apex_Arena_User__r.Name =:lowerUsername];
                for(Attempted_Challenge__c ac:prevChallenges)
                {
                    challenge =challenge+'\n\n'+ac.Challenge__r.Scenario__c;
                    
                }
                system.debug(challenge);
            }
            if(challenge.length()>0)
            {
                return challenge;
            }
            else {
                return 'none';
            }
        }
        catch(Exception e)
        {
            system.debug('Exception : '+e.getMessage());
            return 'none';
        }
    }
}