define(["API", "APIS", "AppLang", "array", "Directives", "ReqTestData", "ionic-popup", "commonFactory", "commonFormat"], function () {
   return ["$rootScope", "$scope", "$state", "$stateParams", "$filter", "$timeout", "AppLang", "APIService", "APIBridge", "$ionicListDelegate", "ReqTestData", "commonFactory", "$location", "$ionicScrollDelegate", "$ionicPosition", "IonicPopupService", "userInfoService", "commonFormat", "ionicToast", "kb_05_requisition", "numericalAnalysisService",
      function ($rootScope, $scope, $state, $stateParams, $filter, $timeout, AppLang, APIService, APIBridge, $ionicListDelegate, ReqTestData, commonFactory, $location, $ionicScrollDelegate, $ionicPosition, IonicPopupService, userInfoService, commonFormat, ionicToast, kb_05_requisition, numericalAnalysisService) {
         $scope.userInfo = userInfoService.getUserInfo()

         //==================== 內部呼叫 Function ====================(S)
         var nuberFixed = numericalAnalysisService

         function page_init() {
            $scope.langs = AppLang.langs

            $scope.orderBy = ["chkitem", "warehouse_data.warehouse_no", "warehouse_data.storage_spaces_no", "warehouse_data.lot_no", "doc_no", "doc_seq"]
         }

         //清單捲動至Item
         function goToItem(id) {
            $location.hash("item" + id)
            $ionicScrollDelegate.anchorScroll()
         }

         //數量檢查
         function chkqty(oldQty) {
            return function (qty, maxqty, event) {
               var condition = true
               while (condition) {

                  //MD005: 數量不可超過原單據數量
                  if (+qty > maxqty) {
                     event.preventDefault()
                     var error_massage = AppLang.langs.error.MD005
                     userInfoService.getVoice(error_massage, function () { })
                     qty = oldQty
                     break
                  }

                  //檢查完畢
                  condition = false
               }

               return +qty
            }
         }

         //顯示 Toast 訊息
         function showToastMiddle(msg) {
            ionicToast.show(msg, "middle", false, 1500)
         }

         //==================== 內部呼叫 Function ====================(E)


         //==================== 外部呼叫 Function ====================(S)

         $scope.warehouseShow = function (documents) {
            commonFactory.showWarehouseModal(userInfoService.warehouse, $scope.warehouse_data, $scope.setwarehouse, function () {
               $timeout(function () {
                  documents.store = $scope.warehouse_data.warehouse_no
                  documents.location = $scope.warehouse_data.storage_spaces_no

                  goToItem(documents.index)
               }, 0)
            })
         }

         $scope.clearStorage = function () {
            $scope.setstorage({
               "storage_spaces_no": " ",
               "storage_spaces_name": " "
            })
         }

         $scope.storageShow = function (documents) {
            commonFactory.showStorageModal($scope.sel_in_storage, $scope.warehouse_data, $scope.setstorage, function () {
               $timeout(function () {
                  documents.location = $scope.warehouse_data.storage_spaces_no

                  goToItem(documents.index)
               }, 0)
            })
         }

         $scope.lotShow = function (documents) {
            commonFactory.showLotPopup($scope.warehouse_data.lot_no).then(function (res) {
               if (typeof res !== "undefined") {
                  documents.lot_no = res
                  $scope.warehouse_data.lot_no = res

                  goToItem(documents.index)
               }
            })
         }

         //倉庫資料顯示
         var index = undefined
         $scope.showWarehouse = function (documents) {
            documents.showWarehouse = !documents.showWarehouse

            if (documents.showWarehouse) {
               if (documents.index != index && index != undefined) {
                  $scope.documents_sum[index].showWarehouse = false
               }

               index = documents.index
               $scope.warehouse_data = documents.warehouse_data
               $scope.sel_in_storage = $scope.warehouse_data.sel_in_storage
            }

            if (documents.showWarehouse && !documents.warehouse_data) {
               $scope.setDocWarehouse(documents)
            }
         }

         //返回儲位
         $scope.getLocations = function (warehouse) {
            if (warehouse) {
               var result = Object.keys(warehouse)

               return result
            }
         }

         //返回料件
         $scope.getItems = function (warehouse, location) {
            if (warehouse) {
               var obj = warehouse[location]
               var result = Object.keys(obj)

               return result
            }
         }

         //數量增加、減少
         $scope.compute = function (documents, value) {
            //開啟多單位視窗時, 不執行原邏輯
            if (documents.warehouse_data.showMultiUnit) {
               return
            }

            //型態轉換為Number
            value = +value

            if (documents.warehouse_data.qty == 0 && value == -1) {
               //MD008: 數量已達最小值!
               showToastMiddle($scope.langs.error.MD008)
               return
            }

            if (documents.warehouse_data.qty >= documents.qty && value == 1) {
               //MD005: 數量不可超過原單據數量!
               showToastMiddle($scope.langs.error.MD005)
               return
            }

            documents.warehouse_data.qty = nuberFixed.accAdd(documents.warehouse_data.qty, value)
            documents.include_qty = documents.warehouse_data.qty
         }

         //直接輸入數值
         $scope.showQtyPop = function (documents) {
            //開啟多單位視窗時, 不顯示原數量視窗
            if (documents.warehouse_data.showMultiUnit) {
               return
            }

            var temp = angular.copy(documents.warehouse_data)
            //var maxqty = Infinity;   //無限制

            //最大值 = 單據數
            var maxqty = documents.qty

            commonFactory.showQtyPopup_kb("", temp.qty, maxqty, chkqty(temp.qty)).then(function (res) {
               if (typeof res !== "undefined") {
                  documents.warehouse_data.qty = res
                  documents.include_qty = documents.warehouse_data.qty
               }
            })
         }

         //設置倉庫的資料
         $scope.setWarehousesCnt = function (documents) {
            if (!documents.showWarehouse) {
               documents.showWarehouse = !documents.showWarehouse
               index = documents.index
               $scope.warehouse_data = documents.warehouse_data
            }

            if (!documents.warehouse_data) {
               $scope.setDocWarehouse(documents)
               return
            }
         }

         //重新設置倉庫
         $scope.setwarehouse = function (warehouse) {
            if (!warehouse) {
               $scope.sel_in_storage = []
               return
            }

            $scope.warehouse_data.warehouse_no = warehouse.warehouse_no
            $scope.warehouse_data.warehouse_name = warehouse.warehouse_name
            $scope.warehouse_data.storage_management = warehouse.storage_management

            $scope.warehouse_data.sel_in_storage = warehouse.storage_spaces
            $scope.sel_in_storage = warehouse.storage_spaces

            $scope.clearStorage()
         }

         $scope.setstorage = function (storage) {
            $scope.warehouse_data.storage_spaces_no = storage.storage_spaces_no
            $scope.warehouse_data.storage_spaces_name = storage.storage_spaces_name
         }

         //點擊item收起按鍵框
         $scope.closeOption = function () {
            $ionicListDelegate.closeOptionButtons()
         }

         ionic.Platform.ready(function () {
            var orientation = window.orientation || 0 //當前螢幕翻轉方向

            ////設定view高度
            function HeightResize(source) {
               if (orientation === window.orientation && source === "resize") {
                  return
               }

               //重新取得控件的高度，方式與 widet/js/directives.js 相同
               var getHeight = (function () {
                  var pagerHeader = $("div[source='kb_05_s03_02']")

                  return function (type) {
                     var height = 0
                     var pagerHeader_offset = $ionicPosition.offset(pagerHeader)

                     if (pagerHeader_offset) {
                        height = pagerHeader_offset.height + 5
                     }

                     return height
                  }
               })()

               var Height = getHeight()
               $("ion-nav-view[name='kb_05_s03_02_list']")
                  .css("height", "calc(100% - " + Height + "px)")
               $("ion-content#scroll")
                  .css("height", "calc(100% - 4px)")
            }

            $timeout(function () {
               HeightResize("init")
            }, 0)

            $(window).on("resize.kb_05_s03_02", (function () {
               HeightResize("resize")
               orientation = window.orientation || 0
            }))

            //離開頁面時銷毀呼叫事件
            var stateChangeStart = $scope.$on("$stateChangeStart", function (event, data) {
               console.log("kb_05_s03_02 leave")

               //關閉明細
               if (index != undefined) {
                  $scope.documents_sum[index].showWarehouse = false
               }

               stateChangeStart()
               $(window).off("resize.kb_05_s03_02")
            })
         })

         //==================== 外部呼叫 Function ====================(E)


         //==================== 呼叫 BDL 元件 ====================(S)

         //==================== 呼叫 BDL 元件 ====================(E)

         //初始化變數
         page_init()
      }
   ]
})