import { LightningElement,api } from 'lwc';
import PROFILE_PIC from '@salesforce/resourceUrl/ApexArenaPfP';

export default class ChangeProfilepicModal extends LightningElement {

    showModal=false;

    selectedAvatar;

    profilePictures = Array.from({ length: 10 }, (_, index) => {
        const fileName = `pro${index + 1}.jpg`;

        return {
            id: index + 1,
            name: fileName,
            url: `${PROFILE_PIC}/ApexArenaPfP/${fileName}`
        };
    });

    get buttonDisabled()
    {
        return !this.selectedAvatar ;
    }

    handleAvatarClick(event) {
        this.selectedAvatar = event.currentTarget.dataset.url;
    }
    @api
    openModal()
    {
        this.showModal = true;
    }

    @api closeModal() {
        
        this.showModal = false;
        this.selectedAvatar = '';
    }

    setSelectedImage()
    {
        const avatar= this.selectedAvatar;
        const event= new CustomEvent('imagereceived', 
            {detail: 
                { imageLink: avatar}
            });
        this.dispatchEvent(event);

        this.closeModal();
    }
}