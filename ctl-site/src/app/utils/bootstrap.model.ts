// Bootstrap is loaded as a plain script (see index.html), so its JS API is
// only reachable through window.bootstrap. Declare the parts the app calls.
// Import this file for its side effect wherever window.bootstrap is used.

export type BootstrapCarouselConfig = {
    interval?: number;
    ride?: 'carousel' | boolean;
    touch?: boolean;
    pause?: 'hover' | false;
    keyboard?: boolean;
};

export type BootstrapCarousel = {
    cycle(): void;
    pause(): void;
    dispose(): void;
};

declare global {
    interface Window {
        bootstrap?: {
            Dropdown: { getOrCreateInstance(element: Element): { show(): void; hide(): void } };
            Carousel: { getOrCreateInstance(element: Element, config?: BootstrapCarouselConfig): BootstrapCarousel };
        };
    }
}
