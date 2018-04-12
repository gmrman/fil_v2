define(["API", "APIS", 'AppLang', 'ionic-popup', "circulationCardService", "Directives", "ReqTestData", "commonFactory"], function() {
    return ['$scope', '$state', '$ionicLoading', 'AppLang', 'IonicPopupService', 'APIService', '$timeout',
        'APIBridge', "ReqTestData", "circulationCardService", "commonFactory", "$ionicPopup", "IonicClosePopupService", "$filter", "$ionicModal", '$ionicListDelegate',
        function($scope, $state, $ionicLoading, AppLang, IonicPopupService, APIService, $timeout,
            APIBridge, ReqTestData, circulationCardService, commonFactory, $ionicPopup, IonicClosePopupService, $filter, $ionicModal, $ionicListDelegate) {

            $scope.langs = AppLang.langs;
            $scope.selectStr = '';
            $scope.showItems = [];

            var items = [{
                key: '五金',
                value: ['五金一', '五金二', '五金三', '五金四']
            }, {
                key: '袁野',
                value: ['袁野一', '袁野二', '袁野三', '袁野四']
            }];

            // searchInfo
            $scope.searchInfo = function() {
                angular.forEach(items, function(item) {
                    if (item.key == $scope.selectStr) {
                        $scope.showItems = item.value;
                    }
                });
            }


            //dont move
        }
    ];
});
