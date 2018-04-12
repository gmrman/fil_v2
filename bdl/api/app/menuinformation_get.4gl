IMPORT os
IMPORT com
IMPORT util
IMPORT XML
GLOBALS "../../api/api.inc"
SCHEMA ds

PUBLIC FUNCTION menuinformation_get(p_json)
   DEFINE p_json     util.JSONArray
   DEFINE r_json     util.JSONArray
   DEFINE r_return   STRING
   DEFINE l_sql      STRING
   DEFINE l_i        INTEGER
   DEFINE r_obj DYNAMIC ARRAY OF RECORD
             func         LIKE menuinformation.func,       #menu編號
             iscommon     LIKE menuinformation.iscommon    #常用否
                END RECORD

   IF cl_null(g_userInfo.enterprise_no) THEN
      LET g_userInfo.enterprise_no = 99
   END IF
                
   LET l_sql =  " SELECT func , iscommon ",
                "   FROM menuinformation ",
                "  WHERE enterprise_no = '",g_userInfo.enterprise_no,"'",
                "    AND site_no = '",g_userInfo.site_no,"'",
                "    AND account = '",g_userInfo.account,"'"
   DISPLAY l_sql
   PREPARE menu_pre FROM l_sql 
   DECLARE menu_cr  CURSOR FOR menu_pre 
   LET l_i = 1
   FOREACH menu_cr INTO r_obj[l_i].*
      LET l_i = l_i + 1
   END FOREACH
   CALL r_obj.deleteElement(l_i)
      
   LET r_json  = util.JSONArray.fromFGL(r_obj)
   LET r_return = r_json.toString()

   RETURN r_return

END FUNCTION
