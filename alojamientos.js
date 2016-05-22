// Show accomodations from a JSON file in a map.
// JSON file with accomodations is an adaption of the XML file
// with accomodations in Madrid from the open data portal of
// Ayuntamiento de Madrid (as of April 2016)
// Simple version. Doesn't work well if some of the fields are not defined.
// (for example, if there are no pictures)
//
var hselec=undefined
var seleccion=undefined;
var data ={}
var total={}
var google = {}
function show_accomodation(){
  var textoHtml = '';
  var accomodation = accomodations[$(this).attr('no')];
  var lat = accomodation.geoData.latitude;
  var lon = accomodation.geoData.longitude;
  var url = accomodation.basicData.web;
  var name = accomodation.basicData.name;
  var desc = accomodation.basicData.body;
  //var img = accomodation.multimedia.media[0].url;
  var cat = accomodation.extradata.categorias.categoria.item[1]['#text'];
  var dir = accomodation.geoData.address;
  var ciu = accomodation.geoData.subAdministrativeArea;
  var subcat = accomodation.extradata.categorias.categoria
   .subcategorias.subcategoria.item[1]['#text'];
  L.marker([lat, lon]).addTo(map)
	 .bindPopup('<a href="' + url + '">' + name + '</a><br/>')
	 .openPopup();
  map.setView([lat, lon], 15);
  $('#desc').html('<h1>' + name + '</h1>'+ '<h3>'+ dir + ciu +'</h3>'
   + '<p> ' + cat +' <--> ' + subcat + '</p>'
   + desc );
  hselec = $(this).attr('no');
  mostrargoogle()
  var descalo = desc;
  $('#descalo').html('<h1>' + name + '</h1>'+ '<h3>'+ dir + ciu +'</h3>'
   + '<p> ' + cat +' <--> ' + subcat + '</p>'
   + descalo );
   if(accomodation.multimedia != null){
     if (accomodation.multimedia.media.length !=null){
       textoHtml+='<li class="active" data-target="#myCarousel" data-slide-to="0"></li>'
       for(var j=1;j< accomodation.multimedia.media.length; j++){
         textoHtml+= '<li data-target="#myCarousel" data-slide-to="'+ j +'"></li>'
       }
       $('.carousel-indicators').html(textoHtml)
       textoHtml = '';
       var textoHtml2 = '';
       textoHtml2+='<div class="item active"> <img src="'+ accomodation.multimedia.media[0].url +'" alt="chania"></div>'
       for(var j=1;j< accomodation.multimedia.media.length; j++){
           textoHtml2+='<div class="item"> <img src="'+ accomodation.multimedia.media[j].url +'" alt="chania"></div>'
         }
       $('.carousel-inner').html(textoHtml2)
       $('#myCarousel').carousel().show();
     }
   }else{
     $('#myCarousel').carousel().hide();
   }

   if(cat = null){
     cat = '';
   }

};

function get_accomodations(){
  $.getJSON("alojamientos.json", function(data) {
    $('#get').html('');
    accomodations = data.serviceList.service

    var list = '<h2>Selecciona un hotel</h2>'+'<p></p>'
    list = list + '<ul >'
    for (var i = 0; i < accomodations.length; i++) {
      list = list + '<li class="draggable" no=' + i + '>' + accomodations[i].basicData.title + '</li>';
    }
    list = list + '</ul>';

    $('#list').html(list);
    $('#hoteles').html(list);
    $('.ppal li').click(show_accomodation);

    $('.draggable').draggable({
      appendTo:"body",
      helper:"clone",
      revert:true,
    });
  });
};

function cargarcol(){
  $("#formcargar").show();
}
function guardarcol(){
  $("#formguardar").show();
}

