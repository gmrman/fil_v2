define(["app", "API", "APIS", "ionic-popup"], function (app) {
   app.factory("kb_02_PopupService", ["APIService", "AppLang", "$rootScope", "$timeout", "$filter", "$ionicLoading", "$ionicPopup", "IonicClosePopupService", "IonicPopupService", "$ionicModal", "$ionicActionSheet", "userInfoService",
      function (APIService, AppLang, $rootScope, $timeout, $filter, $ionicLoading, $ionicPopup, IonicClosePopupService, IonicPopupService, $ionicModal, $ionicActionSheet, userInfoService) {
         var parent = $rootScope
         var $scope = parent.$new()
         $scope.langs = AppLang.langs
         $scope.getUserInfo = function () {
            $scope.userInfo = userInfoService.getUserInfo()
         }
         $scope.isAllSelected = false
         $scope.filterItem = function (ItemList, search) {
            return $filter("filter")(ItemList, search)
         }

         return {
            /***********************************************************************************************************************
             * Descriptions...: 顯示廠商彈窗
             * Usage..........: showManufacturersModal(manufacturers, resolve, reject)
             * Input parameter: manufacturers            廠商ARRAY
             *                : resolve                  資料確認後的處理
             *                : reject                   彈窗關閉後的處理
             * Return code....: manufacturers            廠商OBJECT
             * Modify.........: 20170314 By ZHEN
             ***********************************************************************************************************************/
            "showManufacturersModal": function (manufacturers, resolve, reject) {
               $scope.getUserInfo()

               $scope.manufacturers = manufacturers
               $scope.popSelected = {
                  "search": "",
                  "isAllSelected": false
               }

               var colorList = {
                  "G": "#44DB51",
                  "Y": "#FFCD00",
                  "R": "#FF2850",
                  "N": "#6D6D72"
               }

               $scope.setFontColor = function (color) {
                  var fontColor = "#6D6D72"
                  switch (color) {
                     case "G":
                     case "Y":
                     case "R":
                     case "N":
                        fontColor = colorList[color]
                        break
                     default:
                        break
                  }

                  return fontColor
               }

               $scope.setManufacturers = function () {
                  $scope.close()

                  return resolve($scope.filterItem($scope.manufacturers, $scope.popSelected.search))
               }

               $scope.selectAll = function () {
                  var filterItem = $scope.filterItem($scope.manufacturers, $scope.popSelected.search)
                  angular.forEach(filterItem, function (item) {
                     item.checked = $scope.popSelected.isAllSelected
                  })
               }

               $ionicModal.fromTemplateUrl("views/app/kb_02/kb_02_s01/js/manufacturersModal.html", {
                  "scope": $scope
               }).then(function (modal) {
                  $scope.close = function () {
                     reject($scope.filterItem($scope.manufacturers, $scope.popSelected.search))
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
             * Descriptions...: 顯示品號彈窗
             * Usage..........: showProductNoModal(product, resolve, reject)
             * Input parameter: product              品號ARRAY
             *                : resolve              資料確認後的處理
             *                : reject               彈窗關閉後的處理
             * Return code....: product              品號OBJECT
             * Modify.........: 20170314 By ZHEN
             ***********************************************************************************************************************/
            "showProductNoModal": function (product, resolve, reject) {
               $scope.getUserInfo()

               $scope.products = product
               $scope.popSelected = {
                  "search": "",
                  "isAllSelected": false
               }

               $scope.setProductNo = function () {
                  $scope.close()

                  return resolve($scope.filterItem($scope.products, $scope.popSelected.search))
               }

               $scope.selectAll = function () {
                  var filterItem = $scope.filterItem($scope.products, $scope.popSelected.search)
                  angular.forEach(filterItem, function (item) {
                     item.checked = $scope.popSelected.isAllSelected
                  })
               }

               $ionicModal.fromTemplateUrl("views/app/kb_02/kb_02_s01/js/productNoModal.html", {
                  "scope": $scope
               }).then(function (modal) {
                  $scope.close = function () {
                     reject($scope.filterItem($scope.products, $scope.popSelected.search))
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
                  "buttonClicked": function (index, item) {
                     return resolve(item.index)
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
               var index

               //當有排序時，禁止使用預設Index，避免匯入資料時同Index重複出現
               if (attr.defIndex === "false") {
                  if (!scope[attr.repeatName]) return
                  index = scope[attr.repeatName].index
               }
               else {
                  index = scope.$index
               }

               scope.$emit(attr.onFinishRender, index)
            }, 0)
         }
      }
   })
})
