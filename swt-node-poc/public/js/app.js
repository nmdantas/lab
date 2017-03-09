(function(ng) {
    'use strict';

    ng.module('benchmarkApp', []).controller('benchmarkController', benchmarkController);

    benchmarkController.$inject = ['$http'];

    function benchmarkController($http) {
        var self = this;

        var route = '/api/v0/user/login';
        var appToken = 'NTAwNDU0MzgxRDU4OTg2NUI1OEU=';
        var body = {
            username: 'n.moraes.dantas@gmail.com',
            password: '123',
            keepAlive: false,
            applicationId: 5
        };
        var context = null;
        var myChart = null;

        self.servers = {
            '1': { 
                root: 'http://192.169.175.187:1337', 
                name: 'GoDaddy'
            },
            '2': {
                root: 'https://fabbrika-160320.appspot.com',
                name: 'Google Cloud'
            }, 
            '3': {
                root: 'https://swt-api.mybluemix.net',
                name: 'Bluemix'
            }
        };
        self.selectedServer = 0;
        self.resume = {};
        self.details = [];
        self.statistics = {
            n: 0,
            k: 0,
            max: 0,
            min: 0,
            a: 0,
            h: 0,
            data: []
        };
        self.total = {
            begin: null,
            end: null,
            calls: 0,
            elapsed: 0,
            lapse: 0,
            sum: 0,
            average: 0
        };
        self.parameter = {
            limit: 50,
            lapse: 500,
            processing: false
        };

        self.initTest = function() {
            self.resume = {};
            self.details = [];
            self.statistics = {
                n: 0,
                k: 0,
                max: 0,
                min: 0,
                a: 0,
                h: 0,
                data: []
            };
            self.total = {
                begin: null,
                end: null,
                calls: 0,
                elapsed: 0,
                lapse: 0,
                sum: 0,
                average: 0
            };				

            var url = self.servers[self.selectedServer].root + route;
            var config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'App ' + appToken
                }
            };

            self.total.begin = new Date();
            self.parameter.processing = true;
            self.progress = 0.00;
            
            if (myChart) {
                myChart.clear();
            }

            var i = 0;

            var interval = setInterval(function() {
                if (i < self.parameter.limit) {
                    config.index = i;
                    config.key = (new Date()).getTime();

                    $http.post(url, body, config).then(successCallback, errorCallback);	

                    i++;
                } else {
                    clearInterval(interval);
                }
            }, self.parameter.lapse);
            // for (var i = 0; i < self.parameter.limit; i ++) {
            // 	config.index = i;
            // 	config.key = (new Date()).getTime();

            // 	$http.post(url, body, config).then(successCallback, errorCallback);
            // }
        }

        function successCallback(response) {
            var begin = new Date(response.config.key);
            var end = new Date();
            var detail = {
                index: response.config.index,
                token: response.data.accessToken,
                begin: begin,
                end: end,
                elapsed: end - begin 
            };

            self.details.push(detail);
            self.total.lapse += self.parameter.lapse;
            self.total.sum += detail.elapsed;

            if (++self.total.calls == self.parameter.limit) {
                self.total.end = new Date();
                self.total.elapsed = self.total.end - self.total.begin - self.total.lapse;
                self.total.average = self.total.sum / self.total.calls;

                self.parameter.processing = false;

                var entries = [];
                
                for (var i = 0; i < self.details.length; i++) {
                    entries.push(self.details[i].elapsed);
                }

                self.statistics = calculateStatistic(entries);
                createChart(self.statistics);
            }

            // Atualiza a barra de progresso
            self.progress = (self.total.calls / self.parameter.limit * 100).toString() + '%';
        }

        function errorCallback(response) {
            console.log(response);
        }


        function calculateStatistic(entries) {
            var statistics = {
                n: 0,
                k: 0,
                max: 0,
                min: 0,
                a: 0,
                h: 0,
                data: []
            };				
            var n = statistics.n = entries.length;
            var k1 = Math.sqrt(n);
            var k2 = 1 + 3.3 * Math.log10(n);
            var k = statistics.k = parseInt(Math.max(k1, k2));
            var max = statistics.max = Math.max.apply(null, entries);
            var min = statistics.min = Math.min.apply(null, entries);
            var a = statistics.a = max - min;
            var h = statistics.h = Math.trunc(a / k) + 1;
            var from = min;
            var to = min + h - 1;

            for (var i = 1; i <= k; i++) {
                var interval = [];
                interval.push(from);
                interval.push(to);
                
                from += h;
                to += h;

                statistics.data.push({
                    class: i,
                    interval: interval,
                    frequency: 0,
                    percentage: 0.0
                });
            }

            for (var i = 0; i < n; i++) {
                var index = Math.trunc((entries[i] - min) / h);

                statistics.data[index].frequency++;
                statistics.data[index].percentage = (statistics.data[index].frequency / n * 100.00).toFixed(2);
            }

            return statistics;
        }

        function createChart(statistics) {
            var x = [];
            var y = [];

            for (var i = 0; i < statistics.data.length; i++) {
                x.push(statistics.data[i].interval);
                y.push(statistics.data[i].percentage);
            }

            context = document.getElementById("myChart");
            myChart = new Chart(context, {
                type: 'radar',
                data: {
                    labels: x,
                    datasets: [{
                        label: '% by Interval',
                        data: y,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255,99,132,1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero:true
                            }
                        }]
                    }
                }
            });
        } 
    }
})(angular);