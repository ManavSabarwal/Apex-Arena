import { LightningElement ,api} from 'lwc';

export default class ShowScenarioResults extends LightningElement {

    @api showModal=false;

    results = [];

    @api openModal(data)
    {
        this.showModal=true;
        console.log('in Modal showModal: '+this.showModal);

        this.results=data;
        console.log('Received:', this.results);
    }

    @api closeModal()
    {
        this.showModal=false;
    }

    get resultsWithStyle() {
    return this.results.map(r => ({
        ...r,
        statusClass: r.status === 'Pass' ? 'pass' : 'fail'
    }));
}

}