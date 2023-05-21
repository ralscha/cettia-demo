import {inject, NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MessagesPage} from './pages/messages/messages.page';
import {RoomPage} from './pages/room/room.page';
import {AddRoomPage} from './pages/add-room/add-room.page';
import {SigninPage} from './pages/signin/signin.page';
import {AuthGuard} from './services/auth-guard.service';

const routes: Routes = [
  {path: '', redirectTo: 'room', pathMatch: 'full'},
  {path: 'messages/:room', component: MessagesPage, canActivate: [() => inject(AuthGuard).canActivate()]},
  {path: 'room', component: RoomPage, canActivate: [() => inject(AuthGuard).canActivate()]},
  {path: 'add-room', component: AddRoomPage, canActivate: [() => inject(AuthGuard).canActivate()]},
  {path: 'signin', component: SigninPage},
  {path: '**', redirectTo: '/'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
