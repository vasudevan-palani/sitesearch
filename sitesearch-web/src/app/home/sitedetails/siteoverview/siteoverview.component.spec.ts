import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteoverviewComponent } from './siteoverview.component';

describe('SiteoverviewComponent', () => {
  let component: SiteoverviewComponent;
  let fixture: ComponentFixture<SiteoverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SiteoverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteoverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
