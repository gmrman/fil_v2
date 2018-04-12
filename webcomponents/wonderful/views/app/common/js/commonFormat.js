define(["app", "API", "APIS"], function (app) {
   app.service("commonFormat", ["AppLang", "$state", "$filter", "$ionicLoading", "$timeout", "$ionicHistory", "$ionicPopup",
      function (AppLang, $state, $filter, $ionicLoading, $timeout, $ionicHistory, $ionicPopup) {
         var self = this

         /***********************************************************************************************************************
          * Descriptions...: 增加Date的格式化時間
          * Usage..........: Date.getCurrent("類型") -> "測試資料"
          * Return code....: format                    格式後的時間
          * Modify.........: 20170524 By zhen
          * 
          * yyyy年四碼 MM月兩碼 dd日兩碼 MM時兩碼 mm分兩碼 ss秒兩碼 sss毫秒三碼
          ***********************************************************************************************************************/
         self.getCurrent = function (type) {
            var day = new Date()
            var format = ""

            switch (type) {
               //年-月-日
               case "date":
                  format = $filter("date")(day, "yyyy-MM-dd")
                  break

                  //時:分:秒
               case "time":
                  format = $filter("date")(day, "HH:mm:ss")
                  break

                  //時:分:秒.毫秒
               case "timeMillisecond":
                  format = $filter("date")(day, "HH:mm:ss.sss")
                  break

                  //年-月-日 時:分:秒
               default:
                  format = $filter("date")(day, "yyyy-MM-dd HH:mm:ss")
                  break
            }

            return format
         }

         /***********************************************************************************************************************
          * Descriptions...: 增加String的Format功能
          * Usage..........: String.format("測試{0}", "資料") -> "測試資料"
          * Input parameter: msg                 需要取代的訊息
          *                : {0}, {1}, {2}...    取代的文字
          * Return code....: msg                 取代後的訊息
          * Modify.........: 20170502 By zhen
          ***********************************************************************************************************************/
         self.format = function () {
            var s = arguments[0]  //呼叫function時的第一個參數
            if (s == null) return ""

            for (var i = 0; i < arguments.length - 1; i++) {
               var reg = getStringFormatPlaceHolderRegEx(i)

               //逐一取代參數資料
               s = s.replace(reg, (arguments[i + 1] == null ? "" : arguments[i + 1]))
            }
            return cleanStringFormatResult(s)
         }

         //組合正則表達示，篩選全部數字參數 {}
         function getStringFormatPlaceHolderRegEx(placeHolderIndex) {
            return new RegExp("({)?\\{" + placeHolderIndex + "\\}(?!})", "gm")
         }

         //剔除所有數字參數 {}
         function cleanStringFormatResult(txt) {
            if (txt == null) return ""
            return txt.replace(getStringFormatPlaceHolderRegEx("\\d+"), "")
         }

         /***********************************************************************************************************************
            * Descriptions...: 清除ARRAY中的重複資料
            * Usage..........: self.dedup([ {a:1},{a:1} ]) -> "[ {a:1} ]"
            * Input parameter: arr                 需要檢查的陣列
            * Modify.........: 20170602 By zhen
            ***********************************************************************************************************************/
         self.dedup = function (arr) {
            var hashTable = {}
            var arg = arguments

            return arr.filter(function (ele) {
               var key = ""

               switch (true) {
                  case (arg.length > 2):
                     for (var i = 1; i <= arg.length; i++) {
                        if (!!key) {
                           key += "^"
                        }
                        key += JSON.stringify(ele[arg[i]])
                     }
                     break
                  case (arg.length === 2):
                     key = ele[arg[1]]
                     break
                  default:
                     key = JSON.stringify(ele)
                     break
               }

               var match = Boolean(hashTable[key])

               return (match ? false : hashTable[key] = true)
            })
         }

         /***********************************************************************************************************************
          * Descriptions...: 返回 Menu 時，將其設為根目錄，清除歷史資料
          * Usage..........: clearHistory()
          * Modify.........: 20170606 By zhen 
          * Modify.........: 20171225 By zhen 新版返回鈕不再觸發 Tab, 暫時不再使用此 function
          ***********************************************************************************************************************/
         //self.goToMenu = function () {
         //    var page = "fil_00_s04";

         //    //清除歷史紀錄
         //    self.clearHistory();

         //    $state.go(page);
         //};

         //self.clearHistory = function () {
         //    //清除歷史紀錄
         //    $ionicHistory.nextViewOptions({
         //        disableAnimate: true,
         //        disableBack: true,
         //        historyRoot: true
         //    });
         //};

         /***********************************************************************************************************************
          * Descriptions...: 非同步function處理流程控制
          * Usage..........: self.wait(fn, callback, serial)
          * Input parameter: fn                呼叫的function
          *                : callback          fn處理完畢後，才執行callback
          *                : serial            fn呼叫是否串行(A -> B -> C)，依照順序
          * Modify.........: 20171121 By zhen
          ***********************************************************************************************************************/
         self.wait = function (fn, callback, serial) {
            var count = 0

            for (var l_i = 0, len = fn.length; l_i < len; l_i++) {
               fn[l_i](next)

               //一次執行一個function
               if (!!serial) {
                  break
               }
            }

            function next() {
               if (count < fn.length) {
                  if (!!serial && count + 1 < fn.length) {
                     fn[count + 1](next)
                  }
                  count++
               }

               if (count === fn.length) {
                  callback()
               }
            }
         }

         /***********************************************************************************************************************
          * Descriptions...: ARRAY資料分組 - 內容必須為物件類型
          * Usage..........: self.GroupBy([ {a:1},{a:1},{a:2} ]) -> "{a:1}"
          * Input parameter: data                 需要檢查的陣列
          *                : field                分組依據欄位
          * Modify.........: 20170608 By zhen
          ***********************************************************************************************************************/
         self.GroupBy = function (data) {
            var arrayTable = {}
            var arg = arguments

            data.map(function (obj) {
               var temp = arrayTable

               for (var i = 0; i < arg.length - 1; i++) {
                  var key = obj[arg[i + 1]] || "GroupBy_other"

                  //後面還有其他分組欄位
                  if (arg[i + 2] !== undefined) {
                     //組合Obj資訊
                     if (i == 0) {
                        temp = (arrayTable[key] = arrayTable[key] || {})
                     }
                     else {
                        temp = (temp[key] = temp[key] || {})
                     }
                  }
                  else {
                     //塞入分組後資料
                     (temp[key] = temp[key] || []).push(obj)
                  }
               }
            })

            return arrayTable
         }

         /***********************************************************************************************************************
          * Descriptions...: ARRAY資料分組 - 淺層key
          * Usage..........: self.GroupByOut([ {a:1},{a:1},{a:2} ]) -> "{a:1}"
          * Input parameter: data                 需要檢查的陣列
          *                : field                分組依據欄位
          * Modify.........: 20170711 By zhen
          ***********************************************************************************************************************/
         self.GroupByOut = function (data) {
            var arrayTable = {}
            var arg = arguments
            var objkey

            data.map(function (obj) {
               var temp = arrayTable
               var objkey = ""

               for (var i = 0; i < arg.length - 1; i++) {
                  var key = obj[arg[i + 1]] || ""
                  objkey += (!objkey) ? key : ";" + key

                  //後面還有其他分組欄位
                  if (arg[i + 2] !== undefined) {
                     //
                  }
                  else {
                     //塞入分組後資料
                     (arrayTable[objkey] = arrayTable[objkey] || []).push(obj)
                  }
               }
            })

            return arrayTable
         }

         /***********************************************************************************************************************
          * Descriptions...: 提示訊息
          * Usage..........: self.alertMsg(title, msg)
          * Input parameter: title              訊息標題
          *                : msg                訊息內容
          * Modify.........: 20170608 By zhen
          ***********************************************************************************************************************/
         self.alertMsg = function (title, msg) {
            var alertPopup = $ionicPopup.alert({
               "title": title,
               "template": "<p style='margin: 5px; text-align: center'>" + msg + "</p>",
               "cssClass": "cssClass",
               "okText": AppLang.langs.confirm,
               "okType": "lightblue"
            })

            return alertPopup
         }

         /***********************************************************************************************************************
            * Descriptions...: 檢查變數是否一致
            * Usage..........: self.checkData(data_A, data_2)
            * Input parameter: data_A              檢查資料一
            *                : data_B              檢查資料二
            * Modify.........: 20170630 By zhen
            *                : 20170725 By zhen 改用 angular.equals(o1, o2);
            ***********************************************************************************************************************/
         //self.checkData = function (data_A, data_B) {

         //    switch (typeof data_A) {
         //        case "function":
         //            if (typeof data_B !== "function") {
         //                return false;
         //            };

         //            break;
         //        case "object":
         //            if (typeof data_B !== "object") {
         //                return false;
         //            };

         //            var myObj_A = objKeyOrder(data_A);
         //            var myObj_B = objKeyOrder(data_B);

         //            if (JSON.stringify(myObj_A) !== JSON.stringify(myObj_B)) {
         //                return false;
         //            };

         //            break;
         //        default:
         //            if (data_A != data_B) {
         //                return false;
         //            };

         //            break;
         //    }

         //    return true;
         //};

         ////object Key值重新排列
         //function objKeyOrder(checkObj) {
         //    if (!checkObj) {
         //        return checkObj;
         //    };

         //    var obj = {},
         //        keys = Object.keys(checkObj).sort(),
         //        i, len = keys.length;

         //    for (i = 0; i < len; i++) {
         //        key = keys[i];
         //        if (typeof checkObj[key] === "object") {
         //            obj[key] = objKeyOrder(checkObj[key]);
         //        }
         //        else {
         //            obj[key] = checkObj[key];
         //        };
         //    };

         //    return obj;
         //};

         return self
      }
   ])

   /***********************************************************************************************************************
    * Descriptions...: 字串超出限制長度時，回傳長度內字串 + ...
    * Usage..........: {{ string | filterEllipsis: 5 }}
    * Modify.........: 20170803 By zhen
    ***********************************************************************************************************************/
   app.filter("filterEllipsis", function () {
      return function (input, limit, begin, ellipses, direction) {
         var outInput = input.toString()

         begin = (!begin || isNaN(begin)) ? 0 : parseInt(begin, 10)
         begin = (begin < 0) ? Math.max(0, input.length + begin) : begin

         if (limit > 0) {
            outInput = sliceFn(input, begin, begin + limit)
         } else if (limit == 0) {
            outInput = sliceFn(input, limit, input.length)
         } else {
            if (begin === 0) {
               outInput = sliceFn(input, limit, input.length)
            } else {
               outInput = sliceFn(input, Math.max(0, begin + limit), begin)
            }
         }

         if (!!ellipses && outInput.length !== input.toString().length) {
            switch (direction) {
               case "R":
                  outInput = ellipses + outInput
                  break

               default:
                  outInput = outInput + ellipses
                  break
            }
         }

         return outInput
      }
   })

   function sliceFn(input, begin, end) {
      return input.slice(begin, end)
   }

   /***********************************************************************************************************************
    * Descriptions...: 語言別處理
    * Usage..........: {{ 'zh_TW' | langFilter: [langs.xxx, langs.xxx], ... }}
    * Modify.........: 20171215 By zhen
    ***********************************************************************************************************************/
   app.filter("langFilter", function () {
      return function (input) {
         //取得參數陣列
         var arg = [].slice.call(arguments, 1)
         var outInput = ""
         var slice = ""

         switch (input) {
            case "zh_TW":
            case "zh_CN":
               slice = ""
               break
            case "en_US":
               slice = "_"
               break

            default:
               slice = ""
               console.log("this is defined lang")
               break
         }

         for (var i = 0,len = arg.length; i < len; i++) {
            arg[i] = (typeof arg[i] !== "string") ? arg[i].join(slice) : arg[i]
         }
         outInput = arg.join("")

         return outInput
      }
   })

   /***********************************************************************************************************************
    * Descriptions...: 添加 Toast 類型的通知
    * Usage..........: ionicToast.show(訊息、位置、是否顯示關閉紐、顯示時間)  ionicToast.hide()
    * Return code....: 
    * Modify.........: 20170613 By zhen
    * Example........: $scope.showToastTop = function () {
    *                      ionicToast.show('這是 Top 的 toast', 'top', true, 2000);
    *                  };

    *                  $scope.showToastMiddle = function () {
    *                      ionicToast.show('這是 Middle 的 toast', 'middle', false, 1000);
    *                  };

    *                  $scope.showToastBottom = function () {
    *                      ionicToast.show('這是 Bottom 的 toast', 'bottom', false, 2000);
    *                  };
    ***********************************************************************************************************************/
   app.factory("ionicToast", ["$compile", "$document", "$rootScope", "$timeout", "$q",
      function ($compile, $document, $rootScope, $timeout, $q) {

         var ionicToastJob

         //停留時間
         var toastTimeout

         //初始設定
         var defaultScope = {
            "toastClass": "",
            "toastMessage": "",
            "toastStyle": {
               "display": "none",
               "opacity": 0
            }
         }

         //出現位置
         var toastPosition = {
            "top": "ionic_toast_top",
            "middle": "ionic_toast_middle",
            "bottom": "ionic_toast_bottom"
         }

         //新增 $rootScope.Scope
         var toastScope = $rootScope.$new()

         //設定 Toast 模板
         var template =
                "<div class=\"ionic_toast\" ng-class=\"ionicToast.toastClass\" ng-style=\"ionicToast.toastStyle\">" +
                "    <span class=\"ionic_toast_close\" ng-click=\"hide()\">" +
                "        <i class=\"ion-close-round toast_close_icon\"></i>" +
                "    </span>" +
                "    <span ng-bind-html=\"ionicToast.toastMessage\"></span>" +
                "</div>"

         var toastTemplate = $compile(template)(toastScope)
         toastScope.ionicToast = defaultScope

         //將 Toast Template 加載
         $document.find("body").append(toastTemplate)

         var toggleDisplayOfToast = function (display, opacity, callback) {
            toastScope.ionicToast.toastStyle = {
               "display": display,
               "opacity": opacity
            }

            toastScope.ionicToast.toastStyle.opacity = opacity
            callback()
         }

         //Toast 隱藏顯示
         toastScope.hide = function () {
            toggleDisplayOfToast("none", 0, function () {
               console.log("toast hidden")
            })

            ionicToastJob.resolve()
         }

         return {
            //(訊息、位置、關閉紐、顯示時間)
            "show": function (message, position, closeBtn, duration) {

               //沒有訊息、位置 便直接離開
               if (!message || !position) return
               $timeout.cancel(toastTimeout)

               if (duration < 0 || !duration) {
                  duration = 0
               }

               if (duration > 5000) {
                  duration = 5000
               }

               //異步工作
               ionicToastJob = $q.defer()
               var ionicToastPromise = ionicToastJob.promise  // 返回 Promise

               angular.extend(toastScope.ionicToast, {
                  //設定位置、按鈕等CSS
                  "toastClass": toastPosition[position] + " " + (closeBtn ? "ionic_toast_sticky" : ""),

                  //顯示訊息
                  "toastMessage": message
               })

               toggleDisplayOfToast("block", 1, function () {
                  //當存在關閉紐，讓使用者自行離開
                  if (closeBtn) { return }

                  toastTimeout = $timeout(function () {
                     toastScope.hide()
                  }, duration)
               })

               return ionicToastPromise
            },

            "hide": function () {
               toastScope.hide()
               ionicToastJob.resolve()
            }
         }
      }
   ])

   /***********************************************************************************************************************
    * Descriptions...: 上拉選單
    * Usage..........: 
    * Modify.........: 20170719 By zhen
    ***********************************************************************************************************************/
   angular.module("ionic-pullup", [])
      .constant("ionPullUpFooterState", {
         "COLLAPSED": "COLLAPSED",
         "MINIMIZED": "MINIMIZED",
         "SWITCHED": "SWITCHED",
         "EXPANDED": "EXPANDED"
      })
      .constant("ionPullUpFooterBehavior", {
         "HIDE": "HIDE",
         "SWITCH": "SWITCH",
         "EXPAND": "EXPAND"
      })
      .directive("ionPullUpFooter", ["$timeout", "$rootScope", "$window", "$ionicPlatform", function ($timeout, $rootScope, $window, $ionicPlatform) {
         return {
            "restrict": "AE",
            "scope": {
               "state": "=",
               "onExpand": "&",
               "onCollapse": "&",
               "onMinimize": "&",
               "onSwitche": "&"
            },
            "controller": ["$scope", "$element", "$attrs", "ionPullUpFooterState", "ionPullUpFooterBehavior", function ($scope, $element, $attrs, FooterState, FooterBehavior) {
               var height = parseInt($attrs.height, 10) || 25
               var tabs, header, tabsHeight, headerHeight, handleHeight = 0,
                  footer = {
                     "switch": true,
                     "height": 0,
                     "posY": 0,
                     "lastPosY": 0,
                     "defaultHeight": height || $element[0].offsetHeight,
                     "maxHeight": parseInt($attrs.maxHeight, 10) || 0,
                     "initialState": $attrs.initialState ? $attrs.initialState.toUpperCase() : FooterState.COLLAPSED,
                     "defaultBehavior": $attrs.defaultBehavior ? $attrs.defaultBehavior.toUpperCase() : FooterBehavior.EXPAND
                  }

               function init() {
                  computeDefaultHeights()

                  $timeout(function () {
                     $element.css({ "transition": "300ms ease-in-out", "padding": 0 })
                  }, 0)
               }

               function computeDefaultHeights() {
                  tabs = document.querySelector(".tabs")
                  header = document.querySelector(".bar-header")
                  tabsHeight = tabs ? tabs.offsetHeight : 0
                  headerHeight = header ? header.offsetHeight : 0
               }

               function computeHeights() {
                  footer.height = footer.maxHeight > 0 ? footer.maxHeight : $window.innerHeight - headerHeight - handleHeight - tabsHeight
                  $element.css({ "height": footer.height + "px", "-webkit-transform": "translate3d(0, " + footer.height + "px" + ", 0)", "transform": "translate3d(0, " + footer.height + "px" + ", 0)" })
               }

               function updateUI() {
                  $timeout(function () {
                     computeHeights()

                     if (footer.initialState == FooterState.MINIMIZED) {
                        minimize()
                     } else {
                        collapse()
                     }
                  }, 50)
               }

               function recomputeAllHeights() {
                  computeDefaultHeights()
                  footer.height = footer.maxHeight > 0 ? footer.maxHeight : $window.innerHeight - headerHeight - handleHeight - tabsHeight
               }

               function expand() {
                  recomputeAllHeights()
                  footer.lastPosY = 0
                  $element.css({ "height": footer.height + "px", "-webkit-transform": "translate3d(0, 0, 0)", "transform": "translate3d(0, 0, 0)" })
                  $element.css({ "transition": "300ms ease-in-out", "padding": 0 })
                  $scope.onExpand()
                  $scope.state = FooterState.EXPANDED
               }

               var setHeight = false
               function collapse() {
                  footer.lastPosY = footer.height - footer.defaultHeight

                  if (!setHeight) {
                     $element.css({ "height": footer.height + "px" })
                     setHeight = true
                  }
                  $element.css({ "-webkit-transform": "translate3d(0, " + footer.lastPosY + "px, 0)", "transform": "translate3d(0, " + footer.lastPosY + "px, 0)" })
                  $scope.onCollapse()
                  $scope.state = FooterState.COLLAPSED
               }

               function minimize() {
                  footer.lastPosY = footer.height

                  if (!setHeight) {
                     $element.css({ "height": footer.height + "px" })
                     setHeight = true
                  }
                  $element.css({ "-webkit-transform": "translate3d(0, " + footer.lastPosY + "px, 0)", "transform": "translate3d(0, " + footer.lastPosY + "px, 0)" })
                  $scope.onMinimize()
                  $scope.state = FooterState.MINIMIZED
               }

               function switche() {
                  if (!footer.switch) return
                  if (!setHeight) {
                     $element.css({ "height": footer.height + "px" })
                     setHeight = true
                  }

                  var offsetHeight = document.querySelector("div[ion-pull-up-content-title]").offsetHeight || 0
                  var offsetTop = document.querySelector("div[ion-pull-up-content-title]").offsetTop || 0
                  var height = footer.height - (offsetHeight + offsetTop) || 0
                  if (height < 0) {
                     height = 0
                  }

                  footer.lastPosY = (height > 30) ? height - 20 : height
                  $element.css({ "-webkit-transform": "translate3d(0, " + footer.lastPosY + "px, 0)", "transform": "translate3d(0, " + footer.lastPosY + "px, 0)" })
                  $scope.onSwitche()
                  $scope.state = FooterState.SWITCHED
               }

               this.setHandleHeight = function (height) {
                  handleHeight = height
                  computeHeights()
               }

               this.getHeight = function () {
                  return $element[0].offsetHeight
               }

               this.getBackground = function () {
                  return $window.getComputedStyle($element[0]).background
               }

               this.onTap = function (e) {
                  e.gesture.srcEvent.preventDefault()
                  e.gesture.preventDefault()

                  $timeout(function () {
                     if ($scope.state == FooterState.COLLAPSED) {
                        if (footer.defaultBehavior == FooterBehavior.HIDE) {
                           $scope.state = FooterState.MINIMIZED
                        }
                        else {
                           $scope.state = FooterState.EXPANDED
                        }
                     }
                     else if ($scope.state == FooterState.MINIMIZED) {
                        if (footer.defaultBehavior == FooterBehavior.HIDE) {
                           $scope.state = FooterState.COLLAPSED
                        }
                        else if (footer.defaultBehavior == FooterBehavior.SWITCH) {
                           $scope.state = FooterState.SWITCHED
                           footer.switch = true
                        }
                        else {
                           $scope.state = FooterState.EXPANDED
                        }
                     }
                     else if ($scope.state == FooterState.SWITCHED) {
                        if (footer.defaultBehavior == FooterBehavior.SWITCH) {
                           $scope.state = FooterState.MINIMIZED
                           footer.switch = true
                        }
                        else {
                           $scope.state = FooterState.EXPANDED
                        }
                     }
                     else {
                        // footer is expanded
                        $scope.state = footer.initialState == FooterState.MINIMIZED ? FooterState.MINIMIZED : FooterState.COLLAPSED
                     }
                  }, 0)
               }

               this.onDrag = function (e) {
                  e.gesture.srcEvent.preventDefault()
                  e.gesture.preventDefault()

                  switch (e.type) {
                     case "dragstart":
                        $element.css("transition", "none")
                        break
                     case "drag":
                        var dragY = Math.round(e.gesture.deltaY) + footer.lastPosY
                        if (dragY < 0) {
                           dragY = 0
                        }
                        else if (dragY > footer.height) {
                           dragY = footer.height
                        }
                        footer.posY = dragY

                        if (footer.height > footer.posY + (footer.defaultHeight * 2) && footer.switch) {
                           $rootScope.$broadcast("ionPullUp:tap")
                           footer.switch = false
                        }
                        else if (footer.height < footer.posY + (footer.defaultHeight * 2) && !footer.switch) {
                           $rootScope.$broadcast("ionPullUp:tap")
                           footer.switch = true
                        }

                        $element.css({ "-webkit-transform": "translate3d(0, " + footer.posY + "px, 0)", "transform": "translate3d(0, " + footer.posY + "px, 0)" })
                        break
                     case "dragend":
                        $element.css({ "transition": "300ms ease-in-out" })
                        footer.lastPosY = footer.posY

                        $timeout(function () {
                           var state_back = $scope.state
                           $scope.state = (footer.switch) ? FooterState.MINIMIZED : FooterState.SWITCHED

                           if (state_back == $scope.state) {
                              switch (state_back) {
                                 case FooterState.MINIMIZED:
                                    minimize()
                                    break
                                 case FooterState.SWITCHED:
                                    switche()
                                    break
                              }
                           }
                           else {
                              $rootScope.$broadcast("ionPullUp:tap")
                           }
                        }, 0)
                        break
                  }
               }

               $scope.state = $attrs.state.toUpperCase()
               var deregisterWatch = $scope.$watch("state", function (newState, oldState) {
                  if (newState == oldState) return

                  switch (newState) {
                     case FooterState.COLLAPSED:
                        collapse()
                        break
                     case FooterState.EXPANDED:
                        expand()
                        break
                     case FooterState.MINIMIZED:
                        minimize()
                        break
                     case FooterState.SWITCHED:
                        switche()
                        break
                  }

                  $rootScope.$broadcast("ionPullUp:tap")
               })

               $scope.$on("$destroy", deregisterWatch)

               init()

               ionic.Platform.ready(function () {
                  var orientation = window.orientation || 0 //當前螢幕翻轉方向

                  $(window).on("resize.ionPullUpFooter", (function () {
                     updateUI()

                     orientation = window.orientation || 0
                  }))

                  //離開頁面時銷毀事件呼叫
                  var stateChangeStart = $scope.$on("$stateChangeStart", function (event, data) {
                     console.log("ionPullUpFooter leave")

                     stateChangeStart()
                     $(window).off("resize.ionPullUpFooter")
                  })
               })
            }],
            "compile": function (element, attrs) {
               //attrs.defaultHeight && element.css('height', parseInt(attrs.defaultHeight, 10) + 'px');
               element.addClass("bar bar-footer")
            }
         }
      }])
      .directive("ionPullUpContent", [function () {
         return {
            "restrict": "AE",
            "require": "^ionPullUpFooter",
            "link": function (scope, element, attrs, controller) {
               //var footerHeight = controller.getHeight();
               var trigger = document.querySelector("ion-pull-up-trigger")
               var footerHeight = (trigger) ? trigger.offsetHeight : 10

               element.css({ "display": "block", "margin-top": footerHeight + "px", "width": "100%", "height": "100%" })
               // add scrolling if needed
               if (attrs.scroll && attrs.scroll.toUpperCase() == "TRUE") {
                  element.css({ "overflow-y": "scroll", "overflow-x": "hidden" })
               }
            }
         }
      }])
      .directive("ionPullUpBar", [function () {
         return {
            "restrict": "AE",
            "require": "^ionPullUpFooter",
            "link": function (scope, element, attrs, controller) {
               var footerHeight = controller.getHeight()
               element.css({ "display": "flex", "height": footerHeight + "px", "position": "absolute", "right": "0", "left": "0" })

            }
         }
      }])
      .directive("ionPullUpTrigger", ["$ionicGesture", function ($ionicGesture) {
         return {
            "restrict": "AE",
            "require": "^ionPullUpFooter",
            "link": function (scope, element, attrs, controller) {
               // add gesture
               $ionicGesture.on("tap", controller.onTap, element)
               $ionicGesture.on("drag dragstart dragend", controller.onDrag, element)
            }
         }
      }])
      .directive("ionPullUpHandle", ["$ionicGesture", "$ionicPlatform", "$timeout", "$window", function ($ionicGesture, $ionicPlatform, $timeout, $window) {
         return {
            "restrict": "AE",
            "require": "^ionPullUpFooter",
            "link": function (scope, element, attrs, controller) {
               var height = parseInt(attrs.height, 10) || 25, width = parseInt(attrs.width, 10) || 100,
                  toggleClasses = attrs.toggle

               controller.setHandleHeight(height)

               element.css({
                  "display": "block",
                  "background": "inherit",
                  "position": "absolute",
                  "top": 0 - height + "px",
                  "left": (($window.innerWidth - width) / 2) + "px",
                  "height": height + "px",
                  "width": width + "px",
                  "text-align": "center"
               })

               // add gesture
               $ionicGesture.on("tap", controller.onTap, element)
               $ionicGesture.on("drag dragstart dragend", controller.onDrag, element)

               scope.$on("ionPullUp:tap", function () {
                  element.find("i").toggleClass(toggleClasses)
               })

               function updateUI() {
                  $timeout(function () {
                     element.css("left", (($window.innerWidth - width) / 2) + "px")
                  }, 50)
               }

               ionic.Platform.ready(function () {
                  var orientation = window.orientation || 0 //當前螢幕翻轉方向

                  $(window).on("resize.ionPullUpHandle", (function () {
                     updateUI()

                     orientation = window.orientation || 0
                  }))

                  //離開頁面時銷毀事件呼叫
                  var stateChangeStart = scope.$on("$stateChangeStart", function (event, data) {
                     console.log("ionPullUpHandle leave")

                     stateChangeStart()
                     $(window).off("resize.ionPullUpHandle")
                  })
               })
            }
         }
      }])
})
