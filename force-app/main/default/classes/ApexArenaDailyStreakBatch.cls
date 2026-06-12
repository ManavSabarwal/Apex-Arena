public without sharing class ApexArenaDailyStreakBatch
    implements Database.Batchable<SObject>, Schedulable {

    public Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator([
            SELECT Id,
                   Current_Streak__c,
                   Best_Streak__c,
                   Last_Streak_Evaluated_Date__c
            FROM Apex_Arena_User__c
        ]);
    }

    public void execute(Database.BatchableContext bc, List<Apex_Arena_User__c> users) {
        if (users == null || users.isEmpty()) {
            return;
        }

        Date today = Date.today();
        Date yesterday = today.addDays(-1);

        DateTime startOfYesterday = DateTime.newInstance(
            yesterday,
            Time.newInstance(0, 0, 0, 0)
        );

        DateTime startOfToday = DateTime.newInstance(
            today,
            Time.newInstance(0, 0, 0, 0)
        );

        Set<Id> userIds = new Set<Id>();

        for (Apex_Arena_User__c userRecord : users) {
            userIds.add(userRecord.Id);
        }

        Set<Id> usersWithSubmissionYesterday = new Set<Id>();

        for (AggregateResult result : [
            SELECT Attempted_Challenge__r.Apex_Arena_User__C Id,
                   COUNT(Id) submissionCount
            FROM Challenge_Attempt__c
            WHERE Attempted_Challenge__r.Apex_Arena_User__C IN :userIds
            AND CreatedDate >= :startOfYesterday
            AND CreatedDate < :startOfToday
            GROUP BY Attempted_Challenge__r.Apex_Arena_User__C
        ]) {
            usersWithSubmissionYesterday.add((Id) result.get('userId'));
        }

        List<Apex_Arena_User__c> usersToUpdate = new List<Apex_Arena_User__c>();

        for (Apex_Arena_User__c userRecord : users) {

            // Prevent double increment if batch runs again for the same date.
            if (userRecord.Last_Streak_Evaluated_Date__c == yesterday) {
                continue;
            }

            Decimal currentStreak = userRecord.Current_Streak__c == null
                ? 0
                : userRecord.Current_Streak__c;

            Decimal bestStreak = userRecord.Best_Streak__c == null
                ? 0
                : userRecord.Best_Streak__c;

            if (usersWithSubmissionYesterday.contains(userRecord.Id)) {
                currentStreak += 1;
            } else {
                currentStreak = 0;
            }

            if (currentStreak > bestStreak) {
                bestStreak = currentStreak;
            }

            Apex_Arena_User__c updatedUser = new Apex_Arena_User__c();
            updatedUser.Id = userRecord.Id;
            updatedUser.Current_Streak__c = currentStreak;
            updatedUser.Best_Streak__c = bestStreak;
            updatedUser.Last_Streak_Evaluated_Date__c = yesterday;

            usersToUpdate.add(updatedUser);
        }

        if (!usersToUpdate.isEmpty()) {
            update usersToUpdate;
            for (Apex_Arena_User__c updatedUser : usersToUpdate) {
                AchievementEngine.evaluateAndAssign(updatedUser.Id, null);
            }
        }
    }

    public void finish(Database.BatchableContext bc) {
        // Optional: add logging later if needed.
    }

    public void execute(SchedulableContext sc) {
        Database.executeBatch(new ApexArenaDailyStreakBatch(), 200);
    }

    public static void scheduleDailyMidnightJob() {
        String cronExpression = '0 0 0 * * ?';

        System.schedule(
            'Apex Arena Daily Streak Batch',
            cronExpression,
            new ApexArenaDailyStreakBatch()
        );
    }
}