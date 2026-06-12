import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import loginHelper from '@salesforce/apex/loginSignupController.loginHelper';
import signupHelper from '@salesforce/apex/loginSignupController.signupHelper';
import { NavigationMixin } from 'lightning/navigation';

export default class Index extends NavigationMixin(LightningElement) {

    username="";
    password="";
    signup=false;
    isLoggedIn=false;
    loginName='';
    confirmPassword='';
    passwordMismatch=false;
    isLoading=false;
    errorMessage='';
    loginError=false;

    connectedCallback()
    {
        this.loginName=window.sessionStorage.getItem('loginName');
        this.isLoggedIn = window.sessionStorage.getItem('isLoggedIn');
        if(this.loginName !=null || this.isLoggedIn !=null ||this.isLoggedIn ==false)
        {
            this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/choosepath'
            }
        });

    }
}

    
    handleUsernameChange(event)
    {
        this.username=event.target.value;
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

    showError(message)
    {
        this.loginError=true;
        this.errorMessage=message;
                setTimeout(()=>{
                    this.loginError=false;
                },3000);
    }


    async login()
    {
        if(this.username=='' || this.password=='')
        {
            this.showError('Please enter your Username and Password.');
        }

        else{

        try{
            const result = await loginHelper({Username:this.username,Password:this.password});
            if(result==null)
            {
                this.isLoggedIn=false;
                this.showError('Invalid Username or Password');
            }
            else{
                this.isLoggedIn=true;
                this.loginName=result;

                this.isLoading=true;
                window.sessionStorage.setItem('loginName',result);
                window.sessionStorage.setItem('isLoggedIn',true); 
                this[NavigationMixin.Navigate]({
                        type: 'standard__webPage',
                        attributes: {
                                        url: '/choosepath'
                                    }
                });


                
            }
              
        }
        catch(error)
        {
            console.log(error);
            this.showError('An error has Occured. Please try again later');
        }
        finally{
            this.isLoading=false;
        }
    }
    }

    async signUp()
    {
        try{
            this.isLoading = true;
        const result=await signupHelper({Username:this.username,Password:this.confirmPassword});
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