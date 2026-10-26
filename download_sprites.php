<?php
$dexes = [311, 312];
$anims = ['Attack', 'Charge', 'Faint', 'Hurt', 'Idle', 'Shoot', 'Walk'];
foreach ($dexes as $dex) {
  $dir = 'assets/pokemon/' . $dex;
  if (!is_dir($dir)) mkdir($dir, 0755, true);
  foreach ($anims as $anim) {
    $url = 'https://raw.githubusercontent.com/JPTER78/pokesurvivor/main/assets/pokemon/' . $dex . '/' . $anim . '.png';
    $dest = $dir . '/' . $anim . '.png';
    $data = @file_get_contents($url);
    if ($data !== false) {
      file_put_contents($dest, $data);
      echo "OK: $dest\n";
    } else {
      echo "FAIL: $url\n";
    }
  }
}
