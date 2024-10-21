import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { RegisterService } from './register/register.service';
import { HttpClientModule } from '@angular/common/http';
import { DashboardComponent } from './dashboard/dashboard.component'
import { AuthService } from './auth/auth.service';
import { ProfileComponent } from './profile/profile.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { DashboardService } from './dashboard/dashboard.component.service';
import { TaskFormComponent } from './task-form/task-form.component';
import { TaskListComponent } from './task-list/task-list.component';
import { NotificationComponent } from './notification/notification.component';
import { NotificationPreferencesComponent } from './notification-preferences/notification-preferences.component';
import { SettingsComponent } from './settings/settings.component';
import { ToastrModule } from 'ngx-toastr';
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    ProfileComponent,
    TaskFormComponent,
    TaskListComponent,
    NotificationComponent,
    NotificationPreferencesComponent,
    SettingsComponent
  ],
  imports: [
    AppRoutingModule ,
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    DragDropModule,
    HttpClientModule,
    AppRoutingModule,
    ToastrModule.forRoot()
  ],
  providers: [
    provideClientHydration(),
    AuthService,
    DashboardService,
    RegisterService,
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
