'use strict';

angular.module('flugel.views.admin.conf', ['ui.router'])

.config(['$stateProvider', function($stateProvider) {
  // $routeProvider.when('/admin/conf', {
  //   templateUrl: 'app/views/admin/conf.html',
  //   controllerAs: 'conf',
  //   controller: 'ConfCtrl'
  // });
  $stateProvider.state('admin.conf', {
      url: '/conf',
      templateUrl: 'views/admin/conf/conf.html',
      controllerAs: 'conf',
      controller: 'ConfCtrl'
  });
}])
.controller('ConfCtrl', ConfCtrl);

ConfCtrl.$inject = ['$scope', 'Coordinador'];
function ConfCtrl($scope, Coordinador) {
    $scope.periodoShow = false;
    $scope.noPeriodoShow = false;
    $scope.periodos = [];

    Coordinador.periodos.query(function (periodos) {
        $scope.periodos = periodos;
        if (_.size(periodos)) {
            $scope.periodoShow = true;
        }else{
            $scope.noPeriodoShow = true;
        }
    });
}
