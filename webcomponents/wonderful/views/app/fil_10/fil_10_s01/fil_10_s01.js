define(["API", "APIS", 'AppLang', 'views/app/fil_common/requisition.js', 'array', 'Directives', 'ReqTestData', 'ionic-popup',
    'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService'
], function() {
    return ['$scope', '$state', '$stateParams', '$timeout', '$filter', 'AppLang', 'APIService', 'APIBridge',
        '$ionicLoading', '$ionicPopup', '$ionicModal', '$ionicListDelegate', 'IonicPopupService', 'IonicClosePopupService',
        'fil_common_requisition', 'ReqTestData', 'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService',
        function($scope, $state, $stateParams, $timeout, $filter, AppLang, APIService, APIBridge,
            $ionicLoading, $ionicPopup, $ionicModal, $ionicListDelegate, IonicPopupService, IonicClosePopupService,
            fil_common_requisition, ReqTestData, circulationCardService, commonFactory, commonService, userInfoService, scanTypeService, numericalAnalysisService) {

            $scope.langs = AppLang.langs;
            $scope.scanning_detail = [];
            $scope.page_params = commonService.get_page_params();
            $scope.userInfo = userInfoService.getUserInfo();

            //取得預設倉庫 設定頁面 或 第一筆資料
            var out_warehouse = userInfoService.userInfo.warehouse_no || userInfoService.warehouse[0].warehouse_no;

            //取得倉庫資訊
            var index = userInfoService.warehouseIndex[out_warehouse];
            out_storage_management = userInfoService.warehouse[index].storage_management || "N";
            $scope.sel_in_storage = userInfoService.warehouse[index].storage_spaces;

            //初始化掃描欄位
            $scope.scaninfo = {
                scanning: "",
                focus_me: true,
                modify: false,
                warehouse_no: out_warehouse,
                warehouse_name: userInfoService.warehouse[index].warehouse_name,
                storage_management: out_storage_management,
                storage_spaces_no: (out_storage_management == "Y") ? $scope.sel_in_storage[0].storage_spaces_no : " ",
                storage_spaces_name: (out_storage_management == "Y") ? $scope.sel_in_storage[0].storage_spaces_name : " ",
                lot_no: "",
            };

            $scope.workersCategorys = [{
                key: "1",
                value: "Move In"
            }, {
                key: "2",
                value: "Check In"
            }, {
                key: "3",
                value: "報工"
            }, {
                key: "4",
                value: "Check Out"
            }, {
                key: "5",
                value: "Move Out"
            }, {
                key: "6",
                value: "轉移入庫"
            }];

            $scope.initShowGood = function() {
                $scope.showGood = {
                    barcode_no: null
                };
            };
            $scope.initShowGood();

            $scope.editGoods = function(index) {
                $ionicListDelegate.closeOptionButtons();
                $scope.showGood.barcode_no = angular.copy($scope.scanning_detail[index].circulationCard);
                $scope.getShowInfo();
                $state.go("fil_10_s01.fil_10_s02");
            };

            $scope.clearList = function() {
                $scope.scanning_detail = [];
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

            $scope.addGoods = function(obj) {
                $scope.setFocusMe(true);
                $scope.scanning_detail.unshift(angular.copy(obj));
            };

            $scope.deleteGoods = function(index) {
                $scope.scanning_detail.splice(index, 1);
                if ($scope.scanning_detail.length <= 0) {
                    $scope.scaninfo.modify = false;
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

                    if (index != -1) {
                        $scope.deleteGoods(index);
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

                if ($scope.scanning_detail.length > 0) {
                    $scope.editGoods(0);
                } else {
                    $scope.initShowGood();
                }
                $scope.getShowInfo();
                $scope.scaninfo.modify = false;
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
                    workCat: $scope.workersCategorys[$scope.page_params.status].key,
                    workCatName: $scope.workersCategorys[$scope.page_params.status].value,
                    work_qty: 0,
                    maxqty: 0,
                    scrap_qty: 0,
                    work_hours: 0,
                    machine_time: 0,
                    run_card_no: 0,
                    seq: 0,
                    circulationCard: "",
                    barcode_no: "",
                    process_no: "",
                    process_seq: "",
                    workstation: "",
                    machine_no: userInfoService.userInfo.machine_no || "",
                    shift_no: userInfoService.userInfo.shift_no || "",
                    employee_no: userInfoService.userInfo.employee_no,
                    employee_name: userInfoService.userInfo.employee_name,
                    item_no: "",
                    item_feature_no: " ",
                    scraps: []
                };
            };
            $scope.getShowInfo();

            //跳出不良掃描頁面
            $scope.showAbnormal = function() {
                $scope.scraps = angular.copy($scope.showInfo.scraps);
                $scope.showAbnormalInfo = {
                    barcode: $scope.showInfo.circulationCard,
                    max_scrap_qty: $scope.showInfo.scrap_qty
                };

                //刪除不良原因
                $scope.delScrap = function(index) {
                    $scope.scraps.splice(index, 1);
                    $ionicListDelegate.closeOptionButtons();
                };

                $scope.addScrap = function(temp) {
                    $scope.scraps.unshift(angular.copy(temp));
                };

                $scope.setEditGoods = function() {
                    $scope.showInfo.scraps = angular.copy($scope.scraps);
                    $scope.closeAbnormalModal();
                };

                $ionicModal.fromTemplateUrl('views/app/common/html/abnormalModal.html', {
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

                //初始化POP窗數字物件
                $scope.pop = {
                    qty: 0,
                    type: ""
                };

                //数量弹窗
                $scope.SelAbnormalShowQtyPop = function(type) {
                    var value = 0;
                    $scope.pop.type = type;
                    $scope.pop.qty = parseFloat($scope.sub.defect_qty);
                    var myPopup = $ionicPopup.show({
                        title: $scope.langs.edit + $scope.langs.qty,
                        scope: $scope,
                        templateUrl: "views/app/common/html/qtyPop.html",
                        buttons: [{
                            text: $scope.langs.cancel
                        }, {
                            text: $scope.langs.confirm,
                            onTap: function() {
                                $scope.pop.qty = ($scope.pop.qty < 0 || !$scope.pop.qty) ? 0 : $scope.pop.qty;
                                $scope.sub.defect_qty = $scope.pop.qty;
                                checkDefectqty();
                            }
                        }]
                    });
                    IonicClosePopupService.register(false, myPopup);
                };

                //報廢數量檢查
                var checkDefectqty = function() {
                    if (Number($scope.sub.defect_qty) > Number($scope.showAbnormalInfo.max_scrap_qty)) {
                        userInfoService.getVoice($scope.langs.defect_qty_error, function() {});
                        $scope.sub.defect_qty = parseFloat($scope.showAbnormalInfo.max_scrap_qty);
                        $scope.pop.qty = parseFloat($scope.showAbnormalInfo.max_scrap_qty);
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
                        default:
                            $scope.pop.qty = checkmin($scope.pop.qty, value);
                            checkDefectqty($scope.pop.type);
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
                            userInfoService.getVoice($scope.langs.data_duplication_error, function() {});
                            return;
                        }

                        $scope.addScrap(temp);
                        $scope.closeSelAbnormalModal();
                    }
                };

                $ionicModal.fromTemplateUrl('views/app/common/html/selAbnormalModal.html', {
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
                    $timeout(function() {
                        $scope.reasonCodes = parameter.abnormal;
                    }, 0);
                }, function(error) {
                    $ionicLoading.hide();
                    var execution = error.payload.std_data.execution;
                    console.log("error:" + execution.description);
                    userInfoService.getVoice(execution.description, function() {});
                });
            };

            $scope.checkDailyWork = function() {
                $scope.setFocusMe(false);
                $scope.addDailyWork($scope.scanning_detail[0]);
            };

            $scope.addDailyWork = function(value) {
                $scope.scaninfo.modify = false;
                $scope.setFocusMe(false);
                if (!value.employee_no) {
                    //檢查是否每筆都有報工人員
                    userInfoService.getVoice($scope.langs.dailyWork_employee_no_error, function() {
                        $scope.setFocusMe(true);
                    });
                    return;
                }
                var webTran = {
                    service: 'app.wo.work.report.data.create',
                    parameter: {
                        "site_no": userInfoService.userInfo.site_no,
                        "report_type": value.workCat,
                        "circulationCard": value.circulationCard,
                        "seq": value.seq,
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
                        "item_feature_no": value.item_feature_no,
                        "shift_no": value.shift_no,
                        "employee_no": value.employee_no,
                        "employee_name": value.employee_name,
                        "warehouse_no": $scope.scaninfo.warehouse_no,
                        "storage_spaces_no": $scope.scaninfo.storage_spaces_no,
                        "lot_no": $scope.scaninfo.lot_no,
                        "report": value.scraps
                    }
                };
                console.log(webTran);
                $ionicLoading.show();
                APIService.Web_Post(webTran, function(res) {
                    $ionicLoading.hide();
                    // console.log("success:" + angular.toJson(res));
                    var parameter = res.payload.std_data.parameter;
                    value.submit = true;
                    scanning_detail_clear(value.circulationCard);
                    IonicPopupService.successAlert(parameter.report_no).then(function() {
                        $scope.setFocusMe(true);
                    });
                }, function(error) {
                    $ionicLoading.hide();
                    var execution = error.payload.std_data.execution;
                    console.log("error:" + execution.description);
                    value.submit = false;
                    scanning_detail_clear();
                    userInfoService.getVoice(execution.description, function() {
                        $scope.setFocusMe(true);
                        $scope.scaninfo.modify = true;
                    });
                });
            };

        }
    ];
});
