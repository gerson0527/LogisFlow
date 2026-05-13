require('core-js/stable');
require('zone.js');
var context = require.context('./', true, /\.spec\.ts$/);
context.keys().map(context);
var testing = require('@angular/core/testing');
var browser = require('@angular/platform-browser-dynamic/testing');
testing.TestBed.initTestEnvironment(browser.BrowserDynamicTestingModule, browser.platformBrowserDynamicTesting());