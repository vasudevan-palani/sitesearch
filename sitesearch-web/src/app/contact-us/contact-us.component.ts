import { Component, OnInit } from '@angular/core';
import { UserService } from 'app/services/user.service';
@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})
export class ContactUsComponent implements OnInit {

  public isSubmitInProgress: boolean;
  public showSentMessage: boolean;

  constructor(
    private userSvc : UserService
  ) { }

  ngOnInit() {
  }

  submit(data){
    this.isSubmitInProgress = true;
    this.userSvc.sendMessage(data).subscribe(resp => {
      this.isSubmitInProgress = false;
      this.showSentMessage = true;
      setTimeout(()=>{
        this.showSentMessage = false;
      },5000);
    },err => {
      this.isSubmitInProgress = false;
    });
  }

}
