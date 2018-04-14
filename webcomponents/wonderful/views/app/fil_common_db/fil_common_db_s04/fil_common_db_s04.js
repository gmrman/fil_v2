define(["API", "APIS", 'AppLang', 'views/app/fil_common_db/requisition.js', 'array', 'Directives', 'ReqTestData', 'ionic-popup',
    'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService'
], function() {
    return ['$scope', '$state', '$stateParams', '$timeout', '$filter', 'AppLang', 'APIService', 'APIBridge',
        '$ionicLoading', '$ionicPopup', '$ionicModal', '$ionicListDelegate', 'IonicPopupService', 'IonicClosePopupService',
        'fil_common_db_requisition', 'ReqTestData', 'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService',
        function($scope, $state, $stateParams, $timeout, $filter, AppLang, APIService, APIBridge,
            $ionicLoading, $ionicPopup, $ionicModal, $ionicListDelegate, IonicPopupService, IonicClosePopupService,
            fil_common_db_requisition, ReqTestData, circulationCardService, commonFactory, commonService, userInfoService, scanTypeService, numericalAnalysisService) {

            //設定list每個item的高度
            var rows = ($scope.views.has_source) ? 4 : 3;
            //是否顯示 撥入倉儲
            rows += ($scope.views.show_ingoing) ? 1 : 0;
            //是否顯示 理由碼
            rows += ($scope.views.show_reason) ? 1 : 0;
            //是否顯示 產品特徵 / 作業名稱
            rows += (userInfoService.userInfo.feature || $scope.views.show_op) ? 1 : 0;
            $scope.collection_item_height = rows * 30 - ((rows - 1) * 5);
            console.log($scope.collection_item_height);

            // $scope.set_list_array();
            $ionicLoading.show();
            APIBridge.callAPI('scan_get', []).then(function (result) {
                $ionicLoading.hide();
                // app_todo_notice_get();
                // saveCondition();
                console.log(result);
                console.log(result.data);
                $scope.set_list_array(result.data);
            }, function (error) {
                $ionicLoading.hide();
                userInfoService.getVoice(error.message, function () {
                    $scope.setFocusMe(true);
                });
            });

            //左滑删除
            $scope.delGoods = function(index) {
                $scope.deleteGoods(index);
                $ionicListDelegate.closeOptionButtons();
            };

            //點擊item收起按鍵框
            $scope.closeOption = function() {
                $ionicListDelegate.closeOptionButtons();
            };

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
                    $scope.splitParameter.focus_me = false;
                    if ($scope.showGood.storage_management == "Y") {
                        if (commonService.isNull($scope.showGood.storage_spaces_no)) {
                            userInfoService.getVoice($scope.langs.storage_management_error, function() {
                                $scope.splitParameter.focus_me = true;
                            });
                            return;
                        }
                    }

                    //入項 批號管控
                    // 1. 必須有批號
                    if ($scope.showGood.lot_control_type == "1" && ($scope.page_params.in_out_no != "0" || userInfoService.userInfo.gp_flag)) {
                        if (commonService.isNull($scope.showGood.lot_no)) {
                            //顯示錯誤 "料號批號管控為必須要有批號，因未輸入批號，不新增至掃描資料！"
                            userInfoService.getVoice($scope.langs.lot_control_error, function() {
                                $scope.splitParameter.focus_me = true;
                            });
                            return;
                        }
                    }

                    // 2. 不可有批號
                    if ($scope.showGood.lot_control_type == "2") {
                        if (!commonService.isNull($scope.showGood.lot_no)) {
                            //顯示錯誤 "料號批號管控為不可有批號！"
                            userInfoService.getVoice($scope.langs.lot_control_error_2, function() {
                                $scope.splitParameter.focus_me = true;
                            });
                            return;
                        }
                    }

                    var flag = true;
                    if ($scope.scanning_detail.length > 0) {
                        angular.forEach($scope.scanning_detail, function(value) {
                            if (commonService.isEquality(value.barcode_no, $scope.showGood.barcode_no) &&
                                commonService.isEquality(value.warehouse_no, $scope.showGood.warehouse_no) &&
                                commonService.isEquality(value.storage_spaces_no, $scope.showGood.storage_spaces_no) &&
                                commonService.isEquality(value.lot_no, $scope.showGood.lot_no) &&
                                commonService.isEquality(value.inventory_management_features, $scope.showGood.inventory_management_features) &&
                                commonService.isEquality(value.source_no, $scope.showGood.source_no) &&
                                commonService.isEquality(value.seq, $scope.showGood.seq) &&
                                commonService.isEquality(value.doc_line_seq, $scope.showGood.doc_line_seq) &&
                                commonService.isEquality(value.doc_batch_seq, $scope.showGood.doc_batch_seq)) {
                                flag = false;
                            }
                        });
                    }

                    if (!flag) {
                        //顯示錯誤 "資料重複！"
                        userInfoService.getVoice($scope.langs.data_duplication_error, function() {
                            $scope.splitParameter.focus_me = true;
                        });
                        return flag;
                    }
                    var element = angular.copy($scope.scanning_detail[$scope.splitParameter.index]);
                    element.qty = numericalAnalysisService.accSub(element.qty, $scope.showGood.qty);
                    element.inventory_qty = numericalAnalysisService.accSub(element.inventory_qty, $scope.showGood.inventory_qty);
                    element.reference_qty = numericalAnalysisService.accSub(element.reference_qty, $scope.showGood.reference_qty);
                    element.valuation_qty = numericalAnalysisService.accSub(element.valuation_qty, $scope.showGood.valuation_qty);
                    if (element.qty === 0) {
                        $scope.deleteGoods($scope.splitParameter.index);
                    } else {
                        $scope.scanning_detail[$scope.splitParameter.index] = element;
                    }
                    $scope.addGoods($scope.showGood);
                    $scope.closeSplitItemModal();
                    return;
                };

                $ionicModal.fromTemplateUrl('views/app/fil_common_db/fil_common_db_s07/splitItemModal.html', {
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

        }
    ];
});