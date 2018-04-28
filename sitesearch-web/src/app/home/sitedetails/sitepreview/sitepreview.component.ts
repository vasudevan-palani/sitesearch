import { Component, OnInit } from '@angular/core';
import { SiteService } from 'app/services/site.service';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-sitepreview',
  templateUrl: './sitepreview.component.html',
  styleUrls: ['./sitepreview.component.scss']
})
export class SitePreviewComponent implements OnInit {

  constructor(private siteSvc : SiteService,private route : ActivatedRoute) { }

  public response: any;
  private siteid : string;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if(params['siteid']){
        this.siteid = params['siteid'];
      }
    });
  }

  search(data){
    data.siteid = this.siteid;
    console.log(data);
    window["dataLayer"].push({'event':'test-event','data':data})
    this.siteSvc.search(data).subscribe(response => this.response = response);
  }
}
