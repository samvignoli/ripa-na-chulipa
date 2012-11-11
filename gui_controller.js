/* slider de volume do Russound \m/ */
function checksum_russound(m2checksum)
{
	var soma_dos_bytes=0;
	for(i=0;i<m2checksum.length;i++) {
		soma_dos_bytes+=parseInt(m2checksum[i]);
		//console.log(i+"|"+message[i]);
	}
		
	//CF.log('soma: '+soma_dos_bytes.toString(16).toUpperCase());
	var checksum=((soma_dos_bytes + m2checksum.length) & 0x007F).toString(16);
	//CF.log('tamanho da parada: '+m2checksum.length.toString(16).toUpperCase() +"| tamanho do array: "+m2checksum.length+" | volume: "+m2checksum[15]+  " | checksum: "+checksum);
	/*if(checksum.length==2)
		checksum="x"+checksum;
	else
		checksum="x0"+checksum;*/
	return checksum;
	
}

function trata_russound(system,data){
	if(data.substr(0,2)=="ZZ") {
		dados=data.substr(2).split('z');
		//CF.log("dados: "+data+" | volume: "+volume_russound);
		 volume_russound=parseInt(dados[0]);
		
		zona=parseInt(dados[1]);
		//CF.log(zona);

		var msg_pre_checksum=[0xF0, 0x00, 0x00, 0x7F, 0x00, 0x00, 0x70, 0x05, 0x02, 0x02, 0x00, 0x00, 0xF1, 0x21, 0x00, volume_russound, 0x00, zona, 0x00, 0x01]; //xx F7
		var checksum_da_msg=checksum_russound(msg_pre_checksum).toString(16);
		volume_russound=volume_russound.toString(16);		
		zona=zona.toString(16);
		var msg2go="\xF0\x00\x00\x7F\x00\x00\x70\x05\x02\x02\x00\x00\xF1\x21\x00"+ 
					hex2a(volume_russound)+ "\x00" + hex2a(zona) + "\x00\x01"+hex2a(checksum_da_msg)+"\xF7\x0D";
		//CF.log("volume: "+volume_russound.toString());
		//CF.log("ascii da zona: "+hex2asc(zona.toString())+"| zona: "+zona);
		//CF.log("ascii do volume: "+hex2asc(volume_russound.toString()) +"| volume: "+volume_russound);
		data=msg2go;
		//CF.log("checksum: "+checksum_da_msg +" | volume"+ volume_russound+" | dados:" + data +"| hex: " + asc2hex(data));
		}	else	CF.log("msg padrao:"+ data);

		CF.send(system,data);
		
		
		
}


function asc2hex(pStr) {
        tempstr = '';
        for (a = 0; a < pStr.length; a = a + 1) {
            tempstr = tempstr + pStr.charCodeAt(a).toString(16)+"|";
        }
        return tempstr;
    }


function hex2a(hex) {
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}


/* controle de temperatura do MyHome */
var lastCall = 0;
var pingTemperatura = setInterval(function() {
	if (new Date() - lastCall < 500)
            return false;
     else
     { 
	CF.send("__MyHome","*#4*79*0##");
	//CF.log('once =)');
	lastCall = new Date();
	}
}
	, 10000); 


/* trata o volume do Denon 3312 */


function tratadenon(system,data){
	if(data.substr(0,2)=="MV" && data.substr(0,3)!="MV?") {
		volume=parseInt(data.substr(2));
		volume=volume+(5-volume%5);
	if(volume%10==0)
		volume=volume/10;
		CF.send(system,"MV"+volume+"\x0D");
	} else {
		CF.send(system,data);
		//alert(system+''+data);
		}
	 
}



/* trata o volume do Denon 1912 */


function tratadenon1912(system,data,suite){
	if(data.substr(0,2)=="ZZ") {
		volume=parseInt(data.substr(2));
		volume=interval2volume(volume);
		CF.send(system,"MV"+volume+"\x0D");
			if (suite===1)
				CF.setJoin('s780', interval2dbstring(volume2interval(volume)));
			else if (suite===0)
				CF.setJoin('s782', interval2dbstring(volume2interval(volume)));
			else if (suite===3)
				CF.setJoin('s778', interval2dbstring(volume2interval(volume)));
		}

	 else {
		CF.send(system,data);
		}
		
		
}

function interval2dbstring(interval)
{
	if (interval==1) return "---";
	else return -81.5+(0.5*interval)+"dB";
}

function interval2volume(interval) {
	if(interval==1)
		volume = 99;
	else if(interval==2)
		volume = 995;
	else {
		volume = Math.ceil(parseInt(interval)/2)-2+""+(interval%2==0?"5":"");
		if (interval<=23)
		volume="0"+volume;
	}
	
	return volume;
}




function volume2interval(volume) {
	if(volume==99)
		interval = 1;
	else if(volume==995)
		interval = 2;
	else  {
		interval = (parseInt(volume.toString().substr(0,2))*2)+3;
		if (volume.length==3)
			interval++;
	}
	
	return interval;
}


function trim (str) {
	 var str = str.replace(/^\s\s*/, ''),
		 ws = /\s/,
		 i = str.length;
	 while (ws.test(str.charAt(--i)));
	 return str.slice(0, i + 1);
 }


/*
 declarando variaveis pro MyHome
 */

var powerStateRegexPrivateRaiser = 	/\*1\*(\d+)\*(\d+)\#\#/;
var powerStateRegexLocalBus = 		/\*1\*(\d+)\*(\d+)\#4\#(\d+)\#\#/;
var RegexTemperatura = 				/\*\#4\*79\*0\*(\d+)\#\#/;

var powerState = [];
powerState["PrivateRaiser"]=[];
powerState["LocalBus01"]=[];
powerState["LocalBus02"]=[];



