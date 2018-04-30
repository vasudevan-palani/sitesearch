import { Component } from '@angular/core';
import { SiteService } from 'app/services/site.service';
import { UserService } from 'app/services/user.service';
import {Router} from '@angular/router';
import { User } from 'app/defs/user';

@Component({
  selector: 'newsite',
  templateUrl: 'newsite.component.html',
  styleUrls: ['newsite.component.scss']
})
export class NewSiteComponent {

  private user : User;
  public isAddInProgress:boolean;

  public error : any;

  constructor(private siteSvc : SiteService, private userSvc : UserService,private router:Router){
    this.isAddInProgress=false;
  }

  ngOnInit(){
    this.userSvc.user.subscribe((user: User) => {
    	this.user = user;
    });
  }

  addsite(data){
    if(data.sitedomains == undefined || data.sitedomains == null || data.sitedomains.length == 0){
      this.error = "Urls are required in valid format Eg: http(s)://www.wikipedia.org";
      setTimeout(() => {
        this.error = undefined;
      }, 5000);
      return;
    }

    console.log("Adding site : ",data);
    let newsite :any;
    newsite = {
      'userId' : this.user.id,
      'lastCrawlTime' : 'None',
      'name' : data.name,
      'description' : data.description,
      'urls':[]

    }
    let validUrls = true;
    data.sitedomains.split("\n").forEach(url => {
      if(url != undefined && url != ""){
        if (url.startsWith("http://") || url.startsWith("https://")){
          newsite.urls.push(url);
        }
        else {
          validUrls = false;
        }
      }
    });

    if(!validUrls){
      this.error = "Urls are required in valid format Eg: http(s)://www.wikipedia.org";
      setTimeout(() => {
        this.error = undefined;
      }, 5000);
      return;
    }
    this.isAddInProgress = true;

    var siteid = this.siteSvc.add(newsite,newsite.userId).subscribe(site => {
      console.log("Site added to firebase : ",site);
      this.userSvc.getToken().then(token => {
        console.log("User Token received : ",token);
        data.token = token;
        this.router.navigate(['home','list']);
      });
    });

  }
}
