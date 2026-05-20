import { LightningElement } from 'lwc';
import invokePrompt from '@salesforce/apex/PromptTemplateController.invokePrompt';
import invokeValidationPrompt from '@salesforce/apex/PromptTemplateController.invokeValidationPrompt';

export default class DebuggingArena extends LightningElement {

    loginName='';
    problem;
    scenario='';
    code='';
    textAreacode='';
    symptoms='';
    problemTitle='';
    difficulty='Easy';
    type='Sync Apex';
    isLoading=false;
    dataLoaded=false;
    difficultyfromPrompt='';
    result='Pending';
    reason='No Reasoning Yet';
    thegood='';
    thebad='';
    optimizedCode='';
    submitting=false;

    connectedCallback()
    {
        this.loginName=window.sessionStorage.getItem('loginName');
    }

    get resultClass()
    {
        if(this.result==='Pending')
        {
            return 'result-pending';
        }
        else if(this.result==='Pass' || this.result==='PASS' || this.result.toUpperCase().includes('PASS'))
        {
            return 'result-passed';
        }
        else if(this.result==='FAIL' || this.result==='Fail' || this.result.toUpperCase().includes('FAIL'))
        {
            return 'result-failed';
        }
    }

    async generateProblem(event){
        try{
        this.isLoading = true;
        console.log('Generating problem...');
        console.log('Selected Difficulty:', this.difficulty);
        console.log('Selected Type:', this.type); 
        const response = await invokePrompt({ difficulty: this.difficulty, type: this.type });
        console.log('Generated Problem:', response);
        this.dataLoaded=true;
        this.problem=response;
        console.log('Type of this.problem:', typeof this.problem);
        const parsedData = JSON.parse(response);
        this.scenario=parsedData.Scenario;
        this.code=parsedData.ErrorCode.replace('```apex','').replace('```','');
        this.textAreacode=this.code;
        this.symptoms=parsedData.Requirements;
        this.problemTitle=parsedData.ProblemTitle;
        this.difficultyfromPrompt=parsedData.DifficultyMatrixLevel;
        } catch(error){
            console.error('Error generating problem:', error);
            this.dataLoaded=false;
        } finally {
            this.isLoading = false;
        }
    }

    handleCodeChange(event) {
        this.textAreacode = event.target.value;
        console.log('Code updated:', this.textAreacode);
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

    async submitSolution(){
        try{
            console.log('Submitting solution...');
            this.submitting=true;
            const response = await invokeValidationPrompt({ scenario: this.scenario, solution: this.textAreacode});
            console.log('Submission Response:', response);
            const parsedResponse = JSON.parse(response);
            this.result=parsedResponse.Result;
            this.reason=parsedResponse.Reasoning;
            this.thebad=parsedResponse.CodeReviewBad;
            this.thegood=parsedResponse.CodeReviewGood;
            this.optimizedCode=parsedResponse.ArchitectOptimization;
        }catch(error){
            console.error('Error submitting solution:', error);
        }
        finally{
            this.submitting=false;
        }
    }

}
