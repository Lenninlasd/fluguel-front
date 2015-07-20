'use strict';
angular.module('Dirapp')
.controller('LandingCtrl', ['$scope', '$mdDialog', '$location', '$cookies', 'Usuario', function($scope, $mdDialog, $location, $cookies, Usuario) {
    'use strict';

    Usuario.login.get(function (data) {
        console.log(data);
        var hola = $cookies.get('session');
        console.log(hola);
        if (data.login === true) {
            if (data.userData.rol === 'admin') {
                $location.path('/admin');
            }else if(data.userData.rol === 'profesor') {
                $location.path('/Docente');
            }
        }
    },function(data){
        console.log(data);
    });

    $scope.showAdvanced = function(ev) {
            $mdDialog.show({
                controller: LoginCtrl,
                templateUrl: 'views/landing/loginForm.html',
                targetEvent: ev,
            })
            .then(function(answer) {
                //$scope.alert = 'You said the information was '' + answer + ''.';
                console.log(answer);
            }, function() {
                //$scope.alert = 'You cancelled the dialog.';
                console.log('You cancelled the dialog.');
            });
    };


}])
.controller('logoutCtrl', ['$scope', '$location', '$cookies', 'Usuario', function ($scope, $location, $cookies, Usuario) {
    'use strict';
    $scope.logout = function () {
        Usuario.logout.save(function(data){
            if (!data.login) {
                $cookies.remove('session');
                $location.path('/login');
            }
        });
    };
}]);

function LoginCtrl($scope, Usuario, $location, $mdDialog, $cookies) {
    'use strict';
    $scope.form = {};
    $scope.userAlert = false;
    $scope.passAlert = false;
    $scope.loading = false;

    $scope.setLoginForm = function () {
        $scope.userAlert = false;
        $scope.passAlert = false;
        $scope.loading = true;
        //Enviar a API
        // Validar el tipo de usuario (Docente, admin, etc)
        Usuario.login.save($scope.form, function(data){
            $scope.loading = false;
            $cookies.put('session', data.id_session);
            //res.cookie('session', id_session); // problema con cookies solucionar con angular
            $mdDialog.hide();
            if (data.login && data.userData) {
                if (data.userData.rol === 'admin') {
                    $location.path('/admin');
                }else if (data.userData.rol === 'profesor') {
                    $location.path('/Docente');
                }
            }
        }, function (err) {
            $scope.loading = false;
            if (err.data.noUsuario) {
              $scope.userAlert = true;
            }else if (err.data.invalid_password) {
              $scope.passAlert = true;
            }
        });
    };

    $scope.hide = function() {
        $mdDialog.hide();
    };
    $scope.cancel = function() {
        $mdDialog.cancel();
    };
    $scope.answer = function(answer) {
        $mdDialog.hide(answer);
    };
}
