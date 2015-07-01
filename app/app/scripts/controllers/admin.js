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
    $scope.cont = 0
    Analytics.evolInasistencia.query(function (evols) {
        ++$scope.cont;
        new Chartist.Line('#ct-chart1', {
              labels: _.pluck(evols, 'fecha'),
              series: [
                  _.pluck(evols, 'inasistencia')
              ]
            }, {
                  showArea: true,

                  low: 0,
                  lineSmooth: false,
                  plugins: [
                    Chartist.plugins.ctPointLabels({
                      textAnchor: 'middle'
                    })
                  ],
                  axisX: {
                     showGrid: false,
                     showLabel: false
                  },
                  axisY: {
                     showGrid: false,
                     showLabel: false
                  },
            });
    });

    Analytics.inasistenciasVsMaterias.query(function (inaMaterias) {
        ++$scope.cont;
        new Chartist.Bar('#ct-chart2', {
          labels: _.pluck(inaMaterias, 'materia'),
          series: [
              _.pluck(inaMaterias, 'inasistencia'),
          ]
        });
    });

    Analytics.inasistenciasVsGrados.query(function (inaGrados) {
        ++$scope.cont;
        var nombreCurso = _.pluck(inaGrados, 'nombre_curso');
        var indice = _.pluck(inaGrados, 'indice');
        var curso = _.zip(nombreCurso, indice);
        curso.forEach(function(element){console.log(element.join('-'))});

        new Chartist.Bar('#ct-chart4', {
          labels: _.map(curso, function(element){ return element.join(' ')}),
          series: [
            _.pluck(inaGrados, 'inasistencia'),
          ]
        });
    });

    Analytics.inasistenciasVsDiaSemana.query(function (inaDias) {
        ++$scope.cont;
        new Chartist.Bar('#ct-chart3', {
          labels: _.pluck(inaDias, 'diaNombre'),
          series: [
              _.pluck(inaDias, 'inasistencia'),
          ]
        });
    });




}]).controller('EstNotasCtrl',['$scope', 'Analytics', function ($scope, Analytics){
    $scope.loadingEstNotas = true;
    $scope.cont = 0
    Analytics.promedioVsMaterias.query(function (materias) {
        ++$scope.cont;
        new Chartist.Bar('#ct-chart2', {
          labels: _.pluck(materias, 'materia'),
          series: [
            _.pluck(materias, 'nota'),
          ]
        });
    });


    Analytics.promedioVsGrados.query(function (grados) {
        ++$scope.cont;
        new Chartist.Bar('#ct-chart4', {
          labels: _.pluck(grados, 'nombre_curso'),
          series: [
              _.pluck(grados, 'nota'),
          ]
        },{
          high: 6
        });
    });
}]);
