define(["API", "APIS", "commonFactory", "commonService", "userInfoService", "ionic-popup", "AppLang", "Directives", "ReqTestData", "base64"], function() {
    return ['$scope', '$state', '$stateParams', '$ionicLoading', 'IonicPopupService', 'IonicClosePopupService', '$ionicPopup', '$ionicListDelegate',
        'APIService', 'APIBridge', '$timeout', 'AppLang', 'ReqTestData', "userInfoService", "commonFactory", "commonService", '$filter',
        function($scope, $state, $stateParams, $ionicLoading, IonicPopupService, IonicClosePopupService, $ionicPopup, $ionicListDelegate,
            APIService, APIBridge, $timeout, AppLang, ReqTestData, userInfoService, commonFactory, commonService, $filter) {

            $scope.langs = AppLang.langs;
            $scope.userInfo = userInfoService.getUserInfo();
            $scope.page_params = commonService.get_page_params();
            $scope.doc_detail = $scope.page_params.print_doc_array || [];
            $scope.print_detail = [];
            $scope.scaninfo = {
                scanning: "",
                program_job_no: $scope.page_params.program_job_no || "",
            };
            var date = $filter('date')(new Date(), "yyyy-MM-dd");

            $scope.init = function() {
                APIBridge.callAPI('DeviceListActivity', []).then(function(result) {
                    if (angular.isObject(result.data[0])) {
                        result.data[0].codeType = "BIG5";
                        if (AppLang.lang_val == "zh_CN") {
                            result.data[0].codeType = "gb2312";
                        }
                    }
                    APIBridge.callAPI('hOpenConnection', result.data).then(function(result) {
                        if ($scope.doc_detail.length > 0) {
                            $scope.checkScan($scope.doc_detail[0].doc_no);
                        }
                    }, function(error) {
                        console.log(error);
                        userInfoService.getVoice(error.message, function() {
                            $scope.gopage();
                        });
                    }, function() {});
                }, function(error) {
                    console.log(error);
                    userInfoService.getVoice(error.message, function() {
                        $scope.gopage();
                    });
                });
            };
            $scope.init();

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
                        barcode_type: "1",
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

            var get_printer_data_BIXOLON = function() {
                var data = "";
                for (var i = 0; i < $scope.print_detail.length; i++) {
                    var temp = $scope.print_detail[i];
                    var qrcode1Len = String.fromCharCode(parseInt((temp.barcode_no.length % 256) + 3));
                    var qrcode2Len = String.fromCharCode(parseInt(temp.barcode_no.length / 256));

                    data += "\u001b\u004c"; //Select page mode
                    data += "\u001b\u0057\u0000\u0000\u0000\u0000\u0040\u0002\u0040\u0001"; //Set print area in page mode

                    data += "\u001b\u0054\u0000"; //Select print direction in page mode
                    data += $scope.langs.barcode + "\u0009" + temp.barcode_no + "\u000a";
                    data += $scope.langs.lot + "\u0009" + temp.lot_no + "\u000a";
                    data += $scope.langs.item_no + "\u0009" + temp.item_no + "\u000a";
                    data += $scope.langs.product_name + "\u0009" + temp.item_name + "\u000a";
                    data += $scope.langs.specification + "\u0009" + temp.item_spec + "\u000a";
                    data += $scope.langs.batch_qty + "\u0009" + temp.barcode_qty + temp.item_unit + "\u000a";
                    data += $scope.langs.box_qty + "\u0009" + temp.box_qty + "\u000a";
                    data += $scope.langs.date + "\u0009" + date + "\u000a";

                    data += "\u001b\u0054\u0003"; //Select print direction in page mode
                    data += "\u001d\u0024\u0000\u0001"; //Set absolute vertical print position in page mode
                    data += "\u001b\u0024\u0028\u0000"; //Set absolute print position

                    data += "\u001d\u0028\u006b\u0003\u0000\u0031\u0043\u0005"; // QR Code Set Size & Module
                    data += "\u001d\u0028\u006b\u0003\u0000\u0031\u0045\u0032"; // Set QR Code Error Level
                    data += "\u001d\u0028\u006b" + qrcode1Len + qrcode2Len + "\u0031\u0050\u0030"; // Store QR Code Data
                    data += temp.barcode_no; //data
                    data += "\u001d\u0028\u006b\u0003\u0000\u0031\u0051\u0030\u000a"; //Print QR Code

                    data += "\u000c";
                }
                return data;
            };

            var get_printer_data_SEWOO = function() {
                var data = "";
                var language = "BIG5";
                if (AppLang.lang_val == "zh_CN") {
                    language = "CHINA";
                }
                for (var i = 0; i < $scope.print_detail.length; i++) {
                    var temp = $scope.print_detail[i];
                    // 州巧正道列印格式 SEWOO LK-P30
                    data += "! 0 200 200 500 1 \r\n";
                    data += "CONTRAST 0 \r\n";
                    data += "SPEED 3 \r\n";
                    data += "PAGE-WIDTH 550 \r\n";
                    data += "PREFEED 0 \r\n";
                    data += "POSTFEED 0 \r\n";
                    data += "COUNTRY " + language + " \r\n";
                    data += "T 0 4 10 20 " + $scope.langs.barcode + " \r\n";
                    data += "T 0 4 10 60 " + $scope.langs.lot + " \r\n";
                    data += "T 0 4 10 100 " + $scope.langs.item_no + " \r\n";
                    data += "T 0 4 10 140 " + $scope.langs.product_name + " \r\n";
                    data += "T 0 4 10 180 " + $scope.langs.specification + " \r\n";
                    data += "T 0 4 10 220 " + $scope.langs.batch_qty + " \r\n";
                    data += "T 0 4 10 260 " + $scope.langs.box_qty + " \r\n";
                    data += "T 0 4 10 300 " + $scope.langs.date + " \r\n";
                    data += "T 0 3 100 15 " + temp.barcode_no + " \r\n";
                    data += "T 0 3 100 55 " + temp.lot_no + " \r\n";
                    data += "T 0 3 100 95 " + temp.item_no + " \r\n";
                    data += "T 0 3 100 135 " + temp.item_name + " \r\n";
                    data += "T 0 3 100 175 " + temp.item_spec + " \r\n";
                    data += "T 0 3 100 215 " + temp.barcode_qty + temp.item_unit + " \r\n";
                    data += "T 0 3 100 255 " + temp.box_qty + " \r\n";
                    data += "T 0 3 100 295 " + date + " \r\n";
                    data += "B QR 350 200 M 2 U 6 \r\n";
                    data += "MA," + temp.barcode_no + "\r\n";
                    data += "ENDQR \r\n";
                    data += "PRINT \r\n";
                }
                return data;
            };

            var get_printer_data_AIDA = function() {
                var data = "";
                var language = "n";
                if (AppLang.lang_val == "zh_CN") {
                    language = "m";
                }
                for (var i = 0; i < $scope.print_detail.length; i++) {
                    var temp = $scope.print_detail[i];
                    data += "SM10,21\r\n";
                    data += "SS3\r\n";
                    data += "SD20\r\n";
                    data += "SW600\r\n";
                    data += "SOT\r\n";
                    data += "CS15, 0\r\n";
                    data += "T20,20," + language + ",1,1,0,0,N,N,F,'" + $scope.langs.barcode + "'\r\n";
                    data += "T120,20," + language + ",1,1,0,0,N,N,F,'" + temp.barcode_no + "'\r\n";
                    data += "T20,60," + language + ",1,1,0,0,N,N,F,'" + $scope.langs.lot + "'\r\n";
                    data += "T120,60," + language + ",1,1,0,0,N,N,F,'" + temp.lot_no + "'\r\n";
                    data += "T20,100," + language + ",1,1,0,0,N,N,F,'" + $scope.langs.item_no + "'\r\n";
                    data += "T120,100," + language + ",1,1,0,0,N,N,F,'" + temp.item_no + "'\r\n";
                    data += "T20,140," + language + ",1,1,0,0,N,N,F,'" + $scope.langs.product_name + "'\r\n";
                    data += "T120,140," + language + ",1,1,0,0,N,N,F,'" + temp.item_name + "'\r\n";
                    data += "T20,180," + language + ",1,1,0,0,N,N,F,'" + $scope.langs.specification + "'\r\n";
                    data += "T120,180," + language + ",1,1,0,0,N,N,F,'" + temp.item_spec + "'\r\n";
                    data += "T20,220," + language + ",1,1,0,0,N,N,F,'" + $scope.langs.batch_qty + "'\r\n";
                    data += "T120,220," + language + ",1,1,0,0,N,N,F,'" + temp.barcode_qty + temp.item_unit + "'\r\n";
                    data += "T20,260," + language + ",1,1,0,0,N,N,F,'" + $scope.langs.box_qty + "'\r\n";
                    data += "T120,260," + language + ",1,1,0,0,N,N,F,'" + temp.box_qty + "'\r\n";
                    data += "T20,300," + language + ",1,1,0,0,N,N,F,'" + $scope.langs.date + "'\r\n";
                    data += "T120,300," + language + ",1,1,0,0,N,N,F,'" + date + "'\r\n";
                    data += "B2400,220,Q,2,M,4,0,'" + temp.barcode_no + "'\r\n";
                    data += "P1\r\n";
                }
                return data;
            };

            $scope.print = function() {
                if ($scope.print_detail.length <= 0) {
                    return;
                }
                var data = "";
                switch ($scope.userInfo.BT_printer) {
                    case "SEWOO":
                        data = get_printer_data_SEWOO();
                        break;
                    case "BIXOLON":
                        data = get_printer_data_BIXOLON();
                        break;
                    case "AIDA":
                        data = get_printer_data_AIDA();
                        break;
                }
                console.log(data);
                send_base64_print(data);
            };

            //打印base64加密后的数据
            var send_base64_print = function(data) {
                //base 64 encoding
                var encodedString = "BASE64://" + base64.encode(data);
                console.log("encodedString" + encodedString);
                send_print(encodedString);
            };

            var send_print = function(data) {
                APIBridge.callAPI('hSendMessage', [data]).then(function(result) {
                    clearList();
                }, function(error) {
                    alert(JSON.stringify(error));
                    $ionicPopup.show({
                        title: '打印失败,请确认蓝牙连接', // String. The title of the popup.
                        buttons: [{
                            text: $scope.langs.cancel,
                        }, {
                            text: $scope.langs.confirm,
                            onTap: function() {
                                $scope.init();
                            }
                        }]
                    }).then(function(res) {
                        console.log("打印失败！");
                    });
                });
            };

            var clearList = function() {
                commonService.clear_page_print_doc_array();
                if ($scope.scaninfo.program_job_no == "") {
                    $scope.doc_detail = [];
                    $scope.print_detail = [];
                    return;
                }

                var page = "fil_common_s01";
                if (($scope.page_params.program_job_no == "1" && $scope.page_params.scan_type == "1") ||
                    ($scope.page_params.program_job_no == "3" && $scope.page_params.scan_type == "1") ||
                    ($scope.page_params.program_job_no == "1-2") ||
                    ($scope.page_params.program_job_no == "7-1") ||
                    ($scope.page_params.program_job_no == "9.1")) {
                    page = "fil_common_s02.fil_common_s07";
                }
                if (($scope.page_params.program_job_no == "1" && $scope.page_params.scan_type == "3") ||
                    ($scope.page_params.program_job_no == "3" && $scope.page_params.scan_type == "3") ||
                    ($scope.page_params.program_job_no == "9") ||
                    ($scope.page_params.program_job_no == "13-1") ||
                    ($scope.page_params.program_job_no == "13-2")) {
                    page = "fil_common_s02.fil_common_s03";
                }
                if ($scope.page_params.func == "fil524" || $scope.page_params.func == "fil525") {
                    page = "fil_common_s02.fil_common_s03";
                }
                $state.go(page);
                return

            };

        }
    ];
});