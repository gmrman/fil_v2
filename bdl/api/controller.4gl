IMPORT util
IMPORT os
IMPORT security

#引用全局变量
GLOBALS "api.inc"

FUNCTION controller()
   DISPLAY "INFO:CONTROLLER->",CURRENT YEAR TO FRACTION(5)
   INITIALIZE g_status TO NULL
   LET g_status.code = TRUE

   TRY
     # DISPLAY "INFO:CONTROLLER:",web
      LET jsonobj = util.JSONObject.parse(security.Base64.ToString(web))

   CATCH
      LET g_status.code = FALSE;
      LET g_status.message = "PARSE PARAM ERROR"
      DISPLAY g_status.message
      
   END TRY

   TRY
      LET type = jsonobj.get("type")
      DISPLAY "INFO:TYPE:", type,"->"

      TRY
         #调用对应的API:api,app
         CASE type
            WHEN "api"
               CALL api() 

            WHEN "app"
               CALL app()

            OTHERWISE
               LET g_status.code = FALSE;
               LET g_status.message = "Library ", type, " is not defined!"
               DISPLAY g_status.message
         END CASE
         
      CATCH
         LET g_status.code = FALSE;
         LET g_status.message = "Library ", type, " 发生异常"
         DISPLAY g_status.message
         RETURN FALSE

      END TRY

      IF g_status.code THEN
         IF js_callback("onApiSuccess", g_status.data) THEN END IF
      ELSE
         IF js_callback("onApiFail", g_status.data) THEN END IF
      END IF
            
   CATCH
      LET g_status.code = FALSE;
      LET g_status.message = "ERROR:前端页面发生异常!"
      DISPLAY g_status.message
      RETURN FALSE
   END TRY

   DISPLAY "INFO:TYPE <-",TYPE
   DISPLAY "INFO:CONTROLLER ",res,"<-",CURRENT YEAR TO FRACTION(5)    
   RETURN TRUE

END FUNCTION

PRIVATE FUNCTION js_callback(p_func, p_context)
   DEFINE p_func STRING
   DEFINE p_context STRING

   CONSTANT CHUNK_SIZE = 2000000

   DEFINE l_count INTEGER
   DEFINE l_startPos INTEGER
   DEFINE l_endPos INTEGER
   DEFINE l_chunk STRING

   LET l_startPos = 1
   LET l_endPos = CHUNK_SIZE
   LET l_count = 0
   
   DISPLAY "INFO:",p_func,":",p_context
   
   IF call_js(p_func, NULL, 'CLEAR', NULL) THEN END IF
   
   WHILE l_startPos < p_context.getLength()
      IF l_endPos > p_context.getLength() THEN
         LET l_endPos = p_context.getLength()
      END IF
      LET l_chunk = p_context.subString(l_startPos, l_endPos)
   
      IF call_js(p_func, l_chunk, 'CHUNK', l_count) THEN END IF
   
      LET l_startPos = l_startPos + CHUNK_SIZE
      LET l_endPos = l_startPos + CHUNK_SIZE - 1
      LET l_count = l_count + 1
   END WHILE
   
   RETURN call_js(p_func, NULL, 'JOIN', NULL)
END FUNCTION

PRIVATE FUNCTION call_js(p_func, p_context, p_action, p_param)
   DEFINE p_func STRING
   DEFINE p_context STRING
   DEFINE p_action STRING
   DEFINE p_param STRING
   DEFINE r_res STRING

   CALL ui.Interface.frontCall("webcomponent", 'call', ["formonly.web", p_func, p_context, p_action, p_param], [r_res])

   RETURN r_res
END FUNCTION
