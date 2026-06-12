import { LightningElement, wire } from 'lwc';
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';
import getAttemptDetails from '@salesforce/apex/recordController.getAttemptDetails';

export default class ViewChallengeDetails extends NavigationMixin(LightningElement) {

    recordId = '';
    challengeAttempts = [];
    display = false;
    loginName = '';
    isLoggedIn = false;
    challengeName = '';
    scenario = '';
    totalAttempts = 0;
    successfulAttempts = 0;
    failedAttempts = 0;
    successRate = '0.00';
    difficulty = '';
    type = '';
    path = '';
    selectedMenu = 'Code';
    selectedChallenge = [];
    loading = false;
    showSampleData = true;
    sampleData = null;
    challengeExp = 0;
    resultsWithStyle = [];
    passed=0;
    total=0;

    getDiffClass()
    {
        if(this.difficulty=='Beginner')
        {
            return 'Beginner';
        }
        else if(this.difficulty=='Apprentice')
        {
            return 'Apprentice';
        }
        else if(this.difficulty=='Expert Architect')
        {
            return 'Expert';
        }
        else if(this.difficulty=='Legendary Salesforce Hero')
        {
            return 'Legend';
        }
    }
    get codemenuItem() {
        return this.selectedMenu === 'Code'
            ? 'menu-item selected'
            : 'menu-item';
    }

    get sampleMenuItem() {
        return this.selectedMenu === 'Sample'
            ? 'menu-item selected'
            : 'menu-item';
    }
    get aiMenuItem() {
        return this.selectedMenu === 'AI'
            ? 'menu-item selected'
            : 'menu-item';
    }

    get isCodeSelected() {
        return this.selectedMenu === 'Code';
    }

    get isSampleSelected() {
        return this.selectedMenu === 'Sample';
    }

    get isAiReviewSelected() {
        return this.selectedMenu === 'AI';
    }


    handleMenuClick(event) {
        this.selectedMenu = event.target.dataset.menu;
    }


    @wire(CurrentPageReference)
    getPageReference(pageRef) {
        if (pageRef) {
            this.recordId = pageRef.state?.recordId;

        }
    }

    decodeHtmlEntities(encodedString) {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = encodedString;
        return textarea.value;
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
        this.loadData();


    }
    handleCardClick(event) {
        try {
            const recId = event.currentTarget.dataset.value;
            this.loading = true;
            setTimeout(() => {
                this.loading = false;
                this.selectedChallenge = this.challengeAttempts.find(
                    item => item.Id === recId
                );

                this.selectedChallenge.SolutionProvided = this.decodeHtmlEntities(this.selectedChallenge.SolutionProvided);
                const typeGood = typeof this.selectedChallenge.CodeReviewGood;
                const typeBad = typeof this.selectedChallenge.CodeReviewBad;
                if (typeGood == 'string')
                    this.selectedChallenge.CodeReviewGood = this.selectedChallenge.CodeReviewGood.split(',/n');

                if (typeBad == 'string')
                    this.selectedChallenge.CodeReviewBad = this.selectedChallenge.CodeReviewBad.split(',/n');

                
                if(this.selectedChallenge.testCaseResults)
                {
                const testResults = JSON.parse(this.decodeHtmlEntities(this.selectedChallenge.testCaseResults));


                    this.resultsWithStyle = testResults.map(r => ({
                        ...r,
                        statusClass: r.status === 'Pass' ? 'pass' : 'fail'
                    }));

                    this.resultsWithStyle.forEach((item)=>{
                        this.total++;
                        if(item.status.toLowerCase().includes('pass'))
                        {
                            this.passed++;
                        }
                    });
                }
                else{
                    this.resultsWithStyle=[];
                }

                this.challengeAttempts = this.challengeAttempts.map(attempt => ({
                    ...attempt,
                    cardClass:
                        attempt.Id === recId
                            ? 'attempt-card selected'
                            : 'attempt-card'
                }));
                this.loading = false;
            }, 2000);
        }
        catch (error) {
            console.log(error);
        }


    }


