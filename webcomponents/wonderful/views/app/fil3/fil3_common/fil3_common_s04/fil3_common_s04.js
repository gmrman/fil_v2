define(["API", "APIS", 'AppLang', 'views/app/fil_common/requisition.js', 'array', 'Directives', 'ReqTestData', 'ionic-popup',
    'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService'
], function() {
    return ['$scope', '$state', '$timeout', '$filter', 'AppLang', 'APIService', 'APIBridge',
        '$ionicLoading', '$ionicPopup', '$ionicModal', '$ionicListDelegate', 'IonicPopupService', 'IonicClosePopupService',
        'fil_common_requisition', 'ReqTestData', 'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService',
        function($scope, $state, $timeout, $filter, AppLang, APIService, APIBridge,
            $ionicLoading, $ionicPopup, $ionicModal, $ionicListDelegate, IonicPopupService, IonicClosePopupService,
            fil_common_requisition, ReqTestData, circulationCardService, commonFactory, commonService, userInfoService, scanTypeService, numericalAnalysisService) {

            var get_sqlite_bcme = function() {
                var obj = {
                    type_no: "1"
                };
                $ionicLoading.show();
                APIBridge.callAPI('fil3_bcme_get', [obj, $scope.l_data, {}]).then(function(result) {
                    $ionicLoading.hide();
                    if (result) {
                        $timeout(function() {
                            $scope.setDataCollection(result.data[0].list);
                            setSubmitShow(result.data[0].submit_show);
                            console.log('fil3_bcme_get success');
                        }, 0);
                    } else {
                        console.log('fil3_bcme_get false');
                    }
                }, function(error) {
                    $ionicLoading.hide();
                    userInfoService.getVoice('fil3_bcme_get fail', function() {});
                    console.log(error);
                });
            };

            var get_sqlite_bcmc = function() {
                var obj = {
                    type_no: "4"
                };
                $ionicLoading.show();
                APIBridge.callAPI('fil3_bcmc_get', [obj, $scope.l_data, {}]).then(function(result) {
                    $ionicLoading.hide();
                    console.log(result.data);
                    if (result) {
                        if (result.data.length > 0) {
                            $scope.submit_show = true;
                        }
                        $timeout(function() {
                            $scope.setDataCollection(result.data);
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

            //檢查數據匯總數量是否相等
            var checkInquiryQty = function() {
                flag = true;
                angular.forEach($scope.data_collection, function(value) {
                    if (Number(value.should_qty) > Number(value.already_qty)) {
                        flag = false;
                    }
                });
                return flag;
            };

            var setSubmitShow = function(submit_show) {
                //若為過帳作業 檢查是否需要顯示提交按鈕
                var flag = submit_show;
                if ($scope.page_params.status == "S" && submit_show) {
                    flag = checkInquiryQty();
                }
                $timeout(function() {
                    $scope.submit_show = flag;
                }, 0);
            };

            $scope.show = {
                is_show_department: false,
                is_show_supplier: false,
                is_show_customer: false,
            };

            switch ($scope.page_params.program_job_no) {
                case "1-1":
                case "2-1":
                case "3-1":
                    $scope.show.is_show_supplier = true;
                    break;
                case "5":
                case "6":
                    $scope.show.is_show_customer = true;
                    break;
                default:
                    $scope.show.is_show_department = true;
            }

            if (commonService.Platform == "Chrome") {
                $scope.submit_show = true;
                var data_collection = [{
                    item_name: "鼎捷軟件計算機管理系統",
                    item_spec: "曜石黑",
                    item_no: "PS001",
                    should_qty: 10,
                    already_qty: 8
                }, {
                    item_name: "鼎捷軟件計算機管理系統",
                    item_spec: "曜石黑",
                    item_no: "PS001",
                    should_qty: 10,
                    already_qty: 15
                }, {
                    item_name: "鼎捷軟件計算機管理系統",
                    item_spec: "曜石黑",
                    item_no: "PS001",
                    should_qty: 10,
                    already_qty: 0
                }];
                $scope.setDataCollection(data_collection);
            } else {
                if ($scope.l_data.hasSource) {
                    get_sqlite_bcme();
                } else {
                    get_sqlite_bcmc();
                }
            }

            $scope.getInfo = function(item) {
                $ionicModal.fromTemplateUrl('views/app/fil3/fil3_common/fil3_common_s04/fil3_common_s04_01.html', {
                    scope: $scope
                }).then(function(modal) {
                    $scope.showItem = item;
                    var get_sqlite_bcmc = function() {
                        var obj = {
                            type_no: "2"
                        };
                        $ionicLoading.show();
                        APIBridge.callAPI('fil3_bcmc_get', [obj, $scope.l_data, item]).then(function(result) {
                            $ionicLoading.hide();
                            if (result) {
                                $timeout(function() {
                                    $scope.barcode_list = result.data;
                                    modal.show();
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

                    if (commonService.Platform == "Chrome") {
                        $scope.barcode_list = [{
                            barcode_no: "AB020130001",
                            item_no: "02013P03",
                            warehouse_no: "A001",
                            picking_qty: 10
                        }, {
                            barcode_no: "AB020130003",
                            item_no: "02013P03",
                            warehouse_no: "A001",
                            picking_qty: 10
                        }, {
                            barcode_no: "AB020130002",
                            item_no: "02013P03",
                            warehouse_no: "A001",
                            picking_qty: 10
                        }];
                        modal.show();
                    } else {
                        get_sqlite_bcmc();
                    }

                    $scope.selEditGoods = function(item) {
                        $scope.setBarcodeInfoObject(item, true);
                        $ionicListDelegate.closeOptionButtons();
                        $scope.closeBcmcModal();
                        $state.go("fil3_common_s02.fil3_common_s03");
                    };

                    $scope.closeBcmcModal = function() {
                        if ($scope.l_data.hasSource) {
                            get_sqlite_bcme();
                        } else {
                            get_sqlite_bcmc();
                        }
                        modal.hide().then(function() {
                            return modal.remove();
                        });
                    };

                    $scope.delBarcode = function() {
                        var temp = [];
                        angular.forEach($scope.barcode_list, function(item) {
                            if (item.checked) {
                                temp.push(item);
                            }
                        });
                        temp = JSON.parse(angular.toJson(temp));
                        del_sqlite_bcmc(temp);
                    };

                    var del_sqlite_bcmc = function(temp) {
                        $ionicLoading.show();
                        APIBridge.callAPI('fil3_bcmc_del', [$scope.l_data, temp]).then(function(result) {
                            $ionicLoading.hide();
                            get_sqlite_bcmc();
                            if ($scope.page_params.program_job_no != "11" && $scope.page_params.program_job_no != "13-1" && $scope.page_params.program_job_no != "13-5") {
                                $scope.getInstructions();
                            }
                        }, function(error) {
                            $ionicLoading.hide();
                            userInfoService.getVoice('fil3_bcmc_get fail', function() {});
                            console.log(error);
                        });
                    };

                });
            };

            $scope.submit = function() {
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
                APIBridge.callAPI('fil3_bcae_bcaf_upload_create', [$scope.l_data]).then(function(result) {
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
                            console.log('fil3_bcae_bcaf_upload_create success');
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
                                userInfoService.getVoice(execution.description, function() {});
                            });
                        }
                    } else {
                        console.log('fil3_bcae_bcaf_upload_create false');
                    }
                }, function(error) {
                    $ionicLoading.hide();
                    console.log(error);
                    userInfoService.getVoice('fil3_bcae_bcaf_upload_create fail', function() {});
                });
            };

            var clearSqlite = function(doc_no) {
                var page = "fil3_common_s01";
                if ($scope.page_params.program_job_no == "9" || $scope.page_params.program_job_no == "11" || $scope.page_params.program_job_no == "12" || $scope.page_params.program_job_no == "13-1") {
                    page = "fil3_common_s02.fil3_common_s03";
                }
                $ionicLoading.show();
                APIBridge.callAPI('fil3_bcmc_me_ae_af_delete', [$scope.l_data]).then(function(result) {
                    $ionicLoading.hide();
                    fil_common_requisition.init();
                    IonicPopupService.successAlert(doc_no).then(function() {
                        $state.go(page);
                    });
                }, function(result) {
                    $ionicLoading.hide();
                    userInfoService.getVoice('fil3_bcmc_me_ae_af_delete fail', function() {});
                    console.log(result);
                });
            };

        }
    ];
});
