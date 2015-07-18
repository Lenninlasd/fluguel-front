'use strict';
//Controlador del perfil del estudiante
function DialogTeacherProfile($scope, $mdDialog, docente) {
    'use strict';
    $scope.cancel = function() {
      $mdDialog.cancel();
    };
    $scope.docente = docente;
    console.log(docente);
}

angular.module('Dirapp')
.factory('MenuAdmin', function() {
  'use strict';
    return {
      subMenu: false
    };
})
.controller('AdminCtrl',['$scope','$mdSidenav', '$location', 'Usuario', 'Coordinador', function ($scope,$mdSidenav, $location, Usuario, Coordinador){
    'use strict';
    $scope.subMenu = false;

    // Valida que la sesion haya iniciado
    Usuario.login.get(function (data) {
        if (data.login === false) {
            $location.path('/login');
        }else {
            var rol = data.userData.rol;
            if (rol === 'profesor') {
                return $location.path('/Docente');
            }else if (rol === 'admin') {
                Coordinador.cursos.query(function (cursos) {
                    $scope.cursos = cursos;
                });
            }
        }
    },function(data){
        console.log(data);
    });

    $scope.toggleChildMenu = function(){
        var nameMenu = $location.$$path.split('/')[2];
        if (nameMenu === 'estudiantes') {
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
    'use strict';
    $scope.subMenu = false;
    var nameMenu = $location.$$path.split('/')[2];
    if (nameMenu === 'estudiantes') {
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
                //$scope.alert = 'You said the information was '' + answer + ''.';
                console.log(answer);
        }, function() {
                //$scope.alert = 'You cancelled the dialog.';
                console.log('You cancelled the dialog.');
        });
    };

}]).controller('ListaDocentesCtrl',['$scope', 'Coordinador', '$mdDialog', function ($scope, Coordinador, $mdDialog){
    'use strict';
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

}]).controller('ListaMateriasCtrl',['$scope', '$location', 'Coordinador', function ($scope, $location, Coordinador){
    'use strict';
    $scope.materias = [];
    Coordinador.materias.query(function (materias) {
        $scope.materias = materias;
        console.log(materias);
    });

}])
.controller('EstadisticaCtrl',['$scope', 'Analytics', function ($scope, Analytics){
    'use strict';

    Analytics.promedioVsMaterias.query(function (promedios) {
        console.log(promedios);
    });

    var data = {labels:[], series:[]};
    Analytics.promedioVsGrados.query(function (grado) {
        //var labels =
        //var series = _.pluck(data, 'nota');

        data = {
          labels: _.pluck(grado, 'grado'),
          series: [
            _.pluck(grado, 'nota')
          ]
        };
        console.log(data);
    });


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