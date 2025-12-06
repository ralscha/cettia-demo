import { provideZoneChangeDetection } from "@angular/core";
import {provideRouter, RouteReuseStrategy, withHashLocation} from '@angular/router';
import {IonicRouteStrategy, provideIonicAngular} from '@ionic/angular/standalone';
import {bootstrapApplication} from '@angular/platform-browser';
import {AppComponent} from './app/app.component';
import {provideHttpClient} from "@angular/common/http";
import {routes} from "./app/app.routes";


bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection(),provideIonicAngular(),
    {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
    provideHttpClient(),
    provideRouter(routes, withHashLocation())
  ]
})
  .catch(err => console.error(err));
