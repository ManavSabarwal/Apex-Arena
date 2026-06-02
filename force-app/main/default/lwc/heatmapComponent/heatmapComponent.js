import { LightningElement ,api} from 'lwc';
import getHeatmapData from '@salesforce/apex/recordController.getHeatmapData'; 

export default class HeatmapComponent extends LightningElement {

    @api username;
    heatmapData = [];
    connectedCallback() {
        this.loadHeatmapData();
    }

    loadHeatmapData() {
        getHeatmapData({ username: this.username })
            .then(result => {
                this.heatmapData = result.map(item => ({  date: item.date,
                        count: item.count,
                        cssClass: item.cssClass,
                        tooltip: item.tooltip,
                        month: new Date(item.date).toLocaleString('default', { month: 'long' }),
                        year: new Date(item.date).getFullYear()

        }));
            })
            .catch(error => {
                console.error('Error fetching heatmap data:', error);
            });
    }
}