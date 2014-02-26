//     Zero.js
//     (c) 2013 Stefan Andres Charsley
//     Zero.js may be freely distributed under the MIT license.

;(function ($) {
    var document = window.document,
        key,
        name,
        rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        //scriptTypeRE = /^(?:text|application)\/javascript/i,
        //xmlTypeRE = /^(?:text|application)\/xml/i,
        //jsonType = 'application/json',
        //htmlType = 'text/html',
        blankRE = /^\s*$/

    // Number of active Ajax requests
    $.active = 0

    // Empty function, used as default callback
    function empty() {}

    $.ajaxSettings = {
        // Default type of request
        type: 'GET',
        // Default response type
        responseType: 'text',
        // Callback that is executed before request
        beforeSend: empty,
        // Callback that is executed if the request succeeds
        done: empty,
        // Callback that is executed the request fails
        fail: empty,
        // Callback that is executed on request complete (both: error and success)
        always: empty,
        // The context for the callbacks
        context: null,
        // Whether to trigger "global" Ajax events
        global: true,
        // Transport (XHR2)
        xhr: function () {
            return new window.XMLHttpRequest()
        },
        // Request headers
        headers: {},
        // Default timeout
        timeout: 0,
        // Whether data should be serialized to string
        processData: true,
        // Whether the browser should be allowed to cache GET responses
        cache: true,
        // Whether credential data should be sent with cross-domain requests
        withCredentials: false,
        // The username for same origin requests
        username: null,
        // The password for same origin requests
        password: null
    }

    function appendQuery(url, query) {
        return (url + '&' + query).replace(/[&?]{1,2}/, '?')
    }

    // serialize payload and append it to the URL for GET requests
    // do not serialize if we have an acceptable object type
    function serializeData(options) {
        if (options.data instanceof File ||
            options.data instanceof Blob ||
            options.data instanceof Document ||
            options.data instanceof FormData ||
            options.data instanceof ArrayBuffer)
            return
        if (options.processData && options.data && $.type(options.data) != "string"){
            options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/x-www-form-urlencoded'
            options.data = $.param(options.data, options.traditional)
        }
        if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
            options.url = appendQuery(options.url, options.data)
    }

    $.ajax = function (options) {
        var settings = $.extend({}, options || {})
        for (key in $.ajaxSettings) if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]

        if (!settings.url) settings.url = window.location.toString()
        serializeData(settings)
        if (settings.cache === false) settings.url = appendQuery(settings.url, '_=' + Date.now())

        var baseHeaders = {},
            protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
            xhr = settings.xhr()

        baseHeaders['X-Requested-With'] = 'XMLHttpRequest'

        settings.headers = $.extend(baseHeaders, settings.headers || {})

        // Create a Zero object from the xhr object
        var zeroXHR = $(xhr)

        //HACK: this is a temporary fix for lack of support for the json responseType
        zeroXHR.on('load', function(){
            if (settings.responseType == 'json' && !$.isPlainObject(this.response)){
                this.response2 = -1
                try {
                    this.response2 = blankRE.test(this.response) ? null : JSON.parse(this.response)
                } catch (ex){
                    this.response2 = null
                }
            }
            else
            {
                this.response2 = this.response
            }
        })
        if (settings.responseType == 'json') settings.headers['Accept'] = 'application/json'

        // Add function for upload progress hooking
        zeroXHR.uploadProgress = function(func){
            if (typeof func !== 'function') throw TypeError('Expected func to be of type function.')
            var callback = func
            var context = settings.context
            $(xhr.upload).on('progress', function(e){
                callback.call(context, e, xhr)
            })

            // Return the Zero object for chaining
            return this
        }

        // Add function for done hooking
        zeroXHR.done = function(func){
            if (typeof func !== 'function') throw TypeError('Expected func to be of type function.')
            var callback = func
            var context = settings.context
            $(xhr).on('load', function(e){
                if ( !((this.status >= 200 && this.status < 300) || this.status == 304 || (this.status == 0 && protocol == 'file:')) ) {
                    $(this).trigger($.Event('error', e))
                    e.stopImmediatePropagation()
                } else if (this.response == null) {
                    $(this).trigger($.Event('error', e))
                    e.stopImmediatePropagation()
                } else {
                    callback.call(context, this.response2, this.statusText, this);
                }
            })

            // Return the Zero object for chaining
            return this
        }

        // Add function for fail hooking
        zeroXHR.fail = function(func){
            if (typeof func !== 'function') throw TypeError('Expected func to be of type function.')
            var callback = func
            var context = settings.context
            $(xhr).on('error timeout abort', function(e){
                callback.call(context, e.type, this, settings)
            })

            // Return the Zero object for chaining
            return this
        }

        // Add function for always hooking
        zeroXHR.always = function(func){
            if (typeof func !== 'function') throw TypeError('Expected func to be of type function.')
            var callback = func
            var context = settings.context
            $(xhr).on('loadend', function(){
                callback.call(context, this, settings)
            })

            // Return the zero object for chaining
            return this
        }

        // Hook active request count
        zeroXHR.on('loadstart', function(){
            $.active++
        })
        zeroXHR.on('loadend', function(){
            $.active--
        })

        // Hook beforeSend
        zeroXHR.on('beforesend', function(){
            return settings.beforeSend.call(settings.context, xhr, settings)
        })

        // Now hook in done, fail and always functions
        zeroXHR.done(settings.done)
        zeroXHR.fail(settings.fail)
        zeroXHR.always(settings.always)
        
        // If settings.global is set to true then hook in global ajax events
        if (settings.global){
            zeroXHR.on('beforesend', function(){
                var event = $.Event('ajaxBeforeSend')
                $(settings.context || document).trigger(event, [this, settings])
                return !event.isDefaultPrevented()
            })

            zeroXHR.on('loadstart', function(){
                $(settings.context || document).trigger($.Event('ajaxStart'), [this, settings])
            })

            zeroXHR.on('load', function(e){
                if ( !((this.status >= 200 && this.status < 300) || this.status == 304 || (this.status == 0 && protocol == 'file:')) ) {
                    $(this).trigger($.Event('error', e))
                    e.stopImmediatePropagation()
                } else if (this.response == null) {
                    $(this).trigger($.Event('error', e))
                    e.stopImmediatePropagation()
                } else {
                    $(settings.context || document).trigger($.Event('ajaxSuccess'), [this, settings, this.response2])
                }
            })

            zeroXHR.on('error timeout abort', function(e){
                $(settings.context || document).trigger($.Event('ajaxError'), [this, settings, e.type])
            })

            zeroXHR.on('loadend', function(){
                $(settings.context || document).trigger($.Event('ajaxStop'), [this, settings])
            })
        }

        xhr.open(settings.type, settings.url, true, settings.username, settings.password)

        // Set xhr fields
        xhr.withCredentials = settings.withCredentials
        xhr.responseType = settings.responseType
        xhr.timeout = settings.timeout

        // Add headers
        for (name in settings.headers) xhr.setRequestHeader(name, settings.headers[name])

        // Trigger beforeSend and check to make sure the request wasn't canceled
        var beforeSendEvent = $.Event('beforesend')
        zeroXHR.trigger(beforeSendEvent)
        if (beforeSendEvent.isDefaultPrevented() === true) {
            xhr.abort()
            return false
        }

        // avoid sending empty string
        xhr.send(settings.data || null)
        return zeroXHR
    }

    // handle optional data/done arguments
    function parseArguments(url, data, done, responseType) {
        if ($.isFunction(data)) responseType = done, done = data, data = undefined
        if (!$.isFunction(done)) responseType = done, done = undefined
        return {
            url: url,
            data: data,
            done: done,
            responseType: responseType
        }
    }

    $.get = function (/*url, data, done, responseType*/) {
        return $.ajax(parseArguments.apply(null, arguments))
    }

    $.post = function (/*url, data, done, responseType*/) {
        var options = parseArguments.apply(null, arguments)
        options.type = 'POST'
        return $.ajax(options)
    }

    $.getJSON = function (/*url, data, done*/) {
        var options = parseArguments.apply(null, arguments)
        // Currently only supported by Firefox and Chrome dev
        options.responseType = 'json'
        return $.ajax(options)
    }

    $.fn.load = function (url, data, done) {
        if (!this.length) return this
        var self = this,
            parts = url.split(/\s/),
            selector,
            options = parseArguments(url, data, done),
            callback = options.done
        if (parts.length > 1) options.url = parts[0], selector = parts[1]
        options.done = function (response) {
            self.html('')
            self.append(selector ?
                $('<div>').html(response.replace(rscript, "")).find(selector) : response)
            callback && callback.apply(self, arguments)
        }
        $.ajax(options)
        return this
    }

    var escape = encodeURIComponent

    function serialize(params, obj, traditional, scope) {
        var type, array = $.isArray(obj), arrayIndex = 0
        $.each(obj, function (key, value) {
            type = $.type(value)
            if (scope) key = traditional ? scope : scope + '[' + (array ? type == 'object' ? arrayIndex : '' : key) + ']'
            arrayIndex++
            // handle data in serializeArray() format
            if (!scope && array) params.add(value.name, value.value)
            // recurse into nested objects
            else if (type == "array" || (!traditional && type == "object"))
                serialize(params, value, traditional, key)
            else params.add(key, value)
        })
    }

    $.param = function (obj, traditional) {
        var params = []
        params.add = function (k, v) {
            this.push(escape(k) + '=' + escape(v))
        }
        serialize(params, obj, traditional)
        return params.join('&').replace(/%20/g, '+')
    }

    ;['BeforeSend', 'Start', 'Success', 'Error', 'Stop'].forEach(function(event){
        var eventName = 'ajax' + event
        $.fn[eventName] = function(callback){ return this.on(eventName, callback) }
    })
})(Zero)