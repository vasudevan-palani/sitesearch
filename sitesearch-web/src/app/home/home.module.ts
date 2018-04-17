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
import { BrowserModule } from '@angular/platform-browser';
import {SelectModule} from 'ng2-select';
import { SiteDetailsModule } from 'app/home/sitedetails/sitedetails.module';
import { AuthGuard } from 'app/services/authguard.service';
import { AccountstatusComponent } from './accountstatus/accountstatus.component';

const homeRoutes: Routes = [
  {
    path: 'home',
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
        component : ListSiteComponent
      },
      {
        path : 'new',
        component : NewSiteComponent
      },
      {
        path : 'test',
        component : TestSiteComponent
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
    AccountstatusComponent
  ],
  exports : [
    RouterModule
  ],
  imports : [
    BrowserModule,
    FormsModule,
    NgbModule,
    SelectModule,
    SiteDetailsModule,
    RouterModule.forChild(homeRoutes)
  ],
  providers: [UserService,SiteService,AuthGuard]
})
export class HomeModule {}
