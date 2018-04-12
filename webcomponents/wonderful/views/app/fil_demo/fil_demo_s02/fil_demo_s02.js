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

                var webTran = {
                    service: 'department.data.get',
                    parameter: {
                        department_no: scanning,
                    }
                };

                $ionicLoading.show();
                APIService.Web_Post(webTran, function(res) {
                    console.log("success:" + angular.toJson(res));
                    var parameter = res.payload.std_data.parameter;
                    $ionicLoading.hide();
                    $scope.departmentInfo.department_no = parameter.department_no;
                    $scope.departmentInfo.department_name = parameter.department_name;
                    setquery_show();
                }, function(error) {
                    var execution = error.payload.std_data.execution;
                    $ionicLoading.hide();
                    console.log("error:" + execution.description);
                    userInfoService.getVoice(execution.description, function() {
                        $scope.setFocusMe(true);
                    });
                });
            };

            var setquery_show = function() {
                if (!commonService.isNull($scope.departmentInfo.department_no)) {
                    $scope.query_show = true;
                } else {
                    $scope.query_show = false;
                }
            };
            setquery_show();

            //保存部門資訊
            $scope.save = function() {
                $ionicLoading.show();
                APIBridge.callAPI('department_create', [$scope.departmentInfo]).then(function(result) {
                    console.log('department_create success');
                    $scope.init_departmentInfo();
                    $ionicLoading.hide();
                }, function(error) {
                    $ionicLoading.hide();
                    console.log(error);
                    userInfoService.getVoice("department_create fail:" + error.message, function() {
                        $scope.setFocusMe(true);
                    });
                });
            };

        }
    ];
});
