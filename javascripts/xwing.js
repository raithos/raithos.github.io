
/*
    X-Wing Squad Builder 2.0
    Stephen Kim <raithos@gmail.com>
    https://raithos.github.io
 */
var DFL_LANGUAGE, GenericAddon, SERIALIZATION_CODE_TO_CLASS, SPEC_URL, SQUAD_DISPLAY_NAME_MAX_LENGTH, Ship, TYPES, URL_BASE, builders, byName, byPoints, conditionToHTML, exportObj, getPrimaryFaction, sortWithoutQuotes, statAndEffectiveStat, _base,
  __slice = [].slice,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

window.iced = {
  Deferrals: (function() {
    function _Class(_arg) {
      this.continuation = _arg;
      this.count = 1;
      this.ret = null;
    }

    _Class.prototype._fulfill = function() {
      if (!--this.count) {
        return this.continuation(this.ret);
      }
    };

    _Class.prototype.defer = function(defer_params) {
      ++this.count;
      return (function(_this) {
        return function() {
          var inner_params, _ref;
          inner_params = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          if (defer_params != null) {
            if ((_ref = defer_params.assign_fn) != null) {
              _ref.apply(null, inner_params);
            }
          }
          return _this._fulfill();
        };
      })(this);
    };

    return _Class;

  })(),
  findDeferral: function() {
    return null;
  },
  trampoline: function(_fn) {
    return _fn();
  }
};
window.__iced_k = window.__iced_k_noop = function() {};

exportObj = typeof exports !== "undefined" && exports !== null ? exports : this;

exportObj.SquadBuilderBackend = (function() {

  /*
      Usage:
  
          rebel_builder = new SquadBuilder
              faction: 'Rebel Alliance'
              ...
          empire_builder = new SquadBuilder
              faction: 'Galactic Empire'
              ...
          backend = new SquadBuilderBackend
              server: 'https://xwing.example.com'
              builders: [ rebel_builder, empire_builder ]
              login_logout_button: '#login-logout'
              auth_status: '#auth-status'
   */
  function SquadBuilderBackend(args) {
    this.getCollectionCheck = __bind(this.getCollectionCheck, this);
    this.getLanguagePreference = __bind(this.getLanguagePreference, this);
    this.nameCheck = __bind(this.nameCheck, this);
    this.maybeAuthenticationChanged = __bind(this.maybeAuthenticationChanged, this);
    var builder, _i, _len, _ref;
    $.ajaxSetup({
      dataType: "json",
      xhrFields: {
        withCredentials: true
      }
    });
    this.server = args.server;
    this.builders = args.builders;
    this.login_logout_button = $(args.login_logout_button);
    this.auth_status = $(args.auth_status);
    this.authenticated = false;
    this.ui_ready = false;
    this.oauth_window = null;
    this.method_metadata = {
      google_oauth2: {
        icon: 'fa fa-google-plus-square',
        text: 'Google'
      },
      facebook: {
        icon: 'fa fa-facebook-square',
        text: 'Facebook'
      },
      twitter: {
        icon: 'fa fa-twitter-square',
        text: 'Twitter'
      }
    };
    this.squad_display_mode = 'all';
    this.collection_save_timer = null;
    this.setupHandlers();
    this.setupUI();
    this.authenticate((function(_this) {
      return function() {
        _this.auth_status.hide();
        return _this.login_logout_button.removeClass('hidden');
      };
    })(this));
    _ref = this.builders;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      builder = _ref[_i];
      builder.setBackend(this);
    }
    this.updateAuthenticationVisibility();
  }

  SquadBuilderBackend.prototype.updateAuthenticationVisibility = function() {
    if (this.authenticated) {
      $('.show-authenticated').show();
      return $('.hide-authenticated').hide();
    } else {
      $('.show-authenticated').hide();
      return $('.hide-authenticated').show();
    }
  };

  SquadBuilderBackend.prototype.save = function(serialized, id, name, faction, additional_data, cb) {
    var post_args, post_url;
    if (id == null) {
      id = null;
    }
    if (additional_data == null) {
      additional_data = {};
    }
    if (serialized === "") {
      return cb({
        id: null,
        success: false,
        error: "You cannot save an empty squad"
      });
    } else if ($.trim(name) === "") {
      return cb({
        id: null,
        success: false,
        error: "Squad name cannot be empty"
      });
    } else if ((faction == null) || faction === "") {
      throw "Faction unspecified to save()";
    } else {
      post_args = {
        name: $.trim(name),
        faction: $.trim(faction),
        serialized: serialized,
        additional_data: additional_data
      };
      if (id != null) {
        post_url = "" + this.server + "/squads/" + id;
      } else {
        post_url = "" + this.server + "/squads/new";
        post_args['_method'] = 'put';
      }
      return $.post(post_url, post_args, (function(_this) {
        return function(data, textStatus, jqXHR) {
          return cb({
            id: data.id,
            success: data.success,
            error: data.error
          });
        };
      })(this));
    }
  };

  SquadBuilderBackend.prototype["delete"] = function(id, cb) {
    var post_args;
    post_args = {
      '_method': 'delete'
    };
    return $.post("" + this.server + "/squads/" + id, post_args, (function(_this) {
      return function(data, textStatus, jqXHR) {
        return cb({
          success: data.success,
          error: data.error
        });
      };
    })(this));
  };

  SquadBuilderBackend.prototype.list = function(builder, all) {
    var list_ul, loading_pane, url;
    if (all == null) {
      all = false;
    }
    if (all) {
      this.squad_list_modal.find('.modal-header .squad-list-header-placeholder').text("Everyone's " + builder.faction + " Squads");
    } else {
      this.squad_list_modal.find('.modal-header .squad-list-header-placeholder').text("Your " + builder.faction + " Squads");
    }
    list_ul = $(this.squad_list_modal.find('ul.squad-list'));
    list_ul.text('');
    list_ul.hide();
    loading_pane = $(this.squad_list_modal.find('p.squad-list-loading'));
    loading_pane.show();
    this.show_all_squads_button.click();
    this.squad_list_modal.modal('show');
    url = all ? "" + this.server + "/all" : "" + this.server + "/squads/list";
    return $.get(url, (function(_this) {
      return function(data, textStatus, jqXHR) {
        var li, squad, _i, _len, _ref;
        if (data[builder.faction].length === 0) {
          list_ul.append($.trim("<li>You have no squads saved.  Go save one!</li>"));
        } else {
          _ref = data[builder.faction];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            squad = _ref[_i];
            li = $(document.createElement('LI'));
            li.addClass('squad-summary');
            li.data('squad', squad);
            li.data('builder', builder);
            list_ul.append(li);
            li.append($.trim("<div class=\"row-fluid\">\n    <div class=\"span9\">\n        <h4>" + squad.name + "</h4>\n    </div>\n    <div class=\"span3\">\n        <h5>" + squad.additional_data.points + " Points</h5>\n    </div>\n</div>\n<div class=\"row-fluid squad-description\">\n    <div class=\"span8\">\n        " + squad.additional_data.description + "\n    </div>\n    <div class=\"span4\">\n        <button class=\"btn load-squad\">Load</button>\n        &nbsp;\n        <button class=\"btn btn-danger delete-squad\">Delete</button>\n    </div>\n</div>\n<div class=\"row-fluid squad-delete-confirm\">\n    <div class=\"span8\">\n        Really delete <em>" + squad.name + "</em>?\n    </div>\n    <div class=\"span4\">\n        <button class=\"btn btn-danger confirm-delete-squad\">Delete</button>\n        &nbsp;\n        <button class=\"btn cancel-delete-squad\">Cancel</button>\n    </div>\n</div>"));
            li.find('.squad-delete-confirm').hide();
            li.find('button.load-squad').click(function(e) {
              var button;
              e.preventDefault();
              button = $(e.target);
              li = button.closest('li');
              builder = li.data('builder');
              _this.squad_list_modal.modal('hide');
              if (builder.current_squad.dirty) {
                return _this.warnUnsaved(builder, function() {
                  return builder.container.trigger('xwing-backend:squadLoadRequested', li.data('squad'));
                });
              } else {
                return builder.container.trigger('xwing-backend:squadLoadRequested', li.data('squad'));
              }
            });
            li.find('button.delete-squad').click(function(e) {
              var button;
              e.preventDefault();
              button = $(e.target);
              li = button.closest('li');
              builder = li.data('builder');
              return (function(li) {
                return li.find('.squad-description').fadeOut('fast', function() {
                  return li.find('.squad-delete-confirm').fadeIn('fast');
                });
              })(li);
            });
            li.find('button.cancel-delete-squad').click(function(e) {
              var button;
              e.preventDefault();
              button = $(e.target);
              li = button.closest('li');
              builder = li.data('builder');
              return (function(li) {
                return li.find('.squad-delete-confirm').fadeOut('fast', function() {
                  return li.find('.squad-description').fadeIn('fast');
                });
              })(li);
            });
            li.find('button.confirm-delete-squad').click(function(e) {
              var button;
              e.preventDefault();
              button = $(e.target);
              li = button.closest('li');
              builder = li.data('builder');
              li.find('.cancel-delete-squad').fadeOut('fast');
              li.find('.confirm-delete-squad').addClass('disabled');
              li.find('.confirm-delete-squad').text('Deleting...');
              return _this["delete"](li.data('squad').id, function(results) {
                if (results.success) {
                  return li.slideUp('fast', function() {
                    return $(li).remove();
                  });
                } else {
                  return li.html($.trim("Error deleting " + (li.data('squad').name) + ": <em>" + results.error + "</em>"));
                }
              });
            });
          }
        }
        loading_pane.fadeOut('fast');
        return list_ul.fadeIn('fast');
      };
    })(this));
  };

  SquadBuilderBackend.prototype.authenticate = function(cb) {
    var old_auth_state;
    if (cb == null) {
      cb = $.noop;
    }
    $(this.auth_status.find('.payload')).text('Checking auth status...');
    this.auth_status.show();
    old_auth_state = this.authenticated;
    return $.ajax({
      url: "" + this.server + "/ping",
      success: (function(_this) {
        return function(data) {
          if (data != null ? data.success : void 0) {
            _this.authenticated = true;
          } else {
            _this.authenticated = false;
          }
          return _this.maybeAuthenticationChanged(old_auth_state, cb);
        };
      })(this),
      error: (function(_this) {
        return function(jqXHR, textStatus, errorThrown) {
          _this.authenticated = false;
          return _this.maybeAuthenticationChanged(old_auth_state, cb);
        };
      })(this)
    });
  };

  SquadBuilderBackend.prototype.maybeAuthenticationChanged = function(old_auth_state, cb) {
    if (old_auth_state !== this.authenticated) {
      $(window).trigger('xwing-backend:authenticationChanged', [this.authenticated, this]);
    }
    this.oauth_window = null;
    this.auth_status.hide();
    cb(this.authenticated);
    return this.authenticated;
  };

  SquadBuilderBackend.prototype.login = function() {
    if (this.ui_ready) {
      return this.login_modal.modal('show');
    }
  };

  SquadBuilderBackend.prototype.logout = function(cb) {
    if (cb == null) {
      cb = $.noop;
    }
    $(this.auth_status.find('.payload')).text('Logging out...');
    this.auth_status.show();
    return $.get("" + this.server + "/auth/logout", (function(_this) {
      return function(data, textStatus, jqXHR) {
        _this.authenticated = false;
        $(window).trigger('xwing-backend:authenticationChanged', [_this.authenticated, _this]);
        _this.auth_status.hide();
        return cb();
      };
    })(this));
  };

  SquadBuilderBackend.prototype.showSaveAsModal = function(builder) {
    this.save_as_modal.data('builder', builder);
    this.save_as_input.val(builder.current_squad.name);
    this.save_as_save_button.addClass('disabled');
    this.nameCheck();
    return this.save_as_modal.modal('show');
  };

  SquadBuilderBackend.prototype.showDeleteModal = function(builder) {
    this.delete_modal.data('builder', builder);
    this.delete_name_container.text(builder.current_squad.name);
    return this.delete_modal.modal('show');
  };

  SquadBuilderBackend.prototype.nameCheck = function() {
    var name;
    window.clearInterval(this.save_as_modal.data('timer'));
    name = $.trim(this.save_as_input.val());
    if (name.length === 0) {
      this.name_availability_container.text('');
      return this.name_availability_container.append($.trim("<i class=\"fa fa-thumbs-down\"> A name is required"));
    } else {
      return $.post("" + this.server + "/squads/namecheck", {
        name: name
      }, (function(_this) {
        return function(data) {
          _this.name_availability_container.text('');
          if (data.available) {
            _this.name_availability_container.append($.trim("<i class=\"fa fa-thumbs-up\"> Name is available"));
            return _this.save_as_save_button.removeClass('disabled');
          } else {
            _this.name_availability_container.append($.trim("<i class=\"fa fa-thumbs-down\"> You already have a squad with that name"));
            return _this.save_as_save_button.addClass('disabled');
          }
        };
      })(this));
    }
  };

  SquadBuilderBackend.prototype.warnUnsaved = function(builder, action) {
    this.unsaved_modal.data('builder', builder);
    this.unsaved_modal.data('callback', action);
    return this.unsaved_modal.modal('show');
  };

  SquadBuilderBackend.prototype.setupUI = function() {
    var oauth_explanation;
    this.auth_status.addClass('disabled');
    this.auth_status.click((function(_this) {
      return function(e) {
        return false;
      };
    })(this));
    this.login_modal = $(document.createElement('DIV'));
    this.login_modal.addClass('modal hide fade hidden-print');
    $(document.body).append(this.login_modal);
    this.login_modal.append($.trim("<div class=\"modal-header\">\n    <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button>\n    <h3>Log in with OAuth</h3>\n</div>\n<div class=\"modal-body\">\n    <p>\n        Select one of the OAuth providers below to log in and start saving squads.\n        <a class=\"login-help\" href=\"#\">What's this?</a>\n    </p>\n    <div class=\"well well-small oauth-explanation\">\n        <p>\n            <a href=\"http://en.wikipedia.org/wiki/OAuth\" target=\"_blank\">OAuth</a> is an authorization system which lets you prove your identity at a web site without having to create a new account.  Instead, you tell some provider with whom you already have an account (e.g. Google or Facebook) to prove to this web site that you say who you are.  That way, the next time you visit, this site remembers that you're that user from Google.\n        </p>\n        <p>\n            The best part about this is that you don't have to come up with a new username and password to remember.  And don't worry, I'm not collecting any data from the providers about you.  I've tried to set the scope of data to be as small as possible, but some places send a bunch of data at minimum.  I throw it away.  All I look at is a unique identifier (usually some giant number).\n        </p>\n        <p>\n            For more information, check out this <a href=\"http://hueniverse.com/oauth/guide/intro/\" target=\"_blank\">introduction to OAuth</a>.\n        </p>\n        <button class=\"btn\">Got it!</button>\n    </div>\n    <ul class=\"login-providers inline\"></ul>\n    <p>\n        This will open a new window to let you authenticate with the chosen provider.  You may have to allow pop ups for this site.  (Sorry.)\n    </p>\n    <p class=\"login-in-progress\">\n        <em>OAuth login is in progress.  Please finish authorization at the specified provider using the window that was just created.</em>\n    </p>\n</div>\n<div class=\"modal-footer\">\n    <button class=\"btn\" data-dismiss=\"modal\" aria-hidden=\"true\">Close</button>\n</div>"));
    oauth_explanation = $(this.login_modal.find('.oauth-explanation'));
    oauth_explanation.hide();
    this.login_modal.find('.login-in-progress').hide();
    this.login_modal.find('a.login-help').click((function(_this) {
      return function(e) {
        e.preventDefault();
        if (!oauth_explanation.is(':visible')) {
          return oauth_explanation.slideDown('fast');
        }
      };
    })(this));
    oauth_explanation.find('button').click((function(_this) {
      return function(e) {
        e.preventDefault();
        return oauth_explanation.slideUp('fast');
      };
    })(this));
    $.get("" + this.server + "/methods", (function(_this) {
      return function(data, textStatus, jqXHR) {
        var a, li, method, methods_ul, _i, _len, _ref;
        methods_ul = $(_this.login_modal.find('ul.login-providers'));
        _ref = data.methods;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          method = _ref[_i];
          a = $(document.createElement('A'));
          a.addClass('btn btn-inverse');
          a.data('url', "" + _this.server + "/auth/" + method);
          a.append("<i class=\"" + _this.method_metadata[method].icon + "\"></i>&nbsp;" + _this.method_metadata[method].text);
          a.click(function(e) {
            e.preventDefault();
            methods_ul.slideUp('fast');
            _this.login_modal.find('.login-in-progress').slideDown('fast');
            return _this.oauth_window = window.open($(e.target).data('url'), "xwing_login");
          });
          li = $(document.createElement('LI'));
          li.append(a);
          methods_ul.append(li);
        }
        return _this.ui_ready = true;
      };
    })(this));
    this.squad_list_modal = $(document.createElement('DIV'));
    this.squad_list_modal.addClass('modal hide fade hidden-print squad-list');
    $(document.body).append(this.squad_list_modal);
    this.squad_list_modal.append($.trim("<div class=\"modal-header\">\n    <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button>\n    <h3 class=\"squad-list-header-placeholder hidden-phone hidden-tablet\"></h3>\n    <h4 class=\"squad-list-header-placeholder hidden-desktop\"></h4>\n</div>\n<div class=\"modal-body\">\n    <ul class=\"squad-list\"></ul>\n    <p class=\"pagination-centered squad-list-loading\">\n        <i class=\"fa fa-spinner fa-spin fa-3x\"></i>\n        <br />\n        Fetching squads...\n    </p>\n</div>\n<div class=\"modal-footer\">\n    <div class=\"btn-group squad-display-mode\">\n        <button class=\"btn btn-inverse show-all-squads\">All</button>\n        <button class=\"btn show-standard-squads\">Standard</button>\n        <button class=\"btn show-epic-squads\">Epic</button>\n        <button class=\"btn show-team-epic-squads\">Team<span class=\"hidden-phone\"> Epic</span></button>\n    </div>\n    <button class=\"btn\" data-dismiss=\"modal\" aria-hidden=\"true\">Close</button>\n</div>"));
    this.squad_list_modal.find('ul.squad-list').hide();
    this.show_all_squads_button = $(this.squad_list_modal.find('.show-all-squads'));
    this.show_all_squads_button.click((function(_this) {
      return function(e) {
        if (_this.squad_display_mode !== 'all') {
          _this.squad_display_mode = 'all';
          _this.squad_list_modal.find('.squad-display-mode .btn').removeClass('btn-inverse');
          _this.show_all_squads_button.addClass('btn-inverse');
          return _this.squad_list_modal.find('.squad-list li').show();
        }
      };
    })(this));
    this.show_standard_squads_button = $(this.squad_list_modal.find('.show-standard-squads'));
    this.show_standard_squads_button.click((function(_this) {
      return function(e) {
        if (_this.squad_display_mode !== 'standard') {
          _this.squad_display_mode = 'standard';
          _this.squad_list_modal.find('.squad-display-mode .btn').removeClass('btn-inverse');
          _this.show_standard_squads_button.addClass('btn-inverse');
          return _this.squad_list_modal.find('.squad-list li').each(function(idx, elem) {
            return $(elem).toggle(($(elem).data().squad.serialized.search(/v\d+!e/) === -1) && ($(elem).data().squad.serialized.search(/v\d+!t/) === -1));
          });
        }
      };
    })(this));
    this.show_epic_squads_button = $(this.squad_list_modal.find('.show-epic-squads'));
    this.show_epic_squads_button.click((function(_this) {
      return function(e) {
        if (_this.squad_display_mode !== 'epic') {
          _this.squad_display_mode = 'epic';
          _this.squad_list_modal.find('.squad-display-mode .btn').removeClass('btn-inverse');
          _this.show_epic_squads_button.addClass('btn-inverse');
          return _this.squad_list_modal.find('.squad-list li').each(function(idx, elem) {
            return $(elem).toggle($(elem).data().squad.serialized.search(/v\d+!e/) !== -1);
          });
        }
      };
    })(this));
    this.show_team_epic_squads_button = $(this.squad_list_modal.find('.show-team-epic-squads'));
    this.show_team_epic_squads_button.click((function(_this) {
      return function(e) {
        if (_this.squad_display_mode !== 'team-epic') {
          _this.squad_display_mode = 'team-epic';
          _this.squad_list_modal.find('.squad-display-mode .btn').removeClass('btn-inverse');
          _this.show_team_epic_squads_button.addClass('btn-inverse');
          return _this.squad_list_modal.find('.squad-list li').each(function(idx, elem) {
            return $(elem).toggle($(elem).data().squad.serialized.search(/v\d+!t/) !== -1);
          });
        }
      };
    })(this));
    this.save_as_modal = $(document.createElement('DIV'));
    this.save_as_modal.addClass('modal hide fade hidden-print');
    $(document.body).append(this.save_as_modal);
    this.save_as_modal.append($.trim("<div class=\"modal-header\">\n    <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button>\n    <h3>Save Squad As...</h3>\n</div>\n<div class=\"modal-body\">\n    <label for=\"xw-be-squad-save-as\">\n        New Squad Name\n        <input id=\"xw-be-squad-save-as\"></input>\n    </label>\n    <span class=\"name-availability\"></span>\n</div>\n<div class=\"modal-footer\">\n    <button class=\"btn btn-primary save\" aria-hidden=\"true\">Save</button>\n    <button class=\"btn\" data-dismiss=\"modal\" aria-hidden=\"true\">Close</button>\n</div>"));
    this.save_as_modal.on('shown', (function(_this) {
      return function() {
        return window.setTimeout(function() {
          _this.save_as_input.focus();
          return _this.save_as_input.select();
        }, 100);
      };
    })(this));
    this.save_as_save_button = this.save_as_modal.find('button.save');
    this.save_as_save_button.click((function(_this) {
      return function(e) {
        var additional_data, builder, new_name, timer;
        e.preventDefault();
        if (!_this.save_as_save_button.hasClass('disabled')) {
          timer = _this.save_as_modal.data('timer');
          if (timer != null) {
            window.clearInterval(timer);
          }
          _this.save_as_modal.modal('hide');
          builder = _this.save_as_modal.data('builder');
          additional_data = {
            points: builder.total_points,
            description: builder.describeSquad(),
            cards: builder.listCards(),
            notes: builder.getNotes(),
            obstacles: builder.getObstacles()
          };
          builder.backend_save_list_as_button.addClass('disabled');
          builder.backend_status.html($.trim("<i class=\"fa fa-refresh fa-spin\"></i>&nbsp;Saving squad..."));
          builder.backend_status.show();
          new_name = $.trim(_this.save_as_input.val());
          return _this.save(builder.serialize(), null, new_name, builder.faction, additional_data, function(results) {
            if (results.success) {
              builder.current_squad.id = results.id;
              builder.current_squad.name = new_name;
              builder.current_squad.dirty = false;
              builder.container.trigger('xwing-backend:squadDirtinessChanged');
              builder.container.trigger('xwing-backend:squadNameChanged');
              builder.backend_status.html($.trim("<i class=\"fa fa-check\"></i>&nbsp;New squad saved successfully."));
            } else {
              builder.backend_status.html($.trim("<i class=\"fa fa-exclamation-circle\"></i>&nbsp;" + results.error));
            }
            return builder.backend_save_list_as_button.removeClass('disabled');
          });
        }
      };
    })(this));
    this.save_as_input = $(this.save_as_modal.find('input'));
    this.save_as_input.keypress((function(_this) {
      return function(e) {
        var timer;
        if (e.which === 13) {
          _this.save_as_save_button.click();
          return false;
        } else {
          _this.name_availability_container.text('');
          _this.name_availability_container.append($.trim("<i class=\"fa fa-spin fa-spinner\"></i> Checking name availability..."));
          timer = _this.save_as_modal.data('timer');
          if (timer != null) {
            window.clearInterval(timer);
          }
          return _this.save_as_modal.data('timer', window.setInterval(_this.nameCheck, 500));
        }
      };
    })(this));
    this.name_availability_container = $(this.save_as_modal.find('.name-availability'));
    this.delete_modal = $(document.createElement('DIV'));
    this.delete_modal.addClass('modal hide fade hidden-print');
    $(document.body).append(this.delete_modal);
    this.delete_modal.append($.trim("<div class=\"modal-header\">\n    <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button>\n    <h3>Really Delete <span class=\"squad-name-placeholder\"></span>?</h3>\n</div>\n<div class=\"modal-body\">\n    <p>Are you sure you want to delete this squad?</p>\n</div>\n<div class=\"modal-footer\">\n    <button class=\"btn btn-danger delete\" aria-hidden=\"true\">Yes, Delete <i class=\"squad-name-placeholder\"></i></button>\n    <button class=\"btn\" data-dismiss=\"modal\" aria-hidden=\"true\">Never Mind</button>\n</div>"));
    this.delete_name_container = $(this.delete_modal.find('.squad-name-placeholder'));
    this.delete_button = $(this.delete_modal.find('button.delete'));
    this.delete_button.click((function(_this) {
      return function(e) {
        var builder;
        e.preventDefault();
        builder = _this.delete_modal.data('builder');
        builder.backend_status.html($.trim("<i class=\"fa fa-refresh fa-spin\"></i>&nbsp;Deleting squad..."));
        builder.backend_status.show();
        builder.backend_delete_list_button.addClass('disabled');
        _this.delete_modal.modal('hide');
        return _this["delete"](builder.current_squad.id, function(results) {
          if (results.success) {
            builder.resetCurrentSquad();
            builder.current_squad.dirty = true;
            builder.container.trigger('xwing-backend:squadDirtinessChanged');
            return builder.backend_status.html($.trim("<i class=\"fa fa-check\"></i>&nbsp;Squad deleted."));
          } else {
            builder.backend_status.html($.trim("<i class=\"fa fa-exclamation-circle\"></i>&nbsp;" + results.error));
            return builder.backend_delete_list_button.removeClass('disabled');
          }
        });
      };
    })(this));
    this.unsaved_modal = $(document.createElement('DIV'));
    this.unsaved_modal.addClass('modal hide fade hidden-print');
    $(document.body).append(this.unsaved_modal);
    this.unsaved_modal.append($.trim("<div class=\"modal-header\">\n    <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button>\n    <h3>Unsaved Changes</h3>\n</div>\n<div class=\"modal-body\">\n    <p>You have not saved changes to this squad.  Do you want to go back and save?</p>\n</div>\n<div class=\"modal-footer\">\n    <button class=\"btn btn-primary\" aria-hidden=\"true\" data-dismiss=\"modal\">Go Back</button>\n    <button class=\"btn btn-danger discard\" aria-hidden=\"true\">Discard Changes</button>\n</div>"));
    this.unsaved_discard_button = $(this.unsaved_modal.find('button.discard'));
    return this.unsaved_discard_button.click((function(_this) {
      return function(e) {
        e.preventDefault();
        _this.unsaved_modal.data('builder').current_squad.dirty = false;
        _this.unsaved_modal.data('callback')();
        return _this.unsaved_modal.modal('hide');
      };
    })(this));
  };

  SquadBuilderBackend.prototype.setupHandlers = function() {
    $(window).on('xwing-backend:authenticationChanged', (function(_this) {
      return function(e, authenticated, backend) {
        _this.updateAuthenticationVisibility();
        if (authenticated) {
          return _this.loadCollection();
        }
      };
    })(this));
    this.login_logout_button.click((function(_this) {
      return function(e) {
        e.preventDefault();
        if (_this.authenticated) {
          return _this.logout();
        } else {
          return _this.login();
        }
      };
    })(this));
    return $(window).on('message', (function(_this) {
      return function(e) {
        var ev, _ref, _ref1;
        ev = e.originalEvent;
        if (ev.origin === _this.server) {
          switch ((_ref = ev.data) != null ? _ref.command : void 0) {
            case 'auth_successful':
              _this.authenticate();
              _this.login_modal.modal('hide');
              _this.login_modal.find('.login-in-progress').hide();
              _this.login_modal.find('ul.login-providers').show();
              return ev.source.close();
            default:
              return console.log("Unexpected command " + ((_ref1 = ev.data) != null ? _ref1.command : void 0));
          }
        } else {
          console.log("Message received from unapproved origin " + ev.origin);
          return window.last_ev = e;
        }
      };
    })(this)).on('xwing-collection:changed', (function(_this) {
      return function(e, collection) {
        if (_this.collection_save_timer != null) {
          clearTimeout(_this.collection_save_timer);
        }
        return _this.collection_save_timer = setTimeout(function() {
          return _this.saveCollection(collection, function(res) {
            if (res) {
              return $(window).trigger('xwing-collection:saved', collection);
            }
          });
        }, 1000);
      };
    })(this));
  };

  SquadBuilderBackend.prototype.getSettings = function(cb) {
    if (cb == null) {
      cb = $.noop;
    }
    return $.get("" + this.server + "/settings").done((function(_this) {
      return function(data, textStatus, jqXHR) {
        return cb(data.settings);
      };
    })(this));
  };

  SquadBuilderBackend.prototype.set = function(setting, value, cb) {
    var post_args;
    if (cb == null) {
      cb = $.noop;
    }
    post_args = {
      "_method": "PUT"
    };
    post_args[setting] = value;
    return $.post("" + this.server + "/settings", post_args).done((function(_this) {
      return function(data, textStatus, jqXHR) {
        return cb(data.set);
      };
    })(this));
  };

  SquadBuilderBackend.prototype.deleteSetting = function(setting, cb) {
    if (cb == null) {
      cb = $.noop;
    }
    return $.post("" + this.server + "/settings/" + setting, {
      "_method": "DELETE"
    }).done((function(_this) {
      return function(data, textStatus, jqXHR) {
        return cb(data.deleted);
      };
    })(this));
  };

  SquadBuilderBackend.prototype.getHeaders = function(cb) {
    if (cb == null) {
      cb = $.noop;
    }
    return $.get("" + this.server + "/headers").done((function(_this) {
      return function(data, textStatus, jqXHR) {
        return cb(data.headers);
      };
    })(this));
  };

  SquadBuilderBackend.prototype.getLanguagePreference = function(settings, cb) {
    var headers, language_code, language_range, language_tag, quality, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    if (cb == null) {
      cb = $.noop;
    }
    if ((settings != null ? settings.language : void 0) != null) {
      return __iced_k(cb(settings.language));
    } else {
      (function(_this) {
        return (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            funcname: "SquadBuilderBackend.getLanguagePreference"
          });
          _this.getHeaders(__iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                return headers = arguments[0];
              };
            })(),
            lineno: 643
          }));
          __iced_deferrals._fulfill();
        });
      })(this)((function(_this) {
        return function() {
          var _i, _len, _ref, _ref1, _ref2;
          if ((typeof headers !== "undefined" && headers !== null ? headers.HTTP_ACCEPT_LANGUAGE : void 0) != null) {
            _ref = headers.HTTP_ACCEPT_LANGUAGE.split(',');
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              language_range = _ref[_i];
              _ref1 = language_range.split(';'), language_tag = _ref1[0], quality = _ref1[1];
              if (language_tag === '*') {
                cb('English');
              } else {
                language_code = language_tag.split('-')[0];
                cb((_ref2 = exportObj.codeToLanguage[language_code]) != null ? _ref2 : 'English');
              }
              break;
            }
          } else {
            cb('English');
          }
          return __iced_k();
        };
      })(this));
    }
  };

  SquadBuilderBackend.prototype.getCollectionCheck = function(settings, cb) {
    if (cb == null) {
      cb = $.noop;
    }
    if ((settings != null ? settings.collectioncheck : void 0) != null) {
      return cb(settings.collectioncheck);
    } else {
      this.collectioncheck = true;
      return cb(true);
    }
  };

  SquadBuilderBackend.prototype.saveCollection = function(collection, cb) {
    var post_args;
    if (cb == null) {
      cb = $.noop;
    }
    post_args = {
      expansions: collection.expansions,
      singletons: collection.singletons,
      checks: collection.checks
    };
    return $.post("" + this.server + "/collection", post_args).done(function(data, textStatus, jqXHR) {
      return cb(data.success);
    });
  };

  SquadBuilderBackend.prototype.loadCollection = function() {
    return $.get("" + this.server + "/collection").done(function(data, textStatus, jqXHR) {
      var collection;
      collection = data.collection;
      return new exportObj.Collection({
        expansions: collection.expansions,
        singletons: collection.singletons,
        checks: collection.checks
      });
    });
  };

  return SquadBuilderBackend;

})();


/*
    X-Wing Card Browser
    Geordan Rosario <geordan@gmail.com>
    https://github.com/geordanr/xwing
 */

exportObj = typeof exports !== "undefined" && exports !== null ? exports : this;

TYPES = ['pilots', 'upgrades', 'modifications', 'titles'];

byName = function(a, b) {
  var a_name, b_name;
  a_name = a.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
  b_name = b.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
  if (a_name < b_name) {
    return -1;
  } else if (b_name < a_name) {
    return 1;
  } else {
    return 0;
  }
};

byPoints = function(a, b) {
  if (a.data.points < b.data.points) {
    return -1;
  } else if (b.data.points < a.data.points) {
    return 1;
  } else {
    return byName(a, b);
  }
};

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

exportObj.CardBrowser = (function() {
  function CardBrowser(args) {
    this.container = $(args.container);
    this.currently_selected = null;
    this.language = 'English';
    this.prepareData();
    this.setupUI();
    this.setupHandlers();
    this.sort_selector.change();
  }

  CardBrowser.prototype.setupUI = function() {
    this.container.append($.trim("<div class=\"container-fluid xwing-card-browser\">\n    <div class=\"row-fluid\">\n        <div class=\"span12\">\n            <span class=\"translate sort-cards-by\">Sort cards by</span>: <select class=\"sort-by\">\n                <option value=\"name\">Name</option>\n                <option value=\"source\">Source</option>\n                <option value=\"type-by-points\">Type (by Points)</option>\n                <option value=\"type-by-name\" selected=\"1\">Type (by Name)</option>\n            </select>\n        </div>\n    </div>\n    <div class=\"row-fluid\">\n        <div class=\"span4 card-selector-container\">\n\n        </div>\n        <div class=\"span8\">\n            <div class=\"well card-viewer-placeholder info-well\">\n                <p class=\"translate select-a-card\">Select a card from the list at the left.</p>\n            </div>\n            <div class=\"well card-viewer-container info-well\">\n                <span class=\"info-name\"></span>\n                <br />\n                <span class=\"info-type\"></span>\n                <br />\n                <span class=\"info-sources\"></span>\n                <table>\n                    <tbody>\n                        <tr class=\"info-skill\">\n                            <td class=\"info-header\">Skill</td>\n                            <td class=\"info-data info-skill\"></td>\n                        </tr>\n                        <tr class=\"info-energy\">\n                            <td class=\"info-header\"><i class=\"xwing-miniatures-font header-energy xwing-miniatures-font-energy\"></i></td>\n                            <td class=\"info-data info-energy\"></td>\n                        </tr>\n                        <tr class=\"info-attack\">\n                            <td class=\"info-header\"><i class=\"xwing-miniatures-font header-attack xwing-miniatures-font-frontarc\"></i></td>\n                            <td class=\"info-data info-attack\"></td>\n                        </tr>\n                        <tr class=\"info-attack-fullfront\">\n                            <td class=\"info-header\"><i class=\"xwing-miniatures-font header-attack xwing-miniatures-font-fullfrontarc\"></i></td>\n                            <td class=\"info-data info-attack\"></td>\n                        </tr>\n                        <tr class=\"info-attack-bullseye\">\n                            <td class=\"info-header\"><i class=\"xwing-miniatures-font header-attack xwing-miniatures-font-bullseyearc\"></i></td>\n                            <td class=\"info-data info-attack\"></td>\n                        </tr>\n                        <tr class=\"info-attack-back\">\n                            <td class=\"info-header\"><i class=\"xwing-miniatures-font header-attack xwing-miniatures-font-reararc\"></i></td>\n                            <td class=\"info-data info-attack\"></td>\n                        </tr>\n                        <tr class=\"info-attack-turret\">\n                            <td class=\"info-header\"><i class=\"xwing-miniatures-font header-attack xwing-miniatures-font-singleturretarc\"></i></td>\n                            <td class=\"info-data info-attack\"></td>\n                        </tr>\n                        <tr class=\"info-attack-doubleturret\">\n                            <td class=\"info-header\"><i class=\"xwing-miniatures-font header-attack xwing-miniatures-font-doubleturretarc\"></i></td>\n                            <td class=\"info-data info-attack\"></td>\n                        </tr>\n                        <tr class=\"info-agility\">\n                            <td class=\"info-header\"><i class=\"xwing-miniatures-font header-agility xwing-miniatures-font-agility\"></i></td>\n                            <td class=\"info-data info-agility\"></td>\n                        </tr>\n                        <tr class=\"info-hull\">\n                            <td class=\"info-header\"><i class=\"xwing-miniatures-font header-hull xwing-miniatures-font-hull\"></i></td>\n                            <td class=\"info-data info-hull\"></td>\n                        </tr>\n                        <tr class=\"info-shields\">\n                            <td class=\"info-header\"><i class=\"xwing-miniatures-font header-shield xwing-miniatures-font-shield\"></i></td>\n                            <td class=\"info-data info-shields\"></td>\n                        </tr>\n                        <tr class=\"info-force\">\n                            <td class=\"info-header\"><i class=\"xwing-miniatures-font header-force xwing-miniatures-font-forcecharge\"></i></td>\n                            <td class=\"info-data info-force\"></td>\n                        </tr>\n                        <tr class=\"info-charge\">\n                            <td class=\"info-header\"><i class=\"xwing-miniatures-font header-charge xwing-miniatures-font-charge\"></i></td>\n                            <td class=\"info-data info-charge\"></td>\n                        </tr>\n                        <tr class=\"info-range\">\n                            <td class=\"info-header\">Range</td>\n                            <td class=\"info-data info-range\"></td>\n                        </tr>\n                        <tr class=\"info-actions\">\n                            <td class=\"info-header\">Actions</td>\n                            <td class=\"info-data\"></td>\n                        </tr>\n                        <tr class=\"info-actions-red\">\n                            <td></td>\n                            <td class=\"info-data-red\"></td>\n                        </tr>\n                        <tr class=\"info-upgrades\">\n                            <td class=\"info-header\">Upgrades</td>\n                            <td class=\"info-data\"></td>\n                        </tr>\n                    </tbody>\n                </table>\n                <p class=\"info-text\" />\n            </div>\n        </div>\n    </div>\n</div>"));
    this.card_selector_container = $(this.container.find('.xwing-card-browser .card-selector-container'));
    this.card_viewer_container = $(this.container.find('.xwing-card-browser .card-viewer-container'));
    this.card_viewer_container.hide();
    this.card_viewer_placeholder = $(this.container.find('.xwing-card-browser .card-viewer-placeholder'));
    this.sort_selector = $(this.container.find('select.sort-by'));
    return this.sort_selector.select2({
      minimumResultsForSearch: -1
    });
  };

  CardBrowser.prototype.setupHandlers = function() {
    this.sort_selector.change((function(_this) {
      return function(e) {
        return _this.renderList(_this.sort_selector.val());
      };
    })(this));
    return $(window).on('xwing:afterLanguageLoad', (function(_this) {
      return function(e, language, cb) {
        if (cb == null) {
          cb = $.noop;
        }
        _this.language = language;
        _this.prepareData();
        return _this.renderList(_this.sort_selector.val());
      };
    })(this));
  };

  CardBrowser.prototype.prepareData = function() {
    var card, card_data, card_name, sorted_sources, sorted_types, source, type, upgrade_text, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _m, _n, _ref, _ref1, _ref2, _results;
    this.all_cards = [];
    for (_i = 0, _len = TYPES.length; _i < _len; _i++) {
      type = TYPES[_i];
      if (type === 'upgrades') {
        this.all_cards = this.all_cards.concat((function() {
          var _ref, _results;
          _ref = exportObj[type];
          _results = [];
          for (card_name in _ref) {
            card_data = _ref[card_name];
            _results.push({
              name: card_data.name,
              type: exportObj.translate(this.language, 'ui', 'upgradeHeader', card_data.slot),
              data: card_data,
              orig_type: card_data.slot
            });
          }
          return _results;
        }).call(this));
      } else {
        this.all_cards = this.all_cards.concat((function() {
          var _ref, _results;
          _ref = exportObj[type];
          _results = [];
          for (card_name in _ref) {
            card_data = _ref[card_name];
            _results.push({
              name: card_data.name,
              type: exportObj.translate(this.language, 'singular', type),
              data: card_data,
              orig_type: exportObj.translate('English', 'singular', type)
            });
          }
          return _results;
        }).call(this));
      }
    }
    this.types = (function() {
      var _j, _len1, _ref, _results;
      _ref = ['Pilot', 'Modification', 'Title'];
      _results = [];
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        type = _ref[_j];
        _results.push(exportObj.translate(this.language, 'types', type));
      }
      return _results;
    }).call(this);
    _ref = exportObj.upgrades;
    for (card_name in _ref) {
      card_data = _ref[card_name];
      upgrade_text = exportObj.translate(this.language, 'ui', 'upgradeHeader', card_data.slot);
      if (__indexOf.call(this.types, upgrade_text) < 0) {
        this.types.push(upgrade_text);
      }
    }
    this.all_cards.sort(byName);
    this.sources = [];
    _ref1 = this.all_cards;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      card = _ref1[_j];
      _ref2 = card.data.sources;
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        source = _ref2[_k];
        if (__indexOf.call(this.sources, source) < 0) {
          this.sources.push(source);
        }
      }
    }
    sorted_types = this.types.sort();
    sorted_sources = this.sources.sort();
    this.cards_by_type_name = {};
    for (_l = 0, _len3 = sorted_types.length; _l < _len3; _l++) {
      type = sorted_types[_l];
      this.cards_by_type_name[type] = ((function() {
        var _len4, _m, _ref3, _results;
        _ref3 = this.all_cards;
        _results = [];
        for (_m = 0, _len4 = _ref3.length; _m < _len4; _m++) {
          card = _ref3[_m];
          if (card.type === type) {
            _results.push(card);
          }
        }
        return _results;
      }).call(this)).sort(byName);
    }
    this.cards_by_type_points = {};
    for (_m = 0, _len4 = sorted_types.length; _m < _len4; _m++) {
      type = sorted_types[_m];
      this.cards_by_type_points[type] = ((function() {
        var _len5, _n, _ref3, _results;
        _ref3 = this.all_cards;
        _results = [];
        for (_n = 0, _len5 = _ref3.length; _n < _len5; _n++) {
          card = _ref3[_n];
          if (card.type === type) {
            _results.push(card);
          }
        }
        return _results;
      }).call(this)).sort(byPoints);
    }
    this.cards_by_source = {};
    _results = [];
    for (_n = 0, _len5 = sorted_sources.length; _n < _len5; _n++) {
      source = sorted_sources[_n];
      _results.push(this.cards_by_source[source] = ((function() {
        var _len6, _o, _ref3, _results1;
        _ref3 = this.all_cards;
        _results1 = [];
        for (_o = 0, _len6 = _ref3.length; _o < _len6; _o++) {
          card = _ref3[_o];
          if (__indexOf.call(card.data.sources, source) >= 0) {
            _results1.push(card);
          }
        }
        return _results1;
      }).call(this)).sort(byName));
    }
    return _results;
  };

  CardBrowser.prototype.renderList = function(sort_by) {
    var card, optgroup, source, type, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _len6, _m, _n, _o, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6;
    if (sort_by == null) {
      sort_by = 'name';
    }
    if (this.card_selector != null) {
      this.card_selector.remove();
    }
    this.card_selector = $(document.createElement('SELECT'));
    this.card_selector.addClass('card-selector');
    this.card_selector.attr('size', 25);
    this.card_selector_container.append(this.card_selector);
    switch (sort_by) {
      case 'type-by-name':
        _ref = this.types;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          type = _ref[_i];
          optgroup = $(document.createElement('OPTGROUP'));
          optgroup.attr('label', type);
          this.card_selector.append(optgroup);
          _ref1 = this.cards_by_type_name[type];
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            card = _ref1[_j];
            this.addCardTo(optgroup, card);
          }
        }
        break;
      case 'type-by-points':
        _ref2 = this.types;
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          type = _ref2[_k];
          optgroup = $(document.createElement('OPTGROUP'));
          optgroup.attr('label', type);
          this.card_selector.append(optgroup);
          _ref3 = this.cards_by_type_points[type];
          for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
            card = _ref3[_l];
            this.addCardTo(optgroup, card);
          }
        }
        break;
      case 'source':
        _ref4 = this.sources;
        for (_m = 0, _len4 = _ref4.length; _m < _len4; _m++) {
          source = _ref4[_m];
          optgroup = $(document.createElement('OPTGROUP'));
          optgroup.attr('label', source);
          this.card_selector.append(optgroup);
          _ref5 = this.cards_by_source[source];
          for (_n = 0, _len5 = _ref5.length; _n < _len5; _n++) {
            card = _ref5[_n];
            this.addCardTo(optgroup, card);
          }
        }
        break;
      default:
        _ref6 = this.all_cards;
        for (_o = 0, _len6 = _ref6.length; _o < _len6; _o++) {
          card = _ref6[_o];
          this.addCardTo(this.card_selector, card);
        }
    }
    return this.card_selector.change((function(_this) {
      return function(e) {
        return _this.renderCard($(_this.card_selector.find(':selected')));
      };
    })(this));
  };

  CardBrowser.prototype.renderCard = function(card) {
    var action, cls, data, name, orig_type, ship, slot, source, type, _i, _len, _ref, _ref1, _ref10, _ref11, _ref12, _ref13, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
    name = card.data('name');
    type = card.data('type');
    data = card.data('card');
    orig_type = card.data('orig_type');
    this.card_viewer_container.find('.info-name').html("" + (data.unique ? "&middot;&nbsp;" : "") + name + " (" + data.points + ")" + (data.limited != null ? " (" + (exportObj.translate(this.language, 'ui', 'limited')) + ")" : "") + (data.epic != null ? " (" + (exportObj.translate(this.language, 'ui', 'epic')) + ")" : "") + (exportObj.isReleased(data) ? "" : " (" + (exportObj.translate(this.language, 'ui', 'unreleased')) + ")"));
    this.card_viewer_container.find('p.info-text').html((_ref = data.text) != null ? _ref : '');
    this.card_viewer_container.find('.info-sources').text(((function() {
      var _i, _len, _ref1, _results;
      _ref1 = data.sources;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        source = _ref1[_i];
        _results.push(exportObj.translate(this.language, 'sources', source));
      }
      return _results;
    }).call(this)).sort().join(', '));
    switch (orig_type) {
      case 'Pilot':
        ship = exportObj.ships[data.ship];
        this.card_viewer_container.find('.info-type').text("" + data.ship + " Pilot (" + data.faction + ")");
        this.card_viewer_container.find('tr.info-skill td.info-data').text(data.skill);
        this.card_viewer_container.find('tr.info-skill').show();
        this.card_viewer_container.find('tr.info-attack td.info-data').text((_ref1 = (_ref2 = data.ship_override) != null ? _ref2.attack : void 0) != null ? _ref1 : ship.attack);
        this.card_viewer_container.find('tr.info-attack-bullseye td.info-data').text(ship.attackbull);
        this.card_viewer_container.find('tr.info-attack-fullfront td.info-data').text(ship.attackf);
        this.card_viewer_container.find('tr.info-attack-back td.info-data').text(ship.attackb);
        this.card_viewer_container.find('tr.info-attack-turret td.info-data').text(ship.attackt);
        this.card_viewer_container.find('tr.info-attack-doubleturret td.info-data').text(ship.attackdt);
        this.card_viewer_container.find('tr.info-attack').toggle(ship.attack != null);
        this.card_viewer_container.find('tr.info-attack-bullseye').toggle(ship.attackbull != null);
        this.card_viewer_container.find('tr.info-attack-fullfront').toggle(ship.attackf != null);
        this.card_viewer_container.find('tr.info-attack-back').toggle(ship.attackb != null);
        this.card_viewer_container.find('tr.info-attack-turret').toggle(ship.attackt != null);
        this.card_viewer_container.find('tr.info-attack-doubleturret').toggle(ship.attackdt != null);
        _ref3 = this.card_viewer_container.find('tr.info-attack td.info-header i.xwing-miniatures-font')[0].classList;
        for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
          cls = _ref3[_i];
          if (cls.startsWith('xwing-miniatures-font-attack')) {
            this.card_viewer_container.find('tr.info-attack td.info-header i.xwing-miniatures-font').removeClass(cls);
          }
        }
        this.card_viewer_container.find('tr.info-attack td.info-header i.xwing-miniatures-font').addClass((_ref4 = ship.attack_icon) != null ? _ref4 : 'xwing-miniatures-font-attack');
        this.card_viewer_container.find('tr.info-energy td.info-data').text((_ref5 = (_ref6 = data.ship_override) != null ? _ref6.energy : void 0) != null ? _ref5 : ship.energy);
        this.card_viewer_container.find('tr.info-energy').toggle((((_ref7 = data.ship_override) != null ? _ref7.energy : void 0) != null) || (ship.energy != null));
        this.card_viewer_container.find('tr.info-range').hide();
        this.card_viewer_container.find('tr.info-agility td.info-data').text((_ref8 = (_ref9 = data.ship_override) != null ? _ref9.agility : void 0) != null ? _ref8 : ship.agility);
        this.card_viewer_container.find('tr.info-agility').show();
        this.card_viewer_container.find('tr.info-hull td.info-data').text((_ref10 = (_ref11 = data.ship_override) != null ? _ref11.hull : void 0) != null ? _ref10 : ship.hull);
        this.card_viewer_container.find('tr.info-hull').show();
        this.card_viewer_container.find('tr.info-shields td.info-data').text((_ref12 = (_ref13 = data.ship_override) != null ? _ref13.shields : void 0) != null ? _ref12 : ship.shields);
        this.card_viewer_container.find('tr.info-shields').show();
        if (data.force != null) {
          this.card_viewer_container.find('tr.info-force td.info-data').html(data.force + '<i class="xwing-miniatures-font xwing-miniatures-font-recurring"></i>');
          this.card_viewer_container.find('tr.info-force td.info-header').show();
          this.card_viewer_container.find('tr.info-force').show();
        } else {
          this.card_viewer_container.find('tr.info-force').hide();
        }
        if (data.charge != null) {
          if (data.recurring != null) {
            this.card_viewer_container.find('tr.info-charge td.info-data').html(data.charge + '<i class="xwing-miniatures-font xwing-miniatures-font-recurring"></i>');
          } else {
            this.card_viewer_container.find('tr.info-charge td.info-data').text(data.charge);
          }
          this.card_viewer_container.find('tr.info-charge').show();
        } else {
          this.card_viewer_container.find('tr.info-charge').hide();
        }
        this.card_viewer_container.find('tr.info-actions td.info-data').html(((((function() {
          var _j, _len1, _ref14, _results;
          _ref14 = exportObj.ships[data.ship].actions;
          _results = [];
          for (_j = 0, _len1 = _ref14.length; _j < _len1; _j++) {
            action = _ref14[_j];
            _results.push(exportObj.translate(this.language, 'action', action));
          }
          return _results;
        }).call(this)).join(', ')).replace(/, <r><i class="xwing-miniatures-font xwing-miniatures-font-linked">/g, ' <r><i class="xwing-miniatures-font xwing-miniatures-font-linked">')).replace(/, <i class="xwing-miniatures-font xwing-miniatures-font-linked">/g, ' <i class="xwing-miniatures-font xwing-miniatures-font-linked">'));
        this.card_viewer_container.find('tr.info-actions').show();
        if (ships[data.ship].actionsred != null) {
          this.card_viewer_container.find('tr.info-actions-red td.info-data').html(((function() {
            var _j, _len1, _ref14, _results;
            _ref14 = exportObj.ships[data.ship].actionsred;
            _results = [];
            for (_j = 0, _len1 = _ref14.length; _j < _len1; _j++) {
              action = _ref14[_j];
              _results.push(exportObj.translate(this.language, 'action', action));
            }
            return _results;
          }).call(this)).join(' '));
          this.card_viewer_container.find('tr.info-actions-red').show();
        } else {
          this.card_viewer_container.find('tr.info-actions-red').hide();
        }
        this.card_viewer_container.find('tr.info-upgrades').show();
        this.card_viewer_container.find('tr.info-upgrades td.info-data').html(((function() {
          var _j, _len1, _ref14, _results;
          _ref14 = data.slots;
          _results = [];
          for (_j = 0, _len1 = _ref14.length; _j < _len1; _j++) {
            slot = _ref14[_j];
            _results.push(exportObj.translate(this.language, 'sloticon', slot));
          }
          return _results;
        }).call(this)).join(' ') || 'None');
        break;
      default:
        this.card_viewer_container.find('.info-type').text(type);
        if (data.faction != null) {
          this.card_viewer_container.find('.info-type').append(" &ndash; " + data.faction + " only");
        }
        this.card_viewer_container.find('tr.info-ship').hide();
        this.card_viewer_container.find('tr.info-skill').hide();
        if (data.energy != null) {
          this.card_viewer_container.find('tr.info-energy td.info-data').text(data.energy);
          this.card_viewer_container.find('tr.info-energy').show();
        } else {
          this.card_viewer_container.find('tr.info-energy').hide();
        }
        if (data.attack != null) {
          this.card_viewer_container.find('tr.info-attack td.info-data').text(data.attack);
          this.card_viewer_container.find('tr.info-attack').show();
        } else {
          this.card_viewer_container.find('tr.info-attack').hide();
        }
        if (data.attackbull != null) {
          this.card_viewer_container.find('tr.info-attack-bullseye td.info-data').text(data.attackbull);
          this.card_viewer_container.find('tr.info-attack-bullseye').show();
        } else {
          this.card_viewer_container.find('tr.info-attack-bullseye').hide();
        }
        if (data.attackt != null) {
          this.card_viewer_container.find('tr.info-attack-turret td.info-data').text(data.attackt);
          this.card_viewer_container.find('tr.info-attack-turret').show();
        } else {
          this.card_viewer_container.find('tr.info-attack-turret').hide();
        }
        if (data.range != null) {
          this.card_viewer_container.find('tr.info-range td.info-data').text(data.range);
          this.card_viewer_container.find('tr.info-range').show();
        } else {
          this.card_viewer_container.find('tr.info-range').hide();
        }
        if (data.force != null) {
          this.card_viewer_container.find('tr.info-force td.info-data').html(data.force + '<i class="xwing-miniatures-font xwing-miniatures-font-recurring"></i>');
          this.card_viewer_container.find('tr.info-force td.info-header').show();
          this.card_viewer_container.find('tr.info-force').show();
        } else {
          this.card_viewer_container.find('tr.info-force').hide();
        }
        if (data.charge != null) {
          if (data.recurring != null) {
            this.card_viewer_container.find('tr.info-charge td.info-data').html(data.charge + '<i class="xwing-miniatures-font xwing-miniatures-font-recurring"></i>');
          } else {
            this.card_viewer_container.find('tr.info-charge td.info-data').text(data.charge);
          }
          this.card_viewer_container.find('tr.info-charge').show();
        } else {
          this.card_viewer_container.find('tr.info-charge').hide();
        }
        this.card_viewer_container.find('tr.info-attack-fullfront').hide();
        this.card_viewer_container.find('tr.info-attack-back').hide();
        this.card_viewer_container.find('tr.info-attack-doubleturret').hide();
        this.card_viewer_container.find('tr.info-agility').hide();
        this.card_viewer_container.find('tr.info-hull').hide();
        this.card_viewer_container.find('tr.info-shields').hide();
        this.card_viewer_container.find('tr.info-actions').hide();
        this.card_viewer_container.find('tr.info-actions-red').hide();
        this.card_viewer_container.find('tr.info-upgrades').hide();
    }
    this.card_viewer_container.show();
    return this.card_viewer_placeholder.hide();
  };

  CardBrowser.prototype.addCardTo = function(container, card) {
    var option;
    option = $(document.createElement('OPTION'));
    option.text("" + card.name + " (" + card.data.points + ")");
    option.data('name', card.name);
    option.data('type', card.type);
    option.data('card', card.data);
    option.data('orig_type', card.orig_type);
    return $(container).append(option);
  };

  return CardBrowser;

})();

exportObj = typeof exports !== "undefined" && exports !== null ? exports : this;

exportObj.unreleasedExpansions = [];

exportObj.isReleased = function(data) {
  var source, _i, _len, _ref;
  _ref = data.sources;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    source = _ref[_i];
    if (__indexOf.call(exportObj.unreleasedExpansions, source) < 0) {
      return true;
    }
  }
  return false;
};

exportObj.secondEditionExpansions = ['Second Edition Core Set', "Saw's Renegades Expansion Pack", 'TIE Reaper Expansion Pack', 'T-65 X-Wing Expansion Pack', 'BTL-A4 Y-Wing Expansion Pack', 'TIE/ln Fighter Expansion Pack', 'TIE Advanced x1 Expansion Pack', 'Slave I Expansion Pack', 'Fang Fighter Expansion Pack', "Lando's Millennium Falcon Expansion Pack"];

exportObj.secondEditionCheck = function(data, faction) {
  var source, _i, _len, _ref;
  if (faction == null) {
    faction = '';
  }
  if (data.name === 'Y-Wing' && faction === 'Scum and Villainy') {
    return false;
  } else if (data.name === 'TIE Fighter' && faction === 'Rebel Alliance') {
    return false;
  }
  _ref = data.sources;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    source = _ref[_i];
    if (__indexOf.call(exportObj.secondEditionExpansions, source) >= 0) {
      return true;
    }
  }
  return false;
};

String.prototype.canonicalize = function() {
  return this.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/\s+/g, '-');
};

exportObj.hugeOnly = function(ship) {
  var _ref;
  return (_ref = ship.data.huge) != null ? _ref : false;
};

exportObj.basicCardData = function() {
  return {
    ships: {
      "X-Wing": {
        name: "X-Wing",
        xws: "T-65 X-Wing".canonicalize(),
        factions: ["Rebel Alliance"],
        attack: 3,
        agility: 2,
        hull: 4,
        shields: 2,
        actions: ["Focus", "Lock", "Barrel Roll"],
        actionsred: [],
        maneuvers: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 2, 2, 2, 0, 0, 0, 0, 0, 0], [1, 2, 2, 2, 1, 0, 0, 0, 0, 0], [1, 1, 1, 1, 1, 0, 0, 0, 3, 3], [0, 0, 1, 0, 0, 3, 0, 0, 0, 0]]
      },
      "Y-Wing": {
        name: "Y-Wing",
        xws: "BTL-A4 Y-Wing".canonicalize(),
        factions: ["Rebel Alliance", "Scum and Villainy"],
        attack: 2,
        agility: 1,
        hull: 6,
        shields: 2,
        actions: ["Focus", "Lock"],
        actionsred: ["Barrel Roll", "Reload"],
        maneuvers: [[0, 0, 0, 0, 0, 0], [0, 2, 2, 2, 0, 0], [1, 1, 2, 1, 1, 0], [3, 1, 1, 1, 3, 0], [0, 0, 3, 0, 0, 3]]
      },
      "A-Wing": {
        name: "A-Wing",
        xws: "RZ-1 A-Wing".canonicalize(),
        factions: ["Rebel Alliance"],
        attack: 2,
        agility: 3,
        hull: 2,
        shields: 2,
        actions: ["Focus", "Evade", "Lock", "Barrel Roll", "Boost"],
        actionsred: [],
        maneuvers: [[0, 0, 0, 0, 0, 0, 0, 0], [1, 0, 0, 0, 1, 0, 0, 0], [2, 2, 2, 2, 2, 0, 0, 0], [1, 1, 2, 1, 1, 0, 3, 3], [0, 0, 2, 0, 0, 0, 0, 0], [0, 0, 2, 0, 0, 3, 0, 0]]
      },
      "YT-1300": {
        name: "YT-1300",
        xws: "Modified YT-1300 Light Freighter".canonicalize(),
        factions: ["Rebel Alliance"],
        attackdt: 3,
        agility: 1,
        hull: 8,
        shields: 5,
        actions: ["Focus", "Lock", "Rotate Arc"],
        actionsred: ["Boost"],
        maneuvers: [[0, 0, 0, 0, 0, 0, 0, 0], [0, 1, 2, 1, 0, 0, 0, 0], [1, 2, 2, 2, 1, 0, 0, 0], [1, 1, 2, 1, 1, 0, 3, 3], [0, 0, 1, 0, 0, 3, 0, 0]],
        large: true
      },
      "YT-1300 (Scum)": {
        name: "YT-1300 (Scum)",
        canonical_name: 'YT-1300'.canonicalize(),
        xws: "Customized YT-1300 Light Freighter".canonicalize(),
        factions: ["Scum and Villainy"],
        attackdt: 2,
        agility: 1,
        hull: 8,
        shields: 3,
        actions: ["Focus", "Lock", "Rotate Arc"],
        actionsred: ["Boost"],
        maneuvers: [[0, 0, 0, 0, 0, 0, 0, 0], [0, 2, 2, 2, 0, 0, 0, 0], [1, 1, 2, 1, 1, 0, 0, 0], [1, 1, 2, 1, 1, 0, 3, 3], [0, 0, 1, 0, 0, 3, 0, 0]],
        large: true
      },
      "TIE Fighter": {
        name: "TIE Fighter",
        xws: "TIE/LN Fighter".canonicalize(),
        factions: ["Rebel Alliance", "Galactic Empire"],
        attack: 2,
        agility: 3,
        hull: 3,
        shields: 0,
        actions: ["Focus", "Barrel Roll", "Evade"],
        actionsred: [],
        maneuvers: [[0, 0, 0, 0, 0, 0], [1, 0, 0, 0, 1, 0], [1, 2, 2, 2, 1, 0], [1, 1, 2, 1, 1, 3], [0, 0, 1, 0, 0, 3], [0, 0, 1, 0, 0, 0]]
      },
      "TIE Advanced": {
        name: "TIE Advanced",
        xws: "TIE Advanced X1".canonicalize(),
        factions: ["Galactic Empire"],
        attack: 2,
        agility: 3,
        hull: 3,
        shields: 2,
        actions: ["Focus", "R> Barrel Roll", "Lock", "Barrel Roll"],
        actionsred: [],
        maneuvers: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 2, 1, 2, 0, 0, 0, 0, 0, 0], [1, 2, 2, 2, 1, 0, 0, 0, 0, 0], [1, 1, 2, 1, 1, 0, 0, 0, 3, 3], [0, 0, 1, 0, 0, 3, 0, 0, 0, 0], [0, 0, 1, 0, 0, 0, 0, 0, 0, 0]]
      },
      "TIE Interceptor": {
        name: "TIE Interceptor",
        xws: "TIE Interceptor".canonicalize(),
        factions: ["Galactic Empire"],
        attack: 3,
        agility: 3,
        hull: 3,
        shields: 0,
        actions: ["Focus", "Barrel Roll", "Boost", "Evade"],
        actionsred: [],
        maneuvers: [[0, 0, 0, 0, 0, 0, 0, 0], [1, 0, 0, 0, 1, 0, 0, 0], [2, 2, 2, 2, 2, 0, 0, 0], [1, 1, 2, 1, 1, 0, 3, 3], [0, 0, 2, 0, 0, 3, 0, 0], [0, 0, 1, 0, 0, 0, 0, 0]]
      },
      "Firespray-31": {
        name: "Firespray-31",
        xws: "Firespray-Class Patrol Craft".canonicalize(),
        factions: ["Scum and Villainy"],
        attack: 3,
        attackb: 3,
        agility: 2,
        hull: 6,
        shields: 4,
        medium: true,
        actions: ["Focus", "Lock", "Boost"],
        actionsred: ["Reinforce"],
        maneuvers: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [1, 2, 2, 2, 1, 0, 0, 0, 0, 0], [1, 1, 2, 1, 1, 0, 0, 0, 0, 0], [0, 1, 2, 1, 0, 0, 0, 0, 3, 3], [0, 0, 1, 0, 0, 3, 0, 0, 0, 0]]
      },
      "HWK-290": {
        name: "HWK-290",
        xws: "Hwk-290 Light Freighter".canonicalize(),
        factions: ["Rebel Alliance", "Scum and Villainy"],
        attackt: 2,
        agility: 2,
        hull: 3,
        shields: 2,
        actions: ["Focus", "R> Rotate Arc", "Lock", "R> Rotate Arc", "Rotate Arc"],
        actionsred: ["Boost", "Jam"],
        maneuvers: [[0, 0, 3, 0, 0], [0, 2, 2, 2, 0], [1, 1, 2, 1, 1], [3, 1, 1, 1, 3], [0, 0, 1, 0, 0]]
      },
      "Lambda-Class Shuttle": {
        name: "Lambda-Class Shuttle",
        xws: "Lambda-Class T-4a Shuttle".canonicalize(),
        factions: ["Galactic Empire"],
        attack: 3,
        attackb: 2,
        agility: 1,
        hull: 6,
        shields: 4,
        actions: ["Focus", "Coordinate", "Reinforce"],
        actionsred: ["Jam"],
        maneuvers: [[0, 0, 3, 0, 0], [0, 2, 2, 2, 0], [3, 1, 2, 1, 3], [0, 3, 1, 3, 0]],
        large: true
      },
      "B-Wing": {
        name: "B-Wing",
        xws: "A/SF-01 B-Wing".canonicalize(),
        factions: ["Rebel Alliance"],
        attack: 3,
        agility: 1,
        hull: 4,
        shields: 4,
        actions: ["Focus", "R> Barrel Roll", "Lock", "Barrel Roll"],
        actionsred: [],
        maneuvers: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [3, 2, 2, 2, 3, 0, 0, 0, 3, 3], [1, 1, 2, 1, 1, 3, 0, 0, 0, 0], [0, 3, 2, 3, 0, 0, 0, 0, 0, 0], [0, 0, 3, 0, 0, 0, 0, 0, 0, 0]]
      },
      "TIE Bomber": {
        name: "TIE Bomber",
        xws: "TIE/SA Bomber".canonicalize(),
        factions: ["Galactic Empire"],
        attack: 2,
        agility: 2,
        hull: 6,
        shields: 0,
        actions: ["Focus", "Lock", "Barrel Roll", "R> Lock"],
        actionsred: ["Reload"],
        maneuvers: [[0, 0, 0, 0, 0, 0], [0, 1, 2, 1, 0, 0], [1, 2, 2, 2, 1, 0], [1, 1, 2, 1, 1, 3], [0, 0, 1, 0, 0, 0], [0, 0, 0, 0, 0, 3]]
      },
      "Z-95 Headhunter": {
        name: "Z-95 Headhunter",
        xws: "Z-95-AF4 Headhunter".canonicalize(),
        factions: ["Rebel Alliance", "Scum and Villainy"],
        attack: 2,
        agility: 2,
        hull: 2,
        shields: 2,
        actions: ["Focus", "Lock"],
        actionsred: ["Barrel Roll"],
        maneuvers: [[0, 0, 0, 0, 0, 0], [0, 1, 2, 1, 0, 0], [1, 2, 2, 2, 1, 0], [1, 1, 2, 1, 1, 3], [0, 0, 1, 0, 0, 3]]
      },
      "TIE Defender": {
        name: "TIE Defender",
        xws: "TIE/D Defender".canonicalize(),
        factions: ["Galactic Empire"],
        attack: 3,
        agility: 3,
        hull: 3,
        shields: 4,
        actions: ["Focus", "Evade", "Lock", "Barrel Roll", "Boost"],
        actionsred: [],
        maneuvers: [[0, 0, 0, 0, 0, 0], [3, 2, 0, 2, 3, 0], [3, 1, 2, 1, 3, 3], [1, 1, 2, 1, 1, 0], [0, 0, 2, 0, 0, 1], [0, 0, 2, 0, 0, 0]]
      },
      "E-Wing": {
        name: "E-Wing",
        xws: "E-Wing".canonicalize(),
        factions: ["Rebel Alliance"],
        attack: 3,
        agility: 3,
        hull: 3,
        shields: 3,
        actions: ["Focus", "Evade", "Lock", "Barrel Roll", "R> Lock", "Boost", "R> Lock"],
        actionsred: [],
        maneuvers: [[0, 0, 0, 0, 0, 0, 0, 0], [3, 2, 2, 2, 3, 0, 0, 0], [1, 1, 2, 1, 1, 0, 0, 0], [1, 1, 2, 1, 1, 0, 3, 3], [0, 0, 1, 0, 0, 3, 0, 0], [0, 0, 1, 0, 0, 0, 0, 0]]
      },
      "TIE Phantom": {
        name: "TIE Phantom",
        xws: "TIE/PH Phantom".canonicalize(),
        factions: ["Galactic Empire"],
        attack: 3,
        agility: 2,
        hull: 3,
        shields: 2,
        actions: ["Focus", "Evade", "Barrel Roll", "Cloak"],
        actionsred: [],
        maneuvers: [[0, 0, 0, 0, 0, 0], [1, 1, 0, 1, 1, 0], [1, 2, 2, 2, 1, 0], [1, 1, 2, 1, 1, 3], [0, 0, 1, 0, 0, 3]]
      },
      "YT-2400": {
        name: "YT-2400",
        xws: "YT-2400 Light Freighter".canonicalize(),
        factions: ["Rebel Alliance"],
        attackdt: 4,
        agility: 2,
        hull: 6,
        shields: 4,
        actions: ["Focus", "Lock", "Rotate Arc"],
        actionsred: ["Barrel Roll"],
        large: true,
        maneuvers: [[0, 0, 0, 0, 0, 0], [1, 2, 2, 2, 1, 0], [1, 1, 2, 1, 1, 0], [1, 1, 1, 1, 1, 0], [0, 0, 1, 0, 0, 3]]
      },
      "VT-49 Decimator": {
        name: "VT-49 Decimator",
        xws: "VT-49 Decimator".canonicalize(),
        factions: ["Galactic Empire"],
        attackdt: 3,
        agility: 0,
        hull: 12,
        shields: 4,
        actions: ["Focus", "Lock", "Reinforce", "Rotate Arc"],
        actionsred: ["Coordinate"],
        large: true,
        maneuvers: [[0, 0, 0, 0, 0, 0], [3, 2, 2, 2, 3, 0], [1, 1, 2, 1, 1, 0], [1, 1, 1, 1, 1, 0], [0, 0, 1, 0, 0, 0]]
      },
      "StarViper": {
        name: "StarViper",
        xws: "Starviper-Class Attack Platform".canonicalize(),
        factions: ["Scum and Villainy"],
        attack: 3,
        agility: 3,
        hull: 4,
        shields: 1,
        actions: ["Focus", "Lock", "Barrel Roll", "R> Focus", "Boost", "R> Focus"],
        actionsred: [],
        maneuvers: [[0, 0, 0, 0, 0, 0, 0, 0], [1, 2, 2, 2, 1, 0, 0, 0], [1, 2, 2, 2, 1, 0, 0, 0], [0, 1, 2, 1, 0, 0, 3, 3], [0, 0, 1, 0, 0, 0, 0, 0]]
      },
      "M3-A Interceptor": {
        name: "M3-A Interceptor",
        xws: "M3-A Interceptor".canonicalize(),
        factions: ["Scum and Villainy"],
        attack: 2,
        agility: 3,
        hull: 3,
        shields: 1,
        actions: ["Focus", "Evade", "Lock", "Barrel Roll"],
        actionsred: [],
        maneuvers: [[0, 0, 0, 0, 0, 0], [1, 2, 0, 2, 1, 0], [1, 1, 2, 1, 1, 0], [0, 1, 2, 1, 0, 3], [0, 0, 1, 0, 0, 0], [0, 0, 1, 0, 0, 3]]
      },
      "Aggressor": {
        name: "Aggressor",
        xws: "Aggressor Assault Fighter".canonicalize(),
        factions: ["Scum and Villainy"],
        attack: 3,
        agility: 3,
        hull: 5,
        shields: 3,
        actions: ["Calculate", "Evade", "Lock", "Boost"],
        actionsred: [],
        medium: true,
        maneuvers: [[0, 0, 0, 0, 0, 0, 0, 0], [1, 2, 2, 2, 1, 0, 0, 0], [1, 2, 2, 2, 1, 0, 0, 0], [0, 2, 2, 2, 0, 0, 3, 3], [0, 0, 1, 0, 0, 3, 0, 0]]
      },
      "YV-666": {
        name: "YV-666",
        xws: "YV-666 Light Freighter".canonicalize(),
        factions: ["Scum and Villainy"],
        attackf: 3,
        agility: 1,
        hull: 9,
        shields: 3,
        large: true,
        actions: ["Focus", "Reinforce", "Lock"],
        actionsred: [],
        maneuvers: [[0, 0, 3, 0, 0, 0], [0, 2, 2, 2, 0, 0], [3, 1, 2, 1, 3, 0], [1, 1, 2, 1, 1, 0], [0, 0, 1, 0, 0, 0]]
      },
      "Kihraxz Fighter": {
        name: "Kihraxz Fighter",
        xws: "Kihraxz Fighter".canonicalize(),
        factions: ["Scum and Villainy"],
        attack: 3,
        agility: 2,
        hull: 5,
        shields: 1,
        actions: ["Focus", "Lock", "Barrel Roll"],
        actionsred: [],
        maneuvers: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [1, 2, 0, 2, 1, 0, 0, 0, 0, 0], [1, 2, 2, 2, 1, 0, 0, 0, 3, 3], [0, 1, 2, 1, 0, 0, 0, 0, 0, 0], [0, 0, 1, 0, 0, 3, 0, 0, 0, 0]]
      },
      "K-Wing": {
        name: "K-Wing",
        xws: "BTL-S8 K-Wing".canonicalize(),
        factions: ["Rebel Alliance"],
        attackdt: 2,
        agility: 1,
        hull: 6,
        shields: 3,
        medium: true,
        actions: ["Focus", "Lock", "Slam", "Rotate Arc", "Reload"],
        actionsred: [],
        maneuvers: [[0, 0, 0, 0, 0, 0], [0, 2, 2, 2, 0, 0], [1, 1, 2, 1, 1, 0], [0, 1, 1, 1, 0, 0]]
      },
      "TIE Punisher": {
        name: "TIE Punisher",
        xws: "TIE/CA Punisher".canonicalize(),
        factions: ["Galactic Empire"],
        attack: 2,
        agility: 1,
        hull: 6,
        shields: 3,
        medium: true,
        actions: ["Focus", "Lock", "Boost", "R> Lock", "Reload"],
        actionsred: ["Barrel Roll"],
        maneuvers: [[0, 0, 3, 0, 0, 0], [0, 2, 2, 2, 0, 0], [1, 1, 2, 1, 1, 0], [3, 1, 1, 1, 3, 0], [0, 0, 0, 0, 0, 3]]
      },
      "VCX-100": {
        name: "VCX-100",
        xws: "VCX-100 Light Freighter".canonicalize(),
        factions: ["Rebel Alliance"],
        attack: 4,
        agility: 0,
        hull: 10,
        shields: 4,
        large: true,
        actions: ["Focus", "Lock", "Reinforce"],
        actionsred: [],
        maneuvers: [[0, 0, 0, 0, 0, 0], [3, 1, 2, 1, 3, 0], [1, 2, 2, 2, 1, 0], [3, 1, 1, 1, 3, 0], [0, 0, 1, 0, 0, 3]]
      },
      "Attack Shuttle": {
        name: "Attack Shuttle",
        xws: "Attack Shuttle".canonicalize(),
        factions: ["Rebel Alliance"],
        attack: 3,
        agility: 2,
        hull: 3,
        shields: 1,
        actions: ["Focus", "Evade", "Barrel Roll", "R> Evade"],
        actionsred: [],
        maneuvers: [[0, 0, 0, 0, 0, 0], [3, 2, 2, 2, 3, 0], [1, 1, 2, 1, 1, 0], [3, 1, 1, 1, 3, 0], [0, 0, 1, 0, 0, 3]]
      },
      "TIE Advanced Prototype": {
        name: "TIE Advanced Prototype",
        xws: "TIE Advanced V1".canonicalize(),
        factions: ["Galactic Empire"],
        attack: 2,
        agility: 3,
        hull: 2,
        shields: 2,
        actions: ["Focus", "Evade", "Lock", "Barrel Roll", "R> Focus", "Boost", "R> Focus"],
        actionsred: [],
        maneuvers: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [2, 2, 0, 2, 2, 0, 0, 0, 0, 0], [1, 1, 2, 1, 1, 0, 0, 0, 3, 3], [1, 1, 2, 1, 1, 0, 0, 0, 0, 0], [0, 0, 1, 0, 0, 3, 0, 0, 0, 0], [0, 0, 1, 0, 0, 0, 0, 0, 0, 0]]
      },
      "G-1A Starfighter": {
        name: "G-1A Starfighter",
        xws: "G-1A Starfighter".canonicalize(),
        factions: ["Scum and Villainy"],
        attack: 3,
        agility: 1,
        hull: 5,
        shields: 4,
        medium: true,
        actions: ["Focus", "Lock", "Jam"],
        actionsred: [],
        maneuvers: [[0, 0, 3, 0, 0, 0], [3, 2, 2, 2, 3, 0], [1, 1, 2, 1, 1, 3], [0, 3, 1, 3, 0, 0], [0, 0, 3, 0, 0, 3]]
      },
      "JumpMaster 5000": {
        name: "JumpMaster 5000",
        xws: "JumpMaster 5000".canonicalize(),
        factions: ["Scum and Villainy"],
        large: true,
        attackt: 2,
        agility: 2,
        hull: 6,
        shields: 3,
        actions: ["Focus", "R> Rotate Arc", "Lock", "R> Rotate Arc"],
        actionsred: ["Barrel Roll"],
        maneuvers: [[0, 0, 0, 0, 0, 0, 0, 0], [1, 2, 2, 1, 3, 0, 0, 0], [1, 2, 2, 1, 3, 0, 0, 0], [0, 2, 2, 1, 0, 0, 3, 0], [0, 0, 1, 0, 0, 3, 0, 0]]
      },
      "ARC-170": {
        name: "ARC-170",
        xws: "Arc-170 Starfighter".canonicalize(),
        factions: ["Rebel Alliance"],
        attack: 3,
        attackb: 2,
        agility: 1,
        hull: 6,
        shields: 3,
        medium: true,
        actions: ["Focus", "Lock"],
        actionsred: ["Barrel Roll"],
        maneuvers: [[0, 0, 0, 0, 0, 0], [0, 2, 2, 2, 0, 0], [1, 2, 2, 2, 1, 0], [3, 1, 1, 1, 3, 0], [0, 0, 3, 0, 0, 3]]
      },
      "Fang Fighter": {
        name: "Fang Fighter",
        canonical_name: 'Protectorate Starfighter'.canonicalize(),
        xws: "Fang fighter".canonicalize(),
        factions: ["Scum and Villainy"],
        attack: 3,
        agility: 3,
        hull: 4,
        shields: 0,
        actions: ["Focus", "Lock", "Barrel Roll", "R> Focus", "Boost", "R> Focus"],
        actionsred: [],
        maneuvers: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [1, 0, 0, 0, 1, 0, 0, 0, 0, 0], [2, 2, 2, 2, 2, 0, 0, 0, 3, 3], [1, 1, 2, 1, 1, 0, 0, 0, 0, 0], [0, 0, 1, 0, 0, 3, 0, 0, 0, 0], [0, 0, 1, 0, 0, 0, 0, 0, 0, 0]]
      },
      "Lancer-Class Pursuit Craft": {
        name: "Lancer-Class Pursuit Craft",
        xws: "Lancer-Class Pursuit Craft".canonicalize(),
        factions: ["Scum and Villainy"],
        large: true,
        attack: 3,
        attackt: 2,
        agility: 2,
        hull: 8,
        shields: 2,
        actions: ["Focus", "Evade", "Lock", "Rotate Arc"],
        actionsred: [],
        maneuvers: [[0, 0, 0, 0, 0, 0], [0, 1, 1, 1, 0, 0], [1, 1, 2, 1, 1, 0], [2, 2, 2, 2, 2, 0], [0, 0, 2, 0, 0, 0], [0, 0, 1, 0, 0, 3]]
      },
      "Quadjumper": {
        name: "Quadjumper",
        xws: "Quadrijet Transfer Spacetug".canonicalize(),
        factions: ["Scum and Villainy"],
        attack: 2,
        agility: 2,
        hull: 5,
        shields: 0,
        actions: ["Barrel Roll", "Focus"],
        actionsred: ["Evade"],
        maneuvers: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 3, 0, 3], [1, 2, 2, 2, 1, 0, 3, 3, 0, 0, 0, 3, 0], [0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0]]
      },
      "U-Wing": {
        name: "U-Wing",
        xws: "UT-60D U-Wing".canonicalize(),
        factions: ["Rebel Alliance"],
        medium: true,
        attack: 3,
        agility: 2,
        hull: 5,
        shields: 3,
        actions: ["Focus", "Lock"],
        actionsred: ["Coordinate"],
        maneuvers: [[0, 0, 3, 0, 0], [0, 2, 2, 2, 0], [1, 2, 2, 2, 1], [0, 1, 1, 1, 0], [0, 0, 1, 0, 0]]
      },
      "TIE Striker": {
        name: "TIE Striker",
        xws: "TIE/SK Striker".canonicalize(),
        factions: ["Galactic Empire"],
        attack: 3,
        agility: 2,
        hull: 4,
        shields: 0,
        actions: ["Focus", "Evade", "Barrel Roll"],
        actionsred: [],
        maneuvers: [[0, 0, 0, 0, 0, 0, 0, 0], [1, 2, 2, 2, 1, 3, 0, 0], [1, 2, 2, 2, 1, 0, 3, 3], [0, 1, 2, 1, 0, 0, 0, 0]]
      },
      "Auzituck Gunship": {
        name: "Auzituck Gunship",
        xws: "Auzituck Gunship".canonicalize(),
        factions: ["Rebel Alliance"],
        attackf: 3,
        agility: 1,
        hull: 6,
        shields: 2,
        actions: ["Focus", "Reinforce"],
        actionsred: ["Barrel Roll"],
        maneuvers: [[0, 0, 3, 0, 0, 0, 0, 0], [0, 2, 2, 2, 0, 0, 0, 0], [1, 1, 2, 1, 1, 0, 0, 0], [1, 1, 2, 1, 1, 0, 0, 0], [0, 0, 1, 0, 0, 0, 0, 0]]
      },
      "Scurrg H-6 Bomber": {
        name: "Scurrg H-6 Bomber",
        xws: "Scurrg H-6 Bomber".canonicalize(),
        factions: ["Scum and Villainy"],
        attack: 3,
        agility: 1,
        hull: 6,
        shields: 4,
        medium: true,
        actions: ["Focus", "Lock"],
        actionsred: ["Barrel Roll"],
        maneuvers: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 2, 2, 2, 0, 0, 0, 0, 0, 0], [1, 1, 2, 1, 1, 0, 0, 0, 0, 0], [3, 1, 1, 1, 3, 0, 0, 0, 3, 3], [0, 0, 3, 0, 0, 0, 0, 0, 0, 0]]
      },
      "TIE Aggressor": {
        name: "TIE Aggressor",
        xws: "TIE/AG Aggressor".canonicalize(),
        factions: ["Galactic Empire"],
        attack: 2,
        agility: 2,
        hull: 4,
        shields: 1,
        actions: ["Focus", "Lock", "Barrel Roll", "R> Evade"],
        actionsred: [],
        maneuvers: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 1, 2, 1, 0, 0, 0, 0, 0, 0], [1, 2, 2, 2, 1, 0, 0, 0, 0, 0], [1, 1, 2, 1, 1, 0, 0, 0, 0, 0], [0, 0, 1, 0, 0, 3, 0, 0, 0, 0]]
      },
      "Alpha-Class Star Wing": {
        name: "Alpha-Class Star Wing",
        xws: "Alpha-Class Star Wing".canonicalize(),
        factions: ["Galactic Empire"],
        attack: 2,
        agility: 2,
        hull: 4,
        shields: 3,
        actions: ["Focus", "Lock", "Slam", "Reload"],
        actionsred: [],
        maneuvers: [[0, 0, 0, 0, 0, 0, 0, 0], [0, 1, 2, 1, 0, 0, 0, 0], [1, 2, 2, 2, 1, 0, 0, 0], [1, 1, 1, 1, 1, 0, 0, 0], [0, 0, 3, 0, 0, 0, 0, 0]]
      },
      "M12-L Kimogila Fighter": {
        name: "M12-L Kimogila Fighter",
        xws: "M12-L Kimogila Fighter".canonicalize(),
        factions: ["Scum and Villainy"],
        attack: 3,
        agility: 1,
        hull: 7,
        shields: 2,
        medium: true,
        actions: ["Focus", "Lock", "Reload"],
        actionsred: ["Barrel Roll"],
        maneuvers: [[0, 0, 0, 0, 0, 0], [3, 1, 2, 1, 3, 0], [1, 2, 2, 2, 1, 0], [1, 1, 2, 1, 1, 0], [0, 0, 0, 0, 0, 3]]
      },
      "Sheathipede-Class Shuttle": {
        name: "Sheathipede-Class Shuttle",
        xws: "Sheathipede-Class Shuttle".canonicalize(),
        factions: ["Rebel Alliance"],
        attack: 2,
        attackb: 2,
        agility: 2,
        hull: 4,
        shields: 1,
        actions: ["Focus", "Coordinate"],
        actionsred: [],
        maneuvers: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 3, 0], [1, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0], [3, 1, 2, 1, 3, 3, 0, 0, 0, 0, 0, 0, 0], [0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]
      },
      "TIE Reaper": {
        name: "TIE Reaper",
        xws: "TIE Reaper".canonicalize(),
        factions: ["Galactic Empire"],
        attack: 3,
        agility: 1,
        hull: 6,
        shields: 2,
        medium: true,
        actions: ["Focus", "Evade", "Jam"],
        actionsred: ["Coordinate"],
        maneuvers: [[0, 0, 3, 0, 0, 0, 0, 0], [3, 2, 2, 2, 3, 0, 3, 3], [3, 1, 2, 1, 3, 0, 0, 0], [0, 1, 2, 1, 0, 0, 0, 0]]
      },
      "Escape Craft": {
        name: "Escape Craft",
        xws: "Escape Craft".canonicalize(),
        factions: ["Scum and Villainy"],
        attack: 2,
        agility: 2,
        hull: 2,
        shields: 2,
        actions: ["Focus", "Barrel Roll"],
        actionsred: ["Coordinate"],
        maneuvers: [[0, 0, 3, 0, 0, 0, 0, 0], [0, 2, 2, 2, 0, 0, 0, 0], [3, 1, 2, 1, 3, 0, 0, 0], [0, 1, 1, 1, 0, 0, 0, 0]]
      },
      "T-70 X-Wing": {
        name: "T-70 X-Wing",
        xws: "T-70 X-Wing".canonicalize(),
        factions: ["Resistance"],
        attack: 3,
        agility: 2,
        hull: 4,
        shields: 3,
        actions: ["Focus", "Lock", "Boost"],
        actionsred: [],
        maneuvers: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 2, 2, 2, 0, 0, 0, 0, 0, 0], [1, 2, 2, 2, 1, 0, 0, 0, 0, 0], [1, 1, 2, 1, 1, 0, 0, 0, 3, 3], [0, 0, 1, 0, 0, 3, 0, 0, 0, 0]]
      },
      "RZ-2 A-Wing": {
        name: "RZ-2 A-Wing",
        xws: "RZ-2 A-Wing".canonicalize(),
        factions: ["Resistance"],
        attack: 2,
        attackt: 2,
        agility: 3,
        hull: 3,
        shields: 2,
        actions: ["Focus", "Evade", "Lock", "Barrel Roll"],
        actionsred: [],
        maneuvers: [[0, 0, 0, 0, 0, 0, 0, 0], [1, 0, 0, 0, 1, 0, 0, 0], [2, 2, 2, 2, 2, 0, 0, 0], [1, 2, 2, 2, 1, 0, 3, 3], [0, 0, 1, 0, 0, 0, 0, 0], [0, 0, 1, 0, 0, 3, 0, 0]]
      },
      "TIE/FO Fighter": {
        name: "TIE/FO Fighter",
        xws: "TIE/FO Fighter".canonicalize(),
        factions: ["First Order"],
        attack: 2,
        agility: 3,
        hull: 3,
        shields: 1,
        actions: ["Focus", "Evade", "Lock", "Barrel Roll"],
        actionsred: [],
        maneuvers: [[0, 0, 0, 0, 0, 0, 0, 0], [1, 0, 0, 0, 1, 0, 0, 0], [2, 2, 2, 2, 2, 0, 3, 3], [1, 1, 2, 1, 1, 0, 0, 0], [0, 0, 1, 0, 0, 3, 0, 0], [0, 0, 1, 0, 0, 0, 0, 0]]
      },
      "TIE Silencer": {
        name: "TIE Silencer",
        xws: "TIE Silencer".canonicalize(),
        factions: ["First Order"],
        attack: 3,
        agility: 3,
        hull: 4,
        shields: 2,
        actions: ["Focus", "Boost", "Lock", "Barrel Roll"],
        actionsred: [],
        maneuvers: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [1, 0, 0, 0, 1, 0, 0, 0, 0, 0], [2, 2, 2, 2, 2, 0, 0, 0, 0, 0], [1, 1, 2, 1, 1, 0, 0, 0, 3, 3], [0, 0, 2, 0, 0, 3, 0, 0, 0, 0], [0, 0, 2, 0, 0, 0, 0, 0, 0, 0]]
      },
      "TIE/SF Fighter": {
        name: "TIE/SF Fighter",
        xws: "TIE/SF Fighter".canonicalize(),
        factions: ["First Order"],
        attack: 0,
        attackt: 0,
        agility: 2,
        hull: 3,
        shields: 3,
        actions: ["Focus", "> Rotate Arc", "Evade", "> Rotate Arc", "Lock", "> Rotate Arc", "Barrel Roll", "> Rotate Arc"],
        actionsred: [],
        maneuvers: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 2, 2, 2, 0, 0, 0, 0, 0, 0], [1, 1, 2, 1, 1, 0, 0, 0, 0, 0], [3, 1, 2, 1, 3, 0, 3, 3, 0, 0], [0, 0, 1, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]
      },
      "Upsilon-Class Shuttle": {
        name: "Upsilon-Class Shuttle",
        xws: "Upsilon-Class Shuttle".canonicalize(),
        factions: ["First Order"],
        attack: 0,
        agility: 0,
        hull: 0,
        shields: 6,
        actions: ["Focus", "Reinforce", "Lock", "Coordinate", "Jam"],
        actionsred: [],
        maneuvers: [[0, 0, 3, 0, 0, 0, 0, 0, 0, 0], [3, 1, 2, 1, 3, 0, 0, 0, 0, 0], [1, 2, 2, 2, 1, 0, 0, 0, 0, 0], [3, 1, 1, 1, 3, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
        large: true
      },
      "B/SF-17 Bomber": {
        name: "B/SF-17 Bomber",
        xws: "B/SF-17 Bomber".canonicalize(),
        factions: ["Resistance"],
        attack: 0,
        agility: 0,
        hull: 9,
        shields: 3,
        actions: ["Focus", "Lock", "Rotate Arc", "Reload"],
        actionsred: [],
        maneuvers: [[0, 0, 3, 0, 0, 0, 0, 0, 0, 0], [3, 2, 2, 2, 3, 0, 0, 0, 0, 0], [1, 1, 2, 1, 1, 0, 0, 0, 0, 0], [0, 1, 1, 1, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
        large: true
      },
      "YT-1300 (Resistance)": {
        name: "YT-1300 (Resistance)",
        canonical_name: 'YT-1300'.canonicalize(),
        xws: "??? YT-1300 Light Freighter".canonicalize(),
        factions: ["Resistance"],
        attackdt: 0,
        agility: 0,
        hull: 0,
        shields: 3,
        actions: ["Focus", "Lock"],
        actionsred: ["Boost", "Rotate Arc"],
        maneuvers: [[0, 0, 0, 0, 0, 0, 0, 0], [0, 1, 2, 1, 0, 0, 0, 0], [1, 2, 2, 2, 1, 0, 0, 0], [1, 1, 2, 1, 1, 0, 3, 3], [0, 0, 1, 0, 0, 3, 0, 0]],
        large: true
      },
      "Mining Guild TIE Fighter": {
        name: "Mining Guild TIE Fighter",
        xws: "Modified TIE/LN Fighter".canonicalize(),
        factions: ["Scum and Villainy"],
        attack: 2,
        agility: 3,
        hull: 3,
        shields: 0,
        actions: ["Focus", "Barrel Roll", "Evade"],
        actionsred: [],
        maneuvers: [[0, 0, 0, 0, 0, 0], [1, 0, 0, 0, 1, 0], [1, 2, 2, 2, 1, 0], [1, 1, 2, 1, 1, 3], [0, 0, 1, 0, 0, 0], [0, 0, 3, 0, 0, 0]]
      }
    },
    pilotsById: [
      {
        name: "Cavern Angels Zealot",
        id: 0,
        faction: "Rebel Alliance",
        ship: "X-Wing",
        skill: 1,
        points: 41,
        slots: ["Illicit", "Torpedo", "Astromech", "Modification", "Configuration"]
      }, {
        name: "Blue Squadron Escort",
        id: 1,
        faction: "Rebel Alliance",
        ship: "X-Wing",
        skill: 2,
        points: 41,
        slots: ["Torpedo", "Astromech", "Modification", "Configuration"]
      }, {
        name: "Red Squadron Veteran",
        id: 2,
        faction: "Rebel Alliance",
        ship: "X-Wing",
        skill: 3,
        points: 43,
        slots: ["Talent", "Torpedo", "Astromech", "Modification", "Configuration"]
      }, {
        name: "Jek Porkins",
        id: 3,
        unique: true,
        faction: "Rebel Alliance",
        ship: "X-Wing",
        skill: 4,
        points: 46,
        slots: ["Talent", "Torpedo", "Astromech", "Modification", "Configuration"]
      }, {
        name: "Luke Skywalker",
        id: 4,
        unique: true,
        faction: "Rebel Alliance",
        ship: "X-Wing",
        skill: 5,
        force: 2,
        points: 62,
        slots: ["Force", "Torpedo", "Astromech", "Modification", "Configuration"]
      }, {
        name: "Wedge Antilles",
        id: 5,
        unique: true,
        faction: "Rebel Alliance",
        ship: "X-Wing",
        skill: 6,
        points: 52,
        slots: ["Talent", "Torpedo", "Astromech", "Modification", "Configuration"]
      }, {
        name: "Garven Dreis (X-Wing)",
        canonical_name: 'Garven Dreis'.canonicalize(),
        id: 6,
        unique: true,
        xws: "garvendreis-t65xwing",
        faction: "Rebel Alliance",
        ship: "X-Wing",
        skill: 4,
        points: 47,
        slots: ["Talent", "Torpedo", "Astromech", "Modification", "Configuration"]
      }, {
        name: "Biggs Darklighter",
        id: 7,
        unique: true,
        faction: "Rebel Alliance",
        ship: "X-Wing",
        skill: 3,
        points: 48,
        slots: ["Torpedo", "Astromech", "Modification", "Configuration"]
      }, {
        name: "Edrio Two-Tubes",
        id: 8,
        unique: true,
        faction: "Rebel Alliance",
        ship: "X-Wing",
        skill: 2,
        points: 45,
        slots: ["Illicit", "Torpedo", "Astromech", "Modification", "Configuration"]
      }, {
        name: "Thane Kyrell",
        id: 9,
        unique: true,
        faction: "Rebel Alliance",
        ship: "X-Wing",
        skill: 5,
        points: 48,
        slots: ["Talent", "Torpedo", "Astromech", "Modification", "Configuration"]
      }, {
        name: "Leevan Tenza",
        id: 10,
        unique: true,
        faction: "Rebel Alliance",
        ship: "X-Wing",
        skill: 3,
        points: 46,
        slots: ["Illicit", "Talent", "Torpedo", "Astromech", "Modification", "Configuration"]
      }, {
        name: "whoops",
        id: 11,
        skip: true
      }, {
        name: "Kullbee Sperado",
        id: 12,
        unique: true,
        faction: "Rebel Alliance",
        ship: "X-Wing",
        skill: 3,
        points: 48,
        slots: ["Illicit", "Talent", "Torpedo", "Astromech", "Modification", "Configuration"]
      }, {
        name: "Sabine Wren (TIE Fighter)",
        canonical_name: 'Sabine Wren'.canonicalize(),
        id: 13,
        unique: true,
        xws: "sabinewren-tielnfighter",
        faction: "Rebel Alliance",
        ship: "TIE Fighter",
        skill: 3,
        points: 28,
        slots: ["Talent", "Modification"]
      }, {
        name: "Ezra Bridger (TIE Fighter)",
        canonical_name: 'Ezra Bridger'.canonicalize(),
        id: 14,
        unique: true,
        xws: "ezrabridger-tielnfighter",
        faction: "Rebel Alliance",
        ship: "TIE Fighter",
        skill: 3,
        force: 1,
        points: 32,
        slots: ["Force", "Modification"]
      }, {
        name: '"Zeb" Orrelios (TIE Fighter)',
        canonical_name: '"Zeb" Orrelios'.canonicalize(),
        id: 15,
        unique: true,
        xws: "zeborrelios-tielnfighter",
        faction: "Rebel Alliance",
        ship: "TIE Fighter",
        skill: 2,
        points: 26,
        slots: ["Modification"]
      }, {
        name: "Captain Rex",
        id: 16,
        unique: true,
        faction: "Rebel Alliance",
        ship: "TIE Fighter",
        skill: 2,
        points: 32,
        slots: ["Modification"],
        applies_condition: 'Suppressive Fire'.canonicalize()
      }, {
        name: "Miranda Doni",
        id: 17,
        unique: true,
        faction: "Rebel Alliance",
        ship: "K-Wing",
        skill: 4,
        points: 48,
        slots: ["Torpedo", "Missile", "Missile", "Gunner", "Crew", "Device", "Device", "Modification"]
      }, {
        name: "Esege Tuketu",
        id: 18,
        unique: true,
        faction: "Rebel Alliance",
        ship: "K-Wing",
        skill: 3,
        points: 50,
        slots: ["Torpedo", "Missile", "Missile", "Gunner", "Crew", "Device", "Device", "Modification"]
      }, {
        name: "empty",
        id: 19,
        skip: true
      }, {
        name: "Warden Squadron Pilot",
        id: 20,
        faction: "Rebel Alliance",
        ship: "K-Wing",
        skill: 2,
        points: 40,
        slots: ["Torpedo", "Missile", "Missile", "Gunner", "Crew", "Device", "Device", "Modification"]
      }, {
        name: "Corran Horn",
        id: 21,
        unique: true,
        faction: "Rebel Alliance",
        ship: "E-Wing",
        skill: 5,
        points: 74,
        slots: ["Talent", "Sensor", "Torpedo", "Astromech", "Modification"]
      }, {
        name: "Gavin Darklighter",
        id: 22,
        unique: true,
        faction: "Rebel Alliance",
        ship: "E-Wing",
        skill: 4,
        points: 68,
        slots: ["Talent", "Sensor", "Torpedo", "Astromech", "Modification"]
      }, {
        name: "Rogue Squadron Escort",
        id: 23,
        faction: "Rebel Alliance",
        ship: "E-Wing",
        skill: 4,
        points: 63,
        slots: ["Talent", "Sensor", "Torpedo", "Astromech", "Modification"]
      }, {
        name: "Knave Squadron Escort",
        id: 24,
        faction: "Rebel Alliance",
        ship: "E-Wing",
        skill: 2,
        points: 61,
        slots: ["Sensor", "Torpedo", "Astromech", "Modification"]
      }, {
        name: "Norra Wexley (Y-Wing)",
        id: 25,
        unique: true,
        canonical_name: 'Norra Wexley'.canonicalize(),
        xws: "norrawexley-btla4ywing",
        faction: "Rebel Alliance",
        ship: "Y-Wing",
        skill: 5,
        points: 43,
        slots: ["Talent", "Turret", "Torpedo", "Astromech", "Modification", "Device", "Gunner"]
      }, {
        name: "Horton Salm",
        id: 26,
        unique: true,
        faction: "Rebel Alliance",
        ship: "Y-Wing",
        skill: 4,
        points: 38,
        slots: ["Talent", "Turret", "Torpedo", "Astromech", "Modification", "Device", "Gunner"]
      }, {
        name: '"Dutch" Vander',
        id: 27,
        unique: true,
        faction: "Rebel Alliance",
        ship: "Y-Wing",
        skill: 4,
        points: 42,
        slots: ["Talent", "Turret", "Torpedo", "Astromech", "Modification", "Device", "Gunner"]
      }, {
        name: "Evaan Verlaine",
        id: 28,
        unique: true,
        faction: "Rebel Alliance",
        ship: "Y-Wing",
        skill: 3,
        points: 36,
        slots: ["Talent", "Turret", "Torpedo", "Astromech", "Modification", "Device", "Gunner"]
      }, {
        name: "Gold Squadron Veteran",
        id: 29,
        faction: "Rebel Alliance",
        ship: "Y-Wing",
        skill: 3,
        points: 34,
        slots: ["Talent", "Turret", "Torpedo", "Astromech", "Modification", "Device", "Gunner"]
      }, {
        name: "Gray Squadron Bomber",
        id: 30,
        faction: "Rebel Alliance",
        ship: "Y-Wing",
        skill: 2,
        points: 32,
        slots: ["Turret", "Torpedo", "Astromech", "Modification", "Device", "Gunner"]
      }, {
        name: "Bodhi Rook",
        id: 31,
        unique: true,
        faction: "Rebel Alliance",
        ship: "U-Wing",
        skill: 4,
        points: 49,
        slots: ["Talent", "Sensor", "Crew", "Crew", "Modification", "Configuration"]
      }, {
        name: "Cassian Andor",
        id: 32,
        unique: true,
        faction: "Rebel Alliance",
        ship: "U-Wing",
        skill: 3,
        points: 47,
        slots: ["Talent", "Sensor", "Crew", "Crew", "Modification", "Configuration"]
      }, {
        name: "Heff Tobber",
        id: 33,
        unique: true,
        faction: "Rebel Alliance",
        ship: "U-Wing",
        skill: 2,
        points: 45,
        slots: ["Talent", "Sensor", "Crew", "Crew", "Modification", "Configuration"]
      }, {
        name: "Magva Yarro",
        id: 34,
        unique: true,
        faction: "Rebel Alliance",
        ship: "U-Wing",
        skill: 3,
        points: 50,
        slots: ["Talent", "Sensor", "Crew", "Crew", "Modification", "Configuration", "Illicit"]
      }, {
        name: "Saw Gerrera",
        id: 35,
        unique: true,
        faction: "Rebel Alliance",
        ship: "U-Wing",
        skill: 4,
        points: 52,
        slots: ["Talent", "Sensor", "Crew", "Crew", "Modification", "Configuration", "Illicit"]
      }, {
        name: "Benthic Two-Tubes",
        id: 36,
        unique: true,
        faction: "Rebel Alliance",
        ship: "U-Wing",
        skill: 2,
        points: 47,
        slots: ["Illicit", "Sensor", "Crew", "Crew", "Modification", "Configuration"]
      }, {
        name: "Blue Squadron Scout",
        id: 37,
        faction: "Rebel Alliance",
        ship: "U-Wing",
        skill: 2,
        points: 43,
        slots: ["Sensor", "Crew", "Crew", "Modification", "Configuration"]
      }, {
        name: "Partisan Renegade",
        id: 38,
        faction: "Rebel Alliance",
        ship: "U-Wing",
        skill: 1,
        points: 43,
        slots: ["Illicit", "Sensor", "Crew", "Crew", "Modification", "Configuration"]
      }, {
        name: "Dash Rendar",
        id: 39,
        unique: true,
        faction: "Rebel Alliance",
        ship: "YT-2400",
        skill: 5,
        points: 100,
        slots: ["Talent", "Missile", "Gunner", "Crew", "Modification", "Title", "Illicit"]
      }, {
        name: '"Leebo"',
        id: 40,
        unique: true,
        faction: "Rebel Alliance",
        ship: "YT-2400",
        skill: 3,
        points: 98,
        slots: ["Missile", "Gunner", "Crew", "Modification", "Title", "Illicit"],
        ship_override: {
          actions: ["Calculate", "Lock", "Rotate Arc"]
        }
      }, {
        name: "Wild Space Fringer",
        id: 41,
        faction: "Rebel Alliance",
        ship: "YT-2400",
        skill: 1,
        points: 88,
        slots: ["Missile", "Gunner", "Crew", "Modification", "Title", "Illicit"]
      }, {
        name: "Han Solo",
        id: 42,
        unique: true,
        xws: "hansolo-modifiedyt1300lightfreighter",
        faction: "Rebel Alliance",
        ship: "YT-1300",
        skill: 6,
        points: 92,
        slots: ["Talent", "Missile", "Gunner", "Crew", "Crew", "Modification", "Title", "Illicit"]
      }, {
        name: "Lando Calrissian",
        id: 43,
        unique: true,
        xws: "landocalrissian-modifiedyt1300lightfreighter",
        faction: "Rebel Alliance",
        ship: "YT-1300",
        skill: 5,
        points: 92,
        slots: ["Talent", "Missile", "Gunner", "Crew", "Crew", "Modification", "Title", "Illicit"]
      }, {
        name: "Chewbacca",
        id: 44,
        unique: true,
        faction: "Rebel Alliance",
        ship: "YT-1300",
        skill: 4,
        charge: 1,
        recurring: true,
        points: 84,
        slots: ["Talent", "Missile", "Gunner", "Crew", "Crew", "Modification", "Title", "Illicit"]
      }, {
        name: "Outer Rim Smuggler",
        id: 45,
        faction: "Rebel Alliance",
        ship: "YT-1300",
        skill: 1,
        points: 78,
        slots: ["Missile", "Gunner", "Crew", "Crew", "Modification", "Title", "Illicit"]
      }, {
        name: "Jan Ors",
        id: 46,
        unique: true,
        faction: "Rebel Alliance",
        ship: "HWK-290",
        skill: 5,
        points: 42,
        slots: ["Talent", "Device", "Crew", "Modification", "Modification", "Title"]
      }, {
        name: "Roark Garnet",
        id: 47,
        unique: true,
        faction: "Rebel Alliance",
        ship: "HWK-290",
        skill: 4,
        points: 38,
        slots: ["Talent", "Device", "Crew", "Modification", "Modification", "Title"]
      }, {
        name: "Kyle Katarn",
        id: 48,
        unique: true,
        faction: "Rebel Alliance",
        ship: "HWK-290",
        skill: 3,
        points: 38,
        slots: ["Talent", "Device", "Crew", "Modification", "Modification", "Title"]
      }, {
        name: "Rebel Scout",
        id: 49,
        faction: "Rebel Alliance",
        ship: "HWK-290",
        skill: 2,
        points: 32,
        slots: ["Device", "Crew", "Modification", "Modification", "Title"]
      }, {
        name: "Jake Farrell",
        id: 50,
        unique: true,
        faction: "Rebel Alliance",
        ship: "A-Wing",
        skill: 4,
        points: 40,
        slots: ["Talent", "Missile"]
      }, {
        name: "Arvel Crynyd",
        id: 51,
        unique: true,
        faction: "Rebel Alliance",
        ship: "A-Wing",
        skill: 3,
        points: 36,
        slots: ["Talent", "Missile"]
      }, {
        name: "Green Squadron Pilot",
        id: 52,
        faction: "Rebel Alliance",
        ship: "A-Wing",
        skill: 3,
        points: 34,
        slots: ["Talent", "Missile"]
      }, {
        name: "Phoenix Squadron Pilot",
        id: 53,
        faction: "Rebel Alliance",
        ship: "A-Wing",
        skill: 1,
        points: 30,
        slots: ["Missile"]
      }, {
        name: "Airen Cracken",
        id: 54,
        unique: true,
        faction: "Rebel Alliance",
        ship: "Z-95 Headhunter",
        skill: 5,
        points: 36,
        slots: ["Talent", "Missile", "Modification"]
      }, {
        name: "Lieutenant Blount",
        id: 55,
        unique: true,
        faction: "Rebel Alliance",
        ship: "Z-95 Headhunter",
        skill: 4,
        points: 30,
        slots: ["Talent", "Missile", "Modification"]
      }, {
        name: "Tala Squadron Pilot",
        id: 56,
        faction: "Rebel Alliance",
        ship: "Z-95 Headhunter",
        skill: 2,
        points: 25,
        slots: ["Talent", "Missile", "Modification"]
      }, {
        name: "Bandit Squadron Pilot",
        id: 57,
        faction: "Rebel Alliance",
        ship: "Z-95 Headhunter",
        skill: 1,
        points: 23,
        slots: ["Missile", "Modification"]
      }, {
        name: "Wullffwarro",
        id: 58,
        unique: true,
        faction: "Rebel Alliance",
        ship: "Auzituck Gunship",
        skill: 4,
        points: 56,
        slots: ["Talent", "Crew", "Crew", "Modification"]
      }, {
        name: "Lowhhrick",
        id: 59,
        unique: true,
        faction: "Rebel Alliance",
        ship: "Auzituck Gunship",
        skill: 3,
        points: 52,
        slots: ["Talent", "Crew", "Crew", "Modification"]
      }, {
        name: "Kashyyyk Defender",
        id: 60,
        faction: "Rebel Alliance",
        ship: "Auzituck Gunship",
        skill: 1,
        points: 46,
        slots: ["Crew", "Crew", "Modification"]
      }, {
        name: "Hera Syndulla (VCX-100)",
        id: 61,
        unique: true,
        canonical_name: 'Hera Syndulla'.canonicalize(),
        xws: "herasyndulla-vcx100lightfreighter",
        faction: "Rebel Alliance",
        ship: "VCX-100",
        skill: 5,
        points: 76,
        slots: ["Talent", "Torpedo", "Turret", "Crew", "Crew", "Modification", "Gunner", "Title"]
      }, {
        name: "Kanan Jarrus",
        id: 62,
        unique: true,
        faction: "Rebel Alliance",
        ship: "VCX-100",
        skill: 3,
        force: 2,
        points: 90,
        slots: ["Force", "Torpedo", "Turret", "Crew", "Crew", "Modification", "Gunner", "Title"]
      }, {
        name: '"Chopper"',
        id: 63,
        unique: true,
        faction: "Rebel Alliance",
        ship: "VCX-100",
        skill: 2,
        points: 72,
        slots: ["Torpedo", "Turret", "Crew", "Crew", "Modification", "Gunner", "Title"],
        ship_override: {
          actions: ["Calculate", "Lock", "Reinforce"]
        }
      }, {
        name: "Lothal Rebel",
        id: 64,
        faction: "Rebel Alliance",
        ship: "VCX-100",
        skill: 2,
        points: 70,
        slots: ["Torpedo", "Turret", "Crew", "Crew", "Modification", "Gunner", "Title"]
      }, {
        name: "Hera Syndulla",
        id: 65,
        unique: true,
        faction: "Rebel Alliance",
        ship: "Attack Shuttle",
        skill: 5,
        points: 39,
        slots: ["Talent", "Crew", "Modification", "Turret", "Title"]
      }, {
        name: "Sabine Wren",
        canonical_name: 'Sabine Wren'.canonicalize(),
        id: 66,
        unique: true,
        faction: "Rebel Alliance",
        ship: "Attack Shuttle",
        skill: 3,
        points: 38,
        slots: ["Talent", "Crew", "Modification", "Turret", "Title"]
      }, {
        name: "Ezra Bridger",
        id: 67,
        unique: true,
        faction: "Rebel Alliance",
        ship: "Attack Shuttle",
        skill: 3,
        force: 1,
        points: 41,
        slots: ["Force", "Crew", "Modification", "Turret", "Title"]
      }, {
        name: '"Zeb" Orrelios',
        id: 68,
        unique: true,
        faction: "Rebel Alliance",
        ship: "Attack Shuttle",
        skill: 2,
        points: 34,
        slots: ["Crew", "Modification", "Turret", "Title"]
      }, {
        name: "Fenn Rau (Sheathipede)",
        id: 69,
        unique: true,
        xws: "fennrau-sheathipedeclassshuttle",
        faction: "Rebel Alliance",
        ship: "Sheathipede-Class Shuttle",
        skill: 6,
        points: 52,
        slots: ["Talent", "Crew", "Modification", "Astromech", "Title"]
      }, {
        name: "Ezra Bridger (Sheathipede)",
        canonical_name: 'Ezra Bridger'.canonicalize(),
        id: 70,
        unique: true,
        xws: "ezrabridger-sheathipedeclassshuttle",
        faction: "Rebel Alliance",
        ship: "Sheathipede-Class Shuttle",
        skill: 3,
        force: 1,
        points: 42,
        slots: ["Force", "Crew", "Modification", "Astromech", "Title"]
      }, {
        name: '"Zeb" Orrelios (Sheathipede)',
        canonical_name: '"Zeb" Orrelios'.canonicalize(),
        id: 71,
        unique: true,
        xws: "zeborrelios-sheathipedeclassshuttle",
        faction: "Rebel Alliance",
        ship: "Sheathipede-Class Shuttle",
        skill: 2,
        points: 32,
        slots: ["Talent", "Crew", "Modification", "Astromech", "Title"]
      }, {
        name: "AP-5",
        id: 72,
        unique: true,
        faction: "Rebel Alliance",
        ship: "Sheathipede-Class Shuttle",
        skill: 1,
        points: 30,
        slots: ["Talent", "Crew", "Modification", "Astromech", "Title"],
        ship_override: {
          actions: ["Calculate", "Coordinate"]
        }
      }, {
        name: "Braylen Stramm",
        id: 73,
        unique: true,
        faction: "Rebel Alliance",
        ship: "B-Wing",
        skill: 4,
        points: 50,
        slots: ["Talent", "Sensor", "Cannon", "Cannon", "Torpedo", "Modification"]
      }, {
        name: "Ten Numb",
        id: 74,
        unique: true,
        faction: "Rebel Alliance",
        ship: "B-Wing",
        skill: 4,
        points: 50,
        slots: ["Talent", "Sensor", "Cannon", "Cannon", "Torpedo", "Modification"]
      }, {
        name: "Blade Squadron Veteran",
        id: 75,
        faction: "Rebel Alliance",
        ship: "B-Wing",
        skill: 3,
        points: 44,
        slots: ["Talent", "Sensor", "Cannon", "Cannon", "Torpedo", "Modification"]
      }, {
        name: "Blue Squadron Pilot",
        id: 76,
        faction: "Rebel Alliance",
        ship: "B-Wing",
        skill: 2,
        points: 42,
        slots: ["Sensor", "Cannon", "Cannon", "Torpedo", "Modification"]
      }, {
        name: "Norra Wexley",
        id: 77,
        unique: true,
        faction: "Rebel Alliance",
        ship: "ARC-170",
        skill: 5,
        points: 55,
        slots: ["Talent", "Torpedo", "Crew", "Gunner", "Astromech", "Modification"]
      }, {
        name: "Shara Bey",
        id: 78,
        unique: true,
        faction: "Rebel Alliance",
        ship: "ARC-170",
        skill: 4,
        points: 53,
        slots: ["Talent", "Torpedo", "Crew", "Gunner", "Astromech", "Modification"]
      }, {
        name: "Garven Dreis",
        id: 79,
        unique: true,
        faction: "Rebel Alliance",
        ship: "ARC-170",
        skill: 4,
        points: 51,
        slots: ["Talent", "Torpedo", "Crew", "Gunner", "Astromech", "Modification"]
      }, {
        name: "Ibtisam",
        id: 80,
        unique: true,
        faction: "Rebel Alliance",
        ship: "ARC-170",
        skill: 3,
        points: 50,
        slots: ["Talent", "Torpedo", "Crew", "Gunner", "Astromech", "Modification"]
      }, {
        name: "IG-88A",
        id: 81,
        unique: true,
        faction: "Scum and Villainy",
        ship: "Aggressor",
        skill: 4,
        points: 70,
        slots: ["Talent", "Sensor", "Cannon", "Cannon", "Device", "Illicit", "Modification", "Title"]
      }, {
        name: "IG-88B",
        id: 82,
        unique: true,
        faction: "Scum and Villainy",
        ship: "Aggressor",
        skill: 4,
        points: 70,
        slots: ["Talent", "Sensor", "Cannon", "Cannon", "Device", "Illicit", "Modification", "Title"]
      }, {
        name: "IG-88C",
        id: 83,
        unique: true,
        faction: "Scum and Villainy",
        ship: "Aggressor",
        skill: 4,
        points: 70,
        slots: ["Talent", "Sensor", "Cannon", "Cannon", "Device", "Illicit", "Modification", "Title"]
      }, {
        name: "IG-88D",
        id: 84,
        unique: true,
        faction: "Scum and Villainy",
        ship: "Aggressor",
        skill: 4,
        points: 70,
        slots: ["Talent", "Sensor", "Cannon", "Cannon", "Device", "Illicit", "Modification", "Title"]
      }, {
        name: "Kavil",
        id: 85,
        unique: true,
        faction: "Scum and Villainy",
        ship: "Y-Wing",
        skill: 5,
        points: 42,
        slots: ["Talent", "Turret", "Torpedo", "Gunner", "Astromech", "Device", "Illicit", "Modification"]
      }, {
        name: "Drea Renthal",
        id: 86,
        unique: true,
        faction: "Scum and Villainy",
        ship: "Y-Wing",
        skill: 4,
        points: 40,
        slots: ["Talent", "Turret", "Torpedo", "Gunner", "Astromech", "Device", "Illicit", "Modification"]
      }, {
        name: "Hired Gun",
        id: 87,
        faction: "Scum and Villainy",
        ship: "Y-Wing",
        skill: 2,
        points: 34,
        slots: ["Talent", "Turret", "Torpedo", "Gunner", "Astromech", "Device", "Illicit", "Modification"]
      }, {
        name: "Crymorah Goon",
        id: 88,
        faction: "Scum and Villainy",
        ship: "Y-Wing",
        skill: 1,
        points: 32,
        slots: ["Turret", "Torpedo", "Gunner", "Astromech", "Device", "Illicit", "Modification"]
      }, {
        name: "Han Solo (Scum)",
        id: 89,
        unique: true,
        xws: "hansolo",
        faction: "Scum and Villainy",
        ship: "YT-1300 (Scum)",
        skill: 6,
        points: 54,
        slots: ["Talent", "Missile", "Crew", "Crew", "Gunner", "Illicit", "Modification", "Title"]
      }, {
        name: "Lando Calrissian (Scum)",
        id: 90,
        unique: true,
        xws: "landocalrissian",
        faction: "Scum and Villainy",
        ship: "YT-1300 (Scum)",
        skill: 4,
        points: 49,
        slots: ["Talent", "Missile", "Crew", "Crew", "Gunner", "Illicit", "Modification", "Title"]
      }, {
        name: "L3-37",
        id: 91,
        unique: true,
        faction: "Scum and Villainy",
        ship: "YT-1300 (Scum)",
        skill: 2,
        points: 47,
        slots: ["Missile", "Crew", "Crew", "Gunner", "Illicit", "Modification", "Title"],
        ship_override: {
          actions: ["Calculate", "Lock", "Rotate Arc"]
        }
      }, {
        name: "Freighter Captain",
        id: 92,
        faction: "Scum and Villainy",
        ship: "YT-1300 (Scum)",
        skill: 1,
        points: 46,
        slots: ["Missile", "Crew", "Crew", "Gunner", "Illicit", "Modification", "Title"]
      }, {
        name: "Lando Calrissian (Scum) (Escape Craft)",
        canonical_name: 'Lando Calrissian (Scum)'.canonicalize(),
        id: 93,
        unique: true,
        xws: "landocalrissian-escapecraft",
        faction: "Scum and Villainy",
        ship: "Escape Craft",
        skill: 4,
        points: 26,
        slots: ["Talent", "Crew", "Modification"]
      }, {
        name: "Outer Rim Pioneer",
        id: 94,
        unique: true,
        faction: "Scum and Villainy",
        ship: "Escape Craft",
        skill: 3,
        points: 24,
        slots: ["Talent", "Crew", "Modification"]
      }, {
        name: "L3-37 (Escape Craft)",
        canonical_name: 'L3-37'.canonicalize(),
        id: 95,
        unique: true,
        xws: "l337-escapecraft",
        faction: "Scum and Villainy",
        ship: "Escape Craft",
        skill: 2,
        points: 22,
        slots: ["Talent", "Crew", "Modification"],
        ship_override: {
          actions: ["Calculate", "Barrel Roll"]
        }
      }, {
        name: "Autopilot Drone",
        id: 96,
        unique: true,
        faction: "Scum and Villainy",
        ship: "Escape Craft",
        skill: 1,
        charge: 3,
        points: 12,
        slots: [],
        ship_override: {
          actions: ["Calculate", "Barrel Roll"]
        }
      }, {
        name: "Fenn Rau",
        id: 97,
        unique: true,
        faction: "Scum and Villainy",
        ship: "Fang Fighter",
        skill: 6,
        points: 68,
        slots: ["Talent", "Torpedo"]
      }, {
        name: "Old Teroch",
        id: 98,
        unique: true,
        faction: "Scum and Villainy",
        ship: "Fang Fighter",
        skill: 5,
        points: 56,
        slots: ["Talent", "Torpedo"]
      }, {
        name: "Kad Solus",
        id: 99,
        unique: true,
        faction: "Scum and Villainy",
        ship: "Fang Fighter",
        skill: 4,
        points: 54,
        slots: ["Talent", "Torpedo"]
      }, {
        name: "Joy Rekkoff",
        id: 100,
        unique: true,
        faction: "Scum and Villainy",
        ship: "Fang Fighter",
        skill: 4,
        points: 52,
        slots: ["Talent", "Torpedo"]
      }, {
        name: "Skull Squadron Pilot",
        id: 101,
        faction: "Scum and Villainy",
        ship: "Fang Fighter",
        skill: 4,
        points: 50,
        slots: ["Talent", "Torpedo"]
      }, {
        name: "Zealous Recruit",
        id: 102,
        faction: "Scum and Villainy",
        ship: "Fang Fighter",
        skill: 1,
        points: 44,
        slots: ["Torpedo"]
      }, {
        name: "Boba Fett",
        id: 103,
        unique: true,
        faction: "Scum and Villainy",
        ship: "Firespray-31",
        skill: 5,
        points: 80,
        slots: ["Talent", "Cannon", "Missile", "Crew", "Device", "Illicit", "Modification", "Title"]
      }, {
        name: "Emon Azzameen",
        id: 104,
        unique: true,
        faction: "Scum and Villainy",
        ship: "Firespray-31",
        skill: 4,
        points: 76,
        slots: ["Talent", "Cannon", "Missile", "Crew", "Device", "Illicit", "Modification", "Title"]
      }, {
        name: "Kath Scarlet",
        id: 105,
        unique: true,
        faction: "Scum and Villainy",
        ship: "Firespray-31",
        skill: 4,
        points: 74,
        slots: ["Talent", "Cannon", "Missile", "Crew", "Device", "Illicit", "Modification", "Title"]
      }, {
        name: "Koshka Frost",
        id: 106,
        unique: true,
        faction: "Scum and Villainy",
        ship: "Firespray-31",
        skill: 3,
        points: 71,
        slots: ["Talent", "Cannon", "Missile", "Crew", "Device", "Illicit", "Modification", "Title"]
      }, {
        name: "Krassis Trelix",
        id: 107,
        unique: true,
        faction: "Scum and Villainy",
        ship: "Firespray-31",
        skill: 3,
        points: 70,
        slots: ["Talent", "Cannon", "Missile", "Crew", "Device", "Illicit", "Modification", "Title"]
      }, {
        name: "Bounty Hunter",
        id: 108,
        faction: "Scum and Villainy",
        ship: "Firespray-31",
        skill: 2,
        points: 66,
        slots: ["Cannon", "Missile", "Crew", "Device", "Illicit", "Modification", "Title"]
      }, {
        name: "4-LOM",
        id: 109,
        unique: true,
        faction: "Scum and Villainy",
        ship: "G-1A Starfighter",
        skill: 3,
        points: 49,
        slots: ["Talent", "Sensor", "Crew", "Illicit", "Modification", "Title"],
        ship_override: {
          actions: ["Calculate", "Lock", "Jam"]
        }
      }, {
        name: "Zuckuss",
        id: 110,
        unique: true,
        faction: "Scum and Villainy",
        ship: "G-1A Starfighter",
        skill: 3,
        points: 47,
        slots: ["Talent", "Sensor", "Crew", "Illicit", "Modification", "Title"]
      }, {
        name: "Gand Findsman",
        id: 111,
        faction: "Scum and Villainy",
        ship: "G-1A Starfighter",
        skill: 1,
        points: 43,
        slots: ["Sensor", "Crew", "Illicit", "Modification", "Title"]
      }, {
        name: "Palob Godalhi",
        id: 112,
        unique: true,
        faction: "Scum and Villainy",
        ship: "HWK-290",
        skill: 3,
        points: 38,
        slots: ["Talent", "Crew", "Device", "Illicit", "Modification", "Modification", "Title"]
      }, {
        name: "Dace Bonearm",
        id: 113,
        unique: true,
        faction: "Scum and Villainy",
        ship: "HWK-290",
        skill: 4,
        charge: 3,
        recurring: true,
        points: 36,
        slots: ["Talent", "Crew", "Device", "Illicit", "Modification", "Modification", "Title"]
      }, {
        name: "Torkil Mux",
        id: 114,
        unique: true,
        faction: "Scum and Villainy",
        ship: "HWK-290",
        skill: 2,
        points: 36,
        slots: ["Crew", "Device", "Illicit", "Modification", "Modification", "Title"]
      }, {
        name: "Dengar",
        id: 115,
        unique: true,
        faction: "Scum and Villainy",
        ship: "JumpMaster 5000",
        skill: 6,
        charge: 1,
        recurring: true,
        points: 64,
        slots: ["Talent", "Crew", "Torpedo", "Illicit", "Modification", "Title"]
      }, {
        name: "Tel Trevura",
        id: 116,
        unique: true,
        faction: "Scum and Villainy",
        ship: "JumpMaster 5000",
        skill: 4,
        charge: 1,
        points: 60,
        slots: ["Talent", "Crew", "Torpedo", "Illicit", "Modification", "Title"]
      }, {
        name: "Manaroo",
        id: 117,
        unique: true,
        faction: "Scum and Villainy",
        ship: "JumpMaster 5000",
        skill: 3,
        points: 56,
        slots: ["Talent", "Crew", "Torpedo", "Illicit", "Modification", "Title"]
      }, {
        name: "Contracted Scout",
        id: 118,
        faction: "Scum and Villainy",
        ship: "JumpMaster 5000",
        skill: 2,
        points: 52,
        slots: ["Torpedo", "Crew", "Illicit", "Modification", "Title"]
      }, {
        name: "Talonbane Cobra",
        id: 119,
        unique: true,
        faction: "Scum and Villainy",
        ship: "Kihraxz Fighter",
        skill: 5,
        points: 50,
        slots: ["Talent", "Missile", "Illicit", "Modification", "Modification", "Modification"]
      }, {
        name: "Graz",
        id: 120,
        unique: true,
        faction: "Scum and Villainy",
        ship: "Kihraxz Fighter",
        skill: 4,
        points: 47,
        slots: ["Talent", "Missile", "Illicit", "Modification", "Modification", "Modification"]
      }, {
        name: "Viktor Hel",
        id: 121,
        unique: true,
        faction: "Scum and Villainy",
        ship: "Kihraxz Fighter",
        skill: 4,
        points: 45,
        slots: ["Talent", "Missile", "Illicit", "Modification", "Modification", "Modification"]
      }, {
        name: "Captain Jostero",
        id: 122,
        unique: true,
        faction: "Scum and Villainy",
        ship: "Kihraxz Fighter",
        skill: 3,
        points: 43,
        slots: ["Missile", "Illicit", "Modification", "Modification", "Modification"]
      }, {
        name: "Black Sun Ace",
        id: 123,
        faction: "Scum and Villainy",
        ship: "Kihraxz Fighter",
        skill: 3,
        points: 42,
        slots: ["Talent", "Missile", "Illicit", "Modification", "Modification", "Modification"]
      }, {
        name: "Cartel Marauder",
        id: 124,
        faction: "Scum and Villainy",
        ship: "Kihraxz Fighter",
        skill: 2,
        points: 40,
        slots: ["Missile", "Illicit", "Modification", "Modification", "Modification"]
      }, {
        name: "Asajj Ventress",
        id: 125,
        unique: true,
        faction: "Scum and Villainy",
        ship: "Lancer-Class Pursuit Craft",
        skill: 4,
        points: 84,
        force: 2,
        slots: ["Force", "Crew", "Illicit", "Illicit", "Modification", "Title"]
      }, {
        name: "Ketsu Onyo",
        id: 126,
        unique: true,
        faction: "Scum and Villainy",
        ship: "Lancer-Class Pursuit Craft",
        skill: 5,
        points: 74,
        slots: ["Talent", "Crew", "Illicit", "Illicit", "Modification", "Title"]
      }, {
        name: "Sabine Wren (Scum)",
        id: 127,
        unique: true,
        xws: "sabinewren-lancerclasspursuitcraft",
        faction: "Scum and Villainy",
        ship: "Lancer-Class Pursuit Craft",
        skill: 3,
        points: 68,
        slots: ["Talent", "Crew", "Illicit", "Illicit", "Modification", "Title"]
      }, {
        name: "Shadowport Hunter",
        id: 128,
        faction: "Scum and Villainy",
        ship: "Lancer-Class Pursuit Craft",
        skill: 2,
        points: 64,
        slots: ["Crew", "Illicit", "Illicit", "Modification", "Title"]
      }, {
        name: "Torani Kulda",
        id: 129,
        unique: true,
        faction: "Scum and Villainy",
        ship: "M12-L Kimogila Fighter",
        skill: 4,
        points: 50,
        slots: ["Talent", "Torpedo", "Missile", "Astromech", "Illicit", "Modification"]
      }, {
        name: "Dalan Oberos",
        id: 130,
        unique: true,
        faction: "Scum and Villainy",
        ship: "M12-L Kimogila Fighter",
        skill: 3,
        charge: 2,
        points: 48,
        slots: ["Talent", "Torpedo", "Missile", "Astromech", "Illicit", "Modification"]
      }, {
        name: "Cartel Executioner",
        id: 131,
        faction: "Scum and Villainy",
        ship: "M12-L Kimogila Fighter",
        skill: 3,
        points: 44,
        slots: ["Talent", "Torpedo", "Missile", "Astromech", "Illicit", "Modification"]
      }, {
        name: "Serissu",
        id: 132,
        unique: true,
        faction: "Scum and Villainy",
        ship: "M3-A Interceptor",
        skill: 5,
        points: 43,
        slots: ["Talent", "Modification", "Hardpoint"]
      }, {
        name: "Genesis Red",
        id: 133,
        unique: true,
        faction: "Scum and Villainy",
        ship: "M3-A Interceptor",
        skill: 4,
        points: 35,
        slots: ["Talent", "Modification", "Hardpoint"]
      }, {
        name: "Laetin A'shera",
        id: 134,
        unique: true,
        faction: "Scum and Villainy",
        ship: "M3-A Interceptor",
        skill: 3,
        points: 35,
        slots: ["Talent", "Modification", "Hardpoint"]
      }, {
        name: "Quinn Jast",
        id: 135,
        unique: true,
        faction: "Scum and Villainy",
        ship: "M3-A Interceptor",
        skill: 3,
        points: 35,
        slots: ["Talent", "Modification", "Hardpoint"]
      }, {
        name: "Tansarii Point Veteran",
        id: 136,
        faction: "Scum and Villainy",
        ship: "M3-A Interceptor",
        skill: 3,
        points: 33,
        slots: ["Talent", "Modification", "Hardpoint"]
      }, {
        name: "Inaldra",
        id: 137,
        unique: true,
        faction: "Scum and Villainy",
        ship: "M3-A Interceptor",
        skill: 2,
        points: 32,
        slots: ["Modification", "Hardpoint"]
      }, {
        name: "Sunny Bounder",
        id: 138,
        unique: true,
        faction: "Scum and Villainy",
        ship: "M3-A Interceptor",
        skill: 1,
        points: 31,
        slots: ["Modification", "Hardpoint"]
      }, {
        name: "Cartel Spacer",
        id: 139,
        faction: "Scum and Villainy",
        ship: "M3-A Interceptor",
        skill: 1,
        points: 29,
        slots: ["Modification", "Hardpoint"]
      }, {
        name: "Constable Zuvio",
        id: 140,
        unique: true,
        faction: "Scum and Villainy",
        ship: "Quadjumper",
        skill: 4,
        points: 33,
        slots: ["Talent", "Tech", "Crew", "Device", "Illicit", "Modification"]
      }, {
        name: "Sarco Plank",
        id: 141,
        unique: true,
        faction: "Scum and Villainy",
        ship: "Quadjumper",
        skill: 2,
        points: 31,
        slots: ["Tech", "Crew", "Device", "Illicit", "Modification"]
      }, {
        name: "Unkar Plutt",
        id: 142,
        unique: true,
        faction: "Scum and Villainy",
        ship: "Quadjumper",
        skill: 2,
        points: 30,
        slots: ["Tech", "Crew", "Device", "Illicit", "Modification"]
      }, {
        name: "Jakku Gunrunner",
        id: 143,
        faction: "Scum and Villainy",
        ship: "Quadjumper",
        skill: 1,
        points: 28,
        slots: ["Tech", "Crew", "Device", "Illicit", "Modification"]
      }, {
        name: "Captain Nym",
        id: 144,
        unique: true,
        faction: "Scum and Villainy",
        ship: "Scurrg H-6 Bomber",
        skill: 5,
        charge: 1,
        recurring: true,
        points: 52,
        slots: ["Talent", "Turret", "Crew", "Device", "Device", "Modification", "Title"]
      }, {
        name: "Sol Sixxa",
        id: 145,
        unique: true,
        faction: "Scum and Villainy",
        ship: "Scurrg H-6 Bomber",
        skill: 3,
        points: 49,
        slots: ["Talent", "Turret", "Crew", "Device", "Device", "Modification", "Title"]
      }, {
        name: "Lok Revenant",
        id: 146,
        faction: "Scum and Villainy",
        ship: "Scurrg H-6 Bomber",
        skill: 2,
        points: 46,
        slots: ["Turret", "Crew", "Device", "Device", "Modification", "Title"]
      }, {
        name: "Guri",
        id: 147,
        unique: true,
        faction: "Scum and Villainy",
        ship: "StarViper",
        skill: 5,
        points: 62,
        slots: ["Talent", "Sensor", "Torpedo", "Modification", "Title"],
        ship_override: {
          actions: ["Calculate", "Lock", "Barrel Roll", "R> Calculate", "Boost", "R> Calculate"]
        }
      }, {
        name: "Prince Xizor",
        id: 148,
        unique: true,
        faction: "Scum and Villainy",
        ship: "StarViper",
        skill: 4,
        points: 54,
        slots: ["Talent", "Sensor", "Torpedo", "Modification", "Title"]
      }, {
        name: "Dalan Oberos (StarViper)",
        id: 149,
        unique: true,
        xws: "dalanoberos-starviperclassattackplatform",
        faction: "Scum and Villainy",
        ship: "StarViper",
        skill: 4,
        points: 54,
        slots: ["Talent", "Sensor", "Torpedo", "Modification", "Title"]
      }, {
        name: "Black Sun Assassin",
        id: 150,
        faction: "Scum and Villainy",
        ship: "StarViper",
        skill: 3,
        points: 48,
        slots: ["Talent", "Sensor", "Torpedo", "Modification", "Title"]
      }, {
        name: "Black Sun Enforcer",
        id: 151,
        faction: "Scum and Villainy",
        ship: "StarViper",
        skill: 2,
        points: 46,
        slots: ["Sensor", "Torpedo", "Modification", "Title"]
      }, {
        name: "Moralo Eval",
        id: 152,
        unique: true,
        faction: "Scum and Villainy",
        ship: "YV-666",
        skill: 4,
        charge: 2,
        points: 72,
        slots: ["Talent", "Cannon", "Missile", "Crew", "Crew", "Crew", "Illicit", "Modification", "Title"]
      }, {
        name: "Bossk",
        id: 153,
        unique: true,
        faction: "Scum and Villainy",
        ship: "YV-666",
        skill: 4,
        points: 70,
        slots: ["Talent", "Cannon", "Missile", "Crew", "Crew", "Crew", "Illicit", "Modification", "Title"]
      }, {
        name: "Latts Razzi",
        id: 154,
        unique: true,
        faction: "Scum and Villainy",
        ship: "YV-666",
        skill: 3,
        points: 66,
        slots: ["Talent", "Cannon", "Missile", "Crew", "Crew", "Crew", "Illicit", "Modification", "Title"]
      }, {
        name: "Trandoshan Slaver",
        id: 155,
        faction: "Scum and Villainy",
        ship: "YV-666",
        skill: 2,
        points: 58,
        slots: ["Cannon", "Missile", "Crew", "Crew", "Crew", "Illicit", "Modification", "Title"]
      }, {
        name: "N'dru Suhlak",
        id: 156,
        unique: true,
        faction: "Scum and Villainy",
        ship: "Z-95 Headhunter",
        skill: 4,
        points: 31,
        slots: ["Talent", "Missile", "Illicit", "Modification"]
      }, {
        name: "Kaa'to Leeachos",
        id: 157,
        unique: true,
        faction: "Scum and Villainy",
        ship: "Z-95 Headhunter",
        skill: 3,
        points: 29,
        slots: ["Talent", "Missile", "Illicit", "Modification"]
      }, {
        name: "Black Sun Soldier",
        id: 158,
        faction: "Scum and Villainy",
        ship: "Z-95 Headhunter",
        skill: 3,
        points: 27,
        slots: ["Talent", "Missile", "Illicit", "Modification"]
      }, {
        name: "Binayre Pirate",
        id: 159,
        faction: "Scum and Villainy",
        ship: "Z-95 Headhunter",
        skill: 1,
        points: 24,
        slots: ["Missile", "Illicit", "Modification"]
      }, {
        name: "Nashtah Pup",
        id: 160,
        unique: true,
        faction: "Scum and Villainy",
        ship: "Z-95 Headhunter",
        skill: 1,
        points: 6,
        slots: ["Missile", "Illicit", "Modification"]
      }, {
        name: "Major Vynder",
        id: 161,
        unique: true,
        faction: "Galactic Empire",
        ship: "Alpha-Class Star Wing",
        skill: 4,
        points: 41,
        slots: ["Talent", "Sensor", "Torpedo", "Missile", "Modification", "Configuration"]
      }, {
        name: "Lieutenant Karsabi",
        id: 162,
        unique: true,
        faction: "Galactic Empire",
        ship: "Alpha-Class Star Wing",
        skill: 3,
        points: 39,
        slots: ["Talent", "Sensor", "Torpedo", "Missile", "Modification", "Configuration"]
      }, {
        name: "Rho Squadron Pilot",
        id: 163,
        faction: "Galactic Empire",
        ship: "Alpha-Class Star Wing",
        skill: 3,
        points: 37,
        slots: ["Talent", "Sensor", "Torpedo", "Missile", "Modification", "Configuration"]
      }, {
        name: "Nu Squadron Pilot",
        id: 164,
        faction: "Galactic Empire",
        ship: "Alpha-Class Star Wing",
        skill: 2,
        points: 35,
        slots: ["Sensor", "Torpedo", "Missile", "Modification", "Configuration"]
      }, {
        name: "Captain Kagi",
        id: 165,
        unique: true,
        faction: "Galactic Empire",
        ship: "Lambda-Class Shuttle",
        skill: 4,
        points: 48,
        slots: ["Sensor", "Cannon", "Crew", "Crew", "Modification", "Title"]
      }, {
        name: "Lieutenant Sai",
        id: 166,
        unique: true,
        faction: "Galactic Empire",
        ship: "Lambda-Class Shuttle",
        skill: 3,
        points: 47,
        slots: ["Sensor", "Cannon", "Crew", "Crew", "Modification", "Title"]
      }, {
        name: "Colonel Jendon",
        id: 167,
        unique: true,
        faction: "Galactic Empire",
        ship: "Lambda-Class Shuttle",
        skill: 3,
        charge: 2,
        points: 46,
        slots: ["Sensor", "Cannon", "Crew", "Crew", "Modification", "Title"]
      }, {
        name: "Omicron Group Pilot",
        id: 168,
        faction: "Galactic Empire",
        ship: "Lambda-Class Shuttle",
        skill: 1,
        points: 43,
        slots: ["Sensor", "Cannon", "Crew", "Crew", "Modification", "Title"]
      }, {
        name: "Grand Inquisitor",
        id: 169,
        unique: true,
        faction: "Galactic Empire",
        ship: "TIE Advanced Prototype",
        skill: 5,
        points: 58,
        force: 2,
        slots: ["Force", "Sensor", "Missile"]
      }, {
        name: "Seventh Sister",
        id: 170,
        unique: true,
        faction: "Galactic Empire",
        ship: "TIE Advanced Prototype",
        skill: 4,
        points: 48,
        force: 2,
        slots: ["Force", "Sensor", "Missile"]
      }, {
        name: "Inquisitor",
        id: 171,
        faction: "Galactic Empire",
        ship: "TIE Advanced Prototype",
        skill: 3,
        points: 40,
        force: 1,
        slots: ["Force", "Sensor", "Missile"]
      }, {
        name: "Baron of the Empire",
        id: 172,
        faction: "Galactic Empire",
        ship: "TIE Advanced Prototype",
        skill: 3,
        points: 34,
        slots: ["Talent", "Sensor", "Missile"]
      }, {
        name: "Darth Vader",
        id: 173,
        unique: true,
        faction: "Galactic Empire",
        ship: "TIE Advanced",
        skill: 6,
        points: 70,
        force: 3,
        slots: ["Force", "Sensor", "Missile", "Modification"]
      }, {
        name: "Maarek Stele",
        id: 174,
        unique: true,
        faction: "Galactic Empire",
        ship: "TIE Advanced",
        skill: 5,
        points: 50,
        slots: ["Talent", "Sensor", "Missile", "Modification"]
      }, {
        name: "Ved Foslo",
        id: 175,
        unique: true,
        faction: "Galactic Empire",
        ship: "TIE Advanced",
        skill: 4,
        points: 47,
        slots: ["Talent", "Sensor", "Missile", "Modification"]
      }, {
        name: "Zertik Strom",
        id: 176,
        unique: true,
        faction: "Galactic Empire",
        ship: "TIE Advanced",
        skill: 3,
        points: 45,
        slots: ["Sensor", "Missile", "Modification"]
      }, {
        name: "Storm Squadron Ace",
        id: 177,
        faction: "Galactic Empire",
        ship: "TIE Advanced",
        skill: 3,
        points: 43,
        slots: ["Talent", "Sensor", "Missile", "Modification"]
      }, {
        name: "Tempest Squadron Pilot",
        id: 178,
        faction: "Galactic Empire",
        ship: "TIE Advanced",
        skill: 2,
        points: 41,
        slots: ["Sensor", "Missile", "Modification"]
      }, {
        name: "Soontir Fel",
        id: 179,
        unique: true,
        faction: "Galactic Empire",
        ship: "TIE Interceptor",
        skill: 6,
        points: 52,
        slots: ["Talent", "Modification", "Modification"]
      }, {
        name: "Turr Phennir",
        id: 180,
        unique: true,
        faction: "Galactic Empire",
        ship: "TIE Interceptor",
        skill: 4,
        points: 44,
        slots: ["Talent", "Modification", "Modification"]
      }, {
        name: "Saber Squadron Ace",
        id: 181,
        faction: "Galactic Empire",
        ship: "TIE Interceptor",
        skill: 4,
        points: 40,
        slots: ["Talent", "Modification", "Modification"]
      }, {
        name: "Alpha Squadron Pilot",
        id: 182,
        faction: "Galactic Empire",
        ship: "TIE Interceptor",
        skill: 1,
        points: 34,
        slots: ["Modification", "Modification"]
      }, {
        name: "Major Vermeil",
        id: 183,
        unique: true,
        faction: "Galactic Empire",
        ship: "TIE Reaper",
        skill: 4,
        points: 49,
        slots: ["Talent", "Crew", "Crew", "Modification"]
      }, {
        name: "Captain Feroph",
        id: 184,
        unique: true,
        faction: "Galactic Empire",
        ship: "TIE Reaper",
        skill: 3,
        points: 47,
        slots: ["Talent", "Crew", "Crew", "Modification"]
      }, {
        name: '"Vizier"',
        id: 185,
        unique: true,
        faction: "Galactic Empire",
        ship: "TIE Reaper",
        skill: 2,
        points: 45,
        slots: ["Crew", "Crew", "Modification"]
      }, {
        name: "Scarif Base Pilot",
        id: 186,
        faction: "Galactic Empire",
        ship: "TIE Reaper",
        skill: 1,
        points: 41,
        slots: ["Crew", "Crew", "Modification"]
      }, {
        name: "Lieutenant Kestal",
        id: 187,
        unique: true,
        faction: "Galactic Empire",
        ship: "TIE Aggressor",
        skill: 4,
        points: 36,
        slots: ["Talent", "Turret", "Missile", "Missile", "Gunner", "Modification"]
      }, {
        name: '"Double Edge"',
        id: 188,
        unique: true,
        faction: "Galactic Empire",
        ship: "TIE Aggressor",
        skill: 2,
        points: 33,
        slots: ["Talent", "Turret", "Missile", "Missile", "Gunner", "Modification"]
      }, {
        name: "Onyx Squadron Scout",
        id: 189,
        faction: "Galactic Empire",
        ship: "TIE Aggressor",
        skill: 3,
        points: 32,
        slots: ["Talent", "Turret", "Missile", "Missile", "Gunner", "Modification"]
      }, {
        name: "Sienar Specialist",
        id: 190,
        faction: "Galactic Empire",
        ship: "TIE Aggressor",
        skill: 2,
        points: 30,
        slots: ["Turret", "Missile", "Missile", "Gunner", "Modification"]
      }, {
        name: '"Redline"',
        id: 191,
        unique: true,
        faction: "Galactic Empire",
        ship: "TIE Punisher",
        skill: 5,
        points: 44,
        slots: ["Sensor", "Torpedo", "Missile", "Missile", "Gunner", "Device", "Device", "Modification"]
      }, {
        name: '"Deathrain"',
        id: 192,
        unique: true,
        faction: "Galactic Empire",
        ship: "TIE Punisher",
        skill: 4,
        points: 42,
        slots: ["Sensor", "Torpedo", "Missile", "Missile", "Gunner", "Device", "Device", "Modification"]
      }, {
        name: "Cutlass Squadron Pilot",
        id: 193,
        faction: "Galactic Empire",
        ship: "TIE Punisher",
        skill: 2,
        points: 36,
        slots: ["Sensor", "Torpedo", "Missile", "Missile", "Gunner", "Device", "Device", "Modification"]
      }, {
        name: "Colonel Vessery",
        id: 194,
        unique: true,
        faction: "Galactic Empire",
        ship: "TIE Defender",
        skill: 4,
        points: 88,
        slots: ["Talent", "Sensor", "Cannon", "Missile"]
      }, {
        name: "Countess Ryad",
        id: 195,
        unique: true,
        faction: "Galactic Empire",
        ship: "TIE Defender",
        skill: 4,
        points: 86,
        slots: ["Talent", "Sensor", "Cannon", "Missile"]
      }, {
        name: "Rexler Brath",
        id: 196,
        unique: true,
        faction: "Galactic Empire",
        ship: "TIE Defender",
        skill: 5,
        points: 84,
        slots: ["Talent", "Sensor", "Cannon", "Missile"]
      }, {
        name: "Onyx Squadron Ace",
        id: 197,
        faction: "Galactic Empire",
        ship: "TIE Defender",
        skill: 4,
        points: 78,
        slots: ["Talent", "Sensor", "Cannon", "Missile"]
      }, {
        name: "Delta Squadron Pilot",
        id: 198,
        faction: "Galactic Empire",
        ship: "TIE Defender",
        skill: 1,
        points: 72,
        slots: ["Sensor", "Cannon", "Missile"]
      }, {
        name: '"Whisper"',
        id: 199,
        unique: true,
        faction: "Galactic Empire",
        ship: "TIE Phantom",
        skill: 5,
        points: 52,
        slots: ["Talent", "Sensor", "Crew", "Modification"]
      }, {
        name: '"Echo"',
        id: 200,
        unique: true,
        faction: "Galactic Empire",
        ship: "TIE Phantom",
        skill: 4,
        points: 50,
        slots: ["Talent", "Sensor", "Crew", "Modification"]
      }, {
        name: "Sigma Squadron Ace",
        id: 201,
        faction: "Galactic Empire",
        ship: "TIE Phantom",
        skill: 4,
        points: 46,
        slots: ["Talent", "Sensor", "Crew", "Modification"]
      }, {
        name: "Imdaar Test Pilot",
        id: 202,
        faction: "Galactic Empire",
        ship: "TIE Phantom",
        skill: 3,
        points: 44,
        slots: ["Sensor", "Crew", "Modification"]
      }, {
        name: "Captain Jonus",
        id: 203,
        unique: true,
        faction: "Galactic Empire",
        ship: "TIE Bomber",
        skill: 4,
        points: 36,
        slots: ["Talent", "Torpedo", "Missile", "Missile", "Gunner", "Device", "Device", "Modification"]
      }, {
        name: "Major Rhymer",
        id: 204,
        unique: true,
        faction: "Galactic Empire",
        ship: "TIE Bomber",
        skill: 4,
        points: 34,
        slots: ["Talent", "Torpedo", "Missile", "Missile", "Gunner", "Device", "Device", "Modification"]
      }, {
        name: "Tomax Bren",
        id: 205,
        unique: true,
        faction: "Galactic Empire",
        ship: "TIE Bomber",
        skill: 5,
        points: 34,
        slots: ["Talent", "Torpedo", "Missile", "Missile", "Gunner", "Device", "Device", "Modification"]
      }, {
        name: '"Deathfire"',
        id: 206,
        unique: true,
        faction: "Galactic Empire",
        ship: "TIE Bomber",
        skill: 2,
        points: 32,
        slots: ["Torpedo", "Missile", "Missile", "Gunner", "Device", "Device", "Modification"]
      }, {
        name: "Gamma Squadron Ace",
        id: 207,
        faction: "Galactic Empire",
        ship: "TIE Bomber",
        skill: 3,
        points: 30,
        slots: ["Talent", "Torpedo", "Missile", "Missile", "Gunner", "Device", "Device", "Modification"]
      }, {
        name: "Scimitar Squadron Pilot",
        id: 208,
        faction: "Galactic Empire",
        ship: "TIE Bomber",
        skill: 2,
        points: 28,
        slots: ["Torpedo", "Missile", "Missile", "Gunner", "Device", "Device", "Modification"]
      }, {
        name: '"Countdown"',
        id: 209,
        unique: true,
        faction: "Galactic Empire",
        ship: "TIE Striker",
        skill: 4,
        points: 44,
        slots: ["Talent", "Gunner", "Device", "Modification"]
      }, {
        name: '"Pure Sabacc"',
        id: 210,
        unique: true,
        faction: "Galactic Empire",
        ship: "TIE Striker",
        skill: 4,
        points: 44,
        slots: ["Talent", "Gunner", "Device", "Modification"]
      }, {
        name: '"Duchess"',
        id: 211,
        unique: true,
        faction: "Galactic Empire",
        ship: "TIE Striker",
        skill: 5,
        points: 42,
        slots: ["Talent", "Gunner", "Device", "Modification"]
      }, {
        name: "Black Squadron Scout",
        id: 212,
        faction: "Galactic Empire",
        ship: "TIE Striker",
        skill: 3,
        points: 38,
        slots: ["Talent", "Gunner", "Device", "Modification"]
      }, {
        name: "Planetary Sentinel",
        id: 213,
        faction: "Galactic Empire",
        ship: "TIE Striker",
        skill: 1,
        points: 34,
        slots: ["Gunner", "Device", "Modification"]
      }, {
        name: "Rear Admiral Chiraneau",
        id: 214,
        unique: true,
        faction: "Galactic Empire",
        ship: "VT-49 Decimator",
        skill: 5,
        points: 88,
        slots: ["Talent", "Torpedo", "Crew", "Crew", "Gunner", "Device", "Modification", "Title"]
      }, {
        name: "Captain Oicunn",
        id: 215,
        unique: true,
        faction: "Galactic Empire",
        ship: "VT-49 Decimator",
        skill: 3,
        points: 84,
        slots: ["Talent", "Torpedo", "Crew", "Crew", "Gunner", "Device", "Modification", "Title"]
      }, {
        name: "Patrol Leader",
        id: 216,
        faction: "Galactic Empire",
        ship: "VT-49 Decimator",
        skill: 2,
        points: 80,
        slots: ["Torpedo", "Crew", "Crew", "Gunner", "Device", "Modification", "Title"]
      }, {
        name: '"Howlrunner"',
        id: 217,
        unique: true,
        faction: "Galactic Empire",
        ship: "TIE Fighter",
        skill: 5,
        points: 40,
        slots: ["Talent", "Modification"]
      }, {
        name: "Iden Versio",
        id: 218,
        unique: true,
        faction: "Galactic Empire",
        ship: "TIE Fighter",
        skill: 4,
        charge: 1,
        points: 40,
        slots: ["Talent", "Modification"]
      }, {
        name: '"Mauler" Mithel',
        id: 219,
        unique: true,
        faction: "Galactic Empire",
        ship: "TIE Fighter",
        skill: 5,
        points: 32,
        slots: ["Talent", "Modification"]
      }, {
        name: '"Scourge" Skutu',
        id: 220,
        unique: true,
        faction: "Galactic Empire",
        ship: "TIE Fighter",
        skill: 5,
        points: 32,
        slots: ["Talent", "Modification"]
      }, {
        name: '"Wampa"',
        id: 221,
        unique: true,
        faction: "Galactic Empire",
        ship: "TIE Fighter",
        skill: 1,
        recurring: true,
        charge: 1,
        points: 30,
        slots: ["Modification"]
      }, {
        name: "Del Meeko",
        id: 222,
        unique: true,
        faction: "Galactic Empire",
        ship: "TIE Fighter",
        skill: 4,
        points: 30,
        slots: ["Talent", "Modification"]
      }, {
        name: "Gideon Hask",
        id: 223,
        unique: true,
        faction: "Galactic Empire",
        ship: "TIE Fighter",
        skill: 4,
        points: 30,
        slots: ["Talent", "Modification"]
      }, {
        name: "Seyn Marana",
        id: 224,
        unique: true,
        faction: "Galactic Empire",
        ship: "TIE Fighter",
        skill: 4,
        points: 30,
        slots: ["Talent", "Modification"]
      }, {
        name: "Valen Rudor",
        id: 225,
        unique: true,
        faction: "Galactic Empire",
        ship: "TIE Fighter",
        skill: 3,
        points: 28,
        slots: ["Talent", "Modification"]
      }, {
        name: '"Night Beast"',
        id: 226,
        unique: true,
        faction: "Galactic Empire",
        ship: "TIE Fighter",
        skill: 2,
        points: 26,
        slots: ["Modification"]
      }, {
        name: "Black Squadron Ace",
        id: 227,
        faction: "Galactic Empire",
        ship: "TIE Fighter",
        skill: 3,
        points: 26,
        slots: ["Talent", "Modification"]
      }, {
        name: "Obsidian Squadron Pilot",
        id: 228,
        faction: "Galactic Empire",
        ship: "TIE Fighter",
        skill: 2,
        points: 24,
        slots: ["Modification"]
      }, {
        name: "Academy Pilot",
        id: 229,
        faction: "Galactic Empire",
        ship: "TIE Fighter",
        skill: 1,
        points: 23,
        slots: ["Modification"]
      }, {
        name: "Spice Runner",
        id: 230,
        faction: "Scum and Villainy",
        ship: "HWK-290",
        skill: 1,
        points: 32,
        slots: ["Crew", "Device", "Illicit", "Modification", "Modification", "Title"]
      }, {
        name: "Poe Dameron",
        id: 231,
        unique: true,
        faction: "Resistance",
        ship: "T-70 X-Wing",
        skill: 6,
        points: 100,
        charge: 1,
        recurring: true,
        slots: ["Astromech", "Modification", "Configuration", "Tech", "Title", "Hardpoint"]
      }, {
        name: "Lieutenant Bastian",
        id: 232,
        unique: true,
        faction: "Resistance",
        ship: "T-70 X-Wing",
        skill: 6,
        points: 1,
        slots: ["Astromech", "Modification", "Configuration", "Tech", "Hardpoint"]
      }, {
        name: '"Midnight"',
        id: 233,
        unique: true,
        faction: "First Order",
        ship: "TIE/FO Fighter",
        skill: 6,
        points: 100,
        slots: ["Modification"]
      }, {
        name: '"Longshot"',
        id: 234,
        unique: true,
        faction: "First Order",
        ship: "TIE/FO Fighter",
        skill: 3,
        points: 100,
        slots: ["Modification"]
      }, {
        name: '"Muse"',
        id: 235,
        unique: true,
        faction: "First Order",
        ship: "TIE/FO Fighter",
        skill: 2,
        points: 100,
        slots: ["Modification"]
      }, {
        name: "Kylo Ren",
        id: 236,
        unique: true,
        faction: "First Order",
        ship: "TIE Silencer",
        skill: 5,
        force: 2,
        points: 100,
        applies_condition: 'I\'ll Show You the Dark Side'.canonicalize(),
        slots: ["Force", "Tech", "Modification"]
      }, {
        name: '"Blackout"',
        id: 237,
        unique: true,
        faction: "First Order",
        ship: "TIE Silencer",
        skill: 5,
        points: 100,
        slots: ["Talent", "Tech", "Modification"]
      }, {
        name: "Lieutenant Dormitz",
        id: 238,
        unique: true,
        faction: "First Order",
        ship: "Upsilon-Class Shuttle",
        skill: 0,
        points: 100,
        slots: ["Tech", "Tech", "Crew", "Crew", "Cannon", "Sensor", "Modification"]
      }, {
        name: "Lulo Lampar",
        id: 239,
        unique: true,
        faction: "Resistance",
        ship: "RZ-2 A-Wing",
        skill: 5,
        points: 100,
        slots: ["Talent", "Missile"]
      }, {
        name: "Tallissan Lintra",
        id: 240,
        unique: true,
        faction: "Resistance",
        ship: "RZ-2 A-Wing",
        skill: 5,
        charge: 1,
        recurring: true,
        points: 100,
        slots: ["Talent", "Missile"]
      }, {
        name: "Lulo Lampar",
        id: 241,
        unique: true,
        faction: "Resistance",
        ship: "RZ-2 A-Wing",
        skill: 5,
        points: 100,
        slots: ["Talent", "Missile"]
      }, {
        name: '"Backdraft"',
        id: 242,
        unique: true,
        faction: "First Order",
        ship: "TIE/SF Fighter",
        skill: 4,
        points: 100,
        slots: ["Talent", "Tech", "Gunner", "Sensor", "Modification"]
      }, {
        name: '"Quickdraw"',
        id: 243,
        unique: true,
        faction: "First Order",
        ship: "TIE/SF Fighter",
        skill: 0,
        points: 100,
        slots: ["Talent", "Tech", "Gunner", "Sensor", "Modification"]
      }, {
        name: "Rey",
        id: 244,
        unique: true,
        faction: "Resistance",
        ship: "YT-1300 (Resistance)",
        skill: 0,
        points: 100,
        force: 2,
        slots: ["Force", "Crew", "Crew", "Gunner", "Modification"]
      }, {
        name: "Han Solo (Resistance)",
        id: 245,
        unique: true,
        faction: "Resistance",
        ship: "YT-1300 (Resistance)",
        skill: 6,
        points: 100,
        slots: ["Talent", "Crew", "Crew", "Gunner", "Modification"]
      }, {
        name: "Chewbacca (Resistance)",
        id: 246,
        unique: true,
        faction: "Resistance",
        ship: "YT-1300 (Resistance)",
        skill: 4,
        points: 100,
        slots: ["Talent", "Crew", "Crew", "Gunner", "Modification"]
      }, {
        name: "Captain Seevor",
        id: 247,
        unique: true,
        faction: "Scum and Villainy",
        ship: "Mining Guild TIE Fighter",
        skill: 3,
        charge: 1,
        Recurring: true,
        points: 100,
        slots: ["Talent", "Modification"]
      }, {
        name: "Mining Guild Surveyor",
        id: 248,
        faction: "Scum and Villainy",
        ship: "Mining Guild TIE Fighter",
        skill: 2,
        points: 100,
        slots: ["Modification"]
      }, {
        name: "Ahhav",
        id: 249,
        unique: true,
        faction: "Scum and Villainy",
        ship: "Mining Guild TIE Fighter",
        skill: 0,
        points: 100,
        slots: ["Talent", "Modification"]
      }, {
        name: "Finch Dallow",
        id: 250,
        unique: true,
        faction: "Resistance",
        ship: "B/SF-17 Bomber",
        skill: 0,
        points: 100,
        slots: ["Talent", "Modification"]
      }
    ],
    upgradesById: [
      {
        name: '"Chopper" (Astromech)',
        id: 0,
        slot: "Astromech",
        canonical_name: '"Chopper"'.canonicalize(),
        points: 2,
        unique: true,
        faction: "Rebel Alliance"
      }, {
        name: '"Genius"',
        id: 1,
        slot: "Astromech",
        points: 0,
        unique: true,
        faction: "Scum and Villainy"
      }, {
        name: "R2 Astromech",
        id: 2,
        slot: "Astromech",
        points: 6,
        charge: 2
      }, {
        name: "R2-D2",
        id: 3,
        unique: true,
        slot: "Astromech",
        points: 8,
        charge: 3,
        faction: "Rebel Alliance"
      }, {
        name: "R3 Astromech",
        id: 4,
        slot: "Astromech",
        points: 3
      }, {
        name: "R4 Astromech",
        id: 5,
        slot: "Astromech",
        points: 2,
        restriction_func: function(ship) {
          return !((ship.data.large != null) || (ship.data.medium != null));
        },
        modifier_func: function(stats) {
          var turn, _i, _ref, _results;
          _results = [];
          for (turn = _i = 0, _ref = stats.maneuvers[1].length; 0 <= _ref ? _i < _ref : _i > _ref; turn = 0 <= _ref ? ++_i : --_i) {
            if (turn > 4) {
              continue;
            }
            if (stats.maneuvers[1][turn] > 0) {
              if (stats.maneuvers[1][turn] === 3) {
                stats.maneuvers[1][turn] = 1;
              } else {
                stats.maneuvers[1][turn] = 2;
              }
            }
            if (stats.maneuvers[2][turn] > 0) {
              if (stats.maneuvers[2][turn] === 3) {
                _results.push(stats.maneuvers[2][turn] = 1);
              } else {
                _results.push(stats.maneuvers[2][turn] = 2);
              }
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        }
      }, {
        name: "R5 Astromech",
        id: 6,
        slot: "Astromech",
        points: 5,
        charge: 2
      }, {
        name: "R5-D8",
        id: 7,
        unique: true,
        slot: "Astromech",
        points: 7,
        charge: 3,
        faction: "Rebel Alliance"
      }, {
        name: "R5-P8",
        id: 8,
        slot: "Astromech",
        points: 4,
        unique: true,
        faction: "Scum and Villainy",
        charge: 3
      }, {
        name: "R5-TK",
        id: 9,
        slot: "Astromech",
        points: 1,
        unique: true,
        faction: "Scum and Villainy"
      }, {
        name: "Heavy Laser Cannon",
        id: 10,
        slot: "Cannon",
        points: 4,
        attackbull: 4,
        range: "2-3"
      }, {
        name: "Ion Cannon",
        id: 11,
        slot: "Cannon",
        points: 5,
        attack: 3,
        range: "1-3"
      }, {
        name: "Jamming Beam",
        id: 12,
        slot: "Cannon",
        points: 2,
        attack: 3,
        range: "1-2"
      }, {
        name: "Tractor Beam",
        id: 13,
        slot: "Cannon",
        points: 3,
        attack: 3,
        range: "1-3"
      }, {
        name: "Admiral Sloane",
        id: 14,
        slot: "Crew",
        points: 10,
        unique: true,
        faction: "Galactic Empire"
      }, {
        name: "Agent Kallus",
        id: 15,
        slot: "Crew",
        points: 6,
        unique: true,
        faction: "Galactic Empire",
        applies_condition: 'Hunted'.canonicalize()
      }, {
        name: "Boba Fett",
        id: 16,
        slot: "Crew",
        points: 4,
        unique: true,
        faction: "Scum and Villainy"
      }, {
        name: "Baze Malbus",
        id: 17,
        slot: "Crew",
        points: 8,
        unique: true,
        faction: "Rebel Alliance"
      }, {
        name: "C-3PO",
        id: 18,
        slot: "Crew",
        points: 12,
        unique: true,
        faction: "Rebel Alliance",
        modifier_func: function(stats) {
          if (__indexOf.call(stats.actions, 'Calculate') < 0) {
            return stats.actions.push('Calculate');
          }
        }
      }, {
        name: "Cassian Andor",
        id: 19,
        slot: "Crew",
        points: 6,
        unique: true,
        faction: "Rebel Alliance"
      }, {
        name: "Cad Bane",
        id: 20,
        slot: "Crew",
        points: 4,
        unique: true,
        faction: "Scum and Villainy"
      }, {
        name: "Chewbacca",
        id: 21,
        slot: "Crew",
        points: 5,
        unique: true,
        faction: "Rebel Alliance",
        charge: 2,
        recurring: true
      }, {
        name: "Chewbacca (Scum)",
        id: 22,
        slot: "Crew",
        xws: "chewbacca-crew",
        points: 4,
        unique: true,
        faction: "Scum and Villainy"
      }, {
        name: '"Chopper" (Crew)',
        id: 23,
        canonical_name: '"Chopper"'.canonicalize(),
        xws: "chopper-crew",
        slot: "Crew",
        points: 2,
        unique: true,
        faction: "Rebel Alliance"
      }, {
        name: "Ciena Ree",
        id: 24,
        slot: "Crew",
        points: 10,
        unique: true,
        faction: "Galactic Empire",
        restriction_func: function(ship) {
          return __indexOf.call(ship.effectiveStats().actions, "Coordinate") >= 0 || __indexOf.call(ship.effectiveStats().actionsred, "Coordinate") >= 0;
        }
      }, {
        name: "Cikatro Vizago",
        id: 25,
        slot: "Crew",
        points: 2,
        unique: true,
        faction: "Scum and Villainy"
      }, {
        name: "Darth Vader",
        id: 26,
        slot: "Crew",
        points: 14,
        force: 1,
        unique: true,
        faction: "Galactic Empire",
        modifier_func: function(stats) {
          return stats.force += 1;
        }
      }, {
        name: "Death Troopers",
        id: 27,
        slot: "Crew",
        points: 6,
        unique: true,
        faction: "Galactic Empire",
        restriction_func: function(ship, upgrade_obj) {
          return ship.hasAnotherUnoccupiedSlotLike(upgrade_obj);
        },
        validation_func: function(ship, upgrade_obj) {
          return upgrade_obj.occupiesAnotherUpgradeSlot();
        },
        also_occupies_upgrades: ["Crew"]
      }, {
        name: "Director Krennic",
        id: 28,
        slot: "Crew",
        points: 5,
        unique: true,
        faction: "Galactic Empire",
        applies_condition: 'Optimized Prototype'.canonicalize(),
        modifier_func: function(stats) {
          if (__indexOf.call(stats.actions, 'Lock') < 0) {
            return stats.actions.push('Lock');
          }
        }
      }, {
        name: "Emperor Palpatine",
        id: 29,
        slot: "Crew",
        points: 13,
        force: 1,
        unique: true,
        faction: "Galactic Empire",
        restriction_func: function(ship, upgrade_obj) {
          return ship.hasAnotherUnoccupiedSlotLike(upgrade_obj);
        },
        validation_func: function(ship, upgrade_obj) {
          return upgrade_obj.occupiesAnotherUpgradeSlot();
        },
        also_occupies_upgrades: ["Crew"],
        modifier_func: function(stats) {
          return stats.force += 1;
        }
      }, {
        name: "Freelance Slicer",
        id: 30,
        slot: "Crew",
        points: 3
      }, {
        name: "4-LOM",
        id: 31,
        slot: "Crew",
        points: 3,
        unique: true,
        faction: "Scum and Villainy"
      }, {
        name: 'GNK "Gonk" Droid',
        id: 32,
        slot: "Crew",
        points: 10,
        charge: 1
      }, {
        name: "Grand Inquisitor",
        id: 33,
        slot: "Crew",
        points: 16,
        unique: true,
        force: 1,
        faction: "Galactic Empire",
        modifier_func: function(stats) {
          return stats.force += 1;
        }
      }, {
        name: "Grand Moff Tarkin",
        id: 34,
        slot: "Crew",
        points: 10,
        unique: true,
        faction: "Galactic Empire",
        charge: 2,
        recurring: true,
        restriction_func: function(ship) {
          return __indexOf.call(ship.effectiveStats().actions, "Lock") >= 0 || __indexOf.call(ship.effectiveStats().actionsred, "Lock") >= 0;
        }
      }, {
        name: "Hera Syndulla",
        id: 35,
        slot: "Crew",
        points: 4,
        unique: true,
        faction: "Rebel Alliance"
      }, {
        name: "IG-88D",
        id: 36,
        slot: "Crew",
        points: 4,
        unique: true,
        faction: "Scum and Villainy"
      }, {
        name: "Informant",
        id: 37,
        slot: "Crew",
        points: 5,
        unique: true,
        applies_condition: 'Listening Device'.canonicalize()
      }, {
        name: "ISB Slicer",
        id: 38,
        slot: "Crew",
        points: 3,
        faction: "Galactic Empire"
      }, {
        name: "Jabba the Hutt",
        id: 39,
        slot: "Crew",
        points: 8,
        unique: true,
        faction: "Scum and Villainy",
        charge: 4,
        restriction_func: function(ship, upgrade_obj) {
          return ship.hasAnotherUnoccupiedSlotLike(upgrade_obj);
        },
        validation_func: function(ship, upgrade_obj) {
          return upgrade_obj.occupiesAnotherUpgradeSlot();
        },
        also_occupies_upgrades: ["Crew"]
      }, {
        name: "Jyn Erso",
        id: 40,
        slot: "Crew",
        points: 2,
        unique: true,
        faction: "Rebel Alliance"
      }, {
        name: "Kanan Jarrus",
        id: 41,
        slot: "Crew",
        points: 14,
        force: 1,
        unique: true,
        faction: "Rebel Alliance",
        modifier_func: function(stats) {
          return stats.force += 1;
        }
      }, {
        name: "Ketsu Onyo",
        id: 42,
        slot: "Crew",
        points: 5,
        unique: true,
        faction: "Scum and Villainy"
      }, {
        name: "L3-37",
        id: 43,
        slot: "Crew",
        points: 4,
        unique: true,
        faction: "Scum and Villainy"
      }, {
        name: "Lando Calrissian",
        id: 44,
        slot: "Crew",
        xws: "landocalrissian",
        points: 5,
        unique: true,
        faction: "Rebel Alliance"
      }, {
        name: "Lando Calrissian (Scum)",
        id: 45,
        slot: "Crew",
        xws: "landocalrissian-crew",
        points: 8,
        unique: true,
        faction: "Scum and Villainy"
      }, {
        name: "Leia Organa",
        id: 46,
        slot: "Crew",
        points: 8,
        unique: true,
        faction: "Rebel Alliance",
        charge: 3,
        recurring: true
      }, {
        name: "Latts Razzi",
        id: 47,
        slot: "Crew",
        points: 7,
        unique: true,
        faction: "Scum and Villainy"
      }, {
        name: "Maul",
        id: 48,
        slot: "Crew",
        points: 13,
        unique: true,
        force: 1,
        modifier_func: function(stats) {
          return stats.force += 1;
        },
        restriction_func: function(ship) {
          var builder, t, thing, things, _ref;
          builder = ship.builder;
          if (builder.faction === "Scum and Villainy") {
            return true;
          }
          _ref = builder.uniques_in_use;
          for (t in _ref) {
            things = _ref[t];
            if (__indexOf.call((function() {
              var _i, _len, _results;
              _results = [];
              for (_i = 0, _len = things.length; _i < _len; _i++) {
                thing = things[_i];
                _results.push(thing.canonical_name.getXWSBaseName());
              }
              return _results;
            })(), 'ezrabridger') >= 0) {
              return true;
            }
          }
          return false;
        }
      }, {
        name: "Minister Tua",
        id: 49,
        slot: "Crew",
        points: 7,
        unique: true,
        faction: "Galactic Empire"
      }, {
        name: "Moff Jerjerrod",
        id: 50,
        slot: "Crew",
        points: 12,
        unique: true,
        faction: "Galactic Empire",
        charge: 2,
        recurring: true,
        restriction_func: function(ship) {
          return __indexOf.call(ship.effectiveStats().actions, "Coordinate") >= 0 || __indexOf.call(ship.effectiveStats().actionsred, "Coordinate") >= 0;
        }
      }, {
        name: "Magva Yarro",
        id: 51,
        slot: "Crew",
        points: 7,
        unique: true,
        faction: "Rebel Alliance"
      }, {
        name: "Nien Nunb",
        id: 52,
        slot: "Crew",
        points: 5,
        unique: true,
        faction: "Rebel Alliance",
        modifier_func: function(stats) {
          var s, spd, _i, _len, _ref, _ref1, _results;
          _ref1 = (_ref = stats.maneuvers) != null ? _ref : [];
          _results = [];
          for (spd = _i = 0, _len = _ref1.length; _i < _len; spd = ++_i) {
            s = _ref1[spd];
            if (spd === 0) {
              continue;
            }
            if (s[1] > 0) {
              if (s[1] = 1) {
                s[1] = 2;
              } else if (s[1] = 3) {
                s[1] = 1;
              }
            }
            if (s[3] > 0) {
              if (s[3] = 1) {
                _results.push(s[3] = 2);
              } else if (s[3] = 3) {
                _results.push(s[3] = 1);
              } else {
                _results.push(void 0);
              }
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        }
      }, {
        name: "Novice Technician",
        id: 53,
        slot: "Crew",
        points: 4
      }, {
        name: "Perceptive Copilot",
        id: 54,
        slot: "Crew",
        points: 10
      }, {
        name: "Qi'ra",
        id: 55,
        slot: "Crew",
        points: 2,
        unique: true,
        faction: "Scum and Villainy"
      }, {
        name: "R2-D2 (Crew)",
        id: 56,
        slot: "Crew",
        canonical_name: 'r2d2-crew',
        xws: "r2d2-crew",
        points: 8,
        unique: true,
        faction: "Rebel Alliance"
      }, {
        name: "Sabine Wren",
        id: 57,
        slot: "Crew",
        points: 3,
        unique: true,
        faction: "Rebel Alliance"
      }, {
        name: "Saw Gerrera",
        id: 58,
        slot: "Crew",
        points: 8,
        unique: true,
        faction: "Rebel Alliance"
      }, {
        name: "Seasoned Navigator",
        id: 59,
        slot: "Crew",
        points: 5
      }, {
        name: "Seventh Sister",
        id: 60,
        slot: "Crew",
        points: 12,
        force: 1,
        unique: true,
        faction: "Galactic Empire",
        modifier_func: function(stats) {
          return stats.force += 1;
        }
      }, {
        name: "Tactical Officer",
        id: 61,
        slot: "Crew",
        points: 2,
        restriction_func: function(ship) {
          return __indexOf.call(ship.effectiveStats().actionsred, "Coordinate") >= 0;
        },
        modifier_func: function(stats) {
          if (__indexOf.call(stats.actions, 'Coordinate') < 0) {
            return stats.actions.push('Coordinate');
          }
        }
      }, {
        name: "Tobias Beckett",
        id: 62,
        slot: "Crew",
        points: 2,
        unique: true,
        faction: "Scum and Villainy"
      }, {
        name: "0-0-0",
        id: 63,
        slot: "Crew",
        points: 3,
        unique: true,
        restriction_func: function(ship) {
          var builder, t, thing, things, _ref;
          builder = ship.builder;
          if (builder.faction === "Scum and Villainy") {
            return true;
          }
          _ref = builder.uniques_in_use;
          for (t in _ref) {
            things = _ref[t];
            if (__indexOf.call((function() {
              var _i, _len, _results;
              _results = [];
              for (_i = 0, _len = things.length; _i < _len; _i++) {
                thing = things[_i];
                _results.push(thing.canonical_name.getXWSBaseName());
              }
              return _results;
            })(), 'darthvader') >= 0) {
              return true;
            }
          }
          return false;
        }
      }, {
        name: "Unkar Plutt",
        id: 64,
        slot: "Crew",
        points: 2,
        unique: true,
        faction: "Scum and Villainy"
      }, {
        name: '"Zeb" Orrelios',
        id: 65,
        slot: "Crew",
        points: 1,
        unique: true,
        faction: "Rebel Alliance"
      }, {
        name: "Zuckuss",
        id: 66,
        slot: "Crew",
        points: 3,
        unique: true,
        faction: "Scum and Villainy"
      }, {
        name: "Bomblet Generator",
        id: 67,
        slot: "Device",
        points: 5,
        charge: 2,
        applies_condition: 'Bomblet'.canonicalize(),
        restriction_func: function(ship, upgrade_obj) {
          return ship.hasAnotherUnoccupiedSlotLike(upgrade_obj);
        },
        validation_func: function(ship, upgrade_obj) {
          return upgrade_obj.occupiesAnotherUpgradeSlot();
        },
        also_occupies_upgrades: ["Device"]
      }, {
        name: "Conner Nets",
        id: 68,
        slot: "Device",
        points: 6,
        charge: 1,
        applies_condition: 'Conner Net'.canonicalize()
      }, {
        name: "Proton Bombs",
        id: 69,
        slot: "Device",
        points: 5,
        charge: 2,
        applies_condition: 'Proton Bomb'.canonicalize()
      }, {
        name: "Proximity Mines",
        id: 70,
        slot: "Device",
        points: 6,
        charge: 2,
        applies_condition: 'Proximity Mine'.canonicalize()
      }, {
        name: "Seismic Charges",
        id: 71,
        slot: "Device",
        points: 3,
        charge: 2,
        applies_condition: 'Seismic Charge'.canonicalize()
      }, {
        name: "Heightened Perception",
        id: 72,
        slot: "Force",
        points: 3
      }, {
        name: "Instinctive Aim",
        id: 73,
        slot: "Force",
        points: 2
      }, {
        name: "Supernatural Reflexes",
        id: 74,
        slot: "Force",
        points: 12,
        restriction_func: function(ship) {
          return !((ship.data.large != null) || (ship.data.medium != null));
        }
      }, {
        name: "Sense",
        id: 75,
        slot: "Force",
        points: 6
      }, {
        name: "Agile Gunner",
        id: 76,
        slot: "Gunner",
        points: 10
      }, {
        name: "Bistan",
        id: 77,
        slot: "Gunner",
        points: 14,
        unique: true,
        faction: "Rebel Alliance"
      }, {
        name: "Bossk",
        id: 78,
        slot: "Gunner",
        points: 10,
        unique: true,
        faction: "Scum and Villainy"
      }, {
        name: "BT-1",
        id: 79,
        slot: "Gunner",
        points: 2,
        unique: true,
        restriction_func: function(ship) {
          var builder, t, thing, things, _ref;
          builder = ship.builder;
          if (builder.faction === "Scum and Villainy") {
            return true;
          }
          _ref = builder.uniques_in_use;
          for (t in _ref) {
            things = _ref[t];
            if (__indexOf.call((function() {
              var _i, _len, _results;
              _results = [];
              for (_i = 0, _len = things.length; _i < _len; _i++) {
                thing = things[_i];
                _results.push(thing.canonical_name.getXWSBaseName());
              }
              return _results;
            })(), 'darthvader') >= 0) {
              return true;
            }
          }
          return false;
        }
      }, {
        name: "Dengar",
        id: 80,
        slot: "Gunner",
        points: 6,
        unique: true,
        faction: "Scum and Villainy",
        recurring: true,
        charge: 1
      }, {
        name: "Ezra Bridger",
        id: 81,
        slot: "Gunner",
        points: 18,
        force: 1,
        unique: true,
        faction: "Rebel Alliance",
        modifier_func: function(stats) {
          return stats.force += 1;
        }
      }, {
        name: "Fifth Brother",
        id: 82,
        slot: "Gunner",
        points: 12,
        force: 1,
        unique: true,
        faction: "Galactic Empire",
        modifier_func: function(stats) {
          return stats.force += 1;
        }
      }, {
        name: "Greedo",
        id: 83,
        slot: "Gunner",
        points: 1,
        unique: true,
        faction: "Scum and Villainy",
        charge: 1
      }, {
        name: "Han Solo",
        id: 84,
        slot: "Gunner",
        xws: "hansolo",
        points: 12,
        unique: true,
        faction: "Rebel Alliance"
      }, {
        name: "Han Solo (Scum)",
        id: 85,
        slot: "Gunner",
        xws: "hansolo-gunner",
        points: 4,
        unique: true,
        faction: "Scum and Villainy"
      }, {
        name: "Hotshot Gunner",
        id: 86,
        slot: "Gunner",
        points: 7
      }, {
        name: "Luke Skywalker",
        id: 87,
        slot: "Gunner",
        points: 30,
        force: 1,
        unique: true,
        faction: "Rebel Alliance",
        modifier_func: function(stats) {
          return stats.force += 1;
        }
      }, {
        name: "Skilled Bombardier",
        id: 88,
        slot: "Gunner",
        points: 2
      }, {
        name: "Veteran Tail Gunner",
        id: 89,
        slot: "Gunner",
        points: 4,
        restriction_func: function(ship) {
          return ship.data.attackb != null;
        }
      }, {
        name: "Veteran Turret Gunner",
        id: 90,
        slot: "Gunner",
        points: 8,
        restriction_func: function(ship) {
          return __indexOf.call(ship.effectiveStats().actions, "Rotate Arc") >= 0 || __indexOf.call(ship.effectiveStats().actionsred, "Rotate Arc") >= 0;
        }
      }, {
        name: "Cloaking Device",
        id: 91,
        slot: "Illicit",
        points: 5,
        unique: true,
        charge: 2,
        restriction_func: function(ship) {
          return !(ship.data.large != null);
        }
      }, {
        name: "Contraband Cybernetics",
        id: 92,
        slot: "Illicit",
        points: 5,
        charge: 1
      }, {
        name: "Deadman's Switch",
        id: 93,
        slot: "Illicit",
        points: 2
      }, {
        name: "Feedback Array",
        id: 94,
        slot: "Illicit",
        points: 4
      }, {
        name: "Inertial Dampeners",
        id: 95,
        slot: "Illicit",
        points: 1
      }, {
        name: "Rigged Cargo Chute",
        id: 96,
        slot: "Illicit",
        points: 4,
        charge: 1,
        restriction_func: function(ship) {
          return (ship.data.medium != null) || (ship.data.large != null);
        }
      }, {
        name: "Barrage Rockets",
        id: 97,
        slot: "Missile",
        points: 6,
        attack: 3,
        range: "2-3",
        rangebonus: true,
        charge: 5,
        restriction_func: function(ship, upgrade_obj) {
          return ship.hasAnotherUnoccupiedSlotLike(upgrade_obj);
        },
        validation_func: function(ship, upgrade_obj) {
          return upgrade_obj.occupiesAnotherUpgradeSlot();
        },
        also_occupies_upgrades: ['Missile']
      }, {
        name: "Cluster Missiles",
        id: 98,
        slot: "Missile",
        points: 5,
        attack: 3,
        range: "1-2",
        rangebonus: true,
        charge: 4
      }, {
        name: "Concussion Missiles",
        id: 99,
        slot: "Missile",
        points: 6,
        attack: 3,
        range: "2-3",
        rangebonus: true,
        charge: 3
      }, {
        name: "Homing Missiles",
        id: 100,
        slot: "Missile",
        points: 3,
        attack: 4,
        range: "2-3",
        rangebonus: true,
        charge: 2
      }, {
        name: "Ion Missiles",
        id: 101,
        slot: "Missile",
        points: 4,
        attack: 3,
        range: "2-3",
        rangebonus: true,
        charge: 3
      }, {
        name: "Proton Rockets",
        id: 102,
        slot: "Missile",
        points: 7,
        attackbull: 5,
        range: "1-2",
        rangebonus: true,
        charge: 1
      }, {
        name: "Ablative Plating",
        id: 103,
        slot: "Modification",
        points: 4,
        charge: 2,
        restriction_func: function(ship) {
          return (ship.data.medium != null) || (ship.data.large != null);
        }
      }, {
        name: "Advanced SLAM",
        id: 104,
        slot: "Modification",
        points: 3,
        restriction_func: function(ship) {
          return __indexOf.call(ship.effectiveStats().actions, "Slam") >= 0 || __indexOf.call(ship.effectiveStats().actionsred, "Slam") >= 0;
        }
      }, {
        name: "Afterburners",
        id: 105,
        slot: "Modification",
        points: 8,
        charge: 2,
        restriction_func: function(ship) {
          var _ref, _ref1;
          return !(((_ref = ship.data.large) != null ? _ref : false) || ((_ref1 = ship.data.medium) != null ? _ref1 : false));
        }
      }, {
        name: "Electronic Baffle",
        id: 106,
        slot: "Modification",
        points: 2
      }, {
        name: "Engine Upgrade",
        id: 107,
        slot: "Modification",
        points: '*',
        basepoints: 3,
        variablebase: true,
        restriction_func: function(ship) {
          return __indexOf.call(ship.effectiveStats().actionsred, "Boost") >= 0;
        },
        modifier_func: function(stats) {
          if (__indexOf.call(stats.actions, 'Boost') < 0) {
            return stats.actions.push('Boost');
          }
        }
      }, {
        name: "Munitions Failsafe",
        id: 108,
        slot: "Modification",
        points: 2
      }, {
        name: "Static Discharge Vanes",
        id: 109,
        slot: "Modification",
        points: 6
      }, {
        name: "Tactical Scrambler",
        id: 110,
        slot: "Modification",
        points: 2,
        restriction_func: function(ship) {
          return (ship.data.medium != null) || (ship.data.large != null);
        }
      }, {
        name: "Advanced Sensors",
        id: 111,
        slot: "Sensor",
        points: 8
      }, {
        name: "Collision Detector",
        id: 112,
        slot: "Sensor",
        points: 5,
        charge: 2
      }, {
        name: "Fire-Control System",
        id: 113,
        slot: "Sensor",
        points: 3
      }, {
        name: "Trajectory Simulator",
        id: 114,
        slot: "Sensor",
        points: 3
      }, {
        name: "Composure",
        id: 115,
        slot: "Talent",
        points: 2,
        restriction_func: function(ship) {
          return __indexOf.call(ship.effectiveStats().actions, "Focus") >= 0 || __indexOf.call(ship.effectiveStats().actionsred, "Focus") >= 0;
        }
      }, {
        name: "Crack Shot",
        id: 116,
        slot: "Talent",
        points: 1,
        charge: 1
      }, {
        name: "Daredevil",
        id: 117,
        slot: "Talent",
        points: 3,
        restriction_func: function(ship) {
          return __indexOf.call(ship.effectiveStats().actions, "Boost") >= 0 && !((ship.data.large != null) || (ship.data.medium != null));
        }
      }, {
        name: "Debris Gambit",
        id: 118,
        slot: "Talent",
        points: 2,
        restriction_func: function(ship) {
          return !(ship.data.large != null);
        },
        modifier_func: function(stats) {
          if (__indexOf.call(stats.actionsred, 'Evade') < 0) {
            return stats.actionsred.push('Evade');
          }
        }
      }, {
        name: "Elusive",
        id: 119,
        slot: "Talent",
        points: 3,
        charge: 1,
        restriction_func: function(ship) {
          return ship.data.large == null;
        }
      }, {
        name: "Expert Handling",
        id: 120,
        slot: "Talent",
        points: '*',
        basepoints: 2,
        variablebase: true,
        restriction_func: function(ship) {
          return __indexOf.call(ship.effectiveStats().actionsred, "Barrel Roll") >= 0;
        },
        modifier_func: function(stats) {
          if (__indexOf.call(stats.actions, 'Barrel Roll') < 0) {
            return stats.actions.push('Barrel Roll');
          }
        }
      }, {
        name: "Fearless",
        id: 121,
        slot: "Talent",
        points: 3,
        faction: "Scum and Villainy"
      }, {
        name: "Intimidation",
        id: 122,
        slot: "Talent",
        points: 3
      }, {
        name: "Juke",
        id: 123,
        slot: "Talent",
        points: 4,
        restriction_func: function(ship) {
          return !(ship.data.large != null);
        }
      }, {
        name: "Lone Wolf",
        id: 124,
        slot: "Talent",
        points: 4,
        unique: true,
        recurring: true,
        charge: 1
      }, {
        name: "Marksmanship",
        id: 125,
        slot: "Talent",
        points: 1
      }, {
        name: "Outmaneuver",
        id: 126,
        slot: "Talent",
        points: 6
      }, {
        name: "Predator",
        id: 127,
        slot: "Talent",
        points: 2
      }, {
        name: "Ruthless",
        id: 128,
        slot: "Talent",
        points: 1,
        faction: "Galactic Empire"
      }, {
        name: "Saturation Salvo",
        id: 129,
        slot: "Talent",
        points: 6,
        restriction_func: function(ship) {
          return __indexOf.call(ship.effectiveStats().actions, "Reload") >= 0 || __indexOf.call(ship.effectiveStats().actionsred, "Reload") >= 0;
        }
      }, {
        name: "Selfless",
        id: 130,
        slot: "Talent",
        points: 3,
        faction: "Rebel Alliance"
      }, {
        name: "Squad Leader",
        id: 131,
        slot: "Talent",
        points: 4,
        unique: true,
        modifier_func: function(stats) {
          if (stats.actionsred != null) {
            if (__indexOf.call(stats.actionsred, 'Coordinate') < 0) {
              return stats.actionsred.push('Coordinate');
            }
          }
        }
      }, {
        name: "Swarm Tactics",
        id: 132,
        slot: "Talent",
        points: 3
      }, {
        name: "Trick Shot",
        id: 133,
        slot: "Talent",
        points: 1
      }, {
        name: "Adv. Proton Torpedoes",
        id: 134,
        slot: "Torpedo",
        points: 6,
        attack: 5,
        range: "1",
        rangebonus: true,
        charge: 1
      }, {
        name: "Ion Torpedoes",
        id: 135,
        slot: "Torpedo",
        points: 6,
        attack: 4,
        range: "2-3",
        rangebonus: true,
        charge: 2
      }, {
        name: "Proton Torpedoes",
        id: 136,
        slot: "Torpedo",
        points: 9,
        attack: 4,
        range: "2-3",
        rangebonus: true,
        charge: 2
      }, {
        name: "Dorsal Turret",
        id: 137,
        slot: "Turret",
        points: 4,
        attackt: 2,
        range: "1-2",
        modifier_func: function(stats) {
          if (__indexOf.call(stats.actions, 'Rotate Arc') < 0) {
            return stats.actions.push('Rotate Arc');
          }
        }
      }, {
        name: "Ion Cannon Turret",
        id: 138,
        slot: "Turret",
        points: 6,
        attackt: 3,
        range: "1-2",
        modifier_func: function(stats) {
          if (__indexOf.call(stats.actions, 'Rotate Arc') < 0) {
            return stats.actions.push('Rotate Arc');
          }
        }
      }, {
        name: "Os-1 Arsenal Loadout",
        id: 139,
        points: 0,
        slot: "Configuration",
        ship: "Alpha-Class Star Wing",
        confersAddons: [
          {
            type: exportObj.Upgrade,
            slot: "Torpedo"
          }, {
            type: exportObj.Upgrade,
            slot: "Missile"
          }
        ]
      }, {
        name: "Pivot Wing",
        id: 140,
        points: 0,
        slot: "Configuration",
        ship: "U-Wing"
      }, {
        name: "Pivot Wing (Open)",
        id: 141,
        points: 0,
        skip: true
      }, {
        name: "Servomotor S-Foils",
        id: 142,
        points: 0,
        slot: "Configuration",
        ship: "X-Wing"
      }, {
        name: "Blank",
        id: 143,
        skip: true
      }, {
        name: "Xg-1 Assault Configuration",
        id: 144,
        points: 0,
        slot: "Configuration",
        ship: "Alpha-Class Star Wing",
        confersAddons: [
          {
            type: exportObj.Upgrade,
            slot: "Cannon"
          }
        ]
      }, {
        name: "L3-37's Programming",
        id: 145,
        skip: true,
        points: 0,
        slot: "Configuration",
        faction: "Scum and Villainy"
      }, {
        name: "Andrasta",
        id: 146,
        slot: "Title",
        points: 6,
        unique: true,
        faction: "Scum and Villainy",
        ship: "Firespray-31",
        confersAddons: [
          {
            type: exportObj.Upgrade,
            slot: "Device"
          }
        ],
        modifier_func: function(stats) {
          if (__indexOf.call(stats.actions, 'Reload') < 0) {
            return stats.actions.push('Reload');
          }
        }
      }, {
        name: "Dauntless",
        id: 147,
        slot: "Title",
        points: 6,
        unique: true,
        faction: "Galactic Empire",
        ship: "VT-49 Decimator"
      }, {
        name: "Ghost",
        id: 148,
        slot: "Title",
        unique: true,
        points: 0,
        faction: "Rebel Alliance",
        ship: "VCX-100"
      }, {
        name: "Havoc",
        id: 149,
        slot: "Title",
        points: 4,
        unique: true,
        faction: "Scum and Villainy",
        ship: "Scurrg H-6 Bomber",
        unequips_upgrades: ['Crew'],
        also_occupies_upgrades: ['Crew'],
        confersAddons: [
          {
            type: exportObj.Upgrade,
            slot: 'Sensor'
          }, {
            type: exportObj.Upgrade,
            slot: 'Astromech'
          }
        ]
      }, {
        name: "Hound's Tooth",
        id: 150,
        slot: "Title",
        points: 1,
        unique: true,
        faction: "Scum and Villainy",
        ship: "YV-666"
      }, {
        name: "IG-2000",
        id: 151,
        slot: "Title",
        points: 2,
        faction: "Scum and Villainy",
        ship: "Aggressor"
      }, {
        name: "Lando's Millennium Falcon",
        id: 152,
        slot: "Title",
        points: 6,
        unique: true,
        faction: "Scum and Villainy",
        ship: "YT-1300 (Scum)"
      }, {
        name: "Marauder",
        id: 153,
        slot: "Title",
        points: 3,
        unique: true,
        faction: "Scum and Villainy",
        ship: "Firespray-31",
        confersAddons: [
          {
            type: exportObj.Upgrade,
            slot: "Gunner"
          }
        ]
      }, {
        name: "Millennium Falcon",
        id: 154,
        slot: "Title",
        points: 6,
        unique: true,
        faction: "Rebel Alliance",
        ship: "YT-1300",
        modifier_func: function(stats) {
          if (__indexOf.call(stats.actions, 'Evade') < 0) {
            return stats.actions.push('Evade');
          }
        }
      }, {
        name: "Mist Hunter",
        id: 155,
        slot: "Title",
        points: 2,
        unique: true,
        faction: "Scum and Villainy",
        ship: "G-1A Starfighter",
        modifier_func: function(stats) {
          if (__indexOf.call(stats.actions, 'Barrel Roll') < 0) {
            return stats.actions.push('Barrel Roll');
          }
        },
        confersAddons: [
          {
            type: exportObj.Upgrade,
            slot: "Cannon"
          }
        ]
      }, {
        name: "Moldy Crow",
        id: 156,
        slot: "Title",
        points: 12,
        unique: true,
        ship: "HWK-290"
      }, {
        name: "Outrider",
        id: 157,
        slot: "Title",
        points: 14,
        unique: true,
        faction: "Rebel Alliance",
        ship: "YT-2400"
      }, {
        name: "Phantom (Sheathipede)",
        id: 158,
        skip: true,
        slot: "Title",
        points: 2,
        unique: true,
        faction: "Rebel Alliance",
        ship: "Sheathipede-Class Shuttle"
      }, {
        name: "Punishing One",
        id: 159,
        slot: "Title",
        points: 8,
        unique: true,
        faction: "Scum and Villainy",
        ship: "JumpMaster 5000",
        unequips_upgrades: ['Crew'],
        also_occupies_upgrades: ['Crew'],
        confersAddons: [
          {
            type: exportObj.Upgrade,
            slot: 'Astromech'
          }
        ]
      }, {
        name: "Shadow Caster",
        id: 160,
        slot: "Title",
        points: 6,
        unique: true,
        faction: "Scum and Villainy",
        ship: "Lancer-Class Pursuit Craft"
      }, {
        name: "Slave I",
        id: 161,
        slot: "Title",
        points: 5,
        unique: true,
        faction: "Scum and Villainy",
        ship: "Firespray-31",
        confersAddons: [
          {
            type: exportObj.Upgrade,
            slot: "Torpedo"
          }
        ]
      }, {
        name: "ST-321",
        id: 162,
        slot: "Title",
        points: 6,
        unique: true,
        faction: "Galactic Empire",
        ship: "Lambda-Class Shuttle"
      }, {
        name: "Virago",
        id: 163,
        slot: "Title",
        points: 10,
        unique: true,
        charge: 2,
        ship: "StarViper",
        modifier_func: function(stats) {
          return stats.shields += 1;
        },
        confersAddons: [
          {
            type: exportObj.Upgrade,
            slot: "Modification"
          }
        ]
      }, {
        name: "Hull Upgrade",
        id: 164,
        slot: "Modification",
        points: '*',
        basepoints: 2,
        variableagility: true,
        modifier_func: function(stats) {
          return stats.hull += 1;
        }
      }, {
        name: "Shield Upgrade",
        id: 165,
        slot: "Modification",
        points: '*',
        basepoints: 3,
        variableagility: true,
        modifier_func: function(stats) {
          return stats.shields += 1;
        }
      }, {
        name: "Stealth Device",
        id: 166,
        slot: "Modification",
        points: '*',
        basepoints: 3,
        variableagility: true,
        charge: 1,
        modifier_func: function(stats) {
          return stats.agility += 1;
        }
      }, {
        name: "Phantom",
        id: 167,
        slot: "Title",
        points: 2,
        unique: true,
        faction: "Rebel Alliance",
        ship: ["Attack Shuttle", "Sheathipede-Class Shuttle"]
      }, {
        name: "Hardpoint: Cannon",
        id: 168,
        slot: "Hardpoint",
        points: 0,
        confersAddons: [
          {
            type: exportObj.Upgrade,
            slot: "Cannon"
          }
        ]
      }, {
        name: "Hardpoint: Torpedo",
        id: 169,
        slot: "Hardpoint",
        points: 0,
        confersAddons: [
          {
            type: exportObj.Upgrade,
            slot: "Torpedo"
          }
        ]
      }, {
        name: "Hardpoint: Missile",
        id: 170,
        slot: "Hardpoint",
        points: 0,
        confersAddons: [
          {
            type: exportObj.Upgrade,
            slot: "Missile"
          }
        ]
      }, {
        name: "Black One",
        id: 171,
        slot: "Title",
        charge: 1,
        points: 0,
        faction: "Resistance",
        ship: "T-70 X-Wing",
        modifier_func: function(stats) {
          if (__indexOf.call(stats.actions, 'Slam') < 0) {
            return stats.actions.push('Slam');
          }
        }
      }, {
        name: "Heroic",
        id: 172,
        slot: "Talent",
        points: 0,
        faction: "Resistance"
      }, {
        name: "Rose Tico",
        id: 173,
        slot: "Crew",
        points: 0,
        faction: "Resistance"
      }, {
        name: "Finn",
        id: 174,
        slot: "Gunner",
        points: 0,
        faction: "Resistance"
      }, {
        name: "Integrated S-Foils",
        id: 175,
        slot: "Configuration",
        points: 0,
        faction: "Resistance",
        ship: "T-70 X-Wing"
      }, {
        name: "Integrated S-Foils (Open)",
        id: 176,
        skip: true
      }, {
        name: "Targeting Synchronizer",
        id: 177,
        slot: "Tech",
        points: 0,
        restriction_func: function(ship) {
          return __indexOf.call(ship.effectiveStats().actions, "Lock") >= 0 || __indexOf.call(ship.effectiveStats().actionsred, "Lock") >= 0;
        }
      }, {
        name: "Primed Thrusters",
        id: 178,
        slot: "Tech",
        points: 0
      }, {
        name: "Kylo Ren (Crew)",
        id: 179,
        slot: "Crew",
        points: 0,
        force: 1,
        faction: "First Order",
        applies_condition: 'I\'ll Show You the Dark Side'.canonicalize(),
        modifier_func: function(stats) {
          return stats.force += 1;
        }
      }, {
        name: "General Hux",
        id: 180,
        slot: "Crew",
        points: 0,
        faction: "First Order"
      }, {
        name: "Fanatical",
        id: 181,
        slot: "Talent",
        points: 0,
        faction: "First Order"
      }, {
        name: "Special Forces Gunner",
        id: 182,
        slot: "Gunner",
        points: 0,
        faction: "First Order"
      }, {
        name: "Captain Phasma",
        id: 183,
        slot: "Crew",
        points: 0,
        faction: "First Order"
      }, {
        name: "Supreme Leader Snoke",
        id: 184,
        slot: "Crew",
        points: 0,
        force: 1,
        faction: "First Order",
        restriction_func: function(ship, upgrade_obj) {
          return ship.hasAnotherUnoccupiedSlotLike(upgrade_obj);
        },
        validation_func: function(ship, upgrade_obj) {
          return upgrade_obj.occupiesAnotherUpgradeSlot();
        },
        also_occupies_upgrades: ["Crew"],
        modifier_func: function(stats) {
          return stats.force += 1;
        }
      }, {
        name: "Hyperspace Tracking Data",
        id: 185,
        slot: "Tech",
        points: 0
      }, {
        name: "Advanced Optics",
        id: 186,
        slot: "Tech",
        points: 0
      }, {
        name: "Rey (Gunner)",
        id: 187,
        slot: "Gunner",
        points: 0,
        force: 1,
        faction: "Resistance",
        modifier_func: function(stats) {
          return stats.force += 1;
        }
      }
    ],
    conditionsById: [
      {
        name: 'Zero Condition',
        id: 0
      }, {
        name: 'Suppressive Fire',
        id: 1,
        unique: true
      }, {
        name: 'Hunted',
        id: 2,
        unique: true
      }, {
        name: 'Listening Device',
        id: 3,
        unique: true
      }, {
        name: 'Optimized Prototype',
        id: 4,
        unique: true
      }, {
        name: 'I\'ll Show You the Dark Side',
        id: 5,
        unique: true
      }, {
        name: 'Proton Bomb',
        id: 6
      }, {
        name: 'Seismic Charge',
        id: 7
      }, {
        name: 'Bomblet',
        id: 8
      }, {
        name: 'Loose Cargo',
        id: 9
      }, {
        name: 'Conner Net',
        id: 10
      }, {
        name: 'Proximity Mine',
        id: 11
      }
    ],
    modificationsById: [],
    titlesById: []
  };
};

exportObj.setupCardData = function(basic_cards, pilot_translations, upgrade_translations, condition_translations, modification_translations, title_translations) {
  var card, cards, condition, condition_data, condition_name, e, expansion, field, i, modification, modification_data, modification_name, name, pilot, pilot_data, pilot_name, ship_data, ship_name, source, title, title_data, title_name, translation, translations, upgrade, upgrade_data, upgrade_name, _base, _base1, _base2, _base3, _base4, _base5, _base6, _base7, _base8, _base9, _i, _j, _k, _l, _len, _len1, _len10, _len11, _len12, _len13, _len14, _len15, _len2, _len3, _len4, _len5, _len6, _len7, _len8, _len9, _m, _n, _name, _name1, _name2, _name3, _name4, _name5, _name6, _name7, _name8, _name9, _o, _p, _q, _r, _ref, _ref1, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref16, _ref17, _ref18, _ref19, _ref2, _ref20, _ref21, _ref22, _ref23, _ref24, _ref25, _ref26, _ref27, _ref28, _ref29, _ref3, _ref30, _ref31, _ref32, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _s, _t, _u, _v, _w, _x;
  _ref = basic_cards.pilotsById;
  for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
    pilot_data = _ref[i];
    if (pilot_data.id !== i) {
      throw new Error("ID mismatch: pilot at index " + i + " has ID " + pilot_data.id);
    }
  }
  _ref1 = basic_cards.upgradesById;
  for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
    upgrade_data = _ref1[i];
    if (upgrade_data.id !== i) {
      throw new Error("ID mismatch: upgrade at index " + i + " has ID " + upgrade_data.id);
    }
  }
  _ref2 = basic_cards.titlesById;
  for (i = _k = 0, _len2 = _ref2.length; _k < _len2; i = ++_k) {
    title_data = _ref2[i];
    if (title_data.id !== i) {
      throw new Error("ID mismatch: title at index " + i + " has ID " + title_data.id);
    }
  }
  _ref3 = basic_cards.modificationsById;
  for (i = _l = 0, _len3 = _ref3.length; _l < _len3; i = ++_l) {
    modification_data = _ref3[i];
    if (modification_data.id !== i) {
      throw new Error("ID mismatch: modification at index " + i + " has ID " + modification_data.id);
    }
  }
  _ref4 = basic_cards.conditionsById;
  for (i = _m = 0, _len4 = _ref4.length; _m < _len4; i = ++_m) {
    condition_data = _ref4[i];
    if (condition_data.id !== i) {
      throw new Error("ID mismatch: condition at index " + i + " has ID " + condition_data.id);
    }
  }
  exportObj.pilots = {};
  _ref5 = basic_cards.pilotsById;
  for (_n = 0, _len5 = _ref5.length; _n < _len5; _n++) {
    pilot_data = _ref5[_n];
    if (pilot_data.skip == null) {
      pilot_data.sources = [];
      pilot_data.english_name = pilot_data.name;
      pilot_data.english_ship = pilot_data.ship;
      if (pilot_data.canonical_name == null) {
        pilot_data.canonical_name = pilot_data.english_name.canonicalize();
      }
      exportObj.pilots[pilot_data.name] = pilot_data;
    }
  }
  for (pilot_name in pilot_translations) {
    translations = pilot_translations[pilot_name];
    for (field in translations) {
      translation = translations[field];
      try {
        exportObj.pilots[pilot_name][field] = translation;
      } catch (_error) {
        e = _error;
        console.error("Cannot find translation for attribute " + field + " for pilot " + pilot_name);
        throw e;
      }
    }
  }
  exportObj.upgrades = {};
  _ref6 = basic_cards.upgradesById;
  for (_o = 0, _len6 = _ref6.length; _o < _len6; _o++) {
    upgrade_data = _ref6[_o];
    if (upgrade_data.skip == null) {
      upgrade_data.sources = [];
      upgrade_data.english_name = upgrade_data.name;
      if (upgrade_data.canonical_name == null) {
        upgrade_data.canonical_name = upgrade_data.english_name.canonicalize();
      }
      exportObj.upgrades[upgrade_data.name] = upgrade_data;
    }
  }
  for (upgrade_name in upgrade_translations) {
    translations = upgrade_translations[upgrade_name];
    for (field in translations) {
      translation = translations[field];
      try {
        exportObj.upgrades[upgrade_name][field] = translation;
      } catch (_error) {
        e = _error;
        console.error("Cannot find translation for attribute " + field + " for upgrade " + upgrade_name);
        throw e;
      }
    }
  }
  exportObj.modifications = {};
  _ref7 = basic_cards.modificationsById;
  for (_p = 0, _len7 = _ref7.length; _p < _len7; _p++) {
    modification_data = _ref7[_p];
    if (modification_data.skip == null) {
      modification_data.sources = [];
      modification_data.english_name = modification_data.name;
      if (modification_data.canonical_name == null) {
        modification_data.canonical_name = modification_data.english_name.canonicalize();
      }
      exportObj.modifications[modification_data.name] = modification_data;
    }
  }
  for (modification_name in modification_translations) {
    translations = modification_translations[modification_name];
    for (field in translations) {
      translation = translations[field];
      try {
        exportObj.modifications[modification_name][field] = translation;
      } catch (_error) {
        e = _error;
        console.error("Cannot find translation for attribute " + field + " for modification " + modification_name);
        throw e;
      }
    }
  }
  exportObj.titles = {};
  _ref8 = basic_cards.titlesById;
  for (_q = 0, _len8 = _ref8.length; _q < _len8; _q++) {
    title_data = _ref8[_q];
    if (title_data.skip == null) {
      title_data.sources = [];
      title_data.english_name = title_data.name;
      if (title_data.canonical_name == null) {
        title_data.canonical_name = title_data.english_name.canonicalize();
      }
      exportObj.titles[title_data.name] = title_data;
    }
  }
  for (title_name in title_translations) {
    translations = title_translations[title_name];
    for (field in translations) {
      translation = translations[field];
      try {
        exportObj.titles[title_name][field] = translation;
      } catch (_error) {
        e = _error;
        console.error("Cannot find translation for attribute " + field + " for title " + title_name);
        throw e;
      }
    }
  }
  exportObj.conditions = {};
  _ref9 = basic_cards.conditionsById;
  for (_r = 0, _len9 = _ref9.length; _r < _len9; _r++) {
    condition_data = _ref9[_r];
    if (condition_data.skip == null) {
      condition_data.sources = [];
      condition_data.english_name = condition_data.name;
      if (condition_data.canonical_name == null) {
        condition_data.canonical_name = condition_data.english_name.canonicalize();
      }
      exportObj.conditions[condition_data.name] = condition_data;
    }
  }
  for (condition_name in condition_translations) {
    translations = condition_translations[condition_name];
    for (field in translations) {
      translation = translations[field];
      try {
        exportObj.conditions[condition_name][field] = translation;
      } catch (_error) {
        e = _error;
        console.error("Cannot find translation for attribute " + field + " for condition " + condition_name);
        throw e;
      }
    }
  }
  _ref10 = basic_cards.ships;
  for (ship_name in _ref10) {
    ship_data = _ref10[ship_name];
    if (ship_data.english_name == null) {
      ship_data.english_name = ship_name;
    }
    if (ship_data.canonical_name == null) {
      ship_data.canonical_name = ship_data.english_name.canonicalize();
    }
    ship_data.sources = [];
  }
  _ref11 = exportObj.manifestByExpansion;
  for (expansion in _ref11) {
    cards = _ref11[expansion];
    for (_s = 0, _len10 = cards.length; _s < _len10; _s++) {
      card = cards[_s];
      if (card.skipForSource) {
        continue;
      }
      try {
        switch (card.type) {
          case 'pilot':
            exportObj.pilots[card.name].sources.push(expansion);
            break;
          case 'upgrade':
            exportObj.upgrades[card.name].sources.push(expansion);
            break;
          case 'modification':
            exportObj.modifications[card.name].sources.push(expansion);
            break;
          case 'title':
            exportObj.titles[card.name].sources.push(expansion);
            break;
          case 'ship':
            exportObj.ships[card.name].sources.push(expansion);
            break;
          default:
            throw new Error("Unexpected card type " + card.type + " for card " + card.name + " of " + expansion);
        }
      } catch (_error) {
        e = _error;
        console.error("Error adding card " + card.name + " (" + card.type + ") from " + expansion);
      }
    }
  }
  _ref12 = exportObj.pilots;
  for (name in _ref12) {
    card = _ref12[name];
    card.sources = card.sources.sort();
  }
  _ref13 = exportObj.upgrades;
  for (name in _ref13) {
    card = _ref13[name];
    card.sources = card.sources.sort();
  }
  _ref14 = exportObj.modifications;
  for (name in _ref14) {
    card = _ref14[name];
    card.sources = card.sources.sort();
  }
  _ref15 = exportObj.titles;
  for (name in _ref15) {
    card = _ref15[name];
    card.sources = card.sources.sort();
  }
  exportObj.expansions = {};
  exportObj.pilotsById = {};
  exportObj.pilotsByLocalizedName = {};
  _ref16 = exportObj.pilots;
  for (pilot_name in _ref16) {
    pilot = _ref16[pilot_name];
    exportObj.fixIcons(pilot);
    exportObj.pilotsById[pilot.id] = pilot;
    exportObj.pilotsByLocalizedName[pilot.name] = pilot;
    _ref17 = pilot.sources;
    for (_t = 0, _len11 = _ref17.length; _t < _len11; _t++) {
      source = _ref17[_t];
      if (!(source in exportObj.expansions)) {
        exportObj.expansions[source] = 1;
      }
    }
  }
  if (Object.keys(exportObj.pilotsById).length !== Object.keys(exportObj.pilots).length) {
    throw new Error("At least one pilot shares an ID with another");
  }
  exportObj.pilotsByFactionCanonicalName = {};
  exportObj.pilotsByUniqueName = {};
  _ref18 = exportObj.pilots;
  for (pilot_name in _ref18) {
    pilot = _ref18[pilot_name];
    ((_base = ((_base1 = exportObj.pilotsByFactionCanonicalName)[_name1 = pilot.faction] != null ? _base1[_name1] : _base1[_name1] = {}))[_name = pilot.canonical_name] != null ? _base[_name] : _base[_name] = []).push(pilot);
    ((_base2 = exportObj.pilotsByUniqueName)[_name2 = pilot.canonical_name.getXWSBaseName()] != null ? _base2[_name2] : _base2[_name2] = []).push(pilot);
  }
  exportObj.pilotsByFactionXWS = {};
  _ref19 = exportObj.pilots;
  for (pilot_name in _ref19) {
    pilot = _ref19[pilot_name];
    ((_base3 = ((_base4 = exportObj.pilotsByFactionXWS)[_name4 = pilot.faction] != null ? _base4[_name4] : _base4[_name4] = {}))[_name3 = pilot.xws] != null ? _base3[_name3] : _base3[_name3] = []).push(pilot);
  }
  exportObj.upgradesById = {};
  exportObj.upgradesByLocalizedName = {};
  _ref20 = exportObj.upgrades;
  for (upgrade_name in _ref20) {
    upgrade = _ref20[upgrade_name];
    exportObj.fixIcons(upgrade);
    exportObj.upgradesById[upgrade.id] = upgrade;
    exportObj.upgradesByLocalizedName[upgrade.name] = upgrade;
    _ref21 = upgrade.sources;
    for (_u = 0, _len12 = _ref21.length; _u < _len12; _u++) {
      source = _ref21[_u];
      if (!(source in exportObj.expansions)) {
        exportObj.expansions[source] = 1;
      }
    }
  }
  if (Object.keys(exportObj.upgradesById).length !== Object.keys(exportObj.upgrades).length) {
    throw new Error("At least one upgrade shares an ID with another");
  }
  exportObj.upgradesBySlotCanonicalName = {};
  exportObj.upgradesBySlotXWSName = {};
  exportObj.upgradesBySlotUniqueName = {};
  _ref22 = exportObj.upgrades;
  for (upgrade_name in _ref22) {
    upgrade = _ref22[upgrade_name];
    ((_base5 = exportObj.upgradesBySlotCanonicalName)[_name5 = upgrade.slot] != null ? _base5[_name5] : _base5[_name5] = {})[upgrade.canonical_name] = upgrade;
    ((_base6 = exportObj.upgradesBySlotXWSName)[_name6 = upgrade.slot] != null ? _base6[_name6] : _base6[_name6] = {})[upgrade.xws] = upgrade;
    ((_base7 = exportObj.upgradesBySlotUniqueName)[_name7 = upgrade.slot] != null ? _base7[_name7] : _base7[_name7] = {})[upgrade.canonical_name.getXWSBaseName()] = upgrade;
  }
  exportObj.modificationsById = {};
  exportObj.modificationsByLocalizedName = {};
  _ref23 = exportObj.modifications;
  for (modification_name in _ref23) {
    modification = _ref23[modification_name];
    exportObj.fixIcons(modification);
    if (modification.huge != null) {
      if (modification.restriction_func == null) {
        modification.restriction_func = exportObj.hugeOnly;
      }
    } else if (modification.restriction_func == null) {
      modification.restriction_func = function(ship) {
        var _ref24;
        return !((_ref24 = ship.data.huge) != null ? _ref24 : false);
      };
    }
    exportObj.modificationsById[modification.id] = modification;
    exportObj.modificationsByLocalizedName[modification.name] = modification;
    _ref24 = modification.sources;
    for (_v = 0, _len13 = _ref24.length; _v < _len13; _v++) {
      source = _ref24[_v];
      if (!(source in exportObj.expansions)) {
        exportObj.expansions[source] = 1;
      }
    }
  }
  if (Object.keys(exportObj.modificationsById).length !== Object.keys(exportObj.modifications).length) {
    throw new Error("At least one modification shares an ID with another");
  }
  exportObj.modificationsByCanonicalName = {};
  exportObj.modificationsByUniqueName = {};
  _ref25 = exportObj.modifications;
  for (modification_name in _ref25) {
    modification = _ref25[modification_name];
    (exportObj.modificationsByCanonicalName != null ? exportObj.modificationsByCanonicalName : exportObj.modificationsByCanonicalName = {})[modification.canonical_name] = modification;
    (exportObj.modificationsByUniqueName != null ? exportObj.modificationsByUniqueName : exportObj.modificationsByUniqueName = {})[modification.canonical_name.getXWSBaseName()] = modification;
  }
  exportObj.titlesById = {};
  exportObj.titlesByLocalizedName = {};
  _ref26 = exportObj.titles;
  for (title_name in _ref26) {
    title = _ref26[title_name];
    exportObj.fixIcons(title);
    exportObj.titlesById[title.id] = title;
    exportObj.titlesByLocalizedName[title.name] = title;
    _ref27 = title.sources;
    for (_w = 0, _len14 = _ref27.length; _w < _len14; _w++) {
      source = _ref27[_w];
      if (!(source in exportObj.expansions)) {
        exportObj.expansions[source] = 1;
      }
    }
  }
  if (Object.keys(exportObj.titlesById).length !== Object.keys(exportObj.titles).length) {
    throw new Error("At least one title shares an ID with another");
  }
  exportObj.conditionsById = {};
  _ref28 = exportObj.conditions;
  for (condition_name in _ref28) {
    condition = _ref28[condition_name];
    exportObj.fixIcons(condition);
    exportObj.conditionsById[condition.id] = condition;
    _ref29 = condition.sources;
    for (_x = 0, _len15 = _ref29.length; _x < _len15; _x++) {
      source = _ref29[_x];
      if (!(source in exportObj.expansions)) {
        exportObj.expansions[source] = 1;
      }
    }
  }
  if (Object.keys(exportObj.conditionsById).length !== Object.keys(exportObj.conditions).length) {
    throw new Error("At least one condition shares an ID with another");
  }
  exportObj.titlesByShip = {};
  _ref30 = exportObj.titles;
  for (title_name in _ref30) {
    title = _ref30[title_name];
    if (!(title.ship in exportObj.titlesByShip)) {
      exportObj.titlesByShip[title.ship] = [];
    }
    exportObj.titlesByShip[title.ship].push(title);
  }
  exportObj.titlesByCanonicalName = {};
  exportObj.titlesByUniqueName = {};
  _ref31 = exportObj.titles;
  for (title_name in _ref31) {
    title = _ref31[title_name];
    if (title.canonical_name === '"Heavy Scyk" Interceptor'.canonicalize()) {
      ((_base8 = (exportObj.titlesByCanonicalName != null ? exportObj.titlesByCanonicalName : exportObj.titlesByCanonicalName = {}))[_name8 = title.canonical_name] != null ? _base8[_name8] : _base8[_name8] = []).push(title);
      ((_base9 = (exportObj.titlesByUniqueName != null ? exportObj.titlesByUniqueName : exportObj.titlesByUniqueName = {}))[_name9 = title.canonical_name.getXWSBaseName()] != null ? _base9[_name9] : _base9[_name9] = []).push(title);
    } else {
      (exportObj.titlesByCanonicalName != null ? exportObj.titlesByCanonicalName : exportObj.titlesByCanonicalName = {})[title.canonical_name] = title;
      (exportObj.titlesByUniqueName != null ? exportObj.titlesByUniqueName : exportObj.titlesByUniqueName = {})[title.canonical_name.getXWSBaseName()] = title;
    }
  }
  exportObj.conditionsByCanonicalName = {};
  _ref32 = exportObj.conditions;
  for (condition_name in _ref32) {
    condition = _ref32[condition_name];
    (exportObj.conditionsByCanonicalName != null ? exportObj.conditionsByCanonicalName : exportObj.conditionsByCanonicalName = {})[condition.canonical_name] = condition;
  }
  return exportObj.expansions = Object.keys(exportObj.expansions).sort();
};

exportObj.fixIcons = function(data) {
  if (data.text != null) {
    return data.text = data.text.replace(/%ASTROMECH%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-astromech"></i>').replace(/%BULLSEYEARC%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-bullseyearc"></i>').replace(/%GUNNER%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-gunner"></i>').replace(/%SINGLETURRETARC%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-singleturretarc"></i>').replace(/%FRONTARC%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-frontarc"></i>').replace(/%REARARC%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-reararc"></i>').replace(/%ROTATEARC%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-rotatearc"></i>').replace(/%FULLFRONTARC%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-fullfrontarc"></i>').replace(/%FULLREARARC%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-fullreararc"></i>').replace(/%DEVICE%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-device"></i>').replace(/%MODIFICATION%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-modification"></i>').replace(/%RELOAD%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-reload"></i>').replace(/%CONFIG%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-config"></i>').replace(/%FORCE%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-forcecharge"></i>').replace(/%CHARGE%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-charge"></i>').replace(/%CALCULATE%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-calculate"></i>').replace(/%BANKLEFT%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-bankleft"></i>').replace(/%BANKRIGHT%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-bankright"></i>').replace(/%BARRELROLL%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-barrelroll"></i>').replace(/%BOMB%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-bomb"></i>').replace(/%BOOST%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-boost"></i>').replace(/%CANNON%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-cannon"></i>').replace(/%CARGO%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-cargo"></i>').replace(/%CLOAK%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-cloak"></i>').replace(/%COORDINATE%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-coordinate"></i>').replace(/%CRIT%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-crit"></i>').replace(/%CREW%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-crew"></i>').replace(/%DUALCARD%/g, '<span class="card-restriction">Dual card.</span>').replace(/%ELITE%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-elite"></i>').replace(/%EVADE%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-evade"></i>').replace(/%FOCUS%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-focus"></i>').replace(/%HARDPOINT%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-hardpoint"></i>').replace(/%HIT%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-hit"></i>').replace(/%ILLICIT%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-illicit"></i>').replace(/%JAM%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-jam"></i>').replace(/%KTURN%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-kturn"></i>').replace(/%MISSILE%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-missile"></i>').replace(/%RECOVER%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-recover"></i>').replace(/%REINFORCE%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-reinforce"></i>').replace(/%SALVAGEDASTROMECH%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-salvagedastromech"></i>').replace(/%SLAM%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-slam"></i>').replace(/%SLOOPLEFT%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-sloopleft"></i>').replace(/%SLOOPRIGHT%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-sloopright"></i>').replace(/%STRAIGHT%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-straight"></i>').replace(/%STOP%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-stop"></i>').replace(/%SENSOR%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-sensor"></i>').replace(/%LOCK%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-lock"></i>').replace(/%TEAM%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-team"></i>').replace(/%TECH%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-tech"></i>').replace(/%TORPEDO%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-torpedo"></i>').replace(/%TROLLLEFT%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-trollleft"></i>').replace(/%TROLLRIGHT%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-trollright"></i>').replace(/%TURNLEFT%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-turnleft"></i>').replace(/%TURNRIGHT%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-turnright"></i>').replace(/%TURRET%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-turret"></i>').replace(/%UTURN%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-kturn"></i>').replace(/%LARGESHIPONLY%/g, '<span class="card-restriction">Large ship only.</span>').replace(/%SMALLSHIPONLY%/g, '<span class="card-restriction">Small ship only.</span>').replace(/%REBELONLY%/g, '<span class="card-restriction">Rebel only.</span>').replace(/%IMPERIALONLY%/g, '<span class="card-restriction">Imperial only.</span>').replace(/%SCUMONLY%/g, '<span class="card-restriction">Scum only.</span>').replace(/%LIMITED%/g, '<span class="card-restriction">Limited.</span>').replace(/%LINEBREAK%/g, '<br /><br />');
  }
};

exportObj.canonicalizeShipNames = function(card_data) {
  var ship_data, ship_name, _ref, _results;
  _ref = card_data.ships;
  _results = [];
  for (ship_name in _ref) {
    ship_data = _ref[ship_name];
    ship_data.english_name = ship_name;
    _results.push(ship_data.canonical_name != null ? ship_data.canonical_name : ship_data.canonical_name = ship_data.english_name.canonicalize());
  }
  return _results;
};

exportObj.renameShip = function(english_name, new_name) {
  exportObj.ships[new_name] = exportObj.ships[english_name];
  exportObj.ships[new_name].name = new_name;
  exportObj.ships[new_name].english_name = english_name;
  return delete exportObj.ships[english_name];
};

exportObj.randomizer = function(faction_name, points) {
  var listcount, shiplistmaster;
  shiplistmaster = exportObj.basicCardData;
  return listcount = 0;
};


/*
    X-Wing Squad Builder 2.0
    Stephen Kim <raithos@gmail.com>
    https://raithos.github.io
    German translation by
    - Patrick Mischke https://github.com/patschke
 */

exportObj = typeof exports !== "undefined" && exports !== null ? exports : this;

if (exportObj.codeToLanguage == null) {
  exportObj.codeToLanguage = {};
}

exportObj.codeToLanguage.de = 'Deutsch';

if (exportObj.translations == null) {
  exportObj.translations = {};
}

exportObj.translations.Deutsch = {
  action: {
    "Barrel Roll": '<i class="xwing-miniatures-font xwing-miniatures-font-barrelroll"></i>',
    "Boost": '<i class="xwing-miniatures-font xwing-miniatures-font-boost"></i>',
    "Evade": '<i class="xwing-miniatures-font xwing-miniatures-font-evade"></i>',
    "Focus": '<i class="xwing-miniatures-font xwing-miniatures-font-focus"></i>',
    "Lock": '<i class="xwing-miniatures-font xwing-miniatures-font-lock"></i>',
    "Reload": '<i class="xwing-miniatures-font xwing-miniatures-font-reload"></i>',
    "Rotate Arc": '<i class="xwing-miniatures-font xwing-miniatures-font-rotatearc"></i>',
    "Reinforce": '<i class="xwing-miniatures-font xwing-miniatures-font-reinforce"></i>',
    "Jam": '<i class="xwing-miniatures-font xwing-miniatures-font-jam"></i>',
    "Calculate": '<i class="xwing-miniatures-font xwing-miniatures-font-calculate"></i>',
    "Coordinate": '<i class="xwing-miniatures-font xwing-miniatures-font-coordinate"></i>',
    "Cloak": '<i class="xwing-miniatures-font xwing-miniatures-font-cloak"></i>',
    "Slam": '<i class="xwing-miniatures-font xwing-miniatures-font-slam"></i>',
    "R> Barrel Roll": '<i class="xwing-miniatures-font xwing-miniatures-font-linked red"></i> <i class="xwing-miniatures-font red xwing-miniatures-font-barrelroll"></i>',
    "R> Focus": '<i class="xwing-miniatures-font xwing-miniatures-font-linked red"></i> <i class="xwing-miniatures-font red xwing-miniatures-font-focus"></i>',
    "R> Lock": '<i class="xwing-miniatures-font xwing-miniatures-font-linked red"></i> <i class="xwing-miniatures-font red xwing-miniatures-font-lock"></i>',
    "> Rotate Arc": '<i class="xwing-miniatures-font xwing-miniatures-font-linked"></i> <i class="xwing-miniatures-font xwing-miniatures-font-rotatearc"></i>',
    "R> Rotate Arc": '<i class="xwing-miniatures-font xwing-miniatures-font-linked red"></i> <i class="xwing-miniatures-font red xwing-miniatures-font-rotatearc"></i>',
    "R> Evade": '<i class="xwing-miniatures-font xwing-miniatures-font-linked red"></i> <i class="xwing-miniatures-font red xwing-miniatures-font-evade"></i>',
    "R> Calculate": '<i class="xwing-miniatures-font xwing-miniatures-font-linked red"></i> <i class="xwing-miniatures-font red xwing-miniatures-font-calculate"></i>'
  },
  sloticon: {
    "Astromech": '<i class="xwing-miniatures-font xwing-miniatures-font-astromech"></i>',
    "Force": '<i class="xwing-miniatures-font xwing-miniatures-font-forcepower"></i>',
    "Bomb": '<i class="xwing-miniatures-font xwing-miniatures-font-bomb"></i>',
    "Cannon": '<i class="xwing-miniatures-font xwing-miniatures-font-cannon"></i>',
    "Crew": '<i class="xwing-miniatures-font xwing-miniatures-font-crew"></i>',
    "Talent": '<i class="xwing-miniatures-font xwing-miniatures-font-talent"></i>',
    "Missile": '<i class="xwing-miniatures-font xwing-miniatures-font-missile"></i>',
    "Sensor": '<i class="xwing-miniatures-font xwing-miniatures-font-sensor"></i>',
    "Torpedo": '<i class="xwing-miniatures-font xwing-miniatures-font-torpedo"></i>',
    "Turret": '<i class="xwing-miniatures-font xwing-miniatures-font-turret"></i>',
    "Illicit": '<i class="xwing-miniatures-font xwing-miniatures-font-illicit"></i>',
    "Configuration": '<i class="xwing-miniatures-font xwing-miniatures-font-configuration"></i>',
    "Modification": '<i class="xwing-miniatures-font xwing-miniatures-font-modification"></i>',
    "Gunner": '<i class="xwing-miniatures-font xwing-miniatures-font-gunner"></i>',
    "Device": '<i class="xwing-miniatures-font xwing-miniatures-font-device"></i>',
    "Tech": '<i class="xwing-miniatures-font xwing-miniatures-font-tech"></i>',
    "Title": '<i class="xwing-miniatures-font xwing-miniatures-font-title"></i>'
  },
  slot: {
    "Astromech": "Astromech",
    "Force": "Macht-Fähigkeit",
    "Bomb": "Bomb",
    "Cannon": "Kanone",
    "Crew": "Mannschaft",
    "Missile": "Rakete",
    "Sensor": "Sensor",
    "Torpedo": "Torpedo",
    "Turret": "Geschütz",
    "Hardpoint": "Bewaffnung",
    "Illicit": "Schmuggelware",
    "Configuration": "Konfiguration",
    "Talent": "Talent",
    "Modification": "Modifikation",
    "Gunner": "Bordschütze",
    "Device": "Vorrichtung",
    "Tech": "Tech",
    "Title": "Titel"
  },
  sources: {
    "Second Edition Core Set": "Grundspiel zweite Edition",
    "Rebel Alliance Conversion Kit": "Konvertierungsset „Rebellenallianz“",
    "Galactic Empire Conversion Kit": "Konvertierungsset „Galaktisches Imperium“",
    "Scum and Villainy Conversion Kit": "Konvertierungsset „Abschaum und Kriminelle“",
    "T-65 X-Wing Expansion Pack": "T-65-X-Flügler Erweiterung",
    "BTL-A4 Y-Wing Expansion Pack": "BTL-A4-Y-Flügler Erweiterung",
    "TIE/ln Fighter Expansion Pack": "TIE/ln-Jäger Erweiterung",
    "TIE Advanced x1 Expansion Pack": "TIE-x1-Turbojäger Erweiterung",
    "Slave 1 Expansion Pack": "Sklave 1 Erweiterung",
    "Fang Fighter Expansion Pack": "Fangjäger Erweiterung",
    "Lando's Millennium Falcon Expansion Pack": "Landos Millennium Falke Erweiterung",
    "Saw's Renegades Expansion Pack": "Saws Rebellenmiliz Erweiterung",
    "TIE Reaper Expansion Pack": "TIE-Schnitter Erweiterung"
  },
  ui: {
    shipSelectorPlaceholder: "Wähle ein Schiff",
    pilotSelectorPlaceholder: "Wähle einen Piloten",
    upgradePlaceholder: function(translator, language, slot) {
      return "Keine " + (translator(language, 'slot', slot)) + " Aufwertungskarte";
    },
    modificationPlaceholder: "Keine Modifikation",
    titlePlaceholder: "Kein Titel",
    upgradeHeader: function(translator, language, slot) {
      return "" + (translator(language, 'slot', slot)) + " Aufwertungskarte";
    },
    unreleased: "unveröffentlicht",
    epic: "episch",
    limited: "limitiert"
  },
  byCSSSelector: {
    '.unreleased-content-used .translated': 'Diese Staffel verwendet nicht veröffentlicheten Inhalt!',
    '.collection-invalid .translated': 'Du kannst diese Staffel nicht mit deiner Sammlung aufstellen!',
    '.game-type-selector option[value="standard"]': 'Standard',
    '.game-type-selector option[value="custom"]': 'Benutzerdefiniert',
    '.game-type-selector option[value="Second Edition"]': 'Zweite Edition',
    '.game-type-selector option[value="epic"]': 'Episch',
    '.game-type-selector option[value="team-epic"]': 'Team Episch',
    '.select2-choice': '<span>Typ (nach Namen)</span><abbr class="select2-search-choice-close"></abbr>   <div><b></b></div></a>',
    '.xwing-card-browser option[value="name"]': 'Name',
    '.xwing-card-browser option[value="source"]': 'Quelle',
    '.xwing-card-browser option[value="type-by-points"]': 'Typ (nach Punkten)',
    '.xwing-card-browser option[value="type-by-name"]': 'Typ (nach Namen)',
    '.xwing-card-browser .translate.select-a-card': 'Wähle eine Karte von der Liste auf der linken Seite.',
    '.xwing-card-browser .translate.sort-cards-by': 'Sortiere Karten nach',
    '.info-well .info-ship td.info-header': 'Schiff',
    '.info-well .info-skill td.info-header': 'Initiative',
    '.info-well .info-actions td.info-header': 'Aktionen',
    '.info-well .info-upgrades td.info-header': 'Aufwertungskarten',
    '.info-well .info-range td.info-header': 'Reichweite',
    '.clear-squad': 'Neue Staffel',
    '.save-list': 'Speichern',
    '.save-list-as': 'Speichern unter…',
    '.delete-list': 'Löschen',
    '.backend-list-my-squads': 'Staffel laden',
    '.delete-squad': 'Löschen',
    '.delete-squad': 'Laden',
    '.show-standard-squads': 'Standard',
    '.show-epic-squads': 'Episch',
    '.show-team-epic-squads': 'Team Episch',
    '.show-all-squads': 'Alle',
    '.view-as-text': '<span class="hidden-phone"><i class="fa fa-print"></i>&nbsp;Drucken/Als </span>Text ansehen',
    '.randomize': 'Zufall!',
    '.randomize-options': 'Zufallsgenerator Optionen…',
    '.notes-container > span': 'Staffel Notizen',
    '.choose-obstacles': 'Hindernisse wählen',
    '.from-xws': 'Importieren aus XWS-Datei (Beta)',
    '.to-xws': 'Exporitieren als XWS-Datei (Beta)',
    '.discard': 'Änderungen verwerfen',
    '.login-help': 'Was ist OAuth?',
    '.oauth-explanation': "<p><a href=\"http://de.wikipedia.org/wiki/OAuth\" target=\"_blank\">OAuth</a> ist ein Authentifizierungsservice, der es dir erlaubt dich auf Webseiten anzumelden, ohne einen Nutzerkonto anlegen zu müssen. Stattdessen wählst du einen Anbieter, bei dem du bereits eine Nutzerkonto hast (z.B. Google oder Facebook), und dieser bestätigt deine Identität. Auf diese Weise kann YASB dich beim nächsten Besuch wiedererkennen. </p>\n<p>Das beste hieran ist, dass du dir nicht ständig neue Nutzernamen und Passwörter überlegen musst. Keine Sorge, YASB sammelt keine persönlichen Daten von diesen Anbietern über dich. Teilweise kann ich nicht verhindern, dass ein Minimum an persönlichen Daten übertragen wird, diese werden ignoriert. Alles was gespeichert wird ist eine Identifikationsnummer, anhand der du beim nächsten Besuch wiedererkannt wirst - und die zu dieser ID gehörenden Staffellisten natürlich.</p>\n<p>Um mehr zu erfahren, schau dir <a href=\"http://hueniverse.com/oauth/guide/intro/\" target=\"_blank\">diese Einführung in OAuth (englisch)</a> an.</p>",
    '.login-in-progress': "<em>Die OAuth Anmeldung ist in Arbeit. Bitte beende die Anmeldung bei angegebenen Anbierter über das soeben erstellte Fenster. </em>",
    '.bbcode-list': 'Kopiere den BBCode und füge ihn im Forum ein.<textarea></textarea><button class="btn btn-copy">Kopieren</button>',
    '.html-list': '<textarea></textarea><button class="btn btn-copy">Kopieren</button>',
    '.vertical-space-checkbox': "Lasse beim Drucken Platz für Schadens-/Aufwertungskarten <input type=\"checkbox\" class=\"toggle-vertical-space\" />",
    '.color-print-checkbox': "Farbig drucken <input type=\"checkbox\" class=\"toggle-color-print\" checked=\"checked\" />",
    '.print-list': '<i class="fa fa-print"></i>&nbsp;Drucken',
    '.select-simple-view': 'Einfach',
    '.select-fancy-view': 'Schick',
    '.close-print-dialog': 'Schließen',
    '.do-randomize': 'Auswürfeln!',
    '#browserTab': 'Kartendatenbank',
    '#aboutTab': 'Impressum',
    '.choose-obstacles': 'Wähle Hindernisse',
    '.choose-obstacles-description': 'Wähle bis zu drei Hindernisse, die im Link für externe Programme eingebunden werden. (Dies ist eine Beta-Funktion, aktuell ist es nicht möglich die gewählten Hindernisse im Ausdruck anzuzeigen.)',
    '.coreasteroid0-select': 'Grundspiel Asteroid 0',
    '.coreasteroid1-select': 'Grundspiel Asteroid 1',
    '.coreasteroid2-select': 'Grundspiel Asteroid 2',
    '.coreasteroid3-select': 'Grundspiel Asteroid 3',
    '.coreasteroid4-select': 'Grundspiel Asteroid 4',
    '.coreasteroid5-select': 'Grundspiel Asteroid 5',
    '.yt2400debris0-select': 'YT2400 Trümmerwolke 0',
    '.yt2400debris1-select': 'YT2400 Trümmerwolke 1',
    '.yt2400debris2-select': 'YT2400 Trümmerwolke 2',
    '.vt49decimatordebris0-select': 'VT49 Trümmerwolke 0',
    '.vt49decimatordebris1-select': 'VT49 Trümmerwolke 1',
    '.vt49decimatordebris2-select': 'VT49 Trümmerwolke 2',
    '.core2asteroid0-select': 'Erwachen der Macht Asteroid 0',
    '.core2asteroid1-select': 'Erwachen der Macht Asteroid 1',
    '.core2asteroid2-select': 'Erwachen der Macht Asteroid 2',
    '.core2asteroid3-select': 'Erwachen der Macht Asteroid 3',
    '.core2asteroid4-select': 'Erwachen der Macht Asteroid 4',
    '.core2asteroid5-select': 'Erwachen der Macht Asteroid 5',
    '.collection': '<i class="fa fa-folder-open hidden-phone hidden-tabler"></i>&nbsp;Deine Sammlung',
    '.checkbox-check-collection': 'Überprüfe Staffeln auf Verfügbarkeit <input class="check-collection" type="checkbox">'
  },
  singular: {
    'pilots': 'Pilot',
    'modifications': 'Modifikation',
    'titles': 'Titel'
  },
  types: {
    'Pilot': 'Pilot',
    'Modification': 'Modifikation',
    'Title': 'Titel'
  }
};

if (exportObj.cardLoaders == null) {
  exportObj.cardLoaders = {};
}

exportObj.cardLoaders.Deutsch = function() {
  var basic_cards, condition_translations, modification_translations, pilot_translations, title_translations, upgrade_translations;
  exportObj.cardLanguage = 'Deutsch';
  basic_cards = exportObj.basicCardData();
  exportObj.canonicalizeShipNames(basic_cards);
  exportObj.ships = basic_cards.ships;
  exportObj.renameShip('YT-1300', 'Modifizierter leichter YT-1300-Frachter');
  exportObj.renameShip('StarViper', 'Angriffsplattform der Sternenviper-Klasse');
  exportObj.renameShip('Scurrg H-6 Bomber', 'Scurrg-H-6-Bomber');
  exportObj.renameShip('YT-2400', 'Leichter YT-2400-Frachter');
  exportObj.renameShip('Auzituck Gunship', 'Auzituck-Kanonenboot');
  exportObj.renameShip('Kihraxz Fighter', 'Kihraxz-Jäger');
  exportObj.renameShip('Sheathipede-Class Shuttle', 'Raumfähre der Sheathipede-Klasse');
  exportObj.renameShip('Quadjumper', 'Quadrijet-Transferschlepper');
  exportObj.renameShip('Firespray-31', 'Patrouillenboot der Firespray-Klasse');
  exportObj.renameShip('TIE Fighter', 'TIE/ln-Jäger');
  exportObj.renameShip('Y-Wing', 'BTL-A4-Y-Flügler');
  exportObj.renameShip('TIE Advanced', 'TIE-x1-Turbojäger');
  exportObj.renameShip('Alpha-Class Star Wing', 'Sternflügler der Alpha-Klasse');
  exportObj.renameShip('U-Wing', 'UT-60D-U-Flügler');
  exportObj.renameShip('TIE Striker', 'TIE/sk-Stürmer');
  exportObj.renameShip('B-Wing', 'A/SF-01-B-Flügler');
  exportObj.renameShip('TIE Defender', 'TIE/D-Abwehrjäger');
  exportObj.renameShip('TIE Bomber', 'TIE/sa-Bomber');
  exportObj.renameShip('TIE Punisher', 'TIE/ca-Vergelter');
  exportObj.renameShip('Aggressor', 'Aggressor-Angriffsjäger');
  exportObj.renameShip('G-1A Starfighter', 'G-1A Sternenjäger');
  exportObj.renameShip('VCX-100', 'Leichter VCX-100-Frachter');
  exportObj.renameShip('YV-666', 'Leichter YV-666-Frachter');
  exportObj.renameShip('TIE Advanced Prototype', 'TIE-v1-Turbojäger');
  exportObj.renameShip('Lambda-Class Shuttle', 'T-4A-Raumfähre der Lambda-Klasse');
  exportObj.renameShip('TIE Phantom', 'TIE/ph-Phantom');
  exportObj.renameShip('VT-49 Decimator', 'VT-49-Decimator');
  exportObj.renameShip('TIE Aggressor', 'TIE/ag-Agressor');
  exportObj.renameShip('K-Wing', 'BTL-S8-K-Flügler');
  exportObj.renameShip('ARC-170', 'ARC-170-Sternenjäger');
  exportObj.renameShip('Attack Shuttle', 'Jagdshuttle');
  exportObj.renameShip('X-Wing', 'T-65-X-Flügler');
  exportObj.renameShip('HWK-290', 'Leichter HWK-290-Frachter');
  exportObj.renameShip('A-Wing', 'RZ-1-A-Flügler');
  exportObj.renameShip('Fang Fighter', 'Fangjäger');
  exportObj.renameShip('Z-95 Headhunter', 'Z-95-AF4-Kopfjäger');
  exportObj.renameShip('M12-L Kimogila Fighter', 'M12-L-Kimogila-Jäger');
  exportObj.renameShip('E-Wing', 'E-Flügler');
  exportObj.renameShip('TIE Interceptor', 'TIE-Abfangjäger');
  exportObj.renameShip('Lancer-Class Pursuit Craft', 'Jagdschiff der Lanzen-Klasse');
  exportObj.renameShip('TIE Reaper', 'TIE-Schnitter');
  exportObj.renameShip('JumpMaster 5000', 'JumpMaster 5000');
  exportObj.renameShip('M3-A Interceptor', 'M3-A-Abfangjäger');
  exportObj.renameShip('YT-1300 (Scum)', 'Modifizierter YT-1300-Frachter');
  exportObj.renameShip('Escape Craft', 'Fluchtschiff');
  pilot_translations = {
    "4-LOM": {
      name: "4-LOM",
      ship: "G-1A Sternenjäger",
      text: "Nachdem du ein rotes Manöver vollständig ausgeführt hast, erhalte 1 Berechnungsmarker.%LINEBREAK%Zu Beginn der Endphase darfst du 1 Schiff in Reichweite 0-1 wählen. Falls du das tust, transferiere 1 deiner Stressmarker auf jenes Schiff."
    },
    "Nashtah Pup": {
      name: "Nashtahwelpe",
      ship: "Z-95-AF4-Kopfjäger",
      text: "Du kannst nur über eine Notabsetzung abgesetzt werden, und du hast den Namen, die Initiative, die Pilotenfähigkeit und die Schiffs-%CHARGE% der befreundeten, zerstörten <strong>Reißzahn</strong>.%LINEBREAK%<strong>Fluchtschiff:</strong> <strong>Aufbau: </strong>Erfordert die <strong>Reißzahn</strong>. Du <b>musst</b> das Spiel angedockt an der <strong>Reißzahn</strong> beginnen."
    },
    "AP-5": {
      name: "AP-5",
      ship: "Raumfähre der Sheathipede-Klasse",
      text: "Solange du koordinierst, falls du ein Schiff mit genau 1 Stressmarker wählst, kann es Aktionen durchführen.%LINEBREAK%<strong>Kommunikationsantennen:</strong> Solange du angedockt bist, erhält dein Trägerschiff %COORDINATE%. Bevor dein Trägerschiff aktiviert wird, darf es eine %COORDINATE%-Aktion durchführen."
    },
    "Academy Pilot": {
      name: "Pilot der Akademie",
      ship: "TIE/ln-Jäger",
      text: "<i>Was Sternenjäger betrifft, setzt das Galaktische Imperium hauptsächlich auf den schnellen und wendigen TIE/ln von Sienar Flottensysteme und lässt ihn in erstaunlicher Stückzahl produzieren.</i>"
    },
    "Airen Cracken": {
      name: "Airen Cracken",
      ship: "Z-95-AF4-Kopfjäger",
      text: "Nachdem du einen Angriff durchgeführt hast, darfst du 1 befreundetes Schiff in Reichweite 1 wählen. Jenes Schiff darf eine Aktion durchführen, die es als rot behandelt."
    },
    "Alpha Squadron Pilot": {
      name: "Pilot der Alpha-Staffel",
      ship: "TIE-Abfangjäger",
      text: "<i>Sienar Flottensysteme konzipierte den TIE-Abfangjäger mit vier Laserkanonen an den Tragflächenspitzen. Dadurch ist er seinen Vorgängermodellen waffentechnisch weit überlegen.</i>%LINEBREAK%<strong>Automatische Schubdüsen:</strong> Nachdem du eine Aktion durchgeführt hast, darfst du eine rote %BARRELROLL%-Aktion oder eine rote %BOOST%-Aktion durchführen."
    },
    "Arvel Crynyd": {
      name: "Arvel Crynyd",
      ship: "RZ-1-A-Flügler",
      text: "Du kannst Primärangriffe in Reichweite 0 durchführen.%LINEBREAK%Falls du durch Überschneidung mit einem anderen Schiff an einer %BOOST%-Aktion scheitern würdest, handle sie stattdessen so ab, als würdest du ein Manöver teilweise ausführen.%LINEBREAK%<strong>Schwenkbare Schubdüsen:</strong> Nachdem du eine Aktion durchgeführt hast, darfst du eine rote %BOOST%-Aktion durchführen."
    },
    "Asajj Ventress": {
      name: "Asajj Ventress",
      ship: "Jagdschiff der Lanzen-Klasse",
      text: "Zu Beginn der Kampfphase darfst du 1 feindliches Schiff in deinem %SINGLETURRETARC%&nbsp;in Reichweite 0-2 wählen und 1&nbsp;%FORCE%&nbsp;ausgeben. Falls du das tust, erhält jenes Schiff 1 Stressmarker, es sei denn, es entfernt 1 grünen Marker."
    },
    "Autopilot Drone": {
      name: "Autopilot-Drone",
      ship: "Fluchtschiff",
      text: "<i>Manchmal sind Herstellerwarnungen dazu gemacht, um sie zu ignorieren.</i>%LINEBREAK%<strong>Manipulierte Energiezellen:</strong> Während der Systemphase, falls du nicht angedockt bist, verliere 1&nbsp;%CHARGE%. Am Ende der Aktivierungsphase, falls du 0 %CHARGE% hast, wirst du zerstört. Bevor du entfernt wirst, erleidet jedes Schiff in Reichweite 0-1 1&nbsp;%CRIT%-Schaden."
    },
    "Bandit Squadron Pilot": {
      name: "Pilot der Banditen-Staffel",
      ship: "Z-95-AF4-Kopfjäger",
      text: "<i>Der Z-95-Kopfjäger ist ein direkter Vorläufer von Incoms Vorzeigemodell, dem T-65-X-Flügler. Obwohl er nach modernen Standards als veraltet gilt, ist er nach wie vor ein vielseitiger und schlagkräftiger Sternjäger.</i>"
    },
    "Baron of the Empire": {
      name: "Imperialer Baron",
      ship: "TIE-v1-Turbojäger",
      text: "<i>Sienars TIE-v1-Turbojäger war eine bahnbrechende Entwicklung auf dem Gebiet der Sternenjäger-Technologie. Er verfügt über stärkere Triebwerke, einen Raketenwerfer sowie klappbare S-Flügel.</i>"
    },
    "Benthic Two-Tubes": {
      name: "Benthic Two Tubes",
      ship: "UT-60D-U-Flügler",
      text: "Nachdem du eine %FOCUS%-Aktion durchgeführt hast, darfst du 1 deiner Fokusmarker auf ein befreundetes Schiff in Reichweite 1-2 transferieren."
    },
    "Biggs Darklighter": {
      name: "Biggs Darklighter",
      ship: "T-65-X-Flügler",
      text: "Solange ein anderes befreundetes Schiff in Reichweite 0-1 verteidigt, vor dem Schritt „Ergebnisse neutralisieren“, falls du im Angriffswinkel bist, darfst du 1&nbsp;%HIT%- oder %CRIT%-Schaden erleiden, um 1&nbsp;passendes Ergebnis zu negieren. "
    },
    "Binayre Pirate": {
      name: "Binayre-Pirat",
      ship: "Z-95-AF4-Kopfjäger",
      text: "<i>Kath Scarlets Piraten und Schmuggler haben ihre Basis auf den Zwillingswelten Talus und Tralus errichtet. Selbst in Verbrecherkreisen gelten sie als ausgesprochen launenhaft und verrucht.</i>"
    },
    "Black Squadron Ace": {
      name: "Fliegerass der schwarzen Staffel",
      ship: "TIE/ln-Jäger",
      text: "<i>In der Schlacht von Yavin begleiteten die Elite­-piloten der schwarzen Staffel mit ihren TIE/ln-Jägern Darth Vader auf seinem vernichtenden Schlag gegen die Rebellion.</i>"
    },
    "Black Squadron Scout": {
      name: "Aufklärer der schwarzen Staffel",
      ship: "TIE/sk-Stürmer",
      text: "<i>Schwenkbare Tragflächen verleihen dem schwerbewaffneten Atmosphärenflieger zusätzliche Geschwindigkeit und Manövrierbarkeit.</i>%LINEBREAK% <strong>Adaptive Querruder:</strong> Bevor du dein Rad aufdeckst, falls du nicht gestresst bist, <b>musst</b> du ein weißes [1&nbsp;%BANKLEFT%]-, [1&nbsp;%STRAIGHT%]- oder [1&nbsp;%BANKRIGHT%]-Manöver ausführen."
    },
    "Black Sun Ace": {
      name: "Fliegerass der Schwarzen Sonne",
      ship: "Kihraxz-Jäger",
      text: "<i>Der Kihraxz-Angriffsjäger wurde eigens für das Verbrechersyndikat Schwarze Sonne entwickelt, dessen hochbezahlte Fliegerasse ein leistungsstarkes, wendiges Schiff verlangten, das ihren Fähigkeiten entsprach.</i>"
    },
    "Black Sun Assassin": {
      name: "Attentäter der ",
      ship: "Angriffsplattform der Sternenviper-Klasse",
      text: "<i>Ein Attentat kann mit einem Schuss im Dunkeln oder mit einem vergifteten Getränk verübt werden. Aussagekräftiger ist jedoch eine brennende Raumfähre, die hilflos vom Himmel trudelt. </i>%LINEBREAK%<strong>Mikrodüsen:</strong> Solange du eine Fassrolle durchführst, <b>musst</b> du die %BANKLEFT%- oder %BANKRIGHT%-Schablone anstatt der %STRAIGHT%-Schablone verwenden."
    },
    "Black Sun Enforcer": {
      name: "Vollstrecker der ",
      ship: "Angriffsplattform der Sternenviper-Klasse",
      text: "<i>Prinz Xizor persönlich entwickelte die Angriffsplattform der SternenViper-Klasse in Zusammenarbeit mit MandalMotors und schuf so einen der vorzüglichsten Sternenjäger der Galaxis. </i>%LINEBREAK%<strong>Mikrodüsen:</strong> Solange du eine Fassrolle durchführst, <b>musst</b> du die %BANKLEFT%- oder %BANKRIGHT%-Schablone anstatt der %STRAIGHT%-Schablone verwenden."
    },
    "Black Sun Soldier": {
      name: "Kampfpilot der Schwarzen Sonne",
      ship: "Z-95-AF4-Kopfjäger",
      text: "<i>Das große und einflussreiche Verbrechersyndikat Schwarze Sonne hat immer Bedarf an guten Piloten, die bei der Wahl ihres Arbeitgebers nicht allzu kritisch sind. </i>"
    },
    "Blade Squadron Veteran": {
      name: "Veteran der Klingen-Staffel",
      ship: "A/SF-01-B-Flügler",
      text: "<i>Das Cockpit des B-Flüglers ist in einen einzigartigen Gyrostabilisator eingebunden, der den Piloten während des gesamten Fluges in aufrechter Position hält.</i>"
    },
    "Blue Squadron Escort": {
      name: "Eskorte der blauen Staffel",
      ship: "T-65-X-Flügler",
      text: "<i>Der T-65-X-Flügler aus dem Hause Incom erwies sich schnell als eine der effektivsten und vielseitigsten Jagdmaschinen der Galaxis - und als wahrer Segen für die Rebellion.</i>"
    },
    "Blue Squadron Pilot": {
      name: "Pilot der blauen Staffel",
      ship: "A/SF-01-B-Flügler",
      text: "<i>Seine schweren Waffensysteme und unverwüstlichen Schilde machen den B-Flügler zu einer der innovativsten Jagdmaschinen der Allianz.</i>"
    },
    "Blue Squadron Scout": {
      name: "Aufklärer der blauen ",
      ship: "UT-60D-U-Flügler",
      text: "<i>Der UT-60D-U-Flügler deckt den Bedarf der Rebellion an schnellen, unverwüstlichen Truppentransportern. Meistens wird er eingesetzt, um Soldaten im Schutz der Dunkelheit oder inmitten eines tobenden Gefechts an ihren Einsatzort zu befördern. </i>"
    },
    "Boba Fett": {
      name: "Boba Fett",
      ship: "Patrouillenboot der Firespray-Klasse",
      text: "Solange du verteidigst oder einen Angriff durchführst, darfst du für jedes feindliche Schiff in Reichweite 0-1 1 deiner Würfel neu werfen."
    },
    "Bodhi Rook": {
      name: "Bodhi Rook",
      ship: "UT-60D-U-Flügler",
      text: "Befreundete Schiffe können Objekte in Reichweite 0-3 eines beliebigen befreundeten Schiffes als Ziele erfassen."
    },
    "Bossk": {
      name: "Bossk",
      ship: "Leichter YV-666-Frachter",
      text: "Solange du einen Primärangriff durchführst, nach dem Schritt „Ergebnisse neutralisieren“, darfst du 1&nbsp;%CRIT%-Ergebnis ausgeben, um 2&nbsp;%HIT%-Ergebnisse hinzuzufügen."
    },
    "Bounty Hunter": {
      name: "Kopfgeldjäger",
      ship: "Patrouillenboot der Firespray-Klasse",
      text: "<i>Das Patrouillenboot der Firespray-Klasse ist berüchtigt, weil es mit den Kopfgeldjägern Jango Fett und Boba Fett assoziiert wird, die ihr Schiff mit unzähligen tödlichen Waffen gespickt hatten.</i>"
    },
    "Braylen Stramm": {
      name: "Braylen Stramm",
      ship: "A/SF-01-B-Flügler",
      text: "Solange du verteidigst oder einen Angriff durchführst, falls du gestresst bist, darfst du bis zu 2&nbsp;deiner Würfel neu werfen."
    },
    "Captain Feroph": {
      name: "Captain Feroph",
      ship: "TIE-Schnitter",
      text: "Solange du verteidigst, falls der Angreifer keine grünen Marker hat, darfst du 1 deiner Leerseiten- oder %FOCUS%-Ergebnisse in ein %EVADE%-Ergebnis ändern.%LINEBREAK%<strong>Adaptive Querruder:</strong> Bevor du dein Rad aufdeckst, falls du nicht gestresst bist, <b>musst</b> du ein weißes [1&nbsp;%BANKLEFT%]-, [1&nbsp;%STRAIGHT%]- oder [1&nbsp;%BANKRIGHT%]-Manöver ausführen."
    },
    "Captain Jonus": {
      name: "Captain Jonus",
      ship: "TIE/sa-Bomber",
      text: "Solange ein befreundetes Schiff in Reichweite 0-1 einen %TORPEDO%- oder %MISSILE%-Angriff durchführt, darf jenes Schiff bis zu 2&nbsp;Angriffswürfel neu werfen. %LINEBREAK%<strong>Wendiger Bomber:</strong> Falls du unter Verwendung einer %STRAIGHT%-Schablone ein Gerät abwerfen würdest, darfst du stattdessen eine %BANKLEFT%- oder %BANKRIGHT%-Schablone derselben Geschwindigkeit verwenden."
    },
    "Captain Jostero": {
      name: "Captain Jostero",
      ship: "Kihraxz-Jäger",
      text: "Nachdem ein feindliches Schiff Schaden erlitten hat, falls es nicht verteidigt, darfst du einen Bonusangriff gegen jenes Schiff durchführen."
    },
    "Captain Kagi": {
      name: "Captain Kagi",
      ship: "T-4A-Raumfähre der Lambda-Klasse",
      text: "Zu Beginn der Kampfphase darfst du 1 oder mehrere befreundete Schiffe in Reichweite 0-3 wählen. Falls du das tust, transferiere alle feindlichen Zielerfassungsmarker von den gewählten Schiffen auf dich."
    },
    "Captain Nym": {
      name: "Captain Nym",
      ship: "Scurrg-H-6-Bomber",
      text: "Bevor eine befreundete Bombe oder Mine detonieren würde, darfst du 1&nbsp;%CHARGE% ausgeben, um die Detonation zu verhindern.%LINEBREAK% Solange du gegen einen Angriff verteidigst, der durch eine Bombe oder Mine versperrt ist, wirf 1&nbsp;zusätzlichen Verteidigungswürfel."
    },
    "Captain Oicunn": {
      name: "Captain Oicunn",
      ship: "VT-49-Decimator",
      text: "Du kannst Primärangriffe in Reichweite&nbsp;0 durchführen."
    },
    "Captain Rex": {
      name: "Captain Rex",
      ship: "TIE/ln-Jäger",
      text: "Nachdem du einen Angriff durchgeführt hast, ordne dem Verteidiger den Zustand <strong>Sperrfeuer</strong> zu."
    },
    "Cartel Executioner": {
      name: "Killer des Kartells",
      ship: "M12-L-Kimogila-Jäger",
      text: "<i>Viele erfahrene Piloten, die im Dienst der huttischen Kajidics und anderer Verbrecherorganisationen stehen, entscheiden sich für den M12-L-Kimogila-Jäger aufgrund seiner beträchtlichen Feuerkraft und seines furchteinflößenden Rufes.</i>%LINEBREAK% <strong>Todsicherer Treffer:</strong> Solange du einen Angriff durchführst, falls der Verteidiger in deinem %BULLSEYEARC% ist, können Verteidigungswürfel nicht unter Verwendung von grünen Markern modifiziert werden."
    },
    "Cartel Marauder": {
      name: "Kartell-Marodeur",
      ship: "Kihraxz-Jäger",
      text: "<i>Der vielseitige Kihraxz ist dem beliebten X-Flügler von Incom nachempfunden und verfügt über eine Reihe von Modifikationspaketen, mit denen er für verschiedenste Aufgabenbereiche angepasst werden kann.</i>"
    },
    "Cartel Spacer": {
      name: "Raumfahrer des Kartells",
      ship: "M3-A-Abfangjäger",
      text: "<i>Der M3-A-„Scyk“-Abfangjäger von MandalMotors wurde in großer Stückzahl vom Hutt-Kartell und den Car'das-Schmugglern angeschafft. Grund dafür waren der günstige Einstiegspreis und die vielen Ausstattungsoptionen des Jägers. </i>%LINEBREAK%<strong>Waffenaufhängung:</strong> Du kannst 1&nbsp;%CANNON%-,&nbsp;%TORPEDO%- oder %MISSILE%-Aufwertung ausrüsten."
    },
    "Cassian Andor": {
      name: "Cassian Andor",
      ship: "UT-60D-U-Flügler",
      text: "Zu Beginn der Aktivierungsphase darfst du 1 befreundetes Schiff in Reichweite 1-3 wählen. Falls du das tust, entfernt jenes Schiff 1 Stressmarker."
    },
    "Cavern Angels Zealot": {
      name: "Fanatiker der Sturmengel",
      ship: "T-65-X-Flügler",
      text: "<i>Anders als die meisten Widerstandszellen sind Saw Gerreras Partisanen bereit, bis zum Äußersten zu gehen, um die Pläne des Imperiums zu durchkreuzen. Von Geonosis bis Jedha liefern sie sich blutige Auseinandersetzungen mit der imperialen Obrigkeit.</i>"
    },
    "Chewbacca": {
      name: "Chewbacca",
      ship: "Modifizierter leichter YT-1300-Frachter",
      text: "Bevor dir eine offene Schadenskarte zugeteilt werden würde, darfst du 1&nbsp;%CHARGE% ausgeben, um die Karte stattdessen verdeckt zugeteilt zu bekommen."
    },
    "Colonel Jendon": {
      name: "Colonel Jendon",
      ship: "T-4A-Raumfähre der Lambda-Klasse",
      text: "Zu Beginn der Aktivierungsphase darfst du 1&nbsp;%CHARGE% ausgeben. Falls du das tust, <b>müssen</b> befreundete Schiffe, solange sie in dieser Runde Ziele erfassen, Ziele jenseits von Reichweite 3 erfassen, anstatt in Reichweite 0-3."
    },
    "Colonel Vessery": {
      name: "Colonel Vessery",
      ship: "TIE/D-Abwehrjäger",
      text: "Solange du einen Angriff gegen ein erfasstes Schiff durchführst, nachdem du Angriffswürfel geworfen hast, darfst du den Verteidiger als Ziel erfassen.%LINEBREAK%<strong>Vollgas:</strong> Nachdem du ein Manöver mit Geschwindigkeit 3-5 vollständig ausgeführt hast, darfst du eine %EVADE%-Aktion durchführen."
    },
    "Constable Zuvio": {
      name: "Constable Zuvio",
      ship: "Quadrijet-Transferschlepper",
      text: "Falls du ein Gerät abwerfen würdest, darfst du es stattdessen unter Verwendung der [1&nbsp;%STRAIGHT%]-Schablone starten.%LINEBREAK%<strong>Schlepperstrahl:</strong> <strong>Aktion:</strong> Wähle ein Schiff in deinem %FRONTARC% in Reichweite 1. Jenes Schiff erhält 1 Fangstrahlmarker oder 2&nbsp;Fangstrahlmarker, falls es in deinem %BULLSEYEARC%&nbsp;in Reichweite 1 ist."
    },
    "Contracted Scout": {
      name: "Angeheuerter Kundschafter",
      ship: "JumpMaster 5000",
      text: "<i>Der leichtbewaffnete JumpMaster 5000 ist für Langstreckenaufklärung und die Erschließung neuer Hyperraumrouten vorgesehen. Häufig wird er mit umfangreichen Ausstattungspaketen nachgerüstet.</i>"
    },
    "Corran Horn": {
      name: "Corran Horn",
      ship: "E-Flügler",
      text: "Bei Initiative 0 darfst du einen Bonus-Primärangriff gegen ein feindliches Schiff in deinem %BULLSEYEARC% durchführen. Falls du das tust, erhalte zu Beginn der nächsten Planungsphase 1 Entwaffnet-Marker.%LINEBREAK%<strong>Experimentelle Scanner:</strong> Du kannst Ziele jenseits von Reichweite 3 erfassen. Du kannst keine Ziele in Reichweite 1 erfassen."
    },
    "Countess Ryad": {
      name: "Gräfin Ryad",
      ship: "TIE/D-Abwehrjäger",
      text: "Solange du ein %STRAIGHT%-Manöver ausführen würdest, darfst du die Schwierigkeit des Manövers erhöhen. Falls du das tust, führe es stattdessen als %KTURN%-Manöver aus.%LINEBREAK%<strong>Vollgas:</strong> Nachdem du ein Manöver mit Geschwindigkeit 3-5 vollständig ausgeführt hast, darfst du eine %EVADE%-Aktion durchführen."
    },
    "Crymorah Goon": {
      name: "Verbrecher der Crymorah",
      ship: "BTL-A4-Y-Flügler",
      text: "<i>Mit seinen schweren Hüllenplatten, starken Schilden und schlagkräftigen Geschützen ist der Y-Flügler zwar alles andere als behände, dafür eignet er sich hervorragend als Patrouillenschiff.</i>"
    },
    "Cutlass Squadron Pilot": {
      name: "Pilot der Entermesser-Staffel",
      ship: "TIE/ca-Vergelter",
      text: "<i>Das Konzept des TIE-Vergelters basiert auf dem erfolgreichen TIE-Bomber und ergänzt ihn um Schilde, einen zweiten Bombenabwurfschacht sowie drei weitere Munitionskapseln, die jeweils mit einem Zwillings-Ionenantrieb ausgerüstet sind.</i>"
    },
    "Dace Bonearm": {
      name: "Dace Bonearm",
      ship: "Leichter HWK-290-Frachter",
      text: "Nachdem ein feindliches Schiff in Reichweite 0-3 mindestens 1 Ionenmarker bekommen hat, darfst du 3&nbsp;%CHARGE% ausgeben. Falls du das tust, erhält jenes Schiff 2&nbsp;zusätzliche Ionenmarker."
    },
    "Dalan Oberos (StarViper)": {
      name: "Dalan Oberos (StarViper)",
      ship: "Angriffsplattform der Sternenviper-Klasse",
      text: "Nachdem du ein Manöver vollständig ausgeführt hast, darfst du 1&nbsp;Stressmarker erhalten, um dein Schiff um 90° zu drehen.%LINEBREAK%<strong>Mikrodüsen:</strong> Solange du eine Fassrolle durchführst, <b>musst</b> du die %BANKLEFT%- oder %BANKRIGHT%-Schablone anstatt der %STRAIGHT%-Schablone verwenden."
    },
    "Dalan Oberos": {
      name: "Dalan Oberos",
      ship: "M12-L-Kimogila-Jäger",
      text: "Zu Beginn der Kampfphase darfst du 1&nbsp;Schiff, das Schilde hat, in deinem %BULLSEYEARC%&nbsp;wählen und 1&nbsp;%CHARGE% ausgeben. Falls du das tust, verliert jenes Schiff 1 Schild und du stellst 1&nbsp;Schild wieder her.%LINEBREAK%<strong>Todsicherer Treffer:</strong> Solange du einen Angriff durchführst, falls der Verteidiger in deinem %BULLSEYEARC% ist, können Verteidigungswürfel nicht unter Verwendung von grünen Markern modifiziert werden."
    },
    "Darth Vader": {
      name: "Darth Vader",
      ship: "TIE-x1-Turbojäger",
      text: "Nachdem du eine Aktion durchgeführt hast, darfst du 1&nbsp;%FORCE% ausgeben, um eine Aktion durchzuführen.%LINEBREAK%<strong>Verbesserter Zielcomputer:</strong> Solange du einen Primärangriff gegen einen Verteidiger durchführst, den du als Ziel erfasst hast, wirf 1&nbsp;zusätzlichen Angriffswürfel und ändere 1&nbsp;%HIT%-Ergebnis in ein %CRIT%-Ergebnis."
    },
    "Dash Rendar": {
      name: "Dash Rendar",
      ship: "Leichter YT-2400-Frachter",
      text: "Solange du dich bewegst, ignorierst du Hindernisse.%LINEBREAK%<strong>Toter Winkel:</strong> Solange du einen Primärangriff in Reichweite 0-1 durchführst, wende den Bonus für Reichweite 0-1 nicht an und wirf 1 Angriffswürfel weniger."
    },
    "Del Meeko": {
      name: "Del Meeko",
      ship: "TIE/ln-Jäger",
      text: "Solange ein befreundetes Schiff in Reichweite 0-2 gegen einen beschädigten Angreifer verteidigt, darf der Verteidiger 1&nbsp;Verteidigungswürfel neu werfen."
    },
    "Delta Squadron Pilot": {
      name: "Pilot der Delta-Staffel",
      ship: "TIE/D-Abwehrjäger",
      text: "<i>Der TIE-Abwehrjäger ist nicht nur mit Raketenwerfern und sechs Kanonen an den Tragflächenspitzen, sondern auch mit Deflektorschilden und einem Hyperantrieb ausgestattet.</i>%LINEBREAK%<strong>Vollgas:</strong> Nachdem du ein Manöver mit Geschwindigkeit 3-5 vollständig ausgeführt hast, darfst du eine %EVADE%-Aktion durchführen."
    },
    "Dengar": {
      name: "Dengar",
      ship: "JumpMaster 5000",
      text: "Nachdem du verteidigt hast, falls der Angreifer in deinem %FRONTARC% ist, darfst du 1&nbsp;%CHARGE% ausgeben, um einen Bonusangriff gegen den Angreifer durchzuführen."
    },
    "Drea Renthal": {
      name: "Drea Renthal",
      ship: "BTL-A4-Y-Flügler",
      text: "Solange ein befreundetes nicht-limitiertes Schiff einen Angriff durchführt, falls der Verteidiger in deinem Feuerwinkel ist, darf der Angreifer 1 Angriffswürfel neu werfen."
    },
    "Edrio Two-Tubes": {
      name: "Edrio Two Tubes",
      ship: "T-65-X-Flügler",
      text: "Bevor du aktiviert wirst, falls du fokussiert bist, darfst du eine Aktion durchführen."
    },
    "Emon Azzameen": {
      name: "Emon Azzameen",
      ship: "Patrouillenboot der Firespray-Klasse",
      text: "Falls du unter Verwendung der [1&nbsp;%STRAIGHT%]-Schablone ein Gerät abwerfen würdest, darfst du stattdessen die [3&nbsp;%TURNLEFT%]-, [3&nbsp;%STRAIGHT%]-&nbsp;oder [3&nbsp;%TURNRIGHT%]-Schablone verwenden."
    },
    "Esege Tuketu": {
      name: "Esege Tuketu",
      ship: "BTL-S8-K-Flügler",
      text: "Solange ein befreundetes Schiff in Reichweite 0-2 verteidigt oder einen Angriff durchführt, darf es deine Fokusmarker ausgeben, als ob jenes Schiff sie hätte."
    },
    "Evaan Verlaine": {
      name: "Evaan Verlaine",
      ship: "BTL-A4-Y-Flügler",
      text: "Zu Beginn der Kampfphase darfst du 1 Fokusmarker ausgeben, um ein befreundetes Schiff in Reichweite 0-1 zu wählen. Falls du das tust, wirft jenes Schiff bis zum Ende der Runde 1&nbsp;zusätzlichen Verteidigungswürfel, solange es verteidigt."
    },
    "Ezra Bridger": {
      name: "Ezra Bridger",
      ship: "Jagdshuttle",
      text: "Solange du verteidigst oder einen Angriff durchführst, falls du gestresst bist, darfst du 1&nbsp;%FORCE% ausgeben, um bis zu 2 deiner %FOCUS%-Ergebnisse in %EVADE%- oder %HIT%-Ergebnisse zu ändern.%LINEBREAK%<strong>Geladen und entsichert:</strong> Solange du angedockt bist, nachdem dein Trägerschiff einen %FRONTARC%-Primärangriff oder %TURRET%-Angriff durchgeführt hat, darf es einen Bonus-%REARARC%-Primärangriff durchführen."
    },
    "Ezra Bridger (Sheathipede)": {
      name: "Ezra Bridger (Sheathipede)",
      ship: "Raumfähre der Sheathipede-Klasse",
      text: "Solange du verteidigst oder einen Angriff durchführst, falls du gestresst bist, darfst du 1&nbsp;%FORCE% ausgeben, um bis zu 2 deiner %FOCUS%-Ergebnisse in %EVADE%- oder %HIT%-Ergebnisse zu ändern. %LINEBREAK%<strong>Kommunikationsantennen:</strong> Solange du angedockt bist, erhält dein Trägerschiff %COORDINATE%. Bevor dein Trägerschiff aktiviert wird, darf es eine %COORDINATE%-Aktion durchführen."
    },
    "Ezra Bridger (TIE Fighter)": {
      name: "Ezra Bridger (TIE Fighter)",
      ship: "TIE/ln-Jäger",
      text: "Solange du verteidigst oder einen Angriff durchführst, falls du gestresst bist, darfst du 1&nbsp;%FORCE% ausgeben, um bis zu 2 deiner %FOCUS%-Ergebnisse in %EVADE%- oder %HIT%-Ergebnisse zu ändern."
    },
    "Fenn Rau": {
      name: "Fenn Rau",
      ship: "Fangjäger",
      text: "Solange du verteidigst oder einen Angriff durchführst, falls die Angriffsreichweite 1 ist, darfst du 1&nbsp;zusätzlichen Würfel werfen.%LINEBREAK%<strong>Concordianischer Wirbel:</strong> Solange du verteidigst, falls die Angriffsreichweite 1 ist und du im%FRONTARC%&nbsp;des Angreifers bist, ändere 1&nbsp;Ergebnis in ein %EVADE%-Ergebnis."
    },
    "Fenn Rau (Sheathipede)": {
      name: "Fenn Rau (Sheathipede)",
      ship: "Raumfähre der Sheathipede-Klasse",
      text: "Nachdem ein feindliches Schiff in deinem Feuerwinkel begonnen hat zu kämpfen, falls du nicht gestresst bist, darfst du 1 Stressmarker erhalten. Falls du das tust, kann jenes Schiff keine Marker ausgeben, um Würfel zu modifizieren, solange es während dieser Phase einen Angriff durchführt.%LINEBREAK%<strong>Kommunikationsantennen:</strong> Solange du angedockt bist, erhält dein Trägerschiff %COORDINATE%. Bevor dein Trägerschiff aktiviert wird, darf es eine %COORDINATE%-Aktion durchführen."
    },
    "Freighter Captain": {
      name: "Frachtercaptain",
      ship: "Modifizierter YT-1300-Frachter",
      text: "<i>Viele Raumfahrer bestreiten ihr Leben, indem sie den Outer Rim bereisen, wo der Unterschied zwischen Schmugglern und seriösen Händlern oft kaum zu erkennen ist. Am Rande der Zivilisation sind Käufer äußerst selten, daher sollte man nicht nach der Herkunft der Ware fragen, solange der Preis niedrig genug ist. </i>"
    },
    "Gamma Squadron Ace": {
      name: "Fliegerass der Gamma-Staffel",
      ship: "TIE/sa-Bomber",
      text: "<i>Der TIE-Bomber ist zwar nicht so schnell und wendig wie ein TIE/ln, dafür besitzt er genügend Feuerkraft, um praktisch jedes feindliche Ziel auszulöschen. </i>%LINEBREAK%<strong>Wendiger Bomber:</strong> Falls du unter Verwendung einer %STRAIGHT%-Schablone ein Gerät abwerfen würdest, darfst du stattdessen eine %BANKLEFT%- oder %BANKRIGHT%-Schablone derselben Geschwindigkeit verwenden."
    },
    "Gand Findsman": {
      name: "Gand-Finder",
      ship: "G-1A Sternenjäger",
      text: "<i>Die legendären Finder der Gand verehren den Nebelschleier, der ihren Heimatplaneten umhüllt. Um ihre Beute aufzuspüren, deuten sie mystische Zeichen und Visionen.</i>"
    },
    "Garven Dreis (X-Wing)": {
      name: "Garven Dreis (X-Wing)",
      ship: "T-65-X-Flügler",
      text: "Nachdem du einen Fokusmarker ausgegeben hast, darfst du 1&nbsp;befreundetes Schiff in Reichweite 1-3 wählen. Jenes Schiff erhält 1 Fokusmarker."
    },
    "Garven Dreis": {
      name: "Garven Dreis",
      ship: "ARC-170-Sternenjäger",
      text: "Nachdem du einen Fokusmarker ausgegeben hast, darfst du 1&nbsp;befreundetes Schiff in Reichweite 1-3 wählen. Jenes Schiff erhält 1 Fokusmarker."
    },
    "Gavin Darklighter": {
      name: "Gavin Darklighter",
      ship: "E-Flügler",
      text: "Solange ein befreundetes Schiff einen Angriff durchführt, falls der Verteidiger in deinem %FRONTARC% ist, darf der Angreifer 1&nbsp;%HIT%-Ergebnis in ein %CRIT%-Ergebnis ändern.%LINEBREAK%<strong>Experimentelle Scanner:</strong> Du kannst Ziele jenseits von Reichweite 3 erfassen. Du kannst keine Ziele in Reichweite 1 erfassen."
    },
    "Genesis Red": {
      name: "Genesis Red",
      ship: "M3-A-Abfangjäger",
      text: "Nachdem du ein Ziel erfasst hast, musst du alle deine Fokus- und Ausweichmarker entfernen. Dann erhalte dieselbe Anzahl an Fokus- und Ausweichmarkern, die das erfasste Schiff hat.%LINEBREAK%<strong>Waffenaufhängung:</strong> Du kannst 1&nbsp;%CANNON%-,&nbsp;%TORPEDO%- oder %MISSILE%-Aufwertung ausrüsten."
    },
    "Gideon Hask": {
      name: "Gideon Hask",
      ship: "TIE/ln-Jäger",
      text: "Solange du einen Angriff gegen einen beschädigten Verteidiger durchführst, wirf 1 zusätzlichen Angriffswürfel."
    },
    "Gold Squadron Veteran": {
      name: "Veteran der Gold-Staffel",
      ship: "BTL-A4-Y-Flügler",
      text: "<i>Unter dem Kommando von Jon „Dutch“ Vander spielte die Gold-Staffel eine Schlüsselrolle bei den Schlachten von Scarif und Yavin.</i>"
    },
    "Grand Inquisitor": {
      name: "Großinquisitor",
      ship: "TIE-v1-Turbojäger",
      text: "Solange du in Angriffsreichweite 1 verteidigst, darfst du 1&nbsp;%FORCE% ausgeben, um den Bonus für Reichweite 1 zu verhindern.%LINEBREAK%Solange du einen Angriff gegen einen Verteidiger in Angriffsreichweite 2-3 durchführst, darfst du 1&nbsp;%FORCE% ausgeben, um den Bonus für Reichweite 1 anzuwenden."
    },
    "Gray Squadron Bomber": {
      name: "Bomber der grauen Staffel",
      ship: "BTL-A4-Y-Flügler",
      text: "<i>Obwohl er beim Imperium schon lange ausgemustert ist, bleibt der Y-Flügler aufgrund seiner Robustheit, Zuverlässigkeit und schweren Bewaffnung weiterhin ein fester Bestandteil der Rebellenflotte.</i>"
    },
    "Graz": {
      name: "Graz",
      ship: "Kihraxz-Jäger",
      text: "Solange du verteidigst, falls du hinter dem Angreifer bist, wirf 1&nbsp;zusätzlichen Verteidigungswürfel.%LINEBREAK%Solange du einen Angriff durchführst, falls du hinter dem Angreifer bist, wirf 1&nbsp;zusätzlichen Angriffswürfel."
    },
    "Green Squadron Pilot": {
      name: "Pilot der grünen Staffel",
      ship: "RZ-1-A-Flügler",
      text: "<i>Aufgrund seiner empfindlichen Steuerung und extremen Wendigkeit war das Cockpit des A-Flüglers nur für besonders begabte Piloten bestimmt.</i>%LINEBREAK%<strong>Schwenkbare Schubdüsen:</strong> Nachdem du eine Aktion durchgeführt hast, darfst du eine rote %BOOST%-Aktion durchführen."
    },
    "Guri": {
      name: "Guri",
      ship: "Angriffsplattform der Sternenviper-Klasse",
      text: "Zu Beginn der Kampfphase, falls mindestens 1 feindliches Schiff in Reichweite 0-1 ist, darfst du 1&nbsp;Fokusmarker erhalten.%LINEBREAK%<strong>Mikrodüsen:</strong> Solange du eine Fassrolle durchführst, <b>musst</b> du die %BANKLEFT%- oder %BANKRIGHT%-Schablone anstatt der %STRAIGHT%-Schablone verwenden."
    },
    "Han Solo": {
      name: "Han Solo",
      ship: "Modifizierter YT-1300-Frachter",
      text: "Solange du verteidigst oder einen Primärangriff durchführst, falls der Angriff durch ein Hindernis versperrt ist, darfst du 1 zusätzlichen Würfel werfen."
    },
    "Han Solo (Scum)": {
      name: "Han Solo (Scum)",
      ship: "Modifizierter leichter YT-1300-Frachter",
      text: "Nachdem du Würfel geworfen hast, falls du in Reichweite 0-1 eines Hindernisses bist, darfst du alle deine Würfel neu werfen. Dies zählt für alle anderen Effekte nicht als Neuwerfen."
    },
    "Heff Tobber": {
      name: "Heff Tobber",
      ship: "UT-60D-U-Flügler",
      text: "Nachdem ein feindliches Schiff ein Manöver ausgeführt hat, falls es in Reichweite 0 ist, darfst du eine Aktion durchführen."
    },
    "Hera Syndulla": {
      name: "Hera Syndulla",
      ship: "Jagdshuttle",
      text: "Nachdem du ein rotes oder blaues Manöver aufgedeckt hast, darfst du dein Rad auf ein anderes Manöver derselben Schwierigkeit einstellen.%LINEBREAK%<strong>Geladen und entsichert:</strong> Solange du angedockt bist, nachdem dein Trägerschiff einen %FRONTARC%-Primärangriff oder %TURRET%-Angriff durchgeführt hat, darf es einen Bonus-%REARARC%-Primärangriff durchführen."
    },
    "Hera Syndulla (VCX-100)": {
      name: "Hera Syndulla (VCX-100)",
      ship: "Leichter VCX-100-Frachter",
      text: "Nachdem du ein rotes oder blaues Manöver aufgedeckt hast, darfst du dein Rad auf ein anderes Manöver derselben Schwierigkeit einstellen.%LINEBREAK%<strong>Heckgeschütz:</strong> Solange du ein angedocktes Schiff hast, hast du eine %REARARC%-Primärwaffe mit einem Angriffswert in Höhe des Angriffswertes der %FRONTARC%-Primärwaffe deines angedockten Schiffes."
    },
    "Hired Gun": {
      name: "Söldner",
      ship: "BTL-A4-Y-Flügler",
      text: "<i>Wer mit imperialen Credits winkt, kann auf eine große, wenn auch nicht sonderlich vertrauenswürdige Helferschar zählen.</i>"
    },
    "Horton Salm": {
      name: "Horton Salm",
      ship: "BTL-A4-Y-Flügler",
      text: "Solange du einen Angriff durchführst, darfst du für jedes andere befreundete Schiff in Reichweite 0-1 des Verteidigers 1 Angriffswürfel neu werfen."
    },
    "IG-88A": {
      name: "IG-88A",
      ship: "Aggressor-Angriffsjäger",
      text: "Zu Beginn der Kampfphase darfst du 1&nbsp;befreundetes Schiff mit %CALCULATE% in seiner Aufwertungsleiste in Reichweite 1-3 wählen. Falls du das tust, transferiere 1&nbsp;deiner Berechnungsmarker auf es. %LINEBREAK%<strong>Hochentwickeltes Droidengehirn:</strong> Nachdem du eine %CALCULATE%-Aktion durchgeführt hast, erhalte 1 Berechnungsmarker."
    },
    "IG-88B": {
      name: "IG-88B",
      ship: "Aggressor-Angriffsjäger",
      text: "Nachdem du einen Angriff durchgeführt hast, der verfehlt hat, darfst du einen Bonus-%CANNON%-Angriff durchführen.%LINEBREAK%<strong>Hochentwickeltes Droidengehirn:</strong> Nachdem du eine %CALCULATE%-Aktion durchgeführt hast, erhalte 1 Berechnungsmarker."
    },
    "IG-88C": {
      name: "IG-88C",
      ship: "Aggressor-Angriffsjäger",
      text: "Nachdem du eine %BOOST%-Aktion durchgeführt hast, darfst du eine %EVADE%-Aktion durchführen.%LINEBREAK%<strong>Hochentwickeltes Droidengehirn:</strong> Nachdem du eine %CALCULATE%-Aktion durchgeführt hast, erhalte 1 Berechnungsmarker."
    },
    "IG-88D": {
      name: "IG-88D",
      ship: "Aggressor-Angriffsjäger",
      text: "Solange du einen Segnor-Looping (%SLOOPLEFT% oder %SLOOPRIGHT%)ausführst, darfst du stattdessen eine andere Schablone derselben Geschwindigkeit verwenden: entweder die Wende (%TURNLEFT% oder %TURNRIGHT%) mit gleicher Orientierung oder die Gerade (%STRAIGHT%).%LINEBREAK%<strong>Hochentwickeltes Droidengehirn:</strong> Nachdem du eine %CALCULATE%-Aktion durchgeführt hast, erhalte 1 Berechnungsmarker."
    },
    "Ibtisam": {
      name: "Ibtisam",
      ship: "ARC-170-Sternenjäger",
      text: "Nachdem du ein Manöver vollständig ausgeführt hast, falls du gestresst bist, darfst du 1 Angriffswürfel werfen. Bei einem %HIT%- oder %CRIT%-Ergebnis entferne 1&nbsp;Stressmarker."
    },
    "Iden Versio": {
      name: "Iden Versio",
      ship: "TIE/ln-Jäger",
      text: "Bevor ein befreundeter TIE/ln-Jäger in Reichweite 0-1 1 oder mehr Schaden erleiden würde, darfst du 1&nbsp;%CHARGE% ausgeben. Falls du das tust, verhindere jenen Schaden."
    },
    "Imdaar Test Pilot": {
      name: "Testpilot von Imdaar",
      ship: "TIE/ph-Phantom",
      text: "<i>In einem geheimen Forschungsprojekt auf dem Mond Imdaar Alpha wurde entwickelt, was viele für unmöglich gehalten hatten: der TIE-Phantom, ein kleiner Sternenjäger mit Tarnvorrichtung.</i>%LINEBREAK%<strong>Stygium-Gitter:</strong> Nachdem du dich enttarnt hast, darfst du eine %EVADE%-Aktion durchführen. Zu Beginn der Endphase darfst du 1 Ausweichmarker ausgeben, um 1 Tarnungsmarker zu erhalten."
    },
    "Inaldra": {
      name: "Inaldra",
      ship: "M3-A-Abfangjäger",
      text: "Solange du verteidigst oder einen Angriff durchführst, darfst du 1&nbsp;%HIT%-Schaden erleiden, um beliebig viele deiner Würfel neu zu werfen.%LINEBREAK%<strong>Waffenaufhängung:</strong> Du kannst 1&nbsp;%CANNON%-,&nbsp;%TORPEDO%- oder %MISSILE%-Aufwertung ausrüsten."
    },
    "Inquisitor": {
      name: "Inquisitor",
      ship: "TIE-v1-Turbojäger",
      text: "<i>Die gefürchteten Inquisitoren haben nicht nur freie Hand bei der Ausübung ihrer Pflichten, sondern auch Zugang zu modernster Spitzentechnik wie dem TIE-v1-Turbojäger-Prototypen.</i>"
    },
    "Jake Farrell": {
      name: "Jake Farrell",
      ship: "RZ-1-A-Flügler",
      text: "Nachdem du eine %BARRELROLL%- oder %BOOST%-Aktion durchgeführt hast, darfst du ein befreundetes Schiff in Reichweite 0-1 wählen. Jenes Schiff darf eine %FOCUS%-Aktion durchführen.%LINEBREAK%<strong>Schwenkbare Schubdüsen:</strong> Nachdem du eine Aktion durchgeführt hast, darfst du eine rote %BOOST%-Aktion durchführen."
    },
    "Jakku Gunrunner": {
      name: "Waffenschmuggler von Jakku",
      ship: "Quadrijet-Transferschlepper",
      text: "<i>Der Quadrijet-Transferschlepper, im Volksmund „Quadjumper“ genannt, ist gleichermaßen behände in Weltall und Atmosphäre, was ihn zu einem beliebten Schmuggler- und Entdeckerschiff macht. </i>%LINEBREAK%<strong>Schlepperstrahl:</strong> <strong>Aktion:</strong> Wähle ein Schiff in deinem %FRONTARC% in Reichweite 1. Jenes Schiff erhält 1 Fangstrahlmarker oder 2&nbsp;Fangstrahlmarker, falls es in deinem %BULLSEYEARC%&nbsp;in Reichweite 1 ist."
    },
    "Jan Ors": {
      name: "Jan Ors",
      ship: "Leichter HWK-290-Frachter",
      text: "Solange ein befreundetes Schiff in deinem Feuerwinkel einen Primärangriff durchführt, falls du nicht gestresst bist, darfst du 1&nbsp;Stressmarker erhalten. Falls du das tust, darf jenes Schiff 1&nbsp;zusätzlichen Angriffswürfel werfen."
    },
    "Jek Porkins": {
      name: "Jek Porkins",
      ship: "T-65-X-Flügler",
      text: "Nachdem du einen Stressmarker bekommen hast, darfst du 1&nbsp;Angriffswürfel werfen, um ihn zu entfernen. Bei einem %HIT%-Ergebnis erleide 1&nbsp;%HIT%-Schaden."
    },
    "Joy Rekkoff": {
      name: "Joy Rekkoff",
      ship: "Fangjäger",
      text: "Solange du einen Angriff durchführst, darfst du 1&nbsp;%CHARGE% von einer ausgerüsteten %TORPEDO%-Aufwertung ausgeben. Falls du das tust, wirft der Verteidiger 1&nbsp;Verteidigungswürfel weniger.%LINEBREAK%<strong>Concordianischer Wirbel:</strong> Solange du verteidigst, falls die Angriffsreichweite 1 ist und du im %FRONTARC% des Angreifers bist, ändere 1&nbsp;Ergebnis in ein %EVADE%-Ergebnis."
    },
    "Kaa'to Leeachos": {
      name: "Kaa'to Leeachos",
      ship: "Z-95-AF4-Kopfjäger",
      text: "Zu Beginn der Kampfphase darfst du 1&nbsp;befreundetes Schiff in Reichweite 0-2 wählen. Falls du das tust, transferiere 1&nbsp;Fokus- oder Ausweichmarker von jenem Schiff auf dich selbst."
    },
    "Kad Solus": {
      name: "Kad Solus",
      ship: "Fangjäger",
      text: "Nachdem du ein rotes Manöver vollständig ausgeführt hast, erhalte 2 Fokusmarker.%LINEBREAK%<strong>Concordianischer Wirbel:</strong> Solange du verteidigst, falls die Angriffsreichweite 1 ist und du im %FRONTARC% des Angreifers bist, ändere 1&nbsp;Ergebnis in ein %EVADE%-Ergebnis."
    },
    "Kanan Jarrus": {
      name: "Kanan Jarrus",
      ship: "Leichter VCX-100-Frachter",
      text: "Solange ein befreundetes Schiff in deinem Feuerwinkel verteidigt, darfst du 1&nbsp;%FORCE% ausgeben. Falls du das tust, wirft der Angreifer 1 Angriffswürfel weniger.%LINEBREAK%<strong>Heckgeschütz:</strong> Solange du ein angedocktes Schiff hast, hast du eine %REARARC%-Primärwaffe mit einem Angriffswert in Höhe des Angriffswertes der %FRONTARC%-Primärwaffe deines angedockten Schiffes."
    },
    "Kashyyyk Defender": {
      name: "Verteidiger von Kashyyyk",
      ship: "Auzituck-Kanonenboot",
      text: "<i>Mit seinen drei weitreichenden Sureggi-Zwillingslaserkanonen soll das Auzituck-Kanonenboot Sklavenjäger im Kashyyyk-System abschrecken.</i>"
    },
    "Kath Scarlet": {
      name: "Kath Scarlet",
      ship: "Patrouillenboot der Firespray-Klasse",
      text: "Solange du einen Primärangriff durchführst, falls mindestens 1&nbsp;befreundetes nicht-limitiertes Schiff in Reichweite 0 des Verteidigers ist, wirf 1&nbsp;zusätzlichen Angriffswürfel."
    },
    "Kavil": {
      name: "Kavil",
      ship: "BTL-A4-Y-Flügler",
      text: "Solange du einen Nicht-%FRONTARC%-Angriff durchführst, wirf 1&nbsp;zusätzlichen Angriffswürfel."
    },
    "Ketsu Onyo": {
      name: "Ketsu Onyo",
      ship: "Jagdschiff der Lanzen-Klasse",
      text: "Zu Beginn der Kampfphase darfst du 1&nbsp;Schiff wählen, das sowohl in deinem %FRONTARC%&nbsp;als auch in deinem %SINGLETURRETARC% und in Reichweite 0-1 ist. Falls du das tust, erhält jenes Schiff 1 Fangstrahlmarker."
    },
    "Knave Squadron Escort": {
      name: "Eskorte der Schurken-Staffel",
      ship: "E-Flügler",
      text: "<i>Der E-Flügler verbindet die besten Eigenschaften von X-Flügler und A-Flügler, und kann mit überlegener Feuerkraft, Geschwindigkeit und Manövrierbarkeit aufwarten.</i>%LINEBREAK% <strong>Experimentelle Scanner:</strong> Du kannst Ziele jenseits von Reichweite 3 erfassen. Du kannst keine Ziele in Reichweite 1 erfassen."
    },
    "Koshka Frost": {
      name: "Koshka Frost",
      ship: "Patrouillenboot der Firespray-Klasse",
      text: "Solange du verteidigst oder einen Angriff durchführst, falls das feindliche Schiff gestresst ist, darfst du 1 deiner Würfel neu werfen."
    },
    "Krassis Trelix": {
      name: "Krassis Trelix",
      ship: "Patrouillenboot der Firespray-Klasse",
      text: "Du kannst %FRONTARC%-Spezialangriffe von deinem %REARARC% aus durchführen.%LINEBREAK%Solange du einen Spezialangriff durchführst, darfst du 1 Angriffswürfel neu werfen."
    },
    "Kullbee Sperado": {
      name: "Kullbee Sperado",
      ship: "T-65-X-Flügler",
      text: "Nachdem du eine %BARRELROLL%- oder %BOOST%-Aktion durchgeführt hast, darfst du deine ausgerüstete %CONFIG%-Aufwertungskarte umdrehen."
    },
    "Kyle Katarn": {
      name: "Kyle Katarn",
      ship: "Leichter HWK-290-Frachter",
      text: "Zu Beginn der Kampfphase darfst du 1 deiner Fokusmarker auf ein&nbsp;befreundetes Schiff in deinem Feuerwinkel transferieren."
    },
    "L3-37": {
      name: "L3-37",
      ship: "Modifizierter YT-1300-Frachter",
      text: "Falls du keine Schilde hast, verringere die Schwierigkeit deiner Drehmanöver (%BANKLEFT% und %BANKRIGHT%) ."
    },
    "L3-37 (Escape Craft)": {
      name: "L3-37 (Escape Craft)",
      ship: "Fluchtschiff",
      text: "Falls du keine Schilde hast, verringere die Schwierigkeit deiner Drehmanöver (%BANKLEFT% und %BANKRIGHT%) .%LINEBREAK%<strong>Co-Pilot:</strong> Solange du angedockt bist, hat dein Träger-Schiff deine Piloten-Fähigkeit zusätzlich zu seiner eigenen."
    },
    "Laetin A'shera": {
      name: "Laetin A'shera",
      ship: "M3-A-Abfangjäger",
      text: "Nachdem du verteidigt oder einen Angriff durchgeführt hast, falls der Angriff verfehlt hat, erhalte 1 Ausweichmarker.%LINEBREAK%<strong>Waffenaufhängung:</strong> Du kannst 1&nbsp;%CANNON%-,&nbsp;%TORPEDO%- oder %MISSILE%-Aufwertung ausrüsten."
    },
    "Lando Calrissian": {
      name: "Lando Calrissian",
      ship: "Modifizierter leichter YT-1300-Frachter",
      text: "Nachdem du ein blaues Manöver vollständig ausgeführt hast, darfst du ein befreundetes Schiff in Reichweite 0-3 wählen. Jenes Schiff darf eine Aktion durchführen."
    },
    "Lando Calrissian (Scum)": {
      name: "Lando Calrissian (Scum)",
      ship: "Modifizierter YT-1300-Frachter",
      text: "Nachdem du Würfel geworfen hast, falls du nicht gestresst bist, darfst du 1 Stressmarker erhalten um alle deine Leerseiten neu zu werfen."
    },
    "Lando Calrissian (Scum) (Escape Craft)": {
      name: "Lando Calrissian (Scum) (Escape Craft)",
      ship: "Fluchtschiff",
      text: "Nachdem du Würfel geworfen hast, falls du nicht gestresst bist, darfst du 1 Stressmarker erhalten um alle deine Leerseiten neu zu werfen.%LINEBREAK%<strong>Co-Pilot:</strong> Solange du angedockt bist, hat dein Träger-Schiff deine Piloten-Fähigkeit zusätzlich zu seiner eigenen."
    },
    "Latts Razzi": {
      name: "Latts Razzi",
      ship: "Leichter YV-666-Frachter",
      text: "Zu Beginn der Kampfphase darfst du ein Schiff in Reichweite 1 wählen und eine Zielerfassung, die du auf jenem Schiff hast, ausgeben. Falls du das tust, erhält jenes Schiff 1 Fangstrahlmarker."
    },
    "Leevan Tenza": {
      name: "Leevan Tenza",
      ship: "T-65-X-Flügler",
      text: "Nachdem du eine %BARRELROLL%- oder %BOOST%-Aktion durchgeführt hast, darfst du eine rote %EVADE%-Aktion durchführen."
    },
    "Lieutenant Blount": {
      name: "Lieutenant Blount",
      ship: "Z-95-AF4-Kopfjäger",
      text: "Solange du einen Primärangriff durchführst, falls mindestens 1 anderes befreundetes Schiff in Reichweite 0-1 des Verteidigers ist, darfst du 1 zusätzlichen Angriffswürfel werfen."
    },
    "Lieutenant Karsabi": {
      name: "Lieutenant Karsabi",
      ship: "Sternflügler der Alpha-Klasse",
      text: "Nachdem du einen Entwaffnet-Marker erhalten hast, falls du nicht gestresst bist, darfst du 1 Stressmarker erhalten, um 1 Entwaffnet-Marker zu entfernen."
    },
    "Lieutenant Kestal": {
      name: "Lieutenant Kestal",
      ship: "TIE/ag-Agressor",
      text: "Solange du einen Angriff durchführst, nachdem der Verteidiger Verteidigungswürfel geworfen hat, darfst du 1&nbsp;Fokusmarker ausgeben, um alle Leerseiten/%FOCUS%-Ergebnisse des Verteidigers zu negieren."
    },
    "Lieutenant Sai": {
      name: "Lieutenant Sai",
      ship: "T-4A-Raumfähre der Lambda-Klasse",
      text: "Nachdem du eine %COORDINATE%-Aktion durchgeführt hast, falls das von dir gewählte Schiff eine Aktion aus deiner Aktionsleiste durchgeführt hat, darfst du jene Aktion durchführen."
    },
    "Lok Revenant": {
      name: "Lok-Pirat",
      ship: "Scurrg-H-6-Bomber",
      text: "<i>Das Nubianische Entwicklungskollektiv konstruierte den Scurrg-H-6-Bomber als vielseitige Jagdmaschine, ausgestattet mit Hochleistungsschilden und einem tödlichen Waffenarsenal.</i>"
    },
    "Lothal Rebel": {
      name: "Rebell von Lothal",
      ship: "Leichter VCX-100-Frachter",
      text: "<i>Der VCX-100 ist ein weiteres Erfolgsmodell der Corellianischen Ingenieursgesellschaft, geräumiger und mit mehr Ausstattungsoptionen als die beliebte YT-Serie.</i>%LINEBREAK%<strong>Heckgeschütz:</strong> Solange du ein angedocktes Schiff hast, hast du eine %REARARC%-Primärwaffe mit einem Angriffswert in Höhe des Angriffswertes der %FRONTARC%-Primärwaffe deines angedockten Schiffes."
    },
    "Lowhhrick": {
      name: "Wullffwarro",
      ship: "Auzituck-Kanonenboot",
      text: "Solange du einen Primärangriff durchführst, falls du beschädigt bist, darfst du 1 zusätzlichen Angriffswürfel werfen."
    },
    "Luke Skywalker": {
      name: "Luke Skywalker",
      ship: "T-65-X-Flügler",
      text: "Nachdem du zum Verteidiger geworden bist (bevor Würfel geworfen werden), darfst du 1&nbsp;%FORCE% wiederherstellen."
    },
    "Maarek Stele": {
      name: "Maarek Stele",
      ship: "TIE-x1-Turbojäger",
      text: "Solange du einen Angriff durchführst, falls dem Verteidiger eine offene Scha­dens­karte zugeteilt werden würde, ziehe stattdessen 3 Schadenskarten, wähle 1&nbsp;und lege die übrigen ab.%LINEBREAK%<strong>Verbesserter Zielcomputer:</strong> Solange du einen Primärangriff gegen einen Ver­tei­diger durchführst, den du als Ziel erfasst hast, wirf 1&nbsp;zusätzlichen An­griffs­würfel und ändere 1&nbsp;%HIT%-Ergebnis in ein %CRIT%-Ergebnis."
    },
    "Magva Yarro": {
      name: "Magva Yarro",
      ship: "UT-60D-U-Flügler",
      text: "Solange ein befreundetes Schiff in Reichweite 0-2 verteidigt, kann der Angreifer nicht mehr als 1&nbsp;Angriffswürfel neu werfen."
    },
    "Major Rhymer": {
      name: "Major Rhymer",
      ship: "TIE/sa-Bomber",
      text: "Solange du einen %TORPEDO%- oder %MISSILE%-Angriff durchführst, darfst du die Reichweitenbedingung um 1 erhöhen oder verringern, bis zu einem Limit von 0-3. %LINEBREAK%<strong>Wendiger Bomber:</strong> Falls du unter Verwendung einer %STRAIGHT%-Schablone ein Gerät abwerfen würdest, darfst du stattdessen eine %BANKLEFT%- oder %BANKRIGHT%-Schablone derselben Geschwindigkeit verwenden."
    },
    "Major Vermeil": {
      name: "Major Vermeil",
      ship: "TIE-Schnitter",
      text: "Solange du einen Angriff durchführst, falls der Verteidiger keine grünen Marker hat, darfst du 1 deiner Leerseiten- oder %FOCUS%-Ergebnisse in ein %HIT%-Ergebnis ändern. %LINEBREAK%<strong>Adaptive Querruder:</strong> Bevor du dein Rad aufdeckst, falls du nicht gestresst bist, <b>musst</b> du ein weißes [1&nbsp;%BANKLEFT%]-, [1&nbsp;%STRAIGHT%]- oder [1&nbsp;%BANKRIGHT%]-Manöver ausführen."
    },
    "Major Vynder": {
      name: "Major Vynder",
      ship: "Sternflügler der Alpha-Klasse",
      text: "Solange du verteidigst, falls du entwaffnet bist, wirf 1&nbsp;zusätzlichen Verteidigungswürfel."
    },
    "Manaroo": {
      name: "Manaroo",
      ship: "JumpMaster 5000",
      text: "Zu Beginn der Kampfphase darfst du ein befreundetes Schiff in Reichweite 0-1 wählen. Falls du das tust, transferiere alle grünen Marker, die dir zugeordnet sind, auf jenes Schiff."
    },
    "Miranda Doni": {
      name: "Miranda Doni",
      ship: "BTL-S8-K-Flügler",
      text: "Solange du einen Primärangriff durchführst, darfst du entweder 1&nbsp;Schild ausgeben, um 1 zusätzlichen Angriffswürfel zu werfen, oder, falls du keine Schilde hast, du darfst 1&nbsp;Angriffswürfel weniger werfen, um 1&nbsp;Schild wiederherzustellen."
    },
    "Moralo Eval": {
      name: "Moralo Eval",
      ship: "Leichter YV-666-Frachter",
      text: "Falls du fliehen würdest, darfst du 1&nbsp;%CHARGE%&nbsp;ausgeben. Falls du das tust, platziere dich selbst stattdessen in der Reserve. Zu Beginn der nächsten Planungsphase platziere dich selbst innerhalb von Reichweite 1 des Spielflächenrandes, über den du geflohen bist."
    },
    "Norra Wexley (Y-Wing)": {
      name: "Norra Wexley (Y-Wing)",
      ship: "BTL-A4-Y-Flügler",
      text: "Solange du verteidigst, falls ein feindliches Schiff in Reichweite 0-1 ist, füge 1&nbsp;%EVADE%-Ergebnis zu deinen Würfelergebnissen hinzu."
    },
    "Norra Wexley": {
      name: "Norra Wexley",
      ship: "ARC-170-Sternenjäger",
      text: "Solange du verteidigst, falls ein feindliches Schiff in Reichweite 0-1 ist, füge 1&nbsp;%EVADE%-Ergebnis zu deinen Würfelergebnissen hinzu."
    },
    "Nu Squadron Pilot": {
      name: "Pilot der Nu-Staffel",
      ship: "Sternflügler der Alpha-Klasse",
      text: "<i>Inspiriert von anderen Modellen der Cygnus Raumwerften, ist der Sternflügler der Alpha-Klasse ein vielseitiges Kanonenboot, das für verschiedene Einsatzgebiete umgerüstet werden kann und somit ideal für die Spezialeinheiten der Imperialen Flotte ist.</i>"
    },
    "N'dru Suhlak": {
      name: "N'dru Suhlak",
      ship: "Z-95-AF4-Kopfjäger",
      text: "Solange du einen Primärangriff durchführst, falls keine anderen befreundeten Schiffe in Reichweite 0-2 sind, wirf 1 zusätzlichen Angriffswürfel."
    },
    "Obsidian Squadron Pilot": {
      name: "Pilot der Obsidian-Staffel",
      ship: "TIE/ln-Jäger",
      text: "<i>Der Zwillingsionenantrieb des TIE-Jägers war auf Geschwindigkeit optimiert und machte den TIE/ln zu einem der wendigsten Raumschiffe, die je in Massen produziert wurden.</i>"
    },
    "Old Teroch": {
      name: "Der alte Teroch",
      ship: "Fangjäger",
      text: "Zu Beginn der Kampfphase darfst du 1&nbsp;feindliches Schiff in Reichweite 1 wählen. Falls du das tust und du in seinem %FRONTARC% bist, entfernt es alle seine grünen Marker.%LINEBREAK%<strong>Concordianischer Wirbel:</strong> Solange du verteidigst, falls die Angriffsreichweite 1 ist und du im %FRONTARC% des Angreifers bist, ändere 1&nbsp;Ergebnis in ein %EVADE%-Ergebnis."
    },
    "Omicron Group Pilot": {
      name: "Pilot der Omicron-Gruppe",
      ship: "T-4A-Raumfähre der Lambda-Klasse",
      text: "<i>Die Raumfähre der Lambda-Klasse zeichnet sich durch ihre außergewöhnliche Drei-Tragflächen-Form und modernste Sensortechnologie aus. Als leichtes Multifunktionsschiff übernimmt sie eine wichtige Rolle in der Imperialen Flotte.</i>"
    },
    "Onyx Squadron Ace": {
      name: "Fliegerass der Onyx-Staffel",
      ship: "TIE/D-Abwehrjäger",
      text: "<i>Der experimentelle TIE-Abwehrjäger stellt alle anderen modernen Sternenjäger in den Schatten, wenngleich Größe, Schubkraft und Bewaffnung das Gewicht und den Preis des Modells in die Höhe treiben.</i>%LINEBREAK%<strong>Vollgas:</strong> Nachdem du ein Manöver mit Geschwindigkeit 3-5 vollständig ausgeführt hast, darfst du eine %EVADE%-Aktion durchführen."
    },
    "Onyx Squadron Scout": {
      name: "Aufklärer der Onyx-Staffel",
      ship: "TIE/ag-Agressor",
      text: "<i>Der für den Langzeiteinsatz konzipierte TIE/ag wird in erster Linie von Elitepiloten geflogen, die das Potential des schwer bewaffneten und wendigen Jägers voll ausschöpfen können.</i>"
    },
    "Outer Rim Pioneer": {
      name: "Pionier aus dem Outer Rim",
      ship: "Fluchtschiff",
      text: "Befreundete Schiffe in Reichweite 0-1 können Angriffe in Reichweite 0 zu Hindernissen durchführen.%LINEBREAK%<strong>Co-Pilot:</strong> Solange du angedockt bist, hat dein Träger-Schiff deine Piloten-Fähigkeit zusätzlich zu seiner eigenen."
    },
    "Outer Rim Smuggler": {
      name: "Schmuggler aus dem ",
      ship: "Modifizierter leichter YT-1300-Frachter",
      text: "<i>Mit seiner robusten Bauweise und modularen Konstruktion gehört der YT-1300 zu den beliebtesten, weitverbreitetsten und am stärksten modifizierten Raumfrachtern der Galaxis. </i>"
    },
    "Palob Godalhi": {
      name: "Palob Godalhi",
      ship: "Leichter HWK-290-Frachter",
      text: "Zu Beginn der Kampfphase darfst du 1 feindliches Schiff in deinem Feuerwinkel in Reichweite 0-2 wählen. Falls du das tust, transferiere 1 Fokus- oder Ausweichmarker von jenem Schiff auf dich selbst."
    },
    "Partisan Renegade": {
      name: "Überzeugter Partisan",
      ship: "UT-60D-U-Flügler",
      text: "<i>Ursprünglich hatten sich Saw Gerreras Partisanen während der Klonkriege formiert, um den Streitkräften der Separatisten auf Onderon die Stirn zu bieten. Als das Imperium die Macht übernahm, setzten sie ihren Kampf gegen die Tyrannei einfach fort.</i>"
    },
    "Patrol Leader": {
      name: "Patrouillenführer",
      ship: "VT-49-Decimator",
      text: "<i>Das Kommando über einen VT-49-Decimator zu erhalten, gilt unter imperialen Flottenoffizieren der mittleren Rangebenen als äußerst erstrebenswertes Ziel.</i>"
    },
    "Phoenix Squadron Pilot": {
      name: "Pilot der Phönix-Staffel",
      ship: "RZ-1-A-Flügler",
      text: "<i>Unter der Führung von Commander Jun Sato stellen sich die tapferen, aber unerfahrenen Piloten der Phönix-Staffel dem aussichtslosen Kampf gegen das Galaktische Imperium.</i>%LINEBREAK%<strong>Schwenkbare Schubdüsen:</strong> Nachdem du eine Aktion durchgeführt hast, darfst du eine rote %BOOST%-Aktion durchführen."
    },
    "Planetary Sentinel": {
      name: "Planetarer Wachposten",
      ship: "TIE/sk-Stürmer",
      text: "<i>Zum Schutz seiner vielen militärischen Einrichtungen benötigt das Imperium eine mobile und wachsame Verteidigungsstreitmacht.</i>%LINEBREAK% <strong>Adaptive Querruder:</strong> Bevor du dein Rad aufdeckst, falls du nicht gestresst bist, <b>musst</b> du ein weißes [1&nbsp;%BANKLEFT%]-, [1&nbsp;%STRAIGHT%]- oder [1&nbsp;%BANKRIGHT%]-Manöver ausführen."
    },
    "Prince Xizor": {
      name: "Prinz Xizor",
      ship: "Angriffsplattform der Sternenviper-Klasse",
      text: "Solange du verteidigst, nach dem Schritt „Ergebnisse neutralisieren“, darf ein anderes befreundetes Schiff in Reichweite 0-1 und im Angriffswinkel 1&nbsp;%HIT%- oder %CRIT%-Schaden erleiden. Falls es das tut, negiere 1&nbsp;passendes Ergebnis.%LINEBREAK%<strong>Mikrodüsen:</strong> Solange du eine Fassrolle durchführst, <b>musst</b> du die %BANKLEFT%-oder %BANKRIGHT%-Schablone  anstatt der %STRAIGHT%-Schablone verwenden."
    },
    "Quinn Jast": {
      name: "Quinn Jast",
      ship: "M3-A-Abfangjäger",
      text: "Zu Beginn der Kampfphase darfst du 1 Entwaffnet-Marker erhalten, um 1&nbsp;%CHARGE% von 1 deiner ausgerüsteten Aufwertungen wiederherzustellen.%LINEBREAK%<strong>Waffenaufhängung:</strong> Du kannst 1&nbsp;%CANNON%-,&nbsp;%TORPEDO%- oder %MISSILE%-Aufwertung ausrüsten."
    },
    "Rear Admiral Chiraneau": {
      name: "Konteradmiral Chiraneau",
      ship: "VT-49-Decimator",
      text: "Solange du einen Angriff durchführst, falls du verstärkt bist und der Verteidiger in dem %FULLFRONTARC% oder %FULLREARARC% ist, der zu deinem Verstärkungsmarker passt, darfst du 1 deiner %FOCUS%-Ergebnisse in ein %CRIT%-Ergebnis ändern."
    },
    "Rebel Scout": {
      name: "Rebellen-Aufklärer",
      ship: "Leichter HWK-290-Frachter",
      text: "<i>Ein Vogel mit ausgebreiteten Schwingen diente der Corellianischen Ingenieursgesellschaft als Vorbild für das Design der „Hawk“-Serie, einer Reihe von erstklassigen Transportschiffen. Der flinke und robuste HWK-290 wird oft von Rebellenagenten als mobile Operationsbasis eingesetzt.</i>"
    },
    "Red Squadron Veteran": {
      name: "Veteran der roten Staffel",
      ship: "T-65-X-Flügler",
      text: "<i>Die rote Staffel wurde als Elite-Jägerverband gegründet und zählt einige der besten Piloten der Allianz zu ihren Mitgliedern.</i>"
    },
    "Rexler Brath": {
      name: "Rexler Brath",
      ship: "TIE/D-Abwehrjäger",
      text: "Nachdem du einen Angriff durchgeführt hast, der getroffen hat, falls du ausweichst, lege 1 der Schadenskarten des Verteidigers offen.%LINEBREAK%<strong>Vollgas:</strong> Nachdem du ein Manöver mit Geschwindigkeit 3-5 vollständig ausgeführt hast, darfst du eine %EVADE%-Aktion durchführen."
    },
    "Rho Squadron Pilot": {
      name: "Pilot der Rho-Staffel",
      ship: "Sternflügler der Alpha-Klasse",
      text: "<i>Die Elitepiloten der Rho-Staffel nutzen die Xg-1-Angriffskonfiguration sowie das Os-1-Waffenarsenal des Sternflüglers der Alpha-Klasse mit verheerender Effizienz, um der Rebellion das Fürchten zu lehren. </i>"
    },
    "Roark Garnet": {
      name: "Roark Garnet",
      ship: "Leichter HWK-290-Frachter",
      text: "Zu Beginn der Kampfphase darfst du 1 Schiff in deinem Feuerwinkel wählen. Falls du das tust, kämpft es in dieser Phase bei Initiative 7 anstatt bei seiner normalen Initiative."
    },
    "Rogue Squadron Escort": {
      name: "Eskorte der Renegaten-Staffel",
      ship: "E-Flügler",
      text: "<i>Die Spitzenpiloten der Renegaten-Staffel gehören zur absoluten Elite der Rebellion. </i>%LINEBREAK% <strong>Experimentelle Scanner:</strong> Du kannst Ziele jenseits von Reichweite 3 erfassen. Du kannst keine Ziele in Reichweite 1 erfassen."
    },
    "Saber Squadron Ace": {
      name: "Fliegerass der Saber-Staffel",
      ship: "TIE-Abfangjäger",
      text: "<i>Angeführt von Baron Soontir Fel, gehören die Piloten der Saber-Staffel zur absoluten Elite des Imperiums. Ihre TIE-Abfangjäger werden mit blutroten Streifen markiert, um Piloten mit mindestens zehn bestätigten Abschüssen zu kennzeichnen.</i>%LINEBREAK%<strong>Automatische Schubdüsen:</strong> Nachdem du eine Aktion durchgeführt hast, darfst du eine rote %BARRELROLL%-Aktion oder eine rote %BOOST%-Aktion durchführen."
    },
    "Sabine Wren": {
      name: "Sabine Wren",
      ship: "Jagdshuttle",
      text: "Bevor du aktiviert wirst, darfst du eine %BARRELROLL%- oder %BOOST%-Aktion durchführen.%LINEBREAK%<strong>Geladen und entsichert:</strong> Solange du angedockt bist, nachdem dein Trägerschiff einen %FRONTARC%-Primärangriff oder %TURRET%-Angriff durchgeführt hat, darf es einen Bonus-%REARARC%-Primärangriff durchführen."
    },
    "Sabine Wren (TIE Fighter)": {
      name: "Sabine Wren (TIE Fighter)",
      ship: "TIE/ln-Jäger",
      text: "Bevor du aktiviert wirst, darfst du eine %BARRELROLL%- oder %BOOST%-Aktion durchführen."
    },
    "Sabine Wren (Scum)": {
      name: "Sabine Wren (Scum)",
      ship: "Jagdschiff der Lanzen-Klasse",
      text: "Solange du verteidigst, falls der Angreifer in deinem %SINGLETURRETARC% in Reichweite 0-2 ist, darfst du 1&nbsp;%FOCUS%-Ergebnis zu deinen Würfelergebnissen hinzufügen."
    },
    "Sarco Plank": {
      name: "Sarco Plank",
      ship: "Quadrijet-Transferschlepper",
      text: "Solange du verteidigst, darfst du deinen Wendigkeitswert so behandeln, als würde er der Geschwindigkeit des Manövers entsprechen, das du in dieser Runde ausgeführt hast.%LINEBREAK%<strong>Schlepperstrahl:</strong> <strong>Aktion:</strong> Wähle ein Schiff in deinem %FRONTARC% in Reichweite 1. Jenes Schiff erhält 1&nbsp;Fangstrahlmarker oder 2 Fangstrahlmarker, falls es in deinem %BULLSEYEARC% in Reichweite 1 ist."
    },
    "Saw Gerrera": {
      name: "Saw Gerrera",
      ship: "UT-60D-U-Flügler",
      text: "Solange ein beschädigtes befreundetes Schiff in Reichweite 0-3 einen Angriff durchführt, darf es 1&nbsp;Angriffswürfel neu werfen."
    },
    "Scarif Base Pilot": {
      name: "Pilot der Scarif-Basis",
      ship: "TIE-Schnitter",
      text: "<i>Der TIE-Schnitter war für den Transport von Elitetruppen in besonders hart umkämpfte Gefechtszonen konzipiert. Berühmt wurde er in der Schlacht von Scarif, wo er Direktor Krennics gefürchtete Todestruppen transportierte.</i>%LINEBREAK%<strong>Adaptive Querruder:</strong> Bevor du dein Rad aufdeckst, falls du nicht gestresst bist, <b>musst</b> du ein weißes [1&nbsp;%BANKLEFT%]-, [1&nbsp;%STRAIGHT%]- oder [1&nbsp;%BANKRIGHT%]-Manöver ausführen."
    },
    "Scimitar Squadron Pilot": {
      name: "Pilot der Scimitar-Staffel",
      ship: "TIE/sa-Bomber",
      text: "<i>Der TIE/sa ist außergewöhnlich wendig für einen Bomber und kann sein Ziel mit absoluter Präzision anvisieren, um den Kollateralschaden zu minimieren. </i>%LINEBREAK%<strong>Wendiger Bomber:</strong> Falls du unter Verwendung einer %STRAIGHT%-Schablone ein Gerät abwerfen würdest, darfst du stattdessen eine %BANKLEFT%- oder %BANKRIGHT%-Schablone derselben Geschwindigkeit verwenden."
    },
    "Serissu": {
      name: "Serissu",
      ship: "M3-A-Abfangjäger",
      text: "Solange ein befreundetes Schiff in Reichweite 0-1 verteidigt, darf es 1&nbsp;seiner Würfel neu werfen.%LINEBREAK%<strong>Waffenaufhängung:</strong> Du kannst 1&nbsp;%CANNON%-,&nbsp;%TORPEDO%- oder %MISSILE%-Aufwertung ausrüsten."
    },
    "Seventh Sister": {
      name: "Siebte Schwester",
      ship: "TIE-v1-Turbojäger",
      text: "Solange du einen Primärangriff durchführst, vor dem Schritt „Ergebnisse neutralisieren“, darfst du 2&nbsp;%FORCE% ausgeben, um 1&nbsp;%EVADE%-Ergebnis zu negieren."
    },
    "Seyn Marana": {
      name: "Seyn Marana",
      ship: "TIE/ln-Jäger",
      text: "Solange du einen Angriff durchführst, darfst du 1&nbsp;%CRIT%-Ergebnis ausgeben. Falls du das tust, teile dem Verteidiger 1&nbsp;verdeckte Schadenskarte zu, dann negiere deine übrigen Ergebnisse."
    },
    "Shadowport Hunter": {
      name: "Schattenhafen-Jäger",
      ship: "Jagdschiff der Lanzen-Klasse",
      text: "<i>Verbrechersyndikate fördern die mörderischen Talente ihrer treuen Geschäftspartner, indem sie sie mit der besten Technologie auf dem Markt ausstatten, beispielsweise mit dem schnellen und vorzüglichen Jagdschiff der Lanzen-Klasse.</i>"
    },
    "Shara Bey": {
      name: "Shara Bey",
      ship: "ARC-170-Sternenjäger",
      text: "Solange du verteidigst oder einen Primärangriff durchführst, darfst du 1 Zielerfassung, die du auf dem feindlichen Schiff hast, ausgeben, um 1&nbsp;%FOCUS%-Ergebnis zu deinen Würfelergebnissen hinzuzufügen."
    },
    "Sienar Specialist": {
      name: "Experte von Sienar",
      ship: "TIE/ag-Agressor",
      text: "<i>Bei der Entwicklung des TIE-Aggressors setzte Sienar Flottensysteme mehr auf Vielseitigkeit und Leistung als auf reine Kosteneffizienz.</i>"
    },
    "Sigma Squadron Ace": {
      name: "Fliegerass der Sigma-Staffel",
      ship: "TIE/ph-Phantom",
      text: "<i>Der TIE-Phantom ist nicht nur mit Schilden und einem Hyperantrieb, sondern auch mit fünf Laserkanonen ausgestattet, was ihn zu einem der schlagkräftigsten Jäger des Imperiums macht.</i>%LINEBREAK%<strong>Stygium-Gitter:</strong> Nachdem du dich enttarnt hast, darfst du eine %EVADE%-Aktion durchführen. Zu Beginn der Endphase darfst du 1 Ausweichmarker ausgeben, um 1 Tarnungsmarker zu erhalten."
    },
    "Skull Squadron Pilot": {
      name: "Pilot der Skull-Staffel",
      ship: "Fangjäger",
      text: "<i>Die Fliegerasse der Skull-Staffel bevorzugen eine aggressive Kampftaktik und vertrauen dabei auf die schwenkbaren Tragflächen ihrer Schiffe, um ihre Beute mit unübertroffener Agilität zur Strecke zu bringen. </i>%LINEBREAK% <strong>Concordianischer Wirbel:</strong> Solange du verteidigst, falls die Angriffsreichweite 1 ist und du im %FRONTARC% des Angreifers bist, ändere 1&nbsp;Ergebnis in ein %EVADE%-Ergebnis."
    },
    "Sol Sixxa": {
      name: "Sol Sixxa",
      ship: "Scurrg-H-6-Bomber",
      text: "Falls du ein Gerät unter Verwendung der [1&nbsp;%STRAIGHT%]-Schablone abwerfen würdest, darfst du es stattdessen unter Verwendung einer beliebigen anderen Schablone mit Geschwindigkeit 1 abwerfen."
    },
    "Soontir Fel": {
      name: "Soontir Fel",
      ship: "TIE-Abfangjäger",
      text: "Zu Beginn der Kampfphase, falls ein feindliches Schiff in deinem %BULLSEYEARC% ist, erhalte 1 Fokusmarker.%LINEBREAK%<strong>Automatische Schubdüsen:</strong> Nachdem du eine Aktion durchgeführt hast, darfst du eine rote %BARRELROLL%-Aktion oder eine rote %BOOST%-Aktion durchführen."
    },
    "Spice Runner": {
      name: "Spiceschmuggler",
      ship: "Leichter HWK-290-Frachter",
      text: "<i>Trotz seines vergleichsweise kleinen Laderaums ist der HWK-290 ein beliebtes Modell unter Schmugglern, die sich auf den diskreten Transport von hochwertigen Gütern spezialisiert haben.</i>"
    },
    "Storm Squadron Ace": {
      name: "Fliegerass der Storm-Staffel",
      ship: "TIE-x1-Turbojäger",
      text: "<i>Der TIE-x1-Turbojäger wurde nur in geringer Stückzahl produziert, dafür wurden viele seiner Innovationen bei der Entwicklung von Sienars nächstem TIE-Modell, dem TIE-Abfangjäger, übernommen.</i>%LINEBREAK%<strong>Verbesserter Zielcomputer:</strong> Solange du einen Primärangriff gegen einen Verteidiger durchführst, den du als Ziel erfasst hast, wirf 1 zusätzlichen Angriffswürfel und ändere 1&nbsp;%HIT%-Ergebnis in ein %CRIT%-Ergebnis."
    },
    "Sunny Bounder": {
      name: "Sunny Bounder",
      ship: "M3-A-Abfangjäger",
      text: "Solange du verteidigst oder einen Angriff durchführst, nachdem du deine Würfel geworfen oder neu geworfen hast, falls du auf jedem deiner Würfel dasselbe Ergebnis hast, darfst du 1&nbsp;passendes Ergebnis hinzufügen.%LINEBREAK%<strong>Waffenaufhängung:</strong> Du kannst 1&nbsp;%CANNON%-,&nbsp;%TORPEDO%- oder %MISSILE%-Aufwertung ausrüsten."
    },
    "Tala Squadron Pilot": {
      name: "Pilot der Tala-Staffel",
      ship: "Z-95-AF4-Kopfjäger",
      text: "<i>Die AF4-Serie ist das jüngste Modell der bewährten Kopfjäger-Produktreihe, die mit ihrem günstigen Preis und ihrer robusten Bauweise zu den Favoriten vieler unabhängiger Organisationen wie der Rebellion gehört.</i>"
    },
    "Talonbane Cobra": {
      name: "Talonbane Cobra",
      ship: "Kihraxz-Jäger",
      text: "Solange du in Angriffsreichweite 3 verteidigst oder in Angriffsreichweite&nbsp;1 einen Angriff durchführst, wirf 1&nbsp;zusätzlichen Würfel."
    },
    "Tansarii Point Veteran": {
      name: "Veteran von Tansarii ",
      ship: "M3-A-Abfangjäger",
      text: "<i>Mit dem Abschuss von Talonbane Cobra, einem Spitzenpiloten der Schwarzen Sonne, entschieden die Car'das-Schmuggler die Schlacht um Tansarii Point für sich. Bis heute sind die Veteranen dieses Scharmützels im ganzen Sektor hochangesehen. </i>%LINEBREAK%<strong>Waffenaufhängung:</strong> Du kannst 1&nbsp;%CANNON%-,&nbsp;%TORPEDO%- oder %MISSILE%-Aufwertung ausrüsten."
    },
    "Tel Trevura": {
      name: "Tel Trevura",
      ship: "JumpMaster 5000",
      text: "Falls du zerstört werden würdest, darfst du 1&nbsp;%CHARGE% ausgeben. Falls du das tust, lege stattdessen alle deine Schadenskarten ab, erleide 5&nbsp;%HIT%-Schaden und platziere dich selbst in der Reserve. Zu Beginn der nächsten Planungsphase platziere dich selbst innerhalb von Reichweite 1 deines Spielflächenrandes."
    },
    "Tempest Squadron Pilot": {
      name: "Pilot der Tornado-Staffel",
      ship: "TIE-x1-Turbojäger",
      text: "<i>Der TIE-Turbojäger war eine Weiterentwicklung der erfolgreichen TIE/ln-Baureihe, zusätzlich ausgestattet mit Deflektorschilden, besseren Waffen, geknickten Solarzellen und einem Hyperantrieb.</i>%LINEBREAK%<strong>Verbesserter Zielcomputer:</strong> Solange du einen Primärangriff gegen einen Verteidiger durchführst, den du als Ziel erfasst hast, wirf 1 zusätzlichen Angriffswürfel und ändere 1&nbsp;%HIT%-Ergebnis in ein %CRIT%-Ergebnis."
    },
    "Ten Numb": {
      name: "Ten Numb",
      ship: "A/SF-01-B-Flügler",
      text: "Solange du verteidigst oder einen Angriff durchführst, darfst du 1&nbsp;Stressmarker ausgeben, um alle deine %FOCUS%-Ergebnisse in %EVADE%- oder %HIT%-Ergebnisse zu ändern."
    },
    "Thane Kyrell": {
      name: "Thane Kyrell",
      ship: "T-65-X-Flügler",
      text: "Solange du einen Angriff durchführst, darfst du 1&nbsp;%FOCUS%-, %HIT%- oder %CRIT%-Ergebnis ausgeben, um dir die verdeckten Schadenskarten des Verteidigers anzusehen, 1 zu wählen und sie offenzulegen."
    },
    "Tomax Bren": {
      name: "Tomax Bren",
      ship: "TIE/sa-Bomber",
      text: "Nachdem du eine %RELOAD%-Aktion durchgeführt hast, darfst du 1&nbsp;%CHARGE% von 1 deiner ausgerüsteten %TALENT%-Aufwertungskarten wiederherstellen. %LINEBREAK%<strong>Wendiger Bomber:</strong> Falls du unter Verwendung einer %STRAIGHT%-Schablone ein Gerät abwerfen würdest, darfst du stattdessen eine %BANKLEFT%- oder %BANKRIGHT%-Schablone derselben Geschwindigkeit verwenden."
    },
    "Torani Kulda": {
      name: "Torani Kulda",
      ship: "M12-L-Kimogila-Jäger",
      text: "Nachdem du einen Angriff durchgeführt hast, erleidet jedes feindliche Schiff in deinem %BULLSEYEARC%1&nbsp;%HIT%-Schaden, es sei denn, es entfernt 1&nbsp;grünen Marker.%LINEBREAK%<strong>Todsicherer Treffer:</strong> Solange du einen Angriff durchführst, falls der Verteidiger in deinem %BULLSEYEARC% ist, können Verteidigungswürfel nicht unter Verwendung von grünen Markern modifiziert werden."
    },
    "Torkil Mux": {
      name: "Torkil Mux",
      ship: "Leichter HWK-290-Frachter",
      text: "Zu Beginn der Kampfphase darfst du 1 Schiff in deinem Feuerwinkel wählen. Falls du das tust, kämpft jenes Schiff in dieser Runde bei Initiative 0 anstatt bei seinem normalen Initiativewert."
    },
    "Trandoshan Slaver": {
      name: "Trandoshanischer Sklavenjäger",
      ship: "Leichter YV-666-Frachter",
      text: "<i>Sein geräumiges Trippeldecker-Design macht den YV-666 zu einem beliebten Schiff für Sklavenhändler und Kopfgeldjäger, die oft ein ganzes Deck für Gefangenentransporte umrüsten.</i>"
    },
    "Turr Phennir": {
      name: "Turr Phennir",
      ship: "TIE-Abfangjäger",
      text: "Nachdem du einen Angriff durchgeführt hast, darfst du eine %BARRELROLL%- oder %BOOST%-Aktion durchführen, auch falls du gestresst bist.%LINEBREAK%<strong>Automatische Schubdüsen:</strong> Nachdem du eine Aktion durchgeführt hast, darfst du eine rote %BARRELROLL%-Aktion oder eine rote %BOOST%-Aktion durchführen."
    },
    "Unkar Plutt": {
      name: "Unkar Plutt",
      ship: "Quadrijet-Transferschlepper",
      text: "Zu Beginn der Kampfphase, falls 1 oder mehrere andere Schiffe in Reichweite 0 sind, erhalten du und jedes andere Schiff in Reichweite 0 je 1 Fangstrahlmarker.%LINEBREAK%<strong>Schlepperstrahl:</strong> <strong>Aktion:</strong> Wähle ein Schiff in deinem %FRONTARC% in Reichweite 1. Jenes Schiff erhält 1 Fangstrahlmarker oder 2&nbsp;Fangstrahlmarker, falls es in deinem %BULLSEYEARC% in Reichweite 1 ist."
    },
    "Valen Rudor": {
      name: "Valen Rudor",
      ship: "TIE/ln-Jäger",
      text: "Nachdem ein befreundetes Schiff in Reichweite 0-1 verteidigt hat (nachdem ggf. Schaden abgehandelt worden ist), darfst du eine Aktion durchführen."
    },
    "Ved Foslo": {
      name: "Ved Foslo",
      ship: "TIE-x1-Turbojäger",
      text: "Solange du ein Manöver ausführst, darfst du stattdessen ein Manöver derselben Flugrichtung und Schwierigkeit, aber einer um 1 höheren oder niedrigeren Geschwindigkeit ausführen.%LINEBREAK%<strong>Verbesserter Zielcomputer:</strong> Solange du einen Primärangriff gegen einen Verteidiger durchführst, den du als Ziel erfasst hast, wirf 1 zusätzlichen Angriffswürfel und ändere 1&nbsp;%HIT%-Ergebnis in ein %CRIT%-Ergebnis."
    },
    "Viktor Hel": {
      name: "Viktor Hel",
      ship: "Kihraxz-Jäger",
      text: "Nachdem du verteidigt hast, falls du nicht genau 2 Verteidigungswürfel geworfen hast, erhält der Angreifer 1 Stressmarker."
    },
    "Warden Squadron Pilot": {
      name: "Pilot der Beschützer-Staffel",
      ship: "BTL-S8-K-Flügler",
      text: "<i>Der K-Flügler von Koensayr zeichnet sich durch einen topmodernen Sublicht-Antriebsmotor (kurz: SLAM) sowie beispiellose achtzehn Waffenaufhängungen aus. Was Geschwindigkeit und Feuerkraft anbelangt, steht er außer Konkurrenz.</i>"
    },
    "Wedge Antilles": {
      name: "Wedge Antilles",
      ship: "T-65-X-Flügler",
      text: "Solange du einen Angriff durchführst, wirft der Verteidiger 1&nbsp;Verteidigungswürfel weniger."
    },
    "Wild Space Fringer": {
      name: "Grenzgänger aus dem Wilden Raum",
      ship: "Leichter YT-2400-Frachter",
      text: "<i>Serienmäßig bietet der YT-2400 reichlich Laderaum. Allerdings opfern die meisten Besitzer einen Teil davon, um Platz für modifizierte Waffensysteme und extragroße Triebwerke zu schaffen.</i>%LINEBREAK%<strong>Toter Winkel:</strong> Solange du einen Primärangriff in Reichweite 0-1 durchführst, wende den Bonus für Reichweite 0-1 nicht an und wirf 1 Angriffswürfel weniger."
    },
    "Wullffwarro": {
      name: "Lowhhrick",
      ship: "Auzituck-Kanonenboot",
      text: "Nachdem ein befreundetes Schiff in Reichweite 0-1 zum Verteidiger geworden ist, darfst du 1 Verstärkungsmarker ausgeben. Falls du das tust, erhält jenes Schiff 1 Ausweichmarker."
    },
    "Zealous Recruit": {
      name: "Fanatischer Rekrut",
      ship: "Fangjäger",
      text: "<i>Jeder Pilot eines mandalorianischen Fangjägers beherrscht den Concordianischen Wirbel, ein Manöver, bei dem das schmale Profil des Jägers für einen tödlichen Frontalangriff genutzt wird. </i>%LINEBREAK% <strong>Concordianischer Wirbel:</strong> Solange du verteidigst, falls die Angriffsreichweite 1 ist und du im %FRONTARC% des Angreifers bist, ändere 1&nbsp;Ergebnis in ein %EVADE%-Ergebnis."
    },
    "Zertik Strom": {
      name: "Zertik Strom",
      ship: "TIE-x1-Turbojäger",
      text: "Während der Endphase darfst du eine Zielerfassung ausgeben, die du auf einem feindlichen Schiff hast, um 1 der Schadenskarten jenes Schiffes offenzulegen.%LINEBREAK%<strong>Verbesserter Zielcomputer:</strong> Solange du einen Primärangriff gegen einen Verteidiger durchführst, den du als Ziel erfasst hast, wirf 1 zusätzlichen Angriffswürfel und ändere 1&nbsp;%HIT%-Ergebnis in ein %CRIT%-Ergebnis."
    },
    "Zuckuss": {
      name: "Zuckuss",
      ship: "G-1A Sternenjäger",
      text: "Solange du einen Primärangriff durchführst, darfst du 1 zusätzlichen Angriffswürfel werfen. Falls du das tust, wirft der Verteidiger 1&nbsp;zusätzlichen Verteidigungswürfel."
    },
    '"Chopper"': {
      name: "„Chopper“",
      ship: "Leichter VCX-100-Frachter",
      text: "Zu Beginn der Kampfphase erhält jedes feindliche Schiff in Reichweite 0 2 Störsignalmarker. %LINEBREAK%<strong>Heckgeschütz:</strong> Solange du ein angedocktes Schiff hast, hast du eine %REARARC%-Primärwaffe mit einem Angriffswert in Höhe des Angriffswertes der %FRONTARC%-Primärwaffe deines angedockten Schiffes."
    },
    '"Countdown"': {
      name: "„Countdown“",
      ship: "TIE/sk-Stürmer",
      text: "Solange du verteidigst, nach dem Schritt „Ergebnisse neutralisieren“, falls du nicht gestresst bist, darfst du 1&nbsp;%HIT%-Schaden erleiden und 1&nbsp;Stressmarker erhalten. Falls du das tust, negiere alle Würfelergebnisse.%LINEBREAK%<strong>Adaptive Querruder:</strong> Bevor du dein Rad aufdeckst, falls du nicht gestresst bist, <b>musst</b> du ein weißes [1&nbsp;%BANKLEFT%]-, [1&nbsp;%STRAIGHT%]- oder [1&nbsp;%BANKRIGHT%]-Manöver ausführen."
    },
    '"Deathfire"': {
      name: "„Todesfeuer“",
      ship: "TIE/sa-Bomber",
      text: "Nachdem du zerstört worden bist, bevor du entfernt wirst, darfst du einen Angriff durchführen und 1 Gerät abwerfen oder starten.%LINEBREAK%<strong>Wendiger Bomber:</strong> Falls du unter Verwendung einer %STRAIGHT%-Schablone ein Gerät abwerfen würdest, darfst du stattdessen eine %BANKLEFT%- oder %BANKRIGHT%-Schablone derselben Geschwindigkeit verwenden."
    },
    '"Deathrain"': {
      name: "„Todesregen“",
      ship: "TIE/ca-Vergelter",
      text: "Nachdem du ein Gerät abgeworfen oder gestartet hast, darfst du eine Aktion durchführen."
    },
    '"Double Edge"': {
      name: "„Doppelklinge“",
      ship: "TIE/ag-Agressor",
      text: "Nachdem du einen %TURRET%- oder %MISSILE%-Angriff durchgeführt hast, der verfehlt hat, darfst du unter Verwendung einer anderen Waffe einen Bonusangriff durchführen."
    },
    '"Duchess"': {
      name: "„Herzogin“",
      ship: "TIE/sk-Stürmer",
      text: "Du darfst wählen, <strong>Adaptive Querruder</strong> nicht zu verwenden. %LINEBREAK%Du darfst <strong>Adaptive Querruder</strong> verwenden, auch solange du gestresst bist.%LINEBREAK%<strong>Adaptive Querruder:</strong> Bevor du dein Rad aufdeckst, falls du nicht gestresst bist, <b>musst</b> du ein weißes [1&nbsp;%BANKLEFT%]-, [1&nbsp;%STRAIGHT%]- oder [1&nbsp;%BANKRIGHT%]-Manöver ausführen."
    },
    '"Dutch" Vander': {
      name: "„Dutch“ Vander",
      ship: "BTL-A4-Y-Flügler",
      text: "Nachdem du die %LOCK%-Aktion durchgeführt hast, darfst du 1 befreundetes Schiff in Reichweite 1-3 wählen. Jenes Schiff darf das Objekt, das du als Ziel erfasst hast, als Ziel erfassen, wobei es die Reichweitenbeschränkung ignoriert."
    },
    '"Echo"': {
      name: "„Echo“",
      ship: "TIE/ph-Phantom",
      text: "Solange du dich enttarnst, <b>musst</b> du die [2&nbsp;%BANKLEFT%]- oder [2&nbsp;%BANKRIGHT%]-Schablone anstatt der [2&nbsp;%STRAIGHT%]-Schablone verwenden.%LINEBREAK%<strong>Stygium-Gitter:</strong> Nachdem du dich enttarnt hast, darfst du eine %EVADE%-Aktion durchführen. Zu Beginn der Endphase darfst du 1 Ausweichmarker ausgeben, um 1 Tarnungsmarker zu erhalten."
    },
    '"Howlrunner"': {
      name: "„Howlrunner“",
      ship: "TIE/ln-Jäger",
      text: "Solange ein befreundetes Schiff in Reichweite 0-1 einen Primärangriff durchführt, darf jenes Schiff 1&nbsp;Angriffswürfel neu werfen."
    },
    '"Leebo"': {
      name: "„Leebo“",
      ship: "Leichter YT-2400-Frachter",
      text: "Nachdem du verteidigt oder einen Angriff durchgeführt hast, falls du einen Berechnungsmarker ausgegeben hast, erhalte 1 Berechnungsmarker.%LINEBREAK%<strong>Toter Winkel:</strong> Solange du einen Primärangriff in Reichweite 0-1 durchführst, wende den Bonus für Reichweite 0-1 nicht an und wirf 1 Angriffswürfel weniger."
    },
    '"Mauler" Mithel': {
      name: "„Mauler“ Mithel",
      ship: "TIE/ln-Jäger",
      text: "Solange du einen Angriff in Angriffsreichweite 1 durchführst, wirf 1 zusätzlichen Angriffswürfel."
    },
    '"Night Beast"': {
      name: "„Nachtbestie“",
      ship: "TIE/ln-Jäger",
      text: "Nachdem du ein blaues Manöver vollständig ausgeführt hast, darfst du eine %FOCUS%-Aktion durchführen."
    },
    '"Pure Sabacc"': {
      name: "„Voller Sabacc“",
      ship: "TIE/sk-Stürmer",
      text: "Solange du einen Angriff durchführst, falls du 1 oder weniger Schadenskarten hast, darfst du 1 zusätzlichen Angriffswürfel werfen.%LINEBREAK%<strong>Adaptive Querruder:</strong> Bevor du dein Rad aufdeckst, falls du nicht gestresst bist, <b>musst</b> du ein weißes [1&nbsp;%BANKLEFT%]-, [1&nbsp;%STRAIGHT%]- oder [1&nbsp;%BANKRIGHT%]-Manöver ausführen."
    },
    '"Redline"': {
      name: "„Rote Linie“",
      ship: "TIE/ca-Vergelter",
      text: "Du kannst bis zu 2 Zielerfassungen aufrechterhalten. %LINEBREAK%Nachdem du eine Aktion durchgeführt hast, darfst du ein Ziel erfassen."
    },
    '"Scourge" Skutu': {
      name: "„Geißel“ Skutu ",
      ship: "TIE/ln-Jäger",
      text: "Solange du einen Angriff gegen einen Verteidiger in deinem %BULLSEYEARC% durchführst, wirf 1 zusätzlichen Angriffswürfel."
    },
    '"Vizier"': {
      name: "„Wesir“",
      ship: "TIE-Schnitter",
      text: "Nachdem du unter Verwendung deiner Schiffsfähigkeit <strong>Adaptive Querruder</strong> ein Manöver mit Geschwindigkeit 1 vollständig ausgeführt hast, darfst du eine %COORDINATE%-Aktion durchführen. Falls du das tust, überspringe deinen Schritt „Aktion durchführen“.%LINEBREAK%<strong>Adaptive Querruder:</strong> Bevor du dein Rad aufdeckst, falls du nicht gestresst bist, <b>musst</b> du ein weißes [1&nbsp;%BANKLEFT%]-, [1&nbsp;%STRAIGHT%]- oder [1&nbsp;%BANKRIGHT%]-Manöver ausführen."
    },
    '"Wampa"': {
      name: "„Wampa“",
      ship: "TIE/ln-Jäger",
      text: "Solange du einen Angriff durchführst, darfst du 1&nbsp;%CHARGE% ausgeben, um 1&nbsp;zusätzlichen Angriffswürfel zu werfen.%LINEBREAK%Nach dem Verteidigen, verliere 1&nbsp;%CHARGE%."
    },
    '"Whisper"': {
      name: "„Geflüster“",
      ship: "TIE/ph-Phantom",
      text: "Nachdem du einen Angriff durchgeführt hast, der getroffen hat, erhalte 1 Ausweichmarker.%LINEBREAK%<strong>Stygium-Gitter:</strong> Nachdem du dich enttarnt hast, darfst du eine %EVADE%-Aktion durchführen. Zu Beginn der Endphase darfst du 1 Ausweichmarker ausgeben, um 1 Tarnungsmarker zu erhalten."
    },
    '"Zeb" Orrelios': {
      name: "„Zeb“ Orrelios",
      ship: "Jagdshuttle",
      text: "Solange du verteidigst, werden %CRIT%-Ergebnisse neutralisiert, bevor %HIT%-Ergebnisse neutralisiert werden.%LINEBREAK%<strong>Geladen und entsichert:</strong> Solange du angedockt bist, nachdem dein Trägerschiff einen %FRONTARC%-Primärangriff oder %TURRET%-Angriff durchgeführt hat, darf es einen Bonus-%REARARC%-Primärangriff durchführen."
    },
    '"Zeb" Orrelios (Sheathipede)': {
      name: "„Zeb“ Orrelios (Sheathipede)",
      ship: "Raumfähre der Sheathipede-Klasse",
      text: "Solange du verteidigst, werden %CRIT%-Ergebnisse neutralisiert, bevor %HIT%-Ergebnisse neutralisiert werden.%LINEBREAK%<strong>Kommunikationsantennen:</strong> Solange du angedockt bist, erhält dein Trägerschiff %COORDINATE%. Bevor dein Trägerschiff aktiviert wird, darf es eine %COORDINATE%-Aktion durchführen."
    },
    '"Zeb" Orrelios (TIE Fighter)': {
      name: "„Zeb“ Orrelios (TIE Fighter)",
      ship: "TIE/ln-Jäger",
      text: "Solange du verteidigst, werden %CRIT%-Ergebnisse neutralisiert, bevor %HIT%-Ergebnisse neutralisiert werden."
    },
    "Poe Dameron": {
      text: "After you perform an action, you may spend 1 %CHARGE% to perform a white action, treating it as red. %LINEBREAK% WEAPON HARDPOINT: You can equip 1 %CANNON%, %TORPEDO% or %MISSILE% upgrade."
    },
    "Lieutenant Bastian": {
      text: "After a ship at range 1-2 is dealt a damage card, you may acquire a lock on that ship. %LINEBREAK% WEAPON HARDPOINT: You can equip 1 %CANNON%, %TORPEDO% or %MISSILE% upgrade."
    },
    '"Midnight"': {
      text: "While you defend or perform an attack, if you have a lock on the enemy ship, that ship's dice cannot be modified."
    },
    '"Longshot"': {
      text: "While you perform a primary attack at attack range 3, roll 1 additional attack die."
    },
    '"Muse"': {
      text: "At the start of the Engagement Phase, you may choose a friendly ship at range 0-1. If you do, that ship removes 1 stress token."
    },
    "Kylo Ren": {
      text: " After you defend, you may spend 1 %FORCE% to assign the I'll Show You the Dark Side condition to the attacker. %LINEBREAK% AUTOTHRUSTERS: After you perform an action. you may perform a red %BARRELROLL% or a red %BOOST% action."
    },
    '"Blackout"': {
      text: " ??? %LINEBREAK% AUTOTHRUSTERS: After you perform an action. you may perform a red %BARRELROLL% or a red %BOOST% action."
    },
    "Lieutenant Dormitz": {
      text: " ... are placed, other ... be placed anywhere in ... range 0-2 of you. %LINEBREAK% ... : while you perform a %CANNON% ... additional die. "
    },
    "Tallissan Lintra": {
      text: "While an enemy ship in your %BULLSEYEARC% performs an attack, you may spend 1 %CHARGE%.  If you do, the defender rolls 1 additional die."
    },
    "Lulo Lampar": {
      text: "While you defend or perform a primary attack, if you are stressed, you must roll 1 fewer defense die or 1 additional attack die."
    },
    '"Backdraft"': {
      text: " ... perform a %TURRET% primary ... defender is in your %BACKARC% ... additional dice. %LINEBREAK% ... TURRET: You can... indicator only to your ... must treat the %FRONTARC% ... your equipped %MISSILE% ... as %TURRET%. "
    },
    '"Quickdraw"': {
      text: " ??? %LINEBREAK% ... TURRET: You can... indicator only to your ... must treat the %FRONTARC% ... your equipped %MISSILE% ... as %TURRET%. "
    },
    "Rey": {
      text: " ... perform an attack, ... in your %FRONTARC%, you may ... change 1 of your blank ... or %HIT% result. "
    },
    "Han Solo (Resistance)": {
      text: " ??? "
    },
    "Chewbacca (Resistance)": {
      text: " ??? "
    },
    "Captain Seevor": {
      text: " While you defend or perform an attack, before the attack dice are rolled, if you are not in the enemy ship's %BULLSEYEARC%, you may spend 1 %CHARGE%. If you do, the enemy ship gains one jam token. "
    },
    "Mining Guild Surveyor": {
      text: " "
    },
    "Ahhav": {
      text: " ??? "
    },
    "Finch Dallow": {
      text: " ... drop a bomb, you ... play area touching ... instead. "
    }
  };
  upgrade_translations = {
    "0-0-0": {
      name: "0-0-0",
      text: "<i>Nur für Abschaum oder Staffel, die Darth Vader enthält</i>%LINEBREAK%Zu Beginn der Kampfphase darfst du 1 feindliches Schiff in Reichweite 0-1 wählen. Falls du das tust, erhältst du 1 Berechnungsmarker, es sei denn, jenes Schiff entscheidet sich dafür, 1&nbsp;Stressmarker zu erhalten."
    },
    "4-LOM": {
      name: "4-LOM",
      text: "<i>Nur für Abschaum</i>%LINEBREAK%Solange du einen Angriff durchführst, nachdem du Angriffswürfel geworfen hast, darfst du eine Art von grünen Markern benennen. Falls du das tust, erhalte 2 Ionenmarker und der Verteidiger kann während dieses Angriffs keine Marker der benannten Art ausgeben."
    },
    "Andrasta": {
      name: "Andrasta",
      ship: "Patrouillenboot der Firespray-Klasse",
      text: "<i>Fügt %RELOAD% hinzu</i>%LINEBREAK%<i>Nur für Abschaum</i>%LINEBREAK%Füge den %DEVICE%-Slot hinzu."
    },
    "Dauntless": {
      name: "Dauntless",
      ship: "VT-49-Decimator",
      text: "<i>Nur für Imperium</i>%LINEBREAK%Nachdem du ein Manöver teilweise ausgeführt hast, darfst du 1 weiße Aktion durchführen, wobei du jene Aktion behandelst, als wäre sie rot."
    },
    "Ghost": {
      name: "Ghost",
      ship: "Leichter VCX-100-Frachter",
      text: "<i>Nur für Rebellen</i>%LINEBREAK%Du kannst 1 Jagdshuttle oder eine Raumfähre der Sheathipede-Klasse andocken lassen.%LINEBREAK%Deine angedockten Schiffe können nur von deinen hinteren Stoppern aus abgesetzt werden."
    },
    "Havoc": {
      name: "Havoc",
      ship: "Scurrg-H-6-Bomber",
      text: "<i>Nur für Abschaum</i>%LINEBREAK%Entferne den %CREW%-Slot. Füge %SENSOR%- und %ASTROMECH%-Slots hinzu."
    },
    "Hound's Tooth": {
      name: "Reißzahn",
      ship: "Leichter YV-666-Frachter",
      text: "<i>Nur für Abschaum</i>%LINEBREAK%An dir kann 1&nbsp;Z-95-AF4-Kopfjäger andocken."
    },
    "IG-2000": {
      name: "IG-2000",
      ship: "Aggressor-Angriffsjäger",
      text: "<i>Nur für Abschaum</i>%LINEBREAK%Du hast die Pilotenfähigkeit jedes anderen befreundeten Schiffes mit der Aufwertung <strong>IG-2000</strong>."
    },
    "Marauder": {
      name: "Marodeur",
      ship: "Patrouillenboot der Firespray-Klasse",
      text: "<i>Nur für Abschaum</i>%LINEBREAK%Solange du einen %REARARC%-Primärangriff durchführst, darfst du 1 Angriffswürfel neu werfen.%LINEBREAK%Füge den %GUNNER%-Slot hinzu."
    },
    "Millennium Falcon": {
      name: "Millennium Falke",
      ship: "Modifizierter leichter YT-1300-Frachter",
      text: "<i>Fügt %EVADE% hinzu</i>%LINEBREAK%<i>Nur für Rebellen</i>%LINEBREAK%Solange du verteidigst, falls du ausweichst, darfst du 1 Verteidigungswürfel neu werfen."
    },
    "Mist Hunter": {
      name: "Nebeljäger",
      ship: "G-1A Sternenjäger",
      text: "<i>Fügt %BARRELROLL% hinzu</i>%LINEBREAK%<i>Nur für Abschaum</i>%LINEBREAK%Füge den %CANNON%-Slot hinzu."
    },
    "Moldy Crow": {
      name: "Moldy Crow",
      ship: "Leichter HWK-290-Frachter",
      text: "<i>Nur für Rebellen oder Abschaum</i>%LINEBREAK%Erhalte eine %FRONTARC%-Primärwaffe mit einem Wert von 3.%LINEBREAK%Während der Endphase, entferne bis zu 2 Fokusmarker nicht."
    },
    "Outrider": {
      name: "Outrider",
      ship: "Leichter YT-2400-Frachter",
      text: "<i>Nur für Rebellen</i>%LINEBREAK%Solange du einen versperrten Angriff durchführst, wirft der Verteidiger 1&nbsp;Verteidigungswürfel weniger.%LINEBREAK%Nachdem du ein Manöver vollständig ausgeführt hast, falls du dich durch ein Hindernis hindurchbewegt oder dich mit ihm überschnitten hast, darfst du 1 deiner roten oder orangefarbenen Marker entfernen."
    },
    "Phantom": {
      name: "Phantom",
      text: "<i>Nur für Rebellen</i>%LINEBREAK%Du kannst in Reichweite 0-1 andocken.",
      ship: ["Jagdshuttle", "Raumfähre der Sheathipede-Klasse"]
    },
    "Punishing One": {
      name: "Vollstrecker Eins",
      ship: "JumpMaster 5000",
      text: "<i>Nur für Abschaum</i>%LINEBREAK%Solange du einen Primärangriff durchführst, falls der Verteidiger in deinem %FRONTARC% ist, wirf 1&nbsp;zusätzlichen Angriffswürfel.%LINEBREAK%Entferne den %CREW%-Slot. Füge den %ASTROMECH%-Slot hinzu."
    },
    "ST-321": {
      name: "ST-321",
      ship: "T-4A-Raumfähre der Lambda-Klasse",
      text: "<i>Nur für Imperium</i>%LINEBREAK%Nachdem du eine %COORDINATE%-Aktion durchgeführt hast, darfst du ein feindliches Schiff in Reichweite 0-3 des von dir koordinierten Schiffes wählen. Falls du das tust, erfasse jenes feindliche Schiff als Ziel, wobei du die Reichweitenbeschränkung ignorierst."
    },
    "Shadow Caster": {
      name: "Shadow Caster",
      ship: "Jagdschiff der Lanzen-Klasse",
      text: "<i>Nur für Abschaum</i>%LINEBREAK%Nachdem du einen Angriff durchgeführt hast, der getroffen hat, falls der Verteidiger in deinem %SINGLETURRETARC% und in deinem %FRONTARC% ist, erhält der Verteidiger 1&nbsp;Fangstrahlmarker."
    },
    "Slave I": {
      name: "Sklave I",
      ship: "Patrouillenboot der Firespray-Klasse",
      text: "<i>Nur für Abschaum</i>%LINEBREAK%Nachdem du ein Wende­­manöver (%TURNLEFT% oder %TURNRIGHT%) oder Drehmanöver (%BANKLEFT% oder %BANKRIGHT%) aufgedeckt hast, darfst du dein Rad auf das Manöver derselben Geschwindigkeit und Flugrichtung in der anderen Orientierung einstellen.%LINEBREAK%Füge den %TORPEDO%-Slot hinzu."
    },
    "Virago": {
      name: "Virago",
      ship: "Angriffsplattform der Sternenviper-Klasse",
      text: "Während der Endphase darfst du 1&nbsp;%CHARGE% ausgeben, um eine rote %BOOST%-Aktion durchzuführen.%LINEBREAK%Füge den %MODIFICATION%-Slot hinzu."
    },
    "Ablative Plating": {
      name: "Ablative Panzerung",
      text: "<i>Nur für großes Schiff oder mittleres Schiff</i>%LINEBREAK%Bevor du Schaden durch ein Hindernis oder die Detonation einer befreundeten Bombe erleiden würdest, darfst du 1&nbsp;%CHARGE% ausgeben. Falls du das tust, verhindere 1 Schaden."
    },
    "Admiral Sloane": {
      name: "Admiral Sloane",
      text: "<i>Nur für Imperium</i>%LINEBREAK%Nachdem ein anderes befreundetes Schiff in Reichweite 0-3 verteidigt hat, falls es zerstört ist, erhält der Angreifer 2 Stressmarker.%LINEBREAK%Solange ein befreundetes Schiff in Reichweite 0-3 einen Angriff gegen ein gestresstes Schiff durchführt, darf es 1 Angriffswürfel neu werfen."
    },
    "Adv. Proton Torpedoes": {
      name: "Verstärkte Protonentorpedos",
      text: "<strong>Angriff (</strong>%LOCK%<strong>):</strong> Gib 1&nbsp;%CHARGE% aus. Ändere 1&nbsp;%HIT%-Ergebnis in ein&nbsp;%CRIT%-Ergebnis."
    },
    "Advanced SLAM": {
      name: "Verbesserter SLAM",
      text: "<i>Benötigt %SLAM%</i>%LINEBREAK%Nachdem du eine %SLAM%-Aktion durchgeführt hast, falls du das Manöver vollständig ausgeführt hast, darfst du eine weiße Aktion aus deiner Aktionsleiste durchführen, wobei du jene Aktion behandelst, als wäre sie rot."
    },
    "Advanced Sensors": {
      name: "Verbesserte Sensoren",
      text: "Nachdem du dein Rad aufgedeckt hast, darfst du 1 Aktion durchführen.%LINEBREAK%Falls du das tust, kannst du während deiner Aktivierung keine weitere Aktion durchführen."
    },
    "Afterburners": {
      name: "Nachbrenner",
      text: "<i>Nur für kleines Schiff</i>%LINEBREAK%Nachdem du ein Manöver mit Geschwindigkeit 3-5 vollständig ausgeführt hast, darfst du 1&nbsp;%CHARGE% ausgeben, um eine %BOOST%-Aktion durchzuführen, auch solange du gestresst bist."
    },
    "Agent Kallus": {
      name: "Agent Kallus",
      text: "<i>Nur für Imperium</i>%LINEBREAK%<strong>Aufbau:</strong> Ordne 1 feindlichen Schiff den Zustand <strong>Gejagt</strong> zu.%LINEBREAK%Solange du einen Angriff gegen ein Schiff mit dem Zustand <strong>Gejagt</strong> durchführst, darfst du 1 deiner %FOCUS%-Ergebnisse in ein %HIT%-Ergebnis ändern."
    },
    "Agile Gunner": {
      name: "Wendiger Schütze",
      text: "Während der Endphase darfst du deinen %SINGLETURRETARC%-Anzeiger drehen."
    },
    "BT-1": {
      name: "BT-1",
      text: "<i>Nur für Abschaum oder Staffel, die Darth Vader enthält</i>%LINEBREAK%Solange du einen Angriff durchführst, darfst du für jeden Stressmarker, den der Verteidiger hat, 1&nbsp;%HIT%-Ergebnis in ein %CRIT%-Ergebnis ändern."
    },
    "Barrage Rockets": {
      name: "Raketensalve",
      text: "<strong>Angriff (</strong>%FOCUS%<strong>):</strong> Gib 1&nbsp;%CHARGE%&nbsp;aus. Falls der Verteidiger in deinem %BULLSEYEARC% ist, darfst du 1 oder mehrere %CHARGE% ausgeben, um ebenso viele Angriffswürfel neu zu werfen."
    },
    "Baze Malbus": {
      name: "Baze Malbus",
      text: "<i>Nur für Rebellen</i>%LINEBREAK%Solange du eine %FOCUS%-Aktion durchführst, darfst du sie behandeln, als wäre sie rot. Falls du das tust, erhalte 1 zusätzlichen Fokusmarker für jedes feindliche Schiff in Reichweite 0-1, bis zu einem Maximum von 2."
    },
    "Bistan": {
      name: "Bistan",
      text: "<i>Nur für Rebellen</i>%LINEBREAK%Nachdem du einen Primärangriff durchgeführt hast, falls du fokussiert bist, darfst du einen Bonus-%SINGLETURRETARC%-Angriff gegen ein Schiff, das du in dieser Runde noch nicht angegriffen hast, durchführen."
    },
    "Boba Fett": {
      name: "Boba Fett",
      text: "<i>Nur für Abschaum</i>%LINEBREAK%<strong>Aufbau:</strong> Beginne in der Reserve.%LINEBREAK%Am Ende des Aufbaus platziere dich selbst in Reichweite 0 eines Hindernisses und jenseits von Reichweite 3 aller feindlichen Schiffe."
    },
    "Bomblet Generator": {
      name: "Streubombengenerator",
      text: "<strong>Bombe</strong>%LINEBREAK%Während der Systemphase darfst du 1&nbsp;%CHARGE% ausgeben, um unter Verwendung der [1&nbsp;%STRAIGHT%]-Schablone eine Streubombe abzuwerfen.%LINEBREAK%Zu Beginn der Aktivierungsphase darfst du 1 Schild ausgeben, um 2&nbsp;%CHARGE% wiederherzustellen."
    },
    "Bossk": {
      name: "Bossk",
      text: "<i>Nur für Abschaum</i>%LINEBREAK%Nachdem du einen Primärangriff durchgeführt hast, der verfehlt hat, falls du nicht gestresst bist, <b>musst</b> du 1 Stressmarker erhalten, um einen Bonus-Primärangriff gegen dasselbe Ziel durchzuführen."
    },
    "C-3PO": {
      name: "C-3PO",
      text: "<i>Fügt %CALCULATE% hinzu</i>%LINEBREAK%<i>Nur für Rebellen</i>%LINEBREAK%Bevor du Verteidigungswürfel wirfst, darfst du 1&nbsp;Berechnungs­marker ausgeben, um laut eine Zahl von 1 oder höher zu raten. Falls du das tust und genau so viele %EVADE%-Ergebnisse wirfst, wie du geraten hast, füge 1&nbsp;%EVADE%-Ergebnis hinzu.%LINEBREAK%Nachdem du die %CALCULATE%-Aktion"
    },
    "Cad Bane": {
      name: "Cad Bane",
      text: "<i>Nur für Abschaum</i>%LINEBREAK%Nachdem du ein Gerät abgeworfen oder gestartet hast, darfst du eine rote %BOOST%-Aktion durchführen."
    },
    "Cassian Andor": {
      name: "Cassian Andor",
      text: "<i>Nur für Rebellen</i>%LINEBREAK%Während der Systemphase darfst du 1 feindliches Schiff in Reichweite 1-2 wählen und laut eine Flugrichtung und Geschwindigkeit raten, dann sieh dir das Rad jenes Schiffes an. Falls du die Flugrichtung und Geschwindigkeit des gewählten Schiffes richtig geraten hast, darfst du dein Rad auf ein anderes Manöver einstellen."
    },
    "Chewbacca (Scum)": {
      name: "Chewbacca (Scum)",
      text: "<i>Nur für Abschaum</i>%LINEBREAK%Zu Beginn der Endphase darfst du 1&nbsp;Fokusmarker ausgeben, um 1&nbsp;deiner offenen Schadenskarten zu reparieren."
    },
    "Chewbacca": {
      name: "Chewbacca",
      text: "<i>Nur für Rebellen</i>%LINEBREAK%Zu Beginn der Kampfphase darfst du 2 %CHARGE% ausgeben, um 1 offene Schadenskarte zu reparieren."
    },
    "Ciena Ree": {
      name: "Ciena Ree",
      text: "<i>Benötigt %COORDINATE% oder <r>%COORDINATE%</r></i>%LINEBREAK%<i>Nur für Imperium</i>%LINEBREAK%Nachdem du eine %COORDINATE%-Aktion durchgeführt hast, falls das von dir koordinierte Schiff eine %BARRELROLL%- oder %BOOST%-Aktion durchgeführt hat, darf es 1&nbsp;Stressmarker erhalten, um sich um 90° zu drehen."
    },
    "Cikatro Vizago": {
      name: "Cikatro Vizago",
      text: "<i>Nur für Abschaum</i>%LINEBREAK%Während der Endphase darfst du 2&nbsp;%ILLICIT%-Aufwertungen wählen, die befreundete Schiffe in Reichweite 0-1 ausgerüstet haben. Falls du das tust, darfst du diese Aufwertungen austauschen.%LINEBREAK%<strong>Spielende:</strong> Lege alle %ILLICIT%-Aufwertungen auf ihre ursprünglichen Schiffe zurück."
    },
    "Cloaking Device": {
      name: "Tarngerät",
      text: "<i>Nur für kleines Schiff oder mittleres Schiff</i>%LINEBREAK%<strong>Aktion:</strong> Gib 1&nbsp;%CHARGE% aus, um eine %CLOAK%-Aktion durchzuführen.%LINEBREAK%Zu Beginn der Planungsphase wirf 1&nbsp;Angriffswürfel. Bei einem %FOCUS%-Ergebnis, enttarne dich oder lege deinen Tarnungsmarker ab."
    },
    "Cluster Missiles": {
      name: "Clusterraketen",
      text: "<strong>Angriff (</strong>%LOCK%<strong>):</strong> Gib 1&nbsp;%CHARGE% aus. Nach diesem Angriff darfst du diesen Angriff als Bonusangriff gegen ein anderes Ziel in Reichweite 0-1 des Verteidigers durchführen, wobei du die %LOCK%-Voraussetzung ignorierst."
    },
    "Collision Detector": {
      name: "Kollisionssensor",
      text: "Solange du Schub gibst oder eine Fassrolle fliegst, kannst du dich durch Hindernisse hindurch­bewegen und sie überschneiden.%LINEBREAK%Nachdem du dich durch ein Hindernis hindurchbewegt oder es überschnitten hast, darfst du 1&nbsp;%CHARGE% ausgeben, um seine Effekte bis zum Ende der Runde zu ignorieren."
    },
    "Composure": {
      name: "Gelassenheit",
      text: "<i>Benötigt <r>%FOCUS%</r> oder %FOCUS%</i>%LINEBREAK%Nachdem eine deiner Aktionen scheitert, falls du keine grünen Marker hast, darfst du eine %FOCUS%-Aktion durchführen."
    },
    "Concussion Missiles": {
      name: "Erschütterungsraketen",
      text: "<strong>Angriff (</strong>%LOCK%<strong>):</strong> Gib 1&nbsp;%CHARGE%aus. Nachdem dieser Angriff getroffen hat, legt jedes Schiff in Reichweite 0-1 zum Verteidiger 1 seiner Schadenskarten offen."
    },
    "Conner Nets": {
      name: "Connernetz",
      text: "<strong>Mine</strong>%LINEBREAK%Während der Systemphase darfst du 1&nbsp;%CHARGE% ausgeben, um unter Verwendung der [1&nbsp;%STRAIGHT%]-Schablone ein Connernetz abzuwerfen.%LINEBREAK%Die %CHARGE% dieser Karte kann nicht wiederhergestellt werden."
    },
    "Contraband Cybernetics": {
      name: "Illegale Kybernetik",
      text: "Bevor du aktiviert wirst, darfst du 1&nbsp;%CHARGE% ausgeben. Falls du das tust, kannst du bis zum Ende der Runde Aktionen durchführen und rote Manöver ausführen, auch solange du gestresst bist."
    },
    "Crack Shot": {
      name: "Meisterhafter Schuss",
      text: "Solange du einen Primärangriff durchführst, falls der Verteidiger in deinem %BULLSEYEARC% ist, vor dem Schritt „Ergebnisse neutralisieren“, darfst du 1&nbsp;%CHARGE% ausgeben, um 1&nbsp;%EVADE%-Ergebnis zu negieren."
    },
    "Daredevil": {
      name: "Draufgänger",
      text: "<i>Benötigt %BOOST%</i>%LINEBREAK%<i>Nur für kleines Schiff</i>%LINEBREAK%Solange du eine weiße %BOOST%-Aktion durchführst, darfst du sie behandeln, als wäre sie rot, um stattdessen die [1&nbsp;%TURNLEFT%]- oder [1&nbsp;%TURNRIGHT%]-Schablone zu verwenden."
    },
    "Darth Vader": {
      name: "Darth Vader",
      text: "<i>Nur für Imperium</i>%LINEBREAK%Zu Beginn der Kampfphase darfst du 1 Schiff in deinem Feuerwinkel in Reichweite 0-2 wählen und 1&nbsp;%FORCE% ausgeben. Falls du das tust, erleidet jenes Schiff 1&nbsp;%HIT%-Schaden, es sei denn, es entscheidet sich dafür, 1 grünen Marker zu"
    },
    "Deadman's Switch": {
      name: "Totmannschalter",
      text: "Nachdem du zerstört worden bist, erleidet jedes andere Schiff in Reichweite 0-1 1&nbsp;%HIT%-Schaden."
    },
    "Death Troopers": {
      name: "Todestruppen",
      text: "<i>Nur für Imperium</i>%LINEBREAK%Während der Aktivierungsphase können feindliche Schiffe in Reichweite 0-1 keine Stressmarker entfernen."
    },
    "Debris Gambit": {
      name: "Trümmertanz",
      text: "<i>Fügt <r>%EVADE%</r> hinzu</i>%LINEBREAK%<i>Nur für kleines Schiff oder mittleres Schiff</i>%LINEBREAK%Solange du eine rote %EVADE%-Aktion durchführst, falls ein Hindernis in Reichweite 0-1 ist, behandle die Aktion stattdessen, als wäre sie weiß."
    },
    "Dengar": {
      name: "Dengar",
      text: "<i>Nur für Abschaum</i>%LINEBREAK%Nachdem du verteidigt hast, falls der Angreifer in deinem Feuerwinkel ist, darfst du 1&nbsp;%CHARGE% ausgeben. Falls du das tust, wirf 1 Angriffswürfel, es sei denn, der Angreifer entscheidet sich dafür, 1 grünen Marker zu entfernen. Bei einem %HIT%- oder %CRIT%-Ergebnis erleidet der Angreifer 1&nbsp;%HIT%-Schaden."
    },
    "Director Krennic": {
      name: "Direktor Krennic",
      text: "<i>Fügt %LOCK% hinzu</i>%LINEBREAK%<i>Nur für Imperium</i>%LINEBREAK%<strong>Aufbau:</strong> Bevor die Streitkräfte platziert werden, ordne den Zustand <strong>Optimierter Prototyp</strong> einem anderen befreundeten Schiff zu."
    },
    "Dorsal Turret": {
      name: "Dorsaler Geschützturm",
      text: "<i>Fügt %ROTATEARC% hinzu</i>%LINEBREAK%<strong>Angriff</strong>"
    },
    "Electronic Baffle": {
      name: "Elektronischer Dämpfer",
      text: "Während der Endphase darfst du 1&nbsp;%HIT%-Schaden erleiden, um 1&nbsp;roten&nbsp;Marker zu entfernen."
    },
    "Elusive": {
      name: "Schwer zu treffen",
      text: "<i>Nur für kleines Schiff oder mittleres Schiff</i>%LINEBREAK%Solange du verteidigst, darfst du 1&nbsp;%CHARGE% ausgeben, um 1 Verteidigungswürfel neu zu werfen.%LINEBREAK%Nachdem du ein rotes Manöver vollständig ausgeführt hast, stelle 1&nbsp;%CHARGE% wieder her."
    },
    "Emperor Palpatine": {
      name: "Imperator Palpatine",
      text: "<i>Nur für Imperium</i>%LINEBREAK%Solange ein anderes befreundetes Schiff verteidigt oder einen Angriff durchführt, darfst du 1&nbsp;%FORCE%&nbsp;ausgeben, um 1 seiner Würfel so zu modifizieren, als hätte jenes Schiff 1&nbsp;%FORCE%&nbsp;ausgegeben."
    },
    "Engine Upgrade": {
      name: "Verbessertes Triebwerk",
      text: "Diese Aufwertungskarte hat variable Punktekosten.%LINEBREAK%<i>Fügt %BOOST% hinzu</i>%LINEBREAK%<i>Benötigt <r>%BOOST%</r></i>%LINEBREAK%<i>Große Armeen wie das Militär des Galaktischen Imperiums haben meist standardisierte Triebwerke. Freischaffende Piloten und kleinere Organisationen ersetzen oft Energiekopplungen, "
    },
    "Expert Handling": {
      name: "Flugkunst",
      text: "Diese Aufwertungskarte hat variable Punktekosten.%LINEBREAK%<i>Fügt %BARRELROLL% hinzu</i>%LINEBREAK%<i>Benötigt <r>%BARRELROLL%</r></i>%LINEBREAK%<i>Auch schwere Jäger können in eine Fassrolle gezwungen werden, wobei es einen erfahrenen Piloten braucht, um die Maschine nicht übermäßig zu belasten und dem Feind kein leichtes Ziel zu bieten.</i>"
    },
    "Ezra Bridger": {
      name: "Ezra Bridger",
      text: "<i>Nur für Rebellen</i>%LINEBREAK%Nachdem du einen Primärangriff durchgeführt hast, darfst du 1&nbsp;%FORCE% ausgeben, um einen Bonus-%SINGLETURRETARC%-Angriff aus einem %SINGLETURRETARC%, aus dem du in dieser Runde noch nicht angegriffen hast, durchzuführen. Falls du das tust und gestresst bist, darfst du 1 Angriffswürfel neu werfen."
    },
    "Fearless": {
      name: "Furchtlos",
      text: "<i>Nur für Abschaum</i>%LINEBREAK%Solange du einen %FRONTARC%-Primärangriff durchführst, falls die Angriffs­reichweite&nbsp;1 ist und du im %FRONTARC% des Verteidigers bist, darfst du 1 deiner Ergebnisse in ein %HIT%-Ergebnis ändern."
    },
    "Feedback Array": {
      name: "Rückkopplungsfeld",
      text: "Bevor du kämpfst, darfst du 1&nbsp;Ionenmarker und 1 Entwaffnet-Marker erhalten. Falls du das tust, erleidet jedes Schiff in Reichweite 0 1&nbsp;%HIT%-Schaden."
    },
    "Fifth Brother": {
      name: "Fünfter Bruder",
      text: "<i>Nur für Imperium</i>%LINEBREAK%Solange du einen Angriff durchführst, darfst du 1&nbsp;%FORCE%&nbsp;ausgeben, um 1&nbsp;deiner %FOCUS%-Ergebnisse in ein %CRIT%-Ergebnis zu ändern."
    },
    "Fire-Control System": {
      name: "Feuerkontrollsystem",
      text: "Solange du einen Angriff durchführst, falls du den Verteidiger als Ziel erfasst hast, darfst du 1&nbsp;Angriffswürfel neu werfen. Falls du das tust, kannst du während dieses Angriffs deine Zielerfassung nicht ausgeben."
    },
    "Freelance Slicer": {
      name: "Freischaffender Hacker",
      text: "Solange du verteidigst, bevor die Angriffswürfel geworfen werden, darfstdu eine Zielerfassung, die du auf dem Angreifer hast, ausgeben, um 1&nbsp;Angriffswürfel zu werfen. Falls du das tust, erhält der Angreifer 1&nbsp;Störsignalmarker. Dann, bei einem %HIT%- oder %CRIT%-Ergebnis, erhältst du 1&nbsp;Störsignalmarker."
    },
    'GNK "Gonk" Droid': {
      name: "GNK-„Gonk“-Droide",
      text: "<strong>Aufbau:</strong> Verliere 1&nbsp;%CHARGE%.%LINEBREAK%<strong>Aktion:</strong> Stelle 1&nbsp;%CHARGE% wieder her.%LINEBREAK%<strong>Aktion:</strong> Gib 1&nbsp;%CHARGE% aus, um 1 Schild wiederherzustellen."
    },
    "Grand Inquisitor": {
      name: "Großinquisitor",
      text: "<i>Nur für Imperium</i>%LINEBREAK%Nachdem ein feindliches Schiff in Reichweite 0-2 sein Rad aufgedeckt hat, darfst du 1&nbsp;%FORCE% ausgeben, um 1 weiße Aktion aus deiner Aktionsleiste durchzuführen, wobei du jene Aktion behandelst, als wäre sie rot."
    },
    "Grand Moff Tarkin": {
      name: "Großmoff Tarkin",
      text: "<i>Benötigt %LOCK% oder <r>%LOCK%</r></i>%LINEBREAK%<i>Nur für Imperium</i>%LINEBREAK%Während der Systemphase darfst du 2 %CHARGE% ausgeben. Falls du das tust, darf jedes befreundete Schiff ein Schiff, das du als Ziel erfasst hast, als Ziel erfassen."
    },
    "Greedo": {
      name: "Greedo",
      text: "<i>Nur für Abschaum</i>%LINEBREAK%Solange du einen Angriff durchführst, darfst du 1&nbsp;%CHARGE% ausgeben, um 1&nbsp;%HIT%-Ergebnis in ein %CRIT%-Ergebnis zu ändern.%LINEBREAK%Solange du verteidigst, falls deine %CHARGE% aktiv ist, darf der Angreifer 1&nbsp;%HIT%-Ergebnis in ein %CRIT%-Ergebnis ändern."
    },
    "Han Solo": {
      name: "Han Solo",
      text: "<i>Nur für Rebellen</i>%LINEBREAK%Während der Kampfphase, bei Initiative&nbsp;7, darfst du einen %SINGLETURRETARC%-Angriff durchführen. Du kannst in dieser Runde nicht noch einmal aus jenem %SINGLETURRETARC% angreifen."
    },
    "Han Solo (Scum)": {
      name: "Han Solo (Scum)",
      text: "<i>Nur für Abschaum</i>%LINEBREAK%Bevor du kämpfst, darfst du eine rote&nbsp;%FOCUS%-Aktion durchführen."
    },
    "Heavy Laser Cannon": {
      name: "Schwere Laserkanone",
      text: "<strong>Angriff:</strong> Nach dem Schritt „Angriffswürfel modifizieren“, ändere alle %CRIT%-Ergebnisse in %HIT%-Ergebnisse."
    },
    "Heightened Perception": {
      name: "Geschärfte Sinne",
      text: "Zu Beginn der Kampfphase darfst du 1&nbsp;%FORCE% ausgeben. Falls du das tust, kämpfe in dieser Phase bei Initiative 7 anstatt bei deinem normalen Initiativwert."
    },
    "Hera Syndulla": {
      name: "Hera Syndulla",
      text: "<i>Nur für Rebellen</i>%LINEBREAK%Du kannst rote Manöver ausführen, auch solange du gestresst bist. Nachdem du ein rotes Manöver vollständig ausgeführt hast, falls du 3 oder mehr Stressmarker hast, entferne 1 Stressmarker und erleide 1&nbsp;%HIT%-Schaden."
    },
    "Homing Missiles": {
      name: "Lenkraketen",
      text: "<strong>Angriff (</strong>%LOCK%<strong>):</strong> Gib 1&nbsp;%CHARGE% aus. Nachdem du den Verteidiger deklariert hast, darf der Verteidiger wählen, 1&nbsp;%HIT%-Schaden zu erleiden. Falls er das tut, überspringe die Schritte „Angriffswürfel“ und „Verteidigungswürfel“, und der Angriff wird behandelt, als hätte er getroffen."
    },
    "Hotshot Gunner": {
      name: "Erstklassiger Bordschütze",
      text: "Solange du einen %SINGLETURRETARC%-Angriff durchführst, nach dem Schritt „Verteidigungswürfel modifizieren“, entfernt der Verteidiger 1 Fokus- oder 1 Berechnungsmarker."
    },
    "Hull Upgrade": {
      name: "Verstärkte Hülle",
      text: "Diese Aufwertungskarte hat variable Punktekosten.%LINEBREAK%<i>Auch wer sich keinen verbesserten Schildgenerator leisten kann, muss nicht auf erhöhten Schutz verzichten, sondern kann sich mit zusätzlichen Panzerplatten an der Schiffshülle behelfen.</i>"
    },
    "IG-88D": {
      name: "IG-88D",
      text: "<i>Fügt %CALCULATE% hinzu</i>%LINEBREAK%<i>Nur für Abschaum</i>%LINEBREAK%Du hast die Pilotenfähigkeit jedes anderen befreundeten Schiffes mit der Aufwertung <strong>IG-2000</strong>.%LINEBREAK%Nachdem du eine %CALCULATE%-Aktion durchgeführt hast, erhalte 1 Berechnungsmarker."
    },
    "ISB Slicer": {
      name: "ISB-Hacker",
      text: "<i>Nur für Imperium</i>%LINEBREAK%Während der Endphase können feindliche Schiffe in Reichweite 1-2 keine Störsignalmarker entfernen."
    },
    "Inertial Dampeners": {
      name: "Trägheitsdämpfer",
      text: "Bevor du ein Manöver ausführen würdest, darfst du 1 Schild ausgeben. Falls du das tust, führe anstatt des Manövers, das du aufgedeckt hast, ein weißes [0&nbsp;%STOP%]-Manöver aus, dann erhalte 1 Stressmarker."
    },
    "Informant": {
      name: "Informant",
      text: "<strong>Aufbau:</strong> Nachdem die Streitkräfte platziert worden sind, wähle 1&nbsp;feindliches Schiff und ordne ihm den Zustand Abhörgerät zu."
    },
    "Instinctive Aim": {
      name: "Instinktives Zielen",
      text: "Solange du einen Spezialangriff durchführst, darfst du 1&nbsp;%FORCE% ausgeben, um die %FOCUS%- oder %LOCK%-Voraussetzung zu ignorieren."
    },
    "Intimidation": {
      name: "Furchteinflößend",
      text: "Solange ein feindliches Schiff in Reichweite 0 verteidigt, wirft es 1&nbsp;Verteidigungswürfel weniger."
    },
    "Ion Cannon": {
      name: "Ionenkanone",
      text: "<strong>Angriff:</strong> Falls dieser Angriff trifft, gib 1&nbsp;%HIT%- oder %CRIT%-Ergebnis aus, um den Verteidiger 1&nbsp;%HIT%-Schaden erleiden zu lassen. Alle übrigen %HIT%/%CRIT%-Ergebnisse fügen Ionenmarker anstatt Schaden zu."
    },
    "Ion Cannon Turret": {
      name: "Ionengeschütz",
      text: "<i>Fügt %ROTATEARC% hinzu</i>%LINEBREAK%<strong>Angriff:</strong> Falls dieser Angriff trifft, gib 1&nbsp;%HIT%- oder %CRIT%-Ergebnis aus, um den Verteidiger 1&nbsp;%HIT%-Schaden erleiden zu lassen. Alle übrigen %HIT%/%CRIT%-Ergebnisse fügen Ionenmarker anstatt Schaden zu."
    },
    "Ion Missiles": {
      name: "Ionenraketen",
      text: "<strong>Angriff (</strong>%LOCK%<strong>):</strong> Gib 1&nbsp;%CHARGE% aus. Falls dieser Angriff trifft, gib 1&nbsp;%HIT%- oder %CRIT%-Ergebnis aus, um den Verteidiger 1&nbsp;%HIT%-Schaden erleiden zu lassen. Alle übrigen %HIT%/%CRIT%-Ergebnisse fügen Ionenmarker anstatt Schaden zu."
    },
    "Ion Torpedoes": {
      name: "Ionentorpedos",
      text: "<strong>Angriff (</strong>%LOCK%<strong>):</strong> Gib 1&nbsp;%CHARGE% aus. Falls dieser Angriff trifft, gib 1&nbsp;%HIT%- oder %CRIT%-Ergebnis aus, um den Verteidiger 1&nbsp;%HIT%-Schaden erleiden zu lassen. Alle übrigen %HIT%/%CRIT%-Ergebnisse fügen Ionenmarker anstatt Schaden zu."
    },
    "Jabba the Hutt": {
      name: "Jabba der Hutt",
      text: "<i>Nur für Abschaum</i>%LINEBREAK%Während der Endphase darfst du 1 befreundetes Schiff in Reichweite 0-2 wählen und 1&nbsp;%CHARGE% ausgeben. Falls du das tust, stellt jenes Schiff 1&nbsp;%CHARGE% von 1&nbsp;seiner ausgerüsteten %ILLICIT%-Aufwertungen wieder her."
    },
    "Jamming Beam": {
      name: "Störstrahl",
      text: "<strong>Angriff:</strong> Falls dieser Angriff trifft, fügen alle %HIT%/%CRIT%-Ergebnisse Störsignalmarker anstatt Schaden zu."
    },
    "Juke": {
      name: "Finte",
      text: "<i>Nur für kleines Schiff oder mittleres Schiff</i>%LINEBREAK%Solange du einen Angriff durchführst, falls du ausweichst, darfst du 1&nbsp;der %EVADE%-Ergebnisse des Verteidigers in ein %FOCUS%-Ergebnis ändern."
    },
    "Jyn Erso": {
      name: "Jyn Erso",
      text: "<i>Nur für Rebellen</i>%LINEBREAK%Falls ein befreundetes Schiff in Reichweite 0-3 einen Fokusmarker erhalten würde, darf es stattdessen 1&nbsp;Ausweichmarker erhalten."
    },
    "Kanan Jarrus": {
      name: "Kanan Jarrus",
      text: "<i>Nur für Rebellen</i>%LINEBREAK%Nachdem ein befreundetes Schiff in Reichweite 0-2 ein weißes Manöver vollständig ausgeführt hat, darfst du 1&nbsp;%FORCE% ausgeben, um 1&nbsp;Stressmarker von jenem Schiff zu entfernen."
    },
    "Ketsu Onyo": {
      name: "Ketsu Onyo",
      text: "<i>Nur für Abschaum</i>%LINEBREAK%Zu Beginn der Endphase darfst du 1&nbsp;feindliches Schiff in Reichweite 0-2 in deinem Feuerwinkel wählen. Falls du das tust, entfernt jenes Schiff seine Fangstrahlmarker nicht."
    },
    "L3-37": {
      name: "L3-37",
      text: "<i>Nur für Abschaum</i>%LINEBREAK%<strong>Aufbau:</strong> Rüste diese Seite offen aus.%LINEBREAK%Solange du verteidigst, darfst du diese Karte umdrehen. Fall du das tust, muss der Angreifer alle Angriffswürfel neu werfen. %LINEBREAK% Programmierung von L3-37: Falls du keine Schilde hast, verringere die Schwierigkeit deiner Drehmanöver (%BANKLEFT% und %BANKRIGHT%)."
    },
    "Lando Calrissian": {
      name: "Lando Calrissian",
      text: "<i>Nur für Rebellen</i>%LINEBREAK%<strong>Aktion:</strong> Wirf 2 Verteidigungswürfel. Erhalte 1 Fokusmarker für jedes %FOCUS%-Ergebnis. Erhalte 1&nbsp;Ausweichmarker für jedes %EVADE%-Ergebnis. Falls beide Ergebnisse Leerseiten sind, wählt der Gegenspieler Fokus- oder Ausweichmarker. Du erhältst 1 Marker"
    },
    "Lando Calrissian (Scum)": {
      name: "Lando Calrissian (Scum)",
      text: "<i>Nur für Abschaum</i>%LINEBREAK%Nachdem du die Würfel geworfen hast, darfst du 1 grünen Marker ausgeben um bis zu 2 deiner Ergebnisse neu zu werfen."
    },
    "Lando's Millennium Falcon": {
      name: "Landos Millennium Falke",
      ship: "Modifizierter YT-1300-Frachter",
      text: "<i>Nur für Abschaum</i>%LINEBREAK%1 Rettungskapsel darf bei dir andocken.%LINEBREAK%Solange ein Rettungskapsel bei dir angedockt ist, darfst du seine Schilde ausgeben, als wären sie auf deiner Schiffskarte.%LINEBREAK%Solange du einen Primärangriff gegen ein gestresstes Schiff durchführst, wirfst du 1 zusätzlichen Angriffswürfel."
    },
    "Latts Razzi": {
      name: "Latts Razzi",
      text: "<i>Nur für Abschaum</i>%LINEBREAK%Solange du verteidigst, falls der Angreifer gestresst ist, darfst du 1 Stressmarker vom Angreifer entfernen, um 1 deiner Leerseiten/%FOCUS%-Ergebnisse in ein %EVADE%-Ergebnis zu ändern."
    },
    "Leia Organa": {
      name: "Leia Organa",
      text: "<i>Nur für Rebellen</i>%LINEBREAK%Zu Beginn der Aktivierungsphase darfst du 3 %CHARGE% ausgeben. Während dieser Phase verringert jedes befreundete Schiff die Schwierigkeit seiner roten Manöver."
    },
    "Lone Wolf": {
      name: "Einsamer Wolf",
      text: "Solange du verteidigst oder einen Angriff durchführst, falls keine anderen befreundeten Schiffe in Reichweite 0-2 sind, darfst du 1&nbsp;%CHARGE% ausgeben, um 1 deiner Würfel neu zu werfen."
    },
    "Luke Skywalker": {
      name: "Luke Skywalker",
      text: "<i>Nur für Rebellen</i>%LINEBREAK%Zu Beginn der Kampfphase darfst du 1&nbsp;%FORCE% ausgeben, um deinen %SINGLETURRETARC%-Anzeiger zu rotieren."
    },
    "Magva Yarro": {
      name: "Magva Yarro",
      text: "<i>Nur für Rebellen</i>%LINEBREAK%Nachdem du verteidigt hast, falls der Angriff getroffen hat, darfst du den Angreifer als Ziel erfassen."
    },
    "Marksmanship": {
      name: "Treffsicherheit",
      text: "Solange du einen Angriff durchführst, falls der Verteidiger in deinem %BULLSEYEARC% ist, darfst du 1&nbsp;%HIT%-Ergebnis in ein %CRIT%-Ergebnis ändern."
    },
    "Maul": {
      name: "Maul",
      text: "<i>Nur für Abschaum oder Staffel, die Ezra Bridger enthält oder Staffel, die Ezra Bridger (Sheathipede) enthält oder Staffel, die Ezra Bridger (TIE Fighter) enthält</i>%LINEBREAK%Nachdem du Schaden erlitten hast, darfst du 1&nbsp;Stress­marker erhalten, um 1&nbsp;%FORCE% wiederherzustellen.%LINEBREAK%Du kannst „Dunkle Seite“-Aufwertungen ausrüsten."
    },
    "Minister Tua": {
      name: "Ministerin Tua",
      text: "<i>Nur für Imperium</i>%LINEBREAK%Zu Beginn der Kampfphase, falls du beschädigt bist, darfst du eine rote %FOCUS%-Aktion durchführen."
    },
    "Moff Jerjerrod": {
      name: "Moff Jerjerrod",
      text: "<i>Benötigt %COORDINATE% oder <r>%COORDINATE%</r></i>%LINEBREAK%<i>Nur für Imperium</i>%LINEBREAK%Während der Systemphase darfst du 2 %CHARGE% ausgeben. Falls du das tust, wähle die [1&nbsp;%BANKLEFT%]-, [1&nbsp;%STRAIGHT%]- oder [1&nbsp;%BANKRIGHT%]-Schablone. Jedes befreundete Schiff darf unter Verwendung jener Schablone eine rote %BOOST%-Aktion durchführen."
    },
    "Munitions Failsafe": {
      name: "Ausfallsichere Munition",
      text: "Solange du einen %TORPEDO%- oder %MISSILE%-Angriff durchführst, nachdem du die Angriffswürfel geworfen hast, darfst du alle Würfelergebnisse negieren, um 1&nbsp;%CHARGE% wiederherzustellen, die du als Kosten für den Angriff ausgegeben hast."
    },
    "Nien Nunb": {
      name: "Nien Nunb",
      text: "<i>Nur für Rebellen</i>%LINEBREAK%Verringere die Schwierigkeit deiner Drehmanöver (%BANKLEFT% und %BANKRIGHT%)."
    },
    "Novice Technician": {
      name: "Unerfahrener Techniker",
      text: "Am Ende der Runde darfst du 1&nbsp;Angriffswürfel werfen, um 1&nbsp;offene Schadenskarte zu reparieren. Dann, bei einem %HIT%-Ergebnis, lege 1&nbsp;Schadenskarte offen."
    },
    "Os-1 Arsenal Loadout": {
      name: "Os-1-Waffenarsenal",
      ship: "Sternflügler der Alpha-Klasse",
      text: "Solange du genau 1 Entwaffnet-Marker hast, kannst du trotzdem %TORPEDO%- und %MISSILE%-Angriffe gegen Ziele durchführen, die du als Ziel erfasst hast. Falls du das tust, kannst du während des Angriffs deine Zielerfassung nicht ausgeben.%LINEBREAK%Füge %TORPEDO%- und %MISSILE%-Slots hinzu."
    },
    "Outmaneuver": {
      name: "Ausmanövrieren",
      text: "Solange du einen %FRONTARC%-Angriff durchführst, falls du nicht im Feuerwinkel des Verteidigers bist, wirft der Verteidiger 1&nbsp;Verteidigungswürfel weniger."
    },
    "Perceptive Copilot": {
      name: "Aufmerksamer Co-Pilot",
      text: "Nachdem du eine %FOCUS%-Aktion durchgeführt hast, erhalte 1 Fokusmarker."
    },
    "Pivot Wing": {
      name: "Schwenkflügel",
      ship: "UT-60D-U-Flügler",
      text: "<strong>Geschlossen:</strong> Solange du verteidigst, wirf 1&nbsp;Verteidigungswürfel weniger.%LINEBREAK%Nachdem du ein [0&nbsp;%STOP%]-Manöver ausgeführt hast, darfst du dein Schiff um 90° oder um 180° drehen.%LINEBREAK%Bevor du aktiviert wirst, darfst du diese Karte umdrehen.%LINEBREAK%<strong>Geöffnet:</strong> Bevor du aktiviert wirst, darfst du diese Karte umdrehen."
    },
    "Predator": {
      name: "Jagdinstinkt",
      text: "Solange du einen Primärangriff durchführst, falls der Verteidiger in deinem %BULLSEYEARC% ist, darfst du 1&nbsp;Angriffswürfel neu werfen."
    },
    "Proton Bombs": {
      name: "Protonenbomben",
      text: "<strong>Bombe</strong>%LINEBREAK%Während der Systemphase darfst du 1&nbsp;%CHARGE% ausgeben, um unter Verwendung der [1&nbsp;%STRAIGHT%]-Schablone eine Protonenbombe abzuwerfen."
    },
    "Proton Rockets": {
      name: "Protonenraketen",
      text: "<strong>Angriff (</strong>%FOCUS%<strong>):</strong> Gib 1&nbsp;%CHARGE%&nbsp;aus."
    },
    "Proton Torpedoes": {
      name: "Protonentorpedos",
      text: "<strong>Angriff (</strong>%LOCK%<strong>):</strong> Gib 1&nbsp;%CHARGE% aus. Ändere 1&nbsp;%HIT%-Ergebnis in ein %CRIT%-Ergebnis."
    },
    "Proximity Mines": {
      name: "Annäherungsminen",
      text: "<strong>Mine</strong>%LINEBREAK%Während der Systemphase darfst du 1&nbsp;%CHARGE% ausgeben, um unter Verwendung der [1&nbsp;%STRAIGHT%]-Schablone eine Annäherungsmine abzuwerfen.%LINEBREAK%Die %CHARGE% dieser Karte können nicht wiederhergestellt werden."
    },
    "Qi'ra": {
      name: "Qi'ra",
      text: "<i>Nur für Abschaum</i>%LINEBREAK%Solange du dich bewegst und Angriffe durchführst, ignorierst du Hindernisse, die du als Ziel erfasst hast."
    },
    "R2 Astromech": {
      name: "R2-Astromechdroide",
      text: "Nachdem du dein Rad aufgedeckt hast, darfst du 1&nbsp;%CHARGE% ausgeben und 1 Entwaffnet-Marker erhalten, um 1&nbsp;Schild wiederherzustellen."
    },
    "R2-D2 (Crew)": {
      name: "R2-D2 (Crew)",
      text: "<i>Nur für Rebellen</i>%LINEBREAK%Während der Endphase, falls du beschädigt bist und keine Schilde hast, darfst du 1&nbsp;Angriffswürfel werfen, um 1&nbsp;Schild wiederherzustellen. Bei einem %HIT%-Ergebnis lege 1 deiner Schadenskarten offen."
    },
    "R2-D2": {
      name: "R2-D2",
      text: "<i>Nur für Rebellen</i>%LINEBREAK%Nachdem du dein Rad aufgedeckt hast, darfst du 1&nbsp;%CHARGE% ausgeben und 1 Entwaffnet-Marker erhalten, um 1&nbsp;Schild wiederherzustellen."
    },
    "R3 Astromech": {
      name: "R3-Astromechdroide",
      text: "Du kannst bis zu 2 Zielerfassungen aufrechterhalten. Jede Zielerfassung muss ein anderes Objekt als Ziel haben.%LINEBREAK%Nachdem du eine %LOCK%-Aktion durchgeführt hast, darfst du ein Ziel erfassen."
    },
    "R4 Astromech": {
      name: "R4-Astromechdroide",
      text: "<i>Nur für kleines Schiff</i>%LINEBREAK%Verringere die Schwierigkeit deiner Basismanöver mit Geschwindigkeit 1-2 (%TURNLEFT%, %BANKLEFT%, %STRAIGHT%, %BANKRIGHT%, %TURNRIGHT%)."
    },
    "R5 Astromech": {
      name: "R5-Astromechdroide",
      text: "<strong>Aktion:</strong> Gib 1&nbsp;%CHARGE% aus, um 1 verdeckte Schadenskarte zu reparieren.%LINEBREAK%<strong>Aktion:</strong> Repariere 1 offene <strong>Schiff</strong>-Schadenskarte."
    },
    "R5-D8": {
      name: "R5-D8",
      text: "<i>Nur für Rebellen</i>%LINEBREAK%<strong>Aktion:</strong> Gib 1&nbsp;%CHARGE% aus, um 1 verdeckte Schadenskarte zu reparieren.%LINEBREAK%<strong>Aktion:</strong> Repariere 1 offene <strong>Schiff</strong>-Schadenskarte."
    },
    "R5-P8": {
      name: "R5-P8",
      text: "<i>Nur für Abschaum</i>%LINEBREAK%Solange du einen Angriff gegen einen Verteidiger in deinem %FRONTARC% durchführst, darfst du 1&nbsp;%CHARGE% ausgeben, um 1 Angriffswürfel neu zu werfen. Falls das neugeworfene Ergebnis ein %CRIT% ist, erleide 1&nbsp;%CRIT%-Schaden."
    },
    "R5-TK": {
      name: "R5-TK",
      text: "<i>Nur für Abschaum</i>%LINEBREAK%Du kannst Angriffe gegen befreundete Schiffe durchführen."
    },
    "Rigged Cargo Chute": {
      name: "Manipulierte Frachtrampe",
      text: "<i>Nur für großes Schiff oder mittleres Schiff</i>%LINEBREAK%<strong>Aktion:</strong> Gib 1&nbsp;%CHARGE% aus. Wirf unter Verwendung der [1&nbsp;%STRAIGHT%]-Schablone 1 freie Fracht ab."
    },
    "Ruthless": {
      name: "Skrupellos",
      text: "<i>Nur für Imperium</i>%LINEBREAK%Solange du einen Angriff durchführst, darfst du ein anderes befreundetes Schiff in Reichweite 0-1 zum Verteidiger wählen. Falls du das tust, erleidet jenes Schiff 1&nbsp;%HIT%-Schaden und du darfst 1 deiner Würfelergebnisse in ein %HIT%-Ergebnis ändern."
    },
    "Sabine Wren": {
      name: "Sabine Wren",
      text: "<i>Nur für Rebellen</i>%LINEBREAK%<strong>Aufbau:</strong> Platziere 1 Ionen-, 1&nbsp;Störsignal-, 1&nbsp;Stress- und 1&nbsp;Fangstrahlmarker auf dieser Karte. %LINEBREAK%Nachdem ein Schiff den Effekt einer befreundeten Bombe erlitten hat, darfst du 1 Ionen-, Störsignal-, Stress- oder Fangstrahlmarker von dieser Karte entfernen. Falls du das tust, erhält jenes Schiff einen passenden Marker."
    },
    "Saturation Salvo": {
      name: "Flächenangriff",
      text: "<i>Benötigt %RELOAD% oder <r>%RELOAD%</r></i>%LINEBREAK%Solange du einen %TORPEDO%- oder %MISSILE%-Angriff durchführst, darfst du 1&nbsp;%CHARGE% von jener Aufwertung ausgeben. Falls du das tust, wähle 2 Verteidigungswürfel. Der Verteidiger muss jene Würfel neu werfen."
    },
    "Saw Gerrera": {
      name: "Saw Gerrera",
      text: "<i>Nur für Rebellen</i>%LINEBREAK%Solange du einen Angriff durchführst, darfst du 1&nbsp;%HIT%-Schaden erleiden, um alle deine %FOCUS%-Ergebnisse in %CRIT%-Ergebnisse zu ändern."
    },
    "Seasoned Navigator": {
      name: "Erfahrener Navigator",
      text: "Nachdem du dein Rad aufgedeckt hast, darfst du dein Rad auf ein anderes nicht-rotes Manöver derselben Geschwindigkeit einstellen. Solange du jenes Manöver ausführst, erhöhe seine Schwierigkeit."
    },
    "Seismic Charges": {
      name: "Seismische Bomben",
      text: "<strong>Bombe</strong>%LINEBREAK%Während der Systemphase darfst du 1&nbsp;%CHARGE% ausgeben, um unter Verwendung der [1&nbsp;%STRAIGHT%]-Schablone eine Seismische Bombe abzuwerfen."
    },
    "Selfless": {
      name: "Selbstlos",
      text: "<i>Nur für Rebellen</i>%LINEBREAK%Solange ein anderes befreundetes Schiff in Reichweite 0-1 verteidigt, vor dem Schritt „Ergebnisse neutralisieren“, falls du im Angriffswinkel bist, darfst du 1&nbsp;%CRIT%-Schaden erleiden, um 1&nbsp;%CRIT%-Ergebnis zu negieren."
    },
    "Sense": {
      name: "Gespür",
      text: "Während der Systemphase darfst du 1 Schiff in Reichweite 0-1 wählen und sein Rad ansehen. Falls du 1&nbsp;%FORCE% ausgibst, darfst du stattdessen ein Schiff in Reichweite 0-3 wählen."
    },
    "Servomotor S-Foils": {
      name: "Servomotorische S-Flügel",
      ship: "T-65-X-Flügler",
      text: "<strong>Geschlossen:</strong><i>Fügt %FOCUS%-><r>%BOOST%</r> hinzu</i>%LINEBREAK%<i>Fügt %BOOST% hinzu</i>%LINEBREAK%Solange du einen Primärangriff durchführst, wirf 1&nbsp;Angriffswürfel weniger.%LINEBREAK%Bevor du aktiviert wirst, darfst du diese Karte umdrehen.%LINEBREAK%<strong>Geöffnet:</strong>Bevor du aktiviert wirst, darfst du diese Karte umdrehen."
    },
    "Seventh Sister": {
      name: "Siebte Schwester",
      text: "<i>Nur für Imperium</i>%LINEBREAK%Falls ein feindliches Schiff in Reichweite 0-1 einen Stressmarker erhalten würde, darfst du 1&nbsp;%FORCE% ausgeben, um es stattdessen 1 Störsignal- oder 1 Fangstrahlmarker erhalten zu lassen."
    },
    "Shield Upgrade": {
      name: "Verbesserte Schilde",
      text: "Diese Aufwertungskarte hat variable Punktekosten.%LINEBREAK%<i>Deflektor­schilde sind der wichtigste Verteidigungsmechanismus der meisten Raumschiffe, abgesehen von extrem leichten Jägern. Eine Verbesserung der Schildkapazität ist eine kostspielige, aber durchaus "
    },
    "Skilled Bombardier": {
      name: "Versierte Bombenschützin",
      text: "Falls du ein Gerät abwerfen oder starten würdest, darfst du eine Schablone mit gleicher Flugrichtung und einer um 1 höheren oder niedrigeren Geschwindigkeit verwenden."
    },
    "Squad Leader": {
      name: "Staffelführer",
      text: "<i>Fügt <r>%COORDINATE%</r> hinzu</i>%LINEBREAK%Solange du koordinierst, kann das von dir gewählte Schiff eine Aktion nur dann durchführen, falls jene Aktion auch in deiner Aktionsleiste ist."
    },
    "Static Discharge Vanes": {
      name: "Elektrostatischer Entlader",
      text: "Falls du einen Ionen- oder Störsignal-marker erhalten würdest, darfst du ein Schiff in Reichweite 0-1 wählen. Falls du das tust, erhalte 1 Stressmarker und transferiere 1 Ionen- oder Störsignalmarker auf jenes Schiff."
    },
    "Stealth Device": {
      name: "Tarnvorrichtung",
      text: "Diese Aufwertungskarte hat variable Punktekosten.%LINEBREAK%Solange du verteidigst, falls deine %CHARGE% aktiv ist, wirf 1&nbsp;zusätzlichen Verteidigungswürfel.%LINEBREAK%Nachdem du Schaden erlitten hast, verliere 1&nbsp;%CHARGE%."
    },
    "Supernatural Reflexes": {
      name: "Übernatürliche Reflexe",
      text: "<i>Nur für kleines Schiff</i>%LINEBREAK%Bevor du aktiviert wirst, darfst du 1&nbsp;%FORCE% ausgeben, um eine %BARRELROLL%- oder %BOOST%-Aktion durchzuführen. Dann, falls du eine Aktion durchgeführt hast, die nicht in deiner Aktionsleiste ist, erleide 1&nbsp;%HIT%-Schaden."
    },
    "Swarm Tactics": {
      name: "Schwarmtaktik",
      text: "Zu Beginn der Kampfphase darfst du 1 befreundetes Schiff in Reichweite 1 wählen. Falls du das tust, behandelt jenes Schiff seine Initiative bis zum Ende der Runde so, als würde sie deiner Initiative entsprechen."
    },
    "Tactical Officer": {
      name: "Taktikoffizier",
      text: "<i>Fügt %COORDINATE% hinzu</i>%LINEBREAK%<i>Benötigt <r>%COORDINATE%</r></i>%LINEBREAK%<i>In den Wirren einer Raumschlacht kann ein einzelner Befehl über Sieg oder totale Auslöschung entscheiden.</i>"
    },
    "Tactical Scrambler": {
      name: "Taktischer Scrambler",
      text: "<i>Nur für großes Schiff oder mittleres Schiff</i>%LINEBREAK%Solange du den Angriff eines feindlichen Schiffes versperrst, wirft der Verteidiger 1&nbsp;zusätzlichen Verteidigungswürfel."
    },
    "Tobias Beckett": {
      name: "Tobias Beckett",
      text: "<i>Nur für Abschaum</i>%LINEBREAK%<strong>Aufbau:</strong> Nach dem Platzieren der Streitkräfte darfst du 1&nbsp;Hindernis im Spielbereich wählen. Falls du das tust, platziere es irgendwo im Spielbereich, jenseits von Reichweite 2 zu den Spielfeldecken und Schiffen und jenseits von Reichweite&nbsp;1 zu anderen Hindernissen."
    },
    "Tractor Beam": {
      name: "Fangstrahl",
      text: "<strong>Angriff:</strong> Falls dieser Angriff trifft, fügen alle %HIT%/%CRIT%-Ergebnisse Fangstrahlmarker anstatt Schaden zu."
    },
    "Trajectory Simulator": {
      name: "Flugbahnsimulator",
      text: "Während der Systemphase, falls du eine Bombe abwerfen oder starten würdest, darfst du sie stattdessen unter Verwendung der [5&nbsp;%STRAIGHT%]-Schablone starten."
    },
    "Trick Shot": {
      name: "Trickschuss",
      text: "Solange du einen Angriff durchführst, der durch ein Hindernis versperrt ist, wirf 1 zusätzlichen Angriffswürfel."
    },
    "Unkar Plutt": {
      name: "Unkar Plutt",
      text: "<i>Nur für Abschaum</i>%LINEBREAK%Nachdem du ein Manöver teilweise ausgeführt hast, darfst du 1&nbsp;%HIT%-Schaden erleiden, um 1 weiße Aktion durchzuführen."
    },
    "Veteran Tail Gunner": {
      name: "Kampferprobter Heckschütze",
      text: "Nachdem du einen %FRONTARC%-Primärangriff durchgeführt hast, darfst du einen Bonus-%REARARC%-Primärangriff durchführen."
    },
    "Veteran Turret Gunner": {
      name: "Kampferprobter Geschützkanonier",
      text: "<i>Benötigt <r>%ROTATEARC%</r> oder %ROTATEARC%</i>%LINEBREAK%Nachdem du einen Primärangriff durchgeführt hast, darfst du unter Verwendung eines %SINGLETURRETARC%, aus dem du in dieser Runde noch nicht angegriffen hast, einen Bonus-%SINGLETURRETARC%-Angriff durchführen."
    },
    "Xg-1 Assault Configuration": {
      name: "Xg-1-Angriffskonfiguration",
      ship: "Sternflügler der Alpha-Klasse",
      text: "Solange du genau 1 Entwaffnet-Marker hast, kannst du trotzdem %CANNON%-Angriffe durchführen. Solange du einen %CANNON%-Angriff durchführst, solange du entwaffnet bist, wirf maximal 3 Angriffswürfel.%LINEBREAK%Füge einen %CANNON%-Slot hinzu."
    },
    "Zuckuss": {
      name: "Zuckuss",
      text: "<i>Nur für Abschaum</i>%LINEBREAK%Solange du einen Angriff durchführst, falls du nicht gestresst bist, darfst du 1 Verteidigungswürfel wählen und 1 Stressmarker erhalten. Falls du das tust, muss der Verteidiger jenen Würfel neu werfen."
    },
    '"Chopper" (Crew)': {
      name: "„Chopper“ (Crew)",
      text: "<i>Nur für Rebellen</i>%LINEBREAK%Während des Schrittes „Aktion durchführen“ darfst du 1 Aktion durchführen, auch solange du gestresst bist. Nachdem du eine Aktion durchgeführt hast, solange du gestresst bist, erleide 1&nbsp;%HIT%-Schaden, es sei denn, du legst 1&nbsp;deiner Schadenskarten offen."
    },
    '"Chopper" (Astromech)': {
      name: "„Chopper“ (Astromech)",
      text: "<i>Nur für Rebellen</i>%LINEBREAK%<strong>Aktion:</strong> Gib 1 nicht-wiederkehrende %CHARGE% von einer anderen ausgerüsteten Aufwertung aus, um 1 Schild wiederherzustellen."
    },
    '"Genius"': {
      name: "„Genie“",
      text: "<i>Nur für Abschaum</i>%LINEBREAK%Nachdem du ein Manöver vollständig ausgeführt hast, falls du in dieser Runde noch kein Gerät abgeworfen oder gestartet hast, darfst du 1&nbsp;Bombe abwerfen."
    },
    '"Zeb" Orrelios': {
      name: "„Zeb“ Orrelios",
      text: "<i>Nur für Rebellen</i>%LINEBREAK%Du kannst Primärangriffe in Reichweite 0 durchführen. Feindliche Schiffe in Reichweite 0 können Primärangriffe gegen dich durchführen."
    },
    "Hardpoint: Cannon": {
      text: "Adds a %CANNON% slot"
    },
    "Hardpoint: Missile": {
      text: "Adds a %MISSILE% slot"
    },
    "Hardpoint: Torpedo": {
      text: "Adds a %TORPEDO% slot"
    },
    "Black One": {
      text: "<i>Adds: %SLAM%</i> %LINEBREAK% After you perform a %SLAM% action, lose 1 %CHARGE%. Then you may gain 1 ion token to remove 1 disarm token. %LINEBREAK% If your charge is inactive, you cannot perform the %SLAM% action."
    },
    "Heroic": {
      text: " While you defend or perform an attack, if you have only blank results and have 2 or more results, you may reroll any number of your dice. "
    },
    "Rose Tico": {
      text: " ??? "
    },
    "Finn": {
      text: " While you defend or perform a primary attack, if the enemy ship is in your %FRONTARC%, you may add 1 blank result to your roll ... can be rerolled or otherwise ...  "
    },
    "Integrated S-Foils": {
      text: "<b>Closed:</b> While you perform a primary attack, if the defender is not in your %BULLSEYEARC%, roll 1 fewer attack die. Before you activate, you may flip this card. %LINEBREAK% <i>Adds: %BARRELROLL%, %FOCUS% > <r>%BARRELROLL%</r></i> %LINEBREAK% <b>Open:</b> ???"
    },
    "Targeting Synchronizer": {
      text: "<i>Requires: %LOCK%</i> %LINEBREAK% While a friendly ship at range 1-2 performs an attack against a target you have locked, that ship ignores the %LOCK% attack requirement. "
    },
    "Primed Thrusters": {
      text: "<i>Requires: Small Base</i> %LINEBREAK% While you have 2 or fewer stress tokens, you can perform %BARRELROLL% and %BOOST% actions even while stressed. "
    },
    "Kylo Ren (Crew)": {
      text: " Action: Choose 1 enemy ship at range 1-3. If you do, spend 1 %FORCE% to assign the I'll Show You the Dark Side condition to that ship. "
    },
    "General Hux": {
      text: " ... perform a white %COORDINATE% action ... it as red. If you do, you ... up to 2 additional ships ... ship type, and each ship you coordinate must perform the same action, treating that action as red. "
    },
    "Fanatical": {
      text: " While you perform a primary attack, if you are not shielded, you may change 1 %FOCUS% result to a %HIT% result. "
    },
    "Special Forces Gunner": {
      text: " ... you perform a primary %FRONTARC% attack, ... your %SINGLETURRETARC% is in your %FRONTARC%, you may roll 1 additional attack die. After you perform a primary %FRONTARC% attack, ... your %TURRET% is in your %BACKARC%, you may perform a bonus primary %SINGLETURRETARC% attack. "
    },
    "Captain Phasma": {
      text: " ??? "
    },
    "Supreme Leader Snoke": {
      text: " ??? "
    },
    "Hyperspace Tracking Data": {
      text: " Setup: Before placing forces, you may ... 0 and 6 ... "
    },
    "Advanced Optics": {
      text: " While you perform an attack, you may spend 1 focus to change 1 of your blank results to a %HIT% result. "
    },
    "Rey (Gunner)": {
      text: " ... defend or ... If the ... in your %SINGLETURRETARC% ... 1 %FORCE% to ... 1 of your blank results to a %EVADE% or %HIT% result. "
    }
  };
  condition_translations = {
    'Suppressive Fire': {
      text: 'While you perform an attack against a ship other than <strong>Captain Rex</strong>, roll 1 fewer attack die. %LINEBREAK% After <strong>Captain Rex</strong> defends, remove this card.  %LINEBREAK% At the end of the Combat Phase, if <strong>Captain Rex</strong> did not perform an attack this phase, remove this card. %LINEBREAK% After <strong>Captain Rex</strong> is destroyed, remove this card.'
    },
    'Hunted': {
      text: 'After you are destroyed, you must choose another friendly ship and assign this condition to it, if able.'
    },
    'Listening Device': {
      text: 'During the System Phase, if an enemy ship with the <strong>Informant</strong> upgrade is at range 0-2, flip your dial faceup.'
    },
    'Optimized Prototype': {
      text: 'While you perform a %FRONTARC% primary attack against a ship locked by a friendly ship with the <strong>Director Krennic</strong> upgrade, you may spend 1 %HIT%/%CRIT%/%FOCUS% result. If you do, choose one: the defender loses 1 shield or the defender flips 1 of its facedown damage cards.'
    },
    'I\'ll Show You the Dark Side': {
      text: ' ??? '
    },
    'Proton Bomb': {
      text: '(Bomb Token) - At the end of the Activation Phase, this device detonates. When this device detonates, each ship at range 0–1 suffers 1 %CRIT% damage.'
    },
    'Seismic Charge': {
      text: '(Bomb Token) - At the end of the Activation Phase this device detonates. When this device detonates, choose 1 obstacle at range 0–1. Each ship at range 0–1 of the obstacle suffers 1 %HIT% damage. Then remove that obstacle. '
    },
    'Bomblet': {
      text: '(Bomb Token) - At the end of the Activation Phase this device detonates. When this device detonates, each ship at range 0–1 rolls 2 attack dice. Each ship suffers 1 %HIT% damage for each %HIT%/%CRIT% result.'
    },
    'Loose Cargo': {
      text: '(Debris Token) - Loose cargo is a debris cloud.'
    },
    'Conner Net': {
      text: '(Mine Token) - After a ship overlaps or moves through this device, it detonates. When this device detonates, the ship suffers 1 %HIT% damage and gains 3 ion tokens.'
    },
    'Proximity Mine': {
      text: '(Mine Token) - After a ship overlaps or moves through this device, it detonates. When this device detonates, that ship rolls 2 attack dice. That ship then suffers 1 %HIT% plus 1 %HIT%/%CRIT% damage for each matching result.'
    }
  };
  return modification_translations = title_translations = exportObj.setupCardData(basic_cards, pilot_translations, upgrade_translations, condition_translations, modification_translations, title_translations);
};

exportObj = typeof exports !== "undefined" && exports !== null ? exports : this;

if (exportObj.codeToLanguage == null) {
  exportObj.codeToLanguage = {};
}

exportObj.codeToLanguage.en = 'English';

if (exportObj.translations == null) {
  exportObj.translations = {};
}

exportObj.translations.English = {
  action: {
    "Barrel Roll": '<i class="xwing-miniatures-font xwing-miniatures-font-barrelroll"></i>',
    "Boost": '<i class="xwing-miniatures-font xwing-miniatures-font-boost"></i>',
    "Evade": '<i class="xwing-miniatures-font xwing-miniatures-font-evade"></i>',
    "Focus": '<i class="xwing-miniatures-font xwing-miniatures-font-focus"></i>',
    "Lock": '<i class="xwing-miniatures-font xwing-miniatures-font-lock"></i>',
    "Reload": '<i class="xwing-miniatures-font xwing-miniatures-font-reload"></i>',
    "Rotate Arc": '<i class="xwing-miniatures-font xwing-miniatures-font-rotatearc"></i>',
    "Reinforce": '<i class="xwing-miniatures-font xwing-miniatures-font-reinforce"></i>',
    "Jam": '<i class="xwing-miniatures-font xwing-miniatures-font-jam"></i>',
    "Calculate": '<i class="xwing-miniatures-font xwing-miniatures-font-calculate"></i>',
    "Coordinate": '<i class="xwing-miniatures-font xwing-miniatures-font-coordinate"></i>',
    "Cloak": '<i class="xwing-miniatures-font xwing-miniatures-font-cloak"></i>',
    "Slam": '<i class="xwing-miniatures-font xwing-miniatures-font-slam"></i>',
    "R> Barrel Roll": '<i class="xwing-miniatures-font xwing-miniatures-font-linked red"></i> <i class="xwing-miniatures-font red xwing-miniatures-font-barrelroll"></i>',
    "R> Focus": '<i class="xwing-miniatures-font xwing-miniatures-font-linked red"></i> <i class="xwing-miniatures-font red xwing-miniatures-font-focus"></i>',
    "R> Lock": '<i class="xwing-miniatures-font xwing-miniatures-font-linked red"></i> <i class="xwing-miniatures-font red xwing-miniatures-font-lock"></i>',
    "> Rotate Arc": '<i class="xwing-miniatures-font xwing-miniatures-font-linked"></i> <i class="xwing-miniatures-font xwing-miniatures-font-rotatearc"></i>',
    "R> Rotate Arc": '<i class="xwing-miniatures-font xwing-miniatures-font-linked red"></i> <i class="xwing-miniatures-font red xwing-miniatures-font-rotatearc"></i>',
    "R> Evade": '<i class="xwing-miniatures-font xwing-miniatures-font-linked red"></i> <i class="xwing-miniatures-font red xwing-miniatures-font-evade"></i>',
    "R> Calculate": '<i class="xwing-miniatures-font xwing-miniatures-font-linked red"></i> <i class="xwing-miniatures-font red xwing-miniatures-font-calculate"></i>'
  },
  sloticon: {
    "Astromech": '<i class="xwing-miniatures-font xwing-miniatures-font-astromech"></i>',
    "Force": '<i class="xwing-miniatures-font xwing-miniatures-font-forcepower"></i>',
    "Bomb": '<i class="xwing-miniatures-font xwing-miniatures-font-bomb"></i>',
    "Cannon": '<i class="xwing-miniatures-font xwing-miniatures-font-cannon"></i>',
    "Crew": '<i class="xwing-miniatures-font xwing-miniatures-font-crew"></i>',
    "Talent": '<i class="xwing-miniatures-font xwing-miniatures-font-talent"></i>',
    "Missile": '<i class="xwing-miniatures-font xwing-miniatures-font-missile"></i>',
    "Sensor": '<i class="xwing-miniatures-font xwing-miniatures-font-sensor"></i>',
    "Torpedo": '<i class="xwing-miniatures-font xwing-miniatures-font-torpedo"></i>',
    "Turret": '<i class="xwing-miniatures-font xwing-miniatures-font-turret"></i>',
    "Illicit": '<i class="xwing-miniatures-font xwing-miniatures-font-illicit"></i>',
    "Configuration": '<i class="xwing-miniatures-font xwing-miniatures-font-configuration"></i>',
    "Modification": '<i class="xwing-miniatures-font xwing-miniatures-font-modification"></i>',
    "Gunner": '<i class="xwing-miniatures-font xwing-miniatures-font-gunner"></i>',
    "Device": '<i class="xwing-miniatures-font xwing-miniatures-font-device"></i>',
    "Tech": '<i class="xwing-miniatures-font xwing-miniatures-font-tech"></i>',
    "Title": '<i class="xwing-miniatures-font xwing-miniatures-font-title"></i>'
  },
  slot: {
    "Astromech": "Astromech",
    "Force": "Force",
    "Bomb": "Bomb",
    "Cannon": "Cannon",
    "Crew": "Crew",
    "Missile": "Missile",
    "Sensor": "Sensor",
    "Torpedo": "Torpedo",
    "Turret": "Turret",
    "Hardpoint": "Hardpoint",
    "Illicit": "Illicit",
    "Configuration": "Configuration",
    "Talent": "Talent",
    "Modification": "Modification",
    "Gunner": "Gunner",
    "Device": "Device",
    "Tech": "Tech",
    "Title": "Title"
  },
  sources: {
    "Second Edition Core Set": "Second Edition Core Set",
    "Rebel Alliance Conversion Kit": "Rebel Alliance Conversion Kit",
    "Galactic Empire Conversion Kit": "Galactic Empire Conversion Kit",
    "Scum and Villainy Conversion Kit": "Scum and Villainy Conversion Kit",
    "T-65 X-Wing Expansion Pack": "T-65 X-Wing Expansion Pack",
    "BTL-A4 Y-Wing Expansion Pack": "BTL-A4 Y-Wing Expansion Pack",
    "TIE/ln Fighter Expansion Pack": "TIE/ln Fighter Expansion Pack",
    "TIE Advanced x1 Expansion Pack": "TIE Advanced x1 Expansion Pack",
    "Slave 1 Expansion Pack": "Slave 1 Expansion Pack",
    "Fang Fighter Expansion Pack": "Fang Fighter Expansion Pack",
    "Lando's Millennium Falcon Expansion Pack": "Lando's Millennium Falcon Expansion Pack",
    "Saw's Renegades Expansion Pack": "Saw's Renegades Expansion Pack",
    "TIE Reaper Expansion Pack": "TIE Reaper Expansion Pack"
  },
  ui: {
    shipSelectorPlaceholder: "Select a ship",
    pilotSelectorPlaceholder: "Select a pilot",
    upgradePlaceholder: function(translator, language, slot) {
      return "No " + (translator(language, 'slot', slot)) + " Upgrade";
    },
    modificationPlaceholder: "No Modification",
    titlePlaceholder: "No Title",
    upgradeHeader: function(translator, language, slot) {
      return "" + (translator(language, 'slot', slot)) + " Upgrade";
    },
    unreleased: "unreleased",
    epic: "epic",
    limited: "limited"
  },
  byCSSSelector: {
    '.unreleased-content-used .translated': 'This squad uses unreleased content!',
    '.collection-invalid .translated': 'You cannot field this list with your collection!',
    '.game-type-selector option[value="standard"]': 'Standard',
    '.game-type-selector option[value="custom"]': 'Custom',
    '.game-type-selector option[value="epic"]': 'Epic',
    '.game-type-selector option[value="team-epic"]': 'Team Epic',
    '.xwing-card-browser option[value="name"]': 'Name',
    '.xwing-card-browser option[value="source"]': 'Source',
    '.xwing-card-browser option[value="type-by-points"]': 'Type (by Points)',
    '.xwing-card-browser option[value="type-by-name"]': 'Type (by Name)',
    '.xwing-card-browser .translate.select-a-card': 'Select a card from the list at the left.',
    '.xwing-card-browser .translate.sort-cards-by': 'Sort cards by',
    '.info-well .info-ship td.info-header': 'Ship',
    '.info-well .info-skill td.info-header': 'Initiative',
    '.info-well .info-actions td.info-header': 'Actions',
    '.info-well .info-upgrades td.info-header': 'Upgrades',
    '.info-well .info-range td.info-header': 'Range',
    '.clear-squad': 'New Squad',
    '.save-list': 'Save',
    '.save-list-as': 'Save as…',
    '.delete-list': 'Delete',
    '.backend-list-my-squads': 'Load squad',
    '.view-as-text': '<span class="hidden-phone"><i class="fa fa-print"></i>&nbsp;Print/View as </span>Text',
    '.randomize': 'Random!',
    '.randomize-options': 'Randomizer options…',
    '.notes-container > span': 'Squad Notes',
    '.bbcode-list': 'Copy the BBCode below and paste it into your forum post.<textarea></textarea><button class="btn btn-copy">Copy</button>',
    '.html-list': '<textarea></textarea><button class="btn btn-copy">Copy</button>',
    '.vertical-space-checkbox': "Add space for damage/upgrade cards when printing <input type=\"checkbox\" class=\"toggle-vertical-space\" />",
    '.color-print-checkbox': "Print color <input type=\"checkbox\" class=\"toggle-color-print\" checked=\"checked\" />",
    '.print-list': '<i class="fa fa-print"></i>&nbsp;Print',
    '.do-randomize': 'Randomize!',
    '#browserTab': 'Card Browser',
    '#aboutTab': 'About',
    '.choose-obstacles': 'Choose Obstacles',
    '.choose-obstacles-description': 'Choose up to three obstacles to include in the permalink for use in external programs. (This feature is in BETA; support for displaying which obstacles were selected in the printout is not yet supported.)',
    '.coreasteroid0-select': 'Core Asteroid 0',
    '.coreasteroid1-select': 'Core Asteroid 1',
    '.coreasteroid2-select': 'Core Asteroid 2',
    '.coreasteroid3-select': 'Core Asteroid 3',
    '.coreasteroid4-select': 'Core Asteroid 4',
    '.coreasteroid5-select': 'Core Asteroid 5',
    '.yt2400debris0-select': 'YT2400 Debris 0',
    '.yt2400debris1-select': 'YT2400 Debris 1',
    '.yt2400debris2-select': 'YT2400 Debris 2',
    '.vt49decimatordebris0-select': 'VT49 Debris 0',
    '.vt49decimatordebris1-select': 'VT49 Debris 1',
    '.vt49decimatordebris2-select': 'VT49 Debris 2',
    '.core2asteroid0-select': 'Force Awakens Asteroid 0',
    '.core2asteroid1-select': 'Force Awakens Asteroid 1',
    '.core2asteroid2-select': 'Force Awakens Asteroid 2',
    '.core2asteroid3-select': 'Force Awakens Asteroid 3',
    '.core2asteroid4-select': 'Force Awakens Asteroid 4',
    '.core2asteroid5-select': 'Force Awakens Asteroid 5'
  },
  singular: {
    'pilots': 'Pilot',
    'modifications': 'Modification',
    'titles': 'Title'
  },
  types: {
    'Pilot': 'Pilot',
    'Modification': 'Modification',
    'Title': 'Title'
  }
};

if (exportObj.cardLoaders == null) {
  exportObj.cardLoaders = {};
}

exportObj.cardLoaders.English = function() {
  var basic_cards, condition_translations, modification_translations, pilot_translations, title_translations, upgrade_translations;
  exportObj.cardLanguage = 'English';
  basic_cards = exportObj.basicCardData();
  exportObj.canonicalizeShipNames(basic_cards);
  exportObj.ships = basic_cards.ships;
  pilot_translations = {
    "4-LOM": {
      text: "After you fully execute a red maneuver, gain 1 calculate token. At the start of the End Phase, you may choose 1 ship at range 0-1. If you do, transfer 1 of your stress tokens to that ship."
    },
    "Academy Pilot": {
      text: " "
    },
    "Airen Cracken": {
      text: "After you perform an attack, you may choose 1 friendly ship at range 1. That ship may perform an action, treating it as red."
    },
    "Alpha Squadron Pilot": {
      text: "AUTOTHRUSTERS: After you perform an action. you may perform a red %BARRELROLL% or a red %BOOST% action."
    },
    "AP-5": {
      text: "While you coordinate, if you chose a ship with exactly 1 stress token, it can perform actions. %LINEBREAK% COMMS SHUTTLE: While you are docked, your carrier ship gains %COORDINATE%. Before your carrier ship activates, it may perform a %COORDINATE% action."
    },
    "Arvel Crynyd": {
      text: "You can perform primary attacks at range 0. If you would fail a %BOOST% action by overlapping another ship, resolve it as though you were partially executing a maneuver instead. %LINEBREAK% VECTORED THRUSTERS: After you perform an action, you may perform a red %BOOST% action."
    },
    "Asajj Ventress": {
      text: "At the start of the Engagement Phase, you may choose 1 enemy ship in your %SINGLETURRETARC% at range 0-2 and spend 1 %FORCE% token. If you do, that ship gains 1 stress token unless it removes 1 green token."
    },
    "Autopilot Drone": {
      text: "RIGGED ENERGY CELLS: During the System Phase, if you are not docked, lose 1 %CHARGE%. At the end of the Activation Phase, if you have 0 %CHARGE%, you are destroyed. Before you are removed each ship at range 0-1 suffers 1 %CRIT% damage"
    },
    "Bandit Squadron Pilot": {
      text: " "
    },
    "Baron of the Empire": {
      text: " "
    },
    "Benthic Two-Tubes": {
      text: "After you perform a %FOCUS% action, you may transfer 1 of your focus tokens to a friendly ship at range 1-2."
    },
    "Biggs Darklighter": {
      text: "While another friendly ship at range 0-1 defends, before the Neutralize Results step, if you are in the attack arc, you may suffer 1 %HIT% or %CRIT% damage to cancel 1 matching result."
    },
    "Binayre Pirate": {
      text: " "
    },
    "Black Squadron Ace": {
      text: " "
    },
    "Black Squadron Scout": {
      text: "ADAPTIVE AILERONS: Before you reveal your dial, if you are not stressed, you MUST execute a white (1 %BANKLEFT%), (1 %STRAIGHT%) or (1 %BANKRIGHT%)"
    },
    "Black Sun Ace": {
      text: " "
    },
    "Black Sun Assassin": {
      text: "MICROTHRUSTERS: While you perform a barrel roll, you MUST use the (1 %BANKLEFT%) or (1 %BANKRIGHT%) template instead of the [1 %STRAIGHT%] template."
    },
    "Black Sun Enforcer": {
      text: "MICROTHRUSTERS: While you perform a barrel roll, you MUST use the (1 %BANKLEFT%) or (1 %BANKRIGHT%) template instead of the [1 %STRAIGHT%] template."
    },
    "Black Sun Soldier": {
      text: " "
    },
    "Blade Squadron Veteran": {
      text: " "
    },
    "Blue Squadron Escort": {
      text: " "
    },
    "Blue Squadron Pilot": {
      text: " "
    },
    "Blue Squadron Scout": {
      text: " "
    },
    "Boba Fett": {
      text: "While you defend or perform an attack, you may reroll 1 of your dice for each enemy ship at range 0-1."
    },
    "Bodhi Rook": {
      text: "Friendly ships can acquire locks onto objects at range 0-3 of any friendly ship."
    },
    "Bossk": {
      text: "While you perform a primary attack, after the Neutralize Results step, you may spend 1 %CRIT% result to add 2 %HIT% results."
    },
    "Bounty Hunter": {
      text: " "
    },
    "Braylen Stramm": {
      text: "While you defend or perform an attack, if you are stressed, you may reroll up to 2 of your dice."
    },
    "Captain Feroph": {
      text: "While you defend, if the attacker does not have any green tokens, you may change 1 of your blank or %FOCUS% results to an %EVADE% result. %LINEBREAK% ADAPTIVE AILERONS: Before you reveal your dial, if you are not stressed, you MUST execute a white (1 %BANKLEFT%), (1 %STRAIGHT%) or (1 %BANKRIGHT%)"
    },
    "Captain Jonus": {
      text: "While a friendly ship at range 0-1 performs a %TORPEDO% or %MISSILE% attack, that ship may reroll up to 2 attack dice. %LINEBREAK% NIMBLE BOMBER: If you would drop a device using a %STRAIGHT% template, you may use %BANKLEFT% a or %BANKRIGHT% tempate of the same speed instead."
    },
    "Captain Jostero": {
      text: "After an enemy ship suffers damage, if it is not defending, you may perform a bonus attack against that ship."
    },
    "Captain Kagi": {
      text: "At the start of the Engagement Phase, you may choose 1 or more friendly ships at range 0-3. If you do, transfer all enemy lock tokens from the chosen ships to you."
    },
    "Captain Nym": {
      text: "Before a friendly bomb or mine would detonate, you may spend 1 %CHARGE% to prevent it from detonating. While you defend against an attack obstructed by a bomb or mine, roll 1 additional defense die."
    },
    "Captain Oicunn": {
      text: "You can perform primary attacks at range 0."
    },
    "Captain Rex": {
      text: "After you perform an attack, assign the Suppressive Fire condition to the defender."
    },
    "Cartel Executioner": {
      text: "DEAD TO RIGHTS: While you perform an attack, if the defender is in your %BULLSEYEARC%, defense dice cannot be modified using green tokens."
    },
    "Cartel Marauder": {
      text: "The versatile Kihraxz was modeled after Incom's popular X-wing starfighter, but an array of aftermarket modification kits ensure a wide variety of designs."
    },
    "Cartel Spacer": {
      text: "WEAPON HARDPOINT: You can equip 1 %CANNON%, %TORPEDO% or %MISSILE% upgrade."
    },
    "Cassian Andor": {
      text: "At the start of the Activation Phase, you may choose 1 friendly ship at range 1-3. If you do, that ship removes 1 stress token."
    },
    "Cavern Angels Zealot": {
      text: " "
    },
    "Chewbacca": {
      text: "Before you would be dealt a faceup damage card, you may spend 1 %CHARGE% to be dealt the card facedown instead."
    },
    '"Chopper"': {
      text: "At the start of the Engagement Phase, each enemy ship at range 0 gains 2 jam tokens.TAIL GUN: While you have a docked ship, you have a primary %REARARC% weapon with an attack value equal to your docked ship's Primary %FRONTARC% attack value."
    },
    "Colonel Jendon": {
      text: "At the start of the Activation Phase, you may spend 1 %CHARGE%. If you do, while friendly ships acquire lock this round, they must acquire locks beyond range 3 instead of at range 0-3."
    },
    "Colonel Vessery": {
      text: "While you perform an attack against a locked ship, after you roll attack dice, you may acquire a lock on the defender. %LINEBREAK% FULL THROTTLE: After you FULLY execute a speed 3-5 maneuver, you may perform an %EVADE% action."
    },
    "Constable Zuvio": {
      text: "If you would drop a device, you may launch it using a [1 %STRAIGHT%] template instead. %LINEBREAK% SPACETUG TRACTOR ARRAY: ACTION: Choose a ship in your %FRONTARC% at range 1. That ship gains one tractor token, or 2 tractor tokens if it is in your %BULLSEYEARC% at range 1"
    },
    "Contracted Scout": {
      text: " "
    },
    "Corran Horn": {
      text: "At initiative 0, you may perform a bonus primary attack against an enemy ship in your %BULLSEYEARC%. If you do, at the start of the next Planning Phase, gain 1 disarm token. %LINEBREAK% EXPERIMENTAL SCANNERS: You can acquire locks beyond range 3. You cannot acquite locks at range 1."
    },
    '"Countdown"': {
      text: "While you defend, after the Neutralize Results step, if you are not stressed, you may suffer 1 %HIT% damage and gain 1 stress token. If you do, cancel all dice results. %LINEBREAK% ADAPTIVE AILERONS: Before you reveal your dial, if you are not stressed, you MUST execute a white (1 %BANKLEFT%), (1 %STRAIGHT%) or (1 %BANKRIGHT%)"
    },
    "Countess Ryad": {
      text: "While you would execute a %STRAIGHT% maneuver, you may increase the difficulty of the maneuver. If you do, execute it as a %KTURN% maneuver instead. %LINEBREAK% FULL THROTTLE: After you FULLY execute a speed 3-5 maneuver, you may perform an %EVADE% action."
    },
    "Crymorah Goon": {
      text: " "
    },
    "Cutlass Squadron Pilot": {
      text: " "
    },
    "Dace Bonearm": {
      text: "After an enemy ship at range 0-3 receives at least 1 ion token, you may spend 3 %CHARGE%. If you do, that ship gains 2 additional ion tokens."
    },
    "Dalan Oberos": {
      text: "At the start of the Engagement Phase, you may choose 1 shielded ship in your %BULLSEYEARC% and spend 1 %CHARGE%. If you do, that ship loses 1 shield and you recover 1 shield. %LINEBREAK% DEAD TO RIGHTS: While you perform an attack, if the defender is in your %BULLSEYEARC%, defense dice cannot be modified using green tokens."
    },
    "Dalan Oberos (StarViper)": {
      text: "After you fully execute a maneuver, you may gain 1 stress token to rotate your ship 90˚.  %LINEBREAK% MICROTHRUSTERS: While you perform a barrel roll, you MUST use the (1 %BANKLEFT%) or (1 %BANKRIGHT%) template instead of the [1 %STRAIGHT%] template."
    },
    "Darth Vader": {
      text: "After you perform an action, you may spend 1 %FORCE% to perform an action. %LINEBREAK% ADVANCED TARGETING COMPUTER: While you perform a primary attack against a defender you have locked, roll 1 additional attack die and change 1 %HIT% result to a %CRIT% result."
    },
    "Dash Rendar": {
      text: "While you move, you ignore obstacles. %LINEBREAK% SENSOR BLINDSPOT: While you perform a primary attack at range 0-1, do not apply the range 0-1 bonus and roll 1 fewer attack die."
    },
    '"Deathfire"': {
      text: "After you are destroyed, before you are removed, you may perform an attack and drop or launch 1 device. %LINEBREAK% NIMBLE BOMBER: If you would drop a device using a %STRAIGHT% template, you may use %BANKLEFT% a or %BANKRIGHT% tempate of the same speed instead."
    },
    '"Deathrain"': {
      text: "After you drop or launch a device, you may perform an action."
    },
    "Del Meeko": {
      text: "While a friendly ship at range 0-2 defends against a damaged attacker, the defender may reroll 1 defense die."
    },
    "Delta Squadron Pilot": {
      text: "FULL THROTTLE: After you FULLY execute a speed 3-5 maneuver, you may perform an %EVADE% action."
    },
    "Dengar": {
      text: "After you defend, if the attcker is in your %FRONTARC%, you may spend 1 %CHARGE% to perform a bonus attack against the attacker."
    },
    '"Double Edge"': {
      text: "After you perform a %TURRET% or %MISSILE% attack that misses, you may perform a bonus attack using a different weapon."
    },
    "Drea Renthal": {
      text: "While a friendly non-limited ship performs an attack, if the defender is in your firing arc, the attacker may reroll 1 attack die."
    },
    '"Duchess"': {
      text: "You may choose not to use your Adaptive Ailerons. You may use your Adaptive Ailerons even while stressed. %LINEBREAK% ADAPTIVE AILERONS: Before you reveal your dial, if you are not stressed, you MUST execute a white (1 %BANKLEFT%), (1 %STRAIGHT%) or (1 %BANKRIGHT%)"
    },
    '"Dutch" Vander': {
      text: "After you perform the %LOCK% action, you may choose 1 friendly ship at range 1-3. That ship may acquire a lock on the object you locked, ignoring range restrictions."
    },
    '"Echo"': {
      text: "While you decloak, you must use the (2 %BANKLEFT%) or (2 %BANKRIGHT%) template instead of the (2 %STRAIGHT%) template. STYGUM ARRAY: After you decloak, you may perform an %EVADE% action. At the Start of the End Phase, you may spend 1 evade token to gain one cloak token."
    },
    "Edrio Two-Tubes": {
      text: "Before you activate, if you are focused, you may perform an action."
    },
    "Emon Azzameen": {
      text: "If you would drop a device using a [1 %STRAIGHT%] template, you may use the [3 %TURNLEFT%], [3 %STRAIGHT%], or [3 %TURNRIGHT%] template instead."
    },
    "Esege Tuketu": {
      text: "While a friendly ship at range 0-2 defends or performs an attack, it may spend your focus tokens as if that ship has them."
    },
    "Evaan Verlaine": {
      text: "At the start of the Engagement Phase, you may spend 1 focus token to choose a friendly ship at range 0-1. If you do, that ship rolls 1 additional defense die while defending until the end of the round."
    },
    "Ezra Bridger": {
      text: "While you defend or perform an attack, if you are stressed, you may spend 1 %FORCE% to change up to 2 of your %FOCUS% results to %EVADE% or %HIT% results. %LINEBREAK% LOCKED AND LOADED: While you are docked, after your carrier ship performs a primary %FRONTARC% or %TURRET% attack, it may perform a bonus %REARARC% attack"
    },
    "Ezra Bridger (Sheathipede)": {
      text: "While you defend or perform an attack, if you are stressed, you may spend 1 %FORCE% to change up to 2 of your %FOCUS% results to %EVADE%/%HIT% results. %LINEBREAK% COMMS SHUTTLE: While you are docked, your carrier ship gains %COORDINATE%. Before your carrier shpi activates, it may perform a %COORDINATE% action."
    },
    "Ezra Bridger (TIE Fighter)": {
      text: "While you defend or perform an attack, if you are stressed, you may spend 1 %FORCE% to change up to 2 of your %FOCUS% results to %EVADE% or %HIT% results."
    },
    "Fenn Rau": {
      text: "While you defend or perform an attack, if the attack range is 1, you may roll 1 additional die. %LINEBREAK% CONCORDIA FACEOFF: While you defend, if the attack range is 1 and you are in the attackers %FRONTARC%, change 1 result to an %EVADE% result"
    },
    "Fenn Rau (Sheathipede)": {
      text: "After an enemy ship in your firing arc engages, if you are not stressed, you may gain 1 stress token. If you do, that ship cannot spend tokens to modify dice while it performs an attack during this phase. %LINEBREAK% COMMS SHUTTLE: While you are docked, your carrier ship gains %COORDINATE%. Before your carrier shpi activates, it may perform a %COORDINATE% action."
    },
    "Freighter Captain": {
      text: " "
    },
    "Gamma Squadron Ace": {
      text: "NIMBLE BOMBER: If you would drop a device using a %STRAIGHT% template, you may use %BANKLEFT% a or %BANKRIGHT% tempate of the same speed instead."
    },
    "Gand Findsman": {
      text: "The legendary Findsmen of Gand worship enshrouding mists of their home planet, using signs, augurs, and mystical rituals to track their quarry."
    },
    "Garven Dreis": {
      text: "After you spend a focus token, you may choose 1 friendly ship at range 1-3. That ship gains 1 focus token."
    },
    "Garven Dreis (X-Wing)": {
      text: "After you spend a focus token, you may choose 1 friendly ship at range 1-3. That ship gains 1 focus token."
    },
    "Gavin Darklighter": {
      text: "While a friendly ship performs an attack, if the defender is in your %FRONTARC%, the attacker may change 1 %HIT% result to a %CRIT% result. %LINEBREAK% EXPERIMENTAL SCANNERS: You can acquire locks beyond range 3. You cannot acquite locks at range 1."
    },
    "Genesis Red": {
      text: "After you acquire a lock, you must remove all of your focus and evade tokens. Then gain the same number of focus and evade tokens that the locked ship has. %LINEBREAK% WEAPON HARDPOINT: You can equip 1 %CANNON%, %TORPEDO% or %MISSILE% upgrade."
    },
    "Gideon Hask": {
      text: "While you perform an attack against a damaged defender, roll 1 additional attack die."
    },
    "Gold Squadron Veteran": {
      text: " "
    },
    "Grand Inquisitor": {
      text: "While you defend at attack range 1, you may spend 1 %FORCE% to prevent the range 1 bonus. While you perform an attack against a defender at attack range 2-3, you may spend 1 %FORCE% to apply the range 1 bonus."
    },
    "Gray Squadron Bomber": {
      text: " "
    },
    "Graz": {
      text: "While you defend, if you are behind the attacker, roll 1 additional defense die. While you perform an attack, if you are behind the defender roll 1 additional attack die."
    },
    "Green Squadron Pilot": {
      text: "VECTORED THRUSTERS: After you perform an action, you may perform a red %BOOST% action."
    },
    "Guri": {
      text: "At the start of the Engagement Phase, if there is at least 1 enemy ship at range 0-1, you may gain 1 focus token.  %LINEBREAK% MICROTHRUSTERS: While you perform a barrel roll, you MUST use the (1 %BANKLEFT%) or (1 %BANKRIGHT%) template instead of the [1 %STRAIGHT%] template."
    },
    "Han Solo (Scum)": {
      text: "Whlie you defend or perform a primary attack, if the attack is obstructed by an obstacle, you may roll 1 additional die."
    },
    "Han Solo": {
      text: "After you roll dice, if you are at range 0-1 of an obstacle, you may reroll all of your dice. This does not count as rerolling for the purpose of other effects."
    },
    "Heff Tobber": {
      text: "After an enemy ship executes a maneuver, if it is at range 0, you may perform an action."
    },
    "Hera Syndulla": {
      text: "After you reveal a red or blue maneuver, you may set your dial to another maneuver of the same difficulty. %LINEBREAK% LOCKED AND LOADED: While you are docked, after your carrier ship performs a primary %FRONTARC% or %TURRET% attack, it may perform a bonus %REARARC% attack"
    },
    "Hera Syndulla (VCX-100)": {
      text: "After you reveal a red or blue maneuver, you may set your dial to another maneuver of the same difficulty. TAIL GUN: While you have a docked ship, you have a primary %REARARC% weapon with an attack value equal to your docked ship's Primary %FRONTARC% attack value."
    },
    "Hired Gun": {
      text: "Just the mention of Imperial credits can bring a host of less-than-trustworthy individuals to your side."
    },
    "Horton Salm": {
      text: "While you perform an attack, you may reroll 1 attack die for each other friendly ship at range 0-1 of the defender."
    },
    '"Howlrunner"': {
      text: "While a friendly ship at range 0-1 performs a primary attack, that ship may reroll 1 attack die."
    },
    "Ibtisam": {
      text: "After you fully execute a maneuver, if you are stressed, you may roll 1 attack die. On a %HIT% or %CRIT% result, remove 1 stress token."
    },
    "Iden Versio": {
      text: "Before a friendly TIE/ln fighter at range 0-1 would suffer 1 or more damage, you may spend 1 %CHARGE%. If you do, prevent that damage."
    },
    "IG-88A": {
      text: "At the start of the Engagement Phase, you may choose 1 friendly ship with %CALCULATE% on its action bar at range 1-3. If you do, transfer 1 of your calculate tokens to it. %LINEBREAK% ADVANCED DROID BRAIN: After you perform a %CALCULATE% action, gain 1 calculate token."
    },
    "IG-88B": {
      text: "After you perform an attack that misses, you may perform a bonus %CANNON% attack. %LINEBREAK% ADVANCED DROID BRAIN: After you perform a %CALCULATE% action, gain 1 calculate token."
    },
    "IG-88C": {
      text: "After you perform a %BOOST% action, you may perform an %EVADE% action. %LINEBREAK% ADVANCED DROID BRAIN: After you perform a %CALCULATE% action, gain 1 calculate token."
    },
    "IG-88D": {
      text: "While you execute a Segnor's Loop (%SLOOPLEFT% or %SLOOPRIGHT%) maneuver, you may use another template of the same speed instead: either the turn (%TURNLEFT% or %TURNRIGHT%) of the same direction or the straight (%STRAIGHT%) template. %LINEBREAK% ADVANCED DROID BRAIN: After you perform a %CALCULATE% action, gain 1 calculate token."
    },
    "Imdaar Test Pilot": {
      text: "STYGUM ARRAY: After you decloak, you may perform an %EVADE% action. At the Start of the End Phase, you may spend 1 evade token to gain one cloak token."
    },
    "Inaldra": {
      text: "While you defend or perform an attack, you may suffer 1 %HIT% damage to reroll any number of your dice. %LINEBREAK% WEAPON HARDPOINT: You can equip 1 %CANNON%, %TORPEDO% or %MISSILE% upgrade."
    },
    "Inquisitor": {
      text: "The fearsome Inquisitors are given a great deal of autonomy and access to the Empire's latest technology, like the prototype TIE Advanced v1."
    },
    "Jake Farrell": {
      text: "After you perform a %BARRELROLL% or %BOOST% action, you may choose a friendly ship at range 0-1. That ship may perform a %FOCUS% action. %LINEBREAK% VECTORED THRUSTERS: After you perform an action, you may perform a red %BOOST% action."
    },
    "Jakku Gunrunner": {
      text: "SPACETUG TRACTOR ARRAY: ACTION: Choose a ship in your %FRONTARC% at range 1. That ship gains one tractor token, or 2 tractor tokens if it is in your %BULLSEYEARC% at range 1"
    },
    "Jan Ors": {
      text: "While a friendly ship in your firing arc performs a primary attack, if you are not stressed, you may gain 1 stress token. If you do, that ship may roll 1 additional attack die."
    },
    "Jek Porkins": {
      text: "After you receive a stress token, you may roll 1 attack die to remove it. On a %HIT% result, suffer 1 %HIT% damage."
    },
    "Joy Rekkoff": {
      text: "While you perform an attack, you may spend 1 %CHARGE% from an equipped %TORPEDO% upgrade. If you do, the defender rolls 1 fewer defense die. %LINEBREAK% CONCORDIA FACEOFF: While you defend, if the attack range is 1 and you are in the attackers %FRONTARC%, change 1 result to an %EVADE% result"
    },
    "Kaa'to Leeachos": {
      text: "At the start of the Engagement Phase, you may choose 1 friendly ship at range 0-2. If you do, transfer 1 focus or evade token from that ship to yourself."
    },
    "Kad Solus": {
      text: "After you fully execute a red maneuver, gain 2 focus tokens."
    },
    "Kanan Jarrus": {
      text: "While a friendly ship in your firing arc defends, you may spend 1 %FORCE%. If you do, the attacker rolls 1 fewer attack die. TAIL GUN: While you have a docked ship, you have a primary %REARARC% weapon with an attack value equal to your docked ship's Primary %FRONTARC% attack value."
    },
    "Kashyyyk Defender": {
      text: "Equipped with three wide-range Sureggi twin laser cannons, the Auzituck gunship acts as a powerful deterrent to slaver operations in the Kashyyyk system."
    },
    "Kath Scarlet": {
      text: "While you perform a primary attack, if there is at least 1 friendly non-limited ship at range 0 of the defender, roll 1 additional attack die."
    },
    "Kavil": {
      text: "While you perform a non-%FRONTARC% attack, roll 1 additional attack die."
    },
    "Ketsu Onyo": {
      text: "At the start of the Engagement Phase, you may choose 1 ship in both your %FRONTARC% and %SINGLETURRETARC% at range 0-1. If you do, that ship gains 1 tractor token."
    },
    "Knave Squadron Escort": {
      text: "EXPERIMENTAL SCANNERS: You can acquire locks beyond range 3. You cannot acquite locks at range 1."
    },
    "Koshka Frost": {
      text: "While you defend or perform an attack, if the enemy ship is stressed, you may reroll 1 of your dice."
    },
    "Krassis Trelix": {
      text: "You can perform %FRONTARC% special attacks from your %REARARC%. While you perform a special attack, you may reroll 1 attack die."
    },
    "Kullbee Sperado": {
      text: "After you perform a %BARRELROLL% or %BOOST% action, you may flip your equipped %CONFIG% upgrade card."
    },
    "Kyle Katarn": {
      text: "At the start of the Engagement Phase, you may transfer 1 of your focus tokens to a friendly ship in your firing arc."
    },
    "L3-37 (Escape Craft)": {
      text: "If you are not shielded, decrease the difficulty of your bank (%BANKLEFT% and %BANKRIGHT%) maneuvers. %LINEBREAK% CO-PILOT: While you are docked, your carried ship has your pilot ability in addition it's own."
    },
    "L3-37": {
      text: "If you are not shielded, decrease the difficulty of your bank (%BANKLEFT% and %BANKRIGHT%) maneuvers."
    },
    "Laetin A'shera": {
      text: "After you defend or perform an attack, if the attack missed, gain 1 evade token. %LINEBREAK% WEAPON HARDPOINT: You can equip 1 %CANNON%, %TORPEDO% or %MISSILE% upgrade."
    },
    "Lando Calrissian (Scum) (Escape Craft)": {
      text: "After you roll dice, if you are not stressed, you may gain 1 stress token to reroll all of your blank results. %LINEBREAK% CO-PILOT: While you are docked, your carried ship has your pilot ability in addition it's own."
    },
    "Lando Calrissian": {
      text: "After you fully execute a blue maneuver, you may choose a friendly ship at range 0-3. That ship may perform an action."
    },
    "Lando Calrissian (Scum)": {
      text: "After you roll dice, if you are not stressed, you may gain 1 stress token to reroll all of your blank results."
    },
    "Latts Razzi": {
      text: "At the start of the Engagement Phase, you may choose a ship at range 1 and spend a lock you have on that ship. If you do, that ship gains 1 tractor token."
    },
    '"Leebo"': {
      text: "After you defend or perform an attack, if you spent a calculate token, gain 1 calculate token. %LINEBREAK% SENSOR BLINDSPOT: While you perform a primary attack at range 0-1, do not apply the range 0-1 bonus and roll 1 fewer attack die."
    },
    "Leevan Tenza": {
      text: "After you perform a %BARRELROLL% or %BOOST% action, you may perform a red %EVADE% action."
    },
    "Lieutenant Blount": {
      text: "While you perform a primary attack, if there is at least 1 other friendly ship at range 0-1 of the defender, you may roll 1 additional attack die."
    },
    "Lieutenant Karsabi": {
      text: "After you gain a disarm token, if you are not stressed, you may gain 1 stress token to remove 1 disarm token."
    },
    "Lieutenant Kestal": {
      text: "While you perform an attack, after the defender rolls defense dice, you may spend 1 focus token to cancel all of the defender's blank/%FOCUS% results."
    },
    "Lieutenant Sai": {
      text: "After you a perform a %COORDINATE% action, if the ship you chose performed an action on your action bar, you may perform that action."
    },
    "Lok Revenant": {
      text: " "
    },
    "Lothal Rebel": {
      text: "TAIL GUN: While you have a docked ship, you have a primary %REARARC% weapon with an attack value equal to your docked ship's Primary %FRONTARC% attack value."
    },
    "Lowhhrick": {
      text: "After a friendly ship at range 0-1 becomes the defender, you may spend 1 reinforce token. If you do, that ship gains 1 evade token."
    },
    "Luke Skywalker": {
      text: "After you become the defender (before dice are rolled), you may recover 1 %FORCE%."
    },
    "Maarek Stele": {
      text: "While you perform an attack, if the defender would be dealt a faceup damage card, instead draw 3 damage cards, choose 1, and discard the rest. %LINEBREAK% ADVANCED TARGETING COMPUTER: While you perform a primary attack against a defender you have locked, roll 1 additional attack die and change 1 %HIT% result to a %CRIT% result."
    },
    "Magva Yarro": {
      text: "While a friendly ship at range 0-2 defends, the attacker cannot reroll more than 1 attack die."
    },
    "Major Rhymer": {
      text: "While you perform a %TORPEDO% or %MISSILE% attack, you may increase or decrease the range requirement by 1, to a limit of 0-3. %LINEBREAK% NIMBLE BOMBER: If you would drop a device using a %STRAIGHT% template, you may use %BANKLEFT% a or %BANKRIGHT% tempate of the same speed instead."
    },
    "Major Vermeil": {
      text: "While you perform an attack, if the defender does not have any green tokens, you may change 1 of your  blank  or %FOCUS% results to a %HIT% result. %LINEBREAK% ADAPTIVE AILERONS: Before you reveal your dial, if you are not stressed, you MUST execute a white (1 %BANKLEFT%), (1 %STRAIGHT%) or (1 %BANKRIGHT%)"
    },
    "Major Vynder": {
      text: "While you defend, if you are disarmed, roll 1 additional defense die."
    },
    "Manaroo": {
      text: "At the start of the Engagement Phase, you may choose a friendly ship at range 0-1. If you do, transfer all green tokens assigned to you to that ship."
    },
    '"Mauler" Mithel': {
      text: "While you perform an attack at attack range 1, roll 1 additional attack die."
    },
    "Miranda Doni": {
      text: "While you perform a primary attack, you may either spend 1 shield to roll 1 additional attack die or, if you are not shielded, you may roll 1 fewer attack die to recover 1 shield."
    },
    "Moralo Eval": {
      text: "If you would flee, you may spend 1 %CHARGE%. If you do, place yourself in reserves instead. At the start of the next Planning Phase, place youself within range 1 of the edge of the play area that you fled from."
    },
    "Nashtah Pup": {
      text: "You can deploy only via emergency deployment, and you have the name, initiative, pilot ability, and ship %CHARGE% of the friendly, destroyed Hound's Tooth. %LINEBREAK% ESCAPE CRAFT SETUP: Requires the HOUND'S TOOTH. You MUST begin the game docked with the HOUND'S TOOTH"
    },
    "N'dru Suhlak": {
      text: "While you perform a primary attack, if there are no other friendly ships at range 0-2, roll 1 additional attack die."
    },
    '"Night Beast"': {
      text: "After you fully execute a blue maneuver, you may perform a %FOCUS% action."
    },
    "Norra Wexley": {
      text: "While you defend, if there is an enemy ship at range 0-1, add 1 %EVADE% result to your dice results."
    },
    "Norra Wexley (Y-Wing)": {
      text: "While you defend, if there is an enemy ship at range 0-1, you may add 1 %EVADE% result to your dice results."
    },
    "Nu Squadron Pilot": {
      text: " "
    },
    "Obsidian Squadron Pilot": {
      text: " "
    },
    "Old Teroch": {
      text: "At the start of the Engagement Phase, you may choose 1 enemy ship at range 1. If you do and you are in its %FRONTARC%, it removes all of its green tokens. %LINEBREAK% CONCORDIA FACEOFF: While you defend, if the attack range is 1 and you are in the attackers %FRONTARC%, change 1 result to an %EVADE% result."
    },
    "Omicron Group Pilot": {
      text: " "
    },
    "Onyx Squadron Ace": {
      text: "FULL THROTTLE: After you FULLY execute a speed 3-5 maneuver, you may perform an %EVADE% action."
    },
    "Onyx Squadron Scout": {
      text: " "
    },
    "Outer Rim Pioneer": {
      text: "Friendly ships at range 0-1 can perform attacks at range 0 of obstacles. %LINEBREAK% CO-PILOT: While you are docked, your carried ship has your pilot ability in addition it's own."
    },
    "Outer Rim Smuggler": {
      text: " "
    },
    "Palob Godalhi": {
      text: "At the start of the Engagement Phase, you may choose 1 enemy ship in your firing arc at range 0-2. If you do, transfer 1 focus or evade token from that ship to yourself."
    },
    "Partisan Renegade": {
      text: " "
    },
    "Patrol Leader": {
      text: " "
    },
    "Phoenix Squadron Pilot": {
      text: "VECTORED THRUSTERS: After you perform an action, you may perform a red %BOOST% action."
    },
    "Planetary Sentinel": {
      text: "ADAPTIVE AILERONS: Before you reveal your dial, if you are not stressed, you MUST execute a white (1 %BANKLEFT%), (1 %STRAIGHT%) or (1 %BANKRIGHT%)"
    },
    "Prince Xizor": {
      text: "While you defend, after the Neutralize Results step, another friendly ship at range 0-1 and in the attack arc may suffer 1 %HIT% or %CRIT% damage. If it does, cancel 1 matching result.  %LINEBREAK% MICROTHRUSTERS: While you perform a barrel roll, you MUST use the (1 %BANKLEFT%) or (1 %BANKRIGHT%) template instead of the [1 %STRAIGHT%] template."
    },
    '"Pure Sabacc"': {
      text: "While you perform an attack, if you have 1 or fewer damage cards, you may roll 1 additional attack die. %LINEBREAK% ADAPTIVE AILERONS: Before you reveal your dial, if you are not stressed, you MUST execute a white (1 %BANKLEFT%), (1 %STRAIGHT%) or (1 %BANKRIGHT%)"
    },
    "Quinn Jast": {
      text: "At the start of the Engagement Phase, you may gain 1 disarm token to recover 1 %CHARGE% on 1 of your equipped upgrades. %LINEBREAK% WEAPON HARDPOINT: You can equip 1 %CANNON%, %TORPEDO% or %MISSILE% upgrade."
    },
    "Rear Admiral Chiraneau": {
      text: "While you perform an attack, if you are reinforced and the defender is in the %FULLFRONTARC% or %FULLREARARC% matching your reinforce token, you may change 1 of your %FOCUS% results to a %CRIT% result."
    },
    "Rebel Scout": {
      text: " "
    },
    "Red Squadron Veteran": {
      text: " "
    },
    '"Redline"': {
      text: "You can maintain up to 2 locks. After you perform an action, you may acquire a lock."
    },
    "Rexler Brath": {
      text: "After you perform an attack that hits, if you are evading, expose 1 of the defender's damage cards. %LINEBREAK% FULL THROTTLE: After you FULLY execute a speed 3-5 maneuver, you may perform an %EVADE% action."
    },
    "Rho Squadron Pilot": {
      text: " "
    },
    "Roark Garnet": {
      text: "At the start of the Engagement Phase, you may choose 1 ship in your firing arc. If you do, it engages at initiative 7 instead of its standard initiative value this phase."
    },
    "Rogue Squadron Escort": {
      text: "EXPERIMENTAL SCANNERS: You can acquire locks beyond range 3. You cannot acquire locks at range 1."
    },
    "Saber Squadron Ace": {
      text: "AUTOTHRUSTERS: After you perform an action. you may perform a red %BARRELROLL% or a red %BOOST% action."
    },
    "Sabine Wren": {
      text: "Before you activate, you may perform a %BARRELROLL% or %BOOST% action. %LINEBREAK% LOCKED AND LOADED: While you are docked, after your carrier ship performs a primary %FRONTARC% or %TURRET% attack, it may perform a bonus %REARARC% attack"
    },
    "Sabine Wren (Scum)": {
      text: "While you defend, if the attacker is in your %SINGLETURRETARC% at range 0-2, you may add 1 %FOCUS% result to your dice results."
    },
    "Sabine Wren (TIE Fighter)": {
      text: "Before you activate, you may perform a %BARRELROLL% or %BOOST% action."
    },
    "Sarco Plank": {
      text: "While you defend, you may treat your agility value as equal to the speed of the maneuver you executed this round. %LINEBREAK% SPACETUG TRACTOR ARRAY: ACTION: Choose a ship in your %FRONTARC% at range 1. That ship gains one tractor token, or 2 tractor tokens if it is in your %BULLSEYEARC% at range 1"
    },
    "Saw Gerrera": {
      text: "While a damaged friendly ship at range 0-3 performs an attack, it may reroll 1 attack die."
    },
    "Scarif Base Pilot": {
      text: "ADAPTIVE AILERONS: Before you reveal your dial, if you are not stressed, you MUST execute a white (1 %BANKLEFT%), (1 %STRAIGHT%) or (1 %BANKRIGHT%)"
    },
    "Scimitar Squadron Pilot": {
      text: "NIMBLE BOMBER: If you would drop a device using a %STRAIGHT% template, you may use %BANKLEFT% a or %BANKRIGHT% template of the same speed instead."
    },
    '"Scourge" Skutu': {
      text: "While you perform an attack against a defender in your %BULLSEYEARC%, roll 1 additional attack die."
    },
    "Serissu": {
      text: "While a friendly ship at range 0-1 defends, it may reroll 1 of its dice. %LINEBREAK% WEAPON HARDPOINT: You can equip 1 %CANNON%, %TORPEDO% or %MISSILE% upgrade."
    },
    "Seventh Sister": {
      text: "While you perform a primary attack, before the Neutralize Results step, you may spend 2 %FORCE% to cancel 1 %EVADE% result."
    },
    "Seyn Marana": {
      text: "While you perform an attack, you may spend 1 %CRIT% result. If you do, deal 1 facedown damage card to the defender, then cancel you remaining results."
    },
    "Shadowport Hunter": {
      text: "Crime syndicates augment the lethal skills of their loyal contractors with the best technology available, like the fast and formidable Lancer-class pursuit craft."
    },
    "Shara Bey": {
      text: "While you defend or perform a primary attack, you may spend 1 lock you have on the enemy ship to add 1 %FOCUS% result to your dice results."
    },
    "Sienar Specialist": {
      text: " "
    },
    "Sigma Squadron Ace": {
      text: "STYGUM ARRAY: After you decloak, you may perform an %EVADE% action. At the Start of the End Phase, you may spend 1 evade token to gain one cloak token."
    },
    "Skull Squadron Pilot": {
      text: "CONCORDIA FACEOFF: While you defend, if the attack range is 1 and you are in the attackers %FRONTARC%, change 1 result to an %EVADE% result."
    },
    "Sol Sixxa": {
      text: "If you would drop a device using a [1 %STRAIGHT%] template, you may drop it using any other speed 1 template instead."
    },
    "Soontir Fel": {
      text: "At the start of the Engagement Phase, if there is an enemy ship in your %BULLSEYEARC%, gain 1 focus token. %LINEBREAK% AUTOTHRUSTERS: After you perform an action. you may perform a red %BARRELROLL% or a red %BOOST% action."
    },
    "Spice Runner": {
      text: " "
    },
    "Storm Squadron Ace": {
      text: "ADVANCED TARGETING COMPUTER: While you perform a primary attack against a defender you have locked, roll 1 additional attack die and change 1 %HIT% result to a %CRIT% result."
    },
    "Sunny Bounder": {
      text: "While you defend or perform an attack, after you roll or reroll your dice, if you have the same result on each of your dice, you may add 1 matching result. %LINEBREAK% WEAPON HARDPOINT: You can equip 1 %CANNON%, %TORPEDO% or %MISSILE% upgrade."
    },
    "Tala Squadron Pilot": {
      text: " "
    },
    "Talonbane Cobra": {
      text: "While you defend at attack range 3 or perform an attack at range 1, roll 1 additional die."
    },
    "Tansarii Point Veteran": {
      text: "WEAPON HARDPOINT: You can equip 1 %CANNON%, %TORPEDO% or %MISSILE% upgrade."
    },
    "Tel Trevura": {
      text: "If you would be destroyed, you may spend 1 %CHARGE%. If you do, discard all of your damage cards, suffer 5 %HIT% damage, and place yourself in reserves instead. At the start of the next planning phase, place yourself within range 1 of your player edge."
    },
    "Tempest Squadron Pilot": {
      text: "ADVANCED TARGETING COMPUTER: While you perform a primary attack against a defender you have locked, roll 1 additional attack die and change 1 %HIT% result to a %CRIT% result."
    },
    "Ten Numb": {
      text: "While you defend or perform an attack, you may spend 1 stress token to change all of your %FOCUS% results to %EVADE% or %HIT% results."
    },
    "Thane Kyrell": {
      text: "While you perform an attack, you may spend 1 %FOCUS%, %HIT%, or %CRIT% result to look at the defender's facedown damage cards, choose 1, and expose it."
    },
    "Tomax Bren": {
      text: "After you perform a %RELOAD% action, you may recover 1 %CHARGE% token on 1 of your equipped %TALENT% upgrade cards. %LINEBREAK% NIMBLE BOMBER: If you would drop a device using a %STRAIGHT% template, you may use %BANKLEFT% a or %BANKRIGHT% tempate of the same speed instead."
    },
    "Torani Kulda": {
      text: "After you perform an attack, each enemy ship in your %BULLSEYEARC% suffers 1 %HIT% damage unless it removes 1 green token. %LINEBREAK% DEAD TO RIGHTS: While you perform an attack, if the defender is in your %BULLSEYEARC%, defense dice cannot be modified using green tokens."
    },
    "Torkil Mux": {
      text: "At the start of the Engagement Phase, you may choose 1 ship in your firing arc. If you do, that ship engages at initiative 0 instead of its normal initiative value this round."
    },
    "Trandoshan Slaver": {
      text: " "
    },
    "Turr Phennir": {
      text: "After you perform an attack, you may perform a %BARRELROLL% or %BOOST% action, even if you are stressed. %LINEBREAK% AUTOTHRUSTERS: After you perform an action. you may perform a red %BARRELROLL% or a red %BOOST% action."
    },
    "Unkar Plutt": {
      text: "At the start of the Engagement Phase, if there are one or more other ships at range 0, you and each other ship at range 0 gain 1 tractor token. %LINEBREAK% SPACETUG TRACTOR ARRAY: ACTION: Choose a ship in your %FRONTARC% at range 1. That ship gains one tractor token, or 2 tractor tokens if it is in your %BULLSEYEARC% at range 1"
    },
    "Valen Rudor": {
      text: "After a friendly ship at range 0-1 defends (after damage is resolved, if any), you may perform an action."
    },
    "Ved Foslo": {
      text: "While you execute a maneuver, you may execute a maneuver of the same bearing and difficulty of a speed 1 higher or lower instead. %LINEBREAK% ADVANCED TARGETING COMPUTER: While you perform a primary attack against a defender you have locked, roll 1 additional attack die and change 1 %HIT% result to a %CRIT% result."
    },
    "Viktor Hel": {
      text: "After you defend, if you did not roll exactly 2 defense dice, the attack gains 1 stress token."
    },
    '"Vizier"': {
      text: "After you fully execute a speed 1 maneuver using your Adaptive Ailerons ship ability, you may perform a %COORDINATE% action. If you do, skip your Perform Action step. %LINEBREAK% ADAPTIVE AILERONS: Before you reveal your dial, if you are not stressed, you MUST execute a white (1 %BANKLEFT%), (1 %STRAIGHT%) or (1 %BANKRIGHT%)"
    },
    '"Wampa"': {
      text: "While you perform an attack, you may spend 1 %CHARGE% to roll 1 additional attack die. After defending, lose 1 %CHARGE%."
    },
    "Warden Squadron Pilot": {
      text: " "
    },
    "Wedge Antilles": {
      text: "While you perform an attack, the defender rolls 1 fewer defense die."
    },
    '"Whisper"': {
      text: "After you perform an attack that hits, gain 1 evade token. STYGUM ARRAY: After you decloak, you may perform an %EVADE% action. At the Start of the End Phase, you may spend 1 evade token to gain one cloak token."
    },
    "Wild Space Fringer": {
      text: "SENSOR BLINDSPOT: While you perform a primary attack at range 0-1, do not apply the range 0-1 bonus and roll 1 fewer attack die."
    },
    "Wullffwarro": {
      text: "While you perform a primary attack, if you are damaged, you may roll 1 additional attack die."
    },
    "Zealous Recruit": {
      text: "CONCORDIA FACEOFF: While you defend, if the attack range is 1 and you are in the attackers %FRONTARC%, change 1 result to an %EVADE% result"
    },
    '"Zeb" Orrelios': {
      text: "While you defend, %CRIT% results are neutralized before %HIT% results. %LINEBREAK% LOCKED AND LOADED: While you are docked, after your carrier ship performs a primary %FRONTARC% or %TURRET% attack, it may perform a bonus %REARARC% attack"
    },
    '"Zeb" Orrelios (Sheathipede)': {
      text: "While you defend, %CRIT% results are neutralized before %HIT% results. %LINEBREAK% COMMS SHUTTLE: While you are docked, your carrier ship gains %COORDINATE%. Before your carrier shpi activates, it may perform a %COORDINATE% action."
    },
    '"Zeb" Orrelios (TIE Fighter)': {
      text: "While you defend, %CRIT% results are neutralized before %HIT% results."
    },
    "Zertik Strom": {
      text: "During the End Phase, you may spend a lock you have on an enemy ship to expose 1 of that ship's damage cards. %LINEBREAK% ADVANCED TARGETING COMPUTER: While you perform a primary attack against a defender you have locked, roll 1 additional attack die and change 1 %HIT% result to a %CRIT% result."
    },
    "Zuckuss": {
      text: "While you perform a primary attack, you may roll 1 additional attack die. If you do, the defender rolls 1 additional defense die."
    },
    "Poe Dameron": {
      text: "After you perform an action, you may spend 1 %CHARGE% to perform a white action, treating it as red. %LINEBREAK% WEAPON HARDPOINT: You can equip 1 %CANNON%, %TORPEDO% or %MISSILE% upgrade."
    },
    "Lieutenant Bastian": {
      text: "After a ship at range 1-2 is dealt a damage card, you may acquire a lock on that ship. %LINEBREAK% WEAPON HARDPOINT: You can equip 1 %CANNON%, %TORPEDO% or %MISSILE% upgrade."
    },
    '"Midnight"': {
      text: "While you defend or perform an attack, if you have a lock on the enemy ship, that ship's dice cannot be modified."
    },
    '"Longshot"': {
      text: "While you perform a primary attack at attack range 3, roll 1 additional attack die."
    },
    '"Muse"': {
      text: "At the start of the Engagement Phase, you may choose a friendly ship at range 0-1. If you do, that ship removes 1 stress token."
    },
    "Kylo Ren": {
      text: " After you defend, you may spend 1 %FORCE% to assign the I'll Show You the Dark Side condition to the attacker. %LINEBREAK% AUTOTHRUSTERS: After you perform an action. you may perform a red %BARRELROLL% or a red %BOOST% action."
    },
    '"Blackout"': {
      text: " ??? %LINEBREAK% AUTOTHRUSTERS: After you perform an action. you may perform a red %BARRELROLL% or a red %BOOST% action."
    },
    "Lieutenant Dormitz": {
      text: " ... are placed, other ... be placed anywhere in ... range 0-2 of you. %LINEBREAK% ... : while you perform a %CANNON% ... additional die. "
    },
    "Tallissan Lintra": {
      text: "While an enemy ship in your %BULLSEYEARC% performs an attack, you may spend 1 %CHARGE%.  If you do, the defender rolls 1 additional die."
    },
    "Lulo Lampar": {
      text: "While you defend or perform a primary attack, if you are stressed, you must roll 1 fewer defense die or 1 additional attack die."
    },
    '"Backdraft"': {
      text: " ... perform a %TURRET% primary ... defender is in your %BACKARC% ... additional dice. %LINEBREAK% ... TURRET: You can... indicator only to your ... must treat the %FRONTARC% ... your equipped %MISSILE% ... as %TURRET%. "
    },
    '"Quickdraw"': {
      text: " ??? %LINEBREAK% ... TURRET: You can... indicator only to your ... must treat the %FRONTARC% ... your equipped %MISSILE% ... as %TURRET%. "
    },
    "Rey": {
      text: " ... perform an attack, ... in your %FRONTARC%, you may ... change 1 of your blank ... or %HIT% result. "
    },
    "Han Solo (Resistance)": {
      text: " ??? "
    },
    "Chewbacca (Resistance)": {
      text: " ??? "
    },
    "Captain Seevor": {
      text: " While you defend or perform an attack, before the attack dice are rolled, if you are not in the enemy ship's %BULLSEYEARC%, you may spend 1 %CHARGE%. If you do, the enemy ship gains one jam token. "
    },
    "Mining Guild Surveyor": {
      text: " "
    },
    "Ahhav": {
      text: " ??? "
    },
    "Finch Dallow": {
      text: " ... drop a bomb, you ... play area touching ... instead. "
    }
  };
  upgrade_translations = {
    "0-0-0": {
      text: "<i>Requires: Scum or Darth Vader</i> %LINEBREAK% At the start of the Engagement Phase, you may choose 1 enemy ship at range 0-1. If you do, you gain 1 calculate token unless that ship chooses to gain 1 stress token."
    },
    "4-LOM": {
      text: "While you perform an attack, after rolling attack dice, you may name a type of green token. If you do, gain 2 ion tokens and, during this attack, the defender cannot spend tokens of the named type."
    },
    "Ablative Plating": {
      text: "<i>Requires: Medium or Large Base</i> %LINEBREAK% Before you would suffer damage from an obstacle or from a friendly bomb detonating, you may spend 1 %CHARGE%. If you do, prevent 1 damage."
    },
    "Admiral Sloane": {
      text: "After another friendly ship at range 0-3 defends, if it is destroyed, the attacker gains 2 stress tokens. While a friendly ship at range 0-3 performs an attack against a stressed ship, it may reroll 1 attack die."
    },
    "Adv. Proton Torpedoes": {
      text: "Attack (%LOCK%): Spend 1 %CHARGE%. Change 1 %HIT% result to a %CRIT% result."
    },
    "Advanced Sensors": {
      text: "After you reveal your dial, you may perform 1 action. If you do, you cannot perform another action during your activation."
    },
    "Advanced SLAM": {
      text: "<i>Requires: %SLAM%</i> %LINEBREAK% After you perform a %SLAM% action, if you fully executed that maneuver, you may perform a white action on your action bar, treating that action as red."
    },
    "Afterburners": {
      text: "<i>Requires: Small Base</i> %LINEBREAK% After you fully execute a speed 3-5 maneuver, you may spend 1 %CHARGE% to perform a %BOOST% action, even while stressed."
    },
    "Agent Kallus": {
      text: "Setup: Assign the Hunted condition to 1 enemy ship. While you perform an attack against th eship with the Hunted condition, you may change 1 of your %FOCUS% results to a %HIT% result."
    },
    "Agile Gunner": {
      text: "In the End Phase you may rotate your %SINGLETURRETARC% indicator"
    },
    "Andrasta": {
      text: "<i>Adds: %RELOAD%</i> %LINEBREAK% Add %DEVICE% slot."
    },
    "Barrage Rockets": {
      text: "Attack (%FOCUS%): Spend 1 %CHARGE%. If the defender is in your %BULLSEYEARC%, you may spend 1 or more %CHARGE% to reroll that many attack dice."
    },
    "Baze Malbus": {
      text: "While you perform a %FOCUS% action, you may treat it as red. If you do, gain 1 additional focus token for each enemy ship at range 0-1 to a maximum of 2."
    },
    "Bistan": {
      text: "After you perform a primary attack, if you are focused, you may perform a bonus %SINGLETURRETARC% attack against a ship you have not already attacked this round."
    },
    "Boba Fett": {
      text: "Setup: Start in reserve. At the end of Setup, place yourself at range 0 of an obstacle and beyond range 3 of an enemy ship."
    },
    "Bomblet Generator": {
      text: "Bomb During the System Phase, you may spend 1 %CHARGE% to drop a Bomblet with the [1 %STRAIGHT%] template. At the start of the Activation Phase, you may spend 1 shield to recover 2 %CHARGE%."
    },
    "Bossk": {
      text: "After you perform a primary attack that misses, if you are not stressed you must receive 1 stress token to perform a bonus primary attack against the same target."
    },
    "BT-1": {
      text: "<i>Requires: Scum or Darth Vader</i> %LINEBREAK% While you perform an attack, you may change 1 %HIT% result to a %CRIT% result for each stress token the defender has."
    },
    "C-3PO": {
      text: "<i>Adds: %CALCULATE%</i> %LINEBREAK% Before rolling defense dice, you may spend 1 calculate token to guess aloud a number 1 or higher. If you do, and you roll exactly that many %EVADE% results, add 1 %EVADE% result. After you perform the %CALCULATE% action, gain 1 calculate token."
    },
    "Cad Bane": {
      text: "After you drop or launch a device, you may perform a red %BOOST% action."
    },
    "Cassian Andor": {
      text: "During the System Phase, you may choose 1 enemy ship at range 1-2 and guess aloud a bearing and speed, then look at that ship's dial. If the chosen ship's bearing and speed match your guess, you may set your dial to another maneuver."
    },
    "Chewbacca": {
      text: "At the start of the Engagement Phase, you may spend 2 %CHARGE% to repair 1 faceup damage card."
    },
    "Chewbacca (Scum)": {
      text: "At the start of the End Phase, you may spend 1 focus token to repair 1 of your faceup damage cards."
    },
    '"Chopper" (Astromech)': {
      text: "Action: Spend 1 non-recurring %CHARGE% from another equipped upgrade to recover 1 shield. Action: Spend 2 shields to recover 1 non-recurring %CHARGE% on an equipped upgrade."
    },
    '"Chopper" (Crew)': {
      text: "During the Perform Action step, you may perform 1 action, even while stressed. After you perform an action while stressed, suffer 1 %HIT% damage unless you expose 1 of your damage cards."
    },
    "Ciena Ree": {
      text: "<i>Requires: %COORDINATE%</i> %LINEBREAK% After you perform a %COORDINATE% action, if the ship you coordinated performed a %BARRELROLL% or %BOOST% action, it may gain 1 stress token to rotate 90˚."
    },
    "Cikatro Vizago": {
      text: "During the End Phase, you may choose 2 %ILLICIT% upgrades equipped to friendly ships at range 0-1. If you do, you may exchange these upgrades. End of Game: Return all %ILLICIT% upgrades to their original ships."
    },
    "Cloaking Device": {
      text: "<i>Requires: Small or Medium Base</i> %LINEBREAK% Action: Spend 1 %CHARGE% to perform a %CLOAK% action. At the start of the Planning Phase, roll 1 attack die. On a %FOCUS% result, decloak or discard your cloak token."
    },
    "Cluster Missiles": {
      text: "Attack (%LOCK%): Spend 1 %CHARGE%. After this attack, you may perform this attack as a bonus attack against a different target at range 0-1 of the defender, ignoring the %LOCK% requirement."
    },
    "Collision Detector": {
      text: "While you boost or barrel roll, you can move through and overlap obstacles. After you move through or overlap an obstacle, you may spend 1 %CHARGE% to ignore its effects until the end of the round."
    },
    "Composure": {
      text: "<i>Requires: %FOCUS%</i> %LINEBREAK% If you fail an action and don't have any green tokens you may perform a %FOCUS% action."
    },
    "Concussion Missiles": {
      text: "Attack (%LOCK%): Spend 1 %CHARGE%. After this attack hits, each ship at range 0-1 of the defender exposes 1 of its damage cards."
    },
    "Conner Nets": {
      text: "Mine During the System Phase, you may spend 1 %CHARGE% to drop a Conner Net using the [1 %STRAIGHT%] template. This card's %CHARGE% cannot be recovered."
    },
    "Contraband Cybernetics": {
      text: "Before you activate, you may spend 1 %CHARGE%. If you do, until the end of the round, you can perform actions and execute red maneuvers, even while stressed."
    },
    "Crack Shot": {
      text: "While you perform a primary attack, if the defender is in your %BULLSEYEARC%, before the Neutralize Results step, you may spend 1 %CHARGE% to cancel 1 %EVADE% result."
    },
    "Daredevil": {
      text: "<i>Requires: White %BOOST% and Small Base</i> %LINEBREAK% While you perform a white %BOOST% action, you may treat it as red to use the [1%TURNLEFT%] or [1 %TURNRIGHT%] template instead."
    },
    "Darth Vader": {
      text: "At the start of the Engagement Phase, you may choose 1 ship in your firing arc at range 0-2 and spend 1 %FORCE%. If you do, that ship suffers 1 %HIT% damage unless it chooses to remove 1 green token."
    },
    "Dauntless": {
      text: "After you partially execute a maneuver, you may perform 1 white action, treating that action as red."
    },
    "Deadman's Switch": {
      text: "After you are destroyed, each other ship at range 0-1 suffers 1 %HIT% damage."
    },
    "Death Troopers": {
      text: "During the Activation Phase, enemy ships at range 0-1 cannot remove stress tokens."
    },
    "Debris Gambit": {
      text: "<i>Requires: Small or Medium Base. Adds: <r>%EVADE%</r></i> %LINEBREAK% While you perform a red %EVADE% action, if there is an obstacle at range 0-1, treat the action as white instead."
    },
    "Dengar": {
      text: "After you defend, if the attacker is in your firing arc, you may spend 1 %CHARGE%. If you do, roll 1 attack die unless the attacker chooses to remove 1 green token. On a %HIT% or %CRIT% result, the attacker suffers 1 %HIT% damage."
    },
    "Director Krennic": {
      text: "<i>Adds: %LOCK%</i> %LINEBREAK% Setup: Before placing forces, assign the Optimized Prototype condition to another friendly ship."
    },
    "Dorsal Turret": {
      text: "<i>Adds: %ROTATEARC%</i> %LINEBREAK%"
    },
    "Electronic Baffle": {
      text: "During the End Phase, you may suffer 1 %HIT% damage to remove 1 red token."
    },
    "Elusive": {
      text: "<i>Requires: Small or Medium Base</i> %LINEBREAK% While you defend, you may spend 1 %CHARGE% to reroll 1 defense die. After you fully execute a red maneuver, recover 1 %CHARGE%."
    },
    "Emperor Palpatine": {
      text: "While another friendly ship defends or performs an attack, you may spend 1 %FORCE% to modify 1 of its dice as though that ship had spent 1 %FORCE%."
    },
    "Engine Upgrade": {
      text: "<i>Requires: <r>%BOOST%</r>. Adds: %BOOST% %LINEBREAK% This upgrade has a variable cost, worth 3, 6, or 9 points depending on if the ship base is small, medium or large respectively.</i>"
    },
    "Expert Handling": {
      text: "<i>Requires: <r>%BARRELROLL%</r>. Adds: %BARRELROLL% %LINEBREAK% This upgrade has a variable cost, worth 2, 4, or 6 points depending on if the ship base is small, medium or large respectively.</i>"
    },
    "Ezra Bridger": {
      text: "After you perform a primary attack, you may spend 1 %FORCE% to perform a bonus %SINGLETURRETARC% attack from a %SINGLETURRETARC% you have not attacked from this round. If you do and you are stressed, you may reroll 1 attack die."
    },
    "Fearless": {
      text: "While you perform a %FRONTARC% primary attack, if the attack range is 1 and you are in the defender's %FRONTARC%, you may change 1 of your results to a %HIT% result."
    },
    "Feedback Array": {
      text: "Before you engage, you may gain 1 ion token and 1 disarm token. If you do, each ship at range 0 suffers 1 %HIT% damage."
    },
    "Fifth Brother": {
      text: "While you perform an attack, you may spend 1 %FORCE% to change 1 of your %FOCUS% results to a %CRIT% result."
    },
    "Fire-Control System": {
      text: "While you perform an attack, if you have a lock on the defender, you may reroll 1 attack die. If you do, you cannot spend your lock during this attack."
    },
    "Freelance Slicer": {
      text: "While you defend, before attack dice are rolled, you may spend a lock you have on the attacker to roll 1 attack die. If you do, the attacker gains 1 %JAM% token. Then, on a %HIT% or %CRIT% result, gain 1 %JAM% token."
    },
    '"Genius"': {
      text: "After you fully execute a maneuver, if you have not dropped or launched a device this round, you may drop 1 bomb."
    },
    "Ghost": {
      text: "You can dock 1 attack shuttle or Sheathipede-Class shuttle. Your docked ships can deploy only from your rear guides."
    },
    "Grand Inquisitor": {
      text: "After an enemy ship at range 0-2 reveals its dial, you may spend 1 %FORCE% to perform 1 white action on your action bar, treating that action as red."
    },
    "Grand Moff Tarkin": {
      text: "<i>Requires: %LOCK%</i> %LINEBREAK% During the System Phase, you may spend 2 %CHARGE%. If you do, each friendly ship may acquire a lock on a ship that you have locked."
    },
    "Greedo": {
      text: "While you perform an attack, you may spend 1 %CHARGE% to change 1 %HIT% result to a %CRIT% result. While you defend, if your %CHARGE% is active, the attacker may change 1 %HIT% result to a %CRIT% result."
    },
    "Han Solo": {
      text: "During the Engagement Phase, at initiative 7, you may perform a %SINGLETURRETARC% attack. You cannot attack from that %SINGLETURRETARC% again this round."
    },
    "Han Solo (Scum)": {
      text: "Before you engage, you may perform a red %FOCUS% action."
    },
    "Havoc": {
      text: "Remove %CREW% slot. Add %SENSOR% and %ASTROMECH% slots."
    },
    "Heavy Laser Cannon": {
      text: "Attack: After the Modify Attack Dice step, change all %CRIT% results to %HIT% results."
    },
    "Heightened Perception": {
      text: "At the start of the Engagement Phase, you may spend 1 %FORCE%. If you do, engage at initiative 7 instead of your standard initiative value this phase."
    },
    "Hera Syndulla": {
      text: "You can execute red maneuvers even while stressed. After you fully execute a red maneuver, if you have 3 or more stress tokens, remove 1 stress token and suffer 1 %HIT% damage."
    },
    "Homing Missiles": {
      text: "Attack (%LOCK%): Spend 1 %CHARGE%. After you declare the defender, the defender may choose to suffer 1 %HIT% damage. If it does, skip the Attack and Defense Dice steps and the attack is treated as hitting."
    },
    "Hotshot Gunner": {
      text: "While you perform a %SINGLETURRETARC% attack, after the Modify Defense Dice step, the defender removes 1 focus or calculate token."
    },
    "Hound's Tooth": {
      text: "1 Z-95 AF4 headhunter can dock with you."
    },
    "Hull Upgrade": {
      text: "Add 1 Hull Point %LINEBREAK%<i>This upgrade has a variable cost, worth 2, 3, 5, or 7 points depending on if the ship agility is 0, 1, 2, or 3 respectively.</i>"
    },
    "IG-2000": {
      text: "You have the pilot ability of each other friendly ship with the IG-2000 upgrade."
    },
    "IG-88D": {
      text: "<i>Adds: %CALCULATE%</i> %LINEBREAK% You have the pilot ability of each other friendly ship with the IG-2000 upgrade. After you perform a %CALCULATE% action, gain 1 calculate token. ADVANCED DROID BRAIN: After you perform a %CALCULATE% action, gain 1 calculate token."
    },
    "Inertial Dampeners": {
      text: "Before you would execute a maneuver, you may spend 1 shield. If you do, execute a white [0 %STOP%] instead of the maneuver you revealed, then gain 1 stress token."
    },
    "Informant": {
      text: "Setup: After placing forces, choose 1 enemy ship and assign the Listening Device condition to it."
    },
    "Instinctive Aim": {
      text: "While you perform a special attack, you may spend 1 %FORCE% to ignore the %FOCUS% or %LOCK% requirement."
    },
    "Intimidation": {
      text: "While an enemy ship at range 0 defends, it rolls 1 fewer defense die."
    },
    "Ion Cannon Turret": {
      text: "<i>Adds: %ROTATEARC%</i> %LINEBREAK% Attack: If this attack hits, spend 1 %HIT% or %CRIT% result to cause the defender to suffer 1 %HIT% damage. All remaining %HIT%/%CRIT% results inflict ion tokens instead of damage."
    },
    "Ion Cannon": {
      text: "Attack: If this attack hits, spend 1 %HIT% or %CRIT% result to cause the defender to suffer 1 %HIT% damage. All remaining %HIT%/%CRIT% results inflict ion tokens instead of damage."
    },
    "Ion Missiles": {
      text: "Attack (%LOCK%): Spend 1 %CHARGE%. If this attack hits, spend 1 %HIT% or %CRIT% result to cause the defender to suffer 1 %HIT% damage. All remaining %HIT%/%CRIT% results inflict ion tokens instead of damage."
    },
    "Ion Torpedoes": {
      text: "Attack (%LOCK%): Spend 1 %CHARGE%. If this attack hits, spend 1 %HIT% or %CRIT% result to cause the defender to suffer 1 %HIT% damage. All remaining %HIT%/%CRIT% results inflict ion tokens instead of damage."
    },
    "ISB Slicer": {
      text: "During the End Phase, enemy ships at range 1-2 cannot remove jam tokens."
    },
    "Jabba the Hutt": {
      text: "During the End Phase, you may choose 1 friendly ship at range 0-2 and spend 1 %CHARGE%. If you do, that ship recovers 1 %CHARGE% on 1 of its equipped %ILLICIT% upgrades."
    },
    "Jamming Beam": {
      text: "Attack: If this attack hits, all %HIT%/%CRIT% results inflict jam tokens instead of damage."
    },
    "Juke": {
      text: "<i>Requires: Small or Medium Base</i> %LINEBREAK% While you perform an attack, if you are evading, you may change 1 of the defender's %EVADE% results to a %FOCUS% result."
    },
    "Jyn Erso": {
      text: "If a friendly ship at range 0-3 would gain a focus token, it may gain 1 evade token instead."
    },
    "Kanan Jarrus": {
      text: "After a friendly ship at range 0-2 fully executes a white maneuver, you may spend 1 %FORCE% to remove 1 stress token from that ship."
    },
    "Ketsu Onyo": {
      text: "At the start of the End Phase, you may choose 1 enemy ship at range 0-2 in your firing arc. If you do, that ship does not remove its tractor tokens."
    },
    "L3-37": {
      text: "<b>L3-37:</b> Setup: Equip this side faceup. %LINEBREAK% While you defend, you may flip this card. If you do, the attack must reroll all attack dice %LINEBREAK% <b>L3-37's Programming:</b> If you are not shielded, decrease the difficulty of your bank (%BANKLEFT% and %BANKRIGHT%) maneuvers."
    },
    "Lando Calrissian": {
      text: "Action: Roll 2 defense dice. For each %FOCUS% result, gain 1 focus token. For each %EVADE% result, gain 1 evade token. If both results are blank, the opposing player chooses focus or evade. You gain 1 token of that type."
    },
    "Lando Calrissian (Scum)": {
      text: "After you roll dice, you may spend 1 green token to reroll up to 2 of your results."
    },
    "Lando's Millennium Falcon": {
      text: "1 Escape Craft may dock with you. While you have an Escape Craft docked, you may spend its shields as if they were on your ship card. While you perform a primary attack against a stressed ship, roll 1 additional attack die."
    },
    "Latts Razzi": {
      text: "While you defend, if the attacker is stressed, you may remove 1 stress from the attacker to change 1 of your blank/%FOCUS% results to an %EVADE% result."
    },
    "Leia Organa": {
      text: "At the start of the Activation Phase, you may spend 3 %CHARGE%. During this phase, each friendly ship reduces the difficulty of its red maneuvers."
    },
    "Lone Wolf": {
      text: "While you defend or perform an attack, if there are no other friendly ships at range 0-2, you may spend 1 %CHARGE% to reroll 1 of your dice."
    },
    "Luke Skywalker": {
      text: "At the start of the Engagement Phase, you may spend 1 %FORCE% to rotate your %SINGLETURRETARC% indicator."
    },
    "Magva Yarro": {
      text: "After you defend, if the attack hit, you may acquire a lock on the attacker."
    },
    "Marauder": {
      text: "While you perform a primary %REARARC% attack, you may reroll 1 attack die. Add %GUNNER% slot."
    },
    "Marksmanship": {
      text: "While you perform an attack, if the defender is in your %BULLSEYEARC%, you may change 1 %HIT% result to a %CRIT% result."
    },
    "Maul": {
      text: "<i>Requires: Scum or Ezra Bridger</i> %LINEBREAK% After you suffer damage, you may gain 1 stress token to recover 1 %FORCE%. You can equip \"Dark Side\" upgrades."
    },
    "Millennium Falcon": {
      text: "<i>Adds: %EVADE%</i> %LINEBREAK% While you defend, if you are evading, you may reroll 1 defense die."
    },
    "Minister Tua": {
      text: "At the start of the Engagement Phase, if you are damaged, you may perform a red %REINFORCE% action."
    },
    "Mist Hunter": {
      text: "<i>Adds: %BARRELROLL% </i> %LINEBREAK% Add %CANNON% slot."
    },
    "Moff Jerjerrod": {
      text: "<i>Requires: %COORDINATE%</i> %LINEBREAK% During the System Phase, you may spend 2 %CHARGE%. If you do, choose the (1 %BANKLEFT%), (1 %STRAIGHT%), or (1 %BANKRIGHT%) template. Each friendly ship may perform a red %BOOST% action using that template."
    },
    "Moldy Crow": {
      text: "Gain a %FRONTARC% primary weapon with a value of \"3.\" During the End Phase, do not remove up to 2 focus tokens."
    },
    "Munitions Failsafe": {
      text: "While you perform a %TORPEDO% or %MISSILE% attack, after rolling attack dice, you may cancel all dice results to recover 1 %CHARGE% you spent as a cost for the attack."
    },
    "Nien Nunb": {
      text: "Decrease the difficulty of your bank maneuvers [%BANKLEFT% and %BANKRIGHT%]."
    },
    "Novice Technician": {
      text: "At the end of the round, you may roll 1 attack die to repair 1 faceup damage card. Then, on a %HIT% result, expose 1 damage card."
    },
    "Os-1 Arsenal Loadout": {
      text: "While you have exactly 1 disarm token, you can still perform %TORPEDO% and %MISSILE% attacks against targets you have locked. If you do, you cannot spend you lock during the attack. Add %TORPEDO% and %MISSILE% slots."
    },
    "Outmaneuver": {
      text: "While you perform a %FRONTARC% attack, if you are not in the defender's firing arc, the defender rolls 1 fewer defense die."
    },
    "Outrider": {
      text: "While you perform an attack that is obstructed by an obstacle, the defender rolls 1 fewer defense die. After you fully execute a maneuver, if you moved through or overlapped an obstacle, you may remove 1 of your red or orange tokens."
    },
    "Perceptive Copilot": {
      text: "After you perform a %FOCUS% action, gain 1 focus token."
    },
    "Phantom": {
      text: "You can dock at range 0-1."
    },
    "Pivot Wing": {
      text: "<b>Closed:</b> While you defend, roll 1 fewer defense die. After you execute a [0 %STOP%] maneuver, you may rotate your ship 90˚ or 180˚. Before you activate, you may flip this card %LINEBREAK% <b>Open:</b> Before you activate, you may flip this card"
    },
    "Predator": {
      text: "While you perform a primary attack, if the defender is in your %BULLSEYEARC%, you may reroll 1 attack die."
    },
    "Proton Bombs": {
      text: "Bomb During the System Phase, you may spend 1 %CHARGE% to drop a Proton Bomb using the [1 %STRAIGHT%] template."
    },
    "Proton Rockets": {
      text: "Attack (%FOCUS%): Spend 1 %CHARGE%."
    },
    "Proton Torpedoes": {
      text: "Attack (%LOCK%): Spend 1 %CHARGE%. Change 1 %HIT% result to a %CRIT% result."
    },
    "Proximity Mines": {
      text: "Mine During the System Phase, you may spend 1 %CHARGE% to drop a Proximity Mine using the [1 %STRAIGHT%] template. This card's %CHARGE% cannot be recovered."
    },
    "Punishing One": {
      text: "When you perform a primary attack, if the defender is in your %FRONTARC%, roll 1 additional attack die. Remove %CREW% slot. Add %ASTROMECH% slot."
    },
    "Qi'ra": {
      text: "While you move and perform attacks, you ignore all obstacles that you are locking."
    },
    "R2 Astromech": {
      text: "After you reveal your dial, you may spend 1 %CHARGE% and gain 1 disarm token to recover 1 shield."
    },
    "R2-D2": {
      text: "After you reveal your dial, you may spend 1 %CHARGE% and gain 1 disarm token to recover 1 shield."
    },
    "R2-D2 (Crew)": {
      text: "During the End Phase, if you are damaged and not shielded, you may roll 1 attack die to recover 1 shield. On a %HIT% result, expose 1 of your damage cards."
    },
    "R3 Astromech": {
      text: "You can maintain up to 2 locks. Each lock must be on a different object. After you perform a %LOCK% action, you may acquire a lock."
    },
    "R4 Astromech": {
      text: "<i>Requires: Small Base</i> %LINEBREAK% Decrease the difficulty of your speed 1-2 basic maneuvers (%TURNLEFT%, %BANKLEFT%, %STRAIGHT%, %BANKRIGHT%, %TURNRIGHT%)."
    },
    "R5 Astromech": {
      text: "Action: Spend 1 %CHARGE% to repair 1 facedown damage card. Action: Repair 1 faceup Ship damage card."
    },
    "R5-D8": {
      text: "Action: Spend 1 %CHARGE% to repair 1 facedown damage card. Action: Repair 1 faceup Ship damage card."
    },
    "R5-P8": {
      text: "While you perform an attack against a defender in your %FRONTARC%, you may spend 1 %CHARGE% to reroll 1 attack die. If the rerolled results is a %CRIT%, suffer 1 %CRIT% damage."
    },
    "R5-TK": {
      text: "You can perform attacks against friendly ships."
    },
    "Rigged Cargo Chute": {
      text: "<i>Requires: Medium or Large Base</i> %LINEBREAK% Action: Spend 1 %CHARGE%. Drop 1 loose cargo using the [1 %STRAIGHT%] template."
    },
    "Ruthless": {
      text: "While you perform an attack, you may choose another friendly ship at range 0-1 of the defender. If you do, that ship suffers 1 %HIT% damage and you may change 1 of your die results to a %HIT% result."
    },
    "Sabine Wren": {
      text: "Setup: Place 1 ion, 1 jam, 1 stress, and 1 tractor token on this card. After a ship suffers the effect of a friendly bomb, you may remove 1 ion, jam, stress, or tractor token from this card. If you do, that ship gains a matching token."
    },
    "Saturation Salvo": {
      text: "<i>Requires: %RELOAD%</i> %LINEBREAK% While you perform a %TORPEDO% or %MISSILE% attack, you may spend 1 charge from that upgrade. If you do, choose two defense dice. The defender must reroll those dice."
    },
    "Saw Gerrera": {
      text: "While you perform an attack, you may suffer 1 %HIT% damage to change all of your %FOCUS% results to %CRIT% results."
    },
    "Seasoned Navigator": {
      text: "After you reveal your dial, you may set your dial to another non-red maneuver of the same speed. While you execute that maneuver, increase its difficulty."
    },
    "Seismic Charges": {
      text: "Bomb During the System Phase, you may spend 1 %CHARGE% to drop a Seismic Charge with the [1 %STRAIGHT%] template."
    },
    "Selfless": {
      text: "Whlie another friendly ship at range 0-1 defends, before the Neutralize Results step, if you are in the attack arc, you may suffer 1 %CRIT% damage to cancel 1 %CRIT% result."
    },
    "Sense": {
      text: "During the System Phase, you may choose 1 ship at range 0-1 and look at its dial. If you spend 1 %FORCE%, you may choose a ship at range 0-3 instead."
    },
    "Servomotor S-Foils": {
      text: "<b>Closed:</b> While you perform a primary attack, roll 1 fewer attack die. Before you activate, you may flip this card %LINEBREAK% <i>Adds: %BOOST%, %FOCUS% > <r>%BOOST%</r></i> %LINEBREAK% <b>Open:</b> Before you activate, you may flip this card"
    },
    "Seventh Sister": {
      text: "If an enemy ship at range 0-1 would gain a stress token, you may spend 1 %FORCE% to have it gain 1 jam or tractor token instead."
    },
    "Shadow Caster": {
      text: "After you perform an attack that hits, if the defender is in your %SINGLETURRETARC% and your %FRONTARC%, the defender gains 1 tractor token."
    },
    "Shield Upgrade": {
      text: "Add 1 Shield Point %LINEBREAK%<i>This upgrade has a variable cost, worth 3, 4, 6, or 8 points depending on if the ship agility is 0, 1, 2, or 3 respectively.</i>"
    },
    "Skilled Bombardier": {
      text: "If you would drop or launch a device, you may use a template of the same bearing with a speed 1 higher or lower."
    },
    "Slave I": {
      text: "After you reveal a turn, (%TURNLEFT% or %TURNRIGHT%) or bank (%BANKLEFT% or %BANKRIGHT%) maneuver you may set your dial to the maneuver of the same speed and bearing in the other direction. Add %TORPEDO% slot."
    },
    "Squad Leader": {
      text: "<i>Adds: <r>%COORDINATE%</r></i> %LINEBREAK% While you coordinate, the ship you choose can perform an action only if that action is also on your action bar."
    },
    "ST-321": {
      text: "After you perform a %COORDINATE% action, you may choose an enemy ship at range 0-3 of the ship you coordinated. If you do, acquire a lock on that enemy ship, ignoring range restrictions."
    },
    "Static Discharge Vanes": {
      text: "Before you would gain 1 ion or jam token, if you are not stressed, you may choose another ship at range 0–1 and gain 1 stress token. If you do, the chosen ship gains that ion or jam token instead."
    },
    "Stealth Device": {
      text: "While you defend, if your %CHARGE% is active, roll 1 additional defense die. After you suffer damage, lost 1 %CHARGE%. %LINEBREAK%<i>This upgrade has a variable cost, worth 3, 4, 6, or 8 points depending on if the ship agility is 0, 1, 2, or 3 respectively.</i>"
    },
    "Supernatural Reflexes": {
      text: "<i>Requires: Small Base</i> %LINEBREAK% Before you activate, you may spend 1 %FORCE% to perform a %BARRELROLL% or %BOOST% action. Then, if you performed an action you do not have on your action bar, suffer 1 %HIT% damage."
    },
    "Swarm Tactics": {
      text: "At the start of the Engagement Phase, you may choose 1 friendly ship at range 1. If you do, that ship treats its initiative as equal to yours until the end of the round."
    },
    "Tactical Officer": {
      text: "<i>Requires: <r>%COORDINATE%</r>. Adds: %COORDINATE%</i>"
    },
    "Tactical Scrambler": {
      text: "<i>Requires: Medium or Large Base</i> %LINEBREAK% While you obstruct an enemy ship's attack, the defender rolls 1 additional defense die."
    },
    "Tobias Beckett": {
      text: "Setup: After placing forces, you may choose 1 obstacle in the play area. If you do, place it anywhere in the play area beyond range 2 of any board edge or ship and beyond range 1 of other obstacles."
    },
    "Tractor Beam": {
      text: "Attack: If this attack hits, all %HIT%/%CRIT% results inflict tractor tokens instead of damage."
    },
    "Trajectory Simulator": {
      text: "During the System Phase, if you would drop or launch a bomb, you may launch it using the (5 %STRAIGHT%) tempplate instead."
    },
    "Trick Shot": {
      text: "While you perform an attack that is obstructed by an obstacle, roll 1 additional attack die."
    },
    "Unkar Plutt": {
      text: "After you partially excute a maneuver, you may suffer 1 %HIT% damage to perform 1 white action."
    },
    "Veteran Tail Gunner": {
      text: "<i>Requires: %REARARC%</i> %LINEBREAK% After you perform a primary %FRONTARC% attack, you may perform a bonus primary %REARARC% attack."
    },
    "Veteran Turret Gunner": {
      text: "<i>Requires: %ROTATEARC%</i> %LINEBREAK% After you perform a primary attack, you may perform a bonus %SINGLETURRETARC% attack using a %SINGLETURRETARC% you did not already attack from this round."
    },
    "Virago": {
      text: "During the End Phase, you may spend 1 %CHARGE% to perform a red %BOOST% action. Adds %MODIFICATION% slot. Add 1 Shield Point. </i> %LINEBREAK% "
    },
    "Xg-1 Assault Configuration": {
      text: "While you have exactly 1 disarm token, you can still perform %CANNON% attacks. While you perform a %CANNON% attack while disarmed, roll a maximum of 3 attack dice. Add %CANNON% slot."
    },
    '"Zeb" Orrelios': {
      text: "You can perform primary attacks at range 0. Enemy ships at range 0 can perform primary attacks against you."
    },
    "Zuckuss": {
      text: "While you perform an attack, if you are not stressed, you may choose 1 defense die and gain 1 stress token. If you do, the defender must reroll that die."
    },
    'GNK "Gonk" Droid': {
      text: "Setup: Lose 1 %CHARGE%. Action: Recover 1 %CHARGE%. Action: Spend 1 %CHARGE% to recover 1 shield."
    },
    "Hardpoint: Cannon": {
      text: "Adds a %CANNON% slot"
    },
    "Hardpoint: Missile": {
      text: "Adds a %MISSILE% slot"
    },
    "Hardpoint: Torpedo": {
      text: "Adds a %TORPEDO% slot"
    },
    "Black One": {
      text: "<i>Adds: %SLAM%</i> %LINEBREAK% After you perform a %SLAM% action, lose 1 %CHARGE%. Then you may gain 1 ion token to remove 1 disarm token. %LINEBREAK% If your charge is inactive, you cannot perform the %SLAM% action."
    },
    "Heroic": {
      text: " While you defend or perform an attack, if you have only blank results and have 2 or more results, you may reroll any number of your dice. "
    },
    "Rose Tico": {
      text: " ??? "
    },
    "Finn": {
      text: " While you defend or perform a primary attack, if the enemy ship is in your %FRONTARC%, you may add 1 blank result to your roll ... can be rerolled or otherwise ...  "
    },
    "Integrated S-Foils": {
      text: "<b>Closed:</b> While you perform a primary attack, if the defender is not in your %BULLSEYEARC%, roll 1 fewer attack die. Before you activate, you may flip this card. %LINEBREAK% <i>Adds: %BARRELROLL%, %FOCUS% > <r>%BARRELROLL%</r></i> %LINEBREAK% <b>Open:</b> ???"
    },
    "Targeting Synchronizer": {
      text: "<i>Requires: %LOCK%</i> %LINEBREAK% While a friendly ship at range 1-2 performs an attack against a target you have locked, that ship ignores the %LOCK% attack requirement. "
    },
    "Primed Thrusters": {
      text: "<i>Requires: Small Base</i> %LINEBREAK% While you have 2 or fewer stress tokens, you can perform %BARRELROLL% and %BOOST% actions even while stressed. "
    },
    "Kylo Ren (Crew)": {
      text: " Action: Choose 1 enemy ship at range 1-3. If you do, spend 1 %FORCE% to assign the I'll Show You the Dark Side condition to that ship. "
    },
    "General Hux": {
      text: " ... perform a white %COORDINATE% action ... it as red. If you do, you ... up to 2 additional ships ... ship type, and each ship you coordinate must perform the same action, treating that action as red. "
    },
    "Fanatical": {
      text: " While you perform a primary attack, if you are not shielded, you may change 1 %FOCUS% result to a %HIT% result. "
    },
    "Special Forces Gunner": {
      text: " ... you perform a primary %FRONTARC% attack, ... your %SINGLETURRETARC% is in your %FRONTARC%, you may roll 1 additional attack die. After you perform a primary %FRONTARC% attack, ... your %TURRET% is in your %BACKARC%, you may perform a bonus primary %SINGLETURRETARC% attack. "
    },
    "Captain Phasma": {
      text: " ??? "
    },
    "Supreme Leader Snoke": {
      text: " ??? "
    },
    "Hyperspace Tracking Data": {
      text: " Setup: Before placing forces, you may ... 0 and 6 ... "
    },
    "Advanced Optics": {
      text: " While you perform an attack, you may spend 1 focus to change 1 of your blank results to a %HIT% result. "
    },
    "Rey (Gunner)": {
      text: " ... defend or ... If the ... in your %SINGLETURRETARC% ... 1 %FORCE% to ... 1 of your blank results to a %EVADE% or %HIT% result. "
    }
  };
  condition_translations = {
    'Suppressive Fire': {
      text: 'While you perform an attack against a ship other than <strong>Captain Rex</strong>, roll 1 fewer attack die. %LINEBREAK% After <strong>Captain Rex</strong> defends, remove this card.  %LINEBREAK% At the end of the Combat Phase, if <strong>Captain Rex</strong> did not perform an attack this phase, remove this card. %LINEBREAK% After <strong>Captain Rex</strong> is destroyed, remove this card.'
    },
    'Hunted': {
      text: 'After you are destroyed, you must choose another friendly ship and assign this condition to it, if able.'
    },
    'Listening Device': {
      text: 'During the System Phase, if an enemy ship with the <strong>Informant</strong> upgrade is at range 0-2, flip your dial faceup.'
    },
    'Optimized Prototype': {
      text: 'While you perform a %FRONTARC% primary attack against a ship locked by a friendly ship with the <strong>Director Krennic</strong> upgrade, you may spend 1 %HIT%/%CRIT%/%FOCUS% result. If you do, choose one: the defender loses 1 shield or the defender flips 1 of its facedown damage cards.'
    },
    'I\'ll Show You the Dark Side': {
      text: ' ??? '
    },
    'Proton Bomb': {
      text: '(Bomb Token) - At the end of the Activation Phase, this device detonates. When this device detonates, each ship at range 0–1 suffers 1 %CRIT% damage.'
    },
    'Seismic Charge': {
      text: '(Bomb Token) - At the end of the Activation Phase this device detonates. When this device detonates, choose 1 obstacle at range 0–1. Each ship at range 0–1 of the obstacle suffers 1 %HIT% damage. Then remove that obstacle. '
    },
    'Bomblet': {
      text: '(Bomb Token) - At the end of the Activation Phase this device detonates. When this device detonates, each ship at range 0–1 rolls 2 attack dice. Each ship suffers 1 %HIT% damage for each %HIT%/%CRIT% result.'
    },
    'Loose Cargo': {
      text: '(Debris Token) - Loose cargo is a debris cloud.'
    },
    'Conner Net': {
      text: '(Mine Token) - After a ship overlaps or moves through this device, it detonates. When this device detonates, the ship suffers 1 %HIT% damage and gains 3 ion tokens.'
    },
    'Proximity Mine': {
      text: '(Mine Token) - After a ship overlaps or moves through this device, it detonates. When this device detonates, that ship rolls 2 attack dice. That ship then suffers 1 %HIT% plus 1 %HIT%/%CRIT% damage for each matching result.'
    }
  };
  return modification_translations = title_translations = exportObj.setupCardData(basic_cards, pilot_translations, upgrade_translations, condition_translations, modification_translations, title_translations);
};


/*
    X-Wing Squad Builder 2.0
    Stephen Kim <raithos@gmail.com>
    https://raithos.github.io

    French translation by
    - Clément Bourgoin <c@iwzr.fr> https://github.com/iwazaru
 */

exportObj = typeof exports !== "undefined" && exports !== null ? exports : this;

if (exportObj.codeToLanguage == null) {
  exportObj.codeToLanguage = {};
}

exportObj.codeToLanguage.fr = 'Français';

if (exportObj.translations == null) {
  exportObj.translations = {};
}

exportObj.translations['Français'] = {
  action: {
    "Barrel Roll": '<i class="xwing-miniatures-font xwing-miniatures-font-barrelroll"></i>',
    "Boost": '<i class="xwing-miniatures-font xwing-miniatures-font-boost"></i>',
    "Evade": '<i class="xwing-miniatures-font xwing-miniatures-font-evade"></i>',
    "Focus": '<i class="xwing-miniatures-font xwing-miniatures-font-focus"></i>',
    "Lock": '<i class="xwing-miniatures-font xwing-miniatures-font-lock"></i>',
    "Reload": '<i class="xwing-miniatures-font xwing-miniatures-font-reload"></i>',
    "Rotate Arc": '<i class="xwing-miniatures-font xwing-miniatures-font-rotatearc"></i>',
    "Reinforce": '<i class="xwing-miniatures-font xwing-miniatures-font-reinforce"></i>',
    "Jam": '<i class="xwing-miniatures-font xwing-miniatures-font-jam"></i>',
    "Calculate": '<i class="xwing-miniatures-font xwing-miniatures-font-calculate"></i>',
    "Coordinate": '<i class="xwing-miniatures-font xwing-miniatures-font-coordinate"></i>',
    "Cloak": '<i class="xwing-miniatures-font xwing-miniatures-font-cloak"></i>',
    "Slam": '<i class="xwing-miniatures-font xwing-miniatures-font-slam"></i>',
    "R> Barrel Roll": '<i class="xwing-miniatures-font xwing-miniatures-font-linked red"></i> <i class="xwing-miniatures-font red xwing-miniatures-font-barrelroll"></i>',
    "R> Focus": '<i class="xwing-miniatures-font xwing-miniatures-font-linked red"></i> <i class="xwing-miniatures-font red xwing-miniatures-font-focus"></i>',
    "R> Lock": '<i class="xwing-miniatures-font xwing-miniatures-font-linked red"></i> <i class="xwing-miniatures-font red xwing-miniatures-font-lock"></i>',
    "> Rotate Arc": '<i class="xwing-miniatures-font xwing-miniatures-font-linked"></i> <i class="xwing-miniatures-font xwing-miniatures-font-rotatearc"></i>',
    "R> Rotate Arc": '<i class="xwing-miniatures-font xwing-miniatures-font-linked red"></i> <i class="xwing-miniatures-font red xwing-miniatures-font-rotatearc"></i>',
    "R> Evade": '<i class="xwing-miniatures-font xwing-miniatures-font-linked red"></i> <i class="xwing-miniatures-font red xwing-miniatures-font-evade"></i>',
    "R> Calculate": '<i class="xwing-miniatures-font xwing-miniatures-font-linked red"></i> <i class="xwing-miniatures-font red xwing-miniatures-font-calculate"></i>'
  },
  sloticon: {
    "Astromech": '<i class="xwing-miniatures-font xwing-miniatures-font-astromech"></i>',
    "Force": '<i class="xwing-miniatures-font xwing-miniatures-font-forcepower"></i>',
    "Bomb": '<i class="xwing-miniatures-font xwing-miniatures-font-bomb"></i>',
    "Cannon": '<i class="xwing-miniatures-font xwing-miniatures-font-cannon"></i>',
    "Crew": '<i class="xwing-miniatures-font xwing-miniatures-font-crew"></i>',
    "Talent": '<i class="xwing-miniatures-font xwing-miniatures-font-talent"></i>',
    "Missile": '<i class="xwing-miniatures-font xwing-miniatures-font-missile"></i>',
    "Sensor": '<i class="xwing-miniatures-font xwing-miniatures-font-sensor"></i>',
    "Torpedo": '<i class="xwing-miniatures-font xwing-miniatures-font-torpedo"></i>',
    "Turret": '<i class="xwing-miniatures-font xwing-miniatures-font-turret"></i>',
    "Illicit": '<i class="xwing-miniatures-font xwing-miniatures-font-illicit"></i>',
    "Configuration": '<i class="xwing-miniatures-font xwing-miniatures-font-configuration"></i>',
    "Modification": '<i class="xwing-miniatures-font xwing-miniatures-font-modification"></i>',
    "Gunner": '<i class="xwing-miniatures-font xwing-miniatures-font-gunner"></i>',
    "Device": '<i class="xwing-miniatures-font xwing-miniatures-font-device"></i>',
    "Tech": '<i class="xwing-miniatures-font xwing-miniatures-font-tech"></i>',
    "Title": '<i class="xwing-miniatures-font xwing-miniatures-font-title"></i>'
  },
  slot: {
    "Astromech": "Astromech",
    "Force": "Pouvoir de la Force",
    "Bomb": "Bombe",
    "Cannon": "Canon",
    "Crew": "Équipage",
    "Missile": "Missile",
    "Sensor": "Senseur",
    "Torpedo": "Torpille",
    "Turret": "Tourelle",
    "Hardpoint": "Point d'attache",
    "Illicit": "Illégal",
    "Configuration": "Configuration",
    "Talent": "Talent",
    "Modification": "Modification",
    "Gunner": "Artilleur",
    "Device": "Engin",
    "Tech": "Technologie",
    "Title": "Titre"
  },
  sources: {
    "Second Edition Core Set": "Boîte de base 2.0",
    "Rebel Alliance Conversion Kit": "Kit de Conversion Alliance Rebelle",
    "Galactic Empire Conversion Kit": "Kit de Conversion Empire Galactique",
    "Scum and Villainy Conversion Kit": "Kit de Conversion Racailles et Scélérats",
    "T-65 X-Wing Expansion Pack": "Paquet d'extension T-65 X-Wing",
    "BTL-A4 Y-Wing Expansion Pack": "Paquet d'extension BTL-A4 Y-Wing",
    "TIE/ln Fighter Expansion Pack": "Paquet d'extension Chasseur TIE/ln",
    "TIE Advanced x1 Expansion Pack": "Paquet d'extension TIE Advanced x1",
    "Slave I Expansion Pack": "Paquet d'extension Slave I",
    "Fang Fighter Expansion Pack": "Paquet d'extension Chasseur Fang",
    "Lando's Millennium Falcon Expansion Pack": "Paquet d'extension Faucon Millenium de Lando",
    "Saw's Renegades Expansion Pack": "Paquet d'extension Les Renégats de saw",
    "TIE Reaper Expansion Pack": "Paquet d'extension TIE Reaper"
  },
  ui: {
    shipSelectorPlaceholder: "Choisissez un vaisseau",
    pilotSelectorPlaceholder: "Choisissez un pilot",
    upgradePlaceholder: function(translator, language, slot) {
      return "" + (translator(language, 'slot', slot)) + " (sans amélioration)";
    },
    modificationPlaceholder: "Pas de modification",
    titlePlaceholder: "Pas de titre",
    upgradeHeader: function(translator, language, slot) {
      return "" + (translator(language, 'slot', slot));
    },
    unreleased: "inédit",
    epic: "épique",
    limited: "limité"
  },
  byCSSSelector: {
    '.unreleased-content-used .translated': 'Cet escadron utilise du contenu inédit !',
    '.collection-invalid .translated': 'Vous ne pouvez pas ajouter cette liste à votre collection !',
    '.game-type-selector option[value="standard"]': 'Standard',
    '.game-type-selector option[value="custom"]': 'Personnalisé',
    '.game-type-selector option[value="epic"]': 'Épique',
    '.game-type-selector option[value="team-epic"]': 'Épique en équipe',
    '.xwing-card-browser option[value="name"]': 'Nom',
    '.xwing-card-browser option[value="source"]': 'Source',
    '.xwing-card-browser option[value="type-by-points"]': 'Type (par Points)',
    '.xwing-card-browser option[value="type-by-name"]': 'Type (par Nom)',
    '.xwing-card-browser .translate.select-a-card': 'Sélectionnez une carte dans la liste à gauche.',
    '.xwing-card-browser .translate.sort-cards-by': 'Trier les cartes par',
    '.info-well .info-ship td.info-header': 'Vaisseau',
    '.info-well .info-skill td.info-header': 'Initiative',
    '.info-well .info-actions td.info-header': 'Actions',
    '.info-well .info-upgrades td.info-header': 'Améliorations',
    '.info-well .info-range td.info-header': 'Portée',
    '.clear-squad': 'Nouvel escadron',
    '.save-list': 'Enregistrer',
    '.save-list-as': 'Enregistrer sous…',
    '.delete-list': 'Supprimer',
    '.backend-list-my-squads': 'Charger un escadron',
    '.view-as-text': '<span class="hidden-phone"><i class="fa fa-print"></i>&nbsp;Imprimer/</span>Exporter',
    '.collection': '<i class="fa fa-folder-open hidden-phone hidden-tabler"></i>&nbsp;Votre collection</a>',
    '.randomize': 'Aléatoire !',
    '.randomize-options': 'Options…',
    '.notes-container > span': 'Notes sur l\'escadron',
    '.bbcode-list': 'Copiez le BBCode ci-dessous et collez-le dans votre post.<textarea></textarea><button class="btn btn-copy">Copiez</button>',
    '.html-list': '<textarea></textarea><button class="btn btn-copy">Copiez</button>',
    '.vertical-space-checkbox': "Ajouter de l'espace pour les cartes d'amélioration et de dégâts lors de l'impression <input type=\"checkbox\" class=\"toggle-vertical-space\" />",
    '.color-print-checkbox': "Imprimer en couleur <input type=\"checkbox\" class=\"toggle-color-print\" checked=\"checked\" />",
    '.print-list': '<i class="fa fa-print"></i>&nbsp;Imprimer',
    '.do-randomize': 'Générer aléatoirement !',
    '#browserTab': 'Cartes',
    '#aboutTab': 'À propos',
    '.choose-obstacles': 'Choisir des obstacles',
    '.choose-obstacles-description': 'Choisir jusqu\'à trois obstacles à inclure dans le lien permanent à utiliser dans des programmes externes. (Cette fonctionnalité est en beta ; l\'affichage des obstacles sélectionnés dans l\'impression n\'est pas encore supporté.',
    '.coreasteroid0-select': 'Core Asteroid 0',
    '.coreasteroid1-select': 'Core Asteroid 1',
    '.coreasteroid2-select': 'Core Asteroid 2',
    '.coreasteroid3-select': 'Core Asteroid 3',
    '.coreasteroid4-select': 'Core Asteroid 4',
    '.coreasteroid5-select': 'Core Asteroid 5',
    '.yt2400debris0-select': 'YT2400 Debris 0',
    '.yt2400debris1-select': 'YT2400 Debris 1',
    '.yt2400debris2-select': 'YT2400 Debris 2',
    '.vt49decimatordebris0-select': 'VT49 Debris 0',
    '.vt49decimatordebris1-select': 'VT49 Debris 1',
    '.vt49decimatordebris2-select': 'VT49 Debris 2',
    '.core2asteroid0-select': 'Force Awakens Asteroid 0',
    '.core2asteroid1-select': 'Force Awakens Asteroid 1',
    '.core2asteroid2-select': 'Force Awakens Asteroid 2',
    '.core2asteroid3-select': 'Force Awakens Asteroid 3',
    '.core2asteroid4-select': 'Force Awakens Asteroid 4',
    '.core2asteroid5-select': 'Force Awakens Asteroid 5',
    '.from-xws': 'Importer depuis XWS (beta)',
    '.to-xws': 'Importer vers XWS (beta)'
  },
  singular: {
    'pilots': 'Pilotes',
    'modifications': 'Modification',
    'titles': 'Titres'
  },
  types: {
    'Pilot': 'Pilote',
    'Modification': 'Modification',
    'Title': 'Titre'
  }
};

if (exportObj.cardLoaders == null) {
  exportObj.cardLoaders = {};
}

exportObj.cardLoaders['Français'] = function() {
  var basic_cards, condition_translations, modification_translations, pilot_translations, title_translations, upgrade_translations;
  exportObj.cardLanguage = 'Français';
  basic_cards = exportObj.basicCardData();
  exportObj.canonicalizeShipNames(basic_cards);
  exportObj.ships = basic_cards.ships;
  exportObj.renameShip('TIE Fighter', 'Chasseur TIE');
  exportObj.renameShip('Fang Fighter', 'Chasseur Fang');
  exportObj.renameShip('YT-1300 (Scum)', 'YT-1300 (Racailles)');
  exportObj.renameShip('Escape Craft', 'Vaisseau de secours');
  pilot_translations = {
    "4-LOM": {
      text: "After you fully execute a red maneuver, gain 1 calculate token. At the start of the End Phase, you may choose 1 ship at range 0-1. If you do, transfer 1 of your stress tokens to that ship."
    },
    "Academy Pilot": {
      name: "Pilote de l'académie",
      ship: "Chasseur TIE",
      text: " "
    },
    "Airen Cracken": {
      text: "After you perform an attack, you may choose 1 friendly ship at range 1. That ship may perform an action, treating it as red."
    },
    "Alpha Squadron Pilot": {
      text: "AUTOTHRUSTERS: After you perform an action. you may perform a red %BARRELROLL% or a red %BOOST% action."
    },
    "AP-5": {
      text: "While you coordinate, if you chose a ship with exactly 1 stress token, it can perform actions. %LINEBREAK% COMMS SHUTTLE: While you are docked, your carrier ship gains %COORDINATE%. Before your carrier ship activates, it may perform a %COORDINATE% action."
    },
    "Arvel Crynyd": {
      text: "You can perform primary attacks at range 0. If you would fail a %BOOST% action by overlapping another ship, resolve it as though you were partially executing a maneuver instead. %LINEBREAK% VECTORED THRUSTERS: After you perform an action, you may perform a red %BOOST% action."
    },
    "Asajj Ventress": {
      text: "At the start of the Engagement Phase, you may choose 1 enemy ship in your %SINGLETURRETARC% at range 0-2 and spend 1 %FORCE% token. If you do, that ship gains 1 stress token unless it removes 1 green token."
    },
    "Autopilot Drone": {
      name: "Drone Automatique",
      ship: "Vaisseau de secours",
      text: "Cellules Énergétiques Bidouillées : pendant la phase de système, si vous n’êtes pas arrimé, perdez 1 %CHARGE%. À la fin de la phase d’activation, vous êtes détruit si vous avez 0 %CHARGE%. Avant de retirer votre figurine, chaque vaisseau à porté 0–1 subit 1 dégât %CRIT%."
    },
    "Bandit Squadron Pilot": {
      text: " "
    },
    "Baron of the Empire": {
      text: " "
    },
    "Benthic Two-Tubes": {
      text: "After you perform a %FOCUS% action, you may transfer 1 of your focus tokens to a friendly ship at range 1-2."
    },
    "Biggs Darklighter": {
      text: "Tant qu’un autre vaisseau allié à portée 0–1 défend, avant l’étape « Neutraliser les résultats », si vous êtes dans l’arc de l’attaque, vous pouvez subir 1 dégât %HIT% ou %CRIT% pour annuler 1 dégât correspondant."
    },
    "Binayre Pirate": {
      text: " "
    },
    "Black Squadron Ace": {
      name: "As de l’Escadron Noir",
      ship: "Chasseur TIE",
      text: " "
    },
    "Black Squadron Scout": {
      text: "ADAPTIVE AILERONS: Before you reveal your dial, if you are not stressed, you MUST execute a white (1 %BANKLEFT%), (1 %STRAIGHT%) or (1 %BANKRIGHT%)"
    },
    "Black Sun Ace": {
      text: " "
    },
    "Black Sun Assassin": {
      text: "MICROTHRUSTERS: While you perform a barrel roll, you MUST use the (1 %BANKLEFT%) or (1 %BANKRIGHT%) template instead of the [1 %STRAIGHT%] template."
    },
    "Black Sun Enforcer": {
      text: "MICROTHRUSTERS: While you perform a barrel roll, you MUST use the (1 %BANKLEFT%) or (1 %BANKRIGHT%) template instead of the [1 %STRAIGHT%] template."
    },
    "Black Sun Soldier": {
      text: " "
    },
    "Blade Squadron Veteran": {
      text: " "
    },
    "Blue Squadron Escort": {
      name: "Escorte de l’Escadron Bleu",
      text: " "
    },
    "Blue Squadron Pilot": {
      text: " "
    },
    "Blue Squadron Scout": {
      text: " "
    },
    "Boba Fett": {
      text: "Tant que vous défendez ou effectuez une attaque, vous pouvez relancer 1 de vos dés pour chaque vaisseau ennemi à portée 0–1."
    },
    "Bodhi Rook": {
      text: "Friendly ships can acquire locks onto objects at range 0-3 of any friendly ship."
    },
    "Bossk": {
      text: "While you perform a primary attack, after the Neutralize Results step, you may spend 1 %CRIT% result to add 2 %HIT% results."
    },
    "Bounty Hunter": {
      name: "Chasseur de Primes",
      text: " "
    },
    "Braylen Stramm": {
      text: "While you defend or perform an attack, if you are stressed, you may reroll up to 2 of your dice."
    },
    "Captain Feroph": {
      text: "While you defend, if the attacker does not have any green tokens, you may change 1 of your blank or %FOCUS% results to an %EVADE% result. %LINEBREAK% ADAPTIVE AILERONS: Before you reveal your dial, if you are not stressed, you MUST execute a white (1 %BANKLEFT%), (1 %STRAIGHT%) or (1 %BANKRIGHT%)"
    },
    "Captain Jonus": {
      text: "While a friendly ship at range 0-1 performs a %TORPEDO% or %MISSILE% attack, that ship may reroll up to 2 attack dice. %LINEBREAK% NIMBLE BOMBER: If you would drop a device using a %STRAIGHT% template, you may use %BANKLEFT% a or %BANKRIGHT% tempate of the same speed instead."
    },
    "Captain Jostero": {
      text: "After an enemy ship suffers damage, if it is not defending, you may perform a bonus attack against that ship."
    },
    "Captain Kagi": {
      text: "At the start of the Engagement Phase, you may choose 1 or more friendly ships at range 0-3. If you do, transfer all enemy lock tokens from the chosen ships to you."
    },
    "Captain Nym": {
      text: "Before a friendly bomb or mine would detonate, you may spend 1 %CHARGE% to prevent it from detonating. While you defend against an attack obstructed by a bomb or mine, roll 1 additional defense die."
    },
    "Captain Oicunn": {
      text: "You can perform primary attacks at range 0."
    },
    "Captain Rex": {
      ship: "Chasseur TIE",
      text: "After you perform an attack, assign the Suppressive Fire condition to the defender."
    },
    "Cartel Executioner": {
      text: "DEAD TO RIGHTS: While you perform an attack, if the defender is in your %BULLSEYEARC%, defense dice cannot be modified using green tokens."
    },
    "Cartel Marauder": {
      text: "The versatile Kihraxz was modeled after Incom's popular X-wing starfighter, but an array of aftermarket modification kits ensure a wide variety of designs."
    },
    "Cartel Spacer": {
      text: "WEAPON HARDPOINT: You can equip 1 %CANNON%, %TORPEDO% or %MISSILE% upgrade."
    },
    "Cassian Andor": {
      text: "At the start of the Activation Phase, you may choose 1 friendly ship at range 1-3. If you do, that ship removes 1 stress token."
    },
    "Cavern Angels Zealot": {
      text: " "
    },
    "Chewbacca": {
      text: "Before you would be dealt a faceup damage card, you may spend 1 %CHARGE% to be dealt the card facedown instead."
    },
    '"Chopper"': {
      text: "At the start of the Engagement Phase, each enemy ship at range 0 gains 2 jam tokens.TAIL GUN: While you have a docked ship, you have a primary %REARARC% weapon with an attack value equal to your docked ship's Primary %FRONTARC% attack value."
    },
    "Colonel Jendon": {
      text: "At the start of the Activation Phase, you may spend 1 %CHARGE%. If you do, while friendly ships acquire lock this round, they must acquire locks beyond range 3 instead of at range 0-3."
    },
    "Colonel Vessery": {
      text: "While you perform an attack against a locked ship, after you roll attack dice, you may acquire a lock on the defender. %LINEBREAK% FULL THROTTLE: After you FULLY execute a speed 3-5 maneuver, you may perform an %EVADE% action."
    },
    "Constable Zuvio": {
      text: "If you would drop a device, you may launch it using a [1 %STRAIGHT%] template instead. %LINEBREAK% SPACETUG TRACTOR ARRAY: ACTION: Choose a ship in your %FRONTARC% at range 1. That ship gains one tractor token, or 2 tractor tokens if it is in your %BULLSEYEARC% at range 1"
    },
    "Contracted Scout": {
      text: " "
    },
    "Corran Horn": {
      text: "At initiative 0, you may perform a bonus primary attack against an enemy ship in your %BULLSEYEARC%. If you do, at the start of the next Planning Phase, gain 1 disarm token. %LINEBREAK% EXPERIMENTAL SCANNERS: You can acquire locks beyond range 3. You cannot acquite locks at range 1."
    },
    '"Countdown"': {
      text: "While you defend, after the Neutralize Results step, if you are not stressed, you may suffer 1 %HIT% damage and gain 1 stress token. If you do, cancel all dice results. %LINEBREAK% ADAPTIVE AILERONS: Before you reveal your dial, if you are not stressed, you MUST execute a white (1 %BANKLEFT%), (1 %STRAIGHT%) or (1 %BANKRIGHT%)"
    },
    "Countess Ryad": {
      text: "While you would execute a %STRAIGHT% maneuver, you may increase the difficulty of the maneuver. If you do, execute it as a %KTURN% maneuver instead. %LINEBREAK% FULL THROTTLE: After you FULLY execute a speed 3-5 maneuver, you may perform an %EVADE% action."
    },
    "Crymorah Goon": {
      text: " "
    },
    "Cutlass Squadron Pilot": {
      text: " "
    },
    "Dace Bonearm": {
      text: "After an enemy ship at range 0-3 receives at least 1 ion token, you may spend 3 %CHARGE%. If you do, that ship gains 2 additional ion tokens."
    },
    "Dalan Oberos": {
      text: "At the start of the Engagement Phase, you may choose 1 shielded ship in your %BULLSEYEARC% and spend 1 %CHARGE%. If you do, that ship loses 1 shield and you recover 1 shield. %LINEBREAK% DEAD TO RIGHTS: While you perform an attack, if the defender is in your %BULLSEYEARC%, defense dice cannot be modified using green tokens."
    },
    "Dalan Oberos (StarViper)": {
      text: "After you fully execute a maneuver, you may gain 1 stress token to rotate your ship 90˚.  %LINEBREAK% MICROTHRUSTERS: While you perform a barrel roll, you MUST use the (1 %BANKLEFT%) or (1 %BANKRIGHT%) template instead of the [1 %STRAIGHT%] template."
    },
    "Darth Vader": {
      text: "Après avoir effectué une action, vous pouvez dépenser 1 %FORCE% pour effectuer une action. %LINEBREAK% Ordinateur de Visée Avancé : tant que vous effectuez une attaque principale contre un défenseur que vous avez verrouillé, lancez 1 dé d’attaque supplémentaire et changez 1 résultat %HIT% en un résultat %CRIT%."
    },
    "Dash Rendar": {
      text: "While you move, you ignore obstacles. %LINEBREAK% SENSOR BLINDSPOT: While you perform a primary attack at range 0-1, do not apply the range 0-1 bonus and roll 1 fewer attack die."
    },
    '"Deathfire"': {
      text: "After you are destroyed, before you are removed, you may perform an attack and drop or launch 1 device. %LINEBREAK% NIMBLE BOMBER: If you would drop a device using a %STRAIGHT% template, you may use %BANKLEFT% a or %BANKRIGHT% tempate of the same speed instead."
    },
    '"Deathrain"': {
      text: "After you drop or launch a device, you may perform an action."
    },
    "Del Meeko": {
      ship: "Chasseur TIE",
      text: "Tant qu’un vaisseau allié à portée 0–2 défend contre un attaquant endommagé, le défenseur peut relancer 1 dé de défense."
    },
    "Delta Squadron Pilot": {
      text: "FULL THROTTLE: After you FULLY execute a speed 3-5 maneuver, you may perform an %EVADE% action."
    },
    "Dengar": {
      text: "After you defend, if the attcker is in your %FRONTARC%, you may spend 1 %CHARGE% to perform a bonus attack against the attacker."
    },
    '"Double Edge"': {
      text: "After you perform a %TURRET% or %MISSILE% attack that misses, you may perform a bonus attack using a different weapon."
    },
    "Drea Renthal": {
      text: "While a friendly non-limited ship performs an attack, if the defender is in your firing arc, the attacker may reroll 1 attack die."
    },
    '"Duchess"': {
      text: "You may choose not to use your Adaptive Ailerons. You may use your Adaptive Ailerons even while stressed. %LINEBREAK% ADAPTIVE AILERONS: Before you reveal your dial, if you are not stressed, you MUST execute a white (1 %BANKLEFT%), (1 %STRAIGHT%) or (1 %BANKRIGHT%)"
    },
    '"Dutch" Vander': {
      text: "Après avoir effectué l’action %LOCK%, vous pouvez choisir 1 vaisseau allié à portée 1–3. Ce vaisseau allié peut verrouiller l’objet que vous avez verrouillé, en ignorant les restrictions de portée."
    },
    '"Echo"': {
      text: "While you decloak, you must use the (2 %BANKLEFT%) or (2 %BANKRIGHT%) template instead of the (2 %STRAIGHT%) template. STYGUM ARRAY: After you decloak, you may perform an %EVADE% action. At the Start of the End Phase, you may spend 1 evade token to gain one cloak token."
    },
    "Edrio Two-Tubes": {
      text: "Before you activate, if you are focused, you may perform an action."
    },
    "Emon Azzameen": {
      text: "Si vous êtes censé larguer un engin en utilisant un gabarit [1 %STRAGHT%], vous pouvez utiliser le gabarit [3 %TURNLEFT%], [3 %STRAIGHT%] ou [3 %TURNRIGHT%] à la place."
    },
    "Esege Tuketu": {
      text: "While a friendly ship at range 0-2 defends or performs an attack, it may spend your focus tokens as if that ship has them."
    },
    "Evaan Verlaine": {
      text: "Au début de la phase d’engagement, vous pouvez dépenser 1 marqueur de concentration pour choisir un vaisseau allié à portée 0–1. Dans ce cas, ce vaisseau allié lance 1 dé de défense supplémentaire tant qu’il défend, jusqu’à la fin du round."
    },
    "Ezra Bridger": {
      text: "While you defend or perform an attack, if you are stressed, you may spend 1 %FORCE% to change up to 2 of your %FOCUS% results to %EVADE% or %HIT% results. %LINEBREAK% LOCKED AND LOADED: While you are docked, after your carrier ship performs a primary %FRONTARC% or %TURRET% attack, it may perform a bonus %REARARC% attack"
    },
    "Ezra Bridger (Sheathipede)": {
      text: "While you defend or perform an attack, if you are stressed, you may spend 1 %FORCE% to change up to 2 of your %FOCUS% results to %EVADE%/%HIT% results. %LINEBREAK% COMMS SHUTTLE: While you are docked, your carrier ship gains %COORDINATE%. Before your carrier shpi activates, it may perform a %COORDINATE% action."
    },
    "Ezra Bridger (TIE Fighter)": {
      ship: "Chasseur TIE",
      text: "While you defend or perform an attack, if you are stressed, you may spend 1 %FORCE% to change up to 2 of your %FOCUS% results to %EVADE% or %HIT% results."
    },
    "Fenn Rau": {
      ship: "Chasseur Fang",
      text: "Tant que vous défendez ou effectuez une attaque, si la portée d’attaque est 1, vous pouvez lancer 1 dé supplémentaire. %LINEBREAK% CONCORDIA FACEOFF: Opposition Concordia : tant que vous défendez, si la portée d’attaque est 1 et que vous êtes dans l’%FRONTARC% de l’attaquant, changez 1 résultat en un résultat %EVADE%."
    },
    "Fenn Rau (Sheathipede)": {
      text: "After an enemy ship in your firing arc engages, if you are not stressed, you may gain 1 stress token. If you do, that ship cannot spend tokens to modify dice while it performs an attack during this phase. %LINEBREAK% COMMS SHUTTLE: While you are docked, your carrier ship gains %COORDINATE%. Before your carrier shpi activates, it may perform a %COORDINATE% action."
    },
    "Freighter Captain": {
      name: "Capitaine de Cargo",
      ship: "YT-1300 (Racailles)",
      text: " "
    },
    "Gamma Squadron Ace": {
      text: "NIMBLE BOMBER: If you would drop a device using a %STRAIGHT% template, you may use %BANKLEFT% a or %BANKRIGHT% tempate of the same speed instead."
    },
    "Gand Findsman": {
      text: "The legendary Findsmen of Gand worship enshrouding mists of their home planet, using signs, augurs, and mystical rituals to track their quarry."
    },
    "Garven Dreis": {
      text: "Après voir dépensé un marqueur de concentration, vous pouvez choisir 1 vaisseau allié à portée 1–3. Ce vaisseau gagne 1 marqueur de concentration."
    },
    "Garven Dreis (X-Wing)": {
      text: "Après voir dépensé un marqueur de concentration, vous pouvez choisir 1 vaisseau allié à portée 1–3. Ce vaisseau gagne 1 marqueur de concentration."
    },
    "Gavin Darklighter": {
      text: "While a friendly ship performs an attack, if the defender is in your %FRONTARC%, the attacker may change 1 %HIT% result to a %CRIT% result. %LINEBREAK% EXPERIMENTAL SCANNERS: You can acquire locks beyond range 3. You cannot acquite locks at range 1."
    },
    "Genesis Red": {
      text: "After you acquire a lock, you must remove all of your focus and evade tokens. Then gain the same number of focus and evade tokens that the locked ship has. %LINEBREAK% WEAPON HARDPOINT: You can equip 1 %CANNON%, %TORPEDO% or %MISSILE% upgrade."
    },
    "Gideon Hask": {
      ship: "Chasseur TIE",
      text: "Tant que vous effectuez une attaque contre un défenseur endommagé, lancez 1 dé d’attaque supplémentaire."
    },
    "Gold Squadron Veteran": {
      name: "Vétéran de l’Escadron Or",
      text: " "
    },
    "Grand Inquisitor": {
      text: "While you defend at attack range 1, you may spend 1 %FORCE% to prevent the range 1 bonus. While you perform an attack against a defender at attack range 2-3, you may spend 1 %FORCE% to apply the range 1 bonus."
    },
    "Gray Squadron Bomber": {
      name: "Bombardier de l’Escadron Gris",
      text: " "
    },
    "Graz": {
      text: "While you defend, if you are behind the attacker, roll 1 additional defense die. While you perform an attack, if you are behind the defender roll 1 additional attack die."
    },
    "Green Squadron Pilot": {
      text: "VECTORED THRUSTERS: After you perform an action, you may perform a red %BOOST% action."
    },
    "Guri": {
      text: "At the start of the Engagement Phase, if there is at least 1 enemy ship at range 0-1, you may gain 1 focus token.  %LINEBREAK% MICROTHRUSTERS: While you perform a barrel roll, you MUST use the (1 %BANKLEFT%) or (1 %BANKRIGHT%) template instead of the [1 %STRAIGHT%] template."
    },
    "Han Solo (Scum)": {
      name: "Han Solo (Racailles)",
      ship: "YT-1300 (Racailles)",
      text: "Tant que vous défendez ou effectuez une attaque principale, si l’attaque est gênée par un obstacle, vous pouvez lancer 1 dé supplémentaire."
    },
    "Han Solo": {
      text: "After you roll dice, if you are at range 0-1 of an obstacle, you may reroll all of your dice. This does not count as rerolling for the purpose of other effects."
    },
    "Heff Tobber": {
      text: "After an enemy ship executes a maneuver, if it is at range 0, you may perform an action."
    },
    "Hera Syndulla": {
      text: "After you reveal a red or blue maneuver, you may set your dial to another maneuver of the same difficulty. %LINEBREAK% LOCKED AND LOADED: While you are docked, after your carrier ship performs a primary %FRONTARC% or %TURRET% attack, it may perform a bonus %REARARC% attack"
    },
    "Hera Syndulla (VCX-100)": {
      text: "After you reveal a red or blue maneuver, you may set your dial to another maneuver of the same difficulty. TAIL GUN: While you have a docked ship, you have a primary %REARARC% weapon with an attack value equal to your docked ship's Primary %FRONTARC% attack value."
    },
    "Hired Gun": {
      text: "Just the mention of Imperial credits can bring a host of less-than-trustworthy individuals to your side."
    },
    "Horton Salm": {
      text: "Tant que vous effectuez une attaque, vous pouvez relancer 1 dé d’attaque pour chaque autre vaisseau allié à portée 0–1 du défenseur."
    },
    '"Howlrunner"': {
      ship: "Chasseur TIE",
      text: "Tant qu’un vaisseau allié à portée 0–1 effectue une attaque principale, il peut relancer 1 dé d’attaque."
    },
    "Ibtisam": {
      text: "After you fully execute a maneuver, if you are stressed, you may roll 1 attack die. On a %HIT% or %CRIT% result, remove 1 stress token."
    },
    "Iden Versio": {
      ship: "Chasseur TIE",
      text: "Avant qu’un chasseur TIE/ln allié à portée 0–1 ne subisse 1 ou plusieurs dégâts, vous pouvez dépenser 1 %CHARGE%. Dans ce cas, prévenez ce dégât."
    },
    "IG-88A": {
      text: "At the start of the Engagement Phase, you may choose 1 friendly ship with %CALCULATE% on its action bar at range 1-3. If you do, transfer 1 of your calculate tokens to it. %LINEBREAK% ADVANCED DROID BRAIN: After you perform a %CALCULATE% action, gain 1 calculate token."
    },
    "IG-88B": {
      text: "After you perform an attack that misses, you may perform a bonus %CANNON% attack. %LINEBREAK% ADVANCED DROID BRAIN: After you perform a %CALCULATE% action, gain 1 calculate token."
    },
    "IG-88C": {
      text: "After you perform a %BOOST% action, you may perform an %EVADE% action. %LINEBREAK% ADVANCED DROID BRAIN: After you perform a %CALCULATE% action, gain 1 calculate token."
    },
    "IG-88D": {
      text: "While you execute a Segnor's Loop (%SLOOPLEFT% or %SLOOPRIGHT%) maneuver, you may use another template of the same speed instead: either the turn (%TURNLEFT% or %TURNRIGHT%) of the same direction or the straight (%STRAIGHT%) template. %LINEBREAK% ADVANCED DROID BRAIN: After you perform a %CALCULATE% action, gain 1 calculate token."
    },
    "Imdaar Test Pilot": {
      text: "STYGUM ARRAY: After you decloak, you may perform an %EVADE% action. At the Start of the End Phase, you may spend 1 evade token to gain one cloak token."
    },
    "Inaldra": {
      text: "While you defend or perform an attack, you may suffer 1 %HIT% damage to reroll any number of your dice. %LINEBREAK% WEAPON HARDPOINT: You can equip 1 %CANNON%, %TORPEDO% or %MISSILE% upgrade."
    },
    "Inquisitor": {
      text: "The fearsome Inquisitors are given a great deal of autonomy and access to the Empire's latest technology, like the prototype TIE Advanced v1."
    },
    "Jake Farrell": {
      text: "After you perform a %BARRELROLL% or %BOOST% action, you may choose a friendly ship at range 0-1. That ship may perform a %FOCUS% action. %LINEBREAK% VECTORED THRUSTERS: After you perform an action, you may perform a red %BOOST% action."
    },
    "Jakku Gunrunner": {
      text: "SPACETUG TRACTOR ARRAY: ACTION: Choose a ship in your %FRONTARC% at range 1. That ship gains one tractor token, or 2 tractor tokens if it is in your %BULLSEYEARC% at range 1"
    },
    "Jan Ors": {
      text: "While a friendly ship in your firing arc performs a primary attack, if you are not stressed, you may gain 1 stress token. If you do, that ship may roll 1 additional attack die."
    },
    "Jek Porkins": {
      text: "Après avoir reçu un marqueur de stress, vous pouvez lancer 1 dé d’attaque pour le retirer. Sur un résultat %HIT%, subissez 1 dégat %HIT%."
    },
    "Joy Rekkoff": {
      ship: "Chasseur Fang",
      text: "Tant que vous effectuez une attaque, vous pouvez dépenser 1 %CHARGE% d’une amélioration %TORPEDO% équipée. Dans ce cas, le défenseur lance 1 dé de défense en moins. %LINEBREAK% Opposition Concordia : tant que vous défendez, si la portée d’attaque est 1 et que vous êtes dans l’%FRONTARC% de l’attaquant, changez 1 résultat en un résultat %EVADE%."
    },
    "Kaa'to Leeachos": {
      text: "At the start of the Engagement Phase, you may choose 1 friendly ship at range 0-2. If you do, transfer 1 focus or evade token from that ship to yourself."
    },
    "Kad Solus": {
      ship: "Chasseur Fang",
      text: "Après avoir entièrement exécuté une manœuvre rouge, gagnez 2 marqueurs de concentration. %LINEBREAK% Opposition Concordia : tant que vous défendez, si la portée d’attaque est 1 et que vous êtes dans l’%FRONTARC% de l’attaquant, changez 1 résultat en un résultat %EVADE%."
    },
    "Kanan Jarrus": {
      text: "While a friendly ship in your firing arc defends, you may spend 1 %FORCE%. If you do, the attacker rolls 1 fewer attack die. TAIL GUN: While you have a docked ship, you have a primary %REARARC% weapon with an attack value equal to your docked ship's Primary %FRONTARC% attack value."
    },
    "Kashyyyk Defender": {
      text: "Equipped with three wide-range Sureggi twin laser cannons, the Auzituck gunship acts as a powerful deterrent to slaver operations in the Kashyyyk system."
    },
    "Kath Scarlet": {
      text: "Tant que vous effectuez une attaque principale, si au moins 1 vaisseau allié non-limité est à portée 0 du défenseur, lancez 1 dé d’attaque supplémentaire."
    },
    "Kavil": {
      text: "While you perform a non-%FRONTARC% attack, roll 1 additional attack die."
    },
    "Ketsu Onyo": {
      text: "At the start of the Engagement Phase, you may choose 1 ship in both your %FRONTARC% and %SINGLETURRETARC% at range 0-1. If you do, that ship gains 1 tractor token."
    },
    "Knave Squadron Escort": {
      text: "EXPERIMENTAL SCANNERS: You can acquire locks beyond range 3. You cannot acquite locks at range 1."
    },
    "Koshka Frost": {
      text: "Tant que vous défendez ou effectuez une attaque, si le vaisseau ennemi est stressé, vous pouvez relancer 1 de vos dés."
    },
    "Krassis Trelix": {
      text: "Vous pouvez effectuer des attaques spéciales %FRONTARC% depuis votre %REARARC%. %LINEBREAK% Tant que vous effectuez une attaque spéciale, vous pouvez relancer 1 dé d’attaque."
    },
    "Kullbee Sperado": {
      text: "After you perform a %BARRELROLL% or %BOOST% action, you may flip your equipped %CONFIG% upgrade card."
    },
    "Kyle Katarn": {
      text: "At the start of the Engagement Phase, you may transfer 1 of your focus tokens to a friendly ship in your firing arc."
    },
    "L3-37 (Escape Craft)": {
      name: "L3-37 (Vaisseau de secours)",
      ship: "Vaisseau de secours",
      text: "Si vous n'êtes pas protégé, diminuez la difficulté de vos manœuvres de virages sur l’aile (%BANKLEFT% and %BANKRIGHT%). %LINEBREAK% COPILOTE: tant que vous êtes arrimé, votre vaisseau porteur bénéficie de votre capacité de pilote en plus de la sienne."
    },
    "L3-37": {
      ship: "YT-1300 (Racailles)",
      text: "Si vous n'êtes pas protégé, diminuez la difficulté de vos manœuvres de virages sur l’aile (%BANKLEFT% and %BANKRIGHT%)."
    },
    "Laetin A'shera": {
      text: "After you defend or perform an attack, if the attack missed, gain 1 evade token. %LINEBREAK% WEAPON HARDPOINT: You can equip 1 %CANNON%, %TORPEDO% or %MISSILE% upgrade."
    },
    "Lando Calrissian (Scum) (Escape Craft)": {
      name: "Lando Calrissian (Racailles) (Vaisseau de secours)",
      ship: "Vaisseau de secours",
      text: "Après avoir lancé des dés, si vous n’êtes pas stressé, vous pouvez gagner 1 marqueur de stress pour relancer tous vos résultats vierges. %LINEBREAK% COPILOTE: tant que vous êtes arrimé, votre vaisseau porteur bénéficie de votre capacité de pilote en plus de la sienne."
    },
    "Lando Calrissian": {
      text: "After you fully execute a blue maneuver, you may choose a friendly ship at range 0-3. That ship may perform an action."
    },
    "Lando Calrissian (Scum)": {
      name: "Lando Calrissian (Racailles)",
      ship: "YT-1300 (Racailles)",
      text: "Après avoir lancé des dés, si vous n’êtes pas stressé, vous pouvez gagner 1 marqueur de stress pour relancer tous vos résultats vierges."
    },
    "Latts Razzi": {
      text: "At the start of the Engagement Phase, you may choose a ship at range 1 and spend a lock you have on that ship. If you do, that ship gains 1 tractor token."
    },
    '"Leebo"': {
      text: "After you defend or perform an attack, if you spent a calculate token, gain 1 calculate token. %LINEBREAK% SENSOR BLINDSPOT: While you perform a primary attack at range 0-1, do not apply the range 0-1 bonus and roll 1 fewer attack die."
    },
    "Leevan Tenza": {
      text: "After you perform a %BARRELROLL% or %BOOST% action, you may perform a red %EVADE% action."
    },
    "Lieutenant Blount": {
      text: "While you perform a primary attack, if there is at least 1 other friendly ship at range 0-1 of the defender, you may roll 1 additional attack die."
    },
    "Lieutenant Karsabi": {
      text: "After you gain a disarm token, if you are not stressed, you may gain 1 stress token to remove 1 disarm token."
    },
    "Lieutenant Kestal": {
      text: "While you perform an attack, after the defender rolls defense dice, you may spend 1 focus token to cancel all of the defender's blank/%FOCUS% results."
    },
    "Lieutenant Sai": {
      text: "After you a perform a %COORDINATE% action, if the ship you chose performed an action on your action bar, you may perform that action."
    },
    "Lok Revenant": {
      text: " "
    },
    "Lothal Rebel": {
      text: "TAIL GUN: While you have a docked ship, you have a primary %REARARC% weapon with an attack value equal to your docked ship's Primary %FRONTARC% attack value."
    },
    "Lowhhrick": {
      text: "After a friendly ship at range 0-1 becomes the defender, you may spend 1 reinforce token. If you do, that ship gains 1 evade token."
    },
    "Luke Skywalker": {
      text: "Après être devenu le défenseur (avant que les dés ne soient lancés), vous pouvez récupérer 1 %FORCE%."
    },
    "Maarek Stele": {
      text: "Tant que vous effectuez une attaque, si une carte de dégât devrait être attribuée face visible au défenseur, piochez 3 cartes de dégât à la place, choisissez-en 1, et défaussez les autres. %LINEBREAK% Ordinateur de Visée Avancé : tant que vous effectuez une attaque principale contre un défenseur que vous avez verrouillé, lancez 1 dé d’attaque supplémentaire et changez 1 résultat %HIT% en un résultat %CRIT%."
    },
    "Magva Yarro": {
      text: "While a friendly ship at range 0-2 defends, the attacker cannot reroll more than 1 attack die."
    },
    "Major Rhymer": {
      text: "While you perform a %TORPEDO% or %MISSILE% attack, you may increase or decrease the range requirement by 1, to a limit of 0-3. %LINEBREAK% NIMBLE BOMBER: If you would drop a device using a %STRAIGHT% template, you may use %BANKLEFT% a or %BANKRIGHT% tempate of the same speed instead."
    },
    "Major Vermeil": {
      text: "While you perform an attack, if the defender does not have any green tokens, you may change 1 of your  blank  or %FOCUS% results to a %HIT% result. %LINEBREAK% ADAPTIVE AILERONS: Before you reveal your dial, if you are not stressed, you MUST execute a white (1 %BANKLEFT%), (1 %STRAIGHT%) or (1 %BANKRIGHT%)"
    },
    "Major Vynder": {
      text: "While you defend, if you are disarmed, roll 1 additional defense die."
    },
    "Manaroo": {
      text: "At the start of the Engagement Phase, you may choose a friendly ship at range 0-1. If you do, transfer all green tokens assigned to you to that ship."
    },
    '"Mauler" Mithel': {
      ship: "Chasseur TIE",
      text: "Tant que vous effectuez une attaque à portée d’attaque 1, lancez 1 dé d’attaque supplémentaire."
    },
    "Miranda Doni": {
      text: "While you perform a primary attack, you may either spend 1 shield to roll 1 additional attack die or, if you are not shielded, you may roll 1 fewer attack die to recover 1 shield."
    },
    "Moralo Eval": {
      text: "If you would flee, you may spend 1 %CHARGE%. If you do, place yourself in reserves instead. At the start of the next Planning Phase, place youself within range 1 of the edge of the play area that you fled from."
    },
    "Nashtah Pup": {
      text: "You can deploy only via emergency deployment, and you have the name, initiative, pilot ability, and ship %CHARGE% of the friendly, destroyed Hound's Tooth. %LINEBREAK% ESCAPE CRAFT SETUP: Requires the HOUND'S TOOTH. You MUST begin the game docked with the HOUND'S TOOTH"
    },
    "N'dru Suhlak": {
      text: "While you perform a primary attack, if there are no other friendly ships at range 0-2, roll 1 additional attack die."
    },
    '"Night Beast"': {
      ship: "Chasseur TIE",
      text: "Après avoir entièrement exécuté une manœuvre bleue, vous pouvez effectuer une action %FOCUS%."
    },
    "Norra Wexley": {
      text: "Tant que vous défendez, si un vaisseau ennemi est à portée 0–1, ajoutez 1 résultat %EVADE% à vos résultats de dés."
    },
    "Norra Wexley (Y-Wing)": {
      text: "While you defend, if there is an enemy ship at range 0-1, you may add 1 %EVADE% result to your dice results."
    },
    "Nu Squadron Pilot": {
      text: " "
    },
    "Obsidian Squadron Pilot": {
      name: "Pilote de l’Escadron Obsidian",
      ship: "Chasseur TIE",
      text: " "
    },
    "Old Teroch": {
      name: "Vieux Teroch",
      ship: "Chasseur Fang",
      text: "Au début de la phase d’engagement, vous pouvez choisir 1 vaisseau ennemi à portée 1. Dans ce cas, si vous êtes dans son , il retire tous ses marqueurs verts. %LINEBREAK% Opposition Concordia : tant que vous défendez, si la portée d’attaque est 1 et que vous êtes dans l’%FRONTARC% de l’attaquant, changez 1 résultat en un résultat %EVADE%."
    },
    "Omicron Group Pilot": {
      text: " "
    },
    "Onyx Squadron Ace": {
      text: "FULL THROTTLE: After you FULLY execute a speed 3-5 maneuver, you may perform an %EVADE% action."
    },
    "Onyx Squadron Scout": {
      text: " "
    },
    "Outer Rim Pioneer": {
      name: "Colon de la Bordure Extérieure",
      ship: "Vaisseau de secours",
      text: "Les vaisseaux alliés à portée 0–1 peuvent effectuer des attaques en étant à portée 0 des obstacles. %LINEBREAK% COPILOTE: tant que vous êtes arrimé, votre vaisseau porteur bénéficie de votre capacité de pilote en plus de la sienne."
    },
    "Outer Rim Smuggler": {
      text: " "
    },
    "Palob Godalhi": {
      text: "At the start of the Engagement Phase, you may choose 1 enemy ship in your firing arc at range 0-2. If you do, transfer 1 focus or evade token from that ship to yourself."
    },
    "Partisan Renegade": {
      text: " "
    },
    "Patrol Leader": {
      text: " "
    },
    "Phoenix Squadron Pilot": {
      text: "VECTORED THRUSTERS: After you perform an action, you may perform a red %BOOST% action."
    },
    "Planetary Sentinel": {
      text: "ADAPTIVE AILERONS: Before you reveal your dial, if you are not stressed, you MUST execute a white (1 %BANKLEFT%), (1 %STRAIGHT%) or (1 %BANKRIGHT%)"
    },
    "Prince Xizor": {
      text: "While you defend, after the Neutralize Results step, another friendly ship at range 0-1 and in the attack arc may suffer 1 %HIT% or %CRIT% damage. If it does, cancel 1 matching result.  %LINEBREAK% MICROTHRUSTERS: While you perform a barrel roll, you MUST use the (1 %BANKLEFT%) or (1 %BANKRIGHT%) template instead of the [1 %STRAIGHT%] template."
    },
    '"Pure Sabacc"': {
      text: "While you perform an attack, if you have 1 or fewer damage cards, you may roll 1 additional attack die. %LINEBREAK% ADAPTIVE AILERONS: Before you reveal your dial, if you are not stressed, you MUST execute a white (1 %BANKLEFT%), (1 %STRAIGHT%) or (1 %BANKRIGHT%)"
    },
    "Quinn Jast": {
      text: "At the start of the Engagement Phase, you may gain 1 disarm token to recover 1 %CHARGE% on 1 of your equipped upgrades. %LINEBREAK% WEAPON HARDPOINT: You can equip 1 %CANNON%, %TORPEDO% or %MISSILE% upgrade."
    },
    "Rear Admiral Chiraneau": {
      text: "While you perform an attack, if you are reinforced and the defender is in the %FULLFRONTARC% or %FULLREARARC% matching your reinforce token, you may change 1 of your %FOCUS% results to a %CRIT% result."
    },
    "Rebel Scout": {
      text: " "
    },
    "Red Squadron Veteran": {
      name: "Vétéran de l’Escadron Rouge",
      text: " "
    },
    '"Redline"': {
      text: "You can maintain up to 2 locks. After you perform an action, you may acquire a lock."
    },
    "Rexler Brath": {
      text: "After you perform an attack that hits, if you are evading, expose 1 of the defender's damage cards. %LINEBREAK% FULL THROTTLE: After you FULLY execute a speed 3-5 maneuver, you may perform an %EVADE% action."
    },
    "Rho Squadron Pilot": {
      text: " "
    },
    "Roark Garnet": {
      text: "At the start of the Engagement Phase, you may choose 1 ship in your firing arc. If you do, it engages at initiative 7 instead of its standard initiative value this phase."
    },
    "Rogue Squadron Escort": {
      text: "EXPERIMENTAL SCANNERS: You can acquire locks beyond range 3. You cannot acquire locks at range 1."
    },
    "Saber Squadron Ace": {
      text: "AUTOTHRUSTERS: After you perform an action. you may perform a red %BARRELROLL% or a red %BOOST% action."
    },
    "Sabine Wren": {
      text: "Before you activate, you may perform a %BARRELROLL% or %BOOST% action. %LINEBREAK% LOCKED AND LOADED: While you are docked, after your carrier ship performs a primary %FRONTARC% or %TURRET% attack, it may perform a bonus %REARARC% attack"
    },
    "Sabine Wren (Scum)": {
      text: "While you defend, if the attacker is in your %SINGLETURRETARC% at range 0-2, you may add 1 %FOCUS% result to your dice results."
    },
    "Sabine Wren (TIE Fighter)": {
      ship: "Chasseur TIE",
      text: "Before you activate, you may perform a %BARRELROLL% or %BOOST% action."
    },
    "Sarco Plank": {
      text: "While you defend, you may treat your agility value as equal to the speed of the maneuver you executed this round. %LINEBREAK% SPACETUG TRACTOR ARRAY: ACTION: Choose a ship in your %FRONTARC% at range 1. That ship gains one tractor token, or 2 tractor tokens if it is in your %BULLSEYEARC% at range 1"
    },
    "Saw Gerrera": {
      text: "While a damaged friendly ship at range 0-3 performs an attack, it may reroll 1 attack die."
    },
    "Scarif Base Pilot": {
      text: "ADAPTIVE AILERONS: Before you reveal your dial, if you are not stressed, you MUST execute a white (1 %BANKLEFT%), (1 %STRAIGHT%) or (1 %BANKRIGHT%)"
    },
    "Scimitar Squadron Pilot": {
      text: "NIMBLE BOMBER: If you would drop a device using a %STRAIGHT% template, you may use %BANKLEFT% a or %BANKRIGHT% template of the same speed instead."
    },
    '"Scourge" Skutu': {
      ship: "Chasseur TIE",
      text: "Tant que vous effectuez une attaque contre un défenseur dans votre %BULLSEYEARC%, lancez 1 dé d’attaque supplémentaire."
    },
    "Serissu": {
      text: "While a friendly ship at range 0-1 defends, it may reroll 1 of its dice. %LINEBREAK% WEAPON HARDPOINT: You can equip 1 %CANNON%, %TORPEDO% or %MISSILE% upgrade."
    },
    "Seventh Sister": {
      text: "While you perform a primary attack, before the Neutralize Results step, you may spend 2 %FORCE% to cancel 1 %EVADE% result."
    },
    "Seyn Marana": {
      ship: "Chasseur TIE",
      text: "Tant que vous effectuez une attaque, vous pouvez dépenser 1 résultat %CRIT%. Dans ce cas, attribuez 1 carte de dégât face cachée au défenseur, puis annuler vos résultats restants."
    },
    "Shadowport Hunter": {
      text: "Crime syndicates augment the lethal skills of their loyal contractors with the best technology available, like the fast and formidable Lancer-class pursuit craft."
    },
    "Shara Bey": {
      text: "While you defend or perform a primary attack, you may spend 1 lock you have on the enemy ship to add 1 %FOCUS% result to your dice results."
    },
    "Sienar Specialist": {
      text: " "
    },
    "Sigma Squadron Ace": {
      text: "STYGUM ARRAY: After you decloak, you may perform an %EVADE% action. At the Start of the End Phase, you may spend 1 evade token to gain one cloak token."
    },
    "Skull Squadron Pilot": {
      name: "Pilote de l'Escadron Skull",
      ship: "Chasseur Fang",
      text: "Opposition Concordia : tant que vous défendez, si la portée d’attaque est 1 et que vous êtes dans l’%FRONTARC% de l’attaquant, changez 1 résultat en un résultat %EVADE%."
    },
    "Sol Sixxa": {
      text: "If you would drop a device using a [1 %STRAIGHT%] template, you may drop it using any other speed 1 template instead."
    },
    "Soontir Fel": {
      text: "At the start of the Engagement Phase, if there is an enemy ship in your %BULLSEYEARC%, gain 1 focus token. %LINEBREAK% AUTOTHRUSTERS: After you perform an action. you may perform a red %BARRELROLL% or a red %BOOST% action."
    },
    "Spice Runner": {
      text: " "
    },
    "Storm Squadron Ace": {
      name: "As de l'Escadron Storm",
      text: "Ordinateur de Visée Avancé : tant que vous effectuez une attaque principale contre un défenseur que vous avez verrouillé, lancez 1 dé d’attaque supplémentaire et changez 1 résultat %HIT% en un résultat %CRIT%."
    },
    "Sunny Bounder": {
      text: "While you defend or perform an attack, after you roll or reroll your dice, if you have the same result on each of your dice, you may add 1 matching result. %LINEBREAK% WEAPON HARDPOINT: You can equip 1 %CANNON%, %TORPEDO% or %MISSILE% upgrade."
    },
    "Tala Squadron Pilot": {
      text: " "
    },
    "Talonbane Cobra": {
      text: "While you defend at attack range 3 or perform an attack at range 1, roll 1 additional die."
    },
    "Tansarii Point Veteran": {
      text: "WEAPON HARDPOINT: You can equip 1 %CANNON%, %TORPEDO% or %MISSILE% upgrade."
    },
    "Tel Trevura": {
      text: "If you would be destroyed, you may spend 1 %CHARGE%. If you do, discard all of your damage cards, suffer 5 %HIT% damage, and place yourself in reserves instead. At the start of the next planning phase, place yourself within range 1 of your player edge."
    },
    "Tempest Squadron Pilot": {
      name: "Pilote de l’Escadron Tempest",
      text: "Ordinateur de Visée Avancé : tant que vous effectuez une attaque principale contre un défenseur que vous avez verrouillé, lancez 1 dé d’attaque supplémentaire et changez 1 résultat %HIT% en un résultat %CRIT%."
    },
    "Ten Numb": {
      text: "While you defend or perform an attack, you may spend 1 stress token to change all of your %FOCUS% results to %EVADE% or %HIT% results."
    },
    "Thane Kyrell": {
      text: "Tant que vous effectuez une attaque, vous pouvez dépenser 1 résultat %FOCUS%, %HIT% ou %CRIT% pour regarder les cartes de dégât face cachée du défenseur, en choisir 1 et l’exposer."
    },
    "Tomax Bren": {
      text: "After you perform a %RELOAD% action, you may recover 1 %CHARGE% token on 1 of your equipped %TALENT% upgrade cards. %LINEBREAK% NIMBLE BOMBER: If you would drop a device using a %STRAIGHT% template, you may use %BANKLEFT% a or %BANKRIGHT% tempate of the same speed instead."
    },
    "Torani Kulda": {
      text: "After you perform an attack, each enemy ship in your %BULLSEYEARC% suffers 1 %HIT% damage unless it removes 1 green token. %LINEBREAK% DEAD TO RIGHTS: While you perform an attack, if the defender is in your %BULLSEYEARC%, defense dice cannot be modified using green tokens."
    },
    "Torkil Mux": {
      text: "At the start of the Engagement Phase, you may choose 1 ship in your firing arc. If you do, that ship engages at initiative 0 instead of its normal initiative value this round."
    },
    "Trandoshan Slaver": {
      text: " "
    },
    "Turr Phennir": {
      text: "After you perform an attack, you may perform a %BARRELROLL% or %BOOST% action, even if you are stressed. %LINEBREAK% AUTOTHRUSTERS: After you perform an action. you may perform a red %BARRELROLL% or a red %BOOST% action."
    },
    "Unkar Plutt": {
      text: "At the start of the Engagement Phase, if there are one or more other ships at range 0, you and each other ship at range 0 gain 1 tractor token. %LINEBREAK% SPACETUG TRACTOR ARRAY: ACTION: Choose a ship in your %FRONTARC% at range 1. That ship gains one tractor token, or 2 tractor tokens if it is in your %BULLSEYEARC% at range 1"
    },
    "Valen Rudor": {
      ship: "Chasseur TIE",
      text: "Après qu’un vaisseau allié à portée 0–1 a défendu (après la résolution des dégâts, s’il y en a), vous pouvez effectuer une action."
    },
    "Ved Foslo": {
      text: "Tant que vous exécutez une manœuvre, vous pouvez exécuter une manœuvre de même direction et de même difficulté mais avec une vitesse supérieure ou inférieure de 1 à la place. %LINEBREAK% Ordinateur de Visée Avancé : tant que vous effectuez une attaque principale contre un défenseur que vous avez verrouillé, lancez 1 dé d’attaque supplémentaire et changez 1 résultat %HIT% en un résultat %CRIT%."
    },
    "Viktor Hel": {
      text: "After you defend, if you did not roll exactly 2 defense dice, the attack gains 1 stress token."
    },
    '"Vizier"': {
      text: "After you fully execute a speed 1 maneuver using your Adaptive Ailerons ship ability, you may perform a %COORDINATE% action. If you do, skip your Perform Action step. %LINEBREAK% ADAPTIVE AILERONS: Before you reveal your dial, if you are not stressed, you MUST execute a white (1 %BANKLEFT%), (1 %STRAIGHT%) or (1 %BANKRIGHT%)"
    },
    '"Wampa"': {
      ship: "Chasseur TIE",
      text: "Tant que vous effectuez une attaque, vous pouvez dépenser 1 %CHARGE% pour lancer 1 dé d’attaque supplémentaire %LINEBREAK% Après avoir défendu, perdez 1 %CHARGE%."
    },
    "Warden Squadron Pilot": {
      text: " "
    },
    "Wedge Antilles": {
      text: "Tant que vous effectuez une attaque, le défenseur lance 1 dé de défense en moins."
    },
    '"Whisper"': {
      text: "After you perform an attack that hits, gain 1 evade token. STYGUM ARRAY: After you decloak, you may perform an %EVADE% action. At the Start of the End Phase, you may spend 1 evade token to gain one cloak token."
    },
    "Wild Space Fringer": {
      text: "SENSOR BLINDSPOT: While you perform a primary attack at range 0-1, do not apply the range 0-1 bonus and roll 1 fewer attack die."
    },
    "Wullffwarro": {
      text: "While you perform a primary attack, if you are damaged, you may roll 1 additional attack die."
    },
    "Zealous Recruit": {
      name: "Recrue Zélée",
      ship: "Chasseur Fang",
      text: "Opposition Concordia : tant que vous défendez, si la portée d’attaque est 1 et que vous êtes dans l’%FRONTARC% de l’attaquant, changez 1 résultat en un résultat %EVADE%."
    },
    '"Zeb" Orrelios': {
      text: "While you defend, %CRIT% results are neutralized before %HIT% results. %LINEBREAK% LOCKED AND LOADED: While you are docked, after your carrier ship performs a primary %FRONTARC% or %TURRET% attack, it may perform a bonus %REARARC% attack"
    },
    '"Zeb" Orrelios (Sheathipede)': {
      text: "While you defend, %CRIT% results are neutralized before %HIT% results. %LINEBREAK% COMMS SHUTTLE: While you are docked, your carrier ship gains %COORDINATE%. Before your carrier shpi activates, it may perform a %COORDINATE% action."
    },
    '"Zeb" Orrelios (TIE Fighter)': {
      ship: "Chasseur TIE",
      text: "While you defend, %CRIT% results are neutralized before %HIT% results."
    },
    "Zertik Strom": {
      text: "Pendant la phase de dénouement, vous pouvez dépenser un marqueur de verrouillage que vous avez sur un vaisseau ennemi pour exposer 1 carte de dégât de ce dernier. %LINEBREAK% Ordinateur de Visée Avancé : tant que vous effectuez une attaque principale contre un défenseur que vous avez verrouillé, lancez 1 dé d’attaque supplémentaire et changez 1 résultat %HIT% en un résultat %CRIT%."
    },
    "Zuckuss": {
      text: "While you perform a primary attack, you may roll 1 additional attack die. If you do, the defender rolls 1 additional defense die."
    },
    "Poe Dameron": {
      text: "After you perform an action, you may spend 1 %CHARGE% to perform a white action, treating it as red. %LINEBREAK% WEAPON HARDPOINT: You can equip 1 %CANNON%, %TORPEDO% or %MISSILE% upgrade."
    },
    "Lieutenant Bastian": {
      text: "After a ship at range 1-2 is dealt a damage card, you may acquire a lock on that ship. %LINEBREAK% WEAPON HARDPOINT: You can equip 1 %CANNON%, %TORPEDO% or %MISSILE% upgrade."
    },
    '"Midnight"': {
      text: "While you defend or perform an attack, if you have a lock on the enemy ship, that ship's dice cannot be modified."
    },
    '"Longshot"': {
      text: "While you perform a primary attack at attack range 3, roll 1 additional attack die."
    },
    '"Muse"': {
      text: "At the start of the Engagement Phase, you may choose a friendly ship at range 0-1. If you do, that ship removes 1 stress token."
    },
    "Kylo Ren": {
      text: " After you defend, you may spend 1 %FORCE% to assign the I'll Show You the Dark Side condition to the attacker. %LINEBREAK% AUTOTHRUSTERS: After you perform an action. you may perform a red %BARRELROLL% or a red %BOOST% action."
    },
    '"Blackout"': {
      text: " ??? %LINEBREAK% AUTOTHRUSTERS: After you perform an action. you may perform a red %BARRELROLL% or a red %BOOST% action."
    },
    "Lieutenant Dormitz": {
      text: " ... are placed, other ... be placed anywhere in ... range 0-2 of you. %LINEBREAK% ... : while you perform a %CANNON% ... additional die. "
    },
    "Tallissan Lintra": {
      text: "While an enemy ship in your %BULLSEYEARC% performs an attack, you may spend 1 %CHARGE%.  If you do, the defender rolls 1 additional die."
    },
    "Lulo Lampar": {
      text: "While you defend or perform a primary attack, if you are stressed, you must roll 1 fewer defense die or 1 additional attack die."
    },
    '"Backdraft"': {
      text: " ... perform a %TURRET% primary ... defender is in your %BACKARC% ... additional dice. %LINEBREAK% ... TURRET: You can... indicator only to your ... must treat the %FRONTARC% ... your equipped %MISSILE% ... as %TURRET%. "
    },
    '"Quickdraw"': {
      text: " ??? %LINEBREAK% ... TURRET: You can... indicator only to your ... must treat the %FRONTARC% ... your equipped %MISSILE% ... as %TURRET%. "
    },
    "Rey": {
      text: " ... perform an attack, ... in your %FRONTARC%, you may ... change 1 of your blank ... or %HIT% result. "
    },
    "Han Solo (Resistance)": {
      text: " ??? "
    },
    "Chewbacca (Resistance)": {
      text: " ??? "
    },
    "Captain Seevor": {
      text: " While you defend or perform an attack, before the attack dice are rolled, if you are not in the enemy ship's %BULLSEYEARC%, you may spend 1 %CHARGE%. If you do, the enemy ship gains one jam token. "
    },
    "Mining Guild Surveyor": {
      text: " "
    },
    "Ahhav": {
      text: " ??? "
    },
    "Finch Dallow": {
      text: " ... drop a bomb, you ... play area touching ... instead. "
    }
  };
  upgrade_translations = {
    "0-0-0": {
      text: "<i>Requires: Scum or Darth Vader</i> %LINEBREAK% At the start of the Engagement Phase, you may choose 1 enemy ship at range 0-1. If you do, you gain 1 calculate token unless that ship chooses to gain 1 stress token."
    },
    "4-LOM": {
      text: "While you perform an attack, after rolling attack dice, you may name a type of green token. If you do, gain 2 ion tokens and, during this attack, the defender cannot spend tokens of the named type."
    },
    "Ablative Plating": {
      text: "<i>Requires: Medium or Large Base</i> %LINEBREAK% Before you would suffer damage from an obstacle or from a friendly bomb detonating, you may spend 1 %CHARGE%. If you do, prevent 1 damage."
    },
    "Admiral Sloane": {
      text: "After another friendly ship at range 0-3 defends, if it is destroyed, the attacker gains 2 stress tokens. While a friendly ship at range 0-3 performs an attack against a stressed ship, it may reroll 1 attack die."
    },
    "Adv. Proton Torpedoes": {
      text: "Attack (%LOCK%): Spend 1 %CHARGE%. Change 1 %HIT% result to a %CRIT% result."
    },
    "Advanced Sensors": {
      text: "After you reveal your dial, you may perform 1 action. If you do, you cannot perform another action during your activation."
    },
    "Advanced SLAM": {
      text: "<i>Requires: %SLAM%</i> %LINEBREAK% After you perform a %SLAM% action, if you fully executed that maneuver, you may perform a white action on your action bar, treating that action as red."
    },
    "Afterburners": {
      name: "Postcombustion",
      text: "<i>Requiert : petit vaisseau</i> %LINEBREAK% Après avoir entièrement exécuté une manœuvre à vitesse 3–5, vous pouvez dépenser 1 %CHARGE% pour effectuer une action %BOOST%, même tant que vous êtes stressé."
    },
    "Agent Kallus": {
      text: "Setup: Assign the Hunted condition to 1 enemy ship. While you perform an attack against th eship with the Hunted condition, you may change 1 of your %FOCUS% results to a %HIT% result."
    },
    "Agile Gunner": {
      name: "Canonnier adroit",
      text: "Pendant la phase de dénouement, vous pouvez faire pivoter votre indicateur %SINGLETURRETARC%."
    },
    "Andrasta": {
      text: "<i>Ajoute : %RELOAD%</i> %LINEBREAK% Ajoutez un emplacement %DEVICE%."
    },
    "Barrage Rockets": {
      text: "Attack (%FOCUS%): Spend 1 %CHARGE%. If the defender is in your %BULLSEYEARC%, you may spend 1 or more %CHARGE% to reroll that many attack dice."
    },
    "Baze Malbus": {
      text: "While you perform a %FOCUS% action, you may treat it as red. If you do, gain 1 additional focus token for each enemy ship at range 0-1 to a maximum of 2."
    },
    "Bistan": {
      text: "After you perform a primary attack, if you are focused, you may perform a bonus %SINGLETURRETARC% attack against a ship you have not already attacked this round."
    },
    "Boba Fett": {
      text: "Mise en Place : débutez en réserve. %LINEBREAK% À la fin de la Mise en place, placez-vous à portée 0 d’un obstacle et au-delà de la portée 3 de tout vaisseau ennemi."
    },
    "Bomblet Generator": {
      text: "Bomb During the System Phase, you may spend 1 %CHARGE% to drop a Bomblet with the [1 %STRAIGHT%] template. At the start of the Activation Phase, you may spend 1 shield to recover 2 %CHARGE%."
    },
    "Bossk": {
      text: "After you perform a primary attack that misses, if you are not stressed you must receive 1 stress token to perform a bonus primary attack against the same target."
    },
    "BT-1": {
      text: "<i>Requires: Scum or Darth Vader</i> %LINEBREAK% While you perform an attack, you may change 1 %HIT% result to a %CRIT% result for each stress token the defender has."
    },
    "C-3PO": {
      text: "<i>Adds: %CALCULATE%</i> %LINEBREAK% Before rolling defense dice, you may spend 1 calculate token to guess aloud a number 1 or higher. If you do, and you roll exactly that many %EVADE% results, add 1 %EVADE% result. After you perform the %CALCULATE% action, gain 1 calculate token."
    },
    "Cad Bane": {
      text: "After you drop or launch a device, you may perform a red %BOOST% action."
    },
    "Cassian Andor": {
      text: "During the System Phase, you may choose 1 enemy ship at range 1-2 and guess aloud a bearing and speed, then look at that ship's dial. If the chosen ship's bearing and speed match your guess, you may set your dial to another maneuver."
    },
    "Chewbacca": {
      text: "At the start of the Engagement Phase, you may spend 2 %CHARGE% to repair 1 faceup damage card."
    },
    "Chewbacca (Scum)": {
      name: "Chewbacca (Racailles)",
      text: "Au début de la phase de dénouement, vous pouvez dépenser 1 marqueur de concentration pour réparer 1 de vos cartes de dégât face visible."
    },
    '"Chopper" (Astromech)': {
      text: "Action: Spend 1 non-recurring %CHARGE% from another equipped upgrade to recover 1 shield. Action: Spend 2 shields to recover 1 non-recurring %CHARGE% on an equipped upgrade."
    },
    '"Chopper" (Crew)': {
      text: "During the Perform Action step, you may perform 1 action, even while stressed. After you perform an action while stressed, suffer 1 %HIT% damage unless you expose 1 of your damage cards."
    },
    "Ciena Ree": {
      text: "<i>Requires: %COORDINATE%</i> %LINEBREAK% After you perform a %COORDINATE% action, if the ship you coordinated performed a %BARRELROLL% or %BOOST% action, it may gain 1 stress token to rotate 90˚."
    },
    "Cikatro Vizago": {
      text: "During the End Phase, you may choose 2 %ILLICIT% upgrades equipped to friendly ships at range 0-1. If you do, you may exchange these upgrades. End of Game: Return all %ILLICIT% upgrades to their original ships."
    },
    "Cloaking Device": {
      text: "<i>Requires: Small or Medium Base</i> %LINEBREAK% Action: Spend 1 %CHARGE% to perform a %CLOAK% action. At the start of the Planning Phase, roll 1 attack die. On a %FOCUS% result, decloak or discard your cloak token."
    },
    "Cluster Missiles": {
      name: "Missiles groupés",
      text: "Attaque (%LOCK%): dépensez 1 %CHARGE%. Après cette attaque, vous pouvez effectuer cette attaque en tant qu’attaque bonus contre une cible différente à portée 0–1 du défenseur, en ignorant le prérequis %LOCK%."
    },
    "Collision Detector": {
      text: "While you boost or barrel roll, you can move through and overlap obstacles. After you move through or overlap an obstacle, you may spend 1 %CHARGE% to ignore its effects until the end of the round."
    },
    "Composure": {
      name: "Maîtrise de soi",
      text: "<i>Requiert : %FOCUS%</i> %LINEBREAK% Après avoir échoué à une action, si vous n’avez aucun marqueur vert, vous pouvez effectuer une action %FOCUS%."
    },
    "Concussion Missiles": {
      name: "Missiles à concussion",
      text: "Attaque (%LOCK%) : dépensez 1 %CHARGE%. Après que cette attaque a touché, chaque vaisseau à portée 0–1 du défenseur expose 1 de ses cartes de dégât."
    },
    "Conner Nets": {
      text: "Mine During the System Phase, you may spend 1 %CHARGE% to drop a Conner Net using the [1 %STRAIGHT%] template. This card's %CHARGE% cannot be recovered."
    },
    "Contraband Cybernetics": {
      text: "Before you activate, you may spend 1 %CHARGE%. If you do, until the end of the round, you can perform actions and execute red maneuvers, even while stressed."
    },
    "Crack Shot": {
      name: "Tireur hors pair",
      text: "Tant que vous effectuez une attaque principale, si le défenseur est dans votre %BULLSEYEARC%, avant l’étape « Neutraliser les résultats », vous pouvez dépenser 1 %CHARGE% pour annuler 1 résultat %EVADE%."
    },
    "Daredevil": {
      name: "Casse-cou",
      text: "<i>Requiert : Vaisseau petit, %BOOST% blanche</i> %LINEBREAK% ant que vous effectuez une action %BOOST% blanche, vous pouvez considérer qu’elle est rouge pour utiliser le gabarit [1 %TURNLEFT%] ou [1 %TURNRIGHT%] à la place."
    },
    "Darth Vader": {
      text: "At the start of the Engagement Phase, you may choose 1 ship in your firing arc at range 0-2 and spend 1 %FORCE%. If you do, that ship suffers 1 %HIT% damage unless it chooses to remove 1 green token."
    },
    "Dauntless": {
      text: "After you partially execute a maneuver, you may perform 1 white action, treating that action as red."
    },
    "Deadman's Switch": {
      text: "After you are destroyed, each other ship at range 0-1 suffers 1 %HIT% damage."
    },
    "Death Troopers": {
      text: "During the Activation Phase, enemy ships at range 0-1 cannot remove stress tokens."
    },
    "Debris Gambit": {
      text: "<i>Requires: Small or Medium Base. Adds: <r>%EVADE%</r></i> %LINEBREAK% While you perform a red %EVADE% action, if there is an obstacle at range 0-1, treat the action as white instead."
    },
    "Dengar": {
      text: "After you defend, if the attacker is in your firing arc, you may spend 1 %CHARGE%. If you do, roll 1 attack die unless the attacker chooses to remove 1 green token. On a %HIT% or %CRIT% result, the attacker suffers 1 %HIT% damage."
    },
    "Director Krennic": {
      text: "<i>Adds: %LOCK%</i> %LINEBREAK% Setup: Before placing forces, assign the Optimized Prototype condition to another friendly ship."
    },
    "Dorsal Turret": {
      text: "<i>Adds: %ROTATEARC%</i> %LINEBREAK%"
    },
    "Electronic Baffle": {
      text: "During the End Phase, you may suffer 1 %HIT% damage to remove 1 red token."
    },
    "Elusive": {
      name: "Insaisissable",
      text: "<i>Requiert : base petite ou moyenne</i> %LINEBREAK% Tant que vous défendez, vous pouvez dépenser 1 %CHARGE% pour relancer 1 dé de défense. %LINEBREAK% Après avoir entièrement exécuté une manœuvre rouge, récupérez 1 %CHARGE%."
    },
    "Emperor Palpatine": {
      text: "While another friendly ship defends or performs an attack, you may spend 1 %FORCE% to modify 1 of its dice as though that ship had spent 1 %FORCE%."
    },
    "Engine Upgrade": {
      text: "<i>Requires: <r>%BOOST%</r>. Adds: %BOOST% %LINEBREAK% This upgrade has a variable cost, worth 3, 6, or 9 points depending on if the ship base is small, medium or large respectively.</i>"
    },
    "Expert Handling": {
      name: "As de l'espace",
      text: "<i>Requiert : <r>%BARRELROLL%</r>. Ajoute : %BARRELROLL% %LINEBREAK% Cette amélioration a un coût variable, de 2, 4, ou 6 points selon si le vaisseau a une base respectivement petite, moyenne ou grande.</i>"
    },
    "Ezra Bridger": {
      text: "After you perform a primary attack, you may spend 1 %FORCE% to perform a bonus %SINGLETURRETARC% attack from a %SINGLETURRETARC% you have not attacked from this round. If you do and you are stressed, you may reroll 1 attack die."
    },
    "Fearless": {
      name: "Intrépide",
      text: "Tant que vous effectuez une attaque principale %FRONTARC%, si la portée d’attaque est 1 et que vous êtes dans l’%FRONTARC% du défenseur, vous pouvez changer 1 de vos résultats en un résultat %HIT%."
    },
    "Feedback Array": {
      text: "Before you engage, you may gain 1 ion token and 1 disarm token. If you do, each ship at range 0 suffers 1 %HIT% damage."
    },
    "Fifth Brother": {
      text: "While you perform an attack, you may spend 1 %FORCE% to change 1 of your %FOCUS% results to a %CRIT% result."
    },
    "Fire-Control System": {
      name: "Système de contrôle de tir",
      text: "Tant que vous effectuez une attaque, si vous avez un verrouillage sur le défenseur, vous pouvez relancer 1 dé d’attaque. Dans ce cas, vous ne pouvez pas dépenser votre marqueur de verrouillage pendant cette attaque."
    },
    "Freelance Slicer": {
      text: "While you defend, before attack dice are rolled, you may spend a lock you have on the attacker to roll 1 attack die. If you do, the attacker gains 1 %JAM% token. Then, on a %HIT% or %CRIT% result, gain 1 %JAM% token."
    },
    '"Genius"': {
      text: "After you fully execute a maneuver, if you have not dropped or launched a device this round, you may drop 1 bomb."
    },
    "Ghost": {
      text: "You can dock 1 attack shuttle or Sheathipede-class shuttle. Your docked ships can deploy only from your rear guides."
    },
    "Grand Inquisitor": {
      text: "After an enemy ship at range 0-2 reveals its dial, you may spend 1 %FORCE% to perform 1 white action on your action bar, treating that action as red."
    },
    "Grand Moff Tarkin": {
      text: "<i>Requires: %LOCK%</i> %LINEBREAK% During the System Phase, you may spend 2 %CHARGE%. If you do, each friendly ship may acquire a lock on a ship that you have locked."
    },
    "Greedo": {
      text: "While you perform an attack, you may spend 1 %CHARGE% to change 1 %HIT% result to a %CRIT% result. While you defend, if your %CHARGE% is active, the attacker may change 1 %HIT% result to a %CRIT% result."
    },
    "Han Solo": {
      text: "During the Engagement Phase, at initiative 7, you may perform a %SINGLETURRETARC% attack. You cannot attack from that %SINGLETURRETARC% again this round."
    },
    "Han Solo (Scum)": {
      name: "Han Solo (Racailles)",
      text: "Avant de vous engager, vous pouvez effectuer une action %FOCUS% rouge."
    },
    "Havoc": {
      text: "Remove %CREW% slot. Add %SENSOR% and %ASTROMECH% slots."
    },
    "Heavy Laser Cannon": {
      name: "Canon Laser Lourd",
      text: "Attaque : après l’étape « Modifier les dés d’attaque », changez tous les résultats %CRIT% en résultats %HIT%."
    },
    "Heightened Perception": {
      name: "Perception renforcée",
      text: "Au début de la phase d’engagement, vous pouvez dépenser 1 %FORCE%. Dans ce cas, pendant cette phase, engagez-vous à l’initiative 7 au lieu de le faire à votre valeur d’initiative standard."
    },
    "Hera Syndulla": {
      text: "You can execute red maneuvers even while stressed. After you fully execute a red maneuver, if you have 3 or more stress tokens, remove 1 stress token and suffer 1 %HIT% damage."
    },
    "Homing Missiles": {
      text: "Attack (%LOCK%): Spend 1 %CHARGE%. After you declare the defender, the defender may choose to suffer 1 %HIT% damage. If it does, skip the Attack and Defense Dice steps and the attack is treated as hitting."
    },
    "Hotshot Gunner": {
      text: "While you perform a %SINGLETURRETARC% attack, after the Modify Defense Dice step, the defender removes 1 focus or calculate token."
    },
    "Hound's Tooth": {
      text: "1 Z-95 AF4 headhunter can dock with you."
    },
    "Hull Upgrade": {
      name: "Coque améliorée",
      text: "Augmente la valeur de coque de 1. %LINEBREAK%<i>Cette amélioration a un coût variable, de 2, 3, 5, ou 7 points selon si l'agilité du vaisseau est respectivement de 0, 1, 2, ou 3.</i>"
    },
    "IG-2000": {
      text: "You have the pilot ability of each other friendly ship with the IG-2000 upgrade."
    },
    "IG-88D": {
      text: "<i>Adds: %CALCULATE%</i> %LINEBREAK% You have the pilot ability of each other friendly ship with the IG-2000 upgrade. After you perform a %CALCULATE% action, gain 1 calculate token. ADVANCED DROID BRAIN: After you perform a %CALCULATE% action, gain 1 calculate token."
    },
    "Inertial Dampeners": {
      name: "Amortisseurs inertiels",
      text: "Avant d’exécuter une manœuvre, vous pouvez dépenser 1 bouclier. Dans ce cas, exécutez une manœuvre [0 %STOP%] blanche à la place de celle que vous avez révélée, puis gagnez 1 marqueur de stress."
    },
    "Informant": {
      text: "Setup: After placing forces, choose 1 enemy ship and assign the Listening Device condition to it."
    },
    "Instinctive Aim": {
      name: "Visée instinctive",
      text: "Tant que vous effectuez une attaque spéciale, vous pouvez dépenser 1 %FORCE% pour ignorer le prérequis %FOCUS% ou %LOCK%."
    },
    "Intimidation": {
      text: "Tant qu’un vaisseau ennemi à portée 0 défend, il lance un dé de défense en moins."
    },
    "Ion Cannon Turret": {
      name: "Tourelle à canon ioniques",
      text: "<i>Ajoute : %ROTATEARC%</i> %LINEBREAK% Attaque : si cette attaque touche, dépensez 1 résultat %HIT% ou %CRIT% pour faire subir 1 dégât %HIT% au défenseur. Tous les résultats %HIT%/%CRIT% restants infligent des marqueurs ioniques au lieu des dégâts."
    },
    "Ion Cannon": {
      text: "Attack: If this attack hits, spend 1 %HIT% or %CRIT% result to cause the defender to suffer 1 %HIT% damage. All remaining %HIT%/%CRIT% results inflict ion tokens instead of damage."
    },
    "Ion Missiles": {
      text: "Attack (%LOCK%): Spend 1 %CHARGE%. If this attack hits, spend 1 %HIT% or %CRIT% result to cause the defender to suffer 1 %HIT% damage. All remaining %HIT%/%CRIT% results inflict ion tokens instead of damage."
    },
    "Ion Torpedoes": {
      name: "Torpilles Ioniques",
      text: "Attaque (%LOCK%): dépensez 1 %CHARGE%. Si cette attaque touche, dépensez 1 résultat %HIT% ou %CRIT% pour faire subir 1 dégât %HIT% au défenseur. Tous les résultats %HIT%/%CRIT% restants infligent des marqueurs ioniques au lieu des dégâts."
    },
    "ISB Slicer": {
      text: "During the End Phase, enemy ships at range 1-2 cannot remove jam tokens."
    },
    "Jabba the Hutt": {
      text: "During the End Phase, you may choose 1 friendly ship at range 0-2 and spend 1 %CHARGE%. If you do, that ship recovers 1 %CHARGE% on 1 of its equipped %ILLICIT% upgrades."
    },
    "Jamming Beam": {
      text: "Attack: If this attack hits, all %HIT%/%CRIT% results inflict jam tokens instead of damage."
    },
    "Juke": {
      name: "Feinte",
      text: "<i>Requiert : vaisseau petit ou moyen</i> %LINEBREAK% Tant que vous effectuez une attaque, si vous avez un marqueur d’évasion, vous pouvez changer 1 des résultats %EVADE% du défenseur en un résultat %FOCUS%."
    },
    "Jyn Erso": {
      text: "If a friendly ship at range 0-3 would gain a focus token, it may gain 1 evade token instead."
    },
    "Kanan Jarrus": {
      text: "After a friendly ship at range 0-2 fully executes a white maneuver, you may spend 1 %FORCE% to remove 1 stress token from that ship."
    },
    "Ketsu Onyo": {
      text: "At the start of the End Phase, you may choose 1 enemy ship at range 0-2 in your firing arc. If you do, that ship does not remove its tractor tokens."
    },
    "L3-37": {
      text: "<b>L3-37:</b> Mise en Place : équipez-vous avec cette face visible. %LINEBREAK% Tant que vous défendez, vous pouvez retourner cette carte. Dans ce cas, l’attaquant doit relancer tous les dés d’attaque."
    },
    "Lando Calrissian": {
      text: "Action: Roll 2 defense dice. For each %FOCUS% result, gain 1 focus token. For each %EVADE% result, gain 1 evade token. If both results are blank, the opposing player chooses focus or evade. You gain 1 token of that type."
    },
    "Lando Calrissian (Scum)": {
      name: "Lando Calrissian (Racailles)",
      text: "Après avoir lancé des dés, vous pouvez dépenser 1 marqueur vert pour relancer jusqu’à 2 de vos résultats."
    },
    "Lando's Millennium Falcon": {
      text: "1 Vaisseau de secours peut s’arrimer à vous. %LINEBREAK% Tant que vous avez un Vaisseau de secours arrimé, vous pouvez dépenser ses boucliers comme s’ils étaient sur votre carte de vaisseau. %LINEBREAK% Tant que vous effectuez une attaque principale contre un vaisseau stressé, lancez 1 dé d’attaque supplémentaire."
    },
    "Latts Razzi": {
      text: "While you defend, if the attacker is stressed, you may remove 1 stress from the attacker to change 1 of your blank/%FOCUS% results to an %EVADE% result."
    },
    "Leia Organa": {
      text: "At the start of the Activation Phase, you may spend 3 %CHARGE%. During this phase, each friendly ship reduces the difficulty of its red maneuvers."
    },
    "Lone Wolf": {
      name: "Loup solitaire",
      text: "Tant que vous défendez ou que vous effectuez une attaque, s’il n’y a aucun autre vaisseau allié à portée 0–2, vous pouvez dépenser 1 %CHARGE% pour relancer 1 de vos dés."
    },
    "Luke Skywalker": {
      text: "At the start of the Engagement Phase, you may spend 1 %FORCE% to rotate your %SINGLETURRETARC% indicator."
    },
    "Magva Yarro": {
      text: "After you defend, if the attack hit, you may acquire a lock on the attacker."
    },
    "Marauder": {
      name: "Marauder",
      text: "Tant que vous effectuez une attaque principale %REARARC%, vous pouvez relancer 1 dé d’attaque. %LINEBREAK% Ajoutez un emplacement %GUNNER%."
    },
    "Marksmanship": {
      name: "Adresse au tir",
      text: "Tant que vous effectuez une attaque, si le défenseur est dans votre %BULLSEYEARC%, vous pouvez changer 1 résultat %HIT% en un résultat %CRIT%."
    },
    "Maul": {
      text: "<i>Requires: Scum or Ezra Bridger</i> %LINEBREAK% After you suffer damage, you may gain 1 stress token to recover 1 %FORCE%. You can equip \"Dark Side\" upgrades."
    },
    "Millennium Falcon": {
      text: "<i>Adds: %EVADE%</i> %LINEBREAK% While you defend, if you are evading, you may reroll 1 defense die."
    },
    "Minister Tua": {
      text: "At the start of the Engagement Phase, if you are damaged, you may perform a red %REINFORCE% action."
    },
    "Mist Hunter": {
      text: "<i>Adds: %BARRELROLL% </i> %LINEBREAK% Add %CANNON% slot."
    },
    "Moff Jerjerrod": {
      text: "<i>Requires: %COORDINATE%</i> %LINEBREAK% During the System Phase, you may spend 2 %CHARGE%. If you do, choose the (1 %BANKLEFT%), (1 %STRAIGHT%), or (1 %BANKRIGHT%) template. Each friendly ship may perform a red %BOOST% action using that template."
    },
    "Moldy Crow": {
      text: "Gain a %FRONTARC% primary weapon with a value of \"3.\" During the End Phase, do not remove up to 2 focus tokens."
    },
    "Munitions Failsafe": {
      text: "While you perform a %TORPEDO% or %MISSILE% attack, after rolling attack dice, you may cancel all dice results to recover 1 %CHARGE% you spent as a cost for the attack."
    },
    "Nien Nunb": {
      text: "Decrease the difficulty of your bank maneuvers [%BANKLEFT% and %BANKRIGHT%]."
    },
    "Novice Technician": {
      text: "At the end of the round, you may roll 1 attack die to repair 1 faceup damage card. Then, on a %HIT% result, expose 1 damage card."
    },
    "Os-1 Arsenal Loadout": {
      text: "While you have exactly 1 disarm token, you can still perform %TORPEDO% and %MISSILE% attacks against targets you have locked. If you do, you cannot spend you lock during the attack. Add %TORPEDO% and %MISSILE% slots."
    },
    "Outmaneuver": {
      name: "Manoeuvre improbable",
      text: "Tant que vous effectuez une attaque %FRONTARC%, si vous n’êtes pas dans l’arc de tir du défenseur, il lance 1 dé de défense en moins."
    },
    "Outrider": {
      text: "While you perform an attack that is obstructed by an obstacle, the defender rolls 1 fewer defense die. After you fully execute a maneuver, if you moved through or overlapped an obstacle, you may remove 1 of your red or orange tokens."
    },
    "Perceptive Copilot": {
      name: "Copilote perspicace",
      text: "Après avoir effectué une action %FOCUS%, gagnez 1 marqueur de concentration."
    },
    "Phantom": {
      text: "You can dock at range 0-1."
    },
    "Pivot Wing": {
      text: "<b>Closed:</b> While you defend, roll 1 fewer defense die. After you execute a [0 %STOP%] maneuver, you may rotate your ship 90˚ or 180˚. Before you activate, you may flip this card %LINEBREAK% <b>Open:</b> Before you activate, you may flip this card"
    },
    "Predator": {
      name: "Prédateur",
      text: "Tant que vous effectuez une attaque principale, si le défenseur est dans votre %BULLSEYEARC%, vous pouvez relancer 1 dé d’attaque."
    },
    "Proton Bombs": {
      name: "Bombe à protons",
      text: "<b>Bombe</b> %LINEBREAK% Pendant la phase de système, vous pouvez dépenser 1 %CHARGE% pour larguer une bombe à protons en utilisant le gabarit [1 %STRAIGHT%]."
    },
    "Proton Rockets": {
      text: "Attack (%FOCUS%): Spend 1 %CHARGE%."
    },
    "Proton Torpedoes": {
      name: "Torpilles à protons",
      text: "Attaque (%LOCK%): dépensez 1 %CHARGE%. Changez 1 résultat %HIT% en un résultat %CRIT%."
    },
    "Proximity Mines": {
      name: "Mines de proximité",
      text: "<b>Mine</b> %LINEBREAK% Pendant la phase de système, vous pouvez dépenser 1 %CHARGE% pour larguer une mine de proximité en utilisant le gabarit [1 %STRAIGHT%]. %LINEBREAK% Les %CHARGE% de cette carte ne peuvent pas être récupérées."
    },
    "Punishing One": {
      text: "When you perform a primary attack, if the defender is in your %FRONTARC%, roll 1 additional attack die. Remove %CREW% slot. Add %ASTROMECH% slot."
    },
    "Qi'ra": {
      text: "Tant que vous vous déplacez et effectuez des attaques, vous ignorez les obstacles que vous verrouillez."
    },
    "R2 Astromech": {
      name: "Astromech R2",
      text: "Après avoir révélé votre cadran, vous pouvez dépenser 1 %CHARGE% et gagner 1 marqueur de désarmement pour récupérer 1 bouclier."
    },
    "R2-D2": {
      text: "Après avoir révélé votre cadran, vous pouvez dépenser 1 %CHARGE% et gagner 1 marqueur de désarmement pour récupérer 1 bouclier."
    },
    "R2-D2 (Crew)": {
      text: "During the End Phase, if you are damaged and not shielded, you may roll 1 attack die to recover 1 shield. On a %HIT% result, expose 1 of your damage cards."
    },
    "R3 Astromech": {
      name: "Astromech R3",
      text: "Vous pouvez maintenir jusqu’à 2 cibles verrouillées. Chaque verrouillage doit être sur un objet différent. %LINEBREAK% Après avoir effectué une action %LOCK%, vous pouvez verrouiller une cible."
    },
    "R4 Astromech": {
      text: "<i>Requiert : vaisseau petit</i> %LINEBREAK% Diminuez la difficulté de vos manœuvres de base (%TURNLEFT%, %BANKLEFT%, %STRAIGHT%, %BANKRIGHT%, %TURNRIGHT%) ayant une vitesse 1–2."
    },
    "R5 Astromech": {
      name: "Astromech R5",
      text: "Action : dépensez 1 %CHARGE% pour réparer 1 carte de dégât face cachée. %LINEBREAK% Action : réparez 1 carte de dégât Vaisseau face visible."
    },
    "R5-D8": {
      text: "Action : dépensez 1 %CHARGE% pour réparer 1 carte de dégât face cachée. %LINEBREAK% Action : réparez 1 carte de dégât Vaisseau face visible."
    },
    "R5-P8": {
      text: "While you perform an attack against a defender in your %FRONTARC%, you may spend 1 %CHARGE% to reroll 1 attack die. If the rerolled results is a %CRIT%, suffer 1 %CRIT% damage."
    },
    "R5-TK": {
      text: "You can perform attacks against friendly ships."
    },
    "Rigged Cargo Chute": {
      name: "Largage de cargaison",
      text: "<i>Requiert : vaisseau moyen ou grand</i> %LINEBREAK% Action : dépensez 1 %CHARGE%. Larguez 1 cargaison égarée en utilisant le gabarit [1 %STRAIGHT%]."
    },
    "Ruthless": {
      name: "Impitoyable",
      text: "Tant que vous effectuez une attaque, vous pouvez choisir un autre vaisseau allié à portée 0–1 du défenseur. Dans ce cas, le vaisseau choisi subit 1 dégât %HIT% et vous pouvez changer 1 de vos résultats de dé en un résultat %HIT%."
    },
    "Sabine Wren": {
      text: "Setup: Place 1 ion, 1 jam, 1 stress, and 1 tractor token on this card. After a ship suffers the effect of a friendly bomb, you may remove 1 ion, jam, stress, or tractor token from this card. If you do, that ship gains a matching token."
    },
    "Saturation Salvo": {
      text: "<i>Requires: %RELOAD%</i> %LINEBREAK% While you perform a %TORPEDO% or %MISSILE% attack, you may spend 1 charge from that upgrade. If you do, choose two defense dice. The defender must reroll those dice."
    },
    "Saw Gerrera": {
      text: "While you perform an attack, you may suffer 1 %HIT% damage to change all of your %FOCUS% results to %CRIT% results."
    },
    "Seasoned Navigator": {
      name: "Navigateur chevronné",
      text: "Après avoir révélé votre cadran de manœuvres, vous pouvez régler votre cadran sur une autre manœuvre non-rouge de même vitesse. Tant que vous exécutez cette manœuvre, augmentez sa difficulté."
    },
    "Seismic Charges": {
      name: "Charges sismiques",
      text: "<b>Bombe</b> %LINEBREAK% Pendant la phase de système, vous pouvez dépenser 1 %CHARGE% pour larguer une charge sismique en utilisant le gabarit [1 %STRAIGHT%]."
    },
    "Selfless": {
      name: "Altruisme",
      text: "Tant qu’un autre vaisseau allié à portée 0–1 défend, avant l’étape « Neutraliser les résultats », si vous êtes dans l’arc de l’attaque, vous pouvez subir 1 dégât %CRIT% pour annuler 1 résultat %HIT%."
    },
    "Sense": {
      name: "Sens",
      text: "Pendant la phase de système, vous pouvez choisir 1 vaisseau à portée 0–1 et regarder son cadran. Si vous dépensez 1 %FORCE%, vous pouvez choisir un vaisseau à portée 0–3 à la place."
    },
    "Servomotor S-Foils": {
      name: "Servomoteur S-Foils",
      text: "<b>Replié:</b> Tant que vous effectuez une attaque principale, lancez 1 dé d'attaque en moins. Avant votre activation, vous pouvez retourner cette carte. %LINEBREAK% <i>Ajoute : %BOOST%, %FOCUS% > <r>%BOOST%</r></i> %LINEBREAK% <b>Déplié:</b> Avant votre activation, vous pouvez retourner cette carte."
    },
    "Seventh Sister": {
      text: "If an enemy ship at range 0-1 would gain a stress token, you may spend 1 %FORCE% to have it gain 1 jam or tractor token instead."
    },
    "Shadow Caster": {
      text: "After you perform an attack that hits, if the defender is in your %SINGLETURRETARC% and your %FRONTARC%, the defender gains 1 tractor token."
    },
    "Shield Upgrade": {
      name: "Boucliers améliorés",
      text: "Ajoute la valeur de bouclier de 1. %LINEBREAK%<i>Cette amélioration a un coût variable, de 3, 4, 6, ou 8 points selon si l'agilité du vaisseau est respectivement de 0, 1, 2, ou 3.</i>"
    },
    "Skilled Bombardier": {
      text: "If you would drop or launch a device, you may use a template of the same bearing with a speed 1 higher or lower."
    },
    "Slave I": {
      text: "Après avoir révélé une manœuvre de virage (%TURNLEFT% or %TURNRIGHT%) ou de virage sur l’aile (%BANKLEFT% or %BANKRIGHT%), vous pouvez régler votre cadran sur la manœuvre de même vitesse mais de direction opposée. %LINEBREAK% Ajoutez un emplacement %TORPEDO%."
    },
    "Squad Leader": {
      name: "Chef d'escouade",
      text: "<i>Ajoute : <r>%COORDINATE%</r></i> %LINEBREAK% Tant que vous coordonnez, le vaisseau que vous avez choisi peut effectuer une action seulement si celle-ci est également dans votre barre d’action."
    },
    "ST-321": {
      text: "After you perform a %COORDINATE% action, you may choose an enemy ship at range 0-3 of the ship you coordinated. If you do, acquire a lock on that enemy ship, ignoring range restrictions."
    },
    "Static Discharge Vanes": {
      text: "Before you would gain 1 ion or jam token, if you are not stressed, you may choose another ship at range 0–1 and gain 1 stress token. If you do, the chosen ship gains that ion or jam token instead."
    },
    "Stealth Device": {
      name: "Système d'occulation",
      text: "Tant que vous défendez, si votre %CHARGE% est active, lancez 1 dé de défense supplémentaire. %LINEBREAK% Après avoir subi des dégâts, perdez 1 %CHARGE%. %LINEBREAK%<i>Cette amélioration a un coût variable, de 3, 4, 6, ou 8 points selon si l'agilité du vaisseau est respectivement de 0, 1, 2, ou 3.</i>"
    },
    "Supernatural Reflexes": {
      name: "Réflexes surnaturels",
      text: "<i>Requiert : petit vaisseau</i> %LINEBREAK% Avant votre activation, vous pouvez dépenser 1 %FORCE% pour effectuer une action %BARRELROLL% ou %BOOST%. Puis, si vous avez effectué une action qui n’est pas dans votre barre d’action, subissez 1 dégât %HIT%."
    },
    "Swarm Tactics": {
      text: "At the start of the Engagement Phase, you may choose 1 friendly ship at range 1. If you do, that ship treats its initiative as equal to yours until the end of the round."
    },
    "Tactical Officer": {
      text: "<i>Requires: <r>%COORDINATE%</r>. Adds: %COORDINATE%</i>"
    },
    "Tactical Scrambler": {
      name: "Brouilleur tactique",
      text: "<i>Requiert : vaisseau moyen ou grand</i> %LINEBREAK% Tant que vous gênez l’attaque d’un vaisseau ennemi, le défenseur lance 1 dé de défense supplémentaire."
    },
    "Tobias Beckett": {
      text: "Mise en Place : après avoir placé les forces, vous pouvez choisir 1 obstacle dans la zone de jeu. Dans ce cas, placez-le n’importe où dans la zone de jeu au-delà de la portée 2 de tout bord ou vaisseau et au-delà de la portée 1 de tout autre obstacle."
    },
    "Tractor Beam": {
      text: "Attack: If this attack hits, all %HIT%/%CRIT% results inflict tractor tokens instead of damage."
    },
    "Trajectory Simulator": {
      text: "During the System Phase, if you would drop or launch a bomb, you may launch it using the (5 %STRAIGHT%) tempplate instead."
    },
    "Trick Shot": {
      text: "While you perform an attack that is obstructed by an obstacle, roll 1 additional attack die."
    },
    "Unkar Plutt": {
      text: "After you partially excute a maneuver, you may suffer 1 %HIT% damage to perform 1 white action."
    },
    "Veteran Tail Gunner": {
      name: "Artilleur de poupe vétéran",
      text: "<i>Requiert : %REARARC%</i> %LINEBREAK% Après avoir effectué une attaque principale %FRONTARC%, vous pouvez effectuer une attaque principale %REARARC% bonus."
    },
    "Veteran Turret Gunner": {
      name: "Artilleur de tourelle vétéran",
      text: "<i>Requiert : %ROTATEARC%</i> %LINEBREAK% Après avoir effectué une attaque principale, vous pouvez effectuer une attaque bonus %SINGLETURRETARC% en utilisant une %SINGLETURRETARC% que vous n’avez pas déjà utilisée pour attaquer à ce round."
    },
    "Virago": {
      text: "During the End Phase, you may spend 1 %CHARGE% to perform a red %BOOST% action. Add %MODIFICATION% slot."
    },
    "Xg-1 Assault Configuration": {
      text: "While you have exactly 1 disarm token, you can still perform %CANNON% attacks. While you perform a %CANNON% attack while disarmed, roll a maximum of 3 attack dice. Add %CANNON% slot."
    },
    '"Zeb" Orrelios': {
      text: "You can perform primary attacks at range 0. Enemy ships at range 0 can perform primary attacks against you."
    },
    "Zuckuss": {
      text: "While you perform an attack, if you are not stressed, you may choose 1 defense die and gain 1 stress token. If you do, the defender must reroll that die."
    },
    'GNK "Gonk" Droid': {
      text: "Setup: Lose 1 %CHARGE%. Action: Recover 1 %CHARGE%. Action: Spend 1 %CHARGE% to recover 1 shield."
    },
    "Hardpoint: Cannon": {
      text: "Adds a %CANNON% slot"
    },
    "Hardpoint: Missile": {
      text: "Adds a %MISSILE% slot"
    },
    "Hardpoint: Torpedo": {
      text: "Adds a %TORPEDO% slot"
    },
    "Black One": {
      text: "<i>Adds: %SLAM%</i> %LINEBREAK% After you perform a %SLAM% action, lose 1 %CHARGE%. Then you may gain 1 ion token to remove 1 disarm token. %LINEBREAK% If your charge is inactive, you cannot perform the %SLAM% action."
    },
    "Heroic": {
      text: " While you defend or perform an attack, if you have only blank results and have 2 or more results, you may reroll any number of your dice. "
    },
    "Rose Tico": {
      text: " ??? "
    },
    "Finn": {
      text: " While you defend or perform a primary attack, if the enemy ship is in your %FRONTARC%, you may add 1 blank result to your roll ... can be rerolled or otherwise ...  "
    },
    "Integrated S-Foils": {
      text: "<b>Closed:</b> While you perform a primary attack, if the defender is not in your %BULLSEYEARC%, roll 1 fewer attack die. Before you activate, you may flip this card. %LINEBREAK% <i>Adds: %BARRELROLL%, %FOCUS% > <r>%BARRELROLL%</r></i> %LINEBREAK% <b>Open:</b> ???"
    },
    "Targeting Synchronizer": {
      text: "<i>Requires: %LOCK%</i> %LINEBREAK% While a friendly ship at range 1-2 performs an attack against a target you have locked, that ship ignores the %LOCK% attack requirement. "
    },
    "Primed Thrusters": {
      text: "<i>Requires: Small Base</i> %LINEBREAK% While you have 2 or fewer stress tokens, you can perform %BARRELROLL% and %BOOST% actions even while stressed. "
    },
    "Kylo Ren (Crew)": {
      text: " Action: Choose 1 enemy ship at range 1-3. If you do, spend 1 %FORCE% to assign the I'll Show You the Dark Side condition to that ship. "
    },
    "General Hux": {
      text: " ... perform a white %COORDINATE% action ... it as red. If you do, you ... up to 2 additional ships ... ship type, and each ship you coordinate must perform the same action, treating that action as red. "
    },
    "Fanatical": {
      text: " While you perform a primary attack, if you are not shielded, you may change 1 %FOCUS% result to a %HIT% result. "
    },
    "Special Forces Gunner": {
      text: " ... you perform a primary %FRONTARC% attack, ... your %SINGLETURRETARC% is in your %FRONTARC%, you may roll 1 additional attack die. After you perform a primary %FRONTARC% attack, ... your %TURRET% is in your %BACKARC%, you may perform a bonus primary %SINGLETURRETARC% attack. "
    },
    "Captain Phasma": {
      text: " ??? "
    },
    "Supreme Leader Snoke": {
      text: " ??? "
    },
    "Hyperspace Tracking Data": {
      text: " Setup: Before placing forces, you may ... 0 and 6 ... "
    },
    "Advanced Optics": {
      text: " While you perform an attack, you may spend 1 focus to change 1 of your blank results to a %HIT% result. "
    },
    "Rey (Gunner)": {
      text: " ... defend or ... If the ... in your %SINGLETURRETARC% ... 1 %FORCE% to ... 1 of your blank results to a %EVADE% or %HIT% result. "
    }
  };
  condition_translations = {
    'Suppressive Fire': {
      text: 'While you perform an attack against a ship other than <strong>Captain Rex</strong>, roll 1 fewer attack die. %LINEBREAK% After <strong>Captain Rex</strong> defends, remove this card.  %LINEBREAK% At the end of the Combat Phase, if <strong>Captain Rex</strong> did not perform an attack this phase, remove this card. %LINEBREAK% After <strong>Captain Rex</strong> is destroyed, remove this card.'
    },
    'Hunted': {
      text: 'After you are destroyed, you must choose another friendly ship and assign this condition to it, if able.'
    },
    'Listening Device': {
      text: 'During the System Phase, if an enemy ship with the <strong>Informant</strong> upgrade is at range 0-2, flip your dial faceup.'
    },
    'Optimized Prototype': {
      text: 'While you perform a %FRONTARC% primary attack against a ship locked by a friendly ship with the <strong>Director Krennic</strong> upgrade, you may spend 1 %HIT%/%CRIT%/%FOCUS% result. If you do, choose one: the defender loses 1 shield or the defender flips 1 of its facedown damage cards.'
    },
    'I\'ll Show You the Dark Side': {
      text: ' ??? '
    },
    'Proton Bomb': {
      name: "Bombe à protons",
      text: '(Bombe) - À la fin de la Phase d’activation, cet engin explose. %LINEBREAK% Lorsque cet engin explose, chaque vaisseau à portée 0–1 subit 1 dégât %CRIT%.'
    },
    'Seismic Charge': {
      name: 'Charges sismiques',
      text: '(Bombe) - À la fin de la Phase d’activation, cet engin explose. %LINEBREAK% Lorsque cet engin explose, choisissez 1 obstacle à portée 0–1. Chaque vaisseau à portée 0–1 de cet obstacle subit 1 dégât %HIT%. Puis retirez cet obstacle'
    },
    'Bomblet': {
      name: 'Sous-munitions',
      text: '(Bombe) - À la fin de la Phase d’activation, cet engin explose. %LINEBREAK% Lorsque l’engin explose, chaque vaisseau à portée 0–1 lance 2 dés d’attaque. Chaque vaisseau subit 1 dégât %HIT% pour chaque résultat %HIT%/%CRIT% obtenu.'
    },
    'Loose Cargo': {
      name: 'Cargaison égarée',
      text: '(Débris) - La cargaison égarée est considérée comme un nuage de débris.'
    },
    'Conner Net': {
      name: 'Filet Conner',
      text: '(Mine) - Après qu’un vaisseau a chevauché ou s’est déplacé à travers cet engin, ce dernier explose. Lorsque cet engin explose, le vaisseau subit 1 dégât %HIT% et gagne 3 marqueurs ioniques.'
    },
    'Proximity Mine': {
      name: 'Mine de proximité',
      text: '(Mine) - Après qu’un vaisseau a chevauché ou s’est déplacé à travers cet engin, ce dernier explose. Lorsque cet engin explose, le vaisseau lance 2 dés d’attaque. Puis ce vaisseau subit 1 dégât %HIT% plus 1 dégât %HIT%/%CRIT% pour chaque résultat correspondant obtenu.'
    }
  };
  return modification_translations = title_translations = exportObj.setupCardData(basic_cards, pilot_translations, upgrade_translations, condition_translations, modification_translations, title_translations);
};

exportObj = typeof exports !== "undefined" && exports !== null ? exports : this;

if (exportObj.codeToLanguage == null) {
  exportObj.codeToLanguage = {};
}

exportObj.codeToLanguage.hu = 'Magyar';

if (exportObj.translations == null) {
  exportObj.translations = {};
}

exportObj.translations.Magyar = {
  action: {
    "Barrel Roll": '<i class="xwing-miniatures-font xwing-miniatures-font-barrelroll"></i>',
    "Boost": '<i class="xwing-miniatures-font xwing-miniatures-font-boost"></i>',
    "Evade": '<i class="xwing-miniatures-font xwing-miniatures-font-evade"></i>',
    "Focus": '<i class="xwing-miniatures-font xwing-miniatures-font-focus"></i>',
    "Lock": '<i class="xwing-miniatures-font xwing-miniatures-font-lock"></i>',
    "Reload": '<i class="xwing-miniatures-font xwing-miniatures-font-reload"></i>',
    "Rotate Arc": '<i class="xwing-miniatures-font xwing-miniatures-font-rotatearc"></i>',
    "Reinforce": '<i class="xwing-miniatures-font xwing-miniatures-font-reinforce"></i>',
    "Jam": '<i class="xwing-miniatures-font xwing-miniatures-font-jam"></i>',
    "Calculate": '<i class="xwing-miniatures-font xwing-miniatures-font-calculate"></i>',
    "Coordinate": '<i class="xwing-miniatures-font xwing-miniatures-font-coordinate"></i>',
    "Cloak": '<i class="xwing-miniatures-font xwing-miniatures-font-cloak"></i>',
    "Slam": '<i class="xwing-miniatures-font xwing-miniatures-font-slam"></i>',
    "R> Barrel Roll": '<i class="xwing-miniatures-font xwing-miniatures-font-linked red"></i> <i class="xwing-miniatures-font red xwing-miniatures-font-barrelroll"></i>',
    "R> Focus": '<i class="xwing-miniatures-font xwing-miniatures-font-linked red"></i> <i class="xwing-miniatures-font red xwing-miniatures-font-focus"></i>',
    "R> Lock": '<i class="xwing-miniatures-font xwing-miniatures-font-linked red"></i> <i class="xwing-miniatures-font red xwing-miniatures-font-lock"></i>',
    "> Rotate Arc": '<i class="xwing-miniatures-font xwing-miniatures-font-linked"></i> <i class="xwing-miniatures-font xwing-miniatures-font-rotatearc"></i>',
    "R> Rotate Arc": '<i class="xwing-miniatures-font xwing-miniatures-font-linked red"></i> <i class="xwing-miniatures-font red xwing-miniatures-font-rotatearc"></i>',
    "R> Evade": '<i class="xwing-miniatures-font xwing-miniatures-font-linked red"></i> <i class="xwing-miniatures-font red xwing-miniatures-font-evade"></i>',
    "R> Calculate": '<i class="xwing-miniatures-font xwing-miniatures-font-linked red"></i> <i class="xwing-miniatures-font red xwing-miniatures-font-calculate"></i>'
  },
  sloticon: {
    "Astromech": '<i class="xwing-miniatures-font xwing-miniatures-font-astromech"></i>',
    "Force": '<i class="xwing-miniatures-font xwing-miniatures-font-forcepower"></i>',
    "Bomb": '<i class="xwing-miniatures-font xwing-miniatures-font-bomb"></i>',
    "Cannon": '<i class="xwing-miniatures-font xwing-miniatures-font-cannon"></i>',
    "Crew": '<i class="xwing-miniatures-font xwing-miniatures-font-crew"></i>',
    "Talent": '<i class="xwing-miniatures-font xwing-miniatures-font-talent"></i>',
    "Missile": '<i class="xwing-miniatures-font xwing-miniatures-font-missile"></i>',
    "Sensor": '<i class="xwing-miniatures-font xwing-miniatures-font-sensor"></i>',
    "Torpedo": '<i class="xwing-miniatures-font xwing-miniatures-font-torpedo"></i>',
    "Turret": '<i class="xwing-miniatures-font xwing-miniatures-font-turret"></i>',
    "Illicit": '<i class="xwing-miniatures-font xwing-miniatures-font-illicit"></i>',
    "Configuration": '<i class="xwing-miniatures-font xwing-miniatures-font-configuration"></i>',
    "Modification": '<i class="xwing-miniatures-font xwing-miniatures-font-modification"></i>',
    "Gunner": '<i class="xwing-miniatures-font xwing-miniatures-font-gunner"></i>',
    "Device": '<i class="xwing-miniatures-font xwing-miniatures-font-device"></i>',
    "Tech": '<i class="xwing-miniatures-font xwing-miniatures-font-tech"></i>',
    "Title": '<i class="xwing-miniatures-font xwing-miniatures-font-title"></i>'
  },
  slot: {
    "Astromech": "Astromech",
    "Force": "Erő",
    "Bomb": "Bomba",
    "Cannon": "Ágyú",
    "Crew": "Személyzet",
    "Missile": "Rakéta",
    "Sensor": "Szenzor",
    "Torpedo": "Torpedó",
    "Turret": "Toronylöveg",
    "Hardpoint": "Fegyverfelfüggesztő pont",
    "Illicit": "Tiltott",
    "Configuration": "Konfiguráció",
    "Talent": "Talentum",
    "Modification": "Módosítás",
    "Gunner": "Fegyverzet kezelő",
    "Device": "Eszköz",
    "Tech": "Tech",
    "Title": "Nevesítés"
  },
  sources: {
    "Second Edition Core Set": "Second Edition Core Set",
    "Rebel Alliance Conversion Kit": "Rebel Alliance Conversion Kit",
    "Galactic Empire Conversion Kit": "Galactic Empire Conversion Kit",
    "Scum and Villainy Conversion Kit": "Scum and Villainy Conversion Kit",
    "T-65 X-Wing Expansion Pack": "T-65 X-Wing Expansion Pack",
    "BTL-A4 Y-Wing Expansion Pack": "BTL-A4 Y-Wing Expansion Pack",
    "TIE/ln Fighter Expansion Pack": "TIE/ln Fighter Expansion Pack",
    "TIE Advanced x1 Expansion Pack": "TIE Advanced x1 Expansion Pack",
    "Slave 1 Expansion Pack": "Slave 1 Expansion Pack",
    "Fang Fighter Expansion Pack": "Fang Fighter Expansion Pack",
    "Lando's Millennium Falcon Expansion Pack": "Lando's Millennium Falcon Expansion Pack",
    "Saw's Renegades Expansion Pack": "Saw's Renegades Expansion Pack",
    "TIE Reaper Expansion Pack": "TIE Reaper Expansion Pack"
  },
  ui: {
    shipSelectorPlaceholder: "Válassz egy hajót",
    pilotSelectorPlaceholder: "Válassz egy pilótát",
    upgradePlaceholder: function(translator, language, slot) {
      return "Nincs " + (translator(language, 'slot', slot)) + " fejlesztés";
    },
    modificationPlaceholder: "Nincs módosítás",
    titlePlaceholder: "Nincs nevesítés",
    upgradeHeader: function(translator, language, slot) {
      return "" + (translator(language, 'slot', slot)) + " fejlesztés";
    },
    unreleased: "kiadatlan",
    epic: "epikus",
    limited: "korlátozott"
  },
  byCSSSelector: {
    '.unreleased-content-used .translated': 'Ez a raj kiadatlan tartalmat használ!',
    '.collection-invalid .translated': 'Ez a lista nem vihető pályára a készletedből!',
    '.game-type-selector option[value="standard"]': 'Sztandard',
    '.game-type-selector option[value="custom"]': 'Egyéni',
    '.game-type-selector option[value="epic"]': 'Epikus',
    '.game-type-selector option[value="team-epic"]': 'Team Epic',
    '.xwing-card-browser option[value="name"]': 'Név',
    '.xwing-card-browser option[value="source"]': 'Forrás',
    '.xwing-card-browser option[value="type-by-points"]': 'Típus (pont szerint)',
    '.xwing-card-browser option[value="type-by-name"]': 'Típus (név szerint)',
    '.xwing-card-browser .translate.select-a-card': 'Válassz a bal oldalon lévő kártyákból.',
    '.xwing-card-browser .translate.sort-cards-by': 'Sort cards by',
    '.info-well .info-ship td.info-header': 'Hajó',
    '.info-well .info-skill td.info-header': 'Kezdeményezés',
    '.info-well .info-actions td.info-header': 'Akciók',
    '.info-well .info-upgrades td.info-header': 'Fejlesztések',
    '.info-well .info-range td.info-header': 'Távolság',
    '.clear-squad': 'Új raj',
    '.save-list': 'Mentés',
    '.save-list-as': 'Mentés mint…',
    '.delete-list': 'Törlés',
    '.backend-list-my-squads': 'Raj betöltés',
    '.view-as-text': '<span class="hidden-phone"><i class="fa fa-print"></i>&nbsp;Nyomtatás/Szövegnézet </span>',
    '.randomize': 'Random!',
    '.randomize-options': 'Randomizer opciók…',
    '.notes-container > span': 'Jegyzetek',
    '.bbcode-list': 'Copy the BBCode below and paste it into your forum post.<textarea></textarea><button class="btn btn-copy">Másolás</button>',
    '.html-list': '<textarea></textarea><button class="btn btn-copy">Másolás</button>',
    '.vertical-space-checkbox': "Hagyj helyet a sérülés és fejlesztéskártyáknak nyomtatáskor <input type=\"checkbox\" class=\"toggle-vertical-space\" />",
    '.color-print-checkbox': "Színes nyomtatás <input type=\"checkbox\" class=\"toggle-color-print\" checked=\"checked\" />",
    '.print-list': '<i class="fa fa-print"></i>&nbsp;Nyomtatás',
    '.do-randomize': 'Randomize!',
    '#browserTab': 'Kártya tallózó',
    '#aboutTab': 'Rólunk',
    '.choose-obstacles': 'Choose Obstacles',
    '.choose-obstacles-description': 'Choose up to three obstacles to include in the permalink for use in external programs. (This feature is in BETA; support for displaying which obstacles were selected in the printout is not yet supported.)',
    '.coreasteroid0-select': 'Core Asteroid 0',
    '.coreasteroid1-select': 'Core Asteroid 1',
    '.coreasteroid2-select': 'Core Asteroid 2',
    '.coreasteroid3-select': 'Core Asteroid 3',
    '.coreasteroid4-select': 'Core Asteroid 4',
    '.coreasteroid5-select': 'Core Asteroid 5',
    '.yt2400debris0-select': 'YT2400 Debris 0',
    '.yt2400debris1-select': 'YT2400 Debris 1',
    '.yt2400debris2-select': 'YT2400 Debris 2',
    '.vt49decimatordebris0-select': 'VT49 Debris 0',
    '.vt49decimatordebris1-select': 'VT49 Debris 1',
    '.vt49decimatordebris2-select': 'VT49 Debris 2',
    '.core2asteroid0-select': 'Force Awakens Asteroid 0',
    '.core2asteroid1-select': 'Force Awakens Asteroid 1',
    '.core2asteroid2-select': 'Force Awakens Asteroid 2',
    '.core2asteroid3-select': 'Force Awakens Asteroid 3',
    '.core2asteroid4-select': 'Force Awakens Asteroid 4',
    '.core2asteroid5-select': 'Force Awakens Asteroid 5'
  },
  singular: {
    'pilots': 'Pilóta',
    'modifications': 'Módosítás',
    'titles': 'Nevesítés'
  },
  types: {
    'Pilot': 'Pilóta',
    'Modification': 'Módosítás',
    'Title': 'Nevesítés'
  }
};

if (exportObj.cardLoaders == null) {
  exportObj.cardLoaders = {};
}

exportObj.cardLoaders.Magyar = function() {
  var basic_cards, condition_translations, modification_translations, pilot_translations, title_translations, upgrade_translations;
  exportObj.cardLanguage = 'Magyar';
  basic_cards = exportObj.basicCardData();
  exportObj.canonicalizeShipNames(basic_cards);
  exportObj.ships = basic_cards.ships;

  /*exportObj.renameShip 'X-Wing', 'X-Wing'
  exportObj.renameShip 'A-Wing', 'A-Wing'
  exportObj.renameShip 'Y-Wing', 'Y-Wing'
  exportObj.renameShip 'B-Wing', 'B-Wing'
  exportObj.renameShip 'E-Wing', 'E-Wing'
  exportObj.renameShip 'K-Wing', 'K-Wing'
  exportObj.renameShip 'U-Wing', 'U-Wing'
  exportObj.renameShip 'YT-1300', 'YT-1300'
  exportObj.renameShip 'YT-2400', 'YT-2400'
  exportObj.renameShip 'Z-95 Headhunter', 'Z-95 Headhunter'
  exportObj.renameShip 'VCX-100', 'VCX-100'
  exportObj.renameShip 'Attack Shuttle', 'Attack Shuttle'
  exportObj.renameShip 'ARC-170', 'ARC-170'
  exportObj.renameShip 'Auzituck Gunship', 'Auzituck Gunship'
  exportObj.renameShip 'Sheathipede-Class Shuttle', 'Sheathipede-Class Shuttle'
  exportObj.renameShip 'TIE Fighter', 'TIE Fighter'
  exportObj.renameShip 'TIE Advanced', 'TIE Advanced'
  exportObj.renameShip 'TIE Interceptor', 'TIE Interceptor'
  exportObj.renameShip 'TIE Bomber', 'TIE Bomber'
  exportObj.renameShip 'TIE Defender', 'TIE Defender'
  exportObj.renameShip 'TIE Phantom', 'TIE Phantom'
  exportObj.renameShip 'TIE Advanced Prototype', 'TIE Advanced Prototype'
  exportObj.renameShip 'TIE Striker', 'TIE Striker'
  exportObj.renameShip 'TIE Punisher', 'TIE Punisher'
  exportObj.renameShip 'TIE Aggressor', 'TIE Aggressor'
  exportObj.renameShip 'TIE Reaper', 'TIE Reaper'
  exportObj.renameShip 'Alpha-Class Star Wing', 'Alpha-Class Star Wing'
  exportObj.renameShip 'Lambda-Class Shuttle', 'Lambda-Class Shuttle'
  exportObj.renameShip 'VT-49 Decimator', 'VT-49 Decimator'
  exportObj.renameShip 'Firespray-31', 'Firespray-31'
  exportObj.renameShip 'M3-A Interceptor', 'M3-A Interceptor' 
  exportObj.renameShip 'HWK-290', 'HWK-290'
  exportObj.renameShip 'StarViper', 'StarViper'
  exportObj.renameShip 'Aggressor', 'Aggressor'
  exportObj.renameShip 'YV-666', 'YV-666'
  exportObj.renameShip 'Kihraxz Fighter', 'Kihraxz Fighter'
  exportObj.renameShip 'G-1A Starfighter', 'G-1A Starfighter'
  exportObj.renameShip 'Fang Fighter', 'Fang Fighter'
  exportObj.renameShip 'YT-1300 (Scum)', 'YT-1300 (Scum)'
  exportObj.renameShip 'JumpMaster 5000', 'JumpMaster 5000'
  exportObj.renameShip 'Lancer-Class Pursuit Craft', 'Lancer-Class Pursuit Craft'
  exportObj.renameShip 'Quadjumper', 'Quadjumper'
  exportObj.renameShip 'Scurrg H-6 Bomber', 'Scurrg H-6 Bomber'
  exportObj.renameShip 'M12-L Kimogila Fighter', 'M12-L Kimogila Fighter'
  exportObj.renameShip 'Escape Craft', 'Escape Craft'
  exportObj.renameShip 'Mining Guild TIE Fighter', 'Mining Guild TIE Fighter'
  
  exportObj.renameShip 'T-70 X-Wing', 'T-70 X-Wing'
  exportObj.renameShip 'RZ-2 A-Wing', 'RZ-2 A-Wing'
  exportObj.renameShip 'B/SF-17 Bomber', 'B/SF-17 Bomber'
  exportObj.renameShip 'YT-1300 (Resistance)', 'YT-1300 (Resistance)'
  
  exportObj.renameShip 'TIE/FO Fighter', 'TIE/FO Fighter'
  exportObj.renameShip 'TIE/SF Fighter', 'TIE/SF Fighter'
  exportObj.renameShip 'TIE Silencer', 'TIE Silencer'
  exportObj.renameShip 'Upsilon-Class Shuttle', 'Upsilon-Class Shuttle'
   */
  pilot_translations = {
    "4-LOM": {
      text: "miután teljesen végrehajtottál egy piros manővert, kapsz 1 kalkuláció jelzőt. A vége fázis elején választhatsz 1 hajót 0-1-es távolságban. Ha így teszel, add át 1 stressz jelződ annak a hajónak."
    },
    "Academy Pilot": {
      text: " "
    },
    "Airen Cracken": {
      text: "Miután végrehajtasz egy támadást, választhatsz 1 baráti hajót 1-es távolságban. Az a hajó végrehajthat egy akciót, pirosként kezelve."
    },
    "Alpha Squadron Pilot": {
      text: "AUTOTHRUSTERS: Miután végrehajtasz egy akciót, végrehajthatsz egy piros %BARRELROLL% vagy egy piros %BOOST% akciót."
    },
    "AP-5": {
      text: "Amikor koordinálsz, ha a kiválasztott hajónak pontosan 1 stressz jelzője van, az végrehajthat akciókat. %LINEBREAK% COMMS SHUTTLE: Amikor dokkolva vagy, anyahajód %COORDINATE% akció lehetőséget kap. Anyahajód az aktiválása előtt végrehajthat egy %COORDINATE% akciót."
    },
    "Arvel Crynyd": {
      text: "Végrehajthatsz elsődleges támadást 0-ás távolságban. Ha egy %BOOST% akcióddal átfedésbe kerülsz egy másik hajóval, úgy hajtsd végre, mintha csak részleges manőver lett volna. %LINEBREAK% VECTORED THRUSTERS: Miután végrehajtottál egy akciót, végrehajthatsz egy %BOOST% gyorsítás akciót."
    },
    "Asajj Ventress": {
      text: "A ütközet fázis elején választhatsz egy ellenséges hajót a %SINGLETURRETARC% tűzívedben 0-2-es távolságban és költs 1 %FORCE% jelzőt. Ha így teszel, az a hajó kap egy stressz jelzőt, hacsak nem távolít el egy zöld jelzőt."
    },
    "Autopilot Drone": {
      text: "RIGGED ENERGY CELLS: A rendszer fázis alatt, ha nem vagy dokkolva, elvesztesz 1 %CHARGE% jelzőt. Az aktivációs fázis végén, ha már nincs %CHARGE% jelződ, megsemmisülsz. Mielőtt levennéd a hajód minden 0-1-es távolságban lévő hajó elszenved 1 %CRIT% sérülést"
    },
    "Bandit Squadron Pilot": {
      text: " "
    },
    "Baron of the Empire": {
      text: " "
    },
    "Benthic Two-Tubes": {
      text: "Miután végrehajtottál egy %FOCUS% akciót, átrakhatod 1 fókusz jelződ egy baráti hajóra 1-2-es távolságban"
    },
    "Biggs Darklighter": {
      text: "Amikor baráti hajó védekezik tőled 0-1-es távolságban, az Eredménysemlegesítés lépés előtt, ha a támadó tűzívében vagy, elszenvedhetsz 1 %HIT% vagy %CRIT% találatot, hogy hatástalaníts egy azzal egyező találatot."
    },
    "Binayre Pirate": {
      text: " "
    },
    "Black Squadron Ace": {
      text: " "
    },
    "Black Squadron Scout": {
      text: "ADAPTIVE AILERONS: Mielőtt felfednéd a tárcsád, ha nem vagy stresszes, végre KELL hajtanod egy fehér (1 %BANKLEFT%), (1 %STRAIGHT%) vagy (1 %BANKRIGHT%) menővert."
    },
    "Black Sun Ace": {
      text: " "
    },
    "Black Sun Assassin": {
      text: "MICROTHRUSTERS: Mikor orsózást hajtasz végre, a (1 %BANKLEFT%) vagy (1 %BANKRIGHT%) sablont KELL használnod a (1 %STRAIGHT%) helyett."
    },
    "Black Sun Enforcer": {
      text: "MICROTHRUSTERS: Mikor orsózást hajtasz végre, a (1 %BANKLEFT%) vagy (1 %BANKRIGHT%) sablont KELL használnod a (1 %STRAIGHT%) helyett."
    },
    "Black Sun Soldier": {
      text: " "
    },
    "Blade Squadron Veteran": {
      text: " "
    },
    "Blue Squadron Escort": {
      text: " "
    },
    "Blue Squadron Pilot": {
      text: " "
    },
    "Blue Squadron Scout": {
      text: " "
    },
    "Boba Fett": {
      text: "Amikor védekezel vagy végrehajtasz egy támadást, újradobhatsz 1 kockát, minden egyes 0-1-es távolságban lévő ellenséges hajó után."
    },
    "Bodhi Rook": {
      text: "A baráti hajók bemérhetnek más baráti hajóktól 0-3-as távolságban lévő objektumokat."
    },
    "Bossk": {
      text: "Amikor végrehajtasz egy elsődleges támadást, az 'Eredmények semlegesítése' lépés után, elkölthetsz egy %CRIT% eredményt, hogy hozzáadj 2 %HIT% eredményt a dobásodhoz."
    },
    "Bounty Hunter": {
      text: " "
    },
    "Braylen Stramm": {
      text: "Amikor védekezel vagy végrehajtasz egy támadást, ha stresszes vagy, újradobhatod legfeljebb 2 kockádat."
    },
    "Captain Feroph": {
      text: "Amikor védekezel, ha a támadónak nincs zöld jelzője, megváltoztathatod 1 üres vagy %FOCUS% dobásod %EVADE% eredményre.%LINEBREAK% ADAPTIVE AILERONS: Mielőtt felfednéd a tárcsád, ha nem vagy stresszes, végre KELL hajtanod egy fehér (1 %BANKLEFT%), (1 %STRAIGHT%) vagy (1 %BANKRIGHT%) menővert."
    },
    "Captain Jonus": {
      text: "Amikor egy baráti hajó 0-1-es távolságban végrehajt egy %TORPEDO% vagy %MISSILE% támadást, az újradobhat akár 2 támadókockát.%LINEBREAK% NIMBLE BOMBER: Ha ledobsz egy eszközt a %STRAIGHT% sablon segítségével, használhatod az azonos sebességű %BANKLEFT% vagy %BANKRIGHT% sablonokat helyette."
    },
    "Captain Jostero": {
      text: "Miután egy ellenséges hajó sérülést szenved és nem védekezett, végrehajthatsz egy bónusz támadást ellene."
    },
    "Captain Kagi": {
      text: "A ütközet fázis elején választhatsz egy baráti hajót 0-3-es távolságban. Ha így teszel tedd át az összes ellenséges bemérés jelzőt a kiválasztott hajóról magadra."
    },
    "Captain Nym": {
      text: "Mielőtt egy baráti bomba vagy akna felrobbanna, elkölthetsz 1 %CHARGE% jelzőt, hogy megakadályozd a felrobbanását. Mikor egy támadás ellen védekezel amely akadályozott egy bomba vagy akna által, 1-gyel több védekezőkockával dobj."
    },
    "Captain Oicunn": {
      text: "Végrehajthatsz elsődleges támadást 0-ás távolságban."
    },
    "Captain Rex": {
      text: "Miután végrehajtasz egy támadást, jelöld meg a védekezőt a 'Suppressive Fire' kondícióval."
    },
    "Cartel Executioner": {
      text: "DEAD TO RIGHTS: Amikor végrehajtasz egy támadást, ha a védekező benne van a %BULLSEYEARC% tűzívedben, a védekezőkockák nem módosíthatók zöld jelzőkkel."
    },
    "Cartel Marauder": {
      text: " "
    },
    "Cartel Spacer": {
      text: "WEAPON HARDPOINT: Felszerelhetsz 1 %CANNON%, %TORPEDO% vagy %MISSILE% feljesztést."
    },
    "Cassian Andor": {
      text: "Az aktivációs fázis elején választhatsz 1 baráti hajót 1-3-as távolságban. Ha így teszel, az a hajó eltávolít 1 stressz jelzőt."
    },
    "Cavern Angels Zealot": {
      text: " "
    },
    "Chewbacca": {
      text: "Mielőtt képpel felfelé fordított sebzéskártyát kapnál, elkölthetsz 1 %CHARGE%-et, hogy a lapot képpel lefelé húzd fel."
    },
    '"Chopper"': {
      text: "A ütközet fázis elején minden 0-ás távolságban lévő ellenséges hajó 2 zavarás jelzőt kap.%LINEBREAK%TAIL GUN: Ha van bedokkolt a hajód, használhatod az elsődleges %REARARC% fegyvered, ugyanolyan támadási értékkel, mint a dokkolt hajó elsődleges %FRONTARC% értéke."
    },
    "Colonel Jendon": {
      text: "Az aktivációs fázis elején elkölthetsz egy %CHARGE% jelzőt. Ha így teszel, amikor baráti hajók bemérés jelzőt tesznek fel ebben a körben, 3-as távolságon túl tehetik csak meg a 0-3-as távolság helyett."
    },
    "Colonel Vessery": {
      text: "Amikor támadást hajtasz végre egy bemért hajó ellen, miután dobsz a kockákkal, feltehetsz egy bemérés jelzőt a védekezőre.%LINEBREAK% FULL THROTTLE: Miután teljesen végrehajtottál egy 3-5 sebességű manővert, végrehajthatsz egy %EVADE% akciót."
    },
    "Constable Zuvio": {
      text: "Amikor kidobnál egy eszközt, helyette ki is lőheted egy (1 %STRAIGHT%) sablon használatával.%LINEBREAK% SPACETUG TRACTOR ARRAY: AKCIÓ: Válassz egy hajót a %FRONTARC% tűzívedben 1-es távolságban. Az a hajó kap 1 vonósugár jelzőt vagy 2 vonósugár jelzőt, ha benne van a %BULLSEYEARC% tűzívedben 1-es távolságban."
    },
    "Contracted Scout": {
      text: " "
    },
    "Corran Horn": {
      text: "0-ás kezdeményezésnél végrehajthatsz egy bónusz elsődleges támadást egy ellenséges hajó ellen, aki a %BULLSEYEARC% tűzívedben van. Ha így teszel, a következő tervezés fázisban kapsz 1 inaktív fegyverzet jelzőt.%LINEBREAK% EXPERIMENTAL SCANNERS: 3-as távolságon túl is bemérhetsz. Nem mérhetsz be 1-es távolságra."
    },
    '"Countdown"': {
      text: "Amikor védekezel, az 'Eredmények semlegesítése' lépés után, ha nem vagy stresszes, választhatod, hogy elszenvedsz 1 %HIT% sérülést és kapsz 1 stressz jelzőt. Ha így teszel, vess el minden kocka dobást.  %LINEBREAK% ADAPTIVE AILERONS: Mielőtt felfednéd a tárcsád, ha nem vagy stresszes, végre KELL hajtanod egy fehér (1 %BANKLEFT%), (1 %STRAIGHT%) vagy (1 %BANKRIGHT%) menővert."
    },
    "Countess Ryad": {
      text: "Amikor végrehajtanál egy %STRAIGHT% manővert, megnövelheted annak nehézségét. Ha így teszel, végrehajthatsz egy %KTURN% manővert helyette. %LINEBREAK% FULL THROTTLE: Miután teljesen végrehajtottál egy 3-5 sebességű manővert, végrehajthatsz egy %EVADE% akciót."
    },
    "Crymorah Goon": {
      text: " "
    },
    "Cutlass Squadron Pilot": {
      text: " "
    },
    "Dace Bonearm": {
      text: "Miután egy ellenséges hajó 0-3-as távolságban kap legalább 1 ion jelzőt, elkölthetsz 3 %CHARGE% jelzőt. Ha így teszel az a hajó kap 2 további ion jelzőt."
    },
    "Dalan Oberos": {
      text: "A ütközet fázis elején választhatsz 1 pajzzsal rendelekező hajót a %BULLSEYEARC% tűzívedben és elkölthetsz 1 %CHARGE% jelzőt. Ha így teszel, az a hajó elveszít egy pajzsot, te pedig visszatölthetsz 1 pajzsot.%LINEBREAK% DEAD TO RIGHTS: Amikor végrehajtasz egy támadást, ha a védekező benne van a %BULLSEYEARC% tűzívedben, a védekezőkockák nem módosíthatók zöld jelzőkkel."
    },
    "Dalan Oberos (StarViper)": {
      text: "Miután teljesen végrehajtasz egy manővert, kaphatsz 1 stressz jelzőt, hogy elforgasd a hajód 90 fokkal.  %LINEBREAK% MICROTHRUSTERS: Amikor orsózást hajtasz végre, a (1 %BANKLEFT%) vagy (1 %BANKRIGHT%) sablont KELL használnod a (1 %STRAIGHT%) helyett."
    },
    "Darth Vader": {
      text: "Miután végrehajtasz egy akciót, elkölthetsz 1 %FORCE% jelzőt, hogy végrehajts egy akciót. %LINEBREAK% ADVANCED TARGETING COMPUTER: Amikor végrehajtasz egy elsődleges támadást egy olyan védekező ellen, akit bemértél, 1-gyel több támadókockával dobj és változtasd egy %HIT% eredményed %CRIT% eredményre."
    },
    "Dash Rendar": {
      text: "Amikor mozogsz, hagyd figyelmen kívül az akadályokat. %LINEBREAK% SENSOR BLINDSPOT: Amikor elsődleges támadást hajtasz végre 0-1-es távolságban, nem érvényesül a 0-1-es távolságért járó bónusz és 1-gyel kevesebb támadókockával dobsz."
    },
    '"Deathfire"': {
      text: "Miután megsemmisülsz, mielőtt levennéd a hajód, végrehajthatsz egy támadást és ledobhatsz vagy kilőhetsz egy eszközt. %LINEBREAK% NIMBLE BOMBER: Ha ledobsz egy eszközt a %STRAIGHT% sablon segítségével, használhatod az azonos sebességű %BANKLEFT% vagy %BANKRIGHT% sablonokat helyette."
    },
    '"Deathrain"': {
      text: "Miután ledobsz vagy kilősz egy eszközt, végrehajthatsz egy akciót."
    },
    "Del Meeko": {
      text: "Amikor egy baráti 0-2 távolságban védekezik egy sérült támadó ellen, a védekező újradobhat 1 védekezőkockát."
    },
    "Delta Squadron Pilot": {
      text: "FULL THROTTLE: Miután teljesen végrehajtottál egy 3-5 sebességű manővert, végrehajthatsz egy %EVADE% akciót."
    },
    "Dengar": {
      text: "Miután védekeztél, ha a támadó benne van a %FRONTARC% tűzívedben, elkölthetsz egy %CHARGE% jelzőt, hogy végrehajts egy bónusz támadást a támadó ellen."
    },
    '"Double Edge"': {
      text: "Miután végrehajtasz egy %TURRET% vagy %MISSILE% támadást ami nem talál, végrehajthatsz egy bónusz támadást egy másik fegyverrel."
    },
    "Drea Renthal": {
      text: "Amikor egy baráti nem-limitált hajó végrehajt egy támadást, ha a védekező benne van a tűzívedben, a támadó újradobhatja 1 támadókockáját."
    },
    '"Duchess"': {
      text: "Választhatsz úgy, hogy nem használod az ADAPTIVE AILERONS képességed. Használhatod akkor is ADAPTIVE AILERONS-t, amikor stresszes vagy.%LINEBREAK% ADAPTIVE AILERONS: Mielőtt felfednéd a tárcsád, ha nem vagy stresszes, végre KELL hajtanod egy fehér (1 %BANKLEFT%), (1 %STRAIGHT%) vagy (1 %BANKRIGHT%) menővert."
    },
    '"Dutch" Vander': {
      text: "Miután %LOCK% akciót hajtottál végre választhatsz 1 baráti hajót 1-3-as távolságban. Az a hajó is bemérheti az általad bemért objektumot, függetlenül a távolságtól."
    },
    '"Echo"': {
      text: "Amikor kijössz az álcázásból, a (2 %BANKLEFT%) vagy (2 %BANKRIGHT%) sablont KELL használnod a (2 %STRAIGHT%) helyett. STYGUM ARRAY: Miután kijössz az álcázásból végrehajthatsz egy %EVADE% akciót. A vége fázis elején elkölthetsz 1 kitérés jelzőt, hogy kapj egy álcázás jelzőt."
    },
    "Edrio Two-Tubes": {
      text: "Mielőtt aktiválódnál és van fókuszod, végrehajthatsz egy akciót."
    },
    "Emon Azzameen": {
      text: "Ha ki szeretnél dobni egy eszközt az [1 %STRAIGHT%] sablonnal, használhatod helyette a [3 %TURNLEFT%], [3 %STRAIGHT%], vagy [3 %TURNRIGHT%] sablont."
    },
    "Esege Tuketu": {
      text: "Amikor egy 0-2-es távolságban baráti hajó védekezik, vagy támadást hajt végre, elköltheti a te fókusz jelzőidet, mintha a saját hajójáé lenne."
    },
    "Evaan Verlaine": {
      text: "A ütközet fázis elején elkölthetsz 1 fókusz jelzőt, hogy kiválassz egy baráti hajót 0-1-es távolságban. Ha így teszel, az a hajó a kör végéig minden védekezésénél 1-gyel több védekezőkockával dob."
    },
    "Ezra Bridger": {
      text: "Amikor védekezel vagy támadást hajtasz végre, ha stresszes vagy, elkölthetsz 1 %FORCE%-t, hogy legfeljebb 2 %FOCUS% eredményt %EVADE% vagy %HIT% eredményre módosíts.%LINEBREAK%LOCKED AND LOADED: Amikor dokkolva vagy, miután anyahajód végrehajtott egy elsődleges %FRONTARC% vagy %TURRET% támadást, végrehajthat egy bónusz %REARARC% támadást."
    },
    "Ezra Bridger (Sheathipede)": {
      text: "Amikor védekezel vagy támadást hajtasz végre, ha stresszes vagy, elkölthetsz 1 %FORCE%-t, hogy legfeljebb 2 %FOCUS% eredményt %EVADE% vagy %HIT% eredményre módosíts.%LINEBREAK% COMMS SHUTTLE: Amikor dokkolva vagy, anyahajód %COORDINATE% akció lehetőséget kap. Anyahajód az aktiválása előtt végrehajthat egy %COORDINATE% akciót."
    },
    "Ezra Bridger (TIE Fighter)": {
      text: "Amikor védekezel vagy támadást hajtasz végre, ha stresszes vagy, elkölthetsz 1 %FORCE%-t, hogy legfeljebb 2 %FOCUS% eredményt %EVADE% vagy %HIT% eredményre módosíts."
    },
    "Fenn Rau": {
      text: "Amikor védekezel vagy támadást hajtasz végre, ha a támadás 1-es távolságban történik, 1-gyel több kockával dobhatsz. %LINEBREAK% CONCORDIA FACEOFF: Amikor védekezel vagy támadást hajtasz végre, ha a támadás 1-es távolságban történik és benne vagy a támadó %FRONTARC% tűzívében, megváltoztathatod 1 dobás eredményed %EVADE% eredményre."
    },
    "Fenn Rau (Sheathipede)": {
      text: "Miután egy ellenséges hajó a tűzívedben sorra kerül az Ütközet fázisban, ha nem vagy stresszes, kaphatsz 1 stressz jelzőt. Ha így teszel, az a hajó nem költhet el jelzőt, hogy módosítsa támadókockáit e fázis alatt.%LINEBREAK% COMMS SHUTTLE: Amikor dokkolva vagy, anyahajód %COORDINATE% akció lehetőséget kap. Anyahajód az aktiválása előtt végrehajthat egy %COORDINATE% akciót."
    },
    "Freighter Captain": {
      text: " "
    },
    "Gamma Squadron Ace": {
      text: "NIMBLE BOMBER: Ha ledobsz egy eszközt a %STRAIGHT% sablon segítségével, használhatod az azonos sebességű %BANKLEFT% vagy %BANKRIGHT% sablonokat helyette."
    },
    "Gand Findsman": {
      text: " "
    },
    "Garven Dreis": {
      text: "Miután elköltesz egy fókusz jelzőt, választhatsz 1 baráti hajót 1-3-as távolságban. Az a hajó kap egy fókusz jelzőt."
    },
    "Garven Dreis (X-Wing)": {
      text: "Miután elköltesz egy fókusz jelzőt, választhatsz 1 baráti hajót 1-3-as távolságban. Az a hajó kap egy fókusz jelzőt."
    },
    "Gavin Darklighter": {
      text: "Amikor egy baráti hajó végrehajt egy támadást, ha a védekező a %FRONTARC%-odban van, a támadó 1 %HIT% találatát %CRIT% találatra módosíthatja. %LINEBREAK% EXPERIMENTAL SCANNERS: 3-as távolságon túl is bemérhetsz. Nem mérhetsz be 1-es távolságra."
    },
    "Genesis Red": {
      text: "Miután feltettél egy bemérés jelzőt, le kell venned az összes fókusz és kitérés jelződet, aztán megkapsz annyi fókusz és kitérés jelzőt, ahány a bemért hajónak van.%LINEBREAK% WEAPON HARDPOINT: Felszerelhetsz 1 %CANNON%, %TORPEDO% vagy %MISSILE% feljesztést."
    },
    "Gideon Hask": {
      text: "Amikor végrehajtasz egy támadást sérült védekező ellen, 1-gyel több támadókockával dobhatsz."
    },
    "Gold Squadron Veteran": {
      text: " "
    },
    "Grand Inquisitor": {
      text: "Amikor 1-es távolságban védekezel, elkölthetsz 1 %FORCE% tokent, hogy megakadályozd az 1-es távolság bónuszt. Amikor támadást hajtasz végre 2-3-as távolságban lévő védekező ellen, elkölthetsz 1 %FORCE% jelzőt, hogy megkapd az 1-es távolság bónuszt."
    },
    "Gray Squadron Bomber": {
      text: " "
    },
    "Graz": {
      text: "Amikor védekezel és a támadó mögött vagy, 1-gyel több védekezőkockával dobhatsz. Amikor végrehajtasz egy támadást és a védekező mögött vagy, 1-gyel több támadókockával dobhatsz."
    },
    "Green Squadron Pilot": {
      text: "VECTORED THRUSTERS: Miután végrehajtottál egy akciót, végrehajthatsz egy piros %BOOST% akciót."
    },
    "Guri": {
      text: "A ütközet fázis elején, ha legalább 1 ellenséges hajó van 0-1-es távolságban, kapsz egy fókusz jelzőt. %LINEBREAK% MICROTHRUSTERS: Amikor orsózást hajtasz végre, a (1 %BANKLEFT%) vagy (1 %BANKRIGHT%) sablont KELL használnod a (1 %STRAIGHT%) helyett."
    },
    "Han Solo (Scum)": {
      text: "Amikor védekezel vagy támadást hajtasz vége, ha a támadás akadály által akadályozott, 1-gyel több támadókockával dobhatsz."
    },
    "Han Solo": {
      text: "Miután dobtál, ha 0-1-es távolságban vagy akadálytól, újradobhatod az összes kockádat. Ez nem számít újradobásnak más hatások számára."
    },
    "Heff Tobber": {
      text: "Miután egy ellenséges hajó végrehajt egy manővert, ha 0-ás távolságba kerül, végrehajthatsz egy akciót."
    },
    "Hera Syndulla": {
      text: "Miután vörös vagy kék manővert fedtél fel, átállíthatod manőversablonod egy másik, azonos nehézségű manőverre. %LINEBREAK% LOCKED AND LOADED: Amikor dokkolva vagy, miután anyahajód végrehajtott egy elsődleges %FRONTARC% vagy %TURRET% támadást, végrehajthat egy bónusz %REARARC% támadást."
    },
    "Hera Syndulla (VCX-100)": {
      text: "Miután vörös vagy kék manővert fedtél fel, átállíthatod manőversablonod egy másik, azonos nehézségű manőverre.%LINEBREAK%TAIL GUN: Ha van bedokkolt a hajód, használhatod az elsődleges %REARARC% fegyvered, ugyanolyan támadási értékkel, mint a dokkolt hajó elsődleges %FRONTARC% értéke."
    },
    "Hired Gun": {
      text: " "
    },
    "Horton Salm": {
      text: "Amikor támadást hajtasz végre, a védekezőtől 0-1-es távolságban lévő minden más baráti hajó után újradobhatsz 1-1 támadókockát."
    },
    '"Howlrunner"': {
      text: "Amikor egy 0-1-es távolságban lévő baráti hajó támadást hajt végre, 1 támadókockát újradobhat."
    },
    "Ibtisam": {
      text: "Amikor teljesen végrehajtod a manővered, ha stresszes vagy, dobhatsz 1 támadókockával. %HIT% vagy %CRIT% esetén eltávolíthatsz 1 stressz jelzőt."
    },
    "Iden Versio": {
      text: "Mielőtt egy 0-1-es távolságban lévő baráti TIE/ln hajó elszenvedne 1 vagy több sérülést, elkölthetsz 1 %CHARGE% jelzőt. Ha így teszel, megakadályozod a sérülést."
    },
    "IG-88A": {
      text: "A ütközet fázis elején kiválaszthatsz egy %CALCULATE% akcióval rendelkező baráti hajót 1-3-as távolságban. Ha így teszel, add át 1 kalkuláció jelződet neki. %LINEBREAK% ADVANCED DROID BRAIN: Miután végrehajtottál egy %CALCULATE% akciót, kapsz 1 kalkuláció jelzőt."
    },
    "IG-88B": {
      text: "Miután végrehajtottál egy támadást ami nem talált, végrehajthatsz egy bónusz %CANNON% támadást. %LINEBREAK% ADVANCED DROID BRAIN: Miután végrehajtottál egy %CALCULATE% akciót, kapsz 1 kalkuláció jelzőt."
    },
    "IG-88C": {
      text: "Miután végrehajtottál egy %BOOST% akciót, végrehajthatsz egy %EVADE% akciót. %LINEBREAK% ADVANCED DROID BRAIN: Miután végrehajtottál egy %CALCULATE% akciót, kapsz 1 kalkuláció jelzőt."
    },
    "IG-88D": {
      text: "Amikor végrehajtasz egy Segnor's Loop (%SLOOPLEFT% vagy %SLOOPRIGHT%) manővert, Használhatsz ugyanazon sebességű másik sablont helyette: vagy megegyező irányú kanyar (%TURNLEFT% vagy %TURNRIGHT%), vagy előre egyenes (%STRAIGHT%) sablont. %LINEBREAK% ADVANCED DROID BRAIN: Miután végrehajtottál egy %CALCULATE% akciót, kapsz 1 kalkuláció jelzőt."
    },
    "Imdaar Test Pilot": {
      text: "STYGUM ARRAY: Miután kijössz az álcázásból végrehajthatsz egy %EVADE% akciót. A vége fázis elején elkölthetsz 1 kitérés jelzőt, hogy kapj egy álcázás jelzőt."
    },
    "Inaldra": {
      text: "Amikor védekezel vagy támadást hajtasz végre, elszenvedhetsz egy %HIT% sérülést, hogy újradobj bármennyi kockát. %LINEBREAK% WEAPON HARDPOINT: Felszerelhetsz 1 %CANNON%, %TORPEDO% vagy %MISSILE% feljesztést."
    },
    "Inquisitor": {
      text: " "
    },
    "Jake Farrell": {
      text: "Miután %BARRELROLL%, vagy %BOOST% akciót hajtottál végre, választhatsz 1 baráti hajót 0-1-es távolságban. Az a hajó végrehajthat egy %FOCUS% akciót. %LINEBREAK% VECTORED THRUSTERS: Miután végrehajtottál egy akciót, végrehajthatsz egy piros %BOOST% akciót."
    },
    "Jakku Gunrunner": {
      text: "SPACETUG TRACTOR ARRAY: AKCIÓ: Válassz egy hajót a %FRONTARC% tűzívedben 1-es távolságban. Az a hajó kap 1 vonósugár jelzőt vagy 2 vonósugár jelzőt, ha benne van a %BULLSEYEARC% tűzívedben 1-es távolságban."
    },
    "Jan Ors": {
      text: "Amikor egy tűzíveden belüli baráti hajó elsődleges támadást hajt végre, ha nem vagy stresszes, kaphatsz 1 stressz jelzőt. Ha így teszel, az a hajó 1-gyel több támadókockával dobhat"
    },
    "Jek Porkins": {
      text: "Miután kapsz egy stressz jelzőt, dobhatsz 1 támadó kockával, hogy levedd. %HIT% dobás esetén elszenvedsz 1 %HIT% sérülést."
    },
    "Joy Rekkoff": {
      text: "Amikor támadást hajtasz végre, elkölthetsz 1 %CHARGE% jelzőt egy felszerelt %TORPEDO% fejlesztésről. Ha így teszel a védekező 1-gyel kevesebb védekezőkockával dob. %LINEBREAK% CONCORDIA FACEOFF: Amikor védekezel vagy támadást hajtasz végre, ha a támadás 1-es távolságban történik és benne vagy a támadó %FRONTARC% tűzívében, megváltoztathatod 1 dobás eredményed %EVADE% eredményre."
    },
    "Kaa'to Leeachos": {
      text: "A ütközet fázis elején kiválaszthatsz egy 0-2-es távolságban lévő baráti hajót. Ha így teszel, áttehetsz róla 1 fókusz vagy kitérés jelzőt a magadra."
    },
    "Kad Solus": {
      text: "Miután végrehajtasz egy piros manővrt, kapsz 2 fókusz jelzőt."
    },
    "Kanan Jarrus": {
      text: "Amikor egy tűzívedben lévő baráti hajó védekezik, elkölthetsz 1 %FORCE%-t. Ha így teszel, a támadó 1-gyel kevesebb támadókockával dob.%LINEBREAK%TAIL GUN: Ha van bedokkolt a hajód, használhatod az elsődleges %REARARC% fegyvered, ugyanolyan támadási értékkel, mint a dokkolt hajó elsődleges %FRONTARC% értéke."
    },
    "Kashyyyk Defender": {
      text: " "
    },
    "Kath Scarlet": {
      text: "Amikor támadást hajtasz végre és legalább 1 nem-limitált baráti hajó van 0-ás távolságra a védekezőtől, dobj 1-gyel több támadókockával."
    },
    "Kavil": {
      text: "Amikor egy nem-%FRONTARC% támadást hajtasz végre, dobj 1-gyel több támadókockával."
    },
    "Ketsu Onyo": {
      text: "A ütközet fázis elején választhatsz egy hajót ami a %FRONTARC% and %SINGLETURRETARC% tűzívedben is benne van 0-1-es távolságban. Ha így teszel, az a hajó kap egy vonósugár jelzőt."
    },
    "Knave Squadron Escort": {
      text: "EXPERIMENTAL SCANNERS: 3-as távolságon túl is bemérhetsz. Nem mérhetsz be 1-es távolságra."
    },
    "Koshka Frost": {
      text: "Amikor védekezel vagy támadást hajtasz végre, ha az ellenséges hajó stresszes, újradobhatod 1 kockádat"
    },
    "Krassis Trelix": {
      text: "Végrehajthatsz egy %FRONTARC% speciális támadást a %REARARC% tűzívedből. Amikor speciális támadást hajtasz végre, újradobhatsz egy támadókockát."
    },
    "Kullbee Sperado": {
      text: "Miután végrehajtottál egy %BARRELROLL% vagy %BOOST% akciót, megfordíthatod a felszerelt %CONFIG% fejlesztés kártyád."
    },
    "Kyle Katarn": {
      text: "A ütközet fázis elején átadhatod 1 fókusz jelződet egy tűzívedben lévő baráti hajónak."
    },
    "L3-37 (Escape Craft)": {
      text: "Ha nincs pajzsod, csökkentsd a nehézségét a (%BANKLEFT% és %BANKRIGHT%) manővereknek. %LINEBREAK% CO-PILOT: Amíg dokkolva vagy, az anyahajód megkapja a pilóta képességed, mintha a sajátja lenne."
    },
    "L3-37": {
      text: "Ha nincs pajzsod, csökkentsd a nehézségét a (%BANKLEFT% és %BANKRIGHT%) manővereknek."
    },
    "Laetin A'shera": {
      text: "Miután védekezel vagy támadást hajtasz végre, ha a támadás nem talált, kapsz 1 kitérés jelzőt. %LINEBREAK% WEAPON HARDPOINT: Felszerelhetsz 1 %CANNON%, %TORPEDO% vagy %MISSILE% feljesztést."
    },
    "Lando Calrissian (Scum) (Escape Craft)": {
      text: "Miután dobsz a kockákkal, ha nem vagy stresszes, kaphatsz 1 stressz jelzőt, hogy újradobhasd az összes üres eredményed. %LINEBREAK% CO-PILOT: Amíg dokkolva vagy, az anyahajód megkapja a pilóta képességed, mintha a sajátja lenne."
    },
    "Lando Calrissian": {
      text: "Miután teljesen végrehajtottál egy kék manővert, választhatsz 1 baráti hajót 0-3-as távolságban. Az a hajó végrehajthat egy akciót."
    },
    "Lando Calrissian (Scum)": {
      text: "Miután dobsz a kockákkal, ha nem vagy stresszes, kaphatsz 1 stressz jelzőt, hogy újradobhasd az összes üres eredményed."
    },
    "Latts Razzi": {
      text: "A ütközet fázis elején kiválaszthatsz egy hajót 1-es távolságban és elköltheted a rajta lévő bemérés jelződet. Ha így teszel, az a hajó kap egy vonosugár jelzőt."
    },
    '"Leebo"': {
      text: "Miután védekeztél, vagy támadást hajtottál végre, ha elköltöttél egy kalkuláció jelzőt, kapsz 1 kalkuláció jelzőt. %LINEBREAK% SENSOR BLINDSPOT: Amikor elsődleges támadást hajtasz végre 0-1-es távolságban, nem érvényesül a 0-1-es távolságért járó bónusz és 1-gyel kevesebb támadókockával dobsz."
    },
    "Leevan Tenza": {
      text: "Miután végrehajtottál egy %BARRELROLL% vagy %BOOST% akciót, végrehajthatsz egy piros %EVADE% akciót."
    },
    "Lieutenant Blount": {
      text: "Amikor elsődleges támadást hajtasz végre, ha a védekezőtől legalább 1 másik baráti hajó van 0-1-es távolságban, 1-gyel több támadókockával dobhatsz."
    },
    "Lieutenant Karsabi": {
      text: "Miután kapsz egy 'inakvív fegyverzet' jelzőt, ha nem vagy stresszes, kaphatsz 1 stressz jelzőt, hogy levedd az 'inakvív fegyverzet' jelzőt."
    },
    "Lieutenant Kestal": {
      text: "Amikor támadást hajtasz végre, miután a védekező dob a kockáival, elkölthetsz 1 fókusz jelzőt, hogy semlegesítsd a védekező összes üres és fókusz eredményét."
    },
    "Lieutenant Sai": {
      text: "Miután végrehajtottál egy %COORDINATE% akciót, ha a koordinált hajó olyan akciót hajt végre, ami a te akciósávodon is rajta van, végrehajthatod azt az akciót."
    },
    "Lok Revenant": {
      text: " "
    },
    "Lothal Rebel": {
      text: "TAIL GUN: Ha van bedokkolt a hajód, használhatod az elsődleges %REARARC% fegyvered, ugyanolyan támadási értékkel, mint a dokkolt hajó elsődleges %FRONTARC% értéke."
    },
    "Lowhhrick": {
      text: "Miután egy 0-1-es távolságban lévő baráti hajó védekezővé vált, elkölthetsz 1 erősítés jelzőt. Ha így teszel, az a hajó kap 1 kitérés jelzőt."
    },
    "Luke Skywalker": {
      text: "Miután védekező lettél (még a kockagurítás előtt), visszatölthetsz 1 %FORCE% jelzőt."
    },
    "Maarek Stele": {
      text: "Amikor támadást hajtasz végre, ha a védekező felfordított sérülés kártyát kapna, helyette húzz te 3 lapot, válassz egyet, a többit dobd el. %LINEBREAK% ADVANCED TARGETING COPMUTER: Amikor végrehajtasz egy elsődleges támadást egy olyan védekező ellen, akit bemértél, 1-gyel több támadókockával dobj és változtasd egy %HIT% eredményed %CRIT% eredményre."
    },
    "Magva Yarro": {
      text: "Amikor egy baráti hajó 0-2-es távolságban védekezik, a támadó maximum 1 kockáját dobhatja újra."
    },
    "Major Rhymer": {
      text: "Amikor végrhajtasz egy %TORPEDO% vagy %MISSILE% támadást, növelheted vagy csökkentheted a fegyver távolság követelményét 1-gyel, a 0-3 korláton belül. %LINEBREAK% NIMBLE BOMBER: Ha ledobsz egy eszközt a %STRAIGHT% sablon segítségével, használhatod az azonos sebességű %BANKLEFT% vagy %BANKRIGHT% sablonokat helyette."
    },
    "Major Vermeil": {
      text: "Amikor támadást hajtasz végre, ha a védekezőnek nincs egy zöld jelzője sem, megváltoztathatod 1 üres vagy %FOCUS% eredményedet %HIT% eredményre. %LINEBREAK% ADAPTIVE AILERONS: Mielőtt felfednéd a tárcsád, ha nem vagy stresszes, végre KELL hajtanod egy fehér (1 %BANKLEFT%), (1 %STRAIGHT%) vagy (1 %BANKRIGHT%) menővert."
    },
    "Major Vynder": {
      text: "Amikor védekezel és van 'inaktív fegyverzet' jelződ, dobj 1-gyel több védekezőkockával."
    },
    "Manaroo": {
      text: "A ütközet fázis elején kiválaszthatsz egy 0-1-es távolságban lévő baráti hajót. Ha így teszel, add át neki az összes zöld jelződ."
    },
    '"Mauler" Mithel': {
      text: "Amikor támadást hajtasz végre 1-es távolságban, dobj 1-gyel több támadókockával."
    },
    "Miranda Doni": {
      text: "Amikor elsődleges támadást hajtasz végre, elkölthetsz 1 pajzsot, hogy 1-gyel több támadókockával dobj, vagy ha nincs pajzsod, dobhatsz 1-gyel kevesebb támadókockával, hogy visszatölts 1 pajzsot."
    },
    "Moralo Eval": {
      text: "Ha lerepülsz a pályáról, elkölthetsz egy %CHARGE% jelzőt. Ha így teszel, helyezd a hajód tartalékba. A következő tervezési fázis elején helyezd a hajót a pálya széléntől 1-es távolságban azon az oldalon, ahol lerepültél."
    },
    "Nashtah Pup": {
      text: "Csak vészhelyzet esetén válhatsz le az anyahajóról. Ebben az esetben megkapod a megsemmisült baráti Hound's Tooth pilóta nevet, kezdeményezést, pilóta képességet és hajó %CHARGE% jelzőt. %LINEBREAK% ESCAPE CRAFT SETUP: HOUND'S TOOTH szükséges. A HOUND'S TOOTH-ra dokkolva kell kezdened a játékot."
    },
    "N'dru Suhlak": {
      text: "Amikor elődleges támadást hajtasz végre, ha nincs baráti hajó 0-2 távolságban, dobj 1-gyel több támadókockával."
    },
    '"Night Beast"': {
      text: "Miután teljesen végrehajtasz egy kék manővert, végrehajthatsz egy %FOCUS% akciót."
    },
    "Norra Wexley": {
      text: "Amikor védekezel, ha az ellenség 0-1-es távolságban van, hozzáadhatsz 1 %EVADE% eredményt dobásodhoz."
    },
    "Norra Wexley (Y-Wing)": {
      text: "Amikor védekezel, ha az ellenség 0-1-es távolságban van, hozzáadhatsz 1 %EVADE% eredményt dobásodhoz."
    },
    "Nu Squadron Pilot": {
      text: " "
    },
    "Obsidian Squadron Pilot": {
      text: " "
    },
    "Old Teroch": {
      text: "A ütközet fázis elején, kiválaszthatsz 1 ellenséges hajót 1-es távolságban. Ha így teszel és benne vagy a %FRONTARC% tűzívében, leveheted az összes zöld jelzőjét. %LINEBREAK% CONCORDIA FACEOFF: Amikor védekezel vagy támadást hajtasz végre, ha a támadás 1-es távolságban történik és benne vagy a támadó %FRONTARC% tűzívében, megváltoztathatod 1 dobás eredményed %EVADE% eredményre."
    },
    "Omicron Group Pilot": {
      text: " "
    },
    "Onyx Squadron Ace": {
      text: "FULL THROTTLE: Miután teljesen végrehajtottál egy 3-5 sebességű manővert, végrehajthatsz egy %EVADE% akciót."
    },
    "Onyx Squadron Scout": {
      text: " "
    },
    "Outer Rim Pioneer": {
      text: "Baráti hajók 0-1-es távolságban végrehajthatnak támadást az akadályon állva. %LINEBREAK% CO-PILOT: Amíg dokkolva vagy, az anyahajód megkapja a pilóta képességed, mintha a sajátja lenne."
    },
    "Outer Rim Smuggler": {
      text: " "
    },
    "Palob Godalhi": {
      text: "A ütközet fázis elején kiválaszthatsz 1 ellenséges hajót a tűzívedben 0-2 távolságban. Ha így teszel tedd át 1 fókusz vagy kitérés jelzőjét magadra."
    },
    "Partisan Renegade": {
      text: " "
    },
    "Patrol Leader": {
      text: " "
    },
    "Phoenix Squadron Pilot": {
      text: "VECTORED THRUSTERS: Miután végrehajtottál egy akciót, végrehajthatsz egy piros %BOOST% akciót."
    },
    "Planetary Sentinel": {
      text: "ADAPTIVE AILERONS: Mielőtt felfednéd a tárcsád, ha nem vagy stresszes, végre KELL hajtanod egy fehér (1 %BANKLEFT%), (1 %STRAIGHT%) vagy (1 %BANKRIGHT%) menővert."
    },
    "Prince Xizor": {
      text: "Amikor védekezel, az 'eredmények semlegesítése' lépésben egy másik baráti hajó 0-1 távolságban a támadó tűzívében elszenvedhet 1 %HIT% vagy %CRIT% sérülést. Ha így tesz, hatástalaníts 1 ennek megfelelő eredményt. %LINEBREAK% MICROTHRUSTERS: Amikor orsózást hajtasz végre, a (1 %BANKLEFT%) vagy (1 %BANKRIGHT%) sablont KELL használnod a (1 %STRAIGHT%) helyett."
    },
    '"Pure Sabacc"': {
      text: "Amikor támadást hajtasz végre, ha 1 vagy kevesebb sérüléskártyád van, 1-gyel több támadókockával dobhatsz. %LINEBREAK% ADAPTIVE AILERONS: Mielőtt felfednéd a tárcsád, ha nem vagy stresszes, végre KELL hajtanod egy fehér (1 %BANKLEFT%), (1 %STRAIGHT%) vagy (1 %BANKRIGHT%) menővert."
    },
    "Quinn Jast": {
      text: "Az ütközet fázis elején kaphatsz 1 'inaktív fegyverzet' jelzőt, hogy visszatölts 1 %CHARGE% jelzőt egy felszerelt fejlesztésen. %LINEBREAK% WEAPON HARDPOINT: Felszerelhetsz 1 %CANNON%, %TORPEDO% vagy %MISSILE% feljesztést."
    },
    "Rear Admiral Chiraneau": {
      text: "Amikor támadást hajtasz végre, ha van 'reinforce' jelződ és a védekező a reinforce-nak megfelelő %FULLFRONTARC% vagy %FULLREARARC% tűzívedben van, megváltoztathatod 1 %FOCUS% eredményed %CRIT% eredményre."
    },
    "Rebel Scout": {
      text: " "
    },
    "Red Squadron Veteran": {
      text: " "
    },
    '"Redline"': {
      text: "Fenntarthatsz 2 bemérő jelzőt. Miután végrehajtottál egy akciót, feltehetsz egy bemérő jelzőt."
    },
    "Rexler Brath": {
      text: "Amikor végrehajtasz egy támadást, ami talál, ha van kitérés jelződ, fordítsd fel a védekező egy sérülés kártyáját. %LINEBREAK% FULL THROTTLE: Miután teljesen végrehajtottál egy 3-5 sebességű manővert, végrehajthatsz egy %EVADE% akciót."
    },
    "Rho Squadron Pilot": {
      text: " "
    },
    "Roark Garnet": {
      text: "A ütközet fázis elején választhatsz egy tűzívedben lévő hajót. Ha így teszel, a kezdeményezési értéke ebben a fázisban 7 lesz, függetlenül a nyomtatott értékétől."
    },
    "Rogue Squadron Escort": {
      text: "EXPERIMENTAL SCANNERS: 3-as távolságon túl is bemérhetsz. Nem mérhetsz be 1-es távolságra."
    },
    "Saber Squadron Ace": {
      text: "AUTOTHRUSTERS: Miután végrehajtasz egy akciót, végrehajthatsz egy piros %BARRELROLL% vagy egy piros %BOOST% akciót."
    },
    "Sabine Wren": {
      text: "Mielőtt aktiválnád, végrehajthatsz egy %BARRELROLL% vagy egy %BOOST% akciót.%LINEBREAK%LOCKED AND LOADED: Amikor dokkolva vagy, miután anyahajód végrehajtott elsődleges %FRONTARC% vagy %TURRET% típusú támadást, végrehajthat egy bónusz %REARARC% támadást."
    },
    "Sabine Wren (Scum)": {
      text: "Amikor védekezel, ha a támadó benne van a %SINGLETURRETARC% tűzívedben 0-2-es távolságban, hozzáadhatsz 1 %FOCUS% eredményt a dobásodhoz."
    },
    "Sabine Wren (TIE Fighter)": {
      text: "Mielőtt aktiválnád, végrehajthatsz egy %BARRELROLL% vagy egy %BOOST% akciót."
    },
    "Sarco Plank": {
      text: "Amikor védekezel kezelheted a mozgékonyság értékedet úgy, hogy az megegyezzen az ebben a körben végrehajtott manővered sebességével. %LINEBREAK% SPACETUG TRACTOR ARRAY: AKCIÓ: Válassz egy hajót a %FRONTARC% tűzívedben 1-es távolságban. Az a hajó kap 1 vonósugár jelzőt vagy 2 vonósugár jelzőt, ha benne van a %BULLSEYEARC% tűzívedben 1-es távolságban."
    },
    "Saw Gerrera": {
      text: "Amikor egy sérült baráti hajó 0-3-as távolságban végrehajt egy támadást, újradobhat 1 támadókockát."
    },
    "Scarif Base Pilot": {
      text: "ADAPTIVE AILERONS: Mielőtt felfednéd a tárcsád, ha nem vagy stresszes, végre KELL hajtanod egy fehér (1 %BANKLEFT%), (1 %STRAIGHT%) vagy (1 %BANKRIGHT%) menővert."
    },
    "Scimitar Squadron Pilot": {
      text: "NIMBLE BOMBER: Ha ledobsz egy eszközt a %STRAIGHT% sablon segítségével, használhatod az azonos sebességű %BANKLEFT% vagy %BANKRIGHT% sablonokat helyette."
    },
    '"Scourge" Skutu': {
      text: "Amikor végrehajtasz egy támadást a %BULLSEYEARC% tűzívedben lévő védekező ellen, dobj 1-gyel több támadókockával."
    },
    "Serissu": {
      text: "Amikor egy baráti hajó 0-1-es távolságban védekezik, újradobhatja 1 kockáját. %LINEBREAK% WEAPON HARDPOINT: Felszerelhetsz 1 %CANNON%, %TORPEDO% vagy %MISSILE% feljesztést."
    },
    "Seventh Sister": {
      text: "Amikor végrehajtasz egy elsődleges támadást, az 'Eredmények semlegesítése' lépés előtt elkölthetsz 2 %FORCE% jelzőt, hogy hatástalaníts 1 %EVADE% eredményt."
    },
    "Seyn Marana": {
      text: "Amikor végrehajtasz egy támadást elkölthetsz 1 %CRIT% eredményt. Ha így teszel, ossz 1 lefordított sérülés kártyát a védekezőnek, majd hatástalanítsd a többi dobás eredményed."
    },
    "Shadowport Hunter": {
      text: " "
    },
    "Shara Bey": {
      text: "Amikor védekezel vagy elsődleges támadást hajtasz végre, elköltheted az ellenfeledre tett bemérés jelződet, hogy hozzáadj 1 %FOCUS% eredményt dobásodhoz."
    },
    "Sienar Specialist": {
      text: " "
    },
    "Sigma Squadron Ace": {
      text: "STYGUM ARRAY: Miután kijössz az álcázásból végrehajthatsz egy %EVADE% akciót. A vége fázis elején elkölthetsz 1 kitérés jelzőt, hogy kapj egy álcázás jelzőt."
    },
    "Skull Squadron Pilot": {
      text: "CONCORDIA FACEOFF: Amikor védekezel vagy támadást hajtasz végre, ha a támadás 1-es távolságban történik és benne vagy a támadó %FRONTARC% tűzívében, megváltoztathatod 1 dobás eredményed %EVADE% eredményre."
    },
    "Sol Sixxa": {
      text: "Ha ledobnál egy eszközt az [1 %STRAIGHT%] sablon használatával, helyette ledobhatod más 1-es sebességű sablonnal."
    },
    "Soontir Fel": {
      text: "Az ütközet fázis elején ha van ellenséges hajó a %BULLSEYEARC% tűzívedben, kapsz 1 fókusz jelzőt. %LINEBREAK% AUTOTHRUSTERS: Miután végrehajtasz egy akciót, végrehajthatsz egy piros %BARRELROLL% vagy egy piros %BOOST% akciót."
    },
    "Spice Runner": {
      text: " "
    },
    "Storm Squadron Ace": {
      text: "ADVANCED TARGETING COPMUTER: Amikor végrehajtasz egy elsődleges támadást egy olyan védekező ellen, akit bemértél, 1-gyel több támadókockával dobj és változtasd egy %HIT% eredményed %CRIT% eredményre."
    },
    "Sunny Bounder": {
      text: "Amikor védekezel vagy támadást hajtasz végre, miután dobtál vagy újradobtál kockákat, ha minden eredményed egyforma, hozzáadhatsz egy ugyanolyan eredményt a dobáshoz. %LINEBREAK% WEAPON HARDPOINT: Felszerelhetsz 1 %CANNON%, %TORPEDO% vagy %MISSILE% feljesztést."
    },
    "Tala Squadron Pilot": {
      text: " "
    },
    "Talonbane Cobra": {
      text: "Amikor 3-as távolságban védekezel vagy 1-es távolságban támadást hajtasz végre, dobj 1-gyel több kockával."
    },
    "Tansarii Point Veteran": {
      text: "WEAPON HARDPOINT: Felszerelhetsz 1 %CANNON%, %TORPEDO% vagy %MISSILE% feljesztést."
    },
    "Tel Trevura": {
      text: "Ha megsemmisülnél, elkölthetsz 1 %CHARGE% jelzőt. Ha így teszel, dobd el az összes sérülés kártyádat, szenvedj el 5 %HIT% sérülést, majd helyezd magad tartalékba. A következő tervezési fázis elején helyezd fel a hajód 1-es távolságban a saját oldaladon."
    },
    "Tempest Squadron Pilot": {
      text: "ADVANCED TARGETING COPMUTER: Amikor végrehajtasz egy elsődleges támadást egy olyan védekező ellen, akit bemértél, 1-gyel több támadókockával dobj és változtasd egy %HIT% eredményed %CRIT% eredményre."
    },
    "Ten Numb": {
      text: "Amikor védekezel vagy végrehajtasz egy támadást, elkölthetsz 1 stressz jelzőt, hogy minden %FOCUS% eredményű kockád értékét megváltoztasd %EVADE% vagy %HIT% találatra."
    },
    "Thane Kyrell": {
      text: "Amikor támadást hajtasz végre, elkölthetsz 1 %FOCUS%, %HIT% vagy %CRIT% eredményt, hogy megnézd a védekező képpel lefelé fordított sérülés kártyáit, kiválassz egyet és megfordítsd."
    },
    "Tomax Bren": {
      text: "Miután végrehajtasz egy %RELOAD% akciót, visszatölthetsz 1 %CHARGE% jelzőt 1 felszerelt %TALENT% fejlesztés kártyán. %LINEBREAK% NIMBLE BOMBER: Ha ledobsz egy eszközt a %STRAIGHT% sablon segítségével, használhatod az azonos sebességű %BANKLEFT% vagy %BANKRIGHT% sablonokat helyette."
    },
    "Torani Kulda": {
      text: "Miután végrehajtasz egy támadást, minden ellenséges hajó a %BULLSEYEARC% tűzívedben elszenved 1 %HIT% sérülést, hacsak el nem dob 1 zöld jelzőt. %LINEBREAK% DEAD TO RIGHTS: Amikor végrehajtasz egy támadást, ha a védekező benne van a %BULLSEYEARC% tűzívedben, a védekezőkockák nem módosíthatók zöld jelzőkkel."
    },
    "Torkil Mux": {
      text: "Az ütközet fázis elején kiválaszthatsz 1 hajót a tűzívedben. Ha így teszel, az a hajó ebben a körben 0-ás kezdeményezéssel kerül sorra a normál kezdeményezése helyett."
    },
    "Trandoshan Slaver": {
      text: " "
    },
    "Turr Phennir": {
      text: "Miután végrehajtasz egy támadást, végrehajthatsz egy %BARRELROLL% vagy %BOOST% akciót akkor is ha stresszes vagy. %LINEBREAK% AUTOTHRUSTERS: Miután végrehajtasz egy akciót, végrehajthatsz egy piros %BARRELROLL% vagy egy piros %BOOST% akciót."
    },
    "Unkar Plutt": {
      text: "Az ütközet fázis elején, ha van egy vagy több másik hajó 0-ás távolságban tőled, te és a 0-ás távolságra lévő hajók kapnak egy vonósugár jelzőt. %LINEBREAK% AKCIÓ: Válassz egy hajót a %FRONTARC% tűzívedben 1-es távolságban. Az a hajó kap 1 vonósugár jelzőt vagy 2 vonósugár jelzőt, ha benne van a %BULLSEYEARC% tűzívedben 1-es távolságban."
    },
    "Valen Rudor": {
      text: "Miután egy baráti hajó 0-1-es távolságban védekezik - a sérülések elkönyvelése után -, végrehajthatsz egy akciót."
    },
    "Ved Foslo": {
      text: "Amikor végrehajtasz egy manővert, végrehajthatsz egy manővert ugyanabban az irányban és nehézségben, 1-gyel kisebb vagy nagyobb sebességgel. %LINEBREAK% ADVANCED TARGETING COPMUTER: Amikor végrehajtasz egy elsődleges támadást egy olyan védekező ellen, akit bemértél, 1-gyel több támadókockával dobj és változtasd egy %HIT% eredményed %CRIT% eredményre."
    },
    "Viktor Hel": {
      text: "Miután védekeztél, ha nem pontosan 2 védekezőkockával dobtál, a támadó kap 1 stress jelzőt."
    },
    '"Vizier"': {
      text: "Miután teljesen végrehajtottál egy 1-es sebességű manővert az Adaptive Ailerons képességed használatával, végrehajthatsz egy %COORDINATE% akciót. Ha így teszel, hagyd ki az 'Akció végrehajtása' lépést. %LINEBREAK% ADAPTIVE AILERONS: Mielőtt felfednéd a tárcsád, ha nem vagy stresszes, végre KELL hajtanod egy fehér (1 %BANKLEFT%), (1 %STRAIGHT%) vagy (1 %BANKRIGHT%) menővert."
    },
    '"Wampa"': {
      text: "Amikor végrehajtasz egy támadást, elkölthetsz 1 %CHARGE% jelzőt, hogy 1-gyel több támadókockával dobj. Védekezés után elvesztesz 1 %CHARGE% jelzőt."
    },
    "Warden Squadron Pilot": {
      text: " "
    },
    "Wedge Antilles": {
      text: "Amikor támadást hajtasz végre, a védekező 1-gyel kevesebb védekezőkockával dob."
    },
    '"Whisper"': {
      text: "Miután végrehajtasz egy támadást, ami talál, kapsz 1 kitérés jelzőt. STYGUM ARRAY: Miután kijössz az álcázásból végrehajthatsz egy %EVADE% akciót. A vége fázis elején elkölthetsz 1 kitérés jelzőt, hogy kapj egy álcázás jelzőt."
    },
    "Wild Space Fringer": {
      text: "SENSOR BLINDSPOT: Amikor elsődleges támadást hajtasz végre 0-1-es távolságban, nem érvényesül a 0-1-es távolságért járó bónusz és 1-gyel kevesebb támadókockával dobsz."
    },
    "Wullffwarro": {
      text: "Amikor elsődleges támadást hajtasz végre, ha sérült vagy, 1-gyel több támadókockával dobhatsz."
    },
    "Zealous Recruit": {
      text: "CONCORDIA FACEOFF: Amikor védekezel vagy támadást hajtasz végre, ha a támadás 1-es távolságban történik és benne vagy a támadó %FRONTARC% tűzívében, megváltoztathatod 1 dobás eredményed %EVADE% eredményre."
    },
    '"Zeb" Orrelios': {
      text: "Amikor védekezel a %CRIT% találatok előbb semlegesítődnek a %HIT% találatoknál.%LINEBREAK% LOCKED AND LOADED: Amikor dokkolva vagy, miután anyahajód végrehajtott egy elsődleges %FRONTARC% vagy %TURRET% támadást, végrehajthat egy bónusz %REARARC% támadást."
    },
    '"Zeb" Orrelios (Sheathipede)': {
      text: "Amikor védekezel a %CRIT% találatok előbb semlegesítődnek a %HIT% találatoknál.%LINEBREAK% COMMS SHUTTLE: Amikor dokkolva vagy, anyahajód %COORDINATE% akció lehetőséget kap. Anyahajód az aktiválása előtt végrehajthat egy %COORDINATE% akciót."
    },
    '"Zeb" Orrelios (TIE Fighter)': {
      text: "Amikor védekezel a %CRIT% találatok előbb semlegesítődnek a %HIT% találatoknál."
    },
    "Zertik Strom": {
      text: "A vége fázis alatt elköltheted egy ellenséges hajón lévő bemérődet hogy felfordítsd egy sérülés kártyáját. %LINEBREAK% ADVANCED TARGETING COPMUTER: Amikor végrehajtasz egy elsődleges támadást egy olyan védekező ellen, akit bemértél, 1-gyel több támadókockával dobj és változtasd egy %HIT% eredményed %CRIT% eredményre."
    },
    "Zuckuss": {
      text: "Amikor végrehajtasz egy elsődleges támadást, 1-gyel több támadókockával dobhatsz. Ha így teszel, a védekező 1-gyel több védekezőkockával dob."
    },
    "Poe Dameron": {
      text: "After you perform an action, you may spend 1 %CHARGE% to perform a white action, treating it as red. %LINEBREAK% WEAPON HARDPOINT: You can equip 1 %CANNON%, %TORPEDO% or %MISSILE% upgrade."
    },
    "Lieutenant Bastian": {
      text: "After a ship at range 1-2 is dealt a damage card, you may acquire a lock on that ship. %LINEBREAK% WEAPON HARDPOINT: You can equip 1 %CANNON%, %TORPEDO% or %MISSILE% upgrade."
    },
    '"Midnight"': {
      text: "While you defend or perform an attack, if you have a lock on the enemy ship, that ship's dice cannot be modified."
    },
    '"Longshot"': {
      text: "While you perform a primary attack at attack range 3, roll 1 additional attack die."
    },
    '"Muse"': {
      text: "At the start of the Engagement Phase, you may choose a friendly ship at range 0-1. If you do, that ship removes 1 stress token."
    },
    "Kylo Ren": {
      text: " After you defend, you may spend 1 %FORCE% to assign the I'll Show You the Dark Side condition to the attacker. %LINEBREAK% AUTOTHRUSTERS: After you perform an action. you may perform a red %BARRELROLL% or a red %BOOST% action."
    },
    '"Blackout"': {
      text: " ??? %LINEBREAK% AUTOTHRUSTERS: After you perform an action. you may perform a red %BARRELROLL% or a red %BOOST% action."
    },
    "Lieutenant Dormitz": {
      text: " ... are placed, other ... be placed anywhere in ... range 0-2 of you. %LINEBREAK% ... : while you perform a %CANNON% ... additional die. "
    },
    "Tallissan Lintra": {
      text: "While an enemy ship in your %BULLSEYEARC% performs an attack, you may spend 1 %CHARGE%.  If you do, the defender rolls 1 additional die."
    },
    "Lulo Lampar": {
      text: "While you defend or perform a primary attack, if you are stressed, you must roll 1 fewer defense die or 1 additional attack die."
    },
    '"Backdraft"': {
      text: " ... perform a %TURRET% primary ... defender is in your %BACKARC% ... additional dice. %LINEBREAK% ... TURRET: You can... indicator only to your ... must treat the %FRONTARC% ... your equipped %MISSILE% ... as %TURRET%. "
    },
    '"Quickdraw"': {
      text: " ??? %LINEBREAK% ... TURRET: You can... indicator only to your ... must treat the %FRONTARC% ... your equipped %MISSILE% ... as %TURRET%. "
    },
    "Rey": {
      text: " ... perform an attack, ... in your %FRONTARC%, you may ... change 1 of your blank ... or %HIT% result. "
    },
    "Han Solo (Resistance)": {
      text: " ??? "
    },
    "Chewbacca (Resistance)": {
      text: " ??? "
    },
    "Captain Seevor": {
      text: " While you defend or perform an attack, before the attack dice are rolled, if you are not in the enemy ship's %BULLSEYEARC%, you may spend 1 %CHARGE%. If you do, the enemy ship gains one jam token. "
    },
    "Mining Guild Surveyor": {
      text: " "
    },
    "Ahhav": {
      text: " ??? "
    },
    "Finch Dallow": {
      text: " ... drop a bomb, you ... play area touching ... instead. "
    }
  };
  upgrade_translations = {
    "0-0-0": {
      text: "<i>Követelmény: Scum vagy Darth Vader</i> %LINEBREAK% Az ütközet fázis elején, kiválaszthatsz 1 ellenséges hajót 0-1-es távolságban. Ha így teszel kapsz egy kalkuláció jelzőt, hacsak a hajó nem választja, hogy kap 1 stressz jelzőt."
    },
    "4-LOM": {
      text: "Amikor végrehajtasz egy támadást, a támadókockák eldobása után, megnevezhetsz egy zöld jelző típust. Ha így teszel, kapsz 2 ion jelzőt és ezen támadás alatt a védekező nem költheti el a megnevezett típusú jelzőt."
    },
    "Ablative Plating": {
      text: "<i>Követelmény: közepes vagy nagy talp</i> %LINEBREAK% Mielőtt sérülést szenvednél egy akadálytól vagy baráti bomba robbanástól, elkölthetsz 1 %CHARGE% jelzőt. Ha így teszel, megakadályozol 1 sérülést."
    },
    "Admiral Sloane": {
      text: "Miután másik baráti hajó 0-3 távolságban védekezik, ha megsemmisül a támadó kap 2 stressz jelzőt. Amikor egy baráti hajó 0-3 távolságban végrehajt egy támadást egy stresszelt hajó ellen, 1 támadókockát újradobhat."
    },
    "Adv. Proton Torpedoes": {
      text: "Támadás (%LOCK%): Költs el 1 %CHARGE% jelzőt. Változtass 1 %HIT% eredményt %CRIT% eredményre."
    },
    "Advanced Sensors": {
      text: "Miután felfeded a tárcsádat, végrehajthatsz 1 akciót. Ha így teszel, nem hajthatsz végre másik akciót a saját aktivációdban."
    },
    "Advanced SLAM": {
      text: "<i>Követelmény: %SLAM%</i> %LINEBREAK% Miután végrehajtasz egy %SLAM% akciót, ha teljesen végrehajtod azt a manővert, végrehajthatsz egy fehér akciót az akciósávodról pirosként kezelve."
    },
    "Afterburners": {
      text: "<i>Követelmény: kis talp</i> %LINEBREAK% Miután teljesen végrehajtasz egy 3-5 sebességű manővert, elkölthetsz 1 %CHARGE% jelzőt, hogy végrehajts egy %BOOST% akciót, még ha stresszes is vagy."
    },
    "Agent Kallus": {
      text: "Felhelyezés: rendelt hozzá a 'Hunted' kondíciót 1 ellenséges hajóhoz. Amikor végrehajtasz egy támadást a 'Hunted' kondícióval rendelkező hajó ellen, 1 %FOCUS% eredményed %HIT% eredményre változtathatod."
    },
    "Agile Gunner": {
      text: "A vége fázisban forgathatod a %SINGLETURRETARC% mutatódat."
    },
    "Andrasta": {
      text: "<i>Kapott akció: %RELOAD%</i> %LINEBREAK% Kapsz egy %DEVICE% fejlesztés helyet."
    },
    "Barrage Rockets": {
      text: "Támadás (%FOCUS%): Költs el 1 %CHARGE% jelzőt. Ha a védekező benne van a %BULLSEYEARC% tűzívedben, elkölthetsz 1 vagy több %CHARGE% jelzőt, hogy újradobj azzal egyenlő számú támadókockát."
    },
    "Baze Malbus": {
      text: "Amikor végrehajtasz egy %FOCUS% akciót, kezelheted pirosként. Ha így teszel minden egyes 0-1 távolságban lévő ellenséges hajó után kapsz 1 további fókusz jelzőt, de maximum 2 darabot."
    },
    "Bistan": {
      text: "Amikor végrehajtasz egy elsődleges támadást, ha van fókusz jelződ, végrehajthatsz egy bónusz %SINGLETURRETARC% támadást egy olyan hajó ellen, akit még nem támadtál ebben a körben."
    },
    "Boba Fett": {
      text: "Felhelyezés: tartalékban kezdesz. A felrakási fázis végén tedd a hajód 0 távolságra egy akadálytól, de 3-as távolságon túl az ellenséges hajóktól."
    },
    "Bomblet Generator": {
      text: "[Bomba] A rendszer fázisban elkölthetsz 1 %CHARGE% jelzőt, hogy ledobd a Bomblet bombát a [1 %STRAIGHT%] sablonnal. Az aktivációs fázis elején elkölthetsz 1 pajzsot, hogy visszatölts 2 %CHARGE% jelzőt."
    },
    "Bossk": {
      text: "Amikor végrehajtasz egy elsődleges támadást ami nem talál, ha nem vagy stresszes kapsz 1 stressz jelzőt és végrehajtasz egy bónusz támadást ugyanazon célpont ellen."
    },
    "BT-1": {
      text: "<i>Követelmény: Scum vagy Darth Vader</i> %LINEBREAK% Amikor végrehajtasz egy támadást, megváltoztathatsz 1 %HIT% eredményt %CRIT% eredményre minden stressz  jelző után ami a védekezőnek van."
    },
    "C-3PO": {
      text: "<i>Kapott akció: %CALCULATE%</i> %LINEBREAK% Védekezőkocka gurítás előtt, elkölthetsz 1 kalkuláció jelzőt hogy hangosan tippelhess egy 1 vagy nagyobb számra. Ha így teszel és pontosan annyi %EVADE% eredményt dobsz, adjál hozzá még 1 %EVADE% eredményt. Miután végrehajtasz egy %CALCULATE% akciót, kapsz 1 kalkuláció jelzőt."
    },
    "Cad Bane": {
      text: "Miután ledobsz vagy kilősz egy eszközt, végrehajthatsz egy piros %BOOST% akciót."
    },
    "Cassian Andor": {
      text: "A rendszer fázis alatt választhatsz 1 ellenséges hajót 1-2-es távolságban. Tippeld meg hangosan menővere irányát és sebességét, aztán nézd meg a tárcsáját. Ha az iránya és sebessége egyezik a tippeddel, megváltoztathatod a saját tárcsádat egy másik manőverre."
    },
    "Chewbacca": {
      text: "Az ütközet fázis elején elkölthetsz 2 %CHARGE% jelzőt, hogy megjavíts 1 felfordított sérülés kártyát."
    },
    "Chewbacca (Scum)": {
      text: "A vége fázis elején elkölthetsz 1 focus jelzőt, hogy megjavíts 1 felfordított sérülés kártyát."
    },
    '"Chopper" (Astromech)': {
      text: "Akció: Költs el 1 nem-újratölthető %CHARGE% jelzőt egy másik felszerelt fejlesztésről, hogy visszatölts 1 pajzsot%LINEBREAK% Akció: költs el 2 pajzsot, hogy visszatölts 1 nem-újratölthető %CHARGE% jelzőt egy felszerelt fejlesztésen."
    },
    '"Chopper" (Crew)': {
      text: "Az 'Akció végrehajtása' lépés közben végrehajthatsz 1 akciót, még stresszes is. Miután stresszesen végrehajtasz egy akciót szenvedj el 1 %HIT% sérülést vagy fordítsd fel 1 sérülés kártyád."
    },
    "Ciena Ree": {
      text: "<i>Követelmény: %COORDINATE%</i> %LINEBREAK% Miután végrehajtasz egy %COORDINATE% akciót, ha a koordinált hajó végrehajt egy %BARRELROLL% vagy %BOOST% akciót, kaphat 1 stressz jelzőt, hogy elforduljon 90 fokot."
    },
    "Cikatro Vizago": {
      text: "A vége fázis alatt, választhatsz 2 %ILLICIT% fejlesztést ami baráti hajókra van felszerelve 0-1-es távolságban. Ha így teszel, megcserélheted ezeket a fejlesztéseket. A játék végén: tegyél vissza minden %ILLICIT% fejlesztést az eredeti hajójára."
    },
    "Cloaking Device": {
      text: "<i>Követelmény: kis vagy közepes talp</i> %LINEBREAK% Akció: költs el 1 %CHARGE% jelzőt, hogy végrehajts egy %CLOAK% akciót. A tervezési fázis elején dobj 1 támadó kockával. %FOCUS% eredmény esetén hozd ki a hajód álcázásból vagy vedd le az álcázás jelzőt."
    },
    "Cluster Missiles": {
      text: "Támadás (%LOCK%): Költs el 1 %CHARGE% jelzőt. Ezen támadás után végrehajthatod ezt a támadást mint bónusz támaáds egy másik célpont ellen 0-1 távolságra a védekezőtől, figyelmen kívül hagyva a %LOCK% követelményt."
    },
    "Collision Detector": {
      text: "Amikor orsózol vagy gyorsítasz átmozoghatsz vagy rámozoghatsz akadályra. Miután átmozogtál vagy rámozogtál egy akadályra, elkölthetsz 1 %CHARGE% jelzőt, hogy figyelmen kívül hagyhatsd az akadály hatását a kör végéig."
    },
    "Composure": {
      text: "<i>Követelmény: %FOCUS%</i> %LINEBREAK% Ha nem sikerül végrehajtani egy akciót és nincs zöld jelződ, végrehajthatsz egy %FOCUS% akciót."
    },
    "Concussion Missiles": {
      text: "Támadás (%LOCK%): Költs el 1 %CHARGE% jelzőt. Ha a támadás talált, a védekezőtől 0-1 távolságban lévő minden hajó felfordítja egy sérülés kártyáját."
    },
    "Conner Nets": {
      text: "[Akna] A rendszer fázisban elkölthetsz 1 %CHARGE% jelzőt, hogy ledobj egy Conner Net aknát a [1 %STRAIGHT%] sablonnal. Ennak a kártyának a %CHARGE% jelzője NEM újratölthető."
    },
    "Contraband Cybernetics": {
      text: "Mielőtt aktiválódnál, elkölthetsz 1 %CHARGE% jelzőt. Ha így teszel, a kör végéig végrehajthatsz akciókat és piros manővereket, még stresszesen is."
    },
    "Crack Shot": {
      text: "Amikor végrehajtasz egy elsődleges támadást, ha a védekező benne van a %BULLSEYEARC% tűzívedben, még az 'Eredmények semlegesítése' lépés előtt elkölthetsz 1 %CHARGE% jelzőt hogy hatástalaníts 1 %EVADE% eredményt."
    },
    "Daredevil": {
      text: "<i>Követelmény: fehér %BOOST% és kis talp</i> %LINEBREAK% Amikor végrehajtasz egy fehér %BOOST% akciót, kezelheted pirosként, hogy a [1%TURNLEFT%] vagy [1 %TURNRIGHT%] sablokokat használhasd."
    },
    "Darth Vader": {
      text: "Az ütközet fázis elején, válaszhatsz 1 hajót a tűzívedben 0-2-es távolságban és költs el 1 %FORCE% jelzőt. Ha így teszel, az a hajó elszenved 1 %HIT% sérülést, hacsak úgy nem dönt, hogy eldob 1 zöld jelzőt."
    },
    "Dauntless": {
      text: "Miután részlegesen hajtottál végre egy manővert, végrehajthatsz 1 fehér akciót pirosként kezelve."
    },
    "Deadman's Switch": {
      text: "Miután megsemmisültél, minden hajó 0-1 távolságban elszenved 1 %HIT% sérülést."
    },
    "Death Troopers": {
      text: "Az aktivációs fázis alatt az ellenséges hajók 0-1-es távolságban nem vehetik le a stressz jelzőjüket."
    },
    "Debris Gambit": {
      text: "<i>Követelmény: kis vagy közepes talp. Kapott akció: <r>%EVADE%</r></i> %LINEBREAK% Amikor végrehajtasz egy piros %EVADE% akciót, ha van 0-1-es távolságban egy akadály, kezeld az akciót fehérként."
    },
    "Dengar": {
      text: "Miután védekezel, ha a támadó a tűzívedben van, elkölthetsz 1 %CHARGE% jelzőt. Ha így teszel, dobj 1 támadókockával, hacsak a támadó úgy nem dönt, hogy eldobja 1 zöld jelzőjét. %HIT% vagy %CRIT% eredmény esetén a támadó elszenved 1 %HIT% sérülést."
    },
    "Director Krennic": {
      text: "<i>Kapott akció: %LOCK%</i> %LINEBREAK% Felhelyezés: a hajók felhelyezése előtt, rendeld hozzá az 'Optimized Prototype' kondíciót egy másik baráti hajóhoz."
    },
    "Dorsal Turret": {
      text: "<i>Kapott akció: %ROTATEARC%</i>"
    },
    "Electronic Baffle": {
      text: "A vége fázis alatt, elszenvedhetsz 1 %HIT% sérülést, hogy levegyél 1 piros jelzőt."
    },
    "Elusive": {
      text: "<i>Követelmény: kis vagy közepes talp</i> %LINEBREAK% Amikor védekezel, elkölthetsz 1 %CHARGE% jelzőt, hogy újradobj 1 védekezőkockát. Miután teljesen végrehajtottál egy piros manővert, visszatölthetsz 1 %CHARGE% jelzőt."
    },
    "Emperor Palpatine": {
      text: "Amikor egy másik baráti hajó védekezik vagy végrehajt egy támadást, elkölthetsz 1 %FORCE% jelzőt, hogy módosít annak 1 kockáját úgy, mintha az a hajó költött volna el 1 %FORCE% jelzőt."
    },
    "Engine Upgrade": {
      text: "<i>Követelmény: <r>%BOOST%</r>. Kapott akció: %BOOST% %LINEBREAK% Ennek a fejlesztésnek változó a költsége. 3, 6 vagy 9 pont attól függően, hogy kis, közepes vagy nagy talpú hajóra tesszük fel.</i>"
    },
    "Expert Handling": {
      text: "<i>Követelmény: <r>%BARRELROLL%</r>. Kapott akció: %BARRELROLL% %LINEBREAK%  Ennek a fejlesztésnek változó a költsége. 2, 4 vagy 6 pont attól függően, hogy kis, közepes vagy nagy talpú hajóra tesszük fel.</i>"
    },
    "Ezra Bridger": {
      text: "Amikor végrehajtasz egy elsődleges támadást, elkölthetsz 1 %FORCE% jelzőt, hogy végrehajts egy bónusz %SINGLETURRETARC% támadást egy olyan %SINGLETURRETARC% fegyverrel, amivel még nem támadtál ebben a körben. Ha így teszel és stresszes vagy, újradobhatsz 1 támadókockát."
    },
    "Fearless": {
      text: "Amikor végrehajtasz egy %FRONTARC% elsődleges támadást, ha a támádási távolság 1 és benne vagy a védekező %FRONTARC% tűzívében, megváltoztathatsz 1 eredményedet %HIT% eredményre."
    },
    "Feedback Array": {
      text: "Mielőtt sor kerül rád az üzközet fázisban, kaphatsz 1 ion jelzőt és 1 'inaktív fegyverzet' jelzőt. Ha így teszel, minden hajó 0-ás távolságban elszenved 1 %HIT% sérülést."
    },
    "Fifth Brother": {
      text: "Amikor végrehajtasz egy támadást, elkölthetsz 1 %FORCE% jelzőt, hogy megváltoztass 1 %FOCUS% eredményed %CRIT% eredményre."
    },
    "Fire-Control System": {
      text: "Amikor végrehajtasz egy támadást, ha van bemérőd a védekezőn, újradobhatod 1 támadókockádat. Ha így teszel, nem költheted el a bemérődet ebben a támadásban."
    },
    "Freelance Slicer": {
      text: "Amikor védekezel, mielőtt a támadó kockákat eldobnák, elköltheted a támadón lévő bemérődet, hogy dobj 1 támadókockával. Ha így teszel, a támadó kap 1 zavarás jelzőt. Majd %HIT% vagy %CRIT% eredménynél kapsz 1 zavarás jelzőt."
    },
    '"Genius"': {
      text: "Miután teljesen végrehajtottál egy manővert, ha még nem dobtál vagy lőttél ki eszközt ebben a körben, kidobhatsz 1 bombát."
    },
    "Ghost": {
      text: "Bedokkoltathatsz 1 Attack shuttle-t vagy Sheathipede-class shuttle-t. A dokkolt hajót csak a hátsó pöcköktől dokkolhatod ki."
    },
    "Grand Inquisitor": {
      text: "Miután egy ellenséges hajó 0-2-es távolságban felfedi a tárcsáját, elkölthetsz 1 %FORCE% jelzőt, hogy végrehajts 1 fehér akciót az akciósávodról, pirosként kezelve azt."
    },
    "Grand Moff Tarkin": {
      text: "<i>Követelmény: %LOCK%</i> %LINEBREAK% A rendszer fázis alatt elkölthetsz 2 %CHARGE% jelzőt. Ha így teszel, minden baráti hajó kap egy bemérőt arra a hajóra, amit te is bemértél."
    },
    "Greedo": {
      text: "Amikor végrehajtasz egy támadást, elkölthetsz 1 %CHARGE% jelzőt, hogy megváltoztass 1 %HIT% eredméynyt %CRIT% eredményre. Amikor védekezel, ha a %CHARGE% jelződ aktív, a támadó megváltoztathat 1 %HIT% eredméynyt %CRIT% eredményre."
    },
    "Han Solo": {
      text: "Az ütközet fázis alatt, 7-es kezdeményezésnél, végrehajthatsz egy SINGLETURRETARC% támadást. Nem támadhatsz újra ezzel a %SINGLETURRETARC% fegyverrel ebben a körben."
    },
    "Han Solo (Scum)": {
      text: "Mielőtt sor kerül rád az üzközet fázisban, végrehajthatsz egy piros %FOCUS% akciót."
    },
    "Havoc": {
      text: "Elveszted a %CREW% fejlesztés helyet. Kapsz egy %SENSOR% és egy %ASTROMECH% fejlesztés helyet."
    },
    "Heavy Laser Cannon": {
      text: "Támadás: a 'Támadókockák módosítása' lépés után változtasd az összes %CRIT% eredményt %HIT% eredményre."
    },
    "Heightened Perception": {
      text: "Az ütközet fázis elején, elkölthetsz 1 %FORCE% jelzőt. Ha így teszel, 7-es kezdeményezéssel kerülsz sorra ebben a fázisban a rendes kezdeményezésed helyett."
    },
    "Hera Syndulla": {
      text: "Stresszesen is végrehajthatsz piros manővert. Miután teljesen végrehajtottál egy piros manővert, ha 3 vagy több stressz jelződ van, vegyél le egy stressz jelzőt és szenvedj el 1 %HIT% sérülést."
    },
    "Homing Missiles": {
      text: "Támadás (%LOCK%): Költs el 1 %CHARGE% jelzőt. Miután kijelölted a védekezőt, a védekező dönthet úgy, hogy elszenved 1 %HIT% sérülést. Ha így tesz, ugorjátok át a 'Támadó és védekező kockák' lépést és a támadást találtnak kezeljétek."
    },
    "Hotshot Gunner": {
      text: "Amikor végrehajtasz egy %SINGLETURRETARC% támadást, a 'Védekezőkockák módosítása' lépés után a védekező dobja el 1 fókusz vagy kalkuláció jelzőjét."
    },
    "Hound's Tooth": {
      text: "1 Z-95 AF4 headhunter bedokkolhat."
    },
    "Hull Upgrade": {
      text: "Adj 1 szerkezeti értéket a hajódhoz.%LINEBREAK%<i>Ennek a fejlesztésnek változó a költsége. 2, 3, 5 vagy 7 pont attól függően, hogy a hajó 0, 1, 2 vagy 3 védekezésű.</i>"
    },
    "IG-2000": {
      text: "Megkapod minden másik IG-2000 fejlesztéssel felszerelt baráti hajó pilóraképességét."
    },
    "IG-88D": {
      text: "<i>Kapott akció: %CALCULATE%</i> %LINEBREAK% Megkapod minden IG-2000 fejlesztéssel felszerelt baráti hajó pilóraképességét. Miután végrehajtasz egy %CALCULATE% akciót, kapsz 1 kalkuláció jelzőt."
    },
    "Inertial Dampeners": {
      text: "Mielőtt végrehajtanál egy manővert, elkölthetsz 1 pajzsot. Ha így teszel, hajts végre egy fehér [0 %STOP%] manővert a tárcsázott helyett, aztán kapsz 1 stressz jelzőt."
    },
    "Informant": {
      text: "Felhelyezés: a hajók felhelyezése után válassz 1 ellenséges hajót és rendeld hozzá a 'Listening Device' kondíciót."
    },
    "Instinctive Aim": {
      text: "Amikor végrehajtasz egy speciális támadást, elkölthetsz 1 %FORCE% jelzőt, hogy vigyelmen kívül hagyhatsd a %FOCUS% vagy %LOCK% követelményt."
    },
    "Intimidation": {
      text: "Amikor egy ellenséges hajó 0-ás távolságban védekezik, 1-gyel kevesebb védekezőkockával dob."
    },
    "Ion Cannon Turret": {
      text: "<i>Kapott akció: %ROTATEARC%</i> %LINEBREAK% Támadás: ha a támadás talált, költs egy 1 %HIT% vagy %CRIT% eredményt, hogy a védekező elszenvedjen 1 %HIT% sérülést. Minden fennmaradó %HIT%/%CRIT% eredmény után sérülés helyett ion jelzőt kap a védekező."
    },
    "Ion Cannon": {
      text: "Támadás: ha a támadás talált, költs egy 1 %HIT% vagy %CRIT% eredményt, hogy a védekező elszenvedjen 1 %HIT% sérülést. Minden fennmaradó %HIT%/%CRIT% eredmény után sérülés helyett ion jelzőt kap a védekező"
    },
    "Ion Missiles": {
      text: "Támadás (%LOCK%): Költs el 1 %CHARGE% jelzőt. ha a támadás talált, költs egy 1 %HIT% vagy %CRIT% eredményt, hogy a védekező elszenvedjen 1 %HIT% sérülést. Minden fennmaradó %HIT%/%CRIT% eredmény után sérülés helyett ion jelzőt kap a védekező."
    },
    "Ion Torpedoes": {
      text: "Támadás (%LOCK%): Költs el 1 %CHARGE% jelzőt. ha a támadás talált, költs egy 1 %HIT% vagy %CRIT% eredményt, hogy a védekező elszenvedjen 1 %HIT% sérülést. Minden fennmaradó %HIT%/%CRIT% eredmény után sérülés helyett ion jelzőt kap a védekező."
    },
    "ISB Slicer": {
      text: "A vége fázis alatt az ellenséges hajók 1-2-es távban nem vehetik le a zavarás jelzőket."
    },
    "Jabba the Hutt": {
      text: "A vége fázis alatt, kiválaszthatsz 1 baráti hajót 0-2-es távolságban, majd költs el 1 %CHARGE% jelzőt. Ha így teszel, a kiválasztott hajó visszatölthet 1 %CHARGE% jelzőt 1 felszerelt %ILLICIT% fejlesztésén."
    },
    "Jamming Beam": {
      text: "Támadás: ha a támadás talált, minden %HIT%/%CRIT% eredmény után sérülés helyett zavarás jelzőt kap a védekező."
    },
    "Juke": {
      text: "<i>Követelmény: kis vagy közepes talp</i> %LINEBREAK% Amikor végrehajtasz egy támadást, ha van kitérés jelződ, megváltoztathatod a védekező 1 %EVADE% eredményét %FOCUS% eredményre."
    },
    "Jyn Erso": {
      text: "Ha egy baráti hajó 0-3 távolságban fókusz jelzőt kapna, helyette kaphat 1 kitérés jelzőt."
    },
    "Kanan Jarrus": {
      text: "Miután egy baráti hajó 0-2-es távolságban teljesen végrehajt egy manővert, elkölthetsz 1 %FORCE% jelzőt, hogy levegyél róla 1 stressz jelzőt."
    },
    "Ketsu Onyo": {
      text: "A vége fázis elején, kiválaszthatsz 1 ellenséges hajót 0-2-es távolságban a tűzívedben. Ha így teszel, aza a hajó nem veheti le a vonósugár jelzőit."
    },
    "L3-37": {
      text: "Felhelyezés: felfordítva szereld fel ezt a kártyát. Amikor védekezel, lefordíthatod ezt a kártyát. Ha így teszel, a támadónak újra kell dobnia az összes támadókockát.%LINEBREAK%<i>L3-37 programja:</i> Ha nincs pajzsod, csökkentsd a nehézségét a (%BANKLEFT% és %BANKRIGHT%) manővereknek."
    },
    "Lando Calrissian": {
      text: "Akció: dobj 2 védekezőkockával. Minden egyes %FOCUS% eredmény után kapsz 1 fókusz jelzőt. Minden egyes %EVADE% eredmény után kapsz 1 kitérés jelzőt. Ha mindkettő eredmény üres, az ellenfeled választ, hogy fókusz vagy kitérés. Kapsz 1, a választásnak megfelelő jelzőt."
    },
    "Lando Calrissian (Scum)": {
      text: "Kockadobás után elkölthetsz 1 zöld jelzőt, hogy újradobj 2 kockádat."
    },
    "Lando's Millennium Falcon": {
      text: "1 Escape Craft be lehet dokkolva. Amikor egy Escape Craft be van dokkolva, elköltheted a pajzsait, mintha a te hajódon lenne. Amikor végrehajtasz egy elsődleges támadást stresszelt hajó ellen, dobj 1-gyel több támadókockával."
    },
    "Latts Razzi": {
      text: "Amikor védekezel, ha a támadó stresszelt, levehetsz 1 stressz jelzőt a támadóról, hogy megváltoztass 1 üres/%FOCUS% eredményed %EVADE% eredményre."
    },
    "Leia Organa": {
      text: "Az aktivációs fázis elején, elkölthetsz 3 %CHARGE% jelzőt. Ezen fázis alatt minden baráti hajó csökkentse a piros manőverei nehézségét."
    },
    "Lone Wolf": {
      text: "Amikor védekezel vagy végrehajtasz egy támadást, ha nincs másik baráti hajó 0-2-es távolságban, elkölthetsz 1 %CHARGE% jelzőt, hogy újradobj 1 kockádat."
    },
    "Luke Skywalker": {
      text: "Az ütközet fázis elején, elkölthetsz 1 %FORCE% jelzőt, hogy forgasd a %SINGLETURRETARC% mutatódat."
    },
    "Magva Yarro": {
      text: "Miután védekezel, ha a támadás talált, feltehetsz egy bemérőt a támadóra."
    },
    "Marauder": {
      text: "Amikor végrehajtasz egy elsődleges %REARARC% támadást, újradobhatsz 1 támadókockádat. Kapsz egy %GUNNER% fejlesztés helyet."
    },
    "Marksmanship": {
      text: "Amikor végrehajtasz egy támadást, ha a védekező benne van a %BULLSEYEARC% tűzívedben, megváltoztathatsz 1 %HIT% eredményt %CRIT% eredményre."
    },
    "Maul": {
      text: "<i>Követelmény: Scum vagy Ezra Bridger</i> %LINEBREAK% miután sérülést szenvedsz, kaphatsz 1 stressz jelzőt, hogy visszatölts 1 %FORCE% jelzőt. Felszerelhetsz \"Dark Side\" fejlesztéseket."
    },
    "Millennium Falcon": {
      text: "<i>Kapott akció: %EVADE%</i> %LINEBREAK% Amikor védekezel, ha van kitérés jelződ, újradobhatsz 1 védekezőkockát."
    },
    "Minister Tua": {
      text: "Az ütközet fázis elején, ha sérült vagy, végrehajthatsz egy piros %REINFORCE% akciót."
    },
    "Mist Hunter": {
      text: "<i>Kapott akció: %BARRELROLL% </i> %LINEBREAK% Kapsz egy %CANNON% fejlesztés helyet."
    },
    "Moff Jerjerrod": {
      text: "<i>Követelmény: %COORDINATE%</i> %LINEBREAK% A rendszer fázis alatt, elkölthetsz 2 %CHARGE% jelzőt. Ha így teszel, válassz a (1 %BANKLEFT%), (1 %STRAIGHT%) vagy (1 %BANKRIGHT%) sablonokból. Minden baráti hajó végrehajthat egy piros %BOOST% akciót a kiválasztott sablonnal."
    },
    "Moldy Crow": {
      text: "Kapsz egy %FRONTARC% elsődleges fegyvert 3-as támadóértékkel. A vége fázis alatt megtarthatsz maximum 2 fókusz jelzőt."
    },
    "Munitions Failsafe": {
      text: "Amikor végrehajtasz egy %TORPEDO% vagy %MISSILE% támadást, a támadókockák eldobása után, elvetheted az összes kocka eredményed, hogy visszatölts 1 %CHARGE% jelzőt, amit a támadáshoz elköltöttél."
    },
    "Nien Nunb": {
      text: "Csökkentsd az íves manőverek [%BANKLEFT% és %BANKRIGHT%] nehézségét."
    },
    "Novice Technician": {
      text: "A kör végén dobhatsz 1 támadó kockával, hogy megjavíts egy felfordított sérülés kártyát. %HIT% eredménynél, fordíts fel egy sérülés kártyát."
    },
    "Os-1 Arsenal Loadout": {
      text: "Amikor pontosan 1 'inaktív fegyverzet' jelződ van, akkor is végre tudsz hajtani %TORPEDO% és %MISSILE% támadást bemért célpontok ellen. Ha így teszel, nem használhatod el a bemérődet a támadás alatt. Kapsz egy %TORPEDO% és egy %MISSILE% fejlesztés helyet."
    },
    "Outmaneuver": {
      text: "Amikor végrehajtasz egy %FRONTARC% támadást, ha nem vagy a védekező tűzívében, a védekező 1-ggyel kevesebb védekezőkockával dob."
    },
    "Outrider": {
      text: "Amikor végrehajtasz egy támadást ami egy akadály által akadályozott, a védekező 1-gyel kevesebb védekezőkockával dob. Miután teljesen végrehajtottál egy manővert, ha áthaladtál vagy átfedésbe kerültél egy akadállyal, levehetsz 1 piros vagy narancs jelződet."
    },
    "Perceptive Copilot": {
      text: "Miután végrehajtasz egy %FOCUS% akciót, kapsz 1 fókusz jelzőt."
    },
    "Phantom": {
      text: "Be tudsz dokkolni 0-1 távolságból."
    },
    "Pivot Wing": {
      text: "<b>Csukva:</b> Amikor védekezel, 1-gyel kevesebb védekezőkockával dobsz. Miután végrehajtasz egy [0 %STOP%] manővert, elforgathatod a hajód 90 vagy 180 fokkal. Mielőtt aktiválódsz, megfordíthatod ezt a kártyát. %LINEBREAK% <b>Nyitva:</b> Mielőtt aktiválódsz, megfordíthatod ezt a kártyát."
    },
    "Predator": {
      text: "Amikor végrehajtasz egy elsődleges támadást, ha a védekező benne van a %BULLSEYEARC% tűzívedben, újradobhatsz 1 támadókockát."
    },
    "Proton Bombs": {
      text: "[Bomba] A rendszer fázisban elkölthetsz 1 %CHARGE% jelzőt, hogy kidobj egy Proton bombát az [1 %STRAIGHT%] sablonnal."
    },
    "Proton Rockets": {
      text: "Támadás (%FOCUS%): Költs el 1 %CHARGE% jelzőt."
    },
    "Proton Torpedoes": {
      text: "Támadás (%LOCK%): Költs el 1 %CHARGE% jelzőt. Változtass 1 %HIT% eredményt %CRIT% eredményre."
    },
    "Proximity Mines": {
      text: "[Akna] A rendszer fázisban elkölthetsz 1 %CHARGE% jelzőt, hogy ledobj egy Proximity aknát az [1 %STRAIGHT%] sablonnal. Ennak a kártyának a %CHARGE% jelzője NEM újratölthető."
    },
    "Punishing One": {
      text: "Amikor végrehajtasz egy elsődleges támadást, ha a védekező benne van a %FRONTARC% tűzívedben, dobj 1-gyel több támadókockával. Elveszted a %CREW% fejlesztés helyet. Kapsz egy %ASTROMECH% fejlesztés helyet. "
    },
    "Qi'ra": {
      text: "Amikor mozogsz vagy támadást hajtasz végre, figyelmen kívül hagyhatod az összes akadályt, amit bemértél."
    },
    "R2 Astromech": {
      text: "Miután felfeded a tárcsád, elkölthetsz 1 %CHARGE% jelzőt és kapsz 1 'inaktív fegyverzet' jelzőt, hogy visszatölts egy pajzsot."
    },
    "R2-D2": {
      text: "Miután felfeded a tárcsád, elkölthetsz 1 %CHARGE% jelzőt és kapsz 1 'inaktív fegyverzet' jelzőt, hogy visszatölts egy pajzsot."
    },
    "R2-D2 (Crew)": {
      text: "A vége fázis alatt, ha sérült vagy és nincs pajzsod, dobhatsz 1 támadókockával, hogy visszatölts 1 pajzsot. %HIT% eredménynél, fordíts fel 1 sérüléskártyát."
    },
    "R3 Astromech": {
      text: "Fenntarthatsz 2 bemérőt. Mindegyik bemérő más célponton kell legyen. Miután végrehajtasz egy %LOCK% akciót, feltehetsz egy bemérőt."
    },
    "R4 Astromech": {
      text: "<i>Követelmény: kis talp</i> %LINEBREAK% Csökkentsd a nehézségét az 1-2 sebességű alapmanővereidnek (%TURNLEFT%, %BANKLEFT%, %STRAIGHT%, %BANKRIGHT%, %TURNRIGHT%)."
    },
    "R5 Astromech": {
      text: "Akció: Költs el 1 %CHARGE% jelzőt, hogy megjavíts egy lefordított sérülés kártyát.%LINEBREAK%Akció: Javíts meg 1 felfordított 'Ship' sérülés kártyát."
    },
    "R5-D8": {
      text: "Akció: Költs el 1 %CHARGE% jelzőt, hogy megjavíts egy lefordított sérülés kártyát.%LINEBREAK%Akció: Javíts meg 1 felfordított 'Ship' sérülés kártyát."
    },
    "R5-P8": {
      text: "Amikor végrehajtasz egy támadást a %FRONTARC% tűzívedben lévő védekező ellen, elkölthetsz 1 %CHARGE% jelzőt, hogy újradobj 1 támadókockát. Ha az újradobott eredmény %CRIT%, szenved el 1 %CRIT% sérüléste."
    },
    "R5-TK": {
      text: "Végrehajthatsz támadást baráti hajó ellen."
    },
    "Rigged Cargo Chute": {
      text: "<i>Követelmény: közepes vagy nagy talp</i> %LINEBREAK% Akció: Költs el 1 %CHARGE% jelzőt. Dobj ki 1 rakomány jelzőt az [1 %STRAIGHT%] sablonnal."
    },
    "Ruthless": {
      text: "Amikor végrehajtasz egy támadást, kiválaszthatsz másik  baráti hajót 0-1-es távolságra a védekezőtől. Ha így teszel, a kiválasztott hajó elszenved 1 %HIT% sérülést és te megváltoztathatsz 1 kocka eredményed %HIT% eredményre."
    },
    "Sabine Wren": {
      text: "Felhelyezés: tegyél fel 1 ion, 1 zavarás, 1 stressz és 1 vonósugár jelzőt erre a kártyára. Miután egy hajó sérülést szenved egy baráti bombától, levehetsz 1 ion, 1 zavarás, 1 stressz vagy 1 vonosugár jelzőt erről a kártyáról. Ha így teszel, az a hajó megkapja ezt a jelzőt."
    },
    "Saturation Salvo": {
      text: "<i>Követelmény: %RELOAD%</i> %LINEBREAK% Amikor végrehajtasz egy %TORPEDO% vagy %MISSILE% támadást, elkölthetsz 1 %CHARGE% jelzőt arról a kártyától. Ha így teszel, válassz 2 védekezőkockát. A védekezőnek újra kell dobnia azokat a kockákat."
    },
    "Saw Gerrera": {
      text: "Amikor végrehajtasz egy támadást, elszenvedhetsz 1 %HIT% sérülést, hogy megváltoztasd az összes %FOCUS% eredményed %CRIT% eredményre."
    },
    "Seasoned Navigator": {
      text: "Miután felfedted a tárcsádat, átállíthatod egy másik nem piros manőverre ugyanazon sebességen. Amikor végrehajtod azt a manővert növeld meg a nehézségét."
    },
    "Seismic Charges": {
      text: "[Bomba] A rendszer fázisban elkölthetsz 1 %CHARGE% jelzőt, hogy ledobj egy Seismic Charge bombát az [1 %STRAIGHT%] sablonnal."
    },
    "Selfless": {
      text: "Amikor másik baráti hajó 0-1-es távolságban védekezik, az 'eredmények semlegesítése' lépés előtt, ha benne vagy a támadási tűzívben, elszenvedhetsz 1 %CRIT% sérülést, hogy semlegesíts 1 %CRIT% eredményt."
    },
    "Sense": {
      text: "A rendszer fázis alatt kiválaszthatsz 1 hajót 0-1-es távolságban és megnézheted a tárcsáját. Ha elköltesz 1 %FORCE% jelzőt választhatsz 0-3-as távolságból is hajót."
    },
    "Servomotor S-Foils": {
      text: "<b>Csukva:</b> Amikor végrehajtasz egy elsődleges támadást, 1-gyel kevesebb támadókockával dobj. Mielőtt aktiválódsz, megfordíthatod ezt a kártyát. %LINEBREAK% <i>Kapott akciók: %BOOST%, %FOCUS% > <r>%BOOST%</r></i> %LINEBREAK% <b>Nyitva:</b> Mielőtt aktiválódsz, megfordíthatod ezt a kártyát"
    },
    "Seventh Sister": {
      text: "Ha egy ellenséges hajó 0-1-es távolságra egy stressz jelzőt kapna, elkölthetsz 1 %FORCE% jelzőt, hogy 1 zavarás vagy vonósugár jelzőt kapjon helyette."
    },
    "Shadow Caster": {
      text: "Miután végrehajtasz egy támadást ami talál, ha a védekező benne van egyszerre a %SINGLETURRETARC% és %FRONTARC% tűzívedben, a védekező kap 1 vonósugár jelzőt."
    },
    "Shield Upgrade": {
      text: "Adj 1 pajzs értéket a hajódhoz.%LINEBREAK%<i>Ennek a fejlesztésnek változó a költsége. 3, 4, 6 vagy 8 pont attól függően, hogy a hajó 0, 1, 2 vagy 3 védekezésű.</i>"
    },
    "Skilled Bombardier": {
      text: "Ha ledobsz vagy kilősz egy eszközt, megegyező irányban használhatsz 1-gyel nagyob vagy kisebb sablont."
    },
    "Slave I": {
      text: "Miután felfedtél egy kanyar (%TURNLEFT% or %TURNRIGHT%) vagy ív (%BANKLEFT% or %BANKRIGHT%) manővert, átforgathatod a tárcsádat az ellenkező irányba megtartva a sebességet és a mozgásformát. Kapsz egy %TORPEDO% fejlesztés helyet."
    },
    "Squad Leader": {
      text: "<i>Kapott akció: <r>%COORDINATE%</r></i> %LINEBREAK% Amikor koordinálsz, a kiválasztott hajó csak olyan akciót hajthat végre, ami a te akciósávodon is rajta van."
    },
    "ST-321": {
      text: "Amikor végrehajtasz egy %COORDINATE% akciót, kiválaszthatsz egy ellenséges hajót 0-3-as távolságban a koordinált hajótól. Ha így teszel, tegyél fel egy bemérőt arra az ellenséges hajóra figyelmen kívül hagyva a távolság megkötéseket."
    },
    "Static Discharge Vanes": {
      text: "Mielőtt kapnál 1 ion vagy zavarás jelzőt, ha nem vagy stresszes, választhatsz egy másik hajót 0-1-es távolságban és kapsz 1 stressz jelzőt. Ha így teszel, a kiválasztott hajó kapja meg az ion vagy zavarás jelzőt helyetted."
    },
    "Stealth Device": {
      text: "Amikor védekezel, ha a %CHARGE% jelződ aktív, dobj 1-gyel több védekezőkockával. Miután elszenvedsz egy sérülés, elvesztesz 1 %CHARGE% jelzőt. %LINEBREAK%<i>Ennek a fejlesztésnek változó a költsége. 3, 4, 6 vagy 8 pont attól függően, hogy a hajó 0, 1, 2 vagy 3 védekezésű.</i>"
    },
    "Supernatural Reflexes": {
      text: "<i>Követelmény: kis talp</i> %LINEBREAK% Mielőtt aktiválódsz, elkölthetsz 1 %FORCE% jelzőt, hogy végrehajts egy %BARRELROLL% vagy %BOOST% akciót. Ha olyan akciót hajtottál végre, ami nincs az akciósávodon, elszenvedsz 1 %HIT% sérülést."
    },
    "Swarm Tactics": {
      text: "Az ütközet fázis elején, kiválaszthatsz 1 baráti hajót 1-es távolságban. Ha így teszel, az a hajó a kör végéig kezelje úgy a kezdeményezés értékét, mintha egyenlő lenne a tiéddel."
    },
    "Tactical Officer": {
      text: "<i>Követelmény: <r>%COORDINATE%</r>. Kapott akció: %COORDINATE%</i>"
    },
    "Tactical Scrambler": {
      text: "<i>Követelmény: közepes vagy nagy talp</i> %LINEBREAK% Amikor akadályozod egy ellenséges hajó támadását, a védekező 1-gyel több védekezőkockával dob."
    },
    "Tobias Beckett": {
      text: "Felhelyezés: a hajók felhelyezése után, kiválaszthatsz 1 akadályt a pályáról. Ha így teszel, helyezd át bárhová 2-es távolságra a szélektől vagy hajóktól és 1-es távolságra más akadályoktól."
    },
    "Tractor Beam": {
      text: "Támadás: ha a támadás talált, minden %HIT%/%CRIT% eredmény után sérülés helyett vonósugár jelzőt kap a védekező."
    },
    "Trajectory Simulator": {
      text: "A rendszer fázis alatt, ha ledobsz vagy kilősz egy bombát, kilőheted a (5 %STRAIGHT%) sablonnal."
    },
    "Trick Shot": {
      text: "Amikor végrehajtasz egy támadást ami akadályozott egy akadály által, dobj 1-gyel több támadókockával."
    },
    "Unkar Plutt": {
      text: "Miután részlegesen végrehajtottál egy manővert, elszenvedhetsz 1 %HIT% sérülést, hogy végrehajts 1 fehér akciót."
    },
    "Veteran Tail Gunner": {
      text: "<i>Követelmény: %REARARC%</i> %LINEBREAK% miután végrehajtasz egy elsődleges %FRONTARC% támadást, végrehajthatsz egy bónusz elsődleges %REARARC% támadást."
    },
    "Veteran Turret Gunner": {
      text: "<i>Követelmény: %ROTATEARC%</i> %LINEBREAK% Amikor végrehajtasz egy elsődleges támadást, végrehajthatsz egy bónusz %SINGLETURRETARC% egy olyan %SINGLETURRETARC% fegyverrel, amit még nem használtál ebben a körben."
    },
    "Virago": {
      text: "A vége fázis alatt, elkölthetsz 1 %CHARGE% jelzőt, hogy végrehajts egy piros %BOOST% akciót. Kapsz egy %MODIFICATION% fejlesztés helyet. Adj 1 pajzs értéket a hajódhoz."
    },
    "Xg-1 Assault Configuration": {
      text: "Amikor pontosan 1 'inaktív fegyverzet' jelződ van, akkor is végrehajthatsz %CANNON% támadást. Amikor %CANNON% támadást hajtasz végre 'inaktív fegyverzet' jelzővel, maximum 3 támadókockával dobhatsz. Kapsz egy %CANNON% fejlesztés helyet."
    },
    '"Zeb" Orrelios': {
      text: "Végrehajthatsz elsődleges támadást 0-ás távolságban. Az ellenséges hajók 0-ás távolságban végrehajthatnak elsődleges támadást ellened."
    },
    "Zuckuss": {
      text: "Amikor végrehajtasz egy támadást, ha nem vagy stresszes, válaszhatsz 1 védekezőkockát és kapsz 1 stressz jelzőt. Ha így teszel, a védekezőnek újra kell dobnia azt a kockát."
    },
    'GNK "Gonk" Droid': {
      text: "Felhelyezés: Elvesztesz 1 %CHARGE% jelzőt. Akció: tölts vissza 1 %CHARGE% jelzőt. Akció: Költs el 1 %CHARGE% jelzőt, hogy visszatölts egy pajzsot."
    },
    "Hardpoint: Cannon": {
      text: "Kapsz egy %CANNON% fejlesztés helyet."
    },
    "Hardpoint: Missile": {
      text: "Kapsz egy %MISSILE% fejlesztés helyet."
    },
    "Hardpoint: Torpedo": {
      text: "Kapsz egy %TORPEDO% fejlesztés helyet."
    },
    "Black One": {
      text: "<i>Adds: %SLAM%</i> %LINEBREAK% After you perform a %SLAM% action, lose 1 %CHARGE%. Then you may gain 1 ion token to remove 1 disarm token. %LINEBREAK% If your charge is inactive, you cannot perform the %SLAM% action."
    },
    "Heroic": {
      text: " While you defend or perform an attack, if you have only blank results and have 2 or more results, you may reroll any number of your dice. "
    },
    "Rose Tico": {
      text: " ??? "
    },
    "Finn": {
      text: " While you defend or perform a primary attack, if the enemy ship is in your %FRONTARC%, you may add 1 blank result to your roll ... can be rerolled or otherwise ...  "
    },
    "Integrated S-Foils": {
      text: "<b>Closed:</b> While you perform a primary attack, if the defender is not in your %BULLSEYEARC%, roll 1 fewer attack die. Before you activate, you may flip this card. %LINEBREAK% <i>Adds: %BARRELROLL%, %FOCUS% > <r>%BARRELROLL%</r></i> %LINEBREAK% <b>Open:</b> ???"
    },
    "Targeting Synchronizer": {
      text: "<i>Requires: %LOCK%</i> %LINEBREAK% While a friendly ship at range 1-2 performs an attack against a target you have locked, that ship ignores the %LOCK% attack requirement. "
    },
    "Primed Thrusters": {
      text: "<i>Requires: Small Base</i> %LINEBREAK% While you have 2 or fewer stress tokens, you can perform %BARRELROLL% and %BOOST% actions even while stressed. "
    },
    "Kylo Ren (Crew)": {
      text: " Action: Choose 1 enemy ship at range 1-3. If you do, spend 1 %FORCE% to assign the I'll Show You the Dark Side condition to that ship. "
    },
    "General Hux": {
      text: " ... perform a white %COORDINATE% action ... it as red. If you do, you ... up to 2 additional ships ... ship type, and each ship you coordinate must perform the same action, treating that action as red. "
    },
    "Fanatical": {
      text: " While you perform a primary attack, if you are not shielded, you may change 1 %FOCUS% result to a %HIT% result. "
    },
    "Special Forces Gunner": {
      text: " ... you perform a primary %FRONTARC% attack, ... your %SINGLETURRETARC% is in your %FRONTARC%, you may roll 1 additional attack die. After you perform a primary %FRONTARC% attack, ... your %TURRET% is in your %BACKARC%, you may perform a bonus primary %SINGLETURRETARC% attack. "
    },
    "Captain Phasma": {
      text: " ??? "
    },
    "Supreme Leader Snoke": {
      text: " ??? "
    },
    "Hyperspace Tracking Data": {
      text: " Setup: Before placing forces, you may ... 0 and 6 ... "
    },
    "Advanced Optics": {
      text: " While you perform an attack, you may spend 1 focus to change 1 of your blank results to a %HIT% result. "
    },
    "Rey (Gunner)": {
      text: " ... defend or ... If the ... in your %SINGLETURRETARC% ... 1 %FORCE% to ... 1 of your blank results to a %EVADE% or %HIT% result. "
    }
  };
  condition_translations = {
    'Suppressive Fire': {
      text: 'Amikor végrehajtasz egy támadást más hajó ellen mint <strong>Captain Rex</strong>, dobj 1-gyel kevesebb kockával. %LINEBREAK% Miután <strong>Captain Rex</strong> védekezik, vedd le ezt a kártyát.  %LINEBREAK% Az ütközet fázis végén, ha <strong>Captain Rex</strong> nem hajtott végre támadást ebben a fázisban, vedd le ezt a kártyát. %LINEBREAK% Miután <strong>Captain Rex</strong> megsemmisült, vedd le ezt a kártyát.'
    },
    'Hunted': {
      text: 'Miután megsemmisültél, választanod kell egy baráti hajót és átadni neki ezt a kondíció kártyát.'
    },
    'Listening Device': {
      text: 'A rendszer fázisban, ha egy ellenséges hajó az <strong>Informant</strong> fejlesztéssel 0-2-es távolságban van, fedd fel a tárcsád.'
    },
    'Optimized Prototype': {
      text: 'Amikor végrehajtasz egy elsődleges %FRONTARC% támadást egy olyan hajó ellen, amit bemért <strong>Director Krennic</strong> fejlesztéssel felszerelt hajó, elkölthetsz 1 %HIT%/%CRIT%/%FOCUS% eredményt. Ha így teszel, választhatsz, hogy a védekező elveszt 1 pajzsot vagy a védekező felfordítja 1 sérüléskártyáját.'
    },
    'I\'ll Show You the Dark Side': {
      text: ' ??? '
    },
    'Proton Bomb': {
      text: '(Bomba jelző) - Az aktivációs fázis végén ez az eszköz felrobban. Amikor ez az eszköz felrobban, minden hajó 0–1-es távolságban elszenved 1 %CRIT% sérülést.'
    },
    'Seismic Charge': {
      text: '(Bomb jelző) - Az aktivációs fázis végén ez az eszköz felrobban. Amikor ez az eszköz felrobban, válassz 1 akadály 0–1-es távolságban. Minden hajó 0–1-es távolságra az akadálytól elszenved 1 %HIT% sérülést. Aztán vedd le az akadályt. '
    },
    'Bomblet': {
      text: '(Bomb jelző) - Az aktivációs fázis végén ez az eszköz felrobban. Amikor ez az eszköz felrobban, minden hajó 0–1-es távolságban dob 2 támadókockával. Minden hajó elszenved 1 %HIT% sérülést minden egyes %HIT%/%CRIT% eredmény után.'
    },
    'Loose Cargo': {
      text: '(Űrszemég jelző) - A kidobott rakomány űrszemétnek számít.'
    },
    'Conner Net': {
      text: '(Akna jelző) - Miután egy hajó átmozog vagy átfedésbe kerül ezzel az eszközzel, az felrobban. Amikor ez az eszköz felrobban, a hajó elszenved 1 %HIT% sérülést és kap 3 ion jelzőt.'
    },
    'Proximity Mine': {
      text: '(Akna jelző) - Miután egy hajó átmozog vagy átfedésbe kerül ezzel az eszközzel,  az felrobban. Amikor ez az eszköz felrobban, a hajó dob 2 támadókockával, aztán elszenved 1 %HIT%, valamint a dobott eremény szerint 1-1 %HIT%/%CRIT% sérülést.'
    }
  };
  return modification_translations = title_translations = exportObj.setupCardData(basic_cards, pilot_translations, upgrade_translations, condition_translations, modification_translations, title_translations);
};

exportObj = typeof exports !== "undefined" && exports !== null ? exports : this;

if ((_base = String.prototype).startsWith == null) {
  _base.startsWith = function(t) {
    return this.indexOf(t === 0);
  };
}

sortWithoutQuotes = function(a, b) {
  var a_name, b_name;
  a_name = a.replace(/[^a-z0-9]/ig, '');
  b_name = b.replace(/[^a-z0-9]/ig, '');
  if (a_name < b_name) {
    return -1;
  } else if (a_name > b_name) {
    return 1;
  } else {
    return 0;
  }
};

exportObj.manifestBySettings = {
  'collectioncheck': true
};

exportObj.manifestByExpansion = {
  'Second Edition Core Set': [
    {
      name: 'X-Wing',
      type: 'ship',
      count: 1
    }, {
      name: 'TIE Fighter',
      type: 'ship',
      count: 2
    }, {
      name: 'Luke Skywalker',
      type: 'pilot',
      count: 1
    }, {
      name: 'Jek Porkins',
      type: 'pilot',
      count: 1
    }, {
      name: 'Red Squadron Veteran',
      type: 'pilot',
      count: 1
    }, {
      name: 'Blue Squadron Escort',
      type: 'pilot',
      count: 1
    }, {
      name: 'Iden Versio',
      type: 'pilot',
      count: 1
    }, {
      name: 'Valen Rudor',
      type: 'pilot',
      count: 1
    }, {
      name: 'Black Squadron Ace',
      type: 'pilot',
      count: 2
    }, {
      name: '"Night Beast"',
      type: 'pilot',
      count: 1
    }, {
      name: 'Obsidian Squadron Pilot',
      type: 'pilot',
      count: 2
    }, {
      name: 'Academy Pilot',
      type: 'pilot',
      count: 2
    }, {
      name: 'Elusive',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Outmaneuver',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Predator',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Heightened Perception',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Instinctive Aim',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Sense',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Supernatural Reflexes',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Proton Torpedoes',
      type: 'upgrade',
      count: 1
    }, {
      name: 'R2 Astromech',
      type: 'upgrade',
      count: 1
    }, {
      name: 'R2-D2',
      type: 'upgrade',
      count: 1
    }, {
      name: 'R3 Astromech',
      type: 'upgrade',
      count: 1
    }, {
      name: 'R5 Astromech',
      type: 'upgrade',
      count: 1
    }, {
      name: 'R5-D8',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Servomotor S-Foils',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Afterburners',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Hull Upgrade',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Shield Upgrade',
      type: 'upgrade',
      count: 1
    }
  ],
  "Saw's Renegades Expansion Pack": [
    {
      name: 'U-Wing',
      type: 'ship',
      count: 1
    }, {
      name: 'X-Wing',
      type: 'ship',
      count: 1
    }, {
      name: 'Saw Gerrera',
      type: 'pilot',
      count: 1
    }, {
      name: 'Magva Yarro',
      type: 'pilot',
      count: 1
    }, {
      name: 'Benthic Two-Tubes',
      type: 'pilot',
      count: 1
    }, {
      name: 'Partisan Renegade',
      type: 'pilot',
      count: 1
    }, {
      name: 'Kullbee Sperado',
      type: 'pilot',
      count: 1
    }, {
      name: 'Leevan Tenza',
      type: 'pilot',
      count: 1
    }, {
      name: 'Edrio Two-Tubes',
      type: 'pilot',
      count: 1
    }, {
      name: 'Cavern Angels Zealot',
      type: 'pilot',
      count: 3
    }, {
      name: 'R3 Astromech',
      type: 'upgrade',
      count: 1
    }, {
      name: 'R4 Astromech',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Saw Gerrera',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Magva Yarro',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Pivot Wing',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Servomotor S-Foils',
      type: 'upgrade',
      count: 1
    }, {
      name: "Deadman's Switch",
      type: 'upgrade',
      count: 2
    }, {
      name: 'Advanced Sensors',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Trick Shot',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Proton Torpedoes',
      type: 'upgrade',
      count: 1
    }
  ],
  'TIE Reaper Expansion Pack': [
    {
      name: 'TIE Reaper',
      type: 'ship',
      count: 1
    }, {
      name: 'Major Vermeil',
      type: 'pilot',
      count: 1
    }, {
      name: 'Captain Feroph',
      type: 'pilot',
      count: 1
    }, {
      name: '"Vizier"',
      type: 'pilot',
      count: 1
    }, {
      name: 'Scarif Base Pilot',
      type: 'pilot',
      count: 1
    }, {
      name: 'Director Krennic',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Death Troopers',
      type: 'upgrade',
      count: 1
    }, {
      name: 'ISB Slicer',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Tactical Officer',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Swarm Tactics',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Juke',
      type: 'upgrade',
      count: 2
    }
  ],
  'Rebel Alliance Conversion Kit': [
    {
      name: 'Thane Kyrell',
      type: 'pilot',
      count: 1
    }, {
      name: 'Norra Wexley (Y-Wing)',
      type: 'pilot',
      count: 1
    }, {
      name: 'Evaan Verlaine',
      type: 'pilot',
      count: 1
    }, {
      name: 'Biggs Darklighter',
      type: 'pilot',
      count: 1
    }, {
      name: 'Garven Dreis (X-Wing)',
      type: 'pilot',
      count: 1
    }, {
      name: 'Wedge Antilles',
      type: 'pilot',
      count: 1
    }, {
      name: 'Blue Squadron Escort',
      type: 'pilot',
      count: 2
    }, {
      name: 'Red Squadron Veteran',
      type: 'pilot',
      count: 2
    }, {
      name: '"Dutch" Vander',
      type: 'pilot',
      count: 1
    }, {
      name: 'Horton Salm',
      type: 'pilot',
      count: 1
    }, {
      name: 'Gold Squadron Veteran',
      type: 'pilot',
      count: 2
    }, {
      name: 'Gray Squadron Bomber',
      type: 'pilot',
      count: 2
    }, {
      name: 'Arvel Crynyd',
      type: 'pilot',
      count: 1
    }, {
      name: 'Jake Farrell',
      type: 'pilot',
      count: 1
    }, {
      name: 'Green Squadron Pilot',
      type: 'pilot',
      count: 2
    }, {
      name: 'Phoenix Squadron Pilot',
      type: 'pilot',
      count: 2
    }, {
      name: 'Braylen Stramm',
      type: 'pilot',
      count: 1
    }, {
      name: 'Ten Numb',
      type: 'pilot',
      count: 1
    }, {
      name: 'Blue Squadron Pilot',
      type: 'pilot',
      count: 2
    }, {
      name: 'Blade Squadron Veteran',
      type: 'pilot',
      count: 2
    }, {
      name: 'Airen Cracken',
      type: 'pilot',
      count: 1
    }, {
      name: 'Lieutenant Blount',
      type: 'pilot',
      count: 1
    }, {
      name: 'Bandit Squadron Pilot',
      type: 'pilot',
      count: 3
    }, {
      name: 'Tala Squadron Pilot',
      type: 'pilot',
      count: 3
    }, {
      name: 'Lowhhrick',
      type: 'pilot',
      count: 1
    }, {
      name: 'Wullffwarro',
      type: 'pilot',
      count: 1
    }, {
      name: 'Kashyyyk Defender',
      type: 'pilot',
      count: 2
    }, {
      name: 'Ezra Bridger',
      type: 'pilot',
      count: 1
    }, {
      name: 'Hera Syndulla',
      type: 'pilot',
      count: 1
    }, {
      name: 'Sabine Wren',
      type: 'pilot',
      count: 1
    }, {
      name: '"Zeb" Orrelios',
      type: 'pilot',
      count: 1
    }, {
      name: 'AP-5',
      type: 'pilot',
      count: 1
    }, {
      name: 'Ezra Bridger (Sheathipede)',
      type: 'pilot',
      count: 1
    }, {
      name: 'Fenn Rau (Sheathipede)',
      type: 'pilot',
      count: 1
    }, {
      name: '"Zeb" Orrelios (Sheathipede)',
      type: 'pilot',
      count: 1
    }, {
      name: 'Jan Ors',
      type: 'pilot',
      count: 1
    }, {
      name: 'Kyle Katarn',
      type: 'pilot',
      count: 1
    }, {
      name: 'Roark Garnet',
      type: 'pilot',
      count: 1
    }, {
      name: 'Rebel Scout',
      type: 'pilot',
      count: 2
    }, {
      name: 'Captain Rex',
      type: 'pilot',
      count: 1
    }, {
      name: 'Ezra Bridger (TIE Fighter)',
      type: 'pilot',
      count: 1
    }, {
      name: 'Sabine Wren (TIE Fighter)',
      type: 'pilot',
      count: 1
    }, {
      name: '"Zeb" Orrelios (TIE Fighter)',
      type: 'pilot',
      count: 1
    }, {
      name: 'Corran Horn',
      type: 'pilot',
      count: 1
    }, {
      name: 'Gavin Darklighter',
      type: 'pilot',
      count: 1
    }, {
      name: 'Knave Squadron Escort',
      type: 'pilot',
      count: 2
    }, {
      name: 'Rogue Squadron Escort',
      type: 'pilot',
      count: 2
    }, {
      name: 'Bodhi Rook',
      type: 'pilot',
      count: 1
    }, {
      name: 'Cassian Andor',
      type: 'pilot',
      count: 1
    }, {
      name: 'Heff Tobber',
      type: 'pilot',
      count: 1
    }, {
      name: 'Blue Squadron Scout',
      type: 'pilot',
      count: 2
    }, {
      name: 'Esege Tuketu',
      type: 'pilot',
      count: 1
    }, {
      name: 'Miranda Doni',
      type: 'pilot',
      count: 1
    }, {
      name: 'Warden Squadron Pilot',
      type: 'pilot',
      count: 2
    }, {
      name: 'Garven Dreis',
      type: 'pilot',
      count: 1
    }, {
      name: 'Ibtisam',
      type: 'pilot',
      count: 1
    }, {
      name: 'Norra Wexley',
      type: 'pilot',
      count: 1
    }, {
      name: 'Shara Bey',
      type: 'pilot',
      count: 1
    }, {
      name: 'Chewbacca',
      type: 'pilot',
      count: 1
    }, {
      name: 'Han Solo',
      type: 'pilot',
      count: 1
    }, {
      name: 'Lando Calrissian',
      type: 'pilot',
      count: 1
    }, {
      name: 'Outer Rim Smuggler',
      type: 'pilot',
      count: 1
    }, {
      name: '"Chopper"',
      type: 'pilot',
      count: 1
    }, {
      name: 'Hera Syndulla (VCX-100)',
      type: 'pilot',
      count: 1
    }, {
      name: 'Kanan Jarrus',
      type: 'pilot',
      count: 1
    }, {
      name: 'Lothal Rebel',
      type: 'pilot',
      count: 1
    }, {
      name: 'Dash Rendar',
      type: 'pilot',
      count: 1
    }, {
      name: '"Leebo"',
      type: 'pilot',
      count: 1
    }, {
      name: 'Wild Space Fringer',
      type: 'pilot',
      count: 1
    }, {
      name: 'Crack Shot',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Daredevil',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Debris Gambit',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Elusive',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Expert Handling',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Intimidation',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Juke',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Lone Wolf',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Marksmanship',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Outmaneuver',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Predator',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Saturation Salvo',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Selfless',
      type: 'upgrade',
      count: 3
    }, {
      name: 'Squad Leader',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Swarm Tactics',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Trick Shot',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Advanced Sensors',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Collision Detector',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Fire-Control System',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Cloaking Device',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Contraband Cybernetics',
      type: 'upgrade',
      count: 2
    }, {
      name: "Deadman's Switch",
      type: 'upgrade',
      count: 2
    }, {
      name: 'Feedback Array',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Inertial Dampeners',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Rigged Cargo Chute',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Heavy Laser Cannon',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Ion Cannon',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Jamming Beam',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Tractor Beam',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Dorsal Turret',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Ion Cannon Turret',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Adv. Proton Torpedoes',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Ion Torpedoes',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Proton Torpedoes',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Baze Malbus',
      type: 'upgrade',
      count: 1
    }, {
      name: 'C-3PO',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Cassian Andor',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Chewbacca',
      type: 'upgrade',
      count: 1
    }, {
      name: '"Chopper" (Crew)',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Freelance Slicer',
      type: 'upgrade',
      count: 2
    }, {
      name: 'GNK "Gonk" Droid',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Hera Syndulla',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Informant',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Jyn Erso',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Kanan Jarrus',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Lando Calrissian',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Leia Organa',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Nien Nunb',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Novice Technician',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Perceptive Copilot',
      type: 'upgrade',
      count: 2
    }, {
      name: 'R2-D2 (Crew)',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Sabine Wren',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Seasoned Navigator',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Tactical Officer',
      type: 'upgrade',
      count: 1
    }, {
      name: '"Zeb" Orrelios',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Cluster Missiles',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Concussion Missiles',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Homing Missiles',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Ion Missiles',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Proton Rockets',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Bomblet Generator',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Conner Nets',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Proton Bombs',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Proximity Mines',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Seismic Charges',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Ghost',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Millennium Falcon',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Moldy Crow',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Outrider',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Phantom',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Pivot Wing',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Servomotor S-Foils',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Bistan',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Ezra Bridger',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Han Solo',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Hotshot Gunner',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Luke Skywalker',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Skilled Bombardier',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Veteran Tail Gunner',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Veteran Turret Gunner',
      type: 'upgrade',
      count: 2
    }, {
      name: '"Chopper" (Astromech)',
      type: 'upgrade',
      count: 1
    }, {
      name: 'R2 Astromech',
      type: 'upgrade',
      count: 2
    }, {
      name: 'R3 Astromech',
      type: 'upgrade',
      count: 2
    }, {
      name: 'R4 Astromech',
      type: 'upgrade',
      count: 2
    }, {
      name: 'R5 Astromech',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Ablative Plating',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Advanced SLAM',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Electronic Baffle',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Engine Upgrade',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Hull Upgrade',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Munitions Failsafe',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Shield Upgrade',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Static Discharge Vanes',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Stealth Device',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Tactical Scrambler',
      type: 'upgrade',
      count: 2
    }
  ],
  'Galactic Empire Conversion Kit': [
    {
      name: 'Ved Foslo',
      type: 'pilot',
      count: 1
    }, {
      name: 'Del Meeko',
      type: 'pilot',
      count: 1
    }, {
      name: 'Gideon Hask',
      type: 'pilot',
      count: 1
    }, {
      name: 'Seyn Marana',
      type: 'pilot',
      count: 1
    }, {
      name: '"Howlrunner"',
      type: 'pilot',
      count: 1
    }, {
      name: '"Mauler" Mithel',
      type: 'pilot',
      count: 1
    }, {
      name: '"Scourge" Skutu',
      type: 'pilot',
      count: 1
    }, {
      name: '"Wampa"',
      type: 'pilot',
      count: 1
    }, {
      name: 'Black Squadron Ace',
      type: 'pilot',
      count: 4
    }, {
      name: 'Obsidian Squadron Pilot',
      type: 'pilot',
      count: 4
    }, {
      name: 'Academy Pilot',
      type: 'pilot',
      count: 4
    }, {
      name: 'Darth Vader',
      type: 'pilot',
      count: 1
    }, {
      name: 'Maarek Stele',
      type: 'pilot',
      count: 1
    }, {
      name: 'Zertik Strom',
      type: 'pilot',
      count: 1
    }, {
      name: 'Storm Squadron Ace',
      type: 'pilot',
      count: 2
    }, {
      name: 'Tempest Squadron Pilot',
      type: 'pilot',
      count: 2
    }, {
      name: 'Grand Inquisitor',
      type: 'pilot',
      count: 1
    }, {
      name: 'Seventh Sister',
      type: 'pilot',
      count: 1
    }, {
      name: 'Baron of the Empire',
      type: 'pilot',
      count: 3
    }, {
      name: 'Inquisitor',
      type: 'pilot',
      count: 3
    }, {
      name: 'Soontir Fel',
      type: 'pilot',
      count: 1
    }, {
      name: 'Turr Phennir',
      type: 'pilot',
      count: 1
    }, {
      name: 'Alpha Squadron Pilot',
      type: 'pilot',
      count: 2
    }, {
      name: 'Saber Squadron Ace',
      type: 'pilot',
      count: 2
    }, {
      name: 'Tomax Bren',
      type: 'pilot',
      count: 1
    }, {
      name: 'Captain Jonus',
      type: 'pilot',
      count: 1
    }, {
      name: 'Major Rhymer',
      type: 'pilot',
      count: 1
    }, {
      name: '"Deathfire"',
      type: 'pilot',
      count: 1
    }, {
      name: 'Gamma Squadron Ace',
      type: 'pilot',
      count: 3
    }, {
      name: 'Scimitar Squadron Pilot',
      type: 'pilot',
      count: 3
    }, {
      name: '"Duchess"',
      type: 'pilot',
      count: 1
    }, {
      name: '"Countdown"',
      type: 'pilot',
      count: 1
    }, {
      name: '"Pure Sabacc"',
      type: 'pilot',
      count: 1
    }, {
      name: 'Black Squadron Scout',
      type: 'pilot',
      count: 3
    }, {
      name: 'Planetary Sentinel',
      type: 'pilot',
      count: 3
    }, {
      name: 'Rexler Brath',
      type: 'pilot',
      count: 1
    }, {
      name: 'Colonel Vessery',
      type: 'pilot',
      count: 1
    }, {
      name: 'Countess Ryad',
      type: 'pilot',
      count: 1
    }, {
      name: 'Onyx Squadron Ace',
      type: 'pilot',
      count: 2
    }, {
      name: 'Delta Squadron Pilot',
      type: 'pilot',
      count: 2
    }, {
      name: '"Double Edge"',
      type: 'pilot',
      count: 1
    }, {
      name: 'Lieutenant Kestal',
      type: 'pilot',
      count: 1
    }, {
      name: 'Onyx Squadron Scout',
      type: 'pilot',
      count: 2
    }, {
      name: 'Sienar Specialist',
      type: 'pilot',
      count: 2
    }, {
      name: '"Echo"',
      type: 'pilot',
      count: 1
    }, {
      name: '"Whisper"',
      type: 'pilot',
      count: 1
    }, {
      name: 'Imdaar Test Pilot',
      type: 'pilot',
      count: 2
    }, {
      name: "Sigma Squadron Ace",
      type: 'pilot',
      count: 2
    }, {
      name: 'Major Vynder',
      type: 'pilot',
      count: 1
    }, {
      name: 'Lieutenant Karsabi',
      type: 'pilot',
      count: 1
    }, {
      name: 'Rho Squadron Pilot',
      type: 'pilot',
      count: 2
    }, {
      name: 'Nu Squadron Pilot',
      type: 'pilot',
      count: 2
    }, {
      name: '"Redline"',
      type: 'pilot',
      count: 1
    }, {
      name: '"Deathrain"',
      type: 'pilot',
      count: 1
    }, {
      name: 'Cutlass Squadron Pilot',
      type: 'pilot',
      count: 2
    }, {
      name: 'Captain Kagi',
      type: 'pilot',
      count: 1
    }, {
      name: 'Colonel Jendon',
      type: 'pilot',
      count: 1
    }, {
      name: 'Lieutenant Sai',
      type: 'pilot',
      count: 1
    }, {
      name: 'Omicron Group Pilot',
      type: 'pilot',
      count: 1
    }, {
      name: 'Rear Admiral Chiraneau',
      type: 'pilot',
      count: 1
    }, {
      name: 'Captain Oicunn',
      type: 'pilot',
      count: 1
    }, {
      name: 'Patrol Leader',
      type: 'pilot',
      count: 2
    }, {
      name: 'Crack Shot',
      type: 'upgrade',
      count: 3
    }, {
      name: 'Daredevil',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Debris Gambit',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Elusive',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Expert Handling',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Intimidation',
      type: 'upgrade',
      count: 3
    }, {
      name: 'Juke',
      type: 'upgrade',
      count: 3
    }, {
      name: 'Lone Wolf',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Marksmanship',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Outmaneuver',
      type: 'upgrade',
      count: 3
    }, {
      name: 'Predator',
      type: 'upgrade',
      count: 3
    }, {
      name: 'Ruthless',
      type: 'upgrade',
      count: 3
    }, {
      name: 'Saturation Salvo',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Squad Leader',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Swarm Tactics',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Trick Shot',
      type: 'upgrade',
      count: 3
    }, {
      name: 'Advanced Sensors',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Collision Detector',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Fire-Control System',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Trajectory Simulator',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Heavy Laser Cannon',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Ion Cannon',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Jamming Beam',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Tractor Beam',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Dorsal Turret',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Ion Cannon Turret',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Adv. Proton Torpedoes',
      type: 'upgrade',
      count: 3
    }, {
      name: 'Ion Torpedoes',
      type: 'upgrade',
      count: 3
    }, {
      name: 'Proton Torpedoes',
      type: 'upgrade',
      count: 3
    }, {
      name: 'Barrage Rockets',
      type: 'upgrade',
      count: 3
    }, {
      name: 'Cluster Missiles',
      type: 'upgrade',
      count: 3
    }, {
      name: 'Concussion Missiles',
      type: 'upgrade',
      count: 3
    }, {
      name: 'Homing Missiles',
      type: 'upgrade',
      count: 3
    }, {
      name: 'Ion Missiles',
      type: 'upgrade',
      count: 3
    }, {
      name: 'Proton Rockets',
      type: 'upgrade',
      count: 3
    }, {
      name: 'Admiral Sloane',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Agent Kallus',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Ciena Ree',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Darth Vader',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Emperor Palpatine',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Freelance Slicer',
      type: 'upgrade',
      count: 2
    }, {
      name: 'GNK "Gonk" Droid',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Grand Inquisitor',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Grand Moff Tarkin',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Informant',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Minister Tua',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Moff Jerjerrod',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Novice Technician',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Perceptive Copilot',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Seasoned Navigator',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Seventh Sister',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Tactical Officer',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Fifth Brother',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Hotshot Gunner',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Skilled Bombardier',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Veteran Turret Gunner',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Bomblet Generator',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Conner Nets',
      type: 'upgrade',
      count: 3
    }, {
      name: 'Proton Bombs',
      type: 'upgrade',
      count: 3
    }, {
      name: 'Proximity Mines',
      type: 'upgrade',
      count: 3
    }, {
      name: 'Seismic Charges',
      type: 'upgrade',
      count: 3
    }, {
      name: 'Dauntless',
      type: 'upgrade',
      count: 1
    }, {
      name: 'ST-321',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Os-1 Arsenal Loadout',
      type: 'upgrade',
      count: 3
    }, {
      name: 'Xg-1 Assault Configuration',
      type: 'upgrade',
      count: 3
    }, {
      name: 'Ablative Plating',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Advanced SLAM',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Electronic Baffle',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Hull Upgrade',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Munitions Failsafe',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Shield Upgrade',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Static Discharge Vanes',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Stealth Device',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Tactical Scrambler',
      type: 'upgrade',
      count: 2
    }
  ],
  'Scum and Villainy Conversion Kit': [
    {
      name: 'Joy Rekkoff',
      type: 'pilot',
      count: 1
    }, {
      name: 'Koshka Frost',
      type: 'pilot',
      count: 1
    }, {
      name: 'Marauder',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Fenn Rau',
      type: 'pilot',
      count: 1
    }, {
      name: 'Kad Solus',
      type: 'pilot',
      count: 1
    }, {
      name: 'Old Teroch',
      type: 'pilot',
      count: 1
    }, {
      name: 'Skull Squadron Pilot',
      type: 'pilot',
      count: 2
    }, {
      name: 'Zealous Recruit',
      type: 'pilot',
      count: 3
    }, {
      name: 'Constable Zuvio',
      type: 'pilot',
      count: 1
    }, {
      name: 'Sarco Plank',
      type: 'pilot',
      count: 1
    }, {
      name: 'Unkar Plutt',
      type: 'pilot',
      count: 1
    }, {
      name: 'Jakku Gunrunner',
      type: 'pilot',
      count: 3
    }, {
      name: 'Drea Renthal',
      type: 'pilot',
      count: 1
    }, {
      name: 'Kavil',
      type: 'pilot',
      count: 1
    }, {
      name: 'Crymorah Goon',
      type: 'pilot',
      count: 2
    }, {
      name: 'Hired Gun',
      type: 'pilot',
      count: 2
    }, {
      name: "Kaa'to Leeachos",
      type: 'pilot',
      count: 1
    }, {
      name: 'Nashtah Pup',
      type: 'pilot',
      count: 1
    }, {
      name: "N'dru Suhlak",
      type: 'pilot',
      count: 1
    }, {
      name: 'Black Sun Soldier',
      type: 'pilot',
      count: 3
    }, {
      name: 'Binayre Pirate',
      type: 'pilot',
      count: 3
    }, {
      name: 'Dace Bonearm',
      type: 'pilot',
      count: 1
    }, {
      name: 'Palob Godalhi',
      type: 'pilot',
      count: 1
    }, {
      name: 'Torkil Mux',
      type: 'pilot',
      count: 1
    }, {
      name: 'Spice Runner',
      type: 'pilot',
      count: 3
    }, {
      name: 'Dalan Oberos (StarViper)',
      type: 'pilot',
      count: 1
    }, {
      name: 'Guri',
      type: 'pilot',
      count: 1
    }, {
      name: 'Prince Xizor',
      type: 'pilot',
      count: 1
    }, {
      name: 'Black Sun Assassin',
      type: 'pilot',
      count: 2
    }, {
      name: 'Black Sun Enforcer',
      type: 'pilot',
      count: 2
    }, {
      name: 'Genesis Red',
      type: 'pilot',
      count: 1
    }, {
      name: 'Inaldra',
      type: 'pilot',
      count: 1
    }, {
      name: "Laetin A'shera",
      type: 'pilot',
      count: 1
    }, {
      name: 'Quinn Jast',
      type: 'pilot',
      count: 1
    }, {
      name: 'Serissu',
      type: 'pilot',
      count: 1
    }, {
      name: 'Sunny Bounder',
      type: 'pilot',
      count: 1
    }, {
      name: 'Tansarii Point Veteran',
      type: 'pilot',
      count: 4
    }, {
      name: 'Cartel Spacer',
      type: 'pilot',
      count: 4
    }, {
      name: 'Captain Jostero',
      type: 'pilot',
      count: 1
    }, {
      name: 'Graz',
      type: 'pilot',
      count: 1
    }, {
      name: 'Talonbane Cobra',
      type: 'pilot',
      count: 1
    }, {
      name: 'Viktor Hel',
      type: 'pilot',
      count: 1
    }, {
      name: 'Black Sun Ace',
      type: 'pilot',
      count: 3
    }, {
      name: 'Cartel Marauder',
      type: 'pilot',
      count: 3
    }, {
      name: 'Boba Fett',
      type: 'pilot',
      count: 1
    }, {
      name: 'Emon Azzameen',
      type: 'pilot',
      count: 1
    }, {
      name: 'Kath Scarlet',
      type: 'pilot',
      count: 1
    }, {
      name: 'Krassis Trelix',
      type: 'pilot',
      count: 1
    }, {
      name: 'Bounty Hunter',
      type: 'pilot',
      count: 2
    }, {
      name: 'IG-88A',
      type: 'pilot',
      count: 1
    }, {
      name: 'IG-88B',
      type: 'pilot',
      count: 1
    }, {
      name: 'IG-88C',
      type: 'pilot',
      count: 1
    }, {
      name: 'IG-88D',
      type: 'pilot',
      count: 1
    }, {
      name: '4-LOM',
      type: 'pilot',
      count: 1
    }, {
      name: 'Zuckuss',
      type: 'pilot',
      count: 1
    }, {
      name: 'Gand Findsman',
      type: 'pilot',
      count: 2
    }, {
      name: 'Captain Nym',
      type: 'pilot',
      count: 1
    }, {
      name: 'Sol Sixxa',
      type: 'pilot',
      count: 1
    }, {
      name: 'Lok Revenant',
      type: 'pilot',
      count: 2
    }, {
      name: 'Dalan Oberos',
      type: 'pilot',
      count: 1
    }, {
      name: 'Torani Kulda',
      type: 'pilot',
      count: 1
    }, {
      name: 'Cartel Executioner',
      type: 'pilot',
      count: 2
    }, {
      name: 'Bossk',
      type: 'pilot',
      count: 1
    }, {
      name: 'Latts Razzi',
      type: 'pilot',
      count: 1
    }, {
      name: 'Moralo Eval',
      type: 'pilot',
      count: 1
    }, {
      name: 'Trandoshan Slaver',
      type: 'pilot',
      count: 1
    }, {
      name: 'Dengar',
      type: 'pilot',
      count: 1
    }, {
      name: 'Manaroo',
      type: 'pilot',
      count: 1
    }, {
      name: 'Tel Trevura',
      type: 'pilot',
      count: 1
    }, {
      name: 'Contracted Scout',
      type: 'pilot',
      count: 1
    }, {
      name: 'Asajj Ventress',
      type: 'pilot',
      count: 1
    }, {
      name: 'Ketsu Onyo',
      type: 'pilot',
      count: 1
    }, {
      name: 'Sabine Wren (Scum)',
      type: 'pilot',
      count: 1
    }, {
      name: 'Shadowport Hunter',
      type: 'pilot',
      count: 1
    }, {
      name: 'Crack Shot',
      type: 'upgrade',
      count: 3
    }, {
      name: 'Daredevil',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Debris Gambit',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Elusive',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Expert Handling',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Fearless',
      type: 'upgrade',
      count: 3
    }, {
      name: 'Intimidation',
      type: 'upgrade',
      count: 3
    }, {
      name: 'Juke',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Lone Wolf',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Marksmanship',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Outmaneuver',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Predator',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Saturation Salvo',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Squad Leader',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Swarm Tactics',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Trick Shot',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Advanced Sensors',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Collision Detector',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Fire-Control System',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Trajectory Simulator',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Cloaking Device',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Contraband Cybernetics',
      type: 'upgrade',
      count: 2
    }, {
      name: "Deadman's Switch",
      type: 'upgrade',
      count: 3
    }, {
      name: 'Feedback Array',
      type: 'upgrade',
      count: 3
    }, {
      name: 'Inertial Dampeners',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Rigged Cargo Chute',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Heavy Laser Cannon',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Ion Cannon',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Jamming Beam',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Tractor Beam',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Dorsal Turret',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Ion Cannon Turret',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Adv. Proton Torpedoes',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Ion Torpedoes',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Proton Torpedoes',
      type: 'upgrade',
      count: 2
    }, {
      name: '0-0-0',
      type: 'upgrade',
      count: 1
    }, {
      name: '4-LOM',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Boba Fett',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Cad Bane',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Cikatro Vizago',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Freelance Slicer',
      type: 'upgrade',
      count: 2
    }, {
      name: 'GNK "Gonk" Droid',
      type: 'upgrade',
      count: 2
    }, {
      name: 'IG-88D',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Informant',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Jabba the Hutt',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Ketsu Onyo',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Latts Razzi',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Maul',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Novice Technician',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Perceptive Copilot',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Seasoned Navigator',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Tactical Officer',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Unkar Plutt',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Zuckuss',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Bossk',
      type: 'upgrade',
      count: 1
    }, {
      name: 'BT-1',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Dengar',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Greedo',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Hotshot Gunner',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Skilled Bombardier',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Veteran Tail Gunner',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Veteran Turret Gunner',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Cluster Missiles',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Concussion Missiles',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Homing Missiles',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Ion Missiles',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Proton Rockets',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Bomblet Generator',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Conner Nets',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Proton Bombs',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Proximity Mines',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Seismic Charges',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Andrasta',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Havoc',
      type: 'upgrade',
      count: 1
    }, {
      name: "Hound's Tooth",
      type: 'upgrade',
      count: 1
    }, {
      name: 'IG-2000',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Mist Hunter',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Punishing One',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Shadow Caster',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Slave I',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Virago',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Ablative Plating',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Electronic Baffle',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Engine Upgrade',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Hull Upgrade',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Munitions Failsafe',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Shield Upgrade',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Static Discharge Vanes',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Stealth Device',
      type: 'upgrade',
      count: 2
    }, {
      name: 'Tactical Scrambler',
      type: 'upgrade',
      count: 2
    }, {
      name: '"Genius"',
      type: 'upgrade',
      count: 1
    }, {
      name: 'R2 Astromech',
      type: 'upgrade',
      count: 2
    }, {
      name: 'R3 Astromech',
      type: 'upgrade',
      count: 2
    }, {
      name: 'R4 Astromech',
      type: 'upgrade',
      count: 2
    }, {
      name: 'R5 Astromech',
      type: 'upgrade',
      count: 2
    }, {
      name: 'R5-P8',
      type: 'upgrade',
      count: 1
    }, {
      name: 'R5-TK',
      type: 'upgrade',
      count: 1
    }
  ],
  'T-65 X-Wing Expansion Pack': [
    {
      name: 'X-Wing',
      type: 'ship',
      count: 1
    }, {
      name: 'Wedge Antilles',
      type: 'pilot',
      count: 1
    }, {
      name: 'Thane Kyrell',
      type: 'pilot',
      count: 1
    }, {
      name: 'Garven Dreis (X-Wing)',
      type: 'pilot',
      count: 1
    }, {
      name: 'Biggs Darklighter',
      type: 'pilot',
      count: 1
    }, {
      name: 'Red Squadron Veteran',
      type: 'pilot',
      count: 1
    }, {
      name: 'Blue Squadron Escort',
      type: 'pilot',
      count: 1
    }, {
      name: 'Selfless',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Ion Torpedoes',
      type: 'upgrade',
      count: 1
    }, {
      name: 'R2 Astromech',
      type: 'upgrade',
      count: 1
    }, {
      name: 'R4 Astromech',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Servomotor S-Foils',
      type: 'upgrade',
      count: 1
    }
  ],
  'BTL-A4 Y-Wing Expansion Pack': [
    {
      name: 'Y-Wing',
      type: 'ship',
      count: 1
    }, {
      name: 'Horton Salm',
      type: 'pilot',
      count: 1
    }, {
      name: 'Norra Wexley (Y-Wing)',
      type: 'pilot',
      count: 1
    }, {
      name: '"Dutch" Vander',
      type: 'pilot',
      count: 1
    }, {
      name: 'Evaan Verlaine',
      type: 'pilot',
      count: 1
    }, {
      name: 'Gold Squadron Veteran',
      type: 'pilot',
      count: 1
    }, {
      name: 'Gray Squadron Bomber',
      type: 'pilot',
      count: 1
    }, {
      name: 'R5 Astromech',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Expert Handling',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Ion Cannon Turret',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Proton Bombs',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Seismic Charges',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Veteran Turret Gunner',
      type: 'upgrade',
      count: 1
    }
  ],
  'TIE/ln Fighter Expansion Pack': [
    {
      name: 'TIE Fighter',
      type: 'ship',
      count: 1
    }, {
      name: '"Howlrunner"',
      type: 'pilot',
      count: 1
    }, {
      name: '"Mauler" Mithel',
      type: 'pilot',
      count: 1
    }, {
      name: 'Gideon Hask',
      type: 'pilot',
      count: 1
    }, {
      name: '"Scourge" Skutu',
      type: 'pilot',
      count: 1
    }, {
      name: 'Seyn Marana',
      type: 'pilot',
      count: 1
    }, {
      name: 'Del Meeko',
      type: 'pilot',
      count: 1
    }, {
      name: '"Wampa"',
      type: 'pilot',
      count: 1
    }, {
      name: 'Black Squadron Ace',
      type: 'pilot',
      count: 1
    }, {
      name: 'Obsidian Squadron Pilot',
      type: 'pilot',
      count: 1
    }, {
      name: 'Academy Pilot',
      type: 'pilot',
      count: 1
    }, {
      name: 'Crack Shot',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Juke',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Marksmanship',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Stealth Device',
      type: 'upgrade',
      count: 1
    }
  ],
  'TIE Advanced x1 Expansion Pack': [
    {
      name: 'TIE Advanced',
      type: 'ship',
      count: 1
    }, {
      name: 'Darth Vader',
      type: 'pilot',
      count: 1
    }, {
      name: 'Maarek Stele',
      type: 'pilot',
      count: 1
    }, {
      name: 'Ved Foslo',
      type: 'pilot',
      count: 1
    }, {
      name: 'Zertik Strom',
      type: 'pilot',
      count: 1
    }, {
      name: 'Storm Squadron Ace',
      type: 'pilot',
      count: 1
    }, {
      name: 'Tempest Squadron Pilot',
      type: 'pilot',
      count: 1
    }, {
      name: 'Heightened Perception',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Supernatural Reflexes',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Ruthless',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Squad Leader',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Cluster Missiles',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Fire-Control System',
      type: 'upgrade',
      count: 1
    }
  ],
  'Slave I Expansion Pack': [
    {
      name: 'Firespray-31',
      type: 'ship',
      count: 1
    }, {
      name: 'Boba Fett',
      type: 'pilot',
      count: 1
    }, {
      name: 'Kath Scarlet',
      type: 'pilot',
      count: 1
    }, {
      name: 'Emon Azzameen',
      type: 'pilot',
      count: 1
    }, {
      name: 'Koshka Frost',
      type: 'pilot',
      count: 1
    }, {
      name: 'Krassis Trelix',
      type: 'pilot',
      count: 1
    }, {
      name: 'Bounty Hunter',
      type: 'pilot',
      count: 1
    }, {
      name: 'Heavy Laser Cannon',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Boba Fett',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Perceptive Copilot',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Proximity Mines',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Seismic Charges',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Veteran Tail Gunner',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Inertial Dampeners',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Concussion Missiles',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Lone Wolf',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Andrasta',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Marauder',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Slave I',
      type: 'upgrade',
      count: 1
    }
  ],
  'Fang Fighter Expansion Pack': [
    {
      name: 'Fang Fighter',
      type: 'ship',
      count: 1
    }, {
      name: 'Fenn Rau',
      type: 'pilot',
      count: 1
    }, {
      name: 'Old Teroch',
      type: 'pilot',
      count: 1
    }, {
      name: 'Kad Solus',
      type: 'pilot',
      count: 1
    }, {
      name: 'Joy Rekkoff',
      type: 'pilot',
      count: 1
    }, {
      name: 'Skull Squadron Pilot',
      type: 'pilot',
      count: 1
    }, {
      name: 'Zealous Recruit',
      type: 'pilot',
      count: 1
    }, {
      name: 'Afterburners',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Fearless',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Daredevil',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Ion Torpedoes',
      type: 'upgrade',
      count: 1
    }
  ],
  "Lando's Millennium Falcon Expansion Pack": [
    {
      name: 'YT-1300 (Scum)',
      type: 'ship',
      count: 1
    }, {
      name: 'Escape Craft',
      type: 'ship',
      count: 1
    }, {
      name: 'Han Solo (Scum)',
      type: 'pilot',
      count: 1
    }, {
      name: 'Lando Calrissian (Scum)',
      type: 'pilot',
      count: 1
    }, {
      name: 'L3-37',
      type: 'pilot',
      count: 1
    }, {
      name: 'Freighter Captain',
      type: 'pilot',
      count: 1
    }, {
      name: 'Lando Calrissian (Scum) (Escape Craft)',
      type: 'pilot',
      count: 1
    }, {
      name: 'Outer Rim Pioneer',
      type: 'pilot',
      count: 1
    }, {
      name: 'L3-37 (Escape Craft)',
      type: 'pilot',
      count: 1
    }, {
      name: 'Autopilot Drone',
      type: 'pilot',
      count: 1
    }, {
      name: 'L3-37',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Chewbacca (Scum)',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Lando Calrissian (Scum)',
      type: 'upgrade',
      count: 1
    }, {
      name: "Qi'ra",
      type: 'upgrade',
      count: 1
    }, {
      name: 'Tobias Beckett',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Seasoned Navigator',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Han Solo (Scum)',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Agile Gunner',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Composure',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Intimidation',
      type: 'upgrade',
      count: 1
    }, {
      name: "Lando's Millennium Falcon",
      type: 'upgrade',
      count: 1
    }, {
      name: 'Rigged Cargo Chute',
      type: 'upgrade',
      count: 1
    }, {
      name: 'Tactical Scrambler',
      type: 'upgrade',
      count: 1
    }
  ],
  'Loose Ships': [
    {
      name: 'A-Wing',
      type: 'ship',
      count: 3
    }, {
      name: 'ARC-170',
      type: 'ship',
      count: 2
    }, {
      name: 'Auzituck Gunship',
      type: 'ship',
      count: 2
    }, {
      name: 'B-Wing',
      type: 'ship',
      count: 2
    }, {
      name: 'E-Wing',
      type: 'ship',
      count: 2
    }, {
      name: 'VCX-100',
      type: 'ship',
      count: 2
    }, {
      name: 'HWK-290',
      type: 'ship',
      count: 2
    }, {
      name: 'K-Wing',
      type: 'ship',
      count: 2
    }, {
      name: 'YT-1300',
      type: 'ship',
      count: 2
    }, {
      name: 'Attack Shuttle',
      type: 'ship',
      count: 2
    }, {
      name: 'Sheathipede-Class Shuttle',
      type: 'ship',
      count: 2
    }, {
      name: 'TIE Fighter',
      type: 'ship',
      count: 2
    }, {
      name: 'U-Wing',
      type: 'ship',
      count: 2
    }, {
      name: 'X-Wing',
      type: 'ship',
      count: 2
    }, {
      name: 'Y-Wing',
      type: 'ship',
      count: 2
    }, {
      name: 'YT-2400',
      type: 'ship',
      count: 2
    }, {
      name: 'Z-95 Headhunter',
      type: 'ship',
      count: 4
    }, {
      name: 'Alpha-Class Star Wing',
      type: 'ship',
      count: 3
    }, {
      name: 'TIE Advanced Prototype',
      type: 'ship',
      count: 3
    }, {
      name: 'Lambda-Class Shuttle',
      type: 'ship',
      count: 2
    }, {
      name: 'TIE Advanced',
      type: 'ship',
      count: 2
    }, {
      name: 'TIE Aggressor',
      type: 'ship',
      count: 3
    }, {
      name: 'TIE Bomber',
      type: 'ship',
      count: 3
    }, {
      name: 'TIE Defender',
      type: 'ship',
      count: 2
    }, {
      name: 'TIE Fighter',
      type: 'ship',
      count: 4
    }, {
      name: 'TIE Interceptor',
      type: 'ship',
      count: 3
    }, {
      name: 'TIE Phantom',
      type: 'ship',
      count: 2
    }, {
      name: 'TIE Punisher',
      type: 'ship',
      count: 2
    }, {
      name: 'TIE Striker',
      type: 'ship',
      count: 3
    }, {
      name: 'VT-49 Decimator',
      type: 'ship',
      count: 2
    }, {
      name: 'Kihraxz Fighter',
      type: 'ship',
      count: 3
    }, {
      name: 'YV-666',
      type: 'ship',
      count: 2
    }, {
      name: 'Aggressor',
      type: 'ship',
      count: 2
    }, {
      name: 'HWK-290',
      type: 'ship',
      count: 2
    }, {
      name: 'M12-L Kimogila Fighter',
      type: 'ship',
      count: 2
    }, {
      name: 'M3-A Interceptor',
      type: 'ship',
      count: 4
    }, {
      name: 'G-1A Starfighter',
      type: 'ship',
      count: 2
    }, {
      name: 'Fang Fighter',
      type: 'ship',
      count: 3
    }, {
      name: 'JumpMaster 5000',
      type: 'ship',
      count: 2
    }, {
      name: 'Quadjumper',
      type: 'ship',
      count: 3
    }, {
      name: 'Scurrg H-6 Bomber',
      type: 'ship',
      count: 2
    }, {
      name: 'Lancer-Class Pursuit Craft',
      type: 'ship',
      count: 2
    }, {
      name: 'Firespray-31',
      type: 'ship',
      count: 2
    }, {
      name: 'StarViper',
      type: 'ship',
      count: 2
    }, {
      name: 'Y-Wing',
      type: 'ship',
      count: 2
    }, {
      name: 'Z-95 Headhunter',
      type: 'ship',
      count: 4
    }, {
      name: 'T-70 X-Wing',
      type: 'ship',
      count: 3
    }, {
      name: 'B/SF-17 Bomber',
      type: 'ship',
      count: 3
    }, {
      name: 'TIE/SF Fighter',
      type: 'ship',
      count: 3
    }, {
      name: 'TIE/FO Fighter',
      type: 'ship',
      count: 3
    }, {
      name: 'TIE Silencer',
      type: 'ship',
      count: 3
    }, {
      name: 'Upsilon-Class Shuttle',
      type: 'ship',
      count: 3
    }, {
      name: 'YT-1300 (Resistance)',
      type: 'ship',
      count: 3
    }
  ]
};

exportObj.Collection = (function() {
  function Collection(args) {
    this.onLanguageChange = __bind(this.onLanguageChange, this);
    var _ref, _ref1, _ref2;
    this.expansions = (_ref = args.expansions) != null ? _ref : {};
    this.singletons = (_ref1 = args.singletons) != null ? _ref1 : {};
    this.checks = (_ref2 = args.checks) != null ? _ref2 : {};
    this.backend = args.backend;
    this.setupUI();
    this.setupHandlers();
    this.reset();
    this.language = 'English';
  }

  Collection.prototype.reset = function() {
    var card, component_content, contents, count, counts, expansion, expname, item, items, name, names, singletonsByType, sorted_names, thing, things, type, ul, _, _base1, _base2, _base3, _base4, _base5, _base6, _i, _j, _k, _l, _len, _len1, _m, _name, _name1, _name2, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _results;
    this.shelf = {};
    this.table = {};
    _ref = this.expansions;
    for (expansion in _ref) {
      count = _ref[expansion];
      try {
        count = parseInt(count);
      } catch (_error) {
        count = 0;
      }
      for (_ = _i = 0; 0 <= count ? _i < count : _i > count; _ = 0 <= count ? ++_i : --_i) {
        _ref2 = (_ref1 = exportObj.manifestByExpansion[expansion]) != null ? _ref1 : [];
        for (_j = 0, _len = _ref2.length; _j < _len; _j++) {
          card = _ref2[_j];
          for (_ = _k = 0, _ref3 = card.count; 0 <= _ref3 ? _k < _ref3 : _k > _ref3; _ = 0 <= _ref3 ? ++_k : --_k) {
            ((_base1 = ((_base2 = this.shelf)[_name1 = card.type] != null ? _base2[_name1] : _base2[_name1] = {}))[_name = card.name] != null ? _base1[_name] : _base1[_name] = []).push(expansion);
          }
        }
      }
    }
    _ref4 = this.singletons;
    for (type in _ref4) {
      counts = _ref4[type];
      for (name in counts) {
        count = counts[name];
        for (_ = _l = 0; 0 <= count ? _l < count : _l > count; _ = 0 <= count ? ++_l : --_l) {
          ((_base3 = ((_base4 = this.shelf)[type] != null ? _base4[type] : _base4[type] = {}))[name] != null ? _base3[name] : _base3[name] = []).push('singleton');
        }
      }
    }
    this.counts = {};
    _ref5 = this.shelf;
    for (type in _ref5) {
      if (!__hasProp.call(_ref5, type)) continue;
      _ref6 = this.shelf[type];
      for (thing in _ref6) {
        if (!__hasProp.call(_ref6, thing)) continue;
        if ((_base5 = ((_base6 = this.counts)[type] != null ? _base6[type] : _base6[type] = {}))[thing] == null) {
          _base5[thing] = 0;
        }
        this.counts[type][thing] += this.shelf[type][thing].length;
      }
    }
    singletonsByType = {};
    _ref7 = exportObj.manifestByExpansion;
    for (expname in _ref7) {
      items = _ref7[expname];
      for (_m = 0, _len1 = items.length; _m < _len1; _m++) {
        item = items[_m];
        (singletonsByType[_name2 = item.type] != null ? singletonsByType[_name2] : singletonsByType[_name2] = {})[item.name] = true;
      }
    }
    for (type in singletonsByType) {
      names = singletonsByType[type];
      sorted_names = ((function() {
        var _results;
        _results = [];
        for (name in names) {
          _results.push(name);
        }
        return _results;
      })()).sort(sortWithoutQuotes);
      singletonsByType[type] = sorted_names;
    }
    component_content = $(this.modal.find('.collection-inventory-content'));
    component_content.text('');
    _ref8 = this.counts;
    _results = [];
    for (type in _ref8) {
      if (!__hasProp.call(_ref8, type)) continue;
      things = _ref8[type];
      if (singletonsByType[type] != null) {
        contents = component_content.append($.trim("<div class=\"row-fluid\">\n    <div class=\"span12\"><h5>" + (type.capitalize()) + "</h5></div>\n</div>\n<div class=\"row-fluid\">\n    <ul id=\"counts-" + type + "\" class=\"span12\"></ul>\n</div>"));
        ul = $(contents.find("ul#counts-" + type));
        _results.push((function() {
          var _len2, _n, _ref9, _results1;
          _ref9 = Object.keys(things).sort(sortWithoutQuotes);
          _results1 = [];
          for (_n = 0, _len2 = _ref9.length; _n < _len2; _n++) {
            thing = _ref9[_n];
            if (__indexOf.call(singletonsByType[type], thing) >= 0) {
              _results1.push(ul.append("<li>" + thing + " - " + things[thing] + "</li>"));
            } else {
              _results1.push(void 0);
            }
          }
          return _results1;
        })());
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  Collection.prototype.fixName = function(name) {
    if (name.indexOf('"Heavy Scyk" Interceptor') === 0) {
      return '"Heavy Scyk" Interceptor';
    } else {
      return name;
    }
  };

  Collection.prototype.check = function(where, type, name) {
    var _ref, _ref1, _ref2;
    return ((_ref = ((_ref1 = ((_ref2 = where[type]) != null ? _ref2 : {})[this.fixName(name)]) != null ? _ref1 : []).length) != null ? _ref : 0) !== 0;
  };

  Collection.prototype.checkShelf = function(type, name) {
    return this.check(this.shelf, type, name);
  };

  Collection.prototype.checkTable = function(type, name) {
    return this.check(this.table, type, name);
  };

  Collection.prototype.use = function(type, name) {
    var card, e, _base1, _base2;
    name = this.fixName(name);
    try {
      card = this.shelf[type][name].pop();
    } catch (_error) {
      e = _error;
      if (card == null) {
        return false;
      }
    }
    if (card != null) {
      ((_base1 = ((_base2 = this.table)[type] != null ? _base2[type] : _base2[type] = {}))[name] != null ? _base1[name] : _base1[name] = []).push(card);
      return true;
    } else {
      return false;
    }
  };

  Collection.prototype.release = function(type, name) {
    var card, e, _base1, _base2;
    name = this.fixName(name);
    try {
      card = this.table[type][name].pop();
    } catch (_error) {
      e = _error;
      if (card == null) {
        return false;
      }
    }
    if (card != null) {
      ((_base1 = ((_base2 = this.shelf)[type] != null ? _base2[type] : _base2[type] = {}))[name] != null ? _base1[name] : _base1[name] = []).push(card);
      return true;
    } else {
      return false;
    }
  };

  Collection.prototype.save = function(cb) {
    if (cb == null) {
      cb = $.noop;
    }
    if (this.backend != null) {
      return this.backend.saveCollection(this, cb);
    }
  };

  Collection.load = function(backend, cb) {
    return backend.loadCollection(cb);
  };

  Collection.prototype.setupUI = function() {
    var collection_content, count, expansion, expname, input, item, items, name, names, pilot, pilotcollection_content, row, ship, shipcollection_content, singletonsByType, sorted_names, type, upgrade, upgradecollection_content, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _name, _ref, _ref1, _ref10, _ref11, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _results;
    singletonsByType = {};
    _ref = exportObj.manifestByExpansion;
    for (expname in _ref) {
      items = _ref[expname];
      for (_i = 0, _len = items.length; _i < _len; _i++) {
        item = items[_i];
        (singletonsByType[_name = item.type] != null ? singletonsByType[_name] : singletonsByType[_name] = {})[item.name] = true;
      }
    }
    for (type in singletonsByType) {
      names = singletonsByType[type];
      sorted_names = ((function() {
        var _results;
        _results = [];
        for (name in names) {
          _results.push(name);
        }
        return _results;
      })()).sort(sortWithoutQuotes);
      singletonsByType[type] = sorted_names;
    }
    this.modal = $(document.createElement('DIV'));
    this.modal.addClass('modal hide fade collection-modal hidden-print');
    $('body').append(this.modal);
    this.modal.append($.trim("<div class=\"modal-header\">\n    <button type=\"button\" class=\"close hidden-print\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button>\n    <h4>Your Collection</h4>\n</div>\n<div class=\"modal-body\">\n    <ul class=\"nav nav-tabs\">\n        <li class=\"active\"><a data-target=\"#collection-expansions\" data-toggle=\"tab\">Expansions</a><li>\n        <li><a data-target=\"#collection-ships\" data-toggle=\"tab\">Ships</a><li>\n        <li><a data-target=\"#collection-pilots\" data-toggle=\"tab\">Pilots</a><li>\n        <li><a data-target=\"#collection-upgrades\" data-toggle=\"tab\">Upgrades</a><li>\n        <li><a data-target=\"#collection-components\" data-toggle=\"tab\">Inventory</a><li>\n    </ul>\n    <div class=\"tab-content\">\n        <div id=\"collection-expansions\" class=\"tab-pane active container-fluid collection-content\"></div>\n        <div id=\"collection-ships\" class=\"tab-pane active container-fluid collection-ship-content\"></div>\n        <div id=\"collection-pilots\" class=\"tab-pane active container-fluid collection-pilot-content\"></div>\n        <div id=\"collection-upgrades\" class=\"tab-pane active container-fluid collection-upgrade-content\"></div>\n        <div id=\"collection-components\" class=\"tab-pane container-fluid collection-inventory-content\"></div>\n    </div>\n</div>\n<div class=\"modal-footer hidden-print\">\n    <span class=\"collection-status\"></span>\n    &nbsp;\n    <label class=\"checkbox-check-collection\">\n        Check Collection Requirements <input type=\"checkbox\" class=\"check-collection\"/>\n    </label>\n    &nbsp;\n    <button class=\"btn\" data-dismiss=\"modal\" aria-hidden=\"true\">Close</button>\n</div>"));
    this.modal_status = $(this.modal.find('.collection-status'));
    if (this.checks.collectioncheck != null) {
      if (this.checks.collectioncheck !== "false") {
        this.modal.find('.check-collection').prop('checked', true);
      }
    } else {
      this.checks.collectioncheck = true;
      this.modal.find('.check-collection').prop('checked', true);
    }
    this.modal.find('.checkbox-check-collection').show();
    collection_content = $(this.modal.find('.collection-content'));
    _ref1 = exportObj.expansions;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      expansion = _ref1[_j];
      count = parseInt((_ref2 = this.expansions[expansion]) != null ? _ref2 : 0);
      row = $.parseHTML($.trim("<div class=\"row-fluid\">\n    <div class=\"span12\">\n        <label>\n            <input class=\"expansion-count\" type=\"number\" size=\"3\" value=\"" + count + "\" />\n            <span class=\"expansion-name\">" + expansion + "</span>\n        </label>\n    </div>\n</div>"));
      input = $($(row).find('input'));
      input.data('expansion', expansion);
      input.closest('div').css('background-color', this.countToBackgroundColor(input.val()));
      $(row).find('.expansion-name').data('english_name', expansion);
      if (expansion !== 'Loose Ships') {
        collection_content.append(row);
      }
    }
    shipcollection_content = $(this.modal.find('.collection-ship-content'));
    _ref3 = singletonsByType.ship;
    for (_k = 0, _len2 = _ref3.length; _k < _len2; _k++) {
      ship = _ref3[_k];
      count = parseInt((_ref4 = (_ref5 = this.singletons.ship) != null ? _ref5[ship] : void 0) != null ? _ref4 : 0);
      row = $.parseHTML($.trim("<div class=\"row-fluid\">\n    <div class=\"span12\">\n        <label>\n            <input class=\"singleton-count\" type=\"number\" size=\"3\" value=\"" + count + "\" />\n            <span class=\"ship-name\">" + ship + "</span>\n        </label>\n    </div>\n</div>"));
      input = $($(row).find('input'));
      input.data('singletonType', 'ship');
      input.data('singletonName', ship);
      input.closest('div').css('background-color', this.countToBackgroundColor(input.val()));
      $(row).find('.ship-name').data('english_name', expansion);
      shipcollection_content.append(row);
    }
    pilotcollection_content = $(this.modal.find('.collection-pilot-content'));
    _ref6 = singletonsByType.pilot;
    for (_l = 0, _len3 = _ref6.length; _l < _len3; _l++) {
      pilot = _ref6[_l];
      count = parseInt((_ref7 = (_ref8 = this.singletons.pilot) != null ? _ref8[pilot] : void 0) != null ? _ref7 : 0);
      row = $.parseHTML($.trim("<div class=\"row-fluid\">\n    <div class=\"span12\">\n        <label>\n            <input class=\"singleton-count\" type=\"number\" size=\"3\" value=\"" + count + "\" />\n            <span class=\"pilot-name\">" + pilot + "</span>\n        </label>\n    </div>\n</div>"));
      input = $($(row).find('input'));
      input.data('singletonType', 'pilot');
      input.data('singletonName', pilot);
      input.closest('div').css('background-color', this.countToBackgroundColor(input.val()));
      $(row).find('.pilot-name').data('english_name', expansion);
      pilotcollection_content.append(row);
    }
    upgradecollection_content = $(this.modal.find('.collection-upgrade-content'));
    _ref9 = singletonsByType.upgrade;
    _results = [];
    for (_m = 0, _len4 = _ref9.length; _m < _len4; _m++) {
      upgrade = _ref9[_m];
      count = parseInt((_ref10 = (_ref11 = this.singletons.upgrade) != null ? _ref11[upgrade] : void 0) != null ? _ref10 : 0);
      row = $.parseHTML($.trim("<div class=\"row-fluid\">\n    <div class=\"span12\">\n        <label>\n            <input class=\"singleton-count\" type=\"number\" size=\"3\" value=\"" + count + "\" />\n            <span class=\"upgrade-name\">" + upgrade + "</span>\n        </label>\n    </div>\n</div>"));
      input = $($(row).find('input'));
      input.data('singletonType', 'upgrade');
      input.data('singletonName', upgrade);
      input.closest('div').css('background-color', this.countToBackgroundColor(input.val()));
      $(row).find('.upgrade-name').data('english_name', expansion);
      _results.push(upgradecollection_content.append(row));
    }
    return _results;

    /*modificationcollection_content = $ @modal.find('.collection-modification-content')
    for modification in singletonsByType.modification
        count = parseInt(@singletons.modification?[modification] ? 0)
        row = $.parseHTML $.trim """
            <div class="row-fluid">
                <div class="span12">
                    <label>
                        <input class="singleton-count" type="number" size="3" value="#{count}" />
                        <span class="modification-name">#{modification}</span>
                    </label>
                </div>
            </div>
        """
        input = $ $(row).find('input')
        input.data 'singletonType', 'modification'
        input.data 'singletonName', modification
        input.closest('div').css 'background-color', @countToBackgroundColor(input.val())
        $(row).find('.modification-name').data 'english_name', expansion
        modificationcollection_content.append row
     */

    /*titlecollection_content = $ @modal.find('.collection-title-content')
    for title in singletonsByType.title
        count = parseInt(@singletons.title?[title] ? 0)
        row = $.parseHTML $.trim """
            <div class="row-fluid">
                <div class="span12">
                    <label>
                        <input class="singleton-count" type="number" size="3" value="#{count}" />
                        <span class="title-name">#{title}</span>
                    </label>
                </div>
            </div>
        """
        input = $ $(row).find('input')
        input.data 'singletonType', 'title'
        input.data 'singletonName', title
        input.closest('div').css 'background-color', @countToBackgroundColor(input.val())
        $(row).find('.title-name').data 'english_name', expansion
        titlecollection_content.append row
     */
  };

  Collection.prototype.destroyUI = function() {
    this.modal.modal('hide');
    this.modal.remove();
    return $(exportObj).trigger('xwing-collection:destroyed', this);
  };

  Collection.prototype.setupHandlers = function() {
    $(exportObj).trigger('xwing-collection:created', this);
    $(exportObj).on('xwing-backend:authenticationChanged', (function(_this) {
      return function(e, authenticated, backend) {
        if (!authenticated) {
          return _this.destroyUI();
        }
      };
    })(this)).on('xwing-collection:saved', (function(_this) {
      return function(e, collection) {
        _this.modal_status.text('Collection saved');
        return _this.modal_status.fadeIn(100, function() {
          return _this.modal_status.fadeOut(1000);
        });
      };
    })(this)).on('xwing:languageChanged', this.onLanguageChange).on('xwing:CollectionCheck', this.onCollectionCheckSet);
    $(this.modal.find('input.expansion-count').change((function(_this) {
      return function(e) {
        var target, val;
        target = $(e.target);
        val = target.val();
        if (val < 0 || isNaN(parseInt(val))) {
          target.val(0);
        }
        _this.expansions[target.data('expansion')] = parseInt(target.val());
        target.closest('div').css('background-color', _this.countToBackgroundColor(val));
        return $(exportObj).trigger('xwing-collection:changed', _this);
      };
    })(this)));
    $(this.modal.find('input.singleton-count').change((function(_this) {
      return function(e) {
        var target, val, _base1, _name;
        target = $(e.target);
        val = target.val();
        if (val < 0 || isNaN(parseInt(val))) {
          target.val(0);
        }
        ((_base1 = _this.singletons)[_name = target.data('singletonType')] != null ? _base1[_name] : _base1[_name] = {})[target.data('singletonName')] = parseInt(target.val());
        target.closest('div').css('background-color', _this.countToBackgroundColor(val));
        return $(exportObj).trigger('xwing-collection:changed', _this);
      };
    })(this)));
    return $(this.modal.find('.check-collection').change((function(_this) {
      return function(e) {
        var result;
        if (_this.modal.find('.check-collection').prop('checked') === false) {
          result = false;
          _this.modal_status.text("Collection Tracking Disabled");
        } else {
          result = true;
          _this.modal_status.text("Collection Tracking Active");
        }
        _this.checks.collectioncheck = result;
        _this.modal_status.fadeIn(100, function() {
          return _this.modal_status.fadeOut(1000);
        });
        return $(exportObj).trigger('xwing-collection:changed', _this);
      };
    })(this)));
  };

  Collection.prototype.countToBackgroundColor = function(count) {
    var i;
    count = parseInt(count);
    switch (false) {
      case count !== 0:
        return '';
      case !(count < 12):
        i = parseInt(200 * Math.pow(0.9, count - 1));
        return "rgb(" + i + ", 255, " + i + ")";
      default:
        return 'red';
    }
  };

  Collection.prototype.onLanguageChange = function(e, language) {
    if (language !== this.language) {
      (function(_this) {
        return (function(language) {
          return _this.modal.find('.expansion-name').each(function() {
            return $(this).text(exportObj.translate(language, 'sources', $(this).data('english_name')));
          });
        });
      })(this)(language);
      return this.language = language;
    }
  };

  return Collection;

})();


/*
    X-Wing Squad Builder 2.0
    Stephen Kim <raithos@gmail.com>
    https://raithos.github.io
 */

DFL_LANGUAGE = 'English';

builders = [];

exportObj = typeof exports !== "undefined" && exports !== null ? exports : this;

exportObj.loadCards = function(language) {
  return exportObj.cardLoaders[language]();
};

exportObj.translate = function() {
  var args, category, language, translation, what;
  language = arguments[0], category = arguments[1], what = arguments[2], args = 4 <= arguments.length ? __slice.call(arguments, 3) : [];
  translation = exportObj.translations[language][category][what];
  if (translation != null) {
    if (translation instanceof Function) {
      return translation.apply(null, [exportObj.translate, language].concat(__slice.call(args)));
    } else {
      return translation;
    }
  } else {
    return what;
  }
};

exportObj.setupTranslationSupport = function() {
  (function(builders) {
    return $(exportObj).on('xwing:languageChanged', (function(_this) {
      return function(e, language, cb) {
        var builder, html, selector, ___iced_passed_deferral, __iced_deferrals, __iced_k;
        __iced_k = __iced_k_noop;
        ___iced_passed_deferral = iced.findDeferral(arguments);
        if (cb == null) {
          cb = $.noop;
        }
        if (language in exportObj.translations) {
          $('.language-placeholder').text(language);
          (function(__iced_k) {
            var _i, _len, _ref, _results, _while;
            _ref = builders;
            _len = _ref.length;
            _i = 0;
            _while = function(__iced_k) {
              var _break, _continue, _next;
              _break = __iced_k;
              _continue = function() {
                return iced.trampoline(function() {
                  ++_i;
                  return _while(__iced_k);
                });
              };
              _next = _continue;
              if (!(_i < _len)) {
                return _break();
              } else {
                builder = _ref[_i];
                (function(__iced_k) {
                  __iced_deferrals = new iced.Deferrals(__iced_k, {
                    parent: ___iced_passed_deferral
                  });
                  builder.container.trigger('xwing:beforeLanguageLoad', __iced_deferrals.defer({
                    lineno: 17742
                  }));
                  __iced_deferrals._fulfill();
                })(_next);
              }
            };
            _while(__iced_k);
          })(function() {
            var _i, _len, _ref;
            exportObj.loadCards(language);
            _ref = exportObj.translations[language].byCSSSelector;
            for (selector in _ref) {
              if (!__hasProp.call(_ref, selector)) continue;
              html = _ref[selector];
              $(selector).html(html);
            }
            for (_i = 0, _len = builders.length; _i < _len; _i++) {
              builder = builders[_i];
              builder.container.trigger('xwing:afterLanguageLoad', language);
            }
            return __iced_k();
          });
        } else {
          return __iced_k();
        }
      };
    })(this));
  })(builders);
  exportObj.loadCards(DFL_LANGUAGE);
  return $(exportObj).trigger('xwing:languageChanged', DFL_LANGUAGE);
};

exportObj.setupTranslationUI = function(backend) {
  var language, li, _fn, _i, _len, _ref, _results;
  _ref = Object.keys(exportObj.cardLoaders).sort();
  _fn = function(language, backend) {
    return li.click(function(e) {
      if (backend != null) {
        backend.set('language', language);
      }
      return $(exportObj).trigger('xwing:languageChanged', language);
    });
  };
  _results = [];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    language = _ref[_i];
    li = $(document.createElement('LI'));
    li.text(language);
    _fn(language, backend);
    _results.push($('ul.dropdown-menu').append(li));
  }
  return _results;
};

exportObj.registerBuilderForTranslation = function(builder) {
  if (__indexOf.call(builders, builder) < 0) {
    return builders.push(builder);
  }
};


/*
    X-Wing Squad Builder 2.0
    Stephen Kim <raithos@gmail.com>
    https://raithos.github.io
 */

exportObj = typeof exports !== "undefined" && exports !== null ? exports : this;

exportObj.sortHelper = function(a, b) {
  var a_name, b_name;
  if (a.points === b.points) {
    a_name = a.text.replace(/[^a-z0-9]/ig, '');
    b_name = b.text.replace(/[^a-z0-9]/ig, '');
    if (a_name === b_name) {
      return 0;
    } else {
      if (a_name > b_name) {
        return 1;
      } else {
        return -1;
      }
    }
  } else {
    if (a.points > b.points) {
      return 1;
    } else {
      return -1;
    }
  }
};

$.isMobile = function() {
  return navigator.userAgent.match(/(iPhone|iPod|iPad|Android)/i);
};

$.randomInt = function(n) {
  return Math.floor(Math.random() * n);
};

$.getParameterByName = function(name) {
  var regex, regexS, results;
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  regexS = "[\\?&]" + name + "=([^&#]*)";
  regex = new RegExp(regexS);
  results = regex.exec(window.location.search);
  if (results === null) {
    return "";
  } else {
    return decodeURIComponent(results[1].replace(/\+/g, " "));
  }
};

Array.prototype.intersects = function(other) {
  var item, _i, _len;
  for (_i = 0, _len = this.length; _i < _len; _i++) {
    item = this[_i];
    if (__indexOf.call(other, item) >= 0) {
      return true;
    }
  }
  return false;
};

Array.prototype.removeItem = function(item) {
  var idx;
  idx = this.indexOf(item);
  if (idx !== -1) {
    this.splice(idx, 1);
  }
  return this;
};

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.getXWSBaseName = function() {
  return this.split('-')[0];
};

URL_BASE = "" + window.location.protocol + "//" + window.location.host + window.location.pathname;

SQUAD_DISPLAY_NAME_MAX_LENGTH = 24;

statAndEffectiveStat = function(base_stat, effective_stats, key) {
  if (base_stat != null) {
    return "" + base_stat + (effective_stats[key] !== base_stat ? " (" + effective_stats[key] + ")" : "");
  } else {
    return "0 (" + effective_stats[key] + ")";
  }
};

getPrimaryFaction = function(faction) {
  switch (faction) {
    case 'Rebel Alliance':
      return 'Rebel Alliance';
    case 'Galactic Empire':
      return 'Galactic Empire';
    default:
      return faction;
  }
};

conditionToHTML = function(condition) {
  var html;
  return html = $.trim("<div class=\"condition\">\n    <div class=\"name\">" + (condition.unique ? "&middot;&nbsp;" : "") + condition.name + "</div>\n    <div class=\"text\">" + condition.text + "</div>\n</div>");
};

exportObj.SquadBuilder = (function() {
  var dfl_filter_func;

  function SquadBuilder(args) {
    this._makeRandomizerLoopFunc = __bind(this._makeRandomizerLoopFunc, this);
    this._randomizerLoopBody = __bind(this._randomizerLoopBody, this);
    this.releaseUnique = __bind(this.releaseUnique, this);
    this.claimUnique = __bind(this.claimUnique, this);
    this.onSquadNameChanged = __bind(this.onSquadNameChanged, this);
    this.onSquadDirtinessChanged = __bind(this.onSquadDirtinessChanged, this);
    this.onSquadLoadRequested = __bind(this.onSquadLoadRequested, this);
    this.onPointsUpdated = __bind(this.onPointsUpdated, this);
    this.onGameTypeChanged = __bind(this.onGameTypeChanged, this);
    this.onNotesUpdated = __bind(this.onNotesUpdated, this);
    this.updatePermaLink = __bind(this.updatePermaLink, this);
    this.getPermaLink = __bind(this.getPermaLink, this);
    this.getPermaLinkParams = __bind(this.getPermaLinkParams, this);
    this.container = $(args.container);
    this.faction = $.trim(args.faction);
    this.printable_container = $(args.printable_container);
    this.tab = $(args.tab);
    this.ships = [];
    this.uniques_in_use = {
      Pilot: [],
      Upgrade: [],
      Modification: [],
      Title: []
    };
    this.suppress_automatic_new_ship = false;
    this.tooltip_currently_displaying = null;
    this.randomizer_options = {
      sources: null,
      points: 100
    };
    this.total_points = 0;
    this.isCustom = false;
    this.isSecondEdition = false;
    this.maxSmallShipsOfOneType = null;
    this.maxLargeShipsOfOneType = null;
    this.backend = null;
    this.current_squad = {};
    this.language = 'English';
    this.collection = null;
    this.current_obstacles = [];
    this.setupUI();
    this.setupEventHandlers();
    window.setInterval(this.updatePermaLink, 250);
    this.isUpdatingPoints = false;
    if ($.getParameterByName('f') === this.faction) {
      this.resetCurrentSquad(true);
      this.loadFromSerialized($.getParameterByName('d'));
    } else {
      this.resetCurrentSquad();
      this.addShip();
    }
  }

  SquadBuilder.prototype.resetCurrentSquad = function(initial_load) {
    var default_squad_name, squad_name, squad_obstacles;
    if (initial_load == null) {
      initial_load = false;
    }
    default_squad_name = 'Unnamed Squadron';
    squad_name = $.trim(this.squad_name_input.val()) || default_squad_name;
    if (initial_load && $.trim($.getParameterByName('sn'))) {
      squad_name = $.trim($.getParameterByName('sn'));
    }
    squad_obstacles = [];
    if (initial_load && $.trim($.getParameterByName('obs'))) {
      squad_obstacles = ($.trim($.getParameterByName('obs'))).split(",").slice(0, 3);
      this.current_obstacles = squad_obstacles;
    } else if (this.current_obstacles) {
      squad_obstacles = this.current_obstacles;
    }
    this.current_squad = {
      id: null,
      name: squad_name,
      dirty: false,
      additional_data: {
        points: this.total_points,
        description: '',
        cards: [],
        notes: '',
        obstacles: squad_obstacles
      },
      faction: this.faction
    };
    if (this.total_points > 0) {
      if (squad_name === default_squad_name) {
        this.current_squad.name = 'Unsaved Squadron';
      }
      this.current_squad.dirty = true;
    }
    this.container.trigger('xwing-backend:squadNameChanged');
    return this.container.trigger('xwing-backend:squadDirtinessChanged');
  };

  SquadBuilder.prototype.newSquadFromScratch = function() {
    this.squad_name_input.val('New Squadron');
    this.removeAllShips();
    this.addShip();
    this.current_obstacles = [];
    this.resetCurrentSquad();
    return this.notes.val('');
  };

  SquadBuilder.prototype.setupUI = function() {
    var DEFAULT_RANDOMIZER_ITERATIONS, DEFAULT_RANDOMIZER_POINTS, DEFAULT_RANDOMIZER_TIMEOUT_SEC, content_container, expansion, opt, _i, _len, _ref;
    DEFAULT_RANDOMIZER_POINTS = 100;
    DEFAULT_RANDOMIZER_TIMEOUT_SEC = 2;
    DEFAULT_RANDOMIZER_ITERATIONS = 1000;
    this.status_container = $(document.createElement('DIV'));
    this.status_container.addClass('container-fluid');
    this.status_container.append($.trim('<div class="row-fluid">\n    <div class="span3 squad-name-container">\n        <div class="display-name">\n            <span class="squad-name"></span>\n            <i class="fa fa-pencil"></i>\n        </div>\n        <div class="input-append">\n            <input type="text" maxlength="64" placeholder="Name your squad..." />\n            <button class="btn save"><i class="fa fa-pencil-square-o"></i></button>\n        </div>\n    </div>\n    <div class="span4 points-display-container">\n        Points: <span class="total-points">0</span> / <input type="number" class="desired-points" value="100">\n        <select class="game-type-selector">\n            <option value="standard">Extended</option>\n            <option value="second_edition">Second Edition</option>\n            <option value="custom">Custom</option>\n        </select>\n        <span class="points-remaining-container">(<span class="points-remaining"></span>&nbsp;left)</span>\n        <span class="content-warning unreleased-content-used hidden"><br /><i class="fa fa-exclamation-circle"></i>&nbsp;<span class="translated"></span></span>\n        <span class="content-warning collection-invalid hidden"><br /><i class="fa fa-exclamation-circle"></i>&nbsp;<span class="translated"></span></span>\n    </div>\n    <div class="span5 pull-right button-container">\n        <div class="btn-group pull-right">\n\n            <button class="btn btn-primary view-as-text"><span class="hidden-phone"><i class="fa fa-print"></i>&nbsp;Print/View as </span>Text</button>\n            <!-- <button class="btn btn-primary print-list hidden-phone hidden-tablet"><i class="fa fa-print"></i>&nbsp;Print</button> -->\n            <a class="btn btn-primary hidden collection"><i class="fa fa-folder-open hidden-phone hidden-tabler"></i>&nbsp;Your Collection</a>\n\n            <!--\n            <button class="btn btn-primary randomize" ><i class="fa fa-random hidden-phone hidden-tablet"></i>&nbsp;Random!</button>\n            <button class="btn btn-primary dropdown-toggle" data-toggle="dropdown">\n                <span class="caret"></span>\n            </button>\n            <ul class="dropdown-menu">\n                <li><a class="randomize-options">Randomizer Options...</a></li>\n            </ul>\n            -->\n\n        </div>\n    </div>\n</div>\n\n<div class="row-fluid">\n    <div class="span12">\n        <button class="show-authenticated btn btn-primary save-list"><i class="fa fa-floppy-o"></i>&nbsp;Save</button>\n        <button class="show-authenticated btn btn-primary save-list-as"><i class="fa fa-files-o"></i>&nbsp;Save As...</button>\n        <button class="show-authenticated btn btn-primary delete-list disabled"><i class="fa fa-trash-o"></i>&nbsp;Delete</button>\n        <button class="show-authenticated btn btn-primary backend-list-my-squads show-authenticated">Load Squad</button>\n        <button class="btn btn-danger clear-squad">New Squad</button>\n        <span class="show-authenticated backend-status"></span>\n    </div>\n</div>'));
    this.container.append(this.status_container);
    this.list_modal = $(document.createElement('DIV'));
    this.list_modal.addClass('modal hide fade text-list-modal');
    this.container.append(this.list_modal);
    this.list_modal.append($.trim("<div class=\"modal-header\">\n    <button type=\"button\" class=\"close hidden-print\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button>\n\n    <div class=\"hidden-phone hidden-print\">\n        <h3><span class=\"squad-name\"></span> (<span class=\"total-points\"></span>)<h3>\n    </div>\n\n    <div class=\"visible-phone hidden-print\">\n        <h4><span class=\"squad-name\"></span> (<span class=\"total-points\"></span>)<h4>\n    </div>\n\n    <div class=\"visible-print\">\n        <div class=\"fancy-header\">\n            <div class=\"squad-name\"></div>\n            <div class=\"squad-faction\"></div>\n            <div class=\"mask\">\n                <div class=\"outer-circle\">\n                    <div class=\"inner-circle\">\n                        <span class=\"total-points\"></span>\n                    </div>\n                </div>\n            </div>\n        </div>\n        <div class=\"fancy-under-header\"></div>\n    </div>\n\n</div>\n<div class=\"modal-body\">\n    <div class=\"fancy-list hidden-phone\"></div>\n    <div class=\"simple-list\"></div>\n    <div class=\"reddit-list\">\n        <p>Copy the below and paste it into your reddit post.</p>\n        <textarea></textarea><button class=\"btn btn-copy\">Copy</button>\n    </div>\n    <div class=\"bbcode-list\">\n        <p>Copy the BBCode below and paste it into your forum post.</p>\n        <textarea></textarea><button class=\"btn btn-copy\">Copy</button>\n    </div>\n    <div class=\"html-list\">\n        <textarea></textarea><button class=\"btn btn-copy\">Copy</button>\n    </div>\n</div>\n<div class=\"modal-footer hidden-print\">\n    <label class=\"vertical-space-checkbox\">\n        Add space for damage/upgrade cards when printing <input type=\"checkbox\" class=\"toggle-vertical-space\" />\n    </label>\n    <label class=\"maneuver-print-checkbox\">\n        Include Maneuvers Chart<input type=\"checkbox\" class=\"toggle-maneuver-print\" checked=\"checked\" />\n    </label>\n    <label class=\"color-print-checkbox\">\n        Print color <input type=\"checkbox\" class=\"toggle-color-print\" checked=\"checked\" />\n    </label>\n    <label class=\"qrcode-checkbox hidden-phone\">\n        Include QR codes <input type=\"checkbox\" class=\"toggle-juggler-qrcode\" checked=\"checked\" />\n    </label>\n    <label class=\"obstacles-checkbox hidden-phone\">\n        Include obstacle/damage deck choices <input type=\"checkbox\" class=\"toggle-obstacles\" />\n    </label>\n    <div class=\"btn-group list-display-mode\">\n        <button class=\"btn select-simple-view\">Simple</button>\n        <button class=\"btn select-fancy-view hidden-phone\">Fancy</button>\n        <button class=\"btn select-reddit-view\">Reddit</button>\n        <button class=\"btn select-bbcode-view\">BBCode</button>\n        <button class=\"btn select-html-view\">HTML</button>\n    </div>\n    <button class=\"btn print-list hidden-phone\"><i class=\"fa fa-print\"></i>&nbsp;Print</button>\n    <button class=\"btn close-print-dialog\" data-dismiss=\"modal\" aria-hidden=\"true\">Close</button>\n</div>"));
    this.fancy_container = $(this.list_modal.find('div.modal-body .fancy-list'));
    this.fancy_total_points_container = $(this.list_modal.find('div.modal-header .total-points'));
    this.simple_container = $(this.list_modal.find('div.modal-body .simple-list'));
    this.reddit_container = $(this.list_modal.find('div.modal-body .reddit-list'));
    this.reddit_textarea = $(this.reddit_container.find('textarea'));
    this.reddit_textarea.attr('readonly', 'readonly');
    this.bbcode_container = $(this.list_modal.find('div.modal-body .bbcode-list'));
    this.bbcode_textarea = $(this.bbcode_container.find('textarea'));
    this.bbcode_textarea.attr('readonly', 'readonly');
    this.htmlview_container = $(this.list_modal.find('div.modal-body .html-list'));
    this.html_textarea = $(this.htmlview_container.find('textarea'));
    this.html_textarea.attr('readonly', 'readonly');
    this.toggle_vertical_space_container = $(this.list_modal.find('.vertical-space-checkbox'));
    this.toggle_color_print_container = $(this.list_modal.find('.color-print-checkbox'));
    this.toggle_maneuver_dial_container = $(this.list_modal.find('.maneuver-print-checkbox'));
    this.list_modal.on('click', 'button.btn-copy', (function(_this) {
      return function(e) {
        _this.self = $(e.currentTarget);
        _this.self.siblings('textarea').select();
        _this.success = document.execCommand('copy');
        if (_this.success) {
          _this.self.addClass('btn-success');
          return setTimeout((function() {
            return _this.self.removeClass('btn-success');
          }), 1000);
        }
      };
    })(this));
    this.select_simple_view_button = $(this.list_modal.find('.select-simple-view'));
    this.select_simple_view_button.click((function(_this) {
      return function(e) {
        _this.select_simple_view_button.blur();
        if (_this.list_display_mode !== 'simple') {
          _this.list_modal.find('.list-display-mode .btn').removeClass('btn-inverse');
          _this.select_simple_view_button.addClass('btn-inverse');
          _this.list_display_mode = 'simple';
          _this.simple_container.show();
          _this.fancy_container.hide();
          _this.reddit_container.hide();
          _this.bbcode_container.hide();
          _this.htmlview_container.hide();
          _this.toggle_vertical_space_container.hide();
          _this.toggle_color_print_container.hide();
          return _this.toggle_maneuver_dial_container.hide();
        }
      };
    })(this));
    this.select_fancy_view_button = $(this.list_modal.find('.select-fancy-view'));
    this.select_fancy_view_button.click((function(_this) {
      return function(e) {
        _this.select_fancy_view_button.blur();
        if (_this.list_display_mode !== 'fancy') {
          _this.list_modal.find('.list-display-mode .btn').removeClass('btn-inverse');
          _this.select_fancy_view_button.addClass('btn-inverse');
          _this.list_display_mode = 'fancy';
          _this.fancy_container.show();
          _this.simple_container.hide();
          _this.reddit_container.hide();
          _this.bbcode_container.hide();
          _this.htmlview_container.hide();
          _this.toggle_vertical_space_container.show();
          _this.toggle_color_print_container.show();
          return _this.toggle_maneuver_dial_container.show();
        }
      };
    })(this));
    this.select_reddit_view_button = $(this.list_modal.find('.select-reddit-view'));
    this.select_reddit_view_button.click((function(_this) {
      return function(e) {
        _this.select_reddit_view_button.blur();
        if (_this.list_display_mode !== 'reddit') {
          _this.list_modal.find('.list-display-mode .btn').removeClass('btn-inverse');
          _this.select_reddit_view_button.addClass('btn-inverse');
          _this.list_display_mode = 'reddit';
          _this.reddit_container.show();
          _this.bbcode_container.hide();
          _this.htmlview_container.hide();
          _this.simple_container.hide();
          _this.fancy_container.hide();
          _this.reddit_textarea.select();
          _this.reddit_textarea.focus();
          _this.toggle_vertical_space_container.show();
          _this.toggle_color_print_container.show();
          return _this.toggle_maneuver_dial_container.show();
        }
      };
    })(this));
    this.select_bbcode_view_button = $(this.list_modal.find('.select-bbcode-view'));
    this.select_bbcode_view_button.click((function(_this) {
      return function(e) {
        _this.select_bbcode_view_button.blur();
        if (_this.list_display_mode !== 'bbcode') {
          _this.list_modal.find('.list-display-mode .btn').removeClass('btn-inverse');
          _this.select_bbcode_view_button.addClass('btn-inverse');
          _this.list_display_mode = 'bbcode';
          _this.bbcode_container.show();
          _this.reddit_container.hide();
          _this.htmlview_container.hide();
          _this.simple_container.hide();
          _this.fancy_container.hide();
          _this.bbcode_textarea.select();
          _this.bbcode_textarea.focus();
          _this.toggle_vertical_space_container.show();
          _this.toggle_color_print_container.show();
          return _this.toggle_maneuver_dial_container.show();
        }
      };
    })(this));
    this.select_html_view_button = $(this.list_modal.find('.select-html-view'));
    this.select_html_view_button.click((function(_this) {
      return function(e) {
        _this.select_html_view_button.blur();
        if (_this.list_display_mode !== 'html') {
          _this.list_modal.find('.list-display-mode .btn').removeClass('btn-inverse');
          _this.select_html_view_button.addClass('btn-inverse');
          _this.list_display_mode = 'html';
          _this.reddit_container.hide();
          _this.bbcode_container.hide();
          _this.htmlview_container.show();
          _this.simple_container.hide();
          _this.fancy_container.hide();
          _this.html_textarea.select();
          _this.html_textarea.focus();
          _this.toggle_vertical_space_container.show();
          _this.toggle_color_print_container.show();
          return _this.toggle_maneuver_dial_container.show();
        }
      };
    })(this));
    if ($(window).width() >= 768) {
      this.simple_container.hide();
      this.select_fancy_view_button.click();
    } else {
      this.select_simple_view_button.click();
    }
    this.clear_squad_button = $(this.status_container.find('.clear-squad'));
    this.clear_squad_button.click((function(_this) {
      return function(e) {
        if (_this.current_squad.dirty && (_this.backend != null)) {
          return _this.backend.warnUnsaved(_this, function() {
            return _this.newSquadFromScratch();
          });
        } else {
          return _this.newSquadFromScratch();
        }
      };
    })(this));
    this.squad_name_container = $(this.status_container.find('div.squad-name-container'));
    this.squad_name_display = $(this.container.find('.display-name'));
    this.squad_name_placeholder = $(this.container.find('.squad-name'));
    this.squad_name_input = $(this.squad_name_container.find('input'));
    this.squad_name_save_button = $(this.squad_name_container.find('button.save'));
    this.squad_name_input.closest('div').hide();
    this.points_container = $(this.status_container.find('div.points-display-container'));
    this.total_points_span = $(this.points_container.find('.total-points'));
    this.game_type_selector = $(this.status_container.find('.game-type-selector'));
    this.game_type_selector.change((function(_this) {
      return function(e) {
        return _this.onGameTypeChanged(_this.game_type_selector.val());
      };
    })(this));
    this.desired_points_input = $(this.points_container.find('.desired-points'));
    this.desired_points_input.change((function(_this) {
      return function(e) {
        _this.game_type_selector.val('custom');
        return _this.onGameTypeChanged('custom');
      };
    })(this));
    this.points_remaining_span = $(this.points_container.find('.points-remaining'));
    this.points_remaining_container = $(this.points_container.find('.points-remaining-container'));
    this.unreleased_content_used_container = $(this.points_container.find('.unreleased-content-used'));
    this.collection_invalid_container = $(this.points_container.find('.collection-invalid'));
    this.view_list_button = $(this.status_container.find('div.button-container button.view-as-text'));
    this.randomize_button = $(this.status_container.find('div.button-container button.randomize'));
    this.customize_randomizer = $(this.status_container.find('div.button-container a.randomize-options'));
    this.backend_status = $(this.status_container.find('.backend-status'));
    this.backend_status.hide();
    this.collection_button = $(this.status_container.find('div.button-container a.collection'));
    this.collection_button.click((function(_this) {
      return function(e) {
        e.preventDefault();
        if (!_this.collection_button.prop('disabled')) {
          return _this.collection.modal.modal('show');
        }
      };
    })(this));
    this.squad_name_input.keypress((function(_this) {
      return function(e) {
        if (e.which === 13) {
          _this.squad_name_save_button.click();
          return false;
        }
      };
    })(this));
    this.squad_name_input.change((function(_this) {
      return function(e) {
        return _this.backend_status.fadeOut('slow');
      };
    })(this));
    this.squad_name_input.blur((function(_this) {
      return function(e) {
        _this.squad_name_input.change();
        return _this.squad_name_save_button.click();
      };
    })(this));
    this.squad_name_display.click((function(_this) {
      return function(e) {
        e.preventDefault();
        _this.squad_name_display.hide();
        _this.squad_name_input.val($.trim(_this.current_squad.name));
        window.setTimeout(function() {
          _this.squad_name_input.focus();
          return _this.squad_name_input.select();
        }, 100);
        return _this.squad_name_input.closest('div').show();
      };
    })(this));
    this.squad_name_save_button.click((function(_this) {
      return function(e) {
        var name;
        e.preventDefault();
        _this.current_squad.dirty = true;
        _this.container.trigger('xwing-backend:squadDirtinessChanged');
        name = _this.current_squad.name = $.trim(_this.squad_name_input.val());
        if (name.length > 0) {
          _this.squad_name_display.show();
          _this.container.trigger('xwing-backend:squadNameChanged');
          return _this.squad_name_input.closest('div').hide();
        }
      };
    })(this));
    this.randomizer_options_modal = $(document.createElement('DIV'));
    this.randomizer_options_modal.addClass('modal hide fade');
    $('body').append(this.randomizer_options_modal);
    this.randomizer_options_modal.append($.trim("<div class=\"modal-header\">\n    <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button>\n    <h3>Random Squad Builder Options</h3>\n</div>\n<div class=\"modal-body\">\n    <form>\n        <label>\n            Desired Points\n            <input type=\"number\" class=\"randomizer-points\" value=\"" + DEFAULT_RANDOMIZER_POINTS + "\" placeholder=\"" + DEFAULT_RANDOMIZER_POINTS + "\" />\n        </label>\n        <label>\n            Sets and Expansions (default all)\n            <select class=\"randomizer-sources\" multiple=\"1\" data-placeholder=\"Use all sets and expansions\">\n            </select>\n        </label>\n        <label>\n            Maximum Seconds to Spend Randomizing\n            <input type=\"number\" class=\"randomizer-timeout\" value=\"" + DEFAULT_RANDOMIZER_TIMEOUT_SEC + "\" placeholder=\"" + DEFAULT_RANDOMIZER_TIMEOUT_SEC + "\" />\n        </label>\n        <label>\n            Maximum Randomization Iterations\n            <input type=\"number\" class=\"randomizer-iterations\" value=\"" + DEFAULT_RANDOMIZER_ITERATIONS + "\" placeholder=\"" + DEFAULT_RANDOMIZER_ITERATIONS + "\" />\n        </label>\n    </form>\n</div>\n<div class=\"modal-footer\">\n    <button class=\"btn btn-primary do-randomize\" aria-hidden=\"true\">Randomize!</button>\n    <button class=\"btn\" data-dismiss=\"modal\" aria-hidden=\"true\">Close</button>\n</div>"));
    this.randomizer_source_selector = $(this.randomizer_options_modal.find('select.randomizer-sources'));
    _ref = exportObj.expansions;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      expansion = _ref[_i];
      opt = $(document.createElement('OPTION'));
      opt.text(expansion);
      this.randomizer_source_selector.append(opt);
    }
    this.randomizer_source_selector.select2({
      width: "100%",
      minimumResultsForSearch: $.isMobile() ? -1 : 0
    });
    this.randomize_button.click((function(_this) {
      return function(e) {
        var iterations, points, timeout_sec;
        e.preventDefault();
        if (_this.current_squad.dirty && (_this.backend != null)) {
          return _this.backend.warnUnsaved(_this, function() {
            return _this.randomize_button.click();
          });
        } else {
          points = parseInt($(_this.randomizer_options_modal.find('.randomizer-points')).val());
          if (isNaN(points) || points <= 0) {
            points = DEFAULT_RANDOMIZER_POINTS;
          }
          timeout_sec = parseInt($(_this.randomizer_options_modal.find('.randomizer-timeout')).val());
          if (isNaN(timeout_sec) || timeout_sec <= 0) {
            timeout_sec = DEFAULT_RANDOMIZER_TIMEOUT_SEC;
          }
          iterations = parseInt($(_this.randomizer_options_modal.find('.randomizer-iterations')).val());
          if (isNaN(iterations) || iterations <= 0) {
            iterations = DEFAULT_RANDOMIZER_ITERATIONS;
          }
          return _this.randomSquad(points, _this.randomizer_source_selector.val(), DEFAULT_RANDOMIZER_TIMEOUT_SEC * 1000, iterations);
        }
      };
    })(this));
    this.randomizer_options_modal.find('button.do-randomize').click((function(_this) {
      return function(e) {
        e.preventDefault();
        _this.randomizer_options_modal.modal('hide');
        return _this.randomize_button.click();
      };
    })(this));
    this.customize_randomizer.click((function(_this) {
      return function(e) {
        e.preventDefault();
        return _this.randomizer_options_modal.modal();
      };
    })(this));
    this.choose_obstacles_modal = $(document.createElement('DIV'));
    this.choose_obstacles_modal.addClass('modal hide fade choose-obstacles-modal');
    this.container.append(this.choose_obstacles_modal);
    this.choose_obstacles_modal.append($.trim("<div class=\"modal-header\">\n    <label class='choose-obstacles-description'>Choose up to three obstacles, to include in the permalink for use in external programs</label>\n</div>\n<div class=\"modal-body\">\n    <div class=\"obstacle-select-container\" style=\"float:left\">\n        <select multiple class='obstacle-select' size=\"18\">\n            <option class=\"coreasteroid0-select\" value=\"coreasteroid0\">Core Asteroid 0</option>\n            <option class=\"coreasteroid1-select\" value=\"coreasteroid1\">Core Asteroid 1</option>\n            <option class=\"coreasteroid2-select\" value=\"coreasteroid2\">Core Asteroid 2</option>\n            <option class=\"coreasteroid3-select\" value=\"coreasteroid3\">Core Asteroid 3</option>\n            <option class=\"coreasteroid4-select\" value=\"coreasteroid4\">Core Asteroid 4</option>\n            <option class=\"coreasteroid5-select\" value=\"coreasteroid5\">Core Asteroid 5</option>\n            <option class=\"yt2400debris0-select\" value=\"yt2400debris0\">YT2400 Debris 0</option>\n            <option class=\"yt2400debris1-select\" value=\"yt2400debris1\">YT2400 Debris 1</option>\n            <option class=\"yt2400debris2-select\" value=\"yt2400debris2\">YT2400 Debris 2</option>\n            <option class=\"vt49decimatordebris0-select\" value=\"vt49decimatordebris0\">VT49 Debris 0</option>\n            <option class=\"vt49decimatordebris1-select\" value=\"vt49decimatordebris1\">VT49 Debris 1</option>\n            <option class=\"vt49decimatordebris2-select\" value=\"vt49decimatordebris2\">VT49 Debris 2</option>\n            <option class=\"core2asteroid0-select\" value=\"core2asteroid0\">Force Awakens Asteroid 0</option>\n            <option class=\"core2asteroid1-select\" value=\"core2asteroid1\">Force Awakens Asteroid 1</option>\n            <option class=\"core2asteroid2-select\" value=\"core2asteroid2\">Force Awakens Asteroid 2</option>\n            <option class=\"core2asteroid3-select\" value=\"core2asteroid3\">Force Awakens Asteroid 3</option>\n            <option class=\"core2asteroid4-select\" value=\"core2asteroid4\">Force Awakens Asteroid 4</option>\n            <option class=\"core2asteroid5-select\" value=\"core2asteroid5\">Force Awakens Asteroid 5</option>\n        </select>\n    </div>\n    <div class=\"obstacle-image-container\" style=\"display:none;\">\n        <img class=\"obstacle-image\" src=\"images/core2asteroid0.png\" />\n    </div>\n</div>\n<div class=\"modal-footer hidden-print\">\n    <button class=\"btn close-print-dialog\" data-dismiss=\"modal\" aria-hidden=\"true\">Close</button>\n</div>"));
    this.obstacles_select = this.choose_obstacles_modal.find('.obstacle-select');
    this.obstacles_select_image = this.choose_obstacles_modal.find('.obstacle-image-container');
    this.backend_list_squads_button = $(this.container.find('button.backend-list-my-squads'));
    this.backend_list_squads_button.click((function(_this) {
      return function(e) {
        e.preventDefault();
        if (_this.backend != null) {
          return _this.backend.list(_this);
        }
      };
    })(this));
    this.backend_save_list_button = $(this.container.find('button.save-list'));
    this.backend_save_list_button.click((function(_this) {
      return function(e) {
        var additional_data, results, ___iced_passed_deferral, __iced_deferrals, __iced_k;
        __iced_k = __iced_k_noop;
        ___iced_passed_deferral = iced.findDeferral(arguments);
        e.preventDefault();
        if ((_this.backend != null) && !_this.backend_save_list_button.hasClass('disabled')) {
          additional_data = {
            points: _this.total_points,
            description: _this.describeSquad(),
            cards: _this.listCards(),
            notes: _this.notes.val().substr(0, 1024),
            obstacles: _this.getObstacles()
          };
          _this.backend_status.html($.trim("<i class=\"fa fa-refresh fa-spin\"></i>&nbsp;Saving squad..."));
          _this.backend_status.show();
          _this.backend_save_list_button.addClass('disabled');
          (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral
            });
            _this.backend.save(_this.serialize(), _this.current_squad.id, _this.current_squad.name, _this.faction, additional_data, __iced_deferrals.defer({
              assign_fn: (function() {
                return function() {
                  return results = arguments[0];
                };
              })(),
              lineno: 18399
            }));
            __iced_deferrals._fulfill();
          })(function() {
            return __iced_k(results.success ? (_this.current_squad.dirty = false, _this.current_squad.id != null ? _this.backend_status.html($.trim("<i class=\"fa fa-check\"></i>&nbsp;Squad updated successfully.")) : (_this.backend_status.html($.trim("<i class=\"fa fa-check\"></i>&nbsp;New squad saved successfully.")), _this.current_squad.id = results.id), _this.container.trigger('xwing-backend:squadDirtinessChanged')) : (_this.backend_status.html($.trim("<i class=\"fa fa-exclamation-circle\"></i>&nbsp;" + results.error)), _this.backend_save_list_button.removeClass('disabled')));
          });
        } else {
          return __iced_k();
        }
      };
    })(this));
    this.backend_save_list_as_button = $(this.container.find('button.save-list-as'));
    this.backend_save_list_as_button.addClass('disabled');
    this.backend_save_list_as_button.click((function(_this) {
      return function(e) {
        e.preventDefault();
        if ((_this.backend != null) && !_this.backend_save_list_as_button.hasClass('disabled')) {
          return _this.backend.showSaveAsModal(_this);
        }
      };
    })(this));
    this.backend_delete_list_button = $(this.container.find('button.delete-list'));
    this.backend_delete_list_button.click((function(_this) {
      return function(e) {
        e.preventDefault();
        if ((_this.backend != null) && !_this.backend_delete_list_button.hasClass('disabled')) {
          return _this.backend.showDeleteModal(_this);
        }
      };
    })(this));
    content_container = $(document.createElement('DIV'));
    content_container.addClass('container-fluid');
    this.container.append(content_container);
    content_container.append($.trim("<div class=\"row-fluid\">\n    <div class=\"span9 ship-container\">\n        <label class=\"notes-container show-authenticated\">\n            <span>Squad Notes:</span>\n            <br />\n            <textarea class=\"squad-notes\"></textarea>\n        </label>\n        <span class=\"obstacles-container\">\n            <button class=\"btn btn-primary choose-obstacles\">Choose Obstacles</button>\n        </span>\n     </div>\n   <div class=\"span3 info-container\" id=\"info-container\" />\n</div>"));
    this.ship_container = $(content_container.find('div.ship-container'));
    this.info_container = $(content_container.find('div.info-container'));
    this.obstacles_container = content_container.find('.obstacles-container');
    this.notes_container = $(content_container.find('.notes-container'));
    this.notes = $(this.notes_container.find('textarea.squad-notes'));
    this.info_container.append($.trim("<div class=\"well well-small info-well\">\n    <span class=\"info-name\"></span>\n    <br />\n    <span class=\"info-sources\"></span>\n    <br />\n    <span class=\"info-collection\"></span>\n    <table>\n        <tbody>\n            <tr class=\"info-ship\">\n                <td class=\"info-header\">Ship</td>\n                <td class=\"info-data\"></td>\n            </tr>\n            <tr class=\"info-base\">\n                <td class=\"info-header\">Base</td>\n                <td class=\"info-data\"></td>\n            </tr>\n            <tr class=\"info-skill\">\n                <td class=\"info-header\">Initiative</td>\n                <td class=\"info-data info-skill\"></td>\n            </tr>\n            <tr class=\"info-energy\">\n                <td class=\"info-header\"><i class=\"xwing-miniatures-font header-energy xwing-miniatures-font-energy\"></i></td>\n                <td class=\"info-data info-energy\"></td>\n            </tr>\n            <tr class=\"info-attack\">\n                <td class=\"info-header\"><i class=\"xwing-miniatures-font header-attack xwing-miniatures-font-frontarc\"></i></td>\n                <td class=\"info-data info-attack\"></td>\n            </tr>\n            <tr class=\"info-attack-fullfront\">\n                <td class=\"info-header\"><i class=\"xwing-miniatures-font header-attack xwing-miniatures-font-fullfrontarc\"></i></td>\n                <td class=\"info-data info-attack\"></td>\n            </tr>\n            <tr class=\"info-attack-bullseye\">\n                <td class=\"info-header\"><i class=\"xwing-miniatures-font header-attack xwing-miniatures-font-bullseyearc\"></i></td>\n                <td class=\"info-data info-attack\"></td>\n            </tr>\n            <tr class=\"info-attack-back\">\n                <td class=\"info-header\"><i class=\"xwing-miniatures-font header-attack xwing-miniatures-font-reararc\"></i></td>\n                <td class=\"info-data info-attack\"></td>\n            </tr>\n            <tr class=\"info-attack-turret\">\n                <td class=\"info-header\"><i class=\"xwing-miniatures-font header-attack xwing-miniatures-font-singleturretarc\"></i></td>\n                <td class=\"info-data info-attack\"></td>\n            </tr>\n            <tr class=\"info-attack-doubleturret\">\n                <td class=\"info-header\"><i class=\"xwing-miniatures-font header-attack xwing-miniatures-font-doubleturretarc\"></i></td>\n                <td class=\"info-data info-attack\"></td>\n            </tr>\n            <tr class=\"info-agility\">\n                <td class=\"info-header\"><i class=\"xwing-miniatures-font header-agility xwing-miniatures-font-agility\"></i></td>\n                <td class=\"info-data info-agility\"></td>\n            </tr>\n            <tr class=\"info-hull\">\n                <td class=\"info-header\"><i class=\"xwing-miniatures-font header-hull xwing-miniatures-font-hull\"></i></td>\n                <td class=\"info-data info-hull\"></td>\n            </tr>\n            <tr class=\"info-shields\">\n                <td class=\"info-header\"><i class=\"xwing-miniatures-font header-shield xwing-miniatures-font-shield\"></i></td>\n                <td class=\"info-data info-shields\"></td>\n            </tr>\n            <tr class=\"info-force\">\n                <td class=\"info-header\"><i class=\"xwing-miniatures-font header-force xwing-miniatures-font-forcecharge\"></i></td>\n                <td class=\"info-data info-force\"></td>\n            </tr>\n            <tr class=\"info-charge\">\n                <td class=\"info-header\"><i class=\"xwing-miniatures-font header-charge xwing-miniatures-font-charge\"></i></td>\n                <td class=\"info-data info-charge\"></td>\n            </tr>\n            <tr class=\"info-range\">\n                <td class=\"info-header\">Range</td>\n                <td class=\"info-data info-range\"></td><td class=\"info-rangebonus\"><i class=\"xwing-miniatures-font red header-range xwing-miniatures-font-rangebonusindicator\"></i></td>\n            </tr>\n            <tr class=\"info-actions\">\n                <td class=\"info-header\">Actions</td>\n                <td class=\"info-data\"></td>\n            </tr>\n            <tr class=\"info-actions-red\">\n                <td></td>\n                <td class=\"info-data-red\"></td>\n            </tr>\n            <tr class=\"info-upgrades\">\n                <td class=\"info-header\">Upgrades</td>\n                <td class=\"info-data\"></td>\n            </tr>\n        </tbody>\n    </table>\n    <p class=\"info-text\" />\n    <p class=\"info-maneuvers\" />\n</div>"));
    this.info_container.hide();
    this.print_list_button = $(this.container.find('button.print-list'));
    this.container.find('[rel=tooltip]').tooltip();
    this.obstacles_button = $(this.container.find('button.choose-obstacles'));
    this.obstacles_button.click((function(_this) {
      return function(e) {
        e.preventDefault();
        return _this.showChooseObstaclesModal();
      };
    })(this));
    this.condition_container = $(document.createElement('div'));
    this.condition_container.addClass('conditions-container');
    return this.container.append(this.condition_container);
  };

  SquadBuilder.prototype.setupEventHandlers = function() {
    this.container.on('xwing:claimUnique', (function(_this) {
      return function(e, unique, type, cb) {
        return _this.claimUnique(unique, type, cb);
      };
    })(this)).on('xwing:releaseUnique', (function(_this) {
      return function(e, unique, type, cb) {
        return _this.releaseUnique(unique, type, cb);
      };
    })(this)).on('xwing:pointsUpdated', (function(_this) {
      return function(e, cb) {
        if (cb == null) {
          cb = $.noop;
        }
        if (_this.isUpdatingPoints) {
          return cb();
        } else {
          _this.isUpdatingPoints = true;
          return _this.onPointsUpdated(function() {
            _this.isUpdatingPoints = false;
            return cb();
          });
        }
      };
    })(this)).on('xwing-backend:squadLoadRequested', (function(_this) {
      return function(e, squad) {
        return _this.onSquadLoadRequested(squad);
      };
    })(this)).on('xwing-backend:squadDirtinessChanged', (function(_this) {
      return function(e) {
        return _this.onSquadDirtinessChanged();
      };
    })(this)).on('xwing-backend:squadNameChanged', (function(_this) {
      return function(e) {
        return _this.onSquadNameChanged();
      };
    })(this)).on('xwing:beforeLanguageLoad', (function(_this) {
      return function(e, cb) {
        var old_dirty;
        if (cb == null) {
          cb = $.noop;
        }
        _this.pretranslation_serialized = _this.serialize();
        old_dirty = _this.current_squad.dirty;
        _this.removeAllShips();
        _this.current_squad.dirty = old_dirty;
        return cb();
      };
    })(this)).on('xwing:afterLanguageLoad', (function(_this) {
      return function(e, language, cb) {
        var old_dirty, ship, _i, _len, _ref;
        if (cb == null) {
          cb = $.noop;
        }
        _this.language = language;
        old_dirty = _this.current_squad.dirty;
        _this.loadFromSerialized(_this.pretranslation_serialized);
        _ref = _this.ships;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          ship = _ref[_i];
          ship.updateSelections();
        }
        _this.current_squad.dirty = old_dirty;
        _this.pretranslation_serialized = void 0;
        return cb();
      };
    })(this)).on('xwing:shipUpdated', (function(_this) {
      return function(e, cb) {
        var all_allocated, ship, _i, _len, _ref;
        if (cb == null) {
          cb = $.noop;
        }
        all_allocated = true;
        _ref = _this.ships;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          ship = _ref[_i];
          ship.updateSelections();
          if (ship.ship_selector.val() === '') {
            all_allocated = false;
          }
        }
        if (all_allocated && !_this.suppress_automatic_new_ship) {
          return _this.addShip();
        }
      };
    })(this));
    $(window).on('xwing-backend:authenticationChanged', (function(_this) {
      return function(e) {
        return _this.resetCurrentSquad();
      };
    })(this)).on('xwing-collection:created', (function(_this) {
      return function(e, collection) {
        _this.collection = collection;
        _this.collection.onLanguageChange(null, _this.language);
        _this.checkCollection();
        return _this.collection_button.removeClass('hidden');
      };
    })(this)).on('xwing-collection:changed', (function(_this) {
      return function(e, collection) {
        return _this.checkCollection();
      };
    })(this)).on('xwing-collection:destroyed', (function(_this) {
      return function(e, collection) {
        _this.collection = null;
        return _this.collection_button.addClass('hidden');
      };
    })(this)).on('xwing:pingActiveBuilder', (function(_this) {
      return function(e, cb) {
        if (_this.container.is(':visible')) {
          return cb(_this);
        }
      };
    })(this)).on('xwing:activateBuilder', (function(_this) {
      return function(e, faction, cb) {
        if (faction === _this.faction) {
          _this.tab.tab('show');
          return cb(_this);
        }
      };
    })(this));
    this.obstacles_select.change((function(_this) {
      return function(e) {
        var new_selection, o, previous_obstacles;
        if (_this.obstacles_select.val().length > 3) {
          return _this.obstacles_select.val(_this.current_squad.additional_data.obstacles);
        } else {
          previous_obstacles = _this.current_squad.additional_data.obstacles;
          _this.current_obstacles = (function() {
            var _i, _len, _ref, _results;
            _ref = this.obstacles_select.val();
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              o = _ref[_i];
              _results.push(o);
            }
            return _results;
          }).call(_this);
          if ((previous_obstacles != null)) {
            new_selection = _this.current_obstacles.filter(function(element) {
              return previous_obstacles.indexOf(element) === -1;
            });
          } else {
            new_selection = _this.current_obstacles;
          }
          if (new_selection.length > 0) {
            _this.showChooseObstaclesSelectImage(new_selection[0]);
          }
          _this.current_squad.additional_data.obstacles = _this.current_obstacles;
          _this.current_squad.dirty = true;
          return _this.container.trigger('xwing-backend:squadDirtinessChanged');
        }
      };
    })(this));
    this.view_list_button.click((function(_this) {
      return function(e) {
        e.preventDefault();
        return _this.showTextListModal();
      };
    })(this));
    this.print_list_button.click((function(_this) {
      return function(e) {
        var dial, faction, query, ship, text, _i, _j, _len, _len1, _ref, _ref1;
        e.preventDefault();
        _this.printable_container.find('.printable-header').html(_this.list_modal.find('.modal-header').html());
        _this.printable_container.find('.printable-body').text('');
        switch (_this.list_display_mode) {
          case 'simple':
            _this.printable_container.find('.printable-body').html(_this.simple_container.html());
            break;
          default:
            _ref = _this.ships;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              ship = _ref[_i];
              if (ship.pilot != null) {
                _this.printable_container.find('.printable-body').append(ship.toHTML());
              }
            }
            _this.printable_container.find('.fancy-ship').toggleClass('tall', _this.list_modal.find('.toggle-vertical-space').prop('checked'));
            _this.printable_container.find('.printable-body').toggleClass('bw', !_this.list_modal.find('.toggle-color-print').prop('checked'));
            if (!_this.list_modal.find('.toggle-maneuver-print').prop('checked')) {
              _ref1 = _this.printable_container.find('.fancy-dial');
              for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                dial = _ref1[_j];
                dial.hidden = true;
              }
            }
            faction = (function() {
              switch (this.faction) {
                case 'Rebel Alliance':
                  return 'rebel';
                case 'Galactic Empire':
                  return 'empire';
                case 'Scum and Villainy':
                  return 'scum';
                case 'Resistance':
                  return 'resistance';
                case 'First Order':
                  return 'firstorder';
              }
            }).call(_this);
            _this.printable_container.find('.squad-faction').html("<i class=\"xwing-miniatures-font xwing-miniatures-font-" + faction + "\"></i>");
        }
        _this.printable_container.find('.printable-body').append($.trim("<div class=\"print-conditions\"></div>"));
        _this.printable_container.find('.printable-body .print-conditions').html(_this.condition_container.html());
        if ($.trim(_this.notes.val()) !== '') {
          _this.printable_container.find('.printable-body').append($.trim("<h5 class=\"print-notes\">Notes:</h5>\n<pre class=\"print-notes\"></pre>"));
          _this.printable_container.find('.printable-body pre.print-notes').text(_this.notes.val());
        }
        if (_this.list_modal.find('.toggle-obstacles').prop('checked')) {
          _this.printable_container.find('.printable-body').append($.trim("<div class=\"obstacles\">\n    <div>Mark the three obstacles you are using.</div>\n    <img class=\"obstacle-silhouettes\" src=\"images/xws-obstacles.png\" />\n    <div>Mark which damage deck you are using.</div>\n    <div><i class=\"fa fa-square-o\"></i>Original Core Set&nbsp;&nbsp&nbsp;<i class=\"fa fa-square-o\"></i>The Force Awakens Core Set</div>\n</div>"));
        }
        query = _this.getPermaLinkParams(['sn', 'obs']);
        if ((query != null) && _this.list_modal.find('.toggle-juggler-qrcode').prop('checked')) {
          _this.printable_container.find('.printable-body').append($.trim("<div class=\"qrcode-container\">\n    <div class=\"permalink-container\">\n        <div class=\"qrcode\"></div>\n        <div class=\"qrcode-text\">Scan to open this list in the builder</div>\n    </div>\n    <div class=\"juggler-container\">\n        <div class=\"qrcode\"></div>\n        <div class=\"qrcode-text\">TOs: Scan to load this squad into List Juggler</div>\n    </div>\n</div>"));
          text = "https://yasb-xws.herokuapp.com/juggler" + query;
          _this.printable_container.find('.juggler-container .qrcode').qrcode({
            render: 'div',
            ec: 'M',
            size: text.length < 144 ? 144 : 160,
            text: text
          });
          text = "https://geordanr.github.io/xwing/" + query;
          _this.printable_container.find('.permalink-container .qrcode').qrcode({
            render: 'div',
            ec: 'M',
            size: text.length < 144 ? 144 : 160,
            text: text
          });
        }
        return window.print();
      };
    })(this));
    $(window).resize((function(_this) {
      return function() {
        if ($(window).width() < 768 && _this.list_display_mode !== 'simple') {
          return _this.select_simple_view_button.click();
        }
      };
    })(this));
    this.notes.change(this.onNotesUpdated);
    return this.notes.on('keyup', this.onNotesUpdated);
  };

  SquadBuilder.prototype.getPermaLinkParams = function(ignored_params) {
    var k, params, v;
    if (ignored_params == null) {
      ignored_params = [];
    }
    params = {};
    if (__indexOf.call(ignored_params, 'f') < 0) {
      params.f = encodeURI(this.faction);
    }
    if (__indexOf.call(ignored_params, 'd') < 0) {
      params.d = encodeURI(this.serialize());
    }
    if (__indexOf.call(ignored_params, 'sn') < 0) {
      params.sn = encodeURIComponent(this.current_squad.name);
    }
    if (__indexOf.call(ignored_params, 'obs') < 0) {
      params.obs = encodeURI(this.current_squad.additional_data.obstacles || '');
    }
    return "?" + ((function() {
      var _results;
      _results = [];
      for (k in params) {
        v = params[k];
        _results.push("" + k + "=" + v);
      }
      return _results;
    })()).join("&");
  };

  SquadBuilder.prototype.getPermaLink = function(params) {
    if (params == null) {
      params = this.getPermaLinkParams();
    }
    return "" + URL_BASE + params;
  };

  SquadBuilder.prototype.updatePermaLink = function() {
    var next_params;
    if (!this.container.is(':visible')) {
      return;
    }
    next_params = this.getPermaLinkParams();
    if (window.location.search !== next_params) {
      return window.history.replaceState(next_params, '', this.getPermaLink(next_params));
    }
  };

  SquadBuilder.prototype.onNotesUpdated = function() {
    if (this.total_points > 0) {
      this.current_squad.dirty = true;
      return this.container.trigger('xwing-backend:squadDirtinessChanged');
    }
  };

  SquadBuilder.prototype.onGameTypeChanged = function(gametype, cb) {
    var oldSecondEdition;
    if (cb == null) {
      cb = $.noop;
    }
    oldSecondEdition = this.isSecondEdition;
    switch (gametype) {
      case 'standard':
        this.isSecondEdition = false;
        this.isCustom = false;
        this.desired_points_input.val(200);
        this.maxSmallShipsOfOneType = null;
        this.maxLargeShipsOfOneType = null;
        break;
      case 'second_edition':
        this.isSecondEdition = true;
        this.isCustom = false;
        this.desired_points_input.val(200);
        this.maxSmallShipsOfOneType = null;
        this.maxLargeShipsOfOneType = null;
        break;
      case 'custom':
        this.isSecondEdition = false;
        this.isCustom = true;
        this.maxSmallShipsOfOneType = null;
        this.maxLargeShipsOfOneType = null;
    }
    if (oldSecondEdition !== this.isSecondEdition) {
      this.newSquadFromScratch();
    }
    return this.onPointsUpdated(cb);
  };

  SquadBuilder.prototype.onPointsUpdated = function(cb) {
    var bbcode_ships, conditions, conditions_set, htmlview_ships, i, points_left, reddit_ships, ship, ship_uses_unreleased_content, unreleased_content_used, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
    if (cb == null) {
      cb = $.noop;
    }
    this.total_points = 0;
    unreleased_content_used = false;
    _ref = this.ships;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      ship = _ref[i];
      ship.validate();
      this.total_points += ship.getPoints();
      ship_uses_unreleased_content = ship.checkUnreleasedContent();
      if (ship_uses_unreleased_content) {
        unreleased_content_used = ship_uses_unreleased_content;
      }
    }
    this.total_points_span.text(this.total_points);
    points_left = parseInt(this.desired_points_input.val()) - this.total_points;
    this.points_remaining_span.text(points_left);
    this.points_remaining_container.toggleClass('red', points_left < 0);
    this.unreleased_content_used_container.toggleClass('hidden', !unreleased_content_used);
    this.fancy_total_points_container.text(this.total_points);
    this.fancy_container.text('');
    this.simple_container.html('<table class="simple-table"></table>');
    reddit_ships = [];
    bbcode_ships = [];
    htmlview_ships = [];
    _ref1 = this.ships;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      ship = _ref1[_j];
      if (ship.pilot != null) {
        this.fancy_container.append(ship.toHTML());
        this.simple_container.find('table').append(ship.toTableRow());
        reddit_ships.push(ship.toRedditText());
        bbcode_ships.push(ship.toBBCode());
        htmlview_ships.push(ship.toSimpleHTML());
      }
    }
    this.htmlview_container.find('textarea').val($.trim("" + (htmlview_ships.join('<br />')) + "\n<br />\n<b><i>Total: " + this.total_points + "</i></b>\n<br />\n<a href=\"" + (this.getPermaLink()) + "\">View in Yet Another Squad Builder 2.0</a>"));
    this.reddit_container.find('textarea').val($.trim("" + (reddit_ships.join("    \n")) + "\n\n\n**Total:** *" + this.total_points + "*    \n\n\n\n[View in Yet Another Squad Builder 2.0](" + (this.getPermaLink()) + ")    \n"));
    this.bbcode_container.find('textarea').val($.trim("" + (bbcode_ships.join("\n\n")) + "\n\n[b][i]Total: " + this.total_points + "[/i][/b]\n\n[url=" + (this.getPermaLink()) + "]View in Yet Another Squad Builder 2.0[/url]"));
    this.checkCollection();
    if (typeof Set !== "undefined" && Set !== null) {
      conditions_set = new Set();
      _ref2 = this.ships;
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        ship = _ref2[_k];
        ship.getConditions().forEach(function(condition) {
          return conditions_set.add(condition);
        });
      }
      conditions = [];
      conditions_set.forEach(function(condition) {
        return conditions.push(condition);
      });
      conditions.sort(function(a, b) {
        if (a.name.canonicalize() < b.name.canonicalize()) {
          return -1;
        } else if (b.name.canonicalize() > a.name.canonicalize()) {
          return 1;
        } else {
          return 0;
        }
      });
      this.condition_container.text('');
      conditions.forEach((function(_this) {
        return function(condition) {
          return _this.condition_container.append(conditionToHTML(condition));
        };
      })(this));
    }
    return cb(this.total_points);
  };

  SquadBuilder.prototype.onSquadLoadRequested = function(squad) {
    var _ref;
    console.log(squad.additional_data.obstacles);
    this.current_squad = squad;
    this.backend_delete_list_button.removeClass('disabled');
    this.squad_name_input.val(this.current_squad.name);
    this.squad_name_placeholder.text(this.current_squad.name);
    this.current_obstacles = this.current_squad.additional_data.obstacles;
    this.updateObstacleSelect(this.current_squad.additional_data.obstacles);
    this.loadFromSerialized(squad.serialized);
    this.notes.val((_ref = squad.additional_data.notes) != null ? _ref : '');
    this.backend_status.fadeOut('slow');
    this.current_squad.dirty = false;
    return this.container.trigger('xwing-backend:squadDirtinessChanged');
  };

  SquadBuilder.prototype.onSquadDirtinessChanged = function() {
    this.backend_save_list_button.toggleClass('disabled', !(this.current_squad.dirty && this.total_points > 0));
    this.backend_save_list_as_button.toggleClass('disabled', this.total_points === 0);
    return this.backend_delete_list_button.toggleClass('disabled', this.current_squad.id == null);
  };

  SquadBuilder.prototype.onSquadNameChanged = function() {
    var short_name;
    if (this.current_squad.name.length > SQUAD_DISPLAY_NAME_MAX_LENGTH) {
      short_name = "" + (this.current_squad.name.substr(0, SQUAD_DISPLAY_NAME_MAX_LENGTH)) + "&hellip;";
    } else {
      short_name = this.current_squad.name;
    }
    this.squad_name_placeholder.text('');
    this.squad_name_placeholder.append(short_name);
    return this.squad_name_input.val(this.current_squad.name);
  };

  SquadBuilder.prototype.removeAllShips = function() {
    while (this.ships.length > 0) {
      this.removeShip(this.ships[0]);
    }
    if (this.ships.length > 0) {
      throw new Error("Ships not emptied");
    }
  };

  SquadBuilder.prototype.showTextListModal = function() {
    return this.list_modal.modal('show');
  };

  SquadBuilder.prototype.showChooseObstaclesModal = function() {
    this.obstacles_select.val(this.current_squad.additional_data.obstacles);
    return this.choose_obstacles_modal.modal('show');
  };

  SquadBuilder.prototype.showChooseObstaclesSelectImage = function(obstacle) {
    this.image_name = 'images/' + obstacle + '.png';
    this.obstacles_select_image.find('.obstacle-image').attr('src', this.image_name);
    return this.obstacles_select_image.show();
  };

  SquadBuilder.prototype.updateObstacleSelect = function(obstacles) {
    this.current_obstacles = obstacles;
    return this.obstacles_select.val(obstacles);
  };

  SquadBuilder.prototype.serialize = function() {
    var game_type_abbrev, serialization_version, ship;
    serialization_version = 4;
    game_type_abbrev = (function() {
      switch (this.game_type_selector.val()) {
        case 'standard':
          return 's';
        case 'second_edition':
          return 'se';
        case 'custom':
          return "c=" + ($.trim(this.desired_points_input.val()));
      }
    }).call(this);
    return "v" + serialization_version + "!" + game_type_abbrev + "!" + (((function() {
      var _i, _len, _ref, _results;
      _ref = this.ships;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        ship = _ref[_i];
        if (ship.pilot != null) {
          _results.push(ship.toSerialized());
        }
      }
      return _results;
    }).call(this)).join(';'));
  };

  SquadBuilder.prototype.loadFromSerialized = function(serialized) {
    var game_type_abbrev, matches, new_ship, re, serialized_ship, serialized_ships, version, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3;
    this.suppress_automatic_new_ship = true;
    this.removeAllShips();
    re = /^v(\d+)!(.*)/;
    matches = re.exec(serialized);
    if (matches != null) {
      version = parseInt(matches[1]);
      switch (version) {
        case 3:
        case 4:
          _ref = matches[2].split('!'), game_type_abbrev = _ref[0], serialized_ships = _ref[1];
          switch (game_type_abbrev) {
            case 's':
              this.game_type_selector.val('standard');
              this.game_type_selector.change();
              break;
            case 'se':
              this.game_type_selector.val('second_edition');
              this.game_type_selector.change();
              break;
            default:
              this.game_type_selector.val('custom');
              this.desired_points_input.val(parseInt(game_type_abbrev.split('=')[1]));
              this.desired_points_input.change();
          }
          _ref1 = serialized_ships.split(';');
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            serialized_ship = _ref1[_i];
            if (serialized_ship !== '') {
              new_ship = this.addShip();
              new_ship.fromSerialized(version, serialized_ship);
            }
          }
          break;
        case 2:
          _ref2 = matches[2].split(';');
          for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
            serialized_ship = _ref2[_j];
            if (serialized_ship !== '') {
              new_ship = this.addShip();
              new_ship.fromSerialized(version, serialized_ship);
            }
          }
      }
    } else {
      _ref3 = serialized.split(';');
      for (_k = 0, _len2 = _ref3.length; _k < _len2; _k++) {
        serialized_ship = _ref3[_k];
        if (serialized !== '') {
          new_ship = this.addShip();
          new_ship.fromSerialized(1, serialized_ship);
        }
      }
    }
    this.suppress_automatic_new_ship = false;
    return this.addShip();
  };

  SquadBuilder.prototype.uniqueIndex = function(unique, type) {
    if (!(type in this.uniques_in_use)) {
      throw new Error("Invalid unique type '" + type + "'");
    }
    return this.uniques_in_use[type].indexOf(unique);
  };

  SquadBuilder.prototype.claimUnique = function(unique, type, cb) {
    var bycanonical, canonical, other, otherslot, _i, _len, _ref, _ref1;
    if (this.uniqueIndex(unique, type) < 0) {
      _ref = exportObj.pilotsByUniqueName[unique.canonical_name.getXWSBaseName()] || [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        other = _ref[_i];
        if (unique !== other) {
          if (this.uniqueIndex(other, 'Pilot') < 0) {
            this.uniques_in_use['Pilot'].push(other);
          } else {
            throw new Error("Unique " + type + " '" + unique.name + "' already claimed as pilot");
          }
        }
      }
      _ref1 = exportObj.upgradesBySlotUniqueName;
      for (otherslot in _ref1) {
        bycanonical = _ref1[otherslot];
        for (canonical in bycanonical) {
          other = bycanonical[canonical];
          if (canonical.getXWSBaseName() === unique.canonical_name.getXWSBaseName() && unique !== other) {
            if (this.uniqueIndex(other, 'Upgrade') < 0) {
              this.uniques_in_use['Upgrade'].push(other);
            }
          }
        }
      }
      this.uniques_in_use[type].push(unique);
    } else {
      throw new Error("Unique " + type + " '" + unique.name + "' already claimed");
    }
    return cb();
  };

  SquadBuilder.prototype.releaseUnique = function(unique, type, cb) {
    var idx, u, uniques, _i, _len, _ref;
    idx = this.uniqueIndex(unique, type);
    if (idx >= 0) {
      _ref = this.uniques_in_use;
      for (type in _ref) {
        uniques = _ref[type];
        this.uniques_in_use[type] = [];
        for (_i = 0, _len = uniques.length; _i < _len; _i++) {
          u = uniques[_i];
          if (u.canonical_name.getXWSBaseName() !== unique.canonical_name.getXWSBaseName()) {
            this.uniques_in_use[type].push(u);
          }
        }
      }
    } else {
      throw new Error("Unique " + type + " '" + unique.name + "' not in use");
    }
    return cb();
  };

  SquadBuilder.prototype.addShip = function() {
    var new_ship;
    new_ship = new Ship({
      builder: this,
      container: this.ship_container
    });
    this.ships.push(new_ship);
    return new_ship;
  };

  SquadBuilder.prototype.removeShip = function(ship) {
    var ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          funcname: "SquadBuilder.removeShip"
        });
        ship.destroy(__iced_deferrals.defer({
          lineno: 19038
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            funcname: "SquadBuilder.removeShip"
          });
          _this.container.trigger('xwing:pointsUpdated', __iced_deferrals.defer({
            lineno: 19039
          }));
          __iced_deferrals._fulfill();
        })(function() {
          _this.current_squad.dirty = true;
          return _this.container.trigger('xwing-backend:squadDirtinessChanged');
        });
      };
    })(this));
  };

  SquadBuilder.prototype.matcher = function(item, term) {
    return item.toUpperCase().indexOf(term.toUpperCase()) >= 0;
  };

  SquadBuilder.prototype.isOurFaction = function(faction) {
    var f, _i, _len;
    if (faction instanceof Array) {
      for (_i = 0, _len = faction.length; _i < _len; _i++) {
        f = faction[_i];
        if (getPrimaryFaction(f) === this.faction) {
          return true;
        }
      }
      return false;
    } else {
      return getPrimaryFaction(faction) === this.faction;
    }
  };

  SquadBuilder.prototype.getAvailableShipsMatching = function(term) {
    var ship_data, ship_name, ships, _ref;
    if (term == null) {
      term = '';
    }
    ships = [];
    _ref = exportObj.ships;
    for (ship_name in _ref) {
      ship_data = _ref[ship_name];
      if (this.isOurFaction(ship_data.factions) && this.matcher(ship_data.name, term)) {
        if (!this.isSecondEdition || exportObj.secondEditionCheck(ship_data, this.faction)) {
          if (!ship_data.huge || this.isCustom) {
            ships.push({
              id: ship_data.name,
              text: ship_data.name,
              english_name: ship_data.english_name,
              canonical_name: ship_data.canonical_name,
              xws: ship_data.xws
            });
          }
        }
      }
    }
    return ships.sort(exportObj.sortHelper);
  };

  SquadBuilder.prototype.getAvailablePilotsForShipIncluding = function(ship, include_pilot, term) {
    var available_faction_pilots, eligible_faction_pilots, pilot, pilot_name;
    if (term == null) {
      term = '';
    }
    available_faction_pilots = (function() {
      var _ref, _results;
      _ref = exportObj.pilotsByLocalizedName;
      _results = [];
      for (pilot_name in _ref) {
        pilot = _ref[pilot_name];
        if (((ship == null) || pilot.ship === ship) && this.isOurFaction(pilot.faction) && this.matcher(pilot_name, term) && (!this.isSecondEdition || exportObj.secondEditionCheck(pilot))) {
          _results.push(pilot);
        }
      }
      return _results;
    }).call(this);
    eligible_faction_pilots = (function() {
      var _results;
      _results = [];
      for (pilot_name in available_faction_pilots) {
        pilot = available_faction_pilots[pilot_name];
        if ((pilot.unique == null) || __indexOf.call(this.uniques_in_use['Pilot'], pilot) < 0 || pilot.canonical_name.getXWSBaseName() === (include_pilot != null ? include_pilot.canonical_name.getXWSBaseName() : void 0)) {
          _results.push(pilot);
        }
      }
      return _results;
    }).call(this);
    if ((include_pilot != null) && (include_pilot.unique != null) && this.matcher(include_pilot.name, term)) {
      eligible_faction_pilots.push(include_pilot);
    }
    return ((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = available_faction_pilots.length; _i < _len; _i++) {
        pilot = available_faction_pilots[_i];
        _results.push({
          id: pilot.id,
          text: "" + pilot.name + " (" + pilot.points + ")",
          points: pilot.points,
          ship: pilot.ship,
          english_name: pilot.english_name,
          disabled: __indexOf.call(eligible_faction_pilots, pilot) < 0
        });
      }
      return _results;
    })()).sort(exportObj.sortHelper);
  };

  dfl_filter_func = function() {
    return true;
  };

  SquadBuilder.prototype.countUpgrades = function(canonical_name) {
    var count, ship, upgrade, _i, _j, _len, _len1, _ref, _ref1, _ref2;
    count = 0;
    _ref = this.ships;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      ship = _ref[_i];
      _ref1 = ship.upgrades;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        upgrade = _ref1[_j];
        if ((upgrade != null ? (_ref2 = upgrade.data) != null ? _ref2.canonical_name : void 0 : void 0) === canonical_name) {
          count++;
        }
      }
    }
    return count;
  };

  SquadBuilder.prototype.isShip = function(ship, name) {
    var f, _i, _len;
    console.log("returning " + f + " " + name);
    if (ship instanceof Array) {
      for (_i = 0, _len = ship.length; _i < _len; _i++) {
        f = ship[_i];
        if (f === name) {
          return true;
        }
      }
      return false;
    } else {
      return ship === name;
    }
  };

  SquadBuilder.prototype.getAvailableUpgradesIncluding = function(slot, include_upgrade, ship, this_upgrade_obj, term, filter_func) {
    var available_upgrades, eligible_upgrades, equipped_upgrade, limited_upgrades_in_use, retval, upgrade, upgrade_name, _i, _j, _len, _len1, _ref, _results;
    if (term == null) {
      term = '';
    }
    if (filter_func == null) {
      filter_func = this.dfl_filter_func;
    }
    limited_upgrades_in_use = (function() {
      var _i, _len, _ref, _ref1, _results;
      _ref = ship.upgrades;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        upgrade = _ref[_i];
        if ((upgrade != null ? (_ref1 = upgrade.data) != null ? _ref1.limited : void 0 : void 0) != null) {
          _results.push(upgrade.data);
        }
      }
      return _results;
    })();
    available_upgrades = (function() {
      var _ref, _results;
      _ref = exportObj.upgradesByLocalizedName;
      _results = [];
      for (upgrade_name in _ref) {
        upgrade = _ref[upgrade_name];
        if (upgrade.slot === slot && this.matcher(upgrade_name, term) && ((upgrade.ship == null) || this.isShip(upgrade.ship, ship.data.name)) && ((upgrade.faction == null) || this.isOurFaction(upgrade.faction)) && (!this.isSecondEdition || exportObj.secondEditionCheck(upgrade))) {
          _results.push(upgrade);
        }
      }
      return _results;
    }).call(this);
    if (filter_func !== this.dfl_filter_func) {
      available_upgrades = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = available_upgrades.length; _i < _len; _i++) {
          upgrade = available_upgrades[_i];
          if (filter_func(upgrade)) {
            _results.push(upgrade);
          }
        }
        return _results;
      })();
    }
    eligible_upgrades = (function() {
      var _results;
      _results = [];
      for (upgrade_name in available_upgrades) {
        upgrade = available_upgrades[upgrade_name];
        if (((upgrade.unique == null) || __indexOf.call(this.uniques_in_use['Upgrade'], upgrade) < 0) && (!((ship != null) && (upgrade.restriction_func != null)) || upgrade.restriction_func(ship, this_upgrade_obj)) && __indexOf.call(limited_upgrades_in_use, upgrade) < 0 && ((upgrade.max_per_squad == null) || ship.builder.countUpgrades(upgrade.canonical_name) < upgrade.max_per_squad)) {
          _results.push(upgrade);
        }
      }
      return _results;
    }).call(this);
    _ref = (function() {
      var _j, _len, _ref, _results;
      _ref = ship.upgrades;
      _results = [];
      for (_j = 0, _len = _ref.length; _j < _len; _j++) {
        upgrade = _ref[_j];
        if ((upgrade != null ? upgrade.data : void 0) != null) {
          _results.push(upgrade.data);
        }
      }
      return _results;
    })();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      equipped_upgrade = _ref[_i];
      eligible_upgrades.removeItem(equipped_upgrade);
    }
    if ((include_upgrade != null) && (((include_upgrade.unique != null) || (include_upgrade.limited != null) || (include_upgrade.max_per_squad != null)) && this.matcher(include_upgrade.name, term))) {
      eligible_upgrades.push(include_upgrade);
    }
    retval = ((function() {
      var _j, _len1, _results;
      _results = [];
      for (_j = 0, _len1 = available_upgrades.length; _j < _len1; _j++) {
        upgrade = available_upgrades[_j];
        _results.push({
          id: upgrade.id,
          text: "" + upgrade.name + " (" + upgrade.points + ")",
          points: upgrade.points,
          english_name: upgrade.english_name,
          disabled: __indexOf.call(eligible_upgrades, upgrade) < 0
        });
      }
      return _results;
    })()).sort(exportObj.sortHelper);
    if (this_upgrade_obj.adjustment_func != null) {
      _results = [];
      for (_j = 0, _len1 = retval.length; _j < _len1; _j++) {
        upgrade = retval[_j];
        _results.push(this_upgrade_obj.adjustment_func(upgrade));
      }
      return _results;
    } else {
      return retval;
    }
  };

  SquadBuilder.prototype.getAvailableModificationsIncluding = function(include_modification, ship, term, filter_func) {
    var available_modifications, eligible_modifications, equipped_modification, limited_modifications_in_use, modification, modification_name, thing, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3, _ref4;
    if (term == null) {
      term = '';
    }
    if (filter_func == null) {
      filter_func = this.dfl_filter_func;
    }
    limited_modifications_in_use = (function() {
      var _i, _len, _ref, _ref1, _results;
      _ref = ship.modifications;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        modification = _ref[_i];
        if ((modification != null ? (_ref1 = modification.data) != null ? _ref1.limited : void 0 : void 0) != null) {
          _results.push(modification.data);
        }
      }
      return _results;
    })();
    available_modifications = (function() {
      var _ref, _results;
      _ref = exportObj.modificationsByLocalizedName;
      _results = [];
      for (modification_name in _ref) {
        modification = _ref[modification_name];
        if (this.matcher(modification_name, term) && ((modification.ship == null) || modification.ship === ship.data.name) && (!this.isSecondEdition || exportObj.secondEditionCheck(modification))) {
          _results.push(modification);
        }
      }
      return _results;
    }).call(this);
    if (filter_func !== this.dfl_filter_func) {
      available_modifications = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = available_modifications.length; _i < _len; _i++) {
          modification = available_modifications[_i];
          if (filter_func(modification)) {
            _results.push(modification);
          }
        }
        return _results;
      })();
    }
    eligible_modifications = (function() {
      var _results;
      _results = [];
      for (modification_name in available_modifications) {
        modification = available_modifications[modification_name];
        if (((modification.unique == null) || __indexOf.call(this.uniques_in_use['Modification'], modification) < 0) && ((modification.faction == null) || this.isOurFaction(modification.faction)) && (!((ship != null) && (modification.restriction_func != null)) || modification.restriction_func(ship)) && __indexOf.call(limited_modifications_in_use, modification) < 0) {
          _results.push(modification);
        }
      }
      return _results;
    }).call(this);
    _ref2 = ((_ref1 = ship != null ? ship.titles : void 0) != null ? _ref1 : []).concat((_ref = ship != null ? ship.upgrades : void 0) != null ? _ref : []);
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      thing = _ref2[_i];
      if ((thing != null ? (_ref3 = thing.data) != null ? _ref3.special_case : void 0 : void 0) === 'Royal Guard TIE') {
        _ref4 = (function() {
          var _k, _len1, _ref4, _results;
          _ref4 = ship.modifications;
          _results = [];
          for (_k = 0, _len1 = _ref4.length; _k < _len1; _k++) {
            modification = _ref4[_k];
            if ((modification != null ? modification.data : void 0) != null) {
              _results.push(modificationsById[modification.data.id]);
            }
          }
          return _results;
        })();
        for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
          equipped_modification = _ref4[_j];
          eligible_modifications.removeItem(equipped_modification);
        }
      }
    }
    if ((include_modification != null) && (((include_modification.unique != null) || (include_modification.limited != null)) && this.matcher(include_modification.name, term))) {
      eligible_modifications.push(include_modification);
    }
    return ((function() {
      var _k, _len2, _results;
      _results = [];
      for (_k = 0, _len2 = available_modifications.length; _k < _len2; _k++) {
        modification = available_modifications[_k];
        _results.push({
          id: modification.id,
          text: "" + modification.name + " (" + modification.points + ")",
          points: modification.points,
          english_name: modification.english_name,
          disabled: __indexOf.call(eligible_modifications, modification) < 0
        });
      }
      return _results;
    })()).sort(exportObj.sortHelper);
  };

  SquadBuilder.prototype.getAvailableTitlesIncluding = function(ship, include_title, term) {
    var available_titles, eligible_titles, limited_titles_in_use, t, title, title_name;
    if (term == null) {
      term = '';
    }
    limited_titles_in_use = (function() {
      var _i, _len, _ref, _ref1, _results;
      _ref = ship.titles;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        title = _ref[_i];
        if ((title != null ? (_ref1 = title.data) != null ? _ref1.limited : void 0 : void 0) != null) {
          _results.push(title.data);
        }
      }
      return _results;
    })();
    available_titles = (function() {
      var _ref, _results;
      _ref = exportObj.titlesByLocalizedName;
      _results = [];
      for (title_name in _ref) {
        title = _ref[title_name];
        if (((title.ship == null) || title.ship === ship.data.name) && this.matcher(title_name, term)) {
          _results.push(title);
        }
      }
      return _results;
    }).call(this);
    eligible_titles = (function() {
      var _ref, _results;
      _results = [];
      for (title_name in available_titles) {
        title = available_titles[title_name];
        if (((title.unique == null) || (__indexOf.call(this.uniques_in_use['Title'], title) < 0 && (_ref = title.canonical_name.getXWSBaseName(), __indexOf.call((function() {
          var _i, _len, _ref1, _results1;
          _ref1 = this.uniques_in_use['Title'];
          _results1 = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            t = _ref1[_i];
            _results1.push(t.canonical_name.getXWSBaseName());
          }
          return _results1;
        }).call(this), _ref) < 0)) || title.canonical_name.getXWSBaseName() === (include_title != null ? include_title.canonical_name.getXWSBaseName() : void 0)) && ((title.faction == null) || this.isOurFaction(title.faction)) && (!((ship != null) && (title.restriction_func != null)) || title.restriction_func(ship)) && __indexOf.call(limited_titles_in_use, title) < 0) {
          _results.push(title);
        }
      }
      return _results;
    }).call(this);
    if ((include_title != null) && (((include_title.unique != null) || (include_title.limited != null)) && this.matcher(include_title.name, term))) {
      eligible_titles.push(include_title);
    }
    return ((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = available_titles.length; _i < _len; _i++) {
        title = available_titles[_i];
        _results.push({
          id: title.id,
          text: "" + title.name + " (" + title.points + ")",
          points: title.points,
          english_name: title.english_name,
          disabled: __indexOf.call(eligible_titles, title) < 0
        });
      }
      return _results;
    })()).sort(exportObj.sortHelper);
  };

  SquadBuilder.prototype.getManeuverTableHTML = function(maneuvers, baseManeuvers) {
    var bearing, bearings, bearings_without_maneuvers, className, color, difficulty, haveManeuver, linePath, maneuverClass, maneuverClass2, outTable, outlineColor, speed, transform, trianglePath, turn, v, _i, _j, _k, _l, _len, _len1, _len2, _m, _n, _ref, _ref1, _ref2, _ref3, _results;
    if ((maneuvers == null) || maneuvers.length === 0) {
      return "Missing maneuver info.";
    }
    bearings_without_maneuvers = (function() {
      _results = [];
      for (var _i = 0, _ref = maneuvers[0].length; 0 <= _ref ? _i < _ref : _i > _ref; 0 <= _ref ? _i++ : _i--){ _results.push(_i); }
      return _results;
    }).apply(this);
    for (_j = 0, _len = maneuvers.length; _j < _len; _j++) {
      bearings = maneuvers[_j];
      for (bearing = _k = 0, _len1 = bearings.length; _k < _len1; bearing = ++_k) {
        difficulty = bearings[bearing];
        if (difficulty > 0) {
          bearings_without_maneuvers.removeItem(bearing);
        }
      }
    }
    outTable = "<table><tbody>";
    for (speed = _l = _ref1 = maneuvers.length - 1; _ref1 <= 0 ? _l <= 0 : _l >= 0; speed = _ref1 <= 0 ? ++_l : --_l) {
      haveManeuver = false;
      _ref2 = maneuvers[speed];
      for (_m = 0, _len2 = _ref2.length; _m < _len2; _m++) {
        v = _ref2[_m];
        if (v > 0) {
          haveManeuver = true;
          break;
        }
      }
      if (!haveManeuver) {
        continue;
      }
      outTable += "<tr><td>" + speed + "</td>";
      for (turn = _n = 0, _ref3 = maneuvers[speed].length; 0 <= _ref3 ? _n < _ref3 : _n > _ref3; turn = 0 <= _ref3 ? ++_n : --_n) {
        if (__indexOf.call(bearings_without_maneuvers, turn) >= 0) {
          continue;
        }
        outTable += "<td>";
        if (maneuvers[speed][turn] > 0) {
          color = (function() {
            switch (maneuvers[speed][turn]) {
              case 1:
                return "white";
              case 2:
                return "dodgerblue";
              case 3:
                return "red";
            }
          })();
          maneuverClass = (function() {
            switch (maneuvers[speed][turn]) {
              case 1:
                return "svg-white-maneuver";
              case 2:
                return "svg-blue-maneuver";
              case 3:
                return "svg-red-maneuver";
            }
          })();
          outTable += "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"30px\" height=\"30px\" viewBox=\"0 0 200 200\">";
          if (speed === 0) {
            outTable += "<rect x=\"50\" y=\"50\" width=\"100\" height=\"100\" style=\"fill:" + color + "\" />";
          } else {
            outlineColor = "black";
            maneuverClass2 = "svg-base-maneuver";
            if (maneuvers[speed][turn] !== baseManeuvers[speed][turn]) {
              outlineColor = "mediumblue";
              maneuverClass2 = "svg-modified-maneuver";
            }
            transform = "";
            className = "";
            switch (turn) {
              case 0:
                linePath = "M160,180 L160,70 80,70";
                trianglePath = "M80,100 V40 L30,70 Z";
                break;
              case 1:
                linePath = "M150,180 S150,120 80,60";
                trianglePath = "M80,100 V40 L30,70 Z";
                transform = "transform='translate(-5 -15) rotate(45 70 90)' ";
                break;
              case 2:
                linePath = "M100,180 L100,100 100,80";
                trianglePath = "M70,80 H130 L100,30 Z";
                break;
              case 3:
                linePath = "M50,180 S50,120 120,60";
                trianglePath = "M120,100 V40 L170,70 Z";
                transform = "transform='translate(5 -15) rotate(-45 130 90)' ";
                break;
              case 4:
                linePath = "M40,180 L40,70 120,70";
                trianglePath = "M120,100 V40 L170,70 Z";
                break;
              case 5:
                linePath = "M50,180 L50,100 C50,10 140,10 140,100 L140,120";
                trianglePath = "M170,120 H110 L140,180 Z";
                break;
              case 6:
                linePath = "M150,180 S150,120 80,60";
                trianglePath = "M80,100 V40 L30,70 Z";
                transform = "transform='translate(0 50)'";
                break;
              case 7:
                linePath = "M50,180 S50,120 120,60";
                trianglePath = "M120,100 V40 L170,70 Z";
                transform = "transform='translate(0 50)'";
                break;
              case 8:
                linePath = "M160,180 L160,70 80,70";
                trianglePath = "M60,100 H100 L80,140 Z";
                break;
              case 9:
                linePath = "M40,180 L40,70 120,70";
                trianglePath = "M100,100 H140 L120,140 Z";
                break;
              case 10:
                linePath = "M50,180 S50,120 120,60";
                trianglePath = "M120,100 V40 L170,70 Z";
                transform = "transform='translate(5 -15) rotate(-45 130 90)' ";
                className = 'backwards';
                break;
              case 11:
                linePath = "M100,180 L100,100 100,80";
                trianglePath = "M70,80 H130 L100,30 Z";
                className = 'backwards';
                break;
              case 12:
                linePath = "M150,180 S150,120 80,60";
                trianglePath = "M80,100 V40 L30,70 Z";
                transform = "transform='translate(-5 -15) rotate(45 70 90)' ";
                className = 'backwards';
            }
            outTable += $.trim("<g class=\"maneuver " + className + "\">\n  <path class = 'svg-maneuver-outer " + maneuverClass + " " + maneuverClass2 + "' stroke-width='25' fill='none' stroke='" + outlineColor + "' d='" + linePath + "' />\n  <path class='svg-maneuver-triangle " + maneuverClass + " " + maneuverClass2 + "' d='" + trianglePath + "' fill='" + color + "' stroke-width='5' stroke='" + outlineColor + "' " + transform + "/>\n  <path class='svg-maneuver-inner " + maneuverClass + "' stroke-width='15' fill='none' stroke='" + color + "' d='" + linePath + "' />\n</g>");
          }
          outTable += "</svg>";
        }
        outTable += "</td>";
      }
      outTable += "</tr>";
    }
    outTable += "</tbody></table>";
    return outTable;
  };

  SquadBuilder.prototype.showTooltip = function(type, data, additional_opts) {
    var a, action, addon_count, effective_stats, extra_actions, extra_actions_red, pilot_count, ship, ship_count, slot, source, _ref, _ref1, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref16, _ref17, _ref18, _ref19, _ref2, _ref20, _ref21, _ref22, _ref23, _ref24, _ref25, _ref26, _ref27, _ref28, _ref29, _ref3, _ref30, _ref31, _ref32, _ref33, _ref34, _ref35, _ref36, _ref37, _ref38, _ref39, _ref4, _ref40, _ref41, _ref42, _ref43, _ref44, _ref45, _ref46, _ref47, _ref48, _ref49, _ref5, _ref50, _ref51, _ref52, _ref53, _ref54, _ref55, _ref56, _ref57, _ref58, _ref59, _ref6, _ref60, _ref61, _ref7, _ref8, _ref9;
    if (data !== this.tooltip_currently_displaying) {
      switch (type) {
        case 'Ship':
          this.info_container.find('.info-sources').text(((function() {
            var _i, _len, _ref, _results;
            _ref = data.pilot.sources;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              source = _ref[_i];
              _results.push(exportObj.translate(this.language, 'sources', source));
            }
            return _results;
          }).call(this)).sort().join(', '));
          if (((_ref = this.collection) != null ? _ref.counts : void 0) != null) {
            ship_count = (_ref1 = (_ref2 = this.collection.counts) != null ? (_ref3 = _ref2.ship) != null ? _ref3[data.data.english_name] : void 0 : void 0) != null ? _ref1 : 0;
            pilot_count = (_ref4 = (_ref5 = this.collection.counts) != null ? (_ref6 = _ref5.pilot) != null ? _ref6[data.pilot.english_name] : void 0 : void 0) != null ? _ref4 : 0;
            this.info_container.find('.info-collection').text("You have " + ship_count + " ship model" + (ship_count > 1 ? 's' : '') + " and " + pilot_count + " pilot card" + (pilot_count > 1 ? 's' : '') + " in your collection.");
          } else {
            this.info_container.find('.info-collection').text('');
          }
          effective_stats = data.effectiveStats();
          extra_actions = $.grep(effective_stats.actions, function(el, i) {
            var _ref7, _ref8;
            return __indexOf.call((_ref7 = (_ref8 = data.pilot.ship_override) != null ? _ref8.actions : void 0) != null ? _ref7 : data.data.actions, el) < 0;
          });
          extra_actions_red = $.grep(effective_stats.actionsred, function(el, i) {
            var _ref7, _ref8;
            return __indexOf.call((_ref7 = (_ref8 = data.pilot.ship_override) != null ? _ref8.actionsred : void 0) != null ? _ref7 : data.data.actionsred, el) < 0;
          });
          this.info_container.find('.info-name').html("" + (data.pilot.unique ? "&middot;&nbsp;" : "") + data.pilot.name + " " + (exportObj.isReleased(data.pilot) ? "" : " (" + (exportObj.translate(this.language, 'ui', 'unreleased')) + ")"));
          this.info_container.find('p.info-text').html((_ref7 = data.pilot.text) != null ? _ref7 : '');
          this.info_container.find('tr.info-ship td.info-data').text(data.pilot.ship);
          this.info_container.find('tr.info-ship').show();
          if (data.data.large != null) {
            this.info_container.find('tr.info-base td.info-data').text("Large");
          } else if (data.data.medium != null) {
            this.info_container.find('tr.info-base td.info-data').text("Medium");
          } else {
            this.info_container.find('tr.info-base td.info-data').text("Small");
          }
          this.info_container.find('tr.info-base').show();
          this.info_container.find('tr.info-skill td.info-data').text(statAndEffectiveStat(data.pilot.skill, effective_stats, 'skill'));
          this.info_container.find('tr.info-skill').show();
          this.info_container.find('tr.info-attack td.info-header i.xwing-miniatures-font').addClass((_ref8 = data.data.attack_icon) != null ? _ref8 : 'xwing-miniatures-font-attack');
          this.info_container.find('tr.info-attack td.info-data').text(statAndEffectiveStat((_ref9 = (_ref10 = data.pilot.ship_override) != null ? _ref10.attack : void 0) != null ? _ref9 : data.data.attack, effective_stats, 'attack'));
          this.info_container.find('tr.info-attack').toggle((((_ref11 = data.pilot.ship_override) != null ? _ref11.attack : void 0) != null) || (data.data.attack != null));
          this.info_container.find('tr.info-attack-fullfront td.info-data').text(statAndEffectiveStat((_ref12 = (_ref13 = data.pilot.ship_override) != null ? _ref13.attackf : void 0) != null ? _ref12 : data.data.attackf, effective_stats, 'attackf'));
          this.info_container.find('tr.info-attack-fullfront').toggle((((_ref14 = data.pilot.ship_override) != null ? _ref14.attackf : void 0) != null) || (data.data.attackf != null));
          this.info_container.find('tr.info-attack-bullseye').hide();
          this.info_container.find('tr.info-attack-back td.info-data').text(statAndEffectiveStat((_ref15 = (_ref16 = data.pilot.ship_override) != null ? _ref16.attackb : void 0) != null ? _ref15 : data.data.attackb, effective_stats, 'attackb'));
          this.info_container.find('tr.info-attack-back').toggle((((_ref17 = data.pilot.ship_override) != null ? _ref17.attackb : void 0) != null) || (data.data.attackb != null));
          this.info_container.find('tr.info-attack-turret td.info-data').text(statAndEffectiveStat((_ref18 = (_ref19 = data.pilot.ship_override) != null ? _ref19.attackt : void 0) != null ? _ref18 : data.data.attackt, effective_stats, 'attackt'));
          this.info_container.find('tr.info-attack-turret').toggle((((_ref20 = data.pilot.ship_override) != null ? _ref20.attackt : void 0) != null) || (data.data.attackt != null));
          this.info_container.find('tr.info-attack-doubleturret td.info-data').text(statAndEffectiveStat((_ref21 = (_ref22 = data.pilot.ship_override) != null ? _ref22.attackdt : void 0) != null ? _ref21 : data.data.attackdt, effective_stats, 'attackdt'));
          this.info_container.find('tr.info-attack-doubleturret').toggle((((_ref23 = data.pilot.ship_override) != null ? _ref23.attackdt : void 0) != null) || (data.data.attackdt != null));
          this.info_container.find('tr.info-energy td.info-data').text(statAndEffectiveStat((_ref24 = (_ref25 = data.pilot.ship_override) != null ? _ref25.energy : void 0) != null ? _ref24 : data.data.energy, effective_stats, 'energy'));
          this.info_container.find('tr.info-energy').toggle((((_ref26 = data.pilot.ship_override) != null ? _ref26.energy : void 0) != null) || (data.data.energy != null));
          this.info_container.find('tr.info-range').hide();
          this.info_container.find('td.info-rangebonus').hide();
          this.info_container.find('tr.info-agility td.info-data').text(statAndEffectiveStat((_ref27 = (_ref28 = data.pilot.ship_override) != null ? _ref28.agility : void 0) != null ? _ref27 : data.data.agility, effective_stats, 'agility'));
          this.info_container.find('tr.info-agility').show();
          this.info_container.find('tr.info-hull td.info-data').text(statAndEffectiveStat((_ref29 = (_ref30 = data.pilot.ship_override) != null ? _ref30.hull : void 0) != null ? _ref29 : data.data.hull, effective_stats, 'hull'));
          this.info_container.find('tr.info-hull').show();
          this.info_container.find('tr.info-shields td.info-data').text(statAndEffectiveStat((_ref31 = (_ref32 = data.pilot.ship_override) != null ? _ref32.shields : void 0) != null ? _ref31 : data.data.shields, effective_stats, 'shields'));
          this.info_container.find('tr.info-shields').show();
          if ((effective_stats.force > 0) || (data.pilot.force != null)) {
            this.info_container.find('tr.info-force td.info-data').html(statAndEffectiveStat((_ref33 = (_ref34 = data.pilot.ship_override) != null ? _ref34.force : void 0) != null ? _ref33 : data.pilot.force, effective_stats, 'force') + '<i class="xwing-miniatures-font xwing-miniatures-font-recurring"></i>');
            this.info_container.find('tr.info-force').show();
          } else {
            this.info_container.find('tr.info-force').hide();
          }
          if (data.pilot.charge != null) {
            if (data.pilot.recurring != null) {
              this.info_container.find('tr.info-charge td.info-data').html(data.pilot.charge + '<i class="xwing-miniatures-font xwing-miniatures-font-recurring"></i>');
            } else {
              this.info_container.find('tr.info-charge td.info-data').text(data.pilot.charge);
            }
            this.info_container.find('tr.info-charge').show();
          } else {
            this.info_container.find('tr.info-charge').hide();
          }
          this.info_container.find('tr.info-actions td.info-data').html((((function() {
            var _i, _len, _ref35, _ref36, _ref37, _results;
            _ref37 = ((_ref35 = (_ref36 = data.pilot.ship_override) != null ? _ref36.actions : void 0) != null ? _ref35 : data.data.actions).concat((function() {
              var _j, _len, _results1;
              _results1 = [];
              for (_j = 0, _len = extra_actions.length; _j < _len; _j++) {
                action = extra_actions[_j];
                _results1.push("<strong>" + (exportObj.translate(this.language, 'action', action)) + "</strong>");
              }
              return _results1;
            }).call(this));
            _results = [];
            for (_i = 0, _len = _ref37.length; _i < _len; _i++) {
              a = _ref37[_i];
              _results.push(exportObj.translate(this.language, 'action', a));
            }
            return _results;
          }).call(this)).join(', ')).replace(/, <i class="xwing-miniatures-font xwing-miniatures-font-linked/g, ' <i class="xwing-miniatures-font xwing-miniatures-font-linked'));
          if (data.data.actionsred != null) {
            this.info_container.find('tr.info-actions-red td.info-data-red').html(((function() {
              var _i, _len, _ref35, _ref36, _ref37, _results;
              _ref37 = ((_ref35 = (_ref36 = data.pilot.ship_override) != null ? _ref36.actionsred : void 0) != null ? _ref35 : data.data.actionsred).concat((function() {
                var _j, _len, _results1;
                _results1 = [];
                for (_j = 0, _len = extra_actions_red.length; _j < _len; _j++) {
                  action = extra_actions_red[_j];
                  _results1.push("<strong>" + (exportObj.translate(this.language, 'action', action)) + "</strong>");
                }
                return _results1;
              }).call(this));
              _results = [];
              for (_i = 0, _len = _ref37.length; _i < _len; _i++) {
                a = _ref37[_i];
                _results.push(exportObj.translate(this.language, 'action', a));
              }
              return _results;
            }).call(this)).join(', '));
          }
          this.info_container.find('tr.info-actions-red').toggle(data.data.actionsred != null);
          this.info_container.find('tr.info-actions').show();
          this.info_container.find('tr.info-upgrades').show();
          this.info_container.find('tr.info-upgrades td.info-data').html(((function() {
            var _i, _len, _ref35, _results;
            _ref35 = data.pilot.slots;
            _results = [];
            for (_i = 0, _len = _ref35.length; _i < _len; _i++) {
              slot = _ref35[_i];
              _results.push(exportObj.translate(this.language, 'sloticon', slot));
            }
            return _results;
          }).call(this)).join(' ') || 'None');
          this.info_container.find('p.info-maneuvers').show();
          this.info_container.find('p.info-maneuvers').html(this.getManeuverTableHTML(effective_stats.maneuvers, data.data.maneuvers));
          break;
        case 'Pilot':
          this.info_container.find('.info-sources').text(((function() {
            var _i, _len, _ref35, _results;
            _ref35 = data.sources;
            _results = [];
            for (_i = 0, _len = _ref35.length; _i < _len; _i++) {
              source = _ref35[_i];
              _results.push(exportObj.translate(this.language, 'sources', source));
            }
            return _results;
          }).call(this)).sort().join(', '));
          if (((_ref35 = this.collection) != null ? _ref35.counts : void 0) != null) {
            pilot_count = (_ref36 = (_ref37 = this.collection.counts) != null ? (_ref38 = _ref37.pilot) != null ? _ref38[data.english_name] : void 0 : void 0) != null ? _ref36 : 0;
            ship_count = (_ref39 = (_ref40 = this.collection.counts.ship) != null ? _ref40[additional_opts.ship] : void 0) != null ? _ref39 : 0;
            this.info_container.find('.info-collection').text("You have " + ship_count + " ship model" + (ship_count > 1 ? 's' : '') + " and " + pilot_count + " pilot card" + (pilot_count > 1 ? 's' : '') + " in your collection.");
          } else {
            this.info_container.find('.info-collection').text('');
          }
          this.info_container.find('.info-name').html("" + (data.unique ? "&middot;&nbsp;" : "") + data.name + (exportObj.isReleased(data) ? "" : " (" + (exportObj.translate(this.language, 'ui', 'unreleased')) + ")"));
          this.info_container.find('p.info-text').html((_ref41 = data.text) != null ? _ref41 : '');
          ship = exportObj.ships[data.ship];
          this.info_container.find('tr.info-ship td.info-data').text(data.ship);
          this.info_container.find('tr.info-ship').show();
          if (ship.large != null) {
            this.info_container.find('tr.info-base td.info-data').text("Large");
          } else if (ship.medium != null) {
            this.info_container.find('tr.info-base td.info-data').text("Medium");
          } else {
            this.info_container.find('tr.info-base td.info-data').text("Small");
          }
          this.info_container.find('tr.info-base').show();
          this.info_container.find('tr.info-skill td.info-data').text(data.skill);
          this.info_container.find('tr.info-skill').show();
          this.info_container.find('tr.info-attack td.info-data').text((_ref42 = (_ref43 = data.ship_override) != null ? _ref43.attack : void 0) != null ? _ref42 : ship.attack);
          this.info_container.find('tr.info-attack').toggle((((_ref44 = data.ship_override) != null ? _ref44.attack : void 0) != null) || (ship.attack != null));
          this.info_container.find('tr.info-attack-fullfront td.info-data').text(ship.attackf);
          this.info_container.find('tr.info-attack-fullfront').toggle(ship.attackf != null);
          this.info_container.find('tr.info-attack-bullseye').hide();
          this.info_container.find('tr.info-attack-back td.info-data').text(ship.attackb);
          this.info_container.find('tr.info-attack-back').toggle(ship.attackb != null);
          this.info_container.find('tr.info-attack-turret td.info-data').text(ship.attackt);
          this.info_container.find('tr.info-attack-turret').toggle(ship.attackt != null);
          this.info_container.find('tr.info-attack-doubleturret td.info-data').text(ship.attackdt);
          this.info_container.find('tr.info-attack-doubleturret').toggle(ship.attackdt != null);
          this.info_container.find('tr.info-attack td.info-header i.xwing-miniatures-font').addClass((_ref45 = ship.attack_icon) != null ? _ref45 : 'xwing-miniatures-font-frontarc');
          this.info_container.find('tr.info-energy td.info-data').text((_ref46 = (_ref47 = data.ship_override) != null ? _ref47.energy : void 0) != null ? _ref46 : ship.energy);
          this.info_container.find('tr.info-energy').toggle((((_ref48 = data.ship_override) != null ? _ref48.energy : void 0) != null) || (ship.energy != null));
          this.info_container.find('tr.info-range').hide();
          this.info_container.find('td.info-rangebonus').hide();
          this.info_container.find('tr.info-agility td.info-data').text((_ref49 = (_ref50 = data.ship_override) != null ? _ref50.agility : void 0) != null ? _ref49 : ship.agility);
          this.info_container.find('tr.info-agility').show();
          this.info_container.find('tr.info-hull td.info-data').text((_ref51 = (_ref52 = data.ship_override) != null ? _ref52.hull : void 0) != null ? _ref51 : ship.hull);
          this.info_container.find('tr.info-hull').show();
          this.info_container.find('tr.info-shields td.info-data').text((_ref53 = (_ref54 = data.ship_override) != null ? _ref54.shields : void 0) != null ? _ref53 : ship.shields);
          this.info_container.find('tr.info-shields').show();
          if (((effective_stats != null ? effective_stats.force : void 0) != null) || (data.force != null)) {
            this.info_container.find('tr.info-force td.info-data').html(((_ref55 = (_ref56 = data.ship_override) != null ? _ref56.force : void 0) != null ? _ref55 : data.force) + '<i class="xwing-miniatures-font xwing-miniatures-font-recurring"></i>');
            this.info_container.find('tr.info-force').show();
          } else {
            this.info_container.find('tr.info-force').hide();
          }
          if (data.charge != null) {
            if (data.recurring != null) {
              this.info_container.find('tr.info-charge td.info-data').html(data.charge + '<i class="xwing-miniatures-font xwing-miniatures-font-recurring"></i>');
            } else {
              this.info_container.find('tr.info-charge td.info-data').text(data.charge);
            }
            this.info_container.find('tr.info-charge').show();
          } else {
            this.info_container.find('tr.info-charge').hide();
          }
          this.info_container.find('tr.info-actions td.info-data').html((((function() {
            var _i, _len, _ref57, _ref58, _ref59, _results;
            _ref59 = (_ref57 = (_ref58 = data.ship_override) != null ? _ref58.actions : void 0) != null ? _ref57 : exportObj.ships[data.ship].actions;
            _results = [];
            for (_i = 0, _len = _ref59.length; _i < _len; _i++) {
              action = _ref59[_i];
              _results.push(exportObj.translate(this.language, 'action', action));
            }
            return _results;
          }).call(this)).join(', ')).replace(/, <i class="xwing-miniatures-font xwing-miniatures-font-linked/g, ' <i class="xwing-miniatures-font xwing-miniatures-font-linked'));
          if (ships[data.ship].actionsred != null) {
            this.info_container.find('tr.info-actions-red td.info-data-red').html(((function() {
              var _i, _len, _ref57, _ref58, _ref59, _results;
              _ref59 = (_ref57 = (_ref58 = data.ship_override) != null ? _ref58.actionsred : void 0) != null ? _ref57 : exportObj.ships[data.ship].actionsred;
              _results = [];
              for (_i = 0, _len = _ref59.length; _i < _len; _i++) {
                action = _ref59[_i];
                _results.push(exportObj.translate(this.language, 'action', action));
              }
              return _results;
            }).call(this)).join(', '));
            this.info_container.find('tr.info-actions-red').show();
          } else {
            this.info_container.find('tr.info-actions-red').hide();
          }
          this.info_container.find('tr.info-actions').show();
          this.info_container.find('tr.info-upgrades').show();
          this.info_container.find('tr.info-upgrades td.info-data').html(((function() {
            var _i, _len, _ref57, _results;
            _ref57 = data.slots;
            _results = [];
            for (_i = 0, _len = _ref57.length; _i < _len; _i++) {
              slot = _ref57[_i];
              _results.push(exportObj.translate(this.language, 'sloticon', slot));
            }
            return _results;
          }).call(this)).join(' ') || 'None');
          this.info_container.find('p.info-maneuvers').show();
          this.info_container.find('p.info-maneuvers').html(this.getManeuverTableHTML(ship.maneuvers, ship.maneuvers));
          break;
        case 'Addon':
          this.info_container.find('.info-sources').text(((function() {
            var _i, _len, _ref57, _results;
            _ref57 = data.sources;
            _results = [];
            for (_i = 0, _len = _ref57.length; _i < _len; _i++) {
              source = _ref57[_i];
              _results.push(exportObj.translate(this.language, 'sources', source));
            }
            return _results;
          }).call(this)).sort().join(', '));
          if (((_ref57 = this.collection) != null ? _ref57.counts : void 0) != null) {
            addon_count = (_ref58 = (_ref59 = this.collection.counts) != null ? (_ref60 = _ref59[additional_opts.addon_type.toLowerCase()]) != null ? _ref60[data.english_name] : void 0 : void 0) != null ? _ref58 : 0;
            this.info_container.find('.info-collection').text("You have " + addon_count + " in your collection.");
          } else {
            this.info_container.find('.info-collection').text('');
          }
          this.info_container.find('.info-name').html("" + (data.unique ? "&middot;&nbsp;" : "") + data.name + (data.limited != null ? " (" + (exportObj.translate(this.language, 'ui', 'limited')) + ")" : "") + (exportObj.isReleased(data) ? "" : " (" + (exportObj.translate(this.language, 'ui', 'unreleased')) + ")"));
          this.info_container.find('p.info-text').html((_ref61 = data.text) != null ? _ref61 : '');
          this.info_container.find('tr.info-ship').hide();
          this.info_container.find('tr.info-base').hide();
          this.info_container.find('tr.info-skill').hide();
          if (data.energy != null) {
            this.info_container.find('tr.info-energy td.info-data').text(data.energy);
            this.info_container.find('tr.info-energy').show();
          } else {
            this.info_container.find('tr.info-energy').hide();
          }
          if (data.attack != null) {
            this.info_container.find('tr.info-attack td.info-data').text(data.attack);
            this.info_container.find('tr.info-attack').show();
          } else {
            this.info_container.find('tr.info-attack').hide();
          }
          if (data.attackt != null) {
            this.info_container.find('tr.info-attack-turret td.info-data').text(data.attackt);
            this.info_container.find('tr.info-attack-turret').show();
          } else {
            this.info_container.find('tr.info-attack-turret').hide();
          }
          if (data.attackbull != null) {
            this.info_container.find('tr.info-attack-bullseye td.info-data').text(data.attackbull);
            this.info_container.find('tr.info-attack-bullseye').show();
          } else {
            this.info_container.find('tr.info-attack-bullseye').hide();
          }
          this.info_container.find('tr.info-attack-fullfront').hide();
          this.info_container.find('tr.info-attack-back').hide();
          this.info_container.find('tr.info-attack-doubleturret').hide();
          if (data.recurring != null) {
            this.info_container.find('tr.info-charge td.info-data').html(data.charge + "<i class=\"xwing-miniatures-font xwing-miniatures-font-recurring\"></i>");
          } else {
            this.info_container.find('tr.info-charge td.info-data').text(data.charge);
          }
          this.info_container.find('tr.info-charge').toggle(data.charge != null);
          if (data.range != null) {
            this.info_container.find('tr.info-range td.info-data').text(data.range);
            this.info_container.find('tr.info-range').show();
          } else {
            this.info_container.find('tr.info-range').hide();
          }
          if (data.rangebonus != null) {
            this.info_container.find('td.info-rangebonus').show();
          } else {
            this.info_container.find('td.info-rangebonus').hide();
          }
          this.info_container.find('tr.info-force td.info-data').html(data.force + '<i class="xwing-miniatures-font xwing-miniatures-font-recurring"></i>');
          this.info_container.find('tr.info-force').toggle(data.force != null);
          this.info_container.find('tr.info-agility').hide();
          this.info_container.find('tr.info-hull').hide();
          this.info_container.find('tr.info-shields').hide();
          this.info_container.find('tr.info-actions').hide();
          this.info_container.find('tr.info-actions-red').hide();
          this.info_container.find('tr.info-upgrades').hide();
          this.info_container.find('p.info-maneuvers').hide();
      }
      this.info_container.show();
      return this.tooltip_currently_displaying = data;
    }
  };

  SquadBuilder.prototype._randomizerLoopBody = function(data) {
    var addon, available_modifications, available_pilots, available_ships, available_titles, available_upgrades, idx, modification, new_ship, pilot, removable_things, ship, ship_type, thing_to_remove, title, unused_addons, upgrade, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _m, _n, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
    if (data.keep_running && data.iterations < data.max_iterations) {
      data.iterations++;
      if (this.total_points === data.max_points) {
        data.keep_running = false;
      } else if (this.total_points < data.max_points) {
        unused_addons = [];
        _ref = this.ships;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          ship = _ref[_i];
          _ref1 = ship.upgrades;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            upgrade = _ref1[_j];
            if (upgrade.data == null) {
              unused_addons.push(upgrade);
            }
          }
          if ((ship.title != null) && (ship.title.data == null)) {
            unused_addons.push(ship.title);
          }
          _ref2 = ship.modifications;
          for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
            modification = _ref2[_k];
            if (modification.data == null) {
              unused_addons.push(modification);
            }
          }
        }
        idx = $.randomInt(1 + unused_addons.length);
        if (idx === 0) {
          available_ships = this.getAvailableShipsMatching();
          ship_type = available_ships[$.randomInt(available_ships.length)].text;
          available_pilots = this.getAvailablePilotsForShipIncluding(ship_type);
          pilot = available_pilots[$.randomInt(available_pilots.length)];
          if (exportObj.pilotsById[pilot.id].sources.intersects(data.allowed_sources)) {
            new_ship = this.addShip();
            new_ship.setPilotById(pilot.id);
          }
        } else {
          addon = unused_addons[idx - 1];
          switch (addon.type) {
            case 'Upgrade':
              available_upgrades = (function() {
                var _l, _len3, _ref3, _results;
                _ref3 = this.getAvailableUpgradesIncluding(addon.slot, null, addon.ship);
                _results = [];
                for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
                  upgrade = _ref3[_l];
                  if (exportObj.upgradesById[upgrade.id].sources.intersects(data.allowed_sources)) {
                    _results.push(upgrade);
                  }
                }
                return _results;
              }).call(this);
              if (available_upgrades.length > 0) {
                addon.setById(available_upgrades[$.randomInt(available_upgrades.length)].id);
              }
              break;
            case 'Title':
              available_titles = (function() {
                var _l, _len3, _ref3, _results;
                _ref3 = this.getAvailableTitlesIncluding(addon.ship);
                _results = [];
                for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
                  title = _ref3[_l];
                  if (exportObj.titlesById[title.id].sources.intersects(data.allowed_sources)) {
                    _results.push(title);
                  }
                }
                return _results;
              }).call(this);
              if (available_titles.length > 0) {
                addon.setById(available_titles[$.randomInt(available_titles.length)].id);
              }
              break;
            case 'Modification':
              available_modifications = (function() {
                var _l, _len3, _ref3, _results;
                _ref3 = this.getAvailableModificationsIncluding(null, addon.ship);
                _results = [];
                for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
                  modification = _ref3[_l];
                  if (exportObj.modificationsById[modification.id].sources.intersects(data.allowed_sources)) {
                    _results.push(modification);
                  }
                }
                return _results;
              }).call(this);
              if (available_modifications.length > 0) {
                addon.setById(available_modifications[$.randomInt(available_modifications.length)].id);
              }
              break;
            default:
              throw new Error("Invalid addon type " + addon.type);
          }
        }
      } else {
        removable_things = [];
        _ref3 = this.ships;
        for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
          ship = _ref3[_l];
          removable_things.push(ship);
          _ref4 = ship.upgrades;
          for (_m = 0, _len4 = _ref4.length; _m < _len4; _m++) {
            upgrade = _ref4[_m];
            if (upgrade.data != null) {
              removable_things.push(upgrade);
            }
          }
          if (((_ref5 = ship.title) != null ? _ref5.data : void 0) != null) {
            removable_things.push(ship.title);
          }
          if (((_ref6 = ship.modification) != null ? _ref6.data : void 0) != null) {
            removable_things.push(ship.modification);
          }
        }
        if (removable_things.length > 0) {
          thing_to_remove = removable_things[$.randomInt(removable_things.length)];
          if (thing_to_remove instanceof Ship) {
            this.removeShip(thing_to_remove);
          } else if (thing_to_remove instanceof GenericAddon) {
            thing_to_remove.setData(null);
          } else {
            throw new Error("Unknown thing to remove " + thing_to_remove);
          }
        }
      }
      return window.setTimeout(this._makeRandomizerLoopFunc(data), 0);
    } else {
      window.clearTimeout(data.timer);
      _ref7 = this.ships;
      for (_n = 0, _len5 = _ref7.length; _n < _len5; _n++) {
        ship = _ref7[_n];
        ship.updateSelections();
      }
      this.suppress_automatic_new_ship = false;
      return this.addShip();
    }
  };

  SquadBuilder.prototype._makeRandomizerLoopFunc = function(data) {
    return (function(_this) {
      return function() {
        return _this._randomizerLoopBody(data);
      };
    })(this);
  };

  SquadBuilder.prototype.randomSquad = function(max_points, allowed_sources, timeout_ms, max_iterations) {
    var data, stopHandler;
    if (max_points == null) {
      max_points = 100;
    }
    if (allowed_sources == null) {
      allowed_sources = null;
    }
    if (timeout_ms == null) {
      timeout_ms = 1000;
    }
    if (max_iterations == null) {
      max_iterations = 1000;
    }
    this.backend_status.fadeOut('slow');
    this.suppress_automatic_new_ship = true;
    while (this.ships.length > 0) {
      this.removeShip(this.ships[0]);
    }
    if (this.ships.length > 0) {
      throw new Error("Ships not emptied");
    }
    data = {
      iterations: 0,
      max_points: max_points,
      max_iterations: max_iterations,
      keep_running: true,
      allowed_sources: allowed_sources != null ? allowed_sources : exportObj.expansions
    };
    stopHandler = (function(_this) {
      return function() {
        return data.keep_running = false;
      };
    })(this);
    data.timer = window.setTimeout(stopHandler, timeout_ms);
    window.setTimeout(this._makeRandomizerLoopFunc(data), 0);
    this.resetCurrentSquad();
    this.current_squad.name = 'Random Squad';
    return this.container.trigger('xwing-backend:squadNameChanged');
  };

  SquadBuilder.prototype.setBackend = function(backend) {
    return this.backend = backend;
  };

  SquadBuilder.prototype.describeSquad = function() {
    var ship;
    return ((function() {
      var _i, _len, _ref, _results;
      _ref = this.ships;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        ship = _ref[_i];
        if (ship.pilot != null) {
          _results.push(ship.pilot.name);
        }
      }
      return _results;
    }).call(this)).join(', ');
  };

  SquadBuilder.prototype.listCards = function() {
    var card_obj, ship, upgrade, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3;
    card_obj = {};
    _ref = this.ships;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      ship = _ref[_i];
      if (ship.pilot != null) {
        card_obj[ship.pilot.name] = null;
        _ref1 = ship.upgrades;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          upgrade = _ref1[_j];
          if (upgrade.data != null) {
            card_obj[upgrade.data.name] = null;
          }
        }
        if (((_ref2 = ship.title) != null ? _ref2.data : void 0) != null) {
          card_obj[ship.title.data.name] = null;
        }
        if (((_ref3 = ship.modification) != null ? _ref3.data : void 0) != null) {
          card_obj[ship.modification.data.name] = null;
        }
      }
    }
    return Object.keys(card_obj).sort();
  };

  SquadBuilder.prototype.getNotes = function() {
    return this.notes.val();
  };

  SquadBuilder.prototype.getObstacles = function() {
    return this.current_obstacles;
  };

  SquadBuilder.prototype.isSquadPossibleWithCollection = function() {
    var modification, modification_is_available, pilot_is_available, ship, ship_is_available, title, title_is_available, upgrade, upgrade_is_available, validity, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6;
    if (Object.keys((_ref = (_ref1 = this.collection) != null ? _ref1.expansions : void 0) != null ? _ref : {}).length === 0) {
      return true;
    }
    this.collection.reset();
    if (((_ref2 = this.collection) != null ? _ref2.checks.collectioncheck : void 0) !== "true") {
      return true;
    }
    this.collection.reset();
    validity = true;
    _ref3 = this.ships;
    for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
      ship = _ref3[_i];
      if (ship.pilot != null) {
        ship_is_available = this.collection.use('ship', ship.pilot.english_ship);
        pilot_is_available = this.collection.use('pilot', ship.pilot.english_name);
        if (!(ship_is_available && pilot_is_available)) {
          validity = false;
        }
        _ref4 = ship.upgrades;
        for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
          upgrade = _ref4[_j];
          if (upgrade.data != null) {
            upgrade_is_available = this.collection.use('upgrade', upgrade.data.english_name);
            if (!upgrade_is_available) {
              validity = false;
            }
          }
        }
        _ref5 = ship.modifications;
        for (_k = 0, _len2 = _ref5.length; _k < _len2; _k++) {
          modification = _ref5[_k];
          if (modification.data != null) {
            modification_is_available = this.collection.use('modification', modification.data.english_name);
            if (!modification_is_available) {
              validity = false;
            }
          }
        }
        _ref6 = ship.titles;
        for (_l = 0, _len3 = _ref6.length; _l < _len3; _l++) {
          title = _ref6[_l];
          if ((title != null ? title.data : void 0) != null) {
            title_is_available = this.collection.use('title', title.data.english_name);
            if (!title_is_available) {
              validity = false;
            }
          }
        }
      }
    }
    return validity;
  };

  SquadBuilder.prototype.checkCollection = function() {
    if (this.collection != null) {
      return this.collection_invalid_container.toggleClass('hidden', this.isSquadPossibleWithCollection());
    }
  };

  SquadBuilder.prototype.toXWS = function() {
    var candidate, last_id, match, matches, multisection_id_to_pilots, obstacles, pilot, ship, unmatched, unmatched_pilot, xws, _, _i, _j, _k, _l, _len, _len1, _len2, _len3, _m, _name, _ref, _ref1, _ref2, _ref3;
    xws = {
      description: this.getNotes(),
      faction: exportObj.toXWSFaction[this.faction],
      name: this.current_squad.name,
      pilots: [],
      points: this.total_points,
      vendor: {
        yasb: {
          builder: 'Yet Another Squad Builder 2.0',
          builder_url: window.location.href.split('?')[0],
          link: this.getPermaLink()
        }
      },
      version: '0.3.0'
    };
    _ref = this.ships;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      ship = _ref[_i];
      if (ship.pilot != null) {
        xws.pilots.push(ship.toXWS());
      }
    }
    multisection_id_to_pilots = {};
    last_id = 0;
    unmatched = (function() {
      var _j, _len1, _ref1, _results;
      _ref1 = xws.pilots;
      _results = [];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        pilot = _ref1[_j];
        if (pilot.multisection != null) {
          _results.push(pilot);
        }
      }
      return _results;
    })();
    for (_ = _j = 0, _ref1 = Math.pow(unmatched.length, 2); 0 <= _ref1 ? _j < _ref1 : _j > _ref1; _ = 0 <= _ref1 ? ++_j : --_j) {
      if (unmatched.length === 0) {
        break;
      }
      unmatched_pilot = unmatched.shift();
      if (unmatched_pilot.multisection_id == null) {
        unmatched_pilot.multisection_id = last_id++;
      }
      if (multisection_id_to_pilots[_name = unmatched_pilot.multisection_id] == null) {
        multisection_id_to_pilots[_name] = [unmatched_pilot];
      }
      if (unmatched.length === 0) {
        break;
      }
      matches = [];
      for (_k = 0, _len1 = unmatched.length; _k < _len1; _k++) {
        candidate = unmatched[_k];
        if (_ref2 = unmatched_pilot.name, __indexOf.call(candidate.multisection, _ref2) >= 0) {
          matches.push(candidate);
          unmatched_pilot.multisection.removeItem(candidate.name);
          candidate.multisection.removeItem(unmatched_pilot.name);
          candidate.multisection_id = unmatched_pilot.multisection_id;
          multisection_id_to_pilots[candidate.multisection_id].push(candidate);
          if (unmatched_pilot.multisection.length === 0) {
            break;
          }
        }
      }
      for (_l = 0, _len2 = matches.length; _l < _len2; _l++) {
        match = matches[_l];
        if (match.multisection.length === 0) {
          unmatched.removeItem(match);
        }
      }
    }
    _ref3 = xws.pilots;
    for (_m = 0, _len3 = _ref3.length; _m < _len3; _m++) {
      pilot = _ref3[_m];
      if (pilot.multisection != null) {
        delete pilot.multisection;
      }
    }
    obstacles = this.getObstacles();
    if ((obstacles != null) && obstacles.length > 0) {
      xws.obstacles = obstacles;
    }
    return xws;
  };

  SquadBuilder.prototype.toMinimalXWS = function() {
    var k, v, xws, _ref;
    xws = this.toXWS();
    for (k in xws) {
      if (!__hasProp.call(xws, k)) continue;
      v = xws[k];
      if (k !== 'faction' && k !== 'pilots' && k !== 'version') {
        delete xws[k];
      }
    }
    _ref = xws.pilots;
    for (k in _ref) {
      if (!__hasProp.call(_ref, k)) continue;
      v = _ref[k];
      if (k !== 'name' && k !== 'ship' && k !== 'upgrades' && k !== 'multisection_id') {
        delete xws[k];
      }
    }
    return xws;
  };

  SquadBuilder.prototype.loadFromXWS = function(xws, cb) {
    var addon, addon_added, addons, err, error, i, new_ship, p, pilot, ship_data, ship_name, shipnameXWS, slot, success, upgrade, upgrade_canonical, upgrade_canonicals, upgrade_type, version_list, x, xws_faction, _, _base1, _i, _j, _k, _l, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
    success = null;
    error = null;
    version_list = (function() {
      var _i, _len, _ref, _results;
      _ref = xws.version.split('.');
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        x = _ref[_i];
        _results.push(parseInt(x));
      }
      return _results;
    })();
    switch (false) {
      case !(version_list > [0, 1]):
        xws_faction = exportObj.fromXWSFaction[xws.faction];
        if (this.faction !== xws_faction) {
          throw new Error("Attempted to load XWS for " + xws.faction + " but builder is " + this.faction);
        }
        if (xws.name != null) {
          this.current_squad.name = xws.name;
        }
        if (xws.description != null) {
          this.notes.val(xws.description);
        }
        if (xws.obstacles != null) {
          this.current_squad.additional_data.obstacles = xws.obstacles;
        }
        this.suppress_automatic_new_ship = true;
        this.removeAllShips();
        _ref = xws.pilots;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          pilot = _ref[_i];
          new_ship = this.addShip();
          _ref1 = exportObj.ships;
          for (ship_name in _ref1) {
            ship_data = _ref1[ship_name];
            if (this.matcher(ship_data.xws, pilot.ship)) {
              shipnameXWS = {
                id: ship_data.name,
                xws: ship_data.xws
              };
            }
          }
          console.log("" + pilot.xws);
          try {
            new_ship.setPilot(((function() {
              var _base1, _j, _len1, _name, _ref2, _results;
              _ref2 = ((_base1 = exportObj.pilotsByFactionXWS[this.faction])[_name = pilot.id] != null ? _base1[_name] : _base1[_name] = exportObj.pilotsByFactionCanonicalName[this.faction][pilot.id]);
              _results = [];
              for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
                p = _ref2[_j];
                if (p.ship === shipnameXWS.id) {
                  _results.push(p);
                }
              }
              return _results;
            }).call(this))[0]);
          } catch (_error) {
            err = _error;
            console.error(err.message);
            continue;
          }
          addons = [];
          _ref3 = (_ref2 = pilot.upgrades) != null ? _ref2 : {};
          for (upgrade_type in _ref3) {
            upgrade_canonicals = _ref3[upgrade_type];
            for (_j = 0, _len1 = upgrade_canonicals.length; _j < _len1; _j++) {
              upgrade_canonical = upgrade_canonicals[_j];
              slot = null;
              slot = (_ref4 = exportObj.fromXWSUpgrade[upgrade_type]) != null ? _ref4 : upgrade_type.capitalize();
              addon = (_base1 = exportObj.upgradesBySlotXWSName[slot])[upgrade_canonical] != null ? _base1[upgrade_canonical] : _base1[upgrade_canonical] = exportObj.upgradesBySlotCanonicalName[slot][upgrade_canonical];
              if (addon != null) {
                addons.push({
                  type: slot,
                  data: addon,
                  slot: slot
                });
              }
            }
          }
          if (addons.length > 0) {
            for (_ = _k = 0; _k < 1000; _ = ++_k) {
              addon = addons.shift();
              addon_added = false;
              _ref5 = new_ship.upgrades;
              for (i = _l = 0, _len2 = _ref5.length; _l < _len2; i = ++_l) {
                upgrade = _ref5[i];
                if (upgrade.slot !== addon.slot || (upgrade.data != null)) {
                  continue;
                }
                upgrade.setData(addon.data);
                addon_added = true;
                break;
              }
              if (addon_added) {
                if (addons.length === 0) {
                  break;
                }
              } else {
                if (addons.length === 0) {
                  success = false;
                  error = "Could not add " + addon.data.name + " to " + new_ship;
                  break;
                } else {
                  addons.push(addon);
                }
              }
            }
            if (addons.length > 0) {
              success = false;
              error = "Could not add all upgrades";
              break;
            }
          }
        }
        this.suppress_automatic_new_ship = false;
        this.addShip();
        success = true;
        break;
      default:
        success = false;
        error = "Invalid or unsupported XWS version";
    }
    if (success) {
      this.current_squad.dirty = true;
      this.container.trigger('xwing-backend:squadNameChanged');
      this.container.trigger('xwing-backend:squadDirtinessChanged');
    }
    return cb({
      success: success,
      error: error
    });
  };

  return SquadBuilder;

})();

Ship = (function() {
  function Ship(args) {
    this.builder = args.builder;
    this.container = args.container;
    this.pilot = null;
    this.data = null;
    this.upgrades = [];
    this.modifications = [];
    this.titles = [];
    this.setupUI();
  }

  Ship.prototype.destroy = function(cb) {
    var idx;
    this.resetPilot();
    this.resetAddons();
    this.teardownUI();
    idx = this.builder.ships.indexOf(this);
    if (idx < 0) {
      throw new Error("Ship not registered with builder");
    }
    this.builder.ships.splice(idx, 1);
    return cb();
  };

  Ship.prototype.copyFrom = function(other) {
    var available_pilots, i, modification, other_conferred_addon, other_conferred_addons, other_modification, other_modifications, other_title, other_titles, other_upgrade, other_upgrades, pilot_data, title, upgrade, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _len6, _len7, _len8, _m, _n, _name, _o, _p, _q, _ref, _ref1, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
    if (other === this) {
      throw new Error("Cannot copy from self");
    }
    if (!((other.pilot != null) && (other.data != null))) {
      return;
    }
    if (other.pilot.unique) {
      available_pilots = (function() {
        var _i, _len, _ref, _results;
        _ref = this.builder.getAvailablePilotsForShipIncluding(other.data.name);
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          pilot_data = _ref[_i];
          if (!pilot_data.disabled) {
            _results.push(pilot_data);
          }
        }
        return _results;
      }).call(this);
      if (available_pilots.length > 0) {
        this.setPilotById(available_pilots[0].id);
        other_upgrades = {};
        _ref = other.upgrades;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          upgrade = _ref[_i];
          if (((upgrade != null ? upgrade.data : void 0) != null) && !upgrade.data.unique && ((upgrade.data.max_per_squad == null) || this.builder.countUpgrades(upgrade.data.canonical_name) < upgrade.data.max_per_squad)) {
            if (other_upgrades[_name = upgrade.slot] == null) {
              other_upgrades[_name] = [];
            }
            other_upgrades[upgrade.slot].push(upgrade);
          }
        }
        other_modifications = [];
        _ref1 = other.modifications;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          modification = _ref1[_j];
          if (((modification != null ? modification.data : void 0) != null) && !modification.data.unique) {
            other_modifications.push(modification);
          }
        }
        other_titles = [];
        _ref2 = other.titles;
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          title = _ref2[_k];
          if (((title != null ? title.data : void 0) != null) && !title.data.unique) {
            other_titles.push(title);
          }
        }
        _ref3 = this.titles;
        for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
          title = _ref3[_l];
          other_title = other_titles.shift();
          if (other_title != null) {
            title.setById(other_title.data.id);
          }
        }
        _ref4 = this.modifications;
        for (_m = 0, _len4 = _ref4.length; _m < _len4; _m++) {
          modification = _ref4[_m];
          other_modification = other_modifications.shift();
          if (other_modification != null) {
            modification.setById(other_modification.data.id);
          }
        }
        _ref5 = this.upgrades;
        for (_n = 0, _len5 = _ref5.length; _n < _len5; _n++) {
          upgrade = _ref5[_n];
          other_upgrade = ((_ref6 = other_upgrades[upgrade.slot]) != null ? _ref6 : []).shift();
          if (other_upgrade != null) {
            upgrade.setById(other_upgrade.data.id);
          }
        }
      } else {
        return;
      }
    } else {
      this.setPilotById(other.pilot.id);
      other_conferred_addons = [];
      if (((_ref7 = other.titles[0]) != null ? _ref7.data : void 0) != null) {
        other_conferred_addons = other_conferred_addons.concat(other.titles[0].conferredAddons);
      }
      if (((_ref8 = other.modifications[0]) != null ? _ref8.data : void 0) != null) {
        other_conferred_addons = other_conferred_addons.concat(other.modifications[0].conferredAddons);
      }
      _ref9 = other.upgrades;
      for (i = _o = 0, _len6 = _ref9.length; _o < _len6; i = ++_o) {
        other_upgrade = _ref9[i];
        if ((other_upgrade.data != null) && __indexOf.call(other_conferred_addons, other_upgrade) < 0 && !other_upgrade.data.unique && i < this.upgrades.length && ((other_upgrade.data.max_per_squad == null) || this.builder.countUpgrades(other_upgrade.data.canonical_name) < other_upgrade.data.max_per_squad)) {
          this.upgrades[i].setById(other_upgrade.data.id);
        }
      }
      if ((((_ref10 = other.titles[0]) != null ? _ref10.data : void 0) != null) && !other.titles[0].data.unique) {
        this.titles[0].setById(other.titles[0].data.id);
      }
      if (((_ref11 = other.modifications[0]) != null ? _ref11.data : void 0) && !other.modifications[0].data.unique) {
        this.modifications[0].setById(other.modifications[0].data.id);
      }
      if ((other.titles[0] != null) && other.titles[0].conferredAddons.length > 0) {
        _ref12 = other.titles[0].conferredAddons;
        for (i = _p = 0, _len7 = _ref12.length; _p < _len7; i = ++_p) {
          other_conferred_addon = _ref12[i];
          if ((other_conferred_addon.data != null) && !((_ref13 = other_conferred_addon.data) != null ? _ref13.unique : void 0)) {
            this.titles[0].conferredAddons[i].setById(other_conferred_addon.data.id);
          }
        }
      }
      if ((other.modifications[0] != null) && other.modifications[0].conferredAddons.length > 0) {
        _ref14 = other.modifications[0].conferredAddons;
        for (i = _q = 0, _len8 = _ref14.length; _q < _len8; i = ++_q) {
          other_conferred_addon = _ref14[i];
          if ((other_conferred_addon.data != null) && !((_ref15 = other_conferred_addon.data) != null ? _ref15.unique : void 0)) {
            this.modifications[0].conferredAddons[i].setById(other_conferred_addon.data.id);
          }
        }
      }
    }
    this.updateSelections();
    this.builder.container.trigger('xwing:pointsUpdated');
    this.builder.current_squad.dirty = true;
    return this.builder.container.trigger('xwing-backend:squadDirtinessChanged');
  };

  Ship.prototype.setShipType = function(ship_type) {
    var cls, result, _i, _len, _ref, _ref1;
    this.pilot_selector.data('select2').container.show();
    if (ship_type !== ((_ref = this.pilot) != null ? _ref.ship : void 0)) {
      this.setPilot(((function() {
        var _i, _len, _ref1, _results;
        _ref1 = this.builder.getAvailablePilotsForShipIncluding(ship_type);
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          result = _ref1[_i];
          if (!exportObj.pilotsById[result.id].unique) {
            _results.push(exportObj.pilotsById[result.id]);
          }
        }
        return _results;
      }).call(this))[0]);
    }
    _ref1 = this.row.attr('class').split(/\s+/);
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      cls = _ref1[_i];
      if (cls.indexOf('ship-') === 0) {
        this.row.removeClass(cls);
      }
    }
    this.remove_button.fadeIn('fast');
    this.row.addClass("ship-" + (ship_type.toLowerCase().replace(/[^a-z0-9]/gi, '')) + "0");
    return this.builder.container.trigger('xwing:shipUpdated');
  };

  Ship.prototype.setPilotById = function(id) {
    return this.setPilot(exportObj.pilotsById[parseInt(id)]);
  };

  Ship.prototype.setPilotByName = function(name) {
    return this.setPilot(exportObj.pilotsByLocalizedName[$.trim(name)]);
  };

  Ship.prototype.setPilot = function(new_pilot) {
    var modification, old_modification, old_modifications, old_title, old_titles, old_upgrade, old_upgrades, same_ship, title, upgrade, ___iced_passed_deferral, __iced_deferrals, __iced_k, _i, _j, _k, _len, _len1, _len2, _name, _ref, _ref1, _ref2;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    if (new_pilot !== this.pilot) {
      this.builder.current_squad.dirty = true;
      same_ship = (this.pilot != null) && (new_pilot != null ? new_pilot.ship : void 0) === this.pilot.ship;
      old_upgrades = {};
      old_titles = [];
      old_modifications = [];
      if (same_ship) {
        _ref = this.upgrades;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          upgrade = _ref[_i];
          if ((upgrade != null ? upgrade.data : void 0) != null) {
            if (old_upgrades[_name = upgrade.slot] == null) {
              old_upgrades[_name] = [];
            }
            old_upgrades[upgrade.slot].push(upgrade);
          }
        }
        _ref1 = this.titles;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          title = _ref1[_j];
          if ((title != null ? title.data : void 0) != null) {
            old_titles.push(title);
          }
        }
        _ref2 = this.modifications;
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          modification = _ref2[_k];
          if ((modification != null ? modification.data : void 0) != null) {
            old_modifications.push(modification);
          }
        }
      }
      this.resetPilot();
      this.resetAddons();
      (function(_this) {
        return (function(__iced_k) {
          if (new_pilot != null) {
            _this.data = exportObj.ships[new_pilot != null ? new_pilot.ship : void 0];
            (function(__iced_k) {
              if ((new_pilot != null ? new_pilot.unique : void 0) != null) {
                (function(__iced_k) {
                  __iced_deferrals = new iced.Deferrals(__iced_k, {
                    parent: ___iced_passed_deferral,
                    funcname: "Ship.setPilot"
                  });
                  _this.builder.container.trigger('xwing:claimUnique', [
                    new_pilot, 'Pilot', __iced_deferrals.defer({
                      lineno: 20073
                    })
                  ]);
                  __iced_deferrals._fulfill();
                })(__iced_k);
              } else {
                return __iced_k();
              }
            })(function() {
              var _l, _len3, _len4, _len5, _m, _n, _ref3, _ref4, _ref5, _ref6;
              _this.pilot = new_pilot;
              if (_this.pilot != null) {
                _this.setupAddons();
              }
              _this.copy_button.show();
              _this.setShipType(_this.pilot.ship);
              if (same_ship) {
                _ref3 = _this.titles;
                for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
                  title = _ref3[_l];
                  old_title = old_titles.shift();
                  if (old_title != null) {
                    title.setById(old_title.data.id);
                  }
                }
                _ref4 = _this.modifications;
                for (_m = 0, _len4 = _ref4.length; _m < _len4; _m++) {
                  modification = _ref4[_m];
                  old_modification = old_modifications.shift();
                  if (old_modification != null) {
                    modification.setById(old_modification.data.id);
                  }
                }
                _ref5 = _this.upgrades;
                for (_n = 0, _len5 = _ref5.length; _n < _len5; _n++) {
                  upgrade = _ref5[_n];
                  old_upgrade = ((_ref6 = old_upgrades[upgrade.slot]) != null ? _ref6 : []).shift();
                  if (old_upgrade != null) {
                    upgrade.setById(old_upgrade.data.id);
                  }
                }
              }
              return __iced_k();
            });
          } else {
            return __iced_k(_this.copy_button.hide());
          }
        });
      })(this)((function(_this) {
        return function() {
          _this.builder.container.trigger('xwing:pointsUpdated');
          return __iced_k(_this.builder.container.trigger('xwing-backend:squadDirtinessChanged'));
        };
      })(this));
    } else {
      return __iced_k();
    }
  };

  Ship.prototype.resetPilot = function() {
    var ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    (function(_this) {
      return (function(__iced_k) {
        var _ref;
        if (((_ref = _this.pilot) != null ? _ref.unique : void 0) != null) {
          (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              funcname: "Ship.resetPilot"
            });
            _this.builder.container.trigger('xwing:releaseUnique', [
              _this.pilot, 'Pilot', __iced_deferrals.defer({
                lineno: 20099
              })
            ]);
            __iced_deferrals._fulfill();
          })(__iced_k);
        } else {
          return __iced_k();
        }
      });
    })(this)((function(_this) {
      return function() {
        return _this.pilot = null;
      };
    })(this));
  };

  Ship.prototype.setupAddons = function() {
    var slot, _i, _len, _ref, _ref1, _results;
    _ref1 = (_ref = this.pilot.slots) != null ? _ref : [];
    _results = [];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      slot = _ref1[_i];
      _results.push(this.upgrades.push(new exportObj.Upgrade({
        ship: this,
        container: this.addon_container,
        slot: slot
      })));
    }
    return _results;
  };

  Ship.prototype.resetAddons = function() {
    var modification, title, upgrade, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    (function(_this) {
      return (function(__iced_k) {
        var _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          funcname: "Ship.resetAddons"
        });
        _ref = _this.titles;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          title = _ref[_i];
          if (title != null) {
            title.destroy(__iced_deferrals.defer({
              lineno: 20122
            }));
          }
        }
        _ref1 = _this.upgrades;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          upgrade = _ref1[_j];
          if (upgrade != null) {
            upgrade.destroy(__iced_deferrals.defer({
              lineno: 20124
            }));
          }
        }
        _ref2 = _this.modifications;
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          modification = _ref2[_k];
          if (modification != null) {
            modification.destroy(__iced_deferrals.defer({
              lineno: 20126
            }));
          }
        }
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        _this.upgrades = [];
        _this.modifications = [];
        return _this.titles = [];
      };
    })(this));
  };

  Ship.prototype.getPoints = function() {
    var modification, points, title, upgrade, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6;
    points = (_ref = (_ref1 = this.pilot) != null ? _ref1.points : void 0) != null ? _ref : 0;
    _ref2 = this.titles;
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      title = _ref2[_i];
      points += (_ref3 = title != null ? title.getPoints() : void 0) != null ? _ref3 : 0;
    }
    _ref4 = this.upgrades;
    for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
      upgrade = _ref4[_j];
      points += upgrade.getPoints();
    }
    _ref5 = this.modifications;
    for (_k = 0, _len2 = _ref5.length; _k < _len2; _k++) {
      modification = _ref5[_k];
      points += (_ref6 = modification != null ? modification.getPoints() : void 0) != null ? _ref6 : 0;
    }
    this.points_container.find('span').text(points);
    if (points > 0) {
      this.points_container.fadeTo('fast', 1);
    } else {
      this.points_container.fadeTo(0, 0);
    }
    return points;
  };

  Ship.prototype.updateSelections = function() {
    var modification, points, title, upgrade, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _results;
    if (this.pilot != null) {
      this.ship_selector.select2('data', {
        id: this.pilot.ship,
        text: this.pilot.ship,
        xws: exportObj.ships[this.pilot.ship].xws
      });
      this.pilot_selector.select2('data', {
        id: this.pilot.id,
        text: "" + this.pilot.name + " (" + this.pilot.points + ")"
      });
      this.pilot_selector.data('select2').container.show();
      _ref = this.upgrades;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        upgrade = _ref[_i];
        points = upgrade.getPoints();
        upgrade.updateSelection(points);
      }
      _ref1 = this.titles;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        title = _ref1[_j];
        if (title != null) {
          title.updateSelection();
        }
      }
      _ref2 = this.modifications;
      _results = [];
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        modification = _ref2[_k];
        if (modification != null) {
          _results.push(modification.updateSelection());
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    } else {
      this.pilot_selector.select2('data', null);
      return this.pilot_selector.data('select2').container.toggle(this.ship_selector.val() !== '');
    }
  };

  Ship.prototype.setupUI = function() {
    var shipResultFormatter;
    this.row = $(document.createElement('DIV'));
    this.row.addClass('row-fluid ship');
    this.row.insertBefore(this.builder.notes_container);
    this.row.append($.trim('<div class="span3">\n    <input class="ship-selector-container" type="hidden" />\n    <br />\n    <input type="hidden" class="pilot-selector-container" />\n</div>\n<div class="span1 points-display-container">\n    <span></span>\n</div>\n<div class="span6 addon-container" />\n<div class="span2 button-container">\n    <button class="btn btn-danger remove-pilot"><span class="visible-desktop visible-tablet hidden-phone" data-toggle="tooltip" title="Remove Pilot"><i class="fa fa-times"></i></span><span class="hidden-desktop hidden-tablet visible-phone">Remove Pilot</span></button>\n    <button class="btn copy-pilot"><span class="visible-desktop visible-tablet hidden-phone" data-toggle="tooltip" title="Clone Pilot"><i class="fa fa-files-o"></i></span><span class="hidden-desktop hidden-tablet visible-phone">Clone Pilot</span></button>\n</div>'));
    this.row.find('.button-container span').tooltip();
    this.ship_selector = $(this.row.find('input.ship-selector-container'));
    this.pilot_selector = $(this.row.find('input.pilot-selector-container'));
    shipResultFormatter = function(object, container, query) {
      $(container).append("<i class=\"xwing-miniatures-ship xwing-miniatures-ship-" + object.xws + "\"></i> " + object.text);
      return void 0;
    };
    this.ship_selector.select2({
      width: '100%',
      placeholder: exportObj.translate(this.builder.language, 'ui', 'shipSelectorPlaceholder'),
      query: (function(_this) {
        return function(query) {
          _this.builder.checkCollection();
          return query.callback({
            more: false,
            results: _this.builder.getAvailableShipsMatching(query.term)
          });
        };
      })(this),
      minimumResultsForSearch: $.isMobile() ? -1 : 0,
      formatResultCssClass: (function(_this) {
        return function(obj) {
          var not_in_collection;
          if ((_this.builder.collection != null) && (_this.builder.collection.checks.collectioncheck === "true")) {
            not_in_collection = false;
            if ((_this.pilot != null) && obj.id === exportObj.ships[_this.pilot.ship].id) {
              if (!(_this.builder.collection.checkShelf('ship', obj.english_name) || _this.builder.collection.checkTable('pilot', obj.english_name))) {
                not_in_collection = true;
              }
            } else {
              not_in_collection = !_this.builder.collection.checkShelf('ship', obj.english_name);
            }
            if (not_in_collection) {
              return 'select2-result-not-in-collection';
            } else {
              return '';
            }
          } else {
            return '';
          }
        };
      })(this),
      formatResult: shipResultFormatter,
      formatSelection: shipResultFormatter
    });
    this.ship_selector.on('change', (function(_this) {
      return function(e) {
        return _this.setShipType(_this.ship_selector.val());
      };
    })(this));
    this.row.attr('id', "row-" + (this.ship_selector.data('select2').container.attr('id')));
    this.pilot_selector.select2({
      width: '100%',
      placeholder: exportObj.translate(this.builder.language, 'ui', 'pilotSelectorPlaceholder'),
      query: (function(_this) {
        return function(query) {
          _this.builder.checkCollection();
          return query.callback({
            more: false,
            results: _this.builder.getAvailablePilotsForShipIncluding(_this.ship_selector.val(), _this.pilot, query.term)
          });
        };
      })(this),
      minimumResultsForSearch: $.isMobile() ? -1 : 0,
      formatResultCssClass: (function(_this) {
        return function(obj) {
          var not_in_collection, _ref;
          if ((_this.builder.collection != null) && (_this.builder.collection.checks.collectioncheck === "true")) {
            not_in_collection = false;
            if (obj.id === ((_ref = _this.pilot) != null ? _ref.id : void 0)) {
              if (!(_this.builder.collection.checkShelf('pilot', obj.english_name) || _this.builder.collection.checkTable('pilot', obj.english_name))) {
                not_in_collection = true;
              }
            } else {
              not_in_collection = !_this.builder.collection.checkShelf('pilot', obj.english_name);
            }
            if (not_in_collection) {
              return 'select2-result-not-in-collection';
            } else {
              return '';
            }
          } else {
            return '';
          }
        };
      })(this)
    });
    this.pilot_selector.on('change', (function(_this) {
      return function(e) {
        _this.setPilotById(_this.pilot_selector.select2('val'));
        _this.builder.current_squad.dirty = true;
        _this.builder.container.trigger('xwing-backend:squadDirtinessChanged');
        return _this.builder.backend_status.fadeOut('slow');
      };
    })(this));
    this.pilot_selector.data('select2').results.on('mousemove-filtered', (function(_this) {
      return function(e) {
        var select2_data, _ref;
        select2_data = $(e.target).closest('.select2-result').data('select2-data');
        if ((select2_data != null ? select2_data.id : void 0) != null) {
          return _this.builder.showTooltip('Pilot', exportObj.pilotsById[select2_data.id], {
            ship: (_ref = _this.data) != null ? _ref.english_name : void 0
          });
        }
      };
    })(this));
    this.pilot_selector.data('select2').container.on('mouseover', (function(_this) {
      return function(e) {
        if (_this.data != null) {
          return _this.builder.showTooltip('Ship', _this);
        }
      };
    })(this));
    this.pilot_selector.data('select2').container.on('touchmove', (function(_this) {
      return function(e) {
        if (_this.data != null) {
          return _this.builder.showTooltip('Ship', _this);
        }

        /*if @data? 
            scrollTo(0,$('#info-container').offset().top - 10,'smooth')
         */
      };
    })(this));
    this.pilot_selector.data('select2').container.hide();
    this.points_container = $(this.row.find('.points-display-container'));
    this.points_container.fadeTo(0, 0);
    this.addon_container = $(this.row.find('div.addon-container'));
    this.remove_button = $(this.row.find('button.remove-pilot'));
    this.remove_button.click((function(_this) {
      return function(e) {
        e.preventDefault();
        return _this.row.slideUp('fast', function() {
          var _ref;
          _this.builder.removeShip(_this);
          return (_ref = _this.backend_status) != null ? _ref.fadeOut('slow') : void 0;
        });
      };
    })(this));
    this.remove_button.hide();
    this.copy_button = $(this.row.find('button.copy-pilot'));
    this.copy_button.click((function(_this) {
      return function(e) {
        var clone;
        clone = _this.builder.ships[_this.builder.ships.length - 1];
        return clone.copyFrom(_this);
      };
    })(this));
    return this.copy_button.hide();
  };

  Ship.prototype.teardownUI = function() {
    this.row.text('');
    return this.row.remove();
  };

  Ship.prototype.toString = function() {
    if (this.pilot != null) {
      return "Pilot " + this.pilot.name + " flying " + this.data.name;
    } else {
      return "Ship without pilot";
    }
  };

  Ship.prototype.toHTML = function() {
    var action, action_bar, action_bar_red, action_icons, action_icons_red, actionred, attackHTML, attack_icon, attackbHTML, attackdtHTML, attackfHTML, attacktHTML, chargeHTML, dialHTML, effective_stats, energyHTML, forceHTML, html, modification, points, slotted_upgrades, title, upgrade, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref16, _ref17, _ref18, _ref19, _ref2, _ref20, _ref21, _ref22, _ref23, _ref24, _ref25, _ref26, _ref27, _ref28, _ref29, _ref3, _ref30, _ref31, _ref32, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
    effective_stats = this.effectiveStats();
    action_icons = [];
    action_icons_red = [];
    _ref = effective_stats.actions;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      action = _ref[_i];
      action_icons.push((function() {
        switch (action) {
          case 'Focus':
            return "<i class=\"xwing-miniatures-font xwing-miniatures-font-focus\"></i> ";
          case 'Evade':
            return "<i class=\"xwing-miniatures-font xwing-miniatures-font-evade\"></i> ";
          case 'Barrel Roll':
            return "<i class=\"xwing-miniatures-font xwing-miniatures-font-barrelroll\"></i> ";
          case 'Lock':
            return "<i class=\"xwing-miniatures-font xwing-miniatures-font-lock\"></i> ";
          case 'Boost':
            return "<i class=\"xwing-miniatures-font xwing-miniatures-font-boost\"></i> ";
          case 'Coordinate':
            return "<i class=\"xwing-miniatures-font xwing-miniatures-font-coordinate\"></i> ";
          case 'Jam':
            return "<i class=\"xwing-miniatures-font xwing-miniatures-font-jam\"></i> ";
          case 'Reinforce':
            return "<i class=\"xwing-miniatures-font xwing-miniatures-font-reinforce\"></i> ";
          case 'Cloak':
            return "<i class=\"xwing-miniatures-font xwing-miniatures-font-cloak\"></i> ";
          case 'Slam':
            return "<i class=\"xwing-miniatures-font xwing-miniatures-font-slam\"></i> ";
          case 'Rotate Arc':
            return "<i class=\"xwing-miniatures-font xwing-miniatures-font-rotatearc\"></i> ";
          case 'Reload':
            return "<i class=\"xwing-miniatures-font xwing-miniatures-font-reload\"></i> ";
          case 'Calculate':
            return "<i class=\"xwing-miniatures-font xwing-miniatures-font-calculate\"></i> ";
          case "R> Lock":
            return "<i class=\"xwing-miniatures-font red xwing-miniatures-font-linked\"></i> <i class=\"xwing-miniatures-font info-attack red xwing-miniatures-font-lock\"></i>&nbsp;";
          case "R> Barrel Roll":
            return "<i class=\"xwing-miniatures-font red xwing-miniatures-font-linked\"></i> <i class=\"xwing-miniatures-font info-attack red xwing-miniatures-font-barrelroll\"></i>&nbsp;";
          case "R> Focus":
            return "<i class=\"xwing-miniatures-font red xwing-miniatures-font-linked\"></i> <i class=\"xwing-miniatures-font info-attack red xwing-miniatures-font-focus\"></i>&nbsp;";
          case "R> Rotate Arc":
            return "<i class=\"xwing-miniatures-font red xwing-miniatures-font-linked\"></i> <i class=\"xwing-miniatures-font info-attack red xwing-miniatures-font-rotatearc\"></i>&nbsp;";
          case "> Rotate Arc":
            return "<i class=\"xwing-miniatures-font xwing-miniatures-font-linked\"></i> <i class=\"xwing-miniatures-font info-attack red xwing-miniatures-font-rotatearc\"></i>&nbsp;";
          case "R> Evade":
            return "<i class=\"xwing-miniatures-font red xwing-miniatures-font-linked\"></i> <i class=\"xwing-miniatures-font info-attack red xwing-miniatures-font-evade\"></i>&nbsp;";
          case "R> Calculate":
            return "<i class=\"xwing-miniatures-font red xwing-miniatures-font-linked\"></i> <i class=\"xwing-miniatures-font info-attack red xwing-miniatures-font-calculate\"></i>&nbsp;";
          default:
            return "<span>&nbsp;" + action + "<span>";
        }
      })());
    }
    _ref1 = effective_stats.actionsred;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      actionred = _ref1[_j];
      action_icons_red.push((function() {
        switch (actionred) {
          case 'Focus':
            return "<i class=\"xwing-miniatures-font red xwing-miniatures-font-focus\"></i>";
          case 'Evade':
            return "<i class=\"xwing-miniatures-font red xwing-miniatures-font-evade\"></i>";
          case 'Barrel Roll':
            return "<i class=\"xwing-miniatures-font red xwing-miniatures-font-barrelroll\"></i>";
          case 'Lock':
            return "<i class=\"xwing-miniatures-font red xwing-miniatures-font-lock\"></i>";
          case 'Boost':
            return "<i class=\"xwing-miniatures-font red xwing-miniatures-font-boost\"></i>";
          case 'Coordinate':
            return "<i class=\"xwing-miniatures-font red xwing-miniatures-font-coordinate\"></i>";
          case 'Jam':
            return "<i class=\"xwing-miniatures-font red xwing-miniatures-font-jam\"></i>";
          case 'Reinforce':
            return "<i class=\"xwing-miniatures-font red xwing-miniatures-font-reinforce\"></i>";
          case 'Cloak':
            return "<i class=\"xwing-miniatures-font red xwing-miniatures-font-cloak\"></i>";
          case 'Slam':
            return "<i class=\"xwing-miniatures-font red xwing-miniatures-font-slam\"></i>";
          case 'Rotate Arc':
            return "<i class=\"xwing-miniatures-font red xwing-miniatures-font-rotatearc\"></i>";
          case 'Reload':
            return "<i class=\"xwing-miniatures-font red xwing-miniatures-font-reload\"></i>";
          case 'Calculate':
            return "<i class=\"xwing-miniatures-font red xwing-miniatures-font-calculate\"></i>";
          default:
            return "<span>&nbsp;" + action + "<span>";
        }
      })());
    }
    action_bar = action_icons.join(' ');
    action_bar_red = action_icons_red.join(' ');
    attack_icon = (_ref2 = this.data.attack_icon) != null ? _ref2 : 'xwing-miniatures-font-frontarc';
    attackHTML = (((_ref3 = this.pilot.ship_override) != null ? _ref3.attack : void 0) != null) || (this.data.attack != null) ? $.trim("<i class=\"xwing-miniatures-font header-attack " + attack_icon + "\"></i>\n<span class=\"info-data info-attack\">" + (statAndEffectiveStat((_ref4 = (_ref5 = this.pilot.ship_override) != null ? _ref5.attack : void 0) != null ? _ref4 : this.data.attack, effective_stats, 'attack')) + "</span>") : '';
    if ((((_ref6 = this.pilot.ship_override) != null ? _ref6.attackb : void 0) != null) || (this.data.attackb != null)) {
      attackbHTML = $.trim("<i class=\"xwing-miniatures-font header-attack xwing-miniatures-font-reararc\"></i>\n<span class=\"info-data info-attack\">" + (statAndEffectiveStat((_ref7 = (_ref8 = this.pilot.ship_override) != null ? _ref8.attackb : void 0) != null ? _ref7 : this.data.attackb, effective_stats, 'attackb')) + "</span>");
    } else {
      attackbHTML = '';
    }
    if ((((_ref9 = this.pilot.ship_override) != null ? _ref9.attackf : void 0) != null) || (this.data.attackf != null)) {
      attackfHTML = $.trim("<i class=\"xwing-miniatures-font header-attack xwing-miniatures-font-fullfrontarc\"></i>\n<span class=\"info-data info-attack\">" + (statAndEffectiveStat((_ref10 = (_ref11 = this.pilot.ship_override) != null ? _ref11.attackf : void 0) != null ? _ref10 : this.data.attackf, effective_stats, 'attackf')) + "</span>");
    } else {
      attackfHTML = '';
    }
    if ((((_ref12 = this.pilot.ship_override) != null ? _ref12.attackt : void 0) != null) || (this.data.attackt != null)) {
      attacktHTML = $.trim("<i class=\"xwing-miniatures-font header-attack xwing-miniatures-font-singleturretarc\"></i>\n<span class=\"info-data info-attack\">" + (statAndEffectiveStat((_ref13 = (_ref14 = this.pilot.ship_override) != null ? _ref14.attackt : void 0) != null ? _ref13 : this.data.attackt, effective_stats, 'attackt')) + "</span>");
    } else {
      attacktHTML = '';
    }
    if ((((_ref15 = this.pilot.ship_override) != null ? _ref15.attackdt : void 0) != null) || (this.data.attackdt != null)) {
      attackdtHTML = $.trim("<i class=\"xwing-miniatures-font header-attack xwing-miniatures-font-doubleturretarc\"></i>\n<span class=\"info-data info-attack\">" + (statAndEffectiveStat((_ref16 = (_ref17 = this.pilot.ship_override) != null ? _ref17.attackdt : void 0) != null ? _ref16 : this.data.attackdt, effective_stats, 'attackdt')) + "</span>");
    } else {
      attackdtHTML = '';
    }
    energyHTML = (((_ref18 = this.pilot.ship_override) != null ? _ref18.energy : void 0) != null) || (this.data.energy != null) ? $.trim("<i class=\"xwing-miniatures-font header-energy xwing-miniatures-font-energy\"></i>\n<span class=\"info-data info-energy\">" + (statAndEffectiveStat((_ref19 = (_ref20 = this.pilot.ship_override) != null ? _ref20.energy : void 0) != null ? _ref19 : this.data.energy, effective_stats, 'energy')) + "</span>") : '';
    forceHTML = (this.pilot.force != null) ? $.trim("<i class=\"xwing-miniatures-font header-force xwing-miniatures-font-forcecharge\"></i>\n<span class=\"info-data info-force\">" + (statAndEffectiveStat((_ref21 = (_ref22 = this.pilot.ship_override) != null ? _ref22.force : void 0) != null ? _ref21 : this.pilot.force, effective_stats, 'force')) + "<i class=\"xwing-miniatures-font xwing-miniatures-font-recurring\"></i></span>") : '';
    if (this.pilot.charge != null) {
      if (this.pilot.recurring != null) {
        chargeHTML = $.trim("<i class=\"xwing-miniatures-font header-charge xwing-miniatures-font-charge\"></i>\n<span class=\"info-data info-charge\">" + (statAndEffectiveStat((_ref23 = (_ref24 = this.pilot.ship_override) != null ? _ref24.charge : void 0) != null ? _ref23 : this.pilot.charge, effective_stats, 'charge')) + "<i class=\"xwing-miniatures-font xwing-miniatures-font-recurring\"></i></span>");
      } else {
        chargeHTML = $.trim("<i class=\"xwing-miniatures-font header-charge xwing-miniatures-font-charge\"></i>\n<span class=\"info-data info-charge\">" + (statAndEffectiveStat((_ref25 = (_ref26 = this.pilot.ship_override) != null ? _ref26.charge : void 0) != null ? _ref25 : this.pilot.charge, effective_stats, 'charge')) + "</span>");
      }
    } else {
      chargeHTML = '';
    }
    html = $.trim("<div class=\"fancy-pilot-header\">\n    <div class=\"pilot-header-text\">" + this.pilot.name + " <i class=\"xwing-miniatures-ship xwing-miniatures-ship-" + this.data.xws + "\"></i><span class=\"fancy-ship-type\"> " + this.data.name + "</span></div>\n    <div class=\"mask\">\n        <div class=\"outer-circle\">\n            <div class=\"inner-circle pilot-points\">" + this.pilot.points + "</div>\n        </div>\n    </div>\n</div>\n<div class=\"fancy-pilot-stats\">\n    <div class=\"pilot-stats-content\">\n        <span class=\"info-data info-skill\">INI " + (statAndEffectiveStat(this.pilot.skill, effective_stats, 'skill')) + "</span>\n        " + attackHTML + "\n        " + attackbHTML + "\n        " + attackfHTML + "\n        " + attacktHTML + "\n        " + attackdtHTML + "\n        " + energyHTML + "\n        <i class=\"xwing-miniatures-font header-agility xwing-miniatures-font-agility\"></i>\n        <span class=\"info-data info-agility\">" + (statAndEffectiveStat((_ref27 = (_ref28 = this.pilot.ship_override) != null ? _ref28.agility : void 0) != null ? _ref27 : this.data.agility, effective_stats, 'agility')) + "</span>\n        <i class=\"xwing-miniatures-font header-hull xwing-miniatures-font-hull\"></i>\n        <span class=\"info-data info-hull\">" + (statAndEffectiveStat((_ref29 = (_ref30 = this.pilot.ship_override) != null ? _ref30.hull : void 0) != null ? _ref29 : this.data.hull, effective_stats, 'hull')) + "</span>\n        <i class=\"xwing-miniatures-font header-shield xwing-miniatures-font-shield\"></i>\n        <span class=\"info-data info-shields\">" + (statAndEffectiveStat((_ref31 = (_ref32 = this.pilot.ship_override) != null ? _ref32.shields : void 0) != null ? _ref31 : this.data.shields, effective_stats, 'shields')) + "</span>\n        " + forceHTML + "\n        " + chargeHTML + "\n        &nbsp;\n        " + action_bar + "\n        &nbsp;&nbsp;\n        " + action_bar_red + "\n    </div>\n</div>");
    dialHTML = this.builder.getManeuverTableHTML(effective_stats.maneuvers, this.data.maneuvers);
    html += $.trim("<div class=\"fancy-dial\">\n    " + dialHTML + "\n</div>");
    if (this.pilot.text) {
      html += $.trim("<div class=\"fancy-pilot-text\">" + this.pilot.text + "</div>");
    }
    slotted_upgrades = ((function() {
      var _k, _len2, _ref33, _results;
      _ref33 = this.upgrades;
      _results = [];
      for (_k = 0, _len2 = _ref33.length; _k < _len2; _k++) {
        upgrade = _ref33[_k];
        if (upgrade.data != null) {
          _results.push(upgrade);
        }
      }
      return _results;
    }).call(this)).concat((function() {
      var _k, _len2, _ref33, _results;
      _ref33 = this.modifications;
      _results = [];
      for (_k = 0, _len2 = _ref33.length; _k < _len2; _k++) {
        modification = _ref33[_k];
        if (modification.data != null) {
          _results.push(modification);
        }
      }
      return _results;
    }).call(this)).concat((function() {
      var _k, _len2, _ref33, _results;
      _ref33 = this.titles;
      _results = [];
      for (_k = 0, _len2 = _ref33.length; _k < _len2; _k++) {
        title = _ref33[_k];
        if (title.data != null) {
          _results.push(title);
        }
      }
      return _results;
    }).call(this));
    if (slotted_upgrades.length > 0) {
      html += $.trim("<div class=\"fancy-upgrade-container\">");
      for (_k = 0, _len2 = slotted_upgrades.length; _k < _len2; _k++) {
        upgrade = slotted_upgrades[_k];
        points = upgrade.getPoints();
        html += upgrade.toHTML(points);
      }
      html += $.trim("</div>");
    }
    html += $.trim("<div class=\"ship-points-total\">\n    <strong>Ship Total: " + (this.getPoints()) + "</strong>\n</div>");
    return "<div class=\"fancy-ship\">" + html + "</div>";
  };

  Ship.prototype.toTableRow = function() {
    var modification, points, slotted_upgrades, table_html, title, upgrade, _i, _len;
    table_html = $.trim("<tr class=\"simple-pilot\">\n    <td class=\"name\">" + this.pilot.name + " &mdash; " + this.data.name + "</td>\n    <td class=\"points\">" + this.pilot.points + "</td>\n</tr>");
    slotted_upgrades = ((function() {
      var _i, _len, _ref, _results;
      _ref = this.upgrades;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        upgrade = _ref[_i];
        if (upgrade.data != null) {
          _results.push(upgrade);
        }
      }
      return _results;
    }).call(this)).concat((function() {
      var _i, _len, _ref, _results;
      _ref = this.modifications;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        modification = _ref[_i];
        if (modification.data != null) {
          _results.push(modification);
        }
      }
      return _results;
    }).call(this)).concat((function() {
      var _i, _len, _ref, _results;
      _ref = this.titles;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        title = _ref[_i];
        if (title.data != null) {
          _results.push(title);
        }
      }
      return _results;
    }).call(this));
    if (slotted_upgrades.length > 0) {
      for (_i = 0, _len = slotted_upgrades.length; _i < _len; _i++) {
        upgrade = slotted_upgrades[_i];
        points = upgrade.getPoints();
        table_html += upgrade.toTableRow(points);
      }
    }
    table_html += "<tr class=\"simple-ship-total\"><td colspan=\"2\">Ship Total: " + (this.getPoints()) + "</td></tr>";
    table_html += '<tr><td>&nbsp;</td><td></td></tr>';
    return table_html;
  };

  Ship.prototype.toRedditText = function() {
    var modification, points, reddit, reddit_upgrades, slotted_upgrades, title, upgrade, upgrade_reddit, _i, _len;
    reddit = "**" + this.pilot.name + " (" + this.pilot.points + ")**    \n";
    slotted_upgrades = ((function() {
      var _i, _len, _ref, _results;
      _ref = this.upgrades;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        upgrade = _ref[_i];
        if (upgrade.data != null) {
          _results.push(upgrade);
        }
      }
      return _results;
    }).call(this)).concat((function() {
      var _i, _len, _ref, _results;
      _ref = this.modifications;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        modification = _ref[_i];
        if (modification.data != null) {
          _results.push(modification);
        }
      }
      return _results;
    }).call(this)).concat((function() {
      var _i, _len, _ref, _results;
      _ref = this.titles;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        title = _ref[_i];
        if (title.data != null) {
          _results.push(title);
        }
      }
      return _results;
    }).call(this));
    if (slotted_upgrades.length > 0) {
      reddit += "    \n";
      reddit_upgrades = [];
      for (_i = 0, _len = slotted_upgrades.length; _i < _len; _i++) {
        upgrade = slotted_upgrades[_i];
        points = upgrade.getPoints();
        upgrade_reddit = upgrade.toRedditText(points);
        if (upgrade_reddit != null) {
          reddit_upgrades.push(upgrade_reddit);
        }
      }
      reddit += reddit_upgrades.join("    ");
      reddit += "&nbsp;*Ship total: (" + (this.getPoints()) + ")*    \n";
    }
    return reddit;
  };

  Ship.prototype.toBBCode = function() {
    var bbcode, bbcode_upgrades, modification, points, slotted_upgrades, title, upgrade, upgrade_bbcode, _i, _len;
    bbcode = "[b]" + this.pilot.name + " (" + this.pilot.points + ")[/b]";
    slotted_upgrades = ((function() {
      var _i, _len, _ref, _results;
      _ref = this.upgrades;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        upgrade = _ref[_i];
        if (upgrade.data != null) {
          _results.push(upgrade);
        }
      }
      return _results;
    }).call(this)).concat((function() {
      var _i, _len, _ref, _results;
      _ref = this.modifications;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        modification = _ref[_i];
        if (modification.data != null) {
          _results.push(modification);
        }
      }
      return _results;
    }).call(this)).concat((function() {
      var _i, _len, _ref, _results;
      _ref = this.titles;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        title = _ref[_i];
        if (title.data != null) {
          _results.push(title);
        }
      }
      return _results;
    }).call(this));
    if (slotted_upgrades.length > 0) {
      bbcode += "\n";
      bbcode_upgrades = [];
      for (_i = 0, _len = slotted_upgrades.length; _i < _len; _i++) {
        upgrade = slotted_upgrades[_i];
        points = upgrade.getPoints();
        upgrade_bbcode = upgrade.toBBCode(points);
        if (upgrade_bbcode != null) {
          bbcode_upgrades.push(upgrade_bbcode);
        }
      }
      bbcode += bbcode_upgrades.join("\n");
    }
    return bbcode;
  };

  Ship.prototype.toSimpleHTML = function() {
    var html, modification, points, slotted_upgrades, title, upgrade, upgrade_html, _i, _len;
    html = "<b>" + this.pilot.name + " (" + this.pilot.points + ")</b><br />";
    slotted_upgrades = ((function() {
      var _i, _len, _ref, _results;
      _ref = this.upgrades;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        upgrade = _ref[_i];
        if (upgrade.data != null) {
          _results.push(upgrade);
        }
      }
      return _results;
    }).call(this)).concat((function() {
      var _i, _len, _ref, _results;
      _ref = this.modifications;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        modification = _ref[_i];
        if (modification.data != null) {
          _results.push(modification);
        }
      }
      return _results;
    }).call(this)).concat((function() {
      var _i, _len, _ref, _results;
      _ref = this.titles;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        title = _ref[_i];
        if (title.data != null) {
          _results.push(title);
        }
      }
      return _results;
    }).call(this));
    if (slotted_upgrades.length > 0) {
      for (_i = 0, _len = slotted_upgrades.length; _i < _len; _i++) {
        upgrade = slotted_upgrades[_i];
        points = upgrade.getPoints();
        upgrade_html = upgrade.toSimpleHTML(points);
        if (upgrade_html != null) {
          html += upgrade_html;
        }
      }
    }
    return html;
  };

  Ship.prototype.toSerialized = function() {
    var addon, conferred_addons, i, modification, serialized_conferred_addons, title, upgrade, upgrades, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref10, _ref11, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
    conferred_addons = [];
    _ref = this.titles;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      title = _ref[_i];
      conferred_addons = conferred_addons.concat((_ref1 = title != null ? title.conferredAddons : void 0) != null ? _ref1 : []);
    }
    _ref2 = this.modifications;
    for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
      modification = _ref2[_j];
      conferred_addons = conferred_addons.concat((_ref3 = modification != null ? modification.conferredAddons : void 0) != null ? _ref3 : []);
    }
    _ref4 = this.upgrades;
    for (_k = 0, _len2 = _ref4.length; _k < _len2; _k++) {
      upgrade = _ref4[_k];
      conferred_addons = conferred_addons.concat((_ref5 = upgrade != null ? upgrade.conferredAddons : void 0) != null ? _ref5 : []);
    }
    upgrades = "" + ((function() {
      var _l, _len3, _ref6, _ref7, _ref8, _results;
      _ref6 = this.upgrades;
      _results = [];
      for (i = _l = 0, _len3 = _ref6.length; _l < _len3; i = ++_l) {
        upgrade = _ref6[i];
        if (__indexOf.call(conferred_addons, upgrade) < 0) {
          _results.push((_ref7 = upgrade != null ? (_ref8 = upgrade.data) != null ? _ref8.id : void 0 : void 0) != null ? _ref7 : -1);
        }
      }
      return _results;
    }).call(this));
    serialized_conferred_addons = [];
    for (_l = 0, _len3 = conferred_addons.length; _l < _len3; _l++) {
      addon = conferred_addons[_l];
      serialized_conferred_addons.push(addon.toSerialized());
    }
    return [this.pilot.id, upgrades, (_ref6 = (_ref7 = this.titles[0]) != null ? (_ref8 = _ref7.data) != null ? _ref8.id : void 0 : void 0) != null ? _ref6 : -1, (_ref9 = (_ref10 = this.modifications[0]) != null ? (_ref11 = _ref10.data) != null ? _ref11.id : void 0 : void 0) != null ? _ref9 : -1, serialized_conferred_addons.join(',')].join(':');
  };

  Ship.prototype.fromSerialized = function(version, serialized) {
    var addon_cls, addon_id, addon_type_serialized, conferred_addon, conferredaddon_pair, conferredaddon_pairs, deferred_id, deferred_ids, i, modification, modification_conferred_addon_pairs, modification_id, pilot_id, title_conferred_addon_pairs, title_conferred_upgrade_ids, title_id, upgrade, upgrade_conferred_addon_pairs, upgrade_id, upgrade_ids, _i, _j, _k, _l, _len, _len1, _len10, _len11, _len12, _len2, _len3, _len4, _len5, _len6, _len7, _len8, _len9, _m, _n, _o, _p, _q, _r, _ref, _ref1, _ref10, _ref11, _ref12, _ref13, _ref14, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _s, _t, _u;
    switch (version) {
      case 1:
        _ref = serialized.split(':'), pilot_id = _ref[0], upgrade_ids = _ref[1], title_id = _ref[2], title_conferred_upgrade_ids = _ref[3], modification_id = _ref[4];
        this.setPilotById(parseInt(pilot_id));
        _ref1 = upgrade_ids.split(',');
        for (i = _i = 0, _len = _ref1.length; _i < _len; i = ++_i) {
          upgrade_id = _ref1[i];
          upgrade_id = parseInt(upgrade_id);
          if (upgrade_id >= 0) {
            this.upgrades[i].setById(upgrade_id);
          }
        }
        title_id = parseInt(title_id);
        if (title_id >= 0) {
          this.titles[0].setById(title_id);
        }
        if ((this.titles[0] != null) && this.titles[0].conferredAddons.length > 0) {
          _ref2 = title_conferred_upgrade_ids.split(',');
          for (i = _j = 0, _len1 = _ref2.length; _j < _len1; i = ++_j) {
            upgrade_id = _ref2[i];
            upgrade_id = parseInt(upgrade_id);
            if (upgrade_id >= 0) {
              this.titles[0].conferredAddons[i].setById(upgrade_id);
            }
          }
        }
        modification_id = parseInt(modification_id);
        if (modification_id >= 0) {
          this.modifications[0].setById(modification_id);
        }
        break;
      case 2:
      case 3:
        _ref3 = serialized.split(':'), pilot_id = _ref3[0], upgrade_ids = _ref3[1], title_id = _ref3[2], modification_id = _ref3[3], conferredaddon_pairs = _ref3[4];
        this.setPilotById(parseInt(pilot_id));
        deferred_ids = [];
        _ref4 = upgrade_ids.split(',');
        for (i = _k = 0, _len2 = _ref4.length; _k < _len2; i = ++_k) {
          upgrade_id = _ref4[i];
          upgrade_id = parseInt(upgrade_id);
          if (upgrade_id < 0 || isNaN(upgrade_id)) {
            continue;
          }
          if (this.upgrades[i].isOccupied()) {
            deferred_ids.push(upgrade_id);
          } else {
            this.upgrades[i].setById(upgrade_id);
          }
        }
        for (_l = 0, _len3 = deferred_ids.length; _l < _len3; _l++) {
          deferred_id = deferred_ids[_l];
          _ref5 = this.upgrades;
          for (i = _m = 0, _len4 = _ref5.length; _m < _len4; i = ++_m) {
            upgrade = _ref5[i];
            if (upgrade.isOccupied() || upgrade.slot !== exportObj.upgradesById[deferred_id].slot) {
              continue;
            }
            upgrade.setById(deferred_id);
            break;
          }
        }
        title_id = parseInt(title_id);
        if (title_id >= 0) {
          this.titles[0].setById(title_id);
        }
        modification_id = parseInt(modification_id);
        if (modification_id >= 0) {
          this.modifications[0].setById(modification_id);
        }
        if (conferredaddon_pairs != null) {
          conferredaddon_pairs = conferredaddon_pairs.split(',');
        } else {
          conferredaddon_pairs = [];
        }
        if ((this.titles[0] != null) && this.titles[0].conferredAddons.length > 0) {
          title_conferred_addon_pairs = conferredaddon_pairs.splice(0, this.titles[0].conferredAddons.length);
          for (i = _n = 0, _len5 = title_conferred_addon_pairs.length; _n < _len5; i = ++_n) {
            conferredaddon_pair = title_conferred_addon_pairs[i];
            _ref6 = conferredaddon_pair.split('.'), addon_type_serialized = _ref6[0], addon_id = _ref6[1];
            addon_id = parseInt(addon_id);
            addon_cls = SERIALIZATION_CODE_TO_CLASS[addon_type_serialized];
            conferred_addon = this.titles[0].conferredAddons[i];
            if (conferred_addon instanceof addon_cls) {
              conferred_addon.setById(addon_id);
            } else {
              throw new Error("Expected addon class " + addon_cls.constructor.name + " for conferred addon at index " + i + " but " + conferred_addon.constructor.name + " is there");
            }
          }
        }
        _ref7 = this.modifications;
        for (_o = 0, _len6 = _ref7.length; _o < _len6; _o++) {
          modification = _ref7[_o];
          if (((modification != null ? modification.data : void 0) != null) && modification.conferredAddons.length > 0) {
            modification_conferred_addon_pairs = conferredaddon_pairs.splice(0, modification.conferredAddons.length);
            for (i = _p = 0, _len7 = modification_conferred_addon_pairs.length; _p < _len7; i = ++_p) {
              conferredaddon_pair = modification_conferred_addon_pairs[i];
              _ref8 = conferredaddon_pair.split('.'), addon_type_serialized = _ref8[0], addon_id = _ref8[1];
              addon_id = parseInt(addon_id);
              addon_cls = SERIALIZATION_CODE_TO_CLASS[addon_type_serialized];
              conferred_addon = modification.conferredAddons[i];
              if (conferred_addon instanceof addon_cls) {
                conferred_addon.setById(addon_id);
              } else {
                throw new Error("Expected addon class " + addon_cls.constructor.name + " for conferred addon at index " + i + " but " + conferred_addon.constructor.name + " is there");
              }
            }
          }
        }
        break;
      case 4:
        _ref9 = serialized.split(':'), pilot_id = _ref9[0], upgrade_ids = _ref9[1], title_id = _ref9[2], modification_id = _ref9[3], conferredaddon_pairs = _ref9[4];
        this.setPilotById(parseInt(pilot_id));
        deferred_ids = [];
        _ref10 = upgrade_ids.split(',');
        for (i = _q = 0, _len8 = _ref10.length; _q < _len8; i = ++_q) {
          upgrade_id = _ref10[i];
          upgrade_id = parseInt(upgrade_id);
          if (upgrade_id < 0 || isNaN(upgrade_id)) {
            continue;
          }
          if (this.upgrades[i].isOccupied() || (((_ref11 = this.upgrades[i].dataById[upgrade_id]) != null ? _ref11.also_occupies_upgrades : void 0) != null)) {
            deferred_ids.push(upgrade_id);
          } else {
            this.upgrades[i].setById(upgrade_id);
          }
        }
        for (_r = 0, _len9 = deferred_ids.length; _r < _len9; _r++) {
          deferred_id = deferred_ids[_r];
          _ref12 = this.upgrades;
          for (i = _s = 0, _len10 = _ref12.length; _s < _len10; i = ++_s) {
            upgrade = _ref12[i];
            if (upgrade.isOccupied() || upgrade.slot !== exportObj.upgradesById[deferred_id].slot) {
              continue;
            }
            upgrade.setById(deferred_id);
            break;
          }
        }
        if (conferredaddon_pairs != null) {
          conferredaddon_pairs = conferredaddon_pairs.split(',');
        } else {
          conferredaddon_pairs = [];
        }
        _ref13 = this.upgrades;
        for (_t = 0, _len11 = _ref13.length; _t < _len11; _t++) {
          upgrade = _ref13[_t];
          if (((upgrade != null ? upgrade.data : void 0) != null) && upgrade.conferredAddons.length > 0) {
            upgrade_conferred_addon_pairs = conferredaddon_pairs.splice(0, upgrade.conferredAddons.length);
            for (i = _u = 0, _len12 = upgrade_conferred_addon_pairs.length; _u < _len12; i = ++_u) {
              conferredaddon_pair = upgrade_conferred_addon_pairs[i];
              _ref14 = conferredaddon_pair.split('.'), addon_type_serialized = _ref14[0], addon_id = _ref14[1];
              addon_id = parseInt(addon_id);
              addon_cls = SERIALIZATION_CODE_TO_CLASS[addon_type_serialized];
              conferred_addon = upgrade.conferredAddons[i];
              if (conferred_addon instanceof addon_cls) {
                conferred_addon.setById(addon_id);
              } else {
                throw new Error("Expected addon class " + addon_cls.constructor.name + " for conferred addon at index " + i + " but " + conferred_addon.constructor.name + " is there");
              }
            }
          }
        }
    }
    return this.updateSelections();
  };

  Ship.prototype.effectiveStats = function() {
    var modification, s, stats, title, upgrade, _i, _j, _k, _l, _len, _len1, _len2, _ref, _ref1, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref16, _ref17, _ref18, _ref19, _ref2, _ref20, _ref21, _ref22, _ref23, _ref24, _ref25, _ref26, _ref27, _ref28, _ref29, _ref3, _ref30, _ref31, _ref32, _ref33, _ref34, _ref35, _ref36, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
    stats = {
      skill: this.pilot.skill,
      attack: (_ref = (_ref1 = this.pilot.ship_override) != null ? _ref1.attack : void 0) != null ? _ref : this.data.attack,
      attackf: (_ref2 = (_ref3 = this.pilot.ship_override) != null ? _ref3.attackf : void 0) != null ? _ref2 : this.data.attackf,
      attackb: (_ref4 = (_ref5 = this.pilot.ship_override) != null ? _ref5.attackb : void 0) != null ? _ref4 : this.data.attackb,
      attackt: (_ref6 = (_ref7 = this.pilot.ship_override) != null ? _ref7.attackt : void 0) != null ? _ref6 : this.data.attackt,
      attackdt: (_ref8 = (_ref9 = this.pilot.ship_override) != null ? _ref9.attackdt : void 0) != null ? _ref8 : this.data.attackdt,
      energy: (_ref10 = (_ref11 = this.pilot.ship_override) != null ? _ref11.energy : void 0) != null ? _ref10 : this.data.energy,
      agility: (_ref12 = (_ref13 = this.pilot.ship_override) != null ? _ref13.agility : void 0) != null ? _ref12 : this.data.agility,
      hull: (_ref14 = (_ref15 = this.pilot.ship_override) != null ? _ref15.hull : void 0) != null ? _ref14 : this.data.hull,
      shields: (_ref16 = (_ref17 = this.pilot.ship_override) != null ? _ref17.shields : void 0) != null ? _ref16 : this.data.shields,
      force: (_ref18 = (_ref19 = (_ref20 = this.pilot.ship_override) != null ? _ref20.force : void 0) != null ? _ref19 : this.pilot.force) != null ? _ref18 : 0,
      charge: (_ref21 = (_ref22 = this.pilot.ship_override) != null ? _ref22.charge : void 0) != null ? _ref21 : this.pilot.charge,
      actions: ((_ref23 = (_ref24 = this.pilot.ship_override) != null ? _ref24.actions : void 0) != null ? _ref23 : this.data.actions).slice(0),
      actionsred: ((_ref25 = (_ref26 = (_ref27 = this.pilot.ship_override) != null ? _ref27.actionsred : void 0) != null ? _ref26 : this.data.actionsred) != null ? _ref25 : []).slice(0)
    };
    stats.maneuvers = [];
    for (s = _i = 0, _ref28 = ((_ref29 = this.data.maneuvers) != null ? _ref29 : []).length; 0 <= _ref28 ? _i < _ref28 : _i > _ref28; s = 0 <= _ref28 ? ++_i : --_i) {
      stats.maneuvers[s] = this.data.maneuvers[s].slice(0);
    }
    _ref30 = this.upgrades;
    for (_j = 0, _len = _ref30.length; _j < _len; _j++) {
      upgrade = _ref30[_j];
      if ((upgrade != null ? (_ref31 = upgrade.data) != null ? _ref31.modifier_func : void 0 : void 0) != null) {
        upgrade.data.modifier_func(stats);
      }
    }
    _ref32 = this.titles;
    for (_k = 0, _len1 = _ref32.length; _k < _len1; _k++) {
      title = _ref32[_k];
      if ((title != null ? (_ref33 = title.data) != null ? _ref33.modifier_func : void 0 : void 0) != null) {
        title.data.modifier_func(stats);
      }
    }
    _ref34 = this.modifications;
    for (_l = 0, _len2 = _ref34.length; _l < _len2; _l++) {
      modification = _ref34[_l];
      if ((modification != null ? (_ref35 = modification.data) != null ? _ref35.modifier_func : void 0 : void 0) != null) {
        modification.data.modifier_func(stats);
      }
    }
    if (((_ref36 = this.pilot) != null ? _ref36.modifier_func : void 0) != null) {
      this.pilot.modifier_func(stats);
    }
    return stats;
  };

  Ship.prototype.validate = function() {
    var func, i, max_checks, modification, title, upgrade, valid, _i, _j, _k, _l, _len, _len1, _len2, _ref, _ref1, _ref10, _ref11, _ref12, _ref13, _ref14, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
    max_checks = 128;
    for (i = _i = 0; 0 <= max_checks ? _i < max_checks : _i > max_checks; i = 0 <= max_checks ? ++_i : --_i) {
      valid = true;
      _ref = this.upgrades;
      for (_j = 0, _len = _ref.length; _j < _len; _j++) {
        upgrade = _ref[_j];
        func = (_ref1 = (_ref2 = upgrade != null ? (_ref3 = upgrade.data) != null ? _ref3.validation_func : void 0 : void 0) != null ? _ref2 : upgrade != null ? (_ref4 = upgrade.data) != null ? _ref4.restriction_func : void 0 : void 0) != null ? _ref1 : void 0;
        if ((func != null) && !func(this, upgrade)) {
          upgrade.setById(null);
          valid = false;
          break;
        }
      }
      _ref5 = this.titles;
      for (_k = 0, _len1 = _ref5.length; _k < _len1; _k++) {
        title = _ref5[_k];
        func = (_ref6 = (_ref7 = title != null ? (_ref8 = title.data) != null ? _ref8.validation_func : void 0 : void 0) != null ? _ref7 : title != null ? (_ref9 = title.data) != null ? _ref9.restriction_func : void 0 : void 0) != null ? _ref6 : void 0;
        if ((func != null) && !func(this)) {
          title.setById(null);
          valid = false;
          break;
        }
      }
      _ref10 = this.modifications;
      for (_l = 0, _len2 = _ref10.length; _l < _len2; _l++) {
        modification = _ref10[_l];
        func = (_ref11 = (_ref12 = modification != null ? (_ref13 = modification.data) != null ? _ref13.validation_func : void 0 : void 0) != null ? _ref12 : modification != null ? (_ref14 = modification.data) != null ? _ref14.restriction_func : void 0 : void 0) != null ? _ref11 : void 0;
        if ((func != null) && !func(this, modification)) {
          modification.setById(null);
          valid = false;
          break;
        }
      }
      if (valid) {
        break;
      }
    }
    return this.updateSelections();
  };

  Ship.prototype.checkUnreleasedContent = function() {
    var modification, title, upgrade, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
    if ((this.pilot != null) && !exportObj.isReleased(this.pilot)) {
      return true;
    }
    _ref = this.titles;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      title = _ref[_i];
      if (((title != null ? title.data : void 0) != null) && !exportObj.isReleased(title.data)) {
        return true;
      }
    }
    _ref1 = this.modifications;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      modification = _ref1[_j];
      if (((modification != null ? modification.data : void 0) != null) && !exportObj.isReleased(modification.data)) {
        return true;
      }
    }
    _ref2 = this.upgrades;
    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
      upgrade = _ref2[_k];
      if (((upgrade != null ? upgrade.data : void 0) != null) && !exportObj.isReleased(upgrade.data)) {
        return true;
      }
    }
    return false;
  };

  Ship.prototype.hasAnotherUnoccupiedSlotLike = function(upgrade_obj) {
    var upgrade, _i, _len, _ref;
    _ref = this.upgrades;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      upgrade = _ref[_i];
      if (upgrade === upgrade_obj || upgrade.slot !== upgrade_obj.slot) {
        continue;
      }
      if (!upgrade.isOccupied()) {
        return true;
      }
    }
    return false;
  };

  Ship.prototype.toXWS = function() {
    var modification, title, upgrade, upgrade_obj, xws, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3;
    xws = {
      id: (_ref = this.pilot.xws) != null ? _ref : this.pilot.canonical_name,
      points: this.getPoints(),
      ship: this.data.xws.canonicalize()
    };
    if (this.data.multisection) {
      xws.multisection = this.data.multisection.slice(0);
    }
    upgrade_obj = {};
    _ref1 = this.upgrades;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      upgrade = _ref1[_i];
      if ((upgrade != null ? upgrade.data : void 0) != null) {
        upgrade.toXWS(upgrade_obj);
      }
    }
    _ref2 = this.modifications;
    for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
      modification = _ref2[_j];
      if ((modification != null ? modification.data : void 0) != null) {
        modification.toXWS(upgrade_obj);
      }
    }
    _ref3 = this.titles;
    for (_k = 0, _len2 = _ref3.length; _k < _len2; _k++) {
      title = _ref3[_k];
      if ((title != null ? title.data : void 0) != null) {
        title.toXWS(upgrade_obj);
      }
    }
    if (Object.keys(upgrade_obj).length > 0) {
      xws.upgrades = upgrade_obj;
    }
    return xws;
  };

  Ship.prototype.getConditions = function() {
    var condition, conditions, upgrade, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3, _ref4;
    if (typeof Set !== "undefined" && Set !== null) {
      conditions = new Set();
      if (((_ref = this.pilot) != null ? _ref.applies_condition : void 0) != null) {
        if (this.pilot.applies_condition instanceof Array) {
          _ref1 = this.pilot.applies_condition;
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            condition = _ref1[_i];
            conditions.add(exportObj.conditionsByCanonicalName[condition]);
          }
        } else {
          conditions.add(exportObj.conditionsByCanonicalName[this.pilot.applies_condition]);
        }
      }
      _ref2 = this.upgrades;
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        upgrade = _ref2[_j];
        if ((upgrade != null ? (_ref3 = upgrade.data) != null ? _ref3.applies_condition : void 0 : void 0) != null) {
          if (upgrade.data.applies_condition instanceof Array) {
            _ref4 = upgrade.data.applies_condition;
            for (_k = 0, _len2 = _ref4.length; _k < _len2; _k++) {
              condition = _ref4[_k];
              conditions.add(exportObj.conditionsByCanonicalName[condition]);
            }
          } else {
            conditions.add(exportObj.conditionsByCanonicalName[upgrade.data.applies_condition]);
          }
        }
      }
      return conditions;
    } else {
      console.warn('Set not supported in this JS implementation, not implementing conditions');
      return [];
    }
  };

  return Ship;

})();

GenericAddon = (function() {
  function GenericAddon(args) {
    this.ship = args.ship;
    this.container = $(args.container);
    this.data = null;
    this.unadjusted_data = null;
    this.conferredAddons = [];
    this.serialization_code = 'X';
    this.occupied_by = null;
    this.occupying = [];
    this.destroyed = false;
    this.type = null;
    this.dataByName = null;
    this.dataById = null;
    if (args.adjustment_func != null) {
      this.adjustment_func = args.adjustment_func;
    }
    if (args.filter_func != null) {
      this.filter_func = args.filter_func;
    }
    this.placeholderMod_func = args.placeholderMod_func != null ? args.placeholderMod_func : (function(_this) {
      return function(x) {
        return x;
      };
    })(this);
  }

  GenericAddon.prototype.destroy = function() {
    var args, cb, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    cb = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    if (this.destroyed) {
      return cb(args);
    }
    (function(_this) {
      return (function(__iced_k) {
        var _ref;
        if (((_ref = _this.data) != null ? _ref.unique : void 0) != null) {
          (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              funcname: "GenericAddon.destroy"
            });
            _this.ship.builder.container.trigger('xwing:releaseUnique', [
              _this.data, _this.type, __iced_deferrals.defer({
                lineno: 20896
              })
            ]);
            __iced_deferrals._fulfill();
          })(__iced_k);
        } else {
          return __iced_k();
        }
      });
    })(this)((function(_this) {
      return function() {
        _this.destroyed = true;
        _this.rescindAddons();
        _this.deoccupyOtherUpgrades();
        _this.selector.select2('destroy');
        return cb(args);
      };
    })(this));
  };

  GenericAddon.prototype.setupSelector = function(args) {
    this.selector = $(document.createElement('INPUT'));
    this.selector.attr('type', 'hidden');
    this.container.append(this.selector);
    if ($.isMobile()) {
      args.minimumResultsForSearch = -1;
    }
    args.formatResultCssClass = (function(_this) {
      return function(obj) {
        var not_in_collection, _ref;
        if (_this.ship.builder.collection != null) {
          not_in_collection = false;
          if (obj.id === ((_ref = _this.data) != null ? _ref.id : void 0)) {
            if (!(_this.ship.builder.collection.checkShelf(_this.type.toLowerCase(), obj.english_name) || _this.ship.builder.collection.checkTable(_this.type.toLowerCase(), obj.english_name))) {
              not_in_collection = true;
            }
          } else {
            not_in_collection = !_this.ship.builder.collection.checkShelf(_this.type.toLowerCase(), obj.english_name);
          }
          if (not_in_collection) {
            return 'select2-result-not-in-collection';
          } else {
            return '';
          }
        } else {
          return '';
        }
      };
    })(this);
    args.formatSelection = (function(_this) {
      return function(obj, container) {
        var icon;
        icon = (function() {
          switch (this.type) {
            case 'Upgrade':
              return this.slot.toLowerCase().replace(/[^0-9a-z]/gi, '');
            default:
              return this.type.toLowerCase().replace(/[^0-9a-z]/gi, '');
          }
        }).call(_this);
        icon = icon.replace("configuration", "config").replace("force", "forcepower");
        $(container).append("<i class=\"xwing-miniatures-font xwing-miniatures-font-" + icon + "\"></i> " + obj.text);
        return void 0;
      };
    })(this);
    this.selector.select2(args);
    this.selector.on('change', (function(_this) {
      return function(e) {
        _this.setById(_this.selector.select2('val'));
        _this.ship.builder.current_squad.dirty = true;
        _this.ship.builder.container.trigger('xwing-backend:squadDirtinessChanged');
        return _this.ship.builder.backend_status.fadeOut('slow');
      };
    })(this));
    this.selector.data('select2').results.on('mousemove-filtered', (function(_this) {
      return function(e) {
        var select2_data;
        select2_data = $(e.target).closest('.select2-result').data('select2-data');
        if ((select2_data != null ? select2_data.id : void 0) != null) {
          return _this.ship.builder.showTooltip('Addon', _this.dataById[select2_data.id], {
            addon_type: _this.type
          });
        }
      };
    })(this));
    this.selector.data('select2').container.on('mouseover', (function(_this) {
      return function(e) {
        if (_this.data != null) {
          return _this.ship.builder.showTooltip('Addon', _this.data, {
            addon_type: _this.type
          });
        }
      };
    })(this));
    return this.selector.data('select2').container.on('touchmove', (function(_this) {
      return function(e) {
        if (_this.data != null) {
          return _this.ship.builder.showTooltip('Addon', _this.data, {
            addon_type: _this.type
          });
        }

        /*if @data?
            scrollTo(0,$('#info-container').offset().top - 10,'smooth')
         */
      };
    })(this));
  };

  GenericAddon.prototype.setById = function(id) {
    return this.setData(this.dataById[parseInt(id)]);
  };

  GenericAddon.prototype.setByName = function(name) {
    return this.setData(this.dataByName[$.trim(name)]);
  };

  GenericAddon.prototype.setData = function(new_data) {
    var ___iced_passed_deferral, __iced_deferrals, __iced_k, _ref;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    if ((new_data != null ? new_data.id : void 0) !== ((_ref = this.data) != null ? _ref.id : void 0)) {
      (function(_this) {
        return (function(__iced_k) {
          var _ref1;
          if (((_ref1 = _this.data) != null ? _ref1.unique : void 0) != null) {
            (function(__iced_k) {
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral,
                funcname: "GenericAddon.setData"
              });
              _this.ship.builder.container.trigger('xwing:releaseUnique', [
                _this.unadjusted_data, _this.type, __iced_deferrals.defer({
                  lineno: 20963
                })
              ]);
              __iced_deferrals._fulfill();
            })(__iced_k);
          } else {
            return __iced_k();
          }
        });
      })(this)((function(_this) {
        return function() {
          _this.rescindAddons();
          _this.deoccupyOtherUpgrades();
          (function(__iced_k) {
            if ((new_data != null ? new_data.unique : void 0) != null) {
              (function(__iced_k) {
                __iced_deferrals = new iced.Deferrals(__iced_k, {
                  parent: ___iced_passed_deferral,
                  funcname: "GenericAddon.setData"
                });
                _this.ship.builder.container.trigger('xwing:claimUnique', [
                  new_data, _this.type, __iced_deferrals.defer({
                    lineno: 20967
                  })
                ]);
                __iced_deferrals._fulfill();
              })(__iced_k);
            } else {
              return __iced_k();
            }
          })(function() {
            _this.data = _this.unadjusted_data = new_data;
            if (_this.data != null) {
              if (_this.data.superseded_by_id) {
                return _this.setById(_this.data.superseded_by_id);
              }
              if (_this.adjustment_func != null) {
                _this.data = _this.adjustment_func(_this.data);
              }
              _this.unequipOtherUpgrades();
              _this.occupyOtherUpgrades();
              _this.conferAddons();
            } else {
              _this.deoccupyOtherUpgrades();
            }
            return __iced_k(_this.ship.builder.container.trigger('xwing:pointsUpdated'));
          });
        };
      })(this));
    } else {
      return __iced_k();
    }
  };

  GenericAddon.prototype.conferAddons = function() {
    var addon, args, cls, _i, _len, _ref, _results;
    if ((this.data.confersAddons != null) && this.data.confersAddons.length > 0) {
      _ref = this.data.confersAddons;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        addon = _ref[_i];
        cls = addon.type;
        args = {
          ship: this.ship,
          container: this.container
        };
        if (addon.slot != null) {
          args.slot = addon.slot;
        }
        if (addon.adjustment_func != null) {
          args.adjustment_func = addon.adjustment_func;
        }
        if (addon.filter_func != null) {
          args.filter_func = addon.filter_func;
        }
        if (addon.auto_equip != null) {
          args.auto_equip = addon.auto_equip;
        }
        if (addon.placeholderMod_func != null) {
          args.placeholderMod_func = addon.placeholderMod_func;
        }
        addon = new cls(args);
        if (addon instanceof exportObj.Upgrade) {
          this.ship.upgrades.push(addon);
        } else if (addon instanceof exportObj.Modification) {
          this.ship.modifications.push(addon);
        } else if (addon instanceof exportObj.Title) {
          this.ship.titles.push(addon);
        } else {
          throw new Error("Unexpected addon type for addon " + addon);
        }
        _results.push(this.conferredAddons.push(addon));
      }
      return _results;
    }
  };

  GenericAddon.prototype.rescindAddons = function() {
    var addon, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    (function(_this) {
      return (function(__iced_k) {
        var _i, _len, _ref;
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          funcname: "GenericAddon.rescindAddons"
        });
        _ref = _this.conferredAddons;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          addon = _ref[_i];
          addon.destroy(__iced_deferrals.defer({
            lineno: 21010
          }));
        }
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        var _i, _len, _ref;
        _ref = _this.conferredAddons;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          addon = _ref[_i];
          if (addon instanceof exportObj.Upgrade) {
            _this.ship.upgrades.removeItem(addon);
          } else if (addon instanceof exportObj.Modification) {
            _this.ship.modifications.removeItem(addon);
          } else if (addon instanceof exportObj.Title) {
            _this.ship.titles.removeItem(addon);
          } else {
            throw new Error("Unexpected addon type for addon " + addon);
          }
        }
        return _this.conferredAddons = [];
      };
    })(this));
  };

  GenericAddon.prototype.getPoints = function() {
    var _ref, _ref1, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref16, _ref17, _ref18, _ref19, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
    if ((((_ref = this.data) != null ? _ref.variableagility : void 0) != null) && (this.ship != null)) {
      return Math.max((_ref1 = (_ref2 = this.data) != null ? _ref2.basepoints : void 0) != null ? _ref1 : 0, ((_ref3 = (_ref4 = this.data) != null ? _ref4.basepoints : void 0) != null ? _ref3 : 0) + ((((_ref5 = this.ship) != null ? _ref5.data.agility : void 0) - 1) * 2) + 1);
    } else if ((((_ref6 = this.data) != null ? _ref6.variablebase : void 0) != null) && !((this.ship.data.medium != null) || (this.ship.data.large != null))) {
      return Math.max(0, (_ref7 = this.data) != null ? _ref7.basepoints : void 0);
    } else if ((((_ref8 = this.data) != null ? _ref8.variablebase : void 0) != null) && (((_ref9 = this.ship) != null ? _ref9.data.medium : void 0) != null)) {
      return Math.max(0, ((_ref10 = (_ref11 = this.data) != null ? _ref11.basepoints : void 0) != null ? _ref10 : 0) + ((_ref12 = this.data) != null ? _ref12.basepoints : void 0));
    } else if ((((_ref13 = this.data) != null ? _ref13.variablebase : void 0) != null) && (((_ref14 = this.ship) != null ? _ref14.data.large : void 0) != null)) {
      return Math.max(0, ((_ref15 = (_ref16 = this.data) != null ? _ref16.basepoints : void 0) != null ? _ref15 : 0) + (((_ref17 = this.data) != null ? _ref17.basepoints : void 0) * 2));
    } else {
      return (_ref18 = (_ref19 = this.data) != null ? _ref19.points : void 0) != null ? _ref18 : 0;
    }
  };

  GenericAddon.prototype.updateSelection = function(points) {
    if (this.data != null) {
      return this.selector.select2('data', {
        id: this.data.id,
        text: "" + this.data.name + " (" + points + ")"
      });
    } else {
      return this.selector.select2('data', null);
    }
  };

  GenericAddon.prototype.toString = function() {
    if (this.data != null) {
      return "" + this.data.name + " (" + this.data.points + ")";
    } else {
      return "No " + this.type;
    }
  };

  GenericAddon.prototype.toHTML = function(points) {
    var attackHTML, attackrangebonus, chargeHTML, forceHTML, match_array, restriction_html, text_str, upgrade_slot_font, _ref;
    if (this.data != null) {
      upgrade_slot_font = ((_ref = this.data.slot) != null ? _ref : this.type).toLowerCase().replace(/[^0-9a-z]/gi, '');
      match_array = this.data.text.match(/(<span.*<\/span>)<br \/><br \/>(.*)/);
      if (match_array) {
        restriction_html = '<div class="card-restriction-container">' + match_array[1] + '</div>';
        text_str = match_array[2];
      } else {
        restriction_html = '';
        text_str = this.data.text;
      }
      if (this.data.rangebonus != null) {
        attackrangebonus = "<span class=\"upgrade-attack-rangebonus\"><i class=\"xwing-miniatures-font xwing-miniatures-font-rangebonusindicator\"></i></span>";
      } else {
        attackrangebonus = '';
      }
      attackHTML = (this.data.attack != null) ? $.trim("<div class=\"upgrade-attack\">\n    <span class=\"upgrade-attack-range\">" + this.data.range + "</span>\n    " + attackrangebonus + "\n    <span class=\"info-data info-attack\">" + this.data.attack + "</span>\n    <i class=\"xwing-miniatures-font xwing-miniatures-font-frontarc\"></i>\n</div>") : (this.data.attackt != null) ? $.trim("<div class=\"upgrade-attack\">\n    <span class=\"upgrade-attack-range\">" + this.data.range + "</span>\n    <span class=\"info-data info-attack\">" + this.data.attackt + "</span>\n    <i class=\"xwing-miniatures-font xwing-miniatures-font-singleturretarc\"></i>\n</div>") : (this.data.attackbull != null) ? $.trim("<div class=\"upgrade-attack\">\n    <span class=\"upgrade-attack-range\">" + this.data.range + "</span>\n    <span class=\"info-data info-attack\">" + this.data.attackbull + "</span>\n    <i class=\"xwing-miniatures-font xwing-miniatures-font-bullseyearc\"></i>\n</div>") : '';
      if ((this.data.charge != null)) {
        if ((this.data.recurring != null)) {
          chargeHTML = $.trim("<div class=\"upgrade-charge\">\n    <span class=\"info-data info-charge\">" + this.data.charge + "</span>\n    <i class=\"xwing-miniatures-font xwing-miniatures-font-charge\"></i><i class=\"xwing-miniatures-font xwing-miniatures-font-recurring\"></i>\n</div>");
        } else {
          chargeHTML = $.trim("<div class=\"upgrade-charge\">\n    <span class=\"info-data info-charge\">" + this.data.charge + "</span>\n    <i class=\"xwing-miniatures-font xwing-miniatures-font-charge\"></i>\n</div>");
        }
      } else {
        chargeHTML = $.trim('');
      }
      if ((this.data.force != null)) {
        forceHTML = $.trim("<div class=\"upgrade-force\">\n    <span class=\"info-data info-force\">" + this.data.force + "</span>\n    <i class=\"xwing-miniatures-font xwing-miniatures-font-forcecharge\"></i><i class=\"xwing-miniatures-font xwing-miniatures-font-recurring\"></i>\n</div>");
      } else {
        forceHTML = $.trim('');
      }
      return $.trim("<div class=\"upgrade-container\">\n    <div class=\"upgrade-stats\">\n        <div class=\"upgrade-name\"><i class=\"xwing-miniatures-font xwing-miniatures-font-" + upgrade_slot_font + "\"></i>" + this.data.name + "</div>\n        <div class=\"mask\">\n            <div class=\"outer-circle\">\n                <div class=\"inner-circle upgrade-points\">" + points + "</div>\n            </div>\n        </div>\n        " + restriction_html + "\n    </div>\n    " + attackHTML + "\n    " + chargeHTML + "\n    " + forceHTML + "\n    <div class=\"upgrade-text\">" + text_str + "</div>\n    <div style=\"clear: both;\"></div>\n</div>");
    } else {
      return '';
    }
  };

  GenericAddon.prototype.toTableRow = function(points) {
    if (this.data != null) {
      return $.trim("<tr class=\"simple-addon\">\n    <td class=\"name\">" + this.data.name + "</td>\n    <td class=\"points\">" + points + "</td>\n</tr>");
    } else {
      return '';
    }
  };

  GenericAddon.prototype.toRedditText = function(points) {
    if (this.data != null) {
      return "*&nbsp;" + this.data.name + " (" + points + ")*    \n";
    } else {
      return null;
    }
  };

  GenericAddon.prototype.toBBCode = function(points) {
    if (this.data != null) {
      return "[i]" + this.data.name + " (" + points + ")[/i]";
    } else {
      return null;
    }
  };

  GenericAddon.prototype.toSimpleHTML = function(points) {
    if (this.data != null) {
      return "<i>" + this.data.name + " (" + points + ")</i><br />";
    } else {
      return '';
    }
  };

  GenericAddon.prototype.toSerialized = function() {
    var _ref, _ref1;
    return "" + this.serialization_code + "." + ((_ref = (_ref1 = this.data) != null ? _ref1.id : void 0) != null ? _ref : -1);
  };

  GenericAddon.prototype.unequipOtherUpgrades = function() {
    var modification, slot, upgrade, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _results;
    _ref2 = (_ref = (_ref1 = this.data) != null ? _ref1.unequips_upgrades : void 0) != null ? _ref : [];
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      slot = _ref2[_i];
      _ref3 = this.ship.upgrades;
      for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
        upgrade = _ref3[_j];
        if (upgrade.slot !== slot || upgrade === this || !upgrade.isOccupied()) {
          continue;
        }
        upgrade.setData(null);
        break;
      }
    }
    if ((_ref4 = this.data) != null ? _ref4.unequips_modifications : void 0) {
      _ref5 = this.ship.modifications;
      _results = [];
      for (_k = 0, _len2 = _ref5.length; _k < _len2; _k++) {
        modification = _ref5[_k];
        if (!(modification === this || modification.isOccupied())) {
          continue;
        }
        _results.push(modification.setData(null));
      }
      return _results;
    }
  };

  GenericAddon.prototype.isOccupied = function() {
    return (this.data != null) || (this.occupied_by != null);
  };

  GenericAddon.prototype.occupyOtherUpgrades = function() {
    var modification, slot, upgrade, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _results;
    _ref2 = (_ref = (_ref1 = this.data) != null ? _ref1.also_occupies_upgrades : void 0) != null ? _ref : [];
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      slot = _ref2[_i];
      _ref3 = this.ship.upgrades;
      for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
        upgrade = _ref3[_j];
        if (upgrade.slot !== slot || upgrade === this || upgrade.isOccupied()) {
          continue;
        }
        this.occupy(upgrade);
        break;
      }
    }
    if ((_ref4 = this.data) != null ? _ref4.also_occupies_modifications : void 0) {
      _ref5 = this.ship.modifications;
      _results = [];
      for (_k = 0, _len2 = _ref5.length; _k < _len2; _k++) {
        modification = _ref5[_k];
        if (modification === this || modification.isOccupied()) {
          continue;
        }
        _results.push(this.occupy(modification));
      }
      return _results;
    }
  };

  GenericAddon.prototype.deoccupyOtherUpgrades = function() {
    var upgrade, _i, _len, _ref, _results;
    _ref = this.occupying;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      upgrade = _ref[_i];
      _results.push(this.deoccupy(upgrade));
    }
    return _results;
  };

  GenericAddon.prototype.occupy = function(upgrade) {
    upgrade.occupied_by = this;
    upgrade.selector.select2('enable', false);
    return this.occupying.push(upgrade);
  };

  GenericAddon.prototype.deoccupy = function(upgrade) {
    upgrade.occupied_by = null;
    return upgrade.selector.select2('enable', true);
  };

  GenericAddon.prototype.occupiesAnotherUpgradeSlot = function() {
    var upgrade, _i, _len, _ref;
    _ref = this.ship.upgrades;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      upgrade = _ref[_i];
      if (upgrade.slot !== this.slot || upgrade === this || (upgrade.data != null)) {
        continue;
      }
      if ((upgrade.occupied_by != null) && upgrade.occupied_by === this) {
        return true;
      }
    }
    return false;
  };

  GenericAddon.prototype.toXWS = function(upgrade_dict) {
    var upgrade_type, _ref;
    upgrade_type = (function() {
      var _ref, _ref1;
      switch (this.type) {
        case 'Upgrade':
          return (_ref = exportObj.toXWSUpgrade[this.slot]) != null ? _ref : this.slot.canonicalize();
        default:
          return (_ref1 = exportObj.toXWSUpgrade[this.type]) != null ? _ref1 : this.type.canonicalize();
      }
    }).call(this);
    return (upgrade_dict[upgrade_type] != null ? upgrade_dict[upgrade_type] : upgrade_dict[upgrade_type] = []).push((_ref = this.data.xws) != null ? _ref : this.data.canonical_name);
  };

  return GenericAddon;

})();

exportObj.Upgrade = (function(_super) {
  __extends(Upgrade, _super);

  function Upgrade(args) {
    Upgrade.__super__.constructor.call(this, args);
    this.slot = args.slot;
    this.type = 'Upgrade';
    this.dataById = exportObj.upgradesById;
    this.dataByName = exportObj.upgradesByLocalizedName;
    this.serialization_code = 'U';
    this.setupSelector();
  }

  Upgrade.prototype.setupSelector = function() {
    return Upgrade.__super__.setupSelector.call(this, {
      width: '50%',
      placeholder: this.placeholderMod_func(exportObj.translate(this.ship.builder.language, 'ui', 'upgradePlaceholder', this.slot)),
      allowClear: true,
      query: (function(_this) {
        return function(query) {
          _this.ship.builder.checkCollection();
          return query.callback({
            more: false,
            results: _this.ship.builder.getAvailableUpgradesIncluding(_this.slot, _this.data, _this.ship, _this, query.term, _this.filter_func)
          });
        };
      })(this)
    });
  };

  return Upgrade;

})(GenericAddon);

exportObj.Title = (function(_super) {
  __extends(Title, _super);

  function Title(args) {
    Title.__super__.constructor.call(this, args);
    this.type = 'Title';
    this.dataById = exportObj.titlesById;
    this.dataByName = exportObj.titlesByLocalizedName;
    this.serialization_code = 'T';
    this.setupSelector();
  }

  Title.prototype.setupSelector = function() {
    return Title.__super__.setupSelector.call(this, {
      width: '50%',
      placeholder: this.placeholderMod_func(exportObj.translate(this.ship.builder.language, 'ui', 'titlePlaceholder')),
      allowClear: true,
      query: (function(_this) {
        return function(query) {
          _this.ship.builder.checkCollection();
          return query.callback({
            more: false,
            results: _this.ship.builder.getAvailableTitlesIncluding(_this.ship, _this.data, query.term)
          });
        };
      })(this)
    });
  };

  return Title;

})(GenericAddon);

exportObj.RestrictedUpgrade = (function(_super) {
  __extends(RestrictedUpgrade, _super);

  function RestrictedUpgrade(args) {
    this.filter_func = args.filter_func;
    RestrictedUpgrade.__super__.constructor.call(this, args);
    this.serialization_code = 'u';
    if (args.auto_equip != null) {
      this.setById(args.auto_equip);
    }
  }

  return RestrictedUpgrade;

})(exportObj.Upgrade);

SERIALIZATION_CODE_TO_CLASS = {
  'M': exportObj.Modification,
  'T': exportObj.Title,
  'U': exportObj.Upgrade,
  'u': exportObj.RestrictedUpgrade,
  'm': exportObj.RestrictedModification
};

exportObj = typeof exports !== "undefined" && exports !== null ? exports : this;

exportObj.fromXWSFaction = {
  'rebelalliance': 'Rebel Alliance',
  'rebels': 'Rebel Alliance',
  'galacticempire': 'Galactic Empire',
  'imperial': 'Galactic Empire',
  'scumandvillainy': 'Scum and Villainy',
  'firstorder': 'First Order',
  'resistance': 'Resistance'
};

exportObj.toXWSFaction = {
  'Rebel Alliance': 'rebelalliance',
  'Galactic Empire': 'galacticempire',
  'Scum and Villainy': 'scumandvillainy',
  'First Order': 'firstorder',
  'Resistance': 'resistance'
};

exportObj.toXWSUpgrade = {
  'Astromech': 'amd',
  'Talent': 'ept',
  'Modification': 'mod'
};

exportObj.fromXWSUpgrade = {
  'amd': 'Astromech',
  'astromechdroid': 'Astromech',
  'ept': 'Talent',
  'elitepilottalent': 'Talent',
  'system': 'Sensor',
  'mod': 'Modification'
};

SPEC_URL = 'https://github.com/elistevens/xws-spec';

exportObj.XWSManager = (function() {
  function XWSManager(args) {
    this.container = $(args.container);
    this.setupUI();
    this.setupHandlers();
  }

  XWSManager.prototype.setupUI = function() {
    this.container.addClass('hidden-print');
    this.container.html($.trim("<div class=\"row-fluid\">\n    <div class=\"span9 indent\">\n        <button class=\"btn btn-primary from-xws\">Import from XWS (beta)</button>\n        <button class=\"btn btn-primary to-xws\">Export to XWS (beta)</button>\n    </div>\n</div>"));
    this.xws_export_modal = $(document.createElement('DIV'));
    this.xws_export_modal.addClass('modal hide fade xws-modal hidden-print');
    this.container.append(this.xws_export_modal);
    this.xws_export_modal.append($.trim("<div class=\"modal-header\">\n    <button type=\"button\" class=\"close hidden-print\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button>\n    <h3>XWS Export (Beta!)</h3>\n</div>\n<div class=\"modal-body\">\n    <ul class=\"nav nav-pills\">\n        <li><a id=\"xws-text-tab\" href=\"#xws-text\" data-toggle=\"tab\">Text</a></li>\n        <li><a id=\"xws-qrcode-tab\" href=\"#xws-qrcode\" data-toggle=\"tab\">QR Code</a></li>\n    </ul>\n    <div class=\"tab-content\">\n        <div class=\"tab-pane\" id=\"xws-text\">\n            Copy and paste this into an XWS-compliant application to transfer your list.\n            <i>(This is in beta, and the <a href=\"" + SPEC_URL + "\">spec</a> is still being defined, so it may not work!)</i>\n            <div class=\"container-fluid\">\n                <textarea class=\"xws-content\"></textarea>\n            </div>\n        </div>\n        <div class=\"tab-pane\" id=\"xws-qrcode\">\n            Below is a QR Code of XWS.  <i>This is still very experimental!</i>\n            <div id=\"xws-qrcode-container\"></div>\n        </div>\n    </div>\n</div>\n<div class=\"modal-footer hidden-print\">\n    <button class=\"btn\" data-dismiss=\"modal\" aria-hidden=\"true\">Close</button>\n</div>"));
    this.xws_import_modal = $(document.createElement('DIV'));
    this.xws_import_modal.addClass('modal hide fade xws-modal hidden-print');
    this.container.append(this.xws_import_modal);
    return this.xws_import_modal.append($.trim("<div class=\"modal-header\">\n    <button type=\"button\" class=\"close hidden-print\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button>\n    <h3>XWS Import (Beta!)</h3>\n</div>\n<div class=\"modal-body\">\n    Paste XWS here to load a list exported from another application.\n    <i>(This is in beta, and the <a href=\"" + SPEC_URL + "\">spec</a> is still being defined, so it may not work!)</i>\n    <div class=\"container-fluid\">\n        <textarea class=\"xws-content\" placeholder=\"Paste XWS here...\"></textarea>\n    </div>\n</div>\n<div class=\"modal-footer hidden-print\">\n    <span class=\"xws-import-status\"></span>&nbsp;\n    <button class=\"btn btn-primary import-xws\">Import It!</button>\n    <button class=\"btn\" data-dismiss=\"modal\" aria-hidden=\"true\">Close</button>\n</div>"));
  };

  XWSManager.prototype.setupHandlers = function() {
    this.from_xws_button = this.container.find('button.from-xws');
    this.from_xws_button.click((function(_this) {
      return function(e) {
        e.preventDefault();
        return _this.xws_import_modal.modal('show');
      };
    })(this));
    this.to_xws_button = this.container.find('button.to-xws');
    this.to_xws_button.click((function(_this) {
      return function(e) {
        e.preventDefault();
        return $(window).trigger('xwing:pingActiveBuilder', function(builder) {
          var textarea;
          textarea = $(_this.xws_export_modal.find('.xws-content'));
          textarea.attr('readonly');
          textarea.val(JSON.stringify(builder.toXWS()));
          $('#xws-qrcode-container').text('');
          $('#xws-qrcode-container').qrcode({
            render: 'canvas',
            text: JSON.stringify(builder.toMinimalXWS()),
            ec: 'L',
            size: 256
          });
          _this.xws_export_modal.modal('show');
          $('#xws-text-tab').tab('show');
          textarea.select();
          return textarea.focus();
        });
      };
    })(this));
    $('#xws-qrcode-container').click(function(e) {
      return window.open($('#xws-qrcode-container canvas')[0].toDataURL());
    });
    this.load_xws_button = $(this.xws_import_modal.find('button.import-xws'));
    return this.load_xws_button.click((function(_this) {
      return function(e) {
        var import_status;
        e.preventDefault();
        import_status = $(_this.xws_import_modal.find('.xws-import-status'));
        import_status.text('Loading...');
        return (function(import_status) {
          var xws;
          try {
            xws = JSON.parse(_this.xws_import_modal.find('.xws-content').val());
          } catch (_error) {
            e = _error;
            import_status.text('Invalid JSON');
            return;
          }
          return (function(xws) {
            return $(window).trigger('xwing:activateBuilder', [
              exportObj.fromXWSFaction[xws.faction], function(builder) {
                if (builder.current_squad.dirty && (builder.backend != null)) {
                  _this.xws_import_modal.modal('hide');
                  return builder.backend.warnUnsaved(builder, function() {
                    return builder.loadFromXWS(xws, function(res) {
                      if (!res.success) {
                        _this.xws_import_modal.modal('show');
                        return import_status.text(res.error);
                      }
                    });
                  });
                } else {
                  return builder.loadFromXWS(xws, function(res) {
                    if (res.success) {
                      return _this.xws_import_modal.modal('hide');
                    } else {
                      return import_status.text(res.error);
                    }
                  });
                }
              }
            ]);
          })(xws);
        })(import_status);
      };
    })(this));
  };

  return XWSManager;

})();

/*
//@ sourceMappingURL=xwing.js.map
*/