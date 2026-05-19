import { LightningElement } from 'lwc';
import invokePrompt from '@salesforce/apex/PromptTemplateController.invokePrompt';

export default class DebuggingArena extends LightningElement {

    loginName='';
    problem;
    scenario='';
    code='';
    symptoms='';
    
    connectedCallback()
    {
        this.loginName=window.sessionStorage.getItem('loginName');
    }

    async generateProblem(event){
        console.log('Generating problem...');
        const response = await invokePrompt({ difficulty: 'Beginner', type: 'Sync' });
        console.log('Generated Problem:', response);
        this.problem=response;
        console.log('Type of this.problem:', typeof this.problem);
        const parsedData = JSON.parse(response);
        this.scenario=parsedData.Scenario;
        this.code=parsedData.ErrorCode.replace('```apex','').replace('```','');
        this.symptoms=parsedData.Requirements;

    }
}