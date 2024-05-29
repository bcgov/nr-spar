WITH CTE_SPAR AS (
	SELECT 
		GENETIC_CLASS_CODE, 
		DESCRIPTION,
		TO_CHAR(EFFECTIVE_DATE,'YYYY-MM-DD HH24:MI:SS') EFFECTIVE_DATE,
		TO_CHAR(EXPIRY_DATE,'YYYY-MM-DD HH24:MI:SS') EXPIRY_DATE,
		TO_CHAR(UPDATE_TIMESTAMP,'YYYY-MM-DD HH24:MI:SS') UPDATE_TIMESTAMP
	FROM 
		GENETIC_CLASS_CODE 
)
SELECT genetic_class_code, 
	   description,  
	   effective_date,  
	   expiry_date,
	   update_timestamp
FROM CTE_SPAR
ORDER BY 1

