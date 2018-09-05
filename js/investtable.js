// Initialize Firebase
var config = {
	apiKey: "AIzaSyD3B1CryXhHGh2ltr9BBUqUS5rug3lxYjI",
	authDomain: "abfolio-7cec5.firebaseapp.com",
	databaseURL: "https://abfolio-7cec5.firebaseio.com",
	projectId: "abfolio-7cec5",
	storageBucket: "abfolio-7cec5.appspot.com",
	messagingSenderId: "983221567782"
};
firebase.initializeApp(config);

var investments = "";
var count_investments = 0;

var assetsArray = [];
var amountsArray = [];

var buyPricesArray = [];
var actionsArray = [];

var dates = [];

var numbers = [];

firebase.auth().onAuthStateChanged(user => {
	if (user) {
		var username = document.getElementById('username');
		var email = document.getElementById('email');

		var avatar = document.getElementById('avatar');

		username.innerHTML = user.displayName;
		email.innerHTML = user.email;

		avatar.src = user.photoURL;

		if (window.XMLHttpRequest) {
			xmlhttp = new XMLHttpRequest();
		} else {
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		}

		var url = "../dbconnect.php?uid=" + user.uid;

		xmlhttp.open("GET", url, false);
		xmlhttp.send();

		if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
			var raw = xmlhttp.responseText;

			// calculate total holdings value

			investments = raw.split('\n', 4)[3];

			//var currency1 = raw.split('\n', 2)[1];

			//var totalinvested1 = raw.split('\n', 3)[2];

			//var assetsArray1 = totalholdings1.split(":");

			//var totalvalue1 = 0;
			//var totalcrypto1 = 0;

			//var price1_ = [];

			var investmentsArray = investments.split(":");

			var table = document.getElementById("investments");

			var row = table.insertRow(1);

			var rownumber = 0;

			var nowPricesArray = [];

			var profitsArray = [];

			count_investments = (investmentsArray.length - 1) / 6;

			for (i = 0; i < investmentsArray.length; i++) {
				if (i % 3 == 0 && i != 0) {
					if (!(investmentsArray[i] >> 0) > 0) {
						assetsArray.push(investmentsArray[i]);
					}
				}
				if (i % 2 == 0 && i != 0) {
					if (!(investmentsArray[i] >> 0) > 0) {
						if (investmentsArray[i] == "BUY") {
							actionsArray.push(investmentsArray[i]);
							buyPricesArray.push(investmentsArray[i + 2]);
							amountsArray.push(investmentsArray[i + 3].replace(" ", ""));
						} else {
							actionsArray.push("SELL");
							buyPricesArray.push(undefined);
							//amountsArray.push(0);
						}
					}
				}
			}

			for (i = 0; i < amountsArray.length; i++) {
				var api_url = "https://min-api.cryptocompare.com/data/price?fsym=" + assetsArray[i] + "&tsyms=USD";

				xmlhttp.open("GET", api_url, false);
				xmlhttp.send();

				if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
					nowPricesArray.push(xmlhttp.responseText.split(':')[1].replace("}", ""));

					profitsArray.push(((nowPricesArray[i] / buyPricesArray[i] - 1) * 100).toFixed(2) + "% ($" + (nowPricesArray[i] * amountsArray[i] - buyPricesArray[i] * amountsArray[i]).toFixed(2) + ")");
				}
			}
		}

		for (i = 0; i < investmentsArray.length / 5 - 1; i++) {
			var row = table.insertRow(1);

			var rowscolor = table.getElementsByTagName("tr");

			if (i != 0) {
				rownumber += 6;
			}

			if (typeof investmentsArray[rownumber + 5] === 'undefined') {
				//error
			} else {
				row.insertCell(0).innerHTML = "<b>" + (i + 1).toString() + "</b>";

				numbers.push(investmentsArray[rownumber]);

				row.insertCell(1).innerHTML = investmentsArray[rownumber + 1];

				dates.push(investmentsArray[rownumber + 1]);

				row.insertCell(2).innerHTML = investmentsArray[rownumber + 2];
				row.insertCell(3).innerHTML = investmentsArray[rownumber + 3];
				row.insertCell(4).innerHTML = "$" + investmentsArray[rownumber + 4];
				row.insertCell(5).innerHTML = investmentsArray[rownumber + 5];

				if (investmentsArray[rownumber + 2] == "BUY") {
					rowscolor[1].className = "success";
				} else {
					rowscolor[1].className = "danger";
				}
			}

			if (profitsArray[rownumber / 6] == "NaN% ($NaN)") {
				row.insertCell(6).innerHTML = "-";
				row.insertCell(7).innerHTML = "<i style=\"cursor: pointer;\" onclick=\"edittransaction(" + investmentsArray[rownumber] + ")\" class=\"fa fa-edit\"></i> <i style=\"cursor: pointer;\" onclick=\"deletetransaction(" + investmentsArray[rownumber] + ")\" class=\"fa fa-trash\"></i><p style=\"cursor: pointer;\" id=\"trash" + investmentsArray[rownumber] + "\" onclick=\"deletetransaction(" + investmentsArray[rownumber] + ")\"> <font color=\"#ff0000\">Confirm</font></p>";

				document.getElementById("trash" + investmentsArray[rownumber]).style.visibility = "hidden";
			} else {
				row.insertCell(6).innerHTML = profitsArray[rownumber / 6];
				row.insertCell(7).innerHTML = "<i style=\"cursor: pointer;\" onclick=\"edittransaction(" + investmentsArray[rownumber] + ")\" class=\"fa fa-edit\"></i> <i style=\"cursor: pointer;\" onclick=\"deletetransaction(" + investmentsArray[rownumber] + ")\" class=\"fa fa-trash\"></i><p style=\"cursor: pointer;\" id=\"trash" + investmentsArray[rownumber] + "\" onclick=\"deletetransaction(" + investmentsArray[rownumber] + ")\"> <font color=\"#ff0000\">Confirm</font></p>";

				document.getElementById("trash" + investmentsArray[rownumber]).style.visibility = "hidden";
			}
		}
	}
});

/*var curr = ["AFN", "EUR", "ALL", "DZD", "USD", "EUR", "AOA", "XCD", "XCD", "ARS", "AMD", "AWG", "AUD", "EUR", "AZN", "BSD", "BHD", "BDT", "BBD", "BYN", "EUR", "BZD", "XOF", "BMD", "INR", "BTN", "BOB", "BOV", "USD", "BAM", "BWP", "NOK", "BRL", "USD", "BND", "BGN", "XOF", "BIF", "CVE", "KHR", "XAF", "CAD", "KYD", "XAF", "XAF", "CLP", "CLF", "CNY", "AUD", "AUD", "COP", "COU", "KMF", "CDF", "XAF", "NZD", "CRC", "XOF", "HRK", "CUP", "CUC", "ANG", "EUR", "CZK", "DKK", "DJF", "XCD", "DOP", "USD", "EGP", "SVC", "USD", "XAF", "ERN", "EUR", "ETB", "EUR", "FKP", "DKK", "FJD", "EUR", "EUR", "EUR", "XPF", "EUR", "XAF", "GMD", "GEL", "EUR", "GHS", "GIP", "EUR", "DKK", "XCD", "EUR", "USD", "GTQ", "GBP", "GNF", "XOF", "GYD", "HTG", "USD", "AUD", "EUR", "HNL", "HKD", "HUF", "ISK", "INR", "IDR", "XDR", "IRR", "IQD", "EUR", "GBP", "ILS", "EUR", "JMD", "JPY", "GBP", "JOD", "KZT", "KES", "AUD", "KPW", "KRW", "KWD", "KGS", "LAK", "EUR", "LBP", "LSL", "ZAR", "LRD", "LYD", "CHF", "EUR", "EUR", "MOP", "MKD", "MGA", "MWK", "MYR", "MVR", "XOF", "EUR", "USD", "EUR", "MRU", "MUR", "EUR", "XUA", "MXN", "MXV", "USD", "MDL", "EUR", "MNT", "EUR", "XCD", "MAD", "MZN", "MMK", "NAD", "ZAR", "AUD", "NPR", "EUR", "XPF", "NZD", "NIO", "XOF", "NGN", "NZD", "AUD", "USD", "NOK", "OMR", "PKR", "USD", , "PAB", "USD", "PGK", "PYG", "PEN", "PHP", "NZD", "PLN", "EUR", "USD", "QAR", "EUR", "RON", "RUB", "RWF", "EUR", "SHP", "XCD", "XCD", "EUR", "EUR", "XCD", "WST", "EUR", "STN", "SAR", "XOF", "RSD", "SCR", "SLL", "SGD", "ANG", "XSU", "EUR", "EUR", "SBD", "SOS", "ZAR", "SSP", "EUR", "LKR", "SDG", "SRD", "NOK", "SZL", "SEK", "CHF", "CHE", "CHW", "SYP", "TWD", "TJS", "TZS", "THB", "USD", "XOF", "NZD", "TOP", "TTD", "TND", "TRY", "TMT", "USD", "AUD", "UGX", "UAH", "AED", "GBP", "USD", "USD", "USN", "UYU", "UYI", "UZS", "VUV", "VEF", "VND", "USD", "USD", "XPF", "MAD", "YER", "ZMW", "ZWL", "XBA", "XBB", "XBC", "XBD", "XTS", "XXX", "XAU", "XPD", "XPT", "XAG"];

for (i = 0; i < curr.length; i++) {
if (window.XMLHttpRequest) {
xmlhttp = new XMLHttpRequest();
} else {
xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
}

var api_url = "https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=" + curr[i];

xmlhttp.open("GET", api_url, false);
xmlhttp.send();

if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
if (xmlhttp.responseText.includes("Response")) {
console.log(curr[i]);
}
}
}*/

function isNumeric(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

function isValidDate(dateString) {
	// First check for the pattern
	if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString))
		return false;

	// Parse the date parts to integers
	var parts = dateString.split("/");
	var day = parseInt(parts[1], 10);
	var month = parseInt(parts[0], 10);
	var year = parseInt(parts[2], 10);

	// Check the ranges of month and year
	if (year < 1000 || year > 3000 || month == 0 || month > 12)
		return false;

	var monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

	// Adjust for leap years
	if (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
		monthLength[1] = 29;

	// Check the range of the day
	return day > 0 && day <= monthLength[month - 1];
};

