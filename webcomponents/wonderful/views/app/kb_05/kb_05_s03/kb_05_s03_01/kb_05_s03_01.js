define(["API", "APIS", "AppLang", "array", "Directives", "ReqTestData", "ionic-popup", "commonFactory", "commonFormat"], function () {
   return ["$rootScope", "$scope", "$state", "$stateParams", "$timeout", "$filter", "AppLang", "APIService", "APIBridge", "$ionicListDelegate", "$ionicModal", "numericalAnalysisService", "ReqTestData", "commonFactory", "$ionicScrollDelegate", "$ionicPosition", "IonicPopupService", "userInfoService", "commonFormat", "commonService", "kb_05_requisition", "$q", "$ionicLoading",
      function ($rootScope, $scope, $state, $stateParams, $timeout, $filter, AppLang, APIService, APIBridge, $ionicListDelegate, $ionicModal, numericalAnalysisService, ReqTestData, commonFactory, $ionicScrollDelegate, $ionicPosition, IonicPopupService, userInfoService, commonFormat, commonService, kb_05_requisition, $q, $ionicLoading) {

         //==================== 內部呼叫 Function ====================(S)

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
            $scope.source_doc_detail = []
            $scope.userInfo = userInfoService.getUserInfo()
         }

         function getDataList() {
            var doc_type = ""
            var checkDoc = kb_05_requisition.doc_array

            if (checkDoc.length > 0) {
               doc_type = checkDoc[0].doc_type

               //依據單據類型給予代號
               switch (doc_type) {
                  case "1":   //工入
                     $scope.l_data.bcae014 = "9-2"
                     $scope.l_data.bcae015 = "S"
                     $scope.l_data.mod = "ASF"
                     break

                  case "2":   //雜入
                     $scope.l_data.bcae014 = "12"
                     $scope.l_data.bcae015 = "S"
                     $scope.l_data.mod = "AIN"
                     break

                  case "3":   //銷退
                     $scope.l_data.bcae014 = "6"
                     $scope.l_data.bcae015 = "S"
                     $scope.l_data.mod = "AXM"
                     break

                  case "4":   //退料
                     $scope.l_data.bcae014 = "8"
                     $scope.l_data.bcae015 = "S"
                     $scope.l_data.mod = "ASF"
                     break

                  default:
                     $scope.l_data.bcae014 = $scope.page_params.program_job_no
                     $scope.l_data.bcae015 = $scope.page_params.status   //A開立新單/S過賬/Y確認
                     $scope.l_data.mod = $scope.page_params.status
                     break
               }
               $scope.l_data.bcae006 = $scope.l_data.bcae014 + $scope.l_data.bcae015

               //設定各作業數據匯總時所顯示的標題
               switch ($scope.l_data.bcae014) {
                  case "12":
                     $scope.inquiry_list_title_already = $scope.langs.alreadyReceive
                     $scope.inquiry_list_title_should = $scope.langs.shouldReceive
                     break
                  case "9-2":
                     $scope.inquiry_list_title_already = $scope.langs.alreadyPutInStorage
                     $scope.inquiry_list_title_should = $scope.langs.shouldPutInStorage
                     break
                  case "6":
                  case "8":
                     $scope.inquiry_list_title_already = $scope.langs.alreadyReturn
                     $scope.inquiry_list_title_should = $scope.langs.shouldReturn
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
               getDataDetail(search, doc_type)
            }
         }

         function getDataDetail(search, doc_type) {
            var service = "app.km.oh.stkin.detail.get"
            var parameter = {
               "site_no": userInfoService.userInfo.site_no,
               "doc_type": doc_type,
               "search_cond": search
            }

            var webTran = {
               "service": service,
               "parameter": parameter
            }

            $ionicLoading.show()
            if (ReqTestData.testData) {
               $ionicLoading.hide()

               var doc_key = search.split(";")
               var doc_array = []

               for (var i = 0; i < doc_key.length; i++) {
                  var length = 0

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
                           "doc_no": doc_key[i],
                           "doc_seq": j + 1,
                           "item_no": item.item_no,
                           "item_desc": item.item_desc,
                           "item_spec": item.item_spec,
                           "store": item.store,
                           "location": item.location,
                           "lot_no": item.lot,
                           "qty": item.qty
                        }
                     )
                  }
               }

               getDocInfo(doc_array).then(function (obj) {
                  $scope.source_doc_detail = obj.source_doc_detail
                  changeWarehouse(doc_array, obj.lotTypeList)
               })
            }
            else {
               APIService.Web_Post(webTran, function (res) {
                  //資料取得成功
                  $ionicLoading.hide()
                  console.log("success:" + res)

                  var parameter = res.payload.std_data.parameter

                  //取得單據明細資料
                  var doc_array = []
                  angular.forEach(parameter.detaillist, function (item) {
                     doc_array.push({
                        "doc_no": item.doc_no,
                        "seq": (doc_type == "1") ? "" : item.doc_seq
                     })
                  })
                  doc_array = commonFormat.dedup(doc_array, "doc_no", "seq")

                  getDocInfo(doc_array).then(function (obj) {
                     $scope.source_doc_detail = obj.source_doc_detail
                     changeWarehouse(parameter.detaillist, obj.lotTypeList)
                  })
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
         function changeWarehouse(detaillist, lotTypeList) {
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

            changeDocuments($scope.warehouse_list, lotTypeList)
         }

         //更新單據資料
         function changeDocuments(detaillist, lotTypeList) {
            //清單顯示用-單據
            $scope.documentsGroupBy = commonFormat.GroupByOut(detaillist, "store", "location", "item_no", "doc_no", "doc_seq")
            var keys = Object.keys($scope.documentsGroupBy)

            $scope.documents_sum = []
            for (var i = 0, len = keys.length; i < len; i++) {
               $scope.documents_sum.push($scope.documentsGroupBy[keys[i]].reduce(function (obj_A, obj_B) {
                  return {
                     "index": i,
                     "showWarehouse": false,        //是否顯示倉儲批
                     "chkitem": false,              //確認完畢
                     "doc_no": obj_B.doc_no,
                     "doc_seq": obj_B.doc_seq,
                     "lot_control_type": lotTypeList[obj_B.doc_no + "_" + obj_B.doc_seq],
                     "store": obj_B.store,
                     "location": obj_B.location,
                     "lot_no": obj_B.lot_no,
                     "item_no": obj_B.item_no,
                     "item_desc": obj_B.item_desc,
                     "item_spec": obj_B.item_spec,
                     "qty": ((obj_A.qty || 0) + obj_B.qty) || 0,
                     "include_qty": ((obj_A.include_qty || 0) + obj_B.include_qty) || 0
                  }
               }, ""))

               $scope.setDocWarehouse($scope.documents_sum[i])
            }
         }

         //取得單據明細資料
         function getDocInfo(doc_array) {
            var webTran = {
               "service": "app.todo.doc.get",
               "parameter": {
                  "program_job_no": $scope.l_data.bcae014,
                  "scan_type": "1",
                  "status": $scope.l_data.bcae015,
                  "analysis_symbol": userInfoService.userInfo.barcode_separator || "%",
                  "site_no": userInfoService.userInfo.site_no,
                  "info_id": $scope.l_data.info_id,
                  "param_master": doc_array
               }
            }

            $ionicLoading.show()
            /* if (ReqTestData.testData) {
               $ionicLoading.hide()
               var lotTypeList = parameter.source_doc_detail.reduce(function (obj_A, obj_B) {
                  obj_A[obj_B.source_no + "_" + obj_B.seq] = obj_B.lot_control_type

                  return obj_A
               }, {})

               return lotTypeList
            } else { */
            var todoDocJob = $q.defer()
            var todoDocPromise = todoDocJob.promise  // 返回 Promise

            APIService.Web_Post(webTran, function (res) {
               $ionicLoading.hide()
               console.log("success:" + res)
               var parameter = res.payload.std_data.parameter
               var lotTypeList = parameter.source_doc_detail.reduce(function (obj_A, obj_B) {
                  obj_A[obj_B.source_no + "_" + obj_B.seq] = obj_B.lot_control_type

                  return obj_A
               }, {})

               todoDocJob.resolve({
                  "source_doc_detail": parameter.source_doc_detail,
                  "lotTypeList": lotTypeList
               })
            }, function (error) {
               $ionicLoading.hide()
               var execution = error.payload.std_data.execution

               console.log("error:" + execution.description)
               userInfoService.getVoice(execution.description, function () { })

               todoDocJob.reject("", "")
            })

            return todoDocPromise
            /* } */
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

         //==================== 內部呼叫 Function ====================(E)


         //==================== 外部呼叫 Function ====================(S)

         $scope.goToPage = function () {
            $timeout(function () {
               $state.go("kb_05_s01")
            }, 0)
         }

         //設置單據倉儲清單
         $scope.setDocWarehouse = function (documents) {
            //取得預設倉庫 設定頁面 或 第一筆資料
            var out_warehouse = documents.store || $scope.userInfo.warehouse_no || userInfoService.warehouse[0].warehouse_no

            //取得倉庫資訊
            var warehouse_idx = userInfoService.warehouseIndex[out_warehouse]

            var out_warehouse_name = ""
            var out_storage_management = "N"
            var out_warehouse_cost = ""
            var out_storage_spaces_no = " "
            if (warehouse_idx >= 0) {
               out_warehouse_name = userInfoService.warehouse[warehouse_idx].warehouse_name
               out_storage_management = userInfoService.warehouse[warehouse_idx].storage_management || "N"
               out_warehouse_cost = userInfoService.warehouse[warehouse_idx].warehouse_cost || "N"
               $scope.sel_in_storage = userInfoService.warehouse[warehouse_idx].storage_spaces
               if (out_storage_management == "Y") {
                  out_storage_spaces_no = $scope.sel_in_storage[0].storage_spaces_no
               }
            }

            //取得單據資訊
            var index = $scope.source_doc_detail.findIndex(function (item) {
               //ZHEN-TEST
               //if (item.seq / 10 === documents.doc_seq) {
               //   item.seq = documents.doc_seq
               //}
               return commonService.isEquality(documents.doc_no, item.source_no) &&
                  commonService.isEquality(documents.doc_seq, item.seq)
            })

            //設定多單位資料
            var unit_no = ""

            var reference_unit_no = ""
            //var reference_qty = 0
            var reference_rate = 0
            var reference_decimal_places = 0
            var reference_decimal_places_type = 0
            var valuation_unit_no = ""
            //var valuation_qty = 0
            var multi_unit_type = 1
            var showMultiUnit = false
            if (index !== -1) {
               unit_no = $scope.source_doc_detail[index].unit_no

               reference_unit_no = $scope.source_doc_detail[index].reference_unit_no
               //reference_qty = $scope.source_doc_detail[index].reference_qty
               reference_rate = $scope.source_doc_detail[index].reference_rate
               reference_decimal_places = $scope.source_doc_detail[index].reference_decimal_places
               reference_decimal_places_type = $scope.source_doc_detail[index].reference_decimal_places_type
               valuation_unit_no = $scope.source_doc_detail[index].valuation_unit_no
               //valuation_qty = $scope.source_doc_detail[index].valuation_qty
               multi_unit_type = $scope.source_doc_detail[index].multi_unit_type

               showMultiUnit = $scope.checkIsShowEditMultiUnit($scope.source_doc_detail[index])
            }

            documents.store = out_warehouse

            //建立單據入庫資料
            documents.warehouse_data = {
               "maxqty": documents.qty,    //最大數量
               "warehouse_no": out_warehouse,
               "warehouse_name": out_warehouse_name,
               "warehouse_cost": out_warehouse_cost,
               "sel_in_storage": $scope.sel_in_storage,
               "storage_management": out_storage_management,
               "storage_spaces_no": out_storage_spaces_no,
               "storage_spaces_name": (out_storage_management == "Y") ? $scope.sel_in_storage[0].storage_spaces_name : " ",
               "lot_no": documents.lot_no || "",
               "item_no": documents.item_no,
               "item_name": documents.item_desc,
               "item_spec": documents.item_spec,
               "unit": unit_no,
               "qty": 0,
               "reference_unit_no": reference_unit_no,
               "reference_qty": 0,
               "reference_rate": reference_rate,
               "reference_decimal_places": reference_decimal_places,
               "reference_decimal_places_type": reference_decimal_places_type,
               "valuation_unit_no": valuation_unit_no,
               "valuation_qty": 0,
               "valuation_rate": 0,
               "multi_unit_type": multi_unit_type,
               "showMultiUnit": showMultiUnit
            }
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
         $scope.editMultiUnit = function (type, documents) {
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
                  item = angular.copy(documents.warehouse_data)
                  $scope.multUnit = item
                  $scope.multUnit.all_inventory_qty = item.inventory_qty || 0
                  $scope.multUnit.all_reference_qty = item.reference_qty || 0
                  $scope.multUnit.all_valuation_qty = item.valuation_qty || 0
                  $scope.multUnit.all_qty = item.qty

                  //因為初始值為零, 在維護數量時進行重新計算
                  $scope.multUnit.valuation_rate = numericalAnalysisService.accDiv($scope.multUnit.qty, $scope.multUnit.valuation_qty)

                  //待入導引沒有掃描頁, 因此在明細頁修改
                  $scope.multUnitParameter.isEditQty = true
                  break
               case "collection": //數據匯總頁
                  item = angular.copy(documents.warehouse_data)
                  $scope.multUnit = item
                  $scope.multUnit.all_inventory_qty = item.all_inventory_qty || 0   //item.already_inv_qty
                  $scope.multUnit.all_reference_qty = item.all_reference_qty || 0   //item.already_ref_qty
                  $scope.multUnit.all_valuation_qty = item.all_valuation_qty || 0   //item.already_val_qty
                  $scope.multUnit.all_qty = item.all_qty                       //item.already_qty

                  $scope.multUnit.should_inventory_qty = item.all_inventory_qty || 0
                  $scope.multUnit.should_reference_qty = item.all_reference_qty || 0
                  $scope.multUnit.should_valuation_qty = item.all_valuation_qty || 0
                  $scope.multUnit.should_qty = item.maxqty
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
                  if ($scope.multUnitParameter.type != "detail") {
                     $scope.closeMultiUnitQtyModal()
                     return
                  }

                  if ($scope.multUnit.all_qty > $scope.multUnit.maxqty) {
                     userInfoService.getVoice($scope.langs.receipt + $scope.langs.surplus + $scope.langs.qty + $scope.langs.insufficient + "！", function () {
                     })
                     $scope.multUnit.all_qty = $scope.multUnit.maxqty
                  }

                  if (documents) {
                     $scope.multUnit.qty = $scope.multUnit.all_qty
                     $scope.multUnit.inventory_qty = $scope.multUnit.all_inventory_qty
                     $scope.multUnit.reference_qty = $scope.multUnit.all_reference_qty
                     $scope.multUnit.valuation_qty = $scope.multUnit.all_valuation_qty

                     documents.warehouse_data = angular.copy($scope.multUnit)
                     documents.include_qty = $scope.multUnit.qty
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