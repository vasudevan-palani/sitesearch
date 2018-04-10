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
  public showTrial:boolean;

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

    console.log(this.showTrial);
  }

  select(plan){
    console.log("You chose plan ",plan);
    if(!this.user.loginstatus){
      this.router.navigate(['/login'],{ queryParams: { redirect: '/checkout',plan:plan.id } });
    }
    else {
      console.log(this.user);
      this.router.navigate(['/checkout'],{ queryParams: { plan:plan.id,customerid:this.user.customerid } });
    }
  }

  trial(plan){
    console.log("You chose trial plan ",plan);
    if(!this.user.loginstatus){
      this.router.navigate(['/login'],{ queryParams: { redirect: '/trial',plan:plan.id,userid:this.user.id } });
    }
    else {
      this.router.navigate(['/trial'],{ queryParams: { plan:plan.id,userid:this.user.id } });
    }
  }

}
