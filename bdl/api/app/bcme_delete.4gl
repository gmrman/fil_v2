IMPORT os
IMPORT com
IMPORT util
IMPORT XML
GLOBALS "../../api/api.inc"
SCHEMA ds

#刪除掃描紀錄
FUNCTION bcme_delete(p_jsonarr)
   DEFINE p_jsonarr        util.JSONArray 
   DEFINE r_json           util.JSONArray
   DEFINE tempobj           util.JSONObject
   DEFINE r_return         STRING
   DEFINE l_sql            STRING
   DEFINE l_data           RECORD
            bcae005           LIKE app_base_bcae_t.bcae005,  #出入庫瑪
            bcae006           LIKE app_base_bcae_t.bcae006,  #作業代號
            bcae014           LIKE app_base_bcae_t.bcae014,  #記錄作業編號
            bcae015           LIKE app_base_bcae_t.bcae015   #A開立新單/S過賬/Y確認
                           END RECORD
   DEFINE l_states         DYNAMIC ARRAY OF RECORD
            code              BOOLEAN,     #0:success, 其他:fail
            MESSAGE           STRING,      #说明信息
            data              STRING       #回传值 必需为JSON  String  一般为util.JSON.stringify（DYNAMIC ARRAY OF RECORD）
                           END RECORD
  
   WHENEVER ERROR CONTINUE

   LET tempobj = p_jsonarr.get(1)
   CALL tempobj.toFGL(l_data)

   DELETE FROM app_base_bcme_t
    WHERE bcmeent = g_userInfo.enterprise_no
      AND bcmesite = g_userInfo.site_no
      AND bcme003 = l_data.bcae006
      
   LET l_states[1].* = g_status.*

   LET r_json  = util.JSONArray.fromFGL(l_states)
   LET r_return = r_json.toString()

   RETURN r_return

END FUNCTION
