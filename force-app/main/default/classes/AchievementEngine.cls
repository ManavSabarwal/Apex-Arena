public without sharing class AchievementEngine {

    public class UnlockedAchievementDTO {
        @AuraEnabled public Id userAchievementId;
        @AuraEnabled public Id achievementId;
        @AuraEnabled public String name;
        @AuraEnabled public String description;
        @AuraEnabled public String category;
        @AuraEnabled public String rarity;
        @AuraEnabled public String iconUrl;
    }

    private class UserStats {
        Integer totalSubmissions = 0;
        Integer passedAttempts = 0;

        Integer solvedTotal = 0;
        Integer solvedEasy = 0;
        Integer solvedMedium = 0;
        Integer solvedHard = 0;

        Integer solvedCoding = 0;
        Integer solvedDebugging = 0;

        Integer solvedSync = 0;
        Integer solvedAsync = 0;
        Integer solvedTrigger = 0;
        Integer solvedTestClass = 0;

        Integer perfectScores = 0;

        Integer maxWinStreak = 0;

        Integer currentDailyStreak = 0;
        Integer bestDailyStreak = 0;

        Integer fastSolvesUnder10 = 0;

        Decimal successRate = 0;
        Decimal totalXp = 0;

        Boolean passAfterFail = false;
        Boolean passAfterThreeFails = false;
    }

    @AuraEnabled
    public static List<UnlockedAchievementDTO> evaluateAndAssign(
        Id arenaUserId,
        Id latestAttemptId
    ) {
        List<UnlockedAchievementDTO> newlyUnlockedAchievements =
            new List<UnlockedAchievementDTO>();

        if (arenaUserId == null) {
            return newlyUnlockedAchievements;
        }

        Apex_Arena_User__c arenaUser = [
            SELECT Id,
                   Total_Exp_Points__c,
                   Current_Streak__c,
                   Best_Streak__c
            FROM Apex_Arena_User__c
            WHERE Id = :arenaUserId
            LIMIT 1
        ];

        Set<Id> alreadyUnlockedAchievementIds = new Set<Id>();

        for (User_Achievement__c userAchievement : [
            SELECT Id,
                   Achievement__c
            FROM User_Achievement__c
            WHERE Apex_Arena_User__c = :arenaUserId
        ]) {
            alreadyUnlockedAchievementIds.add(userAchievement.Achievement__c);
        }

        List<Achievement__c> activeAchievements = [
            SELECT Id,
                   Name__c,
                   Description__c,
                   Category__c,
                   Rarity__c,
                   Icon__c,
                   Is_Active__c,
                   Display_Order__c
            FROM Achievement__c
            WHERE Is_Active__c = true
            ORDER BY Display_Order__c ASC
        ];

        if (activeAchievements.isEmpty()) {
            return newlyUnlockedAchievements;
        }

        Set<Id> achievementIds = new Set<Id>();

        for (Achievement__c achievement : activeAchievements) {
            achievementIds.add(achievement.Id);
        }

        List<Achievement_Condition__c> activeConditions = [
            SELECT Id,
                   Achievement__c,
                   Metric__c,
                   Operator__c,
                   Target_Value__c,
                   Condition_Group__c,
                   Is_Active__c
            FROM Achievement_Condition__c
            WHERE Is_Active__c = true
            AND Achievement__c IN :achievementIds
            ORDER BY Achievement__c ASC,
                     Condition_Group__c ASC
        ];

        Map<Id, Map<String, List<Achievement_Condition__c>>> groupedConditions =
            buildGroupedConditions(activeConditions);

        UserStats stats = buildUserStats(
            arenaUser,
            arenaUserId,
            latestAttemptId
        );

        Map<String, Decimal> metrics = buildMetricMap(stats);

        List<User_Achievement__c> recordsToInsert =
            new List<User_Achievement__c>();

        List<Achievement__c> achievementsByInsertIndex =
            new List<Achievement__c>();

        for (Achievement__c achievement : activeAchievements) {

            if (alreadyUnlockedAchievementIds.contains(achievement.Id)) {
                continue;
            }

            Boolean qualifies = doesAchievementQualify(
                achievement.Id,
                groupedConditions,
                metrics
            );

            if (!qualifies) {
                continue;
            }

            User_Achievement__c userAchievement = new User_Achievement__c();
            userAchievement.Apex_Arena_User__c = arenaUserId;
            userAchievement.Achievement__c = achievement.Id;
            userAchievement.Unlock_Date__c = System.now();
            userAchievement.Source_Attempt__c = latestAttemptId;
            userAchievement.UniqueKey__c =
                String.valueOf(arenaUserId) + '-' + String.valueOf(achievement.Id);

            recordsToInsert.add(userAchievement);
            achievementsByInsertIndex.add(achievement);
        }

        if (recordsToInsert.isEmpty()) {
            return newlyUnlockedAchievements;
        }

        Database.SaveResult[] insertResults =
            Database.insert(recordsToInsert, false);

        for (Integer i = 0; i < insertResults.size(); i++) {

            if (!insertResults[i].isSuccess()) {
                continue;
            }

            Achievement__c achievement = achievementsByInsertIndex[i];

            UnlockedAchievementDTO dto = new UnlockedAchievementDTO();
            dto.userAchievementId = insertResults[i].getId();
            dto.achievementId = achievement.Id;
            dto.name = achievement.Name__c;
            dto.description = achievement.Description__c;
            dto.category = achievement.Category__c;
            dto.rarity = achievement.Rarity__c;
            dto.iconUrl = achievement.Icon__c;

            newlyUnlockedAchievements.add(dto);
        }

        return newlyUnlockedAchievements;
    }

    private static Map<Id, Map<String, List<Achievement_Condition__c>>> buildGroupedConditions(
        List<Achievement_Condition__c> conditions
    ) {
        Map<Id, Map<String, List<Achievement_Condition__c>>> result =
            new Map<Id, Map<String, List<Achievement_Condition__c>>>();

        if (conditions == null || conditions.isEmpty()) {
            return result;
        }

        for (Achievement_Condition__c condition : conditions) {
            if (condition.Achievement__c == null) {
                continue;
            }

            String groupKey = String.valueOf(condition.Condition_Group__c);

            if (String.isBlank(groupKey)) {
                groupKey = '1';
            }

            if (!result.containsKey(condition.Achievement__c)) {
                result.put(
                    condition.Achievement__c,
                    new Map<String, List<Achievement_Condition__c>>()
                );
            }

            if (!result.get(condition.Achievement__c).containsKey(groupKey)) {
                result.get(condition.Achievement__c).put(
                    groupKey,
                    new List<Achievement_Condition__c>()
                );
            }

            result.get(condition.Achievement__c).get(groupKey).add(condition);
        }

        return result;
    }

    private static Boolean doesAchievementQualify(
        Id achievementId,
        Map<Id, Map<String, List<Achievement_Condition__c>>> groupedConditions,
        Map<String, Decimal> metrics
    ) {
        if (!groupedConditions.containsKey(achievementId)) {
            return false;
        }

        Map<String, List<Achievement_Condition__c>> conditionGroups =
            groupedConditions.get(achievementId);

        if (conditionGroups == null || conditionGroups.isEmpty()) {
            return false;
        }

        /*
         * Logic:
         * - Conditions inside the same group are AND.
         * - Different groups are OR.
         *
         * Example:
         * Group 1:
         *   SOLVED_CODING >= 5
         *   SOLVED_DEBUGGING >= 5
         *
         * User qualifies if all conditions in Group 1 pass.
         *
         * If Group 2 exists, user qualifies if Group 1 OR Group 2 passes.
         */
        for (String groupKey : conditionGroups.keySet()) {
            Boolean allConditionsInGroupPassed = true;

            for (Achievement_Condition__c condition : conditionGroups.get(groupKey)) {
                if (!evaluateCondition(condition, metrics)) {
                    allConditionsInGroupPassed = false;
                    break;
                }
            }

            if (allConditionsInGroupPassed) {
                return true;
            }
        }

        return false;
    }

    private static Boolean evaluateCondition(
        Achievement_Condition__c condition,
        Map<String, Decimal> metrics
    ) {
        if (
            condition == null ||
            String.isBlank(condition.Metric__c) ||
            String.isBlank(condition.Operator__c) ||
            condition.Target_Value__c == null
        ) {
            return false;
        }

        String metricName = condition.Metric__c.trim();

        if (!metrics.containsKey(metricName)) {
            return false;
        }

        Decimal actualValue = metrics.get(metricName);
        Decimal targetValue = condition.Target_Value__c;
        String operatorValue = condition.Operator__c.trim();

        if (operatorValue == '>=') {
            return actualValue >= targetValue;
        }

        if (operatorValue == '>') {
            return actualValue > targetValue;
        }

        if (operatorValue == '<=') {
            return actualValue <= targetValue;
        }

        if (operatorValue == '<') {
            return actualValue < targetValue;
        }

        if (operatorValue == '=' || operatorValue == '==') {
            return actualValue == targetValue;
        }

        if (operatorValue == '!=') {
            return actualValue != targetValue;
        }

        return false;
    }

    private static UserStats buildUserStats(
        Apex_Arena_User__c arenaUser,
        Id arenaUserId,
        Id latestAttemptId
    ) {
        UserStats stats = new UserStats();

        stats.totalXp = arenaUser.Total_Exp_Points__c == null
            ? 0
            : arenaUser.Total_Exp_Points__c;

        stats.currentDailyStreak = arenaUser.Current_Streak__c == null
            ? 0
            : Integer.valueOf(arenaUser.Current_Streak__c);

        stats.bestDailyStreak = arenaUser.Best_Streak__c == null
            ? 0
            : Integer.valueOf(arenaUser.Best_Streak__c);

        Map<String, Schema.SObjectField> attemptFields =
            Schema.SObjectType.Challenge_Attempt__c.fields.getMap();

        String scoreField = firstExistingField(
            attemptFields,
            new List<String>{ 'score__c', 'Score__c' }
        );

        String timeTakenField = firstExistingField(
            attemptFields,
            new List<String>{ 'Time_Taken_Minutes__c', 'TimeTakenMinutes__c' }
        );

        List<String> selectFields = new List<String>{
            'Id',
            'CreatedDate',
            'Result__c',
            'Attempted_Challenge__c',
            'Attempted_Challenge__r.DifficultyLevel__c',
            'Attempted_Challenge__r.Type__c',
            'Attempted_Challenge__r.Path__c'
        };

        if (scoreField != null) {
            selectFields.add(scoreField);
        }

        if (timeTakenField != null) {
            selectFields.add(timeTakenField);
        }

        String queryString =
            'SELECT ' + String.join(selectFields, ', ') +
            ' FROM Challenge_Attempt__c' +
            ' WHERE Attempted_Challenge__r.Apex_Arena_User__c = :arenaUserId' +
            ' ORDER BY CreatedDate ASC';

        List<SObject> attempts = Database.query(queryString);

        stats.totalSubmissions = attempts.size();

        Set<Id> solvedChallengeIds = new Set<Id>();

        Integer currentWinStreak = 0;

        for (SObject attempt : attempts) {
            String result = getStringValue(attempt, 'Result__c');
            Boolean isPass = isPassed(result);

            if (isPass) {
                stats.passedAttempts++;
                currentWinStreak++;

                if (currentWinStreak > stats.maxWinStreak) {
                    stats.maxWinStreak = currentWinStreak;
                }

                Decimal score = getDecimalValue(attempt, scoreField);

                if (score != null && score == 100) {
                    stats.perfectScores++;
                }

                Decimal timeTakenMinutes =
                    getDecimalValue(attempt, timeTakenField);

                if (
                    timeTakenMinutes != null &&
                    timeTakenMinutes <= 10
                ) {
                    stats.fastSolvesUnder10++;
                }

                Id challengeId = (Id) attempt.get('Attempted_Challenge__c');

                if (
                    challengeId != null &&
                    !solvedChallengeIds.contains(challengeId)
                ) {
                    solvedChallengeIds.add(challengeId);

                    stats.solvedTotal++;

                    SObject challenge =
                        attempt.getSObject('Attempted_Challenge__r');

                    String difficulty = challenge == null
                        ? null
                        : getStringValue(challenge, 'DifficultyLevel__c');

                    String type = challenge == null
                        ? null
                        : getStringValue(challenge, 'Type__c');

                    String path = challenge == null
                        ? null
                        : getStringValue(challenge, 'Path__c');

                    if (equalsIgnoreCase(difficulty, 'Beginner') || equalsIgnoreCase(difficulty, 'Apprentice')) {
                        stats.solvedEasy++;
                    } else if (equalsIgnoreCase(difficulty, 'Skilled Developer')) {
                        stats.solvedMedium++;
                    } else if (equalsIgnoreCase(difficulty, 'Expert Architect') || equalsIgnoreCase(difficulty, 'Legendary Salesforce Hero')) {
                        stats.solvedHard++;
                    }

                    if (equalsIgnoreCase(path, 'Coding')) {
                        stats.solvedCoding++;
                    } else if (equalsIgnoreCase(path, 'Debugging')) {
                        stats.solvedDebugging++;
                    }

                    if (equalsIgnoreCase(type, 'Sync Apex')) {
                        stats.solvedSync++;
                    } else if (equalsIgnoreCase(type, 'Async Apex')) {
                        stats.solvedAsync++;
                    } else if (equalsIgnoreCase(type, 'Trigger')) {
                        stats.solvedTrigger++;
                    } else if (equalsIgnoreCase(type, 'Test Class')) {
                        stats.solvedTestClass++;
                    }
                }
            } else {
                currentWinStreak = 0;
            }
        }

        if (stats.totalSubmissions > 0) {
            stats.successRate =
                ((Decimal) stats.passedAttempts / stats.totalSubmissions) * 100;
        }

        populateComebackStats(
            stats,
            attempts,
            latestAttemptId
        );

        return stats;
    }

    private static void populateComebackStats(
        UserStats stats,
        List<SObject> attempts,
        Id latestAttemptId
    ) {
        if (latestAttemptId == null || attempts == null || attempts.isEmpty()) {
            return;
        }

        SObject latestAttempt;

        for (SObject attempt : attempts) {
            Id attemptId = (Id) attempt.get('Id');

            if (attemptId == latestAttemptId) {
                latestAttempt = attempt;
                break;
            }
        }

        if (latestAttempt == null) {
            return;
        }

        if (!isPassed(getStringValue(latestAttempt, 'Result__c'))) {
            return;
        }

        Id latestChallengeId =
            (Id) latestAttempt.get('Attempted_Challenge__c');

        if (latestChallengeId == null) {
            return;
        }

        Integer previousFailsForSameChallenge = 0;

        for (SObject attempt : attempts) {
            Id attemptId = (Id) attempt.get('Id');

            if (attemptId == latestAttemptId) {
                break;
            }

            Id challengeId = (Id) attempt.get('Attempted_Challenge__c');

            if (
                challengeId == latestChallengeId &&
                !isPassed(getStringValue(attempt, 'Result__c'))
            ) {
                previousFailsForSameChallenge++;
            }
        }

        stats.passAfterFail = previousFailsForSameChallenge > 0;
        stats.passAfterThreeFails = previousFailsForSameChallenge >= 3;
    }

    private static Map<String, Decimal> buildMetricMap(UserStats stats) {
        Map<String, Decimal> metrics = new Map<String, Decimal>();

        metrics.put('TOTAL_SUBMISSIONS', toDecimal(stats.totalSubmissions));
        metrics.put('PASSED_ATTEMPTS', toDecimal(stats.passedAttempts));

        metrics.put('SOLVED_TOTAL', toDecimal(stats.solvedTotal));
        metrics.put('SOLVED_EASY', toDecimal(stats.solvedEasy));
        metrics.put('SOLVED_MEDIUM', toDecimal(stats.solvedMedium));
        metrics.put('SOLVED_HARD', toDecimal(stats.solvedHard));

        metrics.put('SOLVED_CODING', toDecimal(stats.solvedCoding));
        metrics.put('SOLVED_DEBUGGING', toDecimal(stats.solvedDebugging));

        metrics.put('SOLVED_SYNC', toDecimal(stats.solvedSync));
        metrics.put('SOLVED_ASYNC', toDecimal(stats.solvedAsync));
        metrics.put('SOLVED_TRIGGER', toDecimal(stats.solvedTrigger));
        metrics.put('SOLVED_TEST_CLASS', toDecimal(stats.solvedTestClass));

        metrics.put('PERFECT_SCORES', toDecimal(stats.perfectScores));

        metrics.put('SUCCESS_RATE', stats.successRate);

        metrics.put('MAX_WIN_STREAK', toDecimal(stats.maxWinStreak));

        metrics.put('CURRENT_DAILY_STREAK', toDecimal(stats.currentDailyStreak));
        metrics.put('BEST_DAILY_STREAK', toDecimal(stats.bestDailyStreak));

        metrics.put('FAST_SOLVES_UNDER_10', toDecimal(stats.fastSolvesUnder10));

        metrics.put('TOTAL_XP', stats.totalXp);

        metrics.put('PASS_AFTER_FAIL', stats.passAfterFail ? 1 : 0);
        metrics.put('PASS_AFTER_3_FAILS', stats.passAfterThreeFails ? 1 : 0);

        return metrics;
    }

    private static Boolean isPassed(String result) {
        if (String.isBlank(result)) {
            return false;
        }

        return result.trim().toLowerCase().contains('pass');
    }

    private static Boolean equalsIgnoreCase(String value1, String value2) {
        if (value1 == null || value2 == null) {
            return false;
        }

        return value1.trim().toLowerCase() == value2.trim().toLowerCase();
    }

    private static String getStringValue(SObject record, String fieldName) {
        if (record == null || String.isBlank(fieldName)) {
            return null;
        }

        Object value = record.get(fieldName);

        return value == null ? null : String.valueOf(value);
    }

    private static Decimal getDecimalValue(SObject record, String fieldName) {
        if (record == null || String.isBlank(fieldName)) {
            return null;
        }

        Object value = record.get(fieldName);

        if (value == null) {
            return null;
        }

        try {
            return Decimal.valueOf(String.valueOf(value));
        } catch (Exception ex) {
            return null;
        }
    }

    private static String firstExistingField(
        Map<String, Schema.SObjectField> fields,
        List<String> candidateFieldNames
    ) {
        if (fields == null || candidateFieldNames == null) {
            return null;
        }

        for (String candidate : candidateFieldNames) {
            if (String.isBlank(candidate)) {
                continue;
            }

            for (String existingFieldName : fields.keySet()) {
                if (
                    existingFieldName != null &&
                    existingFieldName.toLowerCase() == candidate.toLowerCase()
                ) {
                    return existingFieldName;
                }
            }
        }

        return null;
    }

    private static Decimal toDecimal(Integer value) {
        if (value == null) {
            return 0;
        }

        return Decimal.valueOf(String.valueOf(value));
    }
}