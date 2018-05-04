import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/first';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ConfigService } from 'app/services/config.service';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { User } from 'app/defs/User';
import { UserPreferences } from 'app/defs/UserPreferences'
import {UserAccountStatus} from 'app/defs/UserAccountStatus'
@Injectable()
export class UserService {

  public user: BehaviorSubject<User>;

  public preferences: BehaviorSubject<UserPreferences>;

  constructor(
    private config: ConfigService,
    private http: Http,
    private afAuth: AngularFireAuth,
    private db: AngularFireDatabase
  ) {
    this.user = new BehaviorSubject(new User());
    this.preferences = new BehaviorSubject(new UserPreferences());

    this.afAuth.authState.subscribe(firebaseuser => {
      console.log("Firebase user changed", firebaseuser);
      this.user.next(this.mapUser(firebaseuser));
    });

    let preferencesSubscription = this.user.subscribe(user => {
      if (user.loginStatus == true) {
        this.db.object('/user-preferences/' + user.id).subscribe(preferences => {
          this.preferences.next(preferences);
        });
        preferencesSubscription.unsubscribe();
      }
    });

  }

  isLoggedIn() {
    return this.user.getValue().loginStatus;
  }

  login(data) {
    return this.afAuth.auth.signInWithEmailAndPassword(data.email, data.password);
  }

  loginWithGmail() {
    var provider = new firebase.auth.GoogleAuthProvider();
    return this.afAuth.auth.signInWithPopup(provider);
  }

  logout() {
    this.afAuth.auth.signOut();
  }

  signup(data) {
    return this.afAuth.auth.createUserWithEmailAndPassword(data.email, data.password);
  }

  getToken() {
    return this.afAuth.auth.currentUser.getToken(true);
  }

  updatePlanId(planId) {
    let websites = this.db.list('/websites', {
      query: {
        orderByChild: 'userId',
        equalTo: this.user.getValue().id
      }
    });

    websites.first().subscribe((siteList) => {
      siteList.map(site => {
        this.db.object("/websites/" + site.$key).update({ 'planId': planId });
      });
    });
  }

  updateCard(card){
    let preferences = {
      card : card
    }
    this.db.object("/user-preferences/" + this.user.getValue().id).update(preferences);
  }

  getQuote(){
    return this.http.get(this.config.get("API_ENDPOINT")+'/quote?userId='+this.user.getValue().id,{withCredentials:false})
    .map((res:Response) => res.json());
  }

  activateAccount(customerId){
    let preferences = {
        status: 'ACTIVE',
        activationDate : Date.now(),
        nextChargeDate : Date.now()+2628000000,
        customerId: customerId
    }
    this.db.object("/user-preferences/" + this.user.getValue().id).update(preferences);
  }

  updateEmail() {
    console.log("Updating email",this.user.getValue());
    let preferences = this.db.object("/user-preferences/" + this.user.getValue().id);
    preferences.update({
        'email': this.user.getValue().email
    });
  }

  subscribeForTrial() {
    let preferences = this.db.object("/user-preferences/" + this.user.getValue().id);
    preferences.set({
        'email' : this.user.getValue().email,
        'status': 'TRIAL',
        'trial': {
          startDate: Date.now(),
          endDate: (new Date()).setTime((new Date()).getTime() + 24 * 7 * 60 * 60 * 1000)
        }
    });
  }

  mapUser(firebaseuser: any): User {
    var user = new User();
    if (firebaseuser) {
      user.email = firebaseuser.email;
      user.id = firebaseuser.uid;
      user.lastLogin = null;
      user.loginStatus = true;
      if (firebaseuser.customerId)
        user.customerId = firebaseuser.customerId;
    }
    else {
      user.loginStatus = false;
    }
    return user;
  }

}
