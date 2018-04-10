import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'app/services/user.service';
import {LocalStorage, SessionStorage} from 'ng2-webstorage';
import { Subject } from 'rxjs/Subject';
import { User } from 'app/defs/user';
import {trigger, state, style, transition, animate} from '@angular/animations';

@Component({
  selector: 'app-header',
  templateUrl: 'header.component.html',
  styleUrls: ['header.component.scss'],
  animations: [
    trigger('slideInOut', [
      state('in', style({
        transform: 'translate3d(0, 0, 0)'
      })),
      state('out', style({
        transform: 'translate3d(100%, 0, 0)'
      })),
      transition('in => out', animate('400ms ease-in-out')),
      transition('out => in', animate('400ms ease-in-out'))
    ]),
  ]
})
export class AppHeaderComponent {

  public user: Subject<User>;

  public _opened: boolean = false;

  @LocalStorage()
  loginstatus: boolean;

  constructor(public userSvc: UserService, private router: Router) {
    this.user = userSvc.user;
  }

  ngOnInit() {

  }

  public _toggleSidebar(sidebar:any) {
    this._opened = !this._opened;
    if(this._opened){
      sidebar.open();
    }
    else {
      sidebar.close();
    }
  }

  logout() {
    this.userSvc.logout();
    this.router.navigate(['/']);
  }
}
