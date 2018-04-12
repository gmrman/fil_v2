define(["API", "APIS", 'AppLang', 'views/app/fil_common/requisition.js', 'array', 'Directives', 'ReqTestData', 'ionic-popup',
    'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService'
], function() {
    return ['$scope', '$state', '$timeout', '$filter', 'AppLang', 'APIService', 'APIBridge',
        '$ionicLoading', '$ionicPopup', '$ionicModal', '$ionicListDelegate', 'IonicPopupService', 'IonicClosePopupService',
        'fil_common_requisition', 'ReqTestData', 'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService',
        function($scope, $state, $timeout, $filter, AppLang, APIService, APIBridge,
            $ionicLoading, $ionicPopup, $ionicModal, $ionicListDelegate, IonicPopupService, IonicClosePopupService,
            fil_common_requisition, ReqTestData, circulationCardService, commonFactory, commonService, userInfoService, scanTypeService, numericalAnalysisService) {

            $scope.page_params = commonService.get_page_params();
            $scope.userInfo = userInfoService.getUserInfo();
            $scope.showSanButton = true;
            $scope.getChildScan = function() {
                $scope.$broadcast('scan');
            };
            $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options) {
                var page = toState.url;
                $scope.showSanButton = true;
                if (page == "/fil3_common_s04") {
                    $scope.showSanButton = false;
                }
            });

            $scope.langs = AppLang.langs;
            $scope.isEditBarcode = false;
            $scope.barcode_info = {};
            $scope.doc_info = {};
            $scope.data_collection = [];
            $scope.inventory_detail = [];

            var l_info_id = commonService.getCurrent(2) + "_" + $scope.userInfo.account;
            var l_bcae002 = $scope.page_params.doc_array[0].doc_no;
            if (commonService.isNull(l_bcae002)) {
                l_bcae002 = l_info_id;
            }

            $scope.l_data = {
                bcae005: $scope.page_params.in_out_no, //出入庫瑪
                bcae006: $scope.page_params.func, //作業代號
                bcae014: $scope.page_params.program_job_no,
                bcae015: $scope.page_params.status, //A開立新單/S過賬/Y確認
                bcae002: l_bcae002,
                info_id: $scope.page_params.info_id || angular.copy(l_info_id),
                hasSource: (commonService.isNull($scope.page_params.doc_array[0].doc_no)) ? false : true
            };

            //取得預設倉庫 設定頁面 或 第一筆資料
            var out_warehouse = userInfoService.userInfo.warehouse_no || userInfoService.warehouse[0].warehouse_no;

            //取得倉庫資訊
            var index = userInfoService.warehouseIndex[out_warehouse] || 0;
            $scope.sel_in_storage = userInfoService.warehouse[index].storage_spaces;
            $scope.ingoing_sel_in_storage = userInfoService.warehouse[index].storage_spaces;

            $scope.scaninfo = {
                scanning: "",
                search: "",
                focus_me: true,
                warehouse_no: out_warehouse,
                warehouse_name: userInfoService.warehouse[index].warehouse_name,
                warehouse_cost: userInfoService.warehouse[index].warehouse_cost || "N",
                storage_management: userInfoService.warehouse[index].storage_management || "N",
                storage_spaces_no: " ",
                storage_spaces_name: " ",
                ingoing_warehouse_no: out_warehouse,
                ingoing_warehouse_name: userInfoService.warehouse[index].warehouse_name,
                ingoing_warehouse_cost: userInfoService.warehouse[index].warehouse_cost || "N",
                ingoing_storage_management: userInfoService.warehouse[index].storage_management || "N",
                ingoing_storage_spaces_no: " ",
                ingoing_storage_spaces_name: " ",
                lot_no: " ",
                reason_code: " ",
                reason_code_name: " ",
                qty: 0,
                maxqty: 0
            };

            $scope.getInstructions = function() {
                var webTran = {
                    service: 'app.instructions.get',
                    parameter: {
                        "program_job_no": $scope.page_params.program_job_no,
                        "status": $scope.page_params.status,
                        "site_no": userInfoService.userInfo.site_no,
                        "warehouse_no": $scope.scaninfo.warehouse_no,
                        "param_master": $scope.page_params.doc_array
                    }
                };
                console.log(webTran);
                $ionicLoading.show();
                APIService.Web_Post(webTran, function(res) {
                    $ionicLoading.hide();
                    // console.log("success:" + angular.toJson(res));
                    var parameter = res.payload.std_data.parameter;
                    $scope.checkInventoryDetail(parameter.inventory_detail);
                }, function(error) {
                    $ionicLoading.hide();
                    var execution = error.payload.std_data.execution;
                    console.log("error:" + execution.description);
                    userInfoService.getVoice(execution.description, function() {});
                });
            };

            $scope.setInventoryDetail = function(array) {
                $scope.inventory_detail = array;
            };

            $scope.deleteInventoryDetail = function(index) {
                $scope.inventory_detail.splice(index, 1);
            };

            $scope.checkInventoryDetail = function(array) {
                var obj = {
                    type_no: "4"
                };
                $ionicLoading.show();
                APIBridge.callAPI('fil3_bcmc_get', [obj, $scope.l_data, {}]).then(function(result) {
                    $ionicLoading.hide();
                    if (result) {
                        $timeout(function() {
                            var index = 0;
                            var tempArray = [];
                            for (var i = 0; i < array.length; i++) {
                                var item = array[i];
                                index = result.data.findIndex(function(temp) {
                                    return commonService.isEquality(temp.barcode_no, item.barcode_no) &&
                                        commonService.isEquality(temp.warehouse_no, item.warehouse_no) &&
                                        commonService.isEquality(temp.storage_spaces_no, item.storage_spaces_no) &&
                                        commonService.isEquality(temp.lot_no, item.lot_no);
                                });
                                if (index == -1) {
                                    tempArray.push(item);
                                }
                            }
                            $scope.setInventoryDetail(tempArray);
                            console.log('fil3_bcmc_get success');
                        }, 0);
                    } else {
                        console.log('fil3_bcmc_get false');
                    }
                }, function(error) {
                    $ionicLoading.hide();
                    userInfoService.getVoice('fil3_bcmc_get fail', function() {});
                    console.log(error);
                });
            };

            $scope.setDataCollection = function(data_collection) {
                $scope.data_collection = data_collection;
            };

            $scope.clearDataCollection = function() {
                $scope.data_collection = [];
            };

            $scope.data_collection_heigth = "145px";
            if (userInfoService.userInfo.feature) {
                $scope.data_collection_heigth = "175px";
            }

            $scope.clearReason = function() {
                $scope.scaninfo.reason_code_name = " ";
                $scope.scaninfo.reason_code = " ";
            };

            $scope.clearScanning = function() {
                $scope.scaninfo.scanning = "";
                $scope.scaninfo.qty = 0;
                $scope.scaninfo.maxqty = 0;
            };

            $scope.setBarcodeInfoObject = function(barcode_info, flag) {
                $scope.barcode_info = barcode_info;
                $scope.isEditBarcode = flag;
            };

            $scope.clearBarcodeInfoObject = function() {
                $scope.barcode_info = {};
                $scope.isEditBarcode = false;
            };

            $scope.setDocInfoObject = function(doc_info, flag) {
                $scope.doc_info = {
                    item_name: doc_info.item_name,
                    item_no: doc_info.item_no,
                    item_spec: doc_info.item_spec,
                    item_feature_name: doc_info.item_feature_name,
                    item_feature_no: doc_info.item_feature_no,
                    unit_no: doc_info.unit_no,
                    showDocQty: flag,
                    already_qty: doc_info.already_qty,
                    should_qty: doc_info.should_qty,
                    allow_qty: doc_info.allow_qty,
                };
            };

            $scope.clearDocInfoObject = function() {
                $scope.doc_info = {};
            };

            $scope.goTodolistNotice = function() {

                switch ($scope.page_params.program_job_no) {
                    case "9":
                    case "11":
                    case "12":
                    case "13-1":
                        page = "fil_00_s04";
                        break;
                    default:
                        page = "fil3_common_s01";
                        break;
                }
                fil_common_requisition.init();
                $state.go(page);
                return;
            };

            //取得未完事項
            var get_sqlite_bcmc = function(isShowUpcoming) {
                var obj = {
                    type_no: "3"
                };
                $ionicLoading.show();
                APIBridge.callAPI('fil3_bcmc_get', [obj, $scope.l_data, {}]).then(function(result) {
                    $ionicLoading.hide();
                    if (result.data.length > 0) {
                        angular.forEach(result.data, function(value) {
                            if (!commonService.isNull(value.last_transaction_date)) {
                                value.last_transaction_date = new Date(value.last_transaction_date);
                            }
                        });
                        $scope.upcoming = result.data;
                        if (isShowUpcoming) {
                            showUpcoming();
                        }
                    } else {
                        $scope.upcoming = [];
                    }
                }, function(error) {
                    $ionicLoading.hide();
                    userInfoService.getVoice('fil3_bcmc_get fail', function() {});
                    console.log(error);
                });
            };

            //顯示篩選條件Modal
            var showUpcoming = function(upcoming) {
                $ionicModal.fromTemplateUrl('views/app/fil3/fil3_common/fil3_common_s01/fil3_common_s01_02.html', {
                    scope: $scope
                }).then(function(modal) {

                    $scope.closeUpcomingModal = function() {
                        modal.hide().then(function() {
                            return modal.remove();
                        });
                    };

                    $scope.submit = function(item) {
                        $scope.l_data.bcae002 = item.source_no;
                        $ionicLoading.show();
                        APIBridge.callAPI('fil3_bcaf_create', [$scope.l_data]).then(function(result) {
                            $ionicLoading.hide();
                            send_submit();
                        }, function(error) {
                            $ionicLoading.hide();
                            userInfoService.getVoice('fil3_bcmc_get fail', function() {});
                            console.log(error);
                        });
                    };

                    var send_submit = function() {

                        if (commonService.Platform == "Chrome") {
                            clearSqlite("CTC-LB4-1209000010");
                            return;
                        }

                        $ionicLoading.show();
                        APIBridge.callAPI('bcae_bcaf_upload_create', [$scope.l_data]).then(function(result) {
                            $ionicLoading.hide();
                            if (result) {
                                if (result.data[0].errmsg.trim()) {
                                    console.log(result.data[0].errmsg);
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
                                    console.log('bcae_bcaf_upload_create success');
                                    console.log(webTran);
                                    $ionicLoading.show();
                                    APIService.Web_Post(webTran, function(res) {
                                        $ionicLoading.hide();
                                        // console.log("success:" + angular.toJson(res));
                                        clearSqlite(res.payload.std_data.parameter.doc_no);
                                    }, function(error) {
                                        $ionicLoading.hide();
                                        var execution = error.payload.std_data.execution;
                                        console.log("error:" + execution.description);
                                        userInfoService.getVoice(execution.description, function() {
                                            $scope.submit_show = true;
                                        });
                                    });
                                }
                            } else {
                                console.log('bcae_bcaf_upload_create false');
                            }
                        }, function(error) {
                            $ionicLoading.hide();
                            console.log(error);
                            userInfoService.getVoice('bcae_bcaf_upload_create fail', function() {});
                        });
                    };

                    $scope.delupcoming = function(index) {
                        $ionicListDelegate.closeOptionButtons();
                        $scope.l_data.bcae002 = $scope.upcoming[index].source_no;
                        clearSqlite("");
                    };

                    $scope.editupcoming = function(index) {
                        $scope.closeUpcomingModal();
                        $scope.l_data.bcae002 = angular.copy($scope.upcoming[index].source_no);
                    };

                    var clearSqlite = function(doc_no) {
                        $ionicLoading.show();
                        APIBridge.callAPI('fil3_bcmc_me_ae_af_delete', [$scope.l_data]).then(function(result) {
                            $ionicLoading.hide();
                            if (!commonService.isNull(doc_no)) {
                                IonicPopupService.successAlert(doc_no);
                            }
                            get_sqlite_bcmc(false);
                        }, function(result) {
                            $ionicLoading.hide();
                            userInfoService.getVoice('fil3_bcmc_me_ae_af_delete fail', function() {});
                            console.log(result);
                        });
                    };
                    modal.show();
                });
            };

            if ($scope.page_params.program_job_no == "9" || $scope.page_params.program_job_no == "11" ||
                $scope.page_params.program_job_no == "12" || $scope.page_params.program_job_no == "13-1") {
                get_sqlite_bcmc(true);
            }
        }
    ];
});
