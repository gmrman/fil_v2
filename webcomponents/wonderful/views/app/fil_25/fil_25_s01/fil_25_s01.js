define(["API", "APIS", 'AppLang', 'views/app/fil_common/requisition.js', 'array', 'Directives', 'ReqTestData', 'ionic-popup',
    'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService'
], function() {
    return ['$scope', '$state', '$timeout', '$filter', 'AppLang', 'APIService', 'APIBridge',
        '$ionicLoading', '$ionicPopup', '$ionicModal', '$ionicListDelegate', 'IonicPopupService', 'IonicClosePopupService',
        'fil_common_requisition', 'ReqTestData', 'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService',
        function($scope, $state, $timeout, $filter, AppLang, APIService, APIBridge,
            $ionicLoading, $ionicPopup, $ionicModal, $ionicListDelegate, IonicPopupService, IonicClosePopupService,
            fil_common_requisition, ReqTestData, circulationCardService, commonFactory, commonService, userInfoService, scanTypeService, numericalAnalysisService) {

            //變數初始化區塊 (S)-------------------------------------------------

            //取得多語言資訊
            $scope.langs = AppLang.langs;
            //取得作業參數
            $scope.page_params = commonService.get_page_params();
            //取得使用者資訊
            $scope.userInfo = userInfoService.getUserInfo();

            //取得資訊ID yyyyMMddHHmmsssss_account 
            var l_info_id = commonService.getCurrent(2) + "_" + $scope.userInfo.account;

            //設定參數
            $scope.l_data = {
                bcae005: $scope.page_params.in_out_no, //出入庫瑪
                bcae006: $scope.page_params.func, //作業代號
                bcae014: $scope.page_params.program_job_no,
                bcae015: $scope.page_params.status, //A開立新單/S過賬/Y確認
                info_id: angular.copy(l_info_id),
                show_submit: false,
            };

            //設定各作業APP所顯示的標題
            userInfoService.changeTitle($scope.page_params.name + $scope.langs.upcoming);

            $scope.dispatch_detail = [];
            $scope.machine_detail = [];
            $scope.workstation_detail = [];

            $scope.scaninfo = {
                scanning: "",
                focus_me: true,
                workstation_no: $scope.userInfo.workstation_no,
                workstation_name: $scope.userInfo.workstation_no,
                machine_no: $scope.userInfo.machine_no,
                machine_name: $scope.userInfo.machine_no,
            };

            //變數初始化區塊 (E)-------------------------------------------------

            //變數相關 function 區塊 (S)-----------------------------------------

            //清除掃描框條件
            $scope.clearScanning = function() {
                $scope.scaninfo.doc_no = "";
                $scope.scaninfo.run_card_no = "";
                $scope.scaninfo.seq = "";
                $scope.scaninfo.scanning = "";
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

            //變數相關 function 區塊 (E)-----------------------------------------

            //彈出視窗區塊 (S)---------------------------------------------------

            //彈出篩選條件頁面
            $scope.showQbeTodoNotice = function() {
                $ionicLoading.show();
                $ionicModal.fromTemplateUrl('views/app/fil_25/fil_25_s01/fil_25_s01_01.html', {
                    scope: $scope
                }).then(function(modal) {

                    var scaninfo = angular.copy($scope.scaninfo);

                    $scope.selected = {
                        workstation_no: scaninfo.workstation_no,
                        workstation_name: scaninfo.workstation_no,
                        machine_no: scaninfo.machine_no,
                        machine_name: scaninfo.machine_no,
                        reloadMachine: false,
                    };

                    //顯示 工作站彈窗
                    $scope.workstationModalShow = function() {
                        $scope.popSelected = {
                            search: "",
                            workstation_no: $scope.selected.workstation_no,
                            workstation_name: $scope.selected.workstation_name
                        };

                        $scope.selworkstation = function(item) {
                            $scope.popSelected.workstation_no = item.workstation_no;
                            $scope.popSelected.workstation_name = item.workstation_name;
                        };

                        $scope.setworkstation = function() {
                            var index = $scope.workstation_detail.findIndex(function(item) {
                                return $scope.popSelected.workstation_no == item.workstation_no;
                            });

                            if (index !== -1) { //存在於倉庫基本檔
                                $scope.close();
                                $scope.selected.reloadMachine = !commonService.isEquality($scope.selected.workstation_no, $scope.popSelected.workstation_no);
                                $scope.selected.workstation_no = $scope.workstation_detail[index].workstation_no;
                                $scope.selected.workstation_name = $scope.workstation_detail[index].workstation_name;
                            }
                        };

                        $ionicModal.fromTemplateUrl('views/app/common/html/workstationModal.html', {
                            scope: $scope
                        }).then(function(modal) {
                            $scope.close = function() {
                                modal.hide().then(function() {
                                    return modal.remove();
                                });
                            };

                            var app_workstation_get = function(workstation_no) {
                                var webTran = {
                                    service: 'app.workstation.get',
                                    parameter: {
                                        "site_no": userInfoService.userInfo.site_no,
                                        "workstation_no": workstation_no || "",
                                    }
                                };
                                $ionicLoading.show();
                                APIService.Web_Post(webTran, function(res) {
                                    $ionicLoading.hide();
                                    // console.log("success:" + angular.toJson(res));
                                    var parameter = res.payload.std_data.parameter;
                                    $timeout(function() {
                                        $scope.workstation_detail = parameter.workstation_detail;
                                        modal.show();
                                        return modal;
                                    }, 0);
                                }, function(error) {
                                    $ionicLoading.hide();
                                    var execution = error.payload.std_data.execution;
                                    console.log("error:" + execution.description);
                                    userInfoService.getVoice(execution.description, function() {});
                                });
                            };

                            if ($scope.workstation_detail.length === 0) {
                                app_workstation_get("");
                            } else {
                                modal.show();
                                return modal;
                            }
                        });
                    };

                    $scope.machineModalShow = function() {
                        $scope.popSelected = {
                            search: "",
                            machine_no: $scope.selected.machine_no,
                            machine_name: $scope.selected.machine_name
                        };

                        $scope.selmachine = function(item) {
                            $scope.popSelected.machine_no = item.machine_no;
                            $scope.popSelected.machine_name = item.machine_name;
                        };

                        $scope.setmachine = function() {
                            var index = $scope.machine_detail.findIndex(function(item) {
                                return $scope.popSelected.machine_no == item.machine_no;
                            });

                            if (index !== -1) { //存在於倉庫基本檔
                                $scope.close();
                                $scope.selected.machine_no = $scope.machine_detail[index].machine_no;
                                $scope.selected.machine_name = $scope.machine_detail[index].machine_name;
                            }
                        };

                        $ionicModal.fromTemplateUrl('views/app/common/html/machineModal.html', {
                            scope: $scope
                        }).then(function(modal) {
                            $scope.close = function() {
                                modal.hide().then(function() {
                                    return modal.remove();
                                });
                            };

                            var app_machine_get = function(workstation_no) {
                                var webTran = {
                                    service: 'app.machine.get',
                                    parameter: {
                                        "site_no": userInfoService.userInfo.site_no,
                                        "workstation_no": workstation_no || "",
                                        "machine_no": "",
                                    }
                                };
                                $ionicLoading.show();
                                APIService.Web_Post(webTran, function(res) {
                                    $ionicLoading.hide();
                                    // console.log("success:" + angular.toJson(res));
                                    var parameter = res.payload.std_data.parameter;
                                    $timeout(function() {
                                        $scope.selected.reloadMachine = false;
                                        $scope.machine_detail = parameter.machine_detail;
                                        modal.show();
                                        return modal;
                                    }, 0);
                                }, function(error) {
                                    $ionicLoading.hide();
                                    var execution = error.payload.std_data.execution;
                                    console.log("error:" + execution.description);
                                    userInfoService.getVoice(execution.description, function() {});
                                });
                            };

                            if ($scope.machine_detail.length === 0 || $scope.selected.reloadMachine) {
                                app_machine_get($scope.selected.workstation_no);
                            } else {
                                modal.show();
                                return modal;
                            }
                        });
                    };

                    $scope.clearMachine = function() {
                        $scope.selected.machine_no = " ";
                        $scope.selected.machine_name = " ";
                    };

                    $scope.clearWorkstation = function() {
                        $scope.selected.workstation_no = " ";
                        $scope.selected.workstation_name = " ";
                    };

                    $scope.setCondition = function() {
                        var selected = angular.copy($scope.selected);
                        $scope.scaninfo.workstation_no = selected.workstation_no;
                        $scope.scaninfo.workstation_name = selected.workstation_name;
                        $scope.scaninfo.machine_no = selected.machine_no;
                        $scope.scaninfo.machine_name = selected.machine_name;
                        $scope.closeModal();
                        app_dispatch_get();
                    };

                    //關閉 篩選條件頁面
                    $scope.closeModal = function() {
                        modal.hide().then(function() {
                            return modal.remove();
                        });
                    };

                    modal.show();
                    $ionicLoading.hide();
                });
            };

            //彈出視窗區塊 (E)---------------------------------------------------

            //取得待辦
            var app_dispatch_get = function() {
                var webTran = {
                    service: 'app.dispatch.get',
                    parameter: {
                        "site_no": userInfoService.userInfo.site_no,
                        "workstation_no": $scope.scaninfo.workstation_no || " ",
                        "machine_no": $scope.scaninfo.machine_no || " ",
                    }
                };
                console.log(webTran);
                $ionicLoading.show();
                APIService.Web_Post(webTran, function(res) {
                    $ionicLoading.hide();
                    // console.log("success:" + angular.toJson(res));
                    console.log(res);
                    var parameter = res.payload.std_data.parameter;
                    $scope.setFocusMe(true);
                    $timeout(function() {
                        $scope.dispatch_detail = parameter.dispatch_detail;
                    }, 0);
                }, function(error) {
                    $ionicLoading.hide();
                    var execution = error.payload.std_data.execution;
                    console.log("error:" + execution.description);
                    userInfoService.getVoice(execution.description, function() {});
                });
            };

            //調用相機 進行掃描條碼
            $scope.scan = function() {
                $scope.scaninfo.scanning = "";
                $scope.setFocusMe(false);
                console.log("scanBarcode");
                APIBridge.callAPI('scanBarcode', [{}]).then(function(result) {
                    if (result) {
                        console.log('scanBarcode success');
                        $scope.setFocusMe(true);
                        checkScan(result.data[0].barcode.trim());
                    } else {
                        console.log('scanBarcode false');
                    }
                }, function(result) {
                    console.log("scanBarcode fail");
                    console.log(result);
                });
            };

            //掃苗框按下 enter 鍵後執行
            $scope.scanned = function(value) {
                checkScan(value.trim());
            };

            //檢查掃描後相關資訊
            var checkScan = function(scanning) {
                $scope.setFocusMe(false);
            };

            //時間顏色管理控制函數
            $scope.setTimeColor = function(item) {
                if (angular.isUndefined(item)) {
                    return;
                }
                //d = 現在 , d_1 = 一個小時後
                var d = new Date();
                var d_1 = new Date();
                if (ReqTestData.testData) {
                    d = new Date("2018/01/15 08:00");
                    d_1 = new Date("2018/01/15 08:00");
                }
                d_1.setHours(d_1.getHours() + 1, d_1.getMinutes() - 1);

                var dispatch_date = new Date(item.dispatch_date);
                var dispatch_time = new Date(dispatch_date.toDateString() + ' ' + item.dispatch_time);

                if (dispatch_time < d) {
                    return "text-pink";
                } else if (dispatch_time <= d_1) {
                    return "text-green";
                } else {
                    return "text-gray";
                }
            };

            $scope.checkShowSubmit = function() {
                $scope.l_data.show_submit = false;
                for (var i = 0; i < $scope.dispatch_detail.length; i++) {
                    var element = $scope.dispatch_detail[i];
                    if (element.checked) {
                        $scope.l_data.show_submit = true;
                        break;
                    }
                }
            };

            $scope.submit = function() {
                var handling_detail = [];
                var handling_date = commonService.getCurrent(3);
                var handling_time = commonService.getCurrent(4);
                for (var i = 0; i < $scope.dispatch_detail.length; i++) {
                    var element = $scope.dispatch_detail[i];
                    if (!element.checked) {
                        continue;
                    }
                    var temp = {
                        "enterprise_no": element.enterprise_no,
                        "site_no": element.site_no,
                        "doc_no": element.doc_no,
                        "plot_no": element.plot_no,
                        "item_no": element.item_no,
                        "item_feature_no": element.item_feature_no,
                        "workstation_no": element.workstation_no,
                        "machine_no": element.machine_no,
                        "qty": element.qty,
                        "dispatch_date": element.dispatch_date,
                        "dispatch_time": element.dispatch_time,
                        "handling_date": handling_date,
                        "handling_time": handling_time,
                    }
                    handling_detail.push(temp);
                }

                if (handling_detail.length > 0) {
                    app_handling_create(handling_detail);
                }
                return;
            };

            var app_handling_create = function(handling_detail) {
                var webTran = {
                    service: 'app.handling.create',
                    parameter: {
                        "site_no": userInfoService.userInfo.site_no,
                        "handling_detail": handling_detail,
                    }
                };
                console.log(webTran);
                $ionicLoading.show();
                APIService.Web_Post(webTran, function(res) {
                    $ionicLoading.hide();
                    // console.log("success:" + angular.toJson(res));
                    console.log(res);
                    $scope.l_data.show_submit = false;
                    IonicPopupService.successAlert("").then(function() {
                        $scope.setFocusMe(true);
                        app_dispatch_get();
                    });
                }, function(error) {
                    $ionicLoading.hide();
                    var execution = error.payload.std_data.execution;
                    console.log("error:" + execution.description);
                    userInfoService.getVoice(execution.description, function() {});
                });
            };

            app_dispatch_get();
        }
    ];
});