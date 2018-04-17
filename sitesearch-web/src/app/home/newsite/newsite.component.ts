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

  constructor(private siteSvc : SiteService, private userSvc : UserService,private router:Router){
    this.isAddInProgress=false;
  }

  ngOnInit(){
    this.userSvc.user.subscribe((user: User) => {
    	this.user = user;
    });
  }

  addsite(data){
    this.isAddInProgress = true;
    console.log("Adding site : ",data);
    data.domains = data.sitedomains.split(',');
    data.userId = this.user.id;
    data.lastCrawlTime = 'None';

    var siteid = this.siteSvc.add(data,data.userId).subscribe(site => {
      console.log("Site added to firebase : ",site);
      this.userSvc.getToken().then(token => {
        console.log("User Token received : ",token);
        data.token = token;
        this.router.navigate(['home','list']);
      });
    });

  }
}
