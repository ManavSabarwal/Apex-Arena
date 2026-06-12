import { LightningElement,api,track } from 'lwc';


export default class ModalComponent extends LightningElement {

    @track showModal = false;
    exppoints='';
    multiplier=1;
    message=''
    updateResponse='';

    @api openModal(message,expPoints) {
        this.showModal = true;
        this.message=message;
        this.exppoints=expPoints;
    }

    @api closeModal() {
        this.exppoints=0;
        this.showModal = false;
        const customEvent = new CustomEvent('closemodal', {
            detail: 'closed'
        });

        this.dispatchEvent(customEvent);
    }
}