define(["API", "APIS", 'AppLang', 'views/app/fil_common/requisition.js', 'array', 'Directives', 'ReqTestData', 'ionic-popup', 'views/app/fil_14/fil_14/requisition.js',
    'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService'
], function() {
    return ['$scope', '$state', '$stateParams', '$timeout', '$filter', 'AppLang', 'APIService', 'APIBridge', 'fil_14_requisition',
        '$ionicLoading', '$ionicPopup', '$ionicModal', '$ionicListDelegate', 'IonicPopupService', 'IonicClosePopupService',
        'fil_common_requisition', 'ReqTestData', 'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService',
        function($scope, $state, $stateParams, $timeout, $filter, AppLang, APIService, APIBridge, fil_14_requisition,
            $ionicLoading, $ionicPopup, $ionicModal, $ionicListDelegate, IonicPopupService, IonicClosePopupService,
            fil_common_requisition, ReqTestData, circulationCardService, commonFactory, commonService, userInfoService, scanTypeService, numericalAnalysisService) {

            $scope.langs = AppLang.langs;
            $scope.page_params = commonService.get_page_params();
            $scope.userInfo = userInfoService.getUserInfo();
            $scope.params = fil_14_requisition.getParams();

            //取得倉庫資訊
            var index = userInfoService.warehouseIndex[$scope.params.warehouse_no] || 0;
            $scope.sel_in_storage = userInfoService.warehouse[index].storage_spaces;

            $scope.scaninfo = {
                scanning: "",
                focus_me: true,
                submit_show: false,
                counting_type: $scope.params.counting_type,
                plan_no: $scope.params.plan_no,
                label_no: $scope.params.label_no,
                item_no: $scope.params.item_no,
                warehouse_no: $scope.params.warehouse_no,
                warehouse_name: userInfoService.warehouse[index].warehouse_name,
                storage_management: $scope.params.storage_management,
                storage_spaces_no: $scope.params.storage_spaces_no,
                storage_spaces_name: " ",
                has_list: $scope.params.has_list,
                isShowReference: false,
            };

            $scope.scanning_detail = [];
            $scope.checkList = fil_14_requisition.check_list;

            $scope.counting_type_array = [
                $scope.langs.inventory,
                $scope.langs.first_count + $scope.langs.one,
                $scope.langs.first_count + $scope.langs.two,
                $scope.langs.second_count + $scope.langs.one,
                $scope.langs.second_count + $scope.langs.two
            ];

            var date = $filter('date')(new Date(), "yyyy/MM/dd");
            var getStorageSpacesName = function(storage_spaces_no) {
                if (!storage_spaces_no) {
                    return "";
                }

                var index = $scope.sel_in_storage.findIndex(function(item) {
                    return commonService.isEquality(storage_spaces_no, item.storage_spaces_no);
                });

                if (index !== -1) {
                    return $scope.sel_in_storage[index].storage_spaces_name;
                }
                return "";
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

                if ($scope.scaninfo.has_list) {
                    inspectionCheckList(scanning);
                    return;
                }
                app_bc_stock_count_data_get(scanning);
                return;
            };

            var inspectionCheckList = function(scanning) {
                //由清單中取得相同的條碼資料
                var tempArray = [];
                for (var i = 0; i < $scope.checkList.length; i++) {
                    var item = $scope.checkList[i];
                    if (!commonService.isEquality(item.warehouse_no, $scope.scaninfo.warehouse_no)) {
                        continue;
                    }

                    if (commonService.isEquality(scanning, item.barcode_no) ||
                        commonService.isEquality(scanning, item.label_no)) {
                        tempArray.push(item);
                    }
                }

                if (tempArray.length > 0) { //存在於盤點清冊
                    selectBarcodedata(scanning, tempArray);
                } else {
                    checkFieldBarcode(scanning);
                }
            };

            var app_bc_stock_count_data_get = function(scanning) {
                var webTran = {
                    service: 'app.bc.stock.count.data.get',
                    parameter: {
                        "counting_type": $scope.scaninfo.counting_type,
                        "site_no": userInfoService.userInfo.site_no,
                        "condition": [{
                            "seq": "1", //1.计划单号
                            "value": $scope.scaninfo.plan_no
                        }, {
                            "seq": "2", //2.标签编号
                            "value": $scope.scaninfo.label_no
                        }, {
                            "seq": "3", //3.仓库
                            "value": $scope.scaninfo.warehouse_no
                        }, {
                            "seq": "4", //4.储位
                            "value": $scope.scaninfo.storage_spaces_no
                        }, {
                            "seq": "5", //5.料号
                            "value": $scope.scaninfo.item_no
                        }, {
                            "seq": "6", //6.條碼
                            "value": scanning
                        }]
                    }
                };

                console.log(webTran);
                $ionicLoading.show();
                APIService.Web_Post(webTran, function(res) {
                    $ionicLoading.hide();
                    // console.log("success:" + angular.toJson(res));
                    var parameter = res.payload.std_data.parameter;
                    checkCounting(scanning, parameter.counting);
                }, function(error) {
                    $ionicLoading.hide();
                    var execution = error.payload.std_data.execution;
                    console.log("error:" + execution.description);
                    userInfoService.getVoice(execution.description, function() {
                        $scope.setFocusMe(true);
                    });
                });
            };

            //詢問是否為條碼，是的話建立空白標籤
            var checkFieldBarcode = function(scanning) {
                var isbarcodePopup = $ionicPopup.show({
                    title: $scope.langs.checkField + $scope.langs.barcode,
                    scope: $scope,
                    buttons: [{
                        text: $scope.langs.cancel,
                        onTap: function() {
                            userInfoService.getVoice($scope.langs.not + $scope.langs.these + $scope.langs.barcode, function() {
                                $scope.setFocusMe(true);
                            });
                        }
                    }, {
                        text: $scope.langs.confirm,
                        onTap: function() {
                            item = {
                                barcode_no: scanning
                            };
                            $scope.exist = false;
                            showPop("add", item);
                        }
                    }]
                });
            };

            var checkCounting = function(scanning, counting) {
                // WS 回傳條碼資訊若為零
                if (counting.length === 0) {
                    checkFieldBarcode(scanning);
                    return;
                }
                //當裝箱條碼回傳有多筆庫存資料，直接寫入至明細檔中
                if (!commonService.isNull(counting[0].packing_barcode) ||
                    !commonService.isNull(counting[0].highest_packing_barcode)) {
                    var tempArray = [];
                    for (var i = 0; i < counting.length; i++) {
                        var element = counting[i];

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
                            tempArray.push(setDetailItem("add", element));
                        }
                    }

                    var flag = addGoods({
                        "show_edit": false,
                        "label_no": " ",
                        "seq": "0",
                        "barcode_no": counting[0].highest_packing_barcode,
                        "item_no": " ",
                        "item_feature_no": " ",
                        "warehouse_no": " ",
                        "storage_spaces_no": " ",
                        "storage_spaces_name": " ",
                        "lot_no": " ",
                        "blank_label": " ",
                        "inventory_qty": " ",
                        "qty": " ",
                        "completed": " ",
                        "status": " ",
                        "employee_no": " ",
                        "complete_date": date,
                        "counting_plans": " ",
                        "reference_qty": " ",
                        "reference_unit_no": " ",
                        "packing_barcode": counting[0].highest_packing_barcode,
                        "highest_packing_barcode": counting[0].highest_packing_barcode,
                        "detail": tempArray || [],
                    });
                    return;
                }
                selectBarcodedata(scanning, counting);
                return;
            };

            var selectBarcodedata = function(scanning, barcode_detail) {
                var tempArray = [];
                if ($scope.scanning_detail.length > 0) {
                    //檢查回傳陣列中的條碼 是否存在掃描明細
                    angular.forEach(barcode_detail, function(value) {
                        var index = $scope.scanning_detail.findIndex(function(item) {
                            return commonService.isEquality(value.label_no, item.label_no) &&
                                commonService.isEquality(value.barcode_no, item.barcode_no) &&
                                commonService.isEquality(value.warehouse_no, item.warehouse_no) &&
                                commonService.isEquality(value.storage_spaces_no, item.storage_spaces_no) &&
                                commonService.isEquality(value.lot_no, item.lot_no) &&
                                commonService.isEquality(value.packing_barcode, item.packing_barcode) &&
                                commonService.isEquality(value.highest_packing_barcode, item.highest_packing_barcode);
                        });

                        if (index == -1) {
                            tempArray.push(value);
                        }
                    });
                } else {
                    tempArray = barcode_detail;
                }

                $scope.exist = true;
                if (tempArray.length <= 0) {
                    userInfoService.getVoice($scope.langs.data_duplication_error, function() {
                        $scope.setFocusMe(true);
                    });
                    return;
                } else if (tempArray.length == 1) {
                    showPop("add", tempArray[0]);
                    return;
                } else {
                    $scope.selbarcodedata = tempArray || [];
                    $ionicModal.fromTemplateUrl('views/app/fil_14/fil_14/fil_14_s03/selbarcodedata.html', {
                        scope: $scope
                    }).then(function(modal) {
                        $scope.seldata = function(item) {
                            $scope.close();
                            showPop("add", item);
                        };

                        $scope.close = function() {
                            modal.hide().then(function() {
                                return modal.remove();
                            });
                        };
                        modal.show();
                    });
                    return;
                }
            };

            var setDetailItem = function(type, item) {
                var temp = {
                    "show_edit": true,
                    "label_no": item.label_no || "",
                    "seq": item.seq || "0",
                    "barcode_no": item.barcode_no,
                    "item_no": item.item_no || "",
                    "item_feature_no": item.item_feature_no || "",
                    "warehouse_no": item.warehouse_no || $scope.scaninfo.warehouse_no,
                    "storage_spaces_no": item.storage_spaces_no || $scope.scaninfo.storage_spaces_no,
                    "storage_spaces_name": "",
                    "lot_no": item.lot_no || "",
                    "blank_label": item.blank_label || "Y",
                    "inventory_qty": item.inventory_qty || 0,
                    "qty": item.qty || 0,
                    "completed": item.completed || "N",
                    "status": item.status || "",
                    "employee_no": userInfoService.userInfo.employee_no,
                    "complete_date": date,
                    "counting_plans": item.counting_plans || $scope.scaninfo.plan_no,
                    "reference_qty": item.reference_qty || 0,
                    "reference_unit_no": item.reference_unit_no || " ",
                    "packing_barcode": item.packing_barcode || "",
                    "highest_packing_barcode": item.highest_packing_barcode || "",
                    "detail": [],
                };

                temp.storage_spaces_name = getStorageSpacesName(temp.storage_spaces_no) || " ";

                if (!commonService.isNull(item.reference_unit_no)) {
                    $scope.scaninfo.isShowReference = true;
                }

                if (type == "add") {
                    if ($scope.userInfo.inventory_display) {
                        if ($scope.page_params.status == '1' || $scope.page_params.status == '2') {
                            temp.qty = parseFloat(item.inventory_qty);
                        }
                        if ($scope.page_params.status == '3' || $scope.page_params.status == '4') {
                            temp.qty = parseFloat(item.qty) || parseFloat(item.inventory_qty);
                        }
                    }
                }

                return temp;
            };

            //显示弹窗
            var showPop = function(type, item) {
                $scope.goods = setDetailItem(type, item);
                $scope.setEditGoods = function() {
                    if (!$scope.goods.qty || $scope.goods.qty < 0) {
                        $scope.goods.qty = 0;
                    }
                    $scope.close();
                    if (type == "add") {
                        addGoods(angular.copy($scope.goods));
                    } else {
                        $scope.scanning_detail[type] = angular.copy($scope.goods);
                    }
                };

                $ionicModal.fromTemplateUrl('views/app/fil_14/fil_14/fil_14_s03/fil_14_s03_01.html', {
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

            $scope.storageShow = function() {
                $scope.setFocusMe(false);
                commonFactory.showStorageModal($scope.sel_in_storage, $scope.scaninfo, $scope.setstorage, function() {
                    $scope.setFocusMe(true);
                });
            };

            $scope.setstorage = function(storage) {
                $scope.setFocusMe(true);
                $scope.goods.storage_spaces_no = storage.storage_spaces_no;
                $scope.goods.storage_spaces_name = storage.storage_spaces_name;
            };

            $scope.clearStorage = function() {
                $scope.setstorage({
                    storage_spaces_no: "",
                    storage_spaces_name: ""
                });
            };

            var getPbarcodeDuplication = function(flag, obj, array) {
                for (var k = 0; k < array.length; k++) {
                    var item = array[k];
                    if (commonService.isEquality(item.barcode_no, obj.barcode_no) &&
                        commonService.isEquality(item.label_no, obj.label_no) &&
                        commonService.isEquality(item.warehouse_no, obj.warehouse_no) &&
                        commonService.isEquality(item.storage_spaces_no, obj.storage_spaces_no) &&
                        commonService.isEquality(item.lot_no, obj.lot_no) &&
                        (commonService.isEquality(item.packing_barcode, obj.packing_barcode) ||
                            commonService.isEquality(item.highest_packing_barcode, obj.highest_packing_barcode)) ||
                        (commonService.isEquality(item.packing_barcode, obj.highest_packing_barcode) ||
                            commonService.isEquality(item.highest_packing_barcode, obj.packing_barcode))) {
                        flag = false;
                        break;
                    }
                    if (item.detail.length > 0) {
                        flag = getPbarcodeDuplication(flag, item, item.detail);
                        if (!flag) {
                            break;
                        }
                    }
                }
                return flag;
            };

            var addGoods = function(obj) {
                var flag = true;
                var errormessage = $scope.langs.barcode_duplication_error;
                if ($scope.scanning_detail.length > 0) {
                    for (var i = 0; i < $scope.scanning_detail.length; i++) {
                        var element = $scope.scanning_detail[i];
                        if (commonService.isEquality(element.barcode_no, obj.barcode_no) &&
                            commonService.isEquality(element.label_no, obj.label_no) &&
                            commonService.isEquality(element.warehouse_no, obj.warehouse_no) &&
                            commonService.isEquality(element.storage_spaces_no, obj.storage_spaces_no) &&
                            commonService.isEquality(element.lot_no, obj.lot_no) &&
                            commonService.isEquality(element.packing_barcode, obj.packing_barcode) &&
                            commonService.isEquality(element.highest_packing_barcode, obj.highest_packing_barcode)) {
                            flag = false;
                            break;
                        }
                        if (commonService.isNull(obj.packing_barcode) ||
                            commonService.isNull(obj.highest_packing_barcode)) {
                            continue;
                        }
                        if (element.detail.length > 0) {
                            flag = getPbarcodeDuplication(flag, element, element.detail);
                            if (!flag) {
                                errormessage = $scope.langs.Pbarcode_duplication_error;
                                break;
                            }
                        }
                    }
                }

                if (!flag) {
                    userInfoService.getVoice(errormessage, function() {
                        $scope.setFocusMe(true);
                    });
                    return flag;
                }

                $scope.setFocusMe(true);
                $scope.scanning_detail.unshift(obj);
                console.log($scope.scanning_detail);
                checkSubmitShow();
                return flag;
            };

            $scope.editGoods = function(index) {
                $ionicListDelegate.closeOptionButtons();
                var temp = angular.copy($scope.scanning_detail[index]);
                showPop(index, temp);
            };

            //左滑删除
            $scope.deleteGoods = function(index) {
                $ionicListDelegate.closeOptionButtons();
                $scope.scanning_detail.splice(index, 1);
                checkSubmitShow();
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

            var checkSubmitShow = function() {
                var flag = false;
                if ($scope.scanning_detail.length > 0) {
                    flag = true;
                }
                $scope.scaninfo.submit_show = flag;
            };

            //提交
            $scope.submit = function() {
                $scope.setFocusMe(false);
                var scan = $scope.getUploadDetail();
                app_stock_count_scan_upload(scan);
            };

            var app_stock_count_scan_upload = function(scan) {
                $scope.scaninfo.submit_show = false;
                var webTran = {
                    service: 'app.stock.count.scan.upload',
                    parameter: {
                        "site_no": userInfoService.userInfo.site_no,
                        "counting_type": $scope.scaninfo.counting_type,
                        "scan": scan,
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
                        fil_14_requisition.init();
                        $state.go("fil_14_s01");
                    });
                }, function(error) {
                    $ionicLoading.hide();
                    var execution = error.payload.std_data.execution;
                    console.log("error:" + execution.description);
                    userInfoService.getVoice(execution.description, function() {
                        $scope.setFocusMe(true);
                        checkSubmitShow();
                    });
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

            $scope.goMenu = function() {
                if ($scope.scanning_detail.length > 0) {
                    // 顯示提示 "有未提交的盤點明細是否捨棄？"
                    var checkGoMenuPop = $ionicPopup.show({
                        title: $scope.langs.point,
                        template: "<p style='text-align: center'>" + $scope.langs.fil_14_check_clear_data + "</p>",
                        scope: $scope,
                        buttons: [{
                            text: $scope.langs.cancel,
                            onTap: function() {}
                        }, {
                            text: $scope.langs.confirm,
                            onTap: function() {
                                fil_14_requisition.init();
                                $state.go("fil_00_s04");
                            }
                        }]
                    });
                    return;
                }
                $state.go("fil_00_s04");
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

        }
    ];
});