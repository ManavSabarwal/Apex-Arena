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
public static String invokeValidationPrompt(String scenario, String solution) {
    try {
        Map<String, Object> inputParams = new Map<String, Object>{
            'Input:Scenario' => scenario,
            'Input:Solution' => solution
        };

        String response = PromptTemplateRestService.invokePrompt(
            'Coding_Challenge_Resolution',
            inputParams
        );

        return response;

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
    String requirements
) {

    try {
        Map<String, Object> inputParams = new Map<String, Object>{
            'Input:Scenario' => scenario,
            'Input:SolutionCode' => solution,
            'Input:SampleData' => sampleData,
            'Input:SubmissionType' => submissionType,
            'Input:Requirements' => requirements
        };

        String response = PromptTemplateRestService.invokePrompt(
            'Challenge_Validation_Coding',
            inputParams
        );

        Map<String, Object> mapResponse =
            (Map<String, Object>) JSON.deserializeUntyped(response);

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

        return wrapper;

    } catch (Exception e) {
        throw new AuraHandledException(e.getMessage());
    }
}

}