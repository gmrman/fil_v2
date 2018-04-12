define(["API", "APIS", "AppLang", "array", "Directives", "ReqTestData", "ionic-popup", "commonFactory", "commonService", "userInfoService", "numericalAnalysisService"], function () {
   return ["$scope", "$state", "$stateParams", "$timeout", "$filter", "AppLang", "$ionicPopup", "$ionicModal", "$ionicListDelegate", "commonFormat", "ionicToast", "IonicClosePopupService", "kb_04_requisition", "ReqTestData", "commonFactory", "commonService", "userInfoService", "numericalAnalysisService",
      function ($scope, $state, $stateParams, $timeout, $filter, AppLang, $ionicPopup, $ionicModal, $ionicListDelegate, commonFormat, ionicToast, IonicClosePopupService, kb_04_requisition, ReqTestData, commonFactory, commonService, userInfoService, numericalAnalysisService) {

         //============================== 內部呼叫 Function ==============================(E)
         var nuberFixed = numericalAnalysisService

         function page_init() {
            $scope.orderBy = ""                    //排序欄位條件
            $scope.setting = {
               "orderBy": "-1"                       //排序設定-預設
            }
         }

         function setCirculationCard(scanning, parameter) {
            var source_doc_detail = parameter.source_doc_detail

            if (source_doc_detail.length <= 0) {
               if (scanning.length <= userInfoService.userInfo.lot_length) {
                  var LotPopup = $ionicPopup.show({
                     "title": $scope.langs.checkField + $scope.langs.lot,
                     "scope": $scope,
                     "buttons": [{
                        "text": $scope.langs.cancel,
                        "onTap": function () {
                           userInfoService.getVoice($scope.langs.not + $scope.langs.these + $scope.langs.receipt, function () { })
                        }
                     }, {
                        "text": $scope.langs.confirm,
                        "onTap": function () {
                           $scope.scaninfo.lot_no = scanning
                        }
                     }]
                  })
               } else {
                  userInfoService.getVoice($scope.langs.not + $scope.langs.these + $scope.langs.receipt, function () { })
               }

               return
            }
            console.log(source_doc_detail)

            $scope.addDocArray(scanning)
            $scope.InsertToBcmcBcme(parameter)
            var doc = source_doc_detail[0]
            $scope.scaninfo.qty = nuberFixed.accSub(doc.production_qty, doc.production_in_out_qty)
            var rate = nuberFixed.accAdd(1, nuberFixed.accDiv(doc.allow_error_rate, 100))
            $scope.scaninfo.maxqty = nuberFixed.to_round(nuberFixed.accSub(nuberFixed.accMul(doc.production_qty, rate), doc.production_in_out_qty), doc.decimal_places, doc.decimal_places_type)
            selItemPopShow(scanning, source_doc_detail)
         }

         function selItemPopShow(scanning, source_doc_detail) {
            if (source_doc_detail.length <= 0) {
               return
            }
            var array = []
            angular.forEach(source_doc_detail, function (value) {
               var index = array.findIndex(function (item) {
                  return commonService.isEquality(value.item_no, item.item_no) &&
                     commonService.isEquality(value.item_feature_no, item.item_feature_no) &&
                     commonService.isEquality(value.in_out_date1, item.in_out_date1)
               })

               var rate = nuberFixed.accAdd(1, nuberFixed.accDiv(value.allow_error_rate, 100))
               value.maxqty = nuberFixed.to_round(nuberFixed.accSub(nuberFixed.accMul(value.doc_qty, rate), value.in_out_qty || 0), value.decimal_places, value.decimal_places_type)

               if (index !== -1) {
                  array[index].maxqty = array[index].maxqty + value.maxqty
               } else {
                  if (value.maxqty > 0) {
                     array.push(angular.copy(value))
                  }
               }
            })

            if (array.length === 0) {
               if ($scope.page_params.in_out_no == "-1") {
                  userInfoService.getVoice($scope.langs.picks_error_1, function () { })
               } else {
                  userInfoService.getVoice($scope.langs.picks_error_2, function () { })
               }
               return
            }

            $scope.selItem = function () {
               var array = []
               angular.forEach($scope.item_detail, function (value) {
                  if (value.checked) {
                     array.push(angular.copy(value))
                  }
               })
               if (array.length === 0) {
                  userInfoService.getVoice($scope.langs.sel_item_error, function () { })
                  return
               }
               $scope.close()
               getInsertGoods(array, source_doc_detail)
            }

            $scope.item_detail = array
            $ionicModal.fromTemplateUrl("views/app/kb_04/kb_04_s03/kb_04_s03_04/selItemModal.html", {
               "scope": $scope,
               "cssClass": "kb_css"
            }).then(function (modal) {
               $scope.close = function () {
                  modal.hide().then(function () {
                     return modal.remove()
                  })
               }
               modal.show()
            })
         }

         function getInsertGoods(array, source_doc_detail) {
            var temp = {}
            var count = 0, qtyCount = 0, insertCount = 0
            var tempArr1 = [], tempArr2 = [], tempArr1_flag = false, tempArr2_flag = false

            $scope.scaninfo.checked = false
            if (array.length > 0) {
               for (var i = 0; i < source_doc_detail.length; i++) {
                  var value = source_doc_detail[i]
                  var index = array.findIndex(function (item) {
                     return commonService.isEquality(value.item_no, item.item_no) &&
                        commonService.isEquality(value.item_feature_no, item.item_feature_no)
                  })

                  if (index == -1) {
                     continue
                  }

                  if (!array[index].checked) {
                     continue
                  }
                  var rate = nuberFixed.accAdd(1, nuberFixed.accDiv(value.allow_error_rate, 100))

                  temp = {
                     "item_no": value.item_no,
                     "item_name": value.item_name || value.item_no,
                     "item_spec": " ",
                     "item_feature_no": value.item_feature_no,
                     "qty": nuberFixed.accSub(value.doc_qty, value.in_out_qty || 0),
                     "maxqty": nuberFixed.to_round(nuberFixed.accSub(nuberFixed.accMul(value.doc_qty, rate), value.in_out_qty || 0), value.decimal_places, value.decimal_places_type),
                     "warehouse_no": $scope.scaninfo.warehouse_no,
                     "warehouse_name": $scope.scaninfo.warehouse_name,
                     "storage_management": $scope.scaninfo.storage_management,
                     "storage_spaces_no": $scope.scaninfo.storage_spaces_no,
                     "storage_spaces_name": $scope.scaninfo.storage_spaces_name,
                     "lot_no": $scope.scaninfo.lot_no || value.lot_no,
                     "barcode_no": " ",
                     "qpa_molecular": value.qpa_molecular,
                     "qpa_denominator": value.qpa_denominator,
                     "source_no": value.source_no,
                     "seq": value.seq,
                     "doc_line_seq": value.doc_line_seq,
                     "doc_batch_seq": value.doc_batch_seq,
                     "object_no": value.object_no,
                     "lot_control_type": value.lot_control_type,
                     "conversion_rate_denominator": value.conversion_rate_denominator,
                     "conversion_rate_molecular": value.conversion_rate_molecular,
                     "inventory_unit": value.inventory_unit,

                     //原單單位
                     "unit_no": value.unit_no,
                     "unit": value.unit_no,  //多單位資料顯示用

                     //小數取位
                     "decimal_places": value.decimal_places,
                     "decimal_places_type": value.decimal_places_type,

                     //參考單位
                     "reference_unit_no": value.reference_unit_no,
                     "reference_qty": value.reference_qty || 0,
                     "reference_rate": value.reference_rate,
                     "reference_decimal_places": value.reference_decimal_places,
                     "reference_decimal_places_type": value.reference_decimal_places_type,
                     //計價單位
                     "valuation_unit_no": value.valuation_unit_no,
                     "valuation_qty": value.valuation_qty || 0,
                     "valuation_rate": numericalAnalysisService.accDiv(value.doc_qty, value.valuation_qty),

                     //多單位控管方式
                     "multi_unit_type": value.multi_unit_type,
                     "showMultiUnit": $scope.checkIsShowEditMultiUnit(value)
                  }

                  count = count + 1
                  var otherQty = 0
                  if ($scope.goodsList.length > 0) {
                     angular.forEach($scope.goodsList, function (item) {
                        if (commonService.isEquality(temp.source_no, item.source_no) &&
                           commonService.isEquality(temp.seq, item.seq) &&
                           commonService.isEquality(temp.doc_line_seq, item.doc_line_seq) &&
                           commonService.isEquality(temp.doc_batch_seq, item.doc_batch_seq) &&
                           (!commonService.isEquality(temp.warehouse_no, item.warehouse_no) ||
                              !commonService.isEquality(temp.storage_spaces_no, item.storage_spaces_no) ||
                              !commonService.isEquality(temp.lot_no, item.lot_no))) {
                           otherQty = nuberFixed.accAdd(otherQty, item.qty)
                        }
                     })
                     temp.qty = nuberFixed.accSub(temp.qty, otherQty)
                  }

                  if (temp.maxqty === 0) {
                     qtyCount = qtyCount + 1
                     continue
                  }

                  if ($scope.goodsList.length > 0) {
                     //檢查是否存在明細
                     index = $scope.goodsList.findIndex(function (item) {
                        return commonService.isEquality(temp.source_no, item.source_no) &&
                           commonService.isEquality(temp.seq, item.seq) &&
                           commonService.isEquality(temp.doc_line_seq, item.doc_line_seq) &&
                           commonService.isEquality(temp.doc_batch_seq, item.doc_batch_seq) &&
                           commonService.isEquality(temp.warehouse_no, item.warehouse_no) &&
                           commonService.isEquality(temp.storage_spaces_no, item.storage_spaces_no) &&
                           commonService.isEquality(temp.lot_no, item.lot_no)
                     })

                     //如果有同 單號 項次 項序 分批序 倉 儲 批
                     if (index !== -1) {
                        insertCount = insertCount + 1
                        continue
                     }
                  }

                  if ($scope.page_params.in_out_no == "-1") {
                     insertGoods(temp)
                     continue
                  }

                  //if (!userInfoService.userInfo.lot_auto) {
                  //    // 1. 必須有批號：當批號欄位沒有輸入值時，需要POP窗給使用者輸入
                  //    if (temp.lot_control_type == "1" && ($scope.page_params.in_out_no != "0" || userInfoService.userInfo.gp_flag)) {
                  //        tempArr1_flag = true;
                  //        tempArr1.push(temp);
                  //        continue;
                  //    }
                  //}

                  //// 2. 不可有批號： APP有輸入批號時　Y： 把批號清空新增　 N： 不新增到掃描明細
                  //if (temp.lot_control_type == "2" && temp.lot_no) {
                  //    tempArr2_flag = true;
                  //    tempArr2.push(temp);
                  //    continue;
                  //}

                  // 3. 不控管
                  insertGoods(temp)
               }
            }

            if (tempArr1_flag) {
               checkInsertGoods(tempArr1, "insert", "0")
            }

            if (tempArr2_flag) {
               checkInsertGoods(tempArr2, "insert", "0")
            }

            if (count == insertCount) {
               userInfoService.getVoice($scope.langs.sel_item_exist_error, function () { })
            }

            if (qtyCount !== 0) {
               if ($scope.page_params.in_out_no == "-1") {
                  userInfoService.getVoice($scope.langs.picks_error_1, function () { })
               } else {
                  userInfoService.getVoice($scope.langs.picks_error_2, function () { })
               }
            }
         }

         //入項 批號管控
         function checkInsertGoods(tempArr, type, index) {
            var flag = false
            var array = []
            // 1. 必須有批號：當批號欄位沒有輸入值時，需要POP窗給使用者輸入
            if (tempArr[0].lot_control_type == "1" && ($scope.page_params.in_out_no != "0" || userInfoService.userInfo.gp_flag)) {
               angular.forEach(tempArr, function (value) {
                  if (commonService.isNull(value.lot_no) && !userInfoService.userInfo.lot_auto) {
                     flag = true
                     array.push(value)
                  } else {
                     insertGoods(value, type, index)
                  }
               })

               if (flag) {
                  commonFactory.showLotPopup_kb($scope.scaninfo.lot_no).then(function (res) {
                     if (!commonService.isNull(res)) {
                        $scope.scaninfo.lot_no = res
                        angular.forEach(array, function (value) {
                           value.lot_no = res
                           insertGoods(value, type, index)
                        })
                     } else {
                        userInfoService.getVoice($scope.langs.lot_control_error, function () { })
                     }
                  })
               }
               return
            }

            // 2. 不可有批號： APP有輸入批號時　Y： 把批號清空新增　 N： 不新增到掃描明細
            if (tempArr[0].lot_control_type == "2") {
               angular.forEach(tempArr, function (value) {
                  if (value.lot_no && value.lot_no != " ") {
                     flag = true
                     array.push(value)
                  } else {
                     insertGoods(value, type, index)
                  }
               })

               if (flag) {
                  var LotPopup = $ionicPopup.show({
                     "title": $scope.langs.point,
                     "template": "<p style='text-align: center'>" + $scope.langs.lot_control_point + "</p>",
                     "scope": $scope,
                     "cssClass": "kb_css",
                     "buttons": [{
                        "text": $scope.langs.cancel,
                        "onTap": function () {
                        }
                     }, {
                        "text": $scope.langs.confirm,
                        "onTap": function () {
                           angular.forEach(array, function (value) {
                              value.lot_no = ""
                              insertGoods(value, type, index)
                           })
                        }
                     }]
                  })
                  IonicClosePopupService.register(false, LotPopup)
               }
               return
            }

            // 3. 不控管
            if (tempArr[0].lot_control_type == "3" || type == "split") {
               insertGoods(tempArr[0], type, index)
            }
         }

         function insertGoods(temp, type, index) {
            var flag = true
            if ($scope.goodsList.length > 0) {
               angular.forEach($scope.goodsList, function (value) {
                  if (commonService.isEquality(value.warehouse_no, temp.warehouse_no) &&
                     commonService.isEquality(value.storage_spaces_no, temp.storage_spaces_no) &&
                     commonService.isEquality(value.lot_no, temp.lot_no) &&
                     commonService.isEquality(value.source_no, temp.source_no) &&
                     commonService.isEquality(value.seq, temp.seq) &&
                     commonService.isEquality(value.doc_line_seq, temp.doc_line_seq) &&
                     commonService.isEquality(value.doc_batch_seq, temp.doc_batch_seq)) {
                     flag = false
                  }
               })
            }

            if (!flag) {
               userInfoService.getVoice($scope.langs.data_duplication_error, function () { })

               return flag
            }

            if (type == "split") {
               $scope.goodsList[index].qty = nuberFixed.accSub($scope.goodsList[index].qty, temp.qty)
               if ($scope.goodsList[index].qty === 0) {
                  $scope.deleteGoods(index)
               }
            }

            $scope.addGoods(temp)
         }

         //數量檢查
         function chkqty(oldQty, index) {
            var lot_include_qty = 0
            if (typeof index == "number") {
               lot_include_qty = $scope.goodsList[index].lot_include_qty || 0
            }

            return function (qty, maxqty, event) {
               var in_out_no = $scope.page_params.in_out_no
               var error_massage = ""

               //MD023: 数量 {0} 不可小于批号已分配的数量 {1} !
               if (qty < lot_include_qty) {
                  event.preventDefault()
                  error_massage = commonFormat.format($scope.langs.error.MD023, qty, lot_include_qty)
                  userInfoService.getVoice(error_massage, function () { })
                  qty = oldQty
               }

               if (qty > maxqty) {
                  event.preventDefault()

                  error_massage = ""
                  if (in_out_no == "-1") {
                     error_massage = AppLang.langs.picks_error_1
                  } else if (in_out_no == "1" || in_out_no == "0") {
                     error_massage = AppLang.langs.picks_error_2
                  } else {
                     error_massage = AppLang.langs.picks_error
                  }

                  userInfoService.getVoice(error_massage, function () { })
                  qty = maxqty
               }

               return +qty
            }
         }

         //數量檢查
         function chkLotqty(oldQty, lot_Info) {
            var current = $scope.lotQtyListInfo.include_qty
            if (!!lot_Info) {
               current = lot_Info.include_qty - lot_Info.qty
            }

            var currentMax = $scope.lotQtyListInfo.maxqty

            return function (qty, maxqty, event) {
               var diff = nuberFixed.accSub(oldQty, qty)
               var current_sum = nuberFixed.accSub(current, diff)

               var condition = true
               while (condition) {

                  //MD005: 數量不可超過原單據數量!
                  if (current_sum > currentMax) {
                     event.preventDefault()
                     var error_massage = $scope.langs.error.MD005
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

         function getLotQtyListInfo() { 
            return $scope.lotQtyListInfo
         }

         function sumIncludeQty(type) {
            var inputQty = $scope.lotQtyListInfo.qty, obj

            if ($scope.lotQtyList.length > 0) {
               obj = $scope.lotQtyList.reduce(function (obj_A, obj_B) {
                  if (!obj_A) {
                     obj_A = { "qty": 0 }
                  }

                  if (!obj_B) {
                     obj_B = { "qty": 0 }
                  }

                  return {
                     "qty": nuberFixed.accAdd(obj_A.qty, obj_B.qty)
                  }
               })
            }

            if (!obj) {
               obj = { "qty": 0 }
            }

            //離開Modal窗口
            if (type === "exit") {
               return obj.qty
            }

            return (obj.qty + inputQty)
         }

         function chkLotData(lotQtyListInfo) {
            if (lotQtyListInfo.lot === "") {
               //MD020: 欄位{0}不可空白!,
               var msg = commonFormat.format($scope.langs.error.MD020, " [" + $scope.langs.lot + "] ")
               showToastMiddle(msg)
               return false
            }
            if (lotQtyListInfo.qty === 0) {
               //MD022: 數量不可為零!,
               showToastMiddle($scope.langs.error.MD022)
               return false
            }

            var flag = $scope.lotQtyList.some(function (lotQty) {
               return lotQty.lot === lotQtyListInfo.lot
            })
            if (flag) {
               //MD021: 此批号已存在清单中!,
               showToastMiddle($scope.langs.error.MD021)
               return false
            }

            if (lotQtyListInfo.include_qty > lotQtyListInfo.maxqty) {
               //MD005: 數量不可超過原單據數量
               showToastMiddle($scope.langs.error.MD005)
               return false
            }

            return true
         }

         //顯示 Toast 訊息
         function showToastMiddle(msg) {
            ionicToast.show(msg, "middle", false, 1500)
         }

         //============================== 內部呼叫 Function ==============================(E)


         //============================== 外部呼叫 Function ==============================(S)

         //點擊item呼叫數量彈窗
         $scope.OptionChangeNum = function (index, showMultUnit) {
            $ionicListDelegate.closeOptionButtons()

            //呼叫調整數量彈窗
            if (index >= 0) {
               //是否顯示成多單位彈窗
               if (showMultUnit) {
                  $scope.editMultiUnit("detail", index)
               }
               else {
                  $scope.showQtyPop(index)
               }
            }
         }

         //顯示排序設定
         $scope.showOrderBy = function () {
            commonFactory.showOrderByPopup($scope.setting.orderBy).then(function (res) {
               if (typeof res !== "undefined") {
                  $scope.setting.orderBy = res

                  switch ($scope.setting.orderBy) {
                     case "0":
                        $scope.orderBy = ["source_no", "seq"]
                        break
                     case "1":
                        $scope.orderBy = ["-!checked"]
                        break
                     default:
                        $scope.orderBy = ""
                  }
               }
            })
         }

         //拆分
         $scope.splitGoods = function (index) {
            $scope.showGood = angular.copy($scope.goodsList[index])
            $scope.showGood.splitIndex = index
            $scope.showGood.popmaxqty = $scope.showGood.qty
            $scope.showGood_old = angular.copy($scope.goodsList[index])
            var out_warehouse = $scope.showGood.warehouse_no
            //取得倉庫資訊
            var warehouseIndex = userInfoService.warehouseIndex[out_warehouse] || 0
            var out_storage_management = userInfoService.warehouse[warehouseIndex].storage_management || "N"
            $scope.sel_in_storage_Pop = userInfoService.warehouse[warehouseIndex].storage_spaces

            //入項拆分功能
            $scope.setSplitItem = function () {
               if ($scope.showGood.storage_management == "Y") {
                  if (commonService.isNull($scope.showGood.storage_spaces_no)) {
                     userInfoService.getVoice($scope.langs.storage_management_error, function () { })
                     return
                  }
               }
               $scope.closeSplitItemModal()
               checkInsertGoods([$scope.showGood], "split", index)
               return
            }

            $ionicModal.fromTemplateUrl("views/app/kb_04/kb_04_s03/kb_04_s03_04/splitItemModal.html", {
               "scope": $scope,
               "cssClass": "kb_css"
            }).then(function (modal) {
               $scope.closeSplitItemModal = function () {
                  modal.hide().then(function () {
                     return modal.remove()
                  })
               }
               modal.show()
            })
            $ionicListDelegate.closeOptionButtons()
         }

         $scope.warehouseShowPop = function () {
            commonFactory.showWarehouseModal_kb(userInfoService.warehouse, $scope.showGood, $scope.setwarehousePop, function () { })
         }

         $scope.setwarehousePop = function (warehouse) {
            $scope.showGood.warehouse_no = warehouse.warehouse_no
            $scope.showGood.warehouse_name = warehouse.warehouse_name
            $scope.showGood.storage_management = warehouse.storage_management
            $scope.sel_in_storage_Pop = warehouse.storage_spaces
            $scope.clearStoragePop()
         }

         $scope.storageShowPop = function () {
            commonFactory.showStorageModal_kb($scope.sel_in_storage_Pop, $scope.showGood, $scope.setstoragePop, function () { })
         }

         $scope.setstoragePop = function (storage) {
            $scope.showGood.storage_spaces_no = storage.storage_spaces_no
            $scope.showGood.storage_spaces_name = storage.storage_spaces_name
         }

         $scope.clearStoragePop = function () {
            $scope.setstoragePop({
               "storage_spaces_no": "",
               "storage_spaces_name": ""
            })
         }

         //数量弹窗
         $scope.showQtyPop = function (type) {
            var maxqty = 0
            var qty = 0
            if (type == "scaninfo") {
               maxqty = $scope.scaninfo.maxqty
               qty = $scope.scaninfo.qty
            } else if (type == "pop") {
               maxqty = $scope.showGood.popmaxqty
               qty = $scope.showGood.qty
            } else {
               var temp = $scope.goodsList[type]
               var otherQty = 0
               angular.forEach($scope.goodsList, function (value) {
                  if (commonService.isEquality(value.source_no, temp.source_no) &&
                     commonService.isEquality(value.seq, temp.seq) &&
                     commonService.isEquality(value.doc_line_seq, temp.doc_line_seq) &&
                     commonService.isEquality(value.doc_batch_seq, temp.doc_batch_seq) &&
                     (!commonService.isEquality(value.warehouse_no, temp.warehouse_no) ||
                        !commonService.isEquality(value.storage_spaces_no, temp.storage_spaces_no) ||
                        !commonService.isEquality(value.lot_no, temp.lot_no))) {
                     otherQty = nuberFixed.accAdd(otherQty, value.qty)
                  }
               })
               maxqty = nuberFixed.accSub(temp.maxqty, otherQty)
               qty = $scope.goodsList[type].qty
            }

            commonFactory.showQtyPopup_kb(type, qty, maxqty, chkqty(qty, type)).then(function (res) {
               if (typeof res !== "undefined") {
                  if (type == "scaninfo") {
                     $scope.scaninfo.qty = checkShowgood(res)
                  } else if (type == "pop") {
                     $scope.showGood.qty = checkQty(res, type)
                  } else {
                     $scope.goodsList[type].qty = checkQty(res, type)
                  }
               }
            })
         }

         var checkQty = function (qty, index) {
            if (index == "pop") {
               if (qty > $scope.showGood.popmaxqty) {
                  qty = $scope.showGood.popmaxqty
               } else if (qty < 1) {
                  qty = 1
               }
            } else {
               var temp = $scope.goodsList[index]
               var otherQty = 0
               angular.forEach($scope.goodsList, function (value) {
                  if (commonService.isEquality(value.source_no, temp.source_no) &&
                     commonService.isEquality(value.seq, temp.seq) &&
                     commonService.isEquality(value.doc_line_seq, temp.doc_line_seq) &&
                     commonService.isEquality(value.doc_batch_seq, temp.doc_batch_seq) &&
                     (!commonService.isEquality(value.warehouse_no, temp.warehouse_no) ||
                        !commonService.isEquality(value.storage_spaces_no, temp.storage_spaces_no) ||
                        !commonService.isEquality(value.lot_no, temp.lot_no))) {
                     otherQty = nuberFixed.accAdd(otherQty, value.qty)
                  }
               })
               var total = nuberFixed.accAdd(qty, otherQty)
               if (total > temp.maxqty) {
                  if ($scope.page_params.in_out_no == "-1") {
                     userInfoService.getVoice($scope.langs.picks_error_1, function () { })
                  } else {
                     userInfoService.getVoice($scope.langs.picks_error_2, function () { })
                  }
                  qty = nuberFixed.accSub(temp.maxqty, otherQty)
               } else if (qty < 1) {
                  qty = 1
               }
            }
            return qty
         }

         //計算加減後數值 並呼叫撿查
         $scope.compute = function (value) {
            var value1 = angular.copy($scope.scaninfo.qty)
            var num = nuberFixed.accAdd(Number(value1), Number(value))
            if (num < 1) {
               num = 1
            }
            $scope.scaninfo.qty = checkShowgood(num)
         }

         var checkShowgood = function (qty) {
            if (qty > $scope.scaninfo.maxqty) {
               if ($scope.page_params.in_out_no == "-1") {
                  userInfoService.getVoice($scope.langs.picks_error_1, function () { })
               } else {
                  userInfoService.getVoice($scope.langs.picks_error_2, function () { })
               }
               qty = $scope.scaninfo.maxqty
            } else if (qty < 1) {
               qty = 1
            }

            //生產數量*標準QPA分子/標準QPA分母
            if ($scope.goodsList.length > 0) {
               angular.forEach($scope.goodsList, function (value) {

                  //防呆 避免WS無回傳值
                  if (!value.qpa_molecular) {
                     value.qpa_molecular = 1
                  }
                  if (!value.qpa_denominator) {
                     value.qpa_denominator = 1
                  }
                  var tempQty = 0
                  tempQty = nuberFixed.to_round(nuberFixed.accDiv(nuberFixed.accMul(qty, value.qpa_molecular), value.qpa_denominator), value.decimal_places, value.decimal_places_type)
                  value.qty = tempQty
               })
            }

            return qty
         }

         //計算數值是否小於0
         var checkmin = function (value, value2) {
            var num = nuberFixed.accAdd(Number(value), Number(value2))
            if (num <= 0) {
               num = 1
            }
            return num
         }

         //計算加減後數值 並呼叫撿查
         var compute = function (type, value) {
            if (type == "pop") {
               $scope.showGood.qty = checkQty(checkmin($scope.showGood.qty, value), type)
            } else {
               $scope.goodsList[type].qty = checkQty(checkmin($scope.goodsList[type].qty, value), type)
            }
         }

         $scope.mins = function (type) {
            console.log("mins")
            compute(type, -1)
         }

         $scope.add = function (type) {
            console.log("add")
            compute(type, 1)
         }

         $scope.checkedALL = function () {
            angular.forEach($scope.item_detail, function (value) {
               value.checked = $scope.scaninfo.checked
            })
         }

         $scope.closeOption = function () {
            $ionicListDelegate.closeOptionButtons()
         }

         $scope.showLotQtyList = function (index, showMultiUnit) {
            $scope.type = $scope.langs.put_in_storage

            $scope.lotQtyList = angular.copy($scope.goodsList[index].lotQtyList) || []
            $scope.lotQtyListInfo = {
               "index": index,
               "maxqty": $scope.goodsList[index].qty,
               "lot": "",
               "include_qty": $scope.goodsList[index].lot_include_qty || 0,
               "qty": $scope.goodsList[index].qty - ($scope.goodsList[index].lot_include_qty || 0),
               "reference_qty": $scope.goodsList[index].reference_qty
            }
            $scope.lotQtyListInfo.include_qty += $scope.lotQtyListInfo.qty
            $scope.lotQtyListInfo.showMultiUnit = showMultiUnit

            var copyMultUnit = $scope.$on("lotQtyListInfo", function (event, type, multUnit) {
               if (type === "detail_lotQty") {
                  $scope.lotQtyList[multUnit.index] = angular.copy(multUnit)
                  $scope.lotQtyListInfo.qty = $scope.lotQtyListInfo.maxqty - (sumIncludeQty() - $scope.lotQtyListInfo.qty)
                  $scope.lotQtyListInfo.include_qty = sumIncludeQty()
               }
               else {
                  $scope.lotQtyListInfo = angular.copy(multUnit)
                  $scope.lotQtyListInfo.include_qty = sumIncludeQty()
               }
            })

            $ionicModal.fromTemplateUrl("views/app/kb_04/kb_04_common/lotQtyListModal.html", {
               "scope": $scope,
            }).then(function (modal) {
               $scope.closeLotQtyListModal = function () {
                  $scope.lotQtyListInfo.include_qty = sumIncludeQty("exit")

                  modal.hide().then(function () {
                     $scope.goodsList[index].lotQtyList = angular.copy($scope.lotQtyList) || []
                     $scope.goodsList[index].lot_include_qty = $scope.lotQtyListInfo.include_qty || 0

                     copyMultUnit()
                     return modal.remove()
                  })
               }

               modal.show()
            })

            $ionicListDelegate.closeOptionButtons()
         }

         $scope.setLotQtyList = function (lotQtyListInfo) {
            $ionicListDelegate.closeOptionButtons()

            if (!chkLotData(lotQtyListInfo)) {
               return
            }
            $scope.goodsList[lotQtyListInfo.index].lotQtyList = angular.copy($scope.lotQtyList) || []

            var obj = {
               "lot": lotQtyListInfo.lot,
               "qty": lotQtyListInfo.qty,
               "maxqty": lotQtyListInfo.maxqty,
               "sumIncludeQty": sumIncludeQty,
               "getLotQtyListInfo": getLotQtyListInfo,
               "showMultiUnit": lotQtyListInfo.showMultiUnit
            }
            $scope.addLotQtyList(lotQtyListInfo.index, obj)
            $scope.lotQtyList = angular.copy($scope.goodsList[lotQtyListInfo.index].lotQtyList) || []

            //初始化
            lotQtyListInfo.lot = ""
            lotQtyListInfo.qty = lotQtyListInfo.maxqty - lotQtyListInfo.include_qty

            //彙總數值
            lotQtyListInfo.include_qty = sumIncludeQty()
         }

         //直接輸入數值
         $scope.showLotQtyPop = function (lot, lot_Info) {
            //多單位時, 不走原邏輯
            if (lot.showMultiUnit) {
               return
            }

            var temp = angular.copy(lot)

            //var maxqty = Infinity;   //無限制
            //數值彈窗可輸入的最大值: 單據數量 - 批號輸入數量 + 維護中的批號
            var maxqty = nuberFixed.accAdd(nuberFixed.accSub($scope.lotQtyListInfo.maxqty, $scope.lotQtyListInfo.include_qty), temp.qty)

            if (!!lot_Info) {   //單據數量 - 批號輸入數量 - 無批號數量 - 維護中的批號
               maxqty = nuberFixed.accSub(lot_Info.maxqty, nuberFixed.accSub(nuberFixed.accSub(lot_Info.include_qty, lot_Info.qty), temp.qty))
            }

            commonFactory.showQtyPopup_kb("", temp.qty, maxqty, chkLotqty(temp.qty, lot_Info)).then(function (res) {
               if (typeof res !== "undefined") {
                  lot.qty = res

                  //與原數量差距
                  var value = nuberFixed.accSub(res, temp.qty)
                  //未分配數量
                  var not_allot = nuberFixed.accSub(lot_Info.maxqty, lot_Info.include_qty)

                  if (!!lot_Info && (value > not_allot || value < 0)) {
                     lot_Info.qty = nuberFixed.accSub(lot_Info.qty, nuberFixed.accSub(value, not_allot))
                  }

                  $scope.lotQtyListInfo.include_qty = sumIncludeQty()
               }
            })
         }

         //數量增加、減少
         $scope.lot_compute = function (lot, value, lot_Info) {
            //多單位時, 不走原邏輯
            if (lot.showMultiUnit) {
               return
            }
            
            //型態轉換為Number
            value = +value

            if (lot.qty == 0 && value == -1) {
               //MD008: 數量已達最小值!
               showToastMiddle($scope.langs.error.MD008)
               return
            }

            if (lot.qty == 1 && value == -1 && lot.index === undefined) {
               //MD022: 數量不可為零!
               showToastMiddle($scope.langs.error.MD022)
               return
            }

            if ((!lot_Info || lot_Info.qty <= 0) && $scope.lotQtyListInfo.include_qty >= $scope.lotQtyListInfo.maxqty && value == 1) {
               //MD005: 數量不可超過原單據數量
               showToastMiddle($scope.langs.error.MD005)
               return
            }

            lot.qty = nuberFixed.accAdd(lot.qty, value)
            if (!!lot_Info && (lot_Info.include_qty == lot_Info.maxqty || value == "-1")) {
               lot_Info.qty = nuberFixed.accSub(lot_Info.qty, value)
            }

            $scope.lotQtyListInfo.include_qty = sumIncludeQty()
         }

         $scope.delLotList = function (index) {
            $scope.lotQtyList.splice(index, 1)
            $scope.lotQtyListInfo.qty = $scope.lotQtyListInfo.maxqty - sumIncludeQty() + $scope.lotQtyListInfo.qty
            $scope.lotQtyListInfo.include_qty = sumIncludeQty()

            $ionicListDelegate.closeOptionButtons()
         }


         //============================== 外部呼叫 Function ==============================(E)

         page_init()

         //匯入進貨導引清單
         if ($scope.page_params.warehouse_no && $scope.goodsList.length === 0) {
            if (kb_04_requisition.source_doc_detail.length > 0) {
               setCirculationCard(" ", kb_04_requisition)
            }
         }
      }
   ]
})
