import { LightningElement ,api} from 'lwc';

export default class SampledataModalComponent extends LightningElement {

    showModal=false;
    sampleData=''
    expectedOutput='';


     @api openModal(sampleData,expectedOutput){
        this.showModal=true;
        this.sampleData=sampleData;
        this.expectedOutput=expectedOutput;

     }

     @api closeModal() {
        this.showModal = false;
    }




}