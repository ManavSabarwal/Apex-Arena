import { LightningElement,api,track } from 'lwc';

export default class ModalComponent extends LightningElement {

    @track showModal = false;
    exppoints=0;
    multiplier=1;

    @api openModal(level,oldresult,attempt) {
        if(oldresult.toLowerCase().includes('pass'))
        {
            this.exppoints=0;
        }
        else{
         const diffLevel=level.toLowerCase();
         if(attempt.includes('1'))
         {
            this.multiplier=1.20;
            message='First Attempt - +20% EXP Points';
         }
        switch (diffLevel)
        {
            case 'beginner': this.exppoints=75*this.multiplier; break;
            case 'apprentice': this.exppoints=150*this.multiplier; break;
            case 'skilled developer': this.exppoints=250*this.multiplier; break;
            case 'expert architect': this.exppoints=500*this.multiplier; break;
            case 'Legendary Salesforce Hero': this.exppoints=1000*this.multiplier; break;
            default: this.exppoints=0;break;

        }
    }

        this.showModal = true;
    }

    @api closeModal() {
        this.exppoints=0;
        this.showModal = false;
    }
}