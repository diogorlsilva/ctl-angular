import { Component, DestroyRef, effect, ElementRef, inject, Input, signal, viewChild } from '@angular/core';
import { CtlSkeletonComponent } from "@shared/ctl-skeleton/ctl-skeleton.component";

// Photo strip that slides by on its own in an endless loop. Visitors can
// grab it (mouse) or swipe it (touch); a flick carries on for a moment and
// then eases back into the steady drift.
@Component({
    selector: 'ctl-gallery',
    imports: [CtlSkeletonComponent],
    templateUrl: './ctl-gallery.component.html',
    styleUrl: './ctl-gallery.component.scss'
})
export class CtlGalleryComponent {
    @Input() images: string[] = [];
    @Input() loading = false;

    readonly skeletons = Array(6);
    // Loop length scales with the photo count, so the pace stays the same.
    readonly secondsPerPhoto = 6;

    private readonly track = viewChild<ElementRef<HTMLElement>>('track');
    private readonly reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

    // Strip position in px, always within (-half, 0]; velocity in px/ms.
    private offset = 0;
    private velocity = 0;
    private frame = 0;
    private lastFrame = 0;

    readonly dragging = signal(false);
    private lastX = 0;
    private lastMove = 0;

    constructor() {
        effect(() => this.track() ? this.start() : this.stop());
        inject(DestroyRef).onDestroy(() => this.stop());
    }

    onPointerDown(event: PointerEvent): void {
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        event.preventDefault();
        (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
        this.dragging.set(true);
        this.velocity = 0;
        this.lastX = event.clientX;
        this.lastMove = event.timeStamp;
    }

    onPointerMove(event: PointerEvent): void {
        if (!this.dragging()) return;
        const dx = event.clientX - this.lastX;
        const dt = event.timeStamp - this.lastMove;
        this.offset += dx;
        if (dt > 0) this.velocity = 0.8 * (dx / dt) + 0.2 * this.velocity;
        this.lastX = event.clientX;
        this.lastMove = event.timeStamp;
    }

    onPointerUp(event: PointerEvent): void {
        if (!this.dragging()) return;
        this.dragging.set(false);
        // Held still before letting go: no flick.
        if (event.timeStamp - this.lastMove > 100) this.velocity = 0;
    }

    private start(): void {
        if (this.frame) return;
        this.lastFrame = performance.now();
        this.frame = requestAnimationFrame(this.tick);
    }

    private stop(): void {
        cancelAnimationFrame(this.frame);
        this.frame = 0;
    }

    private readonly tick = (now: number): void => {
        const dt = Math.min(now - this.lastFrame, 50);
        this.lastFrame = now;
        const track = this.track()?.nativeElement;
        if (!track) {
            this.frame = 0;
            return;
        }

        // The photos run twice, so half the strip is one full loop.
        const half = track.scrollWidth / 2;
        if (half > 0) {
            if (!this.dragging()) {
                this.velocity += (this.drift(half) - this.velocity) * (1 - Math.exp(-dt / 500));
                this.offset += this.velocity * dt;
            }
            this.offset = -(((-this.offset % half) + half) % half);
            track.style.transform = `translateX(${this.offset}px)`;
        }
        this.frame = requestAnimationFrame(this.tick);
    };

    // Steady leftward pace; none when the visitor prefers no motion.
    private drift(half: number): number {
        if (this.reducedMotion.matches || !this.images.length) return 0;
        return -half / (this.images.length * this.secondsPerPhoto * 1000);
    }
}
