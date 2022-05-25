import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import styles from './marquee.css';

type WithoutNullableKeys<Type> = {
  [Key in keyof Type]-?: WithoutNullableKeys<NonNullable<Type[Key]>>;
};
interface MarqueeSignature {
  /**
   * Whether to play or pause the marquee
   * Type: boolean
   * Default: true
   */
  play?: boolean;
  /**
   * Whether to fill in empty space
   * Type: boolean
   * Default: false
   */
  fillRow?: boolean;
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
   * Default: false
   */
  gradient?: boolean;
  /**
   * The rgb color of the gradient as an array of length 3
   * Type: string
   * Default: 255, 255, 255
   */
  gradientColor?: string;
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

type Getters = WithoutNullableKeys<MarqueeSignature>;

export default class Marquee extends Component<MarqueeSignature> {
  styles = styles;

  @tracked containerWidth = 0;
  @tracked marqueeWidth = 0;

  get fillRow(): Getters['fillRow'] {
    return this.args.fillRow || false;
  }

  get play(): Getters['play'] {
    if (typeof this.args.play === 'undefined') {
      return true;
    }
    return this.args.play;
  }

  get pauseOnHover(): Getters['pauseOnHover'] {
    return this.args.pauseOnHover || false;
  }

  get pauseOnClick(): Getters['pauseOnClick'] {
    return this.args.pauseOnClick || false;
  }

  get loop(): Getters['loop'] {
    return this.args.loop || 0;
  }

  get direction(): Getters['direction'] {
    return this.args.direction || 'left';
  }

  get speed(): Getters['speed'] {
    return this.args.speed || 20;
  }

  get delay(): Getters['delay'] {
    return this.args.delay || 0;
  }

  get gradient(): Getters['gradient'] {
    return this.args.gradient || false;
  }

  get gradientColor(): Getters['gradientColor'] {
    return this.args.gradientColor || '255, 255, 255';
  }

  // If the value we receive is a number use it as a percentage,
  // if we receive a string, use that as is for the value
  get gradientWidth(): string {
    const width = this.args.gradientWidth
      ? this.args.gradientWidth === 'number'
        ? `${this.args.gradientWidth}%`
        : <string>this.args.gradientWidth
      : null;
    return width || '5%';
  }

  get rgbaGradientColor(): string {
    const gc = this.gradientColor.split(',');
    return `rgba(${gc[0]}, ${gc[1]}, ${gc[2]}`;
  }

  // This is used to produce an array we can loop over in the template to output multiple
  // {{yield}} blocks tagged with aria-hidden.
  // If the marquee container is larger or the same size as the container, we only need one duplicate,
  // otherwise always need at least 1 duplicate or we calculate how many to fill the space
  get repeater(): number[] {
    if (this.marqueeWidth >= this.containerWidth) return [0];
    return [...Array(Math.ceil(this.containerWidth / this.marqueeWidth))];
  }

  @action
  onFinish(): void {
    if (this.args.onFinish) this.args.onFinish();
  }

  @action
  onCycleComplete(): void {
    if (this.args.onCycleComplete) this.args.onCycleComplete();
  }
}
