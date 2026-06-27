import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getAttemptedChallenges from '@salesforce/apex/recordController.getAttemptedChallenges';
import getUserandChalengeDetails from '@salesforce/apex/recordController.getUserandChalengeDetails';
import getSolvedChallenges from '@salesforce/apex/recordController.getSolvedChallenges';
import getUserAchievements from '@salesforce/apex/recordController.getUserAchievements';
import ACHIEVEMENT_ICONS from '@salesforce/resourceUrl/ApexArenaAchievementIcons';

import saveChanges from '@salesforce/apex/recordController.saveChanges';
import globalSearch from '@salesforce/apex/recordController.globalSearch';


export default class UserProfile extends NavigationMixin(LightningElement) {
    loginName = 'Test User';
    limitSize = '3';
    isPublic = false;
    isLoggedIn = false;
    userLevel = 'Beginner';
    aboutMe = 'Code. Compete. Conquer. Forge your legacy in the Apex Arena.';
    joinDate = 'May 25, 2026';
    expPoints = '0';
    submissions = 0;
    solved = 0;
    easy = 0;
    medium = 0;
    hard = 0;
    wrong = 0;
    attemptedChallenges = 0;
    acceptanceRate = 0;
    recent3problems = [];
    challengeData = [];
    pageSize = 9;
    currentPage = 1;

    totalPages = 0;
    totalRecords = 0;
    searchKey = '';
    showProfile = true;
    selectedCategory = 'All Categories';
    selectedDifficulty = 'All Difficulties';
    selectedPath = 'All Paths';
    selectedResultFilter = 'All Results';
    testAttempts = 0;
    submitAttempts = 0;

    heatmapData = [];
    currentStreak = 0;
    bestStreak = 0;

    userAchievements = [];
    recent4userAchievement = [];

    showAch = true;
    showMore = false;

    showActivity = true;

    nextLevel = 'Beginner';
    xpToNextLevel = 0;

    item = 'profile';
    showText = 'Show More';

    profilePic = '';

    editProfile = false;

    quotes = [
        { quote: 'Do what you can, with what you have, where you are.', day: 'Monday', author: 'Theodore Roosevelt' },
        { quote: 'The future depends on what you do today.', day: 'Monday', author: 'Mahatma Gandhi' },
        { quote: 'Well begun is half done.', day: 'Monday', author: 'Aristotle' },

        { quote: 'It always seems impossible until it is done.', day: 'Tuesday', author: 'Nelson Mandela' },
        { quote: 'Dream big and dare to fail.', day: 'Tuesday', author: 'Norman Vaughan' },
        { quote: 'Act as if what you do makes a difference. It does.', day: 'Tuesday', author: 'William James' },

        { quote: 'Believe you can and you are halfway there.', day: 'Wednesday', author: 'Theodore Roosevelt' },
        { quote: 'Turn your wounds into wisdom.', day: 'Wednesday', author: 'Oprah Winfrey' },
        { quote: 'No pressure, no diamonds.', day: 'Wednesday', author: 'Thomas Carlyle' },

        { quote: 'The journey of a thousand miles begins with one step.', day: 'Thursday', author: 'Lao Tzu' },
        { quote: 'Quality is not an act, it is a habit.', day: 'Thursday', author: 'Aristotle' },
        { quote: 'What we think, we become.', day: 'Thursday', author: 'Buddha' },

        { quote: 'Stay hungry, stay foolish.', day: 'Friday', author: 'Steve Jobs' },
        { quote: 'Everything you can imagine is real.', day: 'Friday', author: 'Pablo Picasso' },
        { quote: 'If you are going through hell, keep going.', day: 'Friday', author: 'Winston Churchill' },

        { quote: 'Do not wait. The time will never be just right.', day: 'Saturday', author: 'Napoleon Hill' },
        { quote: 'Make each day your masterpiece.', day: 'Saturday', author: 'John Wooden' },
        { quote: 'Energy and persistence conquer all things.', day: 'Saturday', author: 'Benjamin Franklin' },

        { quote: 'Do one thing every day that scares you.', day: 'Sunday', author: 'Eleanor Roosevelt' },
        { quote: 'You miss 100% of the shots you do not take.', day: 'Sunday', author: 'Wayne Gretzky' },
        { quote: 'Do better when you know better.', day: 'Sunday', author: 'Maya Angelou' }
    ];
    randomQuote;

