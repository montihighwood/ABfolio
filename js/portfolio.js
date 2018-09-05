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

function isNumeric(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

var sources = [];
var assetsArray1 = [];
var price1_ = [];

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

			var totalholdings1 = raw.split('\n', 1)[0];

			var currency1 = raw.split('\n', 2)[1];

			//var totalinvested = raw.split('\n', 3)[2];

			var investments = raw.split('\n', 4)[3];

			var investmentsArray = investments.split(":");

			assetsArray1 = totalholdings1.split(":");

			var totalvalue1 = 0;
			var totalcrypto1 = 0;

			var amountsArray = [];
			var assetsArray = [];

			var dates = [];

			var buyPricesArray = [];

			for (i = 0; i < investmentsArray.length; i++) {
				if (i % 3 == 0 && i != 0) {
					if (!(investmentsArray[i] >> 0) > 0) {
						assetsArray.push(investmentsArray[i]);
					}
				}
				if (i % 2 == 0 && i != 0) {
					if (!(investmentsArray[i] >> 0) > 0) {
						if (investmentsArray[i] == "BUY") {
							buyPricesArray.push(parseFloat(investmentsArray[i + 2]));
							amountsArray.push(parseFloat(investmentsArray[i + 3].replace(" ", "")));
						} else {
							buyPricesArray.push(undefined);
						}
					}
				}
			}

			for (i = 0; i < investmentsArray.length; i++) {
				if ((i - 1) % 6 == 0) {
					dates.push(investmentsArray[i]);
				}
			}

			var totalinvested = 0;

			var actionsArray = [];

			for (i = 0; i < investmentsArray.length; i++) {
				if (investmentsArray[i] == "BUY" || investmentsArray[i] == "SELL") {
					actionsArray.push(investmentsArray[i]);
				}
			}

			for (i = 0; i < actionsArray.length; i++) {
				if (actionsArray[i] == "BUY") {
					totalinvested += amountsArray[i] * buyPricesArray[i];
				}
			}

			var _url = "https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=" + currency1;

			xmlhttp.open("GET", _url, false);
			xmlhttp.send();

			if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
				totalinvested *= xmlhttp.responseText.split(':')[1].replace("}", "");
			}

			var formatter = new Intl.NumberFormat(getLang(), {
					style: 'currency',
					currency: currency1.replace(" ", ""),
					minimumFractionDigits: 2,
				});

			document.getElementById("totalinvested1").innerHTML = formatter.format(totalinvested);

			for (i = 0; i < assetsArray1.length; i++) {
				if (i % 2 == 0) {
					var api_url = "https://min-api.cryptocompare.com/data/price?fsym=" + assetsArray1[i] + "&tsyms=" + currency1;

					xmlhttp.open("GET", api_url, false);
					xmlhttp.send();

					if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
						var price1 = xmlhttp.responseText.split(':')[1].replace("}", "");
						price1_.push(price1 * assetsArray1[i + 1]);

						totalvalue1 += price1 * assetsArray1[i + 1];

						if (assetsArray1[i] != "USD" && assetsArray1[i] != "EUR") {
							totalcrypto1 += price1 * assetsArray1[i + 1];
							var hour_url1 = "https://min-api.cryptocompare.com/data/histohour?fsym=" + assetsArray1[i] + "&tsym=" + currency1 + "&limit=60&aggregate=3&e=CCCAGG";

							xmlhttp.open("GET", hour_url1, false);
							xmlhttp.send();

							if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
								var hour1 = xmlhttp.responseText;

								var hours24 = hour1.match("1532977200(.*),");
								//console.log(hours24);
							}
						}
					}
				}
			}

			var cryptoprofit1 = totalcrypto1 - totalinvested;
			var percentagegain1 = 100 * (totalcrypto1 / totalinvested - 1);

			document.getElementById("totalholdings1").innerHTML = formatter.format(totalvalue1);
			document.getElementById("totalcrypto1").innerHTML = formatter.format(totalcrypto1);
			document.getElementById("cryptoprofit1").innerHTML = formatter.format(cryptoprofit1);
			document.getElementById("percentagegain1").innerHTML = percentagegain1.toFixed(2) + "%";

			if (cryptoprofit1 > 0) {
				document.getElementById("cryptoprofit1").style.color = '#3cbc98';
				document.getElementById("percentagegain1").style.color = '#3cbc98';
			} else {
				document.getElementById("cryptoprofit1").style.color = '#ff4a68';
				document.getElementById("percentagegain1").style.color = '#ff4a68';
			}

			var allhisto = [];
			var sumbytime = [];

			var pricedamounts = [];

			for (i = 0; i < amountsArray.length; i++) {
				pricedamounts[i] = buyPricesArray[i] * amountsArray[i];
			}

			for (i = 0; i < assetsArray1.length; i++) {
				const sumObject = pricedamounts.reduce((acc, e, i, arr) => {
						acc[assetsArray[i]] = (acc[assetsArray[i]] || 0) + e;
						return acc;
					}, {});

				assetsArray.pop();
				pricedamounts.pop();

				sumbytime.push(Object.entries(sumObject).map(el => el[1]));
			}

			sumbytime.reverse();

			var _sum = [];

			_sum = sumbytime.map(arr => arr.reduce((sum, item) => sum += item, 0));

			assetsArray = [];
			amountsArray = [];

			for (i = 0; i < investmentsArray.length; i++) {
				if (i % 3 == 0 && i != 0) {
					if (!(investmentsArray[i] >> 0) > 0) {
						assetsArray.push(investmentsArray[i]);
					}
				}
				if (i % 2 == 0 && i != 0) {
					if (!(investmentsArray[i] >> 0) > 0) {
						if (investmentsArray[i] == "BUY") {
							amountsArray.push(parseFloat(investmentsArray[i + 3].replace(" ", "")));
						}
					}
				}
			}

			buyPricesArray.pop();
			buyPricesArray.reverse();

			for (i = 0; i < assetsArray1.length; i++) {
				const sumObject = amountsArray.reduce((acc, e, i, arr) => {
						acc[assetsArray[i]] = (acc[assetsArray[i]] || 0) + e;
						return acc;
					}, {});

				assetsArray.pop();
				amountsArray.pop();
				allhisto.push(Object.entries(sumObject).map(el => el[0] + ": " + el[1].toFixed(3)).join(", "));
			}

			var table = document.getElementById("investments");

			if (dates.length == 0) {
				table.parentNode.removeChild(table);
			}

			allhisto = allhisto.filter(function (v) {
					return v !== ''
				});

			for (i = 0; i < 4; i++) {
				if (typeof dates[i] === 'undefined') {
					dates[i] = "-";
					allhisto[i] = "-";
				}
			}

			dates.reverse();

			for (i = 0; i < 4; i++) {
				var row = table.insertRow(1);

				row.insertCell(0).innerHTML = dates[i];
				row.insertCell(1).innerHTML = allhisto[i];
			}

			var row = table.insertRow(5);

			row.insertCell(0).innerHTML = "<a href=\"history.html\">See transactions</a>";
			row.insertCell(1).innerHTML = "<a href=\"profitsbytime.html\"><font color=\"red\">=> INSIGHTS: Profits by time (%)</font></a>";

			allhisto = allhisto.filter(function (v) {
					return v !== ''
				});

			dates = dates.filter(function (v) {
					return v !== ''
				});

			dates.reverse();
			allhisto.reverse();

			var allocation_chart;

			allocation_chart = new Chart(document.getElementById("allocation-chart"), {
					type: 'pie',
					data: {
						labels: [],
						datasets: [{
								backgroundColor: [],
								data: []
							}
						]
					},
					options: {
						title: {
							display: true,
							text: 'Allocation of investments (%)'
						},
						legend: {
							display: false
						},
						pieceLabel: {
							render: 'percentage',
							precision: 1,
							arc: true,
							fontColor: '#000',
							fontSize: 11,
							position: 'outside'
						}
					}
				});

			setTimeout(() => {

				for (i = 0; i < assetsArray1.length; i++) {
					if (i % 2 == 0) {
						// get currency symbol

						/*var curr_sign = "$";

						curr_sign = formatter.format(totalvalue1).replace(/[0-9]/g, '').replace(",", "").replace(".", "").replace(" ", "");*/

						allocation_chart.data.labels[i / 2] = assetsArray1[i];

						sources[i / 2] = assetsArray1[i];
					} else {
						allocation_chart.data.datasets[0].data[i / 2 - 0.5] = price1_[i / 2 - 0.5].toFixed(2);
					}

					allocation_chart.update();
				}

				var img = new Array();
				var colorThief = new ColorThief();

				/*var text_ = "";
				var text__ = "";*/

				for (i = 0; i < sources.length; i++) {
					var hex = [];

					img[i] = new Image();

					img[i].src = 'icon/' + sources[i].toLowerCase() + '.png';
					//console.log(img[i]);

					/*img[0].onload = function () {
					hex[0] = rgbToHex(colorThief.getColor(img[0])[0], colorThief.getColor(img[0])[1], colorThief.getColor(img[0])[2]);
					img[1].onload = function () {
					hex[1] = rgbToHex(colorThief.getColor(img[1])[0], colorThief.getColor(img[1])[1], colorThief.getColor(img[1])[2]);
					};
					};*/

					/*(function (hex) {
					img[0].onload = function () {
					hex[0] = rgbToHex(colorThief.getColor(img[0])[0], colorThief.getColor(img[0])[1], colorThief.getColor(img[0])[2]);
					img[1].onload = function () {
					hex[1] = rgbToHex(colorThief.getColor(img[1])[0], colorThief.getColor(img[1])[1], colorThief.getColor(img[1])[2]);
					img[2].onload = function () {
					hex[2] = rgbToHex(colorThief.getColor(img[2])[0], colorThief.getColor(img[2])[1], colorThief.getColor(img[2])[2]);
					img[3].onload = function () {
					hex[3] = rgbToHex(colorThief.getColor(img[3])[0], colorThief.getColor(img[3])[1], colorThief.getColor(img[3])[2]);
					img[4].onload = function () {
					hex[4] = rgbToHex(colorThief.getColor(img[4])[0], colorThief.getColor(img[4])[1], colorThief.getColor(img[4])[2]);
					img[5].onload = function () {
					hex[5] = rgbToHex(colorThief.getColor(img[5])[0], colorThief.getColor(img[5])[1], colorThief.getColor(img[5])[2]);
					img[6].onload = function () {
					hex[6] = rgbToHex(colorThief.getColor(img[6])[0], colorThief.getColor(img[6])[1], colorThief.getColor(img[6])[2]);
					img[7].onload = function () {
					hex[7] = rgbToHex(colorThief.getColor(img[7])[0], colorThief.getColor(img[7])[1], colorThief.getColor(img[7])[2]);
					img[8].onload = function () {
					hex[8] = rgbToHex(colorThief.getColor(img[8])[0], colorThief.getColor(img[8])[1], colorThief.getColor(img[8])[2]);
					img[9].onload = function () {
					hex[9] = rgbToHex(colorThief.getColor(img[9])[0], colorThief.getColor(img[9])[1], colorThief.getColor(img[9])[2]);
					img[10].onload = function () {
					hex[10] = rgbToHex(colorThief.getColor(img[10])[0], colorThief.getColor(img[10])[1], colorThief.getColor(img[10])[2]);
					img[11].onload = function () {
					hex[11] = rgbToHex(colorThief.getColor(img[11])[0], colorThief.getColor(img[11])[1], colorThief.getColor(img[11])[2]);
					img[12].onload = function () {
					hex[12] = rgbToHex(colorThief.getColor(img[12])[0], colorThief.getColor(img[12])[1], colorThief.getColor(img[12])[2]);
					img[13].onload = function () {
					hex[13] = rgbToHex(colorThief.getColor(img[13])[0], colorThief.getColor(img[13])[1], colorThief.getColor(img[13])[2]);
					img[14].onload = function () {
					hex[14] = rgbToHex(colorThief.getColor(img[14])[0], colorThief.getColor(img[14])[1], colorThief.getColor(img[14])[2]);
					img[15].onload = function () {
					hex[15] = rgbToHex(colorThief.getColor(img[15])[0], colorThief.getColor(img[15])[1], colorThief.getColor(img[15])[2]);
					img[16].onload = function () {
					hex[16] = rgbToHex(colorThief.getColor(img[16])[0], colorThief.getColor(img[16])[1], colorThief.getColor(img[16])[2]);
					img[17].onload = function () {
					hex[17] = rgbToHex(colorThief.getColor(img[17])[0], colorThief.getColor(img[17])[1], colorThief.getColor(img[17])[2]);
					img[18].onload = function () {
					hex[18] = rgbToHex(colorThief.getColor(img[18])[0], colorThief.getColor(img[18])[1], colorThief.getColor(img[18])[2]);
					img[19].onload = function () {
					hex[19] = rgbToHex(colorThief.getColor(img[19])[0], colorThief.getColor(img[19])[1], colorThief.getColor(img[19])[2]);
					img[20].onload = function () {
					hex[20] = rgbToHex(colorThief.getColor(img[20])[0], colorThief.getColor(img[20])[1], colorThief.getColor(img[20])[2]);
					img[21].onload = function () {
					hex[21] = rgbToHex(colorThief.getColor(img[21])[0], colorThief.getColor(img[21])[1], colorThief.getColor(img[21])[2]);
					img[22].onload = function () {
					hex[22] = rgbToHex(colorThief.getColor(img[22])[0], colorThief.getColor(img[22])[1], colorThief.getColor(img[22])[2]);
					img[23].onload = function () {
					hex[23] = rgbToHex(colorThief.getColor(img[23])[0], colorThief.getColor(img[23])[1], colorThief.getColor(img[23])[2]);
					img[24].onload = function () {
					hex[24] = rgbToHex(colorThief.getColor(img[24])[0], colorThief.getColor(img[24])[1], colorThief.getColor(img[24])[2]);
					img[25].onload = function () {
					hex[25] = rgbToHex(colorThief.getColor(img[25])[0], colorThief.getColor(img[25])[1], colorThief.getColor(img[25])[2]);
					img[26].onload = function () {
					hex[26] = rgbToHex(colorThief.getColor(img[26])[0], colorThief.getColor(img[26])[1], colorThief.getColor(img[26])[2]);
					img[27].onload = function () {
					hex[27] = rgbToHex(colorThief.getColor(img[27])[0], colorThief.getColor(img[27])[1], colorThief.getColor(img[27])[2]);
					img[28].onload = function () {
					hex[28] = rgbToHex(colorThief.getColor(img[28])[0], colorThief.getColor(img[28])[1], colorThief.getColor(img[28])[2]);
					img[29].onload = function () {
					hex[29] = rgbToHex(colorThief.getColor(img[29])[0], colorThief.getColor(img[29])[1], colorThief.getColor(img[29])[2]);
					img[30].onload = function () {
					hex[30] = rgbToHex(colorThief.getColor(img[30])[0], colorThief.getColor(img[30])[1], colorThief.getColor(img[30])[2]);
					img[31].onload = function () {
					hex[31] = rgbToHex(colorThief.getColor(img[31])[0], colorThief.getColor(img[31])[1], colorThief.getColor(img[31])[2]);
					img[32].onload = function () {
					hex[32] = rgbToHex(colorThief.getColor(img[32])[0], colorThief.getColor(img[32])[1], colorThief.getColor(img[32])[2]);
					img[33].onload = function () {
					hex[33] = rgbToHex(colorThief.getColor(img[33])[0], colorThief.getColor(img[33])[1], colorThief.getColor(img[33])[2]);
					img[34].onload = function () {
					hex[34] = rgbToHex(colorThief.getColor(img[34])[0], colorThief.getColor(img[34])[1], colorThief.getColor(img[34])[2]);
					img[35].onload = function () {
					hex[35] = rgbToHex(colorThief.getColor(img[35])[0], colorThief.getColor(img[35])[1], colorThief.getColor(img[35])[2]);
					img[36].onload = function () {
					hex[36] = rgbToHex(colorThief.getColor(img[36])[0], colorThief.getColor(img[36])[1], colorThief.getColor(img[36])[2]);
					img[37].onload = function () {
					hex[37] = rgbToHex(colorThief.getColor(img[37])[0], colorThief.getColor(img[37])[1], colorThief.getColor(img[37])[2]);
					img[38].onload = function () {
					hex[38] = rgbToHex(colorThief.getColor(img[38])[0], colorThief.getColor(img[38])[1], colorThief.getColor(img[38])[2]);
					img[39].onload = function () {
					hex[39] = rgbToHex(colorThief.getColor(img[39])[0], colorThief.getColor(img[39])[1], colorThief.getColor(img[39])[2]);
					img[40].onload = function () {
					hex[40] = rgbToHex(colorThief.getColor(img[40])[0], colorThief.getColor(img[40])[1], colorThief.getColor(img[40])[2]);
					img[41].onload = function () {
					hex[41] = rgbToHex(colorThief.getColor(img[41])[0], colorThief.getColor(img[41])[1], colorThief.getColor(img[41])[2]);
					img[42].onload = function () {
					hex[42] = rgbToHex(colorThief.getColor(img[42])[0], colorThief.getColor(img[42])[1], colorThief.getColor(img[42])[2]);
					img[43].onload = function () {
					hex[43] = rgbToHex(colorThief.getColor(img[43])[0], colorThief.getColor(img[43])[1], colorThief.getColor(img[43])[2]);
					img[44].onload = function () {
					hex[44] = rgbToHex(colorThief.getColor(img[44])[0], colorThief.getColor(img[44])[1], colorThief.getColor(img[44])[2]);
					img[45].onload = function () {
					hex[45] = rgbToHex(colorThief.getColor(img[45])[0], colorThief.getColor(img[45])[1], colorThief.getColor(img[45])[2]);
					img[46].onload = function () {
					hex[46] = rgbToHex(colorThief.getColor(img[46])[0], colorThief.getColor(img[46])[1], colorThief.getColor(img[46])[2]);
					img[47].onload = function () {
					hex[47] = rgbToHex(colorThief.getColor(img[47])[0], colorThief.getColor(img[47])[1], colorThief.getColor(img[47])[2]);
					img[48].onload = function () {
					hex[48] = rgbToHex(colorThief.getColor(img[48])[0], colorThief.getColor(img[48])[1], colorThief.getColor(img[48])[2]);
					img[49].onload = function () {
					hex[49] = rgbToHex(colorThief.getColor(img[49])[0], colorThief.getColor(img[49])[1], colorThief.getColor(img[49])[2]);
					img[50].onload = function () {
					hex[50] = rgbToHex(colorThief.getColor(img[50])[0], colorThief.getColor(img[50])[1], colorThief.getColor(img[50])[2]);
					img[51].onload = function () {
					hex[51] = rgbToHex(colorThief.getColor(img[51])[0], colorThief.getColor(img[51])[1], colorThief.getColor(img[51])[2]);
					img[52].onload = function () {
					hex[52] = rgbToHex(colorThief.getColor(img[52])[0], colorThief.getColor(img[52])[1], colorThief.getColor(img[52])[2]);
					img[53].onload = function () {
					hex[53] = rgbToHex(colorThief.getColor(img[53])[0], colorThief.getColor(img[53])[1], colorThief.getColor(img[53])[2]);
					img[54].onload = function () {
					hex[54] = rgbToHex(colorThief.getColor(img[54])[0], colorThief.getColor(img[54])[1], colorThief.getColor(img[54])[2]);
					img[55].onload = function () {
					hex[55] = rgbToHex(colorThief.getColor(img[55])[0], colorThief.getColor(img[55])[1], colorThief.getColor(img[55])[2]);
					img[56].onload = function () {
					hex[56] = rgbToHex(colorThief.getColor(img[56])[0], colorThief.getColor(img[56])[1], colorThief.getColor(img[56])[2]);
					img[57].onload = function () {
					hex[57] = rgbToHex(colorThief.getColor(img[57])[0], colorThief.getColor(img[57])[1], colorThief.getColor(img[57])[2]);
					img[58].onload = function () {
					hex[58] = rgbToHex(colorThief.getColor(img[58])[0], colorThief.getColor(img[58])[1], colorThief.getColor(img[58])[2]);
					img[59].onload = function () {
					hex[59] = rgbToHex(colorThief.getColor(img[59])[0], colorThief.getColor(img[59])[1], colorThief.getColor(img[59])[2]);
					img[60].onload = function () {
					hex[60] = rgbToHex(colorThief.getColor(img[60])[0], colorThief.getColor(img[60])[1], colorThief.getColor(img[60])[2]);
					img[61].onload = function () {
					hex[61] = rgbToHex(colorThief.getColor(img[61])[0], colorThief.getColor(img[61])[1], colorThief.getColor(img[61])[2]);
					img[62].onload = function () {
					hex[62] = rgbToHex(colorThief.getColor(img[62])[0], colorThief.getColor(img[62])[1], colorThief.getColor(img[62])[2]);
					img[63].onload = function () {
					hex[63] = rgbToHex(colorThief.getColor(img[63])[0], colorThief.getColor(img[63])[1], colorThief.getColor(img[63])[2]);
					img[64].onload = function () {
					hex[64] = rgbToHex(colorThief.getColor(img[64])[0], colorThief.getColor(img[64])[1], colorThief.getColor(img[64])[2]);
					img[65].onload = function () {
					hex[65] = rgbToHex(colorThief.getColor(img[65])[0], colorThief.getColor(img[65])[1], colorThief.getColor(img[65])[2]);
					img[66].onload = function () {
					hex[66] = rgbToHex(colorThief.getColor(img[66])[0], colorThief.getColor(img[66])[1], colorThief.getColor(img[66])[2]);
					img[67].onload = function () {
					hex[67] = rgbToHex(colorThief.getColor(img[67])[0], colorThief.getColor(img[67])[1], colorThief.getColor(img[67])[2]);
					img[68].onload = function () {
					hex[68] = rgbToHex(colorThief.getColor(img[68])[0], colorThief.getColor(img[68])[1], colorThief.getColor(img[68])[2]);
					img[69].onload = function () {
					hex[69] = rgbToHex(colorThief.getColor(img[69])[0], colorThief.getColor(img[69])[1], colorThief.getColor(img[69])[2]);
					img[70].onload = function () {
					hex[70] = rgbToHex(colorThief.getColor(img[70])[0], colorThief.getColor(img[70])[1], colorThief.getColor(img[70])[2]);
					img[71].onload = function () {
					hex[71] = rgbToHex(colorThief.getColor(img[71])[0], colorThief.getColor(img[71])[1], colorThief.getColor(img[71])[2]);
					img[72].onload = function () {
					hex[72] = rgbToHex(colorThief.getColor(img[72])[0], colorThief.getColor(img[72])[1], colorThief.getColor(img[72])[2]);
					img[73].onload = function () {
					hex[73] = rgbToHex(colorThief.getColor(img[73])[0], colorThief.getColor(img[73])[1], colorThief.getColor(img[73])[2]);
					img[74].onload = function () {
					hex[74] = rgbToHex(colorThief.getColor(img[74])[0], colorThief.getColor(img[74])[1], colorThief.getColor(img[74])[2]);
					img[75].onload = function () {
					hex[75] = rgbToHex(colorThief.getColor(img[75])[0], colorThief.getColor(img[75])[1], colorThief.getColor(img[75])[2]);
					img[76].onload = function () {
					hex[76] = rgbToHex(colorThief.getColor(img[76])[0], colorThief.getColor(img[76])[1], colorThief.getColor(img[76])[2]);
					img[77].onload = function () {
					hex[77] = rgbToHex(colorThief.getColor(img[77])[0], colorThief.getColor(img[77])[1], colorThief.getColor(img[77])[2]);
					img[78].onload = function () {
					hex[78] = rgbToHex(colorThief.getColor(img[78])[0], colorThief.getColor(img[78])[1], colorThief.getColor(img[78])[2]);
					img[79].onload = function () {
					hex[79] = rgbToHex(colorThief.getColor(img[79])[0], colorThief.getColor(img[79])[1], colorThief.getColor(img[79])[2]);
					img[80].onload = function () {
					hex[80] = rgbToHex(colorThief.getColor(img[80])[0], colorThief.getColor(img[80])[1], colorThief.getColor(img[80])[2]);
					img[81].onload = function () {
					hex[81] = rgbToHex(colorThief.getColor(img[81])[0], colorThief.getColor(img[81])[1], colorThief.getColor(img[81])[2]);
					img[82].onload = function () {
					hex[82] = rgbToHex(colorThief.getColor(img[82])[0], colorThief.getColor(img[82])[1], colorThief.getColor(img[82])[2]);
					img[83].onload = function () {
					hex[83] = rgbToHex(colorThief.getColor(img[83])[0], colorThief.getColor(img[83])[1], colorThief.getColor(img[83])[2]);
					img[84].onload = function () {
					hex[84] = rgbToHex(colorThief.getColor(img[84])[0], colorThief.getColor(img[84])[1], colorThief.getColor(img[84])[2]);
					img[85].onload = function () {
					hex[85] = rgbToHex(colorThief.getColor(img[85])[0], colorThief.getColor(img[85])[1], colorThief.getColor(img[85])[2]);
					img[86].onload = function () {
					hex[86] = rgbToHex(colorThief.getColor(img[86])[0], colorThief.getColor(img[86])[1], colorThief.getColor(img[86])[2]);
					img[87].onload = function () {
					hex[87] = rgbToHex(colorThief.getColor(img[87])[0], colorThief.getColor(img[87])[1], colorThief.getColor(img[87])[2]);
					img[88].onload = function () {
					hex[88] = rgbToHex(colorThief.getColor(img[88])[0], colorThief.getColor(img[88])[1], colorThief.getColor(img[88])[2]);
					img[89].onload = function () {
					hex[89] = rgbToHex(colorThief.getColor(img[89])[0], colorThief.getColor(img[89])[1], colorThief.getColor(img[89])[2]);
					img[90].onload = function () {
					hex[90] = rgbToHex(colorThief.getColor(img[90])[0], colorThief.getColor(img[90])[1], colorThief.getColor(img[90])[2]);
					img[91].onload = function () {
					hex[91] = rgbToHex(colorThief.getColor(img[91])[0], colorThief.getColor(img[91])[1], colorThief.getColor(img[91])[2]);
					img[92].onload = function () {
					hex[92] = rgbToHex(colorThief.getColor(img[92])[0], colorThief.getColor(img[92])[1], colorThief.getColor(img[92])[2]);
					img[93].onload = function () {
					hex[93] = rgbToHex(colorThief.getColor(img[93])[0], colorThief.getColor(img[93])[1], colorThief.getColor(img[93])[2]);
					img[94].onload = function () {
					hex[94] = rgbToHex(colorThief.getColor(img[94])[0], colorThief.getColor(img[94])[1], colorThief.getColor(img[94])[2]);
					img[95].onload = function () {
					hex[95] = rgbToHex(colorThief.getColor(img[95])[0], colorThief.getColor(img[95])[1], colorThief.getColor(img[95])[2]);
					img[96].onload = function () {
					hex[96] = rgbToHex(colorThief.getColor(img[96])[0], colorThief.getColor(img[96])[1], colorThief.getColor(img[96])[2]);
					img[97].onload = function () {
					hex[97] = rgbToHex(colorThief.getColor(img[97])[0], colorThief.getColor(img[97])[1], colorThief.getColor(img[97])[2]);
					img[98].onload = function () {
					hex[98] = rgbToHex(colorThief.getColor(img[98])[0], colorThief.getColor(img[98])[1], colorThief.getColor(img[98])[2]);
					img[99].onload = function () {
					hex[99] = rgbToHex(colorThief.getColor(img[99])[0], colorThief.getColor(img[99])[1], colorThief.getColor(img[99])[2]);
					img[100].onload = function () {
					hex[100] = rgbToHex(colorThief.getColor(img[100])[0], colorThief.getColor(img[100])[1], colorThief.getColor(img[100])[2]);
					allocation_chart.data.datasets[0].backgroundColor[100] = hex[100];
					};
					allocation_chart.data.datasets[0].backgroundColor[99] = hex[99];
					};
					allocation_chart.data.datasets[0].backgroundColor[98] = hex[98];
					};
					allocation_chart.data.datasets[0].backgroundColor[97] = hex[97];
					};
					allocation_chart.data.datasets[0].backgroundColor[96] = hex[96];
					};
					allocation_chart.data.datasets[0].backgroundColor[95] = hex[95];
					};
					allocation_chart.data.datasets[0].backgroundColor[94] = hex[94];
					};
					allocation_chart.data.datasets[0].backgroundColor[93] = hex[93];
					};
					allocation_chart.data.datasets[0].backgroundColor[92] = hex[92];
					};
					allocation_chart.data.datasets[0].backgroundColor[91] = hex[91];
					};
					allocation_chart.data.datasets[0].backgroundColor[90] = hex[90];
					};
					allocation_chart.data.datasets[0].backgroundColor[89] = hex[89];
					};
					allocation_chart.data.datasets[0].backgroundColor[88] = hex[88];
					};
					allocation_chart.data.datasets[0].backgroundColor[87] = hex[87];
					};
					allocation_chart.data.datasets[0].backgroundColor[86] = hex[86];
					};
					allocation_chart.data.datasets[0].backgroundColor[85] = hex[85];
					};
					allocation_chart.data.datasets[0].backgroundColor[84] = hex[84];
					};
					allocation_chart.data.datasets[0].backgroundColor[83] = hex[83];
					};
					allocation_chart.data.datasets[0].backgroundColor[82] = hex[82];
					};
					allocation_chart.data.datasets[0].backgroundColor[81] = hex[81];
					};
					allocation_chart.data.datasets[0].backgroundColor[80] = hex[80];
					};
					allocation_chart.data.datasets[0].backgroundColor[79] = hex[79];
					};
					allocation_chart.data.datasets[0].backgroundColor[78] = hex[78];
					};
					allocation_chart.data.datasets[0].backgroundColor[77] = hex[77];
					};
					allocation_chart.data.datasets[0].backgroundColor[76] = hex[76];
					};
					allocation_chart.data.datasets[0].backgroundColor[75] = hex[75];
					};
					allocation_chart.data.datasets[0].backgroundColor[74] = hex[74];
					};
					allocation_chart.data.datasets[0].backgroundColor[73] = hex[73];
					};
					allocation_chart.data.datasets[0].backgroundColor[72] = hex[72];
					};
					allocation_chart.data.datasets[0].backgroundColor[71] = hex[71];
					};
					allocation_chart.data.datasets[0].backgroundColor[70] = hex[70];
					};
					allocation_chart.data.datasets[0].backgroundColor[69] = hex[69];
					};
					allocation_chart.data.datasets[0].backgroundColor[68] = hex[68];
					};
					allocation_chart.data.datasets[0].backgroundColor[67] = hex[67];
					};
					allocation_chart.data.datasets[0].backgroundColor[66] = hex[66];
					};
					allocation_chart.data.datasets[0].backgroundColor[65] = hex[65];
					};
					allocation_chart.data.datasets[0].backgroundColor[64] = hex[64];
					};
					allocation_chart.data.datasets[0].backgroundColor[63] = hex[63];
					};
					allocation_chart.data.datasets[0].backgroundColor[62] = hex[62];
					};
					allocation_chart.data.datasets[0].backgroundColor[61] = hex[61];
					};
					allocation_chart.data.datasets[0].backgroundColor[60] = hex[60];
					};
					allocation_chart.data.datasets[0].backgroundColor[59] = hex[59];
					};
					allocation_chart.data.datasets[0].backgroundColor[58] = hex[58];
					};
					allocation_chart.data.datasets[0].backgroundColor[57] = hex[57];
					};
					allocation_chart.data.datasets[0].backgroundColor[56] = hex[56];
					};
					allocation_chart.data.datasets[0].backgroundColor[55] = hex[55];
					};
					allocation_chart.data.datasets[0].backgroundColor[54] = hex[54];
					};
					allocation_chart.data.datasets[0].backgroundColor[53] = hex[53];
					};
					allocation_chart.data.datasets[0].backgroundColor[52] = hex[52];
					};
					allocation_chart.data.datasets[0].backgroundColor[51] = hex[51];
					};
					allocation_chart.data.datasets[0].backgroundColor[50] = hex[50];
					};
					allocation_chart.data.datasets[0].backgroundColor[49] = hex[49];
					};
					allocation_chart.data.datasets[0].backgroundColor[48] = hex[48];
					};
					allocation_chart.data.datasets[0].backgroundColor[47] = hex[47];
					};
					allocation_chart.data.datasets[0].backgroundColor[46] = hex[46];
					};
					allocation_chart.data.datasets[0].backgroundColor[45] = hex[45];
					};
					allocation_chart.data.datasets[0].backgroundColor[44] = hex[44];
					};
					allocation_chart.data.datasets[0].backgroundColor[43] = hex[43];
					};
					allocation_chart.data.datasets[0].backgroundColor[42] = hex[42];
					};
					allocation_chart.data.datasets[0].backgroundColor[41] = hex[41];
					};
					allocation_chart.data.datasets[0].backgroundColor[40] = hex[40];
					};
					allocation_chart.data.datasets[0].backgroundColor[39] = hex[39];
					};
					allocation_chart.data.datasets[0].backgroundColor[38] = hex[38];
					};
					allocation_chart.data.datasets[0].backgroundColor[37] = hex[37];
					};
					allocation_chart.data.datasets[0].backgroundColor[36] = hex[36];
					};
					allocation_chart.data.datasets[0].backgroundColor[35] = hex[35];
					};
					allocation_chart.data.datasets[0].backgroundColor[34] = hex[34];
					};
					allocation_chart.data.datasets[0].backgroundColor[33] = hex[33];
					};
					allocation_chart.data.datasets[0].backgroundColor[32] = hex[32];
					};
					allocation_chart.data.datasets[0].backgroundColor[31] = hex[31];
					};
					allocation_chart.data.datasets[0].backgroundColor[30] = hex[30];
					};
					allocation_chart.data.datasets[0].backgroundColor[29] = hex[29];
					};
					allocation_chart.data.datasets[0].backgroundColor[28] = hex[28];
					};
					allocation_chart.data.datasets[0].backgroundColor[27] = hex[27];
					};
					allocation_chart.data.datasets[0].backgroundColor[26] = hex[26];
					};
					allocation_chart.data.datasets[0].backgroundColor[25] = hex[25];
					};
					allocation_chart.data.datasets[0].backgroundColor[24] = hex[24];
					};
					allocation_chart.data.datasets[0].backgroundColor[23] = hex[23];
					};
					allocation_chart.data.datasets[0].backgroundColor[22] = hex[22];
					};
					allocation_chart.data.datasets[0].backgroundColor[21] = hex[21];
					};
					allocation_chart.data.datasets[0].backgroundColor[20] = hex[20];
					};
					allocation_chart.data.datasets[0].backgroundColor[19] = hex[19];
					};
					allocation_chart.data.datasets[0].backgroundColor[18] = hex[18];
					};
					allocation_chart.data.datasets[0].backgroundColor[17] = hex[17];
					};
					allocation_chart.data.datasets[0].backgroundColor[16] = hex[16];
					};
					allocation_chart.data.datasets[0].backgroundColor[15] = hex[15];
					};
					allocation_chart.data.datasets[0].backgroundColor[14] = hex[14];
					};
					allocation_chart.data.datasets[0].backgroundColor[13] = hex[13];
					};
					allocation_chart.data.datasets[0].backgroundColor[12] = hex[12];
					};
					allocation_chart.data.datasets[0].backgroundColor[11] = hex[11];
					};
					allocation_chart.data.datasets[0].backgroundColor[10] = hex[10];
					};
					allocation_chart.data.datasets[0].backgroundColor[9] = hex[9];
					};
					allocation_chart.data.datasets[0].backgroundColor[8] = hex[8];
					};
					allocation_chart.data.datasets[0].backgroundColor[7] = hex[7];
					};
					allocation_chart.data.datasets[0].backgroundColor[6] = hex[6];
					};
					allocation_chart.data.datasets[0].backgroundColor[5] = hex[5];
					};
					allocation_chart.data.datasets[0].backgroundColor[4] = hex[4];
					};
					allocation_chart.data.datasets[0].backgroundColor[3] = hex[3];
					};
					allocation_chart.data.datasets[0].backgroundColor[2] = hex[2];
					};
					allocation_chart.data.datasets[0].backgroundColor[1] = hex[1];
					};
					allocation_chart.data.datasets[0].backgroundColor[0] = hex[0];
					};
					})(hex);
					 */

					(function (hex) {
						img[0].onload = function () {
							allocation_chart.data.datasets[0].backgroundColor[0] = rgbToHex(colorThief.getColor(img[0])[0], colorThief.getColor(img[0])[1], colorThief.getColor(img[0])[2]);
							img[1].onload = function () {
								allocation_chart.data.datasets[0].backgroundColor[1] = rgbToHex(colorThief.getColor(img[1])[0], colorThief.getColor(img[1])[1], colorThief.getColor(img[1])[2]);
								img[2].onload = function () {
									allocation_chart.data.datasets[0].backgroundColor[2] = rgbToHex(colorThief.getColor(img[2])[0], colorThief.getColor(img[2])[1], colorThief.getColor(img[2])[2]);
									img[3].onload = function () {
										allocation_chart.data.datasets[0].backgroundColor[3] = rgbToHex(colorThief.getColor(img[3])[0], colorThief.getColor(img[3])[1], colorThief.getColor(img[3])[2]);
										img[4].onload = function () {
											allocation_chart.data.datasets[0].backgroundColor[4] = rgbToHex(colorThief.getColor(img[4])[0], colorThief.getColor(img[4])[1], colorThief.getColor(img[4])[2]);
											img[5].onload = function () {
												allocation_chart.data.datasets[0].backgroundColor[5] = rgbToHex(colorThief.getColor(img[5])[0], colorThief.getColor(img[5])[1], colorThief.getColor(img[5])[2]);
												img[6].onload = function () {
													allocation_chart.data.datasets[0].backgroundColor[6] = rgbToHex(colorThief.getColor(img[6])[0], colorThief.getColor(img[6])[1], colorThief.getColor(img[6])[2]);
													img[7].onload = function () {
														allocation_chart.data.datasets[0].backgroundColor[7] = rgbToHex(colorThief.getColor(img[7])[0], colorThief.getColor(img[7])[1], colorThief.getColor(img[7])[2]);
														img[8].onload = function () {
															allocation_chart.data.datasets[0].backgroundColor[8] = rgbToHex(colorThief.getColor(img[8])[0], colorThief.getColor(img[8])[1], colorThief.getColor(img[8])[2]);
															img[9].onload = function () {
																allocation_chart.data.datasets[0].backgroundColor[9] = rgbToHex(colorThief.getColor(img[9])[0], colorThief.getColor(img[9])[1], colorThief.getColor(img[9])[2]);
																img[10].onload = function () {
																	allocation_chart.data.datasets[0].backgroundColor[10] = rgbToHex(colorThief.getColor(img[10])[0], colorThief.getColor(img[10])[1], colorThief.getColor(img[10])[2]);
																	img[11].onload = function () {
																		allocation_chart.data.datasets[0].backgroundColor[11] = rgbToHex(colorThief.getColor(img[11])[0], colorThief.getColor(img[11])[1], colorThief.getColor(img[11])[2]);
																		img[12].onload = function () {
																			allocation_chart.data.datasets[0].backgroundColor[12] = rgbToHex(colorThief.getColor(img[12])[0], colorThief.getColor(img[12])[1], colorThief.getColor(img[12])[2]);
																			img[13].onload = function () {
																				allocation_chart.data.datasets[0].backgroundColor[13] = rgbToHex(colorThief.getColor(img[13])[0], colorThief.getColor(img[13])[1], colorThief.getColor(img[13])[2]);
																				img[14].onload = function () {
																					allocation_chart.data.datasets[0].backgroundColor[14] = rgbToHex(colorThief.getColor(img[14])[0], colorThief.getColor(img[14])[1], colorThief.getColor(img[14])[2]);
																					img[15].onload = function () {
																						allocation_chart.data.datasets[0].backgroundColor[15] = rgbToHex(colorThief.getColor(img[15])[0], colorThief.getColor(img[15])[1], colorThief.getColor(img[15])[2]);
																						img[16].onload = function () {
																							allocation_chart.data.datasets[0].backgroundColor[16] = rgbToHex(colorThief.getColor(img[16])[0], colorThief.getColor(img[16])[1], colorThief.getColor(img[16])[2]);
																							img[17].onload = function () {
																								allocation_chart.data.datasets[0].backgroundColor[17] = rgbToHex(colorThief.getColor(img[17])[0], colorThief.getColor(img[17])[1], colorThief.getColor(img[17])[2]);
																								img[18].onload = function () {
																									allocation_chart.data.datasets[0].backgroundColor[18] = rgbToHex(colorThief.getColor(img[18])[0], colorThief.getColor(img[18])[1], colorThief.getColor(img[18])[2]);
																									img[19].onload = function () {
																										allocation_chart.data.datasets[0].backgroundColor[19] = rgbToHex(colorThief.getColor(img[19])[0], colorThief.getColor(img[19])[1], colorThief.getColor(img[19])[2]);
																										img[20].onload = function () {
																											allocation_chart.data.datasets[0].backgroundColor[20] = rgbToHex(colorThief.getColor(img[20])[0], colorThief.getColor(img[20])[1], colorThief.getColor(img[20])[2]);
																											img[21].onload = function () {
																												allocation_chart.data.datasets[0].backgroundColor[21] = rgbToHex(colorThief.getColor(img[21])[0], colorThief.getColor(img[21])[1], colorThief.getColor(img[21])[2]);
																												img[22].onload = function () {
																													allocation_chart.data.datasets[0].backgroundColor[22] = rgbToHex(colorThief.getColor(img[22])[0], colorThief.getColor(img[22])[1], colorThief.getColor(img[22])[2]);
																													img[23].onload = function () {
																														allocation_chart.data.datasets[0].backgroundColor[23] = rgbToHex(colorThief.getColor(img[23])[0], colorThief.getColor(img[23])[1], colorThief.getColor(img[23])[2]);
																														img[24].onload = function () {
																															allocation_chart.data.datasets[0].backgroundColor[24] = rgbToHex(colorThief.getColor(img[24])[0], colorThief.getColor(img[24])[1], colorThief.getColor(img[24])[2]);
																															img[25].onload = function () {
																																allocation_chart.data.datasets[0].backgroundColor[25] = rgbToHex(colorThief.getColor(img[25])[0], colorThief.getColor(img[25])[1], colorThief.getColor(img[25])[2]);
																																img[26].onload = function () {
																																	allocation_chart.data.datasets[0].backgroundColor[26] = rgbToHex(colorThief.getColor(img[26])[0], colorThief.getColor(img[26])[1], colorThief.getColor(img[26])[2]);
																																	img[27].onload = function () {
																																		allocation_chart.data.datasets[0].backgroundColor[27] = rgbToHex(colorThief.getColor(img[27])[0], colorThief.getColor(img[27])[1], colorThief.getColor(img[27])[2]);
																																		img[28].onload = function () {
																																			allocation_chart.data.datasets[0].backgroundColor[28] = rgbToHex(colorThief.getColor(img[28])[0], colorThief.getColor(img[28])[1], colorThief.getColor(img[28])[2]);
																																			img[29].onload = function () {
																																				allocation_chart.data.datasets[0].backgroundColor[29] = rgbToHex(colorThief.getColor(img[29])[0], colorThief.getColor(img[29])[1], colorThief.getColor(img[29])[2]);
																																				img[30].onload = function () {
																																					allocation_chart.data.datasets[0].backgroundColor[30] = rgbToHex(colorThief.getColor(img[30])[0], colorThief.getColor(img[30])[1], colorThief.getColor(img[30])[2]);
																																					img[31].onload = function () {
																																						allocation_chart.data.datasets[0].backgroundColor[31] = rgbToHex(colorThief.getColor(img[31])[0], colorThief.getColor(img[31])[1], colorThief.getColor(img[31])[2]);
																																						img[32].onload = function () {
																																							allocation_chart.data.datasets[0].backgroundColor[32] = rgbToHex(colorThief.getColor(img[32])[0], colorThief.getColor(img[32])[1], colorThief.getColor(img[32])[2]);
																																							img[33].onload = function () {
																																								allocation_chart.data.datasets[0].backgroundColor[33] = rgbToHex(colorThief.getColor(img[33])[0], colorThief.getColor(img[33])[1], colorThief.getColor(img[33])[2]);
																																								img[34].onload = function () {
																																									allocation_chart.data.datasets[0].backgroundColor[34] = rgbToHex(colorThief.getColor(img[34])[0], colorThief.getColor(img[34])[1], colorThief.getColor(img[34])[2]);
																																									img[35].onload = function () {
																																										allocation_chart.data.datasets[0].backgroundColor[35] = rgbToHex(colorThief.getColor(img[35])[0], colorThief.getColor(img[35])[1], colorThief.getColor(img[35])[2]);
																																										img[36].onload = function () {
																																											allocation_chart.data.datasets[0].backgroundColor[36] = rgbToHex(colorThief.getColor(img[36])[0], colorThief.getColor(img[36])[1], colorThief.getColor(img[36])[2]);
																																											img[37].onload = function () {
																																												allocation_chart.data.datasets[0].backgroundColor[37] = rgbToHex(colorThief.getColor(img[37])[0], colorThief.getColor(img[37])[1], colorThief.getColor(img[37])[2]);
																																												img[38].onload = function () {
																																													allocation_chart.data.datasets[0].backgroundColor[38] = rgbToHex(colorThief.getColor(img[38])[0], colorThief.getColor(img[38])[1], colorThief.getColor(img[38])[2]);
																																													img[39].onload = function () {
																																														allocation_chart.data.datasets[0].backgroundColor[39] = rgbToHex(colorThief.getColor(img[39])[0], colorThief.getColor(img[39])[1], colorThief.getColor(img[39])[2]);
																																														img[40].onload = function () {
																																															allocation_chart.data.datasets[0].backgroundColor[40] = rgbToHex(colorThief.getColor(img[40])[0], colorThief.getColor(img[40])[1], colorThief.getColor(img[40])[2]);
																																															img[41].onload = function () {
																																																allocation_chart.data.datasets[0].backgroundColor[41] = rgbToHex(colorThief.getColor(img[41])[0], colorThief.getColor(img[41])[1], colorThief.getColor(img[41])[2]);
																																																img[42].onload = function () {
																																																	allocation_chart.data.datasets[0].backgroundColor[42] = rgbToHex(colorThief.getColor(img[42])[0], colorThief.getColor(img[42])[1], colorThief.getColor(img[42])[2]);
																																																	img[43].onload = function () {
																																																		allocation_chart.data.datasets[0].backgroundColor[43] = rgbToHex(colorThief.getColor(img[43])[0], colorThief.getColor(img[43])[1], colorThief.getColor(img[43])[2]);
																																																		img[44].onload = function () {
																																																			allocation_chart.data.datasets[0].backgroundColor[44] = rgbToHex(colorThief.getColor(img[44])[0], colorThief.getColor(img[44])[1], colorThief.getColor(img[44])[2]);
																																																			img[45].onload = function () {
																																																				allocation_chart.data.datasets[0].backgroundColor[45] = rgbToHex(colorThief.getColor(img[45])[0], colorThief.getColor(img[45])[1], colorThief.getColor(img[45])[2]);
																																																				img[46].onload = function () {
																																																					allocation_chart.data.datasets[0].backgroundColor[46] = rgbToHex(colorThief.getColor(img[46])[0], colorThief.getColor(img[46])[1], colorThief.getColor(img[46])[2]);
																																																					img[47].onload = function () {
																																																						allocation_chart.data.datasets[0].backgroundColor[47] = rgbToHex(colorThief.getColor(img[47])[0], colorThief.getColor(img[47])[1], colorThief.getColor(img[47])[2]);
																																																						img[48].onload = function () {
																																																							allocation_chart.data.datasets[0].backgroundColor[48] = rgbToHex(colorThief.getColor(img[48])[0], colorThief.getColor(img[48])[1], colorThief.getColor(img[48])[2]);
																																																							img[49].onload = function () {
																																																								allocation_chart.data.datasets[0].backgroundColor[49] = rgbToHex(colorThief.getColor(img[49])[0], colorThief.getColor(img[49])[1], colorThief.getColor(img[49])[2]);
																																																								img[50].onload = function () {
																																																									allocation_chart.data.datasets[0].backgroundColor[50] = rgbToHex(colorThief.getColor(img[50])[0], colorThief.getColor(img[50])[1], colorThief.getColor(img[50])[2]);
																																																									img[51].onload = function () {
																																																										allocation_chart.data.datasets[0].backgroundColor[51] = rgbToHex(colorThief.getColor(img[51])[0], colorThief.getColor(img[51])[1], colorThief.getColor(img[51])[2]);
																																																										img[52].onload = function () {
																																																											allocation_chart.data.datasets[0].backgroundColor[52] = rgbToHex(colorThief.getColor(img[52])[0], colorThief.getColor(img[52])[1], colorThief.getColor(img[52])[2]);
																																																											img[53].onload = function () {
																																																												allocation_chart.data.datasets[0].backgroundColor[53] = rgbToHex(colorThief.getColor(img[53])[0], colorThief.getColor(img[53])[1], colorThief.getColor(img[53])[2]);
																																																												img[54].onload = function () {
																																																													allocation_chart.data.datasets[0].backgroundColor[54] = rgbToHex(colorThief.getColor(img[54])[0], colorThief.getColor(img[54])[1], colorThief.getColor(img[54])[2]);
																																																													img[55].onload = function () {
																																																														allocation_chart.data.datasets[0].backgroundColor[55] = rgbToHex(colorThief.getColor(img[55])[0], colorThief.getColor(img[55])[1], colorThief.getColor(img[55])[2]);
																																																														img[56].onload = function () {
																																																															allocation_chart.data.datasets[0].backgroundColor[56] = rgbToHex(colorThief.getColor(img[56])[0], colorThief.getColor(img[56])[1], colorThief.getColor(img[56])[2]);
																																																															img[57].onload = function () {
																																																																allocation_chart.data.datasets[0].backgroundColor[57] = rgbToHex(colorThief.getColor(img[57])[0], colorThief.getColor(img[57])[1], colorThief.getColor(img[57])[2]);
																																																																img[58].onload = function () {
																																																																	allocation_chart.data.datasets[0].backgroundColor[58] = rgbToHex(colorThief.getColor(img[58])[0], colorThief.getColor(img[58])[1], colorThief.getColor(img[58])[2]);
																																																																	img[59].onload = function () {
																																																																		allocation_chart.data.datasets[0].backgroundColor[59] = rgbToHex(colorThief.getColor(img[59])[0], colorThief.getColor(img[59])[1], colorThief.getColor(img[59])[2]);
																																																																		img[60].onload = function () {
																																																																			allocation_chart.data.datasets[0].backgroundColor[60] = rgbToHex(colorThief.getColor(img[60])[0], colorThief.getColor(img[60])[1], colorThief.getColor(img[60])[2]);
																																																																			img[61].onload = function () {
																																																																				allocation_chart.data.datasets[0].backgroundColor[61] = rgbToHex(colorThief.getColor(img[61])[0], colorThief.getColor(img[61])[1], colorThief.getColor(img[61])[2]);
																																																																				img[62].onload = function () {
																																																																					allocation_chart.data.datasets[0].backgroundColor[62] = rgbToHex(colorThief.getColor(img[62])[0], colorThief.getColor(img[62])[1], colorThief.getColor(img[62])[2]);
																																																																					img[63].onload = function () {
																																																																						allocation_chart.data.datasets[0].backgroundColor[63] = rgbToHex(colorThief.getColor(img[63])[0], colorThief.getColor(img[63])[1], colorThief.getColor(img[63])[2]);
																																																																						img[64].onload = function () {
																																																																							allocation_chart.data.datasets[0].backgroundColor[64] = rgbToHex(colorThief.getColor(img[64])[0], colorThief.getColor(img[64])[1], colorThief.getColor(img[64])[2]);
																																																																							img[65].onload = function () {
																																																																								allocation_chart.data.datasets[0].backgroundColor[65] = rgbToHex(colorThief.getColor(img[65])[0], colorThief.getColor(img[65])[1], colorThief.getColor(img[65])[2]);
																																																																								img[66].onload = function () {
																																																																									allocation_chart.data.datasets[0].backgroundColor[66] = rgbToHex(colorThief.getColor(img[66])[0], colorThief.getColor(img[66])[1], colorThief.getColor(img[66])[2]);
																																																																									img[67].onload = function () {
																																																																										allocation_chart.data.datasets[0].backgroundColor[67] = rgbToHex(colorThief.getColor(img[67])[0], colorThief.getColor(img[67])[1], colorThief.getColor(img[67])[2]);
																																																																										img[68].onload = function () {
																																																																											allocation_chart.data.datasets[0].backgroundColor[68] = rgbToHex(colorThief.getColor(img[68])[0], colorThief.getColor(img[68])[1], colorThief.getColor(img[68])[2]);
																																																																											img[69].onload = function () {
																																																																												allocation_chart.data.datasets[0].backgroundColor[69] = rgbToHex(colorThief.getColor(img[69])[0], colorThief.getColor(img[69])[1], colorThief.getColor(img[69])[2]);
																																																																												img[70].onload = function () {
																																																																													allocation_chart.data.datasets[0].backgroundColor[70] = rgbToHex(colorThief.getColor(img[70])[0], colorThief.getColor(img[70])[1], colorThief.getColor(img[70])[2]);
																																																																													img[71].onload = function () {
																																																																														allocation_chart.data.datasets[0].backgroundColor[71] = rgbToHex(colorThief.getColor(img[71])[0], colorThief.getColor(img[71])[1], colorThief.getColor(img[71])[2]);
																																																																														img[72].onload = function () {
																																																																															allocation_chart.data.datasets[0].backgroundColor[72] = rgbToHex(colorThief.getColor(img[72])[0], colorThief.getColor(img[72])[1], colorThief.getColor(img[72])[2]);
																																																																															img[73].onload = function () {
																																																																																allocation_chart.data.datasets[0].backgroundColor[73] = rgbToHex(colorThief.getColor(img[73])[0], colorThief.getColor(img[73])[1], colorThief.getColor(img[73])[2]);
																																																																																img[74].onload = function () {
																																																																																	allocation_chart.data.datasets[0].backgroundColor[74] = rgbToHex(colorThief.getColor(img[74])[0], colorThief.getColor(img[74])[1], colorThief.getColor(img[74])[2]);
																																																																																	img[75].onload = function () {
																																																																																		allocation_chart.data.datasets[0].backgroundColor[75] = rgbToHex(colorThief.getColor(img[75])[0], colorThief.getColor(img[75])[1], colorThief.getColor(img[75])[2]);
																																																																																		img[76].onload = function () {
																																																																																			allocation_chart.data.datasets[0].backgroundColor[76] = rgbToHex(colorThief.getColor(img[76])[0], colorThief.getColor(img[76])[1], colorThief.getColor(img[76])[2]);
																																																																																			img[77].onload = function () {
																																																																																				allocation_chart.data.datasets[0].backgroundColor[77] = rgbToHex(colorThief.getColor(img[77])[0], colorThief.getColor(img[77])[1], colorThief.getColor(img[77])[2]);
																																																																																				img[78].onload = function () {
																																																																																					allocation_chart.data.datasets[0].backgroundColor[78] = rgbToHex(colorThief.getColor(img[78])[0], colorThief.getColor(img[78])[1], colorThief.getColor(img[78])[2]);
																																																																																					img[79].onload = function () {
																																																																																						allocation_chart.data.datasets[0].backgroundColor[79] = rgbToHex(colorThief.getColor(img[79])[0], colorThief.getColor(img[79])[1], colorThief.getColor(img[79])[2]);
																																																																																						img[80].onload = function () {
																																																																																							allocation_chart.data.datasets[0].backgroundColor[80] = rgbToHex(colorThief.getColor(img[80])[0], colorThief.getColor(img[80])[1], colorThief.getColor(img[80])[2]);
																																																																																							img[81].onload = function () {
																																																																																								allocation_chart.data.datasets[0].backgroundColor[81] = rgbToHex(colorThief.getColor(img[81])[0], colorThief.getColor(img[81])[1], colorThief.getColor(img[81])[2]);
																																																																																								img[82].onload = function () {
																																																																																									allocation_chart.data.datasets[0].backgroundColor[82] = rgbToHex(colorThief.getColor(img[82])[0], colorThief.getColor(img[82])[1], colorThief.getColor(img[82])[2]);
																																																																																									img[83].onload = function () {
																																																																																										allocation_chart.data.datasets[0].backgroundColor[83] = rgbToHex(colorThief.getColor(img[83])[0], colorThief.getColor(img[83])[1], colorThief.getColor(img[83])[2]);
																																																																																										img[84].onload = function () {
																																																																																											allocation_chart.data.datasets[0].backgroundColor[84] = rgbToHex(colorThief.getColor(img[84])[0], colorThief.getColor(img[84])[1], colorThief.getColor(img[84])[2]);
																																																																																											img[85].onload = function () {
																																																																																												allocation_chart.data.datasets[0].backgroundColor[85] = rgbToHex(colorThief.getColor(img[85])[0], colorThief.getColor(img[85])[1], colorThief.getColor(img[85])[2]);
																																																																																												img[86].onload = function () {
																																																																																													allocation_chart.data.datasets[0].backgroundColor[86] = rgbToHex(colorThief.getColor(img[86])[0], colorThief.getColor(img[86])[1], colorThief.getColor(img[86])[2]);
																																																																																													img[87].onload = function () {
																																																																																														allocation_chart.data.datasets[0].backgroundColor[87] = rgbToHex(colorThief.getColor(img[87])[0], colorThief.getColor(img[87])[1], colorThief.getColor(img[87])[2]);
																																																																																														img[88].onload = function () {
																																																																																															allocation_chart.data.datasets[0].backgroundColor[88] = rgbToHex(colorThief.getColor(img[88])[0], colorThief.getColor(img[88])[1], colorThief.getColor(img[88])[2]);
																																																																																															img[89].onload = function () {
																																																																																																allocation_chart.data.datasets[0].backgroundColor[89] = rgbToHex(colorThief.getColor(img[89])[0], colorThief.getColor(img[89])[1], colorThief.getColor(img[89])[2]);
																																																																																																img[90].onload = function () {
																																																																																																	allocation_chart.data.datasets[0].backgroundColor[90] = rgbToHex(colorThief.getColor(img[90])[0], colorThief.getColor(img[90])[1], colorThief.getColor(img[90])[2]);
																																																																																																	img[91].onload = function () {
																																																																																																		allocation_chart.data.datasets[0].backgroundColor[91] = rgbToHex(colorThief.getColor(img[91])[0], colorThief.getColor(img[91])[1], colorThief.getColor(img[91])[2]);
																																																																																																		img[92].onload = function () {
																																																																																																			allocation_chart.data.datasets[0].backgroundColor[92] = rgbToHex(colorThief.getColor(img[92])[0], colorThief.getColor(img[92])[1], colorThief.getColor(img[92])[2]);
																																																																																																			img[93].onload = function () {
																																																																																																				allocation_chart.data.datasets[0].backgroundColor[93] = rgbToHex(colorThief.getColor(img[93])[0], colorThief.getColor(img[93])[1], colorThief.getColor(img[93])[2]);
																																																																																																				img[94].onload = function () {
																																																																																																					allocation_chart.data.datasets[0].backgroundColor[94] = rgbToHex(colorThief.getColor(img[94])[0], colorThief.getColor(img[94])[1], colorThief.getColor(img[94])[2]);
																																																																																																					img[95].onload = function () {
																																																																																																						allocation_chart.data.datasets[0].backgroundColor[95] = rgbToHex(colorThief.getColor(img[95])[0], colorThief.getColor(img[95])[1], colorThief.getColor(img[95])[2]);
																																																																																																						img[96].onload = function () {
																																																																																																							allocation_chart.data.datasets[0].backgroundColor[96] = rgbToHex(colorThief.getColor(img[96])[0], colorThief.getColor(img[96])[1], colorThief.getColor(img[96])[2]);
																																																																																																							img[97].onload = function () {
																																																																																																								allocation_chart.data.datasets[0].backgroundColor[97] = rgbToHex(colorThief.getColor(img[97])[0], colorThief.getColor(img[97])[1], colorThief.getColor(img[97])[2]);
																																																																																																								img[98].onload = function () {
																																																																																																									allocation_chart.data.datasets[0].backgroundColor[98] = rgbToHex(colorThief.getColor(img[98])[0], colorThief.getColor(img[98])[1], colorThief.getColor(img[98])[2]);
																																																																																																									img[99].onload = function () {
																																																																																																										allocation_chart.data.datasets[0].backgroundColor[99] = rgbToHex(colorThief.getColor(img[99])[0], colorThief.getColor(img[99])[1], colorThief.getColor(img[99])[2]);
																																																																																																										img[100].onload = function () {
																																																																																																											allocation_chart.data.datasets[0].backgroundColor[100] = rgbToHex(colorThief.getColor(img[100])[0], colorThief.getColor(img[100])[1], colorThief.getColor(img[100])[2]);
																																																																																																										};
																																																																																																									};
																																																																																																								};
																																																																																																							};
																																																																																																						};
																																																																																																					};
																																																																																																				};
																																																																																																			};
																																																																																																		};
																																																																																																	};
																																																																																																};
																																																																																															};
																																																																																														};
																																																																																													};
																																																																																												};
																																																																																											};
																																																																																										};
																																																																																									};
																																																																																								};
																																																																																							};
																																																																																						};
																																																																																					};
																																																																																				};
																																																																																			};
																																																																																		};
																																																																																	};
																																																																																};
																																																																															};
																																																																														};
																																																																													};
																																																																												};
																																																																											};
																																																																										};
																																																																									};
																																																																								};
																																																																							};
																																																																						};
																																																																					};
																																																																				};
																																																																			};
																																																																		};
																																																																	};
																																																																};
																																																															};
																																																														};
																																																													};
																																																												};
																																																											};
																																																										};
																																																									};
																																																								};
																																																							};
																																																						};
																																																					};
																																																				};
																																																			};
																																																		};
																																																	};
																																																};
																																															};
																																														};
																																													};
																																												};
																																											};
																																										};
																																									};
																																								};
																																							};
																																						};
																																					};
																																				};
																																			};
																																		};
																																	};
																																};
																															};
																														};
																													};
																												};
																											};
																										};
																									};
																								};
																							};
																						};
																					};
																				};
																			};
																		};
																	};
																};
															};
														};
													};
												};
											};
										};
									};
								};
							};
						};
					})(hex);

					//console.log(hex);
					//console.log(hex.length);
					/*img[1].onload = function () {
					console.log(colorThief.getColor(img[1]));
					};*/

					//var img = 'icon/' + sources[i].toLowerCase() + '.png';

					//var img = 'icon/etc.png';


					//hex = rgbToHex(colorThief.getColor(imgObj)[0], colorThief.getColor(imgObj)[1], colorThief.getColor(imgObj)[2]);
					//console.log(hex);
				}

				/*for (i = 0; i < 101; i++) {
				text_ += "img[" + i + "].onload = function () {\nallocation_chart.data.datasets[0].backgroundColor[" + i + "] = rgbToHex(colorThief.getColor(img[" + i + "])[0], colorThief.getColor(img[" + i + "])[1], colorThief.getColor(img[" + i + "])[2]);\n";
				text__ += "allocation_chart.data.datasets[0].backgroundColor[" + i + "] = hex[" + i + "];};\n";
				}
				console.log(text_);*/
			},
				100);
		} else {
			console.log("Loading...");
		};
	}
});

function vars() {
	return assetsArray1 + "SPLIT" + price1_;
}

function rgbToHex(r, g, b) {
	return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function getLang() {
	if (navigator.languages != undefined)
		return navigator.languages[0];
	else
		return 'en-US';
}
