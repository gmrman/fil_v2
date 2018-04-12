define(["API", "APIS", "AppLang", "array", "Directives", "ReqTestData", "ionic-popup", "commonService", "userInfoService"], function () {
   return ["$scope", "$state", "$stateParams", "$timeout", "$filter", "AppLang", "APIService", "APIBridge", "$ionicModal", "$ionicLoading", "$ionicListDelegate", "kb_04_requisition", "ReqTestData", "commonService", "commonFactory", "commonFormat", "userInfoService", "numericalAnalysisService",
      function ($scope, $state, $stateParams, $timeout, $filter, AppLang, APIService, APIBridge, $ionicModal, $ionicLoading, $ionicListDelegate, kb_04_requisition, ReqTestData, commonService, commonFactory, commonFormat, userInfoService, numericalAnalysisService) {

         //==================== 內部呼叫 Function ====================(S)

         //初始化變數
         function page_init() {
            $scope.page_params = commonService.get_page_params()
            $scope.userInfo = userInfoService.getUserInfo()

            $scope.langs = AppLang.langs
            $scope.goodsList = []
            $scope.data_collection = []

            //取得資訊ID yyyyMMddHHmmsssss_account            
            var l_info_id = commonService.getCurrent(2) + "_" + $scope.userInfo.account

            $scope.l_data = {
               "bcae005": $scope.page_params.in_out_no,   //出入庫瑪
               "bcae006": $scope.page_params.program_job_no + $scope.page_params.status,
               "bcae014": $scope.page_params.program_job_no,
               "bcae015": $scope.page_params.status,       //A開立新單/S過賬/Y確認
               "info_id": $scope.page_params.info_id || angular.copy(l_info_id),
               "has_source": true,   //是否有來源單據
            }

            $scope.inquiry_list_title_already = $scope.langs.alreadyReceive
            $scope.inquiry_list_title_should = $scope.langs.shouldReceive
         }

         //取得清單資訊
         function getList() {
            var doc_array = kb_04_requisition.doc_array

            if (doc_array.length > 0) {
               $scope.goodsList = angular.copy(doc_array).map(function (obj) {
                  obj["source_no"] = obj["po_no"]
                  delete obj["po_no"]

                  obj["seq"] = obj["po_sno"]
                  delete obj["po_sno"]

                  obj["item_name"] = obj["item_desc"]
                  delete obj["item_desc"]

                  return obj
               })
            }
         }

         //設置清單倉庫
         function getWarehouse() {
            //取得預設倉庫 設定頁面 或 第一筆資料
            var out_warehouse = $scope.page_params.warehouse_no || $scope.userInfo.warehouse_no || ((userInfoService.warehouse[0]) ? userInfoService.warehouse[0].warehouse_no : "")

            //取得倉、儲、批資訊
            var index = userInfoService.warehouseIndex[out_warehouse] || 0
            var out_storage_management = ((userInfoService.warehouse[index]) ? userInfoService.warehouse[index].storage_management : "N") || "N"
            var out_warehouse_cost = ((userInfoService.warehouse[index]) ? userInfoService.warehouse[index].warehouse_cost : "N") || "N"
            $scope.sel_in_storage = ((userInfoService.warehouse[index]) ? userInfoService.warehouse[index].storage_spaces : [])
            var out_storage_spaces_no = " "
            if (out_storage_management == "Y") {
               out_storage_spaces_no = (($scope.sel_in_storage[0]) ? $scope.sel_in_storage[0].storage_spaces_no : " ")
            }

            angular.forEach($scope.goodsList, function (item) {
               item.warehouse_no = out_warehouse
               item.storage_spaces_no = out_storage_spaces_no
               item.lot_no = $scope.page_params.lot_no || " "
            })
         }

         function callWSAppTodoDocGet(doc_array) {
            var param_master = doc_array.map(function (ele, index, arr) {
               return {
                  "doc_no": ele.source_no,
                  "seq": ele.seq
               }
            })

            var webTran = {
               "service": "app.todo.doc.get",
               "parameter": {
                  "program_job_no": $scope.page_params.program_job_no,
                  "scan_type": $scope.page_params.scan_type,
                  "status": $scope.page_params.status,
                  "analysis_symbol": userInfoService.userInfo.barcode_separator || "%",
                  "site_no": userInfoService.userInfo.site_no,
                  "info_id": $scope.l_data.info_id,
                  "param_master": param_master
               }
            }

            if (ReqTestData.testData) {
               var parameter = ReqTestData.kb_getAppTodoDoc(webTran.parameter, doc_array)
               InsertToBcmcBcme(parameter)
               return
            }

            $ionicLoading.show()
            APIService.Web_Post(webTran, function (res) {
               $ionicLoading.hide()
               console.log("success:" + res)
               var parameter = res.payload.std_data.parameter
               InsertToBcmcBcme(parameter)
            }, function (error) {
               $ionicLoading.hide()
               var execution = error.payload.std_data.execution
               console.log("error:" + execution.description)
               userInfoService.getVoice(execution.description, function () {
               })
            })
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

         //==================== 內部呼叫 Function ====================(E)


         //==================== 外部呼叫 Function ====================(S)

         $scope.goTodolistNotice = function () {
            var page = "kb_02_s01"

            kb_04_requisition.init()

            //清空DB資料
            clearSqlite()
            $state.go(page)
         }

         $scope.page_init = function () {
            page_init()
         }

         $scope.addGoods = function (obj) {
            $scope.goodsList.unshift(angular.copy(obj))
         }

         $scope.deleteGoods = function (index) {
            $scope.goodsList.splice(index, 1)
            $ionicListDelegate.closeOptionButtons()
         }

         $scope.setDataCollection = function (array) {
            $scope.data_collection = array
         }

         $scope.callWSAppTodoDocGet = function () {
            clearSqlite()
            callWSAppTodoDocGet($scope.goodsList)
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
                  //入項數量控卡
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

         //==================== 外部呼叫 Function ====================(E)


         //==================== 呼叫 BDL 元件 ====================(S)

         function clearSqlite() {
            if (commonService.Platform == "Chrome") {
               return
            }

            $ionicLoading.show()
            APIBridge.callAPI("bcme_ae_af_delete", [$scope.l_data]).then(function (result) {
               $ionicLoading.hide()
            }, function (result) {
               $ionicLoading.hide()
               userInfoService.getVoice("bcme_ae_af_delete fail", function () { })
               console.log(result)
            })
         }

         function InsertToBcmcBcme(parameter) {
            $scope.goodsList.map(function (obj) {
               var index = parameter.source_doc_detail.findIndex(function (item) {
                  return item.source_no == obj.source_no &&
                     item.seq == obj.seq
               })

               if (index !== -1) {
                  //原單單位
                  obj.unit_no = parameter.source_doc_detail[index].unit_no
                  obj.unit = obj.unit_no  //多單位資料顯示用

                  //小數取位
                  obj.decimal_places = parameter.source_doc_detail[index].decimal_places
                  obj.decimal_places_type = parameter.source_doc_detail[index].decimal_places_type

                  //從 app.todo.doc.get 取得多單位資訊
                  //參考單位
                  obj.reference_unit_no = parameter.source_doc_detail[index].reference_unit_no
                  obj.reference_qty = parameter.source_doc_detail[index].reference_qty || 0
                  obj.reference_rate = parameter.source_doc_detail[index].reference_rate
                  obj.reference_decimal_places = parameter.source_doc_detail[index].reference_decimal_places
                  obj.reference_decimal_places_type = parameter.source_doc_detail[index].reference_decimal_places_type
                  //計價單位
                  obj.valuation_unit_no = parameter.source_doc_detail[index].valuation_unit_no
                  obj.valuation_qty = parameter.source_doc_detail[index].valuation_qty || 0
                  obj.valuation_rate = numericalAnalysisService.accDiv(obj.qty, obj.valuation_qty)

                  //多單位控管方式
                  obj.multi_unit_type = parameter.source_doc_detail[index].multi_unit_type

                  //多單位設定顯示
                  obj.showMultiUnit = $scope.checkIsShowEditMultiUnit(obj)
               }

               return obj
            })

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

         //==================== 呼叫 BDL 元件 ====================(E)

         //初始化變數
         page_init()

         //清空DB資料
         clearSqlite()

         //設置清單資料
         getList()

         //設置清單倉庫
         getWarehouse()

         //INSERT清單資料
         callWSAppTodoDocGet($scope.goodsList)
      }
   ]
})
