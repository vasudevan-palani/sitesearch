import { Component } from '@angular/core';
import { SiteService } from 'app/services/site.service';
import { UserService } from 'app/services/user.service';
import {Router} from '@angular/router';
import { User } from 'app/defs/user';
@Component({
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss']
})
export class HomeComponent {


    constructor(private siteSvc : SiteService, private userSvc : UserService,private router:Router){}
    private user : User;
    ngOnInit(){
      this.userSvc.user.subscribe((user: User) => {
      	this.user = user;
        if(this.user.loginstatus == false){
          this.router.navigate(['/login']);
        }
      });
    }
}
