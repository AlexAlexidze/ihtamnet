
var data_obj = {};
// var names_arr = null;
var fpath = 'data/data_Ихтамнет.xml';
var fpath_loc = 'data/locations.xml';
var H_header = 50;
var H_offset = H_header;
var res = {lang: ''};

$(document).ready(function(){
	
		var h = window.innerHeight;
		var w = window.innerWidth;
		var hash = location.hash;
		
		res = getResHash(hash); // console.log(res);
		
		if ((res.lang).toLowerCase() == 'ua') {fpath='data/data_Ихтамнет_UA.xml'; fpath_loc = 'data/locations_UA.xml';}
		
		// Set Map and other sections Sizes 
		if (w<1201) {h = h/2; H_offset = 0;}else{H_offset = H_header}
		$('.map-wrapper').css('height', h-H_offset);
		$('.gl-wrapper-names').css('height', h-H_header);
		$('#map').css('height', h-H_offset);
		$('.stat-global-wrapper').css('height', h-H_header);
		if (w<1201) {$('#map').css('height', h-H_offset-6);}

		
		// Read XML 
		data = readFile(fpath);
		data_obj = xml2dataobj(data);
		data_obj.sort(function (a, b) {
		  if (a.surname > b.surname) {
			return 1;
		  }
		  if (a.surname < b.surname) {
			return -1;
		  }
		  
		  return 0;
		});
		
		
		var date1_array = getDatesArray(data_obj, "date1");
		var mu_array = getArray(data_obj, "mil_unit");
		var loc_array = getArray(data_obj, "loc");
		var names_arr = getArray(data_obj, "surname");
		
		
		// Fill NAMES list (Main Page)
		fillList(data_obj);

		
		// Fill STATISTICS
		$('#total-N').html(data_obj.length);
		var date1_obj = getEqualN(date1_array);
		
		fillDateStat(date1_obj);
		
		
		
		
		// ---------------------- EVENTS ---------------------- //

		// PAGE resize
		$(window).resize(function(){
			var h = window.innerHeight;
			var w = window.innerWidth;

			if (w<1201) {h = h/2; H_offset = 0;}else{H_offset = H_header}
			
			$('.map-wrapper').css('height', h-H_offset);
			$('.gl-wrapper-names').css('height', h-H_header);
			$('#map').css('height', h-H_offset);
			$('.stat-global-wrapper').css('height', h-H_header);
			if (w<1201) {$('#map').css('height', h-H_offset-6);}
		});

		
		// EVENT Click on NAME
		$('.wrapper-list-item').click(function(){
			map.setCenter({lat: 35, lng: 39});
			
			var name = $(this).text();
			var id = parseInt($(this).attr('data-id'));
			fillDescr(id, name);
			
		});
		
		
		// EVENT Click TOP
		$('.top-button').click(function(){
			$('.gl-wrapper-names').scrollTop(0);
			$('.top-button').css('display', 'none');
		});
		
		
		// Search EVENT
		$('.btn-search').click(function(){
			
			var input_name = $('.txt-search').val();
			search(input_name);
		
		});

		$(".txt-search").keydown(function (e) {
		  if (e.keyCode == 13) {
			var input_name = $('.txt-search').val();
			search(input_name);
		  }
		});
		
		
		// EVENTonScroll		
		$('.gl-wrapper-names').on( 'scroll', function(){
			var offset_tmp = $('.wrapper-list-item').offset().top; // console.log(offset_tmp);
			if (offset_tmp<49) {$('.top-button').css('display', 'block');} 
			else {$('.top-button').css('display', 'none');}
			
			
		});

		
		// ---------------------- GOOGLE MAPs ---------------------- //
		
		// Init map
		var map = new google.maps.Map(document.getElementById('map'), {
			zoom: 7,
			center: new google.maps.LatLng(34.9943184,37.9987275),
			mapTypeId: google.maps.MapTypeId.ROADMAP
		});
		var infowindow = new google.maps.InfoWindow();
		var marker, i;
		var markers = [];
		var loc_obj = getEqualN(loc_array);

		// Set markers
		data_loc = readFile(fpath_loc);

		var locations= xml2locArray(data_loc);
		
		for (i = 0; i < locations.length; i++) {
			var k = loc_obj.indexOf(locations[i][0]);
			var N = loc_obj[k+1];
			marker = new google.maps.Marker({
				position: new google.maps.LatLng(locations[i][1], locations[i][2]),
				map: map,
				label: {text: N.toString(), color: "#fff", fontWeight: "bold", fontSize: '16px'},
				icon: {url: "img/loc_v2.png"}
			});
			markers[i] = marker;
			google.maps.event.addListener(marker, 'click', (function(marker, i) {
				return function() {
					infowindow.setContent(locations[i][0]);
					infowindow.open(map, marker);
				}
			})(marker, i));
		}
		
		

		
		// ---------------------- FUNCTIONS ---------------------- //
		
		function readFile(fpath){
			var data = '';
			$.ajax({ type: "post",   
					url: fpath,   
					async: false,
					// dataType: 'binary',
					// processData: false,
					//data:{'z':'1'}, //
					response:'text',
					success : function(input_data)
					{
						 data = input_data;
					}
			});
			return data;
		}
		
		function getResHash(hash){
			hash.replace(/([a-z]+)=([^&]*)/g, function(m, k, v) { 
				res[k] = v; 
				});
			return res;
		}

		
		function xml2dataobj(data){

			var data_obj = [];
			var Row = $(data).find("Row");
			var N_Row = Row.length;
			var j = 0;

			for (i=0; i<N_Row; i++){
				
				try {
					var Cell = $(Row[i]).find("Cell");
					var id = parseInt($(Cell[0]).text());
					var rank = $(Cell[1]).text();
					var func = $(Cell[2]).text();
					var surname = $(Cell[3]).text();
					var name = $(Cell[4]).text();
					var mil_unit = $(Cell[5]).text();
					var date_pattern = /[0-9]+/g
					var date1 = ($(Cell[6]).text()).match(date_pattern);
					var circum_death = $(Cell[7]).text();
					var loc = $(Cell[8]).text();
					var note1 = $(Cell[11]).attr('ss:HRef');
					var note2 = $(Cell[12]).attr('ss:HRef');
					var note3 = $(Cell[13]).text();
					
					if( ($(Cell[1]).html()).indexOf("DateTime") > -1){rank = '';}
					if( ($(Cell[2]).html()).indexOf("DateTime") > -1){func = '';}
					if( ($(Cell[3]).html()).indexOf("DateTime") > -1){surname = '';}
					if( ($(Cell[4]).html()).indexOf("DateTime") > -1){name = '';}
					if( ($(Cell[5]).html()).indexOf("DateTime") > -1){mil_unit = '';}
					if( isNaN((parseInt(date1))) ){date1 = '';}
					if( ($(Cell[7]).html()).indexOf("DateTime") > -1){circum_death = '';}
					if( ($(Cell[8]).html()).indexOf("DateTime") > -1){loc = '';}
					if( ($(Cell[11]).html()).indexOf("Error") > -1){note1 = '';}
					if( ($(Cell[13]).html()).indexOf("Error") > -1){note3 = '';}
					
					if (Number.isInteger(id) && Cell.length == 14){
						if( date1.length > 3 ){date1 = [date1[0], date1[1], date1[2]];}
						if( date1.length > 0 && parseInt(date1[0]) < 100 ){date1 = date1.reverse();} 
						data_obj[j] = {id: id,
									rank: rank.trim(),
									func: func.trim(),
									surname: surname.trim(),
									name: name.trim(),
									mil_unit: mil_unit.trim(),
									date1: date1, // date of death
									circum_death: circum_death.trim(),
									loc: loc,
									note1: note1,
									note2: note2,
									note3: note3.trim()
									};
						j=j+1; 
					}
				}
				catch(err) {
					console.log(id);
					return;
				}
				
				
				if (Cell.length == 13 ) {console.log($(Cell[6]).text(), Cell.length, $(Cell[3]).text())}
			}
			return data_obj;
		}

		
		function getEqualN(array){
			var  count = {};
			var  arr = [];
			array.forEach(function(i) { count[i] = (count[i]||0) + 1;});

			$.each(count, function( key, value ) {
			  arr.push(key); arr.push(value.toString());
			});
			return arr;
		}
		
		
		
		function xml2locArray(data){

			var loc_array = [];
			var Row = $(data).find("Row");
			var N_Row = Row.length;
			var j = 0;

			for (i=0; i<N_Row; i++){
				var Cell = $(Row[i]).find("Cell");
				var lat = $(Cell[1]).text();
				
				if (!isNaN(parseFloat(lat))){
					loc_array[j] = [$(Cell[0]).text(), $(Cell[1]).text(), $(Cell[2]).text()];
					j=j+1;
				}
			}
			loc_array.sort();
			return loc_array;
		}
		
		
		function getDatesArray(data_obj, field_name){
			
			var data_array = [];
			var test = [];
			var N = data_obj.length;
			var j = 0;
			for (i=0; i<N; i++){
				eval('var item = data_obj[i].'+ field_name +";");
				if (item.length > 0){
					var val = parseInt(item[0]);
					if (val > 100){
						data_array[j] = item[0];
						j = j+1; 
					}
						
				}
			}
			data_array.sort();
			return data_array;
		}

		
		function getArray(data_obj, field_name){
			var data_array = [];
			var N = data_obj.length;
			var j = 0;
			for (i=0; i<N; i++){
				
				eval('var item = data_obj[i].'+ field_name +";");				
				if ((item.trim()).length>0){
					data_array[j] = item.trim();
					j = j+1;
				}
			}
			data_array.sort();
			return data_array;
		}
		
	
		function fillList(data_obj){
			for (i=0; i<data_obj.length; i++){
				unit_wrap_list = document.createElement("div");
				$(unit_wrap_list).addClass('wrapper-list-item');
				$(unit_wrap_list).attr("data-id", i);
				$(unit_wrap_list).attr("data-toggle", "modal");
				$(unit_wrap_list).attr("data-target", "#myModal");
				
				$(unit_wrap_list).html(data_obj[i].surname+' '+data_obj[i].name);

				$('.gl-wrapper-names').append(unit_wrap_list);
			}
			$( ".wrapper-list-item:first" ).css( "border-top", "1px dotted #9e0b0f" );			
		}
		
		
		function fillDateStat(date_obj){
			for (i=0; i<date_obj.length; i += 2){
				
				stat_date_wrapper = document.createElement("div");
				stat_date = document.createElement("div");
				stat_N = document.createElement("div");
				$(stat_date_wrapper).addClass('stat-timeline-wrapper');
				$(stat_date).addClass('stat-date');
				$(stat_N).addClass('stat-N');
				
				
				$(stat_date).text(date_obj[i]);
				$(stat_N).text(date_obj[i+1]);
				
				$(stat_date_wrapper).append(stat_date);
				$(stat_date_wrapper).append(stat_N);

				$('.stat-global-wrapper').append(stat_date_wrapper);
			}
	
		}
		
		
		function fillDescr(id, name){

			var rank = data_obj[id].rank;
			var mil_unit = data_obj[id].mil_unit;
			var func = data_obj[id].func;
			var date1 = data_obj[id].date1;
			var loc = data_obj[id].loc;
			var circum_death = data_obj[id].circum_death;
			
			var note1 = '';
			var note2 = '';
			var note3 = '';
			if (typeof(data_obj[id].note1) != "undefined"){note1 = '<a href="'+data_obj[id].note1+'" target="_blank">статья1</a>';}
			if (typeof(data_obj[id].note2) != "undefined"){note2 = ', <a href="'+data_obj[id].note2+'" target="_blank">статья2</a>';}
			if ((data_obj[id].note3).length > 0) {note3 = '<b>Note</b>: '+data_obj[id].note3+'<br/>';}
			
			var val = [func, mil_unit, date1, loc, circum_death];
			for (i=0; i<val.length; i++){
				if (val[i].length == 0){val[i] = "No data"};
			}
			
			$('h4.modal-title').html('<b>'+name+'</b>');
			
			rank_str = ''; note3_str = '';
			if (rank.length > 0) {rank_str = '<b>Rank</b>: '+rank+ '<br/>';}
			if (note3.length > 0) {note3_str = '<b>Note</b>: '+note3+'<br/>';}

			descr = rank_str +
					'<b>Position (rating)</b>: '+val[0]+ '<br/>' +
					'<b>Unit (military unit/organization)</b>: '+val[1]+ '<br/>' +
					'<b>Date of death</b>: '+val[2]+ '<br/>' + 
					'<b>Death location</b>: '+val[3]+ '<br/>' + 
					'<b>Circumstances of death</b>: '+val[4]+ '<br/>' + 
					'<b>Links</b>: '+note1+note2+'<br/>' + 
					note3;
			
			
			$('.modal-body').html(descr);
		
		}
		
		
		function search(input_name){
			var offset_tmp = $('.wrapper-list-item').offset().top;
			if (input_name.length > 0){
				var n = -1;
				for (i=0; i<names_arr.length; i++){
					
					if ((names_arr[i].toLowerCase()).indexOf(input_name.toLowerCase()) > -1){n = i; break;}
				}
			}

			if (n>-1){
				var offset = $('div[data-id='+n+']').offset().top;
				$('.gl-wrapper-names').scrollTop(offset-(offset_tmp)+H_header/4-10);
			} else{
				console.log('not found')
				$('[data-toggle="popover"]').popover();
			}
			return;
		}

		

});
