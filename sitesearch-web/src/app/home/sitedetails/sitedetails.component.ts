import { Component, OnInit } from '@angular/core';
import { SiteService } from 'app/services/site.service';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from 'app/services/user.service';
import { AngularFireDatabase } from 'angularfire2/database';
@Component({
  selector: 'app-sitedetails',
  templateUrl: './sitedetails.component.html',
  styleUrls: ['./sitedetails.component.scss']
})
export class SitedetailsComponent implements OnInit {

  constructor(private siteSvc : SiteService,
  private userSvc : UserService,
  private db : AngularFireDatabase,
  private route : ActivatedRoute,
  private router:Router) { }

  public site:any;

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
          console.log(this.site);
        });
      }
    });
  }

}
