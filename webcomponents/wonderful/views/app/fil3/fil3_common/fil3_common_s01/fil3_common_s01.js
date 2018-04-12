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
            var l_info_id = commonService.getCurrent(2) + "_" + $scope.userInfo.account;
            $scope.l_data = {
                bcae005: $scope.page_params.in_out_no, //出入庫瑪
                bcae006: $scope.page_params.func, //作業代號
                bcae014: $scope.page_params.program_job_no,
                bcae015: $scope.page_params.status, //A開立新單/S過賬/Y確認
                info_id: angular.copy(l_info_id),
                bcae002: ""
            };

            $scope.$on('$viewContentLoaded', function() {
                if (commonService.Platform == "Chrome") {
                    setConditionValue();
                    getTodoNotice($scope.condition);
                } else {
                    get_sqlite_bcmc(true);
                }
            });

            //取得未完事項
            var get_sqlite_bcmc = function(isShowUpcoming) {
                var obj = {
                    type_no: "3"
                };
                $ionicLoading.show();
                APIBridge.callAPI('fil3_bcmc_get', [obj, $scope.l_data, {}]).then(function(result) {
                    $ionicLoading.hide();
                    if (result.data.length > 0) {
                        console.log(result.data);
                        $timeout(function() {
                            $scope.upcoming = result.data;
                        }, 0);
                        if (isShowUpcoming) {
                            showUpcoming();
                        }
                    } else {
                        if (!isShowUpcoming) {
                            $scope.closeUpcomingModal();
                        }
                        $scope.upcoming = [];
                        $scope.getQbecondition();
                    }
                }, function(error) {
                    $ionicLoading.hide();
                    userInfoService.getVoice("fil3_bcmc_get fail", function() {});
                    console.log(error);
                });
            };

            //顯示篩選條件Modal
            var showUpcoming = function(upcoming) {
                $ionicLoading.show();
                $ionicModal.fromTemplateUrl('views/app/fil3/fil3_common/fil3_common_s01/fil3_common_s01_02.html', {
                    scope: $scope
                }).then(function(modal) {

                    $scope.closeUpcomingModal = function() {
                        modal.hide().then(function() {
                            return modal.remove();
                        });
                    };

                    $scope.delupcoming = function(index) {
                        $scope.l_data.bcae002 = $scope.upcoming[index].source_no;
                        clearSqlite("");
                    };

                    $scope.editupcoming = function(index) {
                        $scope.closeUpcomingModal();
                        $scope.getInfo({
                            "doc_no": $scope.upcoming[index].source_no,
                            "seq": "",
                        });
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
                    $ionicLoading.hide();
                });
            };

            //取得篩選條件
            $scope.getQbecondition = function() {
                $ionicLoading.show();
                var obj = {
                    type_no: "2"
                };
                APIBridge.callAPI('qbecondition_get', [obj, $scope.l_data]).then(function(result) {
                    $ionicLoading.hide();
                    console.log(result);
                    if (result.data.length === 0) {
                        setConditionValue();
                        // getTodoNotice($scope.condition);
                        $scope.showQbeTodoNotice();
                    } else {
                        setConditionValue(result.data);
                        if (result.data[0].isdefault) {
                            var condition = angular.copy($scope.condition);
                            condition[1].value = $filter('date')($scope.condition[1].value, 'yyyy-MM-dd');
                            getTodoNotice(condition);
                            return;
                        } else {
                            $scope.showQbeTodoNotice();
                        }
                    }
                }, function(result) {
                    console.log("qbecondition_get fail");
                    console.log(result);
                });
            };

            //預設篩選條件
            var setConditionValue = function(condition) {
                $scope.condition = [{
                    "seq": "1", //1.單號
                    "value": "",
                    "isdefault": false
                }, {
                    "seq": "2", //2.日期
                    "value": "",
                    "isdefault": false
                }, {
                    "seq": "3", //3.人員
                    "value": "",
                    "isdefault": false
                }, {
                    "seq": "4", //4.部門
                    "value": "",
                    "isdefault": false
                }, {
                    "seq": "5", //5.供應商
                    "value": "",
                    "isdefault": false
                }, {
                    "seq": "6", //6.客戶
                    "value": "",
                    "isdefault": false
                }, {
                    "seq": "7", //7.料件
                    "value": "",
                    "isdefault": false
                }];

                if (condition) {
                    for (var i = 0; i < condition.length; i++) {
                        var tmep = condition[i];
                        for (var j = 0; j < $scope.condition.length; j++) {
                            var item = $scope.condition[j];
                            if (item.seq == tmep.seq) {
                                item.value = tmep.condition_value;
                                item.isdefault = tmep.isdefault;
                                if (item.seq == "2") {
                                    if (item.value == "1970-01-01T00:00:00.000Z" || (!angular.isDate(new Date(item.value)))) {
                                        item.value = "";
                                    } else {
                                        item.value = new Date(item.value);
                                    }
                                }
                                break;
                            }
                        }
                    }
                }
            };

            $scope.checkConditionValue = function(condition) {
                if (condition.length <= 0) {
                    return condition;
                }

                for (var i = 0; i < condition.length; i++) {
                    var object = condition[i];
                    if (object.seq == "2") {
                        if (!angular.isDate(object.value)) {
                            object.value = "";
                        } else {
                            object.value = $filter('date')(object.value, 'yyyy-MM-dd');
                        }
                    } else {
                        if (commonService.isNull(object.value)) {
                            object.value = "";
                        }
                    }
                }
                return condition;
            };

            //顯示篩選條件Modal
            $scope.showQbeTodoNotice = function() {
                $ionicLoading.show();
                $ionicModal.fromTemplateUrl('views/app/fil3/fil3_common/fil3_common_s01/fil3_common_s01_01.html', {
                    scope: $scope
                }).then(function(modal) {

                    $scope.showQbe = {
                        is_show_department: false,
                        is_show_supplier: false,
                        is_show_customer: false,
                        is_default: false,
                    };
                    for (var i = 0; i < $scope.condition.length; i++) {
                        var element = $scope.condition[i];
                        if (element.isdefault) {
                            $scope.showQbe.is_default = element.isdefault;
                            break;
                        }
                    }
                    console.log($scope.showQbe.is_default);

                    switch ($scope.page_params.program_job_no) {
                        case "1-1":
                        case "2-1":
                        case "3-1":
                            $scope.showQbe.is_show_supplier = true;
                            break;
                        case "5":
                        case "6":
                            $scope.showQbe.is_show_customer = true;
                            break;
                        default:
                            $scope.showQbe.is_show_department = true;
                    }

                    var closeQbeModal = function() {
                        modal.hide().then(function() {
                            return modal.remove();
                        });
                    };

                    $scope.cancelSetCondition = function(type) {
                        if (type) {
                            closeQbeModal();
                            $state.go("fil_00_s04");
                            return;
                        }
                        var condition = angular.copy($scope.condition);
                        setConditionValue();
                        getTodoNotice($scope.condition);
                        $scope.condition = condition;
                        closeQbeModal();
                    };

                    $scope.setCondition = function() {
                        if (commonService.Platform == "Chrome") {
                            var condition_send = $scope.checkConditionValue(angular.copy($scope.condition));
                            condition_send[1].value = $filter('date')(condition_send[1].value, 'yyyy-MM-dd');
                            getTodoNotice(condition_send);
                            closeQbeModal();
                            return;
                        }
                        $ionicLoading.show();
                        for (var i = 0; i < $scope.condition.length; i++) {
                            var element = $scope.condition[i];
                            element.isdefault = $scope.showQbe.is_default;
                        }
                        APIBridge.callAPI('qbecondition_upd', [$scope.l_data, $scope.condition]).then(function(result) {
                            $ionicLoading.hide();
                            var condition_send = $scope.checkConditionValue(angular.copy($scope.condition));
                            condition_send[1].value = $filter('date')(condition_send[1].value, 'yyyy-MM-dd');
                            getTodoNotice(condition_send);
                            saveCondition();
                        }, function(error) {
                            $ionicLoading.hide();
                            userInfoService.getVoice("qbecondition_upd fail:" + error.message, function() {
                                $scope.setFocusMe(true);
                            });
                        });
                    };

                    var saveCondition = function() {
                        $ionicLoading.show();
                        APIBridge.callAPI('qbecondition_get', [{}, $scope.l_data]).then(function(result) {
                            $ionicLoading.hide();
                            console.log(JSON.stringify(result.data));
                            userInfoService.userInfo.qbecondition = result.data;
                            userInfoService.setBasicConfig(userInfoService.userInfo);
                            closeQbeModal();
                        }, function(error) {
                            $ionicLoading.hide();
                            userInfoService.getVoice("qbecondition_get fail:" + error.message, function() {
                                $scope.setFocusMe(true);
                            });
                        });
                    };

                    modal.show();
                    $ionicLoading.hide();
                });
            };

            //呼叫 WS 取得待辦事項
            var getTodoNotice = function(condition) {
                var webTran = {
                    service: 'app.todo.notice.get',
                    parameter: {
                        "program_job_no": $scope.page_params.program_job_no,
                        "status": $scope.page_params.status,
                        "scan_type": "1",
                        "site_no": userInfoService.userInfo.site_no,
                        "info_id": $scope.l_data.info_id,
                        "condition": condition
                    }
                };
                console.log(webTran);
                $ionicLoading.show();
                APIService.Web_Post(webTran, function(res) {
                    $ionicLoading.hide();
                    // console.log("success:" + angular.toJson(res));
                    var parameter = res.payload.std_data.parameter;
                    $timeout(function() {
                        $scope.sales_notice = parameter.sales_notice;
                    }, 0);
                }, function(error) {
                    $ionicLoading.hide();
                    var execution = error.payload.std_data.execution;
                    console.log("error:" + execution.description);
                    userInfoService.getVoice(execution.description, function() {});
                });
            };

            $scope.getInfo = function(data) {
                $scope.doc_array = [{
                    "doc_no": data.doc_no,
                    "seq": data.seq,
                }];
                var webTran = {
                    service: 'app.todo.doc.get',
                    parameter: {
                        "program_job_no": $scope.page_params.program_job_no,
                        "scan_type": $scope.page_params.scan_type,
                        "status": $scope.page_params.status,
                        "analysis_symbol": userInfoService.userInfo.barcode_separator || "%",
                        "info_id": $scope.l_data.info_id,
                        "site_no": userInfoService.userInfo.site_no,
                        "param_master": $scope.doc_array
                    }
                };
                $ionicLoading.show();
                APIService.Web_Post(webTran, function(res) {
                    $ionicLoading.hide();
                    // console.log("success:" + angular.toJson(res));
                    var parameter = res.payload.std_data.parameter;
                    fil_common_requisition.setParameter(parameter);
                    InsertToBcmcBcme(parameter);
                }, function(error) {
                    $ionicLoading.hide();
                    var execution = error.payload.std_data.execution;
                    console.log("error:" + execution.description);
                    userInfoService.getVoice(execution.description, function() {});
                });
            };

            var InsertToBcmcBcme = function(parameter) {
                if (commonService.Platform == "Chrome") {
                    goPage();
                    return;
                }
                $ionicLoading.show();
                APIBridge.callAPI('fil3_bcme_create', [parameter]).then(function(result) {
                    $ionicLoading.hide();
                    if (result) {
                        console.log('fil3_bcme_create success');
                        goPage();
                    } else {
                        userInfoService.getVoice('fil3_bcme_create error', function() {});
                    }
                }, function(error) {
                    $ionicLoading.hide();
                    userInfoService.getVoice('fil3_bcme_create fail', function() {});
                    console.log(error);
                });
            };

            //点击数据跳转
            var goPage = function() {
                commonService.set_page_doc_array(angular.copy($scope.doc_array));
                commonService.set_page_info_id($scope.l_data.info_id);
                $state.go("fil3_common_s02.fil3_common_s03");
            };
        }
    ];
});