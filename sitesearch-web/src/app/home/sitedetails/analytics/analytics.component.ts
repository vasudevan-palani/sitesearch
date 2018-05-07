import { Component, OnInit } from '@angular/core';
import { SiteService } from 'app/services/site.service';
import { UserService } from 'app/services/user.service';
import { LogService } from 'app/services/log.service';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import {Router, ActivatedRoute} from '@angular/router';
import { Chart } from 'angular-highcharts';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit {

  public analytics : any;

  public pagesByLang :any;

  public requestsByDate :any;

  constructor(
    private siteSvc: SiteService,
    private log : LogService,
    private router:Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    let siteId = this.route.snapshot.queryParams['siteid'];
    if(siteId != undefined){
      this.siteSvc.getAnalytics(siteId).subscribe((analytics: any) => {
        this.analytics = analytics.results;
        this.createPagesByLang(this.analytics);
        this.createRequestsByDate(this.analytics);
      });
    }

  }

  createPagesByLang(analytics){
    let data = [];
    if(analytics.pagesByLang){
      analytics.pagesByLang.forEach(item => {
        data.push([item.key,item.doc_count]);
      });
    }

    this.pagesByLang = new Chart({
        chart: {
          type: 'column'
        },
        title: {
          text: 'Documents by lang'
        },
        xAxis: {
            type: 'category',
            labels: {
                style: {
                    fontSize: '13px',
                    fontFamily: 'Verdana, sans-serif'
                }
            }
        },
        yAxis : {
          title: {
              text: 'Count'
          }
        },
        plotOptions: {
          column: {
            dataLabels: {
                      enabled: true
                  },
            pointPadding: 0.2,
            borderWidth: 0
          }
        },
        credits: {
          enabled: false
        },
        series: [{
          name: 'Language',
          data: data
        }]
      });
  }

  createRequestsByDate(analytics){
    let data = [];
    if(analytics.searchRequests && analytics.searchRequests.items){
      analytics.searchRequests.items.forEach(item => {
        data.push([item.timestamp,parseInt(item.count)]);
      });
    }

    console.log(data);
    this.requestsByDate = new Chart({
        chart: {
          type: 'column'
        },
        title: {
          text: 'Requests by date'
        },
        xAxis: {
            type: 'category',
            labels: {
              rotation: -90,
                style: {
                    fontSize: '13px',
                    fontFamily: 'Verdana, sans-serif'
                }
            }
        },
        yAxis : {
          title: {
              text: 'Count'
          }
        },
        plotOptions: {
          column: {
            dataLabels: {
                      enabled: true
                  },
            pointPadding: 0.2,
            borderWidth: 0
          }
        },
        credits: {
          enabled: false
        },
        series: [{
          name: 'Requests by date',
          data: data
        }]
      });
  }

}
