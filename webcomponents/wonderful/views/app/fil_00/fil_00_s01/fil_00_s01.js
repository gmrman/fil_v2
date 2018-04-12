define(["API", "APIS", "Widget", "md5", "config", "AppLang", "ionic-popup", "ReqTestData", "Directives", "userInfoService", "commonService"], function() {
    return ['$scope', '$state', '$ionicLoading', 'APIBridge', "AppLang", 'APIService', '$filter',
        '$timeout', 'configUrl', 'ReqTestData', 'IonicPopupService', 'userInfoService', 'commonService',
        function($scope, $state, $ionicLoading, APIBridge, AppLang, APIService, $filter,
            $timeout, configUrl, ReqTestData, IonicPopupService, userInfoService, commonService) {


            $scope.langs = AppLang.langs;
            $scope.userInfo = {};

            //修改APP標題
            userInfoService.setAppInfo({
                app_name: $scope.langs.app_name,
                app_version: "3.1.034"
            });
            userInfoService.changeTitle(1);

            //網頁版-串接 ERP 接口 預設值
            if (commonService.Platform == "Chrome") {
                var obj = {
                    server_ip: "10.40.40.18",
                    server_area: "t10dev",
                    server_product: "T100",
                    permission_ip: "999",
                };
                $scope.userInfo = userInfoService.setServer(obj);
                configUrl.setUrl();
            }

            var webInfo = {};
            $scope.entInfo = {};
            $scope.logInfo = {};
            $scope.userData = {
                account: '',
                password: '',
                enterprise: '',
                site: ''
            };

            $scope.$on('$viewContentLoaded', function() {
                $scope.getBasicConfig();
            });

            //取得 SharedPreferences 中儲存的參數
            $scope.getBasicConfig = function() {
                APIBridge.callAPI('getConfig', []).then(function(result) {
                    //如果 SharedPreferences 有值，以 SharedPreferences 內的值帶入變數，為空的話抓取SQLITE內的值
                    if (result.data.length) {
                        setUserInfo(result.data, 1);
                    } else {
                        basicinformationGet();
                    }
                }, function(result) {
                    basicinformationGet();
                });
            };

            //由SQLITE 抓取參數
            var basicinformationGet = function() {
                if (commonService.Platform == "Chrome") {
                    return;
                }
                $ionicLoading.show();
                APIBridge.callAPI('basicinformation_get', [{}]).then(function(result) {
                    console.log(result);
                    $ionicLoading.hide();
                    setUserInfo(result.data[0], 2);
                }, function(error) {
                    $ionicLoading.hide();
                    userInfoService.getVoice('basicinformation_get fail', function() {});
                    console.log(error);
                });
            };

            //將資料帶入變數後，判斷是否有設定ERP接口URL，以及是否為自動登入
            var setUserInfo = function(data, type) {
                //type：1 由 SharedPreferences 取值， 2 由SQLITE 取值
                if (type == 1) {
                    $scope.userInfo = userInfoService.setUserInfoByConf(data);
                } else {
                    $scope.userInfo = userInfoService.setUserInfo(data);
                }
                console.log($scope.userInfo);

                //串接ERP接口 URL - 若無值跳轉後台設定頁面
                var url = configUrl.setUrl();
                var permission_ip = $scope.userInfo.permission_ip;
                console.log(url);
                console.log(permission_ip);
                if (commonService.isNull(url) || commonService.isNull(permission_ip)) {
                    $state.go("fil_00_s02", {
                        data: 'Login'
                    });
                    return;
                }

                //設定APP語系
                console.log($scope.userInfo.language);
                AppLang.changeLangs($scope.userInfo.language);

                //設定 Timeout 秒數
                APIService.basic_data_download = angular.copy($scope.userInfo.basic_data_download);
                APIService.inventory_operation = angular.copy($scope.userInfo.inventory_operation);
                APIService.out_in_operation = angular.copy($scope.userInfo.out_in_operation);

                //若不為測試帳號，則檢查是否自動登入
                if ($scope.userInfo.account != "dsc" &&
                    $scope.userInfo.account != "digiwin" &&
                    $scope.userInfo.account != "root") {
                    if ($scope.userInfo.account && $scope.userInfo.log_in == 'Y') {
                        updateInfo('autoLogIn');
                    }
                }
            };

            var updateInfo = function(password) {
                if (password != 'autoLogIn') {
                    $scope.userInfo = userInfoService.setAccount($scope.userData);
                }

                //檢查是否為體驗帳號
                ReqTestData.setAccount($scope.userData.account);
                if (ReqTestData.testData) {
                    var userInfo = ReqTestData.getUserInfo(
                        $scope.userData.account, $scope.userInfo.server_ip, $scope.userInfo.server_area,
                        $scope.userInfo.server_product, $scope.userInfo.permission_ip, $scope.userData.site_no
                    );
                    setUserInfo(userInfo);
                }

                //取得上次登入日期
                //  T100 ent 不同時清空上日登入日期
                //非T100 site不同時清空上次登入日期
                //TT 清空上次登入日期
                //如有使用權限平台，清空上次登入日期，並將密碼以 autoLogIn 帶入
                console.log($scope.userInfo);
                var l_datetime = $scope.userInfo.report_datetime || "";
                if ($scope.userInfo.report_ent != $scope.userInfo.enterprise_no) {
                    l_datetime = "";
                }
                if (userInfoService.userInfo.server_product != 'T100') {
                    if (userInfoService.userInfo.report_site != $scope.userInfo.site_no) {
                        l_datetime = "";
                    }
                }
                if (userInfoService.userInfo.gp_flag) {
                    l_datetime = "";
                }

                var webTran = {
                    service: 'user.storage.infomation.get',
                    parameter: {
                        "hashkey": password,
                        "report_datetime": l_datetime,
                        "site_no": $scope.userData.site,
                        "return_type": 1
                    }
                };
                //顯示 "基礎資料下載中" loading畫面
                $ionicLoading.show({
                    template: '<ion-spinner icon="ios"></ion-spinner><p>' + $scope.langs.basic_data_download + '...</p>'
                });
                APIService.Web_Post(webTran, function(res) {
                    $ionicLoading.hide();
                    // console.log("success:" + angular.toJson(res));
                    console.log(res);
                    var user_infomation = res.payload.std_data.parameter.user_infomation;
                    var stock_infomation = res.payload.std_data.parameter.stock_infomation;
                    if (password != 'autoLogIn' && user_infomation.length <= 0) {
                        errorpop($scope.langs.not + $scope.langs.user + $scope.langs.information);
                        return;
                    } else {
                        information_upd(stock_infomation, user_infomation, password);
                    }
                }, function(error) {
                    $ionicLoading.hide();
                    errorpop(error.payload.std_data.execution.description);
                    console.log("error:" + error);
                });
            };

            //INSERT庫位儲位
            var information_upd = function(stock_infomation, user_infomation, password) {
                userInfoService.setByWsUserInfomation(user_infomation[0]);
                $scope.userInfo = userInfoService.getUserInfo();
                console.log(userInfoService.userInfo);

                //設定APP語系
                AppLang.changeLangs($scope.userInfo.language);

                if (commonService.Platform == "Chrome") {
                    $ionicLoading.hide();
                    getWarehouse();
                    return;
                }
                $ionicLoading.show();
                APIBridge.callAPI('basicinformation_upd', [userInfoService.userInfo]).then(function(result) {
                    if (result) {
                        console.log('basicinformation_upd success');
                        $ionicLoading.hide();
                        stockinformationUpdate(stock_infomation);
                    } else {
                        $ionicLoading.hide();
                        userInfoService.getVoice('basicinformation_upd error', function() {});
                    }
                }, function(result) {
                    $ionicLoading.hide();
                    userInfoService.getVoice('basicinformation_upd fail', function() {});
                    console.log(result);
                });
            };

            //INSERT庫位儲位
            var stockinformationUpdate = function(stock_infomation) {
                $ionicLoading.show();
                APIBridge.callAPI('stockinformation_upd', stock_infomation).then(function(result) {
                    $ionicLoading.hide();
                    if (result) {
                        getWarehouse();
                    } else {
                        userInfoService.getVoice('stockinformation_upd error', function() {});
                        console.log(result);
                    }
                }, function(error) {
                    $ionicLoading.hide();
                    userInfoService.getVoice('stockinformation_upd fail', function() {});
                    console.log(error);
                });
            };

            //取得倉庫array
            var getWarehouse = function() {
                if (commonService.Platform == "Chrome") {
                    var warehouse = ReqTestData.getWarehouseGroup();
                    userInfoService.setWarehouse(warehouse);
                    getStorageSpaces();
                    return;
                }
                $ionicLoading.show();
                APIBridge.callAPI('warehouse_get').then(function(result) {
                    $ionicLoading.hide();
                    if (result) {
                        console.log('warehouse_get success');
                        $timeout(function() {
                            userInfoService.setWarehouse(result.data);
                            getStorageSpaces();
                        }, 0);
                    } else {
                        userInfoService.getVoice('warehouse_get error', function() {});
                    }
                }, function(error) {
                    $ionicLoading.hide();
                    userInfoService.getVoice('warehouse_get fail', function() {});
                    console.log(error);
                });
            };

            //取得儲位
            var getStorageSpaces = function() {
                var sel_in_storage = [];
                if (commonService.Platform == "Chrome") {
                    sel_in_storage = ReqTestData.getStorageSpacesGroup();
                    userInfoService.setStorageSpaces(sel_in_storage);
                    $state.go("fil_00_s04");
                    return;
                }
                $ionicLoading.show();
                APIBridge.callAPI('storage_spaces_get', [{}]).then(function(result) {
                    $ionicLoading.hide();
                    if (result) {
                        console.log('storage_spaces_get success');
                        userInfoService.setStorageSpaces(result.data);
                    } else {
                        userInfoService.getVoice('storage_spaces_get error', function() {});
                        userInfoService.setStorageSpaces(sel_in_storage);
                    }
                    userInfoService.setBasicConfig(userInfoService.getUserInfo());
                    $state.go("fil_00_s04");
                }, function(error) {
                    $ionicLoading.hide();
                    IonicPopupService.errorAlert('storage_spaces_get fail');
                    console.log(error);
                });
            };

            //密碼加密
            // E10:明碼
            // 其他：MD5
            var encryption = function() {
                if (userInfoService.userInfo.server_product == 'E10') {
                    password_md5 = $scope.userData.password;
                } else {
                    password_md5 = hex_md5($scope.userData.password + 28682266);
                }
                updateInfo(password_md5);
            };

            //權限主機檢查帳密及取得 token
            var identitylogin = function() {
                var webTran = {
                    auth: true,
                    url: '/api/v1/iam/identity/login',
                    parameter: {
                        "userId": $scope.userData.account,
                        "password": $scope.userData.password,
                        "identityType": "token"
                    }
                };
                //顯示 "檢查權限中" loading畫面
                $ionicLoading.show({
                    template: '<ion-spinner icon="ios"></ion-spinner><p>' + $scope.langs.check_permission + '...</p>'
                });
                APIService.Web_Post(webTran, function(res) {
                    console.log(res);
                    $ionicLoading.hide();
                    encryption();
                }, function(error) {
                    $ionicLoading.hide();
                    console.log(error);
                    if (commonService.isNull(error.message)) {
                        userInfoService.getVoice($scope.langs.permission_connection_error, function() {});
                    } else {
                        userInfoService.getVoice(error.message, function() {});
                    }
                });
            };

            $scope.login = function() {
                if ($scope.validate() === false) {
                    errorpop($scope.langs.account_or_password_not_null);
                    return;
                }
                $scope.userInfo = userInfoService.getUserInfo();
                encryption();
            };

            //檢查帳號密碼使否有空值
            $scope.validate = function() {
                var validateResult = true;
                if (commonService.isNull($scope.userData.account)) validateResult = false;
                if (commonService.isNull($scope.userData.password)) validateResult = false;
                return validateResult;
            };

            $scope.afterEnterprise = function() {
                $scope.logInfo = webInfo.filter(filterByEnterprise);
                $scope.userData.site = $scope.logInfo[0].site_no;
            };

            function filterByEnterprise(obj) {
                if (obj.enterprise_no == $scope.userData.enterprise) {
                    return true;
                } else {
                    return false;
                }
            }

            var conditiontInfo = function() {
                var output = [],
                    keys = [];

                for (var i = 0; i < webInfo.length; i++) {
                    var key = webInfo[i].enterprise_no;

                    if (!webInfo[i].enterprise_no || !webInfo[i].site_no) {
                        continue;
                    }

                    if (!webInfo[i].enterprise_lang) {
                        webInfo[i].enterprise_lang = webInfo[i].enterprise_no;
                    } else {
                        webInfo[i].enterprise_lang = webInfo[i].enterprise_lang + '(' + webInfo[i].enterprise_no + ')';
                    }

                    if (!webInfo[i].site_lang) {
                        webInfo[i].site_lang = webInfo[i].site_no;
                    } else {
                        webInfo[i].site_lang = webInfo[i].site_lang + '(' + webInfo[i].site_no + ')';
                    }

                    if (keys.indexOf(key) === -1) {
                        keys.push(key);
                        output.push(webInfo[i]);
                    }

                }
                return output;
            };

            $scope.afterAccount = function() {
                if (!$scope.userData.account) {
                    return;
                }

                //輸入帳號後 清空其餘欄位值
                $scope.userData.password = "";
                $scope.userData.enterprise = "";
                $scope.userData.site = "";

                ReqTestData.setAccount($scope.userData.account);
                userInfoService.userInfo.account = $scope.userData.account;
                userInfoService.userInfo.enterprise_no = 'ENT';
                userInfoService.userInfo.site_no = 'SITE';
                var webTran = {
                    service: 'log.infomation.get',
                    parameter: {
                        "account": $scope.userData.account
                    }
                };
                $ionicLoading.show();
                APIService.Web_Post(webTran, function(res) {
                    // console.log("success:" + angular.toJson(res));
                    console.log(res);
                    var parameter = res.payload.std_data.parameter;
                    webInfo = parameter.enterprise_site;

                    //設定 Timeout 秒數
                    var basic_data_download = parameter.basic_data_download || 900;
                    var inventory_operation = parameter.inventory_operation || 1800;
                    var out_in_operation = parameter.out_in_operation || 30;

                    if (!commonService.isNull(basic_data_download)) {
                        $scope.userInfo.basic_data_download = basic_data_download;
                    }
                    if (!commonService.isNull(inventory_operation)) {
                        $scope.userInfo.inventory_operation = inventory_operation;
                    }
                    if (!commonService.isNull(out_in_operation)) {
                        $scope.userInfo.out_in_operation = out_in_operation;
                    }

                    $scope.userInfo = userInfoService.setUserInfo($scope.userInfo);
                    userInfoService.setBasicConfig($scope.userInfo);

                    $ionicLoading.hide();
                    $timeout(function() {
                        if (webInfo.length > 0) {
                            $scope.entInfo = conditiontInfo();
                            $scope.userData.enterprise = $scope.entInfo[0].enterprise_no;
                            $scope.logInfo = webInfo.filter(filterByEnterprise);
                            $scope.userData.site = $scope.logInfo[0].site_no;
                        }
                    }, 0);
                }, function(error) {
                    $ionicLoading.hide();
                    errorpop(error.payload.std_data.execution.description);
                    console.log(error);
                });
            };

            var basicinformationUpdate = function() {
                $ionicLoading.show();
                APIBridge.callAPI('basicinformation_upd', [userInfoService.userInfo]).then(function(result) {
                    $ionicLoading.hide();
                    var d = result.data[0];
                    if (d.data) {
                        console.log('basicinformation_upd success');
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
        }
    ];
});