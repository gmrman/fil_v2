IMPORT util

GLOBALS "../api.inc"
#【{}】
# 调用设备扫码功能
FUNCTION scanBarcode(p_jsonarr)
   DEFINE p_jsonarr  util.JSONArray
   DEFINE r_arr      DYNAMIC ARRAY OF RECORD
            barcode     STRING
                     END RECORD

   WHENEVER ERROR CONTINUE
   
   TRY
      CALL ui.interface.frontCall("mobile", "scanBarCode", [], [r_arr[1].barcode])
      DISPLAY r_arr[1].barcode
      LET g_status.code = TRUE
      LET g_status.message = "调用扫码成功:"
   CATCH
      DISPLAY "Error scaning barcode!"
      LET g_status.code = FALSE
      LET g_status.message = "调用扫码失败"   
   END TRY
   IF cl_null(r_arr[1].barcode) THEN
      LET r_arr[1].barcode = " "
   ELSE 
      LET r_arr[1].barcode = util.strings.urlEncode(r_arr[1].barcode)
   END IF 

   RETURN util.JSON.stringify(r_arr)
END FUNCTION