    levels = [
        { "label": 'Beginner', "limit": 0 },
        { "label": 'Apprentice', "limit": 1000 },
        { "label": 'Skilled Developer', "limit": 3000 },
        { "label": 'Expert Architect', "limit": 5500 },
        { "label": 'Legendary Salesforce Developer', "limit": 8500 }
    ]

    get ProgressBarWidth() {
        return `width:`
    }


    get capitalizedName() {
        let displayName = '';
        if (this.loginName.includes(' ')) {
            let names = this.loginName.split(' ');

            for (let name of names) {

                displayName += ' ' + name.charAt(0).toUpperCase() + name.substring(1);
            }
            return displayName.trimStart();
        }
        else {
            displayName = this.loginName.charAt(0).toUpperCase() + this.loginName.substring(1);

        }
        return displayName;
    }

    resultOptions = [
        {
            label: "All Results",
            value: "All Results"
        },
        {
            label: "Pass",
            value: "pass"
        },
        {
            label: "Fail",
            value: "fail"
        },
        {
            label: "Pending",
            value: "Pending"
        }
    ]
    categoryOptions = [
        {
            label: "All Categories",
            value: "All Categories"
        },
        {
            label: "Synchronous Apex",
            value: "Sync Apex"
        },
        {
            label: "Asynchronous Apex",
            value: "Async Apex"
        },
        {
            label: "Trigger",
            value: "Trigger"
        },
        {
            label: "Test Class",
            value: "Test Class"
        }

    ];
    difficultyOptions = [

        {
            label: "All Difficulties",
            value: "All Difficulties"
        },
        {
            label: "Beginner",
            value: "Beginner"
        },
        {
            label: "Apprentice",
            value: "Apprentice"
        },
        {
            label: "Skilled Developer",
            value: "Skilled Developer"
        },
        {
            label: "Expert Architect",
            value: "Expert Architect"
        },
        {
            label: "Legendary Salesforce Hero",
            value: "Legendary Salesforce Hero"
        }


    ];
    pathOptions = [{
        label: "All Paths",
        value: "All Paths"
    },
    {
        label: "Debugging",
        value: "Debugging"
    },
    {
        label: "Coding",
        value: "Coding"
    }
    ]

    get showViewAllproblems() {
        return this.recent3problems.length >= 4;
    }
    get showViewAllAch() {
        return this.userAchievements > 4;
    }
    get showAchievementsError() {
        return this.userAchievements.length == 0;
    }
    get achievementsData() {
        return this.showText === 'Show Less' ?
            this.userAchievements
            : this.recent4userAchievement;
    }

    get labelText() {
        return this.showText;
    }

    get progressTitle() {
        let xpRequired = this.nextLevelXp - this.expPoints;
        return xpRequired + ' required to move to the next level';
    }


    connectedCallback() {
        this.loginName = window.sessionStorage.getItem('loginName');
        this.isLoggedIn = window.sessionStorage.getItem('isLoggedIn');
        this.randomQuote = this.getTodaysQuote();
        if (this.loginName == null || this.isLoggedIn == null || this.isLoggedIn == false) {
            this[NavigationMixin.Navigate]({
                type: 'standard__webPage',
                attributes: {
                    url: '/'
                }
            });
        }
        else {

            this.loadUserandChallengeDetails();

            //this.loadAttemptedChallenges();

            getUserAchievements(
                {
                    username: this.loginName
                }
            )

                .then(result => {
                    this.userAchievements = result;
                    this.userAchievements.forEach(item => {
                        item.Achievement__r.Icon__c = item.Achievement__r.Icon__c.replace('/resource/ApexArenaAchievementIcons', ACHIEVEMENT_ICONS);
                        item.Unlock_Date__c = new Date(item.Unlock_Date__c).toLocaleDateString('en-US',
                            {
                                month: 'long',
                                day: '2-digit',
                                year: 'numeric'
                            });
                    })
                    if (this.userAchievements.length > 4) {
                        this.recent4userAchievement = this.userAchievements.slice(0, 4);
                        this.showMore = true;

                    }
                    else {
                        this.recent4userAchievement = this.userAchievements;
                        if (this.recent4userAchievement.length == 0) {
                            this.showAch = false;
                        }
                    }
                }
                )
                .catch(error => {
                    console.log('Error Fetching userAchievements' + error);
                })



        }

    }

