IMPORT util
IMPORT os

#引用全局变量
GLOBALS "../../api/api.inc"
GLOBALS "../app.inc"

MAIN
   DEFINE msg STRING
   DEFINE data, extras STRING
   DEFINE path STRING 
   WHENEVER ERROR CONTINUE
   TRY   
      CALL main_install("ds")
      CONNECT TO "ds"
      CALL ui.Interface.loadStyles("simplestyles")
      CALL ui.Interface.loadActionDefaults("simpleactions")

      DISPLAY ui.Interface.getFrontEndName()      
      IF ui.Interface.getFrontEndName() == "GMI" AND base.Application.isMobile() THEN
         MESSAGE 'ios'  #ios系统
      ELSE
         TRY
            CALL ui.Interface.frontCall(
            "android", "askForPermission", 
            ["android.permission.WRITE_EXTERNAL_STORAGE"],
            [result] )

            CASE result
               WHEN "ok"
                  #CALL os.Path.mkDir("/sdcard/myfiles")
               WHEN "rejected"
                  ERROR "SDCARD access was denied by user"
            END CASE
         CATCH
            ERROR "SDCARD access was denied by user"
         END TRY
         CALL autoUpdate()
      END IF

      OPEN WINDOW w_main WITH FORM "main"
         INPUT BY NAME web WITHOUT DEFAULTS ATTRIBUTES(UNBUFFERED)
         BEFORE INPUT
            CALL Dialog.setActionHidden("cancel", 1)
            CALL Dialog.setActionHidden("accept", 1)
            CALL Dialog.setActionHidden("exit", 1)
            CALL Dialog.setActionHidden("controller",1)
            CALL ui.Interface.frontCall("standard", "setWebComponentPath",[path], [])
            #控制器
            ON ACTION controller
               TRY 
                  IF NOT  controller() THEN
                     CONTINUE INPUT
                  END IF
               CATCH
                  DISPLAY "发生错误：控制器发生异常"
                  ERROR "控制器发生异常"
                  EXIT INPUT
               END TRY
            #回退
            ON ACTION CANCEL
               CALL calcel() 
            #退出
            ON ACTION EXIT
               CALL exit()
               EXIT INPUT
         AFTER FIELD web
            DISPLAY "after web field!"
         AFTER INPUT
            CALL afterinput()
            CONTINUE INPUT
         END INPUT
         WHILE fgl_eventLoop()
         END WHILE
      CLOSE WINDOW w_main
      DISCONNECT "ds"
   CATCH
      DISPLAY "发生错语：APP发生未捕获异常 ",STATUS, " ", err_get(STATUS)
      ERROR "APP发生未捕获异常" ,STATUS, " ", err_get(STATUS)
      DISCONNECT "ds"
   END TRY
END MAIN