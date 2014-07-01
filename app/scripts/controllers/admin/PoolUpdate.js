'use strict';

angular.module('cloudifyWidgetUiApp')
  .controller('AdminPoolUpdateCtrl', function ($scope, $routeParams, $log, AdminPoolCrudService) {
        $scope.accountId = $routeParams.accountId;
        $scope.poolId = $routeParams.poolId;


        AdminPoolCrudService.getAccountPool($scope.accountId, $scope.poolId).then(function (result) {
            $scope.pool = result.data;
            // indent the text file to better reading;
            $scope.pool.poolSettingsStr = JSON.stringify( JSON.parse($scope.pool.poolSettingsStr), {}, 4);
        });

        $scope.updateAccountPool = function( accountId, poolSettingsStr ){
            $log.info('updateAccountPool, pool: ', poolSettingsStr);
            // update with new data
            AdminPoolCrudService.updateAccountPool($scope.accountId, $scope.pool.id, poolSettingsStr).then(function (/*result*/) {
                toastr.success('updated successfully');
            });
        };



    });
