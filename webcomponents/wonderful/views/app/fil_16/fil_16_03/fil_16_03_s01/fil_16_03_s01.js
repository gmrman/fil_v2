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
                info_id: angular.copy(l_info_id)
            };

            $scope.sales_notice = [];
            $scope.filtered_sales_notice = [];

            $scope.scaninfo = {
                scanning: "",
                focus_me: true
            };

            $scope.startdate_array = [{
                key: 1,
                value: $scope.langs.last_week
            }, {
                key: 2,
                value: $scope.langs.last_month
            }, {
                key: 3,
                value: $scope.langs.three_months_ago
            }, {
                key: 4,
                value: $scope.langs.last_year
            }, {
                key: 5,
                value: $scope.langs.other
            }];

            var setConditionValue = function(condition) {
                $scope.condition = [{
                    "seq": "1", //1.單號
                    "value": "",
                    "isdefault": false,
                    "set_type": 0
                }, {
                    "seq": "2", //2.日期
                    "value": "",
                    "isdefault": false,
                    "set_type": 0
                }, {
                    "seq": "3", //3.人員
                    "value": "",
                    "isdefault": false,
                    "set_type": 0
                }, {
                    "seq": "4", //4.部門
                    "value": "",
                    "isdefault": false,
                    "set_type": 0
                }, {
                    "seq": "5", //5.供應商
                    "value": "",
                    "isdefault": false,
                    "set_type": 0
                }, {
                    "seq": "6", //6.客戶
                    "value": "",
                    "isdefault": false,
                    "set_type": 0
                }, {
                    "seq": "7", //7.料件
                    "value": "",
                    "isdefault": false,
                    "set_type": 0
                }, {
                    "seq": "8", //8.來源單號
                    "value": "",
                    "isdefault": false,
                    "set_type": 0
                }];

                if (condition) {
                    for (var i = 0; i < condition.length; i++) {
                        var tmep = condition[i];
                        for (var j = 0; j < $scope.condition.length; j++) {
                            var item = $scope.condition[j];
                            if (item.seq == tmep.seq) {
                                item.value = tmep.value;
                                item.isdefault = tmep.isdefault;
                                item.set_type = tmep.set_type;
                                if (item.seq == "2") {
                                    if (item.set_type == 0 || commonService.isNull(item.set_type)) {
                                        item.set_type = $scope.userInfo.condition_start_date_type;
                                        item.value = $scope.userInfo.condition_start_date;
                                    }
                                    if (item.set_type == 5) {
                                        if (item.value == "1970-01-01T00:00:00.000Z" || (!angular.isDate(new Date(item.value)))) {
                                            item.value = "";
                                        } else {
                                            item.value = new Date(item.value);
                                        }
                                    } else {
                                        item.value = "";
                                    }
                                }
                                break;
                            }
                        }
                    }
                } else {
                    for (var j = 0; j < $scope.condition.length; j++) {
                        var item = $scope.condition[j];
                        if (item.seq == "2") {
                            if (item.set_type == 0 || commonService.isNull(item.set_type)) {
                                item.set_type = $scope.userInfo.condition_start_date_type;
                                item.value = $scope.userInfo.condition_start_date;
                            }
                            if (item.set_type == 5) {
                                if (item.value == "1970-01-01T00:00:00.000Z" || (!angular.isDate(new Date(item.value)))) {
                                    item.value = "";
                                } else {
                                    item.value = new Date(item.value);
                                }
                            } else {
                                item.value = "";
                            }
                        }
                    }
                }
            };

            $scope.clearSetType = function(obj) {
                obj.set_type = 0;
                obj.value = "";
            };

            var setConditionDate = function(obj) {
                var date = obj.value;
                if (obj.set_type === 0) {
                    return "";
                }
                if (obj.set_type !== 5) {
                    //取得現在年月日
                    var currentTime = new Date(); //得到當前的時間
                    var currentYear = currentTime.getFullYear(); //得到當前的年份 
                    var currentMoon = currentTime.getMonth() + 1; //得到當前的月份（系統默認為0-11，所以要加1才算是當前的月份）  
                    var currentDay = currentTime.getDate(); //得到當前的天數

                    //獲取當前時間的一個月內的年月日
                    var agoDay = currentDay;
                    var agoMoon = currentMoon;
                    var agoYear = currentYear;
                    var max = "";
                    switch (obj.set_type) {
                        case 1:
                            agoDay = currentDay - 7;
                            if (agoDay < 0) {
                                agoMoon = currentMoon - 1; //月份減1
                                max = new Date(agoYear, agoMoon, 0).getDate(); //獲取上個月的總天數
                                agoDay = max + agoDay; //天數在上個月的總天數的基礎上減去負數
                            }
                            break;
                        case 2:
                            agoMoon = currentMoon - 1;
                            max = new Date(agoYear, agoMoon, 0).getDate(); //獲取上個月的總天數   
                            break;
                        case 3:
                            agoMoon = currentMoon - 3;
                            max = new Date(agoYear, agoMoon, 0).getDate(); //獲取上個月的總天數   
                            break;
                        case 4:
                            agoYear = currentYear - 1;
                            break;
                    }

                    //3.0對處理的年月日作邏輯判斷
                    if (max !== "") {
                        //如果beginDay > max（如果是當前時間的天數+1後的數值超過了上個月的總天數： 天數變為1，月份增加1）
                        if (agoDay > max) {
                            agoDay = 1;
                            agoMoon += 1;
                        }
                        //如果月份當月為1月的時候， 那麼一個月內： 年：-1 月：12 日：依然不變  
                        if (agoMoon === 0) {
                            agoMoon = 12;
                            agoYear = currentYear - 1;
                        }
                    }

                    date = new Date(agoYear, agoMoon - 1, agoDay);
                }
                console.log($filter('date')(date, 'yyyy-MM-dd'));
                return $filter('date')(date, 'yyyy-MM-dd');
            };

            $scope.showQbeTodoNotice = function() {
                $ionicLoading.show();
                $ionicModal.fromTemplateUrl('views/app/fil_16/fil_16_02/fil_16_02_s04/fil_16_02_s04_01.html', {
                    scope: $scope
                }).then(function(modal) {
                    $scope.showQbe = {
                        is_show_department: false,
                        is_show_supplier: false,
                        is_show_customer: false,
                        is_default: false,
                    };
                    for (var i = 0; i < $scope.condition.length; i++) {
                        var element = $scope.condition[index];
                        if (element.isdefault) {
                            $scope.showQbe.is_default = element.isdefault;
                            break;
                        }
                    }
                    console.log($scope.showQbe.is_default);

                    switch ($scope.page_params.program_job_no) {
                        case "16-3":
                            $scope.showQbe.is_show_supplier = true;
                            break;
                        default:
                            $scope.showQbe.is_show_department = true;
                    }

                    $scope.close = function() {
                        var condition = angular.copy($scope.condition);
                        setConditionValue();
                        var condition2 = angular.copy($scope.condition);
                        condition2[1].value = setConditionDate(condition2[1]);
                        $scope.getTodoNotice(condition2);
                        $scope.condition = condition;
                        closeModal();
                    };

                    var closeModal = function() {
                        modal.hide().then(function() {
                            return modal.remove();
                        });
                    };

                    $scope.setCondition = function() {
                        if (commonService.Platform == "Chrome") {
                            //轉換日期格式
                            var condition = angular.copy($scope.condition);
                            condition[1].value = setConditionDate(condition[1]);
                            $scope.getTodoNotice(condition);
                            closeModal();
                            return;
                        }
                        $ionicLoading.show();
                        for (var i = 0; index < $scope.condition.length; i++) {
                            var element = $scope.condition[i];
                            element.isdefault = $scope.showQbe.is_default;
                        }
                        APIBridge.callAPI('qbecondition_upd', [$scope.l_data, $scope.condition]).then(function(result) {
                            $ionicLoading.hide();
                            //轉換日期格式
                            var condition = angular.copy($scope.condition);
                            condition[1].value = setConditionDate(condition[1]);
                            $scope.getTodoNotice(condition);
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
                            closeModal();
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

            $scope.getTodoNotice = function(condition) {
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
                        $scope.filtered_sales_notice = angular.copy($scope.sales_notice);
                    }, 0);
                }, function(error) {
                    $ionicLoading.hide();
                    var execution = error.payload.std_data.execution;
                    console.log("error:" + execution.description);
                    userInfoService.getVoice(execution.description, function() {});
                });
            };

            var getQbecondition = function() {
                var obj = {
                    type_no: "2"
                };
                APIBridge.callAPI('qbecondition_get', [obj, $scope.l_data]).then(function(result) {
                    $ionicLoading.hide();
                    console.log(result);
                    if (result.data.length === 0) {
                        setConditionValue();
                        var condition = angular.copy($scope.condition);
                        condition[1].value = setConditionDate(condition[1]);
                        $scope.getTodoNotice(condition);
                    } else {
                        setConditionValue(result.data);
                        if (result.data[0].isdefault) {
                            var condition = angular.copy($scope.condition);
                            condition[1].value = setConditionDate(condition[1]);
                            $scope.getTodoNotice(condition);
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

            $scope.scan = function() {
                $scope.scaninfo.scanning = "";
                $scope.setFocusMe(false);
                console.log("scanBarcode");
                APIBridge.callAPI('scanBarcode', [{}]).then(function(result) {
                    if (result) {
                        console.log('scanBarcode success');
                        $scope.setFocusMe(true);
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

                setCirculationCard(scanning);
            };

            var setCirculationCard = function(scanning) {
                var obj = {};
                var barcode_separator = userInfoService.userInfo.barcode_separator || "%";
                var index_1 = scanning.indexOf(barcode_separator);
                $scope.setFocusMe(true);
                var seq = "";
                if (index_1 != -1) {
                    obj = circulationCardService.checkCirculationCard(scanning, barcode_separator);
                    scanning = obj.doc_no; //單號
                    seq = obj.run_card_no; //項次
                }
                var temp = [];
                if (seq) {
                    temp = $filter('filter')(angular.copy($scope.sales_notice), {
                        doc_no: scanning,
                        seq: seq
                    });
                } else {
                    temp = $filter('filter')(angular.copy($scope.sales_notice), scanning);
                }

                //如果篩選後長度為0 CALL WS app.doc.status.get
                if (temp.length === 0) {
                    $scope.filtered_sales_notice = angular.copy($scope.sales_notice);
                    check_doc_status(scanning, seq);
                } else {
                    $scope.filtered_sales_notice = temp;
                }
            };

            var check_doc_status = function(doc_no, seq) {
                if (userInfoService.userInfo.server_product == "易飞" ||
                    userInfoService.userInfo.server_product == "E10" ||
                    userInfoService.userInfo.server_product == "WF") {
                    return;
                }
                var webTran = {
                    service: 'app.doc.status.get',
                    parameter: {
                        "program_job_no": $scope.page_params.program_job_no,
                        "status": $scope.page_params.status,
                        "analysis_symbol": userInfoService.userInfo.barcode_separator || "%",
                        "site_no": userInfoService.userInfo.site_no,
                        "doc_no": doc_no,
                        "seq": seq
                    }
                };
                $ionicLoading.show();
                APIService.Web_Post(webTran, function(res) {
                    $ionicLoading.hide();
                    // console.log("success:" + angular.toJson(res));
                    console.log(res);
                    var parameter = res.payload.std_data.parameter;
                }, function(error) {
                    $ionicLoading.hide();
                    var execution = error.payload.std_data.execution;
                    console.log("error:" + execution.description);
                    userInfoService.getVoice(execution.description, function() {
                        $scope.setFocusMe(true);
                    });
                });
            };

            $scope.clearScanning = function() {
                $scope.scaninfo.doc_no = "";
                $scope.scaninfo.run_card_no = "";
                $scope.scaninfo.seq = "";
                $scope.scaninfo.scanning = "";
            };

            $scope.getInfo = function(data) {
                var temp = [];
                $scope.setFocusMe(false);
                if (data.length) {
                    angular.forEach(data, function(item) {
                        if (item.checked) {
                            temp.push({
                                "doc_no": item.doc_no,
                                "seq": item.seq,
                                "doc_line_seq": item.doc_line_seq,
                            });
                        }
                    });
                } else {
                    temp = [{
                        "doc_no": data.doc_no,
                        "seq": data.seq,
                        "doc_line_seq": data.doc_line_seq,
                    }];
                }
                commonService.set_page_doc_array(temp);
                $state.go("fil_16_03_s02");
            };

            if (!commonService.isNull(fil_common_requisition.scanning)) {
                var scanning = angular.copy(fil_common_requisition.scanning);
                fil_common_requisition.scanning = "";
                $scope.getInfo({
                    "doc_no": scanning,
                    "seq": "",
                    "doc_line_seq": "",
                });
            } else {
                if (commonService.Platform == "Chrome") {
                    setConditionValue();
                    var condition = angular.copy($scope.condition);
                    condition[1].value = setConditionDate(condition[1]);
                    $scope.getTodoNotice(condition);
                } else {
                    getQbecondition();
                }
            }

            //排序
            $scope.order = "create_date";
            var order_before;
            $scope.change = function(order) {
                if (order_before == order) {
                    order = "-" + order;
                }
                order_before = order;
                $scope.order = order;
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