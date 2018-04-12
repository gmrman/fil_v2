IMPORT util
GLOBALS "../../api/api.inc"
GLOBALS "../../wonderful/app.inc"

SCHEMA ds

#初化化蓝牙
FUNCTION BluetoothWidgetInit(p_jsonarr)
   DEFINE p_jsonarr util.JSONArray
   DEFINE l_jsonobj util.JSONObject
   DEFINE l_jsonarr util.JSONArray

   LET l_jsonarr= util.JSONArray.create()
   LET l_jsonobj = util.JSONObject.create()

   TRY
      LET l_jsonobj = jsonarr.get(1)
      CALL ui.Interface.frontCall("com.digiwin.bluetooth","BluetoothWidgetInit",[l_jsonobj.toString()],[res])
      DISPLAY "res:",res
      LET g_status.code = TRUE
      LET g_status.message = "初始化蓝牙小部件成功"
      
      IF cl_null(res) THEN
         LET g_status.code = FALSE
         LET g_status.message = "初始化蓝牙小部件失败"
      END IF
   CATCH
      LET g_status.code =  FALSE
      LET g_status.message = "初始化蓝牙小部件失败",STATUS, ":", err_get(STATUS)
   END TRY
   MESSAGE g_status.message
   RETURN l_jsonarr.toString()
END FUNCTION

#蓝牙发送
FUNCTION BluetoothWidgetSend(p_jsonarr)
   DEFINE p_jsonarr util.JSONArray
   DEFINE l_jsonarr util.JSONArray
   DEFINE l_str STRING

   LET l_jsonarr= util.JSONArray.create()
   LET l_str = ""

   TRY
      LET l_str = jsonarr.get(1)
      CALL ui.Interface.frontCall("com.digiwin.bluetooth","BluetoothWidgetSend",[l_str],[res])
      DISPLAY "res:",res
      
      LET g_status.code = TRUE
      LET g_status.message = "数据发送成功"
      
      IF cl_null(res) THEN
         LET g_status.code = FALSE
         LET g_status.message = "数据发送失败"
      END IF
   CATCH
      LET g_status.code = FALSE
      LET g_status.message = "数据发送失败",STATUS, " ", err_get(STATUS)
   END TRY  

   RETURN l_jsonarr.toString()
END FUNCTION

#显示蓝牙小部件
FUNCTION BluetoothWidgetShow(p_jsonarr)
   DEFINE p_jsonarr util.JSONArray
   DEFINE l_jsonarr util.JSONArray
   
   LET l_jsonarr= util.JSONArray.create()

   TRY
      CALL ui.Interface.frontCall("com.digiwin.bluetooth","BluetoothWidgetShow",[],[res])
      DISPLAY "res:",res
      
      LET g_status.code = TRUE
      LET g_status.message = "显示蓝牙小部件成功"
      
      IF cl_null(res) THEN
         LET g_status.code = FALSE
         LET g_status.message = "显示蓝牙小部件失败"
      END IF
   CATCH
      LET g_status.code = FALSE
      LET g_status.message = "显示蓝牙小部件失败",STATUS, " ", err_get(STATUS)
   END TRY  

   RETURN l_jsonarr.toString()
END FUNCTION

#隐藏蓝牙小部件
FUNCTION BluetoothWidgetHide(p_jsonarr)
   DEFINE p_jsonarr util.JSONArray
   DEFINE l_jsonarr util.JSONArray

   LET l_jsonarr= util.JSONArray.create()

   TRY
      CALL ui.Interface.frontCall("com.digiwin.bluetooth","BluetoothWidgetHide",[],[res])
      DISPLAY "res:",res

      LET g_status.code = TRUE
      LET g_status.message = "隐藏蓝牙小部件成功"
      
      IF cl_null(res) THEN
         LET g_status.code = FALSE
         LET g_status.message = "隐藏蓝牙小部件失败"
      END IF
   CATCH
      LET g_status.code = FALSE
      LET g_status.message = "隐藏蓝牙小部件失败",STATUS, " ", err_get(STATUS)
   END TRY  

   RETURN l_jsonarr.toString()
END FUNCTION