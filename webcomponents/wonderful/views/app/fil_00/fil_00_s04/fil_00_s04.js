define(["API", "APIS", "AppLang", "views/app/fil_00/fil_00_s04/requisition.js", "ionic-popup", "array", "ReqTestData", 'commonFactory'], function() {
    return ['$rootScope', '$scope', 'ReqTestData', 'APIBridge', 'APIService', '$state', 'AppLang', 'commonFactory', 'commonService', 'userInfoService',
        '$ionicLoading', '$ionicScrollDelegate', '$ionicModal', '$timeout', 'fil_00_s04_requisition', '$ionicSlideBoxDelegate', 'configUrl',
        function($rootScope, $scope, ReqTestData, APIBridge, APIService, $state, AppLang, commonFactory, commonService, userInfoService,
            $ionicLoading, $ionicScrollDelegate, $ionicModal, $timeout, fil_00_s04_requisition, $ionicSlideBoxDelegate, configUrl) {

            $scope.langs = AppLang.langs;
            $scope.slectIndex = commonService.slectIndex || "0";

            //修改APP標題
            userInfoService.changeTitle(2);

            //修改参数配置后调用api存储参数信息
            $scope.setConfig = function(data) {
                if (commonService.Platform == "Chrome") {
                    goPage();
                    return;
                }
                userInfoService.setBasicConfig(data);
                basicinformationUpdate();
            };

            //取得使用者權限
            var getUserPermission = function() {
                var webTran = {
                    auth: true,
                    url: '/api/v1/iam/permission/user',
                    parameter: {
                        "userId": userInfoService.userInfo.account,
                        "target": "drn:iam:app:FIL",
                        "queryParameter": {
                            "effect": "onlyAllow"
                        }
                    }
                };
                $ionicLoading.show({
                    template: '<ion-spinner icon="ios"></ion-spinner><p>' + $scope.langs.check_permission + '...</p>'
                });
                APIService.Web_Post(webTran, function(res) {
                    $ionicLoading.hide();
                    fil_00_s04_requisition.setAuthPermissions(res);
                    fil_00_s04_requisition.init();
                    $scope.getMenu();
                }, function(error) {
                    $ionicLoading.hide();
                    console.log(error);
                    userInfoService.getVoice(error.message, function() {});
                });
            };

            var list = (function() {
                function list(name, array) {
                    this.id = angular.copy($scope.menuList.length);
                    this.name = name;
                    this.info = array;
                }
                return list;
            })();

            $scope.setCommon = function(data, menuFun) {
                var commonmenu = [];
                angular.forEach(data, function(d) {
                    var index = menuFun.findIndex(function(item) {
                        return d.func == item.func;
                    });
                    if (index !== -1) {
                        if (d.iscommon == "Y") {
                            menuFun[index].iscommon = 'common';
                            commonmenu.push(menuFun[index]);
                        } else {
                            menuFun[index].iscommon = '';
                        }
                    }
                });
                $timeout(function() {
                    $scope.menuList = [{
                        id: "common",
                        name: $scope.langs.common, //常用
                        info: commonmenu
                    }, {
                        id: "purchase",
                        name: $scope.langs.purchase + $scope.langs.management, //採購管理
                        info: fil_00_s04_requisition.purchase
                    }, {
                        id: "sale",
                        name: $scope.langs.sale + $scope.langs.management, //銷售管理
                        info: fil_00_s04_requisition.sales
                    }, {
                        id: "produce",
                        name: $scope.langs.produce + $scope.langs.management, //生產管理
                        info: fil_00_s04_requisition.produce
                    }, {
                        id: "stock",
                        name: $scope.langs.stock + $scope.langs.management, //庫存管理
                        info: fil_00_s04_requisition.stock
                    }, {
                        id: "complex",
                        name: $scope.langs.complex + $scope.langs.management, //綜合管理
                        info: fil_00_s04_requisition.complex
                    }];
                }, 0);
            };

            var menuinformation_get = function(menuFun) {
                $ionicLoading.show();
                APIBridge.callAPI('menuinformation_get', []).then(function(result) {
                    $ionicLoading.hide();
                    if (result) {
                        console.log('menuinformation_get success');
                        var data = result.data;
                        $scope.setCommon(data, menuFun);
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
            $scope.getMenuConfig = function(menuFun) {

                $scope.data = [];
                APIBridge.callAPI('getConfig', []).then(function(result) {
                    var data = commonService.getFilter(result.data, "menu").length > 0 ? commonService.getFilter(result.data, "menu")[0].value : [];

                    if (data.length > 0) {
                        data = JSON.parse(data);
                        $scope.setCommon(data, menuFun);
                    } else {
                        menuinformation_get(menuFun);
                    }
                }, function(result) {
                    // errorpop('getMenuConfig fail');
                    console.log('getMenuConfig fail');
                    menuinformation_get(menuFun);
                });
            };

            $scope.getMenu = function() {
                var menuFun = [];
                var temp = [];
                $scope.title = $scope.langs.common;
                menuFun = temp.concat(fil_00_s04_requisition.complex, fil_00_s04_requisition.purchase, fil_00_s04_requisition.sales, fil_00_s04_requisition.produce, fil_00_s04_requisition.stock);

                //網頁版測試資料
                if (commonService.Platform == "Chrome") {
                    var data = ReqTestData.getCommonIcon();
                    $scope.setCommon(data, menuFun);
                } else {
                    $scope.getMenuConfig(menuFun);
                }
                $ionicScrollDelegate.scrollTop();
            };

            if (AppLang.lang_val != fil_00_s04_requisition.lang_val) {
                fil_00_s04_requisition.clear();
            }

            if (fil_00_s04_requisition.isclear) {
                //如果有設定權限主機IP 取得帳戶可用ICON
                if (!commonService.isNull(userInfoService.userInfo.permission_ip) && userInfoService.userInfo.permission_ip != "999") {
                    getUserPermission();
                } else {
                    fil_00_s04_requisition.init();
                }
            }

            $scope.getMenu();
            $scope.reqtype = "MENU";

            // $scope.tabs = [{id: 0, name: 'common'  },
            //                {id: 1, name: 'purchase'},
            //                {id: 2, name: 'sale'    },
            //                {id: 3, name: 'produce' },
            //                {id: 4, name: 'stock'   },
            //                {id: 5, name: 'complex' },
            //                {id: 6, name: 'set'     }];

            $scope.tabs = [{
                id: 0,
                name: 'common'
            }, {
                id: 1,
                name: 'purchase'
            }, {
                id: 2,
                name: 'sale'
            }, {
                id: 3,
                name: 'produce'
            }, {
                id: 4,
                name: 'stock'
            }, {
                id: 5,
                name: 'set'
            }];

            var account = userInfoService.userInfo.account;
            if (account == "dsc") {
                $scope.tabs = [{
                    id: 0,
                    name: 'common'
                }, {
                    id: 1,
                    name: 'purchase'
                }, {
                    id: 2,
                    name: 'sale'
                }, {
                    id: 3,
                    name: 'produce'
                }, {
                    id: 4,
                    name: 'stock'
                }, {
                    id: 5,
                    name: 'complex'
                }, {
                    id: 6,
                    name: 'set'
                }];
            }

            var subSlide = function() {
                var subheader = document.getElementById('sub'),
                    subWidth = subheader.offsetWidth,
                    width = 0,
                    length = angular.copy($scope.tabs.length) - 1;
                switch (commonService.slectIndex) {
                    case 0:
                        width = 0;
                        break;
                    case length:
                        width = length - 2;
                        break;
                    default:
                        width = angular.copy(commonService.slectIndex) - 1;
                        break;
                }
                $scope.slectIndex = commonService.slectIndex || "0";
                subheader.style.transform = "translateX(-" + (subWidth / 7) * width + "px)";
            };

            $scope.goPage = function(menuIcon) {
                if (!menuIcon.url) {
                    return;
                }
                commonService.clear_page_params();
                commonService.set_page_params(menuIcon, $scope.basicInf.account);
                $state.go(menuIcon.url);
            };

            //篩選清單類別
            $scope.fbtnFun = function(type, index) {
                $ionicSlideBoxDelegate.update();
                commonService.slectIndex = index;
                $ionicSlideBoxDelegate.slide(commonService.slectIndex, 0.3);
                subSlide();
            };

            $scope.slideChanged = function(index) { //滑动时候触发
                commonService.slectIndex = index;
                subSlide();
            };

            $scope.diplay = {
                "modify": false,
                "basicInf": false,
                "userInf": false
            };

            $scope.basicInf = userInfoService.getUserInfo();

            $scope.update = function() {
                if (userInfoService.userInfo.font_size != $scope.basicInf.font_size) {
                    $rootScope.font_size = $scope.basicInf.font_size;
                    $scope.diplay.basicInf = false;
                    $scope.diplay.userInf = false;
                }
                $ionicScrollDelegate.scrollTop();
                userInfoService.setUserInfo($scope.basicInf);
                $scope.basicInf = userInfoService.getUserInfo();
                AppLang.changeLangs($scope.basicInf.language);
                $scope.setConfig($scope.basicInf);
            };

            $scope.logout = function() {
                userInfoService.userInfo.log_in = 'N';
                $scope.reqtype = "Logout";
                fil_00_s04_requisition.clear();
                fil_00_s04_requisition.clearAuthPermissions();
                $scope.basicInf = userInfoService.getUserInfo();
                $scope.setConfig($scope.basicInf);
            };

            var basicinformationUpdate = function() {
                $ionicLoading.show();
                APIBridge.callAPI('basicinformation_upd', [userInfoService.userInfo]).then(function(result) {
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
                if ($scope.reqtype == "Login" || $scope.reqtype == "Logout") {
                    $state.go('fil_00_s01', {}, {
                        reload: true
                    });
                } else {
                    if (AppLang.lang_val != fil_00_s04_requisition.lang_val) {
                        fil_00_s04_requisition.clear();
                        fil_00_s04_requisition.init();
                        $scope.getMenu();
                    }
                    $state.go('fil_00_s04');
                }
            };

            $scope.warehouseShow = function() {
                if ($scope.reqtype == 'MENU') {
                    $scope.scaninfo = {
                        warehouse_no: $scope.basicInf.warehouse_no,
                        warehouse_name: ""
                    };
                    commonFactory.showWarehouseModal(userInfoService.warehouse, $scope.scaninfo, function(res) {
                        if (res) {
                            $scope.basicInf.warehouse_no = res.warehouse_no;
                            $scope.update();
                        }
                    }, function() {});
                } else {
                    return;
                }
            };

            $scope.reloadMachine = false;
            $scope.workstation_detail = [];
            $scope.machine_detail = [];

            //顯示 工作站彈窗
            $scope.workstationModalShow = function() {
                $scope.popSelected = {
                    search: "",
                    workstation_no: angular.copy($scope.basicInf.workstation_no),
                    workstation_name: angular.copy($scope.basicInf.workstation_name),
                };

                $scope.selworkstation = function(item) {
                    $scope.popSelected.workstation_no = item.workstation_no;
                    $scope.popSelected.workstation_name = item.workstation_name;
                };

                $scope.setworkstation = function() {
                    var index = $scope.workstation_detail.findIndex(function(item) {
                        return $scope.popSelected.workstation_no == item.workstation_no;
                    });

                    if (index !== -1) {
                        $scope.close();
                        $scope.reloadMachine = !commonService.isEquality($scope.basicInf.workstation_no, $scope.popSelected.workstation_no);
                        $scope.basicInf.workstation_no = $scope.workstation_detail[index].workstation_no;
                        $scope.basicInf.workstation_name = $scope.workstation_detail[index].workstation_name;
                        $scope.update();
                    }
                };

                $ionicModal.fromTemplateUrl('views/app/common/html/workstationModal.html', {
                    scope: $scope
                }).then(function(modal) {
                    $scope.close = function() {
                        modal.hide().then(function() {
                            return modal.remove();
                        });
                    };

                    var app_workstation_get = function(workstation_no) {
                        var webTran = {
                            service: 'app.workstation.get',
                            parameter: {
                                "site_no": userInfoService.userInfo.site_no,
                                "workstation_no": workstation_no || "",
                            }
                        };
                        $ionicLoading.show();
                        APIService.Web_Post(webTran, function(res) {
                            $ionicLoading.hide();
                            // console.log("success:" + angular.toJson(res));
                            var parameter = res.payload.std_data.parameter;
                            $timeout(function() {
                                if (parameter.workstation_detail.length > 0) {
                                    parameter.workstation_detail.push({
                                        workstation_no: " ",
                                        workstation_name: "",
                                    });
                                }
                                $scope.workstation_detail = parameter.workstation_detail;
                                modal.show();
                                return modal;
                            }, 0);
                        }, function(error) {
                            $ionicLoading.hide();
                            var execution = error.payload.std_data.execution;
                            console.log("error:" + execution.description);
                            userInfoService.getVoice(execution.description, function() {});
                        });
                    };

                    if ($scope.workstation_detail.length === 0) {
                        app_workstation_get("");
                    } else {
                        modal.show();
                        return modal;
                    }
                });
            };

            $scope.machineModalShow = function() {
                $scope.popSelected = {
                    search: "",
                    machine_no: angular.copy($scope.basicInf.machine_no),
                    machine_name: angular.copy($scope.basicInf.machine_name),
                };

                $scope.selmachine = function(item) {
                    $scope.popSelected.machine_no = item.machine_no;
                    $scope.popSelected.machine_name = item.machine_name;
                };

                $scope.setmachine = function() {
                    var index = $scope.machine_detail.findIndex(function(item) {
                        return $scope.popSelected.machine_no == item.machine_no;
                    });

                    if (index !== -1) {
                        $scope.close();
                        $scope.basicInf.machine_no = $scope.machine_detail[index].machine_no;
                        $scope.basicInf.machine_name = $scope.machine_detail[index].machine_name;
                        $scope.update();
                    }
                };

                $ionicModal.fromTemplateUrl('views/app/common/html/machineModal.html', {
                    scope: $scope
                }).then(function(modal) {
                    $scope.close = function() {
                        modal.hide().then(function() {
                            return modal.remove();
                        });
                    };

                    var app_machine_get = function(workstation_no) {
                        var webTran = {
                            service: 'app.machine.get',
                            parameter: {
                                "site_no": userInfoService.userInfo.site_no,
                                "workstation_no": workstation_no || "",
                                "machine_no": "",
                            }
                        };
                        $ionicLoading.show();
                        APIService.Web_Post(webTran, function(res) {
                            $ionicLoading.hide();
                            // console.log("success:" + angular.toJson(res));
                            var parameter = res.payload.std_data.parameter;
                            $timeout(function() {
                                if (parameter.machine_detail.length > 0) {
                                    parameter.machine_detail.push({
                                        machine_no: " ",
                                        machine_name: "",
                                    });
                                }
                                $scope.reloadMachine = false;
                                $scope.machine_detail = parameter.machine_detail;
                                modal.show();
                                return modal;
                            }, 0);
                        }, function(error) {
                            $ionicLoading.hide();
                            var execution = error.payload.std_data.execution;
                            console.log("error:" + execution.description);
                            userInfoService.getVoice(execution.description, function() {});
                        });
                    };

                    if ($scope.machine_detail.length === 0 || $scope.reloadMachine) {
                        app_machine_get($scope.basicInf.workstation_no);
                    } else {
                        modal.show();
                        return modal;
                    }
                });
            };

            if ($scope.reqtype == 'MENU') {
                console.log(userInfoService.userInfo);
                if (commonService.isNull(userInfoService.userInfo.warehouse_no)) {
                    $scope.diplay.basicInf = true;
                    $scope.warehouseShow();
                    userInfoService.getVoice($scope.langs.please_choose + $scope.langs.default+$scope.langs.warehouse, function() {});
                }
            }

            angular.element(document).ready(function() {
                $scope.fbtnFun("", commonService.slectIndex);
            });
        }
    ];
});