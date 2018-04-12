define(["API", "APIS", 'AppLang', 'views/app/fil_24/requisition.js', 'array', 'Directives', 'ReqTestData', 'ionic-popup',
    'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService'
], function() {
    return ['$scope', '$state', '$stateParams', '$timeout', '$filter', 'AppLang', 'APIService', 'APIBridge',
        '$ionicLoading', '$ionicPopup', '$ionicModal', '$ionicListDelegate', 'IonicPopupService', 'IonicClosePopupService',
        'fil_24_requisition', 'ReqTestData', 'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService',
        function($scope, $state, $stateParams, $timeout, $filter, AppLang, APIService, APIBridge,
            $ionicLoading, $ionicPopup, $ionicModal, $ionicListDelegate, IonicPopupService, IonicClosePopupService,
            fil_24_requisition, ReqTestData, circulationCardService, commonFactory, commonService, userInfoService, scanTypeService, numericalAnalysisService) {

            $scope.langs = AppLang.langs;
            $scope.showFlag = true;
            // $scope.showFlag=false;
            $scope.data = fil_24_requisition.getInfocheck();
            // $scope.data = angular.copy($stateParams.item);
            $scope.qc_list = angular.copy($stateParams.qc_list) || [];
            //console.log("qc_list",$scope.qc_list);
            $scope.items = $scope.data.qc_list || [];
            //$scope.data.result_type=fil_23_requisition.getResult_type();
            // goReason
            $scope.goReason = function($index) {
                fil_24_requisition.setBad($scope.items[$index]);
                //console.log("不良原因$scope.items[$index]",$scope.items[$index]);
                $state.go('fil_24_s05', {
                    item: $scope.items[$index].test_name,
                });
            };

            // // goMeasured_value
            // $scope.goMeasured_value = function($index) {
            //     fil_23_requisition.setCeliang($scope.items[$index]);
            //     //console.log("测量值$scope.items[$index]",$scope.items[$index]);
            //     $state.go('fil_24_s06', {
            //         item: $scope.items[$index].test_name,
            //     });
            // };
            //check_ok_qty
            $scope.checkQty = function(flag) {
              switch (flag) {
                case "ok":
                   if ($scope.data.ok_qty < 0) {
                     userInfoService.getVoice("合格量不能小于0！", function() {});
                     $scope.data.ok_qty =0;
                   }
                   break;
                case "unqualified":
                  if ($scope.data.unqualified_qty < 0) {
                    userInfoService.getVoice("不合格量不能小于0！", function() {});
                    $scope.data.unqualified_qty = 0;
                  }
                  break;
                case "checkdestroy":
                  if ($scope.data.checkdestroy_qty < 0) {
                    userInfoService.getVoice("检验破坏量不能小于0！", function() {});
                    $scope.data.checkdestroy_qty = 0;
                  }
                  break;

              }

            };
            //check_test_qty
            $scope.check_test_qty = function(index) {

                //console.log("test_qty",$scope.items[index].test_qty);
                if ($scope.items[index].test_qty > $scope.data.receipt_qty) {
                    userInfoService.getVoice("抽验量不能大于送验量！", function() {});
                    $scope.items[index].test_qty = 0;
                } else if ($scope.items[index].test_qty < 0) {
                    userInfoService.getVoice("抽验量不能小于0！", function() {});
                    $scope.items[index].test_qty = 0;
                }
                fil_24_requisition.setTest_qty($scope.items[index].test_qty);
            };

            //允收，拒收，不良，抽检，合格加减逻辑
            $scope.check_test = function(index, flag) {
                var test_qty = fil_24_requisition.getTest_qty(); //获取ng-change的那一行抽验量
                console.log("test_qty", test_qty);
                if(flag == 1){    //允收
                  if ($scope.items[index].acceptable_qty > $scope.items[index].test_qty ) {
                      userInfoService.getVoice("允收数量不能大于抽验数量！", function() {});
                      $scope.items[index].acceptable_qty = 0;
                  } else if ($scope.items[index].acceptable_qty < 0) {
                      userInfoService.getVoice("允收数量不能小于0！", function() {});
                      $scope.items[index].acceptable_qty = 0;
                  }
                  if($scope.items[index].acceptable_qty>= $scope.items[index].return_qty ){
                    $scope.items[index].result_type = 'Y';
                  }else{
                    $scope.items[index].result_type = 'N';
                  }
                  for(var i=0 ; i<$scope.items.length;i++){
                    if($scope.items[i].result_type =='N'){
                        $scope.data.result_type = 'N';
                        return;
                    }
                  }
                }
                if(flag == 2){    //拒收
                  if ($scope.items[index].rejected_qty > $scope.items[index].test_qty ) {
                      userInfoService.getVoice("拒收数量不能大于抽验数量！", function() {});
                      $scope.items[index].rejected_qty = 0;
                  } else if ($scope.items[index].rejected_qty < 0) {
                      userInfoService.getVoice("拒收数量不能小于0！", function() {});
                      $scope.items[index].rejected_qty = 0;
                  }
                }
                if(flag == 3){    //不良
                  if ($scope.items[index].return_qty > $scope.items[index].test_qty ) {
                      userInfoService.getVoice("不良数量不能大于抽验数量！", function() {});
                      $scope.items[index].return_qty = 0;
                  } else if ($scope.items[index].return_qty < 0) {
                      userInfoService.getVoice("不良数量不能小于0！", function() {});
                      $scope.items[index].return_qty = 0;
                  }
                  if($scope.items[index].acceptable_qty>= $scope.items[index].return_qty ){
                    $scope.items[index].result_type = 'Y';

                  }else{
                    $scope.items[index].result_type = 'N';

                  }
                  for(var i=0 ; i<$scope.items.length;i++){
                    if($scope.items[i].result_type =='N'){
                        $scope.data.result_type = 'N';
                        return;
                    }
                  }
                }

            };


            //saveInfo
            $scope.saveInfo = function() {
              console.log("dataaaaa:");
              console.log($scope.data);
              for(var q=0 ; q<$scope.items.length;q++){
                if($scope.items[q].return_qty >0){
                    if($scope.data.unqualified_qty ==0){
                      userInfoService.getVoice("单身有不良原因，单头不合格数不允许为0！", function() {});
                      return;
                    }
                }
              };
              if($scope.data.receipt_qty != $scope.data.ok_qty + $scope.data.unqualified_qty + $scope.data.checkdestroy_qty){
                userInfoService.getVoice("合格量+不合格量+检验破坏量需等于送检量！", function() {});
                return;
              }
                $scope.mainData = fil_24_requisition.getMainData();
                fil_24_requisition.updData($scope.mainData,$scope.data);

          
                $state.go('fil_24_s01', {
                    // 'qc_list':$scope.items,
                    // 'attrib_list': $scope.info,
                });
            };
        }
    ];
});
