import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getAttemptedChallenges from '@salesforce/apex/recordController.getAttemptedChallenges';
import getUserandChalengeDetails from '@salesforce/apex/recordController.getUserandChalengeDetails';
import getSolvedChallenges from '@salesforce/apex/recordController.getSolvedChallenges';



export default class UserProfile extends NavigationMixin(LightningElement) {
    loginName = '';
    limitSize = '4';
    isLoggedIn = false;
    userLevel = 'Beginner';
    userAbout = 'Code. Compete. Conquer. Forge your legacy in the Apex Arena.';
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
    testAttempts=0;
    submitAttempts=0;

    heatmapData = [];

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


    connectedCallback() {
        this.loginName = window.sessionStorage.getItem('loginName');
        console.log(this.loginName);
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
            getUserandChalengeDetails({
                username: this.loginName
            })

                .then(result => {

                    console.log(result);
                    this.bifData(result);
                })

                .catch(error => {

                    console.log(error);
                });

            this.loadAttemptedChallenges();


        }

    }

    

    bifData(result) {
        try {
            this.submissions = result.length;
            let setChallenges=new Set();
            let setEasy=new Set();
            let setMedium=new Set();
            let setHard=new Set();
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
                this.solved=setChallenges.size;
                this.easy=setEasy.size;
                this.medium=setMedium.size;
                this.hard=setHard.size;
                if(res.Action_Type__c.toLowerCase()=='test')
                {
                    this.testAttempts++;
                }
                else if(res.Action_Type__c.toLowerCase()=='submit')
                {
                    this.submitAttempts++;
                }


            }
            this.wrong = this.submissions - this.solved;
            this.acceptanceRate = this.submissions>0?((this.solved / this.submissions * 100).toFixed(2)):0.00;
            this.expPoints = result[0].Attempted_Challenge__r.Apex_Arena_User__r.Total_Exp_Points__c;
            this.joinDate = new Date(result[0].Attempted_Challenge__r.Apex_Arena_User__r.CreatedDate)
                .toLocaleDateString('en-US', {
                    month: 'long',
                    day: '2-digit',
                    year: 'numeric'
                });
            this.userLevel = result[0].Attempted_Challenge__r.Apex_Arena_User__r.Level__c;

        }
        catch (error) {
            console.log(error);
        }
    }

     async loadAttemptedChallenges() {
        try {
            const data = await getAttemptedChallenges({
                username: this.loginName,
                recordLimit: this.limitSize
            });

            if (data) {
                console.log(data);

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

                console.log(this.recent4problems);
            }

        } catch (error) {
            console.error('Error loading attempted challenges:', error);
        }
    }

    

    async viewAllProblems() {
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
                    item.DifficultyLevel__c.toLowerCase()=='beginner'
                        ? 'Beginner'
                        : item.DifficultyLevel__c.toLowerCase()=='apprentice'
                            ? 'Apprentice'
                            : item.DifficultyLevel__c.toLowerCase()=='expert architect'
                                ? 'Expert'
                                : item.DifficultyLevel__c.toLowerCase()=='skilled developer'
                                    ? 'Skilled'
                                    : item.DifficultyLevel__c.toLowerCase()=='legendary salesforce hero'
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
        console.log(recordId);
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

}