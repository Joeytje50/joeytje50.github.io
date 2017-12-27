//From https://stackoverflow.com/a/27943/1256925:
function distance(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
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
  var site = 'http://cors-anywhere.herokuapp.com/';
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
      $('<option value="'+(i-1)+'">'+data[i]+'</option>').appendTo($pokemons);
    }
    callback();
  });
}

function getPokemon(callback) {
  var exclude = [];
  $('#pokemons option').each(function() {
    if (!this.selected) exclude.push(this.value);
  });
  var latlong = [parseFloat($('#lat').val()), parseFloat($('#lon').val())];
  var r = parseFloat($('#r').val());
  xors('http://'+city+'.pokehunt.me/raw_data', {
    pokemon: true,
    swLat: latlong[0] - r,
    swLng: latlong[1] - r,
    neLat: latlong[0] + r,
    neLng: latlong[1] + r,
    eids: exclude.join(','),
  }, function(data) {
    callback(data);
  });
}

function showData(data) {
  for (var i in data.pokemons) {
    var mon = data.pokemons[i];
    var d = new Date(mon.disappear_time);
    var $tr = $('<tr/>').data('despawn', mon.disappear_time);
    $('<td>'+mon.pokemon_id+'</td>').appendTo($tr);
    $('<td>'+mon.pokemon_name+'</td>').appendTo($tr);
    $('<td><a href="http://www.google.com/maps/place/'+mon.latitude+','+mon.longitude+'">'+
      distance(parseFloat($('#lat').val()), parseFloat($('#lon').val()), mon.latitude, mon.longitude).toFixed(0)+'m'+
      '</a></td>').appendTo($tr);
    $('<td>'+
      pad0(d.getMonth())+'/'+
      pad0(d.getDate())+' '+
      pad0(d.getHours())+':'+
      pad0(d.getMinutes())+':'+
      pad0(d.getSeconds())+
      '</td>').appendTo($tr);
    $('<td>'+(mon.gender == 1 ? '♂' : '♀')+'</td>').appendTo($tr);
    $('<td>'+(mon.cp?mon.cp:'?')+'</td>').appendTo($tr); // use CP to check if the stats of the pokemon are known
    $('<td>'+(mon.cp?mon.level:'?')+'</td>').appendTo($tr); // no CP known => no other stats known
    $('<td>'+((mon.individual_attack+mon.individual_defense+mon.individual_stamina)/0.45).toFixed(0)+'</td>').appendTo($tr);
    $('<td>'+mon.individual_attack+'</td>').appendTo($tr);
    $('<td>'+mon.individual_defense+'</td>').appendTo($tr);
    $('<td>'+mon.individual_stamina+'</td>').appendTo($tr);
    $tr.appendTo('#output');
  }
}

$(function() {
  $('#r').on('mousemove', function() {
    $('#range').html(this.value);
  });
  navigator.geolocation.getCurrentPosition(function(position) {
    $('#lat').val(position.coords.latitude);
    $('#lng').val(position.coords.longitude);
  });
  $('#range').html($('#r').val());
  getList();
  $('#submit').click(function() {
    getPokemon(showData);
  });
});
