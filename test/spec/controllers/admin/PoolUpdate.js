'use strict';

describe('Controller: AdminPoolUpdateCtrl', function () {

  // load the controller's module
  beforeEach(module('cloudifyWidgetUiApp'));

  var AdminPoolUpdateCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AdminPoolUpdateCtrl = $controller('AdminPoolUpdateCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
