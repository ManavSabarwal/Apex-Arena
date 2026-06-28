public without sharing class recordController {
    public recordController() {

    }

    @AuraEnabled
    public static string getTopics(string username){
        string topicString='';
        try {
            if(username!=null && username!='')
            {
                List<Apex_Arena_User__c> user=[select id,Quiz_Search_Terms__c from Apex_Arena_User__c where name=:username limit 1];
                if(user.size()==0)
                {
                    system.debug('No User Returned');
                }
                else{
                    topicString=user[0].Quiz_Search_Terms__c;
                }
            }
            return topicString;
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    public static void setQuizTerms(string username,string quizTerm)
    {
        try {
            
            List<Apex_Arena_User__c> user=[select id,Quiz_Search_Terms__c from Apex_Arena_User__c where name=:username limit 1];
                if(user.size()==0)
                {
                    system.debug('No User Returned');
                }
                else{
                    if(user[0].Quiz_Search_Terms__c!=null)
                    {
                        List<String> terms=user[0].Quiz_Search_Terms__c.split(',');
                   
                        if(!terms.contains(quizTerm.toLowerCase()))
                        {
                            if(terms.size()>=5)
                            {
                                terms.remove(0);
                            }
                            terms.add(quizTerm.toLowerCase());
                        }
                        string termsToUpdate=String.join(terms,',');
                        user[0].Quiz_Search_Terms__c=termsToUpdate;
                    
                    }
                    else {
                        user[0].Quiz_Search_Terms__c=quizTerm.toLowerCase();
                    }
                    update user[0];
                }
            
        } catch (Exception e) {
            system.debug('Exception : '+e.getMessage());
        }
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
            system.debug('Username : '+ username);
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

    public static void streakCheck(String username)
    {
        Date today= System.today();
        Date yesterday=today.addDays(-1);

        DateTime startOfToday = DateTime.newInstance(today, Time.newInstance(0, 0, 0, 0));
        DateTime startOfYesterday = DateTime.newInstance(yesterday, Time.newInstance(0, 0, 0, 0));

        List<Challenge_Attempt__c> attemptsYesterday=[Select id from Challenge_Attempt__c where Attempted_Challenge__r.Apex_Arena_User__r.name=:username and createdDate>=:startOfYesterday and createdDate<:startOfToday];
        if(attemptsYesterday.size()==0)
        {
            return;
        } 
        else if (attemptsYesterday.size()>0) {
            List<Apex_Arena_User__c> users=[Select id,Current_Streak__c,Best_Streak__c from Apex_Arena_User__c where name=:username limit 1];
            if(users.size()>0)
            {
                Apex_Arena_User__c user=users[0];
                Integer CurrentStreak=(Integer)user.Current_Streak__c+1;
                Integer BestStreak=(Integer)user.Best_Streak__c;

                user.Current_Streak__c=CurrentStreak;

                if(BestStreak<CurrentStreak)
                {
                    user.Best_Streak__c=CurrentStreak;
                }

                update user;

            }
        }
    }

    @AuraEnabled
    public static List<String> createChallengeAttempt(String id, String result,String solution,string thegood,string thebad,string score,string actionType,string testCaseResults){
        try {

            List<Attempted_challenge__C> ac=[Select id,Apex_Arena_User__r.Id,Apex_Arena_User__r.Name ,attempts__C,result__c,path__c,DifficultyLevel__c from Attempted_challenge__C where id=:id];
            List<String> response=new List<String>();
            String userId=ac[0].Apex_Arena_User__r.Id;
            String username=ac[0].Apex_Arena_User__r.Name;
            String res='';
            if(!ac.isEmpty())
            {
                Challenge_Attempt__C ca=new Challenge_Attempt__c();
                ca.result__c=result;
                ca.Attempted_Challenge__c=(ID)id;
                Integer attempt=(Integer)ac[0].attempts__c+1;
                ca.name='Attempt '+attempt;
                ca.Solution_Provided__c=solution;
                ca.Code_Review_Good__c=thegood;
                ca.Code_Review_Bad__c=thebad;
                ca.score__c=score;
                ca.Action_Type__c=actionType;
                ca.Test_Case_Results__c=testCaseResults;
                string challengeResult=ac[0].result__C;
                string path=ac[0].path__c;
                string difficulty=ac[0].DifficultyLevel__c.toLowerCase();
                insert(ca);
                system.debug('Challenege Attempt Created with id: '+ca.Id);
                if(actionType=='Submit' && challengeResult.toLowerCase().contains('pass'))
                {
                    recordController.streakCheck(username);
                }
                string attemptId=ca.Id;
                Decimal exppoints=0;

                //to update expPoints
                if(String.isNotBlank(result) && result.toLowerCase().contains('pass'))
                {
                    if(challengeResult.toLowerCase().contains('pass'))
                    {
                        exppoints=0;
                        res='Challenge already completed successfully — XP reward unavailable for repeat clears.';
                    }
                    else
                    {
                        Decimal multiplier=1;
                        if(path=='Debugging')
                        {
                            if(attempt==1)
                            {
                                multiplier=1.5;
                                res='First attempt! 50% XP bonus awarded.';
                               
                            }
                            switch on difficulty {
                                when  'beginner'{ exppoints=(50*multiplier);}
                                when 'apprentice'{exppoints=(100*multiplier); }
                                when 'skilled developer'{exppoints=(200*multiplier); }
                                when 'expert architect'{exppoints=(400*multiplier); }
                                when 'Legendary Salesforce Hero'{exppoints=(800*multiplier); }
                                when else {exppoints=0;}
                            }
                        }

                        if(path=='Coding' && actionType=='Submit')
                        {
                            if(Integer.valueOf(score)>=95)
                            {
                                multiplier=1.2;
                                res='Score of 95% or above achieved! 20% XP bonus awarded.';
                            }
                            switch on difficulty {
                                when  'beginner'{ exppoints=(80*multiplier);}
                                when 'apprentice'{exppoints=(160*multiplier); }
                                when 'skilled developer'{exppoints=(320*multiplier); }
                                when 'expert architect'{exppoints=(640*multiplier); }
                                when 'Legendary Salesforce Hero'{exppoints=(1280*multiplier); }
                                when else {exppoints=0;}
                            }
                        }
                    }
                    Boolean isexpUpdated=recordController.updateExpPoints(exppoints, attemptId);
                    if(isexpUpdated)
                    {
                        system.debug('ExpPoints( '+exppoints+' ) Updated for challengeAttempt id: '+attemptId);
                    }
                }
                response.add(res);
                response.add(String.valueOf(exppoints));
                response.add(ca.Id);
                response.add(userId);

                
            }
            return response;
        }
             catch (Exception e) {
                    throw new AuraHandledException(e.getMessage());
            }
    }

    @AuraEnabled
    public static boolean updateExpPoints(Decimal expPoints,String attemptId){
        try {
        if (String.isBlank(attemptId)) {
            throw new AuraHandledException('Attempt Id is missing.');
        }

        if (expPoints == null) {
            expPoints = 0;
        }

        // Since Exp_gained__c is Number(18, 0), keep XP as a whole number
        expPoints = expPoints.setScale(0);

        List<Challenge_Attempt__c> ca = [
            SELECT Id, Exp_gained__c
            FROM Challenge_Attempt__c
            WHERE Id = :attemptId
            LIMIT 1
        ];

        if (ca.isEmpty()) {
            throw new AuraHandledException('No challenge attempt found for the given Id.');
        }

        Challenge_Attempt__c c = ca[0];
        c.Exp_gained__c = expPoints;

        update c;

        return true;

    } catch (Exception e) {
        throw new AuraHandledException(e.getMessage());
    }
    }

    @AuraEnabled
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


   public class UserChallengeDetailsWrapper {
    @AuraEnabled public Apex_Arena_User__c userDetails { get; set; }
    @AuraEnabled public List<AttemptedChallengeWrapper> attemptedChallenges { get; set; }
}

public class AttemptedChallengeWrapper {
    @AuraEnabled public Attempted_Challenge__c attemptedChallenge { get; set; }
    @AuraEnabled public List<Challenge_Attempt__c> challengeAttempts { get; set; }
    @AuraEnabled public Boolean hasAttempts { get; set; }
}

@AuraEnabled
public static UserChallengeDetailsWrapper getUserandChalengeDetails(String username) {
    try {
        UserChallengeDetailsWrapper response = new UserChallengeDetailsWrapper();
        response.attemptedChallenges = new List<AttemptedChallengeWrapper>();

        if (String.isBlank(username)) {
            return response;
        }

        List<Apex_Arena_User__c> users = [
            SELECT Id,
                   Name,
                   Total_Exp_Points__c,
                   AboutMe__c,
                   profilePic__c,
                   Level__c,
                   CreatedDate,
                   Current_Streak__c,
                   Best_Streak__c,
                   isPublicProfile__c
            FROM Apex_Arena_User__c
            WHERE Name = :username
            LIMIT 1
        ];

        if (users.isEmpty()) {
            return response;
        }

        Apex_Arena_User__c arenaUser = users[0];
        response.userDetails = arenaUser;

        List<Attempted_Challenge__c> attemptedChallenges = [
            SELECT Id,
                   Name,
                   Scenario__c,
                   Path__c,
                   DifficultyLevel__c,
                   Type__c,
                   Result__c,
                   Exp_Gained__c,
                   CreatedDate,
                   LastModifiedDate,
                   Apex_Arena_User__c
            FROM Attempted_Challenge__c
            WHERE Apex_Arena_User__c = :arenaUser.Id
            ORDER BY LastModifiedDate DESC
        ];

        if (attemptedChallenges.isEmpty()) {
            return response;
        }

        List<Challenge_Attempt__c> challengeAttempts = [
            SELECT Id,
                   Result__c,
                   Name,
                   Score__c,
                   Solution_Provided__c,
                   Exp_gained__c,
                   Code_Review_Good__c,
                   Code_Review_Bad__c,
                   Action_Type__c,
                   CreatedDate,
                   Attempted_Challenge__c
            FROM Challenge_Attempt__c
            WHERE Attempted_Challenge__r.Apex_Arena_User__c = :arenaUser.Id
            ORDER BY CreatedDate DESC
        ];

        Map<Id, List<Challenge_Attempt__c>> attemptsByChallengeId = new Map<Id, List<Challenge_Attempt__c>>();

        for (Challenge_Attempt__c attempt : challengeAttempts) {
            if (!attemptsByChallengeId.containsKey(attempt.Attempted_Challenge__c)) {
                attemptsByChallengeId.put(
                    attempt.Attempted_Challenge__c,
                    new List<Challenge_Attempt__c>()
                );
            }

            attemptsByChallengeId.get(attempt.Attempted_Challenge__c).add(attempt);
        }

        for (Attempted_Challenge__c attemptedChallenge : attemptedChallenges) {
            AttemptedChallengeWrapper challengeWrapper = new AttemptedChallengeWrapper();

            challengeWrapper.attemptedChallenge = attemptedChallenge;

            if (attemptsByChallengeId.containsKey(attemptedChallenge.Id)) {
                challengeWrapper.challengeAttempts = attemptsByChallengeId.get(attemptedChallenge.Id);
            } else {
                challengeWrapper.challengeAttempts = new List<Challenge_Attempt__c>();
            }

            challengeWrapper.hasAttempts = !challengeWrapper.challengeAttempts.isEmpty();

            response.attemptedChallenges.add(challengeWrapper);
        }

        return response;

    } catch (Exception e) {
        throw new AuraHandledException(e.getMessage());
    }
}

    @AuraEnabled
    public static List<User_Achievement__C> getUserAchievements(String username){
        try {
            List<User_Achievement__C> ach=[Select id,Achievement__r.name__c,Achievement__r.Description__c,Achievement__r.Icon__c,Achievement__r.rarity__c,Unlock_Date__c from User_Achievement__c where Apex_Arena_User__r.name=:username order by Unlock_Date__c desc];
            if(ach.size()>0)
            {
                system.debug('Fetched records');
            }
            else{
                system.debug('No records fetched');
            }
            return ach;
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static string saveChanges(string username,string imageUrl,string aboutMe,Boolean isPublic){
        try {
        List<Apex_Arena_User__c> users = [
            SELECT Id, ProfilePic__c, AboutMe__c,isPublicProfile__c
            FROM Apex_Arena_User__c
            WHERE Name = :username
            LIMIT 1
        ];

        if (users.isEmpty()) {
            throw new AuraHandledException('No user found');
        }

        Apex_Arena_User__c userRecord = users[0];

        Boolean aboutChanged =
            !String.isBlank(aboutMe) &&
            userRecord.AboutMe__c != aboutMe;

        Boolean imageChanged =
            !String.isBlank(imageUrl) &&
            userRecord.ProfilePic__c != imageUrl;

        Boolean isPublicChanged=
                userRecord.isPublicProfile__c != isPublic;

        if (aboutChanged) {
            userRecord.AboutMe__c = aboutMe;
        }

        if (imageChanged) {
            userRecord.ProfilePic__c = imageUrl;
        }

        if (isPublicChanged) {
            userRecord.isPublicProfile__c = isPublic;
        }

        if (aboutChanged || imageChanged || isPublicChanged) {
            update userRecord;
            return 'Changes Saved';
        }

        return 'No changes';

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

            List<Challenge_Attempt__c> attempts = [SELECT Id, Name, Result__c, score__c, Solution_Provided__c, Exp_gained__c, Code_Review_Good__c, Code_Review_Bad__c, Action_Type__c,Test_Case_Results__C,CreatedDate,Attempted_Challenge__r.Exp_Gained__c,Attempted_Challenge__r.Name, Attempted_Challenge__r.sampleData__c,Attempted_Challenge__r.Scenario__c, Attempted_Challenge__r.Path__c,Attempted_Challenge__r.Result__c ,Attempted_Challenge__r.DifficultyLevel__c, Attempted_Challenge__r.Type__c,Attempted_Challenge__r.Apex_Arena_User__r.Total_Exp_Points__c, Attempted_Challenge__r.Apex_Arena_User__r.Level__c, Attempted_Challenge__r.Apex_Arena_User__r.createddate FROM Challenge_Attempt__c WHERE Attempted_Challenge__r.Id = :challengeId order by CreatedDate desc];
            List<Attempted_Challenge__c> ac=[Select id,Name,Result__c,Scenario__C,DifficultyLevel__c,Type__c,Path__c,LastModifiedDate from Attempted_Challenge__c where id=:challengeId];
            List<Map<String, Object>> attemptDetails = new List<Map<String, Object>>();
            if(attempts.size()==0)
            {
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
                    'TotalExpPoints' => 0,
                    'UserLevel' => null,
                    'AttemptDate' => null,
                    'sampleData'=>null,
                    'testCaseResults'=>null,
                    'finalResult'=>ac[0].Result__c
                };
                attemptDetails.add(details);
            } 
            else
            {
            for(Challenge_Attempt__c attempt : attempts) 
            {
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
                    'TotalExpPoints' => attempt.Attempted_Challenge__r.Exp_Gained__c,
                    'UserLevel' => attempt.Attempted_Challenge__r.Apex_Arena_User__r.Level__c,
                    'AttemptDate' => attempt.CreatedDate,
                    'sampleData'=>attempt.Attempted_Challenge__r.sampleData__c,
                    'testCaseResults'=>attempt.Test_Case_Results__c,
                    'finalResult'=>attempt.Attempted_Challenge__r.Result__c
                    
                };
                attemptDetails.add(details);
            }
        }

        return attemptDetails;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static Map<String, Object> getChallengeDetails(string challengeId){
        try {

            List<Attempted_Challenge__c> ac=[Select id,Apex_Arena_User__c,Name,DifficultyLevel__c,ErrorCode__c,constraints__c,Exp_Gained__c,Path__c,Result__c,sampleData__c,Scenario__c,Symptoms__c,Type__c from Attempted_Challenge__C where id=:challengeId limit 1];
            Map<String, Object> result=new Map<String, Object>();
            if(ac.size()==1)
            {
                Map<String, Object> response=new Map<String, Object>{
                    'Id'=>ac[0].id,
                    'ProblemTitle'=>ac[0].Name,
                    'DifficultyLevel'=>ac[0].DifficultyLevel__c,
                    'ErrorCode'=>ac[0].ErrorCode__c,
                    'constraints'=>ac[0].constraints__c,
                    'Exp_Gained'=>ac[0].Exp_Gained__c,
                    'Path'=>ac[0].Path__c,
                    'Result'=>ac[0].Result__c,
                    'SampleData'=>ac[0].sampleData__c,
                    'Scenario'=>ac[0].Scenario__c,
                    'BusinessRequirements'=>ac[0].Symptoms__c,
                    'Type'=>ac[0].Type__c,
                    'UserId'=>ac[0].Apex_Arena_User__c
                };
                result= response;
                
            }
            return result;

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    public class SearchResponse {
        @AuraEnabled public List<SearchItem> users = new List<SearchItem>();
        @AuraEnabled public List<SearchItem> challenges = new List<SearchItem>();
    }

    public class SearchItem {
        @AuraEnabled public Id recordId;
        @AuraEnabled public String type;
        @AuraEnabled public String title;
        @AuraEnabled public String subtitle;
        @AuraEnabled public Integer score;

        public SearchItem(Id recordId, String type, String title, String subtitle, Integer score) {
            this.recordId = recordId;
            this.type = type;
            this.title = title;
            this.subtitle = subtitle;
            this.score = score;
        }
    }

    @AuraEnabled
    public static SearchResponse globalSearch(String searchKey,string username) {

        SearchResponse response = new SearchResponse();

        if (String.isBlank(searchKey) || searchKey.trim().length() < 2) {
            return response;
        }

        String normalizedKey = normalize(searchKey);
        String soslSearchTerm = buildSoslSearchTerm(normalizedKey);

        List<List<SObject>> searchResults = [
            FIND :soslSearchTerm IN ALL FIELDS
            RETURNING
                Apex_Arena_User__c(
                    Id,
                    Name,
                    Level__c,
                    Total_Exp_Points__c
                    WHERE IsPublicProfile__C=true
                    LIMIT 5
                ),
                Attempted_Challenge__c(
                    Id,
                    Name,
                    DifficultyLevel__c,
                    Type__c,
                    Path__c,
                    Result__c
                    WHERE Apex_Arena_User__r.name = :username
                    LIMIT 8
                )
        ];

        system.debug(searchResults);

        List<Apex_Arena_User__c> users =
            (List<Apex_Arena_User__c>) searchResults[0];

        List<Attempted_Challenge__c> challenges =
            (List<Attempted_Challenge__c>) searchResults[1];

        for (Apex_Arena_User__c userRecord : users) {
            response.users.add(
                new SearchItem(
                    userRecord.Id,
                    'User',
                    userRecord.Name,
                    userRecord.Level__c + ' • ' + userRecord.Total_Exp_Points__c + ' XP',
                    calculateScore(normalizedKey, userRecord.Name)
                )
            );
        }

        for (Attempted_Challenge__c challenge : challenges) {
            response.challenges.add(
                new SearchItem(
                    challenge.Id,
                    'Challenge',
                    challenge.Name,
                    challenge.Path__c + ' • ' + challenge.Type__c + ' • ' + challenge.DifficultyLevel__c,
                    calculateScore(normalizedKey, challenge.Name)
                )
            );
        }

        response.users.sort(new SearchItemSorter());
        response.challenges.sort(new SearchItemSorter());

        return response;
    }

    private static String normalize(String value) {
        return value
            .toLowerCase()
            .replaceAll('[^a-z0-9\\s]', ' ')
            .replaceAll('\\s+', ' ')
            .trim();
    }

    private static String buildSoslSearchTerm(String value) {

        List<String> tokens = value.split(' ');
        List<String> searchTokens = new List<String>();

        for (String token : tokens) {
            if (token.length() >= 2) {
                searchTokens.add(token + '*');
            }
        }

        return String.join(searchTokens, ' OR ');
    }

    private static Integer calculateScore(String searchKey, String target) {

        if (String.isBlank(target)) {
            return 0;
        }

        String normalizedTarget = normalize(target);

        if (normalizedTarget == searchKey) {
            return 100;
        }

        if (normalizedTarget.startsWith(searchKey)) {
            return 80;
        }

        if (normalizedTarget.contains(searchKey)) {
            return 60;
        }

        List<String> tokens = normalizedTarget.split(' ');

        for (String token : tokens) {
            if (token.startsWith(searchKey)) {
                return 50;
            }
        }

        return 20;
    }

    public class SearchItemSorter implements Comparator<SearchItem> {
        public Integer compare(SearchItem a, SearchItem b) {
            return b.score - a.score;
        }
    }
}