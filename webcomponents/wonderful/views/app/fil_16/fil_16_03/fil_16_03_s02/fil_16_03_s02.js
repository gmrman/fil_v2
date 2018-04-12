define(["API", "APIS", 'AppLang', 'views/app/fil_common/requisition.js', 'array', 'Directives', 'ReqTestData', 'ionic-popup',
    'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService'
], function() {
    return ['$scope', '$state', '$timeout', '$filter', 'AppLang', 'APIService', 'APIBridge',
        '$ionicLoading', '$ionicPopup', '$ionicModal', '$ionicListDelegate', 'IonicPopupService', 'IonicClosePopupService',
        'fil_common_requisition', 'ReqTestData', 'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService',
        function($scope, $state, $timeout, $filter, AppLang, APIService, APIBridge,
            $ionicLoading, $ionicPopup, $ionicModal, $ionicListDelegate, IonicPopupService, IonicClosePopupService,
            fil_common_requisition, ReqTestData, circulationCardService, commonFactory, commonService, userInfoService, scanTypeService, numericalAnalysisService) {

            $scope.langs = AppLang.langs;
            $scope.page_params = commonService.get_page_params();
            $scope.userInfo = userInfoService.getUserInfo();

            $scope.reasonCodes = [];
            $scope.machines = [];

            //初始化掃描欄位
            $scope.scaninfo = {
                scanning: "",
                focus_me: true,
                readonly: true,
                modify: false
            };

            var app_qc_get = function(doc_no) {
                var webTran = {
                    service: 'app.qc.get',
                    parameter: {
                        "program_job_no": $scope.page_params.program_job_no,
                        "scan_type": "4",
                        "status": $scope.page_params.status,
                        "analysis_symbol": "/",
                        "site_no": userInfoService.userInfo.site_no,
                        "doc_no": doc_no,
                    }
                };

                console.log(webTran);
                $ionicLoading.show();
                APIService.Web_Post(webTran, function(res) {
                    $ionicLoading.hide();
                    // console.log("success:" + angular.toJson(res));
                    var parameter = res.payload.std_data.parameter;
                    setShowInfo(doc_no, parameter);
                }, function(error) {
                    $ionicLoading.hide();
                    var execution = error.payload.std_data.execution;
                    console.log("error:" + execution.description);
                    userInfoService.getVoice(execution.description, function() {
                        $scope.setFocusMe(true);
                        $scope.goPage();
                    });
                });
            };

            //將回傳 QC資料顯示於頁面
            var setShowInfo = function(scanning, parameter) {
                $scope.showInfo = parameter;
                $scope.showInfo.scanning = scanning;
            };

            if ($scope.page_params.doc_array.length > 0) {
                if (!commonService.isNull($scope.page_params.doc_array[0].doc_no)) {
                    var doc_info = $scope.page_params.doc_array[0];
                    var scan_doc_no = doc_info.doc_no;
                    if (!commonService.isNull(doc_info.seq) && doc_info.seq != 0) {
                        scan_doc_no = scan_doc_no + "/" + doc_info.seq;
                    }
                    if (!commonService.isNull(doc_info.doc_line_seq) && doc_info.doc_line_seq != 0) {
                        scan_doc_no = scan_doc_no + "/" + doc_info.doc_line_seq;
                    }
                    app_qc_get(scan_doc_no);
                }
            }

            //点击数据跳转
            $scope.goPage = function() {
                $state.go("fil_16_03_s01");
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

            $scope.closeOption = function() {
                $ionicListDelegate.closeOptionButtons();
            };

            var showPointPop = function(message, confirm) {
                var pointPop = $ionicPopup.show({
                    title: $scope.langs.point,
                    template: "<p style='text-align: center'>" + message + "</p>",
                    scope: $scope,
                    buttons: [{
                        text: $scope.langs.confirm,
                        onTap: confirm
                    }]
                });
                return;
            }

            $scope.editInspect = function(index) {
                $ionicListDelegate.closeOptionButtons();
                $scope.inspectInfo = angular.copy($scope.showInfo.inspect_list[index]);
                if (!angular.isArray($scope.inspectInfo.reason_list)) {
                    $scope.inspectInfo.reason_list = [];
                }
                if (!angular.isArray($scope.inspectInfo.measure_list)) {
                    $scope.inspectInfo.measure_list = [];
                }

                $scope.pop = {
                    qty: 0,
                    maxqty: "none",
                    type: "",
                };

                //数量弹窗
                $scope.infoQtyPop = function(type) {

                    switch (type) {
                        case "sampling_qty":
                            $scope.pop.type = type;
                            $scope.pop.maxqty = $scope.showInfo.doc_qty;
                            $scope.pop.qty = $scope.inspectInfo.sampling_qty;
                            break;
                        case "defect_qty":
                            $scope.pop.type = type;
                            $scope.pop.maxqty = "none";
                            $scope.pop.qty = $scope.inspectInfo.defect_qty;
                            break;
                    }

                    var QtyPop = $ionicPopup.show({
                        title: $scope.langs.edit + $scope.langs.qty,
                        scope: $scope,
                        templateUrl: "views/app/common/html/qtyPop.html",
                        buttons: [{
                            text: $scope.langs.cancel
                        }, {
                            text: $scope.langs.confirm,
                            onTap: function(e) {
                                if (!$scope.pop.qty) {
                                    $scope.pop.qty = 0;
                                }
                                if ($scope.pop.maxqty == "none" || $scope.pop.qty <= $scope.pop.maxqty) {
                                    switch (type) {
                                        case "sampling_qty":
                                            $scope.inspectInfo.sampling_qty = $scope.pop.qty;
                                            break;
                                        case "defect_qty":
                                            $scope.inspectInfo.defect_qty = $scope.pop.qty;
                                            break;
                                    }
                                    checkInfoQty(type);
                                    return;
                                }
                                e.preventDefault();
                                userInfoService.getVoice(AppLang.langs.qc_maxQty_error, function() {
                                    $scope.pop.qty = angular.copy($scope.pop.maxqty);
                                });
                            }
                        }]
                    });
                    IonicClosePopupService.register(false, QtyPop);
                    return QtyPop;
                };

                //計算數值是否小於1
                var checkmin = function(value, value2) {

                    return num;
                };

                //計算加減後數值 並呼叫撿查
                var compute = function(type, value) {
                    qty = numericalAnalysisService.accAdd($scope.pop.qty, value);
                    if (qty < 0) {
                        qty = 0;
                    }
                    if ($scope.pop.maxqty == "none") {
                        $scope.pop.qty = qty;
                    } else {
                        $scope.pop.qty = (Number($scope.pop.maxqty) > Number(qty)) ? qty : $scope.pop.maxqty;
                    }
                };

                $scope.mins = function(type) {
                    console.log("mins");
                    compute(type, -1);
                };

                $scope.add = function(type) {
                    console.log("add");
                    compute(type, 1);
                };

                //計算加減後數值 並呼叫撿查
                $scope.infoCompute = function(type, arg1, arg2) {
                    var num = numericalAnalysisService.accAdd(arg1, arg2);
                    if (num < 0) {
                        num = 0;
                    }
                    switch (type) {
                        case "sampling_qty":
                            $scope.inspectInfo.sampling_qty = num
                            break;
                        case "defect_qty":
                            $scope.inspectInfo.defect_qty = num;
                            break;
                    }
                    checkInfoQty(type);
                };

                var checkInfoQty = function(type) {
                    //檢驗數量
                    if ($scope.inspectInfo.sampling_qty > $scope.showInfo.doc_qty) {
                        // 顯示錯誤 "檢驗數量不可大於待驗批量！"
                        userInfoService.getVoice($scope.langs.qc_maxQty_error, function() {
                            $scope.inspectInfo.sampling_qty = angular.copy($scope.showInfo.doc_qty);
                        });
                        return;
                    }

                    if ($scope.inspectInfo.measure_list.length > 0 && $scope.inspectInfo.measure_list.length > $scope.inspectInfo.sampling_qty) {
                        // 顯示提示 "測量值單身數量大於檢驗數量！"
                        showPointPop($scope.langs.measure_list_more_than_sampling_qty, function() {});
                        return;
                    }

                    var l_chkqty = 0;
                    var rate = 0;
                    switch ($scope.inspectInfo.cr_ma_mi) {
                        case "1":
                            rate = numericalAnalysisService.accDiv($scope.showInfo.CR_molecular, $scope.showInfo.CR_denominator);
                            l_chkqty = numericalAnalysisService.accMul($scope.inspectInfo.defect_qty, rate);
                            break;
                        case "2":
                            rate = numericalAnalysisService.accDiv($scope.showInfo.MA_molecular, $scope.showInfo.MA_denominator);
                            l_chkqty = numericalAnalysisService.accMul($scope.inspectInfo.defect_qty, rate);
                            break;
                        case "3":
                            rate = numericalAnalysisService.accDiv($scope.showInfo.MI_molecular, $scope.showInfo.MI_denominator);
                            l_chkqty = numericalAnalysisService.accMul($scope.inspectInfo.defect_qty, rate);
                            break;
                        default:
                            l_chkqty = $scope.inspectInfo.defect_qty
                            break;
                    }

                    if (l_chkqty >= $scope.inspectInfo.reject_qty && $scope.inspectInfo.reject_qty > 0) {
                        $scope.inspectInfo.result_type = "2"; //驗退
                    } else {
                        $scope.inspectInfo.result_type = "1"; //合格
                        $scope.inspectInfo.reason_list = [];
                    }
                };

                $scope.setInspectInfo = function() {
                    $scope.showInfo.inspect_list[index] = angular.copy($scope.inspectInfo);
                    console.log($scope.showInfo.inspect_list);
                    $scope.closeEditInspect()
                    return;
                };

                $ionicModal.fromTemplateUrl('views/app/fil_16/fil_16_03/fil_16_03_s02/fil_16_03_s02_01.html', {
                    scope: $scope
                }).then(function(modal) {
                    $scope.closeEditInspect = function() {
                        modal.hide().then(function() {
                            return modal.remove();
                        });
                    };
                    modal.show();
                });
            };

            //顯示測量值頁面
            $scope.showMeasure = function() {
                $scope.temp_measure_list = angular.copy($scope.inspectInfo.measure_list) || [];

                $scope.measureInfo = {
                    measurement: "",
                };

                $scope.addMeasure = function() {
                    $scope.setFocusMe(false);
                    if (commonService.isNull($scope.measureInfo.measurement)) {
                        $scope.setFocusMe(true);
                        return;
                    }

                    $scope.temp_measure_list.unshift({
                        measurement: angular.copy($scope.measureInfo.measurement)
                    });

                    if ($scope.temp_measure_list.length > $scope.inspectInfo.sampling_qty) {
                        // 顯示提示 "測量值單身數量大於檢驗數量！"
                        showPointPop($scope.langs.measure_list_more_than_sampling_qty, function() {
                            $scope.measureInfo.measurement = "";
                            $scope.setFocusMe(true);
                        });
                        return;
                    } else {
                        $scope.measureInfo.measurement = "";
                        $scope.setFocusMe(true);
                    }
                }

                $scope.delMeasure = function(index) {
                    $ionicListDelegate.closeOptionButtons();
                    $scope.temp_measure_list.splice(index, 1);
                };

                $scope.setMeasureList = function() {
                    var message = "";
                    var isShowPoint = false;
                    if ($scope.temp_measure_list.length > $scope.inspectInfo.sampling_qty) {
                        isShowPoint = true;
                        // 顯示提示 "測量值單身數量大於檢驗數量！"
                        message = $scope.langs.measure_list_more_than_sampling_qty;
                    }

                    if ($scope.temp_measure_list.length < $scope.inspectInfo.sampling_qty) {
                        isShowPoint = true;
                        // 顯示提示 "測量值單身數量小於檢驗數量！"
                        message = $scope.langs.measure_list_less_than_sampling_qty;
                    }

                    if (isShowPoint) {
                        showPointPop(message, function() {
                            tempToInspectInfo();
                        });
                        return;
                    }
                    tempToInspectInfo();
                };

                var tempToInspectInfo = function() {
                    var tempArray = [];
                    for (var i = 0; i < $scope.temp_measure_list.length; i++) {
                        var element = $scope.temp_measure_list[i];
                        tempArray.push({
                            "seq": i + 1,
                            "measurement": element.measurement
                        })
                    }
                    $scope.inspectInfo.measure_list = tempArray;
                    $scope.closeMeasureModal();
                };

                $ionicModal.fromTemplateUrl('views/app/fil_16/fil_16_03/fil_16_03_s02/fil_16_03_s02_02.html', {
                    scope: $scope
                }).then(function(modal) {
                    $scope.closeMeasureModal = function() {
                        modal.hide().then(function() {
                            return modal.remove();
                        });
                    };
                    modal.show();
                });
            };

            //跳出不良掃描頁面
            $scope.showAbnormal = function() {
                $scope.temp_reason_list = angular.copy($scope.inspectInfo.reason_list) || [];

                $scope.addReason = function(temp) {
                    $scope.temp_reason_list.unshift(angular.copy(temp));
                };

                //刪除不良原因
                $scope.delReason = function(index) {
                    $ionicListDelegate.closeOptionButtons();
                    $scope.temp_reason_list.splice(index, 1);
                };

                $scope.setReasonList = function() {
                    var tempArray = [];
                    for (var i = 0; i < $scope.temp_reason_list.length; i++) {
                        var element = $scope.temp_reason_list[i];
                        tempArray.push({
                            "seq": i + 1,
                            "abnormal_no": element.abnormal_no,
                            "defect_qty": element.defect_qty,
                        })
                    }
                    $scope.inspectInfo.reason_list = tempArray;
                    $scope.closeAbnormalModal();
                };

                $ionicModal.fromTemplateUrl('views/app/fil_16/fil_16_03/fil_16_03_s02/fil_16_03_s02_03.html', {
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
            $scope.insertReason = function() {

                //初始化不良原因物件
                $scope.sub = {
                    abnormal_no: "",
                    abnormal_name: "",
                    defect_qty: 0
                };

                //搜索撈取WS
                $scope.scanned = function(value) {
                    app_abnormal_get(value);
                };

                //数量弹窗
                $scope.selAbnormalQtyPop = function(type) {
                    var maxqty = "none";
                    var minqty = "none";
                    var qty = $scope.sub.defect_qty;
                    commonFactory.showQtyPopup(type, qty, maxqty, minqty, "QC").then(function(res) {
                        if (typeof res !== "undefined") {
                            $scope.sub.defect_qty = res;
                        }
                    });
                    return;
                };

                //計算加減後數值
                $scope.selAbnormalCompute = function(type, arg1, arg2) {
                    var num = numericalAnalysisService.accAdd(arg1, arg2);
                    if (num < 0) {
                        num = 0;
                    }
                    $scope.sub.defect_qty = num;
                };

                $scope.changeReasonCode = function(item) {
                    $scope.sub.abnormal_no = item.abnormal_no;
                    $scope.sub.abnormal_name = item.abnormal_name;
                };

                $scope.setReasonCode = function() {
                    console.log($scope.sub);
                    var item = angular.copy($scope.sub);
                    if (item.abnormal_no.length <= 0) {
                        return;
                    }

                    if (item.defect_qty <= 0) {
                        userInfoService.getVoice($scope.langs.input_defect_qty_error, function() {});
                        return;
                    }

                    var index = $scope.temp_reason_list.findIndex(function(element) {
                        return commonService.isEquality(element.abnormal_no, item.abnormal_no);
                    });

                    if (index !== -1) {
                        userInfoService.getVoice($scope.langs.data_duplication_error, function() {});
                        return;
                    }
                    $scope.addReason(item);
                    $scope.closeSelAbnormalModal();
                };

                var app_abnormal_get = function(value) {
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

                if ($scope.reasonCodes.length <= 0) {
                    app_abnormal_get('%');
                }

                $ionicModal.fromTemplateUrl('views/app/fil_16/fil_16_03/fil_16_03_s02/fil_16_03_s02_04.html', {
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

            $scope.checkSubmit = function() {
                for (var i = 0; i < $scope.showInfo.inspect_list.length; i++) {
                    var element = $scope.showInfo.inspect_list[i];
                    if (!angular.isArray(element.reason_list)) {
                        $scope.showInfo.inspect_list[i].reason_list = [];
                    }
                    if (!angular.isArray(element.measure_list)) {
                        $scope.showInfo.inspect_list[i].measure_list = [];
                    }
                }
                submit();
            };

            var submit = function() {
                var webTran = {
                    service: 'app.qc.create',
                    parameter: {
                        "site_no": userInfoService.userInfo.site_no,
                        "program_job_no": $scope.page_params.program_job_no,
                        "scan_type": "4",
                        "analysis_symbol": userInfoService.userInfo.barcode_separator,
                        "status": $scope.page_params.status,
                        "scan_doc_no": $scope.showInfo.source_no,
                        "doc_no": $scope.showInfo.source_no,
                        "run_card_no": $scope.showInfo.run_card_no,
                        "seq": $scope.showInfo.seq,
                        "doc_line_seq": $scope.showInfo.doc_line_seq,
                        "op_no": $scope.showInfo.op_no,
                        "item_no": $scope.showInfo.item_no,
                        "item_feature_no": $scope.showInfo.item_feature_no,
                        "lot_no": $scope.showInfo.lot_no,
                        "scan_employee_no": userInfoService.userInfo.account,
                        "ok_qty": 0,
                        "return_qty": 0,
                        "surplus_qty": 0,
                        "reference_unit_no": $scope.showInfo.reference_unit_no,
                        "reference_qty": $scope.showInfo.reference_qty,
                        "reason_list": $scope.showInfo.scraps,
                        "inspect_list": $scope.showInfo.inspect_list,
                    }
                };
                console.log(webTran);
                $ionicLoading.show();
                APIService.Web_Post(webTran, function(res) {
                    $ionicLoading.hide();
                    // console.log("success:" + angular.toJson(res));
                    var parameter = res.payload.std_data.parameter;
                    IonicPopupService.successAlert(parameter.doc_no).then(function() {
                        $state.go("fil_16_03_s01");
                    });
                }, function(error) {
                    $ionicLoading.hide();
                    var execution = error.payload.std_data.execution;
                    console.log("error:" + execution.description);
                    userInfoService.getVoice(execution.description, function() {
                        $scope.setFocusMe(true);
                    });
                });
            };

        }
    ];
});