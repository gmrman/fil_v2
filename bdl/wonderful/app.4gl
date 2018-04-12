IMPORT com
IMPORT util
GLOBALS "../api/api.inc"
GLOBALS "app.inc"
PUBLIC FUNCTION app()
   TRY
      INITIALIZE g_result TO NULL
      LET g_result = util.JSONObject.create()
      LET result='[]'
      LET operation = jsonobj.get("operation")
      DISPLAY "INFO:OPERATION:", operation,"->"
      LET jsonarr = util.JSONArray.create()
      LET g_status.code = TRUE
      
      TRY
         LET jsonarr= jsonobj.get("data");
      CATCH
         LET g_status.code = FALSE
         LET g_status.message = "ERROR:GET DATA ERROR!"
      END TRY
      
      #DISPLAY "INFO:DATA:",jsonarr.toString()
      IF cl_null(g_user)  THEN
         CASE operation
            WHEN "authentication"
            OTHERWISE
                LET g_status.code = FALSE
                LET g_status.message = "会话过期,请退出后重新登录!"
                DISPLAY g_status.message
                CALL g_result.put('message',g_status.message)
                CALL g_result.put('data',util.JSONArray.parse(result))
                LET g_status.data=g_result.toString()
                #DISPLAY "INFO:RESULT:",g_status.data
                DISPLAY "INFO:OPERATION <-",operation
                RETURN
         END CASE
      END IF

      #调用Model执行业务逻辑
      CASE operation
         #app自定义函数处
         WHEN "changeTitle"
            CALL strategies('type_data')
            CALL changeTitle(jsonarr)  RETURNING result 
         OTHERWISE
            LET g_status.code = FALSE
            LET g_status.message = "Operation ", jsonobj.get('operation'), " is not defined!"
      END CASE
   CATCH
      LET g_status.code = FALSE
      LET g_status.message= "发生错语：未捕获异常"
      ERROR "发生未捕获异常" 
   END TRY

   IF NOT g_status.code THEN
      DISPLAY g_status.message
   END IF
   CALL g_result.put('message',g_status.message)
   CALL g_result.put('data',util.JSONArray.parse(result))
   LET g_status.data=g_result.toString()
   DISPLAY "INFO:RESULT:",g_status.data
   DISPLAY "INFO:OPERATION <-",operation
   RETURN 
END FUNCTION

