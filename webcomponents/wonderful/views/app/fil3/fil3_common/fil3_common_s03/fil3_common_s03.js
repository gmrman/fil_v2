define(["API", "APIS", 'AppLang', 'views/app/fil_common/requisition.js', 'array', 'Directives', 'ReqTestData', 'ionic-popup',
    'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService'
], function() {
    return ['$scope', '$state', '$timeout', '$filter', 'AppLang', 'APIService', 'APIBridge',
        '$ionicLoading', '$ionicPopup', '$ionicModal', '$ionicListDelegate', 'IonicPopupService', 'IonicClosePopupService',
        'fil_common_requisition', 'ReqTestData', 'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService',
        function($scope, $state, $timeout, $filter, AppLang, APIService, APIBridge,
            $ionicLoading, $ionicPopup, $ionicModal, $ionicListDelegate, IonicPopupService, IonicClosePopupService,
            fil_common_requisition, ReqTestData, circulationCardService, commonFactory, commonService, userInfoService, scanTypeService, numericalAnalysisService) {

            $scope.reason_code_show = false;
            if ($scope.page_params.program_job_no == '12' || $scope.page_params.program_job_no == '11') {
                switch (userInfoService.userInfo.server_product) {
                    case "易飞":
                    case "E10":
                    case "WF":
                        $scope.reason_code_show = false;
                        break;
                    default:
                        $scope.reason_code_show = true;
                }
            }

            $scope.focused = [false, false, false, false, false, false, false];

            $scope.clearfocused = function() {
                for (var i = 0; i < $scope.focused.length; i++) {
                    $scope.focused[i] = false;
                }
            };

            $scope.setfocused = function(index) {
                if (index < 0 || index > 7) {
                    index = 6;
                }
                var temp = Array(7).fill(false);

                if (index == 0) {
                    if ($scope.page_params.in_out_no === '0') {
                        index = index + 1;
                    }
                }

                if (index == 1) {
                    if ($scope.page_params.in_out_no !== '1') {
                        index = index + 1;
                    }
                }

                if (index == 2 || index == 3) {
                    if ($scope.page_params.program_job_no !== '13-1' && $scope.page_params.program_job_no !== '13-5') {
                        index = 4;
                    }
                }

                if (index == 4) {
                    if ($scope.page_params.in_out_no !== '1') {
                        index = index + 1;
                    }
                }

                if (index == 5) {
                    if (!$scope.reason_code_show) {
                        index = index + 1;
                    }
                }

                temp[index] = true;
                $timeout(function() {
                    $scope.focused = temp;
                }, 0);
            };
            $scope.clearfocused();
            $scope.setfocused(1);

            $scope.warehouseShow = function() {
                commonFactory.showWarehouseModal(userInfoService.warehouse, $scope.scaninfo, $scope.setwarehouse, function() {});
            };

            $scope.clearWarehouse = function() {
                $scope.setwarehouse({
                    "warehouse_no": " ",
                    "warehouse_name": "",
                    "storage_spaces": [],
                    "storage_management": "N",
                    "warehouse_cost": "N",
                });
            };

            $scope.setwarehouse = function(warehouse) {
                $scope.scaninfo.warehouse_no = warehouse.warehouse_no;
                $scope.scaninfo.warehouse_name = warehouse.warehouse_name;
                $scope.scaninfo.storage_management = warehouse.storage_management;
                $scope.sel_in_storage = warehouse.storage_spaces;
                $scope.clearStorage();
                if ($scope.page_params.in_out_no == "-1") {
                    $scope.clearBarcodeInfoObject();
                    $scope.clearScanning();
                    if ($scope.page_params.program_job_no != "11" && $scope.page_params.program_job_no != "13-1" && $scope.page_params.program_job_no != "13-5") {
                        $scope.getInstructions();
                    }
                }
            };

            $scope.ingoingWarehouseShow = function() {
                $ionicModal.fromTemplateUrl('views/app/fil3/fil3_common/fil3_common_s03/warehouseModal.html', {
                    scope: $scope
                }).then(function(modal) {
                    $scope.warehouses = userInfoService.warehouse;
                    $scope.popSelected = {
                        search: "",
                        warehouse_no: $scope.scaninfo.ingoing_warehouse_no,
                        warehouse_name: $scope.scaninfo.ingoing_warehouse_name
                    };

                    $scope.selwarehouse = function(warehouse) {
                        $scope.popSelected.warehouse_no = warehouse.warehouse_no;
                        $scope.popSelected.warehouse_name = warehouse.warehouse_name;
                        $scope.popSelected.storage_spaces = warehouse.storage_spaces;
                    };

                    $scope.setIngoing = function() {
                        var index = $scope.warehouses.findIndex(function(item) {
                            return $scope.popSelected.warehouse_no == item.warehouse_no;
                        });

                        if (index !== -1) { //存在於倉庫基本檔
                            $scope.close();
                            $scope.setIngoingwarehouse($scope.warehouses[index]);
                        }
                    };

                    $scope.close = function() {
                        modal.hide().then(function() {
                            return modal.remove();
                        });
                    };
                    modal.show();
                    return modal;
                });
            };

            $scope.setIngoingwarehouse = function(warehouse) {
                $scope.scaninfo.ingoing_warehouse_no = warehouse.warehouse_no;
                $scope.scaninfo.ingoing_warehouse_name = warehouse.warehouse_name;
                $scope.scaninfo.ingoing_storage_management = warehouse.storage_management;
                $scope.ingoing_sel_in_storage = warehouse.storage_spaces;
                $scope.clearIngoingStorage();
            };

            $scope.storageShow = function() {
                commonFactory.showStorageModal($scope.sel_in_storage, $scope.scaninfo, $scope.setstorage, function() {});
            };

            $scope.setstorage = function(storage) {
                $scope.scaninfo.storage_spaces_no = storage.storage_spaces_no;
                $scope.scaninfo.storage_spaces_name = storage.storage_spaces_name;
            };

            $scope.clearStorage = function() {
                $scope.setstorage({
                    storage_spaces_no: " ",
                    storage_spaces_name: " "
                });
            };

            $scope.ingoingStorageShow = function() {
                $ionicModal.fromTemplateUrl('views/app/fil3/fil3_common/fil3_common_s03/storageModal.html', {
                    scope: $scope
                }).then(function(modal) {
                    $scope.storages = $scope.ingoing_sel_in_storage;

                    $scope.popSelected = {
                        search: "",
                        storage_spaces_no: $scope.scaninfo.ingoing_storage_spaces_no,
                        storage_spaces_name: $scope.scaninfo.ingoing_storage_spaces_name,
                    };

                    $scope.selstorage = function(storage) {
                        $scope.popSelected.storage_spaces_no = storage.storage_spaces_no;
                        $scope.popSelected.storage_spaces_name = storage.storage_spaces_name;
                    };

                    $scope.setIngoing = function() {
                        $scope.close();
                        $scope.setIngoingStorage($scope.popSelected);
                    };

                    $scope.close = function() {
                        modal.hide().then(function() {
                            return modal.remove();
                        });
                    };
                    modal.show();
                    return modal;
                });
            };

            $scope.setIngoingStorage = function(storage) {
                $scope.scaninfo.ingoing_storage_spaces_no = storage.storage_spaces_no;
                $scope.scaninfo.ingoing_storage_spaces_name = storage.storage_spaces_name;
            };

            $scope.clearIngoingStorage = function() {
                $scope.setIngoingStorage({
                    storage_spaces_no: " ",
                    storage_spaces_name: " "
                });
            };

            $scope.lotShow = function() {
                commonFactory.showLotPopup($scope.scaninfo.lot_no).then(function(res) {
                    if (typeof res !== "undefined") {
                        $scope.scaninfo.lot_no = res;
                    }
                });
            };

            $scope.reason_list = [];
            $scope.reasonShow = function() {
                $ionicLoading.show();
                $ionicModal.fromTemplateUrl('views/app/fil3/fil3_common/fil3_common_s03/fil3_common_s03_01.html', {
                    scope: $scope
                }).then(function(modal) {

                    $scope.popSelected = {
                        search: "",
                        reason_code: " ",
                        reason_code_name: " ",
                    };

                    $scope.changeReasonCode = function(item) {
                        $scope.popSelected.reason_code = item.reason_code;
                        $scope.popSelected.reason_code_name = item.reason_code_name;
                    };

                    $scope.setReasonCode = function() {
                        $scope.scaninfo.reason_code = $scope.popSelected.reason_code;
                        $scope.scaninfo.reason_code_name = $scope.popSelected.reason_code_name;
                        $scope.closeSelReasonModal();
                    };

                    $scope.closeSelReasonModal = function() {
                        modal.hide().then(function() {
                            return modal.remove();
                        });
                    };

                    $scope.showSelReasonModal = function() {
                        modal.show();
                        $ionicLoading.hide();
                    };

                    if ($scope.reason_list.length === 0) {
                        var webTran = {
                            service: 'app.reason.code.get',
                            parameter: {
                                "program_job_no": $scope.page_params.program_job_no,
                                "status": $scope.page_params.status,
                                "site_no": userInfoService.userInfo.site_no,
                                "reason_code": " "
                            }
                        };
                        APIService.Web_Post(webTran, function(res) {
                            // console.log("success:" + angular.toJson(res));
                            var parameter = res.payload.std_data.parameter;
                            $timeout(function() {
                                $scope.reason_list = parameter.reason_list;
                                $scope.showSelReasonModal();
                            }, 0);
                        }, function(error) {
                            $ionicLoading.hide();
                            var execution = error.payload.std_data.execution;
                            console.log("error:" + execution.description);
                            userInfoService.getVoice(execution.description, function() {});
                        });
                    } else {
                        $scope.showSelReasonModal();
                    }
                });
            };

            $scope.$on('scan', function(e) {
                $scope.scan();
            });

            $scope.scan = function() {
                console.log("scanBarcode");
                APIBridge.callAPI('scanBarcode', [{}]).then(function(result) {
                    if (result) {
                        console.log('scanBarcode success');
                        for (var i = 0; i < $scope.focused.length; i++) {
                            var temp = $scope.focused[i];
                            if (temp) {
                                var flag = false;
                                switch (i) {
                                    case 0:
                                        flag = $scope.checkScan_warehouse(result.data[0].barcode.trim());
                                        break;
                                    case 1:
                                        flag = $scope.checkScan_storage(result.data[0].barcode.trim());
                                        break;
                                    case 2:
                                        flag = $scope.checkScan_ingoing_warehouse(result.data[0].barcode.trim());
                                        break;
                                    case 3:
                                        flag = $scope.checkScan_ingoing_storage(result.data[0].barcode.trim());
                                        break;
                                    case 5:
                                        flag = $scope.checkScan_reason(result.data[0].barcode.trim());
                                        break;
                                    case 6:
                                        flag = $scope.checkScan(result.data[0].barcode.trim(), $scope.scaninfo.warehouse_no, $scope.scaninfo.storage_spaces_no, $scope.scaninfo.lot_no);
                                        break;
                                    case 4:
                                        $scope.scaninfo.lot_no = result.data[0].barcode.trim();
                                        flag = true;
                                        break;
                                    case 7:
                                        $scope.scaninfo.qty = result.data[0].barcode.trim();
                                        flag = true;
                                        break;
                                    default:
                                        flag = $scope.checkScan(result.data[0].barcode.trim(), $scope.scaninfo.warehouse_no, $scope.scaninfo.storage_spaces_no, $scope.scaninfo.lot_no);
                                        break;
                                }
                                $scope.clearfocused();
                                if (flag) {
                                    $scope.setfocused(i + 1);
                                } else {
                                    $scope.setfocused(i);
                                }
                                break;
                            }
                        }
                    } else {
                        console.log('scanBarcode false');
                    }
                }, function(result) {
                    console.log("scanBarcode fail");
                    console.log(result);
                });
            };

            $scope.checkScan_warehouse = function(scanning) {
                if (commonService.isNull(scanning)) {
                    return false;
                }
                //取得倉庫資訊
                var index = userInfoService.warehouseIndex[scanning];
                if (!angular.isUndefined(index)) { //存在於倉庫基本檔
                    $scope.setwarehouse(userInfoService.warehouse[index]);
                    $scope.clearfocused();
                    $scope.setfocused(1);
                    return true;
                } else {
                    userInfoService.getVoice(scanning + $scope.langs.not_warehouse, function() {
                        $scope.setwarehouse(userInfoService.warehouse[0]);
                        $scope.clearfocused();
                        $scope.setfocused(0);
                    });
                    return false;
                }
            };

            $scope.checkScan_storage = function(scanning) {
                if (commonService.isNull(scanning)) {
                    return false;
                }
                var index = $scope.sel_in_storage.findIndex(function(item) {
                    return scanning == item.storage_spaces_no;
                });

                if (index !== -1) { //存在於儲位基本檔
                    $scope.setstorage($scope.sel_in_storage[index]);
                    $scope.clearfocused();
                    $scope.setfocused(2);
                    return true;
                } else {
                    userInfoService.getVoice(scanning + $scope.langs.not_storage, function() {
                        $scope.clearStorage();
                        $scope.clearfocused();
                        $scope.setfocused(1);
                    });
                    return false;
                }
            };

            $scope.checkScan_ingoing_warehouse = function(scanning) {
                if (commonService.isNull(scanning)) {
                    return false;
                }
                //取得倉庫資訊
                var index = userInfoService.warehouseIndex[scanning];
                if (!angular.isUndefined(index)) { //存在於倉庫基本檔
                    $scope.setIngoingwarehouse(userInfoService.warehouse[index]);
                    $scope.clearfocused();
                    $scope.setfocused(3);
                    return true;
                } else {
                    userInfoService.getVoice(scanning + $scope.langs.not_warehouse, function() {
                        $scope.setIngoingwarehouse(userInfoService.warehouse[0]);
                        $scope.clearfocused();
                        $scope.setfocused(2);
                    });
                    return false;
                }
            };

            $scope.checkScan_ingoing_storage = function(scanning) {
                if (commonService.isNull(scanning)) {
                    return false;
                }
                index = $scope.ingoing_sel_in_storage.findIndex(function(item) {
                    return scanning == item.storage_spaces_no;
                });

                if (index !== -1) { //存在於儲位基本檔
                    $scope.setIngoingStorage($scope.ingoing_sel_in_storage[index]);
                    $scope.clearfocused();
                    $scope.setfocused(4);
                    return true;
                } else {
                    userInfoService.getVoice(scanning + $scope.langs.not_storage, function() {
                        $scope.clearIngoingStorage();
                        $scope.clearfocused();
                        $scope.setfocused(3);
                    });
                    return false;
                }
            };

            $scope.checkScan_reason = function(scanning) {
                if (commonService.isNull(scanning)) {
                    return false;
                }
                index = $scope.reason_list.findIndex(function(item) {
                    return scanning == item.reason_code;
                });

                if (index !== -1) {
                    $scope.scaninfo.reason_code = $scope.reason_list[index].reason_code;
                    $scope.scaninfo.reason_code_name = $scope.reason_list[index].reason_code_name;
                    $scope.clearfocused();
                    $scope.setfocused(6);
                    return true;
                } else {
                    userInfoService.getVoice(scanning + $scope.langs.not_reason_no, function() {
                        $scope.scaninfo.reason_code = $scope.reason_list[0].reason_code;
                        $scope.scaninfo.reason_code_name = $scope.reason_list[0].reason_code_name;
                        $scope.clearfocused();
                        $scope.setfocused(5);
                    });
                    return false;
                }
            };

            $scope.scanned = function(value) {
                if (commonService.isNull(value)) {
                    return false;
                }
                $scope.checkScan(value.trim(), $scope.scaninfo.warehouse_no, $scope.scaninfo.storage_spaces_no, $scope.scaninfo.lot_no);
                return true;
            };

            //檢查掃描欄位資料
            $scope.checkScan = function(scanning, warehouse_no, storage_spaces_no, lot_no) {
                $scope.scaninfo.scanning = scanning;
                if (commonService.isNull(scanning)) {
                    return false;
                }
                if (angular.isUndefined(warehouse_no)) {
                    warehouse_no = $scope.scaninfo.warehouse_no;
                }
                if (angular.isUndefined(storage_spaces_no)) {
                    storage_spaces_no = $scope.scaninfo.storage_spaces_no;
                }
                if (angular.isUndefined(lot_no)) {
                    lot_no = $scope.scaninfo.lot_no;
                }
                var service = "";
                var parameter = {};
                //依作業別設定 WS 參數
                switch ($scope.page_params.program_job_no) {
                    case "9":
                        var scan_type = $scope.page_params.scan_type;
                        service = "app.doc.bc.get";
                        parameter = {
                            "program_job_no": $scope.page_params.program_job_no,
                            "scan_type": scan_type,
                            "analysis_symbol": userInfoService.userInfo.barcode_separator,
                            "status": $scope.page_params.status,
                            "barcode_no": scanning,
                            "warehouse_no": warehouse_no,
                            "storage_spaces_no": storage_spaces_no,
                            "lot_no": lot_no,
                            "inventory_management_features": "",
                            "info_id": $scope.l_data.info_id,
                            "site_no": userInfoService.userInfo.site_no
                        };
                        break;
                    default:
                        service = "app.barcode.get";
                        parameter = {
                            "program_job_no": $scope.page_params.program_job_no,
                            "status": $scope.page_params.status,
                            "barcode_no": scanning,
                            "warehouse_no": warehouse_no,
                            "storage_spaces_no": storage_spaces_no,
                            "lot_no": lot_no,
                            "inventory_management_features": "",
                            "info_id": $scope.l_data.info_id,
                            "param_master": $scope.page_params.doc_array,
                            "site_no": userInfoService.userInfo.site_no
                        };

                        if ($scope.page_params.in_out_no == "0") {
                            parameter.warehouse_no = " ";
                            parameter.storage_spaces_no = " ";
                            parameter.lot_no = " ";
                        }

                        break;
                }

                var webTran = {
                    service: service,
                    parameter: parameter
                };

                console.log(webTran);
                //是否使用假資料
                $ionicLoading.show();
                APIService.Web_Post(webTran, function(res) {
                    $ionicLoading.hide();
                    // console.log("success:" + angular.toJson(res));
                    var parameter = res.payload.std_data.parameter;
                    selectBarcodedata(scanning, parameter);
                }, function(error) {
                    $ionicLoading.hide();
                    var execution = error.payload.std_data.execution;
                    console.log("error:" + execution.description);
                    userInfoService.getVoice(execution.description, function() {
                        $scope.clearfocused();
                        $scope.setfocused(6);
                    });
                });
            };

            var InsertToBcmcBcme = function(parameter) {
                if (commonService.Platform == "Chrome") {
                    return true;
                }
                $ionicLoading.show();
                APIBridge.callAPI('fil3_bcme_create', [parameter]).then(function(result) {
                    $ionicLoading.hide();
                    if (result) {
                        console.log('fil3_bcme_create success');
                    } else {
                        userInfoService.getVoice('fil3_bcme_create error', function() {});
                    }
                }, function(error) {
                    $ionicLoading.hide();
                    userInfoService.getVoice('fil3_bcme_create fail', function() {});
                    console.log(error);
                });
            };
            //依WS回傳的 barcode_detail 進行判斷批號或是條碼陣列
            var selectBarcodedata = function(scanning, parameter) {

                if (parameter.source_doc_detail) {
                    if (parameter.source_doc_detail.length > 0) {
                        if (!$scope.l_data.hasSource) {
                            $scope.l_data.bcae002 = parameter.source_doc_detail[0].source_no;
                        } else {
                            if ($scope.l_data.bcae002 != parameter.source_doc_detail[0].source_no) {
                                userInfoService.getVoice($scope.langs.origin + $scope.langs.receipt + $scope.langs.different, function() {
                                    $scope.clearfocused();
                                    $scope.setfocused(6);
                                });
                                return;
                            }
                        }
                        InsertToBcmcBcme(parameter);
                        fil_common_requisition.setParameter(parameter);
                    }
                }

                $scope.selbarcodedata = parameter.barcode_detail;

                // WS 回傳條碼資訊若為零
                if ($scope.selbarcodedata.length === 0) {
                    if ($scope.page_params.in_out_no == "1") {
                        //檢查長度是否為批號
                        if (scanning.length <= userInfoService.userInfo.lot_length && !$scope.l_data.allocation_1) {
                            //彈出詢問 "是否為批號" 視窗
                            var LotPopup = $ionicPopup.show({
                                title: $scope.langs.checkField + $scope.langs.lot,
                                scope: $scope,
                                buttons: [{
                                    text: $scope.langs.cancel,
                                    onTap: function() {
                                        //顯示錯誤 "scanning 不存在或無效！"
                                        userInfoService.getVoice(scanning + $scope.langs.not_exist_or_invalid, function() {
                                            $scope.clearfocused();
                                            $scope.setfocused(6);
                                        });
                                    }
                                }, {
                                    text: $scope.langs.confirm,
                                    onTap: function() {
                                        //設定批號值
                                        $scope.scaninfo.lot_no = scanning;
                                    }
                                }]
                            });
                            IonicClosePopupService.register(false, LotPopup);
                        } else {
                            //顯示錯誤 "scanning不存在或無效！"
                            userInfoService.getVoice(scanning + $scope.langs.not_exist_or_invalid, function() {
                                $scope.clearfocused();
                                $scope.setfocused(6);
                            });
                        }
                        return;
                    }
                    //顯示錯誤 "scanning不存在或無效！"
                    userInfoService.getVoice(scanning + $scope.langs.not_exist_or_invalid, function() {
                        $scope.clearfocused();
                        $scope.setfocused(6);
                    });
                    return;
                }

                if ($scope.l_data.hasSource) {
                    var ItemDocQty = fil_common_requisition.fil3getItemDocQty();
                    var flag = false;
                    for (var i = 0, len = ItemDocQty.length; i < len; i++) {
                        var value = ItemDocQty[i];
                        for (var j = 0; j < $scope.selbarcodedata.length; j++) {
                            var item = $scope.selbarcodedata[j];
                            if (commonService.isEquality(value.item_no, item.item_no) &&
                                commonService.isEquality(value.item_feature_no, item.item_feature_no)) {
                                if (item.barcode_type != "3") {
                                    var l_barcode_qty = numericalAnalysisService.accDiv(numericalAnalysisService.accMul(item.barcode_qty, value.conversion_rate_molecular), value.conversion_rate_denominator);
                                    var l_inventory_qty = numericalAnalysisService.accDiv(numericalAnalysisService.accMul(item.inventory_qty, value.conversion_rate_molecular), value.conversion_rate_denominator);
                                    item.barcode_qty = numericalAnalysisService.to_round(l_barcode_qty, value.decimal_places, value.decimal_places_type);
                                    item.inventory_qty = numericalAnalysisService.to_round(l_inventory_qty, value.decimal_places, value.decimal_places_type);
                                }
                                flag = true;
                                break;
                            }
                        }
                    }

                    if (!flag) {
                        //顯示錯誤 "條碼對應的物料不存在於單據！"
                        userInfoService.getVoice($scope.langs.barcode_material_different_error, function() {
                            $scope.clearfocused();
                            $scope.setfocused(6);
                        });
                        return;
                    }

                }

                //出項 跳出條碼選擇窗
                if ($scope.page_params.in_out_no == "-1") {
                    if ($scope.selbarcodedata.length == 1) {
                        if ($scope.l_data.hasSource) {
                            get_sqlite_bcme_by_item($scope.selbarcodedata[0], true);
                        } else {
                            set_Barcode_data($scope.selbarcodedata[0], []);
                        }
                    } else {
                        $ionicLoading.show();
                        $scope.seldata = function(barcode_info) {
                            $scope.close();
                            if ($scope.l_data.hasSource) {
                                get_sqlite_bcme_by_item(barcode_info, true);
                            } else {
                                set_Barcode_data(barcode_info, []);
                            }
                        };
                        $scope.show_check_box = false;

                        $scope.clickSelData = function(index) {
                            if ($scope.show_check_box) {
                                if (commonService.isNull($scope.selbarcodedata[index].checked)) {
                                    $scope.selbarcodedata[index].checked = true;
                                } else {
                                    $scope.selbarcodedata[index].checked = !$scope.selbarcodedata[index].checked;
                                }
                            } else {
                                $scope.seldata($scope.selbarcodedata[index]);
                            }
                        };

                        $scope.seldataMultiple = function(data) {
                            if (data.length) {
                                angular.forEach(data, function(item) {
                                    if (item.checked) {
                                        $scope.seldata(item);
                                    }
                                });
                            }
                        };

                        $ionicModal.fromTemplateUrl('views/app/common/html/selbarcodedata.html', {
                            scope: $scope
                        }).then(function(modal) {
                            $scope.close = function() {
                                modal.hide().then(function() {
                                    return modal.remove();
                                });
                            };
                            modal.show();
                            $ionicLoading.hide();
                        });
                    }
                }

                //入項
                if ($scope.page_params.in_out_no == "1" || $scope.page_params.in_out_no == "0") {
                    //箱條碼 入項 計算總庫存量
                    var all_barcode_inventory_qty = 0;
                    if ($scope.selbarcodedata[0].barcode_type == "2") {
                        angular.forEach($scope.selbarcodedata, function(value) {
                            if (commonService.isEquality(scanning, value.barcode_no)) {
                                all_barcode_inventory_qty = numericalAnalysisService.accAdd(all_barcode_inventory_qty, value.inventory_qty);
                            }
                        });
                    }

                    barcode_info = $scope.selbarcodedata[0];
                    if (barcode_info.barcode_type == "2") {
                        barcode_info.inventory_qty = all_barcode_inventory_qty;
                    }
                    if ($scope.l_data.hasSource) {
                        get_sqlite_bcme_by_item(barcode_info, true);
                    } else {
                        set_Barcode_data(barcode_info, []);
                    }
                }
            };

            var get_sqlite_bcme_by_item = function(barcode_info, setBarcodeDataFlag) {
                var obj = {
                    type_no: "2"
                };

                $ionicLoading.show();
                APIBridge.callAPI('fil3_bcme_get', [obj, $scope.l_data, barcode_info]).then(function(result) {
                    $ionicLoading.hide();
                    if (result) {
                        if (setBarcodeDataFlag) {
                            set_Barcode_data(barcode_info, result.data[0].list);
                        } else {
                            if (result.data[0].submit_show) {
                                $scope.setDocInfoObject(result.data[0].list[0], true);
                            } else {
                                $scope.clearDocInfoObject();
                            }
                            $scope.clearBarcodeInfoObject();
                            $scope.clearScanning();
                        }
                        console.log('fil3_bcme_get success');
                    } else {
                        console.log('fil3_bcme_get false');
                    }
                }, function(error) {
                    $ionicLoading.hide();
                    userInfoService.getVoice('fil3_bcme_get fail', function() {});
                    console.log(error);
                });
            };

            var set_Barcode_data = function(barcode_info, doc_info_array) {
                var doc_surplus_qty = 0;
                var barcode_surplus_qty = 0;
                var maxqty = 0;
                var qty = 0;

                var doc_info = {
                    item_name: barcode_info.item_name,
                    item_no: barcode_info.item_no,
                    item_spec: barcode_info.item_spec,
                    item_feature_name: barcode_info.item_feature_name,
                    item_feature_no: barcode_info.item_feature_no,
                    unit_no: barcode_info.inventory_unit,
                    showDocQty: false,
                    already_qty: 0,
                    should_qty: 0,
                    allow_qty: 0
                };

                if (doc_info_array.length > 0) {
                    doc_info.showDocQty = true;
                    doc_info.already_qty = doc_info_array[0].already_qty;
                    doc_info.should_qty = doc_info_array[0].should_qty;
                    doc_info.allow_qty = doc_info_array[0].allow_qty;
                    doc_surplus_qty = numericalAnalysisService.accSub(doc_info.allow_qty, doc_info.already_qty);
                }

                if (!commonService.isNull(barcode_info.picking_qty)) {
                    qty = barcode_info.picking_qty;
                    if (doc_info.showDocQty) {
                        doc_info.already_qty = numericalAnalysisService.accSub(doc_info.already_qty, barcode_info.picking_qty);
                        doc_surplus_qty = numericalAnalysisService.accSub(doc_info.allow_qty, doc_info.already_qty);
                    }
                }

                switch (barcode_info.barcode_type) {
                    case "1":
                    case "2":
                        // 檢貨數量無預設值
                        if (commonService.isNull(barcode_info.picking_qty)) {
                            if ($scope.page_params.in_out_no == "1" || $scope.page_params.in_out_no == "0") {
                                qty = numericalAnalysisService.accSub(barcode_info.barcode_qty, barcode_info.inventory_qty);
                            } else {
                                qty = barcode_info.inventory_qty;
                            }
                            if (doc_info.showDocQty) {
                                if (qty > numericalAnalysisService.accSub(doc_info.should_qty, doc_info.already_qty)) {
                                    qty = numericalAnalysisService.accSub(doc_info.should_qty, doc_info.already_qty);
                                }
                            }
                        }
                        //有來源單據 最大值為 單據可收數量 & 條碼可收數量 取小值
                        if ($scope.page_params.in_out_no == "1" || $scope.page_params.in_out_no == "0") {
                            maxqty = numericalAnalysisService.accSub(barcode_info.barcode_qty, barcode_info.inventory_qty);
                        } else {
                            maxqty = barcode_info.inventory_qty;
                        }
                        if (doc_info.showDocQty) {
                            if (maxqty > doc_surplus_qty) {
                                maxqty = doc_surplus_qty;
                            }
                        }
                        break;
                    case "3":
                        // 檢貨數量無預設值
                        if (commonService.isNull(barcode_info.picking_qty)) {
                            qty = 0;
                            if ($scope.page_params.in_out_no == "-1") {
                                qty = barcode_info.inventory_qty;
                                if (doc_info.showDocQty) {
                                    if (qty > numericalAnalysisService.accSub(doc_info.should_qty, doc_info.already_qty)) {
                                        qty = numericalAnalysisService.accSub(doc_info.should_qty, doc_info.already_qty);
                                    }
                                }
                            } else {
                                if (doc_info.showDocQty) {
                                    qty = numericalAnalysisService.accSub(doc_info.should_qty, doc_info.already_qty);
                                }
                            }
                        }
                        //有來源單據 最大值為 單據可收數量
                        maxqty = 9999999999;
                        if ($scope.page_params.in_out_no == "-1") {
                            maxqty = barcode_info.inventory_qty;
                        }
                        if (doc_info.showDocQty) {
                            if (maxqty > doc_surplus_qty) {
                                maxqty = doc_surplus_qty;
                            }
                        }
                        break;
                }

                $scope.scaninfo.qty = qty;
                $scope.scaninfo.maxqty = maxqty;
                $scope.setBarcodeInfoObject(barcode_info, false);
                $scope.setDocInfoObject(doc_info, doc_info.showDocQty);
            };

            $scope.checkSave = function() {

                if (typeof $scope.scaninfo.qty !== "number") {
                    $scope.scaninfo.qty = parseFloat(angular.copy($scope.scaninfo.qty));
                    $scope.scaninfo.maxqty = parseFloat(angular.copy($scope.scaninfo.maxqty));
                }

                if ($scope.scaninfo.qty <= 0) {
                    if ($scope.page_params.in_out_no == "-1") {
                        userInfoService.getVoice($scope.langs.picks_error_1, function() {
                            $scope.clearfocused();
                            $scope.setfocused(7);
                        });
                    } else {
                        userInfoService.getVoice($scope.langs.picks_error_2, function() {
                            $scope.clearfocused();
                            $scope.setfocused(7);
                        });
                    }
                    $scope.scaninfo.qty = 1;
                    return;
                }

                if ($scope.scaninfo.qty > $scope.scaninfo.maxqty) {
                    if (!($scope.barcode_info.barcode_type == "3" && !$scope.doc_info.showDocQty && $scope.page_params.in_out_no == "1")) {
                        if ($scope.page_params.in_out_no == "-1") {
                            userInfoService.getVoice($scope.langs.picks_error_1, function() {
                                $scope.clearfocused();
                                $scope.setfocused(7);
                            });
                        } else {
                            userInfoService.getVoice($scope.langs.picks_error_2, function() {
                                $scope.clearfocused();
                                $scope.setfocused(7);
                            });
                        }
                        $scope.scaninfo.qty = $scope.scaninfo.maxqty;
                        return;
                    }
                }

                if (($scope.page_params.program_job_no == "12" || $scope.page_params.program_job_no == "11") && $scope.reason_code_show) {
                    if (commonService.isNull($scope.scaninfo.reason_code)) {
                        //顯示錯誤 "理由碼不可為空"
                        userInfoService.getVoice($scope.langs.reason_no_error, function() {
                            $scope.clearfocused();
                            $scope.setfocused(5);
                        });
                        return;
                    }
                }

                if ($scope.page_params.program_job_no == "13-1" || $scope.page_params.program_job_no == "13-5") {
                    //檢查是否有使用儲位管理
                    if ($scope.scaninfo.ingoing_storage_management == "Y") {
                        if (commonService.isNull($scope.scaninfo.ingoing_storage_spaces_no)) {
                            //顯示錯誤 "此倉庫使用儲位管理，請選擇儲位！"
                            userInfoService.getVoice($scope.langs.storage_management_error, function() {
                                $scope.clearfocused();
                                $scope.setfocused(1);
                            });
                            return;
                        }
                    }

                    //取得倉庫資訊
                    var index = userInfoService.warehouseIndex[$scope.barcode_info.warehouse_no] || 0;
                    var out_warehouse_cost = userInfoService.warehouse[index].warehouse_cost || "N";
                    if (!commonService.isEquality(out_warehouse_cost, $scope.scaninfo.ingoing_warehouse_cost)) {
                        //顯示錯誤 "撥出倉儲及撥入倉儲，必須同為成本倉或同為非成本倉！"
                        userInfoService.getVoice($scope.langs.outing_warehouse_cost_error, function() {
                            $scope.clearfocused();
                            $scope.setfocused(0);
                        });
                        return;
                    }

                    //檢查 撥出倉儲不可等於撥入倉儲！
                    if (commonService.isEquality($scope.barcode_info.warehouse_no, $scope.scaninfo.ingoing_warehouse_no) &&
                        commonService.isEquality($scope.barcode_info.storage_spaces_no, $scope.scaninfo.ingoing_storage_spaces_no)) {
                        //顯示錯誤 "撥出倉儲不可等於撥入倉儲！"
                        userInfoService.getVoice($scope.langs.outgoing_warehouse_no_error, function() {
                            $scope.clearfocused();
                            $scope.setfocused(1);
                        });
                        return;
                    }
                }

                // 入項
                if ($scope.page_params.in_out_no == "1") {

                    //檢查是否有使用儲位管理
                    if ($scope.scaninfo.storage_management == "Y") {
                        if (commonService.isNull($scope.scaninfo.storage_spaces_no)) {
                            //顯示錯誤 "此倉庫使用儲位管理，請選擇儲位！"
                            userInfoService.getVoice($scope.langs.storage_management_error, function() {
                                $scope.clearfocused();
                                $scope.setfocused(1);
                            });
                            return;
                        }
                    }

                    //檢查批號管控
                    // 1. 必須有批號：當批號欄位沒有輸入值時，需要POP窗給使用者輸入
                    if (($scope.barcode_info.lot_control_type == "1" || $scope.barcode_info.lot_control_type == "1.0") &&
                        ($scope.page_params.in_out_no != "0" || userInfoService.userInfo.gp_flag)) {
                        lot_control_type_1();
                        return;
                    }
                    // 2. 不可有批號： APP有輸入批號時　Y： 把批號清空新增　 N： 不新增到掃描明細
                    if ($scope.barcode_info.lot_control_type == "2" || $scope.barcode_info.lot_control_type == "2.0") {
                        lot_control_type_2();
                        return;
                    }
                    // 3. 不控管
                    if ($scope.barcode_info.lot_control_type == "3" || $scope.barcode_info.lot_control_type == "3.0") {
                        lot_control_type_3();
                        return;
                    }
                }
                get_sqlite_bcmc_by_barcode();
                return;
            };

            // 1. 必須有批號：當批號欄位沒有輸入值時，需要POP窗給使用者輸入
            var lot_control_type_1 = function() {
                if ($scope.l_data.hasSource) {
                    var isShowLotPopup = false;
                    //檢查單據各項次是否有缺少批號
                    angular.forEach(fil_common_requisition.source_doc_detail, function(value) {
                        if (commonService.isEquality(value.item_no, $scope.barcode_info.item_no) &&
                            commonService.isEquality(value.item_feature_no, $scope.barcode_info.item_feature_no)) {
                            if (commonService.isNull(value.lot_no)) {
                                isShowLotPopup = true;
                            }
                        }
                    });

                    //項次都有批號
                    if (!isShowLotPopup) {
                        get_sqlite_bcmc_by_barcode();
                        return;
                    }
                }

                // 條碼明細有設定條碼批號
                if (!commonService.isNull($scope.barcode_info.barcode_lot_no)) {
                    $scope.barcode_info.lot_no = $scope.barcode_info.barcode_lot_no;
                    get_sqlite_bcmc_by_barcode();
                    return;
                }

                // 條碼本身有設定批號
                if (!commonService.isNull($scope.barcode_info.lot_no)) {
                    get_sqlite_bcmc_by_barcode();
                    return;
                }

                //畫面有設定批號
                if (!commonService.isNull($scope.scaninfo.lot_no)) {
                    $scope.barcode_info.lot_no = $scope.scaninfo.lot_no;
                    get_sqlite_bcmc_by_barcode();
                    return;
                }

                commonFactory.showLotPopup($scope.scaninfo.lot_no).then(function(res) {
                    if (!commonService.isNull(res)) {
                        $scope.scaninfo.lot_no = res;
                        $scope.barcode_info.lot_no = res;
                        get_sqlite_bcmc_by_barcode();
                        return;
                    } else {
                        //顯示錯誤 "料號批號管控為必須要有批號，因未輸入批號，不新增至掃描資料！"
                        userInfoService.getVoice($scope.langs.lot_control_error, function() {
                            $scope.clearfocused();
                            $scope.setfocused(4);
                        });
                    }
                });
                return;
            };

            // 2. 不可有批號： APP有輸入批號時　Y： 把批號清空新增　 N： 不新增到掃描明細
            var lot_control_type_2 = function() {
                var isShowLotPopup = false;
                if ($scope.l_data.hasSource) {
                    angular.forEach(fil_common_requisition.source_doc_detail, function(value) {
                        if (commonService.isEquality(value.item_no, $scope.barcode_info.item_no) &&
                            commonService.isEquality(value.item_feature_no, $scope.barcode_info.item_feature_no) &&
                            !commonService.isNull(value.lot_no)) {
                            isShowLotPopup = true;
                        }
                    });
                }

                if (!commonService.isNull($scope.barcode_info.lot_no) ||
                    !commonService.isNull($scope.scaninfo.lot_no) ||
                    isShowLotPopup) {
                    var LotPopup = $ionicPopup.show({
                        title: $scope.langs.point,
                        template: "<p style='text-align: center'>" + $scope.langs.lot_control_point + "</p>",
                        scope: $scope,
                        buttons: [{
                            text: $scope.langs.cancel,
                            onTap: function() {}
                        }, {
                            text: $scope.langs.confirm,
                            onTap: function() {
                                $scope.barcode_info.lot_no = " ";
                                $scope.scaninfo.lot_no = " ";
                                get_sqlite_bcmc_by_barcode();
                                return;
                            }
                        }]
                    });
                    IonicClosePopupService.register(false, LotPopup);
                    return;
                }
                get_sqlite_bcmc_by_barcode();
                return;
            };

            // 3. 不控管
            var lot_control_type_3 = function() {
                // 條碼明細有設定條碼批號
                if (!commonService.isNull($scope.barcode_info.barcode_lot_no)) {
                    $scope.barcode_info.lot_no = $scope.barcode_info.barcode_lot_no;
                    get_sqlite_bcmc_by_barcode();
                    return;
                }

                // 條碼本身有設定批號
                if (!commonService.isNull($scope.barcode_info.lot_no)) {
                    get_sqlite_bcmc_by_barcode();
                    return;
                }

                $scope.barcode_info.lot_no = $scope.scaninfo.lot_no || " ";
                get_sqlite_bcmc_by_barcode();
                return;
            };

            var get_sqlite_bcmc_by_barcode = function() {
                var obj = {
                    type_no: "1"
                };
                $ionicLoading.show();
                APIBridge.callAPI('fil3_bcmc_get', [obj, $scope.l_data, $scope.barcode_info]).then(function(result) {
                    $ionicLoading.hide();
                    check_duplication(result.data);
                }, function(error) {
                    $ionicLoading.hide();
                    userInfoService.getVoice('fil3_bcmc_get fail', function() {});
                    console.log(error);
                });
            };

            var check_duplication = function(result) {

                $scope.barcode_info.reason_code = $scope.scaninfo.reason_code || " ";
                $scope.barcode_info.picking_qty = $scope.scaninfo.qty;
                $scope.barcode_info.ingoing_warehouse_no = $scope.scaninfo.ingoing_warehouse_no || " ";
                $scope.barcode_info.ingoing_storage_spaces_no = $scope.scaninfo.ingoing_storage_spaces_no || " ";

                // 入項
                if ($scope.page_params.in_out_no == "1") {
                    $scope.barcode_info.warehouse_no = $scope.scaninfo.warehouse_no || " ";
                    $scope.barcode_info.storage_spaces_no = $scope.scaninfo.storage_spaces_no || " ";
                    if (commonService.isNull($scope.barcode_info.lot_no)) {
                        $scope.barcode_info.lot_no = " ";
                    }
                }

                if ($scope.page_params.in_out_no == "-1") {
                    //倉庫、儲位、批號預設為畫面上倉庫、儲位、批號值
                    if (commonService.isNull($scope.barcode_info.warehouse_no)) {
                        $scope.barcode_info.warehouse_no = $scope.scaninfo.warehouse_no;
                    }
                    if (commonService.isNull($scope.barcode_info.storage_spaces_no)) {
                        $scope.barcode_info.storage_spaces_no = $scope.scaninfo.storage_spaces_no;
                    }
                    if (commonService.isNull($scope.barcode_info.lot_no)) {
                        $scope.barcode_info.lot_no = $scope.scaninfo.lot_no;
                    }
                }

                var flag = false;
                var error = false;
                var qty = 0;
                if (!$scope.isEditBarcode) {
                    for (var i = 0; i < result.length; i++) {
                        var item = result[i];
                        if (commonService.isEquality(item.barcode_no, $scope.barcode_info.barcode_no) &&
                            commonService.isEquality(item.reason_code, $scope.barcode_info.reason_code) &&
                            commonService.isEquality(item.warehouse_no, $scope.barcode_info.warehouse_no) &&
                            commonService.isEquality(item.storage_spaces_no, $scope.barcode_info.storage_spaces_no) &&
                            commonService.isEquality(item.lot_no, $scope.barcode_info.lot_no)) {
                            flag = true;
                            switch ($scope.barcode_info.barcode_type) {
                                case "1":
                                    if (userInfoService.userInfo.server_product == "易飞" ||
                                        userInfoService.userInfo.server_product == "E10" ||
                                        userInfoService.userInfo.server_product == "WF") {
                                        flag = false;
                                        qty = angular.copy($scope.barcode_info.picking_qty);
                                        $scope.barcode_info.picking_qty = numericalAnalysisService.accAdd(qty, item.picking_qty);
                                        if ($scope.page_params.in_out_no == "-1") {
                                            if ($scope.barcode_info.picking_qty > $scope.barcode_info.inventory_qty) {
                                                error = true;
                                            }
                                        } else {
                                            if ($scope.barcode_info.picking_qty > numericalAnalysisService.accSub($scope.barcode_info.barcode_qty, $scope.barcode_info.inventory_qty)) {
                                                error = true;
                                            }
                                        }
                                    }
                                    break;
                                case "3":
                                    qty = angular.copy($scope.barcode_info.picking_qty);
                                    $scope.barcode_info.picking_qty = numericalAnalysisService.accAdd(qty, item.picking_qty);
                                    if ($scope.page_params.in_out_no == "-1") {
                                        if ($scope.barcode_info.picking_qty > $scope.barcode_info.inventory_qty) {
                                            error = true;
                                        }
                                    }
                                    break;
                            }
                            break;
                        }
                    }
                }
                if (error) {
                    if ($scope.page_params.in_out_no == "-1") {
                        userInfoService.getVoice($scope.langs.picks_error_1, function() {
                            $scope.clearfocused();
                            $scope.setfocused(7);
                        });
                    } else {
                        userInfoService.getVoice($scope.langs.picks_error_2, function() {
                            $scope.clearfocused();
                            $scope.setfocused(7);
                        });
                    }
                    return;
                }
                if (flag) {
                    //顯示錯誤 "資料重複！"
                    userInfoService.getVoice($scope.langs.barcode_duplication_error, function() {
                        $scope.clearfocused();
                        $scope.setfocused(6);
                    });
                    return;
                }
                send_save();
            };

            var send_save = function() {
                APIBridge.callAPI('fil3_bcmc_creat', [$scope.l_data, $scope.barcode_info]).then(function(result) {
                    $ionicLoading.hide();
                    if (result.data[0].code == "1") {
                        get_sqlite_bcme_by_item($scope.barcode_info, false);
                        console.log('fil3_bcmc_creat success');
                    } else {
                        console.log('fil3_bcmc_creat false');
                    }
                }, function(error) {
                    $ionicLoading.hide();
                    userInfoService.getVoice('fil3_bcmc_creat fail', function() {});
                    console.log(error);
                });
            };

            $scope.useBarcode = function(item) {
                $scope.checkScan(item.barcode_no, item.warehouse_no, item.storage_spaces_no, item.lot_no);
                $scope.clearfocused();
                $scope.setfocused(6);
                var index = $scope.inventory_detail.findIndex(function(temp) {
                    return commonService.isEquality(temp.barcode_no, item.barcode_no) &&
                        commonService.isEquality(temp.warehouse_no, item.warehouse_no) &&
                        commonService.isEquality(temp.storage_spaces_no, item.storage_spaces_no) &&
                        commonService.isEquality(temp.lot_no, item.lot_no);
                });
                if (index != -1) {
                    $scope.deleteInventoryDetail(index);
                }
            };

            if ($scope.page_params.in_out_no == '-1' && $scope.page_params.program_job_no != "11" &&
                $scope.page_params.program_job_no != "13-1" && $scope.page_params.program_job_no != "13-5") {
                if ($scope.inventory_detail.length <= 0) {
                    $scope.getInstructions();
                }
            }

            $scope.clearDataCollection();
            if (!commonService.isNull($scope.barcode_info.barcode_no)) {
                $scope.scaninfo.scanning = $scope.barcode_info.barcode_no;
                if ($scope.l_data.hasSource) {
                    get_sqlite_bcme_by_item($scope.barcode_info, true);
                } else {
                    set_Barcode_data($scope.barcode_info, []);
                }
            } else {
                $scope.clearDocInfoObject();
            }
        }
    ];
});
