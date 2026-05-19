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
    confirmPassword='';
    passwordMismatch=false;
    isLoading=false;
    
    handleUsernameChange(event)
    {
        this.username=event.target.value;
        console.log(this.username);
    }

    handlePasswordChange(event)
    {
        this.password=event.target.value;
    }

    handleConfirmPasswordChange(event)
    {
        this.confirmPassword=event.target.value;
        if(this.password!=this.confirmPassword)
        {
         this.passwordMismatch=true;   
        }
        else{
            this.passwordMismatch=false;
        }
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
                this.isLoading=true;
                setTimeout(()=>{
                    console.log('Loading...');
                    console.log(result);
                    window.sessionStorage.setItem('loginName',result);
                    window.sessionStorage.setItem('isLoggedIn',true); 

                },2000);
                
            }
              
        }
        catch(error)
        {
            console.log(error);
            alert('Login failed. Please try again.');
        }
        finally{
            this.isLoading=false;
        }
    }

    async signUp(event)
    {
        try{
            this.isLoading = true;
            console.log('signup pressed');
        const result=await signupHelper({Username:this.username,Password:this.confirmPassword});
        console.log(result);
        if(result=='SignUp Successful')
        {
            this.dispatchEvent(new ShowToastEvent({
                title:'Signup Successful',
                variant:'success'
            }))
        }
        else{
            this.dispatchEvent(new ShowToastEvent({
                title:'Signup Failed',
                message:result,
                variant:'error'
            }))
        }
    }
        
        catch(error)
        {
            console.log(error);
            this.dispatchEvent(new ShowToastEvent({
                title:'Signup Failed',
                message:error,
                variant:'error'
            }))
        }
        finally{
            this.isLoading=false;
        }
        
        
    }
}