import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Angular24tutorialsComponent } from './angular24tutorials.component';

describe('Angular24tutorialsComponent', () => {
  let component: Angular24tutorialsComponent;
  let fixture: ComponentFixture<Angular24tutorialsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Angular24tutorialsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Angular24tutorialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
