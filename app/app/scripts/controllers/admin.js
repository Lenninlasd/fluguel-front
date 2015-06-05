angular.module('Dirapp')
.factory('MenuAdmin', function() {
    return {
      subMenu: false
    };
})
.controller('AdminCtrl',['$scope','$mdSidenav', '$location', 'Usuario', 'Coordinador', '$state', function ($scope,$mdSidenav, $location, Usuario, Coordinador, $state){
    $scope.subMenu = false;

    // Valida que la sesion haya iniciado
    Usuario.login.get(function (data) {
        if (data.login === false) {
            $location.path("/login");
        }else {
            var rol = data.userData.rol;
            if (rol == 'profesor') {
                return $location.path("/Docente");
            }else if (rol == 'admin') {
                Coordinador.cursos.query(function (cursos) {
                    $scope.cursos = cursos;
                });
            }
        }
    },function(data){
        console.log(data);
    });

    $scope.toggleChildMenu = function(){
        var nameMenu = $location.$$path.split("/")[2];
        if (nameMenu == 'estudiantes') {
            $scope.subMenu = true;
        }else {
            $scope.subMenu = false;
        }
        console.log($scope.subMenu);
    }
    $scope.toggleChildMenu();

    $scope.hideChildMenu = function(){
        $scope.subMenu = false;
    }
    $scope.showChildMenu = function(){
        $scope.subMenu = true;
    }


    $scope.toggleSidenav = function(menuId) {
        $mdSidenav(menuId).toggle();
    };

}])
.controller('ListaEstudiantesCtrl',['$scope', '$location', 'Coordinador', '$stateParams', function ($scope, $location, Coordinador, $stateParams){
    $scope.subMenu = false;
    var nameMenu = $location.$$path.split("/")[2];
    if (nameMenu == 'estudiantes') {
        $scope.subMenu = true;
    }

    var idcurso = $stateParams.idcurso;

    $scope.estudiantes = [];
    Coordinador.estudiantes.query({idcurso: idcurso}, function (estudiantes) {
        $scope.estudiantes = estudiantes;
    })

}]).controller('ListaDocentesCtrl',['$scope', '$location', 'Usuario', 'Coordinador', '$stateParams', function ($scope, $location, Usuario, Coordinador, $stateParams){

    $scope.docentes = [];
    Coordinador.profesores.query(function (docentes) {
        $scope.docentes = docentes;
        console.log(docentes);
    })

}]);
