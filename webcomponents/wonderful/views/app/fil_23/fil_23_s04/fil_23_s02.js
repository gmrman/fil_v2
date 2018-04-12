define(["API", "APIS", 'AppLang', 'ionic-popup', "circulationCardService", "Directives", "ReqTestData", "commonFactory"], function() {
    return ['$scope', '$state', '$stateParams', '$ionicLoading', 'AppLang', 'IonicPopupService', 'APIService', '$timeout',
        'APIBridge', "ReqTestData", "circulationCardService", "commonFactory", "$ionicPopup", "IonicClosePopupService", "$filter", "$ionicModal", '$ionicListDelegate',
        function($scope, $state, $stateParams, $ionicLoading, AppLang, IonicPopupService, APIService, $timeout,
            APIBridge, ReqTestData, circulationCardService, commonFactory, $ionicPopup, IonicClosePopupService, $filter, $ionicModal, $ionicListDelegate) {

            $scope.data = angular.copy($stateParams.currentData);
            $scope.item = angular.copy($stateParams.currentItem);
            $scope.langs = AppLang.langs;

            //search
            var selectItems = [{
                key: '五金',
                value: ['五金一', '五金二', '五金三', '五金四']
            }, {
                key: '袁野',
                value: ['袁野一', '袁野二', '袁野三', '袁野四']
            }];
            $scope.selectFlag = true;
            $scope.selectedStr = '';

            function initSelectItem() {
                var temp = [];
                angular.forEach(selectItems, function(item) {
                    if (!temp.length) {
                        temp = angular.copy(item.value);
                    } else {
                        temp = temp.concat(item.value);
                    }
                });
                // console.log(temp);
                $scope.selectedItems = temp;
            }

            $scope.focusSelect = function() {
                $scope.selectFlag = true;
                initSelectItem();
                $scope.searchInfo();
            }
            $scope.blurSelect = function() {
                $scope.selectFlag = false;
            }
            $scope.searchInfo = function() {
                var flag = false;
                angular.forEach(selectItems, function(item) {
                    if (item.key == $scope.selectedStr) {
                        $scope.selectedItems = item.value;
                        flag = true;
                        $scope.selectFlag = true;
                    }
                });
                if (flag == false) {
                    initSelectItem();
                }
            }

            $scope.addInfo = function(item) {
                $scope.infos.push({
                    name: item,
                    num: 0
                });
                $scope.selectFlag = false;
                $scope.selectedStr = '';
                setInfos();
            }

            // infos
            $scope.infos = [];
            // $scope.infos=[{
            //         name:'五金件压伤',
            //         num:88
            //   },{
            //           name:'五金件压伤',
            //           num:99
            //     },{
            //             name:'五金件压伤',
            //             num:110
            //       }
            // ];
            function setInfos() {
                for (var i = 0; i < $scope.infos.length; i++) {
                    if (i % 2 == 0) {
                        $scope.infos[i].turn = 'left';
                    } else {
                        $scope.infos[i].turn = 'right';
                    }
                }
            }
            setInfos();

            //del
            $scope.delInfo = function(index, flag) {
                var flag = flag || 0;
                if (flag == 0) {
                    index = index * 2;
                } else if (flag == 1) {
                    index = index * 2 + 1;
                }
                console.log(index);
                $scope.infos.splice(index, 1);
                setInfos();
                console.log($scope.infos);
                $ionicListDelegate.closeOptionButtons();
            };
            //dont move
        }
    ];
});
