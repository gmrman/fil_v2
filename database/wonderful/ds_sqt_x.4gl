#+ Database creation script for SQLite
#+
#+ Note: This script is a helper script to create an empty database schema
#+       Adapt it to fit your needs

MAIN
    DATABASE ds

    CALL db_drop_tables()
    CALL db_create_tables()
    CALL db_add_indexes()
END MAIN

#+ Create all tables in database.
FUNCTION db_create_tables()
    WHENEVER ERROR STOP

    EXECUTE IMMEDIATE "CREATE TABLE app_base_bcae_t (
        bcaeent VARCHAR(10) NOT NULL,
        bcaesite VARCHAR(20) NOT NULL,
        bcae001 VARCHAR(80) NOT NULL,
        bcae002 VARCHAR(30) NOT NULL,
        bcae003 VARCHAR(40) NOT NULL,
        bcae004 VARCHAR(20),
        bcae005 INTEGER,
        bcae006 VARCHAR(10),
        bcae007 VARCHAR(20),
        bcae008 VARCHAR(10),
        bcae009 VARCHAR(40),
        bcae010 VARCHAR(4000),
        bcae011 VARCHAR(10),
        bcae012 VARCHAR(4000),
        bcae013 VARCHAR(40),
        bcae014 VARCHAR(20),
        bcae015 VARCHAR(10),
        bcae016 VARCHAR(20),
        bcae999 VARCHAR(40),
        bcaestus VARCHAR(10),
        CONSTRAINT sqlite_autoindex_app_base_bcae_t_1 PRIMARY KEY(bcaeent, bcaesite, bcae001, bcae002, bcae003))"
    EXECUTE IMMEDIATE "CREATE TABLE app_base_bcaf_t (
        bcafent VARCHAR(10) NOT NULL,
        bcafsite VARCHAR(20) NOT NULL,
        bcafname VARCHAR(255),
        bcafspec VARCHAR(255),
        bcafMunit VARCHAR(10),
        bcaf001 VARCHAR(80) NOT NULL,
        bcaf002 VARCHAR(30) NOT NULL,
        bcaf003 VARCHAR(40) NOT NULL,
        bcaf004 INTEGER NOT NULL,
        bcaf005 INTEGER,
        bcaf006 VARCHAR(255),
        bcaf007 VARCHAR(40),
        bcaf008 VARCHAR(255),
        bcaf009 VARCHAR(500),
        bcaf010 VARCHAR(10),
        bcaf011 VARCHAR(10),
        bcaf012 VARCHAR(30),
        bcaf013 VARCHAR(30),
        bcaf014 VARCHAR(30),
        bcaf015 VARCHAR(30),
        bcaf016 DECIMAL(26,10),
        bcaf017 VARCHAR(10),
        bcaf018 VARCHAR(40),
        bcaf019 VARCHAR(40),
        bcaf020 VARCHAR(20),
        bcaf021 DECIMAL(10,0),
        bcaf022 DECIMAL(10,0),
        bcaf023 DECIMAL(10,0),
        bcaf031 VARCHAR(10),
        bcaf032 DECIMAL(26,10),
        bcaf033 VARCHAR(10),
        bcaf034 DECIMAL(26,10),
        bcaf035 DECIMAL(26,10),
        bcaf036 VARCHAR(10),
        bcaf037 VARCHAR(10),
        bcaf038 VARCHAR(10),
        bcaf039 VARCHAR(10),
        bcaf040 DECIMAL(10,0),
        bcaf041 VARCHAR(10),
        bcaf042 VARCHAR(10),
        bcaf043 DECIMAL(26,10),
        bcaf044 VARCHAR(10),
        bcaf045 DECIMAL(26,10),
        bcaf046 VARCHAR(10),
        bcaf047 DECIMAL(26,10),
        bcafPcode VARCHAR(255),
        bcafPqty DECIMAL(26,10),
        CONSTRAINT sqlite_autoindex_app_base_bcaf_t_1 PRIMARY KEY(bcafent, bcaf001, bcaf002, bcaf003, bcafsite, bcaf004))"
    EXECUTE IMMEDIATE "CREATE TABLE app_base_bcmc_t (
        bcmcent VARCHAR(10) NOT NULL,
        bcmcsite VARCHAR(20) NOT NULL,
        bcmc001 VARCHAR(255) NOT NULL,
        bcmc002 VARCHAR(40) NOT NULL,
        bcmc003 VARCHAR(255) NOT NULL,
        bcmc004 VARCHAR(500),
        bcmc005 VARCHAR(10) NOT NULL,
        bcmc006 VARCHAR(10) NOT NULL,
        bcmc007 VARCHAR(30) NOT NULL,
        bcmc008 VARCHAR(30) NOT NULL,
        bcmc009 VARCHAR(30),
        bcmc010 VARCHAR(30),
        bcmc011 VARCHAR(10),
        bcmc012 DECIMAL(26,10),
        bcmc013 DECIMAL(26,10),
        bcmc014 VARCHAR(20) NOT NULL,
        bcmc015 VARCHAR(40) NOT NULL,
        bcmc016 INTEGER NOT NULL,
        bcmc017 INTEGER NOT NULL,
        bcmc018 INTEGER NOT NULL,
        bcmc019 VARCHAR(10),
        bcmc020 VARCHAR(30),
        bcmc021 VARCHAR(255),
        bcmc022 VARCHAR(255),
        bcmc023 VARCHAR(10),
        bcmc024 VARCHAR(10),
        bcmc025 DECIMAL(26,10),
        bcmc026 VARCHAR(10),
        bcmc027 VARCHAR(255),
        bcmc028 DECIMAL(26,10),
        bcmc995 VARCHAR(10) NOT NULL,
        bcmc996 VARCHAR(10) NOT NULL,
        bcmc997 VARCHAR(10) NOT NULL,
        bcmc998 DECIMAL(26,10),
        bcmc999 DATETIME YEAR TO FRACTION(5),
        CONSTRAINT sqlite_autoindex_app_base_bcmc_t_1 PRIMARY KEY(bcmcent, bcmc001, bcmc002, bcmc003, bcmc005, bcmc006, bcmc007, bcmc014, bcmc015, bcmc016, bcmc017, bcmc018, bcmc995, bcmc996, bcmc997))"
    EXECUTE IMMEDIATE "CREATE TABLE app_base_bcme_t (
        bcmeent VARCHAR(10) NOT NULL,
        bcmesite VARCHAR(20) NOT NULL,
        bcme001 VARCHAR(20) NOT NULL,
        bcme002 VARCHAR(20) NOT NULL,
        bcme003 VARCHAR(10),
        bcme004 VARCHAR(30),
        bcme005 INTEGER NOT NULL,
        bcme006 INTEGER NOT NULL,
        bcme007 INTEGER NOT NULL,
        bcme008 VARCHAR(10),
        bcme009 VARCHAR(80),
        bcme010 VARCHAR(40),
        bcme011 VARCHAR(255),
        bcme012 VARCHAR(500),
        bcme013 VARCHAR(10) NOT NULL,
        bcme014 VARCHAR(10) NOT NULL,
        bcme015 VARCHAR(30) NOT NULL,
        bcme016 VARCHAR(30),
        bcme017 DECIMAL(26,10),
        bcme018 DECIMAL(26,10),
        bcme019 VARCHAR(30),
        bcme020 VARCHAR(30),
        bcme021 VARCHAR(1),
        bcme022 VARCHAR(1),
        bcme023 VARCHAR(20),
        bcme024 INTEGER,
        bcme025 INTEGER,
        bcme026 INTEGER,
        bcme027 VARCHAR(40),
        bcme028 DECIMAL(26,10),
        bcme029 VARCHAR(255),
        bcme030 VARCHAR(10),
        bcme031 VARCHAR(10),
        bcme032 VARCHAR(10),
        bcme033 DECIMAL(26,10),
        bcme034 DECIMAL(26,10),
        bcme035 VARCHAR(10),
        bcme036 DECIMAL(26,10),
        bcme037 DECIMAL(10,0),
        bcme038 DECIMAL(26,10),
        bcme039 DECIMAL(26,10),
        bcme040 VARCHAR(20),
        bcme041 VARCHAR(10),
        bcme042 VARCHAR(10),
        bcme043 VARCHAR(255),
        bcme044 VARCHAR(255),
        bcme045 VARCHAR(10),
        bcme046 DECIMAL(26,10),
        bcme047 DECIMAL(26,10),
        bcme048 VARCHAR(10),
        bcme049 DECIMAL(20,0),
        bcme050 VARCHAR(10),
        bcme051 DECIMAL(26,10),
        bcme052 DECIMAL(20,0),
        bcme053 VARCHAR(10),
        bcme054 DECIMAL(26,10),
        bcme055 VARCHAR(10),
        bcme056 DECIMAL(26,10),
        bcme057 VARCHAR(10),
        bcme058 DECIMAL(26,10),
        bcme059 VARCHAR(10),
        bcme060 VARCHAR(10),
        bcme061 VARCHAR(1),
        bcme062 VARCHAR(1),
        bcme063 VARCHAR(40),
        bcme064 VARCHAR(255),
        bcme127 VARCHAR(256),
        bcme128 INTEGER,
        bcme999 VARCHAR(40) NOT NULL,
        bcmestus VARCHAR(10),
        CONSTRAINT sqlite_autoindex_app_base_bcme_t_1 PRIMARY KEY(bcmeent, bcmesite, bcme001, bcme002, bcme005, bcme006, bcme007, bcme013, bcme014, bcme015, bcme999))"
    EXECUTE IMMEDIATE "CREATE TABLE basicinformation (
        server_ip VARCHAR(40),
        server_area VARCHAR(10),
        server_product VARCHAR(20),
        permission_ip VARCHAR(40),
        barcode_repeat VARCHAR(1),
        barcode_separator VARCHAR(1),
        warehouse_separator VARCHAR(1),
        plant_id VARCHAR(255),
        mr_no VARCHAR(5),
        mi_no VARCHAR(5),
        reason_no VARCHAR(10),
        camera_used VARCHAR(1),
        lot_auto VARCHAR(1),
        inventory_display VARCHAR(1),
        report_ent VARCHAR(10),
        report_site VARCHAR(20),
        report_datetime DATETIME YEAR TO FRACTION(5),
        warehouse_no VARCHAR(10),
        warehouse_no_cost VARCHAR(10),
        isdisplay_no INTEGER,
        isdisplay_name INTEGER,
        isdisplay_spec INTEGER,
        font_size VARCHAR(10),
        workstation_no VARCHAR(40),
        workstation_name VARCHAR(255),
        machine_no VARCHAR(40),
        machine_name VARCHAR(255),
        shift_no VARCHAR(10),
        all_1_no VARCHAR(5),
        all_2_no VARCHAR(5),
        all_3_no VARCHAR(5),
        warehouse_way_cost VARCHAR(10),
        warehouse_way VARCHAR(10),
        condition_start_date_type INTEGER,
        condition_start_date VARCHAR(255),
        basic_data_download DECIMAL(20,0),
        inventory_operation DECIMAL(20,0),
        out_in_operation DECIMAL(20,0),
        bt_printer VARCHAR(40),
        valuation_unit VARCHAR(10))"
    EXECUTE IMMEDIATE "CREATE TABLE menuinformation (
        enterprise_no VARCHAR(10) NOT NULL,
        site_no VARCHAR(20) NOT NULL,
        account VARCHAR(20) NOT NULL,
        func VARCHAR(20) NOT NULL,
        iscommon VARCHAR(1),
        CONSTRAINT sqlite_autoindex_menuinformation_1 PRIMARY KEY(enterprise_no, site_no, account, func))"
    EXECUTE IMMEDIATE "CREATE TABLE qbecondition (
        enterprise_no VARCHAR(10) NOT NULL,
        site_no VARCHAR(20) NOT NULL,
        account VARCHAR(20) NOT NULL,
        program_job_no VARCHAR(20) NOT NULL,
        seq VARCHAR(10) NOT NULL,
        condition_value VARCHAR(255),
        isdefault BOOLEAN NOT NULL,
        set_type INTEGER,
        CONSTRAINT sqlite_autoindex_qbecondition_1 PRIMARY KEY(enterprise_no, site_no, account, program_job_no, seq))"
    EXECUTE IMMEDIATE "CREATE TABLE stockinformation (
        enterprise_no VARCHAR(10) NOT NULL,
        site_no VARCHAR(20) NOT NULL,
        warehouse_no VARCHAR(10) NOT NULL,
        warehouse_name VARCHAR(500),
        storage_spaces_no VARCHAR(10) NOT NULL,
        storage_spaces_name VARCHAR(500),
        report_datetime VARCHAR(10),
        warehouse_cost VARCHAR(1),
        storage_management VARCHAR(1),
        CONSTRAINT sqlite_autoindex_stockinformation_1 PRIMARY KEY(enterprise_no, site_no, warehouse_no, storage_spaces_no))"
    EXECUTE IMMEDIATE "CREATE TABLE userinformation (
        enterprise_no VARCHAR(10) NOT NULL,
        site_no VARCHAR(20) NOT NULL,
        account VARCHAR(20) NOT NULL,
        employee_no VARCHAR(20),
        employee_name VARCHAR(255),
        language VARCHAR(6),
        department_no VARCHAR(10),
        department_name VARCHAR(500),
        last_log_time DATETIME YEAR TO FRACTION(5),
        log_in VARCHAR(1),
        server_ip VARCHAR(40),
        server_area VARCHAR(10),
        manage_barcode_inventory VARCHAR(1),
        feature VARCHAR(1),
        CONSTRAINT sqlite_autoindex_userinformation_1 PRIMARY KEY(enterprise_no, site_no, account))"
    EXECUTE IMMEDIATE "CREATE TABLE department (
        department_no VARCHAR(40) NOT NULL,
        CONSTRAINT pk_department_1 PRIMARY KEY(department_no))"
        
    #170518 By zhen (S)
    EXECUTE IMMEDIATE "CREATE TABLE capp_receipt_kb_t (
        ent                  VARCHAR(10) NOT NULL,
        site                 VARCHAR(20) NOT NULL,
        showme               VARCHAR(20),
        CONSTRAINT pk_capp_receipt_kb_t PRIMARY KEY(ent, site))"

    EXECUTE IMMEDIATE "CREATE TABLE capp_kb_02_setting_t (
        ent                  VARCHAR(10) NOT NULL,
        site                 VARCHAR(20) NOT NULL,
        limited              VARCHAR(5),
        amount               INTEGER,
        orderBy              VARCHAR(5),
        showNumType          INTEGER,
        showNum              INTEGER,
        CONSTRAINT pk_capp_kb_02_setting_t PRIMARY KEY(ent, site))"

    EXECUTE IMMEDIATE "CREATE TABLE capp_kb_03_setting_t (
        ent                  VARCHAR(10) NOT NULL,
        site                 VARCHAR(20) NOT NULL,
        source               VARCHAR(5),
        A01                  BOOLEAN,
        A02                  BOOLEAN,
        A03                  BOOLEAN,
        A04                  BOOLEAN,
        CONSTRAINT pk_capp_kb_03_setting_t PRIMARY KEY(ent, site))"

    EXECUTE IMMEDIATE "CREATE TABLE capp_kb_03_warehouse_t (
        ent                  VARCHAR(10) NOT NULL,
        site                 VARCHAR(20) NOT NULL,
        warehouse            VARCHAR(10) NOT NULL,
        CONSTRAINT pk_capp_kb_03_warehouse_t PRIMARY KEY(ent, site, warehouse))"

    EXECUTE IMMEDIATE "CREATE TABLE capp_kb_03_single_t (
        ent                  VARCHAR(10) NOT NULL,
        site                 VARCHAR(20) NOT NULL,
        single               VARCHAR(5)  NOT NULL,
        CONSTRAINT pk_capp_kb_03_single_t PRIMARY KEY(ent, site, single))"

    EXECUTE IMMEDIATE "CREATE TABLE capp_kb_05_setting_t (
        ent                  VARCHAR(10) NOT NULL,
        site                 VARCHAR(20) NOT NULL,
        source               VARCHAR(5),
        A01                  BOOLEAN,
        A02                  BOOLEAN,
        A03                  BOOLEAN,
        A04                  BOOLEAN,
        CONSTRAINT pk_capp_kb_05_setting_t PRIMARY KEY(ent, site))"

    EXECUTE IMMEDIATE "CREATE TABLE capp_kb_05_warehouse_t (
        ent                  VARCHAR(10) NOT NULL,
        site                 VARCHAR(20) NOT NULL,
        warehouse            VARCHAR(10) NOT NULL,
        CONSTRAINT pk_capp_kb_05_warehouse_t PRIMARY KEY(ent, site, warehouse))"

    EXECUTE IMMEDIATE "CREATE TABLE capp_kb_05_single_t (
        ent                  VARCHAR(10) NOT NULL,
        site                 VARCHAR(20) NOT NULL,
        single               VARCHAR(5)  NOT NULL,
        CONSTRAINT pk_capp_kb_05_single_t PRIMARY KEY(ent, site, single))"
    #170518 By zhen (E)
