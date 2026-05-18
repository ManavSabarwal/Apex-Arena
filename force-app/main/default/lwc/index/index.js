import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import loginHelper from '@salesforce/apex/loginSignupController.loginHelper';
import signupHelper from '@salesforce/apex/loginSignupController.signupHelper';

export default class Index extends LightningElement {

    username="";
    password="";
    signup=false;
    isLoggedIn=false;
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

        try{
            const result = await loginHelper({Username:this.username,Password:this.password});
            if(result==null)
            {
                this.isLoggedIn=false;
                this.dispatchEvent(new ShowToastEvent({
                    title: "Login Failed",
                    message: "Invalid username or password.",
                    variant: "error"
                }));
            }
            else{
                this.isLoggedIn=true;
                this.loginName=result;
                console.log(result);
                window.sessionStorage.setItem('loginName',result);
                window.sessionStorage.setItem('isLoggedIn',true); 
            }
              
        }
        catch(error)
        {
            console.log(error);
            alert('Login failed. Please check your credentials.');
        }
    }

    async signUp(event)
    {
        console.log('signup pressed');
        const result=await signupHelper({Username:this.username,Password:this.password});
        console.log(result);
    }
}