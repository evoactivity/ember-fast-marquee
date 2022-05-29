import Modifier, { ArgsFor, PositionalArgs, NamedArgs } from 'ember-modifier';
import { registerDestructor } from '@ember/destroyable';
import type component from '../components/marquee';

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
    window.removeEventListener('resize', instance.boundFn);
  }
  if (instance.listeningForResize) instance.listeningForResize = false;
}

type MarqueeState = NamedArgs<MarqueeModifierSignature>;

export default class MarqueeModifier extends Modifier<MarqueeModifierSignature> {
  boundFn?: (() => void) | null = null;
  component?: component;
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
  listeningForResize?: boolean;

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

    this.component.containerWidth = containerEl.getBoundingClientRect().width;
    this.component.marqueeWidth = marqueeEl.getBoundingClientRect().width;

    setProp(
      '--marquee-scroll-amount',
      this.fillRow ? `${this.component.marqueeWidth}px` : '100%'
    );

    const duration =
      this.fillRow ||
      this.component.marqueeWidth > this.component.containerWidth
        ? this.component.marqueeWidth / this.speed
        : this.component.containerWidth / this.speed;

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

    const containerEl = element;
    const marqueeEl = <HTMLDivElement>(
      containerEl.querySelector('.' + marqueeSelector)
    );

    this.measureAndSetCSSVariables(containerEl, marqueeEl);

    this.boundFn = this.measureAndSetCSSVariables.bind(
      this,
      containerEl,
      marqueeEl
    );
    if (!this.listeningForResize) {
      window.addEventListener('resize', this.boundFn);
      this.listeningForResize = true;
    }
  }
}
