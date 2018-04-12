IMPORT os
IMPORT com
IMPORT util
IMPORT XML
GLOBALS "../../api/api.inc"
SCHEMA ds

TYPE type_capp_kb_02_setting_t   RECORD
   limited        LIKE capp_kb_02_setting_t.limited,       #限制方式
   amount         LIKE capp_kb_02_setting_t.amount,        #資料限制
   orderBy        LIKE capp_kb_02_setting_t.orderBy,       #導引角色
   showNumType    LIKE capp_kb_02_setting_t.showNumType,   #每頁筆數
   showNum        LIKE capp_kb_02_setting_t.showNum        #每頁筆數-自定義
               END RECORD 

PUBLIC FUNCTION kb_02_get_setting(p_json)
   DEFINE p_json     util.JSONArray
   DEFINE tempobj     util.JSONObject
   DEFINE l_master    RECORD                        
             ent          LIKE capp_receipt_kb_t.ent,       #企業編號
             site         LIKE capp_receipt_kb_t.site       #營業據點                                   
                      END RECORD
   DEFINE r_json     util.JSONArray
   DEFINE r_return   STRING
   DEFINE r_obj      DYNAMIC ARRAY OF RECORD
             cnt        INTEGER,
             setting    type_capp_kb_02_setting_t
                     END RECORD

   LET tempobj = p_json.get(1)
   CALL tempobj.toFGL(l_master)

   CALL r_obj.clear()

   LET r_obj[1].cnt = 0;
   SELECT COUNT(1)
     INTO r_obj[1].cnt
     FROM capp_kb_02_setting_t
    WHERE ent = l_master.ent
      AND site = l_master.site

   IF (r_obj[1].cnt > 0) THEN
      SELECT limited, amount, orderBy, showNumType, showNum
        INTO r_obj[1].setting.limited, 
             r_obj[1].setting.amount, 
             r_obj[1].setting.orderBy,
             r_obj[1].setting.showNumType,
             r_obj[1].setting.showNum
        FROM capp_kb_02_setting_t
       WHERE ent = l_master.ent
         AND site = l_master.site
   END IF

   LET r_json  = util.JSONArray.fromFGL(r_obj)
   LET r_return = r_json.toString()

   RETURN r_return
END FUNCTION
