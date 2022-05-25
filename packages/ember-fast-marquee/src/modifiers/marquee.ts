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

function cleanup(instance: MarqueeModifier) {
  if (instance.boundFn) {
    window.removeEventListener('resize', instance.boundFn);
  }
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
    )
      return;

    containerEl.style.setProperty(
      '--fill-row',
      this.fillRow ? 'max-content' : '100%'
    );
    containerEl.style.setProperty(
      '--gradient-color',
      `${this.rgbaGradientColor}, 1), ${this.rgbaGradientColor}, 0)`
    );

    containerEl.style.setProperty('--gradient-width', this.gradientWidth);

    this.component.containerWidth = containerEl.getBoundingClientRect().width;
    this.component.marqueeWidth = marqueeEl.getBoundingClientRect().width;

    const duration =
      this.fillRow ||
      this.component.marqueeWidth > this.component.containerWidth
        ? this.component.marqueeWidth / this.speed
        : this.component.containerWidth / this.speed;

    containerEl.style.setProperty(
      '--pause-on-hover',
      !this.play ? 'paused' : this.pauseOnHover ? 'paused' : 'running'
    );
    containerEl.style.setProperty(
      '--pause-on-click',
      !this.play ? 'paused' : this.pauseOnClick ? 'paused' : 'running'
    );
    containerEl.style.setProperty(
      '--marquee-scroll-amount',
      this.fillRow ? `${this.component.marqueeWidth}px` : '100%'
    );
    containerEl.style.setProperty('--play', this.play ? 'running' : 'paused');
    containerEl.style.setProperty(
      '--direction',
      this.direction === 'left' ? 'normal' : 'reverse'
    );
    containerEl.style.setProperty('--duration', `${duration}s`);
    containerEl.style.setProperty('--delay', `${this.delay}s`);
    containerEl.style.setProperty(
      '--iteration-count',
      this.loop ? '' + this.loop : 'infinite'
    );
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
  ) {
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
    window.addEventListener('resize', this.boundFn);
  }
}
