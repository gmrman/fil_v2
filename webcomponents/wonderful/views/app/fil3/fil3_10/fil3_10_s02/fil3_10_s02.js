define(["API", "APIS", 'commonService', 'commonFactory', 'ionic-popup', "AppLang", "array", "Directives", "ReqTestData", "views/app/fil_common/requisition.js", "views/app/fil_00/fil_00_s04/requisition.js", "circulationCardService"], function() {
    return ["$scope", "$state", "$timeout", "APIService", "APIBridge", "commonService", "commonFactory", "userInfoService", "fil_common_requisition", "circulationCardService",
        "ReqTestData", "AppLang", "$ionicPopup", "$ionicModal", "$ionicLoading", "IonicPopupService", "IonicClosePopupService", "fil_00_s04_requisition",
        function($scope, $state, $timeout, APIService, APIBridge, commonService, commonFactory, userInfoService, fil_common_requisition, circulationCardService,
            ReqTestData, AppLang, $ionicPopup, $ionicModal, $ionicLoading, IonicPopupService, IonicClosePopupService, fil_00_s04_requisition) {

            $scope.userInfo = userInfoService.getUserInfo();
            $scope.scan = function() {
                console.log("scanBarcode");
                $scope.scaninfo.scanning = "";
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

            $scope.checkScan = function(scanning) {
                $scope.scaninfo.scanning = "";
                $scope.scaninfo.focus_me = false;
                if (commonService.isNull(scanning)) {
                    return;
                }

                if ($scope.params.status == "5") {
                    //掃描儲位帶入第一筆倉庫
                    // for (var i = 0, len = userInfoService.warehouse.length; i < len; i++) {
                    //     var sel_in_storage = userInfoService.warehouse[i].storage_spaces;
                    //
                    //     index = sel_in_storage.findIndex(function(item) {
                    //         return commonService.isEquality(scanning,item.storage_spaces_no);
                    //     });
                    //
                    //     if (index !== -1) { //存在於儲位基本檔
                    //         $scope.setwarehouse(userInfoService.warehouse[i]);
                    //         $scope.setstorage(sel_in_storage[index]);
                    //         return;
                    //     }
                    //
                    // }

                    //取得倉庫資訊
                    var index = userInfoService.warehouseIndex[scanning];
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

                    if (scanning.length <= userInfoService.userInfo.lot_length) {
                        var LotPopup = $ionicPopup.show({
                            title: $scope.langs.checkField + $scope.langs.lot,
                            scope: $scope,
                            buttons: [{
                                text: $scope.langs.cancel,
                                onTap: function() {
                                    setCirculationCard(scanning);
                                }
                            }, {
                                text: $scope.langs.confirm,
                                onTap: function() {
                                    $scope.scaninfo.lot_no = scanning;
                                    $scope.scaninfo.focus_me = true;
                                }
                            }]
                        });
                        IonicClosePopupService.register(false, LotPopup);
                        return;
                    }
                }
                setCirculationCard(scanning);
            };

            var setCirculationCard = function(scanning) {
                var webTran = {
                    service: 'app.wo.process.machine.get',
                    parameter: {
                        "barcode_no": scanning,
                        "site_no": userInfoService.userInfo.site_no,
                        "analysis_symbol": userInfoService.userInfo.barcode_separator || "%",
                        "report_type": $scope.showInfo.workCat
                    }
                };
                $ionicLoading.show();
                APIService.Web_Post(webTran, function(res) {
                    $ionicLoading.hide();
                    // console.log("success:" + angular.toJson(res));
                    $timeout(function() {
                        var parameter = res.payload.std_data.parameter;
                        setShowInfo(scanning, parameter);
                    }, 0);
                }, function(error) {
                    $ionicLoading.hide();
                    var execution = error.payload.std_data.execution;
                    console.log("error:" + execution.description);

                    if (!commonService.isNull(userInfoService.userInfo.voice) && userInfoService.userInfo.voice != "novoice") {
                        APIBridge.callAPI('VoiceUtils', [{
                            "someone": userInfoService.userInfo.voice,
                            "content": content
                        }]).then(function(result) {
                            IonicPopupService.errorAlert(execution.description).then(function() {
                                $scope.scaninfo[$scope.scan_field - 1].focus_me = true;
                                if ($scope.scan_field == 1) {
                                    jumpToFil_17(scanning);
                                }
                            });
                        }, function(result) {
                            IonicPopupService.errorAlert(execution.description).then(function() {
                                $scope.scaninfo[$scope.scan_field - 1].focus_me = true;
                                if ($scope.scan_field == 1) {
                                    jumpToFil_17(scanning);
                                }
                            });
                        });
                    } else {
                        IonicPopupService.errorAlert(execution.description).then(function() {
                            $scope.scaninfo[$scope.scan_field - 1].focus_me = true;
                            if ($scope.scan_field == 1) {
                                jumpToFil_17(scanning);
                            }
                        });
                    }
                });

            };

            var jumpToFil_17 = function(scanning) {
                if (userInfoService.userInfo.server_product == "易飞" ||
                    userInfoService.userInfo.server_product == "E10" ||
                    userInfoService.userInfo.server_product == "WF") {
                    return;
                }
                if (!fil_00_s04_requisition.setDisplay($scope.page_params.func)) {
                    return;
                }
                var LotPopup = $ionicPopup.show({
                    title: $scope.langs.checkJumpTo + $scope.langs.work_rder + $scope.langs.process + $scope.langs.inquire,
                    scope: $scope,
                    buttons: [{
                        text: $scope.langs.cancel,
                        onTap: function() {
                            $scope.scaninfo.focus_me = true;
                        }
                    }, {
                        text: $scope.langs.confirm,
                        onTap: function() {
                            var obj = circulationCardService.checkCirculationCard(scanning, userInfoService.userInfo.barcode_separator);
                            fil_common_requisition.scanning = obj.doc_no + userInfoService.userInfo.barcode_separator + obj.run_card_no;
                            $state.go("fil_17_s01");
                        }
                    }]
                });
                IonicClosePopupService.register(false, LotPopup);
            };

            var setShowInfo = function(scanning, parameter) {
                var index = -1;
                if (parameter.return_type == 1) {
                    index = $scope.scanning_detail.findIndex(function(item) {
                        return commonService.isEquality(scanning, item.circulationCard);
                    });

                    if (index != -1) {
                        userInfoService.getVoice($scope.langs.data_duplication_error, function() {
                            $scope.scaninfo.focus_me = true;
                        });
                    } else {
                        $scope.initShowGood();
                        $scope.getShowInfo();
                        $scope.showInfo.circulationCard = scanning;
                        $scope.showInfo.barcode_no = parameter.wo_no;
                        $scope.showInfo.run_card_no = parameter.run_card_no;
                        $scope.showInfo.process_no = parameter.op_no;
                        $scope.showInfo.process_name = parameter.op_name;
                        $scope.showInfo.process_seq = parameter.op_seq;
                        $scope.showInfo.workstation = parameter.workstation_no;
                        $scope.showInfo.workstation_name = parameter.workstation_name;
                        $scope.showInfo.item_no = parameter.item_no;
                        $scope.showInfo.item_name = parameter.item_name;
                        $scope.showInfo.work_qty = parameter.reports_qty;
                        $scope.showInfo.maxqty = parameter.reports_qty;
                        if ($scope.params.status == 3) {
                            $scope.showInfo.work_hours = parameter.work_hours;
                        }
                        $scope.showGood.barcode_no = scanning;
                        $scope.scaninfo.modify = true;
                        $scope.addGoods(angular.copy($scope.showInfo));
                        $scope.getShowInfo();
                        return;
                    }
                }

                if (parameter.return_type == 2) {
                    $scope.showInfo.machine_no = parameter.machine_no;
                    $scope.showInfo.machine_name = parameter.machine_name;
                }
                if (parameter.return_type == 3) {
                    $scope.showInfo.shift_no = parameter.shift_no;
                    $scope.showInfo.shift_name = parameter.shift_name;
                }
                if (parameter.return_type == 4) {
                    $scope.showInfo.employee_no = parameter.employee_no;
                    $scope.showInfo.employee_name = parameter.employee_name;
                }
                if (parameter.return_type == 5) {
                    $scope.showInfo.workstation = parameter.workstation_no;
                    $scope.showInfo.workstation_name = parameter.workstation_name;
                }
                $scope.scaninfo.focus_me = true;

            };

            //数量弹窗
            $scope.showQtyPop = function(type) {
                $scope.scaninfo.focus_me = false;
                $scope.pop = {
                    qty: 0,
                    type: type
                };
                switch (type) {
                    case "work_qty":
                        $scope.pop.qty = parseFloat($scope.showInfo.work_qty);
                        break;
                    case "scrap_qty":
                        $scope.pop.qty = parseFloat($scope.showInfo.scrap_qty);
                        break;
                    case "work_hours":
                        $scope.pop.qty = parseFloat($scope.showInfo.work_hours);
                        break;
                    case "machine_time":
                        $scope.pop.qty = parseFloat($scope.showInfo.machine_time);
                        break;
                }

                var myPopup = $ionicPopup.show({
                    title: $scope.langs.edit + $scope.langs.qty,
                    scope: $scope,
                    templateUrl: "views/app/common/qtyPop.html",
                    buttons: [{
                        text: $scope.langs.cancel,
                        onTap: function() {
                            $scope.scaninfo.focus_me = true;
                        }
                    }, {
                        text: $scope.langs.confirm,
                        onTap: function() {
                            $scope.scaninfo.focus_me = true;
                            $scope.pop.qty = ($scope.pop.qty < 0 || !$scope.pop.qty) ? 0 : $scope.pop.qty;
                            switch (type) {
                                case "work_qty":
                                    $scope.showInfo.work_qty = (computeQty($scope.pop.qty, type)) ? $scope.pop.qty : $scope.showInfo.work_qty;
                                    break;
                                case "scrap_qty":
                                    $scope.showInfo.scrap_qty = (computeQty($scope.pop.qty, type)) ? $scope.pop.qty : $scope.showInfo.scrap_qty;
                                    break;
                                case "work_hours":
                                    $scope.showInfo.work_hours = $scope.pop.qty;
                                    break;
                                case "machine_time":
                                    $scope.showInfo.machine_time = $scope.pop.qty;
                                    break;
                            }
                        }
                    }]
                });
                IonicClosePopupService.register(false, myPopup);
            };

            var computeQty = function(qty, type) {
                var count = 0;
                var work_qty = parseInt($scope.showInfo.work_qty);
                var scrap_qty = parseInt($scope.showInfo.scrap_qty);
                switch (type) {
                    case "work_qty":
                        count = qty + scrap_qty;
                        before_qty = work_qty;
                        break;
                    case "scrap_qty":
                        count = work_qty + qty;
                        before_qty = scrap_qty;
                        break;
                }
                return distributionQty(qty, count, type, before_qty);
            };



            var distributionQty = function(qty, count, type, before_qty) {
                if (qty > $scope.showInfo.maxqty) {
                    userInfoService.getVoice($scope.langs.dailyWork_work_qty_error, function() {
                        $scope.scaninfo.focus_me = true;
                    });
                    return false;
                }

                //minus
                var max_qty = 0;
                while (before_qty > qty) {
                    switch (type) {
                        case "scrap_qty":
                            if ($scope.showInfo.scraps.length > 0) {
                                max_qty = 0;
                                angular.forEach($scope.showInfo.scraps, function(value) {
                                    if (max_qty < value.defect_qty) {
                                        max_qty = value.defect_qty;
                                    }
                                });
                                if (qty < max_qty) {
                                    userInfoService.getVoice($scope.langs.defect_qty_error, function() {
                                        $scope.scaninfo.focus_me = true;
                                    });
                                    return false;
                                }
                            }
                            $scope.showInfo.work_qty += 1;
                            break;
                    }
                    before_qty -= 1;
                }

                //add
                while (count > $scope.showInfo.maxqty) {
                    switch (type) {
                        case "work_qty":
                            if ($scope.showInfo.scraps.length > 0) {
                                angular.forEach($scope.showInfo.scraps, function(value) {
                                    if (max_qty < value.defect_qty) {
                                        max_qty = value.defect_qty;
                                    }
                                });
                                if ($scope.showInfo.scrap_qty <= max_qty) {
                                    userInfoService.getVoice($scope.langs.defect_qty_error, function() {
                                        $scope.scaninfo.focus_me = true;
                                    });
                                    return false;
                                }
                            }
                            if ($scope.showInfo.scrap_qty > 0) {
                                $scope.showInfo.scrap_qty -= 1;
                                break;
                            }
                            break;
                        case "scrap_qty":
                            if ($scope.showInfo.work_qty > 0) {
                                $scope.showInfo.work_qty -= 1;
                                break;
                            }
                            if ($scope.showInfo.scraps.length > 0) {
                                angular.forEach($scope.showInfo.scraps, function(value) {
                                    if (max_qty < value.defect_qty) {
                                        max_qty = value.defect_qty;
                                    }
                                });
                                if ($scope.showInfo.scrap_qty <= max_qty) {
                                    userInfoService.getVoice($scope.langs.defect_qty_error, function() {
                                        $scope.scaninfo.focus_me = true;
                                    });
                                    return false;
                                }
                            }
                            break;
                    }
                    count -= 1;
                }
                return true;
            };

            //計算數值是否小於0
            var checkmin = function(value, value2) {
                var num = Number(value) + Number(value2);
                if (num < 0) {
                    num = value;
                }
                return num;
            };

            //計算加減後數值 並呼叫撿查
            var compute = function(type, value) {
                $scope.scaninfo.focus_me = false;
                var qty = 0;
                switch (type) {
                    case "pop.qty":
                        qty = checkmin($scope.pop.qty, value);
                        $scope.pop.qty = (computeQty(qty, $scope.pop.type)) ? qty : $scope.pop.qty;
                        break;
                    case "work_qty":
                        qty = checkmin($scope.showInfo.work_qty, value);
                        $scope.showInfo.work_qty = (computeQty(qty, type)) ? qty : $scope.showInfo.work_qty;
                        break;
                    case "scrap_qty":
                        qty = checkmin($scope.showInfo.scrap_qty, value);
                        $scope.showInfo.scrap_qty = (computeQty(qty, type)) ? qty : $scope.showInfo.scrap_qty;
                        break;
                    case "work_hours":
                        qty = checkmin($scope.showInfo.work_hours, value);
                        $scope.showInfo.work_hours = qty;
                        $scope.scaninfo.focus_me = true;
                        break;
                    case "machine_time":
                        qty = checkmin($scope.showInfo.machine_time, value);
                        $scope.showInfo.machine_time = qty;
                        $scope.scaninfo.focus_me = true;
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

            $scope.warehouseShow = function() {
                $scope.scaninfo.focus_me = false;
                commonFactory.showWarehouseModal(userInfoService.warehouse, $scope.scaninfo, $scope.setwarehouse, function() {
                    $scope.scaninfo.focus_me = true;
                });
            };

            $scope.setwarehouse = function(warehouse) {
                $scope.scaninfo.focus_me = true;
                $scope.scaninfo.warehouse_no = warehouse.warehouse_no;
                $scope.scaninfo.warehouse_name = warehouse.warehouse_name;
                $scope.scaninfo.storage_management = warehouse.storage_management;
                $scope.sel_in_storage = warehouse.storage_spaces;
                // $scope.setstorage($scope.sel_in_storage[0]);
            };

            $scope.storageShow = function() {
                $scope.scaninfo.focus_me = false;
                commonFactory.showStorageModal($scope.sel_in_storage, $scope.scaninfo, $scope.setstorage, function() {
                    $scope.scaninfo.focus_me = true;
                });
            };

            $scope.setstorage = function(storage) {
                $scope.scaninfo.focus_me = true;
                $scope.scaninfo.storage_spaces_no = storage.storage_spaces_no;
                $scope.scaninfo.storage_spaces_name = storage.storage_spaces_name;
            };

            $scope.lotShow = function() {
                $scope.scaninfo.focus_me = false;
                commonFactory.showLotPopup($scope.scaninfo.lot_no).then(function(res) {
                    $scope.scaninfo.focus_me = true;
                    if (typeof res !== "undefined") {
                        $scope.scaninfo.lot_no = res;
                    }
                });
            };

            $scope.clearStorage = function() {
                $scope.setstorage({
                    storage_spaces_no: "",
                    storage_spaces_name: ""
                });
            };

        }
    ];
});
