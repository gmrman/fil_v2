define(["app", "API", "APIS", "commonService"], function(app) {
    app.service('userInfoService', ['commonService', 'APIBridge', 'AppLang', 'IonicPopupService', '$filter',
        function(commonService, APIBridge, AppLang, IonicPopupService, $filter) {

            var self = this;
            var sys_language = "zh_TW";
            self.app_name = ""
            self.app_version = "";
            self.warehouse = [];
            self.storageSpaces = [];
            self.warehouseIndex = {};
            //定義使用者資訊物件
            self.userInfo = {
                sys_language: sys_language,
                account: "",
                enterprise_no: "",
                site_no: "",
                server_ip: "",
                server_area: "",
                server_product: "",
                permission_ip: "",
                lot_length: "",
                lot_auto: "",
                barcode_repeat: "",
                barcode_separator: "",
                warehouse_separator: "",
                plant_id: "",
                mr_no: "",
                mi_no: "",
                reason_no: "",
                camera_used: "",
                inventory_display: false,
                report_ent: "",
                report_site: "",
                report_datetime: "",
                warehouse_no: "",
                warehouse_no_cost: "",
                workstation_no: "",
                workstation_name: "",
                machine_no: "",
                machine_name: "",
                shift_no: "",
                employee_no: "",
                employee_name: "",
                language: sys_language,
                voice: "",
                font_size: "normal",
                department_no: "",
                department_name: "",
                last_log_time: "",
                log_in: "",
                isDisplay_no: true,
                isDisplay_name: true,
                isDisplay_spec: "",
                BT_printer: "SEWOO",
                feature: "",
                valuation_unit: "",
                manage_barcode_inventory: "",
                all_1_no: "",
                all_2_no: "",
                all_3_no: "",
                warehouse_way_cost: "",
                warehouse_way: "",
                menu: "",
                qbecondition: "",
                gp_flag: false,
                condition_start_date_type: "",
                condition_start_date: "",
                basic_data_download: "",
                inventory_operation: "",
                out_in_operation: "",
                show_scan_log: false,
            };

            self.getUserInfo = function() {
                return angular.copy(self.userInfo);
            };

            self.setByWsUserInfomation = function(obj) {
                self.userInfo.employee_no = obj.employee_no;
                self.userInfo.employee_name = obj.employee_name;
                
                if (!commonService.isNull(obj.language)) {
                    self.userInfo.language = obj.language;
                }
                
                self.userInfo.department_no = obj.department_no;
                self.userInfo.department_name = obj.department_name;
                self.userInfo.report_ent = obj.enterprise_no;
                self.userInfo.report_site = obj.site_no;
                self.userInfo.log_in = 'Y';
                self.userInfo.last_log_time = new Date();
                self.userInfo.report_datetime = $filter('date')(new Date(), 'yyyy-MM-dd');
                self.userInfo.manage_barcode_inventory = obj.manage_barcode_inventory || "N";
                self.userInfo.barcode_separator = obj.barcode_separator || "%";
                self.userInfo.warehouse_separator = obj.warehouse_separator || "@";
                self.userInfo.feature = (obj.feature == 'Y') ? true : false;
                //是否使用計價單位 0.不使用 1.採購 2.銷售 3.兩者
                self.userInfo.valuation_unit = (angular.isUndefined(obj.valuation_unit)) ? "0" : obj.valuation_unit || "0";
            };

            self.setServer = function(obj) {
                if (!commonService.isEquality(self.userInfo.server_ip, obj.server_ip) ||
                    !commonService.isEquality(self.userInfo.server_area, obj.server_area) ||
                    !commonService.isEquality(self.userInfo.server_product, obj.server_product)) {
                    self.userInfo.report_datetime = "";
                }
                self.userInfo.server_ip = obj.server_ip;
                self.userInfo.server_area = obj.server_area;
                self.userInfo.server_product = obj.server_product;
                self.userInfo.permission_ip = obj.permission_ip;
                return self.userInfo;
            };

            self.setAccount = function(obj) {
                self.userInfo.account = obj.account;
                self.userInfo.enterprise_no = obj.enterprise;
                self.userInfo.site_no = obj.site;
                return self.userInfo;
            };

            self.setUserInfo = function(obj) {
                self.userInfo.account = obj.account || "";
                self.userInfo.enterprise_no = obj.enterprise_no || "";
                self.userInfo.site_no = obj.site_no || "";
                self.userInfo.server_ip = obj.server_ip || "";
                self.userInfo.server_area = obj.server_area || "";
                self.userInfo.server_product = obj.server_product || "";
                self.userInfo.permission_ip = obj.permission_ip || "";
                self.userInfo.barcode_repeat = obj.barcode_repeat || "";
                self.userInfo.barcode_separator = obj.barcode_separator || "%";
                self.userInfo.warehouse_separator = obj.warehouse_separator || "@";
                self.userInfo.plant_id = obj.plant_id || "";
                self.userInfo.mr_no = obj.mr_no || "";
                self.userInfo.mi_no = obj.mi_no || "";
                self.userInfo.reason_no = obj.reason_no || "";
                self.userInfo.camera_used = obj.camera_used || "";
                self.userInfo.inventory_display = angular.isUndefined(obj.inventory_display) ? false : !!obj.inventory_display;
                self.userInfo.report_ent = obj.report_ent || "";
                self.userInfo.report_site = obj.report_site || "";
                self.userInfo.report_datetime = obj.report_datetime || "";
                self.userInfo.warehouse_no = obj.warehouse_no || "";
                self.userInfo.warehouse_no_cost = obj.warehouse_no_cost || "";
                self.userInfo.workstation_no = obj.workstation_no || "";
                self.userInfo.workstation_name = obj.workstation_name || "";
                self.userInfo.machine_no = obj.machine_no || "";
                self.userInfo.machine_name = obj.machine_name || "";
                self.userInfo.shift_no = obj.shift_no || "";
                self.userInfo.employee_no = obj.employee_no || "";
                self.userInfo.employee_name = obj.employee_name || "";
                self.userInfo.language = obj.language || "";
                self.userInfo.voice = obj.voice || "alert";
                self.userInfo.font_size = obj.font_size || "";
                self.userInfo.department_no = obj.department_no || "";
                self.userInfo.department_name = obj.department_name || "";
                self.userInfo.last_log_time = obj.last_log_time || "";
                self.userInfo.log_in = obj.log_in || "";
                self.userInfo.isDisplay_no = angular.isUndefined(obj.isDisplay_no) ? true : !!obj.isDisplay_no;
                self.userInfo.isDisplay_name = angular.isUndefined(obj.isDisplay_name) ? true : !!obj.isDisplay_name;
                self.userInfo.isDisplay_spec = angular.isUndefined(obj.isDisplay_spec) ? false : !!obj.isDisplay_spec;
                self.userInfo.BT_printer = obj.BT_printer || "SEWOO";
                self.userInfo.feature = obj.feature;
                self.userInfo.valuation_unit = obj.valuation_unit;
                self.userInfo.manage_barcode_inventory = obj.manage_barcode_inventory || "";
                self.userInfo.all_1_no = obj.all_1_no || "";
                self.userInfo.all_2_no = obj.all_2_no || "";
                self.userInfo.all_3_no = obj.all_3_no || "";
                self.userInfo.warehouse_way_cost = obj.warehouse_way_cost || "";
                self.userInfo.warehouse_way = obj.warehouse_way || "";
                self.userInfo.lot_auto = angular.isUndefined(obj.lot_auto) ? "" : obj.lot_auto;
                self.userInfo.condition_start_date_type = obj.condition_start_date_type || 3;
                self.userInfo.condition_start_date = obj.condition_start_date || "";
                self.userInfo.basic_data_download = obj.basic_data_download || 900;
                self.userInfo.inventory_operation = obj.inventory_operation || 1800;
                self.userInfo.out_in_operation = obj.out_in_operation || 30;
                self.userInfo.show_scan_log = angular.isUndefined(obj.show_scan_log) ? false : !!obj.show_scan_log;

                checkUserInfo();
                return self.userInfo;
            };

            self.setUserInfoByConf = function(data) {
                self.userInfo.account = commonService.getConfValue(data, 'account');
                self.userInfo.enterprise_no = commonService.getConfValue(data, 'enterprise_no');
                self.userInfo.site_no = commonService.getConfValue(data, 'site_no');
                self.userInfo.server_ip = commonService.getConfValue(data, 'server_ip');
                self.userInfo.server_area = commonService.getConfValue(data, 'server_area');
                self.userInfo.server_product = commonService.getConfValue(data, 'server_product');
                self.userInfo.permission_ip = commonService.getConfValue(data, 'permission_ip');
                self.userInfo.barcode_repeat = commonService.getConfValue(data, 'barcode_repeat');
                self.userInfo.barcode_separator = commonService.getConfValue(data, 'barcode_separator');
                self.userInfo.warehouse_separator = commonService.getConfValue(data, 'warehouse_separator');
                self.userInfo.plant_id = commonService.getConfValue(data, 'plant_id');
                self.userInfo.mr_no = commonService.getConfValue(data, 'mr_no');
                self.userInfo.mi_no = commonService.getConfValue(data, 'mi_no');
                self.userInfo.reason_no = commonService.getConfValue(data, 'reason_no');
                self.userInfo.camera_used = commonService.getConfValue(data, 'camera_used');
                self.userInfo.inventory_display = commonService.getConfValue(data, 'inventory_display');
                self.userInfo.report_ent = commonService.getConfValue(data, 'report_ent');
                self.userInfo.report_site = commonService.getConfValue(data, 'report_site');
                self.userInfo.report_datetime = commonService.getConfValue(data, 'report_datetime');
                self.userInfo.warehouse_no = commonService.getConfValue(data, 'warehouse_no');
                self.userInfo.warehouse_no_cost = commonService.getConfValue(data, 'warehouse_no_cost');
                self.userInfo.workstation_no = commonService.getConfValue(data, 'workstation_no');
                self.userInfo.workstation_name = commonService.getConfValue(data, 'workstation_name');
                self.userInfo.machine_no = commonService.getConfValue(data, 'machine_no');
                self.userInfo.machine_name = commonService.getConfValue(data, 'machine_name');
                self.userInfo.shift_no = commonService.getConfValue(data, 'shift_no');
                self.userInfo.employee_no = commonService.getConfValue(data, 'employee_no');
                self.userInfo.employee_name = commonService.getConfValue(data, 'employee_name');
                self.userInfo.language = commonService.getConfValue(data, 'language');
                self.userInfo.voice = commonService.getConfValue(data, 'voice');
                self.userInfo.font_size = commonService.getConfValue(data, 'font_size');
                self.userInfo.department_no = commonService.getConfValue(data, 'department_no');
                self.userInfo.department_name = commonService.getConfValue(data, 'department_name');
                self.userInfo.last_log_time = commonService.getConfValue(data, 'last_log_time');
                self.userInfo.log_in = commonService.getConfValue(data, 'log_in');
                self.userInfo.isDisplay_no = commonService.getConfValue(data, 'isDisplay_no');
                self.userInfo.isDisplay_name = !!commonService.getConfValue(data, 'isDisplay_name');
                self.userInfo.isDisplay_spec = !!commonService.getConfValue(data, 'isDisplay_spec');
                self.userInfo.BT_printer = commonService.getConfValue(data, 'BT_printer');
                self.userInfo.feature = commonService.getConfValue(data, 'feature');
                self.userInfo.valuation_unit = commonService.getConfValue(data, 'valuation_unit');
                self.userInfo.manage_barcode_inventory = commonService.getConfValue(data, 'manage_barcode_inventory');
                self.userInfo.all_1_no = commonService.getConfValue(data, 'all_1_no');
                self.userInfo.all_2_no = commonService.getConfValue(data, 'all_2_no');
                self.userInfo.all_3_no = commonService.getConfValue(data, 'all_3_no');
                self.userInfo.warehouse_way_cost = commonService.getConfValue(data, 'warehouse_way_cost');
                self.userInfo.warehouse_way = commonService.getConfValue(data, 'warehouse_way');
                self.userInfo.condition_start_date_type = commonService.getConfValue(data, 'condition_start_date_type');
                self.userInfo.condition_start_date = commonService.getConfValue(data, 'condition_start_date');
                self.userInfo.lot_auto = commonService.getConfValue(data, 'lot_auto');
                self.userInfo.basic_data_download = commonService.getConfValue(data, 'basic_data_download') || 900;
                self.userInfo.inventory_operation = commonService.getConfValue(data, 'inventory_operation') || 1800;
                self.userInfo.out_in_operation = commonService.getConfValue(data, 'out_in_operation') || 30;
                self.userInfo.menu = [];
                try {
                    self.userInfo.menu = JSON.parse(commonService.getConfValue(data, 'menu'));
                } catch (e) {
                    console.log(e);
                    self.userInfo.menu = commonService.getConfValue(data, 'menu');
                }
                self.userInfo.qbecondition = [];
                try {
                    self.userInfo.qbecondition = JSON.parse(commonService.getConfValue(data, 'qbecondition'));
                    var l_data = {
                        bcae005: "", //出入庫瑪
                        bcae006: "", //作業代號
                        bcae014: "",
                        bcae015: "", //A開立新單/S過賬/Y確認
                    };
                    if (self.userInfo.qbecondition.length > 0) {
                        for (var i = 0; i < self.userInfo.condition.length; i++) {
                            var element = self.userInfo.condition[i];
                            element.isdefault = false;
                        }
                        APIBridge.callAPI('qbecondition_upd', [l_data, self.userInfo.qbecondition]).then(function(result) {}, function(result) {
                            console.log("saveCondition fail");
                            console.log(result);
                        });
                    }
                } catch (e) {
                    console.log(e);
                }
                checkUserInfo();
                return self.userInfo;
            };

            var checkUserInfo = function() {

                if (angular.isString(self.userInfo.lot_auto)) {
                    if (self.userInfo.server_product == 'E10') {
                        self.userInfo.lot_auto = true;
                    } else {
                        self.userInfo.lot_auto = false;
                    }
                }

                switch (self.userInfo.server_product) {
                    case 'T100':
                        self.userInfo.lot_length = 30;
                        break;
                    case 'WF':
                        self.userInfo.lot_length = 20;
                        break;
                    case 'TOPGP51':
                    case 'TOPGP53':
                    case 'TOPGP525':
                    case 'TOPGPST':
                        self.userInfo.lot_length = 24;
                        break;
                    default:
                        self.userInfo.lot_length = 30;
                }

                self.userInfo.gp_flag = (self.userInfo.server_product.indexOf("TOPGP") != '-1');

                if (self.userInfo.server_product == 'T100' || self.userInfo.gp_flag) {
                    self.userInfo.enterprise_no = Number(self.userInfo.enterprise_no);
                    self.userInfo.report_ent = Number(self.userInfo.report_ent);
                }

                if (commonService.isNull(self.userInfo.language)) {
                    self.userInfo.language = sys_language;
                }

                if (commonService.isNull(self.userInfo.voice)) {
                    self.userInfo.voice = "alert";
                }

                if (commonService.isNull(self.userInfo.font_size)) {
                    self.userInfo.font_size = "normal";
                }

            };

            self.setWarehouse = function(array) {
                self.warehouse = array;
                setwarehouseIndex();
            };

            var setwarehouseIndex = function() {
                var str = "{";
                var length = self.warehouse.length;
                angular.forEach(self.warehouse, function(value, key) {
                    var warehouse_no = value.warehouse_no;
                    str = str + "\"" + warehouse_no + "\"" + ":" + key;
                    if ((length - 1) !== key) {
                        str = str + ",";
                    }
                });
                str = str + "}";
                self.warehouseIndex = JSON.parse(str);

                //檢查預設倉儲是否存在SITE
                var index = self.warehouseIndex[self.userInfo.warehouse_no];
                if (angular.isUndefined(index)) {
                    self.userInfo.warehouse_no = "";
                }
            };
            self.setStorageSpaces = function(array) {
                self.storageSpaces = array;
            };

            self.setBasicConfig = function(userInfo) {
                var parameter = [{
                    key: "account",
                    value: userInfo.account || ""
                }, {
                    key: "enterprise_no",
                    value: userInfo.enterprise_no || ""
                }, {
                    key: "site_no",
                    value: userInfo.site_no || ""
                }, {
                    key: "server_ip",
                    value: userInfo.server_ip || ""
                }, {
                    key: "server_area",
                    value: userInfo.server_area || ""
                }, {
                    key: "server_product",
                    value: userInfo.server_product || ""
                }, {
                    key: "permission_ip",
                    value: userInfo.permission_ip || ""
                }, {
                    key: "barcode_repeat",
                    value: userInfo.barcode_repeat || ""
                }, {
                    key: "barcode_separator",
                    value: userInfo.barcode_separator || ""
                }, {
                    key: "warehouse_separator",
                    value: userInfo.warehouse_separator || ""
                }, {
                    key: "plant_id",
                    value: userInfo.plant_id || ""
                }, {
                    key: "mr_no",
                    value: userInfo.mr_no || ""
                }, {
                    key: "mi_no",
                    value: userInfo.mi_no || ""
                }, {
                    key: "reason_no",
                    value: userInfo.reason_no || ""
                }, {
                    key: "camera_used",
                    value: userInfo.camera_used || ""
                }, {
                    key: "lot_auto",
                    value: userInfo.lot_auto || ""
                }, {
                    key: "inventory_display",
                    value: userInfo.inventory_display || ""
                }, {
                    key: "report_ent",
                    value: userInfo.report_ent || ""
                }, {
                    key: "report_site",
                    value: userInfo.report_site || ""
                }, {
                    key: "report_datetime",
                    value: userInfo.report_datetime || ""
                }, {
                    key: "employee_no",
                    value: userInfo.employee_no || ""
                }, {
                    key: "employee_name",
                    value: userInfo.employee_name || ""
                }, {
                    key: "language",
                    value: userInfo.language || ""
                }, {
                    key: "voice",
                    value: userInfo.voice || ""
                }, {
                    key: "font_size",
                    value: userInfo.font_size || ""
                }, {
                    key: "department_no",
                    value: userInfo.department_no || ""
                }, {
                    key: "department_name",
                    value: userInfo.department_name || ""
                }, {
                    key: "last_log_time",
                    value: userInfo.last_log_time || ""
                }, {
                    key: "log_in",
                    value: userInfo.log_in || ""
                }, {
                    key: "BT_printer",
                    value: userInfo.BT_printer || ""
                }, {
                    key: "feature",
                    value: userInfo.feature || ""
                }, {
                    key: "valuation_unit",
                    value: userInfo.valuation_unit || ""
                }, {
                    key: "manage_barcode_inventory",
                    value: userInfo.manage_barcode_inventory || ""
                }, {
                    key: "isDisplay_no",
                    value: userInfo.isDisplay_no || ""
                }, {
                    key: "isDisplay_name",
                    value: userInfo.isDisplay_name || ""
                }, {
                    key: "isDisplay_spec",
                    value: userInfo.isDisplay_spec || ""
                }, {
                    key: "warehouse_no",
                    value: userInfo.warehouse_no || ""
                }, {
                    key: "workstation_no",
                    value: userInfo.workstation_no || ""
                }, {
                    key: "workstation_name",
                    value: userInfo.workstation_name || ""
                }, {
                    key: "machine_no",
                    value: userInfo.machine_no || ""
                }, {
                    key: "machine_name",
                    value: userInfo.machine_name || ""
                }, {
                    key: "shift_no",
                    value: userInfo.shift_no || ""
                }, {
                    key: "all_1_no",
                    value: userInfo.all_1_no || ""
                }, {
                    key: "all_2_no",
                    value: userInfo.all_2_no || ""
                }, {
                    key: "all_3_no",
                    value: userInfo.all_3_no || ""
                }, {
                    key: "warehouse_way_cost",
                    value: userInfo.warehouse_way_cost || ""
                }, {
                    key: "warehouse_way",
                    value: userInfo.warehouse_way || ""
                }, {
                    key: "condition_start_date_type",
                    value: userInfo.condition_start_date_type || ""
                }, {
                    key: "condition_start_date",
                    value: userInfo.condition_start_date || ""
                }, {
                    key: "basic_data_download",
                    value: userInfo.basic_data_download || ""
                }, {
                    key: "inventory_operation",
                    value: userInfo.inventory_operation || ""
                }, {
                    key: "out_in_operation",
                    value: userInfo.out_in_operation || ""
                }, {
                    key: "warehouse",
                    value: userInfo.warehouse || ""
                }, {
                    key: "storageSpaces",
                    value: userInfo.storageSpaces || ""
                }, {
                    key: "menu",
                    value: userInfo.menu || ""
                }, {
                    key: "qbecondition",
                    value: userInfo.qbecondition || ""
                }];
                APIBridge.callAPI('setConfig', parameter).then(function(result) {
                    var str = JSON.stringify(result);
                    console.log(str);
                }, function(result) {
                    // errorpop('setConfig fail');
                    console.log('setConfig fail');
                });
            };

            /***********************************************************************************************************************
             * Descriptions...: 取得聲音套件
             * Usage..........: getVoice(content.func)
             * Input parameter: content   內容
             *                : func      點選確認後執行的FUNCTION
             * Return code....: 無
             * Modify.........: 20170911 By lyw
             ***********************************************************************************************************************/
            self.getVoice = function(content, func) {
                if (commonService.Platform == "Chrome") {
                    IonicPopupService.errorAlert(content).then(func);
                    return;
                }
                if (!commonService.isNull(self.userInfo.voice) && self.userInfo.voice != "novoice") {
                    APIBridge.callAPI('VoiceUtils', [{
                        "someone": self.userInfo.voice,
                        "content": content
                    }]).then(function(result) {
                        IonicPopupService.errorAlert(content).then(func);
                    }, function(result) {
                        IonicPopupService.errorAlert(content).then(func);
                    });
                } else {
                    IonicPopupService.errorAlert(content).then(func);
                }
            };

            /***********************************************************************************************************************
             * Descriptions...: 設定APP名稱及版本號
             * Usage..........: setAppInfo(obj)
             * Input parameter: obj   
             *                :     app_name      APP名稱
             *                :     app_version   APP版本號
             * Return code....: 無
             * Modify.........: 20170911 By lyw
             ***********************************************************************************************************************/
            self.setAppInfo = function(obj) {
                self.app_name = obj.app_name;
                self.app_version = obj.app_version;
            };

            /***********************************************************************************************************************
             * Descriptions...: 修改APP標題
             * Usage..........: changeTitle(arg)
             * Input parameter: arg     參數
             *                :     1.      APP名稱 + 版本號
             *                :     2.      APP名稱 + 版本號 + SITE
             *                :     其他.   作業名稱 + SITE
             * Return code....: 無
             * Modify.........: 20170911 By lyw
             ***********************************************************************************************************************/
            self.changeTitle = function(arg) {
                var titile = "";
                switch (arg) {
                    case 1:
                        title = self.app_name + " " + self.app_version;
                        break;
                    case 2:
                        title = self.app_name + " " + self.app_version + "（" + self.userInfo.site_no + "）";
                        break;
                    default:
                        title = arg + "（" + self.userInfo.site_no + "）";
                        break;
                }

                APIBridge.callAPI('changeTitle', [{
                    "title": title
                }]);
            };

            return self;
        }
    ]);
});