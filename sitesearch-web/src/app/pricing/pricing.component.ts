import { Component, OnInit } from '@angular/core';
import { SiteService } from 'app/services/site.service';
import { UserService } from 'app/services/user.service';
import { PaymentService } from 'app/services/payment.service';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from 'app/defs/user';
import { UserAccountStatus } from 'app/defs/userstatus';

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss']
})
export class PricingComponent implements OnInit {

  constructor(private siteSvc : SiteService,private pymtSvc : PaymentService, private userSvc : UserService,private route:ActivatedRoute){}
  private user : User;
  private customer : any;


  public currentPlan : string;
  public showTrial : boolean;


  ngOnInit(){
    var queryParams = this.route.snapshot.queryParams;

    this.showTrial = queryParams["showTrial"] != undefined &&  queryParams["showTrial"] == "false"? false : true;

    this.userSvc.user.subscribe((user: User) => {
    	this.user = user;
      if(this.user && this.user.account){
        this.showTrial = this.user.account.trial == undefined;
        console.log("existinguser value",this.user);
        if(this.user.account.subscription) {
          this.currentPlan = this.user.account.subscription.planId;
        }
      }


      this.userSvc.getToken().then(token => {
        this.userSvc.getPreferences(this.user).then((user:any) => {
          this.user = user;
          
          this.pymtSvc.details(token,this.user).first().subscribe(response => {
            this.customer = response.customer;
            this.showTrial = this.user.account.trial == undefined;

            if(this.customer && this.customer.subscription) {
              this.currentPlan = this.customer.subscription.plan_id;

              this.customer.subscription.end_date = new Date(this.customer.subscription.end_date*1000);
            }

          });
        });
      });
    });

  }

}
