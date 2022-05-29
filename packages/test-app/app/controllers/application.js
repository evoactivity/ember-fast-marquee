import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class Application extends Controller {
  @tracked play = true;
}
