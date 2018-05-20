import { Component, OnInit } from '@angular/core';
import { SiteService } from 'app/services/site.service';
import { UserService } from 'app/services/user.service';
import { PaymentService } from 'app/services/payment.service';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from 'app/defs/user';
import { UserPreferences } from 'app/defs/UserPreferences';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss'],
  animations: [
    trigger('fadeBottom', [
      transition(':enter', [
        style({opacity: 0,transform: 'translateY(+10%)'}),
        animate('500ms ease-in')
      ])
    ]),
    trigger('fadeLeft', [
      transition(':enter', [
        style({opacity: 0,transform: 'translateX(-10%)'}),
        animate('500ms ease-in')
      ])
    ]),
    trigger('fadeRight', [
      transition(':enter', [
        style({opacity: 0,transform: 'translateX(+10%)'}),
        animate('500ms ease-in')
      ])
    ])
  ]
})
export class PricingComponent implements OnInit {

  constructor(
    private siteSvc: SiteService,
    private pymtSvc: PaymentService,
    private userSvc: UserService,
    private route: ActivatedRoute) {
  }


  private user: User;
  private customer: any;
  private preferences : UserPreferences;

  public currentPlan: string;


  ngOnInit() {
    var queryParams = this.route.snapshot.queryParams;

    this.userSvc.user.subscribe((user: User) => {
      this.user = user;
    });

    this.userSvc.preferences.subscribe((preferences:UserPreferences)=>{
      this.preferences = preferences;
      this.currentPlan = preferences.planId;
    });

  }

}
