define(["API", "APIS", 'AppLang', 'views/app/fil_common/requisition.js', 'array', 'Directives', 'ReqTestData', 'ionic-popup', 'FileTransferService',
    'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService'
], function() {
    return ['$scope', '$state', '$timeout', '$filter', 'AppLang', 'APIService', 'APIBridge', '$q',
        '$ionicLoading', '$ionicPopup', '$ionicModal', '$ionicListDelegate', 'IonicPopupService', 'IonicClosePopupService', 'FileTransferService',
        'fil_common_requisition', 'ReqTestData', 'circulationCardService', 'commonFactory', 'commonService', 'userInfoService', 'scanTypeService', 'numericalAnalysisService',
        function($scope, $state, $timeout, $filter, AppLang, APIService, APIBridge, $q,
            $ionicLoading, $ionicPopup, $ionicModal, $ionicListDelegate, IonicPopupService, IonicClosePopupService, FileTransferService,
            fil_common_requisition, ReqTestData, circulationCardService, commonFactory, commonService, userInfoService, scanTypeService, numericalAnalysisService) {

            $scope.langs = AppLang.langs;

            $scope.uploadPhoto = function() {
                $scope.progress = 0;

                APIBridge.callAPI('choosePhoto', [{}]).then(function(result) {
                    if (result) {
                        console.log('choosePhoto success');
                        getFileDetail(result.data[0]);
                    } else {
                        console.log('choosePhoto false');
                    }
                }, function(result) {
                    console.log("choosePhoto fail");
                    console.log(result);
                });
            };

            var getFileDetail = function(photo) {
                APIBridge.callAPI('getFileDetail', [photo]).then(function(result) {
                    if (result) {
                        console.log('getFileDetail success');
                        console.log(result);
                        uploadFile(result.data[0]);
                    } else {
                        console.log('getFileDetail false');
                    }
                }, function(result) {
                    console.log("getFileDetail fail");
                    console.log(result);
                });
            };

            var uploadFile = function(detail) {
                console.log(detail);
                FileTransferService.uploadFile(detail, $q(function(resolve) {
                    $scope.cancelUpload = resolve;
                })).then(function(key) {
                    console.log(key);
                    FileTransferService.addAttachment('CTC-FQC-140600000001', [key]).then(function() {
                        $ionicPopup.alert({
                            title: '上傳圖檔',
                            template: '圖檔上傳成功!'
                        }).then(function() {
                            $scope.progress = 0;
                        });
                    });
                }, function(err) {
                    console.log(err);
                    if (angular.isObject(err)) {
                        userInfoService.getVoice('取消圖檔上傳!');
                    } else {
                        userInfoService.getVoice(err);
                    }

                    $scope.progress = 0;
                }, function(job) {
                    console.log(job);
                    $scope.progress = Math.round(job.uploaded * 100 / job.total);
                });
            };

        }
    ];
});
