-- Geographic data columns
alter table spar.seedlot
  add column seed_plan_unit_id         smallint,
  add column bgc_zone_code             varchar(4),
  add column bgc_subzone_code          varchar(3),
  add column variant                   varchar(1),
  add column bec_version_id            smallint,
  add column elevation                 smallint,
  add column latitude_degrees          smallint,
  add column latitude_minutes          smallint,
  add column latitude_seconds          smallint,
  add column longitude_degrees         smallint,
  add column longitude_minutes         smallint,
  add column longitude_seconds         smallint,
  add column collection_elevation      smallint,
  add column collection_elevation_min  smallint,
  add column collection_elevation_max  smallint,
  add column collection_latitude_deg   smallint,
  add column collection_latitude_min   smallint,
  add column collection_latitude_sec   smallint,
  add column collection_latitude_code  varchar(1),
  add column collection_longitude_deg  smallint,
  add column collection_longitude_min  smallint,
  add column collection_longitude_sec  smallint,
  add column collection_longitude_code varchar(1),
  add column elevation_min             smallint,
  add column elevation_max             smallint,
  add column latitude_deg_min          smallint,
  add column latitude_min_min          smallint,
  add column latitude_sec_min          smallint,
  add column latitude_deg_max          smallint,
  add column latitude_min_max          smallint,
  add column latitude_sec_max          smallint,
  add column longitude_deg_min         smallint,
  add column longitude_min_min         smallint,
  add column longitude_sec_min         smallint,
  add column longitude_deg_max         smallint,
  add column longitude_min_max         smallint,
  add column longitude_sec_max         smallint,
  add column smp_mean_bv_growth        decimal(4, 1),
  add column area_of_use_comment       varchar(2000);

