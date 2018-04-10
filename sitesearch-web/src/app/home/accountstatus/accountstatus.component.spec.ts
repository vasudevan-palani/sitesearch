import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountstatusComponent } from './accountstatus.component';

describe('AccountstatusComponent', () => {
  let component: AccountstatusComponent;
  let fixture: ComponentFixture<AccountstatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountstatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountstatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
