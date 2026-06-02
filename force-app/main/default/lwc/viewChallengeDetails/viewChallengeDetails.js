import { LightningElement, wire } from 'lwc';
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';
import getAttemptDetails from '@salesforce/apex/recordController.getAttemptDetails';

export default class ViewChallengeDetails extends NavigationMixin(LightningElement) {

    recordId = '';
    challengeAttempts = [];
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


    @wire(CurrentPageReference)
    getPageReference(pageRef) {
        if (pageRef) {
            this.recordId = pageRef.state?.recordId;

        }
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

    async loadData() {
        const response = await getAttemptDetails({
            challengeId: this.recordId
        });
        this.challengeAttempts = response;
        const firstAttempt = this.challengeAttempts?.[0];

        if (firstAttempt) {

            this.challengeName = firstAttempt.ChallengeName;
            this.scenario = firstAttempt.Scenario;
            this.difficulty = firstAttempt.DifficultyLevel;
            this.type = firstAttempt.Type;
            this.path = firstAttempt.Path;

            if(this.challengeAttempts.length==1){
               this.totalAttempts=0;
               this.successfulAttempts=0;
               this.failedAttempts=0;
               this.successRate='0.00';
               return; 
            }

            this.totalAttempts = this.challengeAttempts.length;

            this.successfulAttempts = this.challengeAttempts.filter(
                a => a.Result?.toLowerCase().includes('pass')
            ).length;

            this.failedAttempts =
                this.totalAttempts - this.successfulAttempts;

            this.successRate =
                ((this.successfulAttempts / this.totalAttempts) * 100).toFixed(2);
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