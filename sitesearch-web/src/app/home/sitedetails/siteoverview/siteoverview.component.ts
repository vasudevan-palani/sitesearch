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

  public invoices:any[];

  ngOnInit() {
    var siteid = "";
    this.route.queryParams.subscribe(params => {
      if(params['siteid']){
        console.log(params['siteid']);
        siteid = params['siteid'];
        this.db.list("/websites",{
          query : {
            orderByChild : 'id',
            equalTo : siteid
          }
        }).subscribe(sites => {
          this.site = sites[0];
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
    this.userSvc.getToken().then(token => {
      this.siteSvc.crawl(site.id,token);
    });
  }

  delete(data){
    this.siteSvc.remove(data.id);
    this.userSvc.getToken().then(token => {
      data.token = token;
      this.siteSvc.deleteCollection(data).subscribe(response => {
        console.log(response);
      });
    });
  }

  select(site){
    this.router.navigate(['/home/site'],{queryParams:{'siteid':site.id}});
  }
}
