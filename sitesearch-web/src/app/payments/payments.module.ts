import { Component } from '@angular/core';
import { UserService } from 'app/services/user.service';
import { SiteService } from 'app/services/site.service';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomFormsModule } from 'ng2-validation';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserModule } from '@angular/platform-browser';
import {SelectModule} from 'ng2-select';
import { ListPaymentsComponent } from 'app/payments/listpayments/listpayments.component';
import { NewPaymentsComponent } from 'app/payments/newpayments/newpayments.component';
import { PaymentsComponent } from 'app/payments/payments.component';
import { StripepaymentComponent } from 'app/stripepayment/stripepayment.component';

const paymentsRoutes: Routes = [
  {
    path: 'payments',
    component: PaymentsComponent,
    children : [
      {
        path : '',
        redirectTo : 'list',
        pathMatch : 'full'
      },
      {
        path : 'list',
        component : ListPaymentsComponent
      },
      {
        path : 'new',
        component : NewPaymentsComponent
      }
    ]
  }
];

@NgModule({
  declarations : [
    StripepaymentComponent,
    NewPaymentsComponent,
    ListPaymentsComponent,
    PaymentsComponent
  ],
  exports : [
    RouterModule,
    StripepaymentComponent
  ],
  imports : [
    BrowserModule,
    FormsModule,
    CustomFormsModule,
    NgbModule,
    SelectModule,
    RouterModule.forChild(paymentsRoutes)
  ],
  providers: [UserService,SiteService]
})
export class PaymentsModule {}
