define(["API", "APIS", 'AppLang', 'views/app/fil_common/requisition.js', 'array', 'Directives', 'ReqTestData', 'ionic-popup',
    'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService'
], function() {
    return ['$scope', '$state', '$timeout', '$filter', 'AppLang', 'APIService', 'APIBridge',
        '$ionicLoading', '$ionicPopup', '$ionicModal', '$ionicListDelegate', 'IonicPopupService', 'IonicClosePopupService',
        'fil_common_requisition', 'ReqTestData', 'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService',
        function($scope, $state, $timeout, $filter, AppLang, APIService, APIBridge,
            $ionicLoading, $ionicPopup, $ionicModal, $ionicListDelegate, IonicPopupService, IonicClosePopupService,
            fil_common_requisition, ReqTestData, circulationCardService, commonFactory, commonService, userInfoService, scanTypeService, numericalAnalysisService) {
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

                var barcode_separator = userInfoService.userInfo.barcode_separator || "%";
                var index_1 = scanning.indexOf(barcode_separator);

                //如果有% 判定為組合條碼CALL WS
                if (index_1 != -1) {
                    callQCGetWS(scanning);
                    return;
                }

                //WF不需輸入檢驗人員
                if (userInfoService.userInfo.server_product == "WF") {
                    callQCGetWS(scanning);
                    return;
                }

                var webTran = {
                    service: 'employee.name.get',
                    parameter: {
                        "site_no": userInfoService.userInfo.site_no,
                        "employee_no": scanning
                    }
                };
                $ionicLoading.show();
                APIService.Web_Post(webTran, function(res) {
                    $ionicLoading.hide();
                    // console.log("success:" + angular.toJson(res));
                    var parameter = res.payload.std_data.parameter;
                    setEmployee(parameter);
                }, function(error) {
                    $ionicLoading.hide();
                    var execution = error.payload.std_data.execution;
                    console.log("error:" + execution.description);
                    userInfoService.getVoice(execution.description, function() {
                        $scope.setFocusMe(true);
                    });
                    callQCGetWS(scanning);
                });
            };

            var callQCGetWS = function(scanning) {
                var webTran = {
                    service: 'app.qc.get',
                    parameter: {
                        "program_job_no": $scope.page_params.program_job_no,
                        "scan_type": "4",
                        "status": $scope.page_params.status,
                        "analysis_symbol": userInfoService.userInfo.barcode_separator || "%",
                        "site_no": userInfoService.userInfo.site_no,
                        "doc_no": scanning,
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
                    userInfoService.getVoice(execution.description, function() {
                        $scope.setFocusMe(true);
                    });
                });
            };

            var setEmployee = function(parameter) {
                $scope.showInfo.scan_employee_no = parameter.employee_no;
                $scope.showInfo.scan_employee_name = parameter.employee_name;
                if ($scope.showInfo.scan_employee_no && $scope.showInfo.scan_doc_no) {
                    $scope.scaninfo.modify = true;
                }
            };

            var setShowInfo = function(scanning, parameter) {
                var index = $scope.scanning_detail.findIndex(function(item) {
                    return commonService.isEquality(scanning, item.scan_doc_no);
                });

                if (index != -1) {
                    userInfoService.getVoice($scope.langs.data_duplication_error, function() {
                        $scope.setFocusMe(true);
                    });
                } else {
                    $scope.initShowGood();
                    $scope.getShowInfo();
                    $scope.showInfo.scan_doc_no = scanning;
                    $scope.showInfo.doc_no = parameter.source_no;
                    $scope.showInfo.run_card_no = parameter.run_card_no;
                    $scope.showInfo.seq = parameter.seq;
                    $scope.showInfo.op_no = parameter.op_no;
                    $scope.showInfo.op_name = parameter.op_name;
                    $scope.showInfo.item_no = parameter.item_no;
                    $scope.showInfo.item_feature_no = parameter.item_feature_no;
                    $scope.showInfo.item_name = parameter.item_name;
                    $scope.showInfo.item_spec = parameter.item_spec;
                    $scope.showInfo.lot_no = parameter.lot_no;
                    $scope.showInfo.qty = parameter.doc_qty - (parameter.in_out_qty || 0);
                    $scope.showInfo.ok_qty = parameter.doc_qty - (parameter.in_out_qty || 0);
                    $scope.showInfo.return_qty = 0;
                    $scope.showInfo.surplus_qty = 0;

                    $scope.showInfo.reference_qty = parameter.reference_qty || 0;
                    $scope.showInfo.reference_unit_no = parameter.reference_unit_no || "";

                    if ($scope.showInfo.scan_employee_no && $scope.showInfo.scan_doc_no) {
                        $scope.scaninfo.modify = true;
                    }
                    $scope.showGood.barcode_no = scanning;
                    $scope.scaninfo.modify = true;
                    if ($scope.page_params.program_job_no != '16-3') {
                        $scope.addGoods(angular.copy($scope.showInfo));
                        $scope.getShowInfo();
                    }
                    return;
                }
            };

            //数量弹窗
            $scope.showQtyPop = function(type) {
                $scope.setFocusMe(false);
                $scope.pop = {
                    qty: 0,
                    type: type
                };
                switch (type) {
                    case "ok_qty":
                        $scope.pop.qty = angular.copy(parseFloat($scope.showInfo.ok_qty));
                        break;
                    case "return_qty":
                        $scope.pop.qty = angular.copy(parseFloat($scope.showInfo.return_qty));
                        break;
                    case "surplus_qty":
                        $scope.pop.qty = angular.copy(parseFloat($scope.showInfo.surplus_qty));
                        break;
                    case "reference_qty":
                        $scope.pop.qty = angular.copy(parseFloat($scope.showInfo.reference_qty));
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
                                case "ok_qty":
                                    $scope.showInfo.ok_qty = (computeQty(qty, type)) ? qty : $scope.showInfo.ok_qty;
                                    break;
                                case "return_qty":
                                    $scope.showInfo.return_qty = (computeQty(qty, type)) ? qty : $scope.showInfo.return_qty;
                                    break;
                                case "surplus_qty":
                                    $scope.showInfo.surplus_qty = (computeQty(qty, type)) ? qty : $scope.showInfo.surplus_qty;
                                    break;
                                case "reference_qty":
                                    $scope.showInfo.reference_qty = qty;
                                    break;
                            }
                        }
                    }]
                });
                IonicClosePopupService.register(false, myPopup);
            };

            var computeQty = function(qty, type) {
                var count = 0;
                var ok_qty = parseFloat($scope.showInfo.ok_qty);
                var return_qty = parseFloat($scope.showInfo.return_qty);
                var surplus_qty = parseFloat($scope.showInfo.surplus_qty);
                switch (type) {
                    case "ok_qty":
                        count = qty + return_qty + surplus_qty;
                        before_qty = ok_qty;
                        break;
                    case "return_qty":
                        count = ok_qty + qty + surplus_qty;
                        before_qty = return_qty;
                        break;
                    case "surplus_qty":
                        count = ok_qty + return_qty + qty;
                        before_qty = surplus_qty;
                        break;
                }
                return distributionQty(qty, count, type, before_qty);
            };

            var distributionQty = function(qty, count, type, before_qty) {
                if (Number(qty) > Number($scope.showInfo.qty)) {
                    userInfoService.getVoice($scope.langs.qc_maxqty_error, function() {
                        $scope.setFocusMe(true);
                    });
                    return false;
                }

                //minus
                var max_qty = 0;
                while (Number(before_qty) > Number(qty)) {
                    switch (type) {
                        case "return_qty":
                            $scope.showInfo.ok_qty += 1;
                            break;
                        case "surplus_qty":
                            $scope.showInfo.ok_qty += 1;
                            break;
                    }
                    before_qty -= 1;
                }

                //add
                while (Number(count) > Number($scope.showInfo.qty)) {
                    switch (type) {
                        case "ok_qty":
                            if (Number($scope.showInfo.surplus_qty) > 0) {
                                $scope.showInfo.surplus_qty -= 1;
                                break;
                            }
                            if (Number($scope.showInfo.return_qty) > 0) {
                                $scope.showInfo.return_qty -= 1;
                                break;
                            }
                            break;
                        case "return_qty":
                            if (Number($scope.showInfo.surplus_qty) > 0) {
                                $scope.showInfo.surplus_qty -= 1;
                                break;
                            }
                            if (Number($scope.showInfo.ok_qty) > 0) {
                                $scope.showInfo.ok_qty -= 1;
                                break;
                            }
                            break;
                        case "surplus_qty":
                            if (Number($scope.showInfo.ok_qty) > 0) {
                                $scope.showInfo.ok_qty -= 1;
                                break;
                            }
                            if (Number($scope.showInfo.return_qty) > 0) {
                                $scope.showInfo.return_qty -= 1;
                                break;
                            }
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
                $scope.scaninfo.modify = true;
                $scope.setFocusMe(false);
                var qty = 0;
                switch (type) {
                    case "pop.qty":
                        qty = checkmin($scope.pop.qty, value);
                        $scope.pop.qty = (computeQty(qty, $scope.pop.type)) ? qty : $scope.pop.qty;
                        break;
                    case "ok_qty":
                        qty = checkmin($scope.showInfo.ok_qty, value);
                        $scope.showInfo.ok_qty = (computeQty(qty, type)) ? qty : $scope.showInfo.ok_qty;
                        break;
                    case "return_qty":
                        qty = checkmin($scope.showInfo.return_qty, value);
                        $scope.showInfo.return_qty = (computeQty(qty, type)) ? qty : $scope.showInfo.return_qty;
                        break;
                    case "surplus_qty":
                        qty = checkmin($scope.showInfo.surplus_qty, value);
                        $scope.showInfo.surplus_qty = (computeQty(qty, type)) ? qty : $scope.showInfo.surplus_qty;
                        break;
                    case "reference_qty":
                        qty = checkmin($scope.showInfo.reference_qty, value);
                        $scope.showInfo.reference_qty = qty;
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

            if ($scope.page_params.doc_array.length > 0) {
                if (!commonService.isNull($scope.page_params.doc_array[0].doc_no)) {
                    var analysis_symbol = userInfoService.userInfo.barcode_separator || "%";
                    var scanning = $scope.page_params.doc_array[0].doc_no + analysis_symbol + $scope.page_params.doc_array[0].seq;
                    $scope.page_params.doc_array[0].doc_no = '';
                    $scope.page_params.doc_array[0].seq = '';
                    callQCGetWS(scanning);
                }
            }

        }
    ];
});