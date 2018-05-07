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
import { MarkdownModule } from 'ngx-md';
import { TutorialsComponent } from 'app/tutorials/tutorials.component';
import { GettingstartedComponent } from './gettingstarted/gettingstarted.component';
import { JquerytutorialsComponent } from './jquerytutorials/jquerytutorials.component';
import { Angular1tutorialsComponent } from './angular1tutorials/angular1tutorials.component';
import { Angular24tutorialsComponent } from './angular24tutorials/angular24tutorials.component';
import { ReacttutorialsComponent } from './reacttutorials/reacttutorials.component';
import { IntegrationComponent } from './integration/integration.component';

const tutorialRoutes: Routes = [
  {
    path: '',
    component: TutorialsComponent,
    children : [
      {
        path : '',
        redirectTo : 'gettingstarted',
        pathMatch : 'full'
      },
      {
        path : 'gettingstarted',
        component : GettingstartedComponent,
        data : {
          meta: {
            title: 'Getting Started',
            description: 'Learn how to use Sitesearch from svolve.com'
          }
        }
      },
      {
        path : 'integration',
        component : IntegrationComponent,
        data : {
          meta: {
            title: 'Documentation - Integration',
            description: 'Learn how to use Sitesearch from svolve.com'
          }
        }
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
    ReacttutorialsComponent,
    IntegrationComponent,
    TutorialsComponent
  ],
  exports : [
    RouterModule
  ],
  imports : [
    CommonModule,
    FormsModule,
    NgbModule,
    SelectModule,
    MarkdownModule.forRoot(),
    RouterModule.forChild(tutorialRoutes)
  ],
  providers: [UserService,SiteService]
})
export class TutorialsModule {}
