define(["app"], function(app) {
    app.service('fil_14_requisition', [function() {

        var self = this;
        self.init = function() {
            self.parameter = {
                counting_type: "1",
                plan_no: "",
                label_no: "",
                warehouse_no: "",
                storage_management: "N",
                storage_spaces_no: "",
                item_no: "",
                has_list: false,
            };
            self.check_list = [];
        };
        self.init();

        self.getParams = function() {
            return angular.copy(self.parameter);
        };

        self.setParams = function(obj) {
            self.parameter.counting_type = obj.counting_type;
            self.parameter.plan_no = obj.plan_no;
            self.parameter.label_no = obj.label_no;
            self.parameter.warehouse_no = obj.warehouse_no;
            self.parameter.storage_management = obj.storage_management;
            self.parameter.storage_spaces_no = obj.storage_spaces_no;
            self.parameter.item_no = obj.item_no;
            self.parameter.has_list = obj.has_list;
        };

        self.setCheckList = function(array) {
            self.check_list = array || [];
        };

        return self;
    }]);
});
