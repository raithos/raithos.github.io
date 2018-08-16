###
    X-Wing Squad Builder
    Geordan Rosario <geordan@gmail.com>
    https://github.com/geordanr/xwing
###
exportObj = exports ? this

class exportObj.SquadBuilderBackend
    ###
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

    ###
    constructor: (args) ->
        # Might as well do this right away
        $.ajaxSetup
            dataType: "json" # Because Firefox sucks for some reason
            xhrFields:
                withCredentials: true

        # args
        @server = args.server
        @builders = args.builders
        @login_logout_button = $ args.login_logout_button
        @auth_status = $ args.auth_status

        @authenticated = false
        @ui_ready = false
        @oauth_window = null

        @method_metadata =
            google_oauth2:
                icon: 'fa fa-google-plus-square'
                text: 'Google'
            facebook:
                icon: 'fa fa-facebook-square'
                text: 'Facebook'
            twitter:
                icon: 'fa fa-twitter-square'
                text: 'Twitter'

        @squad_display_mode = 'all'

        @collection_save_timer = null

        @setupHandlers()
        @setupUI()

        # Check initial authentication status
        @authenticate () =>
            @auth_status.hide()
            @login_logout_button.removeClass 'hidden'

        # Finally, hook up the builders
        for builder in @builders
            builder.setBackend this

        @updateAuthenticationVisibility()

    updateAuthenticationVisibility: () ->
        if @authenticated
            $('.show-authenticated').show()
            $('.hide-authenticated').hide()
        else
            $('.show-authenticated').hide()
            $('.hide-authenticated').show()

    save: (serialized, id=null, name, faction, additional_data={}, cb) ->
        if serialized == ""
            cb
                id: null
                success: false
                error: "You cannot save an empty squad"
        else if $.trim(name) == ""
            cb
                id: null
                success: false
                error: "Squad name cannot be empty"
        else if not faction? or faction == ""
            throw "Faction unspecified to save()"
        else
            post_args =
                name: $.trim(name)
                faction: $.trim(faction)
                serialized: serialized
                additional_data: additional_data
            if id?
                post_url = "#{@server}/squads/#{id}"
            else
                post_url = "#{@server}/squads/new"
                post_args['_method'] = 'put'
            $.post post_url, post_args, (data, textStatus, jqXHR) =>
                cb
                    id: data.id
                    success: data.success
                    error: data.error

    delete: (id, cb) ->
        post_args =
            '_method': 'delete'
        $.post "#{@server}/squads/#{id}", post_args, (data, textStatus, jqXHR) =>
            cb
                success: data.success
                error: data.error

    list: (builder, all=false) ->
        # TODO: Pagination
        if all
            @squad_list_modal.find('.modal-header .squad-list-header-placeholder').text("Everyone's #{builder.faction} Squads")
        else
            @squad_list_modal.find('.modal-header .squad-list-header-placeholder').text("Your #{builder.faction} Squads")
        list_ul = $ @squad_list_modal.find('ul.squad-list')
        list_ul.text ''
        list_ul.hide()
        loading_pane = $ @squad_list_modal.find('p.squad-list-loading')
        loading_pane.show()
        @show_all_squads_button.click()
        @squad_list_modal.modal 'show'

        url = if all then "#{@server}/all" else "#{@server}/squads/list"
        $.get url, (data, textStatus, jqXHR) =>
            if data[builder.faction].length == 0
                list_ul.append $.trim """
                    <li>You have no squads saved.  Go save one!</li>
                """
            else
                for squad in data[builder.faction]
                    li = $ document.createElement('LI')
                    li.addClass 'squad-summary'
                    li.data 'squad', squad
                    li.data 'builder', builder
                    list_ul.append li
                    li.append $.trim """
                        <div class="row-fluid">
                            <div class="span9">
                                <h4>#{squad.name}</h4>
                            </div>
                            <div class="span3">
                                <h5>#{squad.additional_data.points} Points</h5>
                            </div>
                        </div>
                        <div class="row-fluid squad-description">
                            <div class="span8">
                                #{squad.additional_data.description}
                            </div>
                            <div class="span4">
                                <button class="btn load-squad">Load</button>
                                &nbsp;
                                <button class="btn btn-danger delete-squad">Delete</button>
                            </div>
                        </div>
                        <div class="row-fluid squad-delete-confirm">
                            <div class="span8">
                                Really delete <em>#{squad.name}</em>?
                            </div>
                            <div class="span4">
                                <button class="btn btn-danger confirm-delete-squad">Delete</button>
                                &nbsp;
                                <button class="btn cancel-delete-squad">Cancel</button>
                            </div>
                        </div>
                    """
                    li.find('.squad-delete-confirm').hide()

                    li.find('button.load-squad').click (e) =>
                        e.preventDefault()
                        button = $ e.target
                        li = button.closest 'li'
                        builder = li.data('builder')
                        @squad_list_modal.modal 'hide'
                        if builder.current_squad.dirty
                            @warnUnsaved builder, () ->
                                builder.container.trigger 'xwing-backend:squadLoadRequested', li.data('squad')
                        else
                            builder.container.trigger 'xwing-backend:squadLoadRequested', li.data('squad')

                    li.find('button.delete-squad').click (e) ->
                        e.preventDefault()
                        button = $ e.target
                        li = button.closest 'li'
                        builder = li.data('builder')
                        do (li) ->
                            li.find('.squad-description').fadeOut 'fast', ->
                                li.find('.squad-delete-confirm').fadeIn 'fast'

                    li.find('button.cancel-delete-squad').click (e) ->
                        e.preventDefault()
                        button = $ e.target
                        li = button.closest 'li'
                        builder = li.data('builder')
                        do (li) ->
                            li.find('.squad-delete-confirm').fadeOut 'fast', ->
                                li.find('.squad-description').fadeIn 'fast'

                    li.find('button.confirm-delete-squad').click (e) =>
                        e.preventDefault()
                        button = $ e.target
                        li = button.closest 'li'
                        builder = li.data('builder')
                        li.find('.cancel-delete-squad').fadeOut 'fast'
                        li.find('.confirm-delete-squad').addClass 'disabled'
                        li.find('.confirm-delete-squad').text 'Deleting...'
                        @delete li.data('squad').id, (results) ->
                            if results.success
                                li.slideUp 'fast', ->
                                    $(li).remove()
                            else
                                li.html $.trim """
                                    Error deleting #{li.data('squad').name}: <em>#{results.error}</em>
                                """

            loading_pane.fadeOut 'fast'
            list_ul.fadeIn 'fast'

    authenticate: (cb=$.noop) ->
        $(@auth_status.find('.payload')).text 'Checking auth status...'
        @auth_status.show()
        old_auth_state = @authenticated

        $.ajax
            url: "#{@server}/ping"
            success: (data) =>
                if data?.success
                    @authenticated = true
                else
                    @authenticated = false
                @maybeAuthenticationChanged old_auth_state, cb
            error: (jqXHR, textStatus, errorThrown) =>
                @authenticated = false
                @maybeAuthenticationChanged old_auth_state, cb

    maybeAuthenticationChanged: (old_auth_state, cb) =>
        if old_auth_state != @authenticated
            $(window).trigger 'xwing-backend:authenticationChanged', [ @authenticated, this ]
        @oauth_window = null
        @auth_status.hide()
        cb @authenticated
        @authenticated

    login: () ->
        # Display login dialog.
        if @ui_ready
            @login_modal.modal 'show'

    logout: (cb=$.noop) ->
        $(@auth_status.find('.payload')).text 'Logging out...'
        @auth_status.show()
        $.get "#{@server}/auth/logout", (data, textStatus, jqXHR) =>
            @authenticated = false
            $(window).trigger 'xwing-backend:authenticationChanged', [ @authenticated, this ]
            @auth_status.hide()
            cb()

    showSaveAsModal: (builder) ->
        @save_as_modal.data 'builder', builder
        @save_as_input.val builder.current_squad.name
        @save_as_save_button.addClass 'disabled'
        @nameCheck()
        @save_as_modal.modal 'show'

    showDeleteModal: (builder) ->
        @delete_modal.data 'builder', builder
        @delete_name_container.text builder.current_squad.name
        @delete_modal.modal 'show'

    nameCheck: () =>
        window.clearInterval @save_as_modal.data('timer')
        # trivial check
        name = $.trim(@save_as_input.val())
        if name.length == 0
            @name_availability_container.text ''
            @name_availability_container.append $.trim """
                <i class="fa fa-thumbs-down"> A name is required
            """
        else
            $.post "#{@server}/squads/namecheck", { name: name }, (data) =>
                @name_availability_container.text ''
                if data.available
                    @name_availability_container.append $.trim """
                        <i class="fa fa-thumbs-up"> Name is available
                    """
                    @save_as_save_button.removeClass 'disabled'
                else
                    @name_availability_container.append $.trim """
                        <i class="fa fa-thumbs-down"> You already have a squad with that name
                    """
                    @save_as_save_button.addClass 'disabled'

    warnUnsaved: (builder, action) ->
        @unsaved_modal.data 'builder', builder
        @unsaved_modal.data 'callback', action
        @unsaved_modal.modal 'show'

    setupUI: () ->
        @auth_status.addClass 'disabled'
        @auth_status.click (e) =>
            false

        @login_modal = $ document.createElement('DIV')
        @login_modal.addClass 'modal hide fade hidden-print'
        $(document.body).append @login_modal
        @login_modal.append $.trim """
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                <h3>Log in with OAuth</h3>
            </div>
            <div class="modal-body">
                <p>
                    Select one of the OAuth providers below to log in and start saving squads.
                    <a class="login-help" href="#">What's this?</a>
                </p>
                <div class="well well-small oauth-explanation">
                    <p>
                        <a href="http://en.wikipedia.org/wiki/OAuth" target="_blank">OAuth</a> is an authorization system which lets you prove your identity at a web site without having to create a new account.  Instead, you tell some provider with whom you already have an account (e.g. Google or Facebook) to prove to this web site that you say who you are.  That way, the next time you visit, this site remembers that you're that user from Google.
                    </p>
                    <p>
                        The best part about this is that you don't have to come up with a new username and password to remember.  And don't worry, I'm not collecting any data from the providers about you.  I've tried to set the scope of data to be as small as possible, but some places send a bunch of data at minimum.  I throw it away.  All I look at is a unique identifier (usually some giant number).
                    </p>
                    <p>
                        For more information, check out this <a href="http://hueniverse.com/oauth/guide/intro/" target="_blank">introduction to OAuth</a>.
                    </p>
                    <button class="btn">Got it!</button>
                </div>
                <ul class="login-providers inline"></ul>
                <p>
                    This will open a new window to let you authenticate with the chosen provider.  You may have to allow pop ups for this site.  (Sorry.)
                </p>
                <p class="login-in-progress">
                    <em>OAuth login is in progress.  Please finish authorization at the specified provider using the window that was just created.</em>
                </p>
            </div>
            <div class="modal-footer">
                <button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>
            </div>
        """
        oauth_explanation = $ @login_modal.find('.oauth-explanation')
        oauth_explanation.hide()
        @login_modal.find('.login-in-progress').hide()
        @login_modal.find('a.login-help').click (e) =>
            e.preventDefault()
            unless oauth_explanation.is ':visible'
                oauth_explanation.slideDown 'fast'
        oauth_explanation.find('button').click (e) =>
            e.preventDefault()
            oauth_explanation.slideUp 'fast'
        $.get "#{@server}/methods", (data, textStatus, jqXHR) =>
            methods_ul = $ @login_modal.find('ul.login-providers')
            for method in data.methods
                a = $ document.createElement('A')
                a.addClass 'btn btn-inverse'
                a.data 'url', "#{@server}/auth/#{method}"
                a.append """<i class="#{@method_metadata[method].icon}"></i>&nbsp;#{@method_metadata[method].text}"""
                a.click (e) =>
                    e.preventDefault()
                    methods_ul.slideUp 'fast'
                    @login_modal.find('.login-in-progress').slideDown 'fast'
                    @oauth_window = window.open $(e.target).data('url'), "xwing_login"
                li = $ document.createElement('LI')
                li.append a
                methods_ul.append li
            @ui_ready = true

        @squad_list_modal = $ document.createElement('DIV')
        @squad_list_modal.addClass 'modal hide fade hidden-print squad-list'
        $(document.body).append @squad_list_modal
        @squad_list_modal.append $.trim """
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                <h3 class="squad-list-header-placeholder hidden-phone hidden-tablet"></h3>
                <h4 class="squad-list-header-placeholder hidden-desktop"></h4>
            </div>
            <div class="modal-body">
                <ul class="squad-list"></ul>
                <p class="pagination-centered squad-list-loading">
                    <i class="fa fa-spinner fa-spin fa-3x"></i>
                    <br />
                    Fetching squads...
                </p>
            </div>
            <div class="modal-footer">
                <div class="btn-group squad-display-mode">
                    <button class="btn btn-inverse show-all-squads">All</button>
                    <button class="btn show-standard-squads">Standard</button>
                    <button class="btn show-epic-squads">Epic</button>
                    <button class="btn show-team-epic-squads">Team<span class="hidden-phone"> Epic</span></button>
                </div>
                <button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>
            </div>
        """
        @squad_list_modal.find('ul.squad-list').hide()

        @show_all_squads_button = $ @squad_list_modal.find('.show-all-squads')
        @show_all_squads_button.click (e) =>
            unless @squad_display_mode == 'all'
                @squad_display_mode = 'all'
                @squad_list_modal.find('.squad-display-mode .btn').removeClass 'btn-inverse'
                @show_all_squads_button.addClass 'btn-inverse'
                @squad_list_modal.find('.squad-list li').show()

        @show_standard_squads_button = $ @squad_list_modal.find('.show-standard-squads')
        @show_standard_squads_button.click (e) =>
            unless @squad_display_mode == 'standard'
                @squad_display_mode = 'standard'
                @squad_list_modal.find('.squad-display-mode .btn').removeClass 'btn-inverse'
                @show_standard_squads_button.addClass 'btn-inverse'
                @squad_list_modal.find('.squad-list li').each (idx, elem) ->
                    $(elem).toggle (($(elem).data().squad.serialized.search(/v\d+!e/) == -1) and ($(elem).data().squad.serialized.search(/v\d+!t/) == -1))

        @show_epic_squads_button = $ @squad_list_modal.find('.show-epic-squads')
        @show_epic_squads_button.click (e) =>
            unless @squad_display_mode == 'epic'
                @squad_display_mode = 'epic'
                @squad_list_modal.find('.squad-display-mode .btn').removeClass 'btn-inverse'
                @show_epic_squads_button.addClass 'btn-inverse'
                @squad_list_modal.find('.squad-list li').each (idx, elem) ->
                    $(elem).toggle $(elem).data().squad.serialized.search(/v\d+!e/) != -1

        @show_team_epic_squads_button = $ @squad_list_modal.find('.show-team-epic-squads')
        @show_team_epic_squads_button.click (e) =>
            unless @squad_display_mode == 'team-epic'
                @squad_display_mode = 'team-epic'
                @squad_list_modal.find('.squad-display-mode .btn').removeClass 'btn-inverse'
                @show_team_epic_squads_button.addClass 'btn-inverse'
                @squad_list_modal.find('.squad-list li').each (idx, elem) ->
                    $(elem).toggle $(elem).data().squad.serialized.search(/v\d+!t/) != -1

        @save_as_modal = $ document.createElement('DIV')
        @save_as_modal.addClass 'modal hide fade hidden-print'
        $(document.body).append @save_as_modal
        @save_as_modal.append $.trim """
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                <h3>Save Squad As...</h3>
            </div>
            <div class="modal-body">
                <label for="xw-be-squad-save-as">
                    New Squad Name
                    <input id="xw-be-squad-save-as"></input>
                </label>
                <span class="name-availability"></span>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary save" aria-hidden="true">Save</button>
                <button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>
            </div>
        """
        @save_as_modal.on 'shown', () =>
            # Because Firefox handles this badly
            window.setTimeout () =>
                @save_as_input.focus()
                @save_as_input.select()
            , 100

        @save_as_save_button = @save_as_modal.find('button.save')
        @save_as_save_button.click (e) =>
            e.preventDefault()
            unless @save_as_save_button.hasClass('disabled')
                timer = @save_as_modal.data('timer')
                window.clearInterval(timer) if timer?
                @save_as_modal.modal 'hide'
                builder = @save_as_modal.data 'builder'
                additional_data =
                    points: builder.total_points
                    description: builder.describeSquad()
                    cards: builder.listCards()
                    notes: builder.getNotes()
                    obstacles: builder.getObstacles()
                builder.backend_save_list_as_button.addClass 'disabled'
                builder.backend_status.html $.trim """
                    <i class="fa fa-refresh fa-spin"></i>&nbsp;Saving squad...
                """
                builder.backend_status.show()
                new_name = $.trim @save_as_input.val()
                @save builder.serialize(), null, new_name, builder.faction, additional_data, (results) =>
                    if results.success
                        builder.current_squad.id = results.id
                        builder.current_squad.name = new_name
                        builder.current_squad.dirty = false
                        builder.container.trigger 'xwing-backend:squadDirtinessChanged'
                        builder.container.trigger 'xwing-backend:squadNameChanged'
                        builder.backend_status.html $.trim """
                            <i class="fa fa-check"></i>&nbsp;New squad saved successfully.
                        """
                    else
                        builder.backend_status.html $.trim """
                            <i class="fa fa-exclamation-circle"></i>&nbsp;#{results.error}
                        """
                    builder.backend_save_list_as_button.removeClass 'disabled'

        @save_as_input = $ @save_as_modal.find('input')
        @save_as_input.keypress (e) =>
            if e.which == 13
                @save_as_save_button.click()
                false
            else
                @name_availability_container.text ''
                @name_availability_container.append $.trim """
                    <i class="fa fa-spin fa-spinner"></i> Checking name availability...
                """
                timer = @save_as_modal.data('timer')
                window.clearInterval(timer) if timer?
                @save_as_modal.data 'timer', window.setInterval(@nameCheck, 500)

        @name_availability_container = $ @save_as_modal.find('.name-availability')

        @delete_modal = $ document.createElement('DIV')
        @delete_modal.addClass 'modal hide fade hidden-print'
        $(document.body).append @delete_modal
        @delete_modal.append $.trim """
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                <h3>Really Delete <span class="squad-name-placeholder"></span>?</h3>
            </div>
            <div class="modal-body">
                <p>Are you sure you want to delete this squad?</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-danger delete" aria-hidden="true">Yes, Delete <i class="squad-name-placeholder"></i></button>
                <button class="btn" data-dismiss="modal" aria-hidden="true">Never Mind</button>
            </div>
        """

        @delete_name_container = $ @delete_modal.find('.squad-name-placeholder')
        @delete_button = $ @delete_modal.find('button.delete')
        @delete_button.click (e) =>
            e.preventDefault()
            builder = @delete_modal.data 'builder'
            builder.backend_status.html $.trim """
                <i class="fa fa-refresh fa-spin"></i>&nbsp;Deleting squad...
            """
            builder.backend_status.show()
            builder.backend_delete_list_button.addClass 'disabled'
            @delete_modal.modal 'hide'
            @delete builder.current_squad.id, (results) =>
                if results.success
                    builder.resetCurrentSquad()
                    builder.current_squad.dirty = true
                    builder.container.trigger 'xwing-backend:squadDirtinessChanged'
                    builder.backend_status.html $.trim """
                        <i class="fa fa-check"></i>&nbsp;Squad deleted.
                    """
                else
                    builder.backend_status.html $.trim """
                        <i class="fa fa-exclamation-circle"></i>&nbsp;#{results.error}
                    """
                    # Failed, so offer chance to delete again
                    builder.backend_delete_list_button.removeClass 'disabled'

        @unsaved_modal = $ document.createElement('DIV')
        @unsaved_modal.addClass 'modal hide fade hidden-print'
        $(document.body).append @unsaved_modal
        @unsaved_modal.append $.trim """
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                <h3>Unsaved Changes</h3>
            </div>
            <div class="modal-body">
                <p>You have not saved changes to this squad.  Do you want to go back and save?</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" aria-hidden="true" data-dismiss="modal">Go Back</button>
                <button class="btn btn-danger discard" aria-hidden="true">Discard Changes</button>
            </div>
        """
        @unsaved_discard_button = $ @unsaved_modal.find('button.discard')
        @unsaved_discard_button.click (e) =>
            e.preventDefault()
            @unsaved_modal.data('builder').current_squad.dirty = false
            @unsaved_modal.data('callback')()
            @unsaved_modal.modal 'hide'

    setupHandlers: () ->
        $(window).on 'xwing-backend:authenticationChanged', (e, authenticated, backend) =>
            @updateAuthenticationVisibility()
            if authenticated
                @loadCollection()

        @login_logout_button.click (e) =>
            e.preventDefault()
            if @authenticated
                @logout()
            else
                @login()

        $(window).on 'message', (e) =>
            ev = e.originalEvent
            if ev.origin == @server
                switch ev.data?.command
                    when 'auth_successful'
                        @authenticate()
                        @login_modal.modal 'hide'
                        @login_modal.find('.login-in-progress').hide()
                        @login_modal.find('ul.login-providers').show()
                        ev.source.close()
                    else
                        console.log "Unexpected command #{ev.data?.command}"
            else
                console.log "Message received from unapproved origin #{ev.origin}"
                window.last_ev = e
        .on 'xwing-collection:changed', (e, collection) =>
            clearTimeout(@collection_save_timer) if @collection_save_timer?
            @collection_save_timer = setTimeout =>
                @saveCollection collection, (res) ->
                    if res
                        $(window).trigger 'xwing-collection:saved', collection
            , 1000

    getSettings: (cb=$.noop) ->
        $.get("#{@server}/settings").done (data, textStatus, jqXHR) =>
            cb data.settings

    set: (setting, value, cb=$.noop) ->
        post_args =
            "_method": "PUT"
        post_args[setting] = value
        $.post("#{@server}/settings", post_args).done (data, textStatus, jqXHR) =>
            cb data.set

    deleteSetting: (setting, cb=$.noop) ->
        $.post("#{@server}/settings/#{setting}", {"_method": "DELETE"}).done (data, textStatus, jqXHR) =>
            cb data.deleted

    getHeaders: (cb=$.noop) ->
        $.get("#{@server}/headers").done (data, textStatus, jqXHR) =>
            cb data.headers

    getLanguagePreference: (settings, cb=$.noop) =>
        # Check session, then headers
        if settings?.language?
            cb settings.language
        else
            await @getHeaders defer(headers)
            if headers?.HTTP_ACCEPT_LANGUAGE?
                # Need to parse out language preferences
                # I'm going to be lazy and only output the first one we encounter
                for language_range in headers.HTTP_ACCEPT_LANGUAGE.split(',')
                    [ language_tag, quality ] = language_range.split ';'
                    if language_tag == '*'
                        cb 'English'
                    else
                        language_code = language_tag.split('-')[0]
                        cb(exportObj.codeToLanguage[language_code] ? 'English')
                    break
            else
                cb 'English'

    saveCollection: (collection, cb=$.noop) ->
        post_args =
            expansions: collection.expansions
            singletons: collection.singletons
        $.post("#{@server}/collection", post_args).done (data, textStatus, jqXHR) ->
            cb data.success

    loadCollection: ->
        # Backend provides an empty collection if none exists yet for the user.
        $.get("#{@server}/collection").done (data, textStatus, jqXHR) ->
            collection = data.collection
            new exportObj.Collection
                expansions: collection.expansions
                singletons: collection.singletons

###
    X-Wing Card Browser
    Geordan Rosario <geordan@gmail.com>
    https://github.com/geordanr/xwing
###
exportObj = exports ? this

# Assumes cards.js has been loaded

TYPES = [ 'pilots', 'upgrades', 'modifications', 'titles' ]

byName = (a, b) ->
    a_name = a.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '')
    b_name = b.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '')
    if a_name < b_name
        -1
    else if b_name < a_name
        1
    else
        0

byPoints = (a, b) ->
    if a.data.points < b.data.points
        -1
    else if b.data.points < a.data.points
        1
    else
        byName a, b

String::capitalize = ->
    this.charAt(0).toUpperCase() + this.slice(1)

class exportObj.CardBrowser
    constructor: (args) ->
        # args
        @container = $ args.container

        # internals
        @currently_selected = null
        @language = 'English'

        @prepareData()

        @setupUI()
        @setupHandlers()

        @sort_selector.change()

    setupUI: () ->
        @container.append $.trim """
            <div class="container-fluid xwing-card-browser">
                <div class="row-fluid">
                    <div class="span12">
                        <span class="translate sort-cards-by">Sort cards by</span>: <select class="sort-by">
                            <option value="name">Name</option>
                            <option value="source">Source</option>
                            <option value="type-by-points">Type (by Points)</option>
                            <option value="type-by-name" selected="1">Type (by Name)</option>
                        </select>
                    </div>
                </div>
                <div class="row-fluid">
                    <div class="span4 card-selector-container">

                    </div>
                    <div class="span8">
                        <div class="well card-viewer-placeholder info-well">
                            <p class="translate select-a-card">Select a card from the list at the left.</p>
                        </div>
                        <div class="well card-viewer-container info-well">
                            <span class="info-name"></span>
                            <br />
                            <span class="info-type"></span>
                            <br />
                            <span class="info-sources"></span>
                            <table>
                                <tbody>
                                    <tr class="info-skill">
                                        <td class="info-header">Skill</td>
                                        <td class="info-data info-skill"></td>
                                    </tr>
                                    <tr class="info-energy">
                                        <td class="info-header"><i class="xwing-miniatures-font header-energy xwing-miniatures-font-energy"></i></td>
                                        <td class="info-data info-energy"></td>
                                    </tr>
                                    <tr class="info-attack">
                                        <td class="info-header"><i class="xwing-miniatures-font header-attack xwing-miniatures-font-frontarc"></i></td>
                                        <td class="info-data info-attack"></td>
                                    </tr>
                                    <tr class="info-attack-fullfront">
                                        <td class="info-header"><i class="xwing-miniatures-font header-attack xwing-miniatures-font-fullfrontarc"></i></td>
                                        <td class="info-data info-attack"></td>
                                    </tr>
                                    <tr class="info-attack-bullseye">
                                        <td class="info-header"><i class="xwing-miniatures-font header-attack xwing-miniatures-font-bullseyearc"></i></td>
                                        <td class="info-data info-attack"></td>
                                    </tr>
                                    <tr class="info-attack-back">
                                        <td class="info-header"><i class="xwing-miniatures-font header-attack xwing-miniatures-font-reararc"></i></td>
                                        <td class="info-data info-attack"></td>
                                    </tr>
                                    <tr class="info-attack-turret">
                                        <td class="info-header"><i class="xwing-miniatures-font header-attack xwing-miniatures-font-singleturretarc"></i></td>
                                        <td class="info-data info-attack"></td>
                                    </tr>
                                    <tr class="info-attack-doubleturret">
                                        <td class="info-header"><i class="xwing-miniatures-font header-attack xwing-miniatures-font-doubleturretarc"></i></td>
                                        <td class="info-data info-attack"></td>
                                    </tr>
                                    <tr class="info-agility">
                                        <td class="info-header"><i class="xwing-miniatures-font header-agility xwing-miniatures-font-agility"></i></td>
                                        <td class="info-data info-agility"></td>
                                    </tr>
                                    <tr class="info-hull">
                                        <td class="info-header"><i class="xwing-miniatures-font header-hull xwing-miniatures-font-hull"></i></td>
                                        <td class="info-data info-hull"></td>
                                    </tr>
                                    <tr class="info-shields">
                                        <td class="info-header"><i class="xwing-miniatures-font header-shield xwing-miniatures-font-shield"></i></td>
                                        <td class="info-data info-shields"></td>
                                    </tr>
                                    <tr class="info-force">
                                        <td class="info-header"><i class="xwing-miniatures-font header-force xwing-miniatures-font-forcecharge"></i></td>
                                        <td class="info-data info-force"></td>
                                    </tr>
                                    <tr class="info-charge">
                                        <td class="info-header"><i class="xwing-miniatures-font header-charge xwing-miniatures-font-charge"></i></td>
                                        <td class="info-data info-charge"></td>
                                    </tr>
                                    <tr class="info-range">
                                        <td class="info-header">Range</td>
                                        <td class="info-data info-range"></td>
                                    </tr>
                                    <tr class="info-actions">
                                        <td class="info-header">Actions</td>
                                        <td class="info-data"></td>
                                    </tr>
                                    <tr class="info-actions-red">
                                        <td></td>
                                        <td class="info-data-red"></td>
                                    </tr>
                                    <tr class="info-upgrades">
                                        <td class="info-header">Upgrades</td>
                                        <td class="info-data"></td>
                                    </tr>
                                </tbody>
                            </table>
                            <p class="info-text" />
                        </div>
                    </div>
                </div>
            </div>
        """

        @card_selector_container = $ @container.find('.xwing-card-browser .card-selector-container')
        @card_viewer_container = $ @container.find('.xwing-card-browser .card-viewer-container')
        @card_viewer_container.hide()
        @card_viewer_placeholder = $ @container.find('.xwing-card-browser .card-viewer-placeholder')

        @sort_selector = $ @container.find('select.sort-by')
        @sort_selector.select2
            minimumResultsForSearch: -1

    setupHandlers: () ->
        @sort_selector.change (e) =>
            @renderList @sort_selector.val()

        $(window).on 'xwing:afterLanguageLoad', (e, language, cb=$.noop) =>
            @language = language
            @prepareData()
            @renderList @sort_selector.val()

    prepareData: () ->
        @all_cards = []

        for type in TYPES
            if type == 'upgrades'
                @all_cards = @all_cards.concat ( { name: card_data.name, type: exportObj.translate(@language, 'ui', 'upgradeHeader', card_data.slot), data: card_data, orig_type: card_data.slot } for card_name, card_data of exportObj[type] )
            else
                @all_cards = @all_cards.concat ( { name: card_data.name, type: exportObj.translate(@language, 'singular', type), data: card_data, orig_type: exportObj.translate('English', 'singular', type) } for card_name, card_data of exportObj[type] )

        @types = (exportObj.translate(@language, 'types', type) for type in [ 'Pilot', 'Modification', 'Title' ])
        for card_name, card_data of exportObj.upgrades
            upgrade_text = exportObj.translate @language, 'ui', 'upgradeHeader', card_data.slot
            @types.push upgrade_text if upgrade_text not in @types

        @all_cards.sort byName

        @sources = []
        for card in @all_cards
            for source in card.data.sources
                @sources.push(source) if source not in @sources

        sorted_types = @types.sort()
        sorted_sources = @sources.sort()

        @cards_by_type_name = {}
        for type in sorted_types
            @cards_by_type_name[type] = ( card for card in @all_cards when card.type == type ).sort byName

        @cards_by_type_points = {}
        for type in sorted_types
            @cards_by_type_points[type] = ( card for card in @all_cards when card.type == type ).sort byPoints

        @cards_by_source = {}
        for source in sorted_sources
            @cards_by_source[source] = ( card for card in @all_cards when source in card.data.sources ).sort byName


    renderList: (sort_by='name') ->
        # sort_by is one of `name`, `type-by-name`, `source`, `type-by-points`
        #
        # Renders multiselect to container
        # Selects previously selected card if there is one
        @card_selector.remove() if @card_selector?
        @card_selector = $ document.createElement('SELECT')
        @card_selector.addClass 'card-selector'
        @card_selector.attr 'size', 25
        @card_selector_container.append @card_selector

        switch sort_by
            when 'type-by-name'
                for type in @types
                    optgroup = $ document.createElement('OPTGROUP')
                    optgroup.attr 'label', type
                    @card_selector.append optgroup

                    for card in @cards_by_type_name[type]
                        @addCardTo optgroup, card
            when 'type-by-points'
                for type in @types
                    optgroup = $ document.createElement('OPTGROUP')
                    optgroup.attr 'label', type
                    @card_selector.append optgroup

                    for card in @cards_by_type_points[type]
                        @addCardTo optgroup, card
            when 'source'
                for source in @sources
                    optgroup = $ document.createElement('OPTGROUP')
                    optgroup.attr 'label', source
                    @card_selector.append optgroup

                    for card in @cards_by_source[source]
                        @addCardTo optgroup, card
            else
                for card in @all_cards
                    @addCardTo @card_selector, card

        @card_selector.change (e) =>
            @renderCard $(@card_selector.find(':selected'))

    renderCard: (card) ->
        # Renders card to card container
        name = card.data 'name'
        type = card.data 'type'
        data = card.data 'card'
        orig_type = card.data 'orig_type'

        @card_viewer_container.find('.info-name').html """#{if data.unique then "&middot;&nbsp;" else ""}#{name} (#{data.points})#{if data.limited? then " (#{exportObj.translate(@language, 'ui', 'limited')})" else ""}#{if data.epic? then " (#{exportObj.translate(@language, 'ui', 'epic')})" else ""}#{if exportObj.isReleased(data) then "" else " (#{exportObj.translate(@language, 'ui', 'unreleased')})"}"""
        @card_viewer_container.find('p.info-text').html data.text ? ''
        @card_viewer_container.find('.info-sources').text (exportObj.translate(@language, 'sources', source) for source in data.sources).sort().join(', ')
        switch orig_type
            when 'Pilot'
                ship = exportObj.ships[data.ship]
                @card_viewer_container.find('.info-type').text "#{data.ship} Pilot (#{data.faction})"
                @card_viewer_container.find('tr.info-skill td.info-data').text data.skill
                @card_viewer_container.find('tr.info-skill').show()

                @card_viewer_container.find('tr.info-attack td.info-data').text(data.ship_override?.attack ? ship.attack)
                @card_viewer_container.find('tr.info-attack-bullseye td.info-data').text(ship.attackbull)
                @card_viewer_container.find('tr.info-attack-fullfront td.info-data').text(ship.attackf)
                @card_viewer_container.find('tr.info-attack-back td.info-data').text(ship.attackb)
                @card_viewer_container.find('tr.info-attack-turret td.info-data').text(ship.attackt)
                @card_viewer_container.find('tr.info-attack-doubleturret td.info-data').text(ship.attackdt)

                @card_viewer_container.find('tr.info-attack').toggle(ship.attack?)
                @card_viewer_container.find('tr.info-attack-bullseye').toggle(ship.attackbull?)
                @card_viewer_container.find('tr.info-attack-fullfront').toggle(ship.attackf?)
                @card_viewer_container.find('tr.info-attack-back').toggle(ship.attackb?)
                @card_viewer_container.find('tr.info-attack-turret').toggle(ship.attackt?)
                @card_viewer_container.find('tr.info-attack-doubleturret').toggle(ship.attackdt?)
                
                
                
                for cls in @card_viewer_container.find('tr.info-attack td.info-header i.xwing-miniatures-font')[0].classList
                    @card_viewer_container.find('tr.info-attack td.info-header i.xwing-miniatures-font').removeClass(cls) if cls.startsWith('xwing-miniatures-font-attack')
                @card_viewer_container.find('tr.info-attack td.info-header i.xwing-miniatures-font').addClass(ship.attack_icon ? 'xwing-miniatures-font-attack')

                @card_viewer_container.find('tr.info-energy td.info-data').text(data.ship_override?.energy ? ship.energy)
                @card_viewer_container.find('tr.info-energy').toggle(data.ship_override?.energy? or ship.energy?)
                @card_viewer_container.find('tr.info-range').hide()
                @card_viewer_container.find('tr.info-agility td.info-data').text(data.ship_override?.agility ? ship.agility)
                @card_viewer_container.find('tr.info-agility').show()
                @card_viewer_container.find('tr.info-hull td.info-data').text(data.ship_override?.hull ? ship.hull)
                @card_viewer_container.find('tr.info-hull').show()
                @card_viewer_container.find('tr.info-shields td.info-data').text(data.ship_override?.shields ? ship.shields)
                @card_viewer_container.find('tr.info-shields').show()

                if ship.force?
                    @card_viewer_container.find('tr.info-force td.info-data').html (ship.force + '<i class="xwing-miniatures-font xwing-miniatures-font-recurring"></i>') 
                    @card_viewer_container.find('tr.info-force td.info-header').show()
                    @card_viewer_container.find('tr.info-force').show()
                else
                    @card_viewer_container.find('tr.info-force').hide() 

                if ship.charge?
                    if data.recurring?
                        @card_viewer_container.find('tr.info-charge td.info-data').html (ship.charge + '<i class="xwing-miniatures-font xwing-miniatures-font-recurring"></i>')
                    else
                        @card_viewer_container.find('tr.info-charge td.info-data').text ship.charge
                    @card_viewer_container.find('tr.info-charge').show()
                else
                    @card_viewer_container.find('tr.info-charge').hide()

                @card_viewer_container.find('tr.info-actions td.info-data').html (exportObj.translate(@language, 'action', action) for action in exportObj.ships[data.ship].actions).join(' ')
                @card_viewer_container.find('tr.info-actions').show()

                if ships[data.ship].actionsred?
                    @card_viewer_container.find('tr.info-actions-red td.info-data').html (exportObj.translate(@language, 'action', action) for action in exportObj.ships[data.ship].actionsred).join(' ')
                    @card_viewer_container.find('tr.info-actions-red').show()
                else
                    @card_viewer_container.find('tr.info-actions-red').hide()

                @card_viewer_container.find('tr.info-upgrades').show()
                @card_viewer_container.find('tr.info-upgrades td.info-data').text((exportObj.translate(@language, 'slot', slot) for slot in data.slots).join(', ') or 'None')
            else
                @card_viewer_container.find('.info-type').text type
                @card_viewer_container.find('.info-type').append " &ndash; #{data.faction} only" if data.faction?
                @card_viewer_container.find('tr.info-ship').hide()
                @card_viewer_container.find('tr.info-skill').hide()
                if data.energy?
                    @card_viewer_container.find('tr.info-energy td.info-data').text data.energy
                    @card_viewer_container.find('tr.info-energy').show()
                else
                    @card_viewer_container.find('tr.info-energy').hide()
                if data.attack?
                    @card_viewer_container.find('tr.info-attack td.info-data').text data.attack
                    @card_viewer_container.find('tr.info-attack').show()
                else
                    @card_viewer_container.find('tr.info-attack').hide()
                if data.attackbull?
                    @card_viewer_container.find('tr.info-attack-bullseye td.info-data').text data.attackbull
                    @card_viewer_container.find('tr.info-attack-bullseye').show()
                else
                    @card_viewer_container.find('tr.info-attack-bullseye').hide()
                if data.attackt?
                    @card_viewer_container.find('tr.info-attack-turret td.info-data').text data.attackt
                    @card_viewer_container.find('tr.info-attack-turret').show()
                else
                    @card_viewer_container.find('tr.info-attack-turret').hide()
                if data.range?
                    @card_viewer_container.find('tr.info-range td.info-data').text data.range
                    @card_viewer_container.find('tr.info-range').show()
                else
                    @card_viewer_container.find('tr.info-range').hide()

                if data.force?
                    @card_viewer_container.find('tr.info-force td.info-data').html (data.force + '<i class="xwing-miniatures-font xwing-miniatures-font-recurring"></i>') 
                    @card_viewer_container.find('tr.info-force td.info-header').show()
                    @card_viewer_container.find('tr.info-force').show()
                else
                    @card_viewer_container.find('tr.info-force').hide() 

                if data.charge?
                    if data.recurring?
                        @card_viewer_container.find('tr.info-charge td.info-data').html (data.charge + '<i class="xwing-miniatures-font xwing-miniatures-font-recurring"></i>')
                    else
                        @card_viewer_container.find('tr.info-charge td.info-data').text data.charge
                    @card_viewer_container.find('tr.info-charge').show()
                else
                    @card_viewer_container.find('tr.info-charge').hide()
                    
                    
                @card_viewer_container.find('tr.info-attack-fullfront').hide()
                @card_viewer_container.find('tr.info-attack-back').hide()
                @card_viewer_container.find('tr.info-attack-doubleturret').hide()
                @card_viewer_container.find('tr.info-agility').hide()
                @card_viewer_container.find('tr.info-hull').hide()
                @card_viewer_container.find('tr.info-shields').hide()
                @card_viewer_container.find('tr.info-actions').hide()
                @card_viewer_container.find('tr.info-actions-red').hide()
                @card_viewer_container.find('tr.info-upgrades').hide()

        @card_viewer_container.show()
        @card_viewer_placeholder.hide()

    addCardTo: (container, card) ->
        option = $ document.createElement('OPTION')
        option.text "#{card.name} (#{card.data.points})"
        option.data 'name', card.name
        option.data 'type', card.type
        option.data 'card', card.data
        option.data 'orig_type', card.orig_type
        $(container).append option

# This must be loaded before any of the card language modules!
exportObj = exports ? this

exportObj.unreleasedExpansions = [
]

exportObj.isReleased = (data) ->
    for source in data.sources
        return true if source not in exportObj.unreleasedExpansions
    false

String::canonicalize = ->
    this.toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .replace(/\s+/g, '-')

exportObj.hugeOnly = (ship) ->
    ship.data.huge ? false

# Returns an independent copy of the data which can be modified by translation
# modules.
exportObj.basicCardData = ->
    ships:
        "X-Wing":
            name: "X-Wing"
            xws: "T-65 X-Wing".canonicalize()
            factions: [ "Rebel Alliance", ]
            attack: 3
            agility: 2
            hull: 4
            shields: 2
            actions: [
                "Focus"
                "Target Lock"
                "Barrel Roll"
            ]
            actionsred: [
            ]
            maneuvers: [
              [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
              [ 0, 2, 2, 2, 0, 0, 0, 0, 0, 0]
              [ 1, 2, 2, 2, 1, 0, 0, 0, 0, 0]
              [ 1, 1, 1, 1, 1, 0, 0, 0, 3, 3]
              [ 0, 0, 1, 0, 0, 3, 0, 0, 0, 0]
            ]
        "Y-Wing":
            name: "Y-Wing"
            xws: "BTL-A4 Y-Wing".canonicalize()
            factions: [ "Rebel Alliance", "Scum and Villainy" ]
            attack: 2
            agility: 1
            hull: 6
            shields: 2
            actions: [
                "Focus"
                "Target Lock"
            ]
            actionsred: [
                "Barrel Roll"
                "Reload"
            ]
            maneuvers: [
              [ 0, 0, 0, 0, 0, 0]
              [ 0, 2, 2, 2, 0, 0]
              [ 1, 1, 2, 1, 1, 0]
              [ 3, 1, 1, 1, 3, 0]
              [ 0, 0, 3, 0, 0, 3]
            ]
        "A-Wing":
            name: "A-Wing"
            xws: "RZ-1 A-Wing".canonicalize()
            factions: [ "Rebel Alliance" ]
            attack: 2
            agility: 3
            hull: 2
            shields: 2
            actions: [
                "Focus"
                "Evade"
                "Target Lock"
                "Barrel Roll"
                "Boost"
            ]
            actionsred: [
            ]
            maneuvers: [
              [ 0, 0, 0, 0, 0, 0, 0, 0]
              [ 1, 0, 0, 0, 1, 0, 0, 0]
              [ 2, 2, 2, 2, 2, 0, 0, 0]
              [ 1, 1, 2, 1, 1, 0, 3, 3]
              [ 0, 0, 2, 0, 0, 0, 0, 0]
              [ 0, 0, 2, 0, 0, 3, 0, 0]
            ]
        "YT-1300":
            name: "YT-1300"
            xws: "Modified YT-1300 Light Freighter".canonicalize()
            factions: [ "Rebel Alliance" ]
            attackdt: 3
            agility: 1
            hull: 8
            shields: 5
            actions: [
                "Focus"
                "Target Lock"
                "Rotate Arc"
            ]
            actionsred: [
                "Boost"
            ]
            maneuvers: [
              [ 0, 0, 0, 0, 0, 0, 0, 0]
              [ 0, 1, 2, 1, 0, 0, 0, 0]
              [ 1, 2, 2, 2, 1, 0, 0, 0]
              [ 1, 1, 2, 1, 1, 0, 3, 3]
              [ 0, 0, 1, 0, 0, 3, 0, 0]
            ]
            large: true
        "YT-1300 (Scum)":
            name: "YT-1300 (Scum)"
            canonical_name: 'YT-1300'.canonicalize()
            xws: "Customized YT-1300 Light Freighter".canonicalize()
            factions: [ "Scum and Villainy" ]
            attackdt: 2
            agility: 1
            hull: 8
            shields: 3
            actions: [
                "Focus"
                "Target Lock"
                "Rotate Arc"
            ]
            actionsred: [
                "Boost"
            ]
            maneuvers: [
              [ 0, 0, 0, 0, 0, 0, 0, 0]
              [ 0, 1, 2, 1, 0, 0, 0, 0]
              [ 1, 2, 2, 2, 1, 0, 0, 0]
              [ 1, 1, 2, 1, 1, 0, 3, 3]
              [ 0, 0, 1, 0, 0, 3, 0, 0]
            ]
            large: true
        "TIE Fighter":
            name: "TIE Fighter"
            xws: "TIE/LN Fighter".canonicalize()
            factions: ["Rebel Alliance", "Galactic Empire"]
            attack: 2
            agility: 3
            hull: 3
            shields: 0
            actions: [
                "Focus"
                "Barrel Roll"
                "Evade"
            ]
            actionsred: [
            ]
            maneuvers: [
              [ 0, 0, 0, 0, 0, 0]
              [ 1, 0, 0, 0, 1, 0]
              [ 1, 2, 2, 2, 1, 0]
              [ 1, 1, 2, 1, 1, 3]
              [ 0, 0, 1, 0, 0, 3]
              [ 0, 0, 1, 0, 0, 0]
            ]
        "TIE Advanced":
            name: "TIE Advanced"
            xws: "TIE Advanced X1".canonicalize()
            factions: [ "Galactic Empire" ]
            attack: 2
            agility: 3
            hull: 3
            shields: 2
            actions: [
                "Focus" 
                "<r>> Barrel Roll</r>"
                "Target Lock"
                "Barrel Roll"
            ]
            actionsred: [
            ]
            maneuvers: [
              [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
              [ 0, 2, 1, 2, 0, 0, 0, 0, 0, 0]
              [ 1, 2, 2, 2, 1, 0, 0, 0, 0, 0]
              [ 1, 1, 2, 1, 1, 0, 0, 0, 3, 3]
              [ 0, 0, 1, 0, 0, 3, 0, 0, 0, 0]
              [ 0, 0, 1, 0, 0, 0, 0, 0, 0, 0]
            ]
        "TIE Interceptor":
            name: "TIE Interceptor"
            xws: "TIE Interceptor".canonicalize()
            factions: [ "Galactic Empire" ]
            attack: 3
            agility: 3
            hull: 3
            shields: 0
            actions: [
                "Focus"
                "Barrel Roll"
                "Boost"
                "Evade"
            ]
            actionsred: [
            ]
            maneuvers: [
              [ 0, 0, 0, 0, 0, 0, 0, 0]
              [ 1, 0, 0, 0, 1, 0, 0, 0]
              [ 2, 2, 2, 2, 2, 0, 0, 0]
              [ 1, 1, 2, 1, 1, 0, 3, 3]
              [ 0, 0, 2, 0, 0, 3, 0, 0]
              [ 0, 0, 1, 0, 0, 0, 0, 0]
            ]
        "Firespray-31":
            name: "Firespray-31"
            xws: "Firespray-Class Patrol Craft".canonicalize()
            factions: [ "Scum and Villainy", ]
            attack: 3
            attackb: 3
            agility: 2
            hull: 6
            shields: 4
            actions: [
                "Focus"
                "Target Lock"
                "Boost"
            ]
            actionsred: [
                "Reinforce"
            ]
            maneuvers: [
              [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
              [ 1, 2, 2, 2, 1, 0, 0, 0, 0, 0]
              [ 1, 1, 2, 1, 1, 0, 0, 0, 0, 0]
              [ 0, 1, 2, 1, 0, 0, 0, 0, 3, 3]
              [ 0, 0, 1, 0, 0, 3, 0, 0, 0, 0]
            ]
            medium: true
        "HWK-290":
            name: "HWK-290"
            xws: "Hwk-290 Light Freighter".canonicalize()
            factions: [ "Rebel Alliance", "Scum and Villainy" ]
            attackt: 2
            agility: 2
            hull: 3
            shields: 2
            actions: [
                "Focus"
                "<r>> Rotate Arc</r>"
                "Target Lock" 
                "<r>> Rotate Arc</r>"
                "Rotate Arc"
            ]
            actionsred: [
                "Boost"
                "Jam"
            ]
            maneuvers: [
              [ 0, 0, 3, 0, 0]
              [ 0, 2, 2, 2, 0]
              [ 1, 1, 2, 1, 1]
              [ 3, 1, 1, 1, 3]
              [ 0, 0, 3, 0, 0]
            ]
        "Lambda-Class Shuttle":
            name: "Lambda-Class Shuttle"
            xws: "Lambda-Class T-4a Shuttle".canonicalize()
            factions: [ "Galactic Empire", ]
            attack: 3
            attackb: 2
            agility: 1
            hull: 6
            shields: 4
            actions: [
                "Focus"
                "Coordinate"
                "Reinforce"
            ]
            actionsred: [
                "Jam"
            ]
            maneuvers: [
              [ 0, 0, 3, 0, 0]
              [ 0, 2, 2, 2, 0]
              [ 3, 1, 2, 1, 3]
              [ 0, 3, 1, 3, 0]
            ]
            large: true
        "B-Wing":
            name: "B-Wing"
            xws: "A/SF-01 B-Wing".canonicalize()
            factions: [ "Rebel Alliance", ]
            attack: 3
            agility: 1
            hull: 4
            shields: 4
            actions: [
                "Focus"
                "<r>> Barrel Roll</r>"
                "Target Lock"
                "Barrel Roll"
            ]
            actionsred: [
            ]
            maneuvers: [
              [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
              [ 3, 2, 2, 2, 3, 0, 0, 0, 3, 3]
              [ 1, 1, 2, 1, 1, 3, 0, 0, 0, 0]
              [ 0, 3, 1, 3, 0, 0, 0, 0, 0, 0]
              [ 0, 0, 3, 0, 0, 0, 0, 0, 0, 0]
            ]
        "TIE Bomber":
            name: "TIE Bomber"
            xws: "TIE/SA Bomber".canonicalize()
            factions: [ "Galactic Empire", ]
            attack: 2
            agility: 2
            hull: 6
            shields: 0
            actions: [
                "Focus"
                "Target Lock"
                "Barrel Roll"
                "<r>> Target Lock</r>"
            ]
            actionsred: [
                "Reload"
            ]
            maneuvers: [
              [ 0, 0, 0, 0, 0, 0]
              [ 0, 1, 2, 1, 0, 0]
              [ 1, 2, 2, 2, 1, 0]
              [ 1, 1, 2, 1, 1, 3]
              [ 0, 0, 1, 0, 0, 0]
              [ 0, 0, 0, 0, 0, 3]
            ]
        "Z-95 Headhunter":
            name: "Z-95 Headhunter"
            xws: "Z-95-AF4 Headhunter".canonicalize()
            factions: [ "Rebel Alliance", "Scum and Villainy", ]
            attack: 2
            agility: 2
            hull: 2
            shields: 2
            actions: [
                "Focus"
                "Target Lock"
                "Barrel Roll"
            ]
            actionsred: [
                "Barrel Roll"
            ]
            maneuvers: [
              [ 0, 0, 0, 0, 0, 0]
              [ 0, 1, 2, 1, 0, 0]
              [ 1, 2, 2, 2, 1, 0]
              [ 1, 1, 1, 1, 1, 3]
              [ 0, 0, 1, 0, 0, 3]
            ]
        "TIE Defender":
            name: "TIE Defender"
            xws: "TIE/D Defender".canonicalize()
            factions: [ "Galactic Empire", ]
            attack: 3
            agility: 3
            hull: 3
            shields: 4
            actions: [
                "Focus"
                "Evade"
                "Target Lock"
                "Barrel Roll"
                "Boost"
            ]
            actionsred: [
            ]
            maneuvers: [
              [ 0, 0, 0, 0, 0, 0]
              [ 3, 2, 0, 2, 3, 0]
              [ 3, 1, 2, 1, 3, 3]
              [ 1, 1, 2, 1, 1, 0]
              [ 0, 0, 2, 0, 0, 1]
              [ 0, 0, 2, 0, 0, 0]
            ]
        "E-Wing":
            name: "E-Wing"
            xws: "E-Wing".canonicalize()
            factions: [ "Rebel Alliance", ]
            attack: 3
            agility: 3
            hull: 3
            shields: 3
            actions: [
                "Focus"
                "Evade"
                "Target Lock"
                "Barrel Roll"
                "<r>> Target Lock</r>"
                "Boost"
                "<r>> Target Lock</r>"
            ]
            actionsred: [
            ]
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0, 0, 0 ]
                [ 3, 2, 2, 2, 3, 0, 0, 0 ]
                [ 1, 1, 2, 1, 1, 0, 0, 0 ]
                [ 1, 1, 2, 1, 1, 0, 3, 3 ]
                [ 0, 0, 1, 0, 0, 3, 0, 0 ]
                [ 0, 0, 1, 0, 0, 0, 0, 0 ]
            ]
        "TIE Phantom":
            name: "TIE Phantom"
            xws: "TIE/PH Phantom".canonicalize()
            factions: [ "Galactic Empire", ]
            attack: 3
            agility: 2
            hull: 3
            shields: 2
            actions: [
                "Focus"
                "Evade"
                "Barrel Roll"
                "Cloak"
            ]
            actionsred: [
            ]
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0]
                [ 1, 1, 0, 1, 1, 0]
                [ 1, 2, 2, 2, 1, 0]
                [ 1, 1, 2, 1, 1, 3]
                [ 0, 0, 1, 0, 0, 3]
            ]
        "YT-2400":
            name: "YT-2400"
            xws: "YT-2400 Light Freighter".canonicalize()
            factions: [ "Rebel Alliance", ]
            attackdt: 4
            agility: 2
            hull: 6
            shields: 4
            actions: [
                "Focus"
                "Target Lock"
                "Rotate Arc"
            ]
            actionsred: [
                "Barrel Roll"
            ]
            large: true
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0]
                [ 1, 2, 2, 2, 1, 0]
                [ 1, 1, 2, 1, 1, 0]
                [ 1, 1, 1, 1, 1, 0]
                [ 0, 0, 1, 0, 0, 3]
            ]
        "VT-49 Decimator":
            name: "VT-49 Decimator"
            xws: "VT-49 Decimator".canonicalize()
            factions: [ "Galactic Empire", ]
            attackdt: 3
            agility: 0
            hull: 12
            shields: 4
            actions: [
                "Focus"
                "Target Lock"
                "Reinforce"
                "Rotate Arc"
            ]
            actionsred: [
                "Coordinate"
            ]
            large: true
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0]
                [ 3, 2, 2, 2, 3, 0]
                [ 1, 1, 2, 1, 1, 0]
                [ 1, 1, 1, 1, 1, 0]
                [ 0, 0, 1, 0, 0, 0]
            ]
        "StarViper":
            name: "StarViper"
            xws: "Starviper-class Attack Platform".canonicalize()
            factions: ["Scum and Villainy"]
            attack: 3
            agility: 3
            hull: 4
            shields: 1
            actions: [
                "Focus"
                "Target Lock"
                "Barrel Roll"
                "<r>> Focus</r>"
                "Boost"
                "<r>> Focus</r>"
            ]
            actionsred: [
            ]
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0, 0, 0]
                [ 1, 2, 2, 2, 1, 0, 0, 0]
                [ 1, 2, 2, 2, 1, 0, 0, 0]
                [ 0, 1, 2, 1, 0, 0, 3, 3]
                [ 0, 0, 1, 0, 0, 0, 0, 0]
            ]
        "M3-A Interceptor":
            name: "M3-A Interceptor"
            xws: "M3-A Interceptor".canonicalize()
            factions: [ "Scum and Villainy" ]
            attack: 2
            agility: 3
            hull: 3
            shields: 1
            actions: [
                "Focus"
                "Evade"
                "Target Lock"
                "Barrel Roll"
            ]
            actionsred: [
            ]
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0 ]
                [ 1, 2, 0, 2, 1, 0 ]
                [ 1, 1, 2, 1, 1, 0 ]
                [ 0, 1, 2, 1, 0, 3 ]
                [ 0, 0, 1, 0, 0, 0 ]
                [ 0, 0, 1, 0, 0, 3 ]
            ]
        "Aggressor":
            name: "Aggressor"
            xws: "Aggressor Assault Fighter".canonicalize()
            factions: [ "Scum and Villainy" ]
            attack: 3
            agility: 3
            hull: 5
            shields: 3
            actions: [
                "Calculate"
                "Evade"
                "Target Lock"
                "Boost"
            ]
            actionsred: [
            ]
            medium: true
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0, 0, 0 ]
                [ 1, 2, 2, 2, 1, 0, 0, 0 ]
                [ 1, 2, 2, 2, 1, 0, 0, 0 ]
                [ 0, 2, 2, 2, 0, 0, 3, 3 ]
                [ 0, 0, 1, 0, 0, 3, 0, 0 ]
            ]
        "YV-666":
            name: "YV-666"
            xws: "YV-666 Light Freighter".canonicalize()
            factions: [ "Scum and Villainy" ]
            attackf: 3
            agility: 1
            hull: 9
            shields: 3
            large: true
            actions: [
                "Focus"
                "Reinforce"
                "Target Lock"
            ]
            actionsred: [
            ]
            maneuvers: [
                [ 0, 0, 3, 0, 0, 0 ]
                [ 0, 2, 2, 2, 0, 0 ]
                [ 3, 1, 2, 1, 3, 0 ]
                [ 1, 1, 2, 1, 1, 0 ]
                [ 0, 0, 1, 0, 0, 0 ]
            ]
        "Kihraxz Fighter":
            name: "Kihraxz Fighter"
            xws: "Kihraxz Fighter".canonicalize()
            factions: ["Scum and Villainy"]
            attack: 3
            agility: 2
            hull: 5
            shields: 1
            actions: [
                "Focus"
                "Target Lock"
                "Barrel Roll"
            ]
            actionsred: [
            ]
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
                [ 1, 2, 0, 2, 1, 0, 0, 0, 0, 0 ]
                [ 1, 2, 2, 2, 1, 0, 0, 0, 3, 3 ]
                [ 0, 1, 2, 1, 0, 0, 0, 0, 0, 0 ]
                [ 0, 0, 1, 0, 0, 3, 0, 0, 0, 0 ]
            ]
        "K-Wing":
            name: "K-Wing"
            xws: "BTL-S8 K-Wing".canonicalize()
            factions: ["Rebel Alliance"]
            attackdt: 2
            agility: 1
            hull: 6
            shields: 3
            medium: true
            actions: [
                "Focus"
                "Target Lock"
                "Slam"
                "Rotate Arc"
                "Reload"
            ]
            actionsred: [
            ]
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0 ]
                [ 0, 2, 2, 2, 0, 0 ]
                [ 1, 1, 2, 1, 1, 0 ]
                [ 0, 1, 1, 1, 0, 0 ]
            ]
        "TIE Punisher":
            name: "TIE Punisher"
            xws: "TIE/CA Punisher".canonicalize()
            factions: ["Galactic Empire"]
            attack: 2
            agility: 1
            hull: 6
            shields: 3
            medium: true
            actions: [
                "Focus"
                "Target Lock"
                "Boost" 
                "<r>> Target Lock</r>"
                "Reload"
            ]
            actionsred: [
                "Barrel Roll"
            ]
            maneuvers: [
                [ 0, 0, 3, 0, 0, 0 ]
                [ 0, 2, 2, 2, 0, 0 ]
                [ 1, 1, 2, 1, 1, 0 ]
                [ 3, 1, 1, 1, 3, 0 ]
                [ 0, 0, 0, 0, 0, 3 ]
            ]
        "VCX-100":
            name: "VCX-100"
            xws: "VCX-100 Light Freighter".canonicalize()
            factions: ["Rebel Alliance"]
            attack: 4
            agility: 0
            hull: 10
            shields: 4
            large: true
            actions: [
                "Focus"
                "Target Lock"
                "Reinforce"
            ]
            actionsred: [
            ]
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0 ]
                [ 3, 1, 2, 1, 3, 0 ]
                [ 1, 2, 2, 2, 1, 0 ]
                [ 3, 1, 1, 1, 3, 0 ]
                [ 0, 0, 1, 0, 0, 3 ]
            ]
        "Attack Shuttle":
            name: "Attack Shuttle"
            xws: "Attack Shuttle".canonicalize()
            factions: ["Rebel Alliance"]
            attack: 3
            agility: 2
            hull: 3
            shields: 1
            actions: [
                "Focus"
                "Evade"
                "Barrel Roll"
                "<r>> Evade</r>"
            ]
            actionsred: [
            ]
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0 ]
                [ 3, 2, 2, 2, 3, 0 ]
                [ 1, 1, 2, 1, 1, 0 ]
                [ 3, 1, 1, 1, 3, 0 ]
                [ 0, 0, 1, 0, 0, 3 ]
            ]
        "TIE Advanced Prototype":
            name: "TIE Advanced Prototype"
            xws: "TIE Advanced V1".canonicalize()
            factions: ["Galactic Empire"]
            attack: 2
            agility: 3
            hull: 2
            shields: 2
            actions: [
                "Focus"
                "Evade"
                "Target Lock"
                "Barrel Roll"
                "<r>> Focus</r>"
                "Boost"
                "<r>> Focus</r>"
            ]
            actionsred: [
            ]
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
                [ 2, 2, 0, 2, 2, 0, 0, 0, 0, 0 ]
                [ 1, 1, 2, 1, 1, 0, 0, 0, 3, 3 ]
                [ 1, 1, 2, 1, 1, 0, 0, 0, 0, 0 ]
                [ 0, 0, 2, 0, 0, 3, 0, 0, 0, 0 ]
                [ 0, 0, 1, 0, 0, 0, 0, 0, 0, 0 ]
            ]
        "G-1A Starfighter":
            name: "G-1A Starfighter"
            xws: "G-1A Starfighter".canonicalize()
            factions: ["Scum and Villainy"]
            attack: 3
            agility: 1
            hull: 5
            shields: 4
            medium: true
            actions: [
                "Focus"
                "Target Lock"
                "Jam"
            ]
            actionsred: [
            ]
            maneuvers: [
                [ 0, 0, 3, 0, 0, 0 ]
                [ 3, 2, 2, 2, 3, 0 ]
                [ 1, 1, 2, 1, 1, 3 ]
                [ 0, 3, 1, 3, 0, 0 ]
                [ 0, 0, 3, 0, 0, 3 ]
            ]
        "JumpMaster 5000":
            name: "JumpMaster 5000"
            xws: "JumpMaster 5000".canonicalize()
            factions: ["Scum and Villainy"]
            large: true
            attackt: 2
            agility: 2
            hull: 6
            shields: 3
            actions: [
                "Focus"
                "<r>> Rotate Arc</r>"
                "Target Lock"
                "<r>> Rotate Arc</r>"
            ]
            actionsred: [
                "Barrel Roll"
            ]
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0, 0, 0 ]
                [ 1, 2, 2, 1, 3, 0, 0, 0 ]
                [ 1, 2, 2, 1, 3, 0, 0, 0 ]
                [ 0, 2, 2, 1, 0, 0, 3, 0 ]
                [ 0, 0, 1, 0, 0, 3, 0, 0 ]
            ]
        "ARC-170":
            name: "ARC-170"
            xws: "Arc-170 Starfighter".canonicalize()
            factions: ["Rebel Alliance"]
            attack: 3
            attackb: 2
            agility: 1
            hull: 6
            shields: 3
            medium: true
            actions: [
                "Focus"
                "Target Lock"
            ]
            actionsred: [
                "Barrel Roll"
            ]
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0 ]
                [ 0, 2, 2, 2, 0, 0 ]
                [ 1, 2, 2, 2, 1, 0 ]
                [ 3, 1, 1, 1, 3, 0 ]
                [ 0, 0, 3, 0, 0, 3 ]
            ]
        "Fang Fighter":
            name: "Fang Fighter"
            canonical_name: 'Protectorate Starfighter'.canonicalize()
            xws: "Fang fighter".canonicalize()
            factions: ["Scum and Villainy"]
            attack: 3
            agility: 3
            hull: 4
            shields: 0
            actions: [
                "Focus"
                "Target Lock"
                "Barrel Roll"
                "<r>> Focus</r>"
                "Boost"
                "<r>> Focus</r>"
            ]
            actionsred: [
            ]
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
                [ 1, 0, 0, 0, 1, 0, 0, 0, 0, 0 ]
                [ 2, 2, 2, 2, 2, 0, 0, 0, 3, 3 ]
                [ 1, 1, 2, 1, 1, 0, 0, 0, 0, 0 ]
                [ 0, 0, 1, 0, 0, 3, 0, 0, 0, 0 ]
                [ 0, 0, 1, 0, 0, 0, 0, 0, 0, 0 ]
            ]
        "Lancer-class Pursuit Craft":
            name: "Lancer-class Pursuit Craft"
            xws: "Lancer-class Pursuit Craft".canonicalize()
            factions: ["Scum and Villainy"]
            large: true
            attack: 3
            attackt: 2
            agility: 2
            hull: 8
            shields: 2
            actions: [
                "Focus"
                "Evade"
                "Target Lock"
                "Rotate Arc"
            ]
            actionsred: [
            ]
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0]
                [ 0, 1, 1, 1, 0, 0]
                [ 1, 1, 2, 1, 1, 0]
                [ 2, 2, 2, 2, 2, 0]
                [ 0, 0, 2, 0, 0, 0]
                [ 0, 0, 1, 0, 0, 3]
            ]
        "Quadjumper":
            name: "Quadjumper"
            xws: "Quadrijet Transfer Spacetug".canonicalize()
            factions: ["Scum and Villainy"]
            attack: 2
            agility: 2
            hull: 5
            shields: 0
            actions: [
                "Barrel Roll"
                "Focus"
            ]
            actionsred: [
                "Evade"
            ]
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
                [ 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 3, 0, 3 ]
                [ 1, 2, 2, 2, 1, 0, 3, 3, 0, 0, 0, 3, 0 ]
                [ 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
            ]
        "U-Wing":
            name: "U-Wing"
            xws: "UT-60D U-Wing".canonicalize()
            factions: ["Rebel Alliance"]
            medium: true
            attack: 3
            agility: 2
            hull: 5
            shields: 3
            actions: [
                "Focus"
                "Target Lock"
            ]
            actionsred: [
                "Coordinate"
            ]
            maneuvers: [
                [ 0, 0, 3, 0, 0 ]
                [ 0, 2, 2, 2, 0 ]
                [ 1, 2, 2, 2, 1 ]
                [ 0, 1, 1, 1, 0 ]
                [ 0, 0, 1, 0, 0 ]
            ]
        "TIE Striker":
            name: "TIE Striker"
            xws: "TIE/SK Striker".canonicalize()
            factions: ["Galactic Empire"]
            attack: 3
            agility: 2
            hull: 4
            shields: 0
            actions: [
                "Focus"
                "Evade"
                "Barrel Roll"
            ]
            actionsred: [
            ]
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0, 0, 0 ]
                [ 1, 2, 2, 2, 1, 3, 0, 0 ]
                [ 1, 2, 2, 2, 1, 0, 3, 3 ]
                [ 0, 1, 2, 1, 0, 0, 0, 0 ]
            ]
        "Auzituck Gunship":
            name: "Auzituck Gunship"
            xws: "Auzituck Gunship".canonicalize()
            factions: ["Rebel Alliance"]
            attackf: 3
            agility: 1
            hull: 6
            shields: 2
            actions: [
                "Focus"
                "Reinforce"
            ]
            actionsred: [
                "Barrel Roll"
            ]
            maneuvers: [
                [ 0, 0, 3, 0, 0, 0, 0, 0 ]
                [ 0, 2, 2, 2, 0, 0, 0, 0 ]
                [ 1, 1, 2, 1, 1, 0, 0, 0 ]
                [ 1, 1, 2, 1, 1, 0, 0, 0 ]
                [ 0, 0, 1, 0, 0, 0, 0, 0 ]
            ]
        "Scurrg H-6 Bomber":
            name: "Scurrg H-6 Bomber"
            xws: "Scurrg H-6 Bomber".canonicalize()
            factions: ["Scum and Villainy"]
            attack: 3
            agility: 1
            hull: 6
            shields: 4
            medium: true
            actions: [
                "Focus"
                "Target Lock"
            ]
            actionsred: [
                "Barrel Roll"
            ]
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
                [ 0, 2, 2, 2, 0, 0, 0, 0, 0, 0 ]
                [ 1, 1, 2, 1, 1, 0, 0, 0, 0, 0 ]
                [ 3, 1, 1, 1, 3, 0, 0, 0, 3, 3 ]
                [ 0, 0, 3, 0, 0, 0, 0, 0, 0, 0 ]
            ]
        "TIE Aggressor":
            name: "TIE Aggressor"
            xws: "TIE/AG Aggressor".canonicalize()
            factions: ["Galactic Empire"]
            attack: 2
            agility: 2
            hull: 4
            shields: 1
            actions: [
                "Focus"
                "Target Lock"
                "Barrel Roll" 
                "<r>> Evade</r>"
            ]
            actionsred: [
            ]
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
                [ 0, 1, 2, 1, 0, 0, 0, 0, 0, 0 ]
                [ 1, 2, 2, 2, 1, 0, 0, 0, 0, 0 ]
                [ 1, 1, 2, 1, 1, 0, 0, 0, 0, 0 ]
                [ 0, 0, 1, 0, 0, 3, 0, 0, 0, 0 ]
            ]
        "Alpha-Class Star Wing":
            name: "Alpha-Class Star Wing"
            xws: "Alpha-Class Star Wing".canonicalize()
            factions: ["Galactic Empire"]
            attack: 2
            agility: 2
            hull: 4
            shields: 3
            actions: [
                "Focus"
                "Target Lock"
                "Slam"
                "Reload"
            ]
            actionsred: [
            ]
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0, 0, 0 ]
                [ 0, 1, 2, 1, 0, 0, 0, 0 ]
                [ 1, 2, 2, 2, 1, 0, 0, 0 ]
                [ 1, 1, 1, 1, 1, 0, 0, 0 ]
                [ 0, 0, 3, 0, 0, 0, 0, 0 ]
            ]
        "M12-L Kimogila Fighter":
            name: "M12-L Kimogila Fighter"
            xws: "M12-L Kimogila Fighter".canonicalize()
            factions: ["Scum and Villainy"]
            attack: 3
            agility: 1
            hull: 7
            shields: 2
            medium: true
            actions: [
                "Focus"
                "Target Lock"
                "Reload"
            ]
            actionsred: [
                "Barrel Roll"
            ]
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0]
                [ 3, 1, 2, 1, 3, 0]
                [ 1, 2, 2, 2, 1, 0]
                [ 1, 1, 2, 1, 1, 0]
                [ 0, 0, 0, 0, 0, 3]
            ]
        "Sheathipede-Class Shuttle":
            name: "Sheathipede-Class Shuttle"
            xws: "Sheathipede-Class Shuttle".canonicalize()
            factions: ["Rebel Alliance"]
            attack: 2
            attackb: 2
            agility: 2
            hull: 4
            shields: 1
            actions: [
                "Focus"
                "Target Lock"
                "Coordinate"
            ]
            actionsred: [
            ]
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                [ 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 3, 0]
                [ 1, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0]
                [ 3, 1, 2, 1, 3, 3, 0, 0, 0, 0, 0, 0, 0]
                [ 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ]
        "TIE Reaper":
            name: "TIE Reaper"
            xws: "TIE Reaper".canonicalize()
            factions: ["Galactic Empire"]
            attack: 3
            agility: 1
            hull: 6
            shields: 2
            medium: true
            actions: [
                "Focus"
                "Evade"
                "Jam"
            ]
            actionsred: [
                "Coordinate"
            ]
            maneuvers: [
                [ 0, 0, 3, 0, 0, 0, 0, 0 ]
                [ 3, 2, 2, 2, 3, 0, 3, 3 ]
                [ 3, 1, 2, 1, 3, 0, 0, 0 ]
                [ 0, 1, 2, 1, 0, 0, 0, 0 ]
            ]
        "Escape Craft":
            name: "Escape Craft"
            xws: "Escape Craft".canonicalize()
            factions: ["Scum and Villainy"]
            attack: 2
            agility: 2
            hull: 2
            shields: 2
            actions: [
                "Focus"
                "Barrel Roll"
            ]
            actionsred: [
                "Coordinate"
            ]
            maneuvers: [
                [ 0, 0, 3, 0, 0, 0, 0, 0 ]
                [ 0, 2, 2, 2, 0, 0, 0, 0 ]
                [ 3, 1, 2, 1, 3, 0, 0, 0 ]
                [ 0, 1, 1, 1, 0, 0, 0, 0 ]
            ]
        "T-70 X-Wing":
            name: "T-70 X-Wing"
            xws: "T-70 X-Wing".canonicalize()
            factions: [ "Resistance"]
            attack: 3
            agility: 2
            hull: 4
            shields: 3
            actions: [
                "Focus"
                "Target Lock"
                "Boost"
            ]
            actionsred: [
            ]
            maneuvers: [
              [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
              [ 0, 2, 2, 2, 0, 0, 0, 0, 0, 0]
              [ 1, 2, 2, 2, 1, 0, 0, 0, 0, 0]
              [ 1, 1, 2, 1, 1, 0, 0, 0, 3, 3]
              [ 0, 0, 1, 0, 0, 3, 0, 0, 0, 0]
            ]
        "RZ-2 A-Wing":
            name: "RZ-2 A-Wing"
            xws: "RZ-2 A-Wing".canonicalize()
            factions: ["Resistance"]
            attack: 2
            attackt: 2
            agility: 3
            hull: 3
            shields: 2
            actions: [
                "Focus"
                "Evade"
                "Target Lock"
                "Barrel Roll"
            ]
            actionsred: [
            ]
            maneuvers: [
              [ 0, 0, 0, 0, 0, 0, 0, 0]
              [ 1, 0, 0, 0, 1, 0, 0, 0]
              [ 2, 2, 2, 2, 2, 0, 3, 3]
              [ 1, 1, 2, 1, 1, 0, 0, 0]
              [ 0, 0, 1, 0, 0, 3, 0, 0]
              [ 0, 0, 1, 0, 0, 0, 0, 0]
            ]
        "TIE/FO Fighter":
            name: "TIE/FO Fighter"
            xws: "TIE/FO Fighter".canonicalize()
            factions: ["First Order"]
            attack: 2
            agility: 3
            hull: 3
            shields: 1
            actions: [
                "Focus"
                "Evade"
                "Target Lock"
                "Barrel Roll"
            ]
            actionsred: [
            ]
            maneuvers: [
              [ 0, 0, 0, 0, 0, 0, 0, 0]
              [ 1, 0, 0, 0, 1, 0, 0, 0]
              [ 2, 2, 2, 2, 2, 0, 3, 3]
              [ 1, 1, 2, 1, 1, 0, 0, 0]
              [ 0, 0, 1, 0, 0, 3, 0, 0]
              [ 0, 0, 1, 0, 0, 0, 0, 0]
            ]
        "TIE Silencer":
            name: "TIE Silencer"
            xws: "TIE Silencer".canonicalize()
            factions: ["First Order"]
            attack: 3
            agility: 3
            hull: 4
            shields: 2
            actions: [
                "Focus"
                "Boost"
                "Target Lock"
                "Barrel Roll"
            ]
            actionsred: [
            ]
            maneuvers: [
              [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
              [ 1, 0, 0, 0, 1, 0, 0, 0, 0, 0]
              [ 2, 2, 2, 2, 2, 0, 0, 0, 0, 0]
              [ 1, 1, 2, 1, 1, 0, 0, 0, 3, 3]
              [ 0, 0, 2, 0, 0, 3, 0, 0, 0, 0]
              [ 0, 0, 2, 0, 0, 0, 0, 0, 0, 0]
            ]
        "TIE/sf Fighter":
            name: "TIE/sf Fighter"
            xws: "TIE/sf Fighter".canonicalize()
            factions: ["First Order"]
            attack: 0
            attackt: 0
            agility: 2
            hull: 3
            shields: 3
            actions: [
                "Focus"
                "> Rotate Arc"
                "Evade"
                "> Rotate Arc"
                "Target Lock"
                "> Rotate Arc"
                "Barrel Roll"
                "> Rotate Arc"
            ]
            actionsred: [
            ]
            maneuvers: [
              [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
              [ 0, 2, 2, 2, 0, 0, 0, 0, 0, 0]
              [ 1, 1, 2, 1, 1, 0, 0, 0, 0, 0]
              [ 3, 1, 2, 1, 3, 0, 3, 3, 0, 0]
              [ 0, 0, 1, 0, 0, 0, 0, 0, 0, 0]
              [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ]
        "Upsilon-class Shuttle":
            name: "Upsilon-class Shuttle"
            xws: "Upsilon-class Shuttle".canonicalize()
            factions: ["First Order"]
            attack: 0
            agility: 0
            hull: 0
            shields: 6
            actions: [
                "Focus"
                "Reinforce"
                "Target Lock"
                "Coordinate"
                "Jam"
            ]
            actionsred: [
            ]
            maneuvers: [
              [ 0, 0, 3, 0, 0, 0, 0, 0, 0, 0]
              [ 3, 1, 2, 1, 3, 0, 0, 0, 0, 0]
              [ 1, 2, 2, 2, 1, 0, 0, 0, 0, 0]
              [ 3, 1, 1, 1, 3, 0, 0, 0, 0, 0]
              [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
              [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ]
            large: true
        "B/SF-17 Bomber":
            name: "B/SF-17 Bomber"
            xws: "B/SF-17 Bomber".canonicalize()
            factions: ["Resistance"]
            attack: 0
            agility: 0
            hull: 9
            shields: 3
            actions: [
                "Focus"
                "Target Lock"
                "Rotate Arc"
                "Reload"
            ]
            actionsred: [
            ]
            maneuvers: [
              [ 0, 0, 3, 0, 0, 0, 0, 0, 0, 0]
              [ 3, 2, 2, 2, 3, 0, 0, 0, 0, 0]
              [ 1, 1, 2, 1, 1, 0, 0, 0, 0, 0]
              [ 0, 1, 1, 1, 0, 0, 0, 0, 0, 0]
              [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
              [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ]
            large: true
        "YT-1300 (Resistance)":
            name: "YT-1300 (Resistance)"
            canonical_name: 'YT-1300'.canonicalize()
            xws: "??? YT-1300 Light Freighter".canonicalize()
            factions: [ "Resistance" ]
            attackdt: 0
            agility: 0
            hull: 0
            shields: 3
            actions: [
                "Focus"
                "Target Lock"
            ]
            actionsred: [
                "Boost"
                "Rotate Arc"
            ]
            maneuvers: [
              [ 0, 0, 0, 0, 0, 0, 0, 0]
              [ 0, 1, 2, 1, 0, 0, 0, 0]
              [ 1, 2, 2, 2, 1, 0, 0, 0]
              [ 1, 1, 2, 1, 1, 0, 3, 3]
              [ 0, 0, 1, 0, 0, 3, 0, 0]
            ]
            large: true
        "Mining Guild TIE Fighter":
            name: "Mining Guild TIE Fighter"
            xws: "Modified TIE/LN Fighter".canonicalize()
            factions: ["Scum and Villainy"]
            attack: 2
            agility: 3
            hull: 3
            shields: 0
            actions: [
                "Focus"
                "Barrel Roll"
                "Evade"
            ]
            actionsred: [
            ]
            maneuvers: [
              [ 0, 0, 0, 0, 0, 0]
              [ 1, 0, 0, 0, 1, 0]
              [ 1, 2, 2, 2, 1, 0]
              [ 1, 1, 2, 1, 1, 3]
              [ 0, 0, 1, 0, 0, 0]
              [ 0, 0, 3, 0, 0, 0]
            ]
    # name field is for convenience only
    pilotsById: [
        {
            name: "Cavern Angels Zealot"
            id: 0
            faction: "Rebel Alliance"
            ship: "X-Wing"
            skill: 1
            points: 41
            slots: [
                "Illicit"
                "Torpedo"
                "Astromech"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "Blue Squadron Escort"
            id: 1
            faction: "Rebel Alliance"
            ship: "X-Wing"
            skill: 2
            points: 41
            slots: [
                "Torpedo"
                "Astromech"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "Red Squadron Veteran"
            id: 2
            faction: "Rebel Alliance"
            ship: "X-Wing"
            skill: 3
            points: 43
            slots: [
                "Talent"
                "Torpedo"
                "Astromech"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "Jek Porkins"
            id: 3
            unique: true
            faction: "Rebel Alliance"
            ship: "X-Wing"
            skill: 4
            points: 46
            slots: [
                "Talent"
                "Torpedo"
                "Astromech"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "Luke Skywalker"
            id: 4
            unique: true
            faction: "Rebel Alliance"
            ship: "X-Wing"
            skill: 5
            force: 2
            points: 62
            slots: [
                "Force"
                "Torpedo"
                "Astromech"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "Wedge Antilles"
            id: 5
            unique: true
            faction: "Rebel Alliance"
            ship: "X-Wing"
            skill: 6
            points: 52
            slots: [
                "Talent"
                "Torpedo"
                "Astromech"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "Garven Dreis (X-Wing)"
            canonical_name: 'Garven Dreis'.canonicalize()
            id: 6
            unique: true
            xws: "garvendreis-t65xwing"
            faction: "Rebel Alliance"
            ship: "X-Wing"
            skill: 4
            points: 47
            slots: [
                "Talent"
                "Torpedo"
                "Astromech"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "Biggs Darklighter"
            id: 7
            unique: true
            faction: "Rebel Alliance"
            ship: "X-Wing"
            skill: 3
            points: 48
            slots: [
                "Torpedo"
                "Astromech"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "Edrio Two-Tubes"
            id: 8
            unique: true
            faction: "Rebel Alliance"
            ship: "X-Wing"
            skill: 2
            points: 45
            slots: [
                "Illicit"
                "Torpedo"
                "Astromech"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "Thane Kyrell"
            id: 9
            unique: true
            faction: "Rebel Alliance"
            ship: "X-Wing"
            skill: 5
            points: 48
            slots: [
                "Talent"
                "Torpedo"
                "Astromech"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "Leevan Tenza"
            id: 10
            unique: true
            faction: "Rebel Alliance"
            ship: "X-Wing"
            skill: 3
            points: 46
            slots: [
                "Illicit"
                "Talent"
                "Torpedo"
                "Astromech"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "whoops"
            id: 11
            skip: true
        }
        {
            name: "Kullbee Sperado"
            id: 12
            unique: true
            faction: "Rebel Alliance"
            ship: "X-Wing"
            skill: 3
            points: 48
            slots: [
                "Illicit"
                "Talent"
                "Torpedo"
                "Astromech"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "Sabine Wren (TIE Fighter)"
            canonical_name: 'Sabine Wren'.canonicalize()
            id: 13
            unique: true
            xws: "sabinewren-tielnfighter"
            faction: "Rebel Alliance"
            ship: "TIE Fighter"
            skill: 3
            points: 28
            slots: [
                "Modification"
            ]
        }
        {
            name: "Ezra Bridger (TIE Fighter)"
            canonical_name: 'Ezra Bridger'.canonicalize()
            id: 14
            unique: true
            xws: "ezrabridger-tielnfighter"
            faction: "Rebel Alliance"
            ship: "TIE Fighter"
            skill: 3
            force: 1
            points: 32
            slots: [
                "Force"
                "Modification"
            ]
        }
        {
            name: '"Zeb" Orrelios (TIE Fighter)'
            canonical_name: '"Zeb" Orrelios'.canonicalize()
            id: 15
            unique: true
            xws: "zeborrelios-tielnfighter"
            faction: "Rebel Alliance"
            ship: "TIE Fighter"
            skill: 2
            points: 26
            slots: [
                "Modification"
            ]
        }
        {
            name: "Captain Rex"
            id: 16
            unique: true
            faction: "Rebel Alliance"
            ship: "TIE Fighter"
            skill: 2
            points: 32
            slots: [
                "Modification"
            ]
            applies_condition: 'Suppressive Fire'.canonicalize()
        }
        {
            name: "Miranda Doni"
            id: 17
            unique: true
            faction: "Rebel Alliance"
            ship: "K-Wing"
            skill: 4
            points: 48
            slots: [
                "Torpedo"
                "Missile"
                "Missile"
                "Gunner"
                "Crew"
                "Device"
                "Device"
                "Modification"
            ]
        }
        {
            name: "Esege Tuketu"
            id: 18
            unique: true
            faction: "Rebel Alliance"
            ship: "K-Wing"
            skill: 3
            points: 50
            slots: [
                "Torpedo"
                "Missile"
                "Missile"
                "Gunner"
                "Crew"
                "Device"
                "Device"
                "Modification"
            ]
        }
        {
            name: "empty"
            id: 19
            skip: true
        }
        {
            name: "Warden Squadron Pilot"
            id: 20
            faction: "Rebel Alliance"
            ship: "K-Wing"
            skill: 3
            points: 40
            slots: [
                "Torpedo"
                "Missile"
                "Missile"
                "Gunner"
                "Crew"
                "Device"
                "Device"
                "Modification"
            ]
        }
        {
            name: "Corran Horn"
            id: 21
            unique: true
            faction: "Rebel Alliance"
            ship: "E-Wing"
            skill: 5
            points: 74
            slots: [
                "Talent"
                "System"
                "Torpedo"
                "Astromech"
                "Modification"
            ]
        }
        {
            name: "Gavin Darklighter"
            id: 22
            unique: true
            faction: "Rebel Alliance"
            ship: "E-Wing"
            skill: 4
            points: 68
            slots: [
                "Talent"
                "System"
                "Torpedo"
                "Astromech"
                "Modification"
            ]
        }
        {
            name: "Rogue Squadron Escort"
            id: 23
            faction: "Rebel Alliance"
            ship: "E-Wing"
            skill: 4
            points: 63
            slots: [
                "Talent"
                "System"
                "Torpedo"
                "Astromech"
                "Modification"
            ]
        }
        {
            name: "Knave Squadron Escort"
            id: 24
            faction: "Rebel Alliance"
            ship: "E-Wing"
            skill: 2
            points: 61
            slots: [
                "System"
                "Torpedo"
                "Astromech"
                "Modification"
            ]
        }
        {
            name: "Norra Wexley (Y-Wing)"
            id: 25
            unique: true
            xws: "norrawexley-btla4ywing"
            faction: "Rebel Alliance"
            ship: "Y-Wing"
            skill: 5
            points: 43
            slots: [
                "Talent"
                "Turret"
                "Torpedo"
                "Astromech"
                "Modification"
                "Device"
                "Gunner"
            ]
        }
        {
            name: "Horton Salm"
            id: 26
            unique: true
            faction: "Rebel Alliance"
            ship: "Y-Wing"
            skill: 4
            points: 38
            slots: [
                "Talent"
                "Turret"
                "Torpedo"
                "Astromech"
                "Modification"
                "Device"
                "Gunner"
            ]
        }
        {
            name: '"Dutch" Vander'
            id: 27
            unique: true
            faction: "Rebel Alliance"
            ship: "Y-Wing"
            skill: 4
            points: 42
            slots: [
                "Talent"
                "Turret"
                "Torpedo"
                "Astromech"
                "Modification"
                "Device"
                "Gunner"
            ]
        }
        {
            name: "Evaan Verlaine"
            id: 28
            unique: true
            faction: "Rebel Alliance"
            ship: "Y-Wing"
            skill: 3
            points: 36
            slots: [
                "Talent"
                "Turret"
                "Torpedo"
                "Astromech"
                "Modification"
                "Device"
                "Gunner"
            ]
        }
        {
            name: "Gold Squadron Veteran"
            id: 29
            faction: "Rebel Alliance"
            ship: "Y-Wing"
            skill: 3
            points: 34
            slots: [
                "Talent"
                "Turret"
                "Torpedo"
                "Astromech"
                "Modification"
                "Device"
                "Gunner"
            ]
        }
        {
            name: "Gray Squadron Bomber"
            id: 30
            faction: "Rebel Alliance"
            ship: "Y-Wing"
            skill: 2
            points: 32
            slots: [
                "Turret"
                "Torpedo"
                "Astromech"
                "Modification"
                "Device"
                "Gunner"
            ]
        }
        {
            name: "Bodhi Rook"
            id: 31
            unique: true
            faction: "Rebel Alliance"
            ship: "U-Wing"
            skill: 4
            points: 49
            slots: [
                "Talent"
                "System"
                "Crew"
                "Crew"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "Cassian Andor"
            id: 32
            unique: true
            faction: "Rebel Alliance"
            ship: "U-Wing"
            skill: 3
            points: 47
            slots: [
                "Talent"
                "System"
                "Crew"
                "Crew"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "Heff Tobber"
            id: 33
            unique: true
            faction: "Rebel Alliance"
            ship: "U-Wing"
            skill: 2
            points: 45
            slots: [
                "Talent"
                "System"
                "Crew"
                "Crew"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "Magva Yarro"
            id: 34
            unique: true
            faction: "Rebel Alliance"
            ship: "U-Wing"
            skill: 3
            points: 50
            slots: [
                "Talent"
                "System"
                "Crew"
                "Crew"
                "Modification"
                "Configuration"
                "Illicit"
            ]
        }
        {
            name: "Saw Gerrera"
            id: 35
            unique: true
            faction: "Rebel Alliance"
            ship: "U-Wing"
            skill: 4
            points: 52
            slots: [
                "Talent"
                "System"
                "Crew"
                "Crew"
                "Modification"
                "Configuration"
                "Illicit"
            ]
        }
        {
            name: "Benthic Two-Tubes"
            id: 36
            unique: true
            faction: "Rebel Alliance"
            ship: "U-Wing"
            skill: 2
            points: 47
            slots: [
                "Illicit"
                "System"
                "Crew"
                "Crew"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "Blue Squadron Scout"
            id: 37
            unique: true
            faction: "Rebel Alliance"
            ship: "U-Wing"
            skill: 2
            points: 43
            slots: [
                "System"
                "Crew"
                "Crew"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "Partisan Renegade"
            id: 38
            faction: "Rebel Alliance"
            ship: "U-Wing"
            skill: 1
            points: 43
            slots: [
                "Illicit"
                "System"
                "Crew"
                "Crew"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "Dash Rendar"
            id: 39
            unique: true
            faction: "Rebel Alliance"
            ship: "YT-2400"
            skill: 5
            points: 100
            slots: [
                "Talent"
                "Missile"
                "Gunner"
                "Crew"
                "Modification"
                "Title"
                "Illicit"
            ]
        }
        {
            name: '"Leebo"'
            id: 40
            unique: true
            faction: "Rebel Alliance"
            ship: "YT-2400"
            skill: 3
            points: 98
            slots: [
                "Missile"
                "Gunner"
                "Crew"
                "Modification"
                "Title"
                "Illicit"
            ]
            ship_override:
                actions: [
                    "Calculate"
                    "Target Lock"
                    "Rotate Arc"
                ]
        }
        {
            name: "Wild Space Fringer"
            id: 41
            faction: "Rebel Alliance"
            ship: "YT-2400"
            skill: 1
            points: 88
            slots: [
                "Missile"
                "Gunner"
                "Crew"
                "Modification"
                "Title"
                "Illicit"
            ]
        }
        {
            name: "Han Solo (Rebel)"
            id: 42
            unique: true
            xws: "hansolo-modifiedyt1300lightfreighter"
            faction: "Rebel Alliance"
            ship: "YT-1300"
            skill: 6
            points: 92
            slots: [
                "Talent"
                "Missile"
                "Gunner"
                "Crew"
                "Crew"
                "Modification"
                "Title"
                "Illicit"
            ]
        }
        {
            name: "Lando Calrissian (Rebel)"
            id: 43
            unique: true
            xws: "landocalrissian-modifiedyt1300lightfreighter"
            faction: "Rebel Alliance"
            ship: "YT-1300"
            skill: 5
            points: 92
            slots: [
                "Talent"
                "Missile"
                "Gunner"
                "Crew"
                "Crew"
                "Modification"
                "Title"
                "Illicit"
            ]
        }
        {
            name: "Chewbacca"
            id: 44
            unique: true
            faction: "Rebel Alliance"
            ship: "YT-1300"
            skill: 4
            charge: 1
            recurring: true
            points: 84
            slots: [
                "Talent"
                "Missile"
                "Gunner"
                "Crew"
                "Crew"
                "Modification"
                "Title"
                "Illicit"
            ]
        }
        {
            name: "Outer Rim Smuggler"
            id: 45
            faction: "Rebel Alliance"
            ship: "YT-1300"
            skill: 5
            points: 78
            slots: [
                "Missile"
                "Gunner"
                "Crew"
                "Crew"
                "Modification"
                "Title"
                "Illicit"
            ]
        }
        {
            name: "Jan Ors"
            id: 46
            unique: true
            faction: "Rebel Alliance"
            ship: "HWK-290"
            skill: 5
            points: 42
            slots: [
                "Talent"
                "Device"
                "Crew"
                "Modification"
                "Modification"
                "Title"
            ]
        }
        {
            name: "Roark Garnet"
            id: 47
            unique: true
            faction: "Rebel Alliance"
            ship: "HWK-290"
            skill: 4
            points: 38
            slots: [
                "Talent"
                "Device"
                "Crew"
                "Modification"
                "Modification"
                "Title"
            ]
        }
        {
            name: "Kyle Katarn"
            id: 48
            unique: true
            faction: "Rebel Alliance"
            ship: "HWK-290"
            skill: 3
            points: 38
            slots: [
                "Talent"
                "Device"
                "Crew"
                "Modification"
                "Modification"
                "Title"
            ]
        }
        {
            name: "Rebel Scout"
            id: 49
            faction: "Rebel Alliance"
            ship: "HWK-290"
            skill: 2
            points: 32
            slots: [
                "Device"
                "Crew"
                "Modification"
                "Modification"
                "Title"
            ]
        }
        {
            name: "Jake Farrell"
            id: 50
            unique: true
            faction: "Rebel Alliance"
            ship: "A-Wing"
            skill: 4
            points: 40
            slots: [
                "Talent"
                "Missile"
            ]
        }
        {
            name: "Arvel Crynyd"
            id: 51
            unique: true
            faction: "Rebel Alliance"
            ship: "A-Wing"
            skill: 3
            points: 36
            slots: [
                "Talent"
                "Missile"
            ]
        }
        {
            name: "Green Squadron Pilot"
            id: 52
            faction: "Rebel Alliance"
            ship: "A-Wing"
            skill: 3
            points: 34
            slots: [
                "Talent"
                "Missile"
            ]
        }
        {
            name: "Phoenix Squadron Pilot"
            id: 53
            faction: "Rebel Alliance"
            ship: "A-Wing"
            skill: 1
            points: 30
            slots: [
                "Missile"
            ]
        }
        {
            name: "Airen Cracken"
            id: 54
            unique: true
            faction: "Rebel Alliance"
            ship: "Z-95 Headhunter"
            skill: 5
            points: 36
            slots: [
                "Talent"
                "Missile"
                "Modification"
            ]
        }
        {
            name: "Lieutenant Blount"
            id: 55
            unique: true
            faction: "Rebel Alliance"
            ship: "Z-95 Headhunter"
            skill: 4
            points: 30
            slots: [
                "Talent"
                "Missile"
                "Modification"
            ]
        }
        {
            name: "Tala Squadron Pilot"
            id: 56
            faction: "Rebel Alliance"
            ship: "Z-95 Headhunter"
            skill: 2
            points: 25
            slots: [
                "Talent"
                "Missile"
                "Modification"
            ]
        }
        {
            name: "Bandit Squadron Pilot"
            id: 57
            faction: "Rebel Alliance"
            ship: "Z-95 Headhunter"
            skill: 1
            points: 23
            slots: [
                "Missile"
                "Modification"
            ]
        }
        {
            name: "Wullffwarro"
            id: 58
            unique: true
            faction: "Rebel Alliance"
            ship: "Auzituck Gunship"
            skill: 4
            points: 56
            slots: [
                "Talent"
                "Crew"
                "Crew"
                "Modification"
            ]
        }
        {
            name: "Lowhhrick"
            id: 59
            unique: true
            faction: "Rebel Alliance"
            ship: "Auzituck Gunship"
            skill: 3
            points: 52
            slots: [
                "Talent"
                "Crew"
                "Crew"
                "Modification"
            ]
        }
        {
            name: "Kashyyyk Defender"
            id: 60
            faction: "Rebel Alliance"
            ship: "Auzituck Gunship"
            skill: 3
            points: 46
            slots: [
                "Crew"
                "Crew"
                "Modification"
            ]
        }
        {
            name: "Hera Syndulla (VCX-100)"
            id: 61
            unique: true
            xws: "herasyndulla-vcx100lightfreighter"
            faction: "Rebel Alliance"
            ship: "VCX-100"
            skill: 5
            points: 76
            slots: [
                "Talent"
                "Torpedo"
                "Crew"
                "Crew"
                "Modification"
                "Gunner"
                "Turret"
                "Title"
            ]
        }
        {
            name: "Kanan Jarrus"
            id: 62
            unique: true
            faction: "Rebel Alliance"
            ship: "VCX-100"
            skill: 3
            force: 2
            points: 90
            slots: [
                "Force"
                "Torpedo"
                "Crew"
                "Crew"
                "Modification"
                "Gunner"
                "Turret"
                "Title"
            ]
        }
        {
            name: '"Chopper"'
            id: 63
            unique: true
            faction: "Rebel Alliance"
            ship: "VCX-100"
            skill: 2
            points: 72
            slots: [
                "Torpedo"
                "Crew"
                "Crew"
                "Modification"
                "Gunner"
                "Turret"
                "Title"
            ]
            ship_override:
                actions: [
                    "Calculate"
                    "Target Lock"
                    "Reinforce"
                ]
        }
        {
            name: "Lothal Rebel"
            id: 64
            faction: "Rebel Alliance"
            ship: "VCX-100"
            skill: 2
            points: 70
            slots: [
                "Torpedo"
                "Crew"
                "Crew"
                "Modification"
                "Gunner"
                "Turret"
                "Title"
            ]
        }
        {
            name: "Hera Syndulla"
            id: 65
            unique: true
            faction: "Rebel Alliance"
            ship: "Attack Shuttle"
            skill: 5
            points: 39
            slots: [
                "Talent"
                "Crew"
                "Modification"
                "Turret"
                "Title"
            ]
        }
        {
            name: "Sabine Wren"
            canonical_name: 'Sabine Wren'.canonicalize()
            id: 66
            unique: true
            faction: "Rebel Alliance"
            ship: "Attack Shuttle"
            skill: 3
            points: 38
            slots: [
                "Talent"
                "Crew"
                "Modification"
                "Turret"
                "Title"
            ]
        }
        {
            name: "Ezra Bridger"
            id: 67
            unique: true
            faction: "Rebel Alliance"
            ship: "Attack Shuttle"
            skill: 3
            force: 1
            points: 41
            slots: [
                "Force"
                "Crew"
                "Modification"
                "Turret"
                "Title"
            ]
        }

        {
            name: '"Zeb" Orrelios'
            id: 68
            unique: true
            faction: "Rebel Alliance"
            ship: "Attack Shuttle"
            skill: 2
            points: 34
            slots: [
                "Crew"
                "Modification"
                "Turret"
                "Title"
            ]
        }
        {
            name: "Fenn Rau (Sheathipede)"
            id: 69
            unique: true
            xws: "fennrau-sheathipedeclassshuttle"
            faction: "Rebel Alliance"
            ship: "Sheathipede-Class Shuttle"
            skill: 6
            points: 52
            slots: [
                "Talent"
                "Crew"
                "Modification"
                "Astromech"
                "Title"
            ]
        }
        {
            name: "Ezra Bridger (Sheathipede)"
            canonical_name: 'Ezra Bridger'.canonicalize()
            id: 70
            unique: true
            xws: "ezrabridger-sheathipedeclassshuttle"
            faction: "Rebel Alliance"
            ship: "Sheathipede-Class Shuttle"
            skill: 3
            force: 1
            points: 42
            slots: [
                "Force"
                "Crew"
                "Modification"
                "Astromech"
                "Title"
            ]
        }
        {
            name: '"Zeb" Orrelios (Sheathipede)'
            canonical_name: '"Zeb" Orrelios'.canonicalize()
            id: 71
            unique: true
            xws: "zeborrelios-sheathipedeclassshuttle"
            faction: "Rebel Alliance"
            ship: "Sheathipede-Class Shuttle"
            skill: 2
            points: 32
            slots: [
                "Talent"
                "Crew"
                "Modification"
                "Astromech"
                "Title"
            ]
        }
        {
            name: "AP-5"
            id: 72
            unique: true
            faction: "Rebel Alliance"
            ship: "Sheathipede-Class Shuttle"
            skill: 1
            points:30
            slots: [
                "Talent"
                "Crew"
                "Modification"
                "Astromech"
                "Title"
            ]
        }
        {
             name: "Braylen Stramm"
            id: 73
            unique: true
            faction: "Rebel Alliance"
            ship: "B-Wing"
            skill: 4
            points: 50
            slots: [
                "Talent"
                "System"
                "Cannon"
                "Cannon"
                "Torpedo"
                "Modification"
            ]
        }
        {
            name: "Ten Numb"
            id: 74
            unique: true
            faction: "Rebel Alliance"
            ship: "B-Wing"
            skill: 4
            points: 50
            slots: [
                "Talent"
                "System"
                "Cannon"
                "Cannon"
                "Torpedo"
                "Modification"
            ]
        }
        {
            name: "Blade Squadron Veteran"
            id: 75
            faction: "Rebel Alliance"
            ship: "B-Wing"
            skill: 3
            points: 44
            slots: [
                "Talent"
                "System"
                "Cannon"
                "Cannon"
                "Torpedo"
                "Modification"
            ]
        }
        {
            name: "Blue Squadron Pilot"
            id: 76
            faction: "Rebel Alliance"
            ship: "B-Wing"
            skill: 2
            points: 42
            slots: [
                "System"
                "Cannon"
                "Cannon"
                "Torpedo"
                "Modification"
            ]
        }
        {
            name: "Norra Wexley"
            id: 77
            unique: true
            faction: "Rebel Alliance"
            ship: "ARC-170"
            skill: 5
            points: 55
            slots: [
                "Talent"
                "Torpedo"
                "Crew"
                "Gunner"
                "Astromech"
                "Modification"
            ]
        }
        {
            name: "Shara Bey"
            id: 78
            unique: true
            faction: "Rebel Alliance"
            ship: "ARC-170"
            skill: 4
            points: 53
            slots: [
                "Talent"
                "Torpedo"
                "Crew"
                "Gunner"
                "Astromech"
                "Modification"
            ]
        }
        {
            name: "Garven Dreis"
            id: 79
            unique: true
            faction: "Rebel Alliance"
            ship: "ARC-170"
            skill: 4
            points: 51
            slots: [
                "Talent"
                "Torpedo"
                "Crew"
                "Gunner"
                "Astromech"
                "Modification"
            ]
        }
        {
            name: "Ibtisam"
            id: 80
            unique: true
            faction: "Rebel Alliance"
            ship: "ARC-170"
            skill: 3
            points: 50
            slots: [
                "Talent"
                "Torpedo"
                "Crew"
                "Gunner"
                "Astromech"
                "Modification"
            ]
        }
        {
            name: "IG-88A"
            id: 81
            faction: "Scum and Villainy"
            ship: "Aggressor"
            skill: 4
            points: 70
            slots: [
                "Talent"
                "System"
                "Cannon"
                "Cannon"
                "Device"
                "Illicit"
                "Modification"
                "Title"
            ]
        }
        {
            name: "IG-88B"
            id: 82
            faction: "Scum and Villainy"
            ship: "Aggressor"
            skill: 4
            points: 70
            slots: [
                "Talent"
                "System"
                "Cannon"
                "Cannon"
                "Device"
                "Illicit"
                "Modification"
                "Title"
                ]
        }
        {
            name: "IG-88C"
            id: 83
            faction: "Scum and Villainy"
            ship: "Aggressor"
            skill: 4
            points: 70
            slots: [
                "Talent"
                "System"
                "Cannon"
                "Cannon"
                "Device"
                "Illicit"
                "Modification"
                "Title"
              ]
        }
        {
            name: "IG-88D"
            id: 84
            faction: "Scum and Villainy"
            ship: "Aggressor"
            skill: 4
            points: 70
            slots: [
                "Talent"
                "System"
                "Cannon"
                "Cannon"
                "Device"
                "Illicit"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Kavil"
            id: 85
            unique: true
            faction: "Scum and Villainy"
            ship: "Y-Wing"
            skill: 5
            points: 42
            slots: [
                "Talent"
                "Turret"
                "Torpedo"
                "Gunner"
                "Astromech"
                "Device"
                "Illicit"
                "Modification"
              ]
        }
        {
            name: "Drea Renthal"
            id: 86
            unique: true
            faction: "Scum and Villainy"
            ship: "Y-Wing"
            skill: 4
            points: 40
            slots: [
                "Talent"
                "Turret"
                "Torpedo"
                "Gunner"
                "Astromech"
                "Device"
                "Illicit"
                "Modification"
              ]
        }
        {
            name: "Hired Gun"
            id: 87
            faction: "Scum and Villainy"
            ship: "Y-Wing"
            skill: 2
            points: 34
            slots: [
                "Talent"
                "Turret"
                "Torpedo"
                "Gunner"
                "Astromech"
                "Device"
                "Illicit"
                "Modification"
              ]
        }
        {
            name: "Crymorah Goon"
            id: 88
            faction: "Scum and Villainy"
            ship: "Y-Wing"
            skill: 1
            points: 32
            slots: [
                "Turret"
                "Torpedo"
                "Gunner"
                "Astromech"
                "Device"
                "Illicit"
                "Modification"
              ]
        }
        {
            name: "Han Solo (Scum)"
            id: 89
            unique: true
            xws: "hansolo"
            faction: "Scum and Villainy"
            ship: "YT-1300 (Scum)"
            skill: 6
            points: 54
            slots: [
                "Talent"
                "Missile"
                "Crew"
                "Crew"
                "Gunner"
                "Illicit"
                "Modification"
                "Title"
            ]
        }
        {
            name: "Lando Calrissian (Scum)"
            id: 90
            unique: true
            xws: "landocalrissian"
            faction: "Scum and Villainy"
            ship: "YT-1300 (Scum)"
            skill: 4
            points: 49
            slots: [
                "Talent"
                "Missile"
                "Crew"
                "Crew"
                "Gunner"
                "Illicit"
                "Modification"
                "Title"
            ]
        }
        {
            name: "L3-37"
            id: 91
            unique: true
            faction: "Scum and Villainy"
            ship: "YT-1300 (Scum)"
            skill: 2
            points: 47
            slots: [
                "Missile"
                "Crew"
                "Crew"
                "Gunner"
                "Illicit"
                "Modification"
                "Title"
            ]
            ship_override:
                actions: [
                    "Calculate"
                    "Target Lock"
                    "Rotate Arc"
                ]
        }
        {
            name: "Freighter Captain"
            id: 92
            faction: "Scum and Villainy"
            ship: "YT-1300 (Scum)"
            skill: 1
            points: 46
            slots: [
                "Missile"
                "Crew"
                "Crew"
                "Gunner"
                "Illicit"
                "Modification"
                "Title"
            ]
        }
        {
            name: "Lando Calrissian (Scum) (Escape Craft)"
            canonical_name: 'Lando Calrissian (Scum)'.canonicalize()
            id: 93
            unique: true
            xws: "landocalrissian-escapecraft"
            faction: "Scum and Villainy"
            ship: "Escape Craft"
            skill: 4
            points: 26
            slots: [
                "Talent"
                "Crew"
                "Modification"
              ]
        }
        {
            name: "Outer Rim Pioneer"
            id: 94
            unique: true
            faction: "Scum and Villainy"
            ship: "Escape Craft"
            skill: 3
            points: 24
            slots: [
                "Talent"
                "Crew"
                "Modification"
              ]
        }
        {
            name: "L3-37 (Escape Craft)"
            canonical_name: 'L3-37'.canonicalize()
            id: 95
            unique: true
            xws: "l337-escapecraft"
            faction: "Scum and Villainy"
            ship: "Escape Craft"
            skill: 2
            points: 22
            slots: [
                "Talent"
                "Crew"
                "Modification"
              ]
            ship_override:
                actions: [
                    "Calculate"
                    "Barrel Roll"
                ]
        }
        {
            name: "Autopilot Drone"
            id: 96
            unique: true        
            faction: "Scum and Villainy"
            ship: "Escape Craft"
            skill: 1
            charge: 3
            points: 12
            slots: [
            ]
            ship_override:
                actions: [
                    "Calculate"
                    "Barrel Roll"
                ]

        }
        {
            name: "Fenn Rau"
            id: 97
            unique: true
            faction: "Scum and Villainy"
            ship: "Fang Fighter"
            skill: 6
            points: 68
            slots: [
                "Talent"
                "Torpedo"
              ]
        }
        {
            name: "Old Teroch"
            id: 98
            unique: true
            faction: "Scum and Villainy"
            ship: "Fang Fighter"
            skill: 5
            points: 56
            slots: [
                "Talent"
                "Torpedo"
              ]
        }
        {
            name: "Kad Solus"
            id: 99
            unique: true
            faction: "Scum and Villainy"
            ship: "Fang Fighter"
            skill: 4
            points: 54
            slots: [
                "Talent"
                "Torpedo"
              ]
        }
        {
            name: "Joy Rekkoff"
            id: 100
            unique: true
            faction: "Scum and Villainy"
            ship: "Fang Fighter"
            skill: 4
            points: 52
            slots: [
                "Talent"
                "Torpedo"
              ]
        }
        {
            name: "Skull Squadron Pilot"
            id: 101
            faction: "Scum and Villainy"
            ship: "Fang Fighter"
            skill: 4
            points: 50
            slots: [
                "Talent"
                "Torpedo"
              ]
        }
        {
            name: "Zealous Recruit"
            id: 102
            faction: "Scum and Villainy"
            ship: "Fang Fighter"
            skill: 1
            points: 44
            slots: [
                "Torpedo"
              ]
        }
        {
            name: "Boba Fett"
            id: 103
            unique: true
            faction: "Scum and Villainy"
            ship: "Firespray-31"
            skill: 5
            points: 80
            slots: [
                "Talent"
                "Cannon"
                "Missile"
                "Crew"
                "Device"
                "Illicit"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Emon Azzameen"
            id: 104
            unique: true
            faction: "Scum and Villainy"
            ship: "Firespray-31"
            skill: 4
            points: 76
            slots: [
                "Talent"
                "Cannon"
                "Missile"
                "Crew"
                "Device"
                "Illicit"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Kath Scarlet"
            id: 105
            unique: true
            faction: "Scum and Villainy"
            ship: "Firespray-31"
            skill: 4
            points: 74
            slots: [
                "Talent"
                "Cannon"
                "Missile"
                "Crew"
                "Device"
                "Illicit"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Koshka Frost"
            id: 106
            unique: true
            faction: "Scum and Villainy"
            ship: "Firespray-31"
            skill: 3
            points: 71
            slots: [
                "Talent"
                "Cannon"
                "Missile"
                "Crew"
                "Device"
                "Illicit"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Krassis Trelix"
            id: 107
            unique: true
            faction: "Scum and Villainy"
            ship: "Firespray-31"
            skill: 3
            points: 70
            slots: [
                "Talent"
                "Cannon"
                "Missile"
                "Crew"
                "Device"
                "Illicit"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Bounty Hunter"
            id: 108
            faction: "Scum and Villainy"
            ship: "Firespray-31"
            skill: 2
            points: 66
            slots: [
                "Talent"
                "Cannon"
                "Missile"
                "Crew"
                "Device"
                "Illicit"
                "Modification"
                "Title"
              ]
        }
        {
            name: "4-LOM"
            id: 109
            unique: true
            faction: "Scum and Villainy"
            ship: "G-1A Starfighter"
            skill: 3
            points: 49
            slots: [
                "Talent"
                "System"
                "Crew"
                "Illicit"
                "Modification"
                "Title"
              ]
            ship_override:
                actions: [
                    "Calculate"
                    "Target Lock"
                    "Jam"
                ]

        }
        {
            name: "Zuckuss"
            id: 110
            unique: true
            faction: "Scum and Villainy"
            ship: "G-1A Starfighter"
            skill: 3
            points: 47
            slots: [
                "Talent"
                "System"
                "Crew"
                "Illicit"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Gand Findsman"
            id: 111
            faction: "Scum and Villainy"
            ship: "G-1A Starfighter"
            skill: 1
            points: 43
            slots: [
                "System"
                "Crew"
                "Illicit"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Palob Godalhi"
            id: 112
            unique: true
            faction: "Scum and Villainy"
            ship: "HWK-290"
            skill: 3
            points: 38
            slots: [
                "Talent"
                "Crew"
                "Device"
                "Illicit"
                "Modification"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Dace Bonearm"
            id: 113
            unique: true
            faction: "Scum and Villainy"
            ship: "HWK-290"
            skill: 4
            charge: 3
            recurring: true
            points: 36
            slots: [
                "Talent"
                "Crew"
                "Device"
                "Illicit"
                "Modification"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Torkil Mux"
            id: 114
            unique: true
            faction: "Scum and Villainy"
            ship: "HWK-290"
            skill: 2
            points: 36
            slots: [
                "Crew"
                "Device"
                "Illicit"
                "Modification"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Dengar"
            id: 115
            unique: true
            faction: "Scum and Villainy"
            ship: "JumpMaster 5000"
            skill: 6
            charge: 1
            recurring: true
            points: 64
            slots: [
                "Talent"
                "Crew"
                "Torpedo"
                "Illicit"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Tel Trevura"
            id: 116
            unique: true
            faction: "Scum and Villainy"
            ship: "JumpMaster 5000"
            skill: 4
            charge: 1        
            points: 60
            slots: [
                "Talent"
                "Crew"
                "Torpedo"
                "Illicit"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Manaroo"
            id: 117
            unique: true
            faction: "Scum and Villainy"
            ship: "JumpMaster 5000"
            skill: 3
            points: 56
            slots: [
                "Talent"
                "Crew"
                "Torpedo"
                "Illicit"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Contracted Scout"
            id: 118
            faction: "Scum and Villainy"
            ship: "JumpMaster 5000"
            skill: 2
            points: 52
            slots: [
                "Torpedo"
                "Crew"
                "Illicit"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Talonbane Cobra"
            id: 119
            unique: true
            faction: "Scum and Villainy"
            ship: "Kihraxz Fighter"
            skill: 5
            points: 50
            slots: [
                "Talent"
                "Missile"
                "Illicit"
                "Modification"
                "Modification"
                "Modification"
              ]
        }
        {
            name: "Graz"
            id: 120
            unique: true
            faction: "Scum and Villainy"
            ship: "Kihraxz Fighter"
            skill: 4
            points: 47
            slots: [
                "Talent"
                "Missile"
                "Illicit"
                "Modification"
                "Modification"
                "Modification"
              ]
        }
        {
            name: "Viktor Hel"
            id: 121
            unique: true
            faction: "Scum and Villainy"
            ship: "Kihraxz Fighter"
            skill: 4
            points: 45
            slots: [
                "Talent"
                "Missile"
                "Illicit"
                "Modification"
                "Modification"
                "Modification"
              ]
        }
        {
            name: "Captain Jostero"
            id: 122
            unique: true
            faction: "Scum and Villainy"
            ship: "Kihraxz Fighter"
            skill: 3
            points: 43
            slots: [
                "Missile"
                "Illicit"
                "Modification"
                "Modification"
                "Modification"
              ]
        }
        {
            name: "Black Sun Ace"
            id: 123
            faction: "Scum and Villainy"
            ship: "Kihraxz Fighter"
            skill: 3
            points: 42
            slots: [
                "Talent"
                "Missile"
                "Illicit"
                "Modification"
                "Modification"
                "Modification"
              ]
        }
        {
            name: "Cartel Marauder"
            id: 124
            faction: "Scum and Villainy"
            ship: "Kihraxz Fighter"
            skill: 2
            points: 40
            slots: [
                "Missile"
                "Illicit"
                "Modification"
                "Modification"
                "Modification"
              ]
        }
        {
            name: "Asajj Ventress"
            id: 125
            unique: true
            faction: "Scum and Villainy"
            ship: "Lancer-class Pursuit Craft"
            skill: 4
            points: 84
            slots: [
                "Force"
                "Crew"
                "Illicit"
                "Illicit"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Ketsu Onyo"
            id: 126
            unique: true
            faction: "Scum and Villainy"
            ship: "Lancer-class Pursuit Craft"
            skill: 5
            points: 74
            slots: [
                "Talent"
                "Crew"
                "Illicit"
                "Illicit"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Sabine Wren (Scum)"
            id: 127
            unique: true
            xws: "sabinewren-lancerclasspursuitcraft"
            faction: "Scum and Villainy"
            ship: "Lancer-class Pursuit Craft"
            skill: 3
            points: 68
            slots: [
                "Talent"
                "Crew"
                "Illicit"
                "Illicit"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Shadowport Hunter"
            id: 128
            faction: "Scum and Villainy"
            ship: "Lancer-class Pursuit Craft"
            skill: 2
            points: 64
            slots: [
                "Crew"
                "Illicit"
                "Illicit"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Torani Kulda"
            id: 129
            unique: true
            faction: "Scum and Villainy"
            ship: "M12-L Kimogila Fighter"
            skill: 4
            points: 50
            slots: [
                "Talent"
                "Torpedo"
                "Missile"
                "Astromech"
                "Illicit"
                "Modification"
              ]
        }
        {
            name: "Dalan Oberos"
            id: 130
            unique: true
            faction: "Scum and Villainy"
            ship: "M12-L Kimogila Fighter"
            skill: 3
            charge: 2
            points: 48
            slots: [
                "Talent"
                "Torpedo"
                "Missile"
                "Astromech"
                "Illicit"
                "Modification"
              ]
        }
        {
            name: "Cartel Executioner"
            id: 131
            faction: "Scum and Villainy"
            ship: "M12-L Kimogila Fighter"
            skill: 3
            points: 44
            slots: [
                "Talent"
                "Torpedo"
                "Missile"
                "Astromech"
                "Illicit"
                "Modification"
              ]
        }
        {
            name: "Serissu"
            id: 132
            unique: true
            faction: "Scum and Villainy"
            ship: "M3-A Interceptor"
            skill: 5
            points: 43
            slots: [
                "Talent"
                "Modification"
                "Hardpoint"
              ]
        }
        {
            name: "Genesis Red"
            id: 133
            unique: true
            faction: "Scum and Villainy"
            ship: "M3-A Interceptor"
            skill: 4
            points: 35
            slots: [
                "Talent"
                "Modification"
                "Hardpoint"
              ]
        }
        {
            name: "Laetin A'shera"
            id: 134
            unique: true
            faction: "Scum and Villainy"
            ship: "M3-A Interceptor"
            skill: 3
            points: 35
            slots: [
                "Talent"
                "Modification"
                "Hardpoint"
              ]
        }
        {
            name: "Quinn Jast"
            id: 135
            unique: true
            faction: "Scum and Villainy"
            ship: "M3-A Interceptor"
            skill: 3
            points: 35
            slots: [
                "Talent"
                "Modification"
                "Hardpoint"
              ]
        }
        {
            name: "Tansarii Point Veteran"
            id: 136
            faction: "Scum and Villainy"
            ship: "M3-A Interceptor"
            skill: 3
            points: 33
            slots: [
                "Talent"
                "Modification"
                "Hardpoint"
              ]
        }
        {
            name: "Inaldra"
            id: 137
            unique: true
            faction: "Scum and Villainy"
            ship: "M3-A Interceptor"
            skill: 2
            points: 32
            slots: [
                "Modification"
                "Hardpoint"
              ]
        }
        {
            name: "Sunny Bounder"
            id: 138
            unique: true
            faction: "Scum and Villainy"
            ship: "M3-A Interceptor"
            skill: 1
            points: 31
            slots: [
                "Modification"
                "Hardpoint"
              ]
        }
        {
            name: "Cartel Spacer"
            id: 139
            faction: "Scum and Villainy"
            ship: "M3-A Interceptor"
            skill: 1
            points: 29
            slots: [
                "Modification"
                "Hardpoint"
              ]
        }
        {
            name: "Constable Zuvio"
            id: 140
            unique: true
            faction: "Scum and Villainy"
            ship: "Quadjumper"
            skill: 4
            points: 33
            slots: [
                "Talent"
                "Tech"
                "Crew"
                "Device"
                "Illicit"
                "Modification"
              ]
        }
        {
            name: "Sarco Plank"
            id: 141
            unique: true
            faction: "Scum and Villainy"
            ship: "Quadjumper"
            skill: 2
            points: 31
            slots: [
                "Tech"
                "Crew"
                "Device"
                "Illicit"
                "Modification"
              ]
        }
        {
            name: "Unkar Plutt"
            id: 142
            unique: true
            faction: "Scum and Villainy"
            ship: "Quadjumper"
            skill: 2
            points: 30
            slots: [
                "Tech"
                "Crew"
                "Device"
                "Illicit"
                "Modification"
              ]
        }
        {
            name: "Jakku Gunrunner"
            id: 143
            faction: "Scum and Villainy"
            ship: "Quadjumper"
            skill: 1
            points: 28
            slots: [
                "Tech"
                "Crew"
                "Device"
                "Illicit"
                "Modification"
              ]
        }
        {
            name: "Captain Nym"
            id: 144
            unique: true
            faction: "Scum and Villainy"
            ship: "Scurrg H-6 Bomber"
            skill: 5
            charge: 1
            recurring: true
            points: 52
            slots: [
                "Talent"
                "Turret"
                "Crew"
                "Device"
                "Device"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Sol Sixxa"
            id: 145
            unique: true
            faction: "Scum and Villainy"
            ship: "Scurrg H-6 Bomber"
            skill: 3
            points: 49
            slots: [
                "Talent"
                "Turret"
                "Crew"
                "Device"
                "Device"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Lok Revenant"
            id: 146
            faction: "Scum and Villainy"
            ship: "Scurrg H-6 Bomber"
            skill: 2
            points: 46
            slots: [
                "Turret"
                "Crew"
                "Device"
                "Device"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Guri"
            id: 147
            unique: true
            faction: "Scum and Villainy"
            ship: "StarViper"
            skill: 5
            points: 62
            slots: [
                "Talent"
                "System"
                "Torpedo"
                "Modification"
                "Title"
              ]
            ship_override:
                actions: [
                    "Calculate"
                    "Target Lock"
                    "Barrel Roll"
                    "<r>> Calculate</r>"
                    "Boost"
                    "<r>> Calculate</r>"
                ]
        }
        {
            name: "Prince Xizor"
            id: 148
            unique: true
            faction: "Scum and Villainy"
            ship: "StarViper"
            skill: 4
            points: 54
            slots: [
                "Talent"
                "System"
                "Torpedo"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Dalan Oberos (StarViper)"
            id: 149
            unique: true
            xws: "dalanoberos-starviperclassattackplatform"
            faction: "Scum and Villainy"
            ship: "StarViper"
            skill: 4
            points: 54
            slots: [
                "Talent"
                "System"
                "Torpedo"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Black Sun Assassin"
            id: 150
            faction: "Scum and Villainy"
            ship: "StarViper"
            skill: 3
            points: 48
            slots: [
                "Talent"
                "System"
                "Torpedo"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Black Sun Enforcer"
            id: 151
            faction: "Scum and Villainy"
            ship: "StarViper"
            skill: 2
            points: 46
            slots: [
                "System"
                "Torpedo"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Moralo Eval"
            id: 152
            unique: true
            faction: "Scum and Villainy"
            ship: "YV-666"
            skill: 4
            charge: 2
            points: 72
            slots: [
                "Talent"
                "Cannon"
                "Missile"
                "Crew"
                "Crew"
                "Crew"
                "Illicit"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Bossk"
            id: 153
            unique: true
            faction: "Scum and Villainy"
            ship: "YV-666"
            skill: 4
            points: 70
        
            slots: [
                "Talent"
                "Cannon"
                "Missile"
                "Crew"
                "Crew"
                "Crew"
                "Illicit"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Latts Razzi"
            id: 154
            unique: true
            faction: "Scum and Villainy"
            ship: "YV-666"
            skill: 3
            points: 66
            slots: [
                "Talent"
                "Cannon"
                "Missile"
                "Crew"
                "Crew"
                "Crew"
                "Illicit"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Trandoshan Slaver"
            id: 155
            faction: "Scum and Villainy"
            ship: "YV-666"
            skill: 2
            points: 58
            slots: [
                "Cannon"
                "Missile"
                "Crew"
                "Crew"
                "Crew"
                "Illicit"
                "Modification"
                "Title"
              ]
        }
        {
            name: "N'dru Suhlak"
            id: 156
            unique: true
            faction: "Scum and Villainy"
            ship: "Z-95 Headhunter"
            skill: 4
            points: 31
            slots: [
                "Talent"
                "Missile"
                "Illicit"
                "Modification"
              ]
        }
        {
            name: "Kaa'to Leeachos"
            id: 157
            unique: true
            faction: "Scum and Villainy"
            ship: "Z-95 Headhunter"
            skill: 3
            points: 29
            slots: [
                "Talent"
                "Missile"
                "Illicit"
                "Modification"
              ]
        }
        {
            name: "Black Sun Soldier"
            id: 158
            faction: "Scum and Villainy"
            ship: "Z-95 Headhunter"
            skill: 3
            points: 27
            slots: [
                "Talent"
                "Missile"
                "Illicit"
                "Modification"
              ]
        }
        {
            name: "Binayre Pirate"
            id: 159
            faction: "Scum and Villainy"
            ship: "Z-95 Headhunter"
            skill: 1
            points: 24
            slots: [
                "Missile"
                "Illicit"
                "Modification"
              ]
        }
        {
            name: "Nashtah Pup"
            id: 160
            unique: true
            faction: "Scum and Villainy"
            ship: "Z-95 Headhunter"
            skill: 1
            points: 6
            slots: [
                "Missile"
                "Illicit"
                "Modification"
              ]
        }
        {
            name: "Major Vynder"
            id: 161
            unique: true
            faction: "Galactic Empire"
            ship: "Alpha-Class Star Wing"
            skill: 4
            points: 41
            slots: [
                "Talent"         
                "System"
                "Torpedo"
                "Missile"
                "Modification"
                "Configuration"
              ]
        }
        {
            name: "Lieutenant Karsabi"
            id: 162
            unique: true
            faction: "Galactic Empire"
            ship: "Alpha-Class Star Wing"
            skill: 3
            points: 39
            slots: [
                "Talent"         
                "System"
                "Torpedo"
                "Missile"
                "Modification"
                "Configuration"
              ]
        }
        {
            name: "Rho Squadron Pilot"
            id: 163
            faction: "Galactic Empire"
            ship: "Alpha-Class Star Wing"
            skill: 3
            points: 37
            slots: [
                "Talent"         
                "System"
                "Torpedo"
                "Missile"
                "Modification"
                "Configuration"
              ]
        }
        {
            name: "Nu Squadron Pilot"
            id: 164
            faction: "Galactic Empire"
            ship: "Alpha-Class Star Wing"
            skill: 2
            points: 35
            slots: [      
                "System"
                "Torpedo"
                "Missile"
                "Modification"
                "Configuration"
              ]
        }
        {
            name: "Captain Kagi"
            id: 165
            unique: true
            faction: "Galactic Empire"
            ship: "Lambda-Class Shuttle"
            skill: 4
            points: 48
            slots: [       
                "System"
                "Cannon"
                "Crew"
                "Crew"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Lieutenant Sai"
            id: 166
            unique: true
            faction: "Galactic Empire"
            ship: "Lambda-Class Shuttle"
            skill: 3
            points: 47
            slots: [       
                "System"
                "Cannon"
                "Crew"
                "Crew"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Colonel Jendon"
            id: 167
            unique: true
            faction: "Galactic Empire"
            ship: "Lambda-Class Shuttle"
            skill: 3
            charge: 2
            points: 46
            slots: [       
                "System"
                "Cannon"
                "Crew"
                "Crew"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Omicron Group Pilot"
            id: 168
            faction: "Galactic Empire"
            ship: "Lambda-Class Shuttle"
            skill: 1
            points: 43
            slots: [       
                "System"
                "Cannon"
                "Crew"
                "Crew"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Grand Inquisitor"
            id: 169
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Advanced Prototype"
            skill: 5
            points: 58
            slots: [       
                "Force"
                "System"
                "Missile"
              ]
        }
        {
            name: "Seventh Sister"
            id: 170
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Advanced Prototype"
            skill: 4
            points: 48
            slots: [       
                "Force"
                "System"
                "Missile"
              ]
        }
        {
            name: "Inquisitor"
            id: 171
            faction: "Galactic Empire"
            ship: "TIE Advanced Prototype"
            skill: 3
            points: 40
            slots: [       
                "Force"
                "System"
                "Missile"
              ]
        }
        {
            name: "Baron of the Empire"
            id: 172
            faction: "Galactic Empire"
            ship: "TIE Advanced Prototype"
            skill: 3
            points: 34
            slots: [       
                "Talent"
                "System"
                "Missile"
              ]
        }
        {
            name: "Darth Vader"
            id: 173
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Advanced"
            skill: 6
            points: 70
            force: 3
            slots: [       
                "Force"
                "System"
                "Missile"
                "Modification"
              ]
        }
        {
            name: "Maarek Stele"
            id: 174
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Advanced"
            skill: 5
            points: 50
            slots: [       
                "Talent"
                "System"
                "Missile"
                "Modification"
              ]
        }
        {
            name: "Ved Foslo"
            id: 175
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Advanced"
            skill: 4
            points: 47
            slots: [       
                "Talent"
                "System"
                "Missile"
                "Modification"
              ]
        }
        {
            name: "Zertik Strom"
            id: 176
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Advanced"
            skill: 3
            points: 45
            slots: [       
                "System"
                "Missile"
                "Modification"
              ]
        }
        {
            name: "Storm Squadron Ace"
            id: 177
            faction: "Galactic Empire"
            ship: "TIE Advanced"
            skill: 3
            points: 43
            slots: [       
                "Talent"
                "System"
                "Missile"
                "Modification"
              ]
        }
        {
            name: "Tempest Squadron Pilot"
            id: 178
            faction: "Galactic Empire"
            ship: "TIE Advanced"
            skill: 2
            points: 41
            slots: [  
                "System"
                "Missile"
                "Modification"
              ]
        }
        {
            name: "Soontir Fel"
            id: 179
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Interceptor"
            skill: 6
            points: 52
            slots: [       
                "Talent"
                "Modification"
                "Modification"
              ]
        }
        {
            name: "Turr Phennir"
            id: 180
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Interceptor"
            skill: 4
            points: 44
            slots: [       
                "Talent"
                "Modification"
                "Modification"
              ]
        }
        {
            name: "Saber Squadron Ace"
            id: 181
            faction: "Galactic Empire"
            ship: "TIE Interceptor"
            skill: 4
            points: 40
            slots: [       
                "Talent"
                "Modification"
                "Modification"
              ]
        }
        {
            name: "Alpha Squadron Pilot"
            id: 182
            faction: "Galactic Empire"
            ship: "TIE Interceptor"
            skill: 1
            points: 34
            slots: [       
                "Modification"
                "Modification"
              ]
        }
        {
            name: "Major Vermeil"
            id: 183
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Reaper"
            skill: 4
            points: 49
            slots: [       
                "Talent"
                "Crew"
                "Crew"
                "Modification"
              ]
        }
        {
            name: "Captain Feroph"
            id: 184
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Reaper"
            skill: 3
            points: 47
            slots: [       
                "Talent"
                "Crew"
                "Crew"
                "Modification"
              ]
        }
        {
            name: '"Vizier"'
            id: 185
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Reaper"
            skill: 2
            points: 45
            slots: [       
                "Talent"
                "Crew"
                "Crew"
                "Modification"
              ]
        }
        {
            name: "Scarif Base Pilot"
            id: 186
            faction: "Galactic Empire"
            ship: "TIE Reaper"
            skill: 1
            points: 41
            slots: [       
                "Crew"
                "Crew"
                "Modification"
              ]
        }
        {
            name: "Lieutenant Kestal"
            id: 187
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Aggressor"
            skill: 4
            points: 36
            slots: [       
                "Talent"
                "Turret"
                "Missile"
                "Missile"
                "Gunner"
                "Modification"
              ]
        }
        {
            name: '"Double Edge"'
            id: 188
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Aggressor"
            skill: 2
            points: 33
            slots: [       
                "Talent"
                "Turret"
                "Missile"
                "Missile"
                "Gunner"
                "Modification"
              ]
        }
        {
            name: "Onyx Squadron Scout"
            id: 189
            faction: "Galactic Empire"
            ship: "TIE Aggressor"
            skill: 3
            points: 32
            slots: [       
                "Talent"
                "Turret"
                "Missile"
                "Missile"
                "Gunner"
                "Modification"
              ]
        }
        {
            name: "Sienar Specialist"
            id: 190
            faction: "Galactic Empire"
            ship: "TIE Aggressor"
            skill: 2
            points: 30
            slots: [       
                "Turret"
                "Missile"
                "Missile"
                "Gunner"
                "Modification"
              ]
        }
        {
            name: '"Redline"'
            id: 191
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Punisher"
            skill: 5
            points: 44
            slots: [       
                "System"
                "Torpedo"
                "Missile"
                "Missile"
                "Gunner"
                "Device"
                "Device"
                "Modification"
              ]
        }
        {
            name: '"Deathrain"'
            id: 192
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Punisher"
            skill: 4
            points: 42
            slots: [       
                "System"
                "Torpedo"
                "Missile"
                "Missile"
                "Gunner"
                "Device"
                "Device"
                "Modification"
              ]
        }
        {
            name: "Cutlass Squadron Pilot"
            id: 193
            faction: "Galactic Empire"
            ship: "TIE Punisher"
            skill: 2
            points: 36
            slots: [       
                "System"
                "Torpedo"
                "Missile"
                "Missile"
                "Gunner"
                "Device"
                "Device"
                "Modification"
              ]
        }
        {
            name: "Colonel Vessery"
            id: 194
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Defender"
            skill: 4
            points: 88
            slots: [       
                "Talent"
                "System"
                "Cannon"
                "Missile"
              ]
        }
        {
            name: "Countess Ryad"
            id: 195
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Defender"
            skill: 4
            points: 86
            slots: [       
                "Talent"
                "System"
                "Cannon"
                "Missile"
              ]
        }
        {
            name: "Rexler Brath"
            id: 196
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Defender"
            skill: 5
            points: 84
            slots: [       
                "Talent"
                "System"
                "Cannon"
                "Missile"
              ]
        }
        {
            name: "Onyx Squadron Ace"
            id: 197
            faction: "Galactic Empire"
            ship: "TIE Defender"
            skill: 4
            points: 78
            slots: [       
                "Talent"
                "System"
                "Cannon"
                "Missile"
              ]
        }
        {
            name: "Delta Squadron Pilot"
            id: 198
            faction: "Galactic Empire"
            ship: "TIE Defender"
            skill: 1
            points: 72
            slots: [       
                "System"
                "Cannon"
                "Missile"
              ]
        }
        {
            name: '"Whisper"'
            id: 199
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Phantom"
            skill: 5
            points: 52
            slots: [       
                "Talent"
                "System"
                "Crew"
                "Modification"
              ]
        }
        {
            name: '"Echo"'
            id: 200
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Phantom"
            skill: 4
            points: 50
            slots: [       
                "Talent"
                "System"
                "Crew"
                "Modification"
              ]
        }
        {
            name: '"Sigma Squadron Ace"'
            id: 201
            faction: "Galactic Empire"
            ship: "TIE Phantom"
            skill: 4
            points: 46
            slots: [       
                "Talent"
                "System"
                "Crew"
                "Modification"
              ]
        }
        {
            name: "Imdaar Test Pilot"
            id: 202
            faction: "Galactic Empire"
            ship: "TIE Phantom"
            skill: 3
            points: 44
            slots: [       
                "System"
                "Crew"
                "Modification"
              ]
        }
        {
            name: "Captain Jonus"
            id: 203
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Bomber"
            skill: 4
            points: 36
            slots: [       
                "Talent"
                "Torpedo"
                "Missile"
                "Missile"
                "Gunner"
                "Device"
                "Device"
                "Modification"
              ]
        }
        {
            name: "Major Rhymer"
            id: 204
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Bomber"
            skill: 4
            points: 34
            slots: [       
                "Talent"
                "Torpedo"
                "Missile"
                "Missile"
                "Gunner"
                "Device"
                "Device"
                "Modification"
              ]
        }
        {
            name: "Tomax Bren"
            id: 205
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Bomber"
            skill: 5
            points: 34
            slots: [       
                "Talent"
                "Torpedo"
                "Missile"
                "Missile"
                "Gunner"
                "Device"
                "Device"
                "Modification"
              ]
        }
        {
            name: '"Deathfire"'
            id: 206
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Bomber"
            skill: 2
            points: 32
            slots: [       
                "Torpedo"
                "Missile"
                "Missile"
                "Gunner"
                "Device"
                "Device"
                "Modification"
              ]
        }
        {
            name: "Gamma Squadron Ace"
            id: 207
            faction: "Galactic Empire"
            ship: "TIE Bomber"
            skill: 3
            points: 30
            slots: [       
                "Talent"
                "Torpedo"
                "Missile"
                "Missile"
                "Gunner"
                "Device"
                "Device"
                "Modification"
              ]
        }
        {
            name: "Scimitar Squadron Pilot"
            id: 208
            faction: "Galactic Empire"
            ship: "TIE Bomber"
            skill: 2
            points: 28
            slots: [       
                "Torpedo"
                "Missile"
                "Missile"
                "Gunner"
                "Device"
                "Device"
                "Modification"
              ]
        }
        {
            name: '"Countdown"'
            id: 209
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Striker"
            skill: 4
            points: 44
            slots: [       
                "Talent"
                "Gunner"
                "Device"
                "Modification"
              ]
        }
        {
            name: '"Pure Sabacc"'
            id: 210
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Striker"
            skill: 4
            points: 44
            slots: [       
                "Talent"
                "Gunner"
                "Device"
                "Modification"
              ]
        }
        {
            name: '"Duchess"'
            id: 211
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Striker"
            skill: 5
            points: 42
            slots: [       
                "Talent"
                "Gunner"
                "Device"
                "Modification"
              ]
        }
        {
            name: "Black Squadron Scout"
            id: 212
            faction: "Galactic Empire"
            ship: "TIE Striker"
            skill: 3
            points: 38
            slots: [       
                "Talent"
                "Gunner"
                "Device"
                "Modification"
              ]
        }
        {
            name: "Planetary Sentinel"
            id: 213
            faction: "Galactic Empire"
            ship: "TIE Striker"
            skill: 1
            points: 34
            slots: [    
                "Gunner"
                "Device"
                "Modification"
              ]
        }
        {
            name: "Rear Admiral Chiraneau"
            id: 214
            unique: true
            faction: "Galactic Empire"
            ship: "VT-49 Decimator"
            skill: 5
            points: 88
            slots: [       
                "Talent"
                "Torpedo"
                "Crew"
                "Crew"
                "Gunner"
                "Device"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Captain Oicunn"
            id: 215
            unique: true
            faction: "Galactic Empire"
            ship: "VT-49 Decimator"
            skill: 3
            points: 84
            slots: [       
                "Talent"
                "Torpedo"
                "Crew"
                "Crew"
                "Gunner"
                "Device"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Patrol Leader"
            id: 216
            faction: "Galactic Empire"
            ship: "VT-49 Decimator"
            skill: 2
            points: 80
            slots: [    
                "Torpedo"
                "Crew"
                "Crew"
                "Gunner"
                "Device"
                "Modification"
                "Title"
              ]
        }
        {
            name: '"Howlrunner"'
            id: 217
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Fighter"
            skill: 5
            points: 40
            slots: [       
                "Talent"
                "Modification"
              ]
        }
        {
            name: "Iden Versio"
            id: 218
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Fighter"
            skill: 4
            charge: 1
            points: 40
            slots: [       
                "Talent"
                "Modification"
              ]
        }
        {
            name: '"Mauler" Mithel'
            id: 219
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Fighter"
            skill: 5
            points: 32
            slots: [       
                "Talent"
                "Modification"
              ]
        }
        {
            name: '"Scourge" Skutu'
            id: 220
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Fighter"
            skill: 5
            points: 32
            slots: [       
                "Talent"
                "Modification"
              ]
        }
        {
            name: '"Wampa"'
            id: 221
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Fighter"
            skill: 1
            recurring: true
            charge: 1
            points: 30
            slots: [       
                "Modification"
              ]
        }
        {
            name: "Del Meeko"
            id: 222
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Fighter"
            skill: 4
            points: 30
            slots: [       
                "Talent"
                "Modification"
              ]
        }
        {
            name: "Gideon Hask"
            id: 223
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Fighter"
            skill: 4
            points: 30
            slots: [       
                "Talent"
                "Modification"
              ]
        }
        {
            name: "Seyn Marana"
            id: 224
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Fighter"
            skill: 4
            points: 30
            slots: [       
                "Talent"
                "Modification"
              ]
        }
        {
            name: "Valen Rudor"
            id: 225
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Fighter"
            skill: 3
            points: 28
            slots: [       
                "Talent"
                "Modification"
              ]
        }
        {
            name: '"Night Beast"'
            id: 226
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Fighter"
            skill: 2
            points: 26
            slots: [       
                "Modification"
              ]
        }
        {
            name: "Black Squadron Ace"
            id: 227
            faction: "Galactic Empire"
            ship: "TIE Fighter"
            skill: 3
            points: 26
            slots: [       
                "Talent"
                "Modification"
              ]
        }
        {
            name: "Obsidian Squadron Pilot"
            id: 228
            faction: "Galactic Empire"
            ship: "TIE Fighter"
            skill: 2
            points: 24
            slots: [       
                "Modification"
              ]
        }
        {
            name: "Academy Pilot"
            id: 229
            faction: "Galactic Empire"
            ship: "TIE Fighter"
            skill: 1
            points: 23
            slots: [       
                "Modification"
              ]
        }
        {
            name: "Spice Runner"
            id: 230
            faction: "Scum and Villainy"
            ship: "HWK-290"
            skill: 1
            points: 32
            slots: [
                "Crew"
                "Device"
                "Illicit"
                "Modification"
                "Modification"
                "Title"
            ]
        }
        {
            name: "Poe Dameron"
            id: 231
            unique: true
            faction: "Resistance"
            ship: "T-70 X-Wing"
            skill: 6
            points: 100
            charge: 1
            recurring: true 
            slots: [
                "Torpedo"
                "Astromech"
                "Modification"
                "Configuration"
                "Tech"
                "Title"
            ]
        }
        {
            name: "Lieutenant Bastian"
            id: 232
            unique: true
            faction: "Resistance"
            ship: "T-70 X-Wing"
            skill: 6
            points: 1
            slots: [
                "Torpedo"
                "Astromech"
                "Modification"
                "Configuration"
                "Tech"
            ]
        }
        {
            name: '"Midnight"'
            id: 233
            unique: true
            faction: "First Order"
            ship: "TIE/FO Fighter"
            skill: 6
            points: 100
            slots: [
                "Modification"
            ]
        }
        {
            name: '"Longshot"'
            id: 234
            unique: true
            faction: "First Order"
            ship: "TIE/FO Fighter"
            skill: 3
            points: 100
            slots: [
                "Modification"
            ]
        }
        {
            name: '"Muse"'
            id: 235
            unique: true
            faction: "First Order"
            ship: "TIE/FO Fighter"
            skill: 2
            points: 100
            slots: [
                "Modification"
            ]
        }
        {
            name: "Kylo Ren"
            id: 236
            unique: true
            faction: "First Order"
            ship: "TIE Silencer"
            skill: 5
            force: 2
            points: 100
            applies_condition: '''I'll Show You the Dark Side'''.canonicalize()
            slots: [
                "Force"
                "Tech"
                "Modification"
            ]
        }
        {
            name: '"Blackout"'
            id: 237
            unique: true
            faction: "First Order"
            ship: "TIE Silencer"
            skill: 5
            points: 100
            slots: [
                "Talent"
                "Tech"
                "Modification"
            ]
        }
        {
            name: "Lieutenant Dormitz"
            id: 238
            unique: true
            faction: "First Order"
            ship: "Upsilon-class Shuttle"
            skill: 0
            points: 100
            slots: [
                "Tech"
                "Tech"
                "Crew"
                "Crew"
                "Cannon"
                "System"
                "Modification"
            ]
        }
        {
            name: "Lulo Lampar"
            id: 239
            unique: true
            faction: "Resistance"
            ship: "RZ-2 A-Wing"
            skill: 5
            points: 100
            slots: [
                "Talent"
                "Missile"
            ]
        }
        {
            name: "Tallissan Lintra"
            id: 240
            unique: true
            faction: "Resistance"
            ship: "RZ-2 A-Wing"
            skill: 5
            charge: 1
            recurring: true
            points: 100
            slots: [
                "Talent"
                "Missile"
            ]
        }
        {
            name: "Lulo Lampar"
            id: 241
            unique: true
            faction: "Resistance"
            ship: "RZ-2 A-Wing"
            skill: 5
            points: 100
            slots: [
                "Talent"
                "Missile"
            ]
        }
        {
            name: '"Backdraft"'
            id: 242
            unique: true
            faction: "First Order"
            ship: "TIE/sf Fighter"
            skill: 4
            points: 100
            slots: [
                "Talent"
                "Tech"
                "Gunner"
                "System"
                "Modification"
            ]
        }
        {
            name: '"Quickdraw"'
            id: 243
            unique: true
            faction: "First Order"
            ship: "TIE/sf Fighter"
            skill: 0
            points: 100
            slots: [
                "Talent"
                "Tech"
                "Gunner"
                "System"
                "Modification"
            ]
        }
        {
            name: "Rey"
            id: 244
            unique: true
            faction: "Resistance"
            ship: "YT-1300 (Resistance)"
            skill: 0
            points: 100
            force: 2
            slots: [
                "Force"
                "Crew"
                "Crew"
                "Gunner"
                "Modification"
            ]
        }
        {
            name: "Han Solo (Resistance)"
            id: 245
            unique: true
            faction: "Resistance"
            ship: "YT-1300 (Resistance)"
            skill: 6
            points: 100
            slots: [
                "Talent"
                "Crew"
                "Crew"
                "Gunner"
                "Modification"
            ]
        }
        {
            name: "Chewbacca (Resistance)"
            id: 246
            unique: true
            faction: "Resistance"
            ship: "YT-1300 (Resistance)"
            skill: 4
            points: 100
            slots: [
                "Talent"
                "Crew"
                "Crew"
                "Gunner"
                "Modification"
            ]
        }
        {
            name: "Captain Seevor"
            id: 247
            unique: true
            faction: "Scum and Villainy"
            ship: "Mining Guild TIE Fighter"
            skill: 3
            charge: 1
            Recurring: true
            points: 100
            slots: [
                "Talent"
                "Modification"
            ]
        }
        {
            name: "Mining Guild Surveyor"
            id: 248
            faction: "Scum and Villainy"
            ship: "Mining Guild TIE Fighter"
            skill: 2
            points: 100
            slots: [
                "Modification"
            ]
        }
        {
            name: "Ahhav"
            id: 249
            unique: true
            faction: "Scum and Villainy"
            ship: "Mining Guild TIE Fighter"
            skill: 0
            points: 100
            slots: [
                "Talent"
                "Modification"
            ]
        }
        {
            name: "Finch Dallow"
            id: 250
            unique: true
            faction: "Resistance"
            ship: "B/SF-17 Bomber"
            skill: 0
            points: 100
            slots: [
                "Talent"
                "Modification"
            ]
        }
    ]


    upgradesById: [
       {
           name: '"Chopper" (Astromech)'
           id: 0
           slot: "Astromech"
           points: 2
           unique: true
           faction: "Rebel Alliance"
       }
       {
           name: '"Genius"'
           id: 1
           slot: "Astromech"
           points: 0
           unique: true
           faction: "Scum and Villainy"
       }
       {
           name: "R2 Astromech"
           id: 2
           slot: "Astromech"
           points: 6
           charge: 2
       }
       {
           name: "R2-D2 (Astromech)"
           id: 3
           unique: true
           slot: "Astromech"
           points: 8
           charge: 3
           faction: "Rebel Alliance"
       }
       {
           name: "R3 Astromech"
           id: 4
           slot: "Astromech"
           points: 3
       }
       {
           name: "R4 Astromech"
           id: 5
           slot: "Astromech"
           points: 2
           restriction_func: (ship) ->
                not (ship.data.large? or ship.data.medium?)
           modifier_func: (stats) ->
                for turn in [0 ... stats.maneuvers[1].length]
                    if stats.maneuvers[1][turn] > 0 
                        if stats.maneuvers[1][turn] == 3
                            stats.maneuvers[1][turn] = 1
                        else 
                            stats.maneuvers[1][turn] = 2
                    if stats.maneuvers[2][turn] > 0 
                        if stats.maneuvers[2][turn] == 3
                            stats.maneuvers[2][turn] = 1
                        else 
                            stats.maneuvers[2][turn] = 2
       }
       {
           name: "R5 Astromech"
           id: 6
           slot: "Astromech"
           points: 5
           charge: 2
       }
       {
           name: "R5-D8"
           id: 7
           unique: true
           slot: "Astromech"
           points: 7
           charge: 3
           faction: "Rebel Alliance"
       }
       {
           name: "R5-P8"
           id: 8
           slot: "Astromech"
           points: 4
           unique: true
           faction: "Scum and Villainy"
           charge: 3
       }
       {
           name: "R5-TK"
           id: 9
           slot: "Astromech"
           points: 1
           unique: true
           faction: "Scum and Villainy"
       }
       {
           name: "Heavy Laser Cannon"
           id: 10
           slot: "Cannon"
           points: 4
           attackbull: 4
           range: """2-3"""
       }
       {
           name: "Ion Cannon"
           id: 11
           slot: "Cannon"
           points: 5
           attack: 3
           range: """1-3"""
       }
       {
           name: "Jamming Beam"
           id: 12
           slot: "Cannon"
           points: 2
           attack: 3
           range: """1-2"""
       }
       {
           name: "Tractor Beam"
           id: 13
           slot: "Cannon"
           points: 3
           attack: 3
           range: """1-3"""
       }
       {
           name: "Admiral Sloane"
           id: 14
           slot: "Crew"
           points: 10
           unique: true
           faction: "Galactic Empire"
       }
       {
           name: "Agent Kallus"
           id: 15
           slot: "Crew"
           points: 6
           unique: true
           faction: "Galactic Empire"
           applies_condition: 'Hunted'.canonicalize()
       }
       {
           name: "Boba Fett"
           id: 16
           slot: "Crew"
           points: 4
           unique: true
           faction: "Scum and Villainy"
       }
       {
           name: "Baze Malbus"
           id: 17
           slot: "Crew"
           points: 8
           unique: true
           faction: "Rebel Alliance"
       }
       {
           name: "C-3PO"
           id: 18
           slot: "Crew"
           points: 12
           unique: true
           faction: "Rebel Alliance"
           modifier_func: (stats) ->
                stats.actions.push 'Calculate' if 'Calculate' not in stats.actions
       }
       {
           name: "Cassian Andor"
           id: 19
           slot: "Crew"
           points: 6
           unique: true
           faction: "Rebel Alliance"
       }
       {
           name: "Cad Bane"
           id: 20
           slot: "Crew"
           points: 4
           unique: true
           faction: "Scum and Villainy"
       }
       {
           name: "Chewbacca (Rebel)"
           id: 21
           slot: "Crew"
           xws: "chewbacca" 
           points: 5
           unique: true
           faction: "Rebel Alliance"
           charge: 2
           recurring: true 
       }
       {
           name: "Chewbacca (Scum)"
           id: 22
           slot: "Crew"
           xws: "chewbacca-crew" 
           points: 4
           unique: true
           faction: "Scum and Villainy"
       }
       {
           name: '"Chopper" (Crew)'
           id: 23
           xws: "chopper-crew" 
           slot: "Crew"
           points: 2
           unique: true
           faction: "Rebel Alliance"
       }
       {
           name: "Ciena Ree"
           id: 24
           slot: "Crew"
           points: 10
           unique: true
           faction: "Galactic Empire"
           restriction_func: (ship) ->
                "Coordinate" in ship.effectiveStats().actions or "Coordinate" in ship.effectiveStats().actionsred
       }
       {
           name: "Cikatro Vizago"
           id: 25
           slot: "Crew"
           points: 2
           unique: true
           faction: "Scum and Villainy"
       }
       {
           name: "Darth Vader"
           id: 26
           slot: "Crew"
           points: 14
           force: 1
           unique: true
           faction: "Galactic Empire"
           modifier_func: (stats) ->
                stats.force += 1
       }
       {
           name: "Death Troopers"
           id: 27
           slot: "Crew"
           points: 6
           unique: true
           faction: "Galactic Empire"
           restriction_func: (ship, upgrade_obj) ->
                ship.hasAnotherUnoccupiedSlotLike upgrade_obj
           validation_func: (ship, upgrade_obj) ->
                upgrade_obj.occupiesAnotherUpgradeSlot()
           also_occupies_upgrades: [ "Crew" ]
       }
       {
           name: "Director Krennic"
           id: 28
           slot: "Crew"
           points: 5
           unique: true
           faction: "Galactic Empire"
           applies_condition: 'Optimized Prototype'.canonicalize()
           modifier_func: (stats) ->
                stats.actions.push 'Target Lock' if 'Target Lock' not in stats.actions
       }
       {
           name: "Emperor Palpatine"
           id: 29
           slot: "Crew"
           points: 13
           force: 1
           unique: true
           faction: "Galactic Empire"
           restriction_func: (ship, upgrade_obj) ->
                ship.hasAnotherUnoccupiedSlotLike upgrade_obj
           validation_func: (ship, upgrade_obj) ->
                upgrade_obj.occupiesAnotherUpgradeSlot()
           also_occupies_upgrades: [ "Crew" ]
           modifier_func: (stats) ->
                stats.force += 1
       }
       {
           name: "Freelance Slicer"
           id: 30
           slot: "Crew"
           points: 3
       }
       {
           name: "4-LOM"
           id: 31
           slot: "Crew"
           points: 3
           unique: true
           faction: "Scum and Villainy"
       }
       {
           name: 'GNK "Gonk" Droid'
           id: 32
           slot: "Crew"
           points: 10
           charge: 1
       }
       {
           name: "Grand Inquisitor"
           id: 33
           slot: "Crew"
           points: 16
           unique: true
           faction: "Galactic Empire"
           modifier_func: (stats) ->
                stats.attack += 1
       }
       {
           name: "Grand Moff Tarkin"
           id: 34
           slot: "Crew"
           points: 10
           unique: true
           faction: "Galactic Empire"
           charge: 2
           recurring: true
           restriction_func: (ship) ->
                "Target Lock" in ship.effectiveStats().actions or "Target Lock" in ship.effectiveStats().actionsred
       }
       {
           name: "Hera Syndulla"
           id: 35
           slot: "Crew"
           points: 4
           unique: true
           faction: "Rebel Alliance"
       }
       {
           name: "IG-88D"
           id: 36
           slot: "Crew"
           points: 4
           unique: true
           faction: "Scum and Villainy"
       }
       {
           name: "Informant"
           id: 37
           slot: "Crew"
           points: 5
           unique: true
           applies_condition: 'Listening Device'.canonicalize()
       }
       {
           name: "ISB Slicer"
           id: 38
           slot: "Crew"
           points: 3
           faction: "Galactic Empire"
       }
       {
           name: "Jabba the Hutt"
           id: 39
           slot: "Crew"
           points: 8
           unique: true
           faction: "Scum and Villainy"
           charge: 4
           restriction_func: (ship, upgrade_obj) ->
                ship.hasAnotherUnoccupiedSlotLike upgrade_obj
           validation_func: (ship, upgrade_obj) ->
                upgrade_obj.occupiesAnotherUpgradeSlot()
           also_occupies_upgrades: [ "Crew" ]
       }
       {
           name: "Jyn Erso"
           id: 40
           slot: "Crew"
           points: 2
           unique: true
           faction: "Rebel Alliance"
       }
       {
           name: "Kanan Jarrus"
           id: 41
           slot: "Crew"
           points: 14
           force: 1
           unique: true
           faction: "Rebel Alliance"
           modifier_func: (stats) ->
                stats.force += 1
       }
       {
           name: "Ketsu Onyo"
           id: 42
           slot: "Crew"
           points: 5
           unique: true
           faction: "Scum and Villainy"
       }
       {
           name: "L3-37"
           id: 43
           slot: "Crew"
           points: 4
           unique: true
           faction: "Scum and Villainy"
       }
       {
           name: "Lando Calrissian (Rebel)"
           id: 44
           slot: "Crew"
           xws: "landocalrissian" 
           points: 5
           unique: true
           faction: "Rebel Alliance"
       }
       {
           name: "Lando Calrissian (Scum)"
           id: 45
           slot: "Crew"
           xws: "landocalrissian-crew" 
           points: 8
           unique: true
           faction: "Scum and Villainy"
       }
       {
           name: "Leia Organa"
           id: 46
           slot: "Crew"
           points: 8
           unique: true
           faction: "Rebel Alliance"
           charge: 3
           recurring: true 
       }
       {
           name: "Latts Razzi"
           id: 47
           slot: "Crew"
           points: 7
           unique: true
           faction: "Scum and Villainy"
       }
       {
           name: "Maul"
           id: 48
           slot: "Crew"
           points: 13
           unique: true
           force: 1
           modifier_func: (stats) ->
                stats.force += 1
           restriction_func: (ship) ->
                builder = ship.builder
                return true if builder.faction == "Scum and Villainy"
                for t, things of builder.uniques_in_use
                    return true if 'ezrabridger' in (thing.canonical_name.getXWSBaseName() for thing in things)
                false
       }
       {
           name: "Minister Tua"
           id: 49
           slot: "Crew"
           points: 7
           unique: true
           faction: "Galactic Empire"
       }
       {
           name: "Moff Jerjerrod"
           id: 50
           slot: "Crew"
           points: 12
           unique: true
           faction: "Galactic Empire"
           charge: 2
           recurring: true
           restriction_func: (ship) ->
                "Coordinate" in ship.effectiveStats().actions or "Coordinate" in ship.effectiveStats().actionsred
       }
       {
           name: "Magva Yarro"
           id: 51
           slot: "Crew"
           points: 7
           unique: true
           faction: "Rebel Alliance"
       }
       {
           name: "Nien Nunb"
           id: 52
           slot: "Crew"
           points: 5
           unique: true
           faction: "Rebel Alliance"
           modifier_func: (stats) ->
                for s, spd in (stats.maneuvers ? [])
                    continue if spd == 0
                    if s[1] > 0 
                        if s[1] = 1
                            s[1] = 2
                        else if s[1] = 3
                            s[1] = 1
                    if s[3] > 0 
                        if s[3] = 1
                            s[3] = 2
                        else if s[3] = 3
                            s[3] = 1
       }
       {
           name: "Novice Technician"
           id: 53
           slot: "Crew"
           points: 4
       }
       {
           name: "Perceptive Copilot"
           id: 54
           slot: "Crew"
           points: 10
       }
       {
           name: "Qi'ra"
           id: 55
           slot: "Crew"
           points: 2
           unique: true
           faction: "Scum and Villainy"
       }
       {
           name: "R2-D2 (Crew)"
           id: 56
           slot: "Crew"
           xws: "r2d2-crew"
           points: 8
           unique: true
           faction: "Rebel Alliance"
       }
       {
           name: "Sabine Wren"
           id: 57
           slot: "Crew"
           points: 3
           unique: true
           faction: "Rebel Alliance"
       }
       {
           name: "Saw Gerrera"
           id: 58
           slot: "Crew"
           points: 8
           unique: true
           faction: "Rebel Alliance"
       }
       {
           name: "Seasoned Navigator"
           id: 59
           slot: "Crew"
           points: 5
       }
       {
           name: "Seventh Sister"
           id: 60
           slot: "Crew"
           points: 12
           force: 1
           unique: true
           faction: "Galactic Empire"
           modifier_func: (stats) ->
                stats.force += 1
       }
       {
           name: "Tactical Officer"
           id: 61
           slot: "Crew"
           points: 2
           restriction_func: (ship) ->
                "Coordinate" in ship.effectiveStats().actionsred
           modifier_func: (stats) ->
                stats.actions.push 'Coordinate' if 'Coordinate' not in stats.actions
       }
       {
           name: "Tobias Beckett"
           id: 62
           slot: "Crew"
           points: 2
           unique: true
           faction: "Scum and Villainy"
       }
       {
           name: "0-0-0"
           id: 63
           slot: "Crew"
           points: 3
           unique: true
           restriction_func: (ship) ->
                builder = ship.builder
                return true if builder.faction == "Scum and Villainy"
                for t, things of builder.uniques_in_use
                    return true if 'darthvader' in (thing.canonical_name.getXWSBaseName() for thing in things)
                false
       }
       {
           name: "Unkar Plutt"
           id: 64
           slot: "Crew"
           points: 2
           unique: true
           faction: "Scum and Villainy"
       }
       {
           name: '"Zeb" Orrelios' 
           id: 65
           slot: "Crew"
           points: 1
           unique: true
           faction: "Rebel Alliance"
       }
       {
           name: "Zuckuss"
           id: 66
           slot: "Crew"
           points: 3
           unique: true
           faction: "Scum and Villainy"
       }
       {
           name: "Bomblet Generator"
           id: 67
           slot: "Device"
           points: 5
           charge: 2
           applies_condition: 'Bomblet'.canonicalize()
           restriction_func: (ship, upgrade_obj) ->
                ship.hasAnotherUnoccupiedSlotLike upgrade_obj
           validation_func: (ship, upgrade_obj) ->
                upgrade_obj.occupiesAnotherUpgradeSlot()
           also_occupies_upgrades: [ "Device" ]
       }
       {
           name: "Conner Nets"
           id: 68
           slot: "Device"
           points: 6
           charge: 1
           applies_condition: 'Conner Net'.canonicalize()
       }
       {
           name: "Proton Bombs"
           id: 69
           slot: "Device"
           points: 5
           charge: 2
           applies_condition: 'Proton Bomb'.canonicalize()
       }
       {
           name: "Proximity Mines"
           id: 70
           slot: "Device"
           points: 6
           charge: 2
           applies_condition: 'Proximity Mine'.canonicalize()
       }
       {
           name: "Seismic Charges"
           id: 71
           slot: "Device"
           points: 3
           charge: 2
           applies_condition: 'Seismic Charge'.canonicalize()
       }
       {
           name: "Heightened Perception"
           id: 72
           slot: "Force"
           points: 3
       }
       {
           name: "Instinctive Aim"
           id: 73
           slot: "Force"
           points: 2
       }
       {
           name: "Supernatural Reflexes"
           id: 74
           slot: "Force"
           points: 12
           restriction_func: (ship) ->
                not (ship.data.large? or ship.data.medium?)
       }
       {
           name: "Sense"
           id: 75
           slot: "Force"
           points: 6
       }
       {
           name: "Agile Gunner"
           id: 76
           slot: "Gunner"
           points: 10
       }
       {
           name: "Bistan"
           id: 77
           slot: "Gunner"
           points: 14
           unique: true
           faction: "Rebel Alliance"
       }
       {
           name: "Bossk"
           id: 78
           slot: "Gunner"
           points: 10
           unique: true
           faction: "Scum and Villainy"
       }
       {
           name: "BT-1"
           id: 79
           slot: "Gunner"
           points: 2
           unique: true
           restriction_func: (ship) ->
                builder = ship.builder
                return true if builder.faction == "Scum and Villainy"
                for t, things of builder.uniques_in_use
                    return true if 'darthvader' in (thing.canonical_name.getXWSBaseName() for thing in things)
                false
       }
       {
           name: "Dengar"
           id: 80
           slot: "Gunner"
           points: 6
           unique: true
           faction: "Scum and Villainy"
       }
       {
           name: "Ezra Bridger"
           id: 81
           slot: "Gunner"
           points: 18
           force: 1
           unique: true
           faction: "Rebel Alliance"
           modifier_func: (stats) ->
                stats.force += 1
       }
       {
           name: "Fifth Brother"
           id: 82
           slot: "Gunner"
           points: 12
           force: 1
           unique: true
           faction: "Galactic Empire"
           modifier_func: (stats) ->
                stats.force += 1
       }
       {
           name: "Greedo"
           id: 83
           slot: "Gunner"
           points: 1
           unique: true
           faction: "Scum and Villainy"
           charge: 1
       }
       {
           name: "Han Solo (Rebel)"
           id: 84
           slot: "Gunner"
           xws: "hansolo" 
           points: 12
           unique: true
           faction: "Rebel Alliance"
       }
       {
           name: "Han Solo (Scum)"
           id: 85
           slot: "Gunner"
           xws: "hansolo-gunner"
           points: 4
           unique: true
           faction: "Scum and Villainy"
       }
       {
           name: "Hotshot Gunner"
           id: 86
           slot: "Gunner"
           points: 7
       }
       {
           name: "Luke Skywalker"
           id: 87
           slot: "Gunner"
           points: 30
           force: 1
           unique: true
           faction: "Rebel Alliance"
           modifier_func: (stats) ->
                stats.force += 1
       }
       {
           name: "Skilled Bombardier"
           id: 88
           slot: "Gunner"
           points: 2
       }
       {
           name: "Veteran Tail Gunner"
           id: 89
           slot: "Gunner"
           points: 4
           restriction_func: (ship) ->
                ship.data.attackb?
       }
       {
           name: "Veteran Turret Gunner"
           id: 90
           slot: "Gunner"
           points: 8
           restriction_func: (ship) ->
                "Rotate Arc" in ship.effectiveStats().actions or "Rotate Arc" in ship.effectiveStats().actionsred
       }
       {
           name: "Cloaking Device"
           id: 91
           slot: "Illicit"
           points: 5
           unique: true
           charge: 2
           restriction_func: (ship) ->
                not(ship.data.large?)
       }
       {
           name: "Contraband Cybernetics"
           id: 92
           slot: "Illicit"
           points: 5
           charge: 1
       }
       {
           name: "Deadman's Switch"
           id: 93
           slot: "Illicit"
           points: 2
       }
       {
           name: "Feedback Array"
           id: 94
           slot: "Illicit"
           points: 4
       }
       {
           name: "Inertial Dampeners"
           id: 95
           slot: "Illicit"
           points: 1
       }
       {
           name: "Rigged Cargo Chute"
           id: 96
           slot: "Illicit"
           points: 4
           charge: 1
           restriction_func: (ship) ->
                ship.data.medium?  or ship.data.large?
       }
       {
           name: "Barrage Rockets"
           id: 97
           slot: "Missile"
           points: 6
           attack: 3
           range: """2-3"""
           charge: 5
           restriction_func: (ship, upgrade_obj) ->
               ship.hasAnotherUnoccupiedSlotLike upgrade_obj
           validation_func: (ship, upgrade_obj) ->
               upgrade_obj.occupiesAnotherUpgradeSlot()
           also_occupies_upgrades: [ 'Missile' ]
       }
       {
           name: "Cluster Missiles"
           id: 98
           slot: "Missile"
           points: 5
           attack: 3
           range: """1-2"""
           charge: 4
       }
       {
           name: "Concussion Missiles"
           id: 99
           slot: "Missile"
           points: 6
           attack: 3
           range: """2-3"""
           charge: 3
       }
       {
           name: "Homing Missiles"
           id: 100
           slot: "Missile"
           points: 3
           attack: 4
           range: """2-3"""
           charge: 2
       }
       {
           name: "Ion Missiles"
           id: 101
           slot: "Missile"
           points: 4
           attack: 3
           range: """2-3"""
           charge: 3
       }
       {
           name: "Proton Rockets"
           id: 102
           slot: "Missile"
           points: 7
           attackbull: 5
           range: """1-2"""
           charge: 1
       }
       {
           name: "Ablative Plating"
           id: 103
           slot: "Modification"
           points: 4
           charge: 2
           restriction_func: (ship) ->
                ship.data.medium?  or ship.data.large?
       }
       {
           name: "Advanced SLAM"
           id: 104
           slot: "Modification"
           points: 3
           restriction_func: (ship) -> 
                "Slam" in ship.effectiveStats().actions or "Slam" in ship.effectiveStats().actionsred
       }
       {
           name: "Afterburners"
           id: 105
           slot: "Modification"
           points: 8
           charge: 2
           restriction_func: (ship) ->
                not ((ship.data.large ? false) or (ship.data.medium ? false))
       }
       {
           name: "Electronic Baffle"
           id: 106
           slot: "Modification"
           points: 2
       }
       {
           name: "Engine Upgrade"
           id: 107
           slot: "Modification"
           points: '*'
           basepoints: 3
           variablebase: true
           restriction_func: (ship) ->
                "Boost" in ship.effectiveStats().actionsred
           modifier_func: (stats) ->
                stats.actions.push 'Boost' if 'Boost' not in stats.actions
       }
       {
           name: "Munitions Failsafe"
           id: 108
           slot: "Modification"
           points: 2
       }
       {
           name: "Static Discharge Vanes"
           id: 109
           slot: "Modification"
           points: 6
       }
       {
           name: "Tactical Scrambler"
           id: 110
           slot: "Modification"
           points: 2
           restriction_func: (ship) ->
                ship.data.medium?  or ship.data.large?
       }
       {
           name: "Advanced Sensors"
           id: 111
           slot: "System"
           points: 8
       }
       {
           name: "Collision Detector"
           id: 112
           slot: "System"
           points: 5
           charge: 2
       }
       {
           name: "Fire-Control System"
           id: 113
           slot: "System"
           points: 3
       }
       {
           name: "Trajectory Simulator"
           id: 114
           slot: "System"
           points: 3
       }
       {
           name: "Composure"
           id: 115
           slot: "Talent"
           points: 2
           restriction_func: (ship) ->
                "Focus" in ship.effectiveStats().actions or "Focus" in ship.effectiveStats().actionsred
       }
       {
           name: "Crack Shot"
           id: 116
           slot: "Talent"
           points: 1
           charge: 1
       }
       {
           name: "Daredevil"
           id: 117
           slot: "Talent"
           points: 3
           restriction_func: (ship) ->
                "Boost" in ship.effectiveStats().actions
       }
       {
           name: "Debris Gambit"
           id: 118
           slot: "Talent"
           points: 2
           restriction_func: (ship) ->
                not (ship.data.large?)
           modifier_func: (stats) ->
                stats.actionsred.push 'Evade' if 'Evade' not in stats.actionsred
       }
       {
           name: "Elusive"
           id: 119
           slot: "Talent"
           points: 3
           charge: 1
       }
       {
           name: "Expert Handling"
           id: 120
           slot: "Talent"
           points: '*'
           basepoints: 2
           variablebase: true
           restriction_func: (ship) ->
                "Barrel Roll" in ship.effectiveStats().actionsred
           modifier_func: (stats) ->
                stats.actions.push 'Barrel Roll' if 'Barrel Roll' not in stats.actions
       }
       {
           name: "Fearless"
           id: 121
           slot: "Talent"
           points: 3
           faction: "Scum and Villainy"
       }
       {
           name: "Intimidation"
           id: 122
           slot: "Talent"
           points: 3
       }
       {
           name: "Juke"
           id: 123
           slot: "Talent"
           points: 4
           restriction_func: (ship) ->
                not (ship.data.large?)
       }
       {
           name: "Lone Wolf"
           id: 124
           slot: "Talent"
           points: 4
           unique: true
           recurring: true
           charge: 1
       }
       {
           name: "Marksmanship"
           id: 125
           slot: "Talent"
           points: 1
       }
       {
           name: "Outmaneuver"
           id: 126
           slot: "Talent"
           points: 6
       }
       {
           name: "Predator"
           id: 127
           slot: "Talent"
           points: 2
       }
       {
           name: "Ruthless"
           id: 128
           slot: "Talent"
           points: 1
           faction: "Galactic Empire"
       }
       {
           name: "Saturation Salvo"
           id: 129
           slot: "Talent"
           points: 6
           restriction_func: (ship) ->
                "Reload" in ship.effectiveStats().actions or "Reload" in ship.effectiveStats().actionsred
       }
       {
           name: "Selfless"
           id: 130
           slot: "Talent"
           points: 3
           faction: "Rebel Alliance"
       }
       {
           name: "Squad Leader"
           id: 131
           slot: "Talent"
           points: 4
           unique: true
           modifier_func: (stats) ->
                if stats.actionsred?
                    stats.actionsred.push 'Coordinate' if 'Coordinate' not in stats.actionsred
       }
       {
           name: "Swarm Tactics"
           id: 132
           slot: "Talent"
           points: 3
       }
       {
           name: "Trick Shot"
           id: 133
           slot: "Talent"
           points: 1
       }
       {
           name: "Adv. Proton Torpedoes"
           id: 134
           slot: "Torpedo"
           points: 6
           attack: 5
           range: """1"""
           charge: 1
       }
       {
           name: "Ion Torpedoes"
           id: 135
           slot: "Torpedo"
           points: 6
           attack: 4
           range: """2-3"""
           charge: 2
       }
       {
           name: "Proton Torpedoes"
           id: 136
           slot: "Torpedo"
           points: 9
           attack: 4
           range: """2-3"""
           charge: 2
       }
       {
           name: "Dorsal Turret"
           id: 137
           slot: "Turret"
           points: 4
           attackt: 2
           range: """1-2"""
           modifier_func: (stats) ->
                stats.actions.push 'Rotate Arc' if 'Rotate Arc' not in stats.actions
       }
       {
           name: "Ion Cannon Turret"
           id: 138
           slot: "Turret"
           points: 6
           attackt: 3
           range: """1-2"""
           modifier_func: (stats) ->
                stats.actions.push 'Rotate Arc' if 'Rotate Arc' not in stats.actions
       }
       {
           name: "Os-1 Arsenal Loadout"
           id: 139
           points: 0
           slot: "Configuration"
           ship: "Alpha-Class Star Wing"
           confersAddons: [
                {
                    type: exportObj.Upgrade
                    slot: "Torpedo"
                }
                {
                    type: exportObj.Upgrade
                    slot: "Missile"
                }
            ]
       }
       {
           name: "Pivot Wing"
           id: 140
           points: 0
           slot: "Configuration"
           ship: "U-Wing"
       }
       {
           name: "Pivot Wing (Open)"
           id: 141
           points: 0
           skip: true 
       }
       {
           name: "Servomotor S-Foils"
           id: 142
           points: 0
           slot: "Configuration"
           ship: "X-Wing"
       }
       {
           name: "Blank"
           id: 143
           skip: true
       }
       {
           name: "Xg-1 Assault Configuration"
           id: 144
           points: 0
           slot: "Configuration"
           ship: "Alpha-Class Star Wing"
           confersAddons: [
                {
                    type: exportObj.Upgrade
                    slot: "Cannon"
                }
           ]
       }
       {
           name: "L3-37's Programming"
           id: 145
           points: 0
           slot: "Configuration"
           faction: "Scum and Villainy"
       }
       {
           name: "Andrasta"
           id: 146
           slot: "Title"
           points: 6
           unique: true
           faction: "Scum and Villainy"
           ship: "Firespray-31"
           confersAddons: [
              {
                  type: exportObj.Upgrade
                  slot: "Device"
              }
            ]
       }
       {
           name: "Dauntless"
           id: 147
           slot: "Title"
           points: 6
           unique: true
           faction: "Galactic Empire"
           ship: "VT-49 Decimator"
       }
       {
           name: "Ghost"
           id: 148
           slot: "Title"
           unique: true
           points: 0
           faction: "Rebel Alliance"
           ship: "VCX-100"
       }
       {
           name: "Havoc"
           id: 149
           slot: "Title"
           points: 4
           unique: true
           faction: "Scum and Villainy"
           ship: "Scurrg H-6 Bomber"
           unequips_upgrades: [
                'Crew'
            ]
           also_occupies_upgrades: [
                'Crew'
           ]
           confersAddons: [
                {
                    type: exportObj.Upgrade
                    slot: 'System'
                }
                {
                    type: exportObj.Upgrade
                    slot: 'Astromech'
                }
           ]
       }
       {
           name: "Hound's Tooth"
           id: 150
           slot: "Title"
           points: 1
           unique: true
           faction: "Scum and Villainy"
           ship: "YV-666"
       }
       {
           name: "IG-2000"
           id: 151
           slot: "Title"
           points: 2
           faction: "Scum and Villainy"
           ship: "Aggressor"
       }
       {
           name: "Lando's Millennium Falcon"
           id: 152
           slot: "Title"
           points: 6
           unique: true
           faction: "Scum and Villainy"
           ship: "YT-1300 (Scum)"
       }
       {
           name: "Marauder"
           id: 153
           slot: "Title"
           points: 3
           unique: true
           faction: "Scum and Villainy"
           ship: "Firespray-31"
           confersAddons: [
              {
                  type: exportObj.Upgrade
                  slot: "Gunner"
              }
            ]       }
       {
           name: "Millennium Falcon"
           id: 154
           slot: "Title"
           points: 6
           unique: true
           faction: "Rebel Alliance"
           ship: "YT-1300"
           modifier_func: (stats) ->
                stats.actions.push 'Evade' if 'Evade' not in stats.actions
       }
       {
           name: "Mist Hunter"
           id: 155
           slot: "Title"
           points: 2
           unique: true
           faction: "Scum and Villainy"
           ship: "G-1A Starfighter"
           confersAddons: [
                {
                    type: exportObj.Upgrade
                    slot: "Cannon"
                }
           ]
       }
       {
           name: "Moldy Crow"
           id: 156
           slot: "Title"
           points: 12
           unique: true
           ship: "HWK-290"
       }
       {
           name: "Outrider"
           id: 157
           slot: "Title"
           points: 14
           unique: true
           faction: "Rebel Alliance"
           ship: "YT-2400"
       }
       {
           name: "Phantom (Sheathipede)"
           id: 158
           slot: "Title"
           points: 2
           unique: true
           faction: "Rebel Alliance"
           ship: "Sheathipede-Class Shuttle"
       }
       {
           name: "Punishing One"
           id: 159
           slot: "Title"
           points: 8
           unique: true
           faction: "Scum and Villainy"
           ship: "JumpMaster 5000"
           unequips_upgrades: [
                'Crew'
           ]
           also_occupies_upgrades: [
                'Crew'
           ]
           confersAddons: [
                {
                    type: exportObj.Upgrade
                    slot: 'Astromech'
                }
           ]
       }
       {
           name: "Shadow Caster"
           id: 160
           slot: "Title"
           points: 6
           unique: true
           faction: "Scum and Villainy"
           ship: "Lancer-class Pursuit Craft"
       }
       {
           name: "Slave I"
           id: 161
           slot: "Title"
           points: 5
           unique: true
           faction: "Scum and Villainy"
           ship: "Firespray-31"
           confersAddons: [
              {
                  type: exportObj.Upgrade
                  slot: "Torpedo"
              }
            ]       }
       {
           name: "ST-321"
           id: 162
           slot: "Title"
           points: 6
           unique: true
           faction: "Galactic Empire"
           ship: "Lambda-Class Shuttle"
       }
       {
           name: "Virago"
           id: 163
           slot: "Title"
           points: 10
           unique: true
           charge: 2
           ship: "StarViper"
           modifier_func: (stats) ->
                stats.shields += 1       
           confersAddons: [
                {
                    type: exportObj.Upgrade
                    slot: "Modification"
                }
            ]
       }
       {
           name: "Hull Upgrade"
           id: 164
           slot: "Modification"
           points: '*'
           basepoints: 2
           variableagility: true
           modifier_func: (stats) ->
                stats.hull += 1       
       }
       {
           name: "Shield Upgrade"
           id: 165
           slot: "Modification"
           points: '*'
           basepoints: 3
           variableagility: true
           modifier_func: (stats) ->
                stats.shields += 1       
       }
       {
           name: "Stealth Device"
           id: 166
           slot: "Modification"
           points: '*'
           basepoints: 3
           variableagility: true
           charge: 1
           modifier_func: (stats) ->
                stats.agility += 1       
       }
       {
           name: "Phantom"
           id: 167
           slot: "Title"
           points: 2
           unique: true
           faction: "Rebel Alliance"
           ship: "Attack Shuttle"
       }
       {
            name: "Hardpoint: Cannon"
            id: 168
            slot: "Hardpoint"
            points: 0
            confersAddons: [
                {
                    type: exportObj.Upgrade
                    slot: "Cannon"
                }
            ]
       }
       {
            name: "Hardpoint: Torpedo"
            id: 169
            slot: "Hardpoint"
            points: 0
            confersAddons: [
                {
                    type: exportObj.Upgrade
                    slot: "Torpedo"
                }
            ]
       }
       {
            name: "Hardpoint: Missile"
            id: 170
            slot: "Hardpoint"
            points: 0
            confersAddons: [
                {
                    type: exportObj.Upgrade
                    slot: "Missile"
                }
            ]
       }
       {
            name: "Black One"
            id: 171
            slot: "Title"
            charge: 1
            points: 0
            faction: "Resistance"
            ship: "T-70 X-Wing"
            modifier_func: (stats) ->
                stats.actions.push 'Slam' if 'Slam' not in stats.actions
       }
       {
            name: "Heroic"
            id: 172
            slot: "Talent"
            points: 0
            faction: "Resistance"
       }
       {
            name: "Rose Tico"
            id: 173
            slot: "Crew"
            points: 0
            faction: "Resistance"
       }
       {
            name: "Finn"
            id: 174
            slot: "Gunner"
            points: 0
            faction: "Resistance"
       }
       {
            name: "Integrated S-Foils"
            id: 175
            slot: "Configuration"
            points: 0
            faction: "Resistance"
            ship: "T-70 X-Wing"
       }
       {
            name: "Integrated S-Foils (Open)"
            id: 176
            skip: true
       }
       {
            name: "Targeting Synchronizer"
            id: 177
            slot: "Tech"
            points: 0
            restriction_func: (ship) ->
                "Target Lock" in ship.effectiveStats().actions or "Target Lock" in ship.effectiveStats().actionsred
       }
       {
            name: "Primed Thrusters"
            id: 178
            slot: "Tech"
            points: 0
       }
       {
            name: "Kylo Ren (Crew)"
            id: 179
            slot: "Crew"
            points: 0
            force: 1
            faction: "First Order"
            applies_condition: '''I'll Show You the Dark Side'''.canonicalize()
            modifier_func: (stats) ->
                stats.force += 1
       }
       {
            name: "General Hux"
            id: 180
            slot: "Crew"
            points: 0
            faction: "First Order"
       }
       {
            name: "Fanatical"
            id: 181
            slot: "Talent"
            points: 0
            faction: "First Order"
       }
       {
            name: "Special Forces Gunner"
            id: 182
            slot: "Gunner"
            points: 0
            faction: "First Order"
       }
       {
            name: "Captain Phasma"
            id: 183
            slot: "Crew"
            points: 0
            faction: "First Order"
       }
       {
            name: "Supreme Leader Snoke"
            id: 184
            slot: "Crew"
            points: 0
            force: 1
            faction: "First Order"
            restriction_func: (ship, upgrade_obj) ->
                ship.hasAnotherUnoccupiedSlotLike upgrade_obj
            validation_func: (ship, upgrade_obj) ->
                upgrade_obj.occupiesAnotherUpgradeSlot()
            also_occupies_upgrades: [ "Crew" ]
            modifier_func: (stats) ->
                stats.force += 1
       }
       {
            name: "Hyperspace Tracking Data"
            id: 185
            slot: "Tech"
            points: 0
       }
       {
            name: "Advanced Optics"
            id: 186
            slot: "Tech"
            points: 0
       }
       {
            name: "Rey (Gunner)"
            id: 187
            slot: "Gunner"
            points: 0
            force: 1
            faction: "Resistance"
            modifier_func: (stats) ->
                stats.force += 1
       }
    ]


    conditionsById: [
        {
            name: '''Zero Condition'''
            id: 0
        }
        {
            name: 'Suppressive Fire'
            id: 1
            unique: true
        }
        {
            name: 'Hunted'
            id: 2
            unique: true
        }
        {
            name: 'Listening Device'
            id: 3
            unique: true
        }
        {
            name: 'Optimized Prototype'
            id: 4
            unique: true
        }
        {
            name: '''I'll Show You the Dark Side'''
            id: 5
            unique: true
        }
        {
            name: 'Proton Bomb'
            id: 6
        }
        {
            name: 'Seismic Charge'
            id: 7
        }
        {
            name: 'Bomblet'
            id: 8
        }
        {
            name: 'Loose Cargo'
            id: 9
        }
        {
            name: 'Conner Net'
            id: 10
        }
        {
            name: 'Proximity Mine'
            id: 11
        }
    ]

    modificationsById: [

    ]

    titlesById: [

    ]


exportObj.setupCardData = (basic_cards, pilot_translations, upgrade_translations, condition_translations, modification_translations, title_translations) ->
    # assert that each ID is the index into BLAHById (should keep this, in general)
    for pilot_data, i in basic_cards.pilotsById
        if pilot_data.id != i
            throw new Error("ID mismatch: pilot at index #{i} has ID #{pilot_data.id}")
    for upgrade_data, i in basic_cards.upgradesById
        if upgrade_data.id != i
            throw new Error("ID mismatch: upgrade at index #{i} has ID #{upgrade_data.id}")
    for title_data, i in basic_cards.titlesById
        if title_data.id != i
            throw new Error("ID mismatch: title at index #{i} has ID #{title_data.id}")
    for modification_data, i in basic_cards.modificationsById
        if modification_data.id != i
            throw new Error("ID mismatch: modification at index #{i} has ID #{modification_data.id}")
    for condition_data, i in basic_cards.conditionsById
        if condition_data.id != i
            throw new Error("ID mismatch: condition at index #{i} has ID #{condition_data.id}")

    exportObj.pilots = {}
    # Assuming a given pilot is unique by name...
    for pilot_data in basic_cards.pilotsById
        unless pilot_data.skip?
            pilot_data.sources = []
            pilot_data.english_name = pilot_data.name
            pilot_data.english_ship = pilot_data.ship
            pilot_data.canonical_name = pilot_data.english_name.canonicalize() unless pilot_data.canonical_name?
            exportObj.pilots[pilot_data.name] = pilot_data
    # pilot_name is the English version here as it's the common index into
    # basic card info
    for pilot_name, translations of pilot_translations
        for field, translation of translations
            try
                exportObj.pilots[pilot_name][field] = translation
            catch e
                console.error "Cannot find translation for attribute #{field} for pilot #{pilot_name}"
                throw e
                
    exportObj.upgrades = {}
    for upgrade_data in basic_cards.upgradesById
        unless upgrade_data.skip?
            upgrade_data.sources = []
            upgrade_data.english_name = upgrade_data.name
            upgrade_data.canonical_name = upgrade_data.english_name.canonicalize() unless upgrade_data.canonical_name?
            exportObj.upgrades[upgrade_data.name] = upgrade_data
    for upgrade_name, translations of upgrade_translations
        for field, translation of translations
            try
                exportObj.upgrades[upgrade_name][field] = translation
            catch e
                console.error "Cannot find translation for attribute #{field} for upgrade #{upgrade_name}"
                throw e

    exportObj.modifications = {}
    for modification_data in basic_cards.modificationsById
        unless modification_data.skip?
            modification_data.sources = []
            modification_data.english_name = modification_data.name
            modification_data.canonical_name = modification_data.english_name.canonicalize() unless modification_data.canonical_name?
            exportObj.modifications[modification_data.name] = modification_data
    for modification_name, translations of modification_translations
        for field, translation of translations
            try
                exportObj.modifications[modification_name][field] = translation
            catch e
                console.error "Cannot find translation for attribute #{field} for modification #{modification_name}"
                throw e

    exportObj.titles = {}
    for title_data in basic_cards.titlesById
        unless title_data.skip?
            title_data.sources = []
            title_data.english_name = title_data.name
            title_data.canonical_name = title_data.english_name.canonicalize() unless title_data.canonical_name?
            exportObj.titles[title_data.name] = title_data
    for title_name, translations of title_translations
        for field, translation of translations
            try
                exportObj.titles[title_name][field] = translation
            catch e
                console.error "Cannot find translation for attribute #{field} for title #{title_name}"
                throw e

    exportObj.conditions = {}
    for condition_data in basic_cards.conditionsById
        unless condition_data.skip?
            condition_data.sources = []
            condition_data.english_name = condition_data.name
            condition_data.canonical_name = condition_data.english_name.canonicalize() unless condition_data.canonical_name?
            exportObj.conditions[condition_data.name] = condition_data
    for condition_name, translations of condition_translations
        for field, translation of translations
            try
                exportObj.conditions[condition_name][field] = translation
            catch e
                console.error "Cannot find translation for attribute #{field} for condition #{condition_name}"
                throw e

    for ship_name, ship_data of basic_cards.ships
        ship_data.english_name ?= ship_name
        ship_data.canonical_name ?= ship_data.english_name.canonicalize()

    # Set sources from manifest
    for expansion, cards of exportObj.manifestByExpansion
        for card in cards
            continue if card.skipForSource # heavy scyk special case :(
            try
                switch card.type
                    when 'pilot'
                        exportObj.pilots[card.name].sources.push expansion
                    when 'upgrade'
                        exportObj.upgrades[card.name].sources.push expansion
                    when 'modification'
                        exportObj.modifications[card.name].sources.push expansion
                    when 'title'
                        exportObj.titles[card.name].sources.push expansion
                    when 'ship'
                        # Not used for sourcing
                        ''
                    else
                        throw new Error("Unexpected card type #{card.type} for card #{card.name} of #{expansion}")
            catch e
                console.error "Error adding card #{card.name} (#{card.type}) from #{expansion}"

    for name, card of exportObj.pilots
        card.sources = card.sources.sort()
    for name, card of exportObj.upgrades
        card.sources = card.sources.sort()
    for name, card of exportObj.modifications
        card.sources = card.sources.sort()
    for name, card of exportObj.titles
        card.sources = card.sources.sort()

    exportObj.expansions = {}

    exportObj.pilotsById = {}
    exportObj.pilotsByLocalizedName = {}
    for pilot_name, pilot of exportObj.pilots
        exportObj.fixIcons pilot
        exportObj.pilotsById[pilot.id] = pilot
        exportObj.pilotsByLocalizedName[pilot.name] = pilot
        for source in pilot.sources
            exportObj.expansions[source] = 1 if source not of exportObj.expansions
    if Object.keys(exportObj.pilotsById).length != Object.keys(exportObj.pilots).length
        throw new Error("At least one pilot shares an ID with another")

    exportObj.pilotsByFactionCanonicalName = {}
    # uniqueness can't be enforced just be canonical name, but by the base part
    exportObj.pilotsByUniqueName = {}
    for pilot_name, pilot of exportObj.pilots
        ((exportObj.pilotsByFactionCanonicalName[pilot.faction] ?= {})[pilot.canonical_name] ?= []).push pilot
        (exportObj.pilotsByUniqueName[pilot.canonical_name.getXWSBaseName()] ?= []).push pilot

    exportObj.pilotsByFactionXWS = {}
    for pilot_name, pilot of exportObj.pilots
        ((exportObj.pilotsByFactionXWS[pilot.faction] ?= {})[pilot.xws] ?= []).push pilot
        

    exportObj.upgradesById = {}
    exportObj.upgradesByLocalizedName = {}
    for upgrade_name, upgrade of exportObj.upgrades
        exportObj.fixIcons upgrade
        exportObj.upgradesById[upgrade.id] = upgrade
        exportObj.upgradesByLocalizedName[upgrade.name] = upgrade
        for source in upgrade.sources
            exportObj.expansions[source] = 1 if source not of exportObj.expansions
    if Object.keys(exportObj.upgradesById).length != Object.keys(exportObj.upgrades).length
        throw new Error("At least one upgrade shares an ID with another")

    exportObj.upgradesBySlotCanonicalName = {}
    exportObj.upgradesBySlotXWSName = {}
    exportObj.upgradesBySlotUniqueName = {}
    for upgrade_name, upgrade of exportObj.upgrades
        (exportObj.upgradesBySlotCanonicalName[upgrade.slot] ?= {})[upgrade.canonical_name] = upgrade
        (exportObj.upgradesBySlotXWSName[upgrade.slot] ?= {})[upgrade.xws] = upgrade
        (exportObj.upgradesBySlotUniqueName[upgrade.slot] ?= {})[upgrade.canonical_name.getXWSBaseName()] = upgrade

    exportObj.modificationsById = {}
    exportObj.modificationsByLocalizedName = {}
    for modification_name, modification of exportObj.modifications
        exportObj.fixIcons modification
        # Modifications cannot be added to huge ships unless specifically allowed
        if modification.huge?
            unless modification.restriction_func?
                modification.restriction_func = exportObj.hugeOnly
        else unless modification.restriction_func?
            modification.restriction_func = (ship) ->
                not (ship.data.huge ? false)
        exportObj.modificationsById[modification.id] = modification
        exportObj.modificationsByLocalizedName[modification.name] = modification
        for source in modification.sources
            exportObj.expansions[source] = 1 if source not of exportObj.expansions
    if Object.keys(exportObj.modificationsById).length != Object.keys(exportObj.modifications).length
        throw new Error("At least one modification shares an ID with another")

    exportObj.modificationsByCanonicalName = {}
    exportObj.modificationsByUniqueName = {}
    for modification_name, modification of exportObj.modifications
        (exportObj.modificationsByCanonicalName ?= {})[modification.canonical_name] = modification
        (exportObj.modificationsByUniqueName ?= {})[modification.canonical_name.getXWSBaseName()] = modification

    exportObj.titlesById = {}
    exportObj.titlesByLocalizedName = {}
    for title_name, title of exportObj.titles
        exportObj.fixIcons title
        exportObj.titlesById[title.id] = title
        exportObj.titlesByLocalizedName[title.name] = title
        for source in title.sources
            exportObj.expansions[source] = 1 if source not of exportObj.expansions
    if Object.keys(exportObj.titlesById).length != Object.keys(exportObj.titles).length
        throw new Error("At least one title shares an ID with another")

    exportObj.conditionsById = {}
    for condition_name, condition of exportObj.conditions
        exportObj.fixIcons condition
        exportObj.conditionsById[condition.id] = condition
        for source in condition.sources
            exportObj.expansions[source] = 1 if source not of exportObj.expansions
    if Object.keys(exportObj.conditionsById).length != Object.keys(exportObj.conditions).length
        throw new Error("At least one condition shares an ID with another")

    exportObj.titlesByShip = {}
    for title_name, title of exportObj.titles
        if title.ship not of exportObj.titlesByShip
            exportObj.titlesByShip[title.ship] = []
        exportObj.titlesByShip[title.ship].push title

    exportObj.titlesByCanonicalName = {}
    exportObj.titlesByUniqueName = {}
    for title_name, title of exportObj.titles
        # Special cases :(
        if title.canonical_name == '"Heavy Scyk" Interceptor'.canonicalize()
            ((exportObj.titlesByCanonicalName ?= {})[title.canonical_name] ?= []).push title
            ((exportObj.titlesByUniqueName ?= {})[title.canonical_name.getXWSBaseName()] ?= []).push title
        else
            (exportObj.titlesByCanonicalName ?= {})[title.canonical_name] = title
            (exportObj.titlesByUniqueName ?= {})[title.canonical_name.getXWSBaseName()] = title

    exportObj.conditionsByCanonicalName = {}
    for condition_name, condition of exportObj.conditions
        (exportObj.conditionsByCanonicalName ?= {})[condition.canonical_name] = condition

    exportObj.expansions = Object.keys(exportObj.expansions).sort()

exportObj.fixIcons = (data) ->
    if data.text?
        data.text = data.text
            .replace(/%ASTROMECH%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-astromech"></i>')
            .replace(/%BULLSEYEARC%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-bullseyearc"></i>')
            .replace(/%GUNNER%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-gunner"></i>')
            .replace(/%SINGLETURRETARC%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-singleturretarc"></i>')
            .replace(/%FRONTARC%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-frontarc"></i>')
            .replace(/%REARARC%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-reararc"></i>')
            .replace(/%ROTATEARC%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-rotatearc"></i>')
            .replace(/%FULLFRONTARC%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-fullfrontarc"></i>')
            .replace(/%FULLREARARC%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-fullreararc"></i>')
            .replace(/%DEVICE%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-device"></i>')
            .replace(/%FORCE%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-forcecharge"></i>')
            .replace(/%CHARGE%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-charge"></i>')
            .replace(/%CALCULATE%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-calculate"></i>')
            .replace(/%BANKLEFT%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-bankleft"></i>')
            .replace(/%BANKRIGHT%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-bankright"></i>')
            .replace(/%BARRELROLL%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-barrelroll"></i>')
            .replace(/%BOMB%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-bomb"></i>')
            .replace(/%BOOST%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-boost"></i>')
            .replace(/%CANNON%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-cannon"></i>')
            .replace(/%CARGO%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-cargo"></i>')
            .replace(/%CLOAK%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-cloak"></i>')
            .replace(/%COORDINATE%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-coordinate"></i>')
            .replace(/%CRIT%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-crit"></i>')
            .replace(/%CREW%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-crew"></i>')
            .replace(/%DUALCARD%/g, '<span class="card-restriction">Dual card.</span>')
            .replace(/%ELITE%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-elite"></i>')
            .replace(/%EVADE%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-evade"></i>')
            .replace(/%FOCUS%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-focus"></i>')
            .replace(/%HARDPOINT%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-hardpoint"></i>')
            .replace(/%HIT%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-hit"></i>')
            .replace(/%ILLICIT%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-illicit"></i>')
            .replace(/%JAM%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-jam"></i>')
            .replace(/%KTURN%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-kturn"></i>')
            .replace(/%MISSILE%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-missile"></i>')
            .replace(/%RECOVER%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-recover"></i>')
            .replace(/%REINFORCE%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-reinforce"></i>')
            .replace(/%SALVAGEDASTROMECH%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-salvagedastromech"></i>')
            .replace(/%SLAM%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-slam"></i>')
            .replace(/%SLOOPLEFT%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-sloopleft"></i>')
            .replace(/%SLOOPRIGHT%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-sloopright"></i>')
            .replace(/%STRAIGHT%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-straight"></i>')
            .replace(/%STOP%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-stop"></i>')
            .replace(/%SYSTEM%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-system"></i>')
            .replace(/%LOCK%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-lock"></i>')
            .replace(/%TEAM%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-team"></i>')
            .replace(/%TECH%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-tech"></i>')
            .replace(/%TORPEDO%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-torpedo"></i>')
            .replace(/%TROLLLEFT%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-trollleft"></i>')
            .replace(/%TROLLRIGHT%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-trollright"></i>')
            .replace(/%TURNLEFT%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-turnleft"></i>')
            .replace(/%TURNRIGHT%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-turnright"></i>')
            .replace(/%TURRET%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-turret"></i>')
            .replace(/%UTURN%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-kturn"></i>')
            .replace(/%HUGESHIPONLY%/g, '<span class="card-restriction">Huge ship only.</span>')
            .replace(/%LARGESHIPONLY%/g, '<span class="card-restriction">Large ship only.</span>')
            .replace(/%SMALLSHIPONLY%/g, '<span class="card-restriction">Small ship only.</span>')
            .replace(/%REBELONLY%/g, '<span class="card-restriction">Rebel only.</span>')
            .replace(/%IMPERIALONLY%/g, '<span class="card-restriction">Imperial only.</span>')
            .replace(/%SCUMONLY%/g, '<span class="card-restriction">Scum only.</span>')
            .replace(/%LIMITED%/g, '<span class="card-restriction">Limited.</span>')
            .replace(/%LINEBREAK%/g, '<br /><br />')
            .replace(/%DE_HUGESHIPONLY%/g, '<span class="card-restriction">Nur für riesige Schiffe.</span>')
            .replace(/%DE_LARGESHIPONLY%/g, '<span class="card-restriction">Nur für grosse Schiffe.</span>')
            .replace(/%DE_REBELONLY%/g, '<span class="card-restriction">Nur für Rebellen.</span>')
            .replace(/%DE_IMPERIALONLY%/g, '<span class="card-restriction">Nur für das Imperium.</span>')
            .replace(/%DE_SCUMONLY%/g, '<span class="card-restriction">Nur für Abschaum & Kriminelle.</span>')
            .replace(/%DE_GOZANTIONLY%/g, '<span class="card-restriction">Nur für Kreuzer der <em>Gozanti</em>-Klasse.</span>')
            .replace(/%DE_LIMITED%/g, '<span class="card-restriction">Limitiert.</span>')
            .replace(/%DE_SMALLSHIPONLY%/g, '<span class="card-restriction">Nur für kleine Schiffe.</span>')
            .replace(/%DE_DUALCARD%/g, '<span class="card-restriction">Doppelseiteige Karte.</span>')
            .replace(/%FR_HUGESHIPONLY%/g, '<span class="card-restriction">Vaisseau immense uniquement.</span>')
            .replace(/%FR_LARGESHIPONLY%/g, '<span class="card-restriction">Grand vaisseau uniquement.</span>')
            .replace(/%FR_REBELONLY%/g, '<span class="card-restriction">Rebelle uniquement.</span>')
            .replace(/%FR_IMPERIALONLY%/g, '<span class="card-restriction">Impérial uniquement.</span>')
            .replace(/%FR_SCUMONLY%/g, '<span class="card-restriction">Racailles uniquement.</span>')
            
exportObj.canonicalizeShipNames = (card_data) ->
    for ship_name, ship_data of card_data.ships
        ship_data.english_name = ship_name
        ship_data.canonical_name ?= ship_data.english_name.canonicalize()

exportObj.renameShip = (english_name, new_name) ->
    exportObj.ships[new_name] = exportObj.ships[english_name]
    exportObj.ships[new_name].name = new_name
    exportObj.ships[new_name].english_name = english_name
    delete exportObj.ships[english_name]

exportObj = exports ? this

exportObj.codeToLanguage ?= {}
exportObj.codeToLanguage.en = 'English'

exportObj.translations ?= {}
# This is here mostly as a template for other languages.
exportObj.translations.English =
    action:
        "Barrel Roll": "Barrel Roll"
        "Boost": "Boost"
        "Evade": "Evade"
        "Focus": "Focus"
        "Target Lock": "Target Lock"
        "Recover": "Recover"
        "Reinforce": "Reinforce"
        "Jam": "Jam"
        "Coordinate": "Coordinate"
        "Cloak": "Cloak"
        "Slam": "Slam"
    slot:
        "Astromech": "Astromech"
        "Bomb": "Bomb"
        "Cannon": "Cannon"
        "Crew": "Crew"
        "Elite": "Elite"
        "Missile": "Missile"
        "System": "System"
        "Torpedo": "Torpedo"
        "Turret": "Turret"
        "Cargo": "Cargo"
        "Hardpoint": "Hardpoint"
        "Team": "Team"
        "Illicit": "Illicit"
        "Salvaged Astromech": "Salvaged Astromech"
        "Configuration": "Configuration"
        "Talent": "Talent"
        "Force": "Force"
        "Modification": "Modification"
        "Gunner": "Gunner"
        "Device": "Device"
        "Title": "Title"
    sources: # needed?
        "Core": "Core"
        "A-Wing Expansion Pack": "A-Wing Expansion Pack"
        "B-Wing Expansion Pack": "B-Wing Expansion Pack"
        "X-Wing Expansion Pack": "X-Wing Expansion Pack"
        "Y-Wing Expansion Pack": "Y-Wing Expansion Pack"
        "Millennium Falcon Expansion Pack": "Millennium Falcon Expansion Pack"
        "HWK-290 Expansion Pack": "HWK-290 Expansion Pack"
        "TIE Fighter Expansion Pack": "TIE Fighter Expansion Pack"
        "TIE Interceptor Expansion Pack": "TIE Interceptor Expansion Pack"
        "TIE Bomber Expansion Pack": "TIE Bomber Expansion Pack"
        "TIE Advanced Expansion Pack": "TIE Advanced Expansion Pack"
        "Lambda-Class Shuttle Expansion Pack": "Lambda-Class Shuttle Expansion Pack"
        "Slave I Expansion Pack": "Slave I Expansion Pack"
        "Imperial Aces Expansion Pack": "Imperial Aces Expansion Pack"
        "Rebel Transport Expansion Pack": "Rebel Transport Expansion Pack"
        "Z-95 Headhunter Expansion Pack": "Z-95 Headhunter Expansion Pack"
        "TIE Defender Expansion Pack": "TIE Defender Expansion Pack"
        "E-Wing Expansion Pack": "E-Wing Expansion Pack"
        "TIE Phantom Expansion Pack": "TIE Phantom Expansion Pack"
        "Tantive IV Expansion Pack": "Tantive IV Expansion Pack"
        "Rebel Aces Expansion Pack": "Rebel Aces Expansion Pack"
        "YT-2400 Freighter Expansion Pack": "YT-2400 Freighter Expansion Pack"
        "VT-49 Decimator Expansion Pack": "VT-49 Decimator Expansion Pack"
        "StarViper Expansion Pack": "StarViper Expansion Pack"
        "M3-A Interceptor Expansion Pack": "M3-A Interceptor Expansion Pack"
        "IG-2000 Expansion Pack": "IG-2000 Expansion Pack"
        "Most Wanted Expansion Pack": "Most Wanted Expansion Pack"
        "Imperial Raider Expansion Pack": "Imperial Raider Expansion Pack"
        "Hound's Tooth Expansion Pack": "Hound's Tooth Expansion Pack"
        "Kihraxz Fighter Expansion Pack": "Kihraxz Fighter Expansion Pack"
        "K-Wing Expansion Pack": "K-Wing Expansion Pack"
        "TIE Punisher Expansion Pack": "TIE Punisher Expansion Pack"
        "The Force Awakens Core Set": "The Force Awakens Core Set"
    ui:
        shipSelectorPlaceholder: "Select a ship"
        pilotSelectorPlaceholder: "Select a pilot"
        upgradePlaceholder: (translator, language, slot) ->
            "No #{translator language, 'slot', slot} Upgrade"
        modificationPlaceholder: "No Modification"
        titlePlaceholder: "No Title"
        upgradeHeader: (translator, language, slot) ->
            "#{translator language, 'slot', slot} Upgrade"
        unreleased: "unreleased"
        epic: "epic"
        limited: "limited"
    byCSSSelector:
        # Warnings
        '.unreleased-content-used .translated': 'This squad uses unreleased content!'
        '.epic-content-used .translated': 'This squad uses Epic content!'
        '.illegal-epic-too-many-small-ships .translated': 'You may not field more than 12 of the same type Small ship!'
        '.illegal-epic-too-many-large-ships .translated': 'You may not field more than 6 of the same type Large ship!'
        '.collection-invalid .translated': 'You cannot field this list with your collection!'
        # Type selector
        '.game-type-selector option[value="standard"]': 'Standard'
        '.game-type-selector option[value="custom"]': 'Custom'
        '.game-type-selector option[value="epic"]': 'Epic'
        '.game-type-selector option[value="team-epic"]': 'Team Epic'
        # Card browser
        '.xwing-card-browser option[value="name"]': 'Name'
        '.xwing-card-browser option[value="source"]': 'Source'
        '.xwing-card-browser option[value="type-by-points"]': 'Type (by Points)'
        '.xwing-card-browser option[value="type-by-name"]': 'Type (by Name)'
        '.xwing-card-browser .translate.select-a-card': 'Select a card from the list at the left.'
        '.xwing-card-browser .translate.sort-cards-by': 'Sort cards by'
        # Info well
        '.info-well .info-ship td.info-header': 'Ship'
        '.info-well .info-skill td.info-header': 'Initiative'
        '.info-well .info-actions td.info-header': 'Actions'
        '.info-well .info-upgrades td.info-header': 'Upgrades'
        '.info-well .info-range td.info-header': 'Range'
        # Squadron edit buttons
        '.clear-squad' : 'New Squad'
        '.save-list' : 'Save'
        '.save-list-as' : 'Save as…'
        '.delete-list' : 'Delete'
        '.backend-list-my-squads' : 'Load squad'
        '.view-as-text' : '<span class="hidden-phone"><i class="fa fa-print"></i>&nbsp;Print/View as </span>Text'
        '.randomize' : 'Random!'
        '.randomize-options' : 'Randomizer options…'
        '.notes-container > span' : 'Squad Notes'
        # Print/View modal
        '.bbcode-list' : 'Copy the BBCode below and paste it into your forum post.<textarea></textarea><button class="btn btn-copy">Copy</button>'
        '.html-list' : '<textarea></textarea><button class="btn btn-copy">Copy</button>'
        '.vertical-space-checkbox' : """Add space for damage/upgrade cards when printing <input type="checkbox" class="toggle-vertical-space" />"""
        '.color-print-checkbox' : """Print color <input type="checkbox" class="toggle-color-print" />"""
        '.print-list' : '<i class="fa fa-print"></i>&nbsp;Print'
        # Randomizer options
        '.do-randomize' : 'Randomize!'
        # Top tab bar
        '#browserTab' : 'Card Browser'
        '#aboutTab' : 'About'
        # Obstacles
        '.choose-obstacles' : 'Choose Obstacles'
        '.choose-obstacles-description' : 'Choose up to three obstacles to include in the permalink for use in external programs. (This feature is in BETA; support for displaying which obstacles were selected in the printout is not yet supported.)'
        '.coreasteroid0-select' : 'Core Asteroid 0'
        '.coreasteroid1-select' : 'Core Asteroid 1'
        '.coreasteroid2-select' : 'Core Asteroid 2'
        '.coreasteroid3-select' : 'Core Asteroid 3'
        '.coreasteroid4-select' : 'Core Asteroid 4'
        '.coreasteroid5-select' : 'Core Asteroid 5'
        '.yt2400debris0-select' : 'YT2400 Debris 0'
        '.yt2400debris1-select' : 'YT2400 Debris 1'
        '.yt2400debris2-select' : 'YT2400 Debris 2'
        '.vt49decimatordebris0-select' : 'VT49 Debris 0'
        '.vt49decimatordebris1-select' : 'VT49 Debris 1'
        '.vt49decimatordebris2-select' : 'VT49 Debris 2'
        '.core2asteroid0-select' : 'Force Awakens Asteroid 0'
        '.core2asteroid1-select' : 'Force Awakens Asteroid 1'
        '.core2asteroid2-select' : 'Force Awakens Asteroid 2'
        '.core2asteroid3-select' : 'Force Awakens Asteroid 3'
        '.core2asteroid4-select' : 'Force Awakens Asteroid 4'
        '.core2asteroid5-select' : 'Force Awakens Asteroid 5'

    singular:
        'pilots': 'Pilot'
        'modifications': 'Modification'
        'titles': 'Title'
    types:
        'Pilot': 'Pilot'
        'Modification': 'Modification'
        'Title': 'Title'

exportObj.cardLoaders ?= {}
exportObj.cardLoaders.English = () ->
    exportObj.cardLanguage = 'English'

    # Assumes cards-common has been loaded
    basic_cards = exportObj.basicCardData()
    exportObj.canonicalizeShipNames basic_cards

    # English names are loaded by default, so no update is needed
    exportObj.ships = basic_cards.ships

    # Names don't need updating, but text needs to be set
    pilot_translations =
        "4-LOM":
           text: """After you fully execute a red maneuver, gain 1 calculate token. At the start of the End Phase, you may choose 1 ship at range 0-1. If you do, transfer 1 of your stress tokens to that ship."""
        "Academy Pilot":
           text: """ """
        "Airen Cracken":
           text: """After you perform an attack, you may choose 1 friendly ship at range 1. That ship may perform an action, treating it as red."""
        "Alpha Squadron Pilot":
           text: """AUTOTHRUSTERS: After you perform an action. you may perform a red %BARRELROLL% or a red %BOOST% action."""
        "AP-5":
           text: """While you coordinate, if you chose a ship with exactly 1 stress token, it can perform actions. %LINEBREAK% COMMS SHUTTLE: While you are docked, your carrier ship gains %COORDINATE%. Before your carrier ship activates, it may perform a %COORDINATE% action."""
        "Arvel Crynyd":
           text: """You can perform primary attacks at range 0. If you would fail a %BOOST% action by overlapping another ship, resolve it as though you were partially executing a maneuver instead. %LINEBREAK% VECTORED THRUSTERS: After you perform an action, you may perform a red %BOOST% action."""
        "Asajj Ventress":
           text: """At the start of the Engagement Phase, you may choose 1 enemy ship in your %SINGLETURRETARC% at range 0-2 and spend 1 %FORCE% token. If you do, that ship gains 1 stress token unless it removes 1 green token."""
        "Autopilot Drone":
           text: """RIGGED ENERGY CELLS: During the System Phase, if you are not docked, lose 1 %CHARGE%. At the end of the Activation Phase, if you have 0 %CHARGE%, you are destroyed. Before you are removed each ship at range 0-1 suffers 1 %CRIT% damage"""
        "Bandit Squadron Pilot":
           text: """ """
        "Baron of the Empire":
           text: """ """
        "Benthic Two-Tubes":
           text: """After you perform a %FOCUS% action, you may transfer 1 of your focus tokens to a friendly ship at range 1-2."""
        "Biggs Darklighter":
           text: """While another friendly ship at range 0-1 defends, before the Neutralize Results step, if you are in the attack arc, you may suffer 1 %HIT% or %CRIT% damage to cancel 1 matching result."""
        "Binayre Pirate":
           text: """ """
        "Black Squadron Ace":
           text: """ """
        "Black Squadron Scout":
           text: """ADAPTIVE AILERONS: Before you reveal your dial, if you are not stressed, you MUST execute a white (1 %BANKLEFT%), (1 %STRAIGHT%) or (1 %BANKRIGHT%)"""
        "Black Sun Ace":
           text: """ """
        "Black Sun Assassin":
           text: """MICROTHRUSTERS: While you perform a barrel roll, you MUST use the (1 %BANKLEFT%) or (1 %BANKRIGHT%) template instead of the [1 %STRAIGHT%] template."""
        "Black Sun Enforcer":
           text: """MICROTHRUSTERS: While you perform a barrel roll, you MUST use the (1 %BANKLEFT%) or (1 %BANKRIGHT%) template instead of the [1 %STRAIGHT%] template."""
        "Black Sun Soldier":
           text: """ """
        "Blade Squadron Veteran":
           text: """ """
        "Blue Squadron Escort":
           text: """ """
        "Blue Squadron Pilot":
           text: """ """
        "Blue Squadron Scout":
           text: """ """
        "Boba Fett":
           text: """While you defend or perform an attack, you may reroll 1 of your dice for each enemy ship at range 0-1."""
        "Bodhi Rook":
           text: """Friendly ships can acquire locks onto objects at range 0-3 of any friendly ship."""
        "Bossk":
           text: """While you perform a primary attack, after the Neutralize Results step, you may spend 1 %CRIT% result to add 2 %HIT% results."""
        "Bounty Hunter":
           text: """ """
        "Braylen Stramm":
           text: """While you defend or perform an attack, if you are stressed, you may reroll up to 2 of your dice."""
        "Captain Feroph":
           text: """While you defend, if the attacker does not have any green tokens, you may change 1 of your blank or %FOCUS% results to an %EVADE% result. %LINEBREAK% ADAPTIVE AILERONS: Before you reveal your dial, if you are not stressed, you MUST execute a white (1 %BANKLEFT%), (1 %STRAIGHT%) or (1 %BANKRIGHT%)"""
        "Captain Jonus":
           text: """While a friendly ship at range 0-1 performs a %TORPEDO% or %MISSILE% attack, that ship may reroll up to 2 attack dice. %LINEBREAK% NIMBLE BOMBER: If you would drop a device using a %STRAIGHT% template, you may use %BANKLEFT% a or %BANKRIGHT% tempate of the same speed instead."""
        "Captain Jostero":
           text: """After an enemy ship suffers damage, if it is not defending, you may perform a bonus attack against that ship."""
        "Captain Kagi":
           text: """At the start of the Engagement Phase, you may choose 1 or more friendly ships at range 0-3. If you do, transfer all enemy lock tokens from the chosen ships to you."""
        "Captain Nym":
           text: """Before a friendly bomb or mine would detonate, you may spend 1 %CHARGE% to prevent it from detonating. While you defend against an attack obstructed by a bomb or mine, roll 1 additional defense die."""
        "Captain Oicunn":
           text: """You can perform primary attacks at range 0."""
        "Captain Rex":
           text: """After you perform an attack, assign the Suppressive Fire condition to the defender."""
        "Cartel Executioner":
           text: """DEAD TO RIGHTS: While you perform an attack, if the defender is in your %BULLSEYEARC%, defense dice cannot be modified using green tokens."""
        "Cartel Marauder":
           text: """The versatile Kihraxz was modeled after Incom's popular X-wing starfighter, but an array of aftermarket modification kits ensure a wide variety of designs."""
        "Cartel Spacer":
           text: """WEAPON HARDPOINT: You can equip 1 %CANNON%, %TORPEDO% or %MISSILE% upgrade."""
        "Cassian Andor":
           text: """At the start of the Activation Phase, you may choose 1 friendly ship at range 1-3. If you do, that ship removes 1 stress token."""
        "Cavern Angels Zealot":
           text: """ """
        "Chewbacca":
           text: """Before you would be dealt a faceup damage card, you may spend 1 %CHARGE% to be dealt the card facedown instead."""
        '"Chopper"':
           text: """At the start of the Engagement Phase, each enemy ship at range 0 gains 2 jam tokens.TAIL GUN: While you have a docked ship, you have a primary %REARARC% weapon with an attack value equal to your docked ship's Primary %FRONTARC% attack value."""
        "Colonel Jendon":
           text: """At the start of the Activation Phase, you may spend 1 %CHARGE%. If you do, while friendly ships acquire lock this round, they must acquire locks beyond range 3 instead of at range 0-3."""
        "Colonel Vessery":
           text: """While you perform an attack against a locked ship, after you roll attack dice, you may acquire a lock on the defender. %LINEBREAK% FULL THROTTLE: After you FULLY execute a speed 3-5 maneuver, you may perform an %EVADE% action."""
        "Constable Zuvio":
           text: """If you would drop a device, you may launch it using a [1 %STRAIGHT%] template instead. %LINEBREAK% SPACETUG TRACTOR ARRAY: ACTION: Choose a ship in your %FRONTARC% at range 1. That ship gains one tractor token, or 2 tractor tokens if it is in your %BULLSEYEARC% at range 1"""
        "Contracted Scout":
           text: """ """
        "Corran Horn":
           text: """At initiative 0, you may perform a bonus primary attack against an enemy ship in your %BULLSEYEARC%. If you do, at the start of the next Planning Phase, gain 1 disarm token. %LINEBREAK% EXPERIMENTAL SCANNERS: You can acquire locks beyond range 3. You cannot acquite locks at range 1."""
        '"Countdown"':
           text: """While you defend, after the Neutralize Results step, if you are not stressed, you may suffer 1 %HIT% damage and gain 1 stress token. If you do, cancel all dice results. %LINEBREAK% ADAPTIVE AILERONS: Before you reveal your dial, if you are not stressed, you MUST execute a white (1 %BANKLEFT%), (1 %STRAIGHT%) or (1 %BANKRIGHT%)"""
        "Countess Ryad":
           text: """While you would execute a %STRAIGHT% maneuver, you may increase the difficulty of the maneuver. If you do, execute it as a %KTURN% maneuver instead. %LINEBREAK% FULL THROTTLE: After you FULLY execute a speed 3-5 maneuver, you may perform an %EVADE% action."""
        "Crymorah Goon":
           text: """ """
        "Cutlass Squadron Pilot":
           text: """ """
        "Dace Bonearm":
           text: """After an enemy ship at range 0-3 receives at least 1 ion token, you may spend 3 %CHARGE%. If you do, that ship gains 2 additional ion tokens."""
        "Dalan Oberos":
           text: """At the start of the Engagement Phase, you may choose 1 shielded ship in your %BULLSEYEARC% and spend 1 %CHARGE%. If you do, that ship loses 1 shield and you recover 1 shield. %LINEBREAK% DEAD TO RIGHTS: While you perform an attack, if the defender is in your %BULLSEYEARC%, defense dice cannot be modified using green tokens."""
        "Dalan Oberos (StarViper)":
           text: """After you fully execute a maneuver, you ay gain 1 stress token to rotate your ship 90˚.  %LINEBREAK% MICROTHRUSTERS: While you perform a barrel roll, you MUST use the (1 %BANKLEFT%) or (1 %BANKRIGHT%) template instead of the [1 %STRAIGHT%] template."""
        "Darth Vader":
           text: """After you perform an action, you may spend 1 %FORCE% to perform an action. %LINEBREAK% ADVANCED TARGETING COMPUTER: While you perform a primary attack against a defender you have locked, roll 1 additional attack die and change 1 %HIT% result to a %CRIT% result."""
        "Dash Rendar":
           text: """While you move, you ignore obstacles. %LINEBREAK% SENSOR BLINDSPOT: While you perform a primary attack at range 0-1, do not apply the range 0-1 bonus and roll 1 fewer attack die."""
        '"Deathfire"':
           text: """After you are destroyed, before you are removed, you may perform an attack and drop or launch 1 device. %LINEBREAK% NIMBLE BOMBER: If you would drop a device using a %STRAIGHT% template, you may use %BANKLEFT% a or %BANKRIGHT% tempate of the same speed instead."""
        '"Deathrain"':
           text: """After you drop or launch a device, you may perform an action."""
        "Del Meeko":
           text: """While a friendly ship at range 0-2 defends against a damaged attacker, the defender may reroll 1 defense die."""
        "Delta Squadron Pilot":
           text: """FULL THROTTLE: After you FULLY execute a speed 3-5 maneuver, you may perform an %EVADE% action."""
        "Dengar":
           text: """After you defend, if the attcker is in your %FRONTARC%, you may spend 1 %CHARGE% to perform a bonus attack against the attacker."""
        '"Double Edge"':
           text: """After you perform a %TURRET% or %MISSILE% attack that misses, you may perform a bonus attack using a different weapon."""
        "Drea Renthal":
           text: """While a friendly non-limited ship performs an attack, if the defender is in your firing arc, the attacker may reroll 1 attack die."""
        '"Duchess"':
           text: """You may choose not to use your Adaptive Ailerons. You may use your Adaptive Ailerons even while stressed. %LINEBREAK% ADAPTIVE AILERONS: Before you reveal your dial, if you are not stressed, you MUST execute a white (1 %BANKLEFT%), (1 %STRAIGHT%) or (1 %BANKRIGHT%)"""
        '"Dutch" Vander':
           text: """After you perform the %LOCK% action, you may choose 1 friendly ship at range 1-3. That ship may acquire a lock on the object you locked, ignoring range restrictions."""
        '"Echo"':
           text: """While you decloak, you must use the (2 %BANKLEFT%) or (2 %BANKRIGHT%) template instead of the (2 %STRAIGHT%) template. STYGUM ARRAY: After you decloak, you may perform an %EVADE% action. At the Start of the End Phase, you may spend 1 evade token to gain one cloak token."""
        "Edrio Two-Tubes":
           text: """Before you activate, if you are focused, you may perform an action."""
        "Emon Azzameen":
           text: """If you would drop a device using a [1 %STRAIGHT%] template, you may use the [3 %TURNLEFT%], [3 %STRAIGHT%], or [3 %TURNRIGHT%] template instead."""
        "Esege Tuketu":
           text: """While a friendly ship at range 0-2 defends or performs an attack, it may spend your focus tokens as if that ship has them."""
        "Evaan Verlaine":
           text: """At the start of the Engagement Phase, you may spend 1 focus token to choose a friendly ship at range 0-1. If you do, that ship rolls 1 additional defense die while defending until the end of the round."""
        "Ezra Bridger":
           text: """While you defend or perform an attack, if you are stressed, you may spend 1 %FORCE% to change up to 2 of your %FOCUS% results to %EVADE% or %HIT% results. %LINEBREAK% LOCKED AND LOADED: While you are docked, after your carrier ship performs a primary %FRONTARC% or %TURRET% attack, it may perform a bonus %REARARC% attack"""
        "Ezra Bridger (Sheathipede)":
           text: """While you defend or perform an attack, if you are stressed, you may spend 1 %FORCE% to change up to 2 of your %FOCUS% results to %EVADE%/%HIT% results. %LINEBREAK% LOCKED AND LOADED: While you are docked, after your carrier ship performs a primary %FRONTARC% or %TURRET% attack, it may perform a bonus %REARARC% attack"""
        "Ezra Bridger (TIE Fighter)":
           text: """While you defend or perform an attack, if you are stressed, you may spend 1 %FORCE% to change up to 2 of your %FOCUS% results to %EVADE% or %HIT% results."""
        "Fenn Rau":
           text: """While you defend or perform an attack, if the attack range is 1, you may roll 1 additional die. %LINEBREAK% CONCORDIA FACEOFF: While you defend, if the attack range is 1 and you are in the attackers %FRONTARC%, change 1 result to an %EVADE% result"""
        "Fenn Rau (Sheathipede)":
           text: """After an enemy ship in your firing arc engages, if you are not stressed, you may gain 1 stress token. If you do, that ship cannot spend tokens to modify dice while it performs an attack during this phase. %LINEBREAK% COMMS SHUTTLE: While you are docked, your carrier ship gains %COORDINATE%. Before your carrier shpi activates, it may perform a %COORDINATE% action."""
        "Freighter Captain":
           text: """ """
        "Gamma Squadron Ace":
           text: """NIMBLE BOMBER: If you would drop a device using a %STRAIGHT% template, you may use %BANKLEFT% a or %BANKRIGHT% tempate of the same speed instead."""
        "Gand Findsman":
           text: """The legendary Findsmen of Gand worship enshrouding mists of their home planet, using signs, augurs, and mystical rituals to track their quarry."""
        "Garven Dreis":
           text: """After you spend a focus token, you may choose 1 friendly ship at range 1-3. That ship gains 1 focus token."""
        "Garven Dreis (X-Wing)":
           text: """After you spend a focus token, you may choose 1 friendly ship at range 1-3. That ship gains 1 focus token."""
        "Gavin Darklighter":
           text: """While a friendly ship performs an attack, if the defender is in your %FRONTARC%, the attacker may change 1 %HIT% result to a %CRIT% result. %LINEBREAK% EXPERIMENTAL SCANNERS: You can acquire locks beyond range 3. You cannot acquite locks at range 1."""
        "Genesis Red":
           text: """After you acquire a lock, you must remove all of your focus and evade tokens. Then gain the same number of focus and evade tokens that the locked ship has. %LINEBREAK% WEAPON HARDPOINT: You can equip 1 %CANNON%, %TORPEDO% or %MISSILE% upgrade."""
        "Gideon Hask":
           text: """While you perform an attack against a damaged defender, roll 1 additional attack die."""
        "Gold Squadron Veteran":
           text: """ """
        "Grand Inquisitor":
           text: """While you defend at attack range 1, you may spend 1 %FORCE% to prevent the range 1 bonus. While you perform an attack against a defender at attack range 2-3, you may spend 1 %FORCE% to apply the range 1 bonus."""
        "Gray Squadron Bomber":
           text: """ """
        "Graz":
           text: """While you defend, if you are behind the attacker, roll 1 additional defense die. While you perform an attack, if you are behind the defender roll 1 additional attack die."""
        "Green Squadron Pilot":
           text: """VECTORED THRUSTERS: After you perform an action, you may perform a red %BOOST% action."""
        "Guri":
           text: """At the start of the Engagement Phase, if there is at least 1 enemy ship at range 0-1, you may gain 1 focus token.  %LINEBREAK% MICROTHRUSTERS: While you perform a barrel roll, you MUST use the (1 %BANKLEFT%) or (1 %BANKRIGHT%) template instead of the [1 %STRAIGHT%] template."""
        "Han Solo (Scum)":
           text: """Whlie you defend or perform a primary attack, if the attack is obstructed by an obstacle, you may roll 1 additional die."""
        "Han Solo (Rebel)":
           text: """After you roll dice, if you are at range 0-1 of an obstacle, you may reroll all of your dice. This does not count as rerolling for the purpose of other effects."""
        "Heff Tobber":
           text: """After an enemy ship executes a maneuver, if it is at range 0, you may perform an action."""
        "Hera Syndulla":
           text: """After you reveal a red or blue maneuver, you may set your dial to another maneuver of the same difficulty. %LINEBREAK% LOCKED AND LOADED: While you are docked, after your carrier ship performs a primary %FRONTARC% or %TURRET% attack, it may perform a bonus %REARARC% attack"""
        "Hera Syndulla (VCX-100)":
           text: """After you reveal a red or blue maneuver, you may set your dial to another maneuver of the same difficulty. TAIL GUN: While you have a docked ship, you have a primary %REARARC% weapon with an attack value equal to your docked ship's Primary %FRONTARC% attack value."""
        "Hired Gun":
           text: """Just the mention of Imperial credits can bring a host of less-than-trustworthy individuals to your side."""
        "Horton Salm":
           text: """While you perform an attack, you may reroll 1 attack die for each other friendly ship at range 0-1 of the defender."""
        '"Howlrunner"':
           text: """While a friendly ship at range 0-1 performs a primary attack, that ship may reroll 1 attack die."""
        "Ibtisam":
           text: """After you fully execute a maneuver, if you are stressed, you may roll 1 attack die. On a %HIT% or %CRIT% result, remove 1 stress token."""
        "Iden Versio":
           text: """Before a friendly TIE/ln fighter at range 0-1 would suffer 1 or more damage, you may spend 1 %CHARGE%. If you do, prevent that damage."""
        "IG-88A":
           text: """At the start of the Engagement Phase, you may choose 1 friendly ship with %CALCULATE% on its action bar at range 1-3. If you do, transfer 1 of your calculate tokens to it. ADVANCED DROID BRAIN: After you perform a %CALCULATE% action, gain 1 calculate token."""
        "IG-88B":
           text: """After you perform an attack that misses, you may perform a bonus %CANNON% attack. ADVANCED DROID BRAIN: After you perform a %CALCULATE% action, gain 1 calculate token."""
        "IG-88C":
           text: """After you perform a %BOOST% action, you may perform an %EVADE% action. ADVANCED DROID BRAIN: After you perform a %CALCULATE% action, gain 1 calculate token."""
        "IG-88D":
           text: """While you execute a Segnor's Loop (%LSLOOP% or %RSLOOP%) maneuver, you may use another template of the same speed instead: either the turn (%TURNLEFT% or %TURNRIGHT%) of the same direction or the straight (%STRAIGHT%) template. ADVANCED DROID BRAIN: After you perform a %CALCULATE% action, gain 1 calculate token."""
        "Imdaar Test Pilot":
           text: """STYGUM ARRAY: After you decloak, you may perform an %EVADE% action. At the Start of the End Phase, you may spend 1 evade token to gain one cloak token."""
        "Inaldra":
           text: """While you defend or perform an attack, you may suffer 1 %HIT% damage to reroll any number of your dice. %LINEBREAK% WEAPON HARDPOINT: You can equip 1 %CANNON%, %TORPEDO% or %MISSILE% upgrade."""
        "Inquisitor":
           text: """The fearsome Inquisitors are given a great deal of autonomy and access to the Empire's latest technology, like the prototype TIE Advanced v1."""
        "Jake Farrell":
           text: """After you perform a %BARRELROLL% or %BOOST% action, you may choose a friendly ship at range 0-1. That ship may perform a %FOCUS% action. %LINEBREAK% VECTORED THRUSTERS: After you perform an action, you may perform a red %BOOST% action."""
        "Jakku Gunrunner":
           text: """SPACETUG TRACTOR ARRAY: ACTION: Choose a ship in your %FRONTARC% at range 1. That ship gains one tractor token, or 2 tractor tokens if it is in your %BULLSEYEARC% at range 1"""
        "Jan Ors":
           text: """While a friendly ship in your firing arc performs a primary attack, if you are not stressed, you may gain 1 stress token. If you do, that ship may roll 1 additional attack die."""
        "Jek Porkins":
           text: """After you receive a stress token, you may roll 1 attack die to remove it. On a %HIT% result, suffer 1 %HIT% damage."""
        "Joy Rekkoff":
           text: """While you perform an attack, you may spend 1 %CHARGE% from an equipped %TORPEDO% upgrade. If you do, the defender rolls 1 fewer defense die. %LINEBREAK% CONCORDIA FACEOFF: While you defend, if the attack range is 1 and you are in the attackers %FRONTARC%, change 1 result to an %EVADE% result"""
        "Kaa'to Leeachos":
           text: """At the start of the Engagement Phase, you may choose 1 friendly ship at range 0-2. If you do, transfer 1 focus or evade token from that ship to yourself."""
        "Kad Solus":
           text: """After you fully execute a red maneuver, gain 2 focus tokens."""
        "Kanan Jarrus":
           text: """While a friendly ship in your firing arc defends, you may spend 1 %FORCE%. If you do, the attacker rolls 1 fewer attack die. TAIL GUN: While you have a docked ship, you have a primary %REARARC% weapon with an attack value equal to your docked ship's Primary %FRONTARC% attack value."""
        "Kashyyyk Defender":
           text: """Equipped with three wide-range Sureggi twin laser cannons, the Auzituck gunship acts as a powerful deterrent to slaver operations in the Kashyyyk system."""
        "Kath Scarlet":
           text: """While you perform a primary attack, if there is at least 1 friendly non-limited ship at range 0 of the defender, roll 1 additional attack die."""
        "Kavil":
           text: """While you perform a non-%FRONTARC% attack, roll 1 additional attack die."""
        "Ketsu Onyo":
           text: """At the start of the Engagement Phase, you may choose 1 ship in both your %FRONTARC% and %SINGLETURRETARC% at range 0-1. If you do, that ship gains 1 tractor token."""
        "Knave Squadron Escort":
           text: """EXPERIMENTAL SCANNERS: You can acquire locks beyond range 3. You cannot acquite locks at range 1."""
        "Koshka Frost":
           text: """While you defend or perform an attack, if the enemy ship is stressed, you may reroll 1 of your dice."""
        "Krassis Trelix":
           text: """You can perform %FRONTARC% special attacks from your %REARARC%. While you perform a special attack, you may reroll 1 attack die."""
        "Kullbee Sperado":
           text: """After you perform a %BARRELROLL% or %BOOST% action, you may flip your equipped %CONFIG% upgrade card."""
        "Kyle Katarn":
           text: """At the start of the Engagement Phase, you may transfer 1 of your focus tokens to a friendly ship in your firing arc."""
        "L3-37 (Escape Craft)":
           text: """If you are not shielded, decrease the difficulty of your bank (%BANKLEFT% and %BANKRIGHT%) maneuvers."""
        "L3-37":
           text: """If you are not shielded, decrease the difficulty of your bank (%BANKLEFT% and %BANKRIGHT%) maneuvers. %LINEBREAK% CO-PILOT: While you are docked, your carried ship has your pilot ability in addition it's own."""
        "Laetin A'shera":
           text: """After you defend or perform an attack, if the attack missed, gain 1 evade token. %LINEBREAK% WEAPON HARDPOINT: You can equip 1 %CANNON%, %TORPEDO% or %MISSILE% upgrade."""
        "Lando Calrissian (Scum) (Escape Craft)":
           text: """??"""
        "Lando Calrissian (Rebel)":
           text: """After you fully execute a blue maneuver, you may choose a friendly ship at range 0-3. That ship may perform an action."""
        "Lando Calrissian (Scum)":
           text: """After you roll dice, if you are not stressed, you may gain 1 stress token to reroll all of your blank results."""
        "Latts Razzi":
           text: """At the start of the Engagement Phase, you may choose a ship at range 1 and spend a lock you have on that ship. If you do, that ship gains 1 tractor token."""
        '"Leebo"':
           text: """After you defend or perform an attack, if you spent a calculate token, gain 1 calculate token. %LINEBREAK% SENSOR BLINDSPOT: While you perform a primary attack at range 0-1, do not apply the range 0-1 bonus and roll 1 fewer attack die."""
        "Leevan Tenza":
           text: """After you perform a %BARRELROLL% or %BOOST% action, you may perform a red %EVADE% action."""
        "Lieutenant Blount":
           text: """While you perform a primary attack, if there is at least 1 other friendly ship at range 0-1 of the defender, you may roll 1 additional attack die."""
        "Lieutenant Karsabi":
           text: """After you gain a disarm token, if you are not stressed, you may gain 1 stress token to remove 1 disarm token."""
        "Lieutenant Kestal":
           text: """While you perform an attack, after the defender rolls defense dice, you may spend 1 focus token to cancel all of the defender's blank/%FOCUS% results."""
        "Lieutenant Sai":
           text: """After you a perform a %COORDINATE% action, if the ship you chose performed an action on your action bar, you may perform that action."""
        "Lok Revenant":
           text: """ """
        "Lothal Rebel":
           text: """TAIL GUN: While you have a docked ship, you have a primary %REARARC% weapon with an attack value equal to your docked ship's Primary %FRONTARC% attack value."""
        "Lowhhrick":
           text: """After a friendly ship at range 0-1 becomes the defender, you may spend 1 reinforce token. If you do, that ship gains 1 evade token."""
        "Luke Skywalker":
           text: """After you become the defender (before dice are rolled), you may recover 1 %FORCE%."""
        "Maarek Stele":
           text: """While you perform an attack, if the defender would be dealt a faceup damage card, instead draw 3 damage cards, choose 1, and discard the rest. %LINEBREAK% ADVANCED TARGETING COPMUTER: While you perform a primary attack against a defender you have locked, roll 1 additional attack die and change 1 %HIT% result to a %CRIT% result."""
        "Magva Yarro":
           text: """While a friendly ship at range 0-2 defends, the attacker cannot reroll more than 1 attack die."""
        "Major Rhymer":
           text: """While you perform a %TORPEDO% or %MISSILE% attack, you may increase or decrease the range requirement by 1, to a limit of 0-3. %LINEBREAK% NIMBLE BOMBER: If you would drop a device using a %STRAIGHT% template, you may use %BANKLEFT% a or %BANKRIGHT% tempate of the same speed instead."""
        "Major Vermeil":
           text: """While you perform an attack, if the defender does not have any green tokens, you may change 1 of your  blank  or %FOCUS% results to a %HIT% result. %LINEBREAK% ADAPTIVE AILERONS: Before you reveal your dial, if you are not stressed, you MUST execute a white (1 %BANKLEFT%), (1 %STRAIGHT%) or (1 %BANKRIGHT%)"""
        "Major Vynder":
           text: """While you defend, if you are disarmed, roll 1 additional defense die."""
        "Manaroo":
           text: """At the start of the Engagement Phase, you may choose a friendly ship at range 0-1. If you do, transfer all green tokens assigned to you to that ship."""
        '"Mauler" Mithel':
           text: """While you perform an attack at attack range 1, roll 1 additional attack die."""
        "Miranda Doni":
           text: """While you perform a primary attack, you may either spend 1 shield to roll 1 additional attack die or, if you are not shielded, you may roll 1 fewer attack die to recover 1 shield."""
        "Moralo Eval":
           text: """If you would flee, you may spend 1 %CHARGE%. If you do, place yourself in reserves instead. At the start of the next Planning Phase, place youself within range 1 of the edge of the play area that you fled from."""
        "Nashtah Pup":
           text: """You can deploy only via emergency deployment, and you have the name, initiative, pilot ability, and ship %CHARGE% of the friendly, destroyed Hound's Tooth. %LINEBREAK% ESCAPE CRAFT SETUP: Requires the HOUND'S TOOTH. You MUST begin the game docked with the HOUND'S TOOTH"""
        "N'dru Suhlak":
           text: """While you perform a primary attack, if there are no other friendly ships at range 0-2, roll 1 additional attack die."""
        '"Night Beast"':
           text: """After you fully execute a blue maneuver, you may perform a %FOCUS% action."""
        "Norra Wexley":
           text: """While you defend, if there is an enemy ship at range 0-1, add 1 %EVADE% result to your dice results."""
        "Norra Wexley (Y-Wing)":
           text: """While you defend, if there is an enemy ship at range 0-1, you may add 1 %EVADE% result to your dice results."""
        "Nu Squadron Pilot":
           text: """ """
        "Obsidian Squadron Pilot":
           text: """ """
        "Old Teroch":
           text: """At the start of the Engagement Phase, you may choose 1 enemy ship at range 1. If you do and you are in its %FRONTARC%, it removes all of its green tokens. %LINEBREAK% CONCORDIA FACEOFF: While you defend, if the attack range is 1 and you are in the attackers %FRONTARC%, change 1 result to an %EVADE% result."""
        "Omicron Group Pilot":
           text: """ """
        "Onyx Squadron Ace":
           text: """FULL THROTTLE: After you FULLY execute a speed 3-5 maneuver, you may perform an %EVADE% action."""
        "Onyx Squadron Scout":
           text: """ """
        "Outer Rim Pioneer":
           text: """Friendly ships at range 0-1 can perform attacks at range 0 of obstacles. %LINEBREAK% CO-PILOT: While you are docked, your carried ship has your pilot ability in addition it's own."""
        "Outer Rim Smuggler":
           text: """ """
        "Palob Godalhi":
           text: """At the start of the Engagement Phase, you may choose 1 enemy ship in your firing arc at range 0-2. If you do, transfer 1 focus or evade token from that ship to yourself."""
        "Partisan Renegade":
           text: """ """
        "Patrol Leader":
           text: """ """
        "Phoenix Squadron Pilot":
           text: """VECTORED THRUSTERS: After you perform an action, you may perform a red %BOOST% action."""
        "Planetary Sentinel":
           text: """ADAPTIVE AILERONS: Before you reveal your dial, if you are not stressed, you MUST execute a white (1 %BANKLEFT%), (1 %STRAIGHT%) or (1 %BANKRIGHT%)"""
        "Prince Xizor":
           text: """While you defend, after the Neutralize Results step, another friendly ship at range 0-1 and in the attack arc may suffer 1 %HIT% or %CRIT% damage. If it does, cancel 1 matching result.  %LINEBREAK% MICROTHRUSTERS: While you perform a barrel roll, you MUST use the (1 %BANKLEFT%) or (1 %BANKRIGHT%) template instead of the [1 %STRAIGHT%] template."""
        '"Pure Sabacc"':
           text: """While you perform an attack, if you have 1 or fewer damage cards, you may roll 1 additional attack die. %LINEBREAK% ADAPTIVE AILERONS: Before you reveal your dial, if you are not stressed, you MUST execute a white (1 %BANKLEFT%), (1 %STRAIGHT%) or (1 %BANKRIGHT%)"""
        "Quinn Jast":
           text: """At the start of the Engagement Phase, you may gain 1 disarm token to recover 1 %CHARGE% on 1 of your equipped upgrades. %LINEBREAK% WEAPON HARDPOINT: You can equip 1 %CANNON%, %TORPEDO% or %MISSILE% upgrade."""
        "Rear Admiral Chiraneau":
           text: """While you perform an attack, if you are reinforced and the defender is in the %FULLFRONTARC% or %FULLREARARC% matching your reinforce token, you may change 1 of your %FOCUS% results to a %CRIT% result."""
        "Rebel Scout":
           text: """ """
        "Red Squadron Veteran":
           text: """ """
        '"Redline"':
           text: """You can maintain up to 2 locks. After you perform an action, you may acquire a lock."""
        "Rexler Brath":
           text: """After you perform an attack that hits, if you are evading, expose 1 of the defender's damage cards. %LINEBREAK% FULL THROTTLE: After you FULLY execute a speed 3-5 maneuver, you may perform an %EVADE% action."""
        "Rho Squadron Pilot":
           text: """ """
        "Roark Garnet":
           text: """At the start of the Engagement Phase, you may choose 1 ship in your firing arc. If you do, it engages at initiative 7 instead of its standard initiative value this phase."""
        "Rogue Squadron Escort":
           text: """EXPERIMENTAL SCANNERS: You can acquire locks beyond range 3. You cannot acquire locks at range 1."""
        "Saber Squadron Ace":
           text: """AUTOTHRUSTERS: After you perform an action. you may perform a red %BARRELROLL% or a red %BOOST% action."""
        "Sabine Wren":
           text: """Before you activate, you may perform a %BARRELROLL% or %BOOST% action. %LINEBREAK% LOCKED AND LOADED: While you are docked, after your carrier ship performs a primary %FRONTARC% or %TURRET% attack, it may perform a bonus %REARARC% attack"""
        "Sabine Wren (Scum)":
           text: """While you defend, if the attacker is in your %SINGLETURRETARC% at range 0-2, you may add 1 %FOCUS% result to your dice results."""
        "Sabine Wren (TIE Fighter)":
           text: """Before you activate, you may perform a %BARRELROLL% or %BOOST% action."""
        "Sarco Plank":
           text: """While you defend, you may treat your agility value as equal to the speed of the maneuver you executed this round. %LINEBREAK% SPACETUG TRACTOR ARRAY: ACTION: Choose a ship in your %FRONTARC% at range 1. That ship gains one tractor token, or 2 tractor tokens if it is in your %BULLSEYEARC% at range 1"""
        "Saw Gerrera":
           text: """While a damaged friendly ship at range 0-3 performs an attack, it may reroll 1 attack die."""
        "Scarif Base Pilot":
           text: """ADAPTIVE AILERONS: Before you reveal your dial, if you are not stressed, you MUST execute a white (1 %BANKLEFT%), (1 %STRAIGHT%) or (1 %BANKRIGHT%)"""
        "Scimitar Squadron Pilot":
           text: """NIMBLE BOMBER: If you would drop a device using a %STRAIGHT% template, you may use %BANKLEFT% a or %BANKRIGHT% template of the same speed instead."""
        '"Scourge" Skutu':
           text: """While you perform an attack against a defender in your %BULLSEYEARC%, roll 1 additional attack die."""
        "Serissu":
           text: """While a friendly ship at range 0-1 defends, it may reroll 1 of its dice. %LINEBREAK% WEAPON HARDPOINT: You can equip 1 %CANNON%, %TORPEDO% or %MISSILE% upgrade."""
        "Seventh Sister":
           text: """While you perform a primary attack, before the Neutralize Results step, you may spend 2 %FORCE% to cancel 1 %EVADE% result."""
        "Seyn Marana":
           text: """While you perform an attack, you may spend 1 %CRIT% result. If you do, deal 1 facedown damage card to the defender, then cancel you remaining results."""
        "Shadowport Hunter":
           text: """Crime syndicates augment the lethal skills of their loyal contractors with the best technology available, like the fast and formidable Lancer-class pursuit craft."""
        "Shara Bey":
           text: """While you defend or perform a primary attack, you may spend 1 lock you have on the enemy ship to add 1 %FOCUS% result to your dice results."""
        "Sienar Specialist":
           text: """ """
        '"Sigma Squadron Ace"':
           text: """STYGUM ARRAY: After you decloak, you may perform an %EVADE% action. At the Start of the End Phase, you may spend 1 evade token to gain one cloak token."""
        "Skull Squadron Pilot":
           text: """CONCORDIA FACEOFF: While you defend, if the attack range is 1 and you are in the attackers %FRONTARC%, change 1 result to an %EVADE% result."""
        "Sol Sixxa":
           text: """If you would drop a device using a [1 %STRAIGHT%] template, you may drop it using any other speed 1 template instead."""
        "Soontir Fel":
           text: """At the start of the Engagement Phase, if there is an enemy ship in your %BULLSEYEARC%, gain 1 focus token. %LINEBREAK% AUTOTHRUSTERS: After you perform an action. you may perform a red %BARRELROLL% or a red %BOOST% action."""
        "Spice Runner":
           text: """ """
        "Storm Squadron Ace":
           text: """ADVANCED TARGETING COPMUTER: While you perform a primary attack against a defender you have locked, roll 1 additional attack die and change 1 %HIT% result to a %CRIT% result."""
        "Sunny Bounder":
           text: """While you defend or perform an attack, after you roll or reroll your dice, if you have the same result on each of your dice, you may add 1 matching result. %LINEBREAK% WEAPON HARDPOINT: You can equip 1 %CANNON%, %TORPEDO% or %MISSILE% upgrade."""
        "Tala Squadron Pilot":
           text: """ """
        "Talonbane Cobra":
           text: """While you defend at attack range 3 or perform an attack at range 1, roll 1 additional die."""
        "Tansarii Point Veteran":
           text: """WEAPON HARDPOINT: You can equip 1 %CANNON%, %TORPEDO% or %MISSILE% upgrade."""
        "Tel Trevura":
           text: """If you would be destroyed, you may spend 1 %CHARGE%. If you do, discard all of your damage cards, suffer 5 %HIT% damage, and place yourself in reserves instead. At the start of the next planning phase, place yourself within range 1 of your player edge."""
        "Tempest Squadron Pilot":
           text: """ADVANCED TARGETING COPMUTER: While you perform a primary attack against a defender you have locked, roll 1 additional attack die and change 1 %HIT% result to a %CRIT% result."""
        "Ten Numb":
           text: """While you defend or perform an attack, you may spend 1 stress token to change all of your %FOCUS% results to %EVADE% or %HIT% results."""
        "Thane Kyrell":
           text: """While you perform an attack, you may spend 1 %FOCUS%, %HIT%, or %CRIT% result to look at the defender's facedown damage cards, choose 1, and expose it."""
        "Tomax Bren":
           text: """After you perform a %RELOAD% action, you may recover 1 %CHARGE% token on 1 of your equipped %TALENT% upgrade cards. %LINEBREAK% NIMBLE BOMBER: If you would drop a device using a %STRAIGHT% template, you may use %BANKLEFT% a or %BANKRIGHT% tempate of the same speed instead."""
        "Torani Kulda":
           text: """After you perform an attack, each enemy ship in your %BULLSEYEARC% suffers 1 %HIT% damage unless it removes 1 green token. %LINEBREAK% DEAD TO RIGHTS: While you perform an attack, if the defender is in your %BULLSEYEARC%, defense dice cannot be modified using green tokens."""
        "Torkil Mux":
           text: """At the start of the Engagement Phase, you may choose 1 ship in your firing arc. If you do, that ship engages at initiative 0 instead of its normal initiative value this round."""
        "Trandoshan Slaver":
           text: """ """
        "Turr Phennir":
           text: """After you perform an attack, you may perform a %BARRELROLL% or %BOOST% action, even if you are stressed. %LINEBREAK% AUTOTHRUSTERS: After you perform an action. you may perform a red %BARRELROLL% or a red %BOOST% action."""
        "Unkar Plutt":
           text: """At the start of the Engagement Phase, if there are one or more other ships at range 0, you and each other ship at range 0 gain 1 tractor token. %LINEBREAK% SPACETUG TRACTOR ARRAY: ACTION: Choose a ship in your %FRONTARC% at range 1. That ship gains one tractor token, or 2 tractor tokens if it is in your %BULLSEYEARC% at range 1"""
        "Valen Rudor":
           text: """After a friendly ship at range 0-1 defends (after damage is resolved, if any), you may perform an action."""
        "Ved Foslo":
           text: """While you execute a maneuver, you may execute a maneuver of the same bearing and difficulty of a speed 1 higher or lower instead. %LINEBREAK% ADVANCED TARGETING COPMUTER: While you perform a primary attack against a defender you have locked, roll 1 additional attack die and change 1 %HIT% result to a %CRIT% result."""
        "Viktor Hel":
           text: """After you defend, if you did not roll exactly 2 defense dice, the attack gains 1 stress token."""
        '"Vizier"':
           text: """After you fully execute a speed 1 maneuver using your Adaptive Ailerons ship ability, you may perform a %COORDINATE% action. If you do, skip your Perform Action step. %LINEBREAK% ADAPTIVE AILERONS: Before you reveal your dial, if you are not stressed, you MUST execute a white (1 %BANKLEFT%), (1 %STRAIGHT%) or (1 %BANKRIGHT%)"""
        '"Wampa"':
           text: """While you perform an attack, you may spend 1 %CHARGE% to roll 1 additional attack die. After defending, lose 1 %CHARGE%."""
        "Warden Squadron Pilot":
           text: """ """
        "Wedge Antilles":
           text: """While you perform an attack, the defender rolls 1 fewer defense die."""
        '"Whisper"':
           text: """After you perform an attack that hits, gain 1 evade token. STYGUM ARRAY: After you decloak, you may perform an %EVADE% action. At the Start of the End Phase, you may spend 1 evade token to gain one cloak token."""
        "Wild Space Fringer":
           text: """SENSOR BLINDSPOT: While you perform a primary attack at range 0-1, do not apply the range 0-1 bonus and roll 1 fewer attack die."""
        "Wullffwarro":
           text: """While you perform a primary attack, if you are damaged, you may roll 1 additional attack die."""
        "Zealous Recruit":
           text: """CONCORDIA FACEOFF: While you defend, if the attack range is 1 and you are in the attackers %FRONTARC%, change 1 result to an %EVADE% result"""
        '"Zeb" Orrelios':
           text: """While you defend, %CRIT% results are neutralized before %HIT% results. %LINEBREAK% LOCKED AND LOADED: While you are docked, after your carrier ship performs a primary %FRONTARC% or %TURRET% attack, it may perform a bonus %REARARC% attack"""
        '"Zeb" Orrelios (Sheathipede)':
           text: """While you defend, %CRIT% results are neutralized before %HIT% results. %LINEBREAK% COMMS SHUTTLE: While you are docked, your carrier ship gains %COORDINATE%. Before your carrier shpi activates, it may perform a %COORDINATE% action."""
        '"Zeb" Orrelios (TIE Fighter)':
           text: """While you defend, %CRIT% results are neutralized before %HIT% results."""
        "Zertik Strom":
           text: """During the End Phase, you may spend a lock you have on an enemy ship to expose 1 of that ship's damage cards. %LINEBREAK% ADVANCED TARGETING COPMUTER: While you perform a primary attack against a defender you have locked, roll 1 additional attack die and change 1 %HIT% result to a %CRIT% result."""
        "Zuckuss":
           text: """While you perform a primary attack, you may roll 1 additional attack die. If you do, the defender rolls 1 additional defense die."""
        "Poe Dameron":
           text: """After you perform an action, you may spend 1 %CHARGE% to perform a white action, treating it as red. %LINEBREAK% WEAPON HARDPOINT: You can equip 1 %CANNON%, %TORPEDO% or %MISSILE% upgrade."""
        "Lieutenant Bastian":
           text: """After a ship at range 1-2 is dealt a damage card, you may acquire a lock on that ship. %LINEBREAK% WEAPON HARDPOINT: You can equip 1 %CANNON%, %TORPEDO% or %MISSILE% upgrade."""
        '"Midnight"':
           text: """While you defend or perform an attack, if you have a lock on the enemy ship, that ship's dice cannot be modified."""
        '"Longshot"':
           text: """While you perform a primary attack at attack range 3, roll 1 additional attack die."""
        '"Muse"':
           text: """At the start of the Engagement Phase, you may choose a friendly ship at range 0-1. If you do, that ship removes 1 stress token."""
        "Kylo Ren":
           text: """ After you defend, you may spend 1 %FORCE% to assign the I'll Show You the Dark Side condition to the attacker. %LINEBREAK% AUTOTHRUSTERS: After you perform an action. you may perform a red %BARRELROLL% or a red %BOOST% action."""
        '"Blackout"':
           text: """ ??? %LINEBREAK% AUTOTHRUSTERS: After you perform an action. you may perform a red %BARRELROLL% or a red %BOOST% action."""
        "Lieutenant Dormitz":
           text: """ ... are placed, other ... be placed anywhere in ... range 0-2 of you. %LINEBREAK% ... : while you perform a %CANNON% ... additional die. """
        "Tallissan Lintra":
           text: """While an enemy ship in your %BULLSEYEARC% performs an attack, you may spend 1 %CHARGE%.  If you do, the defender rolls 1 additional die."""
        "Lulo Lampar":
           text: """While you defend or perform a primary attack, if you are stressed, you must roll 1 fewer defense die or 1 additional attack die."""
        '"Backdraft"':
           text: """ ... perform a %TURRET% primary ... defender is in your %BACKARC% ... additional dice. %LINEBREAK% ... TURRET: You can... indicator only to your ... must treat the %FRONTARC% ... your equipped %MISSILE% ... as %TURRET%. """
        '"Quickdraw"':
           text: """ ??? %LINEBREAK% ... TURRET: You can... indicator only to your ... must treat the %FRONTARC% ... your equipped %MISSILE% ... as %TURRET%. """    
        "Rey":
           text: """ ... perform an attack, ... in your %FRONTARC%, you may ... change 1 of your blank ... or %HIT% result. """
        "Han Solo (Resistance)":
           text: """ ??? """
        "Chewbacca (Resistance)":
           text: """ ??? """
        "Captain Seevor":
           text: """ While you defend or perform an attack, before the attack dice are rolled, if you are not in the enemy ship's %BULLSEYEARC%, you may spend 1 %CHARGE%. If you do, the enemy ship gains one jam token. """
        "Mining Guild Surveyor":
           text: """ """
        "Ahhav":
           text: """ ??? """
        "Finch Dallow":
           text: """ ... drop a bomb, you ... play area touching ... instead. """

            
            
    upgrade_translations =
        "0-0-0":
           text: """At the start of the Engagement Phase, you may choose 1 enemy ship at range 0-1. If you do, you gain 1 calculate token unless that ship chooses to gain 1 stress token."""
        "4-LOM":
           text: """While you perform an attack, after rolling attack dice, you may name a type of green token. If you do, gain 2 ion tokens and, during this attack, the defender cannot spend tokens of the named type."""
        "Ablative Plating":
           text: """<i>Requires: Medium or Large Base</i> %LINEBREAK% Before you would suffer damage from an obstacle or from a friendly bomb detonating, you may spend 1 %CHARGE%. If you do, prevent 1 damage."""
        "Admiral Sloane":
           text: """After another friendly ship at range 0-3 defends, if it is destroyed, the attacker gains 2 stress tokens. While a friendly ship at range 0-3 performs an attack against a stressed ship, it may reroll 1 attack die."""
        "Adv. Proton Torpedoes":
           text: """Attack (%LOCK%): Spend 1 %CHARGE%. Change 1 %HIT% result to a %CRIT% result."""
        "Advanced Sensors":
           text: """After you reveal your dial, you may perform 1 action. If you do, you cannot perform another action during your activation."""
        "Advanced SLAM":
           text: """<i>Requires: %SLAM%</i> %LINEBREAK% After you perform a %SLAM% action, if you fully executed that maneuver, you may perform a white action on your action bar, treating that action as red."""
        "Afterburners":
           text: """<i>Requires: Small Base</i> %LINEBREAK% After you fully execute a speed 3-5 maneuver, you may spend 1 %CHARGE% to perform a %BOOST% action, even while stressed."""
        "Agent Kallus":
           text: """Setup: Assign the Hunted condition to 1 enemy ship. While you perform an attack against th eship with the Hunted condition, you may change 1 of your %FOCUS% results to a %HIT% result."""
        "Agile Gunner":
           text: """In the End Phase you may rotate your %TURRET% indi﻿cator﻿"""
        "Andrasta":
           text: """Add %DEVICE% slot."""
        "Barrage Rockets":
           text: """Attack (%FOCUS%): Spend 1 %CHARGE%. If the defender is in your %BULLSEYEARC%, you may spend 1 or more %CHARGE% to reroll that many attack dice."""
        "Baze Malbus":
           text: """While you perform a %FOCUS% action, you may treat it as red. If you do, gain 1 additional focus token for each enemy ship at range 0-1 to a maximum of 2."""
        "Bistan":
           text: """After you perform a primary attack, if you are focused, you may perform a bonus %TURRET% attack against a ship you have not already attacked this round."""
        "Boba Fett":
           text: """Setup: Start in reserve. At the end of Setup, place yourself at range 0 of an obstacle and beyond range 3 of an enemy ship."""
        "Bomblet Generator":
           text: """Bomb During the System Phase, you may spend 1 %CHARGE% to drop a Bomblet with the [1 %STRAIGHT%] template. At the start of the Activation Phase, you may spend 1 shield to recover 2 %CHARGE%."""
        "Bossk":
           text: """After you perform a primary attack that misses, if you are not stressed you must receive 1 stress token to perform a bonus primary attack against the same target."""
        "BT-1":
           text: """While you perform an attack, you may change 1 %HIT% result to a %CRIT% result for each stress token the defender has."""
        "C-3PO":
           text: """<i>Adds: %CALCULATE%</i> %LINEBREAK% Before rolling defense dice, you may spend 1 calculate token to guess aloud a number 1 or higher. If you do, and you roll exactly that many %EVADE% results, add 1 %EVADE% result. After you perform the %CALCULATE% action, gain 1 calculate token."""
        "Cad Bane":
           text: """After you drop or launch a device, you may perform a red %BOOST% action."""
        "Cassian Andor":
           text: """During the System Phase, you may choose 1 enemy ship at range 1-2 and guess aloud a bearing and speed, then look at that ship's dial. If the chosen ship's bearing and speed match your guess, you may set your dial to another maneuver."""
        "Chewbacca (Rebel)":
           text: """At the start of the Engagement Phase, you may spend 2 %CHARGE% to repair 1 faceup damage card."""
        "Chewbacca (Scum)":
           text: """At the start of the End Phase, you may spend 1 focus token to repair 1 of your faceup damage cards."""
        '"Chopper" (Astromech)':
           text: """Action: Spend 1 non-recurring %CHARGE% from another equipped upgrade to recover 1 shield. Action: Spend 2 shields to recover 1 non-recurring %CHARGE% on an equipped upgrade."""
        '"Chopper" (Crew)':
           text: """During the Perform Action step, you may perform 1 action, even while stressed. After you perform an action while stressed, suffer 1 %HIT% damage unless you expose 1 of your damage cards."""
        "Ciena Ree":
           text: """<i>Requires: %COORDINATE%</i> %LINEBREAK% After you perform a %COORDINATE% action, if the ship you coordinated performed a %BARRELROLL% or %BOOST% action, it may gain 1 stress token to rotate 90˚."""
        "Cikatro Vizago":
           text: """During the End Phase, you may choose 2 %ILLICIT% upgrades equipped to friendly ships at range 0-1. If you do, you may exchange these upgrades. End of Game: Return all %ILLICIT% upgrades to their original ships."""
        "Cloaking Device":
           text: """<i>Requires: Small or Medium Base</i> %LINEBREAK% Action: Spend 1 %CHARGE% to perform a %CLOAK% action. At the start of the Planning Phase, roll 1 attack die. On a %FOCUS% result, decloak or discard your cloak token."""
        "Cluster Missiles":
           text: """Attack (%LOCK%): Spend 1 %CHARGE%. After this attack, you may perform this attack as a bonus attack against a different target at range 0-1 of the defender, ignoring the %LOCK% requirement."""
        "Collision Detector":
           text: """While you boost or barrel roll, you can move through and overlap obstacles. After you move through or overlap an obstacle, you may spend 1 %CHARGE% to ignore its effects until the end of the round."""
        "Composure":
           text: """<i>Requires: %FOCUS%</i> %LINEBREAK% If you fail an action and don't have any green tokens you may perform a %FOCUS% action.﻿﻿"""
        "Concussion Missiles":
           text: """Attack (%LOCK%): Spend 1 %CHARGE%. After this attack hits, each ship at range 0-1 of the defender exposes 1 of its damage cards."""
        "Conner Nets":
           text: """Mine During the System Phase, you may spend 1 %CHARGE% to drop a Conner Net using the [1 %STRAIGHT%] template. This card's %CHARGE% cannot be recovered."""
        "Contraband Cybernetics":
           text: """Before you activate, you may spend 1 %CHARGE%. If you do, until the end of the round, you can perform actions and execute red maneuvers, even while stressed."""
        "Crack Shot":
           text: """While you perform a primary attack, if the defender is in your %BULLSEYEARC%, before the Neutralize Results step, you may spend 1 %CHARGE% to cancel 1 %EVADE% result."""
        "Daredevil":
           text: """<i>Requires: White %BOOST% and Small Base</i> %LINEBREAK% While you perform a while %BOOST% action, you may treat it as red to use the [1%TURNLEFT%] or [1 %TURNRIGHT%] template instead."""
        "Darth Vader":
           text: """At the start of the Engagement Phase, you may choose 1 ship in your firing arc at range 0-2 and spend 1 %FORCE%. If you do, that ship suffers 1 %HIT% damage unless it chooses to remove 1 green token."""
        "Dauntless":
           text: """After you partially execute a maneuver, you may perform 1 white action, treating that action as red."""
        "Deadman's Switch":
           text: """After you are destroyed, each other ship at range 0-1 suffers 1 %HIT% damage."""
        "Death Troopers":
           text: """During the Activation Phase, enemy ships at range 0-1 cannot remove stress tokens."""
        "Debris Gambit":
           text: """<i>Requires: Small or Medium Base. Adds: <r>%EVADE%</r></i> %LINEBREAK% While you perform a red %EVADE% action, if there is an obstacle at range 0-1, treat the action as white instead."""
        "Dengar":
           text: """After you defend, if the attacker is in your firing arc, you may spend 1 %CHARGE%. If you do, roll 1 attack die unless the attacker chooses to remove 1 green token. On a %HIT% or %CRIT% result, the attacker suffers 1 %HIT% damage."""
        "Director Krennic":
           text: """<i>Adds: %LOCK%</i> %LINEBREAK% Setup: Before placing forces, assign the Optimized Prototype condition to another friendly ship."""
        "Dorsal Turret":
           text: """<i>Adds: %ROTATEARC%</i> %LINEBREAK%"""
        "Electronic Baffle":
           text: """During the End Phase, you may suffer 1 %HIT% damage to remove 1 red token."""
        "Elusive":
           text: """<i>Requires: Small or Medium Base</i> %LINEBREAK% While you defend, you may spend 1 %CHARGE% to reroll 1 defense die. After you fully execute a red maneuver, recover 1 %CHARGE%."""
        "Emperor Palpatine":
           text: """While another friendly ship defends or performs an attack, you may spend 1 %FORCE% to modify 1 of its dice as though that ship had spent 1 %FORCE%."""
        "Engine Upgrade":
           text: """<i>Requires: <r>%BOOST%</r>. Adds: %BOOST% %LINEBREAK% This upgrade has a variable cost, worth 3, 6, or 9 points depending on if the ship base is small, medium or large respectively.</i>"""
        "Expert Handling":
           text: """<i>Requires: <r>%BARRELROLL%</r>. Adds: %BARRELROLL% %LINEBREAK% This upgrade has a variable cost, worth 2, 4, or 6 points depending on if the ship base is small, medium or large respectively.</i>"""
        "Ezra Bridger":
           text: """After you perform a primary attack, you may spend 1 %FORCE% to perform a bonus %TURRET% attack from a %TURRET% you have not attacked from this round. If you do and you are stressed, you may reroll 1 attack die."""
        "Fearless":
           text: """While you perform a %FRONTARC% primary attack, if the attack range is 1 and you are in the defender's %FRONTARC%, you may change 1 of your results to a %HIT% result."""
        "Feedback Array":
           text: """Before you engage, you may gain 1 ion token and 1 disarm token. If you do, each ship at range 0 suffers 1 %HIT% damage."""
        "Fifth Brother":
           text: """While you perform an attack, you may spend 1 %FORCE% to change 1 of your %FOCUS% results to a %CRIT% result."""
        "Fire-Control System":
           text: """While you perform an attack, if you have a lock on the defender, you may reroll 1 attack die. If you do, you cannot spend your lock during this attack."""
        "Freelance Slicer":
           text: """While you defend, before attack dice are rolled, you may spend a lock you have on the attacker to roll 1 attack die. If you do, the attacker gains 1 %JAM% token. Then, on a %HIT% or %CRIT% result, gain 1 %JAM% token."""
        '"Genius"':
           text: """After you fully execute a maneuver, if you have not dropped or launched a device this round, you may drop 1 bomb."""
        "Ghost":
           text: """You can dock 1 attack shuttle or Sheathipede-class shuttle. Your docked ships can deploy only from your rear guides."""
        "Grand Inquisitor":
           text: """After an enemy ship at range 0-2 reveals its dial, you may spend 1 %FORCE% to perform 1 white action on your action bar, treating that action as red."""
        "Grand Moff Tarkin":
           text: """<i>Requires: %LOCK%</i> %LINEBREAK% During the System Phase, you may spend 2 %CHARGE%. If you do, each friendly ship may acquire a lock on a ship that you have locked."""
        "Greedo":
           text: """While you perform an attack, you may spend 1 %CHARGE% to change 1 %HIT% result to a %CRIT% result. While you defend, if your %CHARGE% is active, the attacker may change 1 %HIT% result to a %CRIT% result."""
        "Han Solo (Rebel)":
           text: """During the Engagement Phase, at initiative 7, you may perform a %TURRET% attack. You cannot attack from that %TURRET% again this round."""
        "Han Solo (Scum)":
           text: """Before you engage, you may perform a red %FOCUS% action."""
        "Havoc":
           text: """Remove %CREW% slot. Add %SYSTEM% and %ASTROMECH% slots."""
        "Heavy Laser Cannon":
           text: """Attack: After the Modify Attack Dice step, change all %CRIT% results to %HIT% results."""
        "Heightened Perception":
           text: """At the start of the Engagement Phase, you may spend 1 %FORCE%. If you do, engage at initiative 7 instead of your standard initiative value this phase."""
        "Hera Syndulla":
           text: """You can execute red maneuvers even while stressed. After you fully execute a red maneuver, if you have 3 or more stress tokens, remove 1 stress token and suffer 1 %HIT% damage."""
        "Homing Missiles":
           text: """Attack (%LOCK%): Spend 1 %CHARGE%. After you declare the defender, the defender may choose to suffer 1 %HIT% damage. If it does, skip the Attack and Defense Dice steps and the attack is treated as hitting."""
        "Hotshot Gunner":
           text: """While you perform a %TURRET% attack, after the Modify Defense Dice step, the defender removes 1 focus or calculate token."""
        "Hound's Tooth":
           text: """1 Z-95 AF4 headhunter can dock with you."""
        "Hull Upgrade":
           text: """Add 1 Hull Point %LINEBREAK%<i>This upgrade has a variable cost, worth 2, 3, 5, or 7 points depending on if the ship agility is 0, 1, 2, or 3 respectively.</i>"""
        "IG-2000":
           text: """You have the pilot ability of each other friendly ship with the IG-2000 upgrade."""
        "IG-88D":
           text: """<i>Adds: %CALCULATE%</i> %LINEBREAK% You have the pilot ability of each other friendly ship with the IG-2000 upgrade. After you perform a %CALCULATE% action, gain 1 calculate token. ADVANCED DROID BRAIN: After you perform a %CALCULATE% action, gain 1 calculate token."""
        "Inertial Dampeners":
           text: """Before you would execute a maneuver, you may spend 1 shield. If you do, execute a white [0 %STOP%] instead of the maneuver you revealed, then gain 1 stress token."""
        "Informant":
           text: """Setup: After placing forces, choose 1 enemy ship and assign the Listening Device condition to it."""
        "Instinctive Aim":
           text: """While you perform a special attack, you may spend 1 %FORCE% to ignore the %FOCUS% or %LOCK% requirement."""
        "Intimidation":
           text: """While an enemy ship at range 0 defends, it rolls 1 fewer defense die."""
        "Ion Cannon Turret":
           text: """<i>Adds: %ROTATEARC%</i> %LINEBREAK% Attack: If this attack hits, spend 1 %HIT% or %CRIT% result to cause the defender to suffer 1 %HIT% damage. All remaining %HIT%/%CRIT% results inflict ion tokens instead of damage."""
        "Ion Cannon":
           text: """Attack: If this attack hits, spend 1 %HIT% or %CRIT% result to cause the defender to suffer 1 %HIT% damage. All remaining %HIT%/%CRIT% results inflict ion tokens instead of damage."""
        "Ion Missiles":
           text: """Attack (%LOCK%): Spend 1 %CHARGE%. If this attack hits, spend 1 %HIT% or %CRIT% result to cause the defender to suffer 1 %HIT% damage. All remaining %HIT%/%CRIT% results inflict ion tokens instead of damage."""
        "Ion Torpedoes":
           text: """Attack (%LOCK%): Spend 1 %CHARGE%. If this attack hits, spend 1 %HIT% or %CRIT% result to cause the defender to suffer 1 %HIT% damage. All remaining %HIT%/%CRIT% results inflict ion tokens instead of damage."""
        "ISB Slicer":
           text: """During the End Phase, enemy ships at range 1-2 cannot remove jam tokens."""
        "Jabba the Hutt":
           text: """During the End Phase, you may choose 1 friendly ship at range 0-2 and spend 1 %CHARGE%. If you do, that ship recovers 1 %CHARGE% on 1 of its equipped %ILLICIT% upgrades."""
        "Jamming Beam":
           text: """Attack: If this attack hits, all %HIT%/%CRIT% results inflict jam tokens instead of damage."""
        "Juke":
           text: """<i>Requires: Small or Medium Base</i> %LINEBREAK% While you perform an attack, if you are evading, you may change 1 of the defender's %EVADE% results to a %FOCUS% result."""
        "Jyn Erso":
           text: """If a friendly ship at range 0-3 would gain a focus token, it may gain 1 evade token instead."""
        "Kanan Jarrus":
           text: """After a friendly ship at range 0-2 fully executes a white maneuver, you may spend 1 %FORCE% to remove 1 stress token from that ship."""
        "Ketsu Onyo":
           text: """At the start of the End Phase, you may choose 1 enemy ship at range 0-2 in your firing arc. If you do, that ship does not remove its tractor tokens."""
        "L3-37":
           text: """Setup: Equip this side faceup. While you defend, you may flip this card. If you do, the attack must reroll all attack dice"""
        "L3-37's Programming":
           text: """If you are not shielded, decrease the difficulty of your bank (%BANKLEFT% and %BANKRIGHT%) maneuvers."""
        "Lando Calrissian (Rebel)":
           text: """Action: Roll 2 defense dice. For each %FOCUS% result, gain 1 focus token. For each %EVADE% result, gain 1 evade token. If both results are blank, the opposing player chooses focus or evade. You gain 1 token of that type."""
        "Lando Calrissian (Scum)":
           text: """After you roll dice, you may spend 1 green token to reroll up to 2 of your results."""
        "Lando's Millennium Falcon":
           text: """1 Escape Craft may dock with you. While you have an Escape Craft docked, you may spend its shields as if they were on your ship card. While you perform a primary attack against a stressed ship, roll 1 additional attack die."""
        "Latts Razzi":
           text: """While you defend, if the attacker is stressed, you may remove 1 stress from the attacker to change 1 of your blank/%FOCUS% results to an %EVADE% result."""
        "Leia Organa":
           text: """At the start of the Activation Phase, you may spend 3 %CHARGE%. During this phase, each friendly ship reduces the difficulty of its red maneuvers."""
        "Lone Wolf":
           text: """While you defend or perform an attack, if there are no other friendly ships at range 0-2, you may spend 1 %CHARGE% to reroll 1 of your dice."""
        "Luke Skywalker":
           text: """At the start of the Engagement Phase, you may spend 1 %FORCE% to rotate your %TURRET% indicator."""
        "Magva Yarro":
           text: """After you defend, if the attack hit, you may acquire a lock on the attacker."""
        "Marauder":
           text: """While you perform a primary %REARARC% attack,, you may reroll 1 attack die. Add %GUNNER% slot."""
        "Marksmanship":
           text: """While you perform an attack, if the defender is in your %BULLSEYEARC%, you may change 1 %HIT% result to a %CRIT% result."""
        "Maul":
           text: """After you suffer damage, you may gain 1 stress token to recover 1 %FORCE%. You can equip \"Dark Side\" upgrades."""
        "Millennium Falcon":
           text: """<i>Adds: %EVADE%</i> %LINEBREAK% While you defend, if you are evading, you may reroll 1 defense die."""
        "Minister Tua":
           text: """At the start of the Engagement Phase, if you are damaged, you may perform a red %REINFORCE% action."""
        "Mist Hunter":
           text: """Add %CANNON% slot."""
        "Moff Jerjerrod":
           text: """<i>Requires: %COORDINATE%</i> %LINEBREAK% During the System Phase, you may spend 2 %CHARGE%. If you do, choose the (1 %BANKLEFT%), (1 %STRAIGHT%), or (1 %BANKRIGHT%) template. Each friendly ship may perform a red %BOOST% action using that template."""
        "Moldy Crow":
           text: """Gain a %FRONTARC% primary weapon with a value of \"3.\" During the End Phase, do not remove up to 2 focus tokens."""
        "Munitions Failsafe":
           text: """While you perform a %TORPEDO% or %MISSILE% attack, after rolling attack dice, you may cancel all dice results to recover 1 %CHARGE% you spent as a cost for the attack."""
        "Nien Nunb":
           text: """Decrease the difficulty of your bank maneuvers [%BANKLEFT% and %BANKRIGHT%]."""
        "Novice Technician":
           text: """At the end of the round, you may roll 1 attack die to repair 1 faceup damage card. Then, on a %HIT% result, expose 1 damage card."""
        "Os-1 Arsenal Loadout":
           text: """While you have exactly 1 disarm token, you can still perform %TORPEDO% and %MISSILE% attacks against targets you have locked. If you do, you cannot spend you lock during the attack. Add %TORPEDO% and %MISSILE% slots."""
        "Outmaneuver":
           text: """While you perform a %FRONTARC% attack, if you are not in the defender's firing arc, the defender rolls 1 fewer defense die."""
        "Outrider":
           text: """While you perform an attack that is obstructed by an obstacle, the defender rolls 1 fewer defense die. After you fully execute a maneuver, if you moved through or overlapped an obstacle, you may remove 1 of your red or orange tokens."""
        "Perceptive Copilot":
           text: """After you perform a %FOCUS% action, gain 1 focus token."""
        "Phantom":
           text: """You can dock at range 0-1."""
        "Phantom (Sheathipede)":
           text: """You can dock at range 0-1."""
        "Pivot Wing":
           text: """<b>Closed:</b> While you defend, roll 1 fewer defense die. After you execute a [0 %STOP%] maneuver, you may rotate your ship 90˚ or 180˚. Before you activate, you may flip this card %LINEBREAK% <b>Open:</b> Before you activate, you may flip this card"""
        "Predator":
           text: """While you perform a primary attack, if the defender is in your %BULLSEYEARC%, you may reroll 1 attack die."""
        "Proton Bombs":
           text: """Bomb During the System Phase, you may spend 1 %CHARGE% to drop a Proton Bomb using the [1 %STRAIGHT%] template."""
        "Proton Rockets":
           text: """Attack (%FOCUS%): Spend 1 %CHARGE%."""
        "Proton Torpedoes":
           text: """Attack (%LOCK%): Spend 1 %CHARGE%. Change 1 %HIT% result to a %CRIT% result."""
        "Proximity Mines":
           text: """Mine During the System Phase, you may spend 1 %CHARGE% to drop a Proximity Mine using the [1 %STRAIGHT%] template. This card's %CHARGE% cannot be recovered."""
        "Punishing One":
           text: """When you perform a primary attack, if the defender is in your %FRONTARC%, roll 1 additional attack die. Remove %CREW% slot. Add %ASTROMECH% slot."""
        "Qi'ra":
           text: """While you move and perform attacks, you ignore all obstacles that you are locking."""
        "R2 Astromech":
           text: """After you reveal your dial, you may spend 1 %CHARGE% and gain 1 disarm token to recover 1 shield."""
        "R2-D2 (Astromech)":
           text: """After you reveal your dial, you may spend 1 %CHARGE% and gain 1 disarm token to recover 1 shield."""
        "R2-D2 (Crew)":
           text: """During the End Phase, if you are damaged and not shielded, you may roll 1 attack die to recover 1 shield. On a %HIT% result, expose 1 of your damage cards."""
        "R3 Astromech":
           text: """You can maintain up to 2 locks. Each lock must be on a different object. After you perform a %LOCK% action, you may acquire a lock."""
        "R4 Astromech":
           text: """<i>Requires: Small Base</i> %LINEBREAK% Decrease the difficulty of your speed 1-2 basic maneuvers (%TURNLEFT%, %BANKLEFT%, %STRAIGHT%, %BANKRIGHT%, %TURNRIGHT%)."""
        "R5 Astromech":
           text: """Action: Spend 1 %CHARGE% to repair 1 facedown damage card. Action: Repair 1 faceup Ship damage card."""
        "R5-D8":
           text: """Action: Spend 1 %CHARGE% to repair 1 facedown damage card. Action: Repair 1 faceup Ship damage card."""
        "R5-P8":
           text: """While you perform an attack against a defender in your %FRONTARC%, you may spend 1 %CHARGE% to reroll 1 attack die. If the rerolled results is a %CRIT%, suffer 1 %CRIT% damage."""
        "R5-TK":
           text: """You can perform attacks against friendly ships."""
        "Rigged Cargo Chute":
           text: """<i>Requires: Medium or Large Base</i> %LINEBREAK% Action: Spend 1 %CHARGE%. Drop 1 loose cargo using the [1 %STRAIGHT%] template."""
        "Ruthless":
           text: """While you perform an attack, you may choose another friendly ship at range 0-1 of the defender. If you do, that ship suffers 1 %HIT% damage and you may change 1 of your die results to a %HIT% result."""
        "Sabine Wren":
           text: """Setup: Place 1 ion, 1 jam, 1 stress, and 1 tractor token on this card. After a ship suffers the effect of a friendly bomb, you may remove 1 ion, jam, stress, or tractor token from this card. If you do, that ship gains a matching token."""
        "Saturation Salvo":
           text: """<i>Requires: %RELOAD%</i> %LINEBREAK% While you perform a %TORPEDO% or %MISSILE% attack, you may spend 1 charge from that upgrade. If you do, choose two defense dice. The defender must reroll those dice."""
        "Saw Gerrera":
           text: """While you perform an attack, you may suffer 1 %HIT% damage to change all of your %FOCUS% results to %CRIT% results."""
        "Seasoned Navigator":
           text: """After you reveal your dial, you may set your dial to another non-red maneuver of the same speed. While you execute that maneuver, increase its difficulty."""
        "Seismic Charges":
           text: """Bomb During the System Phase, you may spend 1 %CHARGE% to drop a Seismic Charge with the [1 %STRAIGHT%] template."""
        "Selfless":
           text: """Whlie another friendly ship at range 0-1 defends, before the Neutralize Results step, if you are in the attack arc, you may suffer 1 %CRIT% damage to cancel 1 %CRIT% result."""
        "Sense":
           text: """During the System Phase, you may choose 1 ship at range 0-1 and look at its dial. If you spend 1 %FORCE%, you may choose a ship at range 0-3 instead."""
        "Servomotor S-Foils":
           text: """<b>Closed:</b> While you perform a primary attack, roll 1 fewer attack die. Before you activate, you may flip this card %LINEBREAK% <i>Adds: %BOOST%, %FOCUS% > <r>%BOOST%</r></i> %LINEBREAK% <b>Open:</b> Before you activate, you may flip this card"""
        "Seventh Sister":
           text: """If an enemy ship at range 0-1 would gain a stress token, you may spend 1 %FORCE% to have it gain 1 jam or tractor token instead."""
        "Shadow Caster":
           text: """After you perform an attack that hits, if the defender is in your %SINGLETURRETARC% and your %FRONTARC%, the defender gains 1 tractor token."""
        "Shield Upgrade":
           text: """Add 1 Shield Point %LINEBREAK%<i>This upgrade has a variable cost, worth 3, 4, 6, or 8 points depending on if the ship agility is 0, 1, 2, or 3 respectively.</i>"""
        "Skilled Bombardier":
           text: """If you would drop or launch a device, you may use a template of the same bearing with a speed 1 higher or lower."""
        "Slave I":
           text: """After you reveal a turn, (%TURNLEFT% or %TURNRIGHT%) or bank (%BANKLEFT% or %BANKRIGHT%) maneuver you may set your dial to the maneuver of the same speed and bearing in the other direction. Add %TORPEDO% slot."""
        "Squad Leader":
           text: """<i>Adds: <r>%COORDINATE%</r></i> %LINEBREAK% While you coordinate, the ship you choose can perform an action only if that action is also on your action bar."""
        "ST-321":
           text: """After you perform a %COORDINATE% action, you may choose an enemy ship at range 0-3 of the ship you coordinated. If you do, acquire a lock on that enemy ship, ignoring range restrictions."""
        "Static Discharge Vanes":
           text: """Before you would gain 1 ion or jam token, if you are not stressed, you may choose another ship at range 0–1 and gain 1 stress token. If you do, the chosen ship gains that ion or jam token instead."""
        "Stealth Device":
           text: """While you defend, if your %CHARGE% is active, roll 1 additional defense die. After you suffer damage, lost 1 %CHARGE%. %LINEBREAK%<i>This upgrade has a variable cost, worth 3, 4, 6, or 8 points depending on if the ship agility is 0, 1, 2, or 3 respectively.</i>"""
        "Supernatural Reflexes":
           text: """<i>Requires: Small Base</i> %LINEBREAK% Before you activate, you may spend 1 %FORCE% to perform a %BARRELROLL% or %BOOST% action. Then, if you performed an action you do not have on your action bar, suffer 1 %HIT% damage."""
        "Swarm Tactics":
           text: """At the start of the Engagement Phase, you may choose 1 friendly ship at range 1. If you do, that ship treats its initiative as equal to yours until the end of the round."""
        "Tactical Officer":
           text: """<i>Requires: <r>%COORDINATE%</r>. Adds: %COORDINATE%</i>"""
        "Tactical Scrambler":
           text: """<i>Requires: Medium or Large Base</i> %LINEBREAK% While you obstruct an enemy ship's attack, the defender rolls 1 additional defense die."""
        "Tobias Beckett":
           text: """Setup: After placing forces, you may choose 1 obstacle in the play area. If you do, place it anywhere in the play area beyond range 2 of any board edge or ship and beyond range 1 of other obstacles."""
        "Tractor Beam":
           text: """Attack: If this attack hits, all %HIT%/%CRIT% results inflict tractor tokens instead of damage."""
        "Trajectory Simulator":
           text: """During the System Phase, if you would drop or launch a bomb, you may launch it using the (5 %STRAIGHT%) tempplate instead."""
        "Trick Shot":
           text: """While you perform an attack that is obstructed by an obstacle, roll 1 additional attack die."""
        "Unkar Plutt":
           text: """After you partially excute a maneuver, you may suffer 1 %HIT% damage to perform 1 white action."""
        "Veteran Tail Gunner":
           text: """<i>Requires: %REARARC%</i> %LINEBREAK% After you perform a primary %FRONTARC% attack, you may perform a bonus primary %REARARC% attack."""
        "Veteran Turret Gunner":
           text: """<i>Requires: %TURRET%</i> %LINEBREAK% After you perform a primary attack, you may perform a bonus %TURRET% attack using a %TURRET% you did not already attack from this round."""
        "Virago":
           text: """During the End Phase, you may spend 1 %CHARGE% to perform a red %BOOST% action. Add %MODIFICATION% slot."""
        "Xg-1 Assault Configuration":
           text: """While you have exactly 1 disarm token, you can still perform %CANNON% attacks. While you perform a %CANNON% attack while disarmed, roll a maximum of 3 attack dice. Add %CANNON% slot."""
        '"Zeb" Orrelios':
           text: """You can perform primary attacks at range 0. Enemy ships at range 0 can perform primary attacks against you."""
        "Zuckuss":
           text: """While you perform an attack, if you are not stressed, you may choose 1 defense die and gain 1 stress token. If you do, the defender must reroll that die."""
        'GNK "Gonk" Droid':
           text: """Setup: Lose 1 %CHARGE%. Action: Recover 1 %CHARGE%. Action: Spend 1 %CHARGE% to recover 1 shield."""
        "Hardpoint: Cannon":
           text: """Adds a %CANNON% slot"""
        "Hardpoint: Missile":
           text: """Adds a %MISSILE% slot"""
        "Hardpoint: Torpedo":
           text: """Adds a %TORPEDO% slot"""
        "Black One":
           text: """<i>Adds: %SLAM%</i> %LINEBREAK% After you perform a %SLAM% action, lose 1 %CHARGE%. Then you may gain 1 ion token to remove 1 disarm token. %LINEBREAK% If your charge is inactive, you cannot perform the %SLAM% action."""
        "Heroic":
           text: """ While you defend or perform an attack, if you have only blank results and have 2 or more results, you may reroll any number of your dice. """
        "Rose Tico":
           text: """ ??? """
        "Finn":
           text: """ While you defend or perform a primary attack, if the enemy ship is in your %FRONTARC%, you may add 1 blank result to your roll ... can be rerolled or otherwise ...  """
        "Integrated S-Foils":
           text: """<b>Closed:</b> While you perform a primary attack, if the defender is not in your %BULLSEYEARC%, roll 1 fewer attack die. Before you activate, you may flip this card. %LINEBREAK% <i>Adds: %BARRELROLL%, %FOCUS% > <r>%BARRELROLL%</r></i> %LINEBREAK% <b>Open:</b> ???"""
        "Targeting Synchronizer":
           text: """<i>Requires: %LOCK%</i> %LINEBREAK% While a friendly ship at range 1-2 performs an attack against a target you have locked, that ship ignores the %LOCK% attack requirement. """
        "Primed Thrusters":
           text: """<i>Requires: Small Base</i> %LINEBREAK% While you have 2 or fewer stress tokens, you can perform %BARRELROLL% and %BOOST% actions even while stressed. """
        "Kylo Ren (Crew)":
           text: """ Action: Choose 1 enemy ship at range 1-3. If you do, spend 1 %FORCE% to assign the I'll Show You the Dark Side condition to that ship. """
        "General Hux":
           text: """ ... perform a white %COORDINATE% action ... it as red. If you do, you ... up to 2 additional ships ... ship type, and each ship you coordinate must perform the same action, treating that action as red. """
        "Fanatical":
           text: """ While you perform a primary attack, if you are not shielded, you may change 1 %FOCUS% result to a %HIT% result. """
        "Special Forces Gunner":
           text: """ ... you perform a primary %FRONTARC% attack, ... your %TURRET% is in your %FRONTARC%, you may roll 1 additional attack die. After you perform a primary %FRONTARC% attack, ... your %TURRET% is in your %BACKARC%, you may perform a bonus primary %TURRET% attack. """
        "Captain Phasma":
           text: """ ??? """
        "Supreme Leader Snoke":
           text: """ ??? """
        "Hyperspace Tracking Data":
           text: """ Setup: Before placing forces, you may ... 0 and 6 ... """
        "Advanced Optics":
           text: """ While you perform an attack, you may spend 1 focus to change 1 of your blank results to a %HIT% result. """
        "Rey (Gunner)":
           text: """ ... defend or ... If the ... in your %TURRET% ... 1 %FORCE% to ... 1 of your blank results to a %EVADE% or %HIT% result. """
            
    condition_translations =
        'Suppressive Fire':
           text: '''While you perform an attack against a ship other than <strong>Captain Rex</strong>, roll 1 fewer attack die. %LINEBREAK% After <strong>Captain Rex</strong> defends, remove this card.  %LINEBREAK% At the end of the Combat Phase, if <strong>Captain Rex</strong> did not perform an attack this phase, remove this card. %LINEBREAK% After <strong>Captain Rex</strong> is destroyed, remove this card.'''
        'Hunted':
           text: '''After you are destroyed, you must choose another friendly ship and assign this condition to it, if able.'''
        'Listening Device':
           text: '''During the System Phase, if an enemy ship with the <strong>Informant</strong> upgrade is at range 0-2, flip your dial faceup.'''
        'Optimized Prototype':
           text: '''While you perform a %FRONTARC% primary attack against a ship locked by a friendly ship with the <strong>Director Krennic</strong> upgrade, you may spend 1 %HIT%/%CRIT%/%FOCUS% result. If you do, choose one: the defender loses 1 shield or the defender flips 1 of its facedown damage cards.'''
        '''I'll Show You the Dark Side''': 
           text: ''' ??? '''
        'Proton Bomb':
           text: '''(Bomb Token) - At the end of the Activation Phase, this device detonates. When this device detonates, each ship at range 0–1 suffers 1 %CRIT% damage.'''
        'Seismic Charge':
           text: '''(Bomb Token) - At the end of the Activation Phase this device detonates. When this device detonates, choose 1 obstacle at range 0–1. Each ship at range 0–1 of the obstacle suffers 1 %HIT% damage. Then remove that obstacle. '''
        'Bomblet':
           text: '''(Bomb Token) - At the end of the Activation Phase this device detonates. When this device detonates, each ship at range 0–1 rolls 2 attack dice. Each ship suffers 1 %HIT% damage for each %HIT%/%CRIT% result.'''
        'Loose Cargo':
           text: '''(Debris Token) - Loose cargo is a debris cloud.'''
        'Conner Net':
           text: '''(Mine Token) - After a ship overlaps or moves through this device, it detonates. When this device detonates, the ship suffers 1 %HIT% damage and gains 3 ion tokens.'''
        'Proximity Mine':
           text: '''(Mine Token) - After a ship overlaps or moves through this device, it detonates. When this device detonates, that ship rolls 2 attack dice. That ship then suffers 1 %HIT% plus 1 %HIT%/%CRIT% damage for each matching result.'''
            
    modification_translations =

    title_translations =
            
    exportObj.setupCardData basic_cards, pilot_translations, upgrade_translations, condition_translations, modification_translations, title_translations, 

exportObj = exports ? this

String::startsWith ?= (t) ->
    @indexOf t == 0

sortWithoutQuotes = (a, b) ->
    a_name = a.replace /[^a-z0-9]/ig, ''
    b_name = b.replace /[^a-z0-9]/ig, ''
    if a_name < b_name
        -1
    else if a_name > b_name
        1
    else
        0

exportObj.manifestByExpansion =
    'Second Edition Core Set': [
        {
            name: 'X-Wing'
            type: 'ship'
            count: 1
        }
        {
            name: 'TIE Fighter'
            type: 'ship'
            count: 2
        }
        {
            name: 'Luke Skywalker'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Jek Porkins'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Red Squadron Veteran'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Blue Squadron Escort'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Iden Versio'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Valen Rudor'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Black Squadron Ace'
            type: 'pilot'
            count: 2
        }
        {
            name: '"Night Beast"'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Obsidian Squadron Pilot'
            type: 'pilot'
            count: 2
        }
        {
            name: 'Academy Pilot'
            type: 'pilot'
            count: 2
        }
        {
            name: 'Elusive'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Outmaneuver'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Predator'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Heightened Perception'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Instinctive Aim'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Sense'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Supernatural Reflexes'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Proton Torpedoes'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'R2 Astromech'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'R2-D2 (Astromech)'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'R3 Astromech'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'R5 Astromech'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'R5-D8'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Servomotor S-Foils'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Afterburners'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Hull Upgrade'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Shield Upgrade'
            type: 'upgrade'
            count: 1
        }
    ]
    "Saw's Renegades Expansion Pack" : [
        {
            name: 'U-Wing'
            type: 'ship'
            count: 1
        }
        {
            name: 'X-Wing'
            type: 'ship'
            count: 1
        }
        {
            name: 'Saw Gerrera'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Magva Yarro'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Benthic Two-Tubes'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Partisan Renegade'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Kullbee Sperado'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Leevan Tenza'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Edrio Two-Tubes'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Cavern Angels Zealot'
            type: 'pilot'
            count: 3
        }
        {
            name: 'R3 Astromech'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'R4 Astromech'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Saw Gerrera'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Magva Yarro'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Pivot Wing'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Servomotor S-Foils'
            type: 'upgrade'
            count: 1
        }
        {
            name: "Deadman's Switch"
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Advanced Sensors'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Trick Shot'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Proton Torpedoes'
            type: 'upgrade'
            count: 1
        }
    ]
    'TIE Reaper Expansion Pack' : [
        {
            name: 'TIE Reaper'
            type: 'ship'
            count: 1
        }
        {
            name: 'Major Vermeil'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Captain Feroph'
            type: 'pilot'
            count: 1
        }
        {
            name: '"Vizier"'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Scarif Base Pilot'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Director Krennic'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Death Troopers'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'ISB Slicer'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Tactical Officer'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Swarm Tactics'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Juke'
            type: 'upgrade'
            count: 2
        }
    ]
    'Rebel Alliance Conversion Kit': [
        {
            name: 'A-Wing'
            type: 'ship'
            count: 3
        }
        {
            name: 'ARC-170'
            type: 'ship'
            count: 2
        }
        {
            name: 'Auzituck Gunship'
            type: 'ship'
            count: 2
        }
        {
            name: 'B-Wing'
            type: 'ship'
            count: 2
        }
        {
            name: 'E-Wing'
            type: 'ship'
            count: 2
        }
        {
            name: 'VCX-100'
            type: 'ship'
            count: 2
        }
        {
            name: 'HWK-290'
            type: 'ship'
            count: 2
        }
        {
            name: 'K-Wing'
            type: 'ship'
            count: 2
        }
        {
            name: 'YT-1300'
            type: 'ship'
            count: 2
        }
        {
            name: 'Attack Shuttle'
            type: 'ship'
            count: 2
        }
        {
            name: 'Sheathipede-Class Shuttle'
            type: 'ship'
            count: 2
        }
        {
            name: 'TIE Fighter'
            type: 'ship'
            count: 2
        }
        {
            name: 'U-Wing'
            type: 'ship'
            count: 2
        }
        {
            name: 'X-Wing'
            type: 'ship'
            count: 2
        }
        {
            name: 'Y-Wing'
            type: 'ship'
            count: 2
        }
        {
            name: 'YT-2400'
            type: 'ship'
            count: 2
        }
        {
            name: 'Z-95 Headhunter'
            type: 'ship'
            count: 4
        }
        {
            name: 'Thane Kyrell'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Norra Wexley (Y-Wing)'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Evaan Verlaine'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Biggs Darklighter'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Garven Dreis (X-Wing)'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Wedge Antilles'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Blue Squadron Escort'
            type: 'pilot'
            count: 2
        }
        {
            name: 'Red Squadron Veteran'
            type: 'pilot'
            count: 2
        }
        {
            name: '"Dutch" Vander'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Horton Salm'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Gold Squadron Veteran'
            type: 'pilot'
            count: 2
        }
        {
            name: 'Gray Squadron Bomber'
            type: 'pilot'
            count: 2
        }
        {
            name: 'Arvel Crynyd'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Jake Farrell'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Green Squadron Pilot'
            type: 'pilot'
            count: 2
        }
        {
            name: 'Phoenix Squadron Pilot'
            type: 'pilot'
            count: 2
        }
        {
            name: 'Braylen Stramm'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Ten Numb'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Blue Squadron Pilot'
            type: 'pilot'
            count: 2
        }
        {
            name: 'Blade Squadron Veteran'
            type: 'pilot'
            count: 2
        }
        {
            name: 'Airen Cracken'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Lieutenant Blount'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Bandit Squadron Pilot'
            type: 'pilot'
            count: 3
        }
        {
            name: 'Tala Squadron Pilot'
            type: 'pilot'
            count: 3
        }
        {
            name: 'Lowhhrick'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Wullffwarro'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Kashyyyk Defender'
            type: 'pilot'
            count: 2
        }
        {
            name: 'Ezra Bridger'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Hera Syndulla'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Sabine Wren'
            type: 'pilot'
            count: 1
        }
        {
            name: '"Zeb" Orrelios'
            type: 'pilot'
            count: 1
        }
        {
            name: 'AP-5'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Ezra Bridger (Sheathipede)'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Fenn Rau (Sheathipede)'
            type: 'pilot'
            count: 1
        }
        {
            name: '"Zeb" Orrelios (Sheathipede)'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Jan Ors'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Kyle Katarn'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Roark Garnet'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Rebel Scout'
            type: 'pilot'
            count: 2
        }
        {
            name: 'Captain Rex'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Ezra Bridger (TIE Fighter)'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Sabine Wren (TIE Fighter)'
            type: 'pilot'
            count: 1
        }
        {
            name: '"Zeb" Orrelios (TIE Fighter)'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Corran Horn'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Gavin Darklighter'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Knave Squadron Escort'
            type: 'pilot'
            count: 2
        }
        {
            name: 'Rogue Squadron Escort'
            type: 'pilot'
            count: 2
        }
        {
            name: 'Bodhi Rook'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Cassian Andor'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Heff Tobber'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Blue Squadron Scout'
            type: 'pilot'
            count: 2
        }
        {
            name: 'Esege Tuketu'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Miranda Doni'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Warden Squadron Pilot'
            type: 'pilot'
            count: 2
        }
        {
            name: 'Garven Dreis'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Ibtisam'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Norra Wexley'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Shara Bey'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Chewbacca'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Han Solo (Rebel)'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Lando Calrissian (Rebel)'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Outer Rim Smuggler'
            type: 'pilot'
            count: 1
        }
        {
            name: '"Chopper"'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Hera Syndulla (VCX-100)'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Kanan Jarrus'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Lothal Rebel'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Dash Rendar'
            type: 'pilot'
            count: 1
        }
        {
            name: '"Leebo"'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Wild Space Fringer'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Crack Shot'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Daredevil'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Debris Gambit'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Elusive'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Expert Handling'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Intimidation'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Juke'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Lone Wolf'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Marksmanship'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Outmaneuver'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Predator'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Saturation Salvo'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Selfless'
            type: 'upgrade'
            count: 3
        }
        {
            name: 'Squad Leader'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Swarm Tactics'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Trick Shot'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Advanced Sensors'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Collision Detector'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Fire-Control System'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Cloaking Device'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Contraband Cybernetics'
            type: 'upgrade'
            count: 2
        }
        {
            name: "Deadman's Switch"
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Feedback Array'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Inertial Dampeners'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Rigged Cargo Chute'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Heavy Laser Cannon'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Ion Cannon'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Jamming Beam'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Tractor Beam'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Dorsal Turret'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Ion Cannon Turret'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Adv. Proton Torpedoes'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Ion Torpedoes'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Proton Torpedoes'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Baze Malbus'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'C-3PO'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Cassian Andor'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Chewbacca (Rebel)'
            type: 'upgrade'
            count: 1
        }
        {
            name: '"Chopper" (Crew)'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Freelance Slicer'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'GNK "Gonk" Droid'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Hera Syndulla'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Informant'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Jyn Erso'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Kanan Jarrus'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Lando Calrissian (Rebel)'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Leia Organa'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Nien Nunb'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Novice Technician'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Perceptive Copilot'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'R2-D2 (Crew)'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Sabine Wren'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Seasoned Navigator'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Tactical Officer'
            type: 'upgrade'
            count: 1
        }
        {
            name: '"Zeb" Orrelios'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Cluster Missiles'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Concussion Missiles'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Homing Missiles'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Ion Missiles'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Proton Rockets'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Bomblet Generator'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Conner Nets'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Proton Bombs'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Proximity Mines'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Seismic Charges'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Ghost'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Millennium Falcon'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Moldy Crow'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Outrider'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Phantom'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Pivot Wing'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Servomotor S-Foils'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Bistan'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Ezra Bridger'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Han Solo (Rebel)'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Hotshot Gunner'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Luke Skywalker'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Skilled Bombardier'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Veteran Tail Gunner'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Veteran Turret Gunner'
            type: 'upgrade'
            count: 2
        }
        {
            name: '"Chopper" (Astromech)'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'R2 Astromech'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'R3 Astromech'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'R4 Astromech'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'R5 Astromech'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Ablative Plating'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Advanced SLAM'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Electronic Baffle'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Engine Upgrade'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Hull Upgrade'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Munitions Failsafe'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Shield Upgrade'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Static Discharge Vanes'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Stealth Device'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Tactical Scrambler'
            type: 'upgrade'
            count: 2
        }
    ]
    'Galactic Empire Conversion Kit': [
        {
            name: 'Alpha-Class Star Wing'
            type: 'ship'
            count: 2
        }
        {
            name: 'TIE Advanced Prototype'
            type: 'ship'
            count: 3
        }
        {
            name: 'Lambda-Class Shuttle'
            type: 'ship'
            count: 2
        }
        {
            name: 'TIE Advanced'
            type: 'ship'
            count: 2
        }
        {
            name: 'TIE Aggressor'
            type: 'ship'
            count: 3
        }
        {
            name: 'TIE Bomber'
            type: 'ship'
            count: 3
        }
        {
            name: 'TIE Defender'
            type: 'ship'
            count: 2
        }
        {
            name: 'TIE Fighter'
            type: 'ship'
            count: 4
        }
        {
            name: 'TIE Interceptor'
            type: 'ship'
            count: 3
        }
        {
            name: 'TIE Phantom'
            type: 'ship'
            count: 2
        }
        {
            name: 'TIE Punisher'
            type: 'ship'
            count: 2
        }
        {
            name: 'TIE Striker'
            type: 'ship'
            count: 3
        }
        {
            name: 'VT-49 Decimator'
            type: 'ship'
            count: 3
        }
        {
            name: 'Ved Foslo'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Del Meeko'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Gideon Hask'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Seyn Marana'
            type: 'pilot'
            count: 1
        }
        {
            name: '"Howlrunner"'
            type: 'pilot'
            count: 1
        }
        {
            name: '"Mauler" Mithel'
            type: 'pilot'
            count: 1
        }
        {
            name: '"Scourge" Skutu'
            type: 'pilot'
            count: 1
        }
        {
            name: '"Wampa"'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Black Squadron Ace'
            type: 'pilot'
            count: 4
        }
        {
            name: 'Obsidian Squadron Pilot'
            type: 'pilot'
            count: 4
        }
        {
            name: 'Academy Pilot'
            type: 'pilot'
            count: 4
        }
        {
            name: 'Darth Vader'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Maarek Stele'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Zertik Strom'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Storm Squadron Ace'
            type: 'pilot'
            count: 2
        }
        {
            name: 'Tempest Squadron Pilot'
            type: 'pilot'
            count: 2
        }
        {
            name: 'Grand Inquisitor'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Seventh Sister'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Baron of the Empire'
            type: 'pilot'
            count: 3
        }
        {
            name: 'Inquisitor'
            type: 'pilot'
            count: 3
        }
        {
            name: 'Soontir Fel'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Turr Phennir'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Alpha Squadron Pilot'
            type: 'pilot'
            count: 2
        }
        {
            name: 'Saber Squadron Ace'
            type: 'pilot'
            count: 2
        }
        {
            name: 'Tomax Bren'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Captain Jonus'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Major Rhymer'
            type: 'pilot'
            count: 1
        }
        {
            name: '"Deathfire"'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Gamma Squadron Ace'
            type: 'pilot'
            count: 3
        }
        {
            name: 'Scimitar Squadron Pilot'
            type: 'pilot'
            count: 3
        }
        {
            name: '"Duchess"'
            type: 'pilot'
            count: 1
        }
        {
            name: '"Countdown"'
            type: 'pilot'
            count: 1
        }
        {
            name: '"Pure Sabacc"'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Black Squadron Scout'
            type: 'pilot'
            count: 3
        }
        {
            name: 'Planetary Sentinel'
            type: 'pilot'
            count: 3
        }
        {
            name: 'Rexler Brath'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Colonel Vessery'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Countess Ryad'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Onyx Squadron Ace'
            type: 'pilot'
            count: 2
        }
        {
            name: 'Delta Squadron Pilot'
            type: 'pilot'
            count: 2
        }
        {
            name: '"Double Edge"'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Lieutenant Kestal'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Onyx Squadron Scout'
            type: 'pilot'
            count: 2
        }
        {
            name: 'Sienar Specialist'
            type: 'pilot'
            count: 2
        }
        {
            name: '"Echo"'
            type: 'pilot'
            count: 1
        }
        {
            name: '"Whisper"'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Imdaar Test Pilot'
            type: 'pilot'
            count: 2
        }
        {
            name: '"Sigma Squadron Ace"'
            type: 'pilot'
            count: 2
        }
        {
            name: 'Major Vynder'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Lieutenant Karsabi'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Rho Squadron Pilot'
            type: 'pilot'
            count: 2
        }
        {
            name: 'Nu Squadron Pilot'
            type: 'pilot'
            count: 2
        }
        {
            name: '"Redline"'
            type: 'pilot'
            count: 1
        }
        {
            name: '"Deathrain"'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Cutlass Squadron Pilot'
            type: 'pilot'
            count: 2
        }
        {
            name: 'Captain Kagi'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Colonel Jendon'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Lieutenant Sai'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Omicron Group Pilot'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Rear Admiral Chiraneau'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Captain Oicunn'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Patrol Leader'
            type: 'pilot'
            count: 2
        }
        {
            name: 'Crack Shot'
            type: 'upgrade'
            count: 3
        }
        {
            name: 'Daredevil'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Debris Gambit'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Elusive'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Expert Handling'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Intimidation'
            type: 'upgrade'
            count: 3
        }
        {
            name: 'Juke'
            type: 'upgrade'
            count: 3
        }
        {
            name: 'Lone Wolf'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Marksmanship'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Outmaneuver'
            type: 'upgrade'
            count: 3
        }
        {
            name: 'Predator'
            type: 'upgrade'
            count: 3
        }
        {
            name: 'Ruthless'
            type: 'upgrade'
            count: 3
        }
        {
            name: 'Saturation Salvo'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Squad Leader'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Swarm Tactics'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Trick Shot'
            type: 'upgrade'
            count: 3
        }
        {
            name: 'Advanced Sensors'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Collision Detector'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Fire-Control System'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Trajectory Simulator'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Heavy Laser Cannon'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Ion Cannon'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Jamming Beam'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Tractor Beam'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Dorsal Turret'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Ion Cannon Turret'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Adv. Proton Torpedoes'
            type: 'upgrade'
            count: 3
        }
        {
            name: 'Ion Torpedoes'
            type: 'upgrade'
            count: 3
        }
        {
            name: 'Proton Torpedoes'
            type: 'upgrade'
            count: 3
        }
        {
            name: 'Barrage Rockets'
            type: 'upgrade'
            count: 3
        }
        {
            name: 'Cluster Missiles'
            type: 'upgrade'
            count: 3
        }
        {
            name: 'Concussion Missiles'
            type: 'upgrade'
            count: 3
        }
        {
            name: 'Homing Missiles'
            type: 'upgrade'
            count: 3
        }
        {
            name: 'Ion Missiles'
            type: 'upgrade'
            count: 3
        }
        {
            name: 'Proton Rockets'
            type: 'upgrade'
            count: 3
        }
        {
            name: 'Admiral Sloane'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Agent Kallus'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Ciena Ree'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Darth Vader'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Emperor Palpatine'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Freelance Slicer'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'GNK "Gonk" Droid'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Grand Inquisitor'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Grand Moff Tarkin'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Informant'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Minister Tua'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Moff Jerjerrod'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Novice Technician'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Perceptive Copilot'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Seasoned Navigator'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Seventh Sister'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Tactical Officer'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Fifth Brother'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Hotshot Gunner'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Skilled Bombardier'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Veteran Turret Gunner'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Bomblet Generator'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Conner Nets'
            type: 'upgrade'
            count: 3
        }
        {
            name: 'Proton Bombs'
            type: 'upgrade'
            count: 3
        }
        {
            name: 'Proximity Mines'
            type: 'upgrade'
            count: 3
        }
        {
            name: 'Seismic Charges'
            type: 'upgrade'
            count: 3
        }
        {
            name: 'Dauntless'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'ST-321'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Os-1 Arsenal Loadout'
            type: 'upgrade'
            count: 3
        }
        {
            name: 'Xg-1 Assault Configuration'
            type: 'upgrade'
            count: 3
        }
        {
            name: 'Ablative Plating'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Advanced SLAM'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Electronic Baffle'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Hull Upgrade'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Munitions Failsafe'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Shield Upgrade'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Static Discharge Vanes'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Stealth Device'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Tactical Scrambler'
            type: 'upgrade'
            count: 2
        }
    ]
    'Scum and Villainy Conversion Kit': [
        {
            name: 'YV-666'
            type: 'ship'
            count: 2
        }
        {
            name: 'HWK-290'
            type: 'ship'
            count: 2
        }
        {
            name: 'M12-L Kimogila Fighter'
            type: 'ship'
            count: 2
        }
        {
            name: 'M3-A Interceptor'
            type: 'ship'
            count: 4
        }
        {
            name: 'G-1A Starfighter'
            type: 'ship'
            count: 2
        }
        {
            name: 'Fang Fighter'
            type: 'ship'
            count: 3
        }
        {
            name: 'JumpMaster 5000'
            type: 'ship'
            count: 2
        }
        {
            name: 'Quadjumper'
            type: 'ship'
            count: 3
        }
        {
            name: 'Scurrg H-6 Bomber'
            type: 'ship'
            count: 2
        }
        {
            name: 'Lancer-class Pursuit Craft'
            type: 'ship'
            count: 2
        }
        {
            name: 'Firespray-31'
            type: 'ship'
            count: 2
        }
        {
            name: 'Starviper'
            type: 'ship'
            count: 2
        }
        {
            name: 'Y-Wing'
            type: 'ship'
            count: 2
        }
        {
            name: 'Z-95 Headhunter'
            type: 'ship'
            count: 4
        }
        {
            name: 'Joy Rekkoff'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Koshka Frost'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Marauder'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Fenn Rau'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Kad Solus'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Old Teroch'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Skull Squadron Pilot'
            type: 'pilot'
            count: 2
        }
        {
            name: 'Zealous Recruit'
            type: 'pilot'
            count: 3
        }
        {
            name: 'Constable Zuvio'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Sarco Plank'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Unkar Plutt'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Jakku Gunrunner'
            type: 'pilot'
            count: 3
        }
        {
            name: 'Drea Renthal'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Kavil'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Crymorah Goon'
            type: 'pilot'
            count: 2
        }
        {
            name: 'Hired Gun'
            type: 'pilot'
            count: 2
        }
        {
            name: "Kaa'to Leeachos"
            type: 'pilot'
            count: 1
        }
        {
            name: 'Nashtah Pup'
            type: 'pilot'
            count: 1
        }
        {
            name: "N'dru Suhlak"
            type: 'pilot'
            count: 1
        }
        {
            name: 'Black Sun Soldier'
            type: 'pilot'
            count: 3
        }
        {
            name: 'Binayre Pirate'
            type: 'pilot'
            count: 3
        }
        {
            name: 'Dace Bonearm'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Palob Godalhi'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Torkil Mux'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Spice Runner'
            type: 'pilot'
            count: 3
        }
        {
            name: 'Dalan Oberos (StarViper)'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Guri'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Prince Xizor'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Black Sun Assassin'
            type: 'pilot'
            count: 2
        }
        {
            name: 'Black Sun Enforcer'
            type: 'pilot'
            count: 2
        }
        {
            name: 'Genesis Red'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Inaldra'
            type: 'pilot'
            count: 1
        }
        {
            name: "Laetin A'shera"
            type: 'pilot'
            count: 1
        }
        {
            name: 'Quinn Jast'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Serissu'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Sunny Bounder'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Tansarii Point Veteran'
            type: 'pilot'
            count: 4
        }
        {
            name: 'Cartel Spacer'
            type: 'pilot'
            count: 4
        }
        {
            name: 'Captain Jostero'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Graz'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Talonbane Cobra'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Viktor Hel'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Black Sun Ace'
            type: 'pilot'
            count: 3
        }
        {
            name: 'Cartel Marauder'
            type: 'pilot'
            count: 3
        }
        {
            name: 'Boba Fett'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Emon Azzameen'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Kath Scarlet'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Krassis Trelix'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Bounty Hunter'
            type: 'pilot'
            count: 2
        }
        {
            name: 'IG-88A'
            type: 'pilot'
            count: 1
        }
        {
            name: 'IG-88B'
            type: 'pilot'
            count: 1
        }
        {
            name: 'IG-88C'
            type: 'pilot'
            count: 1
        }
        {
            name: 'IG-88D'
            type: 'pilot'
            count: 1
        }
        {
            name: '4-LOM'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Zuckuss'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Gand Findsman'
            type: 'pilot'
            count: 2
        }
        {
            name: 'Captain Nym'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Sol Sixxa'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Lok Revenant'
            type: 'pilot'
            count: 2
        }
        {
            name: 'Dalan Oberos'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Torani Kulda'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Cartel Executioner'
            type: 'pilot'
            count: 2
        }
        {
            name: 'Bossk'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Latts Razzi'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Moralo Eval'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Trandoshan Slaver'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Dengar'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Manaroo'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Tel Trevura'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Contracted Scout'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Asajj Ventress'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Ketsu Onyo'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Sabine Wren (Scum)'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Shadowport Hunter'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Crack Shot'
            type: 'upgrade'
            count: 3
        }
        {
            name: 'Daredevil'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Debris Gambit'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Elusive'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Expert Handling'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Fearless'
            type: 'upgrade'
            count: 3
        }
        {
            name: 'Intimidation'
            type: 'upgrade'
            count: 3
        }
        {
            name: 'Juke'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Lone Wolf'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Marksmanship'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Outmaneuver'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Predator'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Saturation Salvo'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Squad Leader'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Swarm Tactics'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Trick Shot'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Advanced Sensors'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Collision Detector'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Fire-Control System'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Trajectory Simulator'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Cloaking Device'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Contraband Cybernetics'
            type: 'upgrade'
            count: 2
        }
        {
            name: "Deadman's Switch"
            type: 'upgrade'
            count: 3
        }
        {
            name: 'Feedback Array'
            type: 'upgrade'
            count: 3
        }
        {
            name: 'Inertial Dampeners'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Rigged Cargo Chute'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Heavy Laser Cannon'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Ion Cannon'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Jamming Beam'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Tractor Beam'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Dorsal Turret'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Ion Cannon Turret'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Adv. Proton Torpedoes'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Ion Torpedoes'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Proton Torpedoes'
            type: 'upgrade'
            count: 2
        }
        {
            name: '0-0-0'
            type: 'upgrade'
            count: 1
        }
        {
            name: '4-LOM'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Boba Fett'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Cad Bane'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Cikatro Vizago'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Freelance Slicer'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'GNK "Gonk" Droid'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'IG-88D'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Informant'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Jabba the Hutt'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Ketsu Onyo'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Latts Razzi'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Maul'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Novice Technician'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Perceptive Copilot'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Seasoned Navigator'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Tactical Officer'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Unkar Plutt'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Zuckuss'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Bossk'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'BT-1'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Dengar'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Greedo'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Hotshot Gunner'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Skilled Bombardier'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Veteran Tail Gunner'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Veteran Turret Gunner'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Cluster Missiles'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Concussion Missiles'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Homing Missiles'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Ion Missiles'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Proton Rockets'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Bomblet Generator'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Conner Nets'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Proton Bombs'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Proximity Mines'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Seismic Charges'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Andrasta'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Havoc'
            type: 'upgrade'
            count: 1
        }
        {
            name: "Hound's Tooth"
            type: 'upgrade'
            count: 1
        }
        {
            name: 'IG-2000'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Mist Hunter'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Punishing One'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Shadow Caster'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Slave I'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Virago'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Ablative Plating'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Electronic Baffle'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Engine Upgrade'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Hull Upgrade'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Munitions Failsafe'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Shield Upgrade'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Static Discharge Vanes'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Stealth Device'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'Tactical Scrambler'
            type: 'upgrade'
            count: 2
        }
        {
            name: '"Genius"'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'R2 Astromech'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'R3 Astromech'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'R4 Astromech'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'R5 Astromech'
            type: 'upgrade'
            count: 2
        }
        {
            name: 'R5-P8'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'R5-TK'
            type: 'upgrade'
            count: 1
        }
    ]
    'T-65 X-Wing Expansion Pack' : [
        {
            name: 'X-Wing'
            type: 'ship'
            count: 1
        }
        {
            name: 'Wedge Antilles'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Thane Kyrell'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Garven Dreis (X-Wing)'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Biggs Darklighter'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Red Squadron Veteran'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Blue Squadron Escort'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Selfless'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Ion Torpedoes'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'R2 Astromech'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'R4 Astromech'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Servomotor S-Foils'
            type: 'upgrade'
            count: 1
        }
    ]
    'BTL-A4 Y-Wing Expansion Pack' : [
        {
            name: 'Y-Wing'
            type: 'ship'
            count: 1
        }
        {
            name: 'Horton Salm'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Norra Wexley (Y-Wing)'
            type: 'pilot'
            count: 1
        }
        {
            name: '"Dutch" Vander'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Evaan Verlaine'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Gold Squadron Veteran'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Gray Squadron Bomber'
            type: 'pilot'
            count: 1
        }
        {
            name: 'R5 Astromech'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Expert Handling'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Ion Cannon Turret'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Proton Bombs'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Seismic Charges'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Veteran Turret Gunner'
            type: 'upgrade'
            count: 1
        }
    ]
    'TIE/ln Fighter Expansion Pack': [
        {
            name: 'TIE Fighter'
            type: 'ship'
            count: 1
        }
        {
            name: '"Howlrunner"'
            type: 'pilot'
            count: 1
        }
        {
            name: '"Mauler" Mithel'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Gideon Hask'
            type: 'pilot'
            count: 1
        }
        {
            name: '"Scourge" Skutu'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Seyn Marana'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Del Meeko'
            type: 'pilot'
            count: 1
        }
        {
            name: '"Wampa"'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Black Squadron Ace'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Obsidian Squadron Pilot'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Academy Pilot'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Crack Shot'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Juke'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Marksmanship'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Stealth Device'
            type: 'upgrade'
            count: 1
        }
    ]
    'TIE Advanced x1 Expansion Pack': [
        {
            name: 'TIE Advanced'
            type: 'ship'
            count: 1
        }
        {
            name: 'Darth Vader'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Maarek Stele'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Ved Foslo'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Zertik Strom'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Storm Squadron Ace'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Tempest Squadron Pilot'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Heightened Perception'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Supernatural Reflexes'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Ruthless'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Squad Leader'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Cluster Missiles'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Fire-Control System'
            type: 'upgrade'
            count: 1
        }
    ]
    'Slave I Expansion Pack': [
        {
            name: 'Firespray-31'
            type: 'ship'
            count: 1
        }
        {
            name: 'Boba Fett'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Kath Scarlet'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Emon Azzameen'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Koshka Frost'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Krassis Trelix'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Bounty Hunter'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Heavy Laser Cannon'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Boba Fett'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Perceptive Copilot'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Proximity Mines'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Seismic Charges'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Veteran Tail Gunner'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Inertial Dampeners'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Concussion Missiles'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Lone Wolf'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Andrasta'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Marauder'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Slave I'
            type: 'upgrade'
            count: 1
        }
    ]
    'Fang Fighter Expansion Pack': [
        {
            name: 'Fang Fighter'
            type: 'ship'
            count: 1
        }
        {
            name: 'Fenn Rau'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Old Teroch'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Kad Solus'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Joy Rekkoff'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Skull Squadron Pilot'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Zealous Recruit'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Afterburners'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Fearless'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Daredevil'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Ion Torpedoes'
            type: 'upgrade'
            count: 1
        }
    ]
    "Lando's Millennium Falcon Expansion Pack": [
        {
            name: 'YT-1300 (Scum)'
            type: 'ship'
            count: 1
        }
        {
            name: 'Escape Craft'
            type: 'ship'
            count: 1
        }
        {
            name: 'Han Solo (Scum)'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Lando Calrissian (Scum)'
            type: 'pilot'
            count: 1
        }
        {
            name: 'L3-37'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Freighter Captain'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Lando Calrissian (Scum) (Escape Craft)'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Outer Rim Pioneer'
            type: 'pilot'
            count: 1
        }
        {
            name: 'L3-37 (Escape Craft)'
            type: 'pilot'
            count: 1
        }
        {
            name: 'Autopilot Drone'
            type: 'pilot'
            count: 1
        }
        {
            name: 'L3-37'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Chewbacca (Scum)'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Lando Calrissian (Scum)'
            type: 'upgrade'
            count: 1
        }
        {
            name: "Qi'ra"
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Tobias Beckett'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Seasoned Navigator'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Han Solo (Scum)'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Agile Gunner'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Composure'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Intimidation'
            type: 'upgrade'
            count: 1
        }
        {
            name: "Lando's Millennium Falcon"
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Rigged Cargo Chute'
            type: 'upgrade'
            count: 1
        }
        {
            name: 'Tactical Scrambler'
            type: 'upgrade'
            count: 1
        }
    ]

class exportObj.Collection
    # collection = new exportObj.Collection
    #   expansions:
    #     "Core": 2
    #     "TIE Fighter Expansion Pack": 4
    #     "B-Wing Expansion Pack": 2
    #   singletons:
    #     ship:
    #       "T-70 X-Wing": 1
    #     pilot:
    #       "Academy Pilot": 16
    #     upgrade:
    #       "C-3PO": 4
    #       "Gunner": 5
    #     modification:
    #       "Engine Upgrade": 2
    #     title:
    #       "TIE/x1": 1
    #
    # # or
    #
    # collection = exportObj.Collection.load(backend)
    #
    # collection.use "pilot", "Red Squadron Pilot"
    # collection.use "upgrade", "R2-D2"
    # collection.use "upgrade", "Ion Pulse Missiles" # returns false
    #
    # collection.release "pilot", "Red Squadron Pilot"
    # collection.release "pilot", "Sigma Squadron Pilot" # returns false

    constructor: (args) ->
        @expansions = args.expansions ? {}
        @singletons = args.singletons ? {}
        # To save collection (optional)
        @backend = args.backend

        @setupUI()
        @setupHandlers()

        @reset()

        @language = 'English'

    reset: ->
        @shelf = {}
        @table = {}
        for expansion, count of @expansions
            try
                count = parseInt count
            catch
                count = 0
            for _ in [0...count]
                for card in (exportObj.manifestByExpansion[expansion] ? [])
                    for _ in [0...card.count]
                        ((@shelf[card.type] ?= {})[card.name] ?= []).push expansion

        for type, counts of @singletons
            for name, count of counts
                for _ in [0...count]
                    ((@shelf[type] ?= {})[name] ?= []).push 'singleton'

        @counts = {}
        for own type of @shelf
            for own thing of @shelf[type]
                (@counts[type] ?= {})[thing] ?= 0
                @counts[type][thing] += @shelf[type][thing].length

        component_content = $ @modal.find('.collection-inventory-content')
        component_content.text ''
        for own type, things of @counts
            contents = component_content.append $.trim """
                <div class="row-fluid">
                    <div class="span12"><h5>#{type.capitalize()}</h5></div>
                </div>
                <div class="row-fluid">
                    <ul id="counts-#{type}" class="span12"></ul>
                </div>
            """
            ul = $ contents.find("ul#counts-#{type}")
            for thing in Object.keys(things).sort(sortWithoutQuotes)
                ul.append """<li>#{thing} - #{things[thing]}</li>"""

    fixName: (name) ->
        # Special case handling for Heavy Scyk :(
        if name.indexOf('"Heavy Scyk" Interceptor') == 0
            '"Heavy Scyk" Interceptor'
        else
            name

    check: (where, type, name) ->
        (((where[type] ? {})[@fixName name] ? []).length ? 0) != 0

    checkShelf: (type, name) ->
        @check @shelf, type, name

    checkTable: (type, name) ->
        @check @table, type, name

    use: (type, name) ->
        name = @fixName name
        try
            card = @shelf[type][name].pop()
        catch e
            return false unless card?

        if card?
            ((@table[type] ?= {})[name] ?= []).push card
            true
        else
            false

    release: (type, name) ->
        name = @fixName name
        try
            card = @table[type][name].pop()
        catch e
            return false unless card?

        if card?
            ((@shelf[type] ?= {})[name] ?= []).push card
            true
        else
            false

    save: (cb=$.noop) ->
        @backend.saveCollection(this, cb) if @backend?

    @load: (backend, cb) ->
        backend.loadCollection cb

    setupUI: ->
        # Create list of released singletons
        singletonsByType = {}
        for expname, items of exportObj.manifestByExpansion
            for item in items
                (singletonsByType[item.type] ?= {})[item.name] = true
        for type, names of singletonsByType
            sorted_names = (name for name of names).sort(sortWithoutQuotes)
            singletonsByType[type] = sorted_names

        @modal = $ document.createElement 'DIV'
        @modal.addClass 'modal hide fade collection-modal hidden-print'
        $('body').append @modal
        @modal.append $.trim """
            <div class="modal-header">
                <button type="button" class="close hidden-print" data-dismiss="modal" aria-hidden="true">&times;</button>
                <h4>Your Collection</h4>
            </div>
            <div class="modal-body">
                <ul class="nav nav-tabs">
                    <li class="active"><a data-target="#collection-expansions" data-toggle="tab">Expansions</a><li>
                    <li><a data-target="#collection-ships" data-toggle="tab">Ships</a><li>
                    <li><a data-target="#collection-pilots" data-toggle="tab">Pilots</a><li>
                    <li><a data-target="#collection-upgrades" data-toggle="tab">Upgrades</a><li>
                    <li><a data-target="#collection-modifications" data-toggle="tab">Mods</a><li>
                    <li><a data-target="#collection-titles" data-toggle="tab">Titles</a><li>
                    <li><a data-target="#collection-components" data-toggle="tab">Inventory</a><li>
                </ul>
                <div class="tab-content">
                    <div id="collection-expansions" class="tab-pane active container-fluid collection-content"></div>
                    <div id="collection-ships" class="tab-pane active container-fluid collection-ship-content"></div>
                    <div id="collection-pilots" class="tab-pane active container-fluid collection-pilot-content"></div>
                    <div id="collection-upgrades" class="tab-pane active container-fluid collection-upgrade-content"></div>
                    <div id="collection-modifications" class="tab-pane active container-fluid collection-modification-content"></div>
                    <div id="collection-titles" class="tab-pane active container-fluid collection-title-content"></div>
                    <div id="collection-components" class="tab-pane container-fluid collection-inventory-content"></div>
                </div>
            </div>
            <div class="modal-footer hidden-print">
                <span class="collection-status"></span>
                &nbsp;
                <button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>
            </div>
        """
        @modal_status = $ @modal.find('.collection-status')

        collection_content = $ @modal.find('.collection-content')
        for expansion in exportObj.expansions
            count = parseInt(@expansions[expansion] ? 0)
            row = $.parseHTML $.trim """
                <div class="row-fluid">
                    <div class="span12">
                        <label>
                            <input class="expansion-count" type="number" size="3" value="#{count}" />
                            <span class="expansion-name">#{expansion}</span>
                        </label>
                    </div>
                </div>
            """
            input = $ $(row).find('input')
            input.data 'expansion', expansion
            input.closest('div').css 'background-color', @countToBackgroundColor(input.val())
            $(row).find('.expansion-name').data 'english_name', expansion
            collection_content.append row

        shipcollection_content = $ @modal.find('.collection-ship-content')
        for ship in singletonsByType.ship
            count = parseInt(@singletons.ship?[ship] ? 0)
            row = $.parseHTML $.trim """
                <div class="row-fluid">
                    <div class="span12">
                        <label>
                            <input class="singleton-count" type="number" size="3" value="#{count}" />
                            <span class="ship-name">#{ship}</span>
                        </label>
                    </div>
                </div>
            """
            input = $ $(row).find('input')
            input.data 'singletonType', 'ship'
            input.data 'singletonName', ship
            input.closest('div').css 'background-color', @countToBackgroundColor(input.val())
            $(row).find('.ship-name').data 'english_name', expansion
            shipcollection_content.append row

        pilotcollection_content = $ @modal.find('.collection-pilot-content')
        for pilot in singletonsByType.pilot
            count = parseInt(@singletons.pilot?[pilot] ? 0)
            row = $.parseHTML $.trim """
                <div class="row-fluid">
                    <div class="span12">
                        <label>
                            <input class="singleton-count" type="number" size="3" value="#{count}" />
                            <span class="pilot-name">#{pilot}</span>
                        </label>
                    </div>
                </div>
            """
            input = $ $(row).find('input')
            input.data 'singletonType', 'pilot'
            input.data 'singletonName', pilot
            input.closest('div').css 'background-color', @countToBackgroundColor(input.val())
            $(row).find('.pilot-name').data 'english_name', expansion
            pilotcollection_content.append row

        upgradecollection_content = $ @modal.find('.collection-upgrade-content')
        for upgrade in singletonsByType.upgrade
            count = parseInt(@singletons.upgrade?[upgrade] ? 0)
            row = $.parseHTML $.trim """
                <div class="row-fluid">
                    <div class="span12">
                        <label>
                            <input class="singleton-count" type="number" size="3" value="#{count}" />
                            <span class="upgrade-name">#{upgrade}</span>
                        </label>
                    </div>
                </div>
            """
            input = $ $(row).find('input')
            input.data 'singletonType', 'upgrade'
            input.data 'singletonName', upgrade
            input.closest('div').css 'background-color', @countToBackgroundColor(input.val())
            $(row).find('.upgrade-name').data 'english_name', expansion
            upgradecollection_content.append row

        ###modificationcollection_content = $ @modal.find('.collection-modification-content')
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
            modificationcollection_content.append row ###

        ###titlecollection_content = $ @modal.find('.collection-title-content')
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
            titlecollection_content.append row###

    destroyUI: ->
        @modal.modal 'hide'
        @modal.remove()
        $(exportObj).trigger 'xwing-collection:destroyed', this

    setupHandlers: ->
        $(exportObj).trigger 'xwing-collection:created', this

        $(exportObj).on 'xwing-backend:authenticationChanged', (e, authenticated, backend) =>
            # console.log "deauthed, destroying collection UI"
            @destroyUI() unless authenticated
        .on 'xwing-collection:saved', (e, collection) =>
            @modal_status.text 'Collection saved'
            @modal_status.fadeIn 100, =>
                @modal_status.fadeOut 5000
        .on 'xwing:languageChanged', @onLanguageChange

        $ @modal.find('input.expansion-count').change (e) =>
            target = $(e.target)
            val = target.val()
            target.val(0) if val < 0 or isNaN(parseInt(val))
            @expansions[target.data 'expansion'] = parseInt(target.val())

            target.closest('div').css 'background-color', @countToBackgroundColor(val)

            # console.log "Input changed, triggering collection change"
            $(exportObj).trigger 'xwing-collection:changed', this

        $ @modal.find('input.singleton-count').change (e) =>
            target = $(e.target)
            val = target.val()
            target.val(0) if val < 0 or isNaN(parseInt(val))
            (@singletons[target.data 'singletonType'] ?= {})[target.data 'singletonName'] = parseInt(target.val())

            target.closest('div').css 'background-color', @countToBackgroundColor(val)

            # console.log "Input changed, triggering collection change"
            $(exportObj).trigger 'xwing-collection:changed', this

    countToBackgroundColor: (count) ->
        count = parseInt(count)
        switch
            when count == 0
                ''
            when count < 12
                i = parseInt(200 * Math.pow(0.9, count - 1))
                "rgb(#{i}, 255, #{i})"
            else
                'red'

    onLanguageChange:
        (e, language) =>
            if language != @language
                # console.log "language changed to #{language}"
                do (language) =>
                    @modal.find('.expansion-name').each ->
                        # console.log "translating #{$(this).text()} (#{$(this).data('english_name')}) to #{language}"
                        $(this).text exportObj.translate language, 'sources', $(this).data('english_name')
                @language = language

###
    X-Wing Squad Builder
    Geordan Rosario <geordan@gmail.com>
    https://github.com/geordanr/xwing
###
DFL_LANGUAGE = 'English'

builders = []

exportObj = exports ? this

exportObj.loadCards = (language) ->
    exportObj.cardLoaders[language]()

exportObj.translate = (language, category, what, args...) ->
    translation = exportObj.translations[language][category][what]
    if translation?
        if translation instanceof Function
            # pass this function in case we need to do further translation inside the function
            translation exportObj.translate, language, args...
        else
            translation
    else
        what

exportObj.setupTranslationSupport = ->
    do (builders) ->
        $(exportObj).on 'xwing:languageChanged', (e, language, cb=$.noop) =>
            if language of exportObj.translations
                $('.language-placeholder').text language
                for builder in builders
                    await builder.container.trigger 'xwing:beforeLanguageLoad', defer()
                exportObj.loadCards language
                for own selector, html of exportObj.translations[language].byCSSSelector
                    $(selector).html html
                for builder in builders
                    builder.container.trigger 'xwing:afterLanguageLoad', language

    exportObj.loadCards DFL_LANGUAGE
    $(exportObj).trigger 'xwing:languageChanged', DFL_LANGUAGE

exportObj.setupTranslationUI = (backend) ->
    for language in Object.keys(exportObj.cardLoaders).sort()
        li = $ document.createElement 'LI'
        li.text language
        do (language, backend) ->
            li.click (e) ->
                backend.set('language', language) if backend?
                $(exportObj).trigger 'xwing:languageChanged', language
        $('ul.dropdown-menu').append li

exportObj.registerBuilderForTranslation = (builder) ->
    builders.push(builder) if builder not in builders

###
    X-Wing Squad Builder
    Geordan Rosario <geordan@gmail.com>
    https://github.com/geordanr/xwing
###
exportObj = exports ? this

exportObj.sortHelper = (a, b) ->
    if a.points == b.points
        a_name = a.text.replace(/[^a-z0-9]/ig, '')
        b_name = b.text.replace(/[^a-z0-9]/ig, '')
        if a_name == b_name
            0
        else
            if a_name > b_name then 1 else -1
    else
        if a.points > b.points then 1 else -1

$.isMobile = ->
    navigator.userAgent.match /(iPhone|iPod|iPad|Android)/i

$.randomInt = (n) ->
    Math.floor(Math.random() * n)

# ripped from http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values
$.getParameterByName = (name) ->
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]")
    regexS = "[\\?&]" + name + "=([^&#]*)"
    regex = new RegExp(regexS)
    results = regex.exec(window.location.search)
    if results == null
        return ""
    else
        return decodeURIComponent(results[1].replace(/\+/g, " "))

Array::intersects = (other) ->
    for item in this
        if item in other
            return true
    return false

Array::removeItem = (item) ->
    idx = @indexOf item
    @splice(idx, 1) unless idx == -1
    this

String::capitalize = ->
    @charAt(0).toUpperCase() + @slice(1)

String::getXWSBaseName = ->
    @split('-')[0]

URL_BASE = "#{window.location.protocol}//#{window.location.host}#{window.location.pathname}"
SQUAD_DISPLAY_NAME_MAX_LENGTH = 24

statAndEffectiveStat = (base_stat, effective_stats, key) ->
    """#{base_stat}#{if effective_stats[key] != base_stat then " (#{effective_stats[key]})" else ""}"""

getPrimaryFaction = (faction) ->
    switch faction
        when 'Rebel Alliance'
            'Rebel Alliance'
        when 'Galactic Empire'
            'Galactic Empire'
        else
            faction

conditionToHTML = (condition) ->
    html = $.trim """
        <div class="condition">
            <div class="name">#{if condition.unique then "&middot;&nbsp;" else ""}#{condition.name}</div>
            <div class="text">#{condition.text}</div>
        </div>
    """

# Assumes cards.js will be loaded

class exportObj.SquadBuilder
    constructor: (args) ->
        # args
        @container = $ args.container
        @faction = $.trim args.faction
        @printable_container = $ args.printable_container
        @tab = $ args.tab

        # internal state
        @ships = []
        @uniques_in_use =
            Pilot:
                []
            Upgrade:
                []
            Modification:
                []
            Title:
                []
        @suppress_automatic_new_ship = false
        @tooltip_currently_displaying = null
        @randomizer_options =
            sources: null
            points: 100
        @total_points = 0
        @isCustom = false
        @isEpic = false
        @maxEpicPointsAllowed = 0
        @maxSmallShipsOfOneType = null
        @maxLargeShipsOfOneType = null

        @backend = null
        @current_squad = {}
        @language = 'English'

        @collection = null

        @current_obstacles = []

        @setupUI()
        @setupEventHandlers()

        window.setInterval @updatePermaLink, 250

        @isUpdatingPoints = false

        if $.getParameterByName('f') == @faction
            @resetCurrentSquad(true)
            @loadFromSerialized $.getParameterByName('d')
        else
            @resetCurrentSquad()
            @addShip()

    resetCurrentSquad: (initial_load=false) ->
        default_squad_name = 'Unnamed Squadron'

        squad_name = $.trim(@squad_name_input.val()) or default_squad_name
        if initial_load and $.trim $.getParameterByName('sn')
            squad_name = $.trim $.getParameterByName('sn')

        squad_obstacles = []
        if initial_load and $.trim $.getParameterByName('obs')
            squad_obstacles = ($.trim $.getParameterByName('obs')).split(",").slice(0, 3)
            @current_obstacles = squad_obstacles
        else if @current_obstacles
            squad_obstacles = @current_obstacles

        @current_squad =
            id: null
            name: squad_name
            dirty: false
            additional_data:
                points: @total_points
                description: ''
                cards: []
                notes: ''
                obstacles: squad_obstacles
            faction: @faction

        if @total_points > 0
            if squad_name == default_squad_name
                @current_squad.name = 'Unsaved Squadron'
            @current_squad.dirty = true
        @container.trigger 'xwing-backend:squadNameChanged'
        @container.trigger 'xwing-backend:squadDirtinessChanged'

    newSquadFromScratch: ->
        @squad_name_input.val 'New Squadron'
        @removeAllShips()
        @addShip()
        @current_obstacles = []
        @resetCurrentSquad()
        @notes.val ''

    setupUI: ->
        DEFAULT_RANDOMIZER_POINTS = 100
        DEFAULT_RANDOMIZER_TIMEOUT_SEC = 2
        DEFAULT_RANDOMIZER_ITERATIONS = 1000

        @status_container = $ document.createElement 'DIV'
        @status_container.addClass 'container-fluid'
        @status_container.append $.trim '''
            <div class="row-fluid">
                <div class="span3 squad-name-container">
                    <div class="display-name">
                        <span class="squad-name"></span>
                        <i class="fa fa-pencil"></i>
                    </div>
                    <div class="input-append">
                        <input type="text" maxlength="64" placeholder="Name your squad..." />
                        <button class="btn save"><i class="fa fa-pencil-square-o"></i></button>
                    </div>
                </div>
                <div class="span4 points-display-container">
                    Points: <span class="total-points">0</span> / <input type="number" class="desired-points" value="100">
                    <select class="game-type-selector">
                        <option value="standard">Standard</option>
                        <option value="custom">Custom</option>
                    </select>
                    <span class="points-remaining-container">(<span class="points-remaining"></span>&nbsp;left)</span>
                    <span class="total-epic-points-container hidden"><br /><span class="total-epic-points">0</span> / <span class="max-epic-points">5</span> Epic Points</span>
                    <span class="content-warning unreleased-content-used hidden"><br /><i class="fa fa-exclamation-circle"></i>&nbsp;<span class="translated"></span></span>
                    <span class="content-warning epic-content-used hidden"><br /><i class="fa fa-exclamation-circle"></i>&nbsp;<span class="translated"></span></span>
                    <span class="content-warning illegal-epic-upgrades hidden"><br /><i class="fa fa-exclamation-circle"></i>&nbsp;Navigator cannot be equipped onto Huge ships in Epic tournament play!</span>
                    <span class="content-warning illegal-epic-too-many-small-ships hidden"><br /><i class="fa fa-exclamation-circle"></i>&nbsp;<span class="translated"></span></span>
                    <span class="content-warning illegal-epic-too-many-large-ships hidden"><br /><i class="fa fa-exclamation-circle"></i>&nbsp;<span class="translated"></span></span>
                    <span class="content-warning collection-invalid hidden"><br /><i class="fa fa-exclamation-circle"></i>&nbsp;<span class="translated"></span></span>
                </div>
                <div class="span5 pull-right button-container">
                    <div class="btn-group pull-right">

                        <button class="btn btn-primary view-as-text"><span class="hidden-phone"><i class="fa fa-print"></i>&nbsp;Print/View as </span>Text</button>
                        <!-- <button class="btn btn-primary print-list hidden-phone hidden-tablet"><i class="fa fa-print"></i>&nbsp;Print</button> -->
                        <a class="btn btn-primary hidden collection"><i class="fa fa-folder-open hidden-phone hidden-tabler"></i>&nbsp;Your Collection</a>

                        <!--
                        <button class="btn btn-primary randomize" ><i class="fa fa-random hidden-phone hidden-tablet"></i>&nbsp;Random!</button>
                        <button class="btn btn-primary dropdown-toggle" data-toggle="dropdown">
                            <span class="caret"></span>
                        </button>
                        <ul class="dropdown-menu">
                            <li><a class="randomize-options">Randomizer Options...</a></li>
                        </ul>
                        -->

                    </div>
                </div>
            </div>

            <div class="row-fluid">
                <div class="span12">
                    <button class="show-authenticated btn btn-primary save-list"><i class="fa fa-floppy-o"></i>&nbsp;Save</button>
                    <button class="show-authenticated btn btn-primary save-list-as"><i class="fa fa-files-o"></i>&nbsp;Save As...</button>
                    <button class="show-authenticated btn btn-primary delete-list disabled"><i class="fa fa-trash-o"></i>&nbsp;Delete</button>
                    <button class="show-authenticated btn btn-primary backend-list-my-squads show-authenticated">Load Squad</button>
                    <button class="btn btn-danger clear-squad">New Squad</button>
                    <span class="show-authenticated backend-status"></span>
                </div>
            </div>
        '''
        @container.append @status_container

        @list_modal = $ document.createElement 'DIV'
        @list_modal.addClass 'modal hide fade text-list-modal'
        @container.append @list_modal
        @list_modal.append $.trim """
            <div class="modal-header">
                <button type="button" class="close hidden-print" data-dismiss="modal" aria-hidden="true">&times;</button>

                <div class="hidden-phone hidden-print">
                    <h3><span class="squad-name"></span> (<span class="total-points"></span>)<h3>
                </div>

                <div class="visible-phone hidden-print">
                    <h4><span class="squad-name"></span> (<span class="total-points"></span>)<h4>
                </div>

                <div class="visible-print">
                    <div class="fancy-header">
                        <div class="squad-name"></div>
                        <div class="squad-faction"></div>
                        <div class="mask">
                            <div class="outer-circle">
                                <div class="inner-circle">
                                    <span class="total-points"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="fancy-under-header"></div>
                </div>

            </div>
            <div class="modal-body">
                <div class="fancy-list hidden-phone"></div>
                <div class="simple-list"></div>
                <div class="bbcode-list">
                    <p>Copy the BBCode below and paste it into your forum post.</p>
                    <textarea></textarea><button class="btn btn-copy">Copy</button>
                </div>
                <div class="html-list">
                    <textarea></textarea><button class="btn btn-copy">Copy</button>
                </div>
            </div>
            <div class="modal-footer hidden-print">
                <label class="vertical-space-checkbox">
                    Add space for damage/upgrade cards when printing <input type="checkbox" class="toggle-vertical-space" />
                </label>
                <label class="color-print-checkbox">
                    Print color <input type="checkbox" class="toggle-color-print" />
                </label>
                <label class="qrcode-checkbox hidden-phone">
                    Include QR codes <input type="checkbox" class="toggle-juggler-qrcode" checked="checked" />
                </label>
                <label class="qrcode-checkbox hidden-phone">
                    Include obstacle/damage deck choices <input type="checkbox" class="toggle-obstacles" />
                </label>
                <div class="btn-group list-display-mode">
                    <button class="btn select-simple-view">Simple</button>
                    <button class="btn select-fancy-view hidden-phone">Fancy</button>
                    <button class="btn select-bbcode-view">BBCode</button>
                    <button class="btn select-html-view">HTML</button>
                </div>
                <button class="btn print-list hidden-phone"><i class="fa fa-print"></i>&nbsp;Print</button>
                <button class="btn close-print-dialog" data-dismiss="modal" aria-hidden="true">Close</button>
            </div>
        """
        @fancy_container = $ @list_modal.find('div.modal-body .fancy-list')
        @fancy_total_points_container = $ @list_modal.find('div.modal-header .total-points')
        @simple_container = $ @list_modal.find('div.modal-body .simple-list')
        @bbcode_container = $ @list_modal.find('div.modal-body .bbcode-list')
        @bbcode_textarea = $ @bbcode_container.find('textarea')
        @bbcode_textarea.attr 'readonly', 'readonly'
        @htmlview_container = $ @list_modal.find('div.modal-body .html-list')
        @html_textarea = $ @htmlview_container.find('textarea')
        @html_textarea.attr 'readonly', 'readonly'
        @toggle_vertical_space_container = $ @list_modal.find('.vertical-space-checkbox')
        @toggle_color_print_container = $ @list_modal.find('.color-print-checkbox')

        @list_modal.on 'click', 'button.btn-copy', (e) =>
            @self = $(e.currentTarget)
            @self.siblings('textarea').select()
            @success = document.execCommand('copy')
            if @success
                @self.addClass 'btn-success'
                setTimeout ( =>
                    @self.removeClass 'btn-success'
                ), 1000

        @select_simple_view_button = $ @list_modal.find('.select-simple-view')
        @select_simple_view_button.click (e) =>
            @select_simple_view_button.blur()
            unless @list_display_mode == 'simple'
                @list_modal.find('.list-display-mode .btn').removeClass 'btn-inverse'
                @select_simple_view_button.addClass 'btn-inverse'
                @list_display_mode = 'simple'
                @simple_container.show()
                @fancy_container.hide()
                @bbcode_container.hide()
                @htmlview_container.hide()
                @toggle_vertical_space_container.hide()
                @toggle_color_print_container.hide()

        @select_fancy_view_button = $ @list_modal.find('.select-fancy-view')
        @select_fancy_view_button.click (e) =>
            @select_fancy_view_button.blur()
            unless @list_display_mode == 'fancy'
                @list_modal.find('.list-display-mode .btn').removeClass 'btn-inverse'
                @select_fancy_view_button.addClass 'btn-inverse'
                @list_display_mode = 'fancy'
                @fancy_container.show()
                @simple_container.hide()
                @bbcode_container.hide()
                @htmlview_container.hide()
                @toggle_vertical_space_container.show()
                @toggle_color_print_container.show()

        @select_bbcode_view_button = $ @list_modal.find('.select-bbcode-view')
        @select_bbcode_view_button.click (e) =>
            @select_bbcode_view_button.blur()
            unless @list_display_mode == 'bbcode'
                @list_modal.find('.list-display-mode .btn').removeClass 'btn-inverse'
                @select_bbcode_view_button.addClass 'btn-inverse'
                @list_display_mode = 'bbcode'
                @bbcode_container.show()
                @htmlview_container.hide()
                @simple_container.hide()
                @fancy_container.hide()
                @bbcode_textarea.select()
                @bbcode_textarea.focus()
                @toggle_vertical_space_container.show()
                @toggle_color_print_container.show()

        @select_html_view_button = $ @list_modal.find('.select-html-view')
        @select_html_view_button.click (e) =>
            @select_html_view_button.blur()
            unless @list_display_mode == 'html'
                @list_modal.find('.list-display-mode .btn').removeClass 'btn-inverse'
                @select_html_view_button.addClass 'btn-inverse'
                @list_display_mode = 'html'
                @bbcode_container.hide()
                @htmlview_container.show()
                @simple_container.hide()
                @fancy_container.hide()
                @html_textarea.select()
                @html_textarea.focus()
                @toggle_vertical_space_container.show()
                @toggle_color_print_container.show()

        if $(window).width() >= 768
            @simple_container.hide()
            @select_fancy_view_button.click()
        else
            @select_simple_view_button.click()

        @clear_squad_button = $ @status_container.find('.clear-squad')
        @clear_squad_button.click (e) =>
            if @current_squad.dirty and @backend?
                @backend.warnUnsaved this, () =>
                    @newSquadFromScratch()
            else
                @newSquadFromScratch()

        @squad_name_container = $ @status_container.find('div.squad-name-container')
        @squad_name_display = $ @container.find('.display-name')
        @squad_name_placeholder = $ @container.find('.squad-name')
        @squad_name_input = $ @squad_name_container.find('input')
        @squad_name_save_button = $ @squad_name_container.find('button.save')
        @squad_name_input.closest('div').hide()
        @points_container = $ @status_container.find('div.points-display-container')
        @total_points_span = $ @points_container.find('.total-points')
        @game_type_selector = $ @status_container.find('.game-type-selector')
        @game_type_selector.change (e) =>
            @onGameTypeChanged @game_type_selector.val()
        @desired_points_input = $ @points_container.find('.desired-points')
        @desired_points_input.change (e) =>
            @game_type_selector.val 'custom'
            @onGameTypeChanged 'custom'
        @points_remaining_span = $ @points_container.find('.points-remaining')
        @points_remaining_container = $ @points_container.find('.points-remaining-container')
        @unreleased_content_used_container = $ @points_container.find('.unreleased-content-used')
        @epic_content_used_container = $ @points_container.find('.epic-content-used')
        @illegal_epic_upgrades_container = $ @points_container.find('.illegal-epic-upgrades')
        @too_many_small_ships_container = $ @points_container.find('.illegal-epic-too-many-small-ships')
        @too_many_large_ships_container = $ @points_container.find('.illegal-epic-too-many-large-ships')
        @collection_invalid_container = $ @points_container.find('.collection-invalid')
        @total_epic_points_container = $ @points_container.find('.total-epic-points-container')
        @total_epic_points_span = $ @total_epic_points_container.find('.total-epic-points')
        @max_epic_points_span = $ @points_container.find('.max-epic-points')
        @view_list_button = $ @status_container.find('div.button-container button.view-as-text')
        @randomize_button = $ @status_container.find('div.button-container button.randomize')
        @customize_randomizer = $ @status_container.find('div.button-container a.randomize-options')
        @backend_status = $ @status_container.find('.backend-status')
        @backend_status.hide()

        @collection_button = $ @status_container.find('div.button-container a.collection')
        @collection_button.click (e) =>
            e.preventDefault()
            unless @collection_button.prop('disabled')
                @collection.modal.modal 'show'

        @squad_name_input.keypress (e) =>
            if e.which == 13
                @squad_name_save_button.click()
                false

        @squad_name_input.change (e) =>
            @backend_status.fadeOut 'slow'

        @squad_name_input.blur (e) =>
            @squad_name_input.change()
            @squad_name_save_button.click()

        @squad_name_display.click (e) =>
            e.preventDefault()
            @squad_name_display.hide()
            @squad_name_input.val $.trim(@current_squad.name)
            # Because Firefox handles this badly
            window.setTimeout () =>
                @squad_name_input.focus()
                @squad_name_input.select()
            , 100
            @squad_name_input.closest('div').show()
        @squad_name_save_button.click (e) =>
            e.preventDefault()
            @current_squad.dirty = true
            @container.trigger 'xwing-backend:squadDirtinessChanged'
            name = @current_squad.name = $.trim(@squad_name_input.val())
            if name.length > 0
                @squad_name_display.show()
                @container.trigger 'xwing-backend:squadNameChanged'
                @squad_name_input.closest('div').hide()

        @randomizer_options_modal = $ document.createElement('DIV')
        @randomizer_options_modal.addClass 'modal hide fade'
        $('body').append @randomizer_options_modal
        @randomizer_options_modal.append $.trim """
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                <h3>Random Squad Builder Options</h3>
            </div>
            <div class="modal-body">
                <form>
                    <label>
                        Desired Points
                        <input type="number" class="randomizer-points" value="#{DEFAULT_RANDOMIZER_POINTS}" placeholder="#{DEFAULT_RANDOMIZER_POINTS}" />
                    </label>
                    <label>
                        Sets and Expansions (default all)
                        <select class="randomizer-sources" multiple="1" data-placeholder="Use all sets and expansions">
                        </select>
                    </label>
                    <label>
                        Maximum Seconds to Spend Randomizing
                        <input type="number" class="randomizer-timeout" value="#{DEFAULT_RANDOMIZER_TIMEOUT_SEC}" placeholder="#{DEFAULT_RANDOMIZER_TIMEOUT_SEC}" />
                    </label>
                    <label>
                        Maximum Randomization Iterations
                        <input type="number" class="randomizer-iterations" value="#{DEFAULT_RANDOMIZER_ITERATIONS}" placeholder="#{DEFAULT_RANDOMIZER_ITERATIONS}" />
                    </label>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary do-randomize" aria-hidden="true">Randomize!</button>
                <button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>
            </div>
        """
        @randomizer_source_selector = $ @randomizer_options_modal.find('select.randomizer-sources')
        for expansion in exportObj.expansions
            opt = $ document.createElement('OPTION')
            opt.text expansion
            @randomizer_source_selector.append opt
        @randomizer_source_selector.select2
            width: "100%"
            minimumResultsForSearch: if $.isMobile() then -1 else 0

        @randomize_button.click (e) =>
            e.preventDefault()
            if @current_squad.dirty and @backend?
                @backend.warnUnsaved this, () =>
                    @randomize_button.click()
            else
                points = parseInt $(@randomizer_options_modal.find('.randomizer-points')).val()
                points = DEFAULT_RANDOMIZER_POINTS if (isNaN(points) or points <= 0)
                timeout_sec = parseInt $(@randomizer_options_modal.find('.randomizer-timeout')).val()
                timeout_sec = DEFAULT_RANDOMIZER_TIMEOUT_SEC if (isNaN(timeout_sec) or timeout_sec <= 0)
                iterations = parseInt $(@randomizer_options_modal.find('.randomizer-iterations')).val()
                iterations = DEFAULT_RANDOMIZER_ITERATIONS if (isNaN(iterations) or iterations <= 0)
                #console.log "points=#{points}, sources=#{@randomizer_source_selector.val()}, timeout=#{timeout_sec}, iterations=#{iterations}"
                @randomSquad(points, @randomizer_source_selector.val(), DEFAULT_RANDOMIZER_TIMEOUT_SEC * 1000, iterations)

        @randomizer_options_modal.find('button.do-randomize').click (e) =>
            e.preventDefault()
            @randomizer_options_modal.modal('hide')
            @randomize_button.click()

        @customize_randomizer.click (e) =>
            e.preventDefault()
            @randomizer_options_modal.modal()

        @choose_obstacles_modal = $ document.createElement 'DIV'
        @choose_obstacles_modal.addClass 'modal hide fade choose-obstacles-modal'
        @container.append @choose_obstacles_modal
        @choose_obstacles_modal.append $.trim """
            <div class="modal-header">
                <label class='choose-obstacles-description'>Choose up to three obstacles, to include in the permalink for use in external programs</label>
            </div>
            <div class="modal-body">
                <div class="obstacle-select-container" style="float:left">
                    <select multiple class='obstacle-select' size="18">
                        <option class="coreasteroid0-select" value="coreasteroid0">Core Asteroid 0</option>
                        <option class="coreasteroid1-select" value="coreasteroid1">Core Asteroid 1</option>
                        <option class="coreasteroid2-select" value="coreasteroid2">Core Asteroid 2</option>
                        <option class="coreasteroid3-select" value="coreasteroid3">Core Asteroid 3</option>
                        <option class="coreasteroid4-select" value="coreasteroid4">Core Asteroid 4</option>
                        <option class="coreasteroid5-select" value="coreasteroid5">Core Asteroid 5</option>
                        <option class="yt2400debris0-select" value="yt2400debris0">YT2400 Debris 0</option>
                        <option class="yt2400debris1-select" value="yt2400debris1">YT2400 Debris 1</option>
                        <option class="yt2400debris2-select" value="yt2400debris2">YT2400 Debris 2</option>
                        <option class="vt49decimatordebris0-select" value="vt49decimatordebris0">VT49 Debris 0</option>
                        <option class="vt49decimatordebris1-select" value="vt49decimatordebris1">VT49 Debris 1</option>
                        <option class="vt49decimatordebris2-select" value="vt49decimatordebris2">VT49 Debris 2</option>
                        <option class="core2asteroid0-select" value="core2asteroid0">Force Awakens Asteroid 0</option>
                        <option class="core2asteroid1-select" value="core2asteroid1">Force Awakens Asteroid 1</option>
                        <option class="core2asteroid2-select" value="core2asteroid2">Force Awakens Asteroid 2</option>
                        <option class="core2asteroid3-select" value="core2asteroid3">Force Awakens Asteroid 3</option>
                        <option class="core2asteroid4-select" value="core2asteroid4">Force Awakens Asteroid 4</option>
                        <option class="core2asteroid5-select" value="core2asteroid5">Force Awakens Asteroid 5</option>
                    </select>
                </div>
                <div class="obstacle-image-container" style="display:none;">
                    <img class="obstacle-image" src="images/core2asteroid0.png" />
                </div>
            </div>
            <div class="modal-footer hidden-print">
                <button class="btn close-print-dialog" data-dismiss="modal" aria-hidden="true">Close</button>
            </div>
        """
        @obstacles_select = @choose_obstacles_modal.find('.obstacle-select')
        @obstacles_select_image = @choose_obstacles_modal.find('.obstacle-image-container')

        # Backend

        @backend_list_squads_button = $ @container.find('button.backend-list-my-squads')
        @backend_list_squads_button.click (e) =>
            e.preventDefault()
            if @backend?
                @backend.list this
        #@backend_list_all_squads_button = $ @container.find('button.backend-list-all-squads')
        #@backend_list_all_squads_button.click (e) =>
        #    e.preventDefault()
        #    if @backend?
        #        @backend.list this, true
        @backend_save_list_button = $ @container.find('button.save-list')
        @backend_save_list_button.click (e) =>
            e.preventDefault()
            if @backend? and not @backend_save_list_button.hasClass('disabled')
                additional_data =
                    points: @total_points
                    description: @describeSquad()
                    cards: @listCards()
                    notes: @notes.val().substr(0, 1024)
                    obstacles: @getObstacles()
                @backend_status.html $.trim """
                    <i class="fa fa-refresh fa-spin"></i>&nbsp;Saving squad...
                """
                @backend_status.show()
                @backend_save_list_button.addClass 'disabled'
                await @backend.save @serialize(), @current_squad.id, @current_squad.name, @faction, additional_data, defer(results)
                if results.success
                    @current_squad.dirty = false
                    if @current_squad.id?
                        @backend_status.html $.trim """
                            <i class="fa fa-check"></i>&nbsp;Squad updated successfully.
                        """
                    else
                        @backend_status.html $.trim """
                            <i class="fa fa-check"></i>&nbsp;New squad saved successfully.
                        """
                        @current_squad.id = results.id
                    @container.trigger 'xwing-backend:squadDirtinessChanged'
                else
                    @backend_status.html $.trim """
                        <i class="fa fa-exclamation-circle"></i>&nbsp;#{results.error}
                    """
                    @backend_save_list_button.removeClass 'disabled'
        @backend_save_list_as_button = $ @container.find('button.save-list-as')
        @backend_save_list_as_button.addClass 'disabled'
        @backend_save_list_as_button.click (e) =>
            e.preventDefault()
            if @backend? and not @backend_save_list_as_button.hasClass('disabled')
                @backend.showSaveAsModal this
        @backend_delete_list_button = $ @container.find('button.delete-list')
        @backend_delete_list_button.click (e) =>
            e.preventDefault()
            if @backend? and not @backend_delete_list_button.hasClass('disabled')

                @backend.showDeleteModal this

        content_container = $ document.createElement 'DIV'
        content_container.addClass 'container-fluid'
        @container.append content_container
        content_container.append $.trim """
            <div class="row-fluid">
                <div class="span9 ship-container">
                    <label class="notes-container show-authenticated">
                        <span>Squad Notes:</span>
                        <br />
                        <textarea class="squad-notes"></textarea>
                    </label>
                    <span class="obstacles-container">
                        <button class="btn btn-primary choose-obstacles">Choose Obstacles</button>
                    </span>
                 </div>
               <div class="span3 info-container" />
            </div>
        """

        @ship_container = $ content_container.find('div.ship-container')
        @info_container = $ content_container.find('div.info-container')
        @obstacles_container = content_container.find('.obstacles-container')
        @notes_container = $ content_container.find('.notes-container')
        @notes = $ @notes_container.find('textarea.squad-notes')

        @info_container.append $.trim """
            <div class="well well-small info-well">
                <span class="info-name"></span>
                <br />
                <span class="info-sources"></span>
                <br />
                <span class="info-collection"></span>
                <table>
                    <tbody>
                        <tr class="info-ship">
                            <td class="info-header">Ship</td>
                            <td class="info-data"></td>
                        </tr>
                        <tr class="info-skill">
                            <td class="info-header">Initiative</td>
                            <td class="info-data info-skill"></td>
                        </tr>
                        <tr class="info-energy">
                            <td class="info-header"><i class="xwing-miniatures-font header-energy xwing-miniatures-font-energy"></i></td>
                            <td class="info-data info-energy"></td>
                        </tr>
                        <tr class="info-attack">
                            <td class="info-header"><i class="xwing-miniatures-font header-attack xwing-miniatures-font-frontarc"></i></td>
                            <td class="info-data info-attack"></td>
                        </tr>
                        <tr class="info-attack-fullfront">
                            <td class="info-header"><i class="xwing-miniatures-font header-attack xwing-miniatures-font-fullfrontarc"></i></td>
                            <td class="info-data info-attack"></td>
                        </tr>
                        <tr class="info-attack-bullseye">
                            <td class="info-header"><i class="xwing-miniatures-font header-attack xwing-miniatures-font-bullseyearc"></i></td>
                            <td class="info-data info-attack"></td>
                        </tr>
                        <tr class="info-attack-back">
                            <td class="info-header"><i class="xwing-miniatures-font header-attack xwing-miniatures-font-reararc"></i></td>
                            <td class="info-data info-attack"></td>
                        </tr>
                        <tr class="info-attack-turret">
                            <td class="info-header"><i class="xwing-miniatures-font header-attack xwing-miniatures-font-singleturretarc"></i></td>
                            <td class="info-data info-attack"></td>
                        </tr>
                        <tr class="info-attack-doubleturret">
                            <td class="info-header"><i class="xwing-miniatures-font header-attack xwing-miniatures-font-doubleturretarc"></i></td>
                            <td class="info-data info-attack"></td>
                        </tr>
                        <tr class="info-agility">
                            <td class="info-header"><i class="xwing-miniatures-font header-agility xwing-miniatures-font-agility"></i></td>
                            <td class="info-data info-agility"></td>
                        </tr>
                        <tr class="info-hull">
                            <td class="info-header"><i class="xwing-miniatures-font header-hull xwing-miniatures-font-hull"></i></td>
                            <td class="info-data info-hull"></td>
                        </tr>
                        <tr class="info-shields">
                            <td class="info-header"><i class="xwing-miniatures-font header-shield xwing-miniatures-font-shield"></i></td>
                            <td class="info-data info-shields"></td>
                        </tr>
                        <tr class="info-force">
                            <td class="info-header"><i class="xwing-miniatures-font header-force xwing-miniatures-font-forcecharge"></i></td>
                            <td class="info-data info-force"></td>
                        </tr>
                        <tr class="info-charge">
                            <td class="info-header"><i class="xwing-miniatures-font header-charge xwing-miniatures-font-charge"></i></td>
                            <td class="info-data info-charge"></td>
                        </tr>
                        <tr class="info-range">
                            <td class="info-header">Range</td>
                            <td class="info-data info-range"></td>
                        </tr>
                        <tr class="info-actions">
                            <td class="info-header">Actions</td>
                            <td class="info-data"></td>
                        </tr>
                        <tr class="info-actions-red">
                            <td></td>
                            <td class="info-data-red"></td>
                        </tr>
                        <tr class="info-upgrades">
                            <td class="info-header">Upgrades</td>
                            <td class="info-data"></td>
                        </tr>
                    </tbody>
                </table>
                <p class="info-text" />
                <p class="info-maneuvers" />
            </div>
        """
        @info_container.hide()

        @print_list_button = $ @container.find('button.print-list')

        @container.find('[rel=tooltip]').tooltip()

        # obstacles
        @obstacles_button = $ @container.find('button.choose-obstacles')
        @obstacles_button.click (e) =>
            e.preventDefault()
            @showChooseObstaclesModal()

        # conditions
        @condition_container = $ document.createElement('div')
        @condition_container.addClass 'conditions-container'
        @container.append @condition_container

    setupEventHandlers: ->
        @container.on 'xwing:claimUnique', (e, unique, type, cb) =>
            @claimUnique unique, type, cb
        .on 'xwing:releaseUnique', (e, unique, type, cb) =>
            @releaseUnique unique, type, cb
        .on 'xwing:pointsUpdated', (e, cb=$.noop) =>
            if @isUpdatingPoints
                cb()
            else
                @isUpdatingPoints = true
                @onPointsUpdated () =>
                    @isUpdatingPoints = false
                    cb()
        .on 'xwing-backend:squadLoadRequested', (e, squad) =>
            @onSquadLoadRequested squad
        .on 'xwing-backend:squadDirtinessChanged', (e) =>
            @onSquadDirtinessChanged()
        .on 'xwing-backend:squadNameChanged', (e) =>
            @onSquadNameChanged()
        .on 'xwing:beforeLanguageLoad', (e, cb=$.noop) =>
            @pretranslation_serialized = @serialize()
            # Need to remove ships here because the cards will change when the
            # new language is loaded, and we don't want to have problems with
            # unclaiming uniques.
            # Preserve squad dirtiness
            old_dirty = @current_squad.dirty
            @removeAllShips()
            @current_squad.dirty = old_dirty
            cb()
        .on 'xwing:afterLanguageLoad', (e, language, cb=$.noop) =>
            @language = language
            old_dirty = @current_squad.dirty
            @loadFromSerialized @pretranslation_serialized
            for ship in @ships
                ship.updateSelections()
            @current_squad.dirty = old_dirty
            @pretranslation_serialized = undefined
            cb()
        # Recently moved this here.  Did this ever work?
        .on 'xwing:shipUpdated', (e, cb=$.noop) =>
            all_allocated = true
            for ship in @ships
                ship.updateSelections()
                if ship.ship_selector.val() == ''
                    all_allocated = false
            #console.log "all_allocated is #{all_allocated}, suppress_automatic_new_ship is #{@suppress_automatic_new_ship}"
            #console.log "should we add ship: #{all_allocated and not @suppress_automatic_new_ship}"
            @addShip() if all_allocated and not @suppress_automatic_new_ship

        $(window).on 'xwing-backend:authenticationChanged', (e) =>
            @resetCurrentSquad()

        .on 'xwing-collection:created', (e, collection) =>
            # console.log "#{@faction}: collection was created"
            @collection = collection
            # console.log "#{@faction}: Collection created, checking squad"
            @collection.onLanguageChange null, @language
            @checkCollection()
            @collection_button.removeClass 'hidden'
        .on 'xwing-collection:changed', (e, collection) =>
            # console.log "#{@faction}: Collection changed, checking squad"
            @checkCollection()
        .on 'xwing-collection:destroyed', (e, collection) =>
            @collection = null
            @collection_button.addClass 'hidden'
        .on 'xwing:pingActiveBuilder', (e, cb) =>
            cb(this) if @container.is(':visible')
        .on 'xwing:activateBuilder', (e, faction, cb) =>
            if faction == @faction
                @tab.tab('show')
                cb this

        @obstacles_select.change (e) =>
            if @obstacles_select.val().length > 3
                @obstacles_select.val(@current_squad.additional_data.obstacles)
            else
                previous_obstacles = @current_squad.additional_data.obstacles
                @current_obstacles = (o for o in @obstacles_select.val())
                if (previous_obstacles?)
                    new_selection = @current_obstacles.filter((element) => return previous_obstacles.indexOf(element) == -1)
                else
                    new_selection = @current_obstacles
                if new_selection.length > 0
                    @showChooseObstaclesSelectImage(new_selection[0])
                @current_squad.additional_data.obstacles = @current_obstacles
                @current_squad.dirty = true
                @container.trigger 'xwing-backend:squadDirtinessChanged'

        @view_list_button.click (e) =>
            e.preventDefault()
            @showTextListModal()

        @print_list_button.click (e) =>
            e.preventDefault()
            # Copy text list to printable
            @printable_container.find('.printable-header').html @list_modal.find('.modal-header').html()
            @printable_container.find('.printable-body').text ''
            switch @list_display_mode
                when 'simple'
                    @printable_container.find('.printable-body').html @simple_container.html()
                else
                    for ship in @ships
                        @printable_container.find('.printable-body').append ship.toHTML() if ship.pilot?
                    @printable_container.find('.fancy-ship').toggleClass 'tall', @list_modal.find('.toggle-vertical-space').prop('checked')
                    @printable_container.find('.printable-body').toggleClass 'bw', not @list_modal.find('.toggle-color-print').prop('checked')

                    faction = switch @faction
                        when 'Rebel Alliance'
                            'rebel'
                        when 'Galactic Empire'
                            'empire'
                        when 'Scum and Villainy'
                            'scum'
                    @printable_container.find('.squad-faction').html """<i class="xwing-miniatures-font xwing-miniatures-font-#{faction}"></i>"""

            # Conditions
            @printable_container.find('.printable-body').append $.trim """
                <div class="print-conditions"></div>
            """
            @printable_container.find('.printable-body .print-conditions').html @condition_container.html()


            # Notes, if present
            if $.trim(@notes.val()) != ''
                @printable_container.find('.printable-body').append $.trim """
                    <h5 class="print-notes">Notes:</h5>
                    <pre class="print-notes"></pre>
                """
                @printable_container.find('.printable-body pre.print-notes').text @notes.val()

            # Obstacles
            if @list_modal.find('.toggle-obstacles').prop('checked')
                @printable_container.find('.printable-body').append $.trim """
                    <div class="obstacles">
                        <div>Mark the three obstacles you are using.</div>
                        <img class="obstacle-silhouettes" src="images/xws-obstacles.png" />
                        <div>Mark which damage deck you are using.</div>
                        <div><i class="fa fa-square-o"></i>Original Core Set&nbsp;&nbsp&nbsp;<i class="fa fa-square-o"></i>The Force Awakens Core Set</div>
                    </div>
                """

            # Add List Juggler QR code
            query = @getPermaLinkParams(['sn', 'obs'])
            if query? and @list_modal.find('.toggle-juggler-qrcode').prop('checked')
                @printable_container.find('.printable-body').append $.trim """
                <div class="qrcode-container">
                    <div class="permalink-container">
                        <div class="qrcode"></div>
                        <div class="qrcode-text">Scan to open this list in the builder</div>
                    </div>
                    <div class="juggler-container">
                        <div class="qrcode"></div>
                        <div class="qrcode-text">TOs: Scan to load this squad into List Juggler</div>
                    </div>
                </div>
                """
                text = "https://yasb-xws.herokuapp.com/juggler#{query}"
                @printable_container.find('.juggler-container .qrcode').qrcode
                    render: 'div'
                    ec: 'M'
                    size: if text.length < 144 then 144 else 160
                    text: text
                text = "https://geordanr.github.io/xwing/#{query}"
                @printable_container.find('.permalink-container .qrcode').qrcode
                    render: 'div'
                    ec: 'M'
                    size: if text.length < 144 then 144 else 160
                    text: text

            window.print()

        $(window).resize =>
            @select_simple_view_button.click() if $(window).width() < 768 and @list_display_mode != 'simple'

         @notes.change @onNotesUpdated

         @notes.on 'keyup', @onNotesUpdated

    getPermaLinkParams: (ignored_params=[]) =>
        params = {}
        params.f = encodeURI(@faction) unless 'f' in ignored_params
        params.d = encodeURI(@serialize()) unless 'd' in ignored_params
        params.sn = encodeURIComponent(@current_squad.name) unless 'sn' in ignored_params
        params.obs = encodeURI(@current_squad.additional_data.obstacles || '') unless 'obs' in ignored_params
        return "?" + ("#{k}=#{v}" for k, v of params).join("&")

    getPermaLink: (params=@getPermaLinkParams()) => "#{URL_BASE}#{params}"

    updatePermaLink: () =>
        return unless @container.is(':visible') # gross but couldn't make clearInterval work
        next_params = @getPermaLinkParams()
        if window.location.search != next_params
          window.history.replaceState(next_params, '', @getPermaLink(next_params))

    onNotesUpdated: =>
        if @total_points > 0
            @current_squad.dirty = true
            @container.trigger 'xwing-backend:squadDirtinessChanged'

    onGameTypeChanged: (gametype, cb=$.noop) =>
        switch gametype
            when 'standard'
                @isEpic = false
                @isCustom = false
                @desired_points_input.val 200
                @maxSmallShipsOfOneType = null
                @maxLargeShipsOfOneType = null
            when 'custom'
                @isEpic = false
                @isCustom = true
                @maxSmallShipsOfOneType = null
                @maxLargeShipsOfOneType = null
        @max_epic_points_span.text @maxEpicPointsAllowed
        @onPointsUpdated cb

    onPointsUpdated: (cb=$.noop) =>
        @total_points = 0
        @total_epic_points = 0
        unreleased_content_used = false
        epic_content_used = false
        for ship, i in @ships
            ship.validate()
            @total_points += ship.getPoints()
            @total_epic_points += ship.getEpicPoints()
            ship_uses_unreleased_content = ship.checkUnreleasedContent()
            unreleased_content_used = ship_uses_unreleased_content if ship_uses_unreleased_content
            ship_uses_epic_content = ship.checkEpicContent()
            epic_content_used = ship_uses_epic_content if ship_uses_epic_content
        @total_points_span.text @total_points
        points_left = parseInt(@desired_points_input.val()) - @total_points
        @points_remaining_span.text points_left
        @points_remaining_container.toggleClass 'red', (points_left < 0)
        @unreleased_content_used_container.toggleClass 'hidden', not unreleased_content_used
        @epic_content_used_container.toggleClass 'hidden', (@isEpic or not epic_content_used)

        # Check against Epic restrictions if applicable
        @illegal_epic_upgrades_container.toggleClass 'hidden', true
        @too_many_small_ships_container.toggleClass 'hidden', true
        @too_many_large_ships_container.toggleClass 'hidden', true
        @total_epic_points_container.toggleClass 'hidden', true
        if @isEpic
            @total_epic_points_container.toggleClass 'hidden', false
            @total_epic_points_span.text @total_epic_points
            @total_epic_points_span.toggleClass 'red', (@total_epic_points > @maxEpicPointsAllowed)
            shipCountsByType = {}
            illegal_for_epic = false
            for ship, i in @ships
                if ship?.data?
                    shipCountsByType[ship.data.name] ?= 0
                    shipCountsByType[ship.data.name] += 1
                    if ship.data.huge?
                        for upgrade in ship.upgrades
                            if upgrade?.data?.epic_restriction_func?
                                unless upgrade.data.epic_restriction_func(ship.data, upgrade)
                                    illegal_for_epic = true
                                    break
                            break if illegal_for_epic
            @illegal_epic_upgrades_container.toggleClass 'hidden', not illegal_for_epic
            if @maxLargeShipsOfOneType? and @maxSmallShipsOfOneType?
                for ship_name, count of shipCountsByType
                    ship_data = exportObj.ships[ship_name]
                    if ship_data.large? and count > @maxLargeShipsOfOneType
                        @too_many_large_ships_container.toggleClass 'hidden', false
                    else if not ship.huge? and count > @maxSmallShipsOfOneType
                        @too_many_small_ships_container.toggleClass 'hidden', false

        @fancy_total_points_container.text @total_points

        # update text list
        @fancy_container.text ''
        @simple_container.html '<table class="simple-table"></table>'
        bbcode_ships = []
        htmlview_ships = []
        for ship in @ships
            if ship.pilot?
                @fancy_container.append ship.toHTML()
                @simple_container.find('table').append ship.toTableRow()
                bbcode_ships.push ship.toBBCode()
                htmlview_ships.push ship.toSimpleHTML()
        @htmlview_container.find('textarea').val $.trim """#{htmlview_ships.join '<br />'}
<br />
<b><i>Total: #{@total_points}</i></b>
<br />
<a href="#{@getPermaLink()}">View in Yet Another Squad Builder</a>
        """
        @bbcode_container.find('textarea').val $.trim """#{bbcode_ships.join "\n\n"}

[b][i]Total: #{@total_points}[/i][/b]

[url=#{@getPermaLink()}]View in Yet Another Squad Builder[/url]
"""
        # console.log "#{@faction}: Squad updated, checking collection"
        @checkCollection()

        # update conditions used
        # this old version of phantomjs i'm using doesn't support Set
        if Set?
            conditions_set = new Set()
            for ship in @ships
                # shouldn't there be a set union
                ship.getConditions().forEach (condition) ->
                    conditions_set.add(condition)
            conditions = []
            conditions_set.forEach (condition) ->
                conditions.push(condition)
            conditions.sort (a, b) ->
                if a.name.canonicalize() < b.name.canonicalize()
                    -1
                else if b.name.canonicalize() > a.name.canonicalize()
                    1
                else
                    0
            @condition_container.text ''
            conditions.forEach (condition) =>
                @condition_container.append conditionToHTML(condition)

        cb @total_points

    onSquadLoadRequested: (squad) =>
        console.log(squad.additional_data.obstacles)
        @current_squad = squad
        @backend_delete_list_button.removeClass 'disabled'
        @squad_name_input.val @current_squad.name
        @squad_name_placeholder.text @current_squad.name
        @current_obstacles = @current_squad.additional_data.obstacles
        @updateObstacleSelect(@current_squad.additional_data.obstacles)
        @loadFromSerialized squad.serialized
        @notes.val(squad.additional_data.notes ? '')
        @backend_status.fadeOut 'slow'
        @current_squad.dirty = false
        @container.trigger 'xwing-backend:squadDirtinessChanged'

    onSquadDirtinessChanged: () =>
        @backend_save_list_button.toggleClass 'disabled', not (@current_squad.dirty and @total_points > 0)
        @backend_save_list_as_button.toggleClass 'disabled', @total_points == 0
        @backend_delete_list_button.toggleClass 'disabled', not @current_squad.id?

    onSquadNameChanged: () =>
        if @current_squad.name.length > SQUAD_DISPLAY_NAME_MAX_LENGTH
            short_name = "#{@current_squad.name.substr(0, SQUAD_DISPLAY_NAME_MAX_LENGTH)}&hellip;"
        else
            short_name = @current_squad.name
        @squad_name_placeholder.text ''
        @squad_name_placeholder.append short_name
        @squad_name_input.val @current_squad.name

    removeAllShips: ->
        while @ships.length > 0
            @removeShip @ships[0]
        throw new Error("Ships not emptied") if @ships.length > 0

    showTextListModal: ->
        # Display modal
        @list_modal.modal 'show'

    showChooseObstaclesModal: ->
        @obstacles_select.val(@current_squad.additional_data.obstacles)
        @choose_obstacles_modal.modal 'show'

    showChooseObstaclesSelectImage: (obstacle) ->
        @image_name = 'images/' + obstacle + '.png'
        @obstacles_select_image.find('.obstacle-image').attr 'src', @image_name
        @obstacles_select_image.show()

    updateObstacleSelect: (obstacles) ->
        @current_obstacles = obstacles
        @obstacles_select.val(obstacles)

    serialize: ->
        #( "#{ship.pilot.id}:#{ship.upgrades[i].data?.id ? -1 for slot, i in ship.pilot.slots}:#{ship.title?.data?.id ? -1}:#{upgrade.data?.id ? -1 for upgrade in ship.title?.conferredUpgrades ? []}:#{ship.modification?.data?.id ? -1}" for ship in @ships when ship.pilot? ).join ';'

        serialization_version = 4
        game_type_abbrev = switch @game_type_selector.val()
            when 'standard'
                's'
            when 'custom'
                "c=#{$.trim @desired_points_input.val()}"
        """v#{serialization_version}!#{game_type_abbrev}!#{( ship.toSerialized() for ship in @ships when ship.pilot? ).join ';'}"""

    loadFromSerialized: (serialized) ->
        @suppress_automatic_new_ship = true
        # Clear all existing ships
        @removeAllShips()

        re = /^v(\d+)!(.*)/
        matches = re.exec serialized
        if matches?
            # versioned
            version = parseInt matches[1]
            switch version
                when 3, 4
                    # parse out game type
                    [ game_type_abbrev, serialized_ships ] = matches[2].split('!')
                    switch game_type_abbrev
                        when 's'
                            @game_type_selector.val 'standard'
                            @game_type_selector.change()
                        else
                            @game_type_selector.val 'custom'
                            @desired_points_input.val parseInt(game_type_abbrev.split('=')[1])
                            @desired_points_input.change()
                    for serialized_ship in serialized_ships.split(';')
                        unless serialized_ship == ''
                            new_ship = @addShip()
                            new_ship.fromSerialized version, serialized_ship
                when 2
                    for serialized_ship in matches[2].split(';')
                        unless serialized_ship == ''
                            new_ship = @addShip()
                            new_ship.fromSerialized version, serialized_ship
        else
            # v1 (unversioned)
            for serialized_ship in serialized.split(';')
                unless serialized == ''
                    new_ship = @addShip()
                    new_ship.fromSerialized 1, serialized_ship

        @suppress_automatic_new_ship = false
        # Finally, the unassigned ship
        @addShip()

    uniqueIndex: (unique, type) ->
        if type not of @uniques_in_use
            throw new Error("Invalid unique type '#{type}'")
        @uniques_in_use[type].indexOf unique

    claimUnique: (unique, type, cb) =>
        if @uniqueIndex(unique, type) < 0
            # Claim pilots with the same canonical name
            for other in (exportObj.pilotsByUniqueName[unique.canonical_name.getXWSBaseName()] or [])
                if unique != other
                    if @uniqueIndex(other, 'Pilot') < 0
                        # console.log "Also claiming unique pilot #{other.canonical_name} in use"
                        @uniques_in_use['Pilot'].push other
                    else
                        throw new Error("Unique #{type} '#{unique.name}' already claimed as pilot")

            # Claim other upgrades with the same canonical name
            for otherslot, bycanonical of exportObj.upgradesBySlotUniqueName
                for canonical, other of bycanonical
                    if canonical.getXWSBaseName() == unique.canonical_name.getXWSBaseName() and unique != other
                        if @uniqueIndex(other, 'Upgrade') < 0
                            # console.log "Also claiming unique #{other.canonical_name} (#{otherslot}) in use"
                            @uniques_in_use['Upgrade'].push other
                        # else
                        #     throw new Error("Unique #{type} '#{unique.name}' already claimed as #{otherslot}")

            @uniques_in_use[type].push unique
        else
            throw new Error("Unique #{type} '#{unique.name}' already claimed")
        cb()

    releaseUnique: (unique, type, cb) =>
        idx = @uniqueIndex(unique, type)
        if idx >= 0
            # Release all uniques with the same canonical name and base name
            for type, uniques of @uniques_in_use
                # Removing stuff in a loop sucks, so we'll construct a new list
                @uniques_in_use[type] = []
                for u in uniques
                    if u.canonical_name.getXWSBaseName() != unique.canonical_name.getXWSBaseName()
                        # Keep this one
                        @uniques_in_use[type].push u
                    # else
                    #     console.log "Releasing #{u.name} (#{type}) with canonical name #{unique.canonical_name}"
        else
            throw new Error("Unique #{type} '#{unique.name}' not in use")
        cb()

    addShip: ->
        new_ship = new Ship
            builder: this
            container: @ship_container
        @ships.push new_ship
        new_ship


    removeShip: (ship) ->
        await ship.destroy defer()
        await @container.trigger 'xwing:pointsUpdated', defer()
        @current_squad.dirty = true
        @container.trigger 'xwing-backend:squadDirtinessChanged'

    matcher: (item, term) ->
        item.toUpperCase().indexOf(term.toUpperCase()) >= 0

    isOurFaction: (faction) ->
        if faction instanceof Array
            for f in faction
                if getPrimaryFaction(f) == @faction
                    return true
            false
        else
            getPrimaryFaction(faction) == @faction

    getAvailableShipsMatching: (term='') ->
        ships = []
        for ship_name, ship_data of exportObj.ships
            if @isOurFaction(ship_data.factions) and @matcher(ship_data.name, term)
                if not ship_data.huge or (@isEpic or @isCustom)
                    ships.push
                        id: ship_data.name
                        text: ship_data.name
                        english_name: ship_data.english_name
                        canonical_name: ship_data.canonical_name
        ships.sort exportObj.sortHelper

        
        
    getAvailablePilotsForShipIncluding: (ship, include_pilot, term='') ->
        # Returns data formatted for Select2
        available_faction_pilots = (pilot for pilot_name, pilot of exportObj.pilotsByLocalizedName when (not ship? or pilot.ship == ship) and @isOurFaction(pilot.faction) and @matcher(pilot_name, term))

        eligible_faction_pilots = (pilot for pilot_name, pilot of available_faction_pilots when (not pilot.unique? or pilot not in @uniques_in_use['Pilot'] or pilot.canonical_name.getXWSBaseName() == include_pilot?.canonical_name.getXWSBaseName()))

        # Re-add selected pilot
        if include_pilot? and include_pilot.unique? and @matcher(include_pilot.name, term)
            eligible_faction_pilots.push include_pilot
        ({ id: pilot.id, text: "#{pilot.name} (#{pilot.points})", points: pilot.points, ship: pilot.ship, english_name: pilot.english_name, disabled: pilot not in eligible_faction_pilots } for pilot in available_faction_pilots).sort exportObj.sortHelper

    dfl_filter_func = ->
        true

    countUpgrades: (canonical_name) ->
        # returns number of upgrades with given canonical name equipped
        count = 0
        for ship in @ships
            for upgrade in ship.upgrades
                if upgrade?.data?.canonical_name == canonical_name
                    count++
        count

    getAvailableUpgradesIncluding: (slot, include_upgrade, ship, this_upgrade_obj, term='', filter_func=@dfl_filter_func) ->
        # Returns data formatted for Select2
        limited_upgrades_in_use = (upgrade.data for upgrade in ship.upgrades when upgrade?.data?.limited?)

        available_upgrades = (upgrade for upgrade_name, upgrade of exportObj.upgradesByLocalizedName when upgrade.slot == slot and @matcher(upgrade_name, term) and (not upgrade.ship? or upgrade.ship == ship.data.name) and (not upgrade.faction? or @isOurFaction(upgrade.faction)))
        
        if filter_func != @dfl_filter_func
            available_upgrades = (upgrade for upgrade in available_upgrades when filter_func(upgrade))

        # Special case #3

        eligible_upgrades = (upgrade for upgrade_name, upgrade of available_upgrades when (not upgrade.unique? or upgrade not in @uniques_in_use['Upgrade']) and (not (ship? and upgrade.restriction_func?) or upgrade.restriction_func(ship, this_upgrade_obj)) and upgrade not in limited_upgrades_in_use and ((not upgrade.max_per_squad?) or ship.builder.countUpgrades(upgrade.canonical_name) < upgrade.max_per_squad))

        # Special case #2 :(
        # current_upgrade_forcibly_removed = false
        #for title in ship?.titles ? []
        #    if title?.data?.special_case == 'A-Wing Test Pilot'
        #        for equipped_upgrade in (upgrade.data for upgrade in ship.upgrades when upgrade?.data?)
        #            eligible_upgrades.removeItem equipped_upgrade
                    # current_upgrade_forcibly_removed = true if equipped_upgrade == include_upgrade

        for equipped_upgrade in (upgrade.data for upgrade in ship.upgrades when upgrade?.data?)
            eligible_upgrades.removeItem equipped_upgrade

        # Re-enable selected upgrade
        if include_upgrade? and (((include_upgrade.unique? or include_upgrade.limited? or include_upgrade.max_per_squad?) and @matcher(include_upgrade.name, term)))# or current_upgrade_forcibly_removed)
            # available_upgrades.push include_upgrade
            eligible_upgrades.push include_upgrade

        retval = ({ id: upgrade.id, text: "#{upgrade.name} (#{upgrade.points})", points: upgrade.points, english_name: upgrade.english_name, disabled: upgrade not in eligible_upgrades } for upgrade in available_upgrades).sort exportObj.sortHelper
        
        # Possibly adjust the upgrade
        if this_upgrade_obj.adjustment_func?
            (this_upgrade_obj.adjustment_func(upgrade) for upgrade in retval)
        else
            retval

    getAvailableModificationsIncluding: (include_modification, ship, term='', filter_func=@dfl_filter_func) ->
        # Returns data formatted for Select2
        limited_modifications_in_use = (modification.data for modification in ship.modifications when modification?.data?.limited?)

        available_modifications = (modification for modification_name, modification of exportObj.modificationsByLocalizedName when @matcher(modification_name, term) and (not modification.ship? or modification.ship == ship.data.name))

        if filter_func != @dfl_filter_func
            available_modifications = (modification for modification in available_modifications when filter_func(modification))

        if ship? and exportObj.hugeOnly(ship) > 0
            # Only show allowed mods for Epic ships
            available_modifications = (modification for modification in available_modifications when modification.ship? or not modification.restriction_func? or modification.restriction_func ship)

        eligible_modifications = (modification for modification_name, modification of available_modifications when (not modification.unique? or modification not in @uniques_in_use['Modification']) and (not modification.faction? or @isOurFaction(modification.faction)) and (not (ship? and modification.restriction_func?) or modification.restriction_func ship) and modification not in limited_modifications_in_use)

        # I finally had to add a special case :(  If something else demands it
        # then I will try to make this more systematic, but I haven't come up
        # with a good solution... yet.
        # current_mod_forcibly_removed = false
        for thing in (ship?.titles ? []).concat(ship?.upgrades ? [])
            if thing?.data?.special_case == 'Royal Guard TIE'
                # Need to refetch by ID because Vaksai may have modified its cost
                for equipped_modification in (modificationsById[modification.data.id] for modification in ship.modifications when modification?.data?)
                    eligible_modifications.removeItem equipped_modification
                    # current_mod_forcibly_removed = true if equipped_modification == include_modification

        # Re-add selected modification
        if include_modification? and (((include_modification.unique? or include_modification.limited?) and @matcher(include_modification.name, term)))# or current_mod_forcibly_removed)
            eligible_modifications.push include_modification
        ({ id: modification.id, text: "#{modification.name} (#{modification.points})", points: modification.points, english_name: modification.english_name, disabled: modification not in eligible_modifications } for modification in available_modifications).sort exportObj.sortHelper

    getAvailableTitlesIncluding: (ship, include_title, term='') ->
        # Returns data formatted for Select2
        # Titles are no longer unique!
        limited_titles_in_use = (title.data for title in ship.titles when title?.data?.limited?)
        available_titles = (title for title_name, title of exportObj.titlesByLocalizedName when (not title.ship? or title.ship == ship.data.name) and @matcher(title_name, term))

        eligible_titles = (title for title_name, title of available_titles when (not title.unique? or (title not in @uniques_in_use['Title'] and title.canonical_name.getXWSBaseName() not in (t.canonical_name.getXWSBaseName() for t in @uniques_in_use['Title'])) or title.canonical_name.getXWSBaseName() == include_title?.canonical_name.getXWSBaseName()) and (not title.faction? or @isOurFaction(title.faction)) and (not (ship? and title.restriction_func?) or title.restriction_func ship) and title not in limited_titles_in_use)

        # Re-add selected title
        if include_title? and (((include_title.unique? or include_title.limited?) and @matcher(include_title.name, term)))
            eligible_titles.push include_title
        ({ id: title.id, text: "#{title.name} (#{title.points})", points: title.points, english_name: title.english_name, disabled: title not in eligible_titles } for title in available_titles).sort exportObj.sortHelper

    # Converts a maneuver table for into an HTML table.
    getManeuverTableHTML: (maneuvers, baseManeuvers) ->
        if not maneuvers? or maneuvers.length == 0
            return "Missing maneuver info."

        # Preprocess maneuvers to see which bearings are never used so we
        # don't render them.
        bearings_without_maneuvers = [0...maneuvers[0].length]
        for bearings in maneuvers
            for difficulty, bearing in bearings
                if difficulty > 0
                    bearings_without_maneuvers.removeItem bearing
        # console.log "bearings without maneuvers:"
        # console.dir bearings_without_maneuvers

        outTable = "<table><tbody>"

        for speed in [maneuvers.length - 1 .. 0]

            haveManeuver = false
            for v in maneuvers[speed]
                if v > 0
                    haveManeuver = true
                    break

            continue if not haveManeuver

            outTable += "<tr><td>#{speed}</td>"
            for turn in [0 ... maneuvers[speed].length]
                continue if turn in bearings_without_maneuvers

                outTable += "<td>"
                if maneuvers[speed][turn] > 0

                    color = switch maneuvers[speed][turn]
                        when 1 then "white"
                        when 2 then "dodgerblue"
                        when 3 then "red"

                    outTable += """<svg xmlns="http://www.w3.org/2000/svg" width="30px" height="30px" viewBox="0 0 200 200">"""

                    if speed == 0
                        outTable += """<rect x="50" y="50" width="100" height="100" style="fill:#{color}" />"""
                    else

                        outlineColor = "black"
                        if maneuvers[speed][turn] != baseManeuvers[speed][turn]
                            outlineColor = "mediumblue" # highlight manuevers modified by another card (e.g. R2 Astromech makes all 1 & 2 speed maneuvers green)

                        transform = ""
                        className = ""
                        switch turn
                            when 0
                                # turn left
                                linePath = "M160,180 L160,70 80,70"
                                trianglePath = "M80,100 V40 L30,70 Z"
                            when 1
                                # bank left
                                linePath = "M150,180 S150,120 80,60"
                                trianglePath = "M80,100 V40 L30,70 Z"
                                transform = "transform='translate(-5 -15) rotate(45 70 90)' "
                            when 2
                                # straight
                                linePath = "M100,180 L100,100 100,80"
                                trianglePath = "M70,80 H130 L100,30 Z"
                            when 3
                                # bank right
                                linePath = "M50,180 S50,120 120,60"
                                trianglePath = "M120,100 V40 L170,70 Z"
                                transform = "transform='translate(5 -15) rotate(-45 130 90)' "
                            when 4
                                # turn right
                                linePath = "M40,180 L40,70 120,70"
                                trianglePath = "M120,100 V40 L170,70 Z"
                            when 5
                                # k-turn/u-turn
                                linePath = "M50,180 L50,100 C50,10 140,10 140,100 L140,120"
                                trianglePath = "M170,120 H110 L140,180 Z"
                            when 6
                                # segnor's loop left
                                linePath = "M150,180 S150,120 80,60"
                                trianglePath = "M80,100 V40 L30,70 Z"
                                transform = "transform='translate(0 50)'"
                            when 7
                                # segnor's loop right
                                linePath = "M50,180 S50,120 120,60"
                                trianglePath = "M120,100 V40 L170,70 Z"
                                transform = "transform='translate(0 50)'"
                            when 8
                                # tallon roll left
                                linePath = "M160,180 L160,70 80,70"
                                trianglePath = "M60,100 H100 L80,140 Z"
                            when 9
                                # tallon roll right
                                linePath = "M40,180 L40,70 120,70"
                                trianglePath = "M100,100 H140 L120,140 Z"
                            when 10
                                # backward left
                                linePath = "M50,180 S50,120 120,60"
                                trianglePath = "M120,100 V40 L170,70 Z"
                                transform = "transform='translate(5 -15) rotate(-45 130 90)' "
                                className = 'backwards'
                            when 11
                                # backward straight
                                linePath = "M100,180 L100,100 100,80"
                                trianglePath = "M70,80 H130 L100,30 Z"
                                className = 'backwards'
                            when 12
                                # backward right
                                linePath = "M150,180 S150,120 80,60"
                                trianglePath = "M80,100 V40 L30,70 Z"
                                transform = "transform='translate(-5 -15) rotate(45 70 90)' "
                                className = 'backwards'

                        outTable += $.trim """
                          <g class="maneuver #{className}">
                            <path d='#{trianglePath}' fill='#{color}' stroke-width='5' stroke='#{outlineColor}' #{transform}/>
                            <path stroke-width='25' fill='none' stroke='#{outlineColor}' d='#{linePath}' />
                            <path stroke-width='15' fill='none' stroke='#{color}' d='#{linePath}' />
                          </g>
                        """

                    outTable += "</svg>"
                outTable += "</td>"
            outTable += "</tr>"
        outTable += "</tbody></table>"
        outTable

    showTooltip: (type, data, additional_opts) ->
        if data != @tooltip_currently_displaying
            switch type
                when 'Ship'
                    @info_container.find('.info-sources').text (exportObj.translate(@language, 'sources', source) for source in data.pilot.sources).sort().join(', ')
                    if @collection?.counts?
                        ship_count = @collection.counts?.ship?[data.data.english_name] ? 0
                        pilot_count = @collection.counts?.pilot?[data.pilot.english_name] ? 0
                        @info_container.find('.info-collection').text """You have #{ship_count} ship model#{if ship_count > 1 then 's' else ''} and #{pilot_count} pilot card#{if pilot_count > 1 then 's' else ''} in your collection."""
                    else
                        @info_container.find('.info-collection').text ''
                    effective_stats = data.effectiveStats()
                    extra_actions = $.grep effective_stats.actions, (el, i) ->
                        el not in (data.pilot.ship_override?.actions ? data.data.actions)
                    extra_actions_red = $.grep effective_stats.actionsred, (el, i) ->
                        el not in (data.pilot.ship_override?.actionsred ? data.data.actionsred)
                    @info_container.find('.info-name').html """#{if data.pilot.unique then "&middot;&nbsp;" else ""}#{data.pilot.name}#{if data.pilot.epic? then " (#{exportObj.translate(@language, 'ui', 'epic')})" else ""}#{if exportObj.isReleased(data.pilot) then "" else " (#{exportObj.translate(@language, 'ui', 'unreleased')})"}"""
                    @info_container.find('p.info-text').html data.pilot.text ? ''
                    @info_container.find('tr.info-ship td.info-data').text data.pilot.ship
                    @info_container.find('tr.info-ship').show()
                    @info_container.find('tr.info-skill td.info-data').text statAndEffectiveStat(data.pilot.skill, effective_stats, 'skill')
                    @info_container.find('tr.info-skill').show()

#                    for cls in @info_container.find('tr.info-attack td.info-header i.xwing-miniatures-font')[0].classList
#                        @info_container.find('tr.info-attack td.info-header i.xwing-miniatures-font').removeClass(cls) if cls.startsWith('xwing-miniatures-font-attack')
                    @info_container.find('tr.info-attack td.info-header i.xwing-miniatures-font').addClass(data.data.attack_icon ? 'xwing-miniatures-font-attack')

                    @info_container.find('tr.info-attack td.info-data').text statAndEffectiveStat((data.pilot.ship_override?.attack ? data.data.attack), effective_stats, 'attack')
                    @info_container.find('tr.info-attack').toggle(data.pilot.ship_override?.attack? or data.data.attack?)
                    
                    @info_container.find('tr.info-attack-fullfront td.info-data').text statAndEffectiveStat((data.pilot.ship_override?.attackf ? data.data.attackf), effective_stats, 'attackf')
                    @info_container.find('tr.info-attack-fullfront').toggle(data.pilot.ship_override?.attackf? or data.data.attackf?)

                    @info_container.find('tr.info-attack-bullseye').hide()
                    
                    @info_container.find('tr.info-attack-back td.info-data').text statAndEffectiveStat((data.pilot.ship_override?.attackb ? data.data.attackb), effective_stats, 'attackb')
                    @info_container.find('tr.info-attack-back').toggle(data.pilot.ship_override?.attackb? or data.data.attackb?)

                    @info_container.find('tr.info-attack-turret td.info-data').text statAndEffectiveStat((data.pilot.ship_override?.attackt ? data.data.attackt), effective_stats, 'attackt')
                    @info_container.find('tr.info-attack-turret').toggle(data.pilot.ship_override?.attackt? or data.data.attackt?)

                    @info_container.find('tr.info-attack-doubleturret td.info-data').text statAndEffectiveStat((data.pilot.ship_override?.attackdt ? data.data.attackdt), effective_stats, 'attackdt')
                    @info_container.find('tr.info-attack-doubleturret').toggle(data.pilot.ship_override?.attackdt? or data.data.attackdt?)
                                        
                    @info_container.find('tr.info-energy td.info-data').text statAndEffectiveStat((data.pilot.ship_override?.energy ? data.data.energy), effective_stats, 'energy')
                    @info_container.find('tr.info-energy').toggle(data.pilot.ship_override?.energy? or data.data.energy?)
                    @info_container.find('tr.info-range').hide()
                    @info_container.find('tr.info-agility td.info-data').text statAndEffectiveStat((data.pilot.ship_override?.agility ? data.data.agility), effective_stats, 'agility')
                    @info_container.find('tr.info-agility').show()
                    @info_container.find('tr.info-hull td.info-data').text statAndEffectiveStat((data.pilot.ship_override?.hull ? data.data.hull), effective_stats, 'hull')
                    @info_container.find('tr.info-hull').show()
                    @info_container.find('tr.info-shields td.info-data').text statAndEffectiveStat((data.pilot.ship_override?.shields ? data.data.shields), effective_stats, 'shields')
                    @info_container.find('tr.info-shields').show()

                    @info_container.find('tr.info-force td.info-data').html (statAndEffectiveStat((data.pilot.ship_override?.force ? data.pilot.force), effective_stats, 'force') + '<i class="xwing-miniatures-font xwing-miniatures-font-recurring"></i>')
                    if data.pilot.ship_override?.force? or data.pilot.force?
                        @info_container.find('tr.info-force').show()
                    else
                        @info_container.find('tr.info-force').hide()

                    if data.pilot.charge?
                        if data.pilot.recurring?
                            @info_container.find('tr.info-charge td.info-data').html (data.pilot.charge + '<i class="xwing-miniatures-font xwing-miniatures-font-recurring"></i>')
                        else
                            @info_container.find('tr.info-charge td.info-data').text data.pilot.charge
                        @info_container.find('tr.info-charge').show()
                    else
                        @info_container.find('tr.info-charge').hide()

                    @info_container.find('tr.info-actions td.info-data').html (exportObj.translate(@language, 'action', a) for a in (data.pilot.ship_override?.actions ? data.data.actions).concat( ("<strong>#{exportObj.translate @language, 'action', action}</strong>" for action in extra_actions))).join ' '
                    
                    if data.data.actionsred?
                        @info_container.find('tr.info-actions-red td.info-data-red').html (exportObj.translate(@language, 'action', a) for a in (data.pilot.ship_override?.actionsred ? data.data.actionsred).concat( ("<strong>#{exportObj.translate @language, 'action', action}</strong>" for action in extra_actions_red))).join ' '       
                    @info_container.find('tr.info-actions-red').toggle(data.data.actionsred?)
                    
                    @info_container.find('tr.info-actions').show()
                    @info_container.find('tr.info-upgrades').show()
                    @info_container.find('tr.info-upgrades td.info-data').text((exportObj.translate(@language, 'slot', slot) for slot in data.pilot.slots).join(', ') or 'None')
                    @info_container.find('p.info-maneuvers').show()
                    @info_container.find('p.info-maneuvers').html(@getManeuverTableHTML(effective_stats.maneuvers, data.data.maneuvers))
                when 'Pilot'
                    @info_container.find('.info-sources').text (exportObj.translate(@language, 'sources', source) for source in data.sources).sort().join(', ')
                    if @collection?.counts?
                        pilot_count = @collection.counts?.pilot?[data.english_name] ? 0
                        ship_count = @collection.counts.ship?[additional_opts.ship] ? 0
                        @info_container.find('.info-collection').text """You have #{ship_count} ship model#{if ship_count > 1 then 's' else ''} and #{pilot_count} pilot card#{if pilot_count > 1 then 's' else ''} in your collection."""
                    else
                        @info_container.find('.info-collection').text ''
                    @info_container.find('.info-name').html """#{if data.unique then "&middot;&nbsp;" else ""}#{data.name}#{if data.epic? then " (#{exportObj.translate(@language, 'ui', 'epic')})" else ""}#{if exportObj.isReleased(data) then "" else " (#{exportObj.translate(@language, 'ui', 'unreleased')})"}"""
                    @info_container.find('p.info-text').html data.text ? ''
                    ship = exportObj.ships[data.ship]
                    @info_container.find('tr.info-ship td.info-data').text data.ship
                    @info_container.find('tr.info-ship').show()
                    @info_container.find('tr.info-skill td.info-data').text data.skill
                    @info_container.find('tr.info-skill').show()
                    
                    @info_container.find('tr.info-attack td.info-data').text(data.ship_override?.attack ? ship.attack)
                    @info_container.find('tr.info-attack').toggle(data.ship_override?.attack? or ship.attack?)

                    @info_container.find('tr.info-attack-fullfront td.info-data').text(ship.attackf)
                    @info_container.find('tr.info-attack-fullfront').toggle(ship.attackf?)
                    
                    @info_container.find('tr.info-attack-bullseye').hide()
                    
                    @info_container.find('tr.info-attack-back td.info-data').text(ship.attackb)
                    @info_container.find('tr.info-attack-back').toggle(ship.attackb?)
                    @info_container.find('tr.info-attack-turret td.info-data').text(ship.attackt)
                    @info_container.find('tr.info-attack-turret').toggle(ship.attackt?)
                    @info_container.find('tr.info-attack-doubleturret td.info-data').text(ship.attackdt)
                    @info_container.find('tr.info-attack-doubleturret').toggle(ship.attackdt?)
                    
#                    for cls in @info_container.find('tr.info-attack td.info-header i.xwing-miniatures-font')[0].classList
#                        @info_container.find('tr.info-attack td.info-header i.xwing-miniatures-font').removeClass(cls) if cls.startsWith('xwing-miniatures-font-frontarc')
                    @info_container.find('tr.info-attack td.info-header i.xwing-miniatures-font').addClass(ship.attack_icon ? 'xwing-miniatures-font-frontarc')

                    @info_container.find('tr.info-energy td.info-data').text(data.ship_override?.energy ? ship.energy)
                    @info_container.find('tr.info-energy').toggle(data.ship_override?.energy? or ship.energy?)
                    @info_container.find('tr.info-range').hide()
                    @info_container.find('tr.info-agility td.info-data').text(data.ship_override?.agility ? ship.agility)
                    @info_container.find('tr.info-agility').show()
                    @info_container.find('tr.info-hull td.info-data').text(data.ship_override?.hull ? ship.hull)
                    @info_container.find('tr.info-hull').show()
                    @info_container.find('tr.info-shields td.info-data').text(data.ship_override?.shields ? ship.shields)
                    @info_container.find('tr.info-shields').show()

                    if data.ship_override?.force or data.force?
                        @info_container.find('tr.info-force td.info-data').html ((data.ship_override?.force ? data.force)+ '<i class="xwing-miniatures-font xwing-miniatures-font-recurring"></i>')
                        @info_container.find('tr.info-force').show()
                    else
                        @info_container.find('tr.info-force').hide()

                    if data.charge?
                        if data.recurring?
                            @info_container.find('tr.info-charge td.info-data').html (data.charge + '<i class="xwing-miniatures-font xwing-miniatures-font-recurring"></i>')
                        else
                            @info_container.find('tr.info-charge td.info-data').text data.charge
                        @info_container.find('tr.info-charge').show()
                    else
                        @info_container.find('tr.info-charge').hide()

                    @info_container.find('tr.info-actions td.info-data').html (exportObj.translate(@language, 'action', action) for action in (data.ship_override?.actions ? exportObj.ships[data.ship].actions)).join(' ')
    
                    if ships[data.ship].actionsred?
                        @info_container.find('tr.info-actions-red td.info-data-red').html (exportObj.translate(@language, 'action', action) for action in (data.ship_override?.actionsred ? exportObj.ships[data.ship].actionsred)).join(' ')
                        @info_container.find('tr.info-actions-red').show()
                    else
                        @info_container.find('tr.info-actions-red').hide()

                    @info_container.find('tr.info-actions').show()
                    @info_container.find('tr.info-upgrades').show()
                    @info_container.find('tr.info-upgrades td.info-data').text((exportObj.translate(@language, 'slot', slot) for slot in data.slots).join(', ') or 'None')
                    @info_container.find('p.info-maneuvers').show()
                    @info_container.find('p.info-maneuvers').html(@getManeuverTableHTML(ship.maneuvers, ship.maneuvers))
                when 'Addon'
                    @info_container.find('.info-sources').text (exportObj.translate(@language, 'sources', source) for source in data.sources).sort().join(', ')
                    if @collection?.counts?
                        addon_count = @collection.counts?[additional_opts.addon_type.toLowerCase()]?[data.english_name] ? 0
                        @info_container.find('.info-collection').text """You have #{addon_count} in your collection."""
                    else
                        @info_container.find('.info-collection').text ''
                    @info_container.find('.info-name').html """#{if data.unique then "&middot;&nbsp;" else ""}#{data.name}#{if data.limited? then " (#{exportObj.translate(@language, 'ui', 'limited')})" else ""}#{if data.epic? then " (#{exportObj.translate(@language, 'ui', 'epic')})" else ""}#{if exportObj.isReleased(data) then  "" else " (#{exportObj.translate(@language, 'ui', 'unreleased')})"}"""
                    @info_container.find('p.info-text').html data.text ? ''
                    @info_container.find('tr.info-ship').hide()
                    @info_container.find('tr.info-skill').hide()
                    if data.energy?
                        @info_container.find('tr.info-energy td.info-data').text data.energy
                        @info_container.find('tr.info-energy').show()
                    else
                        @info_container.find('tr.info-energy').hide()
                    if data.attack?
                        # Attack icons on upgrade cards don't get special icons
                    #    for cls in @info_container.find('tr.info-attack td.info-header i.xwing-miniatures-font')[0].classList
                    #        @info_container.find('tr.info-attack td.info-header i.xwing-miniatures-font').removeClass(cls) if cls.startsWith('xwing-miniatures-font-frontarc')
                    #    @info_container.find('tr.info-attack td.info-header i.xwing-miniatures-font').addClass('xwing-miniatures-font-frontarc')
                        @info_container.find('tr.info-attack td.info-data').text data.attack
                        @info_container.find('tr.info-attack').show()
                    else
                        @info_container.find('tr.info-attack').hide()

                    if data.attackt?
                        @info_container.find('tr.info-attack-turret td.info-data').text data.attackt
                        @info_container.find('tr.info-attack-turret').show()
                    else
                        @info_container.find('tr.info-attack-turret').hide()

                    if data.attackbull?
                        @info_container.find('tr.info-attack-bullseye td.info-data').text data.attackbull
                        @info_container.find('tr.info-attack-bullseye').show()
                    else
                        @info_container.find('tr.info-attack-bullseye').hide()

                    @info_container.find('tr.info-attack-fullfront').hide()
                    @info_container.find('tr.info-attack-back').hide()
                    @info_container.find('tr.info-attack-doubleturret').hide()

                    if data.recurring?
                        @info_container.find('tr.info-charge td.info-data').html (data.charge + """<i class="xwing-miniatures-font xwing-miniatures-font-recurring"></i>""")
                    else                
                        @info_container.find('tr.info-charge td.info-data').text data.charge
                    @info_container.find('tr.info-charge').toggle(data.charge?)                        
                    
                    if data.range?
                        @info_container.find('tr.info-range td.info-data').text data.range
                        @info_container.find('tr.info-range').show()
                    else
                        @info_container.find('tr.info-range').hide()
                    
                    @info_container.find('tr.info-force td.info-data').html (data.force + '<i class="xwing-miniatures-font xwing-miniatures-font-recurring"></i>')
                    @info_container.find('tr.info-force').toggle(data.force?)                        

                    @info_container.find('tr.info-agility').hide()
                    @info_container.find('tr.info-hull').hide()
                    @info_container.find('tr.info-shields').hide()
                    @info_container.find('tr.info-actions').hide()
                    @info_container.find('tr.info-actions-red').hide()
                    @info_container.find('tr.info-upgrades').hide()
                    @info_container.find('p.info-maneuvers').hide()
            @info_container.show()
            @tooltip_currently_displaying = data
        
    _randomizerLoopBody: (data) =>
        if data.keep_running and data.iterations < data.max_iterations
            data.iterations++
            #console.log "Current points: #{@total_points} of #{data.max_points}, iteration=#{data.iterations} of #{data.max_iterations}, keep_running=#{data.keep_running}"
            if @total_points == data.max_points
                # Exact hit!
                #console.log "Points reached exactly"
                data.keep_running = false
            else if @total_points < data.max_points
                #console.log "Need to add something"
                # Add something
                # Possible options: ship or empty addon slot
                unused_addons = []
                for ship in @ships
                    for upgrade in ship.upgrades
                        unused_addons.push upgrade unless upgrade.data?
                    unused_addons.push ship.title if ship.title? and not ship.title.data?
                    for modification in ship.modifications
                        unused_addons.push modification unless modification.data?
                # 0 is ship, otherwise addon
                idx = $.randomInt(1 + unused_addons.length)
                if idx == 0
                    # Add random ship
                    #console.log "Add ship"
                    available_ships = @getAvailableShipsMatching()
                    ship_type = available_ships[$.randomInt available_ships.length].text
                    available_pilots = @getAvailablePilotsForShipIncluding(ship_type)
                    pilot = available_pilots[$.randomInt available_pilots.length]
                    if exportObj.pilotsById[pilot.id].sources.intersects(data.allowed_sources)
                        new_ship = @addShip()
                        new_ship.setPilotById pilot.id
                else
                    # Add upgrade/title/modification
                    #console.log "Add addon"
                    addon = unused_addons[idx - 1]
                    switch addon.type
                        when 'Upgrade'
                            available_upgrades = (upgrade for upgrade in @getAvailableUpgradesIncluding(addon.slot, null, addon.ship) when exportObj.upgradesById[upgrade.id].sources.intersects(data.allowed_sources))
                            addon.setById available_upgrades[$.randomInt available_upgrades.length].id if available_upgrades.length > 0
                        when 'Title'
                            available_titles = (title for title in @getAvailableTitlesIncluding(addon.ship) when exportObj.titlesById[title.id].sources.intersects(data.allowed_sources))
                            addon.setById available_titles[$.randomInt available_titles.length].id if available_titles.length > 0
                        when 'Modification'
                            available_modifications = (modification for modification in @getAvailableModificationsIncluding(null, addon.ship) when exportObj.modificationsById[modification.id].sources.intersects(data.allowed_sources))
                            addon.setById available_modifications[$.randomInt available_modifications.length].id if available_modifications.length > 0
                        else
                            throw new Error("Invalid addon type #{addon.type}")

            else
                #console.log "Need to remove something"
                # Remove something
                removable_things = []
                for ship in @ships
                    removable_things.push ship
                    for upgrade in ship.upgrades
                        removable_things.push upgrade if upgrade.data?
                    removable_things.push ship.title if ship.title?.data?
                    removable_things.push ship.modification if ship.modification?.data?
                if removable_things.length > 0
                    thing_to_remove = removable_things[$.randomInt removable_things.length]
                    #console.log "Removing #{thing_to_remove}"
                    if thing_to_remove instanceof Ship
                        @removeShip thing_to_remove
                    else if thing_to_remove instanceof GenericAddon
                        thing_to_remove.setData null
                    else
                        throw new Error("Unknown thing to remove #{thing_to_remove}")
            # continue the "loop"
            window.setTimeout @_makeRandomizerLoopFunc(data), 0
        else
            #console.log "Clearing timer #{data.timer}, iterations=#{data.iterations}, keep_running=#{data.keep_running}"
            window.clearTimeout data.timer
            # Update all selectors
            for ship in @ships
                ship.updateSelections()
            @suppress_automatic_new_ship = false
            @addShip()

    _makeRandomizerLoopFunc: (data) =>
        () =>
            @_randomizerLoopBody(data)

    randomSquad: (max_points=100, allowed_sources=null, timeout_ms=1000, max_iterations=1000) ->
        @backend_status.fadeOut 'slow'
        @suppress_automatic_new_ship = true
        # Clear all existing ships
        while @ships.length > 0
            @removeShip @ships[0]
        throw new Error("Ships not emptied") if @ships.length > 0
        data =
            iterations: 0
            max_points: max_points
            max_iterations: max_iterations
            keep_running: true
            allowed_sources: allowed_sources ? exportObj.expansions
        stopHandler = () =>
            #console.log "*** TIMEOUT *** TIMEOUT *** TIMEOUT ***"
            data.keep_running = false
        data.timer = window.setTimeout stopHandler , timeout_ms
        #console.log "Timer set for #{timeout_ms}ms, timer is #{data.timer}"
        window.setTimeout @_makeRandomizerLoopFunc(data), 0
        @resetCurrentSquad()
        @current_squad.name = 'Random Squad'
        @container.trigger 'xwing-backend:squadNameChanged'

    setBackend: (backend) ->
        @backend = backend

    describeSquad: ->
        (ship.pilot.name for ship in @ships when ship.pilot?).join ', '

    listCards: ->
        card_obj = {}
        for ship in @ships
            if ship.pilot?
                card_obj[ship.pilot.name] = null
                for upgrade in ship.upgrades
                    card_obj[upgrade.data.name] = null if upgrade.data?
                card_obj[ship.title.data.name] = null if ship.title?.data?
                card_obj[ship.modification.data.name] = null if ship.modification?.data?
        return Object.keys(card_obj).sort()

    getNotes: ->
        @notes.val()

    getObstacles: ->
        @current_obstacles

    isSquadPossibleWithCollection: ->
        # console.log "#{@faction}: isSquadPossibleWithCollection()"
        # If the collection is uninitialized or empty, don't actually check it.
        if Object.keys(@collection?.expansions ? {}).length == 0
            # console.log "collection not ready or is empty"
            return true
        @collection.reset()
        validity = true
        for ship in @ships
            if ship.pilot?
                # Try to get both the physical model and the pilot card.
                ship_is_available = @collection.use('ship', ship.pilot.english_ship)
                pilot_is_available = @collection.use('pilot', ship.pilot.english_name)
                # console.log "#{@faction}: Ship #{ship.pilot.english_ship} available: #{ship_is_available}"
                # console.log "#{@faction}: Pilot #{ship.pilot.english_name} available: #{pilot_is_available}"
                validity = false unless ship_is_available and pilot_is_available
                for upgrade in ship.upgrades
                    if upgrade.data?
                        upgrade_is_available = @collection.use('upgrade', upgrade.data.english_name)
                        # console.log "#{@faction}: Upgrade #{upgrade.data.english_name} available: #{upgrade_is_available}"
                        validity = false unless upgrade_is_available
                for modification in ship.modifications
                    if modification.data?
                        modification_is_available = @collection.use('modification', modification.data.english_name)
                        # console.log "#{@faction}: Modification #{modification.data.english_name} available: #{modification_is_available}"
                        validity = false unless modification_is_available
                for title in ship.titles
                    if title?.data?
                        title_is_available = @collection.use('title', title.data.english_name)
                        # console.log "#{@faction}: Title #{title.data.english_name} available: #{title_is_available}"
                        validity = false unless title_is_available
        validity

    checkCollection: ->
        # console.log "#{@faction}: Checking validity of squad against collection..."
        if @collection?
            @collection_invalid_container.toggleClass 'hidden', @isSquadPossibleWithCollection()

    toXWS: ->
        # Often you will want JSON.stringify(builder.toXWS())
        xws =
            description: @getNotes()
            faction: exportObj.toXWSFaction[@faction]
            name: @current_squad.name
            pilots: []
            points: @total_points
            vendor:
                yasb:
                    builder: '(Yet Another) X-Wing Miniatures Squad Builder'
                    builder_url: window.location.href.split('?')[0]
                    link: @getPermaLink()
            version: '0.3.0'

        for ship in @ships
            if ship.pilot?
                xws.pilots.push ship.toXWS()

        # Associate multisection ships
        # This maps id to list of pilots it comprises
        multisection_id_to_pilots = {}
        last_id = 0
        unmatched = (pilot for pilot in xws.pilots when pilot.multisection?)
        for _ in [0...(unmatched.length ** 2)]
            break if unmatched.length == 0
            # console.log "Top of loop, unmatched: #{m.name for m in unmatched}"
            unmatched_pilot = unmatched.shift()
            unmatched_pilot.multisection_id ?= last_id++
            multisection_id_to_pilots[unmatched_pilot.multisection_id] ?= [unmatched_pilot]
            break if unmatched.length == 0
            # console.log "Finding matches for #{unmatched_pilot.name} (assigned id=#{unmatched_pilot.multisection_id})"
            matches = []
            for candidate in unmatched
                # console.log "-> examine #{candidate.name}"
                if unmatched_pilot.name in candidate.multisection
                    matches.push candidate
                    unmatched_pilot.multisection.removeItem candidate.name
                    candidate.multisection.removeItem unmatched_pilot.name
                    candidate.multisection_id = unmatched_pilot.multisection_id
                    # console.log "-> MATCH FOUND #{candidate.name}, assigned id=#{candidate.multisection_id}"
                    multisection_id_to_pilots[candidate.multisection_id].push candidate
                    if unmatched_pilot.multisection.length == 0
                        # console.log "-> No more sections to match for #{unmatched_pilot.name}"
                        break
            for match in matches
                if match.multisection.length == 0
                    # console.log "Dequeue #{match.name} since it has no more sections to match"
                    unmatched.removeItem match

        for pilot in xws.pilots
            delete pilot.multisection if pilot.multisection?

        obstacles = @getObstacles()
        if obstacles? and obstacles.length > 0
            xws.obstacles = obstacles

        xws

    toMinimalXWS: ->
        # Just what's necessary
        xws = @toXWS()

        # Keep mandatory stuff only
        for own k, v of xws
            delete xws[k] unless k in ['faction', 'pilots', 'version']

        for own k, v of xws.pilots
            delete xws[k] unless k in ['name', 'ship', 'upgrades', 'multisection_id']

        xws

    loadFromXWS: (xws, cb) ->
        success = null
        error = null

        version_list = (parseInt x for x in xws.version.split('.'))

        switch
            # Not doing backward compatibility pre-1.x
            when version_list > [0, 1]
                xws_faction = exportObj.fromXWSFaction[xws.faction]

                if @faction != xws_faction
                        throw new Error("Attempted to load XWS for #{xws.faction} but builder is #{@faction}")

                if xws.name?
                    @current_squad.name = xws.name
                if xws.description?
                    @notes.val xws.description

                if xws.obstacles?
                    @current_squad.additional_data.obstacles = xws.obstacles

                @suppress_automatic_new_ship = true
                @removeAllShips()

                for pilot in xws.pilots
                    new_ship = @addShip()
                    for ship_name, ship_data of exportObj.ships
                        if @matcher(ship_data.xws, pilot.ship)
                            shipnameXWS =
                                id: ship_data.name
                                xws: ship_data.xws
                    console.log "#{pilot.xws}"
                    try
                        new_ship.setPilot (p for p in (exportObj.pilotsByFactionXWS[@faction][pilot.id] ?= exportObj.pilotsByFactionCanonicalName[@faction][pilot.id]) when p.ship == shipnameXWS.id)[0]
                    catch err
                        console.error err.message 
                        continue
                    # Turn all the upgrades into a flat list so we can keep trying to add them
                    addons = []
                    for upgrade_type, upgrade_canonicals of pilot.upgrades ? {}
                        for upgrade_canonical in upgrade_canonicals
                            # console.log upgrade_type, upgrade_canonical
                            slot = null
                            slot = exportObj.fromXWSUpgrade[upgrade_type] ? upgrade_type.capitalize()
                            addon = exportObj.upgradesBySlotXWSName[slot][upgrade_canonical] ?= exportObj.upgradesBySlotCanonicalName[slot][upgrade_canonical]
                            if addon?
                                # console.log "-> #{upgrade_type} #{addon.name} #{slot}"
                                addons.push
                                    type: slot
                                    data: addon
                                    slot: slot

                    if addons.length > 0
                        for _ in [0...1000]
                            # Try to add an addon.  If it's not eligible, requeue it and
                            # try it again later, as another addon might allow it.
                            addon = addons.shift()
                            # console.log "Adding #{addon.data.name} to #{new_ship}..."

                            addon_added = false
                            switch addon.type
                                when 'Modification'
                                    for modification in new_ship.modifications
                                        continue if modification.data?
                                        modification.setData addon.data
                                        addon_added = true
                                        break
                                when 'Title'
                                    for title in new_ship.titles
                                        continue if title.data?
                                        # Special cases :(
                                        if addon.data instanceof Array
                                            # Right now, the only time this happens is because of
                                            # Heavy Scyk.  Check the rest of the pending addons for torp,
                                            # cannon, or missiles.  Otherwise, it doesn't really matter.
                                            slot_guesses = (a.data.slot for a in addons when a.data.slot in ['Cannon', 'Missile', 'Torpedo'])
                                            # console.log slot_guesses
                                            if slot_guesses.length > 0
                                                # console.log "Guessing #{slot_guesses[0]}"
                                                title.setData exportObj.titlesByLocalizedName[""""Heavy Scyk" Interceptor (#{slot_guesses[0]})"""]
                                            else
                                                # console.log "No idea, setting to #{addon.data[0].name}"
                                                title.setData addon.data[0]
                                        else
                                            title.setData addon.data
                                        addon_added = true
                                else
                                    # console.log "Looking for unused #{addon.slot} in #{new_ship}..."
                                    for upgrade, i in new_ship.upgrades
                                        continue if upgrade.slot != addon.slot or upgrade.data?
                                        upgrade.setData addon.data
                                        addon_added = true
                                        break

                            if addon_added
                                # console.log "Successfully added #{addon.data.name} to #{new_ship}"
                                if addons.length == 0
                                    # console.log "Done with addons for #{new_ship}"
                                    break
                            else
                                # Can't add it, requeue unless there are no other addons to add
                                # in which case this isn't valid
                                if addons.length == 0
                                    success = false
                                    error = "Could not add #{addon.data.name} to #{new_ship}"
                                    break
                                else
                                    # console.log "Could not add #{addon.data.name} to #{new_ship}, trying later"
                                    addons.push addon

                        if addons.length > 0
                            success = false
                            error = "Could not add all upgrades"
                            break

                @suppress_automatic_new_ship = false
                # Finally, the unassigned ship
                @addShip()

                success = true
            else
                success = false
                error = "Invalid or unsupported XWS version"

        if success
            @current_squad.dirty = true
            @container.trigger 'xwing-backend:squadNameChanged'
            @container.trigger 'xwing-backend:squadDirtinessChanged'

        # console.log "success: #{success}, error: #{error}"

        cb
            success: success
            error: error

class Ship
    constructor: (args) ->
        # args
        @builder = args.builder
        @container = args.container

        # internal state
        @pilot = null
        @data = null # ship data
        @upgrades = []
        @modifications = []
        @titles = []

        @setupUI()

    destroy: (cb) ->
        @resetPilot()
        @resetAddons()
        @teardownUI()
        idx = @builder.ships.indexOf this
        if idx < 0
            throw new Error("Ship not registered with builder")
        @builder.ships.splice idx, 1
        cb()

    copyFrom: (other) ->
        throw new Error("Cannot copy from self") if other is this
        #console.log "Attempt to copy #{other?.pilot?.name}"
        return unless other.pilot? and other.data?
        #console.log "Setting pilot to ID=#{other.pilot.id}"
        if other.pilot.unique
            # Look for cheapest generic or available unique, otherwise do nothing
            available_pilots = (pilot_data for pilot_data in @builder.getAvailablePilotsForShipIncluding(other.data.name) when not pilot_data.disabled)
            if available_pilots.length > 0
                @setPilotById available_pilots[0].id
                # Can't just copy upgrades since slots may be different
                # Similar to setPilot() when ship is the same

                other_upgrades = {}
                for upgrade in other.upgrades
                    if upgrade?.data? and not upgrade.data.unique and ((not upgrade.data.max_per_squad?) or @builder.countUpgrades(upgrade.data.canonical_name) < upgrade.data.max_per_squad)
                        other_upgrades[upgrade.slot] ?= []
                        other_upgrades[upgrade.slot].push upgrade

                other_modifications = []
                for modification in other.modifications
                    if modification?.data? and not modification.data.unique
                        other_modifications.push modification

                other_titles = []
                for title in other.titles
                    if title?.data? and not title.data.unique
                        other_titles.push title

                for title in @titles
                    other_title = other_titles.shift()
                    if other_title?
                        title.setById other_title.data.id

                for modification in @modifications
                    other_modification = other_modifications.shift()
                    if other_modification?
                        modification.setById other_modification.data.id

                for upgrade in @upgrades
                    other_upgrade = (other_upgrades[upgrade.slot] ? []).shift()
                    if other_upgrade?
                        upgrade.setById other_upgrade.data.id
            else
                return
        else
            # Exact clone, so we can copy things over directly
            @setPilotById other.pilot.id

            # set up non-conferred addons
            other_conferred_addons = []
            other_conferred_addons = other_conferred_addons.concat(other.titles[0].conferredAddons) if other.titles[0]?.data? # and other.titles.conferredAddons.length > 0
            other_conferred_addons = other_conferred_addons.concat(other.modifications[0].conferredAddons) if other.modifications[0]?.data?
            #console.log "Looking for conferred upgrades..."
            for other_upgrade, i in other.upgrades
                # console.log "Examining upgrade #{other_upgrade}"
                if other_upgrade.data? and other_upgrade not in other_conferred_addons and not other_upgrade.data.unique and i < @upgrades.length and ((not other_upgrade.data.max_per_squad?) or @builder.countUpgrades(other_upgrade.data.canonical_name) < other_upgrade.data.max_per_squad)
                    #console.log "Copying non-unique upgrade #{other_upgrade} into slot #{i}"
                    @upgrades[i].setById other_upgrade.data.id
            #console.log "Checking other ship base title #{other.title ? null}"
            @titles[0].setById other.titles[0].data.id if other.titles[0]?.data? and not other.titles[0].data.unique
            #console.log "Checking other ship base modification #{other.modifications[0] ? null}"
            @modifications[0].setById other.modifications[0].data.id if other.modifications[0]?.data and not other.modifications[0].data.unique

            # set up conferred non-unique addons
            #console.log "Attempt to copy conferred addons..."
            if other.titles[0]? and other.titles[0].conferredAddons.length > 0
                #console.log "Other ship title #{other.titles[0]} confers addons"
                for other_conferred_addon, i in other.titles[0].conferredAddons
                    @titles[0].conferredAddons[i].setById other_conferred_addon.data.id if other_conferred_addon.data? and not other_conferred_addon.data?.unique
            if other.modifications[0]? and other.modifications[0].conferredAddons.length > 0
                #console.log "Other ship base modification #{other.modifications[0]} confers addons"
                for other_conferred_addon, i in other.modifications[0].conferredAddons
                    @modifications[0].conferredAddons[i].setById other_conferred_addon.data.id if other_conferred_addon.data? and not other_conferred_addon.data?.unique

        @updateSelections()
        @builder.container.trigger 'xwing:pointsUpdated'
        @builder.current_squad.dirty = true
        @builder.container.trigger 'xwing-backend:squadDirtinessChanged'

    setShipType: (ship_type) ->
        @pilot_selector.data('select2').container.show()
        if ship_type != @pilot?.ship
            # Ship changed; select first non-unique
            @setPilot (exportObj.pilotsById[result.id] for result in @builder.getAvailablePilotsForShipIncluding(ship_type) when not exportObj.pilotsById[result.id].unique)[0]

        # Clear ship background class
        for cls in @row.attr('class').split(/\s+/)
            if cls.indexOf('ship-') == 0
                @row.removeClass cls

        # Show delete button
        @remove_button.fadeIn 'fast'

        # Ship background
        @row.addClass "ship-#{ship_type.toLowerCase().replace(/[^a-z0-9]/gi, '')}0"

        @builder.container.trigger 'xwing:shipUpdated'

    setPilotById: (id) ->
        @setPilot exportObj.pilotsById[parseInt id]

    setPilotByName: (name) ->
        @setPilot exportObj.pilotsByLocalizedName[$.trim name]

    setPilot: (new_pilot) ->
        if new_pilot != @pilot
            @builder.current_squad.dirty = true
            same_ship = @pilot? and new_pilot?.ship == @pilot.ship
            old_upgrades = {}
            old_titles = []
            old_modifications = []
            if same_ship
                # track addons and try to reassign them
                for upgrade in @upgrades
                    if upgrade?.data?
                        old_upgrades[upgrade.slot] ?= []
                        old_upgrades[upgrade.slot].push upgrade
                for title in @titles
                    if title?.data?
                        old_titles.push title
                for modification in @modifications
                    if modification?.data?
                        old_modifications.push modification
            @resetPilot()
            @resetAddons()
            if new_pilot?
                @data = exportObj.ships[new_pilot?.ship]
                if new_pilot?.unique?
                    await @builder.container.trigger 'xwing:claimUnique', [ new_pilot, 'Pilot', defer() ]
                @pilot = new_pilot
                @setupAddons() if @pilot?
                @copy_button.show()
                @setShipType @pilot.ship
                if same_ship
                    # Hopefully this order is correct
                    for title in @titles
                        old_title = old_titles.shift()
                        if old_title?
                            title.setById old_title.data.id
                    for modification in @modifications
                        old_modification = old_modifications.shift()
                        if old_modification?
                            modification.setById old_modification.data.id
                    for upgrade in @upgrades
                        old_upgrade = (old_upgrades[upgrade.slot] ? []).shift()
                        if old_upgrade?
                            upgrade.setById old_upgrade.data.id
            else
                @copy_button.hide()
            @builder.container.trigger 'xwing:pointsUpdated'
            @builder.container.trigger 'xwing-backend:squadDirtinessChanged'

    resetPilot: ->
        if @pilot?.unique?
            await @builder.container.trigger 'xwing:releaseUnique', [ @pilot, 'Pilot', defer() ]
        @pilot = null

    setupAddons: ->
        # Upgrades from pilot
        for slot in @pilot.slots ? []
            @upgrades.push new exportObj.Upgrade
                ship: this
                container: @addon_container
                slot: slot
        # Title
        #if @pilot.ship of exportObj.titlesByShip
        #    @titles.push new exportObj.Title
        #        ship: this
        #        container: @addon_container
        # Modifications
        #@modifications.push new exportObj.Modification
        #    ship: this
        #    container: @addon_container

    resetAddons: ->
        await
            for title in @titles
                title.destroy defer() if title?
            for upgrade in @upgrades
                upgrade.destroy defer() if upgrade?
            for modification in @modifications
                modification.destroy defer() if modification?
        @upgrades = []
        @modifications = []
        @titles = []

    getPoints: ->
        points = @pilot?.points ? 0
        for title in @titles
            points += (title?.getPoints() ? 0)
        for upgrade in @upgrades
            points += upgrade.getPoints()
        for modification in @modifications
            points += (modification?.getPoints() ? 0)
        @points_container.find('span').text points
        if points > 0
            @points_container.fadeTo 'fast', 1
        else
            @points_container.fadeTo 0, 0
        points

    getEpicPoints: ->
        @data?.epic_points ? 0

    updateSelections: ->
        if @pilot?
            @ship_selector.select2 'data',
                id: @pilot.ship
                text: @pilot.ship
                canonical_name: exportObj.ships[@pilot.ship].canonical_name
            @pilot_selector.select2 'data',
                id: @pilot.id
                text: "#{@pilot.name} (#{@pilot.points})"
            @pilot_selector.data('select2').container.show()
            for upgrade in @upgrades
                upgrade.updateSelection()
            for title in @titles
                title.updateSelection() if title?
            for modification in @modifications
                modification.updateSelection() if modification?
        else
            @pilot_selector.select2 'data', null
            @pilot_selector.data('select2').container.toggle(@ship_selector.val() != '')

    setupUI: ->
        @row = $ document.createElement 'DIV'
        @row.addClass 'row-fluid ship'
        @row.insertBefore @builder.notes_container

        @row.append $.trim '''
            <div class="span3">
                <input class="ship-selector-container" type="hidden" />
                <br />
                <input type="hidden" class="pilot-selector-container" />
            </div>
            <div class="span1 points-display-container">
                <span></span>
            </div>
            <div class="span6 addon-container" />
            <div class="span2 button-container">
                <button class="btn btn-danger remove-pilot"><span class="visible-desktop visible-tablet hidden-phone" data-toggle="tooltip" title="Remove Pilot"><i class="fa fa-times"></i></span><span class="hidden-desktop hidden-tablet visible-phone">Remove Pilot</span></button>
                <button class="btn copy-pilot"><span class="visible-desktop visible-tablet hidden-phone" data-toggle="tooltip" title="Clone Pilot"><i class="fa fa-files-o"></i></span><span class="hidden-desktop hidden-tablet visible-phone">Clone Pilot</span></button>
            </div>
        '''
        @row.find('.button-container span').tooltip()

        @ship_selector = $ @row.find('input.ship-selector-container')
        @pilot_selector = $ @row.find('input.pilot-selector-container')

        shipResultFormatter = (object, container, query) ->
            # Append directly so we don't have to disable markup escaping
            $(container).append """<i class="xwing-miniatures-ship xwing-miniatures-ship-#{object.canonical_name}"></i> #{object.text}"""
            # If you return a string, Select2 will render it
            undefined

        @ship_selector.select2
            width: '100%'
            placeholder: exportObj.translate @builder.language, 'ui', 'shipSelectorPlaceholder'
            query: (query) =>
                @builder.checkCollection()
                query.callback
                    more: false
                    results: @builder.getAvailableShipsMatching(query.term)
            minimumResultsForSearch: if $.isMobile() then -1 else 0
            formatResultCssClass: (obj) =>
                if @builder.collection?
                    not_in_collection = false
                    if @pilot? and obj.id == exportObj.ships[@pilot.ship].id
                        # Currently selected ship; mark as not in collection if it's neither
                        # on the shelf nor on the table
                        unless (@builder.collection.checkShelf('ship', obj.english_name) or @builder.collection.checkTable('pilot', obj.english_name))
                            not_in_collection = true
                    else
                        # Not currently selected; check shelf only
                        not_in_collection = not @builder.collection.checkShelf('ship', obj.english_name)
                    if not_in_collection then 'select2-result-not-in-collection' else ''
                else
                    ''
            formatResult: shipResultFormatter
            formatSelection: shipResultFormatter

        @ship_selector.on 'change', (e) =>
            @setShipType @ship_selector.val()
        # assign ship row an id for testing purposes
        @row.attr 'id', "row-#{@ship_selector.data('select2').container.attr('id')}"

        @pilot_selector.select2
            width: '100%'
            placeholder: exportObj.translate @builder.language, 'ui', 'pilotSelectorPlaceholder'
            query: (query) =>
                @builder.checkCollection()
                query.callback
                    more: false
                    results: @builder.getAvailablePilotsForShipIncluding(@ship_selector.val(), @pilot, query.term)
            minimumResultsForSearch: if $.isMobile() then -1 else 0
            formatResultCssClass: (obj) =>
                if @builder.collection?
                    not_in_collection = false
                    if obj.id == @pilot?.id
                        # Currently selected pilot; mark as not in collection if it's neither
                        # on the shelf nor on the table
                        unless (@builder.collection.checkShelf('pilot', obj.english_name) or @builder.collection.checkTable('pilot', obj.english_name))
                            not_in_collection = true
                    else
                        # Not currently selected; check shelf only
                        not_in_collection = not @builder.collection.checkShelf('pilot', obj.english_name)
                    if not_in_collection then 'select2-result-not-in-collection' else ''
                else
                    ''

        @pilot_selector.on 'change', (e) =>
            @setPilotById @pilot_selector.select2('val')
            @builder.current_squad.dirty = true
            @builder.container.trigger 'xwing-backend:squadDirtinessChanged'
            @builder.backend_status.fadeOut 'slow'
        @pilot_selector.data('select2').results.on 'mousemove-filtered', (e) =>
            select2_data = $(e.target).closest('.select2-result').data 'select2-data'
            @builder.showTooltip 'Pilot', exportObj.pilotsById[select2_data.id], {ship: @data?.english_name} if select2_data?.id?
        @pilot_selector.data('select2').container.on 'mouseover', (e) =>
            @builder.showTooltip 'Ship', this if @data?

        @pilot_selector.data('select2').container.hide()

        @points_container = $ @row.find('.points-display-container')
        @points_container.fadeTo 0, 0

        @addon_container = $ @row.find('div.addon-container')

        @remove_button = $ @row.find('button.remove-pilot')
        @remove_button.click (e) =>
            e.preventDefault()
            @row.slideUp 'fast', () =>
                @builder.removeShip this
                @backend_status?.fadeOut 'slow'
        @remove_button.hide()

        @copy_button = $ @row.find('button.copy-pilot')
        @copy_button.click (e) =>
            clone = @builder.ships[@builder.ships.length - 1]
            clone.copyFrom(this)
        @copy_button.hide()

    teardownUI: ->
        @row.text ''
        @row.remove()

    toString: ->
        if @pilot?
            "Pilot #{@pilot.name} flying #{@data.name}"
        else
            "Ship without pilot"

    toHTML: ->
        effective_stats = @effectiveStats()
        action_icons = []
        action_icons_red = []
        for action in effective_stats.actions
            action_icons.push switch action
                when 'Focus'
                    """<i class="xwing-miniatures-font xwing-miniatures-font-focus"></i>"""
                when 'Evade'
                    """<i class="xwing-miniatures-font xwing-miniatures-font-evade"></i>"""
                when 'Barrel Roll'
                    """<i class="xwing-miniatures-font xwing-miniatures-font-barrelroll"></i>"""
                when 'Target Lock'
                    """<i class="xwing-miniatures-font xwing-miniatures-font-lock"></i>"""
                when 'Boost'
                    """<i class="xwing-miniatures-font xwing-miniatures-font-boost"></i>"""
                when 'Coordinate'
                    """<i class="xwing-miniatures-font xwing-miniatures-font-coordinate"></i>"""
                when 'Jam'
                    """<i class="xwing-miniatures-font xwing-miniatures-font-jam"></i>"""
                when 'Recover'
                    """<i class="xwing-miniatures-font xwing-miniatures-font-recover"></i>"""
                when 'Reinforce'
                    """<i class="xwing-miniatures-font xwing-miniatures-font-reinforce"></i>"""
                when 'Cloak'
                    """<i class="xwing-miniatures-font xwing-miniatures-font-cloak"></i>"""
                when 'Slam'
                    """<i class="xwing-miniatures-font xwing-miniatures-font-slam"></i>"""
                when 'Rotate Arc'
                    """<i class="xwing-miniatures-font xwing-miniatures-font-rotatearc"></i>"""
                when 'Reload'
                    """<i class="xwing-miniatures-font xwing-miniatures-font-reload"></i>"""
                when 'Calculate'
                    """<i class="xwing-miniatures-font xwing-miniatures-font-calculate"></i>"""
                when "<r>> Target Lock</r>"
                    """<r>> <i class="xwing-miniatures-font info-attack red xwing-miniatures-font-lock"></i></r>"""
                when "<r>> Barrel Roll</r>"
                    """<r>> <i class="xwing-miniatures-font info-attack red xwing-miniatures-font-barrelroll"></i></r>"""
                when "<r>> Focus</r>"
                    """<r>> <i class="xwing-miniatures-font info-attack red xwing-miniatures-font-focus"></i></r>"""
                when "<r>> Rotate Arc</r>"
                    """<r>> <i class="xwing-miniatures-font info-attack red xwing-miniatures-font-rotatearc"></i></r>"""
                when "<r>> Evade</r>"
                    """<r>> <i class="xwing-miniatures-font info-attack red xwing-miniatures-font-evade"></i></r>"""
                when "<r>> Calculate</r>"
                    """<r>> <i class="xwing-miniatures-font info-attack red xwing-miniatures-font-calculate"></i></r>"""
                else
                    """<span>&nbsp;#{action}<span>"""

        for actionred in effective_stats.actionsred
            action_icons_red.push switch actionred
                when 'Focus'
                    """<i class="xwing-miniatures-font red xwing-miniatures-font-focus"></i>"""
                when 'Evade'
                    """<i class="xwing-miniatures-font red xwing-miniatures-font-evade"></i>"""
                when 'Barrel Roll'
                    """<i class="xwing-miniatures-font red xwing-miniatures-font-barrelroll"></i>"""
                when 'Target Lock'
                    """<i class="xwing-miniatures-font red xwing-miniatures-font-lock"></i>"""
                when 'Boost'
                    """<i class="xwing-miniatures-font red xwing-miniatures-font-boost"></i>"""
                when 'Coordinate'
                    """<i class="xwing-miniatures-font red xwing-miniatures-font-coordinate"></i>"""
                when 'Jam'
                    """<i class="xwing-miniatures-font red xwing-miniatures-font-jam"></i>"""
                when 'Recover'
                    """<i class="xwing-miniatures-font red xwing-miniatures-font-recover"></i>"""
                when 'Reinforce'
                    """<i class="xwing-miniatures-font red xwing-miniatures-font-reinforce"></i>"""
                when 'Cloak'
                    """<i class="xwing-miniatures-font red xwing-miniatures-font-cloak"></i>"""
                when 'Slam'
                    """<i class="xwing-miniatures-font red xwing-miniatures-font-slam"></i>"""
                when 'Rotate Arc'
                    """<i class="xwing-miniatures-font red xwing-miniatures-font-rotatearc"></i>"""
                when 'Reload'
                    """<i class="xwing-miniatures-font red xwing-miniatures-font-reload"></i>"""
                when 'Calculate'
                    """<i class="xwing-miniatures-font red xwing-miniatures-font-calculate"></i>"""
                else
                    """<span>&nbsp;#{action}<span>"""
    
        action_bar = action_icons.join ' '
        action_bar_red = action_icons_red.join ' '

        attack_icon = @data.attack_icon ? 'xwing-miniatures-font-frontarc'

        attackHTML = if (@pilot.ship_override?.attack? or @data.attack?) then $.trim """
            <i class="xwing-miniatures-font #{attack_icon}"></i>
            <span class="info-data info-attack">#{statAndEffectiveStat((@pilot.ship_override?.attack ? @data.attack), effective_stats, 'attack')}</span>
        """ else ''

        energyHTML = if (@pilot.ship_override?.energy? or @data.energy?) then $.trim """
            <i class="xwing-miniatures-font xwing-miniatures-font-energy"></i>
            <span class="info-data info-energy">#{statAndEffectiveStat((@pilot.ship_override?.energy ? @data.energy), effective_stats, 'energy')}</span>
        """ else ''
            
        forceHTML = if (@pilot.force?) then $.trim """
            <i class="xwing-miniatures-font xwing-miniatures-font-force"></i>
            <span class="info-data info-force">#{statAndEffectiveStat((@pilot.ship_override?.force ? @pilot.force), effective_stats, 'force')}</span>
        """ else ''

        html = $.trim """
            <div class="fancy-pilot-header">
                <div class="pilot-header-text">#{@pilot.name} <i class="xwing-miniatures-ship xwing-miniatures-ship-#{@data.canonical_name}"></i><span class="fancy-ship-type"> #{@data.name}</span></div>
                <div class="mask">
                    <div class="outer-circle">
                        <div class="inner-circle pilot-points">#{@pilot.points}</div>
                    </div>
                </div>
            </div>
            <div class="fancy-pilot-stats">
                <div class="pilot-stats-content">
                    <span class="info-data info-skill">PS #{statAndEffectiveStat(@pilot.skill, effective_stats, 'skill')}</span>
                    #{attackHTML}
                    #{energyHTML}
                    <i class="xwing-miniatures-font xwing-miniatures-font-agility"></i>
                    <span class="info-data info-agility">#{statAndEffectiveStat((@pilot.ship_override?.agility ? @data.agility), effective_stats, 'agility')}</span>
                    <i class="xwing-miniatures-font xwing-miniatures-font-hull"></i>
                    <span class="info-data info-hull">#{statAndEffectiveStat((@pilot.ship_override?.hull ? @data.hull), effective_stats, 'hull')}</span>
                    <i class="xwing-miniatures-font xwing-miniatures-font-shield"></i>
                    <span class="info-data info-shields">#{statAndEffectiveStat((@pilot.ship_override?.shields ? @data.shields), effective_stats, 'shields')}</span>
                    #{forceHTML}
                    &nbsp;
                    #{action_bar}
                    &nbsp;
                    #{action_bar_red}
                </div>
            </div>
        """
        
        if @pilot.text
            html += $.trim """
                <div class="fancy-pilot-text">#{@pilot.text}</div>
            """

        slotted_upgrades = (upgrade for upgrade in @upgrades when upgrade.data?)
            .concat (modification for modification in @modifications when modification.data?)
            .concat (title for title in @titles when title.data?)

        if slotted_upgrades.length > 0
            html += $.trim """
                <div class="fancy-upgrade-container">
            """

            for upgrade in slotted_upgrades
                html += upgrade.toHTML()

            html += $.trim """
                </div>
            """

        # if @getPoints() != @pilot.points
        html += $.trim """
            <div class="ship-points-total">
                <strong>Ship Total: #{@getPoints()}</strong>
            </div>
        """

        """<div class="fancy-ship">#{html}</div>"""

    toTableRow: ->
        table_html = $.trim """
            <tr class="simple-pilot">
                <td class="name">#{@pilot.name} &mdash; #{@data.name}</td>
                <td class="points">#{@pilot.points}</td>
            </tr>
        """

        slotted_upgrades = (upgrade for upgrade in @upgrades when upgrade.data?)
            .concat (modification for modification in @modifications when modification.data?)
            .concat (title for title in @titles when title.data?)
        if slotted_upgrades.length > 0
            for upgrade in slotted_upgrades
                table_html += upgrade.toTableRow()

        # if @getPoints() != @pilot.points
        table_html += """<tr class="simple-ship-total"><td colspan="2">Ship Total: #{@getPoints()}</td></tr>"""

        table_html += '<tr><td>&nbsp;</td><td></td></tr>'
        table_html

    toBBCode: ->
        bbcode = """[b]#{@pilot.name} (#{@pilot.points})[/b]"""

        slotted_upgrades = (upgrade for upgrade in @upgrades when upgrade.data?)
            .concat (modification for modification in @modifications when modification.data?)
            .concat (title for title in @titles when title.data?)
        if slotted_upgrades.length > 0
            bbcode +="\n"
            bbcode_upgrades= []
            for upgrade in slotted_upgrades
                upgrade_bbcode = upgrade.toBBCode()
                bbcode_upgrades.push upgrade_bbcode if upgrade_bbcode?
            bbcode += bbcode_upgrades.join "\n"

        bbcode

    toSimpleHTML: ->
        html = """<b>#{@pilot.name} (#{@pilot.points})</b><br />"""

        slotted_upgrades = (upgrade for upgrade in @upgrades when upgrade.data?)
            .concat (modification for modification in @modifications when modification.data?)
            .concat (title for title in @titles when title.data?)
        if slotted_upgrades.length > 0
            for upgrade in slotted_upgrades
                upgrade_html = upgrade.toSimpleHTML()
                html += upgrade_html if upgrade_html?

        html

    toSerialized: ->
        # PILOT_ID:UPGRADEID1,UPGRADEID2:TITLEID:MODIFICATIONID:CONFERREDADDONTYPE1.CONFERREDADDONID1,CONFERREDADDONTYPE2.CONFERREDADDONID2

        # Skip conferred upgrades
        conferred_addons = []
        for title in @titles
            conferred_addons = conferred_addons.concat(title?.conferredAddons ? [])
        for modification in @modifications
            conferred_addons = conferred_addons.concat(modification?.conferredAddons ? [])
        for upgrade in @upgrades
            conferred_addons = conferred_addons.concat(upgrade?.conferredAddons ? [])
        upgrades = """#{upgrade?.data?.id ? -1 for upgrade, i in @upgrades when upgrade not in conferred_addons}"""

        serialized_conferred_addons = []
        for addon in conferred_addons
            serialized_conferred_addons.push addon.toSerialized()

        [
            @pilot.id,
            upgrades,
            @titles[0]?.data?.id ? -1,
            @modifications[0]?.data?.id ? -1,
            serialized_conferred_addons.join(','),
        ].join ':'


    fromSerialized: (version, serialized) ->
        switch version
            when 1
                # PILOT_ID:UPGRADEID1,UPGRADEID2:TITLEID:TITLEUPGRADE1,TITLEUPGRADE2:MODIFICATIONID
                [ pilot_id, upgrade_ids, title_id, title_conferred_upgrade_ids, modification_id ] = serialized.split ':'

                @setPilotById parseInt(pilot_id)

                for upgrade_id, i in upgrade_ids.split ','
                    upgrade_id = parseInt upgrade_id
                    @upgrades[i].setById upgrade_id if upgrade_id >= 0

                title_id = parseInt title_id
                @titles[0].setById title_id if title_id >= 0

                if @titles[0]? and @titles[0].conferredAddons.length > 0
                    for upgrade_id, i in title_conferred_upgrade_ids.split ','
                        upgrade_id = parseInt upgrade_id
                        @titles[0].conferredAddons[i].setById upgrade_id if upgrade_id >= 0

                modification_id = parseInt modification_id
                @modifications[0].setById modification_id if modification_id >= 0

            when 2, 3
                # PILOT_ID:UPGRADEID1,UPGRADEID2:TITLEID:MODIFICATIONID:CONFERREDADDONTYPE1.CONFERREDADDONID1,CONFERREDADDONTYPE2.CONFERREDADDONID2
                [ pilot_id, upgrade_ids, title_id, modification_id, conferredaddon_pairs ] = serialized.split ':'
                @setPilotById parseInt(pilot_id)

                deferred_ids = []
                for upgrade_id, i in upgrade_ids.split ','
                    upgrade_id = parseInt upgrade_id
                    continue if upgrade_id < 0 or isNaN(upgrade_id)
                    if @upgrades[i].isOccupied()
                        deferred_ids.push upgrade_id
                    else
                        @upgrades[i].setById upgrade_id

                for deferred_id in deferred_ids
                    for upgrade, i in @upgrades
                        continue if upgrade.isOccupied() or upgrade.slot != exportObj.upgradesById[deferred_id].slot
                        upgrade.setById deferred_id
                        break


                title_id = parseInt title_id
                @titles[0].setById title_id if title_id >= 0

                modification_id = parseInt modification_id
                @modifications[0].setById modification_id if modification_id >= 0

                # We confer title addons before modification addons, to pick an arbitrary ordering.
                if conferredaddon_pairs?
                    conferredaddon_pairs = conferredaddon_pairs.split ','
                else
                    conferredaddon_pairs = []

                if @titles[0]? and @titles[0].conferredAddons.length > 0
                    title_conferred_addon_pairs = conferredaddon_pairs.splice 0, @titles[0].conferredAddons.length
                    for conferredaddon_pair, i in title_conferred_addon_pairs
                        [ addon_type_serialized, addon_id ] = conferredaddon_pair.split '.'
                        addon_id = parseInt addon_id
                        addon_cls = SERIALIZATION_CODE_TO_CLASS[addon_type_serialized]
                        conferred_addon = @titles[0].conferredAddons[i]
                        if conferred_addon instanceof addon_cls
                            conferred_addon.setById addon_id
                        else
                            throw new Error("Expected addon class #{addon_cls.constructor.name} for conferred addon at index #{i} but #{conferred_addon.constructor.name} is there")

                for modification in @modifications
                    if modification?.data? and modification.conferredAddons.length > 0
                        modification_conferred_addon_pairs = conferredaddon_pairs.splice 0, modification.conferredAddons.length
                        for conferredaddon_pair, i in modification_conferred_addon_pairs
                            [ addon_type_serialized, addon_id ] = conferredaddon_pair.split '.'
                            addon_id = parseInt addon_id
                            addon_cls = SERIALIZATION_CODE_TO_CLASS[addon_type_serialized]
                            conferred_addon = modification.conferredAddons[i]
                            if conferred_addon instanceof addon_cls
                                conferred_addon.setById addon_id
                            else
                                throw new Error("Expected addon class #{addon_cls.constructor.name} for conferred addon at index #{i} but #{conferred_addon.constructor.name} is there")

            when 4
                # PILOT_ID:UPGRADEID1,UPGRADEID2:TITLEID:MODIFICATIONID:CONFERREDADDONTYPE1.CONFERREDADDONID1,CONFERREDADDONTYPE2.CONFERREDADDONID2
                [ pilot_id, upgrade_ids, title_id, modification_id, conferredaddon_pairs ] = serialized.split ':'
                @setPilotById parseInt(pilot_id)

                deferred_ids = []
                for upgrade_id, i in upgrade_ids.split ','
                    upgrade_id = parseInt upgrade_id
                    continue if upgrade_id < 0 or isNaN(upgrade_id)
                    # Defer fat upgrades
                    if @upgrades[i].isOccupied() or @upgrades[i].dataById[upgrade_id].also_occupies_upgrades?
                        deferred_ids.push upgrade_id
                    else
                        @upgrades[i].setById upgrade_id

                for deferred_id in deferred_ids
                    for upgrade, i in @upgrades
                        continue if upgrade.isOccupied() or upgrade.slot != exportObj.upgradesById[deferred_id].slot
                        upgrade.setById deferred_id
                        break


                title_id = parseInt title_id
                @titles[0].setById title_id if title_id >= 0

                modification_id = parseInt modification_id
                @modifications[0].setById modification_id if modification_id >= 0

                # We confer title addons before modification addons, to pick an arbitrary ordering.
                if conferredaddon_pairs?
                    conferredaddon_pairs = conferredaddon_pairs.split ','
                else
                    conferredaddon_pairs = []

                for title, i in @titles
                    if title?.data? and title.conferredAddons.length > 0
                        # console.log "Confer title #{title.data.name} at #{i}"
                        title_conferred_addon_pairs = conferredaddon_pairs.splice 0, title.conferredAddons.length
                        for conferredaddon_pair, i in title_conferred_addon_pairs
                            [ addon_type_serialized, addon_id ] = conferredaddon_pair.split '.'
                            addon_id = parseInt addon_id
                            addon_cls = SERIALIZATION_CODE_TO_CLASS[addon_type_serialized]
                            conferred_addon = title.conferredAddons[i]
                            if conferred_addon instanceof addon_cls
                                conferred_addon.setById addon_id
                            else
                                throw new Error("Expected addon class #{addon_cls.constructor.name} for conferred addon at index #{i} but #{conferred_addon.constructor.name} is there")

                for modification in @modifications
                    if modification?.data? and modification.conferredAddons.length > 0
                        modification_conferred_addon_pairs = conferredaddon_pairs.splice 0, modification.conferredAddons.length
                        for conferredaddon_pair, i in modification_conferred_addon_pairs
                            [ addon_type_serialized, addon_id ] = conferredaddon_pair.split '.'
                            addon_id = parseInt addon_id
                            addon_cls = SERIALIZATION_CODE_TO_CLASS[addon_type_serialized]
                            conferred_addon = modification.conferredAddons[i]
                            if conferred_addon instanceof addon_cls
                                conferred_addon.setById addon_id
                            else
                                throw new Error("Expected addon class #{addon_cls.constructor.name} for conferred addon at index #{i} but #{conferred_addon.constructor.name} is there")


                for upgrade in @upgrades
                    if upgrade?.data? and upgrade.conferredAddons.length > 0
                        upgrade_conferred_addon_pairs = conferredaddon_pairs.splice 0, upgrade.conferredAddons.length
                        for conferredaddon_pair, i in upgrade_conferred_addon_pairs
                            [ addon_type_serialized, addon_id ] = conferredaddon_pair.split '.'
                            addon_id = parseInt addon_id
                            addon_cls = SERIALIZATION_CODE_TO_CLASS[addon_type_serialized]
                            conferred_addon = upgrade.conferredAddons[i]
                            if conferred_addon instanceof addon_cls
                                conferred_addon.setById addon_id
                            else
                                throw new Error("Expected addon class #{addon_cls.constructor.name} for conferred addon at index #{i} but #{conferred_addon.constructor.name} is there")

        @updateSelections()

    effectiveStats: ->
        stats =
            skill: @pilot.skill
            attack: @pilot.ship_override?.attack ? @data.attack
            attackf: @pilot.ship_override?.attackf ? @data.attackf
            attackb: @pilot.ship_override?.attackb ? @data.attackb
            attackt: @pilot.ship_override?.attackt ? @data.attackt
            attackdt: @pilot.ship_override?.attackdt ? @data.attackdt
            energy: @pilot.ship_override?.energy ? @data.energy
            agility: @pilot.ship_override?.agility ? @data.agility
            hull: @pilot.ship_override?.hull ? @data.hull
            shields: @pilot.ship_override?.shields ? @data.shields
            force: @pilot.ship_override?.force ? @pilot.force
            charge: @pilot.ship_override?.charge ? @pilot.charge
            actions: (@pilot.ship_override?.actions ? @data.actions).slice 0
            actionsred: ((@pilot.ship_override?.actionsred ? @data.actionsred) ? []).slice 0

        # need a deep copy of maneuvers array
        stats.maneuvers = []
        for s in [0 ... (@data.maneuvers ? []).length]
            stats.maneuvers[s] = @data.maneuvers[s].slice 0

        for upgrade in @upgrades
            upgrade.data.modifier_func(stats) if upgrade?.data?.modifier_func?
        for title in @titles
            title.data.modifier_func(stats) if title?.data?.modifier_func?
        for modification in @modifications
            modification.data.modifier_func(stats) if modification?.data?.modifier_func?
        @pilot.modifier_func(stats) if @pilot?.modifier_func?
        stats

    validate: ->
        # Remove addons that violate their validation functions (if any) one by one
        # until everything checks out
        # If there is no explicit validation_func, use restriction_func
        max_checks = 128 # that's a lot of addons (Epic?)
        for i in [0...max_checks]
            valid = true
            for upgrade in @upgrades
                func = upgrade?.data?.validation_func ? upgrade?.data?.restriction_func ? undefined
                if func? and not func(this, upgrade)
                    #console.log "Invalid upgrade: #{upgrade?.data?.name}"
                    upgrade.setById null
                    valid = false
                    break

            for title in @titles
                func = title?.data?.validation_func ? title?.data?.restriction_func ? undefined
                if func? and not func this
                    #console.log "Invalid title: #{title?.data?.name}"
                    title.setById null
                    valid = false
                    break

            for modification in @modifications
                func = modification?.data?.validation_func ? modification?.data?.restriction_func ? undefined
                if func? and not func(this, modification)
                    #console.log "Invalid modification: #{modification?.data?.name}"
                    modification.setById null
                    valid = false
                    break
            break if valid
        @updateSelections()

    checkUnreleasedContent: ->
        if @pilot? and not exportObj.isReleased @pilot
            #console.log "#{@pilot.name} is unreleased"
            return true

        for title in @titles
            if title?.data? and not exportObj.isReleased title.data
                #console.log "#{title.data.name} is unreleased"
                return true

        for modification in @modifications
            if modification?.data? and not exportObj.isReleased modification.data
                #console.log "#{modification.data.name} is unreleased"
                return true

        for upgrade in @upgrades
            if upgrade?.data? and not exportObj.isReleased upgrade.data
                #console.log "#{upgrade.data.name} is unreleased"
                return true

        false

    checkEpicContent: ->
        if @pilot? and @pilot.epic?
            return true

        for title in @titles
            if title?.data?.epic?
                return true

        for modification in @modifications
            if modification?.data?.epic?
                return true

        for upgrade in @upgrades
            if upgrade?.data?.epic?
                return true

        false

    hasAnotherUnoccupiedSlotLike: (upgrade_obj) ->
        for upgrade in @upgrades
            continue if upgrade == upgrade_obj or upgrade.slot != upgrade_obj.slot
            return true unless upgrade.isOccupied()
        false

    toXWS: ->
        xws =
            id: (@pilot.xws ? @pilot.canonical_name)
            points: @getPoints()
            #ship: @data.canonical_name
            ship: @data.xws.canonicalize()

        if @data.multisection
            xws.multisection = @data.multisection.slice 0

        upgrade_obj = {}

        for upgrade in @upgrades
            if upgrade?.data?
                upgrade.toXWS upgrade_obj

        for modification in @modifications
            if modification?.data?
                modification.toXWS upgrade_obj

        for title in @titles
            if title?.data?
                title.toXWS upgrade_obj

        if Object.keys(upgrade_obj).length > 0
            xws.upgrades = upgrade_obj

        xws

    getConditions: ->
        if Set?
            conditions = new Set()
            if @pilot?.applies_condition?
                if @pilot.applies_condition instanceof Array
                    for condition in @pilot.applies_condition
                        conditions.add(exportObj.conditionsByCanonicalName[condition])
                else
                    conditions.add(exportObj.conditionsByCanonicalName[@pilot.applies_condition])
            for upgrade in @upgrades
                if upgrade?.data?.applies_condition?
                    if upgrade.data.applies_condition instanceof Array
                        for condition in upgrade.data.applies_condition
                            conditions.add(exportObj.conditionsByCanonicalName[condition])
                    else
                        conditions.add(exportObj.conditionsByCanonicalName[upgrade.data.applies_condition])
            conditions
        else
            console.warn 'Set not supported in this JS implementation, not implementing conditions'
            []

class GenericAddon
    constructor: (args) ->
        # args
        @ship = args.ship
        @container = $ args.container

        # internal state
        @data = null
        @unadjusted_data = null
        @conferredAddons = []
        @serialization_code = 'X'
        @occupied_by = null
        @occupying = []
        @destroyed = false

        # Overridden by children
        @type = null
        @dataByName = null
        @dataById = null

        @adjustment_func = args.adjustment_func if args.adjustment_func?
        @filter_func = args.filter_func if args.filter_func?
        @placeholderMod_func = if args.placeholderMod_func? then args.placeholderMod_func else (x) => x

    destroy: (cb, args...) ->
        return cb(args) if @destroyed
        if @data?.unique?
            await @ship.builder.container.trigger 'xwing:releaseUnique', [ @data, @type, defer() ]
        @destroyed = true
        @rescindAddons()
        @deoccupyOtherUpgrades()
        @selector.select2 'destroy'
        cb args

    setupSelector: (args) ->
        @selector = $ document.createElement 'INPUT'
        @selector.attr 'type', 'hidden'
        @container.append @selector
        args.minimumResultsForSearch = -1 if $.isMobile()
        args.formatResultCssClass = (obj) =>
            if @ship.builder.collection?
                not_in_collection = false
                if obj.id == @data?.id
                    # Currently selected card; mark as not in collection if it's neither
                    # on the shelf nor on the table
                    unless (@ship.builder.collection.checkShelf(@type.toLowerCase(), obj.english_name) or @ship.builder.collection.checkTable(@type.toLowerCase(), obj.english_name))
                        not_in_collection = true
                else
                    # Not currently selected; check shelf only
                    not_in_collection = not @ship.builder.collection.checkShelf(@type.toLowerCase(), obj.english_name)
                if not_in_collection then 'select2-result-not-in-collection' else ''
            else
                ''
        args.formatSelection = (obj, container) =>
            icon = switch @type
                when 'Upgrade'
                    @slot.toLowerCase().replace(/[^0-9a-z]/gi, '')
                else
                    @type.toLowerCase().replace(/[^0-9a-z]/gi, '')
                    
            icon = icon.replace("configuration", "config")
                        .replace("force", "forcepower")
                
            # Append directly so we don't have to disable markup escaping
            $(container).append """<i class="xwing-miniatures-font xwing-miniatures-font-#{icon}"></i> #{obj.text}"""
            # If you return a string, Select2 will render it
            undefined

        @selector.select2 args
        @selector.on 'change', (e) =>
            @setById @selector.select2('val')
            @ship.builder.current_squad.dirty = true
            @ship.builder.container.trigger 'xwing-backend:squadDirtinessChanged'
            @ship.builder.backend_status.fadeOut 'slow'
        @selector.data('select2').results.on 'mousemove-filtered', (e) =>
            select2_data = $(e.target).closest('.select2-result').data 'select2-data'
            @ship.builder.showTooltip 'Addon', @dataById[select2_data.id], {addon_type: @type} if select2_data?.id?
        @selector.data('select2').container.on 'mouseover', (e) =>
            @ship.builder.showTooltip 'Addon', @data, {addon_type: @type} if @data?

    setById: (id) ->
        @setData @dataById[parseInt id]

    setByName: (name) ->
        @setData @dataByName[$.trim name]

    setData: (new_data) ->
        if new_data?.id != @data?.id
            if @data?.unique?
                await @ship.builder.container.trigger 'xwing:releaseUnique', [ @unadjusted_data, @type, defer() ]
            @rescindAddons()
            @deoccupyOtherUpgrades()
            if new_data?.unique?
                await @ship.builder.container.trigger 'xwing:claimUnique', [ new_data, @type, defer() ]
            # Need to make a copy of the data, but that means I can't just check equality
            @data = @unadjusted_data = new_data

            if @data?
                if @data.superseded_by_id
                    return @setById @data.superseded_by_id
                if @adjustment_func?
                    @data = @adjustment_func(@data)
                @unequipOtherUpgrades()
                @occupyOtherUpgrades()
                @conferAddons()
            else
                @deoccupyOtherUpgrades()

            @ship.builder.container.trigger 'xwing:pointsUpdated'

    conferAddons: ->
        if @data.confersAddons? and @data.confersAddons.length > 0
            for addon in @data.confersAddons
                cls = addon.type
                args =
                    ship: @ship
                    container: @container
                args.slot = addon.slot if addon.slot?
                args.adjustment_func = addon.adjustment_func if addon.adjustment_func?
                args.filter_func = addon.filter_func if addon.filter_func?
                args.auto_equip = addon.auto_equip if addon.auto_equip?
                args.placeholderMod_func = addon.placeholderMod_func if addon.placeholderMod_func?
                addon = new cls args
                if addon instanceof exportObj.Upgrade
                    @ship.upgrades.push addon
                else if addon instanceof exportObj.Modification
                    @ship.modifications.push addon
                else if addon instanceof exportObj.Title
                    @ship.titles.push addon
                else
                    throw new Error("Unexpected addon type for addon #{addon}")
                @conferredAddons.push addon

    rescindAddons: ->
        await
            for addon in @conferredAddons
                addon.destroy defer()
        for addon in @conferredAddons
            if addon instanceof exportObj.Upgrade
                @ship.upgrades.removeItem addon
            else if addon instanceof exportObj.Modification
                @ship.modifications.removeItem addon
            else if addon instanceof exportObj.Title
                @ship.titles.removeItem addon
            else
                throw new Error("Unexpected addon type for addon #{addon}")
        @conferredAddons = []

    getPoints: ->
        # Moar special case jankiness
        if @data?.variableagility? and @ship?
            Math.max(@data?.basepoints ? 0, (@data?.basepoints ? 0) + ((@ship?.data.agility - 1)*2) + 1)
        else if @data?.variablebase? and not (@ship.data.medium? or @ship.data.large?)
            Math.max(0, @data?.basepoints)
        else if @data?.variablebase? and @ship?.data.medium?
            Math.max(0, (@data?.basepoints ? 0) + (@data?.basepoints))
        else if @data?.variablebase? and @ship?.data.large?
            Math.max(0, (@data?.basepoints ? 0) + (@data?.basepoints * 2))
        else
            @data?.points ? 0

    updateSelection: ->
        if @data?
            @selector.select2 'data',
                id: @data.id
                text: "#{@data.name} (#{@data.points})"
        else
            @selector.select2 'data', null

    toString: ->
        if @data?
            "#{@data.name} (#{@data.points})"
        else
            "No #{@type}"

    toHTML: ->
        if @data?
            upgrade_slot_font = (@data.slot ? @type).toLowerCase().replace(/[^0-9a-z]/gi, '')

            match_array = @data.text.match(/(<span.*<\/span>)<br \/><br \/>(.*)/)

            if match_array
                restriction_html = '<div class="card-restriction-container">' + match_array[1] + '</div>'
                text_str = match_array[2]
            else
                restriction_html = ''
                text_str = @data.text

            attackHTML = if (@data.attack?) then $.trim """
                <div class="upgrade-attack">
                    <span class="upgrade-attack-range">#{@data.range}</span>
                    <span class="info-data info-attack">#{@data.attack}</span>
                    <i class="xwing-miniatures-font xwing-miniatures-font-frontarc"></i>
                </div>
            """ else if (@data.attackt?) then $.trim """
                <div class="upgrade-attack">
                    <span class="upgrade-attack-range">#{@data.range}</span>
                    <span class="info-data info-attack">#{@data.attackt}</span>
                    <i class="xwing-miniatures-font xwing-miniatures-font-singleturretarc"></i>
                </div>
            """ else if (@data.attackbull?) then $.trim """
                <div class="upgrade-attack">
                    <span class="upgrade-attack-range">#{@data.range}</span>
                    <span class="info-data info-attack">#{@data.attackbull}</span>
                    <i class="xwing-miniatures-font xwing-miniatures-font-bullseyearc"></i>
                </div>
            """ else ''

            energyHTML = if (@data.energy?) then $.trim """
                <div class="upgrade-energy">
                    <span class="info-data info-energy">#{@data.energy}</span>
                    <i class="xwing-miniatures-font xwing-miniatures-font-energy"></i>
                </div>
            """ else ''
                
            $.trim """
                <div class="upgrade-container">
                    <div class="upgrade-stats">
                        <div class="upgrade-name"><i class="xwing-miniatures-font xwing-miniatures-font-#{upgrade_slot_font}"></i>#{@data.name}</div>
                        <div class="mask">
                            <div class="outer-circle">
                                <div class="inner-circle upgrade-points">#{@data.points}</div>
                            </div>
                        </div>
                        #{restriction_html}
                    </div>
                    #{attackHTML}
                    #{energyHTML}
                    <div class="upgrade-text">#{text_str}</div>
                    <div style="clear: both;"></div>
                </div>
            """
        else
            ''

    toTableRow: ->
        if @data?
            $.trim """
                <tr class="simple-addon">
                    <td class="name">#{@data.name}</td>
                    <td class="points">#{@data.points}</td>
                </tr>
            """
        else
            ''

    toBBCode: ->
        if @data?
            """[i]#{@data.name} (#{@data.points})[/i]"""
        else
            null

    toSimpleHTML: ->
        if @data?
            """<i>#{@data.name} (#{@data.points})</i><br />"""
        else
            ''

    toSerialized: ->
        """#{@serialization_code}.#{@data?.id ? -1}"""

    unequipOtherUpgrades: ->
        for slot in @data?.unequips_upgrades ? []
            for upgrade in @ship.upgrades
                continue if upgrade.slot != slot or upgrade == this or not upgrade.isOccupied()
                upgrade.setData null
                break
        if @data?.unequips_modifications
            for modification in @ship.modifications
                continue unless modification == this or modification.isOccupied()
                modification.setData null

    isOccupied: ->
        @data? or @occupied_by?

    occupyOtherUpgrades: ->
        for slot in @data?.also_occupies_upgrades ? []
            for upgrade in @ship.upgrades
                continue if upgrade.slot != slot or upgrade == this or upgrade.isOccupied()
                @occupy upgrade
                break
        if @data?.also_occupies_modifications
            for modification in @ship.modifications
                continue if modification == this or modification.isOccupied()
                @occupy modification

    deoccupyOtherUpgrades: ->
        for upgrade in @occupying
            @deoccupy upgrade

    occupy: (upgrade) ->
        upgrade.occupied_by = this
        upgrade.selector.select2 'enable', false
        @occupying.push upgrade

    deoccupy: (upgrade) ->
        upgrade.occupied_by = null
        upgrade.selector.select2 'enable', true

    occupiesAnotherUpgradeSlot: ->
        for upgrade in @ship.upgrades
            continue if upgrade.slot != @slot or upgrade == this or upgrade.data?
            if upgrade.occupied_by? and upgrade.occupied_by == this
                return true
        false

    toXWS: (upgrade_dict) ->
        upgrade_type = switch @type
            when 'Upgrade'
                exportObj.toXWSUpgrade[@slot] ? @slot.canonicalize()
            else
                exportObj.toXWSUpgrade[@type] ?  @type.canonicalize()
        (upgrade_dict[upgrade_type] ?= []).push (@data.xws ? @data.canonical_name)

class exportObj.Upgrade extends GenericAddon
    constructor: (args) ->
        # args
        super args
        @slot = args.slot
        @type = 'Upgrade'
        @dataById = exportObj.upgradesById
        @dataByName = exportObj.upgradesByLocalizedName
        @serialization_code = 'U'

        @setupSelector()

    setupSelector: ->
        super
            width: '50%'
            placeholder: @placeholderMod_func(exportObj.translate @ship.builder.language, 'ui', 'upgradePlaceholder', @slot)
            allowClear: true
            query: (query) =>
                @ship.builder.checkCollection()
                query.callback
                    more: false
                    results: @ship.builder.getAvailableUpgradesIncluding(@slot, @data, @ship, this, query.term, @filter_func)

#Temporarily removed modifications as they are now upgrades                    
#class exportObj.Modification extends GenericAddon
#    constructor: (args) ->
#        super args
#        @type = 'Modification'
#        @dataById = exportObj.modificationsById
#        @dataByName = exportObj.modificationsByLocalizedName
#        @serialization_code = 'M'

#        @setupSelector()

#    setupSelector: ->
#        super
#            width: '50%'
#            placeholder: @placeholderMod_func(exportObj.translate @ship.builder.language, 'ui', 'modificationPlaceholder')
#            allowClear: true
#            query: (query) =>
#                @ship.builder.checkCollection()
#                query.callback
#                    more: false
#                    results: @ship.builder.getAvailableModificationsIncluding(@data, @ship, query.term, @filter_func)

class exportObj.Title extends GenericAddon
    constructor: (args) ->
        super args
        @type = 'Title'
        @dataById = exportObj.titlesById
        @dataByName = exportObj.titlesByLocalizedName
        @serialization_code = 'T'

        @setupSelector()

    setupSelector: ->
        super
            width: '50%'
            placeholder: @placeholderMod_func(exportObj.translate @ship.builder.language, 'ui', 'titlePlaceholder')
            allowClear: true
            query: (query) =>
                @ship.builder.checkCollection()
                query.callback
                    more: false
                    results: @ship.builder.getAvailableTitlesIncluding(@ship, @data, query.term)

class exportObj.RestrictedUpgrade extends exportObj.Upgrade
    constructor: (args) ->
        @filter_func = args.filter_func
        super args
        @serialization_code = 'u'
        if args.auto_equip?
            @setById args.auto_equip

#class exportObj.RestrictedModification extends exportObj.Modification
#    constructor: (args) ->
#        @filter_func = args.filter_func
#        super args
#        @serialization_code = 'm'
#        if args.auto_equip?
#            @setById args.auto_equip

SERIALIZATION_CODE_TO_CLASS =
    'M': exportObj.Modification
    'T': exportObj.Title
    'U': exportObj.Upgrade
    'u': exportObj.RestrictedUpgrade
    'm': exportObj.RestrictedModification

exportObj = exports ? this

exportObj.fromXWSFaction =
    'rebelalliance': 'Rebel Alliance'
    'rebels': 'Rebel Alliance'
    'galacticempire': 'Galactic Empire'
    'imperial': 'Galactic Empire'
    'scumandvillainy': 'Scum and Villainy'

exportObj.toXWSFaction =
    'Rebel Alliance': 'rebelalliance'
    'Galactic Empire': 'galacticempire'
    'Scum and Villainy': 'scumandvillainy'

exportObj.toXWSUpgrade =
    'Astromech': 'amd'
    'Talent': 'ept'
    'Modification': 'mod'

exportObj.fromXWSUpgrade =
    'amd': 'Astromech'
    'astromechdroid': 'Astromech'
    'ept': 'Talent'
    'elitepilottalent': 'Talent'
    'mod': 'Modification'

SPEC_URL = 'https://github.com/elistevens/xws-spec'

class exportObj.XWSManager
    constructor: (args) ->
        @container = $ args.container

        @setupUI()
        @setupHandlers()

    setupUI: ->
        @container.addClass 'hidden-print'
        @container.html $.trim """
            <div class="row-fluid">
                <div class="span9">
                    <button class="btn btn-primary from-xws">Import from XWS (beta)</button>
                    <button class="btn btn-primary to-xws">Export to XWS (beta)</button>
                </div>
            </div>
        """

        @xws_export_modal = $ document.createElement 'DIV'
        @xws_export_modal.addClass 'modal hide fade xws-modal hidden-print'
        @container.append @xws_export_modal
        @xws_export_modal.append $.trim """
            <div class="modal-header">
                <button type="button" class="close hidden-print" data-dismiss="modal" aria-hidden="true">&times;</button>
                <h3>XWS Export (Beta!)</h3>
            </div>
            <div class="modal-body">
                <ul class="nav nav-pills">
                    <li><a id="xws-text-tab" href="#xws-text" data-toggle="tab">Text</a></li>
                    <li><a id="xws-qrcode-tab" href="#xws-qrcode" data-toggle="tab">QR Code</a></li>
                </ul>
                <div class="tab-content">
                    <div class="tab-pane" id="xws-text">
                        Copy and paste this into an XWS-compliant application to transfer your list.
                        <i>(This is in beta, and the <a href="#{SPEC_URL}">spec</a> is still being defined, so it may not work!)</i>
                        <div class="container-fluid">
                            <textarea class="xws-content"></textarea>
                        </div>
                    </div>
                    <div class="tab-pane" id="xws-qrcode">
                        Below is a QR Code of XWS.  <i>This is still very experimental!</i>
                        <div id="xws-qrcode-container"></div>
                    </div>
                </div>
            </div>
            <div class="modal-footer hidden-print">
                <button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>
            </div>
        """

        @xws_import_modal = $ document.createElement 'DIV'
        @xws_import_modal.addClass 'modal hide fade xws-modal hidden-print'
        @container.append @xws_import_modal
        @xws_import_modal.append $.trim """
            <div class="modal-header">
                <button type="button" class="close hidden-print" data-dismiss="modal" aria-hidden="true">&times;</button>
                <h3>XWS Import (Beta!)</h3>
            </div>
            <div class="modal-body">
                Paste XWS here to load a list exported from another application.
                <i>(This is in beta, and the <a href="#{SPEC_URL}">spec</a> is still being defined, so it may not work!)</i>
                <div class="container-fluid">
                    <textarea class="xws-content" placeholder="Paste XWS here..."></textarea>
                </div>
            </div>
            <div class="modal-footer hidden-print">
                <span class="xws-import-status"></span>&nbsp;
                <button class="btn btn-primary import-xws">Import It!</button>
                <button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>
            </div>
        """

    setupHandlers: ->
        @from_xws_button = @container.find('button.from-xws')
        @from_xws_button.click (e) =>
            e.preventDefault()
            @xws_import_modal.modal 'show'

        @to_xws_button = @container.find('button.to-xws')
        @to_xws_button.click (e) =>
            e.preventDefault()
            $(window).trigger 'xwing:pingActiveBuilder', (builder) =>
                textarea = $ @xws_export_modal.find('.xws-content')
                textarea.attr 'readonly'
                textarea.val JSON.stringify(builder.toXWS())
                $('#xws-qrcode-container').text ''
                $('#xws-qrcode-container').qrcode
                    render: 'canvas'
                    text: JSON.stringify(builder.toMinimalXWS())
                    ec: 'L'
                    size: 256
                @xws_export_modal.modal 'show'
                $('#xws-text-tab').tab 'show'
                textarea.select()
                textarea.focus()

        $('#xws-qrcode-container').click (e) ->
            window.open $('#xws-qrcode-container canvas')[0].toDataURL()

        @load_xws_button = $ @xws_import_modal.find('button.import-xws')
        @load_xws_button.click (e) =>
            e.preventDefault()
            import_status = $ @xws_import_modal.find('.xws-import-status')
            import_status.text 'Loading...'
            do (import_status) =>
                try
                    xws = JSON.parse @xws_import_modal.find('.xws-content').val()
                catch e
                    import_status.text 'Invalid JSON'
                    return

                do (xws) =>
                    $(window).trigger 'xwing:activateBuilder', [exportObj.fromXWSFaction[xws.faction], (builder) =>
                        if builder.current_squad.dirty and builder.backend?
                            @xws_import_modal.modal 'hide'
                            builder.backend.warnUnsaved builder, =>
                                builder.loadFromXWS xws, (res) =>
                                    unless res.success
                                        @xws_import_modal.modal 'show'
                                        import_status.text res.error
                        else
                            builder.loadFromXWS xws, (res) =>
                                if res.success
                                    @xws_import_modal.modal 'hide'
                                else
                                    import_status.text res.error
                    ]
