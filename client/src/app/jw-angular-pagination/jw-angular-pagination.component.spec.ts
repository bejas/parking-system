import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JwAngularPaginationComponent } from './jw-angular-pagination.component';

describe('JwAngularPaginationComponent', () => {
  let component: JwAngularPaginationComponent;
  let fixture: ComponentFixture<JwAngularPaginationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JwAngularPaginationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JwAngularPaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
