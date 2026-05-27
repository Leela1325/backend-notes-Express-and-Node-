import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app/app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { authInterceptor } from './app/interceptors/auth.interceptors';   

bootstrapApplication(AppComponent, {providers :[ provideRouter(routes , withComponentInputBinding()) , provideHttpClient(withInterceptors([authInterceptor])), provideAnimationsAsync() ]})
  .catch((err) => console.error(err));
