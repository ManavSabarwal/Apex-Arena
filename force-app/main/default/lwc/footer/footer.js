import { LightningElement } from 'lwc';

export default class Footer extends LightningElement {

    handleGithub() {
        window.open('https://github.com', '_blank');
    }

    handleLinkedin() {
        window.open('https://linkedin.com', '_blank');
    }
}