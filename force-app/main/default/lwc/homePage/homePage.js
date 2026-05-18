import { LightningElement } from 'lwc';

export default class HomePage extends LightningElement {

    loginName='';

    connectedCallback()
    {
        this.loginName=window.sessionStorage.getItem('loginName');
        this.isLoggedIn = window.sessionStorage.getItem('isLoggedIn');
    }


    logoutMethod(event)
    {
        console.log('Logging out...');
        window.sessionStorage.removeItem('loginName');
        window.sessionStorage.setItem('isLoggedIn',false);
        this.loginName='';
        this.isLoggedIn=false;
    }
}