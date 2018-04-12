define(["app", "API", "APIS"], function(app) {
    app.service('commonService', ['$filter', function($filter) {

        var self = this;
        self.page_params = {};
        self.slectIndex = 0;

        /***********************************************************************************************************************
         * Descriptions...: 判斷平台屬性
         * Usage..........:
         * Input parameter:
         * Return code....:
         * Modify.........: 20170911 By lyw
         ***********************************************************************************************************************/
        self.Platform = (function() { //平台属性
            var platform = "";
            if (/android/i.test(navigator.userAgent)) {
                platform = "Android";
                console.log("This is Android'browser.");
            } else if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
                platform = "IOS";
                console.log("This is iOS'browser.");
            } else if (/MicroMessenger/i.test(navigator.userAgent)) {
                platform = "微信预览器";
                console.log("This is MicroMessenger'browser.");
            } else if (/Chrome/i.test(navigator.userAgent)) {
                platform = "Chrome";
                console.log("This is Chrome'browser.");
            } else {
                platform = navigator.userAgent;
                console.log(platform);
            }
            return platform;
        })();

        /***********************************************************************************************************************
         * Descriptions...: 判斷是否為空
         * Usage..........: isNull(arg)
         * Input parameter: arg                     變數
         * Return code....: true / false
         * Modify.........: 20170911 By lyw
         ***********************************************************************************************************************/
        self.isNull = function(arg) {
            return !(angular.isNumber(arg) || (angular.isString(arg) && arg.trim().length > 0));
        };

        /***********************************************************************************************************************
         * Descriptions...: 判斷是否相等
         * Usage..........: isEquality(arg1,arg2)
         * Input parameter: arg1                     變數1
         *                : arg2                     變數2
         * Return code....: true / false
         * Modify.........: 20170911 By lyw
         ***********************************************************************************************************************/
        self.isEquality = function(arg1, arg2) {
            if (self.isNull(arg1)) {
                arg1 = "";
            }
            if (self.isNull(arg2)) {
                arg2 = "";
            }
            return arg1.toString().trim() === arg2.toString().trim();
        };

        /***********************************************************************************************************************
         * Descriptions...: 取得日期字串
         * Usage..........: getCurrent(type)
         * Input parameter: type                     日期格式型態
         *                :    1(default)                yyyy-MM-dd HH:mm:ss
         *                :    2                         yyyyMMddHHmmsssss
         * Return code....: str                      日期字串
         * Modify.........: 20170911 By lyw
         ***********************************************************************************************************************/
        self.getCurrent = function(type) {
            var d = new Date();
            var str = "";
            switch (type) {
                case 2:
                    str = $filter('date')(d, 'yyyyMMddHHmmss') + $filter('date')(d, 'sss');
                    break;
                case 3:
                    str = $filter('date')(d, 'yyyy/MM/dd');
                    break;
                case 4:
                    str = $filter('date')(d, 'HH:mm');
                    break;
                case 5:
                    str = $filter('date')(d, 'yyyy-MM-dd HH:mm:ss') + "." + $filter('date')(d, 'sss');
                    break;
                default:
                    str = $filter('date')(d, 'yyyy-MM-dd HH:mm:ss');
            }
            console.log('date = ', str);
            return str;
        };

        self.getFilter = function(data, name) {
            var newArr = [];
            newArr = data.filter(function(item) {
                return item.key === name;
            });
            return newArr;
        };

        self.getConfValue = function(data, name) {
            var value = self.getFilter(data, name).length > 0 ? self.getFilter(data, name)[0].value : "";
            return value;
        };

        /***********************************************************************************************************************
         * Descriptions...: 設定跳頁參數
         * Usage..........: set_page_params(obj)
         * Input parameter: obj                       跳頁參數
         *                :    mod                        模組
         *                :    func                       作業
         *                :    program_job_no             作業編號
         *                :    status                     執行動作
         *                :    scan_type                  掃描類型
         *                :    upload_scan_type           有無箱條碼
         *                :    in_out_no                  出入庫碼
         *                :    doc_array                  單據陣列
         *                :    warehouse_no               倉庫
         *                :    storage_spaces_no          儲位
         *                :    lot_no                     批號
         *                :    barcode_no                 條碼
         *                :    info_id                    傳輸日期
         *                : account                   使用者帳號
         * Return code....: 無
         * Modify.........: 20170911 By lyw
         ***********************************************************************************************************************/
        self.set_page_params = function(obj, account) {
            var init_doc_array = [{
                "doc_no": "",
                "seq": "",
            }];
            var d = new Date();
            var l_info_id = self.getCurrent(2) + "_" + account;
            self.page_params = {
                "mod": obj.mod,
                "func": obj.func,
                "name": obj.name,
                "program_job_no": obj.program_job_no,
                "status": obj.status,
                "scan_type": obj.scan_type,
                "upload_scan_type": obj.upload_scan_type,
                "in_out_no": obj.in_out_no,
                "doc_array": obj.doc_array || init_doc_array,
                "warehouse_no": obj.warehouse_no || "",
                "storage_spaces_no": obj.storage_spaces_no || "",
                "lot_no": obj.lot_no || "",
                "barcode_no": obj.barcode_no || "",
                "info_id": obj.info_id || angular.copy(l_info_id),
                "print_doc_array": []
            };
        };

        self.get_page_params = function(obj) {
            return angular.copy(self.page_params);
        };

        self.set_page_doc_array = function(array) {
            self.page_params.doc_array = array || [];
        };

        self.push_page_doc_array = function(arg) {
            self.page_params.doc_array.unshift(arg);
        };

        self.set_page_warehouse_no = function(arg) {
            self.page_params.warehouse_no = arg;
        };

        self.set_page_storage_spaces_no = function(arg) {
            self.page_params.storage_spaces_no = arg;
        };

        self.set_page_lot_no = function(arg) {
            self.page_params.lot_no = arg;
        };

        self.set_page_info_id = function(arg) {
            self.page_params.info_id = arg;
        };

        self.set_page_print_doc_array = function(array) {
            self.page_params.print_doc_array = array || [];
        };

        self.clear_page_print_doc_array = function() {
            self.page_params.print_doc_array = [];
        };


        self.clear_page_params = function() {
            self.page_params = {};
        };

        return self;
    }]);
});