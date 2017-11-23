<?php

//Your user id
define('VK_ID', intval($argv[1]));

function decode($str){
  $vals = explode("#", explode("?extra=", $str)[1]);
  $tstr = vk_o($vals[0]);
  $ops = vk_o($vals[1]);
  $ops_arr = explode(chr(9), $ops);
  $len = sizeof($ops_arr);
  for($i = $len - 1; $i >= 0; $i--){
    $args_arr = explode(chr(11), $ops_arr[$i]);
    $op_ind = array_shift($args_arr);
    switch($op_ind){
      case "v": $tstr = vk_v($tstr); break;
      case "r": $tstr = vk_r($tstr, $args_arr[0]); break;
      case "x": $tstr = vk_x($tstr, $args_arr[0]); break;
      case "s": $tstr = vk_s($tstr, $args_arr[0]); break;
      case "i": $tstr = vk_i($tstr, $args_arr[0]); break;
    }
  }
  return $tstr;
}

$vk_str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN0PQRSTUVWXYZO123456789+/=";

function vk_o($str){
  global $vk_str;
  $len = strlen($str);
  $result = "";
  for($s = 0, $index2 = 0; $s < $len; $s++){
    $sym_index = strpos($vk_str, $str[$s]);
    if($sym_index !== false){
      $i = (($index2 % 4) !== 0) ? ( ($i<<6) + $sym_index) : $sym_index;
      if(($index2%4) != 0){
        $index2++;
        $shift = -2 * $index2 & 6;
        $result .= chr(0xFF & ($i >> $shift));
      } else {
        $index2++;
      }
    }
  }
  return $result;
}

function vk_s($str, $start){
  $len = strlen($str);
  if($len > 0){
    $cur = abs($start);
    $shuffle_pos = array();
    for($i = $len - 1; $i >= 0; $i--){
      $cur = (($len * ($i + 1)) ^ $cur + $i) % $len;
      $shuffle_pos[$i] = $cur;
    }
    for($i = 1; $i < $len; $i++){
      $offset = $shuffle_pos[$len - $i - 1];
      $prev = $str[$i];
      $str[$i] = $str[$offset];
      $str[$offset] = $prev;
    }
  }
  return $str;
}

function vk_i($str, $i){
  return vk_s($str, $i ^ VK_ID);
}

function vk_v($str){
  return strrev($str);
}

function vk_r($str, $i){
  global $vk_str;
  $vk_str2 = $vk_str . $vk_str;
  $vk_str2_len = strlen($vk_str2);
  $len = strlen($str);
  $result = "";
  for($s = 0; $s < $len; $s++){
    $index = strpos($vk_str2, $str[$s]);
    if($index !== false){
      $offset = ($index - $i);
      if($offset < 0){
        $offset += $vk_str2_len;
      }
      $result .= $vk_str2[$offset];
    } else {
      $result .= $str[$s];
    }
  }
  return $result;
}

function vk_x($str, $i){
  $xor_val = ord($i[0]);
  $str_len = strlen($str);
  $result = "";
  for($i = 0; $i < $str_len; $i++){
    $result .= chr(ord($str[$i]) ^ $xor_val);
  }
  return $result;
}

echo decode($argv[2]);
?>
