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
            var l_info_id = commonService.getCurrent(2) + "_" + $scope.userInfo.account;
            $scope.l_data = {
                bcae005: $scope.page_params.in_out_no, //出入庫瑪
                bcae006: $scope.page_params.func, //作業代號
                bcae014: $scope.page_params.program_job_no,
                bcae015: $scope.page_params.status, //A開立新單/S過賬/Y確認
                info_id: angular.copy(l_info_id)
            };

            //取得倉庫資訊
            var out_warehouse = userInfoService.userInfo.warehouse_no || userInfoService.warehouse[0].warehouse_no;
            var index = userInfoService.warehouseIndex[out_warehouse] || 0;
            var out_storage_management = userInfoService.warehouse[index].storage_management || "N";
            var out_warehouse_cost = userInfoService.warehouse[index].warehouse_cost || "N";
            $scope.sel_in_storage = userInfoService.warehouse[index].storage_spaces;
            var out_storage_spaces_no = " ";
            if (out_storage_management == "Y") {
                out_storage_spaces_no = $scope.sel_in_storage[0].storage_spaces_no;
            }

            $scope.scaninfo = {
                scanning: "",
                focus_me: true,
                modify: false,
                warehouse_no: " ",
                warehouse_name: " ",
                warehouse_cost: " ",
                storage_management: "",
                storage_spaces_no: " ",
                storage_spaces_name: " ",
                lot_no: " "
            };

            if (userInfoService.userInfo.gp_flag || userInfoService.userInfo.server_product == "WF") {
                $scope.scaninfo.warehouse_no = out_warehouse;
                $scope.scaninfo.warehouse_name = userInfoService.warehouse[index].warehouse_name;
                $scope.scaninfo.warehouse_cost = out_warehouse_cost;
                $scope.scaninfo.storage_management = out_storage_management;
                $scope.scaninfo.storage_spaces_no = (out_storage_management == "Y") ? $scope.sel_in_storage[0].storage_spaces_no : " ";
                $scope.scaninfo.storage_spaces_name = (out_storage_management == "Y") ? $scope.sel_in_storage[0].storage_spaces_name : " ";
            }

            $scope.scan = function() {
                console.log("scanBarcode");
                $scope.scaninfo.scanning = "";
                APIBridge.callAPI('scanBarcode', [{}]).then(
                    function(result) {
                        if (result) {
                            console.log('scanBarcode success');
                            $timeout(function() {
                                $scope.checkScan(result.data[0].barcode.trim());
                            }, 0);
                        } else {
                            console.log('scanBarcode false');
                        }
                    },
                    function(result) {
                        console.log("scanBarcode fail");
                        console.log(result);
                    }
                );
            };

            $scope.scanned = function(value) {
                $scope.checkScan(value.trim());
            };

            //檢查掃描欄位資料
            $scope.checkScan = function(scanning) {
                $scope.setFocusMe(false);
                if (commonService.isNull(scanning)) {
                    return;
                }

                var index = 0;
                //取得倉庫資訊
                index = userInfoService.warehouseIndex[scanning];
                if (!angular.isUndefined(index)) { //存在於倉庫基本檔
                    $scope.setwarehouse(userInfoService.warehouse[index]);
                    return;
                }

                index = $scope.sel_in_storage.findIndex(function(item) {
                    return scanning == item.storage_spaces_no;
                });

                if (index !== -1) { //存在於儲位基本檔
                    $scope.setstorage($scope.sel_in_storage[index]);
                    return;
                }

                app_todo_doc_get(scanning);
            };

            var app_todo_doc_get = function(scanning) {
                var scan_type = scanTypeService.judgmentScanType(scanning, userInfoService.userInfo.barcode_separator);
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

                console.log(webTran);
                $ionicLoading.show();
                APIService.Web_Post(webTran, function(res) {
                    $ionicLoading.hide();
                    // console.log("success:" + angular.toJson(res));
                    var parameter = res.payload.std_data.parameter;
                    setCirculationCard(parameter, scanning);
                }, function(error) {
                    $ionicLoading.hide();
                    var execution = error.payload.std_data.execution;
                    console.log("error:" + execution.description);
                    userInfoService.getVoice(execution.description, function() {
                        $scope.setFocusMe(true);
                    });
                });
            };

            var setCirculationCard = function(parameter, scanning) {
                var source_doc_detail = parameter.source_doc_detail;
                if (source_doc_detail.length === 0) {
                    if (scanning.length <= userInfoService.userInfo.lot_length) {
                        //彈出詢問 "是否為批號" 視窗
                        var LotPopup = $ionicPopup.show({
                            title: $scope.langs.checkField + $scope.langs.lot,
                            scope: $scope,
                            buttons: [{
                                text: $scope.langs.cancel,
                                onTap: function() {
                                    userInfoService.getVoice($scope.langs.receipt + $scope.langs.not_exist_or_invalid, function() {
                                        $scope.setFocusMe(true);
                                    });
                                }
                            }, {
                                text: $scope.langs.confirm,
                                onTap: function() {
                                    //設定批號值
                                    $scope.scaninfo.lot_no = scanning;
                                    $scope.setFocusMe(true);
                                }
                            }]
                        });
                        IonicClosePopupService.register(false, LotPopup);
                        return;
                    }
                }

                if (!source_doc_detail[0]) {
                    userInfoService.getVoice($scope.langs.ws_return_error, function() {
                        $scope.setFocusMe(true);
                    });
                    return;
                }

                var doc_qty = source_doc_detail[0].doc_qty || 0;
                var in_out_qty = source_doc_detail[0].in_out_qty || 0;
                var qty = doc_qty - in_out_qty;
                var allow_error_rate = source_doc_detail[0].allow_error_rate || 0;
                var rate = numericalAnalysisService.accAdd(1, numericalAnalysisService.accDiv(allow_error_rate, 100));
                var maxqty = numericalAnalysisService.to_round(
                    numericalAnalysisService.accSub(numericalAnalysisService.accMul(doc_qty, rate), in_out_qty),
                    source_doc_detail[0].decimal_places,
                    source_doc_detail[0].decimal_places_typ);

                if (doc_qty === 0) {
                    if ($scope.page_params.in_out_no == "-1") {
                        userInfoService.getVoice($scope.langs.picks_error_1, function() {
                            $scope.setFocusMe(true);
                        });
                    } else {
                        userInfoService.getVoice($scope.langs.picks_error_2, function() {
                            $scope.setFocusMe(true);
                        });
                    }
                    return;
                }

                if (qty === 0) {
                    userInfoService.getVoice($scope.langs.alreadyPutInStorage + in_out_qty + " , " + $scope.langs.not_required + $scope.langs.put_in_storage, function() {
                        $scope.setFocusMe(true);
                    });
                    return;
                }

                var tempReferenceQty = numericalAnalysisService.accMul(source_doc_detail[0].reference_rate, qty);

                bcmeCreate(parameter);
                $scope.showInfo = {
                    "barcode_no": " ",
                    "source_no": source_doc_detail[0].source_no,
                    "seq": source_doc_detail[0].seq,
                    "run_card_no": source_doc_detail[0].run_card_no,
                    "item_no": source_doc_detail[0].item_no,
                    "item_feature_no": source_doc_detail[0].item_feature_no,
                    "item_name": source_doc_detail[0].item_name,
                    "item_spec": source_doc_detail[0].item_spec,
                    "item_feature_name": source_doc_detail[0].item_feature_name,
                    "lot_control_type": source_doc_detail[0].lot_control_type,
                    "unit": source_doc_detail[0].unit_no,
                    "decimal_places": source_doc_detail[0].decimal_places,
                    "decimal_places_type": source_doc_detail[0].decimal_places_type,
                    "multi_unit_type": source_doc_detail[0].multi_unit_type,

                    "qty": qty,
                    "maxqty": maxqty,
                    "in_out_qty": in_out_qty,

                    "inventory_unit": source_doc_detail[0].inventory_unit,
                    "inventory_qty": source_doc_detail[0].inventory_qty,

                    "reference_unit_no": source_doc_detail[0].reference_unit_no,
                    "reference_qty": source_doc_detail[0].reference_qty,
                    "reference_rate": source_doc_detail[0].reference_rate,

                    "valuation_unit_no": source_doc_detail[0].valuation_unit_no,
                    "valuation_qty": source_doc_detail[0].valuation_qty,
                };
                $scope.scaninfo.lot_no = source_doc_detail[0].lot_no;
                $scope.isShowEditMultiUnit = $scope.checkIsShowEditMultiUnit($scope.showInfo);
                checkSubmitShow();
                $scope.scaninfo.scanning = "";
            };

            var bcmeCreate = function(parameter) {
                if (commonService.Platform == "Chrome") {
                    return;
                }
                $ionicLoading.show();
                APIBridge.callAPI('bcme_create', [parameter, $scope.l_data]).then(function(result) {
                    $ionicLoading.hide();
                    if (result) {
                        console.log('bcme_create success');
                    } else {
                        userInfoService.getVoice('bcme_create error', function() {});
                    }
                }, function(result) {
                    $ionicLoading.hide();
                    userInfoService.getVoice('bcme_create fail', function() {});
                    console.log(result);
                });
            };

            //数量弹窗
            $scope.showQtyPop = function(type) {
                $scope.setFocusMe(false);
                var value = parseFloat($scope.showInfo.qty);
                $scope.pop = {
                    qty: value,
                    type: type
                };
                var myPopup = $ionicPopup.show({
                    title: $scope.langs.edit + $scope.langs.qty,
                    scope: $scope,
                    templateUrl: "views/app/common/html/qtyPop.html",
                    buttons: [{
                        text: $scope.langs.cancel,
                        onTap: function() {
                            $scope.setFocusMe(true);
                        }
                    }, {
                        text: $scope.langs.confirm,
                        onTap: function() {
                            $scope.setFocusMe(true);
                            if (!$scope.pop.qty) {
                                $scope.pop.qty = 0;
                            }
                            $scope.showInfo.qty = checkshowInfo($scope.pop.qty);
                        }
                    }]
                });
                IonicClosePopupService.register(false, myPopup);
            };

            var checkshowInfo = function(qty) {
                if (Number(qty) > Number($scope.showInfo.maxqty)) {
                    if ($scope.page_params.in_out_no == "-1") {
                        userInfoService.getVoice($scope.langs.picks_error_1, function() {
                            $scope.setFocusMe(true);
                        });
                    } else {
                        userInfoService.getVoice($scope.langs.picks_error_2, function() {
                            $scope.setFocusMe(true);
                        });
                    }
                    qty = $scope.showInfo.maxqty;
                } else if (qty < 1) {
                    qty = 1;
                }
                return qty;
            };

            //計算數值是否小於0
            var checkmin = function(value, value2) {
                var num = Number(value) + Number(value2);
                if (num <= 0) {
                    num = 1;
                }
                return num;
            };

            //計算加減後數值 並呼叫撿查
            var compute = function(type, value) {
                $scope.setFocusMe(false);
                switch (type) {
                    case "showInfo":
                        $scope.showInfo.qty = checkshowInfo(checkmin($scope.showInfo.qty, value));
                        break;
                    case "pop.qty":
                        $scope.pop.qty = checkmin($scope.pop.qty, value);
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

            $scope.submit = function() {
                if (userInfoService.userInfo.gp_flag || userInfoService.userInfo.server_product == "WF") {
                    if ($scope.scaninfo.storage_management == "Y") {
                        if (commonService.isNull($scope.scaninfo.storage_spaces_no)) {
                            //顯示錯誤 "此倉庫使用儲位管理，請選擇儲位！"
                            userInfoService.getVoice($scope.langs.storage_management_error, function() {
                                $scope.setFocusMe(true);
                            });
                            return;
                        }
                    }
                    checkLot();
                    return;
                }
                checkSubmit();
            };

            var checkLot = function() {
                // 1. 必須有批號：當批號欄位沒有輸入值時，需要POP窗給使用者輸入
                if ($scope.showInfo.lot_control_type == "1") {
                    if (commonService.isNull($scope.scaninfo.lot_no)) {
                        commonFactory.showLotPopup($scope.scaninfo.lot_no).then(function(res) {
                            if (!commonService.isNull(res)) {
                                $scope.scaninfo.lot_no = res;
                                checkSubmit();
                            } else {
                                //顯示錯誤 "料號批號管控為必須要有批號，因未輸入批號，不新增至掃描資料！"
                                userInfoService.getVoice($scope.langs.lot_control_error, function() {
                                    $scope.setFocusMe(true);
                                });
                            }
                        });
                        return;
                    }
                }

                // 2. 不可有批號： APP有輸入批號時　Y： 把批號清空新增　 N： 不新增到掃描明細
                if ($scope.showInfo.lot_control_type == "2" && !commonService.isNull($scope.scaninfo.lot_no)) {
                    var LotPopup = $ionicPopup.show({
                        title: $scope.langs.point,
                        template: "<p style='text-align: center'>" + $scope.langs.lot_control_point + "</p>",
                        scope: $scope,
                        buttons: [{
                            text: $scope.langs.cancel,
                            onTap: function() {
                                $scope.setFocusMe(true);
                            }
                        }, {
                            text: $scope.langs.confirm,
                            onTap: function() {
                                $scope.scaninfo.lot_no = " ";
                                checkSubmit();
                            }
                        }]
                    });
                    IonicClosePopupService.register(false, LotPopup);
                    return;
                }
                // 3. 不控管
                checkSubmit();
            };

            var checkSubmit = function() {
                $scope.scanning_detail = [];
                var temp = {
                    "source_no": $scope.showInfo.source_no,
                    "seq": $scope.showInfo.seq,
                    "run_card_no": $scope.showInfo.run_card_no,
                    "item_no": $scope.showInfo.item_no,
                    "item_feature_no": $scope.showInfo.item_feature_no,
                    "unit": $scope.showInfo.unit_no,
                    "qty": $scope.showInfo.qty,
                    "warehouse_no": $scope.scaninfo.warehouse_no,
                    "storage_spaces_no": $scope.scaninfo.storage_spaces_no,
                    "lot_no": $scope.scaninfo.lot_no,
                    "inventory_qty": $scope.showInfo.inventory_qty,
                    "inventory_unit": $scope.showInfo.inventory_unit,
                    "reference_qty": $scope.showInfo.reference_qty,
                    "reference_unit_no": $scope.showInfo.reference_unit_no,
                    "valuation_qty": $scope.showInfo.valuation_qty,
                    "valuation_unit_no": $scope.showInfo.valuation_unit_no,
                };

                $scope.scanning_detail.push(temp);
                console.log(temp);
                $ionicLoading.show();
                APIBridge.callAPI('bcaf_create', [$scope.scanning_detail, $scope.l_data]).then(function(result) {
                    if (result) {
                        console.log('bcaf_create success');
                        bcaeBcafUploadCreate();
                    } else {
                        $ionicLoading.hide();
                        userInfoService.getVoice('bcaf_create error', function() {});
                    }
                }, function(result) {
                    $ionicLoading.hide();
                    userInfoService.getVoice('bcaf_create fail', function() {});
                    console.log(result);
                });
            };

            var bcaeBcafUploadCreate = function() {
                APIBridge.callAPI('bcae_bcaf_upload_create', [$scope.l_data]).then(function(result) {
                    if (result) {
                        if (result.data[0].errmsg.trim()) {
                            console.log(result.data[0].errmsg);
                            $ionicLoading.hide();
                            userInfoService.getVoice(result.data[0].errmsg, function() {});
                        } else {
                            var webTran = {
                                service: 'app.bcscanwsupload.create',
                                parameter: {
                                    "site_no": userInfoService.userInfo.site_no,
                                    "employee_no": userInfoService.userInfo.employee_no,
                                    "scan_type": $scope.page_params.upload_scan_type,
                                    "report_datetime": commonService.getCurrent(1),
                                    "recommended_operations": $scope.l_data.bcae014,
                                    "recommended_function": $scope.l_data.bcae015,
                                    "scan_doc_no": "",
                                    "picking_employee_no": userInfoService.userInfo.employee_no,
                                    "picking_department_no": userInfoService.userInfo.department_no,
                                    "doc_type_no": "",
                                    "reason_no": "",
                                    "scan": result.data
                                }
                            };
                            console.log(webTran);
                            console.log('bcae_bcaf_upload_create success');
                            APIService.Web_Post(webTran, function(res) {
                                // console.log("success:" + angular.toJson(res));
                                clearSqlite(res.payload.std_data.parameter.doc_no);
                            }, function(error) {
                                $ionicLoading.hide();
                                var execution = error.payload.std_data.execution;
                                console.log("error:" + execution.description);
                                userInfoService.getVoice(execution.description, function() {
                                    $scope.setFocusMe(true);
                                });
                            });
                        }
                    } else {
                        $ionicLoading.hide();
                        console.log('bcae_bcaf_upload_create false');
                    }
                }, function(error) {
                    $ionicLoading.hide();
                    console.log(error);
                    userInfoService.getVoice('bcae_bcaf_upload_create fail', function() {});
                });
            };

            var clearSqlite = function(doc_no) {
                if (commonService.Platform == "Chrome") {
                    IonicPopupService.successAlert(doc_no).then(function() {
                        showInfoClear();
                        $state.go("fil_09_01_s01");
                    });
                    return;
                }
                $ionicLoading.show();
                APIBridge.callAPI('bcme_ae_af_delete', [$scope.l_data]).then(function(result) {
                    $ionicLoading.hide();
                    IonicPopupService.successAlert(doc_no).then(function() {
                        showInfoClear();
                        $state.go("fil_09_01_s01");
                    });
                }, function(result) {
                    $ionicLoading.hide();
                    userInfoService.getVoice('bcme_ae_af_delete fail', function() {});
                    console.log(result);
                });
            };

            var showInfoClear = function() {
                $scope.showInfo = {
                    source_no: "",
                    seq: "",
                    run_card_no: "",
                    item_no: "",
                    item_feature_no: "",
                    item_name: "",
                    item_spec: "",
                    qty: 0,
                    maxqty: 0,
                };
                $scope.scaninfo.modify = false;
            };

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
                $scope.sel_in_storage = warehouse.storage_spaces;
                // $scope.setstorage($scope.sel_in_storage[0]);
                $scope.clearStorage();
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

            $scope.lotShow = function() {
                $scope.setFocusMe(false);
                commonFactory.showLotPopup($scope.scaninfo.lot_no).then(function(res) {
                    $scope.setFocusMe(true);
                    if (typeof res !== "undefined") {
                        $scope.scaninfo.lot_no = res;
                    }
                });
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

            //判斷提交是否顯示
            var checkSubmitShow = function() {
                $scope.scaninfo.modify = true;
            };

            //判斷是否顯示多單位維護視窗
            $scope.checkIsShowEditMultiUnit = function(item) {
                //庫存數量 T100/TIPTOP不使用
                if (userInfoService.userInfo.server_product == "EF" ||
                    userInfoService.userInfo.server_product == "E10" ||
                    userInfoService.userInfo.server_product == "WF") {
                    return true;
                }

                if (angular.isObject(item) && item.multi_unit_type != "1") {
                    return true;
                }

                var isShowEditMultiUnit = false;
                //是否使用計價單位 0.不使用 1.採購 2.銷售 3.兩者
                switch (userInfoService.userInfo.valuation_unit) {
                    case "1":
                        if ($scope.page_params.mod == "APM") {
                            isShowEditMultiUnit = true;
                        }
                        break;
                    case "2":
                        if ($scope.page_params.mod == "AXM") {
                            isShowEditMultiUnit = true;
                        }
                        break;
                    case "3":
                        if ($scope.page_params.mod == "APM" ||
                            $scope.page_params.mod == "AXM") {
                            isShowEditMultiUnit = true;
                        }
                        break;
                }
                return isShowEditMultiUnit;
            };

            //判斷是否顯示多單位維護視窗
            $scope.checkIsShowEditMultiUnit = function(item) {
                //庫存數量 T100/TIPTOP不使用
                if (userInfoService.userInfo.server_product == "EF" ||
                    userInfoService.userInfo.server_product == "E10" ||
                    userInfoService.userInfo.server_product == "WF") {
                    return true;
                }

                if (angular.isObject(item) && item.multi_unit_type != "1") {
                    return true;
                }

                var isShowEditMultiUnit = false;
                //是否使用計價單位 0.不使用 1.採購 2.銷售 3.兩者
                switch (userInfoService.userInfo.valuation_unit) {
                    case "1":
                        if ($scope.page_params.mod == "APM") {
                            isShowEditMultiUnit = true;
                        }
                        break;
                    case "2":
                        if ($scope.page_params.mod == "AXM") {
                            isShowEditMultiUnit = true;
                        }
                        break;
                    case "3":
                        if ($scope.page_params.mod == "APM" ||
                            $scope.page_params.mod == "AXM") {
                            isShowEditMultiUnit = true;
                        }
                        break;
                }
                return isShowEditMultiUnit;
            };

            //顯示多單位維護 Modal
            $scope.editMultiUnit = function(type, index) {
                $scope.multUnitParameter = {
                    type: type,
                    isEditQty: false,
                    isShowShouldQty: false,
                    isShowInventory: false,
                    isShowReference: false,
                    isShowValuation: false,
                };

                //取得多單位頁面值
                $scope.multUnit = angular.copy($scope.showInfo);
                $scope.multUnit.all_inventory_qty = $scope.multUnit.inventory_qty;
                $scope.multUnit.all_reference_qty = $scope.multUnit.reference_qty;
                $scope.multUnit.all_valuation_qty = $scope.multUnit.valuation_qty;
                $scope.multUnit.all_qty = $scope.multUnit.qty;
                $scope.multUnitParameter.isEditQty = true;

                if (userInfoService.userInfo.server_product == "EF" ||
                    userInfoService.userInfo.server_product == "E10" ||
                    userInfoService.userInfo.server_product == "WF") {
                    $scope.multUnitParameter.isShowInventory = true;
                }

                if ($scope.multUnit.multi_unit_type == "3") {
                    $scope.multUnitParameter.isShowReference = true;
                }

                //是否使用計價單位 0.不使用 1.採購 2.銷售 3.兩者
                switch (userInfoService.userInfo.valuation_unit) {
                    case "1":
                        if ($scope.page_params.mod == "APM") {
                            $scope.multUnitParameter.isShowValuation = true;
                        }
                        break;
                    case "2":
                        if ($scope.page_params.mod == "AXM") {
                            $scope.multUnitParameter.isShowValuation = true;
                        }
                        break;
                    case "3":
                        if ($scope.page_params.mod == "APM" ||
                            $scope.page_params.mod == "AXM") {
                            $scope.multUnitParameter.isShowValuation = true;
                        }
                        break;
                }

                console.log($scope.multUnit);

                $ionicModal.fromTemplateUrl('views/app/common/html/multiUnitQtyModal.html', {
                    scope: $scope
                }).then(function(modal) {

                    //数量弹窗
                    $scope.multiUnitQtyPop = function(type) {
                        var maxqty = "none";
                        var minqty = "none";
                        var qty = 0;

                        switch (type) {
                            case "inventory":
                                qty = $scope.multUnit.all_inventory_qty;
                                break;
                            case "reference":
                                //出項 最大值為條碼參考數量
                                if ($scope.page_params.in_out_no == "-1") {
                                    maxqty = $scope.multUnit.max_reference_qty;
                                }
                                qty = $scope.multUnit.all_reference_qty;
                                break;
                            case "valuation":
                                qty = $scope.multUnit.all_valuation_qty;
                                break;
                            default:
                                qty = $scope.multUnit.all_qty
                                maxqty = $scope.multUnit.maxqty;
                                break;
                        }

                        commonFactory.showQtyPopup(type, qty, maxqty, minqty, $scope.page_params.in_out_no).then(function(res) {
                            $scope.setFocusMe(true);
                            if (typeof res !== "undefined") {
                                switch (type) {
                                    case "inventory":
                                        $scope.multUnit.all_inventory_qty = res;
                                        break;
                                    case "reference":
                                        $scope.multUnit.all_reference_qty = res;
                                        break;
                                    case "valuation":
                                        $scope.multUnit.all_valuation_qty = res;
                                        break;
                                    default:
                                        $scope.multUnit.all_qty = res;
                                        break;
                                }
                                checkMultiUnitQty(type);
                            }
                        });
                    };

                    //修改數量後檢查
                    var checkMultiUnitQty = function(type) {
                        console.log("checkMultiUnitQty");
                        console.log($scope.multUnit);
                        //入項數量控卡
                        if ($scope.multUnit.all_qty > $scope.multUnit.maxqty) {
                            userInfoService.getVoice($scope.langs.receipt + $scope.langs.qty + $scope.langs.insufficient + "！", function() {
                                $scope.setFocusMe(true);
                            });
                            $scope.multUnit.all_qty = $scope.multUnit.maxqty;
                            return;
                        }
                        $scope.setFocusMe(true);
                    };

                    //計算加減後數值 並呼叫撿查
                    $scope.multiUnitCompute = function(type, arg1, arg2) {
                        $scope.setFocusMe(false);
                        var num = numericalAnalysisService.accAdd(arg1, arg2);
                        if (num < 1) {
                            num = 1;
                        }
                        switch (type) {
                            case "inventory":
                                $scope.multUnit.all_inventory_qty = num
                                break;
                            case "reference":
                                $scope.multUnit.all_reference_qty = num;
                                break;
                            case "valuation":
                                $scope.multUnit.all_valuation_qty = num;
                                break;
                            default:
                                $scope.multUnit.all_qty = num;
                                break;
                        }
                        checkMultiUnitQty(type);
                    };

                    $scope.setMultiUnitQty = function() {
                        $scope.showInfo.qty = $scope.multUnit.all_qty;
                        $scope.showInfo.inventory_qty = $scope.multUnit.all_inventory_qty;
                        $scope.showInfo.reference_qty = $scope.multUnit.all_reference_qty;
                        $scope.showInfo.valuation_qty = $scope.multUnit.all_valuation_qty;
                        $scope.setFocusMe(true);
                        $scope.closeMultiUnitQtyModal();
                    };

                    $scope.closeMultiUnitQtyModal = function() {
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