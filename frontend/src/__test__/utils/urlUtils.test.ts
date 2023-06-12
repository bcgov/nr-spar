/* eslint-disable no-undef */
import getUrlQueryParam from '../../utils/UrlUtils';

describe('Url Utils test', () => {
  it('should have page param', () => {
    const url = 'http://spar-webapp.com/?page=/home';
    global.window ??= Object.create(window);
    Object.defineProperty(window, 'location', {
      value: { search: url }
    });

    const pageParam = getUrlQueryParam(window.location, 'page');

    expect(pageParam).toBe('/home');
  });

  it('should have no param', () => {
    const url = 'http://spar-webapp.com/?page=/home';
    global.window ??= Object.create(window);
    Object.defineProperty(window, 'location', {
      value: { search: url }
    });

    const pageParam = getUrlQueryParam(window.location, 'another');

    expect(pageParam).toBe(null);
  });

  it('location without query search', () => {
    const url = 'http://spar-webapp.com';
    global.window ??= Object.create(window);
    Object.defineProperty(window, 'location', {
      value: { search: url }
    });

    const pageParam = getUrlQueryParam(window.location, 'name');

    expect(pageParam).toBe(null);
  });
});
