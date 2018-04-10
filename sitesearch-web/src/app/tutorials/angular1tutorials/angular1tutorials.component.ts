import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-angular1tutorials',
  templateUrl: './angular1tutorials.component.html',
  styleUrls: ['./angular1tutorials.component.scss']
})
export class Angular1tutorialsComponent implements OnInit {

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
