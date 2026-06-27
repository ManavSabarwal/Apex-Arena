import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class NavBarComponent extends NavigationMixin(LightningElement) {

    
    loginName;

    isLogged()
    {
        if(window.sessionStorage.getItem('loginName')!=null && window.sessionStorage.getItem('isLoggedIn'))
            return true
        else
            return false;
    }

    connectedCallback()
    {
        this.loginName=window.sessionStorage.getItem('loginName');
        if(!this.isLogged)
        {
            this.navigateTo('/');
        }
    }

    persistLogin() {
        window.sessionStorage.setItem('isLoggedIn', 'true');
        window.sessionStorage.setItem('loginName', this.loginName);
    }

    navigateTo(url)
    {
        this.persistLogin();
        const eve=new CustomEvent('navigate',{detail:{
            'navigating':true
        }});
        this.dispatchEvent(eve);
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url
            }
        });

    }
    choosePath()
    {
        this.navigateTo('/choosepath');
    }
    openProfile()
    {
        this.navigateTo('/userProfile');
    }
}