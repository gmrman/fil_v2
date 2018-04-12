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
            $scope.page_params = commonService.get_page_params();
            $scope.userInfo = userInfoService.getUserInfo();

            $scope.scaninfo = {
                scanning: "",
                focus_me: true,
                barcode_no: "",
                item_no: "",
                item_name: "",
                item_spec: ""
            };

            $scope.init_detail = function() {
                $scope.barcode_detail = [];
                $scope.item = {};
                $scope.barcode = {};
            };
            $scope.init_detail();

            $scope.setBarcodeDetail = function(array) {
                $scope.barcode_detail = angular.copy(array);
                if (array.length > 0) {
                    $scope.barcode = $scope.barcode_detail[0];
                }
            };

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

                var webTran = {
                    service: 'app.stock.data.get',
                    parameter: {
                        "site_no": userInfoService.userInfo.site_no,
                        "program_job_no": $scope.page_params.program_job_no,
                        "scan_barcode": scanning,
                        "scan_warehouse_no": " ",
                        "scan_storage_spaces_no": " ",
                        "scan_start_date": " ",
                        "query_type": " ", 
                        "show_zero_inventory": ($scope.scaninfo.show_zero_inventory) ? "Y" : "N"
                    }
                };

                $ionicLoading.show();
                APIService.Web_Post(webTran, function(res) {
                    // console.log("success:" + angular.toJson(res));
                    var parameter = res.payload.std_data.parameter;
                    $ionicLoading.hide();
                    setParameter(scanning, parameter.barcode_detail);
                }, function(error) {
                    var execution = error.payload.std_data.execution;
                    $ionicLoading.hide();
                    console.log("error:" + execution.description);
                    userInfoService.getVoice(execution.description, function() {
                        $scope.setFocusMe(true);
                    });
                });
            };

            var setParameter = function(scanning, barcode_detail) {
                $scope.setBarcodeDetail(barcode_detail);
                if (barcode_detail.length === 0) {
                    userInfoService.getVoice(scanning + $scope.langs.not_exist_or_invalid, function() {
                        $scope.setFocusMe(true);
                    });
                }
            };

            $scope.showFrozenPop = function() {
                if (commonService.isNull($scope.barcode.barcode_no)) {
                    return;
                }
                var title = $scope.langs.check + $scope.langs.froze + $scope.langs.these + $scope.langs.barcode;
                if ($scope.barcode.frozen == "Y") {
                    title = $scope.langs.check + $scope.langs.cancel + $scope.langs.froze + $scope.langs.these + $scope.langs.barcode;
                }
                var LotPopup = $ionicPopup.show({
                    title: title,
                    scope: $scope,
                    buttons: [{
                        text: $scope.langs.cancel,
                        onTap: function() {}
                    }, {
                        text: $scope.langs.confirm,
                        onTap: function() {
                            frozenUpdate();
                        }
                    }]
                });
            };

            var frozenUpdate = function() {
                var temp = angular.copy($scope.barcode.frozen);
                var webTran = {
                    service: 'app.bc.frozen.update',
                    parameter: {
                        "site_no": userInfoService.userInfo.site_no,
                        "barcode_no": $scope.barcode.barcode_no,
                        "status": (temp == "Y") ? "N" : "Y"
                    }
                };
                $ionicLoading.show();
                APIService.Web_Post(webTran, function(res) {
                    $ionicLoading.hide();
                    $scope.barcode.frozen = (temp == "Y") ? "N" : "Y";
                }, function(error) {
                    var execution = error.payload.std_data.execution;
                    $ionicLoading.hide();
                    console.log("error:" + execution.description);
                    userInfoService.getVoice(execution.description, function() {
                        $scope.setFocusMe(true);
                    });
                });
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

        }
    ];
});