function introcargar(){
  var url = $("#url").val();
  data = {}
  google = {}
  $.getJSON(url, function(datos) {
    console.log("DATOS : ")
    console.log(datos)
    for(var name in datos){
      if(name == "colecciones"){
        var lista = '<h2>Colecciones</h3></br>' + '<ul id="listacol">';
        console.log("DATOS colecciones: ")
        console.log(datos[name])
        data = datos[name]
        for (dat in datos[name]){
          lista =lista +'<li id="'+dat+'"> '+ dat + '</li>';
        }
        lista = lista + '</ul>'
        $('#col').html(lista);
        $("#listacol li").click(function(){
            seleccion=$(this).attr("id");
            actualizarcol();
        });
      }else{
        for (dat in datos[name]){
          console.log("DATOS colecciones: ")
          console.log(datos[name])
          google = datos[name]
        }
      }
    }
  })
}

function introguardar(){
  var token = $("#token").val();
  var repositorio = $("#repo").val();
  var usuario = $("#usu").val();
  var fichero = $("#fich").val();
  var github = new Github({
  	token: token,
  	auth: "oauth"
  });
  total["google"]=google
  total["colecciones"] = data
  var myrepo = github.getRepo(usuario, repositorio);
  myrepo.write('gh-pages', fichero,
		 JSON.stringify(total),
		 "coleccion", function(err) {
		     console.log (err)
		 });
}

function introColeccion(){
  var coleccion = $("#coleccion").val();
  var lista = '<h2>Colecciones</h3></br>' + '<ul id="listacol">';
  var arr=[]
  data[coleccion]=arr;

  for(var name in data){
    lista =lista +'<li id="'+name+'"> '+ name + '</li>';
  }
  lista = lista + '</ul>'
  $('#col').html(lista);
  $("#listacol li").click(function(){
      seleccion=$(this).attr("id");
      actualizarcol();
  });
}

function introgoogle(){
  var apiKey = 'AIzaSyDN-BN5pygOh8IBgi4HvWo6HSSnGMZX_GE';
  gapi.client.setApiKey(apiKey);
    gapi.client.load('plus', 'v1', function() {
      var request = gapi.client.plus.people.get({
        'userId':  $("#goo").val()
        // For instance:
        // 'userId': '+GregorioRobles'
      });
      request.execute(function(resp) {
        var arr=[]
        var objeto ={nombre :resp.displayName,
                    url:resp.image.url}

        if (google[hselec] == undefined){
          arr.push(objeto)
        }else{
          arr=google[hselec]
          arr.push(objeto)
        }
        google[hselec]=arr
        mostrargoogle()
      });
    });
}
function mostrargoogle(){
  lista = "<ul>"
  for(var name in google){
    if (name == hselec){
      arr=google[name]
      for (var i=0;i<arr.length;i++){
        console.log(i)
        lista = lista +'<li id="'+arr[i].nombre+'"> '+ '<img src="'+arr[i].url+'">' + arr[i].nombre + '</li>';
      }
    }
  }
  lista = lista + '</ul>'
  $('#mostrargoogle').html(lista)
}

function actualizarcol(){
  var array = data[seleccion]
  console.log(seleccion)
  var lista ='<h3>Colección '+seleccion+'</h3>'+'<ul>'
  for(var i=0;i<array.length;i++){
    lista =lista +'<li> '+ accomodations[array[i]].basicData.title + '</li>';
  }
  lista =lista +'</ul>'
  $('#droppable').html(lista)
  $('#colppal').html(lista)
}

$(document).ready(function() {
  map = L.map('map').setView([40.4175, -3.708], 11);
  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  $("#tabs").tabs();
  $("#get").click(get_accomodations);
  $("#coleccion").val()


  $("#droppable").droppable({
    drop: function(event, ui) {
      var no=ui.draggable[0].attributes[0].value;
      var arr = []
      if (seleccion == undefined){
        alert("Selecciona coleccion!!!")
        return
      }
      arr = data[seleccion]
      arr.push(no);
      data[seleccion] =arr;
      actualizarcol();
    }
  });
});
