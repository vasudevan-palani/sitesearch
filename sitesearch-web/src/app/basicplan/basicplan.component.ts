import { Component, OnInit, Input } from '@angular/core';
import { SiteService } from 'app/services/site.service';
import { UserService } from 'app/services/user.service';
import {Router} from '@angular/router';
import { User } from 'app/defs/user';

@Component({
  selector: 'basicplan',
  templateUrl: './basicplan.component.html',
  styleUrls: ['./basicplan.component.scss']
})
export class BasicplanComponent implements OnInit {
  constructor(private siteSvc : SiteService, private userSvc : UserService,private router:Router){}
  private user : User;

  @Input()
  public showActions : boolean;

  @Input()
  public currentPlan : boolean;

  ngOnInit(){
  	if(this.showActions == undefined) {
  		this.showActions = true;
  	}
    this.userSvc.user.subscribe((user: User) => {
    	this.user = user;
    });

  }

  select(plan){
    console.log("You chose plan ",plan);
    if(!this.user.loginStatus){
      this.router.navigate(['/login'],{ queryParams: { redirect: '/checkout',plan:plan.id } });
    }
    else {
      console.log(this.user);
      this.router.navigate(['/checkout'],{ queryParams: { plan:plan.id,customerid:this.user.customerId } });
    }
  }


}
