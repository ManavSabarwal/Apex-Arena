public class AuthTokenGenerator {
    
    // Replace with your Connected App's Consumer Key
    private static final String CLIENT_ID = '3MVG9rZjd7MXFdLjkFE62SSwnX78SVU9FipHax05TjVEGuJmBBGsgqh9QZyxjp7liQh3UmtoG9uJ6SF3l9_pj';
    // Replace with your Integration User's Username
    private static final String SUBJECT = 'manavsabarwal.0cbe5bae3632@agentforce.com';
    private static final String CERT_NAME = 'ApexArenaJWT'; // Matches your Cert Name

    public static String getJwtToken() {
        // Create the JWT header
        Auth.JWT jwt = new Auth.JWT();
        jwt.setSub(SUBJECT);
        jwt.setIss(CLIENT_ID);
        jwt.setAud('https://orgfarm-9c5fbfd2fd-dev-ed.develop.my.salesforce.com');
        jwt.setValidityLength(3600); // 1 hour

        // Sign the JWT with your Certificate
        Auth.JWS jws = new Auth.JWS(jwt, CERT_NAME);
        return jws.getCompactSerialization();
    }
}