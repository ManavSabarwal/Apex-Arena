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
    isNavigating=false;
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

    timeUp = false;
    quizSubmitted = false;

    score = 0;

    startQuizInstructions = [
        'Read every question carefully.',
        'Each question has only one correct answer.',
        'You can move between questions during the quiz.',
        'Use Mark for Review for questions you want to revisit.',
        'Keep track of the remaining time.',
        'Submit the quiz before the timer ends.',
        'Quiz will be auto submitted as soon as the Timer Expires.'
    ];

    correct = 0;
    incorrect = 0;
    unanswered = 0;

    selectedDifficulty='Easy';

    difficultyOptions = [{
        label: "Warm Up",
        value: "Easy"
    },
    {
        label: "Battle",
        value: "Medium"
    },
    {
        label: "Boss Fight",
        value: "Hard"
    }
    ]

    handleDifficultyChange(event) {

        this.selectedDifficulty = event.target.value;
    }


    get progressStyleScore() {
        let color = '#ef4444'; // red

        if (this.score >= 75) {
            color = '#22c55e'; // green
        } else if (this.score >= 50) {
            color = '#facc15'; // yellow
        }

        return `--progress:${this.score * 3.6}deg; --score-color:${color};`;
    }

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

    pauseTimer() {
        this.clearTimer();
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

    get formattedTimeTaken() {
        const minutes = Math.floor((3600 - this.totalSeconds) / 60);
        const seconds = (3600 - this.totalSeconds) % 60;

        return `${this.pad(minutes)}:${this.pad(seconds)}`;
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

        this.timeUp = true;
        this.handleSubmitQuiz();

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

    setNavigating()
    {
        this.isNavigating=true;
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
                    areaOfExpertise: this.topic,
                    username: this.loginName,
                    difficulty: this.selectedDifficulty
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
        this.isNavigating=true;
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
        this.isNavigating=true;
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

    nextQuestion() {
        if (this.selectedQuestion.questionNumber < 50) {
            const ind = this.selectedQuestion.questionNumber;
            this.getQuestion(ind);
        }
    }

    prevQuestion() {
        if (this.selectedQuestion.questionNumber > 1) {
            const ind = this.selectedQuestion.questionNumber - 2;
            this.getQuestion(ind);
        }
    }
    get markedClass() {
        return this.selectedQuestion.markedForReview == true
            ? 'review marked'
            : 'review'
    }
    markQuestion() {
        const oldMark = this.response.find(item => item.questionNumber === this.selectedQuestion.questionNumber).markedForReview;
        if (!oldMark) {
            this.marked++;
            this.selectedQuestion.markedForReview = true;
            this.response = this.response.map(question =>
                question.questionNumber === this.selectedQuestion.questionNumber
                    ? this.selectedQuestion
                    : question
            );
        }
        else {
            this.marked--;
            this.selectedQuestion.markedForReview = false;
            this.response = this.response.map(question =>
                question.questionNumber === this.selectedQuestion.questionNumber
                    ? this.selectedQuestion
                    : question
            );
        }


    }

    get choiceDivClass() {
        return this.selectedQuestion.selectedOption == option
    }

    handleChoiceSelected(event) {
        const option = event.currentTarget.dataset.option;
        let attempted;
        let selectedOption;
        if (this.selectedQuestion.attempted == true && this.selectedQuestion.selectedOption == option) {
            attempted = false;
            selectedOption = '';
            this.quesAttempted--;
        } else {
            attempted = true;
            selectedOption = option;
            this.quesAttempted++;
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

    get quesDivClass() {
        return this.response.map(question => {
            let classes = 'numbers';

            if (
                this.selectedQuestion &&
                question.questionNumber === this.selectedQuestion.questionNumber
            ) {
                classes += ' activeQuestion';
            }

            if (question.attempted) {
                classes += ' attemptedQuestion';
            }

            if (question.markedForReview) {
                classes += ' reviewQuestion';
            }

            return {
                ...question,
                navClass: classes
            };
        });
    }

    navigateToQuesNumber(event) {
        const quesNum = Number(event.currentTarget.dataset.id);
        this.selectedQuestion = this.response.find(item =>
            item.questionNumber === quesNum
        );
    }

    handleSubmitQuiz() {
        this.isSubmitting = false;
        this.quizSubmitted = true;
        this.getQuestion(0);
        this.response = this.response.map(question => {
            const selectedOption = question.selectedOption;
            const correctAnswer = question.Answer;

            const isAttempted = selectedOption !== null && selectedOption !== undefined && selectedOption !== '';
            const isCorrect = isAttempted && selectedOption === correctAnswer;

            return {
                ...question,

                isAttempted: isAttempted,
                isCorrect: isCorrect,
                resultStatus: isAttempted ? (isCorrect ? 'Correct' : 'Incorrect') : 'Unanswered',
                resultClass: isAttempted ? (isCorrect ? 'numbers questionCorrect' : 'numbers questionWrong') : 'numbers questionUnanswered',

                formattedChoices: question.formattedChoices.map(choice => {
                    let classes = 'choiceDivRes';

                    const isUserAnswer = choice.option === selectedOption;
                    const isCorrectAnswer = choice.option === correctAnswer;

                    if (isCorrectAnswer) {
                        classes += ' correctAnswer';
                    }

                    if (isUserAnswer) {
                        classes += ' yourAnswer';
                    }

                    if (isUserAnswer && !isCorrectAnswer) {
                        classes += ' wrongAnswer';
                    }

                    if (isUserAnswer && isCorrectAnswer) {
                        classes += ' rightAnswer';
                    }

                    return {
                        ...choice,
                        reviewClass: classes
                    };
                })
            };
        });

        this.selectedQuestion = this.response.find(
            question => question.questionNumber === this.selectedQuestion.questionNumber
        );

        const resultSummary = this.response.reduce((summary, question) => {
            if (!question.isAttempted) {
                summary.unanswered++;
            } else if (question.isCorrect) {
                summary.correct++;
            } else {
                summary.incorrect++;
            }

            return summary;
        }, {
            correct: 0,
            incorrect: 0,
            unanswered: 0
        });

        this.correct = resultSummary.correct;
        this.incorrect = resultSummary.incorrect;
        this.unanswered = resultSummary.unanswered;

        this.score = this.response.length > 0
            ? Math.round((this.correct / this.response.length) * 100)
            : 0;
    }

    isSubmitting = false;

    submitConfirmation() {
        this.isSubmitting = true;
        this.pauseTimer();
    }

    handleTakeMeBack() {
        this.isSubmitting = false;
        this.startTimer();
    }





}