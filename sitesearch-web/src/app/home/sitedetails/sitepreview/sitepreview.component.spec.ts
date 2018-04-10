import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SitepreviewComponent } from './sitepreview.component';

describe('SitepreviewComponent', () => {
  let component: SitepreviewComponent;
  let fixture: ComponentFixture<SitepreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SitepreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SitepreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
