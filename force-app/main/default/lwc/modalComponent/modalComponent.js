import { LightningElement,api,track } from 'lwc';

export default class ModalComponent extends LightningElement {

    @track showModal = false;
    exppoints=0;

    @api openModal(level,oldresult) {
        if(oldresult.toLowerCase().includes('pass'))
        {
            this.exppoints=0;
        }
        else{
         const diffLevel=level.toLowerCase();
        switch (diffLevel)
        {
            case 'beginner': this.exppoints=75; break;
            case 'apprentice': this.exppoints=150; break;
            case 'skilled developer': this.exppoints=250; break;
            case 'expert architect': this.exppoints=500; break;
            case 'Legendary Salesforce Hero': this.exppoints=1000; break;
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