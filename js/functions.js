//THESE ARE THE MAIN FUNCTIONS OF THE WEBSITE

function firstLoading() {
	//transition to nearly invisible
	$('.container').stop(true).fadeTo(0, 0.001).removeClass('sr-only');

	//get object with all cookie values
	var cookie = getCookieObj();
	
	if(isCookieObjValid(cookie)) {
		//job
		fillDdJobs(cookie.job_id);
		//class && lessons
		fillDdClasses(cookie.job_id, cookie.class_id);
		
	} else {
		//if no parameters are defined it will load
		//the rest of the website with default values.
		fillDdJobs();
	}
	
	//transition to visible
	$('.container').stop(true).fadeTo(500, 1);
}

function fillDdJobs(job_id) {
	//transition to  nearly invisible
	$('#jobs').stop(true).fadeTo(0, 0.001).removeClass('sr-only');

	//ajax - fill dropdown
	$.ajax({
		url: 'http://home.gibm.ch/interfaces/133/berufe.php',
		type: 'get',
		dataType: 'json',
		success: function(data) {
			//create html
			var html = '';
			$.each(data, function(key, value) {
				html += '<option value="' + value['beruf_id'] + '">' + value['beruf_name'] + '</option>';
			});
			
			//insert html
			if(html.length > 0) {
				$('#jobs').html(html);
			} else {
				$('#jobs').html('<option value="">Keine Berufe gefunden</option>');
			}
		},
		error: function(e) {
			//insert html error message
			$('#jobs').html('<option value="">Berufe konnten nicht geladen werden</option>')
		},
		complete: function(jqXHR, textStatus ) {
			if(job_id != null) {
				//set value of cookie
				$('#jobs').val(job_id);
			} else {
				//load classes with the default values
				fillDdClasses();
			}
			
			//save cookie
			saveCookieJobId();
			
			//transition to visible
			$('#jobs').stop(true).fadeTo(500, 1);
		}
	});
}

function fillDdClasses(job_id, class_id) {
	//transition to nearly invisible
	$('#classes').stop(true).fadeTo(0, 0.001).removeClass('sr-only');
	
	//validate parameter
	if(job_id == null) {
		job_id = $('#jobs').val();
	}
	
	//ajax - fill dropdown
	$.ajax({
		url: 'http://home.gibm.ch/interfaces/133/klassen.php?beruf_id=' + job_id,
		type: 'get',
		dataType: 'json',
		success: function(data) {
			//create HTML
			var html =  '';
			$.each(data, function(key, value) {
				html += '<option value="' + value['klasse_id'] + '">' + value['klasse_name'] + '</option>';
			});
			
			//insert html
			if(html.length > 0) {
				$('#classes').html(html);
			} else {
				$('#classes').html('<option value="">Keine Klassen gefunden</option>');
			}
		},
		error: function(e) {
			//insert html error message
			$('#jobs').html('<option value="">Klassen konnten nicht geladen werden</option>')
		},
		complete: function(jqXHR, textStatus ) {
			if(class_id != null) {
				//set value of cookie
				$('#classes').val(class_id);
			}
			//load lessons
			fillTblLessons();
			
			//save cookie
			saveCookieClassId();
			
			//transition to visible
			$('#classes').stop(true).fadeTo(500, 1);
		}
	});
}

