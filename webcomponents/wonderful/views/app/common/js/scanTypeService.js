define(["app", "API", "APIS"], function(app) {
    app.service('scanTypeService', ['APIService', '$timeout', 'IonicPopupService',
        function(APIService, $timeout, IonicPopupService) {

            var self = this;

            //掃描類型：1. 單據條碼  2. 組合條碼  3. 條碼(批次條碼、箱條碼)
            //當單據可能為1.單據條碼 或 2. 組合條碼，才會使用到此function

            /***********************************************************************************************************************
             * Descriptions...: 解析掃描類型     1. 單據條碼  2. 組合條碼 
             *                :    目前使用到的單據
             *                :       (1) 發料[單據](7-1A)
             * Usage..........: judgmentScanType(scanning, barcode_separator)
             * Input parameter: scanning              條碼
             *                : barcode_separator     條碼分隔符
             * Return code....: scan_type             條碼類型
             * Modify.........: 20170911 By lyw
             ***********************************************************************************************************************/
            self.judgmentScanType = function(scanning, barcode_separator) {

                var scan_type = "1";
                var index = scanning.indexOf(barcode_separator);
                if (index != -1) {
                    scan_type = "2";
                }
                return scan_type;
            };

            return self;
        }
    ]);
});
