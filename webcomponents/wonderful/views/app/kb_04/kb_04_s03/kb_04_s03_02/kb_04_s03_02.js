define(["API", "APIS", "AppLang", "array", "Directives", "ReqTestData", "ionic-popup", "commonService", "userInfoService"], function () {
   return ["$scope", "$state", "$stateParams", "$timeout", "$filter", "AppLang", "$ionicPopup", "$ionicModal", "APIService", "APIBridge", "$ionicLoading", "$ionicListDelegate", "IonicClosePopupService", "kb_04_requisition", "ReqTestData", "commonService", "commonFactory", "commonFormat", "userInfoService", "numericalAnalysisService",
      function ($scope, $state, $stateParams, $timeout, $filter, AppLang, $ionicPopup, $ionicModal, APIService, APIBridge, $ionicLoading, $ionicListDelegate, IonicClosePopupService, kb_04_requisition, ReqTestData, commonService, commonFactory, commonFormat, userInfoService, numericalAnalysisService) {

         //============================== 內部呼叫 Function ==============================(S)

         function page_init() {
            $scope.page_params = commonService.get_page_params()
            $scope.userInfo = userInfoService.getUserInfo()

            $scope.langs = AppLang.langs
            $scope.goodsList = []
            $scope.data_collection = []

            kb_04_requisition.setParams(angular.copy($scope.page_params))

            //取得資訊ID yyyyMMddHHmmsssss_account            
            var l_info_id = commonService.getCurrent(2) + "_" + $scope.userInfo.account

            $scope.l_data = {
               "bcae005": $scope.page_params.in_out_no, //出入庫瑪
               "bcae006": $scope.page_params.program_job_no + $scope.page_params.status,
               "bcae014": $scope.page_params.program_job_no,
               "bcae015": $scope.page_params.status,     //A開立新單/S過賬/Y確認
               "info_id": $scope.page_params.info_id || angular.copy(l_info_id),
               "has_source": true
            }

            $scope.inquiry_list_title_already = $scope.langs.alreadyPutInStorage
            $scope.inquiry_list_title_should = $scope.langs.shouldPutInStorage

            //取得預設倉庫 設定頁面 或 第一筆資料
            var out_warehouse = $scope.page_params.warehouse_no || $scope.userInfo.warehouse_no || userInfoService.warehouse[0].warehouse_no

            //取得倉庫資訊
            var index = userInfoService.warehouseIndex[out_warehouse] || 0
            var out_storage_management = userInfoService.warehouse[index].storage_management || "N"
            var out_warehouse_cost = userInfoService.warehouse[index].warehouse_cost || "N"
            $scope.sel_in_storage = userInfoService.warehouse[index].storage_spaces
            var out_storage_spaces_no = " "
            if (out_storage_management == "Y") {
               out_storage_spaces_no = $scope.sel_in_storage[0].storage_spaces_no
            }

            //掃描資料預設
            $scope.scaninfo = {
               "scanning": "",
               "search": "",
               "focus_me": true,
               "warehouse_no": $scope.page_params.warehouse_no || out_warehouse,
               "warehouse_name": userInfoService.warehouse[index].warehouse_name,
               "warehouse_cost": out_warehouse_cost,
               "storage_management": out_storage_management,
               "storage_spaces_no": $scope.page_params.storage_spaces_no || out_storage_spaces_no,
               "storage_spaces_name": (out_storage_management == "Y") ? $scope.sel_in_storage[0].storage_spaces_name : " ",
               "lot_no": $scope.page_params.lot_no || "",
               "lot_control_flag": null,
               "qty": 0,
               "maxqty": 0
            }

            $scope.sel_indicate = {
               "warehouse_no": out_warehouse,
               "warehouse_name": userInfoService.warehouse[index].warehouse_name,
            }
         }

         //取得掃描頁顯示資訊
         function getShowInfo() {
            var barcode_no = $scope.showGood.barcode_no
            var item_no = $scope.showGood.item_no
            var item_feature_no = $scope.showGood.item_feature_no
            var warehouse_no = $scope.showGood.warehouse_no
            var storage_spaces_no = $scope.showGood.storage_spaces_no
            var lot_no = $scope.showGood.lot_no
            var ingoing_warehouse_no = $scope.showGood.ingoing_warehouse_no
            var ingoing_storage_spaces_no = $scope.showGood.ingoing_storage_spaces_no
            var index = $scope.goodsList.findIndex(function (item) {
               return commonService.isEquality(barcode_no, item.barcode_no) &&
                  commonService.isEquality(warehouse_no, item.warehouse_no) &&
                  commonService.isEquality(storage_spaces_no, item.storage_spaces_no) &&
                  commonService.isEquality(lot_no, item.lot_no) &&
                  commonService.isEquality(ingoing_warehouse_no, item.ingoing_warehouse_no) &&
                  commonService.isEquality(ingoing_storage_spaces_no, item.ingoing_storage_spaces_no)
            })

            $scope.showInfo = ""
            if (index != -1) {
               var showInfo = angular.copy($scope.goodsList[index])
               //有來源單據

               //計算此條碼已發數量 及 其他條碼已發數量
               var qty = 0
               var otherQty = 0
               for (var i = 0; i < $scope.goodsList.length; i++) {
                  var item = $scope.goodsList[i]
                  if (commonService.isEquality(item.item_no, showInfo.item_no) &&
                     commonService.isEquality(item.item_feature_no, showInfo.item_feature_no) &&
                     commonService.isEquality(item.barcode_no, showInfo.barcode_no) &&
                     commonService.isEquality(item.warehouse_no, showInfo.warehouse_no) &&
                     commonService.isEquality(item.storage_spaces_no, showInfo.storage_spaces_no) &&
                     commonService.isEquality(item.ingoing_warehouse_no, showInfo.ingoing_warehouse_no) &&
                     commonService.isEquality(item.ingoing_storage_spaces_no, showInfo.ingoing_storage_spaces_no) &&
                     commonService.isEquality(item.lot_no, showInfo.lot_no)) {
                     qty = numericalAnalysisService.accAdd(qty, item.qty)
                  }

                  if (commonService.isEquality(item.item_no, showInfo.item_no) &&
                     commonService.isEquality(item.item_feature_no, showInfo.item_feature_no) &&
                     !(commonService.isEquality(item.barcode_no, showInfo.barcode_no) &&
                        commonService.isEquality(item.warehouse_no, showInfo.warehouse_no) &&
                        commonService.isEquality(item.storage_spaces_no, showInfo.storage_spaces_no) &&
                        commonService.isEquality(item.ingoing_warehouse_no, showInfo.ingoing_warehouse_no) &&
                        commonService.isEquality(item.ingoing_storage_spaces_no, showInfo.ingoing_storage_spaces_no) &&
                        commonService.isEquality(item.lot_no, showInfo.lot_no))) {
                     otherQty = numericalAnalysisService.accAdd(otherQty, item.qty)
                  }
               }

               showInfo.qty = qty

               //計算條碼最大數量
               var maxqty = 0
               var max_allow_doc_qty = 0
               var max_doc_qty = 0
               var ItemDocQty = kb_04_requisition.getItemDocQty()
               for (var j = 0, len = ItemDocQty.length; j < len; j++) {
                  var ItemDoc = ItemDocQty[j]
                  if (commonService.isEquality(ItemDoc.item_no, showInfo.item_no) &&
                     commonService.isEquality(ItemDoc.item_feature_no, showInfo.item_feature_no)) {
                     max_allow_doc_qty = numericalAnalysisService.accAdd(max_allow_doc_qty, ItemDoc.allow_doc_qty)
                     max_doc_qty = numericalAnalysisService.accAdd(max_doc_qty, ItemDoc.doc_qty)
                  }
               }
               max_doc_qty = numericalAnalysisService.accSub(max_doc_qty, otherQty)
               max_allow_doc_qty = numericalAnalysisService.accSub(max_allow_doc_qty, otherQty)
               showInfo.maxqty = showInfo.inventory_qty
               showInfo.max_allow_doc_qty = max_allow_doc_qty
               showInfo.max_doc_qty = max_doc_qty

               //緩存資料抓取條碼類型 條碼數量 庫存數量
               if (commonService.isNull(showInfo.barcode_type)) {
                  var webTran = {
                     "service": "app.barcode.get",
                     "parameter": {
                        "program_job_no": $scope.page_params.program_job_no,
                        "status": $scope.page_params.status,
                        "barcode_no": showInfo.barcode_no,
                        "warehouse_no": showInfo.warehouse_no,
                        "storage_spaces_no": showInfo.storage_spaces_no,
                        "lot_no": showInfo.lot_no,
                        "inventory_management_features": "",
                        "param_master": $scope.page_params.doc_array,
                        "site_no": userInfoService.userInfo.site_no
                     }
                  }
                  console.log(webTran)

                  //是否使用假資料
                  if (ReqTestData.testData) {
                     var parameter = ReqTestData.getAppBarcode(webTran.parameter)
                     var barcode_detail = parameter.barcode_detail[0]

                     //箱條碼 入項 計算總庫存量
                     var all_barcode_inventory_qty = 0
                     if (barcode_detail.barcode_type == "2") {
                        angular.forEach(parameter.barcode_detail, function (value) {
                           if (commonService.isEquality(showInfo.barcode_no, value.barcode_no)) {
                              all_barcode_inventory_qty = numericalAnalysisService.accAdd(all_barcode_inventory_qty, value.inventory_qty)
                           }
                        })
                        barcode_detail.inventory_qty = all_barcode_inventory_qty
                     }

                     showInfo.barcode_type = barcode_detail.barcode_type
                     showInfo.barcode_qty = barcode_detail.barcode_qty
                     showInfo.inventory_qty = barcode_detail.inventory_qty
                     $scope.showInfo = showInfo
                     $scope.goodsList[index] = angular.copy(showInfo)
                  } else {
                     $ionicLoading.show()
                     APIService.Web_Post(webTran, function (res) {
                        $ionicLoading.hide()
                        console.log("success:" + res)
                        var parameter = res.payload.std_data.parameter
                        var barcode_detail = parameter.barcode_detail[0]

                        //箱條碼 入項 計算總庫存量
                        var all_barcode_inventory_qty = 0
                        if (barcode_detail.barcode_type == "2") {
                           angular.forEach(parameter.barcode_detail, function (value) {
                              if (commonService.isEquality(showInfo.barcode_no, value.barcode_no)) {
                                 all_barcode_inventory_qty = numericalAnalysisService.accAdd(all_barcode_inventory_qty, value.inventory_qty)
                              }
                           })
                           barcode_detail.inventory_qty = all_barcode_inventory_qty
                        }

                        showInfo.barcode_type = barcode_detail.barcode_type
                        showInfo.barcode_qty = barcode_detail.barcode_qty
                        showInfo.inventory_qty = barcode_detail.inventory_qty
                        $scope.showInfo = showInfo
                        $scope.goodsList[index] = angular.copy(showInfo)
                     }, function (error) {
                        $ionicLoading.hide()
                        var execution = error.payload.std_data.execution
                        console.log("error:" + execution.description)
                        userInfoService.getVoice(execution.description, function () { })
                     })
                  }

                  return
               }

               $scope.showInfo = showInfo
            }
         }

         //數量檢查-for 多單位
         function chkqty(type, oldQty, index, lotType) {
            var lot_include_qty = $scope.goodsList[index].lot_include_qty || 0

            return function (qty, maxqty, event) {
               var error_massage = ""

               //MD023: 数量 {0} 不可小于批号已分配的数量 {1} !
               if (type === "qty" && lotType === "detail") {
                  if (qty < lot_include_qty) {
                     event.preventDefault()
                     error_massage = commonFormat.format($scope.langs.error.MD023, qty, lot_include_qty)
                     qty = oldQty
                  }
               }

               if (qty > maxqty) {
                  event.preventDefault()
                  error_massage = $scope.langs.error.MD005
                  qty = maxqty
               }

               //存在錯誤時顯示提示
               if (error_massage !== "") {
                  userInfoService.getVoice(error_massage, function () {
                  })
               }

               return +qty
            }
         }

         //============================== 內部呼叫 Function ==============================(E)


         //============================== 外部呼叫 Function ==============================(S)

         $scope.initShowGood = function () {
            $scope.showGood = {
               "barcode_no": null,
               "item_no": null,
               "item_feature_no": null,
               "warehouse_no": null,
               "storage_spaces_no": null,
               "lot_no": null,
               "ingoing_warehouse_no": null,
               "ingoing_storage_spaces_no": null
            }

            getShowInfo()
         }

         $scope.clearList = function () {
            $scope.goodsList = []
         }

         $scope.addDocArray = function (scanning) {
            commonService.push_page_doc_array({
               "doc_no": scanning,
               "seq": ""
            })
         }

         $scope.addGoods = function (obj) {
            $scope.goodsList.unshift(angular.copy(obj))
         }

         //左滑删除
         $scope.deleteGoods = function (index) {
            $scope.goodsList.splice(index, 1)
            $ionicListDelegate.closeOptionButtons()
         }

         $scope.setDataCollection = function (array) {
            $scope.data_collection = array
         }

         $scope.InsertToBcmcBcme = function (parameter) {
            if (commonService.Platform == "Chrome") {
               return
            }
            $ionicLoading.show()
            APIBridge.callAPI("bcme_create", [parameter, $scope.l_data]).then(function (result) {
               $ionicLoading.hide()
               if (result) {
                  console.log("bcme_create success")
               } else {
                  userInfoService.getVoice("bcme_create error", function () { })
               }
            }, function (error) {
               $ionicLoading.hide()
               userInfoService.getVoice("bcme_create fail", function () { })
               console.log(error)
            })
         }

         $scope.addLotQtyList = function (index, obj) {
            if (!$scope.goodsList[index].lotQtyList) {
               $scope.goodsList[index].lotQtyList = []
            }

            $scope.goodsList[index].lotQtyList.unshift(angular.copy(obj))
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

         //設定批號動態index
         $scope.setLotIndex = function (index, lot) {
            lot.index = index

            return true
         }

         //顯示多單位維護 Modal
         $scope.editMultiUnit = function (type, index, lot) {
            $scope.multUnitParameter = {
               "type": type,
               "isEditQty": false,
               "isShowShouldQty": false,
               "isShowInventory": false,
               "isShowReference": false,
               "isShowValuation": false,
            }

            //取得多單位頁面值
            var item = undefined
            switch (type) {
               case "detail": //明細頁
                  item = angular.copy($scope.goodsList[index])
                  $scope.multUnit = item
                  $scope.multUnit.all_inventory_qty = item.inventory_qty || 0
                  $scope.multUnit.all_reference_qty = item.reference_qty || 0
                  $scope.multUnit.all_valuation_qty = item.valuation_qty || 0
                  $scope.multUnit.all_qty = item.qty

                  //進貨導引沒有掃描頁, 因此在明細頁修改
                  $scope.multUnitParameter.isEditQty = true
                  break
               case "collection": //數據匯總頁
                  $scope.multUnit = angular.copy($scope.data_collection[index])
                  $scope.multUnit.all_inventory_qty = $scope.data_collection[index].already_inv_qty
                  $scope.multUnit.all_reference_qty = $scope.data_collection[index].already_ref_qty
                  $scope.multUnit.all_valuation_qty = $scope.data_collection[index].already_val_qty
                  $scope.multUnit.all_qty = $scope.data_collection[index].already_qty
                  $scope.multUnit.should_inventory_qty = $scope.data_collection[index].should_inv_qty
                  $scope.multUnit.should_reference_qty = $scope.data_collection[index].should_ref_qty
                  $scope.multUnit.should_valuation_qty = $scope.data_collection[index].should_val_qty
                  $scope.multUnit.should_qty = $scope.data_collection[index].should_qty
                  if ($scope.l_data.has_source) {
                     $scope.multUnitParameter.isShowShouldQty = true
                  }
                  break
               case "detail_lot": //明細頁
                  item = angular.copy(lot)
                  $scope.multUnit = item
                  $scope.multUnit.all_inventory_qty = item.inventory_qty || 0
                  $scope.multUnit.all_reference_qty = item.reference_qty || 0
                  $scope.multUnit.all_valuation_qty = item.valuation_qty || 0
                  $scope.multUnit.all_qty = item.qty

                  $scope.multUnit.unit = $scope.goodsList[index].unit
                  $scope.multUnit.reference_unit_no = $scope.goodsList[index].reference_unit_no
                  $scope.multUnit.valuation_unit_no = $scope.goodsList[index].valuation_unit_no

                  //多單位控管
                  $scope.multUnit.multi_unit_type = $scope.goodsList[index].multi_unit_type

                  //進貨導引沒有掃描頁, 因此在明細頁修改
                  $scope.multUnitParameter.isEditQty = true
                  break
               case "detail_lotQty": //明細頁
                  item = angular.copy(lot)
                  $scope.multUnit = item
                  $scope.multUnit.all_inventory_qty = item.inventory_qty || 0
                  $scope.multUnit.all_reference_qty = item.reference_qty || 0
                  $scope.multUnit.all_valuation_qty = item.valuation_qty || 0
                  $scope.multUnit.all_qty = item.qty

                  $scope.multUnit.unit = $scope.goodsList[index].unit
                  $scope.multUnit.reference_unit_no = $scope.goodsList[index].reference_unit_no
                  $scope.multUnit.valuation_unit_no = $scope.goodsList[index].valuation_unit_no

                  //多單位控管
                  $scope.multUnit.multi_unit_type = $scope.goodsList[index].multi_unit_type

                  //進貨導引沒有掃描頁, 因此在明細頁修改
                  $scope.multUnitParameter.isEditQty = true
                  break
               case "directive": //指示頁
                  break
            }
            $scope.multUnit.type = type

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
                  if ($scope.page_params.mod == "APM") {
                     $scope.multUnitParameter.isShowValuation = true
                  }
                  break
               case "2":
                  if ($scope.page_params.mod == "AXM") {
                     $scope.multUnitParameter.isShowValuation = true
                  }
                  break
               case "3":
                  if ($scope.page_params.mod == "APM" ||
                     $scope.page_params.mod == "AXM") {
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
                        if ($scope.multUnit.type === "detail") {
                           maxqty = $scope.multUnit.maxqty || 0
                        }
                        else {
                           maxqty = $scope.multUnit.qty + (($scope.multUnit.getLotQtyListInfo) ? $scope.multUnit.getLotQtyListInfo().qty : 0)
                        }
                        break
                  }

                  commonFactory.showQtyPopup_kb("", qty, maxqty, chkqty(type, qty, index, $scope.multUnit.type)).then(function (res) {
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
                     //單據控卡單據剩餘數量
                     if ($scope.multUnit.all_qty > $scope.multUnit.maxqty) {
                        userInfoService.getVoice($scope.langs.error.MD005, function () {
                        })
                        $scope.multUnit.all_qty = $scope.multUnit.maxqty

                        return false
                     }

                     if (($scope.multUnit.all_qty - $scope.multUnit.qty) > ($scope.multUnit.maxqty - ($scope.multUnit.sumIncludeQty() - $scope.multUnit.getLotQtyListInfo().qty))) {
                        userInfoService.getVoice($scope.langs.error.MD005, function () {
                        })
                        $scope.multUnit.all_qty = $scope.multUnit.qty + ($scope.multUnit.maxqty - ($scope.multUnit.sumIncludeQty() - $scope.multUnit.getLotQtyListInfo().qty))

                        return false
                     }

                     //檢查數量資料
                     if ($scope.multUnit.lot_include_qty > $scope.multUnit.all_qty) {
                        //MD023: 数量 {0} 不可小于批号已分配的数量 {1} !
                        var error_massage = commonFormat.format($scope.langs.error.MD023, $scope.multUnit.all_qty, $scope.multUnit.lot_include_qty)
                        userInfoService.getVoice(error_massage, function () {
                        })
                        $scope.multUnit.all_qty = $scope.multUnit.lot_include_qty

                        return false
                     }
                  }

                  return true
               }

               var valInvCompute = function () {
                  if (!commonService.isNull($scope.multUnit.valuation_unit_no)) {
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
                  if (num < 1) {
                     num = 1
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
                  //進貨導引只可修改明細頁
                  if ($scope.multUnitParameter.type != "detail" && $scope.multUnitParameter.type != "detail_lot" && $scope.multUnitParameter.type != "detail_lotQty") {
                     $scope.closeMultiUnitQtyModal()
                     return
                  }

                  if ($scope.multUnit.all_qty > $scope.multUnit.maxqty) {
                     userInfoService.getVoice($scope.langs.receipt + $scope.langs.surplus + $scope.langs.qty + $scope.langs.insufficient + "！", function () {
                     })
                     $scope.multUnit.all_qty = $scope.multUnit.maxqty
                  }

                  if ($scope.multUnitParameter.type === "detail") {
                     angular.forEach($scope.goodsList, function (value) {
                        if (commonService.isEquality(value.warehouse_no, $scope.multUnit.warehouse_no) &&
                           commonService.isEquality(value.storage_spaces_no, $scope.multUnit.storage_spaces_no) &&
                           commonService.isEquality(value.lot_no, $scope.multUnit.lot_no) &&
                           commonService.isEquality(value.item_no, $scope.multUnit.item_no) &&
                           commonService.isEquality(value.item_feature_no, $scope.multUnit.item_feature_no) &&
                           commonService.isEquality(value.source_no, $scope.multUnit.source_no) &&
                           commonService.isEquality(value.seq, $scope.multUnit.seq)) {

                           $scope.multUnit.qty = $scope.multUnit.all_qty
                           $scope.multUnit.inventory_qty = $scope.multUnit.all_inventory_qty
                           $scope.multUnit.reference_qty = $scope.multUnit.all_reference_qty
                           $scope.multUnit.valuation_qty = $scope.multUnit.all_valuation_qty
                        }
                     })
                     $scope.goodsList[index] = angular.copy($scope.multUnit)
                  }

                  if ($scope.multUnitParameter.type === "detail_lot") {
                     $scope.multUnit.qty = $scope.multUnit.all_qty
                     $scope.multUnit.inventory_qty = $scope.multUnit.all_inventory_qty
                     $scope.multUnit.reference_qty = $scope.multUnit.all_reference_qty
                     $scope.multUnit.valuation_qty = $scope.multUnit.all_valuation_qty

                     $scope.$broadcast("lotQtyListInfo", "detail_lot", $scope.multUnit)
                  }

                  if ($scope.multUnitParameter.type === "detail_lotQty") {
                     $scope.multUnit.qty = $scope.multUnit.all_qty
                     $scope.multUnit.inventory_qty = $scope.multUnit.all_inventory_qty
                     $scope.multUnit.reference_qty = $scope.multUnit.all_reference_qty
                     $scope.multUnit.valuation_qty = $scope.multUnit.all_valuation_qty

                     $scope.$broadcast("lotQtyListInfo", "detail_lotQty", $scope.multUnit)
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

         //============================== 外部呼叫 Function ==============================(E)

         //============================== 呼叫元件 Function ==============================(S)

         $scope.goTodolistNotice = function () {
            var page = "kb_02_s01"

            if (commonService.Platform == "Chrome") {
               kb_04_requisition.init()
               $state.go(page)
               return
            }

            $ionicLoading.show()
            APIBridge.callAPI("bcaf_create", [$scope.goodsList, $scope.l_data]).then(function (result) {
               if (result) {
                  $ionicLoading.hide()
                  kb_04_requisition.init()
                  $state.go(page)
               } else {
                  $ionicLoading.hide()
                  userInfoService.getVoice("bcaf_create error", function () { })
               }
            }, function (error) {
               $ionicLoading.hide()
               userInfoService.getVoice("bcaf_create fail", function () { })
               console.log(error)
            })
         }

         //============================== 呼叫元件 Function ==============================(E)

         //頁面初始化
         page_init()

         $scope.initShowGood()

         var setInitData = function (data) {
            var parameter = {
               "barcode_detail": [],
               "source_doc_detail": data.bcme,
            }
            kb_04_requisition.setParameter(parameter)
            $scope.goodsList = data.bcaf

            angular.forEach(data.bcme, function (value) {
               $scope.addDocArray(value.source_no)
            })
         }

         var checkClearData = function (data) {
            var DataPopup = $ionicPopup.show({
               "title": $scope.langs.point,
               "template": "<p style='text-align: center'>" + $scope.langs.check_clear_data + "</p>",
               "scope": $scope,
               "buttons": [{
                  "text": $scope.langs.cancel,
                  "onTap": function () {
                     $ionicLoading.show()
                     APIBridge.callAPI("bcme_ae_af_delete", [$scope.l_data]).then(function (result) {
                        $ionicLoading.hide()
                        kb_04_requisition.init()
                     }, function (error) {
                        $ionicLoading.hide()
                        userInfoService.getVoice("bcme_ae_af_delete fail", function () { })
                        console.log(error)
                     })
                  }
               }, {
                  "text": $scope.langs.confirm,
                  "onTap": function () {
                     setInitData(data)
                  }
               }]
            })
            IonicClosePopupService.register(false, DataPopup)
            return
         }

         if (commonService.Platform !== "Chrome") {
            $ionicLoading.show()
            var obj = {
               "type_no": "2"
            }

            APIBridge.callAPI("bcme_ae_af_get", [obj, $scope.l_data]).then(function (result) {
               $ionicLoading.hide()
               console.log(result)

               if (result.data[0].submit_show) {
                  setInitData(result.data[0])
               }
            }, function (error) {
               $ionicLoading.hide()
               userInfoService.getVoice("bcme_ae_af_get fail", function () { })
               console.log(error)
            })
         }
      }
   ]
})
