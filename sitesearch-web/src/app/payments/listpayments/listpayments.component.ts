import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-listpayments',
  templateUrl: './listpayments.component.html',
  styleUrls: ['./listpayments.component.scss']
})
export class ListPaymentsComponent implements OnInit {

  public creditcards:any;

  constructor() {
    this.creditcards = [{
      type:'visa',
      endsWith : '1234',
      exp_month : '12',
      exp_year : '2055'
    },
    {
      type:'mastercard',
      endsWith : '1234',
      exp_month : '12',
      exp_year : '2055'
    }];
  }

  ngOnInit() {
  }


  delete(card){
    
  }

}
