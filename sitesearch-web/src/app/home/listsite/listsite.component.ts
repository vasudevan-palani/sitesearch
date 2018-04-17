import { Component } from '@angular/core';
import { SiteService } from 'app/services/site.service';
import { UserService } from 'app/services/user.service';
import { PaymentService } from 'app/services/payment.service';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { User } from 'app/defs/user';
import {Router} from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';

@Component({
  selector: 'home',
  templateUrl: 'listsite.component.html',
  styleUrls: ['listsite.component.scss']
})
export class ListSiteComponent {

  public sites : Observable<any[]>;

  public user : User;

  public account : any;

  public customer : any;

  constructor(
    private userSvc : UserService,
    private siteSvc : SiteService,
    private router:Router,
    private pymtSvc : PaymentService,
    private db: AngularFireDatabase){
      this.account = {next_charge_date : '2015-11-23 12:23:34'};
  }

  ngOnInit(){
    window.scrollTo(0, 0);
    this.userSvc.user.debounceTime(100).first().subscribe((user: User) => {
      this.user = user;
      this.sites = this.siteSvc.list(this.user.id).map(siteList => {
        return siteList.map(site => {
          site.pageCount = this.siteSvc.getPageCount(site);
          site.created = new Date(site.created * 1000);
          console.log(site);
          return site;
        });
      });

      this.userSvc.getToken().then(token => {
        this.userSvc.getPreferences(this.user).then((user:any) => {
          this.user = user;
          console.log(this.user);
          if(this.user.customerid){
            this.pymtSvc.details(token,this.user).first().subscribe(response => {
              this.customer = response.customer;

              if(this.customer && this.customer.subscription){
                console.log(this.customer.subscription);
                this.user.account.subscription = this.customer.subscription;
                this.customer.subscription.end_date = new Date(this.customer.subscription.end_date*1000);
              }

            });
          }
        });
      });



    });
  }

  getPageCount(site):Observable<any>{
    return new Observable<any>((observer:any)=> {
      this.siteSvc.getPageCount(site).subscribe(response => {
        console.log(response);
        observer.next(response);
      },error => {
        observer.next(0);
      });
    });
  }

  delete(data){
    this.siteSvc.remove(data.id);
    this.userSvc.getToken().then(token => {
      data.token = token;
      this.siteSvc.deleteCollection(data).subscribe(response => {
        console.log(response);
      });

      this.pymtSvc.details(token,this.user).first().subscribe(customer => {
        this.customer = customer;
      })
    });
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
