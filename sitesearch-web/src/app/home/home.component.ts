import { Component } from '@angular/core';
import { SiteService } from 'app/services/site.service';
import { UserService } from 'app/services/user.service';
import {Router} from '@angular/router';
import { User } from 'app/defs/user';

import { Subscription } from 'rxjs/Subscription';
import { OnDestroy } from '@angular/core';

@Component({
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss']
})
export class HomeComponent implements OnDestroy {


    constructor(private siteSvc : SiteService, private userSvc : UserService,private router:Router){}
    private user : User;

    private _userSubscription :Subscription;

    ngOnInit(){
      this._userSubscription = this.userSvc.user.subscribe((user: User) => {
      	this.user = user;
        if(this.user.loginStatus == false){
          this.router.navigate(['/login']);
        }
      });
    }

    ngOnDestroy(){
      this._userSubscription.unsubscribe();
    }
}
