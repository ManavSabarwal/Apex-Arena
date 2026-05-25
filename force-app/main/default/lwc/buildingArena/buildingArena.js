import { LightningElement } from 'lwc';
import invokePrompt from '@salesforce/apex/PromptTemplateController.invokePrompt';
import invokeValidationPromptCoding from '@salesforce/apex/PromptTemplateController.invokeValidationPromptCoding';
import saveAttemptedChallenge from '@salesforce/apex/recordController.saveAttemptedChallenge';
import createChallengeAttempt from '@salesforce/apex/recordController.createChallengeAttempt';
import updateApexArenaUser from '@salesforce/apex/recordController.updateApexArenaUser';
import { NavigationMixin } from 'lightning/navigation';


export default class buildingArena extends NavigationMixin(LightningElement) {

    loginName='';
    problem;
    scenario='';
    textAreacode='';
    constraints=''
    expectedOutput='';
    sampleData='';
    requirements='';
    problemTitle='';
    difficulty='Easy';
    type='Sync Apex';
    isLoading=false;
    dataLoaded=false;
    difficultyfromPrompt='';
    result='Pending';
    
    thegood='Submit your code for review...';
    thebad='Submit your code for review...';

    scenarioResults='';
    recommendations='';
    compilationStatus='';

    submitting=false;
    isReadonly=true;
    savedId='';
    passed=false;

    isLoggedIn=false;

    connectedCallback()
    {
        this.loginName=window.sessionStorage.getItem('loginName');
        console.log(this.loginName);
        this.isLoggedIn=window.sessionStorage.getItem('isLoggedIn');
        if(this.loginName ==null || this.isLoggedIn ==null ||this.isLoggedIn ==false)
        {
            this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/'
            }
        });
        }
    }

    openProfile()
    {
        window.sessionStorage.setItem('isLoggedIn',true);
        window.sessionStorage.setItem('loginName',this.loginName);
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/userProfile'
            }
        });
    }

    choosePath()
    {
        window.sessionStorage.setItem('isLoggedIn',true);
        window.sessionStorage.setItem('loginName',this.loginName);
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/choosepath'
            }
        });
    }

    showSampleData()
    {
        console.log('showSampleData clicked ');
        this.template.querySelector('c-sampledata-modal-component').openModal(this.sampleData,this.expectedOutput);
    }

    showResults()
    {
        console.log('showResults clicked ');
        this.template.querySelector('c-show-scenario-results').openModal(this.scenarioResults);
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
        let response='';
        let parsedData='';
        this.textAreacode='';
        this.isReadonly=true;
        this.submitCount=0;


        //reseting the results we get after submitting the solution
        this.result='Pending';
        this.thebad='Submit your code for review...';
        this.thegood='Submit your code for review...';
        this.scenarioResults='';
        this.recommendations='';
        this.compilationStatus='';

        try{
        this.isLoading = true;
        console.log('Generating problem...');
        response = await invokePrompt(
                    { 
                        difficulty: this.difficulty, 
                        type: this.type, 
                        UserName: this.loginName,
                        path:'build'
                    });
        
        this.dataLoaded=true;
        this.problem=response;
        parsedData = JSON.parse(response);
        this.scenario=parsedData.Scenario;
        this.requirements=parsedData.BusinessRequirements;
        this.problemTitle=parsedData.ProblemTitle;
        this.difficultyfromPrompt=parsedData.DifficultyLevel;
        this.constraints=parsedData.TechnicalConstraints;
        this.expectedOutput=parsedData.ExpectedOutput;
        this.sampleData=parsedData.SampleData;
        


        } catch(error){
            console.error('Error generating problem:', error);
            this.dataLoaded=false;
        } finally {
            this.isLoading = false;
            this.isReadonly=false;
            response='';
            try{

                    this.savedId=await saveAttemptedChallenge({
                    problemTitle:this.problemTitle,
                    scenario:this.scenario,
                    errorcode:'',
                    symptoms:this.symptoms,
                    type:this.type,
                    difficultylevel:this.difficulty,
                    username:this.loginName,
                    path:'Coding',
                    sampledata:this.sampleData,
                    expectedOutput:this.expectedOutput,
                    constraints:this.constraints
                })
                console.log('Challenge Saved');
                console.log(this.savedId);

            }
            catch(error)
            {
                console.error('Error Saving Attempted Challenge:', error);
            }

            
        }
    }

    handleCodeChange(event) {
        this.textAreacode = event.target.value;
        console.log('Code updated:', this.textAreacode);
    }

    tabspacing(event){
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

    async submitSolution(){
        try{
            console.log('Submitting solution...');
            this.submitting=true;
            this.isReadonly=true;
            const response = await invokeValidationPromptCoding({ scenario: this.scenario, solution: this.textAreacode,sampleData:this.sampleData,expectedOutput:this.expectedOutput,requirements:this.requirements});
            console.log('Submission Response:', response);
            this.result=response.overallVerdict;
            this.compilationStatus=response.compilationStatus;
            this.thebad =response.badCodeReview;
            this.thegood =response.goodCodeReview;
            this.recommendations =response.recommendedImprovements;
            this.scenarioResults =response.scenarioResults;
            console.log(this.scenarioResults);


            

        }catch(error){
            console.error('Error submitting solution:', error);
        }
        finally{
            this.submitting=false;
            this.isReadonly=false;

            try{

                let saveRes=await createChallengeAttempt(
                    {
                        id:this.savedId,
                        result:this.result,
                        solution:this.textAreacode ,
                        thegood:this.thegood.join(',/n'),
                        thebad:this.thebad.join(',/n')

                    }
                );

                if(saveRes && Object.keys(saveRes).length > 0)
                {
                    console.log(saveRes);

                    if(this.result.toLowerCase().includes('pass'))
                    {
                       let exppoints= this.template.querySelector('c-modal-component').openModal(this.loginName,this.difficultyfromPrompt,saveRes.oldresult,saveRes.attempt,'coding');
                       if(exppoints!=0)
                       {
                            let updateResponse=await updateApexArenaUser({
                                    userName:this.loginName,
                                    expPoints:exppoints

                            });
                            console.log(updateResponse + ' - '+ exppoints);
                        }
                    }

                }
                else
                {
                    console.log(saveRes);
                    console.log('Error in updating EXP Points. Check logs');
                }

            }
            catch(error)
            {
                console.log('Error in Creating Attempt');
                console.log(error);
            }
        }
    }

}
