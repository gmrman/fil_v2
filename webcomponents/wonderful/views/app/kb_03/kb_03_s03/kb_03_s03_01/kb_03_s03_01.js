define(["API", "APIS", "AppLang", "array", "Directives", "ReqTestData", "ionic-popup", "commonFactory", "commonFormat"], function () {
   return ["$rootScope", "$scope", "$state", "$stateParams", "$timeout", "$filter", "$ionicModal", "numericalAnalysisService", "AppLang", "APIService", "APIBridge", "$ionicListDelegate", "ReqTestData", "commonFactory", "$ionicScrollDelegate", "$ionicPosition", "IonicPopupService", "userInfoService", "commonFormat", "commonService", "kb_03_requisition", "$ionicLoading",
      function ($rootScope, $scope, $state, $stateParams, $timeout, $filter, $ionicModal, numericalAnalysisService, AppLang, APIService, APIBridge, $ionicListDelegate, ReqTestData, commonFactory, $ionicScrollDelegate, $ionicPosition, IonicPopupService, userInfoService, commonFormat, commonService, kb_03_requisition, $ionicLoading) {

         //==================== 內部呼叫 Function ====================(S)
         var nuberFixed = numericalAnalysisService

         function page_init() {
            $scope.langs = AppLang.langs
            $scope.userInfo = userInfoService.getUserInfo()
            $scope.page_params = commonService.get_page_params()

            //取得資訊ID yyyyMMddHHmmsssss_account            
            var l_info_id = commonService.getCurrent(2) + "_" + $scope.userInfo.account

            $scope.l_data = {
               "bcae005": $scope.page_params.in_out_no, //出入庫瑪
               "info_id": angular.copy(l_info_id),
               "has_source": true
            }

            $scope.warehouse_list = []
            $scope.warehouseList_filter = ""
         }

         function getDataList() {
            var checkDoc = kb_03_requisition.doc_array

            if (checkDoc.length > 0) {
               //依據單據類型給予代號
               switch (checkDoc[0].doc_type) {
                  case "1":   //出貨
                     $scope.l_data.bcae014 = "5"
                     $scope.l_data.bcae015 = "S"
                     $scope.l_data.mod = "AXM"
                     break

                  case "2":   //發料
                     $scope.l_data.bcae014 = "7"
                     $scope.l_data.bcae015 = "S"
                     $scope.l_data.mod = "ASF"
                     break

                  case "3":   //雜發
                     $scope.l_data.bcae014 = "11"
                     $scope.l_data.bcae015 = "S"
                     $scope.l_data.mod = "AIN"
                     break

                  case "4":   //倉退
                     $scope.l_data.bcae014 = "4"
                     $scope.l_data.bcae015 = "S"
                     $scope.l_data.mod = "APM"
                     break

                  default:
                     $scope.l_data.bcae014 = $scope.page_params.program_job_no
                     $scope.l_data.bcae015 = $scope.page_params.status   //A開立新單/S過賬/Y確認
                     $scope.l_data.mod = $scope.page_params.status
                     break
               }
               $scope.l_data.bcae006 = $scope.l_data.bcae014 + $scope.l_data.bcae015

               //設定各作業數據匯總時所顯示的標題
               switch ($scope.page_params.program_job_no) {
                  case "5":
                     $scope.inquiry_list_title_already = $scope.langs.alreadyDelivery
                     $scope.inquiry_list_title_should = $scope.langs.shouldDelivery
                     break
                  case "4":
                     $scope.inquiry_list_title_already = $scope.langs.alreadyReturn
                     $scope.inquiry_list_title_should = $scope.langs.shouldReturn
                     break
                  case "7":
                  case "11":
                     $scope.inquiry_list_title_already = $scope.langs.alreadyIssue
                     $scope.inquiry_list_title_should = $scope.langs.shouldIssue
                     break
                  default:
                     $scope.inquiry_list_title_already = $scope.langs.alreadyPutInStorage
                     $scope.inquiry_list_title_should = $scope.langs.shouldPutInStorage
               }

               //單據條件
               var search = checkDoc.reduce(function (obj_A, obj_B) {
                  if (obj_A == "") {
                     return obj_B.doc_no
                  }

                  return obj_A + ";" + obj_B.doc_no
               }, "")
               getDataDetail(checkDoc, search)
            }
         }

         function getDataDetail(checkDoc, search) {
            var service = "app.km.oh.stkout.detail.get"
            var parameter = {
               "site_no": userInfoService.userInfo.site_no,
               "doc_type": "",
               "search_cond": search
            }

            var webTran = {
               "service": service,
               "parameter": parameter
            }

            var doc_key = search.split(";")

            $ionicLoading.show()
            if (ReqTestData.testData) {
               $ionicLoading.hide()

               var doc_array = []

               for (var i = 0; i < doc_key.length; i++) {
                  var length = 0
                  var selColor = ""

                  checkDoc.forEach(function (item) {
                     if (item.doc_no == doc_key[i]) {
                        selColor = item.selColor
                     }
                  }, this)

                  switch (doc_key[i]) {
                     case "2001-201707000001":
                        length = 10
                        break

                     case "2001-201707000002":
                        length = 7
                        break

                     case "2001-201707000003":
                        length = 3
                        break

                     case "2001-201707000004":
                        length = 1
                        break

                     case "2001-201707000005":
                        length = 2
                        break

                     case "2001-201707000006":
                        length = 9
                        break

                     default:
                        break
                  }

                  for (var j = 0; j < length; j++) {
                     var item = ReqTestData.getDocItem(doc_key[i], j + 1)

                     doc_array.push(
                        {
                           "selColor": selColor,
                           "doc_no": doc_key[i],
                           "doc_seq": j + 1,
                           "item_no": item.item_no,
                           "item_desc": item.item_desc,
                           "item_spec": item.item_spec,
                           "store": item.store,
                           "location": item.location,
                           "lot_no": item.lot,
                           "qty": item.qty,
                           "reference_unit_no": item.reference_unit_no,
                           "reference_qty": item.reference_qty,
                           "reference_rate": item.reference_rate,
                           "reference_decimal_places": item.reference_decimal_places,
                           "reference_decimal_places_type": item.reference_decimal_places_type,
                           "valuation_unit_no": item.valuation_unit_no,
                           "valuation_qty": item.valuation_qty,
                           "multi_unit_type": item.multi_unit_type
                        }
                     )
                  }
               }

               changeWarehouse(doc_array)
            }
            else {
               APIService.Web_Post(webTran, function (res) {
                  //資料取得成功
                  $ionicLoading.hide()
                  console.log("success:" + res)

                  var parameter = res.payload.std_data.parameter
                  var len = parameter.detaillist.length
                  for (var i = 0; i < len; i++) {
                     checkDoc.forEach(function (item) {
                        if (parameter.detaillist[i].doc_no == item.doc_no) {
                           parameter.detaillist[i].selColor = item.selColor
                        }
                     }, this)
                  }

                  changeWarehouse(parameter.detaillist)
               }, function (error) {
                  //資料取得失敗
                  $ionicLoading.hide()

                  var execution = error.payload.std_data.execution
                  console.log("error:" + execution.description)
                  IonicPopupService.errorAlert(execution.description)
               })
            }
         }

         //更新倉儲資訊
         function changeWarehouse(detaillist) {
            $scope.warehouse_list = angular.copy(detaillist).map(function (obj, index) {
               //給予資料 index 做定位
               if (obj.index === undefined) {
                  obj.index = index
               }

               //暫存單據現有數量
               if (obj.include_qty === undefined) {
                  obj.include_qty = 0
               }

               return obj
            })

            //Picker分組用
            //$scope.warehouseGroupBy = commonFormat.GroupByOut($scope.warehouse_list, "store", "location", "item_no");
            changeDocuments($scope.warehouse_list)

            //料號條件
            var search = commonFormat.dedup($scope.warehouse_list, "item_no").reduce(function (obj_A, obj_B) {
               if (obj_A == "") {
                  return obj_B.item_no
               }

               return obj_A + ";" + obj_B.item_no
            }, "")
            getLots(search)
         }

         //更新單據資料
         function changeDocuments(detaillist) {
            //清單顯示用-單據
            $scope.documentsGroupBy = commonFormat.GroupByOut(detaillist, "store", "location", "item_no", "doc_no", "doc_seq")
            var keys = Object.keys($scope.documentsGroupBy)

            $scope.documents_sum = []
            for (var i = 0, len = keys.length; i < len; i++) {
               $scope.documents_sum.push($scope.documentsGroupBy[keys[i]].reduce(function (obj_A, obj_B) {
                  return {
                     "index": i,
                     "showLot": false,        //是否顯示批號
                     "lot_cnt": 0,            //批號顯示筆數
                     "selColor": obj_B.selColor,
                     "doc_no": obj_B.doc_no,
                     "doc_seq": obj_B.doc_seq,
                     "store": obj_B.store,
                     "location": obj_B.location,
                     "lot_no": obj_B.lot_no,
                     "item_no": obj_B.item_no,
                     "item_desc": obj_B.item_desc,
                     "item_spec": obj_B.item_spec,
                     "unit": obj_B.unit_no,
                     "unit_rate": obj_B.unit_rate,
                     "qty": ((obj_A.qty || 0) + obj_B.qty) || 0,
                     "include_qty": ((obj_A.include_qty || 0) + obj_B.include_qty) || 0,
                     "reference_unit_no": obj_B.reference_unit_no,
                     "reference_qty": ((obj_A.reference_qty || 0) + obj_B.reference_qty) || 0,
                     "reference_rate": obj_B.reference_rate,
                     "reference_decimal_places": obj_B.reference_decimal_places,
                     "reference_decimal_places_type": obj_B.reference_decimal_places_type,
                     "valuation_unit_no": obj_B.valuation_unit_no,
                     "valuation_qty": ((obj_A.valuation_qty || 0) + obj_B.valuation_qty) || 0,
                     "multi_unit_type": obj_B.multi_unit_type,
                     "showMultiUnit": $scope.checkIsShowEditMultiUnit(obj_B)
                  }
               }, ""))
            }
         }

         //更新庫存資料
         function getLots(search) {
            $scope.lot_list = []

            var service = "app.km.oh.stkout.valstk.get"
            var parameter = {
               "site_no": userInfoService.userInfo.site_no,
               "item_cond": search
            }

            var webTran = {
               "service": service,
               "parameter": parameter
            }

            $ionicLoading.show()
            if (ReqTestData.testData) {
               $ionicLoading.hide()

               var doc_array = ReqTestData.getItemLot()
               changeLots(doc_array)

               $scope.warehouseGroupBy = commonFormat.GroupByOut(doc_array, "store", "location", "item_no")
               $timeout(function () {
                  //picker資料
                  $scope.warehouseList = {
                     "warehouse_location_item_no": ""
                  }
               }, 0)
            }
            else {
               APIService.Web_Post(webTran, function (res) {
                  //資料取得成功
                  $ionicLoading.hide()
                  console.log("success:" + res)

                  var parameter = res.payload.std_data.parameter
                  var list = parameter.detaillist || parameter.valstklist
                  changeLots(list)

                  $scope.warehouseGroupBy = commonFormat.GroupByOut(list, "store", "location", "item_no")
                  $timeout(function () {
                     //picker資料
                     $scope.warehouseList = {
                        "warehouse_location_item_no": ""
                     }
                  }, 0)
               }, function (error) {
                  //資料取得失敗
                  $ionicLoading.hide()

                  var execution = error.payload.std_data.execution
                  console.log("error:" + execution.description)
                  IonicPopupService.errorAlert(execution.description)
               })
            }
         }

         //更新庫存資料
         function changeLots(detaillist) {
            $scope.lot_list = angular.copy(detaillist).map(function (obj, index) {
               //給予資料 index 做定位
               if (obj.index === undefined) {
                  obj.index = index
               }

               //初始選取數量
               if (obj.include_qty === undefined) {
                  obj.include_qty = 0
               }

               //彙總選取數量-同批號
               if (obj.include_qty_sum === undefined) {
                  obj.include_qty_sum = 0
               }

               return obj
            })
         }

         //數量檢查-for 多單位
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

         //單據揀料資料彙總-for 多單位
         function lotIncludeQtySum(index) {
            //各單據揀料資料彙總
            var arr_lot = []
            var arr_doc = []
            for (var i = 0, len = $scope.documents_sum.length; i < len; i++) {
               if (!$scope.documents_sum[i] || !$scope.documents_sum[i].lot_list) {
                  continue
               }

               var lotListIdx = $scope.documents_sum[i].lot_list.findIndex(function (item) {
                  return item.index == index
               })

               if (lotListIdx !== -1) {
                  arr_lot.push($scope.documents_sum[i].lot_list[lotListIdx])
                  arr_doc = arr_doc.concat($scope.documents_sum[i].lot_list)

                  $scope.documents_sum[i].include_qty = sumIncludeQty($scope.documents_sum[i].lot_list)
               }
            }
            $scope.lot_list[index].include_qty_sum = sumIncludeQty(arr_lot)
         }

         //彙總已揀數量-for 多單位
         function sumIncludeQty(arr) {
            var obj = arr.reduce(function (obj_A, obj_B) {
               if (!obj_A) {
                  obj_A = { "include_qty": 0 }
               }

               if (!obj_B) {
                  obj_B = { "include_qty": 0 }
               }

               return {
                  "include_qty": nuberFixed.accAdd(obj_A.include_qty, obj_B.include_qty)
               }
            })

            if (!obj) {
               obj = { "include_qty": 0 }
            }

            return obj.include_qty
         }

         //==================== 內部呼叫 Function ====================(E)


         //==================== 外部呼叫 Function ====================(S)

         $scope.goToPage = function () {
            $timeout(function () {
               $state.go("kb_03_s01")
            }, 0)
         }

         $scope.backupFileter = function (filter) {
            $scope.warehouseList_filter = filter
         }

         //判斷是否顯示多單位維護視窗
         $scope.checkIsShowEditMultiUnit = function (item) {
            //庫存數量 T100/TIPTOP不使用
            if (userInfoService.userInfo.server_product == "EF" ||
               userInfoService.userInfo.server_product == "E10" ||
               userInfoService.userInfo.server_product == "WF") {
               return true
            }

            if (angular.isObject(item) && item.multi_unit_type != "1") {
               return true
            }

            var isShowEditMultiUnit = false
            //是否使用計價單位 0.不使用 1.採購 2.銷售 3.兩者
            switch (userInfoService.userInfo.valuation_unit) {
               case "1":
                  if ($scope.page_params.mod == "APM") {
                     isShowEditMultiUnit = true
                  }
                  break
               case "2":
                  if ($scope.page_params.mod == "AXM") {
                     isShowEditMultiUnit = true
                  }
                  break
               case "3":
                  if ($scope.page_params.mod == "APM" ||
                     $scope.page_params.mod == "AXM") {
                     isShowEditMultiUnit = true
                  }
                  break
            }
            return isShowEditMultiUnit
         }

         //顯示多單位維護 Modal
         $scope.editMultiUnit = function (type, documents, lot) {
            $scope.multUnitParameter = {
               "type": type,
               "isEditQty": false,
               "isShowShouldQty": false,
               "isShowInventory": false,
               "isShowReference": false,
               "isShowValuation": false,
            }

            //取得多單位頁面值
            var item
            switch (type) {
               case "detail": //明細頁
                  item = angular.copy(documents)
                  $scope.multUnit = item
                  $scope.multUnit.all_inventory_qty = item.inventory_qty || 0
                  $scope.multUnit.all_reference_qty = item.reference_qty || 0
                  $scope.multUnit.all_valuation_qty = item.valuation_qty || 0
                  $scope.multUnit.all_qty = item.qty

                  //因為初始值為零, 在維護數量時進行重新計算
                  $scope.multUnit.valuation_rate = numericalAnalysisService.accDiv($scope.multUnit.qty, $scope.multUnit.valuation_qty)
                  break
               case "collection": //數據匯總頁
                  item = angular.copy(documents)
                  $scope.multUnit = item

                  $scope.multUnit.unit = documents.unit_no
                  $scope.multUnit.all_inventory_qty = item.already_inv_qty || 0
                  $scope.multUnit.all_reference_qty = item.already_ref_qty || 0
                  $scope.multUnit.all_valuation_qty = item.already_val_qty || 0
                  $scope.multUnit.all_qty = item.include_qty

                  $scope.multUnit.should_inventory_qty = item.should_inv_qty || 0
                  $scope.multUnit.should_reference_qty = item.should_ref_qty || 0
                  $scope.multUnit.should_valuation_qty = item.should_val_qty || 0
                  $scope.multUnit.qty = item.qty
                  if ($scope.l_data.has_source) {
                     $scope.multUnitParameter.isShowShouldQty = true
                  }
                  break
               case "detail_lot": //明細頁
                  item = angular.copy(lot)
                  $scope.multUnit = item
                  $scope.multUnit.all_reference_qty = item.reference_qty || 0
                  $scope.multUnit.all_valuation_qty = item.valuation_qty || 0
                  $scope.multUnit.all_qty = item.include_qty

                  $scope.multUnit.unit = documents.unit
                  $scope.multUnit.reference_unit_no = documents.reference_unit_no
                  $scope.multUnit.valuation_unit_no = documents.valuation_unit_no
                  $scope.multUnit.multi_unit_type = documents.multi_unit_type

                  //數值彈窗可輸入的最大值: 批號可揀量 - (該批號使用量 - 單據當前使用量)
                  var maxLotQty = lot.qty - ($scope.lot_list[lot.index].include_qty_sum - lot.include_qty)
                  $scope.multUnit.maxLotQty = maxLotQty

                  //不可超過單據數
                  $scope.multUnit.maxqty = documents.qty

                  //因為初始值為零, 在維護數量時進行重新計算
                  $scope.multUnit.valuation_rate = numericalAnalysisService.accDiv($scope.multUnit.include_qty, $scope.multUnit.valuation_qty)

                  //待出導引沒有掃描頁, 因此在明細頁修改
                  $scope.multUnitParameter.isEditQty = true
                  break
               case "collection_lot": //數據匯總頁
                  item = angular.copy(lot)
                  $scope.multUnit = item
                  $scope.multUnit.all_reference_qty = item.already_ref_qty || 0
                  $scope.multUnit.all_qty = item.include_qty
                  if ($scope.l_data.has_source) {
                     $scope.multUnitParameter.isShowShouldQty = true
                  }
                  break
               case "directive": //指示頁
                  break
            }

            if (userInfoService.userInfo.server_product == "EF" ||
               userInfoService.userInfo.server_product == "E10" ||
               userInfoService.userInfo.server_product == "WF") {
               $scope.multUnitParameter.isShowInventory = true
            }

            if ($scope.multUnit.multi_unit_type == "3") {
               $scope.multUnitParameter.isShowReference = true
            }

            //是否使用計價單位 0.不使用 1.採購 2.銷售 3.兩者
            switch (userInfoService.userInfo.valuation_unit) {
               case "1":
                  if ($scope.l_data.mod == "APM") {
                     $scope.multUnitParameter.isShowValuation = true
                  }
                  break
               case "2":
                  if ($scope.l_data.mod == "AXM") {
                     $scope.multUnitParameter.isShowValuation = true
                  }
                  break
               case "3":
                  if ($scope.l_data.mod == "APM" ||
                     $scope.l_data.mod == "AXM") {
                     $scope.multUnitParameter.isShowValuation = true
                  }
                  break
            }

            console.log($scope.multUnit)

            $ionicModal.fromTemplateUrl("views/app/common/html/multiUnitQtyModal.html", {
               "scope": $scope
            }).then(function (modal) {

               //数量弹窗
               $scope.multiUnitQtyPop = function (type) {
                  var maxqty = Infinity
                  var qty = 0

                  switch (type) {
                     case "inventory":
                        qty = $scope.multUnit.all_inventory_qty || 0
                        break
                     case "reference":
                        qty = $scope.multUnit.all_reference_qty || 0
                        break
                     case "valuation":
                        qty = $scope.multUnit.all_valuation_qty || 0
                        break
                     default:
                        qty = $scope.multUnit.all_qty || 0
                        maxqty = $scope.multUnit.maxqty || 0
                        break
                  }

                  commonFactory.showQtyPopup_kb("", qty, maxqty, chkqty(qty)).then(function (res) {
                     if (typeof res !== "undefined") {
                        switch (type) {
                           case "inventory":
                              $scope.multUnit.all_inventory_qty = res
                              break
                           case "reference":
                              $scope.multUnit.all_reference_qty = res
                              break
                           case "valuation":
                              $scope.multUnit.all_valuation_qty = res
                              break
                           default:
                              $scope.multUnit.all_qty = res
                              break
                        }
                        var flag = checkMultiUnitQty(type)
                        if (flag && type == "qty") {
                           return valInvCompute()
                        }
                     }
                  })
               }

               //修改數量後檢查
               var checkMultiUnitQty = function (type) {
                  console.log("checkMultiUnitQty")
                  console.log($scope.multUnit)
                  //控卡數量
                  if (type === "qty") {
                     //控卡單據剩餘數量
                     if ($scope.multUnit.all_qty > $scope.multUnit.maxqty) {
                        userInfoService.getVoice($scope.langs.error.MD005, function () {
                        })
                        $scope.multUnit.all_qty = $scope.multUnit.maxqty

                        return false
                     }
                  }

                  return true
               }

               var valInvCompute = function () {
                  if (!commonService.isNull($scope.multUnit.valuation_unit_no) && $scope.multUnit.valuation_rate !== 0) {
                     $scope.multUnit.all_valuation_qty = numericalAnalysisService.to_round(
                        numericalAnalysisService.accDiv($scope.multUnit.all_qty, $scope.multUnit.valuation_rate),
                        $scope.multUnit.decimal_places,
                        $scope.multUnit.decimal_places_type)
                  }

                  if (!commonService.isNull($scope.multUnit.inventory_unit)) {
                     $scope.multUnit.all_inventory_qty = numericalAnalysisService.to_round(
                        numericalAnalysisService.accDiv($scope.multUnit.all_qty, $scope.multUnit.inventory_rate),
                        $scope.multUnit.decimal_places,
                        $scope.multUnit.decimal_places_type)
                  }
               }

               //計算加減後數值 並呼叫撿查
               $scope.multiUnitCompute = function (type, arg1, arg2) {
                  var num = numericalAnalysisService.accAdd(arg1, arg2)
                  if (num < 0) {
                     num = 0
                  }
                  switch (type) {
                     case "inventory":
                        $scope.multUnit.all_inventory_qty = num
                        break
                     case "reference":
                        $scope.multUnit.all_reference_qty = num
                        break
                     case "valuation":
                        $scope.multUnit.all_valuation_qty = num
                        break
                     default:
                        $scope.multUnit.all_qty = num
                        break
                  }
                  var flag = checkMultiUnitQty(type)
                  if (flag && type == "qty") {
                     return valInvCompute()
                  }
               }

               $scope.setMultiUnitQty = function () {
                  //待入導引只可修改明細頁
                  if ($scope.multUnitParameter.type != "detail_lot") {
                     $scope.closeMultiUnitQtyModal()
                     return
                  }

                  if ($scope.multUnit.all_qty > $scope.multUnit.maxqty) {
                     userInfoService.getVoice($scope.langs.receipt + $scope.langs.surplus + $scope.langs.qty + $scope.langs.insufficient + "！", function () {
                     })
                     $scope.multUnit.all_qty = $scope.multUnit.maxqty
                  }

                  if ($scope.multUnit.all_qty > $scope.multUnit.maxLotQty) {
                     //MD017: 此批號剩餘可揀量不足
                     userInfoService.getVoice($scope.langs.error.MD017, function () {
                     })
                     $scope.multUnit.all_qty = $scope.multUnit.maxLotQty
                  }

                  if (documents && lot) {
                     $scope.multUnit.include_qty = $scope.multUnit.all_qty
                     $scope.multUnit.reference_qty = $scope.multUnit.all_reference_qty
                     $scope.multUnit.valuation_qty = $scope.multUnit.all_valuation_qty

                     var index = documents.lot_list.findIndex(function (item) {
                        return commonService.isEquality(lot.index, item.index)
                     })
                     
                     documents.lot_list[index] = angular.copy($scope.multUnit)
                     lotIncludeQtySum(lot.index)
                  }

                  $scope.closeMultiUnitQtyModal()
               }

               $scope.closeMultiUnitQtyModal = function () {
                  modal.hide().then(function () {
                     return modal.remove()
                  })
               }
               modal.show()
            })
            $ionicListDelegate.closeOptionButtons()
         }

         //==================== 外部呼叫 Function ====================(E)


         //==================== 呼叫 BDL 元件 ====================(S)

         //==================== 呼叫 BDL 元件 ====================(E)

         //初始化變數
         page_init()

         //取得資料清單
         getDataList()
      }
   ]
})
