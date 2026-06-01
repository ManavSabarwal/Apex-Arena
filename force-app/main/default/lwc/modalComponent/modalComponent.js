import { LightningElement,api,track } from 'lwc';


export default class ModalComponent extends LightningElement {

    @track showModal = false;
    exppoints=0;
    multiplier=1;
    message=''
    updateResponse='';

    @api openModal(username,level,oldresult,attempt,type,score) {
        this.showModal = true;
        const scoreValue = parseInt(score, 10);
        const diffLevel=level.toLowerCase();
        if(oldresult.toLowerCase().includes('pass'))
        {
            this.exppoints=0;
            this.message='Challenge already completed successfully — XP reward unavailable for repeat clears.';
        }
        else{
            
            if(type==='debug')
            {
                if(attempt==1)
                {
                    this.multiplier=1.5;
                    this.message='First attempt! 50% XP bonus awarded.';
                }
                switch (diffLevel)
                {
                    case 'beginner': this.exppoints=(50*this.multiplier); break;
                    case 'apprentice': this.exppoints=(100*this.multiplier); break;
                    case 'skilled developer': this.exppoints=(200*this.multiplier); break;
                    case 'expert architect': this.exppoints=(400*this.multiplier); break;
                    case 'Legendary Salesforce Hero': this.exppoints=(800*this.multiplier); break;
                    default: this.exppoints=0;break;

                }
            }
            else if(type==='coding')
            {
                if(scoreValue>=95)
                {
                    this.multiplier=1.20;
                    this.message='Score of 95% or above achieved! 20% XP bonus awarded.';
                } 
                switch (diffLevel)
                {
                    case 'beginner': this.exppoints=Math.round(80*this.multiplier); break;
                    case 'apprentice': this.exppoints=Math.round(160*this.multiplier); break;
                    case 'skilled developer': this.exppoints=Math.round(320*this.multiplier); break;
                    case 'expert architect': this.exppoints=Math.round(640*this.multiplier); break;
                    case 'Legendary Salesforce Hero': Math.round(1280*this.multiplier); break;
                    default: this.exppoints=0;break;

                }

            }

            return this.exppoints;

        //call method to update exp points in apex Arena User
    }

        
    }

    @api closeModal() {
        this.exppoints=0;
        this.showModal = false;
    }
}