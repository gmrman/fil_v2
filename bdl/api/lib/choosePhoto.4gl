IMPORT util
GLOBALS "../api.inc"

FUNCTION choosePhoto(p_jsonarr)
   DEFINE p_jsonarr     util.JSONArray
   DEFINE r_arr         DYNAMIC ARRAY OF RECORD
            photo_path     STRING
                        END RECORD

   WHENEVER ERROR CONTINUE
   
   TRY
      CALL ui.Interface.frontCall("mobile", "choosePhoto", [], [r_arr[1].photo_path])
      DISPLAY r_arr[1].photo_path
      LET g_status.code = TRUE
      LET g_status.message="取得相片位置成功:"
   CATCH
      DISPLAY "Error choose photo!"
      LET g_status.code = FALSE
      LET g_status.message = "取得相片位置失敗:"      
   END TRY
   
   IF cl_null(r_arr[1].photo_path) THEN
      LET r_arr[1].photo_path = " "
   END IF 
   
   RETURN util.JSON.stringify(r_arr)
END FUNCTION