    getTodaysQuote() {
        const today = new Date().toLocaleDateString('en-US', {
            weekday: 'long'
        });

        const todaysQuotes = this.quotes.filter(quote => quote.day === today);

        if (todaysQuotes.length === 0) {
            return null;
        }

        const randomIndex = Math.floor(Math.random() * todaysQuotes.length);

        return todaysQuotes[randomIndex];
    }

    loadUserandChallengeDetails() {

        getUserandChalengeDetails({
            username: this.loginName
        })

            .then(result => {
                this.bifData(result);
            })

            .catch(error => {

                console.log(error);
            });
    }

    bifData(result) {
        try {
            this.testAttempts = 0;
            this.submitAttempts = 0;

            if (!result || result.length === 0) {
                this.submissions = 0;
                this.solved = 0;
                this.easy = 0;
                this.medium = 0;
                this.hard = 0;
                this.wrong = 0;
                this.acceptanceRate = 0.00;
                return;
            }

            const userDetails = result[0]?.Attempted_Challenge__r?.Apex_Arena_User__r;

            if (!userDetails) {
                this.submissions = 0;
                this.solved = 0;
                this.easy = 0;
                this.medium = 0;
                this.hard = 0;
                this.wrong = 0;
                this.acceptanceRate = 0.00;
                return;
            }

            const actualAttempts = result.filter(item => item.Id);
            const uniqueAttemptedChallenges = new Set();
            result.forEach(item => {
                if (item.Attempted_Challenge__c) {
                    uniqueAttemptedChallenges.add(item.Attempted_Challenge__c);
                }
            });

            this.attemptedChallenges = uniqueAttemptedChallenges.size;

            this.submissions = actualAttempts.length;

            this.getRecentProblems(result);

            this.expPoints = parseInt(userDetails.Total_Exp_Points__c || 0, 10);
            this.levels = this.levels.map(level => {

                const percent = Math.min(
                    Math.floor(((this.expPoints == 0 ? 1 : this.expPoints) / (level.limit == 0 ? 1 : level.limit)) * 100),
                    100
                );
                return {
                    ...level,
                    unlocked: (this.expPoints >= level.limit || level.label == 'Beginner'),
                    limitDisplay: level.limit == 12000 ? '' : level.limit + ' XP',
                    widthStyle: `width:${percent}%;`
                };
            });
            this.isPublic = userDetails.isPublicProfile__c;

            this.nextLevel =
                this.expPoints < 1000 ? 'Apprentice' :
                    this.expPoints < 3000 ? 'Skilled Developer' :
                        this.expPoints < 5500 ? 'Expert Architect' :
                            this.expPoints < 8500 ? 'Legendary Salesforce Hero' :
                                'Max Level';

            this.xpToNextLevel =
                this.expPoints < 1000 ? 1001 - this.expPoints :
                    this.expPoints < 3000 ? 3001 - this.expPoints :
                        this.expPoints < 5500 ? 5501 - this.expPoints :
                            this.expPoints < 8500 ? 8501 - this.expPoints :
                                0;

            this.nextLevelXp =
                this.expPoints < 1000 ? 1001 :
                    this.expPoints < 3000 ? 3001 :
                        this.expPoints < 5500 ? 5501 :
                            this.expPoints < 8500 ? 8501 :
                                this.expPoints;

            this.currentLevelStartXp =
                this.expPoints < 1000 ? 0 :
                    this.expPoints < 3000 ? 1001 :
                        this.expPoints < 5500 ? 3001 :
                            this.expPoints < 8500 ? 5501 :
                                8501;

            const levelRange = this.nextLevelXp - this.currentLevelStartXp;
            const xpGainedInCurrentLevel = this.expPoints - this.currentLevelStartXp;

            this.xpProgressPercent =
                this.nextLevel === 'Max Level'
                    ? 100
                    : Math.floor((xpGainedInCurrentLevel / levelRange) * 100);

            let setChallenges = new Set();
            let setEasy = new Set();
            let setMedium = new Set();
            let setHard = new Set();

            this.currentStreak = userDetails.Current_Streak__c || 0;
            this.bestStreak = userDetails.Best_Streak__c || 0;
            this.aboutMe = userDetails.AboutMe__c ? userDetails.AboutMe__c : this.aboutMe;
            this.profilePic = userDetails.profilePic__c;
            this.userLevel = userDetails.Level__c;

            this.joinDate = userDetails.CreatedDate
                ? new Date(userDetails.CreatedDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: '2-digit',
                    year: 'numeric'
                })
                : '';

            for (let res of actualAttempts) {
                const attemptedChallenge = res.Attempted_Challenge__r;

                if (attemptedChallenge?.Result__c?.toLowerCase() === 'pass') {
                    setChallenges.add(res.Attempted_Challenge__c);

                    if (
                        attemptedChallenge.DifficultyLevel__c === 'Beginner' ||
                        attemptedChallenge.DifficultyLevel__c === 'Apprentice'
                    ) {
                        setEasy.add(res.Attempted_Challenge__c);
                    }
                    else if (attemptedChallenge.DifficultyLevel__c === 'Skilled Developer') {
                        setMedium.add(res.Attempted_Challenge__c);
                    }
                    else if (
                        attemptedChallenge.DifficultyLevel__c === 'Expert Architect' ||
                        attemptedChallenge.DifficultyLevel__c === 'Legendary Salesforce Hero'
                    ) {
                        setHard.add(res.Attempted_Challenge__c);
                    }
                }

                if (res.Action_Type__c?.toLowerCase() === 'test') {
                    this.testAttempts++;
                }
                else if (res.Action_Type__c?.toLowerCase() === 'submit') {
                    this.submitAttempts++;
                }
            }

            this.solved = setChallenges.size;
            this.easy = setEasy.size;
            this.medium = setMedium.size;
            this.hard = setHard.size;

            this.wrong = this.submissions - this.solved;

            this.acceptanceRate =
                this.submissions > 0
                    ? ((this.solved / this.submissions) * 100).toFixed(2)
                    : 0.00;

        } catch (error) {
            console.log('Error in bifData', error);
            console.log('Raw error:', JSON.parse(JSON.stringify(error)));
        }
    }

    getRecentProblems(result) {

        const seenChallenges = new Set();
        this.recent3problems = result
            .filter(item => {
                if (!item.Attempted_Challenge__c) {
                    return false;
                }

                if (seenChallenges.has(item.Attempted_Challenge__c)) {
                    return false;
                }

                seenChallenges.add(item.Attempted_Challenge__c);
                return true;
            })
            .slice(0, 3)
            .map(item => {
                return {
                    id: item.Attempted_Challenge__c,
                    attemptId: item.Id,
                    name: item.Attempted_Challenge__r?.Name.length > 48 ? item.Attempted_Challenge__r?.Name.substring(0, 47) + ". . ." : item.Attempted_Challenge__r?.Name,
                    scenario: item.Attempted_Challenge__r?.Scenario__c,
                    path: item.Attempted_Challenge__r?.Path__c,
                    pathStyle: `color:${item.Attempted_Challenge__r?.Path__c.toLowerCase().includes('coding') ? '#00E5FF' : '#FF5C5C'};`,
                    difficulty: item.Attempted_Challenge__r?.DifficultyLevel__c,
                    type: item.Attempted_Challenge__r?.Type__c,
                    result: item.Attempted_Challenge__r?.Result__c,
                    isPass: item.Attempted_Challenge__r?.Result__c.toLowerCase().includes('pass'),
                    isFail: item.Attempted_Challenge__r?.Result__c.toLowerCase().includes('fail'),
                    isPending: item.Attempted_Challenge__r?.Result__c.toLowerCase().includes('pending'),
                    score: item.Score__c,
                    exp: item.Exp_gained__c,
                    LastModifiedDate: item.CreatedDate
                };
            });

        console.log(this.recent3problems);

        this.recent3problems = this.recent3problems.map(record => {

            const modifiedDate = new Date(record.LastModifiedDate);
            const now = new Date();

            const diffMs = now - modifiedDate;
            const diffMinutes = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMinutes / 60);
            const diffDays = Math.floor(diffHours / 24);

            let timeAgo = '';

            if (diffMinutes < 60) {
                timeAgo = diffMinutes + ' min ago';
            } else if (diffHours < 24) {
                timeAgo = diffHours + ' hr ago';
            } else {
                timeAgo = diffDays + ' day ago';
            }

            return {
                ...record,
                timeAgo: timeAgo,
            };
        });
    }

    get inputReadonly() {
        return !this.editProfile;
    }

    get aboutClass() {
        return this.editProfile
            ? 'user-about editable'
            : 'user-about';
    }
    get aboutLength() {
        return this.aboutMe.length;
    }
    get aboutLengthClass() {
        return this.aboutMe.length >= 201
            ? 'red'
            : 'white'
    }

    get editButtonText() {
        return this.editProfile ? '💾 Save Changes' : '✏️ Edit Profile'
    }

    handleAboutChange(event) {
        const changedValue = event.target.value;
        this.aboutMe = changedValue;
    }

    handlePublicChange(event) {
        const changedValue = event.target.checked;
        this.isPublic = changedValue;
    }


    async editProfileFun() {
        this.editProfile = !this.editProfile;
        if ((!this.editProfile) && this.aboutMe.length <= 200) {
            console.log('Saving Data');
            const result = await saveChanges({ username: this.loginName, aboutMe: this.aboutMe, imageUrl: this.profilePic, isPublic: this.isPublic });

            if (result == 'Changes Saved');
            {

                this.loadUserandChallengeDetails();
            }

        }
        if (this.aboutMe.length > 200) {
            alert('About Me value cannot be longer than 200 characters. Changes not Saved');
        }

    }

    editProfileClose() {
        this.editProfile = false;
    }

    changeProfilePic() {
        this.template.querySelector('c-change-profilepic-modal').openModal();
    }

    imageReceivedFunc(event) {
        this.profilePic = event.detail.imageLink;
    }

    viewAllAchievements() {
        if (this.showText == 'Show More') {
            this.showText = 'Show Less';

        }
        else if (this.showText == 'Show Less') {
            this.showText = 'Show More';
        }


    }

    get profileClass() {
        return this.item === 'profile'
            ? 'sidebarItems sideSelected'
            : 'sidebarItems';
    }
    get leaderboardClass() {
        return this.item === 'leaderboard'
            ? 'sidebarItems sideSelected'
            : 'sidebarItems';
    }

    get activityClass() {
        return this.item === 'activity'
            ? 'sidebarItems sideSelected'
            : 'sidebarItems';
    }

    get achievementsClass() {
        return this.item === 'achievements'
            ? 'sidebarItems sideSelected'
            : 'sidebarItems';
    }

    handleSidebarItemClick(event) {
        this.item = event.target.dataset.id;

        switch (this.item) {
            case 'profile':
                this.backToProfile();
                break;

            case 'code':
                this.isNavigating = true;
                window.sessionStorage.setItem('isLoggedIn', true);
                window.sessionStorage.setItem('loginName', this.loginName);
                this[NavigationMixin.Navigate]({
                    type: 'standard__webPage',
                    attributes: {
                        url: '/buildinarena'
                    }
                });
                break;

            case 'debug':
                this.isNavigating = true;
                window.sessionStorage.setItem('isLoggedIn', true);
                window.sessionStorage.setItem('loginName', this.loginName);
                this[NavigationMixin.Navigate]({
                    type: 'standard__webPage',
                    attributes: {
                        url: '/debuggingArena'
                    }
                });
                break;

            case 'leaderboard':
                console.log('Open Leaderboard Page');
                break;

            case 'achievements':
                console.log('Open Achievement Page');
                break;

            case 'activity':
                this.viewAllProblems();
                break;

            case 'quiz':
                this.isNavigating = true;
                window.sessionStorage.setItem('isLoggedIn', true);
                window.sessionStorage.setItem('loginName', this.loginName);
                this[NavigationMixin.Navigate]({
                    type: 'standard__webPage',
                    attributes: {
                        url: '/quizarena'
                    }
                });
                break;

            default:
                console.log('Invalid option');
        }
    }

    get xpProgressStyle() {
        return `--progress:${this.xpProgressPercent * 3.6}deg`;
    }



    /*
    async loadAttemptedChallenges() {
        try {
            const data = await getAttemptedChallenges({
                username: this.loginName,
                recordLimit: this.limitSize
            });

            if (data.length == 0) {
                this.showActivity = false;
            }

            if (data) {

                this.recent3problems = data.map(record => {

                    const modifiedDate = new Date(record.LastModifiedDate);
                    const now = new Date();

                    const diffMs = now - modifiedDate;
                    const diffMinutes = Math.floor(diffMs / (1000 * 60));
                    const diffHours = Math.floor(diffMinutes / 60);
                    const diffDays = Math.floor(diffHours / 24);

                    let timeAgo = '';

                    if (diffMinutes < 60) {
                        timeAgo = diffMinutes + ' min ago';
                    } else if (diffHours < 24) {
                        timeAgo = diffHours + ' hr ago';
                    } else {
                        timeAgo = diffDays + ' day ago';
                    }

                    return {
                        ...record,
                        timeAgo: timeAgo,
                        Result__c: record.Result__c
                            ? record.Result__c.charAt(0).toUpperCase() + record.Result__c.substring(1)
                            : ''
                    };
                });

            }

        } catch (error) {
            console.error('Error loading attempted challenges:', error);
        }
    }

    */

    async viewAllProblems() {
        this.item = 'activity';
        this.showProfile = false;
        console.log('In View All Problems');
        try {
            const result = await getSolvedChallenges({
                pageNumber: this.currentPage,
                pageSize: this.pageSize,
                searchKey: this.searchKey,
                categoryFilter: this.selectedCategory,
                difficultyFilter: this.selectedDifficulty,
                pathFilter: this.selectedPath,
                resultFilter: this.selectedResultFilter,
                username: this.loginName
            });
            console.log(result);
            this.challengeData = result.records;
            this.challengeData = this.challengeData.map(item => ({
                ...item,
                Result__c: item.Result__c?.toUpperCase()
            }));
            this.challengeData = this.challengeData.map(item => ({

                ...item,

                statusIcon:
                    item.Result__c === 'PASS'
                        ? 'utility:success'
                        : item.Result__c === 'FAIL'
                            ? 'utility:error'
                            : 'utility:clock',

                statusClass:
                    item.Result__c === 'PASS'
                        ? 'pass-icon'
                        : item.Result__c === 'FAIL'
                            ? 'fail-icon'
                            : 'pending-icon',

                diffClass:
                    item.DifficultyLevel__c.toLowerCase() == 'beginner'
                        ? 'Beginner'
                        : item.DifficultyLevel__c.toLowerCase() == 'apprentice'
                            ? 'Apprentice'
                            : item.DifficultyLevel__c.toLowerCase() == 'expert architect'
                                ? 'Expert'
                                : item.DifficultyLevel__c.toLowerCase() == 'skilled developer'
                                    ? 'Skilled'
                                    : item.DifficultyLevel__c.toLowerCase() == 'legendary salesforce hero'
                                        ? 'Legend'
                                        : 'default'

            }));
            this.challengeData.forEach(item => {
                item.LastModifiedDate = new Date(item.LastModifiedDate).toLocaleDateString('en-US',
                    {
                        month: 'long',
                        day: '2-digit',
                        year: 'numeric'
                    });
            });

            this.totalPages = result.totalPages;
            this.totalRecords = result.totalRecords;
        }
        catch (error) {
            console.log(error);
        }

    }

    async handleNext() {

        if (this.currentPage < this.totalPages) {

            this.currentPage++;

            this.viewAllProblems();
        }
    }

    async handlePrevious() {

        if (this.currentPage > 1) {

            this.currentPage--;

            this.viewAllProblems();
        }
    }

    async handlePageClick(event) {

        this.currentPage =
            Number(event.target.dataset.page);

        this.viewAllProblems();
    }

    async viewDetails(event) {
        const recordId = event.currentTarget.dataset.id?event.currentTarget.dataset.id:event.target.dataset.id;
        this.isNavigating = true;
        window.sessionStorage.setItem('isLoggedIn', true);
        window.sessionStorage.setItem('loginName', this.loginName);
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'viewDetails__c'
            },
            state: {
                recordId: recordId
            }
        });
    }

    get pageNumbers() {

        let pages = [];

        for (let i = 1; i <= this.totalPages; i++) {

            pages.push({
                number: i,
                className:
                    i === this.currentPage
                        ? 'page-btn active'
                        : 'page-btn'
            });
        }

        return pages;
    }

    get showingText() {

        let start =
            ((this.currentPage - 1) * this.pageSize) + 1;

        let end =
            Math.min(
                this.currentPage * this.pageSize,
                this.totalRecords
            );

        return `Showing ${start} to ${end} of ${this.totalRecords} results`;
    }

    backToProfile() {
        this.showProfile = true;
    }

    choosePath() {
        this.isNavigating = true;
        window.sessionStorage.setItem('isLoggedIn', true);
        window.sessionStorage.setItem('loginName', this.loginName);
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/choosepath'
            }
        });

    }


    handleSearch(event) {

        this.searchKey = event.target.value;

        this.pageNumber = 1;

        this.viewAllProblems();
    }

    handleCategoryChange(event) {

        this.selectedCategory = event.target.value;

        this.pageNumber = 1;

        this.viewAllProblems();
    }

    handleDifficultyChange(event) {

        this.selectedDifficulty = event.target.value;

        this.pageNumber = 1;

        this.viewAllProblems();
    }

    handlePathChange(event) {

        this.selectedPath = event.target.value;

        this.pageNumber = 1;

        this.viewAllProblems();
    }

    handleResultFilterChange(event) {

        this.selectedResultFilter = event.target.value;

        this.pageNumber = 1;

        this.viewAllProblems();
    }

    get showActivities()
    {
        return this.recent3problems.length>0;
    }

    handleLogout() {
        this.isNavigating = true;
        window.sessionStorage.removeItem('loginName');
        window.sessionStorage.removeItem('isLoggedIn');
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/'
            }
        });
    }

    searchusers = [];
    userCount = 0;
    searchchallenges = [];
    challengeCount = 0;
    responseReturned = false;
    searchMenuItem = 'user';
    isNavigating = false;

    get searchResultContClass() {
        return this.responseReturned
            ? 'searchResultCont'
            : 'searchResultCont Hidden'
    }

    get searchBackdrop() {
        return this.responseReturned
            ? 'searchBackdrop'
            : 'searchBackdrop Hidden'
    }


    async onSearchChange(event) {
        const searchItem = event.target.value;
        const response = await globalSearch(
            {
                searchKey: searchItem,
                username: this.loginName
            }
        );
        this.responseReturned = true;
        this.searchusers = response.users;
        this.searchchallenges = response.challenges;
        this.userCount = this.searchusers.length;
        this.challengeCount = this.searchchallenges.length;


    }

    closeSearch() {
        this.responseReturned = false;
        const searchbar = this.template.querySelector('[data-id="searchbar"]');

        if (searchbar) {
            searchbar.value = '';
        }
    }

    get menuItemUserClass() {
        return this.searchMenuItem == 'user'
            ? 'searchMenuItems searchSelected'
            : 'searchMenuItems'
    }

    get isUserItemSelected() {
        return this.searchMenuItem == 'user'
            ? true
            : false
    }

    get menuItemChallengeClass() {
        return this.searchMenuItem == 'challenge'
            ? 'searchMenuItems searchSelected'
            : 'searchMenuItems'
    }

    handleMenuItemClick(event) {
        this.searchMenuItem = event.currentTarget.dataset.id;

    }

    handleUserResultSelected(event) {
        const recordId = event.currentTarget.dataset.id;

    }

    handleChallengeResultSelected(event) {
        const recordId = event.currentTarget.dataset.id;
        window.sessionStorage.setItem('isLoggedIn', true);
        window.sessionStorage.setItem('loginName', this.loginName);
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'viewDetails__c'
            },
            state: {
                recordId: recordId
            }
        });

    }

}