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
      marqueeSelector?: string;
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
  if (instance.boundFn) {
    instance.resizeObserver.unobserve(instance.containerEl, instance.boundFn);
    instance.resizeObserver.unobserve(instance.marqueeEl, instance.boundFn);
  }
  if (instance.listeningForResize) instance.listeningForResize = false;
}

type MarqueeState = NamedArgs<MarqueeModifierSignature>;

export default class MarqueeModifier extends Modifier<MarqueeModifierSignature> {
  @service resizeObserver!: ResizeObserverService;

  boundFn?: (() => void) | null = null;
  component?: component;
  containerEl!: HTMLDivElement;
  marqueeEl!: HTMLDivElement;
  delay?: MarqueeState['delay'];
  direction?: MarqueeState['direction'];
  fillRow?: MarqueeState['fillRow'];
  gradientWidth?: MarqueeState['gradientWidth'];
  loop?: MarqueeState['loop'];
  marqueeSelector?: MarqueeState['marqueeSelector'];
  pauseOnClick?: MarqueeState['pauseOnClick'];
  pauseOnHover?: MarqueeState['pauseOnHover'];
  play?: MarqueeState['play'];
  rgbaGradientColor?: MarqueeState['rgbaGradientColor'];
  speed?: MarqueeState['speed'];
  listeningForResize = false;

  constructor(owner: unknown, args: ArgsFor<MarqueeModifierSignature>) {
    super(owner, args);
    registerDestructor(this, cleanup);
  }

  measureAndSetCSSVariables(
    containerEl: HTMLDivElement,
    marqueeEl: HTMLDivElement
  ): void {
    if (
      !marqueeEl ||
      !containerEl ||
      !this.component ||
      !this.speed ||
      !this.gradientWidth
    ) {
      return;
    }

    const setProp = containerEl.style.setProperty.bind(containerEl.style);

    setProp('--fill-row', this.fillRow ? 'max-content' : '100%');
    setProp(
      '--gradient-color',
      `${this.rgbaGradientColor}, 1), ${this.rgbaGradientColor}, 0)`
    );

    setProp('--gradient-width', this.gradientWidth);

    setProp(
      '--pause-on-hover',
      !this.play ? 'paused' : this.pauseOnHover ? 'paused' : 'running'
    );
    setProp(
      '--pause-on-click',
      !this.play ? 'paused' : this.pauseOnClick ? 'paused' : 'running'
    );
    setProp('--play', this.play ? 'running' : 'paused');
    setProp('--direction', this.direction === 'left' ? 'normal' : 'reverse');

    setProp('--delay', `${this.delay}s`);
    setProp('--iteration-count', this.loop ? '' + this.loop : 'infinite');

    const containerWidth = (this.component.containerWidth =
      containerEl.getBoundingClientRect().width);
    const marqueeWidth = (this.component.marqueeWidth =
      marqueeEl.getBoundingClientRect().width);

    setProp(
      '--marquee-scroll-amount',
      this.fillRow || containerWidth < marqueeWidth
        ? `${marqueeWidth}px`
        : '100%'
    );

    const duration =
      this.fillRow || containerWidth < marqueeWidth
        ? marqueeWidth / this.speed
        : containerWidth / this.speed;

    setProp('--duration', `${duration}s`);
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
      marqueeSelector,
      pauseOnClick,
      pauseOnHover,
      play,
      rgbaGradientColor,
      speed,
    }: NamedArgs<MarqueeModifierSignature>
  ): void {
    this.component = componentContext;
    this.delay = delay;
    this.direction = direction;
    this.fillRow = fillRow;
    this.gradientWidth = gradientWidth;
    this.loop = loop;
    this.marqueeSelector = marqueeSelector;
    this.pauseOnClick = pauseOnClick;
    this.pauseOnHover = pauseOnHover;
    this.play = play;
    this.rgbaGradientColor = rgbaGradientColor;
    this.speed = speed;
    this.component.containerEl = element;
    this.marqueeEl = <HTMLDivElement>(
      this.component.containerEl.querySelector('.' + marqueeSelector)
    );

    this.measureAndSetCSSVariables(this.component.containerEl, this.marqueeEl);
    this.boundFn = this.measureAndSetCSSVariables.bind(
      this,
      this.component.containerEl,
      this.marqueeEl
    );
    if (!this.listeningForResize) {
      this.resizeObserver.observe(this.component.containerEl, this.boundFn);
      this.resizeObserver.observe(this.marqueeEl, this.boundFn);
      this.listeningForResize = true;
    }
  }
}
