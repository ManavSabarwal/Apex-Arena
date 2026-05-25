import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getAttemptedChallenges from '@salesforce/apex/recordController.getAttemptedChallenges';
import getUserandChalengeDetails from '@salesforce/apex/recordController.getUserandChalengeDetails';

export default class UserProfile extends NavigationMixin(LightningElement) {
    loginName='';
    limitSize='4';
    isLoggedIn=false;
    userLevel='Beginner';
    userAbout='Code. Compete. Conquer. Forge your legacy in the Apex Arena.';
    joinDate='May 25, 2026';
    expPoints='899';
    submissions=0;
    solved=0;
    easy=0;
    medium=0;
    hard=0;
    wrong=0;
    acceptanceRate=0;
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
            else{
                getUserandChalengeDetails({
                                username: this.loginName
                        })

                .then(result => {

                        console.log(result);
                        this.bifData(result);
                })

                .catch(error => {

                        console.log(error);
                });
            }
            
        }

        bifData(result)
        {
            console.log('In Function');
            try{
            this.submissions = result.length;
                        for(let res of result)
                        {
                            if(res.Result__c=='Pass')
                            {
                                this.solved++;
                            }
                            if(res.Attempted_Challenge__r.DifficultyLevel__c=='Easy')
                            {
                                this.easy++;
                            }
                            else if(res.Attempted_Challenge__r.DifficultyLevel__c=='Medium')
                            {
                                this.medium++;
                            }
                            else if(res.Attempted_Challenge__r.DifficultyLevel__c=='Hard')
                            {
                                this.hard++;
                            }
                            
                        }
                        this.wrong=this.submissions-this.solved;
                        this.acceptanceRate=((this.solved/this.submissions)*100).toFixed(2);
                        this.expPoints=result[0].Attempted_Challenge__r.Apex_Arena_User__r.Experience_Points__c;
                        this.joinDate= new Date(result[0].Attempted_Challenge__r.Apex_Arena_User__r.CreatedDate)
                                        .toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    day: '2-digit',
                                                    year: 'numeric'
                                        });
                        this.userLevel=result[0].Attempted_Challenge__r.Apex_Arena_User__r.Level__c;
                    }
                    catch(error)
                    {
                        console.log(error);
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
        logoutFunc()
        {
            window.sessionStorage.removeItem('loginName');
            window.sessionStorage.removeItem('isLoggedIn');
            this[NavigationMixin.Navigate]({
                type: 'standard__webPage',
                attributes: {
                    url: '/'
                }
            });
        }

}