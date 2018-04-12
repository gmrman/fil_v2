IMPORT os
IMPORT com
IMPORT util
IMPORT XML
GLOBALS "../../api/api.inc"
SCHEMA ds

TYPE type_capp_kb_05_setting_t   RECORD
   ent           LIKE capp_kb_05_setting_t.ent,        #企業編號
   site          LIKE capp_kb_05_setting_t.site,       #營業據點
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
               
PUBLIC FUNCTION kb_05_upd_setting(p_json)
   DEFINE p_json     util.JSONArray
   DEFINE tempobj    util.JSONObject
   DEFINE l_master   RECORD
             setting      type_capp_kb_05_setting_t,
             warehouse    DYNAMIC ARRAY OF type_capp_kb_05_warehouse_t,
             single       DYNAMIC ARRAY OF type_capp_kb_05_single_t
                 END RECORD
   DEFINE l_i        INTEGER
   DEFINE l_states          DYNAMIC ARRAY OF RECORD
          code              BOOLEAN,      #0:success, 其他:fail
          MESSAGE           STRING,      #说明信息
          data              STRING       #回传值 必需为JSON  String  一般为util.JSON.stringify（DYNAMIC ARRAY OF RECORD）
                            END RECORD
   DEFINE r_json     util.JSONArray
   DEFINE r_return   STRING

   WHENEVER ERROR CONTINUE

   LET tempobj = p_json.get(1)
   CALL tempobj.toFGL(l_master)

   IF cl_null(l_master.setting.source) THEN
      LET l_master.setting.source = ""
   END IF 

   IF cl_null(l_master.setting.A01) THEN
      LET l_master.setting.A01 = ""
   END IF 

   #給定預設值
   IF cl_null(l_master.setting.A02) THEN
      LET l_master.setting.A02 = ""
   END IF 

   IF cl_null(l_master.setting.A03) THEN
      LET l_master.setting.A03 = ""
   END IF 

   IF cl_null(l_master.setting.A04) THEN
      LET l_master.setting.A04 = ""
   END IF
   LET g_status.code = TRUE

   DELETE FROM capp_kb_05_setting_t
    WHERE ent = l_master.setting.ent
      AND site = l_master.setting.site

   DELETE FROM capp_kb_05_warehouse_t
    WHERE ent = l_master.setting.ent
      AND site = l_master.setting.site

   DELETE FROM capp_kb_05_single_t
    WHERE ent = l_master.setting.ent
      AND site = l_master.setting.site

   INSERT INTO capp_kb_05_setting_t(ent, site, source, A01, A02, A03, A04)
   VALUES (l_master.setting.ent,l_master.setting.site,l_master.setting.source,
           l_master.setting.A01,l_master.setting.A02,l_master.setting.A03,
           l_master.setting.A04)
   IF SQLCA.SQLCODE THEN
      LET g_status.code = FALSE
      LET g_status.message = SQLCA.SQLCODE
   END IF

   FOR l_i = 1 TO l_master.warehouse.getLength()    
      IF l_master.warehouse[l_i].warehouse IS NULL THEN
         CONTINUE FOR
      END IF 
      
      INSERT INTO capp_kb_05_warehouse_t(ent, site, warehouse)
      VALUES (l_master.setting.ent,l_master.setting.site,
              l_master.warehouse[l_i].warehouse)
      IF SQLCA.SQLCODE THEN
         LET g_status.code = FALSE
         LET g_status.message = SQLCA.SQLCODE
      END IF
   END FOR

   FOR l_i = 1 TO l_master.single.getLength()  
      IF l_master.single[l_i].single IS NULL THEN
         CONTINUE FOR
      END IF 
      
      INSERT INTO capp_kb_05_single_t(ent, site, single)
      VALUES (l_master.setting.ent,l_master.setting.site,
              l_master.single[l_i].single) 
      IF SQLCA.SQLCODE THEN
         LET g_status.code = FALSE
         LET g_status.message = SQLCA.SQLCODE
      END IF
   END FOR

   IF g_status.code THEN
      COMMIT WORK
   ELSE
      ROLLBACK WORK
   END IF
     
   LET l_states[1].* = g_status.*

   LET r_json  = util.JSONArray.fromFGL(l_states)
   LET r_return = r_json.toString()

   RETURN r_return
END FUNCTION
