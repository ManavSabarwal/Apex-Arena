import { LightningElement } from 'lwc';
import invokePrompt from '@salesforce/apex/PromptTemplateController.invokePrompt';
import invokeValidationPromptCoding from '@salesforce/apex/PromptTemplateController.invokeValidationPromptCoding';
import saveAttemptedChallenge from '@salesforce/apex/recordController.saveAttemptedChallenge';
import createChallengeAttempt from '@salesforce/apex/recordController.createChallengeAttempt';
import updateExpPoints from '@salesforce/apex/recordController.updateExpPoints';
import getChallengeDetails from '@salesforce/apex/recordController.getChallengeDetails';
import { NavigationMixin } from 'lightning/navigation';


export default class buildingArena extends NavigationMixin(LightningElement) {

    isProblemOptionHidden = false;
    isProblemHidden = false;
    expReward = 0;
    estimatedTime = '10:00';

    loginName = '';
    problem;
    scenario = '';
    textAreacode = '';
    sampleData = [];
    requirements = '';
    problemTitle = '';
    difficulty = 'Easy';
    type = 'Sync Apex';
    isLoading = false;
    dataLoaded = false;
    difficultyfromPrompt = '';
    result = 'Pending';
    resultIcon = '⏳';
    testCaseCount=0;
    passedTestCases=0;
    testReadonly=true;
    submitReadOnly=true;
    testdone=false;

    thegood = ['Submit your solution to see detailed feedback.'];
    thebad = ['Submit your solution to see detailed feedback.'];

    scenarioResults = '';
    recommendations = '';
    compilationStatus = '';
    score = 0;
    submitting = false;
    isReadonly = true;
    savedId = '';
    passed = false;

    isLoggedIn = false;
    loadingMessages = ['Nothing yet'];

