import Modifier, { ArgsFor, PositionalArgs, NamedArgs } from 'ember-modifier';
import { registerDestructor } from '@ember/destroyable';
import type component from '../components/marquee';
import { inject as service } from '@ember/service';
import type ResizeObserverService from 'ember-resize-observer-service/services/resize-observer';

interface MarqueeModifierSignature {
  Args: {
    Named: {
      delay?: number;
      direction?: 'left' | 'right';
      fillRow?: boolean;
      gradientWidth?: string;
      loop?: number;
      pauseOnClick?: boolean;
      pauseOnHover?: boolean;
      play?: boolean;
      rgbaGradientColor?: string;
      speed?: number;
    };
    Positional: [component];
  };
}

function cleanup(instance: MarqueeModifier): void {
  instance.resizeObserver.unobserve(instance.containerEl, instance.boundFn);
  instance.resizeObserver.unobserve(instance.marqueeEl, instance.boundFn);
  instance.listeningForResize = false;
}

type MarqueeState = NamedArgs<MarqueeModifierSignature>;

export default class MarqueeModifier extends Modifier<MarqueeModifierSignature> {
  @service resizeObserver!: ResizeObserverService;

  boundFn!: () => void;
  component?: component;
  containerEl!: HTMLDivElement;
  marqueeEl!: HTMLDivElement;
  delay?: MarqueeState['delay'];
  direction?: MarqueeState['direction'];
  fillRow?: MarqueeState['fillRow'];
  gradientWidth?: MarqueeState['gradientWidth'];
  loop?: MarqueeState['loop'];
  pauseOnClick?: MarqueeState['pauseOnClick'];
  pauseOnHover?: MarqueeState['pauseOnHover'];
  play?: MarqueeState['play'];
  rgbaGradientColor?: MarqueeState['rgbaGradientColor'];
  speed?: MarqueeState['speed'];
  listeningForResize = false;
  numberOfDuplicatesNeeded = 1;

  constructor(owner: unknown, args: ArgsFor<MarqueeModifierSignature>) {
    super(owner, args);
    registerDestructor(this, cleanup);
  }

  measureAndSetCSSVariables(): void {
    if (
      !this.marqueeEl ||
      !this.containerEl ||
      !this.component ||
      !this.speed ||
      !this.gradientWidth
    ) {
      return;
    }

    const setProp = this.containerEl.style.setProperty.bind(
      this.containerEl.style
    );

    const fillRow = this.fillRow ? 'max-content' : '100%';
    const gradientColor = `${this.rgbaGradientColor}, 1), ${this.rgbaGradientColor}, 0)`;
    const play = this.play ? 'running' : 'paused';
    const pauseOnHover = this.pauseOnHover ? 'paused' : play;
    const pauseOnClick = this.pauseOnClick ? 'paused' : play;
    const direction = this.direction === 'left' ? 'normal' : 'reverse';
    const iterationCount = this.loop ? '' + this.loop : 'infinite';

    setProp('--gradient-color', gradientColor);
    setProp('--gradient-width', this.gradientWidth);
    setProp('--pause-on-hover', pauseOnHover);
    setProp('--pause-on-click', pauseOnClick);
    setProp('--play', play);
    setProp('--direction', direction);
    setProp('--delay', `${this.delay}s`);
    setProp('--iteration-count', iterationCount);
    setProp('--fill-row', fillRow);

    const containerWidth = this.containerEl.getBoundingClientRect().width;
    const marqueeWidth = this.marqueeEl.getBoundingClientRect().width;

    if (marqueeWidth < containerWidth) {
      // This is used to produce an array we can loop over in the template to output multiple
      // {{yield}} blocks tagged with aria-hidden.
      // As a marquee scrolls the duplicates are what fill in the space, we always need at least one duplicate.
      // By default a marquee will be 100% width matching the container, but if the fillRow option is used
      // our marquee will be as wide as it's contents, this means we need to calculate the number of duplicates
      // needed to fill in the white space.

      const numberOfDuplicatesNeeded = Math.ceil(containerWidth / marqueeWidth);
      if (this.numberOfDuplicatesNeeded !== numberOfDuplicatesNeeded) {
        this.numberOfDuplicatesNeeded = numberOfDuplicatesNeeded;
        this.component.repeater = [...Array(numberOfDuplicatesNeeded)];
      }
    }

    const duration =
      (this.fillRow || containerWidth < marqueeWidth
        ? marqueeWidth / this.speed
        : containerWidth / this.speed) + 's';

    const scrollAmount =
      this.fillRow || containerWidth < marqueeWidth
        ? `${marqueeWidth}px`
        : '100%';

    setProp('--marquee-scroll-amount', scrollAmount);
    setProp('--duration', duration);
  }

  modify(
    element: HTMLDivElement,
    [componentContext]: PositionalArgs<MarqueeModifierSignature>,
    {
      delay,
      direction,
      fillRow,
      gradientWidth,
      loop,
      pauseOnClick,
      pauseOnHover,
      play,
      rgbaGradientColor,
      speed,
    }: NamedArgs<MarqueeModifierSignature>
  ): void {
    this.component = componentContext;
    this.containerEl = element;
    this.marqueeEl = <HTMLDivElement>(
      this.containerEl.querySelector('.' + this.component.styles.marquee)
    );
    this.delay = delay;
    this.direction = direction;
    this.fillRow = fillRow;
    this.gradientWidth = gradientWidth;
    this.loop = loop;
    this.pauseOnClick = pauseOnClick;
    this.pauseOnHover = pauseOnHover;
    this.play = play;
    this.rgbaGradientColor = rgbaGradientColor;
    this.speed = speed;

    this.measureAndSetCSSVariables();

    if (!this.listeningForResize) {
      this.boundFn = this.measureAndSetCSSVariables.bind(this);
      this.resizeObserver.observe(this.containerEl, this.boundFn);
      this.resizeObserver.observe(this.marqueeEl, this.boundFn);
      this.listeningForResize = true;
    }
  }
}
