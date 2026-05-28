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

            if(problemTitle.length() > 80){
                    problemTitle = problemTitle.substring(0, 75)+'...';
            }

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
            ac.name=problemTitle;
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
                res.put('attemptId',ca.Id);
                return res;
            }
             catch (Exception e) {
                    throw new AuraHandledException(e.getMessage());
            }
    }

    @AuraEnabled
    public static string updateExpPoints(Integer expPoints,String attemptId){
        try {

                List<Challenge_Attempt__c> ca=[Select id,name,Exp_gained__C from Challenge_Attempt__c where id=: attemptId limit 1];
                Challenge_Attempt__c c=ca[0];
                c.Exp_gained__C=expPoints;
                update c;
                return 'Exp Point Updated ';

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<Attempted_Challenge__c> getAttemptedChallenges(String username,String recordLimit){
        try {
            string queryText='';
            if(Integer.valueOf(recordLimit)!=0)
            {
                queryText='SELECT Id, Name, Result__c, DifficultyLevel__c, Type__c, Path__c,LastModifiedDate ' +
                                'FROM Attempted_Challenge__c ' +
                                'WHERE Apex_Arena_User__r.Name = \'' + username + '\' ' +
                                'ORDER BY LastModifiedDate DESC ' +
                                'LIMIT ' + recordLimit;
            }
            else if(Integer.valueOf(recordLimit)==0)
            {
                queryText='SELECT Id, Name, Result__c, DifficultyLevel__c, Type__c, Path__c,LastModifiedDate ' +
                                'FROM Attempted_Challenge__c ' +
                                'WHERE Apex_Arena_User__r.Name = \'' + username + '\' ' +
                                'ORDER BY LastModifiedDate DESC ';
            }

            List<Attempted_Challenge__c> ac=Database.query(queryText);

            return ac;
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static List<Challenge_Attempt__C> getUserandChalengeDetails(String username){
        try {

            string queryText='select id,Result__c,Attempted_Challenge__r.DifficultyLevel__c,Attempted_Challenge__r.Type__c,Attempted_Challenge__r.Apex_Arena_User__r.Total_Exp_Points__c, Attempted_Challenge__r.Apex_Arena_User__r.Level__c, Attempted_Challenge__r.Apex_Arena_User__r.createddate FROM Challenge_Attempt__c where Attempted_Challenge__r.Apex_Arena_User__r.Name = \'' + username + '\' ' ;
            List<Challenge_Attempt__C> ca=Database.query(queryText);

            return ca;

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled
     public static PaginationWrapper getSolvedChallenges(String username,Integer pageSize,Integer pageNumber)
      {

        if(pageSize == null || pageSize <= 0){
            pageSize = 6;
        }

        if(pageNumber == null || pageNumber <= 0){
            pageNumber = 1;
        }

        Integer offsetValue = (pageNumber - 1) * pageSize;

        // TOTAL RECORDS
        Integer totalRecords = [
            SELECT COUNT()
            FROM Attempted_Challenge__c
        ];

        // FETCH PAGE DATA
        List<Attempted_Challenge__c> records = [SELECT Id, Name, Result__c, DifficultyLevel__c, Type__c, Path__c,LastModifiedDate FROM Attempted_Challenge__c WHERE Apex_Arena_User__r.Name =:username ORDER BY LastModifiedDate DESC LIMIT :pageSize OFFSET :offsetValue];
        

        PaginationWrapper wrapper = new PaginationWrapper();

        wrapper.records = records;
        wrapper.totalRecords = totalRecords;
        wrapper.pageSize = pageSize;
        wrapper.currentPage = pageNumber;
        wrapper.totalPages =
            (Integer)Math.ceil(
                (Decimal)totalRecords / pageSize
            );

        return wrapper;
    }

    public class PaginationWrapper {

        @AuraEnabled
        public List<Attempted_Challenge__c> records;

        @AuraEnabled
        public Integer totalRecords;

        @AuraEnabled
        public Integer pageSize;

        @AuraEnabled
        public Integer currentPage;

        @AuraEnabled
        public Integer totalPages;
    }
}