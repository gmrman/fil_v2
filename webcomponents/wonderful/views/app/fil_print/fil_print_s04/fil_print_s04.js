define(["API", "APIS", "commonFactory", "commonService", "userInfoService", "ionic-popup", "AppLang", "Directives"], function() {
    return ['$scope', '$state', '$stateParams', '$ionicLoading', '$ionicModal',
        'IonicPopupService', 'IonicClosePopupService', '$ionicPopup', '$ionicListDelegate',
        'APIService', 'APIBridge', '$timeout', 'AppLang', "userInfoService", "commonFactory", "commonService", "numericalAnalysisService",
        function($scope, $state, $stateParams, $ionicLoading, $ionicModal,
            IonicPopupService, IonicClosePopupService, $ionicPopup, $ionicListDelegate,
            APIService, APIBridge, $timeout, AppLang, userInfoService, commonFactory, commonService, numericalAnalysisService) {

            //取得多語言資訊
            $scope.langs = AppLang.langs;
            //取得作業參數
            $scope.page_params = commonService.get_page_params();
            //取得使用者資訊
            $scope.userInfo = userInfoService.getUserInfo();

            $scope.scaninfo = {
                focus_me: true,
                scanning: "",
                program_job_no: $scope.page_params.program_job_no || "21",
                report_print_index: 0,
            };
            $scope.isShowPrint = false;
            $scope.print_detail = [];
            $scope.report_print_detail = [];
            $scope.doc_detail = $scope.page_params.print_doc_array || [];

            var checkPrintSubmit = function() {
                if (commonService.isNull($scope.scaninfo.program_job_no) ||
                    commonService.isNull($scope.report_print_detail[0].prog_no) ||
                    commonService.isNull($scope.report_print_detail[0].printer)) {
                    return false;
                }
                if (Number($scope.report_print_detail[0].print_qty) <= 0) {
                    return false;
                }
                if ($scope.doc_detail.length <= 0) {
                    return false;
                }
                return true;
            };

            var app_print_get = function() {
                var webTran = {
                    service: 'app.print.get',
                    parameter: {
                        "program_job_no": $scope.scaninfo.program_job_no,
                        "account": userInfoService.userInfo.account,
                    }
                };
                $ionicLoading.show();
                APIService.Web_Post(webTran, function(res) {
                    // console.log("success:" + angular.toJson(res));
                    var parameter = res.payload.std_data.parameter;
                    console.log(parameter);
                    $ionicLoading.hide();
                    $scope.print_detail = parameter.print_detail || [];
                    setReportPrintDetail(angular.copy($scope.print_detail));
                }, function(error) {
                    $ionicLoading.hide();
                    var execution = error.payload.std_data.execution;
                    console.log("error:" + execution.description);
                    userInfoService.getVoice(execution.description, function() {});
                });
            };


            var setReportPrintDetail = function(print_detail) {
                var tempArray = [];
                for (var i = 0; i < print_detail.length; i++) {
                    var element = print_detail[i];
                    var index = tempArray.findIndex(function(item) {
                        return commonService.isEquality(element.prog_no, item.prog_no);
                    });

                    if (index == -1) {
                        tempArray.push({
                            "prog_no": element.prog_no,
                            "prog_name": element.prog_name,
                            "print_qty": element.print_qty || 0,
                            "printer": element.printer,
                            "printer_detail": [{
                                "printer": element.printer,
                            }],
                        });
                    } else {
                        tempArray[index].printer_detail.push({
                            "printer": element.printer,
                        })
                    }
                }
                $scope.report_print_detail = tempArray;
                $scope.isShowPrint = checkPrintSubmit();
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

            $scope.scanned = function(value) {
                $scope.checkScan(value);
            };

            //檢查掃描欄位資料
            $scope.checkScan = function(scanning) {
                if (commonService.isNull(scanning)) {
                    return;
                }
                $scope.scaninfo.scanning = "";
                console.log(scanning);
                $scope.doc_detail.push({
                    "doc_no": scanning
                });
                $scope.isShowPrint = checkPrintSubmit();
            };

            $scope.print = function() {
                if (!checkPrintSubmit()) {
                    return;
                }

                if ($scope.scaninfo.program_job_no == "21") {
                    app_report_print({
                        "program_job_no": $scope.scaninfo.program_job_no,
                        "prog_no": $scope.report_print_detail[$scope.scaninfo.report_print_index].prog_no,
                        "print_qty": parseInt($scope.report_print_detail[$scope.scaninfo.report_print_index].print_qty),
                        "printer": $scope.report_print_detail[$scope.scaninfo.report_print_index].printer,
                        "doc_detail": $scope.doc_detail,
                    });
                } else {
                    for (var i = 0; i < $scope.report_print_detail.length; i++) {
                        var element = $scope.report_print_detail[i];
                        app_report_print({
                            "program_job_no": $scope.scaninfo.program_job_no,
                            "prog_no": element.prog_no,
                            "print_qty": parseInt(element.print_qty),
                            "printer": element.printer,
                            "doc_detail": $scope.doc_detail,
                        });
                    }
                }
                pointShow();
            };

            var app_report_print = function(parameter) {
                var webTran = {
                    service: 'app.report.print',
                    parameter: parameter
                };
                $ionicLoading.show();
                APIService.Web_Post(webTran, function(res) {
                    // console.log("success:" + angular.toJson(res));
                    var parameter = res.payload.std_data.parameter;
                    console.log(parameter);
                    $ionicLoading.hide();
                }, function(error) {
                    $ionicLoading.hide();
                    var execution = error.payload.std_data.execution;
                    console.log("error:" + execution.description);
                    userInfoService.getVoice(execution.description, function() {});
                });
            };

            var pointShow = function() {
                // 顯示提示 "已驅動報表列印！"
                var checkGoMenuPop = $ionicPopup.show({
                    title: $scope.langs.point,
                    template: "<p style='text-align: center'>" + $scope.langs.print_point + "</p>",
                    scope: $scope,
                    buttons: [{
                        text: $scope.langs.confirm,
                        onTap: function() {
                            commonService.clear_page_print_doc_array();

                            if ($scope.scaninfo.program_job_no == "21") {
                                $scope.doc_detail = [];
                                return;
                            }

                            var page = "fil_common_s01";
                            if (($scope.page_params.program_job_no == "1" && $scope.page_params.scan_type == "1") ||
                                ($scope.page_params.program_job_no == "3" && $scope.page_params.scan_type == "1") ||
                                ($scope.page_params.program_job_no == "1-2") ||
                                ($scope.page_params.program_job_no == "7-1") ||
                                ($scope.page_params.program_job_no == "9-1")) {
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
                            return;
                        }
                    }]
                });
                return;
            }

            $scope.delGoods = function(index) {
                $scope.doc_detail.splice(index, 1);
                $ionicListDelegate.closeOptionButtons();
            };

            $scope.gopage = function() {
                $state.go("fil_00_s04");
            };

            //計算加減後數值 並呼叫撿查
            $scope.compute = function(type, value) {
                $scope.setFocusMe(false);
                var value1 = angular.copy($scope.report_print_detail[$scope.scaninfo.report_print_index].print_qty);
                var num = numericalAnalysisService.accAdd(value1, value);
                if (num < 1) {
                    num = 1;
                }
                $scope.report_print_detail[$scope.scaninfo.report_print_index].print_qty = num;
            };

            //数量弹窗
            $scope.showQtyPop = function(type) {
                $scope.setFocusMe(false);
                commonFactory.showQtyPopup(type, $scope.report_print_detail[$scope.scaninfo.report_print_index].print_qty, "none", "none", 0).then(function(res) {
                    $scope.setFocusMe(true);
                    if (typeof res !== "undefined") {
                        $scope.report_print_detail[$scope.scaninfo.report_print_index].print_qty = parseInt(res);
                    }
                });
            };

            //藉由 flag 變動將游標 focus 在掃描框
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

            //彈出選擇頁面
            $scope.printDetailShow = function() {
                $scope.setFocusMe(false);
                $scope.popSelected = {
                    search: "",
                    prog_no: angular.copy($scope.report_print_detail[$scope.scaninfo.report_print_index].prog_no),
                    prog_name: angular.copy($scope.report_print_detail[$scope.scaninfo.report_print_index].prog_name),
                    printer: angular.copy($scope.report_print_detail[$scope.scaninfo.report_print_index].printer),
                    print_qty: angular.copy($scope.report_print_detail[$scope.scaninfo.report_print_index].print_qty),
                };

                var tempArray = [];
                for (var i = 0; i < $scope.print_detail.length; i++) {
                    var element = $scope.print_detail[i];
                    var index = tempArray.findIndex(function(value) {
                        return commonService.isEquality(value.prog_no, element.prog_no);
                    });
                    if (index == -1) {
                        tempArray.push(element);
                    }
                }
                $scope.prog_array = tempArray;

                $scope.selprint = function(detail) {
                    $scope.popSelected.prog_no = detail.prog_no;
                    $scope.popSelected.prog_name = detail.prog_name;
                    $scope.popSelected.printer = detail.printer;
                    $scope.popSelected.print_qty = detail.print_qty;
                };

                $scope.setprint = function() {
                    var popSelected = angular.copy($scope.popSelected);

                    var index = $scope.report_print_detail.findIndex(function(item) {
                        return commonService.isEquality(popSelected.prog_no, item.prog_no);
                    });
                    if (index != -1) {
                        $scope.scaninfo.report_print_index = index;
                        $scope.report_print_detail[$scope.scaninfo.report_print_index].prog_no = popSelected.prog_no;
                        $scope.report_print_detail[$scope.scaninfo.report_print_index].prog_name = popSelected.prog_name;
                        $scope.report_print_detail[$scope.scaninfo.report_print_index].printer = popSelected.printer;
                        $scope.report_print_detail[$scope.scaninfo.report_print_index].print_qty = popSelected.print_qty;
                        $scope.printDetailClose();
                    }
                };

                $ionicModal.fromTemplateUrl('views/app/fil_print/fil_print_s04/fil_print_s04_01.html', {
                    scope: $scope
                }).then(function(modal) {
                    $scope.printDetailClose = function() {
                        $scope.setFocusMe(true);
                        modal.hide().then(function() {
                            return modal.remove();
                        });
                    };
                    modal.show();
                    return modal;
                });
            };

            //彈出選擇頁面
            $scope.printerShow = function() {
                $scope.setFocusMe(false);
                $scope.popSelected = {
                    search: "",
                    prog_no: angular.copy($scope.report_print_detail[$scope.scaninfo.report_print_index].prog_no),
                    printer: angular.copy($scope.report_print_detail[$scope.scaninfo.report_print_index].printer),
                };

                var temArray = [];
                for (var i = 0; i < $scope.print_detail.length; i++) {
                    var element = $scope.print_detail[i];
                    if (commonService.isEquality(element.prog_no, $scope.popSelected.prog_no)) {
                        temArray.push(element);
                    }
                }
                $scope.printer_array = temArray;

                $scope.selprinter = function(detail) {
                    $scope.popSelected.printer = detail.printer;
                };

                $scope.setprinter = function() {
                    var popSelected = angular.copy($scope.popSelected);
                    $scope.report_print_detail[$scope.scaninfo.report_print_index].printer = popSelected.printer;
                    $scope.printerClose();
                };

                $ionicModal.fromTemplateUrl('views/app/fil_print/fil_print_s04/fil_print_s04_02.html', {
                    scope: $scope
                }).then(function(modal) {
                    $scope.printerClose = function() {
                        $scope.setFocusMe(true);
                        modal.hide().then(function() {
                            return modal.remove();
                        });
                    };
                    modal.show();
                    return modal;
                });
            };

            app_print_get();

        }
    ];
});