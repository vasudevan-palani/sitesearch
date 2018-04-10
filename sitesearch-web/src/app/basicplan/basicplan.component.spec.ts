import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicplanComponent } from './basicplan.component';

describe('BasicplanComponent', () => {
  let component: BasicplanComponent;
  let fixture: ComponentFixture<BasicplanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BasicplanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BasicplanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
