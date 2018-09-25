$(document).ready(function() {

  var growth = 4;
  var prestigeExpModifier = 5;
  var fluffyxp = [];
  var perkConfig = {
    Cunning: {
      priceBase: 1e11
    },
    Curious: {
      priceBase: 1e14
    },
  };

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
      if (levels.portal.Capable.level == 0) {
        alert('You need to have fluffy to use this calculator');
        return;
      }
      var perksetup = levels.portal;
      var keys = Object.keys(perksetup);
      var perks = {};
      for (var x in keys) {
        perks[keys[x]] = perksetup[keys[x]].level;
      }
      fluffyxp = calculateXp(levels);
      $('#level').text(fluffyxp[0]);
      $('#curxp').text(prettify(fluffyxp[1]) + ' / ' + prettify(fluffyxp[2]));
      calcStats(levels);
      return [perks, levels];
    }
    else {
      alert('Import a full save to see more stats!');
    }
    return levels;
  }

  function calculate(save, reset) {
    var levels = save[0];
    var all = save[1];
    if (!$('#curious').val().length) {
      var curious = levels.Curious || 0;
      $('#curious').val(curious);
    }
    if (!$('#cunning').val().length) {
      var cunning = levels.Cunning || 0;
      $('#cunning').val(cunning);
    }
    if (!$('#staff').val().length) {
      var staff = parseFloat(all.heirlooms.Staff.FluffyExp.currentBonus/100);
      $('#staff').val(staff);
    }
    if (!$('#classy').val().length) {
      var classy = levels.Classy || 0;
      $('#classy').val(classy);
    }
    if (reset) {
      $('#cunning').val(levels.Cunning);
      $('#curious').val(levels.Curious);
      $('#classy').val(levels.Classy);
      $('#staff').val(parseFloat(all.heirlooms.Staff.FluffyExp.currentBonus/100));
    }
  }

  function drawXP() {
    var cun = parseInt($('#cunning').val());
    var cur = parseInt($('#curious').val());
    var z = parseInt($('#zone').val());
    var classy = parseInt($('#classy').val());
    var daily = parseFloat($('#daily').val()) || 1;
    var staff = parseFloat($('#staff').val()) || 1;
    if (z > 800) {
      alert('Yeah right!');
      z = 301;
    }

    var xp = 0;
    var xparr = [];
    $('#result tbody').html('');
    var start = 301-(classy*2);
    for (i = start; i <= z; i++) {
      xp = xpPerZone(cur, cun, i, daily, staff, classy);
      xparr.push(xp);
    }
    var xptolevel = Math.floor(fluffyxp[2]) - Math.floor(fluffyxp[1]);
    var sum = xpPerRun(cur, cun, z, daily, staff, classy);
    var runs = Math.ceil(xptolevel/sum);
    $('#runs').text(runs);
    $('#xpperrun').text(prettify(sum.toFixed(0)));
    var htmlarr = xparr.map(function(row, index) {
      var i = parseInt(index)+start;
      if (index > (xparr.length - 10)) {
        return '<tr><td>' + i + '</td><td>' + prettify(row) + '</td></tr>';
      } else {
        return '<tr class="hidden"><td>' + i + '</td><td>' + prettify(row) + '</td></tr>';
      }
    });
    var showall = '<a href="" id="showall">Show all</a>';
    $('#result tbody').html(htmlarr.reverse().join());
    if (!$('#result').find('#showall').length) {
      $('#result table').append(showall);
    }
  }

  function xpPerRun(curious, cunning, zone, daily, staff, classy) {
    var run = [];
    for (i = classy; i <= zone; i++) {
      run.push(xpPerZone(curious, cunning, i, daily, staff, classy));
    }
    return run.reduce(function (a, c) {
        return a + c;
    }, 0);
  }

  function xpPerZone(curious, cunning, zone, daily, staff, classy) {
    if (!daily) {
      daily = 1;
    }
    if (!staff) {
      staff = 1;
    } else {
      staff = 1 + parseFloat(staff);
    }

    if (!classy) {
      classy = 1;
    } else {
      classy = classy*2;
    }
    return (50 + (curious * 30)) * Math.pow(1.015, (zone - (300-classy))) * (1 + (cunning * 0.25)) * daily * staff;
  }

  $('#reimport').on('click', function() {
    if ($('#perks').val().length) {
      var perks = importPerks($('#perks').val());
      calculate(perks, true);
      $('#calculator').trigger('submit');
    }
  });

  $('#calculator').on('submit', function(e) {
    e.preventDefault();
    var perks = false;
    if ($('#perks').val().length) {
      perks = importPerks($('#perks').val());
      calculate(perks);
    }
    if (perks) {
      drawXP();
    }
  });

  $('#result').on('click', '#showall', function(e) {
    e.preventDefault();
    $('.hidden').removeClass('hidden');
  });

  function getCost(what, forceAmt){
    var toCheck = perkConfig[what];
    var tempLevel;
    var nextLevel;
    var toAmt;
    tempLevel = 0;
    nextLevel = tempLevel + forceAmt;
    var amt = 0;
    var growth = 1.3;
    for (var x = 0; x < forceAmt; x++){
      amt = Math.ceil(((tempLevel + x) / 2) + toCheck.priceBase * Math.pow(growth, tempLevel + x));
    }
    return amt;
  }

  function calcStats(save) {
    var spendable = save.resources.helium.owned + save.global.heliumLeftover;
    var curiousPoints = save.portal.Curious.level;
    var cunningPoints = save.portal.Cunning.level;
    var comboPoints = {
      cunning: cunningPoints,
      curious: curiousPoints
    };

    var cunningHe = spendable;
    var cunningCost = getCost('Cunning', cunningPoints);
    while (cunningHe > cunningCost) {
      cunningPoints++;
      cunningCost = getCost('Cunning', cunningPoints);
      cunningHe -= cunningCost;
    }

    var curiousHe = spendable;
    var curiousCost = getCost('Curious', curiousPoints);
    while (curiousHe > curiousCost) {
      curiousPoints++;
      curiousCost = getCost('Curious', curiousPoints);
      curiousHe -= curiousCost;
    }

    var comboHe = curiousHe;
    comboPoints.curious = curiousPoints;
    while (comboHe > cunningCost) {
      comboPoints.cunning++;
      cunningCost = getCost('Cunning', comboPoints.cunning);
      comboHe -= cunningCost;
    }
    var zone = $('#zone').val();
    if (!zone) {
      zone = classy;
    }
    var daily = $('#daily').val() || 1;
    var staff = parseFloat($('#staff').val()) || 1;
    if (save.heirlooms.Staff.FluffyExp.currentBonus) {
      staff = (save.heirlooms.Staff.FluffyExp.currentBonus/100);
    }

    var curRun = xpPerRun(curiousPoints, save.portal.Cunning.level, zone, daily, staff);
    var cunRun = xpPerRun(save.portal.Curious.level, cunningPoints, zone, daily, staff);
    var comboRun = xpPerRun(comboPoints.curious, comboPoints.cunning, zone, daily, staff);

    $('#curplus').text(prettify(curRun));
    $('#curamt').text('Curious only: ' + curiousPoints);

    $('#cunplus').text(prettify(cunRun));
    $('#cunamt').text('Cunning only: ' + cunningPoints);

    $('#complus').text(prettify(comboRun));
    $('#comcuramt').text('Curious: ' + comboPoints.curious);
    $('#comcunamt').html('&nbsp;Cunning: ' + comboPoints.cunning);
  }

});
