define(["API", "APIS", 'AppLang', 'views/app/fil_common/requisition.js', 'array', 'Directives', 'ReqTestData', 'ionic-popup',
    'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService'
], function() {
    return ['$scope', '$state', '$stateParams', '$timeout', '$filter', 'AppLang', 'APIService', 'APIBridge',
        '$ionicLoading', '$ionicPopup', '$ionicModal', '$ionicListDelegate', 'IonicPopupService', 'IonicClosePopupService',
        'fil_common_requisition', 'ReqTestData', 'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService',
        function($scope, $state, $stateParams, $timeout, $filter, AppLang, APIService, APIBridge,
            $ionicLoading, $ionicPopup, $ionicModal, $ionicListDelegate, IonicPopupService, IonicClosePopupService,
            fil_common_requisition, ReqTestData, circulationCardService, commonFactory, commonService, userInfoService, scanTypeService, numericalAnalysisService) {

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

            //將參數傳入fil_common_requisition
            fil_common_requisition.setParams(angular.copy($scope.page_params));

            //取得資訊ID yyyyMMddHHmmsssss_account            
            var l_info_id = commonService.getCurrent(2) + "_" + $scope.userInfo.account;

            //設定參數
            $scope.l_data = {
                bcae005: $scope.page_params.in_out_no, //出入庫瑪
                bcae006: $scope.page_params.func, //作業代號
                bcae014: $scope.page_params.program_job_no,
                bcae015: $scope.page_params.status, //A開立新單/S過賬/Y確認
                info_id: $scope.page_params.info_id || angular.copy(l_info_id),
                has_source: true, //是否有來源單據
                show_ingoing: false,
                show_reason: false,
                show_directive: false,
                show_doc_slip: false,
                show_s07_page: false,
                show_submit: false,
                edit_qty: true,
                use_erp_warehousing: false,
            };

            //設定各作業APP所顯示的標題
            userInfoService.changeTitle($scope.page_params.name + $scope.langs.scanning);

            //控制條碼掃描頁面數量是否可以修改
            if ((userInfoService.userInfo.gp_flag && $scope.page_params.program_job_no == "13-5") ||
                $scope.page_params.program_job_no == "13-3") {
                $scope.l_data.edit_qty = false;
            }

            //控卡作業是否檢查 erp_warehousing 參數
            switch ($scope.page_params.func) {
                case "fil107": //採購收貨
                case "fil104": //採購收貨(單據)
                case "fil108": //收貨入庫
                case "fil106": //收貨入庫(單據)
                case "fil102": //採購入庫(待辦)
                case "fil105": //採購入庫(單據)
                case "fil117": //採購入庫上架
                case "fil119": //送貨收貨(單據)
                case "fil101": //採購收貨(送貨)
                case "fil103": //收貨入庫(送貨)
                case "fil109": //銷售退回(新單)
                case "fil110": //銷售退回(過帳)
                case "fil206": //退料(新單)
                case "fil207": //退料(過帳)
                case "fil213": //完工入庫
                case "fil215": //入庫上架(新增)
                case "fil216": //入庫上架(扣帳)
                case "fil221": //入庫申請(多筆)
                case "fil222": //入庫過帳(E)
                case "fil502": //雜收(過帳)
                    $scope.l_data.use_erp_warehousing = true;
                    break;
            }

            //控制是否顯示頁面
            //是否顯示指示頁
            switch ($scope.page_params.func) {
                case "fil301": // 銷售出貨(新單)
                case "fil307": // 寄售調撥(待辦)
                case "fil308": // 銷售撿貨核對
                case "fil309": // 寄售調撥核對
                case "fil310": // 銷售出貨(訂單)
                case "fil201": // 發料(申請)
                case "fil202": // 發料(新單)
                case "fil203": // 發料(過帳)
                case "fil204": // 發料(單據)
                case "fil205": // 倒扣發料
                case "fil220": // 領料核對
                case "fil501": // 雜發(過帳)
                case "fil503": // 一階段撥出(申請)
                    $scope.l_data.show_directive = true;
                    break;
            };

            //是否顯示掃描+明細頁面
            switch ($scope.page_params.func) {
                case "fil104": // 採購收貨(單據)
                case "fil105": // 採購入庫(單據)
                case "fil106": // 收貨入庫(單據)
                case "fil117": // 採購入庫上架
                case "fil119": // 送貨收貨(單據)
                case "fil221": // 入庫申請(多筆)
                case "fil204": // 發料(單據)
                    $scope.l_data.show_s07_page = true;
                    break;
            };

            //是否顯示撥出字樣
            switch ($scope.page_params.func) {
                case "fil503": // 一階段撥出(申請)
                case "fil504": // 一階段撥出
                case "fil505": // 兩階段撥出
                case "fil506": // 兩階段撥入
                    $scope.l_data.show_ingoing = true;
                    break;
                case "fil518": // 報廢(過帳)
                    if (userInfoService.userInfo.gp_flag) {
                        $scope.l_data.show_ingoing = false;
                    }
                    $scope.l_data.show_ingoing = true;
                    break;
            };

            //是否顯示理由碼區塊
            switch ($scope.page_params.func) {
                case "fil518": // 報廢(過帳)
                    $scope.l_data.show_reason = true;
                    break;
                case "fil524": // 雜項發料(新單)
                case "fil525": // 雜項收料(新單)
                    $scope.l_data.show_reason = true;
                    // EF E10 WF 不使用理由碼
                    if (userInfoService.userInfo.server_product == "EF" ||
                        userInfoService.userInfo.server_product == "WF" ||
                        userInfoService.userInfo.server_product == "E10") {
                        $scope.l_data.show_reason = false;
                    }
                    break;
            };

            //是否顯示單別選擇功能
            switch ($scope.page_params.func) {
                case "fil504": // 一階段撥出
                case "fil505": // 兩階段撥出
                case "fil524": // 雜項發料(新單)
                case "fil525": // 雜項收料(新單)
                    $scope.l_data.has_source = false;
                    $scope.l_data.show_doc_slip = true;
                    break;
            }

            //設定各作業數據匯總時所顯示的標題
            switch ($scope.page_params.program_job_no) {
                case "1":
                case "1-1":
                case "1-2":
                case "12":
                    $scope.inquiry_list_title_already = $scope.langs.alreadyReceive;
                    $scope.inquiry_list_title_should = $scope.langs.shouldReceive;
                    break;
                case "2":
                case "2-1":
                case "3":
                case "3-1":
                case "9":
                case "9-1":
                case "9-2":
                case "9-3":
                    $scope.inquiry_list_title_already = $scope.langs.alreadyPutInStorage;
                    $scope.inquiry_list_title_should = $scope.langs.shouldPutInStorage;
                    break;
                case "5":
                case "5-1":
                case "5-2":
                case "5-3":
                case "5-4":
                    $scope.inquiry_list_title_already = $scope.langs.alreadyDelivery;
                    $scope.inquiry_list_title_should = $scope.langs.shouldDelivery;
                    break;
                case "4":
                case "6":
                case "8":
                    $scope.inquiry_list_title_already = $scope.langs.alreadyReturn;
                    $scope.inquiry_list_title_should = $scope.langs.shouldReturn;
                    break;
                case "7":
                case "7-1":
                case "7-2":
                case "7-3":
                case "7-5":
                case "11":
                    $scope.inquiry_list_title_already = $scope.langs.alreadyIssue;
                    $scope.inquiry_list_title_should = $scope.langs.shouldIssue;
                    break;
                case "13-1":
                case "13-2":
                    $scope.inquiry_list_title_already = $scope.langs.alreadyOutgoing;
                    break;
                case "13-3":
                case "13-5":
                    $scope.inquiry_list_title_already = $scope.langs.outgoing;
                    $scope.inquiry_list_title_should = $scope.langs.ingoing;
                    break;
                case "20":
                    $scope.inquiry_list_title_already = $scope.langs.alreadyScrap;
                    $scope.inquiry_list_title_should = $scope.langs.shouldScrap;
                    break;
                default:
                    $scope.inquiry_list_title_already = $scope.langs.alreadyPutInStorage;
                    $scope.inquiry_list_title_should = $scope.langs.shouldPutInStorage;
            }

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
                scanning: fil_common_requisition.scanning || "",
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

            fil_common_requisition.clearScanning();

            //撥出及指示 增加倉庫變數
            $scope.sel_indicate = {
                warehouse_no: out_warehouse,
                warehouse_name: userInfoService.warehouse[index].warehouse_name,
                warehouse_cost: out_warehouse_cost
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

            $scope.set_list_array = function() {
                $scope.temp_scanning_detail = $scope.scanning_detail;
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

                if ($scope.l_data.show_s07_page || $scope.page_params.in_out_no !== "-1") {
                    $scope.bcmeCreate(fil_common_requisition.parameter);
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
                if ($scope.page_params.in_out_no == '-1' && !($scope.l_data.show_ingoing)) {
                    setInstruction(obj);
                }
            };

            //修改明細
            $scope.editGoods = function(index) {
                $ionicListDelegate.closeOptionButtons();
                var temp = angular.copy($scope.scanning_detail[index]);
                $scope.getShowInfo(temp);
                $state.go("fil_common_s02.fil_common_s03");
            };

            //刪除明細
            $scope.deleteGoods = function(index) {
                var packing_barcode = angular.copy($scope.scanning_detail[index].packing_barcode);
                if (packing_barcode != "N") {
                    showCheckDeleteGoodsWaterfall(packing_barcode);
                } else {
                    $scope.scanning_detail.splice(index, 1);
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
                            $scope.l_data.show_submit = true;
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

            //判斷是否顯示多單位維護視窗
            $scope.checkIsShowEditMultiUnit = function(item) {
                //庫存數量 T100/TIPTOP不使用
                if (userInfoService.userInfo.server_product == "EF" ||
                    userInfoService.userInfo.server_product == "E10" ||
                    userInfoService.userInfo.server_product == "WF") {
                    return true;
                }

                if (angular.isObject(item) && item.multi_unit_type != "1") {
                    return true;
                }

                var isShowEditMultiUnit = false;
                //是否使用計價單位 0.不使用 1.採購 2.銷售 3.兩者
                switch (userInfoService.userInfo.valuation_unit) {
                    case "1":
                        if ($scope.page_params.mod == "APM") {
                            isShowEditMultiUnit = true;
                        }
                        break;
                    case "2":
                        if ($scope.page_params.mod == "AXM") {
                            isShowEditMultiUnit = true;
                        }
                        break;
                    case "3":
                        if ($scope.page_params.mod == "APM" ||
                            $scope.page_params.mod == "AXM") {
                            isShowEditMultiUnit = true;
                        }
                        break;
                }
                return isShowEditMultiUnit;
            };

            //顯示多單位維護 Modal
            $scope.editMultiUnit = function(type, index) {
                $scope.multUnitParameter = {
                    type: type,
                    isEditQty: false,
                    isShowShouldQty: false,
                    isShowInventory: false,
                    isShowReference: false,
                    isShowValuation: false,
                };

                //取得多單位頁面值
                switch (type) {
                    case 'scanning': //條碼掃描頁
                        $scope.multUnit = angular.copy($scope.showInfo);
                        $scope.multUnitParameter.isEditQty = true;
                        break;
                    case 'receipt': //單據掃描頁 
                        var item = angular.copy($scope.scanning_detail[index]);
                        $scope.multUnit = item;
                        $scope.multUnit.all_inventory_qty = item.inventory_qty;
                        $scope.multUnit.all_reference_qty = item.reference_qty;
                        $scope.multUnit.all_valuation_qty = item.valuation_qty;
                        $scope.multUnit.all_qty = item.qty;
                        $scope.multUnitParameter.isEditQty = true;
                        break;
                    case 'detail': //明細頁
                        var item = angular.copy($scope.scanning_detail[index]);
                        $scope.multUnit = item;
                        $scope.multUnit.all_inventory_qty = item.inventory_qty;
                        $scope.multUnit.all_reference_qty = item.reference_qty;
                        $scope.multUnit.all_valuation_qty = item.valuation_qty;
                        $scope.multUnit.all_qty = item.qty;
                        break;
                    case 'collection': //數據匯總頁
                        $scope.multUnit = angular.copy($scope.data_collection[index]);
                        $scope.multUnit.all_inventory_qty = $scope.data_collection[index].already_inv_qty;
                        $scope.multUnit.all_reference_qty = $scope.data_collection[index].already_ref_qty;
                        $scope.multUnit.all_valuation_qty = $scope.data_collection[index].already_val_qty;
                        $scope.multUnit.all_qty = $scope.data_collection[index].already_qty;
                        $scope.multUnit.should_inventory_qty = $scope.data_collection[index].should_inv_qty;
                        $scope.multUnit.should_reference_qty = $scope.data_collection[index].should_ref_qty;
                        $scope.multUnit.should_valuation_qty = $scope.data_collection[index].should_val_qty;
                        $scope.multUnit.should_qty = $scope.data_collection[index].should_qty;
                        if ($scope.l_data.has_source) {
                            $scope.multUnitParameter.isShowShouldQty = true;
                        }
                        break;
                    case 'directive': //指示頁
                        break;
                }

                if (userInfoService.userInfo.server_product == "EF" ||
                    userInfoService.userInfo.server_product == "E10" ||
                    userInfoService.userInfo.server_product == "WF") {
                    $scope.multUnitParameter.isShowInventory = true;
                }

                if ($scope.multUnit.multi_unit_type == "3") {
                    $scope.multUnitParameter.isShowReference = true;
                }

                //是否使用計價單位 0.不使用 1.採購 2.銷售 3.兩者
                switch (userInfoService.userInfo.valuation_unit) {
                    case "1":
                        if ($scope.page_params.mod == "APM") {
                            $scope.multUnitParameter.isShowValuation = true;
                        }
                        break;
                    case "2":
                        if ($scope.page_params.mod == "AXM") {
                            $scope.multUnitParameter.isShowValuation = true;
                        }
                        break;
                    case "3":
                        if ($scope.page_params.mod == "APM" ||
                            $scope.page_params.mod == "AXM") {
                            $scope.multUnitParameter.isShowValuation = true;
                        }
                        break;
                }

                console.log($scope.multUnit);

                $ionicModal.fromTemplateUrl('views/app/common/html/multiUnitQtyModal.html', {
                    scope: $scope
                }).then(function(modal) {

                    //数量弹窗
                    $scope.multiUnitQtyPop = function(type) {
                        var maxqty = "none";
                        var minqty = "none";
                        var qty = 0;

                        switch (type) {
                            case "inventory":
                                qty = $scope.multUnit.all_inventory_qty;
                                break;
                            case "reference":
                                //出項 最大值為條碼參考數量
                                if ($scope.page_params.in_out_no == "-1") {
                                    maxqty = $scope.multUnit.max_reference_qty;
                                }
                                qty = $scope.multUnit.all_reference_qty;
                                break;
                            case "valuation":
                                qty = $scope.multUnit.all_valuation_qty;
                                break;
                            default:
                                qty = $scope.multUnit.all_qty

                                if ($scope.page_params.in_out_no == "1" || $scope.page_params.in_out_no == "0") {
                                    if ($scope.multUnit.barcode_type) {
                                        maxqty = $scope.multUnit.max_allow_doc_qty;
                                    } else {
                                        maxqty = $scope.multUnit.maxqty;
                                    }
                                }

                                if ($scope.multUnit.packing_barcode != "N") {
                                    minqty = $scope.multUnit.packing_qty;
                                }

                                if ($scope.page_params.in_out_no == "-1") {
                                    maxqty = ($scope.multUnit.barcode_inventory_qty > $scope.multUnit.max_allow_doc_qty) ? $scope.showInfo.max_allow_doc_qty : $scope.showInfo.barcode_inventory_qty;
                                }
                                break;
                        }

                        commonFactory.showQtyPopup(type, qty, maxqty, minqty, $scope.page_params.in_out_no).then(function(res) {
                            $scope.setFocusMe(true);
                            if (typeof res !== "undefined") {
                                switch (type) {
                                    case "inventory":
                                        $scope.multUnit.all_inventory_qty = res;
                                        break;
                                    case "reference":
                                        $scope.multUnit.all_reference_qty = res;
                                        break;
                                    case "valuation":
                                        $scope.multUnit.all_valuation_qty = res;
                                        break;
                                    default:
                                        $scope.multUnit.all_qty = res;
                                        break;
                                }
                                var flag = checkMultiUnitQty(type);
                                if (flag && type == "qty") {
                                    return valInvCompute();
                                }
                            }
                        });
                    };

                    //修改數量後檢查
                    var checkMultiUnitQty = function(type) {
                        console.log("checkMultiUnitQty");
                        console.log($scope.multUnit);
                        //入項數量控卡
                        if ($scope.page_params.in_out_no == "1" || $scope.page_params.in_out_no == "0") {
                            if ($scope.multUnit.barcode_type) {
                                //有條碼類型為條碼 控卡條碼允收數量
                                switch ($scope.multUnit.barcode_type) {
                                    case 3:
                                    case "3":
                                        break;
                                    case 1:
                                    case "1":
                                    case 2:
                                    case "2":
                                        if (userInfoService.userInfo.server_product == "EF" ||
                                            userInfoService.userInfo.server_product == "E10" ||
                                            userInfoService.userInfo.server_product == "WF") {
                                            break;
                                        }
                                        //取得同條碼已用數量
                                        var used_barcode_qty = 0;
                                        if ($scope.scanning_detail.length > 0) {
                                            angular.forEach($scope.scanning_detail, function(value) {
                                                if (commonService.isEquality(value.barcode_no, $scope.multUnit.barcode_no) &&
                                                    (!commonService.isEquality(value.warehouse_no, $scope.multUnit.warehouse_no) ||
                                                        !commonService.isEquality(value.storage_spaces_no, $scope.multUnit.storage_spaces_no) ||
                                                        !commonService.isEquality(value.lot_no, $scope.multUnit.lot_no))) {
                                                    used_barcode_qty = numericalAnalysisService.accAdd(used_barcode_qty, value.qty);
                                                }
                                            });
                                        }
                                        //裝箱條碼需一次新增 檢查暫存陣列
                                        if ($scope.temp_detail.length > 0) {
                                            angular.forEach($scope.temp_detail, function(value) {
                                                if (commonService.isEquality(value.barcode_no, $scope.multUnit.barcode_no) &&
                                                    (!commonService.isEquality(value.warehouse_no, $scope.multUnit.warehouse_no) ||
                                                        !commonService.isEquality(value.storage_spaces_no, $scope.multUnit.storage_spaces_no) ||
                                                        !commonService.isEquality(value.lot_no, $scope.multUnit.lot_no))) {
                                                    used_barcode_qty = numericalAnalysisService.accAdd(used_barcode_qty, value.qty);
                                                }
                                            });
                                        }
                                        var allow_barcode_qty = numericalAnalysisService.accSub(numericalAnalysisService.accSub($scope.multUnit.barcode_qty, $scope.multUnit.barcode_inventory_qty), used_barcode_qty);
                                        if ($scope.multUnit.all_qty > allow_barcode_qty) {
                                            userInfoService.getVoice($scope.langs.barcode + $scope.langs.qty + $scope.langs.insufficient + "！", function() {
                                                $scope.setFocusMe(true);
                                                $scope.inTheScan(false);
                                            });
                                            $scope.multUnit.all_qty = allow_barcode_qty;
                                            return false;
                                        }
                                }
                            } else {
                                //單據控卡單據剩餘數量
                                if ($scope.multUnit.all_qty > $scope.multUnit.maxqty) {
                                    userInfoService.getVoice($scope.langs.receipt + $scope.langs.qty + $scope.langs.insufficient + "！", function() {
                                        $scope.setFocusMe(true);
                                        $scope.inTheScan(false);
                                    });
                                    $scope.multUnit.all_qty = $scope.multUnit.maxqty;
                                    return false;
                                }
                            }
                        }

                        //出項數量控卡
                        if ($scope.page_params.in_out_no == "-1") {
                            //出項 計算已用庫存數量
                            var used_barcode_inventory_qty = 0;
                            if ($scope.scanning_detail.length > 0) {
                                angular.forEach($scope.scanning_detail, function(value) {
                                    if (commonService.isEquality(value.barcode_no, $scope.multUnit.barcode_no) &&
                                        commonService.isEquality(value.warehouse_no, $scope.multUnit.warehouse_no) &&
                                        commonService.isEquality(value.storage_spaces_no, $scope.multUnit.storage_spaces_no) &&
                                        commonService.isEquality(value.lot_no, $scope.multUnit.lot_no) &&
                                        commonService.isEquality(value.inventory_management_features, $scope.multUnit.inventory_management_features)) {
                                        used_barcode_inventory_qty = numericalAnalysisService.accAdd(used_barcode_inventory_qty, value.qty);
                                    }
                                });
                            }
                            //裝箱條碼需一次新增 檢查暫存陣列
                            if ($scope.temp_detail.length > 0) {
                                angular.forEach($scope.temp_detail, function(value) {
                                    if (commonService.isEquality(value.barcode_no, $scope.multUnit.barcode_no) &&
                                        commonService.isEquality(value.warehouse_no, $scope.multUnit.warehouse_no) &&
                                        commonService.isEquality(value.storage_spaces_no, $scope.multUnit.storage_spaces_no) &&
                                        commonService.isEquality(value.lot_no, $scope.multUnit.lot_no) &&
                                        commonService.isEquality(value.inventory_management_features, $scope.multUnit.inventory_management_features)) {
                                        used_barcode_inventory_qty = numericalAnalysisService.accAdd(used_barcode_inventory_qty, value.qty);
                                    }
                                });
                            }
                            var surplus_barcode_inventory_qty = numericalAnalysisService.accSub($scope.multUnit.barcode_inventory_qty, used_barcode_inventory_qty);
                            //條碼庫存數量
                            if ($scope.multUnit.all_qty > surplus_barcode_inventory_qty) {
                                userInfoService.getVoice($scope.langs.barcode + $scope.langs.stock + $scope.langs.qty + $scope.langs.insufficient + "！", function() {
                                    $scope.setFocusMe(true);
                                    $scope.inTheScan(false);
                                });
                                $scope.multUnit.all_qty = $scope.multUnit.barcode_inventory_qty;
                                return false;
                            }

                            //裝箱條碼 控卡不可小於條碼數量
                            if ($scope.multUnit.packing_barcode != "N") {
                                if ($scope.multUnit.all_qty < $scope.multUnit.packing_qty) {
                                    userInfoService.getVoice($scope.langs.picks_error_3, function() {
                                        $scope.setFocusMe(true);
                                        $scope.inTheScan(false);
                                    });
                                    $scope.multUnit.all_qty = $scope.multUnit.packing_qty;
                                    return false;
                                }
                            }

                            //參考單位
                            if ($scope.multUnit.all_reference_qty > $scope.multUnit.max_reference_qty) {
                                userInfoService.getVoice($scope.langs.barcode + $scope.langs.reference + $scope.langs.qty + $scope.langs.insufficient + "！", function() {
                                    $scope.setFocusMe(true);
                                    $scope.inTheScan(false);
                                });
                                $scope.multUnit.all_reference_qty = $scope.multUnit.max_reference_qty;
                                return false;
                            }
                        }

                        var maxqty = $scope.multUnit.max_doc_qty;
                        var allow_qty = numericalAnalysisService.accSub($scope.multUnit.all_qty, $scope.multUnit.max_doc_qty);
                        if (allow_qty > 0) {
                            maxqty = $scope.multUnit.max_allow_doc_qty;
                        }

                        if ($scope.multUnit.all_qty > maxqty) {
                            userInfoService.getVoice($scope.langs.receipt + $scope.langs.surplus + $scope.langs.qty + $scope.langs.insufficient + "！", function() {
                                $scope.setFocusMe(true);
                                $scope.inTheScan(false);
                            });
                            $scope.multUnit.all_qty = maxqty;
                            return false;
                        }

                        $scope.setFocusMe(true);
                        $scope.inTheScan(false);
                        return true;
                    };

                    var valInvCompute = function() {
                        if (!commonService.isNull($scope.multUnit.valuation_unit_no)) {
                            if ($scope.multUnit.max_doc_qty == $scope.multUnit.all_qty) {
                                $scope.multUnit.all_valuation_qty = angular.copy($scope.multUnit.valuation_qty);
                            } else {
                                $scope.multUnit.all_valuation_qty = numericalAnalysisService.to_round(
                                    numericalAnalysisService.accDiv($scope.multUnit.all_qty, $scope.multUnit.valuation_rate),
                                    $scope.multUnit.decimal_places,
                                    $scope.multUnit.decimal_places_type);
                            }
                        }

                        if (!commonService.isNull($scope.multUnit.inventory_unit)) {
                            if ($scope.multUnit.max_doc_qty == $scope.multUnit.all_qty) {
                                $scope.multUnit.all_inventory_qty = angular.copy($scope.multUnit.inventory_qty);
                            } else {
                                $scope.multUnit.all_inventory_qty = numericalAnalysisService.to_round(
                                    numericalAnalysisService.accDiv($scope.multUnit.all_qty, $scope.multUnit.inventory_rate),
                                    $scope.multUnit.decimal_places,
                                    $scope.multUnit.decimal_places_type);
                            }
                        }
                    }

                    //計算加減後數值 並呼叫撿查
                    $scope.multiUnitCompute = function(type, arg1, arg2) {
                        $scope.setFocusMe(false);
                        var num = numericalAnalysisService.accAdd(arg1, arg2);
                        if (num < 1) {
                            num = 1;
                        }
                        switch (type) {
                            case "inventory":
                                $scope.multUnit.all_inventory_qty = num
                                break;
                            case "reference":
                                $scope.multUnit.all_reference_qty = num;
                                break;
                            case "valuation":
                                $scope.multUnit.all_valuation_qty = num;
                                break;
                            default:
                                $scope.multUnit.all_qty = num;
                                break;
                        }
                        var flag = checkMultiUnitQty(type);
                        if (flag && type == "qty") {
                            return valInvCompute();
                        }
                    };

                    $scope.setMultiUnitQty = function() {
                        if ($scope.multUnitParameter.type != 'scanning' &&
                            $scope.multUnitParameter.type != "receipt") {
                            return;
                        }

                        var index = -1;
                        if ($scope.page_params.program_job_no == "13-1" || $scope.page_params.program_job_no == "13-2") {
                            index = $scope.scanning_detail.findIndex(function(item) {
                                return commonService.isEquality($scope.multUnit.barcode_no, item.barcode_no) &&
                                    commonService.isEquality($scope.multUnit.warehouse_no, item.warehouse_no) &&
                                    commonService.isEquality($scope.multUnit.storage_spaces_no, item.storage_spaces_no) &&
                                    commonService.isEquality($scope.multUnit.lot_no, item.lot_no) &&
                                    commonService.isEquality($scope.multUnit.inventory_management_features, item.inventory_management_features) &&
                                    commonService.isEquality($scope.multUnit.ingoing_warehouse_no, item.ingoing_warehouse_no) &&
                                    commonService.isEquality($scope.multUnit.ingoing_storage_spaces_no, item.ingoing_storage_spaces_no);
                            });
                        }

                        //雜收發新單多比較 理由碼
                        if ($scope.page_params.func == "fil524" || $scope.page_params.func == "fil525") {
                            index = $scope.scanning_detail.findIndex(function(item) {
                                return commonService.isEquality($scope.multUnit.barcode_no, item.barcode_no) &&
                                    commonService.isEquality($scope.multUnit.warehouse_no, item.warehouse_no) &&
                                    commonService.isEquality($scope.multUnit.storage_spaces_no, item.storage_spaces_no) &&
                                    commonService.isEquality($scope.multUnit.lot_no, item.lot_no) &&
                                    commonService.isEquality($scope.multUnit.inventory_management_features, item.inventory_management_features) &&
                                    commonService.isEquality($scope.multUnit.reason_code, item.reason_code);
                            });
                        }

                        if ($scope.multUnitParameter.type == "receipt") {
                            index = $scope.scanning_detail.findIndex(function(item) {
                                return commonService.isEquality($scope.multUnit.warehouse_no, item.warehouse_no) &&
                                    commonService.isEquality($scope.multUnit.storage_spaces_no, item.storage_spaces_no) &&
                                    commonService.isEquality($scope.multUnit.lot_no, item.lot_no) &&
                                    commonService.isEquality($scope.multUnit.inventory_management_features, item.inventory_management_features) &&
                                    commonService.isEquality($scope.multUnit.source_no, item.source_no) &&
                                    commonService.isEquality($scope.multUnit.seq, item.seq) &&
                                    commonService.isEquality($scope.multUnit.doc_line_seq, item.doc_line_seq) &&
                                    commonService.isEquality($scope.multUnit.doc_batch_seq, item.doc_batch_seq);
                            });
                        }

                        if (!$scope.l_data.has_source || $scope.multUnitParameter.type == "receipt") {
                            if (index != -1) {
                                $scope.multUnit.inventory_qty = $scope.multUnit.all_inventory_qty;
                                $scope.multUnit.reference_qty = $scope.multUnit.all_reference_qty;
                                $scope.multUnit.valuation_qty = $scope.multUnit.all_valuation_qty;
                                $scope.multUnit.qty = $scope.multUnit.all_qty;
                                $scope.scanning_detail[index] = angular.copy($scope.multUnit);
                            }
                            $scope.getShowInfo();
                            $scope.setFocusMe(true);
                            $scope.inTheScan(false);
                            $scope.closeMultiUnitQtyModal();
                            return;
                        }

                        var use_allow_rate = false;
                        allow_qty = numericalAnalysisService.accSub($scope.multUnit.all_qty, $scope.multUnit.max_doc_qty);
                        if (allow_qty > 0) {
                            $scope.multUnit.maxqty = $scope.multUnit.max_allow_doc_qty;
                            use_allow_rate = true;
                        } else {
                            $scope.multUnit.maxqty = $scope.multUnit.max_doc_qty;
                            use_allow_rate = false;
                        }

                        if ($scope.multUnit.all_qty > $scope.multUnit.maxqty) {
                            userInfoService.getVoice($scope.langs.receipt + $scope.langs.surplus + $scope.langs.qty + $scope.langs.insufficient + "！", function() {
                                $scope.setFocusMe(true);
                                $scope.inTheScan(false);
                            });
                            $scope.multUnit.all_qty = $scope.multUnit.maxqty;
                        }

                        var showInfoQty = $scope.multUnit.all_qty; //畫面數量顯示總數
                        var showInfoInventoryQty = $scope.multUnit.all_inventory_qty; //畫面庫存數量總數
                        var showInfoReferenceQty = $scope.multUnit.all_reference_qty; //畫面參考數量總數
                        var showInfoValuationQty = $scope.multUnit.all_valuation_qty; //畫面計價數量總數

                        var sourceDocDetail = fil_common_requisition.getSourceDocDetail();
                        var item = {};
                        var array = [];
                        for (var k = 0; k < $scope.scanning_detail.length; k++) {
                            item = $scope.scanning_detail[k];
                            if (!(commonService.isEquality(item.barcode_no, $scope.multUnit.barcode_no) &&
                                    commonService.isEquality(item.warehouse_no, $scope.multUnit.warehouse_no) &&
                                    commonService.isEquality(item.storage_spaces_no, $scope.multUnit.storage_spaces_no) &&
                                    commonService.isEquality(item.lot_no, $scope.multUnit.lot_no) &&
                                    commonService.isEquality(item.inventory_management_features, $scope.multUnit.inventory_management_features))) {
                                array.push(item);
                            }
                        }
                        $scope.setScanning_detail(array);
                        array = [];
                        for (var j = 0; j < sourceDocDetail.length; j++) {
                            if (sourceDocDetail[j].allow_doc_qty === 0 ||
                                !commonService.isEquality(sourceDocDetail[j].item_no, $scope.multUnit.item_no) ||
                                !commonService.isEquality(sourceDocDetail[j].item_feature_no, $scope.multUnit.item_feature_no)) {
                                continue;
                            }
                            array.push(sourceDocDetail[j]);
                        }
                        for (var i = 0; i < array.length; i++) {
                            if ($scope.scanning_detail.length > 0) {
                                //計算該項次剩餘數量 = 單據數量 - 不同條碼發出數量
                                angular.forEach($scope.scanning_detail, function(value) {
                                    if ((!commonService.isEquality(value.barcode_no, $scope.multUnit.barcode_no) ||
                                            !commonService.isEquality(value.warehouse_no, $scope.multUnit.warehouse_no) ||
                                            !commonService.isEquality(value.storage_spaces_no, $scope.multUnit.storage_spaces_no) ||
                                            !commonService.isEquality(value.lot_no, $scope.multUnit.lot_no) ||
                                            !commonService.isEquality(value.inventory_management_features, $scope.multUnit.inventory_management_features)) &&
                                        commonService.isEquality(value.item_no, array[i].item_no) &&
                                        commonService.isEquality(value.item_feature_no, array[i].item_feature_no) &&
                                        commonService.isEquality(value.source_no, array[i].source_no) &&
                                        commonService.isEquality(value.seq, array[i].seq) &&
                                        commonService.isEquality(value.doc_line_seq, array[i].doc_line_seq) &&
                                        commonService.isEquality(value.doc_batch_seq, array[i].doc_batch_seq)) {
                                        array[i].allow_doc_qty = numericalAnalysisService.accSub(array[i].allow_doc_qty, value.qty);
                                        array[i].doc_qty = numericalAnalysisService.accSub(array[i].doc_qty, value.qty);
                                        array[i].inventory_qty = numericalAnalysisService.accSub(array[i].inventory_qty, value.inventory_qty);
                                        array[i].reference_qty = numericalAnalysisService.accSub(array[i].reference_qty, value.reference_qty);
                                        array[i].valuation_qty = numericalAnalysisService.accSub(array[i].valuation_qty, value.valuation_qty);
                                    }
                                });
                            }

                            //判斷是否使用誤差率
                            if (use_allow_rate) {
                                //計算可容許誤差數量
                                can_use_doc_qty = numericalAnalysisService.accSub(array[i].allow_doc_qty, array[i].doc_qty);

                                //計算使用誤差數量
                                if (allow_qty > can_use_doc_qty) {
                                    allow_qty = numericalAnalysisService.accSub(allow_qty, can_use_doc_qty);
                                    use_doc_qty = array[i].allow_doc_qty;
                                } else {
                                    use_doc_qty = numericalAnalysisService.accAdd(array[i].doc_qty, allow_qty);
                                }
                            } else {
                                use_doc_qty = array[i].doc_qty;
                            }

                            //單據項次剩餘數量 有剩餘數量時核銷
                            if (use_doc_qty > 0) {
                                if (showInfoQty > 0) {
                                    var temp = angular.copy($scope.multUnit);
                                    temp.source_no = array[i].source_no;
                                    temp.seq = array[i].seq;
                                    temp.doc_line_seq = array[i].doc_line_seq;
                                    temp.doc_batch_seq = array[i].doc_batch_seq;
                                    temp.qty = (showInfoQty > use_doc_qty) ? use_doc_qty : showInfoQty;
                                    temp.maxqty = use_doc_qty;

                                    showInfoQty = numericalAnalysisService.accSub(showInfoQty, temp.qty);

                                    //庫存數量
                                    temp.inventory_qty = (showInfoInventoryQty > array[i].inventory_qty) ? array[i].inventory_qty : showInfoInventoryQty;
                                    if (i == (array.length - 1) || showInfoQty <= 0) {
                                        temp.inventory_qty = showInfoInventoryQty;
                                    }
                                    showInfoInventoryQty = numericalAnalysisService.accSub(showInfoInventoryQty, temp.inventory_qty);

                                    //參考數量
                                    temp.reference_qty = (showInfoReferenceQty > array[i].reference_qty) ? array[i].reference_qty : showInfoReferenceQty;
                                    if (i == (array.length - 1) || showInfoQty <= 0) {
                                        temp.reference_qty = showInfoReferenceQty;
                                    }
                                    showInfoReferenceQty = numericalAnalysisService.accSub(showInfoReferenceQty, temp.reference_qty);

                                    //計價數量
                                    temp.valuation_qty = (showInfoValuationQty > array[i].valuation_qty) ? array[i].valuation_qty : showInfoValuationQty;
                                    if (i == (array.length - 1) || showInfoQty <= 0) {
                                        temp.valuation_qty = showInfoValuationQty;
                                    }
                                    showInfoValuationQty = numericalAnalysisService.accSub(showInfoValuationQty, temp.valuation_qty);

                                    $scope.insertGood(temp);
                                }
                            }
                        }
                        $scope.getShowInfo();
                        $scope.setFocusMe(true);
                        $scope.inTheScan(false);
                        $scope.closeMultiUnitQtyModal();
                    };

                    $scope.closeMultiUnitQtyModal = function() {
                        modal.hide().then(function() {
                            return modal.remove();
                        });
                    };
                    modal.show();
                });
                $ionicListDelegate.closeOptionButtons();
            };

            //彈出視窗區塊 (E)---------------------------------------------------


            //指示頁相關區塊 (S)-------------------------------------------------

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

            if ($scope.l_data.show_directive) {
                $scope.app_instructions_get();
            }

            //指示頁相關區塊 (E)-------------------------------------------------

            //取得掃描頁顯示資訊
            $scope.getShowInfo = function(obj) {
                if (angular.isObject(obj)) {
                    $scope.showGood.barcode_no = obj.barcode_no;
                    $scope.showGood.item_no = obj.item_no;
                    $scope.showGood.item_feature_no = obj.item_feature_no;
                    $scope.showGood.warehouse_no = obj.warehouse_no;
                    $scope.showGood.storage_spaces_no = obj.storage_spaces_no;
                    $scope.showGood.lot_no = obj.lot_no;
                    $scope.showGood.ingoing_warehouse_no = obj.ingoing_warehouse_no;
                    $scope.showGood.ingoing_storage_spaces_no = obj.ingoing_storage_spaces_no;
                }
                var index = $scope.scanning_detail.findIndex(function(item) {
                    return commonService.isEquality($scope.showGood.barcode_no, item.barcode_no) &&
                        commonService.isEquality($scope.showGood.warehouse_no, item.warehouse_no) &&
                        commonService.isEquality($scope.showGood.storage_spaces_no, item.storage_spaces_no) &&
                        commonService.isEquality($scope.showGood.lot_no, item.lot_no) &&
                        commonService.isEquality($scope.showGood.inventory_management_features, item.inventory_management_features) &&
                        commonService.isEquality($scope.showGood.ingoing_warehouse_no, item.ingoing_warehouse_no) &&
                        commonService.isEquality($scope.showGood.ingoing_storage_spaces_no, item.ingoing_storage_spaces_no);
                });

                $scope.showInfo = "";
                if (index == -1) {
                    return;
                }

                var showInfo = angular.copy($scope.scanning_detail[index]);
                showInfo.all_qty = angular.copy(showInfo.qty);
                showInfo.all_inventory_qty = angular.copy(showInfo.inventory_qty);
                showInfo.all_reference_qty = angular.copy(showInfo.reference_qty);
                showInfo.all_valuation_qty = angular.copy(showInfo.valuation_qty);


                //計算此條碼已發數量 及 其他條碼已發數量
                var all_qty = 0;
                var all_inventory_qty = 0;
                var all_reference_qty = 0;
                var all_valuation_qty = 0;
                var other_qty = 0;

                var elementIndex = [];
                var min_barcode_qty = 0;
                for (var i = 0; i < $scope.scanning_detail.length; i++) {
                    var item = $scope.scanning_detail[i];

                    //計算相同 料 條碼 倉庫 儲位 撥入倉庫 撥入儲位 批號 的數量
                    if (commonService.isEquality(item.item_no, showInfo.item_no) &&
                        commonService.isEquality(item.item_feature_no, showInfo.item_feature_no) &&
                        commonService.isEquality(item.barcode_no, showInfo.barcode_no) &&
                        commonService.isEquality(item.warehouse_no, showInfo.warehouse_no) &&
                        commonService.isEquality(item.storage_spaces_no, showInfo.storage_spaces_no) &&
                        commonService.isEquality(item.ingoing_warehouse_no, showInfo.ingoing_warehouse_no) &&
                        commonService.isEquality(item.ingoing_storage_spaces_no, showInfo.ingoing_storage_spaces_no) &&
                        commonService.isEquality(item.lot_no, showInfo.lot_no) &&
                        commonService.isEquality(item.inventory_management_features, showInfo.inventory_management_features)) {
                        all_qty = numericalAnalysisService.accAdd(all_qty, item.qty);
                        all_inventory_qty = numericalAnalysisService.accAdd(all_inventory_qty, item.inventory_qty);
                        all_reference_qty = numericalAnalysisService.accAdd(all_reference_qty, item.reference_qty);
                        all_valuation_qty = numericalAnalysisService.accAdd(all_valuation_qty, item.valuation_qty);

                        //包裝條碼 計算條碼數量最小值
                        if (item.packing_barcode != "N") {
                            showInfo.packing_barcode = item.packing_barcode;
                            var index = elementIndex.findIndex(function(element) {
                                return commonService.isEquality(element.barcode_no, item.barcode_no) &&
                                    commonService.isEquality(element.warehouse_no, item.warehouse_no) &&
                                    commonService.isEquality(element.storage_spaces_no, item.storage_spaces_no) &&
                                    commonService.isEquality(element.lot_no, item.lot_no) &&
                                    commonService.isEquality(element.inventory_management_features, item.inventory_management_features) &&
                                    commonService.isEquality(element.ingoing_warehouse_no, item.ingoing_warehouse_no) &&
                                    commonService.isEquality(element.ingoing_storage_spaces_no, item.ingoing_storage_spaces_no) &&
                                    commonService.isEquality(element.packing_barcode, item.packing_barcode);
                            });
                            if (index == -1) {
                                min_barcode_qty = numericalAnalysisService.accAdd(min_barcode_qty, item.packing_qty);
                                elementIndex.push(item);
                            }
                        }
                    }

                    //有來源單據 計算相同 料 不同 條碼 倉庫 儲位 撥入倉庫 撥入儲位 批號 的數量
                    if ($scope.l_data.has_source) {
                        if (commonService.isEquality(item.item_no, showInfo.item_no) &&
                            commonService.isEquality(item.item_feature_no, showInfo.item_feature_no) &&
                            !(commonService.isEquality(item.barcode_no, showInfo.barcode_no) &&
                                commonService.isEquality(item.warehouse_no, showInfo.warehouse_no) &&
                                commonService.isEquality(item.storage_spaces_no, showInfo.storage_spaces_no) &&
                                commonService.isEquality(item.ingoing_warehouse_no, showInfo.ingoing_warehouse_no) &&
                                commonService.isEquality(item.ingoing_storage_spaces_no, showInfo.ingoing_storage_spaces_no) &&
                                commonService.isEquality(item.lot_no, showInfo.lot_no) &&
                                commonService.isEquality(item.inventory_management_features, showInfo.inventory_management_features))) {
                            other_qty = numericalAnalysisService.accAdd(other_qty, item.qty);
                        }
                    }
                }

                showInfo.all_qty = all_qty;
                showInfo.all_inventory_qty = all_inventory_qty;
                showInfo.all_reference_qty = all_reference_qty;
                showInfo.all_valuation_qty = all_valuation_qty;
                showInfo.packing_qty = min_barcode_qty;

                //有來源單據
                if ($scope.l_data.has_source) {
                    //計算條碼最大數量
                    var maxqty = 0;
                    var max_allow_doc_qty = 0;
                    var max_doc_qty = 0;
                    var sourceDocDetail = fil_common_requisition.getSourceDocDetail();
                    for (var j = 0, len = sourceDocDetail.length; j < len; j++) {
                        var sourceDoc = sourceDocDetail[j];
                        if (commonService.isEquality(sourceDoc.item_no, showInfo.item_no) &&
                            commonService.isEquality(sourceDoc.item_feature_no, showInfo.item_feature_no)) {
                            max_allow_doc_qty = numericalAnalysisService.accAdd(max_allow_doc_qty, sourceDoc.allow_doc_qty);
                            max_doc_qty = numericalAnalysisService.accAdd(max_doc_qty, sourceDoc.doc_qty);
                        }
                    }
                    max_doc_qty = numericalAnalysisService.accSub(max_doc_qty, other_qty);
                    max_allow_doc_qty = numericalAnalysisService.accSub(max_allow_doc_qty, other_qty);
                    showInfo.maxqty = showInfo.barcode_inventory_qty;
                    showInfo.max_allow_doc_qty = max_allow_doc_qty;
                    showInfo.max_doc_qty = max_doc_qty;
                }

                if (!commonService.isNull(showInfo.barcode_type) || $scope.l_data.show_s07_page) {
                    $scope.showInfo = showInfo;
                    return;
                }

                //如果為緩存資料 重新抓取 條碼數量 庫存數量
                var webTran = {
                    service: "app.barcode.get",
                    parameter: {
                        "program_job_no": $scope.page_params.program_job_no,
                        "status": $scope.page_params.status,
                        "barcode_no": showInfo.barcode_no,
                        "warehouse_no": showInfo.warehouse_no,
                        "storage_spaces_no": showInfo.storage_spaces_no,
                        "lot_no": showInfo.lot_no,
                        "inventory_management_features": "",
                        "param_master": $scope.page_params.doc_array,
                        "info_id": $scope.l_data.info_id,
                        "site_no": userInfoService.userInfo.site_no
                    }
                };

                //調撥 倉儲為撥出倉儲 帶入預設倉庫
                if ($scope.l_data.show_ingoing) {
                    webTran.parameter.warehouse_no = $scope.sel_indicate.warehouse_no;
                    webTran.parameter.storage_spaces_no = "";
                    webTran.parameter.lot_no = "";
                }

                console.log(webTran);
                $ionicLoading.show();
                APIService.Web_Post(webTran, function(res) {
                    $ionicLoading.hide();
                    // console.log("success:" + angular.toJson(res));
                    var parameter = res.payload.std_data.parameter;
                    var barcode_detail = parameter.barcode_detail[0];

                    //2.箱條碼 入項 計算總庫存量
                    var all_barcode_inventory_qty = 0;
                    if (barcode_detail.barcode_type == "2") {
                        angular.forEach(parameter.barcode_detail, function(value) {
                            if (commonService.isEquality(showInfo.barcode_no, value.barcode_no)) {
                                all_barcode_inventory_qty = numericalAnalysisService.accAdd(all_barcode_inventory_qty, value.barcode_inventory_qty);
                            }
                        });
                        barcode_detail.barcode_inventory_qty = all_barcode_inventory_qty;
                    }

                    showInfo.barcode_type = barcode_detail.barcode_type;
                    showInfo.barcode_qty = barcode_detail.barcode_qty;
                    showInfo.barcode_inventory_qty = barcode_detail.inventory_qty;
                    showInfo.maxqty = showInfo.barcode_inventory_qty;
                    showInfo.max_reference_qty = barcode_detail.reference_qty;
                    $scope.showInfo = showInfo;
                }, function(error) {
                    $ionicLoading.hide();
                    var execution = error.payload.std_data.execution;
                    console.log("error:" + execution.description);
                    userInfoService.getVoice(execution.description, function() {
                        $scope.setFocusMe(true);
                    });
                });
                return;
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
                        page = "fil_common_s01";
                        if ($scope.page_params.func == "fil524" ||
                            $scope.page_params.func == "fil525") {
                            page = "fil_00_s04";
                        }
                        break;
                    default:
                        page = "fil_common_s01";
                        break;
                }

                if (commonService.Platform == "Chrome") {
                    fil_common_requisition.init();
                    $state.go(page);
                    return;
                }
                $ionicLoading.show();
                APIBridge.callAPI('bcaf_create', [$scope.scanning_detail, $scope.l_data]).then(function(result) {
                    if (result) {
                        $ionicLoading.hide();
                        fil_common_requisition.init();
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
                            $timeout(function() {
                                $scope.upcoming = tempArray;
                            }, 0);
                            showUpcoming();
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
                fil_common_requisition.setParameter(parameter);
                angular.forEach(data.bcme, function(value) {
                    $scope.addDocArray(value.source_no);
                });

                $scope.scanning_detail = data.bcaf;
                if ($scope.scanning_detail.length > 0 && $scope.l_data.show_directive) {
                    var sourceDocDetail = fil_common_requisition.getSourceDocDetail();
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