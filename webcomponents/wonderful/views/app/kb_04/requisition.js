define(["app", "API", "APIS"], function (app) {
   app.service("kb_04_requisition", ["APIService", "$timeout", "numericalAnalysisService",
      function (APIService, $timeout, numericalAnalysisService) {

         var self = this
         
         //跳頁前備份參數
         self.page_params_bak = {}

         self.init = function () {
            self.params = {}
            self.parameter = {}

            self.doc_array = []
            self.source_doc_detail = []
            self.barcode_detail = []
         }
         self.init()

         self.kb_02_bakPageParams = function (obj) {
            self.page_params_bak = obj
         }

         //進貨導引選取的資料
         self.kb_02_setDocArray = function (temp) {
            self.doc_array = temp
         }

         self.setParams = function (params) {
            self.params = params
         }

         self.setParameter = function (parameter) {
            self.parameter = parameter

            if (parameter.barcode_detail) {
               var temp_barcode_detail = angular.copy(self.barcode_detail)
               self.barcode_detail = temp_barcode_detail.concat(parameter.barcode_detail)
            }

            if (parameter.source_doc_detail) {
               var temp_source_doc_detail = angular.copy(self.source_doc_detail)
               self.source_doc_detail = temp_source_doc_detail.concat(parameter.source_doc_detail)
            }
         }

         self.getItemDocQty = function () {
            var objArray = []
            var temp = {}
            angular.forEach(self.source_doc_detail, function (value) {
               var in_out_qty = value.in_out_qty || 0
               var allow_error_rate = value.allow_error_rate || 0
               var rate = numericalAnalysisService.accAdd(1, numericalAnalysisService.accDiv(allow_error_rate, 100))
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
                  "conversion_rate_denominator": value.conversion_rate_denominator || 1,
                  "conversion_rate_molecular": value.conversion_rate_molecular || 1,
                  "doc_qty": numericalAnalysisService.to_round(numericalAnalysisService.accSub(value.doc_qty, in_out_qty), value.decimal_places, value.decimal_places_type),
                  "unit_no": value.unit_no,
                  "allow_doc_qty": numericalAnalysisService.to_round(numericalAnalysisService.accSub(numericalAnalysisService.accMul(value.doc_qty, rate), in_out_qty), value.decimal_places, value.decimal_places_type),
                  "decimal_places": value.decimal_places,
                  "decimal_places_type": value.decimal_places_type,
                  "reference_unit_no": value.reference_unit_no || "",
                  "reference_qty": value.reference_qty || 0,
                  "reference_rate": value.reference_rate || numericalAnalysisService.accDiv(value.doc_qty, value.reference_qty),
                  "reference_decimal_places": value.reference_decimal_places,
                  "reference_decimal_places_type": value.reference_decimal_places_type,
                  "valuation_unit_no": value.valuation_unit_no || "",
                  "valuation_rate": numericalAnalysisService.accDiv(value.doc_qty, value.valuation_qty),
                  "valuation_qty": value.valuation_qty || 0,
                  "multi_unit_type": value.multi_unit_type || "1",
               }

               var flag = true
               if (objArray.length > 0) {
                  angular.forEach(objArray, function (value) {
                     if (angular.equals(value, temp)) {
                        flag = false
                     }
                  })
               }

               if (flag) {
                  objArray.push(temp)
               }
            })
            return objArray
         }

         return self
      }
   ])
})
