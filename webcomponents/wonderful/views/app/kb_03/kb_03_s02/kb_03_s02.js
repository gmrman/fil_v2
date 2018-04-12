define(["API", "APIS", "ionic-popup", "AppLang", "Directives", "ReqTestData", "commonService", "views/app/kb_03/kb_03_s01/js/PopupService.js"], function () {
   return ["userInfoService", "$state", "$stateParams", "$scope", "kb_03_PopupService", "$ionicLoading", "$ionicPopup", "IonicClosePopupService", "IonicPopupService", "APIService", "APIBridge", "$timeout", "AppLang", "ReqTestData", "commonService", "$ionicScrollDelegate", "$q",
      function (userInfoService, $state, $stateParams, $scope, kb_03_PopupService, $ionicLoading, $ionicPopup, IonicClosePopupService, IonicPopupService, APIService, APIBridge, $timeout, AppLang, ReqTestData, commonService, $ionicScrollDelegate, $q) {
         $scope.langs = AppLang.langs
         $scope.userInfo = userInfoService.getUserInfo()
         
         //切換頁面Title
         userInfoService.changeTitle($scope.langs.job_setting)
         

         //==================== 內部呼叫 Function ====================(S)
         var server_product = userInfoService.userInfo.server_product  //當前系統
            
         //init變數
         function page_init() {
            $scope.warehouseList = []   //倉庫清單
            $scope.singleList = []   //單別清單

            //畫面顯示
            //$scope.diplay = {
            //    source: false
            //};

            ////來源設定
            //$scope.source = [
            //    {
            //        name: $scope.langs.receipt + $scope.langs.genre,
            //        value: "0"
            //    },
            //    {
            //        name: $scope.langs.warehouse,
            //        value: "1"
            //    }
            //];

            //單據類型
            $scope.deal_with_out = [
               {
                  "type": "A01",
                  "name": $scope.langs.delivery,
                  "value": false
               },
               {
                  "type": "A02",
                  "name": $scope.langs.picking_material,
                  "value": false
               },
               {
                  "type": "A03",
                  "name": $scope.langs.miscellaneous,
                  "value": false
               },
               {
                  "type": "A04",
                  "name": $scope.langs.warehouse_back,
                  "value": false
               }
            ]

            //設定值
            $scope.setting = {
               //source: "",
               //source_name: "",
               "A01": true,
               "A02": true,
               "A03": true,
               "A04": true,
               "warehouses": "",
               "singles": ""
            }

            //系統限制設定
            switch (server_product) {
               case "WF":
                  $scope.receiptGenre = false   //單據類型顯示

                  break

               default:
                  $scope.receiptGenre = true   //單據類型顯示
                  break
            }
         }

         function getSingle() {
            var doc_type = (($scope.setting.A01) ? "Y" : "N") +
                    (($scope.setting.A02) ? "Y" : "N") +
                    (($scope.setting.A03) ? "Y" : "N") +
                    (($scope.setting.A04) ? "Y" : "N")

            var webTran = {
               "service": "app.km.oh.stkout.doclist.get",
               "parameter": {
                  "site_no": userInfoService.userInfo.site_no,
                  "doc_type": doc_type,
                  "store_cond": $scope.setting.warehouses
               }
            }

            $ionicLoading.show()
            if (ReqTestData.testData) {
               $ionicLoading.hide()
               $scope.sel_Single = ReqTestData.getSingle()
            }
            else {
               var singleJob = $q.defer()
               var singlePromise = singleJob.promise  // 返回 Promise

               APIService.Web_Post(webTran, function (res) {
                  $ionicLoading.hide()
                  console.log("success:" + res)
                  var parameter = res.payload.std_data.parameter

                  $timeout(function () {
                     $scope.sel_Single = parameter.doclist

                     singleJob.resolve()
                  }, 0)
               }, function (error) {
                  $ionicLoading.hide()
                  var execution = error.payload.std_data.execution
                  console.log("error:" + execution.description)
                  IonicPopupService.errorAlert(execution.description)

                  singleJob.reject()
               })

               return singlePromise
            }
         }

         //顯示訊息
         function alertMsg(title, msg) {
            var alertPopup = $ionicPopup.alert({
               "title": title,
               "template": "<p style='text-align: center'>" + msg + "</p>",
               "okText": AppLang.langs.confirm,
               "okType": "lightblue"
            })
            IonicClosePopupService.register(false, alertPopup)

            return alertPopup
         }

         function chkSource() {
            //if (!$scope.setting.source) {
            //    alertMsg($scope.langs.point, $scope.langs.error.MD004);
            //    return false;
            //}

            if (!$scope.setting.A01 && !$scope.setting.A02 && !$scope.setting.A03 && !$scope.setting.A04) {
               alertMsg($scope.langs.point, $scope.langs.error.MD002)
               return false
            }

            //if (!$scope.setting.warehouses) {
            //    alertMsg($scope.langs.point, $scope.langs.error.MD003);
            //    return false;
            //};

            //if (!$scope.setting.A01 && !$scope.setting.A02 &&
            //    !$scope.setting.A03 && !$scope.setting.A04 &&
            //    !$scope.setting.warehouses) {

            //    //MD015-請先設置單據類型或倉庫!
            //    alertMsg($scope.langs.point, $scope.langs.error.MD015);
            //    return false;
            //};

            return true
         }

         //==================== 內部呼叫 Function ====================(E)


         //==================== 外部呼叫 Function ====================(S)

         //$scope.setValue = function (item) {
         //    $scope.setting.source_name = item.name;

         //    if (item.value == '0') {
         //        $scope.setting.warehouses = "";
         //        $scope.warehouseList = [];   //倉庫清單
         //    }

         //    if (item.value == '1') {
         //        $scope.setting.A01 = "";
         //        $scope.setting.A02 = "";
         //        $scope.setting.A03 = "";
         //        $scope.setting.A04 = "";
         //    }

         //    $scope.setting.singles = "";
         //    $scope.singleList = [];   //單別清單
         //    $scope.diplay.source = false;
         //};

         //倉庫開窗
         $scope.warehouseShow = function () {
            kb_03_PopupService.showWarehouseModal(angular.copy(userInfoService.warehouse), $scope.warehouseList, $scope.setWarehouse, function () { })
         }

         //設置選取結果顯示
         $scope.setWarehouse = function (warehouse) {
            var checked = warehouse.filter(function (item) {
               return item.checked
            })
            $scope.setting.warehouses = ""
            $scope.warehouseList = []

            angular.forEach(checked, function (item) {
               if ($scope.setting.warehouses == "") {
                  $scope.setting.warehouses = item.warehouse_no
               } else {
                  $scope.setting.warehouses += (";" + item.warehouse_no)
               }

               $scope.warehouseList.push({ "warehouse": item.warehouse_no })
            })
         }

         //單別開窗
         $scope.singleShow = function () {
            if (chkSource()) {
               if (ReqTestData.testData) {
                  //取得單別資料
                  getSingle()
                  kb_03_PopupService.showSingleModal(angular.copy($scope.sel_Single), $scope.singleList, $scope.setSingle, function () { })
               }
               else {
                  getSingle().then(function () {
                     kb_03_PopupService.showSingleModal(angular.copy($scope.sel_Single), $scope.singleList, $scope.setSingle, function () { })
                  })
               }
            }
         }

         $scope.setSingle = function (single) {
            var checked = single.filter(function (item) {
               return item.checked
            })
            $scope.setting.singles = ""
            $scope.singleList = []

            angular.forEach(checked, function (item) {
               if ($scope.setting.singles == "") {
                  $scope.setting.singles = item.doc
               } else {
                  $scope.setting.singles += (";" + item.doc)
               }

               $scope.singleList.push({ "single": item.doc })
            })
         }

         $scope.chkSetting = function () {
            if (!$scope.setting.A01 && !$scope.setting.A02 &&
                    !$scope.setting.A03 && !$scope.setting.A04) {

               //MD002-請先設置單據類型!
               alertMsg($scope.langs.point, $scope.langs.error.MD002)
               return
            }

            setShowSetting()
         }

         //==================== 外部呼叫 Function ====================(E)


         //==================== 呼叫 BDL 元件 ====================(S)

         //儲存設定
         function setShowSetting() {
            var setting = {
               "ent": userInfoService.userInfo.enterprise_no,
               "site": userInfoService.userInfo.site_no,
               //source: $scope.setting.source,
               "A01": $scope.setting.A01,
               "A02": $scope.setting.A02,
               "A03": $scope.setting.A03,
               "A04": $scope.setting.A04
            }

            var parameter = {
               "setting": setting,
               "warehouse": $scope.warehouseList,
               "single": $scope.singleList
            }

            $ionicLoading.show()
            if (commonService.Platform == "Chrome") {
               $ionicLoading.hide()
               $state.go("kb_03_s01")
            }
            else {
               APIBridge.callAPI("kb_03_upd_setting", [parameter]).then(function (result) {
                  $ionicLoading.hide()
                  $state.go("kb_03_s01")
               }, function (error) {
                  $ionicLoading.hide()
                  IonicPopupService.errorAlert("kb_03_upd_setting fail")
                  console.log(error)
               })
            }
         }

         //取得設定資料
         function getSetting() {
            var parameter = {
               "ent": userInfoService.userInfo.enterprise_no,
               "site": userInfoService.userInfo.site_no
            }

            if (commonService.Platform == "Chrome") {
               //
            }
            else {
               $ionicLoading.show()
               APIBridge.callAPI("kb_03_get_setting", [parameter]).then(function (result) {
                  $ionicLoading.hide()

                  if (result.data[0].cnt > 0) {
                     //var source = $scope.source.find(function (item) {
                     //    return (item.value == result.data[0].setting.source);
                     //});

                     $scope.setting = {
                        //source: result.data[0].setting.source,
                        //source_name: source.name,
                        "A01": result.data[0].setting.A01,
                        "A02": result.data[0].setting.A02,
                        "A03": result.data[0].setting.A03,
                        "A04": result.data[0].setting.A04,
                        "warehouses": "",
                        "singles": ""
                     }

                     $scope.warehouseList = result.data[0].warehouse
                     angular.forEach($scope.warehouseList, function (item) {
                        if ($scope.setting.warehouses == "") {
                           $scope.setting.warehouses = item.warehouse
                        } else {
                           $scope.setting.warehouses += (";" + item.warehouse)
                        }
                     })

                     $scope.singleList = result.data[0].single
                     angular.forEach($scope.singleList, function (item) {
                        if ($scope.setting.singles == "") {
                           $scope.setting.singles = item.single
                        } else {
                           $scope.setting.singles += (";" + item.single)
                        }
                     })
                  }
               }, function (error) {
                  $ionicLoading.hide()
                  IonicPopupService.errorAlert("kb_03_get_setting fail")
                  console.log(error)
               })
            }
         }

         //==================== 呼叫 BDL 元件 ====================(E)


         //初始化變數
         page_init()

         //取得設定資料
         getSetting()
      }
   ]
})
