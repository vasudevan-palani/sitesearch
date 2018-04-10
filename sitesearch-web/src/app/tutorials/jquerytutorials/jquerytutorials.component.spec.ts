import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JquerytutorialsComponent } from './jquerytutorials.component';

describe('JquerytutorialsComponent', () => {
  let component: JquerytutorialsComponent;
  let fixture: ComponentFixture<JquerytutorialsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JquerytutorialsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JquerytutorialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
