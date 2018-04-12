IMPORT os
IMPORT com
IMPORT util
IMPORT XML
GLOBALS "../../api/api.inc"
SCHEMA ds

TYPE type_capp_kb_05_setting_t   RECORD
   source        LIKE capp_kb_05_setting_t.source,     #來源設定 0.單據類型  1.倉庫
   A01           LIKE capp_kb_05_setting_t.A01,        #出貨
   A02           LIKE capp_kb_05_setting_t.A02,        #領料
   A03           LIKE capp_kb_05_setting_t.A03,        #雜發
   A04           LIKE capp_kb_05_setting_t.A04         #倉退
               END RECORD 

TYPE type_capp_kb_05_warehouse_t   RECORD
   warehouse      LIKE capp_kb_05_warehouse_t.warehouse  #倉庫
               END RECORD 

TYPE type_capp_kb_05_single_t   RECORD
   single         LIKE capp_kb_05_single_t.single     #單別
               END RECORD 

PUBLIC FUNCTION kb_05_get_setting(p_json)
   DEFINE p_json     util.JSONArray
   DEFINE tempobj    util.JSONObject
   DEFINE l_master   RECORD                        
             ent        LIKE capp_receipt_kb_t.ent,       #企業編號
             site       LIKE capp_receipt_kb_t.site       #營業據點                                   
                     END RECORD
   DEFINE l_i            INTEGER
   DEFINE l_warehouse    type_capp_kb_05_warehouse_t
   DEFINE l_single       type_capp_kb_05_single_t
   DEFINE r_json     util.JSONArray
   DEFINE l_sql      STRING
   DEFINE r_return   STRING
   DEFINE r_obj      DYNAMIC ARRAY OF RECORD
             cnt           INTEGER,
             setting       type_capp_kb_05_setting_t,
             warehouse     DYNAMIC ARRAY OF type_capp_kb_05_warehouse_t,
             single        DYNAMIC ARRAY OF type_capp_kb_05_single_t
                     END RECORD

   LET tempobj = p_json.get(1)
   CALL tempobj.toFGL(l_master)

   CALL r_obj.clear()

   LET r_obj[1].cnt = 0;
   SELECT COUNT(1)
     INTO r_obj[1].cnt
     FROM capp_kb_05_setting_t
    WHERE ent = l_master.ent
      AND site = l_master.site

   IF (r_obj[1].cnt > 0) THEN
      #撈取設定值
      SELECT source, A01, A02, A03, A04
        INTO r_obj[1].setting.source, 
             r_obj[1].setting.A01,
             r_obj[1].setting.A02, 
             r_obj[1].setting.A03,
             r_obj[1].setting.A04
        FROM capp_kb_05_setting_t
       WHERE ent = l_master.ent
         AND site = l_master.site
  
      #來源為倉庫時，取得倉庫資料   
      #IF (r_obj[1].setting.source == "1") THEN
      LET l_sql = " SELECT warehouse ",
                  "   FROM capp_kb_05_warehouse_t ",
                  "  WHERE ent = '",l_master.ent,"' ",
                  "    AND site = '",l_master.site,"' ",
                  "  ORDER BY warehouse "
                  
      PREPARE warehouse_t_pre FROM l_sql 
      DECLARE warehouse_t_cs  CURSOR FOR warehouse_t_pre 
  
      LET l_i = 1
      FOREACH warehouse_t_cs INTO l_warehouse.warehouse       
         LET r_obj[1].warehouse[l_i].warehouse = l_warehouse.warehouse
         
         LET l_i = l_i + 1
      END FOREACH
      #END IF
  
      #取得單別資料 
      LET l_sql = " SELECT single ",
                  "   FROM capp_kb_05_single_t ",
                  "  WHERE ent = '",l_master.ent,"' ",
                  "    AND site = '",l_master.site,"' ",
                  "  ORDER BY single "
                  
      PREPARE single_pre FROM l_sql 
      DECLARE single_cs  CURSOR FOR single_pre 
  
      LET l_i = 1
      FOREACH single_cs INTO l_single.single
                              
         LET r_obj[1].single[l_i].single = l_single.single
         
         LET l_i = l_i + 1
      END FOREACH
   END IF

   LET r_json  = util.JSONArray.fromFGL(r_obj)
   LET r_return = r_json.toString()

   RETURN r_return
END FUNCTION
