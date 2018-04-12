define(["API", "APIS", "ionic-popup", "AppLang", "Directives", "ReqTestData", "commonService"], function () {
   return ["$state", "$stateParams", "$scope", "$ionicLoading", "IonicPopupService", "APIService", "APIBridge",
      "$timeout", "AppLang", "ReqTestData", "commonService", "userInfoService", "$filter",
      function ($state, $stateParams, $scope, $ionicLoading, IonicPopupService, APIService, APIBridge,
         $timeout, AppLang, ReqTestData, commonService, userInfoService, $filter) {
         $scope.langs = AppLang.langs
         $scope.userInfo = userInfoService.getUserInfo()

         //==================== 內部呼叫 Function ====================(S)
         var server_product = userInfoService.userInfo.server_product  //當前系統

         //init變數
         function page_init() {
            $scope.isAllSelected = false
            $scope.items = []

            var barCtrl_01 = $filter("langFilter")($scope.userInfo.language, [$scope.langs.year, $scope.langs.receiveing, $scope.langs.project], "/", $scope.langs.moneyTable)
            var barCtrl_02 = $filter("langFilter")($scope.userInfo.language, [$scope.langs.year, "QC", $scope.langs.project], "/", $scope.langs.moneyTable)
            var barCtrl_03 = $filter("langFilter")($scope.userInfo.language, [$scope.langs.year, $scope.langs.put_in_storage, $scope.langs.project], "/", $scope.langs.moneyTable)

            var barCtrl_04 = $filter("langFilter")($scope.userInfo.language, [$scope.langs.periodic, $scope.langs.receiveing, $scope.langs.project], "/", $scope.langs.moneyTable)
            var barCtrl_05 = $filter("langFilter")($scope.userInfo.language, [$scope.langs.periodic, "QC", $scope.langs.project], "/", $scope.langs.moneyTable)
            var barCtrl_06 = $filter("langFilter")($scope.userInfo.language, [$scope.langs.periodic, $scope.langs.put_in_storage, $scope.langs.project], "/", $scope.langs.moneyTable)

            var barCtrl_07 = $filter("langFilter")($scope.userInfo.language, [$scope.langs.month, $scope.langs.receiveing, $scope.langs.project], "/", $scope.langs.moneyTable)
            var barCtrl_08 = $filter("langFilter")($scope.userInfo.language, [$scope.langs.month, "QC", $scope.langs.project], "/", $scope.langs.moneyTable)
            var barCtrl_09 = $filter("langFilter")($scope.userInfo.language, [$scope.langs.month, $scope.langs.put_in_storage, $scope.langs.project], "/", $scope.langs.moneyTable)

            var barCtrl_10 = $filter("langFilter")($scope.userInfo.language, [$scope.langs.last, $scope.langs.receiveing, $scope.langs.project], "/", $scope.langs.moneyTable)
            var barCtrl_11 = $filter("langFilter")($scope.userInfo.language, [$scope.langs.last, "QC", $scope.langs.project], "/", $scope.langs.moneyTable)
            var barCtrl_12 = $filter("langFilter")($scope.userInfo.language, [$scope.langs.last, $scope.langs.put_in_storage, $scope.langs.project], "/", $scope.langs.moneyTable)

            $scope.itemList = [{
               "id": "01",
               "name": barCtrl_01,
               "disabled": false,
               "showme": true
            },
            {
               "id": "02",
               "name": barCtrl_02,
               "disabled": false,
               "showme": false
            },
            {
               "id": "03",
               "name": barCtrl_03,
               "disabled": false,
               "showme": false
            },
            {
               "id": "04",
               "name": barCtrl_04,
               "disabled": false,
               "showme": false
            },
            {
               "id": "05",
               "name": barCtrl_05,
               "disabled": false,
               "showme": false
            },
            {
               "id": "06",
               "name": barCtrl_06,
               "disabled": false,
               "showme": false
            },
            {
               "id": "07",
               "name": barCtrl_07,
               "disabled": false,
               "showme": false
            },
            {
               "id": "08",
               "name": barCtrl_08,
               "disabled": false,
               "showme": false
            },
            {
               "id": "09",
               "name": barCtrl_09,
               "disabled": false,
               "showme": false
            },
            {
               "id": "10",
               "name": barCtrl_10,
               "disabled": false,
               "showme": false
            },
            {
               "id": "11",
               "name": barCtrl_11,
               "disabled": false,
               "showme": false
            },
            {
               "id": "12",
               "name": barCtrl_12,
               "disabled": false,
               "showme": false
            },
            {
               "id": "13",
               "name": $scope.langs.barCtrl_13,
               "disabled": false,
               "showme": false
            },
            {
               "id": "14",
               "name": $scope.langs.barCtrl_14,
               "disabled": false,
               "showme": false
            },
            {
               "id": "15",
               "name": $scope.langs.barCtrl_15,
               "disabled": false,
               "showme": false
            },
            {
               "id": "16",
               "name": $scope.langs.barCtrl_16,
               "disabled": false,
               "showme": false
            }]
         }

         function closeItemShow() {
            $scope.itemList[1].showme = false
            $scope.itemList[2].showme = false
            $scope.itemList[4].showme = false
            $scope.itemList[5].showme = false
            $scope.itemList[7].showme = false
            $scope.itemList[8].showme = false
            $scope.itemList[10].showme = false
            $scope.itemList[11].showme = false

            $scope.itemList[1].disabled = true
            $scope.itemList[2].disabled = true
            $scope.itemList[4].disabled = true
            $scope.itemList[5].disabled = true
            $scope.itemList[7].disabled = true
            $scope.itemList[8].disabled = true
            $scope.itemList[10].disabled = true
            $scope.itemList[11].disabled = true
         }

         //==================== 內部呼叫 Function ====================(E)

         function getShowSetting() {
            var parameter = {
               "ent": userInfoService.userInfo.enterprise_no,
               "site": userInfoService.userInfo.site_no
            }

            $ionicLoading.show()
            if (commonService.Platform == "Chrome") {
               $ionicLoading.hide()

               var items = ReqTestData.getAppShowme()
               for (var i = items.length - 1; i >= 0; i--) {
                  $scope.itemList[i].showme = items[i]
               }

               //系統限制設定
               switch (server_product) {
                  case "WF":
                     closeItemShow()
                     break

                  default:
                     break
               }

               $scope.items = angular.copy($scope.itemList)

               //設定中不存在"不顯示"的項目，[全選/全不選]打勾
               var index = $scope.items.findIndex(function (item) {
                  return (!item.showme)
               }) //$scope.items.findIndex(item => (!item.showme))
               if (index === -1) {
                  $scope.isAllSelected = !$scope.isAllSelected
               }
            } else {
               APIBridge.callAPI("kb_01_get_show_chart_setting", [parameter]).then(function (result) {
                  $ionicLoading.hide()
                  if (result.data[0].showme) {
                     for (var i = result.data[0].showme.length - 1; i >= 0; i--) {
                        $scope.itemList[i].showme = (result.data[0].showme.substr(i, 1) === "Y") ? true : false
                     }
                  }

                  //系統限制設定
                  switch (server_product) {
                     case "WF":
                        closeItemShow()
                        break

                     default:
                        break
                  }

                  $scope.items = angular.copy($scope.itemList)

                  //設定中不存在"不顯示"的項目，[全選/全不選]打勾
                  var index = $scope.items.findIndex(function (item) {
                     return (!item.showme)
                  }) //$scope.items.findIndex(item => (!item.showme))
                  if (index === -1) {
                     $scope.isAllSelected = !$scope.isAllSelected
                  }
               }, function (error) {
                  $ionicLoading.hide()
                  IonicPopupService.errorAlert("kb_01_get_show_chart_setting fail")
                  $scope.items = angular.copy($scope.itemList)
                  console.log(error)
               })
            }
         }

         $scope.selectAll = function (isAllSelected) {
            angular.forEach($scope.items, function (item) {
               item.showme = isAllSelected
            })
         }

         function itemConvert(items) {
            var temp = ""
            angular.forEach(items, function (item) {

               temp += item.showme ? "Y" : "N"
            })
            return temp
         }

         $scope.chkSetting = function () {
            //檢查至少勾選一個顯示項目！
            var index = $scope.items.findIndex(function (item) {
               return item.showme
            }) //$scope.items.findIndex(item => (item.showme))

            if (index !== -1) {
               var showme = itemConvert($scope.items)
               $scope.setShowSetting(showme)
            } else {
               IonicPopupService.errorAlert($scope.langs.error.MD001)
            }
         }

         $scope.setShowSetting = function (showme) {
            var parameter = {
               "ent": userInfoService.userInfo.enterprise_no,
               "site": userInfoService.userInfo.site_no,
               "showme": showme
            }

            $ionicLoading.show()
            if (commonService.Platform == "Chrome") {
               $ionicLoading.hide()
               $state.go("kb_01_s01")
            }
            else {
               APIBridge.callAPI("kb_01_capp_receipt_kb_t_create", [parameter]).then(function (result) {
                  $ionicLoading.hide()
                  $state.go("kb_01_s01")
               }, function (error) {
                  $ionicLoading.hide()
                  IonicPopupService.errorAlert("kb_01_capp_receipt_kb_t_create fail")
                  console.log(error)
               })
            }
         }


         //init變數
         page_init()

         //取得設定
         getShowSetting()
      }
   ]
})
