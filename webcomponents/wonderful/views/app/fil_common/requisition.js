define(["app", "API", "APIS", "numericalAnalysisService", "userInfoService"], function(app) {
    app.service('fil_common_requisition', ['APIService', '$timeout', 'numericalAnalysisService', 'commonService', 'userInfoService',
        function(APIService, $timeout, numericalAnalysisService, commonService, userInfoService) {

            var self = this;
            self.params = {};
            self.parameter = {};
            self.scanning = "";
            self.init = function() {
                self.barcode_detail = [];
                self.source_doc_detail = [];
                self.scanning = null;
                self.bcaf = [];
                self.computed_doc_detail = [];
            };
            self.init();

            self.setParams = function(params) {
                self.params = params;
            };

            self.clearScanning = function() {
                self.scanning = "";
            };

            self.setParameter = function(parameter) {
                self.parameter = parameter;
                if (parameter.barcode_detail) {
                    var temp_barcode_detail = angular.copy(self.barcode_detail);
                    self.barcode_detail = temp_barcode_detail.concat(parameter.barcode_detail);
                }

                if (parameter.source_doc_detail) {
                    var temp_source_doc_detail = angular.copy(self.source_doc_detail);
                    self.source_doc_detail = temp_source_doc_detail.concat(parameter.source_doc_detail);
                }

                self.computeSourceDoc();
            };

            self.getSourceDocDetail = function() {
                return angular.copy(self.computed_doc_detail);
            };

            self.computeSourceDoc = function() {
                var objArray = [];
                var temp = {};
                angular.forEach(self.source_doc_detail, function(value) {
                    var in_out_qty = value.in_out_qty || 0;
                    var allow_error_rate = value.allow_error_rate || 0;
                    //來源送貨單不計算超交率
                    if (self.params.program_job_no == '1-1' || self.params.program_job_no == '3-1' || self.params.program_job_no == '1-2') {
                        allow_error_rate = 0;
                    }
                    var rate = numericalAnalysisService.accAdd(1, numericalAnalysisService.accDiv(allow_error_rate, 100));
                    temp = {
                        "enterprise_no": value.enterprise_no,
                        "site_no": value.site_no,
                        "source_operation": value.source_operation,
                        "source_no": value.source_no,
                        "seq": value.seq,
                        "doc_line_seq": value.doc_line_seq,
                        "doc_batch_seq": value.doc_batch_seq,
                        "warehouse_no": value.warehouse_no,
                        "storage_spaces_no": value.storage_spaces_no,
                        "lot_no": value.lot_no,
                        "main_organization": value.main_organization,
                        "item_no": value.item_no,
                        "item_feature_no": value.item_feature_no,
                        "item_name": value.item_name,
                        "item_spec": value.item_spec,
                        "in_out_date1": value.in_out_date1,
                        "object_no": value.object_no,
                        "qpa_denominator": value.qpa_denominator,
                        "qpa_molecular": value.qpa_molecular,
                        "lot_control_type": value.qpa_molecular,
                        "run_card_no": value.qpa_molecular,
                        "conversion_rate_denominator": value.conversion_rate_denominator || 1,
                        "conversion_rate_molecular": value.conversion_rate_molecular || 1,
                        "doc_qty": value.doc_qty,
                        "unit_no": value.unit_no,
                        "surplus_doc_qty": numericalAnalysisService.accSub(value.doc_qty, in_out_qty),
                        "allow_doc_qty": numericalAnalysisService.to_round(numericalAnalysisService.accSub(numericalAnalysisService.accMul(value.doc_qty, rate), in_out_qty), value.decimal_places, value.decimal_places_type),
                        "decimal_places": value.decimal_places,
                        "decimal_places_type": value.decimal_places_type,
                        "inventory_unit": value.inventory_unit || "",
                        "reference_unit_no": value.reference_unit_no || "",
                        "valuation_unit_no": value.valuation_unit_no || "",
                        "inventory_rate": numericalAnalysisService.accDiv(numericalAnalysisService.accSub(value.doc_qty, in_out_qty), value.inventory_qty),
                        "reference_rate": value.reference_rate || numericalAnalysisService.accDiv(numericalAnalysisService.accSub(value.doc_qty, in_out_qty), numericalAnalysisService.accSub(value.reference_qty, value.reference_in_out_qty)),
                        "valuation_rate": numericalAnalysisService.accDiv(numericalAnalysisService.accSub(value.doc_qty, in_out_qty), value.valuation_qty),
                        "inventory_qty": value.inventory_qty || 0,
                        "reference_qty": value.reference_qty || 0,
                        "surplus_reference_qty": numericalAnalysisService.accSub(value.reference_qty, value.reference_in_out_qty) || 0,
                        "valuation_qty": value.valuation_qty || 0,
                        "multi_unit_type": value.multi_unit_type || "1",
                        "first_in_first_out_control": value.first_in_first_out_control || "N",
                        "erp_warehousing": value.erp_warehousing || "N",
                        "doc_type": value.doc_type,
                        "create_date": value.create_date,
                        "upper_no": value.upper_no,
                        "upper_seq": value.upper_seq,
                        "upper_line_seq": value.upper_line_seq,
                        "upper_batch_seq": value.upper_batch_seq,
                        "inventory_management_features": value.inventory_management_features,
                        "main_warehouse_no": value.main_warehouse_no,
                        "main_storage_no": value.main_storage_no,
                        "op_no": value.op_no || " ",
                        "op_name": value.op_name || " ",
                        "production_item_no": value.production_item_no,
                        "production_qty": value.production_qty,
                        "item_name_spec": value.item_name_spec,
                        "production_unit_no": value.production_unit_no,
                        "upper_unit_no": value.upper_unit_no,
                        "upper_qty": value.upper_qty,
                        "allow_error_rate": value.allow_error_rate,
                        "production_item_feature_no": value.production_item_feature_no,
                        "production_in_out_qty": value.production_in_out_qty,
                        "last_transaction_date": value.last_transaction_date,
                        "status": value.status,
                        "outgoing_warehouse_no": value.outgoing_warehouse_no,
                        "outgoing_storage_spaces_no": value.outgoing_storage_spaces_no,
                        "reference_decimal_places": value.reference_decimal_places,
                        "reference_decimal_places_type": value.reference_decimal_places_type,
                        "reference_in_out_qty": value.reference_in_out_qty,
                        "in_out_qty": value.in_out_qty,
                        "object_name": value.object_name,
                        "item_feature_name": value.item_feature_name,
                        "in_out_date2": value.in_out_date2,
                        "done_stus": value.done_stus,
                        "closed_stus": value.closed_stus,
                    };

                    var flag = true;
                    switch (userInfoService.userInfo.server_product) {
                        case "EF":
                        case "E10":
                        case "WF":
                            if (Number(temp.allow_doc_qty) > 0) {
                                flag = true;
                            }
                            break;
                        default:
                            if (Number(temp.doc_qty) >= 0) {
                                flag = true;
                            }
                    }

                    if (objArray.length > 0 && (self.params.func == "fil106" || self.params.func == "fil107" || self.params.func == "fil108" ||
                            self.params.func == "fil204" || self.params.func == "fil213" || self.params.func == "fil119" || self.params.func == "fil221")) {
                        angular.forEach(objArray, function(value) {
                            if (angular.equals(value, temp)) {
                                flag = false;
                            }
                        });
                    }

                    if (flag) {
                        objArray.push(temp);
                    }
                });
                self.computed_doc_detail = objArray;
                // return objArray;
            };

            self.fil3getItemDocQty = function() {
                var objArray = [];
                var temp = {};
                angular.forEach(self.source_doc_detail, function(value) {
                    var in_out_qty = value.in_out_qty || 0;
                    var allow_error_rate = value.allow_error_rate || 0;
                    //來源送貨單不計算超交率
                    if (self.params.program_job_no == '1-1' || self.params.program_job_no == '3-1' || self.params.program_job_no == '1-2') {
                        allow_error_rate = 0;
                    }
                    var rate = numericalAnalysisService.accAdd(1, numericalAnalysisService.accDiv(allow_error_rate, 100));
                    temp = {
                        "source_no": value.source_no,
                        "seq": value.seq,
                        "doc_line_seq": value.doc_line_seq,
                        "doc_batch_seq": value.doc_batch_seq,
                        "warehouse_no": value.warehouse_no,
                        "storage_spaces_no": value.storage_spaces_no,
                        "lot_no": value.lot_no,
                        "main_organization": value.main_organization,
                        "item_no": value.item_no,
                        "item_feature_no": value.item_feature_no,
                        "item_name": value.item_name,
                        "item_spec": value.item_spec,
                        "in_out_date1": value.in_out_date1,
                        "object_no": value.object_no,
                        "qpa_denominator": value.qpa_denominator,
                        "qpa_molecular": value.qpa_molecular,
                        "lot_control_type": value.qpa_molecular,
                        "run_card_no": value.qpa_molecular,
                        "conversion_rate_denominator": value.conversion_rate_denominator || 1,
                        "conversion_rate_molecular": value.conversion_rate_molecular || 1,
                        "doc_qty": value.doc_qty,
                        "unit_no": value.unit_no,
                        "allow_doc_qty": numericalAnalysisService.to_round(numericalAnalysisService.accSub(numericalAnalysisService.accMul(value.doc_qty, rate), in_out_qty), value.decimal_places, value.decimal_places_type),
                        "decimal_places": value.decimal_places,
                        "decimal_places_type": value.decimal_places_type,
                        "inventory_unit": value.inventory_unit || "",
                        "reference_unit_no": value.reference_unit_no || "",
                        "valuation_unit_no": value.valuation_unit_no || "",
                        "inventory_rate": numericalAnalysisService.accDiv(value.doc_qty, value.inventory_qty),
                        "reference_rate": value.reference_rate || numericalAnalysisService.accDiv(value.doc_qty, value.reference_qty),
                        "valuation_rate": numericalAnalysisService.accDiv(value.doc_qty, value.valuation_qty),
                        "inventory_qty": value.inventory_qty || 0,
                        "reference_qty": value.reference_qty || 0,
                        "valuation_qty": value.valuation_qty || 0,
                        "multi_unit_type": value.multi_unit_type || "1",
                        "first_in_first_out_control": value.first_in_first_out_control || "N",
                        "erp_warehousing": value.erp_warehousing || "N",
                    };

                    var flag = true;
                    switch (userInfoService.userInfo.server_product) {
                        case "EF":
                        case "E10":
                        case "WF":
                            if (Number(temp.allow_doc_qty) > 0) {
                                flag = true;
                            }
                            break;
                        default:
                            if (Number(temp.doc_qty) >= 0) {
                                flag = true;
                            }
                    }

                    if (objArray.length > 0) {
                        angular.forEach(objArray, function(value) {
                            if (angular.equals(value, temp)) {
                                flag = false;
                            }
                        });
                    }

                    if (flag) {
                        objArray.push(temp);
                    }
                });
                return objArray;
            };

            self.accConversion = function(value, doc) {
                return numericalAnalysisService.to_round(numericalAnalysisService.accDiv(numericalAnalysisService.accMul(value, doc.conversion_rate_molecular), doc.conversion_rate_denominator), doc.decimal_places, doc.decimal_places_type);
            };

            return self;
        }
    ]);
});