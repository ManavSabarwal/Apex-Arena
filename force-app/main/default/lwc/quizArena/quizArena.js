import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getTopics from '@salesforce/apex/recordController.getTopics';
import quizBook from '@salesforce/resourceUrl/quizBook';
import invokeQuizPrompt from '@salesforce/apex/PromptTemplateController.invokeQuizPrompt';

export default class QuizArena extends NavigationMixin(LightningElement) {

    loginName = ''
    isLoggedIn = false;

    topic = '';
    previousQuizTerms = [];
    quizGenerated = false;

    imageUrl = quizBook;

    loadingMessages = [
        'Welcome Challenger...',
        'Entering Quiz Quest...',
        'Gathering Salesforce wisdom...',
        'Selecting worthy questions...',
        'Forging your challenge...',
        'Preparing the battlefield...',
        'Almost there...',
        'The arena is ready!'
    ];

    messageIndex = 0;
    currentLoadingMessage = '';
    messageInterval;

    progress = 1;
    timerInterval;
    totalSeconds = 3600;

    response;
    loading = false;

    dataLoaded = false;
    showQuiz = false;

    showError = false;
    totalQues = 0;
    quesAttempted = 0;
    marked = 0;

    selectedQuestion;

    questionNumbers = Array.from({ length: 50 }, (_, index) => index + 1);
    prevIcon = '<';

    startTimer() {
        this.clearTimer();

        this.timerInterval = setInterval(() => {
            if (this.totalSeconds > 0) {
                this.totalSeconds--;
            } else {
                this.clearTimer();
                this.handleTimeUp();
            }
        }, 1000);
    }

    clearTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    get formattedTime() {
        const minutes = Math.floor(this.totalSeconds / 60);
        const seconds = this.totalSeconds % 60;

        return `${this.pad(minutes)}:${this.pad(seconds)}`;
    }

    pad(value) {
        return value < 10 ? `0${value}` : value;
    }

    get timerClass() {
        if (this.totalSeconds <= 60) {
            return 'timer danger';
        }

        if (this.totalSeconds <= 300) {
            return 'timer warning';
        }

        return 'timer';
    }

    handleTimeUp() {
        console.log('Time is up');

        // Optional: fire event to parent component
        this.dispatchEvent(new CustomEvent('timeup'));
    }

    get progressStyle() {
        return `width: ${this.progress}%;height: 10px;background:linear-gradient(135deg, #8b5cf6, #d946ef);border-radius: 20px;`;
    }



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

    }

    onTopicSelected(event) {
        this.topic = event.currentTarget.dataset.id;

    }

    async launchQuiz() {

        this.loading = true;
        this.dataLoaded = false;

        this.messageIndex = 0;
        this.currentLoadingMessage = this.loadingMessages[0];

        this.messageInterval = setInterval(() => {
            this.messageIndex++;

            if (this.messageIndex < this.loadingMessages.length) {
                this.currentLoadingMessage = this.loadingMessages[this.messageIndex];
                this.progress = Math.round(this.progress + 12.5);
            } else {
                clearInterval(this.messageInterval);
            }
        }, (Math.random() * 2000) + 2000);
        try {
            this.response = await invokeQuizPrompt(
                {
                    areaOfExpertise: this.topic
                });
            this.currentLoadingMessage = 'Let the Quiz Quest begin!';
            this.progress = 100;
            clearInterval(this.messageInterval);
            this.dataLoaded = true;
            if (this.response[0].Question == 'Not a valid topic') {
                this.dataLoaded = false;
                this.showError = true;
            }
            else {

                this.response = this.response.map((question, index) => {
                    return {
                        ...question,
                        questionNumber: index + 1,
                        markedForReview: false,
                        attempted: false,
                        selectedOption: null,
                        formattedChoices: Object.entries(question.Choices).map(([key, value]) => {
                            return {
                                option: key,
                                value: value,
                                className: 'choiceDiv'
                            };
                        })
                    };
                });
            }

        }
        catch {
            console.log('Error in launchQuiz');
        }

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

    openProfile() {
        window.sessionStorage.setItem('isLoggedIn', true);
        window.sessionStorage.setItem('loginName', this.loginName);
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/userProfile'
            }
        });

    }

    backReset() {
        this.loading = false;
        this.showError = false;
        this.dataLoaded = false;
        this.progress = 1;
        this.topic = '';
    }

    getQuestion(val) {
        if (val != null && this.response != null && (val >= 0 && val < 50)) {
            this.selectedQuestion = this.response[val];
            console.log(this.selectedQuestion);
        }
    }

    startQuiz() {
        this.showQuiz = true;
        this.loading = false;
        if (this.response.length > 50) {
            this.response = this.response.slice(0, 50);
        }
        this.totalQues = this.response.length;
        this.getQuestion(0);
        this.startTimer();
    }

    nextQuestion()
    {
        if(this.selectedQuestion.questionNumber<50)
        {
            const ind=this.selectedQuestion.questionNumber;
            this.getQuestion(ind);
        }
    }

    prevQuestion()
    {
        if(this.selectedQuestion.questionNumber>1)
        {
            const ind=this.selectedQuestion.questionNumber-2;
            this.getQuestion(ind);
        }
    }
    markQuestion()
    {
        this.selectedQuestion.markedForReview=true;
    }

    get choiceDivClass()
    {
        return this.selectedQuestion.selectedOption==option
    }

    handleChoiceSelected(event) {
        const option=event.currentTarget.dataset.option;
        let attempted;
        let selectedOption;
        if(this.selectedQuestion.attempted==true && this.selectedQuestion.selectedOption==option)
        {
            attempted = false;
            selectedOption = '';
        } else {
            attempted = true;
            selectedOption = option;
        }

        this.selectedQuestion = {
        ...this.selectedQuestion,
        attempted: attempted,
        selectedOption: selectedOption,
        formattedChoices: this.selectedQuestion.formattedChoices.map(choice => ({
            ...choice,
            className: choice.option === selectedOption
                ? 'choiceDiv selected'
                : 'choiceDiv'
        }))
        };

        this.response = this.response.map(question =>
                question.questionNumber === this.selectedQuestion.questionNumber
                    ? this.selectedQuestion
                    : question
            );
        
    }





}