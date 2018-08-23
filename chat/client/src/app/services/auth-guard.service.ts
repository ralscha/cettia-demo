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
      if (username !== null) {
        return this.chatService.signin(username).then(ok => {
          if (!ok) {
            this.navCtrl.goRoot('/signin');
          }
          return ok;
        });
      } else {
        this.navCtrl.goRoot('/signin');
        return false;
      }
    }

    return true;
  }

}
