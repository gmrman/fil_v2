define(["API", "APIS", 'AppLang', 'views/app/fil_common/requisition.js', 'views/app/fil_00/fil_00_s04/requisition.js', 'array', 'Directives', 'ReqTestData', 'ionic-popup',
    'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService'
], function() {
    return ['$scope', '$state', '$stateParams', '$timeout', '$filter', 'AppLang', 'APIService', 'APIBridge', 'fil_00_s04_requisition',
        '$ionicLoading', '$ionicPopup', '$ionicModal', '$ionicListDelegate', 'IonicPopupService', 'IonicClosePopupService',
        'fil_common_requisition', 'ReqTestData', 'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService',
        function($scope, $state, $stateParams, $timeout, $filter, AppLang, APIService, APIBridge, fil_00_s04_requisition,
            $ionicLoading, $ionicPopup, $ionicModal, $ionicListDelegate, IonicPopupService, IonicClosePopupService,
            fil_common_requisition, ReqTestData, circulationCardService, commonFactory, commonService, userInfoService, scanTypeService, numericalAnalysisService) {

            $scope.page_params = commonService.get_page_params();
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
                $scope.setFocusMe(false);
                if (commonService.isNull(scanning)) {
                    return;
                }

                if ($scope.page_params.status == "5") {
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
                    var parameter = res.payload.std_data.parameter;
                    setShowInfo(scanning, parameter);
                }, function(error) {
                    $ionicLoading.hide();
                    var execution = error.payload.std_data.execution;
                    console.log("error:" + execution.description);

                    if (scanning.length > userInfoService.userInfo.lot_length ||
                        $scope.page_params.status != "5") {
                        userInfoService.getVoice(execution.description, function() {
                            $scope.setFocusMe(true);
                            jumpToFil_17(scanning);
                        });
                        return;
                    }

                    var LotPopup = $ionicPopup.show({
                        title: $scope.langs.checkField + $scope.langs.lot,
                        scope: $scope,
                        buttons: [{
                            text: $scope.langs.cancel,
                            onTap: function() {
                                userInfoService.getVoice(execution.description, function() {
                                    $scope.setFocusMe(true);
                                    jumpToFil_17(scanning);
                                });
                                return;
                            }
                        }, {
                            text: $scope.langs.confirm,
                            onTap: function() {
                                $scope.scaninfo.lot_no = scanning;
                                $scope.setFocusMe(true);
                                return;
                            }
                        }]
                    });
                    IonicClosePopupService.register(false, LotPopup);
                    return;
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
                            $scope.setFocusMe(true);
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
                            $scope.setFocusMe(true);
                        });
                        return;
                    } else {
                        $scope.initShowGood();
                        $scope.getShowInfo();
                        $scope.showInfo.circulationCard = scanning;
                        $scope.showInfo.barcode_no = parameter.wo_no;
                        $scope.showInfo.run_card_no = parameter.run_card_no;
                        $scope.showInfo.seq = parameter.seq;
                        $scope.showInfo.process_no = parameter.op_no;
                        $scope.showInfo.process_name = parameter.op_name;
                        $scope.showInfo.process_seq = parameter.op_seq;
                        $scope.showInfo.workstation = parameter.workstation_no;
                        $scope.showInfo.workstation_name = parameter.workstation_name;
                        $scope.showInfo.item_no = parameter.item_no;
                        $scope.showInfo.item_feature_no = parameter.item_feature_no || " ";
                        $scope.showInfo.item_name = parameter.item_name;
                        $scope.showInfo.work_qty = parameter.reports_qty;
                        $scope.showInfo.maxqty = parameter.reports_qty;
                        if ($scope.page_params.status == 3) {
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
                $scope.setFocusMe(true);

            };

            //数量弹窗
            $scope.showQtyPop = function(type) {
                $scope.setFocusMe(false);
                $scope.pop = {
                    qty: 0,
                    type: type
                };
                switch (type) {
                    case "work_qty":
                        $scope.pop.qty = angular.copy(parseFloat($scope.showInfo.work_qty));
                        break;
                    case "scrap_qty":
                        $scope.pop.qty = angular.copy(parseFloat($scope.showInfo.scrap_qty));
                        break;
                    case "work_hours":
                        $scope.pop.qty = angular.copy(parseFloat($scope.showInfo.work_hours));
                        break;
                    case "machine_time":
                        $scope.pop.qty = angular.copy(parseFloat($scope.showInfo.machine_time));
                        break;
                }

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
                            $scope.pop.qty = ($scope.pop.qty < 0 || !$scope.pop.qty) ? 0 : $scope.pop.qty;
                            var qty = angular.copy(parseFloat($scope.pop.qty));
                            switch (type) {
                                case "work_qty":
                                    $scope.showInfo.work_qty = (computeQty(qty, type)) ? qty : $scope.showInfo.work_qty;
                                    break;
                                case "scrap_qty":
                                    $scope.showInfo.scrap_qty = (computeQty(qty, type)) ? qty : $scope.showInfo.scrap_qty;
                                    break;
                                case "work_hours":
                                    $scope.showInfo.work_hours = qty;
                                    break;
                                case "machine_time":
                                    $scope.showInfo.machine_time = qty;
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
                if (Number(qty) > Number($scope.showInfo.maxqty)) {
                    userInfoService.getVoice($scope.langs.dailyWork_work_qty_error, function() {
                        $scope.setFocusMe(true);
                    });
                    return false;
                }

                //minus
                var max_qty = 0;
                while (Number(before_qty) > Number(qty)) {
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
                                        $scope.setFocusMe(true);
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
                while (Number(count) > Number($scope.showInfo.maxqty)) {
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
                                        $scope.setFocusMe(true);
                                    });
                                    return false;
                                }
                            }
                            if (Number($scope.showInfo.scrap_qty) > 0) {
                                $scope.showInfo.scrap_qty -= 1;
                                break;
                            }
                            break;
                        case "scrap_qty":
                            if (Number($scope.showInfo.work_qty) > 0) {
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
                                        $scope.setFocusMe(true);
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
                $scope.setFocusMe(false);
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
                        $scope.setFocusMe(true);
                        break;
                    case "machine_time":
                        qty = checkmin($scope.showInfo.machine_time, value);
                        $scope.showInfo.machine_time = qty;
                        $scope.setFocusMe(true);
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

            $scope.lotShow = function() {
                $scope.setFocusMe(false);
                commonFactory.showLotPopup($scope.scaninfo.lot_no).then(function(res) {
                    $scope.setFocusMe(true);
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

            //修改批號
            $scope.editLot = function() {
                $scope.setFocusMe(false);
                var webTran = {
                    service: 'app.lot.get',
                    parameter: {
                        "program_job_no": $scope.page_params.program_job_no,
                        "status": $scope.page_params.status,
                        "item_no": $scope.showInfo.item_no,
                        "item_feature_no": "",
                        "site_no": userInfoService.userInfo.site_no,
                        "object_no": "",
                        "action": (commonService.isNull($scope.scaninfo.lot_no)) ? "I" : "Q", //Q.查詢 I.新增
                        "lot_no": $scope.scaninfo.lot_no
                    }
                };

                $ionicLoading.show();
                APIService.Web_Post(webTran, function(res) {
                    $ionicLoading.hide();
                    // console.log("success:" + angular.toJson(res));
                    var parameter = res.payload.std_data.parameter;
                    showSetLot(parameter);
                }, function(error) {
                    $ionicLoading.hide();
                    var execution = error.payload.std_data.execution;
                    console.log("error:" + execution.description);
                    userInfoService.getVoice(execution.description, function() {
                        $scope.setFocusMe(true);
                    });
                });
            };

            var showSetLot = function(parameter) {
                if (parameter.lot_detail.length < 0) {
                    return;
                }
                var effective_date = new Date(parameter.lot_detail[0].effective_date);
                var flag = angular.isDate(effective_date);
                if (!flag) {
                    effective_date = new Date();
                }

                $scope.showGood = {
                    item_no: parameter.lot_detail[0].item_no,
                    item_name: $scope.showInfo.item_name,
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
                    setLot();
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
                    }, function(error) {
                        $ionicLoading.hide();
                        errorpop(error.payload.std_data.execution.description).then(function() {
                            $scope.setFocusMe(true);
                        });
                        console.log(error);
                    });
                };

                var setLot = function() {
                    if (commonService.isEquality($scope.showInfo.item_no, $scope.showGood.item_no) &&
                        commonService.isEquality($scope.showInfo.item_feature_no, $scope.showGood.item_feature_no)) {
                        $scope.scaninfo.lot_no = $scope.showGood.lot_no;
                    }
                    $scope.setFocusMe(true);
                };

                $ionicModal.fromTemplateUrl('views/app/fil_10/fil_10_s02/setLotModal.html', {
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

        }
    ];
});
