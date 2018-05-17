import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
import {Router,ActivatedRoute} from '@angular/router';

@Component({
  selector: 'signup',
  templateUrl: 'signup.component.html',
  styleUrls: ['signup.component.scss']
})
export class SignUpComponent {

public isSignUpInProgress: boolean;
public error : string;

constructor(private userSvc : UserService,private router : Router){
  this.isSignUpInProgress = false;
  this.error = undefined;
}
	signup(data){
    this.isSignUpInProgress = true;
    this.error = undefined;
    console.log(data);
    this.userSvc.signup(data).then(response => {
      this.isSignUpInProgress = false;
      console.log(response);
      window.scrollTo(0, 0);
      this.router.navigate(['/home/list']);
    },errorResponse => {
      window.scrollTo(0, 0);
      console.log(errorResponse);
      this.error = errorResponse.message;
      this.isSignUpInProgress = false;
    });
	}

  signIn(provider){
    this.userSvc.loginWithGmail().then( data => {
      this.handleRedirect();
    });
  }

  private handleRedirect(){

      console.log("Redirecting to HOME");
      this.router.navigate(['/home']);
  }

}
