import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getTopics from '@salesforce/apex/recordController.getTopics';

export default class QuizArena extends NavigationMixin(LightningElement) {

    loginName = ''
    isLoggedIn = false;

    topic = '';
    previousQuizTerms = [];
    quizGenerated = false;

    launching = false;

    loadingMessages = [
        'Welcome Challenger...',
        'Entering Quiz Quest...',
        'Gathering Salesforce wisdom...',
        'Selecting worthy questions...',
        'Forging your challenge...',
        'Preparing the battlefield...',
        'Challenge accepted...',
        'Almost there...',
        'The arena is ready!',
        'Let the Quiz Quest begin!'
    ];

    messageIndex=0;
    currentLoadingMessage='';
    messageInterval;



    get previousTopics() {
        return this.previousQuizTerms.length > 0
            ? true
            : false;
    }

    get buttonDisabled() {
        return this.topic == ''
            ? true
            : false;
    }

    connectedCallback() {
        this.loginName = window.sessionStorage.getItem('loginName');
        this.isLoggedIn = window.sessionStorage.getItem('isLoggedIn');
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

        this.getPreviousTopics()

    }

    async getPreviousTopics() {
        const topics = await getTopics({
            username: this.loginName
        });

        if (topics) {
            this.previousQuizTerms = topics.split(',');
        }
    }

    onTopicChange(event) {
        this.topic = event.target.value;
        console.log(this.topic);
    }

    onTopicSelected(event) {
        this.topic = event.currentTarget.dataset.id;
        console.log(this.topic);
    }

    launchQuiz() {
        this.launching = true;
        this.messageIndex = 0;
    this.currentLoadingMessage = this.loadingMessages[0];

    this.messageInterval = setInterval(() => {
        this.messageIndex++;

        if (this.messageIndex < this.loadingMessages.length) {
            this.currentLoadingMessage = this.loadingMessages[this.messageIndex];
        } else {
            clearInterval(this.messageInterval);
        }
    }, 2000);
    }






}