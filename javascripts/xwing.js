
/*
    X-Wing Squad Builder 2.0
    Stephen Kim <raithos@gmail.com>
    https://raithos.github.io
 */
var DFL_LANGUAGE, GenericAddon, SERIALIZATION_CODE_TO_CLASS, SHOW_DEBUG_OUT_MISSING_TRANSLATIONS, SPEC_URL, SQUAD_DISPLAY_NAME_MAX_LENGTH, SQUAD_TO_XWS_URL, Ship, TYPES, URL_BASE, all, builders, byName, byPoints, conditionToHTML, exportObj, getPrimaryFaction, statAndEffectiveStat,
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
        icon: 'fab fa-google',
        text: 'Google'
      },
      facebook: {
        icon: 'fab fa-facebook',
        text: 'Facebook'
      },
      twitter: {
        icon: 'fab fa-twitter',
        text: 'Twitter'
      },
      discord: {
        icon: 'fab fa-discord',
        text: 'Discord'
      }
    };
    this.squad_display_mode = 'all';
    this.show_archived = false;
    this.collection_save_timer = null;
    this.setupHandlers();
    this.setupUI();
    this.authenticate((function(_this) {
      return function() {
        _this.auth_status.hide();
        return _this.login_logout_button.removeClass('d-none');
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

  SquadBuilderBackend.prototype.archive = function(data, faction, cb) {
    data.additional_data["archived"] = true;
    return this.save(data.serialized, data.id, data.name, faction, data.additional_data, cb);
  };

  SquadBuilderBackend.prototype.list = function(builder) {
    var list_ul, loading_pane, tag_list, url;
    this.squad_list_modal.find('.modal-header .squad-list-header-placeholder').text(exportObj.translate('ui', "yourXYsquads", builder.faction));
    list_ul = $(this.squad_list_modal.find('ul.squad-list'));
    list_ul.text('');
    list_ul.hide();
    loading_pane = $(this.squad_list_modal.find('p.squad-list-loading'));
    loading_pane.show();
    this.show_all_squads_button.click();
    this.squad_list_modal.modal('show');
    this.number_of_selected_squads_to_be_deleted = 0;
    tag_list = [];
    url = "" + this.server + "/squads/list";
    return $.get(url, (function(_this) {
      return function(data, textStatus, jqXHR) {
        var hasNotArchivedSquads, li, squad, tag, tag_array, tag_button, tag_entry, tagclean, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6;
        hasNotArchivedSquads = false;
        _ref = data[builder.faction];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          squad = _ref[_i];
          li = $(document.createElement('LI'));
          li.addClass('squad-summary');
          li.data('squad', squad);
          li.data('builder', builder);
          li.data('selectedForDeletion', false);
          list_ul.append(li);
          if ((((_ref1 = squad.additional_data) != null ? _ref1.tag : void 0) != null) && (((_ref2 = squad.additional_data) != null ? _ref2.tag : void 0) !== "") && (tag_list.indexOf(squad.additional_data.tag) === -1)) {
            tag_array = (_ref3 = squad.additional_data) != null ? _ref3.tag.split(",") : void 0;
            for (_j = 0, _len1 = tag_array.length; _j < _len1; _j++) {
              tag_entry = tag_array[_j];
              tag_list.push(tag_entry);
            }
          }
          if (((_ref4 = squad.additional_data) != null ? _ref4.archived : void 0) != null) {
            li.hide();
          } else {
            hasNotArchivedSquads = true;
          }
          li.append($.trim("<div class=\"row\">\n    <div class=\"col-md-9\">\n        <h4>" + squad.name + "</h4>\n    </div>\n    <div class=\"col-md-3\">\n        <h5>" + ((_ref5 = squad.additional_data) != null ? _ref5.points : void 0) + " " + (exportObj.translate('ui', "Points")) + "</h5>\n    </div>\n</div>\n<div class=\"row squad-description\">\n    <div class=\"col-md-9\">\n        " + ((_ref6 = squad.additional_data) != null ? _ref6.description : void 0) + "\n    </div>\n    <div class=\"squad-buttons col-md-3\">\n        <button class=\"btn btn-modal convert-squad\"><i class=\"xwing-miniatures-font xwing-miniatures-font-first-player-1\"></i></button>\n        &nbsp;\n        <button class=\"btn btn-modal load-squad\"><i class=\"fa fa-download\"></i></button>\n        &nbsp;\n        <button class=\"btn btn-danger delete-squad\"><i class=\"fa fa-times\"></i></button>\n    </div>\n</div>\n<div class=\"row squad-convert-confirm\">\n    <div class=\"col-md-9 translated\" defaultText=\"Convert to Extended?\">\n    </div>\n    <div class=\"squad-buttons col-md-3\">\n        <button class=\"btn btn-danger confirm-convert-squad translated\" defaultText=\"Convert\"></button>\n        &nbsp;\n        <button class=\"btn btn-modal cancel-convert-squad translated\" defaultText=\"Cancel\"></button>\n    </div>\n</div>\n<div class=\"row squad-delete-confirm\">\n    <div class=\"col-md-9\">\n        " + (exportObj.translate('ui', 'reallyDeleteSquadXY', "<em>" + squad.name + "</em>")) + "\n    </div>\n    <div class=\"col-md-3\">\n        <button class=\"btn btn-danger confirm-delete-squad translated\" defaultText=\"Delete\"></button>\n        &nbsp;\n        <button class=\"btn btn-modal cancel-delete-squad translated\" defaultText=\"Cancel\"></button>\n    </div>\n</div>"));
          li.find('.squad-convert-confirm').hide();
          li.find('.squad-delete-confirm').hide();
          if (squad.serialized.search(/v\d+Zh/) === -1) {
            li.find('button.convert-squad').hide();
          }
          li.find('button.convert-squad').click(function(e) {
            var button;
            e.preventDefault();
            button = $(e.target);
            li = button.closest('li');
            builder = li.data('builder');
            li.data('selectedToConvert', true);
            return (function(li) {
              return li.find('.squad-description').fadeOut('fast', function() {
                return li.find('.squad-convert-confirm').fadeIn('fast');
              });
            })(li);
          });
          li.find('button.cancel-convert-squad').click(function(e) {
            var button;
            e.preventDefault();
            button = $(e.target);
            li = button.closest('li');
            builder = li.data('builder');
            li.data('selectedToConvert', false);
            return (function(li) {
              return li.find('.squad-convert-confirm').fadeOut('fast', function() {
                return li.find('.squad-description').fadeIn('fast');
              });
            })(li);
          });
          li.find('button.confirm-convert-squad').click(function(e) {
            var button, new_serialized;
            e.preventDefault();
            button = $(e.target);
            li = button.closest('li');
            builder = li.data('builder');
            li.find('.cancel-convert-squad').fadeOut('fast');
            li.find('.confirm-convert-squad').addClass('disabled');
            li.find('.confirm-convert-squad').text('Converting...');
            new_serialized = li.data('squad').serialized.replace('Zh', 'Zs');
            return _this.save(new_serialized, li.data('squad').id, li.data('squad').name, li.data('builder').faction, li.data('squad').additional_data, function(results) {
              if (results.success) {
                li.data('squad').serialized = new_serialized;
                return li.find('.squad-convert-confirm').fadeOut('fast', function() {
                  li.find('.squad-description').fadeIn('fast');
                  return li.find('button.convert-squad').fadeOut('fast');
                });
              } else {
                return li.html($.trim("Error converting " + (li.data('squad').name) + ": <em>" + results.error + "</em>"));
              }
            });
          });
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
            li.data('selectedForDeletion', true);
            (function(li) {
              li.find('.squad-description').fadeOut('fast', function() {
                return li.find('.squad-delete-confirm').fadeIn('fast');
              });
              if (!_this.number_of_selected_squads_to_be_deleted) {
                return _this.squad_list_modal.find('div.delete-multiple-squads').show();
              }
            })(li);
            return _this.number_of_selected_squads_to_be_deleted += 1;
          });
          li.find('button.cancel-delete-squad').click(function(e) {
            var button;
            e.preventDefault();
            button = $(e.target);
            li = button.closest('li');
            builder = li.data('builder');
            li.data('selectedForDeletion', false);
            _this.number_of_selected_squads_to_be_deleted -= 1;
            return (function(li) {
              li.find('.squad-delete-confirm').fadeOut('fast', function() {
                return li.find('.squad-description').fadeIn('fast');
              });
              if (!_this.number_of_selected_squads_to_be_deleted) {
                return _this.squad_list_modal.find('div.delete-multiple-squads').hide();
              }
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
                li.slideUp('fast', function() {
                  return $(li).remove();
                });
                _this.number_of_selected_squads_to_be_deleted -= 1;
                if (!_this.number_of_selected_squads_to_be_deleted) {
                  return _this.squad_list_modal.find('div.delete-multiple-squads').hide();
                }
              } else {
                return li.html($.trim("Error deleting " + (li.data('squad').name) + ": <em>" + results.error + "</em>"));
              }
            });
          });
        }
        if (!hasNotArchivedSquads) {
          list_ul.append($.trim("<li class=\"translated\" defaultText=\"No saved squads\"></li>"));
        }
        _this.squad_list_tags.empty();
        for (_k = 0, _len2 = tag_list.length; _k < _len2; _k++) {
          tag = tag_list[_k];
          tagclean = tag.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/\s+/g, '-');
          _this.squad_list_tags.append($.trim(" \n<button class=\"btn " + tagclean + "\">" + tag + "</button>"));
          tag_button = $(_this.squad_list_tags.find("." + tagclean));
          tag_button.click(function(e) {
            var button, buttontag;
            button = $(e.target);
            buttontag = button.attr('class').replace('btn ', '');
            _this.squad_list_modal.find('.squad-display-mode .btn').removeClass('btn-inverse');
            _this.squad_list_tags.find('.btn').removeClass('btn-inverse');
            button.addClass('btn-inverse');
            return _this.squad_list_modal.find('.squad-list li').each(function(idx, elem) {
              var found_tag, _l, _len3;
              if ($(elem).data().squad.additional_data.tag != null) {
                tag_array = $(elem).data().squad.additional_data.tag.split(",");
                found_tag = false;
                for (_l = 0, _len3 = tag_array.length; _l < _len3; _l++) {
                  tag = tag_array[_l];
                  if (buttontag === tag.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/\s+/g, '-')) {
                    found_tag = true;
                  }
                }
                if (found_tag) {
                  return $(elem).show();
                } else {
                  return $(elem).hide();
                }
              } else {
                return $(elem).hide();
              }
            });
          });
        }
        exportObj.translateUIElements(list_ul);
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
    $(this.auth_status.find('.payload')).text(exportObj.translate('ui', 'Checking auth status...'));
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
    $(this.auth_status.find('.payload')).text(exportObj.translate('ui', 'Logging out...'));
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
      return this.name_availability_container.append($.trim("<i class=\"fa fa-thumbs-down\"></i> " + (exportObj.translate('ui', "name required"))));
    } else {
      return $.post("" + this.server + "/squads/namecheck", {
        name: name
      }, (function(_this) {
        return function(data) {
          _this.name_availability_container.text('');
          if (data.available) {
            _this.name_availability_container.append($.trim("<i class=\"fa fa-thumbs-up\"></i> " + (exportObj.translate('ui', "Name is available"))));
            return _this.save_as_save_button.removeClass('disabled');
          } else {
            _this.name_availability_container.append($.trim("<i class=\"fa fa-thumbs-down\"></i> " + (exportObj.translate('ui', "Name in use"))));
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
    this.login_modal.addClass('modal fade d-print-none');
    this.login_modal.tabindex = "-1";
    this.login_modal.role = "dialog";
    $(document.body).append(this.login_modal);
    this.login_modal.append($.trim("<div class=\"modal-dialog modal-dialog-centered\" role=\"document\">\n    <div class=\"modal-content\">\n        <div class=\"modal-header\">\n            <h3 class=\"translated\" defaultText=\"Log in with OAuth\"></h3>\n            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button>\n        </div>\n        <div class=\"modal-body\">\n            <p>\n                <span class=\"translated\" defaultText=\"select OAuth provider\"></span>\n                <a class=\"login-help translated\" href=\"#\" defaultText=\"What's this?\"></a>\n            </p>\n            <div class=\"well well-small oauth-explanation\">\n                <span class=\"translated\" defaultText=\"OAuth explanation\"></span>\n                <button class=\"btn btn-modal translated\" defaultText=\"Got it!\"></button>\n            </div>\n            <ul class=\"login-providers inline\"></ul>\n            <p class=\"translated\" defaultText=\"Continue to OAuth provider\"></p>\n            <p class=\"translated\" defaultText=\"iOS requires cross-site control\"></p>\n            <p class=\"login-in-progress\">\n                <em class=\"translated\" defaultText=\"login in progress\"></em>\n            </p>\n        </div>\n    </div>\n</div>"));
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
          a.addClass('btn btn-modal');
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
    exportObj.translateUIElements(this.login_modal);
    this.reload_done_modal = $(document.createElement('DIV'));
    this.reload_done_modal.addClass('modal fade d-print-none');
    this.reload_done_modal.tabindex = "-1";
    this.reload_done_modal.role = "dialog";
    $(document.body).append(this.reload_done_modal);
    this.reload_done_modal.append($.trim("<div class=\"modal-dialog modal-dialog-centered\" role=\"document\">\n    <div class=\"modal-content\">\n        <div class=\"modal-header\">\n            <h3>Reload Done</h3>\n            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button>\n        </div>\n        <div class=\"modal-body\">\n            <p class=\"translated\" defaultText=\"Squads reloaded\"></p>\n        </div>\n        <div class=\"modal-footer\">\n            <button class=\"btn btn-modal btn-primary translated\" aria-hidden=\"true\" data-dismiss=\"modal\" defaultText=\"Well done!\"></button>\n        </div>\n    </div>\n</div>"));
    exportObj.translateUIElements(this.reload_done_modal);
    this.squad_list_modal = $(document.createElement('DIV'));
    this.squad_list_modal.addClass('modal fade d-print-none squad-list');
    this.squad_list_modal.tabindex = "-1";
    this.squad_list_modal.role = "dialog";
    $(document.body).append(this.squad_list_modal);
    this.squad_list_modal.append($.trim("<div class=\"modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered\" role=\"document\">\n    <div class=\"modal-content\">\n        <div class=\"modal-header\">\n            <h3 class=\"squad-list-header-placeholder d-none d-lg-block\"></h3>\n            <h4 class=\"squad-list-header-placeholder d-lg-none\"></h4>\n            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button>\n        </div>\n        <div class=\"modal-body\">\n            <ul class=\"squad-list\"></ul>\n            <p class=\"pagination-centered squad-list-loading\">\n                <i class=\"fa fa-spinner fa-spin fa-3x\"></i>\n                <br />\n                <span class=\"translated\" defaultText=\"Fetching squads...\"></span>\n            </p>\n        </div>\n        <div class=\"modal-footer\">\n            <div class=\"btn-group delete-multiple-squads full-row\">\n                <button class=\"btn btn-modal select-all translated\" defaultText=\"Select All\"></button>\n                <button class=\"btn btn-modal archive-selected translated\" defaultText=\"Archive Selected\"></button>\n                <button class=\"btn btn-modal btn-danger delete-selected translated\" defaultText=\"Delete Selected\"></button>\n            </div>\n            <div class=\"btn-group squad-display-mode full-row\">\n                <button class=\"btn btn-modal btn-inverse show-all-squads translated\" defaultText=\"All\"></button>\n                <button class=\"btn btn-modal show-extended-squads\"><span class=\"d-none d-lg-block translated\" defaultText=\"Extended\"></span><span class=\"d-lg-none translated\" defaultText=\"Ext\"></span></button>\n                <button class=\"btn btn-modal show-hyperspace-squads\"><span class=\"d-none d-lg-block translated\" defaultText=\"Hyperspace\"></span><span class=\"d-lg-none translated\" defaultText=\"Hyper\"></span></button>\n                <button class=\"btn btn-modal show-quickbuild-squads\"><span class=\"d-none d-lg-block translated\" defaultText=\"Quickbuild\"></span><span class=\"d-lg-none translated\" defaultText=\"QB\"></span></button>\n                <button class=\"btn btn-modal show-epic-squads translated\" defaultText=\"Epic\"></button>\n                <button class=\"btn btn-modal show-archived-squads translated\" defaultText=\"Archived\"></button>\n                <button class=\"btn btn-modal reload-all translated\" defaultText=\"Recalculate Points\"></button>\n            </div>\n            <div class=\"btn-group tags-display full-row\">\n            </div>\n        </div>\n    </div>\n</div>"));
    this.squad_list_modal.find('ul.squad-list').hide();
    this.squad_list_tags = $(this.squad_list_modal.find('div.tags-display'));
    this.squad_list_modal.find('div.delete-multiple-squads').hide();
    exportObj.translateUIElements(this.squad_list_modal);
    this.delete_selected_button = $(this.squad_list_modal.find('button.delete-selected'));
    this.delete_selected_button.click((function(_this) {
      return function(e) {
        var li, ul, _i, _len, _ref, _results;
        ul = _this.squad_list_modal.find('ul.squad-list');
        _ref = ul.find('li');
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          li = _ref[_i];
          li = $(li);
          if (li.data('selectedForDeletion')) {
            _results.push((function(li) {
              li.find('.cancel-delete-squad').fadeOut('fast');
              li.find('.confirm-delete-squad').addClass('disabled');
              li.find('.confirm-delete-squad').text(exportObj.translate('ui', 'Deleting...'));
              return _this["delete"](li.data('squad').id, function(results) {
                if (results.success) {
                  li.slideUp('fast', function() {
                    return $(li).remove();
                  });
                  _this.number_of_selected_squads_to_be_deleted -= 1;
                  if (!_this.number_of_selected_squads_to_be_deleted) {
                    return _this.squad_list_modal.find('div.delete-multiple-squads').hide();
                  }
                } else {
                  return li.html($.trim("Error deleting " + (li.data('squad').name) + ": <em>" + results.error + "</em>"));
                }
              });
            })(li));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };
    })(this));
    this.archive_selected_button = $(this.squad_list_modal.find('button.archive-selected'));
    this.archive_selected_button.click((function(_this) {
      return function(e) {
        var li, ul, _i, _len, _ref, _results;
        ul = _this.squad_list_modal.find('ul.squad-list');
        _ref = ul.find('li');
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          li = _ref[_i];
          li = $(li);
          if (li.data('selectedForDeletion')) {
            _results.push((function(li) {
              li.find('.confirm-delete-squad').addClass('disabled');
              li.find('.confirm-delete-squad').text(exportObj.translate('ui', 'Archiving...'));
              return _this.archive(li.data('squad'), li.data('builder').faction, function(results) {
                if (results.success) {
                  li.slideUp('fast', function() {
                    $(li).hide();
                    $(li).find('.confirm-delete-squad').removeClass('disabled');
                    $(li).find('.confirm-delete-squad').text(exportObj.translate('ui', 'Delete'));
                    $(li).data('selectedForDeletion', false);
                    return $(li).find('.squad-delete-confirm').fadeOut('fast', function() {
                      return $(li).find('.squad-description').fadeIn('fast');
                    });
                  });
                  _this.number_of_selected_squads_to_be_deleted -= 1;
                  if (!_this.number_of_selected_squads_to_be_deleted) {
                    return _this.squad_list_modal.find('div.delete-multiple-squads').hide();
                  }
                } else {
                  return li.html($.trim("Error archiving " + (li.data('squad').name) + ": <em>" + results.error + "</em>"));
                }
              });
            })(li));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };
    })(this));
    this.squad_list_modal.find('button.reload-all').click((function(_this) {
      return function(e) {
        var builder, li, squadDataStack, squadProcessingStack, ul, _i, _len, _ref;
        ul = _this.squad_list_modal.find('ul.squad-list');
        squadProcessingStack = [
          function() {
            return _this.reload_done_modal.modal('show');
          }
        ];
        squadDataStack = [];
        _ref = ul.find('li');
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          li = _ref[_i];
          li = $(li);
          squadDataStack.push(li.data('squad'));
          builder = li.data('builder');
          squadProcessingStack.push(function() {
            var sqd;
            sqd = squadDataStack.pop();
            return builder.container.trigger('xwing-backend:squadLoadRequested', [
              sqd, function() {
                var additional_data;
                additional_data = {
                  points: builder.total_points,
                  description: builder.describeSquad(),
                  cards: builder.listCards(),
                  notes: builder.notes.val().substr(0, 1024),
                  obstacles: builder.getObstacles(),
                  tag: builder.tag.val().substr(0, 1024)
                };
                return _this.save(builder.serialize(), builder.current_squad.id, builder.current_squad.name, builder.faction, additional_data, squadProcessingStack.pop());
              }
            ]);
          });
        }
        _this.squad_list_modal.modal('hide');
        if (builder.current_squad.dirty) {
          return _this.warnUnsaved(builder, squadProcessingStack.pop());
        } else {
          return squadProcessingStack.pop()();
        }
      };
    })(this));
    this.select_all_button = $(this.squad_list_modal.find('button.select-all'));
    this.select_all_button.click((function(_this) {
      return function(e) {
        var li, ul, _i, _len, _ref, _results;
        ul = _this.squad_list_modal.find('ul.squad-list');
        _ref = ul.find('li');
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          li = _ref[_i];
          li = $(li);
          if (!li.data('selectedForDeletion')) {
            li.data('selectedForDeletion', true);
            (function(li) {
              return li.find('.squad-description').fadeOut('fast', function() {
                return li.find('.squad-delete-confirm').fadeIn('fast');
              });
            })(li);
            _results.push(_this.number_of_selected_squads_to_be_deleted += 1);
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };
    })(this));
    this.show_all_squads_button = $(this.squad_list_modal.find('.show-all-squads'));
    this.show_all_squads_button.click((function(_this) {
      return function(e) {
        if (_this.squad_display_mode !== 'all') {
          _this.squad_display_mode = 'all';
          _this.squad_list_modal.find('.squad-display-mode .btn').removeClass('btn-inverse');
          _this.squad_list_tags.find('.btn').removeClass('btn-inverse');
          _this.show_all_squads_button.addClass('btn-inverse');
          return _this.squad_list_modal.find('.squad-list li').show();
        }
      };
    })(this));
    this.show_extended_squads_button = $(this.squad_list_modal.find('.show-extended-squads'));
    this.show_extended_squads_button.click((function(_this) {
      return function(e) {
        if (_this.squad_display_mode !== 'extended') {
          _this.squad_display_mode = 'extended';
          _this.squad_list_modal.find('.squad-display-mode .btn').removeClass('btn-inverse');
          _this.squad_list_tags.find('.btn').removeClass('btn-inverse');
          _this.show_extended_squads_button.addClass('btn-inverse');
          return _this.squad_list_modal.find('.squad-list li').each(function(idx, elem) {
            return $(elem).toggle($(elem).data().squad.serialized.search(/v\d+Zs/) !== -1);
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
          _this.squad_list_tags.find('.btn').removeClass('btn-inverse');
          _this.show_epic_squads_button.addClass('btn-inverse');
          return _this.squad_list_modal.find('.squad-list li').each(function(idx, elem) {
            return $(elem).toggle($(elem).data().squad.serialized.search(/v\d+Ze/) !== -1);
          });
        }
      };
    })(this));
    this.show_hyperspace_squads_button = $(this.squad_list_modal.find('.show-hyperspace-squads'));
    this.show_hyperspace_squads_button.click((function(_this) {
      return function(e) {
        if (_this.squad_display_mode !== 'hyperspace') {
          _this.squad_display_mode = 'hyperspace';
          _this.squad_list_modal.find('.squad-display-mode .btn').removeClass('btn-inverse');
          _this.squad_list_tags.find('.btn').removeClass('btn-inverse');
          _this.show_hyperspace_squads_button.addClass('btn-inverse');
          return _this.squad_list_modal.find('.squad-list li').each(function(idx, elem) {
            return $(elem).toggle($(elem).data().squad.serialized.search(/v\d+Zh/) !== -1);
          });
        }
      };
    })(this));
    this.show_quickbuild_squads_button = $(this.squad_list_modal.find('.show-quickbuild-squads'));
    this.show_quickbuild_squads_button.click((function(_this) {
      return function(e) {
        if (_this.squad_display_mode !== 'quickbuild') {
          _this.squad_display_mode = 'quickbuild';
          _this.squad_list_modal.find('.squad-display-mode .btn').removeClass('btn-inverse');
          _this.squad_list_tags.find('.btn').removeClass('btn-inverse');
          _this.show_quickbuild_squads_button.addClass('btn-inverse');
          return _this.squad_list_modal.find('.squad-list li').each(function(idx, elem) {
            return $(elem).toggle($(elem).data().squad.serialized.search(/v\d+Zq/) !== -1);
          });
        }
      };
    })(this));
    this.show_archived_squads_button = $(this.squad_list_modal.find('.show-archived-squads'));
    this.show_archived_squads_button.click((function(_this) {
      return function(e) {
        _this.show_archived = !_this.show_archived;
        if (_this.show_archived) {
          _this.show_archived_squads_button.addClass('btn-inverse');
        } else {
          _this.show_archived_squads_button.removeClass('btn-inverse');
        }
        _this.squad_list_tags.find('.btn').removeClass('btn-inverse');
        return _this.squad_list_modal.find('.squad-list li').each(function(idx, elem) {
          return $(elem).toggle(($(elem).data().squad.additional_data.archived != null) === _this.show_archived);
        });
      };
    })(this));
    this.save_as_modal = $(document.createElement('DIV'));
    this.save_as_modal.addClass('modal fade d-print-none');
    this.save_as_modal.tabindex = "-1";
    this.save_as_modal.role = "dialog";
    $(document.body).append(this.save_as_modal);
    this.save_as_modal.append($.trim("<div class=\"modal-dialog modal-dialog-centered\" role=\"document\">\n    <div class=\"modal-content\">\n        <div class=\"modal-header\">\n            <h3 class=\"translated\" defaultText=\"Save Squad As...\"></h3>\n            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button>\n        </div>\n        <div class=\"modal-body\">\n            <label for=\"xw-be-squad-save-as\">\n                <span class=\"translated\" defaultText=\"New Squad Name\"></span>\n                <input id=\"xw-be-squad-save-as\"></input>\n            </label>\n            <span class=\"name-availability\"></span>\n        </div>\n        <div class=\"modal-footer\">\n            <button class=\"btn btn-primary save translated\" aria-hidden=\"true\" defaultText=\"Save\"></button>\n        </div>\n    </div>\n</div>"));
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
            obstacles: builder.getObstacles(),
            tag: builder.getTag()
          };
          builder.backend_save_list_as_button.addClass('disabled');
          builder.backend_status.html($.trim("<i class=\"fa fa-sync fa-spin\"></i>&nbsp;" + (exportObj.translate('ui', 'Saving squad...'))));
          builder.backend_status.show();
          new_name = $.trim(_this.save_as_input.val());
          return _this.save(builder.serialize(), null, new_name, builder.faction, additional_data, function(results) {
            if (results.success) {
              builder.current_squad.id = results.id;
              builder.current_squad.name = new_name;
              builder.current_squad.dirty = false;
              builder.container.trigger('xwing-backend:squadDirtinessChanged');
              builder.container.trigger('xwing-backend:squadNameChanged');
              builder.backend_status.html($.trim("<i class=\"fa fa-check\"></i>&nbsp;" + (exportObj.translate('ui', 'New squad saved successfully.'))));
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
          _this.name_availability_container.append($.trim("<i class=\"fa fa-spin fa-spinner\"></i> " + (exportObj.translate('ui', 'Checking name availability...'))));
          timer = _this.save_as_modal.data('timer');
          if (timer != null) {
            window.clearInterval(timer);
          }
          return _this.save_as_modal.data('timer', window.setInterval(_this.nameCheck, 500));
        }
      };
    })(this));
    this.name_availability_container = $(this.save_as_modal.find('.name-availability'));
    exportObj.translateUIElements(this.squad_list_modal);
    this.delete_modal = $(document.createElement('DIV'));
    this.delete_modal.addClass('modal fade d-print-none');
    this.delete_modal.tabindex = "-1";
    this.delete_modal.role = "dialog";
    $(document.body).append(this.delete_modal);
    this.delete_modal.append($.trim("<div class=\"modal-dialog modal-dialog-centered\" role=\"document\">\n    <div class=\"modal-content\">\n        <div class=\"modal-header\">\n            <h3><span class=\"translated\" defaultText=\"Really Delete\"></span> <span class=\"squad-name-placeholder\"></span>?</h3>\n            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button>\n        </div>\n        <div class=\"modal-body\">\n            <p class=\"translated\" defaultText=\"Sure to delete?\"></p>\n        </div>\n        <div class=\"modal-footer\">\n            <button class=\"btn btn-danger delete\" aria-hidden=\"true\"><span class=\"translated\" defaultText=\"Yes, Delete\"></span> <i class=\"squad-name-placeholder\"></i></button>\n            <button class=\"btn btn-modal translated\" data-dismiss=\"modal\" aria-hidden=\"true\" defaultText=\"Never Mind\"></button>\n        </div>\n    </div>\n</div>"));
    this.delete_name_container = $(this.delete_modal.find('.squad-name-placeholder'));
    this.delete_button = $(this.delete_modal.find('button.delete'));
    this.delete_button.click((function(_this) {
      return function(e) {
        var builder;
        e.preventDefault();
        builder = _this.delete_modal.data('builder');
        builder.backend_status.html($.trim("<i class=\"fa fa-sync fa-spin\"></i>&nbsp;" + (exportObj.translate('ui', "Deleting squad..."))));
        builder.backend_status.show();
        builder.backend_delete_list_button.addClass('disabled');
        _this.delete_modal.modal('hide');
        return _this["delete"](builder.current_squad.id, function(results) {
          if (results.success) {
            builder.resetCurrentSquad();
            builder.current_squad.dirty = true;
            builder.container.trigger('xwing-backend:squadDirtinessChanged');
            return builder.backend_status.html($.trim("<i class=\"fa fa-check\"></i>&nbsp;" + (exportObj.translate('ui', "Squad deleted."))));
          } else {
            builder.backend_status.html($.trim("<i class=\"fa fa-exclamation-circle\"></i>&nbsp;" + results.error));
            return builder.backend_delete_list_button.removeClass('disabled');
          }
        });
      };
    })(this));
    exportObj.translateUIElements(this.delete_modal);
    this.unsaved_modal = $(document.createElement('DIV'));
    this.unsaved_modal.addClass('modal fade d-print-none');
    this.unsaved_modal.tabindex = "-1";
    this.unsaved_modal.role = "dialog";
    $(document.body).append(this.unsaved_modal);
    this.unsaved_modal.append($.trim("<div class=\"modal-dialog modal-dialog-centered\" role=\"document\">\n    <div class=\"modal-content\">\n        <div class=\"modal-header\">\n            <h3 class=\"translated\" defaultText=\"Unsaved Changes\"></h3>\n            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button>\n        </div>\n        <div class=\"modal-body\">\n            <p class=\"translated\" defaultText=\"Unsaved Changes Warning\"></p>\n        </div>\n        <div class=\"modal-footer\">\n            <button class=\"btn btn-modal btn-primary translated\" aria-hidden=\"true\" data-dismiss=\"modal\" defaultText=\"Go Back\"></button>\n            <button class=\"btn btn-danger discard translated\" aria-hidden=\"true\" defaultText=\"Discard Changes\"></button>\n        </div>\n    </div>\n</div>"));
    this.unsaved_discard_button = $(this.unsaved_modal.find('button.discard'));
    this.unsaved_discard_button.click((function(_this) {
      return function(e) {
        e.preventDefault();
        _this.unsaved_modal.data('builder').current_squad.dirty = false;
        _this.unsaved_modal.data('callback')();
        return _this.unsaved_modal.modal('hide');
      };
    })(this));
    return exportObj.translateUIElements(this.unsaved_modal);
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
    if (cb == null) {
      cb = $.noop;
    }
    if ((settings != null ? settings.language : void 0) != null) {
      return cb(settings.language);
    } else {
      return cb('');
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
    Advanced search by Patrick Mischke
    https://github.com/patschke
 */

exportObj = typeof exports !== "undefined" && exports !== null ? exports : this;

TYPES = ['pilots', 'upgrades', 'ships'];

byName = function(a, b) {
  var a_name, b_name;
  if (a.display_name) {
    a_name = a.display_name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
  } else {
    a_name = a.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
  }
  if (b.display_name) {
    b_name = b.display_name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
  } else {
    b_name = b.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
  }
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
    var _ref;
    this.container = $(args.container);
    this.currently_selected = null;
    this.language = (_ref = exportObj.currentLanguage) != null ? _ref : 'English';
    this.prepareData();
    this.setupUI();
    this.setupHandlers();
  }

  CardBrowser.prototype.setupUI = function() {
    var action, faction, factionless_option, linkedaction, opt, pilot, slot, _i, _j, _len, _len1, _ref, _ref1, _ref2;
    this.container.append($.trim("<div class=\"container-fluid xwing-card-browser\">\n    <div class=\"row\">\n        <div class=\"col-md-4\">\n            <div class=\"card card-search-container\">\n            <h5 class=\"card-title translated\" defaultText=\"Card Search\"></h5>\n                <div class=\"advanced-search-container\">\n                    <div class = \"card search-container general-search-container\">\n                        <h6 class=\"card-subtitle mb-3 text-muted version translated\" defaultText=\"General\"></h6>\n                        <label class = \"text-search advanced-search-label\">\n                        <strong class=\"translated\" defaultText=\"Textsearch:\"></strong>\n                            <input type=\"search\" placeholder=\"" + (exportObj.translate('ui', "Placeholder Textsearch Browser")) + "\" class = \"card-search-text\">\n                        </label>\n                        <div class= \"advanced-search-faction-selection-container\">\n                            <label class = \"advanced-search-label select-available-slots\">\n                                <strong class=\"translated\" defaultText=\"Factions:\"></strong>\n                                <select class=\"advanced-search-selection faction-selection\" multiple=\"1\" data-placeholder=\"" + (exportObj.translate('ui', "All factions")) + "\"></select>\n                            </label>\n                        </div>\n                        <div class = \"advanced-search-point-selection-container\">\n                            <strong class=\"translated\" defaultText=\"Point costs:\"></strong>\n                            <label class = \"advanced-search-label set-minimum-points\">\n                                <span class=\"translated\" defaultText=\"from\"></span> <input type=\"number\" class=\"minimum-point-cost advanced-search-number-input\" value=\"0\" /> \n                            </label>\n                            <label class = \"advanced-search-label set-maximum-points\">\n                                <span class=\"translated\" defaultText=\"to\"></span> <input type=\"number\" class=\"maximum-point-cost advanced-search-number-input\" value=\"200\" /> \n                            </label>\n                        </div>\n                        <div class = \"advanced-search-collection-container\">\n                            <strong class=\"translated\" defaultText=\"Owned copies:\"></strong>\n                            <label class = \"advanced-search-label set-minimum-owned-copies\">\n                                <span class=\"translated\" defaultText=\"from\"></span> <input type=\"number\" class=\"minimum-owned-copies advanced-search-number-input\" value=\"0\" /> \n                            </label>\n                            <label class = \"advanced-search-label set-maximum-owened-copies\">\n                                <span class=\"translated\" defaultText=\"to\"></span> <input type=\"number\" class=\"maximum-owned-copies advanced-search-number-input\" value=\"100\" /> \n                            </label>\n                        </div>\n                        <div class = \"advanced-search-misc-container\">\n                            <strong class=\"translated\" defaultText=\"Misc:\"></strong>\n                            <label class = \"advanced-search-label toggle-unique\">\n                                <input type=\"checkbox\" class=\"unique-checkbox advanced-search-checkbox\" /> <span class=\"translated\" defaultText=\"Is unique\"></span>\n                            </label>\n                            <label class = \"advanced-search-label toggle-non-unique\">\n                                <input type=\"checkbox\" class=\"non-unique-checkbox advanced-search-checkbox\" /> <span class=\"translated\" defaultText=\"Is not unique\"></span>\n                            </label>\n                            <label class = \"advanced-search-label toggle-hyperspace\">\n                                <input type=\"checkbox\" class=\"hyperspace-checkbox advanced-search-checkbox\" />  <span class=\"translated\" defaultText=\"Hyperspace legal\"></span>\n                            </label>\n                        </div>\n                    </div>\n                    <div class = \"card search-container ship-search-container\">\n                        <h6 class=\"card-subtitle mb-3 text-muted version translated\" defaultText=\"Ships and Pilots\"></h6>\n                        <div class = \"advanced-search-slot-available-container\">\n                            <label class = \"advanced-search-label select-available-slots\">\n                                <strong class=\"translated\" defaultText=\"Slots:\"></strong>\n                                <select class=\"advanced-search-selection slot-available-selection\" multiple=\"1\" data-placeholder=\"" + (exportObj.translate('ui', "noXYselected", "slots")) + "\"></select>\n                            </label>\n                            <br />\n                            <label class = \"advanced-search-label toggle-unique\">\n                                <input type=\"checkbox\" class=\"duplicate-slots-checkbox advanced-search-checkbox\" /> " + (exportObj.translate('ui', "Has multiple of the chosen slots")) + "\n                            </label>\n                        </div>\n                        <div class = \"advanced-search-actions-available-container\">\n                            <label class = \"advanced-search-label select-available-actions\">\n                                <strong class=\"translated\" defaultText=\"Actions:\"></strong>\n                                <select class=\"advanced-search-selection action-available-selection\" multiple=\"1\" data-placeholder=\"" + (exportObj.translate('ui', "noXYselected", "actions")) + "\"></select>\n                            </label>\n                        </div>\n                        <div class = \"advanced-search-linkedactions-available-container\">\n                            <label class = \"advanced-search-label select-available-linkedactions\">\n                                <strong class=\"translated\" defaultText=\"Linked actions:\"></strong>\n                                <select class=\"advanced-search-selection linkedaction-available-selection\" multiple=\"1\" data-placeholder=\"" + (exportObj.translate('ui', "noXYselected", "actions")) + "\"></select>\n                            </label>\n                        </div>\n                        <div class = \"advanced-search-ini-container\">\n                            <strong class=\"translated\" defaultText=\"Initiative:\"></strong>\n                            <label class = \"advanced-search-label set-minimum-ini\">\n                                <span class=\"translated\" defaultText=\"from\"></span> <input type=\"number\" class=\"minimum-ini advanced-search-number-input\" value=\"0\" /> \n                            </label>\n                            <label class = \"advanced-search-label set-maximum-ini\">\n                                <span class=\"translated\" defaultText=\"to\"></span> <input type=\"number\" class=\"maximum-ini advanced-search-number-input\" value=\"6\" /> \n                            </label>\n                        </div>\n                        <div class = \"advanced-search-hull-container\">\n                            <strong class=\"translated\" defaultText=\"Hull:\"></strong>\n                            <label class = \"advanced-search-label set-minimum-hull\">\n                                <span class=\"translated\" defaultText=\"from\"></span> <input type=\"number\" class=\"minimum-hull advanced-search-number-input\" value=\"0\" /> \n                            </label>\n                            <label class = \"advanced-search-label set-maximum-hull\">\n                                <span class=\"translated\" defaultText=\"to\"></span> <input type=\"number\" class=\"maximum-hull advanced-search-number-input\" value=\"12\" /> \n                            </label>\n                        </div>\n                        <div class = \"advanced-search-shields-container\">\n                            <strong class=\"translated\" defaultText=\"Shields:\"></strong>\n                            <label class = \"advanced-search-label set-minimum-shields\">\n                                <span class=\"translated\" defaultText=\"from\"></span> <input type=\"number\" class=\"minimum-shields advanced-search-number-input\" value=\"0\" /> \n                            </label>\n                            <label class = \"advanced-search-label set-maximum-shields\">\n                                <span class=\"translated\" defaultText=\"to\"></span> <input type=\"number\" class=\"maximum-shields advanced-search-number-input\" value=\"6\" /> \n                            </label>\n                        </div>\n                        <div class = \"advanced-search-agility-container\">\n                            <strong class=\"translated\" defaultText=\"Agility:\"></strong>\n                            <label class = \"advanced-search-label set-minimum-agility\">\n                                <span class=\"translated\" defaultText=\"from\"></span> <input type=\"number\" class=\"minimum-agility advanced-search-number-input\" value=\"0\" /> \n                            </label>\n                            <label class = \"advanced-search-label set-maximum-agility\">\n                                <span class=\"translated\" defaultText=\"to\"></span> <input type=\"number\" class=\"maximum-agility advanced-search-number-input\" value=\"3\" /> \n                            </label>\n                        </div>\n                        <div class = \"advanced-search-base-size-container\">\n                            <strong class=\"translated\" defaultText=\"Base size:\"></strong>\n                            <label class = \"advanced-search-label toggle-small-base\">\n                                <input type=\"checkbox\" class=\"small-base-checkbox advanced-search-checkbox\" checked=\"checked\"/> <span class=\"translated\" defaultText=\"Small\"></span>\n                            </label>\n                            <label class = \"advanced-search-label toggle-medium-base\">\n                                <input type=\"checkbox\" class=\"medium-base-checkbox advanced-search-checkbox\" checked=\"checked\"/> <span class=\"translated\" defaultText=\"Medium\"></span>\n                            </label>\n                            <label class = \"advanced-search-label toggle-large-base\">\n                                <input type=\"checkbox\" class=\"large-base-checkbox advanced-search-checkbox\" checked=\"checked\"/> <span class=\"translated\" defaultText=\"Large\"></span>\n                            </label>\n                        </div>\n                        <div class = \"advanced-search-attack-container\">\n                            <strong><i class=\"xwing-miniatures-font xwing-miniatures-font-frontarc\"></i>:</strong>\n                            <label class = \"advanced-search-label set-minimum-attack\">\n                                <span class=\"translated\" defaultText=\"from\"></span> <input type=\"number\" class=\"minimum-attack advanced-search-number-input\" value=\"0\" /> \n                            </label>\n                            <label class = \"advanced-search-label set-maximum-attack\">\n                                <span class=\"translated\" defaultText=\"to\"></span> <input type=\"number\" class=\"maximum-attack advanced-search-number-input\" value=\"5\" /> \n                            </label>\n                        </div>\n                        <div class = \"advanced-search-attackt-container\">\n                            <strong><i class=\"xwing-miniatures-font xwing-miniatures-font-singleturretarc\"></i>:</strong>\n                            <label class = \"advanced-search-label set-minimum-attackt\">\n                                <span class=\"translated\" defaultText=\"from\"></span> <input type=\"number\" class=\"minimum-attackt advanced-search-number-input\" value=\"0\" /> \n                            </label>\n                            <label class = \"advanced-search-label set-maximum-attackt\">\n                                <span class=\"translated\" defaultText=\"to\"></span> <input type=\"number\" class=\"maximum-attackt advanced-search-number-input\" value=\"5\" /> \n                            </label>\n                        </div>\n                        <div class = \"advanced-search-attackdt-container\">\n                            <strong><i class=\"xwing-miniatures-font xwing-miniatures-font-doubleturretarc\"></i>:</strong>\n                            <label class = \"advanced-search-label set-minimum-attackdt\">\n                                <span class=\"translated\" defaultText=\"from\"></span> <input type=\"number\" class=\"minimum-attackdt advanced-search-number-input\" value=\"0\" /> \n                            </label>\n                            <label class = \"advanced-search-label set-maximum-attackdt\">\n                                <span class=\"translated\" defaultText=\"to\"></span> <input type=\"number\" class=\"maximum-attackdt advanced-search-number-input\" value=\"5\" /> \n                            </label>\n                        </div>\n                        <div class = \"advanced-search-attackf-container\">\n                            <strong><i class=\"xwing-miniatures-font xwing-miniatures-font-fullfrontarc\"></i>:</strong>\n                            <label class = \"advanced-search-label set-minimum-attackf\">\n                                <span class=\"translated\" defaultText=\"from\"></span> <input type=\"number\" class=\"minimum-attackf advanced-search-number-input\" value=\"0\" /> \n                            </label>\n                            <label class = \"advanced-search-label set-maximum-attackf\">\n                                <span class=\"translated\" defaultText=\"to\"></span> <input type=\"number\" class=\"maximum-attackf advanced-search-number-input\" value=\"5\" /> \n                            </label>\n                        </div>\n                        <div class = \"advanced-search-attackb-container\">\n                            <strong><i class=\"xwing-miniatures-font xwing-miniatures-font-reararc\"></i>:</strong>\n                            <label class = \"advanced-search-label set-minimum-attackb\">\n                                <span class=\"translated\" defaultText=\"from\"></span> <input type=\"number\" class=\"minimum-attackb advanced-search-number-input\" value=\"0\" /> \n                            </label>\n                            <label class = \"advanced-search-label set-maximum-attackb\">\n                                <span class=\"translated\" defaultText=\"to\"></span> <input type=\"number\" class=\"maximum-attackb advanced-search-number-input\" value=\"5\" /> \n                            </label>\n                        </div>\n                        <div class = \"advanced-search-attackbull-container\">\n                            <strong><i class=\"xwing-miniatures-font xwing-miniatures-font-bullseyearc\"></i>:</strong>\n                            <label class = \"advanced-search-label set-minimum-attackbull\">\n                                <span class=\"translated\" defaultText=\"from\"></span> <input type=\"number\" class=\"minimum-attackbull advanced-search-number-input\" value=\"0\" /> \n                            </label>\n                            <label class = \"advanced-search-label set-maximum-attackbull\">\n                                <span class=\"translated\" defaultText=\"to\"></span> <input type=\"number\" class=\"maximum-attackbull advanced-search-number-input\" value=\"5\" /> \n                            </label>\n                        </div>\n                    </div>\n                    <div class = \"card search-container other-stuff-search-container\">\n                        <h6 class=\"card-subtitle mb-3 text-muted version translated\" defaultText=\"Other Stuff\"></h6>\n                        <div class = \"advanced-search-slot-used-container\">\n                            <label class = \"advanced-search-label select-used-slots\">\n                                <strong class=\"translated\" defaultText=\"Used slot:\"></strong>\n                                <select class=\"advanced-search-selection slot-used-selection\" multiple=\"1\" data-placeholder=\"" + (exportObj.translate('ui', "noXYselected", "slots")) + "\"></select>\n                            </label>\n                        </div>\n                        <div class = \"advanced-search-slot-used-second-slot-container\">\n                            <label class = \"advanced-search-label select-used-second-slots\">\n                                <strong class=\"translated\" defaultText=\"Used double-slot:\"></strong>\n                                <select class=\"advanced-search-selection slot-used-second-selection\" multiple=\"1\" data-placeholder=\"" + (exportObj.translate('ui', "noXYselected", "slots")) + "\"></select>\n                            </label>\n                            <br />\n                            <label class = \"advanced-search-label has-a-second-slot\">\n                                <input type=\"checkbox\" class=\"advanced-search-checkbox has-a-second-slot-checkbox\" /> <span class=\"translated\" defaultText=\"Only upgrades requiring multiple slots\"></span>\n                            </label>\n                        </div>\n                        <div class = \"advanced-search-charge-container\">\n                            <strong class=\"translated\" defaultText=\"Charges:\"></strong>\n                            <label class = \"advanced-search-label set-minimum-charge\">\n                                <span class=\"translated\" defaultText=\"from\"></span> <input type=\"number\" class=\"minimum-charge advanced-search-number-input\" value=\"0\" /> \n                            </label>\n                            <label class = \"advanced-search-label set-maximum-charge\">\n                                <span class=\"translated\" defaultText=\"to\"></span> <input type=\"number\" class=\"maximum-charge advanced-search-number-input\" value=\"5\" /> \n                            </label>\n                            <br />\n                            <label class = \"advanced-search-label has-recurring-charge\">\n                                <input type=\"checkbox\" class=\"advanced-search-checkbox has-recurring-charge-checkbox\" checked=\"checked\"/> <span class=\"translated\" defaultText=\"Recurring\"></span>\n                            </label>\n                            <label class = \"advanced-search-label has-not-recurring-charge\">\n                                <input type=\"checkbox\" class=\"advanced-search-checkbox has-not-recurring-charge-checkbox\" checked=\"checked\"/> <span class=\"translated\" defaultText=\"Not recurring\"></span>\n                            </label>\n                        <div class = \"advanced-search-force-container\">\n                            <strong class=\"translated\" defaultText=\"Force:\"></strong>\n                            <label class = \"advanced-search-label set-minimum-force\">\n                                <span class=\"translated\" defaultText=\"from\"></span> <input type=\"number\" class=\"minimum-force advanced-search-number-input\" value=\"0\" /> \n                            </label>\n                            <label class = \"advanced-search-label set-maximum-force\">\n                                <span class=\"translated\" defaultText=\"to\"></span> <input type=\"number\" class=\"maximum-force advanced-search-number-input\" value=\"3\" /> \n                            </label>\n                        </div>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        </div>\n        <div class=\"col-md-4 card-selecting-area\">\n            <span class=\"translate sort-cards-by\" defaultText=\"Sort cards by\"></span><span class=\"translated\" defaultText=\"Sort by\">:</span> <select class=\"sort-by\">\n                <option value=\"name\" class=\"translated\" defaultText=\"Name\"></option>\n                <option value=\"source\" class=\"translated\" defaultText=\"Source\"></option>\n                <option value=\"type-by-points\" class=\"translated\" defaultText=\"Type (by Points)\"></option>\n                <option value=\"type-by-name\" selected=\"1\" class=\"translated\" defaultText=\"Type (by Name)\" selected=\"selected\">" + (exportObj.translate('ui', 'Type (by Name)')) + "</option>\n            </select>\n            <div class=\"card-selector-container\">\n\n            </div>\n            <br>\n            <div class=\"card-viewer-conditions-container\">\n            </div>\n        </div>\n        <div class=\"col-md-4\">\n            <div class=\"card card-viewer-placeholder info-well\">\n                <p class=\"translate select-a-card\" defaultText=\"Select a card\"></p>\n            </div>\n            <div class=\"card card-viewer-container\">\n            </div>\n        </div>\n    </div>\n</div>"));
    this.card_selector_container = $(this.container.find('.xwing-card-browser .card-selector-container'));
    this.card_viewer_container = $(this.container.find('.xwing-card-browser .card-viewer-container'));
    this.card_viewer_container.append($.trim(exportObj.builders[0].createInfoContainerUI()));
    this.card_viewer_container.hide();
    this.card_viewer_conditions_container = $(this.container.find('.xwing-card-browser .card-viewer-conditions-container'));
    this.card_viewer_container.hide();
    this.card_viewer_placeholder = $(this.container.find('.xwing-card-browser .card-viewer-placeholder'));
    this.advanced_search_container = $(this.container.find('.xwing-card-browser .advanced-search-container'));
    this.sort_selector = $(this.container.find('select.sort-by'));
    this.sort_selector.select2({
      minimumResultsForSearch: -1
    });
    this.card_search_text = ($(this.container.find('.xwing-card-browser .card-search-text')))[0];
    this.faction_selection = $(this.container.find('.xwing-card-browser select.faction-selection'));
    _ref = exportObj.pilotsByFactionXWS;
    for (faction in _ref) {
      pilot = _ref[faction];
      opt = $(document.createElement('OPTION'));
      opt.val(faction);
      opt.text(exportObj.translate('faction', faction));
      this.faction_selection.append(opt);
    }
    factionless_option = $(document.createElement('OPTION'));
    factionless_option.val("Factionless");
    factionless_option.text(exportObj.translate('faction', "Factionless"));
    this.faction_selection.append(factionless_option);
    this.faction_selection.select2({
      minimumResultsForSearch: $.isMobile() ? -1 : 0
    });
    this.minimum_point_costs = ($(this.container.find('.xwing-card-browser .minimum-point-cost')))[0];
    this.maximum_point_costs = ($(this.container.find('.xwing-card-browser .maximum-point-cost')))[0];
    this.hyperspace_checkbox = ($(this.container.find('.xwing-card-browser .hyperspace-checkbox')))[0];
    this.unique_checkbox = ($(this.container.find('.xwing-card-browser .unique-checkbox')))[0];
    this.non_unique_checkbox = ($(this.container.find('.xwing-card-browser .non-unique-checkbox')))[0];
    this.base_size_checkboxes = {
      large: ($(this.container.find('.xwing-card-browser .large-base-checkbox')))[0],
      medium: ($(this.container.find('.xwing-card-browser .medium-base-checkbox')))[0],
      small: ($(this.container.find('.xwing-card-browser .small-base-checkbox')))[0]
    };
    this.slot_available_selection = $(this.container.find('.xwing-card-browser select.slot-available-selection'));
    for (slot in exportObj.upgradesBySlotCanonicalName) {
      opt = $(document.createElement('OPTION'));
      opt.val(slot);
      opt.text(exportObj.translate('slot', slot));
      this.slot_available_selection.append(opt);
    }
    this.slot_available_selection.select2({
      minimumResultsForSearch: $.isMobile() ? -1 : 0
    });
    this.duplicateslots = ($(this.container.find('.xwing-card-browser .duplicate-slots-checkbox')))[0];
    this.action_available_selection = $(this.container.find('.xwing-card-browser select.action-available-selection'));
    _ref1 = ["Evade", "Focus", "Lock", "Boost", "Barrel Roll", "Calculate", "Reinforce", "Rotate Arc", "Coordinate", "Slam", "Reload", "Jam"].sort();
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      action = _ref1[_i];
      opt = $(document.createElement('OPTION'));
      opt.text(exportObj.translate('action', action));
      opt.val(action);
      this.action_available_selection.append(opt);
    }
    this.action_available_selection.select2({
      minimumResultsForSearch: $.isMobile() ? -1 : 0
    });
    this.linkedaction_available_selection = $(this.container.find('.xwing-card-browser select.linkedaction-available-selection'));
    _ref2 = ["Evade", "Focus", "Lock", "Boost", "Barrel Roll", "Calculate", "Reinforce", "Rotate Arc", "Coordinate", "Slam", "Reload", "Jam"].sort();
    for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
      linkedaction = _ref2[_j];
      opt = $(document.createElement('OPTION'));
      opt.text(exportObj.translate('action', linkedaction));
      opt.val(linkedaction);
      this.linkedaction_available_selection.append(opt);
    }
    this.linkedaction_available_selection.select2({
      minimumResultsForSearch: $.isMobile() ? -1 : 0
    });
    this.slot_used_selection = $(this.container.find('.xwing-card-browser select.slot-used-selection'));
    for (slot in exportObj.upgradesBySlotCanonicalName) {
      opt = $(document.createElement('OPTION'));
      opt.text(exportObj.translate('slot', slot));
      opt.val(slot);
      this.slot_used_selection.append(opt);
    }
    this.slot_used_selection.select2({
      minimumResultsForSearch: $.isMobile() ? -1 : 0
    });
    this.slot_used_second_selection = $(this.container.find('.xwing-card-browser select.slot-used-second-selection'));
    for (slot in exportObj.upgradesBySlotCanonicalName) {
      opt = $(document.createElement('OPTION'));
      opt.text(exportObj.translate('slot', slot));
      opt.val(slot);
      this.slot_used_second_selection.append(opt);
    }
    this.slot_used_second_selection.select2({
      minimumResultsForSearch: $.isMobile() ? -1 : 0
    });
    this.minimum_charge = ($(this.container.find('.xwing-card-browser .minimum-charge')))[0];
    this.maximum_charge = ($(this.container.find('.xwing-card-browser .maximum-charge')))[0];
    this.minimum_ini = ($(this.container.find('.xwing-card-browser .minimum-ini')))[0];
    this.maximum_ini = ($(this.container.find('.xwing-card-browser .maximum-ini')))[0];
    this.minimum_force = ($(this.container.find('.xwing-card-browser .minimum-force')))[0];
    this.maximum_force = ($(this.container.find('.xwing-card-browser .maximum-force')))[0];
    this.minimum_hull = ($(this.container.find('.xwing-card-browser .minimum-hull')))[0];
    this.maximum_hull = ($(this.container.find('.xwing-card-browser .maximum-hull')))[0];
    this.minimum_shields = ($(this.container.find('.xwing-card-browser .minimum-shields')))[0];
    this.maximum_shields = ($(this.container.find('.xwing-card-browser .maximum-shields')))[0];
    this.minimum_agility = ($(this.container.find('.xwing-card-browser .minimum-agility')))[0];
    this.maximum_agility = ($(this.container.find('.xwing-card-browser .maximum-agility')))[0];
    this.minimum_attack = ($(this.container.find('.xwing-card-browser .minimum-attack')))[0];
    this.maximum_attack = ($(this.container.find('.xwing-card-browser .maximum-attack')))[0];
    this.minimum_attackt = ($(this.container.find('.xwing-card-browser .minimum-attackt')))[0];
    this.maximum_attackt = ($(this.container.find('.xwing-card-browser .maximum-attackt')))[0];
    this.minimum_attackdt = ($(this.container.find('.xwing-card-browser .minimum-attackdt')))[0];
    this.maximum_attackdt = ($(this.container.find('.xwing-card-browser .maximum-attackdt')))[0];
    this.minimum_attackf = ($(this.container.find('.xwing-card-browser .minimum-attackf')))[0];
    this.maximum_attackf = ($(this.container.find('.xwing-card-browser .maximum-attackf')))[0];
    this.minimum_attackb = ($(this.container.find('.xwing-card-browser .minimum-attackb')))[0];
    this.maximum_attackb = ($(this.container.find('.xwing-card-browser .maximum-attackb')))[0];
    this.minimum_attackbull = ($(this.container.find('.xwing-card-browser .minimum-attackbull')))[0];
    this.maximum_attackbull = ($(this.container.find('.xwing-card-browser .maximum-attackbull')))[0];
    this.hassecondslot = ($(this.container.find('.xwing-card-browser .has-a-second-slot-checkbox')))[0];
    this.recurring_charge = ($(this.container.find('.xwing-card-browser .has-recurring-charge-checkbox')))[0];
    this.not_recurring_charge = ($(this.container.find('.xwing-card-browser .has-not-recurring-charge-checkbox')))[0];
    this.minimum_owned_copies = ($(this.container.find('.xwing-card-browser .minimum-owned-copies')))[0];
    this.maximum_owned_copies = ($(this.container.find('.xwing-card-browser .maximum-owned-copies')))[0];
    return exportObj.translateUIElements(this.container);
  };

  CardBrowser.prototype.setupHandlers = function() {
    var basesize, checkbox, _ref;
    this.sort_selector.change((function(_this) {
      return function(e) {
        return _this.renderList(_this.sort_selector.val());
      };
    })(this));
    $("#browserTab").on('click', (function(_this) {
      return function(e) {
        return _this.renderList(_this.sort_selector.val());
      };
    })(this));
    $(window).on('xwing:afterLanguageLoad', (function(_this) {
      return function(e, language, cb) {
        if (cb == null) {
          cb = $.noop;
        }
        _this.language = language;
        return _this.prepareData();
      };
    })(this)).on('xwing-collection:created', (function(_this) {
      return function(e, collection) {
        return _this.collection = collection;
      };
    })(this)).on('xwing-collection:destroyed', (function(_this) {
      return function(e, collection) {
        return _this.collection = null;
      };
    })(this));
    this.card_search_text.oninput = (function(_this) {
      return function() {
        return _this.renderList(_this.sort_selector.val());
      };
    })(this);
    this.faction_selection[0].onchange = (function(_this) {
      return function() {
        return _this.renderList(_this.sort_selector.val());
      };
    })(this);
    _ref = this.base_size_checkboxes;
    for (basesize in _ref) {
      checkbox = _ref[basesize];
      checkbox.onclick = (function(_this) {
        return function() {
          return _this.renderList(_this.sort_selector.val());
        };
      })(this);
    }
    this.minimum_point_costs.oninput = (function(_this) {
      return function() {
        return _this.renderList(_this.sort_selector.val());
      };
    })(this);
    this.maximum_point_costs.oninput = (function(_this) {
      return function() {
        return _this.renderList(_this.sort_selector.val());
      };
    })(this);
    this.hyperspace_checkbox.onclick = (function(_this) {
      return function() {
        return _this.renderList(_this.sort_selector.val());
      };
    })(this);
    this.unique_checkbox.onclick = (function(_this) {
      return function() {
        return _this.renderList(_this.sort_selector.val());
      };
    })(this);
    this.non_unique_checkbox.onclick = (function(_this) {
      return function() {
        return _this.renderList(_this.sort_selector.val());
      };
    })(this);
    this.slot_available_selection[0].onchange = (function(_this) {
      return function() {
        return _this.renderList(_this.sort_selector.val());
      };
    })(this);
    this.duplicateslots.onclick = (function(_this) {
      return function() {
        return _this.renderList(_this.sort_selector.val());
      };
    })(this);
    this.action_available_selection[0].onchange = (function(_this) {
      return function() {
        return _this.renderList(_this.sort_selector.val());
      };
    })(this);
    this.linkedaction_available_selection[0].onchange = (function(_this) {
      return function() {
        return _this.renderList(_this.sort_selector.val());
      };
    })(this);
    this.slot_used_selection[0].onchange = (function(_this) {
      return function() {
        return _this.renderList(_this.sort_selector.val());
      };
    })(this);
    this.slot_used_second_selection[0].onchange = (function(_this) {
      return function() {
        return _this.renderList(_this.sort_selector.val());
      };
    })(this);
    this.not_recurring_charge.onclick = (function(_this) {
      return function() {
        return _this.renderList(_this.sort_selector.val());
      };
    })(this);
    this.recurring_charge.onclick = (function(_this) {
      return function() {
        return _this.renderList(_this.sort_selector.val());
      };
    })(this);
    this.hassecondslot.onclick = (function(_this) {
      return function() {
        return _this.renderList(_this.sort_selector.val());
      };
    })(this);
    this.minimum_charge.oninput = (function(_this) {
      return function() {
        return _this.renderList(_this.sort_selector.val());
      };
    })(this);
    this.maximum_charge.oninput = (function(_this) {
      return function() {
        return _this.renderList(_this.sort_selector.val());
      };
    })(this);
    this.minimum_ini.oninput = (function(_this) {
      return function() {
        return _this.renderList(_this.sort_selector.val());
      };
    })(this);
    this.maximum_ini.oninput = (function(_this) {
      return function() {
        return _this.renderList(_this.sort_selector.val());
      };
    })(this);
    this.minimum_hull.oninput = (function(_this) {
      return function() {
        return _this.renderList(_this.sort_selector.val());
      };
    })(this);
    this.maximum_hull.oninput = (function(_this) {
      return function() {
        return _this.renderList(_this.sort_selector.val());
      };
    })(this);
    this.minimum_force.oninput = (function(_this) {
      return function() {
        return _this.renderList(_this.sort_selector.val());
      };
    })(this);
    this.maximum_force.oninput = (function(_this) {
      return function() {
        return _this.renderList(_this.sort_selector.val());
      };
    })(this);
    this.minimum_shields.oninput = (function(_this) {
      return function() {
        return _this.renderList(_this.sort_selector.val());
      };
    })(this);
    this.maximum_shields.oninput = (function(_this) {
      return function() {
        return _this.renderList(_this.sort_selector.val());
      };
    })(this);
    this.minimum_agility.oninput = (function(_this) {
      return function() {
        return _this.renderList(_this.sort_selector.val());
      };
    })(this);
    this.maximum_agility.oninput = (function(_this) {
      return function() {
        return _this.renderList(_this.sort_selector.val());
      };
    })(this);
    this.minimum_attack.oninput = (function(_this) {
      return function() {
        return _this.renderList(_this.sort_selector.val());
      };
    })(this);
    this.maximum_attack.oninput = (function(_this) {
      return function() {
        return _this.renderList(_this.sort_selector.val());
      };
    })(this);
    this.minimum_attackt.oninput = (function(_this) {
      return function() {
        return _this.renderList(_this.sort_selector.val());
      };
    })(this);
    this.maximum_attackt.oninput = (function(_this) {
      return function() {
        return _this.renderList(_this.sort_selector.val());
      };
    })(this);
    this.minimum_attackdt.oninput = (function(_this) {
      return function() {
        return _this.renderList(_this.sort_selector.val());
      };
    })(this);
    this.maximum_attackdt.oninput = (function(_this) {
      return function() {
        return _this.renderList(_this.sort_selector.val());
      };
    })(this);
    this.minimum_attackf.oninput = (function(_this) {
      return function() {
        return _this.renderList(_this.sort_selector.val());
      };
    })(this);
    this.maximum_attackf.oninput = (function(_this) {
      return function() {
        return _this.renderList(_this.sort_selector.val());
      };
    })(this);
    this.minimum_attackb.oninput = (function(_this) {
      return function() {
        return _this.renderList(_this.sort_selector.val());
      };
    })(this);
    this.maximum_attackb.oninput = (function(_this) {
      return function() {
        return _this.renderList(_this.sort_selector.val());
      };
    })(this);
    this.minimum_attackbull.oninput = (function(_this) {
      return function() {
        return _this.renderList(_this.sort_selector.val());
      };
    })(this);
    this.maximum_attackbull.oninput = (function(_this) {
      return function() {
        return _this.renderList(_this.sort_selector.val());
      };
    })(this);
    this.minimum_owned_copies.oninput = (function(_this) {
      return function() {
        return _this.renderList(_this.sort_selector.val());
      };
    })(this);
    return this.maximum_owned_copies.oninput = (function(_this) {
      return function() {
        return _this.renderList(_this.sort_selector.val());
      };
    })(this);
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
              display_name: card_data.display_name,
              type: exportObj.translate('ui', 'upgradeHeader', card_data.slot),
              data: card_data,
              orig_type: card_data.slot
            });
          }
          return _results;
        })());
      } else {
        this.all_cards = this.all_cards.concat((function() {
          var _ref, _results;
          _ref = exportObj[type];
          _results = [];
          for (card_name in _ref) {
            card_data = _ref[card_name];
            _results.push({
              name: card_data.name,
              display_name: card_data.display_name,
              type: exportObj.translate('singular', type),
              data: card_data,
              orig_type: exportObj.translate('singular', type)
            });
          }
          return _results;
        })());
      }
    }
    this.types = (function() {
      var _j, _len1, _ref, _results;
      _ref = ['Pilot', 'Ship'];
      _results = [];
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        type = _ref[_j];
        _results.push(exportObj.translate('types', type));
      }
      return _results;
    })();
    _ref = exportObj.upgrades;
    for (card_name in _ref) {
      card_data = _ref[card_name];
      upgrade_text = exportObj.translate('ui', 'upgradeHeader', card_data.slot);
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
    var card, card_added, optgroup, source, type, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _len6, _m, _n, _o, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6;
    if (sort_by == null) {
      sort_by = 'name';
    }
    if (this.card_selector != null) {
      this.card_selector.empty();
    } else {
      this.card_selector = $(document.createElement('SELECT'));
      this.card_selector.addClass('card-selector');
      this.card_selector.attr('size', 25);
      this.card_selector_container.append(this.card_selector);
    }
    switch (sort_by) {
      case 'type-by-name':
        _ref = this.types;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          type = _ref[_i];
          optgroup = $(document.createElement('OPTGROUP'));
          optgroup.attr('label', type);
          card_added = false;
          _ref1 = this.cards_by_type_name[type];
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            card = _ref1[_j];
            if (this.checkSearchCriteria(card)) {
              this.addCardTo(optgroup, card);
              card_added = true;
            }
          }
          if (card_added) {
            this.card_selector.append(optgroup);
          }
        }
        break;
      case 'type-by-points':
        _ref2 = this.types;
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          type = _ref2[_k];
          optgroup = $(document.createElement('OPTGROUP'));
          optgroup.attr('label', type);
          card_added = false;
          _ref3 = this.cards_by_type_points[type];
          for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
            card = _ref3[_l];
            if (this.checkSearchCriteria(card)) {
              this.addCardTo(optgroup, card);
              card_added = true;
            }
          }
          if (card_added) {
            this.card_selector.append(optgroup);
          }
        }
        break;
      case 'source':
        _ref4 = this.sources;
        for (_m = 0, _len4 = _ref4.length; _m < _len4; _m++) {
          source = _ref4[_m];
          optgroup = $(document.createElement('OPTGROUP'));
          optgroup.attr('label', exportObj.translate('sources', source));
          card_added = false;
          _ref5 = this.cards_by_source[source];
          for (_n = 0, _len5 = _ref5.length; _n < _len5; _n++) {
            card = _ref5[_n];
            if (this.checkSearchCriteria(card)) {
              this.addCardTo(optgroup, card);
              card_added = true;
            }
          }
          if (card_added) {
            this.card_selector.append(optgroup);
          }
        }
        break;
      default:
        _ref6 = this.all_cards;
        for (_o = 0, _len6 = _ref6.length; _o < _len6; _o++) {
          card = _ref6[_o];
          if (this.checkSearchCriteria(card)) {
            this.addCardTo(this.card_selector, card);
          }
        }
    }
    return this.card_selector.change((function(_this) {
      return function(e) {
        return _this.renderCard($(_this.card_selector.find(':selected')));
      };
    })(this));
  };

  CardBrowser.prototype.renderCard = function(card) {
    var add_opts, condition, conditions, data, display_name, name, orig_type, _i, _len, _ref;
    display_name = card.data('display_name');
    name = card.data('name');
    data = card.data('card');
    orig_type = card.data('orig_type');
    if (!(orig_type === 'Pilot' || orig_type === 'Ship' || orig_type === 'Quickbuild')) {
      add_opts = {
        addon_type: orig_type
      };
      orig_type = 'Addon';
    }
    exportObj.builders[0].showTooltip(orig_type, data, add_opts != null ? add_opts : {}, this.card_viewer_container);
    this.card_viewer_container.show();
    if ((data != null ? data.applies_condition : void 0) != null) {
      conditions = new Set();
      if (data.applies_condition instanceof Array) {
        _ref = data.applies_condition;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          condition = _ref[_i];
          conditions.add(exportObj.conditionsByCanonicalName[condition]);
        }
      } else {
        conditions.add(exportObj.conditionsByCanonicalName[data.applies_condition]);
      }
      this.card_viewer_conditions_container.text('');
      conditions.forEach((function(_this) {
        return function(condition) {
          var condition_container;
          condition_container = $(document.createElement('div'));
          condition_container.addClass('conditions-container d-flex flex-wrap');
          condition_container.append(conditionToHTML(condition));
          return _this.card_viewer_conditions_container.append(condition_container);
        };
      })(this));
      this.card_viewer_conditions_container.show();
    } else {
      this.card_viewer_conditions_container.hide();
    }
    return this.card_viewer_placeholder.hide();
  };

  CardBrowser.prototype.addCardTo = function(container, card) {
    var option;
    option = $(document.createElement('OPTION'));
    option.text("" + (card.display_name ? card.display_name : card.name) + " (" + (card.data.points != null ? card.data.points : '*') + ")");
    option.data('name', card.name);
    option.data('display_name', card.display_name);
    option.data('type', card.type);
    option.data('card', card.data);
    option.data('orig_type', card.orig_type);
    if (this.getCollectionNumber(card) === 0) {
      option[0].classList.add('result-not-in-collection');
    }
    return $(container).append(option);
  };

  CardBrowser.prototype.getCollectionNumber = function(card) {
    var owned_copies, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
    if (!((exportObj.builders[0].collection != null) && (exportObj.builders[0].collection.counts != null))) {
      return -1;
    }
    owned_copies = 0;
    switch (card.orig_type) {
      case 'Pilot':
        owned_copies = (_ref = (_ref1 = exportObj.builders[0].collection.counts.pilot) != null ? _ref1[card.name] : void 0) != null ? _ref : 0;
        break;
      case 'Ship':
        owned_copies = (_ref2 = (_ref3 = exportObj.builders[0].collection.counts.ship) != null ? _ref3[card.name] : void 0) != null ? _ref2 : 0;
        break;
      default:
        owned_copies = (_ref4 = (_ref5 = exportObj.builders[0].collection.counts.upgrade) != null ? _ref5[card.name] : void 0) != null ? _ref4 : 0;
    }
    return owned_copies;
  };

  CardBrowser.prototype.checkSearchCriteria = function(card) {
    var action, actions, adds, all_factions, faction, faction_matches, hasDuplicates, hyperspace_legal, matches, matching_points, name, owned_copies, pilot, pilots, points, required_actions, required_linked_actions, required_slots, s, search_text, selected_factions, ship, size_matches, slot, slots, text_in_ship, text_search, used_second_slots, used_slots, _i, _j, _k, _l, _len, _len1, _len10, _len11, _len12, _len13, _len14, _len2, _len3, _len4, _len5, _len6, _len7, _len8, _len9, _m, _n, _o, _p, _q, _r, _ref, _ref1, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref16, _ref17, _ref18, _ref19, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _s, _t, _u, _v, _w;
    search_text = this.card_search_text.value.toLowerCase();
    text_search = card.name.toLowerCase().indexOf(search_text) > -1 || (card.data.text && card.data.text.toLowerCase().indexOf(search_text)) > -1 || (card.display_name && card.display_name.toLowerCase().indexOf(search_text) > -1);
    if (!text_search) {
      if (!card.data.ship) {
        return false;
      }
      ship = card.data.ship;
      if (ship instanceof Array) {
        text_in_ship = false;
        for (_i = 0, _len = ship.length; _i < _len; _i++) {
          s = ship[_i];
          if (s.toLowerCase().indexOf(search_text) > -1 || (exportObj.ships[s].display_name && exportObj.ships[s].display_name.toLowerCase().indexOf(search_text) > -1)) {
            text_in_ship = true;
            break;
          }
        }
        if (!text_in_ship) {
          return false;
        }
      } else {
        if (!(ship.toLowerCase().indexOf(search_text) > -1 || (exportObj.ships[ship].display_name && exportObj.ships[ship].display_name.toLowerCase().indexOf(search_text) > -1))) {
          return false;
        }
      }
    }
    all_factions = (function() {
      var _ref, _results;
      _ref = exportObj.pilotsByFactionXWS;
      _results = [];
      for (faction in _ref) {
        pilot = _ref[faction];
        _results.push(faction);
      }
      return _results;
    })();
    selected_factions = this.faction_selection.val();
    if (selected_factions.length > 0) {
      if (__indexOf.call(selected_factions, "Factionless") >= 0) {
        selected_factions.push(void 0);
      }
      if (!((_ref = card.data.faction, __indexOf.call(selected_factions, _ref) >= 0) || card.orig_type === 'Ship' || card.data.faction instanceof Array)) {
        return false;
      }
      if (card.data.faction instanceof Array) {
        faction_matches = false;
        _ref1 = card.data.faction;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          faction = _ref1[_j];
          if (__indexOf.call(selected_factions, faction) >= 0) {
            faction_matches = true;
            break;
          }
        }
        if (!faction_matches) {
          return false;
        }
      }
      if (card.orig_type === 'Ship') {
        faction_matches = false;
        _ref2 = card.data.factions;
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          faction = _ref2[_k];
          if (__indexOf.call(selected_factions, faction) >= 0) {
            faction_matches = true;
            break;
          }
        }
        if (!faction_matches) {
          return false;
        }
      }
    } else {
      selected_factions = all_factions;
    }
    if (this.hyperspace_checkbox.checked) {
      _ref3 = (card.data.faction != null ? (Array.isArray(card.data.faction) ? card.data.faction : [card.data.faction]) : selected_factions);
      for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
        faction = _ref3[_l];
        if (__indexOf.call(selected_factions, faction) < 0) {
          continue;
        }
        hyperspace_legal = hyperspace_legal || exportObj.hyperspaceCheckBrowser(card.data, faction, card.orig_type);
      }
      if (!hyperspace_legal) {
        return false;
      }
    }
    required_slots = this.slot_available_selection.val();
    if (required_slots.length > 0) {
      slots = card.data.slots;
      if (card.orig_type === 'Ship') {
        slots = [];
        for (_m = 0, _len4 = selected_factions.length; _m < _len4; _m++) {
          faction = selected_factions[_m];
          if (faction !== void 0) {
            _ref4 = exportObj.pilotsByFactionCanonicalName[faction];
            for (name in _ref4) {
              pilots = _ref4[name];
              for (_n = 0, _len5 = pilots.length; _n < _len5; _n++) {
                pilot = pilots[_n];
                if (pilot.ship === card.data.name) {
                  slots.push.apply(slots, pilot.slots);
                }
              }
            }
          }
        }
      }
      for (_o = 0, _len6 = required_slots.length; _o < _len6; _o++) {
        slot = required_slots[_o];
        if (!(((slot === "Torpedo") || (slot === "Missile") || (slot === "Cannon")) && ((slots != null) && (__indexOf.call(slots, "HardpointShip") >= 0)))) {
          if (!((slots != null) && __indexOf.call(slots, slot) >= 0)) {
            return false;
          }
        }
        if (this.duplicateslots.checked) {
          hasDuplicates = slots.filter(function(x, i, self) {
            return (self.indexOf(x) === i && i !== self.lastIndexOf(x)) && (x === slot);
          });
          if (hasDuplicates.length === 0) {
            return false;
          }
        }
      }
    }
    required_actions = this.action_available_selection.val();
    required_linked_actions = this.linkedaction_available_selection.val();
    if ((required_actions.length > 0) || (required_linked_actions.length > 0)) {
      actions = (_ref5 = card.data.actions) != null ? _ref5 : [];
      if (card.orig_type === 'Pilot') {
        actions = (_ref6 = (_ref7 = card.data.ship_override) != null ? _ref7.actions : void 0) != null ? _ref6 : exportObj.ships[card.data.ship].actions;
        actions = actions.concat((_ref8 = (_ref9 = card.data.ship_override) != null ? _ref9.actionsred : void 0) != null ? _ref8 : exportObj.ships[card.data.ship].actionsred);
      }
    }
    _ref10 = required_actions != null ? required_actions : [];
    for (_p = 0, _len7 = _ref10.length; _p < _len7; _p++) {
      action = _ref10[_p];
      if (!((actions != null) && ((__indexOf.call(actions, action) >= 0) || (_ref11 = "F-" + action, __indexOf.call(actions, _ref11) >= 0) || (_ref12 = "R-" + action, __indexOf.call(actions, _ref12) >= 0)))) {
        return false;
      }
    }
    _ref13 = required_linked_actions != null ? required_linked_actions : [];
    for (_q = 0, _len8 = _ref13.length; _q < _len8; _q++) {
      action = _ref13[_q];
      if (!((actions != null) && ((_ref14 = "R> " + action, __indexOf.call(actions, _ref14) >= 0) || (_ref15 = "> " + action, __indexOf.call(actions, _ref15) >= 0)))) {
        return false;
      }
    }
    if (this.minimum_point_costs.value > 0 || this.maximum_point_costs.value < 200) {
      if (!((card.data.points >= this.minimum_point_costs.value && card.data.points <= this.maximum_point_costs.value) || (card.data.points === "*" || (card.data.points == null)))) {
        return false;
      }
      if (card.data.pointsarray != null) {
        matching_points = false;
        _ref16 = card.data.pointsarray;
        for (_r = 0, _len9 = _ref16.length; _r < _len9; _r++) {
          points = _ref16[_r];
          if (points >= this.minimum_point_costs.value && points <= this.maximum_point_costs.value) {
            matching_points = true;
            break;
          }
        }
        if (!matching_points) {
          return false;
        }
      }
      if (card.orig_type === 'Ship') {
        matching_points = false;
        for (_s = 0, _len10 = selected_factions.length; _s < _len10; _s++) {
          faction = selected_factions[_s];
          _ref17 = exportObj.pilotsByFactionCanonicalName[faction];
          for (name in _ref17) {
            pilots = _ref17[name];
            for (_t = 0, _len11 = pilots.length; _t < _len11; _t++) {
              pilot = pilots[_t];
              if (pilot.ship === card.data.name) {
                if (pilot.points >= this.minimum_point_costs.value && pilot.points <= this.maximum_point_costs.value) {
                  matching_points = true;
                  break;
                }
              }
            }
            if (matching_points) {
              break;
            }
          }
          if (matching_points) {
            break;
          }
        }
        if (!matching_points) {
          return false;
        }
      }
    }
    used_slots = this.slot_used_selection.val();
    if (used_slots.length > 0) {
      if (card.data.slot == null) {
        return false;
      }
      matches = false;
      for (_u = 0, _len12 = used_slots.length; _u < _len12; _u++) {
        slot = used_slots[_u];
        if (card.data.slot === slot) {
          matches = true;
          break;
        }
      }
      if (!matches) {
        return false;
      }
    }
    used_second_slots = this.slot_used_second_selection.val();
    if (used_second_slots.length > 0) {
      if (card.data.also_occupies_upgrades == null) {
        return false;
      }
      matches = false;
      for (_v = 0, _len13 = used_second_slots.length; _v < _len13; _v++) {
        slot = used_second_slots[_v];
        _ref18 = card.data.also_occupies_upgrades;
        for (_w = 0, _len14 = _ref18.length; _w < _len14; _w++) {
          adds = _ref18[_w];
          if (adds === slot) {
            matches = true;
            break;
          }
        }
      }
      if (!matches) {
        return false;
      }
    }
    if ((card.data.also_occupies_upgrades == null) && this.hassecondslot.checked) {
      return false;
    }
    if (!(!this.unique_checkbox.checked || card.data.unique)) {
      return false;
    }
    if (!(!this.non_unique_checkbox.checked || !card.data.unique)) {
      return false;
    }
    if (!(((card.data.charge != null) && card.data.charge <= this.maximum_charge.value && card.data.charge >= this.minimum_charge.value) || (this.minimum_charge.value <= 0 && (card.data.charge == null)))) {
      return false;
    }
    if (card.data.recurring && !this.recurring_charge.checked) {
      return false;
    }
    if (card.data.charge && !card.data.recurring && !this.not_recurring_charge.checked) {
      return false;
    }
    if (((_ref19 = exportObj.builders[0].collection) != null ? _ref19.counts : void 0) != null) {
      owned_copies = this.getCollectionNumber(card);
      if (!(owned_copies >= this.minimum_owned_copies.value && owned_copies <= this.maximum_owned_copies.value)) {
        return false;
      }
    }
    if (card.data.skill != null) {
      if (!(card.data.skill >= this.minimum_ini.value && card.data.skill <= this.maximum_ini.value)) {
        return false;
      }
    } else {
      if (!(this.minimum_ini.value <= 0 && this.maximum_ini.value >= 6)) {
        return false;
      }
    }
    if (!(this.base_size_checkboxes['small'].checked && this.base_size_checkboxes['medium'].checked && this.base_size_checkboxes['large'].checked)) {
      size_matches = false;
      if (card.orig_type === 'Ship') {
        size_matches = size_matches || card.data.medium && this.base_size_checkboxes['medium'].checked;
        size_matches = size_matches || card.data.large && this.base_size_checkboxes['large'].checked;
        size_matches = size_matches || !card.data.medium && !card.data.large && this.base_size_checkboxes['small'].checked;
      } else if (card.orig_type === 'Pilot') {
        ship = exportObj.ships[card.data.ship];
        size_matches = size_matches || ship.medium && this.base_size_checkboxes['medium'].checked;
        size_matches = size_matches || ship.large && this.base_size_checkboxes['large'].checked;
        size_matches = size_matches || !ship.medium && !ship.large && this.base_size_checkboxes['small'].checked;
      }
      if (!size_matches) {
        return false;
      }
    }
    if (this.minimum_hull.value !== "0" || this.maximum_hull.value !== "12") {
      if (!(((card.data.hull != null) && card.data.hull >= this.minimum_hull.value && card.data.hull <= this.maximum_hull.value) || (card.orig_type === 'Pilot' && exportObj.ships[card.data.ship].hull >= this.minimum_hull.value && exportObj.ships[card.data.ship].hull <= this.maximum_hull.value))) {
        return false;
      }
    }
    if (this.minimum_shields.value !== "0" || this.maximum_shields.value !== "6") {
      if (!(((card.data.shields != null) && card.data.shields >= this.minimum_shields.value && card.data.shields <= this.maximum_shields.value) || (card.orig_type === 'Pilot' && exportObj.ships[card.data.ship].shields >= this.minimum_shields.value && exportObj.ships[card.data.ship].shields <= this.maximum_shields.value))) {
        return false;
      }
    }
    if (this.minimum_agility.value !== "0" || this.maximum_agility.value !== "3") {
      if (!(((card.data.agility != null) && card.data.agility >= this.minimum_agility.value && card.data.agility <= this.maximum_agility.value) || (card.orig_type === 'Pilot' && exportObj.ships[card.data.ship].agility >= this.minimum_agility.value && exportObj.ships[card.data.ship].agility <= this.maximum_agility.value))) {
        return false;
      }
    }
    if (this.minimum_attack.value !== "0" || this.maximum_attack.value !== "5") {
      if (!(((card.data.attack != null) && card.data.attack >= this.minimum_attack.value && card.data.attack <= this.maximum_attack.value) || (card.orig_type === 'Pilot' && (((exportObj.ships[card.data.ship].attack != null) && exportObj.ships[card.data.ship].attack >= this.minimum_attack.value && exportObj.ships[card.data.ship].attack <= this.maximum_attack.value) || ((exportObj.ships[card.data.ship].attack == null) && this.minimum_attack.value <= 0))) || (card.orig_type === 'Ship' && (card.data.attack == null) && this.minimum_attack.value <= 0))) {
        return false;
      }
    }
    if (this.minimum_attackt.value !== "0" || this.maximum_attackt.value !== "5") {
      if (!(((card.data.attackt != null) && card.data.attackt >= this.minimum_attackt.value && card.data.attackt <= this.maximum_attackt.value) || (card.orig_type === 'Pilot' && (((exportObj.ships[card.data.ship].attackt != null) && exportObj.ships[card.data.ship].attackt >= this.minimum_attackt.value && exportObj.ships[card.data.ship].attackt <= this.maximum_attackt.value) || ((exportObj.ships[card.data.ship].attackt == null) && this.minimum_attackt.value <= 0))) || (card.orig_type === 'Ship' && (card.data.attackt == null) && this.minimum_attackt.value <= 0))) {
        return false;
      }
    }
    if (this.minimum_attackdt.value !== "0" || this.maximum_attackdt.value !== "5") {
      if (!(((card.data.attackdt != null) && card.data.attackdt >= this.minimum_attackdt.value && card.data.attackdt <= this.maximum_attackdt.value) || (card.orig_type === 'Pilot' && (((exportObj.ships[card.data.ship].attackdt != null) && exportObj.ships[card.data.ship].attackdt >= this.minimum_attackdt.value && exportObj.ships[card.data.ship].attackdt <= this.maximum_attackdt.value) || ((exportObj.ships[card.data.ship].attackdt == null) && this.minimum_attackdt.value <= 0))) || (card.orig_type === 'Ship' && (card.data.attackdt == null) && this.minimum_attackdt.value <= 0))) {
        return false;
      }
    }
    if (this.minimum_attackf.value !== "0" || this.maximum_attackf.value !== "5") {
      if (!(((card.data.attackf != null) && card.data.attackf >= this.minimum_attackf.value && card.data.attackf <= this.maximum_attackf.value) || (card.orig_type === 'Pilot' && (((exportObj.ships[card.data.ship].attackf != null) && exportObj.ships[card.data.ship].attackf >= this.minimum_attackf.value && exportObj.ships[card.data.ship].attackf <= this.maximum_attackf.value) || ((exportObj.ships[card.data.ship].attackf == null) && this.minimum_attackf.value <= 0))) || (card.orig_type === 'Ship' && (card.data.attackf == null) && this.minimum_attackf.value <= 0))) {
        return false;
      }
    }
    if (this.minimum_attackb.value !== "0" || this.maximum_attackb.value !== "5") {
      if (!(((card.data.attackb != null) && card.data.attackb >= this.minimum_attackb.value && card.data.attackb <= this.maximum_attackb.value) || (card.orig_type === 'Pilot' && (((exportObj.ships[card.data.ship].attackb != null) && exportObj.ships[card.data.ship].attackb >= this.minimum_attackb.value && exportObj.ships[card.data.ship].attackb <= this.maximum_attackb.value) || ((exportObj.ships[card.data.ship].attackb == null) && this.minimum_attackb.value <= 0))) || (card.orig_type === 'Ship' && (card.data.attackb == null) && this.minimum_attackb.value <= 0))) {
        return false;
      }
    }
    if (this.minimum_attackbull.value !== "0" || this.maximum_attackbull.value !== "5") {
      if (!(((card.data.attackbull != null) && card.data.attackbull >= this.minimum_attackbull.value && card.data.attackbull <= this.maximum_attackbull.value) || (card.orig_type === 'Pilot' && (((exportObj.ships[card.data.ship].attackbull != null) && exportObj.ships[card.data.ship].attackbull >= this.minimum_attackbull.value && exportObj.ships[card.data.ship].attackbull <= this.maximum_attackbull.value) || ((exportObj.ships[card.data.ship].attackbull == null) && this.minimum_attackbull.value <= 0))) || (card.orig_type === 'Ship' && (card.data.attackbull == null) && this.minimum_attackbull.value <= 0))) {
        return false;
      }
    }
    if (this.minimum_force.value !== "0" || this.maximum_force.value !== "3") {
      if (!(((card.data.force != null) && card.data.force >= this.minimum_force.value && card.data.force <= this.maximum_force.value) || (card.orig_type === 'Pilot' && exportObj.ships[card.data.ship].force >= this.minimum_force.value && exportObj.ships[card.data.ship].force <= this.maximum_force.value) || ((card.data.force == null) && this.minimum_force.value === "0"))) {
        return false;
      }
    }
    return true;
  };

  return CardBrowser;

})();


/*
    X-Wing Rules Browser
    Stephen Kim <raithos@gmail.com>
    https://github.com/raithos/xwing
 */

exportObj = typeof exports !== "undefined" && exports !== null ? exports : this;

exportObj.RulesBrowser = (function() {
  function RulesBrowser(args) {
    var _ref;
    this.container = $(args.container);
    this.language = (_ref = exportObj.currentLanguage) != null ? _ref : 'English';
    this.prepareRulesData();
    this.setupRuleUI();
    this.setupRulesHandlers();
  }

  RulesBrowser.prototype.setupRuleUI = function() {
    var date, version;
    this.container.append($.trim("<div class=\"container-fluid xwing-rules-browser\">\n    <div class=\"row\">\n        <div class=\"col-md-4\">\n            <div class=\"card card-search-container\">\n                <h5 class=\"card-title translated\" defaultText=\"Rules Search\"></h5>\n                <div class=\"advanced-search-container\">\n                    <h6 class=\"card-subtitle mb-2 text-muted version\"><span class=\"translated\" defaultText=\"Version\"></span>: </h6>\n                    <label class = \"text-search advanced-search-label\">\n                        <strong class=\"translated\" defaultText=\"Term:\"></strong>\n                        <input type=\"search\" placeholder=\"" + (exportObj.translate('ui', "Search for game term or card")) + "\" class = \"rule-search-text\">\n                    </label>\n                </div>\n                <div class=\"rules-container card-selector-container\">\n                </div>\n            </div>\n        </div>\n        <div class=\"col-md-8\">\n            <div class=\"card card-viewer-container card-search-container\">\n                <h4 class=\"card-title info-name\"></h4>\n                <br />\n                <p class=\"info-text\" />\n            </div>\n        </div>\n    </div>\n</div>"));
    this.versionlabel = $(this.container.find('.xwing-rules-browser .version'));
    this.rule_selector_container = $(this.container.find('.xwing-rules-browser .rules-container'));
    this.rule_viewer_container = $(this.container.find('.xwing-rules-browser .card-viewer-container'));
    this.rule_viewer_container.hide();
    this.advanced_search_container = $(this.container.find('.xwing-rules-browser .advanced-search-container'));
    exportObj.translateUIElements(this.container);
    version = this.all_rules.version.number;
    date = this.all_rules.version.date;
    this.versionlabel.append("" + version + ", " + date);
    return this.rule_search_rules_text = ($(this.container.find('.xwing-rules-browser .rule-search-text')))[0];
  };

  RulesBrowser.prototype.setupRulesHandlers = function() {
    this.renderRulesList();
    $(window).on('xwing:afterLanguageLoad', (function(_this) {
      return function(e, language, cb) {
        if (cb == null) {
          cb = $.noop;
        }
        _this.language = language;
        _this.prepareRulesData();
        return _this.renderRulesList();
      };
    })(this));
    return this.rule_search_rules_text.oninput = (function(_this) {
      return function() {
        return _this.renderRulesList();
      };
    })(this);
  };

  RulesBrowser.prototype.prepareRulesData = function() {
    this.all_rules = exportObj.rulesEntries();
    return this.ruletype = ['glossary', 'faq'];
  };

  RulesBrowser.prototype.renderRulesList = function() {
    var optgroup, rule_added, rule_data, rule_name, type, _i, _len, _ref, _ref1;
    if (this.rule_selector != null) {
      this.rule_selector.remove();
    }
    this.rule_selector = $(document.createElement('SELECT'));
    this.rule_selector.addClass('card-selector');
    this.rule_selector.attr('size', 25);
    this.rule_selector_container.append(this.rule_selector);
    _ref = this.ruletype;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      type = _ref[_i];
      optgroup = $(document.createElement('OPTGROUP'));
      optgroup.attr('label', exportObj.translate('rulestypes', type));
      rule_added = false;
      _ref1 = this.all_rules[type];
      for (rule_name in _ref1) {
        rule_data = _ref1[rule_name];
        if (this.checkRulesSearchCriteria(rule_data)) {
          this.addRulesTo(optgroup, rule_data);
          rule_added = true;
        }
      }
      if (rule_added) {
        this.rule_selector.append(optgroup);
      }
    }
    return this.rule_selector.change((function(_this) {
      return function(e) {
        return _this.renderRules($(_this.rule_selector.find(':selected')));
      };
    })(this));
  };

  RulesBrowser.prototype.renderRules = function(rule) {
    var data, orig_type;
    data = {
      name: rule.data('name'),
      text: rule.data('text')
    };
    orig_type = 'Rules';
    exportObj.builders[0].showTooltip(orig_type, data, typeof add_opts !== "undefined" && add_opts !== null ? add_opts : {}, this.rule_viewer_container);
    return this.rule_viewer_container.show();
  };

  RulesBrowser.prototype.addRulesTo = function(container, rule) {
    var option;
    option = $(document.createElement('OPTION'));
    option.text("" + rule.name);
    option.data('name', rule.name);
    option.data('text', exportObj.fixIcons(rule));
    return $(container).append(option);
  };

  RulesBrowser.prototype.checkRulesSearchCriteria = function(rule) {
    var search_text, text_search;
    search_text = this.rule_search_rules_text.value.toLowerCase();
    text_search = rule.name.toLowerCase().indexOf(search_text) > -1 || (rule.text && rule.text.toLowerCase().indexOf(search_text)) > -1;
    if (!text_search) {
      return false;
    }
    return true;
  };

  return RulesBrowser;

})();


/*
    X-Wing Squad Builder 2.0
    Stephen Kim <raithos@gmail.com>
    https://raithos.github.io
 */

DFL_LANGUAGE = 'English';

SHOW_DEBUG_OUT_MISSING_TRANSLATIONS = false;

builders = [];

exportObj = typeof exports !== "undefined" && exports !== null ? exports : this;

try {
  (function() {
    var langc, languageCodes, _i, _len, _results;
    exportObj.currentLanguage = DFL_LANGUAGE;
    languageCodes = [navigator.language].concat(navigator.languages);
    _results = [];
    for (_i = 0, _len = languageCodes.length; _i < _len; _i++) {
      langc = languageCodes[_i];
      langc = langc.split('-')[0];
      if (langc in exportObj.codeToLanguage) {
        exportObj.currentLanguage = exportObj.codeToLanguage[langc];
        break;
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  })();
} catch (_error) {
  all = _error;
  exportObj.currentLanguage = DFL_LANGUAGE;
  throw all;
}

exportObj.loadCards = function(language) {
  return exportObj.cardLoaders[language]();
};

exportObj.translate = function() {
  var args, category, what;
  category = arguments[0], what = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
  return exportObj.translateToLang.apply(exportObj, [exportObj.currentLanguage, category, what].concat(__slice.call(args)));
};

exportObj.translateToLang = function() {
  var args, category, language, translation, what;
  language = arguments[0], category = arguments[1], what = arguments[2], args = 4 <= arguments.length ? __slice.call(arguments, 3) : [];
  try {
    translation = exportObj.translations[language][category][what];
  } catch (_error) {
    all = _error;
    translation = void 0;
  }
  if (translation != null) {
    if (translation instanceof Function) {
      return translation.apply(null, [exportObj.translate].concat(__slice.call(args)));
    } else {
      return translation;
    }
  } else {
    if (SHOW_DEBUG_OUT_MISSING_TRANSLATIONS) {
      console.log(language + ' translation for ' + String(what) + ' (category ' + String(category) + ') missing');
    }
    if (language !== DFL_LANGUAGE) {
      return exportObj.translateToLang.apply(exportObj, [DFL_LANGUAGE, category, what].concat(__slice.call(args)));
    } else {
      return what;
    }
  }
};

exportObj.setupTranslationSupport = function() {
  var basic_cards;
  (function(builders) {
    return $(exportObj).on('xwing:languageChanged', (function(_this) {
      return function(e, language, cb) {
        var builder, current_language, ___iced_passed_deferral, __iced_deferrals, __iced_k;
        __iced_k = __iced_k_noop;
        ___iced_passed_deferral = iced.findDeferral(arguments);
        if (cb == null) {
          cb = $.noop;
        }
        if (language in exportObj.translations) {
          $('.language-placeholder').text(language);
          current_language = "";
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
                current_language = builder.language;
                (function(__iced_k) {
                  __iced_deferrals = new iced.Deferrals(__iced_k, {
                    parent: ___iced_passed_deferral
                  });
                  builder.container.trigger('xwing:beforeLanguageLoad', __iced_deferrals.defer({
                    lineno: 2070
                  }));
                  __iced_deferrals._fulfill();
                })(_next);
              }
            };
            _while(__iced_k);
          })(function() {
            var _i, _len;
            if (language !== current_language) {
              exportObj.loadCards(language);
            }
            exportObj.translateUIElements();
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
  basic_cards = exportObj.basicCardData();
  exportObj.canonicalizeShipNames(basic_cards);
  exportObj.ships = basic_cards.ships;
  exportObj.setupCommonCardData(basic_cards);
  exportObj.loadCards(DFL_LANGUAGE);
  exportObj.loadCards(exportObj.currentLanguage);
  return $(exportObj).trigger('xwing:languageChanged', exportObj.currentLanguage);
};

exportObj.translateUIElements = function(context) {
  var translateableNode, _i, _len, _ref, _results;
  if (context == null) {
    context = void 0;
  }
  _ref = $('.translated', context);
  _results = [];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    translateableNode = _ref[_i];
    _results.push(translateableNode.innerHTML = exportObj.translate('ui', translateableNode.getAttribute('defaultText')));
  }
  return _results;
};

exportObj.setupTranslationUI = function(backend) {
  var language, li, _fn, _i, _len, _ref, _results;
  _ref = Object.keys(exportObj.cardLoaders).sort();
  _fn = function(language, backend) {
    return li.click(function(e) {
      if (backend != null) {
        backend.set('language', language);
      }
      exportObj.currentLanguage = language;
      return $(exportObj).trigger('xwing:languageChanged', language);
    });
  };
  _results = [];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    language = _ref[_i];
    li = $(document.createElement('LI'));
    li.text(language);
    _fn(language, backend);
    _results.push($('.language-picker .dropdown-menu').append(li));
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
  } else if (typeof a.points === "string") {
    return 1;
  } else {
    if (a.points > b.points) {
      return 1;
    } else {
      return -1;
    }
  }
};

exportObj.toTTS = function(txt) {
  if (txt == null) {
    return null;
  } else {
    return txt.replace(/\(.*\)/g, "").replace("�", '"').replace("�", '"');
  }
};

exportObj.slotsMatching = function(slota, slotb) {
  if (slota === slotb) {
    return true;
  }
  if (slota !== 'HardpointShip' && slotb !== 'HardpointShip') {
    return false;
  }
  if (slota === 'Torpedo' || slota === 'Cannon' || slota === 'Missile') {
    return true;
  }
  if (slotb === 'Torpedo' || slotb === 'Cannon' || slotb === 'Missile') {
    return true;
  }
  return false;
};

$.isMobile = function() {
  if ((navigator.userAgent.match(/(iPhone|iPod|iPad|Android)/i)) || navigator.maxTouchPoints > 1) {
    return true;
  }
  return false;
};

$.randomInt = function(n) {
  return Math.floor(Math.random() * n);
};

$.isElementInView = function(element, fullyInView) {
  var elementBottom, elementTop, pageBottom, pageTop;
  pageTop = $(window).scrollTop();
  pageBottom = pageTop + $(window).height();
  elementTop = $(element).offset().top;
  elementBottom = elementTop + $(element).height();
  if (fullyInView) {
    return (pageTop < elementTop) && (pageBottom > elementBottom);
  } else {
    return (elementTop <= pageBottom) && (elementBottom >= pageTop);
  }
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
    return "" + base_stat + ((effective_stats != null) && (effective_stats[key] != null) && effective_stats[key] !== base_stat ? " (" + effective_stats[key] + ")" : "");
  } else if ((effective_stats != null) && (effective_stats[key] != null)) {
    return "0 (" + effective_stats[key] + ")";
  } else {
    return "0";
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
  return html = $.trim("<div class=\"condition\">\n    <div class=\"name\">" + (condition.unique ? "&middot;&nbsp;" : "") + (condition.display_name ? condition.display_name : condition.name) + "</div>\n    <div class=\"text\">" + condition.text + "</div>\n</div>");
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
    this.updateShipOrder = __bind(this.updateShipOrder, this);
    this.getPermaLink = __bind(this.getPermaLink, this);
    this.getPermaLinkParams = __bind(this.getPermaLinkParams, this);
    var _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
    this.container = $(args.container);
    this.faction = $.trim(args.faction);
    this.printable_container = $(args.printable_container);
    this.tab = $(args.tab);
    this.ships = [];
    this.uniques_in_use = {
      Pilot: [],
      Upgrade: [],
      Slot: []
    };
    this.standard_list = {
      Upgrade: [],
      Ship: []
    };
    this.suppress_automatic_new_ship = false;
    this.tooltip_currently_displaying = null;
    this.randomizer_options = {
      sources: null,
      points: 200,
      bid_goal: 5,
      ships_or_upgrades: 3,
      ship_limit: 0,
      collection_only: true,
      fill_zero_pts: false
    };
    this.total_points = 0;
    this.isHyperspace = (_ref = (_ref1 = exportObj.builders[0]) != null ? _ref1.isHyperspace : void 0) != null ? _ref : false;
    this.isEpic = (_ref2 = (_ref3 = exportObj.builders[0]) != null ? _ref3.isEpic : void 0) != null ? _ref2 : false;
    this.isQuickbuild = (_ref4 = (_ref5 = exportObj.builders[0]) != null ? _ref5.isQuickbuild : void 0) != null ? _ref4 : false;
    this.backend = null;
    this.current_squad = {};
    this.language = (_ref6 = exportObj.currentLanguage) != null ? _ref6 : 'English';
    this.collection = null;
    this.current_obstacles = [];
    this.setupUI();
    this.game_type_selector.val(((_ref7 = exportObj.builders[0]) != null ? _ref7 : this).game_type_selector.val());
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
    default_squad_name = this.uitranslation('Unnamed Squadron');
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
        obstacles: squad_obstacles,
        tag: ''
      },
      faction: this.faction
    };
    if (this.total_points > 0) {
      if (squad_name === default_squad_name) {
        this.current_squad.name = this.uitranslation('Unsaved Squadron');
      }
      this.current_squad.dirty = true;
    }
    this.container.trigger('xwing-backend:squadNameChanged');
    return this.container.trigger('xwing-backend:squadDirtinessChanged');
  };

  SquadBuilder.prototype.newSquadFromScratch = function(squad_name) {
    if (squad_name == null) {
      squad_name = this.uitranslation('New Squadron');
    }
    this.squad_name_input.val(squad_name);
    this.removeAllShips();
    if (!this.suppress_automatic_new_ship) {
      this.addShip();
    }
    this.current_obstacles = [];
    this.resetCurrentSquad();
    this.notes.val('');
    return this.tag.val('');
  };

  SquadBuilder.prototype.uitranslation = function() {
    var args, what;
    what = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return exportObj.translate('ui', what, args);
  };

  SquadBuilder.prototype.setupUI = function() {
    var DEFAULT_RANDOMIZER_BID_GOAL, DEFAULT_RANDOMIZER_POINTS, DEFAULT_RANDOMIZER_SHIPS_OR_UPGRADES, DEFAULT_RANDOMIZER_SHIP_LIMIT, DEFAULT_RANDOMIZER_TIMEOUT_SEC, content_container, expansion, opt, _i, _len, _ref;
    DEFAULT_RANDOMIZER_POINTS = 200;
    DEFAULT_RANDOMIZER_TIMEOUT_SEC = 4;
    DEFAULT_RANDOMIZER_BID_GOAL = 5;
    DEFAULT_RANDOMIZER_SHIPS_OR_UPGRADES = 3;
    DEFAULT_RANDOMIZER_SHIP_LIMIT = 0;
    this.status_container = $(document.createElement('DIV'));
    this.status_container.addClass('container-fluid');
    this.status_container.append($.trim("<div class=\"row squad-name-and-points-row\">\n    <div class=\"col-md-3 squad-name-container\">\n        <div class=\"display-name\">\n            <span class=\"squad-name\"></span>\n            <i class=\"far fa-edit\"></i>\n        </div>\n        <div class=\"input-append\">\n            <input type=\"text\" maxlength=\"64\" placeholder=\"" + (this.uitranslation("Name your squad...")) + "\" />\n            <button class=\"btn save\"><i class=\"fa fa-pen-square\"></i></button>\n        </div>\n        <br />\n        <select class=\"game-type-selector\">\n            <option value=\"standard\" class=\"translated\" defaultText=\"Extended\" selected=\"selected\">" + (this.uitranslation("Extended")) + "</option>\n            <option value=\"hyperspace\" class=\"translated\" defaultText=\"Hyperspace\"></option>\n            <option value=\"epic\" class=\"translated\" defaultText=\"Epic\"></option>\n            <option value=\"quickbuild\" class=\"translated\" defaultText=\"Quickbuild\"></option>\n        </select>\n    </div>\n    <div class=\"col-md-4 points-display-container\">\n        Points: <span class=\"total-points\">0</span> / <input type=\"number\" class=\"desired-points\" value=\"200\">\n        <span class=\"points-remaining-container\">(<span class=\"points-remaining\"></span>&nbsp;left) <span class=\"points-destroyed red\"></span></span>\n        <span class=\"content-warning unreleased-content-used d-none\"><br /><i class=\"fa fa-exclamation-circle\"></i>&nbsp;<span class=\"translated\" defaultText=\"Unreleased content warning\"></span></span>\n        <span class=\"content-warning loading-failed-container d-none\"><br /><i class=\"fa fa-exclamation-circle\"></i>&nbsp;<span class=\"translated\" defaultText=\"Broken squad link warning\"></span></span>\n        <span class=\"content-warning collection-invalid d-none\"><br /><i class=\"fa fa-exclamation-circle\"></i>&nbsp;<span class=\"translated\" defaultText=\"Collection warning\"></span></span>\n        <span class=\"content-warning ship-number-invalid-container d-none\"><br /><i class=\"fa fa-exclamation-circle\"></i>&nbsp;<span class=\"translated\" defaultText=\"Ship number warning\"></span></span>\n        <span class=\"content-warning multi-faction-warning-container d-none\"><br /><i class=\"fa fa-exclamation-circle\"></i>&nbsp;<span class=\"translated\" defaultText=\"Multi-Faction warning\"></span></span>\n    </div>\n    <div class=\"col-md-5 float-right button-container\">\n        <div class=\"btn-group float-right\">\n\n            <button class=\"btn btn-info view-as-text\"><span class=\"d-none d-lg-block\"><i class=\"fa fa-print\"></i>&nbsp;<span class=\"translated\" defaultText=\"Print/Export\"></span></span><span class=\"d-lg-none\"><i class=\"fa fa-print\"></i></span></button>\n            <a class=\"btn btn-primary d-none collection\"><span class=\"d-none d-lg-block\"><i class=\"fa fa-folder-open\"></i> <span class=\"translated\" defaultText=\"Your Collection\"></span></span><span class=\"d-lg-none\"><i class=\"fa fa-folder-open\"></i></span></a>\n            <!-- Randomize button is marked as danger, since it creates a new squad -->\n            <button class=\"btn btn-danger randomize\"><span class=\"d-none d-lg-block\"><i class=\"fa fa-random\"></i> <span class=\"translated\" defaultText=\"Randomize!\"></span></span><span class=\"d-lg-none\"><i class=\"fa fa-random\"></i></span></button>\n            <button class=\"btn btn-danger dropdown-toggle\" data-toggle=\"dropdown\">\n                <span class=\"caret\"></span>\n            </button>\n            <ul class=\"dropdown-menu\">\n                <li><a class=\"dropdown-item randomize-options translated\" defaultText=\"Randomizer Options\"></a></li>\n                <li><a class=\"dropdown-item misc-settings translated\" defaultText=\"Misc Settings\"></a></li>\n            </ul>\n            \n\n        </div>\n    </div>\n</div>\n\n<div class=\"row squad-save-buttons\">\n    <div class=\"col-md-12\">\n        <button class=\"show-authenticated btn btn-primary save-list\"><i class=\"far fa-save\"></i>&nbsp;<span class=\"translated\" defaultText=\"Save\"></span></button>\n        <button class=\"show-authenticated btn btn-primary save-list-as\"><i class=\"far fa-file\"></i>&nbsp;<span class=\"translated\" defaultText=\"Save As...\"></span></button>\n        <button class=\"show-authenticated btn btn-primary delete-list disabled\"><i class=\"fa fa-trash\"></i>&nbsp;<span class=\"translated\" defaultText=\"Delete\"></span></button>\n        <button class=\"show-authenticated btn btn-info backend-list-my-squads show-authenticated\"><i class=\"fa fa-download\"></i>&nbsp;<span class = \"translated\" defaultText=\"Load Squad\"></span></button>\n        <button class=\"btn btn-info import-squad\"><i class=\"fa fa-file-import\"></i>&nbsp;<span class=\"translated\" defaultText=\"Import\"></span></button>\n        <button class=\"btn btn-danger clear-squad\"><i class=\"fa fa-plus-circle\"></i>&nbsp;<span class=\"translated\" defaultText=\"New Squad\"></span></button>\n        <span class=\"show-authenticated backend-status\"></span>\n    </div>\n</div>"));
    this.container.append(this.status_container);
    this.xws_import_modal = $(document.createElement('DIV'));
    this.xws_import_modal.addClass('modal fade import-modal d-print-none');
    this.xws_import_modal.tabindex = "-1";
    this.xws_import_modal.role = "dialog";
    this.xws_import_modal.append($.trim("<div class=\"modal-dialog modal-dialog-centered\" role=\"document\">\n    <div class=\"modal-content\">\n        <div class=\"modal-header\">\n            <h3 class=\"translated\" defaultText=\"XWS Import\"></h3>\n            <button type=\"button\" class=\"close d-print-none\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button>\n        </div>\n        <div class=\"modal-body\">\n            <span class=\"translated\" defaultText=\"XWS Import Dialog\"></span>\n            <div class=\"container-fluid\">\n                <textarea class=\"xws-content\" placeholder='" + this.uitranslation("Paste XWS here") + "'></textarea>\n            </div>\n        </div>\n        <div class=\"modal-footer d-print-none\">\n            <span class=\"xws-import-status\"></span>&nbsp;\n            <button class=\"btn btn-danger import-xws translated\" defaultText=\"Import\"></button>\n        </div>\n    </div>\n</div>"));
    this.from_xws_button = this.container.find('button.import-squad');
    this.from_xws_button.click((function(_this) {
      return function(e) {
        e.preventDefault();
        _this.xws_import_modal.find('.xws-import-status').text(' ');
        return _this.xws_import_modal.modal('show');
      };
    })(this));
    this.load_xws_button = $(this.xws_import_modal.find('button.import-xws'));
    this.load_xws_button.click((function(_this) {
      return function(e) {
        e.preventDefault();
        return exportObj.loadXWSButton(_this.xws_import_modal);
      };
    })(this));
    this.container.append(this.xws_import_modal);
    this.list_modal = $(document.createElement('DIV'));
    this.list_modal.addClass('modal fade text-list-modal');
    this.list_modal.tabindex = "-1";
    this.list_modal.role = "dialog";
    this.container.append(this.list_modal);
    this.list_modal.append($.trim("<div class=\"modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable\" role=\"document\">\n    <div class=\"modal-content\">\n        <div class=\"modal-header\">\n            <div class=\"d-print-none\">\n                <h4 class=\"modal-title\"><span class=\"squad-name\"></span> (<span class=\"total-points\"></span>)</h4>\n            </div>\n            <div class=\"d-none d-print-block\">\n                <div class=\"fancy-header\">\n                    <div class=\"squad-name\"></div>\n                    <div class=\"squad-faction\"></div>\n                    <div class=\"mask\">\n                        <div class=\"outer-circle\">\n                            <div class=\"inner-circle\">\n                                <span class=\"total-points\"></span>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n                <div class=\"fancy-under-header\"></div>\n            </div>\n            <button type=\"button\" class=\"close d-print-none\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button>\n        </div>\n        <div class=\"modal-body\">\n            <div class=\"fancy-list\"></div>\n            <div class=\"simple-list\"></div>\n            <div class=\"simplecopy-list\">\n                <span class=\"translated\" defaultText=\"Copy below simple text\"></span>\n                <textarea></textarea><button class=\"btn btn-modal btn-copy translated\" defaultText=\"Copy\"></button>\n            </div>\n            <div class=\"reddit-list\">\n                <span class=\"translated\" defaultText=\"Copy below markdown\"></span>\n                <textarea></textarea><button class=\"btn btn-modal btn-copy translated\" defaultText=\"Copy\"></button>\n            </div>\n            <div class=\"tts-list\">\n                <span class=\"translated\" defaultText=\"Copy below TTS\"></span>\n                <textarea></textarea><button class=\"btn btn-modal btn-copy translated\" defaultText=\"Copy\"></button>\n            </div>\n            <div class=\"bbcode-list\">\n                <span class=\"translated\" defaultText=\"Copy below BBCode\"></span>\n                <textarea></textarea><button class=\"btn btn-modal btn-copy translated\" defaultText=\"Copy\"></button>\n            </div>\n            <div class=\"html-list\">\n                <span class=\"translated\" defaultText=\"Copy below HTML\"></span>\n                <textarea></textarea><button class=\"btn btn-modal btn-copy translated\" defaultText=\"Copy\"></button>\n            </div>\n            <div class=\"xws-list\">\n                <span class=\"translated\" defaultText=\"Copy below XWS\"></span>\n                <div class=\"row full-row\">\n                    <div class=\"col d-inline-block d-none d-sm-block\"><textarea></textarea><br /><button class=\"btn btn-modal btn-copy translated\" defaultText=\"Copy\"></button></div>\n                    <div class=\"col d-inline-block d-none d-sm-block qrcode-container\" id=\"xws-qrcode-container\"></div>\n                </div>\n            </div>\n        </div>\n        <div class=\"container-fluid modal-footer d-print-none\">\n            <div class=\"row full-row\">\n                <div class=\"col d-inline-block d-none d-sm-block right-col\">\n                    <label class=\"color-skip-text-checkbox\">\n                        <span class=\"translated\" defaultText=\"Skip Card Text\"></span> <input type=\"checkbox\" class=\"toggle-skip-text-print\" />\n                    </label><br />\n                    <label class=\"vertical-space-checkbox\">\n                        <span class=\"translated\" defaultText=\"Space for Cards\"></span> <input type=\"checkbox\" class=\"toggle-vertical-space\" />\n                    </label><br />\n                    <label class=\"maneuver-print-checkbox\">\n                        <span class=\"translated\" defaultText=\"Include Maneuvers Chart\"></span> <input type=\"checkbox\" class=\"toggle-maneuver-print\" />\n                    </label><br />\n                    <label class=\"expanded-shield-hull-print-checkbox\">\n                        <span class=\"translated\" defaultText=\"Expand Shield and Hull\"></span> <input type=\"checkbox\" class=\"toggle-expanded-shield-hull-print\" />\n                    </label>\n                </div>\n                <div class=\"col d-inline-block d-none d-sm-block right-col\">\n                    <label class=\"color-print-checkbox\">\n                        <span class=\"translated\" defaultText=\"Print Color\"></span> <input type=\"checkbox\" class=\"toggle-color-print\" checked=\"checked\" />\n                    </label><br />\n                    <label class=\"qrcode-checkbox\">\n                        <span class=\"translated\" defaultText=\"Include QR codes\"></span> <input type=\"checkbox\" class=\"toggle-juggler-qrcode\" checked=\"checked\" />\n                    </label><br />\n                    <label class=\"obstacles-checkbox\">\n                        <span class=\"translated\" defaultText=\"Include Obstacle Choices\"></span> <input type=\"checkbox\" class=\"toggle-obstacles\" />\n                    </label>\n                </div>\n            </div>\n            <div class=\"row btn-group list-display-mode\">\n                <button class=\"btn btn-modal select-simple-view translated\" defaultText=\"Simple\"></button>\n                <button class=\"btn btn-modal select-fancy-view d-none d-sm-block translated\" defaultText=\"Fancy\"></button>\n                <button class=\"btn btn-modal select-simplecopy-view translated\" defaultText=\"Text\"></button>\n                <button class=\"btn btn-modal select-tts-view translated\" defaultText=\"TTS\"></button>\n                <button class=\"btn btn-modal select-reddit-view translated\" defaultText=\"Reddit\"></button>\n                <button class=\"btn btn-modal select-bbcode-view translated\" defaultText=\"BBCode\"></button>\n                <button class=\"btn btn-modal select-html-view translated\" defaultText=\"HTML\"></button>\n                <button class=\"btn btn-modal select-xws-view translated\" defaultText=\"XWS\"></button>\n            </div>\n            <button class=\"btn btn-modal print-list d-none d-sm-block\"><i class=\"fa fa-print\"></i>&nbsp;<span class=\"translated\" defaultText=\"Print\"></span></button>\n        </div>\n    </div>\n</div>"));
    this.fancy_container = $(this.list_modal.find('.fancy-list'));
    this.fancy_total_points_container = $(this.list_modal.find('div.modal-header .total-points'));
    this.simple_container = $(this.list_modal.find('div.modal-body .simple-list'));
    this.reddit_container = $(this.list_modal.find('div.modal-body .reddit-list'));
    this.reddit_textarea = $(this.reddit_container.find('textarea'));
    this.reddit_textarea.attr('readonly', 'readonly');
    this.simplecopy_container = $(this.list_modal.find('div.modal-body .simplecopy-list'));
    this.simplecopy_textarea = $(this.simplecopy_container.find('textarea'));
    this.simplecopy_textarea.attr('readonly', 'readonly');
    this.tts_container = $(this.list_modal.find('div.modal-body .tts-list'));
    this.tts_textarea = $(this.tts_container.find('textarea'));
    this.tts_textarea.attr('readonly', 'readonly');
    this.xws_container = $(this.list_modal.find('div.modal-body .xws-list'));
    this.xws_textarea = $(this.xws_container.find('textarea'));
    this.xws_textarea.attr('readonly', 'readonly');
    this.bbcode_container = $(this.list_modal.find('div.modal-body .bbcode-list'));
    this.bbcode_textarea = $(this.bbcode_container.find('textarea'));
    this.bbcode_textarea.attr('readonly', 'readonly');
    this.htmlview_container = $(this.list_modal.find('div.modal-body .html-list'));
    this.html_textarea = $(this.htmlview_container.find('textarea'));
    this.html_textarea.attr('readonly', 'readonly');
    this.toggle_vertical_space_container = $(this.list_modal.find('.vertical-space-checkbox'));
    this.toggle_color_print_container = $(this.list_modal.find('.color-print-checkbox'));
    this.toggle_color_skip_text = $(this.list_modal.find('.color-skip-text-checkbox'));
    this.toggle_maneuver_dial_container = $(this.list_modal.find('.maneuver-print-checkbox'));
    this.toggle_expanded_shield_hull_container = $(this.list_modal.find('.expanded-shield-hull-print-checkbox'));
    this.toggle_qrcode_container = $(this.list_modal.find('.qrcode-checkbox'));
    this.toggle_obstacle_container = $(this.list_modal.find('.obstacles-checkbox'));
    this.btn_print_list = ($(this.list_modal.find('.print-list')))[0];
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
          _this.simplecopy_container.hide();
          _this.reddit_container.hide();
          _this.tts_container.hide();
          _this.xws_container.hide();
          _this.bbcode_container.hide();
          _this.htmlview_container.hide();
          _this.toggle_vertical_space_container.hide();
          _this.toggle_color_print_container.hide();
          _this.toggle_color_skip_text.hide();
          _this.toggle_maneuver_dial_container.hide();
          _this.toggle_expanded_shield_hull_container.hide();
          _this.toggle_qrcode_container.show();
          _this.toggle_obstacle_container.show();
          return _this.btn_print_list.disabled = false;
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
          _this.simplecopy_container.hide();
          _this.reddit_container.hide();
          _this.tts_container.hide();
          _this.bbcode_container.hide();
          _this.htmlview_container.hide();
          _this.xws_container.hide();
          _this.toggle_vertical_space_container.show();
          _this.toggle_color_print_container.show();
          _this.toggle_color_skip_text.show();
          _this.toggle_maneuver_dial_container.show();
          _this.toggle_expanded_shield_hull_container.show();
          _this.toggle_qrcode_container.show();
          _this.toggle_obstacle_container.show();
          return _this.btn_print_list.disabled = false;
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
          _this.simplecopy_container.hide();
          _this.bbcode_container.hide();
          _this.tts_container.hide();
          _this.htmlview_container.hide();
          _this.xws_container.hide();
          _this.simple_container.hide();
          _this.fancy_container.hide();
          _this.reddit_textarea.select();
          _this.reddit_textarea.focus();
          _this.toggle_vertical_space_container.hide();
          _this.toggle_color_print_container.hide();
          _this.toggle_color_skip_text.hide();
          _this.toggle_maneuver_dial_container.hide();
          _this.toggle_expanded_shield_hull_container.hide();
          _this.toggle_qrcode_container.hide();
          _this.toggle_obstacle_container.hide();
          return _this.btn_print_list.disabled = true;
        }
      };
    })(this));
    this.select_simplecopy_view_button = $(this.list_modal.find('.select-simplecopy-view'));
    this.select_simplecopy_view_button.click((function(_this) {
      return function(e) {
        _this.select_simplecopy_view_button.blur();
        if (_this.list_display_mode !== 'simplecopy') {
          _this.list_modal.find('.list-display-mode .btn').removeClass('btn-inverse');
          _this.select_simplecopy_view_button.addClass('btn-inverse');
          _this.list_display_mode = 'simplecopy';
          _this.reddit_container.hide();
          _this.simplecopy_container.show();
          _this.bbcode_container.hide();
          _this.tts_container.hide();
          _this.htmlview_container.hide();
          _this.xws_container.hide();
          _this.simple_container.hide();
          _this.fancy_container.hide();
          _this.simplecopy_textarea.select();
          _this.simplecopy_textarea.focus();
          _this.toggle_vertical_space_container.hide();
          _this.toggle_color_print_container.hide();
          _this.toggle_color_skip_text.hide();
          _this.toggle_maneuver_dial_container.hide();
          _this.toggle_expanded_shield_hull_container.hide();
          _this.toggle_qrcode_container.hide();
          _this.toggle_obstacle_container.hide();
          return _this.btn_print_list.disabled = true;
        }
      };
    })(this));
    this.select_tts_view_button = $(this.list_modal.find('.select-tts-view'));
    this.select_tts_view_button.click((function(_this) {
      return function(e) {
        _this.select_tts_view_button.blur();
        if (_this.list_display_mode !== 'tts') {
          _this.list_modal.find('.list-display-mode .btn').removeClass('btn-inverse');
          _this.select_tts_view_button.addClass('btn-inverse');
          _this.list_display_mode = 'tts';
          _this.tts_container.show();
          _this.bbcode_container.hide();
          _this.htmlview_container.hide();
          _this.xws_container.hide();
          _this.simple_container.hide();
          _this.simplecopy_container.hide();
          _this.reddit_container.hide();
          _this.fancy_container.hide();
          _this.tts_textarea.select();
          _this.tts_textarea.focus();
          _this.toggle_vertical_space_container.hide();
          _this.toggle_color_print_container.hide();
          _this.toggle_color_skip_text.hide();
          _this.toggle_maneuver_dial_container.hide();
          _this.toggle_expanded_shield_hull_container.hide();
          _this.toggle_qrcode_container.hide();
          _this.toggle_obstacle_container.hide();
          return _this.btn_print_list.disabled = true;
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
          _this.simplecopy_container.hide();
          _this.reddit_container.hide();
          _this.tts_container.hide();
          _this.htmlview_container.hide();
          _this.xws_container.hide();
          _this.simple_container.hide();
          _this.fancy_container.hide();
          _this.bbcode_textarea.select();
          _this.bbcode_textarea.focus();
          _this.toggle_vertical_space_container.hide();
          _this.toggle_color_print_container.hide();
          _this.toggle_color_skip_text.hide();
          _this.toggle_maneuver_dial_container.hide();
          _this.toggle_expanded_shield_hull_container.hide();
          _this.toggle_qrcode_container.hide();
          _this.toggle_obstacle_container.hide();
          return _this.btn_print_list.disabled = true;
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
          _this.simplecopy_container.hide();
          _this.tts_container.hide();
          _this.bbcode_container.hide();
          _this.htmlview_container.show();
          _this.simple_container.hide();
          _this.fancy_container.hide();
          _this.xws_container.hide();
          _this.html_textarea.select();
          _this.html_textarea.focus();
          _this.toggle_vertical_space_container.hide();
          _this.toggle_color_print_container.hide();
          _this.toggle_color_skip_text.hide();
          _this.toggle_maneuver_dial_container.hide();
          _this.toggle_expanded_shield_hull_container.hide();
          _this.toggle_qrcode_container.hide();
          _this.toggle_obstacle_container.hide();
          return _this.btn_print_list.disabled = true;
        }
      };
    })(this));
    this.select_xws_view_button = $(this.list_modal.find('.select-xws-view'));
    this.select_xws_view_button.click((function(_this) {
      return function(e) {
        return _this.select_xws_view();
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
    this.game_type_selector.select2({
      minimumResultsForSearch: -1
    });
    this.game_type_selector.change((function(_this) {
      return function(e) {
        return _this.onGameTypeChanged(_this.game_type_selector.val());
      };
    })(this));
    this.desired_points_input = $(this.points_container.find('.desired-points'));
    this.desired_points_input.change((function(_this) {
      return function(e) {
        return _this.onPointsUpdated($.noop);
      };
    })(this));
    this.points_remaining_span = $(this.points_container.find('.points-remaining'));
    this.points_destroyed_span = $(this.points_container.find('.points-destroyed'));
    this.points_remaining_container = $(this.points_container.find('.points-remaining-container'));
    this.unreleased_content_used_container = $(this.points_container.find('.unreleased-content-used'));
    this.loading_failed_container = $(this.points_container.find('.loading-failed-container'));
    this.ship_number_invalid_container = $(this.points_container.find('.ship-number-invalid-container'));
    this.multi_faction_warning_container = $(this.points_container.find('.multi-faction-warning-container'));
    this.collection_invalid_container = $(this.points_container.find('.collection-invalid'));
    this.view_list_button = $(this.status_container.find('div.button-container button.view-as-text'));
    this.randomize_button = $(this.status_container.find('div.button-container button.randomize'));
    this.customize_randomizer = $(this.status_container.find('div.button-container a.randomize-options'));
    this.misc_settings = $(this.status_container.find('div.button-container a.misc-settings'));
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
    this.randomizer_options_modal.addClass('modal fade randomizer-modal');
    this.randomizer_options_modal.tabindex = "-1";
    this.randomizer_options_modal.role = "dialog";
    $('body').append(this.randomizer_options_modal);
    this.randomizer_options_modal.append($.trim(("<div class=\"modal-dialog modal-dialog-scrollable modal-dialog-centered\" role=\"document\">\n    <div class=\"modal-content\">\n        <div class=\"modal-header\">\n            <h3 class=\"translated\" defaultText=\"Random Squad Builder Options\"></h3>\n            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button>\n        </div>\n        <div class=\"modal-body\">\n            <form>\n                <label>\n                    <span class=\"translated\" defaultText=\"Maximal desired bid\"></span>\n                    <input type=\"number\" class=\"randomizer-bid-goal\" value=\"" + DEFAULT_RANDOMIZER_BID_GOAL + "\" placeholder=\"" + DEFAULT_RANDOMIZER_BID_GOAL + "\" />\n                </label><br />\n                <label>\n                    <span class=\"translated\" defaultText=\"Maximum Ship Count\"></span>\n                    <input type=\"number\" class=\"randomizer-ship-limit\" value=\"" + DEFAULT_RANDOMIZER_SHIP_LIMIT + "\" placeholder=\"" + DEFAULT_RANDOMIZER_SHIP_LIMIT + "\" />\n                </label><br />\n                <label>\n                    <span class=\"translated\" defaultText=\"More upgrades\"></span>\n                    <input type=\"range\" min=\"0\" max=\"10\" class=\"randomizer-ships-or-upgrades\" value=\"" + DEFAULT_RANDOMIZER_SHIPS_OR_UPGRADES + "\" placeholder=\"" + DEFAULT_RANDOMIZER_SHIPS_OR_UPGRADES + "\" />\n                    <span class=\"translated\" defaultText=\"Less upgrades\"></span>\n                </label><br />\n                <label>\n                    <input type=\"checkbox\" class=\"randomizer-collection-only\" checked=\"checked\"/> \n                    <span class=\"translated\" defaultText=\"Limit to collection\"></span>\n                </label><br />\n                <label>\n                    <span class=\"translated\" defaultText=\"Sets and Expansions\"></span>\n                    <select class=\"randomizer-sources\" multiple=\"1\" data-placeholder='") + this.uitranslation('All sets and expansions') + ("'>\n                    </select>\n                </label><br />\n                <label>\n                    <input type=\"checkbox\" class=\"randomizer-fill-zero-pts\" /> \n                    <span class=\"translated\" defaultText=\"Always fill 0-point slots\"></span>\n                </label><br />\n                <label>\n                    <span class=\"translated\" defaultText=\"Maximum Seconds to Spend Randomizing\"></span>\n                    <input type=\"number\" class=\"randomizer-timeout\" value=\"" + DEFAULT_RANDOMIZER_TIMEOUT_SEC + "\" placeholder=\"" + DEFAULT_RANDOMIZER_TIMEOUT_SEC + "\" />\n                </label>\n            </form>\n        </div>\n        <div class=\"modal-footer\">\n            <button class=\"btn btn-primary do-randomize translated\" aria-hidden=\"true\" defaultText=\"Roll!\"></button>\n            <button class=\"btn translated\" data-dismiss=\"modal\" aria-hidden=\"true\" defaultText=\"Close\"></button>\n        </div>\n    </div>\n</div>")));
    exportObj.translateUIElements(this.randomizer_options_modal);
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
    this.randomizer_collection_selector = ($(this.randomizer_options_modal.find('.randomizer-collection-only')))[0];
    this.randomizer_fill_zero_pts = ($(this.randomizer_options_modal.find('.randomizer-fill-zero-pts')))[0];
    this.randomize_button.click((function(_this) {
      return function(e) {
        var bid_goal, points, ship_limit, ships_or_upgrades, timeout_sec;
        e.preventDefault();
        if (_this.current_squad.dirty && (_this.backend != null)) {
          return _this.backend.warnUnsaved(_this, function() {
            return _this.randomize_button.click();
          });
        } else {
          points = parseInt(_this.desired_points_input.val());
          if (isNaN(points) || points <= 0) {
            points = DEFAULT_RANDOMIZER_POINTS;
          }
          bid_goal = parseInt($(_this.randomizer_options_modal.find('.randomizer-bid-goal')).val());
          if (isNaN(bid_goal) || bid_goal < 0) {
            bid_goal = DEFAULT_RANDOMIZER_BID_GOAL;
          }
          ship_limit = parseInt($(_this.randomizer_options_modal.find('.randomizer-ship-limit')).val());
          if (isNaN(ship_limit) || ship_limit < 0) {
            ship_limit = DEFAULT_RANDOMIZER_SHIP_LIMIT;
          }
          ships_or_upgrades = parseInt($(_this.randomizer_options_modal.find('.randomizer-ships-or-upgrades')).val());
          if (isNaN(ships_or_upgrades) || ships_or_upgrades < 0) {
            ships_or_upgrades = DEFAULT_RANDOMIZER_SHIPS_OR_UPGRADES;
          }
          timeout_sec = parseInt($(_this.randomizer_options_modal.find('.randomizer-timeout')).val());
          if (isNaN(timeout_sec) || timeout_sec <= 0) {
            timeout_sec = DEFAULT_RANDOMIZER_TIMEOUT_SEC;
          }
          return _this.randomSquad(points, _this.randomizer_source_selector.val(), timeout_sec * 1000, bid_goal, ship_limit, ships_or_upgrades, _this.randomizer_collection_selector.checked, _this.randomizer_fill_zero_pts.checked);
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
    this.misc_settings_modal = $(document.createElement('DIV'));
    this.misc_settings_modal.addClass('modal fade');
    this.misc_settings_modal.tabindex = "-1";
    this.misc_settings_modal.role = "dialog";
    $('body').append(this.misc_settings_modal);
    this.misc_settings_modal.append($.trim("<div class=\"modal-dialog modal-dialog-centered modal-dialog-scrollable\" role=\"document\">\n    <div class=\"modal-content\">\n        <div class=\"modal-header\">\n            <h3 class=\"translated\" defaultText=\"Miscellaneous Settings\"></h3>\n            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button>\n        </div>\n        <div class=\"modal-body\">\n            <label class = \"toggle-initiative-prefix-names misc-settings-label\">\n                <input type=\"checkbox\" class=\"initiative-prefix-names-checkbox misc-settings-checkbox\" /> <span class=\"translated\" defaultText=\"Use INI prefix\"></span> \n            </label><br />\n        </div>\n        <div class=\"modal-footer\">\n            <span class=\"misc-settings-infoline\"></span>\n            &nbsp;\n            <button class=\"btn translated\" data-dismiss=\"modal\" aria-hidden=\"true\" defaultText=\"Close\"></button>\n        </div>\n    </div>\n</div>"));
    this.misc_settings_infoline = $(this.misc_settings_modal.find('.misc-settings-infoline'));
    this.misc_settings_initiative_prefix = $(this.misc_settings_modal.find('.initiative-prefix-names-checkbox'));
    if (this.backend != null) {
      this.backend.getSettings((function(_this) {
        return function(st) {
          if (exportObj.settings == null) {
            exportObj.settings = [];
          }
          exportObj.settings.initiative_prefix = st.showInitiativeInFrontOfPilotName != null;
          if (st.showInitiativeInFrontOfPilotName != null) {
            return _this.misc_settings_initiative_prefix.prop('checked', true);
          }
        };
      })(this));
    } else {
      if (this.waiting_for_backend == null) {
        this.waiting_for_backend = [];
      }
      this.waiting_for_backend.push((function(_this) {
        return function() {
          return _this.backend.getSettings(function(st) {
            if (exportObj.settings == null) {
              exportObj.settings = [];
            }
            exportObj.settings.initiative_prefix = st.showInitiativeInFrontOfPilotName != null;
            if (st.showInitiativeInFrontOfPilotName != null) {
              return _this.misc_settings_initiative_prefix.prop('checked', true);
            }
          });
        };
      })(this));
    }
    this.misc_settings_initiative_prefix.click((function(_this) {
      return function(e) {
        if (exportObj.settings == null) {
          exportObj.settings = [];
        }
        exportObj.settings.initiative_prefix = _this.misc_settings_initiative_prefix.prop('checked');
        if (_this.backend != null) {
          if (_this.misc_settings_initiative_prefix.prop('checked')) {
            return _this.backend.set('showInitiativeInFrontOfPilotName', '1', function(ds) {
              _this.misc_settings_infoline.text(_this.uitranslation("Changes Saved"));
              return _this.misc_settings_infoline.fadeIn(100, function() {
                return _this.misc_settings_infoline.fadeOut(3000);
              });
            });
          } else {
            return _this.backend.deleteSetting('showInitiativeInFrontOfPilotName', function(dd) {
              _this.misc_settings_infoline.text(_this.uitranslation("Changes Saved"));
              return _this.misc_settings_infoline.fadeIn(100, function() {
                return _this.misc_settings_infoline.fadeOut(3000);
              });
            });
          }
        }
      };
    })(this));
    this.misc_settings.click((function(_this) {
      return function(e) {
        var _ref1;
        e.preventDefault();
        _this.misc_settings_modal.modal();
        return _this.misc_settings_initiative_prefix.prop('checked', (((_ref1 = exportObj.settings) != null ? _ref1.initiative_prefix : void 0) != null) && exportObj.settings.initiative_prefix);
      };
    })(this));
    exportObj.translateUIElements(this.misc_settings_modal);
    this.choose_obstacles_modal = $(document.createElement('DIV'));
    this.choose_obstacles_modal.addClass('modal fade choose-obstacles-modal');
    this.choose_obstacles_modal.tabindex = "-1";
    this.choose_obstacles_modal.role = "dialog";
    this.container.append(this.choose_obstacles_modal);
    this.choose_obstacles_modal.append($.trim("<div class=\"modal-dialog modal-dialog-centered modal-dialog-scrollable\" role=\"document\">\n    <div class=\"modal-content\">\n        <div class=\"modal-header\">\n            <label class='choose-obstacles-description translated' defaultText=\"Choose obstacles dialog\"></label>\n        </div>\n        <div class=\"modal-body\">\n            <div class=\"obstacle-select-container\" style=\"float:left\">\n                <select multiple class='obstacle-select' size=\"18\">\n                    <option class=\"coreasteroid0-select translated\" value=\"coreasteroid0\" defaultText=\"Core Asteroid 0\"></option>\n                    <option class=\"coreasteroid1-select translated\" value=\"coreasteroid1\" defaultText=\"Core Asteroid 1\"></option>\n                    <option class=\"coreasteroid2-select translated\" value=\"coreasteroid2\" defaultText=\"Core Asteroid 2\"></option>\n                    <option class=\"coreasteroid3-select translated\" value=\"coreasteroid3\" defaultText=\"Core Asteroid 3\"></option>\n                    <option class=\"coreasteroid4-select translated\" value=\"coreasteroid4\" defaultText=\"Core Asteroid 4\"></option>\n                    <option class=\"coreasteroid5-select translated\" value=\"coreasteroid5\" defaultText=\"Core Asteroid 5\"></option>\n                    <option class=\"yt2400debris0-select translated\" value=\"yt2400debris0\" defaultText=\"YT2400 Debris 0\"></option>\n                    <option class=\"yt2400debris1-select translated\" value=\"yt2400debris1\" defaultText=\"YT2400 Debris 1\"></option>\n                    <option class=\"yt2400debris2-select translated\" value=\"yt2400debris2\" defaultText=\"YT2400 Debris 2\"></option>\n                    <option class=\"vt49decimatordebris0-select translated\" value=\"vt49decimatordebris0\" defaultText=\"VT49 Debris 0\"></option>\n                    <option class=\"vt49decimatordebris1-select translated\" value=\"vt49decimatordebris1\" defaultText=\"VT49 Debris 1\"></option>\n                    <option class=\"vt49decimatordebris2-select translated\" value=\"vt49decimatordebris2\" defaultText=\"VT49 Debris 2\"></option>\n                    <option class=\"core2asteroid0-select translated\" value=\"core2asteroid0\" defaultText=\"Force Awakens Asteroid 0\"></option>\n                    <option class=\"core2asteroid1-select translated\" value=\"core2asteroid1\" defaultText=\"Force Awakens Asteroid 1\"></option>\n                    <option class=\"core2asteroid2-select translated\" value=\"core2asteroid2\" defaultText=\"Force Awakens Asteroid 2\"></option>\n                    <option class=\"core2asteroid3-select translated\" value=\"core2asteroid3\" defaultText=\"Force Awakens Asteroid 3\"></option>\n                    <option class=\"core2asteroid4-select translated\" value=\"core2asteroid4\" defaultText=\"Force Awakens Asteroid 4\"></option>\n                    <option class=\"core2asteroid5-select translated\" value=\"core2asteroid5\" defaultText=\"Force Awakens Asteroid 5\"></option>\n                    <option class=\"gascloud1-select translated\" value=\"gascloud1\" defaultText=\"Gas Cloud 1\"></option>\n                    <option class=\"gascloud2-select translated\" value=\"gascloud2\" defaultText=\"Gas Cloud 2\"></option>\n                    <option class=\"gascloud3-select translated\" value=\"gascloud3\" defaultText=\"Gas Cloud 3\"></option>\n                    <option class=\"gascloud4-select translated\" value=\"gascloud4\" defaultText=\"Gas Cloud 4\"></option>\n                    <option class=\"gascloud5-select translated\" value=\"gascloud5\" defaultText=\"Gas Cloud 5\"></option>\n                    <option class=\"gascloud6-select translated\" value=\"gascloud6\" defaultText=\"Gas Cloud 6\"></option>\n                </select>\n            </div>\n            <div class=\"obstacle-image-container\" style=\"display:none;\">\n                <img class=\"obstacle-image\" src=\"images/core2asteroid0.png\" />\n            </div>\n        </div>\n        <div class=\"modal-footer d-print-none\">\n            <button class=\"btn close-print-dialog translated\" data-dismiss=\"modal\" aria-hidden=\"true\" defaultText=\"Close\"></button>\n        </div>\n    </div>\n</div>"));
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
            obstacles: _this.getObstacles(),
            tag: _this.tag.val().substr(0, 1024)
          };
          _this.backend_status.html($.trim("<i class=\"fa fa-sync fa-spin\"></i>&nbsp;<span class=\"translated\" defaultText=\"Saving squad...\"></span>"));
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
              lineno: 3081
            }));
            __iced_deferrals._fulfill();
          })(function() {
            return __iced_k(results.success ? (_this.current_squad.dirty = false, _this.current_squad.id != null ? _this.backend_status.html($.trim("<i class=\"fa fa-check\"></i>&nbsp;<span class=\"translated\" defaultText=\"Squad updated successfully.\"></span>")) : (_this.backend_status.html($.trim("<i class=\"fa fa-check\"></i>&nbsp;<span class=\"translated\" defaultText=\"New squad saved successfully.\"></span>")), _this.current_squad.id = results.id), _this.container.trigger('xwing-backend:squadDirtinessChanged')) : (_this.backend_status.html($.trim("<i class=\"fa fa-exclamation-circle\"></i>&nbsp;" + results.error)), _this.backend_save_list_button.removeClass('disabled')));
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
    content_container.append($.trim("<div class=\"row\">\n    <div class=\"col-md-9 ship-container\">\n        <label class=\"unsortable notes-container show-authenticated col-md-10\">\n            <span class=\"notes-name translated\" defaultText=\"Squad Notes:\"></span>\n            <br />\n            <textarea class=\"squad-notes\"></textarea>\n            <br />\n            <span class=\"tag-name translated\" defaultText=\"Tag:\"></span>\n            <input type=\"search\" class=\"squad-tag\"></input>\n        </label>\n        <div class=\"unsortable obstacles-container\">\n                <button class=\"btn btn-info choose-obstacles\"><i class=\"fa fa-cloud\"></i>&nbsp;<span class=\"translated\" defaultText=\"Choose Obstacles\"</span></button>\n        </div>\n    </div>\n    <div class=\"col-md-3 info-container\" id=\"info-container\">\n    </div>\n</div>"));
    this.ship_container = $(content_container.find('div.ship-container'));
    this.info_container = $(content_container.find('div.info-container'));
    this.obstacles_container = content_container.find('.obstacles-container');
    this.notes_container = $(content_container.find('.notes-container'));
    this.notes = $(this.notes_container.find('textarea.squad-notes'));
    this.tag = $(this.notes_container.find('input.squad-tag'));
    this.ship_container.sortable({
      cancel: '.unsortable'
    });
    this.info_container.append($.trim(this.createInfoContainerUI()));
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
    this.condition_container.addClass('conditions-container d-flex flex-wrap');
    this.container.append(this.condition_container);
    this.mobile_tooltip_modal = $(document.createElement('DIV'));
    this.mobile_tooltip_modal.addClass('modal fade choose-obstacles-modal d-print-none');
    this.mobile_tooltip_modal.tabindex = "-1";
    this.mobile_tooltip_modal.role = "dialog";
    this.container.append(this.mobile_tooltip_modal);
    this.mobile_tooltip_modal.append($.trim("<div class=\"modal-dialog modal-dialog-centered modal-dialog-scrollable\" role=\"document\">\n    <div class=\"modal-content\">\n        <div class=\"modal-header\">\n        </div>\n        <div class=\"modal-body\">" + this.createInfoContainerUI() + "        </div>\n        <div class=\"modal-footer\">\n            <button class=\"btn btn-danger close-print-dialog translated\" data-dismiss=\"modal\" aria-hidden=\"true\" defaultText=\"Close\"></button>\n        </div>\n    </div>\n</div>"));
    return exportObj.translateUIElements(this.container);
  };

  SquadBuilder.prototype.createInfoContainerUI = function() {
    return "<div class=\"card info-well\">\n    <div class=\"info-name\"></div>\n    <div class=\"info-type\"></div>\n    <span class=\"info-collection\"></span>\n    <table class=\"table-sm\">\n        <tbody>\n            <tr class=\"info-ship\">\n                <td class=\"info-header translated\" defaultText=\"Ship\"></td>\n                <td class=\"info-data\"></td>\n            </tr>\n            <tr class=\"info-base\">\n                <td class=\"info-header translated\" defaultText=\"Base\"></td>\n                <td class=\"info-data\"></td> \n            </tr>\n            <tr class=\"info-skill\">\n                <td class=\"info-header translated\" defaultText=\"Initiative\"></td>\n                <td class=\"info-data info-skill\"></td>\n            </tr>\n            <tr class=\"info-engagement\">\n                <td class=\"info-header translated\" defaultText=\"Engagement\"></td>\n                <td class=\"info-data info-engagement\"></td>\n            </tr>\n            <tr class=\"info-attack-bullseye\">\n                <td class=\"info-header\"><i class=\"xwing-miniatures-font header-attack xwing-miniatures-font-bullseyearc\"></i></td>\n                <td class=\"info-data info-attack\"></td>\n            </tr>\n            <tr class=\"info-attack\">\n                <td class=\"info-header\"><i class=\"xwing-miniatures-font header-attack xwing-miniatures-font-frontarc\"></i></td>\n                <td class=\"info-data info-attack\"></td>\n            </tr>\n            <tr class=\"info-attack-fullfront\">\n                <td class=\"info-header\"><i class=\"xwing-miniatures-font header-attack xwing-miniatures-font-fullfrontarc\"></i></td>\n                <td class=\"info-data info-attack\"></td>\n            </tr>\n            <tr class=\"info-attack-left\">\n                <td class=\"info-header\"><i class=\"xwing-miniatures-font header-attack xwing-miniatures-font-leftarc\"></i></td>\n                <td class=\"info-data info-attack\"></td>\n            </tr>\n            <tr class=\"info-attack-right\">\n                <td class=\"info-header\"><i class=\"xwing-miniatures-font header-attack xwing-miniatures-font-rightarc\"></i></td>\n                <td class=\"info-data info-attack\"></td>\n            </tr>\n            <tr class=\"info-attack-back\">\n                <td class=\"info-header\"><i class=\"xwing-miniatures-font header-attack xwing-miniatures-font-reararc\"></i></td>\n                <td class=\"info-data info-attack\"></td>\n            </tr>\n            <tr class=\"info-attack-turret\">\n                <td class=\"info-header\"><i class=\"xwing-miniatures-font header-attack xwing-miniatures-font-singleturretarc\"></i></td>\n                <td class=\"info-data info-attack\"></td>\n            </tr>\n            <tr class=\"info-attack-doubleturret\">\n                <td class=\"info-header\"><i class=\"xwing-miniatures-font header-attack xwing-miniatures-font-doubleturretarc\"></i></td>\n                <td class=\"info-data info-attack\"></td>\n            </tr>\n            <tr class=\"info-agility\">\n                <td class=\"info-header\"><i class=\"xwing-miniatures-font header-agility xwing-miniatures-font-agility\"></i></td>\n                <td class=\"info-data info-agility\"></td>\n            </tr>\n            <tr class=\"info-hull\">\n                <td class=\"info-header\"><i class=\"xwing-miniatures-font header-hull xwing-miniatures-font-hull\"></i></td>\n                <td class=\"info-data info-hull\"></td>\n            </tr>\n            <tr class=\"info-shields\">\n                <td class=\"info-header\"><i class=\"xwing-miniatures-font header-shield xwing-miniatures-font-shield\"></i></td>\n                <td class=\"info-data info-shields\"></td>\n            </tr>\n            <tr class=\"info-force\">\n                <td class=\"info-header\"><i class=\"xwing-miniatures-font header-force xwing-miniatures-font-forcecharge\"></i></td>\n                <td class=\"info-data info-force\"></td>\n            </tr>\n            <tr class=\"info-charge\">\n                <td class=\"info-header\"><i class=\"xwing-miniatures-font header-charge xwing-miniatures-font-charge\"></i></td>\n                <td class=\"info-data info-charge\"></td>\n            </tr>\n            <tr class=\"info-energy\">\n                <td class=\"info-header\"><i class=\"xwing-miniatures-font header-energy xwing-miniatures-font-energy\"></i></td>\n                <td class=\"info-data info-energy\"></td>\n            </tr>\n            <tr class=\"info-range\">\n                <td class=\"info-header translated\" defaultText=\"Range\"></td>\n                <td class=\"info-data info-range\"></td><td class=\"info-rangebonus\"><i class=\"xwing-miniatures-font red header-range xwing-miniatures-font-rangebonusindicator\"></i></td>\n            </tr>\n            <tr class=\"info-actions\">\n                <td class=\"info-header translated\" defaultText=\"Actions\"></td>\n                <td class=\"info-data\"></td>\n            </tr>\n            <tr class=\"info-upgrades\">\n                <td class=\"info-header translated\" defaultText=\"Upgrades\"></td>\n                <td class=\"info-data\"></td>\n            </tr>\n        </tbody>\n    </table>\n    <p class=\"info-restrictions\"></p>\n    <p class=\"info-text\"></p>\n    <p class=\"info-maneuvers\"></p>\n    <br />\n    <span class=\"info-header info-sources translated\" defaultText=\"Sources:\"></span> \n    <span class=\"info-data info-sources\"></span>\n</div>";
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
      return function(e, squad, cb) {
        if (cb == null) {
          cb = $.noop;
        }
        _this.onSquadLoadRequested(squad);
        return cb();
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
        if (cb == null) {
          cb = $.noop;
        }
        _this.pretranslation_serialized = _this.serialize();
        return cb();
      };
    })(this)).on('xwing:afterLanguageLoad', (function(_this) {
      return function(e, language, cb) {
        var old_dirty, ship, _i, _len, _ref;
        if (cb == null) {
          cb = $.noop;
        }
        if (_this.language !== language) {
          _this.language = language;
          old_dirty = _this.current_squad.dirty;
          if (_this.pretranslation_serialized.length != null) {
            _this.loadFromSerialized(_this.pretranslation_serialized);
          }
          _ref = _this.ships;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            ship = _ref[_i];
            ship.updateSelections();
          }
          _this.current_squad.dirty = old_dirty;
          _this.pretranslation_serialized = void 0;
        }
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
        _this.checkCollection();
        return _this.collection_button.removeClass('d-none');
      };
    })(this)).on('xwing-collection:changed', (function(_this) {
      return function(e, collection) {
        return _this.checkCollection();
      };
    })(this)).on('xwing-collection:destroyed', (function(_this) {
      return function(e, collection) {
        _this.collection = null;
        return _this.collection_button.addClass('d-none');
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
    })(this)).on('xwing:gameTypeChanged', (function(_this) {
      return function(e, gameType, cb) {
        if (cb == null) {
          cb = $.noop;
        }
        _this.onGameTypeChanged(gameType, cb);
        if (_this.game_type_selector.val() !== gameType) {
          return _this.game_type_selector.val(gameType).trigger('change');
        }
      };
    })(this));
    this.ship_container.on('sortstart', (function(_this) {
      return function(e, ui) {
        return _this.oldIndex = ui.item.index();
      };
    })(this)).on('sortstop', (function(_this) {
      return function(e, ui) {
        return _this.updateShipOrder(_this.oldIndex, ui.item.index());
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
          _this.container.trigger('xwing-backend:squadDirtinessChanged');
          return _this.container.trigger('xwing:pointsUpdated');
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
        var container, expanded_hull_and_shield, faction, query, ship, text, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3;
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
            if (_this.list_modal.find('.toggle-skip-text-print').prop('checked')) {
              _ref1 = _this.printable_container.find('.upgrade-text, .fancy-pilot-text');
              for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                text = _ref1[_j];
                text.hidden = true;
              }
            }
            if (_this.list_modal.find('.toggle-maneuver-print').prop('checked')) {
              _this.printable_container.find('.printable-body').append(_this.getSquadDialsAsHTML());
            }
            expanded_hull_and_shield = _this.list_modal.find('.toggle-expanded-shield-hull-print').prop('checked');
            _ref2 = _this.printable_container.find('.expanded-hull-or-shield');
            for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
              container = _ref2[_k];
              container.hidden = !expanded_hull_and_shield;
            }
            _ref3 = _this.printable_container.find('.simple-hull-or-shield');
            for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
              container = _ref3[_l];
              container.hidden = expanded_hull_and_shield;
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
                  return 'rebel-outline';
                case 'First Order':
                  return 'firstorder';
                case 'Galactic Republic':
                  return 'republic';
                case 'Separatist Alliance':
                  return 'separatists';
                case 'All':
                  return 'first-player-4';
              }
            }).call(_this);
            _this.printable_container.find('.squad-faction').html("<i class=\"xwing-miniatures-font xwing-miniatures-font-" + faction + "\"></i>");
        }
        if (_this.isHyperspace) {
          _this.printable_container.find('.squad-name').append(" <i class=\"xwing-miniatures-font xwing-miniatures-font-first-player-1\"></i>");
        }
        if (_this.isEpic) {
          _this.printable_container.find('.squad-name').append(" <i class=\"xwing-miniatures-font xwing-miniatures-font-energy\"></i>");
        }
        _this.printable_container.find('.printable-body').append($.trim("<div class=\"version\"><span class=\"translated\" defaultText=\"Points Version:\"></span> 1.9.0 March 2021</div>"));
        if ($.trim(_this.notes.val()) !== '') {
          _this.printable_container.find('.printable-body').append($.trim("<h5 class=\"print-notes translated\" defaultText=\"Notes:\"></h5>\n<pre class=\"print-notes\"></pre>"));
          _this.printable_container.find('.printable-body pre.print-notes').text(_this.notes.val());
        } else {

        }
        _this.printable_container.find('.printable-body').append($.trim("<div class=\"print-conditions\"></div>"));
        _this.printable_container.find('.printable-body .print-conditions').html(_this.condition_container.html());
        if (_this.list_modal.find('.toggle-obstacles').prop('checked')) {
          _this.printable_container.find('.printable-body').append($.trim("<div class=\"obstacles\">\n    <div class=\"translated\" defaultText=\"Mark obstacles\"></div>\n    <img class=\"obstacle-silhouettes\" src=\"images/xws-obstacles.png\" />\n</div>"));
        }
        query = _this.getPermaLinkParams(['sn', 'obs']);
        if ((query != null) && _this.list_modal.find('.toggle-juggler-qrcode').prop('checked')) {
          _this.printable_container.find('.printable-body').append($.trim("<div class=\"qrcode-container\">\n    <div class=\"permalink-container\">\n        <div class=\"qrcode\"></div>\n        <div class=\"qrcode-text translated\" defaultText=\"Scan QR-Code\"></div>\n    </div>\n    <div class=\"juggler-container\">\n        <div class=\"qrcode\"></div>\n        <div class=\"qrcode-text translated\" defaultText=\"List Juggler QR-Code\"></div>\n    </div>\n</div>"));
          text = "https://yasb-xws.herokuapp.com/juggler" + query;
          _this.printable_container.find('.juggler-container .qrcode').qrcode({
            render: 'div',
            ec: 'M',
            size: text.length < 144 ? 144 : 160,
            text: text
          });
          text = "https://raithos.github.io/" + query;
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
        var ship, _i, _len, _ref, _results;
        if ($(window).width() < 768 && _this.list_display_mode !== 'simple') {
          _this.select_simple_view_button.click();
        }
        _ref = _this.ships;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          ship = _ref[_i];
          _results.push(ship.checkPilotSelectorQueryModal());
        }
        return _results;
      };
    })(this));
    this.notes.change(this.onNotesUpdated);
    this.tag.change(this.onNotesUpdated);
    this.notes.on('keyup', this.onNotesUpdated);
    return this.tag.on('keyup', this.onNotesUpdated);
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

  SquadBuilder.prototype.updateShipOrder = function(oldpos, newpos) {
    var selectedShip;
    selectedShip = this.ships[oldpos];
    this.ships.splice(oldpos, 1);
    this.ships.splice(newpos, 0, selectedShip);
    this.updatePermaLink;
    if (oldpos !== newpos) {
      this.current_squad.dirty = true;
      return this.container.trigger('xwing-backend:squadDirtinessChanged');
    }
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
    var oldEpic, oldHyperspace, oldQuickbuild, old_id;
    if (cb == null) {
      cb = $.noop;
    }
    oldHyperspace = this.isHyperspace;
    oldEpic = this.isEpic;
    oldQuickbuild = this.isQuickbuild;
    this.isHyperspace = false;
    this.isEpic = false;
    this.isQuickbuild = false;
    switch (gametype) {
      case 'standard':
        this.desired_points_input.val(200);
        break;
      case 'hyperspace':
        this.isHyperspace = true;
        this.desired_points_input.val(200);
        break;
      case 'epic':
        this.isEpic = true;
        this.desired_points_input.val(500);
        break;
      case 'quickbuild':
        this.isQuickbuild = true;
        this.desired_points_input.val(8);
    }
    if (oldQuickbuild !== this.isQuickbuild) {
      old_id = this.current_squad.id;
      this.newSquadFromScratch($.trim(this.current_squad.name));
      this.current_squad.id = old_id;
    } else {
      old_id = this.current_squad.id;
      this.container.trigger('xwing:pointsUpdated', $.noop);
      this.container.trigger('xwing:shipUpdated');
    }
    return cb();
  };

  SquadBuilder.prototype.addStandardizedToList = function(ship) {
    var idx, ship_upgrade, _i, _len, _ref, _ref1, _results;
    if (((_ref = ship.data) != null ? _ref.name : void 0) != null) {
      idx = this.standard_list['Ship'].indexOf(ship.data.name);
      if (idx > -1) {
        _ref1 = ship.upgrades;
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          ship_upgrade = _ref1[_i];
          if (ship_upgrade.slot === this.standard_list['Upgrade'][idx].slot) {
            ship_upgrade.setData(this.standard_list['Upgrade'][idx]);
            break;
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    }
  };

  SquadBuilder.prototype.onPointsUpdated = function(cb) {
    var bbcode_ships, conditions, conditions_set, htmlview_ships, i, obstacle, obstacles, points_dest, points_destroyed, points_left, reddit_ships, ship, ship_uses_unreleased_content, simplecopy_ships, tot_points, tts_obstacles, tts_ships, unreleased_content_used, _i, _j, _k, _l, _len, _len1, _len2, _ref, _ref1, _ref2;
    if (cb == null) {
      cb = $.noop;
    }
    tot_points = 0;
    points_dest = 0;
    unreleased_content_used = false;
    for (i = _i = _ref = this.ships.length - 1; _ref <= -1 ? _i < -1 : _i > -1; i = _ref <= -1 ? ++_i : --_i) {
      ship = this.ships[i];
      ship.validate();
      if (!ship) {
        continue;
      }
      this.addStandardizedToList(ship);
      tot_points += ship.getPoints();
      if (ship.destroystate === 1) {
        points_dest += Math.ceil(ship.getPoints() / 2);
      } else if (ship.destroystate === 2) {
        points_dest += ship.getPoints();
      }
      ship_uses_unreleased_content = ship.checkUnreleasedContent();
      if (ship_uses_unreleased_content) {
        unreleased_content_used = ship_uses_unreleased_content;
      }
    }
    this.total_points = tot_points;
    this.points_destroyed = points_dest;
    this.total_points_span.text(this.total_points);
    points_left = parseInt(this.desired_points_input.val()) - this.total_points;
    points_destroyed = parseInt(this.total_points);
    this.points_remaining_span.text(points_left);
    this.points_destroyed_span.html(points_dest !== 0 ? "<i class=\"xwing-miniatures-font xwing-miniatures-font-hit\"></i>" + points_dest : "");
    this.points_remaining_container.toggleClass('red', points_left < 0);
    this.unreleased_content_used_container.toggleClass('d-none', !unreleased_content_used);
    this.fancy_total_points_container.text(this.total_points);
    this.fancy_container.text('');
    this.simple_container.html('<table class="simple-table"></table>');
    simplecopy_ships = [];
    reddit_ships = [];
    tts_ships = [];
    bbcode_ships = [];
    htmlview_ships = [];
    _ref1 = this.ships;
    for (_j = 0, _len = _ref1.length; _j < _len; _j++) {
      ship = _ref1[_j];
      if (ship.pilot != null) {
        this.fancy_container.append(ship.toHTML());
        this.simple_container.find('table').append(ship.toTableRow());
        simplecopy_ships.push(ship.toSimpleCopy());
        reddit_ships.push(ship.toRedditText());
        tts_ships.push(ship.toTTSText());
        bbcode_ships.push(ship.toBBCode());
        htmlview_ships.push(ship.toSimpleHTML());
      }
    }
    this.htmlview_container.find('textarea').val($.trim("" + (htmlview_ships.join('<br />')) + "\n<br />\n<b><i>Total: " + this.total_points + "</i></b>\n<br />\n<a href=\"" + (this.getPermaLink()) + "\">" + (this.uitranslation("View in YASB")) + "</a>"));
    this.reddit_container.find('textarea').val($.trim("" + (reddit_ships.join("    \n")) + "    \n**" + (this.uitranslation('Total')) + ":** *" + this.total_points + "*    \n    \n[" + (this.uitranslation('View in YASB')) + "](" + (this.getPermaLink()) + ")"));
    this.simplecopy_container.find('textarea').val($.trim("" + (simplecopy_ships.join("")) + "    \n" + (this.uitranslation('Total')) + ": " + this.total_points + "    \n    \n" + (this.uitranslation('View in YASB')) + ": " + (this.getPermaLink())));
    obstacles = this.getObstacles();
    if (((obstacles != null) && obstacles.length > 0) && (tts_ships.length > 0)) {
      tts_ships[tts_ships.length - 1] = tts_ships[tts_ships.length - 1].slice(0, -2);
      tts_obstacles = ' |';
      for (_k = 0, _len1 = obstacles.length; _k < _len1; _k++) {
        obstacle = obstacles[_k];
        if (obstacle != null) {
          tts_obstacles += " " + obstacle + " /";
        }
      }
      tts_obstacles = tts_obstacles.slice(0, -1);
      tts_ships.push(tts_obstacles);
    }
    this.tts_textarea.val($.trim("" + (tts_ships.join(""))));
    this.xws_textarea.val($.trim(JSON.stringify(this.toXWS())));
    $('#xws-qrcode-container').text('');
    $('#xws-qrcode-container').qrcode({
      render: 'canvas',
      text: JSON.stringify(this.toMinimalXWS()),
      ec: 'L',
      size: 128
    });
    this.bbcode_container.find('textarea').val($.trim("" + (bbcode_ships.join("\n\n")) + "\n[b][i]" + (this.uitranslation('Total')) + ": " + this.total_points + "[/i][/b]\n\n[url=" + (this.getPermaLink()) + "]" + (this.uitranslation('View in YASB')) + "[/url]"));
    this.checkCollection();
    if (typeof Set !== "undefined" && Set !== null) {
      conditions_set = new Set();
      _ref2 = this.ships;
      for (_l = 0, _len2 = _ref2.length; _l < _len2; _l++) {
        ship = _ref2[_l];
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
    var _ref, _ref1;
    this.current_squad = squad;
    this.backend_delete_list_button.removeClass('disabled');
    this.squad_name_input.val(this.current_squad.name);
    this.squad_name_placeholder.text(this.current_squad.name);
    this.current_obstacles = this.current_squad.additional_data.obstacles;
    this.updateObstacleSelect(this.current_squad.additional_data.obstacles);
    if (squad.serialized.length != null) {
      this.loadFromSerialized(squad.serialized);
    }
    this.notes.val((_ref = squad.additional_data.notes) != null ? _ref : '');
    this.tag.val((_ref1 = squad.additional_data.tag) != null ? _ref1 : '');
    this.backend_status.fadeOut('slow');
    this.current_squad.dirty = false;
    this.container.trigger('xwing-backend:squadDirtinessChanged');
    return this.container.trigger('xwing-backend:squadNameChanged');
  };

  SquadBuilder.prototype.onSquadDirtinessChanged = function() {
    this.current_squad.name = $.trim(this.squad_name_input.val());
    this.backend_save_list_button.toggleClass('disabled', !(this.current_squad.dirty && this.total_points > 0));
    this.backend_save_list_as_button.toggleClass('disabled', this.total_points === 0);
    this.backend_delete_list_button.toggleClass('disabled', this.current_squad.id == null);
    if (this.ships.length > 1) {
      return $('meta[property="og:description"]').attr("content", this.uitranslation("X-Wing Squadron by YASB 2.0: ") + this.current_squad.name + ": " + this.describeSquad());
    } else {
      return $('meta[property="og:description"]').attr("content", this.uitranslation("YASB advertisment"));
    }
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
    this.squad_name_input.val(this.current_squad.name);
    if ($.getParameterByName('f') !== this.faction) {
      return;
    }
    if (this.current_squad.name !== this.uitranslation("Unnamed Squadron") && this.current_squad.name !== this.uitranslation("Unsaved Squadron")) {
      if (document.title !== "YASB 2.0 - " + this.current_squad.name) {
        return document.title = "YASB 2.0 - " + this.current_squad.name;
      }
    } else {
      return document.title = "YASB 2.0";
    }
  };

  SquadBuilder.prototype.removeAllShips = function() {
    while (this.ships.length > 0) {
      this.removeShip(this.ships[0]);
    }
    if (this.ships.length > 0) {
      throw new Error(this.uitranslation("Ships not emptied"));
    }
  };

  SquadBuilder.prototype.showTextListModal = function() {
    return this.list_modal.modal('show');
  };

  SquadBuilder.prototype.showXWSModal = function(xws) {
    this.select_xws_view();
    return this.showTextListModal();
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
    var game_type_abbrev, selected_points, serialization_version, ship;
    serialization_version = 8;
    game_type_abbrev = (function() {
      switch (this.game_type_selector.val()) {
        case 'standard':
          return 's';
        case 'hyperspace':
          return 'h';
        case 'epic':
          return 'e';
        case 'quickbuild':
          return 'q';
      }
    }).call(this);
    selected_points = $.trim(this.desired_points_input.val());
    return "v" + serialization_version + "Z" + game_type_abbrev + "Z" + selected_points + "Z" + (((function() {
      var _i, _len, _ref, _results;
      _ref = this.ships;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        ship = _ref[_i];
        if ((ship.pilot != null) && (!this.isQuickbuild || ship.primary)) {
          _results.push(ship.toSerialized());
        }
      }
      return _results;
    }).call(this)).join('Y'));
  };

  SquadBuilder.prototype.changeGameTypeOnSquadLoad = function(gametype) {
    if (this.game_type_selector.val() !== gametype) {
      return $(window).trigger('xwing:gameTypeChanged', gametype);
    }
  };

  SquadBuilder.prototype.loadFromSerialized = function(serialized) {
    var desired_points, g, game_type_abbrev, game_type_and_point_abbrev, matches, new_ship, p, re, s, serialized_ship, serialized_ships, ship, ship_splitter, ships_with_unmet_dependencies, version, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3;
    this.suppress_automatic_new_ship = true;
    this.removeAllShips();
    re = __indexOf.call(serialized, "Z") >= 0 ? /^v(\d+)Z(.*)/ : /^v(\d+)!(.*)/;
    matches = re.exec(serialized);
    if (matches != null) {
      version = parseInt(matches[1]);
      ship_splitter = version > 7 ? 'Y' : ';';
      _ref2 = version > 7 ? ((_ref = matches[2].split('Z'), g = _ref[0], p = _ref[1], s = _ref[2], _ref), [g, parseInt(p), s]) : ((_ref1 = matches[2].split('!'), game_type_and_point_abbrev = _ref1[0], s = _ref1[1], _ref1), parseInt(game_type_and_point_abbrev.split('=')[1]) ? p = parseInt(game_type_and_point_abbrev.split('=')[1]) : p = 200, g = game_type_and_point_abbrev.split('=')[0], [g, p, s]), game_type_abbrev = _ref2[0], desired_points = _ref2[1], serialized_ships = _ref2[2];
      if (serialized_ships == null) {
        this.loading_failed_container.toggleClass('d-none', false);
        return;
      }
      switch (game_type_abbrev) {
        case 's':
          this.changeGameTypeOnSquadLoad('standard');
          break;
        case 'h':
          this.changeGameTypeOnSquadLoad('hyperspace');
          break;
        case 'e':
          this.changeGameTypeOnSquadLoad('epic');
          break;
        case 'q':
          this.changeGameTypeOnSquadLoad('quickbuild');
      }
      this.desired_points_input.val(desired_points);
      this.desired_points_input.change();
      ships_with_unmet_dependencies = [];
      if (serialized_ships.length != null) {
        _ref3 = serialized_ships.split(ship_splitter);
        for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
          serialized_ship = _ref3[_i];
          if (serialized_ship !== '') {
            new_ship = this.addShip();
            if ((!new_ship.fromSerialized(version, serialized_ship)) || !new_ship.pilot) {
              ships_with_unmet_dependencies.push([new_ship, serialized_ship]);
            }
          }
        }
        for (_j = 0, _len1 = ships_with_unmet_dependencies.length; _j < _len1; _j++) {
          ship = ships_with_unmet_dependencies[_j];
          if (!ship[0].pilot) {
            ship[0] = this.addShip();
          }
          ship[0].fromSerialized(version, ship[1]);
        }
      }
    }
    this.suppress_automatic_new_ship = false;
    return this.addShip();
  };

  SquadBuilder.prototype.select_xws_view = function() {
    this.select_xws_view_button.blur();
    if (this.list_display_mode !== 'xws') {
      this.list_modal.find('.list-display-mode .btn').removeClass('btn-inverse');
      this.select_xws_view_button.addClass('btn-inverse');
      this.list_display_mode = 'xws';
      this.xws_container.show();
      this.bbcode_container.hide();
      this.htmlview_container.hide();
      this.simple_container.hide();
      this.simplecopy_container.hide();
      this.reddit_container.hide();
      this.fancy_container.hide();
      this.tts_container.hide();
      this.xws_textarea.select();
      this.xws_textarea.focus();
      this.toggle_vertical_space_container.hide();
      this.toggle_color_print_container.hide();
      this.toggle_color_skip_text.hide();
      this.toggle_maneuver_dial_container.hide();
      this.toggle_expanded_shield_hull_container.hide();
      this.toggle_qrcode_container.hide();
      this.toggle_obstacle_container.hide();
      return this.btn_print_list.disabled = true;
    }
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
      if (unique.solitary != null) {
        this.uniques_in_use['Slot'].push(unique.slot);
      }
      this.uniques_in_use[type].push(unique);
    } else {
      throw new Error("Unique " + type + " '" + unique.name + "' already claimed");
    }
    return cb();
  };

  SquadBuilder.prototype.releaseUnique = function(unique, type, cb) {
    var idx, u, uniques, _i, _j, _len, _len1, _ref;
    idx = this.uniqueIndex(unique, type);
    if (idx >= 0) {
      _ref = this.uniques_in_use;
      for (type in _ref) {
        uniques = _ref[type];
        if (type === 'Slot') {
          if (unique.solitary != null) {
            this.uniques_in_use[type] = [];
            for (_i = 0, _len = uniques.length; _i < _len; _i++) {
              u = uniques[_i];
              if (u !== unique.slot) {
                this.uniques_in_use[type].push(u.slot);
              }
            }
          }
        } else {
          this.uniques_in_use[type] = [];
          for (_j = 0, _len1 = uniques.length; _j < _len1; _j++) {
            u = uniques[_j];
            if (u.canonical_name.getXWSBaseName() !== unique.canonical_name.getXWSBaseName()) {
              this.uniques_in_use[type].push(u);
            }
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
    this.ship_number_invalid_container.toggleClass('d-none', this.ships.length < 10 && this.ships.length > 2);
    this.multi_faction_warning_container.toggleClass('d-none', this.faction !== "All");
    return new_ship;
  };

  SquadBuilder.prototype.removeShip = function(ship, cb) {
    var ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    if (cb == null) {
      cb = $.noop;
    }
    (function(_this) {
      return (function(__iced_k) {
        if ((ship != null ? ship.destroy : void 0) != null) {
          (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              funcname: "SquadBuilder.removeShip"
            });
            ship.destroy(__iced_deferrals.defer({
              lineno: 3944
            }));
            __iced_deferrals._fulfill();
          })(function() {
            (function(__iced_k) {
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral,
                funcname: "SquadBuilder.removeShip"
              });
              _this.container.trigger('xwing:pointsUpdated', __iced_deferrals.defer({
                lineno: 3945
              }));
              __iced_deferrals._fulfill();
            })(function() {
              _this.current_squad.dirty = true;
              _this.container.trigger('xwing-backend:squadDirtinessChanged');
              _this.ship_number_invalid_container.toggleClass('d-none', _this.ships.length < 10 && _this.ships.length > 2);
              return __iced_k(_this.multi_faction_warning_container.toggleClass('d-none', _this.faction !== "All"));
            });
          });
        } else {
          return __iced_k();
        }
      });
    })(this)((function(_this) {
      return function() {
        return cb();
      };
    })(this));
  };

  SquadBuilder.prototype.matcher = function(item, term) {
    return item.toUpperCase().indexOf(term.toUpperCase()) >= 0;
  };

  SquadBuilder.prototype.isOurFaction = function(faction, alt_faction) {
    var check_faction, f, _i, _len;
    if (alt_faction == null) {
      alt_faction = '';
    }
    check_faction = this.faction;
    if (this.faction === "All") {
      if (alt_faction !== '') {
        check_faction = alt_faction;
      } else {
        return true;
      }
    }
    if (faction instanceof Array) {
      for (_i = 0, _len = faction.length; _i < _len; _i++) {
        f = faction[_i];
        if (getPrimaryFaction(f) === check_faction) {
          return true;
        }
      }
      return false;
    } else {
      return getPrimaryFaction(faction) === check_faction;
    }
  };

  SquadBuilder.prototype.isItemAvailable = function(item_data, shipCheck) {
    if (shipCheck == null) {
      shipCheck = false;
    }
    if (this.isQuickbuild) {
      return true;
    } else if (this.isHyperspace) {
      return exportObj.hyperspaceCheck(item_data, this.faction, shipCheck);
    } else if (!this.isEpic) {
      return exportObj.epicExclusions(item_data);
    } else {
      return true;
    }
  };

  SquadBuilder.prototype.getAvailableShipsMatching = function(term, sorted, collection_only) {
    var ship_data, ship_name, ships, _ref;
    if (term == null) {
      term = '';
    }
    if (sorted == null) {
      sorted = true;
    }
    if (collection_only == null) {
      collection_only = false;
    }
    ships = [];
    _ref = exportObj.ships;
    for (ship_name in _ref) {
      ship_data = _ref[ship_name];
      if (this.isOurFaction(ship_data.factions) && (this.matcher(ship_data.name, term) || (ship_data.display_name && this.matcher(ship_data.display_name, term)))) {
        if (this.isItemAvailable(ship_data, true)) {
          if (!collection_only || ((this.collection != null) && (this.collection.checks.collectioncheck === "true") && this.collection.checkShelf('ship', ship_data.name))) {
            ships.push({
              id: ship_data.name,
              text: ship_data.display_name ? ship_data.display_name : ship_data.name,
              name: ship_data.name,
              display_name: ship_data.display_name,
              canonical_name: ship_data.canonical_name,
              xws: ship_data.xws,
              icon: ship_data.icon ? ship_data.icon : ship_data.xws
            });
          }
        }
      }
    }
    if (sorted) {
      ships.sort(exportObj.sortHelper);
    }
    return ships;
  };

  SquadBuilder.prototype.getAvailableShipsMatchingAndCheapEnough = function(points, term, sorted, collection_only) {
    var cheap_ships, pilots, possible_ships, ship, _i, _len;
    if (term == null) {
      term = '';
    }
    if (sorted == null) {
      sorted = false;
    }
    if (collection_only == null) {
      collection_only = false;
    }
    possible_ships = this.getAvailableShipsMatching(term, sorted, collection_only);
    cheap_ships = [];
    for (_i = 0, _len = possible_ships.length; _i < _len; _i++) {
      ship = possible_ships[_i];
      pilots = this.getAvailablePilotsForShipIncluding(ship.name, null, '', true);
      if (pilots.length && pilots[0].points <= points) {
        cheap_ships.push(ship);
      }
    }
    return cheap_ships;
  };

  SquadBuilder.prototype.getAvailablePilotsForShipIncluding = function(ship, include_pilot, term, sorted, ship_selector) {
    var allowed_quickbuilds_containing_uniques_in_use, available_faction_pilots, eligible_faction_pilots, id, include_pilot_pilot, include_quickbuild, include_upgrade, include_upgrade_name, other, pilot, pilot_name, quickbuild, quickbuilds_matching_ship_and_faction, retval, uniques_in_use_by_pilot_in_use, upgrade, upgradedata, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3;
    if (term == null) {
      term = '';
    }
    if (sorted == null) {
      sorted = true;
    }
    if (ship_selector == null) {
      ship_selector = null;
    }
    retval = [];
    if (!this.isQuickbuild) {
      available_faction_pilots = (function() {
        var _ref, _results;
        _ref = exportObj.pilots;
        _results = [];
        for (pilot_name in _ref) {
          pilot = _ref[pilot_name];
          if (((ship == null) || pilot.ship === ship) && this.isOurFaction(pilot.faction) && (this.matcher(pilot_name, term) || (pilot.display_name && this.matcher(pilot.display_name, term))) && (this.isItemAvailable(pilot, true))) {
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
          if (((pilot.unique == null) || __indexOf.call(this.uniques_in_use['Pilot'], pilot) < 0 || pilot.canonical_name.getXWSBaseName() === (include_pilot != null ? include_pilot.canonical_name.getXWSBaseName() : void 0)) && ((pilot.max_per_squad == null) || this.countPilots(pilot.canonical_name) < pilot.max_per_squad || pilot.canonical_name.getXWSBaseName() === (include_pilot != null ? include_pilot.canonical_name.getXWSBaseName() : void 0)) && ((pilot.restriction_func == null) || pilot.restriction_func({
            builder: this
          }, pilot))) {
            _results.push(pilot);
          }
        }
        return _results;
      }).call(this);
      if ((include_pilot != null) && (include_pilot.unique != null) && (this.matcher(include_pilot.name, term) || (include_pilot.display_name && this.matcher(include_pilot.display_name, term)))) {
        eligible_faction_pilots.push(include_pilot);
      }
      retval = (function() {
        var _i, _len, _ref, _results;
        _results = [];
        for (_i = 0, _len = available_faction_pilots.length; _i < _len; _i++) {
          pilot = available_faction_pilots[_i];
          _results.push({
            id: pilot.id,
            text: "" + ((((_ref = exportObj.settings) != null ? _ref.initiative_prefix : void 0) != null) && exportObj.settings.initiative_prefix ? pilot.skill + ' - ' : '') + (pilot.display_name ? pilot.display_name : pilot.name) + " (" + pilot.points + ")",
            points: pilot.points,
            ship: pilot.ship,
            name: pilot.name,
            display_name: pilot.display_name,
            disabled: __indexOf.call(eligible_faction_pilots, pilot) < 0
          });
        }
        return _results;
      })();
    } else {
      quickbuilds_matching_ship_and_faction = (function() {
        var _ref, _results;
        _ref = exportObj.quickbuildsById;
        _results = [];
        for (id in _ref) {
          quickbuild = _ref[id];
          if (((ship == null) || quickbuild.ship === ship) && this.isOurFaction(quickbuild.faction) && (this.matcher(quickbuild.pilot, term) || ((exportObj.pilots[quickbuild.pilot].display_name != null) && this.matcher(exportObj.pilots[quickbuild.pilot].display_name, term)))) {
            _results.push(quickbuild);
          }
        }
        return _results;
      }).call(this);
      uniques_in_use_by_pilot_in_use = [];
      if ((include_pilot != null) && include_pilot !== -1) {
        include_quickbuild = exportObj.quickbuildsById[include_pilot];
        include_pilot_pilot = exportObj.pilots[include_quickbuild.pilot];
        if (include_pilot_pilot.unique != null) {
          uniques_in_use_by_pilot_in_use.push(include_pilot_pilot);
          _ref = exportObj.pilotsByUniqueName[include_pilot_pilot.canonical_name.getXWSBaseName()] || [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            other = _ref[_i];
            if (other != null) {
              uniques_in_use_by_pilot_in_use.push(other);
            }
          }
        }
        _ref2 = (_ref1 = include_quickbuild.upgrades) != null ? _ref1 : [];
        for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
          include_upgrade_name = _ref2[_j];
          include_upgrade = exportObj.upgrades[include_upgrade_name];
          if (include_upgrade.unique != null) {
            uniques_in_use_by_pilot_in_use.push(other);
            _ref3 = exportObj.pilotsByUniqueName[include_upgrade.canonical_name.getXWSBaseName()] || [];
            for (_k = 0, _len2 = _ref3.length; _k < _len2; _k++) {
              other = _ref3[_k];
              if (other != null) {
                uniques_in_use_by_pilot_in_use.push(other);
              }
            }
          }
          if (include_upgrade.solitary != null) {
            uniques_in_use_by_pilot_in_use.push(include_upgrade.slot);
          }
        }
      }
      allowed_quickbuilds_containing_uniques_in_use = [];
      ({
        loop: (function() {
          var _ref4, _ref5, _ref6, _ref7, _ref8, _results;
          _results = [];
          for (id in quickbuilds_matching_ship_and_faction) {
            quickbuild = quickbuilds_matching_ship_and_faction[id];
            if ((((_ref4 = exportObj.pilots[quickbuild.pilot]) != null ? _ref4.unique : void 0) != null) && (_ref5 = exportObj.pilots[quickbuild.pilot], __indexOf.call(this.uniques_in_use.Pilot, _ref5) >= 0) && !(_ref6 = exportObj.pilots[quickbuild.pilot], __indexOf.call(uniques_in_use_by_pilot_in_use, _ref6) >= 0)) {
              allowed_quickbuilds_containing_uniques_in_use.push(quickbuild.id);
              continue;
            }
            if ((((_ref7 = exportObj.pilots[quickbuild.pilot]) != null ? _ref7.max_per_squad : void 0) != null) && this.countPilots(exportObj.pilots[quickbuild.pilot].canonical_name) >= exportObj.pilots[quickbuild.pilot].max_per_squad && !(_ref8 = exportObj.pilots[quickbuild.pilot], __indexOf.call(uniques_in_use_by_pilot_in_use, _ref8) >= 0)) {
              allowed_quickbuilds_containing_uniques_in_use.push(quickbuild.id);
              continue;
            }
            if (quickbuild.upgrades != null) {
              _results.push((function() {
                var _l, _len3, _ref10, _ref11, _ref12, _ref13, _ref9, _results1;
                _ref9 = quickbuild.upgrades;
                _results1 = [];
                for (_l = 0, _len3 = _ref9.length; _l < _len3; _l++) {
                  upgrade = _ref9[_l];
                  upgradedata = exportObj.upgrades[upgrade];
                  if (upgradedata == null) {
                    console.log("There was an Issue including the upgrade " + upgrade + " in some quickbuild. Please report that Issue!");
                    continue;
                  }
                  if ((upgradedata.unique != null) && __indexOf.call(this.uniques_in_use.Upgrade, upgradedata) >= 0 && !(__indexOf.call(uniques_in_use_by_pilot_in_use, upgradedata) >= 0)) {
                    if (ship_selector === null || !(__indexOf.call(exportObj.quickbuildsById[ship_selector.quickbuildId].upgrades, upgrade) >= 0 || (ship_selector.linkedShip && __indexOf.call((_ref10 = exportObj.quickbuildsById[(_ref11 = ship_selector.linkedShip) != null ? _ref11.quickbuildId : void 0].upgrades) != null ? _ref10 : [], upgrade) >= 0))) {
                      allowed_quickbuilds_containing_uniques_in_use.push(quickbuild.id);
                      break;
                    }
                  }
                  if ((upgradedata.solitary != null) && (_ref12 = upgradedata.slot, __indexOf.call(this.uniques_in_use['Slot'], _ref12) >= 0) && !(_ref13 = upgradedata.slot, __indexOf.call(uniques_in_use_by_pilot_in_use, _ref13) >= 0)) {
                    allowed_quickbuilds_containing_uniques_in_use.push(quickbuild.id);
                    break;
                  } else {
                    _results1.push(void 0);
                  }
                }
                return _results1;
              }).call(this));
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        }).call(this)
      });
      retval = (function() {
        var _l, _len3, _ref4, _ref5, _results;
        _results = [];
        for (_l = 0, _len3 = quickbuilds_matching_ship_and_faction.length; _l < _len3; _l++) {
          quickbuild = quickbuilds_matching_ship_and_faction[_l];
          _results.push({
            id: quickbuild.id,
            text: "" + ((((_ref4 = exportObj.settings) != null ? _ref4.initiative_prefix : void 0) != null) && exportObj.settings.initiative_prefix ? exportObj.pilots[quickbuild.pilot].skill + ' - ' : '') + (exportObj.pilots[quickbuild.pilot].display_name ? exportObj.pilots[quickbuild.pilot].display_name : quickbuild.pilot) + quickbuild.suffix + " (" + quickbuild.threat + ")",
            points: quickbuild.threat,
            ship: quickbuild.ship,
            disabled: (_ref5 = quickbuild.id, __indexOf.call(allowed_quickbuilds_containing_uniques_in_use, _ref5) >= 0)
          });
        }
        return _results;
      })();
    }
    if (sorted) {
      retval = retval.sort(exportObj.sortHelper);
    }
    return retval;
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

  SquadBuilder.prototype.countPilots = function(canonical_name) {
    var count, ship, _i, _len, _ref, _ref1;
    count = 0;
    _ref = this.ships;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      ship = _ref[_i];
      if ((ship != null ? (_ref1 = ship.pilot) != null ? _ref1.canonical_name.getXWSBaseName() : void 0 : void 0) === canonical_name.getXWSBaseName()) {
        count++;
      }
    }
    return count;
  };

  SquadBuilder.prototype.isShip = function(ship, name) {
    var f, _i, _len;
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

  SquadBuilder.prototype.getAvailableUpgradesIncluding = function(slot, include_upgrade, ship, this_upgrade_obj, term, filter_func, sorted) {
    var available_upgrades, eligible_upgrades, equipped_upgrade, retval, upgrade, upgrade_name, upgrades_in_use, _i, _j, _len, _len1, _ref, _results;
    if (term == null) {
      term = '';
    }
    if (filter_func == null) {
      filter_func = this.dfl_filter_func;
    }
    if (sorted == null) {
      sorted = true;
    }
    upgrades_in_use = (function() {
      var _i, _len, _ref, _results;
      _ref = ship.upgrades;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        upgrade = _ref[_i];
        _results.push(upgrade.data);
      }
      return _results;
    })();
    available_upgrades = (function() {
      var _ref, _results;
      _ref = exportObj.upgrades;
      _results = [];
      for (upgrade_name in _ref) {
        upgrade = _ref[upgrade_name];
        if (exportObj.slotsMatching(upgrade.slot, slot) && (this.matcher(upgrade_name, term) || (upgrade.display_name && this.matcher(upgrade.display_name, term))) && ((upgrade.ship == null) || this.isShip(upgrade.ship, ship.data.name)) && ((upgrade.faction == null) || this.isOurFaction(upgrade.faction, ship.pilot.faction)) && (this.isItemAvailable(upgrade))) {
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
      var _ref, _results;
      _results = [];
      for (upgrade_name in available_upgrades) {
        upgrade = available_upgrades[upgrade_name];
        if (((upgrade.unique == null) || __indexOf.call(this.uniques_in_use['Upgrade'], upgrade) < 0) && (!((ship != null) && (upgrade.restrictions != null)) || ship.restriction_check(upgrade.restrictions, this_upgrade_obj)) && __indexOf.call(upgrades_in_use, upgrade) < 0 && ((upgrade.max_per_squad == null) || ship.builder.countUpgrades(upgrade.canonical_name) < upgrade.max_per_squad) && ((upgrade.solitary == null) || ((_ref = upgrade.slot, __indexOf.call(this.uniques_in_use['Slot'], _ref) < 0) || ((include_upgrade != null ? include_upgrade.solitary : void 0) != null)))) {
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
    if ((include_upgrade != null) && (this.matcher(include_upgrade.name, term) || (include_upgrade.display_name && this.matcher(include_upgrade.display_name, term)))) {
      eligible_upgrades.push(include_upgrade);
    }
    retval = (function() {
      var _j, _len1, _results;
      _results = [];
      for (_j = 0, _len1 = available_upgrades.length; _j < _len1; _j++) {
        upgrade = available_upgrades[_j];
        _results.push({
          id: upgrade.id,
          text: "" + (upgrade.display_name ? upgrade.display_name : upgrade.name) + " (" + (this_upgrade_obj.getPoints(upgrade)) + (upgrade.pointsarray ? '*' : '') + ")",
          points: this_upgrade_obj.getPoints(upgrade),
          name: upgrade.name,
          display_name: upgrade.display_name,
          disabled: __indexOf.call(eligible_upgrades, upgrade) < 0
        });
      }
      return _results;
    })();
    if (sorted) {
      retval = retval.sort(exportObj.sortHelper);
    }
    if (typeof this_upgrade_obj === "function" ? this_upgrade_obj(typeof adjustment_func !== "undefined" && adjustment_func !== null) : void 0) {
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

  SquadBuilder.prototype.getSquadDialsAsHTML = function() {
    var added_dials, dialHTML, maneuvers_modified, maneuvers_unmodified, ship, _i, _len, _ref, _ref1, _ref2;
    dialHTML = "";
    added_dials = {};
    _ref = this.ships;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      ship = _ref[_i];
      if (ship.pilot != null) {
        maneuvers_unmodified = ship.data.maneuvers;
        maneuvers_modified = ship.effectiveStats().maneuvers;
        if ((added_dials[ship.data.name] == null) || !(_ref1 = maneuvers_modified.toString(), __indexOf.call(added_dials[ship.data.name], _ref1) >= 0)) {
          added_dials[ship.data.name] = ((_ref2 = added_dials[ship.data.name]) != null ? _ref2 : []).concat([maneuvers_modified.toString()]);
          dialHTML += '<div class="fancy-dial">' + ("<h4 class=\"ship-name-dial\">" + (ship.data.display_name != null ? ship.data.display_name : ship.data.name)) + ("" + (maneuvers_modified.toString() !== maneuvers_unmodified.toString() ? " (" + this.uitranslation(modified) + ")" : "") + "</h4>") + this.getManeuverTableHTML(maneuvers_modified, maneuvers_unmodified) + '</div>';
        }
      }
    }
    return "<div class=\"print-dials-container\">\n    " + dialHTML + "\n</div>";
  };

  SquadBuilder.prototype.getManeuverTableHTML = function(maneuvers, baseManeuvers) {
    var bearing, bearings, bearings_without_maneuvers, className, color, difficulty, haveManeuver, innerPath, linePath, maneuverClass, maneuverClass2, outTable, outlineColor, speed, transform, trianglePath, turn, v, _i, _j, _k, _l, _len, _len1, _len2, _m, _n, _ref, _ref1, _ref2, _ref3, _results;
    if ((maneuvers == null) || maneuvers.length === 0) {
      return this.uitranslation("Missing maneuver info.");
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
                return "dodgerblue";
              case 2:
                return "white";
              case 3:
                return "red";
              case 4:
                return "purple";
            }
          })();
          maneuverClass = (function() {
            switch (maneuvers[speed][turn]) {
              case 1:
                return "svg-blue-maneuver";
              case 2:
                return "svg-white-maneuver";
              case 3:
                return "svg-red-maneuver";
              case 4:
                return "svg-purple-maneuver";
            }
          })();
          outTable += "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"30px\" height=\"30px\" viewBox=\"0 0 200 200\">";
          outlineColor = "black";
          maneuverClass2 = "svg-base-maneuver";
          if (maneuvers[speed][turn] !== baseManeuvers[speed][turn]) {
            outlineColor = "DarkSlateGrey";
            maneuverClass2 = "svg-modified-maneuver";
          }
          if (speed === 0 && turn === 2) {
            outTable += "<rect class=\"svg-maneuver-stop " + maneuverClass + " " + maneuverClass2 + "\" x=\"50\" y=\"50\" width=\"100\" height=\"100\" style=\"fill:" + color + "; stroke-width:5; stroke:" + outlineColor + "\" />";
          } else {
            transform = "";
            className = "";
            switch (turn) {
              case 0:
                linePath = "M160,180 L160,70 80,70";
                innerPath = "M160,175 L160,70 70,70";
                trianglePath = "M80,100 V40 L30,70 Z";
                break;
              case 1:
                linePath = "M150,180 S150,120 80,60";
                innerPath = "M150,175 S150,120 80,60";
                trianglePath = "M80,100 V40 L30,70 Z";
                transform = "transform='translate(-5 -15) rotate(45 70 90)' ";
                break;
              case 2:
                linePath = "M100,180 L100,100 100,80";
                innerPath = "M100,175 L100,120 100,70";
                trianglePath = "M70,80 H130 L100,30 Z";
                break;
              case 3:
                linePath = "M50,180 S50,120 120,60";
                innerPath = "M50,175 S50,120 120,60";
                trianglePath = "M120,100 V40 L170,70 Z";
                transform = "transform='translate(5 -15) rotate(-45 130 90)' ";
                break;
              case 4:
                linePath = "M40,180 L40,70 120,70";
                innerPath = "M40,175 L40,70 130,70";
                trianglePath = "M120,100 V40 L170,70 Z";
                break;
              case 5:
                linePath = "M50,180 L50,100 C50,10 140,10 140,100 L140,120";
                innerPath = "M50,175 L50,100 C50,10 140,10 140,100 L140,130";
                trianglePath = "M170,120 H110 L140,180 Z";
                break;
              case 6:
                linePath = "M150,180 S150,120 80,60";
                innerPath = "M150,175 S150,120 85,65";
                trianglePath = "M80,100 V40 L30,70 Z";
                transform = "transform='translate(0 50)'";
                break;
              case 7:
                linePath = "M50,180 S50,120 120,60";
                innerPath = "M50,175 S50,120 115,65";
                trianglePath = "M120,100 V40 L170,70 Z";
                transform = "transform='translate(0 50)'";
                break;
              case 8:
                linePath = "M160,180 L160,70 80,70";
                innerPath = "M160,175 L160,70 85,70";
                trianglePath = "M60,100 H100 L80,140 Z";
                break;
              case 9:
                linePath = "M40,180 L40,70 120,70";
                innerPath = "M40,175 L40,70 115,70";
                trianglePath = "M100,100 H140 L120,140 Z";
                break;
              case 10:
                linePath = "M50,180 S50,120 120,60";
                innerPath = "M50,175 S50,120 120,60";
                trianglePath = "M120,100 V40 L170,70 Z";
                transform = "transform='translate(5 -15) rotate(-45 130 90)' ";
                className = 'backwards';
                break;
              case 11:
                linePath = "M100,180 L100,100 100,80";
                innerPath = "M100,175 L100,100 100,70";
                trianglePath = "M70,80 H130 L100,30 Z";
                className = 'backwards';
                break;
              case 12:
                linePath = "M150,180 S150,120 80,60";
                innerPath = "M150,175 S150,120 80,60";
                trianglePath = "M80,100 V40 L30,70 Z";
                transform = "transform='translate(-5 -15) rotate(45 70 90)' ";
                className = 'backwards';
            }
            outTable += $.trim("<g class=\"maneuver " + className + "\">\n  <path class = 'svg-maneuver-outer " + maneuverClass + " " + maneuverClass2 + "' stroke-width='25' fill='none' stroke='" + outlineColor + "' d='" + linePath + "' />\n  <path class = 'svg-maneuver-triangle " + maneuverClass + " " + maneuverClass2 + "' d='" + trianglePath + "' fill='" + color + "' stroke-width='5' stroke='" + outlineColor + "' " + transform + "/>\n  <path class = 'svg-maneuver-inner " + maneuverClass + " " + maneuverClass2 + "' stroke-width='15' fill='none' stroke='" + color + "' d='" + innerPath + "' />\n</g>");
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

  SquadBuilder.prototype.formatActions = function(actions, seperation, keyword) {
    var action, action_icons, actionlist, color, prefix, _i, _len;
    if (keyword == null) {
      keyword = [];
    }
    action_icons = [];
    for (_i = 0, _len = actions.length; _i < _len; _i++) {
      action = actions[_i];
      color = "";
      prefix = seperation;
      if (__indexOf.call(keyword, "Droid") >= 0) {
        action = action.replace('Focus', 'Calculate');
      }
      if (action.search('> ') !== -1) {
        action = action.replace(/> /gi, '');
        prefix = " <i class=\"xwing-miniatures-font xwing-miniatures-font-linked\"></i> ";
      }
      if (action.search('F-') !== -1) {
        color = "force ";
        action = action.replace(/F-/gi, '');
      } else if (action.search('R-') !== -1) {
        color = "red ";
        action = action.replace(/R-/gi, '');
      }
      action = action.toLowerCase().replace(/[^0-9a-z]/gi, '');
      action_icons.push("" + prefix + "<i class=\"xwing-miniatures-font " + color + "xwing-miniatures-font-" + action + "\"></i>");
    }
    actionlist = action_icons.join('');
    return actionlist.replace(seperation, '');
  };

  SquadBuilder.prototype.showTooltip = function(type, data, additional_opts, container, force_update) {
    var addon_count, chargeHTML, cls, count, effective_stats, first, ini, inis, item, missingStuffInfoText, name, pilot, pilot_count, point_info, possible_inis, recurringicon, restriction_info, ship, ship_count, slot, slot_types, source, sources, state, uniquedots, upgrade, well, _i, _j, _k, _l, _len, _len1, _len2, _len3, _m, _n, _ref, _ref1, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref16, _ref17, _ref18, _ref19, _ref2, _ref20, _ref21, _ref22, _ref23, _ref24, _ref25, _ref26, _ref27, _ref28, _ref29, _ref3, _ref30, _ref31, _ref32, _ref33, _ref34, _ref35, _ref36, _ref37, _ref38, _ref39, _ref4, _ref40, _ref41, _ref42, _ref43, _ref44, _ref45, _ref46, _ref47, _ref48, _ref49, _ref5, _ref50, _ref51, _ref52, _ref53, _ref54, _ref55, _ref56, _ref57, _ref58, _ref59, _ref6, _ref60, _ref61, _ref62, _ref63, _ref64, _ref65, _ref66, _ref67, _ref68, _ref69, _ref7, _ref70, _ref71, _ref72, _ref73, _ref74, _ref75, _ref76, _ref8, _ref9, _results, _results1;
    if (container == null) {
      container = this.info_container;
    }
    if (force_update == null) {
      force_update = false;
    }
    if (data !== this.tooltip_currently_displaying || force_update) {
      switch (type) {
        case 'Ship':
          possible_inis = [];
          slot_types = {};
          for (slot in exportObj.upgradesBySlotCanonicalName) {
            slot_types[slot] = -1;
          }
          _ref = exportObj.pilots;
          for (name in _ref) {
            pilot = _ref[name];
            if (pilot.ship !== data.name) {
              continue;
            }
            if (!(_ref1 = pilot.skill, __indexOf.call(possible_inis, _ref1) >= 0)) {
              possible_inis.push(pilot.skill);
            }
            for (slot in slot_types) {
              state = slot_types[slot];
              switch (pilot.slots.filter((function(_this) {
                    return function(item) {
                      return item === slot;
                    };
                  })(this)).length) {
                case 1:
                  switch (state) {
                    case -1:
                      slot_types[slot] = 1;
                      break;
                    case 0:
                      slot_types[slot] = 2;
                      break;
                    case 3:
                      slot_types[slot] = 4;
                  }
                  break;
                case 0:
                  switch (state) {
                    case -1:
                      slot_types[slot] = 0;
                      break;
                    case 1:
                      slot_types[slot] = 2;
                      break;
                    case 3:
                    case 4:
                      slot_types[slot] = 5;
                  }
                  break;
                case 2:
                  switch (state) {
                    case -1:
                      slot_types[slot] = 3;
                      break;
                    case 0:
                    case 2:
                      slot_types[slot] = 5;
                      break;
                    case 1:
                      slot_types[slot] = 4;
                  }
                  break;
                case 3:
                  slot_types[slot] = 6;
              }
            }
          }
          possible_inis.sort();
          container.find('.info-type').text(type);
          container.find('.info-name').html("" + (data.display_name ? data.display_name : data.name) + (exportObj.isReleased(data) ? "" : " (" + (this.uitranslation('unreleased')) + ")"));
          if (((_ref2 = this.collection) != null ? _ref2.counts : void 0) != null) {
            ship_count = (_ref3 = (_ref4 = this.collection.counts) != null ? (_ref5 = _ref4.ship) != null ? _ref5[data.name] : void 0 : void 0) != null ? _ref3 : 0;
            container.find('.info-collection').text(this.uitranslation("collectionContentShips", ship_count));
            container.find('.info-collection').show();
          } else {
            container.find('.info-collection').hide();
          }
          first = true;
          inis = String(possible_inis[0]);
          for (_i = 0, _len = possible_inis.length; _i < _len; _i++) {
            ini = possible_inis[_i];
            if (!first) {
              inis += ", " + ini;
            }
            first = false;
          }
          container.find('tr.info-skill td.info-data').text(inis);
          container.find('tr.info-skill').show();
          container.find('tr.info-engagement').hide();
          container.find('tr.info-attack td.info-data').text(data.attack);
          container.find('tr.info-attack-bullseye td.info-data').text(data.attackbull);
          container.find('tr.info-attack-fullfront td.info-data').text(data.attackf);
          container.find('tr.info-attack-left td.info-data').text(data.attackl);
          container.find('tr.info-attack-right td.info-data').text(data.attackr);
          container.find('tr.info-attack-back td.info-data').text(data.attackb);
          container.find('tr.info-attack-turret td.info-data').text(data.attackt);
          container.find('tr.info-attack-doubleturret td.info-data').text(data.attackdt);
          container.find('tr.info-attack').toggle(data.attack != null);
          container.find('tr.info-attack-bullseye').toggle(data.attackbull != null);
          container.find('tr.info-attack-fullfront').toggle(data.attackf != null);
          container.find('tr.info-attack-left').toggle(data.attackl != null);
          container.find('tr.info-attack-right').toggle(data.attackr != null);
          container.find('tr.info-attack-back').toggle(data.attackb != null);
          container.find('tr.info-attack-turret').toggle(data.attackt != null);
          container.find('tr.info-attack-doubleturret').toggle(data.attackdt != null);
          container.find('tr.info-ship').hide();
          if (data.large != null) {
            container.find('tr.info-base td.info-data').text(exportObj.translate("gameterms", "Large"));
          } else if (data.medium != null) {
            container.find('tr.info-base td.info-data').text(exportObj.translate("gameterms", "Medium"));
          } else if (data.huge != null) {
            container.find('tr.info-base td.info-data').text(exportObj.translate("gameterms", "Huge"));
          } else {
            container.find('tr.info-base td.info-data').text(exportObj.translate("gameterms", "Small"));
          }
          container.find('tr.info-base').show();
          _ref6 = container.find('tr.info-attack td.info-header i.xwing-miniatures-font')[0].classList;
          for (_j = 0, _len1 = _ref6.length; _j < _len1; _j++) {
            cls = _ref6[_j];
            if (cls.startsWith('xwing-miniatures-font-attack')) {
              container.find('tr.info-attack td.info-header i.xwing-miniatures-font').removeClass(cls);
            }
          }
          container.find('tr.info-attack td.info-header i.xwing-miniatures-font').addClass((_ref7 = data.attack_icon) != null ? _ref7 : 'xwing-miniatures-font-attack');
          container.find('tr.info-range').hide();
          container.find('tr.info-agility td.info-data').text(data.agility);
          container.find('tr.info-agility').show();
          container.find('tr.info-hull td.info-data').text(data.hull);
          container.find('tr.info-hull').show();
          recurringicon = '';
          if (data.shieldrecurr != null) {
            count = 0;
            while (count < data.shieldrecurr) {
              recurringicon += '<sup><i class="fas fa-caret-up"></i></sup>';
              ++count;
            }
          }
          container.find('tr.info-shields td.info-data').html(data.shields + recurringicon);
          container.find('tr.info-shields').show();
          recurringicon = '';
          if (data.energyrecurr != null) {
            count = 0;
            while (count < data.energyrecurr) {
              recurringicon += '<sup><i class="fas fa-caret-up"></i></sup>';
              ++count;
            }
          }
          container.find('tr.info-energy td.info-data').html(data.energy + recurringicon);
          container.find('tr.info-energy').toggle(data.energy != null);
          container.find('tr.info-force').hide();
          container.find('tr.info-charge').hide();
          container.find('tr.info-actions td.info-data').html(this.formatActions(data.actions, ", ", (_ref8 = data.keyword) != null ? _ref8 : []));
          container.find('tr.info-actions').show();
          container.find('tr.info-upgrades').show();
          container.find('tr.info-upgrades td.info-data').html(((function() {
            var _results;
            _results = [];
            for (slot in slot_types) {
              state = slot_types[slot];
              _results.push(state === 1 ? exportObj.translate('sloticon', slot) : (state === 2 ? '(' + exportObj.translate('sloticon', slot) + ')' : (state === 3 ? exportObj.translate('sloticon', slot) + exportObj.translate('sloticon', slot) : (state === 4 ? exportObj.translate('sloticon', slot) + '(' + exportObj.translate('sloticon', slot) + ')' : (state === 5 ? '(' + exportObj.translate('sloticon', slot) + exportObj.translate('sloticon', slot) + ')' : (state === 6 ? exportObj.translate('sloticon', slot) + exportObj.translate('sloticon', slot) + exportObj.translate('sloticon', slot) : void 0))))));
            }
            return _results;
          })()).join(' ') || 'None');
          container.find('p.info-text').hide();
          container.find('p.info-maneuvers').show();
          container.find('p.info-maneuvers').html(this.getManeuverTableHTML(data.maneuvers, data.maneuvers));
          sources = ((function() {
            var _k, _len2, _ref9, _results;
            _ref9 = data.sources;
            _results = [];
            for (_k = 0, _len2 = _ref9.length; _k < _len2; _k++) {
              source = _ref9[_k];
              _results.push(exportObj.translate('sources', source));
            }
            return _results;
          })()).sort();
          container.find('.info-sources.info-data').text((sources.length > 1) || (!(__indexOf.call(sources, 'Loose Ships') >= 0)) ? (sources.length > 0 ? sources.join(', ') : exportObj.translate('ui', 'unreleased')) : this.uitranslation("Only available from 1st edition"));
          container.find('.info-sources').show();
          break;
        case 'Pilot':
          container.find('.info-type').text(type);
          container.find('.info-sources.info-data').text(((function() {
            var _k, _len2, _ref9, _results;
            _ref9 = data.sources;
            _results = [];
            for (_k = 0, _len2 = _ref9.length; _k < _len2; _k++) {
              source = _ref9[_k];
              _results.push(exportObj.translate('sources', source));
            }
            return _results;
          })()).sort().join(', '));
          container.find('.info-sources').show();
          if (((_ref9 = this.collection) != null ? _ref9.counts : void 0) != null) {
            pilot_count = (_ref10 = (_ref11 = this.collection.counts) != null ? (_ref12 = _ref11.pilot) != null ? _ref12[data.name] : void 0 : void 0) != null ? _ref10 : 0;
            ship_count = (_ref13 = (_ref14 = this.collection.counts.ship) != null ? _ref14[data.ship] : void 0) != null ? _ref13 : 0;
            container.find('.info-collection').text(this.uitranslation("collectionContentShipsAndPilots", ship_count, pilot_count));
            container.find('.info-collection').show();
          } else {
            container.find('.info-collection').hide();
          }
          if ((additional_opts != null ? additional_opts.effectiveStats : void 0) != null) {
            effective_stats = additional_opts.effectiveStats();
          }
          if (data.unique != null) {
            uniquedots = "&middot;&nbsp;";
          } else if (data.max_per_squad != null) {
            count = 0;
            uniquedots = "";
            while (count < data.max_per_squad) {
              uniquedots = uniquedots.concat("&middot;");
              ++count;
            }
            uniquedots = uniquedots.concat("&nbsp;");
          } else {
            uniquedots = "";
          }
          container.find('.info-name').html("" + uniquedots + (data.display_name ? data.display_name : data.name) + (exportObj.isReleased(data) ? "" : " (" + (exportObj.translate('ui', 'unreleased')) + ")"));
          restriction_info = this.restriction_text(data) + this.upgrade_effect(data);
          if (restriction_info !== '') {
            container.find('p.info-restrictions').html(restriction_info != null ? restriction_info : '');
            container.find('p.info-restrictions').show();
          } else {
            container.find('p.info-restrictions').hide();
          }
          container.find('p.info-text').html((_ref15 = data.text) != null ? _ref15 : '');
          container.find('p.info-text').show();
          ship = exportObj.ships[data.ship];
          container.find('tr.info-ship td.info-data').text(data.ship);
          container.find('tr.info-ship').show();
          if (ship.large != null) {
            container.find('tr.info-base td.info-data').text(exportObj.translate("gameterms", "Large"));
          } else if (ship.medium != null) {
            container.find('tr.info-base td.info-data').text(exportObj.translate("gameterms", "Medium"));
          } else if (ship.huge != null) {
            container.find('tr.info-base td.info-data').text(exportObj.translate("gameterms", "Huge"));
          } else {
            container.find('tr.info-base td.info-data').text(exportObj.translate("gameterms", "Small"));
          }
          container.find('tr.info-base').show();
          container.find('tr.info-skill td.info-data').text(data.skill);
          container.find('tr.info-skill').show();
          if (data.engagement != null) {
            container.find('tr.info-engagement td.info-data').text(data.engagement);
            container.find('tr.info-engagement').show();
          } else {
            container.find('tr.info-engagement').hide();
          }
          container.find('tr.info-attack td.info-header i.xwing-miniatures-font').addClass((_ref16 = ship.attack_icon) != null ? _ref16 : 'xwing-miniatures-font-attack');
          container.find('tr.info-attack td.info-data').text(statAndEffectiveStat((_ref17 = (_ref18 = data.ship_override) != null ? _ref18.attack : void 0) != null ? _ref17 : ship.attack, effective_stats, 'attack'));
          container.find('tr.info-attack').toggle((ship.attack != null) || ((effective_stats != null ? effective_stats.attack : void 0) != null));
          container.find('tr.info-attack-fullfront td.info-data').text(statAndEffectiveStat((_ref19 = (_ref20 = data.ship_override) != null ? _ref20.attackf : void 0) != null ? _ref19 : ship.attackf, effective_stats, 'attackf'));
          container.find('tr.info-attack-fullfront').toggle((ship.attackf != null) || ((effective_stats != null ? effective_stats.attackf : void 0) != null));
          container.find('tr.info-attack-bullseye td.info-data').text(statAndEffectiveStat((_ref21 = (_ref22 = data.ship_override) != null ? _ref22.attackbull : void 0) != null ? _ref21 : ship.attackbull, effective_stats, 'attackbull'));
          container.find('tr.info-attack-bullseye').toggle((ship.attackbull != null) || ((effective_stats != null ? effective_stats.attackbull : void 0) != null));
          container.find('tr.info-attack-left td.info-data').text(statAndEffectiveStat((_ref23 = (_ref24 = data.ship_override) != null ? _ref24.attackl : void 0) != null ? _ref23 : ship.attackl, effective_stats, 'attackl'));
          container.find('tr.info-attack-left').toggle((ship.attackl != null) || ((effective_stats != null ? effective_stats.attackl : void 0) != null));
          container.find('tr.info-attack-right td.info-data').text(statAndEffectiveStat((_ref25 = (_ref26 = data.ship_override) != null ? _ref26.attackr : void 0) != null ? _ref25 : ship.attackr, effective_stats, 'attackr'));
          container.find('tr.info-attack-right').toggle((ship.attackr != null) || ((effective_stats != null ? effective_stats.attackr : void 0) != null));
          container.find('tr.info-attack-back td.info-data').text(statAndEffectiveStat((_ref27 = (_ref28 = data.ship_override) != null ? _ref28.attackb : void 0) != null ? _ref27 : ship.attackb, effective_stats, 'attackb'));
          container.find('tr.info-attack-back').toggle((ship.attackb != null) || ((effective_stats != null ? effective_stats.attackb : void 0) != null));
          container.find('tr.info-attack-turret td.info-data').text(statAndEffectiveStat((_ref29 = (_ref30 = data.ship_override) != null ? _ref30.attackt : void 0) != null ? _ref29 : ship.attackt, effective_stats, 'attackt'));
          container.find('tr.info-attack-turret').toggle((ship.attackt != null) || ((effective_stats != null ? effective_stats.attackt : void 0) != null));
          container.find('tr.info-attack-doubleturret td.info-data').text(statAndEffectiveStat((_ref31 = (_ref32 = data.ship_override) != null ? _ref32.attackdt : void 0) != null ? _ref31 : ship.attackdt, effective_stats, 'attackdt'));
          container.find('tr.info-attack-doubleturret').toggle((ship.attackdt != null) || ((effective_stats != null ? effective_stats.attackdt : void 0) != null));
          container.find('tr.info-range').hide();
          container.find('td.info-rangebonus').hide();
          container.find('tr.info-agility td.info-data').text(statAndEffectiveStat((_ref33 = (_ref34 = data.ship_override) != null ? _ref34.agility : void 0) != null ? _ref33 : ship.agility, effective_stats, 'agility'));
          container.find('tr.info-agility').show();
          container.find('tr.info-hull td.info-data').text(statAndEffectiveStat((_ref35 = (_ref36 = data.ship_override) != null ? _ref36.hull : void 0) != null ? _ref35 : ship.hull, effective_stats, 'hull'));
          container.find('tr.info-hull').show();
          recurringicon = '';
          if (ship.shieldrecurr != null) {
            count = 0;
            while (count < ship.shieldrecurr) {
              recurringicon += '<sup><i class="fas fa-caret-up"></i></sup>';
              ++count;
            }
          }
          container.find('tr.info-shields td.info-data').html(statAndEffectiveStat((_ref37 = (_ref38 = data.ship_override) != null ? _ref38.shields : void 0) != null ? _ref37 : ship.shields, effective_stats, 'shields') + recurringicon);
          container.find('tr.info-shields').show();
          recurringicon = '';
          if (ship.energyrecurr != null) {
            count = 0;
            while (count < ship.energyrecurr) {
              recurringicon += '<sup><i class="fas fa-caret-up"></i></sup>';
              ++count;
            }
          }
          container.find('tr.info-energy td.info-data').html(statAndEffectiveStat((_ref39 = (_ref40 = data.ship_override) != null ? _ref40.energy : void 0) != null ? _ref39 : ship.energy, effective_stats, 'energy') + recurringicon);
          container.find('tr.info-energy').toggle((((_ref41 = data.ship_override) != null ? _ref41.energy : void 0) != null) || (ship.energy != null));
          if ((((effective_stats != null ? effective_stats.force : void 0) != null) && effective_stats.force > 0) || (data.force != null)) {
            container.find('tr.info-force td.info-data').html(statAndEffectiveStat((_ref42 = (_ref43 = data.ship_override) != null ? _ref43.force : void 0) != null ? _ref42 : data.force, effective_stats, 'force') + '<sup><i class="fas fa-caret-up"></i></sup>');
            container.find('tr.info-force').show();
          } else {
            container.find('tr.info-force').hide();
          }
          if (data.charge != null) {
            recurringicon = '';
            if (data.recurring != null) {
              if (data.recurring > 0) {
                count = 0;
                while (count < data.recurring) {
                  recurringicon += '<sup><i class="fas fa-caret-up"></i></sup>';
                  ++count;
                }
              } else {
                count = data.recurring;
                while (count < 0) {
                  recurringicon += '<sub><i class="fas fa-caret-down"></i></sub>';
                  ++count;
                }
              }
            }
            chargeHTML = $.trim("" + data.charge + recurringicon);
            container.find('tr.info-charge td.info-data').html(chargeHTML);
            container.find('tr.info-charge').show();
          } else {
            container.find('tr.info-charge').hide();
          }
          if ((effective_stats != null ? effective_stats.actions : void 0) != null) {
            container.find('tr.info-actions td.info-data').html(this.formatActions((_ref44 = (_ref45 = data.ship_override) != null ? _ref45.actions : void 0) != null ? _ref44 : effective_stats.actions, ", "));
          } else {
            container.find('tr.info-actions td.info-data').html(this.formatActions((_ref46 = (_ref47 = data.ship_override) != null ? _ref47.actions : void 0) != null ? _ref46 : ship.actions, ", ", (_ref48 = data.keyword) != null ? _ref48 : []));
          }
          container.find('tr.info-actions').show();
          if (this.isQuickbuild) {
            container.find('tr.info-upgrades').hide();
          } else {
            container.find('tr.info-upgrades').show();
            container.find('tr.info-upgrades td.info-data').html(((function() {
              var _k, _len2, _ref49, _results;
              _ref49 = data.slots;
              _results = [];
              for (_k = 0, _len2 = _ref49.length; _k < _len2; _k++) {
                slot = _ref49[_k];
                _results.push(exportObj.translate('sloticon', slot));
              }
              return _results;
            })()).join(' ') || 'None');
          }
          container.find('p.info-maneuvers').show();
          container.find('p.info-maneuvers').html(this.getManeuverTableHTML((_ref49 = effective_stats != null ? effective_stats.maneuvers : void 0) != null ? _ref49 : ship.maneuvers, ship.maneuvers));
          break;
        case 'Quickbuild':
          container.find('.info-type').text(this.uitranslation('Quickbuild'));
          container.find('.info-sources').hide();
          container.find('.info-collection').hide();
          pilot = exportObj.pilots[data.pilot];
          ship = exportObj.ships[data.ship];
          if (pilot.unique != null) {
            uniquedots = "&middot;&nbsp;";
          } else if (pilot.max_per_squad != null) {
            count = 0;
            uniquedots = "";
            while (count < data.max_per_squad) {
              uniquedots = uniquedots.concat("&middot;");
              ++count;
            }
            uniquedots = uniquedots.concat("&nbsp;");
          } else {
            uniquedots = "";
          }
          container.find('.info-name').html("" + uniquedots + (pilot.display_name ? pilot.display_name : pilot.name) + (data.suffix != null ? data.suffix : "") + (exportObj.isReleased(pilot) ? "" : " (" + (exportObj.translate('ui', 'unreleased')) + ")"));
          restriction_info = this.restriction_text(data) + this.upgrade_effect(data);
          if (restriction_info !== '') {
            container.find('p.info-restrictions').html(restriction_info != null ? restriction_info : '');
            container.find('p.info-restrictions').show();
          } else {
            container.find('p.info-restrictions').hide();
          }
          container.find('p.info-text').html((_ref50 = pilot.text) != null ? _ref50 : '');
          container.find('p.info-text').show();
          container.find('tr.info-ship td.info-data').text(data.ship);
          container.find('tr.info-ship').show();
          if (ship.large != null) {
            container.find('tr.info-base td.info-data').text(exportObj.translate("gameterms", "Large"));
          } else if (ship.medium != null) {
            container.find('tr.info-base td.info-data').text(exportObj.translate("gameterms", "Medium"));
          } else {
            container.find('tr.info-base td.info-data').text(exportObj.translate("gameterms", "Small"));
          }
          container.find('tr.info-base').show();
          container.find('tr.info-skill td.info-data').text(pilot.skill);
          container.find('tr.info-skill').show();
          container.find('tr.info-engagement td.info-data').text(pilot.skill);
          container.find('tr.info-engagement').show();
          container.find('tr.info-attack td.info-data').text((_ref51 = (_ref52 = pilot.ship_override) != null ? _ref52.attack : void 0) != null ? _ref51 : ship.attack);
          container.find('tr.info-attack').toggle((((_ref53 = pilot.ship_override) != null ? _ref53.attack : void 0) != null) || (ship.attack != null));
          container.find('tr.info-attack-fullfront td.info-data').text(ship.attackf);
          container.find('tr.info-attack-fullfront').toggle(ship.attackf != null);
          container.find('tr.info-attack-bullseye td.info-data').text(ship.attackbull);
          container.find('tr.info-attack-bullseye').toggle(ship.attackbull != null);
          container.find('tr.info-attack-left td.info-data').text(ship.attackl);
          container.find('tr.info-attack-left').toggle(ship.attackl != null);
          container.find('tr.info-attack-right td.info-data').text(ship.attackr);
          container.find('tr.info-attack-right').toggle(ship.attackr != null);
          container.find('tr.info-attack-back td.info-data').text(ship.attackb != null);
          container.find('tr.info-attack-back').toggle(ship.attackb != null);
          container.find('tr.info-attack-turret td.info-data').text(ship.attackt != null);
          container.find('tr.info-attack-turret').toggle(ship.attackt != null);
          container.find('tr.info-attack-doubleturret td.info-data').text(ship.attackdt);
          container.find('tr.info-attack-doubleturret').toggle(ship.attackdt != null);
          container.find('tr.info-attack td.info-header i.xwing-miniatures-font').addClass((_ref54 = ship.attack_icon) != null ? _ref54 : 'xwing-miniatures-font-frontarc');
          container.find('tr.info-energy td.info-data').text((_ref55 = (_ref56 = pilot.ship_override) != null ? _ref56.energy : void 0) != null ? _ref55 : ship.energy);
          container.find('tr.info-energy').toggle((((_ref57 = pilot.ship_override) != null ? _ref57.energy : void 0) != null) || (ship.energy != null));
          container.find('tr.info-range').hide();
          container.find('td.info-rangebonus').hide();
          container.find('tr.info-agility td.info-data').text((_ref58 = (_ref59 = pilot.ship_override) != null ? _ref59.agility : void 0) != null ? _ref58 : ship.agility);
          container.find('tr.info-agility').show();
          container.find('tr.info-hull td.info-data').text((_ref60 = (_ref61 = pilot.ship_override) != null ? _ref61.hull : void 0) != null ? _ref60 : ship.hull);
          container.find('tr.info-hull').show();
          container.find('tr.info-shields td.info-data').text((_ref62 = (_ref63 = pilot.ship_override) != null ? _ref63.shields : void 0) != null ? _ref62 : ship.shields);
          container.find('tr.info-shields').show();
          if (((effective_stats != null ? effective_stats.force : void 0) != null) || (data.force != null)) {
            container.find('tr.info-force td.info-data').html(((_ref64 = (_ref65 = pilot.ship_override) != null ? _ref65.force : void 0) != null ? _ref64 : pilot.force) + '<sup><i class="fas fa-caret-up"></i></sup>');
            container.find('tr.info-force').show();
          } else {
            container.find('tr.info-force').hide();
          }
          if (data.charge != null) {
            recurringicon = '';
            if (data.recurring != null) {
              if (data.recurring > 0) {
                count = 0;
                while (count < data.recurring) {
                  recurringicon += '<sup><i class="fas fa-caret-up"></i></sup>';
                  ++count;
                }
              } else {
                count = data.recurring;
                while (count < 0) {
                  recurringicon += '<sub><i class="fas fa-caret-down"></i></sub>';
                  ++count;
                }
              }
            }
            chargeHTML = $.trim("" + data.charge + recurringicon);
            container.find('tr.info-charge td.info-data').html(chargeHTML);
            container.find('tr.info-charge').show();
          } else {
            container.find('tr.info-charge').hide();
          }
          container.find('tr.info-actions td.info-data').html(this.formatActions((_ref66 = (_ref67 = pilot.ship_override) != null ? _ref67.actions : void 0) != null ? _ref66 : exportObj.ships[data.ship].actions, ", ", (_ref68 = pilot.keyword) != null ? _ref68 : []));
          container.find('tr.info-actions').show();
          container.find('tr.info-upgrades').show();
          container.find('tr.info-upgrades td.info-data').html(((function() {
            var _k, _len2, _ref69, _ref70, _results;
            _ref70 = (_ref69 = data.upgrades) != null ? _ref69 : [];
            _results = [];
            for (_k = 0, _len2 = _ref70.length; _k < _len2; _k++) {
              upgrade = _ref70[_k];
              _results.push(exportObj.upgrades[upgrade].display_name != null ? exportObj.upgrades[upgrade].display_name : upgrade);
            }
            return _results;
          })()).join(', ') || 'None');
          container.find('p.info-maneuvers').show();
          container.find('p.info-maneuvers').html(this.getManeuverTableHTML(ship.maneuvers, ship.maneuvers));
          break;
        case 'Addon':
          container.find('.info-type').text(additional_opts.addon_type);
          container.find('.info-sources.info-data').text(((function() {
            var _k, _len2, _ref69, _results;
            _ref69 = data.sources;
            _results = [];
            for (_k = 0, _len2 = _ref69.length; _k < _len2; _k++) {
              source = _ref69[_k];
              _results.push(exportObj.translate('sources', source));
            }
            return _results;
          })()).sort().join(', '));
          container.find('.info-sources').show();
          if (data.unique != null) {
            uniquedots = "&middot;&nbsp;";
          } else if (data.max_per_squad != null) {
            count = 0;
            uniquedots = "";
            while (count < data.max_per_squad) {
              uniquedots = uniquedots.concat("&middot;");
              ++count;
            }
            uniquedots = uniquedots.concat("&nbsp;");
          } else {
            uniquedots = "";
          }
          if (((_ref69 = this.collection) != null ? _ref69.counts : void 0) != null) {
            addon_count = (_ref70 = (_ref71 = this.collection.counts) != null ? (_ref72 = _ref71['upgrade']) != null ? _ref72[data.name] : void 0 : void 0) != null ? _ref70 : 0;
            container.find('.info-collection').text(this.uitranslation("collectionContentUpgrades", addon_count));
            container.find('.info-collection').show();
          } else {
            container.find('.info-collection').hide();
          }
          container.find('.info-name').html("" + uniquedots + (data.display_name ? data.display_name : data.name) + (exportObj.isReleased(data) ? "" : " (" + (this.uitranslation('unreleased')) + ")"));
          if (data.pointsarray != null) {
            point_info = "<i>" + this.uitranslation("varPointCostsPoints", data.pointsarray);
            if ((data.variableagility != null) && data.variableagility) {
              point_info += this.uitranslation("varPointCostsConditionAgility", (function() {
                _results = [];
                for (var _k = 0, _ref73 = data.pointsarray.length - 1; 0 <= _ref73 ? _k <= _ref73 : _k >= _ref73; 0 <= _ref73 ? _k++ : _k--){ _results.push(_k); }
                return _results;
              }).apply(this));
            } else if ((data.variableinit != null) && data.variableinit) {
              point_info += this.uitranslation("varPointCostsConditionIni", (function() {
                _results1 = [];
                for (var _l = 0, _ref74 = data.pointsarray.length - 1; 0 <= _ref74 ? _l <= _ref74 : _l >= _ref74; 0 <= _ref74 ? _l++ : _l--){ _results1.push(_l); }
                return _results1;
              }).apply(this));
            } else if ((data.variablebase != null) && data.variablebase) {
              point_info += this.uitranslation("varPointCostsConditionBase");
            }
            point_info += "</i>";
          }
          restriction_info = this.restriction_text(data) + this.upgrade_effect(data);
          if ((point_info != null) || (restriction_info !== '')) {
            if ((point_info != null) && (restriction_info !== '')) {
              point_info += "<br/>";
            }
            container.find('p.info-restrictions').html((point_info != null ? point_info : '') + restriction_info);
            container.find('p.info-restrictions').show();
          } else {
            container.find('p.info-restrictions').hide();
          }
          container.find('p.info-text').html((_ref75 = data.text) != null ? _ref75 : '');
          container.find('p.info-text').show();
          container.find('tr.info-ship').hide();
          container.find('tr.info-base').hide();
          container.find('tr.info-skill').hide();
          container.find('tr.info-engagement').hide();
          if (data.energy != null) {
            container.find('tr.info-energy td.info-data').text(data.energy);
            container.find('tr.info-energy').show();
          } else {
            container.find('tr.info-energy').hide();
          }
          if (data.attack != null) {
            container.find('tr.info-attack td.info-data').text(data.attack);
            container.find('tr.info-attack').show();
          } else {
            container.find('tr.info-attack').hide();
          }
          if (data.attackt != null) {
            container.find('tr.info-attack-turret td.info-data').text(data.attackt);
            container.find('tr.info-attack-turret').show();
          } else {
            container.find('tr.info-attack-turret').hide();
          }
          if (data.attackr != null) {
            container.find('tr.info-attack-right td.info-data').text(data.attackr);
            container.find('tr.info-attack-right').show();
          } else {
            container.find('tr.info-attack-right').hide();
          }
          if (data.attackl != null) {
            container.find('tr.info-attack-left td.info-data').text(data.attackl);
            container.find('tr.info-attack-left').show();
          } else {
            container.find('tr.info-attack-right').hide();
          }
          if (data.attackdt != null) {
            container.find('tr.info-attack-doubleturret td.info-data').text(data.attackdt);
            container.find('tr.info-attack-doubleturret').show();
          } else {
            container.find('tr.info-attack-doubleturret').hide();
          }
          if (data.attackbull != null) {
            container.find('tr.info-attack-bullseye td.info-data').text(data.attackbull);
            container.find('tr.info-attack-bullseye').show();
          } else {
            container.find('tr.info-attack-bullseye').hide();
          }
          if (data.attackf != null) {
            container.find('tr.info-attack-fullfront td.info-data').text(data.attackf);
            container.find('tr.info-attack-fullfront').show();
          } else {
            container.find('tr.info-attack-fullfront').hide();
          }
          container.find('tr.info-attack-right').hide();
          container.find('tr.info-attack-left').hide();
          container.find('tr.info-attack-back').hide();
          if (data.charge != null) {
            recurringicon = '';
            if (data.recurring != null) {
              if (data.recurring > 0) {
                count = 0;
                while (count < data.recurring) {
                  recurringicon += '<sup><i class="fas fa-caret-up"></i></sup>';
                  ++count;
                }
              } else {
                count = data.recurring;
                while (count < 0) {
                  recurringicon += '<sub><i class="fas fa-caret-down"></i></sub>';
                  ++count;
                }
              }
            }
            chargeHTML = $.trim("" + data.charge + recurringicon);
            container.find('tr.info-charge td.info-data').html(chargeHTML);
          }
          container.find('tr.info-charge').toggle(data.charge != null);
          if (data.range != null) {
            container.find('tr.info-range td.info-data').text(data.range);
            container.find('tr.info-range').show();
          } else {
            container.find('tr.info-range').hide();
          }
          if (data.rangebonus != null) {
            container.find('td.info-rangebonus').show();
          } else {
            container.find('td.info-rangebonus').hide();
          }
          container.find('tr.info-force td.info-data').html(data.force + '<sup><i class="fas fa-caret-up"></i></sup>');
          container.find('tr.info-force').toggle(data.force != null);
          container.find('tr.info-agility').hide();
          container.find('tr.info-hull').hide();
          container.find('tr.info-shields').hide();
          container.find('tr.info-actions').hide();
          container.find('tr.info-upgrades').hide();
          container.find('p.info-maneuvers').hide();
          break;
        case 'Rules':
          container.find('.info-type').hide();
          container.find('.info-sources').hide();
          container.find('.info-collection').hide();
          container.find('.info-name').html(data.name);
          container.find('.info-name').show();
          container.find('p.info-restrictions').hide();
          container.find('p.info-text').html(data.text);
          container.find('p.info-text').show();
          container.find('tr.info-ship').hide();
          container.find('tr.info-base').hide();
          container.find('tr.info-skill').hide();
          container.find('tr.info-agility').hide();
          container.find('tr.info-hull').hide();
          container.find('tr.info-shields').hide();
          container.find('tr.info-actions').hide();
          container.find('tr.info-upgrades').hide();
          container.find('p.info-maneuvers').hide();
          container.find('tr.info-energy').hide();
          container.find('tr.info-attack').hide();
          container.find('tr.info-attack-turret').hide();
          container.find('tr.info-attack-bullseye').hide();
          container.find('tr.info-attack-fullfront').hide();
          container.find('tr.info-attack-back').hide();
          container.find('tr.info-attack-doubleturret').hide();
          container.find('tr.info-charge').hide();
          container.find('td.info-rangebonus').hide();
          container.find('tr.info-range').hide();
          container.find('tr.info-force').hide();
          break;
        case 'MissingStuff':
          container.find('.info-type').text(this.uitranslation("List of Missing items"));
          container.find('.info-sources').hide();
          container.find('.info-collection').hide();
          container.find('.info-name').html(this.uitranslation("Missing items"));
          container.find('.info-name').show();
          missingStuffInfoText = this.uitranslation("Missing Item List:") + "<ul>";
          for (_m = 0, _len2 = data.length; _m < _len2; _m++) {
            item = data[_m];
            missingStuffInfoText += "<li><strong>" + (item.display_name != null ? item.display_name : item.name) + "</strong> (";
            first = true;
            _ref76 = item.sources;
            for (_n = 0, _len3 = _ref76.length; _n < _len3; _n++) {
              source = _ref76[_n];
              if (!first) {
                missingStuffInfoText += ", ";
              }
              missingStuffInfoText += source;
              first = false;
            }
            missingStuffInfoText += ")</li>";
          }
          missingStuffInfoText += "</ul>";
          container.find('p.info-restrictions').hide();
          container.find('p.info-text').html(missingStuffInfoText);
          container.find('p.info-text').show();
          container.find('tr.info-ship').hide();
          container.find('tr.info-base').hide();
          container.find('tr.info-skill').hide();
          container.find('tr.info-agility').hide();
          container.find('tr.info-hull').hide();
          container.find('tr.info-shields').hide();
          container.find('tr.info-actions').hide();
          container.find('tr.info-upgrades').hide();
          container.find('p.info-maneuvers').hide();
          container.find('tr.info-energy').hide();
          container.find('tr.info-attack').hide();
          container.find('tr.info-attack-turret').hide();
          container.find('tr.info-attack-bullseye').hide();
          container.find('tr.info-attack-fullfront').hide();
          container.find('tr.info-attack-back').hide();
          container.find('tr.info-attack-doubleturret').hide();
          container.find('tr.info-charge').hide();
          container.find('td.info-rangebonus').hide();
          container.find('tr.info-range').hide();
          container.find('tr.info-force').hide();
      }
      if (container !== this.mobile_tooltip_modal) {
        container.show();
      }
      this.tooltip_currently_displaying = data;
      if ($(window).width() >= 768) {
        well = container.find('.info-well');
        if ($.isElementInView(well, true)) {
          return well.css('position', 'fixed');
        } else {
          return well.css('position', 'static');
        }
      }
    }
  };

  SquadBuilder.prototype._randomizerLoopBody = function(data) {
    var addon, available_pilots, available_ships, available_upgrades, idx, new_ship, pilot, removable_things, ship, ship_type, sorted, thing_to_remove, unused_addons, upgrade, _, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _len6, _len7, _len8, _len9, _m, _n, _o, _p, _q, _r, _ref, _ref1, _ref10, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _s;
    if (data.keep_running) {
      if (data.max_points - this.total_points <= data.bid_goal && this.total_points <= data.max_points) {
        data.keep_running = false;
      } else if (this.total_points < data.max_points) {
        unused_addons = [];
        _ref = this.ships;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          ship = _ref[_i];
          _ref1 = ship.upgrades;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            upgrade = _ref1[_j];
            if (!((upgrade.data != null) || ((upgrade.occupied_by != null) && upgrade.occupied_by !== null))) {
              unused_addons.push(upgrade);
            }
          }
        }
        idx = $.randomInt(data.ships_or_upgrades + unused_addons.length);
        if (idx < data.ships_or_upgrades || unused_addons.length === 0) {
          available_ships = this.getAvailableShipsMatchingAndCheapEnough(data.max_points - this.total_points, '', false, data.collection_only);
          if (available_ships.length === 0) {
            if (unused_addons.length > 0) {
              idx = $.randomInt(unused_addons.length) + data.ships_or_upgrades;
            } else {
              available_ships = this.getAvailableShipsMatching('', false, data.collection_only);
            }
          }
          if ((available_ships.length > 0) && ((this.ships.length < data.ship_limit) || (data.ship_limit === 0))) {
            ship_type = available_ships[$.randomInt(available_ships.length)].name;
            available_pilots = this.getAvailablePilotsForShipIncluding(ship_type);
            if (available_pilots.length === 0) {
              return;
            }
            pilot = available_pilots[$.randomInt(available_pilots.length)];
            if (!pilot.disabled && (this.isQuickbuild ? exportObj.pilots[exportObj.quickbuildsById[pilot.id].pilot] : exportObj.pilotsById[pilot.id]).sources.intersects(data.allowed_sources) && ((!data.collection_only) || this.collection.checkShelf('pilot', (this.isQuickbuild ? exportObj.quickbuildsById[pilot.id] : pilot.name)))) {
              new_ship = this.addShip();
              new_ship.setPilotById(pilot.id);
            }
          }
        }
        if (idx >= data.ships_or_upgrades && unused_addons.length !== 0) {
          addon = unused_addons[idx - data.ships_or_upgrades];
          switch (addon.type) {
            case 'Upgrade':
              available_upgrades = (function() {
                var _k, _len2, _ref2, _results;
                _ref2 = this.getAvailableUpgradesIncluding(addon.slot, null, addon.ship, addon, '', this.dfl_filter_func, sorted = false);
                _results = [];
                for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
                  upgrade = _ref2[_k];
                  if (exportObj.upgradesById[upgrade.id].sources.intersects(data.allowed_sources) && ((!data.collection_only) || this.collection.checkShelf('upgrade', upgrade.name))) {
                    _results.push(upgrade);
                  }
                }
                return _results;
              }).call(this);
              upgrade = available_upgrades.length > 0 ? available_upgrades[$.randomInt(available_upgrades.length)] : void 0;
              if (upgrade && !upgrade.disabled) {
                addon.setById(upgrade.id);
              }
              break;
            default:
              throw new Error("Invalid addon type " + addon.type);
          }
        }
      } else {
        removable_things = [];
        _ref2 = this.ships;
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          ship = _ref2[_k];
          for (_ = _l = 0, _ref3 = 11 - data.ships_or_upgrades; 0 <= _ref3 ? _l < _ref3 : _l > _ref3; _ = 0 <= _ref3 ? ++_l : --_l) {
            removable_things.push(ship);
          }
          _ref4 = ship.upgrades;
          for (_m = 0, _len3 = _ref4.length; _m < _len3; _m++) {
            upgrade = _ref4[_m];
            if (upgrade.data != null) {
              removable_things.push(upgrade);
            }
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
      while (this.total_points > data.max_points) {
        removable_things = [];
        _ref5 = this.ships;
        for (_n = 0, _len4 = _ref5.length; _n < _len4; _n++) {
          ship = _ref5[_n];
          _ref6 = ship.upgrades;
          for (_o = 0, _len5 = _ref6.length; _o < _len5; _o++) {
            upgrade = _ref6[_o];
            if (upgrade.data != null) {
              removable_things.push(upgrade);
            }
          }
        }
        if (removable_things.length === 0) {
          _ref7 = this.ships;
          for (_p = 0, _len6 = _ref7.length; _p < _len6; _p++) {
            ship = _ref7[_p];
            removable_things.push(ship);
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
      if (data.fill_zero_pts) {
        _ref8 = this.ships;
        for (_q = 0, _len7 = _ref8.length; _q < _len7; _q++) {
          ship = _ref8[_q];
          _ref9 = ship.upgrades;
          for (_r = 0, _len8 = _ref9.length; _r < _len8; _r++) {
            addon = _ref9[_r];
            if (!!((addon.data != null) || ((addon.occupied_by != null) && addon.occupied_by !== null))) {
              continue;
            }
            available_upgrades = (function() {
              var _len9, _ref10, _results, _s;
              _ref10 = this.getAvailableUpgradesIncluding(addon.slot, null, addon.ship, addon, '', this.dfl_filter_func, sorted = false);
              _results = [];
              for (_s = 0, _len9 = _ref10.length; _s < _len9; _s++) {
                upgrade = _ref10[_s];
                if (exportObj.upgradesById[upgrade.id].sources.intersects(data.allowed_sources) && (upgrade.points < 1) && ((!data.collection_only) || this.collection.checkShelf('upgrade', upgrade.name))) {
                  _results.push(upgrade);
                }
              }
              return _results;
            }).call(this);
            upgrade = available_upgrades.length > 0 ? available_upgrades[$.randomInt(available_upgrades.length)] : void 0;
            if (upgrade && !upgrade.disabled) {
              addon.setById(upgrade.id);
            }
          }
        }
      }
      window.clearTimeout(data.timer);
      _ref10 = this.ships;
      for (_s = 0, _len9 = _ref10.length; _s < _len9; _s++) {
        ship = _ref10[_s];
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

  SquadBuilder.prototype.randomSquad = function(max_points, allowed_sources, timeout_ms, bid_goal, ship_limit, ships_or_upgrades, collection_only, fill_zero_pts) {
    var data, stopHandler;
    if (max_points == null) {
      max_points = 200;
    }
    if (allowed_sources == null) {
      allowed_sources = null;
    }
    if (timeout_ms == null) {
      timeout_ms = 1000;
    }
    if (bid_goal == null) {
      bid_goal = 5;
    }
    if (ship_limit == null) {
      ship_limit = 0;
    }
    if (ships_or_upgrades == null) {
      ships_or_upgrades = 3;
    }
    if (collection_only == null) {
      collection_only = true;
    }
    if (fill_zero_pts == null) {
      fill_zero_pts = false;
    }
    this.backend_status.fadeOut('slow');
    this.suppress_automatic_new_ship = true;
    if (allowed_sources.length < 1) {
      allowed_sources = null;
    }
    while (this.ships.length > 0) {
      this.removeShip(this.ships[0]);
    }
    if (this.ships.length > 0) {
      throw new Error("Ships not emptied");
    }
    data = {
      max_points: max_points,
      bid_goal: bid_goal,
      ship_limit: ship_limit,
      ships_or_upgrades: ships_or_upgrades,
      keep_running: true,
      allowed_sources: allowed_sources != null ? allowed_sources : exportObj.expansions,
      collection_only: (this.collection != null) && (this.collection.checks.collectioncheck === "true") && collection_only,
      fill_zero_pts: fill_zero_pts
    };
    stopHandler = (function(_this) {
      return function() {
        return data.keep_running = false;
      };
    })(this);
    data.timer = window.setTimeout(stopHandler, timeout_ms);
    window.setTimeout(this._makeRandomizerLoopFunc(data), 0);
    this.resetCurrentSquad();
    this.current_squad.name = this.uitranslation('Random Squad');
    return this.container.trigger('xwing-backend:squadNameChanged');
  };

  SquadBuilder.prototype.setBackend = function(backend) {
    var meth, _i, _len, _ref, _results;
    this.backend = backend;
    if (this.waiting_for_backend != null) {
      _ref = this.waiting_for_backend;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        meth = _ref[_i];
        _results.push(meth());
      }
      return _results;
    }
  };

  SquadBuilder.prototype.upgrade_effect = function(card) {
    var addonname, comma, data, removestext, slot, statchange, text, _i, _j, _len, _len1, _ref, _ref1;
    removestext = text = comma = '';
    if (card.modifier_func) {
      statchange = {
        attack: 0,
        attackf: 0,
        attackbull: 0,
        attackb: 0,
        attackt: 0,
        attackl: 0,
        attackr: 0,
        attackdt: 0,
        energy: 0,
        agility: 0,
        hull: 0,
        shields: 0,
        force: 0,
        actions: [],
        maneuvers: [0, 0]
      };
      card.modifier_func(statchange);
      if (statchange.attack !== 0) {
        text += comma + ("%FRONTARC% (" + statchange.attack + ")");
        comma = ', ';
      }
      if (statchange.attackf !== 0) {
        text += comma + ("%FULLFRONTARC% (" + statchange.attackf + ")");
        comma = ', ';
      }
      if (statchange.attackbull !== 0) {
        text += comma + ("%BULLSEYEARC% (" + statchange.attackbull + ")");
        comma = ', ';
      }
      if (statchange.attackb !== 0) {
        text += comma + ("%REARARC% (" + statchange.attackb + ")");
        comma = ', ';
      }
      if (statchange.attackt !== 0) {
        text += comma + ("%SINGLETURRETARC% (" + statchange.attackt + ")");
        comma = ', ';
      }
      if (statchange.attackl !== 0) {
        text += comma + ("%LEFTARC% (" + statchange.attackl + ")");
        comma = ', ';
      }
      if (statchange.attackr !== 0) {
        text += comma + ("%RIGHTARC% (" + statchange.attackr + ")");
        comma = ', ';
      }
      if (statchange.attackdt !== 0) {
        text += comma + ("%DOUBLETURRETARC% (" + statchange.attackdt + ")");
        comma = ', ';
      }
      if (statchange.energy !== 0) {
        text += comma + ("%ENERGY% (" + statchange.energy + ")");
        comma = ', ';
      }
      if (statchange.agility !== 0) {
        text += comma + ("%AGILITY% (" + statchange.agility + ")");
        comma = ', ';
      }
      if (statchange.hull !== 0) {
        text += comma + ("%HULL% (" + statchange.hull + ")");
        comma = ', ';
      }
      if (statchange.shields !== 0) {
        text += comma + ("%SHIELD% (" + statchange.shields + ")");
        comma = ', ';
      }
      if (statchange.actions.length > 0) {
        text += comma + this.formatActions(statchange.actions, ", ");
        comma = ', ';
      }
    }
    if (card.confersAddons) {
      _ref = card.confersAddons;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        addonname = _ref[_i];
        text += comma + ("%" + (addonname.slot.toUpperCase().replace(/[^a-z0-9]/gi, '')) + "%");
        comma = ', ';
      }
    }
    if (card.unequips_upgrades) {
      comma = '';
      _ref1 = card.unequips_upgrades;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        slot = _ref1[_j];
        removestext += comma + ("%" + (slot.toUpperCase().replace(/[^a-z0-9]/gi, '')) + "%");
        comma = ', ';
      }
    }
    if (text !== '') {
      data = {
        text: "</br><b>" + (this.uitranslation("Adds")) + ":</b> " + text
      };
      if (removestext !== '') {
        data.text += "</br><b>" + (this.uitranslation("Removes")) + ":</b> " + removestext;
      }
      return exportObj.fixIcons(data);
    } else {
      return '';
    }
  };

  SquadBuilder.prototype.restriction_text = function(card) {
    var array, comma, data, factionitem, othertext, r, shipname, text, uniquetext, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
    uniquetext = comma = othertext = text = '';
    if (card.restrictions) {
      _ref = card.restrictions;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        r = _ref[_i];
        if (r[0] === "orUnique") {
          uniquetext = exportObj.translate('restrictions', " or Squad Including") + (" " + r[1]);
          continue;
        }
        switch (r[0]) {
          case "Base":
            text += comma + ("" + r[1] + " ") + exportObj.translate('restrictions', "Ship");
            break;
          case "Action":
            array = [r[1]];
            text += comma + this.formatActions(array, "", []);
            break;
          case "Equipped":
            text += comma + ("%" + (r[1].toUpperCase().replace(/[^a-z0-9]/gi, '')) + "% Equipped");
            break;
          case "Slot":
            text += comma + exportObj.translate('restrictions', "Extra") + (" %" + (r[1].toUpperCase().replace(/[^a-z0-9]/gi, '')) + "%");
            break;
          case "Keyword":
            text += comma + exportObj.translate('restrictions', "" + r[1]);
            break;
          case "AttackArc":
            text += comma + "%REARARC%";
            break;
          case "ShieldsGreaterThan":
            text += comma + ("%SHIELD% > " + r[1]);
            break;
          case "EnergyGreatterThan":
            text += comma + ("%ENERGY% > " + r[1]);
            break;
          case "InitiativeGreaterThan":
            text += comma + exportObj.translate('restrictions', "Initiative") + (" > " + r[1]);
            break;
          case "InitiativeLessThan":
            text += comma + exportObj.translate('restrictions', "Initiative") + (" < " + r[1]);
            break;
          case "AgilityEquals":
            text += comma + exportObj.translate('restrictions', "Agility") + (" = " + r[1]);
            break;
          case "isUnique":
            if (r[1] === true) {
              text += comma + exportObj.translate('restrictions', "Limited");
            } else {
              text += comma + exportObj.translate('restrictions', "Non-Limited");
            }
            break;
          case "Format":
            text += comma + exportObj.translate('restrictions', "" + r[1] + " Ship");
            break;
          case "Faction":
            othertext += comma + exportObj.translate('faction', "" + r[1]);
        }
        comma = ', ';
      }
    }
    if (!card.skill) {
      if (othertext === '') {
        if (card.faction) {
          if (card.faction instanceof Array) {
            _ref1 = card.faction;
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              factionitem = _ref1[_j];
              othertext += comma + exportObj.translate('faction', "" + factionitem);
              comma = ' or ';
            }
          } else {
            othertext += comma + exportObj.translate('faction', "" + card.faction);
          }
          comma = ', ';
        }
      }
      if (card.ship) {
        if (card.ship instanceof Array) {
          _ref2 = card.ship;
          for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
            shipname = _ref2[_k];
            othertext += comma + shipname;
            comma = ' or ';
          }
        } else {
          othertext += comma + card.ship;
        }
        comma = ', ';
      }
      if (card.solitary) {
        othertext += comma + exportObj.translate('faction', "Solitary");
        comma = ', ';
      }
      if (card.standardized) {
        othertext += comma + exportObj.translate('faction', "Standardized");
        comma = ', ';
      }
    }
    text += othertext + uniquetext;
    if (text !== '') {
      data = {
        text: "<i><b>" + exportObj.translate('restrictions', "Restrictions") + ":</b> " + text + "</i>"
      };
      return exportObj.fixIcons(data);
    } else {
      return '';
    }
  };

  SquadBuilder.prototype.describeSquad = function() {
    var ship;
    if (this.getNotes().trim() === '') {
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
    } else {
      return this.getNotes();
    }
  };

  SquadBuilder.prototype.listCards = function() {
    var card_obj, ship, upgrade, _i, _j, _len, _len1, _ref, _ref1;
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
      }
    }
    return Object.keys(card_obj).sort();
  };

  SquadBuilder.prototype.getNotes = function() {
    return this.notes.val();
  };

  SquadBuilder.prototype.getTag = function() {
    return this.tag.val();
  };

  SquadBuilder.prototype.getObstacles = function() {
    return this.current_obstacles;
  };

  SquadBuilder.prototype.isSquadPossibleWithCollection = function() {
    var missingStuff, pilot_is_available, ship, ship_is_available, upgrade, upgrade_is_available, validity, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3, _ref4;
    if (Object.keys((_ref = (_ref1 = this.collection) != null ? _ref1.expansions : void 0) != null ? _ref : {}).length === 0) {
      return [true, []];
    } else if (((_ref2 = this.collection) != null ? _ref2.checks.collectioncheck : void 0) !== "true") {
      return [true, []];
    }
    this.collection.reset();
    validity = true;
    missingStuff = [];
    _ref3 = this.ships;
    for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
      ship = _ref3[_i];
      if (ship.pilot != null) {
        ship_is_available = this.collection.use('ship', ship.pilot.ship);
        pilot_is_available = this.collection.use('pilot', ship.pilot.name);
        if (!(ship_is_available && pilot_is_available)) {
          validity = false;
        }
        if (!ship_is_available) {
          missingStuff.push(ship.data);
        }
        if (!pilot_is_available) {
          missingStuff.push(ship.pilot);
        }
        _ref4 = ship.upgrades;
        for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
          upgrade = _ref4[_j];
          if (upgrade.data != null) {
            upgrade_is_available = this.collection.use('upgrade', upgrade.data.name);
            if (!upgrade_is_available) {
              validity = false;
            }
            if (!upgrade_is_available) {
              missingStuff.push(upgrade.data);
            }
          }
        }
      }
    }
    return [validity, missingStuff];
  };

  SquadBuilder.prototype.checkCollection = function() {
    var missingStuff, squadPossible, _ref;
    if (this.collection != null) {
      _ref = this.isSquadPossibleWithCollection(), squadPossible = _ref[0], missingStuff = _ref[1];
      this.collection_invalid_container.toggleClass('d-none', squadPossible);
      return this.collection_invalid_container.on('mouseover', (function(_this) {
        return function(e) {
          return _this.showTooltip('MissingStuff', missingStuff);
        };
      })(this));
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
          builder: 'YASB 2.0',
          builder_url: window.location.href.split('?')[0],
          link: this.getPermaLink()
        }
      },
      version: '2.0.0'
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
      if (k !== 'id' && k !== 'upgrades' && k !== 'multisection_id') {
        delete xws[k];
      }
    }
    return xws;
  };

  SquadBuilder.prototype.loadFromXWS = function(xws, cb) {
    var addons, error, key, new_ship, pilot, pilotxws, possible_pilot, possible_pilots, serialized_squad, slot, success, upgrade, upgrade_canonical, upgrade_canonicals, upgrade_type, version_list, x, xws_faction, _base, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3, _ref4;
    success = null;
    error = null;
    if (xws.version != null) {
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
    } else {
      version_list = [0, 2];
    }
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
        success = true;
        error = "";
        serialized_squad = "v8ZsZ200Z";
        _ref = xws.pilots;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          pilot = _ref[_i];
          new_ship = this.addShip();
          if (pilot.id) {
            pilotxws = pilot.id;
          } else if (pilot.name) {
            pilotxws = pilot.name;
          } else {
            success = false;
            error = "Pilot without identifier";
            break;
          }
          if (exportObj.pilotsByFactionXWS[xws_faction][pilotxws] != null) {
            serialized_squad += exportObj.pilotsByFactionXWS[xws_faction][pilotxws][0].id;
          } else if (exportObj.pilotsByUniqueName[pilotxws] && exportObj.pilotsByUniqueName[pilotxws].length === 1) {
            serialized_squad += exportObj.pilotsByUniqueName[pilotxws][0].id;
          } else {
            _ref1 = exportObj.pilotsByUniqueName;
            for (key in _ref1) {
              possible_pilots = _ref1[key];
              for (_j = 0, _len1 = possible_pilots.length; _j < _len1; _j++) {
                possible_pilot = possible_pilots[_j];
                if ((possible_pilot.xws && possible_pilot.xws === pilotxws) || (!possible_pilot.xws && key === pilotxws)) {
                  serialized_squad += possible_pilot.id;
                  break;
                }
              }
            }
          }
          serialized_squad += "X";
          addons = [];
          _ref3 = (_ref2 = pilot.upgrades) != null ? _ref2 : {};
          for (upgrade_type in _ref3) {
            upgrade_canonicals = _ref3[upgrade_type];
            for (_k = 0, _len2 = upgrade_canonicals.length; _k < _len2; _k++) {
              upgrade_canonical = upgrade_canonicals[_k];
              slot = null;
              slot = (_ref4 = exportObj.fromXWSUpgrade[upgrade_type]) != null ? _ref4 : upgrade_type.capitalize();
              upgrade = (_base = exportObj.upgradesBySlotXWSName[slot])[upgrade_canonical] != null ? _base[upgrade_canonical] : _base[upgrade_canonical] = exportObj.upgradesBySlotCanonicalName[slot][upgrade_canonical];
              if (upgrade == null) {
                console.log("Failed to load xws upgrade: " + upgrade_canonical);
                error += "Skipped upgrade " + upgrade_canonical;
                success = false;
                continue;
              }
              serialized_squad += upgrade.id;
              serialized_squad += "W";
            }
          }
          serialized_squad += "XY";
        }
        this.loadFromSerialized(serialized_squad);
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
    this.quickbuildId = -1;
    this.linkedShip = null;
    this.primary = true;
    this.upgrades = [];
    this.wingmates = [];
    this.destroystate = null;
    this.uitranslation = this.builder.uitranslation;
    this.setupUI();
  }

  Ship.prototype.destroy = function(cb) {
    var idx, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    this.resetPilot();
    this.resetAddons();
    this.teardownUI();
    idx = this.builder.ships.indexOf(this);
    if (idx < 0) {
      throw new Error("Ship not registered with builder");
    }
    this.builder.ships.splice(idx, 1);
    if (this.wingmates.length > 0) {
      this.setWingmates(0);
    }
    (function(_this) {
      return (function(__iced_k) {
        if (_this.linkedShip !== null) {
          (function(__iced_k) {
            var _ref;
            if (((_ref = _this.linkedShip.wingmates) != null ? _ref.length : void 0) > 0 && __indexOf.call(_this.linkedShip.wingmates, _this) >= 0) {
              return __iced_k(_this.linkedShip.removeFromWing(_this));
            } else {
              _this.linkedShip.linkedShip = null;
              (function(__iced_k) {
                __iced_deferrals = new iced.Deferrals(__iced_k, {
                  parent: ___iced_passed_deferral,
                  funcname: "Ship.destroy"
                });
                _this.builder.removeShip(_this.linkedShip, __iced_deferrals.defer({
                  lineno: 5542
                }));
                __iced_deferrals._fulfill();
              })(__iced_k);
            }
          })(__iced_k);
        } else {
          return __iced_k();
        }
      });
    })(this)((function(_this) {
      return function() {
        return cb();
      };
    })(this));
  };

  Ship.prototype.copyFrom = function(other) {
    var available_pilots, delayed_upgrades, id, no_uniques_involved, other_upgrade, other_upgrades, pilot_data, upgrade, _i, _j, _k, _l, _len, _len1, _len2, _len3, _name, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8;
    if (other === this) {
      throw new Error("Cannot copy from self");
    }
    if (!((other.pilot != null) && (other.data != null))) {
      return;
    }
    if (this.builder.isQuickbuild) {
      if (!(other.pilot.unique || ((other.pilot.max_per_squad != null) && this.builder.countPilots(other.pilot.canonical_name) >= other.pilot.max_per_squad))) {
        no_uniques_involved = true;
        _ref = other.upgrades;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          upgrade = _ref[_i];
          if (((((_ref1 = upgrade.data) != null ? _ref1.unique : void 0) != null) && upgrade.data.unique) || ((((_ref2 = upgrade.data) != null ? _ref2.max_per_squad : void 0) != null) && this.builder.countUpgrades(upgrade.data.canonical_name) >= upgrade.data.max_per_squad) || (((_ref3 = upgrade.data) != null ? _ref3.solitary : void 0) != null)) {
            no_uniques_involved = false;
            available_pilots = (function() {
              var _j, _len1, _ref4, _results;
              _ref4 = this.builder.getAvailablePilotsForShipIncluding(other.data.name);
              _results = [];
              for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
                pilot_data = _ref4[_j];
                if (!pilot_data.disabled) {
                  _results.push(pilot_data);
                }
              }
              return _results;
            }).call(this);
            if (available_pilots.length > 0) {
              this.setPilotById(available_pilots[0].id, true);
              break;
            } else {
              return;
            }
          }
        }
        if (no_uniques_involved) {
          this.setPilotById(other.quickbuildId);
        }
      }
    } else {
      if (other.pilot.unique || ((other.pilot.max_per_squad != null) && this.builder.countPilots(other.pilot.canonical_name) >= other.pilot.max_per_squad)) {
        available_pilots = (function() {
          var _j, _len1, _ref4, _results;
          _ref4 = this.builder.getAvailablePilotsForShipIncluding(other.data.name);
          _results = [];
          for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
            pilot_data = _ref4[_j];
            if (!pilot_data.disabled) {
              _results.push(pilot_data);
            }
          }
          return _results;
        }).call(this);
        if (available_pilots.length > 0) {
          this.setPilotById(available_pilots[0].id, true);
        } else {
          return;
        }
      } else {
        this.setPilotById(other.pilot.id, true);
      }
      other_upgrades = {};
      _ref4 = other.upgrades;
      for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
        upgrade = _ref4[_j];
        if (((upgrade != null ? upgrade.data : void 0) != null) && !upgrade.data.unique && ((upgrade.data.max_per_squad == null) || this.builder.countUpgrades(upgrade.data.canonical_name) < upgrade.data.max_per_squad)) {
          if (other_upgrades[_name = upgrade.slot] == null) {
            other_upgrades[_name] = [];
          }
          other_upgrades[upgrade.slot].push(upgrade);
        }
      }
      delayed_upgrades = {};
      _ref5 = this.upgrades;
      for (_k = 0, _len2 = _ref5.length; _k < _len2; _k++) {
        upgrade = _ref5[_k];
        other_upgrade = ((_ref6 = other_upgrades[upgrade.slot]) != null ? _ref6 : []).shift();
        if (other_upgrade != null) {
          upgrade.setById(other_upgrade.data.id);
          if (!upgrade.lastSetValid) {
            delayed_upgrades[other_upgrade.data.id] = upgrade;
          }
        }
      }
      for (id in delayed_upgrades) {
        upgrade = delayed_upgrades[id];
        upgrade.setById(id);
      }
      _ref7 = this.upgrades;
      for (_l = 0, _len3 = _ref7.length; _l < _len3; _l++) {
        upgrade = _ref7[_l];
        if (!upgrade.isOccupied()) {
          other_upgrade = ((_ref8 = other_upgrades[upgrade.slot]) != null ? _ref8 : []).shift();
          if (other_upgrade != null) {
            upgrade.setById(other_upgrade.data.id);
          }
        }
      }
      this.addStandardizedUpgrades();
    }
    this.updateSelections();
    this.builder.container.trigger('xwing:pointsUpdated');
    this.builder.current_squad.dirty = true;
    return this.builder.container.trigger('xwing-backend:squadDirtinessChanged');
  };

  Ship.prototype.setShipType = function(ship_type) {
    var cls, pilot, quickbuild_id, result, _i, _len, _ref, _ref1;
    this.pilot_selector.data('select2').container.show();
    if (ship_type !== ((_ref = this.pilot) != null ? _ref.ship : void 0)) {
      if (!this.builder.isQuickbuild) {
        pilot = ((function() {
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
        }).call(this))[0];
        if (pilot) {
          this.setPilot(pilot);
        } else {
          this.setPilot(((function() {
            var _i, _len, _ref1, _ref2, _results;
            _ref1 = this.builder.getAvailablePilotsForShipIncluding(ship_type);
            _results = [];
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              result = _ref1[_i];
              if (((exportObj.pilotsById[result.id].restriction_func == null) || exportObj.pilotsById[result.id].restriction_func(this)) && !(_ref2 = exportObj.pilotsById[result.id], __indexOf.call(this.builder.uniques_in_use.Pilot, _ref2) >= 0)) {
                _results.push(exportObj.pilotsById[result.id]);
              }
            }
            return _results;
          }).call(this))[0]);
        }
      } else {
        quickbuild_id = ((function() {
          var _i, _len, _ref1, _results;
          _ref1 = this.builder.getAvailablePilotsForShipIncluding(ship_type);
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            result = _ref1[_i];
            if (!result.disabled) {
              _results.push(result.id);
            }
          }
          return _results;
        }).call(this))[0];
        this.setPilotById(quickbuild_id);
      }
    }
    this.checkPilotSelectorQueryModal();
    _ref1 = this.row.attr('class').split(/\s+/);
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      cls = _ref1[_i];
      if (cls.indexOf('ship-') === 0) {
        this.row.removeClass(cls);
      }
    }
    this.remove_button.fadeIn('fast');
    this.copy_button.fadeIn('fast');
    this.points_destroyed_button.fadeIn('fast');
    this.row.addClass("ship-" + (ship_type.toLowerCase().replace(/[^a-z0-9]/gi, '')));
    return this.builder.container.trigger('xwing:shipUpdated');
  };

  Ship.prototype.setPilotById = function(id, noautoequip) {
    var new_pilot, quickbuild, ship, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    if (noautoequip == null) {
      noautoequip = false;
    }
    if (!this.builder.isQuickbuild) {
      return __iced_k(this.setPilot(exportObj.pilotsById[parseInt(id)], noautoequip));
    } else {
      (function(_this) {
        return (function(__iced_k) {
          if (id !== _this.quickbuildId) {
            _this.wingmate_selector.parent().hide();
            if ((_this.wingmates != null) && _this.wingmates.length > 0) {
              _this.setWingmates(0);
              _this.linkedShip = null;
            }
            _this.quickbuildId = id;
            _this.builder.current_squad.dirty = true;
            _this.resetPilot();
            _this.resetAddons();
            (function(__iced_k) {
              if ((id != null) && id > -1) {
                quickbuild = exportObj.quickbuildsById[parseInt(id)];
                new_pilot = exportObj.pilots[quickbuild.pilot];
                _this.data = exportObj.ships[quickbuild.ship];
                _this.builder.isUpdatingPoints = true;
                (function(__iced_k) {
                  if ((new_pilot != null ? new_pilot.unique : void 0) != null) {
                    (function(__iced_k) {
                      __iced_deferrals = new iced.Deferrals(__iced_k, {
                        parent: ___iced_passed_deferral,
                        funcname: "Ship.setPilotById"
                      });
                      _this.builder.container.trigger('xwing:claimUnique', [
                        new_pilot, 'Pilot', __iced_deferrals.defer({
                          lineno: 5660
                        })
                      ]);
                      __iced_deferrals._fulfill();
                    })(__iced_k);
                  } else {
                    return __iced_k();
                  }
                })(function() {
                  var _i, _len, _ref;
                  _this.pilot = new_pilot;
                  if (_this.pilot != null) {
                    _this.setupAddons();
                  }
                  _this.copy_button.show();
                  _this.setShipType(_this.pilot.ship);
                  if ((quickbuild.wingmate != null) && (_this.linkedShip == null)) {
                    _ref = _this.builder.ships;
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                      ship = _ref[_i];
                      if (ship.quickbuildId === quickbuild.linkedId) {
                        ship.joinWing(_this);
                        _this.linkedShip = ship;
                        _this.primary = false;
                        _this.builder.isUpdatingPoints = false;
                        _this.builder.container.trigger('xwing:pointsUpdated');
                        _this.builder.container.trigger('xwing-backend:squadDirtinessChanged');
                        return;
                      }
                    }
                  }
                  (function(__iced_k) {
                    if (_this.linkedShip) {
                      (function(__iced_k) {
                        if (quickbuild.linkedId != null) {
                          _this.linkedShip.setPilotById(quickbuild.linkedId);
                          return __iced_k(quickbuild.wingmate == null ? _this.linkedShip.primary = false : void 0);
                        } else {
                          (function(__iced_k) {
                            var _ref1;
                            if (((_ref1 = _this.linkedShip.wingmates) != null ? _ref1.length : void 0) > 0) {
                              return __iced_k(_this.linkedShip.removeFromWing(_this));
                            } else {
                              _this.linkedShip.linkedShip = null;
                              (function(__iced_k) {
                                __iced_deferrals = new iced.Deferrals(__iced_k, {
                                  parent: ___iced_passed_deferral,
                                  funcname: "Ship.setPilotById"
                                });
                                _this.builder.removeShip(_this.linkedShip, __iced_deferrals.defer({
                                  lineno: 5693
                                }));
                                __iced_deferrals._fulfill();
                              })(__iced_k);
                            }
                          })(function() {
                            return __iced_k(_this.linkedShip = null);
                          });
                        }
                      })(__iced_k);
                    } else {
                      return __iced_k(quickbuild.linkedId != null ? (_this.linkedShip = _this.builder.ships.slice(-1)[0], _this.linkedShip.data !== null ? _this.linkedShip = _this.builder.addShip() : _this.builder.addShip(), _this.linkedShip.linkedShip = _this, _this.linkedShip.setPilotById(quickbuild.linkedId), quickbuild.wingmate == null ? _this.linkedShip.primary = false : void 0) : void 0);
                    }
                  })(function() {
                    _this.primary = quickbuild.wingmate == null;
                    if ((quickbuild != null ? quickbuild.wingleader : void 0) != null) {
                      _this.wingmate_selector.parent().show();
                      _this.wingmate_selector.val(quickbuild.wingmates[0]);
                      _this.wingmate_selector.attr("min", quickbuild.wingmates[0]);
                      _this.wingmate_selector.attr("max", quickbuild.wingmates[quickbuild.wingmates.length - 1]);
                      _this.setWingmates(quickbuild.wingmates[0]);
                    }
                    _this.builder.isUpdatingPoints = false;
                    return __iced_k(_this.builder.container.trigger('xwing:pointsUpdated'));
                  });
                });
              } else {
                return __iced_k(_this.copy_button.hide());
              }
            })(function() {
              _this.builder.container.trigger('xwing:pointsUpdated');
              return __iced_k(_this.builder.container.trigger('xwing-backend:squadDirtinessChanged'));
            });
          } else {
            return __iced_k();
          }
        });
      })(this)(__iced_k);
    }
  };

  Ship.prototype.addStandardizedUpgrades = function() {
    var idx, upgrade, _i, _len, _ref, _results;
    idx = this.builder.standard_list['Ship'].indexOf(this.data.name);
    if (idx > -1) {
      _ref = this.upgrades;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        upgrade = _ref[_i];
        if (exportObj.slotsMatching(upgrade.slot, this.builder.standard_list['Upgrade'][idx].slot)) {
          upgrade.setData(this.builder.standard_list['Upgrade'][idx]);
          break;
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    }
  };

  Ship.prototype.setPilot = function(new_pilot, noautoequip) {
    var auto_equip_upgrade, autoequip, delayed_upgrades, id, old_upgrade, old_upgrades, same_ship, upgrade, upgrade_name, ___iced_passed_deferral, __iced_deferrals, __iced_k, _i, _len, _name, _ref;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    if (noautoequip == null) {
      noautoequip = false;
    }
    if (new_pilot !== this.pilot) {
      this.builder.current_squad.dirty = true;
      same_ship = (this.pilot != null) && (new_pilot != null ? new_pilot.ship : void 0) === this.pilot.ship;
      old_upgrades = {};
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
                      lineno: 5751
                    })
                  ]);
                  __iced_deferrals._fulfill();
                })(__iced_k);
              } else {
                return __iced_k();
              }
            })(function() {
              var _j, _k, _l, _len1, _len2, _len3, _ref1, _ref2, _ref3, _ref4, _ref5;
              _this.pilot = new_pilot;
              if (_this.pilot != null) {
                _this.setupAddons();
              }
              _this.copy_button.show();
              _this.setShipType(_this.pilot.ship);
              _this.addStandardizedUpgrades();
              if (((_this.pilot.autoequip != null) || ((exportObj.ships[_this.pilot.ship].autoequip != null) && !same_ship)) && !noautoequip) {
                autoequip = ((_ref2 = _this.pilot.autoequip) != null ? _ref2 : []).concat((_ref1 = exportObj.ships[_this.pilot.ship].autoequip) != null ? _ref1 : []);
                for (_j = 0, _len1 = autoequip.length; _j < _len1; _j++) {
                  upgrade_name = autoequip[_j];
                  auto_equip_upgrade = exportObj.upgrades[upgrade_name];
                  _ref3 = _this.upgrades;
                  for (_k = 0, _len2 = _ref3.length; _k < _len2; _k++) {
                    upgrade = _ref3[_k];
                    if (exportObj.slotsMatching(upgrade.slot, auto_equip_upgrade.slot)) {
                      upgrade.setData(auto_equip_upgrade);
                    }
                  }
                }
              }
              if (same_ship) {
                delayed_upgrades = {};
                _ref4 = _this.upgrades;
                for (_l = 0, _len3 = _ref4.length; _l < _len3; _l++) {
                  upgrade = _ref4[_l];
                  old_upgrade = ((_ref5 = old_upgrades[upgrade.slot]) != null ? _ref5 : []).shift();
                  if (old_upgrade != null) {
                    upgrade.setById(old_upgrade.data.id);
                    if (!upgrade.lastSetValid) {
                      delayed_upgrades[old_upgrade.data.id] = upgrade;
                    }
                  }
                }
                for (id in delayed_upgrades) {
                  upgrade = delayed_upgrades[id];
                  upgrade.setById(id);
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
          _this.row.removeClass('unsortable');
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
                lineno: 5782
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
    var slot, upgrade, upgrade_data, upgrade_name, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3, _results, _results1;
    if (!this.builder.isQuickbuild) {
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
    } else {
      _ref3 = (_ref2 = exportObj.quickbuildsById[this.quickbuildId].upgrades) != null ? _ref2 : [];
      _results1 = [];
      for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
        upgrade_name = _ref3[_j];
        upgrade_data = exportObj.upgrades[upgrade_name];
        if (upgrade_data == null) {
          console.log("Unknown Upgrade: " + upgrade_name);
          continue;
        }
        upgrade = new exportObj.QuickbuildUpgrade({
          ship: this,
          container: this.addon_container,
          slot: upgrade_data.slot,
          upgrade: upgrade_data
        });
        upgrade.setData(upgrade_data);
        _results1.push(this.upgrades.push(upgrade));
      }
      return _results1;
    }
  };

  Ship.prototype.resetAddons = function() {
    var upgrade, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    (function(_this) {
      return (function(__iced_k) {
        var _i, _len, _ref;
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          funcname: "Ship.resetAddons"
        });
        _ref = _this.upgrades;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          upgrade = _ref[_i];
          if (upgrade != null) {
            upgrade.destroy(__iced_deferrals.defer({
              lineno: 5811
            }));
          }
        }
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        return _this.upgrades = [];
      };
    })(this));
  };

  Ship.prototype.getPoints = function() {
    var points, quickbuild, threat, upgrade, _i, _len, _ref, _ref1, _ref2, _ref3;
    if (!this.builder.isQuickbuild) {
      points = (_ref = (_ref1 = this.pilot) != null ? _ref1.points : void 0) != null ? _ref : 0;
      _ref2 = this.upgrades;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        upgrade = _ref2[_i];
        points += upgrade.getPoints();
      }
      this.points_container.find('span').text(points);
      if (points > 0) {
        this.points_container.fadeTo('fast', 1);
      } else {
        this.points_container.fadeTo(0, 0);
      }
      return points;
    } else {
      quickbuild = exportObj.quickbuildsById[this.quickbuildId];
      threat = this.primary ? (_ref3 = quickbuild != null ? quickbuild.threat : void 0) != null ? _ref3 : 0 : 0;
      if ((quickbuild != null ? quickbuild.wingleader : void 0) != null) {
        threat = quickbuild.threat[quickbuild.wingmates.indexOf(this.wingmates.length)];
      }
      this.points_container.find('span').text(threat);
      if (threat > 0) {
        this.points_container.fadeTo('fast', 1);
      } else {
        this.points_container.fadeTo(0, 0);
      }
      return threat;
    }
  };

  Ship.prototype.setWingmates = function(wingmates) {
    var dyingMate, newMate, quickbuild, ___iced_passed_deferral, __iced_deferrals, __iced_k, _ref;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    if (((_ref = this.wingmates) != null ? _ref.length : void 0) === wingmates) {
      return;
    }
    if ((this.wingmates == null) || this.wingmates.length === 0) {
      this.wingmates = [];
    }
    quickbuild = exportObj.quickbuildsById[this.quickbuildId];
    while (this.wingmates.length < wingmates) {
      newMate = this.builder.ships.slice(-1)[0];
      if (newMate.data !== null) {
        newMate = this.builder.addShip();
      } else {
        this.builder.addShip();
      }
      newMate.linkedShip = this;
      this.wingmates.push(newMate);
      newMate.setPilotById(quickbuild.wingmateId);
      newMate.primary = false;
      this.primary = true;
    }
    (function(_this) {
      return (function(__iced_k) {
        var _while;
        _while = function(__iced_k) {
          var _break, _continue, _next;
          _break = __iced_k;
          _continue = function() {
            return iced.trampoline(function() {
              return _while(__iced_k);
            });
          };
          _next = _continue;
          if (!(_this.wingmates.length > wingmates)) {
            return _break();
          } else {
            dyingMate = _this.wingmates.pop();
            dyingMate.linkedShip = null;
            (function(__iced_k) {
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral,
                funcname: "Ship.setWingmates"
              });
              _this.builder.removeShip(dyingMate, __iced_deferrals.defer({
                lineno: 5867
              }));
              __iced_deferrals._fulfill();
            })(_next);
          }
        };
        _while(__iced_k);
      });
    })(this)((function(_this) {
      return function() {
        return _this.wingmate_selector.val(wingmates);
      };
    })(this));
  };

  Ship.prototype.removeFromWing = function(ship) {
    var quickbuild, _ref;
    this.wingmates.removeItem(ship);
    quickbuild = exportObj.quickbuildsById[this.quickbuildId];
    if (!(_ref = this.wingmates.length, __indexOf.call(quickbuild.wingmates, _ref) >= 0)) {
      this.destroy($.noop);
    }
    return this.wingmate_selector.val(this.wingmates.length);
  };

  Ship.prototype.joinWing = function(ship) {
    var quickbuild, _ref;
    this.wingmates.push(ship);
    quickbuild = exportObj.quickbuildsById[this.quickbuildId];
    if (!(_ref = this.wingmates.length, __indexOf.call(quickbuild.wingmates, _ref) >= 0)) {
      ship.destroy($.noop);
      this.removeFromWing(ship);
    }
    return this.wingmate_selector.val(this.wingmates.length);
  };

  Ship.prototype.updateSelections = function() {
    var points, upgrade, _i, _len, _ref, _ref1, _results;
    if (this.pilot != null) {
      this.ship_selector.select2('data', {
        id: this.pilot.ship,
        text: exportObj.ships[this.pilot.ship].display_name ? exportObj.ships[this.pilot.ship].display_name : this.pilot.ship,
        xws: exportObj.ships[this.pilot.ship].xws,
        icon: exportObj.ships[this.pilot.ship].icon ? exportObj.ships[this.pilot.ship].icon : exportObj.ships[this.pilot.ship].xws
      });
      this.pilot_selector.select2('data', {
        id: this.pilot.id,
        text: "" + ((((_ref = exportObj.settings) != null ? _ref.initiative_prefix : void 0) != null) && exportObj.settings.initiative_prefix ? this.pilot.skill + ' - ' : '') + (this.pilot.display_name ? this.pilot.display_name : this.pilot.name) + (this.quickbuildId !== -1 ? exportObj.quickbuildsById[this.quickbuildId].suffix : "") + " (" + (this.quickbuildId !== -1 ? (this.primary ? exportObj.quickbuildsById[this.quickbuildId].threat : 0) : this.pilot.points) + ")"
      });
      this.pilot_selector.data('select2').container.show();
      _ref1 = this.upgrades;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        upgrade = _ref1[_i];
        points = upgrade.getPoints();
        _results.push(upgrade.updateSelection(points));
      }
      return _results;
    } else {
      return this.pilot_selector.select2('data', null);
    }
  };

  Ship.prototype.checkPilotSelectorQueryModal = function() {
    if ($(window).width() >= 768) {
      return this.pilot_query_modal.hide();
    } else {
      if (this.pilot) {
        return this.pilot_query_modal.show();
      }
    }
  };

  Ship.prototype.setupUI = function() {
    var shipResultFormatter, shipSelectionFormatter, shipicon;
    this.row = $(document.createElement('DIV'));
    this.row.addClass('row ship mb-5 mb-sm-0 unsortable');
    this.row.insertBefore(this.builder.notes_container);
    if (this.pilot != null) {
      shipicon = exportObj.ships[this.pilot.ship].icon ? exportObj.ships[this.pilot.ship].icon : exportObj.ships[this.pilot.ship].xws;
    }
    this.row.append($.trim("<div class=\"col-md-3\">\n    <div class=\"form-group d-flex\">\n        <input class=\"ship-selector-container\" type=\"hidden\"></input>\n        <div class=\"input-group-append\">\n            <button class=\"btn btn-secondary d-block d-md-none ship-query-modal\"><i class=\"fas fa-question\"></i></button>\n        </div>\n    <br />\n    </div>\n    <div class=\"form-group d-flex\">\n        <input type=\"hidden\" class=\"pilot-selector-container\"></input>\n        <div class=\"input-group-append\">\n            <button class=\"btn btn-secondary pilot-query-modal\"><i class=\"fas fa-question\"></i></button>\n        <br />\n        </div>\n    </div>\n    <label class=\"wingmate-label\">\n    " + (this.uitranslation("Wingmates")) + ": \n        <input type=\"number\" class=\"wingmate-selector\"></input>\n    </label>\n</div>\n<div class=\"col-md-1 points-display-container\">\n     <span></span>\n</div>\n<div class=\"col-md-6 addon-container\">  </div>\n<div class=\"col-md-2 button-container\">\n    <button class=\"btn btn-danger remove-pilot side-button\"><span class=\"d-none d-sm-block\" data-toggle=\"tooltip\" title=\"" + (this.uitranslation("Remove Pilot")) + "\"><i class=\"fa fa-times\"></i></span><span class=\"d-block d-sm-none\"> " + (this.uitranslation("Remove Pilot")) + "</span></button>\n    <button class=\"btn btn-light copy-pilot side-button\"><span class=\"d-none d-sm-block\" data-toggle=\"tooltip\" title=\"" + (this.uitranslation("Clone Pilot")) + "\"><i class=\"far fa-copy\"></i></span><span class=\"d-block d-sm-none\"> " + (this.uitranslation("Clone Pilot")) + "</span></button>&nbsp;&nbsp;&nbsp;\n    <button class=\"btn btn-light points-destroyed side-button\" points-state\"><span class=\"destroyed-type\" title=\"" + (this.uitranslation("Points Destroyed")) + "\"><i class=\"xwing-miniatures-font xwing-miniatures-font-title\"></i></span></button>\n</div>"));
    this.row.find('.button-container span').tooltip();
    this.ship_selector = $(this.row.find('input.ship-selector-container'));
    this.pilot_selector = $(this.row.find('input.pilot-selector-container'));
    this.wingmate_selector = $(this.row.find('input.wingmate-selector'));
    this.ship_query_modal = $(this.row.find('button.ship-query-modal'));
    this.pilot_query_modal = $(this.row.find('button.pilot-query-modal'));
    this.ship_query_modal.click((function(_this) {
      return function(e) {
        if (_this.pilot) {
          _this.builder.showTooltip('Ship', exportObj.ships[_this.pilot.ship], null, _this.builder.mobile_tooltip_modal, true);
          return _this.builder.mobile_tooltip_modal.modal('show');
        }
      };
    })(this));
    this.pilot_query_modal.click((function(_this) {
      return function(e) {
        if (_this.pilot) {
          _this.builder.showTooltip('Pilot', _this.pilot, (_this.pilot ? _this : void 0), _this.builder.mobile_tooltip_modal, true);
          return _this.builder.mobile_tooltip_modal.modal('show');
        }
      };
    })(this));
    shipResultFormatter = function(object, container, query) {
      return "<i class=\"xwing-miniatures-ship xwing-miniatures-ship-" + object.icon + "\"></i> " + object.text;
    };
    shipSelectionFormatter = function(object, container) {
      return "<i class=\"xwing-miniatures-ship xwing-miniatures-ship-" + object.icon + "\"></i> " + object.text;
    };
    this.ship_selector.select2({
      width: '100%',
      placeholder: exportObj.translate('ui', 'shipSelectorPlaceholder'),
      query: (function(_this) {
        return function(query) {
          var data;
          data = {
            results: []
          };
          data.results = _this.builder.getAvailableShipsMatching(query.term);
          return query.callback(data);
        };
      })(this),
      minimumResultsForSearch: $.isMobile() ? -1 : 0,
      formatResultCssClass: (function(_this) {
        return function(obj) {
          var not_in_collection;
          if ((_this.builder.collection != null) && (_this.builder.collection.checks.collectioncheck === "true")) {
            not_in_collection = false;
            if ((_this.pilot != null) && obj.id === exportObj.ships[_this.pilot.ship].id) {
              if (!(_this.builder.collection.checkShelf('ship', obj.name) || _this.builder.collection.checkTable('pilot', obj.name))) {
                not_in_collection = true;
              }
            } else {
              not_in_collection = !_this.builder.collection.checkShelf('ship', obj.name);
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
    this.ship_selector.on('select2-focus', (function(_this) {
      return function(e) {
        if ($.isMobile()) {
          $('.select2-container .select2-focusser').remove();
          return $('.select2-search input').prop('focus', false).removeClass('select2-focused');
        }
      };
    })(this));
    this.ship_selector.on('change', (function(_this) {
      return function(e) {
        return _this.setShipType(_this.ship_selector.val());
      };
    })(this));
    this.ship_selector.data('select2').results.on('mousemove-filtered', (function(_this) {
      return function(e) {
        var select2_data;
        select2_data = $(e.target).closest('.select2-result').data('select2-data');
        if ((select2_data != null ? select2_data.id : void 0) != null) {
          return _this.builder.showTooltip('Ship', exportObj.ships[select2_data.id]);
        }
      };
    })(this));
    this.ship_selector.data('select2').container.on('mouseover', (function(_this) {
      return function(e) {
        if (_this.pilot) {
          return _this.builder.showTooltip('Ship', exportObj.ships[_this.pilot.ship]);
        }
      };
    })(this));
    this.pilot_selector.select2({
      width: '100%',
      placeholder: exportObj.translate('ui', 'pilotSelectorPlaceholder'),
      query: (function(_this) {
        return function(query) {
          var data;
          data = {
            results: []
          };
          data.results = _this.builder.getAvailablePilotsForShipIncluding(_this.ship_selector.val(), (!_this.builder.isQuickbuild ? _this.pilot : _this.quickbuildId), query.term, true, _this);
          return query.callback(data);
        };
      })(this),
      minimumResultsForSearch: $.isMobile() ? -1 : 0,
      formatResultCssClass: (function(_this) {
        return function(obj) {
          var name, not_in_collection, _ref, _ref1, _ref2;
          if ((_this.builder.collection != null) && (_this.builder.collection.checks.collectioncheck === "true")) {
            not_in_collection = false;
            name = "";
            if (_this.builder.isQuickbuild) {
              name = (_ref = (_ref1 = exportObj.quickbuildsById[obj.id]) != null ? _ref1.pilot : void 0) != null ? _ref : "unknown pilot";
            } else {
              name = obj.name;
            }
            if (obj.id === ((_ref2 = _this.pilot) != null ? _ref2.id : void 0)) {
              if (!(_this.builder.collection.checkShelf('pilot', name) || _this.builder.collection.checkTable('pilot', name))) {
                not_in_collection = true;
              }
            } else {
              not_in_collection = !_this.builder.collection.checkShelf('pilot', name);
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
    this.pilot_selector.on('select2-focus', (function(_this) {
      return function(e) {
        if ($.isMobile()) {
          $('.select2-container .select2-focusser').remove();
          return $('.select2-search input').prop('focus', false).removeClass('select2-focused');
        }
      };
    })(this));
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
        if (_this.builder.isQuickbuild) {
          if ((select2_data != null ? select2_data.id : void 0) != null) {
            return _this.builder.showTooltip('Quickbuild', exportObj.quickbuildsById[select2_data.id], {
              ship: (_ref = _this.data) != null ? _ref.name : void 0
            });
          }
        } else {
          if ((select2_data != null ? select2_data.id : void 0) != null) {
            return _this.builder.showTooltip('Pilot', exportObj.pilotsById[select2_data.id]);
          }
        }
      };
    })(this));
    this.pilot_selector.data('select2').container.on('mouseover', (function(_this) {
      return function(e) {
        if (_this.pilot) {
          return _this.builder.showTooltip('Pilot', _this.pilot, _this);
        }
      };
    })(this));
    this.pilot_selector.data('select2').container.hide();
    if (this.builder.isQuickbuild) {
      this.wingmate_selector.on('change', (function(_this) {
        return function(e) {
          _this.setWingmates(parseInt(_this.wingmate_selector.val()));
          _this.builder.current_squad.dirty = true;
          _this.builder.container.trigger('xwing-backend:squadDirtinessChanged');
          return _this.builder.backend_status.fadeOut('slow');
        };
      })(this));
      this.wingmate_selector.on('mousemove-filtered', (function(_this) {
        return function(e) {};
      })(this));
    }
    this.wingmate_selector.parent().hide();
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
        var ship, _i, _len, _ref, _results;
        _ref = _this.builder.ships;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          ship = _ref[_i];
          if (ship.row.hasClass("unsortable")) {
            ship.copyFrom(_this);
            break;
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };
    })(this));
    this.copy_button.hide();
    this.checkPilotSelectorQueryModal();
    this.points_destroyed_button_span = $(this.row.find('.destroyed-type'));
    this.points_destroyed_button = $(this.row.find('button.points-destroyed'));
    this.points_destroyed_button.click((function(_this) {
      return function(e) {
        if (_this.destroystate === 1) {
          _this.destroystate = 2;
          _this.points_destroyed_button_span.html('<i class="xwing-miniatures-font xwing-miniatures-font-crit"></i>');
        } else if (_this.destroystate === 2) {
          _this.destroystate = 0;
          _this.points_destroyed_button_span.html('<i class="xwing-miniatures-font xwing-miniatures-font-title"></i>');
        } else {
          _this.destroystate = 1;
          _this.points_destroyed_button_span.html('<i class="xwing-miniatures-font xwing-miniatures-font-hit"></i>');
        }
        return _this.builder.onPointsUpdated();
      };
    })(this));
    return this.points_destroyed_button.hide();
  };

  Ship.prototype.teardownUI = function() {
    this.row.text('');
    return this.row.remove();
  };

  Ship.prototype.toString = function() {
    if (this.pilot != null) {
      return this.uitranslation("PilotFlyingShip", (this.pilot.display_name ? this.pilot.display_name : this.pilot.name), (this.data.display_name ? this.data.display_name : this.data.name));
    } else {
      if (this.data.display_name) {
        return this.data.display_name;
      } else {
        return this.data.name;
      }
    }
  };

  Ship.prototype.toHTML = function() {
    var HalfPoints, Threshold, action_bar, attackHTML, attack_icon, attackbHTML, attackbullHTML, attackdtHTML, attackfHTML, attacklHTML, attackrHTML, attacktHTML, chargeHTML, count, effective_stats, energyHTML, engagementHTML, forceHTML, html, hullIconHTML, points, recurringicon, shieldIconHTML, shieldRECUR, slotted_upgrades, upgrade, _, _i, _j, _k, _len, _ref, _ref1, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref16, _ref17, _ref18, _ref19, _ref2, _ref20, _ref21, _ref22, _ref23, _ref24, _ref25, _ref26, _ref27, _ref28, _ref29, _ref3, _ref30, _ref31, _ref32, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
    effective_stats = this.effectiveStats();
    action_bar = this.builder.formatActions(effective_stats.actions, "&nbsp;&nbsp;", (_ref = this.pilot.keyword) != null ? _ref : []);
    attack_icon = (_ref1 = this.data.attack_icon) != null ? _ref1 : 'xwing-miniatures-font-frontarc';
    engagementHTML = (this.pilot.engagement != null) ? $.trim("<span class=\"info-data info-skill\">ENG " + this.pilot.engagement + "</span>") : '';
    attackHTML = (effective_stats.attack != null) ? $.trim("<i class=\"xwing-miniatures-font header-attack " + attack_icon + "\"></i>\n<span class=\"info-data info-attack\">" + (statAndEffectiveStat((_ref2 = (_ref3 = this.pilot.ship_override) != null ? _ref3.attack : void 0) != null ? _ref2 : this.data.attack, effective_stats, 'attack')) + "</span>") : '';
    if (effective_stats.attackbull != null) {
      attackbullHTML = $.trim("<i class=\"xwing-miniatures-font header-attack xwing-miniatures-font-bullseyearc\"></i>\n<span class=\"info-data info-attack\">" + (statAndEffectiveStat((_ref4 = (_ref5 = this.pilot.ship_override) != null ? _ref5.attackbull : void 0) != null ? _ref4 : this.data.attackbull, effective_stats, 'attackbull')) + "</span>");
    } else {
      attackbullHTML = '';
    }
    if (effective_stats.attackb != null) {
      attackbHTML = $.trim("<i class=\"xwing-miniatures-font header-attack xwing-miniatures-font-reararc\"></i>\n<span class=\"info-data info-attack\">" + (statAndEffectiveStat((_ref6 = (_ref7 = this.pilot.ship_override) != null ? _ref7.attackb : void 0) != null ? _ref6 : this.data.attackb, effective_stats, 'attackb')) + "</span>");
    } else {
      attackbHTML = '';
    }
    if (effective_stats.attackf != null) {
      attackfHTML = $.trim("<i class=\"xwing-miniatures-font header-attack xwing-miniatures-font-fullfrontarc\"></i>\n<span class=\"info-data info-attack\">" + (statAndEffectiveStat((_ref8 = (_ref9 = this.pilot.ship_override) != null ? _ref9.attackf : void 0) != null ? _ref8 : this.data.attackf, effective_stats, 'attackf')) + "</span>");
    } else {
      attackfHTML = '';
    }
    if (effective_stats.attackt != null) {
      attacktHTML = $.trim("<i class=\"xwing-miniatures-font header-attack xwing-miniatures-font-singleturretarc\"></i>\n<span class=\"info-data info-attack\">" + (statAndEffectiveStat((_ref10 = (_ref11 = this.pilot.ship_override) != null ? _ref11.attackt : void 0) != null ? _ref10 : this.data.attackt, effective_stats, 'attackt')) + "</span>");
    } else {
      attacktHTML = '';
    }
    if (effective_stats.attackl != null) {
      attacklHTML = $.trim("<i class=\"xwing-miniatures-font header-attack xwing-miniatures-font-leftarc\"></i>\n<span class=\"info-data info-attack\">" + (statAndEffectiveStat((_ref12 = (_ref13 = this.pilot.ship_override) != null ? _ref13.attackl : void 0) != null ? _ref12 : this.data.attackl, effective_stats, 'attackl')) + "</span>");
    } else {
      attacklHTML = '';
    }
    if (effective_stats.attackr != null) {
      attackrHTML = $.trim("<i class=\"xwing-miniatures-font header-attack xwing-miniatures-font-rightarc\"></i>\n<span class=\"info-data info-attack\">" + (statAndEffectiveStat((_ref14 = (_ref15 = this.pilot.ship_override) != null ? _ref15.attackr : void 0) != null ? _ref14 : this.data.attackr, effective_stats, 'attackr')) + "</span>");
    } else {
      attackrHTML = '';
    }
    if (effective_stats.attackdt != null) {
      attackdtHTML = $.trim("<i class=\"xwing-miniatures-font header-attack xwing-miniatures-font-doubleturretarc\"></i>\n<span class=\"info-data info-attack\">" + (statAndEffectiveStat((_ref16 = (_ref17 = this.pilot.ship_override) != null ? _ref17.attackdt : void 0) != null ? _ref16 : this.data.attackdt, effective_stats, 'attackdt')) + "</span>");
    } else {
      attackdtHTML = '';
    }
    recurringicon = '';
    if (this.data.energyrecurr != null) {
      count = 0;
      while (count < this.data.energyrecurr) {
        recurringicon += '<sup><i class="fas fa-caret-up"></i></sup>';
        ++count;
      }
    }
    energyHTML = (((_ref18 = this.pilot.ship_override) != null ? _ref18.energy : void 0) != null) || (this.data.energy != null) ? $.trim("<i class=\"xwing-miniatures-font header-energy xwing-miniatures-font-energy\"></i>\n<span class=\"info-data info-energy\">" + (statAndEffectiveStat((_ref19 = (_ref20 = this.pilot.ship_override) != null ? _ref20.energy : void 0) != null ? _ref19 : this.data.energy, effective_stats, 'energy')) + recurringicon + "</span>") : '';
    forceHTML = (this.pilot.force != null) ? $.trim("<i class=\"xwing-miniatures-font header-force xwing-miniatures-font-forcecharge\"></i>\n<span class=\"info-data info-force\">" + (statAndEffectiveStat((_ref21 = (_ref22 = this.pilot.ship_override) != null ? _ref22.force : void 0) != null ? _ref21 : this.pilot.force, effective_stats, 'force')) + "<sup><i class=\"fas fa-caret-up\"></i></sup></span>") : '';
    if (this.pilot.charge != null) {
      recurringicon = '';
      if (this.pilot.recurring != null) {
        if (this.pilot.recurring > 0) {
          count = 0;
          while (count < this.pilot.recurring) {
            recurringicon += '<sup><i class="fas fa-caret-up"></i></sup>';
            ++count;
          }
        } else {
          count = this.pilot.recurring;
          while (count < 0) {
            recurringicon += '<sub><i class="fas fa-caret-down"></i></sub>';
            ++count;
          }
        }
      }
      chargeHTML = $.trim("<i class=\"xwing-miniatures-font header-charge xwing-miniatures-font-charge\"></i><span class=\"info-data info-charge\">" + (statAndEffectiveStat((_ref23 = (_ref24 = this.pilot.ship_override) != null ? _ref24.charge : void 0) != null ? _ref23 : this.pilot.charge, effective_stats, 'charge')) + recurringicon + "</span>");
    } else {
      chargeHTML = '';
    }
    shieldRECUR = '';
    if (this.data.shieldrecurr != null) {
      count = 0;
      while (count < this.data.shieldrecurr) {
        shieldRECUR += "<sup><i class=\"fas fa-caret-up\"></i></sup>";
        ++count;
      }
    }
    shieldIconHTML = '';
    if (effective_stats.shields) {
      for (_ = _i = _ref25 = effective_stats.shields; _i >= 2; _ = _i += -1) {
        shieldIconHTML += "<i class=\"xwing-miniatures-font header-shield xwing-miniatures-font-shield expanded-hull-or-shield\"></i>";
      }
      shieldIconHTML += "<i class=\"xwing-miniatures-font header-shield xwing-miniatures-font-shield\"></i>";
    }
    hullIconHTML = '';
    if (effective_stats.hull) {
      for (_ = _j = _ref26 = effective_stats.hull; _j >= 2; _ = _j += -1) {
        hullIconHTML += "<i class=\"xwing-miniatures-font header-hull xwing-miniatures-font-hull expanded-hull-or-shield\"></i>";
      }
      hullIconHTML += "<i class=\"xwing-miniatures-font header-hull xwing-miniatures-font-hull\"></i>";
    }
    html = $.trim("<div class=\"fancy-pilot-header\">\n    <div class=\"pilot-header-text\">" + (this.pilot.display_name ? this.pilot.display_name : this.pilot.name) + " <i class=\"xwing-miniatures-ship xwing-miniatures-ship-" + this.data.xws + "\"></i><span class=\"fancy-ship-type\"> " + (this.data.display_name ? this.data.display_name : this.data.name) + "</span></div>\n    <div class=\"mask\">\n        <div class=\"outer-circle\">\n            <div class=\"inner-circle pilot-points\">" + (this.quickbuildId !== -1 ? (this.primary ? this.getPoints() : '*') : this.pilot.points) + "</div>\n        </div>\n    </div>\n</div>\n<div class=\"fancy-pilot-stats\">\n    <div class=\"pilot-stats-content\">\n        <span class=\"info-data info-skill\">INI " + (statAndEffectiveStat(this.pilot.skill, effective_stats, 'skill')) + "</span>\n        " + engagementHTML + "\n        " + attackbullHTML + "\n        " + attackHTML + "\n        " + attackbHTML + "\n        " + attackfHTML + "\n        " + attacktHTML + "\n        " + attacklHTML + "\n        " + attackrHTML + "\n        " + attackdtHTML + "\n        <i class=\"xwing-miniatures-font header-agility xwing-miniatures-font-agility\"></i>\n        <span class=\"info-data info-agility\">" + (statAndEffectiveStat((_ref27 = (_ref28 = this.pilot.ship_override) != null ? _ref28.agility : void 0) != null ? _ref27 : this.data.agility, effective_stats, 'agility')) + "</span>                    \n        " + hullIconHTML + "\n        <span class=\"info-data info-hull\">" + (statAndEffectiveStat((_ref29 = (_ref30 = this.pilot.ship_override) != null ? _ref30.hull : void 0) != null ? _ref29 : this.data.hull, effective_stats, 'hull')) + "</span>\n        " + shieldIconHTML + "\n        <span class=\"info-data info-shields\">" + (statAndEffectiveStat((_ref31 = (_ref32 = this.pilot.ship_override) != null ? _ref32.shields : void 0) != null ? _ref31 : this.data.shields, effective_stats, 'shields')) + shieldRECUR + "</span>\n        " + energyHTML + "\n        " + forceHTML + "\n        " + chargeHTML + "\n        <br />\n        " + action_bar + "\n    </div>\n</div>");
    if (this.pilot.text) {
      html += $.trim("<div class=\"fancy-pilot-text\">" + this.pilot.text + "</div>");
    }
    slotted_upgrades = (function() {
      var _k, _len, _ref33, _results;
      _ref33 = this.upgrades;
      _results = [];
      for (_k = 0, _len = _ref33.length; _k < _len; _k++) {
        upgrade = _ref33[_k];
        if (upgrade.data != null) {
          _results.push(upgrade);
        }
      }
      return _results;
    }).call(this);
    if (slotted_upgrades.length > 0) {
      html += $.trim("<div class=\"fancy-upgrade-container\">");
      for (_k = 0, _len = slotted_upgrades.length; _k < _len; _k++) {
        upgrade = slotted_upgrades[_k];
        points = upgrade.getPoints();
        html += upgrade.toHTML(points);
      }
      html += $.trim("</div>");
    }
    HalfPoints = Math.ceil(this.getPoints() / 2);
    Threshold = Math.ceil((effective_stats['hull'] + effective_stats['shields']) / 2);
    html += $.trim("<div class=\"ship-points-total\">\n    <strong>" + (this.uitranslation("Ship Total")) + ": " + (this.getPoints()) + ", " + (this.uitranslation("Half Points")) + ": " + HalfPoints + ", " + (this.uitranslation("Threshold")) + ": " + Threshold + "</strong> \n</div>");
    return "<div class=\"fancy-ship\">" + html + "</div>";
  };

  Ship.prototype.toTableRow = function() {
    var halfPoints, points, slotted_upgrades, table_html, threshold, upgrade, _i, _len;
    table_html = $.trim("<tr class=\"simple-pilot\">\n    <td class=\"name\">" + (this.pilot.display_name ? this.pilot.display_name : this.pilot.name) + " &mdash; " + (this.data.display_name ? this.data.display_name : this.data.name) + "</td>\n    <td class=\"points\">" + (this.quickbuildId !== -1 ? (this.primary ? exportObj.quickbuildsById[this.quickbuildId].threat : 0) : this.pilot.points) + "</td>\n</tr>");
    slotted_upgrades = (function() {
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
    }).call(this);
    if (slotted_upgrades.length > 0) {
      for (_i = 0, _len = slotted_upgrades.length; _i < _len; _i++) {
        upgrade = slotted_upgrades[_i];
        points = upgrade.getPoints();
        table_html += upgrade.toTableRow(points);
      }
    }
    table_html += "<tr class=\"simple-ship-total\"><td colspan=\"2\">" + (this.uitranslation("Ship Total")) + ": " + (this.getPoints()) + "</td></tr>";
    halfPoints = Math.ceil(this.getPoints() / 2);
    threshold = Math.ceil((this.effectiveStats()['hull'] + this.effectiveStats()['shields']) / 2);
    table_html += "<tr class=\"simple-ship-half-points\"><td colspan=\"2\">" + (this.uitranslation("Half Points")) + ": " + halfPoints + " " + (this.uitranslation("Threshold")) + ": " + threshold + "</td></tr>";
    table_html += '<tr><td>&nbsp;</td><td></td></tr>';
    return table_html;
  };

  Ship.prototype.toSimpleCopy = function() {
    var halfPoints, points, simplecopy, simplecopy_upgrades, slotted_upgrades, threshold, upgrade, upgrade_simplecopy, _i, _len;
    simplecopy = "" + this.pilot.name + " (" + (this.quickbuildId !== -1 ? (this.primary ? exportObj.quickbuildsById[this.quickbuildId].threat : 0) : this.pilot.points) + ")    \n";
    slotted_upgrades = (function() {
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
    }).call(this);
    if (slotted_upgrades.length > 0) {
      simplecopy += "    ";
      simplecopy_upgrades = [];
      for (_i = 0, _len = slotted_upgrades.length; _i < _len; _i++) {
        upgrade = slotted_upgrades[_i];
        points = upgrade.getPoints();
        upgrade_simplecopy = upgrade.toSimpleCopy(points);
        if (upgrade_simplecopy != null) {
          simplecopy_upgrades.push(upgrade_simplecopy);
        }
      }
      simplecopy += simplecopy_upgrades.join("    ");
      simplecopy += "    \n";
    }
    halfPoints = Math.ceil(this.getPoints() / 2);
    threshold = Math.ceil((this.effectiveStats()['hull'] + this.effectiveStats()['shields']) / 2);
    simplecopy += "" + (this.uitranslation("Ship total")) + ": " + (this.getPoints()) + "  " + (this.uitranslation("Half Points")) + ": " + halfPoints + "  " + (this.uitranslation("Threshold")) + ": " + threshold + "    \n    \n";
    return simplecopy;
  };

  Ship.prototype.toRedditText = function() {
    var points, reddit, reddit_upgrades, slotted_upgrades, upgrade, upgrade_reddit, _i, _len;
    reddit = "**" + this.pilot.name + " (" + (this.quickbuildId !== -1 ? (this.primary ? exportObj.quickbuildsById[this.quickbuildId].threat : 0) : this.pilot.points) + ")**    \n";
    slotted_upgrades = (function() {
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
    }).call(this);
    if (slotted_upgrades.length > 0) {
      reddit += "    ";
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
      reddit += "&nbsp;*" + (this.uitranslation("Ship total")) + ": (" + (this.getPoints()) + ")*    \n";
    }
    return reddit;
  };

  Ship.prototype.toTTSText = function() {
    var slotted_upgrades, tts, upgrade, upgrade_tts, _i, _len;
    tts = "" + (exportObj.toTTS(this.pilot.name));
    slotted_upgrades = (function() {
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
    }).call(this);
    if (slotted_upgrades.length > 0) {
      for (_i = 0, _len = slotted_upgrades.length; _i < _len; _i++) {
        upgrade = slotted_upgrades[_i];
        upgrade_tts = upgrade.toTTSText();
        if (upgrade_tts != null) {
          tts += " + " + upgrade_tts;
        }
      }
    }
    return tts += " / ";
  };

  Ship.prototype.toBBCode = function() {
    var bbcode, bbcode_upgrades, points, slotted_upgrades, upgrade, upgrade_bbcode, _i, _len;
    bbcode = "[b]" + (this.pilot.display_name ? this.pilot.display_name : this.pilot.name) + " (" + (this.quickbuildId !== -1 ? (this.primary ? exportObj.quickbuildsById[this.quickbuildId].threat : 0) : this.pilot.points) + ")[/b]";
    slotted_upgrades = (function() {
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
    }).call(this);
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
    var html, points, slotted_upgrades, upgrade, upgrade_html, _i, _len;
    html = "<b>" + (this.pilot.display_name ? this.pilot.display_name : this.pilot.name) + " (" + (this.quickbuildId !== -1 ? (this.primary ? exportObj.quickbuildsById[this.quickbuildId].threat : 0) : this.pilot.points) + ")</b><br />";
    slotted_upgrades = (function() {
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
    }).call(this);
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
    var i, upgrade, upgrades;
    if (this.builder.isQuickbuild) {
      if ((this.wingmates == null) || this.wingmates.length === 0) {
        return "" + this.quickbuildId + "X";
      } else {
        return "" + this.quickbuildId + "X" + this.wingmates.length;
      }
    } else {
      upgrades = ("" + ((function() {
        var _i, _len, _ref, _ref1, _ref2, _results;
        _ref = this.upgrades;
        _results = [];
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          upgrade = _ref[i];
          _results.push((_ref1 = upgrade != null ? (_ref2 = upgrade.data) != null ? _ref2.id : void 0 : void 0) != null ? _ref1 : "");
        }
        return _results;
      }).call(this))).replace(/,/g, "W");
      return [this.pilot.id, upgrades].join('X');
    }
  };

  Ship.prototype.fromSerialized = function(version, serialized) {
    var addon_cls, addon_id, addon_type_serialized, conferred_addon, conferredaddon_pair, conferredaddon_pairs, deferred_id, deferred_id_added, deferred_ids, everythingadded, i, pilot_id, pilot_splitter, upgrade, upgrade_conferred_addon_pairs, upgrade_id, upgrade_ids, upgrade_selection, upgrade_splitter, version_4_compatibility_placeholder_mod, version_4_compatibility_placeholder_title, _, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _m, _n, _o, _p, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
    everythingadded = true;
    switch (version) {
      case 4:
      case 5:
      case 6:
        if ((serialized.split(':')).length === 3) {
          _ref = serialized.split(':'), pilot_id = _ref[0], upgrade_ids = _ref[1], conferredaddon_pairs = _ref[2];
        } else {
          _ref1 = serialized.split(':'), pilot_id = _ref1[0], upgrade_ids = _ref1[1], version_4_compatibility_placeholder_title = _ref1[2], version_4_compatibility_placeholder_mod = _ref1[3], conferredaddon_pairs = _ref1[4];
        }
        this.setPilotById(parseInt(pilot_id), true);
        if (!this.validate) {
          return false;
        }
        deferred_ids = [];
        _ref2 = upgrade_ids.split(',');
        for (i = _i = 0, _len = _ref2.length; _i < _len; i = ++_i) {
          upgrade_id = _ref2[i];
          upgrade_id = parseInt(upgrade_id);
          if (upgrade_id < 0 || isNaN(upgrade_id)) {
            continue;
          }
          if (this.upgrades[i].isOccupied() || (((_ref3 = this.upgrades[i].dataById[upgrade_id]) != null ? _ref3.also_occupies_upgrades : void 0) != null)) {
            deferred_ids.push(upgrade_id);
          } else {
            this.upgrades[i].setById(upgrade_id);
            everythingadded &= this.upgrades[i].lastSetValid;
          }
        }
        for (_j = 0, _len1 = deferred_ids.length; _j < _len1; _j++) {
          deferred_id = deferred_ids[_j];
          deferred_id_added = false;
          _ref4 = this.upgrades;
          for (i = _k = 0, _len2 = _ref4.length; _k < _len2; i = ++_k) {
            upgrade = _ref4[i];
            if (upgrade.isOccupied() || upgrade.slot !== exportObj.upgradesById[deferred_id].slot) {
              continue;
            }
            upgrade.setById(deferred_id);
            deferred_id_added = upgrade.lastSetValid;
            break;
          }
          everythingadded &= deferred_id_added;
        }
        if (conferredaddon_pairs != null) {
          conferredaddon_pairs = conferredaddon_pairs.split(',');
        } else {
          conferredaddon_pairs = [];
        }
        _ref5 = this.upgrades;
        for (_l = 0, _len3 = _ref5.length; _l < _len3; _l++) {
          upgrade = _ref5[_l];
          if (((upgrade != null ? upgrade.data : void 0) != null) && upgrade.conferredAddons.length > 0) {
            upgrade_conferred_addon_pairs = conferredaddon_pairs.splice(0, upgrade.conferredAddons.length);
            for (i = _m = 0, _len4 = upgrade_conferred_addon_pairs.length; _m < _len4; i = ++_m) {
              conferredaddon_pair = upgrade_conferred_addon_pairs[i];
              _ref6 = conferredaddon_pair.split('.'), addon_type_serialized = _ref6[0], addon_id = _ref6[1];
              addon_id = parseInt(addon_id);
              addon_cls = SERIALIZATION_CODE_TO_CLASS[addon_type_serialized];
              if (!addon_cls) {
                console.log("Something went wrong... could not serialize properly");
                continue;
              }
              conferred_addon = upgrade.conferredAddons[i];
              if (conferred_addon instanceof addon_cls) {
                conferred_addon.setById(addon_id);
                everythingadded &= conferred_addon.lastSetValid;
              } else {
                throw new Error("Expected addon class " + addon_cls.constructor.name + " for conferred addon at index " + i + " but " + conferred_addon.constructor.name + " is there");
              }
            }
          }
        }
        break;
      case 7:
      case 8:
        pilot_splitter = version > 7 ? 'X' : ':';
        upgrade_splitter = version > 7 ? 'W' : ',';
        _ref7 = serialized.split(pilot_splitter), pilot_id = _ref7[0], upgrade_ids = _ref7[1], conferredaddon_pairs = _ref7[2];
        upgrade_ids = upgrade_ids.split(upgrade_splitter);
        this.setPilotById(parseInt(pilot_id), true);
        if (!this.validate) {
          return false;
        }
        if (!this.builder.isQuickbuild) {
          for (_ = _n = 1; _n < 3; _ = ++_n) {
            for (i = _o = _ref8 = upgrade_ids.length - 1; _ref8 <= -1 ? _o < -1 : _o > -1; i = _ref8 <= -1 ? ++_o : --_o) {
              upgrade_id = upgrade_ids[i];
              upgrade = exportObj.upgradesById[upgrade_id];
              if (upgrade == null) {
                upgrade_ids.splice(i, 1);
                if (upgrade_id !== "") {
                  console.log("Unknown upgrade id " + upgrade_id + " could not be added. Please report that error");
                  everythingadded = false;
                }
                continue;
              }
              _ref9 = this.upgrades;
              for (_p = 0, _len5 = _ref9.length; _p < _len5; _p++) {
                upgrade_selection = _ref9[_p];
                if (exportObj.slotsMatching(upgrade.slot, upgrade_selection.slot) && !upgrade_selection.isOccupied()) {
                  upgrade_selection.setById(upgrade_id);
                  if (upgrade_selection.lastSetValid) {
                    upgrade_ids.splice(i, 1);
                  }
                  break;
                }
              }
            }
          }
        } else {
          if (upgrade_ids.length > 0 && this.wingmates.length > 0) {
            this.setWingmates(upgrade_ids[0]);
          }
        }
        everythingadded &= upgrade_ids.length === 0;
    }
    this.updateSelections();
    return everythingadded;
  };

  Ship.prototype.effectiveStats = function() {
    var new_stats, s, statentry, stats, upgrade, _i, _j, _k, _len, _len1, _ref, _ref1, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref16, _ref17, _ref18, _ref19, _ref2, _ref20, _ref21, _ref22, _ref23, _ref24, _ref25, _ref26, _ref27, _ref28, _ref29, _ref3, _ref30, _ref31, _ref32, _ref33, _ref34, _ref35, _ref36, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
    stats = {
      attack: (_ref = (_ref1 = this.pilot.ship_override) != null ? _ref1.attack : void 0) != null ? _ref : this.data.attack,
      attackf: (_ref2 = (_ref3 = this.pilot.ship_override) != null ? _ref3.attackf : void 0) != null ? _ref2 : this.data.attackf,
      attackbull: (_ref4 = (_ref5 = this.pilot.ship_override) != null ? _ref5.attackbull : void 0) != null ? _ref4 : this.data.attackbull,
      attackb: (_ref6 = (_ref7 = this.pilot.ship_override) != null ? _ref7.attackb : void 0) != null ? _ref6 : this.data.attackb,
      attackt: (_ref8 = (_ref9 = this.pilot.ship_override) != null ? _ref9.attackt : void 0) != null ? _ref8 : this.data.attackt,
      attackl: (_ref10 = (_ref11 = this.pilot.ship_override) != null ? _ref11.attackl : void 0) != null ? _ref10 : this.data.attackl,
      attackr: (_ref12 = (_ref13 = this.pilot.ship_override) != null ? _ref13.attackr : void 0) != null ? _ref12 : this.data.attackr,
      attackdt: (_ref14 = (_ref15 = this.pilot.ship_override) != null ? _ref15.attackdt : void 0) != null ? _ref14 : this.data.attackdt,
      energy: (_ref16 = (_ref17 = this.pilot.ship_override) != null ? _ref17.energy : void 0) != null ? _ref16 : this.data.energy,
      agility: (_ref18 = (_ref19 = this.pilot.ship_override) != null ? _ref19.agility : void 0) != null ? _ref18 : this.data.agility,
      hull: (_ref20 = (_ref21 = this.pilot.ship_override) != null ? _ref21.hull : void 0) != null ? _ref20 : this.data.hull,
      shields: (_ref22 = (_ref23 = this.pilot.ship_override) != null ? _ref23.shields : void 0) != null ? _ref22 : this.data.shields,
      force: (_ref24 = (_ref25 = (_ref26 = this.pilot.ship_override) != null ? _ref26.force : void 0) != null ? _ref25 : this.pilot.force) != null ? _ref24 : 0,
      charge: (_ref27 = (_ref28 = this.pilot.ship_override) != null ? _ref28.charge : void 0) != null ? _ref27 : this.pilot.charge,
      actions: ((_ref29 = (_ref30 = this.pilot.ship_override) != null ? _ref30.actions : void 0) != null ? _ref29 : this.data.actions).slice(0)
    };
    stats.maneuvers = [];
    for (s = _i = 0, _ref31 = ((_ref32 = this.data.maneuvers) != null ? _ref32 : []).length; 0 <= _ref31 ? _i < _ref31 : _i > _ref31; s = 0 <= _ref31 ? ++_i : --_i) {
      stats.maneuvers[s] = this.data.maneuvers[s].slice(0);
    }
    if ((this.pilot.keyword != null) && (__indexOf.call(this.pilot.keyword, "Droid") >= 0) && (stats.actions != null)) {
      new_stats = [];
      _ref33 = stats.actions;
      for (_j = 0, _len = _ref33.length; _j < _len; _j++) {
        statentry = _ref33[_j];
        new_stats.push(statentry.replace("Focus", "Calculate"));
      }
      stats.actions = new_stats;
    }
    _ref34 = this.upgrades;
    for (_k = 0, _len1 = _ref34.length; _k < _len1; _k++) {
      upgrade = _ref34[_k];
      if ((upgrade != null ? (_ref35 = upgrade.data) != null ? _ref35.modifier_func : void 0 : void 0) != null) {
        upgrade.data.modifier_func(stats);
      }
    }
    if (((_ref36 = this.pilot) != null ? _ref36.modifier_func : void 0) != null) {
      this.pilot.modifier_func(stats);
    }
    return stats;
  };

  Ship.prototype.validate = function() {
    var addCommand, equipped_upgrades, func, func_result, i, max_checks, pilot_func, unchanged, upgrade, valid, _i, _j, _k, _l, _len, _len1, _ref, _ref1, _ref10, _ref11, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
    if (this.pilot == null) {
      return true;
    }
    unchanged = true;
    max_checks = 32;
    if (this.builder.isEpic) {
      if (!(__indexOf.call(this.pilot.slots, "Command") >= 0)) {
        addCommand = true;
        _ref = this.upgrades;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          upgrade = _ref[_i];
          if (("Command" === upgrade.slot) && (this === upgrade.ship)) {
            addCommand = false;
          }
        }
        if (addCommand === true) {
          this.upgrades.push(new exportObj.Upgrade({
            ship: this,
            container: this.addon_container,
            slot: "Command"
          }));
        }
      }
    } else if (!this.builder.isQuickbuild) {
      for (i = _j = _ref1 = this.upgrades.length - 1; _ref1 <= -1 ? _j < -1 : _j > -1; i = _ref1 <= -1 ? ++_j : --_j) {
        upgrade = this.upgrades[i];
        if (upgrade.slot === "Command") {
          upgrade.destroy($.noop);
          this.upgrades.splice(i, 1);
        }
      }
    }
    for (i = _k = 0; 0 <= max_checks ? _k < max_checks : _k > max_checks; i = 0 <= max_checks ? ++_k : --_k) {
      valid = true;
      pilot_func = (_ref2 = (_ref3 = (_ref4 = this.pilot) != null ? _ref4.validation_func : void 0) != null ? _ref3 : (_ref5 = this.pilot) != null ? _ref5.restriction_func : void 0) != null ? _ref2 : void 0;
      if (((pilot_func != null) && !pilot_func(this, this.pilot)) || !(this.builder.isItemAvailable(this.pilot, true))) {
        this.builder.removeShip(this);
        return false;
      }
      equipped_upgrades = [];
      _ref6 = this.upgrades;
      for (_l = 0, _len1 = _ref6.length; _l < _len1; _l++) {
        upgrade = _ref6[_l];
        func = (_ref7 = upgrade != null ? (_ref8 = upgrade.data) != null ? _ref8.validation_func : void 0 : void 0) != null ? _ref7 : void 0;
        if (func != null) {
          func_result = upgrade != null ? (_ref9 = upgrade.data) != null ? _ref9.validation_func(this, upgrade) : void 0 : void 0;
        } else if (upgrade != null ? (_ref10 = upgrade.data) != null ? _ref10.restrictions : void 0 : void 0) {
          func_result = this.restriction_check(upgrade.data.restrictions, upgrade);
        }
        if ((((func_result != null) && !func_result) || (((upgrade != null ? upgrade.data : void 0) != null) && ((_ref11 = upgrade.data, __indexOf.call(equipped_upgrades, _ref11) >= 0) || ((upgrade.data.faction != null) && !this.builder.isOurFaction(upgrade.data.faction, this.pilot.faction)) || !this.builder.isItemAvailable(upgrade.data)))) && !this.builder.isQuickbuild) {
          upgrade.setById(null);
          valid = false;
          unchanged = false;
          break;
        }
        if (((upgrade != null ? upgrade.data : void 0) != null) && upgrade.data) {
          equipped_upgrades.push(upgrade != null ? upgrade.data : void 0);
        }
      }
      if (valid) {
        break;
      }
    }
    this.updateSelections();
    return unchanged;
  };

  Ship.prototype.checkUnreleasedContent = function() {
    var upgrade, _i, _len, _ref;
    if ((this.pilot != null) && !exportObj.isReleased(this.pilot)) {
      return true;
    }
    _ref = this.upgrades;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      upgrade = _ref[_i];
      if (((upgrade != null ? upgrade.data : void 0) != null) && !exportObj.isReleased(upgrade.data)) {
        return true;
      }
    }
    return false;
  };

  Ship.prototype.hasAnotherUnoccupiedSlotLike = function(upgrade_obj, upgradeslot) {
    var upgrade, _i, _len, _ref;
    _ref = this.upgrades;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      upgrade = _ref[_i];
      if (upgrade === upgrade_obj || upgrade.slot !== upgradeslot) {
        continue;
      }
      if (!upgrade.isOccupied()) {
        return true;
      }
    }
    return false;
  };

  Ship.prototype.restriction_check = function(restrictions, upgrade_obj) {
    var effective_stats, r, _i, _len, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
    effective_stats = this.effectiveStats();
    for (_i = 0, _len = restrictions.length; _i < _len; _i++) {
      r = restrictions[_i];
      if (r[0] === "orUnique") {
        if (this.checkListForUnique(r[1].toLowerCase().replace(/[^0-9a-z]/gi, '').replace(/\s+/g, '-'))) {
          return true;
        }
      }
      switch (r[0]) {
        case "Base":
          switch (r[1]) {
            case "Small":
              if ((this.data.medium != null) || (this.data.large != null) || (this.data.huge != null)) {
                return false;
              }
              break;
            case "Small or Medium":
              if ((this.data.large != null) || (this.data.huge != null)) {
                return false;
              }
              break;
            case "Medium":
              if (!(this.data.medium != null)) {
                return false;
              }
              break;
            case "Medium or Large":
              if (!((this.data.medium != null) || (this.data.large != null))) {
                return false;
              }
              break;
            case "Large":
              if (!(this.data.large != null)) {
                return false;
              }
              break;
            case "Huge":
              if (!(this.data.huge != null)) {
                return false;
              }
              break;
            case "Standard":
              if (this.data.huge != null) {
                return false;
              }
          }
          break;
        case "Action":
          if (!((_ref = r[1], __indexOf.call(effective_stats.actions, _ref) >= 0) || (_ref1 = "*" + r[1], __indexOf.call(effective_stats.actions, _ref1) >= 0) || (_ref2 = "F-" + r[1], __indexOf.call(effective_stats.actions, _ref2) >= 0) || (_ref3 = "R-" + r[1], __indexOf.call(effective_stats.actions, _ref3) >= 0))) {
            return false;
          }
          break;
        case "Keyword":
          if (!(this.checkKeyword(r[1]))) {
            return false;
          }
          break;
        case "Equipped":
          if (!(this.doesSlotExist(r[1]) && !this.hasAnotherUnoccupiedSlotLike(upgrade_obj, r[1]))) {
            return false;
          }
          break;
        case "Slot":
          if (!this.hasAnotherUnoccupiedSlotLike(upgrade_obj, r[1])) {
            return false;
          }
          break;
        case "AttackArc":
          if (this.data.attackb == null) {
            return false;
          }
          break;
        case "ShieldsGreaterThan":
          if (!(this.data.shields > r[1])) {
            return false;
          }
          break;
        case "EnergyGreatterThan":
          if (!(effective_stats.energy > r[1])) {
            return false;
          }
          break;
        case "InitiativeGreaterThan":
          if (!(this.pilot.skill > r[1])) {
            return false;
          }
          break;
        case "InitiativeLessThan":
          if (!(this.pilot.skill < r[1])) {
            return false;
          }
          break;
        case "AgilityEquals":
          if (!(effective_stats.agility === r[1])) {
            return false;
          }
          break;
        case "isUnique":
          if (r[1] !== (this.pilot.unique != null)) {
            return false;
          }
          break;
        case "Format":
          switch (r[1]) {
            case "Epic":
              if (!(_ref4 = this.data.name, __indexOf.call(exportObj.epicExclusionsList, _ref4) >= 0)) {
                return false;
              }
              break;
            case "Standard":
              if (_ref5 = this.data.name, __indexOf.call(exportObj.epicExclusionsList, _ref5) >= 0) {
                return false;
              }
          }
          break;
        case "Faction":
          if (this.pilot.faction !== r[1]) {
            return false;
          }
      }
    }
    return true;
  };

  Ship.prototype.doesSlotExist = function(slot) {
    var upgrade, _i, _len, _ref;
    _ref = this.upgrades;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      upgrade = _ref[_i];
      if (slot === upgrade.slot) {
        return true;
      }
    }
    return false;
  };

  Ship.prototype.isSlotOccupied = function(slot_name) {
    var upgrade, _i, _len, _ref;
    _ref = this.upgrades;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      upgrade = _ref[_i];
      if (exportObj.slotsMatching(upgrade.slot, slot_name)) {
        if (!upgrade.isOccupied()) {
          return true;
        }
      }
    }
    return false;
  };

  Ship.prototype.checkKeyword = function(keyword) {
    var upgrade, word, words, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8;
    if ((_ref = this.data.name) != null ? _ref.includes(keyword) : void 0) {
      return true;
    }
    _ref2 = (_ref1 = this.data.keyword) != null ? _ref1 : [];
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      words = _ref2[_i];
      if (words === keyword) {
        return true;
      }
    }
    _ref4 = (_ref3 = this.pilot.keyword) != null ? _ref3 : [];
    for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
      words = _ref4[_j];
      if (words === keyword) {
        return true;
      }
    }
    _ref5 = this.upgrades;
    for (_k = 0, _len2 = _ref5.length; _k < _len2; _k++) {
      upgrade = _ref5[_k];
      _ref8 = (_ref6 = upgrade != null ? (_ref7 = upgrade.data) != null ? _ref7.keyword : void 0 : void 0) != null ? _ref6 : [];
      for (_l = 0, _len3 = _ref8.length; _l < _len3; _l++) {
        word = _ref8[_l];
        if (word === keyword) {
          return true;
        }
      }
    }
    return false;
  };

  Ship.prototype.checkListForUnique = function(name) {
    var t, thing, things, _ref;
    _ref = this.builder.uniques_in_use;
    for (t in _ref) {
      things = _ref[t];
      if (t !== 'Slot') {
        if (__indexOf.call((function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = things.length; _i < _len; _i++) {
            thing = things[_i];
            _results.push(thing.canonical_name.getXWSBaseName());
          }
          return _results;
        })(), name) >= 0) {
          return true;
        }
      }
    }
    return false;
  };

  Ship.prototype.toXWS = function() {
    var upgrade, upgrade_obj, xws, _i, _len, _ref, _ref1, _ref2;
    xws = {
      id: (_ref = this.pilot.xws) != null ? _ref : this.pilot.canonical_name,
      name: (_ref1 = this.pilot.xws) != null ? _ref1 : this.pilot.canonical_name,
      points: this.getPoints(),
      ship: this.data.xws.canonicalize()
    };
    if (this.data.multisection) {
      xws.multisection = this.data.multisection.slice(0);
    }
    upgrade_obj = {};
    _ref2 = this.upgrades;
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      upgrade = _ref2[_i];
      if ((upgrade != null ? upgrade.data : void 0) != null) {
        upgrade.toXWS(upgrade_obj);
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
    var args, cb, isLastShip, ship, ___iced_passed_deferral, __iced_deferrals, __iced_k;
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
                lineno: 6799
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
        var _i, _len, _ref, _ref1;
        if (((_ref = _this.data) != null ? _ref.standardized : void 0) != null) {
          isLastShip = true;
          _ref1 = _this.ship.builder.ships;
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            ship = _ref1[_i];
            if ((ship.data != null) && (_this.ship.data.name === ship.data.name) && (_this.ship !== ship)) {
              isLastShip = false;
            }
          }
          if (isLastShip === true) {
            _this.removeStandardized();
          }
        }
        _this.destroyed = true;
        _this.rescindAddons();
        _this.deoccupyOtherUpgrades();
        _this.selector.select2('destroy');
        _this.selectorwrap.remove();
        return cb(args);
      };
    })(this));
  };

  GenericAddon.prototype.setupSelector = function(args) {
    this.selectorwrap = $(document.createElement('div'));
    this.selectorwrap.addClass('form-group d-flex upgrade-box');
    this.selector = $(document.createElement('INPUT'));
    this.selector.attr('type', 'hidden');
    this.selectorwrap.append(this.selector);
    this.selectorwrap.append($.trim('<div class="input-group-addon">\n    <button class="btn btn-secondary d-block d-md-none upgrade-query-modal"><i class="fas fa-question"></i></button>\n</div>'));
    this.upgrade_query_modal = $(this.selectorwrap.find('button.upgrade-query-modal'));
    this.container.append(this.selectorwrap);
    if ($.isMobile()) {
      args.minimumResultsForSearch = -1;
    }
    args.formatResultCssClass = (function(_this) {
      return function(obj) {
        var not_in_collection, _ref;
        if (_this.ship.builder.collection != null) {
          not_in_collection = false;
          if (obj.id === ((_ref = _this.data) != null ? _ref.id : void 0)) {
            if (!(_this.ship.builder.collection.checkShelf(_this.type.toLowerCase(), obj.name) || _this.ship.builder.collection.checkTable(_this.type.toLowerCase(), obj.name))) {
              not_in_collection = true;
            }
          } else {
            not_in_collection = !_this.ship.builder.collection.checkShelf(_this.type.toLowerCase(), obj.name);
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
    this.upgrade_query_modal.click((function(_this) {
      return function(e) {
        if (_this.data) {
          console.log("" + _this.data.name);
          _this.ship.builder.showTooltip('Addon', _this.data, (_this.data != null ? {
            addon_type: _this.type
          } : void 0), _this.ship.builder.mobile_tooltip_modal, true);
          return _this.ship.builder.mobile_tooltip_modal.modal('show');
        }
      };
    })(this));
    this.selector.on('select2-focus', (function(_this) {
      return function(e) {
        if ($.isMobile()) {
          $('.select2-container .select2-focusser').remove();
          return $('.select2-search input').prop('focus', false).removeClass('select2-focused');
        }
      };
    })(this));
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
    return this.selector.data('select2').container.on('mouseover', (function(_this) {
      return function(e) {
        if (_this.data != null) {
          return _this.ship.builder.showTooltip('Addon', _this.data, {
            addon_type: _this.type
          });
        }
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
    var alreadyClaimed, ___iced_passed_deferral, __iced_deferrals, __iced_k, _ref;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    if ((new_data != null ? new_data.id : void 0) !== ((_ref = this.data) != null ? _ref.id : void 0)) {
      (function(_this) {
        return (function(__iced_k) {
          var _ref1, _ref2;
          if ((((_ref1 = _this.data) != null ? _ref1.unique : void 0) != null) || (((_ref2 = _this.data) != null ? _ref2.solitary : void 0) != null)) {
            (function(__iced_k) {
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral,
                funcname: "GenericAddon.setData"
              });
              _this.ship.builder.container.trigger('xwing:releaseUnique', [
                _this.unadjusted_data, _this.type, __iced_deferrals.defer({
                  lineno: 6893
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
          var _ref1;
          if (((_ref1 = _this.data) != null ? _ref1.standardized : void 0) != null) {
            _this.removeStandardized();
          }
          _this.rescindAddons();
          _this.deoccupyOtherUpgrades();
          (function(__iced_k) {
            if (((new_data != null ? new_data.unique : void 0) != null) || ((new_data != null ? new_data.solitary : void 0) != null)) {
              (function(__iced_k) {
                try {
                  __iced_deferrals = new iced.Deferrals(__iced_k, {
                    parent: ___iced_passed_deferral,
                    funcname: "GenericAddon.setData"
                  });
                  _this.ship.builder.container.trigger('xwing:claimUnique', [
                    new_data, _this.type, __iced_deferrals.defer({
                      lineno: 6900
                    })
                  ]);
                  __iced_deferrals._fulfill();
                } catch (_error) {
                  alreadyClaimed = _error;
                  _this.ship.builder.container.trigger('xwing:pointsUpdated');
                  return _this.lastSetValid = false;
                }
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
              if (_this.data.standardized != null) {
                _this.addToStandardizedList();
              }
            } else {
              _this.deoccupyOtherUpgrades();
            }
            _this.lastSetValid = _this.ship.validate();
            return __iced_k(_this.ship.builder.container.trigger('xwing:pointsUpdated'));
          });
        };
      })(this));
    } else {
      return __iced_k();
    }
  };

  GenericAddon.prototype.addToStandardizedList = function() {
    var idx, _ref;
    idx = this.ship.builder.standard_list['Ship'].indexOf(this.ship.data.name);
    if (idx > -1) {
      if (((_ref = this.ship.builder.standard_list['Upgrade'][idx]) != null ? _ref.name : void 0) === this.data.name) {
        return;
      }
    }
    this.ship.builder.standard_list['Upgrade'].push(this.data);
    return this.ship.builder.standard_list['Ship'].push(this.ship.data.name);
  };

  GenericAddon.prototype.removeStandardized = function() {
    var idx, nameToRemove, ship, upgrade, _i, _len, _ref, _ref1, _ref2, _results;
    idx = this.ship.builder.standard_list['Ship'].indexOf(this.ship.data.name);
    if (idx > -1) {
      if (((_ref = this.ship.builder.standard_list['Upgrade'][idx]) != null ? _ref.name : void 0) === this.data.name) {
        this.ship.builder.standard_list['Upgrade'].splice(idx, 1);
        this.ship.builder.standard_list['Ship'].splice(idx, 1);
        nameToRemove = this.data.name;
        _ref1 = this.ship.builder.ships;
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          ship = _ref1[_i];
          if (((_ref2 = ship.data) != null ? _ref2.name : void 0) === this.ship.data.name) {
            _results.push((function() {
              var _j, _len1, _ref3, _ref4, _results1;
              _ref3 = ship.upgrades;
              _results1 = [];
              for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
                upgrade = _ref3[_j];
                if (((_ref4 = upgrade.data) != null ? _ref4.name : void 0) === nameToRemove) {
                  _results1.push(upgrade.data = null);
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
      }
    }
  };

  GenericAddon.prototype.conferAddons = function() {
    var addon, args, cls, _i, _len, _ref, _results;
    if ((this.data.confersAddons != null) && !this.ship.builder.isQuickbuild && this.data.confersAddons.length > 0) {
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
            lineno: 6972
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
          } else {
            throw new Error("Unexpected addon type for addon " + addon);
          }
        }
        return _this.conferredAddons = [];
      };
    })(this));
  };

  GenericAddon.prototype.getPoints = function(data, ship) {
    var _ref;
    if (data == null) {
      data = this.data;
    }
    if (ship == null) {
      ship = this.ship;
    }
    if ((data != null ? data.variableagility : void 0) != null) {
      return data != null ? data.pointsarray[ship.data.agility] : void 0;
    } else if ((data != null ? data.variablebase : void 0) != null) {
      if ((ship != null ? ship.data.medium : void 0) != null) {
        return data != null ? data.pointsarray[1] : void 0;
      } else if ((ship != null ? ship.data.large : void 0) != null) {
        return data != null ? data.pointsarray[2] : void 0;
      } else if ((ship != null ? ship.data.huge : void 0) != null) {
        return data != null ? data.pointsarray[3] : void 0;
      } else {
        return data != null ? data.pointsarray[0] : void 0;
      }
    } else if ((data != null ? data.variableinit : void 0) != null) {
      return data != null ? data.pointsarray[ship.pilot.skill] : void 0;
    } else {
      return (_ref = data != null ? data.points : void 0) != null ? _ref : 0;
    }
  };

  GenericAddon.prototype.updateSelection = function(points) {
    if (this.data != null) {
      return this.selector.select2('data', {
        id: this.data.id,
        text: "" + (this.data.display_name ? this.data.display_name : this.data.name) + " (" + points + (this.data.pointsarray ? '*' : '') + ")"
      });
    } else {
      return this.selector.select2('data', null);
    }
  };

  GenericAddon.prototype.toString = function() {
    if (this.data != null) {
      return "" + (this.data.display_name ? this.data.display_name : this.data.name) + " (" + (this.getPoints()) + ")";
    } else {
      return "No " + this.type;
    }
  };

  GenericAddon.prototype.toHTML = function(points) {
    var attackHTML, attackIcon, attackStats, attackrangebonus, chargeHTML, count, forceHTML, match_array, recurringicon, restriction_html, text_str, upgrade_slot_font, _base, _ref;
    if (this.data != null) {
      if ((this.data.slot != null) && this.data.slot === "HardpointShip") {
        upgrade_slot_font = "hardpoint";
      } else {
        upgrade_slot_font = ((_ref = this.data.slot) != null ? _ref : this.type).toLowerCase().replace(/[^0-9a-z]/gi, '');
      }
      match_array = typeof (_base = this.data).text === "function" ? _base.text(match(/(<span.*<\/span>)<br \/><br \/>(.*)/)) : void 0;
      if (match_array) {
        restriction_html = '<div class="card-restriction-container">' + match_array[1] + '</div>';
        text_str = match_array[2];
      } else {
        restriction_html = '';
        text_str = this.data.text;
      }
      attackHTML = "";
      if (this.data.range != null) {
        attackrangebonus = (this.data.rangebonus != null) ? "<span class=\"upgrade-attack-rangebonus\"><i class=\"xwing-miniatures-font xwing-miniatures-font-rangebonusindicator\"></i></span>" : '';
        attackStats = $.trim("<span class=\"upgrade-attack-range\">" + this.data.range + "</span>\n" + attackrangebonus);
        attackIcon = (this.data.attack != null) ? $.trim("<span class=\"info-data info-attack\">" + this.data.attack + "</span>\n<i class=\"xwing-miniatures-font xwing-miniatures-font-frontarc\"></i>") : (this.data.attackf != null) ? $.trim("<span class=\"info-data info-attack\">" + this.data.attackf + "</span>\n<i class=\"xwing-miniatures-font xwing-miniatures-font-fullfrontarc\"></i>") : (this.data.attackt != null) ? $.trim("<span class=\"info-data info-attack\">" + this.data.attackt + "</span>\n<i class=\"xwing-miniatures-font xwing-miniatures-font-singleturretarc\"></i>") : (this.data.attackdt != null) ? $.trim("<span class=\"info-data info-attack\">" + this.data.attackdt + "</span>\n<i class=\"xwing-miniatures-font xwing-miniatures-font-doubleturretarc\"></i>") : (this.data.attackl != null) ? $.trim("<span class=\"info-data info-attack\">" + this.data.attackl + "</span>\n<i class=\"xwing-miniatures-font xwing-miniatures-font-leftarc\"></i>") : (this.data.attackr != null) ? $.trim("<span class=\"info-data info-attack\">" + this.data.attackr + "</span>\n<i class=\"xwing-miniatures-font xwing-miniatures-font-rightarc\"></i>") : (this.data.attackbull != null) ? $.trim("<span class=\"info-data info-attack\">" + this.data.attackbull + "</span>\n<i class=\"xwing-miniatures-font xwing-miniatures-font-bullseyearc\"></i>") : '';
        attackHTML = $.trim("<div class=\"upgrade-attack\">\n    " + attackStats + "\n    " + attackIcon + "\n</div>");
      }
      if (this.data.charge != null) {
        recurringicon = '';
        if (this.data.recurring != null) {
          if (this.data.recurring > 0) {
            count = 0;
            while (count < this.data.recurring) {
              recurringicon += '<sup><i class="fas fa-caret-up"></i></sup>';
              ++count;
            }
          } else {
            count = this.data.recurring;
            while (count < 0) {
              recurringicon += '<sub><i class="fas fa-caret-down"></i></sub>';
              ++count;
            }
          }
        }
        chargeHTML = $.trim("<div class=\"upgrade-charge\">\n    <span class=\"info-data info-charge\">" + this.data.charge + "</span>\n    <i class=\"xwing-miniatures-font xwing-miniatures-font-charge\"></i>" + recurringicon + "\n</div>");
      } else {
        chargeHTML = $.trim('');
      }
      if ((this.data.force != null)) {
        forceHTML = $.trim("<div class=\"upgrade-force\">\n    <span class=\"info-data info-force\">" + this.data.force + "</span>\n    <i class=\"xwing-miniatures-font xwing-miniatures-font-forcecharge\"></i><sup><i class=\"fas fa-caret-up\"></i></sup>\n</div>");
      } else {
        forceHTML = $.trim('');
      }
      return $.trim("<div class=\"upgrade-container\">\n    <div class=\"upgrade-stats\">\n        <div class=\"upgrade-name\"><i class=\"xwing-miniatures-font xwing-miniatures-font-" + upgrade_slot_font + "\"></i>" + (this.data.display_name ? this.data.display_name : this.data.name) + "</div>\n        <div class=\"mask\">\n            <div class=\"outer-circle\">\n                <div class=\"inner-circle upgrade-points\">" + points + "</div>\n            </div>\n        </div>\n        " + restriction_html + "\n    </div>\n    " + attackHTML + "\n    " + chargeHTML + "\n    " + forceHTML + "\n    <div class=\"upgrade-text\">" + text_str + "</div>\n    <div style=\"clear: both;\"></div>\n</div>");
    } else {
      return '';
    }
  };

  GenericAddon.prototype.toTableRow = function(points) {
    if (this.data != null) {
      return $.trim("<tr class=\"simple-addon\">\n    <td class=\"name\">" + (this.data.display_name ? this.data.display_name : this.data.name) + "</td>\n    <td class=\"points\">" + points + "</td>\n</tr>");
    } else {
      return '';
    }
  };

  GenericAddon.prototype.toSimpleCopy = function(points) {
    if (this.data != null) {
      return "" + this.data.name + " (" + points + ")    \n";
    } else {
      return null;
    }
  };

  GenericAddon.prototype.toRedditText = function(points) {
    if (this.data != null) {
      return "*&nbsp;" + this.data.name + " (" + points + ")*    \n";
    } else {
      return null;
    }
  };

  GenericAddon.prototype.toTTSText = function() {
    if (this.data != null) {
      return "" + (exportObj.toTTS(this.data.name));
    } else {
      return null;
    }
  };

  GenericAddon.prototype.toBBCode = function(points) {
    if (this.data != null) {
      return "[i]" + (this.data.display_name ? this.data.display_name : this.data.name) + " (" + points + ")[/i]";
    } else {
      return null;
    }
  };

  GenericAddon.prototype.toSimpleHTML = function(points) {
    if (this.data != null) {
      return "<i>" + (this.data.display_name ? this.data.display_name : this.data.name) + " (" + points + ")</i><br />";
    } else {
      return '';
    }
  };

  GenericAddon.prototype.toSerialized = function() {
    var _ref, _ref1;
    return "" + this.serialization_code + "." + ((_ref = (_ref1 = this.data) != null ? _ref1.id : void 0) != null ? _ref : -1);
  };

  GenericAddon.prototype.unequipOtherUpgrades = function() {
    var slot, upgrade, _i, _len, _ref, _ref1, _ref2, _results;
    _ref2 = (_ref = (_ref1 = this.data) != null ? _ref1.unequips_upgrades : void 0) != null ? _ref : [];
    _results = [];
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      slot = _ref2[_i];
      _results.push((function() {
        var _j, _len1, _ref3, _results1;
        _ref3 = this.ship.upgrades;
        _results1 = [];
        for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
          upgrade = _ref3[_j];
          if (upgrade.slot !== slot || upgrade === this || !upgrade.isOccupied()) {
            continue;
          }
          upgrade.setData(null);
          break;
        }
        return _results1;
      }).call(this));
    }
    return _results;
  };

  GenericAddon.prototype.isOccupied = function() {
    return (this.data != null) || (this.occupied_by != null);
  };

  GenericAddon.prototype.occupyOtherUpgrades = function() {
    var slot, upgrade, _i, _len, _ref, _ref1, _ref2, _results;
    _ref2 = (_ref = (_ref1 = this.data) != null ? _ref1.also_occupies_upgrades : void 0) != null ? _ref : [];
    _results = [];
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      slot = _ref2[_i];
      _results.push((function() {
        var _j, _len1, _ref3, _results1;
        _ref3 = this.ship.upgrades;
        _results1 = [];
        for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
          upgrade = _ref3[_j];
          if (upgrade.slot !== slot || upgrade === this || upgrade.isOccupied()) {
            continue;
          }
          this.occupy(upgrade);
          break;
        }
        return _results1;
      }).call(this));
    }
    return _results;
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

  GenericAddon.prototype.occupiesAnUpgradeSlot = function(upgradeslot) {
    var upgrade, _i, _len, _ref;
    _ref = this.ship.upgrades;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      upgrade = _ref[_i];
      if (upgrade.slot !== upgradeslot || upgrade === this || (upgrade.data != null)) {
        continue;
      }
      if ((upgrade.occupied_by != null) && upgrade.occupied_by === this) {
        return true;
      }
    }
    return false;
  };

  GenericAddon.prototype.toXWS = function(upgrade_dict) {
    var _name, _ref, _ref1;
    return (upgrade_dict[_name = (_ref1 = exportObj.toXWSUpgrade[this.data.slot]) != null ? _ref1 : this.data.slot.canonicalize()] != null ? upgrade_dict[_name] : upgrade_dict[_name] = []).push((_ref = this.data.xws) != null ? _ref : this.data.canonical_name);
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
    this.dataByName = exportObj.upgrades;
    this.serialization_code = 'U';
    this.setupSelector();
  }

  Upgrade.prototype.setupSelector = function() {
    return Upgrade.__super__.setupSelector.call(this, {
      width: '100%',
      placeholder: this.placeholderMod_func(exportObj.translate('ui', 'upgradePlaceholder', this.slot)),
      allowClear: true,
      query: (function(_this) {
        return function(query) {
          var data;
          data = {
            results: []
          };
          data.results = _this.ship.builder.getAvailableUpgradesIncluding(_this.slot, _this.data, _this.ship, _this, query.term, _this.filter_func);
          return query.callback(data);
        };
      })(this)
    });
  };

  return Upgrade;

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

exportObj.QuickbuildUpgrade = (function(_super) {
  __extends(QuickbuildUpgrade, _super);

  function QuickbuildUpgrade(args) {
    QuickbuildUpgrade.__super__.constructor.call(this, args);
    this.slot = args.slot;
    this.type = 'Upgrade';
    this.dataById = exportObj.upgradesById;
    this.dataByName = exportObj.upgrades;
    this.serialization_code = 'U';
    this.upgrade = args.upgrade;
    this.setupSelector();
  }

  QuickbuildUpgrade.prototype.setupSelector = function() {
    return QuickbuildUpgrade.__super__.setupSelector.call(this, {
      width: '100%',
      allowClear: false,
      query: (function(_this) {
        return function(query) {
          var data;
          data = {
            results: [
              {
                id: _this.upgrade.id,
                text: _this.upgrade.display_name ? _this.upgrade.display_name : _this.upgrade.name,
                points: 0,
                name: _this.upgrade.name,
                display_name: _this.upgrade.display_name
              }
            ]
          };
          return query.callback(data);
        };
      })(this)
    });
  };

  QuickbuildUpgrade.prototype.getPoints = function(args) {
    return 0;
  };

  QuickbuildUpgrade.prototype.updateSelection = function(args) {
    if (this.data != null) {
      return this.selector.select2('data', {
        id: this.data.id,
        text: "" + (this.data.display_name ? this.data.display_name : this.data.name)
      });
    } else {
      return this.selector.select2('data', null);
    }
  };

  return QuickbuildUpgrade;

})(GenericAddon);

SERIALIZATION_CODE_TO_CLASS = {
  'U': exportObj.Upgrade,
  'u': exportObj.RestrictedUpgrade
};

exportObj = typeof exports !== "undefined" && exports !== null ? exports : this;

exportObj.fromXWSFaction = {
  'rebelalliance': 'Rebel Alliance',
  'rebels': 'Rebel Alliance',
  'rebel': 'Rebel Alliance',
  'galacticempire': 'Galactic Empire',
  'imperial': 'Galactic Empire',
  'scumandvillainy': 'Scum and Villainy',
  'firstorder': 'First Order',
  'resistance': 'Resistance',
  'galacticrepublic': 'Galactic Republic',
  'separatistalliance': 'Separatist Alliance'
};

exportObj.toXWSFaction = {
  'Rebel Alliance': 'rebelalliance',
  'Galactic Empire': 'galacticempire',
  'Scum and Villainy': 'scumandvillainy',
  'First Order': 'firstorder',
  'Resistance': 'resistance',
  'Galactic Republic': 'galacticrepublic',
  'Separatist Alliance': 'separatistalliance'
};

exportObj.toXWSUpgrade = {
  'Modification': 'modification',
  'Force': 'force-power',
  'Tactical Relay': 'tactical-relay'
};

exportObj.fromXWSUpgrade = {
  'amd': 'Astromech',
  'astromechdroid': 'Astromech',
  'ept': 'Talent',
  'elitepilottalent': 'Talent',
  'system': 'Sensor',
  'mod': 'Modification',
  'force-power': 'Force',
  'tactical-relay': 'Tactical Relay'
};

SPEC_URL = 'https://github.com/elistevens/xws-spec';

SQUAD_TO_XWS_URL = 'http://squad2xws.herokuapp.com/translate/';

exportObj.loadXWSButton = function(xws_import_modal) {
  var import_status;
  import_status = $(xws_import_modal.find('.xws-import-status'));
  import_status.text(exportObj.translate('ui', 'Loading...'));
  return (function(_this) {
    return function(import_status) {
      var e, input, jsonurl, loadxws, uuid, xws;
      loadxws = function(xws) {
        return $(window).trigger('xwing:activateBuilder', [
          exportObj.fromXWSFaction[xws.faction], function(builder) {
            if (builder.current_squad.dirty && (builder.backend != null)) {
              xws_import_modal.modal('hide');
              return builder.backend.warnUnsaved(builder, function() {
                return builder.loadFromXWS(xws, function(res) {
                  if (!res.success) {
                    xws_import_modal.modal('show');
                    return import_status.text(res.error);
                  }
                });
              });
            } else {
              return builder.loadFromXWS(xws, function(res) {
                if (res.success) {
                  return xws_import_modal.modal('hide');
                } else {
                  return import_status.text(res.error);
                }
              });
            }
          }
        ]);
      };
      input = xws_import_modal.find('.xws-content').val();
      try {
        xws = JSON.parse(input);
        return loadxws(xws);
      } catch (_error) {
        e = _error;
        uuid = input.split('/').pop();
        jsonurl = SQUAD_TO_XWS_URL + uuid;
        return ($.getJSON(jsonurl, loadxws))["catch"](function(e) {
          return import_status.text('Invalid Input');
        });
      }
    };
  })(this)(import_status);
};

/*
//@ sourceMappingURL=xwing.js.map
*/