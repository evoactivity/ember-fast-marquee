import { module, test } from 'qunit';
import { setupTest } from 'docs/tests/helpers';

module('Unit | Route | application/index', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:application/index');
    assert.ok(route);
  });
});
