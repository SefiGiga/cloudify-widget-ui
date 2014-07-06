'use strict';

angular.module('cloudifyWidgetUiApp')
    .controller('WidgetViewCtrl', function ($scope, WidgetsService, $routeParams, $log) {

        WidgetsService.getPublicWidget($routeParams.widgetId).then(function (result) {
            $scope.widget = result.data;
        });


        $scope.getInclude = function () {
            if (!$scope.widget) {
                return '';
            } else {
                $log.info('',$scope.widget.theme);
                var widgetTheme = $routeParams.theme || $scope.widget.theme || 'default';
                return 'views/widget/themes/' + widgetTheme + '.html';
            }
        };


    });
