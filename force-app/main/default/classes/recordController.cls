public with sharing class recordController {
    public recordController() {

    }

    public string getPreviousScenarios(String username,String type,String path)
    {
        try{
            string challenge='';
            if(username!=null)
            {
                string lowerUsername=username.toLowerCase();
                
                List<Attempted_Challenge__c> prevChallenges=[SELECT Id FROM Attempted_Challenge__c WHERE Apex_Arena_User__r.Name =:lowerUsername and result__c!='pass' and Type__c=:type and Path__c=:path];
                for(Attempted_Challenge__c ac:prevChallenges)
                {
                    challenge =challenge+'\n\n'+ac.id;
                    
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

    @AuraEnabled
    public static String saveAttemptedChallenge(String problemTitle,String scenario,String errorcode,String symptoms,String type, String difficultylevel,string username,String path,String sampledata,String expectedOutput,String constraints){
        try {

            List<Apex_Arena_User__C> aau=[Select id from Apex_Arena_User__C where name=:username];
            String aauId=aau[0].ID;
            system.debug(aauId);
            Attempted_Challenge__c ac= new Attempted_Challenge__c();
            ac.scenario__c=scenario;
            ac.errorcode__c=errorcode;
            ac.Symptoms__c=symptoms;
            ac.type__C=type;
            ac.DifficultyLevel__c=difficultylevel;
            ac.Apex_Arena_User__c=aauId;
            ac.name=problemTitle +' - ' +username;
            ac.result__C='Pending';
            ac.path__c=path;
            ac.sampledata__c=sampledata;
            ac.expectedOutput__c=expectedOutput;
            ac.constraints__c=constraints;

            insert(ac);

            system.debug(ac.id);
            return (String)ac.id;
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static Map<String,String> createChallengeAttempt(String id, String result,String solution,string thegood,string thebad){
        try {

            List<Attempted_challenge__C> ac=[Select id, attempts__C,result__c from Attempted_challenge__C where id=:id];
            Map<String,String> res=new Map<String,String>();

            Challenge_Attempt__C ca=new Challenge_Attempt__c();
                ca.result__c=result;
                system.debug(result);
                ca.Attempted_Challenge__c=(ID)id;
                system.debug('ID Parameter-------------'+id);
                Integer attempt=(Integer)ac[0].attempts__c+1;
                ca.name='Attempt '+attempt;
                ca.Solution_Provided__c=solution;
                ca.Code_Review_Good__c=thegood;
                ca.Code_Review_Bad__c=thebad;

                res.put('oldresult',ac[0].result__C);
                res.put('attempt',attempt.toString());
                insert(ca);
                return res;
            }
             catch (Exception e) {
                    throw new AuraHandledException(e.getMessage());
            }
    }

    @AuraEnabled
    public static string updateApexArenaUser(String userName,Integer expPoints){
        try {

                List<Apex_Arena_User__C> aac=[Select id,name,Experience_Points__c from Apex_Arena_User__C where name=: username limit 1];
                Apex_Arena_User__C a=aac[0];
                a.Experience_Points__c=a.Experience_Points__c+expPoints;
                update a;
                return 'Exp Point Updated ';

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<Attempted_Challenge__c> getAttemptedChallenges(String username,String recordLimit){
        try {

            string queryText='SELECT Id, Name, Result__c, DifficultyLevel__c, Type__c, Path__c ' +
                                'FROM Attempted_Challenge__c ' +
                                'WHERE Apex_Arena_User__r.Name = \'' + username + '\' ' +
                                'ORDER BY LastModifiedDate DESC ' +
                                'LIMIT ' + recordLimit;

            List<Attempted_Challenge__c> ac=Database.query(queryText);

            return ac;
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}