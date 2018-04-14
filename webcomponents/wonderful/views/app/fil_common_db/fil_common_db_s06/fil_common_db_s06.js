define(["API", "APIS", 'AppLang', 'views/app/fil_common_db/requisition.js', 'array', 'Directives', 'ReqTestData', 'ionic-popup',
    'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService'
], function() {
    return ['$scope', '$state', '$stateParams', '$timeout', '$filter', 'AppLang', 'APIService', 'APIBridge',
        '$ionicLoading', '$ionicPopup', '$ionicModal', '$ionicListDelegate', 'IonicPopupService', 'IonicClosePopupService',
        'fil_common_db_requisition', 'ReqTestData', 'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService',
        function($scope, $state, $stateParams, $timeout, $filter, AppLang, APIService, APIBridge,
            $ionicLoading, $ionicPopup, $ionicModal, $ionicListDelegate, IonicPopupService, IonicClosePopupService,
            fil_common_db_requisition, ReqTestData, circulationCardService, commonFactory, commonService, userInfoService, scanTypeService, numericalAnalysisService) {

            $scope.collection_item_height = "90"; // 三行
            if (userInfoService.userInfo.feature) {
                $scope.collection_item_height = "110"; // 四行
            }
            if ($scope.userInfo.isDisplay_name || $scope.userInfo.isDisplay_spec) {
                $scope.collection_item_height = "110"; // 四行
                if (userInfoService.userInfo.feature) {
                    $scope.collection_item_height = "130"; // 五行
                }
            }


            $scope.inventoryOrder = ['item_no', 'sort_no'];
            if (userInfoService.userInfo.server_product == "EF" ||
                userInfoService.userInfo.server_product == "WF" ||
                userInfoService.userInfo.server_product == "E10") {
                $scope.inventoryOrder = ['sort_no'];
            }

            //檢查是否可以修改指示頁倉庫
            var checkChangeWarehouse = function() {
                var flag = true;
                var first_in_first_out_control = "N";
                if ($scope.scanning_detail.length > 0) {
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
                            first_in_first_out_control = sourceDocDetail[i].first_in_first_out_control;
                            if (first_in_first_out_control == "Y") {
                                flag = false;
                                break;
                            }
                        }
                    }
                }
                if (!flag) {
                    //顯示錯誤 "掃描明細中，已有必須控卡先進先出的條碼資料，不可更改指示倉庫！"
                    userInfoService.getVoice($scope.langs.first_in_first_out_control_change_warehouse, function() {
                        $scope.setFocusMe(true);
                        $scope.inTheScan(false);
                    });
                }
                return flag;
            };

            //清除倉庫欄位
            $scope.clearWarehouse = function() {
                if (!checkChangeWarehouse()) {
                    return;
                }
                $scope.sel_indicate.warehouse_no = "";
                $scope.sel_indicate.warehouse_name = "";
                $scope.app_instructions_get();
            };

            //彈出倉庫選擇頁面
            $scope.warehouseShow = function() {
                if (!checkChangeWarehouse()) {
                    return;
                }
                commonFactory.showWarehouseModal(userInfoService.warehouse, $scope.sel_indicate, $scope.setwarehouse, function() {});
            };

            //設定倉庫
            $scope.setwarehouse = function(warehouse) {
                $scope.sel_indicate.warehouse_no = warehouse.warehouse_no;
                $scope.sel_indicate.warehouse_name = warehouse.warehouse_name;
                $scope.app_instructions_get();
            };

            //使用指示的條碼
            $scope.useBarcode = function(temp) {
                $scope.scaninfo.scanning = temp.barcode_no;

                if ($scope.views.show_ingoing) {
                    $scope.sel_indicate.warehouse_no = temp.warehouse_no;
                    $scope.sel_indicate.storage_spaces_no = temp.storage_spaces_no;
                    $scope.sel_indicate.lot_no = temp.lot_no;
                } else {
                    $scope.scaninfo.warehouse_no = temp.warehouse_no;
                    $scope.scaninfo.storage_spaces_no = temp.storage_spaces_no;
                    $scope.scaninfo.lot_no = temp.lot_no;
                }
                
                $state.go("fil_common_db_s02.fil_common_db_s03");
            };

            //篩選已用過的指示
            if ($scope.inventory_detail_all.length > 0) {
                var array = [];
                for (var i = 0; i < $scope.inventory_detail_all.length; i++) {
                    var item = $scope.inventory_detail_all[i];
                    var index = $scope.scanning_detail.findIndex(function(value) {
                        return commonService.isEquality(value.barcode_no, item.barcode_no) &&
                            commonService.isEquality(value.warehouse_no, item.warehouse_no) &&
                            commonService.isEquality(value.storage_spaces_no, item.storage_spaces_no) &&
                            commonService.isEquality(value.lot_no, item.lot_no);
                    });
                    if (index == -1) {
                        array.push(item);
                    }
                }
                $scope.setInventoryDetail(array);
            }
        }
    ];
});