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

            var init = function() {
                //取得預設倉庫 設定頁面 或 第一筆資料
                var out_warehouse = $scope.userInfo.warehouse_no || userInfoService.warehouse[0].warehouse_no;
                //取得倉庫資訊
                var index = userInfoService.warehouseIndex[out_warehouse] || 0;
                $scope.scaninfo = {
                    in_the_scan: false,
                    scanning: "",
                    packing_barcode: "",
                    focus_me: true,
                    warehouse_no: $scope.page_params.warehouse_no || out_warehouse,
                    warehouse_name: userInfoService.warehouse[index].warehouse_name,
                };

                $scope.packing_detail = [];
                $scope.scanning_detail = [];
            };
            init();

            $scope.scan = function() {
                $scope.scaninfo.scanning = "";
                $scope.setFocusMe(false);
                console.log("scanBarcode");
                APIBridge.callAPI('scanBarcode', [{}]).then(function(result) {
                    if (result) {
                        console.log('scanBarcode success');
                        $scope.setFocusMe(true);
                        $scope.inTheScan(false);
                        $scope.checkScan(result.data[0].barcode.trim());
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

            $scope.checkScan = function(scanning) {
                $scope.setFocusMe(false);
                $scope.scaninfo.scanning = "";

                if (commonService.isNull(scanning)) {
                    return;
                }

                if ($scope.scaninfo.in_the_scan) {
                    return;
                }

                $scope.inTheScan(true);

                //取得倉庫資訊
                index = userInfoService.warehouseIndex[scanning];
                if (!angular.isUndefined(index)) { //存在於倉庫基本檔
                    $scope.setwarehouse(userInfoService.warehouse[index]);
                    $scope.inTheScan(false);
                    return;
                }

                if (commonService.isEquality($scope.scaninfo.packing_barcode, scanning)) {
                    //顯示錯誤：此條碼不可以存在裝箱條碼單身條碼清單中！
                    userInfoService.getVoice($scope.langs.fil_19_error_1, function() {
                        $scope.setFocusMe(true);
                        $scope.inTheScan(false);
                    });
                    return;
                }

                app_packing_bc_get("2", scanning);
            };

            var app_packing_bc_get = function(program_job_no, barcode_no) {
                var webTran = {
                    service: 'app.packing.bc.get',
                    parameter: {
                        "site_no": userInfoService.userInfo.site_no,
                        "program_job_no": program_job_no || "",
                        "barcode_no": barcode_no || "",
                        "warehouse_no": $scope.scaninfo.warehouse_no
                    }
                };
                $ionicLoading.show();
                APIService.Web_Post(webTran, function(res) {
                    $ionicLoading.hide();
                    // console.log("success:" + angular.toJson(res));
                    var parameter = res.payload.std_data.parameter;
                    console.log(parameter.packing_barcode);
                    console.log(parameter.packing_detail);
                    switch (program_job_no) {
                        case "1":
                            $scope.setFocusMe(true);
                            $scope.inTheScan(false);
                            $scope.scaninfo.packing_barcode = parameter.packing_barcode || "";
                            break;
                        case "2":
                            setList(barcode_no, parameter.packing_barcode, parameter.packing_detail);
                            break;
                    }
                }, function(error) {
                    $ionicLoading.hide();
                    var execution = error.payload.std_data.execution;
                    console.log("error:" + execution.description);
                    userInfoService.getVoice(execution.description, function() {
                        $scope.setFocusMe(true);
                        $scope.inTheScan(false);
                    });
                });
            }

            var setList = function(barcode_no, packing_barcode, packing_detail) {
                //情境一：畫面裝箱條碼為空，單身為空
                if (commonService.isNull($scope.scaninfo.packing_barcode) && $scope.scanning_detail.length <= 0) {

                    //(a) ws回傳：裝箱條碼(packing_barcode)有值，packing_detail為空
                    //  把ws回傳的裝箱條碼(packing_barcode)欄位值放置畫面裝箱條碼上
                    if (!commonService.isNull(packing_barcode) && packing_detail.length == 0) {
                        $scope.scaninfo.packing_barcode = packing_barcode;
                        $scope.setFocusMe(true);
                        $scope.inTheScan(false);
                        return;
                    }

                    //(b) ws回傳：裝箱條碼(packing_barcode)有值，packing_detail有值
                    //  把ws回傳的裝箱條碼(packing_barcode)欄位值放置畫面裝箱條碼上，packing_detail資料顯示至單身list
                    if (!commonService.isNull(packing_barcode) && packing_detail.length > 0) {
                        $scope.scaninfo.packing_barcode = packing_barcode;
                        for (var i = 0; i < packing_detail.length; i++) {
                            checkAddGoods(false, packing_detail[i]);
                        }
                        $scope.setFocusMe(true);
                        $scope.inTheScan(false);
                        return;
                    }

                    //(c) ws回傳：裝箱條碼(packing_barcode)為空，packing_detail有值
                    //  顯示錯誤訊息：請先掃描裝箱條碼資料
                    if (commonService.isNull(packing_barcode) && packing_detail.length > 0) {
                        userInfoService.getVoice($scope.langs.fil_19_error_2, function() {
                            $scope.setFocusMe(true);
                            $scope.inTheScan(false);
                        });
                        return;
                    }
                }

                //情境二：畫面裝箱條碼有值，單身為空/有值
                if (!commonService.isNull($scope.scaninfo.packing_barcode)) {

                    //(a) ws回傳：裝箱條碼(packing_barcode)有值，packing_detail為空
                    //  顯示錯誤訊息：此裝箱條碼(掃描值)沒有維護對應條碼資料
                    if (!commonService.isNull(packing_barcode) && packing_detail.length == 0) {
                        userInfoService.getVoice($scope.langs.fil_19_error_3, function() {
                            $scope.setFocusMe(true);
                            $scope.inTheScan(false);
                        });
                        return;
                    }

                    //(b) ws回傳：裝箱條碼(packing_barcode)有值，packing_detail有值
                    //  把ws回傳的裝箱條碼(packing_barcode)新增至單身list清單中，數量給1，不可以修改數量
                    if (!commonService.isNull(packing_barcode) && packing_detail.length > 0) {
                        checkAddGoods(false, {
                            "enterprise_no": packing_detail[0].enterprise_no,
                            "site_no": packing_detail[0].site_no,
                            "doc_no": packing_detail[0].doc_no,
                            "barcode_no": packing_barcode,
                            "barcode_type": "4",
                            "qty": 1,
                            "in_out_qty": 0,
                            "warehouse_no": " ",
                            "storage_spaces_no": " ",
                            "lot_no": " ",
                            "inventory_management_features": " ",
                            "reference_unit_no": " ",
                            "reference_qty": " ",
                            "multi_unit_type": " ",
                        });
                        $scope.setFocusMe(true);
                        $scope.inTheScan(false);
                        return;
                    }

                    //(c) ws回傳：裝箱條碼(packing_barcode)為空，packing_detail有值
                    //  把ws回傳的packing_detail資料新增至單身list清單中，數量預設數量(qty)-出入數量(in_out_qty)
                    if (commonService.isNull(packing_barcode) && packing_detail.length > 0) {
                        if (packing_detail.length == 1) {
                            checkAddGoods(true, packing_detail[0]);
                        } else {
                            for (var i = 0; i < packing_detail.length; i++) {
                                packing_detail[i].inventory_qty = packing_detail[i].qty;
                            }
                            $scope.selbarcodedata = packing_detail;
                            showSelbarcodedataModal();
                        }
                        return;
                    }
                }

                //情境三：畫面裝箱條碼為空，單身有值
                if (commonService.isNull($scope.scaninfo.packing_barcode) && $scope.scanning_detail.length > 0) {

                    //(a) ws回傳：裝箱條碼(packing_barcode)有值，packing_detail為空
                    //  把ws回傳的裝箱條碼(packing_barcode)欄位值放置畫面裝箱條碼上
                    if (!commonService.isNull(packing_barcode) && packing_detail.length == 0) {
                        $scope.scaninfo.packing_barcode = packing_barcode;
                        $scope.setFocusMe(true);
                        $scope.inTheScan(false);
                        return;
                    }

                    //(b) ws回傳：裝箱條碼(packing_barcode)有值，packing_detail有值
                    //  把ws回傳的裝箱條碼(packing_barcode)新增至單身list清單中，數量給1，不可以修改數量
                    if (!commonService.isNull(packing_barcode) && packing_detail.length > 0) {
                        checkAddGoods(false, {
                            "enterprise_no": packing_detail[0].enterprise_no,
                            "site_no": packing_detail[0].site_no,
                            "doc_no": packing_detail[0].doc_no,
                            "barcode_no": packing_barcode,
                            "barcode_type": "4",
                            "qty": 1,
                            "in_out_qty": 0,
                            "warehouse_no": " ",
                            "storage_spaces_no": " ",
                            "lot_no": " ",
                            "inventory_management_features": " ",
                            "reference_unit_no": " ",
                            "reference_qty": " ",
                            "multi_unit_type": " ",
                        });
                        $scope.setFocusMe(true);
                        $scope.inTheScan(false);
                        return;
                    }

                    //(c) ws回傳：裝箱條碼(packing_barcode)為空，packing_detail有值
                    //  把ws回傳的packing_detail資料新增至單身list清單中，數量預設數量(qty)-出入數量(in_out_qty)
                    if (commonService.isNull(packing_barcode) && packing_detail.length > 0) {
                        if (packing_detail.length == 1) {
                            checkAddGoods(true, packing_detail[0]);
                        } else {
                            for (var i = 0; i < packing_detail.length; i++) {
                                packing_detail[i].inventory_qty = packing_detail[i].qty;
                            }
                            $scope.selbarcodedata = packing_detail;
                            showSelbarcodedataModal();
                        }
                        return;
                    }
                }

                //顯示錯誤 "scanning 不存在或無效！"
                userInfoService.getVoice(barcode_no + $scope.langs.not_exist_or_invalid, function() {
                    $scope.setFocusMe(true);
                    $scope.inTheScan(false);
                });
                return;
            };

            var showSelbarcodedataModal = function() {
                $ionicModal.fromTemplateUrl('views/app/common/html/selbarcodedata.html', {
                    scope: $scope
                }).then(function(modal) {

                    $scope.show_check_box = false;
                    $scope.seldata = function(barcode_info) {
                        $scope.close();
                        checkAddGoods(true, barcode_info);
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

            //檢查條碼是否重複
            var checkAddGoods = function(isShowQtyPopup, obj) {
                var flag = true;

                if (Number(obj.qty) - Number(obj.in_out_qty) <= 0) {
                    //顯示錯誤訊息：條碼庫存數量不足！
                    userInfoService.getVoice($scope.langs.barcode + $scope.langs.stock + $scope.langs.qty + $scope.langs.insufficient + "！", function() {
                        $scope.setFocusMe(true);
                        $scope.inTheScan(false);
                    });
                    return;
                }

                if ($scope.scanning_detail.length > 0) {
                    for (var i = 0; i < $scope.scanning_detail.length; i++) {
                        var element = $scope.scanning_detail[i];
                        if (commonService.isEquality(element.enterprise_no, obj.enterprise_no) &&
                            commonService.isEquality(element.site_no, obj.site_no) &&
                            commonService.isEquality(element.doc_no, obj.doc_no) &&
                            commonService.isEquality(element.barcode_no, obj.barcode_no) &&
                            commonService.isEquality(element.warehouse_no, obj.warehouse_no) &&
                            commonService.isEquality(element.storage_spaces_no, obj.storage_spaces_no) &&
                            commonService.isEquality(element.lot_no, obj.lot_no) &&
                            commonService.isEquality(element.inventory_management_features, obj.inventory_management_features)) {
                            flag = false;
                            break;
                        }
                    }
                }

                if (!flag) {
                    //顯示錯誤訊息：資料重複
                    userInfoService.getVoice($scope.langs.barcode_duplication_error, function() {
                        $scope.setFocusMe(true);
                        $scope.inTheScan(false);
                    });
                    return;
                }

                checkAddGoodsQty(isShowQtyPopup, obj)
            };

            //檢查是否跳出數字框給使用者修改
            var checkAddGoodsQty = function(isShowQtyPopup, obj) {
                if (!isShowQtyPopup) {
                    $scope.scanning_detail.unshift({
                        "enterprise_no": obj.enterprise_no,
                        "site_no": obj.site_no,
                        "doc_no": obj.doc_no,
                        "barcode_no": obj.barcode_no,
                        "barcode_type": obj.barcode_type,
                        "qty": Number(obj.qty) - Number(obj.in_out_qty),
                        "barcode_qty": obj.qty,
                        "barcode_in_out_qty": obj.in_out_qty,
                        "warehouse_no": obj.warehouse_no,
                        "storage_spaces_no": obj.storage_spaces_no,
                        "lot_no": obj.lot_no,
                        "inventory_management_features": obj.inventory_management_features,
                        "reference_unit_no": obj.reference_unit_no,
                        "reference_qty": obj.reference_qty,
                        "multi_unit_type": obj.multi_unit_type,
                    });
                    return;
                }

                var qty = obj.qty - obj.in_out_qty;
                var maxqty = obj.qty - obj.in_out_qty;

                showEditGoodsPop(qty, maxqty, obj.reference_qty, obj.reference_unit_no, obj.multi_unit_type).then(function(res) {
                    console.log(res);
                    $scope.setFocusMe(true);
                    $scope.inTheScan(false);
                    if (typeof res !== "undefined") {
                        $scope.scanning_detail.unshift({
                            "enterprise_no": obj.enterprise_no,
                            "site_no": obj.site_no,
                            "doc_no": obj.doc_no,
                            "barcode_no": obj.barcode_no,
                            "barcode_type": obj.barcode_type,
                            "qty": res.qty,
                            "barcode_qty": obj.qty,
                            "barcode_in_out_qty": obj.in_out_qty,
                            "warehouse_no": obj.warehouse_no,
                            "storage_spaces_no": obj.storage_spaces_no,
                            "lot_no": obj.lot_no,
                            "inventory_management_features": obj.inventory_management_features,
                            "reference_unit_no": obj.reference_unit_no,
                            "reference_qty": res.reference_qty,
                            "multi_unit_type": obj.multi_unit_type,
                        });
                    }
                });
                return;
            };

            $scope.editGoods = function(index) {
                $ionicListDelegate.closeOptionButtons();
                var qty = $scope.scanning_detail[index].qty;
                var maxqty = $scope.scanning_detail[index].barcode_qty - $scope.scanning_detail[index].barcode_in_out_qty;
                var reference_qty = $scope.scanning_detail[index].reference_qty;
                var reference_unit_no = $scope.scanning_detail[index].reference_unit_no;
                var multi_unit_type = $scope.scanning_detail[index].multi_unit_type;
                showEditGoodsPop(qty, maxqty, reference_qty, reference_unit_no, multi_unit_type).then(function(res) {
                    $scope.setFocusMe(true);
                    $scope.inTheScan(false);
                    if (typeof res !== "undefined") {
                        $scope.scanning_detail[index].qty = res.qty;
                        $scope.scanning_detail[index].reference_qty = res.reference_qty;
                    }
                });
            };

            var showEditGoodsPop = function(qty, maxqty, reference_qty, reference_unit_no, multi_unit_type) {

                $scope.pop = {
                    qty: parseFloat(qty),
                    maxqty: maxqty,
                    minqty: 0,
                    reference_qty: reference_qty || 0,
                    reference_unit_no: reference_unit_no,
                    multi_unit_type: multi_unit_type,
                };

                var QtyPop = $ionicPopup.show({
                    title: $scope.langs.edit + $scope.langs.qty,
                    scope: $scope,
                    templateUrl: "views/app/fil_19/fil_19_s01/fil_19_s01_01.html",
                    buttons: [{
                        text: $scope.langs.cancel
                    }, {
                        text: $scope.langs.confirm,
                        onTap: function(e) {
                            if (!$scope.pop.qty) {
                                $scope.pop.qty = 0;
                            }

                            if (!$scope.pop.reference_qty) {
                                $scope.pop.reference_qty = 0;
                            }

                            var flag = true;
                            var error_massage = AppLang.langs.picks_error_1;
                            var error_recovery_qty = 0;

                            if ($scope.pop.maxqty != "none" && Number($scope.pop.qty) > Number($scope.pop.maxqty)) {
                                flag = false;
                                error_recovery_qty = $scope.pop.maxqty;
                            }

                            if ($scope.pop.minqty != "none" && Number($scope.pop.qty) < Number($scope.pop.minqty)) {
                                flag = false;
                                error_massage = AppLang.langs.picks_error_3;
                                error_recovery_qty = $scope.pop.minqty;
                            }

                            if (flag) {
                                return {
                                    qty: Number($scope.pop.qty),
                                    reference_qty: Number($scope.pop.reference_qty) || 0,
                                };
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
            };

            //計算數值是否小於最小值
            var checkmin = function(value, value2, min) {
                var num = Number(numericalAnalysisService.accAdd(value, value2));
                if (num < min) {
                    num = min;
                }
                return num;
            };

            //計算加減後數值 並呼叫撿查
            var compute = function(type, value) {
                switch (type) {
                    case 'qty':
                        qty = checkmin($scope.pop.qty, value, 1);
                        if ($scope.pop.maxqty == "none") {
                            $scope.pop.qty = qty;
                        } else {
                            $scope.pop.qty = (Number($scope.pop.maxqty) > Number(qty)) ? qty : $scope.pop.maxqty;
                        }
                        break;
                    case 'reference_qty':
                        $scope.pop.reference_qty = checkmin($scope.pop.reference_qty, value, 0);
                        break;
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

            $scope.delGoods = function(index) {
                $ionicListDelegate.closeOptionButtons();
                $scope.scanning_detail.splice(index, 1);
            };

            //跳出詢問視窗：是否一併刪除清單資料?
            $scope.clearPackingBarcode = function() {
                $scope.setFocusMe(false);
                if ($scope.scanning_detail.length <= 0) {
                    init();
                    $scope.setFocusMe(true);
                    $scope.inTheScan(false);
                    return;
                }
                var checkClearPackingBarcode = $ionicPopup.show({
                    title: $scope.langs.point,
                    template: "<p style='text-align: center'>" + $scope.langs.fil_19_check_clear_list + "</p>",
                    scope: $scope,
                    buttons: [{
                        text: $scope.langs.no,
                        onTap: function() {
                            $scope.setFocusMe(true);
                            $scope.inTheScan(false);
                            $scope.scaninfo.packing_barcode = "";
                        }
                    }, {
                        text: $scope.langs.yes,
                        onTap: function() {
                            init();
                            $scope.setFocusMe(true);
                            $scope.inTheScan(false);
                        }
                    }]
                });
                return;
            };

            //產生新的裝箱條碼，呼叫ws(app.packing.bc.get)，參數作業編號(program_job_no) = 1，條碼編號(barcode_no)為空
            $scope.getPackingBarcode = function() {
                $scope.setFocusMe(false);
                app_packing_bc_get("1", "");
            };

            //提交，呼叫ws(app.packing.bc.create)
            $scope.submit = function(status) {
                var packing_detail = []
                for (var i = 0; i < $scope.scanning_detail.length; i++) {
                    var element = $scope.scanning_detail[i];
                    packing_detail.push({
                        "enterprise_no": element.enterprise_no,
                        "site_no": element.site_no,
                        "doc_no": element.doc_no,
                        "barcode_no": element.barcode_no,
                        "qty": element.qty,
                        "warehouse_no": element.warehouse_no,
                        "storage_spaces_no": element.storage_spaces_no,
                        "lot_no": element.lot_no,
                        "inventory_management_features": element.inventory_management_features,
                        "reference_unit_no": element.reference_unit_no,
                        "reference_qty": element.reference_qty,
                        "multi_unit_type": element.multi_unit_type,
                    })
                }

                if (packing_detail.length <= 0) {
                    return;
                }

                var webTran = {
                    service: 'app.packing.bc.create',
                    parameter: {
                        "site_no": userInfoService.userInfo.site_no,
                        "status": status || "I",
                        "packing_barcode": $scope.scaninfo.packing_barcode,
                        "packing_detail": packing_detail
                    }
                };
                $ionicLoading.show();
                APIService.Web_Post(webTran, function(res) {
                    $ionicLoading.hide();
                    // console.log("success:" + angular.toJson(res));
                    var parameter = res.payload.std_data.parameter;
                    console.log(parameter.doc_no);
                    IonicPopupService.successAlert(parameter.doc_no).then(function() {
                        init();
                    });
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

            $scope.goMenu = function() {
                $scope.setFocusMe(false);
                if ($scope.scanning_detail.length <= 0) {
                    $state.go("fil_00_s04");
                    return;
                }
                // 顯示提示 "過帳數量不匹，是否提交"
                var checkGoMenuPop = $ionicPopup.show({
                    title: $scope.langs.point,
                    template: "<p style='text-align: center'>" + $scope.langs.check_clear_submit_data + "</p>",
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
                            $state.go("fil_00_s04");
                        }
                    }]
                });
            };

            $scope.clearScanning = function() {
                $scope.scaninfo.scanning = "";
                $scope.setFocusMe(true);
                $scope.inTheScan(false);
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

            //藉由 flag 判斷是否在掃描中
            $scope.inTheScan = function(flag) {
                $scope.scaninfo.in_the_scan = flag;
            };

            //彈出倉庫選擇頁面
            $scope.warehouseShow = function() {
                $scope.setFocusMe(false);
                commonFactory.showWarehouseModal(userInfoService.warehouse, $scope.scaninfo, $scope.setwarehouse, function() {
                    $scope.setFocusMe(true);
                    $scope.inTheScan(false);
                });
            };

            //清除倉庫
            $scope.clearWarehouse = function() {
                $scope.setwarehouse({
                    "warehouse_no": " ",
                    "warehouse_name": "",
                    "storage_spaces": [],
                    "storage_management": "N",
                    "warehouse_cost": "N",
                });
            };

            //設定倉庫及儲位陣列
            $scope.setwarehouse = function(warehouse) {
                $scope.setFocusMe(true);
                $scope.inTheScan(false);
                $scope.scaninfo.warehouse_no = warehouse.warehouse_no;
                $scope.scaninfo.warehouse_name = warehouse.warehouse_name;
            };

        }
    ];
});