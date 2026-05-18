import { LightningElement } from 'lwc';

export default class HomePage extends LightningElement {

    loginName='';

    connectedCallback()
    {
        this.loginName=window.sessionStorage.getItem('loginName');
    }

}