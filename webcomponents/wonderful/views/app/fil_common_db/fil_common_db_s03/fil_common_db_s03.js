define(["API", "APIS", 'AppLang', 'views/app/fil_common_db/requisition.js', 'array', 'Directives', 'ReqTestData', 'ionic-popup',
    'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService'
], function () {
    return ['$scope', '$state', '$stateParams', '$timeout', '$filter', 'AppLang', 'APIService', 'APIBridge',
        '$ionicLoading', '$ionicPopup', '$ionicModal', '$ionicListDelegate', 'IonicPopupService', 'IonicClosePopupService',
        'fil_common_db_requisition', 'ReqTestData', 'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService',
        function ($scope, $state, $stateParams, $timeout, $filter, AppLang, APIService, APIBridge,
            $ionicLoading, $ionicPopup, $ionicModal, $ionicListDelegate, IonicPopupService, IonicClosePopupService,
            fil_common_db_requisition, ReqTestData, circulationCardService, commonFactory, commonService, userInfoService, scanTypeService, numericalAnalysisService) {

            //變數初始化區塊 (S)-------------------------------------------------
            $scope.subView = true;
            //變數初始化區塊 (E)-------------------------------------------------

            //調用相機 進行掃描條碼
            $scope.scan = function () {
                console.log("scanBarcode");
                $scope.clearScanning();
                APIBridge.callAPI('scanBarcode', [{}]).then(function (result) {
                    if (result) {
                        console.log('scanBarcode success');
                        $timeout(function () {
                            $scope.checkScan(result.data[0].barcode.trim());
                        }, 0);
                    } else {
                        console.log('scanBarcode false');
                    }
                }, function (result) {
                    console.log("scanBarcode fail");
                    console.log(result);
                });
            };

            $scope.clear_list_array();

            //掃苗框按下 enter 鍵後執行
            $scope.scanned = function (value) {
                $scope.checkScan(value.trim());
            };

            //檢查掃描後相關資訊
            $scope.checkScan = function (scanning) {
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

                    index = $scope.sel_in_storage.findIndex(function (item) {
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

                    index = $scope.sel_in_storage.findIndex(function (item) {
                        return scanning == item.storage_spaces_no;
                    });

                    if (index !== -1) { //存在於儲位基本檔
                        $scope.setstorage($scope.sel_in_storage[index]);
                        $scope.inTheScan(false);
                        return;
                    }
                }

                app_doc_bc_get(scanning, $scope.scaninfo.warehouse_no, $scope.scaninfo.storage_spaces_no, $scope.scaninfo.lot_no);
            };

            var app_doc_bc_get = function (barcode_no, warehouse_no, storage_spaces_no, lot_no) {

                var service = "app.barcode.get";
                var parameter = {
                    "program_job_no": $scope.page_params.program_job_no,
                    "status": $scope.page_params.status,
                    "barcode_no": barcode_no,
                    "warehouse_no": warehouse_no,
                    "storage_spaces_no": storage_spaces_no,
                    "lot_no": lot_no,
                    "inventory_management_features": "",
                    "info_id": $scope.l_data.info_id,
                    "site_no": userInfoService.userInfo.site_no,
                    "param_master": $scope.page_params.doc_array
                };
                $scope.add_scan_time_log("呼叫條碼WS");
                var webTran = {
                    service: service,
                    parameter: parameter
                };
                console.log(webTran);
                $ionicLoading.show();
                APIService.Web_Post(webTran, function (res) {
                    $ionicLoading.hide();
                    $scope.add_scan_time_log("取得條碼WS回傳資料");
                    var parameter = res.payload.std_data.parameter;
                    // fil_common_db_requisition.setParameter(parameter);
                    selectBarcodedata(barcode_no, parameter.barcode_detail);
                }, function (error) {
                    $ionicLoading.hide();
                    var execution = error.payload.std_data.execution;
                    console.log("error:" + execution.description);
                    userInfoService.getVoice(execution.description, function () {
                        $scope.setFocusMe(true);
                        $scope.inTheScan(false);
                    });
                });
            };

            //依WS回傳的 barcode_detail 進行判斷批號或是條碼陣列
            var selectBarcodedata = function (barcode_no, barcode_detail) {

                // WS 回傳條碼資訊若為零
                if (barcode_detail.length === 0) {
                    //檢查長度是否為批號
                    if (barcode_no.length <= userInfoService.userInfo.lot_length && !($scope.page_params.program_job_no == "13-1" || $scope.page_params.program_job_no == "13-2")) {
                        //彈出詢問 "是否為批號" 視窗
                        showLotPopup(barcode_no);
                    } else {
                        //顯示錯誤 "barcode_no 不存在或無效！"
                        userInfoService.getVoice(barcode_no + $scope.langs.not_exist_or_invalid, function () {
                            $scope.setFocusMe(true);
                            $scope.inTheScan(false);
                        });
                    }
                    return;
                }
                //非裝箱條碼檢查批號或給使用者選擇
                if (barcode_detail.length == 1) {
                    return insertScan(barcode_detail[0]);
                    // return checkStorageLot();
                }
                return showSelbarcodedataModal(barcode_detail);               
            };

            var insertScan = function (barcode_detail){
                APIBridge.callAPI('insertIntoScan', [barcode_detail,$scope.l_data]).then(function (result) {
                    $ionicLoading.hide();
                    var arry = angular.fromJson(result.data[0].data);
                    console.log(arry);
                    $scope.getShowInfo(arry[0]);
                }, function (error) {
                    $ionicLoading.hide();
                    userInfoService.getVoice(error.message, function () {
                        $scope.setFocusMe(true);
                    });
                });
            }

            //彈出詢問 "是否為批號" 視窗
            var showLotPopup = function (barcode_no) {
                var LotPopup = $ionicPopup.show({
                    title: $scope.langs.checkField + $scope.langs.lot,
                    scope: $scope,
                    buttons: [{
                        text: $scope.langs.cancel,
                        onTap: function () {
                            //顯示錯誤 "barcode_no 不存在或無效！"
                            userInfoService.getVoice(barcode_no + $scope.langs.not_exist_or_invalid, function () {
                                $scope.setFocusMe(true);
                                $scope.inTheScan(false);
                            });
                        }
                    }, {
                        text: $scope.langs.confirm,
                        onTap: function () {
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
            var showSelbarcodedataModal = function (barcode_detail) {

                $ionicModal.fromTemplateUrl('views/app/common/html/selbarcodedata.html', {
                    scope: $scope
                }).then(function (modal) {
                    $scope.selbarcodedata = barcode_detail;
                    $scope.show_check_box = false;
                    if (barcode_detail[0].barcode_type == "3") {
                        $scope.show_check_box = true;
                    }

                    $scope.seldata = function (barcode_info) {
                        $scope.close();
                        // checkStorageLot(barcode_info);
                        insertScan(barcode_info);
                    };

                    $scope.seldataMultiple = function (data) {
                        if (data.length) {
                            angular.forEach(data, function (item) {
                                if (item.checked) $scope.seldata(item);
                            });
                        }
                    };

                    $scope.close = function () {
                        $scope.setFocusMe(true);
                        $scope.inTheScan(false);
                        modal.hide().then(function () {
                            return modal.remove();
                        });
                    };
                    modal.show();
                });
            };

            //数量弹窗
            $scope.showQtyPop = function (type) {
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
                commonFactory.showQtyPopup(type, $scope.showInfo.all_qty, maxqty, minqty, $scope.page_params.in_out_no).then(function (res) {
                    $scope.setFocusMe(true);
                    $scope.inTheScan(false);
                    if (typeof res !== "undefined") {
                        $scope.showInfo.all_qty = res;
                        checkqty(type);
                    }
                });
            };

            //計算加減後數值 並呼叫撿查
            $scope.compute = function (type, value) {
                $scope.setFocusMe(false);
                var value1 = angular.copy($scope.showInfo.all_qty);
                var num = numericalAnalysisService.accAdd(value1, value);
                if (num < 1) {
                    num = 1;
                }
                $scope.showInfo.all_qty = num;
                checkqty(type);
            };
            var checkqty = function(){
                
            }

            // if (!commonService.isNull($scope.scaninfo.scanning)) {
            //     $scope.checkScan($scope.scaninfo.scanning);
            // }
        }
    ];
});