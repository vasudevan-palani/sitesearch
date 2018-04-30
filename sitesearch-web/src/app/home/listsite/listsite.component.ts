import { Component } from '@angular/core';
import { SiteService } from 'app/services/site.service';
import { UserService } from 'app/services/user.service';
import { PaymentService } from 'app/services/payment.service';
import { LogService } from 'app/services/log.service';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { User } from 'app/defs/user';
import {Router} from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import { UserPreferences } from 'app/defs/UserPreferences';

@Component({
  selector: 'home',
  templateUrl: 'listsite.component.html',
  styleUrls: ['listsite.component.scss']
})
export class ListSiteComponent {

  public sites : any;

  public user : User;

  public preferences : UserPreferences;

  public account : any;

  public customer : any;

  constructor(
    private userSvc : UserService,
    private siteSvc : SiteService,
    private log : LogService,
    private router:Router,
    private pymtSvc : PaymentService,
    private db: AngularFireDatabase){

      this.account = {next_charge_date : '2015-11-23 12:23:34'};
  }

  ngOnInit(){
    window.scrollTo(0, 0);

    let initialized = false;

    this.userSvc.user.subscribe((user: User) => {
      this.user = user;

      this.log.debug("ngOnInit/user",user);

      // Initialize only once
      //
      if( user.loginStatus == true && initialized == false){
        this.log.debug("ngOnInit/user/initialized",user);
        initialized =true;
        this.getWebsites();
      }

    });

    this.userSvc.preferences.subscribe((preferences:UserPreferences)=>{
      this.log.debug("ngOnInit/preferences",preferences);
      this.preferences = preferences;

      if(preferences.customerId != undefined){
        this.log.debug("ngOnInit/preferences/customerId",preferences);
        this.getSubscription();
      }
    });

  }

  getWebsites(){
    this.log.debug("getWebsites/",this.user);
    this.db.list("websites/",{
      query : {
        orderByChild : 'userId',
        equalTo : this.user.id
      }
    }).subscribe(sites => {
      this.log.debug("getWebsites/sites",sites);
      sites.forEach(site => {
        site.pageCount = this.siteSvc.getPageCount(site);
        this.log.debug("getWebsites/site",site);
      });

      this.sites = sites;
    });
  }

  getSubscription(){
    // this.pymtSvc.details(token,this.preferences.customerId).subscribe(response => {
    //   this.customer = response.customer;
    //
    //   if(this.customer && this.customer.subscription){
    //     console.log(this.customer.subscription);
    //     this.user.account.subscription = this.customer.subscription;
    //     this.userSvc.updatePlanId(this.customer.subscription.plan_id);
    //     this.customer.subscription.end_date = new Date(this.customer.subscription.end_date*1000);
    //   }
    //
    // });
  }

  delete(data){
    this.siteSvc.remove(data.id);
  }

  crawl(site){
    this.userSvc.getToken().then(token => {
      this.siteSvc.crawl(site.id,token);
    });

  }

  select(site){
    console.log(site);
    this.router.navigate(['/home/site'],{queryParams:{'siteid':site.$key}});
  }
}