function fillTblLessons(class_id, week_nr, year) {
	//transition to nearly invisible
	$('#lessons').stop(true).fadeTo(0, 0.001).removeClass('sr-only');
	
	//validate parameters
	if(class_id == null) {
		class_id = $('#classes').val();
	}
	if(week_nr == null) {
		week_nr = $('#week_nr').text();
	}
	if(year == null) {
		year = $('#week_year').text();
	}
	//in case table is not loaded yet
	if(week_nr.length <= 0 || year.length <= 0) {
		var today = new Date();
		week_nr = today.getWeek();
		year = today.getFullYear();
	}
	
	//week nr and year
	var week_nr_year = week_nr + '-' + year;
	$('#week_nr').text(week_nr);
	$('#week_year').text(year);
	
	//ajax - fill table
	$.ajax({
		url: 'http://home.gibm.ch/interfaces/133/tafel.php?klasse_id=' + class_id + '&woche=' + week_nr_year,
		type: 'get',
		dataType: 'json',
		success: function(data) {
			var cache_date = '';
		
			//create html
			var html = '';
			
			$.each(data, function(key, value) {
				if(value['tafel_datum'] != cache_date) {
					//cache date
					cache_date = value['tafel_datum'];
					//table header
					html += getTableHeaderRowHtml(value);
				}
				
				//table body
				html += getTableRowHtml(value);
			});
			
			// if no lessons
			if(html.length <= 0) {
				html = '<tr><td><div class="col-sm-12">Kein Unterricht</div></td></tr>';
			}
			
			//insert html in table
			$('#lessons').html(html);
		},
		error: function(e) {
			//insert html error message
			$('#lessons').html('<tr><td><div class="col-sm-12">Lektionen konnten nicht geladen werden.</div></td></tr>');
		},
		complete: function() {
			//save cookies
			saveCookies();
			
			//transition to visible
			$('#lessons').stop(true).fadeTo(500, 1);
		}
	});
}

function getTableHeaderRowHtml(array) {
	//get values out of array
	var date = getFormattedDate(array['tafel_datum']);
	var weekday = getWeekdayName(parseInt(array['tafel_wochentag']));
	
	//generate html
	var html = '';
	
	//date header
	html += '<tr>';
	html += '	<th>';
	html += '		<div class="col-sm-12">';
	html += '			<h3>' + weekday + ', ' + date + '</h3>';
	html += '		</div>';
	html += '	</th>';
	html += '</tr>';
	
	//columns header. hidden on mobile
	html += '<tr class="hidden-xs">';
	html += '	<th>';
	html += '		<div class="col-sm-2 div-to-block">';
	html += '			<p class="p-text-vertical-center"><strong>Zeit von/bis</strong></p>';
	html += '		</div>';
	html += '		<div class="col-sm-3 div-to-block">';
	html += '			<p class="p-text-vertical-center">Fach</p>';
	html += '		</div>';
	html += '		<div class="col-sm-2 div-to-block">';
	html += '			<p class="p-text-vertical-center">Lehrer</p>';
	html += '		</div>';
	html += '		<div class="col-sm-2 div-to-block">';
	html += '			<p class="p-text-vertical-center">Zimmer</p>';
	html += '		</div>';
	html += '		<div class="col-sm-3 div-to-block">';
	html += '			<p class="p-text-vertical-center">Kommentar</p>';
	html += '		</div>';
	html += '	</th>';
	html += '</tr>';
	
	return html;
}

function getTableRowHtml(array) {
	//get values out of array
	time_from = getFormattedTime(array['tafel_von']);
	time_to = getFormattedTime(array['tafel_bis']);
	subject = array['tafel_longfach'];
	teacher = array['tafel_lehrer'];
	room = array['tafel_raum'];
	comment = array['tafel_kommentar'];
	
	//generate html
	var html = '';
	
	//spans hidden on mobile
	html += '<tr>';
	html += '	<td>';
	html += '		<div class="col-sm-2 div-to-block">';
	html += '			<p class="p-text-vertical-center"><strong><span class="visible-xs margin-top-5">Zeit von/bis: </span>' + time_from + ' - ' + time_to + '</strong></p>';
	html += '		</div>';
	html += '		<div class="col-sm-3 div-to-block">';
	html += '			<p class="p-text-vertical-center"><span class="visible-xs margin-top-20">Fach: </span>' + subject + '</p>';
	html += '		</div>';
	html += '		<div class="col-sm-2 div-to-block">';
	html += '			<p class="p-text-vertical-center"><span class="visible-xs margin-top-20">Lehrer/in: </span>' + teacher + '</p>';
	html += '		</div>';
	html += '		<div class="col-sm-2 div-to-block">';
	html += '			<p class="p-text-vertical-center"><span class="visible-xs margin-top-20">Zimmer: </span>' + room + '</p>';
	html += '		</div>';
	if(comment.length > 0) {
	html += '		<div class="col-sm-3 div-to-block">';
	html += '			<p class="p-text-vertical-center"><span class="visible-xs margin-top-20">Kommentar: </span>' + comment + '</p>';
	html += '		</div>';
	}
	html += '	</td>';
	html += '</tr>';
	
	return html;
}