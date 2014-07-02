'use strict';

angular.module('cloudifyWidgetUiApp')
    .controller('AdminPoolsCreateCtrl', function ($scope, $routeParams, $log, AdminPoolCrudService, $location) {

        $scope.accountId = $routeParams.accountId;

        $scope.addAccountPool = function (accountId, poolSettings) {
            $log.info('addAccountPool, accountId: ', accountId, ', poolSettings: ', poolSettings);
            AdminPoolCrudService.addAccountPool(accountId, poolSettings).then(function (/*result*/) {
                $location.path('/admin/accounts/' + accountId + '/pools');
            });
        };

    });
