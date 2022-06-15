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
  instance.mutationObserver.disconnect();
  instance.observingDomChanges = false;
}

type MarqueeState = NamedArgs<MarqueeModifierSignature>;

export default class MarqueeModifier extends Modifier<MarqueeModifierSignature> {
  @service resizeObserver!: ResizeObserverService;
  mutationObserver!: MutationObserver;

  boundFn!: () => void;
  component!: component;
  containerEl!: HTMLDivElement;
  marqueeEl!: HTMLDivElement;
  scrollerEl!: HTMLDivElement;
  observingDomChanges = false;

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

  numberOfDupicatesNeeded = 1;

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
    const containerWidth = this.containerEl.getBoundingClientRect().width;
    const marqueeWidth = this.marqueeEl.getBoundingClientRect().width;

    if (marqueeWidth < containerWidth) {
      // This is used to produce an array we can loop over in the template to output multiple
      // {{yield}} blocks tagged with aria-hidden.
      // As a marquee scrolls the duplicates are what fill in the space, we always need at least one duplicate.
      // By default a marquee will be 100% width matching the container, but if the fillRow options is used
      // our marquee will be as wide as it's contents, this means we need to calculate the number of duplicates
      // needed to fill in the white space.

      const numberOfDupicatesNeeded = Math.ceil(containerWidth / marqueeWidth);
      if (this.numberOfDupicatesNeeded !== numberOfDupicatesNeeded) {
        this.numberOfDupicatesNeeded = numberOfDupicatesNeeded;
        this.component.repeater = [...Array(numberOfDupicatesNeeded)];
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

    const marqueeNodes = this.containerEl.querySelectorAll(
      '.' + this.component.styles.marquee
    );

    marqueeNodes.forEach((marquee) => {
      marquee.getAnimations().forEach((animation) => {
        if (this.play) {
          animation.play();
        } else {
          animation.pause();
        }
      });
    });

    setProp('--direction', this.direction === 'left' ? 'normal' : 'reverse');

    setProp('--delay', `${this.delay}s`);

    setProp('--iteration-count', this.loop ? '' + this.loop : 'infinite');

    setProp('--marquee-scroll-amount', scrollAmount);

    setProp('--duration', duration);
  }

  // as duplicates are added or removed the animation of the marquee element
  // will start at different times, we use a mutation observer to tell when these
  // elements are added and removed (even outside of embers control) and reset all
  // the animations in the row so they start at the same point
  resetAnimations(mutations: MutationRecord[]): void {
    let nodes: Node[] = [];
    mutations.forEach((mutation) => {
      // we only care about marquee elements
      // being added or removed
      // we exit early if we have none
      const nodesList = [
        ...mutation.addedNodes,
        ...mutation.removedNodes,
      ].filter(
        (node: Node) =>
          node.nodeName === 'DIV' &&
          (<HTMLDivElement>node).className.includes('marquee')
      );

      nodes = [...nodes, ...nodesList];
    });

    if (nodes.length === 0) return;

    const marqueeNodes = this.containerEl.querySelectorAll(
      '.' + this.component.styles.marquee
    );

    marqueeNodes.forEach((marquee) => {
      marquee.getAnimations().forEach((animation) => {
        const oldState = animation.playState;
        animation.startTime = 0;
        if (oldState === 'running') {
          animation.play();
        } else {
          animation.pause();
        }
      });
    });
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
    this.scrollerEl = <HTMLDivElement>(
      this.containerEl.querySelector('.' + this.component.styles.scroller)
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

    if (!this.observingDomChanges) {
      this.boundFn = this.measureAndSetCSSVariables.bind(this);
      this.boundFn();
      this.resizeObserver.observe(this.containerEl, this.boundFn);
      this.resizeObserver.observe(this.marqueeEl, this.boundFn);
      this.mutationObserver = new MutationObserver(
        this.resetAnimations.bind(this)
      );
      this.mutationObserver.observe(this.scrollerEl, {
        childList: true,
        subtree: false,
        attributes: false,
        characterData: false,
      });
      this.observingDomChanges = true;
      // without this safari calculates the wrong animation for the first marquee
      this.scrollerEl.classList.add(this.component.styles.scroll);
    }
  }
}
