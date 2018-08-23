import {Component, OnInit} from '@angular/core';
import {AlertController, NavController} from '@ionic/angular';
import {ChatService} from '../../services/chat.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.page.html',
  styleUrls: ['./signin.page.scss'],
})
export class SigninPage implements OnInit {

  username: string;
  language = 'en';

  supportedLanguages = [
    {
      'language': 'af',
      'name': 'Afrikaans'
    },
    {
      'language': 'sq',
      'name': 'Albanian'
    },
    {
      'language': 'am',
      'name': 'Amharic'
    },
    {
      'language': 'ar',
      'name': 'Arabic'
    },
    {
      'language': 'hy',
      'name': 'Armenian'
    },
    {
      'language': 'az',
      'name': 'Azerbaijani'
    },
    {
      'language': 'eu',
      'name': 'Basque'
    },
    {
      'language': 'be',
      'name': 'Belarusian'
    },
    {
      'language': 'bn',
      'name': 'Bengali'
    },
    {
      'language': 'bs',
      'name': 'Bosnian'
    },
    {
      'language': 'bg',
      'name': 'Bulgarian'
    },
    {
      'language': 'ca',
      'name': 'Catalan'
    },
    {
      'language': 'ceb',
      'name': 'Cebuano'
    },
    {
      'language': 'zh-CN',
      'name': 'Chinese (Simplified)'
    },
    {
      'language': 'zh-TW',
      'name': 'Chinese (Traditional)'
    },
    {
      'language': 'co',
      'name': 'Corsican'
    },
    {
      'language': 'hr',
      'name': 'Croatian'
    },
    {
      'language': 'cs',
      'name': 'Czech'
    },
    {
      'language': 'da',
      'name': 'Danish'
    },
    {
      'language': 'nl',
      'name': 'Dutch'
    },
    {
      'language': 'en',
      'name': 'English'
    },
    {
      'language': 'eo',
      'name': 'Esperanto'
    },
    {
      'language': 'et',
      'name': 'Estonian'
    },
    {
      'language': 'fi',
      'name': 'Finnish'
    },
    {
      'language': 'fr',
      'name': 'French'
    },
    {
      'language': 'fy',
      'name': 'Frisian'
    },
    {
      'language': 'gl',
      'name': 'Galician'
    },
    {
      'language': 'ka',
      'name': 'Georgian'
    },
    {
      'language': 'de',
      'name': 'German'
    },
    {
      'language': 'el',
      'name': 'Greek'
    },
    {
      'language': 'gu',
      'name': 'Gujarati'
    },
    {
      'language': 'ht',
      'name': 'Haitian Creole'
    },
    {
      'language': 'ha',
      'name': 'Hausa'
    },
    {
      'language': 'haw',
      'name': 'Hawaiian'
    },
    {
      'language': 'iw',
      'name': 'Hebrew'
    },
    {
      'language': 'hi',
      'name': 'Hindi'
    },
    {
      'language': 'hmn',
      'name': 'Hmong'
    },
    {
      'language': 'hu',
      'name': 'Hungarian'
    },
    {
      'language': 'is',
      'name': 'Icelandic'
    },
    {
      'language': 'ig',
      'name': 'Igbo'
    },
    {
      'language': 'id',
      'name': 'Indonesian'
    },
    {
      'language': 'ga',
      'name': 'Irish'
    },
    {
      'language': 'it',
      'name': 'Italian'
    },
    {
      'language': 'ja',
      'name': 'Japanese'
    },
    {
      'language': 'jw',
      'name': 'Javanese'
    },
    {
      'language': 'kn',
      'name': 'Kannada'
    },
    {
      'language': 'kk',
      'name': 'Kazakh'
    },
    {
      'language': 'km',
      'name': 'Khmer'
    },
    {
      'language': 'ko',
      'name': 'Korean'
    },
    {
      'language': 'ku',
      'name': 'Kurdish (Kurmanji)'
    },
    {
      'language': 'ky',
      'name': 'Kyrgyz'
    },
    {
      'language': 'lo',
      'name': 'Lao'
    },
    {
      'language': 'la',
      'name': 'Latin'
    },
    {
      'language': 'lv',
      'name': 'Latvian'
    },
    {
      'language': 'lt',
      'name': 'Lithuanian'
    },
    {
      'language': 'lb',
      'name': 'Luxembourgish'
    },
    {
      'language': 'mk',
      'name': 'Macedonian'
    },
    {
      'language': 'mg',
      'name': 'Malagasy'
    },
    {
      'language': 'ms',
      'name': 'Malay'
    },
    {
      'language': 'ml',
      'name': 'Malayalam'
    },
    {
      'language': 'mt',
      'name': 'Maltese'
    },
    {
      'language': 'mi',
      'name': 'Maori'
    },
    {
      'language': 'mr',
      'name': 'Marathi'
    },
    {
      'language': 'mn',
      'name': 'Mongolian'
    },
    {
      'language': 'my',
      'name': 'Myanmar (Burmese)'
    },
    {
      'language': 'ne',
      'name': 'Nepali'
    },
    {
      'language': 'no',
      'name': 'Norwegian'
    },
    {
      'language': 'ny',
      'name': 'Nyanja (Chichewa)'
    },
    {
      'language': 'ps',
      'name': 'Pashto'
    },
    {
      'language': 'fa',
      'name': 'Persian'
    },
    {
      'language': 'pl',
      'name': 'Polish'
    },
    {
      'language': 'pt',
      'name': 'Portuguese'
    },
    {
      'language': 'pa',
      'name': 'Punjabi'
    },
    {
      'language': 'ro',
      'name': 'Romanian'
    },
    {
      'language': 'ru',
      'name': 'Russian'
    },
    {
      'language': 'sm',
      'name': 'Samoan'
    },
    {
      'language': 'gd',
      'name': 'Scots Gaelic'
    },
    {
      'language': 'sr',
      'name': 'Serbian'
    },
    {
      'language': 'st',
      'name': 'Sesotho'
    },
    {
      'language': 'sn',
      'name': 'Shona'
    },
    {
      'language': 'sd',
      'name': 'Sindhi'
    },
    {
      'language': 'si',
      'name': 'Sinhala'
    },
    {
      'language': 'sk',
      'name': 'Slovak'
    },
    {
      'language': 'sl',
      'name': 'Slovenian'
    },
    {
      'language': 'so',
      'name': 'Somali'
    },
    {
      'language': 'es',
      'name': 'Spanish'
    },
    {
      'language': 'su',
      'name': 'Sundanese'
    },
    {
      'language': 'sw',
      'name': 'Swahili'
    },
    {
      'language': 'sv',
      'name': 'Swedish'
    },
    {
      'language': 'tl',
      'name': 'Tagalog (Filipino)'
    },
    {
      'language': 'tg',
      'name': 'Tajik'
    },
    {
      'language': 'ta',
      'name': 'Tamil'
    },
    {
      'language': 'te',
      'name': 'Telugu'
    },
    {
      'language': 'th',
      'name': 'Thai'
    },
    {
      'language': 'tr',
      'name': 'Turkish'
    },
    {
      'language': 'uk',
      'name': 'Ukrainian'
    },
    {
      'language': 'ur',
      'name': 'Urdu'
    },
    {
      'language': 'uz',
      'name': 'Uzbek'
    },
    {
      'language': 'vi',
      'name': 'Vietnamese'
    },
    {
      'language': 'cy',
      'name': 'Welsh'
    },
    {
      'language': 'xh',
      'name': 'Xhosa'
    },
    {
      'language': 'yi',
      'name': 'Yiddish'
    },
    {
      'language': 'yo',
      'name': 'Yoruba'
    },
    {
      'language': 'zu',
      'name': 'Zulu'
    }
  ];

  constructor(private readonly navCtrl: NavController,
              private readonly chatService: ChatService,
              private readonly alertCtrl: AlertController) {
  }

  async ngOnInit() {
    const username = sessionStorage.getItem('username');
    const language = sessionStorage.getItem('language');
    if (username !== null) {
      const ok = await this.chatService.signin(username, language);
      if (ok) {
        this.navCtrl.goRoot('room');
      } else {
        sessionStorage.removeItem('username');
        sessionStorage.removeItem('language');
      }
    }
  }

  async enterUsername() {
    console.log(this.username);
    console.log(this.language);
    const ok = await this.chatService.signin(this.username, this.language);
    if (ok) {
      sessionStorage.setItem('username', this.username);
      sessionStorage.setItem('language', this.language);
      this.username = '';
      this.navCtrl.goRoot('room');
    } else {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Username already exists',
        buttons: [{
          text: 'OK',
          role: 'cancel'
        }]
      });
      await alert.present();
    }
  }


}
