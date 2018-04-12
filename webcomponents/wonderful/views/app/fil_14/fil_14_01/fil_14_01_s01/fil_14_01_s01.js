define(["AppLang", "userInfoService", "commonService"], function() {
    return ['$scope', '$state', '$stateParams', "AppLang", "userInfoService", "commonService", "$timeout",
        function($scope, $state, $stateParams, AppLang, userInfoService, commonService, $timeout) {

            $scope.langs = AppLang.langs;
            $scope.page_params = commonService.get_page_params();
            $scope.userInfo = userInfoService.getUserInfo();

            $scope.init = function() {
                //取得預設倉庫 設定頁面 或 第一筆資料
                var out_warehouse = userInfoService.userInfo.warehouse_no || userInfoService.warehouse[0].warehouse_no;

                //取得倉庫資訊
                var index = userInfoService.warehouseIndex[out_warehouse] || 0;
                var out_storage_management = userInfoService.warehouse[index].storage_management || "N";
                $scope.setStorage(userInfoService.warehouse[index].storage_spaces);
                $scope.scaninfo = {
                    scanning: "",
                    focus_me: true,
                    submit_show: false,
                    counting_type: "1",
                    counting_no: "",
                    counting_warehouse_no: out_warehouse,
                    counting_warehouse_name: userInfoService.warehouse[index].warehouse_name,
                    warehouse_no: out_warehouse,
                    warehouse_name: userInfoService.warehouse[index].warehouse_name,
                    storage_management: out_storage_management,
                    storage_spaces_no: (out_storage_management == "Y") ? $scope.sel_in_storage[0].storage_spaces_no : " ",
                    storage_spaces_name: (out_storage_management == "Y") ? $scope.sel_in_storage[0].storage_spaces_name : " ",
                    has_list: false,
                    isShowReference: false
                };
            };
            $scope.setStorage = function(array) {
                $scope.sel_in_storage = array;
            }

            $scope.init();
            $scope.barcode_detail = [];
            $scope.source_doc_detail = [];
            $scope.scanning_detail = [];

            $scope.setSourceDocDetail = function(array) {
                $scope.setFocusMe(true);
                $scope.source_doc_detail = array;
            };

            $scope.initSourceDocDetail = function() {
                $scope.source_doc_detail = [];
            };

            $scope.setBarcodeDetail = function(array) {
                $scope.setFocusMe(true);
                $scope.barcode_detail = array;
            };

            $scope.initBarcodeDetail = function() {
                $scope.barcode_detail = [];
            };

            $scope.initInventoryList = function() {
                $scope.scanning_detail = [];
            };

            $scope.deleteInventoryList = function(index) {
                $scope.scanning_detail.splice(index, 1);
                if ($scope.scanning_detail.length <= 0) {
                    $scope.scaninfo.submit_show = false;
                }
            };

            $scope.editInventoryList = function(obj) {
                $scope.setFocusMe(true);
                $scope.scanning_detail.unshift(obj);
                if ($scope.scanning_detail.length > 0) {
                    $scope.scaninfo.submit_show = true;
                }
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