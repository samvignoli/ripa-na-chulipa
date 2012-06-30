<?php
// Bticino myhome PHP controller
// Samuel Vignoli, 2012



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



$lampadas=str_replace("##", "##\n", bticino_push("*#1*0##")); // puxa o estado de todas as lâmpadas da casa
$lampadas=explode("\n", $lampadas); // transforma cada retorno em uma posição do vetor $lampadas
//print_r($lampadas);
for($i=0;$i<count($lampadas);$i++)
{
	$matches=array();
	if(
	(preg_match('/\*1\*(\d+)\*(\d+)#4#(\d+)##/', $lampadas[$i], $matches) && $matches[1] > "0" && $matches[1]!=19) || //checa as lâmpadas dos Local Buses (Garagem, Jardins e Quartos)
	(preg_match('/\*1\*(\d+)\*(\d+)##/', $lampadas[$i], $matches) && $matches[1] > "0" && $matches[1]!=19) //checa as lâmpadas do Private Raiser (Térreo)
	)
	{
		echo "Ponto $matches[2]".(isset($matches[3])?", Riser $matches[3]":"")." em estado $matches[1]: $matches[0]<br/>";
		bticino_push("*1*0*$matches[2]".(isset($matches[3])?"#4#$matches[3]":"")."##"); // apaga as lâmpadas que estão acesas
	}
	
}


?>
