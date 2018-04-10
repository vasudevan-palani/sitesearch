import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StandardplanComponent } from './standardplan.component';

describe('StandardplanComponent', () => {
  let component: StandardplanComponent;
  let fixture: ComponentFixture<StandardplanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StandardplanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StandardplanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
