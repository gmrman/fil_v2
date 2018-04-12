app.controller("barCtrl_03", ["$scope", "$timeout", "AppLang", function ($scope, $timeout, AppLang) {
   $scope.langs = AppLang.langs

   $scope.$on("changeData", function (evt, dataList, showme) {
      if (showme[2]) {
         //無法取得資料時，不顯示圖表
         var data = dataList["barCtrl_03"].data
         var labels = $scope.getDateLabel("year", dataList["barCtrl_03"].label)

         $scope.data = data
         if (!$scope.data) {
            showme[2] = false
            return
         }

         $scope.labels = labels

         $scope.options = {
            "scales": {
               "xAxes": [
                  {
                     "ticks": {
                        "fontSize": 11,
                        "fontFamily": "Arial"
                     }
                  }
               ],
               "yAxes": [
                  {
                     "id": "y-axis-1",   //多個軸時，需要設定id才能與資料集綁定
                     "type": "linear",
                     "display": true,
                     "position": "left",
                     "ticks": {
                        "fontSize": 11,
                        "fontFamily": "Arial"
                     }
                  },
                  {
                     "id": "y-axis-2",
                     "type": "linear",
                     "display": true,
                     "position": "right",
                     "ticks": {
                        "fontSize": 11,
                        "fontFamily": "Arial"
                     }
                  }
               ]
            }
         }

         //額外資料
         $scope.datasetOverride = [
            {
               "label": $scope.langs.estimated_amount,
               "type": "line",
               "yAxisID": "y-axis-2",
               "backgroundColor": [
                  "rgba(0, 0, 0, 0)"
               ],
               "hitRadius": 8,
               "borderColor": "#FFCD00",
               "pointHoverBackgroundColor": "#FFCD00",
               "pointHoverBorderColor": "#FFCD00",
               "pointBackgroundColor": "#FFCD00",
               "pointBorderColor": "#FFCD00"
            },
            {
               "label": $scope.langs.actual_amount,
               "type": "line",
               "yAxisID": "y-axis-2",
               "backgroundColor": [
                  "rgba(0, 0, 0, 0)"
               ],
               "hitRadius": 8,
               "borderColor": "#FF2851",
               "pointHoverBackgroundColor": "#FF2851",
               "pointHoverBorderColor": "#FF2851",
               "pointBackgroundColor": "#FF2851",
               "pointBorderColor": "#FF2851"
            },
            {
               "label": $scope.langs.predict_project,
               "type": "bar",    //資料顯示類型
               "yAxisID": "y-axis-1",
               "backgroundColor": "#44DB5E",
               "borderColor": "#44DB5E"
            },
            {
               "label": $scope.langs.actual_project,
               "type": "bar",    //資料顯示類型
               "yAxisID": "y-axis-1",
               "backgroundColor": "#0076FF",
               "borderColor": "#0076FF"
            }
         ]
      }
   })
}])
