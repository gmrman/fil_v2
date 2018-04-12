define(["app", "API", "APIS", "ionic-popup"], function (app) {
   app.factory("kb_03_PopupService", ["APIService", "AppLang", "$rootScope", "$timeout", "$filter", "$ionicLoading", "$ionicPopup", "IonicClosePopupService", "IonicPopupService", "$ionicModal", "$ionicActionSheet", "userInfoService",
      function (APIService, AppLang, $rootScope, $timeout, $filter, $ionicLoading, $ionicPopup, IonicClosePopupService, IonicPopupService, $ionicModal, $ionicActionSheet, userInfoService) {
         var parent = $rootScope
         var $scope = parent.$new()
         $scope.langs = AppLang.langs
         $scope.userInfo = userInfoService.getUserInfo()
         $scope.isAllSelected = false
         $scope.filterItem = function (ItemList, search) {
            return $filter("filter")(ItemList, search)
         }

         return {
            /***********************************************************************************************************************
             * Descriptions...: 顯示倉庫彈窗
             * Usage..........: showWarehouseModal(warehouse, scaninfo, resolve, reject)
             * Input parameter: warehouse            廠商ARRAY
             *                : scaninfo             使用者資訊
             *                : resolve              資料確認後的處理
             *                : reject               彈窗關閉後的處理
             * Return code....: warehouse            廠商OBJECT
             * Modify.........: 20170516 By ZHEN
             ***********************************************************************************************************************/
            "showWarehouseModal": function (warehouse, scaninfo, resolve, reject) {
               $scope.warehouses = warehouse
               if (scaninfo.length > 0) {
                  angular.forEach(scaninfo, function (sel_item) {
                     for (var i = 0, len = $scope.warehouses.length; i < len; i++) {
                        if ($scope.warehouses[i].warehouse_no === sel_item.warehouse_no) {
                           $scope.warehouses[i].checked = true
                           break
                        }
                     }
                  })
               }
               if ($scope.warehouses.length > 0 && $scope.warehouses.length == scaninfo.length) {
                  $scope.isAllSelected = true
               }
               else {
                  $scope.isAllSelected = false
               }

               $scope.popSelected = {
                  "search": ""
               }

               $scope.setWarehouse = function () {
                  $scope.close()

                  return resolve($scope.filterItem($scope.warehouses, $scope.popSelected.search))
               }

               $scope.selectAll = function (isAllSelected) {
                  var filterItem = $scope.filterItem($scope.warehouses, $scope.popSelected.search)
                  angular.forEach(filterItem, function (item) {
                     item.checked = isAllSelected
                  })
               }

               $ionicModal.fromTemplateUrl("views/app/kb_03/kb_03_s01/js/warehouseModal.html", {
                  "scope": $scope
               }).then(function (modal) {
                  $scope.close = function () {
                     reject($scope.filterItem($scope.warehouses, $scope.popSelected.search))
                     modal.hide().then(function () {
                        return modal.remove()
                     })
                  }
                  $scope.modal = modal
                  $scope.modal.show()
                  return modal
               })
            },
            /***********************************************************************************************************************
             * Descriptions...: 顯示單別彈窗
             * Usage..........: showSingleModal(single, scaninfo, resolve, reject)
             * Input parameter: single               品號ARRAY
             *                : scaninfo             使用者資訊
             *                : resolve              資料確認後的處理
             *                : reject               彈窗關閉後的處理
             * Return code....: single               單別OBJECT
             * Modify.........: 20170516 By ZHEN
             ***********************************************************************************************************************/
            "showSingleModal": function (single, scaninfo, resolve, reject) {
               $scope.singles = single
               if (scaninfo.length > 0) {
                  angular.forEach(scaninfo, function (sel_item) {
                     for (var i = 0, len = $scope.singles.length; i < len; i++) {
                        if ($scope.singles[i].doc === sel_item.doc) {
                           $scope.singles[i].checked = true
                           break
                        }
                     }
                  })
               }
               if ($scope.singles.length > 0 && $scope.singles.length == scaninfo.length) {
                  $scope.isAllSelected = true
               }
               else {
                  $scope.isAllSelected = false
               }

               $scope.popSelected = {
                  "search": ""
               }

               $scope.setSingle = function () {
                  $scope.close()

                  return resolve($scope.filterItem($scope.singles, $scope.popSelected.search))
               }

               $scope.selectAll = function (isAllSelected) {
                  var filterItem = $scope.filterItem($scope.singles, $scope.popSelected.search)
                  angular.forEach(filterItem, function (item) {
                     item.checked = isAllSelected
                  })
               }

               $ionicModal.fromTemplateUrl("views/app/kb_03/kb_03_s01/js/singleModal.html", {
                  "scope": $scope
               }).then(function (modal) {
                  $scope.close = function () {
                     reject($scope.filterItem($scope.singles, $scope.popSelected.search))
                     modal.hide().then(function () {
                        return modal.remove()
                     })
                  }
                  $scope.modal = modal
                  $scope.modal.show()
                  return modal
               })
            },
            /***********************************************************************************************************************
             * Descriptions...: 顯示功能選單彈窗
             * Usage..........: showMoreFeatures(buttons,resolve)
             * Input parameter: buttons      Button清單
             *                : resolve      資料確認後的處理
             * Return code....:
             * Modify.........: 20170314 By ZHEN
             ***********************************************************************************************************************/
            "showMoreFeatures": function (buttons, resolve) {
               var moreFeatures = $ionicActionSheet.show({
                  "titleText": $scope.langs.more_features, //功能選擇
                  "buttons": buttons,
                  "buttonClicked": function (index) {
                     return resolve(index)
                  },

                  //關閉功能清單
                  "cancelText": $scope.langs.cancel, //取消
                  "cancel": function () {

                  }
               })

               $timeout(function () {
                  var screenHeight = document.documentElement.clientHeight - 50
                  var Height = screenHeight + "px"
                  var subHeight = (screenHeight - 50) + "px"
                  $("div.action-sheet").css("max-height", Height)
                  $("div.action-sheet-group.action-sheet-options")
                     .css("overflow-y", "scroll")
                     .css("max-height", subHeight)
               }, 0)
            }
         }
      }
   ])
   app.directive("onFinishRender", function ($timeout) {
      return {
         "restrict": "A",
         "link": function (scope, element, attr) {
            $timeout(function () {
               scope.$emit(attr.onFinishRender, scope.$index)
            })
         }
      }
   })
})
