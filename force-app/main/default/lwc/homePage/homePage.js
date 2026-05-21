import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class HomePage extends NavigationMixin(LightningElement) {

    loginName='';
    debuggingArena=false;
    buildingArena=false;
    homepage=true;
    isLoggedIn=false;

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

    startDebugging(event){
        console.log('Navigating to Debugging Arena...');
        window.sessionStorage.setItem('isLoggedIn',true);
        window.sessionStorage.setItem('loginName',this.loginName);
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/debuggingArena'
            }
        });
    }

    startBuilding(event){
        console.log('Navigating to Building Arena...');
        this.buildingArena = true;
        this.debuggingArena = false;
        this.homepage = false;
        
    }
}