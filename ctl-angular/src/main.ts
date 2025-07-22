import {bootstrapApplication} from '@angular/platform-browser';
import {AppComponent} from './app/app.component';
import {provideHttpClient} from "@angular/common/http";
import {async} from "rxjs";

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
  ],
})
  .catch((err) => console.error(err));
