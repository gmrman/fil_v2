define(["app", "API", "APIS", "array"], function(app) {
    app.service('ReqTestData', [function() {

        var self = this;
        self.testData = false;

        self.getServer = function(params, url, timeout_seconds, success, fail) {
            try {
                success = success || function(result) {};
                fail = fail || function(fail) {};
                var paramStr = angular.toJson(params.param);
                console.log('Web_Post参数:' + paramStr);
                var result = {};
                var response = "";
                var flag = true;
                var parameter = params.param.payload.std_data.parameter;
                switch (params.param.service.name) {
                    case "log.infomation.get":
                        response = self.log_infomation_get(parameter);
                        break;
                    case "user.storage.infomation.get":
                        response = self.user_storage_infomation_get(parameter);
                        break;
                    case "app.todo.notice.get":
                        response = self.app_todo_notice_get(parameter);
                        break;
                    case "app.todo.doc.get":
                        response = self.app_todo_doc_get(parameter);
                        break;
                    case "app.barcode.get":
                        response = self.app_barcode_get(parameter);
                        break;
                    case "app.doc.bc.get":
                        response = self.app_doc_bc_get(parameter);
                        break;
                    case "app.instructions.get":
                        response = self.app_instructions_get(parameter);
                        break;
                    case "app.qc.create":
                    case "app.bcscanwsupload.create":
                    case "app.packing.bc.create":
                        response = {
                            doc_no: "CTC-LB4-1209000010",
                            print_param: "2",
                        };
                        break;
                    case "app.lot.get":
                        response = self.app_lot_get(parameter);
                        break;
                    case "app.production.type.get":
                        response = self.app_production_type_get(parameter);
                        break;
                    case "app.abnormal.get":
                        response = self.app_abnormal_get(parameter);
                        break;
                    case "app.wo.process.machine.get":
                        response = self.app_wo_process_machine_get(parameter);
                        break;
                    case "app.wo.work.report.data.create":
                        response = {
                            report_no: "CTC-LB4-1209000010"
                        };
                        break;
                    case "app.bc.stock.count.data.get":
                        response = self.app_bc_stock_count_data_get(parameter);
                        break;
                    case "app.bc.stock.count.data.no2.get":
                        response = self.app_bc_stock_count_data_no2_get(parameter);
                        break;
                    case "app.report.print":
                    case "app.barcode.print":
                    case "app.handling.create":
                    case "app.bc.frozen.update":
                    case "app.stock.count.scan.upload":
                    case "app.stock.count.scan.no2.upload":
                    case "app.bc.stock.count.data.no2.check":
                        response = {};
                        break;
                    case "app.stock.data.get":
                        response = self.app_stock_data_get(parameter);
                        break;
                    case "employee.name.get":
                        response = self.employee_name_get(parameter);
                        break;
                    case "app.qc.get":
                        response = self.app_qc_get(parameter);
                        break;
                    case "app.wo.process.data.get":
                        response = self.app_wo_process_data_get(parameter);
                        break;
                    case "app.barcode.print.get":
                        response = self.app_barcode_print_get(parameter);
                        break;
                    case "app.reason.code.get":
                        response = self.app_reason_code_get(parameter);
                        break;
                    case "app.doc.status.get":
                        flag = false;
                        response = "此單號不存在！";
                        break;
                    case "department.data.get":
                        response = self.department_data_get(parameter);
                        break;
                    case "app.packing.bc.get":
                        response = self.app_packing_bc_get(parameter);
                        break;
                    case "app.print.get":
                        response = self.app_print_get(parameter);
                        break;
                    case "app.doc.slip.get":
                        response = self.app_doc_slip_get(parameter);
                        break;
                    case "app.dispatch.get":
                        response = self.app_dispatch_get(parameter);
                        break;
                    case "app.workstation.get":
                        response = self.app_workstation_get(parameter);
                        break;
                    case "app.machine.get":
                        response = self.app_machine_get(parameter);
                        break;
                    default:
                        flag = false;
                        response = "體驗帳號資料錯誤！";
                }

                if (flag) {
                    result = {
                        "payload": {
                            "std_data": {
                                "parameter": response
                            }
                        }
                    };
                    success(result, paramStr);
                } else {
                    result = {
                        "payload": {
                            "std_data": {
                                "execution": {
                                    "code": "400",
                                    "sql_code": "",
                                    "description": response,
                                }
                            }
                        }
                    };
                    fail(result, paramStr);
                }
            } catch (e) {
                console.error(e);
            }
        };

        self.app_machine_get = function(parameter) {
            var machine = "[{\"machine_no\":\"YS-003\",\"machine_name\":\"測試機器3\"},{\"machine_no\":\"YS-002\",\"machine_name\":\"測試機器2\"},{\"machine\":\"YS-001\",\"machine_name\":\"測試機器1\"}]";
            machine = JSON.parse(machine);
            return {
                "machine_detail": machine,
            };
        };

        self.app_workstation_get = function(parameter) {
            var workstation = "[{\"workstation_no\":\"T001\",\"workstation_name\":\"T001工作站\"},{\"workstation_no\":\"T002\",\"workstation_name\":\"T002工作站\"}]";
            workstation = JSON.parse(workstation);
            return {
                "workstation_detail": workstation,
            };
        };

        self.app_dispatch_get = function(parameter) {
            return {
                "dispatch_detail": [{
                    "enterprise_no": 99,
                    "site_no": "DSCTC",
                    "doc_no": "CTC-LB4-160900000002",
                    "plot_no": "900",
                    "item_no": "02013P02",
                    "item_feature_no": "red",
                    "item_name": "02013P02品名",
                    "item_spec": "02013P02規格",
                    "workstation_no": "AAA",
                    "workstation_name": "AAA工作站",
                    "machine_no": "BB",
                    "machine_name": "BB機台",
                    "qty": "100",
                    "dispatch_date": "2018/01/15",
                    "dispatch_time": "07:59",
                }, {
                    "enterprise_no": 99,
                    "site_no": "DSCTC",
                    "doc_no": "CTC-LB4-160900000003",
                    "plot_no": "800",
                    "item_no": "02013P02",
                    "item_feature_no": "red",
                    "item_name": "02013P02品名",
                    "item_spec": "02013P02規格",
                    "workstation_no": "AAA",
                    "workstation_name": "AAA工作站",
                    "machine_no": "BB",
                    "machine_name": "BB機台",
                    "qty": "100",
                    "dispatch_date": "2018/01/15",
                    "dispatch_time": "08:10",
                }, {
                    "enterprise_no": 99,
                    "site_no": "DSCTC",
                    "doc_no": "CTC-LB4-160900000004",
                    "plot_no": "700",
                    "item_no": "02013P02",
                    "item_feature_no": "red",
                    "item_name": "02013P02品名",
                    "item_spec": "02013P02規格",
                    "workstation_no": "AAA",
                    "workstation_name": "AAA工作站",
                    "machine_no": "BB",
                    "machine_name": "BB機台",
                    "qty": "100",
                    "dispatch_date": "2018/01/15",
                    "dispatch_time": "08:59",
                }, {
                    "enterprise_no": 99,
                    "site_no": "DSCTC",
                    "doc_no": "CTC-LB4-160900000005",
                    "plot_no": "600",
                    "item_no": "02013P02",
                    "item_feature_no": "red",
                    "item_name": "02013P02品名",
                    "item_spec": "02013P02規格",
                    "workstation_no": "AAA",
                    "workstation_name": "AAA工作站",
                    "machine_no": "BB",
                    "machine_name": "BB機台",
                    "qty": "100",
                    "dispatch_date": "2018/01/15",
                    "dispatch_time": "09:00",
                }, {
                    "enterprise_no": 99,
                    "site_no": "DSCTC",
                    "doc_no": "CTC-LB4-160900000006",
                    "plot_no": "500",
                    "item_no": "02013P02",
                    "item_feature_no": "red",
                    "item_name": "02013P02品名",
                    "item_spec": "02013P02規格",
                    "workstation_no": "AAA",
                    "workstation_name": "AAA工作站",
                    "machine_no": "BB",
                    "machine_name": "BB機台",
                    "qty": "100",
                    "dispatch_date": "2018/01/15",
                    "dispatch_time": "10:00",
                }]
            };
        };

        self.app_doc_slip_get = function(parameter) {
            return {
                "slip_detail": [{
                    "enterprise_no": 99,
                    "site_no": "DSCTC",
                    "doc_slip": "BL4",
                    "doc_slip_name": "採購單",
                }, {
                    "enterprise_no": 99,
                    "site_no": "DSCTC",
                    "doc_slip": "CK1",
                    "doc_slip_name": "收貨單",
                }, {
                    "enterprise_no": 99,
                    "site_no": "DSCTC",
                    "doc_slip": "JT5",
                    "doc_slip_name": "出通單",
                }, {
                    "enterprise_no": 99,
                    "site_no": "DSCTC",
                    "doc_slip": "VF1",
                    "doc_slip_name": "發料單",
                }, {
                    "enterprise_no": 99,
                    "site_no": "DSCTC",
                    "doc_slip": "ST1",
                    "doc_slip_name": "報廢單",
                }]
            };
        };

        self.app_print_get = function(parameter) {
            return {
                "print_detail": [{
                    "prog_no": "apmt520",
                    "prog_name": "程式名稱520",
                    "print_qty": "1",
                    "printer": "print001"
                }, {
                    "prog_no": "apmt521",
                    "prog_name": "程式名稱521",
                    "print_qty": "1",
                    "printer": "print002"
                }, {
                    "prog_no": "apmt521",
                    "prog_name": "程式名稱521",
                    "print_qty": "1",
                    "printer": "print003"
                }]
            };
        };

        self.app_packing_bc_get = function(parameter) {
            var program_job_no = parameter.program_job_no;
            var barcode_no = parameter.barcode_no;
            var packing_barcode = "";
            var packing_detail = [];
            switch (program_job_no) {
                case "1":
                    packing_barcode = "AB020139999"
                    break;
                case "2":
                    switch (barcode_no) {
                        case "AB020130001":
                            packing_barcode = "AB020130001";
                            break;
                        case "AB020130002":
                            packing_barcode = "AB020130002";
                            packing_detail = [{
                                "enterprise_no": "99",
                                "site_no": "DSCTC",
                                "doc_no": "CTC-LB4-160900000002",
                                "barcode_no": "AB020130002",
                                "barcode_type": "2",
                                "qty": 10,
                                "in_out_qty": 2,
                                "warehouse_no": "1000",
                                "storage_spaces_no": "1000-88",
                                "lot_no": "8888",
                                "inventory_management_features": "",
                            }];
                            break;
                        case "AB020130003":
                            packing_detail = [{
                                "enterprise_no": "99",
                                "site_no": "DSCTC",
                                "doc_no": "CTC-LB4-160900000002",
                                "barcode_no": "AB020130003",
                                "barcode_type": "3",
                                "qty": 10,
                                "in_out_qty": 2,
                                "warehouse_no": "1000",
                                "storage_spaces_no": "1000-88",
                                "lot_no": "8888",
                                "inventory_management_features": "",
                            }];
                            break;
                        case "AB020130004":
                            packing_detail = [{
                                "enterprise_no": "99",
                                "site_no": "DSCTC",
                                "doc_no": "CTC-LB4-160900000002",
                                "barcode_no": "AB020130004",
                                "barcode_type": "3",
                                "qty": 10,
                                "in_out_qty": 2,
                                "warehouse_no": "1000",
                                "storage_spaces_no": "1000-88",
                                "lot_no": "8888",
                                "inventory_management_features": "",
                            }, {
                                "enterprise_no": "99",
                                "site_no": "DSCTC",
                                "doc_no": "CTC-LB4-160900000002",
                                "barcode_no": "AB020130004",
                                "barcode_type": "3",
                                "qty": 10,
                                "in_out_qty": 2,
                                "warehouse_no": "1000",
                                "storage_spaces_no": "1000-99",
                                "lot_no": "9999",
                                "inventory_management_features": "",
                            }];
                            break;
                        case "AB020139999":
                            packing_barcode = "AB020139999";
                            packing_detail = [{
                                "enterprise_no": "99",
                                "site_no": "DSCTC",
                                "doc_no": "CTC-LB4-160900000002",
                                "barcode_no": "AB020130002",
                                "barcode_type": "4",
                                "qty": 1,
                                "in_out_qty": 0,
                                "warehouse_no": "1000",
                                "storage_spaces_no": "1000-88",
                                "lot_no": "8888",
                                "inventory_management_features": "",
                            }, {
                                "enterprise_no": "99",
                                "site_no": "DSCTC",
                                "doc_no": "CTC-LB4-160900000002",
                                "barcode_no": "AB020130004",
                                "barcode_type": "3",
                                "qty": 10,
                                "in_out_qty": 2,
                                "warehouse_no": "1000",
                                "storage_spaces_no": "1000-88",
                                "lot_no": "8888",
                                "inventory_management_features": "",
                            }, {
                                "enterprise_no": "99",
                                "site_no": "DSCTC",
                                "doc_no": "CTC-LB4-160900000002",
                                "barcode_no": "AB020130005",
                                "barcode_type": "3",
                                "qty": 10,
                                "in_out_qty": 2,
                                "warehouse_no": "1000",
                                "storage_spaces_no": "1000-88",
                                "lot_no": "8888",
                                "inventory_management_features": "",
                            }];
                            break;
                    }
                    break;

            }

            return {
                "packing_barcode": packing_barcode,
                "packing_detail": packing_detail
            }
        };

        self.user_storage_infomation_get = function(parameter) {
            return {
                "user_infomation": self.getUser(),
                "stock_infomation": self.getWarehouse(),
            };
        };

        self.app_production_type_get = function(parameter) {
            var main_category = parameter.main_category;
            var program_type = "B-1";
            if (main_category == "A") {
                switch (parameter.barcode_no) {
                    case "AB020130001":
                    case "AB020130011":
                    case "AB020130002":
                    case "AB020130022":
                    case "AB020130003":
                    case "AB020130033":
                    case "02013P02":
                    case "AB020130004":
                    case "AB020130005":
                        program_type = "A-1";
                        break;
                    case "CTC-LB4-160900000002":
                        program_type = "A-3";
                        break;
                    default:
                        program_type = "0";
                        break;
                }
            }
            return {
                "program_type": program_type,
            };
        };

        self.app_barcode_print_get = function(parameter) {
            var barcode = parameter.barcode;
            return {
                "print_detail": [{
                    barcode_no: barcode,
                    lot_no: "20170615",
                    item_no: "02013P01",
                    item_feature_no: "red",
                    item_name: "02013P01品名",
                    item_spec: "02013P01規格",
                    item_unit: "包",
                    barcode_type: "1",
                    barcode_qty: "100",
                    batch_qty: "50",
                    box_qty: "10",
                }, {
                    barcode_no: barcode,
                    lot_no: "20170615",
                    item_no: "02013P02",
                    item_feature_no: "red",
                    item_name: "02013P02品名",
                    item_spec: "02013P02規格",
                    item_unit: "包",
                    barcode_type: "1",
                    barcode_qty: "100",
                    batch_qty: "50",
                    box_qty: "10",
                }, {
                    barcode_no: barcode,
                    lot_no: "20170615",
                    item_no: "02013P03",
                    item_feature_no: "red",
                    item_name: "02013P03品名",
                    item_spec: "02013P03規格",
                    item_unit: "包",
                    barcode_type: "1",
                    barcode_qty: "100",
                    batch_qty: "50",
                    box_qty: "10",
                }]
            };
        };

        self.getWarehouse = function() {
            var warehouse = "[{\"status\":\"Y\",\"enterprise_no\":99,\"site_no\":\"DSCTC\",\"warehouse_no\":\"FER002\",\"warehouse_name\":\"FER002ref\",\"storage_spaces_no\":\"FER002-1\",\"storage_spaces_name\":\"FER002 倉庫一\",\"warehouse_cost\":\"Y\"},{\"status\":\"Y\",\"enterprise_no\":99,\"site_no\":\"DSCTC\",\"warehouse_no\":\"FER002\",\"warehouse_name\":\"FER002ref\",\"storage_spaces_no\":\"FER002-2\",\"storage_spaces_name\":\"FER002 倉庫二\",\"warehouse_cost\":\"Y\"},{\"status\":\"Y\",\"enterprise_no\":99,\"site_no\":\"DSCTC\",\"warehouse_no\":\"FER002\",\"warehouse_name\":\"FER002ref\",\"storage_spaces_no\":\"FER002-3\",\"storage_spaces_name\":\"FER002 倉庫三\",\"warehouse_cost\":\"Y\"},{\"status\":\"Y\",\"enterprise_no\":99,\"site_no\":\"DSCTC\",\"warehouse_no\":\"FER002\",\"warehouse_name\":\"FER002ref\",\"storage_spaces_no\":\"FER002-4\",\"storage_spaces_name\":\"FER002 倉庫四\",\"warehouse_cost\":\"Y\"},{\"status\":\"Y\",\"enterprise_no\":99,\"site_no\":\"DSCTC\",\"warehouse_no\":\"FER002\",\"warehouse_name\":\"FER002ref\",\"storage_spaces_no\":\"AA\",\"storage_spaces_name\":\"FER002 倉庫AA\",\"warehouse_cost\":\"Y\"},{\"status\":\"Y\",\"enterprise_no\":99,\"site_no\":\"DSCTC\",\"warehouse_no\":\"FER002\",\"warehouse_name\":\"FER002ref\",\"storage_spaces_no\":\"\",\"storage_spaces_name\":\"FER002 NO\",\"warehouse_cost\":\"Y\"},{\"status\":\"Y\",\"enterprise_no\":99,\"site_no\":\"DSCTC\",\"warehouse_no\":\"A001\",\"warehouse_name\":\"A001ref\",\"storage_spaces_no\":\"\",\"storage_spaces_name\":\"A001 NO\",\"warehouse_cost\":\"Y\"},{\"status\":\"Y\",\"enterprise_no\":99,\"site_no\":\"DSCTC\",\"warehouse_no\":\"A001\",\"warehouse_name\":\"A001ref\",\"storage_spaces_no\":\"A001-1\",\"storage_spaces_name\":\"A001 倉庫一\",\"warehouse_cost\":\"Y\"},{\"status\":\"Y\",\"enterprise_no\":99,\"site_no\":\"DSCTC\",\"warehouse_no\":\"0235\",\"warehouse_name\":\"0235ref\",\"storage_spaces_no\":\"\",\"storage_spaces_name\":\"0235 NO\",\"warehouse_cost\":\"Y\"},{\"status\":\"Y\",\"enterprise_no\":99,\"site_no\":\"DSCTC\",\"warehouse_no\":\"0235\",\"warehouse_name\":\"0235ref\",\"storage_spaces_no\":\"0235-1\",\"storage_spaces_name\":\"0235 倉庫一\",\"warehouse_cost\":\"Y\"},{\"status\":\"Y\",\"enterprise_no\":99,\"site_no\":\"DSCTC\",\"warehouse_no\":\"1000\",\"warehouse_name\":\"1000ref\",\"storage_spaces_no\":\"\",\"storage_spaces_name\":\"1000 NO\",\"warehouse_cost\":\"Y\"},{\"status\":\"Y\",\"enterprise_no\":99,\"site_no\":\"DSCTC\",\"warehouse_no\":\"1000\",\"warehouse_name\":\"1000ref\",\"storage_spaces_no\":\"1000-1\",\"storage_spaces_name\":\"1000 倉庫一\",\"warehouse_cost\":\"Y\"},{\"status\":\"Y\",\"enterprise_no\":99,\"site_no\":\"DSCTC\",\"warehouse_no\":\"1000\",\"warehouse_name\":\"1000ref\",\"storage_spaces_no\":\"AA\",\"storage_spaces_name\":\"1000 倉庫AA\",\"warehouse_cost\":\"Y\"}]";
            return JSON.parse(warehouse);
        };

        self.getWarehouseGroup = function() {
            var warehouse = self.getWarehouse();
            var tempArray = [];
            for (var i = 0; i < warehouse.length; i++) {
                var temp = warehouse[i];
                var index = tempArray.findIndex(function(item) {
                    return temp.warehouse_no == item.warehouse_no;
                });

                if (index == -1) {
                    tempArray.push({
                        "warehouse_no": temp.warehouse_no,
                        "warehouse_name": temp.warehouse_name,
                        "storage_management": temp.storage_management || "N",
                        "warehouse_cost": temp.warehouse_cost,
                        "storage_spaces": [{
                            "storage_spaces_no": temp.storage_spaces_no,
                            "storage_spaces_name": temp.storage_spaces_name,
                        }]
                    });
                } else {
                    tempArray[index].storage_spaces.push({
                        "storage_spaces_no": temp.storage_spaces_no,
                        "storage_spaces_name": temp.storage_spaces_name,
                    });
                }
            }
            return tempArray;
        };

        self.getStorageSpacesGroup = function() {
            var warehouse = self.getWarehouse();
            var tempArray = [];
            for (var i = 0; i < warehouse.length; i++) {
                var temp = warehouse[i];
                if (temp.storage_spaces_no == " ") {
                    continue;
                }
                var index = tempArray.findIndex(function(item) {
                    return temp.storage_spaces_no == item.storage_spaces_no &&
                        temp.storage_spaces_name == item.storage_spaces_name;
                });

                if (index == -1) {
                    tempArray.push({
                        "storage_spaces_no": temp.storage_spaces_no,
                        "storage_spaces_name": temp.storage_spaces_name,
                    });
                }
            }
            return tempArray;
        };

        self.getCommonIcon = function() {
            var data = "[{\"func\":\"fil101\",\"iscommon\":\"Y\"},{\"func\":\"fil102\",\"iscommon\":\"Y\"},{\"func\":\"fil203\",\"iscommon\":\"Y\"},{\"func\":\"fil403\",\"iscommon\":\"Y\"},{\"func\":\"fil213\",\"iscommon\":\"Y\"},{\"func\":\"fil301\",\"iscommon\":\"Y\"}]";
            return JSON.parse(data);
        };

        self.app_wo_process_data_get = function(parameter) {
            var wo_process = "[{\"seq\":1,\"op_name\":\"切割\",\"op_seq\":1,\"isreport\":\"Y\",\"report_qty\":3,\"scrap_qty\":8,\"ispqc\":\"Y\",\"eligible_qty\":2,\"uneligible_qty\":1},{\"seq\":2,\"op_name\":\"組裝\",\"op_seq\":2,\"isreport\":\"Y\",\"report_qty\":10,\"scrap_qty\":2,\"ispqc\":\"N\",\"eligible_qty\":0,\"uneligible_qty\":0},{\"seq\":3,\"op_name\":\"打印\",\"op_seq\":3,\"isreport\":\"Y\",\"report_qty\":0,\"scrap_qty\":0,\"ispqc\":\"Y\",\"eligible_qty\":2,\"uneligible_qty\":1},{\"seq\":4,\"op_name\":\"包裝\",\"op_seq\":4,\"isreport\":\"Y\",\"report_qty\":0,\"scrap_qty\":0,\"ispqc\":\"N\",\"eligible_qty\":0,\"uneligible_qty\":0}]";
            return {
                wo_process: JSON.parse(wo_process)
            };
        };

        self.app_abnormal_get = function(parameter) {
            var abnormal = "[{\"abnormal_no\":\"0001\",\"abnormal_name\":\"脫膠\"},{\"abnormal_no\":\"0002\",\"abnormal_name\":\"汙點\"},{\"abnormal_no\":\"0003\",\"abnormal_name\":\"起毛球\"},{\"abnormal_no\":\"0004\",\"abnormal_name\":\"裂痕\"},{\"abnormal_no\":\"0005\",\"abnormal_name\":\"邊緣不平\"},{\"abnormal_no\":\"0006\",\"abnormal_name\":\"壞殼\"},{\"abnormal_no\":\"001\",\"abnormal_name\":\"外殼受損\"},{\"abnormal_no\":\"111101\",\"abnormal_name\":\"IR不符規格\"},{\"abnormal_no\":\"111201\",\"abnormal_name\":\"耐壓度不足不符規格\"},{\"abnormal_no\":\"111301\",\"abnormal_name\":\"電器特性不符規格\"}]";
            return {
                abnormal: JSON.parse(abnormal)
            };
        };

        self.app_reason_code_get = function(parameter) {
            var reason_list = "[{\"reason_code\":\"0001\",\"reason_code_name\":\"脫膠\"},{\"reason_code\":\"0002\",\"reason_code_name\":\"汙點\"},{\"reason_code\":\"0003\",\"reason_code_name\":\"起毛球\"},{\"reason_code\":\"0004\",\"reason_code_name\":\"裂痕\"},{\"reason_code\":\"0005\",\"reason_code_name\":\"邊緣不平\"},{\"reason_code\":\"0006\",\"reason_code_name\":\"壞殼\"},{\"reason_code\":\"001\",\"reason_code_name\":\"外殼受損\"},{\"reason_code\":\"111101\",\"reason_code_name\":\"IR不符規格\"},{\"reason_code\":\"111201\",\"reason_code_name\":\"耐壓度不足不符規格\"},{\"reason_code\":\"111301\",\"reason_code_name\":\"電器特性不符規格\"}]";
            return {
                reason_list: JSON.parse(reason_list)
            };
        };

        self.department_data_get = function(parameter) {
            var department_no = parameter.department_no;
            var department_name = parameter.department_no;
            switch (department_no) {
                case "D001":
                    department_name = "研發部門";
                    break;
                case "D002":
                    department_name = "財會部門";
                    break;
                case "D003":
                    department_name = "管理部門";
                    break;
                case "D004":
                    department_name = "業務一部";
                    break;
                case "D005":
                    department_name = "業務二部";
                    break;
                case "D006":
                    department_name = "客服部門";
                    break;
            }
            return {
                "department_no": department_no,
                "department_name": department_name,
            };
        };

        self.app_bc_stock_count_data_no2_get = function(parameter) {
            return {
                "source_doc_detail": [{
                    "enterprise_no": "企业编号",
                    "site_no": "营运据点",
                    "plant_id": "工廠",
                    "counting_no": "盤點計畫編號",
                    "item_no": "料件编号",
                    "item_name_spec": "品名規格",
                    "item_feature_no": "产品特征",
                    "warehouse_no": "库位编号",
                    "storage_spaces_no": "储位编号",
                    "lot_no": "批号",
                    "transaction_type": "交易對象類型",
                    "transaction_no": "交易對象編號",
                    "inventory_qty": "库存数量"
                }],
                "barcode_detail": [{
                    "enterprise_no": 99,
                    "site_no": "DSCTC",
                    "barcode_no": "AB020130001",
                    "item_no": "02013P02",
                    "item_name_spec": "品名規格",
                    "item_feature_no": "产品特征",
                    "warehouse_no": "库位编号",
                    "storage_spaces_no": "储位编号",
                    "lot_no": "批号",
                    "barcode_qty": "3",
                    "packing_barcode": "AB020139999",
                    "highest_packing_barcode": "AB020139999",
                }, {
                    "enterprise_no": 99,
                    "site_no": "DSCTC",
                    "barcode_no": "AB020130002",
                    "item_no": "02013P02",
                    "item_name_spec": "品名規格",
                    "item_feature_no": "产品特征",
                    "warehouse_no": "库位编号",
                    "storage_spaces_no": "储位编号",
                    "lot_no": "批号",
                    "barcode_qty": "3",
                    "packing_barcode": "AB020139999",
                    "highest_packing_barcode": "AB020139999",
                }, {
                    "enterprise_no": 99,
                    "site_no": "DSCTC",
                    "barcode_no": "AB020130003",
                    "item_no": "02013P02",
                    "item_name_spec": "品名規格",
                    "item_feature_no": "产品特征",
                    "warehouse_no": "库位编号",
                    "storage_spaces_no": "储位编号",
                    "lot_no": "批号",
                    "barcode_qty": "3",
                    "packing_barcode": "AB020139999",
                    "highest_packing_barcode": "AB020139999",
                }]
            };
        };

        self.app_qc_get = function(parameter) {
            var doc_no = parameter.doc_no;
            var obj = {};
            switch (doc_no) {
                case "CTC-LB4-160900000002%0%10":
                    obj = {
                        "source_no": "CTC-LB4-160900000002",
                        "seq": 10,
                        "object_no": "00000002",
                        "object_name": "鼎新電腦",
                        "item_no": "RG001",
                        "item_feature_no": null,
                        "lot_no": "TEST",
                        "doc_qty": 30,
                        "in_out_qty": 0,
                        "run_card_no": 0,
                        "op_no": "LIGHT001",
                        "op_name": "Light平台基本資料測試-切割",
                        "item_name": "杏仁瓦片",
                        "item_spec": "餅乾"
                    };
                    break;
                case "CTC-LB4-160900000002%0%20":
                    obj = {
                        "source_no": "CTC-LB4-160900000002",
                        "seq": 20,
                        "object_no": "00000002",
                        "object_name": "鼎新電腦",
                        "item_no": "RG002",
                        "item_feature_no": null,
                        "lot_no": "TEST",
                        "doc_qty": 20,
                        "in_out_qty": 0,
                        "run_card_no": 0,
                        "op_no": "LIGHT001",
                        "op_name": "Light平台基本資料測試-切割",
                        "item_name": "雞排",
                        "item_spec": "無骨"
                    };
                    break;
                default:
                    obj = {
                        "source_no": "CTC-LB4-160900000002",
                        "seq": 10,
                        "doc_line_seq": "1",
                        "object_no": "00000002",
                        "object_name": "鼎新電腦",
                        "item_no": "RG001",
                        "item_feature_no": null,
                        "lot_no": "TEST",
                        "doc_qty": 30,
                        "in_out_qty": 0,
                        "run_card_no": 0,
                        "op_no": "LIGHT001",
                        "op_name": "Light平台基本資料測試-切割",
                        "item_name": "杏仁瓦片",
                        "item_spec": "餅乾",
                        "reference_unit_no": "片",
                        "reference_qty": 10,
                        "CR_molecular": 1,
                        "CR_denominator": 1,
                        "MA_molecular": 1,
                        "MA_denominator": 1,
                        "MI_molecular": 1,
                        "MI_denominator": 1,
                        "inspect_list": [{
                            "seq": 1,
                            "inspection_item": 1,
                            "inspection_desc": 1,
                            "cr_ma_mi": 1,
                            "aql": 1,
                            "accept_qty": 1,
                            "reject_qty": 1,
                            "sampling_qty": 1,
                            "defect_qty": 1,
                            "result_type": 1,
                            "measure": "Y",
                            "c_machine": 1,
                            "c_tolerance": 1,
                            "c_memo": 1,
                        }]
                    };
                    break;
            }
            return obj;
        };

        self.app_instructions_get = function(parameter) {
            if (parameter.warehouse_no != "1000") {
                return {
                    "inventory_detail": []
                };
            }
            var inventory_detail = [{
                "enterprise_no": 99,
                "site_no": "DSCTC",
                "barcode_no": "AB020130002",
                "item_no": "02013P02",
                "item_name": "品名02013P02",
                "item_spec": "規格02013P02",
                "item_feature_no": " ",
                "item_feature_name": null,
                "warehouse_no": "1000",
                "storage_spaces_no": "1000-01",
                "lot_no": "",
                "inventory_management_features": " ",
                "inventory_unit": "PCS",
                "inventory_qty": 90,
                "first_storage_date": "2016-09-08",
                "sort_no": 1,
                "conversion_qty": 1,
                "unit_no": "PCS"
            }, {
                "enterprise_no": 99,
                "site_no": "DSCTC",
                "barcode_no": "AB020130022",
                "item_no": "02013P02",
                "item_name": "品名02013P02",
                "item_spec": "規格02013P02",
                "item_feature_no": " ",
                "item_feature_name": null,
                "warehouse_no": "1000",
                "storage_spaces_no": "1000-01",
                "lot_no": "20160923",
                "inventory_management_features": " ",
                "inventory_unit": "PCS",
                "inventory_qty": 50,
                "first_storage_date": "2016-09-23",
                "sort_no": 2,
                "conversion_qty": 1,
                "unit_no": "PCS"
            }, {
                "enterprise_no": 99,
                "site_no": "DSCTC",
                "barcode_no": "AB020130003",
                "item_no": "02013P02",
                "item_name": "品名02013P02",
                "item_spec": "規格02013P02",
                "item_feature_no": " ",
                "item_feature_name": null,
                "warehouse_no": "1000",
                "storage_spaces_no": "1000-01",
                "lot_no": "20160923",
                "inventory_management_features": " ",
                "inventory_unit": "PCS",
                "inventory_qty": 90,
                "first_storage_date": "2016-09-23",
                "sort_no": 4,
                "conversion_qty": 1,
                "unit_no": "PCS"
            }, {
                "enterprise_no": 99,
                "site_no": "DSCTC",
                "barcode_no": "AB020130033",
                "item_no": "02013P02",
                "item_name": "品名02013P02",
                "item_spec": "規格02013P02",
                "item_feature_no": " ",
                "item_feature_name": null,
                "warehouse_no": "1000",
                "storage_spaces_no": "1000-01",
                "lot_no": "20160923",
                "inventory_management_features": " ",
                "inventory_unit": "PCS",
                "inventory_qty": 50,
                "first_storage_date": "2016-09-23",
                "sort_no": 3,
                "conversion_qty": 1,
                "unit_no": "PCS"
            }, {
                "enterprise_no": 99,
                "site_no": "DSCTC",
                "barcode_no": "AB020130005",
                "item_no": "02013P03",
                "item_name": "品名02013P03",
                "item_spec": "規格02013P03",
                "item_feature_no": " ",
                "item_feature_name": null,
                "warehouse_no": "1000",
                "storage_spaces_no": "1000-01",
                "lot_no": " ",
                "inventory_management_features": " ",
                "inventory_unit": "PCS",
                "inventory_qty": 100,
                "first_storage_date": "2016-09-08",
                "sort_no": 3,
                "conversion_qty": 1,
                "unit_no": "PCS"
            }];
            return {
                "inventory_detail": inventory_detail
            };
        };

        self.app_lot_get = function(parameter) {
            return {
                "lot_detail": [{
                    "lot_no": "88888",
                    "item_no": "02013P03",
                    "item_feature_no": " ",
                    "lot_description": "99",
                    "effective_date": "2016-10-10",
                    "effective_deadline": "2017-12-15",
                    "remarks": "8888",
                }]
            };
        };

        self.app_doc_bc_get = function(parameter) {
            var getAppBarcode = self.app_barcode_get(parameter);
            parameter.param_master = [{
                doc_no: "CTC-LB4-160900000002"
            }];
            var getAppTodoDoc = self.app_todo_doc_get(parameter);
            return {
                "barcode_detail": getAppBarcode.barcode_detail,
                "source_doc_detail": getAppTodoDoc.source_doc_detail
            };
        };

        self.app_barcode_get = function(parameter) {
            var barcode = parameter.barcode_no;
            var program_job_no = parameter.program_job_no;
            var barcode_detail = [];
            switch (barcode) {
                case "AB020130001":
                    barcode_detail = [{
                        "enterprise_no": 99,
                        "site_no": "DSCTC",
                        "barcode_no": "AB020130001",
                        "item_no": "02013P02",
                        "item_feature_no": " ",
                        "item_feature_name": null,
                        "warehouse_no": "1000",
                        "storage_spaces_no": "1000-01",
                        "lot_no": " ",
                        "inventory_management_features": " ",
                        "plot_no": " ",
                        "serial_no": " ",
                        "inventory_unit": "PCS",
                        "barcode_qty": 100,
                        "inventory_qty": 90,
                        "source_operation": program_job_no,
                        "source_no": "CTC-LB4-1209000011",
                        "source_seq": 0,
                        "source_line_seq": 0,
                        "source_batch_seq": 0,
                        "barcode_lot_no": "",
                        "last_transaction_date": "2016-09-24 15:06:05.00000",
                        "barcode_type": "1",
                        "item_name": "品名02013P02",
                        "item_spec": "規格02013P02",
                        "lot_control_type": "3",
                        "reference_unit_no": "TB",
                        "reference_qty": 888,
                        "multi_unit_type": "3",
                        "packing_barcode": "N",
                        "packing_qty": 0,
                    }];
                    break;
                case "AB020130011":
                    barcode_detail = [{
                        "enterprise_no": 99,
                        "site_no": "DSCTC",
                        "barcode_no": "AB020130011",
                        "item_no": "02013P02",
                        "item_feature_no": " ",
                        "item_feature_name": null,
                        "warehouse_no": "1000",
                        "storage_spaces_no": "1000-01",
                        "lot_no": " ",
                        "inventory_management_features": " ",
                        "plot_no": " ",
                        "serial_no": " ",
                        "inventory_unit": "PCS",
                        "barcode_qty": 140,
                        "inventory_qty": 50,
                        "source_operation": program_job_no,
                        "source_no": "CTC-LB4-1209000011",
                        "source_seq": 0,
                        "source_line_seq": 0,
                        "source_batch_seq": 0,
                        "barcode_lot_no": "",
                        "last_transaction_date": "2016-09-24 15:06:05.00000",
                        "barcode_type": "1",
                        "item_name": "品名02013P02",
                        "item_spec": "規格02013P02",
                        "lot_control_type": "3",
                        "reference_unit_no": "TB",
                        "reference_qty": 888,
                        "multi_unit_type": "3",
                        "packing_barcode": "N",
                        "packing_qty": 0,
                    }];
                    break;
                case "AB020130002":
                    barcode_detail = [{
                        "enterprise_no": 99,
                        "site_no": "DSCTC",
                        "barcode_no": "AB020130002",
                        "item_no": "02013P02",
                        "item_feature_no": " ",
                        "item_feature_name": null,
                        "warehouse_no": "1000",
                        "storage_spaces_no": "1000-01",
                        "lot_no": " ",
                        "inventory_management_features": " ",
                        "plot_no": " ",
                        "serial_no": " ",
                        "inventory_unit": "PCS",
                        "barcode_qty": 100,
                        "inventory_qty": 90,
                        "source_operation": program_job_no,
                        "source_no": "CTC-LB4-160900000002",
                        "source_seq": 10,
                        "source_line_seq": 0,
                        "source_batch_seq": 0,
                        "barcode_lot_no": "",
                        "last_transaction_date": "2016-09-24 15:06:05.00000",
                        "barcode_type": "2",
                        "item_name": "品名02013P02",
                        "item_spec": "規格02013P02",
                        "lot_control_type": "3",
                        "reference_unit_no": "TB",
                        "reference_qty": 888,
                        "multi_unit_type": "3",
                        "packing_barcode": "N",
                        "packing_qty": 0,
                    }];
                    break;
                case "AB020130022":
                    barcode_detail = [{
                        "enterprise_no": 99,
                        "site_no": "DSCTC",
                        "barcode_no": "AB020130022",
                        "item_no": "02013P02",
                        "item_feature_no": " ",
                        "item_feature_name": null,
                        "warehouse_no": "1000",
                        "storage_spaces_no": "1000-01",
                        "lot_no": " ",
                        "inventory_management_features": " ",
                        "plot_no": " ",
                        "serial_no": " ",
                        "inventory_unit": "PCS",
                        "barcode_qty": 140,
                        "inventory_qty": 50,
                        "source_operation": program_job_no,
                        "source_no": "CTC-LB4-1209000011",
                        "source_seq": 0,
                        "source_line_seq": 0,
                        "source_batch_seq": 0,
                        "barcode_lot_no": "",
                        "last_transaction_date": "2016-09-24 15:06:05.00000",
                        "barcode_type": "2",
                        "item_name": "品名02013P02",
                        "item_spec": "規格02013P02",
                        "lot_control_type": "3",
                        "reference_unit_no": "TB",
                        "reference_qty": 888,
                        "multi_unit_type": "3",
                        "packing_barcode": "N",
                        "packing_qty": 0,
                    }];
                    break;
                case "AB020130003":
                    barcode_detail = [{
                        "enterprise_no": 99,
                        "site_no": "DSCTC",
                        "barcode_no": "AB020130003",
                        "item_no": "02013P02",
                        "item_feature_no": " ",
                        "item_feature_name": null,
                        "warehouse_no": "1000",
                        "storage_spaces_no": "1000-05",
                        "lot_no": " ",
                        "inventory_management_features": " ",
                        "plot_no": " ",
                        "serial_no": " ",
                        "inventory_unit": "PCS",
                        "barcode_qty": 50,
                        "inventory_qty": 100,
                        "source_operation": program_job_no,
                        "source_no": "CTC-LB4-1209000011",
                        "source_seq": 0,
                        "source_line_seq": 0,
                        "source_batch_seq": 0,
                        "barcode_lot_no": "",
                        "last_transaction_date": "2016-09-24 15:06:05.00000",
                        "barcode_type": "3",
                        "item_name": "品名02013P02",
                        "item_spec": "規格02013P02",
                        "lot_control_type": "3",
                        "reference_unit_no": "TB",
                        "reference_qty": 888,
                        "multi_unit_type": "3",
                        "packing_barcode": "N",
                        "packing_qty": 0,
                    }];
                    break;
                case "AB020130033":
                    barcode_detail = [{
                        "enterprise_no": 99,
                        "site_no": "DSCTC",
                        "barcode_no": "AB020130033",
                        "item_no": "02013P02",
                        "item_feature_no": " ",
                        "item_feature_name": null,
                        "warehouse_no": "1000",
                        "storage_spaces_no": "1000-05",
                        "lot_no": " ",
                        "inventory_management_features": " ",
                        "plot_no": " ",
                        "serial_no": " ",
                        "inventory_unit": "PCS",
                        "barcode_qty": 50,
                        "inventory_qty": 50,
                        "source_operation": program_job_no,
                        "source_no": "CTC-LB4-1209000011",
                        "source_seq": 0,
                        "source_line_seq": 0,
                        "source_batch_seq": 0,
                        "barcode_lot_no": "",
                        "last_transaction_date": "2016-09-24 15:06:05.00000",
                        "barcode_type": "3",
                        "item_name": "品名02013P02",
                        "item_spec": "規格02013P02",
                        "lot_control_type": "3",
                        "reference_unit_no": "TB",
                        "reference_qty": 888,
                        "multi_unit_type": "3",
                        "packing_barcode": "N",
                        "packing_qty": 0,
                    }, {
                        "enterprise_no": 99,
                        "site_no": "DSCTC",
                        "barcode_no": "AB020130033",
                        "item_no": "02013P02",
                        "item_feature_no": " ",
                        "item_feature_name": null,
                        "warehouse_no": "1000",
                        "storage_spaces_no": "1000-08",
                        "lot_no": " ",
                        "inventory_management_features": " ",
                        "plot_no": " ",
                        "serial_no": " ",
                        "inventory_unit": "PCS",
                        "barcode_qty": 50,
                        "inventory_qty": 50,
                        "source_operation": program_job_no,
                        "source_no": "CTC-LB4-1209000011",
                        "source_seq": 0,
                        "source_line_seq": 0,
                        "source_batch_seq": 0,
                        "barcode_lot_no": "",
                        "last_transaction_date": "2016-09-24 15:06:05.00000",
                        "barcode_type": "3",
                        "item_name": "品名02013P02",
                        "item_spec": "規格02013P02",
                        "lot_control_type": "3",
                        "reference_unit_no": "TB",
                        "reference_qty": 888,
                        "multi_unit_type": "3",
                        "packing_barcode": "N",
                        "packing_qty": 0,
                    }];
                    break;
                case "02013P02":
                case "AB020130004":
                    barcode_detail = [{
                        "enterprise_no": 99,
                        "site_no": "DSCTC",
                        "barcode_no": "AB020130004",
                        "item_no": "02013P02",
                        "item_feature_no": " ",
                        "item_feature_name": null,
                        "warehouse_no": "1000",
                        "storage_spaces_no": "1000-01",
                        "lot_no": "",
                        "inventory_management_features": " ",
                        "plot_no": " ",
                        "serial_no": " ",
                        "inventory_unit": "PCS",
                        "barcode_qty": 1000,
                        "inventory_qty": 980,
                        "source_operation": program_job_no,
                        "source_no": "CTC-LB4-1209000011",
                        "source_seq": 0,
                        "source_line_seq": 0,
                        "source_batch_seq": 0,
                        "barcode_lot_no": "",
                        "last_transaction_date": "2016-09-24 15:06:05.00000",
                        "barcode_type": "1",
                        "item_name": "品名02013P02",
                        "item_spec": "規格02013P02",
                        "lot_control_type": "3",
                        "reference_unit_no": "TB",
                        "reference_qty": 888,
                        "multi_unit_type": "3",
                        "packing_barcode": "N",
                        "packing_qty": 0,
                    }, {
                        "enterprise_no": 99,
                        "site_no": "DSCTC",
                        "barcode_no": "AB020130004",
                        "item_no": "02013P02",
                        "item_feature_no": " ",
                        "item_feature_name": null,
                        "warehouse_no": "1000",
                        "storage_spaces_no": "1000-05",
                        "lot_no": "",
                        "inventory_management_features": " ",
                        "plot_no": " ",
                        "serial_no": " ",
                        "inventory_unit": "PCS",
                        "barcode_qty": 100,
                        "inventory_qty": 80,
                        "source_operation": program_job_no,
                        "source_no": "CTC-LB4-1209000011",
                        "source_seq": 0,
                        "source_line_seq": 0,
                        "source_batch_seq": 0,
                        "barcode_lot_no": "",
                        "last_transaction_date": "2016-09-24 15:06:05.00000",
                        "barcode_type": "3",
                        "item_name": "品名02013P02",
                        "item_spec": "規格02013P02",
                        "lot_control_type": "3",
                        "reference_unit_no": "TB",
                        "reference_qty": 888,
                        "multi_unit_type": "3",
                        "packing_barcode": "N",
                        "packing_qty": 0,
                    }, {
                        "enterprise_no": 99,
                        "site_no": "DSCTC",
                        "barcode_no": "AB020130004",
                        "item_no": "02013P02",
                        "item_feature_no": " ",
                        "item_feature_name": null,
                        "warehouse_no": "1000",
                        "storage_spaces_no": "1000-01",
                        "lot_no": "",
                        "inventory_management_features": " ",
                        "plot_no": " ",
                        "serial_no": " ",
                        "inventory_unit": "PCS",
                        "barcode_qty": 150,
                        "inventory_qty": 100,
                        "source_operation": program_job_no,
                        "source_no": "CTC-LB4-1209000011",
                        "source_seq": 0,
                        "source_line_seq": 0,
                        "source_batch_seq": 0,
                        "barcode_lot_no": "",
                        "last_transaction_date": "2016-09-24 15:06:05.00000",
                        "barcode_type": "2",
                        "item_name": "品名02013P02",
                        "item_spec": "規格02013P02",
                        "lot_control_type": "3",
                        "reference_unit_no": "TB",
                        "reference_qty": 888,
                        "multi_unit_type": "3",
                        "packing_barcode": "N",
                        "packing_qty": 0,
                    }];
                    break;
                case "AB020130005":
                    barcode_detail = [{
                        "enterprise_no": 99,
                        "site_no": "DSCTC",
                        "barcode_no": "AB020130005",
                        "item_no": "02013P03",
                        "item_feature_no": " ",
                        "item_feature_name": null,
                        "warehouse_no": "1000",
                        "storage_spaces_no": "1000-05",
                        "lot_no": " ",
                        "inventory_management_features": " ",
                        "plot_no": " ",
                        "serial_no": " ",
                        "inventory_unit": "PCS",
                        "barcode_qty": 200,
                        "inventory_qty": 100,
                        "source_operation": program_job_no,
                        "source_no": "CTC-LB4-1209000011",
                        "source_seq": 0,
                        "source_line_seq": 0,
                        "source_batch_seq": 0,
                        "barcode_lot_no": "",
                        "last_transaction_date": "2016-09-24 15:06:05.00000",
                        "barcode_type": "3",
                        "item_name": "品名02013P03",
                        "item_spec": "規格02013P03",
                        "lot_control_type": "2",
                        "reference_unit_no": "TB",
                        "reference_qty": 777,
                        "multi_unit_type": "3",
                        "packing_barcode": "N",
                        "packing_qty": 0,
                    }];
                    break;
                case "AB020130006":
                    barcode_detail = [{
                        "enterprise_no": 99,
                        "site_no": "DSCTC",
                        "barcode_no": "AB020130001",
                        "item_no": "02013P02",
                        "item_feature_no": " ",
                        "item_feature_name": null,
                        "warehouse_no": "1000",
                        "storage_spaces_no": "1000-01",
                        "lot_no": " ",
                        "inventory_management_features": " ",
                        "plot_no": " ",
                        "serial_no": " ",
                        "inventory_unit": "PCS",
                        "barcode_qty": 100,
                        "inventory_qty": 90,
                        "source_operation": program_job_no,
                        "source_no": "CTC-LB4-1209000011",
                        "source_seq": 0,
                        "source_line_seq": 0,
                        "source_batch_seq": 0,
                        "barcode_lot_no": "",
                        "last_transaction_date": "2016-09-24 15:06:05.00000",
                        "barcode_type": "1",
                        "item_name": "品名02013P02",
                        "item_spec": "規格02013P02",
                        "lot_control_type": "2",
                        "reference_unit_no": "TB",
                        "reference_qty": 777,
                        "multi_unit_type": "3",
                        "packing_barcode": "Y",
                        "packing_qty": 50,
                    }, {
                        "enterprise_no": 99,
                        "site_no": "DSCTC",
                        "barcode_no": "AB020130002",
                        "item_no": "02013P02",
                        "item_feature_no": " ",
                        "item_feature_name": null,
                        "warehouse_no": "1000",
                        "storage_spaces_no": "1000-01",
                        "lot_no": " ",
                        "inventory_management_features": " ",
                        "plot_no": " ",
                        "serial_no": " ",
                        "inventory_unit": "PCS",
                        "barcode_qty": 100,
                        "inventory_qty": 90,
                        "source_operation": program_job_no,
                        "source_no": "CTC-LB4-160900000002",
                        "source_seq": 10,
                        "source_line_seq": 0,
                        "source_batch_seq": 0,
                        "barcode_lot_no": "",
                        "last_transaction_date": "2016-09-24 15:06:05.00000",
                        "barcode_type": "2",
                        "item_name": "品名02013P02",
                        "item_spec": "規格02013P02",
                        "lot_control_type": "3",
                        "reference_unit_no": "TB",
                        "reference_qty": 888,
                        "multi_unit_type": "3",
                        "packing_barcode": "Y",
                        "packing_qty": 30,
                    }, {
                        "enterprise_no": 99,
                        "site_no": "DSCTC",
                        "barcode_no": "AB020130055",
                        "item_no": "02013P03",
                        "item_feature_no": " ",
                        "item_feature_name": null,
                        "warehouse_no": "9999",
                        "storage_spaces_no": "9999-01",
                        "lot_no": " ",
                        "inventory_management_features": " ",
                        "plot_no": " ",
                        "serial_no": " ",
                        "inventory_unit": "PCS",
                        "barcode_qty": 50,
                        "inventory_qty": 1000,
                        "source_operation": program_job_no,
                        "source_no": "CTC-LB4-1209000011",
                        "source_seq": 0,
                        "source_line_seq": 0,
                        "source_batch_seq": 0,
                        "barcode_lot_no": "",
                        "last_transaction_date": "2016-09-24 15:06:05.00000",
                        "barcode_type": "3",
                        "item_name": "品名02013P03",
                        "item_spec": "規格02013P03",
                        "lot_control_type": "2",
                        "reference_unit_no": "TB",
                        "reference_qty": 777,
                        "multi_unit_type": "3",
                        "packing_barcode": "Y",
                        "packing_qty": 50,
                    }];
                    break;
            }
            return {
                "barcode_detail": barcode_detail,
                "source_doc_detail": []
            };
        };

        self.app_todo_doc_get = function(parameter) {
            var source_operation = parameter.program_job_no;
            var doc_type = parameter.program_job_no + parameter.status;
            var source_doc_detail = [];
            for (var i = 0; i < parameter.param_master.length; i++) {
                var temp = parameter.param_master[i];
                var temp_arr = [{
                    "enterprise_no": 99,
                    "site_no": "DSCTC",
                    "source_operation": source_operation,
                    "source_no": temp.doc_no,
                    "doc_type": doc_type,
                    "create_date": "2016-09-14",
                    "seq": 10,
                    "doc_line_seq": 0,
                    "doc_batch_seq": 0,
                    "object_no": "BP0244",
                    "object_name": "台中開發四組",
                    "item_no": "02013P02",
                    "item_feature_no": " ",
                    "item_feature_name": null,
                    "warehouse_no": "1000",
                    "storage_spaces_no": "1000-1",
                    "lot_no": " ",
                    "inventory_management_features": null,
                    "doc_qty": 20,
                    "in_out_qty": 0,
                    "in_out_date1": "2016-09-14",
                    "in_out_date2": null,
                    "done_stus": "N",
                    "closed_stus": "N",
                    "upper_no": "UP" + temp.doc_no,
                    "upper_seq": 10,
                    "upper_line_seq": 0,
                    "upper_batch_seq": 0,
                    "production_item_no": "02013M01",
                    "production_qty": 20,
                    "item_name_spec": "品名規格",
                    "production_unit_no": "PCS",
                    "upper_unit_no": null,
                    "reference_unit_no": "set",
                    "reference_qty": 200,
                    "upper_qty": 20,
                    "unit_no": "箱",
                    "allow_error_rate": 10,
                    "production_item_feature_no": " ",
                    "production_in_out_qty": 0,
                    "last_transaction_date": "2016-09-24 15:06:05.00000",
                    "status": "Y",
                    "run_card_no": "88",
                    "qpa_molecular": "",
                    "qpa_denominator": "",
                    "main_organization": "E10",
                    "outgoing_warehouse_no": "",
                    "outgoing_storage_spaces_no": "",
                    "item_name": "品名02013P02",
                    "item_spec": "規格02013P02",
                    "lot_control_type": "1",
                    "conversion_rate_molecular": "1",
                    "conversion_rate_denominator": "1",
                    "inventory_unit": "KKG",
                    "decimal_places": 6,
                    "decimal_places_type": 1,
                    "reference_rate": 10,
                    "reference_decimal_places": 2,
                    "reference_decimal_places_type": 1,
                    "reference_in_out_qty": 0,
                    "valuation_unit_no": "kg",
                    "valuation_qty": 20000,
                    "multi_unit_type": "3",
                    "inventory_qty": 2000000,
                    "main_warehouse_no": "A001-09",
                    "main_storage_no": "S001-09",
                    "first_in_first_out_control": "Y",
                    "erp_warehousing": "Y",
                }, {
                    "enterprise_no": 99,
                    "site_no": "DSCTC",
                    "source_operation": source_operation,
                    "source_no": temp.doc_no,
                    "doc_type": doc_type,
                    "create_date": "2016-09-14",
                    "seq": 20,
                    "doc_line_seq": 0,
                    "doc_batch_seq": 0,
                    "object_no": "BP0244",
                    "object_name": "台中開發四組",
                    "item_no": "02013P02",
                    "item_feature_no": " ",
                    "item_feature_name": null,
                    "warehouse_no": "A001",
                    "storage_spaces_no": "A001-1",
                    "lot_no": " ",
                    "inventory_management_features": null,
                    "doc_qty": 80,
                    "in_out_qty": 0,
                    "in_out_date1": "2016-09-15",
                    "in_out_date2": null,
                    "done_stus": "N",
                    "closed_stus": "N",
                    "upper_no": "UP" + temp.doc_no,
                    "upper_seq": 10,
                    "upper_line_seq": 0,
                    "upper_batch_seq": 0,
                    "production_item_no": "02013M01",
                    "production_qty": 20,
                    "item_name_spec": "品名規格",
                    "production_unit_no": "PCS",
                    "upper_unit_no": null,
                    "reference_unit_no": "set",
                    "reference_qty": 800,
                    "upper_qty": 20,
                    "unit_no": "PCS",
                    "allow_error_rate": 10,
                    "production_item_feature_no": " ",
                    "production_in_out_qty": 0,
                    "last_transaction_date": "2016-09-24 15:06:05.00000",
                    "status": "Y",
                    "run_card_no": "88",
                    "qpa_molecular": "",
                    "qpa_denominator": "",
                    "main_organization": "E10",
                    "outgoing_warehouse_no": "",
                    "outgoing_storage_spaces_no": "",
                    "item_name": "品名02013P02",
                    "item_spec": "規格02013P02",
                    "lot_control_type": "1",
                    "conversion_rate_molecular": "1",
                    "conversion_rate_denominator": "1",
                    "inventory_unit": "KKG",
                    "decimal_places": 6,
                    "decimal_places_type": 1,
                    "reference_rate": 10,
                    "reference_decimal_places": 2,
                    "reference_decimal_places_type": 1,
                    "reference_in_out_qty": 0,
                    "valuation_unit_no": "kg",
                    "valuation_qty": 80000,
                    "multi_unit_type": "3",
                    "inventory_qty": 8000000,
                    "main_warehouse_no": "A001-09",
                    "main_storage_no": "S001-03",
                    "first_in_first_out_control": "Y",
                    "erp_warehousing": "Y",
                }, {
                    "enterprise_no": 99,
                    "site_no": "DSCTC",
                    "source_operation": source_operation,
                    "source_no": temp.doc_no,
                    "doc_type": doc_type,
                    "create_date": "2016-09-14",
                    "seq": 30,
                    "doc_line_seq": 0,
                    "doc_batch_seq": 0,
                    "object_no": "BP0244",
                    "object_name": "台中開發四組",
                    "item_no": "02013P03",
                    "item_feature_no": " ",
                    "item_feature_name": " ",
                    "warehouse_no": " ",
                    "storage_spaces_no": " ",
                    "lot_no": " ",
                    "inventory_management_features": null,
                    "doc_qty": 100,
                    "in_out_qty": 0,
                    "in_out_date1": "2016-09-14",
                    "in_out_date2": null,
                    "done_stus": "N",
                    "closed_stus": "N",
                    "upper_no": "UP" + temp.doc_no,
                    "upper_seq": 10,
                    "upper_line_seq": 0,
                    "upper_batch_seq": 0,
                    "production_item_no": "02013M01",
                    "production_qty": 20,
                    "item_name_spec": "品名規格",
                    "production_unit_no": "PCS",
                    "upper_unit_no": null,
                    "reference_unit_no": "set",
                    "reference_qty": 1000,
                    "upper_qty": 20,
                    "unit_no": "PCS",
                    "allow_error_rate": 10,
                    "production_item_feature_no": " ",
                    "production_in_out_qty": 0,
                    "last_transaction_date": "2016-09-24 15:06:05.00000",
                    "status": "Y",
                    "run_card_no": "88",
                    "qpa_molecular": "",
                    "qpa_denominator": "",
                    "main_organization": "E10",
                    "outgoing_warehouse_no": "",
                    "outgoing_storage_spaces_no": "",
                    "item_name": "品名02013P03",
                    "item_spec": "規格02013P03",
                    "lot_control_type": "1",
                    "conversion_rate_molecular": "1",
                    "conversion_rate_denominator": "1",
                    "inventory_unit": "KKG",
                    "decimal_places": 6,
                    "decimal_places_type": 1,
                    "reference_rate": 10,
                    "reference_decimal_places": 2,
                    "reference_decimal_places_type": 1,
                    "reference_in_out_qty": 0,
                    "valuation_unit_no": "kg",
                    "valuation_qty": 100000,
                    "multi_unit_type": "3",
                    "inventory_qty": 10000000,
                    "main_warehouse_no": "A001-01",
                    "main_storage_no": "S001-01",
                    "first_in_first_out_control": "W",
                    "erp_warehousing": "Y",
                }];
                source_doc_detail = source_doc_detail.concat(temp_arr);
            }
            var obj = {
                source_doc_detail: source_doc_detail
            };
            return obj;
        };

        self.app_todo_notice_get = function(parameter) {
            var program_job_no = parameter.program_job_no;
            var status = parameter.status;

            var sales_notice = [{
                "doc_no": "CTC-LB4-160900000002",
                "create_date": "2016-09-01",
                "customer_name": "BP0240",
                "seq": "",
                "doc_line_seq": "",
                "item_no": "02013P02",
                "item_name": "item_1",
                "qty": 20,
                "program_job_no": program_job_no,
                "employee_name": "張登科"
            }, {
                "doc_no": "CTC-LB4-160900000003",
                "create_date": "2016-09-09",
                "customer_name": "BP0241",
                "seq": "",
                "doc_line_seq": "",
                "item_no": "02013P02",
                "item_name": "item_2",
                "qty": 20,
                "program_job_no": program_job_no,
                "employee_name": "吳卓勳"
            }, {
                "doc_no": "CTC-LB4-160900000004",
                "create_date": "2016-09-09",
                "customer_name": "BP0242",
                "seq": "",
                "doc_line_seq": "",
                "item_no": "02013P02",
                "item_name": "item_3",
                "qty": 20,
                "program_job_no": program_job_no,
                "employee_name": "張登科"
            }, {
                "doc_no": "CTC-LB4-160900000005",
                "create_date": "2016-09-13",
                "customer_name": "BP0243",
                "seq": "",
                "doc_line_seq": "",
                "item_no": "02013P02",
                "item_name": "item_4",
                "qty": 20,
                "program_job_no": program_job_no,
                "employee_name": "黃莉雅"
            }, {
                "doc_no": "CTC-LB4-160900000006",
                "create_date": "2016-09-13",
                "customer_name": "BP0244",
                "seq": "",
                "doc_line_seq": "",
                "item_no": "02013P01",
                "item_name": "item_5",
                "qty": 20,
                "program_job_no": program_job_no,
                "employee_name": "吳卓勳"
            }, {
                "doc_no": "CTC-LB4-160900000007",
                "create_date": "2016-09-13",
                "customer_name": "BP0245",
                "seq": "",
                "doc_line_seq": "",
                "item_no": "02013P01",
                "item_name": "item_6",
                "qty": 20,
                "program_job_no": program_job_no,
                "employee_name": "黃莉雅"
            }, {
                "doc_no": "CTC-LB4-160900000008",
                "create_date": "2016-09-14",
                "customer_name": "台中開發四組",
                "seq": "",
                "doc_line_seq": "",
                "item_no": "02013P01",
                "item_name": "item_7",
                "qty": 20,
                "program_job_no": program_job_no,
                "employee_name": "林怡君"
            }, {
                "doc_no": "CTC-LB4-160900000009",
                "create_date": "2016-09-19",
                "customer_name": "BP0246",
                "seq": "",
                "doc_line_seq": "",
                "item_no": "02013P01",
                "item_name": "item_8",
                "qty": 20,
                "program_job_no": program_job_no,
                "employee_name": "林怡君"
            }, {
                "doc_no": "CTC-LB4-160900000010",
                "create_date": "2016-09-19",
                "customer_name": "BP0247",
                "seq": 9,
                "doc_line_seq": "",
                "item_no": "02013P01",
                "item_name": "item_9",
                "qty": 20,
                "program_job_no": program_job_no,
                "employee_name": "劉議文"
            }, {
                "doc_no": "CTC-LB4-160900000011",
                "create_date": "2016-09-23",
                "customer_name": "BP0248",
                "seq": "",
                "doc_line_seq": "",
                "item_no": "02013P01",
                "item_name": "item_10",
                "qty": 20,
                "program_job_no": program_job_no,
                "employee_name": "劉議文"
            }];
            return {
                "sales_notice": sales_notice
            };
        };

        self.employee_name_get = function(parameter) {
            var barcode_no = parameter.barcode_no;
            var employee = "[{\"employee_no\":\"90001\",\"employee_name\":\"王大明\"},{\"employee_no\":\"90000\",\"employee_name\":\"張小峰\"}]";
            employee = JSON.parse(employee);
            var index = employee.findIndex(function(item) {
                return barcode_no == item.employee_no;
            });
            if (index !== -1) {
                return {
                    "employee_no": employee[index].employee_no,
                    "employee_name": employee[index].employee_name
                };
            } else {
                return {
                    "employee_no": "9999",
                    "employee_name": "體驗帳號"
                };
            }
        };

        self.app_wo_process_machine_get = function(parameter) {
            var barcode_no = parameter.barcode_no;
            var workstation = "[{\"workstation_no\":\"T001\",\"workstation_name\":\"T001工作站\"},{\"workstation_no\":\"T002\",\"workstation_name\":\"T002工作站\"}]";
            workstation = JSON.parse(workstation);
            index = workstation.findIndex(function(item) {
                return barcode_no == item.workstation_no;
            });
            if (index !== -1) {
                return {
                    "return_type": 5,
                    "workstation_no": workstation[index].workstation_no,
                    "workstation_name": workstation[index].workstation_name
                };
            }

            var employee = "[{\"employee_no\":\"90001\",\"employee_name\":\"王大明\"},{\"employee_no\":\"90000\",\"employee_name\":\"張小峰\"}]";
            employee = JSON.parse(employee);
            index = employee.findIndex(function(item) {
                return barcode_no == item.employee_no;
            });
            if (index !== -1) {
                return {
                    "return_type": 4,
                    "employee_no": employee[index].employee_no,
                    "employee_name": employee[index].employee_name
                };
            }

            var shift = "[{\"oogd001\":\"001\",\"oogd002\":\"早班\"},{\"oogd001\":\"002\",\"oogd002\":\"中班\"},{\"oogd001\":\"003\",\"oogd002\":\"晚班\"},{\"oogd001\":\"004\",\"oogd002\":\"特別班1\"},{\"oogd001\":\"005\",\"oogd002\":\"特別班2\"},{\"oogd001\":\"006\",\"oogd002\":\"特別班3\"},{\"oogd001\":\"007\",\"oogd002\":\"大夜班\"}]";
            shift = JSON.parse(shift);
            index = shift.findIndex(function(item) {
                return barcode_no == item.oogd001;
            });
            if (index !== -1) {
                return {
                    "return_type": 3,
                    "shift_no": barcode_no,
                    "shift_name": shift[index].oogd002
                };
            }

            var machine = "[{\"mrba001\":\"YS-003\",\"mrba004\":\"測試機器3\"},{\"mrba001\":\"YS-002\",\"mrba004\":\"測試機器2\"},{\"mrba001\":\"YS-001\",\"mrba004\":\"測試機器1\"}]";
            machine = JSON.parse(machine);
            index = machine.findIndex(function(item) {
                return barcode_no == item.mrba001;
            });
            if (index !== -1) {
                return {
                    "return_type": 2,
                    "machine_no": barcode_no,
                    "machine_name": machine[index].mrba004
                };
            }

            if (barcode_no == "CTC-LB4-160900000002%0%10") {
                barcode = "{\"return_type\":1,\"wo_no\":\"CTC-LB4-160900000002\",\"run_card_no\":0,\"seq\":10,\"workstation_no\":\"LIGHT001\",\"workstation_name\":\"工作站1(資料整測-新增)\",\"op_no\":\"1010\",\"op_name\":\"印刷\",\"op_seq\":\"1\",\"item_no\":\"02013P03\",\"item_name\":\"廠內測試主料\",\"item_spec\":\"紅\",\"reports_qty\":30,\"qty\":12,\"work_hours\":20}";
                return JSON.parse(barcode);
            } else if (barcode_no == "CTC-LB4-160900000002%0%20") {
                barcode = "{\"return_type\":1,\"wo_no\":\"CTC-LB4-160900000002\",\"run_card_no\":0,\"seq\":10,\"workstation_no\":\"LIGHT001\",\"workstation_name\":\"工作站1(資料整測-新增)\",\"op_no\":\"1010\",\"op_name\":\"印刷\",\"op_seq\":\"1\",\"item_no\":\"02013P03\",\"item_name\":\"廠內測試主料\",\"item_spec\":\"紅\",\"reports_qty\":30,\"qty\":12,\"work_hours\":20}";
                return JSON.parse(barcode);
            } else {
                errorpop("無此筆資料");
                return {
                    "return_type": 0
                };
            }

        };

        self.app_bc_stock_count_data_get = function(parameter) {
            var flag = true;
            var barcode_no = "";
            for (var i = 0; i < parameter.condition.length; i++) {
                var temp = parameter.condition[i];
                if (temp.seq == "3") {
                    if (temp.value !== "1000") {
                        flag = false;
                        break;
                    }
                }
                if (temp.seq == "6") {
                    barcode_no = temp.value;
                }
            }

            var counting = [];
            if (flag) {
                if (barcode_no) {
                    switch (barcode_no) {
                        case "AB020130001":
                            counting = [{
                                "label_no": "CTC-PD0-160600000002",
                                "seq": 0,
                                "barcode_no": "AB020130001",
                                "item_no": "02013P02",
                                "item_feature_no": " ",
                                "warehouse_no": "1000",
                                "storage_spaces_no": " ",
                                "lot_no": " ",
                                "blank_label": "N",
                                "inventory_qty": 100,
                                "qty": 80,
                                "completed": "N",
                                "status": "N",
                                "reference_unit_no": "PCE",
                                "reference_qty": 10,
                                "packing_barcode": "",
                                "highest_packing_barcode": "",
                            }];
                            break;
                        case "AB020139999":
                            counting = [{
                                "label_no": "CTC-PD0-160600000002",
                                "seq": 0,
                                "barcode_no": "AB020130001",
                                "item_no": "02013P02",
                                "item_feature_no": " ",
                                "warehouse_no": "1000",
                                "storage_spaces_no": " ",
                                "lot_no": " ",
                                "blank_label": "N",
                                "inventory_qty": 100,
                                "qty": 80,
                                "completed": "N",
                                "status": "N",
                                "reference_unit_no": "PCE",
                                "reference_qty": 10,
                                "packing_barcode": "AB020139999",
                                "highest_packing_barcode": "AB020139999",
                            }, {
                                "label_no": "CTC-PD0-160600000002",
                                "seq": 0,
                                "barcode_no": "AB020130002",
                                "item_no": "02013P02",
                                "item_feature_no": " ",
                                "warehouse_no": "1000",
                                "storage_spaces_no": " ",
                                "lot_no": " ",
                                "blank_label": "N",
                                "inventory_qty": 100,
                                "qty": 4,
                                "completed": "N",
                                "status": "N",
                                "reference_unit_no": "PCE",
                                "reference_qty": 10,
                                "packing_barcode": "AB020139999",
                                "highest_packing_barcode": "AB020139999",
                            }, {
                                "label_no": "CTC-PD0-160600000002",
                                "seq": 0,
                                "barcode_no": "AB020130003",
                                "item_no": "02013P02",
                                "item_feature_no": " ",
                                "warehouse_no": "1000",
                                "storage_spaces_no": " ",
                                "lot_no": " ",
                                "blank_label": "N",
                                "inventory_qty": 100,
                                "qty": 2,
                                "completed": "N",
                                "status": "N",
                                "reference_unit_no": "PCE",
                                "reference_qty": 10,
                                "packing_barcode": "AB020139999",
                                "highest_packing_barcode": "AB020139999",
                            }];
                            break;
                    }
                } else {
                    counting = [{
                        "label_no": "CTC-PD0-160600000002",
                        "seq": 0,
                        "barcode_no": "AB020130001",
                        "item_no": "02013P02",
                        "item_feature_no": " ",
                        "warehouse_no": "1000",
                        "storage_spaces_no": " ",
                        "lot_no": " ",
                        "blank_label": "N",
                        "inventory_qty": 100,
                        "qty": 80,
                        "completed": "N",
                        "status": "N",
                        "reference_unit_no": "PCE",
                        "reference_qty": 10,
                        "packing_barcode": "",
                        "highest_packing_barcode": "",
                    }, {
                        "label_no": "CTC-PD0-160600000002",
                        "seq": 0,
                        "barcode_no": "AB020130002",
                        "item_no": "02013P02",
                        "item_feature_no": " ",
                        "warehouse_no": "1000",
                        "storage_spaces_no": " ",
                        "lot_no": " ",
                        "blank_label": "N",
                        "inventory_qty": 100,
                        "qty": 4,
                        "completed": "N",
                        "status": "N",
                        "reference_unit_no": "PCE",
                        "reference_qty": 10,
                        "packing_barcode": "",
                        "highest_packing_barcode": "",
                    }, {
                        "label_no": "CTC-PD0-160600000002",
                        "seq": 0,
                        "barcode_no": "AB020130003",
                        "item_no": "02013P02",
                        "item_feature_no": " ",
                        "warehouse_no": "1000",
                        "storage_spaces_no": " ",
                        "lot_no": " ",
                        "blank_label": "N",
                        "inventory_qty": 100,
                        "qty": 2,
                        "completed": "N",
                        "status": "N",
                        "reference_unit_no": "PCE",
                        "reference_qty": 10,
                        "packing_barcode": "",
                        "highest_packing_barcode": "",
                    }];
                }
            }
            return {
                "counting": counting
            };
        };

        self.app_stock_data_get = function(parameter) {
            var scan_barcode = parameter.scan_barcode;
            var scan_warehouse_no = parameter.scan_warehouse_no;
            var scan_storage_spaces_no = parameter.scan_storage_spaces_no;
            return {
                "item_detail": [{
                    "item_no": "02013P02",
                    "item_name": "P02廠內測試原料",
                    "item_spec": "P02",
                    "warehouse_no": "FER002",
                    "storage_spaces_no": "AA",
                    "lot_no": "",
                    "inventory_unit": "PCS",
                    "inventory_qty": "100",
                    "reference_unit_no": "PCS",
                    "reference_qty": "100",
                }, {
                    "item_no": "02013P02",
                    "item_name": "P02廠內測試原料",
                    "item_spec": "P02",
                    "warehouse_no": "0235",
                    "storage_spaces_no": "0235-1",
                    "lot_no": "",
                    "inventory_unit": "PCS",
                    "inventory_qty": "100"
                }],
                "barcode_detail": [{
                    "barcode_no": scan_barcode,
                    "item_no": "02013P02",
                    "item_name": "P02廠內測試原料",
                    "item_spec": "P02",
                    'warehouse_no': scan_warehouse_no,
                    "storage_spaces_no": scan_storage_spaces_no,
                    "lot_no": "1",
                    "inventory_qty": "90",
                    "inventory_unit": "PCS"
                }, {
                    "barcode_no": scan_barcode,
                    "item_no": "02013P02",
                    "item_name": "P02廠內測試原料",
                    "item_spec": "P02",
                    'warehouse_no': scan_warehouse_no,
                    "storage_spaces_no": scan_storage_spaces_no,
                    "lot_no": "2",
                    "inventory_qty": "80",
                    "inventory_unit": "PCS"
                }, {
                    "barcode_no": scan_barcode,
                    "item_no": "02013P02",
                    "item_name": "P02廠內測試原料",
                    "item_spec": "P02",
                    "warehouse_no": scan_warehouse_no,
                    "storage_spaces_no": scan_storage_spaces_no,
                    "lot_no": "3",
                    "inventory_qty": "70",
                    "inventory_unit": "PCS",
                    "reference_unit_no": "PCS",
                    "reference_qty": "100",
                }, {
                    "barcode_no": scan_barcode,
                    "item_no": "02013P02",
                    "item_name": "P02廠內測試原料",
                    "item_spec": "P02",
                    "warehouse_no": scan_warehouse_no,
                    "storage_spaces_no": scan_storage_spaces_no,
                    "lot_no": "4",
                    "inventory_qty": "60",
                    "inventory_unit": "60"
                }, {
                    "barcode_no": scan_barcode,
                    "item_no": "02013P02",
                    "item_name": "P02廠內測試原料",
                    "item_spec": "P02",
                    "warehouse_no": scan_warehouse_no,
                    "storage_spaces_no": scan_storage_spaces_no,
                    "lot_no": "5",
                    "inventory_qty": "50",
                    "inventory_unit": "PCS"
                }]
            };
        };

        self.log_infomation_get = function(parameter) {
            return {
                // "basic_data_download": "",
                // "inventory_operation": "",
                // "out_in_operation": "",
                "enterprise_site": [{
                    "enterprise_no": 99,
                    "site_no": "DSCTC",
                    "account": "dsc",
                    "enterprise_lang": "鼎捷測試企業",
                    "site_lang": "鼎新台中國泰"
                }]
            };
        };

        self.getUser = function() {
            return [{
                "employee_no": "99999",
                "employee_name": "體驗帳號",
                "language": "zh_TW",
                "department_no": "BP0244",
                "department_name": "BP0244",
                "manage_barcode_inventory": "Y",
                "feature": "N",
                "valuation_unit": "3",
            }];
        };

        self.setAccount = function(account) {
            self.testData = false;
            if (account == "dsc" || account == "digiwin" || account == "root") {
                self.testData = true;
            }
        };

        self.getUserInfo = function(account, server_ip, server_area, server_product, permission_ip, site_no) {
            return {
                "server_ip": server_ip || '10.40.40.18',
                "server_area": server_area || 't10dev',
                "server_product": server_product || "T100",
                "permission_ip": permission_ip || "999",
                "barcode_repeat": true,
                "barcode_separator": '%',
                "warehouse_separator": '@',
                "plant_id": "AA",
                "mr_no": '123',
                "mi_no": '456',
                "reason_no": '001',
                "camera_used": true,
                "inventory_display": false,
                "report_datetime": '2016-01-01',
                "warehouse_no": '1000',
                "machine_no": 'TEST',
                "shift_no": 'SHIFT',
                "all_1_no": 'AAA',
                "all_2_no": 'BBB',
                "all_3_no": 'CCC',
                "warehouse_way_cost": 'COS',
                "warehouse_way": 'UNCOS',
                "enterprise_no": 99,
                "site_no": site_no || 'DSCTC',
                "account": account || 'dsc',
                "employee_no": '99999',
                "employee_name": '體驗帳號',
                "language": 'zh_TW',
                "department_no": 'BP0244',
                "department_name": 'BP0244',
                "last_log_time": '2016-01-01',
                "log_in": 'Y',
            };

        };

        //ZHEN-170419-(S)
        self.getAppShowme = function () {
            return [
                true,
                true,
                true,
                true,
                true,
                true,
                true,
                true,
                true,
                true,
                true,
                true,
                true,
                true,
                true,
                true
            ]
        };

        self.getAppDataList = function () {
            return {
                types_1: [
                    {
                        peroid: "2017/01/01",
                        forcast_amount: 367,
                        actual_amount: 214,
                        forcast_qty: 2694,
                        actual_qty: 1537
                    },
                    {
                        peroid: "2017/02/01",
                        forcast_amount: 425,
                        actual_amount: 309,
                        forcast_qty: 889,
                        actual_qty: 18
                    },
                    {
                        peroid: "2017/03/01",
                        forcast_amount: 52,
                        actual_amount: 496,
                        forcast_qty: 2989,
                        actual_qty: 4655
                    },
                    {
                        peroid: "2017/04/01",
                        forcast_amount: 52,
                        actual_amount: 308,
                        forcast_qty: 946,
                        actual_qty: 4682
                    },
                    {
                        peroid: "2017/05/01",
                        forcast_amount: 4,
                        actual_amount: 496,
                        forcast_qty: 4830,
                        actual_qty: 2231
                    },
                    {
                        peroid: "2017/06/01",
                        forcast_amount: 213,
                        actual_amount: 227,
                        forcast_qty: 4471,
                        actual_qty: 864
                    },
                    {
                        peroid: "2017/07/01",
                        forcast_amount: 279,
                        actual_amount: 491,
                        forcast_qty: 444,
                        actual_qty: 3882
                    },
                    {
                        peroid: "2017/08/01",
                        forcast_amount: 287,
                        actual_amount: 481,
                        forcast_qty: 2101,
                        actual_qty: 4661
                    },
                    {
                        peroid: "2017/09/01",
                        forcast_amount: 287,
                        actual_amount: 481,
                        forcast_qty: 2101,
                        actual_qty: 4661
                    },
                    {
                        peroid: "2017/10/01",
                        forcast_amount: 318,
                        actual_amount: 473,
                        forcast_qty: 3614,
                        actual_qty: 4040
                    },
                    {
                        peroid: "2017/11/01",
                        forcast_amount: 423,
                        actual_amount: 457,
                        forcast_qty: 4553,
                        actual_qty: 3993
                    },
                    {
                        peroid: "2017/12/01",
                        forcast_amount: 188,
                        actual_amount: 124,
                        forcast_qty: 3147,
                        actual_qty: 3937
                    }
                ],
                types_2: [
                    {
                        peroid: "2017/01/01",
                        forcast_amount: 367,
                        actual_amount: 214,
                        forcast_qty: 2694,
                        actual_qty: 1537
                    },
                    {
                        peroid: "2017/02/01",
                        forcast_amount: 425,
                        actual_amount: 309,
                        forcast_qty: 889,
                        actual_qty: 18
                    },
                    {
                        peroid: "2017/03/01",
                        forcast_amount: 52,
                        actual_amount: 496,
                        forcast_qty: 2989,
                        actual_qty: 4655
                    },
                    {
                        peroid: "2017/04/01",
                        forcast_amount: 52,
                        actual_amount: 308,
                        forcast_qty: 946,
                        actual_qty: 4682
                    },
                    {
                        peroid: "2017/05/01",
                        forcast_amount: 4,
                        actual_amount: 496,
                        forcast_qty: 4830,
                        actual_qty: 2231
                    },
                    {
                        peroid: "2017/06/01",
                        forcast_amount: 213,
                        actual_amount: 227,
                        forcast_qty: 4471,
                        actual_qty: 864
                    },
                    {
                        peroid: "2017/07/01",
                        forcast_amount: 279,
                        actual_amount: 491,
                        forcast_qty: 444,
                        actual_qty: 3882
                    },
                    {
                        peroid: "2017/08/01",
                        forcast_amount: 287,
                        actual_amount: 481,
                        forcast_qty: 2101,
                        actual_qty: 4661
                    },
                    {
                        peroid: "2017/09/01",
                        forcast_amount: 287,
                        actual_amount: 481,
                        forcast_qty: 2101,
                        actual_qty: 4661
                    },
                    {
                        peroid: "2017/10/01",
                        forcast_amount: 318,
                        actual_amount: 473,
                        forcast_qty: 3614,
                        actual_qty: 4040
                    },
                    {
                        peroid: "2017/11/01",
                        forcast_amount: 423,
                        actual_amount: 457,
                        forcast_qty: 4553,
                        actual_qty: 3993
                    },
                    {
                        peroid: "2017/12/01",
                        forcast_amount: 188,
                        actual_amount: 124,
                        forcast_qty: 3147,
                        actual_qty: 3937
                    }
                ],
                types_3: [],
                types_4: [],
                types_5: [],
                types_6: [],
                types_7: [],
                types_8: [],
                types_9: [],
                types_10: [],
                types_11: [],
                types_12: [],
                types_13: [],
                types_14: [],
                types_15: [],
                types_16: []
            };
        };

        self.getDocItem = function (doc, seq) {
            var objList = {
                "2001-201707000001": {
                    "1": {
                        "item_no": "JA71H03961-00M",
                        "item_desc": "JA71H03961-00M",
                        "item_spec": "",
                        "store": "W300",
                        "location": "B100",
                        "lot": "00001",
                        "qty": 10
                    },
                    "2": {
                        "item_no": "JANG-4561391CY-G",
                        "item_desc": "JANG-4561391CY-G",
                        "item_spec": "",
                        "store": "W300",
                        "location": "A101",
                        "lot": "00001",
                        "qty": 10
                    },
                    "3": {
                        "item_no": "JANG-5425464UY-G",
                        "item_desc": "JANG-5425464UY-G",
                        "item_spec": "",
                        "store": "W300",
                        "location": "C103",
                        "lot": "00001",
                        "qty": 10
                    },
                    "4": {
                        "item_no": "JANG-5670689US-G",
                        "item_desc": "JANG-5670689US-G",
                        "item_spec": "",
                        "store": "W300",
                        "location": "D100",
                        "lot": "00001",
                        "qty": 10
                    },
                    "5": {
                        "item_no": "JANG-5725952ES-G",
                        "item_desc": "JANG-5725952ES-G",
                        "item_spec": "",
                        "store": "W300",
                        "location": "A102",
                        "lot": "00001",
                        "qty": 10
                    },
                    "6": {
                        "item_no": "JAPA-NG04NCDBF-G",
                        "item_desc": "JAPA-NG04NCDBF-G",
                        "item_spec": "",
                        "store": "W300",
                        "location": "B104",
                        "lot": "00001",
                        "qty": 10
                    },
                    "7": {
                        "item_no": "JPAC-0014538DY-",
                        "item_desc": "JPAC-0014538DY-",
                        "item_spec": "",
                        "store": "W300",
                        "location": "D100",
                        "lot": "00001",
                        "qty": 10
                    },
                    "8": {
                        "item_no": "JPAC-B214429DY-G",
                        "item_desc": "JPAC-B214429DY-G",
                        "item_spec": "",
                        "store": "W300",
                        "location": "A100",
                        "lot": "00001",
                        "qty": 10
                    },
                    "9": {
                        "item_no": "JPAC-C364431AW-G",
                        "item_desc": "JPAC-C364431AW-G",
                        "item_spec": "",
                        "store": "W300",
                        "location": "A104",
                        "lot": "00003",
                        "qty": 10
                    },
                    "10": {
                        "item_no": "JPAC-F714432AW-G",
                        "item_desc": "JPAC-F714432AW-G",
                        "item_spec": "",
                        "store": "W300",
                        "location": "C104",
                        "lot": "00001",
                        "qty": 10
                    }
                },
                "2001-201707000002": {
                    "1": {
                        "item_no": "JA71H03961-00M",
                        "item_desc": "JA71H03961-00M",
                        "item_spec": "",
                        "store": "W300",
                        "location": "B100",
                        "lot": "00002",
                        "qty": 5
                    },
                    "2": {
                        "item_no": "JANG-4561391CY-G",
                        "item_desc": "JANG-4561391CY-G",
                        "item_spec": "",
                        "store": "W300",
                        "location": "A101",
                        "lot": "00001",
                        "qty": 5
                    },
                    "3": {
                        "item_no": "JANG-5425464UY-G",
                        "item_desc": "JANG-5425464UY-G",
                        "item_spec": "",
                        "store": "W300",
                        "location": "C103",
                        "lot": "00001",
                        "qty": 5
                    },
                    "4": {
                        "item_no": "JANG-5670689US-G",
                        "item_desc": "JANG-5670689US-G",
                        "item_spec": "",
                        "store": "W300",
                        "location": "D100",
                        "lot": "00002",
                        "qty": 5
                    },
                    "5": {
                        "item_no": "JANG-5725952ES-G",
                        "item_desc": "JANG-5725952ES-G",
                        "item_spec": "",
                        "store": "W300",
                        "location": "A102",
                        "lot": "00001",
                        "qty": 5
                    },
                    "6": {
                        "item_no": "JAPA-NG04NCDBF-G",
                        "item_desc": "JAPA-NG04NCDBF-G",
                        "item_spec": "",
                        "store": "W300",
                        "location": "B104",
                        "lot": "00001",
                        "qty": 5
                    },
                    "7": {
                        "item_no": "JPAC-0014538DY-",
                        "item_desc": "JPAC-0014538DY-",
                        "item_spec": "",
                        "store": "W300",
                        "location": "D100",
                        "lot": "00002",
                        "qty": 5
                    }
                },
                "2001-201707000003": {
                    "1": {
                        "item_no": "JPC--L6411NDGE-G",
                        "item_desc": "JPC--L6411NDGE-G",
                        "item_spec": "",
                        "store": "W300",
                        "location": "A104",
                        "lot": "00001",
                        "qty": 3
                    },
                    "2": {
                        "item_no": "JPC--P121RNAGE-G",
                        "item_desc": "JPC--P121RNAGE-G",
                        "item_spec": "",
                        "store": "W300",
                        "location": "A105",
                        "lot": "00001",
                        "qty": 3
                    },
                    "3": {
                        "item_no": "JPC--PC121NTGE-G",
                        "item_desc": "JPC--PC121NTGE-G",
                        "item_spec": "",
                        "store": "W300",
                        "location": "B101",
                        "lot": "00001",
                        "qty": 3
                    }
                },
                "2001-201707000004": {
                    "1": {
                        "item_no": "JPLU-95957729DAG",
                        "item_desc": "JPLU-95957729DAG",
                        "item_spec": "",
                        "store": "W300",
                        "location": "C103",
                        "lot": "00001",
                        "qty": 8
                    }
                },
                "2001-201707000005": {
                    "1": {
                        "item_no": "JSAC-0053F37HT-",
                        "item_desc": "JSAC-0053F37HT-",
                        "item_spec": "",
                        "store": "W300",
                        "location": "D105",
                        "lot": "00001",
                        "qty": 2
                    },
                    "2": {
                        "item_no": "JSAC-1331498NT-",
                        "item_desc": "JSAC-1331498NT-",
                        "item_spec": "",
                        "store": "W300",
                        "location": "D102",
                        "lot": "00001",
                        "qty": 2
                    }
                },
                "2001-201707000006": {
                    "1": {
                        "item_no": "JANG-4561391CY-G",
                        "item_desc": "JANG-4561391CY-G",
                        "item_spec": "",
                        "store": "W300",
                        "location": "A101",
                        "lot": "00001",
                        "qty": 15
                    },
                    "2": {
                        "item_no": "JANG-5425464UY-G",
                        "item_desc": "JANG-5425464UY-G",
                        "item_spec": "",
                        "store": "W300",
                        "location": "C103",
                        "lot": "00001",
                        "qty": 15
                    },
                    "3": {
                        "item_no": "JANG-5670689US-G",
                        "item_desc": "JANG-5670689US-G",
                        "item_spec": "",
                        "store": "W300",
                        "location": "D100",
                        "lot": "00001",
                        "qty": 15
                    },
                    "4": {
                        "item_no": "JANG-5725952ES-G",
                        "item_desc": "JANG-5725952ES-G",
                        "item_spec": "",
                        "store": "W300",
                        "location": "A102",
                        "lot": "00001",
                        "qty": 15
                    },
                    "5": {
                        "item_no": "JAPA-NG04NCDBF-G",
                        "item_desc": "JAPA-NG04NCDBF-G",
                        "item_spec": "",
                        "store": "W300",
                        "location": "B104",
                        "lot": "00001",
                        "qty": 15
                    },
                    "6": {
                        "item_no": "JPAC-0014538DY-",
                        "item_desc": "JPAC-0014538DY-",
                        "item_spec": "",
                        "store": "W300",
                        "location": "D102",
                        "lot": "00003",
                        "qty": 15
                    },
                    "7": {
                        "item_no": "JPAC-B214429DY-G",
                        "item_desc": "JPAC-B214429DY-G",
                        "item_spec": "",
                        "store": "W300",
                        "location": "A100",
                        "lot": "00001",
                        "qty": 15
                    },
                    "8": {
                        "item_no": "JPAC-C364431AW-G",
                        "item_desc": "JPAC-C364431AW-G",
                        "item_spec": "",
                        "store": "W300",
                        "location": "A104",
                        "lot": "00004",
                        "qty": 15
                    },
                    "9": {
                        "item_no": "JPAC-F714432AW-G",
                        "item_desc": "JPAC-F714432AW-G",
                        "item_spec": "",
                        "store": "W300",
                        "location": "C104",
                        "lot": "00001",
                        "qty": 15
                    }
                }
            };

            return objList[doc][seq];
        };

        self.getItemLot = function () {
            var doc_array = [
                {
                    "item_no": "JA71H03961-00M",
                    "item_desc": "JA71H03961-00M",
                    "item_spec": "",
                    "store": "W300",
                    "location": "B100",
                    "lot": "00001",
                    "qty": 1000
                },
                {
                    "item_no": "JA71H03961-00M",
                    "item_desc": "JA71H03961-00M",
                    "item_spec": "",
                    "store": "W300",
                    "location": "B100",
                    "lot": "00002",
                    "qty": 1000
                },
                {
                    "item_no": "JA71H03961-00M",
                    "item_desc": "JA71H03961-00M",
                    "item_spec": "",
                    "store": "W300",
                    "location": "B100",
                    "lot": "00003",
                    "qty": 1000
                },
                {
                    "item_no": "JANG-4561391CY-G",
                    "item_desc": "JANG-4561391CY-G",
                    "item_spec": "",
                    "store": "W300",
                    "location": "A101",
                    "lot": "00001",
                    "qty": 1000
                },
                {
                    "item_no": "JANG-5425464UY-G",
                    "item_desc": "JANG-5425464UY-G",
                    "item_spec": "",
                    "store": "W300",
                    "location": "C103",
                    "lot": "00001",
                    "qty": 1000
                },
                {
                    "item_no": "JANG-5670689US-G",
                    "item_desc": "JANG-5670689US-G",
                    "item_spec": "",
                    "store": "W300",
                    "location": "D100",
                    "lot": "00001",
                    "qty": 1000
                },
                {
                    "item_no": "JANG-5670689US-G",
                    "item_desc": "JANG-5670689US-G",
                    "item_spec": "",
                    "store": "W300",
                    "location": "D100",
                    "lot": "00002",
                    "qty": 1000
                },
                {
                    "item_no": "JANG-5725952ES-G",
                    "item_desc": "JANG-5725952ES-G",
                    "item_spec": "",
                    "store": "W300",
                    "location": "A102",
                    "lot": "00001",
                    "qty": 1000
                },
                {
                    "item_no": "JAPA-NG04NCDBF-G",
                    "item_desc": "JAPA-NG04NCDBF-G",
                    "item_spec": "",
                    "store": "W300",
                    "location": "B104",
                    "lot": "00001",
                    "qty": 1000
                },
                {
                    "item_no": "JPAC-0014538DY-",
                    "item_desc": "JPAC-0014538DY-",
                    "item_spec": "",
                    "store": "W300",
                    "location": "D102",
                    "lot": "00003",
                    "qty": 1000
                },
                {
                    "item_no": "JPAC-0014538DY-",
                    "item_desc": "JPAC-0014538DY-",
                    "item_spec": "",
                    "store": "W300",
                    "location": "D100",
                    "lot": "00001",
                    "qty": 1000
                },
                {
                    "item_no": "JPAC-0014538DY-",
                    "item_desc": "JPAC-0014538DY-",
                    "item_spec": "",
                    "store": "W300",
                    "location": "D100",
                    "lot": "00002",
                    "qty": 1000
                },
                {
                    "item_no": "JPAC-B214429DY-G",
                    "item_desc": "JPAC-B214429DY-G",
                    "item_spec": "",
                    "store": "W300",
                    "location": "A100",
                    "lot": "00001",
                    "qty": 1000
                },
                {
                    "item_no": "JPAC-C364431AW-G",
                    "item_desc": "JPAC-C364431AW-G",
                    "item_spec": "",
                    "store": "W300",
                    "location": "A104",
                    "lot": "00003",
                    "qty": 1000
                },
                {
                    "item_no": "JPAC-C364431AW-G",
                    "item_desc": "JPAC-C364431AW-G",
                    "item_spec": "",
                    "store": "W300",
                    "location": "A104",
                    "lot": "00004",
                    "qty": 1000
                },
                {
                    "item_no": "JPAC-C364431AW-G",
                    "item_desc": "JPAC-C364431AW-G",
                    "item_spec": "",
                    "store": "W300",
                    "location": "A104",
                    "lot": "00005",
                    "qty": 1000
                },
                {
                    "item_no": "JPAC-C364431AW-G",
                    "item_desc": "JPAC-C364431AW-G",
                    "item_spec": "",
                    "store": "W300",
                    "location": "B102",
                    "lot": "00001",
                    "qty": 1000
                },
                {
                    "item_no": "JPAC-C364431AW-G",
                    "item_desc": "JPAC-C364431AW-G",
                    "item_spec": "",
                    "store": "W300",
                    "location": "B102",
                    "lot": "00002",
                    "qty": 1000
                },
                {
                    "item_no": "JPAC-F714432AW-G",
                    "item_desc": "JPAC-F714432AW-G",
                    "item_spec": "",
                    "store": "W300",
                    "location": "C104",
                    "lot": "00001",
                    "qty": 1000
                },
                {
                    "item_no": "JPAM-A55302DNNNG",
                    "item_desc": "JPAM-A55302DNNNG",
                    "item_spec": "",
                    "store": "W300",
                    "location": "C100",
                    "lot": "00001",
                    "qty": 1000
                },
                {
                    "item_no": "JPC--L1112NWGEAG",
                    "item_desc": "JPC--L1112NWGEAG",
                    "item_spec": "",
                    "store": "W300",
                    "location": "C101",
                    "lot": "00001",
                    "qty": 1000
                },
                {
                    "item_no": "JPC--L1112NWGEAG",
                    "item_desc": "JPC--L1112NWGEAG",
                    "item_spec": "",
                    "store": "W300",
                    "location": "C101",
                    "lot": "00002",
                    "qty": 1000
                },
                {
                    "item_no": "JPC--L6411NDGE-G",
                    "item_desc": "JPC--L6411NDGE-G",
                    "item_spec": "",
                    "store": "W300",
                    "location": "A104",
                    "lot": "00001",
                    "qty": 1000
                },
                {
                    "item_no": "JPC--P121RNAGE-G",
                    "item_desc": "JPC--P121RNAGE-G",
                    "item_spec": "",
                    "store": "W300",
                    "location": "A105",
                    "lot": "00001",
                    "qty": 1000
                },
                {
                    "item_no": "JPC--P121RNAGE-G",
                    "item_desc": "JPC--P121RNAGE-G",
                    "item_spec": "",
                    "store": "W300",
                    "location": "A105",
                    "lot": "00002",
                    "qty": 1000
                },
                {
                    "item_no": "JPC--PC121NTGE-G",
                    "item_desc": "JPC--PC121NTGE-G",
                    "item_spec": "",
                    "store": "W300",
                    "location": "B101",
                    "lot": "00001",
                    "qty": 1000
                },
                {
                    "item_no": "JPLU-93707492D-G",
                    "item_desc": "JPLU-93707492D-G",
                    "item_spec": "",
                    "store": "W300",
                    "location": "B100",
                    "lot": "00001",
                    "qty": 1000
                },
                {
                    "item_no": "JPLU-93707492D-G",
                    "item_desc": "JPLU-93707492D-G",
                    "item_spec": "",
                    "store": "W300",
                    "location": "B100",
                    "lot": "00002",
                    "qty": 1000
                },
                {
                    "item_no": "JPLU-95957729DAG",
                    "item_desc": "JPLU-95957729DAG",
                    "item_spec": "",
                    "store": "W300",
                    "location": "C103",
                    "lot": "00001",
                    "qty": 1000
                },
                {
                    "item_no": "JPRT-D991319RT-G",
                    "item_desc": "JPRT-D991319RT-G",
                    "item_spec": "",
                    "store": "W300",
                    "location": "C105",
                    "lot": "00001",
                    "qty": 1000
                },
                {
                    "item_no": "JPRT-D991319RT-G",
                    "item_desc": "JPRT-D991319RT-G",
                    "item_spec": "",
                    "store": "W300",
                    "location": "C105",
                    "lot": "00002",
                    "qty": 1000
                },
                {
                    "item_no": "JPRT-Q801326PY-G",
                    "item_desc": "JPRT-Q801326PY-G",
                    "item_spec": "",
                    "store": "W300",
                    "location": "B105",
                    "lot": "00001",
                    "qty": 1000
                },
                {
                    "item_no": "JPRT-W060727LD-G",
                    "item_desc": "JPRT-W060727LD-G",
                    "item_spec": "",
                    "store": "W300",
                    "location": "D104",
                    "lot": "00001",
                    "qty": 1000
                },
                {
                    "item_no": "JPRT-X372626LD-G",
                    "item_desc": "JPRT-X372626LD-G",
                    "item_spec": "",
                    "store": "W300",
                    "location": "D103",
                    "lot": "00001",
                    "qty": 1000
                },
                {
                    "item_no": "JSAC-0053F37HT-",
                    "item_desc": "JSAC-0053F37HT-",
                    "item_spec": "",
                    "store": "W300",
                    "location": "D105",
                    "lot": "00001",
                    "qty": 1000
                },
                {
                    "item_no": "JSAC-1331498NT-",
                    "item_desc": "JSAC-1331498NT-",
                    "item_spec": "",
                    "store": "W300",
                    "location": "D102",
                    "lot": "00001",
                    "qty": 1000
                }
            ];

            return doc_array;
        };

        self.getReceiptList = function (paramter) {
            var guide_the_role = paramter.guide_the_role;
            var date = new Date();
            var yyyy = date.getFullYear();
            var month = date.getMonth();
            var day = date.getDate();

            function getDate(yyyy, month, day, clac) {
                var date_out = new Date(yyyy, month, (day + clac));

                return date_out.getFullYear() +
                    "/" +
                    (date_out.getMonth() + 1) +
                    "/" +
                    date_out.getDate();
            };

            var sales_notice = {
                "0": [
                    {
                        type: "1",
                        item_no: "JA71H03961-00M",
                        item_desc: "J92 POP UP COVER",
                        item_spec: "",
                        unit_no: "kg",
                        qty: 2000,
                        po_no: "PO1-2017040001",
                        po_sno: 1,
                        datasource: "",
                        sourceno: "",
                        sourcesno: "",
                        vendor_no: "Nissin",
                        vendor_name: "日清",
                        shipping_date: getDate(yyyy, month, day, 0),
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "N",
                        light2: "G",
                        light3: "Y",
                        light4: "N",
                        light5: "Y",
                        light_num1: null,
                        light_num2: 1,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0,
                        reference_unit_no: "set",
                        reference_qty: 200,
                        reference_rate: 10,
                        reference_decimal_places: 2,
                        reference_decimal_places_type: 1,
                        valuation_unit_no:"kg",
                        valuation_qty: 20000,
                        multi_unit_type: 3      
                    }, {
                        type: "1",
                        item_no: "JANG-4561391CY-G",
                        item_desc: "37XX 銅彈片 PIN",
                        item_spec: "",
                        qty: 50000,
                        po_no: "PO1-2017040001",
                        po_sno: 2,
                        datasource: "",
                        sourceno: "",
                        sourcesno: "",
                        vendor_no: "Nissin",
                        vendor_name: "日清",
                        shipping_date: getDate(yyyy, month, day, 0),
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "N",
                        light2: "G",
                        light3: "Y",
                        light4: "N",
                        light5: "Y",
                        light_num1: null,
                        light_num2: 1,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0,
                        reference_unit_no: "set",
                        reference_qty: 1000,
                        reference_rate: 10,
                        reference_decimal_places: 2,
                        reference_decimal_places_type: 1,
                        valuation_unit_no:"kg",
                        valuation_qty: 100000,
                        multi_unit_type: 3
                    }, {
                        type: "1",
                        item_no: "JANG-5425464UY-G",
                        item_desc: "H44 INSERT METAL",
                        item_spec: "",
                        qty: 23000,
                        po_no: "PO1-2017040001",
                        po_sno: 3,
                        datasource: "",
                        sourceno: "",
                        sourcesno: "",
                        vendor_no: "Nissin",
                        vendor_name: "日清",
                        shipping_date: getDate(yyyy, month, day, 0),
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "N",
                        light2: "G",
                        light3: "Y",
                        light4: "N",
                        light5: "Y",
                        light_num1: null,
                        light_num2: 1,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0,
                        reference_unit_no: "set",
                        reference_qty: 100,
                        reference_rate: 5,
                        reference_decimal_places: 2,
                        reference_decimal_places_type: 1,
                        valuation_unit_no:"kg",
                        valuation_qty: 800,
                        multi_unit_type: 3
                    }, {
                        type: "1",
                        item_no: "JPAM-A55302DNNNG",
                        item_desc: "SNOWMAN 粗油漆筆 黑色",
                        item_spec: "",
                        qty: 1200,
                        po_no: "PO1-2017040003",
                        po_sno: 1,
                        datasource: "",
                        sourceno: "",
                        sourcesno: "",
                        vendor_no: "Italy million",
                        vendor_name: "意萬",
                        shipping_date: getDate(yyyy, month, day, -1),
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "N",
                        light2: "R",
                        light3: "Y",
                        light4: "N",
                        light5: "Y",
                        light_num1: null,
                        light_num2: -1,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0,
                        reference_unit_no: "set",
                        reference_qty: 200,
                        reference_rate: 10,
                        reference_decimal_places: 2,
                        reference_decimal_places_type: 1,
                        valuation_unit_no:"kg",
                        valuation_qty: 20000,
                        multi_unit_type: 2
                    }, {
                        type: "1",
                        item_no: "JPAC-F714432AW-G",
                        item_desc: "8格真空盤 白色",
                        item_spec: "",
                        qty: 500,
                        po_no: "PO1-2017040002",
                        po_sno: 7,
                        datasource: "",
                        sourceno: "",
                        sourcesno: "",
                        vendor_no: "tehlin",
                        vendor_name: "德林",
                        shipping_date: "",
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "Y",
                        light2: "N",
                        light3: "Y",
                        light4: "N",
                        light5: "Y",
                        light_num1: 0,
                        light_num2: null,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0,
                        reference_unit_no: "set",
                        reference_qty: 1000,
                        reference_rate: 10,
                        reference_decimal_places: 2,
                        reference_decimal_places_type: 1,
                        valuation_unit_no:"kg",
                        valuation_qty: 100000,
                        multi_unit_type: 1
                    }, {
                        type: "1",
                        item_no: "JPC--L1112NWGEAG",
                        item_desc: "PC EXL1112 白色",
                        item_spec: "",
                        qty: 3790,
                        po_no: "PO1-2017040003",
                        po_sno: 2,
                        datasource: "",
                        sourceno: "",
                        sourcesno: "",
                        vendor_no: "Italy million",
                        vendor_name: "意萬",
                        shipping_date: getDate(yyyy, month, day, 1),
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "Y",
                        light2: "N",
                        light3: "Y",
                        light4: "N",
                        light5: "Y",
                        light_num1: 1,
                        light_num2: null,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JPC--L6411NDGE-G",
                        item_desc: "PC ML6411 黑色",
                        item_spec: "",
                        qty: 200,
                        po_no: "PO1-2017040003",
                        po_sno: 3,
                        datasource: "",
                        sourceno: "",
                        sourcesno: "",
                        vendor_no: "Italy million",
                        vendor_name: "意萬",
                        shipping_date: getDate(yyyy, month, day, 1),
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "Y",
                        light2: "N",
                        light3: "Y",
                        light4: "N",
                        light5: "Y",
                        light_num1: 1,
                        light_num2: null,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JPC--P121RNAGE-G",
                        item_desc: "PC 本色",
                        item_spec: "",
                        qty: 50,
                        po_no: "PO1-2017040003",
                        po_sno: 4,
                        datasource: "",
                        sourceno: "",
                        sourcesno: "",
                        vendor_no: "Italy million",
                        vendor_name: "意萬",
                        shipping_date: getDate(yyyy, month, day, 1),
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "Y",
                        light2: "N",
                        light3: "Y",
                        light4: "N",
                        light5: "Y",
                        light_num1: 1,
                        light_num2: null,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JPAC-0014538DY-",
                        item_desc: "A箱紙箱",
                        item_spec: "",
                        qty: 10000,
                        po_no: "PO1-2017040002",
                        po_sno: 4,
                        datasource: "",
                        sourceno: "",
                        sourcesno: "",
                        vendor_no: "tehlin",
                        vendor_name: "德林",
                        shipping_date: getDate(yyyy, month, day, 2),
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "Y",
                        light2: "N",
                        light3: "N",
                        light4: "N",
                        light5: "N",
                        light_num1: 2,
                        light_num2: null,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JPAC-B214429DY-G",
                        item_desc: "紙箱",
                        item_spec: "",
                        qty: 2000,
                        po_no: "PO1-2017040002",
                        po_sno: 5,
                        datasource: "",
                        sourceno: "",
                        sourcesno: "",
                        vendor_no: "tehlin",
                        vendor_name: "德林",
                        shipping_date: getDate(yyyy, month, day, 2),
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "Y",
                        light2: "N",
                        light3: "N",
                        light4: "N",
                        light5: "N",
                        light_num1: 2,
                        light_num2: null,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JPAC-C364431AW-G",
                        item_desc: "8格 真空盤 白色",
                        item_spec: "",
                        qty: 430000,
                        po_no: "PO1-2017040002",
                        po_sno: 6,
                        datasource: "",
                        sourceno: "",
                        sourcesno: "",
                        vendor_no: "tehlin",
                        vendor_name: "德林",
                        shipping_date: getDate(yyyy, month, day, 2),
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "Y",
                        light2: "N",
                        light3: "Y",
                        light4: "N",
                        light5: "Y",
                        light_num1: 2,
                        light_num2: null,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JPC--PC121NTGE-G",
                        item_desc: "PC 121R 透明",
                        item_spec: "",
                        qty: 600,
                        po_no: "PO1-2017040004",
                        po_sno: 1,
                        datasource: "",
                        sourceno: "",
                        sourcesno: "",
                        vendor_no: "Big corner",
                        vendor_name: "大隅",
                        shipping_date: getDate(yyyy, month, day, 5),
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "R",
                        light2: "N",
                        light3: "Y",
                        light4: "N",
                        light5: "Y",
                        light_num1: -25,
                        light_num2: null,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JANG-5670689US-G",
                        item_desc: "J92 BATTERY HOLDER",
                        item_spec: "",
                        qty: 34100,
                        po_no: "PO1-2017040002",
                        po_sno: 1,
                        datasource: "",
                        sourceno: "",
                        sourcesno: "",
                        vendor_no: "tehlin",
                        vendor_name: "德林",
                        shipping_date: getDate(yyyy, month, day, 5),
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "G",
                        light2: "N",
                        light3: "Y",
                        light4: "N",
                        light5: "Y",
                        light_num1: 5,
                        light_num2: null,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JANG-5725952ES-G",
                        item_desc: "J92 INSERT METAL BEZEL",
                        item_spec: "",
                        qty: 500,
                        po_no: "PO1-2017040002",
                        po_sno: 2,
                        datasource: "",
                        sourceno: "",
                        sourcesno: "",
                        vendor_no: "tehlin",
                        vendor_name: "德林",
                        shipping_date: getDate(yyyy, month, day, 5),
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "G",
                        light2: "N",
                        light3: "Y",
                        light4: "N",
                        light5: "Y",
                        light_num1: 5,
                        light_num2: null,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JAPA-NG04NCDBF-G",
                        item_desc: "ABS+PA+20%GF TRABLEND 透明黑色",
                        item_spec: "",
                        qty: 9200,
                        po_no: "PO1-2017040002",
                        po_sno: 3,
                        datasource: "",
                        sourceno: "",
                        sourcesno: "",
                        vendor_no: "tehlin",
                        vendor_name: "德林",
                        shipping_date: getDate(yyyy, month, day, 5),
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "G",
                        light2: "N",
                        light3: "Y",
                        light4: "N",
                        light5: "Y",
                        light_num1: 5,
                        light_num2: null,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JPLU-93707492D-G",
                        item_desc: "H44 RUBBER 黑色",
                        item_spec: "",
                        qty: 100,
                        po_no: "PO1-2017040005",
                        po_sno: 1,
                        datasource: "",
                        sourceno: "",
                        sourcesno: "",
                        vendor_no: "Nissin",
                        vendor_name: "日清",
                        shipping_date: getDate(yyyy, month, day, 9),
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "G",
                        light2: "N",
                        light3: "Y",
                        light4: "N",
                        light5: "G",
                        light_num1: 9,
                        light_num2: null,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JPLU-95957729DAG",
                        item_desc: "J92 BEZEL RUBBER",
                        item_spec: "",
                        qty: 4300,
                        po_no: "PO1-2017040006",
                        po_sno: 1,
                        datasource: "",
                        sourceno: "",
                        sourcesno: "",
                        vendor_no: "Pills business",
                        vendor_name: "丸商",
                        shipping_date: getDate(yyyy, month, day, 9),
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "G",
                        light2: "N",
                        light3: "Y",
                        light4: "N",
                        light5: "G",
                        light_num1: 9,
                        light_num2: null,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "2",
                        item_no: "JPRT-D991319RT-G",
                        item_desc: "乾性潤滑劑",
                        item_spec: "",
                        qty: 10,
                        po_no: "PO1-2017040006",
                        po_sno: 2,
                        datasource: "",
                        sourceno: "",
                        sourcesno: "",
                        vendor_no: "Pills business",
                        vendor_name: "丸商",
                        shipping_date: getDate(yyyy, month, day, 9),
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "G",
                        light2: "N",
                        light3: "N",
                        light4: "N",
                        light5: "G",
                        light_num1: 9,
                        light_num2: null,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "2",
                        item_no: "JPRT-Q801326PY-G",
                        item_desc: "航電離型紙膠帶 黃色",
                        item_spec: "",
                        qty: 100,
                        po_no: "PO1-2017040006",
                        po_sno: 3,
                        datasource: "",
                        sourceno: "",
                        sourcesno: "",
                        vendor_no: "Pills business",
                        vendor_name: "丸商",
                        shipping_date: getDate(yyyy, month, day, 9),
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "G",
                        light2: "N",
                        light3: "N",
                        light4: "N",
                        light5: "G",
                        light_num1: 9,
                        light_num2: null,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "2",
                        item_no: "JPRT-W060727LD-G",
                        item_desc: "J92 LEFT MYLAR",
                        item_spec: "",
                        qty: 200,
                        po_no: "PO1-2017040006",
                        po_sno: 4,
                        datasource: "",
                        sourceno: "",
                        sourcesno: "",
                        vendor_no: "Pills business",
                        vendor_name: "丸商",
                        shipping_date: getDate(yyyy, month, day, 9),
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "G",
                        light2: "N",
                        light3: "Y",
                        light4: "N",
                        light5: "G",
                        light_num1: 9,
                        light_num2: null,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "3",
                        item_no: "JPRT-X372626LD-G",
                        item_desc: "J92 HOOK MYLAR 黑色",
                        item_spec: "",
                        unit_no: "cm",
                        qty: 1000,
                        po_no: "PO1-2017040006",
                        po_sno: 5,
                        datasource: "",
                        sourceno: "",
                        sourcesno: "",
                        vendor_no: "Pills business",
                        vendor_name: "丸商",
                        shipping_date: getDate(yyyy, month, day, 14),
                        receipts_no: "PO1-2017040006",
                        receipts_sno: 5,
                        light1: "G",
                        light2: "N",
                        light3: "Y",
                        light4: "N",
                        light5: "N",
                        light_num1: 15,
                        light_num2: null,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0,
                        reference_unit_no: "set",
                        reference_qty: 200,
                        reference_rate: 10,
                        reference_decimal_places: 2,
                        reference_decimal_places_type: 1,
                        valuation_unit_no:"kg",
                        valuation_qty: 20000,
                        multi_unit_type: 3   
                    }, {
                        type: "3",
                        item_no: "JSAC-0053F37HT-",
                        item_desc: "塑膠袋 -單片",
                        item_spec: "",
                        qty: 90,
                        po_no: "PO1-2017040006",
                        po_sno: 6,
                        datasource: "",
                        sourceno: "",
                        sourcesno: "",
                        vendor_no: "Pills business",
                        vendor_name: "丸商",
                        shipping_date: getDate(yyyy, month, day, 2),
                        receipts_no: "PO1-2017040006",
                        receipts_sno: 6,
                        light1: "G",
                        light2: "N",
                        light3: "N",
                        light4: "N",
                        light5: "N",
                        light_num1: 21,
                        light_num2: null,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "3",
                        item_no: "JSAC-1331498NT-",
                        item_desc: "5號夾鏈袋14.3*9.8公分",
                        item_spec: "",
                        qty: 100,
                        po_no: "PO1-2017040006",
                        po_sno: 7,
                        datasource: "",
                        sourceno: "",
                        sourcesno: "",
                        vendor_no: "Pills business",
                        vendor_name: "丸商",
                        shipping_date: getDate(yyyy, month, day, 2),
                        receipts_no: "PO1-2017040006",
                        receipts_sno: 7,
                        light1: "G",
                        light2: "N",
                        light3: "N",
                        light4: "N",
                        light5: "N",
                        light_num1: 26,
                        light_num2: null,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }
                ],
                "1": [
                    {
                        type: "1",
                        item_no: "JSAC-0053F37HT",
                        item_desc: "塑膠袋 -單片",
                        item_spec: "A001_Spec",
                        qty: 90,
                        po_no: "PO1-2017040006",
                        po_sno: 6,
                        datasource: "1",
                        sourceno: null,
                        sourcesno: null,
                        vendor_no: "A001",
                        vendor_name: "丸商",
                        shipping_date: "",
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "N",
                        light2: "N",
                        light3: "Y",
                        light4: "N",
                        light5: "Y",
                        light_num1: null,
                        light_num2: null,
                        light_num3: 0,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JSAC-1331498NT",
                        item_desc: "5號夾鏈袋14.3*9.8公分",
                        item_spec: "A001_Spec",
                        qty: 100,
                        po_no: "PO1-2017040006",
                        po_sno: 7,
                        datasource: "1",
                        sourceno: null,
                        sourcesno: null,
                        vendor_no: "A001",
                        vendor_name: "丸商",
                        shipping_date: "",
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "N",
                        light2: "N",
                        light3: "G",
                        light4: "N",
                        light5: "N",
                        light_num1: null,
                        light_num2: null,
                        light_num3: 1,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JPRT-X372626LD-G",
                        item_desc: "J92 HOOK MYLAR 黑色",
                        item_spec: "A001_Spec",
                        qty: 1000,
                        po_no: "PO1-2017040006",
                        po_sno: 5,
                        datasource: "1",
                        sourceno: null,
                        sourcesno: null,
                        vendor_no: "A001",
                        vendor_name: "丸商",
                        shipping_date: "",
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "N",
                        light2: "N",
                        light3: "R",
                        light4: "N",
                        light5: "Y",
                        light_num1: null,
                        light_num2: null,
                        light_num3: -1,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JA71H03961-00M",
                        item_desc: "J92 POP UP COVER",
                        item_spec: "A001_Spec",
                        qty: 2000,
                        po_no: "PO1-2017040001",
                        po_sno: 1,
                        datasource: "1",
                        sourceno: null,
                        sourcesno: null,
                        vendor_no: "A001",
                        vendor_name: "日清",
                        shipping_date: "2017/05/20",
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "N",
                        light2: "G",
                        light3: "Y",
                        light4: "N",
                        light5: "Y",
                        light_num1: null,
                        light_num2: 1,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JANG-4561391CY-G",
                        item_desc: "37XX 銅彈片 PIN",
                        item_spec: "A002_Spec",
                        qty: 50000,
                        po_no: "PO1-2017040001",
                        po_sno: 2,
                        datasource: "1",
                        sourceno: null,
                        sourcesno: null,
                        vendor_no: "A002",
                        vendor_name: "日清",
                        shipping_date: "2017/05/20",
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "N",
                        light2: "G",
                        light3: "Y",
                        light4: "N",
                        light5: "Y",
                        light_num1: null,
                        light_num2: 1,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JANG-5425464UY-G",
                        item_desc: "H44 INSERT METAL",
                        item_spec: "A001_Spec",
                        qty: 23000,
                        po_no: "PO1-2017040001",
                        po_sno: 3,
                        datasource: "1",
                        sourceno: null,
                        sourcesno: null,
                        vendor_no: "A001",
                        vendor_name: "日清",
                        shipping_date: "2017/05/20",
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "N",
                        light2: "G",
                        light3: "Y",
                        light4: "N",
                        light5: "Y",
                        light_num1: null,
                        light_num2: 1,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JPAM-A55302DNNNG",
                        item_desc: "SNOWMAN 粗油漆筆 黑色",
                        item_spec: "A003_Spec",
                        qty: 1200,
                        po_no: "PO1-2017040003",
                        po_sno: 1,
                        datasource: "1",
                        sourceno: null,
                        sourcesno: null,
                        vendor_no: "A003",
                        vendor_name: "意萬",
                        shipping_date: "2017/05/19",
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "N",
                        light2: "R",
                        light3: "Y",
                        light4: "N",
                        light5: "Y",
                        light_num1: null,
                        light_num2: -1,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JPAC-F714432AW-G",
                        item_desc: "8格真空盤 白色",
                        item_spec: "A001_Spec",
                        qty: 500,
                        po_no: "PO1-2017040002",
                        po_sno: 7,
                        datasource: "1",
                        sourceno: null,
                        sourcesno: null,
                        vendor_no: "A001",
                        vendor_name: "德林",
                        shipping_date: "2017/05/20",
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "Y",
                        light2: "N",
                        light3: "Y",
                        light4: "N",
                        light5: "Y",
                        light_num1: 0,
                        light_num2: null,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JPC--L1112NWGEAG",
                        item_desc: "PC EXL1112 白色",
                        item_spec: "A005_Spec",
                        qty: 3790,
                        po_no: "PO1-2017040003",
                        po_sno: 2,
                        datasource: "1",
                        sourceno: null,
                        sourcesno: null,
                        vendor_no: "A005",
                        vendor_name: "意萬",
                        shipping_date: "2017/05/21",
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "Y",
                        light2: "N",
                        light3: "Y",
                        light4: "N",
                        light5: "Y",
                        light_num1: 1,
                        light_num2: null,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JPC--L6411NDGE-G",
                        item_desc: "PC ML6411 黑色",
                        item_spec: "A002_Spec",
                        qty: 200,
                        po_no: "PO1-2017040003",
                        po_sno: 3,
                        datasource: "1",
                        sourceno: null,
                        sourcesno: null,
                        vendor_no: "A002",
                        vendor_name: "意萬",
                        shipping_date: "2017/05/21",
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "Y",
                        light2: "N",
                        light3: "Y",
                        light4: "N",
                        light5: "Y",
                        light_num1: 1,
                        light_num2: null,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JPC--P121RNAGE-G",
                        item_desc: "PC 本色",
                        item_spec: "A008_Spec",
                        qty: 50,
                        po_no: "PO1-2017040003",
                        po_sno: 4,
                        datasource: "1",
                        sourceno: null,
                        sourcesno: null,
                        vendor_no: "A008",
                        vendor_name: "意萬",
                        shipping_date: "2017/05/21",
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "Y",
                        light2: "N",
                        light3: "Y",
                        light4: "N",
                        light5: "Y",
                        light_num1: 1,
                        light_num2: null,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JPAC-C364431AW-G",
                        item_desc: "8格 真空盤 白色",
                        item_spec: "A001_Spec",
                        qty: 430000,
                        po_no: "PO1-2017040002",
                        po_sno: 6,
                        datasource: "1",
                        sourceno: null,
                        sourcesno: null,
                        vendor_no: "A001",
                        vendor_name: "德林",
                        shipping_date: "2017/05/22",
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "Y",
                        light2: "N",
                        light3: "Y",
                        light4: "N",
                        light5: "Y",
                        light_num1: 2,
                        light_num2: null,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JPC--PC121NTGE-G",
                        item_desc: "PC 121R 透明",
                        item_spec: "A001_Spec",
                        qty: 600,
                        po_no: "PO1-2017040004",
                        po_sno: 1,
                        datasource: "1",
                        sourceno: null,
                        sourcesno: null,
                        vendor_no: "A001",
                        vendor_name: "大隅",
                        shipping_date: "2017/04/25",
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "R",
                        light2: "N",
                        light3: "Y",
                        light4: "N",
                        light5: "Y",
                        light_num1: -26,
                        light_num2: null,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JANG-5670689US-G",
                        item_desc: "J92 BATTERY HOLDER",
                        item_spec: "A001_Spec",
                        qty: 34100,
                        po_no: "PO1-2017040002",
                        po_sno: 1,
                        datasource: "1",
                        sourceno: null,
                        sourcesno: null,
                        vendor_no: "A001",
                        vendor_name: "德林",
                        shipping_date: "2017/05/25",
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "G",
                        light2: "N",
                        light3: "Y",
                        light4: "N",
                        light5: "Y",
                        light_num1: 5,
                        light_num2: null,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JANG-5725952ES-G",
                        item_desc: "J92 INSERT METAL BEZEL",
                        item_spec: "A001_Spec",
                        qty: 500,
                        po_no: "PO1-2017040002",
                        po_sno: 2,
                        datasource: "1",
                        sourceno: null,
                        sourcesno: null,
                        vendor_no: "A001",
                        vendor_name: "德林",
                        shipping_date: "2017/05/25",
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "G",
                        light2: "N",
                        light3: "Y",
                        light4: "N",
                        light5: "Y",
                        light_num1: 5,
                        light_num2: null,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JAPA-NG04NCDBF-G",
                        item_desc: "ABS+PA+20%GF TRABLEND 透明黑色",
                        item_spec: "A001_Spec",
                        qty: 9200,
                        po_no: "PO1-2017040002",
                        po_sno: 3,
                        datasource: "1",
                        sourceno: null,
                        sourcesno: null,
                        vendor_no: "A001",
                        vendor_name: "德林",
                        shipping_date: "2017/05/25",
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "G",
                        light2: "N",
                        light3: "Y",
                        light4: "N",
                        light5: "Y",
                        light_num1: 5,
                        light_num2: null,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JPLU-93707492D-G",
                        item_desc: "H44 RUBBER 黑色",
                        item_spec: "A001_Spec",
                        qty: 100,
                        po_no: "PO1-2017040005",
                        po_sno: 1,
                        datasource: "1",
                        sourceno: null,
                        sourcesno: null,
                        vendor_no: "A001",
                        vendor_name: "日清",
                        shipping_date: "2017/05/29",
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "G",
                        light2: "N",
                        light3: "Y",
                        light4: "N",
                        light5: "G",
                        light_num1: 9,
                        light_num2: null,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JPLU-95957729DAG",
                        item_desc: "J92 BEZEL RUBBER",
                        item_spec: "A001_Spec",
                        qty: 4300,
                        po_no: "PO1-2017040006",
                        po_sno: 1,
                        datasource: "1",
                        sourceno: null,
                        sourcesno: null,
                        vendor_no: "A001",
                        vendor_name: "丸商",
                        shipping_date: "2017/05/29",
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "G",
                        light2: "N",
                        light3: "Y",
                        light4: "N",
                        light5: "G",
                        light_num1: 9,
                        light_num2: null,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }
                ],
                "2": [  
                    {
                        type: "1",
                        item_no: "JPRT-Q801326PY-G",
                        item_desc: "航電離型紙膠帶 黃色",
                        item_spec: "A001_Spec",
                        qty: 100,
                        po_no: "PO1-2017040006",
                        po_sno: 3,
                        datasource: "1",
                        sourceno: null,
                        sourcesno: null,
                        vendor_no: "A001",
                        vendor_name: "丸商",
                        shipping_date: "",
                        receipts_no: "QC1-170300000008",
                        receipts_sno: 1,
                        light1: "N",
                        light2: "N",
                        light3: "N",
                        light4: "Y",
                        light5: "G",
                        light_num1: null,
                        light_num2: null,
                        light_num3: null,
                        light_num4: 0,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JPRT-W060727LD-G",
                        item_desc: "J92 LEFT MYLAR",
                        item_spec: "A001_Spec",
                        qty: 200,
                        po_no: "PO1-2017040006",
                        po_sno: 4,
                        datasource: "1",
                        sourceno: null,
                        sourcesno: null,
                        vendor_no: "A001",
                        vendor_name: "丸商",
                        shipping_date: "",
                        receipts_no: "QC1-170300000009",
                        receipts_sno: 1,
                        light1: "N",
                        light2: "N",
                        light3: "N",
                        light4: "G",
                        light5: "G",
                        light_num1: null,
                        light_num2: null,
                        light_num3: null,
                        light_num4: 1,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JPRT-W060727LD-G",
                        item_desc: "J92 LEFT MYLAR",
                        item_spec: "A001_Spec",
                        qty: 200,
                        po_no: "PO1-2017040006",
                        po_sno: 4,
                        datasource: "1",
                        sourceno: null,
                        sourcesno: null,
                        vendor_no: "A001",
                        vendor_name: "丸商",
                        shipping_date: "",
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "N",
                        light2: "N",
                        light3: "N",
                        light4: "R",
                        light5: "G",
                        light_num1: null,
                        light_num2: null,
                        light_num3: null,
                        light_num4: -1,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JSAC-0053F37HT",
                        item_desc: "塑膠袋 -單片",
                        item_spec: "A001_Spec",
                        qty: 90,
                        po_no: "PO1-2017040006",
                        po_sno: 6,
                        datasource: "1",
                        sourceno: null,
                        sourcesno: null,
                        vendor_no: "A001",
                        vendor_name: "丸商",
                        shipping_date: "",
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "N",
                        light2: "N",
                        light3: "Y",
                        light4: "N",
                        light5: "Y",
                        light_num1: null,
                        light_num2: null,
                        light_num3: 0,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JSAC-1331498NT",
                        item_desc: "5號夾鏈袋14.3*9.8公分",
                        item_spec: "A001_Spec",
                        qty: 100,
                        po_no: "PO1-2017040006",
                        po_sno: 7,
                        datasource: "1",
                        sourceno: null,
                        sourcesno: null,
                        vendor_no: "A001",
                        vendor_name: "丸商",
                        shipping_date: "",
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "N",
                        light2: "N",
                        light3: "G",
                        light4: "N",
                        light5: "N",
                        light_num1: null,
                        light_num2: null,
                        light_num3: 1,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JA71H03961-00M",
                        item_desc: "J92 POP UP COVER",
                        item_spec: "A001_Spec",
                        qty: 2000,
                        po_no: "PO1-2017040001",
                        po_sno: 1,
                        datasource: "1",
                        sourceno: null,
                        sourcesno: null,
                        vendor_no: "A001",
                        vendor_name: "日清",
                        shipping_date: "2017/05/20",
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "N",
                        light2: "G",
                        light3: "Y",
                        light4: "N",
                        light5: "Y",
                        light_num1: null,
                        light_num2: 1,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JANG-4561391CY-G",
                        item_desc: "37XX 銅彈片 PIN",
                        item_spec: "A002_Spec",
                        qty: 50000,
                        po_no: "PO1-2017040001",
                        po_sno: 2,
                        datasource: "1",
                        sourceno: null,
                        sourcesno: null,
                        vendor_no: "A002",
                        vendor_name: "日清",
                        shipping_date: "2017/05/20",
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "N",
                        light2: "G",
                        light3: "Y",
                        light4: "N",
                        light5: "Y",
                        light_num1: null,
                        light_num2: 1,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JANG-5425464UY-G",
                        item_desc: "H44 INSERT METAL",
                        item_spec: "A001_Spec",
                        qty: 23000,
                        po_no: "PO1-2017040001",
                        po_sno: 3,
                        datasource: "1",
                        sourceno: null,
                        sourcesno: null,
                        vendor_no: "A001",
                        vendor_name: "日清",
                        shipping_date: "2017/05/20",
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "N",
                        light2: "G",
                        light3: "Y",
                        light4: "N",
                        light5: "Y",
                        light_num1: null,
                        light_num2: 1,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JPAM-A55302DNNNG",
                        item_desc: "SNOWMAN 粗油漆筆 黑色",
                        item_spec: "A003_Spec",
                        qty: 1200,
                        po_no: "PO1-2017040003",
                        po_sno: 1,
                        datasource: "1",
                        sourceno: null,
                        sourcesno: null,
                        vendor_no: "A003",
                        vendor_name: "意萬",
                        shipping_date: "2017/05/19",
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "N",
                        light2: "R",
                        light3: "Y",
                        light4: "N",
                        light5: "Y",
                        light_num1: null,
                        light_num2: -1,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JPAC-F714432AW-G",
                        item_desc: "8格真空盤 白色",
                        item_spec: "A001_Spec",
                        qty: 500,
                        po_no: "PO1-2017040002",
                        po_sno: 7,
                        datasource: "1",
                        sourceno: null,
                        sourcesno: null,
                        vendor_no: "A001",
                        vendor_name: "德林",
                        shipping_date: "2017/05/20",
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "Y",
                        light2: "N",
                        light3: "Y",
                        light4: "N",
                        light5: "Y",
                        light_num1: 0,
                        light_num2: null,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JPC--L1112NWGEAG",
                        item_desc: "PC EXL1112 白色",
                        item_spec: "A005_Spec",
                        qty: 3790,
                        po_no: "PO1-2017040003",
                        po_sno: 2,
                        datasource: "1",
                        sourceno: null,
                        sourcesno: null,
                        vendor_no: "A005",
                        vendor_name: "意萬",
                        shipping_date: "2017/05/21",
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "Y",
                        light2: "N",
                        light3: "Y",
                        light4: "N",
                        light5: "Y",
                        light_num1: 1,
                        light_num2: null,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JPC--L6411NDGE-G",
                        item_desc: "PC ML6411 黑色",
                        item_spec: "A002_Spec",
                        qty: 200,
                        po_no: "PO1-2017040003",
                        po_sno: 3,
                        datasource: "1",
                        sourceno: null,
                        sourcesno: null,
                        vendor_no: "A002",
                        vendor_name: "意萬",
                        shipping_date: "2017/05/21",
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "Y",
                        light2: "N",
                        light3: "Y",
                        light4: "N",
                        light5: "Y",
                        light_num1: 1,
                        light_num2: null,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JPC--P121RNAGE-G",
                        item_desc: "PC 本色",
                        item_spec: "A008_Spec",
                        qty: 50,
                        po_no: "PO1-2017040003",
                        po_sno: 4,
                        datasource: "1",
                        sourceno: null,
                        sourcesno: null,
                        vendor_no: "A008",
                        vendor_name: "意萬",
                        shipping_date: "2017/05/21",
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "Y",
                        light2: "N",
                        light3: "Y",
                        light4: "N",
                        light5: "Y",
                        light_num1: 1,
                        light_num2: null,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JPAC-0014538DY-",
                        item_desc: "A箱紙箱",
                        item_spec: "A001_Spec",
                        qty: 10000,
                        po_no: "PO1-2017040002",
                        po_sno: 4,
                        datasource: "1",
                        sourceno: null,
                        sourcesno: null,
                        vendor_no: "A001",
                        vendor_name: "德林",
                        shipping_date: "2017/05/22",
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "Y",
                        light2: "N",
                        light3: "N",
                        light4: "N",
                        light5: "N",
                        light_num1: 2,
                        light_num2: null,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JPAC-B214429DY-G",
                        item_desc: "紙箱",
                        item_spec: "A001_Spec",
                        qty: 2000,
                        po_no: "PO1-2017040002",
                        po_sno: 5,
                        datasource: "1",
                        sourceno: null,
                        sourcesno: null,
                        vendor_no: "A001",
                        vendor_name: "德林",
                        shipping_date: "2017/05/22",
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "Y",
                        light2: "N",
                        light3: "N",
                        light4: "N",
                        light5: "N",
                        light_num1: 2,
                        light_num2: null,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JPAC-C364431AW-G",
                        item_desc: "8格 真空盤 白色",
                        item_spec: "A001_Spec",
                        qty: 430000,
                        po_no: "PO1-2017040002",
                        po_sno: 6,
                        datasource: "1",
                        sourceno: null,
                        sourcesno: null,
                        vendor_no: "A001",
                        vendor_name: "德林",
                        shipping_date: "2017/05/22",
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "Y",
                        light2: "N",
                        light3: "Y",
                        light4: "N",
                        light5: "Y",
                        light_num1: 2,
                        light_num2: null,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JPC--PC121NTGE-G",
                        item_desc: "PC 121R 透明",
                        item_spec: "A001_Spec",
                        qty: 600,
                        po_no: "PO1-2017040004",
                        po_sno: 1,
                        datasource: "1",
                        sourceno: null,
                        sourcesno: null,
                        vendor_no: "A001",
                        vendor_name: "大隅",
                        shipping_date: "2017/04/25",
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "R",
                        light2: "N",
                        light3: "Y",
                        light4: "N",
                        light5: "Y",
                        light_num1: -25,
                        light_num2: null,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JANG-5670689US-G",
                        item_desc: "J92 BATTERY HOLDER",
                        item_spec: "A001_Spec",
                        qty: 34100,
                        po_no: "PO1-2017040002",
                        po_sno: 1,
                        datasource: "1",
                        sourceno: null,
                        sourcesno: null,
                        vendor_no: "A001",
                        vendor_name: "德林",
                        shipping_date: "2017/05/25",
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "G",
                        light2: "N",
                        light3: "Y",
                        light4: "N",
                        light5: "Y",
                        light_num1: 5,
                        light_num2: null,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JANG-5725952ES-G",
                        item_desc: "J92 INSERT METAL BEZEL",
                        item_spec: "A001_Spec",
                        qty: 500,
                        po_no: "PO1-2017040002",
                        po_sno: 2,
                        datasource: "1",
                        sourceno: null,
                        sourcesno: null,
                        vendor_no: "A001",
                        vendor_name: "德林",
                        shipping_date: "2017/05/25",
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "G",
                        light2: "N",
                        light3: "Y",
                        light4: "N",
                        light5: "Y",
                        light_num1: 5,
                        light_num2: null,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JAPA-NG04NCDBF-G",
                        item_desc: "ABS+PA+20%GF TRABLEND 透明黑色",
                        item_spec: "A001_Spec",
                        qty: 9200,
                        po_no: "PO1-2017040002",
                        po_sno: 3,
                        datasource: "1",
                        sourceno: null,
                        sourcesno: null,
                        vendor_no: "A001",
                        vendor_name: "德林",
                        shipping_date: "2017/05/25",
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "G",
                        light2: "N",
                        light3: "Y",
                        light4: "N",
                        light5: "Y",
                        light_num1: 5,
                        light_num2: null,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JPLU-93707492D-G",
                        item_desc: "H44 RUBBER 黑色",
                        item_spec: "A001_Spec",
                        qty: 100,
                        po_no: "PO1-2017040005",
                        po_sno: 1,
                        datasource: "1",
                        sourceno: null,
                        sourcesno: null,
                        vendor_no: "A001",
                        vendor_name: "日清",
                        shipping_date: "2017/05/29",
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "G",
                        light2: "N",
                        light3: "Y",
                        light4: "N",
                        light5: "G",
                        light_num1: 9,
                        light_num2: null,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }, {
                        type: "1",
                        item_no: "JPLU-95957729DAG",
                        item_desc: "J92 BEZEL RUBBER",
                        item_spec: "A001_Spec",
                        qty: 4300,
                        po_no: "PO1-2017040006",
                        po_sno: 1,
                        datasource: "1",
                        sourceno: null,
                        sourcesno: null,
                        vendor_no: "A001",
                        vendor_name: "丸商",
                        shipping_date: "2017/05/29",
                        receipts_no: "",
                        receipts_sno: "",
                        light1: "G",
                        light2: "N",
                        light3: "Y",
                        light4: "N",
                        light5: "G",
                        light_num1: 9,
                        light_num2: null,
                        light_num3: null,
                        light_num4: null,
                        light_num5: null,
                        sort1: 0,
                        sort2: 0,
                        sort3: 0,
                        sort4: 0
                    }
                ]
            }

            return sales_notice[guide_the_role];
        };

        self.getManufacturers = function () {
            var manufacturers = [{
                vendor_no: "A001",
                vendor_name: "A001廠商",
                po_cnt: 4,
                podetail_cnt: 8,
                color: "G"
            }, {
                vendor_no: "A002",
                vendor_name: "A002廠商",
                po_cnt: 2,
                podetail_cnt: 7,
                color: "R"
            }, {
                vendor_no: "A003",
                vendor_name: "A003廠商",
                po_cnt: 6,
                podetail_cnt: 8,
                color: "N"
            }, {
                vendor_no: "A004",
                vendor_name: "A004廠商",
                po_cnt: 7,
                podetail_cnt: 13,
                color: "Y"
            }, {
                vendor_no: "A005",
                vendor_name: "A005廠商",
                po_cnt: 4,
                podetail_cnt: 5,
                color: "G"
            }]
            return manufacturers;
        };

        self.getProduct = function () {
            var product = [{
                item_no: "A001",
                item_desc: "A001_Name",
                item_spec: "A001_Spec"
            }, {
                item_no: "A002",
                item_desc: "A002_Name",
                item_spec: "A002_Spec"
            }, {
                item_no: "A003",
                item_desc: "A003_Name",
                item_spec: "A003_Spec"
            }, {
                item_no: "A004",
                item_desc: "A004_Name",
                item_spec: "A004_Spec"
            }, {
                item_no: "A005",
                item_desc: "A005_Name",
                item_spec: "A005_Spec"
            }]
            return product;
        };
        //ZHEN-170419-(E)

        //ZHEN-170517-(S)
        self.getSingle = function () {
            var single = [{
                doc: "A001",
                doc_desc: "A001_Name"
            }, {
                doc: "A002",
                doc_desc: "A002_Name"
            }, {
                doc: "A003",
                doc_desc: "A003_Name"
            }, {
                doc: "A004",
                doc_desc: "A004_Name"
            }, {
                doc: "A005",
                doc_desc: "A005_Name"
            }]
            return single;
        };
        //ZHEN-170517-(E)

        //ZHEN-170525-(S)
        self.getVendorData = function (webTran) {
            var vendor_data = {
                A001: {
                    vendor_no: "A001",
                    vendor_name: "A001_簡稱",
                    vendor_fname: "A001_全名",
                    address: "A001_地址",
                    phone: "0900000001",
                    fax: "0800000001"
                },
                A002: {
                    vendor_no: "A002",
                    vendor_name: "A002_簡稱",
                    vendor_fname: "A002_全名",
                    address: "A002_地址",
                    phone: "0900000002",
                    fax: "0800000002"
                },
                A003: {
                    vendor_no: "A003",
                    vendor_name: "A003_簡稱",
                    vendor_fname: "A003_全名",
                    address: "A003_地址",
                    phone: "0900000003",
                    fax: "0800000003"
                },
                A004: {
                    vendor_no: "A004",
                    vendor_name: "A004_簡稱",
                    vendor_fname: "A004_全名",
                    address: "A004_地址",
                    phone: "0900000004",
                    fax: "0800000004"
                },
                A005: {
                    vendor_no: "A005",
                    vendor_name: "A005_簡稱",
                    vendor_fname: "A005_全名",
                    address: "A005_地址",
                    phone: "0900000005",
                    fax: "0800000005"
                },
                A006: {
                    vendor_no: "A006",
                    vendor_name: "A006_簡稱",
                    vendor_fname: "A006_全名",
                    address: "A006_地址",
                    phone: "0900000006",
                    fax: "0800000006"
                },
                A007: {
                    vendor_no: "A007",
                    vendor_name: "A007_簡稱",
                    vendor_fname: "A007_全名",
                    address: "A007_地址",
                    phone: "0900000007",
                    fax: "0800000007"
                },
                A008: {
                    vendor_no: "A008",
                    vendor_name: "A008_簡稱",
                    vendor_fname: "A008_全名",
                    address: "A008_地址",
                    phone: "0900000008",
                    fax: "0800000008"
                }
            }

            return vendor_data[webTran.parameter.vendor_no];
        }

        self.getPoData = function (webTran) {
            var po_data = {
                "CTC-LB1-170300000001": {
                    po_no: "CTC-LB1-170300000001",
                    po_sno: 1,
                    vendor_no: "A001",
                    vendor_name: "A001_簡稱",
                    item_no: "A001",
                    item_desc: "A001_Name",
                    item_spec: "A001_Spec",
                    qty: 10,
                    qc_qty: 5,
                    "stock-in_qty": 4,
                    qcrej_qty: 1,
                    shipping_date: "2017-03-12",
                    arrival_date: "2017/03/13",
                    "stock-in_date": "2017/03/13"
                },
                "CTC-LB1-170300000002": {
                    po_no: "CTC-LB1-170300000002",
                    po_sno: 2,
                    vendor_no: "A002",
                    vendor_name: "A002_簡稱",
                    item_no: "A002",
                    item_desc: "A002_Name",
                    item_spec: "A002_Spec",
                    qty: 25,
                    qc_qty: 5,
                    "stock-in_qty": 20,
                    qcrej_qty: 0,
                    shipping_date: "2017/03/14",
                    arrival_date: "2017/03/14",
                    "stock-in_date": "2017/03/14"
                },
                "CTC-LB1-170300000003": {
                    po_no: "CTC-LB1-170300000003",
                    po_sno: 1,
                    vendor_no: "A001",
                    vendor_name: "A001_簡稱",
                    item_no: "A001",
                    item_desc: "A001_Name",
                    item_spec: "A001_Spec",
                    qty: 34,
                    qc_qty: 10,
                    "stock-in_qty": 20,
                    qcrej_qty: 4,
                    shipping_date: "2017/03/14",
                    arrival_date: "2017/03/14",
                    "stock-in_date": "2017/03/15"
                },
                "CTC-LB1-170300000004": {
                    po_no: "CTC-LB1-170300000004",
                    po_sno: 1,
                    vendor_no: "A003",
                    vendor_name: "A003_簡稱",
                    item_no: "A003",
                    item_desc: "A003_Name",
                    item_spec: "A003_Spec",
                    qty: 67,
                    qc_qty: 67,
                    "stock-in_qty": 0,
                    qcrej_qty: 0,
                    shipping_date: "2017/03/15",
                    arrival_date: "2017/03/15",
                    "stock-in_date": "2017/03/18"
                },
                "CTC-LB1-170300000017": {
                    po_no: "CTC-LB1-170300000017",
                    po_sno: 1,
                    vendor_no: "A001",
                    vendor_name: "A001_簡稱",
                    item_no: "A001",
                    item_desc: "A001_Name",
                    item_spec: "A001_Spec",
                    qty: 20,
                    qc_qty: 15,
                    "stock-in_qty": 5,
                    qcrej_qty: 0,
                    shipping_date: "2017/03/10",
                    arrival_date: "2017/03/12",
                    "stock-in_date": "2017/03/12"
                },
                "CTC-LB1-170300000006": {
                    po_no: "CTC-LB1-170300000006",
                    po_sno: 1,
                    vendor_no: "A005",
                    vendor_name: "A005_簡稱",
                    item_no: "A005",
                    item_desc: "A005_Name",
                    item_spec: "A005_Spec",
                    qty: 45,
                    qc_qty: 5,
                    "stock-in_qty": 40,
                    qcrej_qty: 0,
                    shipping_date: "2017/03/17",
                    arrival_date: "2017/03/17",
                    "stock-in_date": "2017/03/17"
                },
                "CTC-LB1-170300000009": {
                    po_no: "CTC-LB1-170300000009",
                    po_sno: 1,
                    vendor_no: "A002",
                    vendor_name: "A002_簡稱",
                    item_no: "A002",
                    item_desc: "A002_Name",
                    item_spec: "A002_Spec",
                    qty: 475,
                    qc_qty: 470,
                    "stock-in_qty": 5,
                    qcrej_qty: 0,
                    shipping_date: "2017/03/18",
                    arrival_date: "2017/03/20",
                    "stock-in_date": "2017/03/21"
                },
                "CTC-LB1-170300000007": {
                    po_no: "CTC-LB1-170300000007",
                    po_sno: 1,
                    vendor_no: "A008",
                    vendor_name: "A008_簡稱",
                    item_no: "A008",
                    item_desc: "A008_Name",
                    item_spec: "A008_Spec",
                    qty: 15,
                    qc_qty: 0,
                    "stock-in_qty": 0,
                    qcrej_qty: 0,
                    shipping_date: "2017/03/17",
                    arrival_date: "2017/03/17",
                    "stock-in_date": "2017/03/17"
                },
                "CTC-LB1-170300000008": {
                    po_no: "CTC-LB1-170300000008",
                    po_sno: 1,
                    vendor_no: "A001",
                    vendor_name: "A001_簡稱",
                    item_no: "A001",
                    item_desc: "A001_Name",
                    item_spec: "A001_Spec",
                    qty: 97,
                    qc_qty: 0,
                    "stock-in_qty": 0,
                    qcrej_qty: 0,
                    shipping_date: "2017/03/16",
                    arrival_date: "2017/03/16",
                    "stock-in_date": "2017/03/17"
                }
            }

            return po_data[webTran.parameter.po_no] || {
                po_no: "CTC-LB1-170300000008",
                po_sno: 1,
                vendor_no: "A001",
                vendor_name: "A001_簡稱",
                item_no: "A001",
                item_desc: "A001_Name",
                item_spec: "A001_Spec",
                qty: 97,
                qc_qty: 0,
                "stock-in_qty": 0,
                qcrej_qty: 0,
                shipping_date: "2017/03/16",
                arrival_date: "2017/03/16",
                "stock-in_date": "2017/03/17"
            };
        }

        self.getSoData = function (webTran) {
            var so_data = {
                "CTC-ZH1-170400000001": {
                    so_no: "CTC-ZH1-170400000001",
                    so_sno: 1,
                    customer_no: "ZH01",
                    customer_name: "ZH01_Name",
                    product_no: "A001",
                    product_desc: "A001_Name",
                    product_spec: "A001_Spec",
                    qty: 100,
                    shipments_qty: 36,
                    agreed_shipping_date: "2017-03-22",
                },
                "CTC-ZH1-170400000002": {
                    so_no: "CTC-ZH1-170400000002",
                    so_sno: 1,
                    customer_no: "ZH02",
                    customer_name: "ZH02_Name",
                    product_no: "A002",
                    product_desc: "A002_Name",
                    product_spec: "A002_Spec",
                    qty: 46,
                    shipments_qty: 26,
                    agreed_shipping_date: "2017/03/20",
                },
                "CTC-ZH1-170400000003": {
                    so_no: "CTC-ZH1-170400000003",
                    so_sno: 1,
                    customer_no: "ZH03",
                    customer_name: "ZH03_Name",
                    product_no: "A003",
                    product_desc: "A003_Name",
                    product_spec: "A003_Spec",
                    qty: 14,
                    shipments_qty: 4,
                    agreed_shipping_date: "2017/03/18",
                },
                "CTC-ZH1-170400000004": {
                    so_no: "CTC-ZH1-170400000004",
                    so_sno: 1,
                    customer_no: "ZH04",
                    customer_name: "ZH04_Name",
                    product_no: "A004",
                    product_desc: "A004_Name",
                    product_spec: "A004_Spec",
                    qty: 52,
                    shipments_qty: 23,
                    agreed_shipping_date: "2017/03/26",
                },
                "CTC-ZH1-170400000005": {
                    so_no: "CTC-ZH1-170400000005",
                    so_sno: 1,
                    customer_no: "ZH05",
                    customer_name: "ZH05_Name",
                    product_no: "A005",
                    product_desc: "A005_Name",
                    product_spec: "A005_Spec",
                    qty: 62,
                    shipments_qty: 21,
                    agreed_shipping_date: "2017/03/08",
                }
            }

            return so_data[webTran.parameter.so_no] || {
                so_no: "CTC-ZH1-170400000005",
                so_sno: 1,
                customer_no: "ZH05",
                customer_name: "ZH05_Name",
                product_no: "A005",
                product_desc: "A005_Name",
                product_spec: "A005_Spec",
                qty: 62,
                shipments_qty: 21,
                agreed_shipping_date: "2017/03/08",
            };
        }

        self.getWoData = function (webTran) {
            var wo_data = {
                "CTC-ZH1-170400000001": {
                    "wo_no": "CTC-ZH1-170400000001",
                    "product_no": "ZH01",
                    "product_desc": "ZH01_Name",
                    "product_spec": "ZH01_Spec",
                    "qty": "35",
                    "start_date": "2017-04-26",
                    "completion_date": "2017-04-28",
                }
            }

            return wo_data[webTran.parameter.wo_no] || {
                "wo_no": "CTC-ZH1-170400000001",
                "product_no": "ZH01",
                "product_desc": "ZH01_Name",
                "product_spec": "ZH01_Spec",
                "qty": "35",
                "start_date": "2017-04-26",
                "completion_date": "2017-04-28",
            };
        }

        self.getItemPic = function (webTran) {
            var item_pic = {
                "ZH01": {
                    "pic_url": "https://maxcdn.icons8.com/Share/icon/ios7/Animals/sheep21600.png",  //no pic!
                    "pic_base64": "iVBORw0KGgoAAAANSUhEUgAAAFoAAABaCAMAAAAPdrEwAAAAb1BMVEX///8jY8QAWMEdYcMAVsAAUr8jZMMVX" +
                    "sIRXMIAWcAAVMDv8/rN2e/6/P4AT74wasYATL3i6fbC0OthhM7U3vHZ4/NBc8lnjNEASbyAn9i3yOhukdNIeMuUrd3p7viLptusv" +
                    "+SgtOBQf80APrp4mtfNTcX/AAAE5klEQVRYhe1Y17KDuBIEDSiBkEnyIYf1/3/jSuBAssF77Ydb5X44VcdAM+rJWNYPP/zwfwnxLeKu" +
                    "lHH6FebGBSDBN7g9YmuQ4gvUCTPUoL5A7dHB6vMXqK3M0UY7X/IjBZV8hdmywlP4FV6RthmRZVn2Red/MHdEHjPOdPiBBqGcR59ibiUCewCM" +
                    "+FTmhEoTA2GMSNXHAz4V3S0HGuAmSkWYRHnbdV3+KbGFrbqwzpvSDThilBLK0El225rUVffOa6P8IhkiV7kHYJuy2F/f6knm9Idtjs6UEXsD" +
                    "xI1vcR7d3hJxjN1j0S86NTd3Tk7b4a6QOJcrtQMEH1KkJewp7wAUax6BwaZy0F53i/iI0ck9nJ+DKs/qCdYRz0x9kdUhMbJgj3cQxQ7PQ721" +
                    "uRY87g4Qe72p/RibBDQRsQYe/4Dy4iu3Z6lsQSOSeskcEnNKmyBc9j1G2yGCgDhgEyX68brEQb5gxi57/FQV2jMhgNGPF75nTuAXfKU6oCb1" +
                    "av/s6IYpzMlsDLBgtiqmT337J0YU197gP6IeGRcqimeqgPTGKxEFVnljhLLl6TsH7u30rF+DRWlsprMidDv0ndq7XcmRHYSRO0gUL4U9A5WX" +
                    "c+kNzDatM+PBVfOWU01YO3mc6ENXzBzKWSpieUkv+yDT9uuHupQP/l72wQRNqNEk5XJmzC3HQFpSD+iRzwZjy0Ho9VhQkLvaICe/hy62eV4P" +
                    "BrHNwA6pVhNzP3LMPc66R0XoQT1Vq3ZNdFsXE93AvNVzGh3Vt8SjpoDXt4hHegKZvdIo1AltGZPbXTPWnCwflQa1Ub8mWjuTYn0xsQPUatip" +
                    "2q56oYmL03ijDeXGHZMYmSjiD9Mgpp0oV0l9RT46UdpPrZ5G9t3NIYwvhBd12phLshRdxVxbYNx1B6Yy94SoG3SrXdvBMUDpt9Muv0YvWgW/" +
                    "1bJZPtoIK0Xooyqyp9QcG8LmeuoNsctliQKAZxk6x58xxC9ugq5ydmn0Cpv+MRD/EBujpL/ZAXTe5FJ3h9nG7jOz0wa7TqruR5x7Mtltk8DU" +
                    "i1EwuYRqQuHcJyHR7dpMobM2hp4J+gk1MNn4tVVHjdzTmfDC82L5kvoyr/gEuSdXt0a81Xgfd7G4tipOXk+wDd07+QJYL6p6C271wXZWvxbt" +
                    "s00BCDLPym3z2Lp/zeDvqTrjpUHfPrYGupxC5qifT48LWm1v33lWnd0HQ9S+pLYU3ePW6U0ZhyL3LNH27OGcvfE3amJJ9PRPYBkVZughVF+SZ" +
                    "ZbrdEq73p1Osk8T/S52l3giyauLcv4Cl3NHg3PuBqc/JuNLlfsmSeu2kJzqcWXyevJaarPTOgHO2sT0RlEnSRRFfpKE9a1XijCqzq7L1j4Jdi" +
                    "dr02b0KqePXTRtHvlpWNd1mJjtqyl6BQxpb2xk0GbPm6Nj1+eAmGVLa2HA9fZlHABPnYxeVxCDejdENgFHNq/L5jS9B+fIDhMGL2vRJrBzbIt" +
                    "p3kn2kZke/N4l5LvMO+V0gsR9SxJM++OLefVWaUWvi+kCGTpu90EP3lE4B4kJeftrUbXbw4eFlF/eJbbMZrWbOoSX/+0rlHd+1sqHWgrILvbL" +
                    "xjMkMd8onrapXMiJ28215bjl7VnqKkqGbwDDxwDTZ6DMov+Nd4RI86pQxP3TCIjSRTz5BO0PP/zwwwv8C0htQ/L1wjWIAAAAAElFTkSuQmCC"
                }
            }

            return item_pic[webTran.parameter.item_no];
        }
        //ZHEN-170525-(E)

        //ZHEN-170601-(S)
        self.kb_getAppTodoDoc = function (paramter, doc_array) {
            var source_operation = paramter.program_job_no;
            var param_master = paramter.param_master;
            var doc_type = paramter.program_job_no + paramter.status;
            var obj = { source_doc_detail: [] };

            var lot_type = 0;
            for (var l_i = 0, len = param_master.length; l_i < len; l_i++) {
                var list = {
                    "enterprise_no": 99,
                    "site_no": "DSCTC",
                    "source_operation": source_operation,
                    "source_no": param_master[l_i].doc_no,
                    "seq": param_master[l_i].seq,
                    "doc_type": doc_type,
                    "create_date": doc_array[l_i].shipping_date,
                    "in_out_date1": doc_array[l_i].shipping_date,
                    "item_no": doc_array[l_i].item_no,
                    "warehouse_no": doc_array[l_i].warehouse_no,
                    "storage_spaces_no": doc_array[l_i].storage_spaces_no,
                    "lot_no": doc_array[l_i].lot_no,
                    "unit_no": doc_array[l_i].unit_no,
                    "doc_qty": doc_array[l_i].qty,
                    "upper_no": param_master[l_i].doc_no,
                    "upper_seq": param_master[l_i].seq,
                    "last_transaction_date": doc_array[l_i].shipping_date,
                    "item_name": doc_array[l_i].item_name,
                    "item_spec": doc_array[l_i].item_spec,
                    "lot_control_type": "" + ((lot_type == 3) ? lot_type = 1 : lot_type = (lot_type + 1)),
                    "decimal_places": 6,
                    "decimal_places_type": 1,
                    "reference_unit_no": doc_array[l_i].reference_unit_no,
                    "reference_qty": doc_array[l_i].reference_qty,
                    "reference_rate": doc_array[l_i].reference_rate,
                    "reference_decimal_places": doc_array[l_i].reference_decimal_places,
                    "reference_decimal_places_type": doc_array[l_i].reference_decimal_places_type,
                    "valuation_unit_no": doc_array[l_i].valuation_unit_no,
                    "valuation_qty": doc_array[l_i].valuation_qty,
                    "multi_unit_type": doc_array[l_i].multi_unit_type,
                }

                obj.source_doc_detail.push(list);
            };

            return obj;
        };
        //ZHEN-170601-(E)

        return self;
    }]);
});