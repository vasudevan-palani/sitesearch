import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutsummaryComponent } from './checkoutsummary.component';

describe('CheckoutsummaryComponent', () => {
  let component: CheckoutsummaryComponent;
  let fixture: ComponentFixture<CheckoutsummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckoutsummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutsummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
