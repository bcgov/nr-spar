CREATE SCHEMA IF NOT EXISTS CONSEP;

CREATE TABLE CONSEP.CNS_T_TSC_TEST_RESULT (
    RIA_SKEY DECIMAL(10, 0) PRIMARY KEY,
    ACTIVITY_TYPE_CD VARCHAR(3),
    STANDARD_TEST_IND INT,
    TEST_CATEGORY_CD VARCHAR(3),
    ACCEPT_RESULT_IND INT,
    TEST_COMPLETE_IND INT,
    ORIGINAL_TEST_IND INT,
    CURRENT_TEST_IND INT,
    TEST_RANK VARCHAR(1),
    SAMPLE_DESC VARCHAR(30),
    MOISTURE_STATUS_CD VARCHAR(3),
    GERMINATION_PCT INT,
    MOISTURE_PCT DECIMAL(4, 1),
    GERMINATION_VALUE INT,
    PEAK_VALUE_GRM_PCT INT,
    PEAK_VALUE_NO_DAYS INT,
    WEIGHT_PER_100 DECIMAL(7, 3),
    SEEDS_PER_GRAM INT,
    PURITY_PCT DECIMAL(4, 1),
    OTHER_TEST_RESULT DECIMAL(8, 3),
    UPDATE_TIMESTAMP DATE,
    STRAT_START_DT DATE,
    GERM_CNT_START_DT DATE,
    GERM_NEXT_STAGE_DT DATE,
    SEED_WITHDRAWAL_DATE DATE,
    WARM_STRAT_START_DATE DATE,
    DRYBACK_START_DATE DATE,
    GERMINATOR_ENTRY DATE,
    GERMINATOR_ID VARCHAR(1),
    GERMINATOR_TRAY_ID INT,
    LABEL_IND INT,
    RE_SAMPLE_IND INT
);