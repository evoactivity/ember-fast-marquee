import Component from '@glimmer/component';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import { tracked } from '@glimmer/tracking';
import styles from './marquee.css';

interface MarqueeArgs {
  /**
   * Whether to play or pause the marquee
   * Type: boolean
   * Default: true
   */
  play?: boolean;
  /**
   * Whether to pause the marquee when hovered
   * Type: boolean
   * Default: false
   */
  pauseOnHover?: boolean;
  /**
   * Whether to pause the marquee when clicked
   * Type: boolean
   * Default: false
   */
  pauseOnClick?: boolean;
  /**
   * The direction the marquee is sliding
   * Type: "left" or "right"
   * Default: "left"
   */
  direction?: 'left' | 'right';
  /**
   * Speed calculated as pixels/second
   * Type: number
   * Default: 20
   */
  speed?: number;
  /**
   * Duration to delay the animation after render, in seconds
   * Type: number
   * Default: 0
   */
  delay?: number;
  /**
   * The number of times the marquee should loop, 0 is equivalent to infinite
   * Type: number
   * Default: 0
   */
  loop?: number;
  /**
   * Whether to show the gradient or not
   * Type: boolean
   * Default: true
   */
  gradient?: boolean;
  /**
   * The rgb color of the gradient as an array of length 3
   * Type: Array<number> of length 3
   * Default: [255, 255, 255]
   */
  gradientColor?: [number, number, number];
  /**
   * The width of the gradient on either side
   * Type: string
   * Default: 200
   */
  gradientWidth?: number | string;
  /**
   * A callback for when the marquee finishes scrolling and stops. Only calls if loop is non-zero.
   * Type: Function
   * Default: null
   */
  onFinish?: () => void;
  /**
   * A callback for when the marquee finishes a loop. Does not call if maximum loops are reached (use onFinish instead).
   * Type: Function
   * Default: null
   */
  onCycleComplete?: () => void;
}

export default class Marquee extends Component<MarqueeArgs> {
  styles = styles;

  hasMounted = false;

  @tracked containerWidth = 0;
  @tracked marqueeWidth = 0;
  @tracked containerEl?: HTMLDivElement = undefined;
  @tracked marqueeEl?: HTMLDivElement = undefined;
  @tracked duration = 0;

  get play(): MarqueeArgs['play'] {
    return this.args.play || true;
  }

  get pauseOnHover(): MarqueeArgs['pauseOnHover'] {
    return this.args.pauseOnHover || false;
  }

  get pauseOnClick(): MarqueeArgs['pauseOnClick'] {
    return this.args.pauseOnClick || false;
  }

  get loop(): MarqueeArgs['loop'] {
    return this.args.loop || 0;
  }

  get direction(): MarqueeArgs['direction'] {
    return this.args.direction || 'left';
  }

  get speed(): number {
    return this.args.speed || 20;
  }

  get delay(): MarqueeArgs['delay'] {
    return this.args.delay || 0;
  }

  get gradient(): MarqueeArgs['gradient'] {
    return this.args.gradient || false;
  }

  get gradientColor(): MarqueeArgs['gradientColor'] {
    return this.args.gradientColor || [255, 255, 255];
  }

  get gradientWidth(): MarqueeArgs['gradientWidth'] {
    return this.args.gradientWidth || 200;
  }

  get rgbaGradientColor(): string {
    return `rgba(${this.gradientColor?.[0]}, ${this.gradientColor?.[1]}, ${this.gradientColor?.[2]}`;
  }

  get containerStyles() {
    return htmlSafe(`--paused-on-hover: ${
      this.pauseOnHover ? 'paused' : 'running'
    };
    --pause-on-click: ${this.pauseOnClick ? 'paused' : 'running'};`);
  }

  get marqueeStyles() {
    return htmlSafe(`--play: ${this.play ? 'running' : 'paused'};
      --direction:
        ${this.direction === 'left' ? 'normal' : 'reverse'};
      --duration: ${this.duration}s;
      --delay: ${this.delay}s;
      --iteration-count: ${!!this.loop ? this.loop : 'infinite'};`);
  }

  @action
  onFinish(): void {
    if (this.args.onFinish) this.args.onFinish();
  }

  @action
  onCycleComplete(): void {
    if (this.args.onCycleComplete) this.args.onCycleComplete();
  }

  @action calculateWidth(): void {
    this.hasMounted = true;
    this.duration = 100;
    console.log('Calculate width running');
    console.log(this.marqueeEl, this.containerEl);
    if (this.marqueeEl && this.containerEl) {
      this.containerWidth = this.containerEl.getBoundingClientRect().width;
      this.marqueeWidth = this.marqueeEl.getBoundingClientRect().width;

      console.log('Marque width: ', this.marqueeWidth);
      console.log('Container width: ', this.containerWidth);

      if (this.marqueeWidth < this.containerWidth) {
        this.duration = this.containerWidth / this.speed;
      } else {
        this.duration = this.marqueeWidth / this.speed;
      }

      console.log('Duration: ', this.duration);
      console.log('Component Context:');
      console.log(this);
    }
  }

  @action registerContainer(el: HTMLDivElement): (el: HTMLDivElement) => void {
    this.containerEl = el;

    if (!this.hasMounted && this.marqueeEl) {
      this.calculateWidth();
    }
    return this.cleanupContainer;
  }

  @action registerMarquee(el: HTMLDivElement): (el: HTMLDivElement) => void {
    this.marqueeEl = el;

    if (!this.hasMounted && this.containerEl) {
      this.calculateWidth();
    }

    window.addEventListener('resize', this.calculateWidth);
    return this.cleanupMarquee;
  }

  @action cleanupContainer(el: HTMLDivElement): void {
    this.containerEl = undefined;
    window.removeEventListener('resize', this.calculateWidth);
  }

  @action cleanupMarquee(el: HTMLDivElement): void {
    this.marqueeEl = undefined;
  }
}
