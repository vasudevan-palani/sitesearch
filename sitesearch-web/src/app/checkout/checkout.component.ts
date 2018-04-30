import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { PaymentService } from 'app/services/payment.service';
import { UserService } from 'app/services/user.service';
import 'rxjs/add/operator/first';
import { User } from 'app/defs/user';

import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { UserAccountStatus } from 'app/defs/UserAccountStatus';
import { UserPreferences } from 'app/defs/UserPreferences';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {

  public plan: any;
  public site: any;
  public creditcards: any;

  public selectedCard: any;

  public error: string;

  public user: User;

  public isPaymentProgress: boolean;

  public preferences : UserPreferences;

  constructor(private route: ActivatedRoute, private db: AngularFireDatabase, private pymtSvc: PaymentService, private userSvc: UserService, private router: Router) {
    this.plan = {};
    this.plan.description = "BASIC";
    this.plan.price = "$149";
    this.site = {};
    this.isPaymentProgress = false;
  }


  ngOnInit() {

    this.userSvc.user.subscribe((user: User) => {
      this.user = user;
    });

    this.userSvc.preferences.subscribe((preferences: UserPreferences) => {
      this.preferences = preferences;
      this.getCreditCards();
    });


    this.route
      .queryParams
      .first().subscribe(params => {
        // Defaults to 0 if no query param provided.
        this.plan.id = params['plan'] || undefined;
      });

  }

  getCreditCards() {

    if(this.preferences.customerId != undefined){
      this.userSvc.getToken().then(token => {
          this.pymtSvc.list(token, this.preferences.customerId).subscribe(response => {
            this.creditcards = response.results;
          });
      });
    }

  }


  handleError(data) {
    this.error = "Credit card validation Failed. Please verify again.";
  }

  updateStatus(subscription) {
    this.userSvc.activateAccount(subscription.results.customer);
  }

  chargeBySavedCard() {
    this.error = undefined;
    this.isPaymentProgress = true;

    this.userSvc.getToken().then(token => {
        this.pymtSvc.charge(token, {
          email:this.user.email,
          customerId:this.preferences.customerId},
          this.selectedCard.id, this.plan.id).subscribe(response => {
          if (response.status.code == 0) {
            //Tx is succcess
            //
            this.isPaymentProgress = false;
            this.updateStatus(response);
            this.router.navigate(["/home/list"]);
          }
        });
      });
  }

  chargeByNewCard(newCardToken) {
    console.log(newCardToken);
    this.error = undefined;
    this.isPaymentProgress = true;
    this.userSvc.getToken().then(token => {
        this.pymtSvc.charge(token, {
          email:this.user.email,
          customerId:this.preferences.customerId},
          newCardToken,
          this.plan.id).subscribe(response => {
          if (response.status.code == 0) {
            //Tx is succcess
            //
            this.updateStatus(response);
            this.isPaymentProgress = false;
            this.router.navigate(["/home/list"]);
          }
        });
      });
  }

  selectCard(card) {
    this.selectedCard = card;
  }

}