function addtransaction() {
	firebase.auth().onAuthStateChanged(user => {
		if (user) {
			var error = "";

			var validcryptos = ["42", "300", "365", "404", "611", "808", "888", "1337", "2015", "ARC", "CLUB", "7", "ZCN", "ZRX", "0xBTC", "BIT16", "MCT", "1CR", "CHAO", "2BACCO", "2GIVE", "32BIT", "3DES", "8BT", "8BIT", "ATKN", "RTB", "ABC", "AC3", "ACT", "ACOIN", "AEON", "AIC", "AIDOC", "AIT", "XAI", "AITT", "AXT", "ALX", "ALIS", "ALT", "AMBT", "AMIS", "ANTS", "APIS", "ARE", "ARK", "ARNA", "ATB", "ATCC", "ATFS", "ATL", "ATM", "AUC", "AXR", "AXS", "ABJ", "ABS", "ACC", "ACCO", "AEC", "ACES", "ACT", "ACH", "ACID", "OAK", "ACTN", "AMT", "ACC", "ADX", "ADT", "ADM", "ADB", "ADL", "ADH", "ADST", "ABT", "AIB", "ADZ", "AGS", "AERM", "AERO", "AM", "ARN", "AE", "AET", "AGRS", "DLT", "AHT", "AID", "ADN", "ADK", "AIX", "AION", "AST", "AIR", "AIR", "AKA", "ALEX", "PLM", "ALG", "ALN", "SOC", "ASAFE2", "APC", "ALPS", "ALF", "ACAT", "ALQO", "ALTCOM", "ALTOCAR", "AMBER", "AMB", "AMC", "AMX", "AMMO", "AMO", "AMN", "AMS", "AMY", "ANCP", "ANAL", "ACP", "AND", "ANGL", "AVH", "ANI", "ANK", "ANC", "RYZ", "ANTI", "ANTC", "CPX", "APEX", "APH", "APPC", "APT", "APX", "ARCO", "AR", "ALC", "ANT", "ARBI", "ARB", "ARCT", "ABT", "ARCH", "ARC", "ARDR", "ARENA", "ARG", "ARGUS", "ARI", "ARO", "BOTS", "ARM", "ARPA", "ABY", "ARTE", "ATX", "AUA", "ASN", "XAS", "AC", "ADCN", "AST", "ASTRO", "ATH", "ATMOS", "ATOM", "ATMI", "AUC", "ADC", "REP", "AURS", "AURA", "AOA", "AUR", "AUN", "ATS", "NIO", "AUT", "ATM", "AVL", "AVA", "AV", "AVT", "AOP", "AVE", "ACN", "AXIOM", "AXYS", "AZART", "B2B", "B3", "KB3", "BAX", "BAM", "BANCA", "BKX", "BBN", "BERN", "BEX", "BFT", "VEE", "BMT", "BOOM", "BOS", "BQC", "BRAT", "BTCL", "BTCM", "BAN", "BKC", "NANAS", "BNT", "B@", "BNK", "BCOIN", "BBN", "BBCC", "BASHC", "BAT", "BTA", "BCX", "BSTK", "SAND", "BRDD", "XBTS", "BVC", "BEE", "BFDT", "BELA", "BBI", "BMK", "BNC", "BEN", "BENJI", "BEST", "KNG", "BET", "BTRM", "BETR", "BETT", "BZNT", "BEZ", "BBP", "BIX", "BID", "BDP", "HUGE", "LFC", "BIGUP", "BBO", "BHC", "BIC", "BLRY", "XBL", "BNB", "BRC", "BIOB", "BIO", "BIOS", "BTRN", "BIP", "BIS", "BAS", "BTB", "BAY", "BITB", "BBK", "BBT", "BOSS", "BRONZ", "BCD", "BEN", "BITCAR", "CAT", "COAL", "BCCOIN", "BCR", "BTCRY", "BCY", "BTCR", "BDG", "CSNO", "BFX", "FLIP", "FLX", "BTG", "HIRE", "STU", "BTLC", "LUX", "BTM", "BMX", "BTMI", "BM", "BITOK", "BTQ", "RNTB", "BIT", "BITX", "XSEED", "BSD", "BTE", "BSR", "BSTN", "BST", "SWIFT", "BXT", "TUBE", "VEG", "VOLT", "ZNY", "BTCA", "BAC", "BXC", "BTD", "BTDX", "BTCN", "BTC", "BCA", "CDY", "BCH", "BTCC", "BCD", "BTG", "BITG", "BTCH", "XBI", "BCI", "BTN", "BTPL", "BTCP", "BTCRED", "RBTC", "BCR", "BTCS", "BT2", "BTCS", "BTCD", "BTCE", "BCF", "BIFI", "BTF", "BTCGO", "XBC", "BTX", "BWS", "BTW", "BCX", "BTCZ", "BM", "BTX", "DARX", "BDL", "BT1", "BTCL", "BIM", "BMXT", "XPAT", "BQ", "BRO", "BTL", "BITSD", "BINS", "BTS", "BSX", "XBS", "BITS", "BWT", "BITZ", "BTZ", "XBP", "BLK", "BS", "BHC", "BMC", "BSTAR", "BLC", "BLAS", "BLAZR", "BLITZ", "XBP", "ARY", "CAT", "BCDN", "LNC", "BCPT", "BMH", "BLOCK", "BLOCKPAY", "BPL", "BCAP", "BLX", "BCT", "BTF", "BCIO", "BPT", "TIX", "BTT", "BNTN", "BLT", "CDT", "BLU", "BDR", "BLZ", "BNX", "BNB", "BOB", "BOT", "BOE", "BOG", "BOLD", "BLN", "BOLI", "BOMB", "BON", "BON", "BBR", "BOST", "BOSON", "BOTC", "CAP", "BTO", "BOU", "XBTY", "BNTY", "AHT", "BSC", "BOXY", "BRAIN", "BRD", "BRX", "BRK", "BRIA", "BBT", "BCO", "BRC", "BRIT", "BUBO", "BGL", "BT", "BULLS", "BWK", "BUN", "BURST", "BUZZ", "BYC", "BTE", "BCN", "GBYTE", "BTH", "BTM", "XCT", "CAIx", "CBD", "CCC", "CEDEX", "CEEK", "CETI", "CHIPS", "CINNI", "CLAM", "CO2", "CMS", "CPY", "COSS", "CPC", "MLS", "CMZ", "CAB", "CACH", "CF", "CALC", "CLO", "CAM", "CMPCO", "CAN", "CND", "CDN", "CCN", "XCI", "CANN", "XCD", "CAPP", "CPC", "CAR", "CTX", "CV", "CARBON", "ADA", "CARD", "CARE", "CARE", "CXO", "DIEM", "CTC", "CNBC", "CASH", "CBC", "CBC", "CASH", "CSH", "CAS", "CSC", "CSTL", "CAT1", "CVTC", "CAV", "CCO", "CEL", "CTR", "CNT", "CBS", "XCE", "CHC", "LINK", "CHAN", "CAG", "CHA", "CHARM", "CHAT", "CXC", "CHESS", "CHILD", "CHI", "CNC", "CHIP", "CHOOF", "DAY", "CRX", "CIN", "CND", "CIR", "COVAL", "CVC", "XCLR", "POLL", "CLV", "CHASH", "CLICK", "CLIN", "CLINT", "CLOAK", "CKC", "CLD", "CLOUT", "CLUD", "COE", "COB", "COX", "CTT", "CFC", "CFI", "COG", "COIN", "XMG", "BTTF", "C2", "CONI", "CET", "COFI", "XCJ", "CL", "LION", "MEE", "MEET", "XCM", "CPL", "CHP", "LAB", "CTIC", "COI", "CNO", "CNMT", "CXT", "XCXT", "COLX", "CLN", "CMT", "CBT", "CMM", "CDX", "COMM", "COC", "CMP", "COMP", "CPN", "CYC", "CNL", "RAIN", "CFD", "CJT", "CQST", "CNN", "CUZ", "COOL", "CCX", "XCPO", "CLR", "CORAL", "CORE", "COR", "CTXC", "CSMIC", "CMOS", "ATOM", "CMC", "COU", "XCP", "CHT", "COV", "COV", "CRAB", "CRACK", "CRC", "CRAFT", "CFTY", "CRAIG", "CRNK", "CRAVE", "CRAVE", "CZC", "CRM", "XCRE", "CREA", "CRDNC", "CRB", "CRE", "CRE", "CRDS", "CS", "CFT", "CREDO", "CREVA", "CROAT", "CMCT", "CRC", "CCOS", "YUP", "WIZ", "CRW", "CRC", "CRYPT", "CPT", "CRL", "CRPT", "XCR", "CTO", "CESC", "CIF", "TKT", "CWIS", "CWX", "C20", "CABS", "BUK", "CBX", "CCRB", "CIRC", "FCS", "CFT", "CHBR", "TKR", "CJ", "CJC", "LEU", "CPAY", "CRPS", "PING", "CS", "CWV", "CWXT", "CDX", "CGA", "CYT", "CIX", "CNX", "XCN", "CEFS", "CRS", "MN", "POINTS", "CRTM", "CVCOIN", "CCT", "AUTO", "QBT", "CTKN", "CURE", "CRU", "XCS", "CC", "CMT", "CABS", "CVT", "CYDER", "CYG", "CYP", "FUNK", "DAC", "DADI", "BET", "GEN", "DAS", "DATX", "DRP", "DESI", "DFS", "DIM", "DIW", "DMT", "DNN", "MTC", "DOVU", "DRPU", "DRACO", "DAI", "DAN", "DAR", "PROD", "DEC", "DARK", "DISK", "MOOND", "DB", "DRKC", "DCC", "DETH", "DGDC", "DKC", "DANK", "DSB", "DT", "DRKT", "DNET", "DASC", "DASH", "DSH", "DTA", "DTT", "DTX", "DXT", "DTB", "DTC", "DTRC", "DAT", "DAV", "DAXX", "DTC", "DHT", "XNA", "DBC", "DBTC", "DEB", "DCT", "DBET", "MANA", "DML", "DUBI", "HST", "DCR", "DEEP", "DBC", "ONION", "DEA", "DEI", "DKD", "DPAY", "DCRE", "DNR", "DNO", "DENT", "DCN", "DFBT", "DERO", "DSR", "DES", "DTCT", "DTH", "DVC", "EVE", "DEV", "DMD", "DCK", "DIGS", "DGB", "DGC", "CUBE", "DEUR", "DIGIF", "DGM", "DGPT", "DGMS", "DPP", "DBG", "DDF", "DRS", "XDN", "DP", "WAGE", "DGD", "DGX", "DIG", "DIME", "DCY", "DIN", "XDQ", "DCC", "DIT", "DIVX", "DTC", "DXC", "DLISK", "NOTE", "DOC", "NRN", "DOCK", "DOGED", "DGORE", "XDP", "DOGE", "DLC", "DLR", "DRT", "DON", "DOPE", "DOR", "DOT", "BOAT", "Dow", "DRA", "DFT", "DRG", "XDB", "DRGN", "DRM8", "DREAM", "DRZ", "DRC", "DROP", "DRXNE", "DUB", "DBIC", "DBIX", "DUCK", "DUTCH", "DUX", "DYN", "DTR", "DTEM", "DBR", "ECC", "EDR", "EFL", "EB3", "EBC", "ECC", "ECO", "EDRC", "EGO", "EJAC", "ELTCOIN", "ENTRC", "EOS", "EPIK", "EQL", "EQ", "EQUI", "ERB", "ETS", "EGAS", "EUNO", "EXRN", "EZC", "EZM", "EZT", "EA", "EAGS", "EARTH", "EAC", "EMT", "ETKN", "EBZ", "EBS", "EKO", "EC", "ECOB", "EDDIE", "EDGE", "EDG", "LEDU", "EDU", "EDC", "EGG", "EGT", "EDO", "EMC2", "ELC", "XEL", "ELA", "ECA", "ELEC", "ETN", "EKN", "ELE", "ELM", "ELI", "ELI", "ELIX", "ELLA", "ELP", "ELLI", "ELT", "ELY", "ELS", "AEC", "EMB", "MBRS", "EMD", "EMC", "EMN", "EMIGR", "EPY", "EMPC", "EPY", "DNA", "ETT", "EDR", "ENE", "ETK", "TSL", "ENRG", "EGCC", "XNG", "ENG", "ENJ", "ENK", "ENTER", "ENTRP", "ENU", "EVN", "EQUAL", "EQT", "EQB", "EQM", "EFYT", "ERT", "ERO", "ERR", "ERY", "ESP", "ERT", "ESS", "XEC", "XET", "ENT", "EBET", "ETBS", "LEND", "ETHB", "EDT", "DOGETH", "ETL", "ESZ", "ETZ", "ECH", "ETH", "ETBT", "BLUE", "ECASH", "ETC", "ETHD", "ETG", "ETHM", "EMV", "ETHPR", "LNK", "BTCE", "ETF", "ELITE", "ETHS", "RIYA", "DICE", "FUEL", "ESC", "NEC", "HORSE", "ETHOS", "ET4", "EUC", "ERC", "EVN", "EVENT", "EVC", "EGC", "EVX", "IQ", "EVR", "EOC", "EVIL", "EXB", "XUC", "EXCC", "EXN", "EXCL", "EXE", "EXC", "EXIT", "EXP", "XP", "EXY", "EON", "EXTN", "XTRA", "XSB", "XT", "F16", "FARM", "FX", "FIBRE", "eFIC", "FLASH", "FLIK", "FLM", "FREE", "FT", "FC", "FACE", "FCT", "FAIR", "FAIR", "FAME", "XFT", "FCN", "FRD", "FST", "DROP", "FAZZ", "FTC", "TIPS", "FIL", "FILL", "FNTB", "FIND", "FIN", "NOM", "FTX", "FIRE", "FLOT", "FRC", "FFC", "1ST", "FIRST", "FRST", "FIST", "FIT", "FRV", "FLAP", "FLX", "FLVR", "FNP", "FLIXX", "FLO", "FLT", "FLUZ", "FLY", "FYP", "FLDC", "FLLW", "FNO", "FONZ", "FOOD", "FOPA", "FOR", "XFC", "FOREX", "FOTA", "FSBT", "FOXT", "FRAC", "FRN", "FRK", "FRWC", "FRAZ", "FGZ", "FRE", "FREC", "FSC", "FDZ", "FUCK", "FC2", "FJC", "NTO", "FLS", "FUNC", "FUN", "FUND", "FND", "FYN", "FSN", "FSN", "FUTC", "FTP", "FTW", "FTO", "FXT", "FUZZ", "GAIA", "GAKH", "GAT", "GBRC", "GTO", "GIN", "GIZ", "GMC", "GPU", "GSM", "GXS", "GNR", "ORE", "GES", "GLX", "GAM", "GMCN", "GTC", "GBT", "GML", "UNITS", "GX", "GAME", "FLP", "GNJ", "GAP", "GRLC", "GAS", "GEM", "GEMZ", "GXC", "GNX", "GVT", "XGS", "GSY", "GEN", "GEO", "GUNS", "GER", "SPKTR", "GHC", "GHOUL", "GIC", "GIFT", "GFT", "GIG", "GHS", "WTT", "GGS", "GIM", "GMR", "GOT", "GIVE", "GLA", "GLOBE", "GCR", "GJC", "GSC", "GTC", "BSTY", "GLC", "GLT", "GSI", "GSX", "GLYPH", "GNO", "xGOx", "GBX", "GO", "GOA", "GOAL", "GOAT", "GPL", "GRX", "GB", "GLD", "MNTP", "GP", "XGR", "GEA", "XGB", "GMX", "GNT", "GOLF", "GOLOS", "GBG", "GOOD", "GOOD", "GOON", "BUCKS", "GST", "GOTX", "GRFT", "GDC", "GAI", "GRAV", "GBIT", "GRE", "GRMD", "GEX", "GREXIT", "GRID", "GRC", "GRM", "GRID", "GMC", "GRS", "GRO", "GRWI", "GROW", "GRW", "GET", "GETX", "GCC", "GUE", "NLG", "GUN", "GUP", "GXC", "HELL", "PLAY", "HOLD", "HQX", "HODL", "HTML", "HTML5", "HKN", "HKG", "HAC", "HADE", "HALAL", "HLC", "HAL", "HALLO", "HALO", "HMT", "HAMS", "HION", "HPC", "HCC", "HRB", "HSC", "HGS", "XHV", "HAV", "HAT", "HZT", "HAZE", "HHEM", "WORM", "HB", "HEAT", "HVC", "HDG", "HEDG", "HEEL", "HYS", "HBZ", "HNC", "HGT", "HMP", "HERO", "HER", "HEX", "HXT", "HXX", "HMC", "XHI", "HPB", "HVCO", "AIMS", "HIRE", "HFT", "HTC", "HIVE", "HVN", "HBN", "HWC", "HOT", "HBC", "HONEY", "HZ", "HSP", "HYT", "HSR", "HBT", "HMQ", "HNC", "HUC", "HT", "HUR", "HUSH", "HOT", "HYDRO", "H2O", "HYPER", "HYP", "IHT", "I0C", "ICASH", "ICOO", "ICOS", "ICX", "ICST", "IDXM", "ILC", "ILCT", "IML", "INS", "IOC", "IOST", "IOT", "IOU", "IPSX", "IPC", "IRC", "IXC", "ROCK", "ICB", "ICOB", "ICON", "ICN", "IGNIS", "IC", "REX", "IMV", "IMX", "IMPCH", "IPC", "IMPS", "IN", "INPAY", "NKA", "INCNT", "INCP", "INC", "IDH", "IMS", "ERC20", "INDI", "IND", "IFX", "IFC", "XIN", "INF8", "IFLT", "INTO", "INFX", "INK", "XNK", "ILK", "$OUND", "INN", "INSN", "INSANE", "WOLF", "INSTAR", "ICC", "MINE", "INSUR", "IPL", "IQB", "ITT", "ITNS", "XID", "INT", "IOP", "INXT", "HOLD", "ITZ", "INV", "IFT", "INV", "IVZ", "INVOX", "ITC", "IOTX", "ION", "IRL", "ISL", "ITA", "ING", "IEC", "IVY", "IWT", "J8T", "JEX", "JIO", "JOY", "JPC", "JANE", "JNS", "JVY", "JC", "JET", "JWL", "JNT", "JIF", "JCR", "JINN", "JOBS", "J", "JOINT", "JOK", "XJO", "JOY", "JUDGE", "JBS", "JUMP", "JKC", "JDC", "KAAS", "KAT", "KEC", "KRC", "KREDS", "KWH", "KZC", "KLKS", "KAPU", "KBC", "KRB", "KRM", "KARMA", "KAYI", "KEK", "KEN", "KEP", "KC", "KETAN", "KEX", "KEY", "KICK", "KLC", "KIN", "KIND", "KING", "KNC", "MEOW", "KED", "KDC", "KNW", "KOBO", "KOLION", "KMD", "KORE", "KRAK", "KRONE", "KGC", "KRL", "KTK", "KR", "KBR", "KUBO", "KCS", "KURT", "KUSH", "KNC", "LA", "LBC", "LEO", "LGBTQ", "LHC", "LIFE", "LIPC", "LTBC", "LUX", "LALA", "LAB", "BAC", "TAU", "PIX", "LANA", "LTH", "LAT", "LATX", "LAZ", "LEPEN", "LEA", "LDC", "LEAF", "LGD", "LGD", "LGO", "LELE", "LEMON", "LCT", "LND", "LOAN", "LST", "LENIN", "LIR", "LVL", "LVG", "LEV", "XLC", "XLB", "LBA", "LXC", "LIGER", "LSD", "LIKE", "LIMX", "LTD", "LINDA", "LET", "LNC", "LINX", "LQD", "LSK", "LTCC", "LBTC", "LTG", "LTCU", "LCWP", "LTCR", "LDOGE", "LTB", "LTC", "LTCH", "LCP", "LCASH", "LCC", "LTCD", "LTCX", "LTS", "LTA", "LIVE", "LIV", "LIZ", "LWF", "LCS", "LOCI", "LOC", "LOC", "LGR", "LOKI", "LMC", "LOOK", "LOOM", "LRC", "LOT", "LYK", "LYL", "BASH", "LCK", "LK7", "LUCKY", "LKY", "LDM", "LUN", "LC", "LUX", "LYC", "LDN", "LKK", "LYM", "LYNX", "LYB", "MRK", "MCAP", "MCV", "MIS", "MMNXT", "MMO", "MMXVI", "MOS", "MUN", "MUSD", "YCE", "MAC", "MCRN", "MRV", "MDC", "ART", "MAG", "MGN", "MAG", "MAG", "MAID", "MMXIV", "MFT", "MSC", "MIV", "MKR", "MAT", "MANNA", "MAPC", "MAR", "MASP", "MRS", "MARS", "MXT", "MARV", "MARX", "MARYJ", "MSR", "MC", "MASS", "MGD", "MCAR", "MSC", "MM", "MTR", "MAN", "MTX", "MAX", "MYC", "MZC", "MBIT", "MLITE", "MDT", "MED", "MEDI", "MCU", "MDS", "MNT", "MPT", "MEDX", "MDC", "MEDIC", "MTN", "MED", "MPRO", "MEC", "MEGA", "XMS", "MLN", "MET", "MMC", "MRN", "MVP", "MER", "GMT", "MTL", "MTLM3", "METAL", "ETP", "MET", "AMM", "MDX", "MDT", "MUU", "MIL", "MILO", "MNC", "MG", "MND", "MIC", "MINT", "MIO", "MIN", "MNE", "MRT", "MNM", "MINEX", "MNX", "MAT", "MNTS", "MINT", "MITH", "XIN", "CHF", "EMGO", "MGO", "MOBI", "MTRC", "MDL", "MOD", "MDA", "MOIN", "MOJO", "TAB", "MONA", "MCO", "MNZ", "XMR", "ZMR", "XMC", "XMRG", "XMO", "XMV", "MONETA", "MCN", "MUE", "MTH", "MNB", "MONEY", "MRP", "MNY", "MONK", "XMCC", "MBI", "MBLC", "MOON", "MITX", "MRPH", "MRP", "MZX", "MOAT", "MSP", "XMN", "MTN", "MOTO", "MTK", "MRSA", "MUDRA", "MLT", "MWC", "MBT", "MRY", "MUSE", "MUSIC", "MCI", "MST", "MUT", "MBC", "MYB", "MT", "WISH", "MT", "XMY", "MYST", "MYST", "NANJ", "XEM", "NEO", "NEOG", "NEXO", "NOX", "NIX", "NKN", "NOAH", "CHFN", "EURN", "NOKU", "NPC", "NVST", "NXE", "NXTI", "NXTTY", "NYX", "NFN", "NGC", "NKT", "NMC", "NAMO", "NANO", "NAN", "NPX", "NAS2", "NAUT", "NAV", "NAVI", "NEBL", "NEBU", "NBAI", "NAS", "NDC", "NEF", "NEC", "NEOS", "NTCC", "NBIT", "NET", "NTM", "NETKO", "NTWK", "NETC", "NEU", "NEU", "NRO", "NRC", "NTK", "NTRN", "NEVA", "NDC", "NIC", "NYC", "NZC", "NEWB", "NCP", "NXC", "NEXT", "NXS", "NICE", "NIHL", "NMB", "NIMFA", "NET", "NTC", "NDOGE", "NBR", "NBC", "NLC", "NLC2", "NOBL", "NODE", "NRB", "NRS", "NOO", "NVC", "NWCN", "NBX", "NBT", "NSR", "NUBIS", "NCASH", "NUKE", "NKC", "NLX", "NULS", "N7", "NUM", "NMR", "XNC", "NMS", "NXT", "NYAN", "NBL", "ODE", "ODMC", "OK", "OKOIN", "OPC", "OPP", "ORS", "OBITS", "OBS", "ODN", "OCL", "OTX", "OCTO", "OCTO", "OCN", "ODNT", "OLDSF", "OLV", "OLYMP", "MOT", "OMA", "OMGC", "OMG", "OMNI", "OMC", "ONL", "OLT", "RNT", "ONX", "OIO", "ONT", "XPO", "OPAL", "OPEN", "OTN", "OAX", "OSC", "ZNT", "OPES", "OPP", "OSA", "OPTION", "OPT", "OCT", "OC", "ORB", "RDC", "ORGT", "ORI", "TRAC", "OCC", "ORLY", "ORME", "ORO", "OROC", "OS76", "OWD", "ZXC", "OXY", "PRL", "OYS", "SHL", "GENE", "PAT", "PAXEX", "PQT", "PAI", "PHI", "PITCH", "PLNC", "PROUD", "PF", "PSI", "PWR", "PX", "PCS", "PBC", "$PAC", "PAK", "PLMT", "PND", "PINKX", "PAN", "PRP", "PRG", "DUO", "PARA", "PARETO", "PKB", "PAR", "PART", "PASC", "PASL", "PAS", "PTOY", "PAVO", "XPY", "PYC", "PFR", "PAYP", "PPP", "PYP", "PYN", "CON_", "PMNT", "PYT", "PEC", "XPB", "PCL", "PCO", "PCN", "PPC", "GUESS", "PPY", "PGC", "PEN", "PNT", "PTA", "PNY", "MAN", "MEME", "PEPECASH", "PIE", "PERU", "PTC", "PSB", "PTR", "XPD", "PXL", "SOUL", "PNX", "XPH", "PHS", "PXC", "PHR", "PHO", "PHR", "PGN", "PIGGY", "PKC", "PLR", "PINK", "PCOIN", "PIO", "SKULL", "PIRL", "PIZZA", "PLANET", "PLC", "PNC", "XPTX", "LUC", "PKT", "PLX", "PLURA", "PLC", "PLUS1", "PTC", "PLU", "POE", "POS", "POA", "XPS", "XPOKE", "POKER", "XPST", "PAL", "POLIS", "POLY", "NCT", "PLBT", "POLY", "XSP", "POP", "PPT", "PEX", "PSD", "POSQ", "TRON", "POST", "POT", "POWR", "PRE", "PRE", "HILL", "PRES", "PBT", "PST", "PXI", "PRIME", "XPM", "PRX", "PRM", "PIVX", "PRIX", "PZM", "XPRO", "PROC", "PCM", "PHC", "PDC", "JTX", "PAI", "OMX", "ZEPH", "PRFT", "PROPS", "PTC", "PRO", "VRP", "PGL", "PRC", "PROTON", "PTS", "XES", "PSEUD", "PSY", "PBL", "PULSE", "PMA", "NPXS", "PUPA", "PURA", "PURE", "VIDZ", "PGT", "PURK", "PRPS", "HLP", "PUSHI", "PUT", "PYLNT", "QLC", "QTUM", "QBT", "QORA", "QBK", "QSP", "QAU", "QRL", "Q1S", "QKC", "QRK", "QTZ", "QTL", "QCN", "Q2C", "QBC", "QSLV", "QUN", "QASH", "XQN", "QVT", "QWARK", "QWC", "RFL", "KRX", "RAC", "RHOC", "RCN", "REAL", "REBL", "MWAT", "RST", "REM", "RGC", "ROI", "ROS", "RADI", "RADS", "RDN", "RDN", "RAP", "RTE", "XRA", "RATIO", "RAVE", "RVN", "RZR", "RCT", "REA", "RCC", "RRT", "RPX", "RCX", "RED", "RDD", "REDN", "REE", "REF", "RFR", "REC", "RLX", "REL", "RPM", "RNDR", "RNS", "BERRY", "REPO", "REN", "REPUX", "REQ", "RMS", "RBIT", "RNC", "R", "REV", "RVR", "XRE", "RHEA", "XRL", "RBR", "RICE", "RIDE", "RIC", "RBT", "RING", "RIPO", "RCN", "RIPT", "RBX", "RISE", "RVT", "RAC", "PUT", "RAC", "ROX", "RKT", "ROK", "ROCK", "RPC", "ROOT", "ROOTS", "RT2", "ROUND", "ROE", "RKC", "RYC", "ROYAL", "RYCN", "RBIES", "RUBY", "RUBIT", "RBY", "RUFF", "RUPX", "RUP", "RC", "RMC", "RUST", "RUSTBITS", "RYO", "S8C", "SABR", "SAR", "XSH", "SMNX", "SNM", "SXDT", "SXUT", "SPICE", "SSV", "STAC", "STEX", "STK", "STS", "XSTC", "SAFE", "SAFEX", "SFE", "SFR", "SAF", "SAGA", "SFU", "SKB", "SKR", "SAL", "SALT", "SLS", "SMSR", "SND", "SAN", "SPN", "XAI", "SAT", "STV", "MAD", "SAT2", "STO", "SANDG", "SVD", "SWC", "SCOOBY", "SCORE", "SCOR", "SCR", "SCOT", "SCRL", "DDD", "SCRPT", "SCT", "SRT", "SCRT", "SRC", "SEEDS", "B2X", "SEL", "KEY", "SSC", "SEM", "SDRN", "SNS", "SENSE", "SEN", "SENT", "SENC", "UPP", "SEQ", "SERA", "SRNT", "SET", "SETH", "SP", "SXC", "SHA", "SHADE", "SDC", "SS", "SSS", "SHR", "SAK", "SHP", "JEW", "SHLD", "SHIFT", "SH", "SHIP", "SHORTY", "SHOW", "SHPING", "SHREK", "SC", "SIB", "SGL", "SIG", "SGN", "SIGT", "SNTR", "SILK", "OST", "SPLB", "SIGU", "SNGLS", "AGI", "SRN", "SKC", "SKIN", "SKRP", "SKR", "SKM", "SKB", "SKY", "SLX", "SLM", "SLING", "SIFT", "SMART", "SMART", "SMC", "SLT", "SMT", "SMLY", "SMF", "SNIP", "SNOV", "XSG", "SOAR", "SMAC", "SMT", "SEND", "SOCC", "XBOT", "SCL", "SOIL", "SOJ", "SOL", "SDAO", "SLR", "CELL", "SFC", "XLR", "SOLE", "SCT", "SONG", "SSD", "SOON", "SPHTX", "SNK", "SOUL", "SPX", "SCASH", "SPC", "SPACE", "SPA", "SPANK", "SPK", "SPEC", "SPX", "XSPEC", "SPEND", "SPHR", "XID", "SPC", "SPD", "SPN", "SPORT", "SPF", "SPT", "SPOTS", "SPR", "SPRTS", "SQP", "SQL", "XSI", "SBC", "STCN", "XSN", "STA", "STHR", "STALIN", "STC", "STR", "STAR", "SRC", "STT", "STAR", "START", "STA", "STP", "SQOIN", "SNT", "STAX", "XST", "PNK", "STEEM", "SBD", "XLM", "XTL", "STN", "STEPS", "SLG", "SPD", "STOCKBET", "SCC", "STQ", "STORJ", "SJCX", "STORM", "STX", "STAK", "SISA", "STRAT", "SSH", "DATA", "SHND", "SUB", "SUB", "SUCR", "SGR", "SUMO", "SNC", "SSTC", "SUP", "SBTC", "SUPER", "UNITY", "M1", "SPM", "RMT", "SUR", "SCX", "BUCKS", "SWT", "SWM", "SWARM", "SWEET", "SWFTC", "SWING", "SCN", "CHSB", "SRC", "SIC", "SWTH", "SDP", "SYNC", "MFG", "SYC", "SYNX", "AMP", "SNRG", "SYS", "TBT", "BAR", "TDFB", "TFD", "TKY", "TOA", "TPC", "XTROPTIONS", "TAG", "TAJ", "TAK", "TKLN", "TAM", "XTO", "TTT", "TAP", "TGT", "TAT", "TSE", "TEC", "TEAM", "TECH", "THS", "TEK", "TEL", "GRAM", "TELL", "PAY", "TENNET", "TERN", "TRN", "TRC", "TER", "TESLA", "TES", "USDT", "TRA", "XTZ", "THNX", "0xDIARY", "ABYSS", "EFX", "TFC", "THC", "XVE", "CHIEF", "GCC", "VIG", "TCR", "MAY", "THETA", "TAGR", "THRT", "TSC", "TIA", "TDX", "TNT", "TIE", "TGC", "TIG", "XTC", "TIME", "TNB", "TME", "TMC", "TIO", "TIP", "TIT", "TBAR", "TTC", "TMT", "TODAY", "TAAS", "TKN", "TCT", "TDS", "TPAY", "ACE", "TBX", "TEN", "TKS", "TKA", "TOK", "TOKC", "TOM", "TOMO", "TOR", "TOT", "BBC", "MTN", "TRCT", "TIO", "TDZ", "TRAK", "TX", "TBCX", "TRV", "TT", "TRF", "TMT", "TZC", "TRIA", "TRI", "TRIBE", "TRICK", "TRDT", "TRIG", "TNC", "TRIP", "TRVC", "TRW", "TPG", "TPAY", "TKN", "TROLL", "TRX", "TRK", "TRCK", "TFL", "TUSD", "TDP", "TGAME", "TIC", "TRUMP", "TRST", "TRUST", "TLP", "TUR", "TRTL", "TUT", "TWLV", "TWIST", "UUU", "UCASH", "UCN", "UCT", "UFO", "XUP", "UR", "USDC", "USOAMIC", "UBC", "UBEX", "UBQ", "UBIQ", "U", "USC", "UTC", "XUN", "ULTC", "UMC", "UNC", "UNAT", "UNB", "UNF", "UBT", "CANDY", "USX", "UNIFY", "UKG", "UNIQ", "USDE", "UAEC", "UTT", "UBTC", "UIS", "UTN", "UTNP", "UNIT", "UNRC", "UNI", "UNO", "UP", "UFR", "UQC", "URALS", "URO", "UETL", "UET", "UTH", "UTIL", "OOT", "UTK", "UWC", "VIDT", "VEGA", "VIBE", "VIP", "VITE", "VIVO", "VLUX", "VVI", "VLD", "VAL", "VLR", "VANY", "VPRC", "VAPOR", "VLTC", "XVC", "VEN", "VEC2", "VLX", "VLT", "VRA", "VNT", "XVG", "VRC", "VME", "CRED", "VERI", "VRM", "VRS", "VERSA", "VTC", "VTX", "VST", "VZT", "VIA", "VIB", "VIT", "VTY", "VIC", "VID", "VDO", "VIEW", "VIN", "VIOR", "VIRAL", "VUC", "VTA", "XVP", "VMC", "VISIO", "VITAE", "VIU", "VOISE", "VTN", "VOOT", "VOT", "VOYA", "VSX", "VTR", "VULC", "W3C", "WAB", "WIN", "WMC", "WRT", "WABI", "WGR", "WTC", "WAN", "WAND", "WRC", "WARP", "WASH", "WAVES", "WCT", "WGO", "WNET", "WAY", "WSX", "WPR", "WT", "WEALTH", "WEB", "WELL", "WEX", "WHL", "WC", "XWC", "WIC", "WIIX", "WBB", "WILD", "WINS", "LIF", "WINE", "WINGS", "WINK", "WISC", "WSC", "WSH", "WISH", "WLK", "WOMEN", "LOG", "WCG", "WGC", "XWT", "WBTC", "WDC", "WOP", "WRC", "WAX", "WYR", "WYS", "XRED", "XC", "X2", "X8X", "XCO", "XDE2", "XDNA", "XG", "XMX", "XRP", "XUEZ", "XXX", "XYO", "XNX", "XAU", "XAUR", "XCASH", "XCEL", "XNC", "XEN", "XNN", "MI", "XDCE", "XIOS", "XT3", "XBY", "YAY", "YAC", "YMC", "YBC", "YEE", "YES", "YOC", "YOVI", "U42", "YOYOW", "YUM", "Z2", "ZAB", "ZCC", "ZEC", "ZECD", "ZCG", "ZCL", "XZC", "ZINC", "ZIX", "ZLQ", "ZMN", "ZSE", "ZAP", "ZYD", "ZXT", "NZL", "ZCO", "ZED", "ZPT", "ZEIT", "ZEL", "ZEN", "ZEN", "ZENI", "ZNA", "ZER", "ZSC", "ZET2", "ZET", "ZSC", "ZRC", "ZBC", "ZIL", "ZIPT", "ZOI", "ZNE", "ZOOM", "ZRC", "ZUP", "ZUR", "AXP", "ELF", "BITCNY", "BITGOLD", "BITSILVER", "BITUSD", "DCS", "DNT", "ECHT", "EBIT", "EBTC", "EBCH", "EBST", "ELTC2", "DEM", "ePRX", "EREAL", "EXMR", "EOSDAC", "FDX", "GCN", "IBANK", "DEAL", "ICE", "IETH", "RLC", "ILT", "IW", "IXT", "ITM", "ONG", "redBUX", "UGC", "VSL", "WBTC"];
			var validcurrs = ["AED", "AFN", "ALL", "AMD", "AOA", "ARS", "AUD", "AZN", "BAM", "BBD", "BDT", "BGN", "BHD", "BIF", "BND", "BOB", "BRL", "BSD", "BTN", "BWP", "BYN", "CAD", "CHF", "CLP", "CNY", "COP", "COU", "CRC", "CUC", "CZK", "DKK", "DOP", "DZD", "EGP", "ETB", "EUR", "GBP", "GEL", "GHS", "GIP", "GTQ", "HKD", "HNL", "HRK", "HUF", "IDR", "ILS", "INR", "IQD", "IRR", "ISK", "JMD", "JOD", "JPY", "KES", "KGS", "KHR", "KRW", "KWD", "KZT", "LBP", "LKR", "LSL", "MAD", "MDL", "MGA", "MMK", "MOP", "MUR", "MVR", "MWK", "MXN", "MYR", "MZN", "NAD", "NGN", "NIO", "NOK", "NPR", "NZD", "OMR", "PAB", "PEN", "PGK", "PHP", "PKR", "PLN", "PYG", "QAR", "RON", "RSD", "RUB", "RWF", "SAR", "SCR", "SEK", "SGD", "SHP", "SSP", "STN", "SVC", "SZL", "THB", "TMT", "TND", "TOP", "TRY", "TTD", "TWD", "TZS", "UAH", "UGX", "USD", "UYU", "UZS", "VEF", "VND", "VUV", "XAF", "XAG", "XAU", "XBB", "XBC", "XOF", "XPD", "XXX", "ZAR", "ZMW"];

			if (!validcryptos.includes(document.getElementById("asset").value)) {
				error = "Select a valid asset.";
			}
			if (!validcurrs.includes(document.getElementById("currency").value)) {
				error = "Select a valid currency you bought the asset with.";
			}
			if (!isNumeric(document.getElementById("price").value)) {
				error = "Please enter a valid number in the 'Price' field. Use a dot (.) as delimiter.";
			}
			if (!isNumeric(document.getElementById("amount").value)) {
				error = "Please enter a valid number in the 'Amount' field. Use a dot (.) as delimiter.";
			}
			if (!isValidDate(document.getElementById("datepicker").value)) {
				error = "Pick a valid date you bough the asset at. Use the format mm/dd/yyyy.";
			}

			if (error.length > 0) {
				document.getElementById("error").innerHTML = "<font color=\"#ff0000\">Error: " + error + "</font>";
			}

			if (error.length == 0) {
				if (window.XMLHttpRequest) {
					xmlhttp = new XMLHttpRequest();
				} else {
					xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
				}

				var api_url = "https://min-api.cryptocompare.com/data/price?fsym=" + document.getElementById("currency").value + "&tsyms=USD";

				xmlhttp.open("GET", api_url, false);
				xmlhttp.send();

				if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
					var price = xmlhttp.responseText.split(':')[1].replace("}", "");

					var transaction = "";

					if (document.getElementById("buy").checked) {
						transaction = (count_investments + 1).toString() + ":" + document.getElementById("datepicker").value + ":BUY:" + document.getElementById("asset").value + ":" + (document.getElementById("price").value * price).toFixed(8) + ":" + document.getElementById("amount").value + ":";
					} else {
						transaction = (count_investments + 1).toString() + ":" + document.getElementById("datepicker").value + ":SELL:" + document.getElementById("asset").value + ":" + (document.getElementById("price").value * price).toFixed(8) + ":" + document.getElementById("amount").value + ":";
					}

					var updateallocation1 = "";

					assetsArray.pop();

					if (document.getElementById("buy").checked) {
						assetsArray.push(document.getElementById("asset").value);
						amountsArray.push(document.getElementById("amount").value);
					}

					//updateallocation1 = Object.entries(assetsArray.reduce((m, o, i) => (m[o] = m.hasOwnProperty(o) ? m[o] + parseFloat(amountsArray[i]) : parseFloat(amountsArray[i]), m), {})).map(([key, value]) => `${key}:${value}`).join(':');

					var amounts_ = [];

					for (i = 0; i < amountsArray.length; i++) {
						amounts_.push(parseFloat(amountsArray[i]));
					}

					const sumObject = amounts_.reduce((acc, e, i, arr) => {
							acc[assetsArray[i]] = (acc[assetsArray[i]] || 0) + e;
							return acc;
						}, {});

					updateallocation1 = Object.entries(sumObject).map(el => el[0] + ":" + el[1]).join(":").replace(":undefined:NaN", "");

					var url = "../dbconnect.php?uid=" + user.uid + "&transaction=" + investments.replace(" ", "") + transaction + "&updateallocation1=" + updateallocation1;

					xmlhttp.open("GET", url, false);
					xmlhttp.send();

					if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
						location.reload();
					}
				}
			}
		}
	});
}

