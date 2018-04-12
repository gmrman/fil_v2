define(["app", "API", "APIS"], function(app) {
    app.service('fil_23_requisition', ['APIService', '$timeout',
        function(APIService, $timeout) {

            var self = this;
            self.init = function() {
                self.data = {};
                self.items = [];
                self.test_qty = 0;
                self.qc_list_quedian = {};
                self.qc_list_celiang = {};
                self.item = [];
                self.result_type = 'p';
            };
            self.init();

            var getIndex = function(val, context, flag) {
                flag = flag || 0;
                for (var i = 0; i < context.length; i++) {
                    if (flag === 0) {
                        if (context[i].seq == val) {
                            return i;
                        }
                    } else {
                        if (context[i].qc_seq == val) {
                            return i;
                        }
                    }
                }
                return -1;
            };

            self.getData = function() {
                return self.data;
            };

            self.getItems = function() {
                return self.items;
            };

            self.setMainData = function(value) {
                self.data = value;
                console.log("data", self.data);
                self.items = value.receipt_list;
                // angular.forEach(self.items,function(item){

                // })
            };

            self.getMainData = function() {
                return self.data;
            };

            self.getList = function(seq, context) {
                var index = getIndex(seq, context);
                return context[index];
            };

            self.setReason = function(seq, qc_seq, value) {
                var item = self.getList(seq, self.items),
                    result = self.getList(qc_seq, item);
                result.reason_list = value;
            };

            self.getReason = function(seq, qc_seq) {
                var item = self.getList(seq, self.items);
                return self.getList(qc_seq, item);
            };

            self.setAttrib = function(seq, qc_seq, value) {
                var item = self.getList(seq, self.items),
                    result = self.getList(qc_seq, item);
                result.attrib_list = value;
            };

            //IQC资料维护
            self.setInfocheck = function(index) {
                self.item = index;
            };

            self.getInfocheck = function() {
                return self.item;
            };

            //Test_qty
            self.setTest_qty = function(index) {
                self.test_qty = index;
            };

            self.getTest_qty = function() {
                return self.test_qty;
            };

            //缺点原因
            self.setQuedian = function(index) {
                self.qc_list_quedian = index;
            };

            self.getQuedian = function() {
                return self.qc_list_quedian;
            };

            //测量值
            self.setCeliang = function(index) {
                self.qc_list_celiang = index;
            };

            self.getCeliang = function() {
                return self.qc_list_celiang;
            };

            //判定状态
            self.setResult_type = function(index) {
                self.result_type = index;
            };

            self.getResult_type = function() {
                return self.result_type;
            };

            return self;
        }
    ]);
});
