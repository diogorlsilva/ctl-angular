import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
    selector: 'ctl-navbar',
    standalone: true,
    imports: [RouterLink, RouterLinkActive],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
    isToggled = false;
    isGoingDown = false;

    private scrollY = window.scrollY;

    constructor() {

        this.scrollY = window.scrollY;

        window.addEventListener('scroll', (e) => {
            e.stopPropagation()

            if (document.body.style.overflow === 'hidden') {
                return;
            }

            this.isGoingDown = window.scrollY >= this.scrollY;
            this.scrollY = window.scrollY;
        })
    }
}
