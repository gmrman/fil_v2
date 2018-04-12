define(["API", "APIS", "AppLang", "array", "Directives", "ReqTestData", "ionic-popup", "circulationCardService", "commonFactory", "commonService", "userInfoService"], function () {
   return ["$scope", "$state", "$stateParams", "$timeout", "$filter", "AppLang", "APIService", "APIBridge", "$ionicLoading", "$ionicPosition", "$ionicPopup", "IonicPopupService", "IonicClosePopupService", "kb_04_requisition", "ReqTestData", "circulationCardService", "commonFactory", "commonService", "userInfoService", "numericalAnalysisService",
      function ($scope, $state, $stateParams, $timeout, $filter, AppLang, APIService, APIBridge, $ionicLoading, $ionicPosition, $ionicPopup, IonicPopupService, IonicClosePopupService, kb_04_requisition, ReqTestData, circulationCardService, commonFactory, commonService, userInfoService, numericalAnalysisService) {

         var nuberFixed = numericalAnalysisService

         console.log($scope.page_params)
         var server_product = userInfoService.userInfo.server_product  //當前系統

         //設定list每個item的高度
         if (userInfoService.userInfo.feature) {
            $scope.collection_item_height = "84" // 三行
         } else {
            $scope.collection_item_height = "54" // 兩行
         }
         console.log($scope.collection_item_height)

         //設定各作業數據匯總時所顯示的標題
         $scope.inquiry_list_title_already = $scope.langs.alreadyPutInStorage
         $scope.inquiry_list_title_should = $scope.langs.shouldPutInStorage

         function checkData() {
            var flag = true

            //檢查數據匯總數量是否正確
            if (server_product === "WF" || (server_product == "T100" ||
               $scope.page_params.program_job_no == "7" ||
               $scope.page_params.program_job_no == "8")) {

               angular.forEach($scope.data_collection, function (value) {
                  if (Number(value.should_qty) > Number(value.already_qty)) {
                     flag = false
                  }

                  if (flag) {
                     if (Number(value.should_ref_qty) > Number(value.already_ref_qty)) {
                        flag = false
                     }
                  }
               })
            }

            //入項 需檢查批號
            if ($scope.page_params.in_out_no == "1" && flag) {
               angular.forEach($scope.goodsList, function (value) {
                  if (value.lot_control_type == "1") {
                     if (commonService.isNull(value.lot_no) && value.lot_include_qty !== value.qty) {
                        flag = false
                     }
                  }
               })
               if (!flag) {
                  //料號批號管控為必須要有批號，因未輸入批號，無法提交！
                  userInfoService.getVoice($scope.langs.lot_control_submit_error, function () { })
                  return
               }
            }

            return flag
         }

         //彙總頁面顏色控管
         $scope.collectionStyle = function (item) {
            if (angular.isUndefined(item)) {
               return
            }

            if ((Number(item.already_qty) < Number(item.should_qty)) && Number(item.already_qty) !== 0) {
               return "list_bgcolor"
            }
            if (Number(item.already_qty) === 0) {
               return "list_bgcolor_red"
            }
         }

         //將明細資料新增至 bcaf 中
         $scope.InsertTobcaf = function () {
            console.log($scope.goodsList)
            if (commonService.Platform == "Chrome") {
               return
            }
            $ionicLoading.show()
            APIBridge.callAPI("bcaf_create", [$scope.goodsList, $scope.l_data]).then(function (result) {
               if (result) {
                  console.log("bcaf_create success")
                  $scope.getBcme()
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

         var setSubmitShow = function (submit_show) {
            var flag = false
            if (submit_show) {
               flag = checkData()
            }

            $timeout(function () {
               $scope.submit_show = flag
            }, 0)
         }

         $scope.getBcme = function () {
            APIBridge.callAPI("bcme_get", [$scope.l_data]).then(function (result) {
               $ionicLoading.hide()
               if (result) {
                  $timeout(function () {
                     var submit_show = result.data[0].submit_show
                     $scope.setDataCollection(result.data[0].list)
                     console.log(result.data[0].list)
                     setSubmitShow(submit_show)
                  }, 0)
                  console.log("bcme_get success")
               } else {
                  console.log("bcme_get false")
               }
            }, function (error) {
               $ionicLoading.hide()
               userInfoService.getVoice("bcme_get fail", function () { })
               console.log(error)
            })
         }

         var clearSqlite = function (doc_no) {
            var page = "kb_02_s01"

            kb_04_requisition.init()
            $scope.initShowGood()
            if (commonService.Platform == "Chrome") {
               IonicPopupService.successAlert(doc_no).then(function () {
                  $state.go("kb_02_s01")
               })

               return
            }

            $ionicLoading.show()
            APIBridge.callAPI("bcme_ae_af_delete", [$scope.l_data]).then(function (result) {
               $ionicLoading.hide()
               IonicPopupService.successAlert(doc_no).then(function () {
                  $state.go(page)
               })
               $scope.clearList()
            }, function (result) {
               $ionicLoading.hide()
               userInfoService.getVoice("bcme_ae_af_delete fail", function () { })
               console.log(result)
            })
         }

         $scope.submit = function () {
            $scope.submit_show = false
            var flag = true

            //入項 需檢查批號
            if ($scope.page_params.in_out_no == "1") {
               angular.forEach($scope.goodsList, function (value) {
                  if (value.lot_control_type == "1") {
                     if (commonService.isNull(value.lot_no) && value.lot_include_qty !== value.qty) {
                        flag = false
                     }
                  }
               })
               if (!flag) {
                  //料號批號管控為必須要有批號，因未輸入批號，無法提交！
                  userInfoService.getVoice($scope.langs.lot_control_submit_error, function () { })
                  return
               }
            }

            send_submit()
         }

         var send_submit = function () {
            if (ReqTestData.testData) {
               clearSqlite("CTC-LB4-1209000010")
               return
            }

            $ionicLoading.show()
            APIBridge.callAPI("bcae_bcaf_upload_create", [$scope.l_data]).then(function (result) {
               $ionicLoading.hide()
               if (result) {
                  if (result.data[0].errmsg.trim()) {
                     console.log(result.data[0].errmsg)
                     userInfoService.getVoice(result.data[0].errmsg, function () {
                        $scope.submit_show = true
                     })
                  } else {
                     for (var l_i = 0, len = result.data.length; l_i < len; l_i++) {
                        var scan_detail = []

                        angular.forEach(result.data[l_i].scan_detail, function (value, key) {
                           var goodsList = $filter("filter")($scope.goodsList, function (goodsVal) {
                              return value.doc_no === goodsVal.source_no &&
                                 Number(value.seq) === Number(goodsVal.seq)
                           })

                           if (goodsList.length > 0) {
                              value.picking_qty = nuberFixed.accSub(value.picking_qty, goodsList[0].lot_include_qty)
                              if (value.picking_qty > 0) {
                                 scan_detail.push(value)
                              }

                              angular.forEach(goodsList[0].lotQtyList, function (lotVal) {
                                 var obj = angular.copy(value)
                                 obj.lot_no = lotVal.lot
                                 obj.picking_qty = lotVal.qty

                                 this.push(obj)
                              }, scan_detail)
                           }
                           else {
                              scan_detail.push(value)
                           }
                        })

                        result.data[l_i].scan_detail = scan_detail
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
                     $ionicLoading.show()
                     APIService.Web_Post(webTran, function (res) {
                        $ionicLoading.hide()
                        console.log("success:" + res)
                        clearSqlite(res.payload.std_data.parameter.doc_no)
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
                  console.log("bcae_bcaf_upload_create false")
               }
            }, function (error) {
               $ionicLoading.hide()
               console.log(error)
               userInfoService.getVoice("bcae_bcaf_upload_create fail", function () { })
            })

         }

         //顯示提示框
         var showCheckSendSubmitPop = function () {
            // 顯示提示 "過帳數量不匹，是否提交"
            var checkSendSubmitPop = $ionicPopup.show({
               "title": $scope.langs.point,
               "template": "<p style='text-align: center'>" + $scope.langs.pass_qty_error + "," + $scope.langs.checkSubmit + "</p>",
               "scope": $scope,
               "buttons": [{
                  "text": $scope.langs.cancel,
                  "onTap": function () {
                     $scope.submit_show = true
                  }
               }, {
                  "text": $scope.langs.confirm,
                  "onTap": function () {
                     send_submit()
                  }
               }]
            })
            IonicClosePopupService.register(false, checkSendSubmitPop)
            return
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
                  var pagerHeader = $("div[source='kb_04_s03_05 header']")
                  var pagerFooter = $("div[source='kb_04_s03_05 footer']")

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

                     height += (pagerHeader_offset) ? pagerHeader_offset.height : 28
                     height += (pagerFooter_offset) ? pagerFooter_offset.height : 0

                     return height
                  }
               })()

               var Height = getHeight()
               $("ion-nav-view[name='kb_04_s03_05_list']")
                  .css("height", "calc(100% - " + Height + "px)")
               $("ion-content#scroll")
                  .css("height", "calc(100% - 4px)")
            }

            $timeout(function () {
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

            $(window).on("resize.kb_04_s03_05", (function () {
               HeightResize("resize")
               orientation = window.orientation || 0
            }))

            //離開頁面時銷毀呼叫事件
            var stateChangeStart = $scope.$on("$stateChangeStart", function (event, data) {
               console.log("kb_04_s03_05 leave")

               stateChangeStart()
               $(window).off("resize.kb_04_s03_05")
            })
         })

         $scope.InsertTobcaf()
      }
   ]
})
