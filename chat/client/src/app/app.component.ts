import {Component} from '@angular/core';
import {register} from 'swiper/element/bundle';
import {IonApp, IonRouterOutlet} from "@ionic/angular/standalone";

register();

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [
    IonRouterOutlet,
    IonApp
  ]
})
export class AppComponent {
}