var trash = 0;

function deletetransaction(number) {
	trash++;

	if (trash == 1) {
		document.getElementById("trash" + number).style.visibility = "visible";
	} else if (trash == 2) {
		firebase.auth().onAuthStateChanged(user => {
			var todelete = assetsArray[number - 1] + ":" + amountsArray[number - 1];

			var colon_counter = 0;

			var startIndex = 0;
			var endIndex = 0;

			for (i = 0; i < numbers.length; i++) {
				if (numbers[i] == number) {
					startIndex = investments.indexOf(numbers[i] + ":" + dates[i]);
					//console.log(numbers[i] + ":" + dates[i]);
				}
			}

			for (i = 0; i < investments.length; i++) {
				if (investments.charAt(i) == ":") {
					colon_counter++;
				}
				if (colon_counter % 6 == 0 && colon_counter != 0 && i > startIndex) {
					endIndex = i;
					break;
				}
			}

			console.log(number);
			/*if (startIndex == -1) {
			for (i = 0; i < 200; i++) {
			console.log(dates);
			if (investments.indexOf((endIndex).toString() + ":" + dates[number - i]) != -1) {
			console.log((endIndex).toString() + ":" + dates[number - i]);
			startIndex = investments.indexOf((endIndex).toString() + ":" + dates[number - i]);
			break;
			}
			}
			}*/

			//console.log(startIndex);

			//endIndex--;

			//console.log(endIndex);

			colon_counter = 0;

			for (i = 0; i < investments.length; i++) {
				if (investments.charAt(i) == ":") {
					colon_counter++;
				}
			}

			investments = investments.replace(investments.substring(startIndex, endIndex), "");

			if (investments.charAt(0) == ":") {
				investments = investments.substr(1);
			}

			if (investments.includes("::")) {
				investments = investments.replace("::", ":");
			}
			console.log(investments);
			//"&updateallocation1=" + updateallocation1;


			var investmentsArray = investments.split(":");

			assetsArray = [];
			amountsArray = [];

			actionsArray = [];

			for (i = 0; i < investmentsArray.length; i++) {
				if (i % 3 == 0 && i != 0) {
					if (!((investmentsArray[i] >> 0) > 0) && investmentsArray[i - 1] == "BUY") {
						assetsArray.push(investmentsArray[i]);
					}
				}
				if (i % 2 == 0 && i != 0) {
					if (!(investmentsArray[i] >> 0) > 0) {
						if (investmentsArray[i] == "BUY") {
							actionsArray.push(investmentsArray[i]);
							amountsArray.push(investmentsArray[i + 3].replace(" ", ""));
						} else {
							actionsArray.push("SELL");
							buyPricesArray.push(undefined);
							//amountsArray.push(0);
						}
					}
				}
			}

			//assetsArray.pop();

			var updateallocation1 = "";

			var amounts_ = [];

			for (i = 0; i < amountsArray.length; i++) {
				amounts_.push(parseFloat(amountsArray[i]));
			}

			const sumObject = amounts_.reduce((acc, e, i, arr) => {
					acc[assetsArray[i]] = (acc[assetsArray[i]] || 0) + e;
					return acc;
				}, {});

			updateallocation1 = Object.entries(sumObject).map(el => el[0] + ":" + el[1]).join(":").replace(":undefined:NaN", "");

			//console.log(updateallocation1);

			if (colon_counter <= 6) {
				url = "../dbconnect.php?uid=" + user.uid + "&transaction=\"" + investments + "\"" + "&updateallocation1=\"" + updateallocation1 + "\"";
			} else {
				url = "../dbconnect.php?uid=" + user.uid + "&transaction=" + investments + "" + "&updateallocation1=" + updateallocation1;
			}
			//console.log(url);
			xmlhttp.open("GET", url, false);
			xmlhttp.send();

			if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
				location.reload();
			}
		});
	}
}