    async loadData() {

        try {
            const response = await getAttemptDetails({
                challengeId: this.recordId
            });
            this.challengeAttempts = response;
            this.challengeAttempts = response.map((attempt, index, arr) => ({
                            ...attempt,
                            showLine: index !== arr.length - 1
            }));
            const firstAttempt = this.challengeAttempts[0];

            if (firstAttempt) {
                this.firstAttemptId = firstAttempt.Id;
                this.challengeName = firstAttempt.ChallengeName;
                this.scenario = firstAttempt.Scenario;
                this.difficulty = firstAttempt.DifficultyLevel;
                this.type = firstAttempt.Type;
                this.path = firstAttempt.Path;
                if (this.challengeAttempts.length == 1 && firstAttempt.Id == null) {
                    this.totalAttempts = 0;
                    this.successfulAttempts = 0;
                    this.failedAttempts = 0;
                    this.successRate = '0.00';
                    this.display = false;
                    this.challengeExp = 0;
                    return;
                }
                else {
                    this.display = true;
                    this.totalAttempts = this.challengeAttempts.length;

                    this.successfulAttempts = this.challengeAttempts.filter(
                        a => a.Result?.toLowerCase().includes('pass')
                    ).length;

                    this.failedAttempts =
                        this.totalAttempts - this.successfulAttempts;

                    this.successRate =
                        ((this.successfulAttempts / this.totalAttempts) * 100).toFixed(2);

                    this.challengeAttempts = this.challengeAttempts.map((attempt, index) => {

                        const passed =
                            attempt.Result?.toLowerCase().includes('pass');

                        return {
                            ...attempt,

                            icon: passed ? '✓' : '✕',

                            badgeClass: passed
                                ? 'status-badge pass-badge'
                                : 'status-badge fail-badge',

                            scoreClass: passed
                                ? 'score pass-text'
                                : 'score fail-text',

                            cardClass:
                                index === 0
                                    ? 'attempt-card selected'
                                    : 'attempt-card'
                        };
                    });
                    this.challengeAttempts = this.challengeAttempts.map(attempt => {
                        const dateTime = new Date(attempt.AttemptDate);

                        return {
                            ...attempt,
                            attemptDate: dateTime.toLocaleDateString('en-US', {
                                month: 'long',
                                day: '2-digit',
                                year: 'numeric'
                            }),
                            attemptTime: dateTime.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })
                        };
                    });
                    this.challengeExp = this.challengeAttempts[0].TotalExpPoints;
                    this.selectedChallenge = this.challengeAttempts[0];
                    this.selectedChallenge.SolutionProvided = this.decodeHtmlEntities(this.selectedChallenge.SolutionProvided);
                    this.selectedChallenge.CodeReviewGood = this.selectedChallenge.CodeReviewGood.split(',/n');
                    this.selectedChallenge.CodeReviewBad = this.selectedChallenge.CodeReviewBad.split(',/n');
                    /*if(this.selectedChallenge.sampleData!=undefined)
                    {
                        
                        this.selectedChallenge.sampleData=JSON.stringify(this.selectedChallenge.sampleData) ;
                        this.selectedChallenge.sampleData=this.decodeHtmlEntities(this.selectedChallenge.sampleData);
                        const cleaned = this.selectedChallenge.sampleData.substring(1, this.selectedChallenge.sampleData.length - 1);
                        this.selectedChallenge.sampleData=JSON.parse(cleaned);
                        this.sampleData=this.selectedChallenge.sampleData;
    
                        this.sampleData = this.sampleData.map((item, index) => ({
                                ...item,
                                scenarioNumber: index + 1
                        }));
    
                        
                    }
                    else{
                        this.showSampleData=false;
                    }*/
                   if(this.selectedChallenge.Path.toLowerCase().includes('debug'))
                   {
                        this.showSampleData=false;
                   }

                    if(this.selectedChallenge.testCaseResults)
                {
                const testResults = JSON.parse(this.decodeHtmlEntities(this.selectedChallenge.testCaseResults));


                    this.resultsWithStyle = testResults.map(r => ({
                        ...r,
                        statusClass: r.status === 'Pass' ? 'pass' : 'fail'
                    }));

                    this.resultsWithStyle.forEach((item)=>{
                        this.total++;
                        if(item.status.toLowerCase().includes('pass'))
                        {
                            this.passed++;
                        }
                    });
                }
                else{
                    this.resultsWithStyle=[];
                }


                }
            }
        }
    catch (error) {
                console.log(error);
            }
        }

    backToProfile() {
            this.loginName = window.sessionStorage.setItem('loginName', this.loginName);
            this.isLoggedIn = window.sessionStorage.setItem('isLoggedIn', this.isLoggedIn);
            this[NavigationMixin.Navigate]({
                type: 'standard__webPage',
                attributes: {
                    url: '/userProfile'
                }
            })
        }

    tryAgainMethod()
    {
        console.log(this.path.toLowerCase());
        if(this.path.toLowerCase().includes('coding'))
        {
            sessionStorage.setItem(
            'challengeId',
            this.recordId);
            this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
            name: 'buildinArena__c'
            }
        });
        }
        else if(this.path.toLowerCase().includes('debugging'))
        {
            sessionStorage.setItem(
            'challengeId',
            this.recordId);
            this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
            name: 'debuggingarena__c'
            }
        });
        }
    }
    }