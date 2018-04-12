define(["API", "APIS", 'AppLang', 'views/app/fil_common/requisition.js', 'array', 'Directives', 'ReqTestData', 'ionic-popup',
    'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService'
], function() {
    return ['$scope', '$state', '$stateParams', '$timeout', '$filter', 'AppLang', 'APIService', 'APIBridge',
        '$ionicLoading', '$ionicPopup', '$ionicModal', '$ionicListDelegate', 'IonicPopupService', 'IonicClosePopupService',
        'fil_common_requisition', 'ReqTestData', 'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService',
        function($scope, $state, $stateParams, $timeout, $filter, AppLang, APIService, APIBridge,
            $ionicLoading, $ionicPopup, $ionicModal, $ionicListDelegate, IonicPopupService, IonicClosePopupService,
            fil_common_requisition, ReqTestData, circulationCardService, commonFactory, commonService, userInfoService, scanTypeService, numericalAnalysisService) {

            //取得部門資訊
            var departmentGet = function() {
                $ionicLoading.show();
                if (commonService.Platform == "Chrome") {
                    $ionicLoading.hide();
                    return;
                }
                APIBridge.callAPI('department_get', [{}]).then(function(result) {
                    $ionicLoading.hide();
                    console.log('department_get success');
                    $scope.detail = result.data || [];
                }, function(error) {
                    $ionicLoading.hide();
                    userInfoService.getVoice("department_get fail:" + error.message, function() {
                        $scope.setFocusMe(true);
                    });
                });
            };
            departmentGet();

            //刪除部門
            $scope.departmentDelete = function(item) {
                //收合操作列
                $ionicListDelegate.closeOptionButtons();
                $ionicLoading.show();
                APIBridge.callAPI('department_delete', [item]).then(function(result) {
                    $ionicLoading.hide();
                    console.log('department_delete success');
                    departmentGet();
                }, function(error) {
                    $ionicLoading.hide();
                    userInfoService.getVoice("department_delete fail:" + error.message, function() {
                        $scope.setFocusMe(true);
                    });
                });
            };
        }
    ];
});
