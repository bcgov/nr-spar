-- ENG/SPRR048: backfill seedlot.elevation / latitude_* / longitude_* mean columns.
--
-- Historical rows saved via SPAR were left with NULL representative (mean) elevation,
-- latitude and longitude because STEP 5 of the "Calculating Area of Use Geography"
-- spec was missing from the backend. SPRR048 (Short Form Report) reads these mean
-- columns and silently excluded affected seedlots (e.g. 64220).
--
-- Rule (per the Forestry Confluence spec, mirrored in the new Java helper
-- SeedlotMeanGeoCalculator): when min == max and max is populated the mean = max;
-- otherwise mean falls back to the corresponding collection mean. The lat/long
-- updates use COALESCE per column so already-populated components are preserved.
--
-- Each WHERE clause is tightened so the UPDATE only runs when the derived value
-- is actually non-NULL and would change the row, avoiding no-op writes that
-- would still trip the seedlot audit trigger.

update spar.seedlot
   set elevation = case
                     when elevation_max is not null
                          and elevation_min is not distinct from elevation_max
                       then elevation_max
                     else collection_elevation
                   end
 where elevation is null
   and ((elevation_max is not null
            and elevation_min is not distinct from elevation_max)
        or collection_elevation is not null);

update spar.seedlot
   set latitude_degrees = coalesce(latitude_degrees, src.derived_lat_deg),
       latitude_minutes = coalesce(latitude_minutes, src.derived_lat_min),
       latitude_seconds = coalesce(latitude_seconds, src.derived_lat_sec)
  from (
    select seedlot_number,
           case when lat_components_match then latitude_deg_max
                else collection_latitude_deg end as derived_lat_deg,
           case when lat_components_match then latitude_min_max
                else collection_latitude_min end as derived_lat_min,
           case when lat_components_match then latitude_sec_max
                else collection_latitude_sec end as derived_lat_sec
      from (
        select seedlot_number,
               latitude_deg_max, latitude_min_max, latitude_sec_max,
               collection_latitude_deg, collection_latitude_min, collection_latitude_sec,
               (latitude_deg_max is not null
                  and latitude_min_max is not null
                  and latitude_sec_max is not null
                  and latitude_deg_min is not distinct from latitude_deg_max
                  and latitude_min_min is not distinct from latitude_min_max
                  and latitude_sec_min is not distinct from latitude_sec_max) as lat_components_match
          from spar.seedlot
      ) base
  ) src
 where spar.seedlot.seedlot_number = src.seedlot_number
   and ((spar.seedlot.latitude_degrees is null and src.derived_lat_deg is not null)
        or (spar.seedlot.latitude_minutes is null and src.derived_lat_min is not null)
        or (spar.seedlot.latitude_seconds is null and src.derived_lat_sec is not null));

update spar.seedlot
   set longitude_degrees = coalesce(longitude_degrees, src.derived_long_deg),
       longitude_minutes = coalesce(longitude_minutes, src.derived_long_min),
       longitude_seconds = coalesce(longitude_seconds, src.derived_long_sec)
  from (
    select seedlot_number,
           case when long_components_match then longitude_deg_max
                else collection_longitude_deg end as derived_long_deg,
           case when long_components_match then longitude_min_max
                else collection_longitude_min end as derived_long_min,
           case when long_components_match then longitude_sec_max
                else collection_longitude_sec end as derived_long_sec
      from (
        select seedlot_number,
               longitude_deg_max, longitude_min_max, longitude_sec_max,
               collection_longitude_deg, collection_longitude_min, collection_longitude_sec,
               (longitude_deg_max is not null
                  and longitude_min_max is not null
                  and longitude_sec_max is not null
                  and longitude_deg_min is not distinct from longitude_deg_max
                  and longitude_min_min is not distinct from longitude_min_max
                  and longitude_sec_min is not distinct from longitude_sec_max) as long_components_match
          from spar.seedlot
      ) base
  ) src
 where spar.seedlot.seedlot_number = src.seedlot_number
   and ((spar.seedlot.longitude_degrees is null and src.derived_long_deg is not null)
        or (spar.seedlot.longitude_minutes is null and src.derived_long_min is not null)
        or (spar.seedlot.longitude_seconds is null and src.derived_long_sec is not null));
