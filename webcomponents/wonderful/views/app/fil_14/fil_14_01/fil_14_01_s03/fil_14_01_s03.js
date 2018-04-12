define(["API", "APIS", 'AppLang', 'views/app/fil_common/requisition.js', 'array', 'Directives', 'ReqTestData', 'ionic-popup',
    'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService'
], function() {
    return ['$scope', '$state', '$stateParams', '$timeout', '$filter', 'AppLang', 'APIService', 'APIBridge',
        '$ionicLoading', '$ionicPopup', '$ionicModal', '$ionicListDelegate', 'IonicPopupService', 'IonicClosePopupService',
        'fil_common_requisition', 'ReqTestData', 'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService',
        function($scope, $state, $stateParams, $timeout, $filter, AppLang, APIService, APIBridge,
            $ionicLoading, $ionicPopup, $ionicModal, $ionicListDelegate, IonicPopupService, IonicClosePopupService,
            fil_common_requisition, ReqTestData, circulationCardService, commonFactory, commonService, userInfoService, scanTypeService, numericalAnalysisService) {

            $scope.page_params = commonService.get_page_params();
            $scope.userInfo = userInfoService.getUserInfo();
            $scope.selbarcodedata = [];
            var date = $filter('date')(new Date(), "yyyy-MM-dd");

            var app_bc_stock_count_data_no2_get = function(barcode_no) {
                var webTran = {
                    service: 'app.bc.stock.count.data.no2.get',
                    parameter: {
                        "counting_type": $scope.scaninfo.counting_type,
                        "warehouse_no": $scope.scaninfo.counting_warehouse_no,
                        "counting_no": $scope.scaninfo.counting_no,
                        "site_no": userInfoService.userInfo.site_no,
                        "barcode_no": barcode_no || ""
                    }
                };
                console.log(webTran);
                $ionicLoading.show({
                    template: '<ion-spinner icon="ios"></ion-spinner><p>' + $scope.langs.inventory_data_download + '...</p>'
                });
                APIService.Web_Post(webTran, function(res) {
                    $ionicLoading.hide();
                    // console.log("success:" + angular.toJson(res));
                    var parameter = res.payload.std_data.parameter;
                    $scope.setSourceDocDetail(parameter.source_doc_detail);
                    $scope.setBarcodeDetail(parameter.barcode_detail);
                    console.log($scope.barcode_detail);
                    console.log($scope.source_doc_detail);
                    if (!$scope.scaninfo.has_list) {
                        checkSetGoods(barcode_no);
                    }
                }, function(error) {
                    $ionicLoading.hide();
                    var execution = error.payload.std_data.execution;
                    console.log("error:" + execution.description);
                    userInfoService.getVoice(execution.description, function() {});
                });
            };

            if ($scope.source_doc_detail.length === 0 && $scope.barcode_detail.length === 0 && $scope.scaninfo.has_list) {
                if (userInfoService.userInfo.server_product !== 'E10') {
                    if (commonService.isNull($scope.scaninfo.counting_no)) {
                        userInfoService.getVoice($scope.langs.inventory + $scope.langs.plan + $scope.langs.number + $scope.langs.not_null, function() {
                            $state.go("fil_14_01_s01.s02");
                        });
                        return;
                    }
                }
                app_bc_stock_count_data_no2_get("");
            }

            $scope.warehouseShow = function() {
                $scope.setFocusMe(false);
                commonFactory.showWarehouseModal(userInfoService.warehouse, $scope.scaninfo, $scope.setwarehouse, function() {
                    $scope.setFocusMe(true);
                });
            };

            $scope.setwarehouse = function(warehouse) {
                $scope.setFocusMe(true);
                $scope.scaninfo.warehouse_no = warehouse.warehouse_no;
                $scope.scaninfo.warehouse_name = warehouse.warehouse_name;
                $scope.scaninfo.storage_management = warehouse.storage_management;
                $scope.setStorage(warehouse.storage_spaces);
                $scope.clearStorage();
            };

            $scope.clearWarehouse = function() {
                $scope.setwarehouse({
                    "warehouse_no": " ",
                    "warehouse_name": ""
                });
            };

            $scope.storageShow = function() {
                $scope.setFocusMe(false);
                commonFactory.showStorageModal($scope.sel_in_storage, $scope.scaninfo, $scope.setstorage, function() {
                    $scope.setFocusMe(true);
                });
            };

            $scope.setstorage = function(storage) {
                $scope.setFocusMe(true);
                $scope.scaninfo.storage_spaces_no = storage.storage_spaces_no;
                $scope.scaninfo.storage_spaces_name = storage.storage_spaces_name;
            };

            $scope.clearStorage = function() {
                $scope.setstorage({
                    storage_spaces_no: "",
                    storage_spaces_name: ""
                });
            };

            $scope.scan = function() {
                console.log("scanBarcode");
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

            $scope.scanned = function(value) {
                $scope.checkScan(value.trim());
            };

            //檢查掃描欄位資料
            $scope.checkScan = function(scanning) {
                $scope.scaninfo.scanning = "";
                $scope.setFocusMe(false);
                if (commonService.isNull(scanning)) {
                    return;
                }

                //取得倉庫資訊
                var index = userInfoService.warehouseIndex[scanning];
                if (!angular.isUndefined(index)) { //存在於倉庫基本檔
                    $scope.setwarehouse(userInfoService.warehouse[index]);
                    return;
                }

                var index = $scope.sel_in_storage.findIndex(function(item) {
                    return commonService.isEquality(scanning, item.storage_spaces_no);
                });

                if (index !== -1) { //存在於儲位基本檔
                    $scope.setstorage($scope.sel_in_storage[index]);
                    return;
                }

                if ($scope.scaninfo.storage_management == "Y") {
                    if (commonService.isNull($scope.scaninfo.storage_spaces_no)) {
                        //顯示錯誤 "此倉庫使用儲位管理，請選擇儲位！"
                        userInfoService.getVoice($scope.langs.storage_management_error, function() {
                            $scope.setFocusMe(true);
                        });
                        return;
                    }
                }

                if ($scope.scaninfo.has_list) {
                    setGoods(scanning);
                    return;
                }

                app_bc_stock_count_data_no2_get(scanning);
            };

            var checkSetGoods = function(scanning) {
                //當裝箱條碼回傳有多筆庫存資料，直接寫入至明細檔中
                if (!commonService.isNull($scope.barcode_detail[0].packing_barcode) ||
                    !commonService.isNull($scope.barcode_detail[0].highest_packing_barcode)) {
                    var tempArray = [];
                    for (var i = 0; i < $scope.barcode_detail.length; i++) {
                        var element = $scope.barcode_detail[i];

                        var index = tempArray.findIndex(function(item) {
                            return commonService.isEquality(element.label_no, item.label_no) &&
                                commonService.isEquality(element.barcode_no, item.barcode_no) &&
                                commonService.isEquality(element.warehouse_no, item.warehouse_no) &&
                                commonService.isEquality(element.storage_spaces_no, item.storage_spaces_no) &&
                                commonService.isEquality(element.lot_no, item.lot_no) &&
                                commonService.isEquality(element.packing_barcode, item.packing_barcode) &&
                                commonService.isEquality(element.highest_packing_barcode, item.highest_packing_barcode);
                        });

                        if (index == -1) {
                            tempArray.push(setItem(element));
                        }
                    }

                    var flag = setInventory({
                        "show_edit": false,
                        "label_no": "",
                        "seq": "0",
                        "barcode_no": $scope.barcode_detail[0].highest_packing_barcode,
                        "item_no": " ",
                        "item_feature_no": " ",
                        "warehouse_no": " ",
                        "storage_spaces_no": " ",
                        "lot_no": " ",
                        "blank_label": " ",
                        "qty": " ",
                        "employee_no": " ",
                        "complete_date": date,
                        "transaction_type": "",
                        "transaction_no": "",
                        "lot_control_type": " ",
                        "counting_plans": " ",
                        "reference_qty": " ",
                        "reference_unit_no": " ",
                        "packing_barcode": $scope.barcode_detail[0].highest_packing_barcode,
                        "highest_packing_barcode": $scope.barcode_detail[0].highest_packing_barcode,
                        "detail": tempArray || [],
                    }, {
                        "qty": " "
                    });
                    return;
                }
                setGoods(scanning);
            };

            var setGoods = function(scanning) {
                var array = [];
                for (var j = 0; j < $scope.barcode_detail.length; j++) {
                    var item = $scope.barcode_detail[j];
                    if (userInfoService.userInfo.server_product == 'E10') {
                        if (commonService.isEquality(item.barcode_no, scanning)) {
                            array.push(item);
                        }
                    }
                    if (userInfoService.userInfo.server_product != 'E10') {
                        if (commonService.isEquality(item.barcode_no, scanning) &&
                            commonService.isEquality(item.warehouse_no, $scope.scaninfo.warehouse_no) &&
                            commonService.isEquality(item.storage_spaces_no, $scope.scaninfo.storage_spaces_no)) {
                            array.push(item);
                        }
                    }
                }

                if (userInfoService.userInfo.server_product == 'E10') {
                    if ($scope.scanning_detail.length > 0) {
                        var index = $scope.scanning_detail.findIndex(function(item) {
                            return commonService.isEquality(item.barcode_no, scanning) &&
                                commonService.isEquality(item.warehouse_no, $scope.scaninfo.warehouse_no) &&
                                commonService.isEquality(item.storage_spaces_no, $scope.scaninfo.storage_spaces_no);
                        });
                        if (index != -1) {
                            //顯示錯誤 "資料重複！"
                            userInfoService.getVoice($scope.langs.barcode_duplication_error, function() {
                                $scope.setFocusMe(true);
                            });
                            return;
                        }
                    }

                    if (array.length > 0) {
                        showItemPop(setItem(array[0]));
                        return;
                    }

                    //顯示錯誤 "scanning 不存在或無效！"
                    userInfoService.getVoice(scanning + $scope.langs.not_exist_or_invalid, function() {
                        $scope.setFocusMe(true);
                    });
                    return;
                }

                if (userInfoService.userInfo.server_product != 'E10') {
                    if (array.length == 1) {
                        showItemPop(setItem(array[0]));
                        return;
                    }

                    if (array.length > 1) {
                        selbarcodedata(array, false);
                        return;
                    }

                    var isbarcodePopup = $ionicPopup.show({
                        title: $scope.langs.checkField + $scope.langs.barcode,
                        scope: $scope,
                        buttons: [{
                            text: $scope.langs.cancel,
                            onTap: function() {
                                //顯示錯誤 "scanning 不存在或無效！"
                                userInfoService.getVoice(scanning + $scope.langs.not_exist_or_invalid, function() {
                                    $scope.setFocusMe(true);
                                });
                            }
                        }, {
                            text: $scope.langs.confirm,
                            onTap: function() {
                                app_barcode_get(scanning);
                            }
                        }]
                    });
                    return;
                }
            };

            var app_barcode_get = function(scanning) {
                var l_info_id = commonService.getCurrent(2) + "_" + $scope.userInfo.account;
                var webTran = {
                    service: "app.barcode.get",
                    parameter: {
                        "program_job_no": $scope.page_params.program_job_no,
                        "status": $scope.page_params.status,
                        "barcode_no": scanning,
                        "warehouse_no": " ",
                        "storage_spaces_no": " ",
                        "lot_no": " ",
                        "inventory_management_features": "",
                        "param_master": [],
                        "info_id": angular.copy(l_info_id),
                        "site_no": userInfoService.userInfo.site_no
                    }
                };
                console.log(webTran);
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
                        $scope.setFocusMe(true);
                    });
                });
            };

            var selectBarcodedata = function(scanning, parameter) {
                // WS 回傳條碼資訊若為零
                if (parameter.barcode_detail.length === 0) {
                    //顯示錯誤 " scanning 不存在或無效！"
                    userInfoService.getVoice(scanning + $scope.langs.not_exist_or_invalid, function() {
                        $scope.setFocusMe(true);
                    });
                    return;
                }

                if (parameter.barcode_detail.length == 1 || parameter.barcode_detail[0].lot_control_type == "2") {
                    showItemPop(setItem(parameter.barcode_detail[0]));
                    return;
                }

                selbarcodedata(parameter.barcode_detail, true);
                return;
            };

            var setSelbarcodedata = function(array) {
                $scope.selbarcodedata = array;
            };

            var clearSelbarcodedata = function() {
                $scope.selbarcodedata = [];
            };

            var selbarcodedata = function(array, blank_flag) {
                $ionicLoading.show();
                setSelbarcodedata(array);
                var lotPop = $ionicPopup.show({
                    title: $scope.langs.please_choose + $scope.langs.lot,
                    scope: $scope,
                    templateUrl: "views/app/fil_14/fil_14_01/fil_14_01_s03/fil_14_01_s03_02.html",
                });

                $scope.seldata = function(data) {
                    var barcode_info = data
                    if (angular.isString(data)) {
                        barcode_info = angular.copy($scope.selbarcodedata[0]);
                        barcode_info.lot_no = " ";
                        barcode_info.barcode_qty = 0;
                        blank_flag = true;
                    }
                    barcode_info.blank_label = (blank_flag) ? "Y" : "N";
                    showItemPop(setItem(barcode_info));
                    lotPop.close();
                };

                $ionicLoading.hide();
                IonicClosePopupService.register(false, lotPop);
                return;
            };

            var setItem = function(barcode_info) {

                var temp = {
                    "show_edit": true,
                    "label_no": "",
                    "seq": "",
                    "barcode_no": barcode_info.barcode_no,
                    "item_no": barcode_info.item_no,
                    "item_name_spec": barcode_info.item_name_spec,
                    "item_feature_no": barcode_info.item_feature_no,
                    "warehouse_no": $scope.scaninfo.warehouse_no,
                    "storage_spaces_no": $scope.scaninfo.storage_spaces_no,
                    "lot_no": barcode_info.lot_no || " ",
                    "blank_label": barcode_info.blank_label || "N",
                    "qty": barcode_info.barcode_qty || 0,
                    "employee_no": userInfoService.userInfo.employee_no,
                    "complete_date": date,
                    "transaction_type": "",
                    "transaction_no": "",
                    "lot_control_type": barcode_info.lot_control_type,
                    "reference_qty": barcode_info.reference_qty || 0,
                    "reference_unit_no": barcode_info.reference_unit_no,
                    "packing_barcode": barcode_info.highest_packing_barcode,
                    "highest_packing_barcode": barcode_info.highest_packing_barcode,
                    "detail": [],
                };

                if (temp.lot_control_type == "2") {
                    temp.lot_no = " ";
                }

                if (!commonService.isNull(temp.reference_unit_no)) {
                    $scope.scaninfo.isShowReference = true;
                }

                var index = $scope.source_doc_detail.findIndex(function(item) {
                    return commonService.isEquality(temp.item_no, item.item_no) &&
                        commonService.isEquality(temp.item_feature_no, item.item_feature_no);
                });

                if (index != -1) {
                    temp.transaction_type = $scope.source_doc_detail[index].transaction_type;
                    temp.transaction_no = $scope.source_doc_detail[index].transaction_no;
                }

                return temp;
            };

            var showItemPop = function(temp) {
                var item = angular.copy(temp);
                $scope.pop = {
                    "qty": Number(item.qty),
                    "reference_qty": Number(item.reference_qty),
                    "barcode_no": item.barcode_no,
                    "item_no": item.item_no,
                    "item_name_spec": item.item_name_spec,
                    "item_feature_no": item.item_feature_no,
                    "warehouse_no": item.warehouse_no,
                    "storage_spaces_no": item.storage_spaces_no,
                    "lot_no": item.lot_no,
                    "lot_control_type": item.lot_control_type
                };

                //計算數值是否小於0
                var checkmin = function(value, value2) {
                    var num = Number(value) + Number(value2);
                    if (num <= 0) {
                        num = 0;
                    }
                    return num;
                };

                //計算加減後數值 並呼叫撿查
                var compute = function(type, value) {
                    if (type == "pop.reference") {
                        $scope.pop.reference_qty = checkmin($scope.pop.reference_qty, value);
                    } else {
                        $scope.pop.qty = checkmin($scope.pop.qty, value);
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

                var QtyPop = $ionicPopup.show({
                    title: $scope.langs.edit + $scope.langs.qty,
                    scope: $scope,
                    templateUrl: "views/app/fil_14/fil_14_01/fil_14_01_s03/fil_14_01_s03_01.html",
                    buttons: [{
                        text: $scope.langs.cancel
                    }, {
                        text: $scope.langs.confirm,
                        onTap: function(e) {
                            if (!$scope.pop.qty) {
                                $scope.pop.qty = 0;
                            }
                            if (temp.lot_control_type == "1") {
                                if (commonService.isNull($scope.pop.lot_no)) {
                                    e.preventDefault();
                                    userInfoService.getVoice($scope.langs.lot_control_error_1, function() {});
                                    return;
                                }
                            }
                            setInventory(temp, $scope.pop);
                        }
                    }]
                });
                IonicClosePopupService.register(false, QtyPop);
                return;
            };

            var setInventory = function(temp, pop) {
                //檢查批號是否有修改過
                if (!commonService.isEquality(temp.lot_no, pop.lot_no)) {
                    temp.blank_label = "Y";
                    temp.lot_no = pop.lot_no;
                    //檢查批號修改後是否與其他盤點明細相同批號
                    if ($scope.selbarcodedata.length > 0) {
                        for (var i = 0; i < $scope.selbarcodedata.length; i++) {
                            var element = $scope.selbarcodedata[i];
                            if (commonService.isEquality(temp.barcode_no, element.barcode_no) &&
                                commonService.isEquality(temp.warehouse_no, element.warehouse_no) &&
                                commonService.isEquality(temp.storage_spaces_no, element.storage_spaces_no) &&
                                commonService.isEquality(temp.lot_no, element.lot_no)) {
                                temp.blank_label = "N";
                                break;
                            }
                        }
                    }
                }
                temp.qty = pop.qty;

                if ($scope.scanning_detail.length > 0) {
                    var index = $scope.scanning_detail.findIndex(function(item) {
                        return commonService.isEquality(temp.barcode_no, item.barcode_no) &&
                            commonService.isEquality(temp.warehouse_no, item.warehouse_no) &&
                            commonService.isEquality(temp.storage_spaces_no, item.storage_spaces_no) &&
                            commonService.isEquality(temp.lot_no, item.lot_no);
                    });
                    if (index != -1) {
                        //顯示錯誤 "資料重複！"
                        userInfoService.getVoice($scope.langs.data_duplication_error, function() {
                            $scope.setFocusMe(true);
                        });
                        return;
                    }
                }
                clearSelbarcodedata();
                $scope.editInventoryList(temp);
                return;
            };

            //左滑删除
            $scope.deleteGoods = function(index) {
                $scope.deleteInventoryList(index);
                $ionicListDelegate.closeOptionButtons();
            };

            $scope.showInfo = function(index) {
                $scope.detail = $scope.scanning_detail[index].detail;
                $ionicListDelegate.closeOptionButtons();
                $ionicModal.fromTemplateUrl('views/app/fil_14/fil_14/fil_14_s03/fil_14_s03_02.html', {
                    scope: $scope
                }).then(function(modal) {
                    $scope.closeDetailModal = function() {
                        modal.hide().then(function() {
                            return modal.remove();
                        });
                    };
                    modal.show();
                });
            };

            $scope.getUploadDetail = function() {
                var tempArray = [];
                var detail = angular.copy($scope.scanning_detail) || [];
                if (detail.length > 0) {
                    tempArray = getUploadItem([], detail);
                }
                console.log(tempArray);
                return angular.copy(tempArray);
            }

            //將掃描明細展開並計算相同條碼數量
            var getUploadItem = function(array, detail) {
                for (var i = 0; i < detail.length; i++) {
                    var element = detail[i];
                    if (element.detail.length > 0) {
                        getUploadItem(array, element.detail);
                        continue;
                    }
                    var index = array.findIndex(function(value) {
                        return commonService.isEquality(value.label_no, element.label_no) &&
                            commonService.isEquality(value.barcode_no, element.barcode_no) &&
                            commonService.isEquality(value.warehouse_no, element.warehouse_no) &&
                            commonService.isEquality(value.storage_spaces_no, element.storage_spaces_no) &&
                            commonService.isEquality(value.lot_no, element.lot_no);
                    });
                    if (index == -1) {
                        array.push(element);
                    } else {
                        array[index].qty = numericalAnalysisService.accAdd(array[index].qty, element.qty);
                    }
                }
                return array;
            };

            //提交
            $scope.submit = function() {
                $scope.setFocusMe(false);
                $scope.scaninfo.submit_show = false;
                var scan = $scope.getUploadDetail();
                var tempArray = [];
                for (var i = 0; i < scan.length; i++) {
                    var element = angular.copy(scan[i]);

                    var temp = {
                        "label_no": element.label_no,
                        "seq": element.seq,
                        "barcode_no": element.barcode_no,
                        "item_no": element.item_no,
                        "item_feature_no": element.item_feature_no,
                        "warehouse_no": element.warehouse_no,
                        "storage_spaces_no": element.storage_spaces_no,
                        "lot_no": element.lot_no,
                        "blank_label": element.blank_label,
                        "qty": element.qty,
                        "employee_no": element.employee_no,
                        "complete_date": element.complete_date,
                        "transaction_type": element.transaction_type,
                        "transaction_no": element.transaction_no,
                        "reference_unit_no": element.reference_unit_no,
                        "reference_qty": element.reference_qty,
                    };
                    tempArray.push(temp);
                }
                app_stock_count_scan_no2_upload(tempArray);
                return;
            };

            var app_stock_count_scan_no2_upload = function(scan) {
                var webTran = {
                    service: 'app.stock.count.scan.no2.upload',
                    parameter: {
                        "counting_type": $scope.scaninfo.counting_type,
                        "counting_no": $scope.scaninfo.counting_no,
                        "site_no": userInfoService.userInfo.site_no,
                        "scan": scan
                    }
                };
                $ionicLoading.show({
                    template: '<ion-spinner icon="ios"></ion-spinner><p>' + $scope.langs.inventory_data_upload + '...</p>'
                });
                APIService.Web_Post(webTran, function(res) {
                    // console.log("success:" + angular.toJson(res));
                    $ionicLoading.hide();
                    var parameter = res.payload.std_data.parameter;
                    IonicPopupService.successAlert("").then(function() {
                        $scope.init();
                        $scope.initInventoryList();
                        $scope.initSourceDocDetail();
                        $scope.initBarcodeDetail();
                        $state.go("fil_14_01_s01.s02");
                    });
                }, function(error) {
                    $ionicLoading.hide();
                    var execution = error.payload.std_data.execution;
                    console.log("error:" + execution.description);
                    userInfoService.getVoice(execution.description, function() {
                        $scope.setFocusMe(true);
                        $scope.scaninfo.submit_show = true;
                    });
                });
            };

        }
    ];
});