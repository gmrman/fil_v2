define(["API", "APIS", 'AppLang', 'views/app/fil_common/requisition.js', 'array', 'Directives', 'ReqTestData', 'ionic-popup',
    'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService'
], function() {
    return ['$scope', '$state', '$stateParams', '$timeout', '$filter', 'AppLang', 'APIService', 'APIBridge',
        '$ionicLoading', '$ionicPopup', '$ionicModal', '$ionicListDelegate', 'IonicPopupService', 'IonicClosePopupService',
        'fil_common_requisition', 'ReqTestData', 'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService',
        function($scope, $state, $stateParams, $timeout, $filter, AppLang, APIService, APIBridge,
            $ionicLoading, $ionicPopup, $ionicModal, $ionicListDelegate, IonicPopupService, IonicClosePopupService,
            fil_common_requisition, ReqTestData, circulationCardService, commonFactory, commonService, userInfoService, scanTypeService, numericalAnalysisService) {

            $scope.langs = AppLang.langs;
            $scope.showFlag = true;
            // $scope.showFlag=false;
            $scope.data = fil_23_requisition.getInfocheck();
            // $scope.data = angular.copy($stateParams.item);
            $scope.qc_list = angular.copy($stateParams.qc_list);
            //console.log("qc_list",$scope.qc_list);
            $scope.items = $scope.data.qc_list;
            //$scope.data.result_type=fil_23_requisition.getResult_type();
            // goReason
            $scope.goReason = function($index) {
                fil_23_requisition.setQuedian($scope.items[$index]);
                //console.log("缺点原因$scope.items[$index]",$scope.items[$index]);
                $state.go('fil_23_s05', {
                    item: $scope.items[$index].test_name,
                });
            };

            // goMeasured_value
            $scope.goMeasured_value = function($index) {
                fil_23_requisition.setCeliang($scope.items[$index]);
                //console.log("测量值$scope.items[$index]",$scope.items[$index]);
                $state.go('fil_23_s06', {
                    item: $scope.items[$index].test_name,
                });
            };
            //check_ok_qty
            $scope.check_ok_qty = function() {
                if ($scope.data.ok_qty >= $scope.data.receipt_qty) {
                    userInfoService.getVoice("合格量不能大于送验量！", function() {});
                    $scope.data.ok_qty = $scope.data.receipt_qty;
                } else if ($scope.data.ok_qty < 0) {
                    userInfoService.getVoice("合格量不能不能小于0！", function() {});
                    $scope.data.ok_qty = 0;
                }
            };
            //check_test_qty
            $scope.check_test_qty = function(index) {

                //console.log("test_qty",$scope.items[index].test_qty);
                if ($scope.items[index].test_qty > $scope.data.receipt_qty) {
                    userInfoService.getVoice("抽验量不能大于送验量！", function() {});
                    $scope.items[index].test_qty = 0;
                } else if ($scope.items[index].test_qty < 0) {
                    userInfoService.getVoice("抽验量不能小于0！", function() {});
                    $scope.items[index].test_qty = 0;
                }
                fil_23_requisition.setTest_qty($scope.items[index].test_qty);
            };

            //缺点数和不良数都不能大于抽验量
            $scope.check_test = function(index, flag) {
                var test_qty = fil_23_requisition.getTest_qty(); //获取ng-change的那一行抽验量
                console.log("test_qty", test_qty);
                var ymf = 0;
                if (ymf === 0) {
                    $scope.num = fil_23_requisition.getMainData(); //获取扫码后的所有返参值
                    angular.forEach($scope.num.receipt_list, function(item) { //循环遍历扫码后的所有返参值找到项次相同的receipt_list
                        if (item.seq == fil_23_requisition.getInfocheck().seq) { //判断项次是否相同
                            angular.forEach(item.qc_list, function(data) { //循环遍历qc_list找到行序相同的缺点数和不良数
                                if (data.qc_seq == $scope.items[index].qc_seq) //判断行序是否相同
                                    if ($scope.items[index].reason_qty > $scope.items[index].test_qty) { //判断缺点数是否大于抽验量
                                    userInfoService.getVoice("缺点数不能大于抽验量！", function() {});
                                    // IonicPopupService.errorAlert("缺点数不能大于抽验量！");
                                    $scope.items[index].reason_qty--;
                                    ymf = 1; //当ymf!=0时，跳出循环
                                } else if ($scope.items[index].reason_qty < 0) {
                                    userInfoService.getVoice("缺点数不能小于0！！", function() {});
                                    //IonicPopupService.errorAlert("缺点数不能小于0！！");
                                    $scope.items[index].reason_qty = 0;

                                }
                                if ($scope.items[index].return_qty > $scope.items[index].test_qty) { //判断不良数是否大于抽验量
                                    userInfoService.getVoice("不良数不能大于抽验量！", function() {});
                                    //IonicPopupService.errorAlert("不良数不能大于抽验量！");
                                    $scope.items[index].return_qty--;
                                    ymf = 1; //当ymf!=0时，跳出循环
                                } else if ($scope.items[index].return_qty < 0) {
                                    userInfoService.getVoice("不良数不能小于0！", function() {});
                                    // IonicPopupService.errorAlert("不良数不能小于0！");
                                    $scope.items[index].return_qty = 0;
                                }
                            });
                        }
                    });

                    //判定合格否
                    var webTran = {
                        service: 'app.qc.pass',
                        parameter: {
                            "check_type": flag,
                            "test_qty": $scope.items[index].test_qty,
                            "defect_level": $scope.items[index].defect_level,
                            "reject_qty": $scope.items[index].reject_qty,
                            "reason_qty": $scope.items[index].reason_qty,
                            "return_qty": $scope.items[index].return_qty,
                        }
                    };
                    // $ionicLoading.show();
                    APIService.Web_Post(webTran, function(res) {
                        $timeout(function() {
                            $scope.items[index].result_type = res.payload.std_data.parameter.result_type;
                            console.log("$scope.items[index]", $scope.items[index]);
                            fil_23_requisition.setResult_type($scope.items[index].result_type);
                        }, 0);

                    }, function(error) {
                        // $ionicLoading.hide();
                        userInfoService.getVoice('检验失败！', function() {});
                    });
                    //判定状态
                    $scope.data.result_type = fil_23_requisition.getResult_type();
                }
            };

            //console.log("缺点值",fil_23_requisition.getQuedian());
            //console.log("不良值",fil_23_requisition.getCeliang());
            //saveInfo
            $scope.saveInfo = function() {
                $scope.data = fil_23_requisition.getMainData();
                angular.forEach($scope.data.receipt_list, function(item) {
                    if (item.seq == fil_23_requisition.getInfocheck().seq) {
                        angular.forEach(item.qc_list, function(list) {
                            if (list.qc_seq == fil_23_requisition.getQuedian().qc_seq) {
                                list = fil_23_requisition.getQuedian();
                                console.log("item.qc_list", item.qc_list);
                            }
                        });
                    }
                });
                $state.go('fil_23_s01', {
                    // 'qc_list':$scope.items,
                    // 'attrib_list': $scope.info,
                });
            };
        }
    ];
});
