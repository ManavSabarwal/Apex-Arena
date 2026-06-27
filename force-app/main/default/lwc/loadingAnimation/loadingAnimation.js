import { LightningElement } from 'lwc';
import meditatingApe from '@salesforce/resourceUrl/meditatingApe';

export default class LoadingAnimation extends LightningElement {

    gifUrl=meditatingApe;
    message='Just a moment';
    loadInterval;

    connectedCallback()
    {
        this.loadInterval=setInterval(()=>{
            if(this.message.endsWith(' . . .'))
            {
                this.message='Just a moment'
            }
            else{
                this.message+=' .';
            }
        },700);
    }

    disconnectedCallback()
    {
        if (this.loadInterval) {
        clearInterval(this.loadInterval);
        this.loadInterval = null;
    }
    }
}