'use strict';

describe('Controller: PoolsIndexCtrl', function () {

  // load the controller's module
  beforeEach(module('cloudifyWidgetUiApp'));

  var PoolsIndexCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PoolsIndexCtrl = $controller('PoolsIndexCtrl', {
      $scope: scope
    });
  }));

  it('should attach name to scope', function () {
    expect(!!scope.name).toBe(true);
  });
});
