'use strict';

describe('Service: user/Client', function () {

  // load the service's module
  beforeEach(module('cloudifyWidgetUiApp'));

  // instantiate service
  var user/Client;
  beforeEach(inject(function (_user/Client_) {
    user/Client = _user/Client_;
  }));

  it('should do something', function () {
    expect(!!user/Client).toBe(true);
  });

});
