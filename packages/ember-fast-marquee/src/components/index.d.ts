declare module '*.css' {
  const styles: { [className: string]: string };
  export default styles;
}

declare module 'ember-resize-observer-service/services/resize-observer' {
  import Service from '@ember/service';

  export default class extends Service {
    isEnabled: boolean;
    observe(element: HTMLDivElement, callback: () => void): void;
    unobserve(element: HTMLDivElement, callback: () => void): void;
    clear(): void;
    willDestroy(): void;
    handleResize(entries: ResizeObserverEntry[]): void;
  }
}
