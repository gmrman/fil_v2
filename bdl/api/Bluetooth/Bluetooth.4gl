IMPORT util
GLOBALS "../../api/api.inc"
GLOBALS "../../wonderful/app.inc"
SCHEMA ds

##配置蓝牙地址
#输入:[]
#输出:[]
FUNCTION DeviceListActivity(p_jsonarr)
   DEFINE p_jsonarr     util.JSONArray
   DEFINE l_jsonarr     util.JSONArray
   DEFINE l_jsonobj     util.JSONObject
   DEFINE l_jsonobj2    util.JSONObject
   DEFINE data, extras  STRING

   LET l_jsonarr  = util.JSONArray.create()
   LET l_jsonobj  = util.JSONObject.create()
   LET l_jsonobj2 = util.JSONObject.create()
    
   TRY
      LET l_jsonobj = p_jsonarr.get(1)
      #MESSAGE l_jsonobj.toString()
      CALL ui.Interface.frontCall("android", "startActivityForResult",
                                 ["android.intent.action.VIEW", NULL, NULL, NULL,
                                  "com.digiwin.hBluetooth.DeviceListActivity",NULL],
                                 [ data, extras ])
      #MESSAGE "data=",data," / extras=",extras
      IF NOT cl_null(extras) THEN
         LET g_status.code = TRUE
         LET g_status.message = "配置成功"
         LET l_jsonobj2 = util.JSONObject.parse(extras)
      ELSE
         LET g_status.code = FALSE
         LET g_status.message = "配置失败"
      END IF
      CALL l_jsonarr.put(1,l_jsonobj2)
   CATCH
      LET g_status.code = FALSE
      LET g_status.message = "配置失败",STATUS, ":", err_get(STATUS)
   END TRY  
   
   RETURN l_jsonarr.toString()
END FUNCTION

##连接蓝牙Printer
#输入:[]
#输出:[]
FUNCTION hOpenConnection(p_jsonarr)
   DEFINE p_jsonarr  util.JSONArray
   DEFINE l_jsonarr  util.JSONArray
   DEFINE l_jsonobj  util.JSONObject

   LET l_jsonarr = util.JSONArray.create()
   LET l_jsonobj = util.JSONObject.create()
  
   TRY
      LET l_jsonobj = p_jsonarr.get(1)
      CALL ui.Interface.frontCall("com.digiwin.hBluetooth","hOpenConnection",[l_jsonobj.toString()],[res])
      DISPLAY "res:",res
      MESSAGE "res:",res
      IF res == 'true' THEN
         LET g_status.code = TRUE
         LET g_status.message = "开始连接"
      ELSE
         LET g_status.code = FALSE
         LET g_status.message = "连接失败"
      END IF
   CATCH
      LET g_status.code = FALSE
      LET g_status.message = "连接失败",STATUS, " ", err_get(STATUS)
   END TRY  

   RETURN l_jsonarr.toString()
END FUNCTION

##发送打印内容
#输入:[]
#输出:[]
FUNCTION hSendMessage(p_jsonarr)
   DEFINE p_jsonarr  util.JSONArray
   DEFINE l_jsonarr  util.JSONArray
   DEFINE l_str      STRING

   LET l_jsonarr = util.JSONArray.create()
   LET l_str = ""
  
   TRY
      LET l_str = p_jsonarr.get(1)
      CALL ui.Interface.frontCall("com.digiwin.hBluetooth","hSendMessage",[l_str],[res])
      DISPLAY "res:",res
      MESSAGE "RES：",res
      IF res == 'true' THEN
         LET g_status.code = TRUE
         LET g_status.message = "数据发送成功"
      ELSE
         LET g_status.code = FALSE
         LET g_status.message = "数据发送失败"
      END IF
      CALL l_jsonarr.put(1,res)
   CATCH
      LET g_status.code = FALSE
      LET g_status.message = "数据发送失败",STATUS, " ", err_get(STATUS)
   END TRY
   
   RETURN l_jsonarr.toString()
END FUNCTION