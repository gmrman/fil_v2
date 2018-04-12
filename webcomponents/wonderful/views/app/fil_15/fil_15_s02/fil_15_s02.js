define(["API", "APIS", 'AppLang', 'views/app/fil_common/requisition.js', 'array', 'Directives', 'ReqTestData', 'ionic-popup',
    'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService'
], function() {
    return ['$scope', '$state', '$stateParams', '$timeout', '$filter', 'AppLang', 'APIService', 'APIBridge',
        '$ionicLoading', '$ionicPopup', '$ionicModal', '$ionicListDelegate', 'IonicPopupService', 'IonicClosePopupService',
        'fil_common_requisition', 'ReqTestData', 'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService',
        function($scope, $state, $stateParams, $timeout, $filter, AppLang, APIService, APIBridge,
            $ionicLoading, $ionicPopup, $ionicModal, $ionicListDelegate, IonicPopupService, IonicClosePopupService,
            fil_common_requisition, ReqTestData, circulationCardService, commonFactory, commonService, userInfoService, scanTypeService, numericalAnalysisService) {

            $scope.scan = function() {
                console.log("scanBarcode");
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

            $scope.scanned = function(value) {
                $scope.checkScan(value.trim());
            };

            //檢查掃描欄位資料
            $scope.checkScan = function(scanning) {
                $scope.scaninfo.scanning = "";
                $scope.setFocusMe(false);
                $scope.init_detail();
                if (commonService.isNull(scanning)) {
                    return;
                }

                var index = userInfoService.warehouse.findIndex(function(item) {
                    return commonService.isEquality(scanning, item.warehouse_no);
                });

                if (index !== -1) { //存在於倉庫基本檔
                    $scope.setwarehouse(userInfoService.warehouse[index]);
                    return;
                }

                index = userInfoService.storageSpaces.findIndex(function(item) {
                    return commonService.isEquality(scanning, item.storage_spaces_no);
                });

                if (index !== -1) { //存在於儲位基本檔
                    $scope.setstorage(userInfoService.storageSpaces[index]);
                    return;
                }

                $scope.setbarcode(scanning);

            };

            var setConditionDate = function() {
                var date = angular.copy($scope.scaninfo.startdate);
                var date_type = $scope.scaninfo.date_type;

                if (date_type !== 5) {
                    //取得現在年月日
                    var currentTime = new Date(); //得到當前的時間
                    var currentYear = currentTime.getFullYear(); //得到當前的年份 
                    var currentMoon = currentTime.getMonth() + 1; //得到當前的月份（系統默認為0-11，所以要加1才算是當前的月份）  
                    var currentDay = currentTime.getDate(); //得到當前的天數

                    //獲取當前時間的一個月內的年月日
                    var agoDay = currentDay;
                    var agoMoon = currentMoon;
                    var agoYear = currentYear;
                    var max = "";
                    switch (date_type) {
                        case 1:
                            agoDay = currentDay - 7;
                            if (agoDay < 0) { 
                                agoMoon = currentMoon - 1; //月份減1
                                max = new Date(agoYear, agoMoon, 0).getDate(); //獲取上個月的總天數
                                agoDay = max + agoDay; //天數在上個月的總天數的基礎上減去負數
                            }
                            break;
                        case 2:
                            agoMoon = currentMoon - 1;
                            max = new Date(agoYear, agoMoon, 0).getDate(); //獲取上個月的總天數   
                            break;
                        case 3:
                            agoMoon = currentMoon - 3;
                            max = new Date(agoYear, agoMoon, 0).getDate(); //獲取上個月的總天數   
                            break;
                        case 4:
                            agoYear = currentYear - 1;
                            break;
                    }

                    //3.0對處理的年月日作邏輯判斷
                    if (max !== "") {
                        //如果beginDay > max（如果是當前時間的天數+1後的數值超過了上個月的總天數： 天數變為1，月份增加1）
                        if (agoDay > max) {
                            agoDay = 1;
                            agoMoon += 1;
                        }
                        //如果月份當月為1月的時候， 那麼一個月內： 年：-1 月：12 日：依然不變  
                        if (agoMoon === 0) {
                            agoMoon = 12;
                            agoYear = currentYear - 1;
                        }
                    }

                    date = new Date(agoYear, agoMoon - 1, agoDay);
                }
                console.log($filter('date')(date, 'yyyy-MM-dd'));
                return $filter('date')(date, 'yyyy-MM-dd');
            };

            $scope.query = function() {
                $scope.scaninfo.start_date = setConditionDate();
                var webTran = {
                    service: 'app.stock.data.get',
                    parameter: {
                        "program_job_no": "15",
                        "site_no": userInfoService.userInfo.site_no,
                        "scan_barcode": $scope.scaninfo.barcode,
                        "scan_warehouse_no": $scope.scaninfo.warehouse_no,
                        "scan_storage_spaces_no": $scope.scaninfo.storage_spaces_no,
                        "scan_start_date": $scope.scaninfo.start_date,
                        "query_type": "1", //1. 只查料件/條碼庫存
                        "show_zero_inventory": ($scope.scaninfo.show_zero_inventory) ? "Y" : "N"
                    }
                };

                $ionicLoading.show();
                APIService.Web_Post(webTran, function(res) {
                    // console.log("success:" + angular.toJson(res));
                    var parameter = res.payload.std_data.parameter;
                    $ionicLoading.hide();
                    if (angular.isUndefined(parameter.item_detail) || angular.isUndefined(parameter.barcode_detail)) {
                        userInfoService.getVoice($scope.langs.ws_return_error, function() {
                            $scope.setFocusMe(true);
                        });
                        return;
                    }
                    if (angular.isUndefined(parameter.change_detail)) {
                        parameter.change_detail = [];
                    }
                    setParameter(parameter.item_detail, parameter.barcode_detail, parameter.change_detail);
                }, function(error) {
                    var execution = error.payload.std_data.execution;
                    $ionicLoading.hide();
                    console.log("error:" + execution.description);
                    userInfoService.getVoice(execution.description, function() {
                        $scope.setFocusMe(true);
                    });
                });
            };

            var setParameter = function(item_detail, barcode_detail, change_detail) {
                $scope.setItemDetail(item_detail);
                $scope.setBarcodeDetail(barcode_detail);
                $scope.setChangeDetail(change_detail);
                console.log(item_detail);
                if (barcode_detail.length === 0 && item_detail.length === 0) {
                    userInfoService.getVoice($scope.langs.barcode_not_relevant_inventory, function() {
                        $scope.setFocusMe(true);
                    });
                } else {
                    if (barcode_detail.length > 0) {
                        $state.go("fil_15_s01.s03");
                    } else {
                        $state.go("fil_15_s01.s04");
                    }
                }
            };

            $scope.storageShow = function() {
                $scope.setFocusMe(false);
                commonFactory.showStorageModal(userInfoService.storageSpaces, $scope.scaninfo, $scope.setstorage, function() {
                    $scope.setFocusMe(true);
                });
            };

            $scope.setstorage = function(storage) {
                $scope.setFocusMe(true);
                $scope.scaninfo.storage_spaces_no = storage.storage_spaces_no;
                $scope.scaninfo.storage_spaces_name = storage.storage_spaces_name;
                $scope.setquery_show();
            };

            $scope.warehouseShow = function() {
                $scope.setFocusMe(false);
                commonFactory.showWarehouseModal(userInfoService.warehouse, $scope.scaninfo, $scope.setwarehouse, function() {
                    $scope.setFocusMe(true);
                });
            };

            $scope.setwarehouse = function(warehouse) {
                $scope.setFocusMe(true);
                $scope.scaninfo.warehouse_no = warehouse.warehouse_no;
                $scope.scaninfo.warehouse_name = warehouse.warehouse_name;
                $scope.setquery_show();
            };

            $scope.setbarcode = function(barcode) {
                $scope.setFocusMe(true);
                $scope.scaninfo.barcode = barcode;
                $scope.setquery_show();
            };

            $scope.clearWarehouse = function() {
                $scope.setwarehouse({
                    warehouse_no: "",
                    warehouse_name: ""
                });
            };

            $scope.clearStorage = function() {
                $scope.setstorage({
                    storage_spaces_no: "",
                    storage_spaces_name: ""
                });
            };

            $scope.clearBarcode = function() {
                $scope.setbarcode("");
            };

            $scope.setquery_show = function() {
                if (!commonService.isNull($scope.scaninfo.warehouse_no) ||
                    !commonService.isNull($scope.scaninfo.barcode)) {
                    $scope.query_show = true;
                } else {
                    $scope.query_show = false;
                }
            };
            $scope.setquery_show();
        }
    ];
});
