import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
import {Router,ActivatedRoute} from '@angular/router';
import 'rxjs/add/operator/catch';
import { ServiceResponse } from 'app/defs/serviceresponse';

import { SiteService } from 'app/services/site.service';
import { User } from 'app/defs/user';

@Component({
  selector: 'login',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.scss']
})
export class LoginComponent {
  public user : any;
  public error : any;

  public isLogInProgress:boolean;

  public returnUrl : string;

  constructor(
    private siteSvc : SiteService,
    private userSvc : UserService,
    private router:Router,
    private route:ActivatedRoute){
      this.isLogInProgress = false;
    }


  ngOnInit(){
    window.scrollTo(0, 0);
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'];
    this.userSvc.user.subscribe((user: User) => {
      this.user = user;
      if(this.user.loginstatus){
        this.handleRedirect();
      }

    });
  }

  signIn(provider){
    this.user = this.userSvc.loginWithGmail().subscribe( data => {

    });
  }

  private handleRedirect(){
    if(this.returnUrl != undefined){
      console.log("Directing to  ",this.returnUrl);
      this.router.navigateByUrl(this.returnUrl);
    }
    else {
      console.log("Redirecting to HOME");
      this.router.navigate(['/home']);
    }
  }

  login(data){
    this.error = undefined;
    this.isLogInProgress = true;
    console.log(data);
    this.userSvc.login(data).first().subscribe(response => {
      this.isLogInProgress = false;
      console.log(this.route);
      this.handleRedirect();

    },error => {
      this.isLogInProgress = false;
      window.scrollTo(0, 0);
      //Login error
      //
      console.log("Login Failed 123");
      this.error = error.message;
    });
  }
}
