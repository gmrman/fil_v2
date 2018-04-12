define(["API", "APIS", "ionic-popup", "AppLang", "Directives", "ReqTestData", "commonService", "views/app/kb_01/kb_01_s01/view.js", "commonFormat"], function () {
   return ["$stateParams", "$scope", "$state", "$filter", "$ionicLoading", "IonicPopupService", "APIService", "APIBridge", "$timeout", "AppLang", "ReqTestData", "commonService", "userInfoService", "commonFormat",
      function ($stateParams, $scope, $state, $filter, $ionicLoading, IonicPopupService, APIService, APIBridge, $timeout, AppLang, ReqTestData, commonService, userInfoService, commonFormat) {
         $scope.langs = AppLang.langs
         $scope.userInfo = userInfoService.getUserInfo()
         $scope.page_params = commonService.get_page_params()
         
         //切換頁面Title
         userInfoService.changeTitle($scope.page_params.name)

         //==================== 內部呼叫 Function ====================(S)
         var server_product = $scope.userInfo.server_product  //當前系統
            
         //init變數
         function page_init() {
            $scope.zoom = {
               "barCtrl_01": false,
               "barCtrl_02": false,
               "barCtrl_03": false,
               "barCtrl_04": false,
               "barCtrl_05": false,
               "barCtrl_06": false,
               "barCtrl_07": false,
               "barCtrl_08": false,
               "barCtrl_09": false,
               "barCtrl_10": false,
               "barCtrl_11": false,
               "barCtrl_12": false,
               "barCtrl_13": false,
               "barCtrl_14": false,
               "barCtrl_15": false,
               "barCtrl_16": false
            }

            //系統限制設定
            switch (server_product) {
               case "WF":
                  break

               default:
                  break
            }
         }
         //==================== 內部呼叫 Function ====================(E)

         $scope.changeEnd = false //圖表更新結束
         $scope.onComplete = 0 //onComplete事件呼叫次數
         Chart.defaults.global.animation.onComplete = function (animation) {
            if ($scope.changeEnd) {
               return
            }

            $scope.onComplete--
            if ($scope.onComplete === 0) { //圖表皆呼叫完畢，便隱藏Loading圖標
               $scope.changeEnd = !$scope.changeEnd
               $ionicLoading.hide()
               console.log("Loading hide!")
            }
         }

         $scope.getDateLabel = function (type, labels) {
            var dateList = [], newData = ""

            for (var i = 0, len = labels.length; i < len; i++) {
               var date = new Date(labels[i])
               var year = date.getFullYear(),
                  month = date.getMonth() + 1,
                  day = date.getDate()

               switch (type) {
                  case "year": //年度
                     newData = year + "/" + month + "月"
                     break

                  case "month": //月份
                     newData = month + "/" + day + "日"
                     break

                  case "last": //期間
                     newData = year + "/" + month + "/" + day + "日"
                     break
               }
               dateList.push(newData)
            }
            return dateList
         }

         //圖表是否縮放
         $scope.setZoom = function (barCtrl) {
            $scope.zoom[barCtrl] = !$scope.zoom[barCtrl]
         }

         function itemConvert(items) {
            var temp = ""
            angular.forEach(items, function (item) {

               temp += item ? "Y" : "N"
            })

            if (temp.length < 16) {
               for (var i = temp.length; i < 16; i++) {
                  temp += "N"
               }
            }
            return temp
         }

         //從WS讀取資料
         function getShowChart() {
            $ionicLoading.show()
            var webTran = {
               "service": "app.km.receipt.kb.get",
               "parameter": {
                  "date": commonFormat.getCurrent("date"),
                  "showme": itemConvert($scope.tmp_showme)
               }
            }
            console.log(webTran)

            if (ReqTestData.testData) {
               $scope.dataList = dataConversion(ReqTestData.getAppDataList())
               $scope.showme = angular.copy($scope.tmp_showme)

               //呼叫圖表更新資料
               $timeout(function () {
                  $scope.$broadcast("changeData", $scope.dataList, $scope.tmp_showme)
               }, 100)
            } else {
               $scope.showme = angular.copy($scope.tmp_showme)

               APIService.Web_Post(webTran, function (res) {
                  console.log("success:" + res)
                  var parameter = res.payload.std_data.parameter
                  if (!!parameter) {
                     $scope.dataList = dataConversion(parameter)

                     //呼叫圖表更新資料
                     $timeout(function () {
                        $scope.$broadcast("changeData", $scope.dataList, $scope.tmp_showme)
                     }, 100)
                  }
                  else {
                     $ionicLoading.hide()
                     console.log("未回傳資料")
                  }
               }, function (error) {
                  //顯示錯誤訊息
                  $ionicLoading.hide()
                  var execution = error.payload.std_data.execution
                  console.log("error:" + execution.description)
                  IonicPopupService.errorAlert(execution.description)
               })
            }
         }

         //分組取出各圖表資料
         function dataConversion(parameter) {
            var barCtrl_01 = takeOut(parameter["types_1"], "1")   //年度收貨項目/金額表 
            var barCtrl_02 = takeOut(parameter["types_2"], "1")   //年度QC項目/金額表
            var barCtrl_03 = takeOut(parameter["types_3"], "1")   //年度入庫項目/金額表
            var barCtrl_04 = takeOut(parameter["types_4"], "1")   //期別收貨項目/金額表
            var barCtrl_05 = takeOut(parameter["types_5"], "1")   //期別QC項目/金額表
            var barCtrl_06 = takeOut(parameter["types_6"], "1")   //期別入庫項目/金額表
            var barCtrl_07 = takeOut(parameter["types_7"], "1")   //月份收貨項目/金額表
            var barCtrl_08 = takeOut(parameter["types_8"], "1")   //月份QC項目/金額表
            var barCtrl_09 = takeOut(parameter["types_9"], "1")   //月份入庫項目/金額表
            var barCtrl_10 = takeOut(parameter["types_10"], "1")  //期間收貨項目/金額表
            var barCtrl_11 = takeOut(parameter["types_11"], "1")  //期間QC項目/金額表
            var barCtrl_12 = takeOut(parameter["types_12"], "1")  //期間入庫項目/金額表
            var barCtrl_13 = takeOut(parameter["types_13"], "2")  //月份未完成處理表
            var barCtrl_14 = takeOut(parameter["types_14"], "2")  //期間未完成處理表
            var barCtrl_15 = takeOut(parameter["types_15"], "2")  //月份逾期未交表
            var barCtrl_16 = takeOut(parameter["types_16"], "2")  //期間逾期未交表

            return {
               "barCtrl_01": barCtrl_01,
               "barCtrl_02": barCtrl_02,
               "barCtrl_03": barCtrl_03,
               "barCtrl_04": barCtrl_04,
               "barCtrl_05": barCtrl_05,
               "barCtrl_06": barCtrl_06,
               "barCtrl_07": barCtrl_07,
               "barCtrl_08": barCtrl_08,
               "barCtrl_09": barCtrl_09,
               "barCtrl_10": barCtrl_10,
               "barCtrl_11": barCtrl_11,
               "barCtrl_12": barCtrl_12,
               "barCtrl_13": barCtrl_13,
               "barCtrl_14": barCtrl_14,
               "barCtrl_15": barCtrl_15,
               "barCtrl_16": barCtrl_16
            }
         }

         //將圖表資料取出
         function takeOut(barCtrl, type) {
            var peroid = [], data = [], amount = 0, qty = 0,
               forcast_amount = [], actual_amount = [],
               forcast_qty = [], actual_qty = []

            angular.forEach(barCtrl, function (value, key) {
               peroid.push(value.peroid)

               amount = (typeof (value.forcast_amount) == "number") ? value.forcast_amount : 0
               forcast_amount.push(amount)

               amount = (typeof (value.actual_amount) == "number") ? value.actual_amount : 0
               actual_amount.push(amount)

               qty = (typeof (value.forcast_qty) == "number") ? value.forcast_qty : 0
               forcast_qty.push(qty)

               qty = (typeof (value.actual_qty) == "number") ? value.actual_qty : 0
               actual_qty.push(qty)
            })

            switch (type) {
               case "1":
                  data.push(forcast_amount, actual_amount, forcast_qty, actual_qty)
                  break

               case "2":
                  data.push(actual_amount, actual_qty)
                  break

               default:
                  data.push(forcast_amount, actual_amount, forcast_qty, actual_qty)
            }

            return {
               "label": peroid,
               "data": data
            }
         }

         $scope.goToMenu = function () {
            var page = "fil_00_s04"
            $state.go(page)
         }

         $scope.goViewSetting = function () {
            $state.go("kb_01_s02")
         }

         //==================== 外部呼叫 Function ====================(S)
         //==================== 外部呼叫 Function ====================(E)


         //==================== 呼叫 BDL 元件 ====================(S)

         //取得設定值
         function getShowSetting() {
            var parameter = {
               "ent": userInfoService.userInfo.enterprise_no,
               "site": userInfoService.userInfo.site_no
            }

            $ionicLoading.show()
            var showme = [true]

            if (commonService.Platform == "Chrome") {
               $ionicLoading.hide()
               showme = ReqTestData.getAppShowme()

               //系統限制設定
               switch (server_product) {
                  case "WF":
                     showme[1] = false
                     showme[2] = false
                     showme[4] = false
                     showme[5] = false
                     showme[7] = false
                     showme[8] = false
                     showme[10] = false
                     showme[11] = false
                     break

                  default:
                     break
               }
               $scope.tmp_showme = angular.copy(showme)
               $scope.onComplete = ($scope.tmp_showme.filter(function (item) {
                  return item
               })).length

               $timeout(function () {
                  getShowChart()
               }, 0)
            } else {
               APIBridge.callAPI("kb_01_get_show_chart_setting", [parameter]).then(function (result) {
                  $ionicLoading.hide()
                  if (result.data[0].showme) {
                     console.log(result)
                     for (var i = result.data[0].showme.length - 1; i >= 0; i--) {
                        //將[Y][N]的資料轉換為[true][false]，以便後續使用
                        showme[i] = (result.data[0].showme.substr(i, 1) === "Y") ? true : false
                     }
                  }

                  //系統限制設定
                  switch (server_product) {
                     case "WF":
                        showme[1] = false
                        showme[2] = false
                        showme[4] = false
                        showme[5] = false
                        showme[7] = false
                        showme[8] = false
                        showme[10] = false
                        showme[11] = false
                        break

                     default:
                        break
                  }
                  $scope.tmp_showme = angular.copy(showme)
                  $scope.onComplete = ($scope.tmp_showme.filter(function (item) {
                     return item
                  })).length

                  $timeout(function () {
                     getShowChart()
                  }, 0)
               }, function (error) {
                  $ionicLoading.hide()

                  $scope.tmp_showme = angular.copy(showme)
                  $scope.onComplete = ($scope.tmp_showme.filter(function (item) {
                     return item
                  })).length

                  $timeout(function () {
                     getShowChart()
                  }, 0)
               })
            }
         }

         //==================== 呼叫 BDL 元件 ====================(E)

         //初始化變數
         page_init()

         //取得設定值
         getShowSetting()
      }
   ]
})
