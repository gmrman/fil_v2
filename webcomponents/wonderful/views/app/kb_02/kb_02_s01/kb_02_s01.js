define(["API", "APIS", "AppLang", "views/app/kb_04/requisition.js", "ionic-popup", "Directives", "ReqTestData", "commonService", "views/app/kb_02/kb_02_s01/js/PopupService.js", "commonFormat"], function () {
   return ["userInfoService", "$scope", "$state", "$filter", "AppLang", "IonicPopupService", "APIService", "$timeout", "kb_04_requisition", "APIBridge", "ReqTestData", "commonService", "kb_02_PopupService", "$ionicPopup", "$ionicModal", "$ionicScrollDelegate", "$ionicPosition", "commonFormat", "ionicToast", "$q", "$ionicLoading", "numericalAnalysisService",
      function (userInfoService, $scope, $state, $filter, AppLang, IonicPopupService, APIService, $timeout, kb_04_requisition, APIBridge, ReqTestData, commonService, kb_02_PopupService, $ionicPopup, $ionicModal, $ionicScrollDelegate, $ionicPosition, commonFormat, ionicToast, $q, $ionicLoading, numericalAnalysisService) {
         var page_params_bak = kb_04_requisition.page_params_bak

         $scope.langs = AppLang.langs
         $scope.userInfo = userInfoService.getUserInfo()
         if (Object.keys(page_params_bak).length > 0) {
            commonService.set_page_params(page_params_bak, $scope.userInfo.account)
         }
         $scope.page_params = commonService.get_page_params()
         kb_04_requisition.kb_02_bakPageParams($scope.page_params)

         //切換頁面Title
         userInfoService.changeTitle($scope.page_params.name)

         //==================== 內部呼叫 Function ====================(S)
         var server_product = userInfoService.userInfo.server_product  //當前系統
         $scope.receiptListScroll = $ionicScrollDelegate.$getByHandle("receiptListScroll")

         //init變數
         function page_init() {
            kb_04_requisition.init()

            $scope.diplaySearch = false
            $scope.isCheckboxShown = false
            $scope.filter = ""
            $scope.firstItem = []
            $scope.statusBand = []   //記錄燈帶更新function
            $scope.setOrderType = ""
            $scope.orientation = window.orientation || 0 //當前螢幕翻轉方向

            //使用者設定
            $scope.setting = {
               "limited": "0",
               "amount": 50,
               "orderBy": "0",
               "showNumType": 20,
               "showNum": 1
            }
         }

         //==================== 內部呼叫 Function ====================(E)

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

         var d3 = require("d3")

         $scope.searchInfo = {
            "manufacturers": "",
            "product": ""
         }

         //清空查詢條件
         $scope.clearSearch = function () {
            $scope.searchInfo.manufacturers = ""
            $scope.searchInfo.product = ""
         }

         //重設頁碼
         function setPageNum() {
            var array = $filter("filter")($scope.sales_notice, $scope.filter)
            var num = ($scope.setting.showNumType == Infinity) ? $scope.setting.showNum : $scope.setting.showNum = $scope.setting.showNumType
            var pageCnt = array.length / num

            $scope.pageList = convertPage(Math.ceil(pageCnt))
            $scope.form = {
               "page": $scope.pageList[0]
            }
         }

         //取得清單資料
         $scope.getList = function () {
            var serviceJob = $q.defer()
            var servicePromise = serviceJob.promise

            var webTran = {
               "service": "app.km.oh.polist.get",
               "parameter": {
                  "date": commonFormat.getCurrent("date"),     //查詢日期
                  "limit_type": $scope.setting.limited,        //查詢限制方式
                  "limit_value": $scope.setting.amount,        //查詢限制值
                  "guide_the_role": $scope.setting.orderBy,    //查詢導引角色
                  "qry_vendor_cond": $scope.searchInfo.manufacturers,     //供應商查詢範圍
                  "qry_item_cond": $scope.searchInfo.product              //料號查詢範圍
               }
            }

            $ionicLoading.show()
            if (ReqTestData.testData) {
               $scope.sales_notice = ReqTestData.getReceiptList(webTran.parameter)

               angular.forEach($scope.sales_notice, function (item, index) {
                  item.index = index
                  setDataStatus(index)
               })

               //重設頁碼
               setPageNum()
               $scope.goListTop()

               //燈帶更新
               $timeout(function () {
                  $scope.sales_notice.forEach(function (item) {
                     $scope.setStatusBand(item)
                  })
               }, 0)

               $timeout(function () {
                  $ionicLoading.hide()
               }, 200)

               serviceJob.resolve()
            } else {
               APIService.Web_Post(webTran, function (res) {
                  console.log("success:" + res)
                  var parameter = res.payload.std_data.parameter
                  $timeout(function () {
                     $scope.sales_notice = parameter.oh_detail || []

                     angular.forEach($scope.sales_notice, function (item, index) {
                        if (!!item.item) {
                           item.item_no = item.item
                           delete item.item
                        }

                        item.index = index
                        setDataStatus(index)
                     })

                     //重設頁碼
                     setPageNum()
                     $scope.goListTop()

                     //燈帶更新
                     $timeout(function () {
                        $scope.sales_notice.forEach(function (item) {
                           $scope.setStatusBand(item)
                        })
                     }, 0)

                     $timeout(function () {
                        $ionicLoading.hide()
                     }, 200)
                  }, 0)

                  serviceJob.resolve()
               }, function (error) {
                  $ionicLoading.hide()
                  var execution = error.payload.std_data.execution
                  console.log("error:" + execution.description)
                  IonicPopupService.errorAlert(execution.description)

                  $scope.diplaySearch = false

                  serviceJob.reject()
               })
            }

            return servicePromise
         }

         $scope.getManufacturers = function (search) {
            var serviceJob = $q.defer()
            var servicePromise = serviceJob.promise

            var webTran = {
               "service": "app.km.oh.vendorlist.get",
               "parameter": {
                  "searchcondition": search
               }
            }

            $ionicLoading.show()
            if (ReqTestData.testData) {
               $ionicLoading.hide()

               $scope.vendorlist = ReqTestData.getManufacturers()
               $scope.sel_vendorlist = angular.copy($scope.vendorlist)

               serviceJob.resolve()
            }
            else {
               APIService.Web_Post(webTran, function (res) {
                  $ionicLoading.hide()
                  console.log("success:" + res)
                  var parameter = res.payload.std_data.parameter
                  $timeout(function () {
                     $scope.vendorlist = parameter.vendorlist
                     $scope.sel_vendorlist = angular.copy($scope.vendorlist)
                  }, 0)

                  serviceJob.resolve()
               }, function (error) {
                  $ionicLoading.hide()
                  var execution = error.payload.std_data.execution
                  console.log("error:" + execution.description)
                  IonicPopupService.errorAlert(execution.description)

                  serviceJob.reject()
               })
            }

            return servicePromise
         }

         $scope.getProductNo = function (search) {
            var serviceJob = $q.defer()
            var servicePromise = serviceJob.promise

            var webTran = {
               "service": "app.km.oh.itemlist.get",
               "parameter": {
                  "searchcondition": search
               }
            }

            $ionicLoading.show()
            if (ReqTestData.testData) {
               $ionicLoading.hide()

               $scope.itemlist = ReqTestData.getProduct()
               $scope.sel_itemlist = angular.copy($scope.itemlist)

               serviceJob.resolve()
            }
            else {
               APIService.Web_Post(webTran, function (res) {
                  $ionicLoading.hide()
                  console.log("success:" + res)
                  var parameter = res.payload.std_data.parameter
                  $timeout(function () {
                     $scope.itemlist = parameter.itemlist
                     $scope.sel_itemlist = angular.copy($scope.itemlist)
                  }, 0)

                  serviceJob.resolve()
               }, function (error) {
                  $ionicLoading.hide()
                  var execution = error.payload.std_data.execution
                  console.log("error:" + execution.description)
                  IonicPopupService.errorAlert(execution.description)

                  serviceJob.reject()
               })
            }

            return servicePromise
         }

         //重新取得資料
         $scope.receiptRef = function () {
            clearTrigger()

            $scope.getList()
            //$scope.clearSearch();

            $scope.diplaySearch = false
            $scope.isCheckboxShown = false
            $scope.filter = ""
            $scope.firstItem = []
            $scope.setOrderType = ""

            angular.forEach($scope.sales_notice, function (value, key) {
               value.selColor = ""
               value.checked = false
            })

            //$scope.sel_vendorlist = angular.copy($scope.vendorlist);
            //$scope.sel_itemlist = angular.copy($scope.itemlist)
         }

         function clearTrigger() {
            angular.forEach($scope.sales_notice, function (value, key) {
               //清除定時
               if (!!value.chkTrigger) {
                  $timeout.cancel(value.chkTrigger)
               }
            })
         }

         //廠商開窗
         $scope.manufacturersShow = function () {
            kb_02_PopupService.showManufacturersModal($scope.sel_vendorlist, $scope.setManufacturers, function () { })
         }

         //設置選取結果顯示
         $scope.setManufacturers = function (manufacturers) {
            if (!manufacturers) { return }

            var checked = manufacturers.filter(function (item) {
               return item.checked
            })
            $scope.searchInfo.manufacturers = ""

            angular.forEach(checked, function (item) {
               if ($scope.searchInfo.manufacturers == "") {
                  $scope.searchInfo.manufacturers = item.vendor_no
               } else {
                  $scope.searchInfo.manufacturers += (";" + item.vendor_no)
               }
            })
         }

         //品號開窗
         $scope.productNoShow = function () {
            kb_02_PopupService.showProductNoModal($scope.sel_itemlist, $scope.setProductNo, function () { })
         }

         $scope.setProductNo = function (product) {
            if (!product) { return }

            var checked = product.filter(function (item) {
               return item.checked
            })

            $scope.searchInfo.product = ""
            angular.forEach(checked, function (item) {
               if ($scope.searchInfo.product == "") {
                  $scope.searchInfo.product = item.item_no
               } else {
                  $scope.searchInfo.product += (";" + item.item_no)
               }
            })
         }

         //取得排序資料
         function getSetting() {
            var serviceJob = $q.defer()
            var servicePromise = serviceJob.promise

            var parameter = {
               "ent": userInfoService.userInfo.enterprise_no,
               "site": userInfoService.userInfo.site_no
            }

            $ionicLoading.show()
            if (commonService.Platform == "Chrome") {
               $ionicLoading.hide()

               serviceJob.resolve()
            }
            else {
               APIBridge.callAPI("kb_02_get_setting", [parameter]).then(function (result) {
                  $ionicLoading.hide()
                  console.log(result.data[0].setting)

                  if (result.data[0].cnt > 0) {
                     $scope.setting = result.data[0].setting
                     if ($scope.setting.showNumType == null) {
                        $scope.setting.showNumType = Infinity
                     }
                  }

                  serviceJob.resolve()
               }, function (error) {
                  $ionicLoading.hide()
                  IonicPopupService.errorAlert("kb_02_get_setting fail")
                  console.log(error)

                  serviceJob.reject()
               })
            }

            return servicePromise
         }

         //長按時跳出功能選單
         $scope.MoreFeaturesShow = function (item) {
            var data = undefined

            if (!$scope.isCheckboxShown && item) {
               data = item
            }
            else {
               data = angular.copy($scope.sales_notice).filter(function (item) {
                  return item.checked
               })
            }

            var button01 = $scope.langs.check_accept
            if (data || data[0]) {
               switch (data.type || data[0].type) {
                  case "2":
                     button01 = "QC"
                     break
                  case "3":
                     button01 = $scope.langs.put_in_storage
                     break
               }
            }

            var buttons = [
               {
                  "index": 0,  //點收:0
                  "text": button01
               },
               //{
               //   "index": 8,
               //   "text": $filter("langFilter")($scope.userInfo.language, [$scope.langs.label, $scope.langs.print])        //標籤列印:8
               //},
               {
                  "index": 1,
                  "text": $filter("langFilter")($scope.userInfo.language, [$scope.langs.manufacturers, $scope.langs.data]) //廠商資料:1
               },
               {
                  "index": 2,
                  "text": $filter("langFilter")($scope.userInfo.language, [$scope.langs.purchase, $scope.langs.doc, $scope.langs.data]) //採購單資料:2
               },
               {
                  "index": 3,
                  "text": $filter("langFilter")($scope.userInfo.language, [$scope.langs.order_no, $scope.langs.data]) //訂單資料:3
               },
               {
                  "index": 4,
                  "text": $filter("langFilter")($scope.userInfo.language, [$scope.langs.work_rder, $scope.langs.data]) //工單資料:4
               },
               {
                  "index": 5,
                  "text": $filter("langFilter")($scope.userInfo.language, [$scope.langs.image, $scope.langs.view]) //圖片檢視:5
               },
               //{
               //    index: 6,
               //    text: $filter("langFilter")($scope.userInfo.language, [$scope.langs.examine, $scope.langs.specification]) //檢驗規範:6
               //},
               //{
               //    index: 7,
               //    text: $filter("langFilter")($scope.userInfo.language, [$scope.langs.package, $scope.langs.specification]) //包裝規範:7
               //}
            ]

            kb_02_PopupService.showMoreFeatures(buttons, function (index) {
               switch (index) {
                  case 0:
                     changePage(item)
                     break
                  case 1:
                     getVendor(item)
                     break
                  case 2:
                     getPoData(item)
                     break
                  case 3:
                     getSoData(item)
                     break
                  case 4:
                     getWodata(item)
                     break
                  case 5:
                     getItemPic(item)
                     break
                  case 6:
                     break
                  case 7:
                     break
                  case 8:
                     //WF產品不支援標籤列印
                     if (server_product == "WF") {
                        var msg = $scope.langs.error.MD025
                        showToastMiddle(msg)
                     }
                     break
                  default:
                     break
               }

               return true //關閉功能清單
            })
         }

         //統一入口跳轉
         function changePage(item) {
            var temp = [], data = ""

            if (!$scope.isCheckboxShown && item) {
               data = item
            }
            else {
               data = angular.copy($scope.sales_notice).filter(function (item) {
                  return item.checked
               })
            }
            var type = data.type || data[0].type

            switch (type) {
               //待收
               case "1":
                  if (data.length) {
                     angular.forEach(data, function (item) {
                        temp.push({
                           "po_no": item.po_no,
                           "po_sno": item.po_sno,
                           "item_no": item.item_no,
                           "item_desc": item.item_desc,
                           "item_spec": item.item_spec,
                           "receipts_no": item.receipts_no,
                           "receipts_sno": item.receipts_sno,
                           "unit_no": item.unit_no,
                           "qty": item.qty,
                           "maxqty": item.qty,
                           "decimal_places": item.decimal_places,
                           "decimal_places_type": item.decimal_places_type,
                           "reference_unit_no": item.reference_unit_no,
                           "reference_qty": item.reference_qty,
                           "reference_rate": item.reference_rate,
                           "reference_decimal_places": item.reference_decimal_places,
                           "reference_decimal_places_type": item.reference_decimal_places_type,
                           "valuation_unit_no": item.valuation_unit_no,
                           "valuation_rate": numericalAnalysisService.accDiv(item.qty, item.valuation_qty),
                           "valuation_qty": item.valuation_qty,
                           "multi_unit_type": item.multi_unit_type
                        })
                     })
                  }
                  else {
                     temp = [{
                        "po_no": data.po_no,
                        "po_sno": data.po_sno,
                        "item_no": data.item_no,
                        "item_desc": data.item_desc,
                        "item_spec": data.item_spec,
                        "receipts_no": data.receipts_no,
                        "receipts_sno": data.receipts_sno,
                        "unit_no": item.unit_no,
                        "qty": data.qty,
                        "maxqty": item.qty,
                        "decimal_places": item.decimal_places,
                        "decimal_places_type": item.decimal_places_type,
                        "reference_unit_no": item.reference_unit_no,
                        "reference_qty": item.reference_qty,
                        "reference_rate": item.reference_rate,
                        "reference_decimal_places": item.reference_decimal_places,
                        "reference_decimal_places_type": item.reference_decimal_places_type,
                        "valuation_unit_no": item.valuation_unit_no,
                        "valuation_rate": numericalAnalysisService.accDiv(item.doc_qty, item.valuation_qty),
                        "valuation_qty": item.valuation_qty,
                        "multi_unit_type": item.multi_unit_type
                     }]
                  }

                  kb_04_requisition.kb_02_setDocArray(temp)
                  break

               //待驗
               case "2":
                  if (data.length) {
                     kb_04_requisition.setParameter(data)
                  }
                  else {
                     kb_04_requisition.setParameter([data])
                  }

                  break

               //待入
               case "3":
                  if (data.length) {
                     angular.forEach(data, function (item) {
                        temp.push({
                           "doc_no": item.receipts_no,
                           "seq": item.receipts_sno
                        })
                     })
                  } else {
                     temp = [{
                        "doc_no": data.receipts_no,
                        "seq": data.receipts_sno
                     }]
                  }

                  $scope.doc_array = temp
                  break
            }

            goPage(type)
         }

         //点击数据跳转
         var goPage = function (type) {
            var obj = {}

            //採購收貨
            if (type == "1") {
               obj = {
                  "program_job_no": "1",
                  "status": "A",
                  "scan_type": "1",
                  "upload_scan_type": "2",
                  "mod": "APM",
                  "in_out_no": "0"
               }

               commonService.set_page_params(obj, $scope.userInfo.account)

               $state.go("kb_04_s01_02.kb_04_s01_04")
            }

            //QC
            if (type == "2") {
               obj = {
                  "program_job_no": "16-3",
                  "status": "A",
                  "scan_type": "0",
                  "upload_scan_type": "0",
                  "mod": "AQC",
                  "in_out_no": "0"
               }

               commonService.set_page_params(obj, $scope.userInfo.account)

               $state.go("kb_04_s02_04")
            }

            //採購入庫
            if (type == "3") {
               obj = {
                  "program_job_no": "2",
                  "status": "A",
                  "scan_type": "1",
                  "upload_scan_type": "2",
                  "mod": "APM",
                  "in_out_no": "1"
               }

               commonService.set_page_params(obj, $scope.userInfo.account)
               commonService.set_page_doc_array(angular.copy($scope.doc_array))

               //取得預設倉庫 設定頁面 或 第一筆資料
               var out_warehouse = userInfoService.userInfo.warehouse_no || userInfoService.warehouse[0].warehouse_no

               //取得倉庫資訊
               var index = userInfoService.warehouseIndex[out_warehouse]
               var out_storage_management = userInfoService.warehouse[index].storage_management || "N"
               var sel_in_storage = userInfoService.warehouse[index].storage_spaces
               var storage_spaces_no = (out_storage_management == "Y") ? sel_in_storage[0].storage_spaces_no : " "

               commonService.set_page_warehouse_no(out_warehouse)
               commonService.set_page_storage_spaces_no(storage_spaces_no)
               commonService.set_page_lot_no("")

               getDocInfo(obj)
            }
         }

         //廠商資料
         function getVendor(item) {
            var name = "Vendor"
            $scope.setionicModal("views/app/kb_02/kb_02_s01/kb_02_s01_01//kb_02_s01_01.html", name)
            $scope.vendorModalData = item

            var webTran = {
               "service": "app.km.vendor.data.get",
               "parameter": {
                  "vendor_no": item.vendor_no
               }
            }
            console.log(webTran)

            $ionicLoading.show()
            if (ReqTestData.testData) {
               $ionicLoading.hide()
               $scope.vendor_data = ReqTestData.getVendorData(webTran)

               $timeout(function () {
                  $scope.openModal(name)
               }, 200)
            }
            else {
               APIService.Web_Post(webTran, function (res) {
                  $ionicLoading.hide()
                  console.log("success:" + res)
                  var parameter = res.payload.std_data.parameter
                  if (parameter && parameter.vendor_data) {
                     $timeout(function () {
                        $scope.vendor_data = parameter.vendor_data[0]
                        $scope.openModal(name)
                     }, 0)
                  }
               }, function (error) {
                  $ionicLoading.hide()
                  var execution = error.payload.std_data.execution
                  console.log("error:" + execution.description)
                  IonicPopupService.errorAlert(execution.description)
               })
            }
         }

         //採購單資料
         function getPoData(item) {
            var name = "PoData"
            $scope.setionicModal("views/app/kb_02/kb_02_s01/kb_02_s01_02/kb_02_s01_02.html", name)

            var webTran = {
               "service": "app.km.po.data.get",
               "parameter": {
                  "po_no": item.po_no,   //"CTC-LB1-170300000001",
                  "po_sno": item.po_sno
               }
            }
            console.log(webTran)

            $ionicLoading.show()
            if (ReqTestData.testData) {
               $ionicLoading.hide()
               $scope.po_data = [ReqTestData.getPoData(webTran)].map(function (obj) {
                  obj.shipping_date = ("" + obj.shipping_date).replace(/-/g, "/")
                  obj.arrival_date = ("" + obj.arrival_date).replace(/-/g, "/")
                  obj["stock-in_date"] = ("" + obj["stock-in_date"]).replace(/-/g, "/")

                  return obj
               })[0]

               $timeout(function () {
                  $scope.openModal(name)
               }, 200)
            }
            else {
               APIService.Web_Post(webTran, function (res) {
                  $ionicLoading.hide()
                  console.log("success:" + res)
                  var parameter = res.payload.std_data.parameter
                  $timeout(function () {
                     $scope.po_data = parameter.po_data.map(function (obj) {
                        obj.shipping_date = ("" + obj.shipping_date).replace(/-/g, "/")
                        obj.arrival_date = ("" + obj.arrival_date).replace(/-/g, "/")
                        obj["stock-in_date"] = ("" + obj["stock-in_date"]).replace(/-/g, "/")

                        return obj
                     })[0]

                     $scope.openModal(name)
                  }, 0)
               }, function (error) {
                  $ionicLoading.hide()
                  var execution = error.payload.std_data.execution
                  console.log("error:" + execution.description)
                  IonicPopupService.errorAlert(execution.description)
               })
            }
         }

         //訂單資料
         function getSoData(item) {
            if (item.datasource !== "3") {
               //MD011 資料來源並非 {0} - 訂單
               var msg = commonFormat.format($scope.langs.error.MD011, $scope.langs.order_no)

               showToastMiddle(msg)
               return
            }

            var name = "SoData"
            $scope.setionicModal("views/app/kb_02/kb_02_s01/kb_02_s01_03/kb_02_s01_03.html", name)

            var webTran = {
               "service": "app.km.so.data.get",
               "parameter": {
                  "so_no": item.sourceno,
                  "so_sno": item.sourcesno
               }
            }
            console.log(webTran)

            $ionicLoading.show()
            if (ReqTestData.testData) {
               $ionicLoading.hide()

               webTran.parameter.so_no = "CTC-ZH1-170400000001"
               $scope.so_data = [ReqTestData.getSoData(webTran)].map(function (obj) {
                  obj.agreed_shipping_date = ("" + obj.agreed_shipping_date).replace(/-/g, "/")

                  return obj
               })[0]

               $timeout(function () {
                  $scope.openModal(name)
               }, 200)
            }
            else {
               APIService.Web_Post(webTran, function (res) {
                  $ionicLoading.hide()
                  console.log("success:" + res)
                  var parameter = res.payload.std_data.parameter
                  $timeout(function () {
                     $scope.so_data = parameter.so_data.map(function (obj) {
                        obj.agreed_shipping_date = ("" + obj.agreed_shipping_date).replace(/-/g, "/")

                        return obj
                     })[0]

                     $scope.openModal(name)
                  }, 0)
               }, function (error) {
                  $ionicLoading.hide()
                  var execution = error.payload.std_data.execution
                  console.log("error:" + execution.description)
                  IonicPopupService.errorAlert(execution.description)
               })
            }
         }

         //工單資料
         function getWodata(item) {
            var msg = ""

            //WF產品不提供此檢視功能
            if (server_product == "WF") {
               msg = $scope.langs.error.MD024
               showToastMiddle(msg)
               return
            }

            if (item.datasource !== "5") {
               //MD011 資料來源並非 {0} - 工單
               msg = commonFormat.format($scope.langs.error.MD011, $scope.langs.work_rder)

               showToastMiddle(msg)
               return
            }

            var name = "WoData"
            $scope.setionicModal("views/app/kb_02/kb_02_s01/kb_02_s01_04/kb_02_s01_04.html", name)

            var webTran = {
               "service": "app.km.wo.data.get",
               "parameter": {
                  "wo_no": item.sourceno
               }
            }
            console.log(webTran)

            $ionicLoading.show()
            if (ReqTestData.testData) {
               $ionicLoading.hide()

               $scope.wo_data = [ReqTestData.getWoData(webTran)].map(function (obj) {
                  obj.start_date = ("" + obj.start_date).replace(/-/g, "/")
                  obj.completion_date = ("" + obj.completion_date).replace(/-/g, "/")

                  return obj
               })[0]

               $timeout(function () {
                  $scope.openModal(name)
               }, 200)
            }
            else {
               APIService.Web_Post(webTran, function (res) {
                  $ionicLoading.hide()
                  console.log("success:" + res)
                  var parameter = res.payload.std_data.parameter
                  $timeout(function () {
                     $scope.wo_data = parameter.wo_data.map(function (obj) {
                        obj.start_date = ("" + obj.start_date).replace(/-/g, "/")
                        obj.completion_date = ("" + obj.completion_date).replace(/-/g, "/")

                        return obj
                     })[0]

                     $scope.openModal(name)
                  }, 0)
               }, function (error) {
                  $ionicLoading.hide()
                  var execution = error.payload.std_data.execution
                  console.log("error:" + execution.description)
                  IonicPopupService.errorAlert(execution.description)
               })
            }
         }

         //圖片檢視
         function getItemPic(item) {
            var name = "ItemPic"
            $scope.setionicModal("views/app/kb_02/kb_02_s01/kb_02_s01_05/kb_02_s01_05.html", name)

            var webTran = {
               "service": "app.km.item.pic.get",
               "parameter": {
                  "item_no": item.item_no,
                  "site_no": userInfoService.userInfo.site_no
               }
            }
            console.log(webTran)

            $ionicLoading.show()
            if (ReqTestData.testData) {
               $ionicLoading.hide()

               webTran.parameter.item_no = "ZH01"
               $scope.item_pic = ReqTestData.getItemPic(webTran)

               $timeout(function () {
                  $scope.openModal(name)
               }, 200)
            }
            else {
               APIService.Web_Post(webTran, function (res) {
                  $ionicLoading.hide()
                  console.log("success:" + res)
                  var parameter = res.payload.std_data.parameter
                  $timeout(function () {
                     $scope.item_pic = parameter.item_pic[0]
                     $scope.openModal(name)
                  }, 0)
               }, function (error) {
                  $ionicLoading.hide()
                  var execution = error.payload.std_data.execution
                  console.log("error:" + execution.description)
                  IonicPopupService.errorAlert(execution.description)
               })
            }
         }

         $scope.reset = function () {
            if ($ionicScrollDelegate.$getByHandle("scrollImage").getScrollView().__zoomLevel < 1) {
               $ionicScrollDelegate.$getByHandle("scrollImage").zoomTo(1, false, 0, 0)
            }
         }

         //顯示 Toast 訊息
         function showToastMiddle(msg) {
            ionicToast.show(msg, "middle", false, 1500)
         }

         $scope.isCheckboxShown = false
         //顯示checkbox
         $scope.showCheckbox = function (isCheckboxShown) {
            $scope.isCheckboxShown = !isCheckboxShown
         }

         $scope.setItemColor = function (item) {
            var edit = false //是否可以修改

            //是否為第一筆被選中的項目
            var firstIdx = $scope.firstItem.findIndex(function (first) {
               return first.po_no == item.po_no &&
                  first.po_sno == item.po_sno &&
                  first.receipts_no == item.receipts_no &&
                  first.receipts_sno == item.receipts_sno
            })

            //清空點選的項目
            if (firstIdx !== -1) {
               $scope.filter = ""
               $scope.firstItem = []
               $scope.showCheckbox($scope.isCheckboxShown)
               edit = true

               $scope.setOrderType = ""
               setPageNum()

               //燈帶更新
               $ionicLoading.show()
               $timeout(function () {
                  $scope.sales_notice.forEach(function (item) {
                     $scope.setStatusBand(item)
                  })
               }, 0)

               $timeout(function () {
                  $ionicLoading.hide()
               }, 200)
            }
            else {
               //是否還未點選項目
               if ($scope.firstItem.length == 0) {
                  var addfirst = {
                     "po_no": item.po_no,
                     "po_sno": item.po_sno,
                     "receipts_no": item.receipts_no,
                     "receipts_sno": item.receipts_sno
                  }
                  $scope.firstItem.push(addfirst)
                  $scope.showCheckbox($scope.isCheckboxShown)
                  item.checked = !item.checked

                  $scope.filter = {
                     "type": item.type
                  }

                  //待驗只顯示同品號的資料
                  if (item.type == "2") {
                     $scope.filter.item_no = item.item_no

                     //ZHEN-TEST 暫時只傳遞一筆資料
                     $scope.filter.index = item.index
                  }

                  edit = true

                  $scope.setDocOrder(item)
                  $scope.setProductOrder(item)
                  $scope.setOrderType = "setItemColor"  //將採購單、加入排序

                  setPageNum()
                  if ($ionicScrollDelegate) {
                     $ionicScrollDelegate.scrollTop()
                  }
               }
            }

            if (!edit) {
               return
            }

            angular.forEach($scope.sales_notice, function (value, key) {

               //重複點選第一項時，清空顏色設置
               if (firstIdx !== -1) {
                  value.selColor = ""
                  value.checked = false
                  return
               }

               if (value.po_no != item.po_no) {
                  if (value.item_no != item.item_no) {
                     value.selColor = ""
                     return
                  }

                  //不同採購單且同品號
                  value.selColor = "#FFC000"
               }
               else {
                  if (value.item_no == item.item_no) {
                     value.selColor = ""
                     return
                  }
                  //同採購單
                  value.selColor = "#92D050"
               }
            })
         }

         //燈帶
         $scope.setStatusBand = function (receipt) {
            (function (receipt) {
               var screenWidth = document.documentElement.clientWidth
               var screenHeight = document.documentElement.clientHeight
               if (screenWidth && screenHeight) {
                  if (screenWidth > screenHeight) {
                     screenWidth = screenWidth * 1
                  } else {
                     screenWidth = screenWidth * 1
                  }
               }

               var chartPath = {
                  "width": Math.floor((screenWidth / 5) - 8),
                  "higth": 20,
                  "maxW": 110,
                  "minW": 10,
                  "center": 3
               }

               //資料
               var section = [
                  {
                     "data": receipt.light_num1,
                     "color": receipt.light1
                  },
                  {
                     "data": receipt.light_num2,
                     "color": receipt.light2
                  },
                  {
                     "data": receipt.light_num3,
                     "color": receipt.light3
                  },
                  {
                     "data": receipt.light_num4,
                     "color": receipt.light4
                  },
                  {
                     "data": receipt.light_num5,
                     "color": receipt.light5
                  }
               ]

               var color = {
                  "G": "#44DB51",
                  "Y": "#FFCD00",
                  "R": "#FF2850",
                  "N": "#FFFFFF"
               }

               var statusBandId = "#StatusBand" + receipt.index

               //繪圖板設定
               var statusBand = d3.select(statusBandId)
                  .attr("width", screenWidth)
                  .attr("height", chartPath.higth)
               var polygon = statusBand.selectAll("g").data(section).enter().append("svg:g")
                  .on("touchstart", function (data, index) {
                     setChartTime(data, index)
                     polygon.on("touchmove touchend", cancelEvent)
                  })

               //長按事件
               var ChartTime
               function setChartTime(data, index) {
                  ChartTime = setTimeout(function () {
                     polygon.on("touchmove touchend", null)

                     console.log("Chart Time")
                  }, 600)
               }

               //點擊事件
               function cancelEvent(data, index) {
                  polygon.on("touchmove touchend", null)
                  clearTimeout(ChartTime)

                  console.log("Cancel Event!")
               }

               polygon.append("svg:polygon")
                  .attr("points", breadcrumbPoints)
                  .style("fill", function (data, index) {
                     var fill = ""
                     if (data.color.length > 1) {
                        fill = color[data.color[0]] || "transparent"
                     }
                     else {
                        fill = color[data.color] || "transparent"
                     }

                     return fill
                  })

               //文字設定
               polygon.append("svg:text")
                  .attr("x", chartPath.width / 2)
                  .attr("y", chartPath.higth / 2)
                  .attr("dy", "0.35em")
                  .attr("text-anchor", "middle")
                  .attr("font-weight", 60)
                  .attr("font-size", "14px")
                  .attr("fill", function (data, idx, element) {
                     if (!data.color) { data.color = "" }
                     if (data.color.length == 1) {
                        return "#000000"
                     }

                     //清除定時
                     if (!!receipt.chkTrigger) {
                        $timeout.cancel(receipt.chkTrigger)
                        receipt.chkTrigger = undefined
                     }

                     //設置定時閃爍
                     if (idx == 0 && !receipt.chkTrigger) {
                        var trigger = true

                        var setFill = function () {
                           if (trigger) {
                              $(element[idx]).attr("fill", "#FFFFFF")
                           }
                           else {
                              $(element[idx]).attr("fill", "#000000")
                           }

                           trigger = !trigger
                           receipt.chkTrigger = $timeout(setFill, 600, false)
                        }
                        $timeout(setFill, 600, false)

                        //離開頁面時銷毀事件呼叫
                        var stateChangeStart = $scope.$on("$stateChangeStart", function (event, data) {
                           stateChangeStart()
                           $timeout.cancel(receipt.chkTrigger)
                        })
                     }

                     return "#000000"
                  })
                  .text(function (data) {
                     if (data.data === 0) {
                        return ""
                     }

                     return data.data
                  })

               //設定間隔
               polygon.attr("transform", function (data, index) {
                  return "translate(" + index * (chartPath.width + chartPath.center) + ", 0)"
               })

               //依照設定繪圖
               function breadcrumbPoints(data, index) {
                  var points = []
                  points.push("0,0")
                  points.push(chartPath.width + ",0")
                  //points.push(chartPath.maxW + "," + (chartPath.higth / 2));
                  points.push(chartPath.width + "," + chartPath.higth)
                  points.push("0," + chartPath.higth)
                  //points.push(chartPath.minW + "," + (chartPath.higth / 2));

                  return points.join(" ")
               }

               function getStatusBand() {
                  if ($scope.orientation === window.orientation) {
                     console.log("orientationList return!")
                     return
                  }

                  //重新取得寬度
                  screenWidth = document.documentElement.clientWidth
                  screenHeight = document.documentElement.clientHeight
                  if (screenWidth && screenHeight) {
                     if (screenWidth > screenHeight) {
                        screenWidth = screenWidth * 1
                     } else {
                        screenWidth = screenWidth * 1
                     }
                  }

                  chartPath.width = Math.floor((screenWidth / 5) - 8)

                  //重設畫布
                  statusBand = d3.select(statusBandId)
                     .attr("width", screenWidth)

                  //重設多邊形
                  polygon.selectAll("polygon")
                     .attr("points", breadcrumbPoints)

                  //重設文字
                  polygon.selectAll("text")
                     .attr("x", chartPath.width / 2)

                  //重設間隔
                  polygon.attr("transform", function (data, index) {
                     return "translate(" + index * (chartPath.width + chartPath.center) + ", 0)"
                  })
               }

               $scope.statusBand.push(getStatusBand)
            })(receipt)
         }

         //設定單據排序資料
         function setDataStatus(index) {
            var tempItemDay = new Date($scope.sales_notice[index].shipping_date)
            var ItemDay = new Date(tempItemDay.getFullYear(), tempItemDay.getMonth(), tempItemDay.getDate())
            if (ItemDay != "Invalid Date") {
               var month = ItemDay.getMonth() + 1
               if (month < 10) { month = "0" + month }

               var day = ItemDay.getDate()
               if (day < 10) { day = "0" + day }

               $scope.sales_notice[index].formatdate = month + "/" + day
            }

            var type = $scope.sales_notice[index].type
            switch ($scope.setting.orderBy) {
               case "0":
                  if (type == "1") {
                     $scope.sales_notice[index].typeOrder = "0"
                  }
                  if (type == "2") {
                     $scope.sales_notice[index].typeOrder = "1"
                  }
                  if (type == "3") {
                     $scope.sales_notice[index].typeOrder = "2"
                  }
                  break

               case "1":
                  if (type == "1") {
                     $scope.sales_notice[index].typeOrder = "1"
                  }
                  if (type == "2") {
                     $scope.sales_notice[index].typeOrder = "0"
                  }
                  if (type == "3") {
                     $scope.sales_notice[index].typeOrder = "2"
                  }
                  break

               case "2":
                  if (type == "1") {
                     $scope.sales_notice[index].typeOrder = "1"
                  }
                  if (type == "2") {
                     $scope.sales_notice[index].typeOrder = "2"
                  }
                  if (type == "3") {
                     $scope.sales_notice[index].typeOrder = "0"
                  }
                  break
            }

            switch (type) {
               case "1":
                  $scope.sales_notice[index].borderColor = "Blue"
                  break
               case "2":
                  $scope.sales_notice[index].borderColor = "Gold"
                  break
               case "3":
                  $scope.sales_notice[index].borderColor = "Green"
                  break
            }
         }

         var tempToDay = new Date()
         var ToDay = new Date(tempToDay.getFullYear(), tempToDay.getMonth(), tempToDay.getDate())
         $scope.$on("ngRepeatStatus", function (event, index) {
            //排序用資料
            $scope.sales_notice[index].checked = $scope.sales_notice[index].checked || false
            $scope.sales_notice[index].selColor = $scope.sales_notice[index].selColor || ""
         })

         //重新設定採購單排序
         $scope.setDocOrder = function (item) {
            angular.forEach($scope.sales_notice, function (value, key) {
               switch (true) {
                  case (item.po_no == value.po_no):
                     value.docOrder = "0"
                     break
                  default:
                     value.docOrder = "1"
                     break
               }
            })
         }

         //重新設定料件排序
         $scope.setProductOrder = function (item) {
            angular.forEach($scope.sales_notice, function (value, key) {
               switch (true) {
                  case (item.item_no == value.item_no):
                     value.productOrder = "0"
                     break
                  default:
                     value.productOrder = "1"
                     break
               }
            })
         }

         //自動排序條件
         $scope.setOrderRule = function () {
            if ($scope.setOrderType === "setItemColor") {
               return ["typeOrder", "docOrder", "productOrder", "sort1", "sort2", "sort3", "sort4", "index"]
            }

            return ["typeOrder", "sort1", "sort2", "sort3", "sort4", "index"]
         }

         //點選上下頁
         $scope.changeActive = function (idx) {
            clearTrigger()

            if (idx < 1 || idx > $scope.pageList[$scope.pageList.length - 1]) {
               return
            }
            $ionicLoading.show()

            $scope.form = {
               "page": $scope.pageList[idx - 1]
            }
            $scope.goListTop()

            //燈帶更新
            $timeout(function () {
               $scope.sales_notice.forEach(function (item) {
                  $scope.setStatusBand(item)
               })
            }, 0)

            $timeout(function () {
               $ionicLoading.hide()
            }, 200)
         }

         //回到清單頂端
         $scope.goListTop = function () {
            $timeout(function () {
               if ($ionicScrollDelegate._instances[0] && $ionicScrollDelegate._instances[1]) {
                  $ionicScrollDelegate._instances[0].scrollTop()
                  $ionicScrollDelegate._instances[1].scrollTop()
               }
            }, 0)
         }

         //設置 ionicModal 視窗
         $scope.ionicModal = {}
         $scope.setionicModal = function (url, name) {
            $ionicModal.fromTemplateUrl(url, {
               "scope": $scope,
               "animation": "none"
            }).then(function (modal) {
               $scope.ionicModal[name] = modal
            })

            $scope.openModal = function (name) {
               $scope.ionicModal[name].show()
            }

            $scope.closeModal = function (name) {
               $scope.ionicModal[name].hide().then(function () {
                  return $scope.ionicModal[name].remove()
               })
            }
         }

         //是否顯示查詢列
         $scope.setDiplaySearch = function (diplaySearch) {
            $scope.diplaySearch = !diplaySearch

            //當顯示時，自動彈出廠商開窗
            if ($scope.diplaySearch) {
               $scope.manufacturersShow()
            }
         }

         //設置Title滑動
         var header = $(".fix-row-header")
         $scope.setHeader = function () {
            var position = $scope.receiptListScroll._instances[1].getScrollPosition()

            if (position.left == 0) {
               position.left = $scope.receiptListScroll._instances[1].element.scrollLeft
            }

            header.css({
               "-webkit-transform": "translate3d(-" + position.left + "px, 0px, 0px)",
               "-ms-transform": "translate3d(-" + position.left + "px, 0px, 0px)",
               "-moz-transform": "translate3d(-" + position.left + "px, 0px, 0px)",
               "transform": "translate3d(-" + position.left + "px, 0px, 0px)"
            })
         }

         $scope.setPosition = function (index) {
            var height = 65 * index + (32 - index) + "px"

            return { "position": "absolute", "top": height }
         }

         //前往設定頁面
         $scope.goViewSetting = function () {
            $state.go("kb_02_s02")
         }

         //============================== 串接標準程式 Function ==============================(S)

         if (commonService.Platform != "Chrome") {
            kb_04_requisition.init()

            var obj = [
               {   //待收
                  "program_job_no": "1",
                  "status": "A",
                  "scan_type": "1",
                  "upload_scan_type": "2",
                  "in_out_no": "0"
               },
               {   //待入
                  "program_job_no": "2",
                  "status": "A",
                  "scan_type": "1",
                  "upload_scan_type": "2",
                  "in_out_no": "1"
               }
            ]

            //清除上次資料
            for (var l_i = 0; l_i < obj.length; l_i++) {
               var l_data = {
                  "bcae005": obj[l_i].in_out_no,    //出入庫瑪
                  "bcae006": obj[l_i].program_job_no + obj[l_i].status,
                  "bcae014": obj[l_i].program_job_no,
                  "bcae015": obj[l_i].status,       // A開立新單 / S過賬 / Y確認
                  "info_id": angular.copy($filter("date")(new Date(), "yyyyMMddHHmmss sss"))
               }

               $ionicLoading.show()
               APIBridge.callAPI("bcme_ae_af_delete", [l_data]).then(function (result) {
                  $ionicLoading.hide()
               }, function (error) {
                  $ionicLoading.hide()
                  userInfoService.getVoice("bcme_ae_af_delete fail", function () { })
                  console.log(error)
               })
            }
         }

         //新增單據相關訊息
         var InsertToBcmcBcme = function (parameter) {
            if (commonService.Platform == "Chrome") {
               $state.go("kb_04_s03_02.kb_04_s03_04")
               return
            }

            $ionicLoading.show()
            APIBridge.callAPI("bcme_delete", [$scope.l_data]).then(function (result) {
               if (result) {
                  APIBridge.callAPI("bcme_create", [parameter, $scope.l_data]).then(function (result) {
                     $ionicLoading.hide()
                     if (result) {
                        console.log("bcme_create success")
                        $state.go("kb_04_s03_02.kb_04_s03_04")
                     } else {
                        userInfoService.getVoice("bcme_create error", function () { })
                     }
                  }, function (error) {
                     $ionicLoading.hide()
                     userInfoService.getVoice("bcme_create fail", function () { })
                     console.log(error)
                  })
               } else {
                  $ionicLoading.hide()
                  userInfoService.getVoice("bcme_delete error", function () { })
               }
            }, function (error) {
               $ionicLoading.hide()
               userInfoService.getVoice("bcme_delete fail", function () { })
               console.log(error)
            })
         }

         //取得選取的單據資料
         function getDocInfo(obj) {
            $scope.l_data = {
               "bcae005": obj.in_out_no,    //出入庫瑪
               "bcae006": obj.program_job_no + obj.status,
               "bcae014": obj.program_job_no,
               "bcae015": obj.status,       // A開立新單 / S過賬 / Y確認
               "info_id": angular.copy($filter("date")(new Date(), "yyyyMMddHHmmss sss"))
            }

            var webTran = {
               "service": "app.todo.doc.get",
               "parameter": {
                  "program_job_no": obj.program_job_no,
                  "scan_type": obj.scan_type,
                  "status": obj.status,
                  "analysis_symbol": userInfoService.userInfo.barcode_separator || "%",
                  "site_no": userInfoService.userInfo.site_no,
                  "info_id": $scope.l_data.info_id,
                  "param_master": $scope.doc_array
               }
            }

            $ionicLoading.show()
            if (ReqTestData.testData) {
               $ionicLoading.hide()

               var temp = $scope.sales_notice.filter(function (item) {
                  if (item.checked || ($scope.doc_array[0].doc_no == item.po_no && $scope.doc_array[0].seq == item.po_sno)) {
                     return true
                  }
               })

               var parameter = ReqTestData.kb_getAppTodoDoc(webTran.parameter, temp)

               kb_04_requisition.setParameter(parameter)
               InsertToBcmcBcme(parameter)
            } else {
               APIService.Web_Post(webTran, function (res) {
                  $ionicLoading.hide()
                  console.log("success:" + res)
                  var parameter = res.payload.std_data.parameter

                  kb_04_requisition.setParameter(parameter)
                  InsertToBcmcBcme(parameter)
               }, function (error) {
                  $ionicLoading.hide()
                  var execution = error.payload.std_data.execution

                  console.log("error:" + execution.description)
                  userInfoService.getVoice(execution.description, function () { })
               })
            }
         }

         //============================== 串接標準程式 Function ==============================(E)

         //返回Menu頁
         $scope.goToMenu = function () {
            var page = "fil_00_s04"

            $state.go(page)
         }

         //初始化變數
         page_init()

         //依照順序呼叫function
         commonFormat.wait([
            //取得使用者設定
            function (next) {
               getSetting().then(function () {
                  console.log("resolve")

                  next()
               }).catch(function () {
                  console.log("reject")

                  next()
               })
            },
            //取得資料清單-廠商
            function (next) {
               $scope.getManufacturers("").then(function () {
                  console.log("resolve")

                  next()
               }).catch(function () {
                  console.log("reject")

                  next()
               })
            },
            //取得資料清單-料件
            function (next) {
               $scope.getProductNo("").then(function () {
                  console.log("resolve")

                  next()
               }).catch(function () {
                  console.log("reject")

                  next()
               })
            },
            //取得資料清單-單據清單
            function (next) {
               $scope.getList().then(function () {
                  console.log("resolve")

                  next()
               }).catch(function () {
                  console.log("reject")
               })
            },
         ], function (msg) {
            ionic.Platform.ready(function () {
               console.log("頁面初始完畢!")

               //設定view寬度
               function WidthResize(source) {
                  if ($scope.orientation === window.orientation && source === "resize") {
                     return
                  }

                  //重新取得控件的寬度
                  var getWidth = (function () {
                     return function () {
                        var width = 0
                        var screenWidth = document.documentElement.clientWidth
                        var screenHeight = document.documentElement.clientHeight

                        if (screenWidth && screenHeight) {
                           if (screenWidth > screenHeight) {
                              width = screenWidth * 1.8
                           } else {
                              width = screenWidth * 2.25
                           }
                        }

                        return width
                     }
                  })()

                  var Width = getWidth()
                  $("ion-scroll.timetable_scroll")
                     .css("width", "105vw")
                  $("ion-scroll.timetable_scroll ion-scroll > div[class='scroll']")
                     .css("width", Width + "px")
                  $(".fix-row-header").css("width", Width + "px")
                  $scope.receiptListScroll.resize()
               }

               //設定view高度
               function HeightResize(source) {
                  if ($scope.orientation === window.orientation && source === "resize") {
                     return
                  }

                  //重新取得控件的高度，方式與 widet/js/directives.js 相同
                  var getHeight = (function () {
                     var element = $("ion-nav-view")
                     var pagerSearch = $("div.search")
                     var pagerFooter = $("ion-footer-bar")
                     var parent = ionic.DomUtil.getParentWithClass(element[0], "scroll-content") || ionic.DomUtil.getParentWithClass(element[0], "pane")

                     return function (type) {
                        var height = 0
                        var offset = $ionicPosition.offset(element)
                        var pagerSearch_offset = $ionicPosition.offset(pagerSearch)
                        var pagerFooter_offset = (type == "scroll") ? $ionicPosition.offset(pagerFooter) : { "height": 0 }
                        var parentOffset = $ionicPosition.offset(angular.element(parent))

                        if (parent) {
                           height = parentOffset.height - pagerSearch_offset.height - pagerFooter_offset.height
                        }

                        return height
                     }
                  })()

                  var Height = getHeight("subView")
                  $("ion-nav-view[name='kb_02_s01_list']")
                     .css("height", Height + "px")

                  Height = getHeight("scroll")
                  $("ion-scroll.timetable_scroll > div[class='scroll']")
                     .css("height", Height + "px")
                  $scope.receiptListScroll.resize()
               }
               $timeout(function () {
                  WidthResize("init")
                  HeightResize("init")
               }, 0)

               $scope.$watch("diplaySearch", function (newVal, oldVal) {
                  if (newVal !== oldVal) {
                     $timeout(function () { }, 0).then(function () {
                        $timeout(function () {
                           WidthResize("diplaySearch")
                           HeightResize("diplaySearch")
                        }, 0)
                     })
                  }
               })

               $(window).on("resize.kb_02_s01", (function () {
                  //避免容器計算後，再次觸發事件
                  if ($scope.orientation === window.orientation) {
                     return
                  }

                  WidthResize("resize")
                  HeightResize("resize")

                  //刷新燈帶資訊
                  angular.forEach($scope.statusBand, function (fn) {
                     fn()
                  })

                  $scope.orientation = window.orientation || 0
               }))

               //每一次翻頁就移除事件
               $scope.$watch("form.page", function (newVal, oldVal) {
                  if (newVal !== oldVal) {
                     $scope.statusBand = []
                  }
               })

               //離開頁面時銷毀事件呼叫
               var stateChangeStart = $scope.$on("$stateChangeStart", function (event, data) {
                  console.log("kb_02_s01 leave")

                  stateChangeStart()
                  $(window).off("resize.kb_02_s01")
               })

               //離開頁面時，銷毀資料
               $scope.$on("$destroy", function () {
                  if ($scope.ionicModal["Vendor"]) {
                     $scope.ionicModal["Vendor"].remove()
                  }

                  if ($scope.ionicModal["PoData"]) {
                     $scope.ionicModal["PoData"].remove()
                  }

                  if ($scope.ionicModal["SoData"]) {
                     $scope.ionicModal["SoData"].remove()
                  }

                  if ($scope.ionicModal["WoData"]) {
                     $scope.ionicModal["WoData"].remove()
                  }

                  if ($scope.ionicModal["ItemPic"]) {
                     $scope.ionicModal["ItemPic"].remove()
                  }
               })
            })
         }, true)



         //===============================================================

         //創一個 Render 自動判斷是否有 webGL
         //$timeout(function () {
         //    var width = document.documentElement.clientWidth;
         //    var height = document.documentElement.clientHeight;
         //    function Obj(width, height, id) {

         //        var renderer = new PIXI.autoDetectRenderer(width, height, {
         //            antialias: false,     //抗鋸齒
         //            transparent: true,    //透明背景
         //            resolution: 1         //原分辨率
         //        });
         //        document.getElementById("test" + id).appendChild(renderer.view);

         //        var stage = new PIXI.Container();

         //        this.graphic = new PIXI.Graphics;
         //        this.graphic.beginFill(0xFFFF00);
         //        stage.addChild(this.graphic);

         //        requestAnimationFrame(render);

         //        function render() {
         //            renderer.render(stage);
         //            requestAnimationFrame(render);
         //        };
         //    }

         //    var rectWidth = (width - 40) / 5;
         //    var a = new Obj(834.75, 30, 0);

         //    a.graphic.drawRect(10, 5, rectWidth, 20);
         //    a.graphic.drawRect(rectWidth + 15, 5, rectWidth, 20);
         //    a.graphic.drawRect((rectWidth * 2) + 20, 5, rectWidth, 20);
         //    a.graphic.drawRect((rectWidth * 3) + 25, 5, rectWidth, 20);
         //    a.graphic.drawRect((rectWidth * 4) + 30, 5, rectWidth, 20);

         //    $timeout(function () {
         //        a.graphic.graphicsData[0].fillColor = 0xE42112;
         //        a.graphic.dirty = true;
         //        a.graphic.clearDirty = true;

         //        console.log(a);
         //    }, 5000)

         //    var b = new Obj(834.75, 65, 1);

         //    b.graphic.drawRect(10, 5, rectWidth, 20);
         //    b.graphic.drawRect(rectWidth + 15, 5, rectWidth, 20);
         //    b.graphic.drawRect((rectWidth * 2) + 20, 5, rectWidth, 20);
         //    b.graphic.drawRect((rectWidth * 3) + 25, 5, rectWidth, 20);
         //    b.graphic.drawRect((rectWidth * 4) + 30, 5, rectWidth, 20);
         //    
         //    // 創建 Stage 
         //    //var stage = new PIXI.Container();

         //    //// 建立 Graphics 物件
         //    //var graphics = new PIXI.Graphics();
         //    //stage.addChild(graphics);

         //    //graphics.beginFill(0xff0000); // 設定我們要畫的顏色
         //    //graphics.drawRect(0, 0, 70, 20);

         //    //// 以 Render 去渲染 Stage
         //    //renderer.render(stage);

         //    //var x = 0, y = 0, space = 75;
         //    //var width = 70, height = 20;

         //    //x = (space * 0) + 2;
         //    //setRect(0x4DB51, x, y, width, height);
         //    //setText("1", ((width / 2) + x + 1), ((height / 2) + 1.5), setTextCallBack);

         //    //x = (space * 1) + 2;
         //    //setRect(0xFFCD00, x, y, width, height);
         //    //setText("2", ((width / 2) + x + 1), ((height / 2) + 1.5));

         //    //x = (space * 2) + 2;
         //    //setRect(0xFF2850, x, y, width, height);
         //    //setText("3", ((width / 2) + x + 1), ((height / 2) + 1.5));

         //    //x = (space * 3) + 2;
         //    //setRect(0xFFFFFF, x, y, width, height);
         //    //setText("4", ((width / 2) + x + 1), ((height / 2) + 1.5));

         //    //x = (space * 4) + 2;
         //    //setRect(0xFF0000, x, y, width, height);
         //    //setText("5", ((width / 2) + x + 1), ((height / 2) + 1.5));

         //    //// 矩形繪製
         //    //function setRect(color, x, y, width, height) {
         //    //    graphics.beginFill(color); // 設定我們要畫的顏色
         //    //    graphics.drawRect(x, y, width, height);
         //    //}

         //    //// 文字設定
         //    //function setText(content, x, y, callback) {
         //    //    var text = new PIXI.Text(content, {
         //    //        fontSize: 14,
         //    //        fill: 0x000000,
         //    //        align: "center"
         //    //    });

         //    //    text.anchor.set(0.5, 0.5);
         //    //    text.position.set(x, y);

         //    //    stage.addChild(text);

         //    //    $timeout(function () {
         //    //        if (callback) {
         //    //            callback(text);
         //    //        }
         //    //    }, 0);
         //    //};

         //    //function setTextCallBack(text) {
         //    //    //清除定時
         //    //    if (text.chkTrigger) {
         //    //        $timeout.cancel(text.chkTrigger);
         //    //        text.chkTrigger = undefined;
         //    //    };

         //    //    //設置定時閃爍
         //    //    if (!text.chkTrigger) {
         //    //        var trigger = true;

         //    //        function setFill() {
         //    //            if (trigger) {
         //    //                text.style.fill = 0xFFFFFF;
         //    //            }
         //    //            else {
         //    //                text.style.fill = 0x000000;
         //    //            };

         //    //            trigger = !trigger;
         //    //            text.chkTrigger = $timeout(setFill, 600, false);

         //    //            renderer.render(stage);
         //    //        };
         //    //        $timeout(setFill, 600, false);

         //    //        //離開頁面時銷毀事件呼叫
         //    //        var stateChangeStart = $scope.$on("$stateChangeStart", function (event, data) {
         //    //            stateChangeStart();
         //    //            $timeout.cancel(text.chkTrigger);
         //    //        });
         //    //    };
         //    //}
         //}, 0)

         //===============================================================
      }
   ]
})