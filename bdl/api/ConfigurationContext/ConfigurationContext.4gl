IMPORT util
GLOBALS "../../api/api.inc"
GLOBALS "../../wonderful/app.inc"
SCHEMA ds

##取得配置
#输入:[]
#输出:[]
FUNCTION getConfig(p_jsonarr)
   DEFINE p_jsonarr util.JSONArray
   DEFINE l_jsonarr util.JSONArray

   LET l_jsonarr = util.JSONArray.create()
   LET g_status.code = FALSE
   LET g_status.message = "取得配置失败"
   
   TRY
      CALL ui.Interface.frontCall("com.digiwin.hConfigurationContext","getConfig",[],[res])
      #DISPLAY "res:",res
      #MESSAGE res
      IF NOT cl_null(res) THEN
         LET g_status.code = TRUE
         LET g_status.message = "取得配置成功"
      END IF
   CATCH
      LET g_status.code = FALSE
      LET g_status.message = "取得配置失败",STATUS, ":", err_get(STATUS)
   END TRY  

   IF g_status.code THEN
      RETURN res
   ELSE
      RETURN l_jsonarr.toString()
   END IF

END FUNCTION

##清除配置
#输入:[]
#输出:[]
FUNCTION clearConfig(p_jsonarr)
   DEFINE p_jsonarr util.JSONArray
   DEFINE l_jsonarr util.JSONArray

   LET l_jsonarr= util.JSONArray.create()
   LET g_status.code = FALSE
   LET g_status.message = "清除配置失败"
   
   TRY
      CALL ui.Interface.frontCall("com.digiwin.hConfigurationContext","clearConfig",[],[res])
      #DISPLAY "res:",res
      #MESSAGE res
      IF (NOT cl_null(res)) AND res THEN
         LET g_status.code = TRUE
         LET g_status.message = "清除配置成功"
      END IF
   CATCH
      LET g_status.code = FALSE
      LET g_status.message = "清除配置失败",STATUS, ":", err_get(STATUS)
   END TRY  

   RETURN l_jsonarr.toString()
END FUNCTION

##设定配置
#输入:[]
#输出:[]
FUNCTION setConfig(p_jsonarr)
   DEFINE p_jsonarr util.JSONArray
   DEFINE l_jsonarr util.JSONArray

   LET l_jsonarr= util.JSONArray.create()
   LET g_status.code = FALSE
   LET g_status.message = "设定配置失败"
    
   TRY
      CALL ui.Interface.frontCall("com.digiwin.hConfigurationContext","setConfig",[p_jsonarr.toString()],[res])
      #DISPLAY "res:",res
      #MESSAGE res
      IF NOT cl_null(res) THEN
         LET g_status.code = TRUE
         LET g_status.message = "设定配置成功"
      END IF
   CATCH
      LET g_status.code = FALSE
      LET g_status.message = "设定配置失败",STATUS, ":", err_get(STATUS)
   END TRY  

   RETURN l_jsonarr.toString()
END FUNCTION