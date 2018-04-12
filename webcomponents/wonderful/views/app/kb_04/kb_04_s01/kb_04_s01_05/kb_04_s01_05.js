define(["API", "APIS", "AppLang", "array", "Directives", "ReqTestData", "ionic-popup", "commonService", "userInfoService"], function () {
   return ["$scope", "$state", "$stateParams", "$timeout", "$filter", "AppLang", "APIService", "APIBridge", "$ionicLoading", "$ionicPosition", "$ionicPopup", "IonicPopupService", "kb_04_requisition", "ReqTestData", "commonService", "userInfoService", "numericalAnalysisService",
      function ($scope, $state, $stateParams, $timeout, $filter, AppLang, APIService, APIBridge, $ionicLoading, $ionicPosition, $ionicPopup, IonicPopupService, kb_04_requisition, ReqTestData, commonService, userInfoService, numericalAnalysisService) {

         //==================== 內部呼叫 Function ====================(S)
         var nuberFixed = numericalAnalysisService

         function page_init() {
            $scope.page_params = commonService.get_page_params()

            //設定各作業數據匯總時所顯示的標題
            switch ($scope.page_params.program_job_no) {
               case "1":
                  $scope.inquiry_list_title_already = $scope.langs.alreadyReceive
                  break
               case "2":
                  $scope.inquiry_list_title_already = $scope.langs.alreadyPutInStorage
                  break
               default:
                  $scope.inquiry_list_title_already = $scope.langs.alreadyReceive
            }

            //設定list每個item的高度
            $scope.collection_item_height = "54" // 兩行
         }

         function getBcme() {
            $ionicLoading.show()
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

         //是否需要顯示提交按鈕
         function setSubmitShow() {
            var flag = checkInquiryQty()

            $timeout(function () {
               $scope.submit_show = flag
            }, 0)
         }

         //檢查數據匯總數量
         function checkInquiryQty() {
            var flag = true
            var len = $scope.data_collection.length

            if (len == 0) {
               flag = false
            }
            else {
               for (var i = 0; i < len; i++) {
                  var element = $scope.data_collection[i]
                  if (Number(element.should_qty) > Number(element.already_qty)) {
                     flag = false
                     break
                  }
               }
            }

            return flag
         }

         //==================== 內部呼叫 Function ====================(E)


         //==================== 外部呼叫 Function ====================(S)

         //彙總頁面顏色控管
         $scope.collectionStyle = function (item) {
            if (angular.isUndefined(item)) {
               return
            }

            if (Number(item.already_qty) <= 0) {
               return "list_bgcolor"
            }
         }

         //將明細資料新增至 bcaf 中
         $scope.InsertTobcaf = function () {
            if (commonService.Platform == "Chrome") {
               return
            }

            $ionicLoading.show()
            APIBridge.callAPI("bcaf_create", [$scope.goodsList, $scope.l_data]).then(function (result) {
               if (result) {
                  console.log("bcaf_create success")
                  getBcme()
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

         $scope.btnSave = function () {
            $scope.submit_show = false

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
                     angular.forEach(result.data[0].scan_detail, function (value, key) {
                        var goodsList = $filter("filter")($scope.goodsList, function (goodsVal) {
                           return value.doc_no === goodsVal.source_no &&
                              value.seq === goodsVal.seq
                        })

                        if (goodsList.length > 0) {
                           value.picking_qty = nuberFixed.accSub(value.picking_qty, goodsList[0].lot_include_qty)
                           angular.forEach(goodsList[0].lotQtyList, function (lotVal) {
                              var obj = angular.copy(value)
                              obj.lot_no = lotVal.lot
                              obj.picking_qty = lotVal.qty

                              this.push(obj)
                           }, result.data[0].scan_detail)
                        }
                     })

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

         //==================== 外部呼叫 Function ====================(E)


         //==================== 呼叫 BDL 元件 ====================(S)

         function getInquiry() {
            if (commonService.Platform == "Chrome") {
               $scope.inquiry = [
                  {
                     "item_no": "A001",
                     "item_name": "A001_Name",
                     "item_spec": "A001_Spec",
                     "qty": 0
                  },
                  {
                     "item_no": "A002",
                     "item_name": "A002_Name",
                     "item_spec": "A002_Spec",
                     "qty": 50
                  },
                  {
                     "item_no": "A003",
                     "item_name": "A003_Name",
                     "item_spec": "A003_Spec",
                     "qty": 72
                  }
               ]
               setSubmitShow()

               return
            }

            $scope.InsertTobcaf()
         }

         function clearSqlite(doc_no) {
            kb_04_requisition.init()

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
                  $state.go("kb_02_s01")
               })
            }, function (result) {
               $ionicLoading.hide()
               userInfoService.getVoice("bcme_ae_af_delete fail", function () { })
               console.log(result)
            })
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
                  var pagerHeader = $("div[source='kb_04_s01_05 header']")
                  var pagerFooter = $("div[source='kb_04_s01_05 footer']")

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
               $("ion-nav-view[name='kb_04_s01_05_list']")
                  .css("height", "calc(100% - " + Height + "px)")
               $("ion-content#scroll")
                  .css("height", "calc(100% - 4px)")
            }

            $timeout(function () {
               HeightResize("init")
            }, 0)

            $scope.$watch("submit_show", function (newVal, oldVal) {
               if (newVal !== oldVal) {
                  $timeout(function () {
                     HeightResize("submit_show")
                  }, 0)
               }
            })

            $(window).on("resize.kb_04_s01_05", (function () {
               HeightResize("resize")
               orientation = window.orientation || 0
            }))

            //離開頁面時銷毀呼叫事件
            var stateChangeStart = $scope.$on("$stateChangeStart", function (event, data) {
               console.log("kb_04_s01_05 leave")

               stateChangeStart()
               $(window).off("resize.kb_04_s01_05")
            })
         })

         //==================== 呼叫 BDL 元件 ====================(E)

         //頁面初始化
         page_init()

         //撈取彙總資料
         getInquiry()
      }
   ]
})
