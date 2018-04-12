define(["API", "APIS", "AppLang", "array", "Directives", "ReqTestData", "ionic-popup", "commonFactory", "commonFormat"], function () {
   return ["$rootScope", "$scope", "$state", "$stateParams", "$ionicPopup", "$filter", "$timeout", "AppLang", "APIService", "APIBridge", "$ionicListDelegate", "ReqTestData", "commonFactory", "$ionicScrollDelegate", "$ionicPosition", "IonicPopupService", "userInfoService", "commonFormat", "ionicToast", "kb_03_requisition", "numericalAnalysisService", "commonService",
      function ($rootScope, $scope, $state, $stateParams, $ionicPopup, $filter, $timeout, AppLang, APIService, APIBridge, $ionicListDelegate, ReqTestData, commonFactory, $ionicScrollDelegate, $ionicPosition, IonicPopupService, userInfoService, commonFormat, ionicToast, kb_03_requisition, numericalAnalysisService, commonService) {
         $scope.userInfo = userInfoService.getUserInfo()

         //==================== 內部呼叫 Function ====================(S)
         var nuberFixed = numericalAnalysisService

         function page_init() {
            $scope.langs = AppLang.langs

            $scope.scanInfo = {
               "scanning": ""
            }
            $scope.docEllips = 0
            $scope.orderBy = ["doc_no", "doc_seq"]
            $scope.filter = ""
            $scope.filter_lot = ""

            $timeout(function () {
               //picker資料
               if ($scope.warehouseList_filter) {
                  $scope.warehouseList.warehouse_location_item_no = $scope.warehouseList_filter
               }

               $scope.$watch("warehouseList", function (newVal, oldVal) {
                  if (newVal && newVal.warehouse_location_item_no) {
                     //關閉明細
                     if (index != undefined) {
                        $scope.documents_sum[index].showLot = false
                        index = undefined
                     }

                     var split = newVal.warehouse_location_item_no.split(";")

                     $scope.filter = {
                        //store: split[0],
                        //location: split[1],
                        "item_no": split[2]
                     }

                     $scope.filter_lot = {
                        "store": split[0],
                        "location": split[1]
                     }

                     var keys = Object.keys($scope.warehouseGroupBy)
                     for (var i = 0, len = keys.length; i < len; i++) {
                        if (keys[i] == newVal.warehouse_location_item_no) {
                           $scope.sel_index = i + 1

                           break
                        }
                     }

                     $scope.sel_list = keys.length
                  }
               }, true)
            }, 0)
         }

         //彙總已揀數量
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

         //數量檢查
         function chkqty(oldQty) {
            var current = $scope.documents_sum[index].include_qty
            var currentMax = $scope.documents_sum[index].qty

            return function (qty, maxqty, event) {
               var diff = nuberFixed.accSub(oldQty, qty)
               var current_sum = nuberFixed.accSub(current, diff)

               var condition = true
               while (condition) {
                  var error_massage = ""

                  //MD017: 此批號剩餘可揀量不足
                  if (+qty > maxqty) {
                     event.preventDefault()
                     error_massage = AppLang.langs.error.MD017
                     userInfoService.getVoice(error_massage, function () { })
                     qty = oldQty
                     break
                  }

                  //MD007: 揀料數量匯總 {0} 超過應發量 {1} !
                  if (current_sum > currentMax) {
                     event.preventDefault()
                     error_massage = commonFormat.format(AppLang.langs.error.MD007, current_sum, currentMax)
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

         //顯示 Toast 訊息
         function showToastMiddle(msg, millisecond) {
            var time = millisecond
            if (!time) {
               time = 1500
            }

            ionicToast.show(msg, "middle", false, time)
         }

         //掃描資料解析
         function checkScan(scanning) {
            var keys = Object.keys($scope.warehouseGroupBy)
            var obj = {}

            //關閉明細
            if (index != undefined) {
               $scope.documents_sum[index].showLot = false
               index = undefined
            }
            obj = pickerIndex(scanning, keys)

            if (obj["idx"] !== -1) {
               $scope.warehouseList.warehouse_location_item_no = keys[obj["idx"]]

               //找到資料便清除掃描資料
               $scope.clearScanning()
            }

            if (!commonService.isNull(userInfoService.userInfo.voice) && userInfoService.userInfo.voice != "novoice") {
               var voiceContent = obj["msg"].replace(/<br \/>/i, "")
               APIBridge.callAPI("VoiceUtils", [{
                  "someone": userInfoService.userInfo.voice,
                  "content": voiceContent
               }]).then(function (result) {
                  showToastMiddle(obj["msg"], 4000)
               }, function (result) {
                  showToastMiddle(obj["msg"], 4000)
                  //showErrorAlert(scanning, result.message);
               })
            }
            else {
               showToastMiddle(obj["msg"], 4000)
            }
         }

         function showErrorAlert(scanning, description) {
            IonicPopupService.errorAlert(description).then(function () {
            })
         }

         function pickerIndex(scanning, keys) {
            var idx = -1  //Picker Index

            //Picker目前指示
            var warehouse_location_item_no = $scope.warehouseList.warehouse_location_item_no
            var splitKeys = warehouse_location_item_no.split(";")
            var idx_old = $scope.sel_index - 1

            //解析條碼
            var split_scan = scanning.split($scope.userInfo.barcode_separator)

            var action = ""       //當前操作
            var l_lot = false     //是否存在批號資料
            var l_notErr = true   //是否資料有誤
            var msg = ""

            //檢查回傳
            var obj = {
               "idx": idx,
               "action": action
            }

            //單欄
            if (split_scan.length == 1) {
               //料號檢查
               obj = pickerIndex_forItem(split_scan, splitKeys, keys)

               //倉庫檢查
               if (obj["idx"] == -1) {
                  obj = pickerIndex_forWarehouse(split_scan, splitKeys, keys)
               }

               //儲位檢查
               if (obj["idx"] == -1) {
                  obj = pickerIndex_forStorage(split_scan, splitKeys, keys)
               }

               //批號檢查
               if (obj["idx"] == -1) {
                  obj = pickerIndex_forLot(split_scan, warehouse_location_item_no)
               }
            }
            else {  //多欄
               l_notErr = keys.some(function (itemKey) {
                  //Picker清單
                  var split_picker = itemKey.split(";")

                  return (split_picker[0] == split_scan[0] ||
                     split_picker[2] == split_scan[0])
               })

               //條碼首欄並非為料、倉
               if (!l_notErr) {
                  obj["action"] = "X"
                  obj["msg"] = commonFormat.format(AppLang.langs.notSelItem, scanning)
               }
               else {
                  //料號+倉庫+儲位+批號 檢查
                  obj = pickerIndex_forItemMultiple(scanning, split_scan, warehouse_location_item_no, keys)

                  //倉庫+儲位檢查
                  if (obj["idx"] == -1) {
                     obj = pickerIndex_forWarehouseMultiple(scanning, split_scan, splitKeys, keys)
                  }
               }
            }

            switch (obj["action"]) {
               case "A":   //停留原本位置
                  idx = idx_old
                  break

               case "B":   //詢問是否定位至指定目標
                  positionConfirm(keys[obj["idx"]], false, "")
                  idx = idx_old
                  break

               case "C":   //自動定位至指定目標
                  idx = obj["idx"]
                  break

               case "D":   //數值錯誤
                  idx = idx_old
                  break

               case "E":   //正確，並設置數量 - 僅[料批]
                  idx = idx_old

                  //撈取此批號資料
                  var documentsArr = $filter("filter")($scope.documents_sum, $scope.filter)

                  //顯示單據批號
                  if (documentsArr.length > 0) {
                     $scope.showLot(documentsArr[0])

                     //撈取批號清單
                     var lot_list = $scope.filterList(documentsArr[0].lot_list, $scope.filter_lot)
                     var index = lot_list.findIndex(function (item) {
                        return (item.lot == split_scan[1])
                     })

                     //將資料展開直到批號顯示
                     if (index !== -1 && index + 1 > documentsArr[0].lot_cnt) {
                        documentsArr[0].lot_cnt = index + 1
                     }

                     //設定批號數量
                     if (index !== -1) {
                        if (split_scan.length == 2) {
                           $scope.setIncludeQty(documentsArr[0], lot_list[index])
                        }

                        if (split_scan.length == 3) {
                           setLotQty(documentsArr[0], lot_list[index], obj["qty"])
                        }
                     }
                     else {   //預設料件數量(無批)
                        setLotQty(documentsArr[0], lot_list, obj["qty"])
                     }
                  }
                  break

               case "F":   //詢問是否定位至指定目標，並設置數量 - 僅[料批]
                  var setting = {
                     "split_scan": split_scan,
                     "qty": obj["qty"]
                  }

                  positionConfirm(keys[obj["idx"]], true, setting)
                  idx = idx_old
                  break

               default:   // X - 錯誤 or 未指定方案
                  idx = obj["idx"]
                  obj["msg"] = commonFormat.format(AppLang.langs.notSelItem, scanning)
                  break
            }
            msg = obj["msg"]

            return {
               "idx": idx,
               "msg": msg
            }
         }

         //掃描資料檢查 for 料號
         function pickerIndex_forItem(split_scan, splitKeys, keys) {
            var idx = -1       //Picker Index
            var action = ""    //後續流程控制
            var msg = ""

            //料號與目前指示的料號一致
            if (splitKeys[2] == split_scan[0]) {
               action = "E"
               idx = null

               msg = "料號與目前指示的料號一致！"
            }
            else {
               //料號是否存在發料單據中?
               var l_notErr = $scope.documents_sum.some(function (documents) {
                  return (documents.item_no == split_scan[0])
               })

               //存在料號，是否要重新定位至符合指示料號?
               if (l_notErr) {
                  action = "F"

                  idx = keys.findIndex(function (itemKey) {
                     //Picker清單
                     var split_picker = itemKey.split(";")

                     return (split_picker[2] == split_scan[0])
                  })
               }
               else {
                  action = "X"
               }
            }

            return {
               "idx": idx,
               "action": action,
               "msg": msg
            }
         }

         //掃描資料檢查 for 料號 in 多組合
         function pickerIndex_forItemMultiple(scanning, split_scan, warehouse_location_item_no, keys) {
            var idx = -1       //Picker Index
            var action = ""    //後續流程控制
            var splitKeys = warehouse_location_item_no.split(";")
            var msg = ""

            //批號存在否
            var l_flag = false

            //檢查數值欄位
            var chkqty = false   //是否為數字
            var regExp = /^[1-9][0-9]{0,6}$/  //首碼不為零`, 8碼以上當批號
            var qty = 0

            var length = "" + split_scan.length
            if ((length == "2" || length == "3") && (splitKeys[0] != split_scan[1])) {    //非倉庫
               var obj = {}

               //料批數 or 料數 or 料批
               if (splitKeys[2] == split_scan[0]) {
                  //批號存在否
                  var arr = $scope.warehouseGroupBy[warehouse_location_item_no]
                  for (var l_i = 0, len = arr.length; l_i < len; l_i++) {
                     l_flag = (arr[l_i].lot == split_scan[1])
                     if (l_flag) {
                        break
                     }
                  }

                  chkqty = (length == 2 && !l_flag) ? regExp.test(split_scan[1]) : regExp.test(split_scan[2])

                  //料數 or 料批數
                  if (chkqty) {
                     qty = (length == 2) ? Number(split_scan[1]) : Number(split_scan[2])
                  }

                  if (isNaN(qty)) {
                     action = "D"
                     msg = "數量資料格式有誤！"
                  }
                  else {
                     if ((length == 2) ? l_flag || chkqty : l_flag && chkqty) {
                        action = "E"
                        idx = null

                        msg = "料號與目前指示的料號一致！"
                     }
                     else {
                        //可能存在同料，但批號在其他項目中的資料
                        obj = pickerIndex_forItemMultiple_F(split_scan, keys)

                        idx = obj["idx"]
                        qty = obj["qty"]
                        action = obj["action"]
                        msg = obj["msg"]
                     }
                  }

                  return {
                     "idx": idx,
                     "qty": qty,
                     "action": action,
                     "msg": msg
                  }
               }
               else {
                  //料號是否存在發料單據中?
                  var l_notErr = $scope.documents_sum.some(function (documents) {
                     return (documents.item_no == split_scan[0])
                  })

                  //存在料號，是否要重新定位至符合指示料號?
                  if (l_notErr) {
                     obj = pickerIndex_forItemMultiple_F(split_scan, keys)

                     idx = obj["idx"]
                     qty = obj["qty"]
                     action = obj["action"]
                     msg = obj["msg"]
                  }
                  else {
                     action = "X"
                  }

                  return {
                     "idx": idx,
                     "qty": qty,
                     "action": action,
                     "msg": msg
                  }
               }
            }

            idx = keys.findIndex(function (itemKey) {
               //Picker清單
               var split_picker = itemKey.split(";")

               switch (length) {
                  case "4":
                     //料倉儲批
                     if (((split_picker[0] == split_scan[1]) &&   //倉庫
                        (split_picker[1] == split_scan[2]) &&    //儲位
                        (split_picker[2] == split_scan[0])))     //料件
                     {
                        //批號存在否
                        var l_flag = false
                        var arr = $scope.warehouseGroupBy[itemKey]
                        for (var l_i = 0, len = arr.length; l_i < len; l_i++) {
                           l_flag = (arr[l_i].lot == split_scan[3])
                           if (l_flag) {
                              break
                           }
                        }

                        if (l_flag) {
                           action = "C"
                           return true
                        }
                     }
                     break

                  case "3":
                     //料倉儲
                     if (((split_picker[0] == split_scan[1]) &&   //倉庫
                        (split_picker[1] == split_scan[2]) &&    //儲位
                        (split_picker[2] == split_scan[0])))     //料件
                     {
                        action = "C"
                        return true
                     }
                     break

                  case "2":
                     //料倉
                     if (((split_picker[0] == split_scan[1]) &&   //倉庫
                        (split_picker[2] == split_scan[0])))     //料件
                     {
                        action = "C"
                        return true
                     }
                     break

                  default:
                     break
               }
            })

            return {
               "idx": idx,
               "action": action,
               "msg": msg
            }
         }

         //掃描資料檢查 for 料號 in 多組合 - 項目跳轉檢查
         function pickerIndex_forItemMultiple_F(split_scan, keys) {
            var idx = -1       //Picker Index
            var action = ""    //後續流程控制
            var msg = ""

            //批號存在否
            var l_flag = false

            //檢查數值欄位
            var chkqty = false   //是否為數字
            var regExp = /^[1-9][0-9]{0,6}$/  //首碼不為零`, 8碼以上當批號
            var qty = 0

            var length = "" + split_scan.length
            idx = keys.findIndex(function (itemKey) {
               //Picker清單
               var split_picker = itemKey.split(";")

               l_flag = false
               var arr = $scope.warehouseGroupBy[itemKey]
               for (var l_i = 0, len = arr.length; l_i < len; l_i++) {
                  l_flag = (arr[l_i].lot == split_scan[1])
                  if (l_flag) {
                     break
                  }
               }

               qty = 0
               chkqty = (length == 2 && !l_flag) ? regExp.test(split_scan[1]) : regExp.test(split_scan[2])

               //料數 or 料批數
               if (chkqty) {
                  qty = (length == 2) ? Number(split_scan[1]) : Number(split_scan[2])
               }

               return (split_picker[2] == split_scan[0] &&
                  ((length == 2) ? l_flag || chkqty : l_flag && chkqty))
            })

            if (isNaN(qty)) {
               action = "D"
               msg = "數量資料格式有誤！"
            }
            else {
               if ((length == 2) ? l_flag || chkqty : l_flag && chkqty) {
                  action = "F"
               }
               else {
                  action = "X"
               }
            }

            return {
               "idx": idx,
               "qty": qty,
               "action": action,
               "msg": msg
            }
         }

         //掃描資料檢查 for 倉庫
         function pickerIndex_forWarehouse(split_scan, splitKeys, keys) {
            var idx = -1       //Picker Index
            var action = ""    //後續流程控制
            var msg = ""

            //倉庫與目前指示的倉庫一致
            if (splitKeys[0] == split_scan[0]) {
               action = "A"
               idx = null

               msg = "倉庫與目前指示的倉庫一致！"
            }
            else {
               //倉庫是否存在 Picker清單 中?
               var l_notErr = keys.some(function (itemKey) {
                  var split_picker = itemKey.split(";")

                  return (split_picker[0] == split_scan[0])
               })

               //存在倉庫，是否要重新定位至符合指示倉庫?
               if (l_notErr) {
                  action = "B"

                  idx = keys.findIndex(function (itemKey) {
                     //Picker清單
                     var split_picker = itemKey.split(";")

                     return (split_picker[0] == split_scan[0])
                  })
               }
               else {
                  action = "X"
               }
            }

            return {
               "idx": idx,
               "action": action,
               "msg": msg
            }
         }

         //掃描資料檢查 for 倉庫 in 多組合
         function pickerIndex_forWarehouseMultiple(scanning, split_scan, splitKeys, keys) {
            var idx = -1       //Picker Index
            var action = ""    //後續流程控制
            var msg = ""

            var length = "" + split_scan.length
            if (length == 2) {
               //倉儲與目前指示的倉儲一致
               if (splitKeys[0] == split_scan[0] &&
                  splitKeys[1] == split_scan[1]) {
                  action = "A"
                  idx = null

                  msg = "倉儲與目前指示的倉儲一致！"
               }
               else {
                  //倉儲是否存在 Picker清單 中?
                  var l_notErr = keys.some(function (itemKey) {
                     var split_picker = itemKey.split(";")

                     return (split_picker[0] == split_scan[0] &&
                        split_picker[1] == split_scan[1])
                  })

                  //存在倉庫，是否要重新定位至符合指示倉庫?
                  if (l_notErr) {
                     action = "B"

                     idx = keys.findIndex(function (itemKey) {
                        //Picker清單
                        var split_picker = itemKey.split(";")

                        return (split_picker[0] == split_scan[0] &&
                           split_picker[1] == split_scan[1])
                     })
                  }
                  else {
                     action = "X"
                  }
               }
            }
            else {
               idx = keys.findIndex(function (itemKey) {
                  //Picker清單
                  var split_picker = itemKey.split(";")

                  switch (length) {
                     case "3":
                        //倉儲批
                        if (((split_picker[0] == split_scan[0]) &&   //倉庫
                           (split_picker[1] == split_scan[1])))     //儲位
                        {
                           //批號存在否
                           var l_flag = false
                           var arr = $scope.warehouseGroupBy[itemKey]
                           for (var l_i = 0, len = arr.length; l_i < len; l_i++) {
                              l_flag = (arr[l_i].lot == split_scan[2])
                              if (l_flag) {
                                 break
                              }
                           }

                           if (l_flag) {
                              action = "C"
                              return true
                           }
                        }
                        break

                     default:
                        break
                  }
               })
            }

            return {
               "idx": idx,
               "action": action,
               "msg": msg
            }
         }

         //掃描資料檢查 for 儲位
         function pickerIndex_forStorage(split_scan, splitKeys, keys) {
            var idx = -1       //Picker Index
            var action = ""    //後續流程控制
            var msg = ""

            //儲位與目前指示的儲位一致
            if (splitKeys[1] == split_scan[0]) {
               action = "A"
               idx = null

               msg = "儲位與目前指示的儲位一致！"
            }
            else {
               //儲位是否存在 Picker清單 中?
               var l_notErr = keys.some(function (itemKey) {
                  var split_picker = itemKey.split(";")

                  return (split_picker[1] == split_scan[0])
               })

               //存在儲位，是否要重新定位至符合指示儲位?
               if (l_notErr) {
                  action = "B"

                  idx = keys.findIndex(function (itemKey) {
                     //Picker清單
                     var split_picker = itemKey.split(";")

                     return (split_picker[1] == split_scan[0])
                  })
               }
               else {
                  action = "X"
               }
            }

            return {
               "idx": idx,
               "action": action,
               "msg": msg
            }
         }

         //掃描資料檢查 for 批號
         function pickerIndex_forLot(split_scan, warehouse_location_item_no) {
            var idx = -1       //Picker Index
            var action = ""    //後續流程控制
            var firstInOut = true
            var msg = ""       //顯示訊息

            //撈取料倉儲批清單
            var arr = $scope.warehouseGroupBy[warehouse_location_item_no]
            for (var l_i = 0, len = arr.length; l_i < len; l_i++) {
               var l_lot = (arr[l_i].lot == split_scan[0])
               if (l_lot) {
                  //撈取此批號資料
                  var documentsArr = $filter("filter")($scope.documents_sum, $scope.filter)

                  //顯示單據批號
                  if (documentsArr.length > 0) {
                     $scope.showLot(documentsArr[0])

                     //撈取批號清單
                     var lot_list = angular.copy($scope.filterList(documentsArr[0].lot_list, $scope.filter_lot))

                     //是否為先進先出?
                     firstInOut = lot_list.every(function (item) {
                        return (item.lot >= split_scan[0])
                     })

                     action = "A"
                     idx = null

                     msg = "批號為目前指示的料、倉、儲所有！"
                     if (!firstInOut) {
                        var index = lot_list.findIndex(function (item) {
                           return (item.lot == split_scan[0])
                        })

                        //將資料展開直到批號顯示
                        if (index !== -1 && index + 1 > documentsArr[0].lot_cnt) {
                           documentsArr[0].lot_cnt = index + 1
                        }

                        msg += "<br />" + "但批號並非為先進先出批！"
                     }
                  }

                  break
               }
            }

            if (!l_lot) {
               action = "X"
            }

            return {
               "idx": idx,
               "action": action,
               "msg": msg
            }
         }

         //顯示確認視窗
         function positionConfirm(forItem, sureSetLotQty, setting) {
            var timePromise = null
            var confirmPopup = $ionicPopup.confirm({
               "title": "定位",
               "template": "是否重新定位到指定項目?",
               "cssClass": "kb_03",
               "buttons": [{
                  "text": $scope.langs.cancel,
                  "onTap": function () {
                     return false
                  }
               }, {
                  "text": $scope.langs.confirm,
                  "onTap": function () {
                     return true
                  }
               }]
            })

            confirmPopup.then(function (res) {
               $timeout.cancel(timePromise)

               //timeout關閉
               if (res === undefined) {
                  res = true
               }

               if (res) {
                  $scope.warehouseList.warehouse_location_item_no = forItem
                  var splitKeys = forItem.split(";")

                  if (sureSetLotQty) {
                     //過濾單據清單
                     $scope.filter = {
                        "item_no": splitKeys[2]
                     }

                     //過濾批號清單
                     $scope.filter_lot = {
                        "store": splitKeys[0],
                        "location": splitKeys[1]
                     }

                     //撈取此批號資料
                     var documentsArr = $filter("filter")($scope.documents_sum, $scope.filter)

                     //顯示單據批號
                     if (documentsArr.length > 0) {
                        $scope.showLot(documentsArr[0])

                        //撈取批號清單
                        var lot_list = $scope.filterList(documentsArr[0].lot_list, $scope.filter_lot)
                        var index = lot_list.findIndex(function (item) {
                           return (item.lot == setting.split_scan[1])
                        })

                        //將資料展開直到批號顯示
                        if (index !== -1 && index + 1 > documentsArr[0].lot_cnt) {
                           documentsArr[0].lot_cnt = index + 1
                        }

                        //設定批號數量
                        if (index !== -1) {
                           if (setting.split_scan.length == 2) {
                              $scope.setIncludeQty(documentsArr[0], lot_list[index])
                           }

                           if (setting.split_scan.length == 3) {
                              setLotQty(documentsArr[0], lot_list[index], setting.qty)
                           }
                        }
                        else {   //預設料件數量(無批)
                           setLotQty(documentsArr[0], lot_list, setting.qty)
                        }

                        $timeout(function () {
                           //定位後顯示批號清單
                           $scope.showLot(documentsArr[0])
                        }, 0)
                     }
                  }
               } else {
                  //
               }
            })

            //5秒後自動關閉視窗
            timePromise = $timeout(function () {
               //confirmPopup.close();
            }, 5000)
         }

         //累加批號數量
         function setLotQty(documents, lot, qtyAdd) {
            //資料都轉為陣列
            var chkType = Array.isArray(lot)
            if (!chkType) {
               lot = [
                  lot
               ]
            }
            if (!qtyAdd) { qtyAdd = Infinity }

            for (var l_i = 0, len = lot.length; l_i < len; l_i++) {
               var qty = qtyAdd
               var current = documents.include_qty - lot[l_i].include_qty   //已揀 - 當前批號數量
               var currentMax = documents.qty        //單據數量

               //單據未揀量
               var diff = nuberFixed.accSub(currentMax, current)
               if (qty > diff) {
                  qty = diff
               }

               var maxqty = lot[l_i].qty - ($scope.lot_list[lot[l_i].index].include_qty_sum - lot[l_i].include_qty)
               if (qty > maxqty) {
                  qty = maxqty
               }

               //檢查單據未撿量+此次新增數
               var currentSum = nuberFixed.accAdd(documents.include_qty, qty)  //數量加總
               if (currentSum > currentMax) {
                  qty = currentMax - documents.include_qty
               }

               $scope.compute(documents, lot[l_i], qty)

               //檢查單據已撿量是否超過單據數量
               if (documents.include_qty >= currentMax) {
                  break
               }

               qtyAdd = qtyAdd - qty  //扣除掃描數量
               if (qtyAdd > 0) {
                  //展開下一筆批號
                  if (l_i + 1 > documents.lot_cnt) {
                     documents.lot_cnt = l_i + 1
                  }
               }
               else {
                  break
               }
            }
         }

         //==================== 內部呼叫 Function ====================(E)


         //==================== 外部呼叫 Function ====================(S)

         //手動輸入掃描
         $scope.scanned = function (value) {
            var pickerSearch = pickerSearch

            pickerSearch.blur()  //清除Input焦點
            checkScan(value.trim())
         }

         //清空掃描
         $scope.clearScanning = function () {
            $scope.scanInfo.scanning = ""
         }

         //預設已揀量
         $scope.setIncludeQty = function (documents, lot) {
            var current = documents.include_qty - lot.include_qty   //已揀 - 當前批號數量
            var currentMax = documents.qty        //未揀

            //單據未揀量
            var diff = nuberFixed.accSub(currentMax, current)
            if (diff === 0) {
               //MD019: 單據剩餘可揀料量為零!
               showToastMiddle($scope.langs.error.MD019)
               $scope.closeOption()
               return
            }

            //批號可揀量
            var maxqty = lot.qty - ($scope.lot_list[lot.index].include_qty_sum - lot.include_qty)

            var lotqty = 0
            if (lot.qty > maxqty) {
               lotqty = maxqty
            }
            else {
               lotqty = lot.qty
            }

            if (lotqty > diff) {
               lot.include_qty = diff
            }
            else {
               lot.include_qty = lotqty
            }

            lotIncludeQtySum(lot.index)
            $scope.closeOption()
         }

         //批號明細顯示
         var index = undefined
         $scope.showLot = function (documents) {
            documents.showLot = !documents.showLot

            if (documents.showLot) {
               if (documents.index != index && index != undefined) {
                  $scope.documents_sum[index].showLot = false
               }

               index = documents.index
            }

            if (documents.showLot && !documents.lot_list) {
               $scope.setDocLots(documents)
            }
         }

         //設置單據倉儲清單
         $scope.setDocLots = function (documents) {
            //單據批號清單
            documents.lot_list = angular.copy($scope.filterList($scope.lot_list, $scope.filter))

            //沒有批號資料
            if (documents.lot_list.length === 0) {
               //MD018: 已顯示全批號資料
               showToastMiddle($scope.langs.error.MD018)
               return
            }

            if (documents.lot_cnt == 0) {
               var qty = documents.qty
               documents.lot_list.forEach(function (obj) {
                  if ((qty - obj.qty) >= 0 || (qty > 0 && qty - obj.qty < 0)) {
                     qty -= obj.qty
                     documents.lot_cnt++
                  }
               })
            }
         }

         //返回儲位
         $scope.getLocations = function (warehouse) {
            if (warehouse) {
               var result = Object.keys(warehouse)

               return result
            }
         }

         //返回料件
         $scope.getItems = function (warehouse, location) {
            if (warehouse) {
               var obj = warehouse[location]
               var result = Object.keys(obj)

               return result
            }
         }

         //數量增加、減少
         $scope.compute = function (documents, lot, value) {
            //型態轉換為Number
            value = +value

            if (lot.include_qty == 0 && value == -1) {
               //MD008: 數量已達最小值!
               showToastMiddle($scope.langs.error.MD008)
               return
            }

            if (lot.qty === $scope.lot_list[lot.index].include_qty_sum && value == 1) {
               //MD016: 已達此批號可揀量!
               showToastMiddle($scope.langs.error.MD016)
               return
            }

            var current_sum = nuberFixed.accAdd(documents.include_qty, value)
            if (current_sum > documents.qty) {
               //MD009: 揀料量 {0} 不可大於應揀量 {1} !
               var error_massage = commonFormat.format(AppLang.langs.error.MD009, current_sum, documents.qty)
               showToastMiddle(error_massage)
               return
            }

            lot.include_qty = nuberFixed.accAdd(lot.include_qty, value)

            documents.include_qty = sumIncludeQty(documents.lot_list)
            $scope.lot_list[lot.index].include_qty_sum = nuberFixed.accAdd($scope.lot_list[lot.index].include_qty_sum, value)
         }

         //直接輸入數值
         $scope.showQtyPop = function (documents, lot) {
            //開啟多單位視窗時, 不執行原邏輯
            if (documents.showMultiUnit) {
               return
            }

            var temp = angular.copy(lot)

            //var maxqty = Infinity;   //無限制
            //數值彈窗可輸入的最大值: 批號可揀量 - (該批號使用量 - 單據當前使用量)
            var maxqty = lot.qty - ($scope.lot_list[lot.index].include_qty_sum - lot.include_qty)
            if (maxqty <= 0) {
               //MD017: 此批號剩餘可揀量不足
               showToastMiddle($scope.langs.error.MD017)
               return
            }

            commonFactory.showQtyPopup_kb("", temp.include_qty, maxqty, chkqty(temp.include_qty)).then(function (res) {
               if (typeof res !== "undefined") {
                  lot.include_qty = res

                  lotIncludeQtySum(lot.index)
               }
            })
         }

         //塞選資料
         $scope.filterList = function (DataList, search) {
            return $filter("filter")(DataList, search)
         }

         //設置單據的資料
         $scope.setLotsCnt = function (documents) {
            if (!documents.showLot) {
               documents.showLot = !documents.showLot
               index = documents.index
            }

            if (!documents.lot_list) {
               $scope.setDocLots(documents)
               return
            }

            //批號清單 for 倉儲批
            var lot_list = angular.copy($scope.filterList(documents.lot_list, $scope.filter_lot))

            if (documents.lot_cnt >= lot_list.length) {
               //MD018: 已顯示全批號資料
               showToastMiddle($scope.langs.error.MD018)
               return
            }
            else if (documents.lot_cnt + 5 > documents.lot_list.length) {
               documents.lot_cnt = documents.lot_list.length
               return
            }

            documents.lot_cnt = documents.lot_cnt + 5
         }

         //點擊item收起按鍵框
         $scope.closeOption = function () {
            $ionicListDelegate.closeOptionButtons()
         }

         ionic.Platform.ready(function () {
            var orientation = window.orientation || 0 //當前螢幕翻轉方向

            //設定view高度
            function HeightResize(source) {
               if (orientation === window.orientation && source === "resize") {
                  return
               }

               //重新取得控件的高度，方式與 widet/js/directives.js 相同
               var getHeight = (function () {
                  var screenHeight = document.documentElement.clientHeight
                  var pagerHeader = $("div[source='kb_03_s03_02']")

                  return function (type) {
                     var height = 0

                     var pagerHeader_offset
                     if (screenHeight > 400) {
                        pagerHeader_offset = $ionicPosition.offset(pagerHeader)
                     }
                     else {
                        pagerHeader_offset = { "height": 0 }
                     }

                     if (pagerHeader_offset) {
                        height = pagerHeader_offset.height
                     }

                     return height
                  }
               })()

               var Height = getHeight()
               $("ion-nav-view[name='kb_03_s03_02_list']")
                  .css("height", "calc(100% - " + Height + "px)")
               $("ion-content#scroll")
                  .css("height", "calc(100% - 4px)")
            }

            function docEllips() {
               $timeout(function () {
                  var screenWidth = document.documentElement.clientWidth
                  switch (true) {
                     case (screenWidth > 0 && screenWidth <= 340):
                        $scope.docEllips = -11
                        break

                     case (screenWidth > 340 && screenWidth <= 400):
                        $scope.docEllips = -14
                        break

                     case (screenWidth > 400 && screenWidth <= 460):
                        $scope.docEllips = -17
                        break

                     case (screenWidth > 460 && screenWidth <= 520):
                        $scope.docEllips = -20
                        break

                     default:
                        $scope.docEllips = 0
                        break
                  }
               }, 0)
            }

            $timeout(function () {
               docEllips()
               HeightResize("init")
            }, 0)

            $(window).on("resize.kb_03_s03_02", (function () {
               docEllips()

               HeightResize("resize")
               orientation = window.orientation || 0
            }))

            //離開頁面時銷毀呼叫事件
            var stateChangeStart = $scope.$on("$stateChangeStart", function (event, data) {
               console.log("kb_03_s03_02 leave")

               //關閉明細
               if (index != undefined) {
                  $scope.documents_sum[index].showLot = false
               }

               if ($scope.warehouseList && !!$scope.warehouseList.warehouse_location_item_no) {
                  $scope.backupFileter($scope.warehouseList.warehouse_location_item_no)
               }

               stateChangeStart()
               $(window).off("resize.kb_03_s03_02")
            })
         })

         //==================== 外部呼叫 Function ====================(E)


         //==================== 呼叫 BDL 元件 ====================(S)

         //調用相機掃描
         $scope.scan = function () {
            $scope.scanning = ""
            console.log("scanBarcode")
            APIBridge.callAPI("scanBarcode", [{}]).then(function (result) {
               if (result) {
                  console.log("scanBarcode success")
                  checkScan(result.data[0].barcode.trim())
               } else {
                  console.log("scanBarcode false")
               }
            }, function (result) {
               console.log("scanBarcode fail")
               console.log(result)
            })
         }

         //==================== 呼叫 BDL 元件 ====================(E)

         //初始化變數
         page_init()
      }
   ]
})
