import Controller from '@ember/controller';

export default class ApplicationController extends Controller {
  year = new Date().getFullYear();
}
