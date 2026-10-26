<?php
foreach([311,312] as $d){
  foreach(['Idle','Walk','Attack','Shoot','Charge','Hurt','Faint'] as $a){
    $i = getimagesize('assets/pokemon/'.$d.'/'.$a.'.png');
    echo $d.'/'.$a.': '.$i[0].'x'.$i[1].PHP_EOL;
  }
}
