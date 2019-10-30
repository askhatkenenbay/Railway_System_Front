let dropdown = $('#departure');

dropdown.empty();

dropdown.append('<option selected="true" disabled>Choose Departure Station>');
dropdown.prop('selectedIndex', 0);

const url = 'stations.json';

$.getJSON(url, function (data) {
  $.each(data, function (key, entry) {
    dropdown.append($('<option>').text(entry.city).attr('value', entry.name).attr('id', entry.id));
  });
});

let drop = $('#destination');

drop.empty();

drop.append('<option selected="true" disabled>Choose Destination Station>');
drop.prop('selectedIndex', 0);

$.getJSON(url, function (data) {
  $.each(data, function (key, entry) {
    drop.append($('<option>').text(entry.city).attr('value', entry.name).attr('id', entry.id));
  })
});


$.getJSON('routes.json', function(data) {
    $.each(data, function (index, item) {

    var eachrow = "<tr>"
    + "<td>" + item.origin_city + "</td>"
    + "<td>" + item.destination_city + "</td>"
    + "</tr>";
$('#tbody').append(eachrow);

})});