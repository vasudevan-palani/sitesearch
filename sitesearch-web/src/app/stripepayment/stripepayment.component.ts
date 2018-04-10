import { Component, OnInit, NgZone,Output,EventEmitter,Input } from '@angular/core';

@Component({
  selector: 'stripepayment',
  templateUrl: './stripepayment.component.html',
  styleUrls: ['./stripepayment.component.scss']
})
export class StripepaymentComponent implements OnInit {

  public isPaymentProgress:boolean;

  @Input()
  public actionLabel : string;

  @Output()
  public tokenReceived : EventEmitter<string>;

  @Output()
  public invalidCard : EventEmitter<any>;

  constructor(private _zone: NgZone) {
  	this.tokenReceived = new EventEmitter<string>();
  	this.invalidCard = new EventEmitter<string>();
  }

  ngOnInit() {
  }

  purchase(order){

    (<any>window).Stripe.card.createToken({
      number: order.ccnumber,
      exp_month: order.exp_month,
      exp_year: order.exp_year,
      cvc: order.cvc
    }, (status: number, response: any) => {

	  // Wrapping inside the Angular zone
      this._zone.run(() => {
        if (status === 200) {
          this.tokenReceived.emit(response.id);
        } else {
          console.log("Token Generated Failed");
          this.invalidCard.emit(response);
        }
      });

    });
  }

}
