(function () {

    var AJAX = function (file) {
        return new Promise(function (res, rej) {
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    res(JSON.parse(xhttp.responseText));
                }
            };
            xhttp.open('get', file, true);
            xhttp.send();
        });
    }

    var $ = function (selector) {
        var elem = document.querySelectorAll(selector);
        if (elem.length === 1) elem = elem[0];
        return elem;
    }

    var scene = {
        elems: $('div.scene'),
        show: function (id) {
            $('div#game-wrapper').style.backgroundColor = '#4EA0EC';
            for (var x = 0; x < scene.elems.length; x++) {
                scene.elems[x].style.display = 'none';
            }
            document.getElementById(id).style.display = 'block';
        },
        menu: function () {
            var $container = $('div#menu div.topics');
            AJAX('data/topics.json').then(function (topics) {
                if ($('div#menu div.topics div').length === 0) {
                    for (var x = 0; x < topics.length; x++) {
                        var topic = topics[x];
                        var elem = document.createElement('div');
                        elem.setAttribute('data-topic-num', x);
                        var icon = document.createElement('img');
                        icon.setAttribute('src', topic.icon);
                        elem.appendChild(icon);
                        elem.innerHTML += topic.title;
                        elem.classList.add('animated');
                        elem.classList.add('fadeIn');
                        elem.onclick = function () {
                            var num = parseInt(this.getAttribute('data-topic-num'));
                            scene.show('level');
                            scene.level(topics[num].slug);
                        }
                        $container.appendChild(elem);
                    }
                }
            });
        },
        level: function (url) {
            url = 'data/' + url + '.json';
            var num = 0;
            var points = 0;
            AJAX(url).then(function (questions) {
                function displayPoints(correct) {
                    var $points = $('div#answer span.points');
                    if (num === questions.length - 1) {
                        $('div#game-wrapper').style.backgroundColor = '#4EA0EC';
                        $points.innerText = points + '/' + questions.length;
                        $message = $('div#game-wrapper div#answer span.message');
                        $message.innerHTML += '<br /><br />Thanks for playing!';
                    } else if (correct) {
                        $points.innerText = '+1';
                    } else {
                        $points.innerText = '-1'
                    }
                }

                function correct() {
                    points++;
                    $('div#game-wrapper div#answer span.message').innerText = questions[num].right;
                    $('div#game-wrapper').style.backgroundColor = '#4FA570';
                    $('div#answer h1').innerText = 'Correct!';
                    displayPoints(true);
                }

                function wrong() {
                    $('div#game-wrapper div#answer span.message').innerText = questions[num].wrong;
                    $('div#game-wrapper').style.backgroundColor = '#E83324';
                    $('div#answer h1').innerText = 'False!';
                    displayPoints(false);
                }

                function askQuestion() {
                    $('div#game-wrapper').style.backgroundColor = '#4EA0EC';
                    scene.show('level');
                    var question = questions[num];
                    $('span#quote').innerText = "\"" + question.quote + "\"";
                    $('span#name').innerText = question.name;
                    $('div#controls-wrapper div.false').onclick = function () {
                        scene.show('answer');
                        if (question.fake) correct();
                        else wrong();
                    }
                    $('div#controls-wrapper div.true').onclick = function () {
                        scene.show('answer');
                        if (!question.fake) correct();
                        else wrong();
                    }
                    $('div#game-wrapper div#answer div.menu').onclick = function () {
                        scene.show('menu');
                    }
                    var $next = $('div#game-wrapper div#answer div.next');
                    if (num === questions.length - 1) $next.style.display = 'none';
                    else $next.style.display = 'inline-block';
                    $next.onclick = function () {
                        num++;
                        if (num < questions.length) askQuestion();
                        else scene.show('menu');
                    }
                }
                askQuestion();
            });
        },
        init: function () {
            scene.menu();
        }
    }

    scene.init();
    scene.show('menu');

})();