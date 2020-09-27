

let cb = {
	action: function(e) {
		var parts = e.currentTarget.id.split("-");
		var verb = parts[1];
		var object = parts[2];
		var id = parts[3];

		switch(verb) {
			case 'edit':
			case 'create':
			case 'delete':
					$.getJSON('/api/' + verb, {
						object: object,
						id: id
					}, function(r) {
						$('#dlg-title').text(verb + " " + object);
						var html = '';
						for(key in r) {
							var value = r[key].val || "";
							var type = r[key].type || "text";
							var name = r[key].name || key;
							html += '<div class="form-group">';
							if(type == "label") {
								html += r[key].val;
							} else {
								if(type != "hidden") {
									html += '<label for="dlg-var-' + key + '" class="text-capitalize">' + name + ': </label>';
								}
								if(r[key].desc) {
									html += '<small class="form-text text-muted">' + r[key].desc + '</small>';
								}

								switch(type) {
									case 'checkbox':
										html += '<input type="checkbox" class="form-control" id="dlg-var-' + key + '" ' + (value?'checked':'') + '>';
									break;
									case 'select':
										html += '<select class="form-control" id="dlg-var-' + key + '">';
											for(var i = 0; i < r[key].options.length; i++) {
												var o = r[key].options[i];
												html += '<option value="' + o.id + '"';
												if(value == o.value) {
													html += ' selected';
												}
												html += '>' + o.value + '</option>';
											}
										html += '</select>';
									break;
									default:
										html += '<input type="' + type + '" class="form-control" id="dlg-var-' + key + '" value="' + value + '">';	
									break;
								}								
							}
							html += '</div>';
						}
						$('#dlg-body').html(html);
						$('#dlg').modal();
						$('#dlg :checkbox').bootstrapToggle();
						cb.dlgData = {
							verb: verb,
							object: object,
							id: id,
							data: r
						}
					});
			break;
		}
		console.log(verb, object, id);
	},

	acceptDialog: function() {
			for(key in cb.dlgData.data) {
				if(cb.dlgData.data[key].type == "checkbox") {
					cb.dlgData.data[key] = $('#dlg-var-' + key).is(":checked");
				} else {
					cb.dlgData.data[key] = $('#dlg-var-' + key).val();	
				}
			}
			console.log(cb.dlgData);
			$.post('/api/' + cb.dlgData.verb, cb.dlgData, function(r) {
				location.reload();
			}).fail(function(e) {
				$('#info-title').text("Could not " + cb.dlgData.verb + " " + cb.dlgData.object);
				$('#info-body').text(e.responseText);
				$('#info').modal("show");
			});
			//$('#dlg').modal("hide");
	},

	init: function() {

		$('#btn-dlg-ok').click(cb.acceptDialog);

		// click handler for all action buttons (e.g. edit / delete)
		$('.btn-cb').click(cb.action);
		
		$('#btn-login').click(function(e) {
		  $('#login-status').text('Checking...');
		  var data = {
		  	email: $('#email').val(),
		  	password: $('#password').val()
		  }
		  $.post('/api/login', data)
		  	.done(function(r) {
		  		location.reload();
			  })
		  	.fail(function(err) {
		  		var msg = '<div class="alert alert-danger">';
		  		if(err.responseJSON && err.responseJSON.errors) {
		  			msg += err.responseJSON.errors
		  		} else {
		  			msg += 'Could not log in';
		  		}
		  		msg += '</div>';
			  	$('#login-status').html(msg);
			  });
		})

		$.getJSON('/api/user', function(data) {
			if(data) {
				var html = '';
				if(data.loggedIn) {
					console.log(data);
					html = 'You are logged in as ' + data.email + '<a class="btn btn-primary" href="/api/logout">Log out</a>';
				} else {
					html = 'You are not logged in' + '<button class="btn btn-primary" data-toggle="modal" data-target="#login">Log in</button>';
				}
				$('#user-details').html(html);
			}
		}, function(err) {
			console.error(err);
		});
	}
}

$(cb.init);
