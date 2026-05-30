public with sharing class PromptTemplateController {
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
        public static String invokePrompt(String difficulty, String type,String UserName,string path)
        {
            recordController rc=new recordController();
            String response='';
            try{
                
                String prev=rc.getPreviousScenarios(UserName,type,path);
                ConnectApi.WrappedValue inputValueMapdifficulty = new ConnectApi.WrappedValue();
                inputValueMapdifficulty.value = difficulty;
                ConnectApi.WrappedValue inputValueMapType = new ConnectApi.WrappedValue();
                inputValueMapType.value = type ;

                ConnectApi.WrappedValue inputValueMapPrev = new ConnectApi.WrappedValue();
                inputValueMapPrev.value = prev ;

                if(path=='debug')
                {
            
                    //Add Prompt input variables to a Map
                    Map<String, ConnectApi.WrappedValue> inputParams = new Map<String, ConnectApi.WrappedValue>();        
                    inputParams.put('Input:Difficulty_Level', inputValueMapdifficulty);
                    inputParams.put('Input:Type', inputValueMapType);
                    inputParams.put('Input:AttemptedChallenge_c', inputValueMapPrev);

                    response = PromptTemplateService.invokePrompt('Challenge_Generator', inputParams);
                    return response;
                }
                else if(path=='build')
                {

                    //Add Prompt input variables to a Map
                    Map<String, ConnectApi.WrappedValue> inputParams = new Map<String, ConnectApi.WrappedValue>();        
                    inputParams.put('Input:Difficulty_Level', inputValueMapdifficulty);
                    inputParams.put('Input:Type', inputValueMapType);
                    inputParams.put('Input:AttemptedChallenge_c', inputValueMapPrev);

                    response = PromptTemplateService.invokePrompt('Challenge_Generator_Coding', inputParams);
                    return response;

                }

            }catch (Exception e) {
                throw new AuraHandledException(e.getMessage());
            }
            return response;
        }

        @AuraEnabled
        public static string invokeValidationPrompt(String scenario,String solution){
            try {

                
                    ConnectApi.WrappedValue inputValueMapScenario = new ConnectApi.WrappedValue();
                    inputValueMapScenario.value = scenario;
                    ConnectApi.WrappedValue inputValueMapSolution = new ConnectApi.WrappedValue();
                    inputValueMapSolution.value = solution ;
                
                    //Add Prompt input variables to a Map
                    Map<String, ConnectApi.WrappedValue> inputParams = new Map<String, ConnectApi.WrappedValue>();        
                    inputParams.put('Input:Scenario', inputValueMapScenario);
                    inputParams.put('Input:Solution', inputValueMapSolution);

                    String response = PromptTemplateService.invokePrompt('Coding_Challenge_Resolution', inputParams);
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
        public static ValidationResponseWrapper invokeValidationPromptCoding(String scenario,String solution,string sampleData,string submissionType,string requirements){
            try {
                    ConnectApi.WrappedValue inputValueMapScenario = new ConnectApi.WrappedValue();
                    inputValueMapScenario.value = scenario;
                    ConnectApi.WrappedValue inputValueMapSolution = new ConnectApi.WrappedValue();
                    inputValueMapSolution.value = solution ;
                    ConnectApi.WrappedValue inputValueMapsampleData = new ConnectApi.WrappedValue();
                    inputValueMapsampleData.value = sampleData;
                    ConnectApi.WrappedValue inputValueMapsubmissionType = new ConnectApi.WrappedValue();
                    inputValueMapsubmissionType.value = submissionType;
                    ConnectApi.WrappedValue inputValueMaprequirements = new ConnectApi.WrappedValue();
                    inputValueMaprequirements.value = requirements;

                    Map<String, ConnectApi.WrappedValue> inputParams = new Map<String, ConnectApi.WrappedValue>();        
                    inputParams.put('Input:Scenario', inputValueMapScenario);
                    inputParams.put('Input:SolutionCode', inputValueMapSolution);
                    inputParams.put('Input:SampleData', inputValueMapsampleData);
                    inputParams.put('Input:SubmissionType', inputValueMapsubmissionType);
                    inputParams.put('Input:Requirements', inputValueMaprequirements);
                    


                    String response = PromptTemplateService.invokePrompt('Challenge_Validation_Coding', inputParams);

                    Map<String, Object> mapResponse =(Map<String, Object>) JSON.deserializeUntyped(response);

                    ValidationResponseWrapper wrapper = new ValidationResponseWrapper();

                    wrapper.overallVerdict = (String) mapResponse.get('overallVerdict');
                    wrapper.compilationStatus = (String) mapResponse.get('compilationStatus');
                    wrapper.badCodeReview = toStringList(mapResponse.get('badCodeReview'));
                    wrapper.goodCodeReview = toStringList(mapResponse.get('goodCodeReview'));
                    wrapper.recommendedImprovements = toStringList(mapResponse.get('recommendedImprovements'));

                    wrapper.scenarioResults = (List<Object>) mapResponse.get('scenarioResults');
                    wrapper.score=(Integer) mapResponse.get('score');

                    return wrapper;
                    

                
            } catch (Exception e) {
                throw new AuraHandledException(e.getMessage());
            }
        }

}