comment on column spar.seedlot.seed_plan_unit_id is 'A unique identifier which is assigned to a Seed Planning Unit.';
comment on column spar.seedlot.bgc_zone_code is 'The Biogeoclimatic Zone of the Seedlot collection area.';
comment on column spar.seedlot.bgc_subzone_code is 'The Biogeoclimatic Subzone of the Seedlot collection area.';
comment on column spar.seedlot.variant is 'A division of biogeoclimatic information, with multiple variants in a BGC Subzone.';
comment on column spar.seedlot.bec_version_id is 'A sequence generated identifier for each BEC version.';
comment on column spar.seedlot.elevation is 'The representative elevation in meters where the seed lot originated, which is also the mean area of use elevation for natural stand lots. For orchard seed lots it is a weighted average of the contributing parent trees source elevations.';
comment on column spar.seedlot.latitude_degrees is 'The representative latitude (degrees) where the seed lot originated, which is also the mean area of use latitude for natural stand lots. For orchard seed lots it is a weighted average of the contributing parent trees source latitudes.';
comment on column spar.seedlot.latitude_minutes is 'The representative latitude (minutes) where the seed lot originated, which is also the mean area of use latitude for natural stand lots. For orchard seed lots it is a weighted average of the contributing parent trees source latitudes.';
comment on column spar.seedlot.latitude_seconds is 'The representative latitude (seconds) where the seed lot originated, which is also the mean area of use latitude for natural stand lots. For orchard seed lots it is a weighted average of the contributing parent trees source latitudes.';
comment on column spar.seedlot.longitude_degrees is 'The representative longitude (degrees) where the seed lot originated, which is also the mean area of use longitude for natural stand lots. For orchard seed lots it is a weighted average of the contributing parent trees source longitudes.';
comment on column spar.seedlot.longitude_minutes is 'The representative longitude (minutes) where the seed lot originated, which is also the mean area of use longitude for natural stand lots. For orchard seed lots it is a weighted average of the contributing parent trees source longitudes.';
comment on column spar.seedlot.longitude_seconds is 'The representative longitude (seconds) where the seed lot originated, which is also the mean area of use longitude for natural stand lots. For orchard seed lots it is a weighted average of the contributing parent trees source longitudes.';
comment on column spar.seedlot.collection_elevation is 'The representative elevation in meters of the Seedlot collection area. For orchard seedlots it is a weighted average of the contributing parent trees source elevations.';
comment on column spar.seedlot.collection_elevation_min is 'The representative minimum elevation in meters of the Seedlot collection area. For orchard seedlots it is a weighted average of the contributing parent trees source elevations.';
comment on column spar.seedlot.collection_elevation_max is 'The representative maximum elevation in meters of the Seedlot collection area. For orchard seedlots it is a weighted average of the contributing parent trees source elevations.';
comment on column spar.seedlot.collection_latitude_deg is 'The representative latitude (degrees) of the Seedlot collection area. For orchard seedlots it is a weighted average of the contributing parent trees source latitude.';
comment on column spar.seedlot.collection_latitude_min is 'The representative latitude (minutes) of the Seedlot collection area. For orchard seedlots it is a weighted average of the contributing parent trees source latitude.';
comment on column spar.seedlot.collection_latitude_sec is 'The representative latitude (seconds) of the Seedlot collection area. For orchard seedlots it is a weighted average of the contributing parent trees source latitude.';
comment on column spar.seedlot.collection_latitude_code is 'A code which specifies whether the exotic origin latitude is north (N) or south (S).';
comment on column spar.seedlot.collection_longitude_deg is 'The representative longitude (degrees) of the Seedlot collection area. For orchard seedlots it is a weighted average of the contributing parent trees source longitude.';
comment on column spar.seedlot.collection_longitude_min is 'The representative longitude (minutes) of the Seedlot collection area. For orchard seedlots it is a weighted average of the contributing parent trees source longitude.';
comment on column spar.seedlot.collection_longitude_sec is 'The representative longitude (seconds) of the Seedlot collection area. For orchard seedlots it is a weighted average of the contributing parent trees source longitude.';
comment on column spar.seedlot.collection_longitude_code is 'A code which specifies whether the exotic origin longitude is east (E) or west (W).';
comment on column spar.seedlot.elevation_min is 'The minimum elevation of the seedlot area of use. For lots from natural stands, this is calculated using the transfer limits. For lots from tested parent trees (orchards) either use Seed Planning Unit minimum or the collection latitude.';
comment on column spar.seedlot.elevation_max is 'The maximum elevation of the seedlot area of use. For lots from natural stands, this is calculated using the transfer limits. For lots from tested parent trees (orchards) either use Seed Planning Unit minimum or the collection latitude.';
comment on column spar.seedlot.latitude_deg_min is 'The minimum latitude (degrees) of the seedlot area of use. For lots from natural stands, this is calculated using the transfer limits. For lots from tested parent trees (orchards) either use Seed Planning Unit minimum or the collection latitude.';
comment on column spar.seedlot.latitude_min_min is 'The minimum latitude (minutes) of the seedlot area of use. For lots from natural stands, this is calculated using the transfer limits. For lots from tested parent trees (orchards) either use Seed Planning Unit minimum or the collection latitude.';
comment on column spar.seedlot.latitude_sec_min is 'The minimum latitude (seconds) of the seedlot area of use. For lots from natural stands, this is calculated using the transfer limits. For lots from tested parent trees (orchards) either use Seed Planning Unit minimum or the collection latitude.';
comment on column spar.seedlot.latitude_deg_max is 'The maximum latitude (degrees) of the seedlot area of use. For lots from natural stands, this is calculated using the transfer limits. For lots from tested parent trees (orchards) either use Seed Planning Unit minimum or the collection latitude.';
comment on column spar.seedlot.latitude_min_max is 'The maximum latitude (minutes) of the seedlot area of use. For lots from natural stands, this is calculated using the transfer limits. For lots from tested parent trees (orchards) either use Seed Planning Unit minimum or the collection latitude.';
comment on column spar.seedlot.latitude_sec_max is 'The maximum latitude (seconds) of the seedlot area of use. For lots from natural stands, this is calculated using the transfer limits. For lots from tested parent trees (orchards) either use Seed Planning Unit minimum or the collection latitude.';
comment on column spar.seedlot.longitude_deg_min is 'The minimum longitude (degrees) of the seedlot area of use. For lots from natural stands, this is calculated using the transfer limits. For lots from tested parent trees (orchards) either use Seed Planning Unit minimum or the collection latitude.';
comment on column spar.seedlot.longitude_min_min is 'The minimum longitude (minutes) of the seedlot area of use. For lots from natural stands, this is calculated using the transfer limits. For lots from tested parent trees (orchards) either use Seed Planning Unit minimum or the collection latitude.';
comment on column spar.seedlot.longitude_sec_min is 'The minimum longitude (seconds) of the seedlot area of use. For lots from natural stands, this is calculated using the transfer limits. For lots from tested parent trees (orchards) either use Seed Planning Unit minimum or the collection latitude.';
comment on column spar.seedlot.longitude_deg_max is 'The maximum longitude (degrees) of the seedlot area of use. For lots from natural stands, this is calculated using the transfer limits. For lots from tested parent trees (orchards) either use Seed Planning Unit minimum or the collection latitude.';
comment on column spar.seedlot.longitude_min_max is 'The maximum longitude (minutes) of the seedlot area of use. For lots from natural stands, this is calculated using the transfer limits. For lots from tested parent trees (orchards) either use Seed Planning Unit minimum or the collection latitude.';
comment on column spar.seedlot.longitude_sec_max is 'The maximum longitude (seconds) of the seedlot area of use. For lots from natural stands, this is calculated using the transfer limits. For lots from tested parent trees (orchards) either use Seed Planning Unit minimum or the collection latitude.';
comment on column spar.seedlot.smp_mean_bv_growth is 'The breeding value for the Growth trait calculated from the supplemental mass pollination mix applied to parent trees.';
comment on column spar.seedlot.area_of_use_comment is 'Comments on Seedlot area of use.';

create table spar.seedlot_seed_plan_zone (
  seedlot_number      varchar(5) not null, 
  seed_plan_zone_code varchar(3) not null, 
  entry_userid        varchar(30) not null, 
  entry_timestamp     timestamp not null,
  update_userid       varchar(30) not null,
  update_timestamp    timestamp not null,
  revision_count      int not null,
  constraint seedlot_seed_plan_zone_pk 
    primary key(seedlot_number, seed_plan_zone_code),
  constraint seedlot_seedplan_zn_seedlot_fk
    foreign key(seedlot_number) references spar.seedlot(seedlot_number)
);

comment on column spar.seedlot_seed_plan_zone.seedlot_number is 'The unique number (key) assigned to a quantity of seed of a particular species and quality from a given location collected at a given time.';
comment on column spar.seedlot_seed_plan_zone.seed_plan_zone_code is 'A code describing various Seed Planning Zones.';
comment on column spar.seedlot_seed_plan_zone.entry_userid is 'The userid of the individual that entered the Seedlot collection method.';
comment on column spar.seedlot_seed_plan_zone.entry_timestamp is 'The time and date a Seedlot collection method was entered onto the system.';
comment on column spar.seedlot_seed_plan_zone.update_userid is 'The userid of the individual that changed the Seedlot collection method.';
comment on column spar.seedlot_seed_plan_zone.update_timestamp is 'The time and date a Seedlot collection method was last updated on the system.';
comment on column spar.seedlot_seed_plan_zone.revision_count is 'A counter used to ensure data integrity. This item should be incremented during each update.';
