define(["API", "APIS", 'AppLang', 'views/app/fil_common/requisition.js', 'array', 'Directives', 'ReqTestData', 'ionic-popup',
    'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService'
], function() {
    return ['$scope', '$state', '$timeout', '$filter', 'AppLang', 'APIService', 'APIBridge',
        '$ionicLoading', '$ionicPopup', '$ionicModal', '$ionicListDelegate', 'IonicPopupService', 'IonicClosePopupService',
        'fil_common_requisition', 'ReqTestData', 'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService',
        function($scope, $state, $timeout, $filter, AppLang, APIService, APIBridge,
            $ionicLoading, $ionicPopup, $ionicModal, $ionicListDelegate, IonicPopupService, IonicClosePopupService,
            fil_common_requisition, ReqTestData, circulationCardService, commonFactory, commonService, userInfoService, scanTypeService, numericalAnalysisService) {


            $scope.langs = AppLang.langs;
            // $scope.showFlag=false;
            $scope.showFlag = false;
            $scope.saveFlag = false;
            $scope.placeFlag = false;
            $scope.userInfo = userInfoService.getUserInfo();
            $scope.page_params = commonService.get_page_params();
            // $scope.featureFlag= userInfoService.userInfo.feature=='Y'?true:false;
            $scope.scaninfo = {
                scanning: "",
                // search: "",
                focus_me: true
            };

            $scope.data = {};
            $scope.items = [];

            //set
            function setData(value) {
                $scope.showFlag = true;
                $scope.data = value;
                $scope.items = value.delivery_detail;
                angular.forEach($scope.items, function(item) {
                    item.isOk = false;
                    item.real_qty = parseInt(item.qty);
                    console.log(item.real_qty);
                });
                console.log($scope.showFlag);
            }

            // scan
            //扫
            $scope.scan = function() {
                // console.log("scanBarcode");
                APIBridge.callAPI('scanBarcode', [{}]).then(function(result) {
                    if (result) {
                        console.log('scanBarcode success');
                        $timeout(function() {
                            $scope.checkScan(result.data[0].barcode.trim());
                        }, 0);
                    } else {
                        console.log('scanBarcode false');
                    }
                }, function(result) {
                    console.log("scanBarcode fail");
                    console.log(result);
                });
            };
            //          	//输入
            $scope.scanned = function(value) {
                // $scope.scaninfo.scanning=value;
                $scope.checkScan(value.trim());
            };

            //          //檢查掃描欄位資料
            $scope.checkScan = function(scanning) {
                $scope.scaninfo.scanning = "";
                $scope.scaninfo.focus_me = false;
                var webTran = {
                    service: 'delivery.get',
                    parameter: {
                        "delivery_no": scanning
                    }
                };
                $ionicLoading.show();
                APIService.Web_Post(webTran, function(res) {
                    $ionicLoading.hide();
                    // if (res.payload.std_data.execution.description == "已全部收货") {
                    //     IonicPopupService.showAlert('信息', '已全部收货');
                    // }
                    if (res.payload.std_data.parameter) {
                        $scope.scaninfo.focus_me = true;
                        $scope.showFlag = true;
                        $timeout(function() {
                            setData(res.payload.std_data.parameter);
                        }, 0);
                    }

                }, function(error) {
                    $ionicLoading.hide();
                    console.log(error);
                    userInfoService.getVoice(error.payload.std_data.execution.description, function() {});
                });
            };

            // checkOK
            $scope.changeOk = function($index) {
                $scope.items[$index].isOk = !$scope.items[$index].isOk;
                var n = 0;
                angular.forEach($scope.items, function(item) {
                    if (item.isOk) {
                        $scope.saveFlag = true;
                        n++;
                    }
                });
                if (n === 0) {
                    $scope.saveFlag = false;
                }
                console.log($scope.items[$index].isOk);
            };

            $scope.checkQty = function($index) {
                $scope.placeFlag = false;
                var item = $scope.items[$index];
                if (item.real_qty > item.qty) {
                    userInfoService.getVoice("实收量不可以大于送货量", function() {});
                    item.real_qty = item.qty;
                    item.isOk = false;
                } else if (item.real_qty === '') {
                    item.real_qty = 0;
                }
            };

            $scope.focusQty = function(index) {
                if (index == $scope.items.length - 1) {
                    $scope.placeFlag = true;
                }
            };

            //save
            $scope.saveInfo = function() {
                var arr = [];
                angular.forEach($scope.items, function(item) {
                    if (item.isOk === true) {
                        arr.push({
                            "delivery_no": $scope.data.delivery_no,
                            "item_no": item.item_no,
                            "item_feature_no": item.item_feature_no,
                            "qty": item.real_qty
                        });
                    }
                });
                console.log(arr);
                if (arr.length === 0) {
                    IonicPopupService.showAlert('信息', "请确定修改内容");
                    return;
                } else {
                    var webTran = {
                        service: 'receipt.create',
                        parameter: {
                            "receipt_detail": arr
                        }
                    };
                    $ionicLoading.show();
                    APIService.Web_Post(webTran, function(res) {
                        $ionicLoading.hide();
                        var parameter = res.payload.std_data.parameter;
                        $scope.data = {};
                        $scope.items = [];
                        $scope.showFlag = false;
                        $scope.saveFlag = false;
                        IonicPopupService.successAlert(parameter.doc_no).then(function() {
                            $state.go("fil3_01_s01");
                        });
                    }, function(error) {
                        $ionicLoading.hide();
                        userInfoService.getVoice(error.payload.std_data.execution.description, function() {});
                    });
                }

            };

        }
    ];
});
