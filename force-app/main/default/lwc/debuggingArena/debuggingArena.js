import { LightningElement } from 'lwc';
import invokePrompt from '@salesforce/apex/PromptTemplateController.invokePrompt';
import invokeValidationPrompt from '@salesforce/apex/PromptTemplateController.invokeValidationPrompt';
import saveAttemptedChallenge from '@salesforce/apex/recordController.saveAttemptedChallenge';
import createChallengeAttempt from '@salesforce/apex/recordController.createChallengeAttempt';
import updateExpPoints from '@salesforce/apex/recordController.updateExpPoints';
import getChallengeDetails from '@salesforce/apex/recordController.getChallengeDetails';
import { NavigationMixin } from 'lightning/navigation';


export default class DebuggingArena extends NavigationMixin(LightningElement) {

    isNavigating=false;
    loginName = '';
    problem;
    scenario = '';
    code = '';
    textAreacode = '';
    symptoms = '';
    problemTitle = '';
    difficulty = 'Easy';
    type = 'Sync Apex';
    isLoading = false;
    dataLoaded = false;
    difficultyfromPrompt = '';
    result = 'Pending';
    reason = 'No Reasoning Yet';
    thegood = ['Submit your code for review...'];
    thebad = ['Submit your code for review...'];
    optimizedCode = 'Submit your code for review...';
    submitting = false;
    isReadonly = true;
    savedId = '';
    passed = false;
    score = '0';

    isLoggedIn = false;
    isProblemOptionHidden = false;
    isProblemHidden = false;
    expReward = 0;
    estimatedTime = '10:00';

    unlockedAchievements = [];

    get sectionClass() {
        return this.isProblemOptionHidden
            ? 'selectOptions collapsed'
            : 'selectOptions expanded';
    }

    get arrowClass() {
        return this.isProblemOptionHidden
            ? 'down-arrow'
            : 'up-arrow';
    }

    get arrowIcon() {
        return this.isProblemOptionHidden ? '▼' : '▲';
    }

    get problemSectionClass() {
        return this.isProblemHidden
            ? 'problemSection collapsed'
            : 'problemSection problemSectionexpanded';
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
        const challengeId = window.sessionStorage.getItem('challengeId');
        if (challengeId)
            this.loadChallenge(challengeId);
    }

    async loadChallenge(challengeId) {
        console.log("loadChallenge " + challengeId);
        try {

            const result = await getChallengeDetails(
                {
                    challengeId: challengeId
                }
            )
            this.savedId = challengeId;
            console.log("load " + this.savedId);

            this.populateData(result);

        }
        catch (error) {
            console.log(error);
        }
    }

    disconnectedCallback()
    {
        window.sessionStorage.setItem('challengeId',null);
    }