    sessionToken=''


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
        const challengeId=window.sessionStorage.getItem('challengeId');
        if(challengeId)
        {
           this.loadChallenge(challengeId);
        }
    }

    async loadChallenge(challengeId)
    {
        try{

            const result=await getChallengeDetails(
                {
                    challengeId:challengeId
                }
            )
            this.savedId=challengeId;

            this.populateData(result);

        }
        catch(error)
        {
            console.log(error);
        }
    }

    renderedCallback() {
        const logContainer = this.template.querySelector('.code');

        if (logContainer) {
            logContainer.scrollTop = logContainer.scrollHeight;
        }
    }

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
        return this.isProblemOptionHidden ? '▼' : '▲'
    }

    get problemSectionClass() {
        return this.isProblemHidden
            ? 'problemSection collapsed'
            : 'problemSection problemSectionexpanded';
    }

    get one() {
        return this.dataLoaded
            ? 'one completed'
            : 'one highlighted';
    }

    get two() {
        return this.dataLoaded
            ? this.testdone==true? 'two completed' : 'two highlighted'
            : 'two';
    }

    get cod() {
        return this.dataLoaded
            ? 'generate gen-highlighted'
            : 'generate';
    }

    get three(){
        return this.testdone==true? 'three completed' : 'three';
    }

    get test(){
        return this.testdone==true? 'generate gen-highlighted' : 'generate';
    }

    get four(){
        return this.result.toLowerCase().includes('pass')? 'four completed' : 'four';
    }

    get sub()
    {
        return this.result.toLowerCase().includes('pass')? 'generate gen-highlighted' : 'generate';
    }

    hideProblemOptions() {

        this.isProblemOptionHidden = !this.isProblemOptionHidden;
    }

    hideProblem() {
        this.isProblemHidden = !this.isProblemHidden;
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

    showSampleData() {
        
        this.template.querySelector('c-sampledata-modal-component').openModal(this.sampleData);
    }

    showResults() {
        this.template.querySelector('c-show-scenario-results').openModal(this.scenarioResults);
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

    populateData(response)
    {
        
        try{
            this.dataLoaded=true;
            const parsedData = response;
            this.scenario = parsedData.Scenario;
            this.requirements = parsedData.BusinessRequirements;
            this.problemTitle = parsedData.ProblemTitle;
            this.difficultyfromPrompt = parsedData.DifficultyLevel;
            const sampData = parsedData.SampleData;
            this.sampleData = sampData;

            switch (this.difficultyfromPrompt) {
                case 'Beginner': this.estimatedTime = '20:00'; this.expReward = '80 XP'; break;
                case 'Apprentice': this.estimatedTime = '30:00'; this.expReward = '160 XP'; break;
                case 'Skilled Developer': this.estimatedTime = '45:00'; this.expReward = '320 XP'; break;
                case 'Expert Architect': this.estimatedTime = '1:00:00'; this.expReward = '640 XP'; break;
                case 'Legendary Salesforce Hero': this.estimatedTime = '1:30:00'; this.expReward = '1280 XP'; break;
            }

            if (!this.isProblemOptionHidden) {
                this.isProblemOptionHidden = !this.isProblemOptionHidden;
            }
        }
        catch(error)
        {
            console.log('Error in populateData method');
            console.log(error);
        }
        finally
        {
            this.isLoading = false;
            this.isReadonly = false;
            this.testReadonly = false;
        }
    }

    async generateProblem(event) {
        let response = '';
        this.textAreacode = '';
        this.isReadonly = true;
        this.submitCount = 0;
        this.testReadonly = true;
        this.submitReadOnly=true;



        //reseting the results we get after submitting the solution
        this.result = 'Pending';
        this.thebad = ['Submit your solution to see detailed feedback.'];
        this.thegood = ['Submit your solution to see detailed feedback.'];
        this.scenarioResults = '';
        this.recommendations = '';
        this.compilationStatus = '';

        try {
            this.isLoading = true;
            console.log('Generating problem...');
            response = await invokePrompt(
                {
                    difficulty: this.difficulty,
                    type: this.type,
                    UserName: this.loginName,
                    path: 'build'
                });

            this.dataLoaded = true;
            this.populateData(JSON.parse(response));



        } catch (error) {
            console.error('Error generating problem:', error);
            this.dataLoaded = false;
        } finally {
            this.isLoading = false;
            this.isReadonly = false;
            this.testReadonly = false;
            response = '';
            try {

                this.savedId = await saveAttemptedChallenge({
                    problemTitle: this.problemTitle,
                    scenario: this.scenario,
                    errorcode: '',
                    symptoms: this.requirements,
                    type: this.type,
                    difficultylevel: this.difficultyfromPrompt,
                    username: this.loginName,
                    path: 'Coding',
                    sampledata: this.sampleData,
                    expectedOutput: '',
                    constraints: this.constraints
                })
                console.log('Challenge Saved');

            }
            catch (error) {
                console.error('Error Saving Attempted Challenge:', error);
            }


        }
    }

    handleCodeChange(event) {
        this.textAreacode = event.target.value;
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

    get progressStyle() {
    return `--progress:${this.score * 3.6}deg`;
}

    async submitSolution(event) {
        this.submitting = true;
        this.passedTestCases=0;
        this.testCaseCount=0;
        this.loadingMessages = [];
        const actionType = event.currentTarget.dataset.id;
        if(actionType==='Test')
        {
            this.testdone = true;
        }
        const timestamp = '[ ' + new Date(Date.now()).toLocaleTimeString('en-GB') + ' ]';
        this.loadingMessages.push(timestamp + ' Initializing Apex Runtime...\n');
        const steps = [
            ' Connecting to Challenge Engine...\n',
           ' Saving Solution...\n',
            ' Executing Apex Tests...\n',
            ' Validating Business Rules...\n',
            ' Running Hidden Test Cases...\n',
            ' Calculating Performance Score...\n',
            ' Creating Challenge Attempt...\n'
        ];

        let currentIndex = 0;

        const intervalId = setInterval(() => {
            if (currentIndex < steps.length) {
                this.loadingMessages = [
                    ...this.loadingMessages,
                    '[ ' + new Date(Date.now()).toLocaleTimeString('en-GB') + ' ]' + steps[currentIndex]
                ];
                currentIndex++;
            }
        }, Math.floor(Math.random() * 2001) + 2000);
        try {
            console.log('Submitting solution...');

            this.isReadonly = true;
            const response = await invokeValidationPromptCoding({ scenario: this.scenario, solution: this.textAreacode, sampleData: this.sampleData, submissionType: actionType + ' ' + this.difficulty , requirements: this.requirements,challengeId: this.savedId});

            clearInterval(intervalId);
            // Add all remaining messages immediately
            const timenow='[ ' + new Date(Date.now()).toLocaleTimeString('en-GB') + ' ]'
            if (currentIndex < steps.length) {
                this.loadingMessages = [
                    ...this.loadingMessages,
                    ...steps.slice(currentIndex).map(step => `${timenow}${step}`)
                ];
            }

            // Small delay so user sees final messages
            await new Promise(resolve => setTimeout(resolve, 500));
            this.result = response.overallVerdict;
            this.compilationStatus = response.compilationStatus;
            this.thebad = response.badCodeReview;
            this.thegood = response.goodCodeReview;
            this.recommendations = response.recommendedImprovements;
            this.scenarioResults = response.scenarioResults;
            this.score = response.score;
            let message=response.message;
            let expPoints=response.expPoints;
            this.unlockedAchievements = response.unlockedAchievements;
            this.scenarioResults.forEach(item=>{
                if(item.status.toLowerCase().includes('pass'))
                {
                    this.passedTestCases++;
                }
                this.testCaseCount++;
            });
            this.resultIcon = response.overallVerdict.toLowerCase().includes('pass') ? '✔' : response.overallVerdict.toLowerCase().includes('fail') ? 'x' : '⚠';

            this.loadingMessages.push('[ ' + new Date(Date.now()).toLocaleTimeString('en-GB') + ' ]' + ' Submission Complete\n');

            if(this.testdone==true)
                this.submitReadOnly = false;

            if (this.result.toLowerCase().includes('pass') && actionType=='Submit') {
                   this.template.querySelector('c-modal-component').openModal(message,expPoints);
                   if(this.unlockedAchievements.length > 0 && this.unlockedAchievements.formulaKey!='FIRST_SUBMISSION')
                {
                    this.template.querySelector('c-show-achievement-modal').openModal(this.unlockedAchievements);
                }
            }


        } catch (error) {
            console.error('Error in submitSolution method', error);
        }
        finally {
            this.submitting = false;
            this.isReadonly = false;
            this.testReadonly = false;
            

        }
    }
    showNewAchievements() {
        this.template.querySelector('c-show-achievement-modal').openModal(this.unlockedAchievements);
        
    }

}
