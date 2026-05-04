-- ENG/SPRR048: backfill seedlot.elevation / latitude_* / longitude_* mean columns.
--
-- Historical rows saved via SPAR were left with NULL representative (mean) elevation,
-- latitude and longitude because STEP 5 of the "Calculating Area of Use Geography"
-- spec was missing from the backend. SPRR048 (Short Form Report) reads these mean
-- columns and silently excluded affected seedlots (e.g. 64220).
--
-- Rule (per the Forestry Confluence spec, mirrored in the new Java helper
-- SeedlotMeanGeoCalculator): when min == max the mean = max; otherwise mean falls
-- back to the corresponding collection mean.

update spar.seedlot
   set elevation = case
                     when elevation_min is not distinct from elevation_max then elevation_max
                     else collection_elevation
                   end
 where elevation is null
   and (elevation_min is not null
        or elevation_max is not null
        or collection_elevation is not null);

update spar.seedlot
   set latitude_degrees = case when lat_components_match then latitude_deg_max
                               else collection_latitude_deg end,
       latitude_minutes = case when lat_components_match then latitude_min_max
                               else collection_latitude_min end,
       latitude_seconds = case when lat_components_match then latitude_sec_max
                               else collection_latitude_sec end
  from (
    select seedlot_number,
           (latitude_deg_min is not distinct from latitude_deg_max
              and latitude_min_min is not distinct from latitude_min_max
              and latitude_sec_min is not distinct from latitude_sec_max) as lat_components_match
      from spar.seedlot
  ) src
 where spar.seedlot.seedlot_number = src.seedlot_number
   and (spar.seedlot.latitude_degrees is null
        or spar.seedlot.latitude_minutes is null
        or spar.seedlot.latitude_seconds is null)
   and (spar.seedlot.latitude_deg_min is not null
        or spar.seedlot.latitude_deg_max is not null
        or spar.seedlot.collection_latitude_deg is not null);

update spar.seedlot
   set longitude_degrees = case when long_components_match then longitude_deg_max
                                else collection_longitude_deg end,
       longitude_minutes = case when long_components_match then longitude_min_max
                                else collection_longitude_min end,
       longitude_seconds = case when long_components_match then longitude_sec_max
                                else collection_longitude_sec end
  from (
    select seedlot_number,
           (longitude_deg_min is not distinct from longitude_deg_max
              and longitude_min_min is not distinct from longitude_min_max
              and longitude_sec_min is not distinct from longitude_sec_max) as long_components_match
      from spar.seedlot
  ) src
 where spar.seedlot.seedlot_number = src.seedlot_number
   and (spar.seedlot.longitude_degrees is null
        or spar.seedlot.longitude_minutes is null
        or spar.seedlot.longitude_seconds is null)
   and (spar.seedlot.longitude_deg_min is not null
        or spar.seedlot.longitude_deg_max is not null
        or spar.seedlot.collection_longitude_deg is not null);
