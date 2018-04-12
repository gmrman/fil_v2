IMPORT os
IMPORT com
IMPORT util
IMPORT XML
GLOBALS "../../api/api.inc"
SCHEMA ds

PUBLIC FUNCTION kb_01_capp_receipt_kb_t_create(p_json)
   DEFINE p_json                util.JSONArray
   DEFINE tempobj               util.JSONObject
   DEFINE r_json                util.JSONArray
   DEFINE r_return              STRING
   DEFINE l_states          DYNAMIC ARRAY OF RECORD
          code              BOOLEAN,      #0:success, 其他:fail
          MESSAGE           STRING,      #说明信息
          data              STRING       #回传值 必需为JSON  String  一般为util.JSON.stringify（DYNAMIC ARRAY OF RECORD）
                            END RECORD
   DEFINE l_capp_receipt_kb_t   RECORD LIKE capp_receipt_kb_t.*
   DEFINE l_data                RECORD LIKE capp_receipt_kb_t.*

   WHENEVER ERROR CONTINUE
   
   LET tempobj = p_json.get(1)
   CALL tempobj.toFGL(l_data)

   BEGIN WORK
   
   LET g_status.code = TRUE
   DELETE FROM capp_receipt_kb_t
   
   LET l_capp_receipt_kb_t.ent = l_data.ent
   LET l_capp_receipt_kb_t.site = l_data.site
   LET l_capp_receipt_kb_t.showme = l_data.showme

   INSERT INTO capp_receipt_kb_t VALUES(l_capp_receipt_kb_t.*)
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
