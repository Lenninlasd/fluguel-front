angular.module('Dirapp')
  .controller('ContenidoCtrl', ['$scope', '$mdDialog', '$stateParams', '$state', 'Docente', 'Analytics', function ($scope, $mdDialog, $stateParams, $state, Docente, Analytics) {
    'use strict';

    var idClase = $stateParams.idclase;
    $scope.logro = {};
    $scope.evaluacion = {};
    $scope.porcentaje = {};
    $scope.progreso = {};
    $scope.totalProgreso = 0;
    $scope.countEval = {};

    $scope.Periodos =[
        {periodo:'Primer Perido',targetid:'primero',expanded:true,id:'1'},
        {periodo:'Segundo Perido',targetid:'segundo',expanded:false,id:'2'},
        {periodo:'Tercer Perido',targetid:'tercero',expanded:false,id:'3'},
        {periodo:'Cuarto Perido',targetid:'cuarto',expanded:false,id:'4'}
    ];
    // Lista de logros y calificaciones.
    Docente.contenido.query({idclase: idClase}, function(logros){
    	$scope.Logros = logros;
      Docente.calificaciones.query({idclase: idClase}, function(evaluaciones){
          $scope.evaluaciones = evaluaciones;

          var groupEval = _.groupBy(evaluaciones, 'id_indicador');
          $scope.countEval = _.mapObject(groupEval, function (val, key) {
              return _.size(val);
          });
          console.log($scope.countEval);
      });
    });

    // Lista de calificaciones con cantidad de notas evaluadas para el avance del contenido.
    // progreso es un obj que contiene el % de progreso de casa logro.
    // totalProgreso el el porcentaje de progreso de Toooodos los logros (filtrar por periodo actual)
    Analytics.calificacionContenido.query({idclase: idClase}, function (stat) {
        var groupStat = _.groupBy(stat, 'id_logro');
        var totalProgreso = 0;
        var progreso = _.mapObject(groupStat, function(val, key) {

            var sum = _.reduce(val, function(memo, obj){
                var porcCalificacion = obj.Calificados/obj.numEstudiantes;
                // console.log(porcCalificacion);
                if ( porcCalificacion !== 1) {
                    return memo;
                }else {
                    return memo + 1;
                }
            }, 0);
            totalProgreso = sum + totalProgreso;
            return sum/_.size(val)*100 || 0;
        });
        $scope.progreso = progreso;
        $scope.totalProgreso = (totalProgreso/_.size(stat))*100 || 0;
    });

    // dado un id de indicador calcula la suma total de los porcentajes de los logros
    $scope.getPorcentaje = function (id_indicador, evaluaciones) {
       var porcentaje = _.chain(evaluaciones)
                  .where({id_indicador: id_indicador})
                  .reduce(function(memo, obj){ return memo + obj.ponderacion}, 0);
       $scope.porcentaje[id_indicador] = porcentaje;
       return porcentaje;
    }

    $scope.saveLogro = function(id_indicador){

        if (id_indicador) {
          // PUT
            if (_.size($scope.logro)) {
                var getParams = {idindicador : $scope.logro.id_indicador};
                var putlogro = _.pick($scope.logro, 'contenido', 'periodo', 'fecha_vencimiento');
                Docente.contenido.update(getParams, putlogro, function (log) {
                    var logro = _.findWhere($scope.Logros, {id_indicador: id_indicador});
                    logro.contenido = log.data.contenido;
                    logro.periodo = log.data.periodo;
                    logro.fecha_vencimiento = log.data.fecha_vencimiento;
                    _.delay(function(){
                        $('#modalNewLogro').modal('hide');
                    }, 500);
                });
            }
        }else{

            // POST logro
            $scope.logro.idclase = idClase;
            Docente.contenido.save($scope.logro, function(log){
                var logro = {
                    id_indicador: log.insertId,
                    id_clase: log.data.idclase,
                    contenido: log.data.contenido,
                    periodo: log.data.periodo,
                    fecha_vencimiento: log.data.fecha_vencimiento
                };
                $scope.Logros.push(logro);
                _.delay(function(){
                    $('#modalNewLogro').modal('hide');
                }, 500);
            });
        }
    };

    $scope.launchPostModal = function(){
        $scope.logro = {};
    };

    $scope.launchEditModal = function(id_indicador){
        $scope.logro = _.clone(_.findWhere($scope.Logros, {id_indicador: id_indicador}));
        if ($scope.logro.fecha_vencimiento) {
            $scope.logro.fecha_vencimiento = $scope.logro.fecha_vencimiento.substring(0, 10);
        }
    };

    $scope.showLogroFromCollapse = function(logro){
        $scope.logro= _.clone(logro);
        $scope.evaluacion = {};
    };

    $scope.saveEvaluacion = function (id_indicador) {
        var evaluacion = {
            idindicador : id_indicador,
            tipoeval: $scope.evaluacion.tipo_evaluacion,
            concepto: $scope.evaluacion.concepto,
            ponderacion: $scope.evaluacion.ponderacion,
            idclase: idClase
        };
        Docente.calificaciones.save(evaluacion, function (log) {
            $scope.evaluacion.id_indicador = id_indicador;
            $scope.evaluacion.id_clase = idClase;
            $scope.evaluacion.id_calificacion = log.data.idcalificacion;

            $scope.evaluaciones.push($scope.evaluacion);
            $scope.evaluacion = {};
        });
    };

    $scope.showEditEvaluacion = function(evaluacion){
        $scope.evaluacion = _.clone(evaluacion);
    };
    $scope.editEvaluacion = function() {
        var evaluacion = {
            "id_indicador" : $scope.evaluacion.id_indicador,
            "tipo_evaluacion": $scope.evaluacion.tipo_evaluacion,
            "concepto": $scope.evaluacion.concepto,
            "ponderacion": $scope.evaluacion.ponderacion,
            "Clase_numero": $scope.evaluacion.id_clase
        };
        var idcalificacion = {idcalificacion : $scope.evaluacion.id_calificacion};
        Docente.calificaciones.update(idcalificacion, evaluacion, function (log) {

            var logro = _.findWhere($scope.evaluaciones, {id_calificacion: $scope.evaluacion.id_calificacion});
            logro.tipo_evaluacion = log.data.tipo_evaluacion;
            logro.concepto = log.data.concepto;
            logro.ponderacion = log.data.ponderacion;

            _.delay(function(){
                $('#modalEditEvaluacion').modal('hide');
            }, 500);
        });
    };

    $scope.calificar2 = function(id_calificacion){
        var url = '/Docente/' + idClase + '/Estudiantes/calificaciones?idcalificacion=' + id_calificacion;
        $location.path(url);
    };
    $scope.calificar = function(id_calificacion){
        //var url = 'Docente/10095/Estudiantes/calificaciones?idcalificacion=dsfsfdfdf';
        $state.go('Docente.Estudiantes.calificaciones', {idcalificacion: id_calificacion});
    };
}]);
