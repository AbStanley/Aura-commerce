import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { API_BASE_URL } from './core/api/api.configuration';
import { provideZonelessChangeDetection, NO_ERRORS_SCHEMA } from '@angular/core';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        provideZonelessChangeDetection(),
        { provide: API_BASE_URL, useValue: 'http://api.test' },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .overrideComponent(App, {
        set: {
          imports: [],
          schemas: [NO_ERRORS_SCHEMA]
        }
      })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the main layout', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-main-layout')).toBeTruthy();
  });
});
