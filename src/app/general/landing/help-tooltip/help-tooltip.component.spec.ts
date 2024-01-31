import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpTooltipComponent } from './help-tooltip.component';

describe('HelpTooltipComponent', () => {
  let component: HelpTooltipComponent;
  let fixture: ComponentFixture<HelpTooltipComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HelpTooltipComponent],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
