import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getAttemptedChallenges from '@salesforce/apex/recordController.getAttemptedChallenges';
import getUserandChalengeDetails from '@salesforce/apex/recordController.getUserandChalengeDetails';
import getSolvedChallenges from '@salesforce/apex/recordController.getSolvedChallenges';


export default class UserProfile extends NavigationMixin(LightningElement) {
    loginName='';
    limitSize='3';
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
    challengeData=[];
    pageSize = 6;
    currentPage = 1;

    totalPages = 0;
    totalRecords = 0;

    showProfile=true;
    selectedCategory='All Categories';
    selectedDifficulty='All Difficulties';
    categoryOptions=[
                {
                    label: "All Categories",
                    value: "All Categories"
                },
                {
                    label: "Synchronous Apex",
                    value: "Sync Apex"
                },
                {
                    label: "Asynchronous Apex",
                    value: "Async Apex"
                },
                {
                    label: "Trigger",
                    value: "Trigger"
                },
                {
                    label: "Test Class",
                    value: "Test Class"
                }
                
            ];
        difficultyOptions=[
            
        {
            label: "All Difficulties",
            value: "All Difficulties"
        },
        {
            label: "Easy",
            value: "Easy"
        },
        {
            label: "Medium",
            value: "Medium"
        },
        {
            label: "Hard",
            value: "Hard"
        }];
        pathOptions=[{
            label:"All Paths",
            value:"All Paths"
            },
        {
            label:"Debugging",
            value:"Debugging"
        },
        {
            label:"Coding",
            value:"Coding"
        }
    ]

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
                                if(res.Attempted_Challenge__r.DifficultyLevel__c=='Easy' )
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
                            
                            
                        }
                        this.wrong=this.submissions-this.solved;
                        this.acceptanceRate=((this.solved/this.submissions)*100).toFixed(2);
                        this.expPoints=result[0].Attempted_Challenge__r.Apex_Arena_User__r.Total_Exp_Points__c;
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
                                                            timeAgo: timeAgo,
                                                        
                                                            };
                            });

                    this.recent4problems.forEach(item => {item.Result__c=item.Result__c.charAt(0).toUpperCase()+item.Result__c.substring(1)});
                    console.log(this.recent4problems);
                }

            else if(error) 
                {

                    console.log(error);
                }
        }

        async viewAllProblems()
        {
            this.showProfile=false;
            console.log('In View All Problems');
            let result= await getSolvedChallenges({
                username:this.loginName,
                pageSize:this.pageSize,
                pageNumber:this.currentPage
            });
            console.log(result);
            this.challengeData=result.records;
            this.challengeData=this.challengeData.map(item => ({
                                ...item,
                                Result__c: item.Result__c?.toUpperCase()
                            }));
            this.challengeData = this.challengeData.map(item => ({

                                ...item,

                                statusIcon:
                                item.Result__c === 'PASS'
                                ? 'utility:success'
                                : item.Result__c === 'FAIL'
                                ? 'utility:error'
                                : 'utility:clock',

                                statusClass:
                                item.Result__c === 'PASS'
                                ? 'pass-icon'
                                : item.Result__c === 'FAIL'
                                ? 'fail-icon'
                                : 'pending-icon'

                    }));
            this.challengeData.forEach(item =>
                                    {
                                        item.LastModifiedDate= new Date(item.LastModifiedDate).toLocaleDateString('en-US', 
                                            {
                                                    month: 'long',
                                                    day: '2-digit',
                                                    year: 'numeric'
                                        });
                                    });

            this.totalPages = result.totalPages;
            this.totalRecords = result.totalRecords;

        }

        async handleNext() {

            if(this.currentPage < this.totalPages){

                this.currentPage++;

                this.viewAllProblems();
            }
        }

        async handlePrevious() {

            if(this.currentPage > 1){

                this.currentPage--;

                this.viewAllProblems();
            }
        }

        async handlePageClick(event){

                this.currentPage =
                    Number(event.target.dataset.page);

                this.viewAllProblems();
            }

        get pageNumbers(){

                let pages = [];

                for(let i = 1; i <= this.totalPages; i++){

                    pages.push({
                        number: i,
                        className:
                            i === this.currentPage
                            ? 'page-btn active'
                            : 'page-btn'
                    });
                }

                return pages;
            }

        get showingText(){

                let start =
                    ((this.currentPage - 1) * this.pageSize) + 1;

                let end =
                    Math.min(
                        this.currentPage * this.pageSize,
                        this.totalRecords
                    );

                return `Showing ${start} to ${end} of ${this.totalRecords} results`;
            }

        backToProfile()
        {
            this.showProfile=true;
        }

        choosePath(){
            window.sessionStorage.setItem('isLoggedIn',true);
            window.sessionStorage.setItem('loginName',this.loginName);
            this[NavigationMixin.Navigate]({
                            type: 'standard__webPage',
                            attributes: {
                                        url: '/choosepath'
                                        }
                        });

        }

        handleCategoryChange(event)
        {
            this.selectedCategory = event.detail.value;
            console.log(this.selectedCategory);
        }
        handleDifficultyChange(event)
        {
            this.selectedDifficulty = event.detail.value;
            console.log(this.selectedDifficulty);
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