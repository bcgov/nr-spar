-- CODE_SUBSET_TBL is read with a native query and has no JPA entity, so create it here.
-- Only the two columns the legacy SPR_GET_SPZ_TYPE function reads are needed.
CREATE TABLE IF NOT EXISTS CODE_SUBSET_TBL (
  CODE_SUBSET_NAME VARCHAR(18) NOT NULL,
  CODE_ARGUMENT    VARCHAR(50) NOT NULL
);

DELETE FROM CODE_SUBSET_TBL;

INSERT INTO CODE_SUBSET_TBL (CODE_SUBSET_NAME, CODE_ARGUMENT)
VALUES ('COASTAL_ZONE_ST', 'M'),
       ('COASTAL_ZONE_ST', 'SM'),
       ('OTHER_SUBSET_ST', 'EK');
