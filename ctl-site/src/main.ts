import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from "@angular/common/http";
import { PreloadAllModules, provideRouter, withInMemoryScrolling, withPreloading } from "@angular/router";
import { routes } from "./app/utils/routes.model";
import { provideServiceWorker } from '@angular/service-worker';
import { isDevMode } from '@angular/core';

// Old links used hash routes (/#/creche); move them to the plain path.
if (location.hash.startsWith('#/')) {
    history.replaceState(null, '', location.hash.slice(1));
}

bootstrapApplication(AppComponent, {
    providers: [
        provideHttpClient(),
        provideRouter(
            routes,
            withPreloading(PreloadAllModules),
            // A new page opens at the top; going back returns to where the visitor was.
            withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })
        ),
        provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
        })
    ],
})
    .catch((err) => console.error(err));
