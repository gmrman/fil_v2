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
            $scope.page_params = commonService.get_page_params();
            $scope.userInfo = userInfoService.getUserInfo();

            //取得預設倉庫 設定頁面 或 第一筆資料
            var out_warehouse = userInfoService.userInfo.warehouse_no || userInfoService.warehouse[0].warehouse_no;
            var index = userInfoService.warehouseIndex[out_warehouse] || 0;

            $scope.scaninfo = {
                scanning: "",
                focus_me: true,
                warehouse_no: out_warehouse,
                warehouse_name: userInfoService.warehouse[index].warehouse_name,
                storage_spaces_no: "",
                storage_spaces_name: "",
                start_date: "",
                barcode: "",
                startdate: "",
                date_type: 1,
                show_zero_inventory: false
            };

            $scope.startdate_array = [{
                key: 1,
                value: $scope.langs.last_week
            }, {
                key: 2,
                value: $scope.langs.last_month
            }, {
                key: 3,
                value: $scope.langs.three_months_ago
            }, {
                key: 4,
                value: $scope.langs.last_year
            }, {
                key: 5,
                value: $scope.langs.other
            }];

            $scope.init_detail = function() {
                $scope.item_detail = [];
                $scope.barcode_detail = [];
                $scope.change_detail = [];
                $scope.showInfo = {};
                $scope.barcode = {};
            };
            $scope.init_detail();

            $scope.setChangeDetail = function(array) {
                $scope.change_detail = angular.copy(array);
            };

            $scope.setItemDetail = function(array) {
                var total_qty = 0;
                $scope.showInfo = {};
                $scope.item_detail = angular.copy(array);
                if (array.length > 0) {
                    $scope.showInfo = angular.copy($scope.item_detail[0]);
                    angular.forEach($scope.item_detail, function(item) {
                        total_qty = numericalAnalysisService.accAdd(total_qty, item.inventory_qty);
                    });
                    $scope.showInfo.total_qty = total_qty || 0;
                }
            };

            $scope.setBarcodeDetail = function(array) {
                $scope.barcode_detail = angular.copy(array);
                if (array.length > 0) {
                    $scope.barcode = $scope.barcode_detail[0];
                    if ($scope.item_detail.length > 0) {
                        var index = $scope.item_detail.findIndex(function(item) {
                            return commonService.isEquality($scope.barcode.item_no, item.item_no) &&
                                commonService.isEquality($scope.barcode.item_feature_no, item.item_feature_no);
                        });

                        $scope.barcode.item_name = $scope.barcode.item_no;
                        if (index !== -1) {
                            $scope.barcode.item_name = $scope.item_detail[index].item_name;
                            $scope.barcode.item_spec = $scope.item_detail[index].item_spec;
                        }
                    }
                }
            };

            $scope.goMenu = function() {
                $state.go("fil_00_s04");
            };

            $scope.setFocusMe = function(flag) {
                if ($scope.scaninfo.focus_me == flag) {
                    $scope.scaninfo.focus_me = !flag;
                    $timeout(function() {
                        $scope.scaninfo.focus_me = flag;
                    }, 0);
                } else {
                    $scope.scaninfo.focus_me = flag;
                }
            };

            $scope.queryChangeDetail = function(item) {
                var webTran = {
                    service: 'app.stock.data.get',
                    parameter: {
                        "program_job_no": "15",
                        "site_no": userInfoService.userInfo.site_no,
                        "scan_barcode": item.item_no,
                        "scan_warehouse_no": item.warehouse_no,
                        "scan_storage_spaces_no": item.storage_spaces_no,
                        "scan_start_date": $scope.scaninfo.start_date,
                        "query_type": "2", //2. 只查料件期間異動
                        "show_zero_inventory": ($scope.scaninfo.show_zero_inventory) ? "Y" : "N"
                    }
                };
                console.log(webTran);
                if (ReqTestData.testData) {
                    var parameter = ReqTestData.getStock(webTran.parameter);
                    if (angular.isUndefined(parameter.change_detail)) {
                        parameter.change_detail = [];
                    }
                    $scope.setChangeDetail(parameter.change_detail);
                    $state.go("fil_15_s01.s05");
                } else {
                    $ionicLoading.show();
                    APIService.Web_Post(webTran, function(res) {
                        console.log("success:" + res);
                        var parameter = res.payload.std_data.parameter;
                        $ionicLoading.hide();
                        if (angular.isUndefined(parameter.change_detail)) {
                            parameter.change_detail = [];
                        }
                        $scope.setChangeDetail(parameter.change_detail);
                        $state.go("fil_15_s01.s05");
                    }, function(error) {
                        var execution = error.payload.std_data.execution;
                        $ionicLoading.hide();
                        console.log("error:" + execution.description);
                        userInfoService.getVoice(execution.description, function() {
                            $scope.setFocusMe(true);
                        });
                    });
                }
            };

        }
    ];
});
