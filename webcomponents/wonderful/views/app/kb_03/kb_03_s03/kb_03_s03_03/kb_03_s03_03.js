define(["API", "APIS", "AppLang", "array", "Directives", "ReqTestData", "ionic-popup", "commonFactory", "commonFormat"], function () {
   return ["$rootScope", "$scope", "$state", "$stateParams", "$filter", "$timeout", "AppLang", "APIService", "APIBridge", "$ionicListDelegate", "ReqTestData", "commonFactory", "$ionicScrollDelegate", "$ionicPosition", "IonicPopupService", "userInfoService", "commonFormat", "commonService", "kb_03_requisition", "numericalAnalysisService", "$ionicLoading",
      function ($rootScope, $scope, $state, $stateParams, $filter, $timeout, AppLang, APIService, APIBridge, $ionicListDelegate, ReqTestData, commonFactory, $ionicScrollDelegate, $ionicPosition, IonicPopupService, userInfoService, commonFormat, commonService, kb_03_requisition, numericalAnalysisService, $ionicLoading) {

         //==================== 內部呼叫 Function ====================(S)
         var server_product = userInfoService.userInfo.server_product  //當前系統

         function page_init() {
            $scope.langs = AppLang.langs

            $scope.docEllips = 0
            $scope.submit_show = false
            $scope.orderBy = ["doc_no", "doc_seq"]
         }

         //檢查數據匯總數量是否相等
         function checkData() {
            var flag = false

            for (var i = 0; i < $scope.documents_sum.length; i++) {
               var value = $scope.documents_sum[i]

               if (server_product === "WF" || (server_product == "T100" ||
                  $scope.l_data.bcae014 == "7" ||
                  $scope.l_data.bcae014 == "8")) {

                  if (value.include_qty > 0) {
                     flag = true
                     break
                  }
               }
               else {
                  if (value.qty !== value.include_qty) {
                     flag = false
                     break
                  }
                  else {
                     flag = true
                  }
               }
            }

            return flag
         }

         //是否需要顯示提交按鈕
         function setSubmitShow() {
            var flag = checkData()

            $timeout(function () {
               $scope.submit_show = flag
            }, 0)
         }

         //清除資料
         function clearSqlite() {
            $ionicLoading.show()
            APIBridge.callAPI("bcme_ae_af_delete", [$scope.l_data]).then(function (result) {
               $ionicLoading.hide()
            }, function (result) {
               $ionicLoading.hide()
               userInfoService.getVoice("bcme_ae_af_delete fail", function () { })
               console.log(result)
            })
         }

         //==================== 內部呼叫 Function ====================(E)


         //==================== 外部呼叫 Function ====================(S)

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

            $scope.closeOption()
         }

         $scope.filter = function (lot) {
            if (lot.include_qty > 0) {
               return true
            }

            return false
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
                  var pagerHeader = $("div[source='kb_03_s03_03 header']")
                  var pagerFooter = $("div[source='kb_03_s03_03 footer']")

                  return function (type) {
                     var height = 0

                     var pagerHeader_offset = undefined
                     var pagerFooter_offset = undefined
                     if (pagerHeader.length > 0) {
                        pagerHeader_offset = $ionicPosition.offset(pagerHeader)
                     }

                     if (pagerFooter.length > 0) {
                        pagerFooter_offset = $ionicPosition.offset(pagerFooter)
                     }

                     height += (pagerHeader_offset) ? pagerHeader_offset.height : 70
                     height += (pagerFooter_offset) ? pagerFooter_offset.height : 0

                     return height
                  }
               })()

               var Height = getHeight()
               $("ion-nav-view[name='kb_03_s03_03_list']")
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
                        $scope.docEllips = -13
                        break

                     case (screenWidth > 400 && screenWidth <= 460):
                        $scope.docEllips = -16
                        break

                     case (screenWidth > 460 && screenWidth <= 520):
                        $scope.docEllips = -19
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

            $scope.$watch("submit_show", function (newVal, oldVal) {
               if (newVal !== oldVal) {
                  $timeout(function () { }, 0).then(function () {
                     $timeout(function () {
                        HeightResize("submit_show")
                     }, 0)
                  })
               }
            })

            $(window).on("resize.kb_03_s03_03", (function () {
               docEllips()

               HeightResize("resize")
               orientation = window.orientation || 0
            }))

            //離開頁面時銷毀呼叫事件
            var stateChangeStart = $scope.$on("$stateChangeStart", function (event, data) {
               console.log("kb_03_s03_03 leave")

               //關閉明細
               if (index != undefined) {
                  $scope.documents_sum[index].showLot = false
               }

               stateChangeStart()
               $(window).off("resize.kb_03_s03_03")
            })
         })

         //資料提交
         $scope.btnSave = function () {
            $scope.submit_show = false

            var title = $scope.langs.submit + $scope.langs.success
            var msg = $scope.langs.data + $scope.langs.submit + $scope.langs.success

            $ionicLoading.show()
            var goodsList = angular.copy($scope.documents_sum).map(function (obj) {
               obj["source_no"] = obj["doc_no"]
               delete obj["doc_no"]

               obj["seq"] = obj["doc_seq"]
               delete obj["doc_seq"]

               obj["warehouse_no"] = obj["store"]
               delete obj["store"]

               obj["storage_spaces_no"] = obj["location"]
               delete obj["location"]

               obj["qty"] = obj["include_qty"]
               delete obj["include_qty"]

               if (obj.warehouse_data === undefined) {
                  obj.warehouse_data = {}
               }

               //單位
               obj["unit"] = obj.unit_no || ""

               return obj
            })

            if (commonService.Platform == "Chrome") {
               $ionicLoading.hide()

               commonFormat.alertMsg(title, msg).then(function () {
                  kb_03_requisition.init()
                  $state.go("kb_03_s01")
               })

               return
            }

            //寫入DB
            APIBridge.callAPI("bcaf_create", [goodsList, $scope.l_data]).then(function (result) {
               if (result) {
                  console.log("bcaf_create success")

                  APIBridge.callAPI("bcae_bcaf_upload_create", [$scope.l_data]).then(function (result) {
                     if (result && result.data[0]) {
                        if (result.data[0].errmsg.trim()) {
                           $ionicLoading.hide()

                           console.log(result.data[0].errmsg)
                           userInfoService.getVoice(result.data[0].errmsg, function () {
                              $scope.submit_show = true
                           })
                        } else {
                           for (var l_i = 0, len = result.data.length; l_i < len; l_i++) {
                              angular.forEach(result.data[l_i].scan_detail, function (value, key) {
                                 //取的單據資料
                                 var goodsList = $filter("filter")($scope.documents_sum, function (goodsVal) {
                                    return value.doc_no === goodsVal.doc_no &&
                                           value.seq === goodsVal.doc_seq &&
                                           goodsVal.lot_cnt > 0
                                 })

                                 if (goodsList.length > 0) {
                                    //單據使用的批號
                                    var lot_list = $filter("filter")(goodsList[0].lot_list, function (goodsVal) {
                                       return goodsVal.include_qty > 0
                                    })

                                    angular.forEach(lot_list, function (lotVal) {
                                       var obj = angular.copy(value)
                                       obj.lot_no = lotVal.lot
                                       obj.picking_qty = lotVal.include_qty

                                       //多單位
                                       obj.reference_unit_no = lotVal.reference_unit_no
                                       obj.reference_qty = lotVal.reference_qty

                                       obj.valuation_unit_no = lotVal.valuation_unit_no
                                       obj.valuation_qty = lotVal.valuation_qty

                                       this.push(obj)
                                    }, result.data[l_i].scan_detail)

                                    this.splice(key, 1)
                                 }
                              }, result.data[l_i].scan_detail)
                           }

                           var webTran = {
                              "service": "app.bcscanwsupload.create",
                              "parameter": {
                                 "site_no": userInfoService.userInfo.site_no,
                                 "employee_no": userInfoService.userInfo.employee_no,
                                 "scan_type": $scope.page_params.upload_scan_type,
                                 "report_datetime": commonService.getCurrent(1),
                                 "recommended_operations": $scope.l_data.bcae014,
                                 "recommended_function": $scope.l_data.bcae015,
                                 "scan_doc_no": "",
                                 "picking_employee_no": userInfoService.userInfo.employee_no,
                                 "picking_department_no": userInfoService.userInfo.department_no,
                                 "doc_type_no": "",
                                 "reason_no": "",
                                 "scan": result.data
                              }
                           }
                           console.log("bcae_bcaf_upload_create success")
                           console.log(webTran)

                           if (ReqTestData.testData) {
                              $ionicLoading.hide()

                              commonFormat.alertMsg(title, msg).then(function () {
                                 kb_03_requisition.init()
                                 $state.go("kb_03_s01")
                              })
                           }

                           APIService.Web_Post(webTran, function (res) {
                              $ionicLoading.hide()

                              console.log("success:" + res)
                              clearSqlite()

                              //提交成功
                              kb_03_requisition.init()
                              var doc_no = res.payload.std_data.parameter.doc_no
                              if (!doc_no) {
                                 commonFormat.alertMsg(title, msg).then(function () {
                                    $state.go("kb_03_s01")
                                 })
                              }
                              else {
                                 IonicPopupService.successAlert(doc_no).then(function () {
                                    $state.go("kb_03_s01")
                                 })
                              }
                           }, function (error) {
                              $ionicLoading.hide()

                              var execution = error.payload.std_data.execution
                              console.log("error:" + execution.description)

                              userInfoService.getVoice(execution.description, function () {
                                 $scope.submit_show = true
                              })
                           })
                        }
                     } else {
                        $ionicLoading.hide()
                        console.log("bcae_bcaf_upload_create false")
                     }
                  }, function (error) {
                     $ionicLoading.hide()
                     console.log(error)
                     userInfoService.getVoice("bcae_bcaf_upload_create fail", function () { })
                  })
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

         //==================== 外部呼叫 Function ====================(E)


         //==================== 呼叫 BDL 元件 ====================(S)

         //==================== 呼叫 BDL 元件 ====================(E)

         //初始化變數
         page_init()

         //是否顯示提交
         setSubmitShow()
      }
   ]
})