END FUNCTION

#+ Drop all tables from database.
FUNCTION db_drop_tables()
    WHENEVER ERROR CONTINUE

    EXECUTE IMMEDIATE "DROP TABLE app_base_bcae_t"
    EXECUTE IMMEDIATE "DROP TABLE app_base_bcaf_t"
    EXECUTE IMMEDIATE "DROP TABLE app_base_bcmc_t"
    EXECUTE IMMEDIATE "DROP TABLE app_base_bcme_t"
    EXECUTE IMMEDIATE "DROP TABLE basicinformation"
    EXECUTE IMMEDIATE "DROP TABLE menuinformation"
    EXECUTE IMMEDIATE "DROP TABLE qbecondition"
    EXECUTE IMMEDIATE "DROP TABLE stockinformation"
    EXECUTE IMMEDIATE "DROP TABLE userinformation"
    EXECUTE IMMEDIATE "DROP TABLE department"

    #170518 By zhen (S)
    EXECUTE IMMEDIATE "DROP TABLE capp_receipt_kb_t"
    EXECUTE IMMEDIATE "DROP TABLE capp_kb_02_setting_t"
    EXECUTE IMMEDIATE "DROP TABLE capp_kb_03_setting_t"
    EXECUTE IMMEDIATE "DROP TABLE capp_kb_03_warehouse_t"
    EXECUTE IMMEDIATE "DROP TABLE capp_kb_03_single_t"
    
    EXECUTE IMMEDIATE "DROP TABLE capp_kb_05_setting_t"
    EXECUTE IMMEDIATE "DROP TABLE capp_kb_05_warehouse_t"
    EXECUTE IMMEDIATE "DROP TABLE capp_kb_05_single_t"
    #170518 By zhen (E)
END FUNCTION

#+ Add indexes for all tables.
FUNCTION db_add_indexes()
    WHENEVER ERROR STOP

    EXECUTE IMMEDIATE "CREATE INDEX idx_app_base_bcmc_t_1 ON app_base_bcmc_t(bcmcent, bcmc001, bcmc002, bcmc003, bcmc014, bcmc015, bcmc016, bcmc017, bcmc018)"

END FUNCTION


