public without sharing class PromptTemplateService {
    
    public static String invokePrompt(String promptTemplateDeveloperName, Map<String, ConnectApi.WrappedValue> inputParams) {
    String jwt = AuthTokenGenerator.getJwtToken();
    String accessToken = getAccessToken(jwt);
    
    // 1. Use the full base URL instead of 'callout:...'
    // Replace the URL below with your actual MyDomain URL
    String baseUrl = Url.getOrgDomainUrl().toExternalForm(); 
    String endpoint = baseUrl + '/services/data/v61.0/connect/einstein/llm/prompt-templates/Challenge_Generator_Coding/generations';
    
    Map<String, Object> cleanParams = new Map<String, Object>();
    for (String key : inputParams.keySet()) { cleanParams.put(key, inputParams.get(key).value); }
    
    Map<String, Object> requestBody = new Map<String, Object>{
        'inputParams' => cleanParams,
        'isPreview' => false,
        'additionalConfig' => new Map<String, Object>{
            'numGenerations' => 1,
            'applicationName' => 'ApexArenaIntegration'
        }
    };

    // We already know your Auth is working, so use your existing accessToken
    HttpRequest reqe = new HttpRequest();
    reqe.setEndpoint(baseUrl+'/services/data/v61.0/connect/einstein/llm');
    reqe.setMethod('GET');
    reqe.setHeader('Authorization', 'Bearer ' + accessToken);
    HttpResponse rese = new Http().send(reqe);
    System.debug('Templates JSON: ' + rese.getBody());

    HttpRequest req = new HttpRequest();
    req.setEndpoint(endpoint);
    req.setMethod('POST');
    req.setHeader('Content-Type', 'application/json');
    req.setHeader('Authorization', 'Bearer ' + accessToken);
    req.setHeader('X-Einstein-Application-Name', 'ApexArenaIntegration');
    req.setBody(JSON.serialize(requestBody));
    
    // Now this will send your Bearer token exactly as you defined it
    HttpResponse res = new Http().send(req);
    
    return parseResponse(res);
}

    private static String getAccessToken(String jwt) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint('https://login.salesforce.com/services/oauth2/token');
        req.setMethod('POST');
        // Update this line inside getAccessToken
        // Use this exact string format
        req.setBody('grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=' + jwt);
        
        HttpResponse res = new Http().send(req);
        System.debug('--- TOKEN EXCHANGE ERROR ---');
        System.debug('Status: ' + res.getStatusCode());
        System.debug('Response: ' + res.getBody()); // This will tell us if it's "invalid_grant" or "invalid_aud"
        Map<String, Object> responseMap = (Map<String, Object>)JSON.deserializeUntyped(res.getBody());
        return (String)responseMap.get('access_token');
    }
    
    private static String parseResponse(HttpResponse res) {
        // Add your parsing logic here
        return res.getBody();
    }
}