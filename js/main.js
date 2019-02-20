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
      $('#evolution').text(levels.global.fluffyPrestige);
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
    if (all.talents.fluffyExp.purchased) {
      $('#fluffocus').prop('checked', true);
    }
    var spireMod = 1;
    if (all.playerSpire) {
      if (all.playerSpire.traps.Knowledge) {
        var mod = 15;
        if (all.playerSpire.traps.Knowledge.level > 1) {
          mod += ((all.playerSpire.traps.Knowledge.level - 1) * 7.5);
        }
        if (mod > 15) {
          spireMod = mod;
        } else {
          spireMod = mod * this.owned;
        }
        spireMod = (mod * all.playerSpire.traps.Knowledge.owned) / 100 + 1;
      }
    }
    var evo = all.global.fluffyPrestige;
    if (reset) {
      $('#cunning').val(levels.Cunning);
      $('#curious').val(levels.Curious);
      $('#classy').val(levels.Classy);
      $('#staff').val(parseFloat(all.heirlooms.Staff.FluffyExp.currentBonus/100));
      $('#spire').val(spireMod);
      $('#evolution').text(evo);
    }
  }

  function drawXP() {
    var cun = parseInt($('#cunning').val());
    var cur = parseInt($('#curious').val());
    var z = parseInt($('#zone').val());
    var classy = parseInt($('#classy').val());
    var daily = parseFloat($('#daily').val()) || 1;
    var staff = parseFloat($('#staff').val()) || 1;
    var fluffocus = $('#fluffocus').prop('checked') ? parseFloat($('#evolution').text())/4 : 1;
    var spire = parseFloat($('#spire').val());
    if (z > 800) {
      alert('Yeah right!');
      z = 301;
    }

    var xp = 0;
    var xparr = [];
    $('#result tbody').html('');
    var start = 301-(classy*2);
    for (i = start; i <= z; i++) {
      xp = xpPerZone(cur, cun, i, daily, staff, classy, fluffocus, spire);
      xparr.push(xp);
    }
    var xptolevel = Math.floor(fluffyxp[2]) - Math.floor(fluffyxp[1]);
    var sum = xpPerRun(cur, cun, z, daily, staff, classy, fluffocus, spire);
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

  function xpPerRun(curious, cunning, zone, daily, staff, classy, fluffocus, spire) {
    var run = [];
    for (i = classy; i <= zone; i++) {
      run.push(xpPerZone(curious, cunning, i, daily, staff, classy, fluffocus, spire));
    }
    return run.reduce(function (a, c) {
        return a + c;
    }, 0);
  }

  function xpPerZone(curious, cunning, zone, daily, staff, classy, fluffocus, spire) {
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
    fluffocus += 1;
    return (50 + (curious * 30)) * Math.pow(1.015, (zone - (300-classy))) * (1 + (cunning * 0.25)) * daily * fluffocus * staff * spire;
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

});
