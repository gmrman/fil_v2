IMPORT util
GLOBALS "../../api/api.inc"
GLOBALS "../../wonderful/app.inc"

SCHEMA ds

##RAM
#输入:[]
#输出:[]
FUNCTION RamUtils(p_jsonarr)
   DEFINE p_jsonarr util.JSONArray
   DEFINE l_jsonobj util.JSONObject
   DEFINE l_jsonarr util.JSONArray

   LET l_jsonarr= util.JSONArray.create()
   LET l_jsonobj = util.JSONObject.create()
   
   TRY
      LET l_jsonobj = p_jsonarr.get(1)
      CALL ui.Interface.frontCall("com.digiwin.ram","hRam",[l_jsonobj.toString()],[res])
      DISPLAY "res:",res
      MESSAGE res
      IF NOT cl_null(res) THEN
         LET g_status.code = TRUE
         LET g_status.message = "RAM成功"
      ELSE
         LET g_status.code = FALSE
         LET g_status.message = "RAM失败"
      END IF
   CATCH
      LET g_status.code = FALSE
      LET g_status.message = "RAM失败",STATUS, ":", err_get(STATUS)
      RETURN l_jsonarr.toString()
   END TRY  

   RETURN g_status.code
END FUNCTION
