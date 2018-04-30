import { Component } from '@angular/core';
import { SiteService } from 'app/services/site.service';
import { UserService } from 'app/services/user.service';
import { PaymentService } from 'app/services/payment.service';
import { LogService } from 'app/services/log.service';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { User } from 'app/defs/user';
import {Router} from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/debounceTime';
import { UserPreferences } from 'app/defs/UserPreferences';
import { OnDestroy } from '@angular/core';


@Component({
  selector: 'home',
  templateUrl: 'listsite.component.html',
  styleUrls: ['listsite.component.scss']
})
export class ListSiteComponent implements OnDestroy {

  public sites : any;

  public user : User;

  public preferences : UserPreferences;

  public account : any;

  public customer : any;

  private _userSubscription :  Subscription;

  private _preferencesSubscription :  Subscription;

  private _websiteSubscription : Subscription;

  private firstOfNextMonth : Date;

  public error : any;

  public trialWarning : boolean;

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
    let today = new Date();
    today.setMonth((new Date()).getMonth()+1);
    today.setDate(1);
    this.firstOfNextMonth = today;

    this.trialWarning = false;

    this._userSubscription = this.userSvc.user.subscribe((user: User) => {
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

    this._preferencesSubscription = this.userSvc.preferences.subscribe((preferences:UserPreferences)=>{
      this.log.debug("ngOnInit/preferences",preferences);
      this.preferences = preferences;

      // Its a new user when preferences are null, enroll into trial
      //
      if(preferences.account == undefined){
        this.subscribeForTrial();
      }

      if(preferences.customerId != undefined){
        this.log.debug("ngOnInit/preferences/customerId",preferences);
        this.getPaymentDetails();
      }

      if(preferences.account &&
        preferences.account.status == 'TRIAL' &&
        preferences.account.trial &&
        preferences.account.trial.endDate < Date.now()+432000000){
        this.trialWarning = true
      }
    });

  }

  addWebsite(){
    if(this.preferences.account.status == "TRIAL")
    {
      if(this.sites.length >0 ){
        this.error = "Kindy ACTIVATE your account to add more websites.";
        setTimeout(()=>{
          this.error = undefined
        },5000);
      }
      else {
        this.router.navigate(['/home/new']);
      }
    } else {
      this.router.navigate(['/home/new']);
    }
  }

  getWebsites(){
    this.log.debug("getWebsites/",this.user);
    this._websiteSubscription = this.db.list("websites/",{
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

  subscribeForTrial(){
    this.userSvc.subscribeForTrial();
  }

  getPaymentDetails(){
    this.pymtSvc.details(this.preferences.customerId).subscribe(response => {
      if(response.customer && response.customer.card){
        this.userSvc.updateCard(response.customer.card);
      }
    });
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

  ngOnDestroy(){
    this._userSubscription.unsubscribe();
    this._preferencesSubscription.unsubscribe();
    this._websiteSubscription.unsubscribe();
  }
}
