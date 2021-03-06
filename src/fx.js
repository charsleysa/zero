//     Zero.js
//     (c) 2013 Stefan Andres Charsley
//     Zero.js may be freely distributed under the MIT license.

;(function($, undefined){
    var prefix = '', eventPrefix,
        vendors = { Webkit: 'webkit', Moz: '', O: 'o', MS: '' },
        nonCssAnimations = { scrollTop: true, scrollLeft: true },
        document = window.document, testEl = document.createElement('div'),
        supportedTransforms = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i,
        transform,
        transitionProperty, transitionDuration, transitionTiming, transitionDelay,
        animationName, animationDuration, animationTiming, animationDelay,
        cssReset = {},
        easingFunction = function(percentage) {
            // acceleration until halfway, then deceleration
            return percentage < 0.5 ? 4 * percentage * percentage * percentage :
                (percentage - 1) * (2 * percentage - 2) * (2 * percentage - 2) + 1
        }

    function dasherize(str) { return str.replace(/([a-z])([A-Z])/, '$1-$2').toLowerCase() }
    function normalizeEvent(name) { return eventPrefix ? eventPrefix + name : name.toLowerCase() }

    $.each(vendors, function(vendor, vendorPrefix){
        if (testEl.style[vendorPrefix + 'TransitionProperty'] !== undefined) {
            prefix = '-' + vendorPrefix.toLowerCase() + '-'
            eventPrefix = vendorPrefix
            return false
        }
    })

    transform = prefix + 'transform'
    cssReset[transitionProperty = prefix + 'transition-property'] =
    cssReset[transitionDuration = prefix + 'transition-duration'] =
    cssReset[transitionDelay    = prefix + 'transition-delay'] =
    cssReset[transitionTiming   = prefix + 'transition-timing-function'] =
    cssReset[animationName      = prefix + 'animation-name'] =
    cssReset[animationDuration  = prefix + 'animation-duration'] =
    cssReset[animationDelay     = prefix + 'animation-delay'] =
    cssReset[animationTiming    = prefix + 'animation-timing-function'] = ''

    $.fx = {
        off: (eventPrefix === undefined && testEl.style.transitionProperty === undefined),
        speeds: { _default: 400, fast: 200, slow: 600 },
        cssPrefix: prefix,
        transitionEnd: normalizeEvent('TransitionEnd'),
        animationEnd: normalizeEvent('AnimationEnd')
    }

    $.fn.animate = function(properties, duration, ease, callback, delay){
        if ($.isFunction(duration))
            callback = duration, ease = undefined, duration = undefined
        if ($.isFunction(ease))
            callback = ease, ease = undefined
        if ($.isPlainObject(duration))
            ease = duration.easing, callback = duration.complete, delay = duration.delay, duration = duration.duration
        if (duration)
            duration = (typeof duration == 'number' ? duration : 
                ($.fx.speeds[duration] || $.fx.speeds._default)) / 1000
        if (delay) delay = parseFloat(delay) / 1000
        return this.anim(properties, duration, ease, callback, delay)
    }

    $.fn.anim = function(properties, duration, ease, callback, delay){
        var key, cssValues = {}, cssProperties, transforms = '', nonCssAnimate = {},
            that = this, wrappedCallback, endEvent = $.fx.transitionEnd, fired = false

        if (duration === undefined) duration = 0.4
        if (delay === undefined) delay = $.fx.speeds._default / 1000
        if ($.fx.off) duration = 0

        if (typeof properties == 'string') {
            // keyframe animation
            cssValues[animationName] = properties
            cssValues[animationDuration] = duration + 's'
            cssValues[animationDelay] = delay + 's'
            cssValues[animationTiming] = (ease || 'linear')
            endEvent = $.fx.animationEnd
        } else {
            cssProperties = []
            // CSS transitions
            for (key in properties) {
                if (nonCssAnimations[key] && $.isNumber(properties[key])) nonCssAnimate[key] = properties[key]
                if (supportedTransforms.test(key)) transforms += key + '(' + properties[key] + ') '
                else cssValues[key] = properties[key], cssProperties.push(dasherize(key))
            }

            if (transforms) cssValues[transform] = transforms, cssProperties.push(transform)
            if (duration > 0 && typeof properties === 'object') {
                cssValues[transitionProperty] = cssProperties.join(', ')
                cssValues[transitionDuration] = duration + 's'
                cssValues[transitionDelay] = delay + 's'
                cssValues[transitionTiming] = (ease || 'linear')
            }
        }

        for (key in nonCssAnimate) {
            this.each(function(){
                var node = $(this), timeLapsed = 0, startLocation = node[key](), endLocation = nonCssAnimate[key],
                    distance = endLocation - startLocation, position, percentage, durationInMilliseconds = duration * 1000,
                    intervalFunction = function () {
                        timeLapsed += 16
                        percentage = timeLapsed / (durationInMilliseconds || 1)
                        percentage = (percentage > 1) ? 1 : percentage
                        position = startLocation + (distance * easingFunction(percentage))
                        node[key](position)
                        if (position == endLocation) clearInterval(intervalId)
                    }
                var intervalId = setInterval(intervalFunction, 16)
            })
        }

        wrappedCallback = function(event){
            if (typeof event !== 'undefined') {
                if (event.target !== event.currentTarget) return // makes sure the event didn't bubble from "below"
                $(event.target).off(endEvent, wrappedCallback)
            } 
            else $(this).off(endEvent, wrappedCallback)//triggered by setTimeout

            fired = true
            $(this).css(cssReset)
            callback && callback.call(this)
        }
        if (duration > 0){
            this.on(endEvent, wrappedCallback)
            // transitionEnd is not always firing on older Android phones
            // so make sure it gets fired
            setTimeout(function(){
                if (fired) return
                wrappedCallback.call(that)
            }, (duration * 1000) + 500)
        }

        // trigger page reflow so new elements can animate
        this.size() && this.get(0).clientLeft

        this.css(cssValues)

        if (duration <= 0) setTimeout(function() {
            wrappedCallback.call(that)
        }, 0)

        return this
    }

    testEl = null
})(Zero)
