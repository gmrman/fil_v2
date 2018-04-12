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
                focus_me: true
            };

            $scope.scan = function() {
                $scope.scaninfo.scanning = "";
                $scope.setFocusMe(false);
                console.log("scanBarcode");
                APIBridge.callAPI('scanBarcode', [{}]).then(function(result) {
                    if (result) {
                        console.log('scanBarcode success');
                        $scope.setFocusMe(true);
                        $scope.checkScan(result.data[0].barcode.trim());
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
                $scope.scaninfo.scanning = "";

                var webTran = {
                    service: 'app.wo.process.data.get',
                    parameter: {
                        "site_no": userInfoService.userInfo.site_no,
                        "analysis_symbol": userInfoService.userInfo.barcode_separator,
                        "barcode_no": scanning
                    }
                };
                $ionicLoading.show();
                APIService.Web_Post(webTran, function(res) {
                    $ionicLoading.hide();
                    // console.log("success:" + angular.toJson(res));
                    var parameter = res.payload.std_data.parameter;
                    setColor(parameter);
                }, function(error) {
                    $ionicLoading.hide();
                    var execution = error.payload.std_data.execution;
                    console.log("error:" + execution.description);
                    userInfoService.getVoice(execution.description, function() {
                        $scope.setFocusMe(true);
                    });
                });
            };

            var setColor = function(parameter) {
                var list = parameter.wo_process;
                for (var i = 0; i < list.length; i++) {
                    var temp = list[i];
                    if (temp.isreport == "Y") {
                        if (temp.report_qty <= 0 && temp.scrap_qty <= 0) {
                            temp.isSelected = true;
                            break;
                        }
                    }
                    if (temp.ispqc == "Y") {
                        if (temp.eligible_qty <= 0 && temp.uneligible_qty <= 0) {
                            temp.isSelected = true;
                            break;
                        }
                    }
                }
                $scope.wo_process_list = list;
                $scope.setFocusMe(true);
            };

            $scope.clearScanning = function() {
                $scope.scaninfo.scanning = "";
                $scope.setFocusMe(true);
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

            if (!commonService.isNull(fil_common_requisition.scanning)) {
                var scanning = angular.copy(fil_common_requisition.scanning);
                fil_common_requisition.init();
                $scope.checkScan(scanning);
            }
        }
    ];
});
