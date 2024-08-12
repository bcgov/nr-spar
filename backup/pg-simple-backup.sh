#!/bin/bash
# -*- coding: utf-8 -*-

##
# DB access
##
DB_USER="nr-spar"
DB_NAME="nr-spar"
DB_PORT="15432"
echo "User=$DB_USER"
echo "DB=$DB_NAME"
echo "Port=$DB_PORT"

##
# File name
##
FILENAME_PREFIX="spar_pg_bkp"

# %F -> 2024-08-12
# %T -> 16:44:58
# Here for more: https://www.man7.org/linux/man-pages/man1/date.1.html
FILENAME_SUFIX=$(date +"%F_%T")
FILENAME=$FILENAME_PREFIX"_"$FILENAME_SUFIX
echo "Filename=$FILENAME"

# -F specifies that the output should be in tar format
PG_DUMP="pg_dump"
COMM="$PG_DUMP -U \"$DB_USER\" -W -F t \"$DB_NAME\" > /mnt/bkp/$FILENAME.tar"
echo "Command=$COMM"

pg_dump -h localhost -p $DB_PORT -U "$DB_USER" -W -F t "$DB_NAME" > /mnt/bkp/$FILENAME.tar