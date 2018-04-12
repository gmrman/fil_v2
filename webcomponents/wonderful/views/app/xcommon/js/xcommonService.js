define(["app", "API", "APIS", "ionic-popup",
    "views/app/xcommon/js/xappLang.js"], function (app) {
    app.factory('xcommonService', ['APIService', 'AppLang', '$timeout',
        '$rootScope', '$ionicLoading', '$ionicPopup',
        'IonicClosePopupService', 'IonicPopupService',
        "$ionicModal", '$interval', 'xAppLang', "$filter",
        "$ionicSlideBoxDelegate", "$ionicScrollDelegate",
        function (APIService, AppLang, $timeout,
                  $rootScope, $ionicLoading, $ionicPopup,
                  IonicClosePopupService, IonicPopupService,
                  $ionicModal, $interval, xAppLang, $filter,
                  $ionicSlideBoxDelegate, $ionicScrollDelegate) {


            var parent = $rootScope;
            var $scope = parent.$new();
            $scope.langs = AppLang.langs;
            $scope.xlangs = xAppLang.langs;

            /**************************************
             * 根据点击时间，加减值每100ms+2
             */
            var Timer;
            var vue = 1;
            $scope.mintouch = function (item) {
                Timer = $interval(function (item) {
                    $scope.mins(item);
                    vue += 2;
                }, 100);
            }
            $scope.addtouch = function (item) {
                Timer = $interval(function (item) {
                    $scope.add(item);
                    vue += 2;
                }, 100);
            }
            $scope.release = function () {
                $interval.cancel(Timer);
                vue = 1;
            }

            var checkmin = function (value, value2) {
                var num = Number(value) + Number(value2);
                // if (num < 1) {
                //     num = 0;
                // }
                return num;
            };
            var compute = function (type, value) {
                qty = checkmin($scope.pop.qty, value);
                $scope.pop.qty = qty;
                // $scope.pop.qty = ($scope.pop.maxqty > qty) ? qty : $scope.pop.maxqty;
            };
            $scope.mins = function (item) {
                console.log("mins");
                compute(item, vue * -1);
            };
            $scope.add = function (item) {
                console.log("add");
                compute(item, vue);
            };

            return {
                showPhrasePopup: function (phraselist) {
                    $scope.phraselist = phraselist;
                    $scope.popSelected = {
                        Description: ""
                    }
                    var PhrasePopup = $ionicPopup.show({
                        title: $scope.langs.inquire + $scope.xlangs.phrase,
                        scope: $scope,
                        templateUrl: "views/app/xcommon/template/phrasePop.html",
                        buttons: [{
                            text: $scope.langs.cancel
                        }, {
                            text: $scope.langs.confirm,
                            onTap: function () {
                                return $scope.popSelected.Description;
                            }
                        }]
                    });
                    IonicClosePopupService.register(false, PhrasePopup);

                    $scope.setphrase = function (phrase) {
                        $scope.popSelected.Description = phrase.Description;
                    };
                    return PhrasePopup;
                },
                showTransferDocPopup: function (transfer_docs, scaninfo) {
                    $scope.transfer_docs = transfer_docs;
                    $scope.popSelected = {
                        transfer_doc_no: scaninfo.transfer_doc_no,
                    };
                    var docPop = $ionicPopup.show({
                        title: $scope.langs.please_choose + $scope.xlangs.doc_id,
                        scope: $scope,
                        templateUrl: "views/app/xcommon/template/docPop.html",
                        buttons: [{
                            text: $scope.langs.cancel
                        }, {
                            text: $scope.langs.confirm,
                            onTap: function () {
                                var index = $scope.transfer_docs.findIndex(function (item) {
                                    return $scope.popSelected.transfer_doc_no == item.transfer_doc_no;
                                });

                                if (index !== -1) { //存在於倉庫基本檔
                                    return $scope.transfer_docs[index];
                                }
                            }
                        }]
                    });
                    IonicClosePopupService.register(false, docPop);

                    $scope.setTransferdoc = function (doc) {
                        $scope.popSelected.transfer_doc_no = doc.transfer_doc_no;

                    };

                    return docPop;

                },
                showXstatusPopup: function (currentinfo) {

                    $scope.status = [{
                        name: '未装箱',
                        value: '1'
                    }, {
                        name: '装箱中',
                        value: '2'
                    }, {
                        name: '装箱完成',
                        value: '3'
                    }];
                    $scope.diplay = {
                        displayType: true
                    };
                    $scope.popSelected = {
                        value: currentinfo,
                    };
                    var statusPopup = $ionicPopup.show({
                        title: $scope.xlangs.xstatus,
                        scope: $scope,
                        templateUrl: "views/app/xcommon/template/xstatusPop.html",
                        buttons: [{
                            text: $scope.langs.cancel
                        }, {
                            text: $scope.langs.confirm,
                            onTap: function () {
                                return $scope.popSelected.value;

                            }
                        }]
                    });
                    IonicClosePopupService.register(false, statusPopup);

                    // $scope.setStatus = function (item) {
                    //     //$scope.popSelected.value = item.value;
                    // };

                    return statusPopup;

                },
                showDevPopup: function (devs, scaninfo) {
                    $scope.devs = devs;
                    $scope.popSelected = {
                        dev_no: scaninfo.dev_info,
                    };
                    var devPop = $ionicPopup.show({
                        title: $scope.langs.please_choose + $scope.xlangs.dev,
                        scope: $scope,
                        templateUrl: "views/app/xcommon/template/devPop.html",
                        buttons: [{
                            text: $scope.langs.cancel
                        }, {
                            text: $scope.langs.confirm,
                            onTap: function () {
                                var index = $scope.devs.findIndex(function (item) {
                                    return $scope.popSelected.dev_no == item.dev_no;
                                });

                                if (index !== -1) { //存在於倉庫基本檔
                                    return $scope.devs[index];
                                }
                            }
                        }]
                    });
                    IonicClosePopupService.register(false, devPop);

                    $scope.setdev = function (dev) {
                        $scope.popSelected.dev_no = dev.dev_no;

                    };

                    return devPop;
                },
                showEmployeePopup: function (employees, scaninfo) {
                    $scope.employees = employees;
                    $scope.popSelected = {
                        employee_no: scaninfo.employee_no,
                        employee_name: null
                    };
                    var employeePop = $ionicPopup.show({
                        title: $scope.langs.please_choose + $scope.langs.employee,
                        scope: $scope,
                        templateUrl: "views/app/xcommon/template/employeePop.html",
                        buttons: [{
                            text: $scope.langs.cancel
                        }, {
                            text: $scope.langs.confirm,
                            onTap: function () {
                                var index = $scope.employees.findIndex(function (item) {
                                    return $scope.popSelected.employee_no == item.employee_no;
                                });

                                if (index !== -1) { //存在於倉庫基本檔
                                    return $scope.employees[index];
                                }
                            }
                        }]
                    });
                    IonicClosePopupService.register(false, employeePop);

                    $scope.setemployee = function (employee) {
                        $scope.popSelected.employee_no = employee.employee_no;
                        $scope.popSelected.employee_name = employee.employee_name;

                    };

                    return employeePop;
                },

                /**************************************
                 *提供基础加减功能，不可小于0，返回数值后续判断
                 * error提供返回前的弹窗处理逻辑
                 */
                showQTYPopup: function (barcode_qty, error) {
                    $scope.pop = {
                        qty: parseFloat(barcode_qty),
                        // maxqty:parseFloat(maxqty),
                        //allow:allow
                    };

                    $scope.myPopup = $ionicPopup.show({
                        title: $scope.langs.edit + $scope.langs.qty,
                        scope: $scope,
                        templateUrl: "views/app/xcommon/template/qtyPop.html",
                        buttons: [{
                            text: $scope.langs.cancel
                        }, {
                            text: $scope.langs.confirm,
                            onTap: function (e) {
                                // if ($scope.pop.qty >= 0)
                                //     return $scope.pop.qty;///parseFloat(Number().toFixed(2));
                                // else {
                                //     e.preventDefault();
                                //     IonicPopupService.errorAlert("数量不可小于0！");
                                // }
                                if (!error($scope.pop.qty)) {
                                    return $scope.pop.qty;
                                } else {
                                    //阻止窗口关闭
                                    e.preventDefault();
                                    // $scope.pop.qty = 0;
                                }

                            }
                        }]
                    });
                    return $scope.myPopup;
                },
                //标准修改
                showCheckQtyPopup: function (category, in_out_no, barcode_qty, receipt_surplus_qty, receipt_allow_qty) {
                    $scope.pop = {
                        category: category,
                        in_out_no: in_out_no,
                        barcode_qty: barcode_qty,
                        receipt_surplus_qty: receipt_surplus_qty,
                        receipt_allow_qty: Number(receipt_allow_qty),
                        maxqty: 0,
                        qty: 0,
                        allow: false
                    };
                    var error_massage = "";
                    if ($scope.pop.barcode_qty > $scope.pop.receipt_allow_qty) {
                        $scope.pop.maxqty = $scope.pop.receipt_allow_qty;
                        $scope.pop.qty = $scope.pop.receipt_surplus_qty;
                        error_massage = AppLang.langs.picks_error;
                    } else {
                        $scope.pop.maxqty = $scope.pop.barcode_qty;
                        $scope.pop.qty = $scope.pop.barcode_qty;
                        error_massage = AppLang.langs.barcode + AppLang.langs.stock + AppLang.langs.qty + AppLang.langs.insufficient + "！";
                    }

                    $scope.pop.qty = $scope.pop.maxqty;

                    var checkQtyPopup = $ionicPopup.show({
                        title: $scope.langs.point,
                        templateUrl: "views/app/xcommon/template/checkQtyPopup.html",
                        scope: $scope,
                        buttons: [{
                            text: AppLang.langs.cancel,
                            onTap: function () {
                                return $scope.pop;
                            }
                        }, {
                            text: AppLang.langs.confirm,
                            onTap: function (e) {
                                // if ($scope.pop.qty > $scope.pop.maxqty) {
                                //     e.preventDefault();
                                //     $scope.pop.qty = $scope.pop.maxqty;
                                //     IonicPopupService.errorAlert(error_massage);
                                // } else {
                                $scope.pop.allow = true;
                                console.log($scope.pop);
                                return $scope.pop;
                                //}
                            }
                        }]
                    });
                    //計算數值是否小於0
                    var checkmin2 = function (value, value2) {
                        var num = Number(value) + Number(value2);
                        if (num < 1) {
                            num = 1;
                        }
                        return num;
                    };

                    //計算加減後數值 並呼叫撿查
                    var compute2 = function (type, value) {
                        qty = checkmin2($scope.pop.qty, value);
                        $scope.pop.qty = qty;
                    };

                    $scope.mins2 = function (type) {
                        console.log("mins");
                        compute2(type, -1);
                    };

                    $scope.add2 = function (type) {
                        console.log("add");
                        compute2(type, 1);
                    };
                    return checkQtyPopup;
                },
                //修改标准
                /***********************************************************************************************************************
                 * Descriptions...: 顯示數量彈窗
                 * Usage..........: showQtyPopup(type, qty, maxqty)
                 * Input parameter: type                     數值類型
                 *                : qty                      數量
                 *                : maxqty                   最大值
                 * Return code....: qty                      數量
                 * Modify.........: 20161125 By lyw
                 ***********************************************************************************************************************/
                showXQtyPopup: function (type, qty, maxqty) {
                    $scope.pop = {
                        qty: parseFloat(qty),
                        maxqty: maxqty,
                        type: type
                    };
                    var QtyPop = $ionicPopup.show({
                        title: $scope.langs.edit + $scope.langs.qty,
                        scope: $scope,
                        templateUrl: "views/app/xcommon/template/xqtyPop.html",
                        buttons: [{
                            text: $scope.langs.cancel
                        }, {
                            text: $scope.langs.confirm,
                            onTap: function (e) {
                                if (!$scope.pop.qty) {
                                    $scope.pop.qty = 0;
                                }
                                if ($scope.pop.qty > $scope.pop.maxqty) {
                                    e.preventDefault();
                                    IonicPopupService.errorAlert($scope.langs.picks_error);
                                    $scope.pop.qty = $scope.pop.maxqty;
                                } else {
                                    return $scope.pop.qty;
                                }
                            }
                        }]
                    });
                    IonicClosePopupService.register(false, QtyPop);
                    //計算數值是否小於0
                    var checkmin2 = function (value, value2) {
                        var num = Number(value) + Number(value2);
                        if (num < 0) {
                            num = 0;
                        }
                        return num;
                    };

                    //計算加減後數值 並呼叫撿查
                    var compute2 = function (type, value) {
                        qty = checkmin2($scope.pop.qty, value);
                        $scope.pop.qty = qty.toFixed(6) * 1000000 / 1000000;
                    };

                    $scope.mins2 = function (type) {
                        console.log("mins");
                        compute2(type, -0.001);
                    };

                    $scope.add2 = function (type) {
                        console.log("add");
                        compute2(type, 0.001);
                    };
                    $scope.dataChange = function (obj) {
                        if (obj != null)
                            $scope.pop.qty = obj.toFixed(6) * 1000000 / 1000000;
                    };

                    return QtyPop;
                },
                //標準修改
                showStoragePopup: function (storage_spaces, scaninfo) {
                    $scope.storages = storage_spaces;
                    $scope.popSelected = {
                        storage_spaces_no: scaninfo.storage_spaces_no,
                        storage_spaces_name: scaninfo.storage_spaces_name,
                    };
                    var storagePop = $ionicPopup.show({
                        title: $scope.langs.please_choose + $scope.langs.storage,
                        scope: $scope,
                        templateUrl: "views/app/xcommon/template/storagePop.html",
                        buttons: [{
                            text: $scope.langs.cancel
                        }, {
                            text: $scope.langs.confirm,
                            onTap: function () {
                                return $scope.popSelected;
                            }
                        }]
                    });
                    IonicClosePopupService.register(false, storagePop);

                    $scope.selstorage = function (storage) {
                        $scope.popSelected.storage_spaces_no = storage.storage_spaces_no;
                        $scope.popSelected.storage_spaces_name = storage.storage_spaces_name;
                    };
                    return storagePop;

                },
                //標準修改
                showWarehousePopup: function (warehouses, scaninfo) {
                    $scope.warehouses = warehouses;
                    $scope.popSelected = {
                        warehouse_no: scaninfo.warehouse_no,
                        warehouse_name: scaninfo.warehouse_name
                    };
                    var warehousePop = $ionicPopup.show({
                        title: $scope.langs.please_choose + $scope.langs.warehouse,
                        scope: $scope,
                        templateUrl: "views/app/xcommon/template/warehousePop.html",
                        buttons: [{
                            text: $scope.langs.cancel
                        }, {
                            text: $scope.langs.confirm,
                            onTap: function () {
                                var index = $scope.warehouses.findIndex(function (item) {
                                    return $scope.popSelected.warehouse_no == item.warehouse_no;
                                });

                                if (index !== -1) { //存在於倉庫基本檔
                                    return $scope.warehouses[index];
                                }
                            }
                        }]
                    });
                    IonicClosePopupService.register(false, warehousePop);

                    $scope.selwarehouse = function (warehouse) {
                        $scope.popSelected.warehouse_no = warehouse.warehouse_no;
                        $scope.popSelected.warehouse_name = warehouse.warehouse_name;
                        $scope.popSelected.storage_spaces = warehouse.storage_spaces;
                    };

                    return warehousePop;
                },
                //返回弹窗提示
                returnMessagePopup: function (title, msg) {
                    var MessagePopup = $ionicPopup.show({
                        scope: $scope,
                        title: title,
                        template: msg,
                        buttons: [{
                            text: $scope.langs.cancel
                        }, {
                            text: $scope.langs.confirm,
                            onTap: function () {
                                return true;
                            }
                        }]
                    });
                    IonicClosePopupService.register(false, MessagePopup);


                    return MessagePopup;
                },
                //部门开窗
                showAdminPopup: function (admins, select, resolve, reject) {

                    $scope.admins = admins;

                    angular.forEach($scope.admins, function (item) {

                        if (select != null && select.length > 0) {
                            var index = select.findIndex(function (c) {
                                return c.admin_unit_no == item.admin_unit_no;
                            })
                            if (index > -1) {
                                item.checked = select[index].checked;
                            } else {
                                item.checked = false;
                            }

                        } else {
                            item.checked = false;

                        }
                    });

                    $scope.popSelected = {
                        admin_unit_no: "",
                        admin_unit_name: "",
                        checked: false
                    };

                    $scope.popSelecteds = [];

                    $scope.setAdminUnit = function () {

                        angular.forEach($scope.admins, function (item) {
                            if (item.checked) {
                                $scope.popSelecteds.push(item);
                            }

                        });
                        $scope.close();
                        return resolve($scope.popSelecteds);
                    };
                    // $scope.selectAll = function () {
                    //     var index = $scope.admins.findIndex(function (item) {
                    //         return item.checked == false
                    //     });
                    //     if (index == -1) {
                    //         angular.forEach($scope.admins, function (item) {
                    //             item.checked = false;
                    //         });
                    //     } else {
                    //         angular.forEach($scope.admins, function (item) {
                    //             item.checked = true;
                    //         });
                    //     }
                    //
                    //     $scope.$broadcast('scroll.refreshComplete');
                    // };
                    $ionicModal.fromTemplateUrl('views/app/xcommon/template/adminUnitPopup.html', {
                        scope: $scope
                    }).then(function (modal) {
                        $scope.close = function () {
                            reject();
                            modal.hide().then(function () {
                                return modal.remove();
                            });
                        };
                        $scope.modal = modal;
                        $scope.modal.show();
                        return modal;
                    });

                }
                ,//员工开窗
                showCustomerPopup: function (customers, select, resolve, reject) {

                    $scope.customers = customers;
                    angular.forEach($scope.customers, function (item) {
                        if (select != null && select.length > 0) {
                            var index = select.findIndex(function (c) {
                                return c.customer_no == item.customer_no;
                            })
                            if (index > -1) {
                                item.checked = select[index].checked;
                            } else {
                                item.checked = false;
                            }

                        } else {
                            item.checked = false;

                        }
                    });
                    $scope.popSelected = {
                        customer_no: "",
                        customer_name: "",
                        checked: false
                    };

                    $scope.popSelecteds = [];


                    $scope.setCustomer = function () {

                        angular.forEach($scope.customers, function (item) {
                            if (item.checked) {
                                $scope.popSelecteds.push(item);
                            }

                        });
                        $scope.close();
                        return resolve($scope.popSelecteds);
                    };

                    // $scope.selectAll = function () {
                    //     var index = $scope.customers.findIndex(function (item) {
                    //         return item.checked == false
                    //     });
                    //     if (index == -1) {
                    //         angular.forEach($scope.customers, function (item) {
                    //             item.checked = false;
                    //         });
                    //     } else {
                    //         angular.forEach($scope.customers, function (item) {
                    //             item.checked = true;
                    //         });
                    //     }
                    //
                    //     $scope.$broadcast('scroll.refreshComplete');
                    // };

                    $ionicModal.fromTemplateUrl('views/app/xcommon/template/customerPopup.html', {
                        scope: $scope
                    }).then(function (modal) {
                        $scope.close = function () {
                            reject();
                            modal.hide().then(function () {
                                return modal.remove();
                            });
                        };
                        $scope.modal = modal;
                        $scope.modal.show();
                        return modal;
                    });

                }
                ,//仓库开窗
                showWareHousePopup: function (warehouses, select, resolve, reject) {
                    $scope.warehouses = warehouses;
                    $scope.filterItem = {
                        search: ""
                    };

                    angular.forEach($scope.warehouses, function (item) {

                        if (select != null && select.length > 0) {
                            var index = select.findIndex(function (c) {
                                return c.warehouse_no == item.warehouse_no;
                            })
                            if (index > -1) {
                                item.checked = select[index].checked;
                            } else {
                                item.checked = false;
                            }

                        } else {
                            item.checked = false;

                        }
                    });

                    $scope.popSelecteds = [];
                    $scope.selectAll = function () {
                        var result = $filter('filter')($scope.warehouses,
                            ({warehouse_no: $scope.filterItem.search} ||
                                {warehouse_name: $scope.filterItem.search})
                        );
                        var index = result.findIndex(function (item) {
                            return item.checked == false
                        });

                        if (index > -1) {

                            if (result.length == $scope.warehouses.length) {
                                angular.forEach($scope.warehouses, function (item) {
                                    item.checked = true;
                                });
                            }
                            else {
                                angular.forEach(result, function (item) {
                                    angular.forEach($scope.warehouses, function (item2) {
                                        if (item.warehouse_no == item2.warehouse_no) {
                                            item2.checked = true;
                                        }
                                    });
                                });
                            }

                        } else {
                            if (result.length == $scope.warehouses.length) {
                                angular.forEach($scope.warehouses, function (item) {
                                    item.checked = false;
                                });
                            }
                            else {
                                angular.forEach(result, function (item) {
                                    angular.forEach($scope.warehouses, function (item2) {
                                        if (item.warehouse_no == item2.warehouse_no) {
                                            item2.checked = false;
                                        }
                                    });
                                });
                            }
                        }

                        $scope.$broadcast('scroll.refreshComplete');
                    };
                    $scope.setWarehouseUnit = function () {

                        angular.forEach($scope.warehouses, function (item) {
                            if (item.checked) {
                                $scope.popSelecteds.push(item);
                            }

                        });
                        $scope.close();
                        return resolve($scope.popSelecteds);
                    };

                    $ionicModal.fromTemplateUrl('views/app/xcommon/template/warehousePopup.html', {
                        scope: $scope
                    }).then(function (modal) {
                        $scope.close = function () {
                            reject();
                            modal.hide().then(function () {
                                return modal.remove();
                            });
                        };
                        $scope.modal = modal;
                        $scope.modal.show();
                        return modal;
                    });

                }
                ,//品号开窗
                showItemPopup: function (items, select, filterInfo, resolve, reject) {

                    $scope.items = items;
                    $scope.selectMode = "全选";
                    $scope.hasMore = false;
                    $scope.notruning = true;
                    $scope.filterInfo = filterInfo;
                    //起始笔数，避免卡死
                    $scope.seq_s = "1";
                    $scope.seq_e = "50";

                    $scope.loadMore = function () {
                        $timeout(function () {
                            if ($scope.hasMore && $scope.notruning) {
                                if ($scope.filterInfo.filterItem.searchItemCode == $scope.filterInfo.lastFilterItem.searchItemCode
                                    && $scope.filterInfo.filterItem.searchItemName == $scope.filterInfo.lastFilterItem.searchItemName
                                    && $scope.filterInfo.filterItem.searchSpec == $scope.filterInfo.lastFilterItem.searchSpec) {
                                    $scope.notruning = false;
                                    reject($scope.filterInfo, function (res) {
                                        $scope.notruning = true;
                                        if (res) {
                                            var temp_item = angular.copy($scope.items);
                                            $scope.items = temp_item.concat(res);
                                            temp_item = [];
                                            if (res.length == 50)
                                                $scope.hasMore = true;
                                            else {
                                                $scope.hasMore = false;
                                            }
                                            var count = res.length;
                                            $scope.seq_s = (Number($scope.seq_s) + count).toString();
                                            $scope.seq_e = (Number($scope.seq_e) + count).toString();

                                            console.log("hasMore:", $scope.hasMore);
                                            console.log("res.length:", res.length);

                                        }
                                    }, $scope.seq_s, $scope.seq_e);
                                } else {
                                    $scope.hasMore = false;
                                }
                            }
                            $scope.$broadcast('scroll.infiniteScrollComplete');
                        }, 1000);
                    };

                    angular.forEach($scope.items, function (item) {
                        if (select != null && select.length > 0) {
                            var index = select.findIndex(function (c) {
                                return c.ITEM_CODE == item.ITEM_CODE;
                            })
                            if (index > -1) {
                                item.checked = select[index].checked;
                            } else {
                                item.checked = false;
                            }

                        } else {
                            item.checked = false;

                        }
                    });
                    $scope.queryItem = function () {
                        $scope.seq_s = "1";
                        $scope.seq_e = "50";
                        $scope.items = [];
                        reject($scope.filterInfo, function (res) {
                            $scope.items = res;
                            $scope.filterInfo.lastFilterItem =
                                {
                                    searchItemCode: $scope.filterInfo.filterItem.searchItemCode,
                                    searchItemName: $scope.filterInfo.filterItem.searchItemName,
                                    searchSpec: $scope.filterInfo.filterItem.searchSpec
                                };

                            var count = res.length;
                            $scope.seq_s = (Number($scope.seq_s) + count).toString();
                            $scope.seq_e = (Number($scope.seq_e) + count).toString();
                            if (count == 50)
                                $scope.hasMore = true;
                            else
                                $scope.hasMore = false;
                        }, $scope.seq_s, $scope.seq_e);
                    };

                    $scope.showflag = true;
                    $scope.showBar = function () {
                        if (!$scope.showflag) {
                            $scope.showflag = true;
                        } else {
                            $scope.showflag = false;
                        }

                    };

                    $scope.popSelecteds = [];
                    $scope.selectAll = function () {
                        var result1 = $filter('filter')($scope.items,
                            {ITEM_CODE: $scope.filterInfo.filterItem.searchItemCode}
                        );
                        var result2 = $filter('filter')(result1,
                            {ITEM_NAME: $scope.filterInfo.filterItem.searchItemName}
                        );
                        var result = $filter('filter')(result2,
                            {ITEM_SPECIFICATION: $scope.filterInfo.filterItem.searchSpec}
                        );

                        var index = result.findIndex(function (item) {
                            return item.checked == false
                        });
                        if (index > -1) {

                            if (result.length == $scope.items.length) {
                                angular.forEach($scope.items, function (item) {
                                    item.checked = true;
                                });
                            }
                            else {
                                angular.forEach(result, function (item) {
                                    var index = $scope.items.findIndex(function (item2) {
                                        return item.ITEM_CODE == item2.ITEM_CODE
                                    });
                                    if (index > -1) {
                                        item.checked = true;
                                    } else {
                                        item.checked = false;
                                    }
                                });
                            }

                        } else {
                            angular.forEach($scope.items, function (item) {
                                item.checked = false;
                            });
                        }

                        $scope.$broadcast('scroll.refreshComplete');
                    };

                    $scope.setItem = function () {
                        var result1 = $filter('filter')($scope.items,
                            {ITEM_CODE: $scope.filterInfo.filterItem.searchItemCode}
                        );
                        var result2 = $filter('filter')(result1,
                            {ITEM_NAME: $scope.filterInfo.filterItem.searchItemName}
                        );
                        var result = $filter('filter')(result2,
                            {ITEM_SPECIFICATION: $scope.filterInfo.filterItem.searchSpec}
                        );
                        angular.forEach(result, function (item1) {

                            angular.forEach($scope.items, function (item2) {
                                if (item1.ITEM_CODE == item2.ITEM_CODE) {
                                    if (item1.checked) {
                                        $scope.popSelecteds.push(item2);
                                    }
                                }
                            });
                        });
                        $scope.close();
                        return resolve($scope.popSelecteds, $scope.items);
                    };

                    $ionicModal.fromTemplateUrl('views/app/xcommon/template/itemPopup.html', {
                        scope: $scope
                    }).then(function (modal) {
                        $scope.close = function () {
                            //reject();
                            modal.hide().then(function () {
                                return modal.remove();
                            });
                        };
                        $scope.modal = modal;
                        $scope.modal.show();
                        return modal;
                    });

                }
                ,
                // 通用多選開窗
                // path 模板地址
                // items開窗項目，
                // currentSelect為當前選項（調用方法處理），
                // filterItem過濾選項(調用方法給值)
                // selectAll為全選（調用方法處理），
                // resolve 返回結果（調用方法處理），
                // reject 窗體關閉時處理（調用方法處理）
                showItemsPopup: function (path, items, currentSelect, filterItem, selectAll, resolve, reject) {
                    $scope.items = items;

                    $scope.filterItem = filterItem;
                    //例如
                    // filterItem = {
                    //     searchItemCode: "",
                    //     searchItemName: ""
                    // };

                    currentSelect($scope.items);
                    //例如
                    // fuction currentSelect(items){
                    // angular.forEach(items, function (item) {
                    //     if (select != null && select.length > 0) {
                    //         var index = select.findIndex(function (c) {
                    //             return c.ITEM_CODE == item.ITEM_CODE;
                    //         })
                    //         if (index > -1) {
                    //             item.checked = select[index].checked;
                    //         } else {
                    //             item.checked = false;
                    //         }
                    //
                    //     } else {
                    //         item.checked = false;
                    //
                    //     }
                    // });
                    //}
                    $scope.popSelecteds = [];

                    //如果有
                    $scope.selectAll = function () {
                        selectAll($scope.items, $scope.filterItem);
                        // 例如
                        // selectAll = function () {
                        //     var result1 = $filter('filter')($scope.items,
                        //         {ITEM_CODE:$scope.filterItem.searchItemCode}
                        //     );
                        //     var result2 = $filter('filter')(result1,
                        //         {ITEM_NAME:$scope.filterItem.searchItemName}
                        //     );
                        //     var result = $filter('filter')(result2,
                        //         {ITEM_SPECIFICATION:$scope.filterItem.searchSpec}
                        //     );
                        //
                        //     var index = result.findIndex(function (item) {
                        //         return item.checked == false
                        //     });
                        //     if (index > -1) {
                        //         if(result.length == $scope.items.length){
                        //             angular.forEach($scope.items, function (item) {
                        //                 item.checked = true;
                        //             });
                        //         }
                        //         else {
                        //             angular.forEach(result, function (item) {
                        //                 angular.forEach( $scope.items,function (item2) {
                        //                     if(item.ITEM_CODE == item2.ITEM_CODE){
                        //                         item2.checked = true;
                        //                     }
                        //                 });
                        //             });
                        //         }
                        //
                        //     } else {
                        //         if(result.length == $scope.items.length){
                        //             angular.forEach($scope.items, function (item) {
                        //                 item.checked = false;
                        //             });
                        //         }else {
                        //             angular.forEach(result, function (item) {
                        //                 angular.forEach( $scope.items,function (item2) {
                        //                     if(item.ITEM_CODE == item2.ITEM_CODE){
                        //                         item2.checked = false;
                        //                     }
                        //                 });
                        //             });
                        //         }
                        //
                        //     }
                        // };
                        $scope.$broadcast('scroll.refreshComplete');
                    };

                    $scope.setItem = function () {
                        angular.forEach($scope.items, function (item) {
                            if (item.checked) {
                                $scope.popSelecteds.push(item);
                            }
                        });
                        $scope.close();
                        return resolve($scope.popSelecteds);
                    };

                    $ionicModal.fromTemplateUrl(path, {
                        scope: $scope
                    }).then(function (modal) {
                        $scope.close = function () {
                            reject();
                            modal.hide().then(function () {
                                return modal.remove();
                            });
                        };
                        $scope.modal = modal;
                        $scope.modal.show();
                        return modal;
                    });

                }
                ,
                showImagePopup: function (path, item_pic) {
                    $scope.zoomMin = 1;
                    $scope.showInfo = {
                        item_pic: item_pic
                    };

                    $ionicModal.fromTemplateUrl(path, {
                        scope: $scope
                    }).then(function (modal) {
                        $scope.close = function () {
                            modal.hide().then(function () {
                                return modal.remove();
                            });
                        };
                        $scope.modal = modal;
                        $scope.modal.show();
                        return modal;
                    })
                },

                //修改标准，返回时判断
                showWarehouseModal: function (warehouses, scaninfo, resolve, reject) {
                    $scope.warehouses = warehouses;
                    $scope.popSelected = {
                        search: "",
                        warehouse_no: scaninfo.warehouse_no,
                        warehouse_name: scaninfo.warehouse_name
                    };

                    $scope.selwarehouse = function (warehouse) {
                        $scope.popSelected.warehouse_no = warehouse.warehouse_no;
                        $scope.popSelected.warehouse_name = warehouse.warehouse_name;
                        $scope.popSelected.storage_spaces = warehouse.storage_spaces;
                    };

                    $scope.setwarehouse = function () {
                        var index = $scope.warehouses.findIndex(function (item) {
                            return $scope.popSelected.warehouse_no == item.warehouse_no;
                        });

                        if (index !== -1) { //存在於倉庫基本檔
                            if(resolve($scope.warehouses[index])){
                              return;
                            }
                            $scope.close();
                        }
                    };
                    $ionicModal.fromTemplateUrl('views/app/common/html/warehouseModal.html', {
                        scope: $scope
                    }).then(function (modal) {
                        $scope.close = function () {
                            reject();
                            modal.hide().then(function () {
                                return modal.remove();
                            });
                        };
                        modal.show();
                        return modal;
                    });
                },

                showStorageModal: function (storage_spaces, scaninfo, resolve, reject) {
                    $scope.storages = storage_spaces;
                    $scope.popSelected = {
                        search: "",
                        storage_spaces_no: scaninfo.storage_spaces_no,
                        storage_spaces_name: scaninfo.storage_spaces_name,
                    };

                    $scope.selstorage = function (storage) {
                        $scope.popSelected.storage_spaces_no = storage.storage_spaces_no;
                        $scope.popSelected.storage_spaces_name = storage.storage_spaces_name;
                    };

                    $scope.setstorage = function () {
                        if(resolve($scope.popSelected)){
                            return;
                        }
                        $scope.close();
                    };

                    $ionicModal.fromTemplateUrl('views/app/common/html/storageModal.html', {
                        scope: $scope
                    }).then(function (modal) {
                        $scope.close = function () {
                            reject();
                            modal.hide().then(function () {
                                return modal.remove();
                            });
                        };
                        modal.show();
                        return modal;
                    });
                },
                /***********************************************************************************************************************
                 * Descriptions...: 顯示批號彈窗
                 * Usage..........: showLotPopup(lot_no)
                 * Input parameter: lot_no                   批號
                 * Return code....: lot_no                   批號
                 * Modify.........: 20161125 By lyw
                 ***********************************************************************************************************************/
                showSMarkPopup: function (lot_no) {
                    $scope.lotobj = {
                        lot_no: lot_no
                    };
                    var SMarkPop = $ionicPopup.show({
                        title: $scope.langs.edit + $scope.xlangs.shipping_mark,
                        scope: $scope,
                        templateUrl: "views/app/xcommon/template/SMarkPop.html",
                        buttons: [{
                            text: $scope.langs.cancel
                        }, {
                            text: $scope.langs.confirm,
                            onTap: function () {
                                return $scope.lotobj.lot_no;
                            }
                        }]
                    });
                    IonicClosePopupService.register(false, SMarkPop);
                    return SMarkPop;
                },
            };
        }
    ])
    ;
});