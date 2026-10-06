import { Component, HostBinding, Input } from '@angular/core';

// Loading placeholder block. Layout is up to the caller: compose these inside
// the real block's containers so the skeleton takes the same space.
@Component({
    selector: 'ctl-skeleton',
    standalone: true,
    imports: [],
    template: '',
    styleUrl: './ctl-skeleton.component.scss',
    host: { 'aria-hidden': 'true' }
})
export class CtlSkeletonComponent {
    @Input() @HostBinding('style.width') width = '100%';
    @Input() @HostBinding('style.height') height = '1em';
    @Input() radius = 'var(--border-radius)';
    @Input() circle = false;

    @HostBinding('style.border-radius') get borderRadius(): string {
        return this.circle ? '50%' : this.radius;
    }
}
