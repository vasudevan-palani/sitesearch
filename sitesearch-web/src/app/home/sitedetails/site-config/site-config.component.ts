import { Component, OnInit, ViewChild } from '@angular/core';
import { UserPreferences } from 'app/defs/UserPreferences';
import { Subscription } from 'rxjs/Subscription';
import { SiteService } from 'app/services/site.service';
import { UserService } from 'app/services/user.service';
import { LogService } from 'app/services/log.service';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import {Router, ActivatedRoute} from '@angular/router';

@Component({
  selector: 'site-config',
  templateUrl: './site-config.component.html',
  styleUrls: ['./site-config.component.scss']
})
export class SiteConfigComponent implements OnInit {

  public siteId: string;

  @ViewChild('configForm') configForm : any;

  constructor(
    private userSvc : UserService,
    private log : LogService,
    private router:Router,
    private db: AngularFireDatabase,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.siteId = this.route.snapshot.queryParams['siteid'];
    this.db.object("/websites/"+this.siteId+"/preferences").subscribe((preferences:any)=>{
      this.log.debug("ngOnInit/preferences",preferences);
      this.configForm.urlFiltersExcludes = preferences.excludes.join("\n");
      this.configForm.urlFiltersIncludes = preferences.includes.join("\n");
    });


  }

  submit(data){

    let includes = [];
    let excludes = [];

    if(data.urlFiltersExcludes != "" data.urlFiltersExcludes.split("\n").length > 0){
      urlFiltersExcludes.split("\n").forEach(url => {
        if(url != ""){
          exlcudes.push(url);
        }
      });
    }

    if(data.urlFiltersIncludes != "" data.urlFiltersIncludes.split("\n").length > 0){
      urlFiltersIncludes.split("\n").forEach(url => {
        if(url != ""){
          includes.push(url);
        }
      });
    }

    this.db.object("/websites/"+this.siteId+"/preferences").update({
      includes : includes,
      excludes : excludes,
    })
  }

}
