import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss'
})
export class ModalComponent {
  @Input({required: true}) modalId: string;
  @Input() title: string;
  @Input() content: string;
  @Input() hasFooter = false;


}
