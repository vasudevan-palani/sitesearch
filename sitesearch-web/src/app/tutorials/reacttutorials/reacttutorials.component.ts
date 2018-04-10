import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-reacttutorials',
  templateUrl: './reacttutorials.component.html',
  styleUrls: ['./reacttutorials.component.scss']
})
export class ReacttutorialsComponent implements OnInit {

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
