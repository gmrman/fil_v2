/***********************************************************************************************************************
* Descriptions...: 添加 IOS Picker
* Usage..........: 
* Return code....: 
* Modify.........: 201706707 By zhen
* Example........: 
* <multi-list-picker ng-model="model" attachment="{{var}}(定位點)" bind-html="{{bindHtml}}(label解析模式)" done="(關閉時運行)">
* <multi-list-picker-list alias="month(綁定的屬性)" cycle="true(是否循環)" strict-matching="true(計算每筆Item高度)">
***********************************************************************************************************************/
(function () {
   $("head").append("<link rel=\"stylesheet\" href=\"views/app/common/css/multi-list-picker.css\" type=\"text/css\" />")

   var templates = {
      "picker": "$/multi-list-picker/picker.html"
   }
   var module = angular.module("multi-list-picker", [])
   module.run(["$templateCache", function ($templateCache) {
      $templateCache.put(templates.picker,
         "<div class='multi-list-picker {{attachment}}'>\n" +
         "   <span ng-transclude class='multi-list-picker-contents'></span>\n" +
         "   <div class='before'></div>\n" +
         "   <div class='container'>\n" +
         "      <ul class='lists'>\n" +
         "         <li class='toolbar'>\n" +
         "            <a class='toolbar-button' ng-click='done({$model: model})'>Done</a>\n" +
         "         </li>\n" +
         "         <li class='before-lists' ng-init='first = false'></li>\n" +
         "         <li ng-repeat='list in items track by $index' \n" +
         "            class='list-container {{$index == 0 || first ? \"first\" : \"\"}} {{$index == items.length - 1 ? \"last\" : \"\"}}' \n" +
         "            data-index='{{$index}}' multi-list-motion \n" +
         "            data-motion-start-it='motionStart($event)' data-motion-change-it='motionChange($event)' data-motion-end-it='motionEnd($event)'>\n" +
         "            <span class='divider {{!list.value ? \"blank\" : \"\"}}' ng-if='list.$divider' ng-init='first = !list.value'>\n" +
         "            <span ng-if='!bindHtml' ng-bind='list.value'></span>\n" +
         "            <span ng-if='bindHtml' ng-bind-html='list.value'></span>\n" +
         "            </span>\n" +
         "            <ul class='list' ng-if='!list.$divider' data-selected='{{list.selected}}'>\n" +
         "               <li class='item {{item.index == list.selected ? \"selected\" : \"\"}} {{(!list.cycle && list.selected &lt; 3) ? \"offset-down-\" + (3 - list.selected) : \"\"}} {{(list.cycle ? item.cycleIndex : item.index) &lt; list.selected && (list.cycle ? item.cycleIndex : item.index) &gt;= list.selected - 3 ? \"distance-\" + (list.selected - (list.cycle ? item.cycleIndex : item.index)) : \"\"}} {{(list.cycle ? item.cycleIndex : item.index) &gt; list.selected && (list.cycle ? item.cycleIndex : item.index) &lt;= list.selected + 3 ? \"distance-\" + ((list.cycle ? item.cycleIndex : item.index) - list.selected) : \"\"}}'\n" +
         "               ng-repeat='item in list.view track by $index' data-index='{{item.index}}'\n" +
         "               ng-click='select(list, item.index)' style='width: {{list.width}}px;'>\n" +
         "               <span ng-if='item.$placeholder'></span>\n" +
         "               <span ng-if='!item.$placeholder && !bindHtml' ng-bind='item.label'></span>\n" +
         "               <span ng-if='!item.$placeholder && bindHtml' ng-bind-html='item.label'></span>\n" +
         "               </li>\n" +
         "            </ul>\n" +
         "         </li>\n" +
         "         <li class='after-lists'></li>\n" +
         "      </ul>\n" +
         "   </div>\n" +
         "   <div class='after'>\n" +
         "   </div>\n" +
         "</div>")
   }])
   module.directive("multiListPicker", ["$parse", "$timeout", function ($parse, $timeout) {
      var controller = function multiListPickerController($scope) {
         $scope.items = []
         this.addDivider = function (divider) {
            $scope.items.push({
               "$divider": true,
               "value": divider
            })
         }
         this.add = function (item) {
            if (!item.alias) {
               item.alias = $scope.items.length
            }
            item.index = $scope.items.length
            $scope.items.push(item)
            var sourceReader = function (value) {
               item.cached = value || []
               $scope.$broadcast("multiListPicker:changed", item)
            }
            if (item.static) {
               sourceReader(item.source())
            } else {
               //we need to set up this watch so that any external changes to this list are reflected immediately
               $scope.$watch(function () {
                  return item.source()
               }, sourceReader, true)
            }
         }

         //調整各資料寬度
         $timeout(function () {
            //$(".list-container").css("max-width", "calc(100% /3)")
            //$(".list-container").css("min-width", "calc(100% /3)")
         }, 0)
      }

      return {
         "restrict": "E",
         "replace": true,
         "templateUrl": templates.picker,
         "require": "?ngModel",
         "scope": {
            "done": "&?"
         },
         "transclude": true,
         "controller": ["$scope", controller],
         "link": function ($scope, $element, $attrs) {
            var parentScope = $element.parent().scope()
            var ngModel = $parse($attrs.ngModel)
            $scope.model = null
            $scope.$watch(function () {
               return ngModel(parentScope)
            }, function (model) {
               if (model) {
                  $scope.model = model
               } else {
                  $scope.model = {}
               }
               $scope.$broadcast("multiListPicker:changed", model)
            }, true)
            $scope.$watch("model", function (model) {
               $scope.$broadcast("multiListPicker:changed", model)
            }, true)
            $attrs.$observe("bindHtml", function (value) {
               $scope.bindHtml = (value == "true")
            })
            $attrs.$observe("attachment", function (value) {
               $scope.attachment = value || "inline"
            })
            var cachedLabels = {}
            $scope.$on("multiListPicker:changed", function () {
               //let's see if we can clean up the cache first
               angular.forEach(cachedLabels, function (cache, alias) {
                  var found = false
                  angular.forEach($scope.items, function (list) {
                     found = (found || list.alias == alias)
                  })
                  if (!found) {
                     delete cachedLabels[alias]
                  }
               })
               //we need to convert the values, so that the given items are all lists of {label,value}s.
               angular.forEach($scope.items, function (list) {
                  if (angular.isDefined(list.$divider)) {
                     return
                  }
                  if (!angular.isObject(cachedLabels[list.alias])) {
                     cachedLabels[list.alias] = {}
                  }
                  var source = angular.copy(list.cached)
                  var result
                  if (!angular.isArray(source)) {
                     result = []
                     if (angular.isObject(source)) {
                        angular.forEach(source, function (value, property) {
                           result.push({
                              "label": value,
                              "value": property
                           })
                        })
                        result.sort(function (first, second) {
                           return first.label < second.label ? -1 : 1
                        })
                     } else {
                        result.push({
                           "label": source,
                           "value": source
                        })
                     }
                  } else {
                     result = source
                  }
                  source = result
                  result = []
                  angular.forEach(source, function (item, index) {
                     item.index = index
                     if (angular.isObject(item) && angular.isDefined(item.label) && angular.isDefined(item.value)) {
                        result.push(item)
                     } else {
                        result.push({
                           "label": item,
                           "value": item
                        })
                     }
                     result[result.length - 1].label = String(result[result.length - 1].label)
                  })
                  var needsRefresh = false
                  var longest = 0
                  var longestText = ""
                  if (list.strictMatching) {
                     angular.forEach(result, function (item) {
                        if (needsRefresh || !angular.isDefined(cachedLabels[list.alias][item.label])) {
                           needsRefresh = true
                        }
                     })
                  } else {
                     angular.forEach(result, function (item) {
                        if (needsRefresh) {
                           return
                        }
                        var strippedLabel = item.label.replace(/<[^>]+>/g, "")
                        if (!angular.isDefined(cachedLabels[list.alias][item.label]) && cachedLabels[list.alias].$$longestText && cachedLabels[list.alias].$$longestText.length < strippedLabel.length) {
                           needsRefresh = true
                        }
                     })
                     if (!needsRefresh) {
                        cachedLabels[list.alias] = {}
                        angular.forEach(result, function (item) {
                           cachedLabels[list.alias][item.label] = true
                        })
                     }
                  }
                  if (needsRefresh) {
                     cachedLabels[list.alias] = {}
                     //let's figure out the length of the texts
                     angular.forEach(result, function (item) {
                        var label = item.label
                        cachedLabels[list.alias][label] = true
                        var strippedLabel = label.replace(/<[^>]+>/g, "")
                        if (strippedLabel.length > longestText.length) {
                           longestText = strippedLabel
                           var element = document.createElement("div")
                           element.innerHTML = label
                           element.className = "sandbox-item"
                           element.style.backgroundColor = "red"
                           $element.append(element)
                           longest = Math.max(element.offsetWidth, longest)
                           element.parentNode.removeChild(element)
                        }
                     })
                  } else {
                     longest = list.width
                  }
                  cachedLabels[list.alias].$$longestText = longestText
                  list.width = longest
                  list.array = result
                  list.selected = 0
               })
               if (angular.isObject($scope.model)) {
                  //first, let's see if the model has all the required properties
                  angular.forEach($scope.items, function (list) {
                     if (list.$divider) {
                        return
                     }
                     if (angular.isUndefined($scope.model[list.alias])) {
                        $scope.model[list.alias] = list.array.length ? list.array[0].value : null
                     }
                  })
                  //now, let's figure out which one is selected
                  angular.forEach($scope.items, function (list) {
                     if (list.$divider) {
                        return
                     }
                     list.selected = -1
                     angular.forEach(list.array, function (item, index) {
                        if (list.selected > -1) {
                           return
                        }
                        if (item.value == $scope.model[list.alias]) {
                           list.selected = index
                        }
                     })
                     if (list.selected == -1) {
                        //if the current selection is invalid, we will choose the first
                        $scope.model[list.alias] = list.array.length ? list.array[0].value : null
                        list.selected = 0
                     }

                     $scope.$broadcast("multiListPicker:selected", list)
                  })
               }
            })
            $scope.$on("multiListPicker:selected", function (event, list) {
               if (!angular.isArray(list.array)) {
                  return
               }
               list.view = []
               var from = Math.max(list.selected - 3, 0)
               var to = Math.min(list.array.length - 1, list.selected + 3)
               var i
               var item
               for (i = from; i <= to; i++) {
                  item = angular.copy(list.array[i])
                  item.index = i
                  list.view.push(item)
               }
               if (list.cycle) {
                  if (list.view.length < 7 && list.array.length > 0) {
                     var pivot = list.selected - from
                     var cursor
                     //we need to add stuff to the beginning of the list, until the selected index is in the middle
                     cursor = list.array.length - 1
                     while (pivot < 3) {
                        var copy = angular.copy(list.array[cursor])
                        if (!copy) {
                           console.log(cursor)
                        }
                        copy.index = cursor
                        list.view.splice(0, 0, copy)
                        cursor--
                        pivot++
                        if (cursor < 0) {
                           cursor = list.array.length - 1
                        }
                     }
                     //if after padding from the left, the view is still short of 7 items, we need to pad from the right
                     cursor = 0
                     while (list.view.length < 7) {
                        item = angular.copy(list.array[cursor])
                        item.index = cursor
                        list.view.push(item)
                        cursor++
                        if (cursor == list.array.length) {
                           cursor = 0
                        }
                     }
                  }
                  if (list.view.length > 0) {
                     var cycleIndex = list.view[3].index - 3
                     angular.forEach(list.view, function (item) {
                        item.cycleIndex = cycleIndex++
                     })
                  }
               }
            });
            (function () {
               var list
               var $list
               var next = function () {
                  list.selected++
                  if (list.selected == list.array.length) {
                     if (list.cycle) {
                        list.selected = 0
                     } else {
                        list.selected = list.array.length - 1
                     }
                  }
               }
               var previous = function () {
                  list.selected--
                  if (list.selected < 0) {
                     if (list.cycle) {
                        list.selected = list.array.length - 1
                     } else {
                        list.selected = 0
                     }
                  }
               }
               function setSelection(event) {
                  var direction = -1 * Math.sign(event.speedY)
                  if (direction < 0) {
                     previous()
                  } else {
                     next()
                  }
                  $scope.select(list, list.selected)
               }
               var listElement = function (e) {
                  var element = angular.element(e)
                  while (element.length && !element.hasClass("list-container")) {
                     element = element.parent()
                  }
                  return element
               }
               $scope.motionStart = function (event) {
                  $list = listElement(event.target)
                  var listIndex = $list.attr("data-index")
                  list = $scope.items[listIndex]
                  event.checkpoint()
               }

               $scope.motionChange = function (event) {
                  if (!$list) {
                     return
                  }
                  var element = $list[0]
                  if (!element) {
                     return
                  }
                  var last = event.last()
                  element = element.getElementsByTagName("li")[0]
                  if (!element) {
                     return
                  }
                  var threshold = element.offsetHeight
                  if (Math.abs(last.y - event.y) >= threshold) {
                     event.checkpoint()
                  } else {
                     return
                  }
                  setSelection(event)
               }
               $scope.motionEnd = function (event) {
                  if (!$list || !$list.length) {
                     return
                  }
                  event.slowDown(0.0001, Math.min(Math.floor(Math.abs(event.speedY) / 0.3), 8), function () {
                     setSelection(event)
                  })
               }
            })()
            $scope.select = function (list, index) {
               if (angular.isObject($scope.model)) {
                  $scope.model[list.alias] = list.array.length ? list.array[index].value : null
               }
               var previous = list.selected
               list.selected = index
               $scope.$broadcast("multiListPicker:selected", list)
               $scope.$emit("multiListPicker:selected", list, index, previous)
            }
         }
      }
   }])
   module.directive("multiListPickerList", [function () {
      var controller = function multiListPickerListController($scope) {
         $scope.items = []
         this.add = function (item) {
            $scope.items.push(item)
         }
      }
      return {
         "scope": {
            "source": "&?",
            "static": "@?",
            "alias": "@?",
            "cycle": "@?",
            "strictMatching": "@?"
         },
         "restrict": "E",
         "require": "^multiListPicker",
         "controller": ["$scope", controller],
         "link": function ($scope, $element, $attrs, parent) {
            parent.add({
               "source": function () {
                  return $scope.source ? $scope.source() : $scope.items
               },
               "alias": $scope.alias,
               "cycle": $scope.cycle == "true",
               "static": !$scope.source || $scope.static != "false",
               "strictMatching": $scope.strictMatching == "true"
            })
         }
      }
   }])
   module.directive("multiListPickerDivider", [function () {
      return {
         "restrict": "E",
         "require": "^multiListPicker",
         "link": function ($scope, $element, $attrs, parentController) {
            parentController.addDivider(($element.html() || "").trim())
         }
      }
   }])
   module.directive("multiListPickerListItem", [function () {
      return {
         "restrict": "E",
         "require": "^multiListPickerList",
         "link": function ($scope, $element, $attrs, parent) {
            parent.add({
               "value": $attrs.value || $attrs.label || $element.html(),
               "label": $attrs.label || $element.html()
            })
         }
      }
   }])
   module.service("multiListMomentum", ["$timeout", function ($timeout) {
      var details = function (event) {
         var description = {
            "event": event,
            "type": event.touches ? "Touch" : "Mouse",
            "x": event.touches ? event.touches[0].screenX : event.screenX,
            "y": event.touches ? event.touches[0].screenY : event.screenY,
            "target": event.touches ? event.touches[0].target : event.target,
            "timestamp": Date.now(),
            "xDisplacement": 0,
            "yDisplacement": 0,
            "speedX": 0,
            "speedY": 0,
            "speedXState": "stopped",
            "speedYState": "stopped",
            "accelerationX": 0,
            "accelerationY": 0,
            "speed": 0,
            "acceleration": 0,
            "angle": NaN,
            "origin": coordinates ? (coordinates.origin ? coordinates.origin : coordinates) : null,
            "remembered": coordinates ? (coordinates.remembered ? coordinates.remembered : null) : null
         }
         description.checkpoint = function () {
            description.remembered = description
         }
         description.last = function () {
            return description.remembered
         }
         description.slowDown = function (acceleration, steps, callback) {
            var accelerationX = -1 * Math.sign(description.speedX) * Math.abs(acceleration)
            var accelerationY = -1 * Math.sign(description.speedY) * Math.abs(acceleration)
            var xIntervals = Math.abs(description.speedX * 10 / accelerationX / steps)
            var yIntervals = Math.abs(description.speedY * 10 / accelerationY / steps)
            var intervals = Math.max(xIntervals, yIntervals) / 1000
            var step = 0;
            (function proceed(delay) {
               if (isNaN(delay)) {
                  return
               }
               $timeout(function () {
                  if (angular.isFunction(callback)) {
                     callback(step)
                  }
                  step++
                  if (step < steps) {
                     proceed(delay * 1.1)
                  }
               }, delay)
            })(intervals)
         }
         return description
      }
      var coordinates = null
      this.start = function (event, callback) {
         if (event.touches && event.touches.length > 1) {
            return
         }
         coordinates = details(event)
         if (angular.isFunction(callback)) {
            callback(coordinates)
         }
      }
      this.move = function (event, callback) {
         if (coordinates === null) {
            return
         }
         var newCoordinates = details(event)
         var timeDifference = newCoordinates.timestamp - coordinates.timestamp
         var xDifference = newCoordinates.x - coordinates.x
         var yDifference = newCoordinates.y - coordinates.y

         newCoordinates.xDisplacement = xDifference
         newCoordinates.yDisplacement = yDifference
         newCoordinates.angle = Math.atan2(newCoordinates.x, newCoordinates.y)
         if (timeDifference == 0) {
            if (xDifference == 0) {
               newCoordinates.speedX = 0
               newCoordinates.speedXState = "stopped"
            } else {
               newCoordinates.speedX = Math.sign(xDifference) * Infinity
               newCoordinates.speedXState = "fast"
            }
            if (yDifference == 0) {
               newCoordinates.speedY = 0
               newCoordinates.speedYState = "stopped"
            } else {
               newCoordinates.speedY = Math.sign(yDifference) * Infinity
               newCoordinates.speedYState = "fast"
            }
         } else {
            newCoordinates.speedX = xDifference / timeDifference
            newCoordinates.speedY = yDifference / timeDifference
            if (Math.abs(newCoordinates.speedX) < 0.2) {
               newCoordinates.speedXState = "slow"
            } else if (Math.abs(newCoordinates.speedX) < 0.6) {
               newCoordinates.speedXState = "moderate"
            } else {
               newCoordinates.speedXState = "fast"
            }
            if (Math.abs(newCoordinates.speedY) < 0.2) {
               newCoordinates.speedYState = "slow"
            } else if (Math.abs(newCoordinates.speedY) < 0.6) {
               newCoordinates.speedYState = "moderate"
            } else {
               newCoordinates.speedYState = "fast"
            }
         }
         var speedXDifference = newCoordinates.speedX - coordinates.speedX
         var speedYDifference = newCoordinates.speedY - coordinates.speedY
         if (timeDifference == 0) {
            if (speedXDifference == 0) {
               newCoordinates.accelerationX = 0
            } else {
               newCoordinates.accelerationX = Math.sign(speedXDifference) * Infinity
            }
            if (speedYDifference == 0) {
               newCoordinates.accelerationY = 0
            } else {
               newCoordinates.accelerationY = Math.sign(speedYDifference) * Infinity
            }
         } else {
            newCoordinates.accelerationX = speedXDifference / timeDifference
            newCoordinates.accelerationY = speedYDifference / timeDifference
         }
         newCoordinates.speed = Math.sqrt(Math.pow(newCoordinates.speedX, 2) + Math.pow(newCoordinates.speedY, 2))
         newCoordinates.acceleration = Math.sqrt(Math.pow(newCoordinates.accelerationX, 2) + Math.pow(newCoordinates.accelerationY, 2))
         coordinates = newCoordinates
         if (angular.isFunction(callback)) {
            callback(coordinates)
         }
      }
      this.end = function (event, callback) {
         if (coordinates === null) {
            return
         }
         if (angular.isFunction(callback)) {
            callback(coordinates)
         }
         coordinates = null
      }
   }])
   module.directive("multiListMotion", ["multiListMomentum", "$parse", function (multiListMomentum, $parse) {
      return {
         "restrict": "A",
         "link": function ($scope, $element, $attrs) {
            var move = $attrs.motionChangeIt && $parse($attrs.motionChangeIt)
            var end = $attrs.motionEndIt && $parse($attrs.motionEndIt)
            var start = $attrs.motionStartIt && $parse($attrs.motionStartIt)
            $element.on("mousedown touchstart", function (event) {
               multiListMomentum.start(event, function (event) {
                  $scope.$apply(function () {
                     start && start($scope, {
                        "$event": event
                     })
                  })
               })
            })
            $element.on("mousemove touchmove", function (event) {
               multiListMomentum.move(event, function (event) {
                  $scope.$apply(function () {
                     move && move($scope, {
                        "$event": event
                     })
                  })
               })
            })
            $element.on("mouseup touchend touchcancel", function (event) {
               multiListMomentum.end(event, function (event) {
                  $scope.$apply(function () {
                     end && end($scope, {
                        "$event": event
                     })
                  })
               })
            })
         }
      }
   }])
})()