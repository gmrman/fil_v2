define(["API", "APIS", "AppLang", "views/app/fil_00/fil_00_s04/requisition.js", "commonService"], function() {
    return ['$scope', '$state', '$ionicLoading', 'AppLang', 'APIService', '$timeout', 'APIBridge',
        'fil_00_s04_requisition', 'commonService', 'userInfoService',
        function($scope, $state, $ionicLoading, AppLang, APIService, $timeout, APIBridge,
            fil_00_s04_requisition, commonService, userInfoService) {

            $scope.langs = AppLang.langs;
            $scope.title = $scope.langs.set + $scope.langs.common;

            var menuFuns = [{
                name: $scope.langs.purchase + $scope.langs.management, //採購管理
                info: fil_00_s04_requisition.purchase
            }, {
                name: $scope.langs.sale + $scope.langs.management, //銷售管理
                info: fil_00_s04_requisition.sales
            }, {
                name: $scope.langs.produce + $scope.langs.management, //生產管理
                info: fil_00_s04_requisition.produce
            }, {
                name: $scope.langs.stock + $scope.langs.management, //庫存管理
                info: fil_00_s04_requisition.stock
            }];

            var setCommon = function(data) {
                angular.forEach(data, function(d) {
                    angular.forEach(menuFuns, function(menuFun) {
                        var index = menuFun.info.findIndex(function(item) {
                            return d.func == item.func;
                        });
                        if (index !== -1) {
                            if (d.iscommon == "Y") {
                                menuFun.info[index].iscommon = true;
                            } else {
                                menuFun.info[index].iscommon = false;
                            }
                        }

                    });

                });
                $timeout(function() {
                    $scope.menuList = menuFuns;
                }, 0);
            };

            var menuinformationGet = function() {
                $ionicLoading.show();
                APIBridge.callAPI('menuinformation_get', []).then(function(result) {
                    $ionicLoading.hide();
                    if (result) {
                        console.log('menuinformation_get success');
                        var data = result.data;
                        setCommon(data);
                    } else {
                        errorpop('menuinformation_get error');
                        console.log(result);
                    }
                }, function(result) {
                    $ionicLoading.hide();
                    errorpop('menuinformation_get fail');
                    console.log(result);
                });
            };

            //获取常用menu参数配置信息
            var getMenuConfig = function() {
                var data = angular.copy(userInfoService.userInfo.menu) || [];
                if (data.length > 0) {
                    setCommon(data);
                } else {
                    menuinformationGet();
                }
            };

            var setMenuConfig = function(temp) {
                userInfoService.userInfo.menu = temp;
                userInfoService.setBasicConfig(userInfoService.userInfo);
            };

            //網頁版測試資料
            if (commonService.Platform == "Chrome") {
                var data = "[{\"func\":\"fil101\",\"iscommon\":\"Y\"},{\"func\":\"fil102\",\"iscommon\":\"Y\"},{\"func\":\"fil203\",\"iscommon\":\"Y\"},{\"func\":\"fil403\",\"iscommon\":\"Y\"},{\"func\":\"fil213\",\"iscommon\":\"Y\"},{\"func\":\"fil301\",\"iscommon\":\"Y\"}]";
                data = JSON.parse(data);
                setCommon(data);
            } else {
                //从配置中取菜单信息
                getMenuConfig();
            }

            $scope.submit = function() {
                var temp = [];
                commonService.slectIndex = 0;
                angular.forEach($scope.menuList, function(menuList) {
                    angular.forEach(menuList.info, function(menuFun) {
                        if (menuFun.iscommon === true) {
                            temp.push({
                                func: menuFun.func
                            });
                        }
                    });
                });

                $ionicLoading.show();
                APIBridge.callAPI('menuinformation_upd', temp).then(function(result) {
                    $ionicLoading.hide();
                    popup("設定成功！！");
                    console.log('menuinformation_upd success');
                    angular.forEach(temp, function(value, index) {
                        value.iscommon = "Y";
                    });
                    $timeout(function() {
                        setMenuConfig(temp);
                    }, 0);
                    $state.go("fil_00_s04");
                }, function(result) {
                    $ionicLoading.hide();
                    errorpop('menuinformation_upd fail');
                    console.log(result);

                });
            };

        }
    ];
});
