<?php
//Полученный токен
define('TOKEN', "");
//User-Agent приложения
define('USER_AGENT', "");
$ch = curl_init();

curl_setopt(
  $ch, 
  CURLOPT_URL, 
  "https://api.vk.com/method/audio.getById?access_token=".TOKEN.
  "&audios=".urlencode("23313092_456239135,-41489995_202246189").
  "&v=5.64"
);
curl_setopt($ch,CURLOPT_HTTPHEADER, array('User-Agent: '.USER_AGENT));
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

file_put_contents("ids.txt", curl_exec($ch));
?>
