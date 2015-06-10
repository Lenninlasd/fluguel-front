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
    };
    $scope.toggleChildMenu();

    $scope.hideChildMenu = function(){
        $scope.subMenu = false;
    };
    $scope.showChildMenu = function(){
        $scope.subMenu = true;
    };


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
    });

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
      labels: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'],
      series: [
        [1, 2, 4, 8, 6, 2, 1, 4, 6.6, 2]
      ]
    };

    var options = {
      high: 10,
      low: 0,
      lineSmooth: false,
      plugins: [
        Chartist.plugins.ctPointLabels({
          textAnchor: 'middle'
        })
      ],
      axisX: {
         showGrid: false,
         showLabel: true
      },
      axisY: {
         showGrid: false,
         showLabel: false
      },
    };

    new Chartist.Line('#ct-chart1', data, options);


    new Chartist.Bar('#ct-chart2', {
      labels: ['Matemáticas', 'Español', 'Sociales', 'Informatica', 'Edu. Física', 'Química', 'Biología'],
      series: [
        [5, 4, 3, 7, 5, 10, 3],
      ]
    });

    new Chartist.Bar('#ct-chart3', {
      labels: ['Lunes', 'Martes', 'Miercoles', 'jueves', 'viernes'],
      series: [
        [5, 4, 3, 7, 5],
      ]
    });

    new Chartist.Bar('#ct-chart4', {
      labels: ['Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto'],
      series: [
        [5, 4, 3, 7, 5],
      ]
    },{
      high: 8
    });


}]).controller('EstNotasCtrl',['$scope', function ($scope){
    new Chartist.Bar('#ct-chart2', {
      labels: ['Matemáticas', 'Español', 'Sociales', 'Informatica', 'Edu. Física', 'Química', 'Biología'],
      series: [
        [5, 4, 3, 7, 5, 10, 3],
      ]
    });

    new Chartist.Bar('#ct-chart4', {
      labels: ['Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto'],
      series: [
        [5, 4, 3, 7, 5],
      ]
    },{
      high: 8
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
