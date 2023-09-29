import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { ChatComponent } from './pages/chat/chat.component';
import { ConversationComponent } from './pages/conversation/Conversation.component';
import { RequestLogsComponent } from './pages/request-logs/request-logs.component';
import { ChannelListComponent } from './pages/channel-list/channel-list.component';

const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: '', component: LoginComponent },
  {
    path: 'chat',
    component: ChatComponent,
    children: [
      {
        path: 'user/:userId',
        component: ConversationComponent,
        outlet: 'childPopup',
      },
    ],
  },
  { path: 'logs', component: RequestLogsComponent },
  { path: 'channelList', component: ChannelListComponent },
  // { path: 'chat/:channelId', component: ChatComponent },
    {
    path: 'chat',
    component: ChatComponent,
    children: [
      {
        path: 'chat/:channelId',
        component: ConversationComponent,
        outlet: 'childPopup',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