var colon_counter = 0;

var startIndex = 0;
var endIndex = 0;

var asset2 = "";
var price2 = "";
var currency2 = "";
var action2 = "";
var amount2 = "";
var datepicker2 = "";

var edit = 0;
var number_ = 0;

function edittransaction(number) {
	if (edit == 0) {
		$('#dialog').dialog('open');

		number_ = number;

		for (i = 0; i < numbers.length; i++) {
			if (numbers[i] == number) {
				startIndex = investments.indexOf(numbers[i] + ":" + dates[i]);

				$('#asset2').val(assetsArray[i]);
				$('#price2').val(buyPricesArray[i]);
				$('#currency2').val("USD");

				if (actionsArray[i] == "BUY") {
					$('#buy2').prop('checked', true);
				} else {
					$('#sell2').prop('checked', true);
				}

				$('#amount2').val(amountsArray[i]);
				$('#datepicker2').val(dates[i]);
			}
		}

		for (i = 0; i < investments.length; i++) {
			if (investments.charAt(i) == ":") {
				colon_counter++;
			}
			if (colon_counter % 6 == 0 && colon_counter != 0 && i > startIndex) {
				endIndex = i;
				break;
			}
		}

		//console.log(investments.substring(startIndex, endIndex));
	} else if (edit == 1) {
		firebase.auth().onAuthStateChanged(user => {
			console.log(startIndex);
			console.log(endIndex);

			var old_string = investments.substring(startIndex, endIndex);

			investments = investments.replace(old_string, number_ + ":" + datepicker2 + ":" + action2 + ":" + asset2 + ":" + price2 + ":" + amount2);

			var investmentsArray = investments.split(":");

			assetsArray = [];
			amountsArray = [];

			actionsArray = [];

			for (i = 0; i < investmentsArray.length; i++) {
				if (i % 3 == 0 && i != 0) {
					if (!((investmentsArray[i] >> 0) > 0) && investmentsArray[i - 1] == "BUY") {
						assetsArray.push(investmentsArray[i]);
					}
				}
				if (i % 2 == 0 && i != 0) {
					if (!(investmentsArray[i] >> 0) > 0) {
						if (investmentsArray[i] == "BUY") {
							actionsArray.push(investmentsArray[i]);
							amountsArray.push(investmentsArray[i + 3].replace(" ", ""));
						} else {
							actionsArray.push("SELL");
							buyPricesArray.push(undefined);
							//amountsArray.push(0);
						}
					}
				}
			}

			//assetsArray.pop();

			var updateallocation1 = "";

			var amounts_ = [];

			for (i = 0; i < amountsArray.length; i++) {
				amounts_.push(parseFloat(amountsArray[i]));
			}

			console.log(investmentsArray);
			console.log(assetsArray);
			console.log(amounts_);

			const sumObject = amounts_.reduce((acc, e, i, arr) => {
					acc[assetsArray[i]] = (acc[assetsArray[i]] || 0) + e;
					return acc;
				}, {});

			updateallocation1 = Object.entries(sumObject).map(el => el[0] + ":" + el[1]).join(":").replace(":undefined:NaN", "");

			//console.log(updateallocation1);

			if (colon_counter <= 6) {
				url = "../dbconnect.php?uid=" + user.uid + "&transaction=\"" + investments + "\"" + "&updateallocation1=\"" + updateallocation1 + "\"";
			} else {
				url = "../dbconnect.php?uid=" + user.uid + "&transaction=" + investments + "" + "&updateallocation1=" + updateallocation1;
			}

			xmlhttp.open("GET", url, false);
			xmlhttp.send();

			if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
				location.reload();
			}
		});
	}
}

