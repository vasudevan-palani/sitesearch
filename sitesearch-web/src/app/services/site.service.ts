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

@Injectable()
export class SiteService {
  constructor (
    private http: Http,
    private config : ConfigService,
    private db : AngularFireDatabase
  ) {}

  add(data,userId) : Observable<any> {
    console.log("SVC Adding site : ",data);

    var returnObjservable = new Subject();
    data.status = SiteStatus.NEW;
    data.created = Date.now();

    let sitekey = userId.toLowerCase() + data.created;

    var websiteObservable = this.db.object("/websites/"+sitekey).set(data).then(resp => {
      console.log("SVC Added website  : ",data);
      returnObjservable.next(data);
    });

    return returnObjservable.asObservable();
  }

  createCollection(data){
    return this.http.post(this.config.get("API_ENDPOINT")+'/site/add',data,{withCredentials:false})
    .map((res:Response) => res.json());
  }

  deleteCollection(data){
    return this.http.post(this.config.get("API_ENDPOINT")+'/site/delete',data,{withCredentials:false})
    .map((res:Response) => res.json());
  }

  remove(siteid) {
    var websitesObservable = this.db.list("/websites/",{
      query : {
        orderByChild : 'id',
        equalTo : siteid
      }
    });
    websitesObservable.subscribe((website:any) => {
      websitesObservable.remove(website.$key);
    });
  }

  crawl(siteid,token) {
    console.log(siteid);
    this.db.object("/websites/"+siteid).update({status:SiteStatus.SCHEDULED});

    let crawls = this.db.list("/crawlq");
    crawls.push({
      'siteKey' : siteid,
      'created' : new Date().getTime(),
      'status' : 'SCHEDULED'
    });

  }

  search(data) {
    console.log(data);
    return this.http.get(this.config.get("API_ENDPOINT")+'/search?q='+data.tag+'&siteId='+data.siteid,{withCredentials:false})
    .map((res:Response) => res.json());
  }

  getPageCount(site):Observable<any>{
    return new Observable<any>((observer:any)=> {
      this._getPageCount(site).subscribe(response => {
        console.log(response);
        observer.next(response);
      },error => {
        observer.next(0);
      });
    });
  }
  private _getPageCount(data) {
    console.log(data);
    return this.http.get(this.config.get("API_ENDPOINT")+'/search?countOnly=true&siteId='+data.$key,{withCredentials:false})
    .map((res:Response) => {
      var jsonResponse = res.json();
      console.log(jsonResponse);
      return jsonResponse["results"]["count"];
    });
  }

  list(userId) {
    return this.db.list('/websites',{
        query : {
          orderByChild : 'userId',
          equalTo : userId
        }
      });
  }
}
