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
.controller('ListaEstudiantesCtrl',['$scope', '$location', 'Coordinador', '$stateParams', '$mdDialog',  function ($scope, $location, Coordinador, $stateParams, $mdDialog){
    $scope.subMenu = false;
    var nameMenu = $location.$$path.split("/")[2];
    if (nameMenu == 'estudiantes') {
        $scope.subMenu = true;
    }

    var idcurso = $stateParams.idcurso;

    $scope.estudiantes = [];
    Coordinador.estudiantes.query({idcurso: idcurso}, function (estudiantes) {
        $scope.estudiantes = estudiantes;
    });

    //Moda para perfil del estudiante
    $scope.showStudentProfile = function (ev, estudiante) {
        $mdDialog.show({
            controller: DialogStudentProfile,
            templateUrl: 'views/estudiantes/dialogos/modalestudiante.html',
            targetEvent: ev,
            clickOutsideToClose: true,
            locals: { estudiante: estudiante }
        })
        .then(function(answer) {
                //$scope.alert = 'You said the information was "' + answer + '".';
                console.log(answer);
        }, function() {
                //$scope.alert = 'You cancelled the dialog.';
                console.log('You cancelled the dialog.');
        });
    };

}]).controller('ListaDocentesCtrl',['$scope', 'Coordinador', '$mdDialog', function ($scope, Coordinador, $mdDialog){

    $scope.docentes = [];
    Coordinador.profesores.query(function (docentes) {
        $scope.docentes = docentes;
        console.log(docentes);
    })

    //Moda para perfil del docente
    $scope.showTeacheProfile = function (ev, docente) {
        $mdDialog.show({
            controller: DialogTeacherProfile,
            templateUrl: 'views/docente/dialogos/perfilDocente.html',
            targetEvent: ev,
            clickOutsideToClose: true,
            locals: { docente: docente }
        })
        .then(function(answer) {
                console.log(answer);
        }, function() {
                console.log('You cancelled the dialog.');
        });
    };

}]).controller('ListaMateriasCtrl',['$scope', '$location', 'Coordinador', '$stateParams', '$mdDialog', function ($scope, $location, Coordinador, $stateParams, $mdDialog){

    $scope.materias = [];
    Coordinador.materias.query(function (materias) {
        $scope.materias = materias;
        console.log(materias);
    });

}]).controller('EstadisticaCtrl',['$scope', function ($scope){

    var data = {
      labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10'],
      series: [
        [1, 2, 4, 8, 6, 2, 1, 4, 6, 2]
      ]
    };

    var options = {
      high: 10,
      low: 0,
    };

    new Chartist.Bar('#ct-chart1', data, options).on('draw', function(data) {
      if(data.type === 'bar') {
          data.element.attr({
            style: 'stroke-width: 20px'
          });
      };
    });


    new Chartist.Bar('#ct-chart2', {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      series: [
        [5, 4, 3, 7, 5, 10, 3],
        [3, 2, 9, 5, 4, 6, 4]
      ]
    }, {
      axisX: {
        // On the x-axis start means top and end means bottom
        position: 'start'
      },
      axisY: {
        // On the y-axis start means left and end means right
        position: 'end'
      }
    });

}]);

//Controlador del perfil del estudiante
function DialogTeacherProfile($scope, $mdDialog, docente) {

    $scope.cancel = function() {
      $mdDialog.cancel();
    };
    $scope.docente = docente;
    console.log(docente);
}
