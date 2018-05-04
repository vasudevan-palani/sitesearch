import { Component, OnInit } from '@angular/core';
import { UserService } from 'app/services/user.service';
import { User } from 'app/defs/user';
import { UserPreferences } from 'app/defs/UserPreferences';

import { PaymentService } from 'app/services/payment.service';

@Component({
  selector: 'app-payment-list',
  templateUrl: './payment-list.component.html',
  styleUrls: ['./payment-list.component.scss']
})
export class PaymentListComponent implements OnInit {

  public preferences : UserPreferences;

  public charges : any;

  constructor(
    private userSvc: UserService,
    private pymtSvc: PaymentService
  ) { }

  ngOnInit() {
    this.userSvc.preferences.subscribe((preferences: UserPreferences) => {
      this.preferences = preferences;
      if(this.preferences.customerId != undefined){
          this.pymtSvc.getCharges(this.preferences.customerId).subscribe(resp => {
            console.log(resp);
            this.charges = resp;
          });
      }
    });
  }

}
