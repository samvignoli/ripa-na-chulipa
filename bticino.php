<?php
//$str="*1*0*11#4#02##";

//print_r($matches);
//"*1*0*11##"




/* manda um comando para o MH200N */
function bticino_push($comando)
{
$fp = @fsockopen('10.0.1.222', 20000, $errno, $errstr, 1);
	 fwrite($fp, $comando."\r\n" );
	 $retorno=stream_get_contents($fp);
fclose($fp);

if($retorno=="*#*1##*#*1##")
	$retorno=true;

return $retorno;
}


$teste= bticino_push('*1*0*64#4#01##');
if($teste===true)
echo "true";
exit;

$lampadas=str_replace("##", "##\n", bticino_push("*#1*0##"));
$lampadas=explode("\n", $lampadas);
//print_r($lampadas);
for($i=0;$i<count($lampadas);$i++)
{
	$matches=array();
	if(
	(preg_match('/\*1\*(\d+)\*(\d+)#4#(\d+)##/', $lampadas[$i], $matches) && $matches[1] > "0" && $matches[1]!=19) ||
	(preg_match('/\*1\*(\d+)\*(\d+)##/', $lampadas[$i], $matches) && $matches[1] > "0" && $matches[1]!=19)
	)
	{
		echo "Ponto $matches[2]".(isset($matches[3])?", Riser $matches[3]":"")." em estado $matches[1]: $matches[0]<br/>";
		bticino_push("*1*0*$matches[2]".(isset($matches[3])?"#4#$matches[3]":"")."##");
	}
	
}

/*$fp = @fsockopen('10.0.1.222', 20000, $errno, $errstr, 1);
if(isset($_GET['acende'])||1==1){
for($i=1;$i<100;$i++)
	{
	$fp = @fsockopen('10.0.1.222', 20000, $errno, $errstr, 1);
	 fwrite($fp, "*1*0*".$i."##\r\n" );
	 sleep(1);
	echo $i."\n";
}
}
else {
for($i=1;$i<100;$i++)
 fwrite($fp, "*1*0*".$i."##\r\n" );
 sleep(1);
}
*/
?>
