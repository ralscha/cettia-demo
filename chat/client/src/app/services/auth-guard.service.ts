import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';
import {ChatService} from './chat.service';
import {NavController} from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private readonly chatService: ChatService, private readonly navCtrl: NavController) {
  }

  canActivate(route: ActivatedRouteSnapshot,
              state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    if (!this.chatService.isLoggedIn()) {
      const username = sessionStorage.getItem('username');
      const language = sessionStorage.getItem('language');
      if (username !== null) {
        return this.chatService.signin(username, language, true).then(ok => {
          if (!ok) {
            this.navCtrl.navigateRoot('/signin');
          }
          return ok;
        });
      } else {
        this.navCtrl.navigateRoot('/signin');
        return false;
      }
    }

    return true;
  }

}
