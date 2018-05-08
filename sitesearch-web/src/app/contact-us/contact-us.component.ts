import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})
export class ContactUsComponent implements OnInit {

  public isSubmitInProgress: boolean;

  constructor() { }

  ngOnInit() {
  }

  submit(data){
    console.log(data);
  }

}
