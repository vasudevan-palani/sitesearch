import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewpaymentsComponent } from './newpayments.component';

describe('NewpaymentsComponent', () => {
  let component: NewpaymentsComponent;
  let fixture: ComponentFixture<NewpaymentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewpaymentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewpaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
