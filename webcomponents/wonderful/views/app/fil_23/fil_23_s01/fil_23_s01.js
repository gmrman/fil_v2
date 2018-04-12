define(["API", "APIS", 'views/app/fil_23/requisition.js', 'AppLang', 'ionic-popup', "Directives", "ReqTestData",
    "circulationCardService", "commonFactory", 'userInfoService'
], function() {
    return ['$scope', '$state', '$ionicLoading', 'AppLang', 'APIService', 'APIBridge', "ReqTestData", '$timeout', "$filter",
        'IonicPopupService', "$ionicModal", "$ionicPopup", "IonicClosePopupService",
        "circulationCardService", "commonFactory", 'userInfoService', 'fil_23_requisition',
        function($scope, $state, $ionicLoading, AppLang, APIService, APIBridge, ReqTestData, $timeout, $filter,
            IonicPopupService, $ionicModal, $ionicPopup, IonicClosePopupService,
            circulationCardService, commonFactory, userInfoService, fil_23_requisition) {

            // $scope.data=angular.copy(fil_23_requisition.getData());
            // $scope.items=angular.copy(fil_23_requisition.getItems());
            $scope.langs = AppLang.langs;
            $scope.scaninfo = {
                scanning: "",
                // search: "",
                focus_me: true
            };

            // $scope.showFlag=false;
            $scope.showFlag = true;
            $scope.data = {};
            $scope.data = fil_23_requisition.getMainData();
            $scope.items = [];
            $scope.items = $scope.data.receipt_list;
            // $scope.items.result_type=fil_23_requisition.getetResult_type();

            function setData(value) {
                $scope.showFlag = true;
                $scope.data = value;
                $scope.items = value.receipt_list;
                fil_23_requisition.setMainData($scope.data);
                console.log('data', $scope.data);
                console.log('items', $scope.items);
            }

            // scan
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
                // $scope.scaninfo.scanning=value;
                $scope.checkScan(value.trim());
            };
            $scope.checkScan = function(scanning) {
                $scope.scaninfo.scanning = "";
                // $scope.scaninfo.focus_me = false;
                var webTran = {
                    service: 'app.qc.list.get',
                    parameter: {
                        "barcode_no": scanning
                    }
                };
                $ionicLoading.show();
                APIService.Web_Post(webTran, function(res) {
                    $ionicLoading.hide();
                    if (res.payload.std_data.parameter) {
                        $scope.showFlag = true;
                        $timeout(function() {
                            setData(res.payload.std_data.parameter);
                        }, 0);
                    }
                }, function(error) {
                    $ionicLoading.hide();
                    userInfoService.getVoice('查询失败！', function() {});
                    //  IonicPopupService.errorAlert('查询失败！');
                });
            };

            //goList
            $scope.goList = function($index) {
                // setMainData
                fil_23_requisition.setInfocheck($scope.items[$index]);
                $state.go('fil_23_s02', {
                    'item': $scope.items[$index]
                });
            };
            //clearSqlite
            var clearSqlite = function(qc_no) {
                fil_23_requisition.init();
                IonicPopupService.successAlert(qc_no);
                //$scope.clearList();
            };

            //saveInfo提交
            $scope.saveInfo = function() {
                $scope.receipt_list = [];
                $scope.submit = fil_23_requisition.getMainData();
                console.log("$scope.submit", $scope.submit);
                angular.forEach($scope.items, function(data) {
                    if (data.result_type == "P" || data.result_type == "N") {
                        $scope.receipt_list.push(data);
                    }
                });
                console.log("$scope.receipt_list", $scope.receipt_list);
                $scope.submit.receipt_list = $scope.receipt_list;
                console.log("$scope.submit.receipt_list", $scope.submit.receipt_list);
                console.log("$scope.submit", $scope.submit);
                var webTran = {
                    service: 'app.qc.update',
                    parameter: $scope.submit
                };
                // $ionicLoading.show();
                APIService.Web_Post(webTran, function(res) {
                    // console.log("success:" + angular.toJson(res));
                    clearSqlite(res.payload.std_data.parameter.qc_no);
                    //alert("提交成功！");
                }, function(error) {
                    // $ionicLoading.hide();
                    //IonicPopupService.errorAlert('提交失败！');
                    userInfoService.getVoice('提交失败！', function() {});
                });
            };

            //dont move
        }
    ];
});
