define(["API", "APIS", 'AppLang', 'views/app/fil_common/requisition.js', 'array', 'Directives', 'ReqTestData', 'ionic-popup',
    'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService'
], function() {
    return ['$scope', '$state', '$stateParams', '$timeout', '$filter', 'AppLang', 'APIService', 'APIBridge',
        '$ionicLoading', '$ionicPopup', '$ionicModal', '$ionicListDelegate', 'IonicPopupService', 'IonicClosePopupService',
        'fil_common_requisition', 'ReqTestData', 'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService',
        function($scope, $state, $stateParams, $timeout, $filter, AppLang, APIService, APIBridge,
            $ionicLoading, $ionicPopup, $ionicModal, $ionicListDelegate, IonicPopupService, IonicClosePopupService,
            fil_common_requisition, ReqTestData, circulationCardService, commonFactory, commonService, userInfoService, scanTypeService, numericalAnalysisService) {

            //變數初始化區塊 (S)-------------------------------------------------
            $scope.subView = true;
            //變數初始化區塊 (E)-------------------------------------------------

            //調用相機 進行掃描條碼
            $scope.scan = function() {
                console.log("scanBarcode");
                $scope.clearScanning();
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

            $scope.clear_list_array();

            //掃苗框按下 enter 鍵後執行
            $scope.scanned = function(value) {
                $scope.checkScan(value.trim());
            };

            //檢查掃描後相關資訊
            $scope.checkScan = function(scanning) {
                $scope.clearScanning();
                $scope.setFocusMe(false);
                if (commonService.isNull(scanning)) {
                    return;
                }

                if ($scope.scaninfo.in_the_scan) {
                    return;
                }
                $scope.init_scan_time_log();
                $scope.add_scan_time_log("開始掃描");
                $scope.inTheScan(true);

                // 判斷掃描是否為倉庫卡
                var index = 0;
                var warehouse_separator = userInfoService.userInfo.warehouse_separator || "@";
                index = scanning.indexOf(warehouse_separator);
                var seq = "";
                if (index != -1) {
                    var obj = {};
                    obj = circulationCardService.checkWarehouseCard(scanning, warehouse_separator);

                    //取得倉庫資訊
                    index = userInfoService.warehouseIndex[obj.warehouse_no];
                    if (!angular.isUndefined(index)) { //存在於倉庫基本檔
                        $scope.setwarehouse(userInfoService.warehouse[index]);
                    }

                    index = $scope.sel_in_storage.findIndex(function(item) {
                        return obj.storage_spaces_no == item.storage_spaces_no;
                    });

                    if (index !== -1) { //存在於儲位基本檔
                        $scope.setstorage($scope.sel_in_storage[index]);
                    }
                    $scope.inTheScan(false);
                    return;
                } else {
                    //取得倉庫資訊
                    index = userInfoService.warehouseIndex[scanning];
                    if (!angular.isUndefined(index)) { //存在於倉庫基本檔
                        $scope.setwarehouse(userInfoService.warehouse[index]);
                        $scope.inTheScan(false);
                        return;
                    }

                    index = $scope.sel_in_storage.findIndex(function(item) {
                        return scanning == item.storage_spaces_no;
                    });

                    if (index !== -1) { //存在於儲位基本檔
                        $scope.setstorage($scope.sel_in_storage[index]);
                        $scope.inTheScan(false);
                        return;
                    }
                }

                //調撥檢查撥出倉及撥入倉 warehouse_cost
                if ($scope.l_data.show_ingoing) {
                    //取得倉庫資訊
                    index = userInfoService.warehouseIndex[$scope.sel_indicate.warehouse_no] || 0;
                    var out_warehouse_cost = userInfoService.warehouse[index].warehouse_cost || "N";
                    if (!commonService.isEquality($scope.scaninfo.warehouse_cost, out_warehouse_cost)) {
                        //顯示錯誤 "撥出倉儲及撥入倉儲，必須同為成本倉或同為非成本倉！"
                        userInfoService.getVoice($scope.langs.outing_warehouse_cost_error, function() {
                            $scope.setFocusMe(true);
                            $scope.inTheScan(false);
                        });
                        return;
                    }
                }

                // 入項/調撥 檢查是否有使用儲位管理
                if ($scope.page_params.in_out_no == "1" || $scope.page_params.program_job_no == "13-1" || $scope.page_params.program_job_no == "13-2" || $scope.page_params.program_job_no == "13-5") {
                    if ($scope.scaninfo.storage_management == "Y") {
                        if (commonService.isNull($scope.scaninfo.storage_spaces_no)) {
                            //顯示錯誤 "此倉庫使用儲位管理，請選擇儲位！"
                            userInfoService.getVoice($scope.langs.storage_management_error, function() {
                                $scope.setFocusMe(true);
                                $scope.inTheScan(false);
                            });
                            return;
                        }
                    }
                }

                // T系列 檢查 雜收發新單/報廢過帳 理由碼不可為空
                if ($scope.l_data.show_reason) {
                    if (commonService.isNull($scope.scaninfo.reason_code)) {
                        //顯示錯誤 "理由碼不可為空！"
                        userInfoService.getVoice($scope.langs.reason_no_error, function() {
                            $scope.setFocusMe(true);
                            $scope.inTheScan(false);
                        });
                        return;
                    }
                }
                app_doc_bc_get(scanning, $scope.scaninfo.warehouse_no, $scope.scaninfo.storage_spaces_no, $scope.scaninfo.lot_no);
            };

            var app_doc_bc_get = function(barcode_no, warehouse_no, storage_spaces_no, lot_no) {

                var service = "";
                var parameter = {
                    "program_job_no": $scope.page_params.program_job_no,
                    "status": $scope.page_params.status,
                    "barcode_no": barcode_no,
                    "warehouse_no": warehouse_no,
                    "storage_spaces_no": storage_spaces_no,
                    "lot_no": lot_no,
                    "inventory_management_features": "",
                    "info_id": $scope.l_data.info_id,
                    "site_no": userInfoService.userInfo.site_no
                };
                //依作業別設定 WS 參數
                switch ($scope.page_params.program_job_no) {
                    case "1":
                    case "3":
                    case "9":
                        var scan_type = $scope.page_params.scan_type;
                        service = "app.doc.bc.get";
                        parameter_add = {
                            "scan_type": scan_type,
                            "analysis_symbol": userInfoService.userInfo.barcode_separator,
                        };
                        parameter = angular.extend(parameter, parameter_add);
                        break;
                    default:
                        service = "app.barcode.get";
                        parameter_add = {
                            "param_master": $scope.page_params.doc_array,
                        };
                        parameter = angular.extend(parameter, parameter_add);
                        //調撥 倉儲為撥出倉儲 帶入撥出倉庫
                        if ($scope.l_data.show_ingoing) {
                            parameter.warehouse_no = $scope.sel_indicate.warehouse_no || " ";
                            parameter.storage_spaces_no = "";
                            parameter.lot_no = "";
                        }
                        break;
                }
                $scope.add_scan_time_log("呼叫條碼WS");
                var webTran = {
                    service: service,
                    parameter: parameter
                };
                console.log(webTran);
                $ionicLoading.show();
                APIService.Web_Post(webTran, function(res) {
                    $ionicLoading.hide();
                    $scope.add_scan_time_log("取得條碼WS回傳資料");
                    // console.log("success:" + angular.toJson(res));
                    var parameter = res.payload.std_data.parameter;
                    fil_common_requisition.setParameter(parameter);
                    selectBarcodedata(barcode_no, parameter.barcode_detail);
                }, function(error) {
                    $ionicLoading.hide();
                    var execution = error.payload.std_data.execution;
                    console.log("error:" + execution.description);
                    userInfoService.getVoice(execution.description, function() {
                        $scope.setFocusMe(true);
                        $scope.inTheScan(false);
                    });
                });
            };

            //依WS回傳的 barcode_detail 進行判斷批號或是條碼陣列
            var selectBarcodedata = function(barcode_no, barcode_detail) {

                // WS 回傳條碼資訊若為零
                if (barcode_detail.length === 0) {
                    //檢查長度是否為批號
                    if (barcode_no.length <= userInfoService.userInfo.lot_length && !($scope.page_params.program_job_no == "13-1" || $scope.page_params.program_job_no == "13-2")) {
                        //彈出詢問 "是否為批號" 視窗
                        showLotPopup(barcode_no);
                    } else {
                        //顯示錯誤 "barcode_no 不存在或無效！"
                        userInfoService.getVoice(barcode_no + $scope.langs.not_exist_or_invalid, function() {
                            $scope.setFocusMe(true);
                            $scope.inTheScan(false);
                        });
                    }
                    return;
                }

                //是否為箱條碼預設為 N
                var is_packing_barcode = false;

                //有來源單據 檢查回傳條碼資訊料件編號是否與單據相同
                if ($scope.l_data.has_source) {
                    $scope.add_scan_time_log("檢查回傳條碼資訊料件編號是否與單據相同");
                    //非裝箱條碼 只檢查第一筆
                    //packing_barcode 有值且不為 "N" 則判斷為裝箱條碼
                    if (!commonService.isNull(barcode_detail[0].packing_barcode) &&
                        !commonService.isEquality(barcode_detail[0].packing_barcode, "N")) {
                        is_packing_barcode = true;
                    }
                    var barcodedata_length = (!is_packing_barcode) ? 1 : barcode_detail.length;
                    var sourceDocDetail = fil_common_requisition.getSourceDocDetail();
                    var flag = true;
                    for (var i = 0; i < barcodedata_length; i++) {
                        var element = barcode_detail[i];
                        var exist_flag = false;
                        for (var j = 0; j < sourceDocDetail.length; j++) {
                            var value = sourceDocDetail[j];
                            if (commonService.isEquality(value.item_no, element.item_no) &&
                                commonService.isEquality(value.item_feature_no, element.item_feature_no)) {
                                exist_flag = true;
                                break;
                            }
                        }
                        if (!exist_flag) {
                            flag = false;
                            break;
                        }
                    }

                    if (!flag) {
                        //顯示錯誤 "條碼對應的物料不存在於單據！"
                        userInfoService.getVoice($scope.langs.barcode_material_different_error, function() {
                            $scope.setFocusMe(true);
                            $scope.inTheScan(false);
                        });
                        return;
                    }
                }

                //出項 跳出條碼選擇窗
                if ($scope.page_params.in_out_no == "-1") {
                    $scope.scaninfo.directly_added = !is_packing_barcode;
                    var insert_flag = true;
                    for (var i = 0; i < barcode_detail.length; i++) {
                        var element = barcode_detail[i];

                        //非裝箱條碼 給予 packing_barcode 預設值為 "N"
                        if (!is_packing_barcode) {
                            element.packing_barcode = "N";
                            continue;
                        }

                        //裝箱條碼 直接每筆新增進掃描明細
                        insert_flag = checkStorageLot(element);
                        if (!insert_flag) {
                            break;
                        }
                    }

                    //裝箱條碼檢查是否新增無誤
                    if (is_packing_barcode) {
                        if (insert_flag) {
                            $scope.TempDetailToScanningDetail();
                        } else {
                            //顯示錯誤 "此裝箱條碼對應的條碼資料不符合單據，此筆掃描資料不新增至掃描明細！"
                            userInfoService.getVoice($scope.langs.packing_barcode_error, function() {
                                $scope.setFocusMe(true);
                                $scope.inTheScan(false);
                            });
                        }
                        $scope.clearTempDetail();
                        return;
                    }

                    //非裝箱條碼檢查批號或給使用者選擇
                    if (barcode_detail.length == 1) {
                        return checkStorageLot(barcode_detail[0]);
                    }
                    return showSelbarcodedataModal(barcode_detail);
                }

                //入項 檢查是否有相同倉儲條碼 若無相同 依回傳資訊建立建立該倉儲批的條碼資訊
                if ($scope.page_params.in_out_no == "1" || $scope.page_params.in_out_no == "0") {
                    var index = -1;
                    if ($scope.page_params.program_job_no == "13-3" || $scope.page_params.program_job_no == "13-5") {
                        index = barcode_detail.findIndex(function(item) {
                            return commonService.isEquality(barcode_no, item.barcode_no) &&
                                commonService.isEquality($scope.scaninfo.warehouse_no, item.warehouse_no) &&
                                commonService.isEquality($scope.scaninfo.storage_spaces_no, item.storage_spaces_no);
                        });
                    } else {
                        index = barcode_detail.findIndex(function(item) {
                            return commonService.isEquality(barcode_no, item.barcode_no) &&
                                commonService.isEquality($scope.scaninfo.warehouse_no, item.warehouse_no) &&
                                commonService.isEquality($scope.scaninfo.storage_spaces_no, item.storage_spaces_no) &&
                                commonService.isEquality($scope.scaninfo.lot_no, item.lot_no);
                        });
                    }

                    //2.箱條碼 入項 計算總庫存量
                    var all_barcode_inventory_qty = 0;
                    if (barcode_detail[0].barcode_type == "2") {
                        angular.forEach(barcode_detail, function(value) {
                            if (commonService.isEquality(barcode_no, value.barcode_no)) {
                                all_barcode_inventory_qty = numericalAnalysisService.accAdd(all_barcode_inventory_qty, value.inventory_qty);
                            }
                        });
                    }

                    if (index != -1) {
                        var barcode_info = barcode_detail[index];
                        if (barcode_info.barcode_type == "2") {
                            barcode_info.inventory_qty = all_barcode_inventory_qty;
                        }
                        checkStorageLot(barcode_info);
                    } else {
                        var barcode_info = barcode_detail[0];
                        if (barcode_info.barcode_type == "2") {
                            barcode_info.inventory_qty = all_barcode_inventory_qty;
                        }
                        var new_barcode_info = {
                            "barcode_type": barcode_info.barcode_type,
                            "barcode_no": barcode_info.barcode_no,
                            "item_no": barcode_info.item_no,
                            "item_name": barcode_info.item_name,
                            "item_spec": barcode_info.item_spec,
                            "item_feature_no": barcode_info.item_feature_no,
                            "item_feature_name": barcode_info.item_feature_name,
                            "warehouse_no": ($scope.page_params.program_job_no == "13-3" || $scope.page_params.program_job_no == "13-5") ? barcode_info.warehouse_no : $scope.scaninfo.warehouse_no,
                            "warehouse_name": ($scope.page_params.program_job_no == "13-3" || $scope.page_params.program_job_no == "13-5") ? " " : $scope.scaninfo.warehouse_name,
                            "storage_spaces_no": ($scope.page_params.program_job_no == "13-3" || $scope.page_params.program_job_no == "13-5") ? barcode_info.storage_spaces_no : $scope.scaninfo.storage_spaces_no,
                            "storage_spaces_name": ($scope.page_params.program_job_no == "13-3" || $scope.page_params.program_job_no == "13-5") ? " " : $scope.scaninfo.storage_spaces_name,
                            "lot_no": barcode_info.lot_no,
                            "barcode_lot_no": barcode_info.barcode_lot_no,
                            "inventory_unit": barcode_info.inventory_unit,
                            "barcode_qty": barcode_info.barcode_qty || 0,
                            "inventory_qty": barcode_info.inventory_qty || 0,
                            "lot_control_type": barcode_info.lot_control_type,
                            "inventory_management_features": barcode_info.inventory_management_features,
                            "reference_qty": barcode_info.reference_qty || 0,
                            "reference_unit_no": barcode_info.reference_unit_no || "",
                            "source_no": barcode_info.source_no,
                            "source_seq": barcode_info.source_seq,
                            "source_line_seq": barcode_info.source_line_seq,
                            "source_batch_seq": barcode_info.source_batch_seq,
                            "multi_unit_type": barcode_info.multi_unit_type || "1",
                            "packing_barcode": barcode_info.packing_barcode || "N",
                            "packing_qty": barcode_info.packing_qty || 0,
                        };
                        checkStorageLot(new_barcode_info);
                    }
                }
            };

            //彈出詢問 "是否為批號" 視窗
            var showLotPopup = function(barcode_no) {
                var LotPopup = $ionicPopup.show({
                    title: $scope.langs.checkField + $scope.langs.lot,
                    scope: $scope,
                    buttons: [{
                        text: $scope.langs.cancel,
                        onTap: function() {
                            //顯示錯誤 "barcode_no 不存在或無效！"
                            userInfoService.getVoice(barcode_no + $scope.langs.not_exist_or_invalid, function() {
                                $scope.setFocusMe(true);
                                $scope.inTheScan(false);
                            });
                        }
                    }, {
                        text: $scope.langs.confirm,
                        onTap: function() {
                            //設定批號值
                            $scope.scaninfo.lot_no = barcode_no;
                            $scope.setFocusMe(true);
                            $scope.inTheScan(false);
                        }
                    }]
                });
                IonicClosePopupService.register(false, LotPopup);
                return;
            };

            //出項 條碼多倉儲批選擇頁面
            var showSelbarcodedataModal = function(barcode_detail) {

                $ionicModal.fromTemplateUrl('views/app/common/html/selbarcodedata.html', {
                    scope: $scope
                }).then(function(modal) {
                    $scope.selbarcodedata = barcode_detail;
                    $scope.show_check_box = false;
                    if (barcode_detail[0].barcode_type == "3") {
                        $scope.show_check_box = true;
                    }

                    $scope.seldata = function(barcode_info) {
                        $scope.close();
                        checkStorageLot(barcode_info);
                    };

                    $scope.seldataMultiple = function(data) {
                        if (data.length) {
                            angular.forEach(data, function(item) {
                                if (item.checked) $scope.seldata(item);
                            });
                        }
                    };

                    $scope.close = function() {
                        $scope.setFocusMe(true);
                        $scope.inTheScan(false);
                        modal.hide().then(function() {
                            return modal.remove();
                        });
                    };
                    modal.show();
                });
            };

            // 批號取得順序：單據批號＞條碼批 barcode_info.barcode_lot_no ＞條碼批號 barcode_info.lot_no ＞畫面批號
            var checkStorageLot = function(barcode_info) {
                //若無倉儲批值 由APP預帶
                if ($scope.l_data.show_ingoing) {
                    //調撥 倉庫為撥出倉庫 儲位、批號為空白
                    if (commonService.isNull(barcode_info.warehouse_no)) {
                        barcode_info.warehouse_no = $scope.sel_indicate.warehouse_no;
                    }
                    if (commonService.isNull(barcode_info.storage_spaces_no)) {
                        barcode_info.storage_spaces_no = " ";
                    }

                    if ($scope.page_params.program_job_no !== "13-3" && !(userInfoService.userInfo.gp_flag && $scope.page_params.program_job_no == "13-5")) {
                        //調撥 檢查倉庫是否為撥出倉庫
                        if (!commonService.isEquality($scope.sel_indicate.warehouse_no, barcode_info.warehouse_no)) {
                            //顯示錯誤 "無此條碼！"
                            userInfoService.getVoice($scope.langs.not + $scope.langs.these + $scope.langs.barcode, function() {
                                $scope.setFocusMe(true);
                                $scope.inTheScan(false);
                            });
                            return false;
                        }
                    }
                } else {
                    //倉庫、儲位、批號預設為畫面上倉庫、儲位、批號值
                    if (commonService.isNull(barcode_info.warehouse_no)) {
                        barcode_info.warehouse_no = $scope.scaninfo.warehouse_no;
                    }
                    if (commonService.isNull(barcode_info.storage_spaces_no)) {
                        barcode_info.storage_spaces_no = $scope.scaninfo.storage_spaces_no;
                    }
                }

                //調撥 檢查 撥出倉儲不可等於撥入倉儲！
                if ($scope.l_data.show_ingoing) {
                    if (commonService.isEquality(barcode_info.warehouse_no, $scope.scaninfo.warehouse_no) &&
                        commonService.isEquality(barcode_info.storage_spaces_no, $scope.scaninfo.storage_spaces_no)) {
                        //顯示錯誤 "撥出倉儲不可等於撥入倉儲！"
                        userInfoService.getVoice($scope.langs.outgoing_warehouse_no_error, function() {
                            $scope.setFocusMe(true);
                            $scope.inTheScan(false);
                        });
                        return false;
                    }
                }

                if (!commonService.isNull(barcode_info.barcode_lot_no)) {
                    barcode_info.lot_no = barcode_info.barcode_lot_no;
                }

                if (commonService.isNull(barcode_info.lot_no)) {
                    barcode_info.lot_no = $scope.scaninfo.lot_no;
                }

                if ($scope.page_params.in_out_no == "-1" || $scope.page_params.program_job_no == "13-3") {
                    return checkDirective(barcode_info);
                }

                $scope.add_scan_time_log("入項 批號管控");
                //入項 批號管控
                // 1. 必須有批號：當批號欄位沒有輸入值時，需要POP窗給使用者輸入
                if (barcode_info.lot_control_type == "1" && ($scope.page_params.in_out_no != "0" || userInfoService.userInfo.gp_flag)) {
                    return lot_control_type_1(barcode_info);
                }

                // 2. 不可有批號： APP有輸入批號時　Y： 把批號清空新增　 N： 不新增到掃描明細
                if (barcode_info.lot_control_type == "2") {
                    return lot_control_type_2(barcode_info);
                }
                // 3. 不控管
                return lot_control_type_3(barcode_info);
            };

            //檢查是否依照先進先出
            var checkDirective = function(barcode_info) {
                if (!$scope.l_data.show_directive) {
                    return setTempGood(barcode_info);
                }
                $scope.add_scan_time_log("檢查是否依照先進先出");
                var first_in_first_out_control = "N";
                var sourceDocDetail = fil_common_requisition.getSourceDocDetail();
                var index = sourceDocDetail.findIndex(function(element) {
                    return commonService.isEquality(barcode_info.item_no, element.item_no) &&
                        commonService.isEquality(barcode_info.item_feature_no, element.item_feature_no);
                });
                if (index != -1) {
                    first_in_first_out_control = sourceDocDetail[index].first_in_first_out_control;
                }

                var flag = true;
                if (first_in_first_out_control == "Y" || first_in_first_out_control == "W") {
                    flag = false;
                    for (var i = 0; i < $scope.inventory_detail_all.length; i++) {
                        var element = $scope.inventory_detail_all[i];
                        if (commonService.isEquality(element.barcode_no, barcode_info.barcode_no) &&
                            commonService.isEquality(element.warehouse_no, barcode_info.warehouse_no) &&
                            commonService.isEquality(element.storage_spaces_no, barcode_info.storage_spaces_no) &&
                            commonService.isEquality(element.lot_no, barcode_info.lot_no) &&
                            commonService.isEquality(element.inventory_management_features, barcode_info.inventory_management_features)) {
                            flag = true;
                            break;
                        }
                    }
                }

                if (flag) {
                    return setTempGood(barcode_info);
                } else {

                    if (first_in_first_out_control == "Y") {
                        //顯示錯誤 "掃描條碼資料不存發料指示中，不可新增至掃描明細中！"
                        userInfoService.getVoice($scope.langs.first_in_first_out_control_Y, function() {
                            $scope.setFocusMe(true);
                            $scope.inTheScan(false);
                        });
                        return false;
                    }

                    if (first_in_first_out_control == "W") {
                        if (barcode_info.packing_barcode != "N") {
                            return setTempGood(barcode_info);
                        }

                        // 顯示提示 "掃描條碼資料不存發料指示中！"
                        var checkDirectivePointPop = $ionicPopup.show({
                            title: $scope.langs.point,
                            template: "<p style='text-align: center'>" + $scope.langs.first_in_first_out_control_W + "</p>",
                            scope: $scope,
                            buttons: [{
                                text: $scope.langs.confirm,
                                onTap: function() {
                                    $scope.setFocusMe(true);
                                    $scope.inTheScan(false);
                                    setTempGood(barcode_info);
                                }
                            }]
                        });
                        return false;
                    }
                }
            };

            // 1. 必須有批號：當批號欄位沒有輸入值時，需要POP窗給使用者輸入
            var lot_control_type_1 = function(barcode_info) {
                if (!commonService.isNull(barcode_info.lot_no)) {
                    return setTempGood(barcode_info);
                }

                var isShowLotPopup = true;
                if ($scope.l_data.has_source) {
                    isShowLotPopup = false;
                    console.log(fil_common_requisition.computed_doc_detail);
                    //檢查單據各項次是否有缺少批號
                    for (var i = 0; i < fil_common_requisition.computed_doc_detail.length; i++) {
                        var element = fil_common_requisition.computed_doc_detail[i];
                        if (commonService.isEquality(element.item_no, barcode_info.item_no) &&
                            commonService.isEquality(element.item_feature_no, barcode_info.item_feature_no)) {
                            if (commonService.isNull(element.lot_no)) {
                                isShowLotPopup = true;
                                break;
                            }
                        }
                    }
                }

                if (!commonService.isNull($scope.scaninfo.lot_no)) {
                    isShowLotPopup = false;
                    barcode_info.lot_no = $scope.scaninfo.lot_no;
                    if ($scope.l_data.has_source) {
                        setDocLot(barcode_info);
                    }
                    return setTempGood(barcode_info);
                }

                //單據缺少批號 且 畫面無批號 POP窗給使用者輸入
                if (isShowLotPopup) {
                    commonFactory.showLotPopup($scope.scaninfo.lot_no).then(function(res) {
                        if (!commonService.isNull(res)) {
                            $scope.scaninfo.lot_no = res;
                            barcode_info.lot_no = res;
                            if ($scope.l_data.has_source) {
                                setDocLot(barcode_info);
                            }
                            return setTempGood(barcode_info);
                        } else {
                            //顯示錯誤 "料號批號管控為必須要有批號，因未輸入批號，不新增至掃描資料！"
                            userInfoService.getVoice($scope.langs.lot_control_error, function() {
                                $scope.setFocusMe(true);
                                $scope.inTheScan(false);
                            });
                        }
                    });
                    return;
                }
                return setTempGood(barcode_info);
            };

            // 2. 不可有批號： APP有輸入批號時　Y： 把批號清空新增　 N： 不新增到掃描明細
            var lot_control_type_2 = function(barcode_info) {
                var isShowLotPopup = false;

                //有來源單據 檢查每個項次是否有批號
                if ($scope.l_data.has_source) {
                    console.log(fil_common_requisition.computed_doc_detail);
                    for (var i = 0; i < fil_common_requisition.computed_doc_detail.length; i++) {
                        var element = fil_common_requisition.computed_doc_detail[i];
                        if (commonService.isEquality(element.item_no, barcode_info.item_no) &&
                            commonService.isEquality(element.item_feature_no, barcode_info.item_feature_no) &&
                            !commonService.isNull(element.lot_no)) {
                            isShowLotPopup = true;
                            break;
                        }
                    }
                }

                //檢查條碼資訊中批號欄位 及 畫面批號欄位
                if (!commonService.isNull(barcode_info.lot_no) || !commonService.isNull($scope.scaninfo.lot_no)) {
                    isShowLotPopup = true;
                }

                if (isShowLotPopup) {
                    var LotPopup = $ionicPopup.show({
                        title: $scope.langs.point,
                        template: "<p style='text-align: center'>" + $scope.langs.lot_control_point + "</p>",
                        scope: $scope,
                        buttons: [{
                            text: $scope.langs.cancel,
                            onTap: function() {
                                $scope.setFocusMe(true);
                                $scope.inTheScan(false);
                            }
                        }, {
                            text: $scope.langs.confirm,
                            onTap: function() {
                                barcode_info.lot_no = " ";
                                $scope.scaninfo.lot_no = " ";
                                setDocLot(barcode_info);
                                setTempGood(barcode_info);
                            }
                        }]
                    });
                    IonicClosePopupService.register(false, LotPopup);
                    return;
                }
                return setTempGood(barcode_info);
            };

            // 3. 不控管
            var lot_control_type_3 = function(barcode_info) {
                if (!commonService.isNull(barcode_info.lot_no)) {
                    return setTempGood(barcode_info);
                }
                //有來源單據
                if ($scope.l_data.has_source) {
                    console.log(fil_common_requisition.computed_doc_detail);
                    angular.forEach(fil_common_requisition.computed_doc_detail, function(value) {
                        if (commonService.isEquality(value.item_no, barcode_info.item_no) &&
                            commonService.isEquality(value.item_feature_no, barcode_info.item_feature_no) &&
                            commonService.isNull(value.lot_no)) {
                            value.lot_no = $scope.scaninfo.lot_no;
                        }
                    });

                    for (var i = 0; i < fil_common_requisition.computed_doc_detail.length; i++) {
                        var element = fil_common_requisition.computed_doc_detail[i];
                        if (commonService.isEquality(element.item_no, barcode_info.item_no) &&
                            commonService.isEquality(element.item_feature_no, barcode_info.item_feature_no) &&
                            !commonService.isNull(element.lot_no)) {
                            isShowLotPopup = true;
                            break;
                        }
                    }
                } else {
                    barcode_info.lot_no = $scope.scaninfo.lot_no;
                }
                return setTempGood(barcode_info);
            };

            //設定單據批號
            var setDocLot = function(barcode_info) {
                $scope.add_scan_time_log("設定單據批號");
                angular.forEach(fil_common_requisition.computed_doc_detail, function(value) {
                    if (barcode_info.lot_control_type == "1") {
                        if (commonService.isEquality(value.item_no, barcode_info.item_no) &&
                            commonService.isEquality(value.item_feature_no, barcode_info.item_feature_no) &&
                            commonService.isNull(value.lot_no)) {
                            value.lot_no = $scope.scaninfo.lot_no;
                        }
                    }
                    if (barcode_info.lot_control_type == "2") {
                        if (commonService.isEquality(value.item_no, barcode_info.item_no) &&
                            commonService.isEquality(value.item_feature_no, barcode_info.item_feature_no)) {
                            value.lot_no = " ";
                        }
                    }
                });
            };

            //設定條碼資訊
            var setTempGood = function(barcode_info) {
                $scope.add_scan_time_log("設定條碼資訊");
                var qty = 0;
                if ($scope.page_params.in_out_no == "-1") {
                    //出項 數量預帶 庫存數量
                    qty = barcode_info.inventory_qty;

                    //出項 裝箱條碼 數量預帶條碼數量
                    if (barcode_info.packing_barcode != "N") {
                        qty = barcode_info.packing_qty;
                    }
                } else {
                    //入項 數量預帶 條碼數量
                    qty = barcode_info.barcode_qty;
                    if ((barcode_info.barcode_type == "2" || barcode_info.barcode_type == "1") && !($scope.page_params.program_job_no == "13-3" || $scope.page_params.program_job_no == "13-5")) {
                        //若是 2.箱條碼 / 1.批條碼  數量 為條碼數量 - 條碼庫存
                        qty = numericalAnalysisService.accSub(barcode_info.barcode_qty, barcode_info.inventory_qty);
                        if (qty <= 0) {
                            //顯示錯誤 "條碼數量不足！"
                            userInfoService.getVoice($scope.langs.barcode + $scope.langs.qty + $scope.langs.insufficient + "！", function() {
                                $scope.setFocusMe(true);
                                $scope.inTheScan(false);
                            });
                            return false;
                        }
                    }
                }

                var temp = {
                    barcode_type: barcode_info.barcode_type,
                    barcode_no: barcode_info.barcode_no,
                    item_no: barcode_info.item_no,
                    item_name: barcode_info.item_name,
                    item_spec: barcode_info.item_spec,
                    item_feature_no: barcode_info.item_feature_no,
                    item_feature_name: barcode_info.item_feature_name,
                    warehouse_no: barcode_info.warehouse_no,
                    warehouse_name: "",
                    storage_spaces_no: barcode_info.storage_spaces_no,
                    storage_spaces_name: "",
                    lot_no: barcode_info.lot_no,
                    unit: barcode_info.inventory_unit,

                    qty: qty,
                    barcode_qty: barcode_info.barcode_qty || 0,
                    maxqty: qty,
                    barcode_inventory_qty: barcode_info.inventory_qty || 0,
                    doc_qty: qty,

                    ingoing_warehouse_no: $scope.scaninfo.warehouse_no, //撥入倉庫
                    ingoing_storage_spaces_no: $scope.scaninfo.storage_spaces_no, //撥入儲位
                    in_transit_cost_warehouse_no: userInfoService.userInfo.warehouse_way_cost, //在途成本倉
                    in_transit_non_cost_warehouse_no: userInfoService.userInfo.warehouse_way, //在途非成本倉
                    run_card_no: "",
                    source_no: "",
                    seq: "",
                    doc_line_seq: "",
                    doc_batch_seq: "",
                    bc_source_no: barcode_info.source_no,
                    bc_source_seq: barcode_info.source_seq,
                    bc_source_line_seq: barcode_info.source_line_seq,
                    bc_source_batch_seq: barcode_info.source_batch_seq,
                    main_organization: "",
                    lot_control_type: barcode_info.lot_control_type,
                    inventory_management_features: barcode_info.inventory_management_features,
                    barcode_lot_no: barcode_info.barcode_lot_no,
                    decimal_places: 0,
                    decimal_places_type: 0,

                    //庫存單位
                    inventory_rate: 0,
                    inventory_unit: "",
                    inventory_qty: 0,

                    //參考單位
                    reference_rate: 0,
                    reference_unit_no: barcode_info.reference_unit_no || "",
                    reference_qty: barcode_info.reference_qty || 0,
                    max_reference_qty: barcode_info.reference_qty || 0,

                    //計價單位
                    valuation_rate: 0,
                    valuation_unit_no: "",
                    valuation_qty: 0,

                    multi_unit_type: barcode_info.multi_unit_type || "1",
                    reason_no: $scope.scaninfo.reason_code, //理由碼
                    reason_name: $scope.scaninfo.reason_code_name, //理由碼

                    packing_barcode: barcode_info.packing_barcode || "N", //是否為裝箱條碼
                    packing_qty: barcode_info.packing_qty || 0, //裝箱數量
                };

                //無來源單 不檢查單據數量，直接依照庫存數新增
                if (!$scope.l_data.has_source) {
                    return checkDuplication(temp);
                }
                return checkDocQty(temp);
            };

            //無來源單據檢查
            var checkDuplication = function(item) {
                var used_qty = 0;
                var isBarcodeDuplication = false;
                $scope.add_scan_time_log("無來源單據檢查 S");
                if ($scope.scanning_detail.length > 0) {
                    //檢查是否已新增至掃描明細
                    for (var k = 0; k < $scope.scanning_detail.length; k++) {
                        var element = $scope.scanning_detail[k];
                        if (!commonService.isEquality(element.barcode_no, item.barcode_no)) {
                            continue;
                        }
                        if ($scope.page_params.in_out_no == "-1") {
                            if (commonService.isEquality(element.barcode_no, item.barcode_no) &&
                                commonService.isEquality(element.warehouse_no, item.warehouse_no) &&
                                commonService.isEquality(element.storage_spaces_no, item.storage_spaces_no) &&
                                commonService.isEquality(element.lot_no, item.lot_no) &&
                                commonService.isEquality(element.inventory_management_features, item.inventory_management_features)) {
                                used_qty = numericalAnalysisService.accAdd(used_qty, element.qty);
                            }
                        } else {
                            used_qty = numericalAnalysisService.accAdd(used_qty, element.qty);
                        }
                        if (commonService.isEquality(element.barcode_no, item.barcode_no) &&
                            commonService.isEquality(element.warehouse_no, item.warehouse_no) &&
                            commonService.isEquality(element.storage_spaces_no, item.storage_spaces_no) &&
                            commonService.isEquality(element.lot_no, item.lot_no) &&
                            commonService.isEquality(element.inventory_management_features, item.inventory_management_features) &&
                            commonService.isEquality(element.ingoing_warehouse_no, item.ingoing_warehouse_no) &&
                            commonService.isEquality(element.ingoing_storage_spaces_no, item.ingoing_storage_spaces_no)) {
                            isBarcodeDuplication = true;
                            break;
                        }
                    }
                }

                //裝箱條碼需一次新增 檢查暫存陣列
                if ($scope.temp_detail.length > 0 && !isBarcodeDuplication) {
                    //檢查是否已新增至掃描明細
                    for (var k = 0; k < $scope.temp_detail.length; k++) {
                        var element = $scope.temp_detail[k];
                        if (!commonService.isEquality(element.barcode_no, item.barcode_no)) {
                            continue;
                        }
                        if ($scope.page_params.in_out_no == "-1") {
                            if (commonService.isEquality(element.barcode_no, item.barcode_no) &&
                                commonService.isEquality(element.warehouse_no, item.warehouse_no) &&
                                commonService.isEquality(element.storage_spaces_no, item.storage_spaces_no) &&
                                commonService.isEquality(element.lot_no, item.lot_no) &&
                                commonService.isEquality(element.inventory_management_features, item.inventory_management_features)) {
                                used_qty = numericalAnalysisService.accAdd(used_qty, element.qty);
                            }
                        } else {
                            used_qty = numericalAnalysisService.accAdd(used_qty, element.qty);
                        }
                        if (commonService.isEquality(element.barcode_no, item.barcode_no) &&
                            commonService.isEquality(element.warehouse_no, item.warehouse_no) &&
                            commonService.isEquality(element.storage_spaces_no, item.storage_spaces_no) &&
                            commonService.isEquality(element.lot_no, item.lot_no) &&
                            commonService.isEquality(element.inventory_management_features, item.inventory_management_features) &&
                            commonService.isEquality(element.ingoing_warehouse_no, item.ingoing_warehouse_no) &&
                            commonService.isEquality(element.ingoing_storage_spaces_no, item.ingoing_storage_spaces_no)) {
                            isBarcodeDuplication = true;
                            break;
                        }
                    }
                }
                $scope.add_scan_time_log("無來源單據檢查 E");
                if (isBarcodeDuplication) {
                    //顯示錯誤 "資料重複！"
                    userInfoService.getVoice($scope.langs.barcode_duplication_error, function() {
                        $scope.setFocusMe(true);
                        $scope.inTheScan(false);
                    });
                    return false;
                }

                return checkBarcodeQty([item], used_qty, item.doc_qty, item.allow_doc_qty);
            };

            var in_warehouse_no = "";
            var in_storage_spaces_no = "";

            //有來源單據檢查
            var checkDocQty = function(item) {
                var flag = false;
                var used_qty = 0;
                var all_doc_qty = 0;
                var all_allow_doc_qty = 0;
                var error_message = "";
                var tempArray = [];
                var isBarcodeDuplication = false;
                $scope.add_scan_time_log("有來源單據檢查 S");
                var sourceDocDetail = fil_common_requisition.getSourceDocDetail();
                for (var i = 0, len = sourceDocDetail.length; i < len; i++) {

                    if (sourceDocDetail[i].allow_doc_qty === 0 ||
                        !commonService.isEquality(sourceDocDetail[i].item_no, item.item_no) ||
                        !commonService.isEquality(sourceDocDetail[i].item_feature_no, item.item_feature_no)) {
                        continue;
                    }

                    in_warehouse_no = item.warehouse_no;
                    in_storage_spaces_no = item.storage_spaces_no;
                    if ($scope.scanning_detail.length > 0) {
                        //取得單據項次剩餘數量，及該項次撥入倉庫
                        angular.forEach($scope.scanning_detail, function(value) {
                            if (commonService.isEquality(value.item_no, sourceDocDetail[i].item_no) &&
                                commonService.isEquality(value.item_feature_no, sourceDocDetail[i].item_feature_no) &&
                                commonService.isEquality(value.source_no, sourceDocDetail[i].source_no) &&
                                commonService.isEquality(value.seq, sourceDocDetail[i].seq) &&
                                commonService.isEquality(value.doc_line_seq, sourceDocDetail[i].doc_line_seq) &&
                                commonService.isEquality(value.doc_batch_seq, sourceDocDetail[i].doc_batch_seq)) {
                                sourceDocDetail[i].doc_qty = numericalAnalysisService.accSub(sourceDocDetail[i].doc_qty, value.qty);
                                sourceDocDetail[i].allow_doc_qty = numericalAnalysisService.accSub(sourceDocDetail[i].allow_doc_qty, value.qty);
                                sourceDocDetail[i].reference_qty = numericalAnalysisService.accSub(sourceDocDetail[i].reference_qty, value.reference_qty);
                                in_warehouse_no = value.warehouse_no;
                                in_storage_spaces_no = value.storage_spaces_no;
                            }
                        });
                    }

                    //裝箱條碼需一次新增 檢查暫存陣列
                    if ($scope.temp_detail.length > 0) {
                        //取得單據項次剩餘數量，及該項次撥入倉庫
                        angular.forEach($scope.temp_detail, function(value) {
                            if (commonService.isEquality(value.item_no, sourceDocDetail[i].item_no) &&
                                commonService.isEquality(value.item_feature_no, sourceDocDetail[i].item_feature_no) &&
                                commonService.isEquality(value.source_no, sourceDocDetail[i].source_no) &&
                                commonService.isEquality(value.seq, sourceDocDetail[i].seq) &&
                                commonService.isEquality(value.doc_line_seq, sourceDocDetail[i].doc_line_seq) &&
                                commonService.isEquality(value.doc_batch_seq, sourceDocDetail[i].doc_batch_seq)) {
                                sourceDocDetail[i].doc_qty = numericalAnalysisService.accSub(sourceDocDetail[i].doc_qty, value.qty);
                                sourceDocDetail[i].allow_doc_qty = numericalAnalysisService.accSub(sourceDocDetail[i].allow_doc_qty, value.qty);
                                sourceDocDetail[i].reference_qty = numericalAnalysisService.accSub(sourceDocDetail[i].reference_qty, value.reference_qty);
                                in_warehouse_no = value.warehouse_no;
                                in_storage_spaces_no = value.storage_spaces_no;
                            }
                        });
                    }

                    //單據項次剩餘數量小於0 跑下一個項次
                    if (Number(sourceDocDetail[i].allow_doc_qty) < 0) {
                        continue;
                    }
                    error_message = "";

                    //調撥 檢查項次撥入倉庫是否相同
                    if ($scope.page_params.program_job_no == "13-3" || $scope.page_params.program_job_no == "13-5") {
                        if (in_warehouse_no && !(userInfoService.userInfo.gp_flag && $scope.page_params.program_job_no == "13-5")) {
                            if (!commonService.isEquality(in_warehouse_no, item.warehouse_no) ||
                                !commonService.isEquality(in_storage_spaces_no, item.storage_spaces_no)) {
                                //顯示錯誤 "相同項次撥入倉儲需一致！"
                                userInfoService.getVoice($scope.langs.allocation_seq_error, function() {
                                    $scope.setFocusMe(true);
                                    $scope.inTheScan(false);
                                });
                                return false;
                            }
                        }
                    }

                    if ($scope.page_params.func == "fil220" || $scope.page_params.func == "fil309") {
                        if (!commonService.isEquality(sourceDocDetail[i].warehouse_no, item.warehouse_no) ||
                            !commonService.isEquality(sourceDocDetail[i].storage_spaces_no, item.storage_spaces_no) ||
                            !commonService.isEquality(sourceDocDetail[i].lot_no, item.lot_no)) {
                            error_message = $scope.langs.barcode_doc_wsl_different_error;
                            continue;
                        }
                    }

                    // 條碼來源單據必須與來源單據一致
                    switch ($scope.page_params.program_job_no) {
                        case "1": // 採購收貨
                        case "3": // 收貨入庫
                        case "9": // 完工入庫
                            if (!commonService.isEquality(sourceDocDetail[i].source_no, item.bc_source_no) ||
                                !commonService.isEquality(sourceDocDetail[i].seq, item.bc_source_seq) ||
                                !commonService.isEquality(sourceDocDetail[i].doc_line_seq, item.bc_source_line_seq) ||
                                !commonService.isEquality(sourceDocDetail[i].doc_batch_seq, item.bc_source_batch_seq)) {
                                error_message = $scope.langs.barcode_doc_origin_different_error;
                                continue;
                            }
                            break;
                        case "13-3": // 兩階段撥入
                            // E10: 不控卡
                            if (userInfoService.userInfo.server_product == "E10") {
                                break;
                            }
                            if (!commonService.isEquality(sourceDocDetail[i].source_no, item.bc_source_no) ||
                                !commonService.isEquality(sourceDocDetail[i].seq, item.bc_source_seq) ||
                                !commonService.isEquality(sourceDocDetail[i].doc_line_seq, item.bc_source_line_seq) ||
                                !commonService.isEquality(sourceDocDetail[i].doc_batch_seq, item.bc_source_batch_seq)) {
                                error_message = $scope.langs.barcode_doc_origin_different_error;
                                continue;
                            }
                            break;
                        default:
                            break;
                    }

                    item.source_no = sourceDocDetail[i].source_no;
                    item.seq = sourceDocDetail[i].seq;
                    item.doc_line_seq = sourceDocDetail[i].doc_line_seq;
                    item.doc_batch_seq = sourceDocDetail[i].doc_batch_seq;

                    if ($scope.l_data.use_erp_warehousing) {
                        if (sourceDocDetail[i].erp_warehousing == "Y") {
                            item.warehouse_no = sourceDocDetail[i].warehouse_no;
                            item.storage_spaces_no = sourceDocDetail[i].storage_spaces_no;
                        }
                    }

                    if (commonService.isNull(item.lot_no)) {
                        item.lot_no = sourceDocDetail[i].lot_no;
                    }

                    if ($scope.scanning_detail.length > 0) {
                        //檢查是否已新增至掃描明細
                        for (var j = 0; j < $scope.scanning_detail.length; j++) {
                            var element = $scope.scanning_detail[j];
                            if (!commonService.isEquality(element.barcode_no, item.barcode_no)) {
                                continue;
                            }
                            if ($scope.page_params.in_out_no == "-1") {
                                if (commonService.isEquality(element.barcode_no, item.barcode_no) &&
                                    commonService.isEquality(element.warehouse_no, item.warehouse_no) &&
                                    commonService.isEquality(element.storage_spaces_no, item.storage_spaces_no) &&
                                    commonService.isEquality(element.lot_no, item.lot_no) &&
                                    commonService.isEquality(element.inventory_management_features, item.inventory_management_features)) {
                                    used_qty = numericalAnalysisService.accAdd(used_qty, element.qty);
                                }
                            } else {
                                used_qty = numericalAnalysisService.accAdd(used_qty, element.qty);
                            }
                            if (commonService.isEquality(element.barcode_no, item.barcode_no) &&
                                commonService.isEquality(element.warehouse_no, item.warehouse_no) &&
                                commonService.isEquality(element.storage_spaces_no, item.storage_spaces_no) &&
                                commonService.isEquality(element.lot_no, item.lot_no) &&
                                commonService.isEquality(element.inventory_management_features, item.inventory_management_features) &&
                                commonService.isEquality(element.ingoing_warehouse_no, item.ingoing_warehouse_no) &&
                                commonService.isEquality(element.ingoing_storage_spaces_no, item.ingoing_storage_spaces_no)) {
                                if (item.barcode_type == "2" || item.barcode_type == "3") {
                                    isBarcodeDuplication = true;
                                    break;
                                }
                            }
                        };
                    }

                    //裝箱條碼需一次新增 檢查暫存陣列
                    if ($scope.temp_detail.length > 0 && !isBarcodeDuplication) {
                        //檢查是否已新增至掃描明細
                        for (var k = 0; k < $scope.temp_detail.length; k++) {
                            var element = $scope.temp_detail[k];
                            if (!commonService.isEquality(element.barcode_no, item.barcode_no)) {
                                continue;
                            }
                            if ($scope.page_params.in_out_no == "-1") {
                                if (commonService.isEquality(element.barcode_no, item.barcode_no) &&
                                    commonService.isEquality(element.warehouse_no, item.warehouse_no) &&
                                    commonService.isEquality(element.storage_spaces_no, item.storage_spaces_no) &&
                                    commonService.isEquality(element.lot_no, item.lot_no) &&
                                    commonService.isEquality(element.inventory_management_features, item.inventory_management_features)) {
                                    used_qty = numericalAnalysisService.accAdd(used_qty, element.qty);
                                }
                            } else {
                                used_qty = numericalAnalysisService.accAdd(used_qty, element.qty);
                            }
                            if (commonService.isEquality(element.barcode_no, item.barcode_no) &&
                                commonService.isEquality(element.warehouse_no, item.warehouse_no) &&
                                commonService.isEquality(element.storage_spaces_no, item.storage_spaces_no) &&
                                commonService.isEquality(element.lot_no, item.lot_no) &&
                                commonService.isEquality(element.inventory_management_features, item.inventory_management_features) &&
                                commonService.isEquality(element.ingoing_warehouse_no, item.ingoing_warehouse_no) &&
                                commonService.isEquality(element.ingoing_storage_spaces_no, item.ingoing_storage_spaces_no)) {
                                if (item.barcode_type == "2" || item.barcode_type == "3") {
                                    isBarcodeDuplication = true;
                                    break;
                                }
                            }
                        }
                    }

                    if (isBarcodeDuplication) {
                        error_message = $scope.langs.barcode_duplication_error;
                        break;
                    }

                    //單位轉換
                    item.qty = fil_common_requisition.accConversion(item.qty, sourceDocDetail[i]);
                    item.barcode_qty = fil_common_requisition.accConversion(item.barcode_qty, sourceDocDetail[i]);
                    item.maxqty = fil_common_requisition.accConversion(item.maxqty, sourceDocDetail[i]);
                    item.barcode_inventory_qty = fil_common_requisition.accConversion(item.barcode_inventory_qty, sourceDocDetail[i]);

                    item.unit = sourceDocDetail[i].unit_no;
                    item.main_organization = sourceDocDetail[i].main_organization;
                    item.allow_doc_qty = sourceDocDetail[i].allow_doc_qty;
                    item.doc_qty = sourceDocDetail[i].doc_qty;
                    item.decimal_places = sourceDocDetail[i].decimal_places;
                    item.decimal_places_type = sourceDocDetail[i].decimal_places_type;
                    item.multi_unit_type = sourceDocDetail[i].multi_unit_type;

                    //庫存數量
                    item.inventory_rate = sourceDocDetail[i].inventory_rate;
                    item.inventory_unit = sourceDocDetail[i].inventory_unit;

                    //參考數量
                    item.reference_rate = sourceDocDetail[i].reference_rate;
                    if (commonService.isNull(item.reference_unit_no)) {
                        item.reference_unit_no = sourceDocDetail[i].reference_unit_no;
                    }

                    //計價數量
                    item.valuation_rate = sourceDocDetail[i].valuation_rate;
                    item.valuation_unit_no = sourceDocDetail[i].valuation_unit_no;

                    //計算單據總和數量
                    all_doc_qty = numericalAnalysisService.accAdd(all_doc_qty, item.doc_qty);
                    all_allow_doc_qty = numericalAnalysisService.accAdd(all_allow_doc_qty, item.allow_doc_qty);

                    tempArray.push(angular.copy(item));
                    flag = true;
                }
                $scope.add_scan_time_log("有來源單據檢查 E");
                if (flag && tempArray.length > 0) {
                    return checkBarcodeQty(tempArray, used_qty, all_doc_qty, all_allow_doc_qty);
                }

                if (!flag) {
                    if (i == sourceDocDetail.length && commonService.isNull(error_message)) {
                        error_message = $scope.langs.picks_error_2;
                        if ($scope.page_params.in_out_no == "-1") {
                            error_message = $scope.langs.picks_error_1;
                        }
                    }
                    userInfoService.getVoice(error_message, function() {
                        $scope.setFocusMe(true);
                        $scope.inTheScan(false);
                    });
                    return false;
                }
            };

            //檢查條碼數量
            var checkBarcodeQty = function(tempArray, used_qty, all_doc_qty, all_allow_doc_qty) {
                if ($scope.page_params.in_out_no == "-1") {
                    //出項 計算已用庫存數量
                    var surplus_barcode_inventory_qty = numericalAnalysisService.accSub(tempArray[0].barcode_inventory_qty, used_qty);
                    tempArray[0].qty = surplus_barcode_inventory_qty;

                    //裝箱條碼 數量預帶條碼數量
                    if (tempArray[0].packing_barcode != "N") {
                        surplus_barcode_inventory_qty = numericalAnalysisService.accSub(surplus_barcode_inventory_qty, tempArray[0].packing_qty);
                        tempArray[0].qty = tempArray[0].packing_qty;
                    }
                    tempArray[0].surplus_barcode_inventory_qty = surplus_barcode_inventory_qty;

                    if (surplus_barcode_inventory_qty < 0 || tempArray[0].qty <= 0) {
                        //顯示錯誤 "條碼庫存數量不足！"
                        userInfoService.getVoice($scope.langs.barcode + $scope.langs.stock + $scope.langs.qty + $scope.langs.insufficient + "！", function() {
                            $scope.setFocusMe(true);
                            $scope.inTheScan(false);
                        });
                        return false;
                    }
                } else {
                    //入項 2.箱條碼 / 1.批條碼 檢查 條碼數量
                    switch (tempArray[0].barcode_type) {
                        case 3:
                        case "3":
                            break;
                        case 1:
                        case "1":
                        case 2:
                        case "2":
                            if (userInfoService.userInfo.server_product == "EF" ||
                                userInfoService.userInfo.server_product == "E10" ||
                                userInfoService.userInfo.server_product == "WF") {
                                break;
                            }
                            //取得同條碼已用數量
                            tempArray[0].qty = numericalAnalysisService.accSub(tempArray[0].qty, used_qty);
                            if (tempArray[0].qty <= 0) {
                                //顯示錯誤 "條碼數量不足！"
                                userInfoService.getVoice($scope.langs.barcode + $scope.langs.qty + $scope.langs.insufficient + "！", function() {
                                    $scope.setFocusMe(true);
                                    $scope.inTheScan(false);
                                });
                                return false;
                            }
                            break;
                    }
                }
                $scope.add_scan_time_log("檢查條碼數量 S");
                var flag = true;
                var max_qty = (all_doc_qty > 0) ? all_doc_qty : all_allow_doc_qty;
                switch (tempArray[0].barcode_type) {
                    case 1:
                    case "1":
                    case 2:
                    case "2":
                        //判斷若庫存數與單據數量不相等 彈窗提示使用者確認數量
                        var temp_doc_qty = numericalAnalysisService.accSub(max_qty, tempArray[0].qty);
                        if (temp_doc_qty < 0 && $scope.l_data.edit_qty) {
                            if (tempArray[0].packing_barcode != "N") {
                                return false;
                            }
                            commonFactory.showCheckQtyPopup("2", $scope.page_params.in_out_no, tempArray[0].qty, max_qty, all_allow_doc_qty).then(function(res) {
                                $scope.setFocusMe(true);
                                $scope.inTheScan(false)
                                if (res.allow) {
                                    flag = distributionQty(tempArray, res.qty, all_doc_qty);
                                }
                            });
                        } else {
                            flag = distributionQty(tempArray, tempArray[0].qty, all_doc_qty);
                        }
                        break;
                    case 3:
                    case "3":
                        //3.物料條碼 直接帶單據數量
                        //出項 最大值為 庫存數量 及 單據數量取小值
                        if ($scope.page_params.in_out_no == "-1") {
                            if (max_qty > tempArray[0].surplus_barcode_inventory_qty) {
                                max_qty = tempArray[0].surplus_barcode_inventory_qty;
                            }

                            if (tempArray[0].packing_barcode != "N") {
                                max_qty = tempArray[0].packing_qty;
                            }
                        }
                        flag = distributionQty(tempArray, max_qty, all_doc_qty);
                        break;
                }
                return flag;
            };

            //決定數量後執行核銷數量
            var distributionQty = function(tempArray, qty, all_doc_qty) {
                var flag = false;
                var use_allow_rate = false;
                $scope.add_scan_time_log("決定數量後執行核銷數量 S");
                //核銷數量
                var tempQty = qty;
                for (var i = 0; i < tempArray.length; i++) {
                    var temp = tempArray[i];

                    if (qty > all_doc_qty) {
                        temp.maxqty = temp.allow_doc_qty;
                    } else {
                        temp.maxqty = temp.doc_qty;
                    }

                    temp.qty = tempQty;
                    if (temp.qty > temp.maxqty) {
                        temp.qty = temp.maxqty;
                    }

                    var isDistributionQty = false;
                    if ($scope.page_params.in_out_no == "-1") {
                        isDistributionQty = (temp.qty > 0);
                    } else {
                        isDistributionQty = (temp.qty >= 0);
                        if ($scope.l_data.has_source) {
                            isDistributionQty = (temp.qty > 0);
                        }
                    }

                    if (isDistributionQty) {
                        if (!commonService.isNull(temp.inventory_unit)) {
                            temp.inventory_qty = numericalAnalysisService.to_round(
                                numericalAnalysisService.accDiv(temp.qty, temp.inventory_rate),
                                temp.decimal_places,
                                temp.decimal_places_type);
                        }

                        switch (tempArray[0].barcode_type) {
                            case 1:
                            case "1":
                            case 2:
                            case "2":
                                if (!commonService.isNull(temp.reference_unit_no)) {
                                    temp.reference_qty = numericalAnalysisService.to_round(
                                        numericalAnalysisService.accMul(
                                            temp.qty,
                                            numericalAnalysisService.accDiv(temp.max_reference_qty, temp.barcode_qty)),
                                        temp.decimal_places,
                                        temp.decimal_places_type);
                                }
                                //出項 最大值為條碼參考數量
                                if ($scope.page_params.in_out_no == "-1") {
                                    if (temp.reference_qty > temp.max_reference_qty) {
                                        temp.reference_qty = temp.max_reference_qty;
                                    }
                                }
                                break;
                            case 3:
                            case "3":
                                if (!commonService.isNull(temp.reference_unit_no)) {
                                    temp.reference_qty = numericalAnalysisService.to_round(
                                        numericalAnalysisService.accDiv(temp.qty, temp.reference_rate),
                                        temp.decimal_places,
                                        temp.decimal_places_type);
                                }
                                break;
                        }

                        if (!commonService.isNull(temp.valuation_unit_no)) {
                            temp.valuation_qty = numericalAnalysisService.to_round(
                                numericalAnalysisService.accDiv(temp.qty, temp.valuation_rate),
                                temp.decimal_places,
                                temp.decimal_places_type);
                        }

                        flag = $scope.insertGood(temp);
                        if (flag) {
                            tempQty = numericalAnalysisService.accSub(tempQty, temp.qty);
                        } else {
                            break;
                        }
                    }
                }
                $scope.add_scan_time_log("決定數量後執行核銷數量 E");

                $scope.add_scan_time_log("total");
                return flag;
            };

            //数量弹窗
            $scope.showQtyPop = function(type) {
                var maxqty = 0;
                var minqty = "none";
                if ($scope.page_params.in_out_no == "-1") {
                    maxqty = ($scope.showInfo.barcode_inventory_qty > $scope.showInfo.max_allow_doc_qty) ? $scope.showInfo.max_allow_doc_qty : $scope.showInfo.barcode_inventory_qty;
                } else {
                    maxqty = $scope.showInfo.max_allow_doc_qty;
                }

                if ($scope.showInfo.packing_barcode != "N") {
                    minqty = $scope.showInfo.packing_qty;
                }
                $scope.setFocusMe(false);
                commonFactory.showQtyPopup(type, $scope.showInfo.all_qty, maxqty, minqty, $scope.page_params.in_out_no).then(function(res) {
                    $scope.setFocusMe(true);
                    $scope.inTheScan(false);
                    if (typeof res !== "undefined") {
                        $scope.showInfo.all_qty = res;
                        checkqty(type);
                    }
                });
            };

            //修改數量後檢查
            var checkqty = function(type) {
                console.log("checkqty");
                console.log($scope.showInfo);
                //入項數量控卡
                if ($scope.page_params.in_out_no == "1" || $scope.page_params.in_out_no == "0") {
                    switch ($scope.showInfo.barcode_type) {
                        case 3:
                        case "3":
                            break;
                        case 1:
                        case "1":
                        case 2:
                        case "2":
                            if (userInfoService.userInfo.server_product == "EF" ||
                                userInfoService.userInfo.server_product == "E10" ||
                                userInfoService.userInfo.server_product == "WF") {
                                break;
                            }
                            //取得同條碼已用數量
                            var used_barcode_qty = 0;
                            if ($scope.scanning_detail.length > 0) {
                                angular.forEach($scope.scanning_detail, function(value) {
                                    if (commonService.isEquality(value.barcode_no, $scope.showInfo.barcode_no) &&
                                        (!commonService.isEquality(value.warehouse_no, $scope.showInfo.warehouse_no) ||
                                            !commonService.isEquality(value.storage_spaces_no, $scope.showInfo.storage_spaces_no) ||
                                            !commonService.isEquality(value.lot_no, $scope.showInfo.lot_no))) {
                                        used_barcode_qty = numericalAnalysisService.accAdd(used_barcode_qty, value.qty);
                                    }
                                });
                            }
                            //裝箱條碼需一次新增 檢查暫存陣列
                            if ($scope.temp_detail.length > 0) {
                                angular.forEach($scope.temp_detail, function(value) {
                                    if (commonService.isEquality(value.barcode_no, $scope.showInfo.barcode_no) &&
                                        (!commonService.isEquality(value.warehouse_no, $scope.showInfo.warehouse_no) ||
                                            !commonService.isEquality(value.storage_spaces_no, $scope.showInfo.storage_spaces_no) ||
                                            !commonService.isEquality(value.lot_no, $scope.showInfo.lot_no))) {
                                        used_barcode_qty = numericalAnalysisService.accAdd(used_barcode_qty, value.qty);
                                    }
                                });
                            }
                            var allow_barcode_qty = numericalAnalysisService.accSub(numericalAnalysisService.accSub($scope.showInfo.barcode_qty, $scope.showInfo.barcode_inventory_qty), used_barcode_qty);
                            if ($scope.showInfo.all_qty > allow_barcode_qty) {
                                userInfoService.getVoice($scope.langs.barcode + $scope.langs.qty + $scope.langs.insufficient + "！", function() {
                                    $scope.setFocusMe(true);
                                    $scope.inTheScan(false);
                                });
                                $scope.showInfo.all_qty = allow_barcode_qty;
                                return;
                            }
                            break;
                    }
                }

                //出項數量控卡
                if ($scope.page_params.in_out_no == "-1") {
                    //出項 計算已用庫存數量
                    var used_barcode_inventory_qty = 0;
                    if ($scope.scanning_detail.length > 0) {
                        angular.forEach($scope.scanning_detail, function(value) {
                            if (commonService.isEquality(value.barcode_no, $scope.showInfo.barcode_no) &&
                                commonService.isEquality(value.warehouse_no, $scope.showInfo.warehouse_no) &&
                                commonService.isEquality(value.storage_spaces_no, $scope.showInfo.storage_spaces_no) &&
                                commonService.isEquality(value.lot_no, $scope.showInfo.lot_no) &&
                                commonService.isEquality(value.inventory_management_features, $scope.showInfo.inventory_management_features)) {
                                used_barcode_inventory_qty = numericalAnalysisService.accAdd(used_barcode_inventory_qty, value.qty);
                            }
                        });
                    }
                    //裝箱條碼需一次新增 檢查暫存陣列
                    if ($scope.temp_detail.length > 0) {
                        angular.forEach($scope.temp_detail, function(value) {
                            if (commonService.isEquality(value.barcode_no, $scope.showInfo.barcode_no) &&
                                commonService.isEquality(value.warehouse_no, $scope.showInfo.warehouse_no) &&
                                commonService.isEquality(value.storage_spaces_no, $scope.showInfo.storage_spaces_no) &&
                                commonService.isEquality(value.lot_no, $scope.showInfo.lot_no) &&
                                commonService.isEquality(value.inventory_management_features, $scope.showInfo.inventory_management_features)) {
                                used_barcode_inventory_qty = numericalAnalysisService.accAdd(used_barcode_inventory_qty, value.qty);
                            }
                        });
                    }
                    var surplus_barcode_inventory_qty = numericalAnalysisService.accSub($scope.showInfo.barcode_inventory_qty, used_barcode_inventory_qty);
                    //條碼庫存數量
                    if ($scope.showInfo.all_qty > surplus_barcode_inventory_qty) {
                        userInfoService.getVoice($scope.langs.barcode + $scope.langs.stock + $scope.langs.qty + $scope.langs.insufficient + "！", function() {
                            $scope.setFocusMe(true);
                            $scope.inTheScan(false);
                        });
                        $scope.showInfo.all_qty = surplus_barcode_inventory_qty;
                        return;
                    }

                    //裝箱條碼 控卡不可小於條碼數量
                    if ($scope.showInfo.packing_barcode != "N") {
                        if ($scope.showInfo.all_qty < $scope.showInfo.packing_qty) {
                            userInfoService.getVoice($scope.langs.picks_error_3, function() {
                                $scope.setFocusMe(true);
                                $scope.inTheScan(false);
                            });
                            $scope.showInfo.all_qty = $scope.showInfo.packing_qty;
                            return;
                        }
                    }
                }

                var index = -1;
                if ($scope.page_params.program_job_no == "13-1" || $scope.page_params.program_job_no == "13-2" ||
                    $scope.page_params.func == "fil524" || $scope.page_params.func == "fil525") {
                    index = $scope.scanning_detail.findIndex(function(item) {
                        return commonService.isEquality($scope.showInfo.barcode_no, item.barcode_no) &&
                            commonService.isEquality($scope.showInfo.warehouse_no, item.warehouse_no) &&
                            commonService.isEquality($scope.showInfo.storage_spaces_no, item.storage_spaces_no) &&
                            commonService.isEquality($scope.showInfo.lot_no, item.lot_no) &&
                            commonService.isEquality($scope.showInfo.inventory_management_features, item.inventory_management_features) &&
                            commonService.isEquality($scope.showInfo.ingoing_warehouse_no, item.ingoing_warehouse_no) &&
                            commonService.isEquality($scope.showInfo.ingoing_storage_spaces_no, item.ingoing_storage_spaces_no);
                    });
                    if (index != -1) {
                        $scope.showInfo.qty = angular.copy($scope.showInfo.all_qty);
                        $scope.scanning_detail[index] = angular.copy($scope.showInfo);
                    }
                    $scope.getShowInfo();
                    return;
                }

                var use_allow_rate = false;
                var allow_qty = numericalAnalysisService.accSub($scope.showInfo.all_qty, $scope.showInfo.max_doc_qty);
                if (allow_qty > 0) {
                    $scope.showInfo.maxqty = $scope.showInfo.max_allow_doc_qty;
                    use_allow_rate = true;
                } else {
                    $scope.showInfo.maxqty = $scope.showInfo.max_doc_qty;
                    use_allow_rate = false;
                }

                if ($scope.showInfo.all_qty > $scope.showInfo.maxqty) {
                    userInfoService.getVoice($scope.langs.receipt + $scope.langs.surplus + $scope.langs.qty + $scope.langs.insufficient + "！", function() {
                        $scope.setFocusMe(true);
                        $scope.inTheScan(false);
                    });
                    $scope.showInfo.all_qty = $scope.showInfo.maxqty;
                }

                var showInfoQty = $scope.showInfo.all_qty; //畫面顯示總數
                var showInfoReferenceQty = $scope.showInfo.all_reference_qty; //畫面顯示總數
                var sourceDocDetail = fil_common_requisition.getSourceDocDetail();
                var item = {};
                var array = [];
                for (var k = 0; k < $scope.scanning_detail.length; k++) {
                    item = $scope.scanning_detail[k];
                    if (!(commonService.isEquality(item.barcode_no, $scope.showInfo.barcode_no) &&
                            commonService.isEquality(item.warehouse_no, $scope.showInfo.warehouse_no) &&
                            commonService.isEquality(item.storage_spaces_no, $scope.showInfo.storage_spaces_no) &&
                            commonService.isEquality(item.lot_no, $scope.showInfo.lot_no) &&
                            commonService.isEquality(item.inventory_management_features, $scope.showInfo.inventory_management_features))) {
                        array.push(item);
                    }
                }
                $scope.setScanning_detail(array);
                array = [];
                for (var j = 0; j < sourceDocDetail.length; j++) {
                    if (sourceDocDetail[j].allow_doc_qty === 0 ||
                        !commonService.isEquality(sourceDocDetail[j].item_no, $scope.showInfo.item_no) ||
                        !commonService.isEquality(sourceDocDetail[j].item_feature_no, $scope.showInfo.item_feature_no)) {
                        continue;
                    }
                    array.push(sourceDocDetail[j]);
                }
                for (var i = 0; i < array.length; i++) {
                    if ($scope.scanning_detail.length > 0) {
                        //計算該項次剩餘數量 = 單據數量 - 不同條碼發出數量
                        angular.forEach($scope.scanning_detail, function(value) {
                            if ((!commonService.isEquality(value.barcode_no, $scope.showInfo.barcode_no) ||
                                    !commonService.isEquality(value.warehouse_no, $scope.showInfo.warehouse_no) ||
                                    !commonService.isEquality(value.storage_spaces_no, $scope.showInfo.storage_spaces_no) ||
                                    !commonService.isEquality(value.lot_no, $scope.showInfo.lot_no) ||
                                    !commonService.isEquality(value.inventory_management_features, $scope.showInfo.inventory_management_features)) &&
                                commonService.isEquality(value.item_no, array[i].item_no) &&
                                commonService.isEquality(value.item_feature_no, array[i].item_feature_no) &&
                                commonService.isEquality(value.source_no, array[i].source_no) &&
                                commonService.isEquality(value.seq, array[i].seq) &&
                                commonService.isEquality(value.doc_line_seq, array[i].doc_line_seq) &&
                                commonService.isEquality(value.doc_batch_seq, array[i].doc_batch_seq)) {
                                array[i].allow_doc_qty = numericalAnalysisService.accSub(array[i].allow_doc_qty, value.qty);
                                array[i].doc_qty = numericalAnalysisService.accSub(array[i].doc_qty, value.qty);
                            }
                        });
                    }

                    //判斷是否使用誤差率
                    if (use_allow_rate) {
                        //計算可容許誤差數量
                        can_use_doc_qty = numericalAnalysisService.accSub(array[i].allow_doc_qty, array[i].doc_qty);

                        //計算使用誤差數量
                        if (allow_qty > can_use_doc_qty) {
                            allow_qty = numericalAnalysisService.accSub(allow_qty, can_use_doc_qty);
                            use_doc_qty = array[i].allow_doc_qty;
                        } else {
                            use_doc_qty = numericalAnalysisService.accAdd(array[i].doc_qty, allow_qty);
                        }
                    } else {
                        use_doc_qty = array[i].doc_qty;
                    }

                    //單據項次剩餘數量 有剩餘數量時核銷
                    if (use_doc_qty > 0) {
                        if (showInfoQty > 0) {
                            var temp = angular.copy($scope.showInfo);
                            temp.source_no = array[i].source_no;
                            temp.seq = array[i].seq;
                            temp.doc_line_seq = array[i].doc_line_seq;
                            temp.doc_batch_seq = array[i].doc_batch_seq;
                            temp.qty = (showInfoQty > use_doc_qty) ? use_doc_qty : showInfoQty;
                            temp.maxqty = use_doc_qty;
                            showInfoQty = numericalAnalysisService.accSub(showInfoQty, temp.qty);
                            $scope.insertGood(temp);
                        }
                    }
                }
                $scope.setFocusMe(true);
                $scope.inTheScan(false);
            };

            //計算加減後數值 並呼叫撿查
            $scope.compute = function(type, value) {
                $scope.setFocusMe(false);
                var value1 = angular.copy($scope.showInfo.all_qty);
                var num = numericalAnalysisService.accAdd(value1, value);
                if (num < 1) {
                    num = 1;
                }
                $scope.showInfo.all_qty = num;
                checkqty(type);
            };

            if (!commonService.isNull($scope.scaninfo.scanning)) {
                $scope.checkScan($scope.scaninfo.scanning);
            }
        }
    ];
});