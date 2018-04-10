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
import { CustomFormsModule } from 'ng2-validation';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserModule } from '@angular/platform-browser';
import {SelectModule} from 'ng2-select';

import { TutorialsComponent } from 'app/tutorials/tutorials.component';
import { GettingstartedComponent } from './gettingstarted/gettingstarted.component';
import { JquerytutorialsComponent } from './jquerytutorials/jquerytutorials.component';
import { Angular1tutorialsComponent } from './angular1tutorials/angular1tutorials.component';
import { Angular24tutorialsComponent } from './angular24tutorials/angular24tutorials.component';
import { ReacttutorialsComponent } from './reacttutorials/reacttutorials.component';

const tutorialRoutes: Routes = [
  {
    path: 'tutorials',
    component: TutorialsComponent,
    children : [
      {
        path : '',
        redirectTo : 'gettingstarted',
        pathMatch : 'full'
      },
      {
        path : 'gettingstarted',
        component : GettingstartedComponent
      },
      {
        path : 'jquerytutorials',
        component : JquerytutorialsComponent
      },
      {
        path : 'angular1tutorials',
        component : Angular1tutorialsComponent
      },
      {
        path : 'angular24tutorials',
        component : Angular24tutorialsComponent
      },
      {
        path : 'reacttutorials',
        component : ReacttutorialsComponent
      }
    ]
  }
];

@NgModule({
  declarations : [
    GettingstartedComponent,
    JquerytutorialsComponent,
    Angular1tutorialsComponent,
    Angular24tutorialsComponent,
    ReacttutorialsComponent
  ],
  exports : [
    RouterModule
  ],
  imports : [
    BrowserModule,
    FormsModule,
    CustomFormsModule,
    NgbModule,
    SelectModule,
    RouterModule.forChild(tutorialRoutes)
  ],
  providers: [UserService,SiteService]
})
export class TutorialsModule {}
