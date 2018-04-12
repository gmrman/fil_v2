IMPORT os
IMPORT com
IMPORT util
IMPORT XML
GLOBALS "../../api/api.inc"
SCHEMA ds

TYPE type_capp_kb_02_setting_t   RECORD
   ent            LIKE capp_kb_02_setting_t.ent,           #企業編號
   site           LIKE capp_kb_02_setting_t.site,          #營業據點
   limited        LIKE capp_kb_02_setting_t.limited,       #限制方式
   amount         LIKE capp_kb_02_setting_t.amount,        #資料限制
   orderBy        LIKE capp_kb_02_setting_t.orderBy,       #導引角色
   showNumType    LIKE capp_kb_02_setting_t.showNumType,   #每頁筆數
   showNum        LIKE capp_kb_02_setting_t.showNum        #每頁筆數-自定義
               END RECORD 

PUBLIC FUNCTION kb_02_upd_setting(p_json)
   DEFINE p_json     util.JSONArray
   DEFINE tempobj    util.JSONObject
   DEFINE l_master   type_capp_kb_02_setting_t
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

   IF cl_null(l_master.limited) THEN
      LET l_master.limited = ""
   END IF 

   IF cl_null(l_master.limited) THEN
      LET l_master.limited = ""
   END IF 

   #給定預設值
   IF cl_null(l_master.limited) THEN
      LET l_master.limited = ""
   END IF 

   IF cl_null(l_master.amount) THEN
      LET l_master.amount = ""
   END IF 

   IF cl_null(l_master.orderBy) THEN
      LET l_master.orderBy = ""
   END IF

   IF cl_null(l_master.showNum) THEN
      LET l_master.showNum = ""
   END IF 
   LET g_status.code = TRUE

   DELETE FROM capp_kb_02_setting_t
    WHERE ent = l_master.ent
      AND site = l_master.site

   INSERT INTO capp_kb_02_setting_t(ent, site, limited, amount, orderBy, showNumType, showNum)
   VALUES (l_master.ent,l_master.site,l_master.limited, l_master.amount,
           l_master.orderBy, l_master.showNumType, l_master.showNum)
   IF SQLCA.SQLCODE THEN
      LET g_status.code = FALSE
      LET g_status.message = SQLCA.SQLCODE
   END IF
   
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
