define(["API", "APIS", 'AppLang', 'views/app/fil_common/requisition.js', 'array', 'Directives', 'ReqTestData', 'ionic-popup',
    'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService'
], function() {
    return ['$scope', '$state', '$stateParams', '$timeout', '$filter', 'AppLang', 'APIService', 'APIBridge',
        '$ionicLoading', '$ionicPopup', '$ionicModal', '$ionicListDelegate', 'IonicPopupService', 'IonicClosePopupService', 'fil_common_requisition',
        'fil_00_s04_requisition', 'ReqTestData', 'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService',
        function($scope, $state, $stateParams, $timeout, $filter, AppLang, APIService, APIBridge,
            $ionicLoading, $ionicPopup, $ionicModal, $ionicListDelegate, IonicPopupService, IonicClosePopupService, fil_common_requisition,
            fil_00_s04_requisition, ReqTestData, circulationCardService, commonFactory, commonService, userInfoService, scanTypeService, numericalAnalysisService) {

            $scope.langs = AppLang.langs;
            $scope.page_params = commonService.get_page_params();
            $scope.userInfo = userInfoService.getUserInfo();

            $scope.scaninfo = {
                scanning: "",
                focus_me: true,
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

            $scope.scan = function() {
                console.log("scanBarcode");
                $scope.scaninfo.scanning = "";
                APIBridge.callAPI('scanBarcode', [{}]).then(
                    function(result) {
                        if (result) {
                            console.log('scanBarcode success');
                            $timeout(function() {
                                $scope.checkScan(result.data[0].barcode.trim());
                            }, 0);
                        } else {
                            console.log('scanBarcode false');
                        }
                    },
                    function(result) {
                        console.log("scanBarcode fail");
                        console.log(result);
                    }
                );
            };

            $scope.scanned = function(value) {
                $scope.checkScan(value.trim());
            };

            //檢查掃描欄位資料
            $scope.checkScan = function(scanning) {
                $scope.setFocusMe(false);
                if (commonService.isNull(scanning)) {
                    return;
                }

                var webTran = {
                    service: 'app.production.type.get',
                    parameter: {
                        "main_category": $scope.page_params.status,
                        "barcode_no": scanning,
                        "site_no": userInfoService.userInfo.site_no
                    }
                };

                $ionicLoading.show();
                APIService.Web_Post(webTran, function(res) {
                    $ionicLoading.hide();
                    // console.log("success:" + angular.toJson(res));
                    var parameter = res.payload.std_data.parameter;
                    jumpProduction(parameter, scanning);
                }, function(error) {
                    $ionicLoading.hide();
                    var execution = error.payload.std_data.execution;
                    console.log("error:" + execution.description);
                    userInfoService.getVoice(execution.description, function() {
                        $scope.setFocusMe(true);
                    });
                });
            };

            var jumpProduction = function(parameter, scanning) {

                var program_type = parameter.program_type;
                if (commonService.isNull(program_type)) {
                    //顯示錯誤 "scanning 不存在或無效！"
                    userInfoService.getVoice(scanning + $scope.langs.not_exist_or_invalid, function() {
                        $scope.setFocusMe(true);
                    });
                    return;
                }
                var list = [];
                var index = -1;
                if ($scope.page_params.status == "A") {
                    list = fil_00_s04_requisition.purchase;
                    var func = "";
                    switch (program_type) {
                        case "A-1":
                            func = "fil107"; //採購收貨
                            break;
                        case "A-2":
                            func = "fil101"; //採購收貨(待辦)
                            break;
                        case "A-3":
                            func = "fil104"; //採購收貨(單據)
                            break;
                    }
                    if (!commonService.isNull(func)) {
                        index = list.findIndex(function(item) {
                            return item.func == func;
                        });
                    }
                }

                if ($scope.page_params.status == "B") {
                    list = fil_00_s04_requisition.produce;
                    switch (program_type) {
                        case "B-1":
                            break;
                        default:
                            index = 0;
                    }
                }

                if (index == -1) {
                    userInfoService.getVoice("program_type : " + program_type, function() {
                        $scope.setFocusMe(true);
                    });
                    return;
                }

                fil_common_requisition.scanning = scanning;
                commonService.set_page_params(list[index], $scope.userInfo.account);
                $state.go(list[index].url);
            };

        }
    ];
});
