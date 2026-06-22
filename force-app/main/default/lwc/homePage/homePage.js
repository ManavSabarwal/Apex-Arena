import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class HomePage extends NavigationMixin(LightningElement) {

    loginName='';
    debuggingArena=false;
    buildingArena=false;
    homepage=true;
    isLoggedIn=false;
    handleBackButton ='';

    connectedCallback()
    {
        this.loginName=window.sessionStorage.getItem('loginName');
        console.log('HomePage CC: '+this.loginName);
        this.isLoggedIn = window.sessionStorage.getItem('isLoggedIn');
        if(this.loginName ==null || this.isLoggedIn ==null ||this.isLoggedIn ==false)
        {
            this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/'
            }
        });
        }
        this.handleBackButton = this.disableBack.bind(this);

        history.pushState(null, null, location.href);

        window.addEventListener('popstate', this.handleBackButton);
    }

    disconnectedCallback() {
        window.removeEventListener('popstate', this.handleBackButton);
    }

    disableBack() {
        history.pushState(null, null, location.href);
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

    startDebugging(event){
        console.log('Navigating to Debugging Arena...');
        window.sessionStorage.setItem('isLoggedIn',true);
        window.sessionStorage.setItem('loginName',this.loginName);
        console.log('HomePage : '+this.loginName);
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/debuggingArena'
            }
        });
    }

    startBuilding(event){
        console.log('Navigating to Building Arena...');
        window.sessionStorage.setItem('isLoggedIn',true);
        window.sessionStorage.setItem('loginName',this.loginName);
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/buildinarena'
            }
        });
        
    }

    startQuizing()
    {
        console.log('Navigating to Quiz Arena...');
        window.sessionStorage.setItem('isLoggedIn',true);
        window.sessionStorage.setItem('loginName',this.loginName);
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/quizarena'
            }
        });
    }

}