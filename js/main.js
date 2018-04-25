$(document).ready(function() {

  var growth = 4;
  var prestigeExpModifier = 5;
  var fluffyxp = [];

  function prettify(number) {
    if (number >= 1000 && number < 10000) {
      return Math.floor(number);
    }
    var base = Math.floor(Math.log(number)/Math.log(1000));
    number /= Math.pow(1000, base);
    if (number >= 999.5) {
      number /= 1000;
      ++base;
    }
    var suffices = [
      'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'Ud',
      'Dd', 'Td', 'Qad', 'Qid', 'Sxd', 'Spd', 'Od', 'Nd', 'V', 'Uv', 'Dv',
      'Tv', 'Qav', 'Qiv', 'Sxv', 'Spv', 'Ov', 'Nv', 'Tg', 'Utg', 'Dtg', 'Ttg',
      'Qatg', 'Qitg', 'Sxtg', 'Sptg', 'Otg', 'Ntg', 'Qaa', 'Uqa', 'Dqa', 'Tqa',
      'Qaqa', 'Qiqa', 'Sxqa', 'Spqa', 'Oqa', 'Nqa', 'Qia', 'Uqi', 'Dqi',
      'Tqi', 'Qaqi', 'Qiqi', 'Sxqi', 'Spqi', 'Oqi', 'Nqi', 'Sxa', 'Usx',
      'Dsx', 'Tsx', 'Qasx', 'Qisx', 'Sxsx', 'Spsx', 'Osx', 'Nsx', 'Spa',
      'Usp', 'Dsp', 'Tsp', 'Qasp', 'Qisp', 'Sxsp', 'Spsp', 'Osp', 'Nsp',
      'Og', 'Uog', 'Dog', 'Tog', 'Qaog', 'Qiog', 'Sxog', 'Spog', 'Oog',
      'Nog', 'Na', 'Un', 'Dn', 'Tn', 'Qan', 'Qin', 'Sxn', 'Spn', 'On',
      'Nn', 'Ct', 'Uc'
    ];
    var suffix = suffices[base-1];
    return parseFloat(number).toFixed(2) + suffix;
  }

  function log10(val) {
    return Math.log(val) / Math.LN10;
  }

  function firstLevel(save) {
    return 1000 * Math.pow(prestigeExpModifier, save.global.fluffyPrestige);
  }

  function calculateLevel(save) {
    var level = Math.floor(log10(((save.global.fluffyExp / firstLevel(save)) * (growth - 1)) + 1) / log10(growth));
    var capableLevels = save.portal.Capable.level;
    if (level > capableLevels) {
      level = capableLevels;
    }
    return level;
  }

  function calculateXp(save) {
    var level = calculateLevel(save);
    var experience = save.global.fluffyExp;
    var removeExp = 0;
    var firstlevel = firstLevel(save);
    if (level > 0){
      removeExp = Math.floor(firstlevel * ((Math.pow(growth, level) - 1) / (growth - 1)));
    }
    var totalNeeded = Math.floor(firstlevel * ((Math.pow(growth, level + 1) - 1) / (growth - 1)));
    experience -= removeExp;
    totalNeeded -= removeExp;
    return [level, experience, totalNeeded];
  }

  function importPerks(input) {
    var levels = {};
    try {
      levels = JSON.parse(LZString.decompressFromBase64(input));
    } catch (e) {
      alert("Something went really wrong, what did you even just try to do?!");
    }
    if (!levels) {
      alert('Error importing save');
      return;
    }
    if (levels.global) {
      var perksetup = levels.portal;
      var keys = Object.keys(perksetup);
      var perks = {};
      for (var x in keys) {
        perks[keys[x]] = perksetup[keys[x]].level;
      }
      fluffyxp = calculateXp(levels);
      $('#level').text(fluffyxp[0]);
      $('#curxp').text(prettify(fluffyxp[1]) + ' / ' + prettify(fluffyxp[2]));

      return perks;
    }
    else {
      alert('Import a full save to see more stats!');
    }
    return levels;
  }

  function calculate(levels) {
    var curious = levels.Curious || 0;
    var cunning = levels.Cunning || 0;
    $('#curious').val(curious);
    $('#cunning').val(cunning);
  }

  function drawXP() {
    var cun = parseInt($('#cunning').val());
    var cur = parseInt($('#curious').val());
    var z = parseInt($('#zone').val());
    var xp = 0;
    var xparr = [];
    $('#result tbody').html('');
    for (i = 301; i <= z; i++) {
      xp = (50 + (cur * 30)) * Math.pow(1.015, (i - 300)) * (1 + (cun * 0.25));
      xparr.push(xp);
    }
    var sum = xparr.reduce(function (a, c) {
      return a + c;
    }, 0);
    var xptolevel = Math.floor(fluffyxp[2]) - Math.floor(fluffyxp[1]);
    var runs = Math.ceil(xptolevel/sum);
    $('#runs').text(runs);
    $('#xpperrun').text(prettify(sum.toFixed(0)));
    var htmlarr = xparr.map(function(row, index) {
      var i = parseInt(index)+301;
      return '<tr><td>' + i + '</td><td>' + prettify(row) + '</td></tr>';
    });
    $('#result tbody').html(htmlarr.reverse().join());
  }

  $('#calculator').on('submit', function(e) {
    e.preventDefault();
    if ($('#perks').val()) {
      var perks = importPerks($('#perks').val());
      calculate(perks);
    }
    drawXP();
  });

});
