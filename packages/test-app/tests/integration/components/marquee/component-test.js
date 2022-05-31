import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Marquee', function (hooks) {
  setupRenderingTest(hooks);

  test('Renders', async function (assert) {
    await render(hbs`<Marquee>
    abc
    </Marquee>`);

    assert.dom('[data-test-marquee-marquee]').hasText('abc');
  });

  test('Duplicated rows are aria-hidden', async function (assert) {
    await render(hbs`<Marquee>
    abc
    </Marquee>`);

    assert.dom('[data-test-marquee-repeater]').hasAria('hidden', 'true');
    assert.dom('[data-test-marquee-repeater]').exists({ count: 1 });
  });

  test('@fillRow fills the row with extra duplicates', async function (assert) {
    await render(hbs`{{!-- template-lint-disable no-inline-styles --}}
                     <Marquee @fillRow={{true}} style="width: 600px;">
    <div style="width:200px">abc</div>
    </Marquee>`);

    assert.dom('[data-test-marquee-repeater]').exists({ count: 3 });
  });

  test('@direction="left" slides left', async function (assert) {
    this.set('playing', false);
    await render(hbs`<Marquee @fillRow={{true}} @play={{this.playing}}>
    abc
    </Marquee>`);

    const scroller = getComputedStyle(
      this.element.querySelector('[data-test-marquee-scroller]')
    );

    let translateX = new DOMMatrix(scroller.transform).m41;

    assert.strictEqual(translateX, 0);

    this.set('playing', true);
    await new Promise((r) => setTimeout(r, 100));
    this.set('playing', false);

    translateX = new DOMMatrix(scroller.transform).m41;

    assert.ok(translateX < 0);
  });

  test('@direction="right" slides right', async function (assert) {
    this.set('playing', false);
    await render(hbs`<Marquee @fillRow={{true}} @direction="right" @play={{this.playing}}>
    abc
    </Marquee>`);

    const scroller = getComputedStyle(
      this.element.querySelector('[data-test-marquee-scroller]')
    );

    let translateX = new DOMMatrix(scroller.transform).m41;

    const widthOfMarquee = this.element
      .querySelector('[data-test-marquee-marquee]')
      .getBoundingClientRect().width;

    assert.strictEqual(
      Math.round(translateX),
      -Math.abs(Math.round(widthOfMarquee))
    );

    this.set('playing', true);
    await new Promise((r) => setTimeout(r, 100));
    this.set('playing', false);

    translateX = new DOMMatrix(scroller.transform).m41;

    assert.ok(translateX < 0);

    const directionCSSVar = scroller.getPropertyValue('--direction');

    assert.strictEqual(directionCSSVar, 'reverse');
  });

  test('@gradient adds a gradient', async function (assert) {
    await render(hbs`<Marquee @gradient={{true}}>
    abc
    </Marquee>`);

    assert.dom('[data-test-marquee-gradient]').exists();
  });

  test('@pauseOnHover will pause the marquee when hovered by user', async function (assert) {
    await render(hbs`<Marquee @pauseOnHover={{true}}>
    abc
    </Marquee>`);

    triggerEvent('[data-test-marquee]', 'mouseenter');

    assert.dom('[data-test-marquee-gradient]').exists();
  });
});
