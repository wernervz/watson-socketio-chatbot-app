import { NgModule, InjectionToken } from '@angular/core';

export let APP_CONFIG = new InjectionToken<AppConfig>('app.config');

// Add the configuration variables here...
export class AppConfig {
  app_title: string;
  chat_title: string;
}

// Add the values for the config variables here...
export const APP_DI_CONFIG: AppConfig = {
  app_title: 'Chat with Watson',
  chat_title: 'Chat with Watson...'
};

@NgModule({
  providers: [{
    provide: APP_CONFIG,
    useValue: APP_DI_CONFIG
  }]
})
export class AppConfigModule { }