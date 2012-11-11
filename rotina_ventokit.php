<?php
// Bticino myhome PHP controller
// Samuel Vignoli, 2012

$TEM_ALGUEM_DE_FERIAS_NESSA_CASA_INTERROGACAO=false;


function dias_feriados($ano = null)
{
  if ($ano === null)
  {
    $ano = intval(date('Y'));
  }

  $pascoa     = easter_date($ano); // Limite de 1970 ou apó037 da easter_date()  http://www.php.net/manual/pt_BR/function.easter-date.php
  $dia_pascoa = date('j', $pascoa);
  $mes_pascoa = date('n', $pascoa);
  $ano_pascoa = date('Y', $pascoa);

  $feriados = array(
    // Datas Fixas dos feriados Nacionais Basileiros
    mktime(0, 0, 0, 1,  1,   $ano), // Confraternizaç Universal - Lei nº 662, de 06/04/49
    mktime(0, 0, 0, 4,  21,  $ano), // Tiradentes - Lei nº 662, de 06/04/49
    mktime(0, 0, 0, 5,  1,   $ano), // Dia do Trabalhador - Lei nº 662, de 06/04/49
    mktime(0, 0, 0, 8,  15,  $ano), // assuncao nossinhora =) BH/MG only
    mktime(0, 0, 0, 9,  7,   $ano), // Dia da Independêia - Lei nº 662, de 06/04/49
    mktime(0, 0, 0, 10,  12, $ano), // N. S. Aparecida - Lei nº 6802, de 30/06/80
    mktime(0, 0, 0, 11,  2,  $ano), // Todos os santos - Lei nº 662, de 06/04/49
    mktime(0, 0, 0, 11, 15,  $ano), // Proclamaç da republica - Lei nº 662, de 06/04/49
    mktime(0, 0, 0, 12, 8,  $ano), // imaculada conceicao - BH/MG only =)
    mktime(0, 0, 0, 12, 25,  $ano), // Natal - Lei nº 662, de 06/04/49

    // These days have a date depending on easter
    mktime(0, 0, 0, $mes_pascoa, $dia_pascoa - 48,  $ano_pascoa),//2º feira de carnaval
    mktime(0, 0, 0, $mes_pascoa, $dia_pascoa - 47,  $ano_pascoa),//3º feira de carnaval
    mktime(0, 0, 0, $mes_pascoa, $dia_pascoa - 2 ,  $ano_pascoa),//6º feira santa
    mktime(0, 0, 0, $mes_pascoa, $dia_pascoa     ,  $ano_pascoa),//Páoa
    mktime(0, 0, 0, $mes_pascoa, $dia_pascoa + 60,  $ano_pascoa),//Corpus Christi
  );

  sort($feriados);
  
  return $feriados;
}

function hoje_eh_feriado_interrogacao()
{
	if (in_array(mktime(),dias_feriados()))
		return true;
	else
		return false;
}

function hoje_eh_fim_de_semana_interrogacao()
{
	if(date('w')==0 || date('w')==6)
                return true;
        else
                return false;
}

function ventokit_ta_liberado_interrogacao()
{
	$variavel_gambiarra=false;
	// dias uteis de 07 as 20h
	if(date('H')>=7 && date('H') <= 20 && !hoje_eh_feriado_interrogacao() && !hoje_eh_fim_de_semana_interrogacao())
		 $variavel_gambiarra=true;
	// finais de semana e feriados de 10 as 21h
	if(date('H')>=10 && date('H') <= 21 && (hoje_eh_feriado_interrogacao() || hoje_eh_fim_de_semana_interrogacao()))
                 $variavel_gambiarra=true;


	return  $variavel_gambiarra;
}




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



if (ventokit_ta_liberado_interrogacao()) 
	bticino_push("*1*12*64##");
//else echo "tem gente dormindo =(";
//echo hoje_eh_feriado_interrogacao();
/*
$ano_=date("Y");// $ano_='2010'; 
foreach(dias_feriados($ano_) as $a)
	{
echo date("d-M-Y",$a).'<br>';						 
	}
*/
?>
