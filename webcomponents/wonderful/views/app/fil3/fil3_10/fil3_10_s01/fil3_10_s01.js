define(["API", "APIS", 'commonService', 'commonFactory', 'ionic-popup', "AppLang", "array", "Directives", "ReqTestData", "views/app/fil_common/requisition.js", "circulationCardService"], function() {
    return ["$scope", "$state", "$stateParams", "$timeout", "APIService", "APIBridge", "commonService", "commonFactory", "userInfoService", "$ionicListDelegate",
        "ReqTestData", "AppLang", "$ionicPopup", "$ionicModal", "$ionicLoading", "IonicPopupService", "fil_common_requisition", "IonicClosePopupService",
        function($scope, $state, $stateParams, $timeout, APIService, APIBridge, commonService, commonFactory, userInfoService, $ionicListDelegate,
            ReqTestData, AppLang, $ionicPopup, $ionicModal, $ionicLoading, IonicPopupService, fil_common_requisition, IonicClosePopupService) {

            $scope.langs = AppLang.langs;
            $scope.params = angular.copy($stateParams.params);
            $scope.page_params = commonService.get_page_params();
            $scope.userInfo = userInfoService.getUserInfo();
            console.log($scope.params);
            console.log("userInfoService.userInfo.employee_name:" + userInfoService.userInfo.employee_name);
            $scope.scanning_detail = [];
            var timeout = null;
            $scope.scan_field = 1;
            //    1.工單單號%runcard%項次
            //    2.機器編號
            //    3.班別
            //    4.人員
            //    5.工作站
            $scope.workstation_name = "";
            $scope.machine_name = "";
            $scope.shift_name = "";
            $scope.employee_name = "";
            //lock状态
            $scope.wlock = true; //工作站
            $scope.mlock = true; //机器
            $scope.elock = true; //人员
            $scope.slock = true; //班别
            $scope.max_scrap_qty = 0;
            $scope.showInfo = {
                submit: false,
                work_qty: 0,
                maxqty: 0,
                scrap_qty: 0,
                work_hours: 0,
                machine_time: 0,
                run_card_no: 0,
                circulationCard: "",
                barcode_no: "",
                process_name: "",
                process_no: "",
                process_seq: "",
                workstation: "",
                machine_no: userInfoService.userInfo.machine_no || "",
                machine_name: userInfoService.userInfo.machine_name || "",
                shift_no: userInfoService.userInfo.shift_no || "",
                shift_name: userInfoService.userInfo.shift_name || "",
                employee_no: userInfoService.userInfo.employee_no,
                employee_name: userInfoService.userInfo.employee_name,
                item_no: "",
                item_spec: "",
                over_deliver_rate: "",
                system_number: 0, //在制数
                scraps: []
            };

            $scope.lock = function(type) {
                switch (type) {
                    case "workstation": //工作站
                        $scope.wlock = !$scope.wlock;
                        $scope.workstation_name = $scope.showInfo.workstation_name;
                        break;
                    case "machine": //机器编号
                        $scope.mlock = !$scope.mlock;
                        $scope.machine_name = $scope.showInfo.machine_name;
                        break;
                    case "employee": //报工人员
                        $scope.elock = !$scope.elock;
                        $scope.employee_name = $scope.showInfo.employee_name;
                        break;
                    case "shift": //班别
                        $scope.slock = !$scope.slock;
                        $scope.shift_name = $scope.showInfo.shift_name;
                        break;
                }
            };

            //初始化掃描欄位
            $scope.initScan = function() {
                $scope.scaninfo = [{
                    scanning: "",
                    focus_me: false,
                    scan_field: "1"
                }, {
                    scanning: "",
                    focus_me: false,
                    scan_field: "2"
                }, {
                    scanning: "",
                    focus_me: false,
                    scan_field: "3"
                }, {
                    scanning: "",
                    focus_me: false,
                    scan_field: "4"
                }, {
                    scanning: "",
                    focus_me: false,
                    scan_field: "5"
                }];
            };

            $scope.initScan();
            $scope.scanClear = function() {
                for (var i = 0; i < $scope.scaninfo.length; i++) {
                    $scope.scaninfo[i].focus_me = false;
                }
            };

            $scope.clearScanning = function() {
                $scope.scaninfo[0].scanning = "";
            };

            $scope.clearList = function() {
                $scope.scanning_detail = [];
            };
            $scope.scaninfo[3].scanning = $scope.showInfo.employee_no;
            $scope.chooseType = function(type) {
                $scope.scanClear();
                switch (type) {
                    case "circulation_card": //流转卡
                        $scope.scaninfo[0].focus_me = true;
                        break;
                    case "workstation": //工作站
                        $scope.scaninfo[4].focus_me = true;
                        break;
                    case "machine": //机器编号
                        $scope.scaninfo[1].focus_me = true;
                        break;
                    case "employee": //报工人员
                        $scope.scaninfo[3].focus_me = true;
                        break;
                    case "shift": //班别
                        $scope.scaninfo[2].focus_me = true;
                        break;
                }
                console.log($scope.scaninfo);
            };
            $scope.validate = function(type) {
                switch (type) {
                    case 'work_hours':
                        if (isNaN($scope.showInfo.work_hours) || $scope.showInfo.work_hours < 0) {
                            $scope.showInfo.work_hours = 0;
                        }
                        break;
                    case 'machine_time':
                        if (isNaN($scope.showInfo.machine_time) || $scope.showInfo.machine_time < 0) {
                            $scope.showInfo.machine_time = 0;
                        }
                        break;
                }
            };

            $scope.scan = function(type) {
                console.log("scanBarcode");
                // $scope.scaninfo.scanning = "";
                APIBridge.callAPI('scanBarcode', [{}]).then(function(result) {
                    if (result) {
                        console.log('scanBarcode success');
                        $timeout(function() {
                            switch (type) {
                                case "circulation_card": //流转卡
                                    $scope.scaninfo[0].scanning = result.data[0].barcode.trim();
                                    $scope.scaninfo[0].focus_me = true;
                                    break;
                                case "workstation": //工作站
                                    $scope.scaninfo[4].scanning = result.data[0].barcode.trim();
                                    $scope.scaninfo[4].focus_me = true;
                                    break;
                                case "machine": //机器编号
                                    $scope.scaninfo[1].scanning = result.data[0].barcode.trim();
                                    $scope.scaninfo[1].focus_me = true;
                                    break;
                                case "employee": //报工人员
                                    $scope.scaninfo[3].scanning = result.data[0].barcode.trim();
                                    $scope.scaninfo[3].focus_me = true;
                                    break;
                                case "shift": //班别
                                    $scope.scaninfo[2].scanning = result.data[0].barcode.trim();
                                    $scope.scaninfo[2].focus_me = true;
                                    break;
                            }
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
            $scope.scaned = function(value) {
                $scope.checkScan(value.trim());
            };
            $scope.checkScan = function(scanning) {
                if (commonService.isNull(scanning)) {
                    return;
                }
                setCirculationCard(scanning);
            };

            var setCirculationCard = function(scanning) {
                for (var a = 0; a < $scope.scaninfo.length; a++) {
                    if ($scope.scaninfo[a].focus_me === true) {
                        $scope.scan_field = a + 1;
                        break;
                    }
                }
                var webTran = {
                    service: 'app.wo.process.machine.get',
                    parameter: {
                        "barcode_no": scanning,
                        "site_no": userInfoService.userInfo.site_no,
                        "analysis_symbol": userInfoService.userInfo.barcode_separator || "%",
                        "report_type": "3",
                        "scan_field": $scope.scan_field // 1.工單單號%runcard%項次  2.機器編號 3.班別 4.人員  5.工作站
                    }
                };
                $ionicLoading.show();
                APIService.Web_Post(webTran, function(res) {
                    $ionicLoading.hide();
                    // console.log("success:" + angular.toJson(res));
                    $timeout(function() {
                        var parameter = res.payload.std_data.parameter;
                        setShowInfo(scanning, parameter);
                    }, 0);
                }, function(error) {
                    $ionicLoading.hide();
                    var execution = error.payload.std_data.execution;
                    console.log("error:" + execution.description);
                    if (!commonService.isNull(userInfoService.userInfo.voice) && userInfoService.userInfo.voice != "novoice") {
                        APIBridge.callAPI('VoiceUtils', [{
                            "someone": userInfoService.userInfo.voice,
                            "content": content
                        }]).then(function(result) {
                            showErrorAlert(scanning, execution.description);
                        }, function(result) {
                            showErrorAlert(scanning, execution.description);
                        });
                    } else {
                        showErrorAlert(scanning, execution.description);
                    }
                });
            };

            var showErrorAlert = function(scanning, description) {
                IonicPopupService.errorAlert(execution.description).then(function() {
                    $scope.scaninfo[$scope.scan_field - 1].focus_me = true;
                    if ($scope.scan_field == 1) {
                        jumpToFil_17(scanning);
                    }
                });
            };

            var jumpToFil_17 = function(scanning) {
                if (userInfoService.userInfo.server_product == "易飞" ||
                    userInfoService.userInfo.server_product == "E10" ||
                    userInfoService.userInfo.server_product == "WF") {
                    return;
                }
                var LotPopup = $ionicPopup.show({
                    title: $scope.langs.checkJumpTo + $scope.langs.work_rder + $scope.langs.process + $scope.langs.inquire,
                    scope: $scope,
                    buttons: [{
                        text: $scope.langs.cancel,
                        onTap: function() {
                            $scope.scaninfo.focus_me = true;
                        }
                    }, {
                        text: $scope.langs.confirm,
                        onTap: function() {
                            var obj = circulationCardService.checkCirculationCard(scanning, userInfoService.userInfo.barcode_separator);
                            fil_common_requisition.scanning = obj.doc_no + userInfoService.userInfo.barcode_separator + obj.run_card_no;
                            $state.go("fil_17_s01");
                        }
                    }]
                });
                IonicClosePopupService.register(false, LotPopup);
            };

            var setShowInfo = function(scanning, parameter) {
                var index = -1;
                if (parameter.return_type == 1) {
                    if ($scope.wlock) {
                        $scope.scaninfo[4].scanning = "";
                    }
                    if ($scope.mlock) {
                        $scope.scaninfo[1].scanning = "";
                    }
                    if ($scope.elock) {
                        $scope.scaninfo[3].scanning = "";
                    }
                    if ($scope.slock) {
                        $scope.scaninfo[2].scanning = "";
                    }
                    $scope.initShowGood();
                    $scope.getShowInfo();
                    $scope.showInfo.circulationCard = scanning;
                    $scope.showInfo.barcode_no = parameter.wo_no;
                    $scope.showInfo.run_card_no = parameter.run_card_no;
                    $scope.showInfo.process_no = parameter.op_no;
                    $scope.showInfo.process_name = parameter.op_name;
                    $scope.showInfo.process_seq = parameter.op_seq;
                    $scope.showInfo.workstation = parameter.workstation_no;
                    $scope.showInfo.workstation_name = parameter.workstation_name;
                    $scope.showInfo.item_no = parameter.item_no;
                    $scope.showInfo.item_name = parameter.item_name;
                    $scope.showInfo.item_spec = parameter.item_spec;
                    $scope.showInfo.work_qty = parameter.reports_qty;
                    $scope.showInfo.maxqty = parameter.reports_qty;
                    $scope.showInfo.work_hours = parameter.work_hours;
                    $scope.showGood.barcode_no = scanning;
                    $scope.showInfo.system_number = parameter.reports_qty;
                    $scope.showInfo.over_deliver_rate = parameter.over_deliver_rate;
                    if ($scope.wlock) {
                        $scope.scaninfo[4].scanning = parameter.workstation_no;
                    } else {
                        $scope.showInfo.workstation_no = $scope.scaninfo[4].scanning;
                        $scope.showInfo.workstation_name = angular.copy($scope.workstation_name);
                    }
                    $scope.addGoods(angular.copy($scope.showInfo));
                    $scope.getShowInfo();
                    return;
                }

                if (parameter.return_type == 2) {
                    $scope.showInfo.machine_no = parameter.machine_no;
                    $scope.showInfo.machine_name = parameter.machine_name;
                    $scope.machine_name = parameter.machine_name;
                }
                if (parameter.return_type == 3) {
                    $scope.showInfo.shift_no = parameter.shift_no;
                    $scope.showInfo.shift_name = parameter.shift_name;
                    $scope.shift_name = parameter.shift_name;
                }
                if (parameter.return_type == 4) {
                    $scope.showInfo.employee_no = parameter.employee_no;
                    $scope.showInfo.employee_name = parameter.employee_name;
                    $scope.employee_name = parameter.employee_name;
                }
                if (parameter.return_type == 5) {
                    $scope.showInfo.workstation = parameter.workstation_no;
                    $scope.showInfo.workstation_name = parameter.workstation_name;
                    $scope.workstation_name = angular.copy($scope.showInfo.workstation_name);
                }
                $scope.scaninfo[$scope.scan_field - 1].focus_me = true;

            };


            $scope.initShowGood = function() {
                $scope.showGood = {
                    barcode_no: null
                };
            };
            $scope.getShowInfo = function() {
                if ($scope.showGood.barcode_no) {
                    index = $scope.scanning_detail.findIndex(function(item) {
                        return commonService.isEquality($scope.showGood.barcode_no, item.circulationCard);
                    });
                    if (index != -1) {
                        $scope.showInfo = $scope.scanning_detail[index];
                        return;
                    }
                }
                $scope.showInfo = {
                    submit: true,
                    work_qty: 0,
                    maxqty: 0,
                    scrap_qty: 0,
                    work_hours: 0,
                    machine_time: 0,
                    run_card_no: 0,
                    circulationCard: "",
                    barcode_no: "",
                    process_name: "",
                    process_no: "",
                    process_seq: "",
                    workstation: "",
                    machine_no: userInfoService.userInfo.machine_no || "",
                    machine_name: userInfoService.userInfo.machine_name || "",
                    shift_no: userInfoService.userInfo.shift_no || "",
                    shift_name: userInfoService.userInfo.shift_name || "",
                    employee_no: userInfoService.userInfo.employee_no,
                    employee_name: userInfoService.userInfo.employee_name,
                    item_no: "",
                    item_spec: "",
                    over_deliver_rate: "",
                    system_number: 0, //在制数
                    scraps: []
                };

                // if(!$scope.wlock){
                //   $scope.showInfo.workstation = $scope.scaninfo[4].scanning ;
                //   $scope.showInfo.workstation_name = $scope.workstation_name;
                // }else{
                //   $scope.scaninfo[4].scanning = $scope.showInfo.workstation || "";
                // }
                if (!$scope.mlock) {
                    $scope.showInfo.machine_no = $scope.scaninfo[1].scanning;
                    $scope.showInfo.machine_name = $scope.machine_name;
                } else {
                    $scope.scaninfo[1].scanning = $scope.showInfo.machine_no || "";
                }
                if (!$scope.elock) {
                    $scope.showInfo.employee_no = angular.copy($scope.scaninfo[3].scanning);
                    $scope.showInfo.employee_name = angular.copy($scope.employee_name);
                } else {
                    $scope.scaninfo[3].scanning = $scope.showInfo.employee_no || "";
                }
                if (!$scope.slock) {
                    $scope.showInfo.shift_no = angular.copy($scope.scaninfo[2].scanning);
                    $scope.showInfo.shift_name = angular.copy($scope.shift_name);
                } else {
                    $scope.scaninfo[2].scanning = $scope.showInfo.shift_no || "";
                }
            };
            $scope.addGoods = function(obj) {

                $scope.scanning_detail.unshift(angular.copy(obj));
            };

            $scope.$watch('showInfo.work_qty', function(newVal, oldVal) {

                if (newVal !== oldVal) {
                    if (timeout) $timeout.cancel(timeout);
                    timeout = $timeout(function() {
                        if (isNaN(newVal) || newVal < 0) {
                            $scope.showInfo.work_qty = 0;
                            return;


                        }
                        if (newVal + $scope.showInfo.scrap_qty > $scope.showInfo.maxqty * (1 + $scope.showInfo.over_deliver_rate / 100)) {
                            userInfoService.getVoice($scope.langs.dailyWork_work_qty_error, function() {});
                            // newVal = $scope.showInfo.maxqty*(1+$scope.showInfo.over_deliver_rate/100) - $scope.showInfo.scrap_qty ;
                            var s = $scope.showInfo.scrap_qty - (newVal + $scope.showInfo.scrap_qty - $scope.showInfo.maxqty * (1 + $scope.showInfo.over_deliver_rate / 100));
                            $scope.showInfo.scrap_qty = (s > 0 ? s : 0);
                            $scope.showInfo.work_qty = $scope.showInfo.maxqty * (1 + $scope.showInfo.over_deliver_rate / 100) - $scope.showInfo.scrap_qty;

                        }

                    }, 800);
                }
            }, false);




            $scope.$watch('showInfo.scrap_qty', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    if (timeout) $timeout.cancel(timeout);
                    timeout = $timeout(function() {
                        if (isNaN(newVal) || newVal < 0) {
                            $scope.showInfo.scrap_qty = 0;
                            return;
                        }
                        $scope.showInfo.scraps = [];
                        if (newVal + $scope.showInfo.work_qty > $scope.showInfo.maxqty * (1 + $scope.showInfo.over_deliver_rate / 100)) {
                            userInfoService.getVoice($scope.langs.dailyWork_work_qty_error, function() {});
                            var num = $scope.showInfo.work_qty - (newVal + $scope.showInfo.work_qty - $scope.showInfo.maxqty * (1 + $scope.showInfo.over_deliver_rate / 100));
                            $scope.showInfo.work_qty = (num > 0 ? num : 0);
                            $scope.showInfo.scrap_qty = $scope.showInfo.maxqty * (1 + $scope.showInfo.over_deliver_rate / 100) - $scope.showInfo.work_qty;

                        }
                    }, 800);
                }
            }, false);

            $scope.checkNum = function(type) {
                switch (type) {
                    case "work_qty":
                        if (isNaN($scope.showInfo.work_qty) || $scope.showInfo.work_qty < 0) {
                            $scope.showInfo.work_qty = 0;
                        }
                        if ($scope.showInfo.work_qty + $scope.showInfo.scrap_qty > $scope.showInfo.maxqty * (1 + $scope.showInfo.over_deliver_rate / 100)) {
                            userInfoService.getVoice($scope.langs.dailyWork_work_qty_error, function() {});
                            $scope.showInfo.work_qty = $scope.showInfo.maxqty * (1 + $scope.showInfo.over_deliver_rate / 100) - $scope.showInfo.scrap_qty;

                        }

                        //$scope.scrap_qty = $scope.showInfo.scrap_qty;
                        break;
                    case "scrap_qty":
                        if (isNaN($scope.showInfo.scrap_qty) || $scope.showInfo.scrap_qty < 0) {
                            $scope.showInfo.scrap_qty = 0;
                        }
                        if ($scope.showInfo.work_qty + $scope.showInfo.scrap_qty > $scope.showInfo.maxqty * (1 + $scope.showInfo.over_deliver_rate / 100)) {
                            userInfoService.getVoice($scope.langs.dailyWork_work_qty_error, function() {});
                            $scope.showInfo.scrap_qty = $scope.showInfo.maxqty * (1 + $scope.showInfo.over_deliver_rate / 100) - $scope.showInfo.work_qty;

                        }
                        // else{
                        //   $scope.showInfo.work_qty = $scope.showInfo.maxqty*(1+$scope.showInfo.over_deliver_rate/100) - $scope.showInfo.scrap_qty ;
                        // }
                        break;
                }
            };

            //跳出不良掃描頁面
            $scope.showAbnormal = function() {
                $scope.pram = 10;
                $scope.scraps = angular.copy($scope.showInfo.scraps);
                $scope.showAbnormalInfo = {
                    barcode: $scope.showInfo.circulationCard,
                    max_scrap_qty: $scope.showInfo.scrap_qty
                };
                $scope.max_scrap_qty = angular.copy($scope.showAbnormalInfo.max_scrap_qty);
                //刪除不良原因
                $scope.delScrap = function(index) {
                    $scope.scraps.splice(index, 1);
                    $ionicListDelegate.closeOptionButtons();
                };

                $scope.addScrap = function(temp) {
                    $scope.scraps.unshift(angular.copy(temp));
                    //  delete $scope.scraps[0].abnormal_name;
                    console.log($scope.scraps);
                };

                $scope.setEditGoods = function() {
                    $scope.showInfo.scraps = angular.copy($scope.scraps);
                    for (var x = 0; x < $scope.showInfo.scraps.length; x++) {
                        delete $scope.showInfo.scraps[x].abnormal_name;
                    }
                    $scope.closeAbnormalModal();
                };

                $ionicModal.fromTemplateUrl('views/app/common/abnormalModal.html', {
                    scope: $scope
                }).then(function(modal) {
                    $scope.closeAbnormalModal = function() {
                        modal.hide().then(function() {
                            return modal.remove();
                        });
                    };
                    modal.show();
                });
            };

            $scope.getReasonCode = function(value) {
                console.log(value);
                var webTran = {
                    service: 'app.abnormal.get',
                    parameter: {
                        "site_no": userInfoService.userInfo.site_no,
                        "abnormal_condition": value || '%'
                    }
                };
                $ionicLoading.show();
                APIService.Web_Post(webTran, function(res) {
                    // console.log("success:" + angular.toJson(res));
                    $ionicLoading.hide();
                    var parameter = res.payload.std_data.parameter;
                    $scope.reasonCodes = parameter.abnormal;
                }, function(error) {
                    $ionicLoading.hide();
                    var execution = error.payload.std_data.execution;
                    console.log("error:" + execution.description);
                    userInfoService.getVoice(execution.description, function() {});
                });
            };

            //跳出新增不良原因頁面
            $scope.selectReasonCode = function() {
                //搜索撈取WS
                $scope.scanned = function(value) {
                    $scope.getReasonCode(value);
                };

                //報廢數量檢查
                var checkDefectqty = function() {
                    if ($scope.sub.defect_qty > $scope.showAbnormalInfo.max_scrap_qty) {
                        userInfoService.getVoice($scope.langs.defect_qty_error, function() {});
                        $scope.sub.defect_qty = parseFloat($scope.showAbnormalInfo.max_scrap_qty);
                        // $scope.pop.qty = parseFloat($scope.showAbnormalInfo.max_scrap_qty);
                    }
                };

                $scope.addScrap = function(temp) {
                    $scope.scraps.unshift(angular.copy(temp));
                    //  delete $scope.scraps[0].abnormal_name;
                    console.log($scope.scraps);
                };

                $scope.setEditGoods = function() {
                    $scope.showInfo.scraps = angular.copy($scope.scraps);
                    for (var x = 0; x < $scope.showInfo.scraps.length; x++) {
                        delete $scope.showInfo.scraps[x].abnormal_name;
                    }
                    $scope.closeAbnormalModal();
                };

                $ionicModal.fromTemplateUrl('views/app/common/abnormalModal.html', {
                    scope: $scope
                }).then(function(modal) {
                    $scope.closeAbnormalModal = function() {
                        modal.hide().then(function() {
                            return modal.remove();
                        });
                    };
                    modal.show();
                });
            };

            //跳出新增不良原因頁面
            $scope.selectReasonCode = function() {
                //搜索撈取WS
                $scope.scanned = function(value) {
                    $scope.getReasonCode(value);
                };
                $scope.getReasonCode('%');

                //初始化不良原因物件
                $scope.sub = {
                    abnormal_no: "",
                    abnormal_name: "",
                    defect_qty: 0
                };


                //報廢數量檢查
                var checkDefectqty = function() {
                    if ($scope.sub.defect_qty > $scope.showAbnormalInfo.max_scrap_qty) {
                        IonicPopupService.errorAlert($scope.langs.defect_qty_error);
                        $scope.sub.defect_qty = parseFloat($scope.showAbnormalInfo.max_scrap_qty);
                        // $scope.pop.qty = parseFloat($scope.showAbnormalInfo.max_scrap_qty);
                    }
                };

                //計算數值是否小於0
                var checkmin = function(value, value2) {
                    var num = Number(value) + Number(value2);
                    if (num < 0) {
                        num = value;
                    }
                    return num;
                };

                //計算加減後數值 並呼叫撿查
                var compute = function(type, value) {
                    switch (type) {
                        case "defect_qty":
                            $scope.sub.defect_qty = checkmin($scope.sub.defect_qty, value);
                            checkDefectqty();
                            break;
                    }
                };

                $scope.SelAbnormalMins = function(type) {
                    console.log("mins");
                    compute(type, -1);
                };

                $scope.SelAbnormalAdd = function(type) {
                    console.log("add");
                    compute(type, 1);
                };

                $scope.changeReasonCode = function(item) {
                    $scope.sub.abnormal_no = item.abnormal_no;
                    $scope.sub.abnormal_name = item.abnormal_name;
                };

                $scope.setReasonCode = function() {
                    var temp = angular.copy($scope.sub);
                    if (temp.abnormal_no.length <= 0) {
                        return;
                    }

                    if (temp.defect_qty <= 0) {
                        userInfoService.getVoice($scope.langs.input_defect_qty_error, function() {});
                    } else {
                        index = $scope.showInfo.scraps.findIndex(function(item) {
                            return commonService.isEquality(item.abnormal_no, temp.abnormal_no);
                        });

                        if (index !== -1) {
                            IonicPopupService.errorAlert($scope.langs.data_duplication_error);
                            return;
                        }

                        $scope.addScrap(temp);
                        $scope.closeSelAbnormalModal();
                    }
                };

                $ionicModal.fromTemplateUrl('views/app/common/selAbnormalModal.html', {
                    scope: $scope
                }).then(function(modal) {
                    $scope.closeSelAbnormalModal = function() {
                        modal.hide().then(function() {
                            return modal.remove();
                        });
                    };
                    modal.show();
                });

            };
            $scope.deleteGoods = function(index) {
                $scope.scanning_detail.splice(index, 1);
                if ($scope.scanning_detail.length <= 0) {
                    // $scope.scaninfo.modify = false;
                    $scope.initShowGood();
                } else {
                    $scope.showGood.barcode_no = angular.copy($scope.scanning_detail[0].circulationCard);
                }
                $scope.getShowInfo();
            };
            var scanning_detail_clear = function(circulationCard) {
                if (circulationCard) {
                    var index = $scope.scanning_detail.findIndex(function(item) {
                        return commonService.isEquality(circulationCard, item.circulationCard) && item.submit === true;
                    });

                    if (index !== -1) {
                        userInfoService.getVoice($scope.langs.data_duplication_error, function() {});
                        return;
                    }
                }

                if ($scope.scanning_detail.length > 0) {
                    var length = $scope.scanning_detail.length;
                    for (var i = 0, len = length; i < len; i++) {
                        var value = $scope.scanning_detail[i];
                        if (value.submit !== false) {
                            $scope.addDailyWork(value);
                            break;
                        }
                    }
                }

                $scope.initShowGood();
                $scope.getShowInfo();
                // $scope.scaninfo.modify = false;
            };
            $scope.checkDailyWork = function() {
                // $scope.scaninfo.focus_me = false;
                $scope.addDailyWork($scope.scanning_detail[0]);
            };

            $scope.addDailyWork = function(value) {

                console.log("value:");
                console.log(value);
                // return;
                // $scope.scaninfo.modify = false;
                if (!value.employee_no) {
                    //檢查是否每筆都有報工人員
                    IonicPopupService.errorAlert($scope.langs.dailyWork_employee_no_error).then(function() {
                        $scope.scaninfo[3].focus_me = true;
                    });
                    return;
                }
                var webTran = {
                    service: 'app.wo.work.report.data.create',
                    parameter: {
                        "site_no": userInfoService.userInfo.site_no,
                        "wo_no": value.barcode_no,
                        "run_card_no": value.run_card_no,
                        "op_no": value.process_no,
                        "op_seq": value.process_seq,
                        "workstation_no": value.workstation,
                        "machine_no": value.machine_no,
                        "labor_hours": value.work_hours,
                        "machine_hours": value.machine_time,
                        "reports_qty": value.work_qty,
                        "scrap_qty": value.scrap_qty,
                        "item_no": value.item_no,
                        "shift_no": value.shift_no,
                        "employee_no": value.employee_no,
                        "report": value.scraps
                    }
                };
                console.log(webTran);
                $ionicLoading.show();
                APIService.Web_Post(webTran, function(res) {
                    $ionicLoading.hide();
                    // console.log("success:" + angular.toJson(res));
                    var parameter = res.payload.std_data.parameter;
                    value.submit = false;
                    scanning_detail_clear(value.circulationCard);
                    $scope.initScan();
                    IonicPopupService.successAlert(parameter.report_no).then(function() {
                        $state.go("fil3_10_s01");
                    });
                }, function(error) {
                    $ionicLoading.hide();
                    var execution = error.payload.std_data.execution;
                    console.log("error:" + execution.description);
                    // value.submit = true;
                    // scanning_detail_clear(value.circulationCard);
                    // $scope.initScan();
                    userInfoService.getVoice(execution.description, function() {});
                });
            };

        }
    ];
});
