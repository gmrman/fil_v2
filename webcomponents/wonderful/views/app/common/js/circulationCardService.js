define(["app", "API", "APIS"], function(app) {
    app.service('circulationCardService', ['APIService', '$timeout', 'IonicPopupService',
        function(APIService, $timeout, IonicPopupService) {

            var self = this;

            /***********************************************************************************************************************
             * Descriptions...: 解析流轉卡
             *                : 將流轉卡依照條碼分隔符分割為 單號、Run Card 、項次
             * Usage..........: checkCirculationCard(scanning,barcode_separator)
             * Input parameter: scanning                 條碼
             *                : barcode_separator        條碼分隔符
             * Return code....: obj                      物件
             *                :   doc_no                    單號
             *                :   run_card_no               Run Card
             *                :   seq                       項次
             * Modify.........: 20170911 By lyw
             ***********************************************************************************************************************/
            self.checkCirculationCard = function(scanning, barcode_separator) {

                if (!barcode_separator) {
                    barcode_separator = "%";
                }
                var obj = {
                    doc_no: "",
                    run_card_no: "",
                    seq: ""
                };

                var barcode_separator_length = barcode_separator.length;
                var str = scanning;
                var index_1 = str.indexOf(barcode_separator);
                var index_2 = str.indexOf(barcode_separator, index_1 + barcode_separator_length);
                obj.doc_no = str.slice(0, index_1);
                if (index_2 != -1) {
                    obj.run_card_no = str.slice(index_1 + barcode_separator_length, index_2);
                    obj.seq = str.slice(index_2 + barcode_separator_length);
                } else {
                    obj.run_card_no = str.slice(index_1 + barcode_separator_length);
                    obj.seq = "";
                }
                console.log(obj);
                return obj;
            };

            /***********************************************************************************************************************
             * Descriptions...: 解析倉庫卡
             *                : 將倉庫卡依照倉庫分隔符分割為 庫位、儲位
             * Usage..........: checkWarehouseCard(scanning,warehouse_separator)
             * Input parameter: scanning                 條碼
             *                : warehouse_separator      倉庫分隔符
             * Return code....: obj                      物件
             *                :   warehouse_no               庫位
             *                :   storage_spaces_no          儲位
             * Modify.........: 20170911 By lyw
             ***********************************************************************************************************************/
            self.checkWarehouseCard = function(scanning, warehouse_separator) {

                if (!warehouse_separator) {
                    warehouse_separator = "@";
                }
                var obj = {
                    warehouse_no: "",
                    storage_spaces_no: ""
                };

                var barcode_separator_length = warehouse_separator.length;
                var str = scanning;
                var index = str.indexOf(warehouse_separator);
                obj.warehouse_no = str.slice(0, index);
                if (index != -1) {
                    obj.storage_spaces_no = str.slice(index + barcode_separator_length);
                } else {
                    obj.storage_spaces_no = "";
                }
                console.log(obj);
                return obj;
            };

            return self;
        }
    ]);
});
