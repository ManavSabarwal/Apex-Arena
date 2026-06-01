trigger challengeAttemptTrigger on Challenge_Attempt__C (after insert) {

    Set<Id> attemptedChallengeIds = new Set<Id>();

    // Collect related Attempted Challenge IDs
    for (Challenge_Attempt__c attempt : Trigger.new) {

        if (attempt.Attempted_Challenge__c != null) {
            attemptedChallengeIds.add(attempt.Attempted_Challenge__c);
        }
    }

    // Exit if nothing to process
    if (attemptedChallengeIds.isEmpty()) {
        return;
    }

    // Query all parent Attempted Challenge records at once
    Map<Id, Attempted_Challenge__c> attemptedChallengeMap =
        new Map<Id, Attempted_Challenge__c>(
            [
                SELECT Id, Result__c
                FROM Attempted_Challenge__c
                WHERE Id IN :attemptedChallengeIds
            ]
        );

    List<Attempted_Challenge__c> recordsToUpdate =
        new List<Attempted_Challenge__c>();

    // Process trigger records
    for (Challenge_Attempt__c attempt : Trigger.new) {

        Attempted_Challenge__c parentChallenge =
            attemptedChallengeMap.get(attempt.Attempted_Challenge__c);

        if (parentChallenge == null) {
            continue;
        }

        // Once passed, never overwrite
        if (
            parentChallenge.Result__c != null &&
            parentChallenge.Result__c.toLowerCase() == 'pass'
            
        ) {
            continue;
        }

        // Update parent result
        if (attempt.Result__c != null && attempt.Action_Type__c=='Submit') {

            parentChallenge.Result__c = attempt.Result__c.toLowerCase();
            recordsToUpdate.add(parentChallenge);
        }
    }

    // Bulk update
    if (!recordsToUpdate.isEmpty()) {
        update recordsToUpdate;
    }

}