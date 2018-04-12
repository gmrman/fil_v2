define(["API", "APIS", 'AppLang', 'views/app/fil_23/requisition.js', 'ionic-popup', "circulationCardService", "Directives", "ReqTestData", "commonFactory", 'userInfoService'], function() {
    return ['$scope', '$state', 'fil_23_requisition', '$ionicLoading', 'AppLang', 'IonicPopupService', 'APIService', '$timeout',
        'APIBridge', "ReqTestData", "circulationCardService", "commonFactory", 'userInfoService', "$ionicPopup", "IonicClosePopupService", "$filter", "$ionicModal",
        function($scope, $state, fil_23_requisition, $ionicLoading, AppLang, IonicPopupService, APIService, $timeout,
            APIBridge, ReqTestData, circulationCardService, commonFactory, userInfoService, $ionicPopup, IonicClosePopupService, $filter, $ionicModal) {

            $scope.langs = AppLang.langs;
            $scope.badreason = [];
            $scope.items = fil_23_requisition.getQuedian();
            $scope.wo = $scope.items.test_name;

            $scope.addbadreason = function() {
                $ionicModal.fromTemplateUrl('views/app/fil_23/fil_23_s05/fil_23_s05_02_list.html', {
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

            function setData(value) {
                // $scope.data = value;
                $scope.badreason = value;
                // console.log(">>>111111>>",$scope.data);
                console.log(">>>33333>>", $scope.badreason);
            }

            // $scope.scaninfo.focus_me = false;
            var webTran = {
                service: 'app.abnormal.get',
                parameter: {
                    "abnormal_condition": '%'
                }
            };
            // $ionicLoading.show();
            APIService.Web_Post(webTran, function(res) {
                if (res.payload.std_data.parameter) {
                    // $scope.showFlag=true;
                    $timeout(function() {
                        // console.log(">>>2222222>>",res.payload.std_data.parameter);
                        setData(res.payload.std_data.parameter.abnormal);
                    }, 0);
                }

            }, function(error) {
                // $ionicLoading.hide();
                userInfoService.getVoice('查询失败！', function() {});
            });

            $scope.defect_qty = 0;
            $scope.mins = function(type) {
                console.log("mins", $scope.defect_qty);
                $scope.defect_qty--;
                if ($scope.defect_qty < 0) {
                    userInfoService.getVoice('不能小于0！！！', function() {});
                    $scope.defect_qty = 0;
                }
            };

            $scope.add = function(type) {
                if ($scope.defect_qty < $scope.items.reason_qty) {
                    console.log("add", $scope.defect_qty);
                    $scope.defect_qty++;
                } else {
                    userInfoService.getVoice('不能大于缺点数！！！', function() {});
                }
            };

            $scope.reason_no = '';
            $scope.selstorage = function(i) {
                $scope.reason_no = i.abnormal_name;
            };
            $scope.info = [];
            $scope.saveInfo = function() {
                $scope.info.push({
                    "reason_no": $scope.reason_no,
                    "defect_qty": $scope.defect_qty
                });
                $scope.close();
            };
            // saveInfo()
            $scope.saveInfo1 = function() {
                console.log("///////", $scope.items);
                console.log("///////", $scope.info);
                $scope.items.reason_list = $scope.info;
                fil_23_requisition.setQuedian($scope.items);
                $state.go('fil_23_s02', {
                    'qc_list': $scope.items,
                    'reason_list': $scope.info,
                });
            };
            //左滑删除
            $scope.delInfo = function(index) {
                $scope.delGoods(index);
            };
            $scope.delGoods = function(index) {
                var temp = $scope.info.splice(index, 1);
            };


        }
    ];
});
