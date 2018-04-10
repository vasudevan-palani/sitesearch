import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-angular24tutorials',
  templateUrl: './angular24tutorials.component.html',
  styleUrls: ['./angular24tutorials.component.scss']
})
export class Angular24tutorialsComponent implements OnInit {

  constructor() { }

  ngOnInit() {

  }

  ngAfterViewInit(){
    this.tabChange({});
  }

  ngAfterContentInit(){
    this.tabChange({});
  }

  tabChange($event){
    setTimeout(function(){
      window["$"]('pre code').each(function(i, block) {
        window["hljs"].highlightBlock(block);
      });
    },100);
  }

}
