<?php 
$json_string = json_encode($_POST);
$fp = fopen('data.json','w');
fwrite($fp,$json_string);
fclose($fp);
?>
