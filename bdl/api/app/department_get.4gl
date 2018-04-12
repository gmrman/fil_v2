IMPORT util
GLOBALS "../../api/api.inc"
SCHEMA ds

PUBLIC FUNCTION department_get(p_jsonarr)
   DEFINE p_jsonarr        util.JSONArray 
   DEFINE tempobj          util.JSONObject
   DEFINE r_json           util.JSONArray
   DEFINE r_return         STRING
   DEFINE l_sql            STRING
   DEFINE l_i              INTEGER
   DEFINE r_obj            DYNAMIC ARRAY OF RECORD
            department_no     LIKE department.department_no
                           END RECORD

   WHENEVER ERROR CONTINUE

   LET g_status.code = TRUE
   
   LET l_sql = " SELECT department_no  ",
               "   FROM department     "
               
   PREPARE dep_pre FROM l_sql 
   DECLARE dep_cr  CURSOR FOR dep_pre 
   
   LET l_i = 1
   FOREACH dep_cr INTO r_obj[l_i].*
      LET l_i = l_i + 1
   END FOREACH
   CALL r_obj.deleteElement(l_i)
      
   LET r_json  = util.JSONArray.fromFGL(r_obj)
   LET r_return = r_json.toString()

   RETURN r_return
END FUNCTION