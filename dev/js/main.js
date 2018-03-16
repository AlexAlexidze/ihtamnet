var data_obj = {};
var names_arr = [];
var fpath     = 'data/data_RU.xml';
var fpath_loc = 'data/loc_RU.xml';
var H_header = 50;
var H_offset = H_header;
var res = {lang: ''};
var map;

var passiveSupported = false;
var passive;

$(document).ready(function(){
	var map_wrapper         = document.querySelector('.map-wrapper');
	var gl_wrapper_names    = document.querySelector('.gl-wrapper-names');
	var stat_global_wrapper = document.querySelector('.stat-global-wrapper');
	var map_div             = document.getElementById('map');
	var top_button          = document.querySelector('.top-button');

	var hash = location.hash;

	res = getResHash(hash);

	if ((res.lang).toLowerCase() == 'ua') {
		fpath     = 'data/data_UA.xml';
		fpath_loc = 'data/loc_UA.xml';
	}

	resizeHandler();

	try {
		var options = Object.defineProperty({}, "passive", { get: function() { passiveSupported = true; } });
		window.addEventListener("test", null, options);
	}
	catch (e) {
	}

	passive = passiveSupported ? { passive: true } : false;

	if (typeof google === 'undefined') {
		window.addEventListener('load', function() { readFile(fpath, loadData); });
	}
	else {
		readFile(fpath, loadData);
	}

	// ---------------------- EVENTS ---------------------- //
	// PAGE resize
	window.addEventListener('resize', resizeHandler);

	// EVENT Click on NAME
	function wrapperListItemClickHandler()
	{
		map.setCenter({lat: 35, lng: 39});
		var name = $(this).text();
		var id = parseInt($(this).attr('data-id'));
		fillDescr(id, name);
	}

	// EVENT Click TOP
	top_button.addEventListener('click', function() {
		top_button.style.display = 'none';
		gl_wrapper_names.scrollTop = 0;
	});

	// Search EVENT
	document.querySelector('.btn-search').addEventListener('click', function() {
		search(document.querySelector('.txt-search').value);
	});

	document.querySelector('.txt-search').addEventListener('keydown', function(e) {
		if (e.keyCode === 13) {
			search(document.querySelector('.txt-search').value);
		}
	});

	// EVENTonScroll
	gl_wrapper_names.addEventListener('scroll', function() {
		var offset_tmp = $('.wrapper-list-item').offset().top;

		top_button.style.display = (offset_tmp < 49) ? 'block' : 'none';
	}, passive);


	// ---------------------- FUNCTIONS ---------------------- //
	function loadData(data)
	{
		data_obj = xml2dataobj(data);
		data_obj.sort(function(a, b) { return (a.surname == b.surname) ? 0 : ((a.surname > b.surname) ? 1 : -1); });

		var date1_array = getDatesArray(data_obj, "date1");
		var loc_array = getArray(data_obj, "loc");
		names_arr = getArray(data_obj, "surname");

		// Fill NAMES list (Main Page)
		fillList(data_obj);

		// Fill STATISTICS
		document.getElementById('total-N').innerHTML = data_obj.length;
		var date1_obj = getEqualN(date1_array);
		fillDateStat(date1_obj);

		// ---------------------- GOOGLE MAPs ---------------------- //
		map = new google.maps.Map(map_div, {
			zoom      : 7,
			center    : new google.maps.LatLng(34.9943184, 37.9987275),
			mapTypeId : google.maps.MapTypeId.ROADMAP
		});

		var infowindow = new google.maps.InfoWindow();
		var markers    = [];
		var loc_obj    = getEqualN(loc_array);

		// Set markers
		readFile(fpath_loc, function(data_loc) {
			var locations= xml2locArray(data_loc);

			for (var i=0; i<locations.length; i++) {
				var k = loc_obj.indexOf(locations[i][0]);
				var N = loc_obj[k+1];
				var marker = new google.maps.Marker({
					position: new google.maps.LatLng(locations[i][1], locations[i][2]),
					map: map,
					label: { text: N.toString(), color: "#fff", fontWeight: "bold", fontSize: '16px' },
					icon:  { url: "img/loc_v2.png" }
				});

				markers[i] = marker;
				google.maps.event.addListener(marker, 'click', (function(marker, i) {
					return function() {
						infowindow.setContent(locations[i][0]);
						infowindow.open(map, marker);
					}
				})(marker, i));
			}
		});
	}

	function readFile(fpath, callback)
	{
		var req = new XMLHttpRequest();
		req.addEventListener('readystatechange', function() {
			try {
				if (req.readyState === XMLHttpRequest.DONE) {
					callback(req.responseXML);
				}
			}
			catch (e) {
				alert(e);
			}
		});

		req.open('GET', fpath);
		req.send();
	}

	function getResHash(hash)
	{
		hash.replace(/([a-z]+)=([^&]*)/g, function(m, k, v) { res[k] = v; });
		return res;
	}

	function xml2dataobj(xml)
	{
		try {
			var rows = xml.getElementsByTagName('offal');
			var cnt  = rows.length;
			var res  = [];
			var dp   = /[0-9]+/g;

			for (var i=0; i<cnt; ++i) {
				var row = rows[i];

				var id           = parseInt(row.getAttribute('id'), 10);
				var rank         = row.getAttribute('rank');
				var func         = row.getAttribute('func');
				var surname      = row.getAttribute('surname');
				var name         = row.getAttribute('name');
				var mil_unit     = row.getAttribute('unit');
				var date1        = row.getAttribute('date1');
				var circum_death = row.getAttribute('cdeath');
				var loc          = row.getAttribute('loc');
				var note1        = row.getAttribute('note1');
				var note2        = row.getAttribute('note2');
				var note3        = row.getAttribute('note3');

				var d = date1.match(dp);
				if (d) {
					if (d.length > 3) {
						date1 = [d[0], d[1], d[2]];
					}

					if (d.length > 0 && parseInt(d[0] < 100)) {
						date1 = d.reverse();
					}
				}

				res.push({ id : id, rank : rank, func : func, surname : surname, name : name, mil_unit : mil_unit, date1 : date1, circum_death : circum_death, loc : loc, note1 : note1, note2 : note2, note3 : note3 });
			}

			return res;
		}
		catch (e) {
			console.log(e);
		}
	}

	function getEqualN(array)
	{
		var count = {};
		var arr   = [];
		array.forEach(function(i) { count[i] = (count[i]||0) + 1; });
		for (var key in count) {
			arr.push(key);
			arr.push(count[key].toString());
		}

		return arr;
	}

	function xml2locArray(xml)
	{
		var rows = xml.getElementsByTagName('location');
		var res  = [];
		var cnt  = rows.length;

		for (var i=0; i<cnt; ++i) {
			var row = rows[i];
			res.push([row.getAttribute('name'), row.getAttribute('lat'), row.getAttribute('lon')]);
		}

		res.sort();
		return res;
	}

	function getDatesArray(data_obj, field_name)
	{
		var data_array = [];
		var cnt        = data_obj.length;
		for (var i=0; i<cnt; ++i){
			var item = data_obj[i][field_name];
			if (item.length > 0) {
				var val = parseInt(item[0]);
				if (val > 100){
					data_array.push(item[0]);
				}
			}
		}

		data_array.sort();
		return data_array;
	}

	function getArray(data_obj, field_name)
	{
		var data_array = [];
		var cnt        = data_obj.length;

		for (var i=0; i<cnt; ++i) {
			var item = data_obj[i][field_name];
			if (item.length) {
				data_array.push(item);
			}
		}

		data_array.sort();
		return data_array;
	}


	function fillList(data_obj)
	{
		for (var i=0; i<data_obj.length; i++){
			unit_wrap_list = document.createElement("div");
			$(unit_wrap_list).addClass('wrapper-list-item');
			$(unit_wrap_list).attr("data-id", i);
			$(unit_wrap_list).attr("data-toggle", "modal");
			$(unit_wrap_list).attr("data-target", "#myModal");

			$(unit_wrap_list).html(data_obj[i].surname+' '+data_obj[i].name);

			$('.gl-wrapper-names').append(unit_wrap_list);
			unit_wrap_list.addEventListener('click', wrapperListItemClickHandler);
		}

		$( ".wrapper-list-item:first" ).css( "border-top", "1px dotted #9e0b0f" );
	}

	function fillDateStat(date_obj)
	{
		for (i=0; i<date_obj.length; i+=2){
			var stat_date_wrapper = document.createElement("div");
			var stat_date = document.createElement("div");
			var stat_N = document.createElement("div");
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


	function fillDescr(id, name)
	{
		var rank = data_obj[id].rank;
		var mil_unit = data_obj[id].mil_unit;
		var func = data_obj[id].func;
		var date1 = data_obj[id].date1;
		var loc = data_obj[id].loc;
		var circum_death = data_obj[id].circum_death;

		if (date1.length) {
			date1 = date1[2] + '.' + date1[1] + '.' + date1[0];
		}

		var note1 = '';
		var note2 = '';
		var note3 = '';

		if (data_obj[id].note1 != "") { note1 = '<a href="'+data_obj[id].note1+'" target="_blank" rel="noopener">статья 1</a>';}
		if (data_obj[id].note2 != "") { note2 = ', <a href="'+data_obj[id].note2+'" target="_blank" rel="noopener">статья 2</a>';}
		if ((data_obj[id].note3).length > 0) {note3 = '<b>Note</b>: '+data_obj[id].note3+'<br/>';}

		var val = [func, mil_unit, date1, loc, circum_death];
		for (i=0; i<val.length; i++){
			if (!val[i].length) {
				val[i] = "N/A";
			}
		}

		$('h4.modal-title').html('<strong>' + name + '</strong>');

		rank_str = '';
		note3_str = '';
		if (rank.length)  { rank_str  = '<b>Rank</b>: '+rank+ '<br/>'; }
		if (note3.length) { note3_str = '<b>Note</b>: '+note3+'<br/>'; }

		var descr = rank_str +
				'<b>Position (rating)</b>: '+val[0]+ '<br/>' +
				'<b>Unit (military unit/organization)</b>: '+val[1]+ '<br/>' +
				'<b>Date of death</b>: '+val[2]+ '<br/>' + 
				'<b>Death location</b>: '+val[3]+ '<br/>' + 
				'<b>Circumstances of death</b>: '+val[4]+ '<br/>' + 
				'<b>Links</b>: '+note1+note2+'<br/>' + 
				note3
		;

		$('.modal-body').html(descr);
	}


	function search(input_name)
	{
		var offset_tmp = $('.wrapper-list-item').offset().top;
		if (input_name.length > 0){
			var n = -1;
			for (i=0; i<names_arr.length; i++){
				if ((names_arr[i].toLowerCase()).indexOf(input_name.toLowerCase()) > -1) {
					n = i;
					break;
				}
			}
		}

		if (n !== -1) {
			var offset = $('div[data-id='+n+']').offset().top;
			$('.gl-wrapper-names').scrollTop(offset-(offset_tmp)+H_header/4-10);
		}
		else {
			console.log('not found')
			$('[data-toggle="popover"]').popover();
		}
	}

	function resizeHandler()
	{
		var h    = window.innerHeight;
		var w    = window.innerWidth;

		if (w < 1201) {
			h       /= 2;
			H_offset = 0;
		}
		else {
			H_offset = H_header;
		}

		map_wrapper.style.height         = (h - H_offset) + 'px';
		gl_wrapper_names.style.height    = (h - H_header) + 'px';
		stat_global_wrapper.style.height = (h - H_header) + 'px';
		map_div.style.height             = ((w < 1201) ? h - H_offset - 6 : h - H_header) + 'px';
	}
});
