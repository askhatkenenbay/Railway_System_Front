let dropdown = $('#departure');

dropdown.empty();

dropdown.append('<option selected="true" disabled>Departure Station');
dropdown.prop('selectedIndex', 0);

const url = globalUrl + 'services/station';


$.getJSON(url, function (data) {
  $.each(data, function (key, entry) {
    dropdown.append($('<option>').text(entry.city).attr('value', entry.name).attr('id', entry.id));
  });
});

let drop = $('#destination');

drop.empty();

drop.append('<option selected="true" disabled>Destination Station');
drop.prop('selectedIndex', 0);

$.getJSON(url, function (data) {
  $.each(data, function (key, entry) {
    drop.append($('<option>').text(entry.city).attr('value', entry.name).attr('id', entry.id));
  })
});


$("#searchform").submit(false);
var table = $("#train-table");

var row_template = _.template("<tr><td><%=id%></td>\
<td><%=from%></td>\
<td><%=to%></td>\
<td><%=dtime%></td>\
<td><%=atime%></td>\
<td><%=price%></td>\
<td><button class='buybutton' onclick=searchTickets(<%=id%>,<%=fromorder%>,<%=toorder%>)>BUY</button></td> </tr>")
var ticketDate;



var found_trains = [];

function searchTrains(){
  let from = dropdown.find(":selected").attr('id');
  let to = drop.find(":selected").attr('id');
  if(from == null){
    from = 0;
  }
  if(to == null){
    to = 0;
  }
  let date = new Date($('#date-input').val());
  ticketDate = date;
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  $.ajax({
    type: 'get',
    url : globalUrl + 'services/routes',
    data:{
      "day" : day,
      "month" : month,
      "year" : year,
      "from" : from,
      "to" : to
    },
    success : function(r) {
      table.empty();
      let i = 0;  
      for(i = 0; i < r.length; i++){
        let train = r[i];
        console.log(train);
        table.append(row_template({
          from: train.from, 
          to: train.to,
          dtime: train.departure_time,
          atime: train.arrival_time,
          id: train.id,
          price: train.price,
          fromorder: train.from_order,
          toorder: train.to_order
        }));
        found_trains.push(train);
      }
      $([document.documentElement, document.body]).animate({
          scrollTop: $("#today").offset().top
      }, 100);
        
    },
    dataType : 'json',
    error: function(r) {
        alert("Please choose a date");
    }
  });
}

$("#search-trains").on('click', searchTrains);


function showForToday(){
  let now = new Date();

  let day = ("0" + now.getDate()).slice(-2);
  let month = ("0" + (now.getMonth() + 1)).slice(-2);

  let today = now.getFullYear()+"-"+(month)+"-"+(day) ;

  $('#date-input').val(today);
  searchTrains();

}


/* ticketsModal showing */
function showModal(){
  var modal = document.getElementById("ticketsModal");
  var span = document.getElementsByClassName("close")[0];
  // var open = document.getElementsByClassName('button')[0];

  modal.style.display = 'block';

  span.onclick = function() {
    modal.style.display = "none";
  }

  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }


}



var ticket_template = _.template('<tr> <td><%=place%></td> <td><%=wagon%></td> <td><%=stype%></td> <td><%=price%></td> <td><button class="buybutton">BUY</button></td> </tr>')
var ticket_table = $("#ticket-table");
var found_tickets  = [];


function searchTickets(train_id, from_order, to_order){
  let day = ticketDate.getDate();
  let month = ticketDate.getMonth() + 1;
  let year = ticketDate.getFullYear();
  return $.ajax({
    type: 'get',
    url : 'http://localhost:8080/dynamictodolist_war_exploded/services/routes/' + train_id + '/tickets',
    data:{
      "day" : day,
      "month" : month,
      "year" : year,
      "fromOrder" : from_order,
      "toOrder" : to_order
    },
    success : function(r) {
      let i = 0;  
      found_tickets = []
      for(i = 0; i < r.length; i++){
        let ticket = r[i];
        console.log(ticket);
        found_tickets.push(ticket);
      }
      showModal();
      
    },
    dataType : 'json',
    error: function(r) {
        alert("No Tickets Available");
    }
  });
}

function createTickets(train_id){
  let day = ticketDate.getDate();
  let month = ticketDate.getMonth() + 1;
  let year = ticketDate.getFullYear();
  token = $.session.get("auth_token");
  $.ajax({
    type: 'post',
    url : globalUrl + 'services/agent/create-seat-instances',
    contentType: 'application/x-www-form-urlencoded',
    data:{
      "day" : day,
      "month" : month,
      "year" : year,
      "train-id" : train_id
    },
    headers: {
      "Authorization": 'Bearer ' + token
    },
    success : function(r) {
      alert("Tickets for this date successfully created")
      
    },
    dataType : 'json',
    error: function(r) {
        alert("Tickets are already created");
    }
  });
}

/* Choosing a wagon number */

let wagonNumber = $('#choose-wagon-select');

wagonNumber.empty();

wagonNumber.append('<option selected="true" >0');
wagonNumber.prop('selectedIndex', 0);

const wgn = './assets/wagon.json';

/* NOT WGN - NUMBER OF WAGONS NEEDED*/
$.getJSON(wgn, function (data) {
  $.each(data, function (key, entry) {
    wagonNumber.append($('<option>').attr('value', entry.number).text(entry.number));
  })
});
 

$(document).ready(function(){
  $('#choose-wagon-select').on('change', function() {
    if ( this.value == '0')
    {
      $("#choose-seat-div").hide();
    }
    else
    {
      $("#choose-seat-div").show();
    }
  });
});

/* Choosing an availabe seat from a selected wagon */

let seatNumber = $('#choose-seat-select');

seatNumber.empty();

seatNumber.append('<option selected="true" disabled>0');
seatNumber.prop('selectedIndex', 0);


/* NOT WGN - NUMBER OF AVAILABLE SEATS NEEDED*/
// $.getJSON(wgn, function (data) {
//   $.each(data, function (key, entry) {
//     seatNumber.append($('<option>').attr('value', entry.number).text(entry.number));
//   })
// });


searchTickets().then(function(){
  let wagons = {};
  
  found_tickets.forEach(function(ticket){
    
    if(wagons[ticket.wagonNumber] !== true){
      wagons[ticket.wagonNumber] = true;
      seatNumber.append($('<option>').attr('value', ticket.wagonNumber).text(ticket.wagonNumber));
    }
  });
});


$(document).ready(function(){
  $('#choose-seat-select').on('change', function() {
    if ( this.value == '0')
    {
      $("#personal-info-form").hide();
    }
    else
    {
      $("#personal-info-form").show();
    }
  });
});


checkType().then( function (){
  if(userType === "agent"){
    row_template = _.template("<tr><td><%=id%></td>\
  <td><%=from%></td>\
  <td><%=to%></td>\
  <td><%=dtime%></td>\
  <td><%=atime%></td>\
  <td><%=price%></td>\
  <td><button class='buybutton' onclick=searchTickets(<%=id%>,<%=fromorder%>,<%=toorder%>)>BUY</button>\
  <button class='buybutton' onclick=createTickets(<%=id%>,<%=fromorder%>,<%=toorder%>)>CREATE TICKETS</button></td> </tr>")
  }
  showForToday();
});
