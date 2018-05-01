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

  public isUpdateInProgress : boolean;

  public error : string;

  @ViewChild('configForm') configForm : any;

  constructor(
    private userSvc : UserService,
    private siteSvc : SiteService,
    private log : LogService,
    private router:Router,
    private db: AngularFireDatabase,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.siteId = this.route.snapshot.queryParams['siteid'];
    this.db.object("/websites/"+this.siteId+"/preferences").subscribe((preferences:any)=>{
      this.log.debug("ngOnInit/preferences",preferences);
      this.configForm.urlFiltersExcludes = preferences.excludes != undefined ? preferences.excludes.join("\n") : "";
      this.configForm.urlFiltersIncludes = preferences.includes != undefined ? preferences.includes.join("\n") : "";
    });


  }

  setError(err){
    this.error = err;

    setTimeout(()=>{
      this.error = undefined
    },5000);
  }

  submit(data){

    let includes = [];
    let excludes = [];

    if(data.urlFiltersExcludes != "" && data.urlFiltersExcludes.split("\n").length > 0){
      data.urlFiltersExcludes.split("\n").forEach(url => {
        if(url != ""){
          excludes.push(url);
        }
      });
    }

    if(data.urlFiltersIncludes != "" && data.urlFiltersIncludes.split("\n").length > 0){
      data.urlFiltersIncludes.split("\n").forEach(url => {
        if(url != ""){
          includes.push(url);
        }
      });
    }

    this.db.object("/websites/"+this.siteId+"/preferences").update({
      includes : includes,
      excludes : excludes,
    });
    this.isUpdateInProgress = true;
    this.siteSvc.updateConfig(this.siteId).subscribe(success =>{
      this.isUpdateInProgress = false;
    },err => {
      this.isUpdateInProgress = false;
      this.setError(err);
    });
  }

}
