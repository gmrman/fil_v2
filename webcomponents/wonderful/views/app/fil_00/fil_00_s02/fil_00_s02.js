define(["API", "APIS", 'AppLang', 'config', 'userInfoService'], function() {
    return ['$scope', '$state', '$ionicLoading', '$stateParams',
        'AppLang', 'APIBridge', 'APIService', 'configUrl', 'userInfoService', 'commonService',
        function($scope, $state, $ionicLoading, $stateParams,
            AppLang, APIBridge, APIService, configUrl, userInfoService, commonService) {

            $scope.langs = AppLang.langs;
            $scope.basicInf = userInfoService.getUserInfo();

            $scope.server_product_array = [{
                key: "T100",
                value: "T100"
            }, {
                key: "WF",
                value: "WF"
            }, {
                key: "EF",
                value: "易飞"
            }, {
                key: "E10",
                value: "E10"
            }, {
                key: "TOPGPST",
                value: "標準TOPGP"
            }, {
                key: "TOPGP51",
                value: "TOPGP51"
            }, {
                key: "TOPGP525",
                value: "TOPGP525"
            }, {
                key: "TOPGP53",
                value: "TOPGP53"
            }];

            $scope.update = function() {

                if (commonService.isNull($scope.basicInf.server_product)) {
                    userInfoService.getVoice($scope.langs.please + $scope.langs.set + $scope.langs.server_product, function() {});
                    return;
                }

                if (commonService.isNull($scope.basicInf.server_ip)) {
                    userInfoService.getVoice($scope.langs.please + $scope.langs.set + "IP", function() {});
                    return;
                }

                if (commonService.isNull($scope.basicInf.permission_ip)) {
                    userInfoService.getVoice($scope.langs.please + $scope.langs.set + $scope.langs.permission_ip, function() {});
                    return;
                }

                var info = userInfoService.setServer($scope.basicInf);
                configUrl.setUrl();
                AppLang.changeLangs(info.language);
                userInfoService.setBasicConfig(info);
                basicinformationUpdate(info);
            };

            var basicinformationUpdate = function(info) {
                if (commonService.Platform == "Chrome") {
                    goPage();
                    return;
                }
                $ionicLoading.show();
                APIBridge.callAPI('basicinformation_upd', [info]).then(function(result) {
                    $ionicLoading.hide();
                    var d = result.data[0];
                    if (d.data) {
                        console.log('basicinformation_upd success');
                        goPage();
                    } else {
                        errorpop(d.message);
                        console.log('basicinformation_upd false');
                    }
                }, function(result) {
                    $ionicLoading.hide();
                    errorpop('basicinformation_upd fail');
                    console.log(result);
                });
            };

            var goPage = function() {
                $state.go('fil_00_s01', {}, {
                    reload: true
                });
            };

        }
    ];
});