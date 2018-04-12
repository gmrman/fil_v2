IMPORT util
GLOBALS "../../api/api.inc"
SCHEMA ds

FUNCTION department_delete(p_jsonarr)
   DEFINE p_jsonarr           util.JSONArray 
   DEFINE tempobj             util.JSONObject
   DEFINE r_json              util.JSONArray
   DEFINE r_return            STRING
   DEFINE l_states            DYNAMIC ARRAY OF RECORD
            code                 BOOLEAN,     #0:success, 其他:fail
            MESSAGE              STRING,      #说明信息
            data                 STRING       #回传值 必需为JSON  String  一般为util.JSON.stringify（DYNAMIC ARRAY OF RECORD）
                              END RECORD
   DEFINE l_data           RECORD
            department_no           LIKE department.department_no
                           END RECORD
  
   WHENEVER ERROR CONTINUE

   LET tempobj = p_jsonarr.get(1)
   CALL tempobj.toFGL(l_data)

   DELETE FROM department
    WHERE department_no = l_data.department_no

   IF SQLCA.SQLCODE THEN
      LET g_status.code = FALSE
      LET g_status.message = SQLCA.SQLCODE
   END IF

   LET l_states[1].* = g_status.*

   LET r_json  = util.JSONArray.fromFGL(l_states)
   LET r_return = r_json.toString()

   RETURN r_return
END FUNCTION
