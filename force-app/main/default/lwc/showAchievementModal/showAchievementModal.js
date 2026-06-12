import { LightningElement ,api} from 'lwc';
import ACHIEVEMENT_ICONS from '@salesforce/resourceUrl/ApexArenaAchievementIcons';
import Trophy from '@salesforce/resourceUrl/Trophy';


export default class ShowAchievementModal extends LightningElement {

    showModal=false;
    single=true;
    achievement=[];
    count=0;
    trophy=Trophy;
    
    @api
    openModal(unlockedAchievements)
    {
        this.showModal=true;
        if(unlockedAchievements.length==1)
        {
            this.single=true;
        }
        else if(unlockedAchievements.length>1) {
            this.single=false;
        }
        this.achievement=unlockedAchievements;
        this.count=unlockedAchievements.length;
        this.achievement.forEach(item=>{
            item.iconUrl=item.iconUrl.replace('/resource/ApexArenaAchievementIcons',ACHIEVEMENT_ICONS);
        })
        console.log(unlockedAchievements[0].iconUrl);
    }


    closeModal()
    {
        this.showModal=false;
    }
}