import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MetaModule } from 'ng2-meta';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';

import { AppHeaderComponent } from 'app/header/header.component';
import { AppFooterComponent } from 'app/footer/footer.component';
import { AppMainComponent } from 'app/main/main.component';
import { LoginComponent } from 'app/login/login.component';
import { SignUpComponent } from 'app/signup/signup.component';
import { UserService } from 'app/services/user.service';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule, Routes } from '@angular/router';
import { RecaptchaModule } from 'ng-recaptcha';

import { MarkdownModule } from 'ngx-md';
import {ConfigService} from 'app/services/config.service';
import {PaymentService} from 'app/services/payment.service';
import {LogService} from 'app/services/log.service';

import {Ng2Webstorage} from 'ngx-webstorage';

import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule,AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { DocumentationComponent } from 'app/documentation/documentation.component';
import { DeveloperapiComponent } from './developerapi/developerapi.component';
import { FeaturesComponent } from './features/features.component';

import { PricingComponent } from './pricing/pricing.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { TrialComponent } from './trial/trial.component';
import { CheckoutSummaryComponent } from './checkoutsummary/checkoutsummary.component';

import { SidebarModule } from 'ng-sidebar';
import { BasicplanComponent } from './basicplan/basicplan.component';
import { StandardplanComponent } from './standardplan/standardplan.component';
import { PaymentsModule } from './payments/payments.module';

import { AuthGuard } from 'app/services/authguard.service';

import { environment } from 'environments/environment';
import { PricingDetailsComponent } from './pricing/pricing-details/pricing-details.component';
import { TermsComponent } from './terms/terms.component';
import { PrivacyComponent } from './privacy/privacy.component';

const appRoutes: Routes = [
  {
    path: '',
    component : AppMainComponent,
    data :{
      meta: {
        title: 'Sitesearch',
        description: 'Sitesearch from svolve.com'
      }
    }
  },
  { path: 'signup',
    component: SignUpComponent,
    data :{
      meta: {
        title: 'SignUp',
        description: 'Signup to svolve.com'
      }
    }
   },
  {
    path: 'login',
    component: LoginComponent ,
    data :{
      meta: {
        title: 'Login',
        description: 'Login to svolve.com'
      }
    }
  },
  {
    path: 'terms',
    component: TermsComponent ,
    data :{
      meta: {
        title: 'Terms and Conditions',
        description: 'Sitesearch terms and conditions.'
      }
    }
  },
  {
    path: 'privacy',
    component: PrivacyComponent,
    data :{
      meta: {
        title: 'Privacy policy',
        description: 'Sitesearch privacy policy.'
      }
    }
  },
  {
    path: 'documentation',
    component: DocumentationComponent ,
    data :{
      meta: {
        title: 'Documentation',
        description: 'Learn how to use sitesearch from svolve.com.'
      }
    }
  },
  {
    path: 'developerapi',
    component: DeveloperapiComponent,
    data :{
      meta: {
        title: 'Developer API',
        description: 'Learn how to use sitesearch from svolve.com.'
      }
    }
  },
  {
    path: 'features',
    component: FeaturesComponent ,
    data :{
      meta: {
        title: 'Documentation',
        description: 'Learn how to use sitesearch from svolve.com.'
      }
    }
  },
  {
    path: 'tutorials',
    loadChildren: 'app/tutorials/tutorials.module#TutorialsModule'
  },
  {
    path: 'home',
    loadChildren: 'app/home/home.module#HomeModule'
  },
  {
    path: 'pricing',
    component: PricingComponent ,
    data :{
      meta: {
        title: 'Pricing',
        description: 'Pricing for sitesearch from svolve.com.'
      }
    }
  },
  {
    path: 'checkout',
    component: CheckoutComponent,
    canActivate : [ AuthGuard ]
  },
  {
    path: 'trial',
    component: TrialComponent
  },
  {
    path: 'summary',
    component: CheckoutSummaryComponent
  }

];

let loginproviders = {
    "google": {
      "clientId": "394112334646-oa3rp0jg9k66a9p7cvk1ifdjj9idm858.apps.googleusercontent.com"
    }
  };

//const firebaseconfig = window["config"]["app"]["firebase"];
// const firebaseconfig = {
//   // apiKey: "AIzaSyALwIRzd8-0tACUGay3xa0gaT6dXoED8yQ",
//   // authDomain: "opensearch-2a0db.firebaseapp.com",
//   // databaseURL: "https://opensearch-2a0db.firebaseio.com",
//   // projectId: "opensearch-2a0db",
//   // storageBucket: "opensearch-2a0db.appspot.com",
//   // messagingSenderId: "710024249927"
//
//   apiKey: "AIzaSyBopDB2Pr8VhVgWL9w9X1xiUvtTuNzS9o4",
//   authDomain: "svolve-ss.firebaseapp.com",
//   databaseURL: "https://svolve-ss.firebaseio.com",
//   projectId: "svolve-ss",
//   storageBucket: "svolve-ss.appspot.com",
//   messagingSenderId: "894505407110"
// }

@NgModule({
  declarations: [
    AppComponent,
    AppHeaderComponent,
    AppFooterComponent,
    AppMainComponent,
    LoginComponent,
    DocumentationComponent,
    SignUpComponent,
    DeveloperapiComponent,
    FeaturesComponent,
    PricingComponent,
    CheckoutComponent,
    TrialComponent,
    CheckoutSummaryComponent,
    BasicplanComponent,
    StandardplanComponent,
    PricingDetailsComponent,
    TermsComponent,
    PrivacyComponent
  ],
  imports: [
    NgbModule.forRoot(),
    MarkdownModule.forRoot(),
    RouterModule.forRoot(appRoutes),
    MetaModule.forRoot(),
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    PaymentsModule,
    SidebarModule.forRoot(),
    Ng2Webstorage.forRoot(),
    RecaptchaModule.forRoot(),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule
  ],
  providers: [UserService,ConfigService,AngularFireDatabase,PaymentService,AuthGuard,LogService],
  bootstrap: [AppComponent]
})
export class AppModule { }