function getDialog(asset, price, currency, action, amount, datepicker) {
	var error = "";

	var validcryptos = ["42", "300", "365", "404", "611", "808", "888", "1337", "2015", "ARC", "CLUB", "7", "ZCN", "ZRX", "0xBTC", "BIT16", "MCT", "1CR", "CHAO", "2BACCO", "2GIVE", "32BIT", "3DES", "8BT", "8BIT", "ATKN", "RTB", "ABC", "AC3", "ACT", "ACOIN", "AEON", "AIC", "AIDOC", "AIT", "XAI", "AITT", "AXT", "ALX", "ALIS", "ALT", "AMBT", "AMIS", "ANTS", "APIS", "ARE", "ARK", "ARNA", "ATB", "ATCC", "ATFS", "ATL", "ATM", "AUC", "AXR", "AXS", "ABJ", "ABS", "ACC", "ACCO", "AEC", "ACES", "ACT", "ACH", "ACID", "OAK", "ACTN", "AMT", "ACC", "ADX", "ADT", "ADM", "ADB", "ADL", "ADH", "ADST", "ABT", "AIB", "ADZ", "AGS", "AERM", "AERO", "AM", "ARN", "AE", "AET", "AGRS", "DLT", "AHT", "AID", "ADN", "ADK", "AIX", "AION", "AST", "AIR", "AIR", "AKA", "ALEX", "PLM", "ALG", "ALN", "SOC", "ASAFE2", "APC", "ALPS", "ALF", "ACAT", "ALQO", "ALTCOM", "ALTOCAR", "AMBER", "AMB", "AMC", "AMX", "AMMO", "AMO", "AMN", "AMS", "AMY", "ANCP", "ANAL", "ACP", "AND", "ANGL", "AVH", "ANI", "ANK", "ANC", "RYZ", "ANTI", "ANTC", "CPX", "APEX", "APH", "APPC", "APT", "APX", "ARCO", "AR", "ALC", "ANT", "ARBI", "ARB", "ARCT", "ABT", "ARCH", "ARC", "ARDR", "ARENA", "ARG", "ARGUS", "ARI", "ARO", "BOTS", "ARM", "ARPA", "ABY", "ARTE", "ATX", "AUA", "ASN", "XAS", "AC", "ADCN", "AST", "ASTRO", "ATH", "ATMOS", "ATOM", "ATMI", "AUC", "ADC", "REP", "AURS", "AURA", "AOA", "AUR", "AUN", "ATS", "NIO", "AUT", "ATM", "AVL", "AVA", "AV", "AVT", "AOP", "AVE", "ACN", "AXIOM", "AXYS", "AZART", "B2B", "B3", "KB3", "BAX", "BAM", "BANCA", "BKX", "BBN", "BERN", "BEX", "BFT", "VEE", "BMT", "BOOM", "BOS", "BQC", "BRAT", "BTCL", "BTCM", "BAN", "BKC", "NANAS", "BNT", "B@", "BNK", "BCOIN", "BBN", "BBCC", "BASHC", "BAT", "BTA", "BCX", "BSTK", "SAND", "BRDD", "XBTS", "BVC", "BEE", "BFDT", "BELA", "BBI", "BMK", "BNC", "BEN", "BENJI", "BEST", "KNG", "BET", "BTRM", "BETR", "BETT", "BZNT", "BEZ", "BBP", "BIX", "BID", "BDP", "HUGE", "LFC", "BIGUP", "BBO", "BHC", "BIC", "BLRY", "XBL", "BNB", "BRC", "BIOB", "BIO", "BIOS", "BTRN", "BIP", "BIS", "BAS", "BTB", "BAY", "BITB", "BBK", "BBT", "BOSS", "BRONZ", "BCD", "BEN", "BITCAR", "CAT", "COAL", "BCCOIN", "BCR", "BTCRY", "BCY", "BTCR", "BDG", "CSNO", "BFX", "FLIP", "FLX", "BTG", "HIRE", "STU", "BTLC", "LUX", "BTM", "BMX", "BTMI", "BM", "BITOK", "BTQ", "RNTB", "BIT", "BITX", "XSEED", "BSD", "BTE", "BSR", "BSTN", "BST", "SWIFT", "BXT", "TUBE", "VEG", "VOLT", "ZNY", "BTCA", "BAC", "BXC", "BTD", "BTDX", "BTCN", "BTC", "BCA", "CDY", "BCH", "BTCC", "BCD", "BTG", "BITG", "BTCH", "XBI", "BCI", "BTN", "BTPL", "BTCP", "BTCRED", "RBTC", "BCR", "BTCS", "BT2", "BTCS", "BTCD", "BTCE", "BCF", "BIFI", "BTF", "BTCGO", "XBC", "BTX", "BWS", "BTW", "BCX", "BTCZ", "BM", "BTX", "DARX", "BDL", "BT1", "BTCL", "BIM", "BMXT", "XPAT", "BQ", "BRO", "BTL", "BITSD", "BINS", "BTS", "BSX", "XBS", "BITS", "BWT", "BITZ", "BTZ", "XBP", "BLK", "BS", "BHC", "BMC", "BSTAR", "BLC", "BLAS", "BLAZR", "BLITZ", "XBP", "ARY", "CAT", "BCDN", "LNC", "BCPT", "BMH", "BLOCK", "BLOCKPAY", "BPL", "BCAP", "BLX", "BCT", "BTF", "BCIO", "BPT", "TIX", "BTT", "BNTN", "BLT", "CDT", "BLU", "BDR", "BLZ", "BNX", "BNB", "BOB", "BOT", "BOE", "BOG", "BOLD", "BLN", "BOLI", "BOMB", "BON", "BON", "BBR", "BOST", "BOSON", "BOTC", "CAP", "BTO", "BOU", "XBTY", "BNTY", "AHT", "BSC", "BOXY", "BRAIN", "BRD", "BRX", "BRK", "BRIA", "BBT", "BCO", "BRC", "BRIT", "BUBO", "BGL", "BT", "BULLS", "BWK", "BUN", "BURST", "BUZZ", "BYC", "BTE", "BCN", "GBYTE", "BTH", "BTM", "XCT", "CAIx", "CBD", "CCC", "CEDEX", "CEEK", "CETI", "CHIPS", "CINNI", "CLAM", "CO2", "CMS", "CPY", "COSS", "CPC", "MLS", "CMZ", "CAB", "CACH", "CF", "CALC", "CLO", "CAM", "CMPCO", "CAN", "CND", "CDN", "CCN", "XCI", "CANN", "XCD", "CAPP", "CPC", "CAR", "CTX", "CV", "CARBON", "ADA", "CARD", "CARE", "CARE", "CXO", "DIEM", "CTC", "CNBC", "CASH", "CBC", "CBC", "CASH", "CSH", "CAS", "CSC", "CSTL", "CAT1", "CVTC", "CAV", "CCO", "CEL", "CTR", "CNT", "CBS", "XCE", "CHC", "LINK", "CHAN", "CAG", "CHA", "CHARM", "CHAT", "CXC", "CHESS", "CHILD", "CHI", "CNC", "CHIP", "CHOOF", "DAY", "CRX", "CIN", "CND", "CIR", "COVAL", "CVC", "XCLR", "POLL", "CLV", "CHASH", "CLICK", "CLIN", "CLINT", "CLOAK", "CKC", "CLD", "CLOUT", "CLUD", "COE", "COB", "COX", "CTT", "CFC", "CFI", "COG", "COIN", "XMG", "BTTF", "C2", "CONI", "CET", "COFI", "XCJ", "CL", "LION", "MEE", "MEET", "XCM", "CPL", "CHP", "LAB", "CTIC", "COI", "CNO", "CNMT", "CXT", "XCXT", "COLX", "CLN", "CMT", "CBT", "CMM", "CDX", "COMM", "COC", "CMP", "COMP", "CPN", "CYC", "CNL", "RAIN", "CFD", "CJT", "CQST", "CNN", "CUZ", "COOL", "CCX", "XCPO", "CLR", "CORAL", "CORE", "COR", "CTXC", "CSMIC", "CMOS", "ATOM", "CMC", "COU", "XCP", "CHT", "COV", "COV", "CRAB", "CRACK", "CRC", "CRAFT", "CFTY", "CRAIG", "CRNK", "CRAVE", "CRAVE", "CZC", "CRM", "XCRE", "CREA", "CRDNC", "CRB", "CRE", "CRE", "CRDS", "CS", "CFT", "CREDO", "CREVA", "CROAT", "CMCT", "CRC", "CCOS", "YUP", "WIZ", "CRW", "CRC", "CRYPT", "CPT", "CRL", "CRPT", "XCR", "CTO", "CESC", "CIF", "TKT", "CWIS", "CWX", "C20", "CABS", "BUK", "CBX", "CCRB", "CIRC", "FCS", "CFT", "CHBR", "TKR", "CJ", "CJC", "LEU", "CPAY", "CRPS", "PING", "CS", "CWV", "CWXT", "CDX", "CGA", "CYT", "CIX", "CNX", "XCN", "CEFS", "CRS", "MN", "POINTS", "CRTM", "CVCOIN", "CCT", "AUTO", "QBT", "CTKN", "CURE", "CRU", "XCS", "CC", "CMT", "CABS", "CVT", "CYDER", "CYG", "CYP", "FUNK", "DAC", "DADI", "BET", "GEN", "DAS", "DATX", "DRP", "DESI", "DFS", "DIM", "DIW", "DMT", "DNN", "MTC", "DOVU", "DRPU", "DRACO", "DAI", "DAN", "DAR", "PROD", "DEC", "DARK", "DISK", "MOOND", "DB", "DRKC", "DCC", "DETH", "DGDC", "DKC", "DANK", "DSB", "DT", "DRKT", "DNET", "DASC", "DASH", "DSH", "DTA", "DTT", "DTX", "DXT", "DTB", "DTC", "DTRC", "DAT", "DAV", "DAXX", "DTC", "DHT", "XNA", "DBC", "DBTC", "DEB", "DCT", "DBET", "MANA", "DML", "DUBI", "HST", "DCR", "DEEP", "DBC", "ONION", "DEA", "DEI", "DKD", "DPAY", "DCRE", "DNR", "DNO", "DENT", "DCN", "DFBT", "DERO", "DSR", "DES", "DTCT", "DTH", "DVC", "EVE", "DEV", "DMD", "DCK", "DIGS", "DGB", "DGC", "CUBE", "DEUR", "DIGIF", "DGM", "DGPT", "DGMS", "DPP", "DBG", "DDF", "DRS", "XDN", "DP", "WAGE", "DGD", "DGX", "DIG", "DIME", "DCY", "DIN", "XDQ", "DCC", "DIT", "DIVX", "DTC", "DXC", "DLISK", "NOTE", "DOC", "NRN", "DOCK", "DOGED", "DGORE", "XDP", "DOGE", "DLC", "DLR", "DRT", "DON", "DOPE", "DOR", "DOT", "BOAT", "Dow", "DRA", "DFT", "DRG", "XDB", "DRGN", "DRM8", "DREAM", "DRZ", "DRC", "DROP", "DRXNE", "DUB", "DBIC", "DBIX", "DUCK", "DUTCH", "DUX", "DYN", "DTR", "DTEM", "DBR", "ECC", "EDR", "EFL", "EB3", "EBC", "ECC", "ECO", "EDRC", "EGO", "EJAC", "ELTCOIN", "ENTRC", "EOS", "EPIK", "EQL", "EQ", "EQUI", "ERB", "ETS", "EGAS", "EUNO", "EXRN", "EZC", "EZM", "EZT", "EA", "EAGS", "EARTH", "EAC", "EMT", "ETKN", "EBZ", "EBS", "EKO", "EC", "ECOB", "EDDIE", "EDGE", "EDG", "LEDU", "EDU", "EDC", "EGG", "EGT", "EDO", "EMC2", "ELC", "XEL", "ELA", "ECA", "ELEC", "ETN", "EKN", "ELE", "ELM", "ELI", "ELI", "ELIX", "ELLA", "ELP", "ELLI", "ELT", "ELY", "ELS", "AEC", "EMB", "MBRS", "EMD", "EMC", "EMN", "EMIGR", "EPY", "EMPC", "EPY", "DNA", "ETT", "EDR", "ENE", "ETK", "TSL", "ENRG", "EGCC", "XNG", "ENG", "ENJ", "ENK", "ENTER", "ENTRP", "ENU", "EVN", "EQUAL", "EQT", "EQB", "EQM", "EFYT", "ERT", "ERO", "ERR", "ERY", "ESP", "ERT", "ESS", "XEC", "XET", "ENT", "EBET", "ETBS", "LEND", "ETHB", "EDT", "DOGETH", "ETL", "ESZ", "ETZ", "ECH", "ETH", "ETBT", "BLUE", "ECASH", "ETC", "ETHD", "ETG", "ETHM", "EMV", "ETHPR", "LNK", "BTCE", "ETF", "ELITE", "ETHS", "RIYA", "DICE", "FUEL", "ESC", "NEC", "HORSE", "ETHOS", "ET4", "EUC", "ERC", "EVN", "EVENT", "EVC", "EGC", "EVX", "IQ", "EVR", "EOC", "EVIL", "EXB", "XUC", "EXCC", "EXN", "EXCL", "EXE", "EXC", "EXIT", "EXP", "XP", "EXY", "EON", "EXTN", "XTRA", "XSB", "XT", "F16", "FARM", "FX", "FIBRE", "eFIC", "FLASH", "FLIK", "FLM", "FREE", "FT", "FC", "FACE", "FCT", "FAIR", "FAIR", "FAME", "XFT", "FCN", "FRD", "FST", "DROP", "FAZZ", "FTC", "TIPS", "FIL", "FILL", "FNTB", "FIND", "FIN", "NOM", "FTX", "FIRE", "FLOT", "FRC", "FFC", "1ST", "FIRST", "FRST", "FIST", "FIT", "FRV", "FLAP", "FLX", "FLVR", "FNP", "FLIXX", "FLO", "FLT", "FLUZ", "FLY", "FYP", "FLDC", "FLLW", "FNO", "FONZ", "FOOD", "FOPA", "FOR", "XFC", "FOREX", "FOTA", "FSBT", "FOXT", "FRAC", "FRN", "FRK", "FRWC", "FRAZ", "FGZ", "FRE", "FREC", "FSC", "FDZ", "FUCK", "FC2", "FJC", "NTO", "FLS", "FUNC", "FUN", "FUND", "FND", "FYN", "FSN", "FSN", "FUTC", "FTP", "FTW", "FTO", "FXT", "FUZZ", "GAIA", "GAKH", "GAT", "GBRC", "GTO", "GIN", "GIZ", "GMC", "GPU", "GSM", "GXS", "GNR", "ORE", "GES", "GLX", "GAM", "GMCN", "GTC", "GBT", "GML", "UNITS", "GX", "GAME", "FLP", "GNJ", "GAP", "GRLC", "GAS", "GEM", "GEMZ", "GXC", "GNX", "GVT", "XGS", "GSY", "GEN", "GEO", "GUNS", "GER", "SPKTR", "GHC", "GHOUL", "GIC", "GIFT", "GFT", "GIG", "GHS", "WTT", "GGS", "GIM", "GMR", "GOT", "GIVE", "GLA", "GLOBE", "GCR", "GJC", "GSC", "GTC", "BSTY", "GLC", "GLT", "GSI", "GSX", "GLYPH", "GNO", "xGOx", "GBX", "GO", "GOA", "GOAL", "GOAT", "GPL", "GRX", "GB", "GLD", "MNTP", "GP", "XGR", "GEA", "XGB", "GMX", "GNT", "GOLF", "GOLOS", "GBG", "GOOD", "GOOD", "GOON", "BUCKS", "GST", "GOTX", "GRFT", "GDC", "GAI", "GRAV", "GBIT", "GRE", "GRMD", "GEX", "GREXIT", "GRID", "GRC", "GRM", "GRID", "GMC", "GRS", "GRO", "GRWI", "GROW", "GRW", "GET", "GETX", "GCC", "GUE", "NLG", "GUN", "GUP", "GXC", "HELL", "PLAY", "HOLD", "HQX", "HODL", "HTML", "HTML5", "HKN", "HKG", "HAC", "HADE", "HALAL", "HLC", "HAL", "HALLO", "HALO", "HMT", "HAMS", "HION", "HPC", "HCC", "HRB", "HSC", "HGS", "XHV", "HAV", "HAT", "HZT", "HAZE", "HHEM", "WORM", "HB", "HEAT", "HVC", "HDG", "HEDG", "HEEL", "HYS", "HBZ", "HNC", "HGT", "HMP", "HERO", "HER", "HEX", "HXT", "HXX", "HMC", "XHI", "HPB", "HVCO", "AIMS", "HIRE", "HFT", "HTC", "HIVE", "HVN", "HBN", "HWC", "HOT", "HBC", "HONEY", "HZ", "HSP", "HYT", "HSR", "HBT", "HMQ", "HNC", "HUC", "HT", "HUR", "HUSH", "HOT", "HYDRO", "H2O", "HYPER", "HYP", "IHT", "I0C", "ICASH", "ICOO", "ICOS", "ICX", "ICST", "IDXM", "ILC", "ILCT", "IML", "INS", "IOC", "IOST", "IOT", "IOU", "IPSX", "IPC", "IRC", "IXC", "ROCK", "ICB", "ICOB", "ICON", "ICN", "IGNIS", "IC", "REX", "IMV", "IMX", "IMPCH", "IPC", "IMPS", "IN", "INPAY", "NKA", "INCNT", "INCP", "INC", "IDH", "IMS", "ERC20", "INDI", "IND", "IFX", "IFC", "XIN", "INF8", "IFLT", "INTO", "INFX", "INK", "XNK", "ILK", "$OUND", "INN", "INSN", "INSANE", "WOLF", "INSTAR", "ICC", "MINE", "INSUR", "IPL", "IQB", "ITT", "ITNS", "XID", "INT", "IOP", "INXT", "HOLD", "ITZ", "INV", "IFT", "INV", "IVZ", "INVOX", "ITC", "IOTX", "ION", "IRL", "ISL", "ITA", "ING", "IEC", "IVY", "IWT", "J8T", "JEX", "JIO", "JOY", "JPC", "JANE", "JNS", "JVY", "JC", "JET", "JWL", "JNT", "JIF", "JCR", "JINN", "JOBS", "J", "JOINT", "JOK", "XJO", "JOY", "JUDGE", "JBS", "JUMP", "JKC", "JDC", "KAAS", "KAT", "KEC", "KRC", "KREDS", "KWH", "KZC", "KLKS", "KAPU", "KBC", "KRB", "KRM", "KARMA", "KAYI", "KEK", "KEN", "KEP", "KC", "KETAN", "KEX", "KEY", "KICK", "KLC", "KIN", "KIND", "KING", "KNC", "MEOW", "KED", "KDC", "KNW", "KOBO", "KOLION", "KMD", "KORE", "KRAK", "KRONE", "KGC", "KRL", "KTK", "KR", "KBR", "KUBO", "KCS", "KURT", "KUSH", "KNC", "LA", "LBC", "LEO", "LGBTQ", "LHC", "LIFE", "LIPC", "LTBC", "LUX", "LALA", "LAB", "BAC", "TAU", "PIX", "LANA", "LTH", "LAT", "LATX", "LAZ", "LEPEN", "LEA", "LDC", "LEAF", "LGD", "LGD", "LGO", "LELE", "LEMON", "LCT", "LND", "LOAN", "LST", "LENIN", "LIR", "LVL", "LVG", "LEV", "XLC", "XLB", "LBA", "LXC", "LIGER", "LSD", "LIKE", "LIMX", "LTD", "LINDA", "LET", "LNC", "LINX", "LQD", "LSK", "LTCC", "LBTC", "LTG", "LTCU", "LCWP", "LTCR", "LDOGE", "LTB", "LTC", "LTCH", "LCP", "LCASH", "LCC", "LTCD", "LTCX", "LTS", "LTA", "LIVE", "LIV", "LIZ", "LWF", "LCS", "LOCI", "LOC", "LOC", "LGR", "LOKI", "LMC", "LOOK", "LOOM", "LRC", "LOT", "LYK", "LYL", "BASH", "LCK", "LK7", "LUCKY", "LKY", "LDM", "LUN", "LC", "LUX", "LYC", "LDN", "LKK", "LYM", "LYNX", "LYB", "MRK", "MCAP", "MCV", "MIS", "MMNXT", "MMO", "MMXVI", "MOS", "MUN", "MUSD", "YCE", "MAC", "MCRN", "MRV", "MDC", "ART", "MAG", "MGN", "MAG", "MAG", "MAID", "MMXIV", "MFT", "MSC", "MIV", "MKR", "MAT", "MANNA", "MAPC", "MAR", "MASP", "MRS", "MARS", "MXT", "MARV", "MARX", "MARYJ", "MSR", "MC", "MASS", "MGD", "MCAR", "MSC", "MM", "MTR", "MAN", "MTX", "MAX", "MYC", "MZC", "MBIT", "MLITE", "MDT", "MED", "MEDI", "MCU", "MDS", "MNT", "MPT", "MEDX", "MDC", "MEDIC", "MTN", "MED", "MPRO", "MEC", "MEGA", "XMS", "MLN", "MET", "MMC", "MRN", "MVP", "MER", "GMT", "MTL", "MTLM3", "METAL", "ETP", "MET", "AMM", "MDX", "MDT", "MUU", "MIL", "MILO", "MNC", "MG", "MND", "MIC", "MINT", "MIO", "MIN", "MNE", "MRT", "MNM", "MINEX", "MNX", "MAT", "MNTS", "MINT", "MITH", "XIN", "CHF", "EMGO", "MGO", "MOBI", "MTRC", "MDL", "MOD", "MDA", "MOIN", "MOJO", "TAB", "MONA", "MCO", "MNZ", "XMR", "ZMR", "XMC", "XMRG", "XMO", "XMV", "MONETA", "MCN", "MUE", "MTH", "MNB", "MONEY", "MRP", "MNY", "MONK", "XMCC", "MBI", "MBLC", "MOON", "MITX", "MRPH", "MRP", "MZX", "MOAT", "MSP", "XMN", "MTN", "MOTO", "MTK", "MRSA", "MUDRA", "MLT", "MWC", "MBT", "MRY", "MUSE", "MUSIC", "MCI", "MST", "MUT", "MBC", "MYB", "MT", "WISH", "MT", "XMY", "MYST", "MYST", "NANJ", "XEM", "NEO", "NEOG", "NEXO", "NOX", "NIX", "NKN", "NOAH", "CHFN", "EURN", "NOKU", "NPC", "NVST", "NXE", "NXTI", "NXTTY", "NYX", "NFN", "NGC", "NKT", "NMC", "NAMO", "NANO", "NAN", "NPX", "NAS2", "NAUT", "NAV", "NAVI", "NEBL", "NEBU", "NBAI", "NAS", "NDC", "NEF", "NEC", "NEOS", "NTCC", "NBIT", "NET", "NTM", "NETKO", "NTWK", "NETC", "NEU", "NEU", "NRO", "NRC", "NTK", "NTRN", "NEVA", "NDC", "NIC", "NYC", "NZC", "NEWB", "NCP", "NXC", "NEXT", "NXS", "NICE", "NIHL", "NMB", "NIMFA", "NET", "NTC", "NDOGE", "NBR", "NBC", "NLC", "NLC2", "NOBL", "NODE", "NRB", "NRS", "NOO", "NVC", "NWCN", "NBX", "NBT", "NSR", "NUBIS", "NCASH", "NUKE", "NKC", "NLX", "NULS", "N7", "NUM", "NMR", "XNC", "NMS", "NXT", "NYAN", "NBL", "ODE", "ODMC", "OK", "OKOIN", "OPC", "OPP", "ORS", "OBITS", "OBS", "ODN", "OCL", "OTX", "OCTO", "OCTO", "OCN", "ODNT", "OLDSF", "OLV", "OLYMP", "MOT", "OMA", "OMGC", "OMG", "OMNI", "OMC", "ONL", "OLT", "RNT", "ONX", "OIO", "ONT", "XPO", "OPAL", "OPEN", "OTN", "OAX", "OSC", "ZNT", "OPES", "OPP", "OSA", "OPTION", "OPT", "OCT", "OC", "ORB", "RDC", "ORGT", "ORI", "TRAC", "OCC", "ORLY", "ORME", "ORO", "OROC", "OS76", "OWD", "ZXC", "OXY", "PRL", "OYS", "SHL", "GENE", "PAT", "PAXEX", "PQT", "PAI", "PHI", "PITCH", "PLNC", "PROUD", "PF", "PSI", "PWR", "PX", "PCS", "PBC", "$PAC", "PAK", "PLMT", "PND", "PINKX", "PAN", "PRP", "PRG", "DUO", "PARA", "PARETO", "PKB", "PAR", "PART", "PASC", "PASL", "PAS", "PTOY", "PAVO", "XPY", "PYC", "PFR", "PAYP", "PPP", "PYP", "PYN", "CON_", "PMNT", "PYT", "PEC", "XPB", "PCL", "PCO", "PCN", "PPC", "GUESS", "PPY", "PGC", "PEN", "PNT", "PTA", "PNY", "MAN", "MEME", "PEPECASH", "PIE", "PERU", "PTC", "PSB", "PTR", "XPD", "PXL", "SOUL", "PNX", "XPH", "PHS", "PXC", "PHR", "PHO", "PHR", "PGN", "PIGGY", "PKC", "PLR", "PINK", "PCOIN", "PIO", "SKULL", "PIRL", "PIZZA", "PLANET", "PLC", "PNC", "XPTX", "LUC", "PKT", "PLX", "PLURA", "PLC", "PLUS1", "PTC", "PLU", "POE", "POS", "POA", "XPS", "XPOKE", "POKER", "XPST", "PAL", "POLIS", "POLY", "NCT", "PLBT", "POLY", "XSP", "POP", "PPT", "PEX", "PSD", "POSQ", "TRON", "POST", "POT", "POWR", "PRE", "PRE", "HILL", "PRES", "PBT", "PST", "PXI", "PRIME", "XPM", "PRX", "PRM", "PIVX", "PRIX", "PZM", "XPRO", "PROC", "PCM", "PHC", "PDC", "JTX", "PAI", "OMX", "ZEPH", "PRFT", "PROPS", "PTC", "PRO", "VRP", "PGL", "PRC", "PROTON", "PTS", "XES", "PSEUD", "PSY", "PBL", "PULSE", "PMA", "NPXS", "PUPA", "PURA", "PURE", "VIDZ", "PGT", "PURK", "PRPS", "HLP", "PUSHI", "PUT", "PYLNT", "QLC", "QTUM", "QBT", "QORA", "QBK", "QSP", "QAU", "QRL", "Q1S", "QKC", "QRK", "QTZ", "QTL", "QCN", "Q2C", "QBC", "QSLV", "QUN", "QASH", "XQN", "QVT", "QWARK", "QWC", "RFL", "KRX", "RAC", "RHOC", "RCN", "REAL", "REBL", "MWAT", "RST", "REM", "RGC", "ROI", "ROS", "RADI", "RADS", "RDN", "RDN", "RAP", "RTE", "XRA", "RATIO", "RAVE", "RVN", "RZR", "RCT", "REA", "RCC", "RRT", "RPX", "RCX", "RED", "RDD", "REDN", "REE", "REF", "RFR", "REC", "RLX", "REL", "RPM", "RNDR", "RNS", "BERRY", "REPO", "REN", "REPUX", "REQ", "RMS", "RBIT", "RNC", "R", "REV", "RVR", "XRE", "RHEA", "XRL", "RBR", "RICE", "RIDE", "RIC", "RBT", "RING", "RIPO", "RCN", "RIPT", "RBX", "RISE", "RVT", "RAC", "PUT", "RAC", "ROX", "RKT", "ROK", "ROCK", "RPC", "ROOT", "ROOTS", "RT2", "ROUND", "ROE", "RKC", "RYC", "ROYAL", "RYCN", "RBIES", "RUBY", "RUBIT", "RBY", "RUFF", "RUPX", "RUP", "RC", "RMC", "RUST", "RUSTBITS", "RYO", "S8C", "SABR", "SAR", "XSH", "SMNX", "SNM", "SXDT", "SXUT", "SPICE", "SSV", "STAC", "STEX", "STK", "STS", "XSTC", "SAFE", "SAFEX", "SFE", "SFR", "SAF", "SAGA", "SFU", "SKB", "SKR", "SAL", "SALT", "SLS", "SMSR", "SND", "SAN", "SPN", "XAI", "SAT", "STV", "MAD", "SAT2", "STO", "SANDG", "SVD", "SWC", "SCOOBY", "SCORE", "SCOR", "SCR", "SCOT", "SCRL", "DDD", "SCRPT", "SCT", "SRT", "SCRT", "SRC", "SEEDS", "B2X", "SEL", "KEY", "SSC", "SEM", "SDRN", "SNS", "SENSE", "SEN", "SENT", "SENC", "UPP", "SEQ", "SERA", "SRNT", "SET", "SETH", "SP", "SXC", "SHA", "SHADE", "SDC", "SS", "SSS", "SHR", "SAK", "SHP", "JEW", "SHLD", "SHIFT", "SH", "SHIP", "SHORTY", "SHOW", "SHPING", "SHREK", "SC", "SIB", "SGL", "SIG", "SGN", "SIGT", "SNTR", "SILK", "OST", "SPLB", "SIGU", "SNGLS", "AGI", "SRN", "SKC", "SKIN", "SKRP", "SKR", "SKM", "SKB", "SKY", "SLX", "SLM", "SLING", "SIFT", "SMART", "SMART", "SMC", "SLT", "SMT", "SMLY", "SMF", "SNIP", "SNOV", "XSG", "SOAR", "SMAC", "SMT", "SEND", "SOCC", "XBOT", "SCL", "SOIL", "SOJ", "SOL", "SDAO", "SLR", "CELL", "SFC", "XLR", "SOLE", "SCT", "SONG", "SSD", "SOON", "SPHTX", "SNK", "SOUL", "SPX", "SCASH", "SPC", "SPACE", "SPA", "SPANK", "SPK", "SPEC", "SPX", "XSPEC", "SPEND", "SPHR", "XID", "SPC", "SPD", "SPN", "SPORT", "SPF", "SPT", "SPOTS", "SPR", "SPRTS", "SQP", "SQL", "XSI", "SBC", "STCN", "XSN", "STA", "STHR", "STALIN", "STC", "STR", "STAR", "SRC", "STT", "STAR", "START", "STA", "STP", "SQOIN", "SNT", "STAX", "XST", "PNK", "STEEM", "SBD", "XLM", "XTL", "STN", "STEPS", "SLG", "SPD", "STOCKBET", "SCC", "STQ", "STORJ", "SJCX", "STORM", "STX", "STAK", "SISA", "STRAT", "SSH", "DATA", "SHND", "SUB", "SUB", "SUCR", "SGR", "SUMO", "SNC", "SSTC", "SUP", "SBTC", "SUPER", "UNITY", "M1", "SPM", "RMT", "SUR", "SCX", "BUCKS", "SWT", "SWM", "SWARM", "SWEET", "SWFTC", "SWING", "SCN", "CHSB", "SRC", "SIC", "SWTH", "SDP", "SYNC", "MFG", "SYC", "SYNX", "AMP", "SNRG", "SYS", "TBT", "BAR", "TDFB", "TFD", "TKY", "TOA", "TPC", "XTROPTIONS", "TAG", "TAJ", "TAK", "TKLN", "TAM", "XTO", "TTT", "TAP", "TGT", "TAT", "TSE", "TEC", "TEAM", "TECH", "THS", "TEK", "TEL", "GRAM", "TELL", "PAY", "TENNET", "TERN", "TRN", "TRC", "TER", "TESLA", "TES", "USDT", "TRA", "XTZ", "THNX", "0xDIARY", "ABYSS", "EFX", "TFC", "THC", "XVE", "CHIEF", "GCC", "VIG", "TCR", "MAY", "THETA", "TAGR", "THRT", "TSC", "TIA", "TDX", "TNT", "TIE", "TGC", "TIG", "XTC", "TIME", "TNB", "TME", "TMC", "TIO", "TIP", "TIT", "TBAR", "TTC", "TMT", "TODAY", "TAAS", "TKN", "TCT", "TDS", "TPAY", "ACE", "TBX", "TEN", "TKS", "TKA", "TOK", "TOKC", "TOM", "TOMO", "TOR", "TOT", "BBC", "MTN", "TRCT", "TIO", "TDZ", "TRAK", "TX", "TBCX", "TRV", "TT", "TRF", "TMT", "TZC", "TRIA", "TRI", "TRIBE", "TRICK", "TRDT", "TRIG", "TNC", "TRIP", "TRVC", "TRW", "TPG", "TPAY", "TKN", "TROLL", "TRX", "TRK", "TRCK", "TFL", "TUSD", "TDP", "TGAME", "TIC", "TRUMP", "TRST", "TRUST", "TLP", "TUR", "TRTL", "TUT", "TWLV", "TWIST", "UUU", "UCASH", "UCN", "UCT", "UFO", "XUP", "UR", "USDC", "USOAMIC", "UBC", "UBEX", "UBQ", "UBIQ", "U", "USC", "UTC", "XUN", "ULTC", "UMC", "UNC", "UNAT", "UNB", "UNF", "UBT", "CANDY", "USX", "UNIFY", "UKG", "UNIQ", "USDE", "UAEC", "UTT", "UBTC", "UIS", "UTN", "UTNP", "UNIT", "UNRC", "UNI", "UNO", "UP", "UFR", "UQC", "URALS", "URO", "UETL", "UET", "UTH", "UTIL", "OOT", "UTK", "UWC", "VIDT", "VEGA", "VIBE", "VIP", "VITE", "VIVO", "VLUX", "VVI", "VLD", "VAL", "VLR", "VANY", "VPRC", "VAPOR", "VLTC", "XVC", "VEN", "VEC2", "VLX", "VLT", "VRA", "VNT", "XVG", "VRC", "VME", "CRED", "VERI", "VRM", "VRS", "VERSA", "VTC", "VTX", "VST", "VZT", "VIA", "VIB", "VIT", "VTY", "VIC", "VID", "VDO", "VIEW", "VIN", "VIOR", "VIRAL", "VUC", "VTA", "XVP", "VMC", "VISIO", "VITAE", "VIU", "VOISE", "VTN", "VOOT", "VOT", "VOYA", "VSX", "VTR", "VULC", "W3C", "WAB", "WIN", "WMC", "WRT", "WABI", "WGR", "WTC", "WAN", "WAND", "WRC", "WARP", "WASH", "WAVES", "WCT", "WGO", "WNET", "WAY", "WSX", "WPR", "WT", "WEALTH", "WEB", "WELL", "WEX", "WHL", "WC", "XWC", "WIC", "WIIX", "WBB", "WILD", "WINS", "LIF", "WINE", "WINGS", "WINK", "WISC", "WSC", "WSH", "WISH", "WLK", "WOMEN", "LOG", "WCG", "WGC", "XWT", "WBTC", "WDC", "WOP", "WRC", "WAX", "WYR", "WYS", "XRED", "XC", "X2", "X8X", "XCO", "XDE2", "XDNA", "XG", "XMX", "XRP", "XUEZ", "XXX", "XYO", "XNX", "XAU", "XAUR", "XCASH", "XCEL", "XNC", "XEN", "XNN", "MI", "XDCE", "XIOS", "XT3", "XBY", "YAY", "YAC", "YMC", "YBC", "YEE", "YES", "YOC", "YOVI", "U42", "YOYOW", "YUM", "Z2", "ZAB", "ZCC", "ZEC", "ZECD", "ZCG", "ZCL", "XZC", "ZINC", "ZIX", "ZLQ", "ZMN", "ZSE", "ZAP", "ZYD", "ZXT", "NZL", "ZCO", "ZED", "ZPT", "ZEIT", "ZEL", "ZEN", "ZEN", "ZENI", "ZNA", "ZER", "ZSC", "ZET2", "ZET", "ZSC", "ZRC", "ZBC", "ZIL", "ZIPT", "ZOI", "ZNE", "ZOOM", "ZRC", "ZUP", "ZUR", "AXP", "ELF", "BITCNY", "BITGOLD", "BITSILVER", "BITUSD", "DCS", "DNT", "ECHT", "EBIT", "EBTC", "EBCH", "EBST", "ELTC2", "DEM", "ePRX", "EREAL", "EXMR", "EOSDAC", "FDX", "GCN", "IBANK", "DEAL", "ICE", "IETH", "RLC", "ILT", "IW", "IXT", "ITM", "ONG", "redBUX", "UGC", "VSL", "WBTC"];
	var validcurrs = ["AED", "AFN", "ALL", "AMD", "AOA", "ARS", "AUD", "AZN", "BAM", "BBD", "BDT", "BGN", "BHD", "BIF", "BND", "BOB", "BRL", "BSD", "BTN", "BWP", "BYN", "CAD", "CHF", "CLP", "CNY", "COP", "COU", "CRC", "CUC", "CZK", "DKK", "DOP", "DZD", "EGP", "ETB", "EUR", "GBP", "GEL", "GHS", "GIP", "GTQ", "HKD", "HNL", "HRK", "HUF", "IDR", "ILS", "INR", "IQD", "IRR", "ISK", "JMD", "JOD", "JPY", "KES", "KGS", "KHR", "KRW", "KWD", "KZT", "LBP", "LKR", "LSL", "MAD", "MDL", "MGA", "MMK", "MOP", "MUR", "MVR", "MWK", "MXN", "MYR", "MZN", "NAD", "NGN", "NIO", "NOK", "NPR", "NZD", "OMR", "PAB", "PEN", "PGK", "PHP", "PKR", "PLN", "PYG", "QAR", "RON", "RSD", "RUB", "RWF", "SAR", "SCR", "SEK", "SGD", "SHP", "SSP", "STN", "SVC", "SZL", "THB", "TMT", "TND", "TOP", "TRY", "TTD", "TWD", "TZS", "UAH", "UGX", "USD", "UYU", "UZS", "VEF", "VND", "VUV", "XAF", "XAG", "XAU", "XBB", "XBC", "XOF", "XPD", "XXX", "ZAR", "ZMW"];

	if (!validcryptos.includes(asset)) {
		error = "Select a valid asset.";
	}
	if (!validcurrs.includes(currency)) {
		error = "Select a valid currency you bought the asset with.";
	}
	if (!isNumeric(price)) {
		error = "Please enter a valid number in the 'Price' field. Use a dot (.) as delimiter.";
	}
	if (!isNumeric(amount)) {
		error = "Please enter a valid number in the 'Amount' field. Use a dot (.) as delimiter.";
	}
	if (!isValidDate(datepicker)) {
		error = "Pick a valid date you bough the asset at. Use the format mm/dd/yyyy.";
	}

	if (error.length > 0) {
		document.getElementById("error2").innerHTML = "<font color=\"#ff0000\">Error: " + error + "</font>";
	} else {
		document.getElementById("error2").innerHTML = "";
	}

	if (error.length == 0) {
		asset2 = asset;
		price2 = price;
		currency2 = currency;
		action2 = action;
		amount2 = amount;
		datepicker2 = datepicker;

		edit++;

		edittransaction();
	}
}
