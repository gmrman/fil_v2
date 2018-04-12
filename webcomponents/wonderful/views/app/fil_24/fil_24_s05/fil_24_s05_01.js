define(["API", "APIS", 'AppLang', 'views/app/fil_24/requisition.js', 'ionic-popup', "circulationCardService", "Directives", "ReqTestData", "commonFactory", 'userInfoService'], function() {
    return ['$scope', '$state', 'fil_24_requisition', '$ionicLoading', 'AppLang', 'IonicPopupService', 'APIService', '$timeout',
        'APIBridge', "ReqTestData", "circulationCardService", "commonFactory", 'userInfoService', "$ionicPopup", "IonicClosePopupService", "$filter", "$ionicModal",
        function($scope, $state, fil_24_requisition, $ionicLoading, AppLang, IonicPopupService, APIService, $timeout,
            APIBridge, ReqTestData, circulationCardService, commonFactory, userInfoService, $ionicPopup, IonicClosePopupService, $filter, $ionicModal) {

            $scope.langs = AppLang.langs;
            $scope.badreason = [];
            $scope.items = fil_24_requisition.getBad();
            $scope.wo = $scope.items.test_name;
            $scope.info = $scope.items.reason_list || [];
            $scope.addbadreason = function() {
                $ionicModal.fromTemplateUrl('views/app/fil_24/fil_24_s05/fil_24_s05_02_list.html', {
                    scope: $scope
                }).then(function(modal) {
                    $scope.close = function() {
                        modal.hide().then(function() {
                            $(".wrap_list").show();
                            return modal.remove();
                        });
                    };
                    modal.show();
                    $scope.showBadReason();
                });
            };

            function setData(value) {
                // $scope.data = value;
                $scope.badreason = value;
            }

            // $scope.scaninfo.focus_me = false;
            var webTran = {
                service: 'app.reason.code.get',
                parameter: {
                    "program_job_no":'16-1',
                    "status":'A',
                    "site_no":'HJ01',
                    "reason_code":''
                  //  "abnormal_condition": '%'
                }
            };
            $scope.showBadReason = function(){
                $scope.defect_qty = 0;
               $ionicLoading.show();
              APIService.Web_Post(webTran, function(res) {
                  if (res.payload.std_data.parameter) {
                      // $scope.showFlag=true;
                      $timeout(function() {
                           $ionicLoading.hide();
                          setData(res.payload.std_data.parameter.reason_list);
                          console.log("res.payload.std_data.parameter.reason_list");
                          console.log(res.payload.std_data.parameter.reason_list);
                      }, 0);
                  }

              }, function(error) {
                   $ionicLoading.hide();
                  userInfoService.getVoice('查询失败！', function() {});
              });
            }


            $scope.mins = function(type) {
                $scope.defect_qty--;
                if ($scope.defect_qty < 0) {
                    userInfoService.getVoice('不能小于0！！！', function() {});
                    $scope.defect_qty = 0;
                }
            };

            $scope.add = function(type) {
                if ($scope.defect_qty < $scope.items.return_qty) {
                    $scope.defect_qty++;
                } else {
                    userInfoService.getVoice('不能大于不良数量！！！', function() {});
                }
            };

            $scope.reason_no = '';
            $scope.reason_name = '';
            $scope.selstorage = function(i) {
                $scope.reason_no = i.reason_code;
                $scope.reason_name = i.reason_code_name;
            };

            $scope.saveInfo = function() {
              if(!$scope.reason_no){
                userInfoService.getVoice('不良原因不可为空！！！', function() {});
                return;
              }
              if($scope.defect_qty == 0){
                userInfoService.getVoice('不良数量不能为0！！！', function() {});
                return;
              }
              for(var x =0;x<$scope.info.length;x++){
                if($scope.info[x].defect_qty == 0){
                   $scope.info.splice(x, 1);
                }
              }
                $scope.info.push({
                    "reason_no": $scope.reason_no,
                    "reason_name":$scope.reason_name,
                    "defect_qty": $scope.defect_qty
                });
                $scope.close();
            };
            // saveInfo()
            $scope.saveBadInfo = function() {
                $scope.items.reason_list = $scope.info;
                fil_24_requisition.setBad($scope.items);
                $scope.mainData = fil_24_requisition.getMainData();
                fil_24_requisition.updData($scope.mainData,$scope.items);
                console.log("mainmian:");
                console.log(fil_24_requisition.getMainData());
                $state.go('fil_24_s02', {
                    'qc_list': $scope.items,
                    'reason_list': $scope.info,
                });
            };
            //左滑删除
            $scope.delInfo = function(index) {
                $scope.delGoods(index);
            };
            $scope.delGoods = function(index) {
                var temp = $scope.info.splice(index, 1);
            };


        }
    ];
});
