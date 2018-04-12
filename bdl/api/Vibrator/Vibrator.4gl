IMPORT util
GLOBALS "../../api/api.inc"
GLOBALS "../../wonderful/app.inc"
SCHEMA ds

##振动API
#输入:[]
#输出:[]
FUNCTION Vibrator(p_jsonarr)
   DEFINE p_jsonarr util.JSONArray
   DEFINE l_jsonobj util.JSONObject
   DEFINE l_jsonarr util.JSONArray

   LET l_jsonarr = util.JSONArray.create()
   LET l_jsonobj = util.JSONObject.create()

   TRY
      CALL ui.Interface.frontCall("com.digiwin.hVibrating","hVibrating",[],[res])
      DISPLAY "res:",res
      MESSAGE res
      IF NOT cl_null(res) THEN
         LET g_status.code = TRUE
         LET g_status.message = "振动成功"
      ELSE
         LET g_status.code = FALSE
         LET g_status.message = "振动失败"
      END IF
   CATCH
      LET g_status.code = FALSE
      LET g_status.message = "振动失败",STATUS, ":", err_get(STATUS)
    END TRY  

   RETURN l_jsonarr.toString()
END FUNCTION