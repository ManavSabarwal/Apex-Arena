public class SessionService {

    public static String createSession(Id userId) {
        String token = EncodingUtil.convertToHex(
            Crypto.generateDigest('SHA1', Blob.valueOf(String.valueOf(System.now()) + userId))
        );

        Custom_Session__c s = new Custom_Session__c();
        s.Token__c = token;
        s.User__c = userId;
        s.Expiry__c = System.now().addHours(2);
        insert s;

        return token;
    }

    public static Apex_Arena_User__c validate(String token) {

        List<Custom_Session__c> sessions = [
            SELECT User__c, Expiry__c
            FROM Custom_Session__c
            WHERE Token__c = :token
            LIMIT 1
        ];

        if (sessions.isEmpty()) return null;
        if (sessions[0].Expiry__c < System.now()) return null;

        return [
            SELECT Id, Name
            FROM Apex_Arena_User__c
            WHERE Id = :sessions[0].User__c
        ];
    }
}