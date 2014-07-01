'use strict';

describe('Service: admin/Client', function () {

  // load the service's module
  beforeEach(module('cloudifyWidgetUiApp'));

  // instantiate service
  var admin/Client;
  beforeEach(inject(function (_admin/Client_) {
    admin/Client = _admin/Client_;
  }));

  it('should do something', function () {
    expect(!!admin/Client).toBe(true);
  });

});
