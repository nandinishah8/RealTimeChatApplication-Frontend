import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { HttpClientModule } from '@angular/common/http';
import { ChatComponent } from './pages/chat/chat.component';
import { ConversationComponent } from './pages/conversation/Conversation.component';
import { RequestLogsComponent } from './pages/request-logs/request-logs.component';
import { SignalrService } from './services/signalr.service';
import {
  SocialLoginModule,
  SocialAuthServiceConfig,
  GoogleSigninButtonModule,
} from '@abacritt/angularx-social-login';
import { GoogleLoginProvider } from '@abacritt/angularx-social-login';
import { Subscription } from 'rxjs';

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
    ChatComponent,
    ConversationComponent,
    RequestLogsComponent,
  
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    SocialLoginModule,
    GoogleSigninButtonModule,
   
  ],
  providers: [
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '769595321126-34b52bv6kri8b04jv8f6n2g3dk4rmb5e.apps.googleusercontent.com'
            ),
          },
        ],
        onError: (err) => {
          console.error(err);
        },
      } as SocialAuthServiceConfig,
    },
    SignalrService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
