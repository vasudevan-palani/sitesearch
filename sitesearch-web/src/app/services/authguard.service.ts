import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserService } from 'app/services/user.service';


@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private userSvc: UserService, private router : Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    return this.userSvc.user.debounceTime(500).first().map(user => {
      if(!user.loginstatus){
          // not logged in so redirect to login page with the return url and return false
          this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
      }
      return user.loginstatus;
    });

  }
}
