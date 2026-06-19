import { LightningElement,api } from 'lwc';

export default class SearchResultModal extends LightningElement {


    showModal=false;
    users=[];
    challenges=[];
    @api openModal(resultList)
    {
        this.showModal=true;
        this.users=resultList.users;
        this.challenges=resultList.challenges;

        console.log('Challenges: ',this.challenges);
        console.log('Users: ',this.users);
    }
}