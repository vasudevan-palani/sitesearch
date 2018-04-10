import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReacttutorialsComponent } from './reacttutorials.component';

describe('ReacttutorialsComponent', () => {
  let component: ReacttutorialsComponent;
  let fixture: ComponentFixture<ReacttutorialsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReacttutorialsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReacttutorialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
