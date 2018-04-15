import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { ConfigService } from 'app/services/config.service';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import 'rxjs/add/operator/first';
import { SiteStatus } from 'app/defs/sitestatus';
import { ServiceResponse } from 'app/defs/serviceresponse';
import { UUID } from 'angular2-uuid';

import { Subject } from 'rxjs/Subject';

@Injectable()
export class SiteService {
  constructor (
    private http: Http,
    private config : ConfigService,
    private db : AngularFireDatabase
  ) {}

  getNewUUID(askForMore ?: Observable<boolean>) : Observable<string> {
    var returnObjservable = new Subject();


    setTimeout(function(){
      returnObjservable.next(UUID.UUID().replace(/-/g,''));
    });

    if(askForMore instanceof Observable){
      askForMore.subscribe(isNextRequired => {
        if(isNextRequired){
            returnObjservable.next(UUID.UUID().replace(/-/g,''));
        }
      });
    }

    return returnObjservable.asObservable();
  }

  add(data) : Observable<any> {
    console.log("SVC Adding site : ",data);

    var returnObjservable = new Subject();
    data.status = SiteStatus.NEW;
    data.created = (new Date().getTime())/1000;

    var keyRequestor = new Subject();

    this.getNewUUID(keyRequestor.asObservable()).subscribe(keyId => {
      console.log("SVC Got New Id  : ",keyId);
      this.db.list('/websites',{
          query : {
            orderByChild : 'id',
            equalTo : keyId
          }
        }).first().subscribe(websiteList => {
          console.log("SVC Checking existing websites  : ",websiteList);
          var idExists = false;
          websiteList.forEach(website => {
            console.log("SVC Checking existing website  : ",website);
            if(website.id == keyId){
              idExists = true;
            }
          });

          if(websiteList.length == 0 || idExists==false){
            data.id = keyId;
            var sitekey = this.db.list("/websites").push(data).key;

            var websiteObservable = this.db.object("/websites/"+sitekey);
            console.log("SVC Added website  : ",data);
            returnObjservable.next(data);
          }
          else {
            console.log("SVC Requesting new key");
            keyRequestor.next(true);
          }
        });
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
    var websitesObservable = this.db.list("/websites/",{
      query : {
        orderByChild : 'id',
        equalTo : siteid
      }
    });
    websitesObservable.first().subscribe( (websites:any) => {
      websites.map(website => {
        websitesObservable.update(website.$key,{status:SiteStatus.SCHEDULED});

        let crawls = this.db.list("/crawlq/"+website.$key);
        crawls.push({
          'siteId' : siteid,
          'created' : new Date().getTime() / 1000,
          'status' : 'SCHEDULED'
        });

      });
    });
  }

  search(data) {
    console.log(data);
    return this.http.get(this.config.get("API_ENDPOINT")+'/search?q='+data.tag+'&siteid='+data.siteid,{withCredentials:false})
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
    return this.http.get(this.config.get("API_ENDPOINT")+'/search?countOnly=true&siteid='+data.id,{withCredentials:false})
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
