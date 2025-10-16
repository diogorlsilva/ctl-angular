import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from "@angular/common/http";
import { provideRouter } from "@angular/router";
import { routes } from "./app/utils/routes.model";
import { HashLocationStrategy, LocationStrategy } from "@angular/common";

bootstrapApplication(AppComponent, {
    providers: [
        provideHttpClient(),
        provideRouter(routes),
        { provide: LocationStrategy, useClass: HashLocationStrategy }
    ],
})
    .catch((err) => console.error(err));
