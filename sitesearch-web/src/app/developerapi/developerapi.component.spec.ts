import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeveloperapiComponent } from './developerapi.component';

describe('DeveloperapiComponent', () => {
  let component: DeveloperapiComponent;
  let fixture: ComponentFixture<DeveloperapiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeveloperapiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeveloperapiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
