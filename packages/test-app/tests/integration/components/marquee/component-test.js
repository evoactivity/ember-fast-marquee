import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Marquee', function (hooks) {
  setupRenderingTest(hooks);

  test('Renders', async function (assert) {
    await render(hbs`<Marquee>
    abc
    </Marquee>`);

    assert.dom('[data-test-marquee-marquee]').hasText('abc');
  });

  test('Play state can be toggled', async function (assert) {
    this.set('play', false);
    await render(hbs`<Marquee @play={{this.play}}>
    abc
    </Marquee>`);

    const scroller = getComputedStyle(
      this.element.querySelector('[data-test-marquee-scroller]')
    );

    let playState = scroller.getPropertyValue('animation-play-state');

    assert.strictEqual(playState, 'paused');
    this.set('play', true);

    playState = scroller.getPropertyValue('animation-play-state');

    assert.strictEqual(playState, 'running');
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

    const scroller = getComputedStyle(
      this.element.querySelector('[data-test-marquee-scroller]')
    );

    // if there is a bettr way to handle :hover selector testing
    // then this should be updated. For now we can only check the
    // css variable is correctly set
    assert.strictEqual(scroller.getPropertyValue('--pause-on-hover'), 'paused');
  });

  test('@pauseOnClick will pause the marquee when hovered by user', async function (assert) {
    await render(hbs`<Marquee @pauseOnClick={{true}}>
    abc
    </Marquee>`);

    const scroller = getComputedStyle(
      this.element.querySelector('[data-test-marquee-scroller]')
    );

    // as above but for :active
    assert.strictEqual(scroller.getPropertyValue('--pause-on-click'), 'paused');
  });

  test('@onCycleComplete fires', async function (assert) {
    assert.expect(1);
    const done = assert.async();
    const action = () => {
      assert.ok(true);
      done();
    };
    this.set('action', action);
    await render(hbs`{{!-- template-lint-disable no-inline-styles --}}
    <Marquee @speed={{50}} @onCycleComplete={{this.action}} style="width: 100px">
    abc
    </Marquee>`);
  });

  test('@onFinish fires', async function (assert) {
    assert.expect(2);
    const done = assert.async();

    const action = () => {
      assert.ok(true);
      done();
    };

    this.set('action', action);
    await render(hbs`{{!-- template-lint-disable no-inline-styles --}}
    <Marquee @speed={{50}} @loop={{1}} @onFinish={{this.action}} style="width: 100px">
    abc
    </Marquee>`);

    const scroller = getComputedStyle(
      this.element.querySelector('[data-test-marquee-scroller]')
    );

    assert.strictEqual(scroller.getPropertyValue('--iteration-count'), '1');
  });

  test('@loop > 0 results in an equal iteration-count', async function (assert) {
    await render(hbs`{{!-- template-lint-disable no-inline-styles --}}
    <Marquee @speed={{50}} @loop={{2}} style="width: 50px">
    abc
    </Marquee>`);

    const scroller = getComputedStyle(
      this.element.querySelector('[data-test-marquee-scroller]')
    );

    assert.strictEqual(scroller.getPropertyValue('--iteration-count'), '2');
  });

  test('@speed 20 creates the correct animation duration for width 400px', async function (assert) {
    this.set('speed', 20);
    await render(hbs`{{!-- template-lint-disable no-inline-styles --}}
    <Marquee @speed={{this.speed}} style="width: 400px">
    abc
    </Marquee>`);

    // A container of 400px will have 2 content boxes each 400px each
    // resulting in a scroll container 800px wide.
    //
    // [                           800px                           ]
    // [            400px           ] [            400px           ]
    // -------------------------------------------------------------
    // |                             |                             |
    // -------------------------------------------------------------
    //
    // The scroll container will be moved 400px to the left to complete a cycle
    // width / speed = duration in seconds
    // 400/20 = 20
    //
    // We need to account for the scale(0.5) applied to the #ember-testing container
    // so instead of expecting 20s we expect 10s as all our widths are halfed since
    // we use getBoundingClientRect().width to find the onscreen width of the marquee

    const scroller = getComputedStyle(
      this.element.querySelector('[data-test-marquee-scroller]')
    );

    assert.strictEqual(scroller.getPropertyValue('--duration'), '10s');
  });

  test('@delay > 0 results in an equal delay variable', async function (assert) {
    await render(hbs`{{!-- template-lint-disable no-inline-styles --}}
    <Marquee @speed={{50}} @delay={{1}} style="width: 50px">
    abc
    </Marquee>`);

    const scroller = getComputedStyle(
      this.element.querySelector('[data-test-marquee-scroller]')
    );

    assert.strictEqual(scroller.getPropertyValue('--delay'), '1s');
  });

  test('@gradientColor is properly formatted', async function (assert) {
    await render(hbs`{{!-- template-lint-disable no-inline-styles --}}
    <Marquee @gradient={{true}} @gradientColor="255,0,0" style="width: 50px">
    abc
    </Marquee>`);

    const scroller = getComputedStyle(
      this.element.querySelector('[data-test-marquee-scroller]')
    );

    assert.strictEqual(
      scroller.getPropertyValue('--gradient-color'),
      'rgba(255, 0, 0, 1), rgba(255, 0, 0, 0)'
    );
  });

  test('@gradientWidth can be either number or string', async function (assert) {
    this.set('gradientWidth', 10);
    await render(hbs`{{!-- template-lint-disable no-inline-styles --}}
    <Marquee @gradient={{true}} @gradientColor="255,0,0" @gradientWidth={{this.gradientWidth}} style="width: 200px">
    abc
    </Marquee>`);

    const scroller = getComputedStyle(
      this.element.querySelector('[data-test-marquee-scroller]')
    );

    assert.strictEqual(scroller.getPropertyValue('--gradient-width'), '10%');

    this.set('gradientWidth', '10px');

    assert.strictEqual(scroller.getPropertyValue('--gradient-width'), '10px');
  });
});