/* funcao que envia comandos ao MyHome */

function toggleMyHome(ponto,rede) {
	//CF.send("MyHomeMonitor", "*#1*"+ponto+"#4#"+rede+"##"); //pega o estado inicial
	//CF.log("===>>>> powerState: "+powerState[(!rede?"PrivateRaiser":"LocalBus"+rede)]['Ponto'+ponto]+" ponto: "+ponto+" rede: "+rede);
	//alert(powerState);
    if (powerState[(!rede?"PrivateRaiser":"LocalBus"+rede)]['Ponto'+ponto] == 1) {
        // Turn power off
        CF.send("__MyHome", "*1*0*"+ponto+(!rede?"":"#4#"+rede)+"##");

    } else {
        // Turn power on
        CF.send("__MyHome", "*1*1*"+ponto+(!rede?"":"#4#"+rede)+"##");

    }
    // Request power state for next press
    //CF.send("MyHomeMonitor", "*#1*"+ponto+(!rede?"":"#4#"+rede)+"##\x0D"); //pega o estado inicial
    //CF.send("MyHomeMonitor", "*#1*"+ponto+(!rede?"":"#4#"+rede)+"##"); //pega o estado inicial


}









var regexDenon = 		/MV(\d+)/;



/*
  analisa o feedback e atualiza o estado dos joins
 */
CF.userMain = function () {
    CF.watch(CF.FeedbackMatchedEvent, "MyHomeMonitor", "Prova", function (feedbackName, matchedString) {
    	//CF.log(matchedString);
    	//CF.log("--------------");
        // Match the data against regex to capture the power state
        
         // mata a barra de status do ipad
		//CF.setJoin('d17932',1);
		
		var temperatura=RegexTemperatura.exec(matchedString);
		if(!temperatura) var boo="sad";
		else{
			CF.setJoin('s79',parseInt(temperatura[1],10)/10+"ºC");
			
		}
		
		
         var matches = powerStateRegexPrivateRaiser.exec(matchedString);
		if(!matches) {
                  var matches = powerStateRegexLocalBus.exec(matchedString);
                  var localbus=true;
                } else
                	var localbus=false;

        if(!matches) var boo="sad";
        else {

        	
        		if(localbus===true)
            		powerState['LocalBus'+matches[3]]['Ponto'+matches[2]] = (matches[1]==0?"0":"1");
            	else
            		powerState['PrivateRaiser']['Ponto'+matches[2]] = (matches[1]==0?"0":"1");
        	 
        
        	//if(matches[2]=="69" || matches[2]=="61"){
	        	if(!matches[3])
					matches[3]=0;
	       			//var join=ponto2join(matches[2],matches[3]);
	       			var join=parseInt((matches[3]*100))+parseInt(matches[2]);
	       			//CF.log("join: "+join+" powerState: "+powerState+" matches[0]:"+matches[0]+" matches[1]:"+matches[1]);
	          	CF.setJoin('d'+join, (matches[1]==0?"0":"1"));
	        	//}
	        }
        
    });


// monitoramento do Denon da Suite
CF.send("__Denon_Suite","MV?");
 CF.watch(CF.FeedbackMatchedEvent, "__Denon_Suite", "VolumeDisplay_Suite", function (feedbackName, matchedString) {
	var volume_encontrado = regexDenon.exec(matchedString);
	if(!volume_encontrado) var boo="sad";
	else {
		intervalo=parseInt(volume2interval(trim(volume_encontrado[0].substr(2).toString())));
		CF.setJoin('a780', intervalo*400, false);
		CF.setJoin('s780', interval2dbstring(intervalo));
		//CF.setJoin('s779', "slider {{[@a780]}}");
		//CF.log("sam:" + trim(matchedString) + "volume: "+ trim(volume_encontrado[0]) + "comando para o join: "+volume2interval(trim(volume_encontrado[0].substr(2).toString()))+"||||||||||||||");
	}
});


// monitoramento do Denon do Estar íntimo
CF.send("__Denon_EstarIntimo","MV?");
 CF.watch(CF.FeedbackMatchedEvent, "__Denon_EstarIntimo", "VolumeDisplay_Estar", function (feedbackName, matchedString) {
	var volume_encontrado = regexDenon.exec(matchedString);
	if(!volume_encontrado) var boo="sad";
	else {
		intervalo=parseInt(volume2interval(trim(volume_encontrado[0].substr(2).toString())));
		CF.setJoin('a782', intervalo*400, false);
		CF.setJoin('s782', interval2dbstring(intervalo));
		//CF.setJoin('s779', "slider {{[@a780]}}");
		//CF.log("sam:" + trim(matchedString) + "volume: "+ trim(volume_encontrado[0]) + "comando para o join: "+volume2interval(trim(volume_encontrado[0].substr(2).toString()))+"||||||||||||||");
	}
});


// monitoramento do Denon do Home Theater
CF.send("__Denon_HomeTheater","MV?");
 CF.watch(CF.FeedbackMatchedEvent, "__Denon_HomeTheater", "VolumeDisplay_Home", function (feedbackName, matchedString) {
 	CF.log(matchedString);
	var volume_encontrado = regexDenon.exec(matchedString);
	if(!volume_encontrado) var boo="sad";
	else {
		intervalo=parseInt(volume2interval(trim(volume_encontrado[0].substr(2).toString())));
		CF.setJoin('a778', intervalo*400, false);
		CF.setJoin('s778', interval2dbstring(intervalo));
		//CF.setJoin('s779', "slider {{[@a780]}}");
		CF.log("sam:" + trim(matchedString) + "volume: "+ trim(volume_encontrado[0]) + "comando para o join: "+volume2interval(trim(volume_encontrado[0].substr(2).toString()))+"||||||||||||||");
	}
});




};