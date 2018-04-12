IMPORT util
GLOBALS "../../api/api.inc"
GLOBALS "../../wonderful/app.inc"

SCHEMA ds

##配置Wifi Printer地址
#输入:[]
#输出:[]
FUNCTION WiFiPrinter(p_jsonarr)
DEFINE p_jsonarr util.JSONArray


    DEFINE l_jsonobj util.JSONObject
    DEFINE l_jsonobj2 util.JSONObject
    
    DEFINE l_jsonarr util.JSONArray
    DEFINE data, extras STRING

    LET l_jsonarr= util.JSONArray.create()

    LET l_jsonobj = util.JSONObject.create()

    LET l_jsonobj2=util.JSONObject.create()

    
    
    TRY

          LET l_jsonobj = p_jsonarr.get(1)

          #MESSAGE l_jsonobj.toString()
     
          CALL ui.Interface.frontCall("android", "startActivityForResult",
                 ["android.intent.action.VIEW", NULL, NULL, NULL,
                  "com.digiwin.hPrinter.IpEditActivity",l_jsonobj.toString()],
                 [ data, extras ])
                 #MESSAGE "data=",data," / extras=",extras
                

                IF NOT cl_null(extras) THEN
                  LET g_status.code=TRUE
                  LET g_status.message="配置成功"

                 LET l_jsonobj2=util.JSONObject.parse(extras)
                  
                ELSE
                  LET g_status.code=FALSE
                  LET g_status.message= "配置失败"
                END IF
      
    CATCH

    
        LET g_status.code=FALSE
    
         LET g_status.message= "配置失败",STATUS, ":", err_get(STATUS)

         
       RETURN l_jsonarr.toString()
    END TRY  

    CALL l_jsonarr.put(1,l_jsonobj2)

    RETURN l_jsonarr.toString()

END FUNCTION

##发送打印内容
#输入:[]
#输出:[]
FUNCTION sendMessage(p_jsonarr)
DEFINE p_jsonarr util.JSONArray

    DEFINE l_jsonarr util.JSONArray


    DEFINE l_str String

    LET l_jsonarr= util.JSONArray.create()


    LET l_str = ""
    
    TRY

               LET l_str = p_jsonarr.get(1)
         
                CALL ui.Interface.frontCall("com.digiwin.hPrinter","sendMessage",[l_str],[res])
                DISPLAY "res:",res

                IF NOT cl_null(res) AND res !=0 THEN
                  LET g_status.code=TRUE
                  LET g_status.message="数据发送成功"
                ELSE
                  LET g_status.code=FALSE
                  LET g_status.message= "数据发送失败"
                END IF
      
    CATCH

    
        LET g_status.code=FALSE
    
         LET g_status.message= "数据发送失败",STATUS, " ", err_get(STATUS)

       RETURN l_jsonarr.toString()
    END TRY  

  
    
     CALL l_jsonarr.put(1,res)

    RETURN l_jsonarr.toString()

END FUNCTION


##连接WiFiPrinter
#输入:[]
#输出:[]
FUNCTION OpenConnection(p_jsonarr)
DEFINE p_jsonarr util.JSONArray


    DEFINE l_jsonobj util.JSONObject
    
    DEFINE l_jsonobj_output util.JSONObject
    
    DEFINE l_jsonarr util.JSONArray

    LET l_jsonarr= util.JSONArray.create()

    LET l_jsonobj = util.JSONObject.create()

    LET l_jsonobj_output=util.JSONObject.create()

    
    
    TRY

        LET l_jsonobj = p_jsonarr.get(1)

        
                CALL ui.Interface.frontCall("com.digiwin.hPrinter","OpenConnection",[l_jsonobj.toString()],[res])
                DISPLAY "res:",res

                IF NOT cl_null(res) THEN
                  LET g_status.code=TRUE
                  LET g_status.message="开始连接"
                ELSE
                  LET g_status.code=FALSE
                  LET g_status.message= "连接失败"
                END IF
      
    CATCH

    
        LET g_status.code=FALSE
    
         LET g_status.message= "连接失败",STATUS, " ", err_get(STATUS)

         
       RETURN l_jsonarr.toString()
    END TRY  


    RETURN l_jsonarr.toString()

END FUNCTION


