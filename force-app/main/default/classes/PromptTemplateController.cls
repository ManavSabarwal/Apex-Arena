public with sharing class PromptTemplateController {
    public PromptTemplateController() {

    }

        @AuraEnabled(cacheable=true)
        public static String invokePrompt(String difficulty, String type){
            ConnectApi.WrappedValue inputValueMapdifficulty = new ConnectApi.WrappedValue();
            inputValueMapdifficulty.value = difficulty;
            ConnectApi.WrappedValue inputValueMapType = new ConnectApi.WrappedValue();
            inputValueMapType.value = type ;
            
            //Add Prompt input variables to a Map
            Map<String, ConnectApi.WrappedValue> inputParams = new Map<String, ConnectApi.WrappedValue>();        
            inputParams.put('Input:Difficulty_Level', inputValueMapdifficulty);
            inputParams.put('Input:Type', inputValueMapType);

            String response = PromptTemplateService.invokePrompt('Challenge_Generator', inputParams);
            return response;
        }
}