    populateData(response) {
        try {
            this.dataLoaded = true;
            this.problem = response;
            const parsedData = response;
            this.scenario = parsedData.Scenario;
            this.code = parsedData.ErrorCode.replace('```apex', '').replace('```', '');
            this.textAreacode = this.code;
            this.symptoms = parsedData.BusinessRequirements;
            this.problemTitle = parsedData.ProblemTitle;
            this.difficultyfromPrompt = parsedData.DifficultyLevel;

            switch (this.difficultyfromPrompt) {
                case 'Beginner': this.estimatedTime = '20:00'; this.expReward = '50 XP'; break;
                case 'Apprentice': this.estimatedTime = '30:00'; this.expReward = '100 XP'; break;
                case 'Skilled Developer': this.estimatedTime = '45:00'; this.expReward = '200 XP'; break;
                case 'Expert Architect': this.estimatedTime = '1:00:00'; this.expReward = '400 XP'; break;
                case 'Legendary Salesforce Hero': this.estimatedTime = '1:30:00'; this.expReward = '800 XP'; break;
            }

            if (!this.isProblemOptionHidden) {
                this.isProblemOptionHidden = !this.isProblemOptionHidden;
            }
        }
        catch (error) {
            console.log(error);
        }
        finally {
            this.isLoading = false;
            this.isReadonly = false;
        }
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

    hideProblemOptions() {

        this.isProblemOptionHidden = !this.isProblemOptionHidden;
    }
    hideProblem() {
        this.isProblemHidden = !this.isProblemHidden;
    }
    get resultClass() {
        if (this.result === 'Pending') {
            return 'result-pending';
        }
        else if (this.result === 'Pass' || this.result === 'PASS' || this.result.toUpperCase().includes('PASS')) {
            return 'result-passed';
        }
        else if (this.result === 'FAIL' || this.result === 'Fail' || this.result.toUpperCase().includes('FAIL')) {
            return 'result-failed';
        }
    }

    async generateProblem(event) {
        let response = '';
        this.textAreacode = '';
        this.isReadonly = true;
        this.submitCount = 0;


        //reseting the results we get after submitting the solution
        this.result = 'Pending';
        this.reason = 'No Reasoning Yet';
        this.thebad = ['Submit your code for review...'];
        this.thegood = ['Submit your code for review...'];
        this.optimizedCode = 'Submit your code for review...';


        try {
            this.isLoading = true;
            console.log('Generating problem...');
            response = await invokePrompt(
                {
                    difficulty: this.difficulty,
                    type: this.type,
                    UserName: this.loginName,
                    path: 'debug'
                });

            this.populateData(JSON.parse(response));
        } catch (error) {
            console.error('Error generating problem:', error);
            this.dataLoaded = false;
        } finally {
            this.isLoading = false;
            this.isReadonly = false;
            response = '';
            try {
                console.log('DebuggingArena -- -- -- -- -- Before saveAttemptedChallenge' + this.loginName)

                this.savedId = await saveAttemptedChallenge({
                    problemTitle: this.problemTitle,
                    scenario: this.scenario,
                    errorcode: this.code,
                    symptoms: this.symptoms,
                    type: this.type,
                    difficultylevel: this.difficultyfromPrompt,
                    username: this.loginName,
                    path: 'Debugging',
                    sampledata: '',
                    expectedOutput: '',
                    constraints: ''
                })
                console.log('Challenge Saved');
                console.log(this.savedId);

            }
            catch (error) {
                console.error('Error generating problem:', error);
            }


        }
    }

    handleCodeChange(event) {
        this.textAreacode = event.target.value;
        console.log('Code updated:', this.textAreacode);
    }

    tabspacing(event) {
        if (event.key === 'Tab') {

            event.preventDefault();

            const textarea = event.target;

            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;

            const spaces = '\t';

            textarea.value =
                textarea.value.substring(0, start) +
                spaces +
                textarea.value.substring(end);

            textarea.selectionStart =
                textarea.selectionEnd =
                start + spaces.length;
        }
    }

    handleDifficulty(event) {
        this.difficulty = event.currentTarget.dataset.value;
        event.currentTarget.classList.add('active');
    }

    handleType(event) {
        this.type = event.currentTarget.dataset.value;
    }

    get easyClass() {
        return `difficulty-btn ${this.difficulty === 'Easy' ? 'active easy' : ''}`;
    }

    get mediumClass() {
        return `difficulty-btn ${this.difficulty === 'Medium' ? 'active medium' : ''}`;
    }

    get hardClass() {
        return `difficulty-btn ${this.difficulty === 'Hard' ? 'active hard' : ''}`;
    }

    get SynchronousApex() {
        return `type-btn ${this.type === 'Sync Apex' ? 'active' : ''}`;
    }

    get AsynchronousApex() {
        return `type-btn ${this.type === 'Async Apex' ? 'active' : ''}`;
    }

    get Trigger() {
        return `type-btn ${this.type === 'Trigger' ? 'active' : ''}`;
    }

    get TestClass() {
        return `type-btn ${this.type === 'Test Class' ? 'active' : ''}`;
    }

    async submitSolution() {
        try {
            console.log('Submitting solution...');
            this.submitting = true;
            this.isReadonly = true;
            const parsedResponse = await invokeValidationPrompt({ scenario: this.scenario, solution: this.textAreacode, challengeId: this.savedId });
            this.result = parsedResponse.Result;
            this.reason = parsedResponse.Reasoning;
            this.thebad = JSON.parse(parsedResponse.CodeReviewBad);
            this.thegood = JSON.parse(parsedResponse.CodeReviewGood);
            console.log(this.thegood);
            this.optimizedCode = parsedResponse.ArchitectOptimization;
            this.score = parsedResponse.Score;
            let message = parsedResponse.message;
            let expPoints = parsedResponse.expPoints;
            this.unlockedAchievements = parsedResponse.unlockedAchievements;
            if (this.unlockedAchievements.length > 0 && this.unlockedAchievements.formulaKey=='FIRST_SUBMISSION') {
                this.template.querySelector('c-show-achievement-modal').openModal(this.unlockedAchievements);
            }
            if (this.result.toLowerCase().includes('pass')) {
                this.template.querySelector('c-modal-component').openModal(message, expPoints);
                if(this.unlockedAchievements.length > 0 && this.unlockedAchievements.formulaKey!='FIRST_SUBMISSION')
                {
                    this.template.querySelector('c-show-achievement-modal').openModal(this.unlockedAchievements);
                }
            }
            

        } catch (error) {
            console.error('Error in submitSolution method:', error);
        }
        finally {
            this.submitting = false;
            this.isReadonly = false;

        }
    }

    showNewAchievements() {
        console.log(this.unlockedAchievements.length);
        this.template.querySelector('c-show-achievement-modal').openModal(this.unlockedAchievements);
        
    }

}
