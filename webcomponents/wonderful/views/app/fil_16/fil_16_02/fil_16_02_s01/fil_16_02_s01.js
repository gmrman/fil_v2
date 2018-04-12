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
            $scope.page_params = commonService.get_page_params();
            $scope.userInfo = userInfoService.getUserInfo();
            $scope.scanning_detail = [];

            //初始化掃描欄位
            $scope.scaninfo = {
                scanning: "",
                focus_me: true,
                readonly: true,
                modify: false
            };

            $scope.initShowGood = function() {
                $scope.showGood = {
                    barcode_no: null
                };
            };
            $scope.initShowGood();

            $scope.editGoods = function(index) {
                $ionicListDelegate.closeOptionButtons();
                $scope.showGood.barcode_no = angular.copy($scope.scanning_detail[index].scan_doc_no);
                $scope.getShowInfo();
                $state.go("fil_16_02_s01.fil_16_02_s02");
            };

            $scope.clearList = function() {
                $scope.scanning_detail = [];
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
                    $scope.showGood.barcode_no = angular.copy($scope.scanning_detail[0].scan_doc_no);
                }
                $scope.getShowInfo();
            };

            var scanning_detail_clear = function(scan_doc_no) {
                if (scan_doc_no) {
                    var index = $scope.scanning_detail.findIndex(function(item) {
                        return commonService.isEquality(scan_doc_no, item.scan_doc_no) && item.submit === true;
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
                            $scope.addshowgood(value);
                            break;
                        }
                    }
                }

                $scope.initShowGood();
                $scope.getShowInfo();
                $scope.scaninfo.modify = false;
            };

            $scope.getShowInfo = function() {
                if ($scope.showGood.barcode_no) {
                    index = $scope.scanning_detail.findIndex(function(item) {
                        return commonService.isEquality($scope.showGood.barcode_no, item.scan_doc_no);
                    });
                    if (index != -1) {
                        $scope.showInfo = $scope.scanning_detail[index];
                        return;
                    }
                }
                $scope.showInfo = {
                    submit: true,
                    scan_type: "",
                    scan_doc_no: "",
                    doc_no: "",
                    run_card_no: "",
                    seq: "",
                    op_no: "",
                    op_name: "",
                    item_no: "",
                    item_name: "",
                    item_spec: "",
                    item_feature_no: "",
                    lot_no: "",
                    qty: "",
                    scan_employee_no: userInfoService.userInfo.employee_no,
                    scan_employee_name: userInfoService.userInfo.employee_name,
                    ok_qty: 0,
                    return_qty: 0,
                    surplus_qty: 0,
                    reference_qty: 0,
                    reference_unit_no: "",
                    return_reference_qty: 0,
                    surplus_reference_qty: 0,
                    analysis_symbol: userInfoService.userInfo.barcode_separator,
                    scraps: []
                };
            };
            $scope.getShowInfo();

            //跳出不良掃描頁面
            $scope.showAbnormal = function() {
                console.log($scope.showInfo);
                $scope.scraps = angular.copy($scope.showInfo.scraps);
                $scope.showAbnormalInfo = {
                    barcode: $scope.showInfo.scan_doc_no,
                    max_scrap_qty: $scope.showInfo.return_qty
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
                            }
                        }]
                    });
                    IonicClosePopupService.register(false, myPopup);
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
                            break;
                        default:
                            $scope.pop.qty = checkmin($scope.pop.qty, value);
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
                    console.log($scope.sub);
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

            $scope.checkshowgood = function() {
                $scope.setFocusMe(false);
                var obj = $scope.showInfo;
                if ($scope.page_params.program_job_no != '16-3') {
                    obj = $scope.scanning_detail[0];
                }
                $scope.addshowgood(obj);
            };

            $scope.addshowgood = function(value) {
                $scope.scaninfo.modify = false;

                //T系列檢查是否有檢驗人員
                if (userInfoService.userInfo.server_product == "T100" || userInfoService.userInfo.gp_flag) {
                    if (!value.scan_employee_no) {
                        //檢查是否每筆都有人員
                        userInfoService.getVoice($scope.langs.dailyWork_employee_no_error, function() {
                            $scope.setFocusMe(true);
                        });
                        return;
                    }
                }

                var webTran = {
                    service: 'app.qc.create',
                    parameter: {
                        "site_no": userInfoService.userInfo.site_no,
                        "program_job_no": $scope.page_params.program_job_no,
                        "scan_type": "4",
                        "analysis_symbol": userInfoService.userInfo.barcode_separator,
                        "status": $scope.page_params.status,
                        "scan_doc_no": value.scan_doc_no,
                        "doc_no": value.doc_no,
                        "run_card_no": value.run_card_no,
                        "seq": value.seq,
                        "op_no": value.op_no,
                        "item_no": value.item_no,
                        "item_feature_no": value.item_feature_no,
                        "lot_no": value.lot_no,
                        "scan_employee_no": value.scan_employee_no,
                        "ok_qty": value.ok_qty,
                        "return_qty": value.return_qty,
                        "surplus_qty": value.surplus_qty,
                        "reference_unit_no": value.reference_unit_no,
                        "reference_qty": value.reference_qty,
                        "return_reference_qty": value.return_reference_qty,
                        "surplus_reference_qty": value.surplus_reference_qty,
                        "reason_list": value.scraps
                    }
                };
                console.log(webTran);
                $ionicLoading.show();
                APIService.Web_Post(webTran, function(res) {
                    $ionicLoading.hide();
                    // console.log("success:" + angular.toJson(res));
                    var parameter = res.payload.std_data.parameter;
                    value.submit = true;
                    scanning_detail_clear(value.scan_doc_no);
                    var page = "fil_16_02_s01.fil_16_02_s02";
                    if ($scope.page_params.program_job_no == '16-3') {
                        page = "fil_16_02_s04";
                    }
                    IonicPopupService.successAlert(parameter.doc_no).then(function() {
                        $state.go(page);
                    });
                }, function(error) {
                    $ionicLoading.hide();
                    var execution = error.payload.std_data.execution;
                    console.log("error:" + execution.description);
                    if ($scope.page_params.program_job_no != '16-3') {
                        value.submit = false;
                        scanning_detail_clear();
                    }
                    userInfoService.getVoice(execution.description, function() {
                        $scope.setFocusMe(true);
                        $scope.scaninfo.modify = true;
                    });
                });
            };

            //点击数据跳转
            $scope.goPage = function() {
                var page = "fil_16_02_s04";
                $state.go(page);
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

        }
    ];
});