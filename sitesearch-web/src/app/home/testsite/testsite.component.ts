import { Component } from '@angular/core';
import { SiteService } from 'app/services/site.service';
import { UserService } from 'app/services/user.service';
import { User } from 'app/defs/user';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';


@Component({
  selector: 'testsite',
  templateUrl: 'testsite.component.html',
  styleUrls: ['testsite.component.scss']
})
export class TestSiteComponent {
  private user : User;
  public sites : FirebaseListObservable<any[]>;
  public domains : any;

  constructor(private siteSvc : SiteService,private userSvc : UserService){
    this.domains = [];
  }

  public results : any ;

  ngOnInit(){
    this.userSvc.user.subscribe((user: User) => {
      this.user = user;
      this.sites = this.siteSvc.list(this.user.id);
    });
  }

  selectSite(site) {
    console.log(site.domains);
    this.domains = [];
    site.domains.forEach(url => this.domains.push(url.replace('https://','').replace('http://','')));
  }
  search(data){
    console.log(data);
    window["dataLayer"].push({'event':'test-event','data':data})
    this.siteSvc.search(data).subscribe(response => this.results = response.results);
  }

}
