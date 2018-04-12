define(["API", "APIS", 'views/app/fil_23/requisition.js', 'AppLang', 'ionic-popup', "circulationCardService", "Directives", "ReqTestData", "commonFactory", 'userInfoService'], function() {
    return ['$scope', '$state', '$stateParams', '$ionicLoading', 'AppLang', 'IonicPopupService', 'APIService', '$timeout',
        'APIBridge', "ReqTestData", "circulationCardService", "commonFactory", 'userInfoService', "$ionicPopup", "IonicClosePopupService", "fil_23_requisition", "$filter", "$ionicModal",
        function($scope, $state, $stateParams, $ionicLoading, AppLang, IonicPopupService, APIService, $timeout,
            APIBridge, ReqTestData, circulationCardService, commonFactory, userInfoService, $ionicPopup, IonicClosePopupService, fil_23_requisition, $filter, $ionicModal) {

            $scope.langs = AppLang.langs;

            var param = angular.copy($stateParams.param);
            $scope.wo = param.test_name;
            var seq = param.seq,
                qc_seq = param.qc_seq;
            console.log(param);
            $scope.selectedItems = angular.copy(fil_23_requisition.getReason(seq, qc_seq)) || [];

            $scope.items = [];
            $scope.searchStr = '%';
            $scope.data = {
                defect_qty: 1,
                abnormal_no: '',
                abnormal_name: ''
            };
            //search
            $scope.searchData = function() {
                var webTran = {
                    service: 'app.abnormal.get',
                    parameter: {
                        "abnormal_condition": $scope.searchStr
                    }
                };
                APIService.Web_Post(webTran, function(res) {
                    if (res.payload.std_data.parameter) {
                        console.log(res.payload.std_data.parameter);
                        $timeout(function() {
                            $scope.items = res.payload.std_data.parameter.abnormal;
                        }, 0);
                    }
                }, function(error) {
                    console.log(error);
                    userInfoService.getVoice(error.payload.std_data.execution.description, function() {});
                });
            };

            // add
            $scope.addInfo = function() {
                $scope.show_badReason_modal();
                $scope.searchData();
            };

            $scope.show_badReason_modal = function() {
                $ionicModal.fromTemplateUrl('views/app/common/html/abnormalQtyModal.html', {
                    scope: $scope
                }).then(function(modal) {
                    $scope.close = function() {
                        // reject();
                        modal.hide().then(function() {
                            return modal.remove();
                        });
                    };
                    modal.show();
                    return modal;
                });
            };
            // badReasonModal
            $scope.mins = function() {
                if ($scope.data.defect_qty > 0) {
                    $scope.data.defect_qty--;
                }
            };
            $scope.add = function() {
                if ($scope.data.defect_qty < $scope.bad_qty) {
                    $scope.data.defect_qty++;
                }
            };
            $scope.setBadReason = function(item) {
                $scope.data.abnormal_no = item.abnormal_no;
                // $scope.data.abnormal_name=item.abnormal_name;
            };
            $scope.setSelected = function() {
                $scope.selectedItems.push(angular.copy($scope.data));
                $scope.data.defect_qty = 1;
                console.log($scope.selectedItems);
                $scope.close();
            };

            // save
            $scope.saveInfo = function() {
                $state.go('fil3_10_s01');
                fil3_10_requisition.setBadData($scope.selectedItems);
            };
            // del
            $scope.delInfo = function($index) {
                $scope.selectedItems.splice($index, 1);
            };
            //dont move
        }
    ];
});
