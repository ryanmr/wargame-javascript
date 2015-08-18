
function initialization() {

  var games = [];
  var diffs = [];
  var samples = 0;
  // measure

  var payload = {
    wargame: '',
    template: ''
  }

  var display = {
    stats: null,
    countdown: null,
    games: null,
    speed: null,
    score: null
  };

  var frame = {
    jq: null,
    iframe: null
  };

  function collect(iterations, time) {
    games.push(iterations);
    diffs.push(time);

    console.log('listener accepted data');

    update();
  }

  window.collector = collect;

  // get hooks to various elements
  function init() {
    display.frame = $('#frame');
    display.stats = $('#stats');
    display.countdown = $('#countdown');
    display.games = $('#games');
    display.speed = $('#speed');
    display.score = $('#score');
    display.start = $('#start');

    setup_payload();
    setup_start();
    setup_frame();
  }

  function setup_frame() {
    frame.jq = $('<iframe id="testframe" class="hidden" />');
    frame.iframe = frame.jq.get(0);
    display.frame.append(frame.iframe);
  }

  function setup_start() {
    display.start.on('click', function(e){
      start();
      e.preventDefault();
    });
  }

  function setup_payload() {
    $.ajax({
      dataType: 'text',
      url: 'resources/build/js/wargame.js',
    }).done(function(t1){
      payload.wargame = t1;
    }).then(function(){
      $.ajax({
        dataType: 'text', url: 'resources/templates/test-template.html'
      }).done(function(t2){
        payload.template = t2;
      }).then(function(){
        display.start.css('display', 'block');
      });
    });
  }

  function test() {
    var counter = 0; // iteration counter

    // setup performance timers ; TODO make an abstraction for this so other non-chrome's are supported
    var t1 = performance.now();
    var t2 = t1;

    // game loop for one second; this repeats 60 times for 1 minute of game time
    // this prevents the browser from marking this as a broken run-away script, hopefully

    while ((t2 - t1) <= 1000) {
      counter++;
      game();
      t2 = performance.now();
    }

    // push the values onto the array
    var time_difference = (t2 - t1);
    // record(counter, time_difference);
    listener(counter, time_difference);
  }


  function sample() {

    // increment test counter
    samples++

    console.log('sample %o: starting began', samples);

    test();

    console.log('sample %o: sample completed', samples);

    // update();

    if (games.length < 60) {
      setTimeout(sample, 0);
    }


  }

  function updateDisplay(games, speed) {
    display.games.html(games + " games");
    display.speed.html(speed.toFixed(4) + " g/ms");
    display.countdown.html( 60 - samples == -1 ? 0 : 60 - samples );
  }

  function updateDone(speed) {
    display.score.css('display', 'block');
    display.score.html('Score: <strong>' + Math.round(speed) + '</strong>');
  }

  function update(){
    if (games.length == 0 || diffs.length == 0) {
      updateDisplay(0, 0);
      return;
    }
    var sum_games = games.reduce((a,b) => a + b);
    var sum_diffs = diffs.reduce((a,b) => a + b);
    var speed = (sum_games / sum_diffs);

    console.log('sample %o: %o games took %o ms, or %o g/ms', games.length, sum_games, sum_diffs, speed);

    if (games.length >= 60) {
      console.log('done');
      setTimeout(function(){
        updateDone(speed);
      }, 500);
    }

    updateDisplay(sum_games, speed);
  }


  function start() {
    display.stats.css('display', 'block');
    display.start.hide();

    setTimeout(sample, 1000);
  }

  init();

  // Test: does the WarGame build actually work? Have it fail here instead, first.
(function(){
  let t1 = performance.now(), t2 = 0, n = 1000;
  for (let _i = 0; _i < 1000; _i++) {game();}
  t2 = performance.now() - t1;
  console.log('%d wargames: %s ms total; %s g/ms', n, t1.toFixed(4), (n/t2).toFixed(4));
})();

  (function(){
    let t1 = performance.now(), t2 = t1, n = 1000, i = 0;
    while ((t2 - t1) <= n) {
      i++;
      game();
      t2 = performance.now() - t1;
    }
    console.log('%d wargames: %s ms total; %s g/ms', i, n, (i/t2).toFixed(4));
  })();

}

window.onload = initialization;
