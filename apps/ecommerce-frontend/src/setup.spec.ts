import { getTestBed } from '@angular/core/testing';
import {
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

const testBed = getTestBed();

if (!testBed.platform) {
    testBed.initTestEnvironment(
        BrowserDynamicTestingModule,
        platformBrowserDynamicTesting(),
    );
}
