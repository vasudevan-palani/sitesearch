import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/observable/throw';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Observable } from 'rxjs/Observable';
import { ConfigService } from 'app/services/config.service';

import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';

import { User } from 'app/defs/user';

import { ServiceResponse } from 'app/defs/serviceresponse';
import { ErrorCodes } from 'app/defs/errorcodes';

import { User as FireBaseUser } from 'firebase';
import { UserAccount } from 'app/defs/useraccount';
import { UserAccountStatus } from 'app/defs/userstatus';

import * as firebase from 'firebase/app';

@Injectable()
export class UserService {

  public user : ReplaySubject<User>;

  private userValue : User;

  private loginstatusSubject : ReplaySubject<boolean> = new ReplaySubject<boolean>(1);;
  constructor (
    private http: Http,
    private config : ConfigService,
    private afAuth: AngularFireAuth,
    private db : AngularFireDatabase
  ) {
    this.userValue = new User();
    this.userValue.loginstatus=false;
    this.user = new ReplaySubject<User>(1);
    this.afAuth.authState.subscribe(firebaseuser => {
      console.log(firebaseuser);
      this.userValue = this.mapUser(firebaseuser);
      this.user.next(this.userValue);

    });
  }

  isLoggedIn(){
    return this.userValue.loginstatus;
  }

  login(data) : Observable<ServiceResponse> {
    var svcpromise = new Observable<ServiceResponse>((observer:any)=> {
      var svcResponse = new ServiceResponse();
      var that:any = this;
      this.afAuth.auth.signInWithEmailAndPassword(data.email, data.password)
      .then(firebaseuser => {
        console.log(firebaseuser);
        svcResponse.code = ErrorCodes.SUCCESS;

        observer.next(svcResponse);
      })
      .catch(error => {
        console.log("Login Failed",observer);
        observer.error(error);
      });
    });

    return svcpromise;

  }

  loginWithGmail() : Observable<ServiceResponse> {
    var svcpromise = new Observable<ServiceResponse>((observer:any)=> {
      var svcResponse = new ServiceResponse();
      var that:any = this;

      var auth:any = this.afAuth.auth;
      console.log(auth);

      var provider = new firebase.auth.GoogleAuthProvider();

      this.afAuth.auth.signInWithPopup(provider).then(firebaseuser => {
        console.log(firebaseuser);
        svcResponse.code = ErrorCodes.SUCCESS;

        observer.next(svcResponse);
      })
      .catch(error => {
        console.log("Login Failed",observer);
        observer.error(error);
      });
    });

    return svcpromise;
  }

  logout() {
    this.afAuth.auth.signOut();
  }

  signup(data) {

    var svcpromise = new Observable<ServiceResponse>((observer:any)=> {
      var svcResponse = new ServiceResponse();
      var that:any = this;
      this.afAuth.auth.createUserWithEmailAndPassword(data.email, data.password)
      .then(firebaseuser => {
        console.log(firebaseuser);
        svcResponse.code = ErrorCodes.SUCCESS;

        var preferences = {};
        preferences[firebaseuser.uid]={
          status : UserAccountStatus.NEW,
          userId : firebaseuser.uid
        }

        this.db.object("/user-preferences").update(preferences);

        observer.next(svcResponse);
      })
      .catch(error => {
        console.log("SignUp Failed",observer);
        observer.error(error);
      });
    });

    return svcpromise;
  }

  getToken(){
    return this.afAuth.auth.currentUser.getToken(true);
  }

  getPreferences(user){
    return new Promise((resolve,reject)=>{
      this.db.list('/user-preferences',{
          query : {
            orderByChild : 'userId',
            equalTo : user.id
          }
      }).first().subscribe(list => {
        var userPreferences = list[0];
        console.log(userPreferences);
        if(userPreferences){
          user.customerid = userPreferences.customerId;
          user.account = new UserAccount();
          //user.account.activationTime = userPreferences.activationTime ? new Date(userPreferences.activationTime * 1000) : undefined;
          //user.account.currentPlan = userPreferences.currentPlan;
          /**
          NEW,TRIAL,ACTIVATED,SUSPENDED,CLOSED
          */
          user.account.status = userPreferences.status;
          if(userPreferences.trial){
            user.account.trial ={
              startDate : userPreferences.trial.startDate ? new Date(userPreferences.trial.startDate * 1000) : undefined,
              endDate : userPreferences.trial.endDate ? new Date(userPreferences.trial.endDate * 1000) : undefined
            }
          }
          resolve(user);

        }
        else {

          // the user is new, could have logged in using GMAIL
          //
          var preferences = {};
          preferences[this.userValue.id]={
            status : UserAccountStatus.NEW,
            userId : this.userValue.id
          }

          this.db.object("/user-preferences").update(preferences);

          this.getPreferences(this.userValue).then(user=>{
            resolve(user);
          })
          .catch(error => {
            reject(error);
          });
        }
      },error => {
        reject(error);
      });
    });

  }


  subscribeForTrial(userId,customerId){
    var preferences = this.db.object("/user-preferences/"+userId);
    var now = new Date();
    preferences.update({'status':UserAccountStatus.TRIAL,'trial':{
      startDate : now.getTime()/1000,
      endDate : (new Date()).setTime(now.getTime()+24*7*60*60*1000)/1000
    }});
  }

    mapUser(firebaseuser:any) : User{
    var user = new User();
    if(firebaseuser){
      user.email = firebaseuser.email;
      user.id = firebaseuser.uid;
      user.lastLogin = null;
      user.loginstatus = true;
      if(firebaseuser.customerId)
        user.customerid = firebaseuser.customerId;
    }
    else {
      user.loginstatus = false;
    }
    return user;
  }

}
