import { Component, OnInit} from '@angular/core';
import { ActivatedRoute,Router  } from '@angular/router';

import { PaymentService } from 'app/services/payment.service';
import { UserService } from 'app/services/user.service';
import 'rxjs/add/operator/first';
import { User } from 'app/defs/user';

import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { UserAccountStatus } from 'app/defs/userstatus';


@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {

  public plan:any;
  public site:any;
  public creditcards:any;

  public selectedCard : any;

  public error:string;

  public user : User;

  public isPaymentProgress: boolean;

  constructor(private route: ActivatedRoute, private db : AngularFireDatabase,private pymtSvc : PaymentService, private userSvc : UserService, private router : Router ) {
    this.plan = {};
    this.plan.description = "BASIC";
    this.plan.price = "$149";
    this.site = {};
    this.isPaymentProgress = false;
  }


  ngOnInit() {

    this.userSvc.user.subscribe((user: User) => {
    	this.user = user;

      this.route
       .queryParams
       .first().subscribe(params => {
         // Defaults to 0 if no query param provided.
         this.plan.id = params['plan'] || undefined;
         this.site.id = params['site'] || undefined;

         this.userSvc.getToken().then(token =>{
           this.userSvc.getPreferences(this.user).then((user:any) => {
             this.pymtSvc.list(token,user.customerid).first().subscribe(response =>{
               this.creditcards = response.results;
             });
           });
         });
       });

    });
  }

  handleError(data){
    this.error = "Credit card validation Failed. Please verify again.";
  }

  updateStatus(subscription){
    var preferences = {};
    preferences={
      status : UserAccountStatus.ACTIVATED,
      customerId : subscription.results.customer
    }

    this.db.object("/user-preferences/"+this.user.id).update(preferences);
  }

  chargeBySavedCard(){
    this.error = undefined;
    this.isPaymentProgress = true;
    this.userSvc.getToken().then(token =>{
      this.userSvc.getPreferences(this.user).then((user:any) => {
        this.pymtSvc.charge(token,user,this.selectedCard.id,this.plan.id).first().subscribe(response =>{
          if(response.status.code == 0){
            //Tx is succcess
            //
            this.isPaymentProgress = false;
            this.updateStatus(response);
            this.router.navigate(["/home/list"]);
          }
        });
      });
    });
  }

  chargeByNewCard(newCardToken){
    console.log(newCardToken);
    this.error = undefined;
    this.isPaymentProgress = true;
    this.userSvc.getToken().then(token =>{
      this.userSvc.getPreferences(this.user).then((user:any) => {
        this.pymtSvc.charge(token,user,newCardToken,this.plan.id).first().subscribe(response =>{
          if(response.status.code == 0){
            //Tx is succcess
            //
            this.updateStatus(response);
            this.isPaymentProgress = false;
            this.router.navigate(["/home/list"]);
          }
        });
      });
    });
  }

  selectCard(card){
    this.selectedCard = card;
  }

}
