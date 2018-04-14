define(["API", "APIS", 'AppLang', 'views/app/fil_common_db/requisition.js', 'views/app/fil_common_db/fil_common_db_s02/fil_common_db_view.js', 'array', 'Directives', 'ReqTestData', 'ionic-popup',
    'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService'
], function() {
    return ['$scope', '$state', '$stateParams', '$timeout', '$filter', 'AppLang', 'APIService', 'APIBridge', 'fil_common_db_view',
        '$ionicLoading', '$ionicPopup', '$ionicModal', '$ionicListDelegate', 'IonicPopupService', 'IonicClosePopupService',
        'fil_common_db_requisition', 'ReqTestData', 'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService',
        function($scope, $state, $stateParams, $timeout, $filter, AppLang, APIService, APIBridge, fil_common_db_view,
            $ionicLoading, $ionicPopup, $ionicModal, $ionicListDelegate, IonicPopupService, IonicClosePopupService,
            fil_common_db_requisition, ReqTestData, circulationCardService, commonFactory, commonService, userInfoService, scanTypeService, numericalAnalysisService) {

            //變數初始化區塊 (S)-------------------------------------------------

            //取得多語言資訊
            $scope.langs = AppLang.langs;
            //取得作業參數
            $scope.page_params = commonService.get_page_params();
            //取得使用者資訊
            $scope.userInfo = userInfoService.getUserInfo();

            $scope.scanning_detail = [];
            $scope.slip_detail = [];
            $scope.temp_detail = [];
            $scope.reason_list = [];
            $scope.inventory_detail = [];
            $scope.inventory_detail_all = [];
            $scope.data_collection = [];

            //將參數傳入fil_common_db_requisition
            fil_common_db_requisition.setParams(angular.copy($scope.page_params));

            //取得資訊ID yyyyMMddHHmmsssss_account            
            var l_info_id = commonService.getCurrent(2) + "_" + $scope.userInfo.account;

            //設定參數
            $scope.l_data = {
                bcae005: $scope.page_params.in_out_no, //出入庫瑪
                bcae006: $scope.page_params.func, //作業代號
                bcae014: $scope.page_params.program_job_no,
                bcae015: $scope.page_params.status, //A開立新單/S過賬/Y確認
                info_id: $scope.page_params.info_id || angular.copy(l_info_id),
                doc_no: fil_common_db_requisition.doc_arry[0].doc_no
            };

            $scope.views = fil_common_db_view.getViews($scope.page_params);

            //設定各作業APP所顯示的標題
            userInfoService.changeTitle($scope.page_params.name + $scope.langs.scanning);


            //取得預設倉庫 設定頁面 或 第一筆資料
            var out_warehouse = $scope.page_params.warehouse_no || $scope.userInfo.warehouse_no || userInfoService.warehouse[0].warehouse_no;

            //取得倉庫資訊
            var index = userInfoService.warehouseIndex[out_warehouse] || 0;
            var out_storage_management = userInfoService.warehouse[index].storage_management || "N";
            var out_warehouse_cost = userInfoService.warehouse[index].warehouse_cost || "N";
            $scope.sel_in_storage = userInfoService.warehouse[index].storage_spaces;
            var out_storage_spaces_no = " ";
            if (out_storage_management == "Y") {
                out_storage_spaces_no = $scope.sel_in_storage[0].storage_spaces_no;
            }

            $scope.scaninfo = {
                in_the_scan: false,
                directly_added: true,
                scanning: fil_common_db_requisition.scanning || "",
                search: "",
                focus_me: true,
                warehouse_no: $scope.page_params.warehouse_no || out_warehouse,
                warehouse_name: userInfoService.warehouse[index].warehouse_name,
                warehouse_cost: out_warehouse_cost,
                storage_management: out_storage_management,
                storage_spaces_no: $scope.page_params.storage_spaces_no || out_storage_spaces_no,
                storage_spaces_name: (out_storage_management == "Y") ? $scope.sel_in_storage[0].storage_spaces_name : " ",
                lot_no: $scope.page_params.lot_no || "",
                lot_control_flag: null,
                qty: 0,
                maxqty: 0,
                reason_code: " ",
                reason_code_name: " ",
                doc_slip: " ",
                doc_slip_name: " ",
            };

            fil_common_db_requisition.clearScanning();

            //撥出及指示 增加倉庫變數
            $scope.sel_indicate = {
                warehouse_no: out_warehouse,
                warehouse_name: userInfoService.warehouse[index].warehouse_name,
                warehouse_cost: out_warehouse_cost,
                storage_spaces_no: "",
                lot_no: "",
            };

            //初始化 showGood 物件
            $scope.initShowGood = function() {
                $scope.showGood = {
                    barcode_no: null,
                    item_no: null,
                    item_feature_no: null,
                    warehouse_no: null,
                    storage_spaces_no: null,
                    lot_no: null,
                    ingoing_warehouse_no: null,
                    ingoing_storage_spaces_no: null
                };
                $scope.getShowInfo();
            };

            //變數初始化區塊 (E)-------------------------------------------------

            //變數相關 function 區塊 (S)-----------------------------------------

            $scope.scan_time_log = [];

            $scope.init_scan_time_log = function() {
                $scope.scan_time_log = [];
            };

            $scope.add_scan_time_log = function(key) {
                if (!$scope.userInfo.show_scan_log) {
                    return;
                }
                var time = commonService.getCurrent(5);
                if ($scope.scan_time_log.length > 0) {
                    var expend = 0;
                    if (key == "total") {
                        expend = (new Date(time).getTime() - new Date($scope.scan_time_log[0].time).getTime()) / 1000;
                    } else {
                        expend = (new Date(time).getTime() - new Date($scope.scan_time_log[$scope.scan_time_log.length - 1].time).getTime()) / 1000;
                    }
                }
                $scope.scan_time_log.push({
                    key: key,
                    time: time,
                    expend: expend + " s",
                });
            };

            $scope.temp_scanning_detail = [];

            $scope.set_list_array = function(arry) {
                // $scope.temp_scanning_detail = $scope.scanning_detail;
                $scope.temp_scanning_detail = arry;
                $scope.scanning_detail = arry;
            };

            $scope.clear_list_array = function() {
                $scope.temp_scanning_detail = [];
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

            //設定單別陣列
            $scope.setSlipDetail = function(array) {
                $scope.slip_detail = array || [];
            };

            //藉由 flag 判斷是否在掃描中
            $scope.inTheScan = function(flag) {
                $scope.scaninfo.in_the_scan = flag;
            };

            $scope.insertGood = function(temp) {
                var flag = true;
                if (!$scope.scaninfo.directly_added) {
                    $scope.addGoodsToTempDetail(temp);
                    return flag;
                }
                $scope.addGoods(temp);
                $scope.getShowInfo(temp);

                if ($scope.views.show_s07_page || $scope.page_params.in_out_no !== "-1") {
                    $scope.bcmeCreate(fil_common_db_requisition.parameter);
                }
                return flag;
            };

            $scope.addGoodsToTempDetail = function(obj) {
                $scope.temp_detail.unshift(angular.copy(obj));
            };

            $scope.clearTempDetail = function() {
                $scope.temp_detail = [];
            };

            $scope.TempDetailToScanningDetail = function() {
                for (var i = 0; i < $scope.temp_detail.length; i++) {
                    var element = $scope.temp_detail[i];
                    $scope.addGoods(element);
                }
                $scope.scaninfo.directly_added = true;
                $scope.getShowInfo($scope.temp_detail[$scope.temp_detail.length - 1]);
            };

            //新增明細
            $scope.addGoods = function(obj) {
                $scope.setFocusMe(true);
                $scope.inTheScan(false);
                $scope.scanning_detail.unshift(angular.copy(obj));
                if ($scope.page_params.in_out_no == '-1' && !($scope.views.show_ingoing)) {
                    setInstruction(obj);
                }
            };

            //修改明細
            $scope.editGoods = function(index) {
                $ionicListDelegate.closeOptionButtons();
                // var temp = angular.copy($scope.scanning_detail[index]);
                APIBridge.callAPI('get_showinfo', [$scope.scanning_detail[index]]).then(function (result) {
                    $ionicLoading.hide();
                    // var arry = angular.fromJson(result.data[0].data);
                    // console.log(arry);
                    $scope.getShowInfo(result.data[0]);
                    $state.go("fil_common_db_s02.fil_common_db_s03");
                }, function (error) {
                    $ionicLoading.hide();
                    userInfoService.getVoice(error.message, function () {
                        $scope.setFocusMe(true);
                    });
                });
                // $scope.getShowInfo(temp);
                
            };

            //刪除明細
            $scope.deleteGoods = function(index) {
                var packing_barcode = angular.copy($scope.scanning_detail[index].packing_barcode);
                if (packing_barcode != "N") {
                    showCheckDeleteGoodsWaterfall(packing_barcode);
                } else {
                    $scope.scanning_detail.splice(index, 1);
                    $scope.set_list_array();
                }
                $scope.getShowInfo();
            };

            //顯示提示框 是否刪除裝箱條碼
            var showCheckDeleteGoodsWaterfall = function(packing_barcode) {
                // 顯示提示 "此條碼資料由裝箱條碼帶入，刪除時會刪除多筆資料，是否刪除？"
                var checkDeleteGoodsWaterfall = $ionicPopup.show({
                    title: $scope.langs.point,
                    template: "<p style='text-align: center'>" + $scope.langs.packing_barcode_del_point + "</p>",
                    scope: $scope,
                    buttons: [{
                        text: $scope.langs.cancel,
                        onTap: function() {
                            $scope.views.show_submit = true;
                        }
                    }, {
                        text: $scope.langs.confirm,
                        onTap: function() {
                            deleteGoodsWaterfall(packing_barcode);
                        }
                    }]
                });
                IonicClosePopupService.register(false, checkDeleteGoodsWaterfall);
                return;
            };

            //瀑布式刪除
            var deleteGoodsWaterfall = function(packing_barcode) {
                var tmepArray = [];
                for (var i = 0; i < $scope.scanning_detail.length; i++) {
                    var element = $scope.scanning_detail[i];
                    if (!commonService.isEquality(element.packing_barcode, packing_barcode)) {
                        tmepArray.push(element);
                    }
                }
                $scope.setScanning_detail(tmepArray);
                $scope.set_list_array();
                $scope.getShowInfo();
            };

            //設定掃描明細
            $scope.setScanning_detail = function(array) {
                $scope.scanning_detail = array;
            };

            //清除掃描明細
            $scope.clearList = function() {
                $scope.scanning_detail = [];
                $scope.inventory_detail = [];
                $scope.inventory_detail_all = [];
                $scope.data_collection = [];
                $scope.temp_detail = [];
                $scope.slip_detail = [];
            };

            $scope.setDataCollection = function(array) {
                $scope.data_collection = array;
            }

            $scope.clearScanning = function() {
                $scope.scaninfo.scanning = "";
            };

            //增加單號
            $scope.addDocArray = function(scanning) {
                commonService.push_page_doc_array({
                    "doc_no": scanning,
                    "seq": ""
                });
            };

            //變數相關 function 區塊 (E)-----------------------------------------

            //彈出視窗區塊 (S)---------------------------------------------------

            //彈出撥出倉庫選擇頁面
            $scope.warehouseShow_outgoing = function() {
                $scope.setFocusMe(false);
                commonFactory.showWarehouseModal(userInfoService.warehouse, $scope.sel_indicate, $scope.setwarehouse_outgoing, function() {
                    $scope.setFocusMe(true);
                });
            };

            //設定撥出倉庫
            $scope.setwarehouse_outgoing = function(warehouse) {
                $scope.sel_indicate.warehouse_no = warehouse.warehouse_no;
                $scope.sel_indicate.warehouse_name = warehouse.warehouse_name;
            };

            //清除撥出倉庫
            $scope.clearWarehouse_outgoing = function() {
                $scope.setwarehouse_outgoing({
                    "warehouse_no": " ",
                    "warehouse_name": "",
                    "warehouse_cost": "N",
                });
            };

            //彈出倉庫選擇頁面
            $scope.warehouseShow = function() {
                $scope.setFocusMe(false);
                commonFactory.showWarehouseModal(userInfoService.warehouse, $scope.scaninfo, $scope.setwarehouse, function() {
                    $scope.setFocusMe(true);
                });
            };

            //清除倉庫
            $scope.clearWarehouse = function() {
                $scope.setwarehouse({
                    "warehouse_no": " ",
                    "warehouse_name": "",
                    "storage_spaces": [],
                    "storage_management": "N",
                    "warehouse_cost": "N",
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

            $scope.clearReason = function() {
                $scope.scaninfo.reason_code_name = " ";
                $scope.scaninfo.reason_code = " ";
            };

            $scope.reasonShow = function() {
                $ionicLoading.show();
                $ionicModal.fromTemplateUrl('views/app/common/html/reasonModal.html', {
                    scope: $scope
                }).then(function(modal) {

                    $scope.popSelected = {
                        search: "",
                        reason_code: " ",
                        reason_code_name: " ",
                    };

                    $scope.changeReasonCode = function(item) {
                        $scope.popSelected.reason_code = item.reason_code;
                        $scope.popSelected.reason_code_name = item.reason_code_name;
                    };

                    $scope.setReasonCode = function() {
                        $scope.scaninfo.reason_code = $scope.popSelected.reason_code;
                        $scope.scaninfo.reason_code_name = $scope.popSelected.reason_code_name;
                        $scope.closeSelReasonModal();
                    };

                    $scope.closeSelReasonModal = function() {
                        modal.hide().then(function() {
                            return modal.remove();
                        });
                    };

                    $scope.showSelReasonModal = function() {
                        modal.show();
                        $ionicLoading.hide();
                    };

                    if ($scope.reason_list.length === 0) {
                        var webTran = {
                            service: 'app.reason.code.get',
                            parameter: {
                                "program_job_no": $scope.page_params.program_job_no,
                                "status": $scope.page_params.status,
                                "site_no": userInfoService.userInfo.site_no,
                                "reason_code": " "
                            }
                        };
                        APIService.Web_Post(webTran, function(res) {
                            // console.log("success:" + angular.toJson(res));
                            var parameter = res.payload.std_data.parameter;
                            $timeout(function() {
                                $scope.reason_list = parameter.reason_list;
                                $scope.showSelReasonModal();
                            }, 0);
                        }, function(error) {
                            $ionicLoading.hide();
                            var execution = error.payload.std_data.execution;
                            console.log("error:" + execution.description);
                            userInfoService.getVoice(execution.description, function() {});
                        });
                    } else {
                        $scope.showSelReasonModal();
                    }
                });
            };

            //顯示未完事項Modal
            var showUpcoming = function(upcoming) {
                $ionicLoading.show();
                $ionicModal.fromTemplateUrl('views/app/common/html/upcomingModal.html', {
                    scope: $scope
                }).then(function(modal) {

                    $scope.closeUpcomingModal = function(flag) {
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
                        bcmeBcaeBcafGet(false, "2");
                    };

                    var bcmeBcaeBcafDelete = function(info_id) {
                        $ionicLoading.show();
                        var l_data = angular.copy($scope.l_data);
                        l_data.info_id = info_id;
                        APIBridge.callAPI('bcme_ae_af_delete', [l_data]).then(function(result) {
                            $ionicLoading.hide();
                            bcmeBcaeBcafGet(false, "1");
                        }, function(result) {
                            $ionicLoading.hide();
                            userInfoService.getVoice('bcme_ae_af_delete fail', function() {});
                            console.log(result);
                        });
                    };

                    modal.show();
                    $ionicLoading.hide();
                });
            };

        
            //呼叫指示 app.instructions.get
            $scope.app_instructions_get = function() {

                var webTran = {
                    service: 'app.instructions.get',
                    parameter: {
                        "program_job_no": $scope.page_params.program_job_no,
                        "status": $scope.page_params.status,
                        "site_no": userInfoService.userInfo.site_no,
                        "warehouse_no": $scope.sel_indicate.warehouse_no,
                        "param_master": $scope.page_params.doc_array
                    }
                };
                console.log(webTran);
                $ionicLoading.show();
                APIService.Web_Post(webTran, function(res) {
                    $ionicLoading.hide();
                    // console.log("success:" + angular.toJson(res));
                    var parameter = res.payload.std_data.parameter;
                    $scope.setInventoryDetail(parameter.inventory_detail);
                    $scope.setInventoryDetailAll(parameter.inventory_detail);
                    if ($scope.scanning_detail.length > 0) {
                        for (var i = 0; i < $scope.scanning_detail.length; i++) {
                            var obj = $scope.scanning_detail[i];
                            setInstruction(obj);
                        }
                    }
                }, function(error) {
                    $ionicLoading.hide();
                    var execution = error.payload.std_data.execution;
                    console.log("error:" + execution.description);
                    userInfoService.getVoice(execution.description, function() {});
                });
            };

            //新增指示明細(未刪減)
            $scope.setInventoryDetailAll = function(array) {
                $scope.inventory_detail_all = array || [];
            };

            //新增指示明細
            $scope.setInventoryDetail = function(array) {
                $scope.inventory_detail = array || [];
            };

            var setInstruction = function(obj) {
                if ($scope.inventory_detail.length <= 0 || commonService.isNull($scope.inventory_detail)) {
                    return;
                }
                var array = [];
                for (var i = 0; i < $scope.inventory_detail_all.length; i++) {
                    var item = $scope.inventory_detail_all[i];
                    var index = $scope.scanning_detail.findIndex(function(value) {
                        return commonService.isEquality(value.barcode_no, item.barcode_no) &&
                            commonService.isEquality(value.warehouse_no, item.warehouse_no) &&
                            commonService.isEquality(value.storage_spaces_no, item.storage_spaces_no) &&
                            commonService.isEquality(value.lot_no, item.lot_no) &&
                            commonService.isEquality(value.inventory_management_features, item.inventory_management_features);
                    });
                    if (index == -1) {
                        array.push(item);
                    }
                }
                $scope.setInventoryDetail(array);
            };

            if ($scope.views.show_directive) {
                $scope.app_instructions_get();
            }

            //指示頁相關區塊 (E)-------------------------------------------------

            //取得掃描頁顯示資訊
            $scope.getShowInfo = function(obj) {
                if (angular.isObject(obj)) {
                    console.log(obj);
                    $scope.showInfo = obj;
                    return;
                }
            };

            //設定返回頁面 並建立 條碼掃描明細
            $scope.goTodolistNotice = function() {

                switch ($scope.page_params.program_job_no) {
                    case "1":
                    case "3":
                    case "1-2":
                    case "7-1":
                    case "9":
                    case "9-1":
                    case "13-1":
                    case "13-2":
                        page = "fil_00_s04";
                        break;
                    case "11":
                    case "12":
                        page = "fil_common_db_s01";
                        if ($scope.page_params.func == "fil524" ||
                            $scope.page_params.func == "fil525") {
                            page = "fil_00_s04";
                        }
                        break;
                    default:
                        page = "fil_common_db_s01";
                        break;
                }

                if (commonService.Platform == "Chrome") {
                    fil_common_db_requisition.init();
                    $state.go(page);
                    return;
                }
                $ionicLoading.show();
                APIBridge.callAPI('bcaf_create', [$scope.scanning_detail, $scope.l_data]).then(function(result) {
                    if (result) {
                        $ionicLoading.hide();
                        fil_common_db_requisition.init();
                        $state.go(page);
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

            $scope.bcmeCreate = function(parameter) {
                if (commonService.Platform == "Chrome") {
                    return;
                }
                $ionicLoading.show();
                APIBridge.callAPI('bcme_create', [parameter, $scope.l_data]).then(function(result) {
                    $ionicLoading.hide();
                    if (result) {
                        console.log('bcme_create success');
                    } else {
                        userInfoService.getVoice('bcme_create error', function() {});
                    }
                }, function(error) {
                    $ionicLoading.hide();
                    userInfoService.getVoice('bcme_create fail', function() {});
                    console.log(error);
                });
            };

            //取得未完事項
            var bcmeBcaeBcafGet = function(isShowUpcoming, type_no) {
                var obj = {
                    type_no: type_no
                };
                $ionicLoading.show();
                APIBridge.callAPI('bcme_ae_af_get', [obj, $scope.l_data]).then(function(result) {
                    $ionicLoading.hide();
                    if (result.data[0].submit_show) {
                        if (isShowUpcoming) {
                            var list = result.data[0].bcme;
                            if (type_no == "1") {
                                list = result.data[0].bcaf;
                            }
                            var tempArray = setUpcomingData(list);
                            if (tempArray.length > 0) {
                                $timeout(function() {
                                    $scope.upcoming = tempArray;
                                }, 0);
                                showUpcoming();
                            }
                        } else {
                            setInitData(result.data[0]);
                        }
                    } else {
                        if (type_no == "1") {
                            if (!isShowUpcoming) $scope.closeUpcomingModal();
                            $scope.upcoming = [];
                        } else {
                            setInitData(result.data[0]);
                        }
                    }
                }, function(error) {
                    $ionicLoading.hide();
                    userInfoService.getVoice('bcme_ae_af_get fail', function() {});
                    console.log(error);
                });
            };

            // 設定未完事項明細 ，將相同 last_transaction_date 匯總為一筆
            var setUpcomingData = function(list) {
                var tempArray = [];
                angular.forEach(list, function(temp) {
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
                });
                return tempArray;
            };

            //初始化資料
            var setInitData = function(data) {
                var parameter = {
                    barcode_detail: [],
                    source_doc_detail: data.bcme,
                };
                fil_common_db_requisition.setParameter(parameter);
                angular.forEach(data.bcme, function(value) {
                    $scope.addDocArray(value.source_no);
                });

                $scope.scanning_detail = data.bcaf;
                if ($scope.scanning_detail.length > 0 && $scope.views.show_directive) {
                    var sourceDocDetail = fil_common_db_requisition.getSourceDocDetail();
                    for (var i = 0; i < $scope.scanning_detail.length; i++) {
                        var detail = $scope.scanning_detail[i];
                        var index = sourceDocDetail.findIndex(function(element) {
                            return commonService.isEquality(detail.source_no, element.source_no) &&
                                commonService.isEquality(detail.seq, element.seq) &&
                                commonService.isEquality(detail.doc_line_seq, element.doc_line_seq) &&
                                commonService.isEquality(detail.doc_batch_seq, element.doc_batch_seq);
                        });
                        if (index != -1) {
                            first_in_first_out_control = sourceDocDetail[index].first_in_first_out_control;
                            if (first_in_first_out_control == "Y") {
                                var warehouseIndex = userInfoService.warehouseIndex[detail.warehouse_no] || 0;
                                $scope.sel_indicate.warehouse_no = detail.warehouse_no;
                                $scope.sel_indicate.warehouse_name = userInfoService.warehouse[warehouseIndex].warehouse_name;
                                $scope.app_instructions_get();
                                break;
                            }
                        }
                    }
                }

                //如果為 作業代號 7-1 發料(單據) 計算生產數量及最大生產數量
                if ($scope.page_params.program_job_no == "7-1") {
                    var temp = data.bcme[0];
                    $scope.scaninfo.qty = numericalAnalysisService.accSub(temp.production_qty, temp.production_in_out_qty);
                    var rate = numericalAnalysisService.accAdd(1, numericalAnalysisService.accDiv(temp.allow_error_rate, 100));
                    $scope.scaninfo.maxqty = numericalAnalysisService.to_round(numericalAnalysisService.accSub(numericalAnalysisService.accMul(temp.production_qty, rate), temp.production_in_out_qty), temp.decimal_places, temp.decimal_places_type);
                }
            };

            $scope.initShowGood();
            if (commonService.Platform !== "Chrome") {
                switch ($scope.page_params.func) {
                    case "fil104":
                    case "fil105":
                    case "fil117":
                        break;
                    case "fil107":
                    case "fil108":
                    case "fil119":
                    case "fil204":
                    case "fil213":
                    case "fil221":
                    case "fil504":
                    case "fil505":
                    case "fil524":
                    case "fil525":
                        bcmeBcaeBcafGet(true, "1");
                        break;
                    default:
                        bcmeBcaeBcafGet(false, "2");
                        break;
                }
            }

        }
    ];
});