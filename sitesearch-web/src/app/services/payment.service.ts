import { Injectable } from '@angular/core';

import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { ConfigService } from 'app/services/config.service';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import 'rxjs/add/operator/first';
import { SiteStatus } from 'app/defs/sitestatus';
import { ServiceResponse } from 'app/defs/serviceresponse';
import { UserAccountStatus } from 'app/defs/userstatus';
import { Subject } from 'rxjs/Subject';
@Injectable()
export class PaymentService {
  constructor (
    private http: Http,
    private config : ConfigService,
    private db : AngularFireDatabase
  ) {}


  list(token,customerid) {
    return this.http.get(this.config.get("API_ENDPOINT")+'/cards?token='+token+'&customerid='+customerid,{withCredentials:false})
    .map((res:Response) => res.json());
  }


  invoices(token,customerid) {
    return this.http.get(this.config.get("API_ENDPOINT")+'/invoices?token='+token+'&customerid='+customerid,{withCredentials:false})
    .map((res:Response) => res.json().results);
  }

  /**
  Need customerid,token,creditcard id/token,plan
  */
  charge(token,user,cardid,plan) {
    var data = {
      token : token,
      stripetoken  : cardid,
      plan : plan
    };
    if(user.customerid){
      data["customerid"] = user.customerid;
    }
    else {
      data["email"] = user.email;
    }
    return this.http.post(this.config.get("API_ENDPOINT")+'/charge',data,{withCredentials:false})
    .map((res:Response) => res.json());
  }

  /**
  Need customerid,token
  */
  details(token,user) {
    var data = {
      token : token
    };
    if(user.customerid){
      data["customerid"] = user.customerid;
      return this.http.get(this.config.get("API_ENDPOINT")+'/customer?customerid='+user.customerid,{withCredentials:false})
      .map((res:Response) => res.json());
    }
    return null;
  }

}
