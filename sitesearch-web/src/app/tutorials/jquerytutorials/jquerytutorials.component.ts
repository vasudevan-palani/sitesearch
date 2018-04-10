import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-jquerytutorials',
  templateUrl: './jquerytutorials.component.html',
  styleUrls: ['./jquerytutorials.component.scss']
})
export class JquerytutorialsComponent implements OnInit {

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
