import { Injectable } from '@angular/core';

import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { ConfigService } from 'app/services/config.service';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import 'rxjs/add/operator/first';
import { SiteStatus } from 'app/defs/sitestatus';
import { ServiceResponse } from 'app/defs/serviceresponse';
import { Subject } from 'rxjs/Subject';
import { environment } from 'environments/environment';
@Injectable()
export class PaymentService {
  constructor (
    private http: Http,
    private config : ConfigService,
    private db : AngularFireDatabase
  ) {}


  list(token,customerid) {
    return this.http.get(environment.API_ENDPOINT+'/cards?token='+token+'&customerid='+customerid,{withCredentials:false})
    .map((res:Response) => res.json());
  }


  getCharges(customerid) {
    return this.http.get(environment.API_ENDPOINT+'/invoices?customerid='+customerid,{withCredentials:false})
    .map((res:Response) => res.json().results);
  }

  /**
  Need customerid,token,creditcard id/token,plan
  */
  charge(token,user,cardid,plan) {
    var data = {
      token : token,
      stripetoken  : cardid,
      userId : user.userId,
      plan : plan
    };
    if(user.customerId){
      data["customerid"] = user.customerId;
    }
    else {
      data["email"] = user.email;
    }
    return this.http.post(environment.API_ENDPOINT+'/charge',data,{withCredentials:false})
    .map((res:Response) => res.json());
  }

  /**
  Need customerid,token
  */
  details(customerId) {
    if(customerId){
      return this.http.get(environment.API_ENDPOINT+'/customer?customerid='+customerId,{withCredentials:false})
      .map((res:Response) => res.json());
    }
    return null;
  }

}
