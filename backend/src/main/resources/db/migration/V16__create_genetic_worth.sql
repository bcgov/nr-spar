create table spar.genetic_worth (
  genetic_worth_code  varchar(3) not null,
  genetic_worth_name  varchar(30) not null,
  constraint genetic_worth_pk
    primary key(genetic_worth_code));

insert into spar.genetic_worth (genetic_worth_code, genetic_worth_name)
  values ('gvo', 'gvo'),
    ('wwd', 'wwd');
