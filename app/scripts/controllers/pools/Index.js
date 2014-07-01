'use strict';

angular.module('cloudifyWidgetUiApp')
  .controller('PoolsIndexCtrl', function ($scope, Client, $log ) {
        $log.info(Client.name);
  });
