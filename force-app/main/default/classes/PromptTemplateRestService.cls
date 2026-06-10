public without sharing class PromptTemplateRestService {

    private static final String NAMED_CREDENTIAL = 'callout:Apex_Arena_AI';
    private static final String API_VERSION = 'v60.0';

    public static String invokePrompt(
        String promptTemplateDeveloperName,
        Map<String, Object> inputValues
    ) {
        if (String.isBlank(promptTemplateDeveloperName)) {
            throw new AuraHandledException('Prompt template name is required.');
        }

        if (inputValues == null || inputValues.isEmpty()) {
            throw new AuraHandledException('Prompt input values are required.');
        }

        HttpRequest req = new HttpRequest();

        req.setEndpoint(
            NAMED_CREDENTIAL +
            '/services/data/' +
            API_VERSION +
            '/einstein/prompt-templates/' +
            EncodingUtil.urlEncode(promptTemplateDeveloperName, 'UTF-8') +
            '/generations'
        );

        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json');
        req.setTimeout(120000);

        Map<String, Object> valueMap = new Map<String, Object>();

        for (String key : inputValues.keySet()) {
            valueMap.put(
                key,
                new Map<String, Object>{
                    'value' => inputValues.get(key)
                }
            );
        }

        Map<String, Object> body = new Map<String, Object>{
            'isPreview' => false,
            'inputParams' => new Map<String, Object>{
                'valueMap' => valueMap
            },
            'additionalConfig' => new Map<String, Object>{
                'numGenerations' => 1,
                'temperature' => 0,
                'frequencyPenalty' => 0.0,
                'presencePenalty' => 0.0,
                'additionalParameters' => new Map<String, Object>(),
                'applicationName' => 'PromptTemplateGenerationsInvocable'
            }
        };

        req.setBody(JSON.serialize(body));

        HttpResponse res = new Http().send(req);

        Integer statusCode = res.getStatusCode();

        if (statusCode < 200 || statusCode >= 300) {
            throw new AuraHandledException(
                'Prompt template call failed. Status: ' +
                statusCode +
                ', Body: ' +
                res.getBody()
            );
        }

        Map<String, Object> responseMap =
            (Map<String, Object>) JSON.deserializeUntyped(res.getBody());

        List<Object> generations =
            (List<Object>) responseMap.get('generations');

        if (generations == null || generations.isEmpty()) {
            throw new AuraHandledException('No generation returned from prompt template.');
        }

        Map<String, Object> firstGeneration =
            (Map<String, Object>) generations[0];

        String text = (String) firstGeneration.get('text');

        if (String.isBlank(text)) {
            throw new AuraHandledException('Prompt template returned empty text.');
        }

        return cleanJsonResponse(text);
    }

    private static String cleanJsonResponse(String text) {
        if (String.isBlank(text)) {
            return text;
        }

        String cleaned = text.trim();

        if (cleaned.startsWith('```json')) {
            cleaned = cleaned.replaceFirst('```json', '');
        }

        if (cleaned.startsWith('```')) {
            cleaned = cleaned.replaceFirst('```', '');
        }

        if (cleaned.endsWith('```')) {
            cleaned = cleaned.substring(0, cleaned.lastIndexOf('```'));
        }

        return cleaned.trim();
    }
}