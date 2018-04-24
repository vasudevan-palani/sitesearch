import { Component, OnInit } from '@angular/core';
import { SiteService } from 'app/services/site.service';
import { PaymentService } from 'app/services/payment.service';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from 'app/services/user.service';
import { AngularFireDatabase } from 'angularfire2/database';
import { User } from 'app/defs/user';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
@Component({
  selector: 'app-siteoverview',
  templateUrl: './siteoverview.component.html',
  styleUrls: ['./siteoverview.component.scss']
})
export class SiteOverviewComponent implements OnInit {

  constructor(
    private siteSvc : SiteService,
    private userSvc : UserService,
    private pymtSvc : PaymentService,
    private db : AngularFireDatabase,
    private route : ActivatedRoute,
    private router:Router){

  }

  public site:any;
  public user:User;

  public fromItem:number;
  public size:number;
  public totalPages:number;

  public pages:any[];
  public crawlhist:any[];
  public crawls:any[];
  public recrawls:any[];


  public invoices:any[];

  ngOnInit() {
    var siteid = "";
    this.fromItem=0;
    this.size=10;
    this.crawlhist = [];
    this.crawls = [];
    this.recrawls = [];
    this.route.queryParams.subscribe(params => {
      if(params['siteid']){
        siteid = params['siteid'];
        this.db.object("/websites/"+siteid).subscribe(site => {

          this.site = site;
          this.getPages();
          this.getCrawls();
          this.site.pageCount = this.siteSvc.getPageCount(this.site);
          this.site.created = new Date(this.site.created * 1000);
          console.log(this.site);
        });
      }
    });

    this.userSvc.user.debounceTime(100).first().subscribe((user: User) => {
      this.user = user;
      this.userSvc.getToken().then(token => {
        this.userSvc.getPreferences(this.user).then((user:any) => {
          this.user = user;
          console.log(this.user);
          if(this.user.customerid){
            this.pymtSvc.invoices(token,this.user.customerid).first().subscribe(invoices => {
              this.invoices = invoices.map(invoice => {
                invoice.date = new Date(invoice.date * 1000);
                return invoice;
              });
            });
          }
        });
      });
    });
  }
  crawl(site){
      this.siteSvc.recrawl(site.$key);
  }

  getNextPages(){
    console.log(this.fromItem);

    this.fromItem = this.fromItem + this.size > this.totalPages ? this.fromItem : this.fromItem + this.size;
    console.log(this.fromItem);
    this.getPages();
  }
  getPrevPages(){
    this.fromItem = this.fromItem - this.size < 0 ? 0 : this.fromItem - this.size;
    this.getPages();
  }
  getPages(){
    this.siteSvc.getPages(this.site.$key,this.fromItem,this.size).then((pages:any) => {
      console.log(pages);
      if(pages.results != undefined){
        this.pages = pages.results.hits.hits;
        this.totalPages = pages.results.hits.total;
      }
      else {
        this.pages = [];
        this.totalPages = 0;
      }
    });
  }

  getCrawls(){
    console.log("in getCrawls",this.site);
    this.db.list("/crawls/"+this.site.$key).subscribe(crawls => {
      this.crawlhist = crawls;
    });

    this.db.list("/crawlq", {
      query : {
        orderByChild:"siteKey",
        equalTo:this.site.$key
      }

    }).subscribe(recrawls => {
      this.crawls = recrawls;
    });

    this.db.list("/recrawlq", {
      query : {
        orderByChild:"siteKey",
        equalTo:this.site.$key
      }

    }).subscribe(recrawls => {
      this.recrawls = recrawls;
    });

  }

  delete(data){
    this.siteSvc.remove(data.$key);
    this.router.navigate(['/home/list']);
  }

  select(site){
    this.router.navigate(['/home/site'],{queryParams:{'siteid':site.$key}});
  }
}
