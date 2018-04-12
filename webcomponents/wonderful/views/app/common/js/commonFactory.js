define(["app", "API", "APIS", "ionic-popup", "numericalAnalysisService"], function(app) {
    app.factory('commonFactory', ['APIService', 'AppLang', '$timeout', '$rootScope', 'numericalAnalysisService',
        '$ionicLoading', '$ionicPopup', 'IonicClosePopupService', 'IonicPopupService', "userInfoService", "$ionicModal", "$filter",
        function(APIService, AppLang, $timeout, $rootScope, numericalAnalysisService,
            $ionicLoading, $ionicPopup, IonicClosePopupService, IonicPopupService, userInfoService, $ionicModal, $filter) {
            var parent = $rootScope;
            var $scope = parent.$new();
            $scope.langs = AppLang.langs;
            $scope.getUserInfo = function () {
               $scope.userInfo = userInfoService.getUserInfo();
           };

            //計算數值是否小於1
            var checkmin = function(value, value2) {
                var num = Number(numericalAnalysisService.accAdd(value, value2));
                if (num < 1) {
                    num = 1;
                }
                return num;
            };

            //計算加減後數值 並呼叫撿查
            var compute = function(type, value) {
                qty = checkmin($scope.pop.qty, value);
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

            return {
                /***********************************************************************************************************************
                 * Descriptions...: 數量彈窗提示
                 * Usage..........: showCheckQtyPopup(category,in_out_no,barcode_qty,receipt_surplus_qty)
                 * Input parameter: category                 對外(不可改數字) 1 / 對內(可改數字) 2
                 *                : in_out_no                入項  1 / 出項 -1
                 *                : barcode_qty              條碼數量
                 *                : receipt_surplus_qty      單據剩餘數量
                 * Return code....: allow  true / false      是否新增至掃描明細
                 *                : qty                      數量
                 * Modify.........: 20161110 By lyw
                 ***********************************************************************************************************************/
                showCheckQtyPopup: function(category, in_out_no, barcode_qty, receipt_surplus_qty, receipt_allow_qty) {
                    $scope.pop = {
                        category: category,
                        in_out_no: in_out_no,
                        barcode_qty: Number(barcode_qty),
                        receipt_surplus_qty: Number(receipt_surplus_qty),
                        receipt_allow_qty: Number(receipt_allow_qty),
                        maxqty: 0,
                        qty: 0,
                        allow: false
                    };
                    var error_massage = AppLang.langs.picks_error;

                    if (in_out_no == "-1") {
                        error_massage = AppLang.langs.picks_error_1;
                    }
                    if (in_out_no == "1" || in_out_no == "0") {
                        error_massage = AppLang.langs.picks_error_2;
                    }

                    // 條碼數量 > 單據允收數量
                    // 最大值：單據允收數量
                    // 預設值：單據允收數量
                    if (Number($scope.pop.barcode_qty) > Number($scope.pop.receipt_allow_qty)) {
                        $scope.pop.maxqty = $scope.pop.receipt_allow_qty;
                        $scope.pop.qty = $scope.pop.receipt_surplus_qty;
                    }

                    // 條碼數量 > 單據剩餘數量
                    // 最大值：單據剩餘數量
                    // 預設值：單據剩餘數量
                    if (Number($scope.pop.barcode_qty) > Number($scope.pop.receipt_surplus_qty)) {
                        $scope.pop.maxqty = $scope.pop.receipt_allow_qty;
                        $scope.pop.qty = $scope.pop.receipt_surplus_qty;
                    }

                    // 單據剩餘數量 > 條碼數量
                    // 最大值：  條碼數量
                    // 預設值：  條碼數量
                    // 錯誤訊息：條碼庫存數量不足！
                    if (Number($scope.pop.receipt_surplus_qty) > Number($scope.pop.barcode_qty)) {
                        $scope.pop.maxqty = $scope.pop.barcode_qty;
                        $scope.pop.qty = $scope.pop.barcode_qty;
                        error_massage = AppLang.langs.barcode + AppLang.langs.stock + AppLang.langs.qty + AppLang.langs.insufficient + "！";
                    }

                    var checkQtyPopup = $ionicPopup.show({
                        title: $scope.langs.point,
                        templateUrl: "views/app/common/html/checkQtyPopup.html",
                        scope: $scope,
                        buttons: [{
                            text: AppLang.langs.cancel,
                            onTap: function() {
                                return $scope.pop;
                            }
                        }, {
                            text: AppLang.langs.confirm,
                            onTap: function(e) {
                                if (Number($scope.pop.qty) > Number($scope.pop.maxqty)) {
                                    e.preventDefault();
                                    $scope.pop.qty = $scope.pop.maxqty;
                                    userInfoService.getVoice(error_massage, function() {});
                                } else {
                                    $scope.pop.allow = true;
                                    console.log($scope.pop);
                                    return $scope.pop;
                                }
                            }
                        }]
                    });
                    return checkQtyPopup;
                },
                /***********************************************************************************************************************
                 * Descriptions...: 顯示倉庫彈窗
                 * Usage..........: showWarehousePopup(warehouses, scaninfo)
                 * Input parameter: warehouses               倉庫ARRAY
                 *                : scaninfo                 使用者資訊
                 * Return code....: warehouses               倉庫OBJECT
                 * Modify.........: 20161125 By lyw
                 ***********************************************************************************************************************/
                showWarehousePopup: function(warehouses, scaninfo) {
                    $scope.warehouses = warehouses;
                    $scope.popSelected = {
                        warehouse_no: scaninfo.warehouse_no,
                        warehouse_name: scaninfo.warehouse_name
                    };
                    var warehousePop = $ionicPopup.show({
                        title: $scope.langs.please_choose + $scope.langs.warehouse,
                        scope: $scope,
                        templateUrl: "views/app/common/html/warehousePop.html",
                        buttons: [{
                            text: $scope.langs.cancel
                        }, {
                            text: $scope.langs.confirm,
                            onTap: function() {
                                var index = $scope.warehouses.findIndex(function(item) {
                                    return $scope.popSelected.warehouse_no == item.warehouse_no;
                                });

                                if (index !== -1) { //存在於倉庫基本檔
                                    return $scope.warehouses[index];
                                }
                            }
                        }]
                    });
                    IonicClosePopupService.register(false, warehousePop);

                    $scope.selwarehouse = function(warehouse) {
                        $scope.popSelected.warehouse_no = warehouse.warehouse_no;
                        $scope.popSelected.warehouse_name = warehouse.warehouse_name;
                        $scope.popSelected.storage_spaces = warehouse.storage_spaces;
                    };

                    return warehousePop;
                },
                showWarehouseModal: function(warehouses, scaninfo, resolve, reject) {
                    $scope.warehouses = warehouses;
                    $scope.popSelected = {
                        search: "",
                        warehouse_no: scaninfo.warehouse_no,
                        warehouse_name: scaninfo.warehouse_name
                    };

                    $scope.selwarehouse = function(warehouse) {
                        $scope.popSelected.warehouse_no = warehouse.warehouse_no;
                        $scope.popSelected.warehouse_name = warehouse.warehouse_name;
                        $scope.popSelected.storage_spaces = warehouse.storage_spaces;
                    };

                    $scope.setwarehouse = function() {
                        var index = $scope.warehouses.findIndex(function(item) {
                            return $scope.popSelected.warehouse_no == item.warehouse_no;
                        });

                        if (index !== -1) { //存在於倉庫基本檔
                            $scope.close();
                            return resolve($scope.warehouses[index]);
                        }
                    };

                    $ionicModal.fromTemplateUrl('views/app/common/html/warehouseModal.html', {
                        scope: $scope
                    }).then(function(modal) {
                        $scope.close = function() {
                            reject();
                            modal.hide().then(function() {
                                return modal.remove();
                            });
                        };
                        modal.show();
                        return modal;
                    });
                },
                /***********************************************************************************************************************
                 * Descriptions...: 顯示儲位彈窗
                 * Usage..........: showWarehousePopup(storage_spaces, scaninfo)
                 * Input parameter: storage_spaces           儲位ARRAY
                 *                : scaninfo                 使用者資訊
                 * Return code....: storage_spaces           儲位OBJECT
                 * Modify.........: 20161125 By lyw
                 ***********************************************************************************************************************/
                showStoragePopup: function(storage_spaces, scaninfo) {
                    $scope.storages = storage_spaces;
                    $scope.popSelected = {
                        storage_spaces_no: scaninfo.storage_spaces_no,
                        storage_spaces_name: scaninfo.storage_spaces_name,
                    };
                    var storagePop = $ionicPopup.show({
                        title: $scope.langs.please_choose + $scope.langs.storage,
                        scope: $scope,
                        templateUrl: "views/app/common/html/storagePop.html",
                        buttons: [{
                            text: $scope.langs.cancel
                        }, {
                            text: $scope.langs.confirm,
                            onTap: function() {
                                return $scope.popSelected;
                            }
                        }]
                    });
                    IonicClosePopupService.register(false, storagePop);

                    $scope.selstorage = function(storage) {
                        $scope.popSelected.storage_spaces_no = storage.storage_spaces_no;
                        $scope.popSelected.storage_spaces_name = storage.storage_spaces_name;
                    };
                    return storagePop;

                },
                showStorageModal: function(storage_spaces, scaninfo, resolve, reject) {
                    $scope.storages = storage_spaces;
                    $scope.popSelected = {
                        search: "",
                        storage_spaces_no: scaninfo.storage_spaces_no,
                        storage_spaces_name: scaninfo.storage_spaces_name,
                    };

                    $scope.selstorage = function(storage) {
                        $scope.popSelected.storage_spaces_no = storage.storage_spaces_no;
                        $scope.popSelected.storage_spaces_name = storage.storage_spaces_name;
                    };

                    $scope.setstorage = function() {
                        $scope.close();
                        return resolve($scope.popSelected);
                    };

                    $ionicModal.fromTemplateUrl('views/app/common/html/storageModal.html', {
                        scope: $scope
                    }).then(function(modal) {
                        $scope.close = function() {
                            reject();
                            modal.hide().then(function() {
                                return modal.remove();
                            });
                        };
                        modal.show();
                        return modal;
                    });
                },
                /***********************************************************************************************************************
                 * Descriptions...: 顯示批號彈窗
                 * Usage..........: showLotPopup(lot_no)
                 * Input parameter: lot_no                   批號
                 * Return code....: lot_no                   批號
                 * Modify.........: 20161125 By lyw
                 ***********************************************************************************************************************/
                showLotPopup: function(lot_no) {
                    $scope.lotobj = {
                        lot_no: lot_no
                    };
                    var lotPop = $ionicPopup.show({
                        title: $scope.langs.edit + $scope.langs.lot,
                        scope: $scope,
                        templateUrl: "views/app/common/html/lotPop.html",
                        buttons: [{
                            text: $scope.langs.cancel
                        }, {
                            text: $scope.langs.confirm,
                            onTap: function() {
                                return $scope.lotobj.lot_no;
                            }
                        }]
                    });
                    IonicClosePopupService.register(false, lotPop);
                    return lotPop;
                },
                /***********************************************************************************************************************
                 * Descriptions...: 顯示數量彈窗
                 * Usage..........: showQtyPopup(type, qty, maxqty, minqty, in_out_no)
                 * Input parameter: type                     數值類型
                 *                : qty                      數量
                 *                : maxqty                   最大值
                 *                : minqty                   最小值
                 *                : in_out_no                出入庫碼
                 * Return code....: qty                      數量
                 * Modify.........: 20161125 By lyw
                 ***********************************************************************************************************************/
                showQtyPopup: function(type, qty, maxqty, minqty, in_out_no) {
                    $scope.pop = {
                        qty: parseFloat(qty),
                        type: type,
                        maxqty: maxqty,
                        minqty: minqty,
                        in_out_no: in_out_no,
                    };
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
                                var flag = true;
                                var error_massage = "";
                                var error_recovery_qty = 0;
                                if (in_out_no == "-1") {
                                    error_massage = AppLang.langs.picks_error_1;
                                } else if (in_out_no == "1" || in_out_no == "0") {
                                    error_massage = AppLang.langs.picks_error_2;
                                } else if (in_out_no == "QC") {
                                    error_massage = AppLang.langs.qc_maxQty_error;
                                } else {
                                    error_massage = AppLang.langs.picks_error;
                                }

                                if ($scope.pop.maxqty != "none" && Number($scope.pop.qty) > Number(maxqty)) {
                                    flag = false;
                                    error_recovery_qty = maxqty;
                                }

                                if ($scope.pop.minqty != "none" && Number($scope.pop.qty) < Number(minqty)) {
                                    flag = false;
                                    error_massage = AppLang.langs.picks_error_3;
                                    error_recovery_qty = minqty;
                                }

                                if (flag) {
                                    return Number($scope.pop.qty);
                                }

                                e.preventDefault();
                                userInfoService.getVoice(error_massage, function() {
                                    $scope.pop.qty = Number(error_recovery_qty);
                                });
                            }
                        }]
                    });
                    IonicClosePopupService.register(false, QtyPop);
                    return QtyPop;
                },
                /***********************************************************************************************************************
                 * Descriptions...: 顯示排序設定
                 * Usage..........: showOrderByPopup(type, qty, maxqty)
                 * Input parameter: orderBy           當前選擇條件
                 * Return code....: orderBy           當前選擇條件
                 * Modify.........: 20170524 By zhen
                 ***********************************************************************************************************************/
                showOrderByPopup: function (orderBy) {
                    $scope.getUserInfo();
                    
                    $scope.pop = {
                        orderBy: orderBy
                    };

                    var OrderByPop = $ionicPopup.show({
                        title: $filter("langFilter")($scope.userInfo.language, [$scope.langs.sorting, $scope.langs.set]),
                        scope: $scope,
                        templateUrl: "views/app/common/html/orderByPop.html",
                        cssClass: "kb_css",
                        buttons: [{
                            text: $scope.langs.cancel
                        }, {
                            text: $scope.langs.confirm,
                            onTap: function (event) {
                                if (!$scope.pop.orderBy) {
                                    $scope.pop.orderBy = "0";
                                }

                                return $scope.pop.orderBy;
                            }
                        }]
                    });

                    IonicClosePopupService.register(false, OrderByPop);
                    return OrderByPop;
                },
                /***********************************************************************************************************************
                 * Descriptions...: 顯示數量彈窗-超過上限數量時，預設最大值
                 * Usage..........: showQtyPopup_kb(type, qty, maxqty)
                 * Input parameter: type                     數值類型
                 *                : qty                      數量
                 *                : maxqty                   最大值
                 *                : callback                 使用者自訂檢查
                 * Return code....: qty                      數量
                 * Modify.........: 20160606 By zhen
                 ***********************************************************************************************************************/
                showQtyPopup_kb: function (type, qty, maxqty, callback) {
                    //計算數值是否小於0
                    var checkmin_back = checkmin;
                    checkmin = function (value, value2) {
                        //強制轉為數量
                        value = +value;
                        value2 = +value2;

                        if ((value + value2) >= 0) {
                            value += value2;
                        }
                        else {
                            //該筆資料計算後小於零，設此筆資料為零
                            value = 0;
                        };

                        return value;
                    };

                    $scope.pop = {
                        qty: parseFloat(qty),
                        maxqty: maxqty,
                        type: type
                    };

                    var QtyPop = $ionicPopup.show({
                        title: $scope.langs.edit + $scope.langs.qty,
                        scope: $scope,
                        cssClass: "kb_css",
                        templateUrl: "views/app/common/html/qtyPop.html",
                        buttons: [{
                            text: $scope.langs.cancel
                        }, {
                            text: $scope.langs.confirm,
                            onTap: function (e) {
                                if (isNaN($scope.pop.qty) || $scope.pop.qty <= 0) {
                                    $scope.pop.qty = 0;
                                }

                                //交由各作業自行檢查數值資料
                                $scope.pop.qty = callback($scope.pop.qty, $scope.pop.maxqty, e);
                                return $scope.pop.qty;
                            }
                        }]
                    }).then(function (res) {
                        //檢查邏輯還原
                        checkmin = checkmin_back;

                        return res;
                    });

                    IonicClosePopupService.register(false, QtyPop);
                    return QtyPop;
                },
                /***********************************************************************************************************************
                 * Descriptions...: 倉儲批彈窗
                 * Modify.........: 20160620 By zhen
                 ***********************************************************************************************************************/
                showWarehouseModal_kb: function (warehouses, scaninfo, resolve, reject) {
                    $scope.warehouses = warehouses;
                    $scope.popSelected = {
                        search: "",
                        warehouse_no: scaninfo.warehouse_no,
                        warehouse_name: scaninfo.warehouse_name
                    };

                    $scope.selwarehouse = function (warehouse) {
                        $scope.popSelected.warehouse_no = warehouse.warehouse_no;
                        $scope.popSelected.warehouse_name = warehouse.warehouse_name;
                        $scope.popSelected.storage_spaces = warehouse.storage_spaces;
                    };

                    $scope.setwarehouse = function () {
                        var index = $scope.warehouses.findIndex(function (item) {
                            return $scope.popSelected.warehouse_no == item.warehouse_no;
                        });

                        if (index !== -1) { //存在於倉庫基本檔
                            $scope.close();
                            return resolve($scope.warehouses[index]);
                        }
                    };

                    $ionicModal.fromTemplateUrl('views/app/common/html/warehouseModal_kb.html', {
                        scope: $scope,
                        cssClass: "kb_css"
                    }).then(function (modal) {
                        $scope.close = function () {
                            reject();
                            modal.hide().then(function () {
                                return modal.remove();
                            });
                        };
                        modal.show();
                        return modal;
                    });
                },
                showStorageModal_kb: function (storage_spaces, scaninfo, resolve, reject) {
                    $scope.storages = storage_spaces;
                    $scope.popSelected = {
                        search: "",
                        storage_spaces_no: scaninfo.storage_spaces_no,
                        storage_spaces_name: scaninfo.storage_spaces_name,
                    };

                    $scope.selstorage = function (storage) {
                        $scope.popSelected.storage_spaces_no = storage.storage_spaces_no;
                        $scope.popSelected.storage_spaces_name = storage.storage_spaces_name;
                    };

                    $scope.setstorage = function () {
                        $scope.close();
                        return resolve($scope.popSelected);
                    };

                    $ionicModal.fromTemplateUrl('views/app/common/html/storageModal_kb.html', {
                        scope: $scope,
                        cssClass: "kb_css"
                    }).then(function (modal) {
                        $scope.close = function () {
                            reject();
                            modal.hide().then(function () {
                                return modal.remove();
                            });
                        };
                        modal.show();
                        return modal;
                    });
                },
                showLotPopup_kb: function (lot_no) {
                    $scope.lotobj = {
                        lot_no: lot_no
                    };
                    var lotPop = $ionicPopup.show({
                        title: $scope.langs.edit + $scope.langs.lot,
                        scope: $scope,
                        cssClass: "kb_css",
                        templateUrl: "views/app/common/html/lotPop_kb.html",
                        buttons: [{
                            text: $scope.langs.cancel
                        }, {
                            text: $scope.langs.confirm,
                            onTap: function () {
                                return $scope.lotobj.lot_no;
                            }
                        }]
                    });
                    IonicClosePopupService.register(false, lotPop);
                    return lotPop;
                }
          };
        }
    ]);
});