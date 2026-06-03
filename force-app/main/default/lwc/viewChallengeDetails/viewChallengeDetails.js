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
    loading=false;
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
        const recId = event.currentTarget.dataset.value;
        this.loading = true;
        setTimeout(() => {
            this.loading = false;
            this.selectedChallenge = this.challengeAttempts.find(
                item => item.Id === recId
            );

            this.selectedChallenge.SolutionProvided = this.decodeHtmlEntities(this.selectedChallenge.SolutionProvided);

            this.challengeAttempts = this.challengeAttempts.map(attempt => ({
                ...attempt,
                cardClass:
                    attempt.Id === recId
                        ? 'attempt-card selected'
                        : 'attempt-card'
            }));
            this.loading=false;
        }, 2000);


    }


    async loadData() {
        const response = await getAttemptDetails({
            challengeId: this.recordId
        });
        this.challengeAttempts = response;
        const firstAttempt = this.challengeAttempts?.[0];

        if (firstAttempt) {
            this.firstAttemptId = firstAttempt.Id;
            this.challengeName = firstAttempt.ChallengeName;
            this.scenario = firstAttempt.Scenario;
            this.difficulty = firstAttempt.DifficultyLevel;
            this.type = firstAttempt.Type;
            this.path = firstAttempt.Path;

            if (this.challengeAttempts.length == 1) {
                this.totalAttempts = 0;
                this.successfulAttempts = 0;
                this.failedAttempts = 0;
                this.successRate = '0.00';
                this.display = false;
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

                this.selectedChallenge = this.challengeAttempts[0];
                this.selectedChallenge.SolutionProvided = this.decodeHtmlEntities(this.selectedChallenge.SolutionProvided);

            }


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
}