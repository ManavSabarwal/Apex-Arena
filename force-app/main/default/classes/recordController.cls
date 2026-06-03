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
    public static Map<String,String> createChallengeAttempt(String id, String result,String solution,string thegood,string thebad,string score){
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
                ca.score__c=score;

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

            string queryText='select id,Result__c,Name,score__c,Solution_Provided__c,Exp_gained__c,Code_Review_Good__c,Code_Review_Bad__c,Action_Type__c,Attempted_Challenge__r.Scenario__c,Attempted_Challenge__r.Path__c,Attempted_Challenge__r.DifficultyLevel__c,Attempted_Challenge__r.Type__c,Attempted_Challenge__r.Apex_Arena_User__r.Total_Exp_Points__c, Attempted_Challenge__r.Apex_Arena_User__r.Level__c, Attempted_Challenge__r.Apex_Arena_User__r.createddate FROM Challenge_Attempt__c where Attempted_Challenge__r.Apex_Arena_User__r.Name = :username' ;
            List<Challenge_Attempt__C> ca=Database.query(queryText);
            if(ca.size()==0)
            {
                 system.debug('No Challenge_Attempt__c records found for the given criteria.');
            } else {
                system.debug('Challenge_Attempt__c records retrieved: ' + ca.size());
            }
            return ca;
            

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled
     public static PaginationWrapper getSolvedChallenges(Integer pageNumber,
        Integer pageSize,
        String searchKey,
        String categoryFilter,
        String difficultyFilter,
        String pathFilter,String resultFilter,String username)
      {

        if(pageNumber == null || pageNumber <= 0){
            pageNumber = 1;
        }

        if(pageSize == null || pageSize <= 0){
            pageSize = 6;
        }

        Integer offsetValue = (pageNumber - 1) * pageSize;

        String baseQuery = 'FROM Attempted_Challenge__c WHERE Apex_Arena_User__r.name = :username';

        String searchPattern = '%' + searchKey + '%';

        if(String.isNotBlank(searchKey)){
                baseQuery += ' AND (Name LIKE :searchPattern OR Path__c LIKE :searchPattern)';
        }
        if(String.isNotBlank(categoryFilter) && categoryFilter != 'All Categories'){
            baseQuery += ' AND Type__c = :categoryFilter ';
        }
        if(String.isNotBlank(difficultyFilter) && difficultyFilter != 'All Difficulties'){
            baseQuery += ' AND DifficultyLevel__c = :difficultyFilter ';
        }

        if(String.isNotBlank(pathFilter) && pathFilter != 'All Paths'){
            baseQuery += ' AND Path__c = :pathFilter ';
        }

        if(String.isNotBlank(resultFilter) && resultFilter != 'All Results'){
            baseQuery += ' AND Result__c = :resultFilter ';
        }

        system.debug(baseQuery);

        // TOTAL COUNT
        Integer totalRecords = Database.countQuery('SELECT COUNT() ' + baseQuery);

        // DATA QUERY
        String finalQuery = 'SELECT Id,Name,Result__c,DifficultyLevel__c,Type__c,Path__c,LastModifiedDate ' + baseQuery + ' ORDER BY LastModifiedDate DESC LIMIT :pageSize OFFSET :offsetValue';
        system.debug(finalQuery);
        List<Attempted_Challenge__c> records =
            Database.query(finalQuery);

        PaginationWrapper response =
            new PaginationWrapper();

        response.records = records;
        response.totalRecords = totalRecords;
        response.totalPages =
            (Integer)Math.ceil(
                (Decimal)totalRecords / pageSize
            );
        response.pageSize = pageSize;
        response.currentPage = pageNumber;

        return response;
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

    @AuraEnabled
    public static List<Map<String,Object>> getHeatmapData(string username){
        try {
            List<Challenge_Attempt__c> attempts = [SELECT Id,Attempted_Challenge__r.Name, CreatedDate FROM Challenge_Attempt__c WHERE Attempted_Challenge__r.Apex_Arena_User__r.Name = :username];
            
            Map<Date, Integer> activityMap = new Map<Date, Integer>();
            for(Challenge_Attempt__c attempt : attempts) {
                Date attemptDate = attempt.CreatedDate.date();

                if(activityMap.containsKey(attemptDate)) {
                    activityMap.put(attemptDate, activityMap.get(attemptDate) + 1);
                } else {
                    activityMap.put(attemptDate, 1);
                }
            }

            List<Map<String,Object>> heatmap = new List<Map<String,Object>>();

        for(Integer i = 364; i >= 0; i--) {
            Date d = Date.today().addDays(-i);

            Integer count = activityMap.containsKey(d)
                    ? activityMap.get(d)
                    : 0;

            String level = 'level-0';

            if(count > 0 && count <= 2) {
                level = 'level-1';
            } else if(count <= 5) {
                level = 'level-2';
            } else if(count <= 10) {
                level = 'level-3';
            } else if(count > 10) {
                level = 'level-4';
            }

            heatmap.add(new Map<String,Object>{
                'date' => String.valueOf(d),
                'count' => count,
                'cssClass' => 'day ' + level,
                'tooltip' => String.valueOf(d) + ' - Submitted ' + count + ' challenges'
            });
        }

        return heatmap;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }


    @AuraEnabled
    public static List<Map<String, Object>> getAttemptDetails(String challengeId) {
        try {

            List<Challenge_Attempt__c> attempts = [SELECT Id, Name, Result__c, score__c, Solution_Provided__c, Exp_gained__c, Code_Review_Good__c, Code_Review_Bad__c, Action_Type__c,CreatedDate,Attempted_Challenge__r.Name, Attempted_Challenge__r.sampleData__c,Attempted_Challenge__r.Scenario__c, Attempted_Challenge__r.Path__c, Attempted_Challenge__r.DifficultyLevel__c, Attempted_Challenge__r.Type__c, Attempted_Challenge__r.Apex_Arena_User__r.Total_Exp_Points__c, Attempted_Challenge__r.Apex_Arena_User__r.Level__c, Attempted_Challenge__r.Apex_Arena_User__r.createddate FROM Challenge_Attempt__c WHERE Attempted_Challenge__r.Id = :challengeId order by CreatedDate desc];
            List<Attempted_Challenge__c> ac=[Select id,Name,Result__c,Scenario__C,DifficultyLevel__c,Type__c,Path__c,LastModifiedDate from Attempted_Challenge__c where id=:challengeId];
            List<Map<String, Object>> attemptDetails = new List<Map<String, Object>>();
            if(attempts.size()==0){
                Map<String, Object> details = new Map<String, Object>{
                    'Id' => null,
                    'Name' => null,
                    'Result' => null,
                    'Score' => null,
                    'SolutionProvided' => null,
                    'ExpGained' => null,
                    'CodeReviewGood' => null,
                    'CodeReviewBad' => null,
                    'ActionType' => null,
                    'ChallengeName'=> ac[0].Name,
                    'Scenario' => ac[0].Scenario__C,
                    'Path' => ac[0].Path__c,
                    'DifficultyLevel' => ac[0].DifficultyLevel__c,
                    'Type' => ac[0].Type__c,
                    'TotalExpPoints' => null,
                    'UserLevel' => null,
                    'AttemptDate' => null,
                    'sampleData'=>null
                };
                attemptDetails.add(details);
            } 
            else{
            for(Challenge_Attempt__c attempt : attempts) {
                Map<String, Object> details = new Map<String, Object>{
                    'Id' => attempt.Id,
                    'Name' => attempt.Name,
                    'Result' => attempt.Result__c,
                    'Score' => attempt.score__c,
                    'SolutionProvided' => attempt.Solution_Provided__c,
                    'ExpGained' => attempt.Exp_gained__c,
                    'CodeReviewGood' => attempt.Code_Review_Good__c,
                    'CodeReviewBad' => attempt.Code_Review_Bad__c,
                    'ActionType' => attempt.Action_Type__c,
                    'ChallengeName'=> attempt.Attempted_Challenge__r.Name,
                    'Scenario' => attempt.Attempted_Challenge__r.Scenario__c,
                    'Path' => attempt.Attempted_Challenge__r.Path__c,
                    'DifficultyLevel' => attempt.Attempted_Challenge__r.DifficultyLevel__c,
                    'Type' => attempt.Attempted_Challenge__r.Type__c,
                    'TotalExpPoints' => attempt.Attempted_Challenge__r.Apex_Arena_User__r.Total_Exp_Points__c,
                    'UserLevel' => attempt.Attempted_Challenge__r.Apex_Arena_User__r.Level__c,
                    'AttemptDate' => attempt.CreatedDate,
                    'sampleData'=>attempt.Attempted_Challenge__r.sampleData__c
                };
                attemptDetails.add(details);
            }
        }

            return attemptDetails;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}