define(["API", "APIS", "AppLang", "ionic-popup", "views/app/kb_03/requisition.js", "Directives", "ReqTestData", "commonService", "views/app/kb_03/kb_03_s01/js/PopupService.js", "commonFormat"], function () {
   return ["userInfoService", "$scope", "$state", "$stateParams", "kb_03_PopupService", "$ionicLoading", "$ionicPopup", "IonicPopupService", "IonicClosePopupService", "AppLang", "APIService", "$timeout", "APIBridge", "ReqTestData", "commonService", "$q", "$ionicScrollDelegate", "$ionicPosition", "commonFormat", "kb_03_requisition", "ionicToast",
      function (userInfoService, $scope, $state, $stateParams, kb_03_PopupService, $ionicLoading, $ionicPopup, IonicPopupService, IonicClosePopupService, AppLang, APIService, $timeout, APIBridge, ReqTestData, commonService, $q, $ionicScrollDelegate, $ionicPosition, commonFormat, kb_03_requisition, ionicToast) {

         $scope.langs = AppLang.langs   //語言資料
         $scope.page_params = commonService.get_page_params()

         //切換頁面Title
         userInfoService.changeTitle($scope.page_params.name)

         //==================== 內部呼叫 Function ====================(S)

         //init變數
         function page_init() {
            $scope.showBtnSave = false      //顯示提交案鈕
            $scope.cnt = 10                 //顯示筆數
            $scope.setting = ""             //使用者設定
            kb_03_requisition.init()

            //畫面顯示
            $scope.guided_out = []
            $scope.isCheckboxShown = false

            //前五筆顏色資料清單
            $scope.selColorObj = {
               "font-color-1": "",
               "font-color-2": "",
               "font-color-3": "",
               "font-color-4": "",
               "font-color-5": ""
            }
         }

         function convertPage(cnt) {
            var arr = []
            for (var i = 1; i <= cnt; i++) {
               arr.push(i)
            }
            if (arr.length <= 0) {
               arr.push(1)
            }

            return arr
         }

         //顯示checkbox
         function showCheckbox(isCheckboxShown) {
            $scope.isCheckboxShown = !isCheckboxShown
         }

         function addDate(date, days) {
            var newData = new Date(date)
            newData.setDate(newData.getDate() + days)
            var yyyy = newData.getFullYear()
            var month = newData.getMonth() + 1
            var day = newData.getDate()

            return yyyy + "/" + ((month < 10) ? "0" + month : month) + "/" + ((day < 10) ? "0" + day : day)
         }

         //取得清單資料
         function getDataList(type, item) {
            /* 回傳參數:
                 *   type         = 單據類型
                 *   doc_no       = 單號
                 *   dept_no      = 部門編號
                 *   dept_name    = 部門名稱
                 *   doc_date     = 單據日期
                 *   days         = 日數
                 *   days_color   = 日數顏色
                 *   detail_cnt   = 項數
                 *   contrast_num = 對比數
                 *   status       = 料況
                 *   status_num   = 缺料數
                 */

            var service = "app.km.oh.stkoutlist.get"
            var parameter = {
               "site_no": userInfoService.userInfo.site_no,
               "qry_type": type,
               "doc_cond": ($scope.setting && $scope.setting.singles) ? $scope.setting.singles : "",
               "stkout_no": (item) ? item.doc_no : ""
            }

            var webTran = {
               "service": service,
               "parameter": parameter
            }

            $ionicLoading.show()
            if (ReqTestData.testData) {
               var date = new Date()
               var yyyy = date.getFullYear()
               var month = date.getMonth() + 1
               var day = date.getDate()

               date = yyyy + "/" + ((month < 10) ? "0" + month : month) + "/" + ((day < 10) ? "0" + day : day)

               parameter = {
                  "stkoutlist": [
                     {
                        "doc_type": "1",
                        "doc_no": "2001-201707000001",
                        "dept_no": "A01",
                        "dept_name": "生產部門01",
                        "doc_date": date,
                        "days": "3",
                        "days_color": "G",
                        "detail_cnt": 10,
                        "contrast_num": 0,
                        "status": "1",
                        "status_num": 10
                     },
                     {
                        "doc_type": "1",
                        "doc_no": "2001-201707000002",
                        "dept_no": "A05",
                        "dept_name": "生產部門05",
                        "doc_date": addDate(date, 2),
                        "days": "2",
                        "days_color": "Y",
                        "detail_cnt": 7,
                        "contrast_num": 0,
                        "status": "2",
                        "status_num": 3
                     },
                     {
                        "doc_type": "1",
                        "doc_no": "2001-201707000003",
                        "dept_no": "A03",
                        "dept_name": "生產部門03",
                        "doc_date": addDate(date, 1),
                        "days": "1",
                        "days_color": "Y",
                        "detail_cnt": 3,
                        "contrast_num": 0,
                        "status": "2",
                        "status_num": 2
                     },
                     {
                        "doc_type": "1",
                        "doc_no": "2001-201707000004",
                        "dept_no": "A01",
                        "dept_name": "生產部門01",
                        "doc_date": addDate(date, -5),
                        "days": "-5",
                        "days_color": "R",
                        "detail_cnt": 1,
                        "contrast_num": 0,
                        "status": "1",
                        "status_num": 1
                     },
                     {
                        "doc_type": "1",
                        "doc_no": "2001-201707000005",
                        "dept_no": "A07",
                        "dept_name": "生產部門07",
                        "doc_date": addDate(date, -1),
                        "days": "-1",
                        "days_color": "R",
                        "detail_cnt": 2,
                        "contrast_num": 0,
                        "status": "2",
                        "status_num": 1
                     },
                     {
                        "doc_type": "1",
                        "doc_no": "2001-201707000006",
                        "dept_no": "A01",
                        "dept_name": "生產部門01",
                        "doc_date": addDate(date, 3),
                        "days": "3",
                        "days_color": "Y",
                        "detail_cnt": 9,
                        "contrast_num": 0,
                        "status": "1",
                        "status_num": 9
                     }
                  ]
               }
               $scope.guided_out = parameter.stkoutlist

               //重設頁碼
               var pageCnt = $scope.guided_out.length / $scope.cnt
               $scope.pageList = convertPage(Math.ceil(pageCnt))
               $scope.form = {
                  "page": $scope.pageList[0]
               }

               $ionicLoading.hide()
            }
            else {
               var stkoutJob = $q.defer()
               var stkoutPromise = stkoutJob.promise  // 返回 Promise

               APIService.Web_Post(webTran, function (res) {
                  //資料取得成功
                  $ionicLoading.hide()
                  console.log("success:" + res)

                  var parameter = res.payload.std_data.parameter
                  $scope.guided_out = parameter.stkoutlist

                  //重設頁碼
                  var pageCnt = $scope.guided_out.length / $scope.cnt
                  $scope.pageList = convertPage(Math.ceil(pageCnt))
                  $scope.form = {
                     "page": $scope.pageList[0]
                  }

                  stkoutJob.resolve()
               }, function (error) {
                  //資料取得失敗
                  $ionicLoading.hide()

                  var execution = error.payload.std_data.execution
                  console.log("error:" + execution.description)
                  IonicPopupService.errorAlert(execution.description)

                  stkoutJob.reject()
               })

               return stkoutPromise
            }
         }

         //顯示訊息
         function alertMsg(title, msg) {
            var alertPopup = $ionicPopup.alert({
               "title": title,
               "template": "<p style='text-align: center'>" + msg + "</p>",
               "okText": AppLang.langs.confirm,
               "okType": "lightblue"
            })
            IonicClosePopupService.register(false, alertPopup)

            return alertPopup
         }

         ionic.Platform.ready(function () {
            var orientation = window.orientation || 0 //當前螢幕翻轉方向

            //設定view寬度
            function WidthResize(source) {
               if (orientation === window.orientation && source === "resize") {
                  return
               }

               //重新取得控件的寬度
               var getWidth = (function () {
                  return function () {
                     var width = 0
                     var screenWidth = document.documentElement.clientWidth
                     var screenHeight = document.documentElement.clientHeight

                     if (screenWidth && screenHeight) {
                        var multiple = 1
                        switch (true) {
                           case (screenWidth >= 300 && screenWidth < 325):
                              multiple = 1.7
                              break

                           case (screenWidth >= 325 && screenWidth < 350):
                              multiple = 1.6
                              break

                           case (screenWidth >= 350 && screenWidth < 400):
                              multiple = 1.5
                              break

                           case (screenWidth >= 400 && screenWidth < 450):
                              multiple = 1.4
                              break

                           case (screenWidth >= 450 && screenWidth < 475):
                              multiple = 1.3
                              break

                           case (screenWidth >= 475 && screenWidth < 500):
                              multiple = 1.22
                              break

                           case (screenWidth >= 500 && screenWidth < 525):
                              multiple = 1.15
                              break

                           case (screenWidth >= 525 && screenWidth < 550):
                              multiple = 1.1
                              break

                           default:
                              break
                        }

                        width = screenWidth * ((screenWidth > screenHeight || screenWidth >= 550) ? 1 : multiple)
                     }

                     return width
                  }
               })()

               var Width = getWidth()
               $("ion-scroll.timetable_scroll div.scroll")
                  .css("width", Width + "px")
               $ionicScrollDelegate.$getByHandle("receiptListScroll").resize()
            }

            //設定view高度
            function HeightResize(source) {
               if (orientation === window.orientation && source === "resize") {
                  return
               }

               //重新取得控件的高度，方式與 widet/js/directives.js 相同
               var getHeight = (function () {
                  var pagerFooter = $("ion-footer-bar[source='kb_03_s01']")

                  return function (type) {
                     var height = 0
                     var pagerFooter_offset = $ionicPosition.offset(pagerFooter)

                     if (pagerFooter_offset) {
                        height = pagerFooter_offset.height - 14
                     }

                     return height
                  }
               })()

               var Height = getHeight()
               $("ion-scroll.timetable_scroll div.scroll")
                  .css("height", "calc(100% - " + Height + "px)")
               $ionicScrollDelegate.$getByHandle("receiptListScroll").resize()
            }
            $timeout(function () {
               WidthResize("init")
               HeightResize("init")
            }, 0)

            $(window).on("resize.kb_03_s01", (function () {
               WidthResize("resize")
               HeightResize("resize")
               orientation = window.orientation || 0
            }))

            //離開頁面時銷毀事件呼叫
            var stateChangeStart = $scope.$on("$stateChangeStart", function (event, data) {
               console.log("kb_03_s01 leave")

               stateChangeStart()
               $(window).off("resize.kb_03_s01")
            })
         })

         function setItemList(firstIdx) {
            angular.forEach($scope.guided_out, function (value, key) {
               //重複點選第一項時，清空顏色設置
               if (firstIdx !== -1) {
                  value.color = ""
                  value.checked = false

                  selColorObj_init()  //初始化
                  return
               }

               //對比數測試
               if (ReqTestData.testData) {
                  switch ($scope.firstItem[0].doc_no) {
                     case "2001-201707000001":
                        if (value.doc_no == "2001-201707000001") {
                           value.contrast_num = 10
                        }

                        if (value.doc_no == "2001-201707000002") {
                           value.contrast_num = 7
                        }
                        if (value.doc_no == "2001-201707000006") {
                           value.contrast_num = 9
                        }
                        break

                     case "2001-201707000002":
                        if (value.doc_no == "2001-201707000002") {
                           value.contrast_num = 7
                        }

                        if (value.doc_no == "2001-201707000001") {
                           value.contrast_num = 7
                        }
                        if (value.doc_no == "2001-201707000006") {
                           value.contrast_num = 6
                        }
                        break

                     case "2001-201707000006":
                        if (value.doc_no == "2001-201707000006") {
                           value.contrast_num = 9
                        }

                        if (value.doc_no == "2001-201707000001") {
                           value.contrast_num = 9
                        }
                        if (value.doc_no == "2001-201707000002") {
                           value.contrast_num = 6
                        }
                        break

                     default:
                        break
                  }
               }

               if ($scope.firstItem[0].doc_no == value.doc_no) {
                  value.color = "#00DDDD"
                  value.checked = true

                  $scope.setSelColor(value)   //設置第一筆顏色
                  return
               }

               if (($scope.firstItem[0].contrast_num == value.contrast_num || value.detail_cnt == value.contrast_num) && value.contrast_num > 0) {
                  value.color = "#FFFF77"
                  return
               }
            })
         }

         //(訊息, 顯示後邏輯)
         function showToastMiddle(msg, type) {
            //ionicToast.show(msg, 'middle', false, 5000).then(function () {
            //    switch (type) {
            //        case 0:  //跳轉至設定頁面
            //            $state.go("kb_03_s02");
            //            break;

            //        default:
            //            break;
            //    }
            //})
         }

         //初始化顏色清單
         function selColorObj_init() {
            var array = Object.keys($scope.selColorObj)
            var setColor = ""

            for (var i = 0; i < array.length; i++) {
               $scope.selColorObj[array[i]] = setColor
            }
         }

         //==================== 內部呼叫 Function ====================(E)


         //==================== 外部呼叫 Function ====================(S)

         $scope.$on("ngRepeatStatus", function (event, index) {
            //排序用資料
            angular.forEach($scope.guided_out, function (value, key) {
               value.checked = value.checked || false
               value.color = value.color || ""

               switch (true) {
                  case (value.days_color == "R"):
                     value.show_color = "rgb(255, 0, 0)"
                     break

                  case (value.days_color == "Y"):
                     value.show_color = "rgb(255, 255, 0)"
                     break

                  case (value.days_color == "G"):
                     value.show_color = "rgb(146, 208, 80)"
                     break

                  default:
                     break
               }

               switch (value.status) {
                  case "1":
                     value.status_color = "red"
                     break

                  case "2":
                     value.status_color = "yellow"
                     break

                  default:
                     value.status_color = ""
                     break
               }
            })
         })

         $scope.firstItem = []
         $scope.setOrderType = ""
         $scope.setItemColor = function (item, index) {
            var edit = false //是否可以修改

            //是否為第一筆被選中的項目
            var firstIdx = $scope.firstItem.findIndex(function (first) {
               return first.doc_no == item.doc_no
            })

            //清空點選的項目
            if (firstIdx !== -1) {
               $scope.filter = ""
               $scope.firstItem = []
               showCheckbox($scope.isCheckboxShown)

               $scope.setOrderType = ""
               setItemList(firstIdx)
            } else {
               if ($scope.firstItem.length == 0) {
                  //對比數測試
                  if (ReqTestData.testData) {
                     switch (item.doc_no) {
                        case "2001-201707000001":
                           item.contrast_num = 10
                           break

                        case "2001-201707000002":
                           item.contrast_num = 7
                           break

                        case "2001-201707000006":
                           item.contrast_num = 9
                           break

                        default:
                           break
                     }
                  }

                  var addfirst = {
                     "doc_no": item.doc_no,
                     "contrast_num": item.contrast_num
                  }
                  $scope.firstItem.push(addfirst)
                  showCheckbox($scope.isCheckboxShown)

                  if (ReqTestData.testData) {
                     getDataList(2, item)

                     //設置塞選條件
                     $scope.filter = {
                        "doc_type": item.doc_type
                     }

                     setItemList(firstIdx)

                     $scope.setDocOrder(item)
                     $scope.setContrastNumOrder(item)
                     $scope.setOrderType = "setItemColor"
                  }
                  else {
                     getDataList(2, item).then(function () {
                        //設置塞選條件
                        $scope.filter = {
                           "doc_type": item.doc_type
                        }

                        setItemList(firstIdx)

                        $scope.setDocOrder(item)
                        $scope.setContrastNumOrder(item)
                        $scope.setOrderType = "setItemColor"
                     })
                  }
                  $ionicScrollDelegate.scrollTop()
               }
            }
         }

         //選取前五筆資料時，給予color資料
         $scope.setSelColor = function (receipt) {
            var array = Object.keys($scope.selColorObj)
            var setColor = ""

            if (receipt.checked) {
               for (var i = 0; i < array.length; i++) {
                  if ($scope.selColorObj[array[i]] == "") {
                     setColor = array[i]
                     break
                  }
               }
               if (setColor == "") { return }

               $scope.selColorObj[setColor] = setColor
               receipt.selColor = setColor
            }
            else {
               //有資料清除
               if (receipt.selColor) {
                  $scope.selColorObj[receipt.selColor] = ""
               }

               receipt.selColor = setColor
            }
         }

         //重新設定採購單排序
         $scope.setDocOrder = function (item) {
            angular.forEach($scope.guided_out, function (value, key) {
               switch (true) {
                  case (item.doc_no == value.doc_no):
                     value.docOrder = "0"
                     break
                  default:
                     value.docOrder = "1"
                     break
               }
            })
         }

         //重新設定料件對比排序
         $scope.setContrastNumOrder = function (item) {
            angular.forEach($scope.guided_out, function (value, key) {
               value.contrastNumOrder = ((value.contrast_num / value.detail_cnt) * 100)
            })
         }

         //自動排序條件
         $scope.setOrderRule = function () {
            if ($scope.setOrderType === "setItemColor") {
               return ["docOrder", "-contrastNumOrder", "-detail_cnt", "doc_date", "doc_no"]
            }

            return ["doc_date", "doc_no"]
         }

         //點選上下頁
         $scope.changeActive = function (idx) {
            if (idx < 1 || idx > $scope.pageList[$scope.pageList.length - 1]) {
               return
            }
            $scope.form = {
               "page": $scope.pageList[idx - 1]
            }

            $scope.goListTop()
         }

         //回到清單頂端
         $scope.goListTop = function () {
            $timeout(function () {
               $ionicScrollDelegate._instances[1].scrollTop()
            }, 0)
         }

         //前往設定頁面
         $scope.goViewSetting = function () {
            $state.go("kb_03_s02")
         }

         //長按時跳出功能選單
         $scope.MoreFeaturesShow = function (receipt) {

            var buttons = [
               {
                  "text": $scope.langs.deal_with_out   //待出處理:0
               }
            ]
            kb_03_PopupService.showMoreFeatures(buttons, function (index) {
               switch (index) {
                  case 0:
                     var temp = []
                     angular.forEach($scope.guided_out, function (item) {
                        if (item.checked) {
                           temp.push({
                              "doc_no": item.doc_no,
                              "selColor": item.selColor,
                              "doc_type": item.doc_type
                           })
                        }
                     })

                     if (temp.length > 0) {
                        //
                     }
                     else {
                        temp = [{
                           "doc_no": receipt.doc_no,
                           "selColor": receipt.selColor,
                           "doc_type": receipt.doc_type
                        }]
                     }
                     kb_03_requisition.kb_03_setDocArray(temp)
                     $state.go("kb_03_s03_01.kb_03_s03_02")

                     break
                  default:
                     break
               }

               return true //關閉功能清單
            })
         }

         //返回Menu頁
         $scope.goToMenu = function () {
            var page = "fil_00_s04"
            $state.go(page)
         }

         //==================== 外部呼叫 Function ====================(E)


         //==================== 呼叫 BDL 元件 ====================(S)

         //取得設定資料
         function getSetting() {
            var parameter = {
               "ent": userInfoService.userInfo.enterprise_no,
               "site": userInfoService.userInfo.site_no
            }

            if (commonService.Platform == "Chrome") {
               showToastMiddle("必須先設作業設定", 0)
               $scope.setting = {
                  //source: 0,
                  "A01": true,
                  "A02": false,
                  "A03": false,
                  "A04": false,
                  "warehouses": "",
                  "singles": ""
               }

               kb_03_requisition.kb_03_setting = $scope.setting

               //取得資料
               getDataList(1, "")
            }
            else {
               $ionicLoading.show()
               APIBridge.callAPI("kb_03_get_setting", [parameter]).then(function (result) {
                  $ionicLoading.hide()

                  console.log(result.data[0])
                  if (result.data[0].cnt > 0) {
                     $scope.setting = {
                        //source: result.data[0].setting.source,
                        "A01": result.data[0].setting.A01,
                        "A02": result.data[0].setting.A02,
                        "A03": result.data[0].setting.A03,
                        "A04": result.data[0].setting.A04,
                        "warehouses": "",
                        "singles": ""
                     }

                     $scope.warehouseList = result.data[0].warehouse
                     angular.forEach($scope.warehouseList, function (item) {
                        if ($scope.setting.warehouses == "") {
                           $scope.setting.warehouses = item.warehouse
                        } else {
                           $scope.setting.warehouses += (";" + item.warehouse)
                        }
                     })

                     $scope.singleList = result.data[0].single
                     angular.forEach($scope.singleList, function (item) {
                        if ($scope.setting.singles == "") {
                           $scope.setting.singles = item.single
                        } else {
                           $scope.setting.singles += (";" + item.single)
                        }
                     })

                     kb_03_requisition.kb_03_setting = $scope.setting
                  }
                  else {
                     showToastMiddle("必須先設作業設定", 0)
                  }

                  //取得資料
                  getDataList(1, "")
               }, function (error) {
                  $ionicLoading.hide()
                  IonicPopupService.errorAlert("kb_03_get_setting fail")
                  console.log(error)

                  //取得資料
                  getDataList(1, "")
               })
            }
         }

         //==================== 呼叫 BDL 元件 ====================(E)

         //初始化變數
         page_init()

         //取得設定
         getSetting()
      }
   ]
})