Ember Fast Marquee
==============================================================================

Ember Fast Marquee is a lightweight ember component that utilizes the power of CSS animations to create silky smooth marquees.

Inspired by [React Fast Marquee][2]

![demogif][1]

Differences from React Fast Marquee
------------------------------------------------------------------------------
- Automatically duplicates content as many times as necessary
- Use `@fillRow={{true}}` to fill any left over white space if desired
- 1 transform3d animation per marquee

[1]: https://media.giphy.com/media/6ritiN2cpvpsyz4fo6/giphy.gif "demo gif"
[2]: https://github.com/justin-chu/react-fast-marquee/

Compatibility
------------------------------------------------------------------------------

* Ember.js v3.24 or above
* Embroider or ember-auto-import v2


Installation
------------------------------------------------------------------------------

```
ember install ember-fast-marquee
```


Usage
------------------------------------------------------------------------------

To use the component, first you need to import `marquee.css` into your application somehow.

If you are using embroider simply import the css into your application
```ts
// application.js
import "ember-fast-marquee/marquee.css";
```

Or import into your css as your would other third party CSS eg.
```css
/* app.css */
@import "node_modules/ember-fast-marquee/marquee.css";
```

Then wrap the `<Marquee>` component around any component or text you'd like to slide.


```hbs
<Marquee>
  I can be a React component, multiple React components, or just some text.
</Marquee>
```
Full Example
------------------------------------------------------------------------------
All options with defaults
```hbs
<Marquee
  @fillRow={{false}}
  @play={{true}}
  @pauseOnHover={{false}}
  @pauseOnClick={{false}}
  @direction="left"
  @speed={{20}}
  @delay={{0}}
  @loop={{0}}
  @gradient={{true}}
  @gradientColor={{255,255,255}}
  @gradientWidth="5%"
  @onFinish={{this.someAction}}
  @onCycleComplete={{this.anotherAction}}
  class="my-own-fancy-class"
>
  <div class="photo">
    <img src="https://i.pravatar.cc/150?img=3" />
  </div>

  <div class="photo">
    <img src="https://i.pravatar.cc/150?img=3" />
  </div>

  <div class="photo">
    <img src="https://i.pravatar.cc/150?img=3" />
  </div>
</Marquee>
```

Component Arguments
------------------------------------------------------------------------------

| Property        | Type                        | Default           | Description                                              |
| :-------------- | :-------------------------- | :---------------- | :------------------------------------------------------- |
|`fillRow` | `boolean` | `false` | Whether to fill empty spaces with repeat content
| `play`          | `boolean`                   | `true`            | Whether to play or pause the marquee                     |
| `pauseOnHover`  | `boolean`                   | `false`           | Whether to pause the marquee when hovered                |
| `pauseOnClick`  | `boolean`                   | `false`           | Whether to pause the marquee when clicked                |
| `direction`     | `"left"` or `"right"`       | `"left"`          | The direction the marquee is sliding                     |
| `speed`         | `number`                    | `20`              | Speed calculated as pixels/second                        |
| `delay`         | `number`                    | `0`               | Duration to delay the animation after render, in seconds |
| `loop`          | `number`                    | `0`               | The number of times the marquee should loop, 0 is equivalent to infinite         |
| `gradient`      | `boolean`                   | `true`            | Whether to show the gradient or not                      |
| `gradientColor` | `string` | `255,255,255` | The rgb color of the gradient as a string of RGB values separated by commas    |
| `gradientWidth` | `number` or `string`        | `"5%"`             | The width of the gradient on either side, if a number is passed % is used, if a string is passed it is used as is to allow other units to be used                 |
| `onFinish` | `Function` | `undefined` | A callback for when the marquee finishes scrolling and stops. Only calls if loop is non-zero.    |
| `onCycleComplete` | `Function`        | `undefined`             | A callback for when the marquee finishes a loop. Does not call if maximum loops are reached (use onFinish instead).                 |

Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
