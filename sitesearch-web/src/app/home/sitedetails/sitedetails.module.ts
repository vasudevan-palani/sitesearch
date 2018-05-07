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
import { SitedetailsComponent } from 'app/home/sitedetails/sitedetails.component';
import { SiteOverviewComponent } from './siteoverview/siteoverview.component';
import { SitePreviewComponent } from './sitepreview/sitepreview.component';
import { SiteConfigComponent } from './site-config/site-config.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { ChartModule } from 'angular-highcharts';

const siteRoutes: Routes = [
  {
    path: 'home/site',
    component: SitedetailsComponent,
    children : [
      {
        path : '',
        redirectTo : 'overview',
        pathMatch : 'full'
      },
      {
        path : 'config',
        component : SiteConfigComponent
      },
      {
        path : 'overview',
        component : SiteOverviewComponent
      },
      {
        path : 'preview',
        component : SitePreviewComponent
      },
      {
        path : 'analytics',
        component : AnalyticsComponent
      }
    ]
  }
];

@NgModule({
  declarations : [
    SitePreviewComponent,
    SiteOverviewComponent,
    SitedetailsComponent,
    SiteConfigComponent,
    AnalyticsComponent
  ],
  exports : [
    RouterModule
  ],
  imports : [
    BrowserModule,
    ChartModule,
    FormsModule,
    NgbModule,
    SelectModule,
    RouterModule.forChild(siteRoutes)
  ],
  providers: [UserService,SiteService]
})
export class SiteDetailsModule {}
