import { modifier } from 'ember-modifier';

export default modifier(
  function observeMutation(
    element: HTMLElement,
    [changeHandler]: [MutationCallback],
    optionsHash = {}
  ) {
    const options = {
      ...optionsHash,
    };

    const observer = new MutationObserver(changeHandler);

    observer.observe(element, options);

    return (): void => {
      observer.disconnect();
    };
  },
  { eager: false }
);
