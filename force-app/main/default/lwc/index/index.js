import { LightningElement} from 'lwc';
import loginHelper from '@salesforce/apex/loginSignupController.loginHelper';
import signupHelper from '@salesforce/apex/loginSignupController.signupHelper';

export default class Index extends LightningElement {

    username="";
    password="";
    signup=false;
    isLoginPage=true;
    loginName='';
    
    handleUsernameChange(event)
    {
        this.username=event.target.value;
        console.log(this.username);
    }

    handlePasswordChange(event)
    {
        this.password=event.target.value;
    }

    showSignUp(event)
    {
        this.signup=true;
    }

    showlogin(event)
    {
        this.signup=false;
    }

    async login(event)
    {
        const result=await loginHelper({Username:this.username,Password:this.password});
        this.isLoginPage=false;
        this.loginName=result;
        console.log(result);

    }

    async signUp(event)
    {
        console.log('signup pressed');
        const result=await signupHelper({Username:this.username,Password:this.password});
        console.log(result);
    }
}