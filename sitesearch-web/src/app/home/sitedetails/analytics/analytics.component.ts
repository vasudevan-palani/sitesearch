import { Component, OnInit } from '@angular/core';
import { SiteService } from 'app/services/site.service';
import { UserService } from 'app/services/user.service';
import { LogService } from 'app/services/log.service';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import {Router, ActivatedRoute} from '@angular/router';
@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit {

  public analytics : any;

  constructor(
    private siteSvc: SiteService,
    private log : LogService,
    private router:Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    let siteId = this.route.snapshot.queryParams['siteid'];
    if(siteId != undefined){
      this.siteSvc.getAnalytics(siteId).subscribe((analytics: any) => {
        this.analytics = analytics.results;
      });
    }

  }

}
