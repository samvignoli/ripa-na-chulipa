
/* tradutor de pontos para joins */
function ponto2join(ponto,rede)
{
	if(ponto=="69" && rede=="01")
	return "666";
	else if(ponto=="61" && rede=="01")
	return "667";
	else return "1"; // à prova de falhas \m/
}





/* trata o volume do Denon */


function tratadenon(system,data){
	if(data.substr(0,2)=="MV") {
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


/*
 declarando variaveis pro MyHome
 */

var powerStateRegexPrivateRaiser = 	/\*1\*(\d+)\*(\d+)\#\#/;
var powerStateRegexLocalBus = 		/\*1\*(\d+)\*(\d+)\#4\#(\d+)\#\#/;

var powerState = [];
powerState["PrivateRaiser"]=[];
powerState["LocalBus01"]=[];
powerState["LocalBus02"]=[];



/* função que envia comandos ao MyHome */

function toggleMyHome(ponto,rede) {
	//CF.send("MyHomeMonitor", "*#1*"+ponto+"#4#"+rede+"##\x0D"); //pega o estado inicial
	CF.log("===>>>> powerState: "+powerState[(!rede?"PrivateRaiser":"LocalBus"+rede)]['Ponto'+ponto]+" ponto: "+ponto+" rede: "+rede);
	//alert(powerState);
    if (powerState[(!rede?"PrivateRaiser":"LocalBus"+rede)]['Ponto'+ponto] == 1) {
        // Turn power off
        CF.send("__MyHome", "*1*0*"+ponto+(!rede?"":"#4#"+rede)+"##\x0D");

    } else {
        // Turn power on
        CF.send("__MyHome", "*1*1*"+ponto+(!rede?"":"#4#"+rede)+"##\x0D");

    }
    // Request power state for next press
    CF.send("MyHomeMonitor", "*#1*"+ponto+(!rede?"":"#4#"+rede)+"##\x0D"); //pega o estado inicial


}











/*
  analisa o feedback e atualiza o estado dos joins
 */
CF.userMain = function () {
    CF.watch(CF.FeedbackMatchedEvent, "MyHomeMonitor", "Prova", function (feedbackName, matchedString) {
    	//CF.log(matchedString);
    	//CF.log("--------------");
        // Match the data against regex to capture the power state
        
         
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
        	 
        
        	if(matches[2]=="69" || matches[2]=="61"){
	        	if(!matches[3])
					matches[3]=0;
	       			var join=ponto2join(matches[2],matches[3]);
	       			//CF.log("join: "+join+" powerState: "+powerState+" matches[0]:"+matches[0]+" matches[1]:"+matches[1]);
	          	CF.setJoin(join, (matches[1]==0?"0":"1"));
	        	}
	        }
        
    });

    // Request initial power state
    //CF.send("MyHomeMonitor", "*#1*0##\x0D");


};