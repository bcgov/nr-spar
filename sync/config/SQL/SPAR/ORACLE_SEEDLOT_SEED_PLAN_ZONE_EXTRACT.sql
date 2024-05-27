WITH CTE_SPAR AS (
	SELECT S.SEEDLOT_NUMBER,
		   S.SEED_PLAN_ZONE_CODE,
		   S.REVISION_COUNT,
		   S.PRIMARY_IND,
		   S.ENTRY_USERID,
		   TO_CHAR(s.ENTRY_TIMESTAMP,'YYYY-MM-DD HH24:MI:SS') ENTRY_TIMESTAMP,
		   SPZ.SEED_PLAN_ZONE_ID,
		   SPZ.GENETIC_CLASS_CODE,
		   C.DESCRIPTION as SEED_PLAN_ZONE_DESCRIPTION
	FROM SEEDLOT_PLAN_ZONE S,
		 SEED_PLAN_ZONE SPZ,
		 SEED_PLAN_ZONE_CODE C
	WHERE S.SEED_PLAN_ZONE_CODE = SPZ.SEED_PLAN_ZONE_CODE
	  AND S.SEED_PLAN_ZONE_CODE = C.SEED_PLAN_ZONE_CODE
	  AND SPZ.GENETIC_CLASS_CODE = 'A'
)
SELECT seedlot_number, 
	   seed_plan_zone_code,    
	   seed_plan_zone_id,    
	   genetic_class_code,    
	   seed_plan_zone_description,    
	   primary_ind,  
	   revision_count,
	   entry_userid, 				 -- NOT NULL IN DOWNSTREAM
	   entry_userid as update_userid, -- NOT NULL IN DOWNSTREAM
	   entry_timestamp
FROM CTE_SPAR
--WHERE  ROWNUM < 11
ORDER BY seedlot_number




