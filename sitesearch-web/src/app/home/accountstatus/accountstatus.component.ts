import { Component, OnInit,Input } from '@angular/core';
import { User } from 'app/defs/User';

@Component({
  selector: 'home-accountstatus',
  templateUrl: './accountstatus.component.html',
  styleUrls: ['./accountstatus.component.scss']
})
export class AccountstatusComponent implements OnInit {

  @Input()
  public preferences:UserPreferences;

  constructor() { }

  ngOnInit() {
  }

}
