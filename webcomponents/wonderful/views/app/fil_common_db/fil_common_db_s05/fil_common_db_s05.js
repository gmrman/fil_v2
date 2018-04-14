define(["API", "APIS", 'AppLang', 'views/app/fil_common_db/requisition.js', 'array', 'Directives', 'ReqTestData', 'ionic-popup',
    'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService'
], function() {
    return ['$scope', '$state', '$stateParams', '$timeout', '$filter', 'AppLang', 'APIService', 'APIBridge',
        '$ionicLoading', '$ionicPopup', '$ionicModal', '$ionicListDelegate', 'IonicPopupService', 'IonicClosePopupService',
        'fil_common_db_requisition', 'ReqTestData', 'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService',
        function($scope, $state, $stateParams, $timeout, $filter, AppLang, APIService, APIBridge,
            $ionicLoading, $ionicPopup, $ionicModal, $ionicListDelegate, IonicPopupService, IonicClosePopupService,
            fil_common_db_requisition, ReqTestData, circulationCardService, commonFactory, commonService, userInfoService, scanTypeService, numericalAnalysisService) {

            //設定list每個item的高度
            var rows = ($scope.views.has_source) ? 2 : 1;
            //是否顯示產品特徵
            rows += (userInfoService.userInfo.feature) ? 1 : 0;
            //入項 有來源單才顯示主要倉庫 儲位
            if ($scope.page_params.in_out_no == '1') {
                rows += ($scope.views.has_source) ? 1 : 0;
            }
            $scope.collection_item_height = rows * 30 - ((rows - 1) * 5);
            console.log($scope.collection_item_height);

            $scope.collection_order_by = ['item_no', 'item_feature_no'];
            if ($scope.page_params.in_out_no == '1' && $scope.views.has_source) {
                $scope.collection_order_by = ['main_warehouse_no', 'main_storage_no', 'item_no', 'item_feature_no'];
            }

            //彙總頁面顏色控管
            $scope.collectionStyle = function(item) {
                if (angular.isUndefined(item)) {
                    return;
                }

                if ((Number(item.already_qty) < Number(item.should_qty)) && Number(item.already_qty) !== 0) {
                    return "list_bgcolor";
                }
                if (Number(item.already_qty) === 0) {
                    return "list_bgcolor_red";
                }
            };

            //將明細資料新增至 bcaf 中
            var bcafCreate = function() {
                console.log($scope.scanning_detail);
                if (commonService.Platform == "Chrome") {
                    return;
                }
                $ionicLoading.show();
                APIBridge.callAPI('bcaf_create', [$scope.scanning_detail, $scope.l_data]).then(function(result) {
                    if (result) {
                        console.log('bcaf_create success');
                        if ($scope.views.has_source) {
                            bcmeGet();
                        } else {
                            bcafGet();
                        }
                    } else {
                        $ionicLoading.hide();
                        userInfoService.getVoice('bcaf_create error', function() {});
                    }
                }, function(error) {
                    $ionicLoading.hide();
                    userInfoService.getVoice('bcaf_create fail', function() {});
                    console.log(error);
                });
            };

            //取得數據匯總(單據)
            var bcmeGet = function() {
                APIBridge.callAPI('bcme_get', [$scope.l_data]).then(function(result) {
                    $ionicLoading.hide();
                    if (result) {
                        $timeout(function() {
                            var submit_show = result.data[0].submit_show;
                            $scope.setDataCollection(result.data[0].list);
                            console.log(result.data[0].list);
                            setSubmitShow(submit_show);
                        }, 0);
                        console.log('bcme_get success');
                    } else {
                        console.log('bcme_get false');
                    }
                }, function(error) {
                    $ionicLoading.hide();
                    userInfoService.getVoice('bcme_get fail', function() {});
                    console.log(error);
                });
            };

            //取得數據匯總(條碼)
            var bcafGet = function() {
                APIBridge.callAPI('bcaf_get', [$scope.l_data]).then(function(result) {
                    $ionicLoading.hide();
                    if (result) {
                        $timeout(function() {
                            var submit_show = result.data[0].submit_show;
                            $scope.setDataCollection(result.data[0].list);
                            setSubmitShow(submit_show);
                        }, 0);
                        console.log('bcaf_get success');
                    } else {
                        console.log('bcaf_get false');
                    }
                }, function(error) {
                    $ionicLoading.hide();
                    userInfoService.getVoice('bcaf_get fail', function() {});
                    console.log(error);
                });
            };

            //檢查是否需要顯示提交按鈕
            var setSubmitShow = function(submit_show) {
                var flag = submit_show;
                // TT:一階調撥(申請)
                if (userInfoService.userInfo.gp_flag) {
                    if ($scope.page_params.program_job_no == "13-5" && submit_show) {
                        flag = checkInquiryQty();
                    }
                }

                // E10:領料核對
                if ($scope.page_params.func == "fil220" && submit_show) {
                    flag = checkInquiryQty();
                }

                //若為過帳作業 檢查是否需要顯示提交按鈕
                if ($scope.page_params.status == "S" && submit_show) {
                    flag = checkInquiryQty();
                    // T100 發料 退料 入庫上架 不檢查
                    if (userInfoService.userInfo.server_product == "T100") {
                        if ($scope.page_params.program_job_no == "7" ||
                            $scope.page_params.program_job_no == "8" ||
                            $scope.page_params.program_job_no == "9-2" ||
                            $scope.page_params.program_job_no == "9-3") {
                            flag = true;
                        }
                    }

                    if (userInfoService.userInfo.server_product == "WF") {
                        flag = true;
                    }
                }
                $timeout(function() {
                    $scope.views.show_submit = flag;
                }, 0);
            };

            var bcmeBcaeBcafDelete = function(doc_no, print_param) {
                var page = "fil_common_db_s01";
                if (($scope.page_params.program_job_no == "3" && $scope.page_params.scan_type == "1") ||
                    ($scope.page_params.program_job_no == "1-2") ||
                    ($scope.page_params.program_job_no == "7-1") ||
                    ($scope.page_params.program_job_no == "9-1")) {
                    page = "fil_common_db_s02.fil_common_db_s07";
                }
                if (($scope.page_params.program_job_no == "1" && $scope.page_params.scan_type == "3") ||
                    ($scope.page_params.program_job_no == "3" && $scope.page_params.scan_type == "3") ||
                    ($scope.page_params.program_job_no == "9") ||
                    ($scope.page_params.program_job_no == "13-1") ||
                    ($scope.page_params.program_job_no == "13-2")) {
                    page = "fil_common_db_s02.fil_common_db_s03";
                }
                if ($scope.page_params.func == "fil524" || $scope.page_params.func == "fil525") {
                    page = "fil_common_db_s02.fil_common_db_s03";
                }

                fil_common_db_requisition.init();
                $scope.initShowGood();
                $ionicLoading.show();
                APIBridge.callAPI('bcme_ae_af_delete', [$scope.l_data]).then(function(result) {
                    $ionicLoading.hide();
                    IonicPopupService.successAlert(doc_no).then(function() {
                        var l_info_id = commonService.getCurrent(2) + "_" + $scope.userInfo.account;
                        $scope.l_data.info_id = angular.copy(l_info_id);
                        if (print_param == 2 || print_param == "2") {
                            jumpToFil_21(doc_no);
                        } else {
                            $state.go(page);
                        }
                    });
                    $scope.clearList();
                }, function(result) {
                    $ionicLoading.hide();
                    userInfoService.getVoice('bcme_ae_af_delete fail', function() {});
                    console.log(result);
                });
            };

            var jumpToFil_21 = function(doc_no) {
                var tempArray = doc_no.split("/");
                console.log(tempArray);
                if (tempArray.length > 0) {
                    var print_doc_array = [];
                    for (var i = 0; i < tempArray.length; i++) {
                        print_doc_array.push({
                            "doc_no": tempArray[i]
                        })
                    }
                }
                commonService.clear_page_print_doc_array();
                commonService.set_page_print_doc_array(print_doc_array);
                $state.go("fil_print_s04");
            };

            //檢查數據匯總數量是否相等
            var checkInquiryQty = function() {
                flag = true;
                for (var i = 0; i < $scope.data_collection.length; i++) {
                    var element = $scope.data_collection[i];
                    if (Number(element.should_qty) > Number(element.already_qty)) {
                        flag = false;
                        break;
                    }
                }
                return flag;
            };

            //檢查多單位數量是否相等
            var checkMultiUnitRefQty = function() {
                flag = true;
                for (var i = 0; i < $scope.data_collection.length; i++) {
                    var element = $scope.data_collection[i];
                    if (Number(element.should_ref_qty) > Number(element.already_ref_qty)) {
                        flag = false;
                        break;
                    }
                }
                return flag;
            };

            //顯示提示框
            var showCheckSendSubmitPop = function() {
                // 顯示提示 "數量不匹，是否提交"
                var checkSendSubmitPop = $ionicPopup.show({
                    title: $scope.langs.point,
                    template: "<p style='text-align: center'>" + $scope.langs.qty_error + "," + $scope.langs.checkSubmit + "</p>",
                    scope: $scope,
                    buttons: [{
                        text: $scope.langs.cancel,
                        onTap: function() {
                            $scope.views.show_submit = true;
                        }
                    }, {
                        text: $scope.langs.confirm,
                        onTap: function() {
                            bcaeBcafUploadCreate();
                        }
                    }]
                });
                IonicClosePopupService.register(false, checkSendSubmitPop);
                return;
            };

            $scope.submit = function() {
                $scope.views.show_submit = false;
                var flag = true;

                //入項 需檢查批號
                if ($scope.page_params.in_out_no == "1") {
                    var error_message = "";
                    for (var i = 0; i < $scope.scanning_detail.length; i++) {
                        var element = $scope.scanning_detail[i];
                        if (element.lot_control_type == "1") {
                            if (commonService.isNull(element.lot_no)) {
                                //料號批號管控為必須要有批號，因未輸入批號，無法提交！
                                error_message = $scope.langs.lot_control_submit_error;
                                flag = false;
                                break;
                            }
                        }
                        //取得倉庫資訊
                        var warehouse_index = userInfoService.warehouseIndex[element.warehouse_no];
                        if (typeof warehouse_index != "undefined" && warehouse_index != -1) {
                            var out_storage_management = userInfoService.warehouse[warehouse_index].storage_management || "N";
                            if (out_storage_management == "Y") {
                                if (commonService.isNull(element.storage_spaces_no)) {
                                    error_message = $scope.langs.storage_management_error2;
                                    flag = false;
                                    break;
                                }
                            }
                        }
                    }
                    if (!flag) {
                        userInfoService.getVoice(error_message, function() {});
                        return;
                    }
                }

                //檢查數量是否相等
                flag = checkInquiryQty();

                //檢查參考單位數量是否相等
                if (flag) {
                    flag = checkMultiUnitRefQty();
                }

                if (!flag) {
                    var checkSendSubmit = true;

                    //依產品判斷是否要跳提示框
                    if (userInfoService.userInfo.server_product == "WF") {
                        checkSendSubmit = false;
                    }

                    //判斷是否顯示訊息詢問使用者是否提交
                    if (checkSendSubmit) {
                        showCheckSendSubmitPop();
                        return;
                    }
                }

                bcaeBcafUploadCreate();
            };

            var bcaeBcafUploadCreate = function() {
                $ionicLoading.show();
                APIBridge.callAPI('bcae_bcaf_upload_create', [$scope.l_data]).then(function(result) {
                    $ionicLoading.hide();
                    if (result) {
                        if (result.data[0].errmsg.trim()) {
                            console.log(result.data[0].errmsg);
                            userInfoService.getVoice(result.data[0].errmsg, function() {
                                $scope.views.show_submit = true;
                            });
                            return;
                        }
                        console.log('bcae_bcaf_upload_create success');
                        var packing_detail = getPackingDetail(result.data);
                        app_bcscanwsupload_create(result.data, packing_detail);
                    } else {
                        console.log('bcae_bcaf_upload_create false');
                    }
                }, function(error) {
                    $ionicLoading.hide();
                    console.log(error);
                    userInfoService.getVoice('bcae_bcaf_upload_create fail', function() {});
                });

            };

            var getPackingDetail = function(scan) {
                var packing_detail = [];

                for (var i = 0; i < scan.length; i++) {
                    for (var j = 0; j < scan[i].scan_detail.length; j++) {
                        var element = scan[i].scan_detail[j];
                        if (element.packing_barcode != "N") {
                            var item = {
                                enterprise_no: scan[i].enterprise_no,
                                site_no: scan[i].site_no,
                                info_id: scan[i].info_id,
                                packing_barcode: element.packing_barcode,
                                main_organization: scan[i].main_organization,
                            };
                            var index = packing_detail.findIndex(function(value) {
                                return commonService.isEquality(value.enterprise_no, item.enterprise_no) &&
                                    commonService.isEquality(value.site_no, item.site_no) &&
                                    commonService.isEquality(value.info_id, item.info_id) &&
                                    commonService.isEquality(value.packing_barcode, item.packing_barcode) &&
                                    commonService.isEquality(value.main_organization, item.main_organization);
                            });
                            if (index == -1) {
                                packing_detail.push(item);
                            }
                        }
                    }
                }

                // E10 產品線無法處裡空陣列
                if (userInfoService.userInfo.server_product == "E10") {
                    if (packing_detail.length <= 0) {
                        packing_detail = [{}];
                    }
                }

                return packing_detail;
            };

            var app_bcscanwsupload_create = function(scan, packing_detail) {
                var webTran = {
                    service: 'app.bcscanwsupload.create',
                    parameter: {
                        "site_no": userInfoService.userInfo.site_no,
                        "employee_no": userInfoService.userInfo.employee_no,
                        "scan_type": $scope.page_params.upload_scan_type,
                        "report_datetime": commonService.getCurrent(1),
                        "recommended_operations": $scope.l_data.bcae014,
                        "recommended_function": $scope.l_data.bcae015,
                        "scan_doc_no": scan[0].scan_doc_no,
                        "picking_employee_no": userInfoService.userInfo.employee_no,
                        "picking_department_no": userInfoService.userInfo.department_no,
                        "doc_type_no": $scope.scaninfo.doc_slip,
                        "reason_no": "",
                        "scan": scan,
                        "packing_detail": packing_detail,
                    }
                };
                console.log(webTran);
                $ionicLoading.show();
                APIService.Web_Post(webTran, function(res) {
                    $ionicLoading.hide();
                    // console.log("success:" + angular.toJson(res));
                    var doc_no = res.payload.std_data.parameter.doc_no;
                    var print_param = res.payload.std_data.parameter.print_param;
                    bcmeBcaeBcafDelete(doc_no, print_param);
                }, function(error) {
                    $ionicLoading.hide();
                    var execution = error.payload.std_data.execution;
                    console.log("error:" + execution.description);
                    userInfoService.getVoice(execution.description, function() {
                        $scope.views.show_submit = true;
                    });
                });
            };

            $scope.docSlipShow = function() {
                $ionicLoading.show();
                $scope.popSelected = {
                    search: "",
                    doc_slip: " ",
                    doc_slip_name: " ",
                };

                $scope.filterBySearch = function(item) {
                    if (!$scope.popSelected.search) {
                        return true;
                    }
                    var search = $scope.popSelected.search.toLowerCase();
                    if ((item.doc_slip.toLowerCase().indexOf(search) == -1) &&
                        (item.doc_slip_name.toLowerCase().indexOf(search) == -1)) {
                        return false;
                    }
                    return true;
                }

                $scope.selDocSlip = function(item) {
                    $scope.popSelected.doc_slip = item.doc_slip;
                    $scope.popSelected.doc_slip_name = item.doc_slip_name;
                };

                $scope.setDocSlip = function() {
                    $scope.scaninfo.doc_slip = $scope.popSelected.doc_slip;
                    $scope.scaninfo.doc_slip_name = $scope.popSelected.doc_slip_name;
                    $scope.closeSelDocSlipModal();
                };

                $ionicModal.fromTemplateUrl('views/app/fil_common_db/fil_common_db_s05/fil_common_db_s05_01.html', {
                    scope: $scope
                }).then(function(modal) {

                    $scope.closeSelDocSlipModal = function() {
                        modal.hide().then(function() {
                            return modal.remove();
                        });
                    };

                    var app_doc_slip_get = function() {
                        var webTran = {
                            service: 'app.doc.slip.get',
                            parameter: {
                                "program_job_no": $scope.page_params.program_job_no,
                                "status": $scope.page_params.status,
                                "site_no": userInfoService.userInfo.site_no,
                            }
                        };
                        APIService.Web_Post(webTran, function(res) {
                            // console.log("success:" + angular.toJson(res));
                            var parameter = res.payload.std_data.parameter;
                            $scope.setSlipDetail(parameter.slip_detail);
                            modal.show();
                            $ionicLoading.hide();
                        }, function(error) {
                            $ionicLoading.hide();
                            var execution = error.payload.std_data.execution;
                            console.log("error:" + execution.description);
                            userInfoService.getVoice(execution.description, function() {});
                        });
                    };

                    if ($scope.slip_detail.length > 0) {
                        modal.show();
                        $ionicLoading.hide();
                    } else {
                        app_doc_slip_get();
                    }

                });
            };

            console.log($scope.scanning_detail);
            if (commonService.Platform == "Chrome") {
                //網頁版假資料
                $scope.setDataCollection([{
                    "already_inv_qty": 10000000,
                    "already_qty": 80,
                    "already_ref_qty": 1570,
                    "already_val_qty": 100000,
                    "inventory_unit": "KKG",
                    "item_feature_name": null,
                    "item_feature_no": " ",
                    "item_name": "品名02013P02",
                    "item_no": "02013P02",
                    "item_spec": "規格02013P02",
                    "multi_unit_type": "3",
                    "reference_unit_no": "set",
                    "should_inv_qty": 8000000,
                    "should_qty": 100,
                    "should_ref_qty": 800,
                    "should_val_qty": 80000,
                    "unit": "PCS",
                    "valuation_unit_no": "kg",
                    "main_warehouse_no": "test_warehouse",
                    "main_storage_no": "test_storage",
                }, {
                    "already_inv_qty": 10000000,
                    "already_qty": 100,
                    "already_ref_qty": 1570,
                    "already_val_qty": 100000,
                    "inventory_unit": "KKG",
                    "item_feature_name": null,
                    "item_feature_no": " ",
                    "item_name": "品名02013P02",
                    "item_no": "02013P02",
                    "item_spec": "規格02013P02",
                    "multi_unit_type": "3",
                    "reference_unit_no": "set",
                    "should_inv_qty": 8000000,
                    "should_qty": 100,
                    "should_ref_qty": 800,
                    "should_val_qty": 80000,
                    "unit": "PCS",
                    "valuation_unit_no": "kg",
                    "main_warehouse_no": "test_warehouse",
                    "main_storage_no": "test_storage",
                }, {
                    "already_inv_qty": 0,
                    "already_qty": 0,
                    "already_ref_qty": 0,
                    "already_val_qty": 0,
                    "inventory_unit": "KKG",
                    "item_feature_name": " ",
                    "item_feature_no": " ",
                    "item_name": "品名02013P03",
                    "item_no": "02013P03",
                    "item_spec": "規格02013P03",
                    "multi_unit_type": "3",
                    "reference_unit_no": "set",
                    "should_inv_qty": 10000000,
                    "should_qty": 100,
                    "should_ref_qty": 1000,
                    "should_val_qty": 100000,
                    "unit": "PCS",
                    "valuation_unit_no": "kg",
                    "main_warehouse_no": "test_warehouse",
                    "main_storage_no": "test_storage",
                }]);
                setSubmitShow(true);
            } else {
                bcafCreate();
            }
        }
    ];
});