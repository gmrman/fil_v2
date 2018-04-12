IMPORT os

PUBLIC FUNCTION main_install(p_dbName)
   DEFINE p_dbName         STRING
   DEFINE src              STRING
   DEFINE dest             STRING
   DEFINE dbFilename       STRING
   DEFINE dbDestFilename   STRING
   DEFINE ret              BOOLEAN
   DEFINE resEntry         STRING

   --Copy read-only database file (nothing to do for GMa)
   IF ui.Interface.getFrontEndName() == "GMI" AND base.Application.isMobile() THEN
      LET resEntry = "dbi.database.", p_dbName, ".source"
      LET dbFilename = base.Application.getResourceEntry(resEntry)
      IF dbFilename IS NULL THEN
         LET dbFilename = p_dbName, ".db"
         LET dbDestFilename = p_dbName
      ELSE
         LET dbDestFilename = dbFilename
      END IF
      LET dest = os.Path.fullPath(os.Path.join(os.Path.pwd(), dbDestFilename))
      IF NOT os.Path.exists(dest) THEN
         --Copy to writable directory
         LET src = os.Path.fullPath(os.Path.join(base.Application.getProgramDir(), dbFilename))
         CALL os.Path.copy(src, dest) RETURNING ret
     END IF
   END IF
END FUNCTION