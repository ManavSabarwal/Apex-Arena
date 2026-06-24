public without sharing class PromptTemplateController {
    public PromptTemplateController() {

    }

    public class ValidationResponseWrapper {
        @AuraEnabled public String overallVerdict;
        @AuraEnabled public String compilationStatus;
        @AuraEnabled public Integer score;

        @AuraEnabled public List<String> badCodeReview;
        @AuraEnabled public List<String> goodCodeReview;
        @AuraEnabled public List<String> recommendedImprovements;

        @AuraEnabled public List<Object> scenarioResults;
        @AuraEnabled public String message;
        @AuraEnabled public String expPoints;

        @AuraEnabled public List<AchievementEngine.UnlockedAchievementDTO> unlockedAchievements;
    }

    public class ProblemResponseWrapper {
        @AuraEnabled public String Result;
        @AuraEnabled public String Reasoning;
        @AuraEnabled public String ArchitectOptimization;
        @AuraEnabled public String CodeReviewGood;
        @AuraEnabled public String CodeReviewBad;
        @AuraEnabled public Integer Score;
        @AuraEnabled public String message;
        @AuraEnabled public String expPoints;
        @AuraEnabled public List<AchievementEngine.UnlockedAchievementDTO> unlockedAchievements;
    }

        @AuraEnabled
public static String invokePrompt(
    String difficulty,
    String type,
    String UserName,
    String path
) {

    try {
        recordController rc = new recordController();

        String normalizedPath = path != null ? path.toLowerCase() : '';
        String previousScenarios = rc.getPreviousScenarios(
            UserName,
            type,
            normalizedPath
        );

        Map<String, Object> inputParams = new Map<String, Object>{
            'Input:Difficulty_Level' => difficulty,
            'Input:Type' => type,
            'Input:AttemptedChallenge_c' => previousScenarios
        };

        if (normalizedPath == 'debug') {
            return PromptTemplateRestService.invokePrompt(
                'Challenge_Generator',
                inputParams
            );
        }

        if (normalizedPath == 'build') {
            return PromptTemplateRestService.invokePrompt(
                'Challenge_Generator_Coding',
                inputParams
            );
        }

        throw new AuraHandledException('Invalid path: ' + path);

    } catch (Exception e) {
        throw new AuraHandledException(e.getMessage());
    }
}

        @AuraEnabled
public static ProblemResponseWrapper invokeValidationPrompt(String scenario, String solution,String challengeId) {
    List<String> responses=new List<String>();
    try {
        Map<String, Object> inputParams = new Map<String, Object>{
            'Input:Scenario' => scenario,
            'Input:Solution' => solution
        };

        String promptresponse = PromptTemplateRestService.invokePrompt(
            'Coding_Challenge_Resolution',
            inputParams
        );

        Map<String, Object> mapResponse =
            (Map<String, Object>) JSON.deserializeUntyped(promptresponse);

        ProblemResponseWrapper wrapper=new ProblemResponseWrapper();
        wrapper.Result=(String) mapResponse.get('Result');
        wrapper.Reasoning=(String) mapResponse.get('Reasoning');
        wrapper.ArchitectOptimization=(String) mapResponse.get('ArchitectOptimization');
        wrapper.CodeReviewGood=(String) mapResponse.get('CodeReviewGood');
        wrapper.CodeReviewBad=(String) mapResponse.get('CodeReviewBad');

        Object scoreValue = mapResponse.get('Score');
        if (scoreValue instanceof Integer) {
            wrapper.Score = (Integer) scoreValue;
        } else if (scoreValue != null) {
            wrapper.Score = Integer.valueOf(String.valueOf(scoreValue));
        }
        
        List<String> response=recordController.createChallengeAttempt(challengeId,wrapper.Result,solution,wrapper.CodeReviewGood,wrapper.CodeReviewBad,String.valueOf(wrapper.Score),'Submit','');
        wrapper.message=response[0];
        wrapper.expPoints=response[1];
        String challengeAttemptId=response[2];
        String userId=response[3];

        List<AchievementEngine.UnlockedAchievementDTO> unlockedAchievements =AchievementEngine.evaluateAndAssign(userId,challengeAttemptId);
        wrapper.unlockedAchievements=unlockedAchievements;
        return wrapper;



    } catch (Exception e) {
        throw new AuraHandledException(e.getMessage());
    }
}

        private static List<String> toStringList(Object input) 
        {
            List<String> result = new List<String>();
            if (input == null) return result;

            for (Object obj : (List<Object>) input) 
            {
                result.add(String.valueOf(obj));
            }
        return result;
}

        @AuraEnabled
public static ValidationResponseWrapper invokeValidationPromptCoding(
    String scenario,
    String solution,
    String sampleData,
    String submissionType,
    String requirements,
    String challengeId
) {

    try {
        Map<String, Object> inputParams = new Map<String, Object>{
            'Input:Scenario' => scenario,
            'Input:SolutionCode' => solution,
            'Input:SampleData' => sampleData,
            'Input:SubmissionType' => submissionType,
            'Input:Requirements' => requirements
        };

        String promptresponse = PromptTemplateRestService.invokePrompt(
            'Challenge_Validation_Coding',
            inputParams
        );

        Map<String, Object> mapResponse =
            (Map<String, Object>) JSON.deserializeUntyped(promptresponse);

        ValidationResponseWrapper wrapper = new ValidationResponseWrapper();

        wrapper.overallVerdict = (String) mapResponse.get('overallVerdict');
        wrapper.compilationStatus = (String) mapResponse.get('compilationStatus');
        wrapper.badCodeReview = toStringList(mapResponse.get('badCodeReview'));
        wrapper.goodCodeReview = toStringList(mapResponse.get('goodCodeReview'));
        wrapper.recommendedImprovements = toStringList(mapResponse.get('recommendedImprovements'));
        wrapper.scenarioResults = (List<Object>) mapResponse.get('scenarioResults');

        Object scoreValue = mapResponse.get('score');
        if (scoreValue instanceof Integer) {
            wrapper.score = (Integer) scoreValue;
        } else if (scoreValue != null) {
            wrapper.score = Integer.valueOf(String.valueOf(scoreValue));
        }

        List<String> response= recordController.createChallengeAttempt(challengeId, wrapper.overallVerdict, solution, String.join(wrapper.goodCodeReview, '\n') , String.join(wrapper.badCodeReview, '\n'), String.valueOf(wrapper.score), submissionType.split(' ')[0], JSON.serialize(wrapper.scenarioResults));
        wrapper.message=response[0];
        wrapper.expPoints=response[1];
        String challengeAttemptId=response[2];
        String userId=response[3];
        List<String> actionType=submissionType.split(' ');
        List<AchievementEngine.UnlockedAchievementDTO> unlockedAchievements=new List<AchievementEngine.UnlockedAchievementDTO>();
        if(actionType[0].toLowerCase()=='submit')
        {
            unlockedAchievements=AchievementEngine.evaluateAndAssign(userId,challengeAttemptId);
        
        }
        wrapper.unlockedAchievements=unlockedAchievements;


        return wrapper;

    } catch (Exception e) {
        throw new AuraHandledException(e.getMessage());
    }
}

@AuraEnabled
public static List<quizWrapper> invokeQuizPrompt(String areaOfExpertise,String username){
    try {

        List<quizWrapper> response =new List<quizWrapper>();
        if(areaOfExpertise!=null && areaOfExpertise!='')
        {
            Map<String, Object> inputParams = new Map<String, Object>{
            'Input:areaOfExpertise' => areaOfExpertise
            };

            String promptresponse = PromptTemplateRestService.invokePrompt(
            'MultipleChoiceQuestionGenerator_ApexArena',
            inputParams
            );

         response =(List<quizWrapper> ) JSON.deserialize(promptresponse,List<quizWrapper>.class);
         recordController.setQuizTerms(username,areaOfExpertise);
        }
        return response;
        
    } catch (Exception e) {
        throw new AuraHandledException(e.getMessage());
    }
}

public class quizWrapper
{
    @AuraEnabled public String Question;
    @AuraEnabled public Map<String,String> Choices;
    @AuraEnabled public String Answer;
    @AuraEnabled public String Explanation;
}

}