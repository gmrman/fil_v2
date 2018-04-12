define(["API", "APIS", 'AppLang', 'views/app/fil_24/requisition.js', 'ionic-popup', "circulationCardService", "Directives", "ReqTestData", "commonFactory", 'userInfoService'], function() {
    return ['$scope', '$state', 'fil_24_requisition', '$ionicLoading', 'AppLang', 'IonicPopupService', 'APIService', '$timeout',
        'APIBridge', "ReqTestData", "circulationCardService", "commonFactory", 'userInfoService', "$ionicPopup", "IonicClosePopupService", "$filter", "$ionicModal",
        function($scope, $state, fil_24_requisition, $ionicLoading, AppLang, IonicPopupService, APIService, $timeout,
            APIBridge, ReqTestData, circulationCardService, commonFactory, userInfoService, $ionicPopup, IonicClosePopupService, $filter, $ionicModal) {

            $scope.langs = AppLang.langs;
            $scope.badreason = [];
            $scope.items = fil_24_requisition.getCeliang();
            $scope.wo = $scope.items.test_name;
            $scope.result_type = $scope.items.result_type;

            $scope.addbadreason = function() {
                $ionicModal.fromTemplateUrl('views/app/fil_24/fil_24_s06/fil_24_s06_02_list.html', {
                    scope: $scope
                }).then(function(modal) {
                    $scope.close = function() {
                        modal.hide().then(function() {
                            $(".wrap_list").show();
                            return modal.remove();
                        });
                    };
                    modal.show();
                });
            };

            $scope.attrib_value = 0;
            $scope.mins = function(type) {
                //    console.log("mins",$scope.attrib_value);
                $scope.attrib_value--;
                if ($scope.attrib_value < 0) {
                    userInfoService.getVoice('不能小于0！！！', function() {});
                    $scope.attrib_value = 0;
                }
            };

            $scope.add = function(type) {
                if ($scope.attrib_value < $scope.items.return_qty) {
                    // console.log("add",$scope.attrib_value);
                    $scope.attrib_value++;
                } else {
                    userInfoService.getVoice('不能大于不良数！！！', function() {});
                }
            };

            $scope.info = [];
            $scope.saveInfo = function() {
                $scope.info.push({
                    "result_type": $scope.result_type,
                    "attrib_value": $scope.attrib_value
                });
                $scope.close();
            };

            // saveInfo()
            $scope.saveInfo1 = function() {
                console.log("///////", $scope.items);
                console.log("///////", $scope.info);
                $scope.items.attrib_list = $scope.info;
                fil_24_requisition.setCeliang($scope.items);
                $state.go('fil_24_s02', {
                    'qc_list': $scope.items,
                    'attrib_list': $scope.info,
                });
            };

        }
    ];
});
