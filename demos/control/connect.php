<?php 
$link = mysql_connect('localhost', 'voxdb', 'Ajwn1*2n432');
if (!$link) {
    die('Could not connect: ' . mysql_error());
}

if (mysql_query("CREATE DATABASE vxl_shared_db",$link))
  {
  echo "Database created";
  }
else
  {
  echo "Error creating database: " . mysql_error();
  }
mysql_close($link);
?>