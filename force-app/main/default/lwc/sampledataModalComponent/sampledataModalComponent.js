import { LightningElement, api } from 'lwc';

export default class SampledataModalComponent extends LightningElement {

    showModal = false;
    sampleData = [];


    @api openModal(sampleData) {
        this.showModal = true;
        this.sampleData = JSON.parse(sampleData);
        console.log(this.sampleData);

        this.sampleData = this.sampleData.map((item, index) => {
            return {
                ...item,
                id: index
            };
        });
        console.log(Array.isArray(this.sampleData));
        console.log(typeof this.sampleData);


    }

    @api closeModal() {
        this.showModal = false;
    }




}