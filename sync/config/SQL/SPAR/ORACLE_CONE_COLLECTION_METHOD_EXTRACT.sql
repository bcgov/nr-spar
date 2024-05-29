WITH CTE_SPAR AS (
	SELECT 
		CONE_COLLECTION_METHOD_CODE, 
		DESCRIPTION,
		EFFECTIVE_DATE,
		EXPIRY_DATE,
		UPDATE_TIMESTAMP
	FROM CONE_COLLECTION_METHOD_CODE
)
SELECT cone_collection_method_code, 
	   description,  
	   effective_date,  
	   expiry_date,
	   update_timestamp
FROM CTE_SPAR
ORDER BY 1

