import { Component, OnInit,Input } from '@angular/core';
import { User } from 'app/defs/user';

@Component({
  selector: 'home-accountstatus',
  templateUrl: './accountstatus.component.html',
  styleUrls: ['./accountstatus.component.scss']
})
export class AccountstatusComponent implements OnInit {

  @Input()
  public user:User;

  constructor() { }

  ngOnInit() {
  }

}
