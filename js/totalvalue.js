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

var investments = "";
var investmentsArray = [];

var assetsArray = [];
var amountsArray = [];

var buyPricesArray = [];

var dates = [];

var allhisto = [];

var histoarray = [];

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

			investments = raw.split('\n', 4)[3];

			var currency1 = raw.split('\n', 2)[1];

			investmentsArray = investments.split(":");

			for (i = 0; i < investmentsArray.length; i++) {
				if (i % 3 == 0 && i != 0) {
					if (!(investmentsArray[i] >> 0) > 0) {
						assetsArray.push(investmentsArray[i]);
					}
				}
				if (i % 2 == 0 && i != 0) {
					if (!(investmentsArray[i] >> 0) > 0) {
						if (investmentsArray[i] == "BUY") {
							dates.push(investmentsArray[i - 1]);
							buyPricesArray.push(investmentsArray[i + 2]);
							amountsArray.push(investmentsArray[i + 3].replace(" ", ""));
						}
					}
				}
			}

			assetsArray.pop();

			var totalholdings1 = raw.split('\n', 1)[0];

			var assetsArray1 = totalholdings1.split(":");

			var totalvalue1 = 0;
			var totalcrypto1 = 0;

			var price1_ = [];

			for (i = 0; i < assetsArray1.length; i++) {
				if (i % 2 == 0) {
					var api_url = "https://min-api.cryptocompare.com/data/price?fsym=" + assetsArray1[i] + "&tsyms=USD";

					xmlhttp.open("GET", api_url, false);
					xmlhttp.send();

					if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
						var price1 = xmlhttp.responseText.split(':')[1].replace("}", "");
						price1_.push(price1 * assetsArray1[i + 1]);

						totalvalue1 += price1 * assetsArray1[i + 1];

						if (assetsArray1[i] != "USD") {
							totalcrypto1 += price1 * assetsArray1[i + 1];
						}
					}
				}
			}

			//var initialvalues = [];

			//var totalinvested = 0;

			var actionsArray = [];

			/*for (i = 0; i < investmentsArray.length; i++) {
			if (investmentsArray[i] == "BUY" || investmentsArray[i] == "SELL") {
			actionsArray.push(investmentsArray[i]);
			}
			}

			for (i = 0; i < actionsArray.length; i++) {
			if (actionsArray[i] == "BUY") {
			totalinvested += amountsArray[i] * buyPricesArray[i];
			initialvalues.push(totalinvested);
			}
			}*/

			for (i = 0; i < amountsArray.length; i++) {
				amountsArray[i] = parseFloat(amountsArray[i]);
			}

			for (i = 0; i < dates.length; i++) {
				const sumObject = amountsArray.reduce((acc, e, i, arr) => {
						acc[assetsArray[i]] = (acc[assetsArray[i]] || 0) + e;
						return acc;
					}, {});

				assetsArray.pop();
				amountsArray.pop();

				allhisto.push(Object.entries(sumObject).map(el => el[0] + ":" + el[1]).join(":"));
			}

			for (i = 0; i < allhisto.length; i++) {
				histoarray.push([allhisto[i]]);
			}

			var valuebydate = [];

			var timestamps = [];

			dates.reverse();

			for (i = 0; i < histoarray.length; i++) {
				var item = histoarray[i].toString().split(":");

				var i_value = 0;

				timestamps.push(Date.parse(dates[i]) / 1000);

				for (j = 0; j < item.length; j++) {
					if (j % 2 == 0) {
						var api_url = "https://min-api.cryptocompare.com/data/dayAvg?fsym=" + item[j] + "&tsym=USD&toTs=" + timestamps[i];

						xmlhttp.open("GET", api_url, false);
						xmlhttp.send();

						if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
							var price = xmlhttp.responseText.substring(7, xmlhttp.responseText.indexOf(","));

							i_value += price * item[j + 1];
						}
					}
				}

				valuebydate.push(i_value);
			}

			valuebydate.reverse();

			valuebydate.push(totalvalue1);
			//initialvalues.push(initialvalues[initialvalues.length - 1]);

			//console.log(initialvalues);
			console.log(valuebydate);

			/*var profitsarray = [];

			for (i = 0; i < initialvalues.length; i++) {
			profitsarray.push(100 * (valuebydate[i] / initialvalues[i] - 1));
			}*/

			dates.reverse();

			dates.push(moment().format("MM/DD/YYYY"));

			Chart.defaults.NegativeTransparentLine = Chart.helpers.clone(Chart.defaults.line);
			Chart.controllers.NegativeTransparentLine = Chart.controllers.line.extend({
					update: function () {
						// get the min and max values
						var min = Math.min.apply(null, this.chart.data.datasets[0].data);
						var max = Math.max.apply(null, this.chart.data.datasets[0].data);
						var yScale = this.getScaleForId(this.getDataset().yAxisID);

						// figure out the pixels for these and the value 0
						var top = yScale.getPixelForValue(max);
						var zero = yScale.getPixelForValue(0);
						var bottom = yScale.getPixelForValue(min);

						// build a gradient that switches color at the 0 point
						var ctx = this.chart.chart.ctx;
						var gradient = ctx.createLinearGradient(0, top, 0, bottom);
						var ratio = Math.min((zero - top) / (bottom - top), 1);
						gradient.addColorStop(0, 'rgba(30,144,255,0.4)');
						gradient.addColorStop(Math.abs(ratio), 'rgba(30,144,255,0.4)');
						gradient.addColorStop(Math.abs(ratio), 'rgba(30,144,255,0.4)');
						gradient.addColorStop(1, 'rgba(30,144,255,0.4)');
						this.chart.data.datasets[0].backgroundColor = gradient;

						return Chart.controllers.line.prototype.update.apply(this, arguments);
					}
				});

			var ctx = document.getElementById("value-chart").getContext("2d");

			var rate = 0;

			var url = "https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=" + currency1;

			xmlhttp.open("GET", url, false);
			xmlhttp.send();

			if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
				rate = xmlhttp.responseText.split(':')[1].replace("}", "");
			}

			for (i = 0; i < valuebydate.length; i++) {
				if (valuebydate[i] !== null) {
					valuebydate[i] = parseFloat((valuebydate[i] * rate).toFixed(2));
				}
			}

			for (i = 0; i < valuebydate.length; i++) {
				valuebydate[i] = valuebydate[i] || null;
			}

			console.log(valuebydate);

			var myLineChart = new Chart(ctx, {
					type: 'NegativeTransparentLine',
					data: {
						labels: dates,
						datasets: [{
								yAxisID: 'y-axis-0',
								label: "Total value (" + currency1 + ")",
								strokeColor: "rgba(60,91,87,1)",
								pointColor: "rgba(60,91,87,1)",
								pointStrokeColor: "#58606d",
								data: valuebydate
							}
						]
					},
					options: {
						scales: {
							xAxes: [{
									type: 'time',
									distribution: 'series'
								}
							]
						},
						bezierCurve: false,
						elements: {
							line: {
								tension: 0
							}
						},
						legend: {
							display: false,
						}
					}
				});
		}
	}
});
