define(["API", "APIS", 'AppLang', 'views/app/fil_common/requisition.js', 'array', 'Directives', 'ReqTestData', 'ionic-popup',
    'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService'
], function() {
    return ['$scope', '$state', '$timeout', '$filter', 'AppLang', 'APIService', 'APIBridge',
        '$ionicLoading', '$ionicPopup', '$ionicModal', '$ionicListDelegate', 'IonicPopupService', 'IonicClosePopupService',
        'fil_common_requisition', 'ReqTestData', 'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService',
        function($scope, $state, $timeout, $filter, AppLang, APIService, APIBridge,
            $ionicLoading, $ionicPopup, $ionicModal, $ionicListDelegate, IonicPopupService, IonicClosePopupService,
            fil_common_requisition, ReqTestData, circulationCardService, commonFactory, commonService, userInfoService, scanTypeService, numericalAnalysisService) {

            //變數初始化區塊 (S)-------------------------------------------------

            //取得多語言資訊
            $scope.langs = AppLang.langs;
            //取得作業參數
            $scope.page_params = commonService.get_page_params();
            //取得使用者資訊
            $scope.userInfo = userInfoService.getUserInfo();

            //設定list每個item的高度
            var rows = 2;
            //是否為發料(新單)作業
            if ($scope.page_params.func == "fil202") {
                rows += (($scope.userInfo.isDisplay_no || (!($scope.userInfo.isDisplay_no) && !($scope.userInfo.isDisplay_name) && !($scope.userInfo.isDisplay_spec)))) ? 1 : 0;
                //是否顯示 品名
                rows += ($scope.userInfo.isDisplay_name) ? 1 : 0;
                //是否顯示 規格
                rows += ($scope.userInfo.isDisplay_spec) ? 1 : 0;
            }
            $scope.collection_item_height = rows * 30 - ((rows - 1) * 5);
            console.log($scope.collection_item_height);

            //取得資訊ID yyyyMMddHHmmsssss_account 
            var l_info_id = commonService.getCurrent(2) + "_" + $scope.userInfo.account;

            //設定參數
            $scope.l_data = {
                bcae005: $scope.page_params.in_out_no, //出入庫瑪
                bcae006: $scope.page_params.func, //作業代號
                bcae014: $scope.page_params.program_job_no,
                bcae015: $scope.page_params.status, //A開立新單/S過賬/Y確認
                info_id: angular.copy(l_info_id)
            };

            //設定各作業APP所顯示的標題
            userInfoService.changeTitle($scope.page_params.name + $scope.langs.upcoming);

            $scope.sales_notice = [];
            $scope.filtered_sales_notice = [];
            $scope.upcoming = [];

            //取得預設倉庫 設定頁面 或 第一筆資料
            var out_warehouse = userInfoService.userInfo.warehouse_no || userInfoService.warehouse[0].warehouse_no;

            //取得倉庫資訊
            var index = userInfoService.warehouseIndex[out_warehouse];
            out_storage_management = userInfoService.warehouse[index].storage_management || "N";
            $scope.sel_in_storage = userInfoService.warehouse[index].storage_spaces;

            $scope.scaninfo = {
                scanning: "",
                focus_me: true,
                warehouse_no: out_warehouse,
                warehouse_name: userInfoService.warehouse[index].warehouse_name,
                storage_management: out_storage_management,
                storage_spaces_no: (out_storage_management == "Y") ? $scope.sel_in_storage[0].storage_spaces_no : " ",
                storage_spaces_name: (out_storage_management == "Y") ? $scope.sel_in_storage[0].storage_spaces_name : " ",
                lot_no: "",
            };

            var initConditionValue = function() {
                var condition = [{
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
                    "set_type": 0,
                }];

                for (var j = 0; j < condition.length; j++) {
                    var item = condition[j];
                    if (item.seq == "2") {
                        //如果未設定起始日期 抓取設定頁面 篩選條件起始日期的值
                        if (item.set_type === 0 || Number(item.set_type) === 0 || commonService.isNull(item.set_type)) {
                            item.set_type = $scope.userInfo.condition_start_date_type;
                            item.value = $scope.userInfo.condition_start_date;
                        }

                        //如果 篩選條件起始日期類型為 其他 時 轉換為網頁用日期格式 若無法轉換或為日期起始值則設為空值
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
                return condition;
            };
            $scope.condition = initConditionValue();


            //變數初始化區塊 (E)-------------------------------------------------

            //變數相關 function 區塊 (S)-----------------------------------------

            //清除掃描框條件
            $scope.clearScanning = function() {
                $scope.scaninfo.doc_no = "";
                $scope.scaninfo.run_card_no = "";
                $scope.scaninfo.seq = "";
                $scope.scaninfo.scanning = "";
            };

            //藉由 flag 變動將游標 focus 在掃描框
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

            //长按会显示checkbox
            $scope.isCheckboxShown = false;
            $scope.showCheckbox = function(isCheckboxShown) {
                $scope.isCheckboxShown = !isCheckboxShown;
            };

            $scope.clickSelData = function(item) {
                if ($scope.isCheckboxShown) {
                    if (commonService.isNull(item.checked)) {
                        item.checked = true;
                    } else {
                        item.checked = !item.checked;
                    }
                } else {
                    $scope.getInfo(item);
                }
            };

            //排序
            $scope.order = ["create_date"];
            $scope.orderShow = [];
            $scope.orderShow["doc_no"] = 0;
            $scope.orderShow["create_date"] = 1;
            $scope.orderShow["customer_name"] = 0;
            $scope.orderShow["employee_name"] = 0;
            $scope.orderShow["item_no"] = 0;
            $scope.orderShow["item_name"] = 0;
            $scope.orderShow["item_spec"] = 0;
            $scope.orderShow["plan_date_s"] = 0;
            $scope.change = function(order) {
                var index = $scope.order.findIndex(function(item) {
                    return (item.search(order) !== -1);
                });
                if (index == -1) {
                    $scope.orderShow[order] = 1;
                    $scope.order.push(order);
                } else {
                    if ($scope.order[index].search("-") != -1) {
                        $scope.order.splice(index, 1);
                        $scope.orderShow[order] = 0;
                    } else {
                        $scope.order[index] = "-" + order;
                        $scope.orderShow[order] = -1;
                    }
                }
            };

            $scope.list_title = {
                isShowSupplier: false,
                isShowCustomer: false,
                isShowDepartment: false,
            }
            switch ($scope.page_params.program_job_no) {
                case "1":
                case "1-1":
                case "2-1":
                case "2":
                case "3-1":
                case "4-1":
                    $scope.list_title.isShowSupplier = true;
                    break;
                case "5":
                case "6":
                    $scope.list_title.isShowCustomer = true;
                    break;
                default:
                    $scope.list_title.isShowDepartment = true;
                    break;
            }

            //設定篩選條件
            var setConditionValue = function(condition) {
                for (var i = 0; i < condition.length; i++) {
                    var tmep = condition[i];
                    for (var j = 0; j < $scope.condition.length; j++) {
                        var item = $scope.condition[j];
                        if (item.seq == tmep.seq) {
                            item.value = tmep.value;
                            item.isdefault = tmep.isdefault;
                            item.set_type = tmep.set_type;
                            if (item.seq == "2") {
                                if (item.set_type === 0 || Number(item.set_type) === 0 || commonService.isNull(item.set_type)) {
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
            };

            //依照 set_type 取得對應的日期
            var setConditionDate = function(obj) {
                var date = obj.value;
                var set_type = Number(obj.set_type);
                if (set_type === 0 || !set_type) {
                    return "";
                }
                if (set_type !== 5) {
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
                    switch (set_type) {
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

            //取得轉換後篩選條件
            var getCondition = function() {
                var condition = angular.copy($scope.condition);
                condition[1].value = setConditionDate(condition[1]);
                return condition;
            };

            //變數相關 function 區塊 (E)-----------------------------------------

            //彈出視窗區塊 (S)---------------------------------------------------

            //彈出篩選條件頁面
            $scope.showQbeTodoNotice = function() {
                $ionicLoading.show();
                $ionicModal.fromTemplateUrl('views/app/fil_common/fil_common_s01/fil_common_s01_01.html', {
                    scope: $scope
                }).then(function(modal) {

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

                    $scope.showQbe = {
                        is_show_supplier: $scope.list_title.isShowSupplier,
                        is_show_customer: $scope.list_title.isShowCustomer,
                        is_show_department: $scope.list_title.isShowDepartment,
                        is_show_origindocno: false,
                        is_default: false,
                    };

                    if ($scope.page_params.func == "fil117" ||
                        $scope.page_params.program_job_no == "9-2" ||
                        $scope.page_params.program_job_no == "9-3") {
                        $scope.showQbe.is_show_origindocno = true;
                    }

                    for (var i = 0; i < $scope.condition.length; i++) {
                        var element = $scope.condition[i];
                        if (element.isdefault) {
                            $scope.showQbe.is_default = element.isdefault;
                            break;
                        }
                    }
                    console.log($scope.showQbe.is_default);

                    //清除篩選條件值
                    $scope.clearSetType = function(obj) {
                        obj.set_type = 0;
                        obj.value = "";
                    };

                    //篩選條件頁面 取消按鈕
                    $scope.close = function() {
                        $scope.condition = initConditionValue();
                        app_todo_notice_get();
                        closeModal();
                    };

                    //關閉 篩選條件頁面
                    var closeModal = function() {
                        modal.hide().then(function() {
                            return modal.remove();
                        });
                    };

                    //設定篩選條件
                    $scope.setCondition = function() {
                        if (commonService.Platform == "Chrome") {
                            app_todo_notice_get();
                            saveCondition();
                            return;
                        }
                        $ionicLoading.show();
                        for (var i = 0; i < $scope.condition.length; i++) {
                            var element = $scope.condition[i];
                            element.isdefault = $scope.showQbe.is_default;
                        }
                        APIBridge.callAPI('qbecondition_upd', [$scope.l_data, $scope.condition]).then(function(result) {
                            $ionicLoading.hide();
                            app_todo_notice_get();
                            saveCondition();
                        }, function(error) {
                            $ionicLoading.hide();
                            userInfoService.getVoice("qbecondition_upd fail:" + error.message, function() {
                                $scope.setFocusMe(true);
                            });
                        });
                    };

                    //將篩選條件存入 android儲存區（更新APK不會被覆蓋）
                    var saveCondition = function() {
                        if (commonService.Platform == "Chrome") {
                            closeModal();
                            return;
                        }
                        $ionicLoading.show();
                        APIBridge.callAPI('qbecondition_get', [{}, $scope.l_data]).then(function(result) {
                            $ionicLoading.hide();
                            setConditionValue(result.data);
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

            //彈出倉庫選擇頁面
            $scope.warehouseShow = function() {
                $scope.setFocusMe(false);
                commonFactory.showWarehouseModal(userInfoService.warehouse, $scope.scaninfo, $scope.setwarehouse, function() {
                    $scope.setFocusMe(true);
                });
            };

            //設定倉庫及儲位陣列
            $scope.setwarehouse = function(warehouse) {
                $scope.setFocusMe(true);
                $scope.scaninfo.warehouse_no = warehouse.warehouse_no;
                $scope.scaninfo.warehouse_name = warehouse.warehouse_name;
                $scope.scaninfo.storage_management = warehouse.storage_management;
                $scope.sel_in_storage = warehouse.storage_spaces;
                $scope.clearStorage();
            };

            //清除撥出倉庫
            $scope.clearWarehouse = function() {
                $scope.setwarehouse({
                    "warehouse_no": " ",
                    "warehouse_name": "",
                    "storage_spaces": [],
                    "storage_management": "N",
                    "warehouse_cost": "N",
                });
            };

            //彈出儲位選擇頁面
            $scope.storageShow = function() {
                $scope.setFocusMe(false);
                commonFactory.showStorageModal($scope.sel_in_storage, $scope.scaninfo, $scope.setstorage, function() {
                    $scope.setFocusMe(true);
                });
            };

            //設定儲位
            $scope.setstorage = function(storage) {
                $scope.setFocusMe(true);
                $scope.scaninfo.storage_spaces_no = storage.storage_spaces_no;
                $scope.scaninfo.storage_spaces_name = storage.storage_spaces_name;
            };

            //清除儲位
            $scope.clearStorage = function() {
                $scope.setstorage({
                    storage_spaces_no: "",
                    storage_spaces_name: ""
                });
            };

            //彈出批號輸入頁面
            $scope.lotShow = function() {
                $scope.setFocusMe(false);
                commonFactory.showLotPopup($scope.scaninfo.lot_no).then(function(res) {
                    $scope.setFocusMe(true);
                    if (typeof res !== "undefined") {
                        $scope.scaninfo.lot_no = res;
                    }
                });
            };

            //顯示未完事項Modal
            var showUpcoming = function(upcoming) {
                $ionicLoading.show();
                $ionicModal.fromTemplateUrl('views/app/common/html/upcomingModal.html', {
                    scope: $scope
                }).then(function(modal) {

                    $scope.closeUpcomingModal = function() {
                        qbeconditionGet(true);
                        $scope.removeModal();
                    };

                    $scope.removeModal = function() {
                        modal.hide().then(function() {
                            return modal.remove();
                        });
                    };

                    $scope.delupcoming = function(index) {
                        $ionicListDelegate.closeOptionButtons();
                        bcmeBcaeBcafDelete($scope.upcoming[index].last_transaction_date);
                    };

                    $scope.editupcoming = function(index) {
                        $ionicListDelegate.closeOptionButtons();
                        modal.hide().then(function() {
                            return modal.remove();
                        });
                        $scope.l_data.info_id = $scope.upcoming[index].last_transaction_date;
                        if ($scope.page_params.func == "fil105" || $scope.page_params.func == "fil117") {
                            if ($scope.scaninfo.storage_management == "Y") {
                                if (commonService.isNull($scope.scaninfo.storage_spaces_no)) {
                                    userInfoService.getVoice($scope.langs.storage_management_error, function() {
                                        $scope.setFocusMe(true);
                                    });
                                    return;
                                }
                            }
                        }
                        var data = angular.copy($scope.upcoming[index].info);
                        $scope.upcoming.splice(index, 1);
                        $scope.getInfo(data);
                    };

                    modal.show();
                    $ionicLoading.hide();
                });
            };

            //彈窗顯示 "所選單號有未成功提交的條碼掃描明細是否捨棄？"
            var showCheckUpcomingBox = function(temp) {
                var DataPopup = $ionicPopup.show({
                    title: $scope.langs.point,
                    template: "<p style='text-align: center'>" + $scope.langs.check_clear_data + "</p>",
                    scope: $scope,
                    buttons: [{
                        text: $scope.langs.cancel,
                        onTap: function() {
                            showUpcoming();
                        }
                    }, {
                        text: $scope.langs.confirm,
                        onTap: function() {
                            var upcoming = angular.copy($scope.upcoming);
                            for (var i = 0; i < upcoming.length; i++) {
                                var flag = false;
                                for (var j = 0; j < upcoming[i].info.length; j++) {
                                    for (var k = 0; k < temp.length; k++) {
                                        if (commonService.isEquality(upcoming[i].info[j].doc_no, temp[k].doc_no) &&
                                            commonService.isEquality(upcoming[i].info[j].seq, temp[k].seq)) {
                                            flag = true;
                                            break;
                                        }
                                    }
                                    if (flag) break;
                                }
                                if (flag) bcmeBcaeBcafDelete(upcoming[i].last_transaction_date);
                            }
                            $scope.l_data.info_id = angular.copy(l_info_id);
                            app_todo_doc_get();
                        }
                    }]
                });
                IonicClosePopupService.register(false, DataPopup);
                return;
            };

            //彈出視窗區塊 (E)---------------------------------------------------

            //取得未完事項
            var bcmeBcaeBcafGet = function(isShowUpcoming, isShowQbe) {
                var obj = {
                    type_no: "1"
                };
                $ionicLoading.show();
                $scope.upcoming = [];
                APIBridge.callAPI('bcme_ae_af_get', [obj, $scope.l_data]).then(function(result) {
                    var tempArray = [];
                    if (result.data[0].submit_show) {
                        $scope.setFocusMe(false);
                        $ionicLoading.hide();
                        angular.forEach(result.data[0].bcme, function(temp) {
                            // 判斷取得的未完單據 是否有相關的條碼掃描明細數據
                            var flag = false;
                            for (var i = 0; i < result.data[0].bcaf.length; i++) {
                                var item = result.data[0].bcaf[i];
                                if (commonService.isEquality(item.last_transaction_date, temp.last_transaction_date)) {
                                    flag = true;
                                }
                            }

                            if (!flag) {
                                // 如果取得的未完單據 沒有相關的條碼掃描明細數據 且目前動作為顯示未完項目時，刪除該單據
                                if (isShowUpcoming) bcmeBcaeBcafDelete(temp.last_transaction_date);
                            } else {
                                //設定未完事項明細 ，將相同 last_transaction_date 匯總為一筆
                                var index = tempArray.findIndex(function(item) {
                                    return commonService.isEquality(item.last_transaction_date, temp.last_transaction_date);
                                });

                                if (index != -1) {
                                    tempArray[index].info.push({
                                        "checked": true,
                                        "doc_no": temp.source_no,
                                        "seq": ""
                                    });
                                } else {
                                    tempArray.push({
                                        last_transaction_date: temp.last_transaction_date,
                                        info: [{
                                            "checked": true,
                                            "doc_no": temp.source_no,
                                            "seq": ""
                                        }]
                                    });
                                }
                            }
                        });
                        $timeout(function() {
                            $scope.upcoming = tempArray;
                        }, 0);
                        if (isShowUpcoming && tempArray.length > 0) {
                            showUpcoming();
                        } else {
                            qbeconditionGet(isShowQbe);
                        }
                    } else {
                        $scope.upcoming = [];
                        if (!isShowUpcoming) {
                            if (angular.isFunction($scope.removeModal)) {
                                $scope.removeModal();
                            }
                        }
                        qbeconditionGet(isShowQbe);
                    }
                }, function(error) {
                    $ionicLoading.hide();
                    userInfoService.getVoice('bcme_ae_af_get fail', function() {});
                    console.log(error);
                });
            };

            //刪除數據
            var bcmeBcaeBcafDelete = function(info_id) {
                $ionicLoading.show();
                var l_data = angular.copy($scope.l_data);
                l_data.info_id = info_id;
                APIBridge.callAPI('bcme_ae_af_delete', [l_data]).then(function(result) {
                    $ionicLoading.hide();
                    $scope.l_data.info_id = angular.copy(l_info_id);
                    bcmeBcaeBcafGet(false, false);
                }, function(result) {
                    $ionicLoading.hide();
                    userInfoService.getVoice('bcme_ae_af_delete fail', function() {});
                    console.log(result);
                });
            };

            //取得篩選條件
            var qbeconditionGet = function(isShowQbe) {
                var obj = {
                    type_no: "2"
                };
                APIBridge.callAPI('qbecondition_get', [obj, $scope.l_data]).then(function(result) {
                    $ionicLoading.hide();
                    console.log(result);
                    if (result.data.length === 0) {
                        $scope.condition = initConditionValue();
                        app_todo_notice_get();
                    } else {
                        setConditionValue(result.data);
                        if (result.data[0].isdefault) {
                            app_todo_notice_get();
                        } else {
                            if (isShowQbe) $scope.showQbeTodoNotice();
                        }
                    }
                }, function(result) {
                    console.log("qbecondition_get fail");
                    console.log(result);
                });
            };

            //取得待辦
            var app_todo_notice_get = function() {
                var webTran = {
                    service: 'app.todo.notice.get',
                    parameter: {
                        "program_job_no": $scope.page_params.program_job_no,
                        "status": $scope.page_params.status,
                        "scan_type": "1",
                        "site_no": userInfoService.userInfo.site_no,
                        "info_id": $scope.l_data.info_id,
                        "condition": getCondition()
                    }
                };
                console.log(webTran);
                $ionicLoading.show();
                APIService.Web_Post(webTran, function(res) {
                    $ionicLoading.hide();
                    // console.log("success:" + angular.toJson(res));
                    console.log(res);
                    var parameter = res.payload.std_data.parameter;
                    $scope.setFocusMe(true);
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

            //調用相機 進行掃描條碼
            $scope.scan = function() {
                $scope.scaninfo.scanning = "";
                $scope.setFocusMe(false);
                console.log("scanBarcode");
                APIBridge.callAPI('scanBarcode', [{}]).then(function(result) {
                    if (result) {
                        console.log('scanBarcode success');
                        $scope.setFocusMe(true);
                        checkScan(result.data[0].barcode.trim());
                    } else {
                        console.log('scanBarcode false');
                    }
                }, function(result) {
                    console.log("scanBarcode fail");
                    console.log(result);
                });
            };

            //掃苗框按下 enter 鍵後執行
            $scope.scanned = function(value) {
                checkScan(value.trim());
            };

            //檢查掃描後相關資訊
            var checkScan = function(scanning) {
                $scope.setFocusMe(false);
                //如果為 作業代號 2 採購入庫(單據) 檢查掃苗是否為 倉庫卡、倉庫、儲位
                if ($scope.page_params.func == "fil104" || $scope.page_params.func == "fil105" ||
                    $scope.page_params.func == "fil117") {
                    $scope.scaninfo.scanning = "";

                    // 判斷掃描是否為倉庫卡
                    var index = 0;
                    var warehouse_separator = userInfoService.userInfo.warehouse_separator || "@";
                    index = scanning.indexOf(warehouse_separator);
                    var seq = "";
                    if (index != -1) {
                        var obj = {};
                        obj = circulationCardService.checkWarehouseCard(scanning, warehouse_separator);

                        //取得倉庫資訊
                        index = userInfoService.warehouseIndex[obj.warehouse_no];
                        if (!angular.isUndefined(index)) { //存在於倉庫基本檔
                            $scope.setwarehouse(userInfoService.warehouse[index]);
                        }

                        index = $scope.sel_in_storage.findIndex(function(item) {
                            return obj.storage_spaces_no == item.storage_spaces_no;
                        });

                        if (index !== -1) { //存在於儲位基本檔
                            $scope.setstorage($scope.sel_in_storage[index]);
                        }
                        return;
                    } else {
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
                    }

                    //判斷掃描條碼是否小於批號長度 ，小於詢問是否為批號
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
                                    $scope.setFocusMe(true);
                                }
                            }]
                        });
                        IonicClosePopupService.register(false, LotPopup);
                        return;
                    }
                }
                setCirculationCard(scanning);
            };

            //解析條碼是否為組合條碼
            var setCirculationCard = function(scanning) {
                var obj = {};
                var barcode_separator = userInfoService.userInfo.barcode_separator || "%";
                var index_1 = scanning.indexOf(barcode_separator);
                $scope.setFocusMe(true);
                var seq = "";
                if (index_1 != -1) {
                    obj = circulationCardService.checkCirculationCard(scanning, barcode_separator);
                    scanning = obj.doc_no;
                    seq = obj.seq;
                }
                $scope.scaninfo.scanning = scanning;

                var temp = $filter('filter')(angular.copy($scope.sales_notice), scanning);
                //如果篩選後長度為0 CALL WS app.doc.status.get
                if (temp.length === 0) {
                    $scope.filtered_sales_notice = angular.copy($scope.sales_notice);
                    app_doc_status_get(scanning, seq);
                } else {
                    $scope.filtered_sales_notice = temp;
                }
            };

            var app_doc_status_get = function(doc_no, seq) {
                if (userInfoService.userInfo.server_product == "EF" ||
                    userInfoService.userInfo.server_product == "E10" ||
                    userInfoService.userInfo.server_product == "WF") {
                    userInfoService.getVoice($scope.langs.no_matching_data_error, function() {
                        $scope.setFocusMe(true);
                    });
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

            $scope.getInfo = function(data) {
                var temp = [];
                $scope.setFocusMe(false);

                //如果為 作業代號 2 採購入庫(單據) 檢查是否啟用儲位管理
                if ($scope.page_params.program_job_no == "2") {
                    if ($scope.scaninfo.storage_management == "Y") {
                        if (commonService.isNull($scope.scaninfo.storage_spaces_no)) {
                            userInfoService.getVoice($scope.langs.storage_management_error, function() {
                                $scope.setFocusMe(true);
                            });
                            return;
                        }
                    }
                }

                //將所選單據組成陣列
                if (data.length) {
                    angular.forEach(data, function(item) {
                        if (item.checked) {
                            temp.push({
                                "doc_no": item.doc_no,
                                "seq": item.seq
                            });
                        }
                    });
                } else {
                    temp = [{
                        "doc_no": data.doc_no,
                        "seq": data.seq,
                    }];
                }
                $scope.doc_array = temp;
                if ($scope.upcoming.length > 0) {
                    //檢查單號是否存在於未完事項
                    if (checkDocExistUpcoming(temp)) {
                        showCheckUpcomingBox(temp);
                        return;
                    }
                }

                if ($scope.doc_array.length <= 0) {
                    userInfoService.getVoice($scope.langs.please_choose + $scope.langs.upcoming + $scope.langs.receipt, function() {
                        $scope.setFocusMe(true);
                    });
                    return;
                }

                app_todo_doc_get();
            };

            //檢查單號是否存在於未完事項
            var checkDocExistUpcoming = function(temp) {
                var flag = false;
                for (var i = 0; i < $scope.upcoming.length; i++) {
                    for (var j = 0; j < $scope.upcoming[i].info.length; j++) {
                        for (var k = 0; k < temp.length; k++) {
                            if (commonService.isEquality($scope.upcoming[i].info[j].doc_no, temp[k].doc_no) &&
                                commonService.isEquality($scope.upcoming[i].info[j].seq, temp[k].seq)) {
                                flag = true;
                                break;
                            }
                        }
                        if (flag) break;
                    }
                    if (flag) break;
                }
                return flag;
            };

            //呼叫 app.todo.doc.get
            var app_todo_doc_get = function() {
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
                console.log(webTran);
                $ionicLoading.show();
                APIService.Web_Post(webTran, function(res) {
                    $ionicLoading.hide();
                    // console.log("success:" + angular.toJson(res));
                    console.log(res);
                    var parameter = res.payload.std_data.parameter;
                    bcmeCreate(parameter);
                }, function(error) {
                    $ionicLoading.hide();
                    var execution = error.payload.std_data.execution;
                    console.log("error:" + execution.description);
                    userInfoService.getVoice(execution.description, function() {
                        $scope.setFocusMe(true);
                    });
                });
            };

            var bcmeCreate = function(parameter) {
                if (commonService.Platform == "Chrome") {
                    fil_common_requisition.setParameter(parameter);
                    goPage();
                    return;
                }
                $ionicLoading.show();
                APIBridge.callAPI('bcme_create', [parameter, $scope.l_data]).then(function(result) {
                    $ionicLoading.hide();
                    if (result) {
                        console.log('bcme_create success');
                        goPage();
                    } else {
                        userInfoService.getVoice('bcme_create error', function() {});
                    }
                }, function(error) {
                    $ionicLoading.hide();
                    userInfoService.getVoice('bcme_create fail', function() {});
                    console.log(error);
                });
            };

            //点击数据跳转
            var goPage = function() {
                //儲存相關參數
                commonService.set_page_doc_array(angular.copy($scope.doc_array));
                commonService.set_page_warehouse_no($scope.scaninfo.warehouse_no);
                commonService.set_page_storage_spaces_no($scope.scaninfo.storage_spaces_no);
                commonService.set_page_lot_no($scope.scaninfo.lot_no);
                commonService.set_page_info_id($scope.l_data.info_id);
                var page = "";
                switch ($scope.page_params.func) {
                    case "fil104": // 採購收貨(單據)
                    case "fil105": // 採購入庫(單據)
                    case "fil117": // 採購入庫上架
                        page = "fil_common_s02.fil_common_s07";
                        break;
                    default:
                        page = "fil_common_s02.fil_common_s03";
                }
                $state.go(page);
            };

            if (!commonService.isNull(fil_common_requisition.scanning)) {
                var scanning = angular.copy(fil_common_requisition.scanning);
                fil_common_requisition.scanning = "";
                $scope.getInfo({
                    "doc_no": scanning,
                    "seq": "",
                });
            } else {
                if (commonService.Platform == "Chrome") {
                    $scope.condition = initConditionValue();
                    app_todo_notice_get();
                } else {
                    bcmeBcaeBcafGet(true, true);
                }
            }
        }
    ];
});