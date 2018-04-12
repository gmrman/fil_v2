define(["API", "APIS", 'AppLang', 'views/app/fil_common/requisition.js', 'array', 'Directives', 'ReqTestData', 'ionic-popup',
    'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService'
], function() {
    return ['$scope', '$state', '$stateParams', '$timeout', '$filter', 'AppLang', 'APIService', 'APIBridge',
        '$ionicLoading', '$ionicPopup', '$ionicModal', '$ionicListDelegate', 'IonicPopupService', 'IonicClosePopupService',
        'fil_common_requisition', 'ReqTestData', 'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService',
        function($scope, $state, $stateParams, $timeout, $filter, AppLang, APIService, APIBridge,
            $ionicLoading, $ionicPopup, $ionicModal, $ionicListDelegate, IonicPopupService, IonicClosePopupService,
            fil_common_requisition, ReqTestData, circulationCardService, commonFactory, commonService, userInfoService, scanTypeService, numericalAnalysisService) {

            $scope.page_params = commonService.get_page_params();
            $scope.userInfo = userInfoService.getUserInfo();

            $scope.counting_type_array = (function() {
                var counting_type_array = [];
                switch (userInfoService.userInfo.server_product) {
                    case 'E10':
                        counting_type_array = [{
                            key: "1",
                            value: $scope.langs.first_count + $scope.langs.one
                        }, {
                            key: "3",
                            value: $scope.langs.second_count + $scope.langs.one
                        }, {
                            key: "4",
                            value: $scope.langs.second_count + $scope.langs.two
                        }];
                        break;
                    case 'WF':
                        counting_type_array = [{
                            key: "1",
                            value: $scope.langs.first_count
                        }, {
                            key: "3",
                            value: $scope.langs.second_count
                        }];
                        break;
                    default:
                        counting_type_array = [{
                            key: "1",
                            value: $scope.langs.first_count + $scope.langs.one
                        }, {
                            key: "2",
                            value: $scope.langs.first_count + $scope.langs.two
                        }, {
                            key: "3",
                            value: $scope.langs.second_count + $scope.langs.one
                        }, {
                            key: "4",
                            value: $scope.langs.second_count + $scope.langs.two
                        }];
                }
                return counting_type_array;
            })();

            $scope.scan = function() {
                console.log("scanBarcode");
                APIBridge.callAPI('scanBarcode', [{}]).then(function(result) {
                    if (result) {
                        console.log('scanBarcode success');
                        $timeout(function() {
                            $scope.checkScan(result.data[0].barcode.trim());
                        });
                    } else {
                        console.log('scanBarcode false');
                    }
                }, function(result) {
                    console.log("scanBarcode fail");
                    console.log(result);
                });
            };

            $scope.scanned = function(value) {
                $scope.checkScan(value.trim());
            };

            $scope.checkScan = function(scanning) {
                $scope.setFocusMe(false);
                if (commonService.isNull(scanning)) {
                    return;
                }
                $scope.scaninfo.scanning = "";
                var index = userInfoService.warehouse.findIndex(function(item) {
                    return commonService.isEquality(scanning, item.warehouse_no);
                });

                if (index != -1) { //判斷是否為倉庫
                    $scope.setwarehouse(userInfoService.warehouse[index]);
                    return;
                }

                $scope.scaninfo.counting_no = scanning;
                $scope.initSourceDocDetail();
                $scope.initBarcodeDetail();

                if (userInfoService.userInfo.server_product == 'E10') {
                    app_bc_stock_count_data_no2_check();
                }
                return;
            };

            var app_bc_stock_count_data_no2_check = function() {
                var webTran = {
                    service: 'app.bc.stock.count.data.no2.check',
                    parameter: {
                        "counting_type": $scope.scaninfo.counting_type,
                        "warehouse_no": $scope.scaninfo.counting_warehouse_no,
                        "counting_no": $scope.scaninfo.counting_no,
                        "site_no": userInfoService.userInfo.site_no,
                    }
                };
                console.log(webTran);
                $ionicLoading.show({
                    template: '<ion-spinner icon="ios"></ion-spinner><p>' + $scope.langs.inventory_data_download + '...</p>'
                });
                APIService.Web_Post(webTran, function(res) {
                    $ionicLoading.hide();
                    // console.log("success:" + angular.toJson(res));
                }, function(error) {
                    $ionicLoading.hide();
                    var execution = error.payload.std_data.execution;
                    console.log("error:" + execution.description);
                    userInfoService.getVoice(execution.description, function() {
                        $scope.scaninfo.counting_no = " ";
                    });
                });
            };

            $scope.countingWarehouseShow = function() {
                $scope.setFocusMe(false);
                commonFactory.showWarehouseModal(userInfoService.warehouse, $scope.scaninfo, setCountingWarehouse, function() {
                    $scope.setFocusMe(true);
                });
            };

            var setCountingWarehouse = function(warehouse) {
                $scope.scaninfo.counting_warehouse_no = warehouse.warehouse_no;
                $scope.scaninfo.counting_warehouse_name = warehouse.warehouse_name;
            };

            $scope.clearCountingWarehouse = function() {
                setcountingWarehouse({
                    "warehouse_no": " ",
                    "warehouse_name": ""
                });
            };

        }
    ];
});