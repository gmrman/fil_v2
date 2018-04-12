IMPORT os
IMPORT com
IMPORT util
IMPORT XML
GLOBALS "../../api/api.inc"
SCHEMA ds

PUBLIC FUNCTION kb_01_get_show_chart_setting(p_json)
   DEFINE p_json     util.JSONArray
   DEFINE tempobj    util.JSONObject
   DEFINE l_master   RECORD                        
             ent          LIKE capp_receipt_kb_t.ent,       #企業編號
             site         LIKE capp_receipt_kb_t.site       #營業據點                                    
                     END RECORD
   DEFINE r_json     util.JSONArray
   DEFINE r_return   STRING
   DEFINE r_obj DYNAMIC ARRAY OF RECORD
             showme       LIKE capp_receipt_kb_t.showme     #圖表顯示否
                END RECORD

   LET tempobj = p_json.get(1)
   CALL tempobj.toFGL(l_master)
   
   CALL r_obj.clear()
   
   SELECT showme
     INTO r_obj[1].showme
     FROM capp_receipt_kb_t
    WHERE ent = l_master.ent
      AND site = l_master.site

   LET r_json  = util.JSONArray.fromFGL(r_obj)
   LET r_return = r_json.toString()

   RETURN r_return
END FUNCTION
