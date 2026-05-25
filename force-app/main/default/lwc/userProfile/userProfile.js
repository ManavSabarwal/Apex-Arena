import { LightningElement,wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getAttemptedChallenges from '@salesforce/apex/recordController.getAttemptedChallenges'

export default class UserProfile extends NavigationMixin(LightningElement) {
    loginName='';
    limitSize='4';
    isLoggedIn=false;
    userLevel='Beginner';
    userAbout='Code. Compete. Conquer. Forge your legacy in the Apex Arena.';
    joinDate='May 25, 2026';
    expPoints='899';
    submissions=324;
    winRate=67;
    solved=124;
    easy=76;
    medium=35;
    hard=13;
    wrong=this.submissions-this.solved;
    acceptanceRate=(this.solved/this.submissions)*100;
    recent4problems=[];


    connectedCallback()
        {
            this.loginName=window.sessionStorage.getItem('loginName');
            console.log(this.loginName);
            this.isLoggedIn=window.sessionStorage.getItem('isLoggedIn');
            if(this.loginName ==null || this.isLoggedIn ==null ||this.isLoggedIn ==false)
            {
                this[NavigationMixin.Navigate]({
                type: 'standard__webPage',
                attributes: {
                    url: '/'
                }
            });
            }
        }

        @wire (getAttemptedChallenges,
            {username:'$loginName' , recordLimit: '$limitSize'}
        )
        wiredChallenges({ data, error }) {

             if(data) 
                {

                    console.log(data);

                    this.recent4problems = data.map(record => {

                                                    const modifiedDate =
                                                    new Date(record.LastModifiedDate);

                                                    const now = new Date();

                                                    const diffMs = now - modifiedDate;

                                                    const diffMinutes =
                                                    Math.floor(diffMs / (1000 * 60));

                                                    const diffHours =
                                                    Math.floor(diffMinutes / 60);

                                                    const diffDays =
                                                    Math.floor(diffHours / 24);

                                                    let timeAgo = '';

                                                    if(diffMinutes < 60){

                                                            timeAgo = diffMinutes + ' min ago';
                                                    }
                                                    else if(diffHours < 24){

                                                            timeAgo = diffHours + ' hr ago';
                                                    }
                                                    else{

                                                            timeAgo = diffDays + ' day ago';
                                                    }

                                                    return {
                                                            ...record,
                                                            timeAgo: timeAgo
                                                            };
                            });

                    console.log(this.recent4problems);
                }

            else if(error) 
                {

                    console.log(error);
                }
        }


}