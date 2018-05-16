import { Component } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

@Component({
  selector: 'app-main',
  templateUrl: 'main.component.html',
  styleUrls: ['main.component.scss'],
  animations: [
    trigger('fadeBottom', [
      transition(':enter', [
        style({opacity: 0,transform: 'translateY(-10%)'}),
        animate('500ms ease-in')
      ])
    ]),
    trigger('fadeLeft', [
      transition(':enter', [
        style({opacity: 0,transform: 'translateX(-10%)'}),
        animate('500ms ease-in')
      ])
    ]),
    trigger('fadeRight', [
      transition(':enter', [
        style({opacity: 0,transform: 'translateX(+10%)'}),
        animate('500ms ease-in')
      ])
    ])
  ]
})
export class AppMainComponent {
  title = 'app works!';
}
