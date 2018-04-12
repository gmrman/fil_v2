define(["app", "API", "APIS"], function(app) {
    app.service('fil_24_requisition', ['APIService', '$timeout',
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
              for(var x=0 ;x<value.receipt_list.length;x++){
                value.receipt_list[x].result_type = 'Y';
              }
                self.data = value;
                console.log("data", self.data);
                self.items = value.receipt_list;

            };

            self.getMainData = function() {
                return self.data;
            };
            self.updData = function(mainData,data){
              angular.forEach(mainData.receipt_list,function(value){
                if(value.item_no == data.item_no && value.seq == data.seq){
                  value = angular.copy(data);
                }
              });
              self.data = mainData;
              self.items = mainData.receipt_list;
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

            //不良原因
            self.setBad = function(index) {
                self.qc_list_bad = index;
            };

            self.getBad = function() {
                return self.qc_list_bad;
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
