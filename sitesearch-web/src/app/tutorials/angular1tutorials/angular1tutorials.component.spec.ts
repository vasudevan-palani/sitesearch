import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Angular1tutorialsComponent } from './angular1tutorials.component';

describe('Angular1tutorialsComponent', () => {
  let component: Angular1tutorialsComponent;
  let fixture: ComponentFixture<Angular1tutorialsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Angular1tutorialsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Angular1tutorialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
