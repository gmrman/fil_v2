define(["API", "APIS", "AppLang", "array", "Directives", "ReqTestData", "ionic-popup", "commonFactory"], function () {
   return ["$scope", "$state", "$stateParams", "$timeout", "$filter", "$ionicLoading", "AppLang", "APIService", "APIBridge", "userInfoService", "$ionicListDelegate", "commonFormat", "ionicToast", "ReqTestData", "commonService", "commonFactory", "IonicPopupService", "$ionicScrollDelegate", "$ionicPopup", "$ionicModal", "IonicClosePopupService", "$ionicPosition", "kb_04_requisition", "numericalAnalysisService",
      function ($scope, $state, $stateParams, $timeout, $filter, $ionicLoading, AppLang, APIService, APIBridge, userInfoService, $ionicListDelegate, commonFormat, ionicToast, ReqTestData, commonService, commonFactory, IonicPopupService, $ionicScrollDelegate, $ionicPopup, $ionicModal, IonicClosePopupService, $ionicPosition, kb_04_requisition, numericalAnalysisService) {
         $scope.userInfo = userInfoService.getUserInfo()

         //==================== 內部呼叫 Function ====================(S)
         var nuberFixed = numericalAnalysisService
         var server_product = userInfoService.userInfo.server_product  //當前系統

         function page_init() {
            $scope.page_params = commonService.get_page_params()
            $scope.langs = AppLang.langs

            //取得資訊ID yyyyMMddHHmmsssss_account            
            var l_info_id = commonService.getCurrent(2) + "_" + $scope.userInfo.account

            $scope.l_data = {
               "bcae005": $scope.page_params.in_out_no,   //出入庫瑪
               "bcae006": $scope.page_params.program_job_no + $scope.page_params.status,
               "bcae014": $scope.page_params.program_job_no,
               "bcae015": $scope.page_params.status,       //A開立新單/S過賬/Y確認
               "info_id": $scope.page_params.info_id || angular.copy(l_info_id)
            }

            $scope.goodsList = []
            $scope.showReferenceUnitNo = false
         }

         //計算數量 總數 = 合格 + 不良 + 特採
         function computeQty(qty, type, item) {
            var count = 0
            var ok_qty = parseFloat(item.ok_qty)
            var return_qty = parseFloat(item.return_qty)
            var surplus_qty = parseFloat(item.surplus_qty)
            var before_qty = 0

            switch (type) {
               case "ok_qty":
                  count = qty + return_qty + surplus_qty
                  before_qty = ok_qty
                  break
               case "return_qty":
                  count = ok_qty + qty + surplus_qty
                  before_qty = return_qty
                  break
               case "surplus_qty":
                  count = ok_qty + return_qty + qty
                  before_qty = surplus_qty
                  break
            }

            return distributionQty(qty, count, type, before_qty, item)
         }

         function distributionQty(qty, count, type, before_qty, item) {
            if (qty > item.qty) {
               userInfoService.getVoice($scope.langs.qc_maxQty_error, function () { })
               return false
            }

            //minus
            var maxqty = 0
            while (before_qty > qty) {
               switch (type) {
                  case "return_qty":
                     item.ok_qty += 1
                     break
                  case "surplus_qty":
                     item.ok_qty += 1
                     break
               }

               before_qty -= 1
            }

            //add
            while (count > item.qty) {
               switch (type) {
                  case "ok_qty":
                     if (item.surplus_qty > 0) {
                        item.surplus_qty -= 1
                        break
                     }
                     if (item.return_qty > 0) {
                        item.return_qty -= 1
                        break
                     }
                     break

                  case "return_qty":
                     if (item.surplus_qty > 0) {
                        item.surplus_qty -= 1
                        break
                     }
                     if (item.ok_qty > 0) {
                        item.ok_qty -= 1
                        break
                     }
                     break

                  case "surplus_qty":
                     if (item.ok_qty > 0) {
                        item.ok_qty -= 1
                        break
                     }
                     if (item.return_qty > 0) {
                        item.return_qty -= 1
                        break
                     }
                     break
               }

               count -= 1
            }

            return true
         }

         //計算加減後數值 並呼叫撿查
         function compute(type, value, item) {
            var qty = 0

            switch (type) {
               case "pop.qty":
                  qty = checkmin($scope.pop.qty, value)
                  if (!item) {
                     $scope.pop.qty = checkmin($scope.pop.qty, value)
                  }
                  else {
                     $scope.pop.qty = (computeQty(qty, $scope.pop.type, item)) ? qty : $scope.pop.qty
                  }
                  break
               case "ok_qty":
                  qty = checkmin(item.ok_qty, value)
                  item.ok_qty = (computeQty(qty, type, item)) ? qty : item.ok_qty
                  break
               case "return_qty":
                  qty = checkmin(item.return_qty, value)
                  item.return_qty = (computeQty(qty, type, item)) ? qty : item.return_qty
                  break
               case "surplus_qty":
                  qty = checkmin(item.surplus_qty, value)
                  item.surplus_qty = (computeQty(qty, type, item)) ? qty : item.surplus_qty
                  break
               case "reference_qty":
                  qty = checkmin(item.reference_qty, value)
                  item.reference_qty = qty
                  break
               case "defect_qty":
                  var val = checkmin($scope.sub.defect_qty, value)
                  if (($scope.defect_qty + value) > $scope.showAbnormalInfo.max_scrap_qty) {
                     val = $scope.sub.defect_qty
                     //MD012-不良數量已經符合報廢數量
                     userInfoService.getVoice($scope.langs.error.MD012, function () { })
                  }
                  else if (($scope.defect_qty + value) >= 0) {
                     $scope.defect_qty += value
                  }

                  $scope.sub.defect_qty = val
                  break
            }
         }

         //計算數值是否小於0
         function checkmin(value, value2) {
            var num = Number(value) + Number(value2)
            if (num < 0) {
               num = value
            }
            return num
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

         //取得qc資料
         function callQCGetWS(scanning) {
            var webTran = {
               "service": "app.qc.get",
               "parameter": {
                  "program_job_no": $scope.page_params.program_job_no,
                  "scan_type": "4",
                  "status": $scope.page_params.status,
                  "analysis_symbol": userInfoService.userInfo.barcode_separator || "%",
                  "site_no": userInfoService.userInfo.site_no,
                  "doc_no": scanning,
               }
            }

            $ionicLoading.show()
            APIService.Web_Post(webTran, function (res) {
               $ionicLoading.hide()
               var parameter = res.payload.std_data.parameter

               setGoodsList(scanning, parameter)
            }, function (error) {
               $ionicLoading.hide()
               var execution = error.payload.std_data.execution
               console.log("error:" + execution.description)
               userInfoService.getVoice(execution.description, function () {
               })
            })
         }

         //設置qc資料
         function setGoodsList(scanning, parameter) {
            var index = $scope.goodsList.findIndex(function (item) {
               return commonService.isEquality(scanning, item.scan_doc_no)
            })

            if (index != -1) {
               //資料重複！
               userInfoService.getVoice($scope.langs.data_duplication_error, function () {
               })
            } else {
               var obj = {
                  "scan_doc_no": scanning,
                  "doc_no": parameter.source_no,
                  "run_card_no": parameter.run_card_no,
                  "seq": parameter.seq,
                  "op_no": parameter.op_no,
                  "op_name": parameter.op_name,
                  "item_no": parameter.item_no,
                  "item_feature_no": parameter.item_feature_no,
                  "item_name": parameter.item_name,
                  "item_spec": parameter.item_spec,
                  "lot_no": parameter.lot_no,
                  "qty": parameter.doc_qty - (parameter.in_out_qty || 0),
                  "ok_qty": parameter.doc_qty - (parameter.in_out_qty || 0),
                  "return_qty": 0,
                  "surplus_qty": 0,
                  "reference_qty": parameter.reference_qty || 0,
                  "reference_unit_no": parameter.reference_unit_no || ""
               }
               if (obj.reference_unit_no) {
                  $scope.showReferenceUnitNo = true
               }

               $scope.goodsList.push(obj)
            }
         }

         //顯示 Toast 訊息
         function showToastMiddle(msg) {
            ionicToast.show(msg, "middle", false, 1500)
         }

         //==================== 內部呼叫 Function ====================(E)


         //==================== 外部呼叫 Function ====================(S)

         //取得不良說明
         $scope.getReasonCode = function (value) {
            var webTran = {
               "service": "app.abnormal.get",
               "parameter": {
                  "site_no": userInfoService.userInfo.site_no,
                  "abnormal_condition": value || "%"
               }
            }
            console.log(webTran)

            if (ReqTestData.testData) {
               $scope.reasonCodes = ReqTestData.app_abnormal_get().abnormal
               return
            }

            $ionicLoading.show()
            APIService.Web_Post(webTran, function (res) {
               $ionicLoading.hide()
               console.log("success:" + res)

               var parameter = res.payload.std_data.parameter
               $timeout(function () {
                  $scope.reasonCodes = parameter.abnormal
               }, 0)

            }, function (error) {
               $ionicLoading.hide()

               var execution = error.payload.std_data.execution
               console.log("error:" + execution.description)
               userInfoService.getVoice(execution.description, function () { })
            })
         }

         //数量弹窗
         $scope.showQtyPop = function (type, item) {
            $scope.pop = {
               "qty": 0,
               "type": type
            }

            switch (type) {
               case "ok_qty":
                  $scope.pop.qty = angular.copy(parseFloat(item.ok_qty))
                  break
               case "return_qty":
                  $scope.pop.qty = angular.copy(parseFloat(item.return_qty))
                  break
               case "surplus_qty":
                  $scope.pop.qty = angular.copy(parseFloat(item.surplus_qty))
                  break
               case "reference_qty":
                  $scope.pop.qty = angular.copy(parseFloat(item.reference_qty))
                  break
            }
            $scope.item = item

            var myPopup = $ionicPopup.show({
               "title": $scope.langs.edit + $scope.langs.qty,
               "scope": $scope,
               "cssClass": "kb_css",
               "templateUrl": "views/app/common/html/qtyPop_kb.html",
               "buttons": [{
                  "text": $scope.langs.cancel
               }, {
                  "text": $scope.langs.confirm,
                  "onTap": function () {
                     $scope.pop.qty = +(($scope.pop.qty < 0 || !$scope.pop.qty) ? 0 : $scope.pop.qty)
                     var qty = angular.copy(parseFloat($scope.pop.qty))
                     switch (type) {
                        case "ok_qty":
                           item.ok_qty = (computeQty(qty, type, item)) ? qty : item.ok_qty
                           break
                        case "return_qty":
                           item.return_qty = (computeQty(qty, type, item)) ? qty : item.return_qty
                           break
                        case "surplus_qty":
                           item.surplus_qty = (computeQty(qty, type, item)) ? qty : item.surplus_qty
                           break
                        case "reference_qty":
                           item.reference_qty = qty
                           break
                     }
                  }
               }]
            })

            myPopup.then(function () {
               $scope.item = null
            })

            IonicClosePopupService.register(false, myPopup)
         }

         $scope.mins = function (type, item) {
            console.log("mins")
            compute(type, -1, item)
         }

         $scope.add = function (type, item) {
            console.log("add")
            compute(type, 1, item)
         }

         //左滑删除
         $scope.delGoods = function (index) {
            $scope.goodsList.splice(index, 1)

            $ionicListDelegate.closeOptionButtons()
         }

         //點擊item收起按鍵框
         $scope.closeOption = function () {
            $ionicListDelegate.closeOptionButtons()
         }

         //點擊item呼叫數量彈窗
         $scope.OptionChangeNum = function (index) {
            $ionicListDelegate.closeOptionButtons()

            //呼叫調整數量彈窗
            if (index >= 0) {
               $scope.showQtyPop(index)
            }
         }

         $scope.goTodolistNotice = function () {
            var page = "kb_02_s01"

            kb_04_requisition.init()

            //清空DB資料
            clearSqlite()
            $state.go(page)
         }

         $scope.checkshowgood = function () {
            $scope.addshowgood($scope.goodsList[0])
         }

         $scope.addshowgood = function (value) {
            if (!userInfoService.userInfo.employee_no && server_product !== "WF") {
               //檢查是否每筆都有人員
               userInfoService.getVoice($scope.langs.dailyWork_employee_no_error, function () { })
               return
            }

            var webTran = {
               "service": "app.qc.create",
               "parameter": {
                  "site_no": userInfoService.userInfo.site_no,
                  "program_job_no": $scope.page_params.program_job_no,
                  "scan_type": "4",
                  "analysis_symbol": userInfoService.userInfo.barcode_separator,
                  "status": $scope.page_params.status,
                  "scan_doc_no": value.scan_doc_no,
                  "doc_no": value.doc_no,
                  "run_card_no": value.run_card_no,
                  "seq": value.seq,
                  "op_no": value.op_no,
                  "item_no": value.item_no,
                  "item_feature_no": value.item_feature_no,
                  "lot_no": value.lot_no,
                  "scan_employee_no": userInfoService.userInfo.employee_no,
                  "ok_qty": value.ok_qty,
                  "return_qty": value.return_qty,
                  "surplus_qty": value.surplus_qty,
                  "reference_unit_no": value.reference_unit_no,
                  "reference_qty": value.reference_qty,
                  "reason_list": value.scraps
               }
            }
            console.log(webTran)

            if (ReqTestData.testData) {
               var parameter = {
                  "doc_no": "ZHA-1706220001"
               }

               IonicPopupService.successAlert(parameter.doc_no).then(function () {
                  $state.go("kb_02_s01")
               })

               return
            }

            $ionicLoading.show()
            APIService.Web_Post(webTran, function (res) {
               $ionicLoading.hide()

               console.log("success:" + res)
               var parameter = res.payload.std_data.parameter

               IonicPopupService.successAlert(parameter.doc_no).then(function () {
                  $state.go("kb_02_s01")
               })
            }, function (error) {
               $ionicLoading.hide()

               var execution = error.payload.std_data.execution
               console.log("error:" + execution.description)
               userInfoService.getVoice(execution.description, function () { })
            })
         }

         //是否開啟不良原因輸入
         $scope.getAbnormal = function () {
            if (server_product === "WF") {
               return false
            }

            return true
         }

         //跳出不良掃描頁面
         $scope.showAbnormal = function (item) {
            if (!item.scraps) {
               item.scraps = []
            }
            $scope.defect_qty = 0   //不良數量彙總

            $scope.scraps = angular.copy(item.scraps)
            $scope.showAbnormalInfo = {
               "barcode": item.scan_doc_no,
               "max_scrap_qty": item.return_qty
            }

            //刪除不良原因
            $scope.delScrap = function (index) {
               $scope.scraps.splice(index, 1)
               $ionicListDelegate.closeOptionButtons()
            }

            $scope.addScrap = function (temp) {
               $scope.scraps.unshift(angular.copy(temp))
            }

            $scope.setEditGoods = function () {
               item.scraps = angular.copy($scope.scraps)
               $scope.closeAbnormalModal()
            }

            //跳出新增不良原因頁面
            $scope.selectReasonCode = function () {
               $scope.defect_qty = 0
               if ($scope.scraps.length > 0) {
                  $scope.defect_qty = $scope.scraps.reduce(function (val_A, val_B) {
                     return {
                        "defect_qty": val_A.defect_qty += val_B.defect_qty
                     }
                  }, { "defect_qty": 0 }).defect_qty
               }

               if ($scope.defect_qty >= $scope.showAbnormalInfo.max_scrap_qty) {
                  //MD012-不良數量已經符合報廢數量
                  userInfoService.getVoice($scope.langs.error.MD012, function () { })
                  return
               }

               //搜索撈取WS
               $scope.scanned = function (value) {
                  $scope.getReasonCode(value)
               }
               $scope.getReasonCode("%")

               //初始化不良原因物件
               $scope.sub = {
                  "abnormal_no": "",
                  "abnormal_name": "",
                  "defect_qty": 0
               }

               //初始化POP窗數字物件
               $scope.pop = {
                  "qty": 0,
                  "type": ""
               }

               //数量弹窗
               $scope.showQtyPopScrap = function (type) {
                  var value = 0
                  $scope.pop.type = type
                  $scope.pop.qty = parseFloat($scope.sub.defect_qty)
                  var myPopup = $ionicPopup.show({
                     "title": $scope.langs.edit + $scope.langs.qty,
                     "scope": $scope,
                     "cssClass": "kb_css",
                     "templateUrl": "views/app/common/html/qtyPop_kb.html",
                     "buttons": [{
                        "text": $scope.langs.cancel
                     }, {
                        "text": $scope.langs.confirm,
                        "onTap": function (e) {
                           $scope.pop.qty = +(($scope.pop.qty < 0 || !$scope.pop.qty) ? 0 : $scope.pop.qty)

                           if (($scope.defect_qty - ($scope.sub.defect_qty - $scope.pop.qty)) > $scope.showAbnormalInfo.max_scrap_qty) {
                              e.preventDefault()
                              $scope.pop.qty = $scope.sub.defect_qty

                              //MD013-不可超過報廢數量
                              userInfoService.getVoice($scope.langs.error.MD013, function () { })
                              return
                           }

                           $scope.defect_qty = $scope.defect_qty - ($scope.sub.defect_qty - $scope.pop.qty)
                           $scope.sub.defect_qty = $scope.pop.qty
                        }
                     }]
                  })

                  IonicClosePopupService.register(false, myPopup)
               }

               $scope.changeReasonCode = function (item) {
                  $scope.sub.abnormal_no = item.abnormal_no
                  $scope.sub.abnormal_name = item.abnormal_name
               }

               $scope.setReasonCode = function () {
                  var temp = angular.copy($scope.sub)
                  if (temp.abnormal_no.length <= 0) {
                     //MD014-請選擇不良原因!
                     userInfoService.getVoice($scope.langs.error.MD014, function () { })
                     return
                  }

                  if (temp.defect_qty <= 0) {
                     userInfoService.getVoice($scope.langs.input_defect_qty_error, function () { })
                  } else {
                     var index = $scope.scraps.findIndex(function (item) {
                        return commonService.isEquality(item.abnormal_no, temp.abnormal_no)
                     })

                     if (index !== -1) {
                        userInfoService.getVoice($scope.langs.data_duplication_error, function () { })
                        return
                     }

                     $scope.addScrap(temp)
                     $scope.closeSelAbnormalModal()
                  }
               }

               $ionicModal.fromTemplateUrl("views/app/common/html/selAbnormalModal_kb.html", {
                  "scope": $scope,
               }).then(function (modal) {
                  $scope.closeSelAbnormalModal = function () {
                     modal.hide().then(function () {
                        return modal.remove()
                     })
                  }
                  modal.show()
               })
            }

            $ionicModal.fromTemplateUrl("views/app/common/html/abnormalModal_kb.html", {
               "scope": $scope,
            }).then(function (modal) {
               $scope.closeAbnormalModal = function () {
                  modal.hide().then(function () {
                     return modal.remove()
                  })
               }
               modal.show()
            })
         }

         $scope.showLotQtyList = function (index, showMultiUnit) {
            $scope.type = "QC"

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
               "include_qty": lotQtyListInfo.include_qty,
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
            $scope.lotQtyListInfo.qty = $scope.lotQtyListInfo.maxqty - sumIncludeQty()
            $scope.lotQtyListInfo.include_qty = sumIncludeQty()

            $ionicListDelegate.closeOptionButtons()
         }

         $scope.addLotQtyList = function (index, obj) {
            if (!$scope.goodsList[index].lotQtyList) {
               $scope.goodsList[index].lotQtyList = []
            }

            $scope.goodsList[index].lotQtyList.unshift(angular.copy(obj))
         }

         ionic.Platform.ready(function () {
            var orientation = window.orientation || 0 //當前螢幕翻轉方向

            //設定view高度
            function HeightResize(source) {
               if (orientation === window.orientation && source === "resize") {
                  return
               }

               var getHeight = (function () {
                  var element = $("ion-nav-view[name='kb_04_s02_04_list']")
                  var parent = ionic.DomUtil.getParentWithClass(element[0], "scroll-content") || ionic.DomUtil.getParentWithClass(element[0], "pane")

                  return function () {
                     var height = 0
                     var parentOffset = $ionicPosition.offset(angular.element(parent))
                     var offset = $ionicPosition.offset(element)

                     if (parent) {
                        height = parentOffset.top + parentOffset.height - offset.top
                     }
                     console.log("height: " + height)

                     return height
                  }
               })()

               $("ion-nav-view[name='kb_04_s02_04_list']").css("height", getHeight() + "px")
               $ionicScrollDelegate.resize()
            }
            $timeout(function () {
               HeightResize("init")
            }, 0)

            $(window).on("resize.kb_04_s02_04", (function () {
               HeightResize("resize")
               orientation = window.orientation || 0
            }))

            //離開頁面時銷毀事件呼叫
            var stateChangeStart = $scope.$on("$stateChangeStart", function (event, data) {
               console.log("kb_04_s02_04 leave")

               stateChangeStart()
               $(window).off("resize.kb_04_s02_04")
            })
         })

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

         //==================== 呼叫 BDL 元件 ====================(E)

         //初始化變數
         page_init()

         //設置明細資料
         if (kb_04_requisition.parameter.length > 0) {
            var parameter = kb_04_requisition.parameter
            var analysis_symbol = userInfoService.userInfo.barcode_separator || "%"

            if (commonService.Platform == "Chrome") {
               var goodsList = parameter.map(function (item) {
                  var scanning = item.receipts_no + analysis_symbol + item.receipts_sno
                  $scope.showReferenceUnitNo = true

                  return {
                     "scan_doc_no": scanning,
                     "doc_no": item.receipts_no,
                     "run_card_no": "run_card_no",
                     "seq": item.receipts_sno,
                     "op_no": "op_no",
                     "op_name": "op_name",
                     "item_no": item.item_no,
                     "item_feature_no": "item_feature_no",
                     "item_name": item.item_desc,
                     "item_spec": item.item_spec,
                     "lot_no": "lot_no",
                     "qty": item.qty - (item.in_out_qty || 0),
                     "ok_qty": item.qty - (item.in_out_qty || 0),
                     "return_qty": 0,
                     "surplus_qty": 0,
                     "reference_qty": 0,
                     "reference_unit_no": "kg"
                  }
               })

               $scope.goodsList = goodsList
            }
            else {
               parameter.forEach(function (item) {
                  var scanning = item.receipts_no + analysis_symbol + item.receipts_sno

                  callQCGetWS(scanning)
               })
            }
         }
      }
   ]
})
