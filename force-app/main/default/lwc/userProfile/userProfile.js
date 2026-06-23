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
    loginName = '';
    limitSize = '3';
    isPublic=false;
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
    acceptanceRate = 0;
    recent4problems = [];
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
    showText='Show More';

    profilePic='';

    editProfile=false;

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

    get achievementsData()
    {
        return this.showText==='Show Less' ?
                this.userAchievements
             : this.recent4userAchievement;
    }

    get labelText()
    {
        return this.showText;
    }


    connectedCallback() {
        this.loginName = window.sessionStorage.getItem('loginName');
        this.isLoggedIn = window.sessionStorage.getItem('isLoggedIn');
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

            this.loadAttemptedChallenges();

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

    loadUserandChallengeDetails()
    {

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

    get inputReadonly()
    {
        return !this.editProfile;
    }

    get aboutClass()
    {
        return this.editProfile
                ? 'user-about editable'
                : 'user-about';
    }
    get aboutLength()
    {
        return this.aboutMe.length;
    }
    get aboutLengthClass()
    {
        return this.aboutMe.length>=201
            ? 'red'
            : 'white'
    }

    get editButtonText()
    {
        return this.editProfile? '💾 Save Changes' : '✏️ Edit Profile'
    }

    handleAboutChange(event)
    {
        const changedValue=event.target.value;
        this.aboutMe=changedValue;
    }

    handlePublicChange(event)
    {
        const changedValue=event.target.checked;
        this.isPublic=changedValue;
    }


    async editProfileFun()
    {
        this.editProfile=!this.editProfile;
        if(!this.editProfile)
        {
            console.log('Saving Data');
            const result=await saveChanges({username:this.loginName,aboutMe:this.aboutMe,imageUrl:this.profilePic,isPublic:this.isPublic});

            if(result=='Changes Saved');
            {

                this.loadUserandChallengeDetails();
            }
            
        }

    }

    changeProfilePic()
    {
        this.template.querySelector('c-change-profilepic-modal').openModal();
    }

    imageReceivedFunc(event)
    {
        this.profilePic=event.detail.imageLink;
    }

    viewAllAchievements()
    {
        if(this.showText=='Show More')
        {
            this.showText='Show Less';
            
        }
        else if(this.showText=='Show Less')
        {
            this.showText= 'Show More';
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
        return `width: ${this.xpProgressPercent}%;`;
    }

    bifData(result) {
        try {
            this.testAttempts=0;
            this.submitAttempts=0;
            this.submissions = result.length;
            this.expPoints = parseInt(result[0].Attempted_Challenge__r.Apex_Arena_User__r.Total_Exp_Points__c, 10);
            this.isPublic=result[0].Attempted_Challenge__r.Apex_Arena_User__r.isPublicProfile__c;

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
            
            this.currentStreak = result[0].Attempted_Challenge__r.Apex_Arena_User__r.Current_Streak__c;
            this.bestStreak = result[0].Attempted_Challenge__r.Apex_Arena_User__r.Best_Streak__c;
            this.aboutMe = result[0].Attempted_Challenge__r.Apex_Arena_User__r.AboutMe__c? result[0].Attempted_Challenge__r.Apex_Arena_User__r.AboutMe__c:this.aboutMe
            this.profilePic = result[0].Attempted_Challenge__r.Apex_Arena_User__r.profilePic__c;
            for (let res of result) {
                if (res.Attempted_Challenge__r.Result__c.toLowerCase() == 'pass') {
                    setChallenges.add(res.Attempted_Challenge__c)
                    if (res.Attempted_Challenge__r.DifficultyLevel__c == 'Beginner' || res.Attempted_Challenge__r.DifficultyLevel__c == 'Apprentice') {

                        setEasy.add(res.Attempted_Challenge__c);
                    }
                    else if (res.Attempted_Challenge__r.DifficultyLevel__c == 'Skilled Developer') {

                        setMedium.add(res.Attempted_Challenge__c);
                    }
                    else if (res.Attempted_Challenge__r.DifficultyLevel__c == 'Expert Architect' || res.Attempted_Challenge__r.DifficultyLevel__c == 'Legendary Salesforce Hero') {

                        setHard.add(res.Attempted_Challenge__c);
                    }
                }
                
                this.solved = setChallenges.size;
                this.easy = setEasy.size;
                this.medium = setMedium.size;
                this.hard = setHard.size;
                
                if (res.Action_Type__c?.toLowerCase() == 'test') {
                    this.testAttempts++;
                }
                else if (res.Action_Type__c?.toLowerCase() == 'submit') {
                    this.submitAttempts++;
                }


            }
            this.wrong = this.submissions - this.solved;
            this.acceptanceRate = this.submissions > 0 ? ((this.solved / this.submissions * 100).toFixed(2)) : 0.00;
            this.joinDate = new Date(result[0].Attempted_Challenge__r.Apex_Arena_User__r.CreatedDate)
                .toLocaleDateString('en-US', {
                    month: 'long',
                    day: '2-digit',
                    year: 'numeric'
                });
            this.userLevel = result[0].Attempted_Challenge__r.Apex_Arena_User__r.Level__c;

        }
        catch (error) {
            console.log('Error in BifData' , error);
            console.log('Raw error:', JSON.parse(JSON.stringify(error)));
        }
    }

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

                this.recent4problems = data.map(record => {

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
        const recordId = event.target.dataset.id;
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



    logoutFunc() {
        window.sessionStorage.removeItem('loginName');
        window.sessionStorage.removeItem('isLoggedIn');
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/'
            }
        });
    }

    searchusers=[];
    userCount=0;
    searchchallenges=[];
    challengeCount=0;
    responseReturned=false;
    searchMenuItem='user';

    get searchResultContClass()
    {
        return this.responseReturned
            ? 'searchResultCont'
            : 'searchResultCont Hidden'
    }

    get searchBackdrop()
    {
        return this.responseReturned
            ? 'searchBackdrop'
            : 'searchBackdrop Hidden'
    }


    async onSearchChange(event)
    {
        const searchItem=event.target.value;
        const response= await globalSearch(
            {
                searchKey:searchItem,
                username:this.loginName
            }
        );
        this.responseReturned=true;
        this.searchusers=response.users;
        this.searchchallenges=response.challenges;
        this.userCount=this.searchusers.length;
        this.challengeCount=this.searchchallenges.length;

        
    }

    closeSearch()
    {
        this.responseReturned=false;
        const searchbar = this.template.querySelector('[data-id="searchbar"]');

        if (searchbar) {
            searchbar.value = '';
        }
    }

    get menuItemUserClass()
    {
        return this.searchMenuItem=='user'
            ? 'searchMenuItems searchSelected'
            : 'searchMenuItems'
    }

    get isUserItemSelected()
    {
        return this.searchMenuItem=='user'
            ? true
            : false
    }

    get menuItemChallengeClass()
    {
        return this.searchMenuItem=='challenge'
            ? 'searchMenuItems searchSelected'
            : 'searchMenuItems'
    }

    handleMenuItemClick(event)
    {
        this.searchMenuItem=event.currentTarget.dataset.id;

    }

    handleUserResultSelected(event){
        const recordId=event.currentTarget.dataset.id;
        
    }

    handleChallengeResultSelected(event){
        const recordId=event.currentTarget.dataset.id;
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