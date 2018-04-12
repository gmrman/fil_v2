define(["API", "APIS", "commonFactory", "commonService", "views/app/fil_common/requisition.js", "userInfoService", "ionic-popup", "AppLang", "Directives", "ReqTestData"], function() {
    return ['$scope', '$state', '$stateParams', '$ionicLoading', 'IonicPopupService', 'IonicClosePopupService', '$ionicPopup', '$ionicListDelegate',
        'APIService', 'APIBridge', '$timeout', 'AppLang', 'ReqTestData', "userInfoService", "commonFactory", "commonService",
        function($scope, $state, $stateParams, $ionicLoading, IonicPopupService, IonicClosePopupService, $ionicPopup, $ionicListDelegate,
            APIService, APIBridge, $timeout, AppLang, ReqTestData, userInfoService, commonFactory, commonService) {
            $scope.langs = AppLang.langs;
            $scope.scaninfo = {
                scanning: ""
            };
            $scope.userInfo = userInfoService.getUserInfo();
            $scope.print_detail = [];

            $scope.gopage = function() {
                $state.go('fil_00_s04');
            };

            $scope.scanned = function(value) {
                $scope.checkScan(value);
            };

            $scope.scan = function() {
                console.log("scanBarcode");
                $scope.scaninfo.scanning = "";
                APIBridge.callAPI('scanBarcode', [{}]).then(function(result) {
                    if (result) {
                        console.log('scanBarcode success');
                        $timeout(function() {
                            $scope.checkScan(result.data[0].barcode);
                        }, 0);
                    } else {
                        console.log('scanBarcode false');
                    }
                }, function(result) {
                    console.log("scanBarcode fail");
                    console.log(result);
                });
            };

            //檢查掃描欄位資料
            $scope.checkScan = function(scanning) {
                if (commonService.isNull(scanning)) {
                    return;
                }
                $scope.scaninfo.scanning = "";
                console.log(scanning);
                var webTran = {
                    service: 'app.barcode.print.get',
                    parameter: {
                        barcode_type: "",
                        barcode: scanning
                    }
                };
                $ionicLoading.show();
                APIService.Web_Post(webTran, function(res) {
                    // console.log("success:" + angular.toJson(res));
                    var parameter = res.payload.std_data.parameter;
                    console.log(parameter);
                    //赋值，并显示在页面
                    for (var i = 0; i < parameter.print_detail.length; i++) {
                        var temp = parameter.print_detail[i];
                        var item = {
                            barcode_no: temp.barcode_no,
                            lot_no: temp.lot_no || " ",
                            item_no: temp.item_no || " ",
                            item_feature_no: temp.item_feature_no || " ",
                            item_name: temp.item_name || " ",
                            item_spec: temp.item_spec || " ",
                            item_unit: temp.item_unit || " ",
                            barcode_type: temp.barcode_type || " ",
                            barcode_qty: temp.barcode_qty || "0",
                            box_qty: temp.box_qty || "0",
                        };
                        $scope.print_detail.push(item);
                    }
                    $ionicLoading.hide();
                }, function(error) {
                    $ionicLoading.hide();
                    var execution = error.payload.std_data.execution;
                    console.log("error:" + execution.description);
                    userInfoService.getVoice(execution.description, function() {});
                });
            };

            $scope.delGoods = function(index) {
                $scope.print_detail.splice(index, 1);
                $ionicListDelegate.closeOptionButtons();
            };

            //$scope.print = function() {
            //    if ($scope.print_detail.length <= 0) {
            //        return;
            //    }
            //
            //    var data = [];
            //    for (var i = 0; i < $scope.print_detail.length; i++) {
            //        var temp = $scope.print_detail[i];
            //        var item = {
            //            barcode_no: temp.barcode_no
            //        };
            //        data.push(item);
            //    }
            //    console.log(data);
            //    send_print(data);
            //};

            //var send_print = function(data) {
            //    var webTran = {
            //        service: 'app.barcode.print',
            //        parameter: {
            //            print_detail: data
            //        }
            //    };
            //
            //    $ionicLoading.show();
            //    APIService.Web_Post(webTran, function(res) {
            //        console.log("success:" + res);
            //        var parameter = res.payload.std_data.parameter;
            //        console.log(parameter);
            //        $ionicLoading.hide();
            //        $scope.print_detail = [];
            //    }, function(error) {
            //        $ionicLoading.hide();
            //        var execution = error.payload.std_data.execution;
            //        console.log("error:" + execution.description);
            //        userInfoService.getVoice(execution.description, function() {});
            //    });
            //};

            //wifi打印
            $scope.print = function() {
                if ($scope.print_detail.length <= 0) {
                    return;
                }

                var language = "BIG5";
                if (AppLang.lang_val == "zh_CN") {
                    language = "GB2312";
                }
                var data = "";
                var ht = "佳音科技";
                var et = "佳音机电";
                for (var i = 0; i < $scope.print_detail.length; i++) {
                    var temp = $scope.print_detail[i];
                    //州巧正道列印格式 SEWOO LK-P30
                    data += "SIZE 70 mm ,50 mm \r\n";
                    data += "GAP 2,0 \r\n";
                    data += "SHIFT 0 \r\n";
                    data += "SET PEEL OFF \r\n";
                    data += "SET TEAR ON \r\n";
                    data += "DENSITY 3 \r\n";
                    data += "SPEED 4 \r\n";
                    data += "DENSITY 8 \r\n";
                    data += "REFERENCE 10,10 \r\n";
                    data += "CLS \r\n";
                    data += "TEXT 180,0,\"TSS24.BF2\",0,2,2," +"\"" + ht +"\" \r\n";
                    data += "BAR 0, 60, 700, 10 \r\n";
                    data += "QRCODE 10,80,H,4,A,0," + "\""+temp.barcode_no+"\" \r\n";
                    data += "TEXT 160,80,\"TSS24.BF2\",0,1,1," +"\"" + $scope.langs.item_no + ":"  +"\" \r\n";
                    data += "TEXT 160,120,\"TSS24.BF2\",0,1,1," +"\"" + $scope.langs.product_name + ":"  +"\" \r\n";
                    data += "TEXT 160,160,\"TSS24.BF2\",0,1,1," +"\"" + $scope.langs.specification + ":"  +"\" \r\n";
                    data += "TEXT 160,200,\"TSS24.BF2\",0,1,1," +"\"" + $scope.langs.qty + ":" +"\" \r\n";
                    data += "TEXT 160,240,\"TSS24.BF2\",0,1,1," +"\"" + $scope.langs.date + ":" +"\" \r\n";
                    data += "TEXT 240,80,\"TSS24.BF2\",0,1,1," +"\"" + temp.item_no +"\" \r\n";
                    data += "TEXT 240,120,\"TSS24.BF2\",0,1,1," +"\"" + temp.item_name +"\" \r\n";
                    data += "TEXT 240,160,\"TSS24.BF2\",0,1,1," +"\"" + temp.item_spec +"\" \r\n";
                    data += "TEXT 240,200,\"TSS24.BF2\",0,1,1," +"\"" + temp.barcode_qty +"\" \r\n";
                    data += "TEXT 240,240,\"TSS24.BF2\",0,1,1," +"\"" + getCurrent() +"\" \r\n";
                    data += "BAR 0, 280, 700, 10 \r\n";
                    data += "TEXT 180,300,\"TSS24.BF2\",0,2,2," +"\"" + et +"\" \r\n";
                    data += "PRINT 1,1 \r\n";
                    data += "EOP \r\n";

                }
                console.log(data);
                send_print(data);
            };

            var send_print = function(data) {
                var param=[{ip_address:"192.168.0.1"}];
                APIBridge.callAPI('WiFiPrinter', param).then(
                    function(result){
                        alert(JSON.stringify(result));
                    }, function(result){
                        alert("失败1");
                    });
                var param1=[{ip_address:"192.168.0.1",port:"9100"}];
                APIBridge.callAPI('OpenConnection', param1).then(
                    function(result){
                        alert(JSON.stringify(result));
                    },
                    function(result){
                        alert("失败2");
                    });
                APIBridge.callAPI('sendMessage', [data]).then(
                    function(result){
                        alert(JSON.stringify(result));
                    },function(result){
                        alert("失败3");
                    });
            };

            var getCurrent = function() {
                var s = "";
                d = new Date();
                var year = d.getFullYear();
                s += year;
                s += "-";
                var t = d.getMonth() + 1;
                s += t < 10 ? ("0" + t) : t;
                s += "-";
                s += d.getDate() < 10 ? ("0" + d.getDate()) : d.getDate();
                return s;
            };

        }
    ];
});
