IMPORT os
IMPORT com
IMPORT util
IMPORT XML
GLOBALS "../../api/api.inc"
SCHEMA ds

#刪除掃描紀錄
FUNCTION bcme_ae_af_delete(p_jsonarr)
   DEFINE p_jsonarr        util.JSONArray 
   DEFINE r_json           util.JSONArray
   DEFINE tempobj           util.JSONObject
   DEFINE r_return         STRING
   DEFINE l_bcae003        LIKE app_base_bcae_t.bcae003
   DEFINE l_data           RECORD
            bcae005           LIKE app_base_bcae_t.bcae005,  #出入庫瑪
            bcae006           LIKE app_base_bcae_t.bcae006,  #作業代號
            bcae014           LIKE app_base_bcae_t.bcae014,  #記錄作業編號
            bcae015           LIKE app_base_bcae_t.bcae015,  #A開立新單/S過賬/Y確認
            info_id           LIKE app_base_bcae_t.bcae001
                           END RECORD
   DEFINE l_states         DYNAMIC ARRAY OF RECORD
            code              BOOLEAN,     #0:success, 其他:fail
            MESSAGE           STRING,      #说明信息
            data              STRING       #回传值 必需为JSON  String  一般为util.JSON.stringify（DYNAMIC ARRAY OF RECORD）
                           END RECORD
  
   WHENEVER ERROR CONTINUE

   LET tempobj = p_jsonarr.get(1)
   CALL tempobj.toFGL(l_data)

   SELECT bcae003
     INTO l_bcae003
     FROM app_base_bcae_t
    WHERE bcaeent = g_userInfo.enterprise_no
      AND bcaesite = g_userInfo.site_no
      AND bcae014 = l_data.bcae014
      AND bcae015 = l_data.bcae015
      AND bcae001 = l_data.info_id

   DELETE FROM app_base_bcae_t 
    WHERE bcaeent = g_userInfo.enterprise_no
      AND bcaesite = g_userInfo.site_no
      AND bcae003 = l_bcae003
         
   DELETE FROM app_base_bcaf_t 
    WHERE bcafent = g_userInfo.enterprise_no
      AND bcafsite = g_userInfo.site_no
      AND bcaf003 = l_bcae003
   
   DELETE FROM app_base_bcme_t
    WHERE bcmeent = g_userInfo.enterprise_no
      AND bcmesite = g_userInfo.site_no
      AND bcme003 = l_data.bcae006
      AND bcme999 = l_data.info_id
      
   LET l_states[1].* = g_status.*

   LET r_json  = util.JSONArray.fromFGL(l_states)
   LET r_return = r_json.toString()

   RETURN r_return

END FUNCTION
