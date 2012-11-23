Encoder = {
    // When encoding do we convert characters into html or numerical entities
    EncodeType : "entity", // entity OR numerical
    isEmpty : function(val){
        if(val){
            return ((val===null) || val.length==0 || /^\s+$/.test(val));
        }else{
            return true;
        }
    },
    // Convert HTML entities into numerical entities
    HTML2Numerical : function(s){
        var arr1 = new Array('&nbsp;','&iexcl;','&cent;','&pound;','&curren;','&yen;','&brvbar;','&sect;','&uml;','&copy;','&ordf;','&laquo;','&not;','&shy;','&reg;','&macr;','&deg;','&plusmn;','&sup2;','&sup3;','&acute;','&micro;','&para;','&middot;','&cedil;','&sup1;','&ordm;','&raquo;','&frac14;','&frac12;','&frac34;','&iquest;','&agrave;','&aacute;','&acirc;','&atilde;','&Auml;','&aring;','&aelig;','&ccedil;','&egrave;','&eacute;','&ecirc;','&euml;','&igrave;','&iacute;','&icirc;','&iuml;','&eth;','&ntilde;','&ograve;','&oacute;','&ocirc;','&otilde;','&Ouml;','&times;','&oslash;','&ugrave;','&uacute;','&ucirc;','&Uuml;','&yacute;','&thorn;','&szlig;','&agrave;','&aacute;','&acirc;','&atilde;','&auml;','&aring;','&aelig;','&ccedil;','&egrave;','&eacute;','&ecirc;','&euml;','&igrave;','&iacute;','&icirc;','&iuml;','&eth;','&ntilde;','&ograve;','&oacute;','&ocirc;','&otilde;','&ouml;','&divide;','&Oslash;','&ugrave;','&uacute;','&ucirc;','&uuml;','&yacute;','&thorn;','&yuml;','&quot;','&amp;','&lt;','&gt;','&oelig;','&oelig;','&scaron;','&scaron;','&yuml;','&circ;','&tilde;','&ensp;','&emsp;','&thinsp;','&zwnj;','&zwj;','&lrm;','&rlm;','&ndash;','&mdash;','&lsquo;','&rsquo;','&sbquo;','&ldquo;','&rdquo;','&bdquo;','&dagger;','&dagger;','&permil;','&lsaquo;','&rsaquo;','&euro;','&fnof;','&alpha;','&beta;','&gamma;','&delta;','&epsilon;','&zeta;','&eta;','&theta;','&iota;','&kappa;','&lambda;','&mu;','&nu;','&xi;','&omicron;','&pi;','&rho;','&sigma;','&tau;','&upsilon;','&phi;','&chi;','&psi;','&omega;','&alpha;','&beta;','&gamma;','&delta;','&epsilon;','&zeta;','&eta;','&theta;','&iota;','&kappa;','&lambda;','&mu;','&nu;','&xi;','&omicron;','&pi;','&rho;','&sigmaf;','&sigma;','&tau;','&upsilon;','&phi;','&chi;','&psi;','&omega;','&thetasym;','&upsih;','&piv;','&bull;','&hellip;','&prime;','&prime;','&oline;','&frasl;','&weierp;','&image;','&real;','&trade;','&alefsym;','&larr;','&uarr;','&rarr;','&darr;','&harr;','&crarr;','&larr;','&uarr;','&rarr;','&darr;','&harr;','&forall;','&part;','&exist;','&empty;','&nabla;','&isin;','&notin;','&ni;','&prod;','&sum;','&minus;','&lowast;','&radic;','&prop;','&infin;','&ang;','&and;','&or;','&cap;','&cup;','&int;','&there4;','&sim;','&cong;','&asymp;','&ne;','&equiv;','&le;','&ge;','&sub;','&sup;','&nsub;','&sube;','&supe;','&oplus;','&otimes;','&perp;','&sdot;','&lceil;','&rceil;','&lfloor;','&rfloor;','&lang;','&rang;','&loz;','&spades;','&clubs;','&hearts;','&diams;');
        var arr2 = new Array('&#160;','&#161;','&#162;','&#163;','&#164;','&#165;','&#166;','&#167;','&#168;','&#169;','&#170;','&#171;','&#172;','&#173;','&#174;','&#175;','&#176;','&#177;','&#178;','&#179;','&#180;','&#181;','&#182;','&#183;','&#184;','&#185;','&#186;','&#187;','&#188;','&#189;','&#190;','&#191;','&#192;','&#193;','&#194;','&#195;','&#196;','&#197;','&#198;','&#199;','&#200;','&#201;','&#202;','&#203;','&#204;','&#205;','&#206;','&#207;','&#208;','&#209;','&#210;','&#211;','&#212;','&#213;','&#214;','&#215;','&#216;','&#217;','&#218;','&#219;','&#220;','&#221;','&#222;','&#223;','&#224;','&#225;','&#226;','&#227;','&#228;','&#229;','&#230;','&#231;','&#232;','&#233;','&#234;','&#235;','&#236;','&#237;','&#238;','&#239;','&#240;','&#241;','&#242;','&#243;','&#244;','&#245;','&#246;','&#247;','&#248;','&#249;','&#250;','&#251;','&#252;','&#253;','&#254;','&#255;','&#34;','&#38;','&#60;','&#62;','&#338;','&#339;','&#352;','&#353;','&#376;','&#710;','&#732;','&#8194;','&#8195;','&#8201;','&#8204;','&#8205;','&#8206;','&#8207;','&#8211;','&#8212;','&#8216;','&#8217;','&#8218;','&#8220;','&#8221;','&#8222;','&#8224;','&#8225;','&#8240;','&#8249;','&#8250;','&#8364;','&#402;','&#913;','&#914;','&#915;','&#916;','&#917;','&#918;','&#919;','&#920;','&#921;','&#922;','&#923;','&#924;','&#925;','&#926;','&#927;','&#928;','&#929;','&#931;','&#932;','&#933;','&#934;','&#935;','&#936;','&#937;','&#945;','&#946;','&#947;','&#948;','&#949;','&#950;','&#951;','&#952;','&#953;','&#954;','&#955;','&#956;','&#957;','&#958;','&#959;','&#960;','&#961;','&#962;','&#963;','&#964;','&#965;','&#966;','&#967;','&#968;','&#969;','&#977;','&#978;','&#982;','&#8226;','&#8230;','&#8242;','&#8243;','&#8254;','&#8260;','&#8472;','&#8465;','&#8476;','&#8482;','&#8501;','&#8592;','&#8593;','&#8594;','&#8595;','&#8596;','&#8629;','&#8656;','&#8657;','&#8658;','&#8659;','&#8660;','&#8704;','&#8706;','&#8707;','&#8709;','&#8711;','&#8712;','&#8713;','&#8715;','&#8719;','&#8721;','&#8722;','&#8727;','&#8730;','&#8733;','&#8734;','&#8736;','&#8743;','&#8744;','&#8745;','&#8746;','&#8747;','&#8756;','&#8764;','&#8773;','&#8776;','&#8800;','&#8801;','&#8804;','&#8805;','&#8834;','&#8835;','&#8836;','&#8838;','&#8839;','&#8853;','&#8855;','&#8869;','&#8901;','&#8968;','&#8969;','&#8970;','&#8971;','&#9001;','&#9002;','&#9674;','&#9824;','&#9827;','&#9829;','&#9830;');
        return this.swapArrayVals(s,arr1,arr2);
    },
    // Convert Numerical entities into HTML entities
    NumericalToHTML : function(s){
        var arr1 = new Array('&#160;','&#161;','&#162;','&#163;','&#164;','&#165;','&#166;','&#167;','&#168;','&#169;','&#170;','&#171;','&#172;','&#173;','&#174;','&#175;','&#176;','&#177;','&#178;','&#179;','&#180;','&#181;','&#182;','&#183;','&#184;','&#185;','&#186;','&#187;','&#188;','&#189;','&#190;','&#191;','&#192;','&#193;','&#194;','&#195;','&#196;','&#197;','&#198;','&#199;','&#200;','&#201;','&#202;','&#203;','&#204;','&#205;','&#206;','&#207;','&#208;','&#209;','&#210;','&#211;','&#212;','&#213;','&#214;','&#215;','&#216;','&#217;','&#218;','&#219;','&#220;','&#221;','&#222;','&#223;','&#224;','&#225;','&#226;','&#227;','&#228;','&#229;','&#230;','&#231;','&#232;','&#233;','&#234;','&#235;','&#236;','&#237;','&#238;','&#239;','&#240;','&#241;','&#242;','&#243;','&#244;','&#245;','&#246;','&#247;','&#248;','&#249;','&#250;','&#251;','&#252;','&#253;','&#254;','&#255;','&#34;','&#38;','&#60;','&#62;','&#338;','&#339;','&#352;','&#353;','&#376;','&#710;','&#732;','&#8194;','&#8195;','&#8201;','&#8204;','&#8205;','&#8206;','&#8207;','&#8211;','&#8212;','&#8216;','&#8217;','&#8218;','&#8220;','&#8221;','&#8222;','&#8224;','&#8225;','&#8240;','&#8249;','&#8250;','&#8364;','&#402;','&#913;','&#914;','&#915;','&#916;','&#917;','&#918;','&#919;','&#920;','&#921;','&#922;','&#923;','&#924;','&#925;','&#926;','&#927;','&#928;','&#929;','&#931;','&#932;','&#933;','&#934;','&#935;','&#936;','&#937;','&#945;','&#946;','&#947;','&#948;','&#949;','&#950;','&#951;','&#952;','&#953;','&#954;','&#955;','&#956;','&#957;','&#958;','&#959;','&#960;','&#961;','&#962;','&#963;','&#964;','&#965;','&#966;','&#967;','&#968;','&#969;','&#977;','&#978;','&#982;','&#8226;','&#8230;','&#8242;','&#8243;','&#8254;','&#8260;','&#8472;','&#8465;','&#8476;','&#8482;','&#8501;','&#8592;','&#8593;','&#8594;','&#8595;','&#8596;','&#8629;','&#8656;','&#8657;','&#8658;','&#8659;','&#8660;','&#8704;','&#8706;','&#8707;','&#8709;','&#8711;','&#8712;','&#8713;','&#8715;','&#8719;','&#8721;','&#8722;','&#8727;','&#8730;','&#8733;','&#8734;','&#8736;','&#8743;','&#8744;','&#8745;','&#8746;','&#8747;','&#8756;','&#8764;','&#8773;','&#8776;','&#8800;','&#8801;','&#8804;','&#8805;','&#8834;','&#8835;','&#8836;','&#8838;','&#8839;','&#8853;','&#8855;','&#8869;','&#8901;','&#8968;','&#8969;','&#8970;','&#8971;','&#9001;','&#9002;','&#9674;','&#9824;','&#9827;','&#9829;','&#9830;');
        var arr2 = new Array('&nbsp;','&iexcl;','&cent;','&pound;','&curren;','&yen;','&brvbar;','&sect;','&uml;','&copy;','&ordf;','&laquo;','&not;','&shy;','&reg;','&macr;','&deg;','&plusmn;','&sup2;','&sup3;','&acute;','&micro;','&para;','&middot;','&cedil;','&sup1;','&ordm;','&raquo;','&frac14;','&frac12;','&frac34;','&iquest;','&agrave;','&aacute;','&acirc;','&atilde;','&Auml;','&aring;','&aelig;','&ccedil;','&egrave;','&eacute;','&ecirc;','&euml;','&igrave;','&iacute;','&icirc;','&iuml;','&eth;','&ntilde;','&ograve;','&oacute;','&ocirc;','&otilde;','&Ouml;','&times;','&oslash;','&ugrave;','&uacute;','&ucirc;','&Uuml;','&yacute;','&thorn;','&szlig;','&agrave;','&aacute;','&acirc;','&atilde;','&auml;','&aring;','&aelig;','&ccedil;','&egrave;','&eacute;','&ecirc;','&euml;','&igrave;','&iacute;','&icirc;','&iuml;','&eth;','&ntilde;','&ograve;','&oacute;','&ocirc;','&otilde;','&ouml;','&divide;','&Oslash;','&ugrave;','&uacute;','&ucirc;','&uuml;','&yacute;','&thorn;','&yuml;','&quot;','&amp;','&lt;','&gt;','&oelig;','&oelig;','&scaron;','&scaron;','&yuml;','&circ;','&tilde;','&ensp;','&emsp;','&thinsp;','&zwnj;','&zwj;','&lrm;','&rlm;','&ndash;','&mdash;','&lsquo;','&rsquo;','&sbquo;','&ldquo;','&rdquo;','&bdquo;','&dagger;','&dagger;','&permil;','&lsaquo;','&rsaquo;','&euro;','&fnof;','&alpha;','&beta;','&gamma;','&delta;','&epsilon;','&zeta;','&eta;','&theta;','&iota;','&kappa;','&lambda;','&mu;','&nu;','&xi;','&omicron;','&pi;','&rho;','&sigma;','&tau;','&upsilon;','&phi;','&chi;','&psi;','&omega;','&alpha;','&beta;','&gamma;','&delta;','&epsilon;','&zeta;','&eta;','&theta;','&iota;','&kappa;','&lambda;','&mu;','&nu;','&xi;','&omicron;','&pi;','&rho;','&sigmaf;','&sigma;','&tau;','&upsilon;','&phi;','&chi;','&psi;','&omega;','&thetasym;','&upsih;','&piv;','&bull;','&hellip;','&prime;','&prime;','&oline;','&frasl;','&weierp;','&image;','&real;','&trade;','&alefsym;','&larr;','&uarr;','&rarr;','&darr;','&harr;','&crarr;','&larr;','&uarr;','&rarr;','&darr;','&harr;','&forall;','&part;','&exist;','&empty;','&nabla;','&isin;','&notin;','&ni;','&prod;','&sum;','&minus;','&lowast;','&radic;','&prop;','&infin;','&ang;','&and;','&or;','&cap;','&cup;','&int;','&there4;','&sim;','&cong;','&asymp;','&ne;','&equiv;','&le;','&ge;','&sub;','&sup;','&nsub;','&sube;','&supe;','&oplus;','&otimes;','&perp;','&sdot;','&lceil;','&rceil;','&lfloor;','&rfloor;','&lang;','&rang;','&loz;','&spades;','&clubs;','&hearts;','&diams;');
        return this.swapArrayVals(s,arr1,arr2);
    },
    // Numerically encodes all unicode characters
    numEncode : function(s){
        if(this.isEmpty(s)) return "";
        var e = "";
        for (var i = 0; i < s.length; i++)
        {
            var c = s.charAt(i);
            if (c < " " || c > "~")
            {
                c = "&#" + c.charCodeAt() + ";";
            }
            e += c;
        }
        return e;
    },
    // HTML Decode numerical and HTML entities back to original values
    htmlDecode : function(s){
        var c,m,d = s;
        if(this.isEmpty(d)) return "";
        // convert HTML entites back to numerical entites first
        d = this.HTML2Numerical(d);
        // look for numerical entities &#34;
        arr=d.match(/&#[0-9]{1,5};/g);
        // if no matches found in string then skip
        if(arr!=null){
            for(var x=0;x<arr.length;x++){
                m = arr[x];
                c = m.substring(2,m.length-1); //get numeric part which is refernce to unicode character
                // if its a valid number we can decode
                if(c >= -32768 && c <= 65535){
                    // decode every single match within string
                    d = d.replace(m, String.fromCharCode(c));
                }else{
                    d = d.replace(m, ""); //invalid so replace with nada
                }
            }
        }
        return d;
    },
    // encode an input string into either numerical or HTML entities
    htmlEncode : function(s,dbl){
        if(this.isEmpty(s)) return "";
        // do we allow double encoding? E.g will &amp; be turned into &amp;amp;
        dbl = dbl || false; //default to prevent double encoding
        // if allowing double encoding we do ampersands first
        if(dbl){
            if(this.EncodeType=="numerical"){
                s = s.replace(/&/g, "&#38;");
            }else{
                s = s.replace(/&/g, "&amp;");
            }
        }
        // convert the xss chars to numerical entities ' " < >
        s = this.XSSEncode(s,false);
        if(this.EncodeType=="numerical" || !dbl){
            // Now call function that will convert any HTML entities to numerical codes
            s = this.HTML2Numerical(s);
        }
        // Now encode all chars above 127 e.g unicode
        s = this.numEncode(s);
        // now we know anything that needs to be encoded has been converted to numerical entities we
        // can encode any ampersands & that are not part of encoded entities
        // to handle the fact that I need to do a negative check and handle multiple ampersands &&&
        // I am going to use a placeholder
        // if we don't want double encoded entities we ignore the & in existing entities
        if(!dbl){
            s = s.replace(/&#/g,"##AMPHASH##");
            if(this.EncodeType=="numerical"){
                s = s.replace(/&/g, "&#38;");
            }else{
                s = s.replace(/&/g, "&amp;");
            }
            s = s.replace(/##AMPHASH##/g,"&#");
        }
        // replace any malformed entities
        s = s.replace(/&#\d*([^\d;]|$)/g, "$1");
        if(!dbl){
            // safety check to correct any double encoded &amp;
            s = this.correctEncoding(s);
        }
        // now do we need to convert our numerical encoded string into entities
        if(this.EncodeType=="entity"){
            s = this.NumericalToHTML(s);
        }
        return s;
    },
    // Encodes the basic 4 characters used to malform HTML in XSS hacks
    XSSEncode : function(s,en){
        if(!this.isEmpty(s)){
            en = en || true;
            // do we convert to numerical or html entity?
            if(en){
                s = s.replace(/\'/g,"&#39;"); //no HTML equivalent as &apos is not cross browser supported
s = s.replace(/\"/g,"&quot;");
s = s.replace(/</g,"&lt;");
s = s.replace(/>/g,"&gt;");
}else{
s = s.replace(/\'/g,"&#39;"); //no HTML equivalent as &apos is not cross browser supported
s = s.replace(/\"/g,"&#34;");
s = s.replace(/</g,"&#60;");
s = s.replace(/>/g,"&#62;");
}
return s;
}else{
return "";
}
},
// returns true if a string contains html or numerical encoded entities
hasEncoded : function(s){
if(/&#[0-9]{1,5};/g.test(s)){
return true;
}else if(/&[A-Z]{2,6};/gi.test(s)){
return true;
}else{
return false;
}
},
// will remove any unicode characters
stripUnicode : function(s){
return s.replace(/[^\x20-\x7E]/g,"");
},
// corrects any double encoded &amp; entities e.g &amp;amp;
correctEncoding : function(s){
return s.replace(/(&amp;)(amp;)+/,"$1");
},
// Function to loop through an array swaping each item with the value from another array e.g swap HTML entities with Numericals
swapArrayVals : function(s,arr1,arr2){
if(this.isEmpty(s)) return "";
var re;
if(arr1 && arr2){
//ShowDebug("in swapArrayVals arr1.length = " + arr1.length + " arr2.length = " + arr2.length)
// array lengths must match
if(arr1.length == arr2.length){
for(var x=0,i=arr1.length;x<i;x++){
re = new RegExp(arr1[x], 'g');
s = s.replace(re,arr2[x]); //swap arr1 item with matching item from arr2
}
}
}
return s;
},
inArray : function( item, arr ) {
for ( var i = 0, x = arr.length; i < x; i++ ){
if ( arr[i] === item ){
return i;
}
}
return -1;
}
}


var cview = new CodeViewer();

$(window).resize(function(){cview.updateCanvasSize();});

function CodeViewer(){
	
    this.code = [];
      
	this.TIMER = 0;
	this.WAIT = 1000;
    
    this.MODE_VIEW = 0;
    this.MODE_VIEW_AND_CODE = 1;
    this.MODE_VIEW_AND_CONTROLS = 2;
    this.NO_CONTROLS = false;
    this.mode = this.MODE_VIEW;
    this.height = 400;
    
    
    this.canvas_container   = null;
    this.buttons            = null;
    this.buttons_code       = null;
    this.buttons_canvas     = null;
    this.btnFullView        = null;
    this.btnShowCode        = null;
    this.btnShowControls    = null;
    this.buttons_canvas     = null;
    this.code_container     = null;
    this.code_area          = null;
    this.bottom             = null;
}

CodeViewer.prototype.loadSource = function(idx){
	if (idx>=0 && idx <this.code.length){
        $('#codeContainer').html(this.code[idx]);
	}
}
CodeViewer.prototype.showViewAndCode = function(){
    $('#canvasContainer, #codeContainer, #buttonsCode, #bottom').fadeOut(600).hide();
    this.updateHeight(400);
	$('#bottom').width('100%');
    $('#buttons').after($('#bottom').detach());
   	$('#canvasContainer').width('39%');
	$('#codeContainer, #buttonsCode, #canvasContainer, #bottom').fadeIn(600);
   	this.updateCanvasSize();
	this.mode = this.MODE_VIEW_AND_CODE;
}

CodeViewer.prototype.showViewAndControls = function(){
	$('#canvasContainer, #codeContainer, #buttonsCode, #bottom').fadeOut(600).hide();
	this.updateHeight(400);
    $('#contents').prepend($('#bottom').detach());
	$('#canvasContainer').width('39%');
	$('#bottom').width('60%');
	$('#bottom, #canvasContainer').fadeIn(600);
    this.updateCanvasSize();
	this.mode = this.MODE_VIEW_AND_CONTROLS;
}

CodeViewer.prototype.showView = function(){
    $('#canvasContainer, #codeContainer, #buttonsCode, #bottom').fadeOut(600).hide();
    this.updateHeight(this.height);
    $('#buttons').after($('#bottom').detach());
	$('#canvasContainer, #bottom').width('100%').fadeIn(600);
	this.updateCanvasSize();
	this.mode = this.MODE_VIEW;

}

CodeViewer.prototype.updateCanvasSize = function(){
    c_width = $('#canvasContainer').width();
    c_height = $('#canvasContainer').height();
    $('canvas').attr('width',c_width);
    $('canvas').attr('height',c_height);
}

CodeViewer.prototype.updateHeight = function(h){
	$('#canvasContainer, #codeContainer, #contents').css('height',h+'px');
}

CodeViewer.prototype.createGUI = function(){
    
    this.canvas_container = document.getElementById('canvasContainer');    
    this.bottom = document.getElementById('bottom');
    

	this.buttons = document.createElement('div');
    this.buttons.id = 'buttons';
    
    this.buttons_code = document.createElement('div');
    this.buttons_code.id = 'buttonsCode';
    this.buttons_code.innerHTML = 
    "<input type='radio' id='btnSourceCode' name='radio' onclick='cview.loadSource(0)' checked='checked'/><label for='btnSourceCode'>WebGL JS</label>"+
    "<input type='radio' id='btnVertexShader' name='radio' onclick='cview.loadSource(1)'  /><label for='btnVertexShader'>Vertex Shader</label>"+	
    "<input type='radio' id='btnFragmentShader' name='radio' onclick='cview.loadSource(2)' /><label for='btnFragmentShader'>Fragment Shader</label>"+
    "<input type='radio' id='btnHTML' name='radio' onclick='cview.loadSource(3)' /><label for='btnHTML'>HTML</label>";
    
    this.buttons_canvas = document.createElement('div');
    this.buttons_canvas.id = 'buttonsCanvas';
    
    this.btnFullView = document.createElement('input');
    this.btnFullView.id = 'btnFullView';
    this.btnFullView.setAttribute('type','radio');
	this.btnFullView.setAttribute('name','mode');
	this.btnFullView.setAttribute('value','view');
    
	this.btnShowCode = document.createElement('input');
    this.btnShowCode.id = 'btnShowCode';
    this.btnShowCode.setAttribute('type','radio');
	this.btnShowCode.setAttribute('name','mode');
	this.btnShowCode.setAttribute('value','code');
	
	this.btnShowControls = document.createElement('input');
	this.btnShowControls.id = 'btnShowControls';
	this.btnShowControls.setAttribute('type','radio');
	this.btnShowControls.setAttribute('name','mode');
	this.btnShowControls.setAttribute('value','controls');
	
    this.buttons_canvas.appendChild(this.btnFullView);
	this.buttons_canvas.appendChild(this.btnShowCode);
    if(!this.NO_CONTROLS)	this.buttons_canvas.appendChild(this.btnShowControls);
    
    this.buttons.appendChild(this.buttons_code);
    this.buttons.appendChild(this.buttons_canvas);
    
    
    $('#bottom').before(this.buttons);
    $('#btnFullView').after("<label id='lblFullView' for='btnFullView'>View</label>");
	$('#btnShowCode').after("<label id='lblShowCode' for='btnShowCode'>Code</label>");
    $('#btnShowControls').after("<label id='lblShowControls' for='btnShowControls'>Controls</label>");
    $('#buttonsCanvas').buttonset();
	$('#buttonsCode').buttonset(); 
    
    

}

CodeViewer.prototype.updateGUI = function(){

 	this.code_container = document.createElement('pre');
    this.code_container.id = 'codeContainer';
    this.code_container.setAttribute('class','prettyprint linenums:1');
    $('#canvasContainer').before(this.code_container);
		
	if (this.mode == this.MODE_VIEW){
		this.btnFullView.setAttribute('checked','checked');
	}
	else if (this.mode == this.MODE_VIEW_AND_CODE){
		this.btnShowCode.setAttribute('checked','checked');
	}
	else if (this.mdoe == this.MODE_VIEW_AND_CONTROLS){
		this.btnShowControls.setAttribute('checked','checked');
	}
    
    if(this.mode == this.MODE_VIEW){
        this.canvas_container.style.width    = '100%';
        this.code_container.style.display    = 'none';
        this.buttons_code.style.display      = 'none';
        this.btnFullView.checked             = true;
		this.bottom.style.display			= 'block';
    }
    else if (this.mode == this.MODE_CODE_AND_VIEW){
        this.code_container.style.display    = 'block';
        this.buttons_code.style.display      = 'block';
        this.btnFullView.checked             = false;
		this.bottom.style.display			= 'block';
        
        $('#canvasContainer').before($('#codeContainer'));

    }
    else if (this.mode == this.MODE_VIEW_AND_CONTROLS){
		this.canvas_container.style.width    = '39%';
		this.code_container.style.display    = 'none';
		this.buttons_code.style.display      = 'none';
		this.bottom.style.width				= '60%';
		this.bottom.style.position			= 'relative';
        $('#contents').prepend($('#bottom').detach());
    }
    
	$('input[name="mode"]').change(function(){
		var mode = $('input[name="mode"]:checked').val();
		if (mode == 'view'){
			cview.showView();
		}
		else if (mode == 'controls'){
			cview.showViewAndControls();
		}
		else if (mode == 'code'){
			cview.showViewAndCode();
		}
	});
	   
	   
    this.updateHeight(this.height);
    this.updateCanvasSize();

	var selector;
	
    if(this.mode == this.MODE_VIEW){
		selector = '#canvasContainer';
	}
	else if (this.mode == this.MODE_VIEW_AND_CONTROLS){
		selector = '#canvasContainer, #bottom';
	}
     else if (this.mode == this.MODE_CODE_AND_VIEW){
        selector = '#canvasContainer, #bottom, #codeContainer';
     }
	
	$(selector).fadeIn(600);
}


CodeViewer.prototype.run = function(m,nc,h){
    if(m != null) this.mode = m;
	if (nc != null && nc == true) this.NO_CONTROLS = true;
    if (h != null) this.height = h;
 
 this.createGUI();
	
	this.TIMER = setInterval((function(self) {return function() {self.execute();}})(this),this.WAIT);
}

CodeViewer.prototype.execute = function(){
	
	if(this.TIMER) clearInterval(this.TIMER);
    
    $('#codeContainer, #cview').remove();
    
    this.code[0] = Encoder.htmlEncode($.trim(document.getElementById('code-js').innerHTML));
    this.code[1] = Encoder.htmlEncode($.trim(document.getElementById('shader-vs').innerHTML));
    this.code[2] = Encoder.htmlEncode($.trim(document.getElementById('shader-fs').innerHTML));
    this.code[3] = Encoder.htmlEncode($.trim(document.body.innerHTML));    
    
    this.code[0] = window.prettyPrintOne(this.code[0],'js',true);
    this.code[1] = window.prettyPrintOne(this.code[1],'js',true);
    this.code[2] = window.prettyPrintOne(this.code[2],'js',true);
    this.code[3] = window.prettyPrintOne(this.code[3],'html',true);
	
    this.updateGUI();    
    this.loadSource(0);

}


