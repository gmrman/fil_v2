# 檢查ps_source是否為NULL
PUBLIC FUNCTION cl_null(ps_source)
DEFINE ps_source STRING
   DEFINE li_is_null BOOLEAN
   IF (ps_source IS NULL) THEN
      LET li_is_null = TRUE
   ELSE
      LET ps_source = ps_source.trim()
      IF (ps_source.getLength() = 0) THEN
         LET li_is_null = TRUE
      END IF
   END IF
   RETURN li_is_null
END FUNCTION