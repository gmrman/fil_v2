define(["API", "APIS", "AppLang", "array", "Directives", "ReqTestData", "ionic-popup", "commonFactory"], function () {
   return ["$scope", "$state", "$stateParams", "$timeout", "AppLang", "APIService", "APIBridge", "$ionicListDelegate", "ReqTestData", "commonFactory", "$ionicScrollDelegate", "commonFormat", "ionicToast", "$ionicModal", "$ionicPosition", "numericalAnalysisService", "userInfoService",
      function ($scope, $state, $stateParams, $timeout, AppLang, APIService, APIBridge, $ionicListDelegate, ReqTestData, commonFactory, $ionicScrollDelegate, commonFormat, ionicToast, $ionicModal, $ionicPosition, numericalAnalysisService, userInfoService) {
         $scope.userInfo = userInfoService.getUserInfo()

         //==================== 內部呼叫 Function ====================(S)
         var nuberFixed = numericalAnalysisService

         function page_init() {
            $scope.collection_item_height = "90"   //設定每個item的高度
            $scope.orderBy = ""                    //排序欄位條件
            $scope.setting = {
               "orderBy": "-1"                       //排序設定-預設
            }
         }

         //數量檢查
         function chkqty(oldQty, index) {
            var lot_include_qty = $scope.goodsList[index].lot_include_qty || 0

            return function (qty, maxqty, event) {
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
                  error_massage = $scope.langs.error.MD005
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

         //==================== 內部呼叫 Function ====================(E)


         //==================== 外部呼叫 Function ====================(S)

         //左滑删除
         $scope.delGoods = function (index) {
            $scope.deleteGoods(index)

            $scope.callWSAppTodoDocGet()   //重新INSERT資料
            $ionicListDelegate.closeOptionButtons()
         }

         //點擊item收起按鍵框
         $scope.closeOption = function () {
            $ionicListDelegate.closeOptionButtons()
         }

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

         //數量彈窗
         $scope.showQtyPop = function (index) {
            var temp = angular.copy($scope.goodsList[index])
            if (isNaN(temp.maxqty) || temp.maxqty <= 0) {
               temp.maxqty = +temp.qty
            }

            commonFactory.showQtyPopup_kb("", temp.qty, temp.maxqty, chkqty(temp.qty, index)).then(function (res) {
               if (typeof res !== "undefined") {
                  $scope.goodsList[index].qty = res
                  $scope.goodsList[index].maxqty = temp.maxqty
               }
            })
         }

         //顯示排序設定
         $scope.showOrderBy = function () {
            commonFactory.showOrderByPopup($scope.setting.orderBy).then(function (res) {
               if (typeof res !== "undefined") {
                  $scope.setting.orderBy = res

                  switch ($scope.setting.orderBy) {
                     case "0":
                        $scope.orderBy = ["po_no", "po_sno"]
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

         $scope.showLotQtyList = function (index, showMultiUnit) {
            $scope.type = $scope.langs.receiveing

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

         ionic.Platform.ready(function () {
            var orientation = window.orientation || 0 //當前螢幕翻轉方向

            //設定view高度
            function HeightResize(source) {
               if (orientation === window.orientation && source === "resize") {
                  return
               }

               var getHeight = (function () {
                  var element = $("ion-nav-view[name='kb_04_s01_04_list']")
                  var parent = ionic.DomUtil.getParentWithClass(element[0], "scroll-content") || ionic.DomUtil.getParentWithClass(element[0], "pane")

                  return function () {
                     var height = 0
                     var parentOffset = $ionicPosition.offset(angular.element(parent))
                     var offset = $ionicPosition.offset(element)

                     if (parent) {
                        height = parentOffset.top + parentOffset.height - offset.top
                     }

                     return height
                  }
               })()

               $("ion-nav-view[name='kb_04_s01_04_list']").css("height", getHeight() + "px")
               $ionicScrollDelegate.resize()
            }
            $timeout(function () {
               HeightResize("init")
            }, 0)

            $(window).on("resize.kb_04_s01_04", (function () {
               HeightResize("resize")
               orientation = window.orientation || 0
            }))

            //離開頁面時銷毀事件呼叫
            var stateChangeStart = $scope.$on("$stateChangeStart", function (event, data) {
               console.log("kb_04_s01_04 leave")

               stateChangeStart()
               $(window).off("resize.kb_04_s01_04")
            })
         })

         //==================== 外部呼叫 Function ====================(E)


         //==================== 呼叫 BDL 元件 ====================(S)

         //==================== 呼叫 BDL 元件 ====================(E)

         //初始化變數
         page_init()
      }
   ]
})
