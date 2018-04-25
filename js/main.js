$(document).ready(function() {

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
      return perks;
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
    $('#result tbody').html('');
    for (i = 301; i <= z; ++i) {
      xp = (50 + (cur * 30)) * Math.pow(1.015, (i - 300)) * (1 + (cun * 0.25));
      $('#result tbody').html($('#result tbody').html() + '<tr><td>' + i + '</td><td>' + Math.floor(xp) + '</td></tr>');
    }
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
