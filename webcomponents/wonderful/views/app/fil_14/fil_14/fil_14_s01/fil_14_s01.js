define(["API", "APIS", 'AppLang', 'views/app/fil_common/requisition.js', 'array', 'Directives', 'ReqTestData', 'ionic-popup', 'views/app/fil_14/fil_14/requisition.js',
    'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService'
], function() {
    return ['$scope', '$state', '$timeout', '$filter', 'AppLang', 'APIService', 'APIBridge', 'fil_14_requisition',
        '$ionicLoading', '$ionicPopup', '$ionicModal', '$ionicListDelegate', 'IonicPopupService', 'IonicClosePopupService',
        'fil_common_requisition', 'ReqTestData', 'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService',
        function($scope, $state, $timeout, $filter, AppLang, APIService, APIBridge, fil_14_requisition,
            $ionicLoading, $ionicPopup, $ionicModal, $ionicListDelegate, IonicPopupService, IonicClosePopupService,
            fil_common_requisition, ReqTestData, circulationCardService, commonFactory, commonService, userInfoService, scanTypeService, numericalAnalysisService) {

            $scope.langs = AppLang.langs;
            $scope.page_params = commonService.get_page_params();
            $scope.userInfo = userInfoService.getUserInfo();

            //取得預設倉庫 設定頁面 或 第一筆資料
            var out_warehouse = userInfoService.userInfo.warehouse_no || userInfoService.warehouse[0].warehouse_no;

            //取得倉庫資訊
            var index = userInfoService.warehouseIndex[out_warehouse] || 0;
            var out_storage_management = userInfoService.warehouse[index].storage_management || "N";
            $scope.sel_in_storage = userInfoService.warehouse[index].storage_spaces;
            var out_storage_spaces_no = " ";
            if (out_storage_management == "Y") {
                out_storage_spaces_no = $scope.sel_in_storage[0].storage_spaces_no;
            }

            $scope.scaninfo = {
                scanning: "",
                focus_me: true,
                counting_type: "1",
                plan_no: "",
                label_no: "",
                item_no: "",
                warehouse_no: out_warehouse,
                warehouse_name: userInfoService.warehouse[index].warehouse_name,
                storage_management: out_storage_management,
                storage_spaces_no: out_storage_spaces_no,
                storage_spaces_name: (out_storage_management == "Y") ? $scope.sel_in_storage[0].storage_spaces_name : " ",
                has_list: false,
            };

            // EF E10 WF 預設下載盤點清單
            switch (userInfoService.userInfo.server_product) {
                case "EF":
                case "E10":
                case "WF":
                    $scope.scaninfo.has_list = true;
                    break;
                default:
                    $scope.scaninfo.has_list = false;
                    break;
            }

            $scope.counting_type_array = [{
                key: "1",
                value: $scope.langs.first_count + $scope.langs.one
            }, {
                key: "2",
                value: $scope.langs.first_count + $scope.langs.two
            }, {
                key: "3",
                value: $scope.langs.second_count + $scope.langs.one
            }, {
                key: "4",
                value: $scope.langs.second_count + $scope.langs.two
            }];

            $scope.goMenu = function() {
                $state.go("fil_00_s04");
            };

            $scope.warehouseShow = function() {
                commonFactory.showWarehouseModal(userInfoService.warehouse, $scope.scaninfo, $scope.setwarehouse, function() {});
            };

            $scope.clearWarehouse = function() {
                $scope.setwarehouse({
                    "warehouse_no": " ",
                    "warehouse_name": "",
                    "storage_spaces": [],
                    "storage_management": "N",
                    "warehouse_cost": "N",
                });
            };

            $scope.setwarehouse = function(warehouse) {
                $scope.scaninfo.warehouse_no = warehouse.warehouse_no;
                $scope.scaninfo.warehouse_name = warehouse.warehouse_name;
                $scope.scaninfo.storage_management = warehouse.storage_management;
                $scope.sel_in_storage = warehouse.storage_spaces;
                $scope.clearStorage();
            };

            $scope.storageShow = function() {
                commonFactory.showStorageModal($scope.sel_in_storage, $scope.scaninfo, $scope.setstorage, function() {});
            };

            $scope.setstorage = function(storage) {
                $scope.scaninfo.storage_spaces_no = storage.storage_spaces_no;
                $scope.scaninfo.storage_spaces_name = storage.storage_spaces_name;
            };

            $scope.clearStorage = function() {
                $scope.setstorage({
                    storage_spaces_no: "",
                    storage_spaces_name: ""
                });
            };

            $scope.confirm = function() {

                var flag = true;
                var errmessage = "";
                if (commonService.isNull($scope.scaninfo.warehouse_no)) {
                    flag = false;
                    errmessage = $scope.langs.please_choose + $scope.langs.default+$scope.langs.warehouse;
                }

                // T100 要檢查盤點計畫編號
                if (userInfoService.userInfo.server_product == "T100") {
                    if (commonService.isNull($scope.scaninfo.plan_no)) {
                        flag = false;
                        errmessage = $scope.langs.inventory + $scope.langs.plan + $scope.langs.number + $scope.langs.not_null;
                    }
                }

                if (!flag) {
                    userInfoService.getVoice(errmessage, function() {});
                    return;
                }

                fil_14_requisition.setParams($scope.scaninfo);

                if (!$scope.scaninfo.has_list) {
                    fil_14_requisition.setCheckList([]);
                    $state.go("fil_14_s02.fil_14_s03");
                    return;
                }

                var webTran = {
                    service: 'app.bc.stock.count.data.get',
                    parameter: {
                        "counting_type": $scope.scaninfo.counting_type,
                        "site_no": userInfoService.userInfo.site_no,
                        "condition": [{
                            "seq": "1", //1.计划单号
                            "value": $scope.scaninfo.plan_no
                        }, {
                            "seq": "2", //2.标签编号
                            "value": $scope.scaninfo.label_no
                        }, {
                            "seq": "3", //3.仓库
                            "value": $scope.scaninfo.warehouse_no
                        }, {
                            "seq": "4", //4.储位
                            "value": $scope.scaninfo.storage_spaces_no
                        }, {
                            "seq": "5", //5.料号
                            "value": $scope.scaninfo.item_no
                        }, {
                            "seq": "6", //6.條碼
                            "value": ""
                        }]
                    }
                };
                console.log(webTran);
                $ionicLoading.show();
                APIService.Web_Post(webTran, function(res) {
                    $ionicLoading.hide();
                    $scope.counting_plans = res.payload.std_data.parameter.counting_plans;
                    if (res.payload.std_data.parameter.counting.length > 0) {
                        fil_14_requisition.setCheckList(res.payload.std_data.parameter.counting);
                        $state.go("fil_14_s02.fil_14_s03");
                    } else {
                        userInfoService.getVoice($scope.langs.not + $scope.langs.data, function() {});
                    }
                }, function(error) {
                    $ionicLoading.hide();
                    var execution = error.payload.std_data.execution;
                    userInfoService.getVoice(execution.description, function() {});
                });
            };
        }
    ];
});