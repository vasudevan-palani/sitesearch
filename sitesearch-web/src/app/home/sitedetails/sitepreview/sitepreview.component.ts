import { Component, OnInit, ViewChild } from '@angular/core';
import { SiteService } from 'app/services/site.service';
import { ActivatedRoute } from '@angular/router';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/merge';

const WIKI_URL = 'https://en.wikipedia.org/w/api.php';
const PARAMS = new HttpParams({
  fromObject: {
    action: 'opensearch',
    format: 'json',
    origin: '*'
  }
});

@Component({
  selector: 'app-sitepreview',
  templateUrl: './sitepreview.component.html',
  styleUrls: ['./sitepreview.component.scss']
})
export class SitePreviewComponent implements OnInit {

  searching = false;
  searchFailed = false;
  hideSearchingWhenUnsubscribed = new Observable(() => () => this.searching = false);

  constructor(private siteSvc : SiteService,private route : ActivatedRoute, private http: HttpClient) { }

  public response: any;
  private siteid : string;

  @ViewChild("searchform") searchform;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if(params['siteid']){
        this.siteid = params['siteid'];
      }
    });
  }

  search(data){
    this.searchform.tag = data.tag;
    data.siteid = this.siteid;
    console.log(data);
    window["dataLayer"].push({'event':'test-event','data':data})
    this.siteSvc.search(data).subscribe(response => this.response = response);
  }

  httpSearch(term:string){
    return this.siteSvc.search({'tag':term,'siteid':this.siteid}).map(response => response.suggestions);
    // return this.http
    //   .get(WIKI_URL, {params: PARAMS.set('search', term)})
    //   .map(response => response[1]);
  }

  autosearch = (text$: Observable<string>) =>
  text$
    .debounceTime(300)
    .distinctUntilChanged()
    .do(() => this.searching = true)
    .switchMap(term =>
      this.httpSearch(term)
        .do(() => this.searchFailed = false)
        .catch(() => {
          this.searchFailed = true;
          return of([]);
        }))
    .do(() => this.searching = false)
    .merge(this.hideSearchingWhenUnsubscribed);
}
