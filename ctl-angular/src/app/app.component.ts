import {Component} from '@angular/core';
import {NavbarComponent} from "./navbar/navbar.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [NavbarComponent],
  standalone: true
})
export class AppComponent {
  title = 'ctl-angular';
}
