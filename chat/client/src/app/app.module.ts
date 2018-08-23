import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';
import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {RelativeTimePipe} from './pipes/relative-time.pipe';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {EmojiPickerComponent} from './components/emoji-picker/emoji-picker';
import {AddRoomPage} from './pages/add-room/add-room.page';
import {MessagesPage} from './pages/messages/messages.page';
import {RoomPage} from './pages/room/room.page';
import {SigninPage} from './pages/signin/signin.page';

@NgModule({
  declarations: [AppComponent, RelativeTimePipe, EmojiPickerComponent, AddRoomPage, MessagesPage, RoomPage, SigninPage],
  entryComponents: [],
  imports: [BrowserModule, CommonModule,
    FormsModule, IonicModule.forRoot(), AppRoutingModule],
  providers: [
    {provide: RouteReuseStrategy, useClass: IonicRouteStrategy}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
