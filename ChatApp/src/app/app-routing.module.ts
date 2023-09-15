import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { ChatComponent } from './pages/chat/chat.component';
import { ConversationComponent } from './pages/conversation/Conversation.component';
import { RequestLogsComponent } from './pages/request-logs/request-logs.component';

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
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
