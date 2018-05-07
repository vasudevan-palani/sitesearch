import { Component } from '@angular/core';
import { UserService } from 'app/services/user.service';
import { SiteService } from 'app/services/site.service';
import { NewSiteComponent } from 'app/home/newsite/newsite.component';
import { TestSiteComponent } from 'app/home/testsite/testsite.component';
import { ListSiteComponent } from 'app/home/listsite/listsite.component';
import { HomeComponent } from 'app/home/home.component';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import {SelectModule} from 'ng2-select';
import { AuthGuard } from 'app/services/authguard.service';
import { AccountstatusComponent } from './accountstatus/accountstatus.component';
import { PaymentListComponent } from './payment-list/payment-list.component';

const homeRoutes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate : [AuthGuard],
    children : [
      {
        path : '',
        redirectTo : 'list',
        pathMatch : 'full'
      },
      {
        path : 'list',
        component : ListSiteComponent,
        data : {
          meta: {
            title: 'Sitesearch',
            description: 'Sitesearch from svolve.com'
          }
        }
      },
      {
        path : 'new',
        component : NewSiteComponent,
        data : {
          meta: {
            title: 'Sitesearch',
            description: 'Sitesearch from svolve.com'
          }
        }
      },
      {
        path : 'site',
        loadChildren :'app/home/sitedetails/sitedetails.module#SiteDetailsModule'
      },
      {
        path : 'payments',
        component : PaymentListComponent,
        data : {
          meta: {
            title: 'Sitesearch',
            description: 'Sitesearch from svolve.com'
          }
        }
      },
      {
        path : 'test',
        component : TestSiteComponent,
        data : {
          meta: {
            title: 'Sitesearch',
            description: 'Sitesearch from svolve.com'
          }
        }
      }
    ]
  }
];

@NgModule({
  declarations : [
    NewSiteComponent,
    HomeComponent,
    ListSiteComponent,
    TestSiteComponent,
    AccountstatusComponent,
    PaymentListComponent
  ],
  exports : [
    RouterModule
  ],
  imports : [
    CommonModule,
    FormsModule,
    NgbModule,
    SelectModule,
    RouterModule.forChild(homeRoutes)
  ],
  providers: [UserService,SiteService,AuthGuard]
})
export class HomeModule {}
