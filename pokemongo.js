//From https://stackoverflow.com/a/27943/1256925:
function distance(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
          Math.sin(dLon/2) * Math.sin(dLon/2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d * 1000; // distance in m
}
function deg2rad(deg) {
  return deg * (Math.PI/180)
}

function pad0(n) {
  return (n<10?'0':'')+n;
}

window.city = 'amsterdam';

function xors(url, req, callback) {
  var site = 'https://cors-anywhere.herokuapp.com/';
  //site = 'http://whateverorigin.org/get?callback=?&url=';
  //site = 'http://anyorigin.com/go/?callback=?&url=';
  $.ajax({
    url: site + url,
    data: req,
    method: 'GET',
    dataType: 'json',
    success: callback,
  });
}

function getList(callback) {
  xors('http://raw.githubusercontent.com/sindresorhus/pokemon/master/data/en.json', {}, function(data) {
    var $pokemons = $('#pokemons');
    for (var i=0;i<386;i++) { // 386 = # of gen 3 pokemon
      $('<option value="'+i+'">'+data[i]+'</option>').appendTo($pokemons);
    }
    callback ? callback() : null;
  });
}

function excludeList(includelist) {
  var exclude = [];
  $('#pokemons option').each(function() {
    if ((includelist ^ !this.selected)) exclude.push(this.value);
  });
  return exclude;
}

function getPokemon(callback) {
  var exclude = excludeList();
  window.lat = parseFloat($('#lat').val());
  window.lon = parseFloat($('#lon').val());
  var r = parseFloat($('#r').val());
  xors('http://'+city+'.pokehunt.me/raw_data', {
    pokemon: true,
    swLat: lat - r,
    swLng: lon - r,
    neLat: lat + r,
    neLng: lon + r,
    eids: exclude.join(','),
  }, function(data) {
    callback(data);
  });
}

function sortPokemon(a, b) {
  var sortcol = $('#sortcol').prop('cellIndex');
  var sortprop;
  switch (sortcol) {
    case 0: return parseInt(a.pokemon_id) > parseInt(b.pokemon_id); break;
    case 1: prop = 'pokemon_name'; break;
    case 2: return distance(lat, lon, a.latitude, a.longitude) > distance(lat, lon, b.latitude, b.longitude) ? 1 : -1; break;
    case 3: return parseInt(a.disappear_time) > parseInt(b.disappear_time) ? 1 : -1; break;
    case 4: prop = 'gender'; break;
    case 5: prop = 'cp'; break;
    case 6: 
      return (a.individual_attack + a.individual_defense + a.individual_stamina) >
             (b.individual_attack + b.individual_defense + b.individual_stamina) ? 1 : -1;
      break;
    case 7: prop = 'individual_attack'; break;
    case 8: prop = 'individual_defense'; break;
    case 9: prop = 'individual_stamina'; break;
    default: return parseInt(a.pokemon_id) > parseInt(b.pokemon_id) ? 1 : -1; break;
  }
  return a[prop] > b[prop] ? 1 : -1;
}

function showData(data) {
  var mons = data.pokemons;
  mons.sort(sortPokemon);
  $('#output tr ~ tr').remove();
  for (var i in mons) {
    var mon = mons[i];
    var d = new Date(mon.disappear_time);
    var $tr = $('<tr/>').data('despawn', mon.disappear_time);
    $('<td>'+mon.pokemon_id+'</td>').appendTo($tr);
    $('<td>'+mon.pokemon_name+'</td>').appendTo($tr);
    $('<td><a href="http://www.google.com/maps/place/'+mon.latitude+','+mon.longitude+'">'+
      distance(lat, lon, mon.latitude, mon.longitude).toFixed(0)+'m'+
      '</a></td>').appendTo($tr);
    $('<td>'+
      pad0(d.getMonth())+'/'+
      pad0(d.getDate())+' '+
      pad0(d.getHours())+':'+
      pad0(d.getMinutes())+':'+
      pad0(d.getSeconds())+
      '</td>').appendTo($tr);
    $('<td>'+(mon.gender == 1 ? '♂' : '♀')+'</td>').appendTo($tr);
    $('<td>'+(mon.cp?mon.cp:'-')+'</td>').appendTo($tr); // use CP to check if the stats of the pokemon are known
    $('<td>'+(mon.cp?mon.level:'-')+'</td>').appendTo($tr); // no CP known => no other stats known
    var iv = mon.cp ? ((mon.individual_attack+mon.individual_defense+mon.individual_stamina)/0.45).toFixed(0) + '%' : '-';
    $('<td>'+iv+'</td>').appendTo($tr);
    $('<td>'+(mon.cp?mon.individual_attack:'-')+'</td>').appendTo($tr);
    $('<td>'+(mon.cp?mon.individual_defense:'-')+'</td>').appendTo($tr);
    $('<td>'+(mon.cp?mon.individual_stamina:'-')+'</td>').appendTo($tr);
    $tr.appendTo('#output');
  }
}

$(function() {
  $('#r').on('mousemove', function() {
    $('#radius').html(this.value);
  });
  navigator.geolocation.getCurrentPosition(function(position) {
    $('#lat').val(position.coords.latitude);
    $('#lon').val(position.coords.longitude);
  });
  $('#radius').html($('#r').val());
  getList(function() {
    for (var i in document.cookie.split(',')) {
      $('#pokemons option').eq(i).prop('selected', true);
    }
  });
  $('#submit').click(function() {
    getPokemon(showData);
  });
  $('th').click(function() {
    $('#sortcol').removeAttr('id');
    $(this).attr('id', 'sortcol');
    getPokemon(showData);
  });
  $('#pokemons').on('change', function() {
    document.cookie = excludeList(true); // TODO: manage cookies more cleanly
  });
});
