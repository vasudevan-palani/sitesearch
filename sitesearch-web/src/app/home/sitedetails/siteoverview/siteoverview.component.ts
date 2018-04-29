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
    private siteSvc: SiteService,
    private userSvc: UserService,
    private pymtSvc: PaymentService,
    private db: AngularFireDatabase,
    private route: ActivatedRoute,
    private router: Router) {

  }

  public site: any;
  public user: User;

  public fromItem: number;
  public size: number;
  public totalPages: number;

  public pages: any[];
  public crawlhist: any[];
  public crawls: any[];
  public recrawls: any[];

  public isAddInProgress: boolean;

  public showAddUrlsForm: boolean;

  public showAddUrlSuccessMessage: boolean;
  public showAddUrlsErrorMessage : boolean;

  public hasCrawlScheduled:boolean;

  public invoices: any[];

  ngOnInit() {
    var siteid = "";
    this.showAddUrlSuccessMessage = false;
    this.showAddUrlsErrorMessage = false;
    this.showAddUrlsForm = false;
    this.hasCrawlScheduled = false;
    this.fromItem = 0;
    this.size = 10;
    this.crawlhist = [];
    this.crawls = [];
    this.recrawls = [];
    this.route.queryParams.subscribe(params => {
      if (params['siteid']) {
        siteid = params['siteid'];
        this.db.object("/websites/" + siteid).subscribe(site => {

          this.site = site;
          this.getPages();
          this.getCrawls();
          this.site.pageCount = 0;
          this.siteSvc.getPageCount(this.site).subscribe(count => { this.site.pageCount = count });
          this.site.created = new Date(this.site.created * 1000);
          console.log(this.site);
        });
      }
    });

    this.userSvc.user.debounceTime(100).first().subscribe((user: User) => {
      this.user = user;
      this.userSvc.getToken().then(token => {
        this.userSvc.getPreferences(this.user).then((user: any) => {
          this.user = user;
          console.log(this.user);
          if (this.user.customerid) {
            this.pymtSvc.invoices(token, this.user.customerid).first().subscribe(invoices => {
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
  crawl(site) {
    this.siteSvc.recrawl(site.$key);
  }

  getNextPages() {
    console.log(this.fromItem);

    this.fromItem = this.fromItem + this.size > this.totalPages ? this.fromItem : this.fromItem + this.size;
    console.log(this.fromItem);
    this.getPages();
  }
  getPrevPages() {
    this.fromItem = this.fromItem - this.size < 0 ? 0 : this.fromItem - this.size;
    this.getPages();
  }
  getPages() {
    this.siteSvc.getPages(this.site.$key, this.fromItem, this.size).then((pages: any) => {
      console.log(pages);
      if (pages.results != undefined) {
        this.pages = pages.results.hits.hits;
        this.totalPages = pages.results.hits.total;
      }
      else {
        this.pages = [];
        this.totalPages = 0;
      }
    });
  }

  getCrawls() {
    console.log("in getCrawls", this.site);
    this.db.list("/crawls/" + this.site.$key).subscribe(crawls => {
      this.crawlhist = crawls;
    });

    this.db.list("/crawlq", {
      query: {
        orderByChild: "siteKey",
        equalTo: this.site.$key
      }

    }).subscribe(recrawls => {
      this.crawls = recrawls;
      this.crawls.forEach(crawl => {
        if(crawl.status == "SCHEDULED"){
          this.hasCrawlScheduled = true;
        }
      });
    });

    this.db.list("/recrawlq", {
      query: {
        orderByChild: "siteKey",
        equalTo: this.site.$key
      }

    }).subscribe(recrawls => {
      this.recrawls = recrawls;
      this.recrawls.forEach(crawl => {
        if(crawl.status == "SCHEDULED"){
          this.hasCrawlScheduled = true;
        }
      });
    });

  }

  addUrls(data) {
    this.isAddInProgress = true;
    console.log("Adding urls : ", data);

    let urls = [];

    let validUrls:boolean = true;

    if(data.urls == undefined || data.urls == null || data.urls.length == 0){
      this.showAddUrlsErrorMessage = true;
      this.isAddInProgress = false;
      setTimeout(() => {
        this.showAddUrlsErrorMessage = false;
      }, 2000);
      return;
    }

    data.urls.split("\n").forEach(url => {
      if (url != undefined && url != "") {
        if (url.startsWith("http://") || url.startsWith("https://")){
          urls.push(url);
        }
        else {
          validUrls = false;
        }

      }
    });

    if(!validUrls){
      this.showAddUrlsErrorMessage = true;
      this.isAddInProgress = false;
      setTimeout(() => {
        this.showAddUrlsErrorMessage = false;
      }, 2000);
      return;
    }

    var siteid = this.siteSvc.addUrls(this.site.id, urls);

    this.showAddUrlSuccessMessage = true;
    this.isAddInProgress = false;
    setTimeout(() => {
      this.showAddUrlSuccessMessage = false;
      this.showAddUrlsForm = false;
    }, 2000);

  }

  delete(data) {
    this.siteSvc.remove(data.$key);
    this.router.navigate(['/home/list']);
  }

  select(site) {
    this.router.navigate(['/home/site'], { queryParams: { 'siteid': site.$key } });
  }
}
