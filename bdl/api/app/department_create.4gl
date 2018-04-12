IMPORT util
GLOBALS "../../api/api.inc"
SCHEMA ds

PUBLIC FUNCTION department_create(p_jsonarr)
   DEFINE p_jsonarr           util.JSONArray 
   DEFINE tempobj             util.JSONObject
   DEFINE r_json              util.JSONArray
   DEFINE r_return            STRING
   DEFINE l_states            DYNAMIC ARRAY OF RECORD
            code                 BOOLEAN,     #0:success, 其他:fail
            MESSAGE              STRING,      #说明信息
            data                 STRING       #回传值 必需为JSON  String  一般为util.JSON.stringify（DYNAMIC ARRAY OF RECORD）
                              END RECORD
   DEFINE l_department        RECORD
            department_no        LIKE department.department_no
                              END RECORD

   WHENEVER ERROR CONTINUE

   INITIALIZE l_department TO NULL
   LET g_status.code = TRUE

   LET tempobj = p_jsonarr.get(1)
   CALL tempobj.toFGL(l_department)

   BEGIN WORK
   
   INSERT INTO department VALUES(l_department.*)
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
