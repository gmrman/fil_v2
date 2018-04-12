IMPORT os
IMPORT com
IMPORT util
IMPORT XML
GLOBALS "../../api/api.inc"
SCHEMA ds

PUBLIC FUNCTION menuinformation_upd(p_jsonarr)
   DEFINE p_jsonarr   util.JSONArray 
   DEFINE r_json      util.JSONArray
   DEFINE r_return    STRING
   DEFINE l_i         INTEGER
   DEFINE l_states    DYNAMIC ARRAY OF RECORD
             code        BOOLEAN,     #0:success, 其他:fail
             MESSAGE     STRING,      #说明信息
             data        STRING       #回传值 必需为JSON  String  一般为util.JSON.stringify（DYNAMIC ARRAY OF RECORD）
                      END RECORD
   DEFINE l_data      DYNAMIC ARRAY OF RECORD
             func        LIKE menuinformation.func
                      END RECORD
   DEFINE l_menu_t    RECORD
          enterprise_no  LIKE menuinformation.enterprise_no,
          site_no        LIKE menuinformation.site_no,
          account        LIKE menuinformation.account,
          func           LIKE menuinformation.func,
          iscommon       LIKE menuinformation.iscommon 
                      END RECORD

   WHENEVER ERROR CONTINUE

   INITIALIZE l_data TO NULL
   INITIALIZE l_menu_t TO NULL
   LET g_status.code = TRUE
   
   CALL p_jsonarr.toFGL(l_data)

   DELETE FROM menuinformation 
    WHERE enterprise_no = g_userInfo.enterprise_no
      AND site_no = g_userInfo.site_no
      AND account = g_userInfo.account

   BEGIN WORK

   LET l_menu_t.enterprise_no = g_userInfo.enterprise_no
   LET l_menu_t.site_no = g_userInfo.site_no
   LET l_menu_t.account =  g_userInfo.account

   FOR l_i = 1 TO l_data.getLength()

      LET l_menu_t.func = l_data[l_i].func
      LET l_menu_t.iscommon = "Y"
   
      INSERT INTO menuinformation VALUES(l_menu_t.*)
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
