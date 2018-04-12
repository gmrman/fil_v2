define(["API", "APIS", "ionic-popup", "AppLang", "Directives", "ReqTestData", "commonService", "views/app/kb_01/kb_01_s01/view.js"], function () {
   return ["$state", "$stateParams", "$scope", "$ionicLoading", "IonicPopupService", "APIService", "APIBridge", "$timeout", "AppLang", "ReqTestData", "commonService", "userInfoService",
      function ($state, $stateParams, $scope, $ionicLoading, IonicPopupService, APIService, APIBridge, $timeout, AppLang, ReqTestData, commonService, userInfoService) {
         $scope.langs = AppLang.langs
         $scope.userInfo = userInfoService.getUserInfo()

         $scope.setting = {
            "limited": "0",
            "amount": "",
            "orderBy": "0",
            "showNumType": 20,
            "showNum": 1
         }
         $scope.dataList = []

         $scope.getdataList = function () {
            var dataList = []
            var pageList = []

            //筆數
            if ($scope.setting.limited == "0") {
               dataList = [{
                  "name": "20 " + $scope.langs.quantity,
                  "value": 20,
               }, {
                  "name": "50 " + $scope.langs.quantity,
                  "value": 50,
               }, {
                  "name": "100 " + $scope.langs.quantity,
                  "value": 100,
               }, {
                  "name": "150 " + $scope.langs.quantity,
                  "value": 150,
               }]
               $scope.setting.amount = $scope.setting.amount || dataList[1].value
            }

            //天數
            if ($scope.setting.limited == "1") {
               dataList = [{
                  "name": "1 " + $scope.langs.day,
                  "value": 1,
               }, {
                  "name": "3 " + $scope.langs.day,
                  "value": 3,
               }, {
                  "name": "5 " + $scope.langs.day,
                  "value": 5,
               }, {
                  "name": "10 " + $scope.langs.day,
                  "value": 10,
               }]
               $scope.setting.amount = $scope.setting.amount || dataList[1].value
            }

            for (var index = 0; index < 10; index++) {
               var num = (index + 1) * 10
               pageList.push({
                  "name": num + " " + $scope.langs.quantity,
                  "value": num
               })
            }
            pageList.push({
               "name": $scope.langs.customize,  //自訂義
               "value": Infinity
            })

            $scope.dataList = dataList
            $scope.pageList = pageList
         }
         $scope.getdataList()

         //取得排序資料
         function getSetting() {
            var parameter = {
               "ent": userInfoService.userInfo.enterprise_no,
               "site": userInfoService.userInfo.site_no
            }

            $ionicLoading.show()
            if (commonService.Platform == "Chrome") {
               $ionicLoading.hide()
            }
            else {
               APIBridge.callAPI("kb_02_get_setting", [parameter]).then(function (result) {
                  $ionicLoading.hide()

                  if (result.data[0].cnt > 0) {
                     $scope.setting = result.data[0].setting
                     if ($scope.setting.showNumType == null) {
                        $scope.setting.showNumType = Infinity
                     }

                     $scope.getdataList()
                  }
               }, function (error) {
                  $ionicLoading.hide()
                  IonicPopupService.errorAlert("kb_02_get_setting fail")
                  console.log(error)
               })
            }
         }
         getSetting()

         $scope.defShowNum = function () {
            $scope.setting.showNum = 1
         }

         $scope.mins = function (setting, min) {
            if (setting.showNum - 1 < min) {
               return
            }

            setting.showNum += -1
         }

         $scope.add = function (setting, max) {
            if (setting.showNum + 1 > max) {
               return
            }

            setting.showNum += 1
         }

         var chkValue_back = 1
         $scope.chkShowNum = function (setting, errObj) {
            switch (true) {
               case (errObj.min):
                  setting.showNum = 1
                  break

               case (errObj.max):
                  setting.showNum = 1000
                  break

               case (errObj.number):
                  setting.showNum = chkValue_back
                  break

               default:
                  if (!setting.showNum) {
                     setting.showNum = 1
                  }
                  break
            }

            chkValue_back = setting.showNum
         }

         $scope.chkSetting = function () {
            $scope.setSetting()
         }

         $scope.backView = function () {
            $state.go("kb_02_s01")
         }

         $scope.setSetting = function () {
            var parameter = {
               "ent": userInfoService.userInfo.enterprise_no,
               "site": userInfoService.userInfo.site_no,
               "limited": $scope.setting.limited,
               "amount": $scope.setting.amount,
               "orderBy": $scope.setting.orderBy,
               "showNumType":$scope.setting.showNumType,
               "showNum": $scope.setting.showNum
            }

            $ionicLoading.show()
            if (commonService.Platform == "Chrome") {
               $ionicLoading.hide()
               $state.go("kb_02_s01")
            }
            else {
               APIBridge.callAPI("kb_02_upd_setting", [parameter]).then(function (result) {
                  $ionicLoading.hide()
                  $state.go("kb_02_s01")
               }, function (error) {
                  $ionicLoading.hide()
                  IonicPopupService.errorAlert("kb_02_upd_setting fail")
                  console.log(error)
               })
            }
         }
      }
   ]
})
