define(["API", "APIS", 'AppLang', 'views/app/xyc_fil_01/requisition.js', 'array', 'Directives', 'ReqTestData', 'ionic-popup',
    'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService'
], function() {
    return ['$scope', '$state', '$stateParams', '$timeout', '$filter', 'AppLang', 'APIService', 'APIBridge',
        '$ionicLoading', '$ionicPopup', '$ionicModal', '$ionicListDelegate', 'IonicPopupService', 'IonicClosePopupService',
        'xyc_fil_01_requisition', 'ReqTestData', 'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService',
        function($scope, $state, $stateParams, $timeout, $filter, AppLang, APIService, APIBridge,
            $ionicLoading, $ionicPopup, $ionicModal, $ionicListDelegate, IonicPopupService, IonicClosePopupService,
            xyc_fil_01_requisition, ReqTestData, circulationCardService, commonFactory, commonService, userInfoService, scanTypeService, numericalAnalysisService) {

            //彈出視窗區塊 (S)---------------------------------------------------

            //拆分 彈出倉庫選擇頁面
            $scope.warehouseShowPop = function() {
                $scope.splitParameter.focus_me = false;
                commonFactory.showWarehouseModal(userInfoService.warehouse, $scope.showGood, $scope.setwarehousePop, function() {
                    $scope.splitParameter.focus_me = true;
                });
            };

            //拆分 設定倉庫及儲位陣列
            $scope.setwarehousePop = function(warehouse) {
                $scope.splitParameter.focus_me = true;
                $scope.showGood.warehouse_no = warehouse.warehouse_no;
                $scope.showGood.warehouse_name = warehouse.warehouse_name;
                $scope.showGood.storage_management = warehouse.storage_management;
                $scope.sel_in_storage_Pop = warehouse.storage_spaces;
                $scope.clearStoragePop();
            };

            //拆分 彈出儲位選擇頁面
            $scope.storageShowPop = function() {
                $scope.splitParameter.focus_me = false;
                commonFactory.showStorageModal($scope.sel_in_storage_Pop, $scope.showGood, $scope.setstoragePop, function() {
                    $scope.splitParameter.focus_me = true;
                });
            };

            //拆分 設定儲位
            $scope.setstoragePop = function(storage) {
                $scope.splitParameter.focus_me = true;
                $scope.showGood.storage_spaces_no = storage.storage_spaces_no;
                $scope.showGood.storage_spaces_name = storage.storage_spaces_name;
            };

            //拆分 清除儲位
            $scope.clearStoragePop = function() {
                $scope.setstoragePop({
                    storage_spaces_no: "",
                    storage_spaces_name: ""
                });
            };

            //拆分
            $scope.splitGoods = function(index) {
                $scope.setFocusMe(false);
                $scope.showGood = angular.copy($scope.scanning_detail[index]);
                $scope.showGood.popmaxqty = $scope.showGood.qty;

                $scope.showGood.max_inventory_qty = $scope.showGood.inventory_qty;
                $scope.showGood.max_reference_qty = $scope.showGood.reference_qty;
                $scope.showGood.max_valuation_qty = $scope.showGood.valuation_qty;
                $scope.showGood.max_qty = $scope.showGood.qty;

                var showGood_old = angular.copy($scope.scanning_detail[index]);

                //取得倉庫資訊
                var out_warehouse = $scope.showGood.warehouse_no;
                var warehouseIndex = userInfoService.warehouseIndex[out_warehouse] || 0;
                var out_storage_management = userInfoService.warehouse[warehouseIndex].storage_management || "N";
                $scope.sel_in_storage_Pop = userInfoService.warehouse[warehouseIndex].storage_spaces;

                $scope.splitParameter = {
                    index: index,
                    focus_me: true,
                    scanning: "",
                    isShowInventory: false,
                    isShowReference: false,
                    isShowValuation: false,
                };

                if (userInfoService.userInfo.server_product == "EF" ||
                    userInfoService.userInfo.server_product == "E10" ||
                    userInfoService.userInfo.server_product == "WF") {
                    $scope.splitParameter.isShowInventory = true;
                }

                if ($scope.showGood.multi_unit_type == "3") {
                    $scope.splitParameter.isShowReference = true;
                }

                //是否使用計價單位 0.不使用 1.採購 2.銷售 3.兩者
                switch (userInfoService.userInfo.valuation_unit) {
                    case "1":
                        if ($scope.page_params.mod == "APM") {
                            $scope.splitParameter.isShowValuation = true;
                        }
                        break;
                    case "2":
                        if ($scope.page_params.mod == "AXM") {
                            $scope.splitParameter.isShowValuation = true;
                        }
                        break;
                    case "3":
                        if ($scope.page_params.mod == "APM" ||
                            $scope.page_params.mod == "AXM") {
                            $scope.splitParameter.isShowValuation = true;
                        }
                        break;
                }

                $scope.clearSplitInfoScanning = function() {
                    $scope.splitParameter.scanning = "";
                };

                //調用相機 進行掃描條碼
                $scope.SplitInfoScan = function() {
                    console.log("scanBarcode");
                    $scope.clearSplitInfoScanning();
                    APIBridge.callAPI('scanBarcode', [{}]).then(function(result) {
                        if (result) {
                            console.log('scanBarcode success');
                            $timeout(function() {
                                $scope.checkSplitInfoScan(result.data[0].barcode.trim());
                            }, 0);
                        } else {
                            console.log('scanBarcode false');
                        }
                    }, function(result) {
                        console.log("scanBarcode fail");
                        console.log(result);
                    });
                };

                //掃苗框按下 enter 鍵後執行
                $scope.SplitInfoScanned = function(value) {
                    $scope.checkSplitInfoScan(value.trim());
                };

                //檢查掃描後相關資訊
                $scope.checkSplitInfoScan = function(scanning) {
                    $scope.clearSplitInfoScanning();
                    $scope.splitParameter.focus_me = false;
                    if (commonService.isNull(scanning)) {
                        return;
                    }

                    //取得倉庫資訊
                    var index = userInfoService.warehouseIndex[scanning];
                    if (!angular.isUndefined(index)) { //存在於倉庫基本檔
                        $scope.setwarehousePop(userInfoService.warehouse[index]);
                        return;
                    }

                    index = $scope.sel_in_storage_Pop.findIndex(function(item) {
                        return scanning == item.storage_spaces_no;
                    });

                    if (index !== -1) { //存在於儲位基本檔
                        $scope.setstoragePop($scope.sel_in_storage_Pop[index]);
                        return;

                    }

                    $scope.showGood.lot_no = scanning;
                    $scope.splitParameter.focus_me = true;
                    return;
                };

                //計算加減後數值 並呼叫撿查
                $scope.splitCompute = function(type, arg1, arg2) {
                    $scope.setFocusMe(false);
                    var num = numericalAnalysisService.accAdd(arg1, arg2);
                    if (num < 1) {
                        num = 1;
                    }
                    switch (type) {
                        case "inventory":
                            $scope.showGood.inventory_qty = num
                            break;
                        case "reference":
                            $scope.showGood.reference_qty = num;
                            break;
                        case "valuation":
                            $scope.showGood.valuation_qty = num;
                            break;
                        default:
                            $scope.showGood.qty = num;
                            break;
                    }
                    checkSplitQty(type);
                };

                //数量弹窗
                $scope.splitQtyPop = function(type) {
                    var maxqty = "none";
                    var minqty = "none";
                    var qty = 0;

                    switch (type) {
                        case "inventory":
                            maxqty = $scope.showGood.max_inventory_qty;
                            qty = $scope.showGood.inventory_qty;
                            break;
                        case "reference":
                            maxqty = $scope.showGood.max_reference_qty;
                            qty = $scope.showGood.reference_qty;
                            break;
                        case "valuation":
                            maxqty = $scope.showGood.max_valuation_qty;
                            qty = $scope.showGood.valuation_qty;
                            break;
                        default:
                            maxqty = $scope.showGood.maxqty;
                            qty = $scope.showGood.qty
                            break;
                    }

                    commonFactory.showQtyPopup(type, qty, maxqty, minqty, $scope.page_params.in_out_no).then(function(res) {
                        $scope.setFocusMe(true);
                        if (typeof res !== "undefined") {
                            switch (type) {
                                case "inventory":
                                    $scope.showGood.inventory_qty = res;
                                    break;
                                case "reference":
                                    $scope.showGood.reference_qty = res;
                                    break;
                                case "valuation":
                                    $scope.showGood.valuation_qty = res;
                                    break;
                                default:
                                    $scope.showGood.qty = res;
                                    break;
                            }
                            checkSplitQty(type);
                        }
                    });
                };

                //修改數量後檢查
                var checkSplitQty = function(type) {
                    console.log("checkSplitQty");
                    console.log($scope.showGood);

                    //入項數量控卡
                    if ($scope.showGood.qty > $scope.showGood.max_qty) {
                        userInfoService.getVoice($scope.langs.qty + $scope.langs.insufficient + "！", function() {
                            $scope.setFocusMe(true);
                            $scope.inTheScan(false);
                        });
                        $scope.showGood.qty = $scope.showGood.max_qty;
                        return;
                    }

                    //庫存單位
                    if ($scope.showGood.inventory_qty > $scope.showGood.max_inventory_qty) {
                        userInfoService.getVoice($scope.langs.stock + $scope.langs.qty + $scope.langs.insufficient + "！", function() {
                            $scope.setFocusMe(true);
                            $scope.inTheScan(false);
                        });
                        $scope.showGood.inventory_qty = $scope.showGood.max_inventory_qty;
                    }

                    //參考單位
                    if ($scope.showGood.reference_qty > $scope.showGood.max_reference_qty) {
                        userInfoService.getVoice($scope.langs.reference + $scope.langs.qty + $scope.langs.insufficient + "！", function() {
                            $scope.setFocusMe(true);
                            $scope.inTheScan(false);
                        });
                        $scope.showGood.reference_qty = $scope.showGood.max_reference_qty;
                    }

                    //計價單位
                    if ($scope.showGood.valuation_qty > $scope.showGood.max_valuation_qty) {
                        userInfoService.getVoice($scope.langs.valuation + $scope.langs.qty + $scope.langs.insufficient + "！", function() {
                            $scope.setFocusMe(true);
                            $scope.inTheScan(false);
                        });
                        $scope.showGood.valuation_qty = $scope.showGood.max_valuation_qty;
                    }
                    $scope.setFocusMe(true);
                    $scope.inTheScan(false);
                };

                //入項拆分功能
                $scope.setSplitItem = function() {
                    if ($scope.showGood.storage_management == "Y") {
                        if (commonService.isNull($scope.showGood.storage_spaces_no)) {
                            userInfoService.getVoice($scope.langs.storage_management_error, function() {});
                            return;
                        }
                    }
                    $scope.closeSplitItemModal();
                    checkInsertGoods([$scope.showGood], "split", index);
                    return;
                };

                //出項拆分功能
                $scope.setSplitItem2 = function() {
                    var webTran = {
                        service: "app.barcode.get",
                        parameter: {
                            "program_job_no": $scope.page_params.program_job_no,
                            "status": $scope.page_params.status,
                            "barcode_no": $scope.showGood.item_no,
                            "warehouse_no": $scope.showGood.warehouse_no,
                            "storage_spaces_no": $scope.showGood.storage_spaces_no,
                            "lot_no": $scope.showGood.lot_no,
                            "inventory_management_features": "",
                            "param_master": $scope.page_params.doc_array,
                            "info_id": $scope.l_data.info_id,
                            "site_no": userInfoService.userInfo.site_no
                        }
                    };
                    console.log(webTran);
                    $ionicLoading.show();
                    APIService.Web_Post(webTran, function(res) {
                        $ionicLoading.hide();
                        // console.log("success:" + angular.toJson(res));
                        var parameter = res.payload.std_data.parameter;
                        checkSplitItem(parameter);
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

                //檢查回傳條碼陣列
                var checkSplitItem = function(parameter) {
                    $scope.selbarcodedata = parameter.barcode_detail;
                    console.log(parameter.barcode_detail);

                    // WS 回傳條碼資訊若為零
                    if ($scope.selbarcodedata.length === 0) {
                        //顯示錯誤 "此倉儲批無庫存數量！"
                        userInfoService.getVoice($scope.langs.these + $scope.langs.warehouse_storage_lot + $scope.langs.not + $scope.langs.stock + $scope.langs.qty + "！", function() {
                            $scope.setFocusMe(true);
                            $scope.inTheScan(false);
                        });
                        return;
                    }

                    // 去除與要拆分的項次 相同料倉儲批的資料
                    var index = $scope.selbarcodedata.findIndex(function(item) {
                        return commonService.isEquality(showGood_old.item_no, item.item_no) &&
                            commonService.isEquality(showGood_old.item_feature_no, item.item_feature_no) &&
                            commonService.isEquality(showGood_old.warehouse_no, item.warehouse_no) &&
                            commonService.isEquality(showGood_old.storage_spaces_no, item.storage_spaces_no) &&
                            commonService.isEquality(showGood_old.lot_no, item.lot_no);
                    });

                    if (index != -1) {
                        $scope.selbarcodedata.splice(index, 1);
                    }

                    //檢查庫存數量
                    var selbarcodedata = [];
                    angular.forEach($scope.selbarcodedata, function(item) {
                        if (item.inventory_qty > $scope.showGood.qty) {
                            item.qty = $scope.showGood.qty;
                            selbarcodedata.push(item);
                        }
                    });
                    $scope.selbarcodedata = selbarcodedata;

                    if ($scope.selbarcodedata.length === 0) {
                        //顯示錯誤 "此倉儲批庫存數量不足！"
                        userInfoService.getVoice($scope.langs.these + $scope.langs.warehouse_storage_lot + $scope.langs.stock + $scope.langs.qty + $scope.langs.insufficient + "！", function() {
                            $scope.setFocusMe(true);
                            $scope.inTheScan(false);
                        });
                        return;
                    }

                    //如果只有一筆 直接拆分
                    if ($scope.selbarcodedata.length == 1) {
                        checkInsertGoods($scope.selbarcodedata, "split", $scope.splitParameter.index);
                    } else {
                        $scope.showGood.alreadyIssueQty = 0;
                        //計算加減後數值 並呼叫撿查
                        $scope.splitcompute = function(value, index) {
                            var value1 = $scope.selbarcodedata[index].qty;
                            var num = numericalAnalysisService.accAdd(value1, value);
                            if (num < 1) {
                                num = 1;
                            }
                            if (num > $scope.showGood.qty) {
                                num = $scope.showGood.qty;
                                if ($scope.page_params.in_out_no == "-1") {
                                    userInfoService.getVoice($scope.langs.picks_error_1, function() {
                                        $scope.setFocusMe(true);
                                        $scope.inTheScan(false);
                                    });
                                } else {
                                    userInfoService.getVoice($scope.langs.picks_error_2, function() {
                                        $scope.setFocusMe(true);
                                        $scope.inTheScan(false);
                                    });
                                }
                            }
                            $scope.selbarcodedata[index].qty = num;
                            if (!$scope.checkSplitQty()) {
                                $scope.selbarcodedata[index].qty = value1;
                            }
                        };

                        //檢查已發數量是否大於可發數量
                        $scope.checkSplitQty = function(index) {
                            var qty = 0;
                            angular.forEach($scope.selbarcodedata, function(item) {
                                if (item.checked) {
                                    qty = numericalAnalysisService.accAdd(qty, item.qty);
                                }
                            });
                            var flag = true;
                            if (qty > $scope.showGood.qty) {
                                if ($scope.page_params.in_out_no == "-1") {
                                    userInfoService.getVoice($scope.langs.picks_error_1, function() {
                                        $scope.setFocusMe(true);
                                        $scope.inTheScan(false);
                                    });
                                } else {
                                    userInfoService.getVoice($scope.langs.picks_error_2, function() {
                                        $scope.setFocusMe(true);
                                        $scope.inTheScan(false);
                                    });
                                }
                                flag = false;
                            }

                            if (flag) {
                                $scope.showGood.alreadyIssueQty = qty;
                            }
                            if (!angular.isUndefined(index)) {
                                if ($scope.selbarcodedata[index].checked) {
                                    $scope.selbarcodedata[index].checked = flag;
                                }
                            }
                            return flag;
                        };

                        $ionicModal.fromTemplateUrl('views/app/xyc_fil_01/xyc_fil_01_s07/selbarcodedata.html', {
                            scope: $scope
                        }).then(function(modal) {
                            $scope.closeSelbarcodedata = function() {
                                modal.hide().then(function() {
                                    return modal.remove();
                                });
                            };
                            modal.show();
                        });
                    }
                };

                $ionicModal.fromTemplateUrl('views/app/xyc_fil_01/xyc_fil_01_s07/splitItemModal.html', {
                    scope: $scope
                }).then(function(modal) {
                    $scope.closeSplitItemModal = function() {
                        modal.hide().then(function() {
                            return modal.remove();
                        });
                    };
                    modal.show();
                });
                $ionicListDelegate.closeOptionButtons();
            };

            //彈出視窗區塊 (E)---------------------------------------------------

            //左滑删除
            $scope.deleteGoods = function(index) {
                $scope.scanning_detail.splice(index, 1);
                $ionicListDelegate.closeOptionButtons();
            };

            $scope.closeOption = function() {
                $ionicListDelegate.closeOptionButtons();
            };

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

                $scope.inTheScan(true);

                //取得倉庫資訊
                var index = userInfoService.warehouseIndex[scanning];
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

                if ($scope.page_params.in_out_no == "1" ||
                    ($scope.page_params.program_job_no == "9-1" && (userInfoService.userInfo.gp_flag || userInfoService.userInfo.server_product == "WF"))) {
                    if ($scope.scaninfo.storage_management == "Y") {
                        if (commonService.isNull($scope.scaninfo.storage_spaces_no)) {
                            userInfoService.getVoice($scope.langs.storage_management_error, function() {
                                $scope.setFocusMe(true);
                                $scope.inTheScan(false);
                            });
                            return;
                        }
                    }
                }
                var scan_type = angular.copy($scope.page_params.scan_type);
                if ($scope.page_params.program_job_no == "7-1" || $scope.page_params.program_job_no == "9-1") {
                    scan_type = scanTypeService.judgmentScanType(scanning, userInfoService.userInfo.barcode_separator);
                    $scope.scaninfo.qty = 0;
                    $scope.scaninfo.maxqty = 0;
                }

                //如果為 作業代號 7-1 發料(單據) 只能有一張單據 掃描新單據後刪除舊單據
                if ($scope.page_params.program_job_no == "7-1") {
                    $scope.initShowGood();
                    $scope.clearList();

                    if (commonService.Platform == "Chrome") {
                        app_todo_doc_get(scan_type, scanning);
                        return;
                    }
                    APIBridge.callAPI('xyc_bcme_ae_af_delete', [$scope.l_data]).then(function(result) {
                        $ionicLoading.hide();
                        app_todo_doc_get(scan_type, scanning);
                    }, function(result) {
                        $ionicLoading.hide();
                        userInfoService.getVoice('bcme_ae_af_delete fail', function() {});
                        console.log(result);
                    });
                    return;
                }
                app_todo_doc_get(scan_type, scanning);
            };

            var app_todo_doc_get = function(scan_type, scanning) {
                var webTran = {
                    service: 'app.todo.doc.get',
                    parameter: {
                        "program_job_no": $scope.page_params.program_job_no,
                        "scan_type": scan_type,
                        "status": $scope.page_params.status,
                        "analysis_symbol": userInfoService.userInfo.barcode_separator || "%",
                        "site_no": userInfoService.userInfo.site_no,
                        "info_id": $scope.l_data.info_id,
                        "param_master": [{
                            "doc_no": scanning,
                            "seq": ""
                        }]
                    }
                };
                $ionicLoading.show();
                APIService.Web_Post(webTran, function(res) {
                    $ionicLoading.hide();
                    // console.log("success:" + angular.toJson(res));
                    var parameter = res.payload.std_data.parameter;
                    xyc_fil_01_requisition.setParameter(parameter);
                    setCirculationCard(scanning);
                }, function(error) {
                    $ionicLoading.hide();
                    var execution = error.payload.std_data.execution;
                    console.log("error:" + execution.description);
                    userInfoService.getVoice(execution.description, function() {
                        $scope.setFocusMe(true);
                        $scope.inTheScan(false);
                        $scope.clearScanning();
                    });
                });
            };

            var setCirculationCard = function(scanning) {
                var source_doc_detail = xyc_fil_01_requisition.getSourceDocDetail();
                if (source_doc_detail.length <= 0) {
                    if (!commonService.isNull($scope.scaninfo.scanning)) {
                        if (scanning.length <= userInfoService.userInfo.lot_length) {
                            var LotPopup = $ionicPopup.show({
                                title: $scope.langs.checkField + $scope.langs.lot,
                                scope: $scope,
                                buttons: [{
                                    text: $scope.langs.cancel,
                                    onTap: function() {
                                        userInfoService.getVoice($scope.langs.not + $scope.langs.these + $scope.langs.receipt, function() {
                                            $scope.setFocusMe(true);
                                            $scope.inTheScan(false);
                                        });
                                    }
                                }, {
                                    text: $scope.langs.confirm,
                                    onTap: function() {
                                        $scope.scaninfo.lot_no = scanning;
                                        $scope.setFocusMe(true);
                                        $scope.inTheScan(false);
                                    }
                                }]
                            });
                        } else {
                            userInfoService.getVoice($scope.langs.not + $scope.langs.these + $scope.langs.receipt, function() {
                                $scope.setFocusMe(true);
                                $scope.inTheScan(false);
                            });
                            return;
                        }
                    }
                    return;
                }

                console.log(source_doc_detail);
                var doc = source_doc_detail[0];
                if ($scope.page_params.program_job_no == "7-1") {
                    $scope.scaninfo.qty = numericalAnalysisService.accSub(doc.production_qty, doc.production_in_out_qty);
                    var rate = numericalAnalysisService.accAdd(1, numericalAnalysisService.accDiv(doc.allow_error_rate, 100));
                    $scope.scaninfo.maxqty = numericalAnalysisService.to_round(numericalAnalysisService.accSub(numericalAnalysisService.accMul(doc.production_qty, rate), doc.production_in_out_qty), doc.decimal_places, doc.decimal_places_type);
                    $scope.selItemPopShow(scanning, source_doc_detail);
                    return;
                }

                if ($scope.page_params.program_job_no == "9-1") {
                    var doc_qty = doc.doc_qty || 0;
                    var in_out_qty = doc.in_out_qty || 0;
                    var qty = numericalAnalysisService.accSub(doc_qty, in_out_qty);

                    if (doc_qty === 0) {
                        userInfoService.getVoice($scope.langs.picks_error_2, function() {
                            $scope.setFocusMe(true);
                        });
                        return;
                    }

                    if (qty === 0) {
                        userInfoService.getVoice($scope.langs.alreadyPutInStorage + in_out_qty + " , " +
                            $scope.langs.not_required + $scope.langs.put_in_storage,
                            function() {
                                $scope.setFocusMe(true);
                            });
                        return;
                    }
                    getInsertGoods(scanning, source_doc_detail);
                    return;
                }
                $scope.selItemPopShow(scanning, source_doc_detail);
                return;
            };

            $scope.selItemPopShow = function(scanning, source_doc_detail) {
                if (source_doc_detail.length <= 0) {
                    return;
                }
                var array = [];
                angular.forEach(source_doc_detail, function(value) {
                    var index = array.findIndex(function(item) {
                        return commonService.isEquality(value.item_no, item.item_no) &&
                            commonService.isEquality(value.item_feature_no, item.item_feature_no) &&
                            commonService.isEquality(value.in_out_date1, item.in_out_date1);
                    });

                    var rate = numericalAnalysisService.accAdd(1, numericalAnalysisService.accDiv(value.allow_error_rate, 100));
                    value.maxqty = numericalAnalysisService.to_round(numericalAnalysisService.accSub(numericalAnalysisService.accMul(value.doc_qty, rate), value.in_out_qty), value.decimal_places, value.decimal_places_type);

                    if (index !== -1) {
                        array[index].maxqty = array[index].maxqty + value.maxqty;
                    } else {
                        if (value.maxqty > 0) {
                            array.push(angular.copy(value));
                        }
                    }
                });

                if (array.length === 0) {
                    var errormessage = $scope.langs.picks_error_2;
                    if ($scope.page_params.in_out_no == "-1") {
                        errormessage = $scope.langs.picks_error_1;
                    }
                    userInfoService.getVoice(errormessage, function() {
                        $scope.setFocusMe(true);
                        $scope.inTheScan(false);
                    });
                    return;
                }

                $scope.selItem = function() {
                    var sel_doc_detail = [];
                    for (var i = 0; i < $scope.item_detail.length; i++) {
                        var element = $scope.item_detail[i];
                        if (!element.checked) {
                            continue;
                        }
                        for (var j = 0; j < source_doc_detail.length; j++) {
                            if (commonService.isEquality(element.item_no, source_doc_detail[j].item_no) &&
                                commonService.isEquality(element.item_feature_no, source_doc_detail[j].item_feature_no)) {
                                sel_doc_detail.push(angular.copy(source_doc_detail[j]));
                            }
                        }
                    }
                    if (sel_doc_detail.length === 0) {
                        userInfoService.getVoice($scope.langs.sel_item_error, function() {
                            $scope.setFocusMe(true);
                            $scope.inTheScan(false);
                        });
                        return;
                    }
                    $scope.close();
                    console.log(sel_doc_detail)
                    getInsertGoods(scanning, sel_doc_detail);
                };

                $scope.item_detail = array;
                $ionicModal.fromTemplateUrl('views/app/xyc_fil_01/xyc_fil_01_s07/selItemModal.html', {
                    scope: $scope
                }).then(function(modal) {
                    $scope.close = function() {
                        modal.hide().then(function() {
                            return modal.remove();
                        });
                    };
                    modal.show();
                });
            };

            var getInsertGoods = function(scanning, source_doc_detail) {
                var count = 0,
                    qtyCount = 0,
                    insertCount = 0;
                var error_message = "";
                var tempArr1 = [],
                    tempArr2 = [],
                    tempArr1_flag = false,
                    tempArr2_flag = false;
                $scope.scaninfo.checked = false;
                for (var i = 0; i < source_doc_detail.length; i++) {
                    var value = source_doc_detail[i];
                    var rate = numericalAnalysisService.accAdd(1, numericalAnalysisService.accDiv(value.allow_error_rate, 100));
                    var temp = {
                        "item_no": value.item_no,
                        "item_name": value.item_name || value.item_no,
                        "item_spec": value.item_spec,
                        "item_feature_no": value.item_feature_no,

                        "doc_qty": numericalAnalysisService.accSub(value.doc_qty, value.in_out_qty),
                        "qty": numericalAnalysisService.accSub(value.doc_qty, value.in_out_qty),
                        "maxqty": numericalAnalysisService.to_round(numericalAnalysisService.accSub(numericalAnalysisService.accMul(value.doc_qty, rate), value.in_out_qty), value.decimal_places, value.decimal_places_type),
                        "unit": value.unit_no,

                        "warehouse_no": $scope.scaninfo.warehouse_no,
                        "warehouse_name": $scope.scaninfo.warehouse_name,
                        "storage_management": $scope.scaninfo.storage_management,
                        "storage_spaces_no": $scope.scaninfo.storage_spaces_no,
                        "storage_spaces_name": $scope.scaninfo.storage_spaces_name,
                        "lot_no": value.lot_no || $scope.scaninfo.lot_no,
                        "inventory_management_features": " ",
                        "barcode_no": " ",
                        "qpa_molecular": value.qpa_molecular,
                        "qpa_denominator": value.qpa_denominator,
                        "packing_barcode": "N",
                        "packing_qty": 0,

                        "source_no": value.source_no,
                        "seq": value.seq,
                        "doc_line_seq": value.doc_line_seq,
                        "doc_batch_seq": value.doc_batch_seq,

                        "run_card_no": value.run_card_no,
                        "object_no": value.object_no,
                        "main_organization": value.main_organization,

                        "decimal_places": value.decimal_places,
                        "decimal_places_type": value.decimal_places_type,
                        "lot_control_type": value.lot_control_type,
                        "conversion_rate_denominator": value.conversion_rate_denominator,
                        "conversion_rate_molecular": value.conversion_rate_molecular,

                        "inventory_unit": value.inventory_unit,
                        "reference_unit_no": value.reference_unit_no,
                        "valuation_unit_no": value.valuation_unit_no,

                        "inventory_qty": value.inventory_qty,
                        "reference_qty": value.reference_qty,
                        "valuation_qty": value.valuation_qty,

                        "inventory_rate": value.inventory_rate,
                        "reference_rate": value.reference_rate,
                        "valuation_rate": value.valuation_rate,

                        "multi_unit_type": value.multi_unit_type,
                    };

                    if ($scope.l_data.use_erp_warehousing) {
                        if (value.erp_warehousing == "Y") {
                            temp.warehouse_no = value.warehouse_no;
                            temp.storage_spaces_no = value.storage_spaces_no;
                        }
                    }

                    count = count + 1;
                    var otherQty = 0;
                    if ($scope.scanning_detail.length > 0) {
                        angular.forEach($scope.scanning_detail, function(item) {
                            if (commonService.isEquality(temp.source_no, item.source_no) &&
                                commonService.isEquality(temp.seq, item.seq) &&
                                commonService.isEquality(temp.doc_line_seq, item.doc_line_seq) &&
                                commonService.isEquality(temp.doc_batch_seq, item.doc_batch_seq) &&
                                (!commonService.isEquality(temp.warehouse_no, item.warehouse_no) ||
                                    !commonService.isEquality(temp.storage_spaces_no, item.storage_spaces_no) ||
                                    !commonService.isEquality(temp.lot_no, item.lot_no))) {
                                otherQty = numericalAnalysisService.accAdd(otherQty, item.qty);
                            }
                        });
                        temp.qty = numericalAnalysisService.accSub(temp.qty, otherQty);
                    }

                    if (temp.maxqty === 0) {
                        qtyCount = qtyCount + 1;
                        continue;
                    }

                    if ($scope.scanning_detail.length > 0) {
                        //檢查是否存在明細
                        var index = $scope.scanning_detail.findIndex(function(item) {
                            return commonService.isEquality(temp.source_no, item.source_no) &&
                                commonService.isEquality(temp.seq, item.seq) &&
                                commonService.isEquality(temp.doc_line_seq, item.doc_line_seq) &&
                                commonService.isEquality(temp.doc_batch_seq, item.doc_batch_seq) &&
                                commonService.isEquality(temp.warehouse_no, item.warehouse_no) &&
                                commonService.isEquality(temp.storage_spaces_no, item.storage_spaces_no) &&
                                commonService.isEquality(temp.lot_no, item.lot_no);
                        });

                        //如果有同 單號 項次 項序 分批序 倉 儲 批
                        if (index !== -1) {
                            insertCount = insertCount + 1;
                            continue;
                        }
                    }

                    if ($scope.page_params.in_out_no == "-1") {
                        insertGoods(temp);
                        continue;
                    }

                    if (!userInfoService.userInfo.lot_auto) {
                        // 1. 必須有批號：當批號欄位沒有輸入值時，需要POP窗給使用者輸入
                        if (temp.lot_control_type == "1" && ($scope.page_params.in_out_no != "0" || userInfoService.userInfo.gp_flag)) {
                            tempArr1_flag = true;
                            tempArr1.push(temp);
                            continue;
                        }
                    }

                    // 2. 不可有批號： APP有輸入批號時　Y： 把批號清空新增　 N： 不新增到掃描明細
                    if (temp.lot_control_type == "2" && temp.lot_no) {
                        tempArr2_flag = true;
                        tempArr2.push(temp);
                        continue;
                    }

                    // 3. 不控管
                    insertGoods(temp);
                }

                if (tempArr1_flag) {
                    checkInsertGoods(tempArr1, "insert", "0");
                }

                if (tempArr2_flag) {
                    checkInsertGoods(tempArr2, "insert", "0");
                }

                if (count == insertCount) {
                    if (commonService.isNull(error_message)) {
                        error_message = $scope.langs.sel_item_exist_error;
                    }
                    if ($scope.page_params.program_job_no == "9-1") {
                        error_message = $scope.langs.data_duplication_error;
                    }
                    userInfoService.getVoice(error_message, function() {
                        $scope.setFocusMe(true);
                        $scope.inTheScan(false);
                    });
                }

                if (qtyCount !== 0) {
                    var errormessage = $scope.langs.picks_error_2;
                    if ($scope.page_params.in_out_no == "-1") {
                        errormessage = $scope.langs.picks_error_1;
                    }
                    userInfoService.getVoice(errormessage, function() {
                        $scope.setFocusMe(true);
                        $scope.inTheScan(false);
                    });
                }
                $scope.addDocArray(scanning);
                $scope.bcmeCreate({
                    "source_doc_detail": source_doc_detail
                });
                $scope.clearScanning();
            };

            //入項 批號管控
            var checkInsertGoods = function(tempArr, type, index) {
                var flag = false;
                var array = [];
                // 1. 必須有批號：當批號欄位沒有輸入值時，需要POP窗給使用者輸入
                if (tempArr[0].lot_control_type == "1" && ($scope.page_params.in_out_no != "0" || userInfoService.userInfo.gp_flag)) {
                    angular.forEach(tempArr, function(value) {
                        if (commonService.isNull(value.lot_no) && !userInfoService.userInfo.lot_auto) {
                            flag = true;
                            array.push(value);
                        } else {
                            insertGoods(value, type, index);
                        }
                    });

                    if (flag) {
                        commonFactory.showLotPopup($scope.scaninfo.lot_no).then(function(res) {
                            if (!commonService.isNull(res)) {
                                $scope.scaninfo.lot_no = res;
                                angular.forEach(array, function(value) {
                                    value.lot_no = res;
                                    insertGoods(value, type, index);
                                });
                            } else {
                                userInfoService.getVoice($scope.langs.lot_control_error, function() {
                                    $scope.setFocusMe(true);
                                    $scope.inTheScan(false);
                                });
                            }
                        });
                    }
                    return;
                }

                // 2. 不可有批號： APP有輸入批號時　Y： 把批號清空新增　 N： 不新增到掃描明細
                if (tempArr[0].lot_control_type == "2") {
                    angular.forEach(tempArr, function(value) {
                        if (value.lot_no && value.lot_no != " ") {
                            flag = true;
                            array.push(value);
                        } else {
                            insertGoods(value, type, index);
                        }
                    });

                    if (flag) {
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
                                    angular.forEach(array, function(value) {
                                        value.lot_no = "";
                                        insertGoods(value, type, index);
                                    });
                                }
                            }]
                        });
                        IonicClosePopupService.register(false, LotPopup);
                    }
                    return;
                }

                // 3. 不控管
                if (tempArr[0].lot_control_type == "3" || type == "split") {
                    insertGoods(tempArr[0], type, index);
                }
            };

            var insertGoods = function(temp, type, index) {

                var flag = true;
                if ($scope.scanning_detail.length > 0) {
                    angular.forEach($scope.scanning_detail, function(value) {
                        if (commonService.isEquality(value.warehouse_no, temp.warehouse_no) &&
                            commonService.isEquality(value.storage_spaces_no, temp.storage_spaces_no) &&
                            commonService.isEquality(value.lot_no, temp.lot_no) &&
                            commonService.isEquality(value.inventory_management_features, temp.inventory_management_features) &&
                            commonService.isEquality(value.source_no, temp.source_no) &&
                            commonService.isEquality(value.seq, temp.seq) &&
                            commonService.isEquality(value.doc_line_seq, temp.doc_line_seq) &&
                            commonService.isEquality(value.doc_batch_seq, temp.doc_batch_seq)) {
                            flag = false;
                        }
                    });
                }

                if (!flag) {
                    //顯示錯誤 "資料重複！"
                    userInfoService.getVoice($scope.langs.data_duplication_error, function() {
                        $scope.setFocusMe(true);
                        $scope.inTheScan(false);
                    });

                    return flag;
                }

                if (type == "split") {
                    var element = angular.copy($scope.scanning_detail[index]);
                    element.qty = numericalAnalysisService.accSub(element.qty, temp.qty);
                    element.inventory_qty = numericalAnalysisService.accSub(element.inventory_qty, temp.inventory_qty);
                    element.reference_qty = numericalAnalysisService.accSub(element.reference_qty, temp.reference_qty);
                    element.valuation_qty = numericalAnalysisService.accSub(element.valuation_qty, temp.valuation_qty);
                    if (element.qty === 0) {
                        $scope.deleteGoods(index);
                    } else {
                        $scope.scanning_detail[index] = element;
                    }
                }

                $scope.addGoods(temp);
            };

            //修改批號
            $scope.editLot = function(index) {
                $scope.setFocusMe(false);
                $ionicListDelegate.closeOptionButtons();
                var showGood = angular.copy($scope.scanning_detail[index]);
                var webTran = {
                    service: 'app.lot.get',
                    parameter: {
                        "program_job_no": $scope.page_params.program_job_no,
                        "status": $scope.page_params.status,
                        "item_no": showGood.item_no,
                        "item_feature_no": showGood.item_feature_no,
                        "site_no": userInfoService.userInfo.site_no,
                        "object_no": ($scope.page_params.program_job_no != "7-1") ? showGood.object_no : "",
                        "action": (commonService.isNull(showGood.lot_no)) ? "I" : "Q", //Q.查詢 I.新增
                        "lot_no": showGood.lot_no
                    }
                };

                $ionicLoading.show();
                APIService.Web_Post(webTran, function(res) {
                    $ionicLoading.hide();
                    // console.log("success:" + angular.toJson(res));
                    var parameter = res.payload.std_data.parameter;
                    showSetLot(index, parameter);
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

            var showSetLot = function(index, parameter) {
                if (parameter.lot_detail.length < 0) {
                    return;
                }
                var showGood = angular.copy($scope.scanning_detail[index]);

                var effective_date = new Date(parameter.lot_detail[0].effective_date);
                var flag = angular.isDate(effective_date);
                if (!flag) {
                    effective_date = new Date();
                }

                $scope.showGood = {
                    item_no: parameter.lot_detail[0].item_no,
                    item_name: showGood.item_name,
                    item_feature_no: parameter.lot_detail[0].item_feature_no,
                    lot_no: parameter.lot_detail[0].lot_no,
                    lot_description: parameter.lot_detail[0].lot_description,
                    effective_date: effective_date,
                    effective_deadline: parameter.lot_detail[0].effective_deadline,
                    remarks: parameter.lot_detail[0].remarks
                };

                var oldshowGood = angular.copy($scope.showGood);

                $scope.setLot = function() {
                    var flag = angular.equals(oldshowGood, $scope.showGood);
                    if (!flag) {
                        updateLot();
                    }
                    $scope.close();
                    setLot(index);
                };

                $ionicModal.fromTemplateUrl('views/app/xyc_fil_01/xyc_fil_01_s07/setLotModal.html', {
                    scope: $scope
                }).then(function(modal) {
                    $scope.close = function() {
                        modal.hide().then(function() {
                            return modal.remove();
                        });
                    };
                    modal.show();
                });
            };

            var updateLot = function() {
                var webTran = {
                    service: 'app.lot.update',
                    parameter: {
                        "item_no": $scope.showGood.item_no,
                        "item_feature_no": $scope.showGood.item_feature_no,
                        "site_no": userInfoService.userInfo.site_no,
                        "lot_no": $scope.showGood.lot_no,
                        "lot_description": $scope.showGood.lot_description,
                        "effective_date": $filter('date')($scope.showGood.effective_date, 'yyyy-MM-dd'),
                        "effective_deadline": $scope.showGood.effective_deadline,
                        "remarks": $scope.showGood.remarks
                    }
                };

                $ionicLoading.show();
                APIService.Web_Post(webTran, function(res) {
                    // console.log("success:" + angular.toJson(res));
                    $ionicLoading.hide();
                    $scope.setFocusMe(true);
                    $scope.inTheScan(false);
                }, function(error) {
                    $ionicLoading.hide();
                    errorpop(error.payload.std_data.execution.description).then(function() {
                        $scope.setFocusMe(true);
                        $scope.inTheScan(false);
                    });
                    console.log(error);
                });
            };

            var setLot = function(index) {
                var temp = $scope.scanning_detail[index];
                if (commonService.isEquality(temp.item_no, $scope.showGood.item_no) &&
                    commonService.isEquality(temp.item_feature_no, $scope.showGood.item_feature_no)) {
                    temp.lot_no = $scope.showGood.lot_no;
                }
                $scope.setFocusMe(true);
                $scope.inTheScan(false);
            };

            //数量弹窗
            $scope.showQtyPop = function(type) {
                $scope.setFocusMe(false);
                var maxqty = 0;
                var minqty = "none";
                var qty = 0;
                if (type == "scaninfo") {
                    maxqty = $scope.scaninfo.maxqty;
                    qty = $scope.scaninfo.qty;
                } else if (type == "pop") {
                    maxqty = $scope.showGood.popmaxqty;
                    qty = $scope.showGood.qty;
                } else {
                    var temp = $scope.scanning_detail[type];
                    var otherQty = 0;
                    angular.forEach($scope.scanning_detail, function(value) {
                        if (commonService.isEquality(value.source_no, temp.source_no) &&
                            commonService.isEquality(value.seq, temp.seq) &&
                            commonService.isEquality(value.doc_line_seq, temp.doc_line_seq) &&
                            commonService.isEquality(value.doc_batch_seq, temp.doc_batch_seq) &&
                            (!commonService.isEquality(value.warehouse_no, temp.warehouse_no) ||
                                !commonService.isEquality(value.storage_spaces_no, temp.storage_spaces_no) ||
                                !commonService.isEquality(value.lot_no, temp.lot_no) ||
                                !commonService.isEquality(value.inventory_management_features, temp.inventory_management_features))) {
                            otherQty = numericalAnalysisService.accAdd(otherQty, value.qty);
                        }
                    });
                    if (angular.isUndefined(temp.maxqty)) {
                        var sourceDocDetail = xyc_fil_01_requisition.getSourceDocDetail();
                        index = sourceDocDetail.findIndex(function(value) {
                            return commonService.isEquality(value.item_no, temp.item_no) &&
                                commonService.isEquality(value.item_feature_no, temp.item_feature_no &&
                                    commonService.isEquality(value.source_no, temp.source_no) &&
                                    commonService.isEquality(value.seq, temp.seq) &&
                                    commonService.isEquality(value.doc_line_seq, temp.doc_line_seq) &&
                                    commonService.isEquality(value.doc_batch_seq, temp.doc_batch_seq));
                        });
                        if (index != -1) {
                            temp.maxqty = sourceDocDetail[index].allow_doc_qty;
                        } else {
                            temp.maxqty = 0;
                        }
                    }
                    maxqty = numericalAnalysisService.accSub(temp.maxqty, otherQty);
                    qty = $scope.scanning_detail[type].qty;
                }
                var in_out_no = $scope.page_params.in_out_no;
                commonFactory.showQtyPopup(type, qty, maxqty, minqty, in_out_no).then(function(res) {
                    if (typeof res !== "undefined") {
                        if (type == "scaninfo") {
                            $scope.scaninfo.qty = checkShowgood(res);
                        } else if (type == "pop") {
                            $scope.showGood.qty = checkQty(res, type);
                        } else {
                            $scope.scanning_detail[type].qty = checkQty(res, type);
                        }
                    }
                });
            };

            var checkQty = function(qty, index) {
                $scope.setFocusMe(false);
                if (index == "pop") {
                    if (qty > $scope.showGood.popmaxqty) {
                        qty = $scope.showGood.popmaxqty;
                    } else if (qty < 1) {
                        qty = 1;
                    }
                } else {
                    var temp = $scope.scanning_detail[index];
                    var otherQty = 0;
                    angular.forEach($scope.scanning_detail, function(value) {
                        if (commonService.isEquality(value.source_no, temp.source_no) &&
                            commonService.isEquality(value.seq, temp.seq) &&
                            commonService.isEquality(value.doc_line_seq, temp.doc_line_seq) &&
                            commonService.isEquality(value.doc_batch_seq, temp.doc_batch_seq) &&
                            (!commonService.isEquality(value.warehouse_no, temp.warehouse_no) ||
                                !commonService.isEquality(value.storage_spaces_no, temp.storage_spaces_no) ||
                                !commonService.isEquality(value.lot_no, temp.lot_no) ||
                                !commonService.isEquality(value.inventory_management_features, temp.inventory_management_features))) {
                            otherQty = numericalAnalysisService.accAdd(otherQty, value.qty);
                        }
                    });
                    total = numericalAnalysisService.accAdd(qty, otherQty);
                    if (angular.isUndefined(temp.maxqty)) {
                        var sourceDocDetail = xyc_fil_01_requisition.getSourceDocDetail();
                        index = sourceDocDetail.findIndex(function(value) {
                            return commonService.isEquality(value.item_no, temp.item_no) &&
                                commonService.isEquality(value.item_feature_no, temp.item_feature_no &&
                                    commonService.isEquality(value.source_no, temp.source_no) &&
                                    commonService.isEquality(value.seq, temp.seq) &&
                                    commonService.isEquality(value.doc_line_seq, temp.doc_line_seq) &&
                                    commonService.isEquality(value.doc_batch_seq, temp.doc_batch_seq));
                        });
                        if (index != -1) {
                            temp.maxqty = sourceDocDetail[index].allow_doc_qty;
                        } else {
                            temp.maxqty = 0;
                        }
                    }
                    if (total > temp.maxqty) {
                        if ($scope.page_params.in_out_no == "-1") {
                            userInfoService.getVoice($scope.langs.picks_error_1, function() {
                                $scope.setFocusMe(true);
                                $scope.inTheScan(false);
                            });
                        } else {
                            userInfoService.getVoice($scope.langs.picks_error_2, function() {
                                $scope.setFocusMe(true);
                                $scope.inTheScan(false);
                            });
                        }
                        qty = numericalAnalysisService.accSub(temp.maxqty, otherQty);
                    } else if (qty < 1) {
                        qty = 1;
                    }
                }
                return qty;
            };

            //計算加減後數值 並呼叫撿查
            $scope.compute = function(value) {
                var value1 = angular.copy($scope.scaninfo.qty);
                var num = numericalAnalysisService.accAdd(value1, value);
                if (num < 1) {
                    num = 1;
                }
                $scope.scaninfo.qty = checkShowgood(num);
            };

            var checkShowgood = function(qty) {
                $scope.setFocusMe(false);
                if (qty > $scope.scaninfo.maxqty) {
                    if ($scope.page_params.in_out_no == "-1") {
                        userInfoService.getVoice($scope.langs.picks_error_1, function() {
                            $scope.setFocusMe(true);
                            $scope.inTheScan(false);
                        });
                    } else {
                        userInfoService.getVoice($scope.langs.picks_error_2, function() {
                            $scope.setFocusMe(true);
                            $scope.inTheScan(false);
                        });
                    }
                    qty = $scope.scaninfo.maxqty;
                } else if (qty < 1) {
                    qty = 1;
                }

                //生產數量*標準QPA分子/標準QPA分母
                if ($scope.scanning_detail.length > 0) {
                    angular.forEach($scope.scanning_detail, function(value) {

                        //防呆 避免WS無回傳值
                        if (!value.qpa_molecular) {
                            value.qpa_molecular = 1;
                        }
                        if (!value.qpa_denominator) {
                            value.qpa_denominator = 1;
                        }
                        value.qty = numericalAnalysisService.to_round(
                            numericalAnalysisService.accDiv(numericalAnalysisService.accMul(qty, value.qpa_molecular), value.qpa_denominator),
                            value.decimal_places,
                            value.decimal_places_type);
                        value.inventory_qty = numericalAnalysisService.to_round(
                            numericalAnalysisService.accDiv(qty, value.inventory_rate),
                            value.decimal_places,
                            value.decimal_places_type);
                        value.reference_qty = numericalAnalysisService.to_round(
                            numericalAnalysisService.accDiv(qty, value.reference_rate),
                            value.decimal_places,
                            value.decimal_places_type);
                        value.valuation_qty = numericalAnalysisService.to_round(
                            numericalAnalysisService.accDiv(qty, value.valuation_rate),
                            value.decimal_places,
                            value.decimal_places_type);
                    });
                }

                return qty;
            };

            //計算數值是否小於0
            var checkmin = function(value, value2) {
                var num = numericalAnalysisService.accAdd(value, value2);
                if (num <= 0) {
                    num = 1;
                }
                return num;
            };

            //計算加減後數值 並呼叫撿查
            var compute = function(type, value) {
                if (type == "pop") {
                    $scope.showGood.qty = checkQty(checkmin($scope.showGood.qty, value), type);
                } else {
                    $scope.scanning_detail[type].qty = checkQty(checkmin($scope.scanning_detail[type].qty, value), type);
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

            //全選
            $scope.checkedALL = function() {
                angular.forEach($scope.item_detail, function(value) {
                    value.checked = $scope.scaninfo.checked;
                });
            };

            if (!commonService.isNull($scope.scaninfo.scanning)) {
                $scope.checkScan(angular.copy($scope.scaninfo.scanning));
            } else {
                if (($scope.page_params.program_job_no == '2' && $scope.page_params.warehouse_no) ||
                    $scope.page_params.program_job_no == '1') {
                    var obj = {
                        type_no: "2"
                    };
                    $ionicLoading.show();
                    APIBridge.callAPI('bcme_ae_af_get', [obj, $scope.l_data]).then(function(result) {
                        $ionicLoading.hide();
                        $scope.setScanning_detail(result.data[0].bcaf);
                        var parameter = {
                            barcode_detail: [],
                            source_doc_detail: result.data[0].bcme,
                        };
                        xyc_fil_01_requisition.setParameter(parameter);
                        angular.forEach(result.data[0].bcme, function(value) {
                            $scope.addDocArray(value.source_no);
                        });
                        if ($scope.scanning_detail.length <= 0) {
                            setCirculationCard(" ");
                        }
                    }, function(error) {
                        $ionicLoading.hide();
                        userInfoService.getVoice('bcme_ae_af_get fail', function() {});
                        console.log(error);
                    });
                }

            }

        }
    ];
});
