import { modifier } from 'ember-modifier';

type PassedFunction = (arg0: HTMLElement) => PassedFunction;

export default modifier(
  function registerCleanup(element: HTMLElement, [register]: [PassedFunction]) {
    const cleanup: PassedFunction = register(element);

    return (): void => {
      cleanup(element);
    };
  },
  { eager: false }
);
