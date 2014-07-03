'use strict';

describe('Controller: AdminPoolUpdateCtrl', function () {

    // load the controller's module
    beforeEach(module('cloudifyWidgetUiApp'));

    var AdminPoolUpdateCtrl,
        scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope/*, $log*/) {
        scope = $rootScope.$new();
        AdminPoolUpdateCtrl = $controller('AdminPoolUpdateCtrl', {
            $scope: scope
        });
    }));

    it('should attach updateAccountPool on scope', function () {
        expect(!!scope.updateAccountPool).toBe(true);
    });
});