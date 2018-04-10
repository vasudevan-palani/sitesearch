import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListpaymentsComponent } from './listpayments.component';

describe('ListpaymentsComponent', () => {
  let component: ListpaymentsComponent;
  let fixture: ComponentFixture<ListpaymentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListpaymentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListpaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
